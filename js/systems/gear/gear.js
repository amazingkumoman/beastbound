// 装備・スキル・製作のしくみ（画面を持たない）。22 防具・装飾品仕様書・22b。
// 保存データ（save）を受け取り、計算したり、書き換えたりする。書き換える関数は
// 成功したら { ok: true, ... }、できないときは { ok: false, error } を返す（save は変えない）。

import { SKILLS, SKILL_THRESHOLDS } from '../../../data/skills.js';
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
const byId = list => Object.fromEntries(list.map(x => [x.id, x]));
const W = byId(CATALOG.weapons), A = byId(CATALOG.armors), S = byId(CATALOG.sets), D = byId(CATALOG.decorations), SK = byId(SKILLS);
export const find = { weapon: id => W[id], armor: id => A[id], set: id => S[id], deco: id => D[id], skill: id => SK[id], material: id => CATALOG.materials.find(m => m.id === id) };

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

// ─── 素材 ───────────────────────────────────────────────
export function missing(save, cost = {}) {
  return Object.entries(cost).filter(([m, n]) => (save.inventory.materials[m] || 0) < n)
    .map(([m, n]) => ({ id: m, name: find.material(m)?.name ?? m, need: n, have: save.inventory.materials[m] || 0 }));
}
function pay(save, cost = {}) { for (const [m, n] of Object.entries(cost)) save.inventory.materials[m] -= n; }

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
export function armorUpgradeCost(piece, level) { return Object.fromEntries(Object.entries(piece.upgrade).map(([m, n]) => [m, n * level])); }
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
    if (p.unique) uniques.push(p.unique);
    setCount[p.setId] = (setCount[p.setId] || 0) + 1;
    for (const dId of a.decos) if (dId) { const dd = find.deco(dId); points[dd.skillId] = (points[dd.skillId] || 0) + dd.points; }
  }
  if (wItem) for (const dId of wItem.decos) if (dId) { const dd = find.deco(dId); points[dd.skillId] = (points[dd.skillId] || 0) + dd.points; }
  const skills = Object.fromEntries(Object.entries(points).map(([k, n]) => [k, levelFromPoints(n)]).filter(([, l]) => l > 0));
  const setBonuses = [];
  for (const [setId, n] of Object.entries(setCount)) for (const b of find.set(setId)?.bonuses || []) if (n >= b.pieces) setBonuses.push({ setId, ...b });
  // 効き目：スキル・固有スキル・セットボーナスのうち、いちばん高い段階を使う
  const effective = { ...skills };
  for (const g of [...uniques, ...setBonuses]) for (const [k, l] of Object.entries(g.grants)) effective[k] = Math.max(effective[k] || 0, l);
  const mods = { ...NO_MODS };
  for (const [k, l] of Object.entries(effective)) { const s = find.skill(k); if (s && l > 0) mods[s.mod] = s.levels[Math.min(l, 3) - 1]; }
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
