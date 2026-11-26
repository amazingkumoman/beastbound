// 戦闘エンジン（画面を持たない）。20 戦闘仕様書・20b 戦闘の数値案。
// createBattle() で始め、choices() で選べる行動を見て、step() で1ターン進める。
// step() は「起きたこと（events）」の一覧を返す。events にはモンスターの体力・部位の耐久・
// 状態異常の蓄積・適応の度合いを入れない（決定 D-04・D-06・D-07、Q-06：ダメージの数字も出さない）。

import { createRng } from '../../core/rng.js';

export const RANGES = ['near', 'mid', 'far'];
export const RANGE_NAME = { near: '近', mid: '中', far: '遠' };

/** 20b の数字。調整するときはここだけを変え、決定台帳に記録する */
export const RULES = {
  playerHp: 100, playerSt: 100,
  rankHp: { high: 1.05, master: 1.10 }, // 2026-11-26 スキル上限Lv5・足し算・固有スキルの分、上位・マスター級の体力を上げる（試算で戦いの長さを元に戻す）
  stEndTurn: 5, dodgeSt: 15, dodgeRefund: 10, guardPushSt: 15, guardLowSt: 15, moveStGain: 10,
  openingMult: [1, 1.25, 1.5],
  downMult: 1.3, chanceMult: 1.2, sleepWakeMult: 1.5,
  guard: { full: 0.1, pushed: 0.35, broken: 0.7 },
  wideDodge: 0.5,
  wideDodgeLight: 0.3,
  hardenMult: 0.3,              // 硬化中に通る傷の割合（第12段階）          // 受けの弱い武器（受けの強さ1）は身軽：広い攻撃もかなりよけられる
  rand: [0.95, 1.05],
  adapt: { window: 8, need: 5, step: 0.15, maxLevel: 2, calmTurns: 2 },
  ail: { cap: 100, capUp: 0.5, stunCapUp: 1.2, decay: 5, signRatio: 0.7 },
  monsterAil: {
    poison: { name: '毒', turns: 5, dmgRatio: 0.012 },
    paralysis: { name: '麻痺', turns: 2, skip: true },
    sleep: { name: '睡眠', turns: 4, skip: true },
    bleed: { name: '出血', turns: 3, dmgRatio: 0.02 },
    stun: { name: '気絶', turns: 2, skip: true },
    bind: { name: '拘束', turns: 1, skip: true },
    slow: { name: '鈍足', turns: 3, powerMult: 0.85 },
    trip: { name: '転倒', turns: 0, down: 1 },
  },
  playerAil: {
    poison: { name: '毒', turns: 4, dmg: 4 },
    bleed: { name: '出血', turns: 3, dmg: 6 },
    paralysis: { name: '麻痺', turns: 1 },
  },
  faintsToFail: 3,
  // 第5段階：武器のしくみ（21b）
  aimDrift: 0.15,              // 狙いがそれる確率（弓・鎖をかけた部位はそれない）
  chargeMult: [1, 1.25, 1.5],  // 大剣の溜め段階（試し打ちで 1.5/2.0 から下げた）
  momentumMax: 5,              // 双刃の勢い
  twinCounterMult: 0.6,        // 双刃：回避成功の反撃
  chainMult: 1.3, chainBind: 20, // 鎖刃：鎖をかけた部位（試し打ちで 倍率1.2→1.3、拘束10→20）
  arrowPierce: { floor: 0.8, mult: 0.9 }, // 弓：貫く矢
  guardUpTurns: 2,             // 竜槍：不動の構え
  hammerEndure: 0.85,          // 重槌：重い攻撃の最中に受けたダメージ
  stunOffHead: 0.25,           // 頭以外への気絶の蓄積
};

const AIL_SIGN = { // 蓄積が近いときの兆候（数値は出さない）
  poison: 'わずかに足取りが乱れている。', paralysis: '筋がぴくりと引きつった。', sleep: 'まぶたが重そうだ。',
  bleed: '傷口から血がにじんでいる。', stun: '頭を振って、ふらついている。',
  bind: '絡みついたものを振りほどこうともがいている。', slow: '足の運びが重くなってきた。', trip: '足元がおぼつかない。',
};

/**
 * @param {object} o
 * @param {object} o.monster  モンスターのデータ
 * @param {object} o.weapon   武器のデータ
 * @param {object[]} [o.items] 持ち込みのアイテム（{id,name,count,heal?,cure?}）
 * @param {number|string} [o.seed]
 * @param {object} [o.prior]  力尽き・逃走の後の続き（モンスターの状態と力尽きた回数。Q-25）
 */
const NO_GEAR = { def: 0, resist: {}, mods: {} };
/**
 * gear：防具の守り・耐性・スキルの補正（systems/gear/gear.js の battleWeapon().gear）。省くと「何もつけていない」
 */
export function createBattle({ monster, weapon, items = [], seed = Date.now(), prior = null, gear = NO_GEAR }) {
  const rng = createRng(seed);
  const HP = Math.round(monster.hp * (RULES.rankHp[monster.rank] ?? 1));
  const parts = {};
  for (const [k, p] of Object.entries(monster.parts)) {
    parts[k] = prior?.parts?.[k] ? { ...prior.parts[k] } : { hp: Math.round(HP * p.hpRatio), broken: false };
  }
  const ail = {};
  for (const k of Object.keys(RULES.monsterAil)) {
    const res = monster.ailRes?.[k] ?? 1;
    ail[k] = prior?.ail?.[k] ? { ...prior.ail[k], v: 0, active: 0 } : { v: 0, cap: RULES.ail.cap * res, active: 0, signed: false };
  }
  const G = { def: gear.def || 0, resist: gear.resist || {}, mods: { ...(gear.mods || {}) } };
  const mod = k => G.mods[k] || 0;
  const s = {
    rng, seed, turn: 0, over: null, G, mod, acts: 0,
    mon: monster, wpn: weapon,
    range: prior?.range ?? monster.startRange ?? 'mid',
    P: {
      hp: RULES.playerHp + mod('hpAdd'), hpMax: RULES.playerHp + mod('hpAdd'), st: RULES.playerSt + mod('stAdd'), stMax: RULES.playerSt + mod('stAdd'),
      ail: {}, opening: 0, nextOpening: 0, chance: false, aim: null, guard: false, dodge: false,
      faints: prior?.faints ?? 0, paralyzed: 0,
      charge: 0, momentum: 0, chain: null, guardUp: 0, arrow: 'normal',
      afterDodge: false, afterPushed: false, counter: null, chainGuard: false,
    },
    M: {
      hp: prior?.hp ?? HP, hpMax: HP,
      rage: { v: 0, t: 0 }, fatigue: { v: 0, t: 0 }, down: 0, parts, ail,
      disabled: new Set(prior?.disabled ?? []), next: null,
      adapt: { hist: [], level: {}, calm: {} }, signs: new Set(prior?.signs ?? []), fled: prior?.fled ?? false, capSign: prior?.capSign ?? false, phase: prior?.phase ?? monster.startPhase ?? 1, rageCount: prior?.rageCount ?? 0, air: !!monster.startAir,
    },
    items: items.map(it => ({ ...it })),
    log: [],
  };
  const ev = [{ type: 'start', range: s.range }];
  plan(s, ev);
  return { state: s, events: ev };
}

