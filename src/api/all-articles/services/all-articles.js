'use strict';

/**
 * all-articles service
 */

const algoliasearch = require("algoliasearch");

const client = algoliasearch(
  process.env.ALGOLIA_APP_ID,
  process.env.ALGOLIA_SEARCH_API_KEY
);

const index = client.initIndex(process.env.ALGOLIA_INDEX_NAME);

module.exports = () => ({
      async search(query, user, page = 0) {
    let filters = "";

    // Example: user-based security
    if (!user) {
      throw new Error("Unauthorized");
    }


    const result = await index.search(query, {
      filters,
      page,
      hitsPerPage: 25,
    });

    return result;
  },
});
