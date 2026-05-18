AFRAME.registerComponent('proximity-dialog', {
  init() {
    this._cp = new AFRAME.THREE.Vector3();
    this._np = new AFRAME.THREE.Vector3();
    this.triggered = false;
  },
  tick() {
    if (this.triggered) return;
    const cam = this.el.sceneEl.camera;
    if (!cam) return;
    cam.getWorldPosition(this._cp);
    this.el.object3D.getWorldPosition(this._np);
    if (this._cp.distanceTo(this._np) < 4.5) {
      this.triggered = true;
      showNPCBriefing();
    }
  }
});

AFRAME.registerComponent('computer-proximity', {
  init() {
    this._cp = new AFRAME.THREE.Vector3();
    this._np = new AFRAME.THREE.Vector3();
    this.triggered = false;
  },
  tick() {
    if (this.triggered) return;
    if (typeof gameState === 'undefined' || gameState !== 'S2_BRIEFING') return;
    const cam = this.el.sceneEl.camera;
    if (!cam) return;
    cam.getWorldPosition(this._cp);
    this.el.object3D.getWorldPosition(this._np);
    if (this._cp.distanceTo(this._np) < 5.5) {
      this.triggered = true;
      startS2();
    }
  }
});

AFRAME.registerComponent('collision-walls', {
  init() {
    this.r = 0.38;
    // AABB: { xmin, xmax, zmin, zmax }
    // OBB:  { cx, cz, hw, hd, rot }  rot in Grad
    this.boxes = [
      // Linke Wand — südlich des Büros
      { xmin:-20,   xmax:-11.85, zmin:-20,   zmax:-10   },
      // Linke Wand — Wandstärke neben Büro, oberhalb Tür (z=-10 bis -8)
      { xmin:-12.2, xmax:-11.85, zmin:-10,   zmax:-8    },
      // Türöffnung z=-8 bis z=-5: offen
      // Linke Wand — Wandstärke neben Büro, unterhalb Tür (z=-5 bis -2)
      { xmin:-12.2, xmax:-11.85, zmin:-5,    zmax:-2    },
      // Linke Wand — nördlich des Büros
      { xmin:-20,   xmax:-11.85, zmin:-2,    zmax:38    },
      // Rechte Hauptwand – nördlich Versandraum-Durchgang
      { xmin:11.85, xmax:12.15, zmin:-7.5,  zmax:38    },
      // Rechte Hauptwand – südlich Versandraum-Durchgang
      { xmin:11.85, xmax:12.15, zmin:-20,   zmax:-10.5 },
      // Versandraum – rechte Außenwand
      { xmin:21.85, xmax:30,    zmin:-14,   zmax:-4    },
      // Versandraum – vordere Wand
      { xmin:12,    xmax:22.15, zmin:-4.15, zmax:-3.85 },
      // Versandraum – hintere Wand
      { xmin:12,    xmax:22.15, zmin:-14.15,zmax:-13.85},
      // Rückwand
      { xmin:-20,   xmax:20,     zmin:-20,   zmax:-15.85},
      // Fassade z=0 — Lücke x=-2..x=2 (Eingang)
      { xmin:-12,   xmax:-2,     zmin:-0.3,  zmax:0.3   },
      { xmin:2,     xmax:12,     zmin:-0.3,  zmax:0.3   },
      // Regale
      { xmin:-6.8,  xmax:-3.2,   zmin:-13.3, zmax:-6.7  },
      { xmin:3.2,   xmax:6.8,    zmin:-13.3, zmax:-6.7  },
      // Büro-Wände
      { xmin:-22.2, xmax:-22,    zmin:-10,   zmax:-2    },
      { xmin:-22,   xmax:-12,    zmin:-10.2, zmax:-10   },
      { xmin:-22,   xmax:-12,    zmin:-2,    zmax:-1.8  },
      // Outdoor-Grenze
      { xmin:-30,   xmax:30,     zmin:33,    zmax:40    },
    ];
    this._wp = new AFRAME.THREE.Vector3();
  },
  tick() {
    this.el.object3D.getWorldPosition(this._wp);
    const wx = this._wp.x, wz = this._wp.z;
    const lp = this.el.object3D.position;
    const r = this.r;
    for (const b of this.boxes) {
      if ('xmin' in b) {
        // AABB
        if (wx <= b.xmin-r || wx >= b.xmax+r ||
            wz <= b.zmin-r || wz >= b.zmax+r) continue;
        const dL = wx-(b.xmin-r), dR = (b.xmax+r)-wx;
        const dF = wz-(b.zmin-r), dB = (b.zmax+r)-wz;
        const m = Math.min(dL, dR, dF, dB);
        if      (m===dL) lp.x -= dL;
        else if (m===dR) lp.x += dR;
        else if (m===dF) lp.z -= dF;
        else             lp.z += dB;
      } else {
        // OBB — Spielerposition in lokalen Box-Raum transformieren
        const a = b.rot * Math.PI / 180;
        const cos = Math.cos(-a), sin = Math.sin(-a);
        const dx = wx - b.cx, dz = wz - b.cz;
        const lx = cos*dx - sin*dz;
        const lz = sin*dx + cos*dz;
        const hw = b.hw + r, hd = b.hd + r;
        if (Math.abs(lx) >= hw || Math.abs(lz) >= hd) continue;
        const dL = lx+hw, dR = hw-lx, dF = lz+hd, dB = hd-lz;
        const m = Math.min(dL, dR, dF, dB);
        let plx = 0, plz = 0;
        if      (m===dL) plx = -dL;
        else if (m===dR) plx =  dR;
        else if (m===dF) plz = -dF;
        else             plz =  dB;
        // Zurück in Weltkoordinaten
        const ci = Math.cos(a), si = Math.sin(a);
        lp.x += ci*plx - si*plz;
        lp.z += si*plx + ci*plz;
      }
    }
  }
});

