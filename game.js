(() => {
const THREE = globalThis.THREE_LIB;

// ================= 内容 =================
const POEM = [
  '喝了点酒，临时起意，没有经验，看看而已。',
  '呼朋引伴，约好日期，趁着夜色，绕过封闭。',
  '看完洞口，心生一计，裸装下潜，探索奥秘。',
  '无洞潜证，没啥问题，缺乏经验？不必在意。',
  '初入洞穴，啧啧称奇，水下世界，实乃瑰丽。',
  '怪石嶙峋，景色奇异，越往深走，越是入迷。',
  '队友害怕，回岸休息，其余人员，继续进击。',
  '深度增加，过程顺利，就在此时，出现危机。',
  '扬起淤泥，措手不及，顿觉模糊，视野半米。',
  '引绳脱落，队友分离，黯淡无光，心慌神迷。',
  '忽视三分，大口呼吸，忘带备用，氧瓶没气。',
  '氮醉碳血，呼器离体，失去意识，慢慢沉底。',
  '等待未果，减压不及，马上报警，加强封闭。',
  '洞穴位置，实属偏僻，距离市区，数百十里。',
  '国外救援，周末休息，救援赶到，要一星期。',
  '前仆后继，打捞遗体，电脑录像，死亡演绎。',
  '命名洞穴，警示树立，糊上水泥，永久关闭。',
  '群众不满，集体抗议，开放洞穴，迫于压力。',
  '数月之后，无人在意。新人又至，再创佳绩。',
];
// 本关可解锁的诗行（下标），第 19 行要等这六行全部解锁
const OPEN_LINES = [0, 3, 5, 8, 9, 10];
const FINAL_LINE = 18;
const ACH = {
  silt: ['我负责搅动泥沙', '第一次让能见度归零'],
  cameAnyway: ['来都来了', '越过三分之一气体线后继续往里游'],
  badNews: ['传来噩耗', '第一次死亡'],
  mysteryGarden: ['看了半年神秘园', '不越过三分之一气体线、不搅起淤泥，带着相机回来'],
};
const TIPS = [
  '“三分之一气体出，三分之一气体回，三分之一留给意外。”',
  '“不卖烤肠的洞不要潜。”',
  '“入洞必须铺导引绳，第一个结打在洞外。”',
  '“看了半年神秘园，并不会让你强得可怕。”',
  '“至少带三个光源。”',
];
// 弹幕全部摘自 B 站神秘园洞潜视频的真实弹幕（2026-11-27 抓取），已去掉当事人姓名
const DM = {
  start: ['请选择你的英雄', '角色未解锁', '大家好，他是神秘园', '有没有一起洞潜的，我有神秘园50集观看经验', '我看了六十多集，还能不知道？', '看神秘园学的（doge）', '远程教学：看神秘园视频学习', '来科研的？那我得坐起来看', '神秘园大厅正在匹配威胁对手中', '不出意外的话要出意外了'],
  hell: ['临 时 起 意', '我负责临时起意', '临时起意²', '匹配到对手：临时起意', '太漂亮了，我要临时起意了（', '临时起意，来都来了，不出意外', '我滴妈超级无敌级别的临时起意……', 'buff：临时起意', 'debuff：二手装备', '在转转买的二手货出问题了'],
  untied: ['buff1：不带引绳', '我负责忘带牵引绳', '我负责不带引导绳', '要是带引绳的话就没有这期视频了', '没有引绳，洞里转几圈就不知道方向了！这也是洞潜容易出事的原因之一', 'buff:没有引绳'],
  enter: ['新地图解锁', '发现了新的区域哦', '哇，还有未解锁区域！', '初极狭，才通人', '复行数十步，豁然开朗', '到达神秘园区域', '然后进入了神秘园', '我靠，这么窄？', '幽闭恐惧症的我已经窒息了', '天呐，真是胆大，这么小的口也敢钻'],
  sign: ['这不放个死神警示牌', '经典死神', '休想将我们拒之门外', '《休想把我们拒之门外》', '停下来！这将使你免于死亡！不要再继续走下去了！', '看到石头上的神秘园还不跑', '《洞潜爱好者的天堂》', '《潜水爱好者的天堂》'],
  branch: ['这个洞可太适合岔路了', '我光看平面图就已经迷路了', '前有隐藏道路', '发现隐藏副本', '后面的区域以后再来探索吧（）', '管理方：前面的区域以后再来探索吧'],
  third: ['buff4：未遵循三分法则', '经典违反"三分法则"', 'buff: 违背三分法则（1/1）', '《0分法则》', '来都来了', '主线轮：第一次警告', '时间差不多了哦', '死神：时间确实不够了，这你都发现了'],
  silt: ['我负责搅动泥沙', '触发关键事件：搅动泥沙', '搅动泥沙！扬起浮尘！', '我负责搅起泥沙.jpg', '淤泥……视野可能丧失警告', 'buff3:狭窄且淤泥多', 'debuff：无引导绳＋视野不清楚', '提醒：你可以呼吸，不用怕气泡淤泥'],
  flutter: ['有没有可能是他游太快把泥土拌起来，能见度降低了，然后。。。。', '第四个是 不要游太快', '不慌不忙反而没事', '就是太自信了 又要游的比别人快'],
  settle: ['泥沙沉积，运动停息~', '其实此时冷静并保持静止悬浮才是正确的选择'],
  back: ['倒踢是潜水踢法里最难的，所有入门的技术潜水课都会教'],
  panic: ['我 负 责 惊 慌 失 措', 'buff5：惊慌失措', 'buff8：情绪紧张', '快放我上去，求你了，快放我上去', '放我出去我不要在这！', '黑漆漆的多吓人啊，你知道这水里突然出来个什么东西啊！', '被水淹没，不知所措'],
  lowgas: ['buff4：能省则省', '传奇省钱王', '《钱花在刀刃上》', 'buff2：没有带备用气瓶', '时间差不多了哦'],
  camera: ['相机都知道留冗余', '全身上下质量最好的是相机', '哎呀，相机得了MVP！（doge）', '发现关键道具'],
  ambient: ['这洞穴好像一具古兽遗骸的头啊', '像一个怪物伸出来的舌头', '干这一行就是需要绝对理性啊', '越是专业强大越是谨慎有自知之明', '步步为营这才是专业', '专业就是谨慎', '看神秘园就是减压！', '《潜水员戴夫》启动！', '敬畏生命！家人还在等你回家', '那这时候就要快出现意外了', '石头上为什么会有神秘园三个字（doge'],
  win: ['洞潜区传来喜讯', '洞潜圈传来喜讯', '罕见的好结局，洞潜区传来喜讯', '叮！恭喜获得成就：活着上神秘园', '少有上神秘园还活着的', '能在神秘园视频里活着，奇迹了', '恭喜触发好结局', '好结局：有惊无险', '搜救员：最轻松的一集', '活因：怕死', '别怀疑你的怕死机制'],
  abort: ['活因：掉头回去', '最正确的决定', '理智的决定', '终于做了一个正确的决定', '谨慎在未知情况下总是不错的', '活因:对自己实力有正确的认识', '最明智的一集'],
  die: ['洞潜区传来噩耗', '洞潜圈传来噩耗', '洞潜圈再次传来噩耗', 'MC洞潜圈传来噩耗', '这才是世界上最绝望的死法', '依旧英雄未解锁', '《英灵殿》', '这里已经满员了', '奖池还在累积', '高估了自己，低估了队友。', '这下知道怎么出的事了', '《下期预告》', '不想成为素材，谢谢', '潜水还是太危险了，我还是决定去走鳌太线了'],
};
const RECAP_TITLES = {
  win: ['生还 · 带回相机', '1人洞穴潜水，带着相机回来了'],
  gas: ['死亡 · 耗尽气体', '1人洞穴潜水，独自进入，再也没有出来'],
  panic: ['死亡 · 恐慌', '1人洞穴潜水，独自进入，再也没有出来'],
  abort: ['生还 · 未带回相机', '1人洞穴潜水，空手回来了'],
};
const BRIEF = [
  '<b>三米湖。</b>',
  '拍照狂队友阿杰上周在洞里弄丢了一台运动相机，就在主通道尽头约60米处。你一个人去取。',
  '<small style="color:#d9614c">独潜违反规则。你知道的。</small>',
  '<b>气瓶：</b>200 bar · <b>三分之一掉头线：</b>133 bar',
];
const HELL_BRIEF = '<b style="color:#d9614c">「趁着夜色，绕过封闭。」</b>';

// ================= 工具 =================
const $ = (s) => document.querySelector(s);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const fmtTime = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const hash3 = (x, y, z) => {
  const h = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  return h - Math.floor(h);
};
const smooth = (t) => t * t * (3 - 2 * t);
const vnoise = (x, y, z) => {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = smooth(x - xi), yf = smooth(y - yi), zf = smooth(z - zi);
  const c = (dx, dy, dz) => hash3(xi + dx, yi + dy, zi + dz);
  const x00 = lerp(c(0, 0, 0), c(1, 0, 0), xf), x10 = lerp(c(0, 1, 0), c(1, 1, 0), xf);
  const x01 = lerp(c(0, 0, 1), c(1, 0, 1), xf), x11 = lerp(c(0, 1, 1), c(1, 1, 1), xf);
  return lerp(lerp(x00, x10, yf), lerp(x01, x11, yf), zf);
};
const fbm = (x, y, z) => vnoise(x, y, z) * 0.6 + vnoise(x * 2.1, y * 2.1, z * 2.1) * 0.28 + vnoise(x * 4.7, y * 4.7, z * 4.7) * 0.12;

const store = {
  get(k, d) {
    try {
      const v = localStorage.getItem(`jdns_${k}`);
      return v == null ? d : JSON.parse(v);
    } catch {
      return d;
    }
  },
  set(k, v) {
    try {
      localStorage.setItem(`jdns_${k}`, JSON.stringify(v));
    } catch {
      /* 沙盒中无存储，忽略 */
    }
  },
};
const save = {
  lines: store.get('lines2', []),
  ach: store.get('ach2', {}),
  danmaku: store.get('danmaku2', false),
};
const persist = () => {
  store.set('lines2', save.lines);
  store.set('ach2', save.ach);
  store.set('danmaku2', save.danmaku);
};
const V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const UP = V3(0, 1, 0);


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


// ================= 潜水状态 =================
const P = { pos: V3(0, -1.5, 9), vel: V3(), yaw: 0, pitch: -0.12 };
const keys = new Set();
let mode = 'title';
let hellNext = false;
let G = null;

const newDive = (hell) => {
  const gasMax = 200;
  return {
    hell, gasMax, gas: gasMax, t: 0, hr: hell ? 82 : 72, fear: 0, panicT: 0, outT: 0,
    kick: 'frog', torch: true, hasCam: false, entered: false, enteredUntied: false, pastSign: false,
    breath: { t: 0, inPhase: false, dur: 1 }, beatT: 0, holding: false,
    vis: 20, dens: 0, zeroVis: false, region: 'lake', s: 0, pen: 0, siltAcc: 0,
    flick: 0, flickT: 4, dmT: 6, creakT: 12, lastBump: -9, msgT: 0, hudT: 0, warned: {},
    // third：气体第一次跌破三分之二（用掉三分之一）时还没拿到相机，记下时间、位置和深入距离
    third: null, pastThird: 0, lastFlutterSilt: -9,
    stats: { silt: 0, zeroCount: 0, flutterSilt: 0, offLine: 0, lostDist: 0, hrMax: 72, bumps: 0, wrong: false, maxS: 0, lineMax: 0, maxDepth: 0 },
    path: [], siltMarks: [], pathT: 0, newLines: [], end: null,
  };
};
// 深入距离：沿主通道或支洞从洞口量起
const JUNC_S = main.local(V3(-3, CAVE_Y, -35)).g.s;
const penOf = (loc) => (loc.name === 'main' ? loc.s : loc.name === 'branch' ? JUNC_S + loc.s : 0);
const fmtCn = (s) => `${Math.floor(s / 60)}分${Math.floor(s % 60)}秒`;
const lineDist = () => (guide.tied ? guide.nearest(P.pos)?.d ?? 0 : Infinity);

const forward = () => V3(-Math.sin(P.yaw) * Math.cos(P.pitch), Math.sin(P.pitch), -Math.cos(P.yaw) * Math.cos(P.pitch));
const rightV = () => V3(Math.cos(P.yaw), 0, -Math.sin(P.yaw));

const locate = (p) => {
  for (const v of [main, branch]) {
    if (v.contains(p, -0.4)) {
      const { g } = v.local(p);
      return { vol: v, name: v.name, s: g.s };
    }
  }
  return { vol: lake, name: 'lake', s: 0 };
};

const collide = () => {
  let best = null;
  for (const v of volumes) {
    const r = v.resolve(P.pos, 0.32);
    if (r.inside) return null;
    if (!best || r.d < best.d) best = r;
  }
  P.pos.copy(best.p);
  return best;
};

const lineOpen = (i) => save.lines.includes(i);
const unlockLine = (i) => {
  if (lineOpen(i)) return;
  save.lines.push(i);
  G?.newLines.push(i);
  persist();
  toast('死法图鉴', `第 ${i + 1} 行`, POEM[i]);
  if (i !== FINAL_LINE && OPEN_LINES.every(lineOpen)) unlockLine(FINAL_LINE);
};

const startDive = (hell) => {
  G = newDive(hell);
  P.pos.set(0, -1.4, 9);
  P.vel.set(0, 0, 0);
  P.yaw = 0;
  P.pitch = -0.18;
  silt.clear();
  guide.reset();
  camProp.visible = true;
  showScreen(null);
  $('#hud').classList.add('on');
  $('#fade').style.opacity = 0;
  mode = 'play';
  sound.suspend(false);
  lock();
  if (hell) unlockLine(0);
  dm(hell ? 'hell' : 'start');
  msg(hell ? '喝了点酒，临时起意。头灯在闪。' : '三米湖。洞口在湖底尽头。先找到洞口旁的桩，系好导线（E）。', 6);
};

const pickCamera = () => {
  G.hasCam = true;
  camProp.visible = false;
  G.fear += 18;
  sound.ping();
  msg('阿杰的相机，红灯还亮着。现在，回去。', 6);
  dm('camera');
};

const onAction = () => {
  if (!guide.tied && P.pos.distanceTo(PEG) < 2.4) {
    guide.tie();
    sound.ping();
    msg('导线已系好。线轮会随你放线，回头时自动收线。', 4);
  } else if (!G.hasCam && P.pos.distanceTo(CAM_POS) < 1.9) {
    pickCamera();
  }
};

const endDive = (kind) => {
  if (mode !== 'play') return;
  mode = 'end';
  G.end = { kind, pos: P.pos.clone() };
  const alive = kind === 'win' || kind === 'abort';
  if (alive) {
    if (kind === 'win' && G.pastThird < 2 && G.stats.zeroCount === 0) ach('mysteryGarden');
  } else {
    const dist = lineDist();
    G.end.lineDist = dist;
    const far = guide.tied && dist > 5;
    const blind = G.vis < 1.6;
    if (far) G.stats.lostDist = Math.max(G.stats.lostDist, dist);
    if (!guide.tied) unlockLine(3);
    if (G.third && G.pastThird >= 10) unlockLine(5);
    if (kind === 'gas') {
      unlockLine(10);
      if (blind) unlockLine(8);
      if (far) unlockLine(9);
    } else if (far) unlockLine(9);
    else if (blind) unlockLine(8);
    ach('badNews');
  }
  dm(kind === 'win' ? 'win' : kind === 'abort' ? 'abort' : 'die', true);
  $('#gauge').classList.remove('on');
  if (document.pointerLockElement) document.exitPointerLock();
  $('#fade').style.opacity = 1;
  setTimeout(() => {
    sound.suspend(true);
    $('#hud').classList.remove('on');
    showRecap();
  }, 1600);
};

// ================= 每帧模拟 =================
const update = (dt) => {
  G.t += dt;
  const turn = 1.6 * dt;
  if (keys.has('ArrowLeft')) P.yaw += turn;
  if (keys.has('ArrowRight')) P.yaw -= turn;
  if (keys.has('ArrowUp')) P.pitch += turn * 0.7;
  if (keys.has('ArrowDown')) P.pitch -= turn * 0.7;
  P.pitch = clamp(P.pitch, -1.45, 1.45);

  const slow = keys.has('KeyR');
  const f = forward();
  const fwd = keys.has('KeyW') ? 1 : 0;
  const back = keys.has('KeyS') && !fwd;
  const heli = (keys.has('KeyA') ? 1 : 0) - (keys.has('KeyD') ? 1 : 0);
  const vert = (keys.has('Space') ? 1 : 0) - (keys.has('KeyC') ? 1 : 0);
  // 踢法：W 蛙踢（默认）；按住 Shift 剪踢冲刺；S 倒踢；A/D 直升机转身（原地转向，不前进）
  const flutter = fwd && (keys.has('ShiftLeft') || keys.has('ShiftRight'));
  G.kick = flutter ? 'flutter' : fwd ? 'frog' : back ? 'back' : heli ? 'heli' : vert ? 'frog' : 'glide';
  if (heli && !G.holding) P.yaw += heli * 1.2 * dt;
  const move = V3()
    .addScaledVector(f, fwd)
    .addScaledVector(V3(f.x, 0, f.z).normalize(), back ? -1 : 0)
    .addScaledVector(UP, vert * 0.7);
  const kicking = move.lengthSq() > 0.01;
  if (kicking) move.normalize();
  const maxV = (flutter ? 1.6 : back ? 0.45 : 1.0) * (slow ? 0.6 : 1) * (G.gas <= 0 ? 1.2 : 1);
  const accel = flutter ? 3.2 : back ? 1.2 : 2.2;

  // 摸线
  G.holding = false;
  if (keys.has('KeyQ') && guide.tied) {
    const near = guide.nearest(P.pos);
    if (near && near.d < 1.4) {
      G.holding = true;
      const Pl = guide.poly();
      const dirExit = V3().subVectors(Pl[near.k], Pl[near.k + 1]).normalize();
      const w = (keys.has('KeyW') ? 1 : 0) - (keys.has('KeyS') ? 1 : 0);
      const atStart = near.k === 0 && near.t < 0.02 && w > 0;
      const want = atStart ? V3() : dirExit.multiplyScalar(w * 0.85);
      want.add(near.q.clone().add(V3(0, 0.35, 0)).sub(P.pos).multiplyScalar(1.6));
      P.vel.lerp(want, 1 - Math.exp(-dt * 4));
    }
  }
  if (!G.holding) {
    P.vel.addScaledVector(move, accel * dt);
    // 蛙踢一下滑一段：不踢的时候阻力小，能滑行
    P.vel.multiplyScalar(Math.exp(-dt * (kicking ? 1.6 : 0.9)));
    if (P.vel.length() > maxV) P.vel.setLength(lerp(P.vel.length(), maxV, 0.2));
  }
  P.pos.addScaledVector(P.vel, dt);
  const hit = collide();
  if (hit) {
    const sp = P.vel.length();
    P.vel.multiplyScalar(0.55);
    if (sp > 0.5 && G.t - G.lastBump > 0.9) {
      G.lastBump = G.t;
      G.stats.bumps++;
      G.fear += 7;
      sound.bump();
      silt.spawn(P.pos, 0.6, 0.6, Math.round(30 * sp * (G.hell ? 2 : 1)));
      G.stats.silt += 30 * sp;
    }
  }

  // 位置与事件
  const loc = locate(P.pos);
  G.region = loc.name;
  G.s = loc.s;
  const depth = Math.max(0, -P.pos.y);
  G.stats.maxDepth = Math.max(G.stats.maxDepth, depth);
  if (loc.name === 'main') {
    G.stats.maxS = Math.max(G.stats.maxS, loc.s);
    if (!G.entered && loc.s > 4) {
      G.entered = true;
      if (!guide.tied) { G.enteredUntied = true; msg('你没有系导线就进了洞。', 4); dm('untied'); }
      else dm('enter');
    }
    if (!G.pastSign && loc.s > 9) {
      G.pastSign = true;
      dm('sign');
    }
  }
  G.pen = penOf(loc);
  if (G.third) {
    const further = G.pen - G.third.pen;
    if (further > G.pastThird) G.pastThird = further;
    if (G.pastThird > 3) ach('cameAnyway');
  }
  if (loc.name === 'branch' && loc.s > 5 && !G.stats.wrong) { G.stats.wrong = true; dm('branch'); }
  if (G.kick === 'back' && !G.warned.back) { G.warned.back = true; dm('back'); }
  if (loc.name === 'lake' && P.pos.y > -0.5 && keys.has('Space')) {
    if (G.entered) { endDive(G.hasCam ? 'win' : 'abort'); return; }
    if (!G.warned.surf) { G.warned.surf = true; msg('还没进洞。洞口在湖底尽头，警示牌后面。', 4); }
  }

  // 扬起泥沙
  // 碎石段提示（只提示一次）
  const onRock = isRock(loc.name, loc.s);
  if (onRock && !G.warned.rock) { G.warned.rock = true; msg('脚下变成了碎石。这里剪踢不会扬起泥沙。', 4); }
  if (!onRock && G.warned.rock && !G.warned.rockEnd && loc.name === 'main' && loc.s >= ROCK_ZONE[1]) { G.warned.rockEnd = true; msg('碎石到头了，前面又是淤泥。', 3.5); }

  // 倒踢和直升机转身的推力不朝下，不扬泥
  if (kicking && !G.holding && !back) {
    const fin = P.pos.clone().addScaledVector(V3(f.x, 0, f.z).normalize(), -0.7).add(V3(0, -0.45, 0));
    const fd = Math.max(0, loc.vol.floorDist(fin));
    const range = flutter ? 1.8 : 0.55;
    if (fd < range) {
      const rate = (flutter ? 60 : 12) * floorSilt(loc) * (1 - fd / range) * clamp(P.vel.length() / maxV, 0.2, 1) * (G.hell ? 2.2 : 1);
      G.siltAcc += rate * dt;
      const n = Math.floor(G.siltAcc);
      if (n > 0) {
        G.siltAcc -= n;
        G.stats.silt += n;
        // 剪踢每一阵（间隔 2 秒以上）搅起淤泥记一次
        if (flutter && n >= 1 && floorSilt(loc) === 1) {
          if (G.t - G.lastFlutterSilt > 2) { G.stats.flutterSilt++; if (G.stats.flutterSilt === 1) dm('flutter'); }
          G.lastFlutterSilt = G.t;
        }
        silt.spawn(fin.clone().add(V3(0, -fd, 0)), 0.5, flutter ? 0.8 : 0.4, n);
      }
    }
  }
  const { dens } = silt.update(dt, P.pos, P.vel);
  G.dens = dens;
  const baseVis = loc.name === 'lake' ? 15 : G.hell ? 16 : 22;
  G.vis = baseVis / (1 + dens * 0.55);
  if (G.vis < 0.8 && !G.zeroVis) {
    G.zeroVis = true;
    G.stats.zeroCount++;
    G.siltMarks.push(P.pos.clone());
    ach('silt');
    dm('silt');
    if (!G.warned.zero) { G.warned.zero = true; msg('能见度归零。按住 Q 摸线，W 沿线朝出口。', 5); }
  } else if (G.vis > 1.6 && G.zeroVis) { G.zeroVis = false; dm('settle'); }
  if (G.zeroVis && !G.holding && G.entered) {
    G.stats.offLine += dt;
    if (guide.tied) G.stats.lostDist = Math.max(G.stats.lostDist, lineDist());
  }

  // 头灯与光线
  let ti = 26;
  if (G.hell) {
    G.flickT -= dt;
    if (G.flickT < 0) { G.flick = rand(0.3, 1.8); G.flickT = rand(5, 14); }
    if (G.flick > 0) { G.flick -= dt; ti *= Math.random() < 0.5 ? 0.03 : rand(0.2, 0.8); }
  }
  torch.visible = G.torch;
  fill.visible = G.torch;
  torch.intensity = ti;
  const dayF = loc.name === 'lake' ? 1 : loc.name === 'main' ? Math.exp(-loc.s / 6) : 0;
  applyAtmos(dayF, dens, G.torch ? ti / 26 : 0, G.vis);

  // 气体
  const effort = clamp(P.vel.length() / 1.6, 0, 1) * (flutter ? 1.3 : back ? 0.6 : 1) + (heli ? 0.1 : 0);
  if (G.gas > 0) {
    const rate = 0.3 * (G.hell ? 1.25 : 1) * (1 + depth / 10) * (1 + effort * 0.5) * (G.hr / 72) ** 1.3 * (slow ? 0.8 : 1);
    G.gas = Math.max(0, G.gas - rate * dt);
    const fr = G.gas / G.gasMax;
    if (fr < 2 / 3 && !G.warned.third) {
      G.warned.third = true;
      if (!G.hasCam && G.entered) {
        G.third = { t: G.t, pos: P.pos.clone(), pen: G.pen };
        msg('你已经用掉三分之一的气。按规则，现在该掉头了。', 5);
        dm('third');
      }
    }
    if (fr < 1 / 6 && !G.warned.crit) { G.warned.crit = true; msg('气不多了。', 3); dm('lowgas'); }
    if (G.gas === 0) msg('吸不动了。呼吸器里只剩下金属的味道。上去！', 6);
  } else {
    G.outT += dt;
    if (G.outT > 18) { endDive('gas'); return; }
  }

  // 心率
  G.fear *= Math.exp(-dt / 7);
  let tgt = 72 + (G.hell ? 10 : 0) + effort * 16 + G.fear;
  if (G.vis < 3) tgt += (3 - G.vis) * 12;
  if (G.zeroVis && !G.holding) tgt += 24;
  const fr = G.gas / G.gasMax;
  if (fr < 1 / 3) tgt += 16;
  if (fr < 1 / 6) tgt += 24;
  if (G.gas <= 0) tgt += 70;
  if (!G.torch && dayF < 0.2) tgt += 12;
  if (slow) tgt = Math.max(56, tgt - 42);
  const k = tgt > G.hr ? 0.3 : slow ? 0.22 : 0.07;
  G.hr += (tgt - G.hr) * k * dt;
  G.stats.hrMax = Math.max(G.stats.hrMax, Math.round(G.hr));
  const panic = clamp((G.hr - 115) / 65, 0, 1);
  if (G.hr > 150 && !G.warned.panic) { G.warned.panic = true; msg('心跳太快了。按住 R，四下吸，六下呼。', 5); dm('panic'); }
  if (G.hr < 130) G.warned.panic = false;
  G.panicT = G.hr > 176 ? G.panicT + dt : Math.max(0, G.panicT - dt * 0.6);
  if (G.panicT > 5 && !G.warned.lose) { G.warned.lose = true; msg('你快要失控了——按住 R！', 4); }
  if (G.panicT < 2) G.warned.lose = false;
  if (G.panicT > 12) { endDive('panic'); return; }

  // 呼吸与心跳
  const b = G.breath;
  b.t -= dt;
  if (b.t <= 0) {
    if (G.gas <= 0) {
      sound.inhale(0.3, true);
      b.t = 1.1;
    } else {
      const bpm = slow ? 6 : 11 + panic * 22 + effort * 5;
      const period = 60 / bpm;
      b.inPhase = !b.inPhase;
      b.dur = period * (b.inPhase ? 0.4 : 0.6);
      b.t = b.dur;
      if (b.inPhase) sound.inhale(b.dur * 0.9, false);
      else sound.exhale(b.dur * 0.85);
    }
  }
  G.beatT += (dt * G.hr) / 60;
  if (G.beatT >= 1) {
    G.beatT -= 1;
    sound.beat(clamp((G.hr - 78) / 70, 0, 1) * 0.9 + 0.04);
    $('#redpulse').style.opacity = panic * 0.55;
  } else {
    const rp = $('#redpulse');
    rp.style.opacity = Math.max(0, parseFloat(rp.style.opacity || 0) - dt * 2);
  }
  $('#vignette').style.opacity = 0.45 + panic * 0.5 + (G.gas <= 0 ? G.outT / 20 : 0);

  // 杂项
  guide.update(P.pos);
  if (guide.tied) G.stats.lineMax = Math.max(G.stats.lineMax, guide.length());
  G.pathT -= dt;
  if (G.pathT <= 0) { G.pathT = 0.5; G.path.push(P.pos.clone()); }
  G.dmT -= dt;
  if (G.dmT <= 0) { G.dmT = rand(9, 16); dm('ambient'); }
  G.creakT -= dt;
  if (G.creakT <= 0 && G.entered) { G.creakT = rand(14, 30); sound.creak(); }
  sound.setDrone(0.15 + (1 - dayF) * 0.25);

  // 摄像机
  const shake = panic * 0.012 + (G.gas <= 0 ? 0.01 : 0);
  const bob = Math.sin(G.t * 2 * Math.PI * 0.2) * 0.02;
  camera.position.copy(P.pos).add(V3(0, bob, 0));
  camera.rotation.set(P.pitch + rand(-shake, shake), P.yaw + rand(-shake, shake), 0);
  camLed.visible = Math.sin(G.t * 6) > 0;
  updateHud(dt, slow);
};

const applyAtmos = (dayF, dens, torchF, vis) => {
  const base = FOG_CAVE.clone().lerp(FOG_LAKE, dayF);
  const sf = clamp(dens / 30, 0, 1) * (0.25 + torchF * 0.75);
  scene.fog.color.copy(base).lerp(FOG_SILT, sf * (1 - dayF * 0.4));
  scene.fog.density = clamp(1.75 / vis, 0.05, 3.5);
  hemi.intensity = 0.015 + 1.3 * dayF;
  surface.visible = dayF > 0.05;
  silt.mat.uniforms.uTorch.value = torchF;
  silt.mat.uniforms.uDay.value = dayF;
  $('#whiteout').style.opacity = clamp((dens - 4) / 45, 0, 0.8) * (0.2 + torchF * 0.8);
};


// ================= 界面 =================
let screenNow = 'title';
let codexFrom = 'title';
const showScreen = (id) => {
  for (const s of document.querySelectorAll('.screen')) s.classList.toggle('on', s.id === id);
  screenNow = id;
};

const msg = (text, dur = 4) => {
  const el = $('#msg');
  el.textContent = text;
  el.style.opacity = 1;
  if (G) G.msgT = dur;
};

const toast = (k, title, sub = '') => {
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `<div class="k">${k}</div>${title}${sub ? `<small>${sub}</small>` : ''}`;
  $('#toasts').append(el);
  setTimeout(() => el.remove(), 4200);
};

const ach = (id) => {
  if (save.ach[id] || !ACH[id]) return;
  save.ach[id] = Date.now();
  persist();
  const [name, desc] = ACH[id];
  toast('成就解锁', name, desc);
};

const dmLast = {};
let dmLane = 0;
const dm = (cat, force = false) => {
  if (!save.danmaku || (mode !== 'play' && !force)) return;
  const now = performance.now();
  if (!force && now - (dmLast[cat] ?? -1e9) < 3500) return;
  dmLast[cat] = now;
  const pool = [...(DM[cat] ?? [])].sort(() => Math.random() - 0.5);
  const count = Math.min(pool.length, cat === 'ambient' ? 1 : 2 + Math.floor(Math.random() * 2));
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'dm';
    el.textContent = pool[i];
    dmLane = (dmLane + 1 + Math.floor(Math.random() * 3)) % 7;
    el.style.top = `${dmLane * 14}%`;
    $('#danmaku').append(el);
    const w = el.offsetWidth;
    const anim = el.animate([{ transform: 'translateX(0)' }, { transform: `translateX(${-(window.innerWidth + w + 40)}px)` }], {
      duration: rand(7000, 10000),
      delay: i * rand(300, 900),
      easing: 'linear',
    });
    anim.onfinish = () => el.remove();
  }
};
const setDanmaku = (on) => {
  save.danmaku = on;
  persist();
  for (const b of document.querySelectorAll('.dmbtn')) b.textContent = `弹幕：${on ? '开' : '关'}`;
  if (!on) $('#danmaku').replaceChildren();
};

const updateHud = (dt, slow) => {
  G.msgT -= dt;
  if (G.msgT <= 0) $('#msg').style.opacity = 0;
  $('#hand').style.display = G.holding ? 'block' : 'none';
  let pr = '';
  if (!guide.tied && P.pos.distanceTo(PEG) < 2.4) pr = '按 E 在桩上系导线';
  else if (!G.hasCam && P.pos.distanceTo(CAM_POS) < 1.9) pr = '按 E 拾起相机';
  else if (keys.has('KeyQ') && !G.holding) pr = guide.tied ? '摸不到线……' : '你没有导线可摸';
  const pe = $('#prompt');
  pe.textContent = pr;
  pe.style.display = pr ? 'block' : 'none';
  if ($('#gauge').classList.contains('on')) drawGauge();
  G.hudT -= dt;
  if (G.hudT > 0) return;
  G.hudT = 0.25;
  const line = guide.tied ? `导线 <b>${Math.round(guide.length())} m</b>` : '导线 <b>未系</b>';
  $('#status').innerHTML = [
    `<b>${KICK_NAMES[G.kick] ?? '滑行'}</b>`,
    `头灯 <b>${G.torch ? '开' : '关'}</b> <span>(L)</span>`,
    line,
    G.hasCam ? '<b>相机已取</b>' : '',
    slow ? '<b>慢呼吸……四进，六出</b>' : '',
    G.hell ? '<b style="color:#d9614c">地狱模式</b>' : '',
  ].filter(Boolean).join('<br>');
};

const KICK_NAMES = { frog: '蛙踢', flutter: '剪踢冲刺', back: '倒踢', heli: '直升机转身', glide: '滑行' };

const drawGauge = () => {
  const cv = $('#spg');
  const x = cv.getContext('2d');
  const W = cv.width;
  const c = W / 2;
  const R = 92;
  const max = 300;
  const ang = (v) => Math.PI * 0.75 + (v / max) * Math.PI * 1.5;
  x.clearRect(0, 0, W, W);
  x.fillStyle = '#e9e4d8';
  x.beginPath();
  x.arc(c, c, R + 10, 0, Math.PI * 2);
  x.fill();
  x.lineWidth = 10;
  x.strokeStyle = '#c0392b';
  x.beginPath();
  x.arc(c, c, R - 8, ang(0), ang(50));
  x.stroke();
  x.strokeStyle = '#d08a2a';
  x.beginPath();
  x.arc(c, c, R - 8, ang((G.gasMax * 2) / 3) - 0.02, ang((G.gasMax * 2) / 3) + 0.02);
  x.stroke();
  x.fillStyle = '#111';
  x.strokeStyle = '#111';
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  x.font = '13px sans-serif';
  for (let v = 0; v <= max; v += 25) {
    const a = ang(v);
    const big = v % 50 === 0;
    x.lineWidth = big ? 2 : 1;
    x.beginPath();
    x.moveTo(c + Math.cos(a) * (R - (big ? 14 : 8)), c + Math.sin(a) * (R - (big ? 14 : 8)));
    x.lineTo(c + Math.cos(a) * R, c + Math.sin(a) * R);
    x.stroke();
    if (big) x.fillText(v, c + Math.cos(a) * (R - 28), c + Math.sin(a) * (R - 28));
  }
  x.font = '11px sans-serif';
  x.fillText('BAR', c, c + 34);
  x.fillStyle = '#d08a2a';
  x.fillText('掉头', c + Math.cos(ang((G.gasMax * 2) / 3)) * (R - 46), c + Math.sin(ang((G.gasMax * 2) / 3)) * (R - 46));
  const a = ang(G.gas + rand(-0.4, 0.4));
  x.strokeStyle = '#000';
  x.lineWidth = 3;
  x.beginPath();
  x.moveTo(c, c);
  x.lineTo(c + Math.cos(a) * (R - 12), c + Math.sin(a) * (R - 12));
  x.stroke();
  x.beginPath();
  x.arc(c, c, 6, 0, Math.PI * 2);
  x.fill();
  $('#g-depth').textContent = Math.max(0, -P.pos.y).toFixed(1);
  $('#g-time').textContent = fmtTime(G.t);
  $('#g-hr').textContent = Math.round(G.hr);
};

const showBrief = () => {
  $('#brief-h').textContent = hellNext ? '任务简报 · 地狱模式' : '任务简报';
  $('#brief-body').innerHTML = BRIEF.map((p) => `<p>${p}</p>`).join('') + (hellNext ? `<p>${HELL_BRIEF}</p>` : '');
  showScreen('brief');
};

const goTitle = () => {
  mode = 'title';
  G = null;
  $('#hud').classList.remove('on');
  $('#fade').style.opacity = 0;
  $('#danmaku').replaceChildren();
  sound.suspend(true);
  silt.clear();
  guide.reset();
  camProp.visible = true;
  torch.visible = true;
  showScreen('title');
};

const pause = () => {
  if (mode !== 'play') return;
  mode = 'paused';
  keys.clear();
  $('#gauge').classList.remove('on');
  sound.suspend(true);
  showScreen('pause');
};
const resume = () => {
  showScreen(null);
  mode = 'play';
  sound.suspend(false);
  lock();
};

const openCodex = () => {
  codexFrom = screenNow;
  $('#codex-poem').innerHTML = POEM.map((line, i) => {
    if (lineOpen(i)) return `<li>${line}</li>`;
    if (OPEN_LINES.includes(i) || i === FINAL_LINE) return `<li class="lock"><span class="bar" aria-label="未解锁"></span></li>`;
    return '<li class="later">后续关卡解锁</li>';
  }).join('');
  $('#codex-achs').innerHTML = Object.entries(ACH).map(([id, [n, d]]) => `<div class="${save.ach[id] ? 'ok' : ''}">${save.ach[id] ? '★' : '☆'} ${n}<small>${d}</small></div>`).join('');
  showScreen('codex');
};

// ================= 复盘 =================
const mistakes = () => {
  const s = G.stats;
  const out = [];
  if (G.enteredUntied || (G.entered && !guide.tied)) out.push('入洞前没有固定主绳。');
  if (G.third && G.pastThird >= 2) out.push(`在 ${fmtCn(G.third.t)} 越过三分之一气体线，选择继续前进。`);
  if (s.flutterSilt > 0) out.push(`使用剪刀踢搅起淤泥 ${s.flutterSilt} 次。`);
  if (s.lostDist >= 3 && Number.isFinite(s.lostDist)) out.push(`在距离导引绳 ${Math.round(s.lostDist)} 米处迷失方向。`);
  if (s.zeroCount > 0) out.push(`能见度归零 ${s.zeroCount} 次。`);
  if (s.wrong) out.push('游进了左侧的死胡同支洞。');
  if (s.bumps >= 3) out.push(`撞上岩壁 ${s.bumps} 次。`);
  if (G.end.kind === 'gas') out.push(`在 ${fmtCn(G.t)} 气体耗尽。`);
  if (G.end.kind === 'panic') out.push(`在 ${fmtCn(G.t)} 心率 ${s.hrMax}，吐掉了呼吸器。`);
  if (!out.length) out.push('这一次，没有关键失误。');
  return out;
};

const drawMap = () => {
  const cv = $('#map');
  const x = cv.getContext('2d');
  const W = cv.width;
  const H = cv.height;
  x.fillStyle = '#0b100f';
  x.fillRect(0, 0, W, H);
  const allPts = [...main.rings, ...branch.rings].map((g) => g.c);
  const xs = [lake.min.x, lake.max.x, ...allPts.map((p) => p.x)];
  const zs = [lake.min.z, lake.max.z, ...allPts.map((p) => p.z)];
  const [x0, x1, z0, z1] = [Math.min(...xs), Math.max(...xs), Math.min(...zs), Math.max(...zs)];
  // 横向铺开：z 轴映射到画布横向（洞口在右）
  const pad = 40;
  const sc = Math.min((W - pad * 2) / (z1 - z0), (H - pad * 2) / (x1 - x0));
  const ox = (W - (z1 - z0) * sc) / 2;
  const oy = (H - (x1 - x0) * sc) / 2;
  const pt = (p) => [ox + (p.z - z0) * sc, oy + (p.x - x0) * sc];
  x.fillStyle = '#16302b';
  const [lx, ly] = pt(lake.min);
  const [lx2, ly2] = pt(lake.max);
  x.fillRect(lx, ly, lx2 - lx, ly2 - ly);
  x.fillStyle = '#6f9a90';
  x.font = '22px sans-serif';
  x.fillText('三米湖', lx + 14, ly + 30);
  x.lineCap = 'round';
  x.lineJoin = 'round';
  for (const t of [main, branch]) {
    for (let i = 1; i < t.rings.length; i++) {
      const [a, b] = [pt(t.rings[i - 1].c), pt(t.rings[i].c)];
      x.strokeStyle = '#3a4541';
      x.lineWidth = Math.max(4, t.rings[i].r * 1.7 * sc);
      x.beginPath();
      x.moveTo(...a);
      x.lineTo(...b);
      x.stroke();
    }
  }
  const poly = (pts, color, w, dash = []) => {
    if (pts.length < 2) return;
    x.strokeStyle = color;
    x.lineWidth = w;
    x.setLineDash(dash);
    x.beginPath();
    x.moveTo(...pt(pts[0]));
    for (const p of pts.slice(1)) x.lineTo(...pt(p));
    x.stroke();
    x.setLineDash([]);
  };
  poly(guide.all, '#ffffff', 3, [10, 6]);
  poly(G.path, '#e0a24a', 3);
  for (const p of G.siltMarks) {
    x.fillStyle = 'rgba(201,138,90,0.45)';
    x.beginPath();
    x.arc(...pt(p), 16, 0, Math.PI * 2);
    x.fill();
  }
  const mark = (p, ch, color, label) => {
    const [mx, my] = pt(p);
    x.fillStyle = color;
    x.font = '26px sans-serif';
    x.textAlign = 'center';
    x.textBaseline = 'middle';
    x.fillText(ch, mx, my);
    x.font = '18px sans-serif';
    x.fillText(label, mx, my - 24);
    x.textAlign = 'left';
    x.textBaseline = 'alphabetic';
  };
  mark(sign.position, '▲', '#d9614c', '警示牌');
  mark(CAM_POS, '◆', G.hasCam ? '#7fbf8a' : '#ff5a4a', G.hasCam ? '相机（已取）' : '相机');
  mark(PEG, '┃', '#f0ece0', '系线桩');
  if (G.third) mark(G.third.pos, '✕', '#e0a24a', '越过三分之一');
  mark(G.end.pos, '●', G.end.kind === 'win' || G.end.kind === 'abort' ? '#7fbf8a' : '#ff5a4a', G.end.kind === 'win' || G.end.kind === 'abort' ? '出水' : '终点');
};

const showRecap = () => {
  const { kind } = G.end;
  const [k, title] = RECAP_TITLES[kind];
  $('#recap-kind').textContent = `${k}${G.hell ? ' · 地狱模式' : ''}`;
  $('#recap-title').textContent = title;
  const s = G.stats;
  $('#recap-depth').textContent = `${s.maxDepth.toFixed(1)} 米`;
  $('#recap-note').hidden = kind !== 'win';
  const stats = [
    ['潜水时间', fmtTime(G.t)],
    ['剩余气量', `${Math.round(G.gas)} bar`],
    ['最高心率', s.hrMax],
    ['导线最长', `${Math.round(s.lineMax)} m`],
    ['扬起泥沙', Math.round(s.silt)],
  ];
  $('#recap-stats').innerHTML = stats.map(([l, v]) => `<div><b>${v}</b>${l}</div>`).join('');
  $('#recap-mist').innerHTML = mistakes().map((m) => `<li>${m}</li>`).join('');
  const lines = [...G.newLines].sort((a, b) => a - b);
  $('#recap-poem').innerHTML = lines.length ? lines.map((i) => `<li class="new">${POEM[i]}</li>`).join('') : '<li class="lock">这一次没有新的诗行。</li>';
  drawMap();
  showScreen('recap');
};

// ================= 输入 =================
const canvasEl = renderer.domElement;
let locked = false;
let dragLook = false;
let mouseDown = false;
const fallback = () => {
  if (dragLook) return;
  dragLook = true;
  if (NO_GL) return;
  $('#lockhint').style.display = 'block';
  setTimeout(() => { $('#lockhint').style.display = 'none'; }, 7000);
};
const lock = () => {
  if (dragLook) return;
  try {
    const r = canvasEl.requestPointerLock?.();
    r?.catch?.(() => fallback());
    if (!canvasEl.requestPointerLock) fallback();
  } catch {
    fallback();
  }
  setTimeout(() => { if (!locked && mode === 'play') fallback(); }, 800);
};
document.addEventListener('pointerlockchange', () => {
  locked = document.pointerLockElement === canvasEl;
  if (!locked && mode === 'play' && !dragLook) pause();
});
document.addEventListener('pointerlockerror', fallback);
document.addEventListener('mousemove', (e) => {
  if (mode !== 'play' || !(locked || (dragLook && mouseDown))) return;
  P.yaw -= e.movementX * 0.0022;
  P.pitch = clamp(P.pitch - e.movementY * 0.0022, -1.45, 1.45);
});
canvasEl.addEventListener('mousedown', () => {
  mouseDown = true;
  if (mode === 'play' && !locked && !dragLook) lock();
});
window.addEventListener('mouseup', () => { mouseDown = false; });

window.addEventListener('keydown', (e) => {
  if (mode === 'play' && ['Tab', 'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
  if (mode === 'paused' && e.code === 'Escape' && dragLook) { resume(); return; }
  if (mode !== 'play') return;
  if (e.repeat) return;
  keys.add(e.code);
  switch (e.code) {
    case 'Tab': $('#gauge').classList.add('on'); break;
    case 'KeyE': onAction(); break;
    case 'KeyL': G.torch = !G.torch; msg(G.torch ? '头灯开。' : '头灯关。黑暗是完整的。', 2); break;
    case 'KeyB': setDanmaku(!save.danmaku); msg(`弹幕${save.danmaku ? '开' : '关'}`, 1.5); break;
    case 'Escape': if (dragLook || !locked) pause(); break;
    default: break;
  }
});
window.addEventListener('keyup', (e) => {
  keys.delete(e.code);
  if (e.code === 'Tab') $('#gauge').classList.remove('on');
});
window.addEventListener('blur', () => {
  keys.clear();
  $('#gauge').classList.remove('on');
});

document.addEventListener('click', (e) => {
  const act = e.target.closest('[data-act]')?.dataset.act;
  if (!act) return;
  sound.init();
  sound.ctx?.resume();
  switch (act) {
    case 'start': hellNext = $('#hell-chk').checked; showBrief(); break;
    case 'dive': startDive(hellNext); break;
    case 'title': goTitle(); break;
    case 'codex': openCodex(); break;
    case 'back': showScreen(codexFrom); break;
    case 'danmaku': setDanmaku(!save.danmaku); break;
    case 'resume': resume(); break;
    case 'restart': startDive(G?.hell ?? hellNext); break;
    default: break;
  }
});

// ================= 主循环 =================
const setScale = () => {
  silt.mat.uniforms.uScale.value = (window.innerHeight * renderer.getPixelRatio() * 0.5) / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
};
window.addEventListener('resize', setScale);
setScale();

const titleCam = (t) => {
  camera.position.set(Math.sin(t * 0.07) * 2, -1.6 + Math.sin(t * 0.3) * 0.1, 8);
  camera.rotation.set(-0.12, Math.sin(t * 0.05) * 0.35, 0);
  silt.update(1 / 60, camera.position, V3());
  if (Math.random() < 0.05) silt.spawn(V3(rand(-6, 6), -3, rand(-4, 6)), 0.3, 0.2, 2);
  torch.visible = true;
  torch.intensity = 26;
  applyAtmos(1, 0, 1, 14);
  camLed.visible = Math.sin(t * 6) > 0;
};

let last = performance.now();
const loop = (now) => {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (mode === 'play') update(dt);
  else if (mode === 'title') titleCam(now / 1000);
  renderer.render(scene, camera);
  requestAnimationFrame(loop);
};
setDanmaku(save.danmaku);
let tipI = Math.floor(Math.random() * TIPS.length);
const nextTip = () => {
  tipI = (tipI + 1) % TIPS.length;
  for (const el of [$('#title-tip'), $('#pause-tip')]) el.textContent = TIPS[tipI];
};
nextTip();
setInterval(nextTip, 4500);
requestAnimationFrame(loop);

})();
