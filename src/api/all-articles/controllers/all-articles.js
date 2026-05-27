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
          fields: [
    'title',
    'published_date',
    'publishedAt',
    'est_read'
    ],
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
            },
            allowed_users:{fields:['id']},
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
  let articles = await strapi.entityService.findMany('api::article.article',ctx.query);

  const paginatedArticles = articles.slice((pageInt-1)* pageSizeInt, pageInt*pageSizeInt);

 

  const bookmarkedArticles = await strapi.entityService.findMany('api::bookmark.bookmark', {
    filters: {
        bookmarked_by: user.id,
    },
    populate:{
        article:true,
    },
    limit: -1
});



const BookmarkArticleIds = bookmarkedArticles.map(bookmark => bookmark.article.id);

const readArticles = await strapi.entityService.findMany('api::read-article.read-article',{
    filters:{
        user: user.id,
    },
    populate:{
        article:{
            populate:['id'],
        }
    },
    limit: -1
});

const readArticleIds = readArticles.map(item => item.article.id);


// const articleWithBookmarkStatus = paginatedArticles.map(article =>({
//   ...article,
//   isBookmarked:BookmarkArticleIds.includes(article.id),
//   isRead:readArticleIds.includes(article.id),
// }));

const articleWithBookmarkStatus = paginatedArticles.map(article =>{


        const allowed_users = article.allowed_users || [];

        const canAccess = allowed_users.length===0 || allowed_users.some(u => u.id == user.id);

        delete article.allowed_users;
    
    return {
        ...article,
        isBookmarked:BookmarkArticleIds.includes(article.id),
        isRead:readArticleIds.includes(article.id),
        canAccess,
}});


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
  },

  exportArticles: async(ctx)=>{
     const startId = Number(ctx.query.startId || 0);
    const limit = Number(ctx.query.limit || 100);

    const articles = await strapi.entityService.findMany(
      "api::article.article",
      {
        filters: {
          id: {
            $gt: startId,
          },
          publishedAt: {
            $notNull: true,
          },
        },

        sort: { id: "asc" },

        populate: {
          brief: true,

          industry: {
            fields: ["name"],
          },

          sub_industries: {
            fields: ["name"],
          },

          primary_companies: {
            fields: ["name"],
            populate: {
              logo: true,
            },
          },

          secondary_companies: {
            fields: ["name"],
            populate: {
              logo: true,
            },
          },

          table_with_content: {
            populate: {
              ques: true,
            },
          },

          allowed_users: true,
        },

        locale: "en",

        limit,
      }
    );

    return {
      count: articles.length,
      lastId: articles.length
        ? articles[articles.length - 1].id
        : startId,
      data: articles,
    };
  }
};
