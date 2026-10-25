// ============================================================
// HADAL DESCENT — High-Visibility 3D Industrial Deep-Sea Prototype
// Real-time Verlet Cable + Tactile Analog Lighting + Visible Arena
// ============================================================

const container = document.getElementById('canvas-container');
const blocker = document.getElementById('blocker');
const o2Bar = document.getElementById('o2-bar');
const o2Val = document.getElementById('o2-val');
const tensionBar = document.getElementById('tension-bar');
const tensionVal = document.getElementById('tension-val');
const roleElem = document.getElementById('player-role');
const idElem = document.getElementById('player-id');
const depthElem = document.getElementById('depth-val');
const partnerElem = document.getElementById('teammate-status');
const alertBanner = document.getElementById('alert-banner');
const cameraModeElem = document.getElementById('camera-mode');
const helmetOverlay = document.getElementById('helmet-overlay');

// --- Three.js Scene Setup ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x040d1a);
// Crisp linear fog — visible up to 55 meters
scene.fog = new THREE.Fog(0x040d1a, 8, 65);

const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 100);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

// --- Audio Synthesizer ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playTone(freq, duration, type = 'sine', gainVal = 0.1) {
    if (audioCtx.state === 'suspended') return;
    try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    } catch (e) {}
}

// --- High-Visibility Industrial Lighting ---
// Bright ambient fill so geometry is NEVER pitch black
const ambientLight = new THREE.AmbientLight(0x284566, 1.4);
scene.add(ambientLight);

// Overhead industrial floodlights along the trench catwalk
const floodlight1 = new THREE.DirectionalLight(0x66bbff, 1.2);
floodlight1.position.set(10, 20, 10);
scene.add(floodlight1);

const floodlight2 = new THREE.DirectionalLight(0x336699, 0.8);
floodlight2.position.set(-10, 15, -30);
scene.add(floodlight2);

// Player Headlamp (High-Intensity Spotlight)
const headlamp = new THREE.SpotLight(0xffffff, 8.0, 45, Math.PI / 4, 0.4, 1.0);
headlamp.castShadow = true;
scene.add(headlamp);
scene.add(headlamp.target);

// Procedural Grate Texture Generator (No external downloads needed)
function createGrateTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#223447';
    ctx.fillRect(0, 0, 128, 128);
    ctx.fillStyle = '#101a24';
    for (let x = 8; x < 128; x += 16) {
        for (let y = 8; y < 128; y += 16) {
            ctx.fillRect(x, y, 8, 8);
        }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 50);
    return texture;
}

// Procedural Hazard Stripe Texture
function createHazardTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffaa00';
    ctx.fillRect(0, 0, 64, 64);
    ctx.fillStyle = '#111111';
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(32, 0); ctx.lineTo(0, 32); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(32, 64); ctx.lineTo(64, 64); ctx.lineTo(64, 32); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, 64); ctx.lineTo(64, 0); ctx.lineTo(64, 16); ctx.lineTo(16, 64); ctx.fill();
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 1);
    return texture;
}

const grateTex = createGrateTexture();
const hazardTex = createHazardTexture();

