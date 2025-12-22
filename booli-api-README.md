# Booli.se GraphQL API Client

A JavaScript module for querying the Booli.se GraphQL API. This client uses persisted queries as observed from the Booli.se website.

## Installation

No external dependencies required. This module uses ES6 imports and works with:
- Modern browsers with native fetch support
- Node.js v18+ (with built-in fetch)

For Node.js, make sure your package.json has `"type": "module"` to enable ES6 modules.

## Quick Start

```javascript
import { BooliClient, buildSearchInput } from './booli-api.js';

const client = new BooliClient();

// Search for properties
const results = await client.search({
  areaId: '77104',
  filters: [
    { key: 'objectType', value: 'Villa,Fritidshus' },
    { key: 'maxDistanceToWater', value: '1000' }
  ],
  page: 1,
  ascending: false,
  excludeAncestors: true,
  facets: ['upcomingSale']
});

console.log(`Found ${results.forSale.totalCount} properties`);

// Or find area ID by name first
const stockholmId = await client.findAreaId('Stockholm');
const stockholmResults = await client.search({
  areaId: stockholmId,
  filters: [{ key: 'objectType', value: 'Lägenhet' }],
  page: 1,
  ascending: false,
  excludeAncestors: true,
  facets: []
});

console.log(`Found ${stockholmResults.forSale.totalCount} apartments in Stockholm`);
```

## API Reference

### BooliClient

#### Constructor

```javascript
const client = new BooliClient(options);
```

**Options:**
- `baseUrl` (string): GraphQL endpoint URL (default: `https://www.booli.se/graphql`)
- `headers` (object): Additional headers to include in requests
- `fetch` (function): Custom fetch implementation (useful for Node.js)

#### Methods

##### search(searchInput, options)

Search for property listings.

```javascript
const results = await client.search({
  areaId: '77104',
  filters: [...],
  page: 1,
  sort: '',
  ascending: false,
  excludeAncestors: true,
  facets: ['upcomingSale']
}, {
  queryContext: 'SERP_LIST_LISTING',
  limit: 35
});
```

**searchInput:**
- `areaId` (string): Area ID to search in
- `filters` (array): Array of filter objects `{ key, value }`
- `page` (number): Page number (default: 1)
- `sort` (string): Sort field (default: '')
- `ascending` (boolean): Sort direction (default: false)
- `excludeAncestors` (boolean): Exclude ancestor areas (default: true)
- `facets` (array): Facets to include (e.g., `['upcomingSale']`)

**options:**
- `queryContext` (string): Query context (default: 'SERP_LIST_LISTING')
- `limit` (number): Results per page (default: 35)

**Returns:** Object with `forSale` data containing:
- `totalCount`: Total number of results
- `pages`: Number of pages
- `result`: Array of listing objects
- `facets`: Facet counts

##### getPolygons(input)

Get map polygons for areas.

```javascript
const polygons = await client.getPolygons({
  areaIds: [77104],
  filters: [
    { key: 'objectType', value: 'Villa' }
  ]
});
```

##### getUserSearchHistory(params)

Get user search history descriptions.

```javascript
const history = await client.getUserSearchHistory([[
  { key: 'areaIds', value: '77104' },
  { key: 'objectType', value: 'Villa' },
  { key: 'searchType', value: 'listings' }
]]);
```

##### searchArea(search)

Search for area suggestions by name. Returns detailed information about matching areas including their IDs.

```javascript
const results = await client.searchArea('Stockholm');

// Results include suggestions with:
// - id: The area ID to use in property searches
// - type: Area type (Kommun, Län, Street, Tätort, userDefined)
// - displayName: Display name of the area
// - parent: Parent area name
// - parentType: Type of parent area
```

**Returns:** Object with `areaSuggestionSearch` containing:
- `query`: The search term used
- `suggestions`: Array of area suggestions with:
  - `id`: Area ID (use this for property searches)
  - `type`: Area type (Kommun, Län, Street, Tätort, userDefined)
  - `typeDisplayName`: Localized type name
  - `displayName`: Display name
  - `suggestion`: Suggestion text
  - `parent`: Parent area name
  - `parentType`: Parent area type
  - `parentDisplayName`: Parent display name
  - `parentId`: Parent area ID

##### findAreaId(search, options)

Find an area ID by name. Returns the first matching area's ID, or null if not found.

