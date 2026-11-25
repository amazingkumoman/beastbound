// 【ネタバレ注意】下位に足す4種の素材・防具・武器の派生・クエスト（第13段階・80 の1回目）。
const M = (id, name, rarity) => ({ id, name, rarity });
const NAMES = {
  m09: ['砂潜りの節皮', '砂潜りの牙', '砂潜りの尾節', '砂潜りの体液', '砂潜りの胃石'],
  m10: ['豪腕の毛皮', '豪腕の拳骨', '豪腕の飾り毛', '豪腕の腱', '豪腕の心臓'],
  m11: ['鎧角の甲', '鎧角の羽', '鎧角の大角', '鎧角の脚', '鎧角の樹液玉'],
  m12: ['大蛇の鱗', '大蛇の尾', '大蛇の毒牙', '大蛇の抜け殻', '大蛇の毒腺'],
};
const RAR = [1, 2, 2, 2, 3];
export const LOW2_MATERIALS = Object.entries(NAMES).flatMap(([k, ns]) => ns.map((n, i) => M(`mat_${k}_${'abcde'[i]}`, n, RAR[i])));

// 防具（下位・守り 9〜16・強化の上限5）
const SETS = {
  m09: { name: '砂潜り', monsterId: 'mon_m09', resist: { water: -5, fire: 5 }, skills: ['skl_vitality', 'skl_ailresist', 'skl_stamina', 'skl_guard'], unique: { name: '砂潜りの皮', grants: { skl_ailresist: 1 } }, bonus: [{ pieces: 2, name: '砂潜りの粘り', grants: { skl_stamina: 1 } }, { pieces: 4, name: '砂潜りの胃袋', grants: { skl_vitality: 2 } }] },
  m10: { name: '豪腕', monsterId: 'mon_m10', resist: { fire: -5, thunder: 5 }, skills: ['skl_heavy', 'skl_attack', 'skl_breaker', 'skl_vitality'], unique: { name: '豪腕の拳', grants: { skl_heavy: 1 } }, bonus: [{ pieces: 2, name: '豪腕の力', grants: { skl_attack: 1 } }, { pieces: 4, name: '豪腕の破壊', grants: { skl_breaker: 2 } }] },
  m11: { name: '鎧角', monsterId: 'mon_m11', resist: { thunder: -5, water: 5 }, skills: ['skl_defense', 'skl_guard', 'skl_counter', 'skl_breaker'], unique: { name: '鎧角の甲', grants: { skl_defense: 1 } }, bonus: [{ pieces: 2, name: '鎧角の構え', grants: { skl_guard: 1 } }, { pieces: 4, name: '鎧角の返し', grants: { skl_counter: 2 } }] },
  m12: { name: '大蛇', monsterId: 'mon_m12', resist: { water: 10, thunder: -5 }, skills: ['skl_ailment', 'skl_evade', 'skl_weakness', 'skl_chance'], unique: { name: '大蛇の目', grants: { skl_chance: 1 } }, bonus: [{ pieces: 2, name: '大蛇のしなり', grants: { skl_evade: 1 } }, { pieces: 4, name: '大蛇の毒', grants: { skl_ailment: 2 } }] },
};
const PARTS = [
  { part: 'head', label: '兜', def: 11, slots: ['s'], n: [3, 1, 0] }, { part: 'chest', label: '胴', def: 15, slots: ['m'], n: [4, 0, 1], unique: true },
  { part: 'arms', label: '籠手', def: 12, slots: ['s', 's'], n: [3, 1, 0] }, { part: 'waist', label: '腰', def: 10, slots: [], n: [3, 0, 1] },
  { part: 'legs', label: '脚', def: 13, slots: ['s'], n: [3, 1, 0] },
];
export const LOW2_ARMOR_SETS = Object.entries(SETS).map(([k, s]) => ({ id: `set_${k}`, name: s.name, monsterId: s.monsterId, bonuses: s.bonus }));
export const LOW2_ARMORS = Object.entries(SETS).flatMap(([k, s]) => PARTS.map((p, i) => {
  const mats = [`mat_${k}_a`, `mat_${k}_b`, `mat_${k}_c`];
  const craft = {}; p.n.forEach((n, j) => { if (n) craft[mats[j]] = n; }); craft.mat_ore = 1;
  const sk = s.skills;
  return { id: `arm_${k}_${p.part}`, setId: `set_${k}`, part: p.part, name: `${s.name}の${p.label}`, def: p.def, resist: s.resist,
    skills: { [sk[i % 4]]: 2, [sk[(i + 1) % 4]]: 1 }, slots: p.slots, craft, upgrade: { [mats[0]]: 1, mat_ore: 1 }, art: `arm.${k}.${p.part}`, ...(p.unique ? { unique: s.unique } : {}) };
}));

