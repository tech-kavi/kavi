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
            read_time:new Date().toISOString(),
        }
        
        const articleId=ctx.request.body.data.article.connect[0];

        const existingEntity = await strapi.entityService.findMany(
            'api::read-article.read-article',
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
                return result;
            }else{
                return "success";
            }
       



    }


});
