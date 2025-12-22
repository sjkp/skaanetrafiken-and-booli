/**
 * Example usage of Booli.se API area lookup functionality
 */

import { BooliClient, buildSearchInput } from './booli-api.js';

async function main() {
  const client = new BooliClient();

  try {
    console.log('=== Example 1: Search for area suggestions ===\n');

    // Search for "Skåne"
    const skaneResults = await client.searchArea('Skåne');
    console.log(`Search results for "Skåne":\n`);

    skaneResults.areaSuggestionSearch.suggestions.slice(0, 5).forEach((suggestion, i) => {
      console.log(`${i + 1}. ${suggestion.displayName}`);
      console.log(`   ID: ${suggestion.id}`);
      console.log(`   Type: ${suggestion.type} (${suggestion.typeDisplayName})`);
      console.log(`   Parent: ${suggestion.parent} (${suggestion.parentDisplayName})`);
      console.log('');
    });

    console.log('\n=== Example 2: Find area ID by name ===\n');

    // Find the area ID for Stockholm
    const stockholmId = await client.findAreaId('Stockholm');
    console.log(`Stockholm area ID: ${stockholmId}`);

    // Find the area ID for Skåne län specifically
    const skaneLanId = await client.findAreaId('Skåne län', { type: 'Län' });
    console.log(`Skåne län (county) ID: ${skaneLanId}`);

    // Find a municipality
    const malmoId = await client.findAreaId('Malmö', { type: 'Kommun' });
    console.log(`Malmö kommun ID: ${malmoId}`);

    console.log('\n=== Example 3: Search for properties using area lookup ===\n');

    // First, find the area ID for Göteborg
    const goteborgId = await client.findAreaId('Göteborg');
    console.log(`Found Göteborg area ID: ${goteborgId}\n`);

    // Then use it to search for properties
    const searchInput = buildSearchInput({
      areaId: goteborgId,
      objectType: 'Lägenhet',
      minRooms: '3',
      maxPrice: '4000000',
      page: 1,
    });

    const properties = await client.search(searchInput, { limit: 5 });
    console.log(`Found ${properties.forSale.totalCount} apartments in Göteborg\n`);

    properties.forSale.result.slice(0, 3).forEach((listing, i) => {
      console.log(`${i + 1}. ${listing.streetAddress}`);
      console.log(`   ${listing.descriptiveAreaName}, ${listing.location.region.municipalityName}`);
      console.log(`   ${listing.estimate?.price?.formatted || 'N/A'}`);
      console.log('');
    });

    console.log('\n=== Example 4: Search different area types ===\n');

    // Search for a street
    const streetResults = await client.searchArea('Skånegatan');
    console.log('Streets named "Skånegatan":');
    streetResults.areaSuggestionSearch.suggestions
      .filter(s => s.type === 'Street')
      .slice(0, 3)
      .forEach(s => {
        console.log(`  - ${s.displayName} in ${s.parent} (ID: ${s.id})`);
      });

    console.log('\n=== Example 5: Complete workflow - find and search ===\n');

    // Find Lund
    const lundId = await client.findAreaId('Lund', { type: 'Kommun' });
    console.log(`Lund kommun ID: ${lundId}`);

    // Search for villas in Lund
    const lundVillas = await client.search({
      areaId: lundId,
      filters: [
        { key: 'objectType', value: 'Villa' },
        { key: 'minRooms', value: '4' }
      ],
      page: 1,
      ascending: false,
      excludeAncestors: true,
      facets: []
    }, { limit: 3 });

    console.log(`\nFound ${lundVillas.forSale.totalCount} villas with 4+ rooms in Lund`);

    if (lundVillas.forSale.result.length > 0) {
      console.log('\nFirst result:');
      const first = lundVillas.forSale.result[0];
      console.log(`  ${first.streetAddress}`);
      console.log(`  ${first.estimate?.price?.formatted || 'N/A'}`);
      console.log(`  URL: https://www.booli.se${first.url}`);
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
