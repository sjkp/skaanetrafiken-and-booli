/**
 * Example usage of the Booli.se API client
 */

import { BooliClient, buildSearchInput } from './booli-api.js';

async function main() {
  // Create a new client instance
  const client = new BooliClient();

  try {
    // Example 1: Simple search for properties
    console.log('=== Example 1: Search for properties ===\n');

    const searchResults = await client.search({
      areaId: '77104', // Mariestad area
      filters: [
        { key: 'maxDistanceToWater', value: '1000' },
        { key: 'minConstructionYear', value: '1710' },
        { key: 'objectType', value: 'Fritidshus,Villa' },
      ],
      page: 1,
      ascending: false,
      excludeAncestors: true,
      facets: ['upcomingSale'],
    });

    console.log(`Total results: ${searchResults.forSale.totalCount}`);
    console.log(`Pages: ${searchResults.forSale.pages}`);
    console.log(`\nFirst ${searchResults.forSale.result.length} listings:\n`);

    searchResults.forSale.result.forEach((listing, index) => {
      console.log(`${index + 1}. ${listing.streetAddress}`);
      console.log(`   Type: ${listing.objectType}`);
      console.log(`   Location: ${listing.descriptiveAreaName}, ${listing.location.region.municipalityName}`);
      console.log(`   Estimate: ${listing.estimate?.price?.formatted || 'N/A'}`);
      console.log(`   URL: https://www.booli.se${listing.url}`);
      console.log('');
    });

    // Example 2: Using buildSearchInput helper for cleaner syntax
    console.log('\n=== Example 2: Using buildSearchInput helper ===\n');

    const searchInput = buildSearchInput({
      areaId: '77104',
      maxDistanceToWater: '1000',
      minConstructionYear: '1710',
      objectType: 'Fritidshus,Villa',
      page: 1,
      facets: ['upcomingSale'],
    });

    const results2 = await client.search(searchInput, { limit: 5 });
    console.log(`Found ${results2.forSale.totalCount} properties`);

    // Example 3: Get map polygons
    console.log('\n=== Example 3: Get map polygons ===\n');

    const polygons = await client.getPolygons({
      areaIds: [77104],
      filters: [
        { key: 'maxDistanceToWater', value: '1000' },
        { key: 'minConstructionYear', value: '1710' },
        { key: 'objectType', value: 'Fritidshus,Villa' },
      ],
    });

    console.log('Polygon data retrieved:', polygons);

    // Example 4: Search with different parameters
    console.log('\n=== Example 4: Search for apartments in Stockholm ===\n');

    const stockholmSearch = buildSearchInput({
      areaId: '1', // Stockholm (you'll need to find the correct area ID)
      objectType: 'Lägenhet',
      minRooms: '2',
      maxPrice: '5000000',
      page: 1,
    });

    const stockholmResults = await client.search(stockholmSearch, { limit: 10 });
    console.log(`Found ${stockholmResults.forSale.totalCount} apartments in Stockholm`);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the examples
main();
