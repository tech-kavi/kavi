module.exports = [
  'strapi::errors',
  'strapi::security',
  // 'strapi::cors',
  {
    name: 'strapi::cors',
    config: {
      enabled: true,
      origin: ["https://3dbfa084-3e4a-429b-bdab-3df3b23a9315.weweb-preview.io"], // Add your project's domain and IP addresses
      methods: ["GET", "POST", "PUT", "DELETE"],
      headers: ["Authorization", "Content-Type"],
      credentials: true,
    },
  },
  'strapi::poweredBy',
  'strapi::logger',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',

];
