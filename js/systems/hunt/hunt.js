// 探索・クエスト・拠点の施設のしくみ（画面を持たない）。24 探索・クエスト仕様書・24b。
// 保存データ（save）を受け取って書き換える。できないときは { ok: false, error } を返し、save は変えない。
// 探索中の状態は save.suspend に置く（中断と再開・Q-20：戦闘中に閉じたら戦闘直前の探索マップから）。

import { createRng } from '../../core/rng.js';
import { ITEMS, FOODS, POUCH_SLOTS, ITEM_BOX_MAX, RARITY, SELL_PER_RARITY, SELL_WARN_RARITY, STARTER } from '../../../data/items.js';
import { TIMES_OF_DAY } from '../../../data/index.js';
import { TEST_FIELD, TEST_QUESTS } from '../../../data/testField.js';
import { TEST_MONSTER } from '../../../data/testArena.js';
import { MONSTERS } from '../../../data/monsters.js';
import { FIELDS, QUESTS } from '../../../data/fields.js';
import { HIGH_MONSTERS } from '../../../data/monsters_high.js';
import { HIGH_FIELDS, HIGH_QUESTS } from '../../../data/fields_high.js';
import { MASTER_MONSTERS } from '../../../data/monsters_master.js';
import { MASTER2_MONSTERS } from '../../../data/monsters_master2.js';
import { EX2_MONSTERS, SPECIAL_MONSTERS } from '../../../data/endgame.js';
import { LOW2_MONSTERS } from '../../../data/monsters_low2.js';
import { HIGH2_MONSTERS } from '../../../data/monsters_high2.js';
import { MASTER_FIELDS, MASTER_QUESTS } from '../../../data/fields_master.js';
import { masteryGain, masteryLevel } from '../../../data/weapons.js';
import { CATALOG, find as gearFind, battleWeapon, computeGear } from '../gear/gear.js';

// ─── 一覧（第8段階で正式なデータを足す） ───────────────────
// 正式（第8段階）＋試験用（dev：開発用。クエスト受付では「開発用」の欄にだけ出す）
export const HUNT = {
  fields: [...FIELDS, ...HIGH_FIELDS, ...MASTER_FIELDS, TEST_FIELD], quests: [...QUESTS, ...HIGH_QUESTS, ...MASTER_QUESTS, ...TEST_QUESTS.map(q => ({ ...q, dev: true }))],
  monsters: [...MONSTERS, ...LOW2_MONSTERS, ...HIGH_MONSTERS, ...HIGH2_MONSTERS, ...MASTER_MONSTERS, ...MASTER2_MONSTERS, ...EX2_MONSTERS, ...SPECIAL_MONSTERS, TEST_MONSTER], items: ITEMS, foods: FOODS,
};
const byId = list => Object.fromEntries(list.map(x => [x.id, x]));
const F = byId(HUNT.fields), Q = byId(HUNT.quests), MO = byId(HUNT.monsters), IT = byId(ITEMS), FO = byId(FOODS);
export const find = { field: id => F[id], quest: id => Q[id], monster: id => MO[id], item: id => IT[id], food: id => FO[id] };
export const TIME_IDS = TIMES_OF_DAY.map(t => t.id);
export const TIME_NAME = Object.fromEntries(TIMES_OF_DAY.map(t => [t.id, t.name]));
export const KIND_NAME = { hunt: '通常', survey: '調査', free: '自由探索', special: '特殊' };
export const rarityOf = lv => RARITY[Math.max(1, Math.min(5, lv)) - 1];
export const sellPrice = matId => (gearFind.material(matId)?.rarity ?? 1) * SELL_PER_RARITY;
/** 工房で使い道のある素材（売る前に注意を出す） */
export function usedInCrafting(matId) {
  const costs = [...CATALOG.weapons.flatMap(w => [w.craft, w.upgrade]), ...CATALOG.armors.flatMap(a => [a.craft, a.upgrade]), ...CATALOG.decorations.map(d => d.craft)];
  return costs.some(c => c && c[matId]);
}

