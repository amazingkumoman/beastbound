// 【ネタバレ注意】上位の素材・防具・装飾品・武器の派生（第11段階・50）。rank: 'high' は上位が開くまで工房に出さない。
// 防具の強化上限は上位で8（下位は5）。下位の防具の固有スキルは、同じ種の上位の防具に引き継ぐ（Q-31）。

const M = (id, name, rarity) => ({ id, name, rarity, rank: 'high' });
export const HIGH_MATERIALS = [
  M('mat_m01h_shell', '苔岩の重甲殻', 3), M('mat_m01h_horn', '苔岩の剛角', 3), M('mat_m01h_plate', '背甲の大欠片', 3), M('mat_m01h_vein', '濃翠脈石', 4),
  M('mat_m02h_scale', '縞翼の堅鱗', 3), M('mat_m02h_membrane', '縞翼の厚翼膜', 3), M('mat_m02h_spine', '縞翼の剛棘', 3), M('mat_m02h_sac', '業火袋', 4),
  M('mat_m03h_hide', '沼主の厚粘皮', 3), M('mat_m03h_wart', '沼主の大毒疣', 3), M('mat_m03h_fang', '沼主の鋭牙', 3), M('mat_m03h_gland', '濃しびれ腺', 4),
  M('mat_m04_hide', '疾風の革', 3), M('mat_m04_claw', '疾風の爪刃', 3), M('mat_m04_plume', '疾風の飾り羽', 3), M('mat_m04_tendon', '疾風の腱', 4), M('mat_m04_gem', '疾風の眼', 4),
  M('mat_m05_shell', '甲山の甲殻', 3), M('mat_m05_spike', '甲山の棘', 3), M('mat_m05_plate', '甲山の脚甲', 3), M('mat_m05_marrow', '古獣の髄', 4), M('mat_m05_core', '古獣の核片', 4),
  M('mat_m06_fur', '雷角の毛皮', 3), M('mat_m06_antler', '雷角', 3), M('mat_m06_hoof', '雷角の蹄', 3), M('mat_m06_spark', '雷電袋', 4), M('mat_m06_heart', '雷角の心臓', 4),
  M('mat_m02s_scale', '氷翼の鱗', 3), M('mat_m02s_membrane', '氷翼の翼膜', 3), M('mat_m02s_spine', '氷翼の棘', 3), M('mat_m02s_crest', '氷翼のとさか', 4), M('mat_m02s_sac', '冷気袋', 4),
  M('mat_frostherb', '霜草', 2), M('mat_stormstone', '雷鳴石', 3), M('mat_icecrystal', '氷晶石', 3), M('mat_starmoss', '星苔', 4),
  M('mat_ancientstone', '古都の石材', 3), M('mat_veincrystal', '翠脈結晶', 4),
];