// ─── 選べる行動 ──────────────────────────────────────────
export function choices(s) {
  if (s.over) return [];
  const P = s.P, W = s.wpn, inReach = W.reach.includes(s.range);
  if (P.paralyzed > 0) return [{ id: 'wait', type: 'wait', label: '動けない', sub: '麻痺', disabled: false }, ...s.items.filter(it => it.free).map(it => itemChoice(s, it))];
  const far = s.M.under ? '地中にいて届かない' : inReach ? '' : '届かない';
  const list = [
    { id: 'light', type: 'light', label: W.light.name, sub: '軽い攻撃', disabled: !inReach || !!s.M.under, reason: far },
    { id: 'heavy', type: 'heavy', label: W.heavy.name, sub: `重い攻撃・気力${W.heavy.st}`, disabled: !inReach || !!s.M.under || P.st < W.heavy.st, reason: far || (P.st < W.heavy.st ? '気力が足りない' : '') },
    ...(W.special ? [specialChoice(s)] : []),
    ...W.techs.map(t => techChoice(s, t)),
    { id: 'guard', type: 'guard', label: '防御', sub: '', disabled: false },
    { id: 'dodge', type: 'dodge', label: '回避', sub: `気力${dodgeCost(s)}`, disabled: P.st < dodgeCost(s), reason: P.st < dodgeCost(s) ? '気力が足りない' : '' },
    { id: 'move_in', type: 'move', dir: 'in', label: '詰める', sub: '間合いを近づける', disabled: s.range === 'near' || !!s.M.air, reason: s.M.air ? '空にいて近づけない' : s.range === 'near' ? 'これ以上近づけない' : '' },
    { id: 'move_out', type: 'move', dir: 'out', label: '離れる', sub: '間合いを取る', disabled: s.range === 'far', reason: s.range === 'far' ? 'これ以上離れられない' : '' },
    ...s.items.map(it => itemChoice(s, it)),
    { id: 'retreat', type: 'retreat', label: '撤退する', sub: '失敗あつかい', disabled: false },
  ];
  return list;
}

function itemChoice(s, it) {
  const reason = it.count <= 0 ? 'もうない' : it.free && !(s.P.paralyzed > 0) ? '麻痺していない' : '';
  return { id: it.id, type: 'item', itemId: it.id, free: !!it.free, label: it.name, sub: `残り${it.count}`, disabled: !!reason, reason };
}

export function dodgeCost(s) { return Math.max(3, RULES.dodgeSt - (s.mod?.('dodgeStReduce') || 0)); }

function specialChoice(s) {
  const sp = s.wpn.special, P = s.P;
  if (sp.effect === 'arrow') return { id: sp.id, type: 'special', free: true, label: sp.name, sub: `今：${P.arrow === 'pierce' ? '貫く矢' : '通常の矢'}・ターンを使わない`, disabled: false };
  const full = sp.effect === 'charge' && P.charge >= 2;
  return { id: sp.id, type: 'special', label: sp.name, sub: `溜め ${P.charge}/2`, disabled: full, reason: full ? 'これ以上溜められない' : '' };
}
function techChoice(s, t) {
  const P = s.P, W = s.wpn;
  const noAttack = !t.mult; // 構えだけの技
  const ranges = t.needRange || W.reach;
  let reason = '';
  if (!noAttack && s.M.under) reason = '地中にいて届かない';
  else if (!noAttack && !ranges.includes(s.range)) reason = t.needRange ? `${t.needRange.map(r => RANGE_NAME[r]).join('・')}の間合いでだけ使える` : '届かない';
  else if (P.cool?.[t.id] > 0) reason = `あと${P.cool[t.id]}ターン使えない`; // 切り札・上位の技（21c 3-2）
  else if (P.st < t.st) reason = '気力が足りない';
  else if (t.need?.charge && P.charge < t.need.charge) reason = `溜め${t.need.charge}段が必要`;
  else if (t.need?.momentum && P.momentum < t.need.momentum) reason = `勢い${t.need.momentum}が必要`;
  else if (t.need?.chain && !P.chain) reason = '鎖をかけてから';
  else if (t.effect === 'chain' && !P.aim) reason = '部位を選んでから';
  return { id: t.id, type: 'tech', techId: t.id, label: t.name, sub: `技・気力${t.st}`, disabled: !!reason, reason };
}

/** 狙う部位を選ぶ（ターンを使わない。決定 D-07） */
/** その部位を今狙えるか（隠れた部位は、さらけ出したときと倒れたときだけ。第11段階） */
export function partOpen(s, k) { return !s.mon.parts[k]?.hidden || s.M.expose > 0 || s.M.down > 0; }
export function setAim(s, partKey) {
  if (partKey == null) { s.P.aim = null; return true; }
  const p = s.M.parts[partKey];
  if (!p || p.broken || !partOpen(s, partKey)) return false;
  s.P.aim = partKey;
  return true;
}

