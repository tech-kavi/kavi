// ./src/api/article/content-types/article/lifecycles.js
module.exports = {
    async afterCreate(event) {
     
        const {data}=event.params;
        const {primary_companies,industry,sub_industries}=data;

        console.log(sub_industries);
       
        
        const industryId = data.industry.connect[0].id;

        
        if(primary_companies && industry){

            for(const company of primary_companies.connect)
            {
                const companyRecord = await strapi.service('api::company.company').findOne(company.id,{populate:{industries:true,sub_industries:true}});
                

                //check if the industry is already related to the company
                const isIndustryRelated = companyRecord.industries.some(ind=> ind.id ===industryId);

                if(!isIndustryRelated){
                    //add the industry to the company if not already related
                    companyRecord.industries.push(industryId);
                }

                
                //check and add each sub_industry to the company
                if(sub_industries && sub_industries.connect.length>0)
                {
                    for(const sub_industry of sub_industries.connect){
                        
                        const isSubIndustryRelated = companyRecord.sub_industries.some(subInd=> subInd.id === sub_industry.id);

                        if(!isSubIndustryRelated){
                            companyRecord.sub_industries.push(sub_industry.id);
                        }
                    }
                }

                await strapi.service('api::company.company').update(company.id,{data:{industries:companyRecord.industries,sub_industries:companyRecord.sub_industries}});
            }

            const industryRecord = await strapi.service('api::industry.industry').findOne(industryId,{populate:{sub_industries:true}});

            //check if the sub-industry is already related to the industry
           if(sub_industries&&sub_industries.connect.length>0)
           {
                for(const sub_industry of sub_industries.connect)
                {
                    const isSubIndustryRelated = industryRecord.sub_industries.some(subInd => subInd.id === sub_industry.id);

                    if(!isSubIndustryRelated)
                    {
                        industryRecord.sub_industries.push(sub_industry.id);
                    }
                }

                await strapi.service('api::industry.industry').update(industryId,{data:{sub_industries:industryRecord.sub_industries}});
           }
        }



       

        
      
    },
   
  };