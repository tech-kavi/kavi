'use strict';

/**
 * disliked-article service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::disliked-article.disliked-article');
