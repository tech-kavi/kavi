// @ts-nocheck
'use strict';

/**
 * watchlist-articles service
 */

module.exports = {
    find:async(userId,page,pageSize,ctx)=>{
        try{
           
            const watchlistEntries = await strapi.entityService.findMany(
                "api::watchlist.watchlist",
                {
                    filters:{watchlisted_by:userId},
                    populate:{company:true}
                }
            );

            // extract company IDs from the watchlist entries
            const companyIds = watchlistEntries.map(entry => entry.company.id);
           
            if(companyIds.length===0)
                {
                    return [];
                }

                const pageNumber = parseInt(page);
                const pageSizeNumber = parseInt(pageSize);
                 
                const start = (pageNumber-1)*pageSizeNumber;
            //fetch articles based on the extracted company IDs

            const getDateThreeMonthsAgoIST = () => {
                const currentDate = new Date();
            
                // Calculate the date 3 months prior
                const threeMonthsAgo = new Date(currentDate);
                threeMonthsAgo.setMonth(currentDate.getMonth() - 3);
            
                // Adjust for IST (UTC +5:30)
                threeMonthsAgo.setHours(threeMonthsAgo.getHours() + 5);
                threeMonthsAgo.setMinutes(threeMonthsAgo.getMinutes() + 30);
            
                return threeMonthsAgo;
            };
            
            const dateThreeMonthsAgoIST = getDateThreeMonthsAgoIST();
            console.log(dateThreeMonthsAgoIST);

            const entries = await strapi.entityService.findMany(
                'api::article.article',
                {
                    start:start,
                    limit:pageSizeNumber,
                    filters:{
                        primary_companies:{id:{$in:companyIds}},
                        publishedAt:{
                            $notNull:true,
                            $gte: dateThreeMonthsAgoIST,
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
                    sort:[...ctx.request.query.sort,'publishedAt:desc'],
                }
            );

            //  console.log(entries);
                
            const totalEntries = await strapi.entityService.count('api::article.article',{
                filters:{
                    primary_companies:{id:{$in:companyIds}},
                    publishedAt:{
                        $notNull:true,
                        $gte: dateThreeMonthsAgoIST,
                      }
                }
            });

            // console.log(totalEntries);

            const articleIds = entries.map(a=>a.id);

            const bookmarkedArticles = await strapi.entityService.findMany('api::bookmark.bookmark', {
                filters: {
                    bookmarked_by: userId,
                    article:
                        {
                            id:{
                            $in:articleIds,
                            },
                             publishedAt:{
                                    $notNull:true,
                                }
                        },
                },
                populate:{
                    article:true,
                },
                limit:-1,
            });

           

            const BookmarkArticleIds = bookmarkedArticles.map(bookmark => bookmark.article.id);

            //fetch already read articles

      const readArticles = await strapi.entityService.findMany('api::read-article.read-article',{
          filters:{
              user: userId,
               article: {
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

      

        const watchlistArticlesWithBookmarkStatus = entries.map(article =>({
                ...article,
                isBookmarked:BookmarkArticleIds.includes(article.id),
                isRead:readArticleIds.includes(article.id),
        }));
        

            const meta={
                page:pageNumber,
                pageSize:pageSizeNumber,
                pageCount:Math.ceil(totalEntries/pageSizeNumber),
                total:totalEntries,
              }

        return {data:watchlistArticlesWithBookmarkStatus,meta:meta};
        } catch(err){
            return err;
        }
    }
}
