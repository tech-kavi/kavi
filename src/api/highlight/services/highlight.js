'use strict';

/**
 * highlight service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::highlight.highlight',{
    find:async(userId,page,pageSize,ctx)=>{
        try{
            
            const highlights = await strapi.entityService.findMany(
                "api::highlight.highlight",
                {
                    filters:{
                        user: userId,
                    },
                   sort:'publishedAt:desc',
                }
            );

            console.log('inside service');
            
              // extract article IDs from the watchlist entries
              let articleIds = highlights.map(entry => parseInt(entry.articleId));
              articleIds = [...new Set(articleIds)];

              console.log(articleIds);

              if(articleIds.length===0)
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
                        filters:{
                            id:{$in:articleIds},
                            publishedAt:{
                                $notNull:true,
                              }
                        },
                        populate:{
                            primary_companies:{
                                fields:['name'],
                                populate:{
                                    logo:true,
                                },
                                filters:{
                                    publishedAt:{
                                        $notNull:true,
                                    }
                                }
                            },
                            industry:{
                                filters:{
                                    publishedAt:{
                                        $notNull:true,
                                    }
                                }
                            },
    
                        },
                       
                    }
                );

                const orderedArticles = articleIds.map(id=> entries.find(article => article.id === id))
                                                  .filter(article => article!== undefined);

                const totalEntries = await strapi.entityService.count('api::article.article',{
                    filters:{
                        id:{$in:articleIds},
                        publishedAt:{
                            $notNull:true,
                          }
                    }
                });
        

            const meta={
                page:pageNumber,
                pageSize:pageSizeNumber,
                pageCount:Math.ceil(totalEntries/pageSizeNumber),
                total:totalEntries,
              }

        return {data:orderedArticles,meta:meta};
        } catch(err){
            return err;
        }
    }
});
