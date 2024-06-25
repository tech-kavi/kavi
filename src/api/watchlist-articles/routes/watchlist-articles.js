module.exports = {
  routes: [
    {
     method: 'GET',
     path: '/watchlist-articles',
     handler: 'watchlist-articles.find',
     config: {
       policies: [],
       middlewares: [],
     },
    },
  ],
};
