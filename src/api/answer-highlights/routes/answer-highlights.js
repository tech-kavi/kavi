module.exports = {
  routes: [
    {
     method: 'GET',
     path: '/answer-highlights/:id',
     handler: 'answer-highlights.find',
     config: {
       policies: [],
       middlewares: [],
     },
    },
  ],
};
