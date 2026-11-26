// 装備・スキル・製作のしくみ（画面を持たない）。22 防具・装飾品仕様書・22b。
// 保存データ（save）を受け取り、計算したり、書き換えたりする。書き換える関数は
// 成功したら { ok: true, ... }、できないときは { ok: false, error } を返す（save は変えない）。

import { SKILLS, SKILL_THRESHOLDS, SKILL_MAX } from '../../../data/skills.js';
import { WEAPON_KINDS, buildWeapon, masteryLevel } from '../../../data/weapons.js';
import { SLOT_SIZES, ARMOR_PARTS } from '../../../data/index.js';
import {
  TEST_ARMORS, TEST_ARMOR_SETS, TEST_DECORATIONS, TEST_MATERIALS, BASE_WEAPONS, TEST_WEAPON_TREE,
  ARMOR_MAX_LEVEL, ARMOR_DEF_PER_LEVEL,
} from '../../../data/testGear.js';
import { MATERIALS, ARMOR_SETS, ARMORS, DECORATIONS, WEAPON_TREE } from '../../../data/gear.js';
import { HIGH_MATERIALS, HIGH_ARMOR_SETS, HIGH_ARMORS, HIGH_DECORATIONS, HIGH_WEAPON_TREE, GATHER_ARMOR_SETS, GATHER_ARMORS } from '../../../data/gear_high.js';
import { LOW2_MATERIALS, LOW2_ARMOR_SETS, LOW2_ARMORS, LOW2_WEAPON_TREE } from '../../../data/gear_low2.js';
import { HIGH2_MATERIALS, HIGH2_ARMOR_SETS, HIGH2_ARMORS, HIGH2_WEAPON_TREE, HIGH2_DECORATIONS } from '../../../data/gear_high2.js';
import { EX_MATERIALS, EX_WEAPON_TREE, EX_ARMOR_SETS, EX_ARMORS } from '../../../data/endgame.js';
import { MASTER2_MATERIALS, MASTER2_ARMOR_SETS, MASTER2_ARMORS, MASTER2_DECORATIONS, MASTER2_WEAPON_TREE } from '../../../data/gear_master2.js';
import { applyNames } from '../../../data/names.js';
import { uniqueOf } from '../../../data/uniques.js';
import { keepWeapon } from '../../../data/weapon_lines.js';
import { MASTER_MATERIALS, MASTER_ARMOR_SETS, MASTER_ARMORS, MASTER_DECORATIONS, MASTER_WEAPON_TREE, MASTER_GATHER_SETS, MASTER_GATHER_ARMORS } from '../../../data/gear_master.js';

// ─── 一覧：正式（第8段階）＋試験用（dev：開発用。持っていれば使えるが、工房の一覧には出さない） ──
const dev = list => list.map(x => ({ ...x, dev: true }));
export const CATALOG = {
  weapons: [...BASE_WEAPONS, ...WEAPON_TREE, ...LOW2_WEAPON_TREE, ...HIGH_WEAPON_TREE, ...HIGH2_WEAPON_TREE, ...MASTER_WEAPON_TREE, ...MASTER2_WEAPON_TREE, ...EX_WEAPON_TREE, ...dev(TEST_WEAPON_TREE)],
  armors: [...ARMORS, ...LOW2_ARMORS, ...GATHER_ARMORS, ...HIGH_ARMORS, ...HIGH2_ARMORS, ...MASTER_GATHER_ARMORS, ...MASTER_ARMORS, ...MASTER2_ARMORS, ...EX_ARMORS, ...dev(TEST_ARMORS)],
  sets: [...ARMOR_SETS, ...LOW2_ARMOR_SETS, ...GATHER_ARMOR_SETS, ...HIGH_ARMOR_SETS, ...HIGH2_ARMOR_SETS, ...MASTER_GATHER_SETS, ...MASTER_ARMOR_SETS, ...MASTER2_ARMOR_SETS, ...EX_ARMOR_SETS, ...TEST_ARMOR_SETS],
  decorations: [...DECORATIONS, ...HIGH_DECORATIONS, ...HIGH2_DECORATIONS, ...MASTER_DECORATIONS, ...MASTER2_DECORATIONS, ...dev(TEST_DECORATIONS)],
  materials: [...MATERIALS, ...LOW2_MATERIALS, ...HIGH_MATERIALS, ...HIGH2_MATERIALS, ...MASTER_MATERIALS, ...MASTER2_MATERIALS, ...EX_MATERIALS, ...dev(TEST_MATERIALS)],
};
// 1体の素材から作れる武器は2種類まで（data/weapon_lines.js）。消えた派生を持っている記録は、normalize で近い武器に置き換える
const ALL_WEAPONS = CATALOG.weapons;
CATALOG.weapons = CATALOG.weapons.filter(keepWeapon);
applyNames(CATALOG); // 装備の名前を付け直す（data/names.js）
const byId = list => Object.fromEntries(list.map(x => [x.id, x]));
const W = byId(CATALOG.weapons), A = byId(CATALOG.armors), S = byId(CATALOG.sets), D = byId(CATALOG.decorations), SK = byId(SKILLS);
export const find = { weapon: id => W[id], armor: id => A[id], set: id => S[id], deco: id => D[id], skill: id => SK[id], material: id => CATALOG.materials.find(m => m.id === id) };
/** セットボーナスが何をくれるか：「守り Lv+1」（スキル点のLvに足す・2026-11-26） */
export function grantText(grants) {
  return Object.entries(grants || {}).map(([k, l]) => `${SK[k]?.name ?? k} Lv+${l}`).join('・');
}
/** 防具の固有スキルの説明（data/uniques.js） */
export function uniqueText(piece) { const u = uniqueOf(piece); return u ? `${u.name}（${u.text}）` : ''; }

