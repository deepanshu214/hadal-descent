# Level Design — Modular Room Blueprints
# Design these in Figma, on paper, or in Blender BEFORE Unity.

---

## Room Connection System

Every room has **connection points** on its faces. Rooms snap together like LEGO.

```
          [NORTH]
             │
   [WEST] ──┼── [EAST]
             │
          [SOUTH]
             
   + [UP] and [DOWN] for vertical shafts
```

**Connection point = a 4m × 3m doorway opening** at the edge of the room.
All rooms use this standard opening size so any room can connect to any other.

---

## Room Catalog (20 Rooms)

### CORRIDORS (5 types)

#### C-01: Straight Corridor
```
    ┌──────────────────┐
    │                  │
[W]─┤                  ├─[E]
    │                  │
    └──────────────────┘
    
Size: 12m × 4m × 3m
Connections: WEST, EAST
Props: Overhead pipes, wall-mounted conduit, floor grating
Variants: 
  A) Intact (lights on)
  B) Damaged (flickering lights, debris on floor)
  C) Flooded (ankle-deep water, sparking cables)
```

#### C-02: L-Bend Corridor
```
    ┌──────────┐
    │          │
[W]─┤          │
    │          │
    └────┤     │
         │     │
         │     │
         └──┤──┘
            [S]

Size: 8m × 8m × 3m
Connections: WEST, SOUTH
Props: Corner emergency light, ventilation grate
Variants:
  A) Clean turn
  B) Collapsed ceiling debris blocking partial view
  C) Pressure-warped walls (Tier 3+)
```

#### C-03: T-Junction
```
    ┌──────────────────┐
    │                  │
[W]─┤        ┤         ├─[E]
    │        │         │
    └────────┤─────────┘
             [S]

Size: 12m × 8m × 3m
Connections: WEST, EAST, SOUTH
Props: Directional signage, junction box, floor drain
```

#### C-04: Cross Junction
```
             [N]
    ┌────────┤─────────┐
    │        │         │
[W]─┤        ┤         ├─[E]
    │        │         │
    └────────┤─────────┘
             [S]

Size: 8m × 8m × 3m
Connections: ALL 4 (N/S/E/W)
Props: Central pillar, overhead signage, multiple pipe runs
```

#### C-05: Ramp Corridor (Elevation Change)
```
    ┌──────────────────┐
    │          ╱╱╱╱╱╱  │
[W]─┤    ╱╱╱╱╱╱       ├─[E] (elevated +2m)
    │ ╱╱╱             │
    └──────────────────┘

Size: 16m × 4m × 5m
Connections: WEST (low), EAST (high)
Props: Ramp with grip strips, railing, overhead clearance warning
```

---

### SMALL ROOMS (3 types)

#### S-01: Storage Room
```
    ┌──────────────┐
    │ ╔══╗    ╔══╗ │
[W]─┤ ║  ║    ║  ║ │
    │ ╚══╝    ╚══╝ │
    │    ╔══╗      │
    │    ║  ║      │
    └────╚══╝──────┘

Size: 8m × 6m × 3m
Connections: WEST
Props: Storage crates (interactable), shelving units, supply manifests
Salvage spawns: 1-3 items
Creature potential: Scavenger swarm hiding behind crates
```

#### S-02: Crew Quarters
```
    ┌──────────────────┐
    │ ┌──┐  ┌──┐  ┌──┐│
    │ │  │  │  │  │  ││
[W]─┤ └──┘  └──┘  └──┘│
    │                  │
    │ ┌──────┐ [desk]  │
    │ │locker│         │
    └─┘      └─────────┘

Size: 10m × 6m × 3m
Connections: WEST
Props: Bunk beds (3), personal lockers, small desk, personal items
Story terminals: High probability for personal logs
```

#### S-03: Maintenance Closet
```
    ┌────────┐
    │ [tools]│
[W]─┤ [pipe] │
    │ [panel]│
    └────────┘

Size: 4m × 4m × 3m
Connections: WEST
Props: Tool rack, exposed pipe valve (interactable), electrical panel
Function: VOLT can hotwire panel to restore power to adjacent rooms
```

---

### MEDIUM ROOMS (3 types)

