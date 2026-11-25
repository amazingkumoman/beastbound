// 【ネタバレ注意】マスター級の素材・防具・装飾品・武器の派生（第12段階・70）。rank: 'master' はマスター級が開くまで工房に出さない。
const M = (id, name, rarity) => ({ id, name, rarity, rank: 'master' });
export const MASTER_MATERIALS = [
  M('mat_m01m_shell', '苔岩の古甲殻', 4), M('mat_m01m_plate', '背甲の巨片', 4), M('mat_m01m_vein', '真翠脈石', 5),
  M('mat_m02m_scale', '縞翼の焔鱗', 4), M('mat_m02m_membrane', '縞翼の焔翼膜', 4), M('mat_m02m_sac', '天火袋', 5),
  M('mat_m03m_hide', '沼主の古粘皮', 4), M('mat_m03m_wart', '沼主の王疣', 4), M('mat_m03m_gland', '王しびれ腺', 5),
  M('mat_m04m_hide', '疾風の古革', 4), M('mat_m04m_claw', '疾風の大爪刃', 4), M('mat_m04m_gem', '疾風の千里眼', 5),
  M('mat_m05m_shell', '甲山の古甲殻', 4), M('mat_m05m_spike', '甲山の大棘', 4), M('mat_m05m_core', '古獣の大核', 5),
  M('mat_m06m_fur', '雷角の古毛皮', 4), M('mat_m06m_antler', '雷角の王角', 4), M('mat_m06m_heart', '雷角の雷心', 5),
  M('mat_m07_scale', '星根の鱗', 4), M('mat_m07_crystal', '星根の結晶', 4), M('mat_m07_horn', '星根の角冠', 4), M('mat_m07_core', '星の核', 5), M('mat_m07_heart', '守り竜の心臓', 5),
  M('mat_m08_shell', '晶殻', 4), M('mat_m08_claw', '晶殻の大鋏', 4), M('mat_m08_eye', '晶殻の眼', 4), M('mat_m08_pearl', '地底の真珠', 5), M('mat_m08_core', '晶殻の核', 5),
  M('mat_m04s_hide', '黒疾風の革', 4), M('mat_m04s_claw', '黒疾風の爪刃', 4), M('mat_m04s_plume', '黒疾風の羽', 4), M('mat_m04s_venom', '黒い毒袋', 5), M('mat_m04s_eye', '黒疾風の眼', 5),
  M('mat_runestone', '古文字の石', 4), M('mat_deepcrystal', '深層結晶', 4), M('mat_glowwater', '光る地底水', 3), M('mat_starroot', '星の根', 5), M('mat_ex_star', '星の涙', 5),
];