// --- Build Visible Trench Facility ---
function buildEnvironment() {
    const catwalkMat = new THREE.MeshStandardMaterial({
        map: grateTex,
        roughness: 0.6,
        metalness: 0.8,
        color: 0x88aabb
    });

    const steelWallMat = new THREE.MeshStandardMaterial({
        color: 0x3d5266,
        roughness: 0.5,
        metalness: 0.7
    });

    const hazardMat = new THREE.MeshStandardMaterial({
        map: hazardTex,
        roughness: 0.4
    });

    const seaBedMat = new THREE.MeshStandardMaterial({
        color: 0x142230,
        roughness: 0.95
    });

    // Main Steel Walkway (8m wide, 120m long)
    const walkwayGeo = new THREE.BoxGeometry(8, 0.6, 120);
    const walkway = new THREE.Mesh(walkwayGeo, catwalkMat);
    walkway.position.set(0, -0.3, -20);
    walkway.receiveShadow = true;
    scene.add(walkway);

    // Hazard Border Strips along walkway edges
    const borderGeo = new THREE.BoxGeometry(0.4, 0.7, 120);
    const borderL = new THREE.Mesh(borderGeo, hazardMat);
    borderL.position.set(-3.9, -0.25, -20);
    const borderR = new THREE.Mesh(borderGeo, hazardMat);
    borderR.position.set(3.9, -0.25, -20);
    scene.add(borderL, borderR);

    // Heavy Industrial Bulkhead Girders
    for (let z = 20; z >= -75; z -= 12) {
        const arch = new THREE.Group();

        // Left Pillar
        const p1 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 7, 1.2), steelWallMat);
        p1.position.set(-4.5, 3.2, z);
        // Right Pillar
        const p2 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 7, 1.2), steelWallMat);
        p2.position.set(4.5, 3.2, z);

        // Top Crossbeam
        const beam = new THREE.Mesh(new THREE.BoxGeometry(10.2, 1.2, 1.2), steelWallMat);
        beam.position.set(0, 6.6, z);

        // Amber Emergency Beacon on crossbeam
        const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.4), new THREE.MeshBasicMaterial({ color: 0xffaa00 }));
        lamp.position.set(0, 5.8, z);
        const beaconLight = new THREE.PointLight(0xffaa00, 1.5, 12);
        beaconLight.position.set(0, 5.5, z);

        arch.add(p1, p2, beam, lamp, beaconLight);
        scene.add(arch);
    }

    // Seabed Abyss Terrain (Below the walkway)
    const seaBedGeo = new THREE.PlaneGeometry(160, 160, 20, 20);
    const pos = seaBedGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
        pos.setY(i, (Math.random() - 0.5) * 6);
    }
    seaBedGeo.computeVertexNormals();
    const seaBed = new THREE.Mesh(seaBedGeo, seaBedMat);
    seaBed.rotation.x = -Math.PI / 2;
    seaBed.position.set(0, -6.5, -20);
    seaBed.receiveShadow = true;
    scene.add(seaBed);

    // Heavy Mooring Winch (Stationary Anchor Point)
    const winchBase = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.1, 1.6, 16), steelWallMat);
    winchBase.position.set(0, 0.8, 22);
    const winchDrum = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 1.2, 16), new THREE.MeshStandardMaterial({ color: 0xaa5522, metalness: 0.9 }));
    winchDrum.rotation.z = Math.PI / 2;
    winchDrum.position.set(0, 1.4, 22);
    scene.add(winchBase, winchDrum);
}
buildEnvironment();

// --- Marine Snow Particles ---
const pCount = 500;
const pGeo = new THREE.BufferGeometry();
const pPos = new Float32Array(pCount * 3);
for (let i = 0; i < pCount * 3; i += 3) {
    pPos[i] = (Math.random() - 0.5) * 40;
    pPos[i + 1] = Math.random() * 10 - 1;
    pPos[i + 2] = (Math.random() - 0.5) * 90 - 20;
}
pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
const marineSnow = new THREE.Points(pGeo, new THREE.PointsMaterial({
    color: 0xaaeeff,
    size: 0.1,
    transparent: true,
    opacity: 0.7
}));
scene.add(marineSnow);

