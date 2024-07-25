// @ts-nocheck
'use strict';

/**
 * liked-article controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::liked-article.liked-article',{
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
                article:{
                    fields:['title'],
                }
            }
        };

        const result = await super.find(ctx);
        return result;
    },

    async create(ctx){
        const user = ctx.state.user;
        if(!user){
            return ctx.badRequest('User not authenticated');
        }

        ctx.request.body.data.user.connect[0]=user.id;
        ctx.request.body.data={
            ...ctx.request.body.data,
            like_time:new Date().toISOString(),
        }
        
        const articleId=ctx.request.body.data.article.connect[0];

        const existingEntity = await strapi.entityService.findMany(
            'api::liked-article.liked-article',
            {
                filters:{
                    user:user.id,
                    article:articleId,
                }
            }
        );

        //getting dislike of article form current user
        const alreadyDisliked = await strapi.entityService.findMany(
            'api::disliked-article.disliked-article',
            {
                filters:{
                    user:user.id,
                    article:articleId,
                }
            }
        );
        
        if(existingEntity && existingEntity.length==0)
            {
                const result = await super.create(ctx);
                //if user is liking an article then we have to remove the dislike on it also from current user 
                if(alreadyDisliked && alreadyDisliked.length>0)
                    {
                        await strapi.entityService.delete('api::disliked-article.disliked-article',alreadyDisliked[0].id);
                    }
                return result;
            }else{
                const result = await strapi.entityService.delete('api::liked-article.liked-article',existingEntity[0].id);
                return result;
            }
       



    }
});
