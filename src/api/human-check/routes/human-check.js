module.exports = {
  routes: [
    {
     method: 'POST',
     path: '/validate',
     handler: 'human-check.validate',
     config: {
      auth:false,
       policies: [],
       middlewares: [],
     },
    },
  ],
};
