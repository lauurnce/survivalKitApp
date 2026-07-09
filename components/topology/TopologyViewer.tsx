// components/topology/TopologyViewer.tsx
"use client";

import { useState } from 'react';
import type { TopologyData, TopologyNode } from '@/lib/topology/types';
import { getAnchor } from '@/lib/topology/anchors';
import { DeviceIcon } from './DeviceIcon';

// px below device center where label sits
const LABEL_Y: Record<string, number> = {
  router: 32, switch: 62, pc: 42, server: 38,
  laptop: 22, hub: 24, firewall: 36, cloud: 28,
};

const CABLE: Record<string, { stroke: string; strokeWidth: number; strokeDasharray?: string }> = {
  ethernet:  { stroke: '#555', strokeWidth: 2 },
  serial:    { stroke: '#555', strokeWidth: 2, strokeDasharray: '8 4' },
  crossover: { stroke: '#c0392b', strokeWidth: 2 },
  wireless:  { stroke: '#555', strokeWidth: 1.5, strokeDasharray: '4 4' },
};

export function TopologyViewer({ data }: { data: TopologyData }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const nodeMap = new Map<string, TopologyNode>(data.nodes.map(n => [n.id, n]));
  const selectedNode = selectedId ? (nodeMap.get(selectedId) ?? null) : null;

  function toggle(id: string) {
    setSelectedId(prev => (prev === id ? null : id));
  }

  return (
    <div className="space-y-3">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-muted">
        § topology — {data.title}
      </p>

      <div className="border border-ink-faint/20 bg-[#f5f2eb] overflow-x-auto">
        <svg
          viewBox={data.viewBox ?? '0 0 640 340'}
          width="100%"
          style={{ display: 'block', minWidth: '300px' }}
        >
          {/* Edges first — rendered behind device icons */}
          {data.edges.map((edge, i) => {
            const a = nodeMap.get(edge.from);
            const b = nodeMap.get(edge.to);
            if (!a || !b) return null;
            const pa = getAnchor(a, b);
            const pb = getAnchor(b, a);
            const s = CABLE[edge.type ?? 'ethernet'];
            const mx = (pa.x + pb.x) / 2;
            const my = (pa.y + pb.y) / 2;
            return (
              <g key={i}>
                <line
                  x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y}
                  stroke={s.stroke}
                  strokeWidth={s.strokeWidth}
                  strokeDasharray={s.strokeDasharray}
                />
                {edge.label && (
                  <text
                    x={mx} y={my - 4}
                    textAnchor="middle"
                    fontSize="9"
                    fontFamily="monospace"
                    fill="#666"
                  >
                    {edge.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Devices on top */}
          {data.nodes.map(node => (
            <g
              key={node.id}
              transform={`translate(${node.x},${node.y})`}
              onClick={() => toggle(node.id)}
              style={{ cursor: 'pointer' }}
            >
              <DeviceIcon type={node.type} selected={selectedId === node.id} />
              <text
                y={LABEL_Y[node.type] ?? 32}
                textAnchor="middle"
                fontSize="11"
                fontFamily="monospace"
                fill="#333"
              >
                {node.label}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Info panel — shown when a device is selected */}
      {selectedNode && (
        <div className="border border-ink-faint/30 bg-paper p-4 font-mono text-sm space-y-1">
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-ink">{selectedNode.label}</span>
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className="text-xs text-ink-muted hover:text-ink leading-none"
              aria-label="Close device info"
            >
              ✕
            </button>
          </div>
          <div className="text-xs text-ink-muted space-y-0.5">
            <div><span className="text-ink">Role: </span>{selectedNode.info.role}</div>
            {selectedNode.info.ip && (
              <div><span className="text-ink">IP: </span>{selectedNode.info.ip}</div>
            )}
            {selectedNode.info.ports && (
              <div><span className="text-ink">Ports: </span>{selectedNode.info.ports}</div>
            )}
            {selectedNode.info.extra && (
              <div className="whitespace-pre-line">
                <span className="text-ink">Note: </span>{selectedNode.info.extra}
              </div>
            )}
          </div>
          <p className="text-xs text-ink-muted/60 pt-1">Click another device or ✕ to dismiss.</p>
        </div>
      )}
    </div>
  );
}
