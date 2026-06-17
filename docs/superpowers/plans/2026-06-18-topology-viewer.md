# Network Topology Viewer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Embed interactive Cisco-style SVG topology diagrams in 7 networking sections; students click devices to see IP/role info in a tooltip panel below the diagram.

**Architecture:** Pure SVG + React state in a `"use client"` component. `topology_data jsonb` column on `sections` table drives diagrams. `SectionRenderer` lazy-loads `TopologyViewer` when `topology_data` is set. No new npm packages.

**Tech Stack:** Next.js 15 App Router, Supabase (PostgreSQL jsonb), Tailwind CSS, TypeScript, Vitest, SVG.

---

## File Map

| File | Action |
|---|---|
| `supabase/migrations/20260618000000_topology_viewer.sql` | Create — adds `topology_data` column |
| `lib/topology/types.ts` | Create — TypeScript interfaces |
| `lib/topology/anchors.ts` | Create — pure cable-endpoint function |
| `lib/topology/anchors.test.ts` | Create — Vitest unit tests |
| `components/topology/DeviceIcon.tsx` | Create — SVG icons for 8 device types |
| `components/topology/TopologyViewer.tsx` | Create — main `"use client"` viewer |
| `lib/supabase/types.ts` | Modify — add `topology_data` to sections Row/Insert/Update |
| `components/SectionRenderer.tsx` | Modify — lazy-load TopologyViewer |
| `app/year/[yearId]/subjects/[subjectId]/modules/[moduleId]/page.tsx` | Modify — add `topology_data` to select |
| `supabase/migrations/20260618000001_topology_seed.sql` | Create — seeds 7 sections |

---

## Task 1: DB Migration — Add `topology_data` Column

**Files:**
- Create: `supabase/migrations/20260618000000_topology_viewer.sql`

- [ ] **Step 1: Create the migration file**

```sql
-- supabase/migrations/20260618000000_topology_viewer.sql
alter table sections add column if not exists topology_data jsonb;
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/20260618000000_topology_viewer.sql
git commit -m "feat(db): add topology_data jsonb column to sections"
```

---

## Task 2: TypeScript Types

**Files:**
- Create: `lib/topology/types.ts`

- [ ] **Step 1: Create the types file**

```ts
// lib/topology/types.ts
export type DeviceType =
  | 'router'
  | 'switch'
  | 'pc'
  | 'server'
  | 'laptop'
  | 'hub'
  | 'firewall'
  | 'cloud';

export interface TopologyNodeInfo {
  ip?: string;
  role: string;
  ports?: string;
  extra?: string;
}

export interface TopologyNode {
  id: string;
  type: DeviceType;
  label: string;
  x: number;
  y: number;
  info: TopologyNodeInfo;
}

export interface TopologyEdge {
  from: string;
  to: string;
  type?: 'ethernet' | 'serial' | 'crossover' | 'wireless';
  label?: string;
}

export interface TopologyData {
  title: string;
  viewBox?: string;
  nodes: TopologyNode[];
  edges: TopologyEdge[];
}
```

- [ ] **Step 2: Verify types compile**

```bash
npx tsc --noEmit
```

Expected: exit 0 (no errors for the new file)

- [ ] **Step 3: Commit**

```bash
git add lib/topology/types.ts
git commit -m "feat(topology): add TypeScript types"
```

---

## Task 3: Cable Anchor Calculation + Tests

**Files:**
- Create: `lib/topology/anchors.ts`
- Create: `lib/topology/anchors.test.ts`

- [ ] **Step 1: Write the failing tests first**

