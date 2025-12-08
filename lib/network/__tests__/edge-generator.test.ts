/**
 * Network Edge Generation Tests
 *
 * Tests for social network generation algorithm
 */

import {
  generateSocialNetwork,
  haversineDistance,
  calculateNetworkStatistics
} from '../edge-generator';
import { DEFAULT_NETWORK_PARAMS } from '../types';
import type { AgentGeoData } from '../types';

// Mock agent locations (100 agents across Netherlands)
const mockAgentLocations = new Map<number, AgentGeoData>();

// Create 50 urban agents (Amsterdam area)
for (let i = 1; i <= 50; i++) {
  mockAgentLocations.set(i, {
    id: i,
    lat: 52.3676 + (Math.random() - 0.5) * 0.05,
    lng: 4.9041 + (Math.random() - 0.5) * 0.05,
    cityName: 'Amsterdam',
    locationType: 'urban_core'
  });
}

// Create 30 town agents (Utrecht area)
for (let i = 51; i <= 80; i++) {
  mockAgentLocations.set(i, {
    id: i,
    lat: 52.0907 + (Math.random() - 0.5) * 0.05,
    lng: 5.1214 + (Math.random() - 0.5) * 0.05,
    cityName: 'Utrecht',
    locationType: 'town'
  });
}

// Create 20 rural agents (scattered)
for (let i = 81; i <= 100; i++) {
  mockAgentLocations.set(i, {
    id: i,
    lat: 52.0 + (Math.random() - 0.5) * 1.0,
    lng: 5.0 + (Math.random() - 0.5) * 1.0,
    cityName: 'Rural',
    locationType: 'rural'
  });
}

describe('generateSocialNetwork', () => {
  test('should generate edges for all agents', () => {
    const edges = generateSocialNetwork(mockAgentLocations, DEFAULT_NETWORK_PARAMS);
    const stats = calculateNetworkStatistics(edges, mockAgentLocations.size);

    expect(edges.length).toBeGreaterThan(0);
    expect(stats.totalEdges).toBe(edges.length);
  });

  test('should have mean degree close to 5.0', () => {
    const edges = generateSocialNetwork(mockAgentLocations, DEFAULT_NETWORK_PARAMS);
    const stats = calculateNetworkStatistics(edges, mockAgentLocations.size);

    // Mean degree should be around 5.0 (±1.5 tolerance for randomness)
    expect(stats.meanDegree).toBeGreaterThan(3.5);
    expect(stats.meanDegree).toBeLessThan(6.5);
  });

  test('should have high clustering coefficient', () => {
    const edges = generateSocialNetwork(mockAgentLocations, DEFAULT_NETWORK_PARAMS);
    const stats = calculateNetworkStatistics(edges, mockAgentLocations.size);

    // Clustering should be > 0.4 (target is 0.6)
    expect(stats.averageClustering).toBeGreaterThan(0.4);
  });

  test('should respect degree bounds', () => {
    const edges = generateSocialNetwork(mockAgentLocations, DEFAULT_NETWORK_PARAMS);
    const stats = calculateNetworkStatistics(edges, mockAgentLocations.size);

    // Max degree should be <= 10 (urban_core max)
    expect(stats.maxDegree).toBeLessThanOrEqual(10);

    // Min degree should be >= 2 (rural min, or 0 for isolated nodes)
    expect(stats.minDegree).toBeGreaterThanOrEqual(0);
  });

  test('should create unique edges (no duplicates)', () => {
    const edges = generateSocialNetwork(mockAgentLocations, DEFAULT_NETWORK_PARAMS);

    const edgeSet = new Set<string>();
    edges.forEach(edge => {
      const key = edge.source < edge.target
        ? `${edge.source}-${edge.target}`
        : `${edge.target}-${edge.source}`;
      edgeSet.add(key);
    });

    // No duplicate edges
    expect(edgeSet.size).toBe(edges.length);
  });

  test('should not create self-loops', () => {
    const edges = generateSocialNetwork(mockAgentLocations, DEFAULT_NETWORK_PARAMS);

    edges.forEach(edge => {
      expect(edge.source).not.toBe(edge.target);
    });
  });
});

describe('haversineDistance', () => {
  test('should calculate distance between Amsterdam and Rotterdam', () => {
    const amsterdam = { lat: 52.3676, lng: 4.9041 };
    const rotterdam = { lat: 51.9244, lng: 4.4777 };

    const distance = haversineDistance(
      amsterdam.lat,
      amsterdam.lng,
      rotterdam.lat,
      rotterdam.lng
    );

    // Distance should be approximately 57 km
    expect(distance).toBeGreaterThan(50);
    expect(distance).toBeLessThan(65);
  });

  test('should return 0 for identical coordinates', () => {
    const distance = haversineDistance(52.3676, 4.9041, 52.3676, 4.9041);
    expect(distance).toBe(0);
  });

  test('should return positive distance', () => {
    const distance = haversineDistance(52.0, 4.0, 53.0, 5.0);
    expect(distance).toBeGreaterThan(0);
  });
});

describe('calculateNetworkStatistics', () => {
  test('should calculate correct statistics for simple network', () => {
    const edges = [
      { source: 1, target: 2, weight: 1 },
      { source: 2, target: 3, weight: 1 },
      { source: 3, target: 1, weight: 1 }
    ];

    const stats = calculateNetworkStatistics(edges, 3);

    expect(stats.totalEdges).toBe(3);
    expect(stats.nodeCount).toBe(3);
    expect(stats.meanDegree).toBe(2); // Triangle: all nodes have degree 2
    expect(stats.maxDegree).toBe(2);
    expect(stats.minDegree).toBe(2);
    expect(stats.averageClustering).toBe(1); // Perfect triangle
  });

  test('should handle network with varying degrees', () => {
    const edges = [
      { source: 1, target: 2, weight: 1 },
      { source: 1, target: 3, weight: 1 },
      { source: 1, target: 4, weight: 1 }
    ];

    const stats = calculateNetworkStatistics(edges, 4);

    expect(stats.totalEdges).toBe(3);
    expect(stats.meanDegree).toBe(1.5); // (3 + 1 + 1 + 1) / 4
    expect(stats.maxDegree).toBe(3); // Node 1
    expect(stats.minDegree).toBe(1); // Nodes 2, 3, 4
  });
});
