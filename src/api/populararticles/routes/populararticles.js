module.exports = {
  routes: [
    {
     method: 'GET',
     path: '/populararticles',
     handler: 'populararticles.populararticles',
     config: {
       policies: [],
       middlewares: [],
     },
    },
  ],
};
