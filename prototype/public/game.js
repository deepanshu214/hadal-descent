// ============================================================
// HADAL DESCENT — 3D Co-op Deep-Sea Prototype (Three.js)
// Real-time Verlet Cable Physics + Acoustic Sound Propagation +
// 1st/3rd Person Cameras + Blind Predator AI + WebSocket Co-op
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

// --- Three.js Core Setup ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x010814);
scene.fog = new THREE.FogExp2(0x010814, 0.035); // Murky deep water fog

const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 100);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
container.appendChild(renderer.domElement);

// --- Audio Listener & Synthesizer (No external assets required!) ---
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

function playSonarPing() {
    playTone(950, 1.2, 'sine', 0.25);
    setTimeout(() => playTone(1200, 0.8, 'sine', 0.15), 150);
}

function playCableStrain() {
    playTone(180, 0.25, 'sawtooth', 0.08);
}

// --- Lighting ---
const ambientLight = new THREE.AmbientLight(0x061528, 0.6);
scene.add(ambientLight);

// Player Headlamp (Spotlight)
const headlamp = new THREE.SpotLight(0xaad8ff, 6.0, 35, Math.PI / 5, 0.5, 1.2);
headlamp.castShadow = true;
scene.add(headlamp);
scene.add(headlamp.target);

// Emergency facility lights
const redLight1 = new THREE.PointLight(0xff2222, 2.5, 15);
redLight1.position.set(-6, 3, -10);
scene.add(redLight1);

const redLight2 = new THREE.PointLight(0x00d4ff, 2.0, 20);
redLight2.position.set(6, 4, -30);
scene.add(redLight2);

// --- Environment Geometry ---
function createTrenchFacility() {
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x1a2634, roughness: 0.7, metalness: 0.8 });
    const gratingMat = new THREE.MeshStandardMaterial({ color: 0x0f1822, roughness: 0.9, metalness: 0.6 });
    const hazardMat = new THREE.MeshStandardMaterial({ color: 0xffaa00, roughness: 0.5 });
    const abyssRockMat = new THREE.MeshStandardMaterial({ color: 0x081018, roughness: 0.95 });

    // Main walkway (Catwalk over the abyss)
    const walkwayGeo = new THREE.BoxGeometry(8, 0.6, 100);
    const walkway = new THREE.Mesh(walkwayGeo, gratingMat);
    walkway.position.set(0, -0.3, -20);
    walkway.receiveShadow = true;
    scene.add(walkway);

    // Side railings
    for (let z = 20; z >= -65; z -= 8) {
        const postGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.2);
        const postL = new THREE.Mesh(postGeo, metalMat);
        postL.position.set(-3.9, 0.6, z);
        scene.add(postL);

        const postR = new THREE.Mesh(postGeo, metalMat);
        postR.position.set(3.9, 0.6, z);
        scene.add(postR);
    }

    // Overhead Bulkhead Arches
    for (let z = 15; z >= -65; z -= 15) {
        const archGroup = new THREE.Group();
        const pillarGeo = new THREE.BoxGeometry(0.8, 6, 0.8);
        const p1 = new THREE.Mesh(pillarGeo, metalMat);
        p1.position.set(-4.2, 3, z);
        const p2 = new THREE.Mesh(pillarGeo, metalMat);
        p2.position.set(4.2, 3, z);

        const beamGeo = new THREE.BoxGeometry(9.2, 0.8, 0.8);
        const beam = new THREE.Mesh(beamGeo, metalMat);
        beam.position.set(0, 6, z);

        const stripeGeo = new THREE.BoxGeometry(1.5, 0.2, 0.85);
        const stripe = new THREE.Mesh(stripeGeo, hazardMat);
        stripe.position.set(0, 6.2, z);

        archGroup.add(p1, p2, beam, stripe);
        scene.add(archGroup);
    }

    // Seabed Abyss Cliffs (Far below)
    const seaFloorGeo = new THREE.PlaneGeometry(120, 140, 24, 24);
    // Add jagged noise to seafloor
    const pos = seaFloorGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
        pos.setY(i, (Math.random() - 0.5) * 4);
    }
    seaFloorGeo.computeVertexNormals();
    const seaFloor = new THREE.Mesh(seaFloorGeo, abyssRockMat);
    seaFloor.rotation.x = -Math.PI / 2;
    seaFloor.position.set(0, -8, -25);
    scene.add(seaFloor);

    // Mooring Anchor Winch (fallback anchor if solo)
    const winchGeo = new THREE.CylinderGeometry(0.6, 0.7, 1.4, 16);
    const winchMat = new THREE.MeshStandardMaterial({ color: 0x884422, metalness: 0.9, roughness: 0.4 });
    const winch = new THREE.Mesh(winchGeo, winchMat);
    winch.position.set(0, 0.7, 18);
    scene.add(winch);
}
createTrenchFacility();

