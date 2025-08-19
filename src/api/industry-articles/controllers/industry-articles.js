// @ts-nocheck
'use strict';

const { findAllInRenderedTree } = require("react-dom/test-utils");

/**
 * A set of functions called "actions" for `industry-articles`
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
        industry:{
          id:{
            $eq:id,
          },
          publishedAt:{
            $notNull:true,
          }
        },
        publishedAt:{
          $notNull:true,
        }
      },
      populate:{
        sub_industries:{
          fields:['name'],
          filters:{
            publishedAt:{
              $notNull:true,
            },
          },
      },
      primary_companies:{
          fields:['name'],
          populate:{
              logo:true,
          },
          filters:{
            publishedAt:{
              $notNull:true,
            },
          },
      },
      },
      sort:[...ctx.request.query.sort],
      
    };
    
    const articles = await strapi.entityService.findMany('api::article.article',query);



    const paginatedArticles = articles.slice((pageInt-1)* pageSizeInt, pageInt*pageSizeInt);

    const articleIds = paginatedArticles.map(a=>a.id);


    //to check bookmark status
    const bookmarkedArticles = await strapi.entityService.findMany('api::bookmark.bookmark', {
      filters: {
          bookmarked_by: user.id,
          article:
          {
            id:{
              $in:articleIds,
            }
          }
      },
      populate:{
          article:true,
      },
      limit:-1,
  });

  const BookmarkArticleIds = bookmarkedArticles.map(bookmark => bookmark.article.id);
 console.log(BookmarkArticleIds);

  //fetch already read articles

      const readArticles = await strapi.entityService.findMany('api::read-article.read-article',{
          filters:{
              user: user.id,
              article:
              {
                id:{
                  $in:articleIds,
                }
              }
          },
          populate:{
              article:{
                  populate:['id'],
              }
          },
          limit: -1
      });

      const readArticleIds = readArticles.map(item => item.article.id);


  const CompanyArticleWithBookmarkStatus = paginatedArticles.map(article =>({
    ...article,
    isBookmarked:BookmarkArticleIds.includes(article.id),
     isRead:readArticleIds.includes(article.id),
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
