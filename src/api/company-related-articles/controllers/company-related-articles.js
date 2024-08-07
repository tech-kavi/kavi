// @ts-nocheck
'use strict';

/**
 * A set of functions called "actions" for `company-related-articles`
 */

module.exports = {
  find: async (ctx, next) => {
    try {
      const {user}=ctx.state;

      const id=ctx.params.id;
      
      if(!user)
        {
            return ctx.unauthorized("you must be logged in");
        }

      

        const { page = 1, pageSize = 10, ...filters } = ctx.query.pagination;
        
        // Convert page and pageSize to integers
        const pageInt = parseInt(page, 10);
        const pageSizeInt = parseInt(pageSize, 10);
        // console.log(pageSize);
        // Build query parameters

    const query = {
      filters:{
        ...ctx.request.query.filters,
        secondary_companies:{
          id:{
            $in:[id],
          }
        },
        publishedAt:{
          $notNull:true,
        }
      },
      populate:{
        industry:true,
        primary_companies:{
          populate:{
            logo:true,
          }
        },
      },
      sort:['publishedAt:desc'],
      limit:-1,
    };
    
    const articles = await strapi.entityService.findMany('api::article.article',query);



    const paginatedArticles = articles.slice((pageInt-1)* pageSizeInt, pageInt*pageSizeInt);

    //to check bookmark status
    const bookmarkedArticles = await strapi.entityService.findMany('api::bookmark.bookmark', {
      filters: {
          bookmarked_by: user.id,
          publishedAt:{
            $notNull:true,
          },
      },
      populate:{
          article:true,
      }
  });

  const BookmarkArticleIds = bookmarkedArticles.map(bookmark => bookmark.article.id);

  const CompanyArticleWithBookmarkStatus = paginatedArticles.map(article =>({
    ...article,
    isBookmarked:BookmarkArticleIds.includes(article.id),
}));

    const total = articles.length;

    return {
      data:CompanyArticleWithBookmarkStatus,
      meta:{
        page:pageInt,
        pageSize:pageSizeInt,
        pageCount:Math.ceil(total/pageSizeInt),
        total,
      },
    };


    } catch (err) {
      ctx.body = err;
    }
  }
};