```ts
// lib/topology/anchors.test.ts
import { describe, it, expect } from 'vitest';
import { getAnchor } from './anchors';

describe('getAnchor', () => {
  it('exits right edge for horizontal rightward cable (router)', () => {
    const result = getAnchor({ type: 'router', x: 0, y: 0 }, { x: 100, y: 0 });
    expect(result).toEqual({ x: 36, y: 0 });
  });

  it('exits left edge for horizontal leftward cable (router)', () => {
    const result = getAnchor({ type: 'router', x: 0, y: 0 }, { x: -100, y: 0 });
    expect(result).toEqual({ x: -36, y: 0 });
  });

  it('exits top edge for upward cable (router)', () => {
    const result = getAnchor({ type: 'router', x: 0, y: 0 }, { x: 0, y: -100 });
    expect(result).toEqual({ x: 0, y: -24 });
  });

  it('exits bottom edge for downward cable (router)', () => {
    const result = getAnchor({ type: 'router', x: 0, y: 0 }, { x: 0, y: 100 });
    expect(result).toEqual({ x: 0, y: 24 });
  });

  it('clips to shorter axis for 45° diagonal (router hw=36 hh=24 → hh wins)', () => {
    // dx=100, dy=100 → tx=0.36, ty=0.24 → t=0.24 → anchor at (100*0.24, 100*0.24) = (24,24) offset from node
    const result = getAnchor({ type: 'router', x: 100, y: 100 }, { x: 200, y: 200 });
    expect(result.x).toBeCloseTo(124);
    expect(result.y).toBeCloseTo(124);
  });

  it('works with non-zero node position (pc)', () => {
    const result = getAnchor({ type: 'pc', x: 100, y: 100 }, { x: 300, y: 100 });
    expect(result).toEqual({ x: 137, y: 100 });
  });

  it('returns node center when target equals node', () => {
    const result = getAnchor({ type: 'switch', x: 50, y: 50 }, { x: 50, y: 50 });
    expect(result).toEqual({ x: 50, y: 50 });
  });
});
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npm test -- lib/topology/anchors.test.ts
```

Expected: FAIL — `getAnchor` not found

- [ ] **Step 3: Implement `anchors.ts`**

```ts
// lib/topology/anchors.ts
import type { DeviceType } from './types';

// [halfWidth, halfHeight] of each device's bounding box, used for anchor calculation
export const DEVICE_HALF: Record<DeviceType, [number, number]> = {
  router:   [36, 24],
  switch:   [48, 46],
  pc:       [37, 22],
  server:   [20, 27],
  laptop:   [32, 24],
  hub:      [40, 16],
  firewall: [30, 28],
  cloud:    [42, 22],
};

// Returns the point on node's bounding box where the cable should start/end
export function getAnchor(
  node: { type: DeviceType; x: number; y: number },
  target: { x: number; y: number }
): { x: number; y: number } {
  const [hw, hh] = DEVICE_HALF[node.type];
  const dx = target.x - node.x;
  const dy = target.y - node.y;
  if (dx === 0 && dy === 0) return { x: node.x, y: node.y };
  const tx = Math.abs(dx) > 0 ? hw / Math.abs(dx) : Infinity;
  const ty = Math.abs(dy) > 0 ? hh / Math.abs(dy) : Infinity;
  const t = Math.min(tx, ty);
  return { x: node.x + dx * t, y: node.y + dy * t };
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npm test -- lib/topology/anchors.test.ts
```

Expected: 7 tests PASS

- [ ] **Step 5: Commit**

```bash
git add lib/topology/anchors.ts lib/topology/anchors.test.ts
git commit -m "feat(topology): add cable anchor calculation with tests"
```

---

## Task 4: DeviceIcon SVG Component

**Files:**
- Create: `components/topology/DeviceIcon.tsx`

All icons render centered at SVG origin (0,0). The parent TopologyViewer wraps them in `<g transform="translate(x,y)">`.

- [ ] **Step 1: Create the component**

