import * as THREE from 'three';

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
const DM = {
  start: ['又是临时起意'],
  ambient: ['看了半年神秘园的我表示：', '小牟来了吗'],
  sign: ['已经进入神秘园流程了'],
  third: ['已经进入神秘园流程了'],
  silt: ['已经进入神秘园流程了', '三米也能死？'],
  win: ['看了半年神秘园的我表示：'],
  die: ['三米也能死？', '这个洞要糊水泥了', '新人又至，再创佳绩'],
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
