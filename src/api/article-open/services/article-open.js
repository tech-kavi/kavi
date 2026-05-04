'use strict';

/**
 * article-open service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::article-open.article-open');
