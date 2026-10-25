// ============================================================
// CableSimulation.cs — Verlet Integration Rope Physics
// Hadal Descent — Pure math, no Unity dependency
// Can be tested standalone before Unity is installed
// ============================================================
//
// This file contains the CORE MATH for the cable system.
// When you open Unity, wrap this in a MonoBehaviour that feeds
// positions to a LineRenderer or procedural mesh.
//
// To test NOW: compile with `dotnet run` or paste into
// an online C# playground (dotnetfiddle.net)
// ============================================================

using System;
using System.Collections.Generic;

namespace HadalDescent.Cable
{
    /// <summary>
    /// A 3D vector struct for use outside Unity.
    /// Replace with UnityEngine.Vector3 when porting.
    /// </summary>
    public struct Vec3
    {
        public float X, Y, Z;

        public Vec3(float x, float y, float z) { X = x; Y = y; Z = z; }

        public static Vec3 operator +(Vec3 a, Vec3 b) => new Vec3(a.X + b.X, a.Y + b.Y, a.Z + b.Z);
        public static Vec3 operator -(Vec3 a, Vec3 b) => new Vec3(a.X - b.X, a.Y - b.Y, a.Z - b.Z);
        public static Vec3 operator *(Vec3 a, float s) => new Vec3(a.X * s, a.Y * s, a.Z * s);
        public static Vec3 operator *(float s, Vec3 a) => a * s;

        public float Magnitude => (float)Math.Sqrt(X * X + Y * Y + Z * Z);

        public Vec3 Normalized
        {
            get
            {
                float mag = Magnitude;
                if (mag < 0.0001f) return new Vec3(0, 0, 0);
                return new Vec3(X / mag, Y / mag, Z / mag);
            }
        }

        public override string ToString() => $"({X:F2}, {Y:F2}, {Z:F2})";
    }

    /// <summary>
    /// A single node in the Verlet cable simulation.
    /// </summary>
    public class CableNode
    {
        public Vec3 Position;
        public Vec3 PreviousPosition;
        public bool IsFixed; // True for endpoints (attached to players)

        public CableNode(Vec3 position, bool isFixed = false)
        {
            Position = position;
            PreviousPosition = position;
            IsFixed = isFixed;
        }
    }

    /// <summary>
    /// Core Verlet rope simulation.
    /// Pure math — no rendering, no Unity dependencies.
    /// </summary>
    public class VerletCable
    {
        // === Configuration ===
        public int NodeCount { get; }
        public float SegmentRestLength { get; }
        public float TotalRestLength => (NodeCount - 1) * SegmentRestLength;
        public int ConstraintIterations { get; set; } = 4;
        public float Damping { get; set; } = 0.98f;
        public Vec3 Gravity { get; set; } = new Vec3(0, -2.0f, 0); // Reduced for underwater
        public float MaxTension { get; } = 100f;
        public float SnapTensionThreshold { get; } = 95f;
        public float SnapTimeRequired { get; } = 3.0f; // seconds above threshold before snap

        // === State ===
        public List<CableNode> Nodes { get; }
        public float CurrentTension { get; private set; }
        public float TensionPercent => Math.Min(CurrentTension / MaxTension * 100f, 100f);
        public bool IsSnapped { get; private set; }
        public float TimeAboveSnapThreshold { get; private set; }

        /// <summary>
        /// Create a cable with the given number of nodes, stretched between two points.
        /// </summary>
        public VerletCable(Vec3 startPos, Vec3 endPos, int nodeCount = 20, float segmentLength = 1.0f)
        {
            NodeCount = nodeCount;
            SegmentRestLength = segmentLength;
            Nodes = new List<CableNode>(nodeCount);

            // Initialize nodes in a straight line between start and end
            for (int i = 0; i < nodeCount; i++)
            {
                float t = (float)i / (nodeCount - 1);
                Vec3 pos = startPos + (endPos - startPos) * t;
                bool isFixed = (i == 0 || i == nodeCount - 1);
                Nodes.Add(new CableNode(pos, isFixed));
            }
        }

        /// <summary>
        /// Update endpoint positions (called each frame with player positions).
        /// </summary>
        public void SetEndpoints(Vec3 startPos, Vec3 endPos)
        {
            if (IsSnapped) return;
            Nodes[0].Position = startPos;
            Nodes[NodeCount - 1].Position = endPos;
        }

        /// <summary>
        /// Step the simulation forward by deltaTime seconds.
        /// Call once per frame.
        /// </summary>
        public void Simulate(float deltaTime)
        {
            if (IsSnapped) return;

            // Step 1: Verlet Integration (update positions based on velocity + gravity)
            for (int i = 0; i < NodeCount; i++)
            {
                CableNode node = Nodes[i];
                if (node.IsFixed) continue;

                Vec3 velocity = node.Position - node.PreviousPosition;
                velocity = velocity * Damping; // Apply damping

                node.PreviousPosition = node.Position;
                node.Position = node.Position + velocity + Gravity * (deltaTime * deltaTime);
            }

            // Step 2: Constraint Solving (maintain segment lengths)
            for (int iter = 0; iter < ConstraintIterations; iter++)
            {
                ApplyDistanceConstraints();
            }

            // Step 3: Calculate tension
            CalculateTension();

            // Step 4: Check for snap
            CheckSnap(deltaTime);
        }

