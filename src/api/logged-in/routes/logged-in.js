'use strict';

/**
 * logged-in router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::logged-in.logged-in');
