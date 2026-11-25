// 【ネタバレ注意】マスター級の大型（第12段階・70）。設計は docs/spec/secret/マスター級.md。
// 報告・コミットの説明では、ここの中身に触れないこと（D-29）。
// 新しい決まり（engine）：phase2=本気（壊された部位の数か怒った回数で切り替わる。phase:1/2 の行動）／harden=硬化（しばらく攻撃が通りにくい）
import { NEW_MONSTERS, HIGH_VARIANTS } from './monsters_high.js';

const Q = Number(globalThis.process?.env?.MS_POW || 7.4); // マスター級の強さの倍率（試し打ちで調整）
const pw = n => Math.round(n * Q);

export const MASTER_NEW = [
  {
    id: 'mon_m07', name: 'アステリオ', alias: '星根の守り竜', art: 'mon.m07', hp: 5200, startRange: 'mid', rank: 'master',
    lore: { kind: '古龍・星の根の番人', habits: '星の根の庭の奥、光る根の上でまどろむ。目覚めているときは庭を見回り、侵入者を許さない。',
      ecology: '塔の翠の光を食べて生きる古い龍。体の結晶は塔の石と同じもの。追い詰められると眠っていた力が目を覚まし、戦い方ががらりと変わる。',
      tips: '本気になる前に部位を壊しすぎると、早く本気を出させてしまう。氷の力がよく効く。', rage: '結晶を壊されると、すぐに気が立つ。' },
    body: { cut: 1.0, blunt: 1.0, pierce: 1.0, shot: 1.0 },
    elem: { fire: 0.7, water: 0.9, thunder: 0.8, ice: 1.3, dragon: 0.5 },
    phase2: { breaks: 2, rages: 2, text: 'アステリオの体の結晶が一斉に輝いた！ 眠っていた力が目を覚ました……（本気）' },
    parts: {
      head: { name: '角冠', x: 34, y: 18, hpRatio: 0.14, z: { cut: 1.2, blunt: 1.3, pierce: 1.1, shot: 1.2 }, onBreak: { down: 1, text: '角冠の結晶が砕けた！' } },
      crystals: { name: '背の結晶', x: 56, y: 14, hpRatio: 0.16, z: { cut: 1.1, blunt: 1.25, pierce: 1.0, shot: 1.2 }, onBreak: { down: 1, disable: ['act_m07_beam'], text: '背の結晶が割れた！ 光を束ねられなくなった。' } },
      wings: { name: '翼', x: 18, y: 44, hpRatio: 0.15, z: { cut: 1.25, blunt: 0.9, pierce: 1.0, shot: 1.3 }, onBreak: { down: 2, text: '翼膜が裂けた！' } },
      tail: { name: '尾', x: 88, y: 76, hpRatio: 0.12, z: { cut: 1.3, blunt: 0.9, pierce: 1.0, shot: 1.0 }, onBreak: { down: 1, disable: ['act_m07_tail'], text: '尾を断ち切った！' } },
    },
    acts: [
      { id: 'act_m07_bite', name: '噛み砕き', w: 3, power: pw(36), weight: 2, reach: ['near'], tell: '首を引き、口に光をためた ─ 噛み砕きの予兆' },
      { id: 'act_m07_claw', name: '結晶の爪', w: 2, power: pw(38), weight: 2, reach: ['near', 'mid'], tell: '前脚の結晶が伸びた ─ 爪の予兆' },
      { id: 'act_m07_tail', name: '尾の薙ぎ', w: 2, power: pw(34), weight: 2, wide: true, reach: ['near', 'mid'], tell: '体をひねって尾を振りかぶった ─ 薙ぎの予兆' },
      { id: 'act_m07_beam', name: '星光の息', w: 2, power: pw(44), weight: 3, wide: true, element: 'dragon', reach: ['mid', 'far'], tell: '背の結晶に光が集まっていく ─ 光の息の予兆' },
      { id: 'act_m07_rush', name: '突進', w: 1, power: pw(46), weight: 3, unguardable: true, reach: ['near', 'mid', 'far'], moveTo: 'near', tell: '翼を広げて身を低くした ─ 突進の予兆', fatigue: 15 },
      // 本気のあとだけ
      { id: 'act_m07_nova', name: '星崩れ', w: 2, power: pw(60), weight: 3, wide: true, element: 'dragon', reach: ['near', 'mid', 'far'], phase: 2, tell: '全身の結晶がまばゆく脈打っている ─ 星崩れの予兆', fatigue: 20 },
      { id: 'act_m07_rain', name: '結晶の雨', w: 2, power: pw(40), weight: 2, element: 'dragon', reach: ['mid', 'far'], phase: 2, tell: '天井の結晶が震えはじめた ─ 結晶の雨の予兆' },
      { id: 'act_m07_hover', name: '浮き上がる', w: 1, move: 'far', moveText: 'アステリオはふわりと浮き上がり、距離を取った。（遠）', tell: '翼をゆっくり打ち鳴らした' },
      { id: 'act_m07_idle', name: '様子見', w: 1, idle: true },
    ],
    idleText: ['静かにこちらを見下ろしている。', '結晶が淡く明滅している。'],
    rage: { mult: 1.25, turns: [4, 6], damageGain: 150, breakGain: 35, adaptGain: 10 },
    fatigue: { threshold: 75, turns: [2, 3], recover: 40, mult: 0.8, text: '結晶の光がにぶり、息が荒い。' },
    adaptSpeed: 1.3, ailRes: { poison: 1.5, paralysis: 1.5, sleep: 1.3, bleed: 1.2, stun: 1.3 },
    flee: null,
    signs: [{ id: 'sg_m07_crack', when: { hpBelow: 0.6 }, text: '体の結晶にひびが増えている。' }, { id: 'sg_m07_dim', when: { hpBelow: 0.3 }, text: '結晶の光が弱く、またたいている。' }],
    capture: null,
    rewards: {
      hunt: [{ id: 'mat_m07_scale', w: 40 }, { id: 'mat_m07_crystal', w: 22 }, { id: 'mat_m07_horn', w: 18 }, { id: 'mat_m07_core', w: 10 }, { id: 'mat_m07_heart', w: 10 }],
      capture: [{ id: 'mat_m07_scale', w: 40 }, { id: 'mat_m07_crystal', w: 30 }, { id: 'mat_m07_core', w: 30 }],
      parts: { head: 'mat_m07_horn', crystals: 'mat_m07_crystal', wings: 'mat_m07_scale', tail: 'mat_m07_scale' },
    },
    observe: { dawn: '光る根の上で丸くなって眠っている。', day: '庭をゆっくりと見回っている。', dusk: '根に顔を寄せ、光を吸っているようだ。', night: '庭の上空を、音もなく漂っている。' },
  },
  {
    id: 'mon_m08', name: 'グラウム', alias: '晶殻の大蟹', art: 'mon.m08', hp: 5600, startRange: 'mid', rank: 'master',
    lore: { kind: '甲殻獣・大空洞の主', habits: '大空洞の結晶の森で、結晶を砕いて食べる。危ないと感じると殻を閉じて固まる。',
      ecology: '殻は結晶でできていて、閉じると刃も槌もほとんど通らない。閉じている間は動かないので、こちらは気力を整え、道具を使う好機になる。',
      tips: '殻を閉じたら無理に攻めない。開いた直後が狙いどき。龍の力がよく効く。', rage: '殻を閉じているところを叩かれ続けると、怒る。' },
    body: { cut: 0.8, blunt: 1.0, pierce: 0.85, shot: 0.8 },
    elem: { fire: 0.9, water: 0.8, thunder: 1.0, ice: 0.6, dragon: 1.3 },
    hardenText: 'グラウムは殻をぴたりと閉じ、結晶のように固まった！（攻撃が通りにくい・気力を整える好機）',
    parts: {
      claws: { name: '大鋏', x: 26, y: 56, hpRatio: 0.18, z: { cut: 1.0, blunt: 1.3, pierce: 0.9, shot: 0.9 }, onBreak: { down: 1, disable: ['act_m08_crush'], text: '大鋏が砕けた！ 挟み潰しができなくなった。' } },
      eyes: { name: '眼柄', x: 46, y: 22, hpRatio: 0.12, z: { cut: 1.3, blunt: 1.2, pierce: 1.3, shot: 1.35 }, onBreak: { down: 2, text: '眼柄を傷つけた！ 大きくのたうった。' } },
      legs: { name: '脚', x: 66, y: 82, hpRatio: 0.18, z: { cut: 1.2, blunt: 1.0, pierce: 1.1, shot: 0.9 }, onBreak: { down: 1, disable: ['act_m08_sweep'], text: '脚を何本か折った！ 横なぎができなくなった。' } },
    },
    acts: [
      { id: 'act_m08_crush', name: '挟み潰し', w: 3, power: pw(42), weight: 3, reach: ['near'], tell: '大鋏を大きく開いた ─ 挟み潰しの予兆' },
      { id: 'act_m08_sweep', name: '脚の横なぎ', w: 2, power: pw(34), weight: 2, wide: true, reach: ['near', 'mid'], tell: '体を傾け、脚を踏ん張った ─ 横なぎの予兆' },
      { id: 'act_m08_shards', name: '結晶飛ばし', w: 2, power: pw(32), weight: 2, reach: ['mid', 'far'], tell: '殻の結晶を震わせている ─ 結晶飛ばしの予兆' },
      { id: 'act_m08_shell', name: '殻を閉じる', w: 2, harden: 2, tell: '殻をきしませ、身を縮めた ─ 殻を閉じる気配' },
      { id: 'act_m08_burst', name: '殻はじき', w: 2, power: pw(50), weight: 3, wide: true, reach: ['near', 'mid'], tell: '閉じた殻の中で何かが膨らんでいる ─ 殻はじきの予兆', fatigue: 18 },
      { id: 'act_m08_charge', name: '体当たり', w: 1, power: pw(48), weight: 3, unguardable: true, reach: ['near', 'mid', 'far'], moveTo: 'near', tell: '横歩きで助走を始めた ─ 体当たりの予兆', fatigue: 15 },
      { id: 'act_m08_quake', name: '大地揺らし', w: 2, power: pw(54), weight: 3, wide: true, reach: ['near', 'mid', 'far'], rageOnly: true, tell: '大鋏を地面に突き立てた ─ 大地揺らしの予兆', fatigue: 20 },
      { id: 'act_m08_idle', name: '様子見', w: 1, idle: true },
    ],
    idleText: ['鋏を打ち鳴らしている。', '泡を吹いて、こちらをうかがっている。'],
    rage: { mult: 1.2, turns: [4, 6], damageGain: 130, breakGain: 25, adaptGain: 10 },
    fatigue: { threshold: 70, turns: [2, 3], recover: 40, mult: 0.8, text: '泡も出ず、脚がふらついている。' },
    adaptSpeed: 0.9, ailRes: { poison: 1.0, paralysis: 1.2, sleep: 1.0, bleed: 1.5, stun: 0.9 },
    flee: { hpBelow: 0.22, chance: 0.25, once: true, text: 'グラウムは結晶の隙間へ潜り込んでいった！' },
    signs: [{ id: 'sg_m08_crack', when: { hpBelow: 0.6 }, text: '殻の結晶があちこち欠けている。' }, { id: 'sg_m08_slow', when: { hpBelow: 0.3 }, text: '殻を閉じるのがやっとのようだ。' }],
    capture: { hpBelow: 0.25, text: '殻を閉じきれず、脚を引きずっている。（捕まえられそうだ）' },
    rewards: {
      hunt: [{ id: 'mat_m08_shell', w: 40 }, { id: 'mat_m08_claw', w: 22 }, { id: 'mat_m08_eye', w: 18 }, { id: 'mat_m08_pearl', w: 10 }, { id: 'mat_m08_core', w: 10 }],
      capture: [{ id: 'mat_m08_shell', w: 34 }, { id: 'mat_m08_claw', w: 18 }, { id: 'mat_m08_eye', w: 18 }, { id: 'mat_m08_pearl', w: 15 }, { id: 'mat_m08_core', w: 15 }],
      parts: { claws: 'mat_m08_claw', eyes: 'mat_m08_eye', legs: 'mat_m08_shell' },
    },
    observe: { dawn: '結晶の森で、殻を閉じて眠っている。', day: '大鋏で結晶を砕いて食べている。', dusk: '結晶の上を横歩きで見回っている。', night: '殻を半分開けて、泡を吹いている。' },
  },
];

