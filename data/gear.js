// 【ネタバレ注意】正式な素材・防具・装飾品・武器の派生（第8段階・23b 3章）。
// 3系統の属性はじゃんけん（一本道にしない）：苔岩=雷 → 2体目に効く、縞翼=火 → 3体目に効く、沼主=水 → 1体目に効く。
// 製作費用は最初の基準（P-16）：防具1部位 3〜6個、派生1段目 作る8〜12／強化4〜6、2段目 作る14〜18／強化6〜9。

export const MATERIALS = [
  // 大型の素材（レアリティ 1白・2緑・3青）
  { id: 'mat_m01_shell', name: '苔岩の甲殻', rarity: 1 }, { id: 'mat_m01_horn', name: '苔岩の角', rarity: 2 },
  { id: 'mat_m01_plate', name: '背甲の欠片', rarity: 2 }, { id: 'mat_m01_club', name: '苔岩の尾槌', rarity: 2 },
  { id: 'mat_m01_vein', name: '翠脈石', rarity: 3 },
  { id: 'mat_m02_scale', name: '縞翼の鱗', rarity: 1 }, { id: 'mat_m02_membrane', name: '縞翼の翼膜', rarity: 2 },
  { id: 'mat_m02_spine', name: '縞翼の棘', rarity: 2 }, { id: 'mat_m02_crest', name: '縞翼のとさか', rarity: 2 },
  { id: 'mat_m02_sac', name: '火炎袋', rarity: 3 },
  { id: 'mat_m03_hide', name: '沼主の粘皮', rarity: 1 }, { id: 'mat_m03_wart', name: '沼主の毒疣', rarity: 2 },
  { id: 'mat_m03_fin', name: '沼主の尾びれ', rarity: 2 }, { id: 'mat_m03_fang', name: '沼主の牙', rarity: 2 },
  { id: 'mat_m03_gland', name: 'しびれ腺', rarity: 3 },
  // フィールドの素材
  { id: 'mat_ore', name: '鉄鉱石', rarity: 1 }, { id: 'mat_herb', name: '薬草', rarity: 1 }, { id: 'mat_bone', name: '獣骨', rarity: 1 },
  { id: 'mat_glowmoss', name: '夜光苔', rarity: 2 }, { id: 'mat_crystal', name: '翠晶石', rarity: 2 }, { id: 'mat_sunstone', name: '陽炎石', rarity: 3 },
  { id: 'mat_reed', name: '沼葦', rarity: 1 }, { id: 'mat_pearl', name: '沼真珠', rarity: 3 }, { id: 'mat_feather', name: '風切り羽', rarity: 2 },
];

export const ARMOR_SETS = [
  { id: 'set_m01', name: '苔岩', monsterId: 'mon_m01', bonuses: [
    { pieces: 2, name: '苔岩の構え', grants: { skl_guard: 1 } }, { pieces: 4, name: '苔岩の不動', grants: { skl_defense: 2 } }] },
  { id: 'set_m02', name: '縞翼', monsterId: 'mon_m02', bonuses: [
    { pieces: 2, name: '縞翼の身軽さ', grants: { skl_evade: 1 } }, { pieces: 4, name: '縞翼の狩り', grants: { skl_weakness: 2 } }] },
  { id: 'set_m03', name: '沼主', monsterId: 'mon_m03', bonuses: [
    { pieces: 2, name: '沼主の耐え', grants: { skl_ailresist: 1 } }, { pieces: 4, name: '沼主の毒腺', grants: { skl_ailment: 2 } }] },
];

