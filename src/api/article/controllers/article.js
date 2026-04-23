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
                },
                allowed_users:{fields:['id']},
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

    let articles;
    let source;

    const month_details = process.env.month_details;
    console.log(month_details);

    if(month_details == 'startOfCurrentMonth')
    {
        console.log('from current month');
        articles = await getArticles(startOfCurrentMonth);
        source = "this_month";
    }
    else{
        articles = await getArticles(startOfPreviousMonth);
        source = "last_month";
    }

    // Initial query for the current month's articles
    //let articles = await getArticles(startOfCurrentMonth);
    //let source = "this_month";

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

    const articleWithBookmarkStatus = articles.data.map(article =>{
     

        const allowed_users = article.attributes.allowed_users?.data || [];

        const canAccess = allowed_users.length===0 || allowed_users.some(u => u.id == user.id);

        delete article.attributes.allowed_users;
        
        return {
            ...article,
            isBookmarked:BookmarkArticleIds.includes(article.id),
            isRead:readArticleIds.includes(article.id),
            canAccess,
    }});


    return {
        data:articleWithBookmarkStatus,
        source,
        meta:articles.meta
    };
       

    },

   
    // async findOne(ctx) {
    //     const { user } = ctx.state;
    //     if (!user) {
    //         console.log("logged out during fetching transcript ",user);
    //         return ctx.unauthorized("you must be logged in");
    //     }

        
    
             
    
    //     ctx.query = {
    //         ...ctx.query,
    //         locale: 'en',
    //         populate: {
    //             brief: true,
    //             industry: {
    //                 fields: ['name'],
    //                 filters:{
    //                     publishedAt:{
    //                         $notNull:true,
    //                     }
    //                 }
    //             },
    //             sub_industries: {
    //                 fields: ['name'],
    //                 filters:{
    //                     publishedAt:{
    //                         $notNull:true,
    //                     }
    //                 }
    //             },
    //             primary_companies: {
    //                 fields: ['name'],
    //                 populate: {
    //                     logo: true,
    //                 },
    //                 filters:{
    //                     publishedAt:{
    //                         $notNull:true,
    //                     }
    //                 }
    //             },
    //             secondary_companies: {
    //                 fields: ['name'],
    //                 populate: {
    //                     logo: true,
    //                 },
    //                 filters:{
    //                     publishedAt:{
    //                         $notNull:true,
    //                     }
    //                 }
    //             },
    //             table_with_content: {
    //                 populate: {
    //                     ques: true,
    //                 }
    //             },
    //             allowed_users:true,
    //         },

    //         filters: {
    //             publishedAt: {
    //                 $notNull: true,
    //             }
    //         }
    //     };


    
    //     const article = await super.findOne(ctx);

    //     // console.log(article);
    
    //     if (article.data.attributes.publishedAt == null) {
    //         return ctx.badRequest("No Transcript found");
    //     }

        
    //     // ✅ Restrict access if special_users are defined
    //    const allowedUsersData = article.data.attributes.allowed_users?.data || [];
    //     // console.log('Allowed Users:', allowedUsersData);
    //     // console.log('Current User ID:', user.id);

    //     if (allowedUsersData.length > 0) {
    //     const isAllowed = allowedUsersData.some(u => u.id === user.id);
    //     if (!isAllowed) {
    //         return ctx.badRequest('You do not have permission to access this transcript. Please contact us for further assistance.');
    //     }
    //     }


    //     const userDetails = await strapi.query('plugin::users-permissions.user').findOne({
    //         where: {email: user.email},
    //         populate:{articlesOpenedToday:{
    //             populate:{
    //                 article:true,
    //             }
    //         }}
    //         });

       


    //        // ✅ HANDLE BOTH TRIAL & SUBSCRIBER
    // if (userDetails.Type === 'Trial' || userDetails.Type === 'Subscriber') {

    //     let DailyLimit = userDetails.DailyLimit;
    //     let TotalLimit = userDetails.TotalLimit;
    //     let OpensToday = userDetails.OpensToday;

    //     // ✅ Default limits
    //     if (userDetails.Type === 'Trial') {
    //         if (DailyLimit == null) DailyLimit = 30;
    //         if (TotalLimit == null) TotalLimit = 100;
    //     } else if (userDetails.Type === 'Subscriber') {
    //         if (DailyLimit == null || DailyLimit == 30 ) DailyLimit = 50;
    //         TotalLimit = null; // No total limit
    //     }

    //     if (OpensToday == null) OpensToday = 0;

    //     const currentDate = moment().tz('Asia/Kolkata').startOf('day');

    //     let hasOpenedAnyToday = userDetails.articlesOpenedToday?.filter((entry) => {
    //         const entryDate = moment(entry.time).tz('Asia/Kolkata').startOf('day');
    //         return entryDate.isSame(currentDate);
    //     }) || [];

    //     if (hasOpenedAnyToday.length == 0) {
    //         OpensToday = 0;

    //         // ✅previous entries ONLY for Subscriber
    //         if (userDetails.Type === 'Subscriber') {
    //             userDetails.articlesOpenedToday = [];
    //         }
    //     }

    //     const isArticleAlreadyOpened = userDetails.articlesOpenedToday?.some(
    //         entry => entry.article?.id == ctx.params.id
    //     );

    //     let baseEntries = userDetails.articlesOpenedToday || [];

    //     let existingEntries = baseEntries.map(entry => ({
    //         article: entry.article.id,
    //         time: entry.time
    //     }));

    //     let updatedEntries;

    //     if (isArticleAlreadyOpened) {
    //         updatedEntries = existingEntries;
    //     } else {

    //         // ✅ Daily limit (for both)
    //         if (OpensToday >= DailyLimit) {
    //             console.log('Daily limit exceeded');
    //             return ctx.badRequest('Daily limit exceeded.');
    //         }

    //         // ✅ Total limit (ONLY Trial)
    //         if (userDetails.Type === 'Trial' && TotalLimit <= 0) {
    //             console.log('Trial limit exceeded');
    //             return ctx.badRequest('Trial access limit exceeded.');
    //         }

    //         const newEntry = {
    //             article: ctx.params.id,
    //             time: moment().tz('Asia/Kolkata').format(),
    //         };

    //         updatedEntries = [...existingEntries, newEntry];

    //         OpensToday += 1;

    //         // ✅ Decrement ONLY for Trial
    //         if (userDetails.Type === 'Trial') {
    //             TotalLimit -= 1;
    //         }
    //     }

    //     await strapi.entityService.update('plugin::users-permissions.user', userDetails.id, {
    //         data: {
    //             articlesOpenedToday: updatedEntries,
    //             OpensToday,
    //             TotalLimit,
    //             DailyLimit,
    //         },
    //     });
    // }

    
    
    //     // Fetching bookmarked, liked, and disliked articles for the user
    //     const [bookmarkedArticles, likedArticles, dislikedArticles,ReadArticles] = await Promise.all([
    //         strapi.entityService.findMany('api::bookmark.bookmark', {
    //             filters: { bookmarked_by: user.id,article:article.data.id },
    //             populate: { article: true }
    //         }),
    //         strapi.entityService.findMany('api::liked-article.liked-article', {
    //             filters: { user: user.id, publishedAt: { $notNull: true },article:article.data.id },
    //             populate: { article: true }
    //         }),
    //         strapi.entityService.findMany('api::disliked-article.disliked-article', {
    //             filters: { user: user.id, publishedAt: { $notNull: true },article:article.data.id },
    //             populate: { article: true }
    //         }),
    //         strapi.entityService.findMany('api::read-article.read-article', {
    //             filters: { user: user.id, publishedAt: { $notNull: true },article:article.data.id },
    //             populate: { article: true }
    //         })
    //     ]);

     
    
    //     const BookmarkArticleIds = bookmarkedArticles.map(bookmark => bookmark.article.id);
    //     const LikeArticleIds = likedArticles.map(likedArticle => likedArticle.article.id);
    //     const DisLikeArticleIds = dislikedArticles.map(dislikedArticle => dislikedArticle.article.id);
    //     const ReadArticleIds = ReadArticles.map(readArticle => readArticle.article.id);

    
    //     // Adding like/dislike/bookmark status to the current article
    //     article.data.attributes.isLiked = LikeArticleIds.includes(article.data.id);
    //     article.data.attributes.isDisiked = DisLikeArticleIds.includes(article.data.id);
    //     article.data.attributes.isBookmarked = BookmarkArticleIds.includes(article.data.id);
    //     // article.data.attributes.read_time = read_time;
    //     article.data.attributes.isRead = ReadArticleIds.includes(article.data.id);

       
    //     delete article.data.attributes.allowed_users;
        


    
    //     return article;
    // },

    // async findOne(ctx) {
    //     const { user } = ctx.state;
    //     if (!user) {
    //         console.log("logged out during fetching transcript ",user);
    //         return ctx.unauthorized("you must be logged in");
    //     }

        
    
             
    
    //     ctx.query = {
    //         ...ctx.query,
    //         locale: 'en',
    //         populate: {
    //             brief: true,
    //             industry: {
    //                 fields: ['name'],
    //                 filters:{
    //                     publishedAt:{
    //                         $notNull:true,
    //                     }
    //                 }
    //             },
    //             sub_industries: {
    //                 fields: ['name'],
    //                 filters:{
    //                     publishedAt:{
    //                         $notNull:true,
    //                     }
    //                 }
    //             },
    //             primary_companies: {
    //                 fields: ['name'],
    //                 populate: {
    //                     logo: true,
    //                 },
    //                 filters:{
    //                     publishedAt:{
    //                         $notNull:true,
    //                     }
    //                 }
    //             },
    //             secondary_companies: {
    //                 fields: ['name'],
    //                 populate: {
    //                     logo: true,
    //                 },
    //                 filters:{
    //                     publishedAt:{
    //                         $notNull:true,
    //                     }
    //                 }
    //             },
    //             table_with_content: {
    //                 populate: {
    //                     ques: true,
    //                 }
    //             },
    //             allowed_users:true,
    //         },

    //         filters: {
    //             publishedAt: {
    //                 $notNull: true,
    //             }
    //         }
    //     };


    
    //     const article = await super.findOne(ctx);

    //     // console.log(article);
    
    //     if (article.data.attributes.publishedAt == null) {
    //         return ctx.badRequest("No Transcript found");
    //     }

        
    //     // ✅ Restrict access if special_users are defined
    //    const allowedUsersData = article.data.attributes.allowed_users?.data || [];
    //     // console.log('Allowed Users:', allowedUsersData);
    //     // console.log('Current User ID:', user.id);

    //     if (allowedUsersData.length > 0) {
    //     const isAllowed = allowedUsersData.some(u => u.id === user.id);
    //     if (!isAllowed) {
    //         return ctx.badRequest('You do not have permission to access this transcript. Please contact us for further assistance.');
    //     }
    //     }


    //     const userDetails = await strapi.query('plugin::users-permissions.user').findOne({
    //         where: {email: user.email},
    //         populate:{articlesOpenedToday:{
    //             populate:{
    //                 article:true,
    //             }
    //         }}
    //         });

       


    //        // ✅ HANDLE BOTH TRIAL & SUBSCRIBER
    // if (userDetails.Type === 'Trial' || userDetails.Type === 'Subscriber') {

    //     let DailyLimit = userDetails.DailyLimit;
    //     let TotalLimit = userDetails.TotalLimit;
    //     let OpensToday = userDetails.OpensToday;
    //     let WeeklyLimit = userDetails.WeeklyLimit || 75;
    //     let OpensThisWeek = userDetails.OpensThisWeek || 0;
    //     const WeekStartDate = userDetails.WeekStartDate
    //     ? moment.tz(userDetails.WeekStartDate, 'YYYY-MM-DD', 'Asia/Kolkata')
    //     : null;

    // const now = moment().tz('Asia/Kolkata');
    // const currentWeekStart = now.clone().startOf('isoWeek'); // Monday
    // // Format as YYYY-MM-DD for Strapi Date field
    // const formattedWeekStart = currentWeekStart.format('YYYY-MM-DD');

    // if (!WeekStartDate || !WeekStartDate.isSame(currentWeekStart, 'isoWeek')) {
    //     OpensThisWeek = 0;
    // }

    //     // ✅ Default limits
    //     if (userDetails.Type === 'Trial') {
    //         if (DailyLimit == null) DailyLimit = 30;
    //         if (TotalLimit == null) TotalLimit = 100;
    //     } else if (userDetails.Type === 'Subscriber') {
    //         if (DailyLimit == null || DailyLimit == 30 ) DailyLimit = 50;
    //         TotalLimit = null; // No total limit
    //     }

    //     if (OpensToday == null) OpensToday = 0;

    //     const currentDate = moment().tz('Asia/Kolkata').startOf('day');
        

    //     let hasOpenedAnyToday = userDetails.articlesOpenedToday?.filter((entry) => {
    //         const entryDate = moment(entry.time).tz('Asia/Kolkata').startOf('day');
    //         return entryDate.isSame(currentDate);
    //     }) || [];

    //     if (hasOpenedAnyToday.length == 0) {
    //         OpensToday = 0;

    //         // ✅previous entries ONLY for Subscriber
    //         if (userDetails.Type === 'Subscriber') {
    //             userDetails.articlesOpenedToday = [];
    //         }
    //     }

    //     const isArticleAlreadyOpened = userDetails.articlesOpenedToday?.some(
    //         entry => entry.article?.id == ctx.params.id
    //     );

    //     let baseEntries = userDetails.articlesOpenedToday || [];

    //     let existingEntries = baseEntries.map(entry => ({
    //         article: entry.article.id,
    //         time: entry.time
    //     }));

    //     let updatedEntries;

    //     if (isArticleAlreadyOpened) {
    //         updatedEntries = existingEntries;
    //     } else {

    //         // ✅ Daily limit (for both)
    //         if (OpensToday >= DailyLimit) {
    //             console.log('Daily limit exceeded');
    //             return ctx.badRequest('Daily access limit exceeded.');
    //         }

    //         // ✅ Weekly limit check
    //         if (OpensThisWeek >= WeeklyLimit) {
    //             return ctx.badRequest('Weekly access limit exceeded.');
    //         }


    //         // ✅ Total limit (ONLY Trial)
    //         if (userDetails.Type === 'Trial' && TotalLimit <= 0) {
    //             console.log('Trial limit exceeded');
    //             return ctx.badRequest('Trial access limit exceeded.');
    //         }

    //         const newEntry = {
    //             article: ctx.params.id,
    //             time: moment().tz('Asia/Kolkata').format(),
    //         };

    //         updatedEntries = [...existingEntries, newEntry];

    //         OpensToday += 1;
    //         OpensThisWeek +=1;

    //         // ✅ Decrement ONLY for Trial
    //         if (userDetails.Type === 'Trial') {
    //             TotalLimit -= 1;
    //         }
    //     }

    //     await strapi.entityService.update('plugin::users-permissions.user', userDetails.id, {
    //         data: {
    //             articlesOpenedToday: updatedEntries,
    //             OpensToday,
    //             OpensThisWeek,
    //             WeekStartDate:formattedWeekStart,
    //             TotalLimit,
    //             DailyLimit,
    //             WeeklyLimit,
    //         },
    //     });
    // }

    
    
    //     // Fetching bookmarked, liked, and disliked articles for the user
    //     const [bookmarkedArticles, likedArticles, dislikedArticles,ReadArticles] = await Promise.all([
    //         strapi.entityService.findMany('api::bookmark.bookmark', {
    //             filters: { bookmarked_by: user.id,article:article.data.id },
    //             populate: { article: true }
    //         }),
    //         strapi.entityService.findMany('api::liked-article.liked-article', {
    //             filters: { user: user.id, publishedAt: { $notNull: true },article:article.data.id },
    //             populate: { article: true }
    //         }),
    //         strapi.entityService.findMany('api::disliked-article.disliked-article', {
    //             filters: { user: user.id, publishedAt: { $notNull: true },article:article.data.id },
    //             populate: { article: true }
    //         }),
    //         strapi.entityService.findMany('api::read-article.read-article', {
    //             filters: { user: user.id, publishedAt: { $notNull: true },article:article.data.id },
    //             populate: { article: true }
    //         })
    //     ]);

     
    
    //     const BookmarkArticleIds = bookmarkedArticles.map(bookmark => bookmark.article.id);
    //     const LikeArticleIds = likedArticles.map(likedArticle => likedArticle.article.id);
    //     const DisLikeArticleIds = dislikedArticles.map(dislikedArticle => dislikedArticle.article.id);
    //     const ReadArticleIds = ReadArticles.map(readArticle => readArticle.article.id);

    
    //     // Adding like/dislike/bookmark status to the current article
    //     article.data.attributes.isLiked = LikeArticleIds.includes(article.data.id);
    //     article.data.attributes.isDisiked = DisLikeArticleIds.includes(article.data.id);
    //     article.data.attributes.isBookmarked = BookmarkArticleIds.includes(article.data.id);
    //     // article.data.attributes.read_time = read_time;
    //     article.data.attributes.isRead = ReadArticleIds.includes(article.data.id);

       
    //     delete article.data.attributes.allowed_users;
        


    
    //     return article;
    // },


    async findOne(ctx) {
        const { user } = ctx.state;
        if (!user) {
            console.log("logged out during fetching transcript ",user);
            return ctx.unauthorized("you must be logged in");
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
                },
                allowed_users:true,
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

        
        // ✅ Restrict access if special_users are defined
       const allowedUsersData = article.data.attributes.allowed_users?.data || [];
        // console.log('Allowed Users:', allowedUsersData);
        // console.log('Current User ID:', user.id);

        if (allowedUsersData.length > 0) {
        const isAllowed = allowedUsersData.some(u => u.id === user.id);
        if (!isAllowed) {
            return ctx.badRequest('You do not have permission to access this transcript. Please contact us for further assistance.');
        }
        }


        const userDetails = await strapi.query('plugin::users-permissions.user').findOne({
            where: {email: user.email},
            populate:{
                articlesOpenedToday:{
                populate:{
                    article:true,
                }
            },
            articlesOpenedThisWeek:{
                populate:{
                    article:true,
                }
            }
        
        }
            });

        //    console.log(userDetails.articlesOpenedToday);

       


           // ✅ HANDLE BOTH TRIAL & SUBSCRIBER
    if (userDetails.Type === 'Trial' || userDetails.Type === 'Subscriber') {

        let DailyLimit = userDetails.DailyLimit;
        let TotalLimit = userDetails.TotalLimit;
        let OpensToday = userDetails.OpensToday;
        let WeeklyLimit = userDetails.WeeklyLimit || 75;
        let OpensThisWeek = userDetails.OpensThisWeek || 0;
        const WeekStartDate = userDetails.WeekStartDate
        ? moment.tz(userDetails.WeekStartDate, 'YYYY-MM-DD', 'Asia/Kolkata')
        : null;

    const now = moment().tz('Asia/Kolkata');
    const currentWeekStart = now.clone().startOf('isoWeek'); // Monday
    // Format as YYYY-MM-DD for Strapi Date field
    const formattedWeekStart = currentWeekStart.format('YYYY-MM-DD');

    let articlesOpenedThisWeek = userDetails?.articlesOpenedThisWeek||[];

    if (!WeekStartDate || !WeekStartDate.isSame(currentWeekStart, 'isoWeek')) {
        OpensThisWeek = 0;
        articlesOpenedThisWeek=[];
    }

        // ✅ Default limits
        if (userDetails.Type === 'Trial') {
            if (DailyLimit == null) DailyLimit = 30;
            if (TotalLimit == null) TotalLimit = 100;
        } else if (userDetails.Type === 'Subscriber') {
            if (DailyLimit == null || DailyLimit == 30 ) DailyLimit = 50;
            TotalLimit = null; // No total limit
        }

        if (OpensToday == null) OpensToday = 0;

        const currentDate = moment().tz('Asia/Kolkata').startOf('day');
        

        let hasOpenedAnyToday = userDetails.articlesOpenedToday?.filter((entry) => {
            const entryDate = moment(entry.time).tz('Asia/Kolkata').startOf('day');
            return entryDate.isSame(currentDate);
        }) || [];

        if (hasOpenedAnyToday.length == 0) {
            OpensToday = 0;

            // ✅previous entries ONLY for Subscriber
            if (userDetails.Type === 'Subscriber') {
                userDetails.articlesOpenedToday = [];
            }
        }

        const isArticleAlreadyOpened = userDetails.articlesOpenedToday?.some(
            entry => entry.article?.id == Number(ctx.params.id)
        );

        

        const isArticleOpenedThisWeek = articlesOpenedThisWeek?.some(
            entry => entry?.article?.id == Number(ctx.params.id)
        );


        let baseEntries = userDetails.articlesOpenedToday || [];
        

        let existingEntries = baseEntries.map(entry => ({
            article:{
                id:entry.article.id,
            } ,
            time: entry.time
        }));


        let weeklyEntries = articlesOpenedThisWeek.map(entry => ({
            article: {
                id:entry.article.id,
            } ,
            time: entry.time
        }));


        let updatedEntries;
        
        console.log(existingEntries);

        if (isArticleAlreadyOpened) {
            updatedEntries = existingEntries;
            if(!isArticleOpenedThisWeek){
                    const alreadyInWeekly = weeklyEntries?.some(
                        entry => entry.article?.id == Number(ctx.params.id)
                    );

                    if (!alreadyInWeekly) {
                    weeklyEntries.push({
                        article: {
                    id:Number(ctx.params.id),
                },
                        time: moment().tz('Asia/Kolkata').format(),
                    });
                    OpensThisWeek += 1;
                }
            }
        } else {

            // ✅ Daily limit (for both)
            if (OpensToday >= DailyLimit) {
                console.log('Daily limit exceeded');
                return ctx.badRequest('Daily access limit exceeded.');
            }

            // ✅ Weekly limit check
            if (OpensThisWeek >= WeeklyLimit) {
                return ctx.badRequest('Weekly access limit exceeded.');
            }


            // ✅ Total limit (ONLY Trial)
            if (userDetails.Type === 'Trial' && TotalLimit <= 0) {
                console.log('Trial limit exceeded');
                return ctx.badRequest('Trial access limit exceeded.');
            }

           

            if(!isArticleOpenedThisWeek){
                    const alreadyInWeekly = weeklyEntries?.some(
                        entry => entry.article?.id == ctx.params.id
                    );

                    if (!alreadyInWeekly) {
                    weeklyEntries.push({
                        article: {
                            id:Number(ctx.params.id),
                        },
                        time: moment().tz('Asia/Kolkata').format(),
                    });

                    OpensThisWeek += 1;
                }
            }

            const newEntry = {
                article:{
                    id:Number(ctx.params.id),
                },
                time: moment().tz('Asia/Kolkata').format(),
            };

            updatedEntries = [...existingEntries, newEntry];

            console.log(updatedEntries);

            OpensToday += 1;
           

            // ✅ Decrement ONLY for Trial
            if (userDetails.Type === 'Trial') {
                TotalLimit -= 1;
            }
            
        }

        await strapi.entityService.update('plugin::users-permissions.user', userDetails.id, {
            data: {
                articlesOpenedToday: updatedEntries,
                articlesOpenedThisWeek:weeklyEntries,
                OpensToday,
                OpensThisWeek,
                WeekStartDate:formattedWeekStart,
                TotalLimit,
                DailyLimit,
                WeeklyLimit,
            },
        });
    }

    
    
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

     
    
        const BookmarkArticleIds = bookmarkedArticles.map(bookmark => bookmark.article.id);
        const LikeArticleIds = likedArticles.map(likedArticle => likedArticle.article.id);
        const DisLikeArticleIds = dislikedArticles.map(dislikedArticle => dislikedArticle.article.id);
        const ReadArticleIds = ReadArticles.map(readArticle => readArticle.article.id);

    
        // Adding like/dislike/bookmark status to the current article
        article.data.attributes.isLiked = LikeArticleIds.includes(article.data.id);
        article.data.attributes.isDisiked = DisLikeArticleIds.includes(article.data.id);
        article.data.attributes.isBookmarked = BookmarkArticleIds.includes(article.data.id);
        // article.data.attributes.read_time = read_time;
        article.data.attributes.isRead = ReadArticleIds.includes(article.data.id);

       
        delete article.data.attributes.allowed_users;
        


    
        return article;
    },


        
    });
