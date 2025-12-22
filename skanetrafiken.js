const API_BASE = 'https://www.skanetrafiken.se/gw-tps/api/v2';

const headers = {
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'sv-SE',
  'search-engine-environment': 'TjP'
};

/**
 * Search for points (stops/locations) by name
 * @param {string} query - Search query
 * @returns {Promise<Array>} Array of point objects
 */
export async function searchPoints(query) {
  const url = `${API_BASE}/Points?name=${encodeURIComponent(query)}`;

  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.points || [];
}

/**
 * Plan a journey between two points
 * @param {Object} options - Journey options
 * @param {string} options.fromPointId - Origin point ID
 * @param {string} options.fromPointType - Origin type (STOP_AREA or LOCATION)
 * @param {string} options.toPointId - Destination point ID
 * @param {string} options.toPointType - Destination type (STOP_AREA or LOCATION)
 * @param {Date} options.departureTime - Departure time (optional)
 * @param {boolean} options.arrival - Whether time is arrival time (default: false)
 * @param {string} options.priority - Priority (default: SHORTEST_TIME)
 * @param {number} options.journeysAfter - Number of journeys to return (default: 5)
 * @param {string} options.walkSpeed - Walking speed (default: NORMAL)
 * @param {number} options.maxWalkDistance - Max walk distance in meters (default: 2000)
 * @param {boolean} options.allowWalkToOtherStop - Allow walking to other stops (default: true)
 * @returns {Promise<Object>} Journey data
 */
export async function planJourney(options) {
  const {
    fromPointId,
    fromPointType,
    toPointId,
    toPointType,
    departureTime = new Date(),
    arrival = false,
    priority = 'SHORTEST_TIME',
    journeysAfter = 5,
    walkSpeed = 'NORMAL',
    maxWalkDistance = 2000,
    allowWalkToOtherStop = true
  } = options;

  const params = new URLSearchParams({
    fromPointId,
    fromPointType,
    toPointId,
    toPointType,
    arrival: arrival.toString(),
    priority,
    isBobCapable: 'false',
    journeysAfter: journeysAfter.toString(),
    walkSpeed,
    maxWalkDistance: maxWalkDistance.toString(),
    allowWalkToOtherStop: allowWalkToOtherStop.toString()
  });

  const url = `${API_BASE}/Journey?${params.toString()}`;

  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Select the best point from search results
 * Prefers STOP_AREA over LOCATION
 * @param {Array} points - Array of point objects
 * @returns {Object|null} Best matching point or null
 */
export function selectBestPoint(points) {
  if (!points || points.length === 0) {
    return null;
  }

  const stopAreas = points.filter(p => p.type === 'STOP_AREA');
  if (stopAreas.length > 0) {
    return stopAreas[0];
  }

  return points[0];
}
