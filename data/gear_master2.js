// 【ネタバレ注意】マスター級に足す4種の素材・防具・派生・クエスト（第13段階・80 の3回目）と、
// 下位・上位で足した8系統のマスター級の段（5段目）。rank: 'master' はマスター級が開くまで工房に出さない。
const M = (id, name, rarity) => ({ id, name, rarity, rank: 'master' });
const NAMES = {
  m17: ['毒竜の鱗', '毒竜の首皮', '毒竜の牙', '毒竜の毒腺', '三つ首の宝玉'],
  m18: ['巨鯨の皮', '巨鯨の気袋', '巨鯨の頭殻', '巨鯨の胸びれ', '天鯨の歌石'],
  m19: ['影獣の毛皮', '影獣の爪', '影獣の角', '影の衣', '影の瞳'],
  m20: ['熔岩の甲殻', '熔岩の腕骨', '熔岩の噴石', '熔岩の火脈', '熔核'],
};
const RAR = [4, 4, 4, 5, 5];
export const MASTER2_MATERIALS = Object.entries(NAMES).flatMap(([k, ns]) => ns.map((n, i) => M(`mat_${k}_${'abcde'[i]}`, n, RAR[i])));

const SETS = {
  m17: { name: '毒竜', monsterId: 'mon_m17', field: 'mat_glowwater', resist: { ice: -5, fire: 15, dragon: 10 }, skills: ['skl_ailment', 'skl_attack', 'skl_ailresist', 'skl_vitality'], unique: { name: '三つ首の執念', grants: { skl_ailment: 3 } }, bonus: [{ pieces: 2, name: '毒竜の耐え', grants: { skl_ailresist: 3 } }, { pieces: 4, name: '毒竜の牙', grants: { skl_attack: 3 } }] },
  m18: { name: '天鯨', monsterId: 'mon_m18', field: 'mat_glowwater', resist: { water: 20, thunder: -10 }, skills: ['skl_vitality', 'skl_regen', 'skl_stamina', 'skl_insight'], unique: { name: '天鯨の歌', grants: { skl_regen: 3 } }, bonus: [{ pieces: 2, name: '天鯨の息', grants: { skl_stamina: 3 } }, { pieces: 4, name: '天鯨の巨躯', grants: { skl_vitality: 3 } }] },
  m19: { name: '影獣', monsterId: 'mon_m19', field: 'mat_runestone', resist: { dragon: 15, fire: -10 }, skills: ['skl_evade', 'skl_unread', 'skl_chance', 'skl_counter'], unique: { name: '影の衣', grants: { skl_unread: 3 } }, bonus: [{ pieces: 2, name: '影獣の身軽さ', grants: { skl_evade: 3 } }, { pieces: 4, name: '影獣の返し', grants: { skl_counter: 3 } }] },
  m20: { name: '熔岩', monsterId: 'mon_m20', field: 'mat_deepcrystal', resist: { fire: 25, water: -10 }, skills: ['skl_heavy', 'skl_breaker', 'skl_defense', 'skl_guard'], unique: { name: '熔核の熱', grants: { skl_heavy: 3 } }, bonus: [{ pieces: 2, name: '熔岩の固さ', grants: { skl_defense: 3 } }, { pieces: 4, name: '熔岩の砕き', grants: { skl_breaker: 3 } }] },
};
const PARTS = [
  { part: 'head', label: '兜', def: 106, slots: ['l'], n: [3, 1, 0] }, { part: 'chest', label: '胴', def: 120, slots: ['l', 'm'], n: [4, 1, 1], unique: true },
  { part: 'arms', label: '籠手', def: 108, slots: ['m', 'm'], n: [3, 1, 0] }, { part: 'waist', label: '腰', def: 104, slots: ['l'], n: [3, 0, 1] },
  { part: 'legs', label: '脚', def: 112, slots: ['l', 's'], n: [3, 1, 1] },
];
export const MASTER2_ARMOR_SETS = Object.entries(SETS).map(([k, s]) => ({ id: `set_${k}`, name: s.name, monsterId: s.monsterId, bonuses: s.bonus, rank: 'master' }));
export const MASTER2_ARMORS = Object.entries(SETS).flatMap(([k, s]) => PARTS.map((p, i) => {
  const mats = [`mat_${k}_a`, `mat_${k}_b`, `mat_${k}_d`];
  const craft = {}; p.n.forEach((n, j) => { if (n) craft[mats[j]] = n; }); craft[s.field] = 1;
  const sk = s.skills, skills = { [sk[i % 4]]: 3, [sk[(i + 1) % 4]]: 2 };
  return { id: `arm_${k}_${p.part}`, setId: `set_${k}`, part: p.part, name: `${s.name}の${p.label}`, def: p.def, resist: s.resist, skills, slots: p.slots,
    craft, upgrade: { [mats[0]]: 1, [s.field]: 1 }, maxLevel: 10, defPerLevel: 6, rank: 'master', art: `arm.${k}.${p.part}`, ...(p.unique ? { unique: s.unique } : {}) };
}));

