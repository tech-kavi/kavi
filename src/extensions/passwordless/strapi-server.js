// @ts-nocheck
'use strict';

/**
 * Auth.js controller
 *
 * @description: A set of functions called "actions" for managing `Auth`.
 */
const {sanitize} = require('@strapi/utils');

const { ValidationError } = require('@strapi/utils').errors;

const customPasswordless = require('../passwordless/services/customPasswordless');

const moment = require('moment-timezone');


/* eslint-disable no-useless-escape */
const _ = require('lodash');
const emailRegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;


module.exports = (plugin) =>{


    const login = plugin.controllers.auth.login;


    plugin.controllers.auth.login = async (ctx) =>{

        const {loginToken} = ctx.query;
        const {passwordless} = strapi.plugins['passwordless'].services;
        const {user: userService, jwt: jwtService} = strapi.plugins['users-permissions'].services;

        const LoginKey = ctx.request.headers['login-key'];
        console.log(LoginKey);
        // console.log(ctx);
        const isEnabled = await passwordless.isEnabled();

        if (!isEnabled) {
        return ctx.badRequest('plugin.disabled');
        }

        if (_.isEmpty(loginToken)) {
        return ctx.badRequest('Invalid token.');
        }
        const token = await passwordless.fetchToken(loginToken);

        if (!token || !token.is_active) {
        return ctx.badRequest('Invalid token.');
        }

        console.log(ctx);

        const isValid = await passwordless.isTokenValid(token);

        if (!isValid) {
        await passwordless.deactivateToken(token);
        return ctx.badRequest('Invalid token.');
        }
        // console.log("token validated");

        await passwordless.updateTokenOnLogin(token);

        const user = await strapi.query('plugin::users-permissions.user').findOne({
        where: {email: token.email}
        });

        
        
        // console.log("email fetched");

        if (!user) {
        return ctx.badRequest('No user found. Contact us to resolve this.');
        }

        // console.log("email checked");

        if (user.blocked) {
        return ctx.badRequest('Your access is blocked. Please contact us to resolve this.');
        }
        // console.log("blocked checked");

        // Check if the user's plan expiry date has passed
        const currentDateTime = new Date();
        const expiryDateTime = new Date(user.expiry); // Assuming 'expiry' field holds the expiry date

        if (currentDateTime > expiryDateTime) {
        return ctx.badRequest('Your plan has expired. Please contact us to renew your subscription.');
        }

        // console.log("not expired");

        if (!user.confirmed) {
        // await userService.edit({id: user.id}, {confirmed: true});
        await strapi.entityService.update('plugin::users-permissions.user', user.id, {
          data: {
          confirmed: true,
          },
      });
        }

        // console.log("user confirmed");

        // Generate new token
        const newToken = jwtService.issue({ id: user.id });
        // Store the new token in the user record
        // await userService.edit({ id: user.id }, { currentToken: newToken });
        
        // Correct the way to update user information using the entity service

      //   if ((!user.loginKey || user.loginKey !== LoginKey) && LoginKey) {
      //     console.log('Code changed');
      //     const updatedUser = await strapi.entityService.update('plugin::users-permissions.user', user.id, {
      //         data: {
      //             currentToken: newToken,
      //             loginKey:LoginKey,
      //             last_login: moment().tz('Asia/Kolkata').format(),
      //         },
      //     });
      // }
      //   else{
      //     console.log('Code not changed');
      //   }

        console.log(loginToken);

        const allowedOrgIDs = process.env.ALLOWED_ORG_IDS ? process.env.ALLOWED_ORG_IDS.split(',').map(Number) : [];
        console.log(allowedOrgIDs);
        
        if ( user.token !== loginToken ) {
          console.log('Code changed');
          const updatedUser = await strapi.entityService.update('plugin::users-permissions.user', user.id, {
              data: {
                  currentToken: newToken,
                  loginKey:LoginKey,
                  token:loginToken,
                  last_login: moment().tz('Asia/Kolkata').format(),
              },
          });

          if(!allowedOrgIDs.includes(Number(user.orgID)))
          {
            console.log('Deactivating token for non-allowed orgID');
            await passwordless.deactivateToken(token);
          }
          
      }
        else{
          // console.log('Token already Used');
          // return ctx.badRequest('Link already used. Please request new login link.');
          if (allowedOrgIDs.includes(Number(user.orgID))) {
            console.log('Allowing for multiple login link.');
            
            // Still update last_login for tracking
            await strapi.entityService.update('plugin::users-permissions.user', user.id, {
                data: {
                  currentToken: newToken,
                  loginKey:LoginKey,
                  token:loginToken,
                  last_login: moment().tz('Asia/Kolkata').format(),
                },
            });
    
        } else {
            console.log('Token already used');
            return ctx.badRequest('Link has been used already. Please request a new login link.');
          }
        }



        // const updatedUser = await strapi.entityService.update('plugin::users-permissions.user', user.id, {
        //     data: {
        //     currentToken: newToken,
        //     last_login: moment().tz('Asia/Kolkata').format()
        //     },
        // });

        // console.log("user newtoken updated");

        console.log(`New token generated and saved for user ${user.email}: ${newToken}`);

        const userSchema = strapi.getModel('plugin::users-permissions.user');
        // Sanitize the template's user information
        const sanitizedUserInfo = await sanitize.sanitizers.defaultSanitizeOutput(userSchema, user);

        

        let context;
        try {
        context = JSON.parse(token.context);
        } catch (e) {
        context = typeof token.context === "object" ? token.context : {};
        }
        //jwtService.issue({id: user.id})

        console.log(sanitizedUserInfo);

        ctx.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        ctx.set('Pragma', 'no-cache');
        ctx.set('Expires', '0');

        // console.log(ctx);
        ctx.send({
        jwt: newToken,
        user: sanitizedUserInfo,
        context
        });


    }

    const sendLink = plugin.controllers.auth.sendLink;


    plugin.controllers.auth.sendLink = async (ctx) =>{

        const {passwordless} = strapi.plugins['passwordless'].services;

        const isEnabled = await passwordless.isEnabled();
    
        if (!isEnabled) {
          return ctx.badRequest('plugin.disabled');
        }
    
        const params = _.assign(ctx.request.body);
    
        const email = params.email ? params.email.trim().toLowerCase() : null;
        const password = params.password || null;
        
        const context = params.context || {};
        const username = params.username || null;
    
        const isEmail = emailRegExp.test(email);
    
        if (email && !isEmail) {
          return ctx.badRequest('No such user is registered. Please contact us to get a subscription.');
        }
    
        let user;
        try {
          //user = await passwordless.user(email, username);
          user = await strapi.query('plugin::users-permissions.user').findOne({
            where: { email }
          });
        } catch (e) {
          return ctx.badRequest('No such user is registered. Please contact us to get a subscription.')
        }
    
        if (!user) {
          return ctx.badRequest('No such user is registered. Please contact us to get a subscription.');
        }
    
        if (email && user.email !== email) {
          return ctx.badRequest('No such user is registered. Please contact us to get a subscription.')
        }

        // console.log(user);
    
        if (user.blocked) {
          return ctx.badRequest('Your access is blocked. Please contact us to resolve this. ');
        }
    
        // Check if the user's plan expiry date has passed
        const currentDateTime = new Date();
        const expiryDateTime = new Date(user.expiry); // Assuming 'expiry' field holds the expiry date

        console.log(currentDateTime,expiryDateTime);

        if (currentDateTime > expiryDateTime) {
          return ctx.badRequest('Your plan has expired. Please contact us to renew your subscription.');
        }
        
        //password check

        if (!password) {
          return ctx.badRequest('Password is required.');
        }
        // console.log(password);
        // console.log(user.password);
        const userService = strapi.plugin('users-permissions').service('user');
        const validPassword = await userService.validatePassword(
          password,
          user.password
        );
  
        if (!validPassword) {
          throw new ValidationError('Invalid identifier or password.');
        }
        // console.log('password validated');

        

    
        try {
          const token = await passwordless.createToken(user.email, context);
          // console.log('token created');
          console.log(token);
          await customPasswordless.sendLoginLink(token);
          ctx.send({
            email,
            username,
            sent: true,
          });

          console.log(`${user.email} magic link sent`);
        } catch (err) {
          return ctx.badRequest("Failed to send magic link email. Please try again later.");
        } 
    }


    return plugin;
}