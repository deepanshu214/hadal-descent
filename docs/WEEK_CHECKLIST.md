# 10-Week Development Checklist

> **Start Date:** _______________
> **Target Ship Date:** _______________
> **Daily Commitment:** 4–5 hours

Mark tasks with `[x]` as you complete them. Each week ends with a **playtest milestone**.

---

## WEEK 1 — Foundation + Cable Start
**Goal:** Walking underwater with atmosphere. Cable prototype begun.

### Setup (Day 1)
- [ ] Free up disk space to 50+ GB
- [ ] Install Unity Hub
- [ ] Install Unity 6 LTS (URP 3D Template, Apple Silicon)
- [ ] Install Blender 4.x
- [ ] Install Git, create GitHub repo `hadal-descent`
- [ ] Add `.gitignore` (Unity + macOS)
- [ ] Create Unity project from URP 3D template
- [ ] Set up folder structure: `_Scripts/`, `_Prefabs/`, `_Materials/`, `_Audio/`, `_Scenes/`, `_UI/`, `_VFX/`
- [ ] Configure URP: VSync ON, Forward+, FXAA, target 60fps
- [ ] **COMMIT:** "Initial project setup"

### Character Controller (Day 2–3)
- [ ] Install Cinemachine package
- [ ] Install new Input System package
- [ ] Create `PlayerController.cs` — WASD movement, heavy underwater feel
- [ ] Set movement params: base 2.0 m/s, sprint 3.5, crouch 1.0, accel 4.0, decel 6.0
- [ ] Reduced gravity: -4.9 m/s² (half Earth, simulating buoyancy)
- [ ] Create `PlayerCameraController.cs` — Cinemachine FreeLook (3rd person)
- [ ] Add first-person virtual camera (V key toggle)
- [ ] Add head bob script for walking
- [ ] Greybox a test corridor (ProBuilder or primitives): 3 rooms + connecting hallways
- [ ] **COMMIT:** "Basic character controller + camera"

### Atmosphere (Day 4–5)
- [ ] Create URP Volume Profile:
  - [ ] Exponential Fog (dark navy, density 0.15, start 2m)
  - [ ] Bloom (intensity 0.8 for bioluminescence)
  - [ ] Vignette (intensity 0.4, smoothness 0.3)
  - [ ] Color Adjustments (saturation -20, contrast +15, deep blue tint)
  - [ ] Film Grain (intensity 0.1)
- [ ] Create flashlight: Spotlight (range 20m, angle 35°, intensity 8)
- [ ] Add flashlight toggle (F key)
- [ ] Create marine snow particle system (slow white specs, large emission volume)
- [ ] Create silt-on-footstep particle burst (triggered by movement)
- [ ] Add underwater low-pass audio filter (global AudioMixer)
- [ ] Import 2–3 ambient audio tracks (deep rumble, metal stress)
- [ ] **COMMIT:** "Underwater atmosphere — fog, particles, lighting, audio"

### Cable Start (Day 6–7)
- [ ] Create `CableSimulation.cs` — Verlet integration, 20 nodes
- [ ] Implement distance constraints (4 solver iterations per frame)
- [ ] Attach cable between player capsule and a static anchor point
- [ ] Render cable using LineRenderer (temporary, procedural mesh later)
- [ ] Add gravity + damping to cable nodes
- [ ] **COMMIT:** "Cable physics prototype — Verlet simulation"

### 🎯 Week 1 Playtest
> **Test:** Walk through a dark underwater corridor. Flashlight cuts through volumetric fog. Marine snow drifts. A cable trails behind you, sagging with physics. Metal groans echo.
> **Pass criteria:** Does it FEEL like you're deep underwater? Does the cable behave physically?

---

## WEEK 2 — Cable Complete + Networking Start
**Goal:** Full cable system. Two players connected over network.

