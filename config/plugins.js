'use strict';

module.exports = ({ env }) => ({

  'strapi-algolia': {
    enabled: true,
    config: {
      apiKey: env('ALGOLIA_ADMIN_KEY'),
      applicationId: env('ALGOLIA_APP_ID'),
      
      contentTypes: [
        {
           name: 'api::article.article',
           
        },
     
      ],
    },
  },
  // 'users-permissions': {
  //   config: {
  //     jwt: {
  //       expiresIn: '1d',
  //     },
  //   },
  // },
});