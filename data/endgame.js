// 【ネタバレ注意】おまけ要素（エンドコンテンツ・90）の1回目：強化個体と希少素材。
// 報告・コミットの説明では、ここの中身（どの種か・新しい行動）に触れないこと（D-29）。
// 強化個体は元の種に研究を記録する（baseId）。はじめから本気・新しい行動を1〜2つ持つ。
import { MASTER_NEW, MASTER_SUB, MASTER_VARIANTS } from './monsters_master.js';
import { MASTER2_MONSTERS } from './monsters_master2.js';
import { LOW2_MONSTERS } from './monsters_low2.js';
import { HIGH2_MONSTERS } from './monsters_high2.js';

const POOL = [...MASTER_NEW, ...MASTER_SUB, ...MASTER_VARIANTS, ...MASTER2_MONSTERS];
const R = (id, name) => ({ id, name, rarity: 5, rank: 'master', rare: true });
export const EX_MATERIALS = [
  R('mat_ex_fist', '金剛の拳骨'), R('mat_ex_queen', '女王の宝眼'),
  R('mat_ex_flame', '天火の涙'), R('mat_ex_thunder', '雷霆のかけら'), R('mat_ex_crystal', '晶王の心'), R('mat_ex_fang', '夜叉の牙'), R('mat_ex_dark', '常闇のかけら'),
];

// [元の個体, 強化個体の id, 呼び名, 希少素材, 希少素材を落とす部位, 元の素材2つ, 新しい行動（power は元の最大の倍率）]
const EX = [
  ['mon_m02_ms', 'mon_m02_ex', '天を焦がす火竜（強化個体）', 'mat_ex_flame', 'wings', ['mat_m02m_scale', 'mat_m02m_sac'], [
    { id: 'act_m02x_sun', name: '焔の大輪', w: 2, k: 1.15, weight: 3, wide: true, element: 'fire', reach: ['near', 'mid', 'far'], air: true, windup: 1, interrupt: 0.06, chargeText: '上空で、炎の輪が大きく広がっていく……', tell: '上空で翼を大きく広げ、炎を集めている ─ 焔の大輪をためている（強く打てば止められる）', fatigue: 20 },
    { id: 'act_m02x_ash', name: '灰の吐息', w: 2, k: 0.6, weight: 1, wide: true, ail: 'paralysis', reach: ['near', 'mid'], tell: '口から黒い灰がこぼれている ─ 灰の吐息の予兆（しびれ）' },
  ]],
  ['mon_m06_ms', 'mon_m06_ex', '雷鳴の王（強化個体）', 'mat_ex_thunder', 'antlers', ['mat_m06m_fur', 'mat_m06m_heart'], [
    { id: 'act_m06x_twin', name: '双雷角', w: 3, k: 0.8, weight: 3, unguardable: true, element: 'thunder', reach: ['near', 'mid'], moveTo: 'near', tell: '角の両側に雷が走った ─ 双雷角の予兆（受けられない）' },
    { id: 'act_m06x_cage', name: '雷の檻', w: 2, k: 0.55, weight: 1, wide: true, ail: 'paralysis', reach: ['near', 'mid', 'far'], tell: '辺りの地面に、細い雷が網のように走った ─ 雷の檻の予兆（しびれ）' },
  ]],
  ['mon_m08', 'mon_m08_ex', '地底の晶王（強化個体）', 'mat_ex_crystal', 'claws', ['mat_m08_shell', 'mat_m08_pearl'], [
    { id: 'act_m08x_bed', name: '結晶の棘床', w: 2, k: 0.75, weight: 2, wide: true, element: 'ice', harden: 2, reach: ['near', 'mid'], tell: '甲羅の結晶が地面へ根を伸ばしはじめた ─ 棘床の予兆（そのあと固くなる）' },
    { id: 'act_m08x_guillotine', name: '大鋏の断ち', w: 2, k: 1.2, weight: 3, unguardable: true, reach: ['near'], tell: '大鋏を大きく開き、こちらの胴の高さに合わせた ─ 断ちの予兆（受けられない）', fatigue: 15 },
  ]],
  ['mon_m04s', 'mon_m04s_ex', '夜叉の黒疾風（強化個体）', 'mat_ex_fang', 'claws', ['mat_m04s_claw', 'mat_m04s_venom'], [
    { id: 'act_m04sx_stitch', name: '影縫い', w: 2, k: 0.8, weight: 2, ail: 'poison', reach: ['near', 'mid', 'far'], moveTo: 'near', tell: '姿が消え、足元に黒い影だけが残った ─ 影縫いの予兆' },
    { id: 'act_m04sx_dance', name: '黒の乱舞', w: 2, k: 1.15, weight: 3, wide: true, reach: ['near', 'mid'], rageOnly: true, tell: '黒い羽が舞い上がり、輪郭がいくつにも分かれた ─ 乱舞の予兆', fatigue: 18 },
  ]],
  ['mon_m19', 'mon_m19_ex', '常闇の影獣（強化個体）', 'mat_ex_dark', 'mantle', ['mat_m19_d', 'mat_m19_e'], [
    { id: 'act_m19x_night', name: '常闇', w: 2, k: 0.55, weight: 1, wide: true, ail: 'paralysis', reach: ['near', 'mid', 'far'], under: true, tell: '辺りの光が、ひとつずつ消えていく ─ 常闇の予兆（体がすくむ）' },
    { id: 'act_m19x_double', name: '二重の影', w: 2, k: 0.9, weight: 2, reach: ['near', 'mid'], stance: true, stanceIdle: '影が二つに分かれ、片方だけがこちらを見ている。', tell: '影が二つに分かれ、どちらもこちらの肩を見ている ─ 大振りを見切る構え（深い）' },
  ]],
];
const HP = 1.4, HPOW = 1.2;
const TUNE = { mon_m04s_ex: 1.1, mon_m19_ex: 1.1 }; // 種ごとの調整（試し打ち：SET=ex node tools/sim_master.js）
export const EX2_MONSTERS = EX.map(([from, id, alias, rare, rarePart, [m1, m2], acts]) => {
  const src = POOL.find(m => m.id === from);
  const top = Math.max(...src.acts.map(a => a.power || 0)), POW = HPOW * (TUNE[id] ?? 1);
  const parts = Object.fromEntries(Object.keys(src.parts).map((k, i) => [k, k === rarePart ? rare : [m1, m2][i % 2]]));
  return {
    ...src, id, baseId: src.baseId ?? src.id, rank: 'master', ex: true, alias, hp: Math.round(src.hp * HP), startPhase: 2,
    adaptSpeed: Math.round(((src.adaptSpeed ?? 1) + 0.2) * 10) / 10,
    acts: [...src.acts.map(a => (a.power ? { ...a, power: Math.round(a.power * POW) } : a)), ...acts.map(({ k, ...a }) => ({ ...a, power: Math.round(top * POW * k) }))],
    rewards: { hunt: [{ id: rare, w: 25 }, { id: m1, w: 45 }, { id: m2, w: 30 }], capture: [{ id: rare, w: 100 }], parts },
    flee: null,
  };
});

