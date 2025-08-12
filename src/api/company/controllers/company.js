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

    const currentCompanyId=ctx.params.id;
    // console.log(currentCompanyId);

    ctx.query = {
        ...ctx.query,
        populate: {
            logo: true,
            industries: {
                filters:{
                    publishedAt:{
                        $notNull:true,
                    }
                }
            },
            sub_industries: {
                filters:{
                    publishedAt:{
                        $notNull:true,
                    }
                }
            },
            articles: {
                count:true,
                filters: {
                    publishedAt: {
                        $notNull: true,
                    },
                },
            },
        },
        sort: { publishedAt: 'desc' },
        filters: {
            publishedAt: {
                $notNull: true,
            },
        },
    };

    const company = await super.findOne(ctx);

    if (!company || company.data.attributes.publishedAt==null) {
        return ctx.badRequest("No Company found");
    }

    //for getting related companies
    const industries = company.data.attributes.industries.data;
    const industryIds = industries.map(industry => industry.id);

    const sub_industries = company.data.attributes.sub_industries.data;
    const subIndustryNames = sub_industries.filter(subIndustry => subIndustry.attributes.name !== "Miscellaneous" && subIndustry.attributes.name !== "Marketplace" && subIndustry.attributes.name !== "Diversified").map(subIndustry => subIndustry.attributes.name);

    // Getting companies of the same sub-industry
    const relatedCompaniesOfSub = await strapi.entityService.findMany('api::sub-industry.sub-industry', {
        filters: {
            name: {
                $in: subIndustryNames,
            },
        },
        populate: {
            companies: {
                filters: {
                    id:{
                        $ne:currentCompanyId,
                    },
                    publishedAt: {
                        $notNull: true,
                    },
                    industries:{
                        id:{
                            $in:industryIds,
                        }
                    }
                },
                populate: {
                    logo: true,
                    articles: {
                        count:true,
                        filters: {
                            publishedAt: {
                                $notNull: true,
                            }
                        },
                    },
                },
            },
        },
    });

    // console.log(relatedCompaniesOfSub);

    //filtering subIndustry to get their companies only
    let companies = relatedCompaniesOfSub.flatMap(subIndustry => subIndustry.companies).filter(company => company.id !== currentCompanyId);
    // console.log(companies);

    //filtering to get distinct companies
    let uniqueCompaniesMap = new Map();


    companies.forEach(relatedCompany => {
        if (!uniqueCompaniesMap.has(company.id)) {
            uniqueCompaniesMap.set(relatedCompany.id, relatedCompany);
        }
    });

    let uniqueCompanies = Array.from(uniqueCompaniesMap.values());




    const uniqueCompaniesWithArticleCount = uniqueCompanies.map(company => {
        // const articleCount = company.articles ? company.articles.length : 0;
        
        const articleCount = company.articles.count;
        const { articles, ...withoutArticles } = company;
        return {
            ...withoutArticles,
            articleCount,
        };
    });

    

    const watchlistedCompanies = await strapi.entityService.findMany('api::watchlist.watchlist', {
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

    const WatchlistCompanyIds = watchlistedCompanies.map(watchlist => watchlist.company.id);

    const CompanyWithWatchlistStatus = uniqueCompaniesWithArticleCount.map(company => ({
        ...company,
        isWatchlisted: WatchlistCompanyIds.includes(company.id),
    }));

    company.data.attributes.relatedCompanies = CompanyWithWatchlistStatus;
    company.data.attributes.isWatchlisted = WatchlistCompanyIds.includes(company.data.id);
    company.data.attributes.articles=company.data.attributes.articles.data.attributes.count;

    return company;


    }
});
