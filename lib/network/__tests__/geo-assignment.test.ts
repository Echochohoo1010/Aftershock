/**
 * Geographic Assignment Tests
 *
 * Tests for agent location assignment based on population distribution
 */

import {
  assignAgentLocations,
  validateAssignments,
  getAssignmentStatistics
} from '../geo-assignment';
import type { CityData, NetworkAgent } from '../types';

// Mock city data for testing
const mockCities: CityData[] = [
  { name: 'Amsterdam', lat: 52.3676, lng: 4.9041, population: 872680, type: 'urban_core' },
  { name: 'Rotterdam', lat: 51.9244, lng: 4.4777, population: 651446, type: 'urban_core' },
  { name: 'Utrecht', lat: 52.0907, lng: 5.1214, population: 357179, type: 'urban_core' },
  { name: 'Groningen', lat: 53.2194, lng: 6.5665, population: 233218, type: 'urban_core' },
  { name: 'Smalltown', lat: 52.1234, lng: 5.5678, population: 30000, type: 'town' }
];

// Mock agents
const mockAgents: NetworkAgent[] = Array.from({ length: 100 }, (_, i) => ({ id: i + 1 }));

describe('assignAgentLocations', () => {
  test('should assign all agents to locations', () => {
    const assignments = assignAgentLocations(mockAgents, mockCities);
    expect(assignments.size).toBe(100);
  });

  test('should assign more agents to higher population cities', () => {
    const assignments = assignAgentLocations(mockAgents, mockCities);
    const stats = getAssignmentStatistics(assignments);

    // Amsterdam has highest population, should get most agents
    const amsterdamCount = stats.topCities.find(c => c.city === 'Amsterdam')?.count || 0;
    const smalltownCount = Array.from(assignments.values())
      .filter(a => a.cityName === 'Smalltown').length;

    expect(amsterdamCount).toBeGreaterThan(smalltownCount);
  });

  test('should assign valid lat/lng coordinates', () => {
    const assignments = assignAgentLocations(mockAgents, mockCities);

    for (const [, geoData] of assignments) {
      expect(geoData.lat).toBeGreaterThan(50);
      expect(geoData.lat).toBeLessThan(54);
      expect(geoData.lng).toBeGreaterThan(3);
      expect(geoData.lng).toBeLessThan(8);
    }
  });

  test('should add jitter to coordinates', () => {
    const assignments = assignAgentLocations(mockAgents, mockCities);
    const amsterdamAgents = Array.from(assignments.values())
      .filter(a => a.cityName === 'Amsterdam');

    // Check that not all Amsterdam agents have identical coordinates
    const uniqueCoords = new Set(
      amsterdamAgents.map(a => `${a.lat},${a.lng}`)
    );

    if (amsterdamAgents.length > 1) {
      expect(uniqueCoords.size).toBeGreaterThan(1);
    }
  });

  test('should set correct location type', () => {
    const assignments = assignAgentLocations(mockAgents, mockCities);

    for (const [, geoData] of assignments) {
      const city = mockCities.find(c => c.name === geoData.cityName);
      expect(geoData.locationType).toBe(city?.type);
    }
  });
});

describe('validateAssignments', () => {
  test('should validate assignments within Netherlands bounds', () => {
    const assignments = assignAgentLocations(mockAgents, mockCities);
    const isValid = validateAssignments(assignments);
    expect(isValid).toBe(true);
  });

  test('should reject assignments outside bounds', () => {
    const invalidAssignments = new Map([
      [1, { id: 1, lat: 60.0, lng: 4.0, cityName: 'Invalid', locationType: 'urban_core' as const }],
      [2, { id: 2, lat: 52.0, lng: 4.0, cityName: 'Valid', locationType: 'urban_core' as const }]
    ]);

    const isValid = validateAssignments(invalidAssignments);
    expect(isValid).toBe(false);
  });
});

describe('getAssignmentStatistics', () => {
  test('should calculate correct statistics', () => {
    const assignments = assignAgentLocations(mockAgents, mockCities);
    const stats = getAssignmentStatistics(assignments);

    expect(stats.total).toBe(100);
    expect(stats.byType.urban_core).toBeGreaterThan(0);
    expect(stats.topCities.length).toBeLessThanOrEqual(5);
    expect(stats.uniqueCities).toBeLessThanOrEqual(mockCities.length);
  });

  test('should have urban_core as majority', () => {
    const assignments = assignAgentLocations(mockAgents, mockCities);
    const stats = getAssignmentStatistics(assignments);

    // 4 out of 5 mock cities are urban_core with higher populations
    // So urban_core should have more agents than town
    expect(stats.byType.urban_core).toBeGreaterThan(stats.byType.town);
  });
});