// 依頼：マスター級の最後の依頼のあと3つ開く。強化個体を1つ狩るとさらに2つ、3つ狩ると最後の1つ（順番は選べる）
const at = (monsterId, spots, lairs) => [{ monsterId, at: { dawn: spots[0], day: spots[0], dusk: spots[1], night: spots[1] }, lairs }];
const X = (id, monsterId, fieldId, name, desc, start, money, monsters, more = {}) => ({
  id, name, kind: 'hunt', fieldId, start, rank: 'master', danger: 8, desc, monsters,
  goal: { type: 'hunt', monsterId, text: `${name.replace(/^【.*?】/, '')}を討伐する（捕獲でもよい）` }, extra: [], reward: { money, n: [5, 6] },
  unlock: { cleared: 'q_master_final' }, ...more,
});
export const EX_QUESTS = [
  X('q_ex_m02', 'mon_m02_ex', 'fld_canyon', '【強化個体】天を焦がす火竜', '峡谷の空が昼も夜も赤い。火竜がすべての熱を取り込んだらしい。', 'day', 14000, at('mon_m02_ex', ['f2_cliff', 'f2_ledge'], ['f2_cliff', 'f2_ledge', 'f2_pillars'])),
  X('q_ex_m06', 'mon_m06_ex', 'fld_ridge', '【強化個体】雷鳴の王', '尾根の頂に、雷をまとう王が立っている。', 'dusk', 14000, at('mon_m06_ex', ['f4_summit', 'f4_crag'], ['f4_summit', 'f4_crag'])),
  X('q_ex_m08', 'mon_m08_ex', 'fld_hollow', '【強化個体】地底の晶王', '結晶の森がすべて食べ尽くされた。残ったのは、ひときわ大きな蟹だけだ。', 'day', 15000, at('mon_m08_ex', ['f6_forest', 'f6_pool'], ['f6_forest', 'f6_pool']), { unlock: { cleared: 'q_master_final', exCleared: 1 } }),
  X('q_ex_m04s', 'mon_m04s_ex', 'fld_hollow', '【強化個体】夜叉の黒疾風', '夜明けまでに、闇を走る黒い影を討て。', 'dusk', 15000,
    [{ monsterId: 'mon_m04s_ex', at: { dawn: null, day: null, dusk: 'f6_shadow', night: 'f6_bones' }, lairs: ['f6_shadow', 'f6_bones'] }], { kind: 'special', limit: 'dawn', unlock: { cleared: 'q_master_final', exCleared: 1 } }),
  X('q_ex_m19', 'mon_m19_ex', 'fld_hollow', '【強化個体】常闇の影獣', '大空洞の明かりが、夜ごとに一つずつ消えている。', 'night', 16000,
    [{ monsterId: 'mon_m19_ex', at: { dawn: 'f6_bones', day: 'f6_bones', dusk: 'f6_shadow', night: 'f6_shadow' }, lairs: ['f6_shadow', 'f6_bones'] }], { unlock: { cleared: 'q_master_final', exCleared: 3 } }),
];

