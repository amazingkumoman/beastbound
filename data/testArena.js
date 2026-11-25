// 第4段階の「試験用」の中身（20b 8章）。正式なモンスター・武器ではない。
// しくみの確認だけに使う。第5段階以降、正式なデータができたら試験場ごと外す。

export const TEST_WEAPON = {
  id: 'wpn_test',
  name: '試験用の剣',
  type: 'cut',          // 攻撃の種類（cut 斬 / blunt 打 / pierce 突 / shot 射）
  power: 100,           // 攻撃力（20b 5章）
  guardLevel: 2,        // 受けの強さ 1〜3（20b 6章）
  reach: ['near'],      // 攻撃が届く間合い
  light: { name: '斬りつけ', mult: 0.6, opening: 0, stGain: 5 },
  heavy: { name: '振り下ろし', mult: 1.2, opening: 1, st: 10 },
  techs: [
    { id: 'tech_test_charge', name: '溜め斬り（試験）', st: 25, mult: 2.2, opening: 2, breakBonus: 1.3 },
    { id: 'tech_test_bleed', name: '裂き斬り（試験）', st: 20, mult: 1.0, opening: 1, ail: { bleed: 45 } },
  ],
};

export const TEST_ITEMS = [ // 第7段階で正式なアイテムにする
  { id: 'itm_test_potion', name: '回復薬（試験）', count: 3, heal: 40 },
  { id: 'itm_test_antidote', name: '解毒薬（試験）', count: 1, cure: ['poison', 'bleed'] },
];

export const TEST_MONSTER = {
  id: 'mon_test',
  name: '試験体',
  art: 'mon.test',
  hp: 1700,
  startRange: 'mid',
  body: { cut: 1.0, blunt: 1.0, pierce: 1.0, shot: 0.9 },
  parts: {
    head: { name: '頭', x: 32, y: 32, hpRatio: 0.18, z: { cut: 1.3, blunt: 1.4, pierce: 1.2, shot: 1.3 },
      onBreak: { down: 1, text: '頭の甲殻が割れた！ よろめいて倒れこんだ。' } },
    foreleg: { name: '前脚', x: 22, y: 78, hpRatio: 0.2, z: { cut: 1.0, blunt: 1.0, pierce: 1.0, shot: 0.8 },
      onBreak: { down: 1, disable: ['act_stomp'], text: '前脚を痛めた！ 踏みつけができなくなったようだ。' } },
    tail: { name: '尾', x: 85, y: 62, hpRatio: 0.15, z: { cut: 1.2, blunt: 0.7, pierce: 1.0, shot: 1.0 },
      onBreak: { down: 1, disable: ['act_sweep'], text: '尾を断ち切った！' } },
  },
  // weight=攻撃の重さ 1〜3、unguardable=受けられない、wide=かわしにくい、reach=届く間合い
  acts: [
    { id: 'act_bite', name: '噛みつき', w: 3, power: 20, weight: 1, reach: ['near'], tell: '首を引いて口を開いた ─ 噛みつきの予兆' },
    { id: 'act_stomp', name: '踏みつけ', w: 2, power: 22, weight: 2, reach: ['near', 'mid'], tell: '前脚を高く上げた ─ 踏みつけの予兆', fatigue: 10 },
    { id: 'act_sweep', name: '尾の薙ぎ払い', w: 2, power: 22, weight: 2, wide: true, reach: ['near', 'mid'], tell: '体をひねって尾を振りかぶった ─ 薙ぎ払いの予兆' },
    { id: 'act_charge', name: '突進', w: 2, power: 40, weight: 3, unguardable: true, reach: ['near', 'mid', 'far'], moveTo: 'near', tell: '頭を低くして地面をかいた ─ 突進の予兆', fatigue: 20 },
    { id: 'act_spit', name: '毒の吐きかけ', w: 1, power: 12, weight: 1, wide: true, reach: ['mid', 'far'], ail: 'poison', tell: '喉がふくらんだ ─ 吐きかけの予兆' },
    { id: 'act_frenzy', name: '暴れ回り', w: 2, power: 38, weight: 3, wide: true, reach: ['near', 'mid'], rageOnly: true, tell: '怒りで体を震わせている ─ 暴れ回りの予兆', fatigue: 20 },
    { id: 'act_back', name: '後ずさり', w: 1, move: 'far', tell: '低くうなって距離を取ろうとしている' },
    { id: 'act_idle', name: '様子見', w: 2, idle: true },
  ],
  idleText: ['こちらの様子をうかがっている。', '鼻を鳴らして地面のにおいをかいでいる。'],
  rage: { mult: 1.2, turns: [4, 6], damageGain: 150, breakGain: 20, adaptGain: 10 },
  fatigue: { threshold: 70, turns: [2, 3], recover: 40, mult: 0.8, text: '息が荒い。動きがにぶっている。' },
  adaptSpeed: 1,      // 適応の速さ（知能・生態）。1 がふつう
  ailRes: { poison: 1, paralysis: 1, sleep: 1, bleed: 1, stun: 1 }, // 蓄積の上限の倍率
  flee: { hpBelow: 0.25, chance: 0.25, once: true, text: '試験体は身をひるがえして逃げ出した！' },
  // 弱りの兆候（HP の割合を段階に置き換えるだけにしない：体力・部位・疲労の組み合わせ）
  signs: [
    { id: 'sg_scar', when: { hpBelow: 0.65 }, text: '体のあちこちに傷が増えてきた。' },
    { id: 'sg_limp', when: { hpBelow: 0.4, partBroken: 'foreleg' }, text: '前脚を引きずっている。' },
    { id: 'sg_heavy', when: { hpBelow: 0.3 }, text: '呼吸が浅く速い。動きに切れがない。' },
  ],
  // 第7段階（24b 4・5章）：捕獲と報酬
  capture: { hpBelow: 0.25, text: '足を引きずり、何度もよろめいている。（捕まえられそうだ）' },
  rewards: {
    hunt: [{ id: 'mat_test_scale', w: 40 }, { id: 'mat_test_shell', w: 30 }, { id: 'mat_test_bone', w: 18 }, { id: 'mat_test_core', w: 12 }],
    capture: [{ id: 'mat_test_scale', w: 30 }, { id: 'mat_test_hide', w: 30 }, { id: 'mat_test_shell', w: 25 }, { id: 'mat_test_core', w: 15 }],
    parts: { head: 'mat_test_core', foreleg: 'mat_test_shell', tail: 'mat_test_tail' },
  },
  observe: { // 戦わずに見たときの文（時間で変わる）
    dawn: '朝露の中、地面のにおいをかぎながら歩き回っている。', day: '日なたで体を休めているが、耳はこちらを向いている。',
    dusk: '落ち着きなく尾を振り、ねぐらへ向かおうとしている。', night: '暗がりで目だけが光っている。気が立っているようだ。',
  },
};