// --- High-Fidelity 3D Diver Model Generator ---
function createDiver(colorHex = 0x00d4ff) {
    const group = new THREE.Group();

    // Heavy Armored Torso (High contrast, clearly visible)
    const torsoMat = new THREE.MeshStandardMaterial({ color: 0x2e4254, roughness: 0.4, metalness: 0.7 });
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.1, 0.55), torsoMat);
    torso.position.y = 1.0;
    torso.castShadow = true;
    group.add(torso);

    // Life-Support Oxygen Rig on Back
    const rigMat = new THREE.MeshStandardMaterial({ color: colorHex, metalness: 0.8, roughness: 0.2 });
    const tankL = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.9, 12), rigMat);
    tankL.position.set(-0.22, 1.05, -0.42);
    const tankR = tankL.clone();
    tankR.position.x = 0.22;
    group.add(tankL, tankR);

    // Helmet with Vivid Visor Glow
    const helmetMat = new THREE.MeshStandardMaterial({ color: 0x4a6278, metalness: 0.8, roughness: 0.3 });
    const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.36, 16, 16), helmetMat);
    helmet.position.set(0, 1.75, 0.05);

    const visorMat = new THREE.MeshBasicMaterial({ color: colorHex });
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.22, 0.15), visorMat);
    visor.position.set(0, 1.76, 0.32);
    group.add(helmet, visor);

    // Heavy Boots
    const bootMat = new THREE.MeshStandardMaterial({ color: 0x182430, roughness: 0.9 });
    const bootL = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.45, 0.45), bootMat);
    bootL.position.set(-0.26, 0.22, 0);
    const bootR = bootL.clone();
    bootR.position.x = 0.26;
    group.add(bootL, bootR);

    // Cable Mount Carabiner Hook
    const hook = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.04, 8, 16), new THREE.MeshStandardMaterial({ color: 0xffcc00, metalness: 0.9 }));
    hook.position.set(0, 1.15, -0.6);
    group.add(hook);

    return group;
}

// Local Player & Remote Players Map
const localPlayerMesh = createDiver(0x00d4ff);
localPlayerMesh.position.set(0, 0, 10);
scene.add(localPlayerMesh);

const otherPlayers = new Map();

// --- Blind Predator (Pressure Stalker) ---
const stalkerGroup = new THREE.Group();
const stalkerMat = new THREE.MeshStandardMaterial({ color: 0x1a0505, roughness: 0.2, metalness: 0.8 });
const carapace = new THREE.Mesh(new THREE.ConeGeometry(1.1, 4.2, 8), stalkerMat);
carapace.rotation.x = Math.PI / 2;
stalkerGroup.add(carapace);

// Glowing crimson sensory organs
for (let i = -1.5; i <= 1.5; i += 0.6) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), new THREE.MeshBasicMaterial({ color: 0xff0033 }));
    eye.position.set(0, 0.65, i);
    stalkerGroup.add(eye);
}
stalkerGroup.position.set(0, 1.2, -30);
scene.add(stalkerGroup);

// --- High-Performance Verlet Physics Cable (Line / Spline) ---
class VisibleVerletCable {
    constructor(nodeCount = 20, segLength = 1.0) {
        this.nodeCount = nodeCount;
        this.segLength = segLength;
        this.restLength = (nodeCount - 1) * segLength;
        this.nodes = [];
        this.prevNodes = [];
        this.tension = 0;

        for (let i = 0; i < nodeCount; i++) {
            this.nodes.push(new THREE.Vector3(0, 1.2, 10 + i * 0.6));
            this.prevNodes.push(new THREE.Vector3(0, 1.2, 10 + i * 0.6));
        }

        // Heavy Cable Geometry
        this.geometry = new THREE.BufferGeometry().setFromPoints(this.nodes);
        this.material = new THREE.LineBasicMaterial({ color: 0x00ff88, linewidth: 3 });
        this.line = new THREE.Line(this.geometry, this.material);
        scene.add(this.line);
    }

    update(startPos, endPos, delta) {
        this.nodes[0].copy(startPos);
        this.nodes[this.nodeCount - 1].copy(endPos);

        const dt2 = Math.min(delta, 0.05) ** 2;
        const gravity = new THREE.Vector3(0, -3.0, 0);

        for (let i = 1; i < this.nodeCount - 1; i++) {
            const vel = this.nodes[i].clone().sub(this.prevNodes[i]).multiplyScalar(0.96);
            this.prevNodes[i].copy(this.nodes[i]);
            this.nodes[i].add(vel).addScaledVector(gravity, dt2);

            if (this.nodes[i].y < 0.15) this.nodes[i].y = 0.15; // Floor collision
        }

        // Solve distance constraints
        for (let iter = 0; iter < 4; iter++) {
            for (let i = 0; i < this.nodeCount - 1; i++) {
                const deltaV = this.nodes[i + 1].clone().sub(this.nodes[i]);
                const dist = deltaV.length();
                if (dist === 0) continue;
                const diff = (dist - this.segLength) / dist;

                if (i !== 0) this.nodes[i].addScaledVector(deltaV, diff * 0.5);
                if (i + 1 !== this.nodeCount - 1) this.nodes[i + 1].addScaledVector(deltaV, -diff * 0.5);
            }
        }

        // Calculate Tension
        const directDist = startPos.distanceTo(endPos);
        const ratio = directDist / this.restLength;
        this.tension = Math.max(0, Math.min(100, (ratio - 0.65) * 170));

        // Update Line Points
        this.geometry.setFromPoints(this.nodes);
        this.geometry.attributes.position.needsUpdate = true;

        if (this.tension > 85) {
            this.material.color.setHex(0xff2222);
        } else if (this.tension > 50) {
            this.material.color.setHex(0xffaa00);
        } else {
            this.material.color.setHex(0x00ff88);
        }
    }
}
const tetherCable = new VisibleVerletCable(20, 1.1);

