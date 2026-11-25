// 【ネタバレ注意】マスター級（第12段階・70）：扉の先のフィールド2つとマスター級のクエスト。
import { MASTER2_PLACES, MASTER2_QUESTS } from './gear_master2.js';
import { EX_QUESTS } from './endgame.js';
// rank: 'master' のクエストは、上位の最後の依頼のあとに受けられる。どれからでも挑める（一本道にしない）。

export const MASTER_FIELDS = [
  {
    id: 'fld_hollow', name: '扉の先の大空洞', art: 'bg.field.06', actions: 12, rank: 'master',
    points: [
      { id: 'f6_camp', name: '野営地', x: 12, y: 84, camp: true, text: '扉のすぐ内側。古い焚き火の跡がある。誰かが前にもここへ来たらしい。' },
      { id: 'f6_stair', name: '大階段', x: 30, y: 64, text: '地の底へ続く巨大な階段。段ごとに翠の文字が刻まれている。',
        survey: { trace: true, text: '階段の文字の一部が新しく削られている。最近、何かが通った。', mats: [{ id: 'mat_runestone', w: 100, n: [1, 1] }] } },
      { id: 'f6_forest', name: '結晶の森', x: 58, y: 70, text: '人の背より高い結晶が林のように並ぶ。砕かれた跡が多い。',
        gather: [{ id: 'mat_deepcrystal', w: 60, n: [1, 2] }, { id: 'mat_veincrystal', w: 40, n: [1, 2] }] },
      { id: 'f6_pool', name: '光る地底湖', x: 82, y: 56, text: '底から光が差す地底湖。夜は水面に星のような粒が浮かぶ。',
        gather: [{ id: 'mat_glowwater', w: 60, n: [1, 2] }, { id: 'mat_starmoss', w: 40, n: [1, 1], times: ['night', 'dusk'] }] },
      { id: 'f6_shadow', name: '暗がりの裂け目', x: 46, y: 30, text: '光の届かない裂け目。黒い羽が落ちている。',
        survey: { trace: true, text: '壁に、毒で黒く溶けた爪の跡が残っている。', mats: [{ id: 'mat_bone', w: 100, n: [1, 2] }] } },
      { id: 'f6_bones', name: '古い骨の原', x: 20, y: 30, text: '大きな獣の骨が並ぶ。墓のようにも見える。',
        survey: { trace: true, text: '骨のいくつかに、結晶が生えている。', mats: [{ id: 'mat_deepcrystal', w: 100, n: [1, 1] }] } },
      { id: 'f6_vent', name: '熱の噴き出し口', x: 76, y: 22, text: '床の割れ目から熱い風が吹き上がる。',
        gather: [{ id: 'mat_ore', w: 50, n: [2, 3] }, { id: 'mat_runestone', w: 50, n: [1, 1] }] },
      { id: 'f6_gate', name: '第二の扉', x: 90, y: 86, text: '固く閉ざされた扉。星の根の庭へ続いているらしい。' },
    ],
    monsters: [
      { monsterId: 'mon_m08', at: { dawn: 'f6_forest', day: 'f6_forest', dusk: 'f6_pool', night: 'f6_pool' }, lairs: ['f6_forest', 'f6_pool', 'f6_vent'] },
    ],
  },
  {
    id: 'fld_starroot', name: '星の根の庭', art: 'bg.field.07', actions: 12, rank: 'master',
    points: [
      { id: 'f7_camp', name: '野営地', x: 10, y: 86, camp: true, text: '庭の入口。天井から光の根が垂れ下がっている。' },
      { id: 'f7_roots', name: '光る根の道', x: 30, y: 66, text: '翠に光る太い根が、床をはうように伸びている。',
        gather: [{ id: 'mat_starroot', w: 50, n: [1, 1] }, { id: 'mat_glowwater', w: 50, n: [1, 2] }] },
      { id: 'f7_mural', name: '壁画の回廊', x: 22, y: 30, text: '壁一面の古い絵。塔と、龍と、人が描かれている。',
        survey: { trace: true, text: '壁画の龍は、塔の光を飲んでいる。その足元で、人がひざまずいている。', mats: [{ id: 'mat_runestone', w: 100, n: [1, 1] }] } },
      { id: 'f7_nest', name: '根の寝床', x: 60, y: 40, text: '根が編まれて大きな寝床になっている。',
        survey: { trace: true, text: '寝床に、結晶のような鱗が落ちている。', mats: [{ id: 'mat_starroot', w: 100, n: [1, 1] }] } },
      { id: 'f7_spring', name: '星の泉', x: 84, y: 70, text: '光の粒が湧き出す泉。',
        gather: [{ id: 'mat_glowwater', w: 60, n: [1, 2] }, { id: 'mat_starmoss', w: 40, n: [1, 2] }] },
      { id: 'f7_core', name: '庭の心臓', x: 50, y: 16, text: 'すべての根が集まる場所。脈打つように光っている。',
        survey: { trace: true, text: '根の光は、ここから世界じゅうの塔へ流れているらしい。', mats: [{ id: 'mat_deepcrystal', w: 100, n: [1, 1] }] } },
      { id: 'f7_ledge', name: '根の上の岩棚', x: 84, y: 30, text: '根に持ち上げられた岩棚。',
        gather: [{ id: 'mat_deepcrystal', w: 50, n: [1, 1] }, { id: 'mat_ore', w: 50, n: [1, 3] }] },
      { id: 'f7_hall', name: '眠りの間', x: 44, y: 80, text: '天井の高い広間。床に大きな体の跡がある。' },
    ],
    monsters: [
      { monsterId: 'mon_m07', at: { dawn: 'f7_nest', day: 'f7_hall', dusk: 'f7_hall', night: 'f7_nest' }, lairs: ['f7_nest', 'f7_hall', 'f7_core'] },
    ],
  },
];

