// @ts-nocheck
'use strict';

/**
 * A set of functions called "actions" for `company-articles`
 */

function countWordsInFields(article){
  let totalWordCount = 0;

  //count words in brief

  // console.log(article.data.attributes.brief);
  console.log(article);
  console.log('from function');
  if(article.brief){
      article.brief.forEach(brief => {
          totalWordCount += brief.point.split(' ').length;
      });
  }
  console.log(totalWordCount);



  //count words table-with_content
  if(article.table_with_content){
      article.table_with_content.forEach(toc =>{
          totalWordCount += toc?.tablePoint.split(' ').length;

          

          toc.ques.forEach(ques=>{
              // console.log(ques);
              totalWordCount += ques?.question.split(' ').length;
              totalWordCount += ques?.answer.split(' ').length;
          })
      });
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

      

        const { page = 1, pageSize = 10, ...filters } = ctx.query.pagination;
        // console.log(ctx.query.pagination);
        // Convert page and pageSize to integers
        const pageInt = parseInt(page, 10);
        const pageSizeInt = parseInt(pageSize, 10);
        // console.log(pageSize);
        // Build query parameters

    const query = {
      filters:{
        ...ctx.request.query.filters,
        primary_companies:{
          id:{
            $in:[id],
          }
        },
        publishedAt:{
          $notNull:true,
        }
      },
      populate:{
        industry:{
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
      sort: ['published_date:desc'],
      
    };
    
    const articles = await strapi.entityService.findMany('api::article.article',query);

    

    const paginatedArticles = articles.slice((pageInt-1)* pageSizeInt, pageInt*pageSizeInt);

    //calculate read time for each article
    const articlesWithReadTime = paginatedArticles.map(article =>{
      
      const readTime = countWordsInFields(article);
      
      return{
        ...article,
        read_time:readTime,
      };
    })

    //to check bookmark status
    const bookmarkedArticles = await strapi.entityService.findMany('api::bookmark.bookmark', {
      filters: {
          bookmarked_by: user.id,
      },
      populate:{
          article:{
            filters:{
              publishedAt:{
                $notNull:true,
              }
            },
          },
      }
  });

  const BookmarkArticleIds = bookmarkedArticles.map(bookmark => bookmark.article.id);

  const CompanyArticleWithBookmarkStatus = articlesWithReadTime.map(article =>({
    ...article,
    isBookmarked:BookmarkArticleIds.includes(article.id),
    
}));

    const total = articles.length;

    return {
      data:CompanyArticleWithBookmarkStatus,
      meta:{
        page:pageInt,
        pageSize:pageSizeInt,
        pageCount:Math.ceil(total/pageSizeInt),
        total,
      },
    };


    } catch (err) {
      ctx.body = err;
    }
  }
};
