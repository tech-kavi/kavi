'use strict';

/**
 * A set of functions called "actions" for `answer-highlights`
 */

module.exports = {
  find:async(ctx,next)=>{
    const {user}=ctx.state;

    const articleId = ctx.params.id;

    if(!user)
    {
        return ctx.unauthorized("Please Log in");
    }
    
    const query = {
        ...ctx.query,
        locale: 'en',
        filters: {
            ...ctx.request.query.filters,
            user: user.id,
            articleId:articleId,
            
        },
        limit:-1,
    };

    const highlights = await strapi.entityService.findMany('api::highlight.highlight',query);

    return highlights;
}
};
