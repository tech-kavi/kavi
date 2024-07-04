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
                        articles:true,
                        ipo:true,
                    }
                },
                articles:true,
               top_companies:{
                        
                        populate:{
                            logo:true,
                            articles:true,
                            ipo:true,
                        },
               },
               sub_industries:{
                fields:['name'],
               }
            },
            sort:['name']
        };

        const industries=await super.find(ctx);

        //to check watchlist status
    const WatchlistedCompanies = await strapi.entityService.findMany('api::watchlist.watchlist', {
        filters: {
            watchlisted_by: user.id,
        },
        populate:{
            company:true,
        }
    });
  
    const WatchlistedCompanyIds = WatchlistedCompanies.map(watchlist => watchlist.company.id);
  
    


        const industriesWithArticleCounts = industries.data.map(industry =>{
            // const totalCompanies = industry.attributes.companies.data.length;
            const totalArticles = industry.attributes.articles.data.length;

            // Function to check if an article was published in the last 30 days
            const isPublishedInLast30Days = (publishDate) => {
               
                const articleDate = new Date(publishDate);
                const today = new Date();
                const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30));
                return articleDate >= thirtyDaysAgo;
            };

            // Count recent articles of the industry
            const recentArticlesCount = industry.attributes.articles.data.filter(article => 
                isPublishedInLast30Days(article.attributes.publishedAt)
            ).length;


            //counting articles of top companies
            const topcompaniesWithArticleCount = industry.attributes.top_companies.data.map(topcompany => {
                const articleCount = topcompany.attributes.articles.data.length;

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
                const articleCount = company.attributes.articles.data.length;

                const {articles, ...companyAttributesWithoutArticles} = company.attributes;
                return {
                    ...company,
                    attributes:{
                        ...companyAttributesWithoutArticles,
                        articleCount,
                    }

                };
            });

            companiesWithArticleCount = companiesWithArticleCount.sort((a,b)=>{
                return a.attributes.name.localeCompare(b.attributes.name);
            });

            //return the industry with updated top_companies
            const {companies, articles, ...industryAttributesWithoutCompanies}=industry.attributes;
            return {
                ...industry,
                attributes:{
                    ...industryAttributesWithoutCompanies,
                    totalArticles,
                    recentArticlesCount,
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
                    populate:{
                        industry:true,
                        primary_companies:{
                            populate:{
                                logo:true
                            },
                        },
                        
                    },

                },
                companies:{
                    populate:{
                        logo:true,
                        articles:true,
                    },
                },
                sub_industries:true,
            }
        };

        const industry = await super.findOne(ctx);

        industry.data.attributes.articleCounts = industry.data.attributes.articles.data.length;

        //counting articles of companies
        const companiesWithArticleCount = industry.data.attributes.companies.data.map(company => {
            const articleCount = company.attributes.articles.data.length;

            const {articles, ...companyAttributesWithoutArticles} = company.attributes;
            return {
                ...company,
                attributes:{
                    ...companyAttributesWithoutArticles,
                    articleCount,
                }

            };
        });
        
        industry.data.attributes.companies=companiesWithArticleCount;

        return industry;
    }
});
