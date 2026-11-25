// 第6段階の「試験用」の装備と素材（22b 1章）。正式な中身ではない。
// しくみを確かめるためだけに使う。第8段階で正式なモンスターの防具・派生・素材に置きかえる。

export const TEST_MATERIALS = [ // レアリティは1〜5（呼び方は Q-05：白・緑・青・紫・金）
  { id: 'mat_test_scale', name: '試験用の鱗', rarity: 1 },
  { id: 'mat_test_shell', name: '試験用の甲殻', rarity: 2 },
  { id: 'mat_test_core', name: '試験用の核', rarity: 3 },
  { id: 'mat_test_ore', name: '試験用の鉱石', rarity: 1 },
  // 第7段階：採取・狩りの報酬で手に入る（試験用）
  { id: 'mat_test_herb', name: '試験用の薬草', rarity: 1 },
  { id: 'mat_test_bone', name: '試験用の骨', rarity: 1 },
  { id: 'mat_test_glow', name: '試験用の夜光苔', rarity: 2 },
  { id: 'mat_test_hide', name: '試験用の柔皮', rarity: 2 },
  { id: 'mat_test_tail', name: '試験用の尾', rarity: 3 },
];

/** 開発用：工房の「試験用の素材を受け取る」で渡す量 */
export const TEST_MATERIAL_GIFT = { mat_test_scale: 30, mat_test_shell: 20, mat_test_core: 8, mat_test_ore: 30 };

export const TEST_ARMOR_SETS = [
  { id: 'set_test', name: '試験体', monsterId: 'mon_test',
    bonuses: [ // セットボーナス（Q-30：2部位・4部位）。スキルとは別に数える
      { pieces: 2, name: '試験体の守り', grants: { skl_defense: 1 } },
      { pieces: 4, name: '試験体の力', grants: { skl_heavy: 2 } },
    ] },
];

const cost = (a, b, c = 0) => ({ mat_test_scale: a, mat_test_shell: b, ...(c ? { mat_test_core: c } : {}) });
export const TEST_ARMORS = [ // 1部位の守りは下位 8〜15（22b 2章）
  { id: 'arm_test_head', setId: 'set_test', part: 'head', name: '試験体の兜', def: 10, resist: { fire: 5 }, skills: { skl_weakness: 2 }, slots: ['s'],
    unique: { name: '見通しの兜', grants: { skl_insight: 1 } }, craft: cost(3, 2), upgrade: cost(2, 1) },
  { id: 'arm_test_chest', setId: 'set_test', part: 'chest', name: '試験体の胴', def: 14, resist: { fire: 5, water: -5 }, skills: { skl_vitality: 2, skl_defense: 1 }, slots: ['m'], craft: cost(4, 3), upgrade: cost(2, 2) },
  { id: 'arm_test_arms', setId: 'set_test', part: 'arms', name: '試験体の籠手', def: 11, resist: {}, skills: { skl_attack: 2 }, slots: ['s', 's'], craft: cost(3, 2), upgrade: cost(2, 1) },
  { id: 'arm_test_waist', setId: 'set_test', part: 'waist', name: '試験体の腰当て', def: 9, resist: { thunder: 5 }, skills: { skl_regen: 2 }, slots: [], craft: cost(2, 2), upgrade: cost(1, 1) },
  { id: 'arm_test_legs', setId: 'set_test', part: 'legs', name: '試験体の脚甲', def: 12, resist: {}, skills: { skl_evade: 2, skl_attack: 1 }, slots: ['l'], craft: cost(3, 3, 1), upgrade: cost(2, 2) },
];
export const ARMOR_MAX_LEVEL = 5;      // 下位の強化段階（22b 5章）
export const ARMOR_DEF_PER_LEVEL = 2;  // 1段階ごとの守り

export const TEST_DECORATIONS = [ // 1つの装飾品は1つのスキルの点だけ（22b 4章）
  { id: 'deco_test_attack', name: '攻め玉', size: 's', skillId: 'skl_attack', points: 1, craft: { mat_test_core: 1, mat_test_ore: 2 } },
  { id: 'deco_test_guard', name: '堅守玉', size: 'm', skillId: 'skl_defense', points: 2, craft: { mat_test_core: 2, mat_test_ore: 3 } },
  { id: 'deco_test_heavy', name: '渾身珠', size: 'l', skillId: 'skl_heavy', points: 3, craft: { mat_test_core: 3, mat_test_ore: 4 } },
];

// 武器の派生ツリー（各武器に試験用の1系統：基本 → 1段目 → 2段目。下位は2段目まで・22b 5章）
const KINDS = { wt_greatsword: '大剣', wt_twinblades: '双刃', wt_hammer: '重槌', wt_lance: '竜槍', wt_bow: '弓', wt_chainblade: '鎖刃' };
const ELEM = { wt_greatsword: 'fire', wt_twinblades: null, wt_hammer: 'thunder', wt_lance: 'water', wt_bow: 'ice', wt_chainblade: null };
const AIL = { wt_twinblades: 'poison', wt_chainblade: 'paralysis' };
export const BASE_WEAPONS = Object.entries(KINDS).map(([k, n]) => ({
  id: `wpn_${k.slice(3)}_base`, kindId: k, name: `${n}（基本）`, parentId: null, tier: 0, powerMult: 1, slots: ['s'], craft: {}, upgrade: null,
}));
export const TEST_WEAPON_TREE = Object.entries(KINDS).flatMap(([k, n]) => {
  const base = `wpn_${k.slice(3)}_base`, e = ELEM[k], a = AIL[k];
  const extra1 = e ? { element: { type: e, value: 12 } } : { ail: { type: a, value: 8 } };
  const extra2 = e ? { element: { type: e, value: 20 } } : { ail: { type: a, value: 14 } };
  return [
    { id: `wpn_${k.slice(3)}_test1`, kindId: k, name: `${n}・試験の一`, parentId: base, tier: 1, powerMult: 1.08, slots: ['s', 's'], ...extra1,
      craft: { mat_test_scale: 6, mat_test_shell: 4, mat_test_ore: 4 }, upgrade: { mat_test_scale: 3, mat_test_ore: 2 } },
    { id: `wpn_${k.slice(3)}_test2`, kindId: k, name: `${n}・試験の二`, parentId: `wpn_${k.slice(3)}_test1`, tier: 2, powerMult: 1.16, slots: ['m', 's'], ...extra2,
      craft: { mat_test_scale: 10, mat_test_shell: 6, mat_test_core: 2, mat_test_ore: 6 }, upgrade: { mat_test_shell: 4, mat_test_core: 1, mat_test_ore: 2 } },
  ];
});
