# Technical Architecture — Hadal Descent

---

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        UNITY 6 (URP)                            │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐    │
│  │  Player   │  │  Cable   │  │ Creature │  │  Procedural  │    │
│  │ Systems   │  │ Physics  │  │    AI    │  │  Generation  │    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬───────┘    │
│       │              │             │               │            │
│  ┌────┴──────────────┴─────────────┴───────────────┴──────┐     │
│  │                  GAME MANAGER (Singleton)               │     │
│  │  - Dive State Machine                                   │     │
│  │  - Oxygen Controller                                    │     │
│  │  - Salvage Inventory                                    │     │
│  │  - Injury Tracker                                       │     │
│  │  - Sound Propagation Bus                                │     │
│  └────────────────────────┬───────────────────────────────┘     │
│                           │                                     │
│  ┌────────────────────────┴───────────────────────────────┐     │
│  │              FISH-NETWORKING (FishNet)                   │     │
│  │  - NetworkManager                                       │     │
│  │  - SyncVars (position, rotation, O₂, tension)           │     │
│  │  - ObserversRpc / TargetRpc / ServerRpc                 │     │
│  │  - NetworkObject per player + per creature              │     │
│  └────────────────────────┬───────────────────────────────┘     │
│                           │                                     │
│  ┌────────────────────────┴───────────────────────────────┐     │
│  │           UNITY GAMING SERVICES (Free Tier)             │     │
│  │  ┌─────────────┐    ┌──────────────┐                    │     │
│  │  │ Unity Lobby  │    │ Unity Relay   │                   │     │
│  │  │ (Matchmaking │    │ (NAT Punch /  │                   │     │
│  │  │  Join Codes) │    │  P2P Relay)   │                   │     │
│  │  └─────────────┘    └──────────────┘                    │     │
│  └─────────────────────────────────────────────────────────┘     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Core Systems Breakdown

### 1. Player Controller (`scripts/player/`)

```
PlayerController.cs          — Input handling (new Input System), movement, gravity
PlayerCameraController.cs    — Cinemachine: 3rd person, 1st person, helmet, spectator
PlayerRoleManager.cs         — Assigns role-specific equipment, stats, abilities
PlayerAnimationController.cs — Animator state machine, IK for foot/hand placement
PlayerInteraction.cs         — Raycast-based context interaction (E key)
PlayerAudioController.cs     — Footstep sounds, breathing, suit alarms
```

**Movement Model:**
```
Base speed:       2.0 m/s  (heavy underwater walking)
Sprint speed:     3.5 m/s  (costs 2x O₂)
Crouch speed:     1.0 m/s  (reduced noise radius)
Acceleration:     4.0 m/s² (sluggish, weighty ramp-up)
Deceleration:     6.0 m/s² (slight slide, then stop)
Turn speed:       120°/s   (suit inertia)
Gravity:          -4.9 m/s² (half Earth gravity — underwater buoyancy)
```

### 2. Cable / Tether System (`scripts/cable/`)

```
CableSimulation.cs    — Verlet integration, constraint solver
CableRenderer.cs      — Procedural mesh / LineRenderer along nodes
CableTensionMeter.cs  — Tension calculation, UI gauge, alarm triggers
CableSnagDetector.cs  — Raycast-based wrapping around geometry
CableNetworkSync.cs   — FishNet sync: endpoint positions + tension float
CableAudio.cs         — Creak SFX scaled to tension, snap SFX
```

**Verlet Integration Parameters:**
```
Segment count:        20 nodes
Rest length/segment:  1.0m (total cable: 20m default)
Constraint iterations: 4 per frame
Damping:              0.98
Gravity influence:    -2.0 (slight underwater sag)
Max tension:          100 units (snap at sustained >95 for 3 sec)
```

### 3. Networking (`scripts/networking/`)

```
NetworkBootstrap.cs       — FishNet initialization, transport config
LobbyManager.cs           — Unity Lobby API: create, join, browse, team codes
RelayManager.cs            — Unity Relay: allocate, join, connection data exchange
RoleSelectionManager.cs    — Pre-dive role picker, ready check, launch
PlayerSpawner.cs           — Spawn NetworkObjects at dive start positions
DiveSyncManager.cs         — Sync dive state: map seed, timer, extraction status
```

**Bandwidth Budget (per player):**
```
Position + rotation:   12 bytes × 20 ticks/sec  = 240 B/s
Cable endpoints:       12 bytes × 10 ticks/sec  = 120 B/s
Cable tension float:    4 bytes × 10 ticks/sec  =  40 B/s
O₂ level float:         4 bytes × 2 ticks/sec   =   8 B/s
Animation state:        4 bytes × 10 ticks/sec  =  40 B/s
Creature positions:    12 bytes × 5 creatures × 10 ticks = 600 B/s
                                              TOTAL ≈ 1 KB/s per player
```

### 4. Creature AI (`scripts/creatures/`)

```
CreatureBase.cs            — Abstract base: health, state machine, audio
CreatureStateMachine.cs    — States: Idle, Patrol, Investigate, Hunt, Attack, Retreat
SoundPropagation.cs        — Global noise event bus, radius queries per creature
CreatureScavenger.cs       — Swarm behavior, attracted to salvage drops
CreatureStalker.cs         — Blind. Sound-hunting. Charges on confirmed contact.
CreatureLurker.cs          — Ceiling ambush. Revealed by sonar.
CreatureLeviathan.cs       — Unkillable. Scripted patrol. Reacts to light + sound.
CreatureSpawner.cs         — Tier-based spawn tables, max concurrent limits
```

