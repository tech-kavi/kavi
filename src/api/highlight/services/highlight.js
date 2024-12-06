'use strict';

/**
 * highlight service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::highlight.highlight');