// --- Marine Snow Particles (Deep-sea particulate drift) ---
const particleCount = 600;
const particleGeo = new THREE.BufferGeometry();
const particlePositions = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount * 3; i += 3) {
    particlePositions[i] = (Math.random() - 0.5) * 40;
    particlePositions[i + 1] = Math.random() * 12 - 2;
    particlePositions[i + 2] = (Math.random() - 0.5) * 80 - 20;
}
particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
const particleMat = new THREE.PointsMaterial({
    color: 0x99ccff,
    size: 0.08,
    transparent: true,
    opacity: 0.6
});
const marineSnow = new THREE.Points(particleGeo, particleMat);
scene.add(marineSnow);

// --- Player 3D Character Model Generator ---
function createDiverMesh(colorHex = 0x00d4ff) {
    const group = new THREE.Group();

    // Torso (Heavy atmospheric suit)
    const torsoGeo = new THREE.BoxGeometry(0.7, 0.9, 0.5);
    const suitMat = new THREE.MeshStandardMaterial({ color: 0x22303c, roughness: 0.6, metalness: 0.4 });
    const torso = new THREE.Mesh(torsoGeo, suitMat);
    torso.position.y = 0.9;
    group.add(torso);

    // Life-support backpack
    const packGeo = new THREE.BoxGeometry(0.5, 0.7, 0.35);
    const packMat = new THREE.MeshStandardMaterial({ color: colorHex, metalness: 0.8, roughness: 0.3 });
    const pack = new THREE.Mesh(packGeo, packMat);
    pack.position.set(0, 0.95, -0.4);
    group.add(pack);

    // Helmet with glowing visor
    const helmetGeo = new THREE.SphereGeometry(0.32, 16, 16);
    const helmetMat = new THREE.MeshStandardMaterial({ color: 0x334455, roughness: 0.4, metalness: 0.7 });
    const helmet = new THREE.Mesh(helmetGeo, helmetMat);
    helmet.position.set(0, 1.55, 0.05);

    const visorGeo = new THREE.CylinderGeometry(0.2, 0.22, 0.2, 16, 1, false, -Math.PI / 3, (2 * Math.PI) / 3);
    const visorMat = new THREE.MeshBasicMaterial({ color: colorHex });
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, 1.55, 0.22);
    visor.rotation.x = Math.PI / 2;

    group.add(helmet, visor);

    // Limbs
    const limbMat = new THREE.MeshStandardMaterial({ color: 0x162029, roughness: 0.8 });
    const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.8), limbMat);
    legL.position.set(-0.22, 0.4, 0);
    const legR = legL.clone();
    legR.position.x = 0.22;
    group.add(legL, legR);

    // Cable harness anchor ring on chest/back
    const ringGeo = new THREE.TorusGeometry(0.1, 0.03, 8, 16);
    const ringMat = new THREE.MeshStandardMaterial({ color: 0xffaa00, metalness: 0.9 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.set(0, 1.1, -0.58);
    group.add(ring);

    return group;
}

// Local Player & Remote Players
const localPlayerMesh = createDiverMesh(0x00d4ff);
scene.add(localPlayerMesh);
localPlayerMesh.position.set(0, 0, 10);

const otherPlayers = new Map(); // id -> { mesh, data }

// --- Blind Predator (Pressure Stalker) ---
const creatureGroup = new THREE.Group();
const stalkerMat = new THREE.MeshStandardMaterial({ color: 0x120505, roughness: 0.3, metalness: 0.8 });
const spineMat = new THREE.MeshBasicMaterial({ color: 0xff0044 });

const body = new THREE.Mesh(new THREE.ConeGeometry(0.8, 3.5, 6), stalkerMat);
body.rotation.x = Math.PI / 2;
creatureGroup.add(body);

// Spine bioluminescent nodes
for (let z = -1.2; z <= 1.2; z += 0.5) {
    const node = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), spineMat);
    node.position.set(0, 0.45, z);
    creatureGroup.add(node);
}
creatureGroup.position.set(0, 1.2, -35);
scene.add(creatureGroup);

