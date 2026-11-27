
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