AFRAME.registerComponent('auto-collider', {
  init() {
    this.el.addEventListener('model-loaded', () => {
      this.el.object3D.updateWorldMatrix(true, true);

      // Clear entity Y-rotation to compute bbox in model-local frame (no AABB inflation)
      const savedY = this.el.object3D.rotation.y;
      this.el.object3D.rotation.y = 0;
      this.el.object3D.updateMatrixWorld(true);
      const box = new AFRAME.THREE.Box3().setFromObject(this.el.object3D);
      const hw  = (box.max.x - box.min.x) / 2;
      const hd  = (box.max.z - box.min.z) / 2;
      const bcx = (box.min.x + box.max.x) / 2;
      const bcz = (box.min.z + box.max.z) / 2;

      // Restore rotation; rotate box-center offset around entity origin
      this.el.object3D.rotation.y = savedY;
      this.el.object3D.updateMatrixWorld(true);
      const ep   = this.el.object3D.position;
      const offX = bcx - ep.x, offZ = bcz - ep.z;
      const cosA = Math.cos(savedY), sinA = Math.sin(savedY);
      const cx   = ep.x + cosA * offX - sinA * offZ;
      const cz   = ep.z + sinA * offX + cosA * offZ;
      const rot  = savedY * 180 / Math.PI;

      const cam = document.querySelector('[collision-walls]');
      if (!cam || !cam.components['collision-walls']) return;
      cam.components['collision-walls'].boxes.push({ cx, cz, hw, hd, rot });
    });
  }
});

