import * as THREE from "three";
import {
  TOUCH_TARGET_PX,
  DOT_VISUAL_RADIUS_PX,
  OCCLUSION_TOLERANCE,
} from "../config";

export interface ProjectedPoint {
  id: string;
  label: string;
  screenX: number;
  screenY: number;
  worldPos: THREE.Vector3;
  isOccluded: boolean;
  isBehindCamera: boolean;
}

export interface HotspotRendererOptions {
  container: HTMLElement;
  camera: THREE.Camera;
  meshes: THREE.Mesh[];
  onPointClick: (pointId: string) => void;
}

export class HotspotManager {
  private container: HTMLElement;
  private camera: THREE.Camera;
  private meshes: THREE.Mesh[];
  private raycaster = new THREE.Raycaster();
  private points: { id: string; label: string; position: [number, number, number] }[] = [];
  private disabledPointIds = new Set<string>();
  private highlightedPointId: string | null = null;
  private onPointClick: (pointId: string) => void;
  private overlayElement: HTMLDivElement;
  private pointElements = new Map<string, HTMLDivElement>();
  private lastProjected: ProjectedPoint[] = [];

  constructor(options: HotspotRendererOptions) {
    this.container = options.container;
    this.camera = options.camera;
    this.meshes = options.meshes;
    this.onPointClick = options.onPointClick;

    // Create an overlay container positioned on top of the 3D canvas
    this.overlayElement = document.createElement("div");
    this.overlayElement.className = "hotspot-overlay";
    this.overlayElement.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      overflow: hidden;
      z-index: 10;
    `;
    this.container.appendChild(this.overlayElement);

    // Attach click listener for nearest-dot picking
    this.setupPickingListener();
  }

  public setPoints(
    points: { id: string; label: string; position: [number, number, number] }[],
  ) {
    this.points = points;
    this.recreateDOMElements();
  }

  public setDisabledPoints(disabledIds: string[]) {
    this.disabledPointIds = new Set(disabledIds);
    this.updateDOMElementsState();
  }

  public setHighlightPoint(pointId: string | null) {
    this.highlightedPointId = pointId;
    this.updateDOMElementsState();
  }

  private recreateDOMElements() {
    this.overlayElement.innerHTML = "";
    this.pointElements.clear();

    for (const point of this.points) {
      const el = document.createElement("div");
      el.className = `hotspot-dot dot-${point.id}`;
      el.setAttribute("data-id", point.id);
      el.setAttribute("role", "button");
      el.setAttribute("aria-label", `Titik ${point.label}`);
      el.tabIndex = 0;

      el.style.cssText = `
        position: absolute;
        width: ${DOT_VISUAL_RADIUS_PX * 2}px;
        height: ${DOT_VISUAL_RADIUS_PX * 2}px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 14px;
        color: #ffffff;
        background: #b45309;
        box-shadow: 0 2px 8px rgba(0,0,0,0.35), 0 0 0 2px #ffffff;
        transform: translate(-50%, -50%);
        cursor: pointer;
        user-select: none;
        pointer-events: auto;
        transition: transform 0.15s ease, opacity 0.2s ease, background-color 0.2s ease;
      `;

      el.innerHTML = `<span>${point.label}</span>`;

      // Click and keyboard enter/space
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        this.handleClick(point.id);
      });

      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.handleClick(point.id);
        }
      });

      this.overlayElement.appendChild(el);
      this.pointElements.set(point.id, el);
    }

    this.updateDOMElementsState();
  }

  private updateDOMElementsState() {
    for (const [id, el] of this.pointElements) {
      const isDisabled = this.disabledPointIds.has(id);
      const isHighlighted = this.highlightedPointId === id;

      if (isHighlighted) {
        el.style.backgroundColor = "#15803d"; // Green for correct
        el.style.boxShadow = "0 0 0 4px #86efac, 0 4px 12px rgba(21,128,61,0.5)";
        el.style.transform = "translate(-50%, -50%) scale(1.15)";
      } else if (isDisabled) {
        el.style.backgroundColor = "#dc2626"; // Red for disabled wrong answer
        el.style.opacity = "0.5";
        el.style.cursor = "not-allowed";
        el.style.pointerEvents = "none";
      } else {
        el.style.backgroundColor = "#b45309";
        el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.35), 0 0 0 2px #ffffff";
      }
    }
  }

  private handleClick(pointId: string) {
    if (this.disabledPointIds.has(pointId)) return;
    this.onPointClick(pointId);
  }

  private setupPickingListener() {
    const handlePick = (clientX: number, clientY: number) => {
      const rect = this.container.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      let closestId: string | null = null;
      let closestDist = TOUCH_TARGET_PX;

      for (const p of this.lastProjected) {
        if (p.isOccluded || p.isBehindCamera) continue;
        if (this.disabledPointIds.has(p.id)) continue;

        const dx = p.screenX - x;
        const dy = p.screenY - y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist <= closestDist) {
          closestDist = dist;
          closestId = p.id;
        }
      }

      if (closestId) {
        this.handleClick(closestId);
      }
    };

    // Overlay touch/click forwarding for near-dot picking
    this.container.addEventListener("click", (e) => {
      // If direct target was a point, handled by its listener
      if ((e.target as HTMLElement).closest(".hotspot-dot")) return;
      handlePick(e.clientX, e.clientY);
    });
  }

  /**
   * Project points and check occlusion every frame
   */
  public update() {
    const rect = this.container.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    if (width === 0 || height === 0) return;

    const projectedList: ProjectedPoint[] = [];

    for (const p of this.points) {
      const worldPos = new THREE.Vector3(...p.position);
      const camPos = this.camera.position;
      const pointDist = camPos.distanceTo(worldPos);

      // Check if behind camera
      const projected = worldPos.clone().project(this.camera);
      const isBehindCamera = projected.z > 1;

      // Check occlusion via raycasting
      let isOccluded = false;
      if (!isBehindCamera && this.meshes.length > 0) {
        const rayDir = new THREE.Vector3().subVectors(worldPos, camPos).normalize();
        this.raycaster.set(camPos, rayDir);
        this.raycaster.far = pointDist;
        const hits = this.raycaster.intersectObjects(this.meshes, false);

        if (hits.length > 0) {
          const hit = hits[0]!;
          if (hit.distance < pointDist - OCCLUSION_TOLERANCE) {
            isOccluded = true;
          }
        }
      }

      const screenX = (projected.x * 0.5 + 0.5) * width;
      const screenY = (-projected.y * 0.5 + 0.5) * height;

      projectedList.push({
        id: p.id,
        label: p.label,
        screenX,
        screenY,
        worldPos,
        isOccluded,
        isBehindCamera,
      });

      // Update DOM element position and visibility
      const el = this.pointElements.get(p.id);
      if (el) {
        if (isBehindCamera) {
          el.style.display = "none";
        } else {
          el.style.display = "flex";
          el.style.left = `${screenX}px`;
          el.style.top = `${screenY}px`;

          if (isOccluded) {
            el.style.opacity = "0.25";
            el.style.pointerEvents = "none";
          } else if (!this.disabledPointIds.has(p.id)) {
            el.style.opacity = "1";
            el.style.pointerEvents = "auto";
          }
        }
      }
    }

    this.lastProjected = projectedList;
  }

  public getProjectedPoints(): ProjectedPoint[] {
    return this.lastProjected;
  }

  public dispose() {
    this.overlayElement.remove();
    this.pointElements.clear();
  }
}
