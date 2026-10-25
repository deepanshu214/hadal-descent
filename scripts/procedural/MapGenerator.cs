// ============================================================
// MapGenerator.cs — Seed-Based Procedural Level Generation
// Hadal Descent — Pure algorithm, no Unity dependency
// ============================================================

using System;
using System.Collections.Generic;
using System.Linq;

namespace HadalDescent.Procedural
{
    public enum Direction { North, South, East, West, Up, Down }

    /// <summary>
    /// Defines a room type with its available connection points.
    /// In Unity, this becomes a ScriptableObject with a prefab reference.
    /// </summary>
    public class RoomTemplate
    {
        public string Id;
        public string Name;
        public HashSet<Direction> Connections;
        public int MinTier; // Minimum depth tier required
        public int MaxTier; // Maximum depth tier
        public bool IsSpecial; // Start, Extraction, Boss — placed manually
        public float CreatureSpawnChance; // 0.0 to 1.0
        public float SalvageSpawnChance;
        public float StoryLogSpawnChance;

        public RoomTemplate(string id, string name, Direction[] connections,
            int minTier = 1, int maxTier = 4, bool isSpecial = false,
            float creatureChance = 0f, float salvageChance = 0f, float storyChance = 0f)
        {
            Id = id;
            Name = name;
            Connections = new HashSet<Direction>(connections);
            MinTier = minTier;
            MaxTier = maxTier;
            IsSpecial = isSpecial;
            CreatureSpawnChance = creatureChance;
            SalvageSpawnChance = salvageChance;
            StoryLogSpawnChance = storyChance;
        }

        public bool HasConnection(Direction dir) => Connections.Contains(dir);
    }

    /// <summary>
    /// A placed room instance in the generated map.
    /// </summary>
    public class PlacedRoom
    {
        public RoomTemplate Template;
        public int GridX, GridY, GridZ;
        public bool HasCreature;
        public bool HasSalvage;
        public bool HasStoryLog;
        public int DistanceFromStart; // Graph distance

        public string GridKey => $"{GridX},{GridY},{GridZ}";

        public override string ToString() =>
            $"[{GridKey}] {Template.Name}" +
            (HasCreature ? " 👾" : "") +
            (HasSalvage ? " 💰" : "") +
            (HasStoryLog ? " 📜" : "");
    }

    /// <summary>
    /// Configuration for a depth tier's generation parameters.
    /// </summary>
    public class TierConfig
    {
        public int Tier;
        public int MinRooms;
        public int MaxRooms;
        public int CreatureSpawns;
        public int MinSalvageNodes;
        public int MaxSalvageNodes;
        public int StoryLogs; // Guaranteed story log placements
        public float HazardRoomChance;

        public static TierConfig Tier1 => new TierConfig
        {
            Tier = 1, MinRooms = 8, MaxRooms = 12,
            CreatureSpawns = 2, MinSalvageNodes = 3, MaxSalvageNodes = 5,
            StoryLogs = 2, HazardRoomChance = 0.0f
        };

        public static TierConfig Tier2 => new TierConfig
        {
            Tier = 2, MinRooms = 12, MaxRooms = 18,
            CreatureSpawns = 4, MinSalvageNodes = 4, MaxSalvageNodes = 7,
            StoryLogs = 2, HazardRoomChance = 0.15f
        };

        public static TierConfig Tier3 => new TierConfig
        {
            Tier = 3, MinRooms = 18, MaxRooms = 25,
            CreatureSpawns = 7, MinSalvageNodes = 5, MaxSalvageNodes = 9,
            StoryLogs = 3, HazardRoomChance = 0.25f
        };

        public static TierConfig Tier4 => new TierConfig
        {
            Tier = 4, MinRooms = 25, MaxRooms = 35,
            CreatureSpawns = 10, MinSalvageNodes = 6, MaxSalvageNodes = 12,
            StoryLogs = 3, HazardRoomChance = 0.35f
        };
    }