/** 戦闘エンジンが読む補正の初期値（スキルなし） */
export const NO_MODS = Object.freeze({
  atkMult: 0, weakMult: 0, partMult: 0, heavyMult: 0, multiHitMult: 0, elemMult: 0, ailMult: 0,
  defAdd: 0, hpAdd: 0, guardSkill: 0, dodgeStReduce: 0, resistAdd: 0, ailResist: 0,
  stAdd: 0, stRegenAdd: 0, chanceAdd: 0, counterMult: 0, adaptSlow: 0, insight: 0, gatherAdd: 0,
});

// ─── 持ち物を整える ─────────────────────────────────────
/** 古い保存データや新しく始めたデータに、足りない形を足す（中身は消さない） */
export function normalize(save) {
  const inv = save.inventory ??= {};
  inv.weapons ??= []; inv.armors ??= []; inv.materials ??= {}; inv.nextUid ??= 1;
  // 装飾品は「id → 個数」。古い形（配列）だと保存のときに中身が消えるので直す（不具合 B-007）
  if (!inv.decorations || Array.isArray(inv.decorations)) inv.decorations = Object.assign({}, ...(Array.isArray(inv.decorations) ? inv.decorations.filter(d => d && typeof d === 'object') : []));
  const lo = save.loadout ??= {};
  lo.armor ??= {}; lo.techs ??= {};
  for (const w of inv.weapons) if (!find.weapon(w.nodeId)) { const r = replacementFor(w.nodeId); if (r) { w.nodeId = r.id; w.decos = r.slots.map((sz, i) => w.decos?.[i] ?? null); } } // 減らした派生を持っていたら置き換える
  for (const b of BASE_WEAPONS) { // 6種の武器は最初から全部使える（D-09）
    if (!inv.weapons.some(w => find.weapon(w.nodeId)?.kindId === b.kindId)) inv.weapons.push({ uid: newUid(save), nodeId: b.id, decos: b.slots.map(() => null) });
  }
  if (!inv.weapons.some(w => w.uid === lo.weaponUid)) lo.weaponUid = inv.weapons[0].uid;
  if (!save.learned) { // 技の習得（21c）より前の記録：熟練度で使えていた技は、覚えた扱いのまま
    save.learned = {};
    for (const [k, K] of Object.entries(WEAPON_KINDS)) {
      const lv = masteryLevel(save.mastery?.[k] ?? 0);
      save.learned[k] = K.techs.filter(t => t.unlock > 0 && t.unlock <= lv && t.rank !== 'high').map(t => t.id);
    }
  }
  for (const [part, uid] of Object.entries(lo.armor)) if (uid && !inv.armors.some(a => a.uid === uid)) lo.armor[part] = null;
  return save;
}
function newUid(save) { return save.inventory.nextUid++; }