```tsx
// components/topology/DeviceIcon.tsx
import type { DeviceType } from '@/lib/topology/types';
import { DEVICE_HALF } from '@/lib/topology/anchors';

interface Props {
  type: DeviceType;
  selected?: boolean;
}

export function DeviceIcon({ type, selected = false }: Props) {
  const hw = DEVICE_HALF[type][0];
  return (
    <>
      {selected && (
        <circle
          r={hw + 8}
          fill="#fef3c720"
          stroke="#f59e0b"
          strokeWidth="2"
          strokeDasharray="5 3"
        />
      )}
      {type === 'router'   && <RouterIcon />}
      {type === 'switch'   && <SwitchIcon />}
      {type === 'pc'       && <PcIcon />}
      {type === 'server'   && <ServerIcon />}
      {type === 'laptop'   && <LaptopIcon />}
      {type === 'hub'      && <HubIcon />}
      {type === 'firewall' && <FirewallIcon />}
      {type === 'cloud'    && <CloudIcon />}
    </>
  );
}

// Router: blue cylinder disc, 4-direction white arrows on top face
// Bounding box: hw=36 hh=24 (top ellipse at y=-14, bottom at y=10)
function RouterIcon() {
  return (
    <g>
      <rect x="-32" y="-14" width="64" height="24" fill="#1a85c2" />
      <ellipse cx="0" cy="10"  rx="32" ry="10" fill="#1570a0" />
      <ellipse cx="0" cy="-14" rx="32" ry="10" fill="#2196c4" />
      <ellipse cx="0" cy="-16" rx="22" ry="6"  fill="#2db4e8" opacity="0.3" />
      <g transform="translate(0,-14)">
        {[0, 90, 180, 270].map(r => (
          <polygon
            key={r}
            points="0,-10 2.5,-4 1.2,-4 1.2,2 -1.2,2 -1.2,-4 -2.5,-4"
            fill="white"
            transform={`rotate(${r})`}
          />
        ))}
      </g>
    </g>
  );
}

// Switch: blue 3D isometric box, X-pattern arrows on top face
// Bounding box: hw=48 hh=46 (top vertex y=-46, bottom vertex y=46)
function SwitchIcon() {
  return (
    <g>
      <polygon points="0,-46 48,-14 0,18 -48,-14" fill="#2196c4" />
      <polygon points="0,-42 40,-14 0,14 -40,-14" fill="#29b8e0" opacity="0.25" />
      <polygon points="-48,-14 -48,14 0,46 0,18"  fill="#1570a0" />
      <polygon points="48,-14 48,14 0,46 0,18"    fill="#0e5a88" />
      <polyline
        points="0,-46 48,-14 48,14 0,46 -48,14 -48,-14 0,-46"
        stroke="#0a4a70" strokeWidth="1.2" fill="none"
      />
      <line x1="0"   y1="18"  x2="0"  y2="46" stroke="#0a4a70" strokeWidth="1" />
      <line x1="-48" y1="-14" x2="0"  y2="18" stroke="#0a4a70" strokeWidth="1" />
      <line x1="48"  y1="-14" x2="0"  y2="18" stroke="#0a4a70" strokeWidth="1" />
      <g transform="translate(0,-14)">
        {[-45, 45, 135, -135].map(r => (
          <polygon
            key={r}
            points="0,-15 3,-7 1.4,-7 1.4,-2 -1.4,-2 -1.4,-7 -3,-7"
            fill="white" opacity="0.9"
            transform={`rotate(${r})`}
          />
        ))}
      </g>
    </g>
  );
}

// PC: monitor + stand + base
// Bounding box: hw=37 hh=22 (monitor -27..+17)
function PcIcon() {
  return (
    <g>
      <rect x="-37" y="-27" width="74" height="44" rx="2" stroke="#333" strokeWidth="1.5" fill="white" />
      <rect x="-33" y="-23" width="66" height="36" rx="1" fill="#dde8f4" stroke="#555" strokeWidth="1" />
      <line x1="0" y1="17"  x2="0"  y2="25" stroke="#333" strokeWidth="2" />
      <rect x="-20" y="25"  width="40" height="5" rx="1" fill="#333" />
      <rect x="-28" y="30"  width="56" height="5" rx="1" stroke="#333" strokeWidth="1.5" fill="#eee" />
    </g>
  );
}

// Server: 3 rack units with green LEDs
// Bounding box: hw=20 hh=27
function ServerIcon() {
  return (
    <g>
      {([-18, 0, 18] as const).map((cy, i) => (
        <g key={i}>
          <rect x="-20" y={cy - 9} width="40" height="14" rx="2" stroke="#333" strokeWidth="1.5" fill="white" />
          <circle cx="14" cy={cy - 2} r="3" fill="#2ecc71" />
          <rect x="-16" y={cy - 5} width="22" height="6" rx="1" fill="#ddd" />
        </g>
      ))}
    </g>
  );
}

// Laptop: open lid + keyboard
// Bounding box: hw=32 hh=24
function LaptopIcon() {
  return (
    <g>
      <polygon points="-30,-24 30,-24 26,-2 -26,-2" fill="white" stroke="#333" strokeWidth="1.5" />
      <polygon points="-26,-20 26,-20 22,-6 -22,-6" fill="#1a1a1a" />
      <rect x="-32" y="-2" width="64" height="14" rx="2" stroke="#333" strokeWidth="1.5" fill="white" />
    </g>
  );
}

// Hub: flat box with 5 port circles
// Bounding box: hw=40 hh=16
function HubIcon() {
  return (
    <g>
      <rect x="-40" y="-16" width="80" height="32" rx="2" stroke="#333" strokeWidth="1.5" fill="white" />
      {[-24, -12, 0, 12, 24].map(cx => (
        <circle key={cx} cx={cx} cy="0" r="4" fill="#333" />
      ))}
    </g>
  );
}

// Firewall: brick wall + flame
// Bounding box: hw=30 hh=28
function FirewallIcon() {
  return (
    <g>
      <rect x="-28" y="-10" width="56" height="12" rx="1" fill="#e07b39" />
      <rect x="-28" y="6"   width="56" height="12" rx="1" fill="#e07b39" />
      <line x1="-14" y1="-10" x2="-14" y2="2"  stroke="white" strokeWidth="1.5" />
      <line x1="14"  y1="-10" x2="14"  y2="2"  stroke="white" strokeWidth="1.5" />
      <line x1="0"   y1="6"   x2="0"   y2="18" stroke="white" strokeWidth="1.5" />
      <path
        d="M-4,-16 C-4,-28 4,-28 4,-16 C4,-10 8,-6 6,0 C3,-4 1,-2 0,0 C-1,-2 -3,-4 -6,0 C-8,-6 -4,-10 -4,-16 Z"
        fill="#ff6b35"
      />
    </g>
  );
}

// Cloud: overlapping circles + flat base (represents Internet/WAN)
// Bounding box: hw=42 hh=22
function CloudIcon() {
  return (
    <g>
      <circle cx="-16" cy="0"  r="14" fill="#b0c4de" />
      <circle cx="0"   cy="-8" r="17" fill="#b0c4de" />
      <circle cx="16"  cy="0"  r="14" fill="#b0c4de" />
      <rect x="-30" y="0" width="60" height="18" fill="#b0c4de" />
      <path
        d="M-30,18 L30,18 A14,14 0 0,0 30,0 A14,14 0 0,0 16,0
           A17,17 0 0,0 0,-8 A14,14 0 0,0 -16,0 A14,14 0 0,0 -30,0 Z"
        fill="none" stroke="#8aa0b8" strokeWidth="1.5"
      />
    </g>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: exit 0

- [ ] **Step 3: Commit**

```bash
git add components/topology/DeviceIcon.tsx
git commit -m "feat(topology): add DeviceIcon SVG component (router, switch, pc, server, laptop, hub, firewall, cloud)"
```

---

## Task 5: TopologyViewer Component

**Files:**
- Create: `components/topology/TopologyViewer.tsx`

- [ ] **Step 1: Create the component**

```tsx
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
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: exit 0

