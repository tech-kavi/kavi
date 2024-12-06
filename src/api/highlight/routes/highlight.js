'use strict';

/**
 * highlight router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::highlight.highlight');