// ─── 素材とお金（2026-11-25 ユーザー：「強化の素材が同じものばかりはやめて。必要な物・個数・金額を変えて差別化」） ──
// 費用の中の 'money' はお金（ルク）。ほかは素材の id。
export const MONEY = 'money';
const isMonMat = id => /^mat_(m\d|ex_)/.test(id);
const PART_MUL = { head: 1, chest: 1.5, arms: 1, waist: 0.75, legs: 1.25 };
const RANK_ARMOR = { low: { craft: 150, up: 30 }, high: { craft: 600, up: 40 }, master: { craft: 1000, up: 80 } }; // 1回の狩りの報酬（下位500・上位1400・マスター級3000前後）で、1式を作って強化しきるのに7〜9回ほど
const TIER_MONEY = [0, 200, 400, 900, 1400, 3000, 4500, 8000];
const DECO_MONEY = { low: 150, high: 500, master: 1500 };
// 武器の種類で、要る素材の比重を変える：[いちばん多い素材の倍率, 2番目の素材を足す数, その土地の素材を足す数]
const KIND_MIX = { greatsword: [1.25, 0, 0], hammer: [1.25, 0, 1], twinblades: [0.75, 1, 0], bow: [0.75, 2, 0], lance: [1, 1, 1], chainblade: [0.9, 1, 0] };
const r10 = n => Math.max(10, Math.round(n / 10) * 10);
function mixWeaponCost(cost, kind) {
  if (!cost) return cost;
  const [mul, addSecond, addField] = KIND_MIX[kind] ?? [1, 0, 0];
  const mon = Object.keys(cost).filter(isMonMat), field = Object.keys(cost).filter(id => !isMonMat(id) && id !== MONEY);
  const out = { ...cost };
  if (mon[0]) out[mon[0]] = Math.max(1, Math.round(cost[mon[0]] * mul));
  if (mon[1] && addSecond) out[mon[1]] = cost[mon[1]] + addSecond;
  if (field[0] && addField) out[field[0]] = cost[field[0]] + addField;
  return out;
}
/** 防具の強化：段階で要る物が変わる（Lv1〜3 よく出る素材／Lv4〜6 部位の素材も／Lv7〜 めずらしい素材とその土地の鉱石）。部位で個数、ランクでお金が変わる */
function armorUpTable(p) {
  const rarity = id => find.material(id)?.rarity ?? 1;
  const mon = Object.keys(p.craft).filter(isMonMat).sort((a, b) => rarity(a) - rarity(b));
  const field = [...new Set([...Object.keys(p.craft), ...Object.keys(p.upgrade || {})])].filter(id => !isMonMat(id) && id !== MONEY);
  const pm = PART_MUL[p.part] ?? 1, money = (RANK_ARMOR[p.rank || 'low'] ?? RANK_ARMOR.low).up;
  const max = armorMaxLevel(p), tab = {};
  for (let lv = 1; lv < max; lv++) {
    const c = {}, add = (id, n) => { if (id && n > 0) c[id] = (c[id] || 0) + Math.ceil(n); };
    if (mon.length) {
      if (lv <= 3) add(mon[0], (lv + 1) * pm * 0.8);
      else if (lv <= 6) { add(mon[0], lv * pm * 0.6); add(mon[1] ?? mon[0], (lv - 2) * pm * 0.5); }
      else { add(mon[1] ?? mon[0], lv * pm * 0.4); add(mon[mon.length - 1], 1 + Math.floor((lv - 7) / 2)); }
    }
    if (field.length) add(lv >= 7 ? field[field.length - 1] : field[0], 1 + Math.floor(lv / 3));
    if (!mon.length && field[1]) add(field[1], lv * pm * 0.6); // 採取の防具は、その土地の素材だけで強くする
    c[MONEY] = r10(money * lv * pm);
    tab[lv] = c;
  }
  return tab;
}
function applyCosts(C) {
  for (const w of C.weapons) {
    if (w.dev || !w.tier) continue;
    const kind = w.kindId.slice(3), m = TIER_MONEY[w.tier] ?? 9000;
    w.craft = { ...mixWeaponCost(w.craft, kind), [MONEY]: r10(m) };
    if (w.upgrade) w.upgrade = { ...mixWeaponCost(w.upgrade, kind), [MONEY]: r10(m * 0.55) };
  }
  for (const a of C.armors) {
    if (a.dev) continue;
    a.craft = { ...a.craft, [MONEY]: r10((RANK_ARMOR[a.rank || 'low'] ?? RANK_ARMOR.low).craft * (PART_MUL[a.part] ?? 1)) };
    a._up = null; // 強化の表は初めて使うときに作る（find が使えるようになってから）
  }
  for (const d of C.decorations) if (!d.dev) d.craft = { ...d.craft, [MONEY]: DECO_MONEY[d.rank || 'low'] ?? 150 };
}
applyCosts(CATALOG); // 作る・強化するのに要る素材とお金
/** 一覧から消した派生の代わり：同じ種類・同じ段（なければ1つ下の段）で、同じ属性のものを優先 */
export function replacementFor(oldId) {
  const o = ALL_WEAPONS.find(x => x.id === oldId); if (!o) return null;
  const el = x => x.element?.type ?? x.ail?.type ?? null;
  const pool = CATALOG.weapons.filter(x => x.kindId === o.kindId && !x.dev);
  for (let t = o.tier; t >= 0; t--) {
    const same = pool.filter(x => x.tier === t); if (!same.length) continue;
    return same.find(x => el(x) === el(o)) ?? same[0];
  }
  return pool[0] ?? null;
}
/** 試し打ち用：その種類で、その段にある派生のうち、相手にいちばん効くもの（なければ1つ下の段） */
export function bestWeaponFor(kindId, tier, monster) {
  const pool = CATALOG.weapons.filter(x => x.kindId === kindId && !x.dev && x.parentId);
  const score = x => (x.element ? (monster?.elem?.[x.element.type] ?? 1) * x.element.value : 0) + (x.ail ? (monster?.ailRes?.[x.ail.type] ? 1 / monster.ailRes[x.ail.type] : 1) * x.ail.value * 0.5 : 0) + x.powerMult * 100;
  for (let t = tier; t >= 1; t--) { const same = pool.filter(x => x.tier === t); if (same.length) return same.sort((a, b) => score(b) - score(a))[0]; }
  return CATALOG.weapons.find(x => x.kindId === kindId && !x.parentId);
}

