// @ts-nocheck
'use strict';

const { find } = require("../../company-articles/controllers/company-articles");

/**
 * A set of functions called "actions" for `industry-companies`
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

      

    const query = {
      filters:{
        ...ctx.request.query.filters,
        industries:{
          id:{
            $containsi:id,
          }
        }
      },
      populate:{
        logo:true,
        sub_industries:{
          fields:['name'],
      },
      articles:true,
      },

      sort:{name:'asc'},
    
    };
    
    const companies = await strapi.entityService.findMany('api::company.company',query);


    const CompaniesWithArticleCount = companies.map(company =>{
      const noOfArticles= company.articles.length;

      const {articles, ...companyAttributesWithoutArticles} = company;
                return {
                    ...companyAttributesWithoutArticles,
                    numberOfArticles:noOfArticles,

                };
    })


    // const paginatedArticles = articles.slice((pageInt-1)* pageSizeInt, pageInt*pageSizeInt);

    //to check bookmark status
  //   const bookmarkedArticles = await strapi.entityService.findMany('api::bookmark.bookmark', {
  //     filters: {
  //         bookmarked_by: user.id,
  //     },
  //     populate:{
  //         article:true,
  //     }
  // });

//   const BookmarkArticleIds = bookmarkedArticles.map(bookmark => bookmark.article.id);

//   const CompanyArticleWithBookmarkStatus = paginatedArticles.map(article =>({
//     ...article,
//     isBookmarked:BookmarkArticleIds.includes(article.id),
// }));

    // const total = companies.length;

    return {
      data:CompaniesWithArticleCount
    };


    } catch (err) {
      ctx.body = err;
    }
  }
};