const SETS = {
  m01m: { name: '苔岩・古', monsterId: 'mon_m01', mats: ['mat_m01m_shell', 'mat_m01m_plate', 'mat_m01m_vein'], field: 'mat_runestone', resist: { fire: 15, thunder: -5 },
    skills: ['skl_guard', 'skl_defense', 'skl_vitality', 'skl_heavy'], unique: { name: '苔岩の背', grants: { skl_defense: 3 } }, bonus: [{ pieces: 2, name: '苔岩の構え・古', grants: { skl_guard: 2 } }, { pieces: 4, name: '苔岩の不動・古', grants: { skl_defense: 3 } }] },
  m02m: { name: '縞翼・焔', monsterId: 'mon_m02', mats: ['mat_m02m_scale', 'mat_m02m_membrane', 'mat_m02m_sac'], field: 'mat_glowwater', resist: { fire: 20, water: -5 },
    skills: ['skl_attack', 'skl_chance', 'skl_weakness', 'skl_evade'], unique: { name: '縞翼の目', grants: { skl_chance: 3 } }, bonus: [{ pieces: 2, name: '縞翼の身軽さ・焔', grants: { skl_evade: 2 } }, { pieces: 4, name: '縞翼の狩り・焔', grants: { skl_weakness: 3 } }] },
  m03m: { name: '沼主・王', monsterId: 'mon_m03', mats: ['mat_m03m_hide', 'mat_m03m_wart', 'mat_m03m_gland'], field: 'mat_glowwater', resist: { water: 20, thunder: -5 },
    skills: ['skl_ailment', 'skl_ailresist', 'skl_unread', 'skl_regen'], unique: { name: '沼主の知恵', grants: { skl_unread: 3 } }, bonus: [{ pieces: 2, name: '沼主の耐え・王', grants: { skl_ailresist: 3 } }, { pieces: 4, name: '沼主の毒腺・王', grants: { skl_ailment: 3 } }] },
  m04m: { name: '疾風・極', monsterId: 'mon_m04', mats: ['mat_m04m_hide', 'mat_m04m_claw', 'mat_m04m_gem'], field: 'mat_runestone', resist: { dragon: 15, ice: -5 },
    skills: ['skl_multihit', 'skl_counter', 'skl_evade', 'skl_stamina'], unique: { name: '疾風の脚', grants: { skl_evade: 3 } }, bonus: [{ pieces: 2, name: '疾風の返し・極', grants: { skl_counter: 2 } }, { pieces: 4, name: '疾風の連撃・極', grants: { skl_multihit: 3 } }] },
  m05m: { name: '甲山・古', monsterId: 'mon_m05', mats: ['mat_m05m_shell', 'mat_m05m_spike', 'mat_m05m_core'], field: 'mat_deepcrystal', resist: { thunder: 15, fire: 10, water: 10 },
    skills: ['skl_breaker', 'skl_heavy', 'skl_defense', 'skl_vitality'], unique: { name: '古獣の甲', grants: { skl_breaker: 3 } }, bonus: [{ pieces: 2, name: '甲山の重み・古', grants: { skl_heavy: 2 } }, { pieces: 4, name: '甲山の砕き・古', grants: { skl_breaker: 3 } }] },
  m06m: { name: '雷角・王', monsterId: 'mon_m06', mats: ['mat_m06m_fur', 'mat_m06m_antler', 'mat_m06m_heart'], field: 'mat_runestone', resist: { thunder: 20, ice: -5 },
    skills: ['skl_element', 'skl_regen', 'skl_attack', 'skl_insight'], unique: { name: '雷角の冠', grants: { skl_element: 3 } }, bonus: [{ pieces: 2, name: '雷角の巡り・王', grants: { skl_regen: 3 } }, { pieces: 4, name: '雷角の雷光・王', grants: { skl_element: 3 } }] },
  m07: { name: '星根', monsterId: 'mon_m07', mats: ['mat_m07_scale', 'mat_m07_crystal', 'mat_m07_core'], field: 'mat_starroot', resist: { dragon: 20, ice: -10 },
    skills: ['skl_attack', 'skl_weakness', 'skl_element', 'skl_unread'], unique: { name: '守り竜の加護', grants: { skl_attack: 2 } }, bonus: [{ pieces: 2, name: '星根の流れ', grants: { skl_regen: 2 } }, { pieces: 4, name: '星根の守り', grants: { skl_attack: 3 } }] },
  m08: { name: '晶殻', monsterId: 'mon_m08', mats: ['mat_m08_shell', 'mat_m08_claw', 'mat_m08_pearl'], field: 'mat_deepcrystal', resist: { ice: 15, water: 15, dragon: -10 },
    skills: ['skl_defense', 'skl_guard', 'skl_counter', 'skl_breaker'], unique: { name: '晶殻の守り', grants: { skl_guard: 3 } }, bonus: [{ pieces: 2, name: '晶殻の固さ', grants: { skl_defense: 2 } }, { pieces: 4, name: '晶殻の返し', grants: { skl_counter: 3 } }] },
  m04s: { name: '黒疾風', monsterId: 'mon_m04s', mats: ['mat_m04s_hide', 'mat_m04s_claw', 'mat_m04s_venom'], field: 'mat_runestone', resist: { fire: -5, dragon: 10 },
    skills: ['skl_ailment', 'skl_chance', 'skl_multihit', 'skl_evade'], unique: { name: '黒疾風の牙', grants: { skl_ailment: 3 } }, bonus: [{ pieces: 2, name: '黒疾風の機', grants: { skl_chance: 2 } }, { pieces: 4, name: '黒疾風の毒牙', grants: { skl_ailment: 3 } }] },
};
const PARTS = [
  { part: 'head', label: '兜', def: 106, slots: ['l'], n: [3, 1, 0] }, { part: 'chest', label: '胴', def: 120, slots: ['l', 'm'], n: [4, 1, 1], unique: true },
  { part: 'arms', label: '籠手', def: 108, slots: ['m', 'm'], n: [3, 1, 0] }, { part: 'waist', label: '腰', def: 104, slots: ['l'], n: [3, 0, 1] },
  { part: 'legs', label: '脚', def: 112, slots: ['l', 's'], n: [3, 1, 1] },
];
export const MASTER_ARMOR_MAX_LEVEL = 10;
export const MASTER_ARMOR_SETS = Object.entries(SETS).map(([k, s]) => ({ id: `set_${k}`, name: s.name, monsterId: s.monsterId, bonuses: s.bonus, rank: 'master' }));
export const MASTER_ARMORS = Object.entries(SETS).flatMap(([k, s]) => PARTS.map((p, i) => {
  const craft = {}; p.n.forEach((n, j) => { if (n) craft[s.mats[j]] = n; }); craft[s.field] = 1;
  const sk = s.skills, skills = { [sk[i % 4]]: 3, [sk[(i + 1) % 4]]: 2 };
  return {
    id: `arm_${k}_${p.part}`, setId: `set_${k}`, part: p.part, name: `${s.name}の${p.label}`, def: p.def, resist: s.resist, skills, slots: p.slots,
    craft, upgrade: { [s.mats[0]]: 1, [s.field]: 1 }, maxLevel: MASTER_ARMOR_MAX_LEVEL, defPerLevel: 6, rank: 'master',
    art: `arm.${k}.${p.part}`, ...(p.unique ? { unique: s.unique } : {}),
  };
}));