// 上位の防具：種ごとの性格（スキルの組み合わせ）・耐性・固有スキル・セットボーナス
const SETS = {
  m01h: { name: '苔岩・剛', monsterId: 'mon_m01', mats: ['mat_m01h_shell', 'mat_m01h_horn', 'mat_m01h_plate', 'mat_m01h_vein'], field: 'mat_ancientstone',
    resist: { fire: 10, thunder: -5 }, skills: ['skl_guard', 'skl_vitality', 'skl_defense', 'skl_heavy'], unique: { name: '苔岩の背', grants: { skl_defense: 2 } },
    bonus: [{ pieces: 2, name: '苔岩の構え・剛', grants: { skl_guard: 2 } }, { pieces: 4, name: '苔岩の不動・剛', grants: { skl_defense: 3 } }] },
  m02h: { name: '縞翼・烈', monsterId: 'mon_m02', mats: ['mat_m02h_scale', 'mat_m02h_membrane', 'mat_m02h_spine', 'mat_m02h_sac'], field: 'mat_stormstone',
    resist: { fire: 15, water: -5 }, skills: ['skl_attack', 'skl_chance', 'skl_evade', 'skl_weakness'], unique: { name: '縞翼の目', grants: { skl_chance: 2 } },
    bonus: [{ pieces: 2, name: '縞翼の身軽さ・烈', grants: { skl_evade: 2 } }, { pieces: 4, name: '縞翼の狩り・烈', grants: { skl_weakness: 3 } }] },
  m03h: { name: '沼主・深', monsterId: 'mon_m03', mats: ['mat_m03h_hide', 'mat_m03h_wart', 'mat_m03h_fang', 'mat_m03h_gland'], field: 'mat_frostherb',
    resist: { water: 15, thunder: -5 }, skills: ['skl_ailment', 'skl_ailresist', 'skl_regen', 'skl_unread'], unique: { name: '沼主の知恵', grants: { skl_unread: 2 } },
    bonus: [{ pieces: 2, name: '沼主の耐え・深', grants: { skl_ailresist: 2 } }, { pieces: 4, name: '沼主の毒腺・深', grants: { skl_ailment: 3 } }] },
  m04: { name: '疾風', monsterId: 'mon_m04', mats: ['mat_m04_hide', 'mat_m04_claw', 'mat_m04_plume', 'mat_m04_gem'], field: 'mat_ancientstone',
    resist: { dragon: 10, ice: -5 }, skills: ['skl_multihit', 'skl_evade', 'skl_counter', 'skl_stamina'], unique: { name: '疾風の脚', grants: { skl_evade: 2 } },
    bonus: [{ pieces: 2, name: '疾風の返し', grants: { skl_counter: 1 } }, { pieces: 4, name: '疾風の連撃', grants: { skl_multihit: 3 } }] },
  m05: { name: '甲山', monsterId: 'mon_m05', mats: ['mat_m05_shell', 'mat_m05_spike', 'mat_m05_plate', 'mat_m05_core'], field: 'mat_veincrystal',
    resist: { thunder: 10, fire: 5, water: 5 }, skills: ['skl_breaker', 'skl_defense', 'skl_heavy', 'skl_vitality'], unique: { name: '古獣の甲', grants: { skl_breaker: 2 } },
    bonus: [{ pieces: 2, name: '甲山の重み', grants: { skl_heavy: 1 } }, { pieces: 4, name: '甲山の砕き', grants: { skl_breaker: 3 } }] },
  m06: { name: '雷角', monsterId: 'mon_m06', mats: ['mat_m06_fur', 'mat_m06_antler', 'mat_m06_hoof', 'mat_m06_spark'], field: 'mat_stormstone',
    resist: { thunder: 15, ice: -5 }, skills: ['skl_element', 'skl_regen', 'skl_insight', 'skl_attack'], unique: { name: '雷角の冠', grants: { skl_element: 2 } },
    bonus: [{ pieces: 2, name: '雷角の巡り', grants: { skl_regen: 2 } }, { pieces: 4, name: '雷角の雷光', grants: { skl_element: 3 } }] },
  m02s: { name: '氷翼', monsterId: 'mon_m02s', mats: ['mat_m02s_scale', 'mat_m02s_membrane', 'mat_m02s_spine', 'mat_m02s_crest'], field: 'mat_icecrystal',
    resist: { ice: 15, fire: -5 }, skills: ['skl_weakness', 'skl_chance', 'skl_resist', 'skl_insight'], unique: { name: '氷翼の眼', grants: { skl_insight: 2 } },
    bonus: [{ pieces: 2, name: '氷翼の守り', grants: { skl_resist: 2 } }, { pieces: 4, name: '氷翼の狩り', grants: { skl_weakness: 3 } }] },
};
const PARTS = [ // 部位ごとの守り・穴・素材の数
  { part: 'head', label: '兜', def: 40, slots: ['m'], n: [3, 1, 0, 0] },
  { part: 'chest', label: '胴', def: 50, slots: ['m', 's'], n: [4, 1, 1, 0], unique: true },
  { part: 'arms', label: '籠手', def: 42, slots: ['s', 's'], n: [3, 0, 1, 0] },
  { part: 'waist', label: '腰', def: 39, slots: ['m'], n: [3, 1, 0, 0] },
  { part: 'legs', label: '脚', def: 45, slots: ['l'], n: [3, 0, 1, 1] },
];
export const HIGH_ARMOR_MAX_LEVEL = 8;
export const HIGH_ARMOR_SETS = Object.entries(SETS).map(([k, s]) => ({ id: `set_${k}`, name: s.name, monsterId: s.monsterId, bonuses: s.bonus, rank: 'high' }));
export const HIGH_ARMORS = Object.entries(SETS).flatMap(([k, s]) => PARTS.map((p, i) => {
  const craft = {}; p.n.forEach((n, j) => { if (n) craft[s.mats[j]] = n; }); craft[s.field] = 1;
  const sk = s.skills, skills = { [sk[i % 4]]: 2, [sk[(i + 1) % 4]]: 1 };
  if (i === 4) skills[sk[3]] = (skills[sk[3]] || 0) + 1;
  return {
    id: `arm_${k}_${p.part}`, setId: `set_${k}`, part: p.part, name: `${s.name}の${p.label}`, def: p.def, resist: s.resist, skills, slots: p.slots,
    craft, upgrade: { [s.mats[0]]: 1, [s.field]: 1 }, maxLevel: HIGH_ARMOR_MAX_LEVEL, defPerLevel: 4, rank: 'high',
    art: `arm.${k.replace('h', '')}.${p.part}`, ...(p.unique ? { unique: s.unique } : {}),
  };
}));

