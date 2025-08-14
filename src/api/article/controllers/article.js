// @ts-nocheck
'use strict';

const likedArticle = require('../../liked-article/services/liked-article');

/**
 * article controller
 */

const { createCoreController } = require('@strapi/strapi').factories;
const moment = require('moment-timezone');

module.exports = createCoreController('api::article.article',{

    countWordsInFieldsOfRelatedArticles(article){
        let totalWordCount = 0;
      
        //count words in brief
      
        // console.log(article.data.attributes.brief);
        // console.log(article);
        // console.log('from function');
        if(article.brief){
            article.brief.forEach(brief => {
                totalWordCount += brief.point.split(' ').length;
            });

            delete article.brief;
        }
        console.log(totalWordCount);
      
      
      
        //count words table-with_content
        if(article?.table_with_content){
            article?.table_with_content?.forEach(toc =>{
                totalWordCount += toc?.tablePoint.split(' ').length;
      
                
      
                toc?.ques?.forEach(ques=>{
                    // console.log(ques);
                    totalWordCount += ques?.question.split(' ').length;
                    totalWordCount += ques?.answer.split(' ').length;
                })
            });

            delete article?.table_with_content;
        }
      
        console.log(totalWordCount);
      
        const readTime = Math.ceil(totalWordCount/process.env.WPM);
        return readTime;
    },

    
    countWordsInFields(article){
        let totalWordCount = 0;

        //count words in brief

        // console.log(article.data.attributes.brief);
        if(article.data.attributes.brief){
            article.data.attributes.brief.forEach(brief => {
                totalWordCount += brief.point.split(' ').length;
            });
        }
        // console.log(totalWordCount);

        //count words table-with_content
        if(article?.data?.attributes?.table_with_content){
            article?.data?.attributes?.table_with_content?.forEach(toc =>{
                totalWordCount += toc?.tablePoint?.split(' ').length;

                

                toc?.ques?.forEach(ques=>{
                    // console.log(ques);
                    totalWordCount += ques?.question.split(' ').length;
                    totalWordCount += ques?.answer.split(' ').length;
                })
            });
        }

        // console.log(totalWordCount);

        const readTime = Math.ceil(totalWordCount/process.env.WPM);
        return readTime;

    },


    async find(ctx){

        const {user}=ctx.state;
        if(!user)
        {
            return ctx.unauthorized("Please login in");
        }
        
        

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

    // console.log(startOfCurrentMonth);
    // console.log(startOfPreviousMonth);

    // Helper function to perform the article query
    const getArticles = async (startDate) => {
        ctx.query = {
            ...ctx.query,
            locale: 'en',
            populate: {
                industry: {
                    fields: ['name'],
                    filters:{
                        publishedAt:{
                            $notNull:true,
                        }
                    }
                },
                primary_companies: {
                    fields: ['name'],
                    populate: {
                        logo: true,
                    },
                    filters:{
                        publishedAt:{
                            $notNull:true,
                        }
                    }
                }
            },
            sort: [...(ctx.request.query.sort || []),'publishedAt:desc','id:desc'],
            filters: {
                ...ctx.request.query.filters,
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
    let source = "this_month";

    // console.log("fetching articles from pervious month");
    // let articles = await getArticles(startOfPreviousMonth);
    // let source = "last_month";

    // let articles = await getArticles(startOfPreviousMonth);

    // If articles of current month is less than 5, query for the previous month's articles
    if (!articles.data || articles.data.length === 0) {
        console.log("fetching articles from pervious month");
        articles = await getArticles(startOfPreviousMonth);
        source = "last_month";
    }

        const articleIds = articles.data.map(a=>a.id);


        const bookmarkedArticles = await strapi.entityService.findMany('api::bookmark.bookmark', {
        filters: {
            bookmarked_by: user.id,
            article:{
                id:{
                    $in:articleIds,
                }
            }
        },
        populate:{
            article:true,
        },
        limit:-1,
    });



    const BookmarkArticleIds = bookmarkedArticles.map(bookmark => bookmark.article.id);

    // console.log(BookmarkArticleIds);

    // fetch already read articles

    const readArticles = await strapi.entityService.findMany('api::read-article.read-article',{
        filters:{
            user: user.id,
            article:{
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


    const articleWithBookmarkStatus = articles.data.map(article =>({
            ...article,
            isBookmarked:BookmarkArticleIds.includes(article.id),
            isRead:readArticleIds.includes(article.id),
    }));


    return {
        data:articleWithBookmarkStatus,
        source,
        meta:articles.meta
    };
       

    },


   

    async findOne(ctx) {
        const { user } = ctx.state;
        if (!user) {
            console.log("logged out during fetching transcript ",user);
            return ctx.unauthorized("you must be logged in");
        }

        const userDetails = await strapi.query('plugin::users-permissions.user').findOne({
            where: {email: user.email},
            populate:{articlesOpenedToday:{
                populate:{
                    article:true,
                }
            }}
            });

           

            // console.log(userDetails);


            if(userDetails.Type ==='Trial'){

                let DailyLimit=userDetails.DailyLimit;
                let TotalLimit=userDetails.TotalLimit;
                let OpensToday=userDetails.OpensToday;

                if(DailyLimit == null)
                {
                    DailyLimit = 30;
                }
                if(TotalLimit == null)
                {
                    TotalLimit = 100;
                }
                if(OpensToday == null)
                {
                    OpensToday = 0;
                }




                    // Get current date and time in Asia/Kolkata timezone
                const currentDate = moment().tz('Asia/Kolkata').startOf('day'); // Start of the day (00:00:00)
                // console.log(currentDate);

                // Filter articlesOpenedToday to keep only today's entries
                let hasOpenedAnyToday = userDetails.articlesOpenedToday?.filter((entry) => {
                const entryDate = moment(entry.time).tz('Asia/Kolkata').startOf('day'); // Start of the day for the entry's date
                // console.log(entryDate);
                return entryDate.isSame(currentDate);
                }) || [];
                
                 //console.log(articlesOpenedToday);
    
                if(hasOpenedAnyToday.length==0){
                    OpensToday=0;
                }


                const isArticleAlreadyOpened = userDetails.articlesOpenedToday?.some(entry => entry.article?.id == ctx.params.id);

    
               // console.log('article already opened',isArticleAlreadyOpened);

                let updatedEntries;

                let existingEntries = userDetails.articlesOpenedToday.map(entry => ({
                    article: entry.article.id, 
                    time: entry.time
                }));

                



                if (isArticleAlreadyOpened) {
                    updatedEntries = existingEntries;
                } else {
                    // Check trial limit before adding a new entry

                    if(OpensToday>=DailyLimit)
                        {
                            console.log('Daily limit exceeded');
                            return ctx.badRequest('Daily limit exceeded. Please contact us for further assistance.');
                        }

                        
                    if (TotalLimit <= 0) {
                        console.log('Trial limit exceeded');
                        return ctx.badRequest('Trial access limit exceeded. Please contact us for further assistance.');
                    }
                
                    // Create new entry
                    const newEntry = {
                        article: ctx.params.id,
                        time: moment().tz('Asia/Kolkata').format(),
                    };
                
                    // Append new entry while keeping existing ones
                    updatedEntries = [...existingEntries, newEntry];
                
                    // Update limits
                    OpensToday += 1;
                    TotalLimit -= 1;
                }
    
                // Update the user with the updated articlesOpenedToday
                const updatedUser = await strapi.entityService.update('plugin::users-permissions.user', userDetails.id, {
                data: {
                    articlesOpenedToday:updatedEntries,
                    OpensToday:OpensToday,
                    TotalLimit:TotalLimit,
                    DailyLimit:DailyLimit,
                },
                });

            }

    
             
    
        ctx.query = {
            ...ctx.query,
            locale: 'en',
            populate: {
                brief: true,
                industry: {
                    fields: ['name'],
                    filters:{
                        publishedAt:{
                            $notNull:true,
                        }
                    }
                },
                sub_industries: {
                    fields: ['name'],
                    filters:{
                        publishedAt:{
                            $notNull:true,
                        }
                    }
                },
                primary_companies: {
                    fields: ['name'],
                    populate: {
                        logo: true,
                    },
                    filters:{
                        publishedAt:{
                            $notNull:true,
                        }
                    }
                },
                secondary_companies: {
                    fields: ['name'],
                    populate: {
                        logo: true,
                    },
                    filters:{
                        publishedAt:{
                            $notNull:true,
                        }
                    }
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

        // console.log(article);
    
        if (article.data.attributes.publishedAt == null) {
            return ctx.badRequest("No Transcript found");
        }

        // console.log(article);

    //    const read_time=this.countWordsInFields(article);

        
    
    
        // Fetching bookmarked, liked, and disliked articles for the user
        const [bookmarkedArticles, likedArticles, dislikedArticles,ReadArticles] = await Promise.all([
            strapi.entityService.findMany('api::bookmark.bookmark', {
                filters: { bookmarked_by: user.id,article:article.data.id },
                populate: { article: true }
            }),
            strapi.entityService.findMany('api::liked-article.liked-article', {
                filters: { user: user.id, publishedAt: { $notNull: true },article:article.data.id },
                populate: { article: true }
            }),
            strapi.entityService.findMany('api::disliked-article.disliked-article', {
                filters: { user: user.id, publishedAt: { $notNull: true },article:article.data.id },
                populate: { article: true }
            }),
            strapi.entityService.findMany('api::read-article.read-article', {
                filters: { user: user.id, publishedAt: { $notNull: true },article:article.data.id },
                populate: { article: true }
            })
        ]);

        // console.log(ReadArticles);

        // const [bookmarkedArticles, likedArticles, dislikedArticles] = await Promise.all([
        //     strapi.entityService.findMany('api::bookmark.bookmark', {
        //         filters: { bookmarked_by: user.id },
        //         populate: { article: true }
        //     }),
        //     strapi.entityService.findMany('api::liked-article.liked-article', {
        //         filters: { user: user.id, publishedAt: { $notNull: true } },
        //         populate: { article: true }
        //     }),
        //     strapi.entityService.findMany('api::disliked-article.disliked-article', {
        //         filters: { user: user.id, publishedAt: { $notNull: true } },
        //         populate: { article: true }
        //     })
        // ]);
    
        const BookmarkArticleIds = bookmarkedArticles.map(bookmark => bookmark.article.id);
        const LikeArticleIds = likedArticles.map(likedArticle => likedArticle.article.id);
        const DisLikeArticleIds = dislikedArticles.map(dislikedArticle => dislikedArticle.article.id);
        const ReadArticleIds = ReadArticles.map(readArticle => readArticle.article.id);
    
        // Adding bookmark status to related articles
        // const articleWithBookmarkStatus = RelatedArticlesWithReadTime.map(article => ({
        //     ...article,
        //     isBookmarked: BookmarkArticleIds.includes(article.id),
        // }));
    
        // article.data.attributes.relatedArticles = articleWithBookmarkStatus;
    
        // Adding like/dislike/bookmark status to the current article
        article.data.attributes.isLiked = LikeArticleIds.includes(article.data.id);
        article.data.attributes.isDisiked = DisLikeArticleIds.includes(article.data.id);
        article.data.attributes.isBookmarked = BookmarkArticleIds.includes(article.data.id);
        // article.data.attributes.read_time = read_time;
        article.data.attributes.isRead = ReadArticleIds.includes(article.data.id);;
    
        return article;
    }
        
    });
