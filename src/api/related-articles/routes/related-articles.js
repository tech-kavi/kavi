module.exports = {
  routes: [
    {
     method: 'GET',
     path: '/related-articles/:id',
     handler: 'related-articles.find',
     config: {
       policies: [],
       middlewares: [],
     },
    },
  ],
};
