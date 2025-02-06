module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/industrycompanies/:id',
      handler: 'industrycompanies.find',
      config: {
        policies: [],
        middlewares: [],
      },
     },
  ],
};