// ─── 持ち物を整える ─────────────────────────────────────
export function normalizeHunt(save) {
  const inv = save.inventory ??= {};
  inv.items ??= {}; inv.money ??= 0; inv.materials ??= {};
  save.storage ??= { protect: {}, keep: {} };
  save.research ??= {};
  save.progress ??= {}; save.progress.quests ??= {};
  save.meal ??= null;
  if (save.suspend && !save.suspend.questId) save.suspend = null;
  const flags = save.profile.flags ??= {};
  if (!flags.starter7) { // はじめに渡すもの（仮）
    inv.money += STARTER.money;
    for (const [id, n] of Object.entries(STARTER.items)) inv.items[id] = (inv.items[id] || 0) + n;
    flags.starter7 = true;
  }
  return save;
}

const addTo = (obj, id, n) => { obj[id] = (obj[id] || 0) + n; };
export function research(save, monId) {
  monId = MO[monId]?.baseId ?? monId; // 上位の個体は、元の種の研究に記録する
  const r = save.research[monId] ??= { seen: 0, observed: 0, hunted: 0, captured: 0, parts: {} };
  r.acts ??= {}; r.traces ??= 0; r.places ??= {}; // 第9段階：見た行動・調べた痕跡・出会った場所と時間
  return r;
}
/** 数を数える（物語・個別の話の条件に使う：meals 食事 / sold 売った回数 / quests 達成 / crafted 作った防具） */
export function bumpStat(save, key, n = 1) { const st = save.profile.stats ??= {}; st[key] = (st[key] || 0) + n; }
/** 狩った大型の種類の数（正式な種だけ） */
export function speciesHunted(save, rank = 'low') {
  return HUNT.monsters.filter(m => !m.id.startsWith('mon_test') && !m.baseId && (m.rank || 'low') === rank).filter(m => { const r = save.research?.[m.id]; return r && r.hunted + r.captured > 0; }).length;
}
/** 素材をどこで手に入れたか（図鑑に出す） */
function matSource(save, matId, where) { const s = (save.matLog ??= {})[matId] ??= []; if (!s.includes(where)) s.push(where); }
/** そのクエストの大型（クエストに決まりがあればそれ、なければフィールドの大型） */
export const fieldMonsters = exp => Q[exp.questId]?.monsters ?? F[exp.fieldId].monsters;

// ─── ショップ・食事・素材保管庫 ─────────────────────────
export function buyItem(save, itemId, n = 1) {
  const it = IT[itemId]; if (!it || n < 1) return { ok: false, error: '買えない' };
  const have = save.inventory.items[itemId] || 0;
  if (have + n > ITEM_BOX_MAX) return { ok: false, error: `持てるのは${ITEM_BOX_MAX}個まで` };
  const cost = it.price * n;
  if (save.inventory.money < cost) return { ok: false, error: 'お金が足りない' };
  save.inventory.money -= cost; addTo(save.inventory.items, itemId, n);
  return { ok: true, cost };
}
export function eatFood(save, foodId) {
  const f = FO[foodId]; if (!f) return { ok: false, error: '知らない料理' };
  if (save.meal === foodId) return { ok: false, error: 'もう食べている' };
  if (save.inventory.money < f.price) return { ok: false, error: 'お金が足りない' };
  save.inventory.money -= f.price; save.meal = foodId; bumpStat(save, 'meals');
  return { ok: true };
}
export function setProtect(save, matId, on) { save.storage.protect[matId] = !!on; if (!on) delete save.storage.protect[matId]; return { ok: true }; }
export function setKeep(save, matId, n) { save.storage.keep[matId] = Math.max(0, Math.floor(n) || 0); return { ok: true }; }
/** 1種類を売る。warn が返ったら、画面で確認してから force=true で呼ぶ */
export function sellMaterial(save, matId, n, { force = false } = {}) {
  const have = save.inventory.materials[matId] || 0;
  if (save.storage.protect[matId]) return { ok: false, error: '保護している素材は売れない' };
  if (!(n >= 1) || n > have) return { ok: false, error: '数が合わない' };
  const m = gearFind.material(matId);
  const warn = (m?.rarity ?? 1) >= SELL_WARN_RARITY || usedInCrafting(matId);
  if (warn && !force) return { ok: false, warn: true, error: '大事な素材' };
  save.inventory.materials[matId] = have - n;
  const money = sellPrice(matId) * n; save.inventory.money += money; bumpStat(save, 'sold');
  return { ok: true, money };
}
/** まとめて売る前の一覧：保護していない・注意のいらない素材を「残す数」を残して売る */
export function bulkSellPlan(save) {
  return Object.entries(save.inventory.materials).map(([id, have]) => {
    const keep = save.storage.keep[id] ?? 0, m = gearFind.material(id);
    return { id, name: m?.name ?? id, n: have - keep, money: sellPrice(id) * (have - keep) };
  }).filter(r => r.n > 0 && !save.storage.protect[r.id] && (gearFind.material(r.id)?.rarity ?? 1) < SELL_WARN_RARITY && !usedInCrafting(r.id));
}
export function bulkSell(save) {
  const plan = bulkSellPlan(save); let money = 0;
  for (const r of plan) { save.inventory.materials[r.id] -= r.n; money += r.money; }
  save.inventory.money += money; if (plan.length) bumpStat(save, 'sold');
  return { ok: true, money, sold: plan };
}

