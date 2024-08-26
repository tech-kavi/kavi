module.exports = [
  'strapi::errors',
  'strapi::security',
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::logger',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
  {
    name: 'global::checkCurrentToken',
    config: {
      enabled: true,
    },
  },
  // {
  //   name:'strapi::body',
  //   config:{
  //     jsonLimit:'10mb',
  //   },
  // },

];
