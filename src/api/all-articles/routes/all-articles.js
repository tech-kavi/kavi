module.exports = {
  routes: [
    {
     method: 'GET',
     path: '/all-articles',
     handler: 'all-articles.find',
     config: {
       policies: [],
       middlewares: [],
     },
    },
    {
     method: 'GET',
     path: '/exportArticles',
     handler: 'all-articles.exportArticles',
     config: {
      auth:false,
       policies: [],
       middlewares: [],
     },
    },
    {
     method: 'GET',
     path: '/search',
     handler: 'all-articles.search',
     config: {
       policies: [],
       middlewares: [],
     },
    },
  ],
};