export const EX_EVENTS = [
  { id: 'ev_ex_1', when: { cleared: 'q_ex_m07' }, title: '強い個体', lines: [['ゴルド', '星の涙か……こんなもん、打ったことがねえ。'], ['ゴルド', '同じくらい強いやつが、ほかにもいるらしい。素材が揃ったら、とんでもねえものが作れるぞ。']] },
];

// ─── 2回目：特殊個体（姿と戦い方が少し違う別の個体。研究は元の種に記録）────────────
// 元は下位・上位の種。強さはマスター級の大型（晶殻）の一番強い攻撃に合わせ、少し上にする
const REF = Math.max(...MASTER_NEW.find(m => m.id === 'mon_m08').acts.map(a => a.power || 0));
const SP = [
  ['mon_m10', 'mon_m10_sp', '金剛の猿獣（特殊個体）', 6600, 'mat_ex_fist', 'arms', ['mat_m10_a', 'mat_m10_d'], 'act_m10_drum', [
    { id: 'act_m10x_iron', name: '金剛の構え', w: 2, k: 0.8, weight: 3, harden: 1, reach: ['near'], tell: '全身の毛が逆立ち、肌が鉄のように黒ずんだ ─ 構えの予兆（そのあと固くなる）' },
    { id: 'act_m10x_quake', name: '大地割り', w: 2, k: 1.25, weight: 3, wide: true, reach: ['near', 'mid', 'far'], windup: 1, interrupt: 0.06, chargeText: '両の拳を高く組み、全身の力を溜めている……', tell: '両の拳を天へ突き上げた ─ 大地割りをためている（強く打てば止められる）', fatigue: 20 },
  ], 1.45],
  ['mon_m15', 'mon_m15_sp', '廃都の女王蜘蛛（特殊個体）', 6600, 'mat_ex_queen', 'head', ['mat_m15_a', 'mat_m15_e'], 'act_m15_idle', [
    { id: 'act_m15x_brood', name: '子蜘蛛の群れ', w: 2, k: 0.5, weight: 1, wide: true, ail: 'poison', reach: ['near', 'mid', 'far'], tell: '腹の下から、小さな影が一斉にあふれ出た ─ 群れの予兆（毒）' },
    { id: 'act_m15x_net', name: '天蓋の網', w: 2, k: 0.9, weight: 2, wide: true, ail: 'paralysis', reach: ['near', 'mid', 'far'], air: true, tell: '天井いっぱいに糸を張りめぐらせた ─ 網の予兆（絡まると動けない）' },
  ], 1.5],
];
const SRC = [...LOW2_MONSTERS, ...HIGH2_MONSTERS];
export const SPECIAL_MONSTERS = SP.map(([from, id, alias, hp, rare, rarePart, [m1, m2], dropAct, acts, top]) => {
  const src = SRC.find(m => m.id === from);
  const f = REF * top / Math.max(...src.acts.map(a => a.power || 0));
  const parts = Object.fromEntries(Object.keys(src.parts).map((k, i) => [k, k === rarePart ? rare : [m1, m2][i % 2]]));
  return {
    ...src, id, baseId: src.id, rank: 'master', special: true, alias, hp,
    adaptSpeed: Math.round(((src.adaptSpeed ?? 1) + 0.2) * 10) / 10,
    acts: [...src.acts.filter(a => a.id !== dropAct || a.idle).map(a => (a.power ? { ...a, power: Math.round(a.power * f) } : a)),
      ...acts.map(({ k, ...a }) => ({ ...a, power: Math.round(REF * k) }))],
    rewards: { hunt: [{ id: rare, w: 20 }, { id: m1, w: 50 }, { id: m2, w: 30 }], capture: [{ id: rare, w: 100 }], parts },
  };
});
EX_QUESTS.push(
  X('q_sp_m10', 'mon_m10_sp', 'fld_forest', '【特殊個体】金剛の猿獣', '古塔の森の木立が、根こそぎ倒されている。鉄のような肌の猿を見たという。', 'day', 13000,
    at('mon_m10_sp', ['f1_thicket', 'f1_path'], ['f1_thicket', 'f1_path', 'f1_ridge'])),
  X('q_sp_m15', 'mon_m15_sp', 'fld_ruins', '【特殊個体】廃都の女王蜘蛛', '眠れる都の塔が、一夜で糸に包まれた。', 'dusk', 14000,
    at('mon_m15_sp', ['f5_tower', 'f5_rooftop'], ['f5_tower', 'f5_rooftop']), { unlock: { cleared: 'q_master_final', exCleared: 2 } }),
);