// ─── 素材 ───────────────────────────────────────────────
const haveOf = (save, m) => (m === MONEY ? save.inventory.money || 0 : save.inventory.materials[m] || 0);
export function missing(save, cost = {}) {
  return Object.entries(cost).filter(([m, n]) => haveOf(save, m) < n)
    .map(([m, n]) => ({ id: m, name: m === MONEY ? 'ルク' : find.material(m)?.name ?? m, need: n, have: haveOf(save, m) }));
}
function pay(save, cost = {}) { for (const [m, n] of Object.entries(cost)) { if (m === MONEY) save.inventory.money = (save.inventory.money || 0) - n; else save.inventory.materials[m] -= n; } }

// ─── 装飾品 ─────────────────────────────────────────────
export function slotFits(slotSize, decoSize) { return SLOT_SIZES.find(s => s.id === slotSize)?.fits.includes(decoSize) ?? false; }
function allItems(save) { return [...save.inventory.weapons.map(x => ({ x, kind: 'weapon' })), ...save.inventory.armors.map(x => ({ x, kind: 'armor' }))]; }
export function decoInUse(save, decoId) { return allItems(save).reduce((n, { x }) => n + x.decos.filter(d => d === decoId).length, 0); }
export function decoFree(save, decoId) { return (save.inventory.decorations[decoId] || 0) - decoInUse(save, decoId); }
function slotsOf(item, kind) { return kind === 'weapon' ? find.weapon(item.nodeId).slots : find.armor(item.pieceId).slots; }

/** 装飾品をはめる／外す（decoId=null で外す）。外しても消えない（D-14） */
export function setDeco(save, kind, uid, index, decoId) {
  const list = kind === 'weapon' ? save.inventory.weapons : save.inventory.armors;
  const item = list.find(x => x.uid === uid); if (!item) return { ok: false, error: '持っていない' };
  const slots = slotsOf(item, kind); if (index < 0 || index >= slots.length) return { ok: false, error: '穴がない' };
  if (decoId) {
    const d = find.deco(decoId); if (!d) return { ok: false, error: '知らない装飾品' };
    if (!slotFits(slots[index], d.size)) return { ok: false, error: '穴の大きさが合わない' };
    if (item.decos[index] !== decoId && decoFree(save, decoId) <= 0) return { ok: false, error: '空いている装飾品がない' };
  }
  item.decos[index] = decoId || null;
  return { ok: true };
}

