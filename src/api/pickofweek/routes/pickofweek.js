module.exports = {
  routes: [
    {
     method: 'GET',
     path: '/pickofweek',
     handler: 'pickofweek.pickofweek',
     config: {
       policies: [],
       middlewares: [],
     },
    },
  ],
};
