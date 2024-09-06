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
                // populate: {
                //     industry: {
                //         filters:{
                //             publishedAt:{
                //                 $notNull:true,
                //             }
                //         }
                //     },
                //     primary_companies: {
                //         populate: {
                //             logo: true,
                //         },
                //         filters:{
                //             publishedAt:{
                //                 $notNull:true,
                //             }
                //         }
                //     },
                // },
                count:true,
                filters: {
                    publishedAt: {
                        $notNull: true,
                    },
                },
            },
            // secondary_articles: {
            //     populate: {
            //         industry: {
            //             filters:{
            //                 publishedAt:{
            //                     $notNull:true,
            //                 }
            //             }
            //         },
            //         primary_companies: {
            //             populate: {
            //                 logo: true,
            //             },
            //             filters:{
            //                 publishedAt:{
            //                     $notNull:true,
            //                 }
            //             }
            //         },
            //     },
            //     filters: {
            //         publishedAt: {
            //             $notNull: true,
            //         },
            //     },
            // },
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
                    }
                },
                populate: {
                    logo: true,
                    articles: {
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
        const articleCount = company.articles ? company.articles.length : 0;
        const { articles, ...withoutArticles } = company;
        return {
            ...withoutArticles,
            articleCount,
        };
    });

    // To check watchlist status
    const watchlistedCompanies = await strapi.entityService.findMany('api::watchlist.watchlist', {
        filters: {
            watchlisted_by: user.id,
        },
        populate: {
            company: true,
        }
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
