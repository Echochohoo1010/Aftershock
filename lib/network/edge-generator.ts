/**
 * Network Edge Generation Module
 *
 * Generates realistic social network edges using modified Watts-Strogatz algorithm
 * with distance-based connection probability and high clustering coefficient.
 */

import type { AgentGeoData, NetworkEdge, NetworkGenerationParams, DegreeDistribution } from './types';

/**
 * Generates a social network with realistic properties
 *
 * Algorithm:
 * 1. Assign target degree to each agent (Poisson distribution, truncated)
 * 2. Create edges with distance-based probability (closer = more likely)
 * 3. Increase clustering through triadic closure (neighbors connect to each other)
 *
 * @param agentLocations - Map of agent IDs to geographic data
 * @param params - Network generation parameters
 * @returns Array of network edges
 */
export function generateSocialNetwork(
  agentLocations: Map<number, AgentGeoData>,
  params: NetworkGenerationParams
): NetworkEdge[] {
  const agents = Array.from(agentLocations.values());
  const adjacencyList = new Map<number, Set<number>>();
  const edges: NetworkEdge[] = [];

  // Initialize adjacency lists
  agents.forEach(agent => adjacencyList.set(agent.id, new Set()));

  // Step 1: Assign target degree to each agent
  const targetDegrees = new Map<number, number>();
  agents.forEach(agent => {
    const distribution = params.degreeDistribution[agent.locationType];
    const degree = sampleTruncatedPoisson(distribution);
    targetDegrees.set(agent.id, degree);
  });

  // Step 2: Create edges with distance-based probability
  createDistanceBasedEdges(agents, adjacencyList, targetDegrees, params.distanceDecayFactor);

  // Step 3: Increase clustering coefficient through triadic closure
  addTriadicClosure(agents, adjacencyList, params.clusteringCoefficient);

  // Convert adjacency list to edge list (avoid duplicates)
  const processedPairs = new Set<string>();
  adjacencyList.forEach((neighbors, sourceId) => {
    neighbors.forEach(targetId => {
      const pairKey = sourceId < targetId ? `${sourceId}-${targetId}` : `${targetId}-${sourceId}`;

      if (!processedPairs.has(pairKey)) {
        processedPairs.add(pairKey);
        edges.push({
          source: sourceId,
          target: targetId,
          weight: 1.0
        });
      }
    });
  });

  return edges;
}

/**
 * Creates edges based on distance-weighted probability
 * Agents prefer connections to geographically closer agents
 */
function createDistanceBasedEdges(
  agents: AgentGeoData[],
  adjacencyList: Map<number, Set<number>>,
  targetDegrees: Map<number, number>,
  distanceDecayFactor: number
): void {
  // Sort agents randomly to avoid bias
  const shuffledAgents = [...agents].sort(() => Math.random() - 0.5);

  shuffledAgents.forEach(sourceAgent => {
    const sourceSet = adjacencyList.get(sourceAgent.id)!;
    const targetDegree = targetDegrees.get(sourceAgent.id)!;

    if (sourceSet.size >= targetDegree) return;

    // Calculate distances and probabilities for all potential connections
    const candidates = agents
      .filter(targetAgent =>
        targetAgent.id !== sourceAgent.id &&
        !sourceSet.has(targetAgent.id)
      )
      .map(targetAgent => {
        const distance = haversineDistance(
          sourceAgent.lat, sourceAgent.lng,
          targetAgent.lat, targetAgent.lng
        );

        return {
          agent: targetAgent,
          distance,
          // Exponential decay: closer agents have higher probability
          probability: Math.exp(-distance * distanceDecayFactor)
        };
      })
      .sort((a, b) => b.probability - a.probability); // Sort by probability descending

    // Select edges to satisfy target degree
    const edgesToAdd = Math.min(
      targetDegree - sourceSet.size,
      candidates.length
    );

    const probabilities = candidates.map(c => c.probability);
    const selectedIndices = weightedRandomSampleMultiple(probabilities, edgesToAdd);

    selectedIndices.forEach(index => {
      const targetAgent = candidates[index].agent;
      const targetSet = adjacencyList.get(targetAgent.id)!;

      // Add bidirectional edge
      sourceSet.add(targetAgent.id);
      targetSet.add(sourceAgent.id);
    });
  });
}

/**
 * Adds triadic closure to increase clustering coefficient
 * For each agent, connects some of their neighbors to each other
 */
