// @ts-nocheck
'use strict';

/**
 * watchlist controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::watchlist.watchlist',{
    async find(ctx){
        const {user}=ctx.state;

        if(!user)
        {
            ctx.unauthorized("you are not authorized");
        }
        
        ctx.query={
            ...ctx.query,
            local:'en',
            filters:{
                watchlisted_by:user.id,
                publishedAt:{
                    $notNull:true,
                }
            },
            populate:{
                company:{
                    populate:{
                        logo:true,
                        articles:{
                            filters:{
                                publishedAt:{
                                    $notNull:true,
                                }
                            }
                        },
                    },
                }
            },
            sort:{company:{name:'asc'}}
            
        };

        
        const watchlists = await super.find(ctx);

        const companiesWatclists = watchlists.data.map(watchlist => {
            
            const company = watchlist.attributes.company;
            console.log(company);
            const articleCount = company.data.attributes.articles.data.length;

            const { articles, ...companyAttributesWithoutArticles} = company.data.attributes;

            return{
                watchlistId:watchlist.id,
                company:{
                            id: company.data.id,
                            ...companyAttributesWithoutArticles,
                            articleCount: articleCount,
                        },
                    
                };
            
        });

        return {
            ...watchlists,
            data:companiesWatclists,
        };

    },

    //create watchlist if not present otherwise remove
    async create(ctx){
        const {user} = ctx.state;
        if(!user){
            return ctx.unauthorized('please login to add watchlist companies')
        }

        try{
            const {data} = ctx.request.body;
            const companyConnectId = data?.company?.connect[0];
            const userConnectId= data?.watchlisted_by?.connect[0];

            if(!companyConnectId || !userConnectId){
                return ctx.badRequest('company Id and user Id both required');
            }

            //check if watchlist already exists

            const existingWatchlist = await strapi.entityService.findMany(
                'api::watchlist.watchlist',
                {
                    filters:{
                        company:companyConnectId,
                        watchlisted_by:user.id,
                    },
                    limit:1,
                }
            );

            if(existingWatchlist && existingWatchlist.length>0){
                //if watchlist already exist then remove
                await strapi.entityService.delete('api::watchlist.watchlist', existingWatchlist[0].id);
                return ctx.send({message : 'unlisted'});
            }else{
                //if it does not exist then create one
                const newWatchlist = await strapi.entityService.create('api::watchlist.watchlist',{
                    data:{
                        company: companyConnectId,
                        watchlisted_by: user.id,
                        publishedAt: new Date(), //setting published date to now
                    },
                });

                return ctx.send(newWatchlist);
            }
        }
        catch(err){
            console.log('Error in watchlist:', error);
            return ctx.badRequest('Failed to watchlist/unlist the company');
        }
    }
});