// --- Live Verlet Physics Cable ---
class VerletRope {
    constructor(nodeCount = 20, segmentLength = 0.9) {
        this.nodeCount = nodeCount;
        this.segmentLength = segmentLength;
        this.restLength = (nodeCount - 1) * segmentLength;
        this.nodes = [];
        this.prevNodes = [];
        this.gravity = new THREE.Vector3(0, -2.5, 0);
        this.damping = 0.97;
        this.tension = 0;

        for (let i = 0; i < nodeCount; i++) {
            this.nodes.push(new THREE.Vector3(0, 1, 10 + i * 0.5));
            this.prevNodes.push(new THREE.Vector3(0, 1, 10 + i * 0.5));
        }

        // 3D Cable Mesh
        this.curve = new THREE.CatmullRomCurve3(this.nodes);
        this.geom = new THREE.TubeGeometry(this.curve, 32, 0.05, 8, false);
        this.mat = new THREE.MeshStandardMaterial({ color: 0xffaa00, roughness: 0.5, metalness: 0.8 });
        this.mesh = new THREE.Mesh(this.geom, this.mat);
        scene.add(this.mesh);
    }

    update(startPos, endPos, delta) {
        // Pin endpoints
        this.nodes[0].copy(startPos);
        this.nodes[this.nodeCount - 1].copy(endPos);

        const dt2 = Math.min(delta, 0.05) ** 2;

        // Verlet integration
        for (let i = 1; i < this.nodeCount - 1; i++) {
            const temp = this.nodes[i].clone();
            const vel = this.nodes[i].clone().sub(this.prevNodes[i]).multiplyScalar(this.damping);
            this.nodes[i].add(vel).addScaledVector(this.gravity, dt2);

            // Ground floor constraint
            if (this.nodes[i].y < 0.1) this.nodes[i].y = 0.1;

            this.prevNodes[i].copy(temp);
        }

        // Distance constraint solving (4 iterations)
        for (let iter = 0; iter < 4; iter++) {
            for (let i = 0; i < this.nodeCount - 1; i++) {
                const deltaV = this.nodes[i + 1].clone().sub(this.nodes[i]);
                const dist = deltaV.length();
                if (dist === 0) continue;
                const diff = (dist - this.segmentLength) / dist;

                if (i !== 0) this.nodes[i].addScaledVector(deltaV, diff * 0.5);
                if (i + 1 !== this.nodeCount - 1) this.nodes[i + 1].subScaledVector(deltaV, diff * 0.5);
            }
        }

        // Calculate Tension
        const directDist = startPos.distanceTo(endPos);
        const stretchRatio = directDist / this.restLength;
        this.tension = Math.max(0, Math.min(100, (stretchRatio - 0.7) * 160));

        // Update 3D Geometry
        this.curve.points = this.nodes;
        this.mesh.geometry.dispose();
        this.mesh.geometry = new THREE.TubeGeometry(this.curve, 32, 0.05, 8, false);

        // Update Tension Mat Color
        if (this.tension > 85) {
            this.mat.color.setHex(0xff2222);
        } else if (this.tension > 50) {
            this.mat.color.setHex(0xffaa00);
        } else {
            this.mat.color.setHex(0x00ff88);
        }
    }
}
const tetherCable = new VerletRope(18, 1.1);

