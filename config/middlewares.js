module.exports = [
  'strapi::errors',
  'strapi::security',
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::logger',
  'strapi::query',
  {
    name: 'strapi::body',
    config: {
      jsonLimit: '256mb',
      formLimit: '256mb',
      textLimit: '256mb',
    },
  },
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
  {
    name: 'global::checkCurrentToken',
    config: {
      enabled: true,
    },
  },
 


];
