'use strict';

/**
 * read-article service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::read-article.read-article');