// --- Sound Visualizer (Expanding 3D Sonar Rings) ---
const activeRipples = [];
function spawnSoundRipple(x, z, maxRadius, colorHex = 0x00d4ff) {
    const geo = new THREE.RingGeometry(0.2, 0.4, 32);
    const mat = new THREE.MeshBasicMaterial({ color: colorHex, side: THREE.DoubleSide, transparent: true, opacity: 0.9 });
    const ring = new THREE.Mesh(geo, mat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(x, 0.05, z);
    scene.add(ring);

    activeRipples.push({
        mesh: ring,
        radius: 0.2,
        maxRadius: maxRadius,
        speed: maxRadius * 1.5,
        opacity: 0.9
    });
}

// --- Player State & Controls ---
let isFirstPerson = false;
let isHelmetVisorOn = true;
let oxygen = 100;
let isFlashlightOn = true;
const keys = {};

const playerVelocity = new THREE.Vector3();
let playerYaw = 0;
let playerPitch = 0;

window.addEventListener('keydown', (e) => {
    keys[e.code] = true;

    // Toggle Camera: V
    if (e.code === 'KeyV') {
        isFirstPerson = !isFirstPerson;
        cameraModeElem.innerText = `VIEW: ${isFirstPerson ? '1ST PERSON' : '3RD PERSON'} [V]`;
        localPlayerMesh.visible = !isFirstPerson; // Hide own body in 1st person
    }

    // Toggle Visor: H
    if (e.code === 'KeyH') {
        isHelmetVisorOn = !isHelmetVisorOn;
        helmetOverlay.style.opacity = isHelmetVisorOn ? '1' : '0';
    }

    // Flashlight: F
    if (e.code === 'KeyF') {
        isFlashlightOn = !isFlashlightOn;
        headlamp.intensity = isFlashlightOn ? 6.0 : 0;
        playTone(600, 0.08, 'square', 0.05);
    }

    // Sonar Ping: Q
    if (e.code === 'KeyQ') {
        triggerSonarPing();
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

// Pointer Lock & Mouse Look
blocker.addEventListener('click', () => {
    document.body.requestPointerLock();
    if (audioCtx.state === 'suspended') audioCtx.resume();
});

document.addEventListener('pointerlockchange', () => {
    if (document.pointerLockElement === document.body) {
        blocker.style.display = 'none';
    } else {
        blocker.style.display = 'flex';
    }
});

document.addEventListener('mousemove', (e) => {
    if (document.pointerLockElement !== document.body) return;
    const sens = 0.0022;
    playerYaw -= e.movementX * sens;
    playerPitch -= e.movementY * sens;
    playerPitch = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, playerPitch));
});

function triggerSonarPing() {
    playSonarPing();
    spawnSoundRipple(localPlayerMesh.position.x, localPlayerMesh.position.z, 30, 0x00e5ff);

    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            type: 'noise_event',
            x: localPlayerMesh.position.x,
            z: localPlayerMesh.position.z,
            radius: 30,
            source: 'sonar'
        }));
    }
}

// --- WebSocket Multiplayer Sync ---
let myId = null;
const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const ws = new WebSocket(`${wsProtocol}//${window.location.host}`);

ws.onopen = () => {
    console.log('[Multiplayer] Connected to Hadal server.');
};

ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);

    if (msg.type === 'init') {
        myId = msg.id;
        idElem.innerText = `DIVER ID: ${myId.toUpperCase()}`;
        roleElem.innerText = msg.role;

        msg.players.forEach((p) => {
            if (p.id !== myId) addRemotePlayer(p);
        });
        updatePartnerStatus();
    } else if (msg.type === 'player_joined') {
        addRemotePlayer(msg.player);
        updatePartnerStatus();
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
        updatePartnerStatus();
    } else if (msg.type === 'noise_event') {
        if (msg.playerId !== myId) {
            spawnSoundRipple(msg.x, msg.z, msg.radius, 0xff7700);
        }
    } else if (msg.type === 'creature_pos') {
        creatureGroup.position.x = msg.x;
        creatureGroup.position.z = msg.z;
    } else if (msg.type === 'creature_alerted') {
        alertBanner.style.display = 'block';
        alertBanner.innerText = `⚠️ ACOUSTIC CONTACT — STALKER ${msg.state.toUpperCase()}`;
        setTimeout(() => { alertBanner.style.display = 'none'; }, 4000);
    }
};

function addRemotePlayer(data) {
    if (otherPlayers.has(data.id)) return;
    const mesh = createDiverMesh(data.color || 0xffaa00);
    mesh.position.set(data.x, data.y, data.z);
    scene.add(mesh);
    otherPlayers.set(data.id, { mesh, data });
}

function updatePartnerStatus() {
    if (otherPlayers.size > 0) {
        const first = Array.from(otherPlayers.values())[0];
        partnerElem.innerText = `PARTNER: ${first.data.role} [LINKED]`;
        partnerElem.style.color = '#00ff88';
    } else {
        partnerElem.innerText = `PARTNER: AWAITING (ANCHORED TO DOCK)`;
        partnerElem.style.color = '#628ea6';
    }
}

// Network broadcast timer (20 Hz)
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

// Footstep noise emitter timer
let lastNoiseTime = 0;

