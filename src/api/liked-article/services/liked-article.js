'use strict';

/**
 * liked-article service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::liked-article.liked-article');