    /// <summary>
    /// The room database. In Unity, this is a ScriptableObject.
    /// </summary>
    public static class RoomDatabase
    {
        public static List<RoomTemplate> AllRooms = new()
        {
            // Corridors
            new RoomTemplate("C01", "Straight Corridor", new[] { Direction.West, Direction.East },
                salvageChance: 0.1f),
            new RoomTemplate("C02", "L-Bend", new[] { Direction.West, Direction.South },
                salvageChance: 0.1f),
            new RoomTemplate("C03", "T-Junction", new[] { Direction.West, Direction.East, Direction.South },
                salvageChance: 0.15f),
            new RoomTemplate("C04", "Cross Junction", new[] { Direction.North, Direction.South, Direction.East, Direction.West },
                salvageChance: 0.2f, creatureChance: 0.2f),
            new RoomTemplate("C05", "Ramp", new[] { Direction.West, Direction.East },
                salvageChance: 0.05f),

            // Small rooms
            new RoomTemplate("S01", "Storage Room", new[] { Direction.West },
                salvageChance: 0.7f, storyChance: 0.1f),
            new RoomTemplate("S02", "Crew Quarters", new[] { Direction.West },
                salvageChance: 0.3f, storyChance: 0.5f),
            new RoomTemplate("S03", "Maintenance Closet", new[] { Direction.West },
                salvageChance: 0.4f),

            // Medium rooms
            new RoomTemplate("M01", "Research Lab", new[] { Direction.North, Direction.West, Direction.East },
                salvageChance: 0.6f, storyChance: 0.6f, creatureChance: 0.15f),
            new RoomTemplate("M02", "Control Room", new[] { Direction.North, Direction.West, Direction.East },
                salvageChance: 0.4f, storyChance: 0.4f),
            new RoomTemplate("M03", "Sample Vault", new[] { Direction.West },
                minTier: 2, salvageChance: 0.9f, creatureChance: 0.3f),

            // Large rooms
            new RoomTemplate("L01", "Reactor Hall", new[] { Direction.North, Direction.South, Direction.East, Direction.West },
                minTier: 2, salvageChance: 0.5f, creatureChance: 0.4f, storyChance: 0.3f),
            new RoomTemplate("L02", "Open Cavern", new[] { Direction.North, Direction.South, Direction.East, Direction.West },
                minTier: 2, creatureChance: 0.6f, salvageChance: 0.3f),

            // Vertical
            new RoomTemplate("V01", "Ladder Shaft", new[] { Direction.West, Direction.Up, Direction.Down },
                creatureChance: 0.2f),
            new RoomTemplate("V02", "Flooded Elevator", new[] { Direction.West, Direction.Up, Direction.Down },
                minTier: 2, creatureChance: 0.25f),

            // Hazard
            new RoomTemplate("H01", "Electrified Corridor", new[] { Direction.West, Direction.East },
                minTier: 2),
            new RoomTemplate("H02", "Pressure Crush Zone", new[] { Direction.West, Direction.East },
                minTier: 3),
        };

        /// <summary>
        /// Get rooms valid for a given tier (excluding special rooms).
        /// </summary>
        public static List<RoomTemplate> GetRoomsForTier(int tier)
        {
            return AllRooms.Where(r => !r.IsSpecial && r.MinTier <= tier && r.MaxTier >= tier).ToList();
        }
    }

    /// <summary>
    /// Generates a complete map layout from a seed and tier config.
    /// Deterministic: same seed + tier = identical map on all clients.
    /// </summary>
    public class MapGenerator
    {
        private Random _rng;
        private TierConfig _config;
        private Dictionary<string, PlacedRoom> _grid;
        private List<PlacedRoom> _placedRooms;

        public List<PlacedRoom> Generate(int seed, TierConfig config)
        {
            _rng = new Random(seed);
            _config = config;
            _grid = new Dictionary<string, PlacedRoom>();
            _placedRooms = new List<PlacedRoom>();

            int targetRoomCount = _rng.Next(config.MinRooms, config.MaxRooms + 1);
            var availableRooms = RoomDatabase.GetRoomsForTier(config.Tier);

            // Step 1: Place START room at origin
            PlaceRoom(availableRooms[0], 0, 0, 0, distanceFromStart: 0);

            // Step 2: Grow the map via constrained random walk
            int attempts = 0;
            int maxAttempts = targetRoomCount * 10;

            while (_placedRooms.Count < targetRoomCount && attempts < maxAttempts)
            {
                attempts++;

                // Pick a random existing room with unused connections
                var candidates = _placedRooms.Where(r => HasUnusedConnection(r)).ToList();
                if (candidates.Count == 0) break;

                var sourceRoom = candidates[_rng.Next(candidates.Count)];
                var unusedDirs = GetUnusedConnections(sourceRoom);
                var dir = unusedDirs[_rng.Next(unusedDirs.Count)];

                // Calculate target grid position
                GetAdjacentPosition(sourceRoom.GridX, sourceRoom.GridY, sourceRoom.GridZ, dir,
                    out int nx, out int ny, out int nz);

                string key = $"{nx},{ny},{nz}";
                if (_grid.ContainsKey(key)) continue; // Already occupied

                // Pick a compatible room template
                var opposite = GetOpposite(dir);
                var compatible = availableRooms
                    .Where(r => r.HasConnection(opposite))
                    .ToList();

                if (compatible.Count == 0) continue;

                var template = compatible[_rng.Next(compatible.Count)];
                PlaceRoom(template, nx, ny, nz, sourceRoom.DistanceFromStart + 1);
            }

            // Step 3: Place content (creatures, salvage, story logs)
            PlaceContent();

            return _placedRooms;
        }

        private void PlaceRoom(RoomTemplate template, int x, int y, int z, int distanceFromStart)
        {
            var room = new PlacedRoom
            {
                Template = template,
                GridX = x, GridY = y, GridZ = z,
                DistanceFromStart = distanceFromStart
            };
            _grid[room.GridKey] = room;
            _placedRooms.Add(room);
        }