- [ ] **Step 3: Commit**

```bash
git add components/topology/TopologyViewer.tsx
git commit -m "feat(topology): add TopologyViewer component with click-to-inspect"
```

---

## Task 6: Update Supabase TypeScript Types

**Files:**
- Modify: `lib/supabase/types.ts`

Current `sections` Row type (lines 63–72):
```ts
sections: {
  Row: {
    id: string;
    module_id: string;
    kind: SectionKind;
    heading: string;
    body_md: string;
    sort_order: number;
    ide_language: "python" | "sql" | "java" | "c" | null;
    starter_code: string | null;
  };
```

- [ ] **Step 1: Add `TopologyData` import at the top of the file**

Add after line 1 (the existing type/interface declarations have no imports, so add before the first `export`):

```ts
import type { TopologyData } from '@/lib/topology/types';
```

- [ ] **Step 2: Add `topology_data` to all three section shapes (Row, Insert, Update)**

In `sections.Row`, add:
```ts
topology_data: TopologyData | null;
```

In `sections.Insert`, add:
```ts
topology_data?: TopologyData | null;
```

In `sections.Update` `Partial<{...}>`, add:
```ts
topology_data: TopologyData | null;
```

The final `sections` entry in `lib/supabase/types.ts` should look like:

```ts
sections: {
  Row: {
    id: string;
    module_id: string;
    kind: SectionKind;
    heading: string;
    body_md: string;
    sort_order: number;
    ide_language: "python" | "sql" | "java" | "c" | null;
    starter_code: string | null;
    topology_data: TopologyData | null;
  };
  Insert: {
    id?: string;
    module_id: string;
    kind: SectionKind;
    heading: string;
    body_md: string;
    sort_order: number;
    ide_language?: "python" | "sql" | "java" | "c" | null;
    starter_code?: string | null;
    topology_data?: TopologyData | null;
  };
  Update: Partial<{
    module_id: string;
    kind: SectionKind;
    heading: string;
    body_md: string;
    sort_order: number;
    ide_language: "python" | "sql" | "java" | "c" | null;
    starter_code: string | null;
    topology_data: TopologyData | null;
  }>;
};
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```