// 採取のお助け防具（マスター級の序盤）：扉の先の採取・調査だけで作れる
const GPARTS = [{ part: 'head', label: '頭巾', def: 96, slots: ['m'] }, { part: 'chest', label: '胴着', def: 108, slots: ['m', 's'] }, { part: 'arms', label: '手甲', def: 98, slots: ['m'] }, { part: 'waist', label: '腰帯', def: 94, slots: ['m'] }, { part: 'legs', label: '脚絆', def: 102, slots: ['l'] }];
const GSK = ['skl_vitality', 'skl_defense', 'skl_resist', 'skl_ailresist'];
export const MASTER_GATHER_SETS = [{ id: 'set_g_star', name: '星糸', bonuses: [{ pieces: 2, name: '星糸の守り', grants: { skl_resist: 2 } }, { pieces: 4, name: '星糸の粘り', grants: { skl_vitality: 3 } }], rank: 'master', gather: true }];
export const MASTER_GATHER_ARMORS = GPARTS.map((p, i) => ({
  id: `arm_g_star_${p.part}`, setId: 'set_g_star', part: p.part, name: `星糸の${p.label}`, def: p.def, resist: { fire: 10, water: 10, thunder: 10, ice: 10, dragon: 10 },
  skills: { [GSK[i % 4]]: 2, [GSK[(i + 1) % 4]]: 1 }, slots: p.slots, craft: { mat_glowwater: 3, mat_deepcrystal: 2, mat_runestone: 1 }, upgrade: { mat_glowwater: 1, mat_deepcrystal: 1 },
  maxLevel: 8, defPerLevel: 5, rank: 'master', gather: true, art: `arm.g_star.${p.part}`,
}));