const A = (setId, part, name, def, resist, skills, slots, craft, upgrade, unique) => ({
  id: `arm_${setId.slice(4)}_${part}`, setId, part, name, def, resist, skills, slots, craft, upgrade, art: `arm.${setId.slice(4)}.${part}`, ...(unique ? { unique } : {}),
});
export const ARMORS = [
  // 苔岩：守り・受け・体力（重い）
  A('set_m01', 'head', '苔岩の兜', 13, { fire: 5 }, { skl_guard: 2 }, ['s'], { mat_m01_shell: 3, mat_m01_horn: 1, mat_ore: 2 }, { mat_m01_shell: 1, mat_ore: 1 }),
  A('set_m01', 'chest', '苔岩の胴', 16, { fire: 5, thunder: -5 }, { skl_vitality: 2, skl_defense: 1 }, ['m'], { mat_m01_shell: 4, mat_m01_plate: 2 }, { mat_m01_shell: 2 },
    { name: '苔岩の背', grants: { skl_defense: 1 } }),
  A('set_m01', 'arms', '苔岩の籠手', 13, {}, { skl_heavy: 2 }, ['s'], { mat_m01_shell: 3, mat_m01_club: 1, mat_ore: 1 }, { mat_m01_shell: 1, mat_ore: 1 }),
  A('set_m01', 'waist', '苔岩の腰当て', 12, { fire: 5 }, { skl_guard: 1, skl_vitality: 1 }, [], { mat_m01_shell: 3, mat_m01_plate: 1 }, { mat_m01_shell: 1 }),
  A('set_m01', 'legs', '苔岩の脚甲', 14, {}, { skl_defense: 2 }, ['s', 's'], { mat_m01_shell: 4, mat_m01_vein: 1, mat_ore: 1 }, { mat_m01_shell: 2 }),
  // 縞翼：攻め・好機・回避・火に強い（軽い）
  A('set_m02', 'head', '縞翼の頭飾り', 10, { fire: 10, water: -5 }, { skl_weakness: 2 }, ['s', 's'], { mat_m02_scale: 3, mat_m02_crest: 1, mat_feather: 1 }, { mat_m02_scale: 1, mat_feather: 1 }),
  A('set_m02', 'chest', '縞翼の胸当て', 12, { fire: 10 }, { skl_attack: 2 }, ['m'], { mat_m02_scale: 4, mat_m02_membrane: 2 }, { mat_m02_scale: 2 },
    { name: '縞翼の目', grants: { skl_chance: 1 } }),
  A('set_m02', 'arms', '縞翼の手甲', 10, { fire: 10, water: -5 }, { skl_attack: 1, skl_chance: 1 }, ['s'], { mat_m02_scale: 3, mat_m02_spine: 1 }, { mat_m02_scale: 1 }),
  A('set_m02', 'waist', '縞翼の帯', 9, { fire: 10 }, { skl_evade: 2 }, ['s'], { mat_m02_scale: 3, mat_m02_membrane: 1 }, { mat_m02_scale: 1 }),
  A('set_m02', 'legs', '縞翼の具足', 11, { fire: 10 }, { skl_evade: 1, skl_weakness: 1 }, ['m'], { mat_m02_scale: 4, mat_m02_sac: 1, mat_crystal: 1 }, { mat_m02_scale: 2 }),
  // 沼主：状態異常・耐性・気力
  A('set_m03', 'head', '沼主の面', 11, { water: 10, thunder: -5 }, { skl_ailresist: 2 }, ['s'], { mat_m03_hide: 3, mat_m03_fang: 1, mat_reed: 2 }, { mat_m03_hide: 1, mat_reed: 1 }),
  A('set_m03', 'chest', '沼主の皮鎧', 13, { water: 10 }, { skl_ailment: 2, skl_stamina: 1 }, ['m', 's'], { mat_m03_hide: 4, mat_m03_wart: 2 }, { mat_m03_hide: 2 },
    { name: '沼主の知恵', grants: { skl_unread: 1 } }),
  A('set_m03', 'arms', '沼主の手袋', 11, { water: 5 }, { skl_regen: 2 }, ['s'], { mat_m03_hide: 3, mat_m03_fin: 1 }, { mat_m03_hide: 1 }),
  A('set_m03', 'waist', '沼主の腰巻き', 10, { water: 10, thunder: -5 }, { skl_stamina: 2 }, ['s'], { mat_m03_hide: 3, mat_m03_wart: 1 }, { mat_m03_hide: 1 }),
  A('set_m03', 'legs', '沼主の脚絆', 12, { water: 5 }, { skl_unread: 2 }, ['m'], { mat_m03_hide: 4, mat_m03_gland: 1, mat_pearl: 1 }, { mat_m03_hide: 2 }),
];

