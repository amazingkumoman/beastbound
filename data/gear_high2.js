// 【ネタバレ注意】上位に足す4種の素材・防具・派生・クエスト（第13段階・80 の2回目）と、
// 下位で足した状態異常の4系統の上位の段（3・4段目）。rank: 'high' は上位が開くまで工房に出さない。
const M = (id, name, rarity) => ({ id, name, rarity, rank: 'high' });
const NAMES = {
  m13: ['嵐呼びの羽毛', '嵐呼びの風切り羽', '嵐呼びのくちばし', '嵐呼びの蹴爪', '嵐の目玉'],
  m14: ['魚竜の鱗', '魚竜の背びれ', '魚竜の牙', '魚竜の浮き袋', '凍河の水晶'],
  m15: ['大蜘蛛の外皮', '大蜘蛛の糸袋', '大蜘蛛の毒牙', '大蜘蛛の脚', '大蜘蛛の宝眼'],
  m16: ['菌獣の樹皮', '菌獣の傘', '菌獣の根芯', '菌獣の胞子嚢', '古木の心'],
};
const RAR = [3, 3, 3, 4, 4];
export const HIGH2_MATERIALS = Object.entries(NAMES).flatMap(([k, ns]) => ns.map((n, i) => M(`mat_${k}_${'abcde'[i]}`, n, RAR[i])));

const SETS = {
  m13: { name: '嵐呼び', monsterId: 'mon_m13', field: 'mat_icecrystal', resist: { ice: 10, thunder: -5 }, skills: ['skl_evade', 'skl_stamina', 'skl_chance', 'skl_weakness'], unique: { name: '嵐呼びの翼', grants: { skl_evade: 2 } }, bonus: [{ pieces: 2, name: '嵐呼びの身軽さ', grants: { skl_stamina: 2 } }, { pieces: 4, name: '嵐呼びの狩り', grants: { skl_weakness: 3 } }] },
  m14: { name: '凍河', monsterId: 'mon_m14', field: 'mat_frostherb', resist: { water: 15, thunder: -5 }, skills: ['skl_vitality', 'skl_regen', 'skl_resist', 'skl_counter'], unique: { name: '凍河の鱗', grants: { skl_resist: 2 } }, bonus: [{ pieces: 2, name: '凍河の巡り', grants: { skl_regen: 2 } }, { pieces: 4, name: '凍河の返し', grants: { skl_counter: 3 } }] },
  m15: { name: '大蜘蛛', monsterId: 'mon_m15', field: 'mat_ancientstone', resist: { fire: -5, dragon: 10 }, skills: ['skl_ailment', 'skl_unread', 'skl_insight', 'skl_multihit'], unique: { name: '大蜘蛛の眼', grants: { skl_insight: 2 } }, bonus: [{ pieces: 2, name: '大蜘蛛の待ち伏せ', grants: { skl_unread: 2 } }, { pieces: 4, name: '大蜘蛛の毒', grants: { skl_ailment: 3 } }] },
  m16: { name: '菌獣', monsterId: 'mon_m16', field: 'mat_veincrystal', resist: { water: 10, fire: -5 }, skills: ['skl_ailresist', 'skl_defense', 'skl_guard', 'skl_vitality'], unique: { name: '菌獣の根', grants: { skl_ailresist: 2 } }, bonus: [{ pieces: 2, name: '菌獣の固さ', grants: { skl_defense: 2 } }, { pieces: 4, name: '菌獣の不動', grants: { skl_guard: 3 } }] },
};
const PARTS = [
  { part: 'head', label: '兜', def: 40, slots: ['m'], n: [3, 1, 0] }, { part: 'chest', label: '胴', def: 50, slots: ['m', 's'], n: [4, 1, 1], unique: true },
  { part: 'arms', label: '籠手', def: 42, slots: ['s', 's'], n: [3, 0, 1] }, { part: 'waist', label: '腰', def: 39, slots: ['m'], n: [3, 1, 0] },
  { part: 'legs', label: '脚', def: 45, slots: ['l'], n: [3, 0, 1] },
];
export const HIGH2_ARMOR_SETS = Object.entries(SETS).map(([k, s]) => ({ id: `set_${k}`, name: s.name, monsterId: s.monsterId, bonuses: s.bonus, rank: 'high' }));
export const HIGH2_ARMORS = Object.entries(SETS).flatMap(([k, s]) => PARTS.map((p, i) => {
  const mats = [`mat_${k}_a`, `mat_${k}_b`, `mat_${k}_d`];
  const craft = {}; p.n.forEach((n, j) => { if (n) craft[mats[j]] = n; }); craft[s.field] = 1;
  const sk = s.skills, skills = { [sk[i % 4]]: 2, [sk[(i + 1) % 4]]: 1 };
  if (i === 4) skills[sk[3]] = (skills[sk[3]] || 0) + 1;
  return { id: `arm_${k}_${p.part}`, setId: `set_${k}`, part: p.part, name: `${s.name}の${p.label}`, def: p.def, resist: s.resist, skills, slots: p.slots,
    craft, upgrade: { [mats[0]]: 1, [s.field]: 1 }, maxLevel: 8, defPerLevel: 4, rank: 'high', art: `arm.${k}.${p.part}`, ...(p.unique ? { unique: s.unique } : {}) };
}));

