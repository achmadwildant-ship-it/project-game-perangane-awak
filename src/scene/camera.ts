import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import {
  CAMERA_MIN_DISTANCE,
  CAMERA_MAX_DISTANCE,
  CAMERA_MIN_POLAR_ANGLE,
  CAMERA_MAX_POLAR_ANGLE,
  CAMERA_INITIAL_DISTANCE,
  CAMERA_INITIAL_POLAR,
  CAMERA_INITIAL_AZIMUTH,
} from "../config";

export interface CameraManager {
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  update: (delta?: number) => void;
  resetView: (durationMs?: number) => Promise<void>;
  focusOnPoint: (targetPoint: THREE.Vector3, durationMs?: number) => Promise<void>;
  isAnimating: () => boolean;
  dispose: () => void;
}

export function createCameraManager(
  domElement: HTMLElement,
  aspectRatio: number,
): CameraManager {
  const camera = new THREE.PerspectiveCamera(45, aspectRatio, 0.1, 50);

  // Target mid-body of normalized 1.75m character
  const defaultTarget = new THREE.Vector3(0, 0.9, 0);

  // Calculate default position from spherical coordinates
  const defaultPosition = new THREE.Vector3();
  const spherical = new THREE.Spherical(
    CAMERA_INITIAL_DISTANCE,
    CAMERA_INITIAL_POLAR,
    CAMERA_INITIAL_AZIMUTH,
  );
  defaultPosition.setFromSpherical(spherical).add(defaultTarget);

  camera.position.copy(defaultPosition);
  camera.lookAt(defaultTarget);

  const controls = new OrbitControls(camera, domElement);
  controls.target.copy(defaultTarget);

  // Constrain controls per spec
  controls.minDistance = CAMERA_MIN_DISTANCE;
  controls.maxDistance = CAMERA_MAX_DISTANCE;
  controls.minPolarAngle = CAMERA_MIN_POLAR_ANGLE;
  controls.maxPolarAngle = CAMERA_MAX_POLAR_ANGLE;
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  let animating = false;
  let animationCancel: (() => void) | null = null;

  function update() {
    controls.update();
  }

  function smoothAnimate(
    fromPos: THREE.Vector3,
    toPos: THREE.Vector3,
    fromTarget: THREE.Vector3,
    toTarget: THREE.Vector3,
    durationMs: number = 600,
  ): Promise<void> {
    if (animationCancel) {
      animationCancel();
    }

    return new Promise((resolve) => {
      animating = true;
      const startTime = performance.now();
      let cancelled = false;

      animationCancel = () => {
        cancelled = true;
        animating = false;
        resolve();
      };

      function easeInOutCubic(t: number): number {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      }

      function step() {
        if (cancelled) return;

        const now = performance.now();
        const elapsed = now - startTime;
        const rawProgress = Math.min(1, elapsed / durationMs);
        const progress = easeInOutCubic(rawProgress);

        camera.position.lerpVectors(fromPos, toPos, progress);
        controls.target.lerpVectors(fromTarget, toTarget, progress);
        controls.update();

        if (rawProgress < 1) {
          requestAnimationFrame(step);
        } else {
          animating = false;
          animationCancel = null;
          resolve();
        }
      }

      requestAnimationFrame(step);
    });
  }

  async function resetView(durationMs: number = 600): Promise<void> {
    const fromPos = camera.position.clone();
    const toPos = defaultPosition.clone();
    const fromTarget = controls.target.clone();
    const toTarget = defaultTarget.clone();

    await smoothAnimate(fromPos, toPos, fromTarget, toTarget, durationMs);
  }

  async function focusOnPoint(
    targetPoint: THREE.Vector3,
    durationMs: number = 800,
  ): Promise<void> {
    const fromPos = camera.position.clone();
    const fromTarget = controls.target.clone();

    // Set target to the answered point (y clamped nicely)
    const toTarget = new THREE.Vector3(0, targetPoint.y, 0);

    // Compute closer position along the current viewing direction
    const dir = new THREE.Vector3().subVectors(fromPos, fromTarget).normalize();
    const focusDistance = Math.max(CAMERA_MIN_DISTANCE + 0.3, 1.8);
    const toPos = toTarget.clone().addScaledVector(dir, focusDistance);

    await smoothAnimate(fromPos, toPos, fromTarget, toTarget, durationMs);
  }

  function dispose() {
    if (animationCancel) animationCancel();
    controls.dispose();
  }

  return {
    camera,
    controls,
    update,
    resetView,
    focusOnPoint,
    isAnimating: () => animating,
    dispose,
  };
}
