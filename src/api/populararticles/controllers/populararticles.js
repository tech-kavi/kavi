// @ts-nocheck
'use strict';

/**
 * A set of functions called "actions" for `populararticles`
 */

module.exports = {
  populararticles: async (ctx, next) => {
    const {user}=ctx.state;
    if(!user)
    {
        return ctx.unauthorized("you must be logged in");
    }
    
    const popularArticles = await strapi.entityService.findMany(
      'api::article.article',
      {
        filters:{
          tags:{
            tag_name:'popular',
          },
        },
        populate:{
          industry:{
              fields:['name'],
          },
          primary_company:{
              fields:['name'],
              populate:{
                  logo:true,
              }
          }
      },
      sort:['publishedAt:desc']
      }
    );

    ctx.send(pickofweekArticles);
  }
};
