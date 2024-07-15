// @ts-nocheck
'use strict';

/**
 * User.js controller
 *
 * @description: A set of functions called "actions" for managing `User`.
 */

const _ = require('lodash');
const utils = require('@strapi/utils');
const { getService } = require('../../../node_modules/@strapi/plugin-users-permissions/server/utils');
const { validateCreateUserBody, validateUpdateUserBody } = require('../../../node_modules/@strapi/plugin-users-permissions/server/controllers/validation/user');

const { sanitize, validate } = utils;
const { ApplicationError, ValidationError, NotFoundError } = utils.errors;

const sanitizeOutput = async (user, ctx) => {
  const schema = strapi.getModel('plugin::users-permissions.user');
  const { auth } = ctx.state;

  return sanitize.contentAPI.output(user, schema, { auth });
};

const validateQuery = async (query, ctx) => {
  const schema = strapi.getModel('plugin::users-permissions.user');
  const { auth } = ctx.state;

  return validate.contentAPI.query(query, schema, { auth });
};

const sanitizeQuery = async (query, ctx) => {
  const schema = strapi.getModel('plugin::users-permissions.user');
  const { auth } = ctx.state;

  return sanitize.contentAPI.query(query, schema, { auth });
};

//Welcome mail
const sendWelcomeEmail = async (userEmail, name) => {
    try {
      await strapi.plugins['email'].services.email.send({
        to: userEmail,
        from: 'nishant@joinkavi.com', // Replace with your verified sender email
        subject: 'Welcome to Our KAVI Platform!',
        text: `Hello ${name},\n\nWelcome to our service! We are glad to have you on board.\n\nBest regards,\nThe Team`,
        html: `<p>Hello ${name},</p><p>Welcome to our Platform! We are glad to have you on board.</p><p>Best regards,<br/>The Team</p>`,
      });
    } catch (error) {
      strapi.log.error('Error sending welcome email:', error);
    }
  };
  


