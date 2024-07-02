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
        
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        ctx.query = {
            ...ctx.query,
            locale:'en',
            populate:{
                industry:{
                    fields:['name'],
                },
                primary_companies:{
                    fields:['name'],
                    populate:{
                        logo:true,
                    }
                }
            },
            sort:['publishedAt:desc'],
            filters: {
                publishedAt: {
                  $gte: oneMonthAgo.toISOString(),
                },
              },
        };
 
        const articles = await super.find(ctx);

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

        //below code are is useful if we want to show that article is already read or not with each article

    //     const articleIds = articles.data.map(article => article.id);
        

    // // Fetch read-articles for the current user and these articles using entityService.findMany
    // const readArticles = await strapi.entityService.findMany('api::read-article.read-article', {
    //     filters: {
    //         user: user.id,
    //         article:{
    //             id:articleIds,
    //         },
    //     },
    //     populate:{
    //         article:true,
    //     }
    // });

    // console.log(articleIds);

    // // Create a set of read article IDs for faster lookup
    // const readArticleIds = new Set(readArticles.map(read => read.article.id));

    // // Add read attribute to each article

    
    // const articlesWithReadStatus = articles.data.map(article => {
    //     return {
    //         ...article,
    //      read: readArticleIds.has(article.id),
 
            
    //     };
    // });

    // return {...articles,"data":articlesWithReadStatus};

    return {
        data:articleWithBookmarkStatus,
        meta:articles.meta
    };
       

    },


    //for single article fetch we have to poplulate all the data from backend 

    async findOne(ctx){
        const {user}=ctx.state;
        if(!user)
        {
            return ctx.unauthorized("you must be logged in");
        }
        
        ctx.query = {
            ...ctx.query,
            locale:'en',
            populate:{
                brief:true,
                industry:{
                    fields:['name','articles'],                   
                },
                sub_industries:{
                    fields:['name'],                   
                },
                primary_companies:{
                    fields:['name'],
                    populate:{
                        logo:true,
                    }
                },
                secondary_companies:{
                    fields:['name'],
                    populate:{
                        logo:true,
                    }
                },
                table_with_content:{
                    populate:{
                        ques:true,
                    }
                }
            },
        };
 
        const article = await super.findOne(ctx);
       

        const primaryCompanies = article.data.attributes.primary_companies.data.map(company => company.id);
        const secondaryCompanies = article.data.attributes.secondary_companies.data.map(company => company.id);
        const currentArticleId = article.data.id;

              // Fetch articles for primary companies
    const primaryArticlesPromises = primaryCompanies.map(async (company) => {
        const companyWithArticles = await strapi.entityService.findOne(
            'api::company.company',company,
            {
                populate:{
                    articles:{
                        populate:{
                            primary_companies:{
                                fields:['name'],
                                populate:{
                                    logo:true,
                                }
                            },
                        }
                       
                    },
                    secondary_articles:
                    {
                        populate:{
                            primary_companies:{
                                fields:['name'],
                                populate:{
                                    logo:true,
                                }
                            },
                        }
                    },
                },
            }
        );
        return {
            articles: companyWithArticles.articles,
            secondary_articles: companyWithArticles.secondary_articles,
        };
    });
    const primaryArticlesResults = await Promise.all(primaryArticlesPromises);

    // Combine all articles from primary companies
    let primaryArticles = primaryArticlesResults.flatMap(result => [...result.articles, ...result.secondary_articles]);

    primaryArticles = primaryArticles.filter(x => x.id!= currentArticleId);

    article.data.attributes.relatedArticles = primaryArticles;


    return article;
    },

        
    });