// ─── 2回目：特別な装備（希少素材で作る）────────────────────────────
// 武器：6つの希少素材 × 6武器 ＝ 最後の段（7段目）。属性・状態異常がそれぞれ違うので、得意・苦手な相手がある
const KINDS = { wt_greatsword: '大剣', wt_twinblades: '双刃', wt_hammer: '重槌', wt_lance: '竜槍', wt_bow: '弓', wt_chainblade: '鎖刃' };
const TOP = [ // [希少素材, 親（系統_段）, 名前, 効果, 親の系統の素材]
  ['mat_ex_star', 'm07_2', '星涙の', { element: 'dragon', v: 74 }, 'mat_m07_core'],
  ['mat_ex_flame', 'm02_5', '天焦の', { element: 'fire', v: 74 }, 'mat_m02m_sac'],
  ['mat_ex_thunder', 'm06_5', '雷霆の', { element: 'thunder', v: 74 }, 'mat_m06m_heart'],
  ['mat_ex_crystal', 'm08_2', '晶王の', { element: 'ice', v: 74 }, 'mat_m08_pearl'],
  ['mat_ex_fang', 'm17_2', '夜叉毒の', { ail: 'poison', v: 62 }, 'mat_m17_d'],
  ['mat_ex_dark', 'm19_2', '常闇の', { ail: 'paralysis', v: 62 }, 'mat_m19_d'],
];
export const EX_WEAPON_TREE = Object.entries(KINDS).flatMap(([k, n]) => {
  const s = k.slice(3);
  return TOP.map(([rare, parent, name, x, m]) => ({
    id: `wpn_${s}_x_${rare.slice(7)}`, kindId: k, name: `${name}${n}`, parentId: `wpn_${s}_${parent}`, tier: 7, rank: 'master', special: true,
    powerMult: 1.84, slots: ['l', 'l'], ...(x.element ? { element: { type: x.element, value: x.v } } : { ail: { type: x.ail, value: x.v } }),
    craft: { [rare]: 3, [m]: 4, mat_starroot: 3 }, upgrade: { [rare]: 1, [m]: 2, mat_starroot: 1 },
  }));
});

