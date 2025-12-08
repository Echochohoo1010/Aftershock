/**
 * Geographic Assignment Module
 *
 * Assigns agents to geographic locations based on Netherlands population distribution.
 * Uses weighted random sampling where cities with higher populations receive more agents.
 */

import type { CityData, AgentGeoData, NetworkAgent } from './types';

/**
 * Assigns geographic coordinates to each agent based on city population distribution
 *
 * @param agents - Array of agents to assign locations
 * @param cities - Array of cities with population data
 * @returns Map of agent ID to geographic data
 */
export function assignAgentLocations(
  agents: NetworkAgent[],
  cities: CityData[]
): Map<number, AgentGeoData> {
  // Calculate probability weights based on population
  const totalPopulation = cities.reduce((sum, city) => sum + city.population, 0);
  const cityWeights = cities.map(city => city.population / totalPopulation);

  // Create cumulative distribution for efficient sampling
  const cumulativeWeights = cityWeights.reduce((acc, weight, i) => {
    acc.push((acc[i - 1] || 0) + weight);
    return acc;
  }, [] as number[]);

  const assignments = new Map<number, AgentGeoData>();

  agents.forEach(agent => {
    // Weighted random selection of city
    const cityIndex = weightedRandomSample(cumulativeWeights);
    const city = cities[cityIndex];

    // Add jitter within city bounds (±0.05 degrees ≈ 5km)
    // This creates realistic spread rather than stacking all agents at city center
    const jitterLat = (Math.random() - 0.5) * 0.05;
    const jitterLng = (Math.random() - 0.5) * 0.05;

    assignments.set(agent.id, {
      id: agent.id,
      lat: city.lat + jitterLat,
      lng: city.lng + jitterLng,
      cityName: city.name,
      locationType: city.type
    });
  });

  return assignments;
}

/**
 * Performs weighted random sampling using cumulative distribution
 *
 * @param cumulativeWeights - Cumulative probability distribution [0.1, 0.3, 0.7, 1.0]
 * @returns Index of selected item
 */
function weightedRandomSample(cumulativeWeights: number[]): number {
  const rand = Math.random();

  // Find first cumulative weight greater than random value
  for (let i = 0; i < cumulativeWeights.length; i++) {
    if (rand <= cumulativeWeights[i]) {
      return i;
    }
  }

  // Fallback to last index (should rarely happen due to floating point)
  return cumulativeWeights.length - 1;
}

/**
 * Validates that agent locations are within Netherlands bounds
 *
 * @param assignments - Map of agent locations to validate
 * @returns True if all locations valid, false otherwise
 */
export function validateAssignments(
  assignments: Map<number, AgentGeoData>
): boolean {
  const NETHERLANDS_BOUNDS = {
    minLat: 50.75,
    maxLat: 53.55,
    minLng: 3.36,
    maxLng: 7.23
  };

  for (const [, geoData] of assignments) {
    const { lat, lng } = geoData;

    if (
      lat < NETHERLANDS_BOUNDS.minLat ||
      lat > NETHERLANDS_BOUNDS.maxLat ||
      lng < NETHERLANDS_BOUNDS.minLng ||
      lng > NETHERLANDS_BOUNDS.maxLng
    ) {
      console.warn(`Agent ${geoData.id} outside bounds: ${lat}, ${lng}`);
      return false;
    }
  }

  return true;
}

/**
 * Calculates distribution statistics for assigned locations
 *
 * @param assignments - Map of agent locations
 * @returns Statistics about location distribution
 */
export function getAssignmentStatistics(
  assignments: Map<number, AgentGeoData>
) {
  const locationCounts = {
    urban_core: 0,
    town: 0,
    rural: 0
  };

  const cityCounts = new Map<string, number>();

  for (const [, geoData] of assignments) {
    locationCounts[geoData.locationType]++;

    const currentCount = cityCounts.get(geoData.cityName) || 0;
    cityCounts.set(geoData.cityName, currentCount + 1);
  }

  // Get top 5 cities by agent count
  const topCities = Array.from(cityCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([city, count]) => ({ city, count }));

  return {
    total: assignments.size,
    byType: locationCounts,
    topCities,
    uniqueCities: cityCounts.size
  };
}