        /// <summary>
        /// Enforce distance constraints between adjacent nodes.
        /// This is the core of Verlet rope physics.
        /// </summary>
        private void ApplyDistanceConstraints()
        {
            for (int i = 0; i < NodeCount - 1; i++)
            {
                CableNode nodeA = Nodes[i];
                CableNode nodeB = Nodes[i + 1];

                Vec3 delta = nodeB.Position - nodeA.Position;
                float currentLength = delta.Magnitude;

                if (currentLength < 0.0001f) continue;

                float error = currentLength - SegmentRestLength;
                Vec3 correction = delta.Normalized * (error * 0.5f);

                if (!nodeA.IsFixed)
                    nodeA.Position = nodeA.Position + correction;
                if (!nodeB.IsFixed)
                    nodeB.Position = nodeB.Position - correction;
            }
        }

        /// <summary>
        /// Calculate tension as the ratio of actual endpoint distance to rest length.
        /// </summary>
        private void CalculateTension()
        {
            Vec3 startToEnd = Nodes[NodeCount - 1].Position - Nodes[0].Position;
            float endpointDistance = startToEnd.Magnitude;

            // Tension = how much the cable is being stretched beyond its rest length
            float stretch = Math.Max(0, endpointDistance - TotalRestLength);
            float stretchRatio = endpointDistance / TotalRestLength;

            // Map to 0-100 range. At rest length = 0 tension. At 1.5x rest = 100 tension.
            CurrentTension = Math.Min((stretchRatio - 1.0f) / 0.5f * MaxTension, MaxTension);
            CurrentTension = Math.Max(CurrentTension, 0);
        }

        /// <summary>
        /// Check if the cable should snap (tension above threshold for too long).
        /// </summary>
        private void CheckSnap(float deltaTime)
        {
            if (TensionPercent >= SnapTensionThreshold)
            {
                TimeAboveSnapThreshold += deltaTime;
                if (TimeAboveSnapThreshold >= SnapTimeRequired)
                {
                    Snap();
                }
            }
            else
            {
                // Reset timer if tension drops below threshold
                TimeAboveSnapThreshold = Math.Max(0, TimeAboveSnapThreshold - deltaTime * 2);
            }
        }

        /// <summary>
        /// Snap the cable. Endpoints become unfixed. Cable goes limp.
        /// </summary>
        public void Snap()
        {
            IsSnapped = true;
            // Unfix endpoints — cable falls
            foreach (var node in Nodes)
            {
                node.IsFixed = false;
            }
        }

        /// <summary>
        /// Get all node positions (for rendering).
        /// </summary>
        public Vec3[] GetPositions()
        {
            Vec3[] positions = new Vec3[NodeCount];
            for (int i = 0; i < NodeCount; i++)
            {
                positions[i] = Nodes[i].Position;
            }
            return positions;
        }

        /// <summary>
        /// Print cable state to console (for testing).
        /// </summary>
        public void PrintState()
        {
            Console.WriteLine($"Cable State: Tension={TensionPercent:F1}% | " +
                            $"Snapped={IsSnapped} | " +
                            $"TimeAboveThreshold={TimeAboveSnapThreshold:F1}s");
            Console.WriteLine($"  Start: {Nodes[0].Position}");
            Console.WriteLine($"  End:   {Nodes[NodeCount - 1].Position}");
            Console.WriteLine($"  Mid:   {Nodes[NodeCount / 2].Position}");
        }
    }

    /// <summary>
    /// Test harness — run this to verify cable math before Unity.
    /// </summary>
    public class CableTest
    {
        public static void Main(string[] args)
        {
            Console.WriteLine("=== HADAL DESCENT — Cable Physics Test ===\n");

            // Create a cable between two points
            Vec3 playerA = new Vec3(0, 5, 0);
            Vec3 playerB = new Vec3(10, 5, 0);
            var cable = new VerletCable(playerA, playerB, nodeCount: 20, segmentLength: 1.0f);

            Console.WriteLine($"Cable created: {cable.NodeCount} nodes, " +
                            $"rest length = {cable.TotalRestLength}m\n");

            // Simulate 60 frames (1 second at 60fps) — cable should sag under gravity
            Console.WriteLine("--- Simulating 1 second (cable sag) ---");
            float dt = 1f / 60f;
            for (int frame = 0; frame < 60; frame++)
            {
                cable.Simulate(dt);
            }
            cable.PrintState();

            // Now pull players apart (beyond rest length)
            Console.WriteLine("\n--- Pulling players apart (25m gap, rest = 19m) ---");
            playerB = new Vec3(25, 5, 0);
            cable.SetEndpoints(playerA, playerB);
            for (int frame = 0; frame < 60; frame++)
            {
                cable.Simulate(dt);
            }
            cable.PrintState();

            // Pull further — should approach snap threshold
            Console.WriteLine("\n--- Extreme pull (35m gap) ---");
            playerB = new Vec3(35, 5, 0);
            cable.SetEndpoints(playerA, playerB);
            for (int frame = 0; frame < 60; frame++)
            {
                cable.Simulate(dt);
            }
            cable.PrintState();

            // Sustain extreme tension for 3+ seconds — should snap
            Console.WriteLine("\n--- Sustaining extreme tension for 4 seconds ---");
            for (int frame = 0; frame < 240; frame++) // 4 seconds at 60fps
            {
                cable.Simulate(dt);
                if (cable.IsSnapped)
                {
                    Console.WriteLine($"  CABLE SNAPPED at frame {frame} " +
                                    $"({frame * dt:F1}s)!");
                    break;
                }
            }
            cable.PrintState();

            Console.WriteLine("\n=== Test Complete ===");
        }
    }
}