export const MASTER_DECORATIONS = [
  { id: 'deco_attack_m', name: '極攻玉', size: 'l', skillId: 'skl_attack', points: 3, craft: { mat_m07_scale: 1, mat_runestone: 1 }, rank: 'master' },
  { id: 'deco_defense_m', name: '極堅玉', size: 'l', skillId: 'skl_defense', points: 3, craft: { mat_m08_shell: 1, mat_deepcrystal: 1 }, rank: 'master' },
  { id: 'deco_weakness_m', name: '極穿玉', size: 'l', skillId: 'skl_weakness', points: 3, craft: { mat_m04s_claw: 1, mat_runestone: 1 }, rank: 'master' },
  { id: 'deco_evade_m', name: '極翔玉', size: 'm', skillId: 'skl_evade', points: 2, craft: { mat_m04s_plume: 1, mat_glowwater: 2 }, rank: 'master' },
  { id: 'deco_vitality_m', name: '極命玉', size: 'm', skillId: 'skl_vitality', points: 2, craft: { mat_m08_claw: 1, mat_glowwater: 2 }, rank: 'master' },
  { id: 'deco_element_m', name: '極属玉', size: 'l', skillId: 'skl_element', points: 3, craft: { mat_m07_crystal: 1, mat_starroot: 1 }, rank: 'master' },
];

// 武器の派生（マスター級）：今の7系統の最終段（5段目）と、新しい3系統（基本から・2段）
const KINDS = { wt_greatsword: '大剣', wt_twinblades: '双刃', wt_hammer: '重槌', wt_lance: '竜槍', wt_bow: '弓', wt_chainblade: '鎖刃' };
const FINAL = [ // [系統, 親の段, 名前, 属性, 素材]
  ['m01', 4, '翠王の', 'thunder', 'mat_m01m_shell', 'mat_m01m_vein'], ['m02', 4, '天火の', 'fire', 'mat_m02m_scale', 'mat_m02m_sac'],
  ['m03', 4, '海神の', 'water', 'mat_m03m_hide', 'mat_m03m_gland'], ['m04', 2, '神速の', 'ice', 'mat_m04m_hide', 'mat_m04m_gem'],
  ['m05', 2, '古王の', 'dragon', 'mat_m05m_shell', 'mat_m05m_core'], ['m06', 2, '天雷の極', 'thunder', 'mat_m06m_fur', 'mat_m06m_heart'],
  ['m02s', 2, '氷河の極', 'ice', 'mat_runestone', 'mat_deepcrystal'],
];
const NEWL = [ // 新しい3系統（じゃんけん：星根=龍→晶殻、晶殻=氷→星根、黒疾風=雷）
  ['m07', ['星根の', '守り竜の'], 'dragon', 'mat_m07_scale', 'mat_m07_core'],
  ['m08', ['晶殻の', '地底王の'], 'ice', 'mat_m08_shell', 'mat_m08_pearl'],
  ['m04s', ['黒疾風の', '夜叉の'], 'thunder', 'mat_m04s_hide', 'mat_m04s_venom'],
];
export const MASTER_WEAPON_TREE = Object.entries(KINDS).flatMap(([k, n]) => {
  const s = k.slice(3), base = `wpn_${s}_base`;
  const fin = FINAL.map(([line, parentTier, name, elem, m1, m2]) => ({
    id: `wpn_${s}_${line}_5`, kindId: k, name: `${name}${n}`, parentId: `wpn_${s}_${line}_${parentTier}`, tier: 5, rank: 'master',
    powerMult: 1.62, slots: ['l', 'm'], element: { type: elem, value: 58 }, craft: { [m1]: 12, [m2]: 3, mat_runestone: 3 }, upgrade: { [m1]: 6, [m2]: 2, mat_runestone: 2 },
  }));
  const fresh = NEWL.flatMap(([line, names, elem, m1, m2]) => [0, 1].map(i => ({
    id: `wpn_${s}_${line}_${i + 1}`, kindId: k, name: `${names[i]}${n}`, parentId: i === 0 ? base : `wpn_${s}_${line}_1`, tier: 5 + i, rank: 'master',
    powerMult: [1.58, 1.7][i], slots: [['l', 's'], ['l', 'm']][i], element: { type: elem, value: [54, 64][i] },
    craft: [{ [m1]: 10, mat_deepcrystal: 3 }, { [m1]: 12, [m2]: 3, mat_starroot: 1 }][i], upgrade: [{ [m1]: 5, mat_deepcrystal: 2 }, { [m1]: 6, [m2]: 2, mat_starroot: 1 }][i],
  })));
  return [...fin, ...fresh];
});
