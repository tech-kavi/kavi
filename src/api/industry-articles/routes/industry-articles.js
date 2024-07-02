module.exports = {
  routes: [
    {
     method: 'GET',
     path: '/industry-articles/:id',
     handler: 'industry-articles.find',
     config: {
       policies: [],
       middlewares: [],
     },
    },
  ],
};