// ─── 持ち込み（ポーチ） ──────────────────────────────────
export function pouchProblems(save, pouch, q = null) {
  const p = []; const kinds = Object.entries(pouch).filter(([, n]) => n > 0);
  for (const [id] of kinds) if (q?.ban?.includes(id)) p.push(`この依頼には${IT[id]?.name ?? 'その道具'}を持ち込めない`); // 高難度の依頼（90）
  if (kinds.length > POUCH_SLOTS) p.push(`ポーチに入るのは${POUCH_SLOTS}種類まで`);
  for (const [id, n] of kinds) {
    const it = IT[id]; if (!it) { p.push('知らない道具'); continue; }
    if (n > it.max) p.push(`${it.name}は${it.max}個まで`);
    if (n > (save.inventory.items[id] || 0)) p.push(`${it.name}が足りない`);
  }
  return p;
}
/** 前回と同じ持ち込み（持っている数・上限の範囲で） */
export function defaultPouch(save) {
  const last = save.progress.lastPouch || { itm_potion: 10, itm_antidote: 2, itm_trap: 2, itm_knife: 5 };
  const out = {};
  for (const [id, n] of Object.entries(last)) { const m = Math.min(n, IT[id]?.max ?? 0, save.inventory.items[id] || 0); if (m > 0) out[id] = m; }
  return out;
}

/** 強化個体の依頼（q_ex_）をいくつ終えたか（90） */
export const exCleared = (save, prefix = 'q_ex_') => Object.entries(save.progress?.quests || {}).filter(([id, v]) => id.startsWith(prefix) && v?.cleared > 0).length;
/** 持ち込めない道具を外した持ち込み */
export const allowedPouch = (pouch, q) => Object.fromEntries(Object.entries(pouch).filter(([id]) => !q?.ban?.includes(id)));

/** そのクエストを受けられるか（23b 5章：前の大型を討伐か捕獲すると増える） */
export function questUnlocked(save, q) {
  if (q.rank === 'high' && !save.profile.flags?.highOpen) return false; // 上位は、下位の最後の依頼のあと
  if (q.rank === 'master' && !save.profile.flags?.masterOpen) return false; // マスター級は、上位の最後の依頼のあと
  if (q.unlock?.masterSpecies && speciesHunted(save, 'master') < q.unlock.masterSpecies) return false;
  if (q.unlock?.cleared && !(save.progress?.quests?.[q.unlock.cleared]?.cleared > 0)) return false;
  if (q.unlock?.exCleared && exCleared(save) < q.unlock.exCleared) return false; // おまけ要素：強化個体の依頼をいくつ終えたか
  if (q.unlock?.hardCleared && exCleared(save, 'q_hd_') < q.unlock.hardCleared) return false; // 高難度の依頼をいくつ終えたか
  if (q.unlock?.highSpecies && speciesHunted(save, 'high') < q.unlock.highSpecies) return false;
  if (q.unlock?.species && speciesHunted(save) < q.unlock.species) return false; // 下位の最後の依頼など
  const need = q.unlock?.hunted; if (!need) return true;
  const r = save.research?.[need]; return !!r && (r.hunted + r.captured) > 0;
}