// --- Expanding Sonar Wave Visuals ---
const activeWaves = [];
function spawnSonarWave(x, z, maxRadius, colorHex = 0x00e5ff) {
    const geo = new THREE.RingGeometry(0.3, 0.6, 32);
    const mat = new THREE.MeshBasicMaterial({ color: colorHex, side: THREE.DoubleSide, transparent: true, opacity: 0.95 });
    const ring = new THREE.Mesh(geo, mat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(x, 0.08, z);
    scene.add(ring);

    activeWaves.push({
        mesh: ring,
        radius: 0.3,
        maxRadius: maxRadius,
        speed: maxRadius * 1.8,
        opacity: 0.95
    });
}

// --- Player State & Input Controls ---
let isFirstPerson = false;
let isHelmetVisorOn = true;
let oxygen = 100;
let isFlashlightOn = true;
const keys = {};

let playerYaw = 0;
let playerPitch = 0;

window.addEventListener('keydown', (e) => {
    keys[e.code] = true;

    // Toggle Camera: V
    if (e.code === 'KeyV') {
        isFirstPerson = !isFirstPerson;
        cameraModeElem.innerText = `VIEW: ${isFirstPerson ? '1ST PERSON' : '3RD PERSON'} [V]`;
        localPlayerMesh.visible = !isFirstPerson;
    }

    // Toggle Helmet: H
    if (e.code === 'KeyH') {
        isHelmetVisorOn = !isHelmetVisorOn;
        helmetOverlay.style.opacity = isHelmetVisorOn ? '1' : '0';
    }

    // Flashlight: F
    if (e.code === 'KeyF') {
        isFlashlightOn = !isFlashlightOn;
        headlamp.intensity = isFlashlightOn ? 8.0 : 0;
        playTone(700, 0.06, 'square', 0.05);
    }

    // Sonar Ping: Q
    if (e.code === 'KeyQ') {
        playTone(950, 1.2, 'sine', 0.3);
        spawnSonarWave(localPlayerMesh.position.x, localPlayerMesh.position.z, 35, 0x00e5ff);

        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: 'noise_event',
                x: localPlayerMesh.position.x,
                z: localPlayerMesh.position.z,
                radius: 35,
                source: 'sonar'
            }));
        }
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

// Pointer Lock
blocker.addEventListener('click', () => {
    document.body.requestPointerLock();
    if (audioCtx.state === 'suspended') audioCtx.resume();
});

document.addEventListener('pointerlockchange', () => {
    blocker.style.display = document.pointerLockElement === document.body ? 'none' : 'flex';
});

document.addEventListener('mousemove', (e) => {
    if (document.pointerLockElement !== document.body) return;
    const sens = 0.0022;
    playerYaw -= e.movementX * sens;
    playerPitch -= e.movementY * sens;
    playerPitch = Math.max(-Math.PI / 2.3, Math.min(Math.PI / 2.3, playerPitch));
});

