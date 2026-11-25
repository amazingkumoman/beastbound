import { FINAL_MONSTERS } from './story.js';
import { LOW2_PLACES, LOW2_QUESTS } from './gear_low2.js';

// 【ネタバレ注意】正式なフィールド3つ（Q-13・P-18）と下位のクエスト（23b 5章）。
// ポイントの項目は testField.js と同じ。quest.unlock：{ hunted: モンスターid } ＝その種を討伐か捕獲したら受けられる。
// 一本道にしない（2026-11-25 ユーザー）：3種の討伐・調査・探索は最初から全部。捕獲と特殊は、その種を一度狩った後。
// danger：危険度（受付に★で出す。装備を選ぶ目安）
// limit：特殊クエストの制限時間（その時間になったら失敗。出発より前の時間なら翌日のその時間）

export const FIELDS = [
  {
    id: 'fld_forest', name: '古塔の森', art: 'bg.field.01', actions: 10,
    points: [
      { id: 'f1_camp', name: '野営地', x: 12, y: 84, camp: true, text: '森の入口の天幕。焚き火の煙が細く上がっている。' },
      { id: 'f1_thicket', name: '下草の茂み', x: 30, y: 66, text: '日の差しこむ茂み。薬草がよく育っている。',
        gather: [{ id: 'mat_herb', w: 60, n: [1, 3] }, { id: 'mat_bone', w: 40, n: [1, 2] }] },
      { id: 'f1_stairs', name: '苔の石段', x: 22, y: 34, text: '古い塔へ続く石段。分厚い苔に大きな歯形が残る。',
        survey: { trace: true, text: '苔が帯のように食いちぎられている。重いものが何度も通った跡だ。', mats: [{ id: 'mat_ore', w: 100, n: [1, 2] }] } }, // 大型の素材は拾えない（戦う前に防具が見えてしまうので）
      { id: 'f1_quarry', name: '崩れた石切り場', x: 54, y: 76, text: '切り出された石が転がる。鉱石が顔を出している。',
        gather: [{ id: 'mat_ore', w: 70, n: [1, 3] }, { id: 'mat_crystal', w: 30, n: [1, 1] }] },
      { id: 'f1_roots', name: '塔の根元', x: 62, y: 40, text: '巨大な塔の根元。地面がえぐれ、岩の寝床のようになっている。',
        survey: { trace: true, text: '岩肌に、背中をこすりつけた跡。苔と鉱物の粉が落ちている。', mats: [{ id: 'mat_crystal', w: 60, n: [1, 1] }, { id: 'mat_ore', w: 40, n: [1, 2] }] } },
      { id: 'f1_spring', name: '湧き水の窪地', x: 82, y: 70, text: '冷たい水がわく窪地。夜は岸の苔が淡く光る。',
        gather: [{ id: 'mat_herb', w: 70, n: [1, 2] }, { id: 'mat_glowmoss', w: 30, n: [1, 2], times: ['night', 'dusk'] }] },
      { id: 'f1_path', name: '獣道', x: 42, y: 52, text: '踏み固められた道。大きな足跡が続く。',
        survey: { trace: true, text: '丸く深い足跡。指の跡が4本ある。とても重い生き物だ。', mats: [{ id: 'mat_bone', w: 100, n: [1, 2] }] } },
      { id: 'f1_ridge', name: '見晴らしの尾根', x: 84, y: 22, text: '森を見下ろす尾根。ときどき赤い影が空を横切る。',
        gather: [{ id: 'mat_feather', w: 40, n: [1, 1] }, { id: 'mat_ore', w: 60, n: [1, 2] }] },
    ],
    monsters: [{ monsterId: 'mon_m01', at: { dawn: 'f1_stairs', day: 'f1_stairs', dusk: 'f1_roots', night: 'f1_roots' }, lairs: ['f1_stairs', 'f1_roots', 'f1_quarry'] }],
  },
  {
    id: 'fld_canyon', name: '赤風の峡谷', art: 'bg.field.02', actions: 10,
    points: [
      { id: 'f2_camp', name: '野営地', x: 14, y: 86, camp: true, text: '岩陰に張った天幕。風の音がやまない。' },
      { id: 'f2_floor', name: '谷底の道', x: 40, y: 78, text: '乾いた砂利の道。獣の骨が散らばっている。',
        gather: [{ id: 'mat_bone', w: 60, n: [1, 3] }, { id: 'mat_herb', w: 40, n: [1, 1] }] },
      { id: 'f2_cliff', name: '風の崖', x: 24, y: 30, text: '上昇気流が吹き上がる崖。高い所に爪の跡がある。',
        survey: { trace: true, text: '崖の上の方に、深い爪の跡が並んでいる。翼でつかまっていたらしい。', mats: [{ id: 'mat_feather', w: 100, n: [1, 2] }] } },
      { id: 'f2_pillars', name: '石柱の林', x: 58, y: 48, text: '光る筋の入った石柱が並ぶ。翠色の結晶がのぞく。',
        gather: [{ id: 'mat_crystal', w: 70, n: [1, 2] }, { id: 'mat_sunstone', w: 30, n: [1, 1], times: ['day', 'dusk'] }] },
      { id: 'f2_scorch', name: '焼け跡', x: 72, y: 74, text: '岩が黒く焦げている。まだ熱が残る。',
        survey: { trace: true, text: '焦げた岩の上に、溶けかけた鱗が貼りついている。', mats: [{ id: 'mat_sunstone', w: 40, n: [1, 1] }, { id: 'mat_ore', w: 60, n: [1, 2] }] } },
      { id: 'f2_ledge', name: '高い岩棚', x: 84, y: 20, text: '谷を見下ろす岩棚。枝や骨を集めた巣がある。',
        survey: { trace: true, text: '巣に、抜け落ちた棘と羽のような膜のかけらが残っている。', mats: [{ id: 'mat_feather', w: 100, n: [1, 2] }] } },
      { id: 'f2_vein', name: '鉱脈の裂け目', x: 46, y: 22, text: '岩の裂け目に鉱石の筋が走る。',
        gather: [{ id: 'mat_ore', w: 70, n: [2, 3] }, { id: 'mat_crystal', w: 30, n: [1, 1] }] },
      { id: 'f2_grass', name: '枯れ草の斜面', x: 88, y: 52, text: '風に枯れ草がなびく斜面。',
        gather: [{ id: 'mat_herb', w: 50, n: [1, 2] }, { id: 'mat_feather', w: 50, n: [1, 1] }] },
    ],
    monsters: [{ monsterId: 'mon_m02', at: { dawn: 'f2_cliff', day: 'f2_cliff', dusk: 'f2_ledge', night: 'f2_ledge' }, lairs: ['f2_cliff', 'f2_ledge', 'f2_pillars'] }],
  },
  {
    id: 'fld_marsh', name: '沈み橋の湿原', art: 'bg.field.03', actions: 10,
    points: [
      { id: 'f3_camp', name: '野営地', x: 10, y: 80, camp: true, text: '水の上に組んだ足場の天幕。足元がいつも湿っている。' },
      { id: 'f3_reeds', name: '葦の茂み', x: 28, y: 60, text: '背の高い葦が風に揺れる。',
        gather: [{ id: 'mat_reed', w: 70, n: [1, 3] }, { id: 'mat_herb', w: 30, n: [1, 2] }] },
      { id: 'f3_deep', name: '泥の深み', x: 50, y: 74, text: 'ひざまで沈む泥。ときどき大きな泡が浮かぶ。',
        survey: { trace: true, text: '泥の表面に、太い体を引きずった筋が残っている。', mats: [{ id: 'mat_reed', w: 100, n: [1, 2] }] } },
      { id: 'f3_bridge', name: '沈み橋の浅瀬', x: 66, y: 42, text: '崩れた石橋が水に沈んでいる。橋の上がぬめっている。',
        survey: { trace: true, text: '橋の石が溶けたように変色している。毒の粘液だ。', mats: [{ id: 'mat_reed', w: 60, n: [1, 2] }, { id: 'mat_herb', w: 40, n: [1, 1] }] } },
      { id: 'f3_steam', name: '湯気の岩場', x: 84, y: 76, text: '割れた岩から湯気が立ちのぼる。夜には貝が上がってくる。',
        gather: [{ id: 'mat_ore', w: 60, n: [1, 2] }, { id: 'mat_pearl', w: 40, n: [1, 1], times: ['night'] }] },
      { id: 'f3_arch', name: '苔むした門', x: 40, y: 28, text: '大きな石の門。足元に骨が積もっている。',
        survey: { trace: true, text: '骨に、細かい歯の跡がびっしりついている。丸のみにしてから吐き出したらしい。', mats: [{ id: 'mat_bone', w: 100, n: [1, 2] }] } },
      { id: 'f3_pool', name: '澄んだ溜まり', x: 18, y: 26, text: '湿原の中で珍しく水が澄んでいる。',
        gather: [{ id: 'mat_herb', w: 60, n: [1, 2] }, { id: 'mat_glowmoss', w: 40, n: [1, 1], times: ['night', 'dusk'] }] },
      { id: 'f3_ruin', name: '崩れた塔の跡', x: 82, y: 18, text: '湿原に沈みかけた塔。光る筋が水面に映る。',
        gather: [{ id: 'mat_crystal', w: 60, n: [1, 1] }, { id: 'mat_ore', w: 40, n: [1, 2] }] },
    ],
    monsters: [{ monsterId: 'mon_m03', at: { dawn: 'f3_deep', day: 'f3_deep', dusk: 'f3_bridge', night: 'f3_bridge' }, lairs: ['f3_deep', 'f3_bridge', 'f3_reeds'] }],
  },
];

