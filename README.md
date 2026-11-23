# Grid Production Twin

A browser-based 3D digital twin of the Grid production and store rooms (Level 1), built for the control-room wall screen. It shows every room at true scale and every machine in its true position (drawn slightly smaller so the aisles read clearly), and colours each machine by its live state once a data feed is connected.

**Areas covered:**
- SMT clean room (3 lines)
- Hybrid Room
- Laser Room and Test Lab
- SMT Holding Area
- HASS
- Selective Wave Soldering
- Conformal Coating / Degreaser
- IQC and the Changing Room
- Core X
- Smart Warehouse, corridors and lobbies (for context)

## Contents

1. [Sources](#sources)
2. [Quick start](#quick-start)
3. [Hosting](#hosting)
4. [Control-room screen setup](#control-room-screen-setup)
5. [Using the twin](#using-the-twin)
6. [Editing the layout](#editing-the-layout)
7. [Connecting live data](#connecting-live-data)
8. [Asset IDs](#asset-ids)
9. [Project files](#project-files)
10. [layout.json reference](#layoutjson-reference)
11. [Machine models](#machine-models)
12. [Rendering notes](#rendering-notes)
13. [Troubleshooting](#troubleshooting)
14. [Open items to confirm](#open-items-to-confirm)
15. [Licences](#licences)

---

## Sources

| What | Source |
|---|---|
| Room walls, doors, exits | Level 1 vicinity plan **DS/1034/STE/L1/01-00B**, 1:250, 12 May 2026 |
| Machine positions | Room layout drawings: SMT, Hybrid, Laser, Laser & SMT Holding Area, HASS, Coating & Degreaser room |
| Models, sizes, heights, power, utilities, owners | **Equipment List, 23 Sep 26** |
| Machine look (shape, colours) | Manufacturer product photos |

**Scale:** 1 plan unit = 35 mm. All 3D sizes are in metres.

**Current model:** 34 room pieces, 23 doors, 111 assets.

| Room | Assets |
|---|---|
| Clean Room (SMT) | 37 |
| Hybrid Room | 23 |
| Laser Room | 19 |
| HASS | 14 |
| Test Lab | 5 |
| IQC | 5 |
| Changing Room | 3 |
| SMT Holding Area | 2 |
| Conformal Coating / Degreaser | 2 |
| Selective Wave Soldering | 1 |

---

## Quick start

The twin is a static website: there is no build step and no server code. three.js is included in `vendor/`, so it also works on an offline factory network.

```bash
cd f17-twin
python -m http.server 8080
```

Then open http://localhost:8080.

> Opening `index.html` directly from disk (`file://`) does **not** work. Browsers block module scripts and `fetch` there, so always serve the folder over http or https.

---

## Hosting

| Where | How |
|---|---|
| IIS, nginx or Apache | Copy the folder into the web root. Serve `.js` as `text/javascript` and `.json` as `application/json` (the default on all three). |
| GitHub Pages, Azure Static Web Apps, S3 or similar | Upload the folder as it is. |
| Sub-folder (e.g. `http://server/f17-twin/`) | Works as is, because all paths are relative. |

No database or back end is needed. The only file you'll change routinely is `data/layout.json` (the room and machine layout). `data/config.json` (the data source) is set once.

---

## Control-room screen setup

1. Use Chrome or Edge with hardware acceleration on (WebGL required).
2. Start in kiosk mode:
   ```
   chrome --kiosk http://server/f17-twin/
   ```
3. Open **VIEW** and pick a camera, or **Tour (slow orbit)** for an unattended display.
4. To show one machine on start-up, add its ID to the URL: `http://server/f17-twin/#L2-PNP1`.
5. To start with the Smart Warehouse hidden or shown regardless of the saved choice, add `?warehouse=0` or `?warehouse=1` to the address.

A mid-range office PC with integrated graphics is enough. The scene is about 1,400 parts and 37,000 triangles (about 1,500 draw calls, plus the shadow pass), with soft shadows. The page uses about 17 MB of JavaScript memory.

---

## Using the twin

### Top bar
- **Status pill:** shows **No live data**, **Connecting**, **Live**, **Reconnecting** or **Demo data** (only if demo mode is switched on in `data/config.json`).
- **Clock**
- **VIEW** dropdown:
  - Camera: **3D overview**, **Top view**, **SMT lines**, **Hybrid Room**
  - Display: **Walls**, **Warehouse** (show or hide the Smart Warehouse; remembered in that browser), **Tour (slow orbit)**, **Full screen**
- **EDIT LAYOUT** (see [Editing the layout](#editing-the-layout))

### Equipment panel (left)
- **State counters** (Running, Idle, Down, Maint., No data). Click one to show only those machines.
- **Line chips** (LINE 1–3) show the worst state on each SMT line. Click a chip to fly the camera to that line.
- **Search** finds machines by name, ID, room or type.
- **List** is grouped by room. Click a machine to select it and fly to it.

### Detail card (right)
For the selected machine, the card shows:
- Basic details: ID, type, model, room, line, footprint, height.
- Equipment-list details: power, utilities and owner.
- Live data: state, last update time and any live metrics.
- Layout changes: a **Moved** row if the machine was moved, or a **Copy of** row if it is a pasted copy.

**Link to this machine** is a direct URL to it (`#ID`), for bookmarks or a kiosk start page.

### In the 3D view
| Action | Mouse | Keyboard |
|---|---|---|
| Rotate | Left-drag | |
| Pan | Right-drag | |
| Zoom | Scroll | |
| Name of a machine or room | Hover | |
| Select a machine | Click | |
| Search | | `/` |
| Close details | | `Esc` |

---

## Editing the layout

Click **EDIT LAYOUT**. An amber editing bar appears at the bottom of the screen.

### Move and rotate
| Action | How |
|---|---|
| Move | Drag a machine across the floor (snaps to 5 cm) |
| Nudge | Arrow keys: 10 cm (hold Shift for 50 cm) |
| Rotate 90° | **R** or **ROTATE 90°** |
| Undo | **Ctrl+Z** or **UNDO** |

### Copy, paste, delete
| Action | How |
|---|---|
| Copy | Select a machine, then **Ctrl+C** or **COPY** |
| Paste | **Ctrl+V** pastes where the pointer is; **PASTE** places it 1 m away |
| Duplicate | **Ctrl+D** (copy and paste in one step) |
| Delete a pasted copy | **Delete** key or **DELETE** |

A pasted copy:
- gets the next free ID (`HYB-DB-02` → `HYB-DB-03`);
- is named "… (copy)";
- keeps the original's model, size, specs and facing;
- shows a **Copy of** row in its detail card;
- is not part of an SMT line's flow arrows or line status.

Only pasted copies can be deleted here. To remove a machine that comes from the drawings, edit `data/layout.json`.

### Saving and publishing
- Edits and copies save automatically, **in that browser only**. Other screens keep showing the official layout.
- To make a layout official, click **DOWNLOAD LAYOUT** (or **COPY LAYOUT**) and replace `data/layout.json` on the server. Moved machines get new `x`/`y` and a `rot` value in degrees. Pasted copies are included.
- **RESET ALL** (press twice within 6 seconds) puts every machine back to its drawing position and removes pasted copies.
- **DONE** leaves edit mode.

Browser storage keys: `f17-twin-layout-v2` (moves) and `f17-twin-copies-v2` (pasted copies). Clearing site data for the page also clears unsaved edits.

---

## Connecting live data

Set `dataSource.type` in `data/config.json`:

```json
{
  "staleAfterSeconds": 30,
  "dataSource": {
    "type": "websocket",
    "websocketUrl": "wss://your-gateway/f17/state",
    "restUrl": "/api/f17/state",
    "pollSeconds": 5
  },
  "demoMode": false,
  "machineScale": 0.765
}
```

| `type` | Behaviour |
|---|---|
| `"websocket"` | Connects to `websocketUrl`. If the link drops, it reconnects automatically, waiting longer between attempts (1 s, 2 s, 4 s … up to 30 s). |
| `"rest"` | Polls `restUrl` every `pollSeconds`. |
| `"none"` | Static model: every machine shows **No live data** (the default). |

### Message format
WebSocket and REST use the same JSON. Send every machine once, then only the ones that changed:

```json
{ "assets": [
  { "id": "L1-PNP",    "state": "RUN",  "ts": "2026-11-02T13:00:00Z", "metrics": { "oee": 0.86, "count": 1240 } },
  { "id": "HYB-DB-01", "state": "DOWN", "ts": "2026-11-02T13:00:02Z", "metrics": { "alarm": "E-204 bond head" } }
]}
```

| `state` | Colour | Signal tower |
|---|---|---|
| `RUN` | green | green lamp |
| `IDLE` | amber | amber lamp |
| `DOWN` | red, pulsing floor ring | red lamp |
| `MAINT` | blue | no lamp lit |
| `OFF` | grey | no lamp lit |

- Every key in `metrics` appears in the detail card. `oee` values of 1 or less are shown as a percentage.
- If a machine gets no update for `staleAfterSeconds`, it drops back to **No live data**, so a dead feed never looks healthy.
- SMT conveyor arrows animate only when every machine on that line is `RUN`.

### Gateway options
The usual set-ups are:
- **Node-RED, Kepware or Ignition** reading OPC UA, SECS/GEM or PLC tags and publishing the JSON over a WebSocket.
- **An MQTT broker** with a WebSocket listener, plus a small bridge.

Keep the gateway on the plant network. The browser only ever reads.

### Demo data
Setting `"demoMode": true` in `data/config.json` fills the model with random states for training and screen tests. There is no button for it on screen. It is off by default, and the status pill says **Demo data** while it's on. Benches, cabinets, racks and conveyors never get a state.

---

## Asset IDs

IDs are stable. They're used in the list, the detail card, the URL (`#ID`) and the live feed, so map them to your MES and PLC tag names in the gateway.

### SMT lines
Line numbers follow the equipment list: Line 1 is the east column and Line 3 the west. Boards flow south → north: printer → SPI → mounters → oven.

| Line | Machines |
|---|---|
| 1 | `L1-PRN` DEK Horizon 03iX · `L1-SPI` Parmi Sigma XL · `L1-PNP` MyData MY100 · `L1-RFL` Asscon VP6000 |
| 2 | `L2-PRN` DEK Horizon 03i · `L2-SPI` Parmi Sigma XL · `L2-PNP1` Yamaha YS100 · `L2-PNP2` Yamaha YS88 · `L2-TRL` tray loader · `L2-RFL` Asscon VP6000 |
| 3 | `L3-PRN` DEK Horizon · `L3-SPI` Parmi Sigma XL · `L3-PNP1`–`L3-PNP3` ASMPT SIPLACE TX · `L3-RFL` Vitronics MR933 |

Conveyors are `L<n>-CNV-<nn>` and have no live state.

### Other rooms
Pattern: `<ROOM>-<TYPE>-<nn>`

| Prefix | Room | Examples |
|---|---|---|
| `SMT-` | Clean room, off-line | `SMT-AOI-01` Mirtec AOI, `SMT-XRY-01/02` Shimadzu X-ray, `SMT-N2C-nn` N2 cabinets |
| `HYB-` | Hybrid Room | `HYB-DB-01/02` Palomar die bonders, `HYB-WBP-01` Palomar 9000, `HYB-WBH-01` Hesse BJ855, `HYB-PLS-01` plasma, `HYB-LBA-01` laser ball attach, `HYB-WB-nn` benches |
| `LASER-` | Laser Room | `LASER-GBX-01` glovebox, `LASER-ENG-01` engraver, `LASER-FLT-01/02` INFICON leak testers, `LASER-GPC-nn` pressure chambers, `LASER-BMB-nn` bombing chambers, `LASER-BBT-nn` bubble testers |
| `TLAB-` | Test Lab | tables, N2 cabinets |
| `HOLD-` | SMT Holding Area | `HOLD-MYT-01` MYTower, `HOLD-FP-01` flying probe |
| `HASS-` | HASS | `HASS-HALT-01/02` Qualmark Typhoon, `HASS-TSC-01` ESPEC thermal shock, `HASS-CHL-01` chiller, `HASS-MST-01` mechanical shock |
| `SEL-` | Selective Wave Soldering | `SEL-WAV-01` InterSelect |
| `CONF-` | Conformal Coating / Degreaser | `CONF-DGR-01` Crest degreaser, `CONF-CCT-01` Mycronic coater |
| `IQC-`, `CHG-` | IQC, Changing Room | workstations, racks, benches |

---

## Project files

```
f17-twin/
├── index.html            page shell (top bar, panels, edit bar)
├── README.md             this file
├── css/style.css         control-room theme and layout
├── js/app.js             scene, rooms, walls, doors, UI, selection, views, editing
├── js/models.js          3D machine models, one per machine family
js/engine.js          picks the 3D engine from the address and reports what it draws with
├── js/feed.js            live-data adapter (WebSocket / REST / demo)
├── data/layout.json      rooms, room outlines, doors and all assets
├── data/config.json      data source and stale timeout
└── vendor/three/         three.js r160 + OrbitControls (MIT licence), the normal engine
vendor/three-r187/    three.js r187 WebGPU build + OrbitControls (MIT licence), the ?engine=webgpu test engine
```

---

## layout.json reference

**Coordinates:** plan units (1 unit = 35 mm). `x` grows to the east and `y` to the south, and `x`,`y` is the top-left (north-west) corner of the footprint.

### rooms[]
```json
{ "code": "HYB", "name": "Hybrid Room · 1K", "x": 325.5, "y": 623.2, "w": 217.1, "h": 512.1,
  "context": false, "hatch": false, "corridor": false, "restricted": false }
```

| Field | Meaning |
|---|---|
| `context` | Outside the production area (drawn darker, no walls) |
| `hatch` | Store or plant room shading |
| `corridor` | Drawn without walls |
| `restricted` | Red wall edges |
| `group` | Several floor pieces that form one room; their walls come from `outlines` |

### outlines[]
One polygon per grouped room: `{ "points": [[x,y], …], "restricted": true }`.

### doors[]
```json
{ "h": [x,y], "c": [x,y], "o": [x,y], "exit": false }
```
- `h` is the hinge, `c` the closed-leaf end and `o` the open-leaf end.
- `exit: true` draws an amber emergency-exit leaf.

### assets[]
```json
{ "id": "L2-PNP1", "name": "Yamaha YS100 Mounter 1", "type": "Placement", "room": "Clean Room (SMT) · 100K",
  "line": 2, "x": 773.9, "y": 736.4, "w": 51.3, "h": 46.7, "hgt": 1.45,
  "model": "Yamaha YS100", "power": "400V 3P 32A", "owner": "Robin / Swee Peng" }
```

| Field | Required | Meaning |
|---|---|---|
| `id` | yes | Stable ID (see [Asset IDs](#asset-ids)) |
| `name`, `type`, `room` | yes | `type` also chooses the 3D model and whether the machine gets a live state |
| `x`, `y`, `w`, `h` | yes | Footprint in plan units |
| `hgt` | no | Height in metres |
| `line` | no | SMT line number (1–3) |
| `model`, `power`, `utilities`, `owner` | no | Shown in the detail card |
| `rot` | no | Extra rotation in degrees, written by Edit Layout |
| `face` | no | Fixed facing in degrees: 0 = front to the south, 90 = east, -90 = west, 180 = north |
| `copyOf` | no | Set on pasted copies |

**Types without a live state:** Work Bench, Bench, Table, Rack, Metal Rack, Metal Cabinet, Cabinet, N2 Cabinet, Dry Cabinet, ESD Shelves, IQC Workstations, Conveyor, Controller, Chiller.

---

## Machine models

`js/models.js` builds each machine family from simple shapes, coloured and proportioned after manufacturer photos and sized from the equipment list.

| Family | Look |
|---|---|
| DEK Horizon printers | White lower body, charcoal rounded side shells, smoked domed hood, front monitor |
| Parmi Sigma SPI | Grey base, orange band, black glass upper box |
| MyData MY100 | Wide grey chassis, charcoal sloped ends, clear hood over the feeder bed |
| Yamaha YS100 / YS88, tray loader | White body, black feeder banks front and back, monitor on top |
| ASMPT SIPLACE TX | Charcoal hood with red trim, feeder tables with reel trolleys |
| Vitronics Soltec MR933 | Long light-grey oven, rounded silver hood, entry console |
| Asscon VP6000 | Off-white rounded body, red control end, slide-out loading tray |
| Mirtec MV-6 OMNI | Light grey cabinet, dark window, navy band |
| Shimadzu Xslicer SMX-6000 | White shielded cabinet, charcoal door, black console |
| Palomar 3500 / 3880 / 9000 | White base, blue band, glass enclosure, twin monitors |
| Hesse BONDJET BJ855 | Narrow white cabinet, glass work cell, screen in the hood |
| Qualmark Typhoon 3.0 | Off-white chamber on legs, separate controller |
| ESPEC TSD-101 | Slate-blue thermal shock chamber |
| INFICON UL1000 / UL3000 | Rounded silver cart, navy band, handle |
| Laser glovebox | Steel box, amber window, glove ports, side airlock |
| Pressure / bombing chambers | Steel cylinder on a cabinet |
| MYTower | Tall chamfered grey tower |
| InterSelect | Blue base, white upper |
| Mycronic MYC50 coater | White base, glass cell |
| Others | Plasma cleaner, laser ball attach, engraver, chiller, shock tester, N2 cabinets, racks, benches |

**Drawn size:** machines are drawn at 76.5 % of their footprint from the drawings (85 %, then a further 0.9) so the aisles read clearly (`"machineScale"` in `data/config.json`, 0.5–1; use 1 for exact size). SMT line machines shrink only across the line, so they still meet their conveyors. Benches, cabinets and racks stay full size. The detail card still shows the real footprint.

**Which way each model faces:**
- SMT line machines face west, toward the aisle between lines.
- Benches are worked from one of their long sides.
- Everything else turns its back to the nearest wall of its room.
- `face` in `layout.json` overrides all of these.

**Adding a model:** add a `case` to `build()` in `js/models.js`, map the asset `type` or `model` to it in `kindOf()`, and set `hgt` in `layout.json`.

**Exact vendor shapes:** if vendors supply CAD, convert it to GLB and load it with three.js `GLTFLoader` in place of the matching `case`.

---

## Rendering notes

These settings stop surfaces flickering while the camera moves. Keep them in mind when you edit the code:

| Setting | Why |
|---|---|
| Camera near plane 0.5 m | Finer depth precision, so surfaces that touch don't flicker |
| Every model part slightly enlarged by a different amount (0.1–0.5 %) | No two faces share the same plane |
| Shadow `bias` / `normalBias` | No striped shadows |
| Shared walls of neighbouring rooms merged into one | No overlapping glass panels |
| Glass walls drawn last (`renderOrder = 10`) | See-through parts keep a fixed draw order |
| Tinted hoods are opaque | Same reason |

If you add parts in `models.js`, avoid placing two surfaces in exactly the same plane. Offset decorations by at least 5 mm.

---

## 3D engine (normal and WebGPU test)

The twin can run on two versions of three.js, the 3D library in `vendor/`. The address chooses which one:

| Address | Engine | Route to the graphics chip |
|---|---|---|
| normal (no option) | three.js **r160** (`vendor/three/`) | WebGL |
| `?engine=webgpu` | three.js **r187** (`vendor/three-r187/`) | **WebGPU**, or WebGL 2 by itself if the browser has no usable WebGPU |
| `?engine=webgpu-webgl` | three.js r187 | WebGL 2 only (to compare the two r187 routes) |

WebGPU is a newer route to the graphics chip. On some laptops whose driver refuses WebGL (and so draws with SwiftShader, on the processor), WebGPU still reaches the chip. Combine it with the readout to see what each screen gets: `?engine=webgpu&stats=1` (the **Engine** line shows the version and route) or `?engine=webgpu&gpulog=1`.

The normal address stays on r160 until the WebGPU engine has been checked on every screen. If the WebGPU engine loses the graphics device, a red notice offers the normal engine. The choice is made in `index.html` (which build it loads) and `js/engine.js` (which renderer it creates).

## Graphics diagnostics

Add these to the address (they can be combined: `?stats=1&gpulog=1`):

| Option | Shows |
|---|---|
| `?stats=1` | Live box, bottom left: FPS, slowest frame, graphics chip in use, screen scaling, pixels drawn, draw calls |
| `?gpulog=1` | Before the twin starts, requests a 3D context six ways (WebGL2/WebGL1, with and without "graphics chip only") and records whether each got the **graphics chip**, **software** (SwiftShader/WARP) or **failed**, with the browser's reason. Then watches for driver resets (context lost), long freezes, scaling changes and frame rate every 10 s. Printed in F12 → Console (filter `[GPU]`), summarised on screen, and downloadable with **DOWNLOAD GPU LOG**. Code: `js/gpulog.js` (loaded only with this option). |

If the twin reports **SwiftShader**, **WARP** or **Microsoft Basic Render Driver**, it is being drawn by the processor, not the graphics chip: expect a low frame rate and flicker. Compare the graphics driver version in `edge://gpu` with a laptop that works, and check `edge://policy` for `EnableUnsafeSwiftShader`.

## Troubleshooting

| Symptom | Check |
|---|---|
| Blank page, or "This screen cannot show 3D" | WebGL is off: enable hardware acceleration in the browser |
| Nothing loads from `file://` | Serve the folder over http (see [Quick start](#quick-start)) |
| Every machine says **No live data** | `dataSource.type` is `"none"`, the feed is down, or messages are older than `staleAfterSeconds` |
| Status pill stuck on **Reconnecting** | Gateway URL, firewall, or `wss://` certificate |
| A machine never changes colour | Its `id` in the feed doesn't match `layout.json`, or its type has no live state |
| Layout edits gone | They live in that browser only; publish them with **DOWNLOAD LAYOUT** |
| An edited layout doesn't show on other screens | Replace `data/layout.json` on the server, then hard-refresh (Ctrl+F5) |

---

## Open items to confirm

- [ ] Line 3 printer, SPI, SIPLACE mounters and AOI are marked *pending purchase*, but are modelled as installed.
- [ ] Only one Mirtec AOI is placed (clean room, north-east). The list implies one per line.
- [ ] *Laser_and_SMT_Holding_area.pdf* was used in preference to *Laser.pdf*.
- [ ] Table-top items not yet placed: KNS 4526 ×3, KNS i5000 ×2, UB25 gap welders ×3, Westbond, MVP 900 AOI, Keyence VHX-7100, Olympus DSX100, Dage 4000Plus.
- [ ] Also not placed: Memmert N2 ovens ×8, Seamark X-ray counter, Brason vapour degreasers ×2.
- [ ] Two grey boxes at the Hybrid Room's west end are modelled as benches (they may be N2 cabinets).
- [ ] The crossed-out N2 cabinet in the Holding Area is left out (assumed cancelled).
- [ ] HASS 1 is shown dashed on the drawing (it may be planned rather than installed).
- [ ] The equipment list says "Pantech SB2-Jet"; the matching machine is the PacTech SB²-Jet.
- [ ] The room names "Test Lab 1-1" and "SMT Holding Area" are read from the plan.

---

## Licences

- three.js r160 and OrbitControls: MIT licence (`vendor/three/LICENSE`).
- Fonts (Chakra Petch, IBM Plex Sans) load from Google Fonts. If they can't load, for example on an offline network, the page falls back to system fonts.