// 特殊個体：疾風の狩人の夜の個体（毒の爪・二重の見切り）
const base04 = NEW_MONSTERS.find(m => m.id === 'mon_m04');
export const MASTER_SUB = [{
  ...base04, id: 'mon_m04s', name: '黒疾風のザルガ', alias: '疾風の狩人の特殊個体', art: 'mon.m04s', hp: 5400, rank: 'master', subOf: 'mon_m04',
  lore: { kind: '走竜・特殊個体', habits: '大空洞の暗がりにだけ現れる、夜の疾風。昼は結晶の陰で眠る。',
    ecology: '暗がりで暮らすうちに、爪に毒を持つようになった。ふつうの個体より用心深く、構えを二度重ねてくる。',
    tips: '構えを見たら、軽い攻撃でつなぐ。毒の備えを忘れずに。火の力がよく効く。', rage: '大振りを見切るたびに、気が立っていく。' },
  elem: { fire: 1.3, water: 1.0, thunder: 1.0, ice: 0.8, dragon: 0.8 },
  acts: [
    ...base04.acts.filter(a => !a.idle).map(a => (a.power ? { ...a, id: a.id.replace('m04', 'm04s'), power: Math.round(a.power * 2.3) } : { ...a, id: a.id.replace('m04', 'm04s') })),
    { id: 'act_m04s_venom', name: '毒爪', w: 3, power: pw(34), weight: 2, reach: ['near', 'mid'], ail: 'poison', tell: '爪の先から黒い滴が落ちた ─ 毒爪の予兆' },
    { id: 'act_m04s_stance2', name: '二重の見切り', w: 2, power: pw(46), weight: 2, reach: ['near', 'mid'], stance: true, stanceIdle: '黒疾風は構えを解かず、さらに低く身を沈めた。', tell: '目を細め、こちらの肩の動きを見ている ─ 大振りを見切る構え（深い）' },
    { id: 'act_m04s_idle', name: '様子見', w: 1, idle: true },
  ],
  parts: Object.fromEntries(Object.entries(base04.parts).map(([k, p]) => [k, { ...p, onBreak: { ...p.onBreak, disable: (p.onBreak.disable || []).map(x => x.replace('m04', 'm04s')) } }])),
  rewards: {
    hunt: [{ id: 'mat_m04s_hide', w: 40 }, { id: 'mat_m04s_claw', w: 22 }, { id: 'mat_m04s_plume', w: 18 }, { id: 'mat_m04s_venom', w: 10 }, { id: 'mat_m04s_eye', w: 10 }],
    capture: [{ id: 'mat_m04s_hide', w: 34 }, { id: 'mat_m04s_claw', w: 18 }, { id: 'mat_m04s_plume', w: 18 }, { id: 'mat_m04s_venom', w: 15 }, { id: 'mat_m04s_eye', w: 15 }],
    parts: { head: 'mat_m04s_plume', claws: 'mat_m04s_claw', tail: 'mat_m04s_hide' },
  },
  flee: { hpBelow: 0.25, chance: 0.3, once: true, text: '黒疾風のザルガは闇の奥へ走り去った！' },
}];