// ─── 1ターン進める ──────────────────────────────────────
export function step(s, action) {
  const ev = [];
  if (s.over) return ev;
  const ch = choices(s).find(c => c.id === action.id);
  if (!ch || ch.disabled) return [{ type: 'error', text: ch?.reason || 'その行動はできない' }];
  const P = s.P, M = s.M;
  if (ch.free && ch.type === 'item') { // 気付け薬など：ターンを使わない
    const it = s.items.find(x => x.id === ch.itemId); it.count--;
    (it.cure || []).forEach(k => { if (k === 'paralysis') P.paralyzed = 0; delete P.ail[k]; });
    say(ev, `${it.name}を使った。しびれが取れた！`);
    return log(s, ev);
  }
  if (ch.free) { // ターンを使わない
    P.arrow = P.arrow === 'pierce' ? 'normal' : 'pierce';
    say(ev, P.arrow === 'pierce' ? '貫く矢に持ち替えた。' : '通常の矢に持ち替えた。');
    return log(s, ev);
  }
  P.guard = P.dodge = false; P.counter = null; P.chainGuard = false;
  P.opening = P.nextOpening; P.nextOpening = 0;

  // 1) プレイヤーの行動
  if (ch.type === 'wait') { P.paralyzed--; say(ev, 'しびれて体が動かない……'); }
  else if (ch.type === 'retreat') { s.over = { result: 'retreat' }; ev.push({ type: 'end', result: 'retreat' }); return log(s, ev); }
  else doPlayer(s, ch, ev);

  if (P.captured) return finish(s, ev, 'capture');
  if (M.hp <= 0) return finish(s, ev, 'win');

  // 2) 逃走（Q-17）
  const fl = s.mon.flee;
  if (fl && !M.fled && M.hp / M.hpMax < fl.hpBelow && s.rng.chance(fl.chance)) {
    M.fled = true; say(ev, fl.text);
    return finish(s, ev, 'fled');
  }

  // 3) モンスターの行動
  doMonster(s, ev);

  // 4) ターンの終わり
  endTurn(s, ev);
  if (M.hp <= 0) return finish(s, ev, 'win');
  if (P.hp <= 0) {
    P.faints++;
    return finish(s, ev, P.faints >= RULES.faintsToFail ? 'fail' : 'faint');
  }
  captureSign(s, ev);
  plan(s, ev);
  s.turn++;
  return log(s, ev);
}

function log(s, ev) { s.log.push(...ev); return ev; }
function say(ev, text) { ev.push({ type: 'say', text }); }
const roll = s => s.rng.range(RULES.rand[0], RULES.rand[1]);

function finish(s, ev, result) {
  const M = s.M;
  s.over = { result };
  if (result === 'faint' || result === 'fled') {
    s.over.snapshot = {
      hp: M.hp, parts: structuredClone(M.parts), ail: structuredClone(M.ail), disabled: [...M.disabled],
      signs: [...M.signs], fled: M.fled, capSign: M.capSign, phase: M.phase, rageCount: M.rageCount, faints: s.P.faints, range: 'mid',
    };
  }
  ev.push({ type: 'end', result, faints: s.P.faints });
  return log(s, ev);
}

