module.exports = {
  routes: [
    {
     method: 'GET',
     path: '/industry-companies/:id',
     handler: 'industry-companies.find',
     config: {
       policies: [],
       middlewares: [],
     },
    },
  ],
};
