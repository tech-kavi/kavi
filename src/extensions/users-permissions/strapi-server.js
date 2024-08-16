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

const crypto = require('crypto');

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
const sendWelcomeEmail = async (userEmail, name, password) => {
    try {
      await strapi.plugins['email'].services.email.send({
        to: userEmail,
        from: process.env.DEFAULT_FROM, // Replace with your verified sender email
        subject: '[KAVI] Welcome to KAVI',
        text: `Hello ${name},\n\nWelcome to KAVI platform! We are glad to have you on board.\n\nBest regards,\nKAVI Team`,
        html: `<!DOCTYPE html>
<html lang="en">
 
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Welcome Email</title>
<style>
        body {
            font-family: 'Avenir', sans-serif;
            margin: 0;
            padding: 0;
            background-color: #F4F4F4;
        }
        
        .top{
            height:10px;
            background-color:#273789;
        }
 
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #FFFFFF;
            border-radius: 5px;
            box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
            padding: 0px;
        }
 
        .header {
            padding: 0px 20px;
            border-top-left-radius: 5px;
            border-top-right-radius: 5px;
        }
 
        .header h1 {
            color: #000;
            font-size: 36px;
            margin-top: 20px;
        }
 
        .content {
            padding: 0px 20px;
            text-align: center;
        }
 
        .content p {
            font-size: 16px;
            color: #000;
            line-height: 1.5;
            text-align: justify;
        }
 
        .content a.button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #273789;
            color: #FFFFFF !important;
            text-decoration: none;
            border-radius: 5px;
            font-size: 16px;
        }
 
        .account-info {
            margin-top: 20px;
            padding: 10px 0px;
            border-top: 1px solid #E0E0E0;
            border-bottom: 1px solid #E0E0E0;
        }
 
        .account-info p {
            font-size: 16px;
            color: #333333;
            margin: 5px 0;
        }
 
        .footer {
            margin-top: 0px;
            padding: 0px 20px;
            font-size: 16px;
            color: #000;
        }
        
        .last {
            margin-top: 50px;
            background-color: #eaebf4;
            padding: 20px;
            text-align: center;
            font-size: 14px;
            color: #666666;
        }
 
        .footer a {
            color: #3650A2;
            text-decoration: none;
        }
</style>
</head>
 
<body>

<div class="container">
    <div class="top"></div>
    <div class="header">
        <h1>Welcome to KAVI!</h1>
    </div>
    <div class="content">
        <p>Dear ${name},</p>
        <p>Welcome to the Kavi Library! We're thrilled to have you on board.</p>
        <p>You’re now a step closer to exclusive interviews with industry experts across different companies and industries that will help you make informed investment decisions. Login now to access valuable insights curated to give you a competitive edge.</p>
        <a href="${process.env.FRONTED_URL}" class="button">Login Now</a>
        <div class="account-info">
            <p><strong>Here’s your account information:</strong></p>
            <p>Email: <span style="font-weight: normal; color: #000;">${userEmail}</span></p>
            <p>Password: <span style="font-weight: normal; color: #000;">${password}</span></p>
        </div>
    </div>
    <div class="footer">
        <p>Thank you for choosing KAVI. We look forward to helping you achieve your investment goals.</p>
        <p>Warm regards,<br>KAVI Team</p>
    </div>
    <div class="last">
        <p>If you have any questions or need assistance, please reach out to us at <a href="mailto:tech@kaviresearch.com">tech@kaviresearch.com</a></p>
    </div>
    <div class="top" style="margin-top:50px;"></div>
</div>

</body>
 
</html>
`,
      });
    } catch (error) {
      strapi.log.error('Error sending welcome email:', error);
    }
  };
  

  //Admin mail
const sendAdminEmail = async (userEmail,name,slots,expiry) => {
  try {
    await strapi.plugins['email'].services.email.send({
      to: userEmail,
      from: `KAVI <${process.env.DEFAULT_FROM}>`, // Replace with your verified sender email
      subject: '[KAVI] Upgraded to Admin',
      text: `Upgraded to Admin at KAVI Platform`,
      html: `

      <!DOCTYPE html>
<html lang="en">
 
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Welcome Email</title>
<style>
        body {
            font-family: 'Avenir', sans-serif;
            margin: 0;
            padding: 0;
            background-color: #F4F4F4;
        }
        
        .top{
        height:10px;
        background-color:#273789;
        }
 
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #FFFFFF;
            border-radius: 5px;
            box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
            padding: 0px;
        }
 
        .header {
            padding: 0px 20px;
            border-top-left-radius: 5px;
            border-top-right-radius: 5px;
        }
 
        .header h1 {
            color: #000;
            font-size: 24px;
            margin-top: 20px;
        }
 
        .content {
            padding: 20px;
            text-align: center;
        }
 
        .content p {
            font-size: 16px;
            color: #333333;
            line-height: 1.5;
            text-align: justify;
        }
 
        .content a {
            display: inline-block;
            padding: 10px 20px;
            
            background-color: #273789;
            color: #FFFFFF;
            text-decoration: none;
            border-radius: 5px;
            font-size: 16px;
        }
 
        .account-info {
            margin-top: 20px;
            padding: 10px 0px;
            border-top: 1px solid #E0E0E0;
            border-bottom: 1px solid #E0E0E0;
        }
 
        .account-info p {
            font-size: 16px;
            color: #333333;
            margin: 5px 0;
        }
 
        .footer {
            margin-top: 0px;
            padding: 0px 20px;
            
            font-size: 14px;
            color: #666666;
        }
        
        .last{
        margin-top:50px;
            background-color:#eaebf4;
            padding:20px;
            text-align:center;
            font-size: 14px;
            color: #666666;
        }
 
        .footer a {
            color: #3650A2;
            text-decoration: none;
        }
</style>
</head>
 
<body>

<div class="container">
<div class="top"></div>
<div class="header">
<h1>Welcome to KAVI!</h1>
</div>
<div class="content">
<p>Dear ${name},</p>
<p>Welcome to the Kavi Library! We're thrilled to have you on board.</p>
<p>You’re now a step closer to exclusive interviews with industry experts across different companies and industries that will help you make informed investment decisions. Share these insights by adding your colleagues on the Settings page of the platform. 
</p>
 <a href=${process.env.FRONTED_URL} class="button" style="padding: 12px 24px; color: #ffffff !important; background-color: #313D74; border: 0px; border-radius: 6px; text-align: center; text-decoration: none; display: inline-block; font-weight: bold;">Login Now</a>
<div class="account-info">
<p><strong>Here’s your account information:</strong></p>
<p>Seats: ${slots}</p>
<p>Expiry Date: ${expiry}</p>
</div>
</div>
<div class="footer">
<p>Thank you for choosing KAVI. We look forward to helping you achieve your investment goals.</p>
<p>Warm regards,<br>KAVI Team</p>
</div>
<div class="last">
<p>If you have any questions or need assistance, please reach out to us at <a href="mailto:tech@kaviresearch.com">tech@kaviresearch.com</a></p>
</div>
<div class="top" style="margin-top:50px;"></div>
</div>
</body>
 
</html>
`
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

       // Generate a random password
      const randomPassword = crypto.randomBytes(8).toString('hex');
  
      const user = {
        ...ctx.request.body,
        email: email.toLowerCase(),
        first_name: first_name,
        last_name:last_name,
        dob:dob,
        linkedinurl:normalizedurl,
        password:randomPassword,
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
      await sendWelcomeEmail(user.email,first_name,randomPassword);
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
        await sendAdminEmail(userToPromote.email,userToPromote.first_name,userToPromote.slots,userToPromote.expiry);
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