Expected: exit 0

- [ ] **Step 4: Commit**

```bash
git add lib/supabase/types.ts
git commit -m "feat(db): add topology_data to Supabase TypeScript types"
```

---

## Task 7: Wire TopologyViewer into the App

**Files:**
- Modify: `components/SectionRenderer.tsx`
- Modify: `app/year/[yearId]/subjects/[subjectId]/modules/[moduleId]/page.tsx`

### 7a: SectionRenderer

- [ ] **Step 1: Add the import and dynamic loader**

At the top of `components/SectionRenderer.tsx`, after the existing `dynamic` import:

```ts
import type { TopologyData } from "@/lib/topology/types";

const TopologyViewer = dynamic(
  () => import("./topology/TopologyViewer").then(m => ({ default: m.TopologyViewer })),
  { ssr: false, loading: () => <div className="h-56 bg-ink-faint/10 animate-pulse" /> }
);
```

- [ ] **Step 2: Add `topology_data` to the `Section` interface**

```ts
interface Section {
  id: string;
  kind: string;
  heading: string;
  body_md: string;
  sort_order: number;
  ide_language?: "python" | "sql" | "java" | "c" | null;
  starter_code?: string | null;
  topology_data?: TopologyData | null;   // ← add this
}
```

- [ ] **Step 3: Render the topology viewer after the body markdown**

In the `return` of `SectionRenderer`, after the `<BodyMarkdown>` div and before the IDE playground block:

```tsx
{section.topology_data && (
  <div className="mt-6 pl-10 md:pl-12">
    <TopologyViewer data={section.topology_data} />
  </div>
)}
```

The full return should look like:

```tsx
return (
  <section>
    <div className="flex items-baseline gap-4 mb-6">
      <span className="label-sm shrink-0">{String(index + 1).padStart(2, "0")}</span>
      <h2 className="font-serif text-2xl md:text-3xl text-ink leading-tight">{section.heading}</h2>
    </div>
    <div className="pl-10 md:pl-12">
      <BodyMarkdown body={section.body_md} />
    </div>
    {section.topology_data && (
      <div className="mt-6 pl-10 md:pl-12">
        <TopologyViewer data={section.topology_data} />
      </div>
    )}
    {section.ide_language && (
      <div className="mt-6 pl-10 md:pl-12">
        <Playground
          languageId={section.ide_language}
          initialCode={section.starter_code ?? undefined}
        />
      </div>
    )}
    {section.kind === "activity" && unlockAll && (
      <div className="mt-4 pl-10 md:pl-12">
        <span className="label-sm text-accent">Activity (UNLOCK_ALL active)</span>
      </div>
    )}
  </section>
);
```

### 7b: Module page — add `topology_data` to the select query

- [ ] **Step 4: Update the content sections select in `app/year/[yearId]/subjects/[subjectId]/modules/[moduleId]/page.tsx`**

Change line 26:
```ts
// Before:
.select("id, kind, heading, body_md, sort_order, ide_language, starter_code")

// After:
.select("id, kind, heading, body_md, sort_order, ide_language, starter_code, topology_data")
```

- [ ] **Step 5: Type-check**

```bash
npx tsc --noEmit
```

Expected: exit 0

- [ ] **Step 6: Commit**

```bash
git add components/SectionRenderer.tsx "app/year/[yearId]/subjects/[subjectId]/modules/[moduleId]/page.tsx"
git commit -m "feat(topology): wire TopologyViewer into SectionRenderer and module page"
```

---

## Task 8: Seed Data Migration

