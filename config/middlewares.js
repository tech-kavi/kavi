module.exports = [
  'strapi::errors',
  'strapi::security',
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::logger',
  'strapi::query',
  {
    name:'strapi::body',
    config: {
      jsonLimit: '10mb', // Adjust to a higher value if needed
      formLimit: '10mb', // Adjust for form-urlencoded data
      textLimit: '10mb', // Adjust for plain text data
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
