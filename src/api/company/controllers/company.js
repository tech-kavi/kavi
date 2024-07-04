// @ts-nocheck
'use strict';


/**
 * company controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::company.company',{
    async findOne(ctx){
        const { user } = ctx.state;
        if (!user) {
            return ctx.unauthorized('You must be logged in to access bookmarks');
        }
    
        ctx.query = {
            ...ctx.query,
            populate: {
                logo: true,
                industries: true,
                sub_industries: true,
                articles: {
                    populate: {
                        industry: true,
                        primary_companies: {
                            populate: {
                                logo: true,
                            },
                        },
                    },
                },
                secondary_articles: {
                    populate: {
                        industry: true,
                        primary_companies: {
                            populate: {
                                logo: true,
                            },
                        },
                    },
                },
            },
            sort: { publishedAt: 'desc' },
        };
    
        const company = await super.findOne(ctx);
        const sub_industries = company.data.attributes.sub_industries.data;
        const subIndustryNames = sub_industries.map(subIndustry => subIndustry.attributes.name);
    
        // Getting companies of the same sub-industry
        const relatedCompaniesOfSub = await strapi.entityService.findMany('api::sub-industry.sub-industry', {
            filters: {
                name: {
                    $in: subIndustryNames,
                },
            },
            populate: {
                companies: {
                    populate: {
                        logo: true,
                        articles: true,
                    },
                },
            },
        });
    
        let companies = relatedCompaniesOfSub.flatMap(subIndustry => subIndustry.companies);
        let uniqueCompaniesMap = new Map();
    
        companies.forEach(company => {
            if (!uniqueCompaniesMap.has(company.id)) {
                uniqueCompaniesMap.set(company.id, company);
            }
        });
    
        let uniqueCompanies = Array.from(uniqueCompaniesMap.values());
    
        if (uniqueCompanies.length < 6) {
            // If companies of the same sub-industry are less than 6, then get companies of the same industry
            const companiesNeeded = 6 - uniqueCompanies.length;
            const industries = company.data.attributes.industries.data;
            const industryNames = industries.map(industry => industry.attributes.name);
    
            const relatedCompaniesOfIndustry = await strapi.entityService.findMany('api::industry.industry', {
                filters: {
                    name: {
                        $in: industryNames,
                    },
                },
                populate: {
                    companies: {
                        populate: {
                            logo: true,
                            articles: true,
                        },
                    },
                },
            });
    
            companies = relatedCompaniesOfIndustry.flatMap(industry => industry.companies);
            uniqueCompaniesMap = new Map();
            companies.forEach(company => {
                if (!uniqueCompaniesMap.has(company.id)) {
                    uniqueCompaniesMap.set(company.id, company);
                }
            });
    
            let uniqueCompaniesOfIndustry = Array.from(uniqueCompaniesMap.values());
            uniqueCompanies = uniqueCompanies.concat(uniqueCompaniesOfIndustry).filter(x => x.id !== company.data.id);
        }
    
        const uniqueCompaniesWithArticleCount = uniqueCompanies.map(company => {
            const articleCount = company.articles ? company.articles.length : 0;
            const { articles, ...withoutArticles } = company;
            return {
                ...withoutArticles,
                articleCount,
            };
        });
         //to check watchlist status
    const watchlistedCompanies = await strapi.entityService.findMany('api::watchlist.watchlist', {
        filters: {
            watchlisted_by: user.id,
        },
        populate:{
            company:true,
        }
    });
  
    const WatchlistCompanyIds = watchlistedCompanies.map(watchlist => watchlist.company.id);
  
    const CompanyWithWatchlistStatus = uniqueCompaniesWithArticleCount.map(company =>({
      ...company,
      isWatchlisted:WatchlistCompanyIds.includes(company.id),
  }));
    
        company.data.attributes.relatedCompanies = CompanyWithWatchlistStatus;

        company.data.attributes.isWatchlisted = WatchlistCompanyIds.includes(company.data.id)
    
        return company;


    }
});