// 防具：攻めの「星涙」と、守りの「金剛」。どちらも特殊個体・強化個体の希少素材で作る
const XSETS = {
  ex_star: { name: '星涙', mats: ['mat_ex_star', 'mat_ex_queen', 'mat_ex_flame'], resist: { fire: -5, water: -5, thunder: -5, ice: -5, dragon: 10 },
    skills: ['skl_attack', 'skl_weakness', 'skl_chance', 'skl_element'], unique: { name: '星の涙の加護', grants: { skl_weakness: 3 } },
    bonus: [{ pieces: 2, name: '星涙の閃き', grants: { skl_chance: 3 } }, { pieces: 4, name: '星涙の極み', grants: { skl_attack: 4 } }] },
  ex_iron: { name: '金剛', mats: ['mat_ex_fist', 'mat_ex_crystal', 'mat_ex_thunder'], resist: { fire: 15, water: 15, thunder: 15, ice: 15, dragon: 15 },
    skills: ['skl_defense', 'skl_guard', 'skl_vitality', 'skl_ailresist'], unique: { name: '金剛の肌', grants: { skl_guard: 3 } },
    bonus: [{ pieces: 2, name: '金剛の粘り', grants: { skl_vitality: 3 } }, { pieces: 4, name: '金剛の不動', grants: { skl_defense: 4 } }] },
};
const XPARTS = [
  { part: 'head', label: '兜', def: 126, slots: ['l', 's'], n: [1, 1, 0] }, { part: 'chest', label: '胴', def: 140, slots: ['l', 'm'], n: [2, 1, 1], unique: true },
  { part: 'arms', label: '籠手', def: 128, slots: ['m', 'm'], n: [1, 0, 1] }, { part: 'waist', label: '腰', def: 124, slots: ['l', 's'], n: [1, 1, 0] },
  { part: 'legs', label: '脚', def: 132, slots: ['l', 'm'], n: [1, 1, 1] },
];
export const EX_ARMOR_SETS = Object.entries(XSETS).map(([k, s]) => ({ id: `set_${k}`, name: s.name, bonuses: s.bonus, rank: 'master', special: true }));
export const EX_ARMORS = Object.entries(XSETS).flatMap(([k, s]) => XPARTS.map((p, i) => {
  const craft = { mat_starroot: 2, mat_deepcrystal: 3 }; p.n.forEach((n, j) => { if (n) craft[s.mats[j]] = n; });
  const sk = s.skills, skills = { [sk[i % 4]]: 3, [sk[(i + 1) % 4]]: 2 };
  return { id: `arm_${k}_${p.part}`, setId: `set_${k}`, part: p.part, name: `${s.name}の${p.label}`, def: p.def, resist: s.resist, skills, slots: p.slots,
    craft, upgrade: { [s.mats[0]]: 1, mat_starroot: 1 }, maxLevel: 10, defPerLevel: 7, rank: 'master', special: true, art: `arm.${k}.${p.part}`, ...(p.unique ? { unique: s.unique } : {}) };
}));

