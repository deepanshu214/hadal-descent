# HADAL DESCENT

> **A 3D Co-op Deep-Sea Extraction Thriller — 2 to 5 Players**

![Status](https://img.shields.io/badge/Status-In%20Development-blue)
![Engine](https://img.shields.io/badge/Engine-Unity%206%20URP-black)
![License](https://img.shields.io/badge/License-All%20Rights%20Reserved-red)
![Players](https://img.shields.io/badge/Players-2--5%20Co--op-green)
![Rating](https://img.shields.io/badge/Rating-18+-critical)

---

## Overview

**Hadal Descent** is a 3D cooperative deep-sea extraction thriller where 2–5 players descend into procedurally generated underwater trench facilities as a tethered dive team. Connected by a physics-simulated life-support cable, players must coordinate movement, manage oxygen, evade blind predatory creatures using acoustic stealth, salvage valuable research artifacts, and extract before their systems fail.

Every dive is unique. Every sound matters. Every decision could be your last.

---

## Core Features

- **Physics-Driven Tether System:** Multi-segment Verlet rope simulation with tension, snag, and snap mechanics connecting all players
- **Procedural Dive Generation:** Seed-based modular level generation — no two dives are the same
- **5 Asymmetric Roles:** Anchor, Analyst, Engineer, Trawler, Diver — each with unique equipment and abilities
- **Acoustic Stealth AI:** Blind deep-sea creatures hunt by sound — every footstep, tool use, and sonar ping creates detectable noise events
- **Push-Your-Luck Extraction:** Risk staying deeper for rare salvage or extract safely with what you have
- **Persistent Meta-Progression:** Sell salvage → upgrade suits, tether, and tools → unlock deeper tiers
- **4 Depth Tiers:** Continental Shelf → Bathyal Cliffs → Abyssal Trench → The Hadal Core
- **Branching Narrative:** 30+ discoverable story logs across multiple expeditions, 3 distinct endings
- **Mature Atmosphere (18+):** Diegetic HUD, nitrogen narcosis effects, realistic injury system, psychological horror
- **Multiple Camera Modes:** Third-person, first-person, helmet cam, tether cam, spectator

---

## Tech Stack

| Layer | Technology |
|:---|:---|
| Engine | Unity 6 (6000.x) — Universal Render Pipeline |
| Language | C# |
| Networking | Fish-Networking (FishNet) |
| Relay / NAT | Unity Relay + Lobby (UGS Free Tier) |
| 3D Modeling | Blender 4.x |
| Characters | Mixamo (Adobe) |
| Textures | ambientCG / Polyhaven / Quixel Bridge (CC0) |
| Audio | Soniss GDC Archives / Freesound.org |
| Version Control | Git + GitHub |

---

## Project Structure

```
hadal-descent/
├── README.md                     # This file
├── .gitignore                    # Unity + macOS ignores
├── docs/                         # Design documents
│   ├── MASTER_PLAN.md            # 10-week development plan
│   ├── GAME_DESIGN_DOCUMENT.md   # Full GDD
│   ├── WEEK_CHECKLIST.md         # Weekly task checklist
│   ├── ASSET_SOURCES.md          # Free asset links & licenses
│   └── TECH_ARCHITECTURE.md      # Technical architecture
├── references/                   # Reference images, mood boards
├── scripts/                      # C# scripts (mirrors Unity Assets/_Scripts/)
│   ├── player/                   # Character controller, camera, input
│   ├── networking/               # FishNet managers, lobby, relay
│   ├── cable/                    # Tether / cable physics system
│   ├── creatures/                # AI state machines, sound propagation
│   ├── environment/              # Underwater effects, lighting
│   ├── ui/                       # Menus, HUD, debrief screen
│   ├── systems/                  # Oxygen, injuries, salvage, upgrades
│   └── procedural/               # Map generation algorithm
├── assets/                       # Raw assets (pre-import)
│   ├── models/
│   ├── textures/
│   ├── audio/
│   ├── animations/
│   └── ui/
├── prefabs/                      # Unity prefab references
├── scenes/                       # Unity scene references
├── materials/                    # Material definitions
└── vfx/                          # Particle systems, shaders
```

---

## Getting Started

### Prerequisites
- Unity Hub + Unity 6 LTS (URP 3D Template)
- Blender 4.x
- Git
- macOS or Windows

### Setup
```bash
git clone https://github.com/YOUR_USERNAME/hadal-descent.git
cd hadal-descent
# Open the Unity project folder in Unity Hub
```

---

## Development Timeline

| Week | Phase | Milestone |
|:---|:---|:---|
| 1 | Setup + Cable Start | Walking underwater with atmosphere |
| 2 | Cable + Networking Start | Physics tether working |
| 3 | Multiplayer Complete | 2-5 players connected via team codes |
| 4-5 | Environment + Gameplay | Full dive loop with survival mechanics |
| 6 | All Roles + Systems | 5 roles, upgrades, extraction |
| 7-8 | Creatures + Procedural | AI threats + unique maps every dive |
| 9 | Story + UI | Narrative, menus, endings |
| 10 | Polish + Ship | Bug fixes, trailer, publish on Itch.io |

---

## Target Audience

**18+ / Mature** — This game contains psychological horror elements, body horror environmental storytelling, claustrophobic atmospheres, and mature narrative themes involving corporate negligence and ethical dilemmas.

---

## License

All Rights Reserved © 2026. This project is a personal portfolio / capstone project.