        private void PlaceContent()
        {
            // Sort rooms by distance from start (deepest rooms get priority for creatures/loot)
            var sortedByDistance = _placedRooms.OrderByDescending(r => r.DistanceFromStart).ToList();

            // Place creatures (in deepest rooms, min distance 3 from start)
            int creaturesPlaced = 0;
            foreach (var room in sortedByDistance)
            {
                if (creaturesPlaced >= _config.CreatureSpawns) break;
                if (room.DistanceFromStart < 3) continue;
                if (_rng.NextDouble() < room.Template.CreatureSpawnChance + 0.3)
                {
                    room.HasCreature = true;
                    creaturesPlaced++;
                }
            }

            // Place salvage
            int salvagePlaced = 0;
            int targetSalvage = _rng.Next(_config.MinSalvageNodes, _config.MaxSalvageNodes + 1);
            foreach (var room in _placedRooms.OrderBy(_ => _rng.Next()))
            {
                if (salvagePlaced >= targetSalvage) break;
                if (_rng.NextDouble() < room.Template.SalvageSpawnChance)
                {
                    room.HasSalvage = true;
                    salvagePlaced++;
                }
            }

            // Place story logs (guaranteed count)
            int logsPlaced = 0;
            var logCandidates = _placedRooms
                .Where(r => r.Template.StoryLogSpawnChance > 0)
                .OrderBy(_ => _rng.Next())
                .ToList();
            foreach (var room in logCandidates)
            {
                if (logsPlaced >= _config.StoryLogs) break;
                room.HasStoryLog = true;
                logsPlaced++;
            }
        }

        private bool HasUnusedConnection(PlacedRoom room)
        {
            return GetUnusedConnections(room).Count > 0;
        }

        private List<Direction> GetUnusedConnections(PlacedRoom room)
        {
            var unused = new List<Direction>();
            foreach (var dir in room.Template.Connections)
            {
                GetAdjacentPosition(room.GridX, room.GridY, room.GridZ, dir,
                    out int nx, out int ny, out int nz);
                if (!_grid.ContainsKey($"{nx},{ny},{nz}"))
                    unused.Add(dir);
            }
            return unused;
        }

        private void GetAdjacentPosition(int x, int y, int z, Direction dir,
            out int nx, out int ny, out int nz)
        {
            nx = x; ny = y; nz = z;
            switch (dir)
            {
                case Direction.North: nz += 1; break;
                case Direction.South: nz -= 1; break;
                case Direction.East: nx += 1; break;
                case Direction.West: nx -= 1; break;
                case Direction.Up: ny += 1; break;
                case Direction.Down: ny -= 1; break;
            }
        }

        private Direction GetOpposite(Direction dir) => dir switch
        {
            Direction.North => Direction.South,
            Direction.South => Direction.North,
            Direction.East => Direction.West,
            Direction.West => Direction.East,
            Direction.Up => Direction.Down,
            Direction.Down => Direction.Up,
            _ => throw new ArgumentException()
        };
    }

    /// <summary>
    /// Test harness — visualize generated maps in the terminal.
    /// </summary>
    public class MapGeneratorTest
    {
        public static void Main(string[] args)
        {
            Console.WriteLine("=== HADAL DESCENT — Procedural Map Generator Test ===\n");

            var generator = new MapGenerator();

            // Generate 3 maps with different seeds to show variety
            for (int seed = 42; seed <= 44; seed++)
            {
                Console.WriteLine($"--- Seed: {seed} | Tier 2 ---");
                var rooms = generator.Generate(seed, TierConfig.Tier2);

                Console.WriteLine($"Rooms generated: {rooms.Count}");
                Console.WriteLine($"Creatures: {rooms.Count(r => r.HasCreature)}");
                Console.WriteLine($"Salvage nodes: {rooms.Count(r => r.HasSalvage)}");
                Console.WriteLine($"Story logs: {rooms.Count(r => r.HasStoryLog)}");
                Console.WriteLine();

                // Print room list
                foreach (var room in rooms)
                {
                    string indent = new string(' ', room.DistanceFromStart * 2);
                    Console.WriteLine($"  {indent}{room}");
                }
                Console.WriteLine();
            }

            // Show Tier scaling
            Console.WriteLine("--- Tier Scaling Comparison (Seed: 100) ---");
            var configs = new[] { TierConfig.Tier1, TierConfig.Tier2, TierConfig.Tier3, TierConfig.Tier4 };
            foreach (var config in configs)
            {
                var rooms = generator.Generate(100, config);
                Console.WriteLine($"  Tier {config.Tier}: {rooms.Count} rooms, " +
                                $"{rooms.Count(r => r.HasCreature)} creatures, " +
                                $"{rooms.Count(r => r.HasSalvage)} salvage, " +
                                $"{rooms.Count(r => r.HasStoryLog)} logs");
            }

            Console.WriteLine("\n=== Test Complete ===");
        }
    }
}
