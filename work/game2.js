
// ================= 渲染器与场景 =================
const hasWebGL = () => {
  try {
    const cv = document.createElement('canvas');
    const gl = cv.getContext('webgl2') ?? cv.getContext('webgl');
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
    return Boolean(gl);
  } catch {
    return false;
  }
};
const makeRenderer = () => {
  for (const opts of hasWebGL() ? [{ antialias: true, powerPreference: 'high-performance' }, { antialias: false }] : []) {
    try {
      return new THREE.WebGLRenderer(opts);
    } catch {
      /* 换一组参数再试 */
    }
  }
  return fallbackRenderer();
};
const fallbackRenderer = () => {
  // 无 WebGL：用空渲染器让菜单与模拟照常运行
  const domElement = document.createElement('canvas');
  return { domElement, noGL: true, render() {}, setSize() {}, setPixelRatio() {}, getPixelRatio: () => 1 };
};
const renderer = makeRenderer();
const NO_GL = Boolean(renderer.noGL);
if (NO_GL) {
  const note = $('#lockhint');
  note.textContent = '这个浏览器无法创建 WebGL，画面无法显示。菜单、死法图鉴与声音仍可使用。';
  note.style.display = 'block';
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
$('#view').appendChild(renderer.domElement);

const scene = new THREE.Scene();
const FOG_CAVE = new THREE.Color(0x030505);
const FOG_LAKE = new THREE.Color(0x1b3833);
const FOG_SILT = new THREE.Color(0x4d412f);
scene.fog = new THREE.FogExp2(0x1b3833, 0.1);
scene.background = scene.fog.color;

const camera = new THREE.PerspectiveCamera(72, window.innerWidth / window.innerHeight, 0.05, 160);
camera.rotation.order = 'YXZ';
scene.add(camera);

const torch = new THREE.SpotLight(0xfff0d8, 26, 34, 0.44, 0.6, 1.5);
torch.position.set(0.12, -0.08, 0);
torch.target.position.set(0, -0.05, -1);
camera.add(torch, torch.target);
const fill = new THREE.PointLight(0xfff0d8, 0.35, 4, 1.5);
camera.add(fill);
const hemi = new THREE.HemisphereLight(0x9fd0c0, 0x2b2619, 1);
scene.add(hemi);
const amb = new THREE.AmbientLight(0x404850, 0.04);
scene.add(amb);

const onResize = () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
};
window.addEventListener('resize', onResize);

// ================= 洞穴体积 =================
class Tube {
  constructor(name, pts, rads, { capEnd = true } = {}) {
    this.name = name;
    this.curve = new THREE.CatmullRomCurve3(pts.map(([x, y, z]) => V3(x, y, z)), false, 'centripetal');
    this.len = this.curve.getLength();
    const n = Math.ceil(this.len / 0.5);
    this.rings = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const c = this.curve.getPointAt(t);
      const tg = this.curve.getTangentAt(t);
      const side = V3().crossVectors(tg, UP).normalize();
      const up = V3().crossVectors(side, tg).normalize();
      const u = t * (rads.length - 1);
      const k = Math.min(Math.floor(u), rads.length - 2);
      let r = lerp(rads[k], rads[k + 1], smooth(u - k));
      const s = t * this.len;
      if (capEnd) r *= Math.max(0.04, Math.sqrt(clamp((this.len - s) / 2.4, 0, 1)));
      this.rings.push({ c, tg, side, up, r, s, fh: r * 0.55 });
    }
  }
  local(p) {
    let best = 0;
    let bd = Infinity;
    for (const [i, g] of this.rings.entries()) {
      const d = g.c.distanceToSquared(p);
      if (d < bd) { bd = d; best = i; }
    }
    const g = this.rings[best];
    const d = V3().subVectors(p, g.c);
    return { g, i: best, x: d.dot(g.side), y: d.dot(g.up), a: d.dot(g.tg) };
  }
  contains(p, m = 0) {
    const { g, i, x, y, a } = this.local(p);
    if (i === 0 && a < 0) return false;
    const r = g.r * 0.85 - m;
    return r > 0 && x * x + y * y < r * r && y > -g.fh + m;
  }
  resolve(p, pr) {
    const L = this.local(p);
    const { g, i, a } = L;
    let { x, y } = L;
    if (i === 0 && a < 0) return { inside: false, d: Infinity };
    const r = Math.max(0.06, g.r * 0.85 - pr);
    const len = Math.hypot(x, y);
    let moved = false;
    if (len > r) { x *= r / len; y *= r / len; moved = true; }
    const fl = -g.fh + pr * 0.8;
    if (y < fl) { y = fl; moved = true; }
    const q = g.c.clone().addScaledVector(g.side, x).addScaledVector(g.up, y).addScaledVector(g.tg, a);
    return { inside: !moved, p: q, d: q.distanceTo(p), floor: L.y + g.fh, s: g.s, vol: this };
  }
  floorDist(p) {
    const { g, y } = this.local(p);
    return y + g.fh;
  }
  atS(s) {
    return this.rings.reduce((b, g) => (Math.abs(g.s - s) < Math.abs(b.s - s) ? g : b));
  }
}