#### M-01: Research Laboratory
```
         [N]
    ┌─────┤──────────────┐
    │  [terminal]        │
    │                    │
[W]─┤  [lab bench]       ├─[E]
    │  [specimen case]   │
    │                    │
    └────────────────────┘

Size: 14m × 10m × 4m
Connections: NORTH, WEST, EAST
Props: Lab benches, holographic display (story terminal), specimen cases (salvage), microscope stations
Story terminals: HIGH probability
Salvage: Research drives, bio-samples (require HAUL's containment canisters)
```

#### M-02: Control Room
```
         [N]
    ┌─────┤──────────────┐
    │  ╔═══════════════╗ │
    │  ║  SCREENS      ║ │
[W]─┤  ╚═══════════════╝ ├─[E]
    │  [console] [console]│
    │  [chair]   [chair]  │
    └─────────────────────┘

Size: 12m × 10m × 4m
Connections: NORTH, WEST, EAST
Props: Large display screens (static/glitching), control consoles, rotating chairs, status boards
Function: Can restore local systems (lights, doors) via VOLT interaction
Story terminals: Contains system logs, security footage transcripts
```

#### M-03: Sample Vault
```
    ┌──────────────────┐
    │  ╔══╗ ╔══╗ ╔══╗  │
    │  ║  ║ ║  ║ ║  ║  │
[W]─┤  ╚══╝ ╚══╝ ╚══╝  │
    │  [containment     │
    │   pods - sealed]  │
    └──────────────────┘

Size: 10m × 8m × 4m
Connections: WEST (reinforced door — BOULDER must breach)
Props: Sample containment pods (3-5), biohazard signage, emergency wash station
Salvage: HIGH VALUE — bio-samples, classified drives
Hazard: Possible Lurker ambush on ceiling
```

---

### LARGE ROOMS (2 types)

#### L-01: Reactor Hall
```
              [N]
    ┌──────────┤───────────┐
    │                      │
    │    ┌────────────┐    │
    │    │            │    │
[W]─┤    │  REACTOR   │    ├─[E]
    │    │  CORE      │    │
    │    │            │    │
    │    └────────────┘    │
    │                      │
    └──────────┤───────────┘
              [S]

Size: 20m × 16m × 8m (double height)
Connections: ALL 4 (N/S/E/W)
Props: Central reactor structure, catwalk above (accessible via ladder), cooling pipes, steam vents
Hazard: Thermal vent damage near reactor. Pressure Stalker patrol route.
Function: Power hub — VOLT can restore facility-wide power here (major objective)
```

#### L-02: Open Cavern (Natural)
```
              [N]
    ┌──────────┤───────────────┐
    │  ~  ~  ~    ~  ~  ~      │
    │     ~  OPEN WATER  ~     │
[W]─┤  ~     ~    ~    ~  ~    ├─[E]
    │    [rocks]    [vent]     │
    │  ~  ~  ~    ~  ~  ~      │
    └──────────┤───────────────┘
              [S]

Size: 30m × 25m × 12m (very large, open)
Connections: ALL 4 (N/S/E/W)
Props: Natural rock formations, hydrothermal vents, bioluminescent organisms, sunken equipment
Creature: LEVIATHAN PATROL ZONE — massive open space, creature circles through
Special: Players must cross through darkness. Coordinate flashlight use carefully.
```

---

### VERTICAL SHAFTS (2 types)

#### V-01: Ladder Shaft
```
    ┌────────┐
    │ [UP]   │
    │  │     │
    │  │     │
    │ ladder │
    │  │     │
    │  │     │
[W]─┤  │     │
    │  │     │
    │ [DOWN] │
    └────────┘

Size: 6m × 6m × 12m (3 floors)
Connections: WEST + UP + DOWN
Props: Metal ladder, dangling cables, emergency lights at each level
Function: Vertical traversal. BOULDER anchors at top, other players rappel down via tether.
Creature: Lurker can cling to shaft walls above
```

