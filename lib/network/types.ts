/**
 * Network Visualization Type Definitions
 *
 * Type definitions for geographic network visualization including
 * city data, agent locations, network edges, and generation parameters.
 */

export interface CityData {
  name: string;
  lat: number;
  lng: number;
  population: number;
  type: 'urban_core' | 'town' | 'rural';
}

export interface AgentGeoData {
  id: number;
  lat: number;
  lng: number;
  cityName: string;
  locationType: 'urban_core' | 'town' | 'rural';
}

export interface NetworkEdge {
  source: number;
  target: number;
  weight: number;
}

export interface DegreeDistribution {
  lambda: number;  // Poisson distribution parameter
  min: number;     // Minimum degree (truncation)
  max: number;     // Maximum degree (truncation)
}

export interface NetworkGenerationParams {
  degreeDistribution: {
    urban_core: DegreeDistribution;
    town: DegreeDistribution;
    rural: DegreeDistribution;
  };
  clusteringCoefficient: number;      // Target clustering (0-1)
  distanceDecayFactor: number;        // Distance-based connection probability decay
}

// Default network generation parameters
export const DEFAULT_NETWORK_PARAMS: NetworkGenerationParams = {
  degreeDistribution: {
    urban_core: { lambda: 3.0, min: 2, max: 6 },
    town: { lambda: 2.5, min: 2, max: 5 },
    rural: { lambda: 2.5, min: 2, max: 5 }
  },
  clusteringCoefficient: 0.2,  // Reduced from 0.6 to minimize extra edges
  distanceDecayFactor: 0.3
};

// Agent interface for network generation (minimal subset)
export interface NetworkAgent {
  id: number;
  is_urban?: boolean;  // If available from simulation data
}
