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
                bookmarked_by:user.id,
            },
            populate:{
                article:{
                    populate:{
                        industry:true,
                        primary_company:{
                            populate:{
                                logo:true
                            },
                        },
                        
                    },

            },
        },
        };

        const bookmarks= await super.find(ctx);

        // const articles = bookmarks.data.map(bookmark => bookmark.attributes.article.data);
        // const bookmarkids = bookmarks.data.map(bookmark =>bookmark.id);
        // console.log(bookmarkids);

        const articlesWithBookmarkIds = bookmarks.data.map(bookmark => ({
            bookmarkId: bookmark.id,
            article: bookmark.attributes.article,
        }));
       

        return {
            ...bookmarks,
            data:articlesWithBookmarkIds,
        };
        // return bookmarks;
    },

    //create bookmark
    async create(ctx){
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


