// @ts-nocheck
'use strict';

/**
 * logged-in controller
 */

const { createCoreController } = require('@strapi/strapi').factories;
const axios = require('axios');

const sendWelcomeEmail = async (userEmail, name) => {
    try {
      await strapi.plugins['email'].services.email.send({
        to: userEmail,
        from: `KAVI <${process.env.DEFAULT_FROM}>`, // Replace with your verified sender email
        subject: 'Welcome to Our KAVI Platform!',
        text: `Hello ${name},\n\nWelcome to our service! We are glad to have you on board.\n\nBest regards,\nThe Team`,
        html: `<p>Hello ${name},</p><p>Welcome to our Platform! We are glad to have you on board.</p><p>Best regards,<br/>The Team</p>`,
      });
    } catch (error) {
      strapi.log.error('Error sending welcome email:', error);
    }
  };

module.exports = createCoreController('api::logged-in.logged-in',{
    async create(ctx){
        const user = ctx.state.user;
        if(!user){
            return ctx.badRequest("User not authenticated");
        }

        ctx.request.body.data.user.connect[0] = user.id;

        const existingEntity = await strapi.entityService.findMany(
            'api::logged-in.logged-in',
            {
                filters:{
                    user:user.id,
                   
                }
            }
        );
//get user data
        const userData = await strapi.entityService.findOne('plugin::users-permissions.user',user.id);
        // console.log(userData);
        if(existingEntity && existingEntity.length==0){
            const response = await axios.put(
                'https://api.sendgrid.com/v3/marketing/contacts',
                {
                    contacts:[{email: userData.email}],
                    list_ids:[`${process.env.SENDGRID_API_KEY_LIST_ID}`],
                },
                {
                    headers:{
                        Authorization:`Bearer ${process.env.SENDGRID_API_KEY_MARKETING}`
                    },
                }
            );
            // console.log(response);
            if(response.status==202)
            {
                const result = await super.create(ctx);
                console.log(userData.email);
                // await sendWelcomeEmail(userData.email,userData.name);
                return result;
            }
            else{
                return "Some error in sendgrid contact add";
            }
            
        }
        else{
            return "Not a first time user";
        }


    },

    async find(ctx)
    {
        const user = ctx.state.user; // Get the logged-in user

        if (!user) {
            return ctx.badRequest('User not authenticated');
        }

        
        ctx.query = {
            ...ctx.query,
            locale: 'en',
            filters:{
                ...ctx.query.filters,
                user: user.id, // Add user filter
                publishedAt:{
                    $notNull:true,
                }
            }
            
        };
        const result = await super.find(ctx);


  

    return result;
    }
});
