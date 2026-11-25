// 第7段階の「試験用」のフィールドとクエスト（24b 1・3・8章）。正式な中身ではない。
// 正式なフィールドの名前と中身は第8段階（P-18）。
// ポイントの項目：
//   x,y 地図の上の位置（%） / camp 野営地（力尽きたら戻る） / gather 採取で出る物（times があればその時間だけ）
//   survey 調べられる物（trace=痕跡。調査クエストで数える） / text 説明

export const TEST_FIELD = {
  id: 'fld_test',
  name: '試験の森（仮）',
  art: 'bg.field.01',
  actions: 10, // 1回のクエストの行動回数（P-09）。スキル「採取上手」で増える
  points: [
    { id: 'p_camp', name: '野営地', x: 14, y: 82, camp: true, text: '小さな天幕と焚き火の跡。力尽きたらここで手当てを受ける。' },
    { id: 'p_grove', name: '木立', x: 30, y: 60, text: '背の低い木が集まっている。足元に草が多い。',
      gather: [{ id: 'mat_test_herb', w: 60, n: [1, 3] }, { id: 'mat_test_bone', w: 40, n: [1, 2] }] },
    { id: 'p_rocks', name: '岩場', x: 52, y: 78, text: '崩れた岩が転がる。鉱石が顔を出している。',
      gather: [{ id: 'mat_test_ore', w: 70, n: [1, 3] }, { id: 'mat_test_shell', w: 30, n: [1, 1] }] },
    { id: 'p_spring', name: '泉', x: 80, y: 74, text: '澄んだ水がわいている。夜になると、岸の苔がほのかに光る。',
      gather: [{ id: 'mat_test_herb', w: 70, n: [1, 2] }, { id: 'mat_test_glow', w: 30, n: [1, 2], times: ['night'] }] },
    { id: 'p_trail', name: '獣道', x: 40, y: 38, text: '草が踏み分けられた細い道。',
      survey: { trace: true, text: '大きな足跡が続いている。爪の跡が深い。', mats: [{ id: 'mat_test_scale', w: 100, n: [1, 1] }] } },
    { id: 'p_ruins', name: '遺跡', x: 66, y: 46, text: '苔むした石柱が並ぶ。何かが体をこすりつけた跡がある。',
      survey: { trace: true, text: '石柱に鱗がこすれた跡。ここをよく通るらしい。', mats: [{ id: 'mat_test_ore', w: 60, n: [1, 2] }, { id: 'mat_test_core', w: 40, n: [1, 1] }] } },
    { id: 'p_clearing', name: '開けた草地', x: 22, y: 30, text: '見通しのよい草地。昼のあいだ、大きな獣がよく現れる。',
      survey: { trace: true, text: '草が丸く押しつぶされている。寝床にしていたらしい。', mats: [{ id: 'mat_test_hide', w: 100, n: [1, 1] }] } },
    { id: 'p_den', name: '奥の窪地', x: 84, y: 20, text: '木の根が絡み合う暗い窪地。獣のにおいが濃い。' },
  ],
  // 大型の居場所（時間で変わる）。逃げたら lairs のうち、今いない所へ移る（Q-17）
  monsters: [
    { monsterId: 'mon_test', at: { dawn: 'p_clearing', day: 'p_clearing', dusk: 'p_den', night: 'p_den' }, lairs: ['p_clearing', 'p_den', 'p_ruins'] },
  ],
};

// クエスト（11章）。kind：hunt 通常 / survey 調査 / free 自由探索 / special 特殊
// goal：達成の条件。extra：追加の目的。reward：基本報酬（お金・素材）。start：始まる時間。
// limit：特殊の制限時間（この時間になったら失敗）
export const TEST_QUESTS = [
  { id: 'q_test_hunt', name: '試験体の討伐', kind: 'hunt', fieldId: 'fld_test', start: 'dawn',
    desc: '試験の森に現れる試験体を討伐する。捕獲でもよい。',
    goal: { type: 'hunt', monsterId: 'mon_test', text: '試験体を討伐する（捕獲でもよい）' },
    extra: [
      { id: 'x_tail', type: 'break', monsterId: 'mon_test', part: 'tail', text: '尾を壊す', money: 100, mats: [{ id: 'mat_test_tail', w: 100, n: [1, 1] }] },
      { id: 'x_capture', type: 'capture', monsterId: 'mon_test', text: '捕獲する', money: 150, mats: [{ id: 'mat_test_hide', w: 100, n: [1, 1] }] },
    ],
    reward: { money: 500, n: [3, 5] } },
  { id: 'q_test_survey', name: '痕跡の調査', kind: 'survey', fieldId: 'fld_test', start: 'day',
    desc: '大きな獣の痕跡を3つ調べて報告する。戦わなくてもよい。',
    goal: { type: 'survey', count: 3, text: '痕跡を3つ調べる' },
    extra: [{ id: 'x_observe', type: 'observe', monsterId: 'mon_test', text: '試験体を観察する', money: 80, mats: [{ id: 'mat_test_scale', w: 100, n: [1, 2] }] }],
    reward: { money: 300, n: [3, 4], mats: [{ id: 'mat_test_ore', w: 40 }, { id: 'mat_test_herb', w: 35 }, { id: 'mat_test_scale', w: 25 }] } },
  { id: 'q_test_free', name: '自由探索', kind: 'free', fieldId: 'fld_test', start: 'dusk',
    desc: '目標なし。採取と観察を好きなだけ。いつ帰っても失敗にならない。',
    goal: { type: 'free', text: '目標なし（帰ると終わり）' },
    extra: [],
    reward: { money: 0, n: [0, 0] } },
  { id: 'q_test_special', name: '昼のうちに討伐', kind: 'special', fieldId: 'fld_test', start: 'dawn', limit: 'dusk',
    desc: '夕方になる前に試験体を討伐する。時間が過ぎると失敗。',
    goal: { type: 'hunt', monsterId: 'mon_test', text: '夕方までに試験体を討伐する（捕獲でもよい）' },
    extra: [],
    reward: { money: 600, n: [4, 5] } },
];
