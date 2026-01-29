/**
 * Booli.se GraphQL API Client
 *
 * A module for querying the Booli.se GraphQL API using persisted queries.
 * Based on HAR file analysis of www.booli.se
 */

const BOOLI_GRAPHQL_URL = 'https://www.booli.se/graphql';

/**
 * Persisted query hashes for different operations
 */
const OPERATION_HASHES = {
  search: '8ed07f5c50d3c1a429e4864d83b7cbeef21a3afe4b96743a95e1034429aee2f6',
  polygons: 'b38be74aaac081a0e1e151ca222c848f3817c4b3528301f1b44a1e250bda2bb7',
  userSearchHistoryDescriptions: 'ae37c4b99365c3db13d534a542aa095df050e890c082f677c06835f3665eca2e',
  areaSuggestionSearch: 'ae60b499ae7d33a7e96f69fcf2c40ca7b88275169aee38e8cc844c76e5544f2a',
  areaInfo: 'fa90e12fe15fb60274954e0dbaa67edc4c789d1bfb9b0d6508e62ab3b91bd661',
};

/**
 * Default headers for Booli API requests
 */
const DEFAULT_HEADERS = {
  'accept': '*/*',
  'api-client': 'booli.se',
  'content-type': 'application/json',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'same-origin',
};

/**
 * Base class for making GraphQL requests to Booli.se
 */
class BooliClient {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || BOOLI_GRAPHQL_URL;
    this.headers = { ...DEFAULT_HEADERS, ...options.headers };
    this.fetch = options.fetch || globalThis.fetch;
  }

  /**
   * Execute a GraphQL query using persisted queries
   *
   * @param {string} operationName - The name of the operation (search, polygons, etc.)
   * @param {object} variables - The variables for the query
   * @returns {Promise<object>} The response data
   */
  async query(operationName, variables) {
    const hash = OPERATION_HASHES[operationName];

    if (!hash) {
      throw new Error(`Unknown operation: ${operationName}. Available operations: ${Object.keys(OPERATION_HASHES).join(', ')}`);
    }

    const extensions = {
      persistedQuery: {
        version: 1,
        sha256Hash: hash,
      },
    };

    const params = new URLSearchParams({
      operationName,
      variables: JSON.stringify(variables),
      extensions: JSON.stringify(extensions),
    });

    const url = `${this.baseUrl}?${params.toString()}`;

    const response = await this.fetch(url, {
      method: 'GET',
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.errors) {
      throw new Error(`GraphQL error: ${JSON.stringify(data.errors)}`);
    }
    
    return data.data;
  }

  /**
   * Search for listings
   *
   * @param {object} searchInput - Search parameters
   * @param {object} options - Additional options
   * @returns {Promise<object>} Search results
   *
   * @example
   * const results = await client.search({
   *   areaId: '77104',
   *   filters: [
   *     { key: 'maxDistanceToWater', value: '1000' },
   *     { key: 'minConstructionYear', value: '1710' },
   *     { key: 'objectType', value: 'Fritidshus,Villa' }
   *   ],
   *   page: 1,
   *   ascending: false,
   *   excludeAncestors: true,
   *   facets: ['upcomingSale']
   * }, {
   *   queryContext: 'SERP_LIST_LISTING',
   *   limit: 5
   * });
   */
  async search(searchInput, options = {}) {
    const variables = {
      queryContext: options.queryContext || 'SERP_LIST_LISTING',
      limit: options.limit || 35,
      input: searchInput,
    };

    return this.query('search', variables);
  }

  /**
   * Get map polygons for areas
   *
   * @param {object} input - Polygon query parameters
   * @returns {Promise<object>} Polygon data
   *
   * @example
   * const polygons = await client.getPolygons({
   *   areaIds: [77104],
   *   filters: [
   *     { key: 'objectType', value: 'Fritidshus,Villa' }
   *   ]
   * });
   */
  async getPolygons(input) {
    return this.query('polygons', { input });
  }

  /**
   * Get user search history descriptions
   *
   * @param {Array<Array<object>>} params - Search history parameters
   * @returns {Promise<object>} Search history descriptions
   *
   * @example
   * const history = await client.getUserSearchHistory([[
   *   { key: 'areaIds', value: '77104' },
   *   { key: 'objectType', value: 'Fritidshus,Villa' },
   *   { key: 'searchType', value: 'listings' }
   * ]]);
   */
  async getUserSearchHistory(params) {
    return this.query('userSearchHistoryDescriptions', {
      input: { params },
    });
  }

  /**
   * Get area information
   *
   * @param {string} areaId - The area ID
   * @param {string} searchType - The search type (e.g., 'listings')
   * @param {string} objectTypes - Object types (e.g., 'Villa')
   * @returns {Promise<object>} Area information
   *
   * @example
   * const info = await client.getAreaInfo('64', 'listings', 'Villa');
   */
  async getAreaInfo(areaId, searchType = 'listings', objectTypes = 'Villa') {
    return this.query('areaInfo', { areaId, searchType, objectTypes });
  }

  /**
   * Search for area suggestions by name
   *
   * @param {string} search - Search term (e.g., "Stockholm", "Skåne", etc.)
   * @returns {Promise<object>} Area suggestions with IDs and metadata
   *
   * @example
   * const results = await client.searchArea('Stockholm');
   * // Returns suggestions with area IDs, types, and parent information
   * // results.areaSuggestionSearch.suggestions[0].id is the area ID to use in searches
   */
  async searchArea(search) {
    return this.query('areaSuggestionSearch', { search });
  }

  /**
   * Find an area ID by name
   * Returns the first matching area's ID, or null if not found
   *
   * @param {string} search - Search term
   * @param {object} options - Filter options
   * @param {string} options.type - Filter by area type (e.g., 'Kommun', 'Län', 'Street', 'Tätort', 'userDefined')
   * @returns {Promise<string|null>} The area ID or null if not found
   *
   * @example
   * const areaId = await client.findAreaId('Stockholm');
   * const countyId = await client.findAreaId('Skåne län', { type: 'Län' });
   */
  async findAreaId(search, options = {}) {
    const result = await this.searchArea(search);
    const suggestions = result.areaSuggestionSearch?.suggestions || [];

    if (suggestions.length === 0) {
      return null;
    }

    if (options.type) {
      const filtered = suggestions.find(s => s.type === options.type);
      return filtered ? filtered.id : null;
    }

    return suggestions[0].id;
  }
}