// 武器の派生（下位・2段）：状態異常の系統（正式方針 6-3：毒・麻痺・睡眠など）
const KINDS = { wt_greatsword: '大剣', wt_twinblades: '双刃', wt_hammer: '重槌', wt_lance: '竜槍', wt_bow: '弓', wt_chainblade: '鎖刃' };
const LINES = [
  ['m09', ['砂潜りの', '砂王の'], { type: 'sleep', v: [10, 16] }],
  ['m10', ['豪腕の', '剛腕の'], { type: 'bleed', v: [10, 16] }],
  ['m11', ['鎧角の', '甲王の'], { type: 'paralysis', v: [8, 14] }],
  ['m12', ['大蛇の', '蛇王の'], { type: 'poison', v: [10, 16] }],
];
export const LOW2_WEAPON_TREE = Object.entries(KINDS).flatMap(([k, n]) => {
  const s = k.slice(3), base = `wpn_${s}_base`;
  return LINES.flatMap(([line, names, ail]) => [0, 1].map(i => ({
    id: `wpn_${s}_${line}_${i + 1}`, kindId: k, name: `${names[i]}${n}`, parentId: i === 0 ? base : `wpn_${s}_${line}_1`, tier: i + 1,
    powerMult: [1.06, 1.12][i], slots: [['s'], ['m', 's']][i], ail: { type: ail.type, value: ail.v[i] },
    craft: [{ [`mat_${line}_a`]: 6, [`mat_${line}_b`]: 2, mat_ore: 3 }, { [`mat_${line}_a`]: 8, [`mat_${line}_c`]: 3, [`mat_${line}_e`]: 2, mat_ore: 4 }][i],
    upgrade: [{ [`mat_${line}_a`]: 3, mat_ore: 2 }, { [`mat_${line}_a`]: 3, [`mat_${line}_c`]: 2, [`mat_${line}_e`]: 1, mat_ore: 2 }][i],
  })));
});

// 置き場所（今の下位のフィールドに足す）とクエスト
export const LOW2_PLACES = {
  fld_canyon: { monsterId: 'mon_m09', at: { dawn: 'f2_floor', day: 'f2_floor', dusk: 'f2_scorch', night: 'f2_floor' }, lairs: ['f2_floor', 'f2_scorch', 'f2_grass'] },
  fld_forest: [
    { monsterId: 'mon_m10', at: { dawn: 'f1_thicket', day: 'f1_thicket', dusk: 'f1_path', night: 'f1_ridge' }, lairs: ['f1_thicket', 'f1_path', 'f1_ridge'] },
    { monsterId: 'mon_m11', at: { dawn: null, day: null, dusk: 'f1_spring', night: 'f1_spring' }, lairs: ['f1_spring', 'f1_quarry'] },
  ],
  fld_marsh: { monsterId: 'mon_m12', at: { dawn: 'f3_pool', day: 'f3_reeds', dusk: 'f3_reeds', night: 'f3_pool' }, lairs: ['f3_pool', 'f3_reeds', 'f3_steam'] },
};
const brk = (m, part, text, mat) => ({ id: `x_${m.slice(4)}_${part}`, type: 'break', monsterId: m, part, text, money: 100, mats: [{ id: mat, w: 100, n: [1, 1] }] });
const cap = (m, mat) => ({ id: `x_${m.slice(4)}_cap`, type: 'capture', monsterId: m, text: '捕獲する', money: 150, mats: [{ id: mat, w: 100, n: [1, 1] }] });
const H = (id, m, field, name, desc, start, money, danger, extra, more = {}) => ({ id, name, kind: 'hunt', fieldId: field, start, desc, danger,
  goal: { type: 'hunt', monsterId: m, text: `${name.replace(/の討伐$/, '')}を討伐する（捕獲でもよい）` }, extra, reward: { money, n: [3, 5] }, ...more });