export const DECORATIONS = [
  { id: 'deco_attack', name: '攻玉', size: 's', skillId: 'skl_attack', points: 1, craft: { mat_m02_spine: 1, mat_crystal: 1 } },
  { id: 'deco_defense', name: '堅玉', size: 's', skillId: 'skl_defense', points: 1, craft: { mat_m01_shell: 2, mat_ore: 2 } },
  { id: 'deco_guard', name: '受玉', size: 's', skillId: 'skl_guard', points: 1, craft: { mat_m01_plate: 1, mat_ore: 1 } },
  { id: 'deco_vitality', name: '命玉', size: 's', skillId: 'skl_vitality', points: 1, craft: { mat_herb: 3, mat_bone: 2 } },
  { id: 'deco_evade', name: '翔玉', size: 's', skillId: 'skl_evade', points: 1, craft: { mat_m02_membrane: 1, mat_feather: 1 } },
  { id: 'deco_regen', name: '息玉', size: 's', skillId: 'skl_regen', points: 1, craft: { mat_m03_fin: 1, mat_reed: 2 } },
  { id: 'deco_weakness', name: '穿玉', size: 'm', skillId: 'skl_weakness', points: 2, craft: { mat_m02_crest: 1, mat_crystal: 2 } },
  { id: 'deco_ailment', name: '毒玉', size: 'm', skillId: 'skl_ailment', points: 2, craft: { mat_m03_wart: 2, mat_crystal: 1 } },
  { id: 'deco_ailresist', name: '清玉', size: 'm', skillId: 'skl_ailresist', points: 2, craft: { mat_m03_gland: 1, mat_herb: 3 } },
  { id: 'deco_heavy', name: '剛玉', size: 'l', skillId: 'skl_heavy', points: 3, craft: { mat_m01_vein: 1, mat_m01_club: 2, mat_sunstone: 1 } },
];

// 武器の派生：6種 × 3系統（大型ごと）× 2段（下位）。基本の武器は testGear.js の BASE_WEAPONS
const KINDS = { wt_greatsword: '大剣', wt_twinblades: '双刃', wt_hammer: '重槌', wt_lance: '竜槍', wt_bow: '弓', wt_chainblade: '鎖刃' };
const LINES = [
  { key: 'm01', names: ['苔岩の', '岩王の'], mult: [1.08, 1.15], slots: [['s'], ['s', 's']], extra: [{ element: { type: 'thunder', value: 14 } }, { element: { type: 'thunder', value: 22 } }],
    craft: [{ mat_m01_shell: 6, mat_m01_horn: 2, mat_ore: 3 }, { mat_m01_shell: 8, mat_m01_plate: 3, mat_m01_vein: 2, mat_ore: 4 }],
    up: [{ mat_m01_shell: 3, mat_ore: 2 }, { mat_m01_shell: 3, mat_m01_plate: 2, mat_m01_vein: 1, mat_ore: 2 }] },
  { key: 'm02', names: ['縞翼の', '緋翼の'], mult: [1.06, 1.12], slots: [['s'], ['m']], extra: [{ element: { type: 'fire', value: 14 } }, { element: { type: 'fire', value: 22 } }],
    craft: [{ mat_m02_scale: 6, mat_m02_spine: 2, mat_ore: 3 }, { mat_m02_scale: 8, mat_m02_membrane: 3, mat_m02_sac: 2, mat_crystal: 3 }],
    up: [{ mat_m02_scale: 3, mat_ore: 2 }, { mat_m02_scale: 3, mat_m02_membrane: 2, mat_m02_sac: 1, mat_crystal: 1 }] },
  { key: 'm03', names: ['沼主の', '沼王の'], mult: [1.06, 1.12], slots: [['s', 's'], ['m', 's']], extra: [{ element: { type: 'water', value: 14 } }, { element: { type: 'water', value: 22 } }],
    craft: [{ mat_m03_hide: 6, mat_m03_wart: 2, mat_reed: 3 }, { mat_m03_hide: 8, mat_m03_fang: 3, mat_m03_gland: 2, mat_pearl: 1 }],
    up: [{ mat_m03_hide: 3, mat_reed: 2 }, { mat_m03_hide: 3, mat_m03_fang: 2, mat_m03_gland: 1, mat_reed: 2 }] },
];
export const WEAPON_TREE = Object.entries(KINDS).flatMap(([k, n]) => {
  const short = k.slice(3), base = `wpn_${short}_base`;
  return LINES.flatMap(L => [0, 1].map(i => ({
    id: `wpn_${short}_${L.key}_${i + 1}`, kindId: k, name: `${L.names[i]}${n}`, parentId: i === 0 ? base : `wpn_${short}_${L.key}_1`,
    tier: i + 1, powerMult: L.mult[i], slots: L.slots[i], ...L.extra[i], craft: L.craft[i], upgrade: L.up[i],
  })));
});