// ─── プレイヤー ─────────────────────────────────────────
function doPlayer(s, ch, ev) {
  const P = s.P, W = s.wpn;
  const rec = { kind: ch.type, key: ch.techId || ch.type, part: P.aim, range: s.range };
  if (ch.type === 'tech') { const td = W.techs.find(x => x.id === ch.techId); if (td?.cool || (td?.opening ?? 0) >= 2) rec.w = 2; if (td?.cool) (P.cool ??= {})[td.id] = td.cool + 1; } // 大振り・切り札は慣れられやすい。切り札はしばらく使えない
  if (['light', 'heavy', 'tech', 'special'].includes(ch.type)) s.acts++; // 熟練度に数える（その武器で行った行動）
  const bonusDodge = P.afterDodge, bonusPushed = P.afterPushed, bonusMove = P.afterMove;
  P.afterDodge = false; P.afterPushed = false; P.afterMove = false;
  if (ch.type === 'special') {
    const sp = W.special;
    P.opening = Math.max(P.opening, sp.opening || 0);
    if (sp.effect === 'charge') { P.charge = Math.min(2, P.charge + 1); say(ev, `力を溜めている……（溜め ${P.charge}/2）`); ev.push({ type: 'self', key: 'charge', value: P.charge }); }
  } else if (ch.type === 'light' || ch.type === 'heavy' || ch.type === 'tech') {
    const def = ch.type === 'tech' ? W.techs.find(t => t.id === ch.techId) : W[ch.type];
    if (ch.type === 'heavy' || ch.type === 'tech') P.st -= def.st || 0;
    P.opening = Math.max(P.opening, def.opening || 0);
    ev.push({ type: 'act', who: 'player', name: def.name, kind: ch.type });
    if (def.effect === 'counterGuard') { P.guard = true; P.counter = def; say(ev, '受けの構えから、反撃をねらう。'); }
    else if (def.effect === 'guardUp') { P.guard = true; P.guardUp = RULES.guardUpTurns; say(ev, '盾を構え、足を踏みしめた。（しばらく受けが強くなる）'); }
    else if (def.effect === 'chainGuard') { P.guard = true; P.chainGuard = true; say(ev, '鎖を張って受けの構えを取った。'); }
    else if (s.M.next?.stance && ch.type !== 'light' && (def.opening || 0) >= 1 && !s.M.down) { // 見切りの構え（第11段階）
      P.readByStance = true; say(ev, `${def.name}……大振りを見切られた！`); ev.push({ type: 'miss' });
    }
    else {
      if (def.approach && s.range !== 'near') { s.range = 'near'; ev.push({ type: 'range', range: s.range }); }
      let extra = 1;
      if (ch.type !== 'light' && W.kind === 'greatsword' && P.charge > 0) { extra *= RULES.chargeMult[P.charge]; say(ev, `溜めた力を解き放つ！`); P.charge = 0; }
      if (def.afterDodge && bonusDodge) extra *= def.afterDodge;
      if (def.afterPushed && bonusPushed) extra *= def.afterPushed;
      if (bonusDodge) extra *= 1 + s.mod('dodgeNextAtk'); // 固有：縞翼の目
      if (bonusMove) extra *= 1 + s.mod('moveNextAtk'); // 固有：嵐呼びの翼
      if (W.kind === 'bow' && s.range === 'near') extra *= W.nearMult ?? 1;
      let hits = def.hits || 1;
      if (W.kind === 'twinblades' && ch.type !== 'tech') hits += Math.floor(P.momentum / 2);
      if (def.effect === 'chain') { P.chain = P.aim; say(ev, `${s.mon.parts[P.aim].name}に鎖をかけた！`); ev.push({ type: 'self', key: 'chain', value: P.aim }); }
      const opt = { heavy: ch.type !== 'light', multi: hits > 1 };
      for (let i = 0; i < hits && s.M.hp > 0; i++) strike(s, def, ev, extra, opt);
      if (def.ail) for (const [k, amt] of Object.entries(def.ail)) addAil(s, k, amt * (1 + s.mod('ailMult')), ev);
      if (opt.heavy && s.mod('heavyStun') && s.M.hp > 0) addAil(s, 'stun', s.mod('heavyStun'), ev); // 固有：豪腕の拳
      if (def.stGain) P.st = Math.min(P.stMax, P.st + def.stGain);
      if (W.kind === 'twinblades') {
        if (def.need?.momentum) P.momentum = 0;
        else P.momentum = Math.min(RULES.momentumMax, P.momentum + 1);
        ev.push({ type: 'self', key: 'momentum', value: P.momentum });
      }
      if (def.retreat && s.range !== 'far') { s.range = RANGES[RANGES.indexOf(s.range) + 1]; say(ev, '撃ちながら下がった。'); ev.push({ type: 'range', range: s.range }); }
      if (def.retreatTo && s.range !== def.retreatTo) { s.range = def.retreatTo; ev.push({ type: 'range', range: s.range }); }
    }
    P.chance = false;
  } else if (ch.type === 'guard') {
    if (W.kind === 'twinblades' && P.momentum > 0) P.momentum = Math.max(0, P.momentum - 1);
    P.guard = true; say(ev, `${W.name}で受けの構えを取った。`);
  } else if (ch.type === 'dodge') {
    P.st -= dodgeCost(s); P.dodge = true; say(ev, '身を低くして、よける構えを取った。');
  } else if (ch.type === 'move') {
    const i = RANGES.indexOf(s.range) + (ch.dir === 'in' ? -1 : 1);
    s.range = RANGES[Math.max(0, Math.min(2, i))];
    P.st = Math.min(P.stMax, P.st + RULES.moveStGain); P.afterMove = true;
    say(ev, ch.dir === 'in' ? '間合いを詰めた。' : '間合いを取った。');
    ev.push({ type: 'range', range: s.range });
  } else if (ch.type === 'item') {
    const it = s.items.find(x => x.id === ch.itemId);
    it.count--;
    const boost = 1 + s.mod('itemBoost'); // 固有：天鯨の歌
    if (it.heal) { const h = Math.min(Math.round(it.heal * boost), P.hpMax - P.hp); P.hp += h; say(ev, `${it.name}を使った。体力が${h}回復した。`); }
    if (it.st) { const h = Math.min(Math.round(it.st * boost), P.stMax - P.st); P.st += h; say(ev, `${it.name}を使った。気力が${h}戻った。`); }
    if (it.cure) { it.cure.forEach(k => { delete P.ail[k]; }); say(ev, `${it.name}を使った。体が楽になった。`); }
    if (it.capture) { // 捕獲（24b 4章）：弱っていれば成功。早すぎると失敗して捕獲具は無くなる
      const cap = s.mon.capture;
      if (cap && s.M.hp / s.M.hpMax <= cap.hpBelow) { P.captured = true; say(ev, `${it.name}を仕掛けた……${s.mon.name}を捕らえた！`); }
      else say(ev, `${it.name}を仕掛けたが、振りほどかれた。まだ早いようだ。`);
    }
    if (it.throw) { // 投げナイフ：どの間合いからも届く小さな傷（数字は出さない）
      const dmg = Math.max(1, Math.round(it.throw * roll(s)));
      s.M.hp = Math.max(0, s.M.hp - dmg);
      say(ev, `${it.name}を投げた。`);
      ev.push({ type: 'hit', target: 'monster', part: null, feel: 'ok' });
    }
  }
  pushHist(s, rec);
}

