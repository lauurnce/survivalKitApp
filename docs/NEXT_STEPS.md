# BSIT Survival Kit — Next Steps

A running list of planned features and improvements. Items are roughly prioritized top to bottom.

---

## 1. Network Topology Viewer

**For:** Data Communications & Networking, Networking Administration

Interactive Cisco-style topology diagrams embedded directly inside networking module sections — similar to how the IDE playground is embedded in programming sections.

Ideas:
- Show topologies (Bus, Star, Ring, Mesh, Hybrid) as visual diagrams
- Label devices (routers, switches, end devices) with Cisco-style icons
- Let students click a device to see its role/specs
- Possible: drag-and-drop topology builder as an activity section

**Trigger:** Add a `topology` field to sections (like `ide_language`), store topology data as JSON in the DB.

---

## 2. Monetization

Current unlock model: ₱20 GCash per module, manual approval.

Possible improvements:
- **Semester pass** — unlock all modules for a subject or semester at a fixed price
- **Auto-approval** — integrate GCash/PayMongo API to remove manual verification
- **Tiered access** — free preview content, paid full access per year level
- **Promo codes** — discount codes for referrals or class bulk purchases

---

## 3. Backlog / Ideas

- Push notifications when unlock is approved
- Student progress tracking (which sections read, % complete per module)
- Search across all content
- Quiz/self-assessment sections
- Dark mode
