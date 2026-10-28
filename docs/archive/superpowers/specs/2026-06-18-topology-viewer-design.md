# Network Topology Viewer — Design Spec

**Date:** 2026-06-18
**Status:** Approved

---

## Goal

Embed interactive Cisco-style network topology diagrams inside networking module sections. Students click any device to see its IP address, role, and port info in a tooltip. Diagrams are read-only (no drag/rearrange) and render entirely in SVG — no external libraries.

---

## Architecture

Follows the same pattern as the IDE playground:
- New `topology_data jsonb` column on `sections` (nullable — omitting it leaves the section unchanged)
- `SectionRenderer` checks `section.topology_data` and lazy-loads `<TopologyViewer>`
- `TopologyViewer` is a `"use client"` component that renders SVG and manages click state

---

## Data Model

### Migration: `supabase/migrations/20260618000000_topology_viewer.sql`

```sql
alter table sections add column if not exists topology_data jsonb;
```

### TypeScript: `lib/topology/types.ts`

```ts
export type DeviceType = 'router' | 'switch' | 'pc' | 'server' | 'laptop' | 'hub' | 'firewall' | 'cloud';

export interface TopologyNode {
  id: string;
  type: DeviceType;
  label: string;
  x: number;        // SVG coordinate
  y: number;        // SVG coordinate
  info: {
    ip?: string;
    role: string;
    ports?: string;
    extra?: string;
  };
}

export interface TopologyEdge {
  from: string;     // node id
  to: string;       // node id
  type?: 'ethernet' | 'serial' | 'crossover' | 'wireless';
  label?: string;   // e.g. "Fa0/0"
}

export interface TopologyData {
  title: string;
  viewBox?: string;   // defaults to "0 0 640 340"
  nodes: TopologyNode[];
  edges: TopologyEdge[];
}
```

---

## Components

### `lib/topology/anchors.ts`
Pure function: given a node (type, x, y) and the direction of the cable (angle toward the other device), returns the SVG point on the device's boundary where the cable should terminate. This keeps cables from overlapping device bodies.

Device boundary definitions:
- **router**: ellipse — bottom of cylinder (y + 22), left/right at x ± 32
- **switch**: isometric box — top vertex (x, y−24), left (x−48, y+8), right (x+48, y+8), bottom-left (x−24, y+32), bottom-right (x+24, y+32)
- **pc / laptop / server / hub / firewall / cloud**: bounding rect — nearest edge point to cable direction

### `components/topology/DeviceIcon.tsx`
`"use client"` — renders the correct SVG `<g>` for each `DeviceType`. Accepts `selected` prop (boolean) and adds a subtle highlight ring when true. Icons:
- **router**: blue cylinder disc with 4 white radial arrows (approved design)
- **switch**: blue 3D isometric box with X-pattern white diagonal arrows (approved design)
- **pc**: monitor + stand + keyboard
- **server**: rack unit stack with green LEDs
- **laptop**: open laptop
- **hub**: flat box with port circles
- **firewall**: yellow-brick wall with flame
- **cloud**: cloud shape labeled "Internet"

### `components/topology/DeviceTooltip.tsx`
Renders a floating tooltip panel anchored above or below the clicked device. Shows:
- Device label (bold, monospace)
- IP address (if present)
- Role
- Ports (if present)
- Extra info (if present)

Closes on click-outside or pressing Escape. No external library.

### `components/topology/TopologyViewer.tsx`
Main `"use client"` component. Props: `{ data: TopologyData }`.

Renders:
1. Title bar (`§ TOPOLOGY — {data.title}`)
2. SVG canvas (viewBox from data, default `0 0 640 340`)
   - Edges drawn first (behind devices) using `anchors.ts` to compute endpoints
   - Edge labels rendered as small monospace text at cable midpoint
   - Device icons rendered on top via `<DeviceIcon>`
   - Click handler on each device `<g>` sets `selectedId` state
3. `<DeviceTooltip>` rendered when `selectedId` is set

Cable stroke styles:
- `ethernet`: solid `#444`, stroke-width 2
- `serial`: dashed `#444`, stroke-dasharray `8 4`
- `crossover`: solid `#c0392b` (red), stroke-width 2
- `wireless`: curved path, stroke `#444`, stroke-dasharray `4 4`

---

## SectionRenderer Changes

Add to `Section` interface:
```ts
topology_data?: TopologyData | null;
```

Add lazy import (same pattern as Playground):
```ts
const TopologyViewer = dynamic(
  () => import("./topology/TopologyViewer").then(m => ({ default: m.TopologyViewer })),
  { ssr: false, loading: () => <div className="h-64 bg-ink-faint/10 animate-pulse" /> }
);
```

Render after the body markdown (before the IDE playground if both exist):
```tsx
{section.topology_data && (
  <div className="mt-6 pl-10 md:pl-12">
    <TopologyViewer data={section.topology_data} />
  </div>
)}
```

---

## Seed Data — Sections That Get Topologies

| Section heading | Section ID | Topology |
|---|---|---|
| Network Representations and Topologies | `088c68ab-...` | Star: Router→Switch→4×PC |
| Common Network Types | `92bf0092-...` | Two diagrams: Bus (4 PCs on bus) + Ring (4 nodes) |
| Peer-to-Peer Networks | `2c11490c-...` | P2P: 2 PCs directly connected |
| End Devices and Intermediary Devices | `3f8c49af-...` | Router + Switch + 2 PCs + Server |
| Basic Device Configuration | `0633e3ef-...` | Switch (SW0) with 3 PCs, IPs labeled |
| Ports, Interfaces, and Addresses | `199c57e3-...` | Router with Fa0/0 and Fa0/1 labeled |
| Topologies (Data Link Layer) | `1cd12730-...` | Bus topology (4 nodes on shared bus) |

Seed applied via `supabase/migrations/20260618000001_topology_seed.sql` — one `UPDATE sections SET topology_data = '...'::jsonb WHERE id = '...'` per section.

---

## File Map

| File | Action |
|---|---|
| `supabase/migrations/20260618000000_topology_viewer.sql` | Create — adds `topology_data` column |
| `supabase/migrations/20260618000001_topology_seed.sql` | Create — seeds 7 sections with topology JSON |
| `lib/topology/types.ts` | Create — TypeScript types |
| `lib/topology/anchors.ts` | Create — cable anchor point calculation |
| `components/topology/DeviceIcon.tsx` | Create — SVG icons per device type |
| `components/topology/DeviceTooltip.tsx` | Create — click tooltip panel |
| `components/topology/TopologyViewer.tsx` | Create — main viewer component |
| `components/SectionRenderer.tsx` | Modify — add topology_data to Section + lazy-load viewer |

---

## Out of Scope

- Drag-and-drop topology builder (future)
- Student-editable topologies
- Animations / packet simulation
- More than one topology per section (seed data has one per section; "Common Network Types" uses a split layout within one viewer)
