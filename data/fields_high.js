// 【ネタバレ注意】上位（第11段階・50）：奥地のフィールド2つと上位のクエスト。
// rank: 'high' のクエストは、下位の最後の依頼のあとに受けられる。どれからでも挑める（一本道にしない）。

import { HIGH2_PLACES, HIGH2_QUESTS } from './gear_high2.js';

export const HIGH_FIELDS = [
  {
    id: 'fld_ridge', name: '凍てつく尾根', art: 'bg.field.04', actions: 11, rank: 'high',
    points: [
      { id: 'f4_camp', name: '野営地', x: 12, y: 86, camp: true, text: '雪よけの岩陰に張った天幕。火を絶やすと凍える。' },
      { id: 'f4_slope', name: '雪の斜面', x: 32, y: 66, text: '踏むたびに雪がきしむ。雪の下に草が残っている。',
        gather: [{ id: 'mat_frostherb', w: 60, n: [1, 2] }, { id: 'mat_herb', w: 40, n: [1, 2] }] },
      { id: 'f4_summit', name: '雷の頂', x: 30, y: 18, text: '尾根でいちばん高い所。岩が焼け焦げている。',
        survey: { trace: true, text: '岩に、枝分かれした焦げ跡が残っている。何かが雷を呼んだらしい。', mats: [{ id: 'mat_stormstone', w: 100, n: [1, 1] }] } },
      { id: 'f4_cave', name: '氷の洞', x: 78, y: 30, text: '青白い氷に覆われた洞。奥から冷たい風が吹く。',
        survey: { trace: true, text: '洞の天井に、大きな爪で引っかいた跡。翼のあるものが出入りしている。', mats: [{ id: 'mat_icecrystal', w: 100, n: [1, 1] }] } },
      { id: 'f4_crag', name: '岩陰の窪み', x: 58, y: 58, text: '風の当たらない窪み。踏み固められた雪の上に足跡が多い。',
        survey: { trace: true, text: '割れた蹄の跡が、群れのように並んでいる。', mats: [{ id: 'mat_bone', w: 100, n: [1, 2] }] } },
      { id: 'f4_vein', name: '凍った鉱脈', x: 54, y: 84, text: '氷の下に鉱石が透けて見える。',
        gather: [{ id: 'mat_icecrystal', w: 40, n: [1, 1] }, { id: 'mat_ore', w: 60, n: [2, 3] }] },
      { id: 'f4_pass', name: '風の峠', x: 86, y: 70, text: '強い風が吹き抜ける峠。夜は星が近い。',
        gather: [{ id: 'mat_feather', w: 60, n: [1, 2] }, { id: 'mat_starmoss', w: 40, n: [1, 1], times: ['night'] }] },
      { id: 'f4_ledge', name: '月見の岩棚', x: 60, y: 14, text: '空に突き出た岩棚。夜になると何かが旋回している。' },
    ],
    monsters: [
      { monsterId: 'mon_m06', at: { dawn: 'f4_slope', day: 'f4_summit', dusk: 'f4_crag', night: 'f4_crag' }, lairs: ['f4_summit', 'f4_crag', 'f4_slope'] },
    ],
  },
  {
    id: 'fld_ruins', name: '眠れる都の跡', art: 'bg.field.05', actions: 11, rank: 'high',
    points: [
      { id: 'f5_camp', name: '野営地', x: 10, y: 84, camp: true, text: '崩れた門の内側に張った天幕。石畳に古い文字が刻まれている。' },
      { id: 'f5_avenue', name: '大通り', x: 36, y: 70, text: '幅の広い石畳の通り。両側に塔の柱が並ぶ。',
        survey: { trace: true, text: '石畳に、細く鋭い爪の跡が一直線に続いている。とても速いものが走ったらしい。', mats: [{ id: 'mat_ancientstone', w: 100, n: [1, 1] }] } },
      { id: 'f5_garden', name: '枯れた庭園', x: 20, y: 40, text: '水の枯れた庭。古い木の根が石を割っている。',
        gather: [{ id: 'mat_herb', w: 50, n: [1, 2] }, { id: 'mat_ancientstone', w: 50, n: [1, 1] }] },
      { id: 'f5_tower', name: '崩れた塔', x: 52, y: 22, text: '途中で折れた塔。翠の筋が今も光っている。',
        gather: [{ id: 'mat_crystal', w: 60, n: [1, 2] }, { id: 'mat_veincrystal', w: 40, n: [1, 1] }] },
      { id: 'f5_hall', name: '大広間', x: 74, y: 48, text: '天井の抜けた大広間。石畳がところどころ持ち上がっている。',
        survey: { trace: true, text: '石畳が大きくはがされ、地下へ続く穴が開いている。とても重いものが通った跡だ。', mats: [{ id: 'mat_ancientstone', w: 60, n: [1, 2] }, { id: 'mat_veincrystal', w: 40, n: [1, 1] }] } },
      { id: 'f5_market', name: '市場の跡', x: 40, y: 50, text: '屋台の石台が並ぶ広場。骨が散らばっている。',
        survey: { trace: true, text: '骨に残った傷は、刃物のように鋭い。', mats: [{ id: 'mat_bone', w: 100, n: [1, 2] }] } },
      { id: 'f5_well', name: '古井戸', x: 86, y: 78, text: '深い井戸。夜になると底が淡く光る。',
        gather: [{ id: 'mat_ore', w: 60, n: [1, 3] }, { id: 'mat_starmoss', w: 40, n: [1, 1], times: ['night', 'dusk'] }] },
      { id: 'f5_rooftop', name: '屋根の上', x: 84, y: 16, text: '崩れかけた屋根の上。都が見わたせる。' },
    ],
    monsters: [
      { monsterId: 'mon_m04', at: { dawn: 'f5_avenue', day: 'f5_market', dusk: 'f5_avenue', night: 'f5_rooftop' }, lairs: ['f5_avenue', 'f5_market', 'f5_rooftop'] },
      { monsterId: 'mon_m05', at: { dawn: null, day: null, dusk: 'f5_hall', night: 'f5_hall' }, lairs: ['f5_hall'] },
    ],
  },
];

