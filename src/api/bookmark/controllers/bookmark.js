'use strict';

/**
 * bookmark controller
 */

const { createCoreController } = require('@strapi/strapi').factories;
module.exports = createCoreController('api::bookmark.bookmark');
module.exports = createCoreController('api::bookmark.bookmark',{
    async find(ctx){
        const {user}=ctx.state;
        if(!user){
            return ctx.unauthorized('you must be logged in to access bookmarks');
        }
        const entity = await strapi.db.query('api::bookmark.bookmark').findMany({
            where:{bookmarked_by:user.id},
            populate:{
                article:{
                    populate:{
                        industry:true,
                        primary_company:{
                            populate:{
                                logo:true
                            },
                        },
                        
                    },

            },
        },
        
      
        });
        const sanitizedEntity = await this.sanitizeOutput(entity,ctx);

        return this.transformResponse(sanitizedEntity);
    }
});


