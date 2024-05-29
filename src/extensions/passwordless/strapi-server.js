// @ts-nocheck
'use strict';

/**
 * Auth.js controller
 *
 * @description: A set of functions called "actions" for managing `Auth`.
 */
const {sanitize} = require('@strapi/utils');

/* eslint-disable no-useless-escape */
const _ = require('lodash');
const emailRegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;


module.exports = (plugin) =>{


    const login = plugin.controllers.auth.login;


    plugin.controllers.auth.login = async (ctx) =>{

        const {loginToken} = ctx.query;
        const {passwordless} = strapi.plugins['passwordless'].services;
        const {user: userService, jwt: jwtService} = strapi.plugins['users-permissions'].services;
        const isEnabled = await passwordless.isEnabled();

        if (!isEnabled) {
        return ctx.badRequest('plugin.disabled');
        }

        if (_.isEmpty(loginToken)) {
        return ctx.badRequest('token.invalid');
        }
        const token = await passwordless.fetchToken(loginToken);

        if (!token || !token.is_active) {
        return ctx.badRequest('token.invalid');
        }

  

        const isValid = await passwordless.isTokenValid(token);

        if (!isValid) {
        await passwordless.deactivateToken(token);
        return ctx.badRequest('token.invalid');
        }
        console.log("token validated");

        await passwordless.updateTokenOnLogin(token);

        const user = await strapi.query('plugin::users-permissions.user').findOne({
        where: {email: token.email}
        });
        
        console.log("email fetched");

        if (!user) {
        return ctx.badRequest('wrong.email');
        }

        console.log("email checked");

        if (user.blocked) {
        return ctx.badRequest('blocked.user');
        }
        console.log("blocked checked");

        // Check if the user's plan expiry date has passed
        const currentDateTime = new Date();
        const expiryDateTime = new Date(user.expiry); // Assuming 'expiry' field holds the expiry date

        if (currentDateTime > expiryDateTime) {
        return ctx.badRequest('plan.expired');
        }

        console.log("not expired");

        if (!user.confirmed) {
        // await userService.edit({id: user.id}, {confirmed: true});
        await strapi.entityService.update('plugin::users-permissions.user', user.id, {
          data: {
          confirmed: true,
          },
      });
        }

        console.log("user confirmed");

        // Generate new token
        const newToken = jwtService.issue({ id: user.id });
        // Store the new token in the user record
        // await userService.edit({ id: user.id }, { currentToken: newToken });
        
        // Correct the way to update user information using the entity service
        const updatedUser = await strapi.entityService.update('plugin::users-permissions.user', user.id, {
            data: {
            currentToken: newToken,
            },
        });

        console.log("user newtoken updated");


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
        ctx.send({
        jwt: jwtService.issue({id: user.id}),
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
        const context = params.context || {};
        const username = params.username || null;
    
        const isEmail = emailRegExp.test(email);
    
        if (email && !isEmail) {
          return ctx.badRequest('wrong.email');
        }
    
        let user;
        try {
          user = await passwordless.user(email, username);
        } catch (e) {
          return ctx.badRequest('wrong.user')
        }
    
        if (!user) {
          return ctx.badRequest('wrong.email');
        }
    
        if (email && user.email !== email) {
          return ctx.badRequest('wrong.user')
        }
    
        if (user.blocked) {
          return ctx.badRequest('blocked.user');
        }
    
        // Check if the user's plan expiry date has passed
        const currentDateTime = new Date();
        const expiryDateTime = new Date(user.expiry); // Assuming 'expiry' field holds the expiry date
    
        if (currentDateTime > expiryDateTime) {
          return ctx.badRequest('plan.expired');
        }
    
    
        try {
          const token = await passwordless.createToken(user.email, context);
          await passwordless.sendLoginLink(token);
          ctx.send({
            email,
            username,
            sent: true,
          });
        } catch (err) {
          return ctx.badRequest(err);
        } 
    }


    return plugin;
}