class Lake {
  constructor() {
    this.name = 'lake';
    this.min = V3(-12, -3, -6);
    this.max = V3(12, -0.4, 18);
  }
  contains(p, m = 0, cull = false) {
    const top = cull ? 2 : this.max.y;
    return p.x > this.min.x + m && p.x < this.max.x - m && p.y > this.min.y + m && p.y < top - m && p.z > this.min.z + m && p.z < this.max.z - m;
  }
  resolve(p, pr) {
    const q = V3(
      clamp(p.x, this.min.x + pr, this.max.x - pr),
      clamp(p.y, this.min.y + pr * 0.8, this.max.y),
      clamp(p.z, this.min.z + pr, this.max.z - pr),
    );
    const d = q.distanceTo(p);
    return { inside: d < 1e-6, p: q, d, floor: p.y - this.min.y, s: 0, vol: this };
  }
  floorDist(p) {
    return p.y - this.min.y;
  }
}

const lake = new Lake();
// 三米湖：整条洞都在 2–3.5 米深。中心线水平，半径 1.1–1.35，
// 让游动范围（中心上方 0.85r−0.32，底部 −0.55r+0.26）始终落在这个深度带内。
const CAVE_Y = -2.85;
const MAIN_PTS = [[0, -4], [0, -9], [1.5, -15], [3, -22], [1, -29], [-3, -35], [-5, -42], [-5, -48], [-1, -55], [4, -61], [6, -67]].map(([x, z]) => [x, CAVE_Y, z]);
const MAIN_RADS = [1.35, 1.3, 1.2, 1.3, 1.2, 1.3, 1.15, 1.1, 1.2, 1.35, 1.35];
const main = new Tube('main', MAIN_PTS, MAIN_RADS);
const branch = new Tube('branch', [[-3, -35], [-9, -36.5], [-15, -33], [-19, -27], [-20, -21]].map(([x, z]) => [x, CAVE_Y, z]), [1.3, 1.25, 1.2, 1.2, 1.1]);
const volumes = [lake, main, branch];

const containedOther = (p, self) => volumes.some((v) => v !== self && (v === lake ? v.contains(p, 0.02, true) : v.contains(p, 0.02)));

// 网格：把落在其他体积内部的三角形剔除，形成洞口与岔口
const buildGeo = (pos, col, idx, self) => {
  const keep = [];
  const c = V3();
  for (let t = 0; t < idx.length; t += 3) {
    const [a, b, d] = [idx[t], idx[t + 1], idx[t + 2]];
    c.set(
      (pos[a * 3] + pos[b * 3] + pos[d * 3]) / 3,
      (pos[a * 3 + 1] + pos[b * 3 + 1] + pos[d * 3 + 1]) / 3,
      (pos[a * 3 + 2] + pos[b * 3 + 2] + pos[d * 3 + 2]) / 3,
    );
    if (!containedOther(c, self)) keep.push(a, b, d);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  geo.setIndex(keep);
  geo.computeVertexNormals();
  return geo;
};
const rockMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, metalness: 0, side: THREE.DoubleSide });

// 碎石段：主通道这一段底部是碎石，剪踢不会扬起泥沙
const ROCK_ZONE = [18, 30];
const isRock = (name, s) => name === 'main' && s > ROCK_ZONE[0] && s < ROCK_ZONE[1];
// 底部扬尘系数：淤泥 1，湖底沙 0.3，碎石 0.08
const floorSilt = (loc) => (loc.name === 'lake' ? 0.3 : isRock(loc.name, loc.s) ? 0.08 : 1);

