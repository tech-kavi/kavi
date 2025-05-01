'use strict';

/**
 * shared-highlight service
 */

// @ts-ignore
const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::shared-highlight.shared-highlight',{
    find:async(userId,page,pageSize,ctx)=>{
        try{
            
            const sharedHighlights = await strapi.entityService.findMany(
                "api::shared-highlight.shared-highlight",
                {
                    filters:{
                        recipient: userId,
                    },
                   sort:'publishedAt:desc',
                }
            );

            

            console.log(sharedHighlights);
            
              // extract article IDs from the watchlist entries
              let articleIds = sharedHighlights.map(entry => parseInt(entry.articleId));
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
                        sort:[...ctx.request.query.sort],
                       
                    }
                );

                let orderedArticles=entries.filter(article => article!== undefined);

                // console.log(orderedArticles);
                // console.log(ctx.request.query.sort[0]);
                if(ctx.request.query.sort[0] =='')
                {

                    // Create a map of articles with their ID as the key
                     const articleMap = new Map(entries.map(article => [article.id, article]));

                     //console.log(articleMap);
                     orderedArticles = articleIds
                     .map(id => articleMap.get(id))
                     .filter(article => article !== undefined);
                }

                //  console.log(orderedArticles);
                const paginatedArticles = orderedArticles.slice(start, start + pageSizeNumber);
                
                   // Merge highlights into articles
        for (const article of paginatedArticles) {
            const articleId = article.id;

            // Fetch highlights for the article
            const articleHighlights = await strapi.entityService.findMany(
                "api::shared-highlight.shared-highlight",
                {
                    filters: {
                        recipient: userId,
                        articleId: articleId,
                    },
                    populate:['sender'],
                    limit: -1,
                    sort: 'answerId:asc',
                }
            );

            //console.log(articleHighlights);

            // Group and merge highlights
            // const groupedHighlights = articleHighlights.reduce((acc, highlight) => {
            //     const { answerId, type } = highlight;

            //     if (!acc[answerId]) {
            //         acc[answerId] = [];
            //     }

            //     acc[answerId].push(highlight);
            //     return acc;
            // }, {});

            const groupedHighlights = articleHighlights.reduce((acc, highlight) => {
                const { answerId, sender } = highlight;
            
                const key = `${sender?.id || sender}_${answerId}`;
            
                if (!acc[key]) {
                    acc[key] = {
                        sender,
                        answerId,
                        highlights: [],
                    };
                }
            
                acc[key].highlights.push(highlight); // ✅ Properly push into 'highlights' array
                return acc;
            }, {});
            
              

            const mergeRanges = (ranges) => {
                if (!ranges.length) return [];
                ranges.sort((a, b) => a.start - b.start);

                const merged = [];
                for (const current of ranges) {

                    const cleaned={...current};
                    delete cleaned.sender;

                    const last = merged[merged.length - 1];
                    if (last && cleaned.start <= last.end) {
                        last.end = Math.max(last.end, cleaned.end);
                        last.text = `${last.text} ${cleaned.text}`;
                    } else {
                        merged.push({ ...cleaned });
                    }
                }
                return merged;
            };

            // const mergedHighlights = Object.entries(groupedHighlights).map(([answerId, items]) => {
            //     const questions = mergeRanges(items.filter(item => item.type === "ques"));
            //     const answers = mergeRanges(items.filter(item => item.type === "answer"));

            //     return {
            //         answerId,
            //         highlights: [...questions, ...answers],
            //     };
            // });

            const mergedHighlights = Object.values(groupedHighlights).map((group) => {
                const { sender, answerId, highlights } = group;
            
                const questions = mergeRanges(highlights.filter(item => item.type === "ques"));
                const answers = mergeRanges(highlights.filter(item => item.type === "answer"));
            
                return {
                    sender,
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

        return {data:paginatedArticles,meta:meta};
        } catch(err){
            return err;
        }
    }
});
