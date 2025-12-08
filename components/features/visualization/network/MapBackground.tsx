/**
 * Map Background Component
 *
 * Renders Netherlands map with neighboring countries and major city markers.
 * Uses minimal, clean styling to match existing visualization design.
 */

import React, { useMemo } from 'react';
import * as d3 from 'd3';
import type { Topology } from 'topojson-specification';
import { topologyToGeoJSON } from '@/lib/network/projection';
import type { CityData } from '@/lib/network/types';

interface MapBackgroundProps {
  width: number;
  height: number;
  projection: d3.GeoProjection;
  topology: Topology;
  cities: CityData[];
}

/**
 * MapBackground renders the Netherlands geographic context
 *
 * Layers (minimal style):
 * 1. Neighboring countries (Belgium, Germany) - subtle gray outline
 * 2. Netherlands boundary - white fill with gray border
 * 3. Major city markers (5 urban_core cities only) - small gray circles
 * 4. City labels - gray text above markers
 */
export function MapBackground({
  width,
  height,
  projection,
  topology,
  cities
}: MapBackgroundProps) {

  // Convert TopoJSON to GeoJSON and generate SVG paths
  const { netherlandsPath, neighborsPath } = useMemo(() => {
    const pathGenerator = d3.geoPath(projection);

    const netherlandsGeo = topologyToGeoJSON(topology, 'netherlands');
    const neighborsGeo = topologyToGeoJSON(topology, 'neighbors');

    return {
      netherlandsPath: pathGenerator(netherlandsGeo),
      neighborsPath: pathGenerator(neighborsGeo)
    };
  }, [projection, topology]);

  // Filter to show only major cities (urban_core: 5 cities)
  const majorCities = useMemo(() => {
    return cities
      .filter(city => city.type === 'urban_core')
      .slice(0, 5); // Amsterdam, Rotterdam, The Hague, Utrecht, Eindhoven
  }, [cities]);

  return (
    <g className="map-background" style={{ opacity: 1 }}>
      {/* Netherlands map image background */}
      <image
        href="/nl-map.jpg"
        x={-38}  // Shifted 1cm (~38px) to the left
        y={0}
        width={width}
        height={height}
        preserveAspectRatio="xMidYMid meet"
        opacity={0.85}
      />

      {/* Neighboring countries (Belgium, Germany) - very subtle */}
      {neighborsPath && (
        <path
          d={neighborsPath}
          fill="none"
          stroke="#d1d5db" // gray-300
          strokeWidth={0.3}
          opacity={0.15}
        />
      )}

      {/* Netherlands boundary - main map */}
      {netherlandsPath && (
        <path
          d={netherlandsPath}
          fill="none"
          stroke="#9ca3af" // gray-400
          strokeWidth={0.5}
          opacity={0.25}
        />
      )}

      {/* Major city markers and labels */}
      {majorCities.map(city => {
        const coordinates = projection([city.lng, city.lat]);

        if (!coordinates) return null;

        const [x, y] = coordinates;

        return (
          <g key={city.name} className="city-marker">
            {/* City dot */}
            <circle
              cx={x}
              cy={y}
              r={3}
              fill="#6b7280" // gray-500
              opacity={0.6}
            />

            {/* City label */}
            <text
              x={x}
              y={y - 8}
              fontSize={10}
              fontWeight={500}
              fill="#374151" // gray-700
              textAnchor="middle"
              opacity={0.7}
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {city.name}
            </text>
          </g>
        );
      })}
    </g>
  );
}

export default MapBackground;