export const LOW2_QUESTS = [
  H('q_m09_hunt', 'mon_m09', 'fld_canyon', 'ゴラムの討伐', '赤風の峡谷の谷底で、砂の下から獣を襲うものがいる。', 'dawn', 450, 2, [brk('mon_m09', 'maw', '口を壊す', 'mat_m09_b'), cap('mon_m09', 'mat_m09_e')]),
  H('q_m10_hunt', 'mon_m10', 'fld_forest', 'バルガの討伐', '古塔の森で、岩を投げて暴れる獣を討伐してほしい。', 'dawn', 450, 2, [brk('mon_m10', 'arms', '腕を壊す', 'mat_m10_b'), cap('mon_m10', 'mat_m10_e')]),
  H('q_m11_hunt', 'mon_m11', 'fld_forest', 'カブラの討伐', '夜の古塔の森に、大きな角の甲虫が飛んでくる。', 'dusk', 500, 2, [brk('mon_m11', 'horn', '角を壊す', 'mat_m11_c'), cap('mon_m11', 'mat_m11_e')]),
  H('q_m12_hunt', 'mon_m12', 'fld_marsh', 'ミズチの討伐', '沈み橋の湿原の溜まりに、大きな蛇が住みついた。', 'dawn', 500, 2, [brk('mon_m12', 'tail', '尾を壊す', 'mat_m12_b'), cap('mon_m12', 'mat_m12_e')]),
  { ...H('q_m09_special', 'mon_m09', 'fld_canyon', '夜までにゴラムを', '日が沈む前に、谷底の砂潜りを討伐せよ。', 'dawn', 650, 3, []), kind: 'special', limit: 'night',
    goal: { type: 'hunt', monsterId: 'mon_m09', text: '夜までにゴラムを討伐する（捕獲でもよい）' }, unlock: { hunted: 'mon_m09' } },
  { ...H('q_m12_capture', 'mon_m12', 'fld_marsh', 'ミズチの捕獲', '研究のため、ミズチを生きたまま捕らえてほしい。', 'day', 600, 2, []),
    goal: { type: 'capture', monsterId: 'mon_m12', text: 'ミズチを捕獲する' }, unlock: { hunted: 'mon_m12' } },
];

// 小さな出来事（狩ったあと、拠点で）
export const LOW2_EVENTS = [
  { id: 'ev_m09', when: { hunted: 'mon_m09' }, title: '砂の下の道', lines: [['シオン', '砂潜りの通った跡、地図に写してみたんだ。'], ['シオン', '谷の地下を、塔から塔へまっすぐつないでいる。……あの獣も、塔の光をたどっているのかな。']] },
  { id: 'ev_m10', when: { hunted: 'mon_m10' }, title: '投げられた石', lines: [['ゴルド', 'あの猿の投げた岩、ただの岩じゃなかった。'], ['ゴルド', '塔の石を割ったかけらだ。……あいつら、塔の石の固さを知ってて選んでる。']] },
  { id: 'ev_m11', when: { hunted: 'mon_m11' }, title: '甲虫の甲', lines: [['ポッコ', 'あの甲虫の樹液玉、なめてみたら甘かったぞ！'], ['ミレイ', '……ポッコさん、研究の素材を勝手になめないで。']] },
  { id: 'ev_m12', when: { hunted: 'mon_m12' }, title: '抜け殻', lines: [['タバサ', '大蛇の抜け殻、街じゃ縁起物で高く売れるんだよ。'], ['タバサ', '……売らないのかい？ そうかい。研究ってのは、もうけにならないねえ。']] },
];