/** 攻撃を当てる。当たったら true */
function strike(s, def, ev, extra = 1, opt = {}) {
  const M = s.M, P = s.P, W = s.wpn, mon = s.mon;
  let partKey = P.aim && !M.parts[P.aim].broken ? P.aim : null;
  if (partKey && !partOpen(s, partKey)) { partKey = null; if (!P.hiddenSaid) { say(ev, '狙った所が隠れていて届かない。'); P.hiddenSaid = true; } }
  const chained = partKey && P.chain === partKey;
  if (partKey && !W.sureAim && !chained && !s.mod('noDrift') && s.rng.chance(RULES.aimDrift)) { partKey = null; say(ev, '狙いが少しそれた。'); }
  const type = def.typeOverride || W.type;
  let zone = partKey ? mon.parts[partKey].z[type] ?? 1 : mon.body[type] ?? 1;
  const zoneRaw = zone;
  const floor = Math.max(def.pierceFloor ?? 0, type === W.type ? (W.pierceFloor ?? 0) : 0, W.kind === 'bow' && P.arrow === 'pierce' ? RULES.arrowPierce.floor : 0);
  zone = Math.max(zone, floor);
  let mult = def.mult * zone * extra * roll(s);
  if (W.kind === 'bow' && P.arrow === 'pierce') mult *= RULES.arrowPierce.mult;
  if (def.headBonus && partKey === 'head') mult *= def.headBonus;
  if (def.weakBonus && zoneRaw >= 1.2) mult *= def.weakBonus;
  if (chained) mult *= RULES.chainMult;
  // スキル（22b 3章）
  mult *= 1 + s.mod('atkMult');
  if (zoneRaw >= 1.2) mult *= 1 + s.mod('weakMult');
  if (opt.heavy) mult *= 1 + s.mod('heavyMult');
  if (opt.multi) mult *= 1 + s.mod('multiHitMult');
  if (opt.counter) mult *= 1 + s.mod('counterMult');
  // 固有スキル（data/uniques.js）
  if (s.mod('ailedTargetAtk') && Object.values(M.ail).some(a => a.active > 0)) mult *= 1 + s.mod('ailedTargetAtk');
  if (s.mod('lowHpAtk') && P.hp < P.hpMax * 0.5) mult *= 1 + s.mod('lowHpAtk');
  if (M.down > 0) mult *= RULES.downMult;
  if (P.chance) mult *= RULES.chanceMult + s.mod('chanceAdd');
  if (M.ail.sleep.active > 0) { mult *= RULES.sleepWakeMult; M.ail.sleep.active = 0; say(ev, '眠っていたところに一撃！ 目を覚ました。'); }
  mult *= adaptMult(s, def, partKey);
  let dmg = Math.max(1, Math.round(W.power * mult));
  if (W.element) { // 属性（6-3）：モンスターの属性の効きやすさ（未設定は1）
    const ez = (partKey ? mon.parts[partKey].elem?.[W.element.type] : null) ?? mon.elem?.[W.element.type] ?? 1;
    dmg += Math.round(W.element.value * (def.mult || 0.6) * ez * (1 + s.mod('elemMult')) * roll(s));
  }
  if (M.harden > 0) dmg = Math.max(1, Math.round(dmg * RULES.hardenMult)); // 硬化中は通りにくい（第12段階）
  if (zoneRaw >= 1.2 && s.mod('weakSt')) P.st = Math.min(P.stMax, P.st + s.mod('weakSt')); // 固有：星の涙の加護
  M.hp = Math.max(0, M.hp - dmg);
  M.rage.v += dmg / M.hpMax * mon.rage.damageGain;
  if (M.charging) { // 大技の溜めを止める（第11段階）
    M.charging.dmg += dmg;
    if (M.charging.dmg >= M.hpMax * (M.charging.act.interrupt || 0.06) * (1 - s.mod('interruptEase'))) { // 固有：氷翼の眼
      say(ev, M.charging.act.interruptText || `${mon.name}の溜めを崩した！ 大きく体勢を崩している。`);
      M.charging = null; M.down = Math.max(M.down, 1); ev.push({ type: 'tell', text: '' }); ev.push({ type: 'break-charge' });
    }
  }
  ev.push({ type: 'hit', target: 'monster', part: partKey, feel: zone >= 1.2 ? 'good' : zone < 0.8 ? 'bad' : 'ok' });
  if (M.hp > 0) { // 固有：当てるたびに状態異常が少し溜まる
    if (W.element && s.mod('elemPara')) addAil(s, 'paralysis', s.mod('elemPara'), ev);
    if (s.mod('slowHit')) addAil(s, 'slow', s.mod('slowHit'), ev);
    if (s.mod('poisonHit')) addAil(s, 'poison', s.mod('poisonHit'), ev);
  }
  if (partKey) {
    const pt = M.parts[partKey];
    pt.hp -= Math.round(dmg * (def.breakBonus || 1) * (1 + s.mod('partMult')));
    if (pt.hp <= 0 && !pt.broken) breakPart(s, partKey, ev);
  }
  if (chained) addAil(s, 'bind', RULES.chainBind, ev);
  if (W.ailOnHit) addAil(s, W.ailOnHit.type, W.ailOnHit.value * (1 + s.mod('ailMult')), ev);
  if (def.stun) addAil(s, 'stun', Math.round(def.stun * (partKey === 'head' ? 1 : RULES.stunOffHead) * (def.downStun && M.down > 0 ? def.downStun : 1)), ev);
  return true;
}

function breakPart(s, key, ev) {
  const M = s.M, b = s.mon.parts[key].onBreak || {};
  M.parts[key].broken = true;
  if (s.P.aim === key) s.P.aim = null;
  if (s.P.chain === key) s.P.chain = null;
  if (b.down) M.down = Math.max(M.down, b.down);
  if (b.ground && M.air) { M.air = false; s.range = 'mid'; ev.push({ type: 'range', range: s.range }); } // 翼を壊すと落ちる
  (b.disable || []).forEach(a => M.disabled.add(a));
  M.rage.v += s.mon.rage.breakGain;
  ev.push({ type: 'break', part: key, name: s.mon.parts[key].name });
  say(ev, b.text || `${s.mon.parts[key].name}を破壊した！`);
}

function addAil(s, k, amt, ev) {
  const a = s.M.ail[k]; if (!a || a.active > 0) return;
  a.v += amt;
  if (a.v >= a.cap) {
    const ma = RULES.monsterAil[k];
    a.v = 0; a.cap *= 1 + (k === 'stun' ? RULES.ail.stunCapUp : RULES.ail.capUp); a.active = ma.turns + (ma.turns > 0 ? s.mod('ailLonger') : 0); // 固有：三つ首の執念 a.signed = false; // 気絶は続けて取りにくい（連発対策・21c 3-2）
    ev.push({ type: 'ail', target: 'monster', ail: k });
    if (ma.down) { s.M.down = Math.max(s.M.down, ma.down); say(ev, `${s.mon.name}は足を取られて転倒した！`); }
    else say(ev, `${s.mon.name}は${ma.name}状態になった！`);
  } else if (!a.signed && a.v >= a.cap * RULES.ail.signRatio) {
    a.signed = true; say(ev, AIL_SIGN[k]);
  }
}

