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
        subject: 'Added to KAVI',
        text: `Hello ${name},\n\nWelcome to KAVI platform! We are glad to have you on board.\n\nBest regards,\nKAVI Team`,
        html: `<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome Email</title>
  <style>
    body {
      font-family: 'Lato', Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
    }

    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      padding: 0px;
      border: 1px solid #e0e0e0;
    }

    .logo {
      max-width: 600px;
    }

    .content {
      padding: 30px;
      color: #333333;
      text-align: justify;
    }

    .content p {
      font-size: 16px;
      line-height: 1.5;
      margin: 10px 0;
    }

    .footer {
      display: flex;
      justify-content: space-between;
      font-size: 14px;
      color: #888888;
      padding: 20px;
    }

    .footer .footer-text {
      flex: 1;
      margin-right: 10px;
    }

    .footer .footer-logo {
      width: 50px;
      /* Adjust the size as needed */
    }

    .footer a {
      color: #1E2A78;
      text-decoration: none;
    }
  </style>
</head>

<body>
  <div class="container">
    <div class="logo">
      <img src="http://cdn.mcauto-images-production.sendgrid.net/fb8ab3bf269eb3b8/2c86e82c-93a7-433c-b01e-af6f78f07ec5/790x348.png" width="600px" />
    </div>
    <div class="content">
      <p>Dear ${name},</p>
      <p>Welcome to KAVI's Content Library! We're thrilled to have you on board.</p>
      <p>Our platform offers interviews with experts across different companies and industries to help you make informed investment decisions. As you explore, you'll find valuable insights across various sectors, all curated to give you a competitive edge.</p>
      <p>Click here to head to our platform:</p>
      <a href="https://3dbfa084-3e4a-429b-bdab-3df3b23a9315.weweb-preview.io/" target="_blank" style="display: inline-block; padding: 8px 16px; color: #ffffff; background-color: #313D74; border-radius: 6px; text-decoration: none;">Sign in</a>
      <p>We're here to support your journey. If you have any questions or need assistance, you can connect with our support team at <a href="mailto:tech@kaviresearch.in">tech@kaviresearch.in</a>.</p>
      <p>Warm regards,<br>Kavi Team</p>
    </div>
  </div>
</body>

</html>`,
      });
    } catch (error) {
      strapi.log.error('Error sending welcome email:', error);
    }
  };
  

  //Admin mail
const sendAdminEmail = async (userEmail) => {
  try {
    await strapi.plugins['email'].services.email.send({
      to: userEmail,
      from: 'nishant@joinkavi.com', // Replace with your verified sender email
      subject: 'You are now Admin [KAVI]',
      text: `Upgraded to Admin at KAVI Platform`,
      html: `

      <html lang="en">

  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome Email</title>
    <style>
      body {
        font-family: 'Lato', Helvetica, Arial, sans-serif;
        margin: 0;
        padding: 0;
        background-color: #f5f5f5;
      }

      .container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
        padding: 20px;
        border: 1px solid #e0e0e0;
      }

      .logo {
        max-width: 600px;
        text-align: center;
      }

      .content {
        padding: 30px;
        color: #333333;
        text-align: justify;
      }

      .content p {
        font-size: 15px;
        line-height: 1.5;
        margin: 10px 0;
      }

      .button {
        padding: 8px 16px;
        color: #ffffff;
        background-color: #313D74;
        border: 0px;
        border-radius: 6px;
        font-size: 15px;
        font-family: 'Lato', Helvetica, Arial, sans-serif;
        text-align: center;
        text-decoration: none;
        display: inline-block;
      }

      .footer {
        font-size: 15px;
        text-align: center;
      }
    </style>
  </head>

  <body>
    <div class="container">
      <div class="logo">
        <img src="https://dazzling-butterfly-f3a6f1abbb.media.strapiapp.com/admin_user_icon_da30a9ed96.png" width="100px"/>
      </div>
      <div class="content">
        <p>You have now been made Admin for your organization’s KAVI Library account. Please login in again to claim Admin Status.</p>
        <div style="text-align: center" class="button-items">
          <a href="https://3dbfa084-3e4a-429b-bdab-3df3b23a9315.weweb-preview.io/" target="_blank" style="padding: 8px 16px; color: #ffffff; background-color: #313D74; border: 0px; border-radius: 6px; text-align: center; text-decoration: none; display: inline-block;">Log in</a>
        </div>
        <p>As Admin, you can now add or remove users from your organization’s KAVI account and set someone else as Admin. If this requested was not warranted by your organizations please contact us at <a href="mailto:tech@kaviresearch.in" class="support">tech@kaviresearch.in</a> or call us at <a href="tel:+919606008727" class="support">+91 9606008727</a>.</p>
      </div>
    </div>
  </body>

  </html>`
    });
    } catch (error) {
    strapi.log.error('Error sending welcome email:', error);
  }
};




module.exports = (plugin) => {
    const create = plugin.controllers.user.create;

    const normalizedLinkedInUrl = (url) =>{
      return url.replace(/^https?:\/\//, "");
    }
  
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
         
             // Check if the requesting user's "slotFilled" field has a value >= 1
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
  
      // await validateCreateUserBody(ctx.request.body);
   
      const { email, username, first_name, last_name, dob, linkedinurl} = ctx.request.body;

      if (email==undefined) throw new ApplicationError('Please enter email');
      if (username==undefined) throw new ApplicationError('Please enter username');
      if (first_name==undefined) throw new ApplicationError('Please enter First Name');
      if (last_name==undefined) throw new ApplicationError('Please enter :Last Name');
      if (dob==undefined) throw new ApplicationError('Please enter DOB');
      if (linkedinurl==undefined) throw new ApplicationError('Please enter Linkedid');
      
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


      //check if linkedid is already present

      const normalizedurl = normalizedLinkedInUrl(linkedinurl);
      const userWithSameLinkedin = await strapi
        .query('plugin::users-permissions.user')
        .findOne({ where: { linkedinurl:normalizedurl } });
  
      if (userWithSameLinkedin) {
          throw new ApplicationError('A user with this LinkedIn ID already exists');
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
        first_name: first_name,
        last_name:last_name,
        dob:dob,
        linkedinurl:normalizedurl,
        password:email.toLowerCase(),
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

    //update to admin role

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
        await sendAdminEmail(userToPromote.email);
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
            throw new ApplicationError('You are not authorized to fetch the members of organization', 403);
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