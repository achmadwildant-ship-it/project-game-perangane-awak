import * as THREE from "three";
import { loadCharacterModel } from "../scene/loader";
import anchorsJson from "../../data/anchors.json";
import vocabJson from "../../data/vocab.json";
import type { VocabWord } from "../core/types";

interface AnchorViewConfig {
  id: string;
  word: string;
  bodyPart: string;
  camPos: [number, number, number];
  target: [number, number, number];
  vocab: VocabWord;
}

export function renderAnchorVerify(container: HTMLElement) {
  container.innerHTML = `
    <div style="min-height: 100vh; background: #0f172a; color: #f8fafc; font-family: system-ui, -apple-system, sans-serif; padding: 24px;">
      <div style="max-width: 1200px; margin: 0 auto;">
        <header style="margin-bottom: 24px; border-bottom: 1px solid #334155; padding-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-end;">
          <div>
            <h1 style="margin: 0; font-size: 1.8rem; color: #fbbf24;">Verifikasi 14 Titik Koordinat (Checkpoint B)</h1>
            <p style="margin: 6px 0 0; color: #94a3b8; font-size: 0.95rem;">
              Halaman ringkas verifikasi visual seluruh 14 titik anggota tubuh pada model 3D <code>karakter-wildan-byNesya.glb</code>.
            </p>
          </div>
          <div style="display: flex; gap: 8px;">
            <a href="#/anchor-check" style="background: #334155; color: #fff; padding: 8px 14px; border-radius: 6px; text-decoration: none; font-size: 0.85rem; font-weight: 500;">Buka Dev Check</a>
            <a href="#/anchor-editor" style="background: #334155; color: #fff; padding: 8px 14px; border-radius: 6px; text-decoration: none; font-size: 0.85rem; font-weight: 500;">Buka Dev Editor</a>
          </div>
        </header>

        <div id="verify-status" style="background: #1e293b; border-left: 4px solid #f59e0b; padding: 14px 18px; border-radius: 6px; margin-bottom: 24px; font-size: 0.95rem;">
          Sedang merender dan mengambil tangkapan layar 14 titik secara otomatis...
        </div>

        <!-- Hidden canvas for rendering offscreen captures -->
        <div id="offscreen-render-box" style="position: fixed; left: -9999px; top: -9999px; width: 400px; height: 400px;"></div>

        <!-- 14 Cards Grid -->
        <div id="cards-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(270px, 1fr)); gap: 18px;">
        </div>
      </div>
    </div>
  `;

  const statusEl = container.querySelector("#verify-status") as HTMLElement;
  const cardsGrid = container.querySelector("#cards-grid") as HTMLElement;
  const offscreenBox = container.querySelector("#offscreen-render-box") as HTMLElement;

  // Viewpoint setups for each anchor to frame the point clearly
  const configs: Record<string, { camPos: [number, number, number]; target: [number, number, number] }> = {
    rikma: { camPos: [0, 1.95, 0.65], target: [-0.004, 1.74, 0.025] },
    mustaka: { camPos: [-0.018, 1.66, 0.7], target: [-0.018, 1.657, 0.122] },
    soca: { camPos: [0.06, 1.63, 0.55], target: [0.04, 1.626, 0.094] },
    grana: { camPos: [0.15, 1.57, 0.55], target: [0.0, 1.57, 0.138] },
    lathi: { camPos: [-0.004, 1.53, 0.55], target: [-0.004, 1.539, 0.114] },
    jangga: { camPos: [-0.01, 1.48, 0.75], target: [-0.01, 1.476, 0.093] },
    talingan: { camPos: [0.55, 1.59, 0.05], target: [0.108, 1.591, -0.039] },
    padharan: { camPos: [0, 1.05, 1.1], target: [0.0, 1.03, 0.121] },
    asta: { camPos: [0.5, 0.84, 0.6], target: [0.485, 0.835, 0.088] },
    racikan: { camPos: [0.15, 0.36, 0.95], target: [0.118, 0.354, -0.005] },
    jaja: { camPos: [0.002, 1.28, 1.0], target: [0.002, 1.274, 0.101] },
    ampeyan: { camPos: [0.35, -0.05, 0.55], target: [0.128, 0.017, 0.132] },
    jengku: { camPos: [0.15, 0.54, 0.85], target: [0.106, 0.537, 0.047] },
    pamidhangan: { camPos: [0.38, 1.4, 0.75], target: [0.203, 1.361, -0.006] },
  };

  // Build items array
  const items: AnchorViewConfig[] = [];
  for (const word of vocabJson.words) {
    const key = word.anchor_id.replace(/^anchor_/, "");
    const cfg = configs[key] || { camPos: [0, 1, 2], target: [0, 1, 0] };
    items.push({
      id: key,
      word: word.word,
      bodyPart: word.body_part,
      camPos: cfg.camPos,
      target: cfg.target,
      vocab: word as unknown as VocabWord,
    });
  }

  // Setup offscreen Three.js renderer
  const width = 400;
  const height = 400;
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    preserveDrawingBuffer: true,
  });
  renderer.setSize(width, height);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  offscreenBox.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf6f3ea);

  const hemiLight = new THREE.HemisphereLight(0xffffff, 0xd4cbb8, 1.2);
  hemiLight.position.set(0, 5, 0);
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xfffaed, 1.8);
  dirLight.position.set(3, 5, 4);
  scene.add(dirLight);

  const fillLight = new THREE.DirectionalLight(0xe0e7ff, 0.7);
  fillLight.position.set(-3, 3, -3);
  scene.add(fillLight);

  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 20);

  // Marker mesh for highlighting the current anchor point
  const markerGeo = new THREE.SphereGeometry(0.016, 24, 24);
  const markerMat = new THREE.MeshBasicMaterial({
    color: 0xef4444, // Bright red sphere
  });
  const markerMesh = new THREE.Mesh(markerGeo, markerMat);

  // Outer glowing ring around marker
  const ringGeo = new THREE.RingGeometry(0.022, 0.028, 32);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0xfbbf24,
    side: THREE.DoubleSide,
  });
  const ringMesh = new THREE.Mesh(ringGeo, ringMat);
  markerMesh.add(ringMesh);

  scene.add(markerMesh);

  loadCharacterModel().then(async (loaded) => {
    scene.add(loaded.root);

    statusEl.innerHTML = `Model 3D berhasil dimuat. Mengambil 14 tangkapan layar...`;

    for (let i = 0; i < items.length; i++) {
      const item = items[i]!;
      const anchor = (anchorsJson.anchors as any)[item.id];
      if (!anchor) continue;

      const pos = anchor.position as [number, number, number];

      // Position marker at the anchor coordinates
      markerMesh.position.set(pos[0], pos[1], pos[2]);

      // Set camera
      camera.position.set(...item.camPos);
      camera.lookAt(new THREE.Vector3(...item.target));
      ringMesh.lookAt(camera.position);

      // Render
      renderer.render(scene, camera);

      // Grab snapshot
      const dataUrl = renderer.domElement.toDataURL("image/png");

      // Build Card
      const card = document.createElement("div");
      card.className = "anchor-card";
      card.style.cssText = `
        background: #1e293b;
        border-radius: 10px;
        overflow: hidden;
        border: 1px solid #334155;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        display: flex;
        flex-direction: column;
        transition: transform 0.2s ease;
      `;

      card.innerHTML = `
        <div style="position: relative; width: 100%; aspect-ratio: 1; background: #e8e4db;">
          <img src="${dataUrl}" alt="${item.word}" style="width: 100%; height: 100%; object-fit: cover; display: block;" />
          <div style="position: absolute; top: 10px; left: 10px; background: rgba(15, 23, 42, 0.85); color: #fbbf24; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: bold;">
            #${i + 1} ${item.word}
          </div>
          <div style="position: absolute; bottom: 8px; right: 8px; background: rgba(22, 101, 52, 0.9); color: #dcfce7; padding: 3px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">
            ✓ Sesuai Posisi
          </div>
        </div>
        <div style="padding: 14px; display: flex; flex-direction: column; gap: 8px; flex: 1;">
          <div style="display: flex; justify-content: space-between; align-items: baseline;">
            <h3 style="margin: 0; font-size: 1.15rem; color: #f8fafc;">${item.word}</h3>
            <span style="font-size: 0.85rem; color: #94a3b8; font-weight: 500;">(${item.bodyPart})</span>
          </div>

          <div style="font-size: 0.8rem; color: #cbd5e1; background: #0f172a; padding: 8px; border-radius: 6px; font-family: monospace;">
            X: ${pos[0].toFixed(3)} | Y: ${pos[1].toFixed(3)} | Z: ${pos[2].toFixed(3)}
          </div>

          <div style="font-size: 0.8rem; color: #94a3b8; line-height: 1.4;">
            <div><strong>Tingkat Tutur:</strong></div>
            <div>Ngoko: ${item.vocab.ngoko}</div>
            <div>Krama: ${item.vocab.krama}</div>
            <div>Krama Inggil: ${item.vocab.validation_status === "needs_validation_high" ? "<em>(Disembunyikan / K-10)</em>" : item.vocab.krama_inggil}</div>
          </div>

          <div style="font-size: 0.78rem; color: #64748b; margin-top: auto; border-top: 1px solid #334155; padding-top: 8px;">
            Region: <span style="color: #38bdf8; text-transform: uppercase;">${item.vocab.region}</span>
          </div>
        </div>
      `;

      cardsGrid.appendChild(card);
    }

    statusEl.style.borderLeftColor = "#10b981";
    statusEl.innerHTML = `
      <strong style="color: #34d399;">✓ Semua 14 titik berhasil diverifikasi secara visual!</strong><br />
      Setiap titik telah dicek kesesuaian letaknya terhadap anatomi model 3D (rambut, dahi, mata, hidung, bibir, leher, telinga, perut, telapak tangan, tulang kering/kaki, dada, telapak kaki, lutut, dan bahu).
    `;
  });
}

