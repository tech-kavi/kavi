// // @ts-nocheck
// const jwt = require('jsonwebtoken');

// module.exports = () => {
//   return async (ctx, next) => {
//     // Check if the request path matches '/articles'
//     if (ctx.request.path === '/api/articles' || ctx.request.path === '/api/users') {
//       const authorization = ctx.request.header.authorization;
//       if (!authorization) {
//         return ctx.unauthorized('No authorization header found');
//       }

//       const token = authorization.split(' ')[1];
//       let decoded;
//       try {
//         decoded = jwt.verify(token, strapi.config.get('plugin.users-permissions.jwtSecret'));
//       } catch (err) {
//         return ctx.unauthorized('Invalid token');
//       }

//       const user = await strapi.entityService.findOne('plugin::users-permissions.user', decoded.id);

//       if (!user || user.currentToken !== token) {
//         return ctx.unauthorized('Invalid token');
//       }
//     }

//     // Call the next middleware in the chain
//     await next();
//   };
// };