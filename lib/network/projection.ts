/**
 * Map Projection Module
 *
 * Creates and manages geographic projections for Netherlands map visualization.
 * Uses Albers Equal-Area Conic projection for accurate area representation.
 */

import * as d3 from 'd3';
import { feature } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';

/**
 * Creates an Albers Equal-Area Conic projection optimized for Netherlands
 *
 * This projection preserves area (important for fair visual comparison)
 * and is better suited for mid-latitude countries like Netherlands than Mercator.
 *
 * @param width - SVG viewport width
 * @param height - SVG viewport height
 * @param topology - TopoJSON topology containing Netherlands geometry
 * @returns Configured D3 geo projection
 */
export function createNetherlandsProjection(
  width: number,
  height: number,
  topology: Topology
): d3.GeoProjection {
  // Convert TopoJSON to GeoJSON for bounds calculation
  const netherlandsGeometry = topology.objects.netherlands as GeometryCollection;
  const geojson = feature(topology, netherlandsGeometry);

  // Configure Albers projection centered on Netherlands
  const projection = d3.geoAlbers()
    .parallels([51, 53])       // Standard parallels for Netherlands latitude
    .rotate([-5.5, 0])         // Center longitude (negative for east)
    .center([0, 52.0])         // Center latitude
    .scale(1)                  // Initial scale (will be auto-calculated)
    .translate([width / 2, height / 2]);

  // Calculate bounds and auto-fit to viewport
  const path = d3.geoPath(projection);
  const bounds = path.bounds(geojson);

  const dx = bounds[1][0] - bounds[0][0];
  const dy = bounds[1][1] - bounds[0][1];

  // Calculate scale to fit Netherlands in viewport (85% to leave margins)
  const scale = 0.85 / Math.max(dx / width, dy / height);

  // Apply calculated scale
  projection.scale(scale);

  return projection;
}

/**
 * Projects a geographic coordinate [lng, lat] to SVG coordinate [x, y]
 *
 * @param projection - D3 geo projection
 * @param lng - Longitude
 * @param lat - Latitude
 * @returns [x, y] SVG coordinates or [0, 0] if projection fails
 */
export function projectCoordinate(
  projection: d3.GeoProjection,
  lng: number,
  lat: number
): [number, number] {
  const result = projection([lng, lat]);
  return result || [0, 0];
}

/**
 * Projects multiple coordinates in batch
 *
 * @param projection - D3 geo projection
 * @param coordinates - Array of [lng, lat] pairs
 * @returns Array of [x, y] SVG coordinates
 */
export function projectCoordinates(
  projection: d3.GeoProjection,
  coordinates: Array<[number, number]>
): Array<[number, number]> {
  return coordinates.map(([lng, lat]) => projectCoordinate(projection, lng, lat));
}

/**
 * Converts TopoJSON to GeoJSON for rendering
 *
 * @param topology - TopoJSON topology
 * @param objectName - Name of object to extract (e.g., 'netherlands', 'neighbors')
 * @returns GeoJSON feature collection
 */
export function topologyToGeoJSON(
  topology: Topology,
  objectName: string
) {
  const obj = topology.objects[objectName] as GeometryCollection;
  return feature(topology, obj);
}
