/**
 * Network Edges Component
 *
 * Renders social network edges as SVG lines between agent bubbles.
 * Optimized with memoization for performance with 400-500 edges.
 */

import React, { useMemo } from 'react';
import type { NetworkEdge } from '@/lib/network/types';

/**
 * SimulationNode interface (subset needed for edge rendering)
 * Full interface defined in simulation.types.ts
 */
interface SimulationNode {
  id: number;
  x?: number;
  y?: number;
  geoX?: number;
  geoY?: number;
}

interface NetworkEdgesProps {
  edges: NetworkEdge[];
  nodes: SimulationNode[];
  opacity?: number;
  strokeWidth?: number;
  stroke?: string;
}

/**
 * NetworkEdges renders lines connecting agents in network mode
 *
 * Features:
 * - Uses geoX/geoY when in network mode (geographic positioning)
 * - Falls back to x/y for cluster mode
 * - Memoized node lookup for performance
 * - Thin gray lines for subtle visual appearance
 */
export function NetworkEdges({
  edges,
  nodes,
  opacity = 0.4,        // Increased from 0.15 for better visibility
  strokeWidth = 1.0,    // Increased from 0.5 for better visibility
  stroke = '#6b7280'    // Darker gray-500 for better visibility
}: NetworkEdgesProps) {

  // Create fast lookup map for node positions
  const nodeMap = useMemo(() => {
    return new Map(nodes.map(node => [node.id, node]));
  }, [nodes]);

  // Memoize edge rendering to avoid unnecessary re-renders
  const renderedEdges = useMemo(() => {
    return edges.map((edge, index) => {
      const source = nodeMap.get(typeof edge.source === 'number' ? edge.source : edge.source);
      const target = nodeMap.get(typeof edge.target === 'number' ? edge.target : edge.target);

      // Skip edge if source or target not found
      if (!source || !target) return null;

      // Use current positions (x/y) - these are updated by physics in real-time
      const x1 = source.x ?? 0;
      const y1 = source.y ?? 0;
      const x2 = target.x ?? 0;
      const y2 = target.y ?? 0;

      // Generate unique key for edge
      const sourceId = typeof edge.source === 'number' ? edge.source : source.id;
      const targetId = typeof edge.target === 'number' ? edge.target : target.id;
      const key = `edge-${sourceId}-${targetId}-${index}`;

      return (
        <line
          key={key}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={stroke}
          strokeWidth={strokeWidth}
          opacity={opacity}
          style={{ pointerEvents: 'none' }} // Edges don't intercept mouse events
        />
      );
    });
  }, [edges, nodeMap, stroke, strokeWidth, opacity]);

  return (
    <g className="network-edges" style={{ opacity: 1 }}>
      {renderedEdges}
    </g>
  );
}

export default NetworkEdges;
