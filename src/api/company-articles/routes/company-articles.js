module.exports = {
  routes: [
    {
     method: 'GET',
     path: '/company-articles/:id',
     handler: 'company-articles.find',
     config: {
       policies: [],
       middlewares: [],
     },
    },
  ],
};
