import * as THREE from "three";
import { loadCharacterModel, type LoadedModel } from "./loader";
import { createCameraManager, type CameraManager } from "./camera";
import { HotspotManager } from "./hotspots";
import { COPY } from "../copy";

function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

export interface GameSceneStage {
  container: HTMLElement;
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  cameraManager: CameraManager;
  hotspots: HotspotManager;
  loadedModel: LoadedModel;
  start: () => void;
  stop: () => void;
  resize: () => void;
  dispose: () => void;
}

export interface StageOptions {
  container: HTMLElement;
  modelUrl?: string;
  onPointClick: (pointId: string) => void;
  onProgress?: (percent: number) => void;
}

export async function createGameSceneStage(
  options: StageOptions,
): Promise<GameSceneStage> {
  const { container, modelUrl, onPointClick, onProgress } = options;

  if (!isWebGLAvailable()) {
    throw new Error(COPY.error.webglUnavailable);
  }

  // 1. Setup renderer
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  renderer.domElement.style.cssText = `
    display: block;
    width: 100%;
    height: 100%;
    outline: none;
  `;
  container.appendChild(renderer.domElement);

  // 2. Setup scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf6f3ea); // Warm batik-inspired ivory/cream background

  // 3. Setup natural PBR lighting (per AGENTS.md: hemisphere + directional)
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0xd4cbb8, 1.2);
  hemiLight.position.set(0, 5, 0);
  scene.add(hemiLight);

  const mainDirLight = new THREE.DirectionalLight(0xfffaed, 1.8);
  mainDirLight.position.set(3, 5, 4);
  mainDirLight.castShadow = true;
  mainDirLight.shadow.mapSize.width = 1024;
  mainDirLight.shadow.mapSize.height = 1024;
  mainDirLight.shadow.camera.near = 0.5;
  mainDirLight.shadow.camera.far = 10;
  mainDirLight.shadow.bias = -0.0005;
  scene.add(mainDirLight);

  // Fill light from back-left for soft rim lighting
  const fillLight = new THREE.DirectionalLight(0xe0e7ff, 0.7);
  fillLight.position.set(-3, 3, -3);
  scene.add(fillLight);

  // Subtle floor shadow receiver
  const shadowPlaneGeo = new THREE.PlaneGeometry(3, 3);
  const shadowPlaneMat = new THREE.ShadowMaterial({ opacity: 0.15 });
  const shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = 0.001; // Just on top of floor
  shadowPlane.receiveShadow = true;
  scene.add(shadowPlane);

  // 4. Setup camera & controls
  const aspect = container.clientWidth / (container.clientHeight || 1);
  const cameraManager = createCameraManager(renderer.domElement, aspect);

  // 5. Load model with loading indicator
  const loadedModel = await loadCharacterModel(modelUrl, onProgress);
  scene.add(loadedModel.root);

  // 6. Setup HotspotManager
  const hotspots = new HotspotManager({
    container,
    camera: cameraManager.camera,
    meshes: loadedModel.meshes,
    onPointClick,
  });

  // 7. Animation loop
  let animationFrameId: number | null = null;
  let running = false;

  function renderLoop() {
    if (!running) return;
    cameraManager.update();
    hotspots.update();
    renderer.render(scene, cameraManager.camera);
    animationFrameId = requestAnimationFrame(renderLoop);
  }

  function start() {
    if (running) return;
    running = true;
    renderLoop();
  }

  function stop() {
    running = false;
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  }

  function resize() {
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (width === 0 || height === 0) return;

    cameraManager.camera.aspect = width / height;
    cameraManager.camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    hotspots.update();
  }

  // Handle auto resize on window resize
  window.addEventListener("resize", resize);

  function dispose() {
    stop();
    window.removeEventListener("resize", resize);
    hotspots.dispose();
    cameraManager.dispose();
    renderer.dispose();
    renderer.domElement.remove();
  }

  // Auto-start loop
  start();

  return {
    container,
    renderer,
    scene,
    cameraManager,
    hotspots,
    loadedModel,
    start,
    stop,
    resize,
    dispose,
  };
}
