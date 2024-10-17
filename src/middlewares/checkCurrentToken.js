// @ts-nocheck
// // @ts-nocheck
const jwt = require('jsonwebtoken');

module.exports = () => {
  return async (ctx, next) => {
    // Check if the request path matches '/articles'
    //ctx.request.path === '/api/related-articles' || /^\/api\/related-articles\/\d+$/.test(ctx.request.path)
    if (ctx.request.path === '/api/articles' || ctx.request.path === '/api/users' || ctx.request.path === '/api/articles' || /^\/api\/articles\/\d+$/.test(ctx.request.path)) {
      const authorization = ctx.request.header.authorization;
      if (!authorization) {
        return ctx.unauthorized('No authorization header found');
      }
     

    //   console.log(ctx.request);

      const token = authorization.split(' ')[1];
      let decoded;
      try {
        decoded = jwt.verify(token, strapi.config.get('plugin.users-permissions.jwtSecret'));
      } catch (err) {
        return ctx.unauthorized('Invalid token');
      }

      const user = await strapi.entityService.findOne('plugin::users-permissions.user', decoded.id);

      
      if (!user || user.currentToken !== token) {
        return ctx.badRequest('New device logged in');
      }
      //check user expiry

      const currentDateTime = new Date();
      const expiryDateTime = new Date(user.expiry); // Assuming 'expiry' field holds the expiry date

        console.log("from middleware",currentDateTime,expiryDateTime);

        if (currentDateTime > expiryDateTime) {
          return ctx.badRequest('Your plan is expired. Please contact to KAVI Team');
        }

      // if (user.expiry) {
      //   const expiryDate = new Date(user.expiry); // Convert user.expiry to a Date object
      
      //   // Reset the time part of both dates
      //   expiryDate.setHours(0, 0, 0, 0);
      //   const today = new Date();
      //   today.setHours(0, 0, 0, 0);
      
      //   if (expiryDate < today) {
      //     return ctx.badRequest('plan.expired');
      //   }
      // }
    }

    // Call the next middleware in the chain
    await next();
  };
};