// @ts-nocheck
'use strict';

/**
 * disliked-article controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::disliked-article.disliked-article',{
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
                },
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
            dislike_time:new Date().toISOString(),
        }
        
        const articleId=ctx.request.body.data.article.connect[0];

        const existingEntity = await strapi.entityService.findMany(
            'api::disliked-article.disliked-article',
            {
                filters:{
                    user:user.id,
                    article:articleId,
                    publishedAt:{
                        $notNull:true,
                    }
                }
            }
        );

        //find if article is already liked
        const alreadyLiked = await strapi.entityService.findMany(
            'api::liked-article.liked-article',
            {
                filters:{
                    user:user.id,
                    article:articleId,
                    publishedAt:{
                        $notNull:true,
                    }
                }
            }
        )
        
        if(existingEntity && existingEntity.length==0)
            {
                const result = await super.create(ctx);
                //if user is disliking an article then we have to remove the like on it also from current user 
                if(alreadyLiked && alreadyLiked.length>0)
                {
                    await strapi.entityService.delete('api::liked-article.liked-article',alreadyLiked[0].id);
                }
                
                return result;
            }else{
                const result = await strapi.entityService.delete('api::disliked-article.disliked-article',existingEntity[0].id);
                return result;
            }
       



    }
});