```javascript
// Find any area matching "Stockholm"
const stockholmId = await client.findAreaId('Stockholm');

// Find a specific type of area
const skaneLanId = await client.findAreaId('Skåne län', { type: 'Län' });
const malmoId = await client.findAreaId('Malmö', { type: 'Kommun' });
```

**Parameters:**
- `search` (string): Search term
- `options` (object): Optional filters
  - `type` (string): Filter by area type (Kommun, Län, Street, Tätort, userDefined)

**Returns:** Area ID as string, or null if not found

**Area Types:**
- `Kommun`: Municipality
- `Län`: County
- `Street`: Street address
- `Tätort`: Urban area/locality
- `userDefined`: User-defined area/neighborhood
- `Land`: Country

### Helper Functions

#### buildSearchInput(params)

Build a search input object from a flat parameters object.

```javascript
const searchInput = buildSearchInput({
  areaId: '77104',
  objectType: 'Villa,Fritidshus',
  maxDistanceToWater: '1000',
  minConstructionYear: '1710',
  page: 1,
  facets: ['upcomingSale']
});
```

#### createFilters(filters)

Convert an object to an array of filter objects.

```javascript
const filters = createFilters({
  objectType: 'Villa',
  maxPrice: '5000000',
  minRooms: '3'
});
// Returns: [
//   { key: 'objectType', value: 'Villa' },
//   { key: 'maxPrice', value: '5000000' },
//   { key: 'minRooms', value: '3' }
// ]
```

## Common Filters

Based on the HAR file analysis, here are some commonly used filters:

- `objectType`: Property type (e.g., 'Villa', 'Fritidshus', 'Lägenhet')
  - Values can be comma-separated: 'Villa,Fritidshus'
- `maxDistanceToWater`: Maximum distance to water in meters
- `minConstructionYear`: Minimum construction year
- `maxConstructionYear`: Maximum construction year
- `minPrice`: Minimum price
- `maxPrice`: Maximum price
- `minRooms`: Minimum number of rooms
- `maxRooms`: Maximum number of rooms
- `minLivingArea`: Minimum living area in m²
- `maxLivingArea`: Maximum living area in m²

## Response Structure

### Listing Object

```javascript
{
  id: "5967577",
  booliId: "5967577",
  streetAddress: "Tjädervägen 24",
  descriptiveAreaName: "Västra Skogen",
  objectType: "Villa",
  tenureForm: "Bostadsrätt",
  published: "2025-12-20 12:29:57",
  daysActive: 0,
  latitude: 58.6989062,
  longitude: 13.78917217,
  url: "/annons/5967577",
  upcomingSale: true,
  isNewConstruction: false,
  biddingOpen: 0,
  location: {
    region: {
      municipalityName: "Mariestad"
    }
  },
  estimate: {
    price: {
      value: "1 320 000",
      unit: "kr",
      raw: 1320000,
      formatted: "1 320 000 kr"
    }
  },
  displayAttributes: {
    dataPoints: [
      {
        value: { plainText: "130 m²" },
        screenReaderLabel: "130 kvadratmeter"
      },
      {
        value: { plainText: "5 rum" },
        screenReaderLabel: "5 rum"
      }
    ]
  },
  primaryImage: {
    id: "50636458",
    alt: "Exteriörbild"
  },
  agency: {
    name: "Fastighetsbyrån",
    url: "https://www.hittamaklare.se/maklarbyra/fastighetsbyran"
  },
  amenities: [
    {
      key: "patio",
      label: "Uteplats"
    }
  ]
}
```

## Notes

- The API uses **Automatic Persisted Queries (APQ)** with SHA-256 hashes
- All requests are GET requests with URL-encoded parameters
- The `api-client: booli.se` header is required
- Queries are identified by their operation name and persisted query hash
- The module supports three operations: `search`, `polygons`, and `userSearchHistoryDescriptions`

## Error Handling

```javascript
try {
  const results = await client.search(searchInput);
} catch (error) {
  if (error.message.includes('HTTP error')) {
    console.error('Network or server error:', error);
  } else if (error.message.includes('GraphQL error')) {
    console.error('Query error:', error);
  } else {
    console.error('Unknown error:', error);
  }
}
```

## License

This module is based on reverse-engineering the Booli.se public website and is for educational purposes only.
