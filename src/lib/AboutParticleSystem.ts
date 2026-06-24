"use client";
/**
 * AboutParticleSystem.ts
 *
 * Particles start as a random scatter cloud (no star formation).
 * Hold button charges → explosion burst → scroll triggers sphere reshape.
 */

import * as THREE from "three";

const CHARS: string[] = [".", "+", "*", "x", "o", "#", "@"];
const PARTICLES_PER_GROUP = 2200;
const MAX_CHARGE = 100;
const INTERACTION_RADIUS = 25.0;
const REPEL_STRENGTH = 1.8;
const DRIFT_SPEED = 0.05;
const SPHERE_RADIUS = 60;

function makeSprite(char: string): THREE.Texture {
  const cvs = document.createElement("canvas");
  cvs.width = 64;
  cvs.height = 64;
  const ctx = cvs.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 42px 'Courier New', monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "#ffffff";
  ctx.shadowBlur = 5;
  ctx.fillText(char, 32, 32);
  const t = new THREE.CanvasTexture(cvs);
  t.minFilter = THREE.LinearFilter;
  return t;
}

interface ParticleGroup {
  geo: THREE.BufferGeometry;
  pts: THREE.Points;
  mat: THREE.PointsMaterial;
  posArr: Float32Array;
  scatterPositions: Float32Array;
  spherePositions: Float32Array;
  velArr: Float32Array;
  count: number;
}

export interface ParticleCallbacks {
  onExploded: () => void;
  onReshaping: () => void;
}

export class AboutParticleSystem {
  readonly scene: THREE.Scene;

  private groups: ParticleGroup[] = [];
  private chargeLevel: number = 0;
  private isHolding: boolean = false;
  hasExploded: boolean = false;
  private isReshaping: boolean = false;

  mouse3D = new THREE.Vector3(-9999, -9999, 0);
  prevMouse3D = new THREE.Vector3(-9999, -9999, 0);
  mouseVel = new THREE.Vector3(0, 0, 0);
  mouse2D = new THREE.Vector2(-9999, -9999);

  chargeNorm = 0;
  private cb: ParticleCallbacks;

