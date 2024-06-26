'use strict';

module.exports = ({ env }) => ({

  'strapi-algolia': {
    enabled: true,
    provider:'strapi-algolia',
    config: {
      apiKey: env('ALGOLIA_ADMIN_KEY'),
      applicationId: env('ALGOLIA_APP_ID'),
      
      contentTypes: [
        {
           name: 'api::article.article',
           populate:{
            primary_company:{
              name:true,
              populate:{
                logo:true,
              }
            },
            secondary_companies:{
              name:true,
              populate:{
                logo:true,
              }
            },
            industry:{
              name:true,
            },
            table_with_content:{
              tablePoint:true,
              populate:{
                ques:{
                  fields:['question','answer'],
                },
              },
            },
           },
           
        },
        {
          name: 'api::company.company'
        },
        {
          name: 'api::industry.industry',
          populate:{
            companies:{
              name:true,
            },
            sub_industries:{
              name:true,
            }
          }
        }
     
      ],
    },
  },
  'users-permissions': {
    config: {
      jwt: {
        expiresIn: '1d',
      },
    },
  },
  email: {
    config: {
      provider: 'sendgrid',
      providerOptions: {
        apiKey: env('SENDGRID_API_KEY'),
      },
      settings: {
        defaultFrom: env('DEFAULT_FROM'),
        defaultReplyTo: env('DEFAULT_TO'),
      },
      
    },
  },


});