// ─── クエストを始める ───────────────────────────────────
export function startQuest(save, questId, pouch, seed = Date.now()) {
  const q = Q[questId]; if (!q) return { ok: false, error: '知らないクエスト' };
  if (save.suspend) return { ok: false, error: '探索の途中です' };
  if (!questUnlocked(save, q)) return { ok: false, error: 'まだ受けられない' };
  const probs = pouchProblems(save, pouch, q); if (probs.length) return { ok: false, error: probs[0] };
  const field = F[q.fieldId];
  const kept = {};
  for (const [id, n] of Object.entries(pouch)) if (n > 0) { save.inventory.items[id] -= n; kept[id] = n; }
  const gather = computeGear(save).mods.gatherAdd || 0;
  save.progress.lastPouch = { ...kept };
  save.suspend = {
    questId, fieldId: field.id, seed: String(seed), start: TIME_IDS.indexOf(q.start || 'dawn'), tick: 0,
    actionsMax: field.actions + gather, used: 0, point: field.points.find(p => p.camp).id,
    pouch: { ...kept }, brought: { ...kept }, food: save.meal, gathered: {}, done: {}, observed: {},
    mons: Object.fromEntries((q.monsters ?? field.monsters).map(m => [m.monsterId, { state: 'free', at: null, snap: null, broken: {} }])),
    faints: 0, traces: 0, cleared: false, failed: null, inBattle: null,
    masteryStart: { ...(save.mastery || {}) }, log: [`${q.name}：${field.name}に着いた。（${TIME_NAME[q.start || 'dawn']}）`],
  };
  save.meal = null; // 食事は1回の狩りで使い切る
  save.progress.quests[questId] ??= {};
  save.progress.quests[questId].tried = (save.progress.quests[questId].tried || 0) + 1;
  return { ok: true };
}

// ─── 探索の様子 ─────────────────────────────────────────
export const timeAbs = exp => exp.start + Math.floor(exp.tick / 3);
export const timeId = exp => TIME_IDS[timeAbs(exp) % 4];
export const actionsLeft = exp => Math.max(0, exp.actionsMax - exp.used);
export function monsterPoint(exp, entry) {
  const m = exp.mons[entry.monsterId];
  if (!m || m.state === 'hunted' || m.state === 'captured') return null;
  return m.at ?? entry.at[timeId(exp)];
}
export function monstersAt(exp, pointId) {
  return fieldMonsters(exp).filter(e => monsterPoint(exp, e) === pointId).map(e => MO[e.monsterId]);
}
const point = (exp, id) => F[exp.fieldId].points.find(p => p.id === id);
const timeOk = (row, t) => !row.times || row.times.includes(t);

/** そのポイントでできること（理由つき） */
export function pointActions(exp, pointId) {
  const p = point(exp, pointId); if (!p) return [];
  const left = actionsLeft(exp), done = exp.done[pointId] || {}, t = timeId(exp);
  const noAct = left <= 0 ? '行動回数が残っていない' : '';
  const out = [];
  if (p.gather) {
    const any = p.gather.some(r => timeOk(r, t));
    out.push({ id: 'gather', label: '採取する', disabled: !!(done.gather || noAct || !any), reason: done.gather ? 'このクエストではもう採った' : noAct || (!any ? '今の時間は何も採れない' : '') });
  }
  if (p.survey) out.push({ id: 'survey', label: '調べる', disabled: !!(done.survey || noAct), reason: done.survey ? 'もう調べた' : noAct });
  for (const m of monstersAt(exp, pointId)) {
    out.push({ id: 'observe', monsterId: m.id, label: `${m.name}を観察する`, disabled: !!(exp.observed[m.id] || noAct), reason: exp.observed[m.id] ? 'もう観察した' : noAct });
    out.push({ id: 'fight', monsterId: m.id, label: `${m.name}と戦う`, disabled: false, reason: '' });
  }
  return out;
}

function rollTable(rng, table, t) {
  const rows = table.filter(r => timeOk(r, t)); if (!rows.length) return null;
  const sum = rows.reduce((a, r) => a + r.w, 0); let x = rng.range(0, sum);
  for (const r of rows) { x -= r.w; if (x < 0) return r; }
  return rows[rows.length - 1];
}
const rngFor = (exp, tag) => createRng(`${exp.seed}:${tag}:${exp.tick}:${exp.used}`);

/** 移動（行動回数を使わない・Q-36） */
export function moveTo(save, pointId) {
  const exp = save.suspend; if (!exp || !point(exp, pointId)) return { ok: false, error: '行けない' };
  exp.point = pointId;
  const ms = monstersAt(exp, pointId);
  for (const m of ms) { // 出会った回数（同じ場所で何度も数えない）
    if (exp.mons[m.id].seenHere !== pointId) research(save, m.id).seen++;
    research(save, m.id).places[`${exp.fieldId}:${pointId}:${timeId(exp)}`] = true;
    exp.mons[m.id].seenHere = pointId;
  }
  return { ok: true, monsters: ms };
}