// --- WebSocket Multiplayer Setup ---
let myId = null;
const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const ws = new WebSocket(`${wsProtocol}//${window.location.host}`);

ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);

    if (msg.type === 'init') {
        myId = msg.id;
        idElem.innerText = `DIVER ID: ${myId.toUpperCase()}`;
        roleElem.innerText = msg.role;

        msg.players.forEach((p) => {
            if (p.id !== myId) addRemotePlayer(p);
        });
        updatePartnerUI();
    } else if (msg.type === 'player_joined') {
        addRemotePlayer(msg.player);
        updatePartnerUI();
    } else if (msg.type === 'player_moved') {
        const rp = otherPlayers.get(msg.id);
        if (rp) {
            rp.mesh.position.set(msg.x, msg.y, msg.z);
            rp.mesh.rotation.y = msg.yaw;
        }
    } else if (msg.type === 'player_left') {
        const rp = otherPlayers.get(msg.id);
        if (rp) {
            scene.remove(rp.mesh);
            otherPlayers.delete(msg.id);
        }
        updatePartnerUI();
    } else if (msg.type === 'noise_event') {
        if (msg.playerId !== myId) {
            spawnSonarWave(msg.x, msg.z, msg.radius, 0xff7700);
        }
    } else if (msg.type === 'creature_pos') {
        stalkerGroup.position.x = msg.x;
        stalkerGroup.position.z = msg.z;
    } else if (msg.type === 'creature_alerted') {
        alertBanner.style.display = 'block';
        alertBanner.innerText = `⚠️ ACOUSTIC CONTACT — STALKER ${msg.state.toUpperCase()}`;
        setTimeout(() => { alertBanner.style.display = 'none'; }, 4000);
    }
};

function addRemotePlayer(data) {
    if (otherPlayers.has(data.id)) return;
    const mesh = createDiver(data.color || 0xffaa00);
    mesh.position.set(data.x, data.y, data.z);
    scene.add(mesh);
    otherPlayers.set(data.id, { mesh, data });
}

function updatePartnerUI() {
    if (otherPlayers.size > 0) {
        const first = Array.from(otherPlayers.values())[0];
        partnerElem.innerText = `PARTNER: ${first.data.role} [LINKED]`;
        partnerElem.style.color = '#00ff88';
    } else {
        partnerElem.innerText = `PARTNER: AWAITING (ANCHORED TO WINCH)`;
        partnerElem.style.color = '#8bb8d8';
    }
}

// 20Hz Network Broadcast
setInterval(() => {
    if (ws && ws.readyState === WebSocket.OPEN && myId) {
        ws.send(JSON.stringify({
            type: 'update_movement',
            x: localPlayerMesh.position.x,
            y: localPlayerMesh.position.y,
            z: localPlayerMesh.position.z,
            yaw: playerYaw,
            pitch: playerPitch,
            isSprinting: keys['ShiftLeft'] || keys['ShiftRight'],
            isCrouching: keys['ControlLeft'] || keys['ControlRight'],
            oxygen: oxygen
        }));
    }
}, 50);

// --- Main Animation & Simulation Loop ---
const clock = new THREE.Clock();
let lastNoiseTime = 0;

