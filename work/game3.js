
// ================= 泥沙粒子 =================
class Silt {
  constructor(n = 5000) {
    this.n = n;
    this.pos = new Float32Array(n * 3);
    this.vel = new Float32Array(n * 3);
    this.alpha = new Float32Array(n);
    this.size = new Float32Array(n);
    this.life = new Float32Array(n);
    this.head = 0;
    for (let i = 0; i < n; i++) this.size[i] = rand(0.03, 0.22);
    const geo = new THREE.BufferGeometry();
    this.aPos = new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage);
    this.aA = new THREE.BufferAttribute(this.alpha, 1).setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute('position', this.aPos);
    geo.setAttribute('aA', this.aA);
    geo.setAttribute('aS', new THREE.BufferAttribute(this.size, 1));
    this.mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: { uScale: { value: 600 }, uTorch: { value: 1 }, uDay: { value: 0 } },
      vertexShader: `
        attribute float aA; attribute float aS;
        uniform float uScale; uniform float uTorch; uniform float uDay;
        varying float vB; varying float vA;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mv;
          float d = max(-mv.z, 0.01);
          vec3 dir = normalize(mv.xyz);
          float cone = smoothstep(0.84, 0.97, -dir.z);
          float att = 1.0 / (1.0 + d * d * 0.07);
          vB = 0.03 + uDay * 0.35 + cone * att * 2.4 * uTorch;
          vA = aA * smoothstep(0.08, 0.35, d);
          gl_PointSize = clamp(aS * uScale / d, 1.0, 180.0);
        }`,
      fragmentShader: `
        varying float vB; varying float vA;
        void main() {
          float r = length(gl_PointCoord - 0.5) * 2.0;
          if (r > 1.0 || vA < 0.002) discard;
          float f = 1.0 - r * r;
          gl_FragColor = vec4(vec3(0.8, 0.71, 0.55) * vB, f * vA * 0.5 * min(1.0, vB * 1.6 + 0.2));
        }`,
    });
    this.points = new THREE.Points(geo, this.mat);
    this.points.frustumCulled = false;
    scene.add(this.points);
  }
  clear() {
    this.alpha.fill(0);
    this.life.fill(0);
    this.aA.needsUpdate = true;
  }
  spawn(p, spread, up, count) {
    for (let k = 0; k < count; k++) {
      const i = this.head;
      this.head = (this.head + 1) % this.n;
      this.pos[i * 3] = p.x + rand(-spread, spread);
      this.pos[i * 3 + 1] = p.y + rand(0, 0.15);
      this.pos[i * 3 + 2] = p.z + rand(-spread, spread);
      this.vel[i * 3] = rand(-0.25, 0.25);
      this.vel[i * 3 + 1] = rand(0.15, up);
      this.vel[i * 3 + 2] = rand(-0.25, 0.25);
      this.life[i] = rand(60, 110);
      this.alpha[i] = rand(0.5, 1);
    }
  }
  update(dt, player, pvel) {
    const damp = Math.exp(-dt * 1.2);
    const sp = pvel.length();
    let dens = 0;
    let total = 0;
    for (let i = 0; i < this.n; i++) {
      if (this.alpha[i] <= 0) continue;
      const j = i * 3;
      const dx = this.pos[j] - player.x;
      const dy = this.pos[j + 1] - player.y;
      const dz = this.pos[j + 2] - player.z;
      const d2 = dx * dx + dy * dy + dz * dz;
      if (sp > 0.3 && d2 < 1.4) {
        const f = (1.4 - d2) * sp * 0.6 * dt;
        this.vel[j] += pvel.x * f + dx * f;
        this.vel[j + 1] += pvel.y * f + dy * f;
        this.vel[j + 2] += pvel.z * f + dz * f;
      }
      this.vel[j] *= damp;
      this.vel[j + 1] = this.vel[j + 1] * damp - 0.004 * dt;
      this.vel[j + 2] *= damp;
      this.pos[j] += this.vel[j] * dt + Math.sin(this.life[i] * 0.3 + i) * 0.01 * dt;
      this.pos[j + 1] += this.vel[j + 1] * dt;
      this.pos[j + 2] += this.vel[j + 2] * dt;
      this.life[i] -= dt;
      const a = this.life[i] < 15 ? Math.max(0, this.alpha[i] - dt / 15) : this.alpha[i];
      this.alpha[i] = this.life[i] <= 0 ? 0 : a;
      total += this.alpha[i];
      if (d2 < 6.25) dens += this.alpha[i] * (1 - Math.sqrt(d2) / 2.5);
    }
    this.aPos.needsUpdate = true;
    this.aA.needsUpdate = true;
    return { dens, total };
  }
}
const silt = new Silt();