/**
 * Helper function to create filter objects
 *
 * @param {object} filters - Key-value pairs of filters
 * @returns {Array<object>} Array of filter objects
 *
 * @example
 * const filters = createFilters({
 *   maxDistanceToWater: '1000',
 *   minConstructionYear: '1710',
 *   objectType: 'Fritidshus,Villa'
 * });
 */
function createFilters(filters) {
  return Object.entries(filters).map(([key, value]) => ({
    key,
    value: String(value),
  }));
}

/**
 * Helper function to build search input from a simple object
 *
 * @param {object} params - Search parameters
 * @returns {object} Search input object
 *
 * @example
 * const searchInput = buildSearchInput({
 *   areaId: '77104',
 *   maxDistanceToWater: '1000',
 *   minConstructionYear: '1710',
 *   objectType: 'Fritidshus,Villa',
 *   page: 1,
 *   facets: ['upcomingSale']
 * });
 */
function buildSearchInput(params) {
  const { areaId, page = 1, sort = '', ascending = false, excludeAncestors = true, facets = [], ...filterParams } = params;

  return {
    areaId,
    filters: createFilters(filterParams),
    page,
    sort,
    ascending,
    excludeAncestors,
    facets,
  };
}

// ES6 exports
export {
  BooliClient,
  createFilters,
  buildSearchInput,
  OPERATION_HASHES,
};
