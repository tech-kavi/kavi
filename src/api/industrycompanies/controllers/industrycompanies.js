'use strict';

/**
 * A set of functions called "actions" for `industrycompanies`
 */

module.exports = {
  find: async (ctx, next) => {
    try {

      const {user}=ctx.state;
      if(!user){
        return ctx.unauthorized('you should be logged in to bookmark');
    }
      const { pagination } = ctx.request.query;
      const page = parseInt(pagination?.page) || 1;
      const pageSize = parseInt(pagination?.pageSize) || 30;

    
      const data = await strapi.service('api::industrycompanies.industrycompanies').find(user.id,page,pageSize,ctx);
      
      
      ctx.body = data;







//       const {user}=ctx.state;

//       const id=ctx.params.id;
      
//       if(!user)
//         {
//             return ctx.unauthorized("you must be logged in");
//         }

//         const { page = 1, pageSize = 30, ...filters } = ctx.query.pagination;
        
//         // Convert page and pageSize to integers
//         const pageInt = parseInt(page, 10);
//         const pageSizeInt = parseInt(pageSize, 10);
//         // console.log(pageSize);
      

//     const query = {
//       filters:{
//         ...ctx.request.query.filters,
//         industries:{
//           id:{
//             $in:[id],
//           },
//           publishedAt:{
//             $notNull:true,
//           }
//         },
//         publishedAt:{
//           $notNull:true,
//         }
//       },
//       populate:{
//         logo:true,
//         sub_industries:{
//           fields:['name'],
//           filters:{
//             publishedAt:{
//               $notNull:true,
//             }
//           }
//         },
      
//       articles:{
//         filters:{
//           publishedAt:{
//             $notNull:true,
//           }
//         }
//       },
//       },

//       sort:{name:'asc'},
     
    
//     };
    
//     const companies = await strapi.entityService.findMany('api::company.company',query);


//     const CompaniesWithArticleCount = companies.map(company =>{
//       const noOfArticles= company.articles.length;

//       const {articles, ...companyAttributesWithoutArticles} = company;
//                 return {
//                     ...companyAttributesWithoutArticles,
//                     numberOfArticles:noOfArticles,

//                 };
//     })



//     //to check bookmark status
//     const WatchlistedCompanies = await strapi.entityService.findMany('api::watchlist.watchlist', {
//       filters: {
//           watchlisted_by: user.id,
//       },
//       populate:{
//           company:true,
//       }
//   });

//   const WatchlistedCompanyIds = WatchlistedCompanies.map(watchlist => watchlist.company.id);

//   const CompanyWithWatchlistStatus = CompaniesWithArticleCount.map(company =>({
//     ...company,
//     isWatchlisted:WatchlistedCompanyIds.includes(company.id),
// }));

//     const total = companies.length;

//     return {
//       data:CompanyWithWatchlistStatus,
//     };


    } catch (err) {
      ctx.body = err;
    }
  }
};

