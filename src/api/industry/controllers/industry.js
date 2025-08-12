// @ts-nocheck
'use strict';

/**
 * industry controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::industry.industry',{
    async find(ctx){

        const {user}=ctx.state;
        if(!user)
        {
            return ctx.unauthorized("you must be logged in");
        }
        
        


        ctx.query = {
            ...ctx.query,
            locale:'en',
            populate:{
                companies:
                {
                    populate:{
                        logo:true,
                        articles:{
                            count:true,
                            filters:{
                                publishedAt:{
                                    $notNull:true,
                                }
                            }
                        },
                        ipo:true,
                    },
                    sort:['name'],
                    filters:{
                        publishedAt:{
                            $notNull:true,
                        },
                    },
                },
                articles:{
                    count:true,
                    filters:{ 
                        publishedAt:{
                            $notNull:true,
                        }
                    }
                },
               top_companies:{
                        
                        populate:{
                            logo:true,
                            articles:{
                                count:true,
                                filters:{
                                    publishedAt:{
                                        $notNull:true,
                                    }
                                }
                            },
                            ipo:true,
                        },
                        filters:{
                            publishedAt:{
                                $notNull:true,
                            },
                        },
               },
               sub_industries:{
                fields:['name'],
                filters:{
                    publishedAt:{
                        $notNull:true,
                    },
                },
               }
            },
            filters:{
                ...ctx.request.query.filters,
                publishedAt:{
                    $notNull:true,
                },
            },
            sort:['name']
        };

        const industries=await super.find(ctx);

        //to check watchlist status
    const WatchlistedCompanies = await strapi.entityService.findMany('api::watchlist.watchlist', {
        filters: {
            watchlisted_by: user.id,
            publishedAt:{
                $notNull:true,
            },
        },
        populate:{
            company:true,
        },
        limit:-1,
    });
  
    const WatchlistedCompanyIds = WatchlistedCompanies.map(watchlist => watchlist.company.id);
  
    


        const industriesWithArticleCounts = industries.data.map(industry =>{
            // const totalCompanies = industry.attributes.companies.data.length;
            // console.log(industry.attributes.articles);
            const totalArticles = industry.attributes.articles.data.attributes.count;
          
           


            //counting articles of top companies
            const topcompaniesWithArticleCount = industry.attributes.top_companies.data.map(topcompany => {
                const articleCount = topcompany.attributes.articles.data.attributes.count;

                const {articles, ...topcompanyAttributesWithoutArticles} = topcompany.attributes;
                return {
                    ...topcompany,
                    attributes:{
                        ...topcompanyAttributesWithoutArticles,
                        isWatchlisted:WatchlistedCompanyIds.includes(topcompany.id),
                        articleCount,
                    }

                };
            });

          


            //counting articles of all companies
            let companiesWithArticleCount = industry.attributes.companies.data.map(company => {
                const articleCount = company.attributes.articles.data.attributes.count;

                const {articles, ...companyAttributesWithoutArticles} = company.attributes;
                return {
                    ...company,
                    attributes:{
                        ...companyAttributesWithoutArticles,
                        isWatchlisted:WatchlistedCompanyIds.includes(company.id),
                        articleCount,
                    }

                };
            });

            

            //return the industry with updated top_companies
            const {companies, articles, ...industryAttributesWithoutCompanies}=industry.attributes;
            return {
                ...industry,
                attributes:{
                    ...industryAttributesWithoutCompanies,
                    totalArticles,
                   // recentArticlesCount,
                    top_companies:{
                        ...industry.attributes.top_companies,
                        data: topcompaniesWithArticleCount
                    },
                    companies:{
                        ...industry.attributes.companies,
                        data: companiesWithArticleCount
                    }
                }
            };
        });

       


        industries.data = industriesWithArticleCounts;

        return industries;
    },

    async findOne(ctx){
        const {user}=ctx.state;
        if(!user)
        {
            return ctx.unauthorized("you must be logged in");
        }

        ctx.query={
            ...ctx.query,
            locale:'en',
            populate:{
                articles:{
                    
                    count:true,
                    filters:{
                        publishedAt:{
                            $notNull:true,
                        },
                    }

                },
               
                sub_industries:{
                    filters:{
                        publishedAt:{
                            $notNull:true,
                        }
                    },
                    sort:['name:asc'],
                },
            },
            filters:{
                publishedAt:{
                    $notNull:true,
                },
            },
        };

        const industry = await super.findOne(ctx);

        if(industry.data.attributes.publishedAt==null)
        {
            return ctx.badRequest("No industry found");
        }

        

        return industry;
    }
});
