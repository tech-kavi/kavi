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
  ],
};
