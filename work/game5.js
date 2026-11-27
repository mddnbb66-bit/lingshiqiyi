
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

// 调试入口：地址后加 ?debug 才开放，例如 __jdns.goto(25) 传送到主通道 25 米处
if (new URLSearchParams(location.search).has('debug')) {
  globalThis.__jdns = {
    get G() { return G; },
    P,
    goto(s, tube = main) {
      const g = tube.ringAt(clamp(s / tube.len, 0, 1));
      P.pos.copy(g.c).addScaledVector(g.up, 0.1);
      P.vel.set(0, 0, 0);
      P.yaw = Math.atan2(-g.tg.x, -g.tg.z);
      P.pitch = -0.1;
    },
  };
}