// 採取の防具（上位の序盤のお助け・2026-11-25 ユーザー）：奥地の採取・調査だけで作れる（戦わなくてよい）。
// 守りは上位の防具より高めだが、戦いのスキルはない（守り・体力・耐性・採取）。強化は6まで。
// 2式あり、どちらでもよい（一本道にしない）。下位の強い武器と組み合わせて、上位の序盤を乗り切る。
const GATHER = {
  frost: { name: '霜織り', field: 'mat_frostherb', mats: ['mat_icecrystal', 'mat_stormstone', 'mat_feather'], resist: { ice: 15, thunder: 15, fire: -5 },
    skills: ['skl_vitality', 'skl_resist', 'skl_stamina', 'skl_gather'], bonus: [{ pieces: 2, name: '霜織りの備え', grants: { skl_resist: 1 } }, { pieces: 4, name: '霜織りの粘り', grants: { skl_vitality: 2 } }] },
  stone: { name: '古都石', field: 'mat_ancientstone', mats: ['mat_veincrystal', 'mat_ore', 'mat_bone'], resist: { fire: 10, water: 10, dragon: 10 },
    skills: ['skl_defense', 'skl_guard', 'skl_ailresist', 'skl_gather'], bonus: [{ pieces: 2, name: '古都石の構え', grants: { skl_guard: 1 } }, { pieces: 4, name: '古都石の守り', grants: { skl_defense: 2 } }] },
};
const GPARTS = [
  { part: 'head', label: '頭巾', def: 42, slots: ['s'] }, { part: 'chest', label: '胴着', def: 50, slots: ['s', 's'] },
  { part: 'arms', label: '手甲', def: 43, slots: ['s'] }, { part: 'waist', label: '腰帯', def: 41, slots: ['s'] }, { part: 'legs', label: '脚絆', def: 46, slots: ['m'] },
];
export const GATHER_ARMOR_SETS = Object.entries(GATHER).map(([k, g]) => ({ id: `set_g_${k}`, name: g.name, bonuses: g.bonus, rank: 'high', gather: true }));
export const GATHER_ARMORS = Object.entries(GATHER).flatMap(([k, g]) => GPARTS.map((p, i) => ({
  id: `arm_g_${k}_${p.part}`, setId: `set_g_${k}`, part: p.part, name: `${g.name}の${p.label}`, def: p.def, resist: g.resist,
  skills: { [g.skills[i % 4]]: 1, ...(i === 1 ? { [g.skills[(i + 1) % 4]]: 1 } : {}) }, slots: p.slots,
  craft: { [g.field]: 3, [g.mats[i % 3]]: 2, [g.mats[(i + 1) % 3]]: 1 }, upgrade: { [g.field]: 1, [g.mats[0]]: 1 },
  maxLevel: 6, defPerLevel: 3, rank: 'high', gather: true, art: `arm.g_${k}.${p.part}`,
})));

export const HIGH_DECORATIONS = [
  { id: 'deco_chance', name: '機玉', size: 'm', skillId: 'skl_chance', points: 2, craft: { mat_m02h_spine: 1, mat_veincrystal: 1 }, rank: 'high' },
  { id: 'deco_counter', name: '返玉', size: 'm', skillId: 'skl_counter', points: 2, craft: { mat_m04_claw: 1, mat_ancientstone: 1 }, rank: 'high' },
  { id: 'deco_unread', name: '隠玉', size: 'm', skillId: 'skl_unread', points: 2, craft: { mat_m03h_fang: 1, mat_frostherb: 2 }, rank: 'high' },
  { id: 'deco_insight', name: '見玉', size: 's', skillId: 'skl_insight', points: 1, craft: { mat_m02s_spine: 1, mat_icecrystal: 1 }, rank: 'high' },
  { id: 'deco_element', name: '属玉', size: 'm', skillId: 'skl_element', points: 2, craft: { mat_m06_antler: 1, mat_stormstone: 1 }, rank: 'high' },
  { id: 'deco_breaker', name: '砕玉', size: 'm', skillId: 'skl_breaker', points: 2, craft: { mat_m05_spike: 1, mat_ancientstone: 1 }, rank: 'high' },
  { id: 'deco_stamina', name: '持玉', size: 's', skillId: 'skl_stamina', points: 1, craft: { mat_m04_hide: 1, mat_frostherb: 1 }, rank: 'high' },
  { id: 'deco_multihit', name: '連玉', size: 'l', skillId: 'skl_multihit', points: 3, craft: { mat_m04_tendon: 1, mat_veincrystal: 1, mat_starmoss: 1 }, rank: 'high' },
];

