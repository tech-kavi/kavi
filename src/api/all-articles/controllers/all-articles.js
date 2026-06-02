'use strict';

/**
 * A set of functions called "actions" for `all-articles`
 */

function countMentions(hit, searchTerm) {
  const tableContent = hit?._highlightResult?.table_with_content;
  const title = hit?.['title'];

  // Validate that searchTerm is a string and tableContent is an array
  if (typeof searchTerm !== 'string' || !Array.isArray(tableContent)) {
    return ''; // Invalid data, return an empty string
  }

  // Prepare the search terms: lowercased
  const searchTerms = searchTerm.trim().toLowerCase().split(/\s+/);

  // Initialize a counter for the word mentions
  let mentionCount = 0;

  // Normalize title and search for mentions
  const titleText = title?.toLowerCase() || '';
  searchTerms.forEach(term => {
    // Use a regex that allows for term followed by punctuation or inside other words
    const regex = new RegExp(`\\b${term}\\b|'s`, 'gi');
    const matches = titleText.match(regex);
    if (matches) {
      mentionCount += matches.length;
    }
  });

  // Iterate over each entry in the tableContent array
  tableContent.forEach(entry => {
    if (Array.isArray(entry.ques)) {
      entry.ques.forEach(q => {
        // Extract, normalize, and combine question and answer text
        const questionText = q.question.value?.toLowerCase() || '';
        const answerText = q.answer.value?.toLowerCase() || '';
        const combinedText = ` ${questionText} ${answerText} `;  // Pad combined text with spaces

        // Check for each search term's appearance in the combined text
        searchTerms.forEach(term => {
          const regex = new RegExp(`\\b${term}\\b|'s`, 'gi');
          const matches = combinedText.match(regex);
          if (matches) {
            mentionCount += matches.length;
          }
        });
      });
    }
  });

  // Return the appropriate message based on the mention count
  if (mentionCount === 0) {
    return '';
  } else if (mentionCount === 1) {
    return mentionCount + " mention";
  } else if (mentionCount < 10) {
    return mentionCount + " mentions";
  } else if (mentionCount >= 50) {
    return '50+ mentions';
  } else if (mentionCount >= 40) {
    return '40+ mentions';
  } else if (mentionCount >= 30) {
    return '30+ mentions';
  } else if (mentionCount >= 20) {
    return '20+ mentions';
  } else {
    return '10+ mentions';
  }
}


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
    'est_read',
    'expert_type',
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
    const endId = Number(ctx.query.endId || 50);

    const articles = await strapi.entityService.findMany(
      "api::article.article",
      {
        filters: {
          id: {
            $gt: startId,
            $lte:endId,
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

      }
    );

    return {
      count: articles.length,
      lastId: articles.length
        ? articles[articles.length - 1].id
        : startId,
      data: articles,
    };
  },

   async search(ctx) {
    try {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized("Login required");
      }

      const query = ctx.query.q || "";
      const page = Number(ctx.query.page || 0);

      if (!query.trim()) {
        return ctx.badRequest("Query required");
      }

      const result = await strapi.service('api::all-articles.all-articles').search(query, user, page);

      console.log(result.hits[0]);

       const cleanedHits = result.hits.map(hit => {
      const mentionCount = countMentions(hit, query);

      return {
        id: hit.objectID,
        title: hit.title,
        primary_companies: hit.primary_companies,
        published_date:hit.published_date,
        mentionCount: mentionCount,
      };
    });

    return {
      hits: cleanedHits,
      nbHits: result.nbHits,
    };

      // return {
      //   hits: result.hits,
      //   nbHits: result.nbHits,
      //   page: result.page,
      //   nbPages: result.nbPages,
      // };
    } catch (err) {
      console.error(err);
      return ctx.internalServerError(err.message);
    }
  },
};
