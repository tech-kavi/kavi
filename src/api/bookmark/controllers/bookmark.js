// @ts-nocheck
'use strict';

/**
 * bookmark controller
 */

const { createCoreController } = require('@strapi/strapi').factories;
module.exports = createCoreController('api::bookmark.bookmark');
module.exports = createCoreController('api::bookmark.bookmark',{
    async find(ctx){
        const {user}=ctx.state;
        if(!user){
            return ctx.unauthorized('you must be logged in to access bookmarks');
        }

        ctx.query={
            ...ctx.query,
            filters:{
                ...ctx.query.filters,
                bookmarked_by:user.id,
                publishedAt:{
                    $notNull:true,
                },
            },
            populate:{
                article:{
                    populate:{
                        industry:true,
                        primary_companies:{
                            populate:{
                                logo:true
                            },
                            filters:{
                                publishedAt:{
                                    $notNull:true,
                                }
                            }
                        },
                        allowed_users:{fields:['id']},
                        
                    },

            },
        },
        };

        const bookmarks= await super.find(ctx);

        // const articles = bookmarks.data.map(bookmark => bookmark.attributes.article.data);
        // const bookmarkids = bookmarks.data.map(bookmark =>bookmark.id);
        // console.log(bookmarkids);


        //fetch already read articles

        const bookmarkedArticleIds = bookmarks.data.map(
            b => b.attributes.article.data.id
            );


      const readArticles = await strapi.entityService.findMany('api::read-article.read-article',{
          filters:{
              user: user.id,
              article:
              {
                id:
                {
                    $in: bookmarkedArticleIds
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

        

        // const articlesWithBookmarkIds = bookmarks.data.map(bookmark => ({
        //     bookmarkId: bookmark.id,
        //     article: bookmark.attributes.article,
        //      isRead: readArticleIds.includes(bookmark.attributes.article.data.id),
        // }));

        const articlesWithBookmarkIds = bookmarks.data.map(bookmark => {

         //   console.log(bookmark?.attributes?.article?.data?.attributes?.allowed_users);

        const allowed_users = bookmark?.attributes?.article?.data?.attributes?.allowed_users?.data || [];

        const canAccess = allowed_users.length===0 || allowed_users.some(u => u.id == user.id);

        delete bookmark.attributes.allowed_users;

            return {
            bookmarkId: bookmark.id,
            article: bookmark.attributes.article,
             isRead: readArticleIds.includes(bookmark.attributes.article.data.id),
             canAccess,
            }
        });


        
       

        return {
            ...bookmarks,
            data:articlesWithBookmarkIds,
        };
        // return bookmarks;
    },

    //create bookmark
    async create(ctx)
    {
        const {user} = ctx.state;

        if(!user){
            return ctx.unauthorized('you should be logged in to bookmark');
        }

        try{

            const {data} = ctx.request.body;
            const articleId = data?.article?.connect[0];
            const userConnectId = data?.bookmarked_by?.connect[0];

            if(!articleId || !userConnectId){
                return ctx.badRequest('article id and user id both needed');
            }

            //check if bookmark already exists

            const existingBookmark = await strapi.entityService.findMany(
                'api::bookmark.bookmark',
                {
                    filters:{
                        article:articleId,
                        bookmarked_by:user.id,
                    },
                    limit:1,
                }
            );

            if(existingBookmark && existingBookmark.length >0)
                {
                    //if it exists, remove bookmark
                    await strapi.entityService.delete('api::bookmark.bookmark',existingBookmark[0].id);
                    return ctx.send({message:'unbooked'});
                }else{
                    //if it not already bookmarked
                    const newBookmark = await strapi.entityService.create('api::bookmark.bookmark',{
                        data:{
                            article: articleId,
                            bookmarked_by: user.id,
                            publishedAt: new Date(),
                        },
                    });

                    return ctx.send(newBookmark);
                }

        }
        catch(err)
        {
            return ctx.badRequest('Failed to watchlist/unlist the company');
        }
    }


});