### Cable System (Day 1–3)
- [ ] Create `CableTensionMeter.cs` — calculate tension from endpoint distance vs rest length
- [ ] Create tension UI gauge (temporary screen-space bar, will be diegetic later)
- [ ] Implement tension audio: cable creak SFX scales with tension %
- [ ] Create `CableSnagDetector.cs` — raycasts along segments detect geometry collision
- [ ] Implement cable wrapping: insert new constraint node at contact point
- [ ] Implement cable snap: if tension > 95% for 3 seconds, cable breaks
- [ ] Snap VFX: particle burst + camera shake
- [ ] Snap SFX: metallic crack + alarm
- [ ] Connect cable between TWO player capsules (local, both keyboard-controlled for testing)
- [ ] Test: two capsules pulling apart, cable wrapping around a pillar, snapping
- [ ] **COMMIT:** "Cable system complete — tension, snag, snap"

### Networking Foundation (Day 4–7)
- [ ] Install FishNet from Unity Asset Store (free)
- [ ] Add NetworkManager to scene
- [ ] Configure transport (Tugboat — FishNet's built-in transport)
- [ ] Create `NetworkBootstrap.cs` — start server/client
- [ ] Convert PlayerController to NetworkObject
- [ ] Add owner-only movement (only control your own character)
- [ ] Sync position + rotation via SyncVar or TransformSync component
- [ ] Test: two instances on localhost, both moving independently
- [ ] Create `CableNetworkSync.cs` — sync endpoint positions + tension float (not all nodes)
- [ ] Each client runs local Verlet sim from synced endpoints
- [ ] Test: cable looks correct on both clients
- [ ] **COMMIT:** "FishNet multiplayer — 2 player movement + cable sync"

### 🎯 Week 2 Playtest
> **Test:** Two Unity instances on localhost. Both players walk around connected by a synced cable. Tension, snag, and snap work across network.
> **Pass criteria:** Cable behaves identically on both screens. No desync drift.

---

## WEEK 3 — Multiplayer Complete (2–5 Players, Lobbies, Roles)
**Goal:** Full lobby flow with team codes, public browser, role selection, 2–5 player support.

### Unity Gaming Services (Day 1–2)
- [ ] Create Unity Gaming Services account (free)
- [ ] Link Unity project to UGS dashboard
- [ ] Install Unity Lobby package
- [ ] Install Unity Relay package
- [ ] Install Unity Authentication package
- [ ] Create `RelayManager.cs` — allocate relay, get join code, join relay
- [ ] Create `LobbyManager.cs` — create lobby, join lobby, browse lobbies
- [ ] Test: create lobby → get 6-char code → second client joins via code
- [ ] **COMMIT:** "Unity Relay + Lobby integration"

### Lobby UI (Day 3–4)
- [ ] Create Main Menu scene: Host / Join / Browse / Settings / Quit
- [ ] "Host Private" → creates lobby → displays join code on screen
- [ ] "Join with Code" → input field → joins lobby
- [ ] "Browse Public" → fetches lobby list → displays: host name, tier, slots, ping
- [ ] "Request to Join" → host sees notification → Accept/Decline
- [ ] Style: dark theme, sci-fi fonts (Rajdhani / Orbitron from Google Fonts)
- [ ] **COMMIT:** "Lobby UI — host, join, browse"

### Role Selection (Day 5–6)
- [ ] Create pre-dive Role Selection screen (after lobby, before dive)
- [ ] Display 5 role cards with icons and descriptions
- [ ] Lock specialist roles based on player count (VOLT at 3+, HAUL at 4+, GHOST at 5)
- [ ] Enforce: BOULDER and ECHO must be selected before launch
- [ ] "Ready" toggle per player. Host sees "Launch Dive" (enabled when all ready + mandatory filled)
- [ ] Sync role selections across all clients via FishNet
- [ ] **COMMIT:** "Role selection system"

### 5-Player Scaling (Day 7)
- [ ] Spawn up to 5 NetworkObjects
- [ ] Cable topology: primary tether (BOULDER ↔ ECHO) + secondary tethers for additional players
- [ ] GHOST spawns untethered (wireless sonar link only)
- [ ] Test with 3–5 localhost instances (use ParrelSync or build + run duplicates)
- [ ] **COMMIT:** "2–5 player support complete"

### 🎯 Week 3 Playtest
> **Test:** Full flow: Main Menu → Host/Join → Role Select → Dive. 2–5 players connected with correct tether topology.
> **Pass criteria:** A friend on another machine can join your game via a 6-character code.

---

## WEEK 4 — Environment + Core Gameplay (Part 1)
**Goal:** Real assets. Oxygen. Interactions. The level starts looking like a real game.

### Asset Integration (Day 1–2)
- [ ] Download 10–15 modular corridor/room props from Sketchfab (CC0)
- [ ] Download PBR textures from ambientCG: rusted metal, concrete, glass
- [ ] Import into Unity, assign URP Lit materials
- [ ] Replace greybox rooms with real assets
- [ ] Add emergency lighting: red strip lights, flickering fluorescents
- [ ] Add environmental detail: broken pipes, floating debris, scattered documents
- [ ] Download character model from Mixamo (armored/heavy suit)
- [ ] Download animations: heavy walk, crouch, idle, fall, interact, death
- [ ] Set up Animator Controller with blend tree (idle ↔ walk ↔ sprint)
- [ ] **COMMIT:** "Real assets + character model + animations"

### Oxygen System (Day 3)
- [ ] Create `OxygenSystem.cs`
- [ ] Base capacity: 300 sec. Drain rates: idle 1.0/s, walk 1.2/s, sprint 2.5/s
- [ ] Tether O₂ sharing: 0.5 units/sec transfer if partner is lower
- [ ] Low O₂ (20%): screen vignette intensifies + heartbeat audio starts
- [ ] Critical O₂ (5%): tunnel vision post-process + heavy breathing
- [ ] 0% O₂: 30-sec incapacitation (can be revived by teammate), then death
- [ ] UI: temporary screen-space O₂ bar (will be diegetic wrist gauge later)
- [ ] **COMMIT:** "Oxygen system — depletion, sharing, visual effects"

### Interaction System (Day 4)
- [ ] Create `PlayerInteraction.cs` — raycast from camera center, 3m range
- [ ] Context UI prompt: "[E] Open" / "[E] Read Terminal" / "[Hold E] Breach Door"
- [ ] Tap E: instant interactions (pickup salvage, read log, toggle switch)
- [ ] Hold E: channeled interactions (breach door 5s, repair 4s, deploy beacon 3s)
- [ ] Progress ring UI during channeled actions
- [ ] Interrupt if player moves or takes damage
- [ ] **COMMIT:** "Interaction system — tap and channeled"

### Role Equipment — BOULDER & ECHO (Day 5–6)
- [ ] BOULDER — Piton Launcher: aim reticle + fire (raycast hit → spawn anchor prefab). Noise: 30m.
- [ ] BOULDER — Hydraulic Spreader: hold E on sealed door → 5s channel → door opens. Noise: 20m.
- [ ] ECHO — Sonar Pulse: Q key → expand sphere cast → reveal geometry + creatures as wireframe shader for 4s. Noise: 50m. Cooldown: 15s.
- [ ] ECHO — EMP Dart: right click → fire projectile → disables target for 20s.
- [ ] Sync all tool activations over network (ServerRpc → ObserversRpc)
- [ ] **COMMIT:** "BOULDER + ECHO role equipment"

### Salvage System (Day 7)
- [ ] Create `SalvageItem.cs` — ScriptableObject: name, value, weight, tier, icon
- [ ] Create 8–10 salvage types (scrap metal, data drive, bio-sample, etc.)
- [ ] Spawn salvage prefabs in rooms
- [ ] Pickup on E press. Add to inventory (limited by role capacity)
- [ ] Weight affects movement speed
- [ ] Drop salvage with G key
- [ ] **COMMIT:** "Salvage pickup + inventory system"

### 🎯 Week 4 Playtest
> **Test:** Explore a real-looking facility. Manage oxygen. Use BOULDER tools to breach doors. Use ECHO sonar to scan ahead. Pick up salvage.
> **Pass criteria:** The game loop feels tangible — explore, interact, collect, survive.

---

## WEEK 5 — Core Gameplay (Part 2) + All Roles
**Goal:** All 5 roles functional. Injuries. Extraction. Upgrades. Complete dive loop.

### Remaining Roles (Day 1–3)
- [ ] VOLT — Arc Welder: repair tether segments, patch suit breach, hotwire power terminals
- [ ] VOLT — Cable Splice: reconnect snapped cable (8s channel)
- [ ] VOLT — Power Cell Charger: hold near teammate → recharge their flashlight/sonar
- [ ] HAUL — Cargo Harness: 12 salvage slots (passive)
- [ ] HAUL — Deep-Salvage Grapple: interact with heavy objects, drag at 0.8 m/s
- [ ] HAUL — Cargo Drop: G key drops ALL cargo instantly
- [ ] GHOST — Thruster Pack: space bar = 3s vertical swim burst, 15s cooldown
- [ ] GHOST — Acoustic Cloak: hold Q = 15s silence mode, 60s cooldown
- [ ] GHOST — Flare Launcher: right click = fire acoustic flare (60m noise, 8s duration)
- [ ] **COMMIT:** "All 5 roles complete"

### Injury System (Day 4)
- [ ] Create `InjurySystem.cs` — body regions: Head, Arms, Legs, Torso
- [ ] Head injury: screen blur post-process
- [ ] Arm injury: tool use disabled (must be repaired)
- [ ] Leg injury: 50% speed reduction
- [ ] Torso/Suit breach: O₂ leak (+0.5/s drain, stacking)
- [ ] Repair: teammate uses VOLT arc welder or pressure patch (4s channel)
- [ ] Visual feedback: damage region highlighted on body silhouette UI
- [ ] **COMMIT:** "Injury system — regional damage + repair"

### Extraction (Day 5)
- [ ] Create `ExtractionBeacon.cs`
- [ ] Deploy with B (hold 3s). Spawns beacon prefab.
- [ ] 30-second countdown after deploy. Alarm SFX. Flashing light.
- [ ] All players must reach beacon radius (10m) before timer ends
- [ ] Extraction triggers: fade to black → load Debrief scene
- [ ] Players outside radius when timer hits 0: left behind (lose all salvage)
- [ ] **COMMIT:** "Extraction beacon mechanic"

### Submarine Hub + Upgrades (Day 6–7)
- [ ] Create Hub scene: small submarine interior (greybox, 3–4 rooms)
- [ ] Workbench interactions: Tether Upgrades, Suit Upgrades, Tool Upgrades
- [ ] Create `UpgradeManager.cs` — currency balance, upgrade tree, purchase flow
- [ ] Create `SaveSystem.cs` — JSON serialize: currency, unlocked upgrades, story progress
- [ ] Save to `Application.persistentDataPath`
- [ ] Dive Debrief screen: stats (salvage value, noise, injuries, O₂ remaining, time)
- [ ] Flow: Dive → Extract → Debrief → Hub → Upgrade → select Tier → Dive again
- [ ] **COMMIT:** "Submarine hub, upgrades, save system, debrief"

### 🎯 Week 5 Playtest
> **Test:** Complete dive loop end-to-end. Dive → explore → collect → extract → debrief → upgrade → dive again. All 5 roles work.
> **Pass criteria:** The push-your-luck tension is real. "Should we go deeper or extract now?"

---

## WEEK 6 — Creature AI (All Types)
**Goal:** All 5 creature types functional with acoustic detection.

### Sound Propagation (Day 1)
- [ ] Create `SoundPropagation.cs` — singleton noise event bus
- [ ] `NoiseEvent` struct: position, radius, intensity, sourceType
- [ ] Every player action emits noise: walk (8m), sprint (18m), piton (30m), sonar (50m)
- [ ] Creatures query `SoundPropagation.GetEventsInRange(position, hearingRadius)`
- [ ] **COMMIT:** "Sound propagation system"

### Creature State Machine (Day 2)
- [ ] Create `CreatureStateMachine.cs` — Idle, Patrol, Investigate, Hunt, Attack, Retreat
- [ ] Create `CreatureBase.cs` — abstract: health, movement, state transitions, audio
- [ ] NavMesh bake on level geometry
- [ ] NavMeshAgent for creature movement
- [ ] State transitions driven by noise events + proximity
- [ ] **COMMIT:** "Creature base + state machine"

### Individual Creatures (Day 3–6)
- [ ] **Scavenger Swarm:** flock behavior (simple boids), attracted to dropped salvage, low damage
- [ ] **Pressure Stalker:** patrol → stop-and-listen (every 8–12s) → investigate noise → charge on confirmation
- [ ] **Abyssal Lurker:** ceiling-mounted (static), drop attack when player is beneath, revealed by sonar
- [ ] **Leviathan:** scripted patrol path (spline), reacts to light + sound, instant death on contact, unkillable
- [ ] **[REDACTED] Colony:** environmental hazard system for Tier 4 (pressure manipulation, false audio cues)
- [ ] Import/create creature models (Sketchfab CC0 or Meshy AI generation)
- [ ] Creature audio: growls, clicks, movement sounds
- [ ] **COMMIT per creature type**

### Creature Network Sync (Day 7)
- [ ] Creatures are host-authoritative (host runs AI, clients receive position updates)
- [ ] Sync: position, rotation, animation state, current AI state
- [ ] Creature spawn/despawn events synced via ObserversRpc
- [ ] **COMMIT:** "Creatures networked"

### 🎯 Week 6 Playtest
> **Test:** Encounter creatures during a dive. Freeze when the Stalker listens. See the Leviathan glide past in the darkness. Panic.
> **Pass criteria:** Your heart rate increases when you hear the Stalker stop walking.

---

## WEEK 7 — Procedural Generation
**Goal:** Every dive generates a unique map. No two runs identical.

### Room Prefabs (Day 1–2)
- [ ] Design 20 room prefabs with defined connection points (N/S/E/W/Up/Down):
  - 5× Corridors (straight, L-bend, T-junction, cross, ramp)
  - 3× Small rooms (storage, crew quarters, maintenance)
  - 3× Medium rooms (lab, control room, sample vault)
  - 2× Large rooms (reactor hall, open cavern)
  - 2× Vertical shafts (ladder shaft, flooded elevator)
  - 2× Hazard rooms (electrified, pressure-crush, flooded)
  - 1× Start room (bathysphere dock)
  - 1× Extraction room (emergency beacon platform)
  - 1× Boss arena (Tier 4 only)
- [ ] Each room has 2–3 visual variants (debris, lighting, damage)
- [ ] **COMMIT:** "20 modular room prefabs"

### Generation Algorithm (Day 3–5)
- [ ] Create `MapGenerator.cs`
- [ ] Input: seed (int), TierConfig (ScriptableObject)
- [ ] Algorithm: constrained random walk with backtracking
- [ ] Ensure: path from START to EXTRACTION always exists
- [ ] Place creature spawn points (min distance from start, density from TierConfig)
- [ ] Place salvage nodes (weighted by tier value)
- [ ] Place story terminals (1–3 per dive, weighted by Act)
- [ ] Create `TierConfig.cs` ScriptableObjects for all 4 tiers
- [ ] **COMMIT:** "Procedural map generation"

### Network Seed Sync (Day 6)
- [ ] Host generates random seed on dive launch
- [ ] Broadcast seed to all clients via ServerRpc before scene load
- [ ] All clients run `MapGenerator(seed)` — produces identical layout
- [ ] Verify: 5 clients all see the same map from same seed
- [ ] **COMMIT:** "Seed-synced procedural maps"

### Tier Selection (Day 7)
- [ ] Add Tier selection to pre-dive lobby UI
- [ ] Tiers 2–4 locked until minimum total dives / salvage thresholds met
- [ ] Tier affects: room count, creature density, visibility distance, salvage multiplier
- [ ] **COMMIT:** "Tier selection + difficulty scaling"

### 🎯 Week 7 Playtest
> **Test:** Launch 5 dives. Each generates a different layout. Tier 1 is manageable. Tier 3 is terrifying.
> **Pass criteria:** No two dives feel the same. Procedural layouts are traversable and interesting.

---

## WEEK 8 — Procedural Polish + Helmut Cam + Diegetic Elements
**Goal:** Procedural gen edge cases fixed. Helmet cam. Diegetic HUD. Advanced camera modes.

### Proc-Gen Polish (Day 1–2)
- [ ] Fix dead-end issues (ensure minimum 2 exits per non-terminal room)
- [ ] Add room variety validation (no 5 identical corridors in a row)
- [ ] Test 50+ seeds for broken layouts, fix edge cases
- [ ] Add secret rooms (5% chance, hidden behind destructible walls)
- [ ] **COMMIT:** "Proc-gen polish + secret rooms"

### Helmet Cam + Advanced Cameras (Day 3–4)
- [ ] Helmet Cam: render 3D helmet mesh around first-person camera
- [ ] Transparent visor shader with condensation effect
- [ ] HUD overlay on visor: depth, O₂ %, compass heading
- [ ] H key toggle in first-person mode
- [ ] Tether Cam: Cinemachine Dolly along cable spline (triggers during rappel sequences)
- [ ] Spectator Cam: free-fly camera activated on player incapacitation
- [ ] Smooth blending between all camera modes (Cinemachine brain priorities)
- [ ] **COMMIT:** "Helmet cam + tether cam + spectator"

### Diegetic HUD Elements (Day 5–6)
- [ ] Wrist-mounted O₂ gauge: 3D model on player's left forearm, animated needle
- [ ] Depth meter: chest-plate mounted digital display
- [ ] Sonar device (ECHO): handheld physical prop, screen shows pulse animation
- [ ] Tension indicator: LED strip on cable attachment point (green → yellow → red)
- [ ] Remove screen-space UI elements, replace with diegetic versions
- [ ] **COMMIT:** "Diegetic HUD — wrist O₂, depth meter, sonar prop"

### Nitrogen Narcosis Effects (Day 7)
- [ ] Trigger at Tier 3+ depths
- [ ] Post-processing: chromatic aberration ramps up, slight screen warping
- [ ] Audio: occasional distorted whispers, delayed echo on teammate voice
- [ ] Visual: brief shadow flickers at screen edges (hallucination)
- [ ] Intensity scales with depth. Neural Dampener upgrade reduces by 50%.
- [ ] **COMMIT:** "Nitrogen narcosis post-processing"

### 🎯 Week 8 Playtest
> **Test:** Full immersion. Helmet cam visor in first person. Wrist O₂ gauge. Narcosis effects at depth. Procedural maps are reliable.
> **Pass criteria:** A non-gamer friend says "this looks like a real game."

---

## WEEK 9 — Story + UI + Audio Polish
**Goal:** Narrative content. Full menu flow. Audio pass. Endings.

### Story Content (Day 1–3)
- [ ] Write 30 story log texts (short paragraphs, in-character)
- [ ] Create terminal prefab: screen with scrolling text, ambient hum SFX
- [ ] Implement story progression tracker: `StoryManager.cs` (persistent save)
- [ ] Archive Terminal in Submarine Hub: displays all discovered logs by Act
- [ ] Implement 3 ending triggers based on player actions in Tier 4
- [ ] Create ending cinematics using Unity Timeline + Cinemachine (in-engine, not video)
- [ ] **COMMIT:** "Story system — 30 logs, 3 endings, archive"

### Full UI Pass (Day 4–5)
- [ ] Main Menu: animated deep-sea background (fog particles + distant bioluminescence)
- [ ] Buttons: Solo Dive / Host / Join / Browse / Archive / Settings / Quit
- [ ] Settings: Graphics (Low/Med/High), Audio sliders, Controls rebind, FOV slider, Sensitivity
- [ ] Loading screen: bathysphere descent animation with depth counter
- [ ] Pause menu: Resume / Settings / Disconnect
- [ ] Death screen: "SYSTEMS OFFLINE" + static effect + "Waiting for rescue..." or "DIVE FAILED"
- [ ] All UI styled: dark backgrounds, sci-fi fonts, subtle glow effects
- [ ] **COMMIT:** "Complete UI — menus, settings, loading, pause, death"

### Audio Polish (Day 6–7)
- [ ] Import full Soniss/Freesound SFX library for the project
- [ ] Assign audio to ALL interactions: doors, tools, pickups, terminals, beacons
- [ ] Creature audio: unique sounds per type (clicks, growls, scraping, whale-call for Leviathan)
- [ ] Music: dark ambient background track (Pixabay), changes intensity based on creature proximity
- [ ] Audio mixer: Master, SFX, Music, Voice, Ambient channels
- [ ] Underwater audio filter: low-pass on all channels
- [ ] Spatial audio: 3D sound on creatures, tools, environment (Audio Source with 3D spatial blend)
- [ ] **COMMIT:** "Audio pass complete"

### 🎯 Week 9 Playtest
> **Test:** Full game with story. Discover logs across multiple dives. Reach Tier 4. Trigger an ending. Feel the narrative weight.
> **Pass criteria:** Story logs make you want to dive deeper to find out what happened.

---

## WEEK 10 — Polish, Build, Ship
**Goal:** Bug-free. Optimized. Trailer recorded. Published on Itch.io.

### Bug Fixing (Day 1–3)
- [ ] Playtest every system end-to-end (solo + multiplayer)
- [ ] Fix networking edge cases: host migration, disconnection handling, late-join
- [ ] Fix proc-gen edge cases: unreachable rooms, creature stuck in walls
- [ ] Fix cable edge cases: infinite tension, node explosion, rendering glitches
- [ ] Fix UI: text overflow, button alignment, settings persistence
- [ ] Fix audio: overlapping sounds, missing clips, volume balancing
- [ ] **COMMIT:** "Bug fix pass"

### Optimization (Day 4–5)
- [ ] Unity Profiler: identify CPU/GPU bottlenecks
- [ ] Texture compression: ASTC 6x6 for all textures
- [ ] LOD groups on all environment meshes (3 LOD levels)
- [ ] Occlusion culling bake
- [ ] Reduce particle system emission counts if below 60fps
- [ ] Static batching on non-moving environment objects
- [ ] Test on Mac M3 at Medium settings: target stable 60fps
- [ ] **COMMIT:** "Optimization pass — stable 60fps"

### Build + Publish (Day 6)
- [ ] Build for macOS (Apple Silicon)
- [ ] Build for Windows (x64)
- [ ] Test both builds on actual machines
- [ ] Create Itch.io page
- [ ] Write description, add screenshots (5–8), add system requirements
- [ ] Upload builds
- [ ] Set price: Free (or "Name Your Price")
- [ ] **COMMIT + TAG:** "v1.0.0 — Release"

### Trailer + Portfolio (Day 7)
- [ ] Install OBS Studio
- [ ] Record 90 seconds of best gameplay moments:
  - Descending in the bathysphere
  - Flashlight cutting through fog
  - Cable tension spiking during a rappel
  - Leviathan silhouette gliding past
  - Sonar pulse revealing a Stalker
  - Frantic extraction with low O₂
- [ ] Edit in DaVinci Resolve: add title card, fade transitions, music
- [ ] Upload trailer to YouTube (unlisted or public)
- [ ] Update GitHub README with screenshots, trailer embed, Itch.io link
- [ ] Update personal portfolio website
- [ ] Update resume with Hadal Descent bullet points
- [ ] **CELEBRATE. YOU SHIPPED A GAME. 🎉**

### 🎯 Week 10 Final Playtest
> **Test:** Fresh players (who have never seen the game) play a full session. Watch silently. Take notes.
> **Pass criteria:** They want to play again.

---

## Post-Launch Roadmap (Optional — If You Continue)

- [ ] Controller / gamepad support
- [ ] More room prefabs (30+)
- [ ] Additional creature variants
- [ ] Steam release (\$100 one-time fee)
- [ ] Community feedback integration
- [ ] Tier 4 boss encounter refinement
- [ ] Proximity voice chat (Vivox integration)
- [ ] Replay system (record + playback dives)
