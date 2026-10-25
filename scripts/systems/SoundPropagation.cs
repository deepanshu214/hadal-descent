// ============================================================
// SoundPropagation.cs — Acoustic Noise Event System
// Hadal Descent — Pure logic, no Unity dependency
// ============================================================

using System;
using System.Collections.Generic;

namespace HadalDescent.Systems
{
    /// <summary>
    /// A noise event emitted by a player action.
    /// Creatures query these to detect players.
    /// </summary>
    public struct NoiseEvent
    {
        public Vec3 Position;
        public float Radius;       // Detection radius in meters
        public float Intensity;    // 0.0 (whisper) to 1.0 (explosion)
        public string SourceType;  // "footstep", "sprint", "piton", "sonar", etc.
        public float TimeEmitted;  // Game time when emitted
        public int SourcePlayerId; // Which player caused this

        /// <summary>Pre-defined noise profiles for common actions.</summary>
        public static class Profiles
        {
            public static NoiseEvent CrouchWalk(Vec3 pos, float time, int playerId) =>
                new NoiseEvent { Position = pos, Radius = 3f, Intensity = 0.1f, SourceType = "crouch_walk", TimeEmitted = time, SourcePlayerId = playerId };

            public static NoiseEvent Walk(Vec3 pos, float time, int playerId) =>
                new NoiseEvent { Position = pos, Radius = 8f, Intensity = 0.3f, SourceType = "walk", TimeEmitted = time, SourcePlayerId = playerId };

            public static NoiseEvent Sprint(Vec3 pos, float time, int playerId) =>
                new NoiseEvent { Position = pos, Radius = 18f, Intensity = 0.6f, SourceType = "sprint", TimeEmitted = time, SourcePlayerId = playerId };

            public static NoiseEvent PitonFire(Vec3 pos, float time, int playerId) =>
                new NoiseEvent { Position = pos, Radius = 30f, Intensity = 0.8f, SourceType = "piton", TimeEmitted = time, SourcePlayerId = playerId };

            public static NoiseEvent SonarPing(Vec3 pos, float time, int playerId) =>
                new NoiseEvent { Position = pos, Radius = 50f, Intensity = 0.9f, SourceType = "sonar", TimeEmitted = time, SourcePlayerId = playerId };

            public static NoiseEvent CableSnap(Vec3 pos, float time, int playerId) =>
                new NoiseEvent { Position = pos, Radius = 40f, Intensity = 0.85f, SourceType = "cable_snap", TimeEmitted = time, SourcePlayerId = playerId };

            public static NoiseEvent AcousticFlare(Vec3 pos, float time, int playerId) =>
                new NoiseEvent { Position = pos, Radius = 60f, Intensity = 1.0f, SourceType = "acoustic_flare", TimeEmitted = time, SourcePlayerId = playerId };

            public static NoiseEvent ToolUse(Vec3 pos, float time, int playerId) =>
                new NoiseEvent { Position = pos, Radius = 15f, Intensity = 0.5f, SourceType = "tool", TimeEmitted = time, SourcePlayerId = playerId };

            public static NoiseEvent SalvageDrop(Vec3 pos, float time, int playerId) =>
                new NoiseEvent { Position = pos, Radius = 12f, Intensity = 0.4f, SourceType = "salvage_drop", TimeEmitted = time, SourcePlayerId = playerId };
        }
    }

    /// <summary>
    /// Reuse Vec3 from CableSimulation (or replace with UnityEngine.Vector3)
    /// </summary>
    public struct Vec3
    {
        public float X, Y, Z;
        public Vec3(float x, float y, float z) { X = x; Y = y; Z = z; }
        public static Vec3 operator -(Vec3 a, Vec3 b) => new Vec3(a.X - b.X, a.Y - b.Y, a.Z - b.Z);
        public float Magnitude => (float)Math.Sqrt(X * X + Y * Y + Z * Z);
        public override string ToString() => $"({X:F1}, {Y:F1}, {Z:F1})";
    }

    /// <summary>
    /// Central noise event bus. Singleton pattern.
    /// Players emit noise → creatures query for nearby events.
    /// </summary>
    public class SoundPropagationSystem
    {
        private readonly List<NoiseEvent> _activeEvents = new();
        private readonly float _eventLifetime; // How long events persist (seconds)

        public SoundPropagationSystem(float eventLifetime = 2.0f)
        {
            _eventLifetime = eventLifetime;
        }

