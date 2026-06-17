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