const KINDS = { wt_greatsword: '大剣', wt_twinblades: '双刃', wt_hammer: '重槌', wt_lance: '竜槍', wt_bow: '弓', wt_chainblade: '鎖刃' };
// 新しい4系統（上位の段・基本から）
const NEWL = [
  ['m13', ['嵐呼びの', '大嵐の'], { element: 'ice', v: [30, 40] }, 'mat_icecrystal'],
  ['m14', ['凍河の', '大河の'], { element: 'water', v: [30, 40] }, 'mat_frostherb'],
  ['m15', ['大蜘蛛の', '女郎の'], { ail: 'poison', v: [22, 30] }, 'mat_ancientstone'],
  ['m16', ['菌獣の', '古木の'], { ail: 'sleep', v: [22, 30] }, 'mat_veincrystal'],
];
// 下位で足した状態異常の4系統の続き（3・4段目）
const EXT = [
  ['m09', ['砂王の剛', '砂神の'], 'sleep', 'mat_m16_a'], ['m10', ['剛腕の極', '覇腕の'], 'bleed', 'mat_m13_a'],
  ['m11', ['甲王の極', '雷甲の'], 'paralysis', 'mat_m14_a'], ['m12', ['蛇王の極', '大蛇神の'], 'poison', 'mat_m15_a'],
];
export const HIGH2_WEAPON_TREE = Object.entries(KINDS).flatMap(([k, n]) => {
  const s = k.slice(3), base = `wpn_${s}_base`;
  const fresh = NEWL.flatMap(([line, names, x, field]) => [0, 1].map(i => ({
    id: `wpn_${s}_${line}_${i + 1}`, kindId: k, name: `${names[i]}${n}`, parentId: i === 0 ? base : `wpn_${s}_${line}_1`, tier: i + 3, rank: 'high',
    powerMult: [1.3, 1.42][i], slots: [['m', 's'], ['l', 's']][i], ...(x.element ? { element: { type: x.element, value: x.v[i] } } : { ail: { type: x.ail, value: x.v[i] } }),
    craft: [{ [`mat_${line}_a`]: 8, [`mat_${line}_b`]: 3, [field]: 2 }, { [`mat_${line}_a`]: 10, [`mat_${line}_c`]: 4, [`mat_${line}_e`]: 2, [field]: 3 }][i],
    upgrade: [{ [`mat_${line}_a`]: 4, [field]: 1 }, { [`mat_${line}_a`]: 4, [`mat_${line}_c`]: 2, [`mat_${line}_e`]: 1, [field]: 1 }][i],
  })));
  const ext = EXT.flatMap(([line, names, ail, upmat]) => [0, 1].map(i => ({
    id: `wpn_${s}_${line}_${i + 3}`, kindId: k, name: `${names[i]}${n}`, parentId: `wpn_${s}_${line}_${i + 2}`, tier: i + 3, rank: 'high',
    powerMult: [1.3, 1.42][i], slots: [['m', 's'], ['l', 's']][i], ail: { type: ail, value: [24, 32][i] },
    craft: [{ [`mat_${line}_e`]: 3, [upmat]: 6, mat_ancientstone: 2 }, { [`mat_${line}_e`]: 4, [upmat]: 8, mat_veincrystal: 2 }][i],
    upgrade: [{ [`mat_${line}_e`]: 2, [upmat]: 3, mat_ancientstone: 1 }, { [`mat_${line}_e`]: 2, [upmat]: 4, mat_veincrystal: 1 }][i],
  })));
  return [...fresh, ...ext];
});

export const HIGH2_DECORATIONS = [
  { id: 'deco_stamina_h', name: '風持玉', size: 'm', skillId: 'skl_stamina', points: 2, craft: { mat_m13_b: 1, mat_icecrystal: 1 }, rank: 'high' },
  { id: 'deco_regen_h', name: '流息玉', size: 'm', skillId: 'skl_regen', points: 2, craft: { mat_m14_b: 1, mat_frostherb: 2 }, rank: 'high' },
  { id: 'deco_ailment_h', name: '蜘毒玉', size: 'l', skillId: 'skl_ailment', points: 3, craft: { mat_m15_d: 1, mat_veincrystal: 1 }, rank: 'high' },
  { id: 'deco_guard_h', name: '古木玉', size: 'm', skillId: 'skl_guard', points: 2, craft: { mat_m16_a: 2, mat_ancientstone: 1 }, rank: 'high' },
];