// ================= 导线 =================
class Guide {
  constructor() {
    this.max = 800;
    this.buf = new Float32Array(this.max * 3);
    this.geo = new THREE.BufferGeometry();
    this.geo.setAttribute('position', new THREE.BufferAttribute(this.buf, 3).setUsage(THREE.DynamicDrawUsage));
    this.line = new THREE.Line(this.geo, new THREE.LineBasicMaterial({ color: 0xf4f0e2 }));
    this.line.frustumCulled = false;
    scene.add(this.line);
    this.reset();
  }
  reset() {
    this.pts = [];
    this.all = [];
    this.tied = false;
    this.reel = V3();
    this.geo.setDrawRange(0, 0);
  }
  tie() {
    this.tied = true;
    this.pts = [PEG.clone().add(V3(0, 0.2, 0))];
    this.all = [this.pts[0].clone()];
  }
  length() {
    let L = 0;
    const P = this.poly();
    for (let i = 1; i < P.length; i++) L += P[i].distanceTo(P[i - 1]);
    return L;
  }
  poly() {
    return this.tied ? [...this.pts, this.reel] : [];
  }
  update(player) {
    if (!this.tied) return;
    this.reel.copy(player).add(V3(0, -0.35, 0));
    const last = this.pts.at(-1);
    if (this.pts.length > 1 && this.reel.distanceTo(this.pts.at(-2)) < 1.0) {
      this.pts.pop();
    } else if (this.reel.distanceTo(last) > 2.2 && this.pts.length < this.max - 2) {
      this.pts.push(this.reel.clone());
      this.all.push(this.reel.clone());
    }
    const P = this.poly();
    for (const [i, p] of P.entries()) this.buf.set([p.x, p.y, p.z], i * 3);
    this.geo.attributes.position.needsUpdate = true;
    this.geo.setDrawRange(0, P.length);
  }
  nearest(p) {
    const P = this.poly();
    let best = null;
    const ab = V3();
    const ap = V3();
    for (let i = 0; i < P.length - 1; i++) {
      ab.subVectors(P[i + 1], P[i]);
      const L2 = ab.lengthSq() || 1e-6;
      const t = clamp(ap.subVectors(p, P[i]).dot(ab) / L2, 0, 1);
      const q = P[i].clone().addScaledVector(ab, t);
      const d = q.distanceTo(p);
      if (!best || d < best.d) best = { d, q, k: i, t };
    }
    return best;
  }
}
const guide = new Guide();

// ================= 声音（实时合成） =================
class Sound {
  init() {
    if (this.ctx) return;
    const AC = window.AudioContext ?? window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.9;
    this.master.connect(this.ctx.destination);
    const len = this.ctx.sampleRate * 2;
    this.noise = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = this.noise.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    this.brown = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const b = this.brown.getChannelData(0);
    for (let i = 0; i < len; i++) { last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; b[i] = last * 3.5; }
    const drone = this.src(this.brown, true);
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 160;
    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.value = 0.25;
    drone.connect(lp).connect(this.droneGain).connect(this.master);
    drone.start();
  }
  src(buf, loop = false) {
    const s = this.ctx.createBufferSource();
    s.buffer = buf;
    s.loop = loop;
    return s;
  }
  env(g, t, peak, a, dur) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(peak, t + a);
    g.gain.setValueAtTime(peak, t + Math.max(a, dur * 0.6));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  }
  filtered(buf, type, freq, q, peak, a, dur, at = 0) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime + at;
    const s = this.src(buf);
    const f = this.ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = q;
    const g = this.ctx.createGain();
    this.env(g, t, peak, a, dur);
    s.connect(f).connect(g).connect(this.master);
    s.start(t, Math.random() * 1.5);
    s.stop(t + dur + 0.05);
  }
  inhale(dur, empty) {
    if (empty) { this.filtered(this.noise, 'bandpass', 900, 3, 0.05, 0.02, 0.25); return; }
    this.filtered(this.noise, 'bandpass', 2200, 0.9, 0.16, 0.18, dur);
    this.filtered(this.noise, 'highpass', 5000, 0.5, 0.035, 0.1, dur * 0.9);
  }
  exhale(dur) {
    if (!this.ctx) return;
    this.filtered(this.brown, 'lowpass', 520, 0.7, 0.55, 0.08, dur);
    const t0 = this.ctx.currentTime;
    const n = Math.floor(dur * 16);
    for (let i = 0; i < n; i++) {
      const t = t0 + Math.random() * dur * 0.9;
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      const f = rand(260, 900);
      o.frequency.setValueAtTime(f, t);
      o.frequency.exponentialRampToValueAtTime(f * 1.9, t + 0.05);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.05, t + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
      o.connect(g).connect(this.master);
      o.start(t);
      o.stop(t + 0.08);
    }
  }
  thump(t, f, v) {
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.frequency.setValueAtTime(f, t);
    o.frequency.exponentialRampToValueAtTime(f * 0.6, t + 0.14);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(v, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    o.connect(g).connect(this.master);
    o.start(t);
    o.stop(t + 0.25);
  }
  beat(v) {
    if (!this.ctx || v < 0.01) return;
    const t = this.ctx.currentTime;
    this.thump(t, 58, v);
    this.thump(t + 0.15, 48, v * 0.7);
  }
  bump() {
    this.filtered(this.brown, 'lowpass', 220, 1, 0.9, 0.005, 0.35);
    this.filtered(this.noise, 'bandpass', 700, 2, 0.08, 0.005, 0.12);
  }
  creak() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    const f = this.ctx.createBiquadFilter();
    const g = this.ctx.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(rand(55, 90), t);
    o.frequency.linearRampToValueAtTime(rand(35, 60), t + 2.5);
    f.type = 'bandpass';
    f.frequency.value = 300;
    f.Q.value = 6;
    this.env(g, t, 0.05, 0.8, 2.8);
    o.connect(f).connect(g).connect(this.master);
    o.start(t);
    o.stop(t + 3);
  }
  ping() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.frequency.value = 880;
    this.env(g, t, 0.06, 0.01, 0.5);
    o.connect(g).connect(this.master);
    o.start(t);
    o.stop(t + 0.55);
  }
  setDrone(v) {
    if (this.droneGain) this.droneGain.gain.setTargetAtTime(v, this.ctx.currentTime, 0.5);
  }
  suspend(on) {
    if (!this.ctx) return;
    if (on) this.ctx.suspend();
    else this.ctx.resume();
  }
}
const sound = new Sound();