**Files:**
- Create: `supabase/migrations/20260618000001_topology_seed.sql`

All 7 section IDs are confirmed by live DB query.

- [ ] **Step 1: Create the seed migration**

```sql
-- supabase/migrations/20260618000001_topology_seed.sql

-- 1. Network Representations and Topologies (id: 088c68ab-f51a-497f-8793-4bf20660a00a)
UPDATE sections SET topology_data = $t${
  "title": "Star Topology",
  "viewBox": "0 0 640 360",
  "nodes": [
    {"id":"r0",  "type":"router", "label":"R0",  "x":320, "y":70,  "info":{"role":"Gateway Router","ip":"192.168.1.1","ports":"4× Ethernet"}},
    {"id":"sw0", "type":"switch", "label":"SW0", "x":320, "y":200, "info":{"role":"Core Switch","ports":"24-port Fast Ethernet"}},
    {"id":"pc1", "type":"pc",     "label":"PC1", "x":100, "y":80,  "info":{"role":"End Device","ip":"192.168.1.10"}},
    {"id":"pc2", "type":"pc",     "label":"PC2", "x":540, "y":80,  "info":{"role":"End Device","ip":"192.168.1.11"}},
    {"id":"pc3", "type":"pc",     "label":"PC3", "x":100, "y":310, "info":{"role":"End Device","ip":"192.168.1.12"}},
    {"id":"pc4", "type":"pc",     "label":"PC4", "x":540, "y":310, "info":{"role":"End Device","ip":"192.168.1.13"}}
  ],
  "edges": [
    {"from":"r0",  "to":"sw0", "type":"ethernet"},
    {"from":"sw0", "to":"pc1", "type":"ethernet"},
    {"from":"sw0", "to":"pc2", "type":"ethernet"},
    {"from":"sw0", "to":"pc3", "type":"ethernet"},
    {"from":"sw0", "to":"pc4", "type":"ethernet"}
  ]
}$t$::jsonb
WHERE id = '088c68ab-f51a-497f-8793-4bf20660a00a';

-- 2. Common Network Types (id: 92bf0092-bcfa-4698-84ac-6d067ff9070c)
UPDATE sections SET topology_data = $t${
  "title": "Local Area Network (LAN)",
  "viewBox": "0 0 640 320",
  "nodes": [
    {"id":"inet", "type":"cloud",  "label":"Internet", "x":320, "y":60,  "info":{"role":"WAN / ISP"}},
    {"id":"r0",   "type":"router", "label":"R0",       "x":320, "y":170, "info":{"role":"Edge Router","ip":"203.0.113.1","ports":"WAN + LAN"}},
    {"id":"sw0",  "type":"switch", "label":"SW0",      "x":320, "y":275, "info":{"role":"LAN Switch","ports":"24-port Fast Ethernet"}},
    {"id":"pc1",  "type":"pc",     "label":"PC1",      "x":160, "y":275, "info":{"role":"End Device","ip":"192.168.1.10"}},
    {"id":"pc2",  "type":"pc",     "label":"PC2",      "x":480, "y":275, "info":{"role":"End Device","ip":"192.168.1.11"}}
  ],
  "edges": [
    {"from":"inet","to":"r0",  "type":"serial"},
    {"from":"r0",  "to":"sw0", "type":"ethernet"},
    {"from":"sw0", "to":"pc1", "type":"ethernet"},
    {"from":"sw0", "to":"pc2", "type":"ethernet"}
  ]
}$t$::jsonb
WHERE id = '92bf0092-bcfa-4698-84ac-6d067ff9070c';

-- 3. End Devices and Intermediary Devices (id: 3f8c49af-afd2-4ef6-8462-d277330d306b)
UPDATE sections SET topology_data = $t${
  "title": "End Devices vs. Intermediary Devices",
  "viewBox": "0 0 640 340",
  "nodes": [
    {"id":"r0",  "type":"router", "label":"R0",  "x":320, "y":70,  "info":{"role":"Intermediary — Router","extra":"Routes packets between networks"}},
    {"id":"sw0", "type":"switch", "label":"SW0", "x":180, "y":190, "info":{"role":"Intermediary — Switch","extra":"Forwards frames within LAN"}},
    {"id":"sw1", "type":"switch", "label":"SW1", "x":460, "y":190, "info":{"role":"Intermediary — Switch","extra":"Forwards frames within LAN"}},
    {"id":"pc1", "type":"pc",     "label":"PC1", "x":80,  "y":300, "info":{"role":"End Device — PC","ip":"192.168.1.10"}},
    {"id":"pc2", "type":"pc",     "label":"PC2", "x":280, "y":300, "info":{"role":"End Device — PC","ip":"192.168.1.11"}},
    {"id":"srv", "type":"server", "label":"SRV", "x":460, "y":300, "info":{"role":"End Device — Server","ip":"192.168.2.50","ports":"HTTP, SSH"}}
  ],
  "edges": [
    {"from":"r0",  "to":"sw0", "type":"ethernet"},
    {"from":"r0",  "to":"sw1", "type":"ethernet"},
    {"from":"sw0", "to":"pc1", "type":"ethernet"},
    {"from":"sw0", "to":"pc2", "type":"ethernet"},
    {"from":"sw1", "to":"srv", "type":"ethernet"}
  ]
}$t$::jsonb
WHERE id = '3f8c49af-afd2-4ef6-8462-d277330d306b';

-- 4. Peer-to-Peer Networks (id: 2c11490c-a474-413a-866d-51f7afa08126)
UPDATE sections SET topology_data = $t${
  "title": "Peer-to-Peer Network",
  "viewBox": "0 0 640 200",
  "nodes": [
    {"id":"pc1", "type":"pc", "label":"PC1", "x":160, "y":100, "info":{"role":"Peer","ip":"169.254.0.1","ports":"1× NIC","extra":"Both devices share files directly — no server needed"}},
    {"id":"pc2", "type":"pc", "label":"PC2", "x":480, "y":100, "info":{"role":"Peer","ip":"169.254.0.2","ports":"1× NIC"}}
  ],
  "edges": [
    {"from":"pc1","to":"pc2","type":"crossover","label":"Crossover Cable"}
  ]
}$t$::jsonb
WHERE id = '2c11490c-a474-413a-866d-51f7afa08126';

-- 5. Basic Device Configuration (id: 0633e3ef-2380-4023-86c0-2cc741557fb1)
UPDATE sections SET topology_data = $t${
  "title": "Basic Switch Configuration",
  "viewBox": "0 0 640 280",
  "nodes": [
    {"id":"sw0",   "type":"switch", "label":"SW0",   "x":320, "y":110, "info":{"role":"Layer 2 Switch","extra":"hostname SW0\nservice password-encryption"}},
    {"id":"pc1",   "type":"pc",     "label":"PC1",   "x":100, "y":230, "info":{"role":"End Device","ip":"192.168.1.10","ports":"Fa0/1"}},
    {"id":"pc2",   "type":"pc",     "label":"PC2",   "x":320, "y":230, "info":{"role":"End Device","ip":"192.168.1.11","ports":"Fa0/2"}},
    {"id":"admin", "type":"pc",     "label":"Admin", "x":540, "y":230, "info":{"role":"Admin PC","ip":"192.168.1.20","ports":"Fa0/3"}}
  ],
  "edges": [
    {"from":"sw0","to":"pc1",   "type":"ethernet","label":"Fa0/1"},
    {"from":"sw0","to":"pc2",   "type":"ethernet","label":"Fa0/2"},
    {"from":"sw0","to":"admin", "type":"ethernet","label":"Fa0/3"}
  ]
}$t$::jsonb
WHERE id = '0633e3ef-2380-4023-86c0-2cc741557fb1';

-- 6. Ports, Interfaces, and Addresses (id: 199c57e3-1ade-4776-a2c1-8547f54ccd58)
UPDATE sections SET topology_data = $t${
  "title": "Router Interfaces",
  "viewBox": "0 0 640 280",
  "nodes": [
    {"id":"r0",  "type":"router", "label":"R0",  "x":320, "y":100, "info":{"role":"Router","extra":"Two interfaces — each connects a different network"}},
    {"id":"sw0", "type":"switch", "label":"SW0", "x":140, "y":220, "info":{"role":"LAN Switch","ip":"192.168.1.0/24 network","ports":"Fa0/0 → 192.168.1.1"}},
    {"id":"sw1", "type":"switch", "label":"SW1", "x":500, "y":220, "info":{"role":"LAN Switch","ip":"10.0.0.0/24 network","ports":"Fa0/1 → 10.0.0.1"}}
  ],
  "edges": [
    {"from":"r0","to":"sw0","type":"ethernet","label":"Fa0/0"},
    {"from":"r0","to":"sw1","type":"ethernet","label":"Fa0/1"}
  ]
}$t$::jsonb
WHERE id = '199c57e3-1ade-4776-a2c1-8547f54ccd58';

-- 7. Topologies (Data Link Layer) (id: 1cd12730-e22c-40a8-a8bc-767b08bdbd8e)
UPDATE sections SET topology_data = $t${
  "title": "Ring Topology",
  "viewBox": "0 0 640 360",
  "nodes": [
    {"id":"pc1", "type":"pc", "label":"PC1", "x":320, "y":60,  "info":{"role":"Node 1","extra":"Token passes clockwise around the ring"}},
    {"id":"pc2", "type":"pc", "label":"PC2", "x":550, "y":190, "info":{"role":"Node 2"}},
    {"id":"pc3", "type":"pc", "label":"PC3", "x":320, "y":320, "info":{"role":"Node 3"}},
    {"id":"pc4", "type":"pc", "label":"PC4", "x":90,  "y":190, "info":{"role":"Node 4"}}
  ],
  "edges": [
    {"from":"pc1","to":"pc2","type":"ethernet"},
    {"from":"pc2","to":"pc3","type":"ethernet"},
    {"from":"pc3","to":"pc4","type":"ethernet"},
    {"from":"pc4","to":"pc1","type":"ethernet"}
  ]
}$t$::jsonb
WHERE id = '1cd12730-e22c-40a8-a8bc-767b08bdbd8e';
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/20260618000001_topology_seed.sql
git commit -m "feat(db): seed topology diagrams for 7 networking sections"
```