  constructor(cb: ParticleCallbacks) {
    this.cb = cb;
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x000000, 0.015);
    this._build();
  }

  private _build() {
    const palette = [
      new THREE.Color(0x00ff88), // Footer green
      new THREE.Color(0x38bdf8), // Sky
      new THREE.Color(0xffffff), // White
      new THREE.Color(0x94a3b8), // Slate
    ];

    CHARS.forEach((char) => {
      const N = PARTICLES_PER_GROUP;
      const posArr = new Float32Array(N * 3);
      const scatterPositions = new Float32Array(N * 3);
      const spherePositions = new Float32Array(N * 3);
      const velArr = new Float32Array(N * 3);
      const colArr = new Float32Array(N * 3);

      for (let i = 0; i < N; i++) {
        const i3 = i * 3;
        scatterPositions[i3] = (Math.random() - 0.5) * 300;
        scatterPositions[i3 + 1] = (Math.random() - 0.5) * 200;
        scatterPositions[i3 + 2] = (Math.random() - 0.5) * 150 - 20;

        posArr[i3] = scatterPositions[i3];
        posArr[i3 + 1] = scatterPositions[i3 + 1];
        posArr[i3 + 2] = scatterPositions[i3 + 2];

        const r = SPHERE_RADIUS + (Math.random() * 10 - 5);
        const u = Math.random();
        const v = Math.random();
        const th = u * 2.0 * Math.PI;
        const ph = Math.acos(2.0 * v - 1.0);
        spherePositions[i3] = r * Math.sin(ph) * Math.cos(th);
        spherePositions[i3 + 1] = r * Math.sin(ph) * Math.sin(th);
        spherePositions[i3 + 2] = r * Math.cos(ph);

        velArr[i3] = velArr[i3 + 1] = velArr[i3 + 2] = 0;

        const c = palette[Math.floor(Math.random() * palette.length)];
        colArr[i3] = c.r;
        colArr[i3 + 1] = c.g;
        colArr[i3 + 2] = c.b;
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(posArr, 3));
      geo.setAttribute("color", new THREE.BufferAttribute(colArr, 3));

      const mat = new THREE.PointsMaterial({
        size: 2.5,
        map: makeSprite(char),
        transparent: true,
        opacity: 0.9,
        vertexColors: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });

      const pts = new THREE.Points(geo, mat);
      this.scene.add(pts);

      this.groups.push({
        geo,
        pts,
        mat,
        posArr,
        scatterPositions,
        spherePositions,
        velArr,
        count: N,
      });
    });
  }

  startHold() {
    if (!this.hasExploded) this.isHolding = true;
  }
  stopHold() {
    this.isHolding = false;
  }

  setMouse(wx: number, wy: number, ndcX: number, ndcY: number) {
    this.mouse3D.set(wx, wy, 0);
    this.mouse2D.set(ndcX, ndcY);
  }
  clearMouse() {
    this.mouse3D.set(-9999, -9999, 0);
    this.isHolding = false;
  }

  triggerReshape() {
    if (this.hasExploded && !this.isReshaping) {
      this.isReshaping = true;
    }
  }

  tick(elapsed: number) {
    const time = elapsed;

    if (this.mouse3D.x !== -9999 && this.prevMouse3D.x !== -9999) {
      this.mouseVel.subVectors(this.mouse3D, this.prevMouse3D);
      if (this.mouseVel.lengthSq() > 25) this.mouseVel.setLength(5);
    } else {
      this.mouseVel.set(0, 0, 0);
    }
    this.prevMouse3D.copy(this.mouse3D);

    if (!this.hasExploded) {
      if (this.isHolding) {
        this.chargeLevel = Math.min(MAX_CHARGE, this.chargeLevel + 1.5);
        if (this.chargeLevel >= MAX_CHARGE) {
          this.hasExploded = true;
          this._burst();
          this.cb.onExploded();
          setTimeout(() => this.cb.onReshaping(), 1800);
        }
      } else {
        this.chargeLevel = Math.max(0, this.chargeLevel - 2);
      }
      this.chargeNorm = this.chargeLevel / MAX_CHARGE;
    }

    const rotSpeed = this.hasExploded ? 1 : 1 + this.chargeNorm * 10;

    this.groups.forEach((g) => {
      const pos = g.posArr;
      const vel = g.velArr;
      const scat = g.scatterPositions;
      const sph = g.spherePositions;
      const posAttr = g.geo.attributes.position as THREE.BufferAttribute;

      const spring = this.isReshaping ? 0.003 : 0.03;
      const friction = this.isReshaping ? 0.92 : 0.88;

      for (let i = 0; i < g.count; i++) {
        const i3 = i * 3;
        let px = pos[i3],
          py = pos[i3 + 1],
          pz = pos[i3 + 2];
        let vx = vel[i3],
          vy = vel[i3 + 1],
          vz = vel[i3 + 2];

        const driftX = Math.sin(time * DRIFT_SPEED + scat[i3]) * 2.0;
        const driftY = Math.cos(time * DRIFT_SPEED + scat[i3 + 1]) * 2.0;

        let tx: number, ty: number, tz: number;

        if (this.isReshaping) {
          tx = sph[i3] + driftX;
          ty = sph[i3 + 1] + driftY;
          tz = sph[i3 + 2];
        } else {
          tx = scat[i3] + driftX;
          ty = scat[i3 + 1] + driftY;
          tz =
            scat[i3 + 2] +
            (!this.hasExploded
              ? (Math.random() - 0.5) * (this.chargeLevel * 0.1)
              : 0);
        }

        if (this.hasExploded && this.mouse3D.x !== -9999) {
          const dx = px - this.mouse3D.x;
          const dy = py - this.mouse3D.y;
          const dz = pz - this.mouse3D.z;
          const dSq = dx * dx + dy * dy + dz * dz;
          if (dSq < INTERACTION_RADIUS * INTERACTION_RADIUS) {
            const d = Math.sqrt(dSq);
            const f = (INTERACTION_RADIUS - d) / INTERACTION_RADIUS;
            vx += (dx / d) * f * REPEL_STRENGTH;
            vy += (dy / d) * f * REPEL_STRENGTH;
            vz += (dz / d) * f * REPEL_STRENGTH * 0.5;
            vx += this.mouseVel.x * f * 2.0;
            vy += this.mouseVel.y * f * 2.0;
          }
        }

        vx += (tx - px) * spring;
        vy += (ty - py) * spring;
        vz += (tz - pz) * spring;
        vx *= friction;
        vy *= friction;
        vz *= friction;

        pos[i3] = px + vx;
        pos[i3 + 1] = py + vy;
        pos[i3 + 2] = pz + vz;
        vel[i3] = vx;
        vel[i3 + 1] = vy;
        vel[i3 + 2] = vz;
      }

      posAttr.needsUpdate = true;
      g.pts.rotation.y = time * 0.03 * rotSpeed;
      g.pts.rotation.z = time * 0.015 * rotSpeed;
    });
  }

  private _burst() {
    this.groups.forEach((g) => {
      for (let i = 0; i < g.count; i++) {
        const i3 = i * 3;
        g.velArr[i3] = g.scatterPositions[i3] * 0.15;
        g.velArr[i3 + 1] = g.scatterPositions[i3 + 1] * 0.15;
        g.velArr[i3 + 2] = g.scatterPositions[i3 + 2] * 0.15;
      }
    });
  }

  dispose() {
    this.groups.forEach((g) => {
      g.geo.dispose();
      g.mat.map?.dispose();
      g.mat.dispose();
      this.scene.remove(g.pts);
    });
    this.groups = [];
  }
}
