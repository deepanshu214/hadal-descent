# Game Design Document — Hadal Descent

> **Version:** 1.0
> **Last Updated:** October 23, 2026
> **Author:** Deepanshu Agarwal
> **Genre:** 3D Co-op Extraction Thriller / Survival Horror
> **Platform:** PC (Windows / macOS)
> **Players:** 2–5 (Online Co-op)
> **Rating:** 18+ (Mature)

---

## 1. Game Concept

### Elevator Pitch
> Two to five deep-sea divers descend into procedurally generated underwater trench facilities, physically connected by a life-support tether cable. They must work together to salvage valuable artifacts, evade blind predatory creatures that hunt by sound, manage a shared oxygen supply, and extract before their systems fail — all at depths where no rescue is possible.

### Core Pillars
1. **Physical Interdependence** — The tether cable is not a gimmick. It IS the game. Movement, survival, combat, and puzzles all flow through the cable.
2. **Acoustic Stealth** — Sound is the primary detection mechanic. Every action has an audible consequence. Silence is survival.
3. **Push-Your-Luck Extraction** — You can always leave with what you have. The tension is in choosing not to.
4. **Atmospheric Dread** — The deep ocean is the antagonist. Pressure, darkness, cold, and isolation create fear without jump scares.

---

## 2. Player Roles

### 2.1 THE ANCHOR (Codename: BOULDER)
**Class:** Tank / Breacher
**Required:** Always (Mandatory in every dive)

| Attribute | Value |
|:---|:---|
| Movement Speed | 1.6 m/s (slowest) |
| O₂ Capacity | 360 sec (largest) |
| Armor Rating | Heavy (50% damage reduction) |
| Noise Profile | Loud (heavy footsteps, loud tools) |
| Salvage Capacity | Medium (6 slots) |

**Equipment:**
- **Pneumatic Piton Launcher** — Fires an anchor bolt into rock/metal surfaces. Creates a fixed anchor point for tether mechanics (rappelling, tension locks). Reload: 3 seconds. Noise: 30m radius.
- **Hydraulic Spreader** — Pries open sealed bulkheads, jammed airlocks, and crushed corridors. Hold interaction: 5 seconds. Noise: 20m radius.
- **High-Torque Winch** — Mounted on back. Controls tether payout and retraction speed. Can pull incapacitated teammates toward safety.
- **Reinforced Exosuit** — Passive. Reduces all physical damage by 50%. Immune to minor pressure fluctuations.

**Playstyle:** You are the immovable object. You plant yourself, hold the line, and create safe points for the team. You breach the path forward. You're loud, so the team must coordinate around your noise.

---

### 2.2 THE ANALYST (Codename: ECHO)
**Class:** Scout / Intelligence
**Required:** Always (Mandatory in every dive)

| Attribute | Value |
|:---|:---|
| Movement Speed | 2.2 m/s (fast) |
| O₂ Capacity | 270 sec (standard) |
| Armor Rating | Light (15% damage reduction) |
| Noise Profile | Quiet (soft footsteps) |
| Salvage Capacity | Small (4 slots) |

**Equipment:**
- **Directional Acoustic Sonar Lens** — Handheld device. Fires a targeted sonar cone (45° arc, 40m range) that reveals geometry, creatures, and salvage as wireframe outlines for 4 seconds. Creates a 50m noise event. Cooldown: 15 seconds.
- **Bio-Scanner** — Passive scanner. Detects organic life within 15m. Displays creature proximity as a pulse on wrist display.
- **EMP Dart Gun** — Fires a dart that disables electronic hazards (electrified doors, malfunctioning drones) for 20 seconds. Can temporarily stun smaller creatures. Magazine: 4 darts. Noise: 12m.
- **Lightweight Recon Suit** — Passive. Footstep noise radius reduced by 40%.

**Playstyle:** You are the team's eyes and ears. You decide when to ping (revealing threats but also announcing your position). You guide the team through safe paths. Without you, the team is blind.

---

### 2.3 THE ENGINEER (Codename: VOLT)
**Class:** Support / Technician
**Required:** 3+ Players

| Attribute | Value |
|:---|:---|
| Movement Speed | 2.0 m/s (standard) |
| O₂ Capacity | 300 sec (standard) |
| Armor Rating | Medium (30% damage reduction) |
| Noise Profile | Moderate |
| Salvage Capacity | Small (4 slots) |

**Equipment:**
- **Portable Arc Welder** — Repairs damaged tether segments (+25% max tension). Patches suit breaches (stops O₂ leak). Hot-wires facility power terminals. Channel: 4 seconds. Noise: 15m.
- **Pressure Patch Kit** — Consumable (carries 5). Instantly seals a suit breach. No channel time.
- **Cable Splice Tool** — If the tether snaps, the Engineer can reconnect the severed ends. Channel: 8 seconds. This is the only way to restore a snapped cable without aborting the dive.
- **Power Cell Charger** — Recharges teammate flashlight batteries and sonar power cells by transferring suit energy.