const DANGER = { mon_m04: 4, mon_m05: 5, mon_m06: 4, mon_m02s: 5, mon_m01_hr: 4, mon_m02_hr: 4, mon_m03_hr: 5 };
const H = (id, monsterId, fieldId, name, desc, start, money, extra = [], more = {}) => ({
  id, name, kind: 'hunt', fieldId, start, desc, rank: 'high', danger: DANGER[monsterId],
  goal: { type: 'hunt', monsterId, text: `${name.replace(/の討伐$/, '')}を討伐する（捕獲でもよい）` },
  extra, reward: { money, n: [4, 6] }, ...more,
});
const brk = (m, part, text, mat) => ({ id: `x_${m.slice(4)}_${part}`, type: 'break', monsterId: m, part, text, money: 300, mats: [{ id: mat, w: 100, n: [1, 1] }] });
const cap = (m, mat) => ({ id: `x_${m.slice(4)}_cap`, type: 'capture', monsterId: m, text: '捕獲する', money: 400, mats: [{ id: mat, w: 100, n: [1, 1] }] });
/** 下位のフィールドに上位の個体を置く（クエストごとの配置） */
const at = (monsterId, spots, lairs) => [{ monsterId, at: { dawn: spots[0], day: spots[0], dusk: spots[1], night: spots[1] }, lairs }];
const survey = (id, fieldId, name, desc, start, money, mats) => ({ id, name, kind: 'survey', fieldId, start, desc, rank: 'high', goal: { type: 'survey', count: 3, text: '痕跡を3つ調べる' }, extra: [], reward: { money, n: [4, 5], mats } });
const free = (id, fieldId, name, start) => ({ id, name, kind: 'free', fieldId, start, rank: 'high', desc: '目標なし。採取と観察を好きなだけ。いつ帰っても失敗にならない。', goal: { type: 'free', text: '目標なし（帰ると終わり）' }, extra: [], reward: { money: 0, n: [0, 0] } });

