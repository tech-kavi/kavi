// @ts-nocheck
'use strict';

const likedArticle = require('../../liked-article/services/liked-article');

/**
 * article controller
 */

const userQueues = new Map();

async function withUserLock(userId, callback) {
  const key = String(userId);
  const previous = userQueues.get(key) || Promise.resolve();

  let release;
  const current = new Promise((resolve) => {
    release = resolve;
  });

  userQueues.set(key, current);

  await previous;

  try {
    return await callback();
  } finally {
    release();

    if (userQueues.get(key) === current) {
      userQueues.delete(key);
    }
  }
}

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
      //  console.log(totalWordCount);
      
      
      
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
      
      //  console.log(totalWordCount);
      
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
  //  console.log(month_details);

    if(month_details == 'startOfCurrentMonth')
    {
       // console.log('from current month');
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
      //  console.log("fetching articles from pervious month");
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

   
   
//     async findOne(ctx) {
//         const { user } = ctx.state;
//         if (!user) {
//             console.log("logged out during fetching transcript ",user);
//             return ctx.unauthorized("you must be logged in");
//         }

        
    
             
    
//         ctx.query = {
//             ...ctx.query,
//             locale: 'en',
//             populate: {
//                 brief: true,
//                 industry: {
//                     fields: ['name'],
//                     filters:{
//                         publishedAt:{
//                             $notNull:true,
//                         }
//                     }
//                 },
//                 sub_industries: {
//                     fields: ['name'],
//                     filters:{
//                         publishedAt:{
//                             $notNull:true,
//                         }
//                     }
//                 },
//                 primary_companies: {
//                     fields: ['name'],
//                     populate: {
//                         logo: true,
//                     },
//                     filters:{
//                         publishedAt:{
//                             $notNull:true,
//                         }
//                     }
//                 },
//                 secondary_companies: {
//                     fields: ['name'],
//                     populate: {
//                         logo: true,
//                     },
//                     filters:{
//                         publishedAt:{
//                             $notNull:true,
//                         }
//                     }
//                 },
//                 table_with_content: {
//                     populate: {
//                         ques: true,
//                     }
//                 },
//                 allowed_users:true,
//             },

//             filters: {
//                 publishedAt: {
//                     $notNull: true,
//                 }
//             }
//         };


    
//         const article = await super.findOne(ctx);

//         // console.log(article);
    
//         if (article.data.attributes.publishedAt == null) {
//             return ctx.badRequest("No Transcript found");
//         }

        
//        // =========================
//     // Allowed Users Check
//     // =========================
//     const allowedUsers = article.data.attributes.allowed_users?.data || [];

//     if (allowedUsers.length > 0) {
//       const isAllowed = allowedUsers.some(u => u.id === user.id);
//       if (!isAllowed) {
//         return ctx.badRequest('You do not have permission to access this transcript.');
//       }
//     }

//     // =========================
//     // Fetch User
//     // =========================
//     const userDetails = await strapi.entityService.findOne(
//       'plugin::users-permissions.user',
//       user.id
//     );

//     // =========================
//     // Limits Setup
//     // =========================
//     let DailyLimit = userDetails.DailyLimit;
//     let WeeklyLimit = userDetails.WeeklyLimit || 75;
//     let TotalLimit = userDetails.TotalLimit;

//     if (userDetails.Type === 'Trial') {
//       if (DailyLimit == null) DailyLimit = 30;
//       if (TotalLimit == null) TotalLimit = 100;
//     }

//     if (userDetails.Type === 'Subscriber') {
//       if (DailyLimit == null || DailyLimit === 30) DailyLimit = 50;
//     }

//     // =========================
//     // Dates
//     // =========================
//     const today = moment().tz('Asia/Kolkata').format('YYYY-MM-DD');
//     const weekStart = moment().tz('Asia/Kolkata').startOf('isoWeek').format('YYYY-MM-DD');

//     const articleId = Number(ctx.params.id);

  

//     // =========================
//     // Check if already opened today
//     // =========================

//     let alreadyOpened = false;

//     if(userDetails.Type === 'Trial')
//     {
//           const existingEver = await strapi.entityService.findMany(
//             'api::article-open.article-open',
//             {
//             filters: {
//                 user: user.id,
//                 article: articleId,
//             },
//             limit: 1
//             }
//         );

//         alreadyOpened = existingEver.length > 0;
//     }

//     if(userDetails.Type === 'Subscriber')
//     {
//            const existingThisWeek = await strapi.entityService.findMany(
//             'api::article-open.article-open',
//             {
//                 filters: {
//                 user: user.id,
//                 article: articleId,
//                 weekStart: weekStart,
//                 },
//                 limit: 1
//             }
//             );

//             alreadyOpened = existingThisWeek.length > 0;
//     }
 

//     // =========================
//     // LIMIT CHECK (only if new open)
//     // =========================
//     if (!alreadyOpened) {

//           // =========================
//             // Count BEFORE insert (for limits)
//             // =========================
//             const [OpensTodayBefore, OpensThisWeekBefore, TotalOpens] = await Promise.all([
//             strapi.entityService.count('api::article-open.article-open', {
//                 filters: { user: user.id, date: today }
//             }),
//             strapi.entityService.count('api::article-open.article-open', {
//                 filters: { user: user.id, weekStart: weekStart }
//             }),
//             strapi.entityService.count('api::article-open.article-open', {
//                 filters: { user: user.id }
//             })
//             ]);

//             console.log(OpensTodayBefore, OpensThisWeekBefore, TotalOpens);

//       if (OpensTodayBefore >= DailyLimit) {
//         return ctx.badRequest('You’ve reached the daily limit for opening transcripts. Please try again tomorrow.');
//       }

//       if (OpensThisWeekBefore >= WeeklyLimit) {
//         return ctx.badRequest('You’ve reached the weekly limit for opening transcripts. You can access more starting Monday.');
//       }

//       if (userDetails.Type === 'Trial' && TotalOpens >= TotalLimit) {
//         return ctx.badRequest('Trial limit reached. Upgrade to continue.');
//       }

//       // =========================
//       // Insert (race-safe)
//       // =========================
//       const uniqueKey = `${user.id}_${articleId}_${today}`;
//       const uniqueWeekKey = `${user.id}_${articleId}_${weekStart}`;

//       try {
//         await strapi.entityService.create('api::article-open.article-open', {
//           data: {
//             user: user.id,
//             article: articleId,
//             date: today,
//             weekStart: weekStart,
//             uniqueKey,
// 	    uniqueWeekKey,
//             publishedAt: new Date(),
//           }
//         });
//       } catch (err) {
//         // Duplicate insert → ignore
//       }
//     }

//     // =========================
//     // Final Counts (after insert)
//     // =========================
// // can comment it down
//     // const [OpensToday, OpensThisWeek] = await Promise.all([
//     //   strapi.entityService.count('api::article-open.article-open', {
//     //     filters: { user: user.id, date: today }
//     //   }),
//     //   strapi.entityService.count('api::article-open.article-open', {
//     //     filters: { user: user.id, weekStart: weekStart }
//     //   })
//     // ]);

      
    

    
    
//         // Fetching bookmarked, liked, and disliked articles for the user
//         const [bookmarkedArticles, likedArticles, dislikedArticles,ReadArticles] = await Promise.all([
//             strapi.entityService.findMany('api::bookmark.bookmark', {
//                 filters: { bookmarked_by: user.id,article:article.data.id },
//                 populate: { article: true }
//             }),
//             strapi.entityService.findMany('api::liked-article.liked-article', {
//                 filters: { user: user.id, publishedAt: { $notNull: true },article:article.data.id },
//                 populate: { article: true }
//             }),
//             strapi.entityService.findMany('api::disliked-article.disliked-article', {
//                 filters: { user: user.id, publishedAt: { $notNull: true },article:article.data.id },
//                 populate: { article: true }
//             }),
//             strapi.entityService.findMany('api::read-article.read-article', {
//                 filters: { user: user.id, publishedAt: { $notNull: true },article:article.data.id },
//                 populate: { article: true }
//             })
//         ]);

     
    
//         const BookmarkArticleIds = bookmarkedArticles.map(bookmark => bookmark.article.id);
//         const LikeArticleIds = likedArticles.map(likedArticle => likedArticle.article.id);
//         const DisLikeArticleIds = dislikedArticles.map(dislikedArticle => dislikedArticle.article.id);
//         const ReadArticleIds = ReadArticles.map(readArticle => readArticle.article.id);

    
//         // Adding like/dislike/bookmark status to the current article
//         article.data.attributes.isLiked = LikeArticleIds.includes(article.data.id);
//         article.data.attributes.isDisiked = DisLikeArticleIds.includes(article.data.id);
//         article.data.attributes.isBookmarked = BookmarkArticleIds.includes(article.data.id);
//         // article.data.attributes.read_time = read_time;
//         article.data.attributes.isRead = ReadArticleIds.includes(article.data.id);

       
//         delete article.data.attributes.allowed_users;
        


    
//         return article;
//     },


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

        
       // =========================
    // Allowed Users Check
    // =========================
    const allowedUsers = article.data.attributes.allowed_users?.data || [];

    if (allowedUsers.length > 0) {
      const isAllowed = allowedUsers.some(u => u.id === user.id);
      if (!isAllowed) {
        return ctx.badRequest('You do not have permission to access this transcript.');
      }
    }

    // =========================
    // Fetch User
    // =========================
    const userDetails = await strapi.entityService.findOne(
      'plugin::users-permissions.user',
      user.id
    );

    // =========================
    // Limits Setup
    // =========================
    let DailyLimit = userDetails.DailyLimit;
    let WeeklyLimit = userDetails.WeeklyLimit || 75;
    let TotalLimit = userDetails.TotalLimit;

    if (userDetails.Type === 'Trial') {
      if (DailyLimit == null) DailyLimit = 30;
      if (TotalLimit == null) TotalLimit = 100;
    }

    if (userDetails.Type === 'Subscriber') {
      if (DailyLimit == null || DailyLimit === 30) DailyLimit = 50;
    }

    // =========================
    // Dates
    // =========================
    const today = moment().tz('Asia/Kolkata').format('YYYY-MM-DD');
    const weekStart = moment().tz('Asia/Kolkata').startOf('isoWeek').format('YYYY-MM-DD');

    const articleId = Number(ctx.params.id);

  

    // =========================
    // Check if already opened today
    // =========================

     let quotaMessage = null;

    await withUserLock(user.id, async () => {
     

        // 1. Check whether this article was counted already
        let alreadyOpened = false;

        if (userDetails.Type === 'Trial') {
          const existingEver = await strapi.entityService.findMany(
            'api::article-open.article-open',
            {
              filters: {
                user: user.id,
                article: articleId,
              },
              limit: 1,
            }
          );

          alreadyOpened = existingEver.length > 0;
        } else if (userDetails.Type === 'Subscriber') {
          const existingThisWeek = await strapi.entityService.findMany(
            'api::article-open.article-open',
            {
              filters: {
                user: user.id,
                article: articleId,
                weekStart,
              },
              limit: 1,
            }
          );

          alreadyOpened = existingThisWeek.length > 0;
        }

        // console.log('[QUOTA DEBUG]', {
        // userId: user.id,
        // userType: userDetails.Type,
        // articleId,
        // today,
        // weekStart,
        // alreadyOpened,
        // });

        // 2. Only check limits and insert for a new open
        if (alreadyOpened) {
          return;
        }

        // Sequential queries are easier to reason about
        // when sharing one SQLite transaction connection.
        const OpensTodayBefore =
          await strapi.entityService.count(
            'api::article-open.article-open',
            {
              filters: {
                user: user.id,
                date: today,
              },
            }
          );

       //   console.log(OpensTodayBefore);

        const OpensThisWeekBefore =
          await strapi.entityService.count(
            'api::article-open.article-open',
            {
              filters: {
                user: user.id,
                weekStart,
              },
            }
          );

         // console.log(OpensThisWeekBefore);

        const TotalOpens =
          await strapi.entityService.count(
            'api::article-open.article-open',
            {
              filters: {
                user: user.id,
              },
            }
          );

         // console.log(TotalOpens);

        // 3. Enforce all applicable limits
        if (OpensTodayBefore >= DailyLimit) {
          quotaMessage =
            'You’ve reached the daily limit for opening transcripts. Please try again tomorrow.';
          return;
        }

        if (OpensThisWeekBefore >= WeeklyLimit) {
          quotaMessage =
            'You’ve reached the weekly limit for opening transcripts. You can access more starting Monday.';
          return;
        }

        if (
          userDetails.Type === 'Trial' &&
          TotalOpens >= TotalLimit
        ) {
          quotaMessage =
            'Trial limit reached. Upgrade to continue.';
          return;
        }

        // 4. Insert the open record
        const uniqueKey =
          `${user.id}_${articleId}_${today}`;

        const uniqueWeekKey =
          `${user.id}_${articleId}_${weekStart}`;

        //   console.log('[QUOTA DEBUG] Inserting article-open record', {
        //     userId: user.id,
        //     articleId,
        //     });

        try{
            await strapi.entityService.create(
            'api::article-open.article-open',
            {
                data: {
                user: user.id,
                article: articleId,
                date: today,
                weekStart,
                uniqueKey,
                uniqueWeekKey,
                publishedAt: new Date(),
                },
            }
            );

        }
        catch(err)
        {

        }
        

 
    });

    // Return limit errors only after the transaction finishes.
    if (quotaMessage) {
      return ctx.badRequest(quotaMessage);
    }

    // =========================
    // Final Counts (after insert)
    // =========================
// can comment it down
    // const [OpensToday, OpensThisWeek] = await Promise.all([
    //   strapi.entityService.count('api::article-open.article-open', {
    //     filters: { user: user.id, date: today }
    //   }),
    //   strapi.entityService.count('api::article-open.article-open', {
    //     filters: { user: user.id, weekStart: weekStart }
    //   })
    // ]);

      
    

    
    
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
