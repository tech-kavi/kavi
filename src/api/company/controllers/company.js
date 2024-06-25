// @ts-nocheck
'use strict';


/**
 * company controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::company.company',{
    async findOne(ctx){
        const {user}=ctx.state;
        if(!user){
            return ctx.unauthorized('you must be logged in to access bookmarks');
        }

        ctx.query={
            ...ctx.query,
            populate:{
                industries:true,
                sub_industries:true,
                articles:{
                    populate:{
                        industry:true,
                        primary_company:{
                            populate:{
                                logo:true
                            },
                        },
                        
                    },

                },
                secondary_articles:{
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
            sort:{publishedAt:'desc'},
        };

        const company = await super.findOne(ctx);
        
        const sub_industries = company.data.attributes.sub_industries.data;
        const subIndustryNames = sub_industries.map(subIndustry =>subIndustry.attributes.name);

        

        const relatedCompaniesOfsub = await strapi.entityService.findMany(
            'api::sub-industry.sub-industry',
            {
                filters:{
                    name:{
                        $in:subIndustryNames,
                    }
                },
                populate:{
                    companies:{
                        populate:{
                            logo:true,
                            articles:true,
                        }
                    },
                }
            }
        );

        const companies = relatedCompaniesOfsub.flatMap(subIndustry => subIndustry.companies);
        const uniqueCompaniesMap = new Map();
        companies.forEach(company =>{
            if(!uniqueCompaniesMap.has(company.id)){
                uniqueCompaniesMap.set(company.id, company);
            }
        });
        let uniqueCompanies = Array.from(uniqueCompaniesMap.values());

        if(uniqueCompanies.length < 6)
        {
            //if companies of same sub_industry is less than 5 then get companies of same industry
            const companiesNeeded = 6-uniqueCompanies.length;
            const industries = company.data.attributes.industries.data;
            const IndustryNames = industries.map(industry =>industry.attributes.name);
            console.log(IndustryNames);
            const relatedCompaniesOfIndustry = await strapi.entityService.findMany(
                'api::industry.industry',
                {
                    filters:{
                        name:{
                            $in:IndustryNames,
                        }
                    },
                    populate:{
                        companies:{
                            populate:{
                               logo:true,
                               articles:true,
                            }
                            
                        }
                    }
                }
            );

            const companies = relatedCompaniesOfIndustry.flatMap(industry => industry.companies);
            const uniqueCompaniesMap = new Map();
            companies.forEach(company =>{
            if(!uniqueCompaniesMap.has(company.id)){
                uniqueCompaniesMap.set(company.id, company);
            }
           
        });
        let uniqueCompaniesofIndustry = Array.from(uniqueCompaniesMap.values());

        

        uniqueCompaniesofIndustry.map(company => uniqueCompanies.push(company));
        uniqueCompanies = uniqueCompanies.filter(x => x.name != company.data.attributes.name);

        }
        // console.log(uniqueCompanies);

        const uniqueCompaniesWithArticleCount= uniqueCompanies.map(company =>{
            const articleCount = company.articles? company.articles.length:0;
            const {articles,...withoutArticles}=company;
            return{
                ...withoutArticles,
                articleCount,
            }
        })

        

        company.data.attributes.relatedCompanies = uniqueCompaniesWithArticleCount;
        
        return company;


    }
});
