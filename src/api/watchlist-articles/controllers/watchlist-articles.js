'use strict';

/**
 * A set of functions called "actions" for `watchlist-articles`
 */

module.exports = {
  find: async (ctx, next) => {
    
      const {user}=ctx.state;
      if(!user){
        return ctx.unauthorized('you should be logged in to bookmark');
    }
      const { pagination } = ctx.request.query;
      const page = parseInt(pagination?.page) || 1;
      const pageSize = parseInt(pagination?.pageSize) || 10;

    
      const data = await strapi.service('api::watchlist-articles.watchlist-articles').find(user.id,page,pageSize,ctx);
      
      
      ctx.body = data;
    // } catch (err) {
    //   ctx.badRequest("find articles controller error",{moreDetails : err});
    // }
  }

};