// ─── 製作・強化・派生（Q-29） ─────────────────────────────
export function craftWeapon(save, nodeId) {
  const n = find.weapon(nodeId); if (!n) return { ok: false, error: '知らない武器' };
  const miss = missing(save, n.craft); if (miss.length) return { ok: false, error: '素材が足りない', missing: miss };
  pay(save, n.craft);
  const w = { uid: newUid(save), nodeId, decos: n.slots.map(() => null) };
  save.inventory.weapons.push(w);
  return { ok: true, uid: w.uid };
}
/** 手持ちの武器を子の節へ強化する。ほかの系統は別の武器として作れる（D-11） */
export function upgradeWeapon(save, uid, childId) {
  const w = save.inventory.weapons.find(x => x.uid === uid); if (!w) return { ok: false, error: '持っていない' };
  const c = find.weapon(childId); if (!c || c.parentId !== w.nodeId) return { ok: false, error: 'その先へは強化できない' };
  const miss = missing(save, c.upgrade); if (miss.length) return { ok: false, error: '素材が足りない', missing: miss };
  pay(save, c.upgrade);
  const old = w.decos; w.nodeId = childId;
  w.decos = c.slots.map((sz, i) => (old[i] && slotFits(sz, find.deco(old[i]).size) ? old[i] : null)); // 合わない装飾品は外れる（消えない）
  return { ok: true };
}
export function craftArmor(save, pieceId) {
  const p = find.armor(pieceId); if (!p) return { ok: false, error: '知らない防具' };
  const miss = missing(save, p.craft); if (miss.length) return { ok: false, error: '素材が足りない', missing: miss };
  pay(save, p.craft);
  const a = { uid: newUid(save), pieceId, level: 1, decos: p.slots.map(() => null) };
  save.inventory.armors.push(a);
  if (!p.dev && save.profile) { const st = save.profile.stats ??= {}; st.crafted = (st.crafted || 0) + 1; } // 物語の条件に使う
  return { ok: true, uid: a.uid };
}
/** 防具の強化の上限（下位5・上位8） */
export const armorMaxLevel = piece => piece?.maxLevel ?? ARMOR_MAX_LEVEL;
export function armorUpgradeCost(piece, level) {
  if (piece.dev || !('_up' in piece)) return Object.fromEntries(Object.entries(piece.upgrade).map(([m, n]) => [m, n * level])); // 試験用は前のまま
  piece._up ??= armorUpTable(piece);
  return piece._up[level] ?? piece._up[Math.max(...Object.keys(piece._up).map(Number))] ?? {};
}
export function upgradeArmor(save, uid) {
  const a = save.inventory.armors.find(x => x.uid === uid); if (!a) return { ok: false, error: '持っていない' };
  if (a.level >= armorMaxLevel(find.armor(a.pieceId))) return { ok: false, error: 'これ以上強くできない' };
  const cost = armorUpgradeCost(find.armor(a.pieceId), a.level);
  const miss = missing(save, cost); if (miss.length) return { ok: false, error: '素材が足りない', missing: miss };
  pay(save, cost); a.level++;
  return { ok: true };
}
export function craftDeco(save, decoId) {
  const d = find.deco(decoId); if (!d) return { ok: false, error: '知らない装飾品' };
  const miss = missing(save, d.craft); if (miss.length) return { ok: false, error: '素材が足りない', missing: miss };
  pay(save, d.craft); save.inventory.decorations[decoId] = (save.inventory.decorations[decoId] || 0) + 1;
  return { ok: true };
}

// ─── 装備する ───────────────────────────────────────────
export function equipWeapon(save, uid) {
  if (!save.inventory.weapons.some(w => w.uid === uid)) return { ok: false, error: '持っていない' };
  save.loadout.weaponUid = uid; return { ok: true };
}
export function equipArmor(save, part, uid) {
  if (uid != null) {
    const a = save.inventory.armors.find(x => x.uid === uid);
    if (!a) return { ok: false, error: '持っていない' };
    if (find.armor(a.pieceId).part !== part) return { ok: false, error: '部位が違う' };
  }
  save.loadout.armor[part] = uid ?? null; return { ok: true };
}
export function setTechs(save, kindId, techIds) { save.loadout.techs[kindId] = techIds.slice(0, 3); return { ok: true }; }

// ─── 計算 ───────────────────────────────────────────────
export function levelFromPoints(pts) { return SKILL_THRESHOLDS.filter(t => pts >= t).length; }

