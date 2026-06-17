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