// ─── 適応（決定 D-08） ──────────────────────────────────
const PATTERNS = {
  sameTech: h => { // 強い技（使ったあとしばらく使えない技）は2回分として数える＝慣れられやすい（21c 3-2）
    const c = {}; let best = null;
    for (const x of h) if (x.kind === 'tech' || x.kind === 'heavy') { c[x.key] = (c[x.key] || 0) + (x.w || 1); if (!best || c[x.key] > c[best]) best = x.key; }
    return best ? { key: best, n: c[best] } : { key: null, n: 0 };
  },
  samePart: h => mostCommon(h.filter(x => ['light', 'heavy', 'tech'].includes(x.kind) && x.part).map(x => x.part)),
  dodge: h => ({ key: 'dodge', n: h.filter(x => x.kind === 'dodge').length }),
  guard: h => ({ key: 'guard', n: h.filter(x => x.kind === 'guard').length }),
  ranged: h => ({ key: 'ranged', n: h.filter(x => ['light', 'heavy', 'tech'].includes(x.kind) && x.range !== 'near').length }),
};
function mostCommon(arr) {
  const c = {}; let best = null;
  for (const k of arr) { c[k] = (c[k] || 0) + 1; if (!best || c[k] > c[best]) best = k; }
  return best ? { key: best, n: c[best] } : { key: null, n: 0 };
}
function pushHist(s, rec) {
  const h = s.M.adapt.hist; h.push(rec);
  if (h.length > RULES.adapt.window) h.shift();
}
function adaptLevel(s, pattern, key) {
  const L = s.M.adapt.level[pattern];
  return L && (key == null || L.key === key) ? L.n : 0;
}
function adaptMult(s, def, partKey) {
  let lv = 0;
  if (def.id) lv = Math.max(lv, adaptLevel(s, 'sameTech', def.id));
  else if (def === s.wpn.heavy) lv = Math.max(lv, adaptLevel(s, 'sameTech', 'heavy'));
  if (partKey) lv = Math.max(lv, adaptLevel(s, 'samePart', partKey));
  return Math.max(1 - RULES.adapt.step * RULES.adapt.maxLevel, 1 - RULES.adapt.step * lv);
}
function updateAdapt(s, ev) {
  const A = s.M.adapt, need = Math.max(3, Math.round(RULES.adapt.need / (s.mon.adaptSpeed || 1) * (1 + s.mod('adaptSlow'))));
  for (const [name, fn] of Object.entries(PATTERNS)) {
    const r = fn(A.hist) || { key: null, n: 0 };
    const cur = A.level[name];
    if (r.n >= need) {
      A.calm[name] = 0;
      if (!cur || cur.key !== r.key) A.level[name] = { key: r.key, n: 1 };
      else if (cur.n < RULES.adapt.maxLevel) cur.n++;
      else continue;
      s.M.rage.v += s.mon.rage.adaptGain;
      say(ev, adaptText(name));
      A.hist.splice(0, A.hist.length - 2); // 数え直し
    } else if (cur && cur.n > 0) {
      A.calm[name] = (A.calm[name] || 0) + 1;
      if (A.calm[name] >= RULES.adapt.calmTurns) { cur.n--; A.calm[name] = 0; if (cur.n === 0) delete A.level[name]; }
    }
  }
}
function adaptText(name) {
  return ({
    sameTech: '同じ攻め方に慣れてきたようだ。',
    samePart: '狙われている所をかばうように構えている。',
    dodge: 'よける動きを読まれ始めている。',
    guard: '守りを崩そうとする動きが増えた。',
    ranged: '離れた相手への動きが増えた。',
  })[name];
}

