import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MODEL_PATH, MODEL_TARGET_HEIGHT } from "../config";

export interface LoadedModel {
  root: THREE.Group;
  meshes: THREE.Mesh[];
  originalHeight: number;
  scale: number;
}

/**
 * Loads and normalizes the character GLB model.
 * Normalization rules (per GAME_SPEC.md section 3.2):
 * - scale = 1.75 / original_height
 * - center x and z on bounding-box center
 * - shift so minimum y = 0 (soles on floor line)
 * - model faces +Z
 */
export async function loadCharacterModel(
  modelUrl: string = MODEL_PATH,
  onProgress?: (percent: number) => void,
): Promise<LoadedModel> {
  const loader = new GLTFLoader();

  const gltf = await new Promise<any>((resolve, reject) => {
    loader.load(
      modelUrl,
      (loaded) => resolve(loaded),
      (event) => {
        if (event.lengthComputable && onProgress) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      },
      (error) => reject(error),
    );
  });

  const rawScene = gltf.scene as THREE.Group;
  const meshes: THREE.Mesh[] = [];

  // Traverse to collect meshes and ensure proper settings
  rawScene.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      meshes.push(mesh);
    }
  });

  // Calculate raw bounding box
  const rawBox = new THREE.Box3().setFromObject(rawScene);
  const rawSize = new THREE.Vector3();
  rawBox.getSize(rawSize);
  const rawCenter = new THREE.Vector3();
  rawBox.getCenter(rawCenter);

  const originalHeight = rawSize.y > 0 ? rawSize.y : 1.717;
  const scale = MODEL_TARGET_HEIGHT / originalHeight;

  // Create a wrapper group for normalized space
  const root = new THREE.Group();
  root.name = "character-root";

  // Center and scale inside root
  rawScene.scale.setScalar(scale);
  rawScene.position.x = -rawCenter.x * scale;
  rawScene.position.z = -rawCenter.z * scale;
  rawScene.position.y = -rawBox.min.y * scale;

  rawScene.updateMatrixWorld(true);
  root.add(rawScene);

  return {
    root,
    meshes,
    originalHeight,
    scale,
  };
}

