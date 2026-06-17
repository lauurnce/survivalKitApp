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