module.exports = (plugin) => {
    const create = plugin.controllers.user.create;
  
    plugin.controllers.user.create = async (ctx) => {

        const advanced = await strapi
        .store({ type: 'plugin', name: 'users-permissions', key: 'advanced' })
        .get();
  
             // Ensure the requesting user is authenticated and has the 'admin' role
             const requestingUser = ctx.state.user;
  
             // Log the requesting user for debugging
             //console.log('Requesting user:', requestingUser);
         
             if (!requestingUser || requestingUser.role.name.toLowerCase() !== 'admin') {
               throw new ApplicationError('You are not authorized to perform this action', 403);
             }
         
             // Log the members field for debugging
            //  console.log('Requesting user members:', requestingUser.members);
         
             // Check if the requesting user's "members" field has a value >= 1
             if (requestingUser.slotFilled == requestingUser.slots) {
               throw new ApplicationError('All seats occupied. Extend your plan to add members', 403);
             }
  
      // Assign default role if not provided
    if (!ctx.request.body.role) {
      const defaultRole = await strapi
        .query('plugin::users-permissions.role')
        .findOne({ where: { type: advanced.default_role } });
  
      if (!defaultRole) {
        throw new ApplicationError('Default role not found');
      }
  
      ctx.request.body.role = defaultRole.id; // Set the default role ID in the request body
  
    }
  
      await validateCreateUserBody(ctx.request.body);
   
      const { email, username, name} = ctx.request.body;

      const adminEmail = requestingUser.email;
      const adminDomain = adminEmail.split('@')[1];
      const newUserDomain = email.split('@')[1];

      if(adminDomain !== newUserDomain){
        return ctx.badRequest('New member must have the same email domain as the admin. If you still want to add user then contact KAVI team');
      }
  
      
      const userWithSameUsername = await strapi
        .query('plugin::users-permissions.user')
        .findOne({ where: { username } });
  
      if (userWithSameUsername) {
        if (!email) throw new ApplicationError('Username already taken');
      }
  
      if (advanced.unique_email) {
        const userWithSameEmail = await strapi
          .query('plugin::users-permissions.user')
          .findOne({ where: { email: email.toLowerCase() } });
  
        if (userWithSameEmail) {
          throw new ApplicationError('Email already taken');
        }
      }
  
      const user = {
        ...ctx.request.body,
        email: email.toLowerCase(),
        name: name,
        provider: 'local',
        slots:requestingUser.slots,
        orgID:requestingUser.orgID,
        expiry:requestingUser.expiry,
      };
  
      // if (!role) {
      //   const defaultRole = await strapi
      //     .query('plugin::users-permissions.role')
      //     .findOne({ where: { type: advanced.default_role } });
  
      //   user.role = defaultRole.id; 
      // }
   
  
      try {
        const data = await getService('user').add(user);
        const sanitizedData = await sanitizeOutput(data, ctx);
  
        // Decrement the requesting user's members field
      requestingUser.slotFilled += 1;
  
      await strapi.query('plugin::users-permissions.user').update({
        where: { id: requestingUser.id },
        data: { slotFilled: requestingUser.slotFilled },
      });
      //sending welcome mail
      await sendWelcomeEmail(user.email,user.name);
      console.log("mail sent");
      ctx.created(sanitizedData);

  
      } catch (error) {
        throw new ApplicationError(error.message);
      }
    };

    //update 

    const update = plugin.controllers.user.update;

    plugin.controllers.user.update = async(ctx) =>{

    const advancedConfigs = await strapi
    .store({ type: 'plugin', name: 'users-permissions', key: 'advanced' })
    .get();

    const requestingUser = ctx.state.user;
    const { id } = ctx.params;

    // Ensure the requesting user is authenticated and has admin privileges
    if (!requestingUser || requestingUser.role.name.toLowerCase() !== 'admin') {
        throw new ApplicationError('You are not authorized to perform this action', 403);
    }

    // Fetch the user to be promoted
    const userToPromote = await strapi.query('plugin::users-permissions.user').findOne({ where: { id: id } });

    // Check if the user to be promoted exists
    if (!userToPromote) {
        throw new ApplicationError('User not found', 404);
    }

    // Check if the user to be promoted has the same clientNo as the requesting user
    if (userToPromote.orgID !== requestingUser.orgID) {
        throw new ApplicationError('You are not authorized to promote this user', 403);
    }

    // Fetch the admin role
    const adminRole = await strapi.query('plugin::users-permissions.role').findOne({ where: { type: 'admin' } });

    // Fetch the member role
    const memberRole = await strapi.query('plugin::users-permissions.role').findOne({ where: { type: 'authenticated' } });

    // Update roles
    try {
        // Set the user to be promoted as admin
        await strapi.query('plugin::users-permissions.user').update({
        where: { id: userToPromote.id },
        data: { role: adminRole.id, slotFilled:requestingUser.slotFilled },
        });

        // Set the requesting user as member
        await strapi.query('plugin::users-permissions.user').update({
        where: { id: requestingUser.id },
        data: { role: memberRole.id },
        });

        // Decrement the requesting user's members field by 1
        requestingUser.slotFilled = 0;
        await strapi.query('plugin::users-permissions.user').update({
        where: { id: requestingUser.id },
        data: { slotFilled: requestingUser.slotFilled },
        });

        ctx.send('User promoted to admin successfully');
        } catch (error) {
        throw new ApplicationError('Failed to promote user to admin');
        }
        
    }


    //destroy
    const destroy = plugin.controllers.user.destroy;

    plugin.controllers.user.destroy = async(ctx) =>{
        const { id } = ctx.params;

    const requestingUser = ctx.state.user;

    if(requestingUser.id == id)
      {
        throw new ApplicationError('Cannot delete yourself, make other admin first');
      }

  // Ensure the requesting user is authenticated
  if (!requestingUser) {
    throw new ApplicationError('Authentication required', 401);
  }

  if(requestingUser.role.name.toLowerCase() !== 'admin')
    {
      throw new ApplicationError("Only admin can delete a member");
    }

  // Fetch the user to be deleted
  const userToDelete = await strapi.query('plugin::users-permissions.user').findOne({ where: { id } });

  // Check if the user exists
  if (!userToDelete) {
    throw new ApplicationError('User not found', 404);
  }

  // Check if the requesting user has the same clientNo as the user to be deleted
  if (requestingUser.orgID !== userToDelete.orgID) {
    throw new ApplicationError('You are not authorized to delete this user', 403);
  }

    
    const data = await getService('user').remove({ id });
    const sanitizedUser = await sanitizeOutput(data, ctx);

      // decrement the requesting user's slotFilled field by 1
    requestingUser.slotFilled -= 1;
    await strapi.query('plugin::users-permissions.user').update({
        where: { id: requestingUser.id },
        data: { slotFilled: requestingUser.slotFilled },
    });


  
    ctx.send(sanitizedUser);
        
    }


    //find only your members
    //destroy
    const find = plugin.controllers.user.find;
    /**
   * Retrieve user records.
   * @return {Object|Array}
   */
    plugin.controllers.user.find = async(ctx) =>{

        await validateQuery(ctx.query, ctx);
        const sanitizedQuery = await sanitizeQuery(ctx.query, ctx);
        const requestingUser = ctx.state.user;

        //only admins can fetch all users
        if (!requestingUser || requestingUser.role.name.toLowerCase() !== 'admin') {
            throw new ApplicationError('You are not authorized to perform this action', 403);
          }

        const users = await getService('user').fetchAll(sanitizedQuery);
        const filteredUsers = users.filter(user => user.orgID === requestingUser.orgID);
        ctx.body = await Promise.all(filteredUsers.map((user) => sanitizeOutput(user, ctx)));

    }

    //find only yourself
    const findOne = plugin.controllers.user.findOne;

     /**
   * Retrieve user records.
   * @return {Object|Array}
   */

     plugin.controllers.user.findOne = async(ctx) =>{

        const { id } = ctx.params;
        const requestingUser = ctx.state.user;
        await validateQuery(ctx.query, ctx);
        const sanitizedQuery = await sanitizeQuery(ctx.query, ctx);

        if (!requestingUser || requestingUser.role.name.toLowerCase() !== 'admin') {
            throw new ApplicationError('You are not authorized to perform this action', 403);
        }
        
            let data = await getService('user').fetch(requestingUser.id, sanitizedQuery);

            if (data) {
            data = await sanitizeOutput(data, ctx);
            }

            ctx.body = data;
       

     }

     //find only yourself
    const me = plugin.controllers.user.me;

    /**
   * Retrieve user records.
   * @return {Object|Array}
   */

    plugin.controllers.user.me = async(ctx) =>{
      const authUser = ctx.state.user;
      const { query } = ctx;
  
      if (!authUser) {
        return ctx.unauthorized();
      }
  
      await validateQuery(query, ctx);
      const sanitizedQuery = await sanitizeQuery(query, ctx);
      const user = await getService('user').fetch(authUser.id,{
        ...sanitizedQuery,
        populate:{role:true}
      });
  
      ctx.body = await sanitizeOutput(user, ctx);
    }



    return plugin;
  };