// ─── モンスター ─────────────────────────────────────────
function doMonster(s, ev) {
  const M = s.M, P = s.P, mon = s.mon;
  const skip = Object.entries(M.ail).find(([k, a]) => a.active > 0 && RULES.monsterAil[k].skip);
  if (skip) {
    const [k] = skip; if (M.charging) { M.charging = null; say(ev, '溜めていた力が抜けた。'); }
    say(ev, ({ paralysis: `${mon.name}はしびれて動けない！`, sleep: `${mon.name}は眠っている……`, stun: `${mon.name}は目を回している！` })[k]);
    return;
  }
  if (M.down > 0) { M.down--; say(ev, `${mon.name}は倒れたまま、もがいている。（好機）`); ev.push({ type: 'down' }); return; }
  const a = M.next;
  if (!a || a.idle) { say(ev, `${mon.name}は${mon.idleText[s.rng.int(0, mon.idleText.length - 1)]}`); return; }
  if (a.stance && !P.readByStance) { say(ev, a.stanceIdle || `${mon.name}は構えを解いた。`); return; } // 見切りの構え：大振りしなければ何もしない
  if (a.windup) { // 大技の溜め
    if (!M.charging) M.charging = { act: a, left: a.windup, dmg: 0 };
    if (M.charging.left > 0) { M.charging.left--; say(ev, a.chargeText || `${mon.name}は力を溜めている……`); ev.push({ type: 'charge' }); return; }
    M.charging = null;
  }
  ev.push({ type: 'act', who: 'monster', name: a.name, id: a.id });
  if (a.harden && !a.power) { M.harden = a.harden + 1; say(ev, mon.hardenText || `${mon.name}の体が硬くなった！ しばらく攻撃が通りにくい。（気力を整える好機）`); ev.push({ type: 'harden' }); return; }
  if (a.move) {
    s.range = a.move; if (a.takeoff) M.air = true; if (a.land) M.air = false; if (a.burrow) M.under = true;
    say(ev, a.moveText || `${mon.name}は${a.name}で距離を取った。`); ev.push({ type: 'range', range: s.range });
    return;
  }
  M.fatigue.v += a.fatigue || 0;
  if (!a.reach.includes(s.range)) { say(ev, `${a.name}！ ……届かなかった。`); if (a.moveTo) moveTo(s, a.moveTo, ev); return; }
  if (s.mod('shadowDodge') && !a.unguardable && s.rng.chance(s.mod('shadowDodge'))) { say(ev, `${a.name}！ ……影の衣がゆらぎ、攻撃は空を切った。`); if (a.moveTo) moveTo(s, a.moveTo, ev); return; } // 固有：影の衣
  let mult = (M.rage.t > 0 ? mon.rage.mult : 1) * (M.fatigue.t > 0 ? mon.fatigue.mult : 1) * (M.ail.slow?.active > 0 ? RULES.monsterAil.slow.powerMult : 1) * roll(s);
  const W = s.wpn;
  let text, hurt = true, counterNow = false;
  if (P.dodge) {
    if (a.wide) {
      const light = W.guardLevel <= 1;
      mult *= light ? RULES.wideDodgeLight : RULES.wideDodge; text = light ? `${a.name}！ 身軽にかわしたが、かすった。` : `${a.name}！ かわしきれない！`;
    }
    else {
      mult = 0; hurt = false; text = `${a.name}をかわした！ 好機だ。`; P.chance = true; P.afterDodge = true; P.st = Math.min(P.stMax, P.st + RULES.dodgeRefund + s.mod('dodgeStGain')); // 固有：疾風の脚
      if (W.kind === 'twinblades') { say(ev, text); text = 'かわしざまに斬り返す！'; strike(s, { mult: RULES.twinCounterMult }, ev, 1, { counter: true }); }
    }
  } else if (P.guard) {
    const gs = s.mod('guardSkill');
    const lvl = Math.min(3, W.guardLevel + (P.guardUp > 0 ? 1 : 0) + (P.chainGuard ? 1 : 0) + (gs >= 3 ? 1 : 0));
    let g = guardResult(lvl, a, P.st);
    if ((W.kind === 'hammer' || s.mod('noBreak') || gs >= 5) && g === 'broken') g = 'pushed'; // 崩されにくい（固有：金剛の肌）
    mult *= RULES.guard[g] * (1 - s.mod('guardCut')); // 固有：苔岩の背
    if (g === 'full') {
      hurt = false; text = `${a.name}を完全に受け止めた！ 好機だ。`; P.chance = true; counterNow = !!P.counter;
      if (W.kind === 'greatsword' && P.charge < 2) { P.charge++; text += `（溜め ${P.charge}/2）`; }
      if (P.chainGuard) { M.ail.bind.active = Math.max(M.ail.bind.active, 1); text += ' 鎖が手足に絡みついた！'; }
      if (s.mod('reflect') && M.hp > 0) { const r = Math.max(1, Math.round(a.power * s.mod('reflect'))); M.hp = Math.max(0, M.hp - r); text += ' 結晶の殻が衝撃をはね返した！'; ev.push({ type: 'hit', target: 'monster', part: null, feel: 'ok' }); } // 固有：晶殻の守り
    }
    else if (g === 'pushed') { P.st = Math.max(0, P.st - Math.max(0, RULES.guardPushSt - (gs >= 4 ? 15 : Math.min(2, gs) * 5))); P.afterPushed = true; text = `${a.name}を受けたが、押し込まれた。`; }
    else { P.nextOpening = 1; text = `${a.name}に構えを崩された！`; }
    ev.push({ type: 'guard', result: g });
  } else if (W.kind === 'hammer' && P.opening > 0) {
    mult *= RULES.hammerEndure; text = `${a.name}！ 構わず耐えた。`; // 重槌：崩されにくい
  } else {
    mult *= RULES.openingMult[P.opening] || 1;
    if (P.opening > 0) mult *= 1 - s.mod('openingCut'); // 固有：鎧角の甲
    text = P.opening ? `${a.name}！ 隙を突かれた！` : `${a.name}！`;
  }
  mult *= 100 / (100 + s.G.def); // 守り（22b 2章）
  if (a.element) mult *= 1 - ((s.G.resist[a.element] || 0) + s.mod('resistAdd')) / 100;
  if (P.hp < P.hpMax * 0.3) mult *= 1 - s.mod('lowHpCut'); // 固有：古獣の甲
  if (!P.hitTaken && mult > 0) { mult *= 1 - s.mod('firstHitCut'); } // 固有：砂潜りの皮
  let dmg = Math.round(a.power * mult);
  if (dmg > 0) P.hitTaken = true;
  if (dmg >= P.hp && P.hp > 1 && s.mod('guts') && !P.gutsUsed) { dmg = P.hp - 1; P.gutsUsed = true; text += ' ……守り竜の加護が、倒れかけた体を支えた！'; } // 固有：守り竜の加護
  if (dmg > 0 && a.element && s.mod('elemHitSt')) P.st = Math.min(P.stMax, P.st + s.mod('elemHitSt')); // 固有：凍河の鱗
  if (dmg > 0) { P.hp = Math.max(0, P.hp - dmg); text += ` ${dmg}のダメージ。`; ev.push({ type: 'hit', target: 'player', amount: dmg }); }
  say(ev, text);
  if (counterNow && M.hp > 0) { // 完全に受け止めての反撃
    say(ev, `${P.counter.name}！`); strike(s, P.counter, ev, 1, { counter: true });
  }
  if (W.kind === 'twinblades' && hurt && dmg > 0 && P.momentum > 0) { P.momentum = Math.max(0, P.momentum - 2); ev.push({ type: 'self', key: 'momentum', value: P.momentum }); }
  if (hurt && dmg > 0 && a.ail) {
    const pa = RULES.playerAil[a.ail], ar = s.mod('ailResist');
    const turns = ar >= 3 ? 0 : ar === 2 ? Math.ceil(pa.turns / 2) : Math.max(ar ? 1 : 0, pa.turns - ar);
    if (turns <= 0) say(ev, `${pa.name}を防いだ。`);
    else {
      if (a.ail === 'paralysis') P.paralyzed = turns; else P.ail[a.ail] = turns;
      say(ev, `${pa.name}になった！`); ev.push({ type: 'ail', target: 'player', ail: a.ail });
    }
  }
  if (a.moveTo) moveTo(s, a.moveTo, ev);
  if (a.lands) M.air = false;
  if (a.surface) M.under = false;
  if (a.harden) { M.harden = a.harden + 1; say(ev, mon.hardenText || `${mon.name}の体が硬くなった！ しばらく攻撃が通りにくい。（気力を整える好機）`); ev.push({ type: 'harden' }); }
  if (a.expose) { M.expose = a.expose + 1; say(ev, mon.exposeText || '隠れていた所がさらけ出された！（狙える）'); ev.push({ type: 'expose' }); }
}
/** 防御の結果（Q-26・20b 6章）：受けの強さと攻撃の重さの差。気力が足りないと1段悪くなる */
export function guardResult(guardLevel, act, st) {
  const diff = act.unguardable ? -2 : guardLevel - act.weight;
  if (diff >= 0) return 'full';
  if (diff === -1 && st >= RULES.guardLowSt) return 'pushed';
  return 'broken';
}

function moveTo(s, r, ev) { if (s.range !== r) { s.range = r; ev.push({ type: 'range', range: r }); } }