/** 採取・調査・観察（1回ずつ行動回数を使う） */
export function doAction(save, kind, monsterId) {
  const exp = save.suspend; if (!exp) return { ok: false, error: '探索中ではない' };
  const p = point(exp, exp.point), a = pointActions(exp, exp.point).find(x => x.id === kind && (!monsterId || x.monsterId === monsterId));
  if (!a || a.disabled) return { ok: false, error: a?.reason || 'できない' };
  const t = timeId(exp), rng = rngFor(exp, kind), got = {}, lines = [];
  const done = exp.done[exp.point] ??= {};
  if (kind === 'gather') {
    for (let i = 0; i < 2; i++) { const r = rollTable(rng, p.gather, t); if (r) addTo(got, r.id, rng.int(r.n[0], r.n[1])); }
    done.gather = true; lines.push(`${p.name}で採取した。`);
  } else if (kind === 'survey') {
    done.survey = true; lines.push(p.survey.text);
    if (p.survey.trace) {
      exp.traces++; lines.push(`痕跡を記録した。（${exp.traces}つ目）`);
      const owner = F[exp.fieldId].monsters[0]?.monsterId; if (owner) research(save, owner).traces++; // そのフィールドの主の研究になる
    }
    const r = p.survey.mats && rollTable(rng, p.survey.mats, t); if (r) addTo(got, r.id, rng.int(r.n[0], r.n[1]));
  } else if (kind === 'observe') {
    const m = MO[monsterId]; exp.observed[monsterId] = true; research(save, monsterId).observed++;
    lines.push(m.observe?.[t] || `${m.name}の様子をじっくり見た。`);
  }
  for (const [id, n] of Object.entries(got)) { addTo(exp.gathered, id, n); matSource(save, id, `${F[exp.fieldId].name}・${p.name}`); lines.push(`${gearFind.material(id)?.name ?? id}を${n}個手に入れた。`); }
  exp.used++; exp.tick++;
  afterTime(save, lines);
  exp.log.push(...lines);
  return { ok: true, lines, got };
}

/** 制限時間：出発より後の時間ならその日、前（か同じ）なら翌日のその時間 */
export function limitAbs(exp, q) { const i = TIME_IDS.indexOf(q.limit); return i > exp.start ? i : i + 4; }
/** 時間が進んだあとの決まり（特殊クエストの制限時間） */
function afterTime(save, lines) {
  const exp = save.suspend, q = Q[exp.questId];
  if (q.limit && !exp.cleared && timeAbs(exp) >= limitAbs(exp, q)) { exp.failed = 'time'; lines.push(`${TIME_NAME[q.limit]}になってしまった……制限時間を過ぎた。`); }
}

/** 目標の達成を調べる */
export function goalStatus(save) {
  const exp = save.suspend, q = Q[exp.questId], g = q.goal;
  if (g.type === 'hunt') { const st = exp.mons[g.monsterId]?.state; return { done: st === 'hunted' || st === 'captured', text: g.text }; }
  if (g.type === 'capture') { const st = exp.mons[g.monsterId]?.state; return { done: st === 'captured', lost: st === 'hunted', text: g.text }; }
  if (g.type === 'huntAll') {
    const n = g.monsterIds.filter(id => ['hunted', 'captured'].includes(exp.mons[id]?.state)).length;
    return { done: n === g.monsterIds.length, text: `${g.text}（${n}/${g.monsterIds.length}）` };
  }
  if (g.type === 'survey') return { done: exp.traces >= g.count, text: `${g.text}（${Math.min(exp.traces, g.count)}/${g.count}）` };
  return { done: false, free: true, text: g.text };
}
function extraDone(exp, x) {
  const m = exp.mons[x.monsterId];
  if (x.type === 'break') return !!m?.broken[x.part];
  if (x.type === 'capture') return m?.state === 'captured';
  if (x.type === 'observe') return !!exp.observed[x.monsterId];
  return false;
}
export function extraStatus(save) { const exp = save.suspend; return (Q[exp.questId].extra || []).map(x => ({ ...x, done: extraDone(exp, x) })); }

