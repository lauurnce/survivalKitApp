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