const KINDS = { wt_greatsword: '大剣', wt_twinblades: '双刃', wt_hammer: '重槌', wt_lance: '竜槍', wt_bow: '弓', wt_chainblade: '鎖刃' };
// 新しい4系統（マスター級・基本から2段）
const NEWL = [
  ['m17', ['毒竜の', '三首竜の'], { ail: 'poison', v: [44, 54] }, 'mat_glowwater'],
  ['m18', ['天鯨の', '天海の'], { element: 'water', v: [54, 64] }, 'mat_glowwater'],
  ['m19', ['影獣の', '常闇の'], { ail: 'paralysis', v: [44, 54] }, 'mat_runestone'],
  ['m20', ['熔岩の', '熔核の'], { element: 'fire', v: [54, 64] }, 'mat_deepcrystal'],
];
// 下位・上位で足した8系統の最終段（下位の4系統は5段目、上位の4系統は3段目＝段の強さは5）
const FINAL = [
  ['m09', 4, '砂神王の', { ail: 'sleep', v: 42 }, 'mat_m20_c'], ['m10', 4, '覇王の', { ail: 'bleed', v: 42 }, 'mat_m19_b'],
  ['m11', 4, '天雷甲の', { ail: 'paralysis', v: 42 }, 'mat_m18_c'], ['m12', 4, '蛇神王の', { ail: 'poison', v: 42 }, 'mat_m17_c'],
  ['m13', 2, '天嵐の', { element: 'ice', v: 58 }, 'mat_m18_b'], ['m14', 2, '凍海の', { element: 'water', v: 58 }, 'mat_m18_a'],
  ['m15', 2, '女王蜘蛛の', { ail: 'poison', v: 42 }, 'mat_m19_a'], ['m16', 2, '神木の', { ail: 'sleep', v: 42 }, 'mat_m17_a'],
];
const effect = x => (x.element ? { element: { type: x.element, value: x.v } } : { ail: { type: x.ail, value: x.v } });
export const MASTER2_WEAPON_TREE = Object.entries(KINDS).flatMap(([k, n]) => {
  const s = k.slice(3), base = `wpn_${s}_base`;
  const fresh = NEWL.flatMap(([line, names, x, field]) => [0, 1].map(i => ({
    id: `wpn_${s}_${line}_${i + 1}`, kindId: k, name: `${names[i]}${n}`, parentId: i === 0 ? base : `wpn_${s}_${line}_1`, tier: 5 + i, rank: 'master',
    powerMult: [1.58, 1.7][i], slots: [['l', 's'], ['l', 'm']][i], ...effect({ ...x, v: x.v[i] }),
    craft: [{ [`mat_${line}_a`]: 10, [`mat_${line}_b`]: 3, [field]: 3 }, { [`mat_${line}_a`]: 12, [`mat_${line}_c`]: 4, [`mat_${line}_e`]: 2, mat_starroot: 1 }][i],
    upgrade: [{ [`mat_${line}_a`]: 5, [field]: 2 }, { [`mat_${line}_a`]: 6, [`mat_${line}_e`]: 1, mat_starroot: 1 }][i],
  })));
  const fin = FINAL.map(([line, pt, name, x, m1]) => ({
    id: `wpn_${s}_${line}_${pt + 1}`, kindId: k, name: `${name}${n}`, parentId: `wpn_${s}_${line}_${pt}`, tier: 5, rank: 'master',
    powerMult: 1.62, slots: ['l', 'm'], ...effect(x), craft: { [m1]: 10, mat_runestone: 3, mat_deepcrystal: 2 }, upgrade: { [m1]: 5, mat_runestone: 2 },
  }));
  return [...fresh, ...fin];
});

export const MASTER2_DECORATIONS = [
  { id: 'deco_ailment_m', name: '極毒玉', size: 'l', skillId: 'skl_ailment', points: 3, craft: { mat_m17_d: 1, mat_glowwater: 2 }, rank: 'master' },
  { id: 'deco_regen_m', name: '極流玉', size: 'm', skillId: 'skl_regen', points: 2, craft: { mat_m18_b: 1, mat_glowwater: 2 }, rank: 'master' },
  { id: 'deco_unread_m', name: '極影玉', size: 'm', skillId: 'skl_unread', points: 2, craft: { mat_m19_d: 1, mat_runestone: 1 }, rank: 'master' },
  { id: 'deco_breaker_m', name: '極砕玉', size: 'l', skillId: 'skl_breaker', points: 3, craft: { mat_m20_c: 1, mat_deepcrystal: 1 }, rank: 'master' },
];

