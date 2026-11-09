import { describe, it, expect } from "vitest";
import anchorsJson from "../data/anchors.json";
import vocabJson from "../data/vocab.json";
import {
  CAMERA_MIN_POLAR_ANGLE,
  CAMERA_MAX_POLAR_ANGLE,
  CAMERA_MIN_DISTANCE,
  CAMERA_MAX_DISTANCE,
  MODEL_TARGET_HEIGHT,
  MIN_SEPARATION,
} from "../src/config";

describe("Phase 3: 3D Scene and Anchors Verification", () => {
  const anchors = anchorsJson.anchors;
  const words = vocabJson.words;

  it("contains exactly 14 anchors with valid positions and radii", () => {
    const keys = Object.keys(anchors);
    expect(keys).toHaveLength(14);

    for (const [key, a] of Object.entries(anchors)) {
      expect(a.position).toHaveLength(3);
      expect(typeof a.position[0]).toBe("number");
      expect(typeof a.position[1]).toBe("number");
      expect(typeof a.position[2]).toBe("number");
      expect(Number.isFinite(a.position[0])).toBe(true);
      expect(Number.isFinite(a.position[1])).toBe(true);
      expect(Number.isFinite(a.position[2])).toBe(true);
      expect(a.radius).toBeGreaterThan(0);
    }
  });

  it("places all 14 anchors within normalized character space bounds", () => {
    for (const [key, a] of Object.entries(anchors)) {
      const [x, y, z] = a.position;
      // x within half arm span [-0.6, 0.6]
      expect(x).toBeGreaterThanOrEqual(-0.6);
      expect(x).toBeLessThanOrEqual(0.6);

      // y within feet on floor (0) to top of head (1.75)
      expect(y).toBeGreaterThanOrEqual(0.0);
      expect(y).toBeLessThanOrEqual(MODEL_TARGET_HEIGHT + 0.05);

      // z within body thickness [-0.25, 0.25]
      expect(z).toBeGreaterThanOrEqual(-0.25);
      expect(z).toBeLessThanOrEqual(0.25);
    }
  });

  it("places anatomical regions in consistent vertical height ordering", () => {
    // Top of head (rikma) should be highest point
    expect(anchors.rikma.position[1]).toBeGreaterThan(anchors.mustaka.position[1]);
    expect(anchors.mustaka.position[1]).toBeGreaterThan(anchors.soca.position[1]);
    expect(anchors.soca.position[1]).toBeGreaterThan(anchors.grana.position[1]);
    expect(anchors.grana.position[1]).toBeGreaterThan(anchors.lathi.position[1]);
    expect(anchors.lathi.position[1]).toBeGreaterThan(anchors.jangga.position[1]);

    // Torso points
    expect(anchors.jangga.position[1]).toBeGreaterThan(anchors.jaja.position[1]);
    expect(anchors.jaja.position[1]).toBeGreaterThan(anchors.padharan.position[1]);

    // Legs and feet
    expect(anchors.padharan.position[1]).toBeGreaterThan(anchors.jengku.position[1]);
    expect(anchors.jengku.position[1]).toBeGreaterThan(anchors.racikan.position[1]);
    expect(anchors.racikan.position[1]).toBeGreaterThan(anchors.ampeyan.position[1]);

    // Sole/foot (ampeyan) should be near the floor
    expect(anchors.ampeyan.position[1]).toBeLessThan(0.05);
  });

  it("verifies camera polar angle allows looking 25 degrees below the floor (K-12)", () => {
    // 90 deg = Math.PI / 2 ≈ 1.5708 rad (horizontal floor level)
    // 25 deg below floor = 90 + 25 = 115 deg ≈ 2.007 rad
    const floorAngleRad = Math.PI / 2;
    expect(CAMERA_MAX_POLAR_ANGLE).toBeGreaterThan(floorAngleRad);

    const degreesBelowFloor = ((CAMERA_MAX_POLAR_ANGLE - floorAngleRad) * 180) / Math.PI;
    expect(degreesBelowFloor).toBeGreaterThanOrEqual(24.5); // ~25 degrees below floor line
  });

  it("verifies camera distance constraints prevent clipping or losing the character", () => {
    expect(CAMERA_MIN_DISTANCE).toBeGreaterThanOrEqual(1.0);
    expect(CAMERA_MAX_DISTANCE).toBeLessThanOrEqual(10.0);
    expect(CAMERA_MIN_DISTANCE).toBeLessThan(CAMERA_MAX_DISTANCE);
  });

  it("verifies palm (asta) is located on the right hand with positive lateral offset", () => {
    // Character right hand (from facing forward +Z) has x > 0.4
    expect(anchors.asta.position[0]).toBeGreaterThan(0.4);
    // Palms face forward (+Z) per MODEL_REPORT.md
    expect(anchors.asta.position[2]).toBeGreaterThan(0.05);
  });
});

