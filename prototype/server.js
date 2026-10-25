const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer } = require('ws');

const PORT = process.env.PORT || 4000;

// Minimal static file server
const server = http.createServer((req, res) => {
    let filePath = path.join(__dirname, 'public', req.url === '/' ? 'index.html' : req.url);
    const ext = path.extname(filePath).toLowerCase();

    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.wav': 'audio/wav',
        '.mp3': 'audio/mpeg'
    };

    const contentType = mimeTypes[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('404 Not Found');
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${err.code}`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

// WebSocket Multiplayer Hub
const wss = new WebSocketServer({ server });

const ROLES = ['BOULDER (Anchor)', 'ECHO (Analyst)', 'VOLT (Engineer)', 'HAUL (Trawler)', 'GHOST (Diver)'];
const players = new Map();
let nextPlayerIndex = 0;

// Host-authoritative blind creature
const creature = {
    x: 0,
    z: -35,
    state: 'patrol', // patrol, investigate, hunt
    targetX: 0,
    targetZ: -35,
    speed: 3.5,
    hearingRange: 35
};

wss.on('connection', (ws) => {
    const id = 'diver_' + Math.random().toString(36).substring(2, 7);
    const roleIndex = nextPlayerIndex % ROLES.length;
    nextPlayerIndex++;

    const role = ROLES[roleIndex];
    // Spawn points spaced along start dock
    const spawnX = (roleIndex - 1) * 3;
    const spawnZ = 12;

    const playerData = {
        id,
        role,
        roleIndex,
        x: spawnX,
        y: 1.0,
        z: spawnZ,
        yaw: 0,
        pitch: 0,
        isSprinting: false,
        isCrouching: false,
        oxygen: 100,
        color: roleIndex === 0 ? 0xff4444 : (roleIndex === 1 ? 0x00d4ff : 0xffaa00)
    };

    players.set(id, { ws, data: playerData });

    // Send init packet to newcomer
    ws.send(JSON.stringify({
        type: 'init',
        id,
        role,
        players: Array.from(players.values()).map(p => p.data),
        creature
    }));

    // Broadcast new player to all others
    broadcast({
        type: 'player_joined',
        player: playerData
    }, id);

    console.log(`[Hadal Server] Player joined: ${id} as ${role} (Total: ${players.size})`);

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);

            if (data.type === 'update_movement') {
                const p = players.get(id);
                if (p) {
                    Object.assign(p.data, {
                        x: data.x,
                        y: data.y,
                        z: data.z,
                        yaw: data.yaw,
                        pitch: data.pitch,
                        isSprinting: data.isSprinting,
                        isCrouching: data.isCrouching,
                        oxygen: data.oxygen
                    });

                    // Broadcast movement
                    broadcast({
                        type: 'player_moved',
                        id,
                        x: data.x,
                        y: data.y,
                        z: data.z,
                        yaw: data.yaw,
                        pitch: data.pitch,
                        isSprinting: data.isSprinting,
                        isCrouching: data.isCrouching
                    }, id);
                }
            } else if (data.type === 'noise_event') {
                // Broadcast sound ripple to all players
                broadcast({
                    type: 'noise_event',
                    x: data.x,
                    z: data.z,
                    radius: data.radius,
                    source: data.source,
                    playerId: id
                });

                // Check creature acoustic detection
                const distToCreature = Math.hypot(creature.x - data.x, creature.z - data.z);
                if (distToCreature <= data.radius && distToCreature <= creature.hearingRange) {
                    creature.state = data.radius > 20 ? 'hunt' : 'investigate';
                    creature.targetX = data.x;
                    creature.targetZ = data.z;
                    creature.speed = creature.state === 'hunt' ? 6.5 : 4.0;
                    broadcast({
                        type: 'creature_alerted',
                        state: creature.state,
                        targetX: creature.targetX,
                        targetZ: creature.targetZ
                    });
                }
            } else if (data.type === 'chat_log') {
                broadcast({
                    type: 'chat_log',
                    sender: role,
                    text: data.text
                });
            }
        } catch (e) {
            console.error('Error parsing WS message:', e);
        }
    });

    ws.on('close', () => {
        players.delete(id);
        broadcast({
            type: 'player_left',
            id
        });
        console.log(`[Hadal Server] Player left: ${id} (Remaining: ${players.size})`);
    });
});

function broadcast(msg, excludeId = null) {
    const json = JSON.stringify(msg);
    for (const [pid, player] of players) {
        if (pid !== excludeId && player.ws.readyState === 1) {
            player.ws.send(json);
        }
    }
}

// Creature AI tick loop (10 Hz)
setInterval(() => {
    if (players.size === 0) return;

    if (creature.state === 'patrol') {
        // Patrol back and forth in deep trench
        if (Math.abs(creature.x - creature.targetX) < 1 && Math.abs(creature.z - creature.targetZ) < 1) {
            creature.targetX = (Math.random() - 0.5) * 30;
            creature.targetZ = -25 - Math.random() * 30;
        }
    }

    // Move creature toward target
    const dx = creature.targetX - creature.x;
    const dz = creature.targetZ - creature.z;
    const dist = Math.hypot(dx, dz);

    if (dist > 0.5) {
        creature.x += (dx / dist) * creature.speed * 0.1;
        creature.z += (dz / dist) * creature.speed * 0.1;
    } else if (creature.state !== 'patrol') {
        // Reached sound source, look around then resume patrol
        creature.state = 'patrol';
        creature.speed = 3.0;
    }

    broadcast({
        type: 'creature_pos',
        x: creature.x,
        z: creature.z,
        state: creature.state
    });
}, 100);

server.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║                   HADAL DESCENT 3D PROTOTYPE                   ║
║   Status: Running on http://localhost:${PORT}                   ║
║   Players: 2 to 5 Co-op (WebSocket Sync)                       ║
║   Features: 3D Verlet Cable, Acoustic Sonar, Creature AI,      ║
║             1st/3rd Person Cameras, Volumetric Deep Fog        ║
╚════════════════════════════════════════════════════════════════╝
    `);
});