#### V-02: Flooded Elevator Shaft
```
    ┌────────┐
    │ [UP]   │
    │        │
    │ WATER  │
    │ LEVEL  │
    │~~~~~~~~│
    │ FLOODED│
[W]─┤        │
    │ [DOWN] │
    └────────┘

Size: 8m × 8m × 16m (4 floors)
Connections: WEST + UP + DOWN
Props: Broken elevator car (lodged midway), dangling cables, submerged lower section
Function: GHOST can swim through flooded lower section with thruster. Others must find alternate route or use tether to rappel past water section.
```

---

### HAZARD ROOMS (2 types)

#### H-01: Electrified Corridor
```
    ┌──────────────────┐
    │  ⚡ [cable] ⚡    │
    │     [cable]      │
[W]─┤  ⚡ [cable] ⚡    ├─[E]
    │     [sparks]     │
    └──────────────────┘

Size: 12m × 4m × 3m
Connections: WEST, EAST
Hazard: Sparking cables deal suit damage on contact. VOLT can disable power at wall panel.
Alternative: Time movement between spark cycles (2s on, 3s off)
```

#### H-02: Pressure Crush Zone
```
    ┌──────────────────┐
    │  ║ PRESSURE ║    │
    │  ║ WARNING  ║    │
[W]─┤                  ├─[E]
    │  [cracked walls] │
    │  [groaning metal]│
    └──────────────────┘

Size: 12m × 4m × 3m
Connections: WEST, EAST
Hazard: Continuous suit damage while inside (1 HP/sec). Sprint through.
Audio: Constant metallic groaning, creaking, stress sounds
Visual: Walls visibly bowing inward. Particles of metal flaking.
```

---

### SPECIAL ROOMS (3 types)

#### SP-01: Start Room (Bathysphere Dock)
```
    ┌──────────────────────┐
    │    ╔═══════════╗     │
    │    ║BATHYSPHERE║     │
    │    ║  (DOCK)   ║     │
    │    ╚═══════════╝     │
    │                      │
    │  [equipment lockers] ├─[E]
    │  [briefing screen]   │
    │  [O₂ refill station] │
    └──────────────────────┘

Size: 16m × 12m × 5m
Connections: EAST only (one way into the facility)
Props: Docked bathysphere, equipment lockers, briefing terminal, O₂ station
Function: Spawn point. Safe zone. O₂ refill available here (but only at start).
```

#### SP-02: Extraction Room (Beacon Platform)
```
    ┌──────────────────────┐
    │                      │
    │    [BEACON PAD]      │
    │    (deploy here)     │
    │                      │
[W]─┤  [emergency lights]  │
    │  [final terminal]    │
    │                      │
    └──────────────────────┘

Size: 12m × 10m × 5m
Connections: WEST only (deepest point)
Props: Beacon deployment pad, emergency lighting, final story terminal (Act-dependent)
Function: Deploy extraction beacon here. 30-second countdown. All players must reach this room.
```

#### SP-03: Boss Arena — The Drill Chamber (Tier 4 Only)
```
    ┌──────────────────────────────┐
    │                              │
    │      ┌──────────────┐       │
    │      │              │       │
[W]─┤      │  DRILL SHAFT │       ├─[E]
    │      │  (BREACHED)  │       │
    │      │              │       │
    │      └──────┤───────┘       │
    │             │               │
    │        [THE CAVITY]         │
    │     [COLONY ORGANISM]       │
    └──────────────────────────────┘

Size: 40m × 30m × 15m (massive)
Connections: WEST, EAST
Props: Destroyed drill rig, breached cavity opening, organic growth covering walls
Function: Final story location. Ending triggers here.
Creature: [REDACTED] Colony encounter
```

---

## Blender Workflow (Pre-Unity)

If you want to model custom rooms in Blender before Unity is installed:

1. **Set Blender units to meters** (Scene Properties → Units → Metric)
2. **Model rooms at the sizes listed above** (verify with measuring tool)
3. **Place a 4m × 3m opening** at each connection point (consistent doorway size)
4. **UV unwrap all faces** (Smart UV Project is fine for greybox)
5. **Export as .FBX** (scale: 1.0, apply transforms)
6. **Name convention:** `Room_C01_StraightCorridor_A.fbx` (type_ID_name_variant)
7. **Save to:** `~/Desktop/hadal-descent/assets/models/rooms/`