// 置き場所：奥地の2フィールドに住む種と、下位のフィールドに上位の時期だけ出る種（クエストの配置）
export const HIGH2_PLACES = {
  fld_ridge: { monsterId: 'mon_m13', at: { dawn: 'f4_pass', day: 'f4_pass', dusk: 'f4_ledge', night: 'f4_ledge' }, lairs: ['f4_pass', 'f4_ledge', 'f4_slope'] },
  fld_ruins: { monsterId: 'mon_m15', at: { dawn: 'f5_tower', day: 'f5_tower', dusk: 'f5_avenue', night: 'f5_avenue' }, lairs: ['f5_tower', 'f5_avenue', 'f5_rooftop'] },
};
const brk = (m, part, text, mat) => ({ id: `x_${m.slice(4)}_${part}`, type: 'break', monsterId: m, part, text, money: 300, mats: [{ id: mat, w: 100, n: [1, 1] }] });
const cap = (m, mat) => ({ id: `x_${m.slice(4)}_cap`, type: 'capture', monsterId: m, text: '捕獲する', money: 400, mats: [{ id: mat, w: 100, n: [1, 1] }] });
const H = (id, m, field, name, desc, start, money, danger, extra, more = {}) => ({ id, name, kind: 'hunt', fieldId: field, start, desc, rank: 'high', danger,
  goal: { type: 'hunt', monsterId: m, text: `${name.replace(/の討伐$/, '')}を討伐する（捕獲でもよい）` }, extra, reward: { money, n: [4, 6] }, ...more });
const at = (monsterId, spots, lairs) => [{ monsterId, at: { dawn: spots[0], day: spots[0], dusk: spots[1], night: spots[1] }, lairs }];
export const HIGH2_QUESTS = [
  H('q_h_m13', 'mon_m13', 'fld_ridge', 'フウガの討伐', '凍てつく尾根の峠で、嵐を呼ぶ大きな鳥が旅人を吹き飛ばしている。', 'dawn', 1300, 4, [brk('mon_m13', 'wings', '翼を壊す', 'mat_m13_b'), cap('mon_m13', 'mat_m13_e')]),
  H('q_h_m14', 'mon_m14', 'fld_marsh', 'ラギアの討伐', '沈み橋の湿原の深い水路に、凍河から大きな魚竜が下ってきた。', 'dawn', 1300, 4, [brk('mon_m14', 'fins', '背びれを壊す', 'mat_m14_b'), cap('mon_m14', 'mat_m14_e')],
    { monsters: at('mon_m14', ['f3_deep', 'f3_bridge'], ['f3_deep', 'f3_bridge', 'f3_pool']) }),
  H('q_h_m15', 'mon_m15', 'fld_ruins', 'アラクネの討伐', '眠れる都の塔に、大きな蜘蛛が巣を張った。', 'dusk', 1400, 5, [brk('mon_m15', 'legs', '脚を壊す', 'mat_m15_d'), cap('mon_m15', 'mat_m15_e')]),
  H('q_h_m16', 'mon_m16', 'fld_forest', 'ミコラの討伐', '古塔の森の奥の古木が、夜になると歩き出すという。', 'dusk', 1400, 5, [brk('mon_m16', 'caps', '菌の傘を壊す', 'mat_m16_b'), cap('mon_m16', 'mat_m16_e')],
    { monsters: [{ monsterId: 'mon_m16', at: { dawn: 'f1_stairs', day: 'f1_stairs', dusk: 'f1_stairs', night: 'f1_roots' }, lairs: ['f1_stairs', 'f1_roots', 'f1_path'] }] }),
  { ...H('q_h_m13_special', 'mon_m13', 'fld_ridge', '日暮れまでにフウガを', '日が暮れる前に、峠の大怪鳥を討伐せよ。', 'dawn', 1800, 5, []), kind: 'special', limit: 'dusk',
    goal: { type: 'hunt', monsterId: 'mon_m13', text: '夕方までにフウガを討伐する（捕獲でもよい）' }, unlock: { hunted: 'mon_m13' } },
  { ...H('q_h_m15_capture', 'mon_m15', 'fld_ruins', 'アラクネの捕獲', '研究のため、大蜘蛛を生きたまま捕らえてほしい。', 'dusk', 1700, 5, []),
    goal: { type: 'capture', monsterId: 'mon_m15', text: 'アラクネを捕獲する' }, unlock: { hunted: 'mon_m15' } },
];

export const HIGH2_EVENTS = [
  { id: 'ev_m13', when: { hunted: 'mon_m13' }, title: '風の道', lines: [['シオン', 'あの大鳥が飛ぶ道、塔と塔をつなぐ線とぴったり重なってた。'], ['シオン', '風も、光の流れに沿って吹いているのかもしれない。']] },
  { id: 'ev_m14', when: { hunted: 'mon_m14' }, title: '凍河の水', lines: [['ポッコ', '魚竜の浮き袋の水、冷たくてうまいんだ！'], ['ポッコ', '……いや、飲んでない。においをかいだだけだ。本当だぞ。']] },
  { id: 'ev_m15', when: { hunted: 'mon_m15' }, title: '巣の中の文字', lines: [['シオン', '大蜘蛛の巣に、塔の石のかけらが編みこまれてた。'], ['シオン', 'かけらの文字を並べたら、「見張り」と読めたよ。']] },
  { id: 'ev_m16', when: { hunted: 'mon_m16' }, title: '古木の年輪', lines: [['ゴルド', 'あの菌獣の根芯、年輪を数えたら……数えきれなかった。'], ['ゴルド', '塔が建つより前から、あそこに立ってたのかもしれん。']] },
];