function endTurn(s, ev) {
  const P = s.P, M = s.M, mon = s.mon;
  P.readByStance = false;
  for (const k of Object.keys(P.cool || {})) if (P.cool[k] > 0) P.cool[k]--;
  if (M.harden > 0) { M.harden--; if (M.harden === 0) say(ev, `${mon.name}の体の硬さが解けた。`); }
  // 本気（第12段階）：体力ではなく「壊された部位の数」か「怒った回数」で切り替わる（体力を教えないため・D-04・D-05）
  if (mon.phase2 && (M.phase || 1) === 1 && (Object.values(M.parts).filter(p => p.broken).length >= mon.phase2.breaks || (M.rageCount || 0) >= mon.phase2.rages)) { M.phase = 2; say(ev, mon.phase2.text); ev.push({ type: 'phase' }); }
  if (M.expose > 0) { M.expose--; if (M.expose === 0) say(ev, mon.hideText || '隠れていた所を、また守りの奥にしまいこんだ。'); }
  // プレイヤーの状態異常
  for (const [k, t] of Object.entries(P.ail)) {
    const pa = RULES.playerAil[k];
    if (pa.dmg) { P.hp = Math.max(0, P.hp - pa.dmg); say(ev, `${pa.name}で${pa.dmg}のダメージ。`); ev.push({ type: 'hit', target: 'player', amount: pa.dmg }); }
    if (t <= 1) delete P.ail[k]; else P.ail[k] = t - 1;
  }
  P.st = Math.min(P.stMax, P.st + RULES.stEndTurn + s.mod('stRegenAdd'));
  if (s.mod('hpRegen') && P.hp > 0) P.hp = Math.min(P.hpMax, P.hp + s.mod('hpRegen')); // 固有：菌獣の根
  if (P.guardUp > 0) P.guardUp--;
  // モンスターの状態異常
  for (const [k, a] of Object.entries(M.ail)) {
    const ma = RULES.monsterAil[k];
    if (a.active > 0) {
      if (ma.dmgRatio) M.hp = Math.max(0, M.hp - Math.round(M.hpMax * ma.dmgRatio));
      a.active--;
      if (a.active === 0) say(ev, `${mon.name}の${ma.name}が治まった。`);
    } else a.v = Math.max(0, a.v - RULES.ail.decay);
  }
  // 怒り（HP と独立。決定 D-05）
  if (M.rage.t > 0) {
    M.rage.t--;
    if (M.rage.t === 0) { M.fatigue.v += 30; say(ev, `${mon.name}の怒りが静まった。`); ev.push({ type: 'rage', on: false }); }
  } else if (M.rage.v >= 100) {
    M.rage.v = 0; M.rage.t = s.rng.int(mon.rage.turns[0], mon.rage.turns[1]); M.rageCount = (M.rageCount || 0) + 1;
    say(ev, `${mon.name}は怒り狂っている！`); ev.push({ type: 'rage', on: true });
  }
  // 疲労（Q-23）
  const F = mon.fatigue;
  if (M.fatigue.t > 0) {
    M.fatigue.t--;
    if (M.fatigue.t === 0) { M.fatigue.v = Math.max(0, M.fatigue.v - F.recover); ev.push({ type: 'tired', on: false }); }
  } else if (M.fatigue.v >= F.threshold && M.rage.t === 0) {
    M.fatigue.t = s.rng.int(F.turns[0], F.turns[1]); say(ev, F.text); ev.push({ type: 'tired', on: true });
  }
  updateAdapt(s, ev);
  // 弱りの兆候（5-2）
  for (const sg of mon.signs || []) {
    if (M.signs.has(sg.id)) continue;
    const w = sg.when;
    if (w.hpBelow != null && M.hp / M.hpMax >= w.hpBelow + 0.08 * Math.min(1, s.mod('insight'))) continue;
    if (w.partBroken && !M.parts[w.partBroken].broken) continue;
    M.signs.add(sg.id); say(ev, sg.text); ev.push({ type: 'sign', id: sg.id });
  }
}

/** 次の行動を決めて予兆を出す */
function captureSign(s, ev) {
  const cap = s.mon.capture; const M = s.M;
  if (!cap || M.capSign) return;
  const at = s.mod('insight') >= 2 ? cap.hpBelow : cap.hpBelow - 0.05;
  if (M.hp / M.hpMax <= at) { M.capSign = true; say(ev, cap.text); ev.push({ type: 'sign', id: 'capture' }); }
}

function plan(s, ev) {
  const M = s.M, A = M.adapt.level;
  if (M.charging) { M.next = M.charging.act; ev.push({ type: 'tell', text: `${M.charging.act.tell}（あと${M.charging.left + 1}）` }); return; }
  const tired = M.fatigue.t > 0, rage = M.rage.t > 0;
  const list = s.mon.acts.filter(a => !M.disabled.has(a.id) && (!a.rageOnly || rage) && !(tired && (a.power ?? 0) >= 28))
    .map(a => {
      let w = a.w;
      if (a.reach && !a.reach.includes(s.range)) w *= a.moveTo ? 1 : 0.15; // 届かない攻撃は選びにくい
      if (a.move && s.range === a.move) w = 0;
      if (a.from && !a.from.includes(s.range)) w = 0; // その間合いからだけ使う
      if (!!a.air !== !!M.air) w = 0; // 飛んでいる間は空の行動だけ、地上では地上の行動だけ
      if (!!a.under !== !!M.under) w = 0; // 潜っている間は地中の行動だけ（第13段階）
      if (a.phase && a.phase !== (M.phase || 1)) w = 0; // 本気（第12段階）：段階ごとの行動
      if (a.harden && M.harden > 0) w = 0;
      if (A.dodge && a.wide) w *= 1 + A.dodge.n;
      if (A.guard && (a.unguardable || a.weight >= 3)) w *= 1 + A.guard.n;
      if (A.ranged && a.reach?.includes('far')) w *= 1 + A.ranged.n;
      if (tired && a.idle) w *= 2;
      if (M.ail.slow?.active > 0 && (a.power ?? 0) >= 28) w *= 0.5;
      return { ...a, w };
    }).filter(a => a.w > 0);
  if (!list.length) { // 選べる行動がない（疲れて空や地中にいる、など）：今の状態で使える行動か、様子見にする
    const fb = s.mon.acts.filter(a => !M.disabled.has(a.id) && !!a.air === !!M.air && !!a.under === !!M.under && !a.rageOnly && !(a.phase && a.phase !== (M.phase || 1)));
    list.push(...(fb.length ? fb : s.mon.acts.filter(a => a.idle)).map(a => ({ ...a, w: 1 })));
    if (!list.length) list.push({ id: '_idle', name: '様子見', idle: true, w: 1 });
  }
  M.next = s.rng.weighted(list);
  const t = M.next.idle ? '' : M.next.tell || '';
  ev.push({ type: 'tell', text: t });
}

/** テスト・試し打ち専用：画面には絶対に使わない */
export function _debugPeek(s) {
  return { hp: s.M.hp, hpMax: s.M.hpMax, rage: s.M.rage.t > 0, tired: s.M.fatigue.t > 0, parts: s.M.parts, adapt: s.M.adapt.level, next: s.M.next?.id };
}