---

## Task 9: Apply Migrations via Supabase MCP

- [ ] **Step 1: Apply the schema migration**

Use the Supabase MCP tool `apply_migration` with project `mpdymglipgzuybtxuvhy`:

```
name: topology_viewer
sql: alter table sections add column if not exists topology_data jsonb;
```

- [ ] **Step 2: Apply the seed migration**

Use `apply_migration` again with name `topology_seed` and the full SQL from `20260618000001_topology_seed.sql`.

- [ ] **Step 3: Verify data was seeded**

Run via `execute_sql`:
```sql
SELECT id, heading, jsonb_typeof(topology_data) as topo_type
FROM sections
WHERE topology_data IS NOT NULL
ORDER BY heading;
```

Expected: 7 rows, all with `topo_type = 'object'`.

---

## Task 10: Final Type Check

- [ ] **Step 1: Full TypeScript compile**

```bash
npx tsc --noEmit
```

Expected: exit 0

- [ ] **Step 2: Run all tests**

```bash
npm test
```

Expected: anchor tests pass, no regressions

---

## Task 11: Deploy

- [ ] **Step 1: Push to GitHub**

```bash
git push
```

- [ ] **Step 2: Deploy to Vercel production**

```bash
vercel --prod
```

- [ ] **Step 3: Smoke-check a topology section**

Open the deployed URL for the "Networking Today" module and navigate to the "Network Representations and Topologies" section. Verify:
- Star topology SVG renders with R0 + SW0 + 4 PCs
- Cables connect at device edges (not through device bodies)
- Clicking R0 shows the info panel (IP: 192.168.1.1, Role: Gateway Router)
- Clicking another device switches the info panel
- Clicking ✕ closes the panel

---

## Self-Review Notes

- All 7 section IDs were verified against the live DB before writing the seed SQL
- `DeviceIcon` is NOT `"use client"` — it has no hooks, is rendered inside TopologyViewer which IS client-side
- `topology_data` is optional in `SectionRenderer`'s `Section` interface so activity-section synthetic objects (which don't have the field) compile cleanly
- The Supabase jsonb column auto-parses to a JS object; no JSON.parse() needed anywhere
- Edge cable rendering order: edges first → devices on top → no overlap
- `DEVICE_HALF` is exported from `anchors.ts` and reused in `DeviceIcon.tsx` for the selection ring radius — single source of truth for bounding box sizes
