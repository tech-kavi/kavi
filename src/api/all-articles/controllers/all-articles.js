'use strict';

/**
 * A set of functions called "actions" for `all-articles`
 */

module.exports = {
  find: async (ctx, next) => {
    const {user}=ctx.state;
    if(!user)
    {
        return ctx.unauthorized("User unathorized");
    }
    
    const { page = 1, pageSize = 10, ...filters } = ctx.query.pagination;
        
    // Convert page and pageSize to integers
    const pageInt = parseInt(page, 10);
    const pageSizeInt = parseInt(pageSize, 10);
    // console.log(pageSize);
    // Build query parameters


    ctx.query = {
        ...ctx.query,
        locale: 'en',
        populate: {
            industry: {
                fields: ['name'],
                filters:{
                    publishedAt:{
                        $notNull:true,
                    }
                }
            },
            primary_companies: {
                fields: ['name'],
                populate: {
                    logo: true,
                },
                filters:{
                    publishedAt:{
                        $notNull:true,
                    }
                }
            }
        },
        sort: [...(ctx.request.query.sort || []),'publishedAt:desc','id:desc'],
        filters: {
            ...ctx.request.query.filters,
            publishedAt: {
                $notNull:true,//ensuring the article is published
            },
        },
    };


// Initial query for the current month's articles
  let articles = await strapi.entityService.findMany('api::article.article',ctx);

  const paginatedArticles = articles.slice((pageInt-1)* pageSizeInt, pageInt*pageSizeInt);

 

  const bookmarkedArticles = await strapi.entityService.findMany('api::bookmark.bookmark', {
    filters: {
        bookmarked_by: user.id,
    },
    populate:{
        article:true,
    }
});



const BookmarkArticleIds = bookmarkedArticles.map(bookmark => bookmark.article.id);




const articleWithBookmarkStatus = paginatedArticles.map(article =>({
  ...article,
  isBookmarked:BookmarkArticleIds.includes(article.id),
}));


const total = articles.length;

    return {
      data:articleWithBookmarkStatus,
      meta:{
        page:pageInt,
        pageSize:pageSizeInt,
        pageCount:Math.ceil(total/pageSizeInt),
        total,
      },
    };
  }
};