**Playstyle:** You keep everyone alive and operational. When things go wrong — and they will — you're the one who fixes them. A good Engineer is the difference between extraction and a total loss.

---

### 2.4 THE TRAWLER (Codename: HAUL)
**Class:** Heavy Salvage / Logistics
**Required:** 4+ Players

| Attribute | Value |
|:---|:---|
| Movement Speed | 1.8 m/s (slow) |
| O₂ Capacity | 330 sec (above average) |
| Armor Rating | Medium (30% damage reduction) |
| Noise Profile | Loud (cargo rattles) |
| Salvage Capacity | **Large (12 slots — 3x standard)** |

**Equipment:**
- **Reinforced Cargo Harness** — Passive. Triples salvage carry capacity. Visual: large backpack frame with mounted containers.
- **Deep-Salvage Grapple** — Magnetically locks onto heavy objects (reactor cores, sealed vault crates, specimen tanks) that other roles cannot move. Drag speed: 0.8 m/s.
- **Sample Containment Canisters** — Required to transport volatile or biological salvage. Without these, high-value bio-samples decay and become worthless.
- **Cargo Drop** — Emergency ability: instantly drops all carried salvage to regain full movement speed. Dropped salvage remains on the map for 2 minutes before despawning.

**Playstyle:** You are the profit margin. Your massive carry capacity is the reason the team can afford better upgrades. But you're slow, loud, and weighed down — making you the most vulnerable in a creature encounter. The team protects you.

---

### 2.5 THE DIVER (Codename: GHOST)
**Class:** Recon / Glass Cannon
**Required:** 5 Players only
**Special:** Operates UNTETHERED (wireless sonar link only)

| Attribute | Value |
|:---|:---|
| Movement Speed | 2.5 m/s (fastest) |
| O₂ Capacity | **210 sec (shortest — no tether O₂ share)** |
| Armor Rating | **None (0% damage reduction)** |
| Noise Profile | Near-silent |
| Salvage Capacity | Tiny (2 slots) |

**Equipment:**
- **Ultra-Light Recon Suit** — Near-zero noise. No tether attachment point. Full freedom of movement. Zero protection.
- **Thruster Pack** — Short vertical swim bursts (3 seconds, 15-second cooldown). Can access flooded vertical shafts and overhead platforms that no other role can reach.
- **Acoustic Cloak Module** — Activates a 15-second window of absolute acoustic silence. All actions produce 0 noise. Cooldown: 60 seconds.
- **Flare Launcher** — Fires an acoustic flare that emits a 60m noise event at its landing point for 8 seconds, drawing all creatures in range toward it. Magazine: 3 flares.

**Playstyle:** You are the team's scout and decoy. You move ahead, check rooms, and report back via voice. You lure creatures away from the main team with flares. But you have no armor, limited O₂, and no tether backup. If you get caught alone, you die fast.

---

## 3. Creature Bestiary

### 3.1 Scavenger Swarm (Tier 1–2)
**Size:** Small (0.3m each, swarms of 8–15)
**Behavior:** Attracted to dropped salvage and debris. Opportunistic — will nibble at players who stand still too long.
**Damage:** Low (suit breach: slow O₂ leak)
**Counter:** Flashlight flash (scatter for 10 seconds). Walk away.
**Sound Sensitivity:** Low (only reacts to dropped items within 5m)

### 3.2 Pressure Stalker (Tier 2–3)
**Size:** Medium (2m, quadrupedal, armored carapace)
**Behavior:** Completely blind. Patrols corridors in fixed loops. Stops and "listens" every 8–12 seconds. If it detects a noise event within its hearing radius (25m), it moves to investigate the noise source. If it detects a second noise within 10m of the first, it enters Hunt mode — charging directly at the confirmed position at 4x speed.
**Damage:** High (leg injury: 50% speed reduction. Direct hit: suit breach + arm injury)
**Counter:** Freeze. Don't move. Don't breathe loudly. Throw acoustic decoy. If it charges, dodge into a side corridor — it cannot turn quickly.
**Sound Sensitivity:** Very High