const tubeMesh = (tube) => {
  const M = 30;
  const pos = [];
  const col = [];
  const idx = [];
  const b = V3();
  for (const g of tube.rings) {
    for (let j = 0; j <= M; j++) {
      const th = (j / M) * Math.PI * 2;
      const cs = Math.cos(th);
      const sn = Math.sin(th);
      b.copy(g.c).addScaledVector(g.side, cs * g.r).addScaledVector(g.up, sn * g.r);
      const n = fbm(b.x * 0.55, b.y * 0.55, b.z * 0.55);
      const rr = g.r * (0.84 + 0.4 * n);
      let x = cs * rr;
      let y = sn * rr;
      const isFloor = y < -g.fh;
      const rock = isRock(tube.name, g.s);
      if (isFloor) { y = -g.fh + (fbm(b.x * 2, 0, b.z * 2) - 0.5) * (rock ? 0.28 : 0.1); x *= 1.06; }
      b.copy(g.c).addScaledVector(g.side, x).addScaledVector(g.up, y);
      pos.push(b.x, b.y, b.z);
      const k = 0.7 + 0.6 * n;
      if (isFloor && rock) col.push(0.3 * k, 0.3 * k, 0.29 * k);
      else if (isFloor) col.push(0.42 * k, 0.35 * k, 0.24 * k);
      else if (sn > 0.5) col.push(0.17 * k, 0.17 * k, 0.15 * k);
      else col.push(0.27 * k, 0.25 * k, 0.21 * k);
    }
  }
  for (let i = 0; i < tube.rings.length - 1; i++) {
    for (let j = 0; j < M; j++) {
      const a = i * (M + 1) + j;
      const c = a + M + 1;
      idx.push(a, c, a + 1, a + 1, c, c + 1);
    }
  }
  return new THREE.Mesh(buildGeo(pos, col, idx, tube), rockMat);
};

const lakeMesh = () => {
  const pos = [];
  const col = [];
  const idx = [];
  const grid = (o, ua, ub, nu, nv, f) => {
    const base = pos.length / 3;
    const p = V3();
    for (let i = 0; i <= nu; i++) {
      for (let j = 0; j <= nv; j++) {
        p.copy(o).addScaledVector(ua, i / nu).addScaledVector(ub, j / nv);
        const n = fbm(p.x * 0.35, p.y * 0.35, p.z * 0.35);
        f(p, n);
        pos.push(p.x, p.y, p.z);
        const k = 0.7 + 0.6 * n;
        if (p.y < -2.7) col.push(0.4 * k, 0.37 * k, 0.26 * k);
        else col.push(0.2 * k, 0.27 * k, 0.2 * k);
      }
    }
    for (let i = 0; i < nu; i++) {
      for (let j = 0; j < nv; j++) {
        const a = base + i * (nv + 1) + j;
        const c = a + nv + 1;
        idx.push(a, c, a + 1, a + 1, c, c + 1);
      }
    }
  };
  const { min, max } = lake;
  const W = max.x - min.x;
  const D = max.z - min.z;
  grid(V3(min.x, min.y, min.z), V3(W, 0, 0), V3(0, 0, D), 48, 48, (p, n) => { p.y += (n - 0.5) * 0.3; });
  const H = 3.6;
  grid(V3(min.x, min.y, min.z), V3(W, 0, 0), V3(0, H, 0), 40, 8, (p, n) => { p.z -= n * 1.2; });
  grid(V3(min.x, min.y, max.z), V3(W, 0, 0), V3(0, H, 0), 40, 8, (p, n) => { p.z += n * 1.2; });
  grid(V3(min.x, min.y, min.z), V3(0, 0, D), V3(0, H, 0), 40, 8, (p, n) => { p.x -= n * 1.2; });
  grid(V3(max.x, min.y, min.z), V3(0, 0, D), V3(0, H, 0), 40, 8, (p, n) => { p.x += n * 1.2; });
  return new THREE.Mesh(buildGeo(pos, col, idx, lake), rockMat);
};

scene.add(lakeMesh(), tubeMesh(main), tubeMesh(branch));

const surfaceMat = new THREE.MeshBasicMaterial({ color: 0x7fb8ac, transparent: true, opacity: 0.6, side: THREE.DoubleSide, fog: true });
const surface = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), surfaceMat);
surface.rotation.x = Math.PI / 2;
surface.position.set(0, 0, 6);
scene.add(surface);

