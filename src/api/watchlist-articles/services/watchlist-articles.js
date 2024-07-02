'use strict';

/**
 * watchlist-articles service
 */

module.exports = {
    find:async(userId,page,pageSize)=>{
        try{
            console.log("in service");
            const watchlistEntries = await strapi.entityService.findMany(
                "api::watchlist.watchlist",
                {
                    filters:{watchlisted_by:userId},
                    populate:{company:true}
                }
            );

            // extract company IDs from the watchlist entries
            const companyIds = watchlistEntries.map(entry => entry.company.id);
            console.log(companyIds);
            if(companyIds.length===0)
                {
                    return [];
                }

                const pageNumber = parseInt(page);
                const pageSizeNumber = parseInt(pageSize);
                 
                const start = (pageNumber-1)*pageSizeNumber;
            //fetch articles based on the extracted company IDs
            const entries = await strapi.entityService.findMany(
                'api::article.article',
                {
                    start:start,
                    limit:pageSizeNumber,
                    filters:{primary_companies:{id:{$in:companyIds}}},
                    populate:{
                        primary_companies:{
                            fields:['name'],
                            populate:{
                                logo:true,
                            }
                        },

                    }
                }
            );

            const totalEntries = await strapi.entityService.count('api::article.article',{
                filters:{primary_companies:{id:{$in:companyIds}}}
            });
        

            const meta={
                page:pageNumber,
                pageSize:pageSizeNumber,
                pageCount:Math.ceil(totalEntries/pageSizeNumber),
                total:totalEntries,
              }

        return {data:entries,meta:meta};
        } catch(err){
            return err;
        }
    }
}