### 3.3 Abyssal Lurker (Tier 3)
**Size:** Large (4m, elongated body, multiple limbs)
**Behavior:** Clings to ceilings and walls. Completely motionless until prey walks directly beneath it. Drops and pins the player.
**Damage:** Critical (instant incapacitation if drop connects. Teammate must pull it off using tether tension or EMP.)
**Counter:** ECHO's sonar reveals its position. GHOST can fire a flare to dislodge it from a distance. Never walk under dark ceiling sections without scanning.
**Sound Sensitivity:** Low (ambush predator, doesn't chase)

### 3.4 The Leviathan (Tier 3–4)
**Size:** Massive (15–25m, serpentine body, bioluminescent markings)
**Behavior:** Cannot be killed. Patrols open trench sections and large caverns on fixed routes. Reacts to both LIGHT and SOUND. If it detects either, it diverts toward the source. Being within 5m of it causes suit pressure warnings and visual distortion.
**Damage:** Instant death on contact.
**Counter:** Total blackout (all flashlights off) + total silence. Wait for it to pass. GHOST's acoustic flare can redirect its patrol, buying 8 seconds of safe passage.
**Sound Sensitivity:** Extreme (60m radius)
**Light Sensitivity:** Extreme (40m radius for flashlights)

### 3.5 [REDACTED] — The Colony (Tier 4 Boss)
**Size:** Indeterminate (colony organism — fills corridors)
**Behavior:** The source of the contamination. Not a single creature but a networked biological intelligence that manipulates pressure differentials, seals corridors, and generates acoustic lures that mimic teammate voice lines.
**Damage:** Environmental (pressure crush, corridor collapse, false audio cues)
**Counter:** Full team coordination required. Details in final game — intentionally unspecified to preserve the design surprise during development.

---

## 4. Depth Tier Design

### Tier 1: The Continental Shelf (200m – 1,000m)

**Visual Theme:** Murky green-blue water. Silt-covered rocky shelves. Rusted shipping containers. Collapsed fishing infrastructure. Some natural light filtering from above.
**Room Types:** Open shelves, cargo holds, shallow caves, observation platforms.
**Creatures:** Scavenger Swarms only.
**Hazards:** Unstable ground (collapses if multiple players stand on same section).
**Salvage:** Common metals, basic electronics, standard cabling.
**Story:** Introductory contract briefings. Surface-level Meridian Deep Industries communications.

### Tier 2: The Bathyal Cliffs (1,000m – 4,000m)

**Visual Theme:** Dark blue-black water. Vertical cliff faces. Industrial drilling platforms bolted to trench walls. Cable systems. Zero natural light — headlamps only.
**Room Types:** Vertical shafts, suspended platforms, drilling rigs, maintenance tunnels, sample storage.
**Creatures:** Scavenger Swarms + Pressure Stalkers.
**Hazards:** Pressure-crush zones (damage over time if you linger). Electrified cables.
**Salvage:** Refined alloys, research drives, pressurized sample canisters.
**Story:** First encrypted research logs. Crew personal audio diaries. Signs of panic.

### Tier 3: The Abyssal Trench (4,000m – 7,000m)

**Visual Theme:** Pitch black. Bioluminescent organisms provide the only ambient light (cyan, magenta, toxic green). Hydrothermal vents emit orange-red glow. Research facility modules — half-crushed, flooded, emergency red lighting.
**Room Types:** Facility labs, containment chambers, flooded corridors, reactor rooms, bio-sample vaults, the drill chamber access corridor.
**Creatures:** Pressure Stalkers + Abyssal Lurkers + The Leviathan (patrols open areas).
**Hazards:** Flooded rooms (buoyancy physics), pressure doors (timed closing), thermal vents (suit damage on contact).
**Salvage:** Rare bio-samples (require containment canisters), prototype equipment, classified data drives.
**Story:** The truth about Project Nereus. The drill breach. The lead scientist's final recording.

### Tier 4: The Hadal Core (7,000m – 11,000m)

**Visual Theme:** Near-total darkness. Sonar is the only reliable vision. Organic growths cover facility walls. Pressure is at human structural limits. Post-processing: heavy chromatic aberration, intermittent visual static, audio distortion.
**Room Types:** The drill shaft, the sub-crustal cavity entrance, the sealed bio-containment vault, the core extraction chamber.
**Creatures:** All types + [REDACTED] Colony.
**Hazards:** Nitrogen narcosis (hallucination events), suit integrity countdowns, tether degradation (max tension reduced by 30%).
**Salvage:** Unique abyssal relics (highest value), the drill core itself, evidence drives.
**Story:** Meridian's true purpose. The weapon application. The ending branches.

---

## 5. Upgrade System

### Tether Upgrades

| Upgrade | Cost | Effect |
|:---|:---|:---|
| Carbon Fiber Weave | $500 | +20% max tension before snap |
| Extended Spool | $750 | +10m cable length (20m → 30m) |
| Thermal Insulation | $1,000 | Tether doesn't degrade near thermal vents |
| Electric Conduit | $1,500 | Send 3-sec stun pulse through cable (hits attached creatures) |
| Emergency Auto-Retract | $2,000 | If one player is incapacitated, cable auto-reels them toward partner at 2m/s |

### Suit Upgrades

| Upgrade | Cost | Effect |
|:---|:---|:---|
| Extended O₂ Tank | $400 | +60 sec base O₂ capacity |
| Reinforced Plating | $600 | +15% damage reduction |
| Sprint Regulator | $800 | Sprint O₂ cost reduced by 30% |
| Pressure Hardening | $1,200 | Immune to pressure-crush zone damage |
| Neural Dampener | $1,800 | Reduces nitrogen narcosis visual effects by 50% |

### Tool Upgrades (Role-Specific)

| Upgrade | Role | Cost | Effect |
|:---|:---|:---|:---|
| Extended Piton Range | BOULDER | $500 | Piton launcher range +50% |
| Wide-Band Sonar | ECHO | $700 | Sonar cone: 45° → 90° arc |
| Rapid Weld | VOLT | $600 | Repair channel time: 4s → 2.5s |
| Magnetic Cargo Lock | HAUL | $800 | Dropped salvage stays for 5 min instead of 2 min |
| Extended Thruster | GHOST | $900 | Swim burst: 3s → 5s |

---

## 6. Story Logs (Summary)

**Total logs:** 30 (discovered across multiple expeditions)
**Distribution:** ~8 per Act (Acts 1–3), ~6 in Act 4
**Format:** Text displayed on in-game terminals + optional audio playback (synthesized voice)

### Key Logs per Act

**Act 1 (8 logs):** Contract briefing. Meridian corporate PR. Initial survey team reports. Standard operational procedures. Establishes "routine salvage job" tone.

**Act 2 (8 logs):** Crew personal diaries. Lead scientist Dr. Elara Voss's growing concern. Sub-crustal cavity sonar readings. Corporate pressure to accelerate drilling. First mention of "anomalous biological signatures."

**Act 3 (8 logs):** Emergency recordings. The drill breach event (audio: alarms, screaming, structural collapse). Dr. Voss's containment protocol. Evidence that Meridian's security team sealed the crew inside. The organism's acoustic mimicry capabilities.

**Act 4 (6 logs):** Meridian board communications (redacted). Weapons application research proposals. The "Hadal Protocol" — a plan to weaponize the colony organism's pressure manipulation. Dr. Voss's final message: a warning and a choice.

---

## 7. Endings

### Ending A: Containment (Heroic)
**Trigger:** Activate the facility's self-destruct sequence to permanently seal the sub-crustal cavity.
**Consequence:** All salvage from the final dive is lost. No reward. But the organism is contained forever.
**Cinematic:** The team extracts as the facility implodes behind them. The drill shaft collapses. The bathysphere ascends in silence. Credits roll over black water.

### Ending B: Corporate Payout (Morally Grey)
**Trigger:** Extract the drill core sample and the evidence drives. Upload them to Meridian's satellite uplink.
**Consequence:** Massive payout (unlock all remaining upgrades). But Meridian now has the biological weapon. News reports in the credits hint at "unexplained deep-sea incidents" worldwide.
**Cinematic:** The team surfaces. Meridian executives greet them on a corporate vessel. Handshakes. Checks. The camera pulls back to reveal a second drill ship heading toward a different trench.

### Ending C: Scorched Earth (Hidden)
**Trigger:** Find all 30 story logs (100% completion). Extract Dr. Voss's encryption key. Upload the evidence to an independent press server instead of Meridian.
**Consequence:** Meridian is exposed. The team is blacklisted from the industry. No payout. But the truth is public.
**Cinematic:** News broadcasts play over the credits. Congressional hearings. Meridian stock crashes. The final shot: the sealed trench, undisturbed. A single bioluminescent glow pulses in the darkness.

---

## 8. Controls

### Keyboard + Mouse (Default)

| Action | Key |
|:---|:---|
| Move | WASD |
| Sprint | Left Shift (hold) |
| Crouch | Left Ctrl (toggle) |
| Jump / Thrust (GHOST) | Space |
| Interact | E (tap) / E (hold for channeled) |
| Primary Tool | Left Mouse |
| Secondary Tool | Right Mouse |
| Flashlight Toggle | F |
| Toggle Camera (3P ↔ 1P) | V |
| Helmet Visor HUD (in 1P) | H |
| Sonar Ping (ECHO) | Q |
| Voice Chat (Push to Talk) | T |
| Drop Salvage | G |
| Open Inventory | Tab |
| Extraction Beacon | B (hold 3 sec to deploy) |

### Controller Support (Planned Post-Launch)
Standard gamepad mapping. Radial wheel for tool selection.