export const HIGH_QUESTS = [
  H('q_h_m04', 'mon_m04', 'fld_ruins', 'ザルガの討伐', '眠れる都の跡で、調査隊を追い回す速い獣を討伐してほしい。', 'dawn', 1200, [brk('mon_m04', 'claws', '爪刃を壊す', 'mat_m04_claw'), cap('mon_m04', 'mat_m04_gem')]),
  H('q_h_m05', 'mon_m05', 'fld_ruins', 'オルドゥムの討伐', '夜の大広間に現れる巨大な獣を討伐してほしい。', 'dusk', 1500, [brk('mon_m05', 'core', '核を壊す', 'mat_m05_core'), cap('mon_m05', 'mat_m05_marrow')]),
  H('q_h_m06', 'mon_m06', 'fld_ridge', 'ライゼンの討伐', '凍てつく尾根で雷を呼ぶ大鹿を討伐してほしい。', 'day', 1300, [brk('mon_m06', 'antlers', '角を壊す', 'mat_m06_antler'), cap('mon_m06', 'mat_m06_heart')]),
  H('q_h_m02s', 'mon_m02s', 'fld_ridge', '氷翼のヴェルカの討伐', '夜の尾根に現れる、氷をまとった縞翼竜を討伐してほしい。', 'dusk', 1500, [brk('mon_m02s', 'wings', '翼を壊す', 'mat_m02s_membrane')],
    { monsters: [{ monsterId: 'mon_m02s', at: { dawn: null, day: null, dusk: 'f4_cave', night: 'f4_ledge' }, lairs: ['f4_ledge', 'f4_cave', 'f4_pass'] }, { monsterId: 'mon_m06', at: { dawn: 'f4_slope', day: 'f4_summit', dusk: 'f4_crag', night: 'f4_crag' }, lairs: ['f4_summit', 'f4_crag'] }],
      goal: { type: 'hunt', monsterId: 'mon_m02s', text: '氷翼のヴェルカを討伐する（捕獲でもよい）' } }),
  H('q_h_m01', 'mon_m01_hr', 'fld_forest', '上位のバルドンの討伐', '古塔の森に、ひときわ大きなバルドンが現れた。', 'dawn', 1000, [brk('mon_m01_hr', 'back', '背甲を壊す', 'mat_m01h_plate')],
    { monsters: at('mon_m01_hr', ['f1_stairs', 'f1_roots'], ['f1_stairs', 'f1_roots', 'f1_quarry']) }),
  H('q_h_m02', 'mon_m02_hr', 'fld_canyon', '上位のヴェルカの討伐', '赤風の峡谷に、火の雨を降らせるヴェルカが現れた。', 'dawn', 1100, [brk('mon_m02_hr', 'wings', '翼を壊す', 'mat_m02h_membrane')],
    { monsters: at('mon_m02_hr', ['f2_cliff', 'f2_ledge'], ['f2_cliff', 'f2_ledge', 'f2_pillars']) }),
  H('q_h_m03', 'mon_m03_hr', 'fld_marsh', '上位のグルボアの討伐', '沈み橋の湿原の主が、さらに賢くなって戻ってきた。', 'dusk', 1200, [brk('mon_m03_hr', 'back', '背の疣を壊す', 'mat_m03h_wart')],
    { monsters: at('mon_m03_hr', ['f3_deep', 'f3_bridge'], ['f3_deep', 'f3_bridge', 'f3_reeds']) }),
  survey('q_h_ridge_survey', 'fld_ridge', '凍てつく尾根の調査', '尾根に残る痕跡を3つ調べてほしい。', 'day', 800, [{ id: 'mat_icecrystal', w: 40 }, { id: 'mat_frostherb', w: 35 }, { id: 'mat_ore', w: 25 }]),
  survey('q_h_ruins_survey', 'fld_ruins', '眠れる都の跡の調査', '都の跡に残る痕跡を3つ調べてほしい。', 'dawn', 800, [{ id: 'mat_ancientstone', w: 45 }, { id: 'mat_veincrystal', w: 30 }, { id: 'mat_ore', w: 25 }]),
  free('q_h_ridge_free', 'fld_ridge', '凍てつく尾根の探索', 'night'),
  free('q_h_ruins_free', 'fld_ruins', '眠れる都の跡の探索', 'dusk'),
  { ...H('q_h_m04_special', 'mon_m04', 'fld_ruins', '日暮れまでにザルガを', '日が暮れる前に、都の大通りのザルガを討伐せよ。', 'dawn', 1800, []), kind: 'special', limit: 'dusk', danger: 5,
    goal: { type: 'hunt', monsterId: 'mon_m04', text: '夕方までにザルガを討伐する（捕獲でもよい）' }, unlock: { hunted: 'mon_m04' } },
  { ...H('q_h_m06_capture', 'mon_m06', 'fld_ridge', 'ライゼンの捕獲', '研究のため、ライゼンを生きたまま捕らえてほしい。', 'day', 1600, []),
    goal: { type: 'capture', monsterId: 'mon_m06', text: 'ライゼンを捕獲する' }, unlock: { hunted: 'mon_m06' } },
  // 上位の最後の依頼：上位の新しい3種と特殊個体を狩ると出る。達成でマスター級が開く（中身は準備中）
  { id: 'q_high_final', name: '目覚める都', kind: 'hunt', fieldId: 'fld_ruins', start: 'night', rank: 'high', danger: 5, final: 'high',
    desc: '都の地下が揺れている。大広間の主と、大通りの狩人が同時に姿を見せた。二頭とも狩ってほしい。',
    monsters: [{ monsterId: 'mon_m05', at: { dawn: 'f5_hall', day: 'f5_hall', dusk: 'f5_hall', night: 'f5_hall' }, lairs: ['f5_hall'] },
      { monsterId: 'mon_m04', at: { dawn: 'f5_avenue', day: 'f5_avenue', dusk: 'f5_avenue', night: 'f5_avenue' }, lairs: ['f5_avenue', 'f5_market'] }],
    goal: { type: 'huntAll', monsterIds: ['mon_m05', 'mon_m04'], text: '二頭とも狩る（討伐か捕獲）' },
    extra: [], reward: { money: 4000, n: [4, 5] }, unlock: { highSpecies: 4 } },
];

// 第13段階（80 の2回目）：上位に足した4種
for (const f of HIGH_FIELDS) { const p = HIGH2_PLACES[f.id]; if (p) f.monsters.push(...[].concat(p)); }
HIGH_QUESTS.splice(HIGH_QUESTS.findIndex(q => q.final === 'high'), 0, ...HIGH2_QUESTS);
