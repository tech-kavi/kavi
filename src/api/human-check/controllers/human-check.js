'use strict';

/**
 * A set of functions called "actions" for `human-check`
 */

module.exports = {
  validate: async (ctx, next) => {
    // try {
    //   ctx.body = 'ok';
    // } catch (err) {
    //   ctx.body = err;
    // }

      // Optional: log or validate IP/user-agent if needed
    const ip = ctx.request.ip;
    const ua = ctx.request.header['user-agent'];
    console.log(ua);

    // Just return success
    ctx.send({ success: true, timestamp: new Date().toISOString() });
  }
};