        /// <summary>
        /// Emit a noise event into the system.
        /// </summary>
        public void EmitNoise(NoiseEvent noiseEvent)
        {
            _activeEvents.Add(noiseEvent);
        }

        /// <summary>
        /// Query: get all noise events within hearing range of a position.
        /// Used by creature AI each tick.
        /// </summary>
        public List<NoiseEvent> GetEventsInRange(Vec3 listenerPosition, float hearingRadius, float currentTime)
        {
            var results = new List<NoiseEvent>();
            foreach (var evt in _activeEvents)
            {
                // Skip expired events
                if (currentTime - evt.TimeEmitted > _eventLifetime) continue;

                float distance = (evt.Position - listenerPosition).Magnitude;

                // Event must be within BOTH the event's emission radius AND the listener's hearing radius
                if (distance <= evt.Radius && distance <= hearingRadius)
                {
                    results.Add(evt);
                }
            }
            return results;
        }

        /// <summary>
        /// Get the loudest (highest intensity) event in range. 
        /// Creatures prioritize the loudest sound.
        /// </summary>
        public NoiseEvent? GetLoudestInRange(Vec3 listenerPosition, float hearingRadius, float currentTime)
        {
            NoiseEvent? loudest = null;
            float maxIntensity = 0;

            foreach (var evt in GetEventsInRange(listenerPosition, hearingRadius, currentTime))
            {
                float distance = (evt.Position - listenerPosition).Magnitude;
                // Intensity falls off with distance
                float effectiveIntensity = evt.Intensity * (1f - distance / Math.Max(evt.Radius, 0.01f));

                if (effectiveIntensity > maxIntensity)
                {
                    maxIntensity = effectiveIntensity;
                    loudest = evt;
                }
            }
            return loudest;
        }

        /// <summary>
        /// Clean up expired events. Call once per frame.
        /// </summary>
        public void Cleanup(float currentTime)
        {
            _activeEvents.RemoveAll(e => currentTime - e.TimeEmitted > _eventLifetime);
        }

        /// <summary>
        /// Current active event count (for debugging).
        /// </summary>
        public int ActiveEventCount => _activeEvents.Count;
    }

    /// <summary>
    /// Test harness for sound propagation.
    /// </summary>
    public class SoundPropagationTest
    {
        public static void Main(string[] args)
        {
            Console.WriteLine("=== HADAL DESCENT — Sound Propagation Test ===\n");

            var system = new SoundPropagationSystem(eventLifetime: 2.0f);

            // Player walks at position (10, 0, 5)
            Vec3 playerPos = new Vec3(10, 0, 5);
            system.EmitNoise(NoiseEvent.Profiles.Walk(playerPos, time: 0f, playerId: 1));
            Console.WriteLine($"Player walks at {playerPos} — noise radius: 8m");

            // Creature A is 6m away (within range)
            Vec3 creatureA = new Vec3(16, 0, 5);
            var eventsA = system.GetEventsInRange(creatureA, hearingRadius: 25f, currentTime: 0.5f);
            Console.WriteLine($"Creature A at {creatureA} (6m away): hears {eventsA.Count} event(s) ✓");

            // Creature B is 15m away (outside walk radius of 8m)
            Vec3 creatureB = new Vec3(25, 0, 5);
            var eventsB = system.GetEventsInRange(creatureB, hearingRadius: 25f, currentTime: 0.5f);
            Console.WriteLine($"Creature B at {creatureB} (15m away): hears {eventsB.Count} event(s) ✗");

            // Player fires sonar ping (50m radius!)
            system.EmitNoise(NoiseEvent.Profiles.SonarPing(playerPos, time: 1.0f, playerId: 1));
            Console.WriteLine($"\nPlayer fires SONAR PING — noise radius: 50m");

            eventsB = system.GetEventsInRange(creatureB, hearingRadius: 25f, currentTime: 1.5f);
            Console.WriteLine($"Creature B at {creatureB} (15m away): now hears {eventsB.Count} event(s) ✓");

            // Test loudest event
            var loudest = system.GetLoudestInRange(creatureA, hearingRadius: 25f, currentTime: 1.5f);
            Console.WriteLine($"\nLoudest event near Creature A: '{loudest?.SourceType}' " +
                            $"(intensity: {loudest?.Intensity:F1})");

            // Test cleanup
            system.Cleanup(currentTime: 5.0f);
            Console.WriteLine($"\nAfter cleanup (t=5s): {system.ActiveEventCount} active events");

            Console.WriteLine("\n=== Test Complete ===");
        }
    }
}
