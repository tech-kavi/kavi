'use strict';

/**
 * industrycompanies service
 */

module.exports = {
    find:async(userId,page,pageSize,ctx)=>{
        try{
           
          

                const pageNumber = parseInt(page);
                const pageSizeNumber = parseInt(pageSize);
                 
                const start = (pageNumber-1)*pageSizeNumber;
            //fetch articles based on the extracted company IDs


       const query = {
        start:start,
        limit:pageSizeNumber,
      filters:{
        ...ctx.request.query.filters,
        industries:{
          id:{
            $in:[ctx.params.id],
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
        logo:true,
        sub_industries:{
          fields:['name'],
          filters:{
            publishedAt:{
              $notNull:true,
            }
          }
        },
      
      articles:{
        filters:{
          publishedAt:{
            $notNull:true,
          }
        }
      },
      },

      sort:{name:'asc'},
     
    
    };
    
    const companies = await strapi.entityService.findMany('api::company.company',query);

    const totalEntries = await strapi.entityService.count('api::company.company',{
        filters:{
            ...ctx.request.query.filters,
            industries:{
                id:{
                  $in:[ctx.params.id],
                },
                publishedAt:{
                  $notNull:true,
                }
              },
              publishedAt:{
                $notNull:true,
              }
        }
    });


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
          watchlisted_by: userId,
      },
      populate:{
          company:true,
      },
      limit:-1,

  });

  const WatchlistedCompanyIds = WatchlistedCompanies.map(watchlist => watchlist.company.id);

  const CompanyWithWatchlistStatus = CompaniesWithArticleCount.map(company =>({
    ...company,
    isWatchlisted:WatchlistedCompanyIds.includes(company.id),
}));
    

const meta={
    page:pageNumber,
    pageSize:pageSizeNumber,
    pageCount:Math.ceil(totalEntries/pageSizeNumber),
    total:totalEntries,
  }

  return {data:CompanyWithWatchlistStatus,meta:meta};
            
           
        } catch(err){
            return err;
        }
    }
};
