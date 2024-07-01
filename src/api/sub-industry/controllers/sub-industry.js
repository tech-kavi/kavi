// @ts-nocheck
'use strict';

/**
 * sub-industry controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::sub-industry.sub-industry',{
    async findOne(ctx){

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
                articles:{
                    populate:{
                        primary_companies:{
                            populate:{
                                logo:true,
                            }
                        },
                    }
                },
               
            },
            
        };

        const subIndustry=await super.findOne(ctx);

        //counting articles of companies
        const companiesWithArticleCount = subIndustry.data.attributes.companies.data.map(company => {
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

        subIndustry.data.attributes.companies=companiesWithArticleCount;

        return subIndustry;
    }
});
    

