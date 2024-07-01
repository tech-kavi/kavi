'use strict';

/**
 * A set of functions called "actions" for `pickofweek`
 */

module.exports = {
  pickofweek: async (ctx, next) => {
    const {user}=ctx.state;
    if(!user)
    {
        return ctx.unauthorized("you must be logged in");
    }
    
    const pickofweekArticles = await strapi.entityService.findMany(
      'api::article.article',
      {
        filters:{
          tags:{
            tag_name:'pickofweek',
          },
        },
        populate:{
          industry:{
              fields:['name'],
          },
          primary_companies:{
              fields:['name'],
              populate:{
                  logo:true,
              }
          },
          brief:true,
      },
      sort:['publishedAt:desc']
      }
    );

    return pickofweekArticles[0];
  }
};
