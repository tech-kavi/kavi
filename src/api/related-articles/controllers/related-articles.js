// @ts-nocheck
'use strict';

/**
 * A set of functions called "actions" for `related-articles`
 */

function countWordsInFieldsOfRelatedArticles(article){
  let totalWordCount = 0;

 
  console.log(article);
  console.log('from function');
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
}

module.exports = {

  

  find: async (ctx, next) => {
    try {
      const {user}=ctx.state;

      const id=ctx.params.id;
      
      if(!user)
      {
        return ctx.unauthorized("you must be logged in");
      }



    const article = await strapi.entityService.findOne('api::article.article',id,{
      populate:{
        primary_companies: {
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
      },

      filters:{
        publishedAt:{
          $notNull:true,
        }
      }
    });

    if (article.publishedAt == null) {
        return ctx.badRequest("No article found");
    }

    const primaryCompanies = article.primary_companies.map(company => company.id);

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
                              },
                              filters:{
                                  publishedAt:{
                                      $notNull:true,
                                  }
                              }
                          },
                          industry: {
                              filters:{
                                  publishedAt:{
                                      $notNull:true,
                                  }
                              }
                          },
                          brief:true,
                          table_with_content: {
                          populate: {
                              ques: true,
                          }
                          }
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
                              },
                              filters:{
                                  publishedAt:{
                                      $notNull:true,
                                  }
                              }
                          },
                          industry: {
                              filters:{
                                  publishedAt:{
                                      $notNull:true,
                                  }
                              }
                          },
                          brief:true,
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
  relatedArticles = relatedArticles.filter(x => x.id != id);

   // Fetch sub-industry and industry articles only if sub-industry is not "Miscellaneous"
   const subIndustry = article.sub_industries[0]?.name;
   if (subIndustry && subIndustry !== "Miscellaneous" && subIndustry !== "Marketplace" && subIndustry !== "Diversified") {
       // If we don't have enough articles, fetch sub-industry articles
       if (relatedArticles.length < 3) {
           const subIndustryArticles = await strapi.entityService.findMany('api::article.article', {
               filters: {
                   sub_industries: { name: subIndustry },
                   publishedAt: { $notNull: true },
                   id: { $ne: id }
               },
               populate: {
                   primary_companies: {
                       fields: ['name'],
                       populate: { logo: true },
                       filters:{
                           publishedAt:{
                               $notNull:true,
                           }
                       }
                   },
                   industry: {
                       filters:{
                           publishedAt:{
                               $notNull:true,
                           }
                       }
                   },
                   brief:true,
                   table_with_content: {
                           populate: {
                               ques: true,
                           }
                   }
               }
           });
           relatedArticles.push(...subIndustryArticles);
       }
  }

 

  // //remove duplicate articles by ID using a Set
  relatedArticles = Array.from(new Set(relatedArticles.map(article => article.id)))
  .map(currentid => relatedArticles.find(article => article.id === currentid));

   
  // Sort related articles by latest publishedAt date
relatedArticles = relatedArticles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));


  // Ensure only 3 related articles are returned
  relatedArticles = relatedArticles.slice(0, 3);

  // console.log(relatedArticles);

  //calculate read time for each article
const RelatedArticlesWithReadTime = relatedArticles.map(article =>{

  const readTime = countWordsInFieldsOfRelatedArticles(article);
  
  return{
    ...article,
    read_time:readTime,
  };
});


  // Fetching bookmarked, liked, and disliked articles for the user
  const [bookmarkedArticles, likedArticles, dislikedArticles] = await Promise.all([
    strapi.entityService.findMany('api::bookmark.bookmark', {
        filters: { bookmarked_by: user.id },
        populate: { article: true }
    }),
]);

const BookmarkArticleIds = bookmarkedArticles.map(bookmark => bookmark.article.id);

// Adding bookmark status to related articles
const articleWithBookmarkStatus = RelatedArticlesWithReadTime.map(article => ({
  ...article,
  isBookmarked: BookmarkArticleIds.includes(article.id),
}));

  return articleWithBookmarkStatus;

  
      
    } catch (err) {
      ctx.body = err;
    }
  }
};