// マスター級の個体：これまでの6種の強い個体（研究は元の種に記録）。上位の形をもとに強くし、新しい行動を1つ持つ
const MASTER_EXTRA = {
  mon_m01: { from: 'mon_m01_hr', mats: ['mat_m01m_shell', 'mat_m01m_plate', 'mat_m01m_vein'], act: { id: 'act_m01m_shell', name: '苔の鎧', w: 2, harden: 2, tell: '背の苔が逆立ち、岩のように固まりはじめた ─ 身を固める気配' } },
  mon_m02: { from: 'mon_m02_hr', mats: ['mat_m02m_scale', 'mat_m02m_membrane', 'mat_m02m_sac'], act: { id: 'act_m02m_meteor', name: '炎の流星', w: 2, power: pw(50), weight: 3, wide: true, element: 'fire', reach: ['near', 'mid', 'far'], air: true, lands: true, moveTo: 'near', tell: '上空で炎をまとい、急に高度を上げた ─ 炎の流星の予兆', fatigue: 18 } },
  mon_m03: { from: 'mon_m03_hr', mats: ['mat_m03m_hide', 'mat_m03m_wart', 'mat_m03m_gland'], act: { id: 'act_m03m_flood', name: '毒の洪水', w: 2, power: pw(46), weight: 2, wide: true, ail: 'poison', reach: ['near', 'mid', 'far'], tell: '泥の中で全身の疣が膨れ上がった ─ 毒の洪水の予兆' } },
  mon_m04: { from: 'mon_m04', mats: ['mat_m04m_hide', 'mat_m04m_claw', 'mat_m04m_gem'], act: { id: 'act_m04m_blitz', name: '閃きの三連', w: 2, power: pw(48), weight: 3, reach: ['near', 'mid'], moveTo: 'near', tell: '姿がかすむほど低く構えた ─ 三連の予兆' } },
  mon_m05: { from: 'mon_m05', mats: ['mat_m05m_shell', 'mat_m05m_spike', 'mat_m05m_core'], act: { id: 'act_m05m_shield', name: '甲羅籠り', w: 2, harden: 2, tell: '甲羅の継ぎ目をきつく閉じはじめた ─ 籠る気配' } },
  mon_m06: { from: 'mon_m06', mats: ['mat_m06m_fur', 'mat_m06m_antler', 'mat_m06m_heart'], act: { id: 'act_m06m_storm2', name: '雷嵐', w: 2, power: pw(80), weight: 3, wide: true, element: 'thunder', reach: ['near', 'mid', 'far'], windup: 2, interrupt: 0.05, chargeText: 'ライゼンの角に、空じゅうの雷が集まっていく……', tell: '空が鳴り、角が白く燃えている ─ 雷嵐をためている（強く打てば止められる）', fatigue: 20 } },
};
const POOL = [...HIGH_VARIANTS, ...NEW_MONSTERS];
export const MASTER_VARIANTS = Object.entries(MASTER_EXTRA).map(([baseId, x]) => {
  const src = POOL.find(m => m.id === x.from);
  const [m1, m2, m3] = x.mats;
  return {
    ...src, id: `${baseId}_ms`, baseId, rank: 'master', alias: `${(src.alias || '').replace('（上位の個体）', '')}（マスター級の個体）`,
    hp: Math.round(src.hp * 1.5),
    acts: [...src.acts.map(a => (a.power ? { ...a, power: Math.round(a.power * 2.1 * Q / 7.4) } : a)), x.act],
    rewards: {
      hunt: [{ id: m1, w: 45 }, { id: m2, w: 35 }, { id: m3, w: 20 }],
      capture: [{ id: m1, w: 40 }, { id: m2, w: 30 }, { id: m3, w: 30 }],
      parts: Object.fromEntries(Object.keys(src.parts).map((k, i) => [k, [m2, m1, m2][i % 3]])),
    },
  };
});

// 強化個体（エンドコンテンツの入口・15章）：はじめから本気。希少素材を落とす
const m07 = MASTER_NEW[0];
export const EX_MONSTERS = [{
  ...m07, id: 'mon_m07_ex', baseId: 'mon_m07', rank: 'master', alias: '星根の守り竜（強化個体）', hp: Math.round(m07.hp * 1.5), startPhase: 2,
  acts: m07.acts.map(a => (a.power ? { ...a, power: Math.round(a.power * 1.25) } : a)),
  rewards: { hunt: [{ id: 'mat_ex_star', w: 30 }, { id: 'mat_m07_core', w: 35 }, { id: 'mat_m07_heart', w: 35 }], capture: [{ id: 'mat_ex_star', w: 100 }], parts: { head: 'mat_m07_horn', crystals: 'mat_ex_star', wings: 'mat_m07_scale', tail: 'mat_m07_scale' } },
}];

export const MASTER_MONSTERS = [...MASTER_NEW, ...MASTER_SUB, ...MASTER_VARIANTS, ...EX_MONSTERS];
export const MASTER_SPECIES = [...MASTER_NEW, ...MASTER_SUB];