// ─── 3回目：高難度の依頼と最後の依頼 ─────────────────────────────
// 条件：2体同時（huntAll）・時間の制限（limit）・持ち込めない道具（ban）・連戦（3体）。強化個体を狩るほど開く（順番は選べる）
const one = (monsterId, spot, lairs = [spot]) => ({ monsterId, at: { dawn: spot, day: spot, dusk: spot, night: spot }, lairs });
const NO_HEAL = ['itm_potion', 'itm_mega_potion'];
const HD = (id, name, fieldId, start, danger, desc, monsters, goalText, money, unlock, more = {}) => ({
  id, name, kind: 'hunt', fieldId, start, rank: 'master', danger, desc, monsters,
  goal: monsters.length > 1 ? { type: 'huntAll', monsterIds: monsters.map(m => m.monsterId), text: goalText } : { type: 'hunt', monsterId: monsters[0].monsterId, text: goalText },
  extra: [], reward: { money, n: [5, 6] }, unlock: { cleared: 'q_master_final', ...unlock }, hard: true, ...more,
});
export const HARD_QUESTS = [
  HD('q_hd_pair', '【高難度】空と熱の主', 'fld_hollow', 'day', 8, '大空洞の空を泳ぐ巨鯨と、熱の噴き出し口の巨人獣が、同じ日に暴れている。',
    [one('mon_m18', 'f6_stair', ['f6_stair', 'f6_pool']), one('mon_m20', 'f6_vent', ['f6_vent', 'f6_bones'])], '二頭とも狩る（討伐か捕獲）', 18000, { exCleared: 1 }, { boost: 1.25 }),
  HD('q_hd_noheal', '【高難度】影の中の手当てなし', 'fld_hollow', 'dusk', 8, '回復薬を持ち込まずに、影喰らいの獣を狩れ。身のこなしだけが頼りだ。',
    [{ monsterId: 'mon_m19', at: { dawn: 'f6_bones', day: 'f6_bones', dusk: 'f6_shadow', night: 'f6_shadow' }, lairs: ['f6_shadow', 'f6_bones'] }], '回復薬なしで影獣を討伐する（捕獲でもよい）', 18000, { exCleared: 1 }, { ban: NO_HEAL, boost: 1.35 }),
  HD('q_hd_time', '【高難度】昼までに三つ首を', 'fld_starroot', 'dawn', 8, '三つ首の毒竜が庭の心臓へ向かっている。昼になる前に止めよ。',
    [one('mon_m17', 'f7_spring', ['f7_spring', 'f7_roots'])], '昼までに三つ首の毒竜を討伐する（捕獲でもよい）', 20000, { exCleared: 2 }, { kind: 'special', limit: 'day', boost: 1.25 }),
  HD('q_hd_chain', '【高難度】都の三連戦', 'fld_ruins', 'day', 9, '眠れる都に、マスター級の大型が三頭そろった。一頭ずつ、すべて狩れ。',
    [one('mon_m04_ms', 'f5_avenue', ['f5_avenue', 'f5_market']), one('mon_m05_ms', 'f5_hall'), one('mon_m04s', 'f5_rooftop', ['f5_rooftop', 'f5_tower'])], '三頭とも狩る（討伐か捕獲）', 24000, { exCleared: 3 }, { boost: 1.2 }),
  HD('q_hd_special', '【高難度】森の異変', 'fld_forest', 'dusk', 9, '古塔の森に、金剛の猿獣と女王蜘蛛が同時に現れた。上回復薬は届かない。',
    [one('mon_m10_sp', 'f1_thicket', ['f1_thicket', 'f1_path']), one('mon_m15_sp', 'f1_stairs', ['f1_stairs', 'f1_roots'])], '二頭とも狩る（討伐か捕獲）', 26000, { exCleared: 4 }, { ban: ['itm_mega_potion'], boost: 1.1 }),
  HD('q_hd_kings', '【高難度】王たちの夜', 'fld_starroot', 'night', 10, '目覚めし守り竜と地底の晶王が、庭の心臓で争っている。夜明けまでに二頭とも狩れ。',
    [one('mon_m07_ex', 'f7_core'), one('mon_m08_ex', 'f7_hall', ['f7_hall', 'f7_ledge'])], '夜明けまでに二頭とも狩る（討伐か捕獲）', 32000, { exCleared: 5 }, { kind: 'special', limit: 'dawn' }),
];
// すべてを終えた人向けの、最後の依頼
export const EX_FINAL = HD('q_ex_final', '【最後の依頼】星の果て', 'fld_starroot', 'night', 10, '星の根の光が、すべて一点に集まりはじめた。強い個体たちが、引き寄せられるように庭へ向かっている。',
  [one('mon_m02_ex', 'f7_spring', ['f7_spring', 'f7_roots']), one('mon_m19_ex', 'f7_hall', ['f7_hall', 'f7_mural']), one('mon_m06_ex', 'f7_core', ['f7_core', 'f7_ledge'])], '三頭とも狩る（討伐か捕獲）', 50000,
  { exCleared: 6, hardCleared: 6 }, { final: 'ex', reward: { money: 50000, n: [6, 6], mats: [{ id: 'mat_ex_star', w: 40 }, { id: 'mat_ex_flame', w: 20 }, { id: 'mat_ex_thunder', w: 20 }, { id: 'mat_ex_dark', w: 20 }] } });
EX_QUESTS.push(...HARD_QUESTS, EX_FINAL);
EX_EVENTS.push(
  { id: 'ev_hd_1', when: { cleared: 'q_hd_pair' }, title: '二つの足あと', lines: [['シオン', '大空洞の主たちが、同じ日に暴れた。偶然じゃないと思う。'], ['シオン', '星の根の光が、少しずつ乱れてきてる。']] },
  { id: 'ev_ex_final', when: { cleared: 'q_ex_final' }, title: '星の果て', lines: [['シオン', '光が、静かになった。庭の心臓も、ゆっくり脈打ってる。'], ['ゴルド', '……お前さんの装備、もう俺の炉じゃこれ以上は打てねえよ。'], ['ポッコ', 'じゃあ、つぎは何を狩るの？ ……え、もう全部？ すごいや！'], ['シオン', 'ありがとう。地図の端は、あなたが描いてくれた。']] },
);