// ─── 戦闘とのつなぎ ──────────────────────────────────────
/** 戦闘画面に渡すもの（食事の効き目・ポーチの中身・前の戦いの傷を入れる） */
/** 高難度の依頼（90）：その依頼のあいだだけ、相手の体力と攻撃を強くする */
export function boostMonster(mon, k) {
  if (!k || k === 1) return mon;
  return { ...mon, hp: Math.round(mon.hp * k), acts: mon.acts.map(a => (a.power ? { ...a, power: Math.round(a.power * k) } : a)) };
}
export function battleSetup(save, monsterId) {
  const exp = save.suspend, mon = boostMonster(MO[monsterId], Q[exp.questId]?.boost), m = exp.mons[monsterId];
  const { weapon, gear } = battleWeapon(save);
  const food = exp.food && FO[exp.food];
  if (food) for (const [k, v] of Object.entries(food.mods)) { if (k === 'defAdd') gear.def += v; else gear.mods[k] = (gear.mods[k] || 0) + v; }
  const items = Object.entries(exp.pouch).filter(([, n]) => n > 0).map(([id, n]) => ({ ...IT[id], count: n }));
  const prior = { ...(m.snap || {}), faints: exp.faints };
  if (m.snap) prior.range = 'mid';
  exp.inBattle = monsterId; // 閉じたら、ここから（戦闘の直前）再開する。戦闘の前に保存しておくこと
  return { monster: mon, weapon, gear, items, prior, seed: `${exp.seed}:b${exp.tick}:${exp.faints}`, field: F[exp.fieldId].art, hunt: true };
}

/**
 * 戦闘の結果を探索に戻す。
 * @param {{result:string, turns:number, snapshot?:object, items:object[], acts:number, broken:string[], kindId:string}} out
 * @returns {{ lines: string[], end: null|'fail' }}
 */
export function applyBattle(save, monsterId, out) {
  const exp = save.suspend, m = exp.mons[monsterId], mon = MO[monsterId], lines = [];
  exp.inBattle = null;
  for (const it of out.items || []) exp.pouch[it.id] = it.count;
  for (const k of out.broken || []) { m.broken[k] = true; research(save, monsterId).parts[k] = true; }
  for (const a of out.seenActs || []) research(save, monsterId).acts[a] = true; // 戦闘で実際に見た行動（図鑑・Q-34）
  // 熟練度（その武器で行った行動の数だけ・勝ち負けに関係なし）
  const gain = masteryGain(out.acts || 0);
  if (gain && out.kindId) { save.mastery ??= {}; save.mastery[out.kindId] = (save.mastery[out.kindId] || 0) + gain; }
  // 時間：戦闘中は進めず、終わったときに「ターン数÷10」回ぶん進める（Q-27）
  const steps = Math.floor((out.turns || 0) / 10);
  if (steps) { exp.tick += steps * 3; lines.push(`戦っているうちに時が過ぎた。（${TIME_NAME[timeId(exp)]}）`); }
  const r = out.result;
  if (r === 'win') { m.state = 'hunted'; m.snap = null; research(save, monsterId).hunted++; lines.push(`${mon.name}を討伐した！`); }
  else if (r === 'capture') { m.state = 'captured'; m.snap = null; research(save, monsterId).captured++; lines.push(`${mon.name}を捕獲した！`); }
  else if (r === 'faint') { // 野営地へ戻る。傷・部位破壊は残る（Q-16・Q-25）
    m.snap = out.snapshot; exp.faints = out.snapshot.faints; exp.point = F[exp.fieldId].points.find(p => p.camp).id;
    lines.push(`力尽きた……（${exp.faints}/3）　野営地で手当てを受けた。`);
  } else if (r === 'fled') { // 別の場所へ逃げる（Q-17）
    m.snap = out.snapshot; exp.faints = out.snapshot.faints; m.state = 'fled';
    const entry = fieldMonsters(exp).find(e => e.monsterId === monsterId);
    const to = entry.lairs.find(l => l !== exp.point) || entry.lairs[0]; m.at = to;
    lines.push(`${mon.name}は${point(exp, to).name}の方へ逃げていった。足跡が続いている。`);
  } else if (r === 'fail') { exp.faints = 3; exp.failed = 'faint'; lines.push('3回力尽きた。これ以上は続けられない。'); }
  else if (r === 'retreat') { exp.failed = 'retreat'; lines.push('撤退した。'); }
  if (goalStatus(save).lost && !exp.failed) { exp.failed = 'killed'; lines.push('捕獲の依頼だったのに、仕留めてしまった……'); }
  if (goalStatus(save).done && !exp.cleared) { exp.cleared = true; lines.push('クエストの目標を達成した！ 探索を続けるか、拠点へ帰ろう。'); }
  afterTime(save, lines);
  exp.log.push(...lines);
  return { lines, end: exp.failed ? 'fail' : null };
}

