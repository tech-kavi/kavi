// @ts-nocheck
'use strict';


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
            $in:[id],
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



    //to check bookmark status
    const WatchlistedCompanies = await strapi.entityService.findMany('api::watchlist.watchlist', {
      filters: {
          watchlisted_by: user.id,
      },
      populate:{
          company:true,
      }
  });

  const WatchlistedCompanyIds = WatchlistedCompanies.map(watchlist => watchlist.company.id);

  const CompanyWithWatchlistStatus = CompaniesWithArticleCount.map(company =>({
    ...company,
    isWatchlisted:WatchlistedCompanyIds.includes(company.id),
}));

    const total = companies.length;

    return {
      data:CompanyWithWatchlistStatus,
    };


    } catch (err) {
      ctx.body = err;
    }
  }
};