// ================= 道具 =================
const canvasTex = (w, h, draw) => {
  const cv = document.createElement('canvas');
  cv.width = w;
  cv.height = h;
  draw(cv.getContext('2d'));
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
};
const signTex = canvasTex(512, 400, (x) => {
  x.fillStyle = '#e8e2cf';
  x.fillRect(0, 0, 512, 400);
  x.strokeStyle = '#7a1d14';
  x.lineWidth = 14;
  x.strokeRect(10, 10, 492, 380);
  x.fillStyle = '#7a1d14';
  x.textAlign = 'center';
  x.font = 'bold 72px sans-serif';
  x.fillText('停！', 256, 92);
  // 手画的骷髅：歪一点的头骨、两个眼洞、鼻孔、一排牙、交叉的骨头
  x.save();
  x.translate(256, 178);
  x.rotate(-0.06);
  x.lineCap = 'round';
  x.lineWidth = 12;
  x.beginPath();
  x.moveTo(-62, 52);
  x.lineTo(62, -30);
  x.moveTo(-62, -30);
  x.lineTo(60, 54);
  x.stroke();
  x.fillStyle = '#2a201b';
  x.beginPath();
  x.moveTo(-40, 10);
  x.bezierCurveTo(-52, -52, 46, -60, 42, 4);
  x.lineTo(30, 22);
  x.lineTo(28, 40);
  x.lineTo(-24, 42);
  x.lineTo(-28, 24);
  x.closePath();
  x.fill();
  x.fillStyle = '#e8e2cf';
  x.beginPath();
  x.ellipse(-17, -6, 12, 14, 0.3, 0, Math.PI * 2);
  x.ellipse(18, -8, 11, 13, -0.2, 0, Math.PI * 2);
  x.fill();
  x.beginPath();
  x.moveTo(0, 8);
  x.lineTo(-6, 20);
  x.lineTo(6, 19);
  x.closePath();
  x.fill();
  x.lineWidth = 3;
  x.strokeStyle = '#e8e2cf';
  for (const tx of [-14, -4, 6, 16]) {
    x.beginPath();
    x.moveTo(tx, 28);
    x.lineTo(tx + 1, 40);
    x.stroke();
  }
  x.restore();
  x.fillStyle = '#7a1d14';
  x.font = 'bold 44px sans-serif';
  x.fillText('不要进入。', 256, 296);
  x.fillStyle = '#222';
  x.font = 'bold 36px sans-serif';
  x.fillText('这里已经死过人。', 256, 352);
});
const sign = new THREE.Group();
{
  const g = main.atS(7);
  const board = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.86), new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.8, side: THREE.DoubleSide }));
  board.position.y = 0.9;
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.9), new THREE.MeshStandardMaterial({ color: 0x5a4a3a }));
  post.position.y = 0.45;
  sign.add(board, post);
  sign.position.copy(g.c).addScaledVector(g.up, -g.fh).addScaledVector(g.side, 0.5);
  sign.lookAt(sign.position.clone().sub(g.tg).setY(sign.position.y));
  scene.add(sign);
}
const PEG = V3(1.8, -2.8, -2.2);
{
  const peg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.6), new THREE.MeshStandardMaterial({ color: 0x8a8070 }));
  peg.position.copy(PEG);
  const tag = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.02, 6, 14), new THREE.MeshBasicMaterial({ color: 0xf0ece0 }));
  tag.position.copy(PEG).add(V3(0, 0.25, 0));
  tag.rotation.x = Math.PI / 2;
  scene.add(peg, tag);
}
const CAM_POS = (() => {
  const g = main.atS(main.len - 5.5);
  return g.c.clone().addScaledVector(g.up, -g.fh + 0.05).addScaledVector(g.side, 0.6);
})();
const camProp = new THREE.Group();
const camLed = new THREE.Mesh(new THREE.SphereGeometry(0.015, 8, 6), new THREE.MeshBasicMaterial({ color: 0xff2a1a }));
const camGlow = new THREE.PointLight(0xff3020, 0.6, 2.5, 2);
{
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.085, 0.06), new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.4 }));
  const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.02, 16), new THREE.MeshStandardMaterial({ color: 0x050505, metalness: 0.6, roughness: 0.2 }));
  lens.rotation.x = Math.PI / 2;
  lens.position.set(0.025, 0, 0.035);
  camLed.position.set(-0.04, 0.03, 0.031);
  camGlow.position.set(0, 0.1, 0);
  camProp.add(body, lens, camLed, camGlow);
  camProp.position.copy(CAM_POS);
  camProp.rotation.set(0.2, 0.8, 0.15);
  scene.add(camProp);
}
// 一段断掉的旧导线和一只遗落的脚蹼，挂在岔口附近
{
  const g = main.atS(main.atS(1).s + 34);
  const pts = [];
  for (let i = 0; i < 9; i++) pts.push(g.c.clone().addScaledVector(g.side, -1 + i * 0.25).addScaledVector(g.up, -g.fh + 0.2 + Math.sin(i) * 0.15).addScaledVector(g.tg, i * 0.4));
  scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0x8c8574 })));
  const fin = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.02, 0.55), new THREE.MeshStandardMaterial({ color: 0x1f2b33 }));
  const h = main.atS(main.len - 9);
  fin.position.copy(h.c).addScaledVector(h.up, -h.fh + 0.02).addScaledVector(h.side, -0.9);
  fin.rotation.y = 0.7;
  scene.add(fin);
}
