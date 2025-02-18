// @ts-nocheck
'use strict';

/**
 * read-article controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::read-article.read-article',{
    async find(ctx){
        const user = ctx.state.user;
        if(!user){
            return ctx.badRequest('User not authenticated');
        }
       
        ctx.query = {
            ...ctx.query,
            locale:'en',
            filters:{
                ...ctx.query.filters,
                user: user.id,
                publishedAt:{
                    $notNull:true,
                }
            },
            populate:{
                article:
                {
                    fields:['id'],
                },
            },
            pagination: {
                limit: -1, 
            }
        };

        // const result = await super.find(ctx);
        const result = await strapi.entityService.findMany('api::read-article.read-article',ctx.query);
        return result;
    },

    async create(ctx){
        const {user} = ctx.state;
 
        if(!user){
            return ctx.unauthorized('Please login');
        }

        try{

            const {data} = ctx.request.body;
            const articleId = data?.article?.connect[0];
            const userId = data?.user?.connect[0];
            const timeSpent = data?.timeSpent;
            const scroll = data?.scroll;
           


            
            

            if(!articleId || !userId){
                return ctx.badRequest('article id and user id both needed');
            }

            //check if read already exists

            const existingRead = await strapi.entityService.findMany(
                'api::read-article.read-article',
                {
                    filters:{
                        article:articleId,
                        user:user.id,
                    },
                    limit:1,
                }
            );

            let newRead;

          console.log(existingRead);

            if(existingRead && existingRead.length >0)
                {
                   newRead = await strapi.entityService.update('api::read-article.read-article',existingRead[0].id,{
                       data:{
                           article: articleId,
                           user: user.id,
                           time_spent:timeSpent>0?existingRead[0].time_spent+timeSpent:existingRead[0].time_spent,
                           scroll:existingRead[0].scroll>scroll?existingRead[0].scroll:scroll, 
                           read_time:new Date().toISOString(),
                       },
                   });
                    
                }else{
                    //if it not already read
                     newRead = await strapi.entityService.create('api::read-article.read-article',{
                        data:{
                            article: articleId,
                            user: user.id,
                            scroll:scroll,
                            time_spent:timeSpent,
                            read_time:new Date().toISOString(),
                            publishedAt: new Date(),
                        },
                    });

                    
                }

                return ctx.send(newRead);

        }
        catch(err)
        {
            return ctx.badRequest('Failed to add in reads');
        }

    }


});