// --- Main Render & Physics Game Loop ---
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const delta = Math.min(clock.getDelta(), 0.1);
    const now = performance.now();

    // 1. Locomotion Physics
    const isSprinting = keys['ShiftLeft'] || keys['ShiftRight'];
    const isCrouching = keys['ControlLeft'] || keys['ControlRight'];

    let speed = 4.0;
    if (isSprinting) speed = 7.5;
    if (isCrouching) speed = 2.0;

    const moveVector = new THREE.Vector3();
    if (keys['KeyW']) moveVector.z -= 1;
    if (keys['KeyS']) moveVector.z += 1;
    if (keys['KeyA']) moveVector.x -= 1;
    if (keys['KeyD']) moveVector.x += 1;

    if (moveVector.lengthSq() > 0) {
        moveVector.normalize();
        moveVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), playerYaw);
        localPlayerMesh.position.addScaledVector(moveVector, speed * delta);

        // Footstep noise waves
        if (now - lastNoiseTime > (isSprinting ? 280 : 600)) {
            lastNoiseTime = now;
            const noiseRad = isSprinting ? 18 : (isCrouching ? 4 : 8);
            const color = isSprinting ? 0xff4422 : 0x00d4ff;
            spawnSoundRipple(localPlayerMesh.position.x, localPlayerMesh.position.z, noiseRad, color);

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

    // Headlamp positioning
    headlamp.position.copy(localPlayerMesh.position).add(new THREE.Vector3(0, 1.6, 0));
    const targetDir = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(1, 0, 0), playerPitch).applyAxisAngle(new THREE.Vector3(0, 1, 0), playerYaw);
    headlamp.target.position.copy(headlamp.position).add(targetDir);

    // 2. Camera Placement (1st vs 3rd Person)
    if (isFirstPerson) {
        camera.position.copy(localPlayerMesh.position).add(new THREE.Vector3(0, 1.55, 0));
        camera.rotation.set(playerPitch, playerYaw, 0, 'YXZ');
    } else {
        // 3rd Person over-the-shoulder
        const offset = new THREE.Vector3(0.5, 2.0, 3.8).applyAxisAngle(new THREE.Vector3(0, 1, 0), playerYaw);
        camera.position.copy(localPlayerMesh.position).add(offset);
        camera.lookAt(localPlayerMesh.position.clone().add(new THREE.Vector3(0, 1.4, 0)));
    }

    // 3. Tether Cable Physics update
    let cableStart = localPlayerMesh.position.clone().add(new THREE.Vector3(0, 1.1, 0));
    let cableEnd = new THREE.Vector3(0, 1.2, 18); // Default: Mooring winch

    if (otherPlayers.size > 0) {
        const partner = Array.from(otherPlayers.values())[0];
        cableEnd = partner.mesh.position.clone().add(new THREE.Vector3(0, 1.1, 0));
    }

    tetherCable.update(cableStart, cableEnd, delta);

    // Update Tension UI
    tensionBar.style.width = `${tetherCable.tension}%`;
    tensionVal.innerText = `${Math.round(tetherCable.tension)}%`;
    if (tetherCable.tension > 85) {
        tensionBar.style.backgroundColor = '#ff2222';
        if (Math.random() < 0.1) playCableStrain();
    } else if (tetherCable.tension > 50) {
        tensionBar.style.backgroundColor = '#ffaa00';
    } else {
        tensionBar.style.backgroundColor = '#00ff88';
    }

    // 4. Update Sound Ripples
    for (let i = activeRipples.length - 1; i >= 0; i--) {
        const r = activeRipples[i];
        r.radius += r.speed * delta;
        r.mesh.scale.set(r.radius, r.radius, 1);
        r.opacity -= delta * 1.2;
        r.mesh.material.opacity = Math.max(0, r.opacity);

        if (r.opacity <= 0) {
            scene.remove(r.mesh);
            activeRipples.splice(i, 1);
        }
    }

    // 5. Marine Snow Drift
    const positions = marineSnow.geometry.attributes.position.array;
    for (let i = 1; i < positions.length; i += 3) {
        positions[i] -= delta * 0.4;
        if (positions[i] < -4) positions[i] = 10;
    }
    marineSnow.geometry.attributes.position.needsUpdate = true;

    // 6. Oxygen depletion
    if (isSprinting) oxygen -= delta * 0.8;
    else oxygen -= delta * 0.15;
    oxygen = Math.max(0, oxygen);
    o2Bar.style.width = `${Math.round(oxygen)}%`;
    o2Val.innerText = `${Math.round(oxygen)}%`;

    // 7. Depth Counter drift
    const simulatedDepth = 6420 + Math.round(-localPlayerMesh.position.z * 12);
    depthElem.innerText = `${simulatedDepth.toLocaleString()} M`;

    renderer.render(scene, camera);
}

// Window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