// 置き場所：扉の先の2フィールドに住む種と、クエストだけで出る種
export const MASTER2_PLACES = {
  fld_starroot: { monsterId: 'mon_m17', at: { dawn: 'f7_spring', day: 'f7_spring', dusk: 'f7_roots', night: 'f7_roots' }, lairs: ['f7_spring', 'f7_roots', 'f7_ledge'] },
  fld_hollow: { monsterId: 'mon_m20', at: { dawn: 'f6_vent', day: 'f6_vent', dusk: 'f6_vent', night: 'f6_bones' }, lairs: ['f6_vent', 'f6_bones'] },
};
const brk = (m, part, text, mat) => ({ id: `x_${m.slice(4)}_${part}`, type: 'break', monsterId: m, part, text, money: 800, mats: [{ id: mat, w: 100, n: [1, 1] }] });
const cap = (m, mat) => ({ id: `x_${m.slice(4)}_cap`, type: 'capture', monsterId: m, text: '捕獲する', money: 900, mats: [{ id: mat, w: 100, n: [1, 1] }] });
const H = (id, m, field, name, desc, start, money, danger, extra, more = {}) => ({ id, name, kind: 'hunt', fieldId: field, start, desc, rank: 'master', danger,
  goal: { type: 'hunt', monsterId: m, text: `${name.replace(/の討伐$/, '')}を討伐する（捕獲でもよい）` }, extra, reward: { money, n: [4, 6] }, ...more });
export const MASTER2_QUESTS = [
  H('q_m_m17', 'mon_m17', 'fld_starroot', 'ミツクビの討伐', '星の根の庭の外れの沼に、三つの首を持つ竜が棲みついた。', 'dawn', 3400, 7, [brk('mon_m17', 'center', '真ん中の首を壊す', 'mat_m17_c'), cap('mon_m17', 'mat_m17_e')]),
  H('q_m_m18', 'mon_m18', 'fld_hollow', 'アマクジラの討伐', '大空洞の天井の下を、巨大な影が泳いでいる。', 'day', 3200, 6, [brk('mon_m18', 'sacs', '気袋を壊す', 'mat_m18_b'), cap('mon_m18', 'mat_m18_e')],
    { monsters: [{ monsterId: 'mon_m18', at: { dawn: 'f6_pool', day: 'f6_stair', dusk: 'f6_stair', night: 'f6_pool' }, lairs: ['f6_stair', 'f6_pool', 'f6_forest'] }] }),
  H('q_m_m19', 'mon_m19', 'fld_hollow', 'カゲツグミの討伐', '大空洞の暗がりで、影が人を襲うという。', 'dusk', 3400, 7, [brk('mon_m19', 'mantle', '影の衣を壊す', 'mat_m19_d'), cap('mon_m19', 'mat_m19_e')],
    { monsters: [{ monsterId: 'mon_m19', at: { dawn: null, day: null, dusk: 'f6_shadow', night: 'f6_bones' }, lairs: ['f6_shadow', 'f6_bones'] }] }),
  H('q_m_m20', 'mon_m20', 'fld_hollow', 'ヴォルグの討伐', '熱の噴き出し口から、岩の巨体が歩き出した。', 'day', 3600, 7, [brk('mon_m20', 'core', '熔核を壊す', 'mat_m20_e'), cap('mon_m20', 'mat_m20_d')]),
];

export const MASTER2_EVENTS = [
  { id: 'ev_m17', when: { hunted: 'mon_m17' }, title: '三つの首', lines: [['シオン', '壁画の龍の足元に、首が三つある獣も描かれてた。'], ['シオン', '龍に仕えていたのか、龍と争っていたのか……まだ読めないんだ。']] },
  { id: 'ev_m18', when: { hunted: 'mon_m18' }, title: '空の歌', lines: [['ポッコ', 'あの大きいのの歌石、耳に当てると歌が聞こえるんだ！'], ['ポッコ', '……ゴルドのおっちゃんは「腹の虫だ」って言うけど。']] },
  { id: 'ev_m19', when: { hunted: 'mon_m19' }, title: '影の正体', lines: [['ゴルド', '影の衣ってやつ、光に透かすと何も映らねえ。'], ['ゴルド', '鍛えるのはいいが、夜道でなくすなよ。二度と見つからん。']] },
  { id: 'ev_m20', when: { hunted: 'mon_m20' }, title: '熔核の熱', lines: [['ゴルド', '熔核を炉に入れたら、三日たっても火が消えねえ。'], ['ゴルド', 'これなら、どんな硬い鉱石も打てる。いい土産だ。']] },
];
