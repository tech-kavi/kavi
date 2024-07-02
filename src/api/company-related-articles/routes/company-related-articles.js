module.exports = {
  routes: [
    {
     method: 'GET',
     path: '/company-related-articles/:id',
     handler: 'company-related-articles.find',
     config: {
       policies: [],
       middlewares: [],
     },
    },
  ],
};
