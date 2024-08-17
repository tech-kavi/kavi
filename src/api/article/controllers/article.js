// @ts-nocheck
'use strict';

const likedArticle = require('../../liked-article/services/liked-article');

/**
 * article controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::article.article',{
    async find(ctx){

        const {user}=ctx.state;
        if(!user)
        {
            return ctx.unauthorized("you must be logged in");
        }
        
        // const oneMonthAgo = new Date();
        // oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        // ctx.query = {
        //     ...ctx.query,
        //     locale:'en',
        //     populate:{
        //         industry:{
        //             fields:['name'],
        //         },
        //         primary_companies:{
        //             fields:['name'],
        //             populate:{
        //                 logo:true,
        //             }
        //         }
        //     },
        //     sort:['publishedAt:desc'],
        //     filters: {
        //         publishedAt: {
        //           $gte: oneMonthAgo.toISOString(),
        //         },
        //       },
        // };
 
        // const articles = await super.find(ctx);

          // Function to get the start of a month in IST
    const getISTStartOfMonth = (year, month) => {
        const date = new Date(Date.UTC(year, month, 1, 0, 0, 0)); // First day of the month at UTC
        date.setHours(date.getHours() + 5); // Convert to IST
        date.setMinutes(date.getMinutes() + 30);
        return date;
    };

    const currentDate = new Date();
    const startOfCurrentMonth = getISTStartOfMonth(currentDate.getFullYear(), currentDate.getMonth());
    const startOfPreviousMonth = getISTStartOfMonth(currentDate.getFullYear(), currentDate.getMonth() - 1);

    console.log(startOfCurrentMonth);
    console.log(startOfPreviousMonth);

    // Helper function to perform the article query
    const getArticles = async (startDate) => {
        ctx.query = {
            ...ctx.query,
            locale: 'en',
            populate: {
                industry: {
                    fields: ['name'],
                },
                primary_companies: {
                    fields: ['name'],
                    populate: {
                        logo: true,
                    }
                }
            },
            sort: ['publishedAt:desc'],
            filters: {
                publishedAt: {
                    $gte: startDate.toISOString(),
                    $notNull:true,//ensuring the article is published
                },
            },
        };

        return await super.find(ctx);
    };

    // Initial query for the current month's articles
    let articles = await getArticles(startOfCurrentMonth);

    // If no articles are found, query for the previous month's articles
    if (articles.data.length === 0) {
        console.log("fetching articles from pervious month")
        articles = await getArticles(startOfPreviousMonth);
    }


        const bookmarkedArticles = await strapi.entityService.findMany('api::bookmark.bookmark', {
        filters: {
            bookmarked_by: user.id,
        },
        populate:{
            article:true,
        }
    });



    const BookmarkArticleIds = bookmarkedArticles.map(bookmark => bookmark.article.id);

    // console.log(BookmarkArticleIds);

    const articleWithBookmarkStatus = articles.data.map(article =>({
            ...article,
            isBookmarked:BookmarkArticleIds.includes(article.id),
    }));


    return {
        data:articleWithBookmarkStatus,
        meta:articles.meta
    };
       

    },


    //for single article fetch we have to poplulate all the data from backend 

    // async findOne(ctx){
    //     const {user}=ctx.state;
    //     if(!user)
    //     {
    //         return ctx.unauthorized("you must be logged in");
    //     }
    //     const currentArticleId = ctx.params.id;
        
    //     ctx.query = {
    //         ...ctx.query,
    //         locale:'en',
    //         populate:{
    //             brief:true,
    //             industry:{
    //                 fields:['name','articles'],                   
    //             },
    //             sub_industries:{
    //                 fields:['name'],                   
    //             },
    //             primary_companies:{
    //                 fields:['name'],
    //                 populate:{
    //                     logo:true,
    //                 }
    //             },
    //             secondary_companies:{
    //                 fields:['name'],
    //                 populate:{
    //                     logo:true,
    //                 }
    //             },
    //             table_with_content:{
    //                 populate:{
    //                     ques:true,
    //                 }
    //             }
    //         },
    //         fitlers:{
    //             // ...ctx.request.query.filters,
    //             publishedAt:{
    //                 $notNull:true,
    //             }
    //         }
    //     };
 
    //     const article = await super.findOne(ctx);

    //     if(article.data.attributes.publishedAt==null)
    //     {
    //         return ctx.badRequest("No article found");
    //     }
       

    //     const primaryCompanies = article.data.attributes.primary_companies.data.map(company => company.id);
    //     const secondaryCompanies = article.data.attributes.secondary_companies.data.map(company => company.id);
       

    //           // Fetch articles & secondary articles for primary companies 
    // const primaryArticlesPromises = primaryCompanies.map(async (company) => {
    //     const companyWithArticles = await strapi.entityService.findOne(
    //         'api::company.company',company,
    //         {
    //             populate:{
    //                 articles:{
    //                     populate:{
    //                         primary_companies:{
    //                             fields:['name'],
    //                             populate:{
    //                                 logo:true,
    //                             }
    //                         },
    //                         industry:true,
    //                     },
    //                     filters:{
    //                         publishedAt:{
    //                             $notNull:true,
    //                         },
    //                     },
                       
    //                 },
    //                 secondary_articles:
    //                 {
    //                     populate:{
    //                         primary_companies:{
    //                             fields:['name'],
    //                             populate:{
    //                                 logo:true,
    //                             },
    //                             filters:{
    //                                 publishedAt:{
    //                                     $notNull:true,
    //                                 },
    //                             },
    //                         },
    //                         industry:true,
    //                     },
    //                     filters:{
    //                         publishedAt:{
    //                             $notNull:true,
    //                         }
    //                     }
    //                 },
    //             },
    //             filters:{
    //                 publishedAt:{
    //                     $notNull:true,
    //                 }
    //             }
    //         }
    //     );
    //     return {
    //         articles: companyWithArticles.articles,
    //         secondary_articles: companyWithArticles.secondary_articles,
    //     };
    // });
    // const primaryArticlesResults = await Promise.all(primaryArticlesPromises);

    // // Combine all articles from primary companies
    // let primaryArticles = primaryArticlesResults.flatMap(result => [...result.articles, ...result.secondary_articles]);

    // primaryArticles = primaryArticles.filter(x => x.id!= currentArticleId);

    // //fetching bookmarked articles of user
    // const bookmarkedArticles = await strapi.entityService.findMany('api::bookmark.bookmark', {
    //     filters: {
    //         bookmarked_by: user.id,
    //     },
    //     populate:{
    //         article:true,
    //     }
    // });

    // //fetching liked articles of user

    // const likedArticles = await strapi.entityService.findMany('api::liked-article.liked-article', {
    //     filters: {
    //         user: user.id,
    //         publishedAt:{
    //             $notNull:true,
    //         },
    //     },
    //     populate:{
    //         article:true,
    //     }
    // });

    // const dislikedArticles = await strapi.entityService.findMany('api::disliked-article.disliked-article', {
    //     filters: {
    //         user: user.id,
    //         publishedAt:{
    //             $notNull:true,
    //         },
    //     },
    //     populate:{
    //         article:true,
    //     }
    // });


    // const BookmarkArticleIds = bookmarkedArticles.map(bookmark => bookmark.article.id);
    // const LikeArticleIds = likedArticles.map(likedArticle => likedArticle.article.id);
    // const DisLikeArticleIds = dislikedArticles.map(dislikedArticle => dislikedArticle.article.id);

    // // console.log(LikeArticleIds);
    // //putting bookmark status of each article
    // const articleWithBookmarkStatus = primaryArticles.map(article =>({
    //         ...article,
    //         isBookmarked:BookmarkArticleIds.includes(article.id),
    // }));

   


    // article.data.attributes.relatedArticles = articleWithBookmarkStatus;

    // article.data.attributes.isLiked = LikeArticleIds.includes(article.data.id);
    // article.data.attributes.isDisiked = DisLikeArticleIds.includes(article.data.id);
    // article.data.attributes.isBookmarked= BookmarkArticleIds.includes(article.data.id);
    // return article;
    // },

    async findOne(ctx) {
        const { user } = ctx.state;
        if (!user) {
            return ctx.unauthorized("you must be logged in");
        }
    
        const currentArticleId = ctx.params.id;
    
        ctx.query = {
            ...ctx.query,
            locale: 'en',
            populate: {
                brief: true,
                industry: {
                    fields: ['name', 'articles'],
                    // filters:{
                    //     publishedAt:{
                    //         $notNull:true,
                    //     }
                    // }
                },
                sub_industries: {
                    fields: ['name'],
                    // filters:{
                    //     publishedAt:{
                    //         $notNull:true,
                    //     }
                    // }
                },
                primary_companies: {
                    fields: ['name'],
                    populate: {
                        logo: true,
                    },
                    // filters:{
                    //     publishedAt:{
                    //         $notNull:true,
                    //     }
                    // }
                },
                secondary_companies: {
                    fields: ['name'],
                    populate: {
                        logo: true,
                    },
                    // filters:{
                    //     publishedAt:{
                    //         $notNull:true,
                    //     }
                    // }
                },
                table_with_content: {
                    populate: {
                        ques: true,
                    }
                }
            },
            filters: {
                publishedAt: {
                    $notNull: true,
                }
            }
        };
    
        const article = await super.findOne(ctx);
    
        if (article.data.attributes.publishedAt == null) {
            return ctx.badRequest("No article found");
        }
    
        const primaryCompanies = article.data.attributes.primary_companies.data.map(company => company.id);
    
        // Fetching articles & secondary articles for primary companies 
        const primaryArticlesPromises = primaryCompanies.map(async (company) => {
            const companyWithArticles = await strapi.entityService.findOne(
                'api::company.company', company,
                {
                    populate: {
                        articles: {
                            populate: {
                                primary_companies: {
                                    fields: ['name'],
                                    populate: {
                                        logo: true,
                                    }
                                },
                                industry: true,
                            },
                            filters: {
                                publishedAt: {
                                    $notNull: true,
                                },
                            },
    
                        },
                        secondary_articles: {
                            populate: {
                                primary_companies: {
                                    fields: ['name'],
                                    populate: {
                                        logo: true,
                                    }
                                },
                                industry: true,
                            },
                            filters: {
                                publishedAt: {
                                    $notNull: true,
                                }
                            }
                        },
                    }
                }
            );
            return {
                articles: companyWithArticles.articles,
                secondary_articles: companyWithArticles.secondary_articles,
            };
        });
    
        const primaryArticlesResults = await Promise.all(primaryArticlesPromises);
    
        let relatedArticles = primaryArticlesResults.flatMap(result => [...result.articles, ...result.secondary_articles]);
        relatedArticles = relatedArticles.filter(x => x.id != currentArticleId);
    
        // Fetch sub-industry and industry articles only if sub-industry is not "Miscellaneous"
        const subIndustry = article.data.attributes.sub_industries.data[0]?.attributes.name;
        if (subIndustry && subIndustry !== "Miscellaneous") {
            // If we don't have enough articles, fetch sub-industry articles
            if (relatedArticles.length < 3) {
                const subIndustryArticles = await strapi.entityService.findMany('api::article.article', {
                    filters: {
                        sub_industries: { name: subIndustry },
                        publishedAt: { $notNull: true },
                        id: { $ne: currentArticleId }
                    },
                    populate: {
                        primary_companies: {
                            fields: ['name'],
                            populate: { logo: true }
                        },
                        industry: true
                    }
                });
                relatedArticles.push(...subIndustryArticles);
            }
    
            // If we still don't have 3 articles, fetch industry articles
            if (relatedArticles.length < 3) {
                const industry = article.data.attributes.industry.data?.attributes.name;
                if (industry) {
                    const industryArticles = await strapi.entityService.findMany('api::article.article', {
                        filters: {
                            industry: { name: industry },
                            publishedAt: { $notNull: true },
                            id: { $ne: currentArticleId }
                        },
                        populate: {
                            primary_companies: {
                                fields: ['name'],
                                populate: { logo: true }
                            },
                            industry: true
                        }
                    });
                    relatedArticles.push(...industryArticles);
                }
            }
        }

        console.log(relatedArticles);

        // //remove duplicate articles by ID using a Set
        relatedArticles = Array.from(new Set(relatedArticles.map(article => article.id)))
        .map(id => relatedArticles.find(article => article.id === id));

        // Sort related articles by latest publishedAt date
    relatedArticles = relatedArticles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    
        // Ensure only 3 related articles are returned
        relatedArticles = relatedArticles.slice(0, 3);
    
        // Fetching bookmarked, liked, and disliked articles for the user
        const [bookmarkedArticles, likedArticles, dislikedArticles] = await Promise.all([
            strapi.entityService.findMany('api::bookmark.bookmark', {
                filters: { bookmarked_by: user.id },
                populate: { article: true }
            }),
            strapi.entityService.findMany('api::liked-article.liked-article', {
                filters: { user: user.id, publishedAt: { $notNull: true } },
                populate: { article: true }
            }),
            strapi.entityService.findMany('api::disliked-article.disliked-article', {
                filters: { user: user.id, publishedAt: { $notNull: true } },
                populate: { article: true }
            })
        ]);
    
        const BookmarkArticleIds = bookmarkedArticles.map(bookmark => bookmark.article.id);
        const LikeArticleIds = likedArticles.map(likedArticle => likedArticle.article.id);
        const DisLikeArticleIds = dislikedArticles.map(dislikedArticle => dislikedArticle.article.id);
    
        // Adding bookmark status to related articles
        const articleWithBookmarkStatus = relatedArticles.map(article => ({
            ...article,
            isBookmarked: BookmarkArticleIds.includes(article.id),
        }));
    
        article.data.attributes.relatedArticles = articleWithBookmarkStatus;
    
        // Adding like/dislike/bookmark status to the current article
        article.data.attributes.isLiked = LikeArticleIds.includes(article.data.id);
        article.data.attributes.isDisiked = DisLikeArticleIds.includes(article.data.id);
        article.data.attributes.isBookmarked = BookmarkArticleIds.includes(article.data.id);
    
        return article;
    }
        
    });
