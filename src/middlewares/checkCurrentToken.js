// @ts-nocheck
// // @ts-nocheck
const jwt = require('jsonwebtoken');

module.exports = () => {
  return async (ctx, next) => {
    // Check if the request path matches '/articles'
    //ctx.request.path === '/api/related-articles' || /^\/api\/related-articles\/\d+$/.test(ctx.request.path)
    if (ctx.request.path === '/api/articles' || ctx.request.path === '/api/users' || ctx.request.path === '/api/articles' || /^\/api\/articles\/\d+$/.test(ctx.request.path)|| ctx.request.path === '/api/related-articles' || /^\/api\/related-articles\/\d+$/.test(ctx.request.path)) {
      const authorization = ctx.request.header.authorization;
      if (!authorization) {
        return ctx.unauthorized('No authorization header found');
      }
     

    //   console.log(ctx.request);

      const token = authorization.split(' ')[1];

          // Check if it's an API token (Strapi's default way)
      // const isApiTokenValid = await strapi.service('admin::api-token').getBy({ accessKey: token });

      // if (isApiTokenValid) {
      //   return await next(); // Allow API tokens to work
      // }


      let decoded;
      try {
        decoded = jwt.verify(token, strapi.config.get('plugin.users-permissions.jwtSecret'));
      } catch (err) {
        console.log("token expired ")
        return ctx.unauthorized('Invalid token');
      }

      const user = await strapi.entityService.findOne('plugin::users-permissions.user', decoded.id);

      
      if (!user || user.currentToken !== token) {
        console.log("New Device logged in ",user.email);
        console.log("Strapi Token", user.currentToken);
        console.log("User Token",token);
        return ctx.unauthorized('New Device logged in');
      }
      //check user expiry

      const currentDateTime = new Date();
      const expiryDateTime = new Date(user.expiry); // Assuming 'expiry' field holds the expiry date

        

        if (currentDateTime > expiryDateTime) {
          console.log("Plan expired ",user.email);
          console.log("from middleware",currentDateTime,expiryDateTime);
          return ctx.unauthorized('Your plan is expired. Please contact to KAVI Team');
        }

      
    }

    // Call the next middleware in the chain
    await next();
  };
};