/** 今の装備から、守り・耐性・スキル・セットボーナスを出す（D-13：スキルとセットボーナスは別に数える） */
export function computeGear(save) {
  const inv = save.inventory, lo = save.loadout;
  const wItem = inv.weapons.find(w => w.uid === lo.weaponUid) ?? inv.weapons[0];
  const points = {}, resist = {}, setCount = {};
  const addPts = (skills) => { for (const [k, n] of Object.entries(skills || {})) points[k] = (points[k] || 0) + n; };
  let def = 0; const uniques = [], armors = {};
  for (const { id: part } of ARMOR_PARTS) {
    const uid = lo.armor[part]; const a = uid && inv.armors.find(x => x.uid === uid); if (!a) continue;
    const p = find.armor(a.pieceId); const d = p.def + (p.defPerLevel ?? ARMOR_DEF_PER_LEVEL) * (a.level - 1);
    armors[part] = { item: a, piece: p, def: d };
    def += d; addPts(p.skills);
    for (const [e, v] of Object.entries(p.resist || {})) resist[e] = (resist[e] || 0) + v;
    if (p.unique) uniques.push(uniqueOf(p)); // 固有スキル＝特別な効果（data/uniques.js）
    setCount[p.setId] = (setCount[p.setId] || 0) + 1;
    for (const dId of a.decos) if (dId) { const dd = find.deco(dId); points[dd.skillId] = (points[dd.skillId] || 0) + dd.points; }
  }
  if (wItem) for (const dId of wItem.decos) if (dId) { const dd = find.deco(dId); points[dd.skillId] = (points[dd.skillId] || 0) + dd.points; }
  const capOf = k => Math.min(SKILL_MAX, find.skill(k)?.levels.length ?? SKILL_MAX); // スキルごとの上限
  const skills = Object.fromEntries(Object.entries(points).map(([k, n]) => [k, Math.min(capOf(k), levelFromPoints(n))]).filter(([, l]) => l > 0));
  const setBonuses = [];
  for (const [setId, n] of Object.entries(setCount)) for (const b of find.set(setId)?.bonuses || []) if (n >= b.pieces) setBonuses.push({ setId, ...b });
  // 効き目（2026-11-26 ユーザー：「スキルは加算じゃないんですか？」）：スキル点のLvに、セットボーナスのLvを足す（上限 SKILL_MAX）
  const effective = { ...skills };
  for (const g of setBonuses) for (const [k, l] of Object.entries(g.grants)) effective[k] = Math.min(capOf(k), (effective[k] || 0) + l);
  const mods = { ...NO_MODS };
  for (const [k, l] of Object.entries(effective)) { const s = find.skill(k); if (s && l > 0) mods[s.mod] = s.levels[Math.min(l, s.levels.length) - 1]; }
  for (const u of uniques) if (u.fx) mods[u.fx] = Math.max(mods[u.fx] || 0, u.v); // 固有スキルの効果（engine.js が読む）
  return { weaponItem: wItem, armors, def: def + mods.defAdd, armorDef: def, resist, points, skills, uniques, setBonuses, effective, mods };
}

/** 戦闘に持っていく武器（派生の節の強さ・属性・状態異常・熟練度・技を反映） */
export function battleWeapon(save, opts = {}) {
  const g = computeGear(save);
  const node = find.weapon(g.weaponItem.nodeId);
  const lv = masteryLevel(save.mastery?.[node.kindId] ?? 0);
  const techIds = opts.techIds ?? save.loadout.techs[node.kindId] ?? null;
  const w = buildWeapon(node.kindId, { techIds, level: lv, unlockAll: !!opts.unlockAll, learned: save.learned?.[node.kindId] ?? [] });
  w.power = Math.round(w.power * node.powerMult);
  w.nodeName = node.name;
  if (node.element) w.element = node.element;
  if (node.ail) w.ailOnHit = node.ail;
  return { weapon: w, gear: { def: g.def, resist: g.resist, mods: g.mods } };
}

/** 武器の派生ツリー：その種類の節の一覧（親→子の順） */
export function weaponTree(kindId, { showDev = false } = {}) {
  const list = CATALOG.weapons.filter(n => n.kindId === kindId && (showDev || !n.dev));
  const out = [], walk = (parentId, depth) => list.filter(n => n.parentId === parentId).forEach(n => { out.push({ ...n, depth }); walk(n.id, depth + 1); }); // 親のすぐ下に子
  walk(null, 0);
  return out;
}
export const WEAPON_KIND_IDS = Object.keys(WEAPON_KINDS);