// ── Debug-Visualisierung (F2 zum Ein-/Ausschalten) ──────────────────
let _dbgEls = [], _dbgOn = false;
function toggleCollisionDebug() {
  const scene = document.querySelector('a-scene');
  const cam   = document.querySelector('[collision-walls]');
  if (!cam || !cam.components['collision-walls']) return;
  if (_dbgOn) {
    _dbgEls.forEach(e => e.remove());
    _dbgEls = []; _dbgOn = false;
    return;
  }
  const r = cam.components['collision-walls'].r;
  cam.components['collision-walls'].boxes.forEach(b => {
    const el = document.createElement('a-box');
    if ('xmin' in b) {
      // AABB: zeige echte Kollisionszone (inkl. Spielerradius)
      el.setAttribute('position', `${(b.xmin+b.xmax)/2} 1.5 ${(b.zmin+b.zmax)/2}`);
      el.setAttribute('width',  (b.xmax - b.xmin) + r*2);
      el.setAttribute('depth',  (b.zmax - b.zmin) + r*2);
    } else {
      // OBB: zeige echte Kollisionszone (inkl. Spielerradius)
      el.setAttribute('position', `${b.cx} 1.5 ${b.cz}`);
      el.setAttribute('width',  (b.hw + r) * 2);
      el.setAttribute('depth',  (b.hd + r) * 2);
      el.setAttribute('rotation', `0 ${b.rot} 0`);
    }
    el.setAttribute('height', 3);
    el.setAttribute('material', 'color:#ff3300;opacity:0.28;transparent:true;side:double;shader:flat');
    scene.appendChild(el);
    _dbgEls.push(el);
  });
  _dbgOn = true;
}
window.addEventListener('keydown', e => { if (e.code === 'F2') toggleCollisionDebug(); });

AFRAME.registerComponent('jump-controls', {
  schema: { jumpForce: {default: 8.5}, gravity: {default: -16} },
  init() {
    this.vy = 0;
    this.grounded = true;
    this.groundY = 0;
    this.onKeyDown = (e) => {
      if (e.code === 'Space' && this.grounded) {
        e.preventDefault();
        this.vy = this.data.jumpForce;
        this.grounded = false;
      }
    };
    window.addEventListener('keydown', this.onKeyDown);
  },
  remove() { window.removeEventListener('keydown', this.onKeyDown); },
  tick(t, dt) {
    if (this.grounded) return;
    const s = Math.min(dt, 50) / 1000;
    this.vy += this.data.gravity * s;
    const p = this.el.object3D.position;
    p.y += this.vy * s;
    if (p.y <= this.groundY) {
      p.y = this.groundY;
      this.vy = 0;
      this.grounded = true;
    }
  }
});

AFRAME.registerComponent('package-follow', {
  schema: {
    active:  { default: false },
    mode:    { default: 'carry' },
    targetX: { default: 0 },
    targetY: { default: 0 },
    targetZ: { default: 0 },
  },
  init() {
    this._v   = new AFRAME.THREE.Vector3();
    this._q   = new AFRAME.THREE.Quaternion();
    this._dir = new AFRAME.THREE.Vector3();
  },
  tick(t, dt) {
    if (!this.data.active) return;
    const cam = this.el.sceneEl.camera;
    const pos = this.el.object3D.position;
    let tx, ty, tz;
    if (this.data.mode === 'carry') {
      cam.getWorldQuaternion(this._q);
      this._dir.set(0.25, -0.38, -0.55).applyQuaternion(this._q);
      cam.getWorldPosition(this._v);
      tx = this._v.x + this._dir.x;
      ty = this._v.y + this._dir.y;
      tz = this._v.z + this._dir.z;
    } else {
      tx = this.data.targetX;
      ty = this.data.targetY;
      tz = this.data.targetZ;
      if (Math.abs(tx - pos.x) < 0.0005 && Math.abs(ty - pos.y) < 0.0005 && Math.abs(tz - pos.z) < 0.0005) {
        pos.x = tx; pos.y = ty; pos.z = tz;
        return;
      }
    }
    const speed = Math.min((dt / 1000) * 9, 1);
    pos.x += (tx - pos.x) * speed;
    pos.y += (ty - pos.y) * speed;
    pos.z += (tz - pos.z) * speed;
  }
});