// 武器の派生（上位）：今の3系統の3・4段目と、新しい4系統（基本から分かれる）
const KINDS = { wt_greatsword: '大剣', wt_twinblades: '双刃', wt_hammer: '重槌', wt_lance: '竜槍', wt_bow: '弓', wt_chainblade: '鎖刃' };
const OLD = [ // 今の系統の続き（属性はじゃんけんのまま強くなる）
  { key: 'm01', names: ['翠岩の', '大地の'], elem: 'thunder', mats: ['mat_m01h_shell', 'mat_m01h_horn', 'mat_m01h_vein'], field: 'mat_stormstone' },
  { key: 'm02', names: ['烈火の', '業火の'], elem: 'fire', mats: ['mat_m02h_scale', 'mat_m02h_spine', 'mat_m02h_sac'], field: 'mat_ancientstone' },
  { key: 'm03', names: ['深沼の', '大海の'], elem: 'water', mats: ['mat_m03h_hide', 'mat_m03h_fang', 'mat_m03h_gland'], field: 'mat_frostherb' },
];
const NEW = [ // 新しい系統（じゃんけん：疾風=氷→雷角、甲山=龍→疾風、雷角=雷→甲山、氷翼=氷）
  { key: 'm04', names: ['疾風の', '迅雷の'], elem: 'ice', mats: ['mat_m04_hide', 'mat_m04_claw', 'mat_m04_gem'], field: 'mat_ancientstone' },
  { key: 'm05', names: ['甲山の', '古獣の'], elem: 'dragon', mats: ['mat_m05_shell', 'mat_m05_spike', 'mat_m05_core'], field: 'mat_veincrystal' },
  { key: 'm06', names: ['雷角の', '天雷の'], elem: 'thunder', mats: ['mat_m06_fur', 'mat_m06_antler', 'mat_m06_heart'], field: 'mat_stormstone' },
  { key: 'm02s', names: ['氷翼の', '氷河の'], elem: 'ice', mats: ['mat_m02s_scale', 'mat_m02s_membrane', 'mat_m02s_crest'], field: 'mat_icecrystal' },
];
const costs = (L, i) => [
  { [L.mats[0]]: 8, [L.mats[1]]: 3, [L.field]: 2 },
  { [L.mats[0]]: 10, [L.mats[1]]: 4, [L.mats[2]]: 2, [L.field]: 3 },
][i];
const ups = (L, i) => [{ [L.mats[0]]: 4, [L.field]: 1 }, { [L.mats[0]]: 4, [L.mats[1]]: 2, [L.mats[2]]: 1, [L.field]: 1 }][i];
export const HIGH_WEAPON_TREE = Object.entries(KINDS).flatMap(([k, n]) => {
  const s = k.slice(3), base = `wpn_${s}_base`;
  const old = OLD.flatMap(L => [0, 1].map(i => ({
    id: `wpn_${s}_${L.key}_${i + 3}`, kindId: k, name: `${L.names[i]}${n}`, parentId: `wpn_${s}_${L.key}_${i + 2}`, tier: i + 3, rank: 'high',
    powerMult: [1.3, 1.42][i], slots: [['m', 's'], ['l', 's']][i], element: { type: L.elem, value: [32, 42][i] }, craft: costs(L, i), upgrade: ups(L, i),
  })));
  const fresh = NEW.flatMap(L => [0, 1].map(i => ({
    id: `wpn_${s}_${L.key}_${i + 1}`, kindId: k, name: `${L.names[i]}${n}`, parentId: i === 0 ? base : `wpn_${s}_${L.key}_1`, tier: i + 3, rank: 'high',
    powerMult: [1.3, 1.42][i], slots: [['m', 's'], ['l', 's']][i], element: { type: L.elem, value: [30, 40][i] }, craft: costs(L, i), upgrade: ups(L, i),
  })));
  return [...old, ...fresh];
});
