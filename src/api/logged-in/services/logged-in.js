'use strict';

/**
 * logged-in service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::logged-in.logged-in');