const DANGER = { mon_m07: 6, mon_m08: 6, mon_m04s: 6 };
const H = (id, monsterId, fieldId, name, desc, start, money, extra = [], more = {}) => ({
  id, name, kind: 'hunt', fieldId, start, desc, rank: 'master', danger: DANGER[monsterId] ?? 6,
  goal: { type: 'hunt', monsterId, text: `${name.replace(/の討伐$/, '')}を討伐する（捕獲でもよい）` },
  extra, reward: { money, n: [4, 6] }, ...more,
});
const brk = (m, part, text, mat) => ({ id: `x_${m.slice(4)}_${part}`, type: 'break', monsterId: m, part, text, money: 800, mats: [{ id: mat, w: 100, n: [1, 1] }] });
const at = (monsterId, spots, lairs) => [{ monsterId, at: { dawn: spots[0], day: spots[0], dusk: spots[1], night: spots[1] }, lairs }];

export const MASTER_QUESTS = [
  H('q_m_m07', 'mon_m07', 'fld_starroot', 'アステリオの討伐', '星の根の庭を守る古い龍を討伐してほしい。', 'dawn', 3500, [brk('mon_m07', 'crystals', '背の結晶を壊す', 'mat_m07_crystal')]),
  H('q_m_m08', 'mon_m08', 'fld_hollow', 'グラウムの討伐', '大空洞の結晶を食い荒らす大きな蟹を討伐してほしい。', 'day', 3000, [brk('mon_m08', 'eyes', '眼柄を壊す', 'mat_m08_eye')]),
  H('q_m_m04s', 'mon_m04s', 'fld_hollow', '黒疾風のザルガの討伐', '大空洞の暗がりに、黒い疾風が出るという。', 'dusk', 3200, [brk('mon_m04s', 'claws', '爪刃を壊す', 'mat_m04s_claw')],
    { monsters: [{ monsterId: 'mon_m04s', at: { dawn: null, day: null, dusk: 'f6_shadow', night: 'f6_bones' }, lairs: ['f6_shadow', 'f6_bones', 'f6_stair'] }, { monsterId: 'mon_m08', at: { dawn: 'f6_forest', day: 'f6_forest', dusk: 'f6_pool', night: 'f6_pool' }, lairs: ['f6_forest', 'f6_pool'] }] }),
  H('q_m_m01', 'mon_m01_ms', 'fld_forest', 'マスター級のバルドンの討伐', '古塔の森に、岩山のようなバルドンが現れた。', 'dawn', 2600, [], { monsters: at('mon_m01_ms', ['f1_stairs', 'f1_roots'], ['f1_stairs', 'f1_roots', 'f1_quarry']) }),
  H('q_m_m02', 'mon_m02_ms', 'fld_canyon', 'マスター級のヴェルカの討伐', '赤風の峡谷の空が燃えている。', 'dawn', 2800, [], { monsters: at('mon_m02_ms', ['f2_cliff', 'f2_ledge'], ['f2_cliff', 'f2_ledge', 'f2_pillars']) }),
  H('q_m_m03', 'mon_m03_ms', 'fld_marsh', 'マスター級のグルボアの討伐', '湿原が毒の海になりかけている。', 'dusk', 2800, [], { monsters: at('mon_m03_ms', ['f3_deep', 'f3_bridge'], ['f3_deep', 'f3_bridge', 'f3_reeds']) }),
  H('q_m_m04', 'mon_m04_ms', 'fld_ruins', 'マスター級のザルガの討伐', '都の大通りを、目に見えないほど速い影が走る。', 'dawn', 3000, [], { monsters: at('mon_m04_ms', ['f5_avenue', 'f5_market'], ['f5_avenue', 'f5_market', 'f5_rooftop']) }),
  H('q_m_m05', 'mon_m05_ms', 'fld_ruins', 'マスター級のオルドゥムの討伐', '都の地下から、さらに大きな古獣が現れた。', 'dusk', 3200, [], { monsters: [{ monsterId: 'mon_m05_ms', at: { dawn: null, day: null, dusk: 'f5_hall', night: 'f5_hall' }, lairs: ['f5_hall'] }] }),
  H('q_m_m06', 'mon_m06_ms', 'fld_ridge', 'マスター級のライゼンの討伐', '尾根の空が、昼も夜も鳴りやまない。', 'day', 3000, [], { monsters: at('mon_m06_ms', ['f4_summit', 'f4_crag'], ['f4_summit', 'f4_crag', 'f4_slope']) }),
  { id: 'q_m_hollow_survey', name: '大空洞の調査', kind: 'survey', fieldId: 'fld_hollow', start: 'day', rank: 'master', desc: '大空洞に残る痕跡を3つ調べてほしい。', goal: { type: 'survey', count: 3, text: '痕跡を3つ調べる' }, extra: [], reward: { money: 2000, n: [4, 5], mats: [{ id: 'mat_deepcrystal', w: 40 }, { id: 'mat_runestone', w: 35 }, { id: 'mat_glowwater', w: 25 }] } },
  { id: 'q_m_root_free', name: '星の根の庭の探索', kind: 'free', fieldId: 'fld_starroot', start: 'night', rank: 'master', desc: '目標なし。採取と観察を好きなだけ。いつ帰っても失敗にならない。', goal: { type: 'free', text: '目標なし（帰ると終わり）' }, extra: [], reward: { money: 0, n: [0, 0] } },
  { id: 'q_m_hollow_free', name: '大空洞の探索', kind: 'free', fieldId: 'fld_hollow', start: 'day', rank: 'master', desc: '目標なし。採取と観察を好きなだけ。いつ帰っても失敗にならない。', goal: { type: 'free', text: '目標なし（帰ると終わり）' }, extra: [], reward: { money: 0, n: [0, 0] } },
  // マスター級の最後の依頼：新しい2種と特殊個体を狩ると出る。達成で物語に一区切り、エンドコンテンツの入口が開く
  { id: 'q_master_final', name: '星の根の目覚め', kind: 'hunt', fieldId: 'fld_starroot', start: 'night', rank: 'master', danger: 7, final: 'master',
    desc: '庭の心臓の光が乱れている。守り竜と、大空洞の主が同時に庭へ現れた。二頭とも狩ってほしい。',
    monsters: [{ monsterId: 'mon_m07', at: { dawn: 'f7_core', day: 'f7_core', dusk: 'f7_core', night: 'f7_core' }, lairs: ['f7_core'] },
      { monsterId: 'mon_m08', at: { dawn: 'f7_hall', day: 'f7_hall', dusk: 'f7_hall', night: 'f7_hall' }, lairs: ['f7_hall', 'f7_ledge'] }],
    goal: { type: 'huntAll', monsterIds: ['mon_m07', 'mon_m08'], text: '二頭とも狩る（討伐か捕獲）' },
    extra: [], reward: { money: 9000, n: [4, 5] }, unlock: { masterSpecies: 3 } },
  // エンドコンテンツの入口（15章）：強化個体の依頼。中身は次の段階で広げる
  { id: 'q_ex_m07', name: '【強化個体】目覚めし守り竜', kind: 'special', fieldId: 'fld_starroot', start: 'night', rank: 'master', danger: 8, limit: 'dawn',
    desc: '星の根の力をすべて取り込んだ守り竜。夜明けまでに討伐せよ。', monsters: [{ monsterId: 'mon_m07_ex', at: { dawn: 'f7_core', day: 'f7_core', dusk: 'f7_core', night: 'f7_core' }, lairs: ['f7_core'] }],
    goal: { type: 'hunt', monsterId: 'mon_m07_ex', text: '夜明けまでに強化個体を討伐する' }, extra: [], reward: { money: 15000, n: [5, 6] }, unlock: { cleared: 'q_master_final' } },
];

// 第13段階：マスター級に足した4種（置き場所と依頼。最後の依頼の前に並べる）
for (const f of MASTER_FIELDS) { const p = MASTER2_PLACES[f.id]; if (p) f.monsters.push(...[].concat(p)); }
MASTER_QUESTS.splice(MASTER_QUESTS.findIndex(q => q.final === 'master'), 0, ...MASTER2_QUESTS);
// おまけ要素（90）：強化個体の依頼（最後に並べる）
MASTER_QUESTS.push(...EX_QUESTS);