// ─── クエストを終える ───────────────────────────────────
/** 帰還（達成していれば成功・自由探索は終了・それ以外は撤退）。報酬を渡し、探索を片づける */
export function finishQuest(save) {
  const exp = save.suspend; if (!exp) return { ok: false, error: '探索中ではない' };
  const q = Q[exp.questId], rng = createRng(`${exp.seed}:reward`);
  const gs = goalStatus(save);
  const outcome = exp.failed ? 'fail' : gs.free ? 'free' : gs.done ? 'clear' : 'retreat';
  const reward = {}, extras = []; let money = 0;
  const roll = (table, n) => { for (let i = 0; i < n; i++) { const r = rollTable(rng, table); if (r) addTo(reward, r.id, r.n ? rng.int(r.n[0], r.n[1]) : 1); } };
  if (outcome === 'clear') {
    money += q.reward.money;
    const n = rng.int(q.reward.n[0], q.reward.n[1]);
    if (q.reward.mats) roll(q.reward.mats, n);
    for (const id of q.goal.monsterIds ?? (q.goal.monsterId ? [q.goal.monsterId] : [])) {
      const mon = MO[id], st = exp.mons[id];
      roll(st.state === 'captured' ? mon.rewards.capture : mon.rewards.hunt, n);
      for (const k of Object.keys(st.broken)) if (mon.rewards.parts[k]) addTo(reward, mon.rewards.parts[k], 1); // 壊した部位は必ず1つ
      for (const m of Object.keys(mon.rewards.parts).map(k => mon.rewards.parts[k]).concat(mon.rewards.hunt.map(r => r.id), mon.rewards.capture.map(r => r.id))) if (reward[m]) matSource(save, m, `${mon.name}の${st.state === 'captured' ? '捕獲' : '狩猟'}`);
    }
    for (const x of extraStatus(save)) if (x.done) { money += x.money; roll(x.mats, 1); extras.push(x.text); }
  }
  // 渡す：報酬・探索で拾った物（失敗・撤退でも持ち帰る：Q-38）・使わなかった道具
  save.inventory.money += money;
  for (const [id, n] of Object.entries(reward)) addTo(save.inventory.materials, id, n);
  for (const [id, n] of Object.entries(exp.gathered)) addTo(save.inventory.materials, id, n);
  const used = {};
  for (const [id, n] of Object.entries(exp.brought)) { const left = exp.pouch[id] || 0; addTo(save.inventory.items, id, left); if (n - left > 0) used[id] = n - left; }
  const mastery = Object.entries(save.mastery || {}).filter(([k, v]) => v > (exp.masteryStart[k] || 0))
    .map(([k, v]) => ({ kindId: k, gain: v - (exp.masteryStart[k] || 0), level: masteryLevel(v), up: masteryLevel(v) > masteryLevel(exp.masteryStart[k] || 0) }));
  if (outcome === 'clear') bumpStat(save, 'quests');
  if (outcome === 'clear' && q.final === 'low') { save.profile.flags.highOpen = true; save.profile.rankId = 'rank_high'; } // 下位の最後の依頼 → 上位が開く（P-17）
  if (outcome === 'clear' && q.final === 'master') save.profile.flags.masterClear = true; // マスター級の最後 → エンドコンテンツの入口
  if (outcome === 'clear' && q.final === 'ex') save.profile.flags.exClear = true; // おまけ要素の最後の依頼（90）
  if (outcome === 'clear' && q.final === 'high') { save.profile.flags.masterOpen = true; save.profile.rankId = 'rank_master'; } // 上位の最後の依頼 → マスター級が開く
  if (outcome === 'clear' || outcome === 'free') save.progress.quests[q.id].cleared = (save.progress.quests[q.id].cleared || 0) + (outcome === 'clear' ? 1 : 0);
  save.profile.days = (save.profile.days || 1) + 1;
  const summary = { questId: q.id, name: q.name, outcome, reason: exp.failed, money, reward, gathered: { ...exp.gathered }, used, extras, mastery };
  save.lastHunt = summary;
  save.suspend = null;
  return { ok: true, summary };
}