function addTriadicClosure(
  agents: AgentGeoData[],
  adjacencyList: Map<number, Set<number>>,
  clusteringTarget: number
): void {
  agents.forEach(agent => {
    const neighbors = Array.from(adjacencyList.get(agent.id)!);

    if (neighbors.length < 2) return;

    // Calculate how many neighbor pairs should be connected
    const maxPairs = (neighbors.length * (neighbors.length - 1)) / 2;
    const targetPairs = Math.floor(maxPairs * clusteringTarget);

    let addedPairs = 0;
    const attempts = targetPairs * 3; // Allow multiple attempts

    for (let attempt = 0; attempt < attempts && addedPairs < targetPairs; attempt++) {
      // Pick two random neighbors
      const [neighbor1, neighbor2] = sampleTwoRandom(neighbors);

      // Connect them if not already connected
      const set1 = adjacencyList.get(neighbor1)!;
      const set2 = adjacencyList.get(neighbor2)!;

      if (!set1.has(neighbor2)) {
        set1.add(neighbor2);
        set2.add(neighbor1);
        addedPairs++;
      }
    }
  });
}

/**
 * Samples from truncated Poisson distribution
 * Used for realistic degree distribution
 */
function sampleTruncatedPoisson(distribution: DegreeDistribution): number {
  const { lambda, min, max } = distribution;

  // Knuth's algorithm for Poisson sampling
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;

  do {
    k++;
    p *= Math.random();
  } while (p > L);

  const sample = k - 1;

  // Truncate to [min, max]
  return Math.max(min, Math.min(max, sample));
}

/**
 * Calculates haversine distance between two geographic coordinates
 * Returns distance in kilometers
 */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth radius in kilometers
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Performs weighted random sampling of multiple items without replacement
 */
function weightedRandomSampleMultiple(
  weights: number[],
  count: number
): number[] {
  if (weights.length === 0 || count === 0) return [];

  const selected: number[] = [];
  const availableWeights = [...weights];
  const indices = Array.from({ length: weights.length }, (_, i) => i);

  for (let i = 0; i < count && indices.length > 0; i++) {
    // Calculate cumulative weights
    const totalWeight = availableWeights.reduce((sum, w) => sum + w, 0);

    if (totalWeight === 0) break;

    const rand = Math.random() * totalWeight;
    let cumulative = 0;

    for (let j = 0; j < availableWeights.length; j++) {
      cumulative += availableWeights[j];

      if (rand <= cumulative) {
        selected.push(indices[j]);

        // Remove selected item to avoid replacement
        availableWeights.splice(j, 1);
        indices.splice(j, 1);

        break;
      }
    }
  }

  return selected;
}

/**
 * Samples two random distinct elements from an array
 */
function sampleTwoRandom<T>(array: T[]): [T, T] {
  const index1 = Math.floor(Math.random() * array.length);
  let index2 = Math.floor(Math.random() * (array.length - 1));

  // Ensure index2 is different from index1
  if (index2 >= index1) index2++;

  return [array[index1], array[index2]];
}

/**
 * Calculates network statistics for validation
 */
export function calculateNetworkStatistics(
  edges: NetworkEdge[],
  nodeCount: number
) {
  const degrees = new Map<number, number>();

  // Count degrees
  edges.forEach(edge => {
    degrees.set(edge.source, (degrees.get(edge.source) || 0) + 1);
    degrees.set(edge.target, (degrees.get(edge.target) || 0) + 1);
  });

  const degreeValues = Array.from(degrees.values());
  const meanDegree = degreeValues.reduce((sum, d) => sum + d, 0) / degreeValues.length;
  const maxDegree = Math.max(...degreeValues);
  const minDegree = Math.min(...degreeValues);

  // Calculate clustering coefficient (approximate)
  let totalClustering = 0;
  let nodesWithNeighbors = 0;

  degrees.forEach((degree, nodeId) => {
    if (degree < 2) return;

    // Get neighbors
    const neighbors = edges
      .filter(e => e.source === nodeId || e.target === nodeId)
      .map(e => e.source === nodeId ? e.target : e.source);

    // Count edges between neighbors
    let neighborEdges = 0;
    for (let i = 0; i < neighbors.length; i++) {
      for (let j = i + 1; j < neighbors.length; j++) {
        const hasEdge = edges.some(e =>
          (e.source === neighbors[i] && e.target === neighbors[j]) ||
          (e.source === neighbors[j] && e.target === neighbors[i])
        );
        if (hasEdge) neighborEdges++;
      }
    }

    const maxPossibleEdges = (degree * (degree - 1)) / 2;
    const clustering = maxPossibleEdges > 0 ? neighborEdges / maxPossibleEdges : 0;

    totalClustering += clustering;
    nodesWithNeighbors++;
  });

  const averageClustering = nodesWithNeighbors > 0
    ? totalClustering / nodesWithNeighbors
    : 0;

  return {
    totalEdges: edges.length,
    nodeCount,
    meanDegree: meanDegree || 0,
    maxDegree,
    minDegree,
    averageClustering
  };
}