const DANGER = { mon_m01: 1, mon_m02: 2, mon_m03: 3 };
const hunt = (id, m, field, name, desc, start, money, extra, more = {}) => ({
  id, name, kind: 'hunt', fieldId: field, start, desc,
  goal: { type: 'hunt', monsterId: m, text: `${name.replace('の討伐', '')}を討伐する（捕獲でもよい）` },
  extra, reward: { money, n: [3, 5] }, danger: DANGER[m], ...more,
});
const brk = (m, part, text, mat) => ({ id: `x_${m.slice(4)}_${part}`, type: 'break', monsterId: m, part, text, money: 100, mats: [{ id: mat, w: 100, n: [1, 1] }] });
const cap = (m, mat) => ({ id: `x_${m.slice(4)}_cap`, type: 'capture', monsterId: m, text: '捕獲する', money: 150, mats: [{ id: mat, w: 100, n: [1, 1] }] });
const survey = (id, field, name, desc, start, money, mats, extra = [], more = {}) => ({
  id, name, kind: 'survey', fieldId: field, start, desc, goal: { type: 'survey', count: 3, text: '痕跡を3つ調べる' }, extra, reward: { money, n: [3, 4], mats }, ...more,
});
const free = (id, field, name, start, more = {}) => ({
  id, name, kind: 'free', fieldId: field, start, desc: '目標なし。採取と観察を好きなだけ。いつ帰っても失敗にならない。', goal: { type: 'free', text: '目標なし（帰ると終わり）' }, extra: [], reward: { money: 0, n: [0, 0] }, ...more,
});
const obs = (m, mat) => ({ id: `x_${m.slice(4)}_obs`, type: 'observe', monsterId: m, text: '大型を観察する', money: 80, mats: [{ id: mat, w: 100, n: [1, 1] }] });

