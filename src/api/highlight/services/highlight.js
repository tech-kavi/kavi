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
                        sort:[...ctx.request.query.sort,'publishedAt:desc'],
                       
                    }
                );

                let orderedArticles=entries.filter(article => article!== undefined);

                console.log(orderedArticles);
                // console.log(ctx.request.query.sort[0]);
                if(ctx.request.query.sort[0] !=='')
                {
                    orderedArticles = articleIds
                    .map(id => entries.find(article => article.id === id))
                    .filter(article => article !== undefined);
                }

                console.log(orderedArticles);
                
                   // Merge highlights into articles
        for (const article of orderedArticles) {
            const articleId = article.id;

            // Fetch highlights for the article
            const articleHighlights = await strapi.entityService.findMany(
                "api::highlight.highlight",
                {
                    filters: {
                        user: userId,
                        articleId: articleId,
                    },
                    limit: -1,
                    sort: 'answerId:asc',
                }
            );

            // Group and merge highlights
            const groupedHighlights = articleHighlights.reduce((acc, highlight) => {
                const { answerId, type } = highlight;

                if (!acc[answerId]) {
                    acc[answerId] = [];
                }

                acc[answerId].push(highlight);
                return acc;
            }, {});

            const mergeRanges = (ranges) => {
                if (!ranges.length) return [];
                ranges.sort((a, b) => a.start - b.start);

                const merged = [];
                for (const current of ranges) {
                    const last = merged[merged.length - 1];
                    if (last && current.start <= last.end) {
                        last.end = Math.max(last.end, current.end);
                        last.text = `${last.text} ${current.text}`;
                    } else {
                        merged.push({ ...current });
                    }
                }
                return merged;
            };

            const mergedHighlights = Object.entries(groupedHighlights).map(([answerId, items]) => {
                const questions = mergeRanges(items.filter(item => item.type === "ques"));
                const answers = mergeRanges(items.filter(item => item.type === "answer"));

                return {
                    answerId,
                    highlights: [...questions, ...answers],
                };
            });

            // Attach merged highlights to the article
            article.mergedHighlights = mergedHighlights;
        }
            
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