**Sound Propagation System:**
```
NoiseEvent {
    Vector3 position;
    float   radius;       // meters
    float   intensity;    // 0.0 – 1.0
    string  sourceType;   // "footstep", "sprint", "piton", "sonar", "tool"
}

Noise radii:
  Crouch walk:   3m
  Normal walk:   8m
  Sprint:       18m
  Piton fire:   30m
  Sonar ping:   50m
  Cable snap:   40m
  Acoustic flare: 60m (decoy)
```

### 5. Procedural Generation (`scripts/procedural/`)

```
MapGenerator.cs       — Seed-based room graph builder
RoomDatabase.cs       — ScriptableObject: room prefab registry
RoomConnector.cs      — Snap-point alignment (N/S/E/W/Up/Down)
TierConfig.cs         — ScriptableObject: room count, creature density, hazards
LootPlacer.cs         — Weighted random loot placement per tier
StoryTerminalPlacer.cs — Story log placement (guaranteed 1–3 per dive)
```

**Generation Algorithm (Simplified):**
```
1. Initialize Random(seed)
2. Place START room
3. For i = 0 to roomCount:
     a. Pick random unconnected door from existing rooms
     b. Select compatible room from RoomDatabase (filtered by tier)
     c. Attach at connection point
     d. If dead-end and i < roomCount * 0.8: force corridor
4. Place EXTRACTION room at deepest graph node
5. Place creatures at spawn nodes (min distance from START)
6. Place loot at random nodes (weighted by tier)
7. Place 1–3 story terminals (weighted by Act progression)
8. Return completed MapGraph
```

### 6. Survival Systems (`scripts/systems/`)

```
OxygenSystem.cs        — Real-time O₂ depletion, exertion multiplier, sharing
InjurySystem.cs        — Body-region damage, status effects, repair mechanic
SalvageInventory.cs    — Pickup, weight, role capacity, drop on death
ExtractionBeacon.cs    — Deploy, 30-sec channel, bathysphere call
UpgradeManager.cs      — Persistent save, currency, upgrade tree
DiveDebrief.cs         — Post-dive stats calculation and display
SaveSystem.cs          — JSON serialization to PlayerPrefs / local file
```

**Oxygen Parameters:**
```
Base capacity:     300 seconds (5 minutes)
Idle drain:        1.0 units/sec
Walk drain:        1.2 units/sec
Sprint drain:      2.5 units/sec
Tool use drain:    1.8 units/sec
Suit breach drain: +0.5 units/sec (stacking)
Low O₂ threshold:  20% (visual + audio warning)
Critical threshold: 5% (tunnel vision + heartbeat)
Blackout:           0% (30-sec incapacitation, then death)
Tether share rate:  0.5 units/sec (from partner)
```

---

## Render Pipeline Settings (URP — Optimized for M3 8GB)

```
Renderer:           Forward+ (single pass)
Anti-aliasing:      FXAA (Low) — cheap, effective
Shadow resolution:  1024 (Medium)
Shadow distance:    25m (irrelevant beyond fog distance)
Max lights:         8 per-object (headlamps + bioluminescence)
SSAO:               OFF (fog handles ambient occlusion visually)
Bloom:              ON (bioluminescence glow)
Vignette:           ON (helmet edges)
Fog:                Exponential² (density scales with depth tier)
VSync:              ON (critical for M3 thermals)
Target framerate:   60 fps
Max texture size:   1024 (props) / 2048 (hero only)
Texture compression: ASTC 6x6
LOD bias:           1.0 (aggressive culling beyond fog)
```

---

## Data Flow: A Complete Dive

```
                    [SUBMARINE HUB]
                         │
                    Select Depth Tier
                    Choose Upgrades
                         │
                    [LOBBY SCREEN]
                         │
                    Host creates lobby
                    Players join (code / public)
                    Roles selected
                    All ready ✓
                         │
                    [DIVE LOADING]
                         │
                    Host generates seed → broadcasts to all
                    All clients run MapGenerator(seed)
                    Creatures spawned (host-authoritative)
                    Players spawn at START room
                         │
                    [ACTIVE DIVE]
                         │
              ┌──────────┼──────────────┐
              │          │              │
         Explore    Evade/Fight    Collect Salvage
              │          │              │
              └──────────┼──────────────┘
                         │
                    O₂ running low...
                         │
                  ┌──────┴──────┐
                  │             │
            Deploy Beacon   Push deeper?
            (Extract)       (Risk it)
                  │             │
                  │        ┌────┴────┐
                  │        │         │
                  │     Survive    Die
                  │        │      (Lose all)
                  │        │
                  └────────┘
                       │
                 [EXTRACTION]
                       │
                 Bathysphere ascent
                 Cinematic sequence
                       │
                 [DIVE DEBRIEF]
                       │
                 Stats displayed
                 Salvage → Currency
                 Story logs archived
                       │
                 [SUBMARINE HUB]
                 (Loop continues)
```