function animate() {
    requestAnimationFrame(animate);

    const delta = Math.min(clock.getDelta(), 0.1);
    const now = performance.now();

    // 1. Locomotion
    const isSprinting = keys['ShiftLeft'] || keys['ShiftRight'];
    const isCrouching = keys['ControlLeft'] || keys['ControlRight'];

    let speed = 4.5;
    if (isSprinting) speed = 8.0;
    if (isCrouching) speed = 2.2;

    const moveVector = new THREE.Vector3();
    if (keys['KeyW']) moveVector.z -= 1;
    if (keys['KeyS']) moveVector.z += 1;
    if (keys['KeyA']) moveVector.x -= 1;
    if (keys['KeyD']) moveVector.x += 1;

    if (moveVector.lengthSq() > 0) {
        moveVector.normalize();
        moveVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), playerYaw);
        localPlayerMesh.position.addScaledVector(moveVector, speed * delta);

        // Footstep Noise Wave
        if (now - lastNoiseTime > (isSprinting ? 280 : 600)) {
            lastNoiseTime = now;
            const noiseRad = isSprinting ? 18 : (isCrouching ? 4 : 8);
            const color = isSprinting ? 0xff4422 : 0x00d4ff;
            spawnSonarWave(localPlayerMesh.position.x, localPlayerMesh.position.z, noiseRad, color);

            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    type: 'noise_event',
                    x: localPlayerMesh.position.x,
                    z: localPlayerMesh.position.z,
                    radius: noiseRad,
                    source: isSprinting ? 'sprint' : 'walk'
                }));
            }
        }
    }

    localPlayerMesh.rotation.y = playerYaw;

    // Headlamp Position
    headlamp.position.copy(localPlayerMesh.position).add(new THREE.Vector3(0, 1.7, 0));
    const targetDir = new THREE.Vector3(0, 0, -1)
        .applyAxisAngle(new THREE.Vector3(1, 0, 0), playerPitch)
        .applyAxisAngle(new THREE.Vector3(0, 1, 0), playerYaw);
    headlamp.target.position.copy(headlamp.position).add(targetDir);

    // 2. Camera Positioning (1st vs 3rd Person)
    if (isFirstPerson) {
        camera.position.copy(localPlayerMesh.position).add(new THREE.Vector3(0, 1.75, 0));
        camera.rotation.set(playerPitch, playerYaw, 0, 'YXZ');
    } else {
        // 3rd Person over-the-shoulder offset
        const offset = new THREE.Vector3(0.6, 2.1, 4.2).applyAxisAngle(new THREE.Vector3(0, 1, 0), playerYaw);
        camera.position.copy(localPlayerMesh.position).add(offset);
        camera.lookAt(localPlayerMesh.position.clone().add(new THREE.Vector3(0, 1.4, 0)));
    }

    // 3. Tether Cable Simulation
    const cableStart = localPlayerMesh.position.clone().add(new THREE.Vector3(0, 1.15, -0.6));
    let cableEnd = new THREE.Vector3(0, 1.4, 22); // Stationary winch

    if (otherPlayers.size > 0) {
        const partner = Array.from(otherPlayers.values())[0];
        cableEnd = partner.mesh.position.clone().add(new THREE.Vector3(0, 1.15, -0.6));
    }

    tetherCable.update(cableStart, cableEnd, delta);

    // Update UI Tension Bar
    tensionBar.style.width = `${tetherCable.tension}%`;
    tensionVal.innerText = `${Math.round(tetherCable.tension)}%`;
    if (tetherCable.tension > 85) {
        tensionBar.style.backgroundColor = '#ff2222';
    } else if (tetherCable.tension > 50) {
        tensionBar.style.backgroundColor = '#ffaa00';
    } else {
        tensionBar.style.backgroundColor = '#00ff88';
    }

    // 4. Update Sonar Waves
    for (let i = activeWaves.length - 1; i >= 0; i--) {
        const w = activeWaves[i];
        w.radius += w.speed * delta;
        w.mesh.scale.set(w.radius, w.radius, 1);
        w.opacity -= delta * 1.1;
        w.mesh.material.opacity = Math.max(0, w.opacity);

        if (w.opacity <= 0) {
            scene.remove(w.mesh);
            activeWaves.splice(i, 1);
        }
    }

    // 5. Marine Snow Drift
    const positions = marineSnow.geometry.attributes.position.array;
    for (let i = 1; i < positions.length; i += 3) {
        positions[i] -= delta * 0.5;
        if (positions[i] < -4) positions[i] = 9;
    }
    marineSnow.geometry.attributes.position.needsUpdate = true;

    // 6. Oxygen & Depth UI
    if (isSprinting) oxygen -= delta * 0.9;
    else oxygen -= delta * 0.12;
    oxygen = Math.max(0, oxygen);
    o2Bar.style.width = `${Math.round(oxygen)}%`;
    o2Val.innerText = `${Math.round(oxygen)}%`;

    const currentDepth = 6420 + Math.round(-localPlayerMesh.position.z * 10);
    depthElem.innerText = `${currentDepth.toLocaleString()} M`;

    renderer.render(scene, camera);
}

// Window resize handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start loop
animate();
