// @ts-nocheck
'use strict';

/**
 * A set of functions called "actions" for `company-articles`
 */

// function countWordsInFields(article){
//   let totalWordCount = 0;

//   //count words in brief

//   // console.log(article.data.attributes.brief);
//   // console.log(article);
//   // console.log('from function');
//   if(article.brief){
//       article.brief.forEach(brief => {
//           totalWordCount += brief.point.split(' ').length;
//       });

//       delete article.brief;
//   }
//   // console.log(totalWordCount);



//   //count words table-with_content
//   if(article?.table_with_content){
//       article?.table_with_content?.forEach(toc =>{
//           totalWordCount += toc?.tablePoint.split(' ').length;

          

//           toc?.ques?.forEach(ques=>{
//               // console.log(ques);
//               totalWordCount += ques?.question.split(' ').length;
//               totalWordCount += ques?.answer.split(' ').length;
//           })
//       });

//       delete article?.table_with_content;
//   }

//   // console.log(totalWordCount);

//   const readTime = Math.ceil(totalWordCount/process.env.WPM);
//   return readTime;
// }


module.exports = {
  


  find: async (ctx, next) => {
    try {
      const {user}=ctx.state;

      const id=ctx.params.id;
      
      if(!user)
        {
            return ctx.unauthorized("you must be logged in");
        }

      

       // 1. Pagination values
const pageInt = parseInt(ctx.query.pagination?.page || 1, 10);
const pageSizeInt = parseInt(ctx.query.pagination?.pageSize || 10, 10);

const queryFilters = {
  ...ctx.request.query.filters,
  primary_companies: {
    id: { $in: [id] },
    publishedAt: { $notNull: true },
  },
  publishedAt: { $notNull: true },
};

// 2. Fetch articles for the current page
const paginatedArticles = await strapi.entityService.findMany('api::article.article', {
  filters: queryFilters,
  populate: {
    industry: true,
  },
  sort: [...ctx.request.query.sort],
  start: (pageInt - 1) * pageSizeInt,
  limit: pageSizeInt,
});

// 3. Get total count without loading all records
const total = await strapi.entityService.count('api::article.article', {
  filters: queryFilters,
});

// 4. Extract IDs for bookmark & read-article queries
const articleIds = paginatedArticles.map(a => a.id);

const [bookmarkedArticles, readArticles] = await Promise.all([
  strapi.entityService.findMany('api::bookmark.bookmark', {
    filters: { bookmarked_by: user.id, article: { id: { $in: articleIds } } },
    populate: { article: { fields: ['id'] } },
    limit: -1
  }),
  strapi.entityService.findMany('api::read-article.read-article', {
    filters: { user: user.id, article: { id: { $in: articleIds } } },
    populate: { article: { fields: ['id'] } },
    limit: -1
  })
]);

const BookmarkArticleIds = bookmarkedArticles.map(b => b.article.id);
const ReadArticleIds = readArticles.map(r => r.article.id);

const CompanyArticleWithBookmarkStatus = paginatedArticles.map(article => ({
  ...article,
  isBookmarked: BookmarkArticleIds.includes(article.id),
  isRead: ReadArticleIds.includes(article.id),
}));

// 5. Response with meta
return {
  data: CompanyArticleWithBookmarkStatus,
  meta: {
    page: pageInt,
    pageSize: pageSizeInt,
    pageCount: Math.ceil(total / pageSizeInt),
    total,
  },
};



    } catch (err) {
      ctx.body = err;
    }
  }
};