export const QUESTS = [
  hunt('q_m01_hunt', 'mon_m01', 'fld_forest', 'バルドンの討伐', '古塔の森で、石段を荒らす大きな獣を討伐してほしい。', 'dawn', 400,
    [brk('mon_m01', 'back', '背甲を壊す', 'mat_m01_plate'), cap('mon_m01', 'mat_m01_vein')]),
  survey('q_f1_survey', 'fld_forest', '古塔の森の調査', '森に残る大きな獣の痕跡を3つ調べてほしい。戦わなくてもよい。', 'day', 300,
    [{ id: 'mat_ore', w: 40 }, { id: 'mat_herb', w: 35 }, { id: 'mat_crystal', w: 25 }], [obs('mon_m01', 'mat_crystal')]),
  free('q_f1_free', 'fld_forest', '古塔の森の探索', 'dusk'),
  hunt('q_m02_hunt', 'mon_m02', 'fld_canyon', 'ヴェルカの討伐', '赤風の峡谷で、旅人を襲う空の狩人を討伐してほしい。', 'dawn', 500,
    [brk('mon_m02', 'wings', '翼を壊す', 'mat_m02_membrane'), cap('mon_m02', 'mat_m02_sac')]),
  survey('q_f2_survey', 'fld_canyon', '赤風の峡谷の調査', '峡谷の焼け跡や巣を調べてほしい。', 'day', 350,
    [{ id: 'mat_crystal', w: 40 }, { id: 'mat_ore', w: 35 }, { id: 'mat_feather', w: 25 }], [obs('mon_m02', 'mat_crystal')]),
  free('q_f2_free', 'fld_canyon', '赤風の峡谷の探索', 'day'),
  hunt('q_m01_capture', 'mon_m01', 'fld_forest', 'バルドンの捕獲', '研究のため、バルドンを生きたまま捕らえてほしい。', 'day', 450,
    [brk('mon_m01', 'tail', '尾槌を壊す', 'mat_m01_club')], { goal: { type: 'capture', monsterId: 'mon_m01', text: 'バルドンを捕獲する' }, unlock: { hunted: 'mon_m01' } }),
  hunt('q_m03_hunt', 'mon_m03', 'fld_marsh', 'グルボアの討伐', '沈み橋の湿原で、毒をまく主を討伐してほしい。', 'dusk', 600,
    [brk('mon_m03', 'back', '背の疣を壊す', 'mat_m03_wart'), cap('mon_m03', 'mat_m03_gland')]),
  survey('q_f3_survey', 'fld_marsh', '沈み橋の湿原の調査', '湿原の泥や橋に残る痕跡を調べてほしい。', 'dawn', 400,
    [{ id: 'mat_reed', w: 40 }, { id: 'mat_herb', w: 35 }, { id: 'mat_crystal', w: 25 }], [obs('mon_m03', 'mat_crystal')]),
  free('q_f3_free', 'fld_marsh', '沈み橋の湿原の探索', 'night'),
  { ...hunt('q_m02_special', 'mon_m02', 'fld_canyon', '昼のうちにヴェルカを', '日が傾く前に、峡谷の空の狩人を討伐せよ。夕方になると失敗。', 'dawn', 600, []),
    kind: 'special', danger: 3, limit: 'dusk', goal: { type: 'hunt', monsterId: 'mon_m02', text: '夕方までにヴェルカを討伐する（捕獲でもよい）' }, unlock: { hunted: 'mon_m02' } },
  { ...hunt('q_m03_special', 'mon_m03', 'fld_marsh', '夜明けまでにグルボアを', '夜のうちに湿原の主を討伐せよ。朝になると失敗。', 'dusk', 600, []),
    kind: 'special', danger: 3, limit: 'dawn', goal: { type: 'hunt', monsterId: 'mon_m03', text: '朝までにグルボアを討伐する（捕獲でもよい）' }, unlock: { hunted: 'mon_m03' } },
  // 下位の最後の依頼（25b 2章・P-17）：3種を狩ると出る。森に二頭が同時に現れる。達成すると上位が開く
  { id: 'q_low_final', name: '塔に集う獣たち', kind: 'hunt', fieldId: 'fld_forest', start: 'dusk', danger: 3, final: 'low',
    desc: '古塔の森の塔の根元に、大型が二頭同時に現れた。二頭とも狩ってほしい。', monsters: FINAL_MONSTERS,
    goal: { type: 'huntAll', monsterIds: ['mon_m01', 'mon_m02'], text: '二頭とも狩る（討伐か捕獲）' },
    extra: [], reward: { money: 1500, n: [3, 4] }, unlock: { species: 3 } },
];

// 第13段階（80 の1回目）：下位に足した4種を、今のフィールドにも住まわせる。クエストを足す
for (const f of FIELDS) { const p = LOW2_PLACES[f.id]; if (p) f.monsters.push(...[].concat(p)); }
QUESTS.splice(QUESTS.findIndex(q => q.final === 'low'), 0, ...LOW2_QUESTS);
