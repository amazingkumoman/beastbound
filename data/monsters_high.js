// 【ネタバレ注意】上位の大型（第11段階・50）。設計は docs/spec/secret/上位の大型.md。
// 報告・コミットの説明では、ここの中身に触れないこと（D-29）。
// 新しい決まり（engine）：stance=見切りの構え（大振りを見切って返す。軽い攻撃なら何もしない）／
//   windup=大技の溜め（溜めている間に強く打つと止まる。interrupt=止めるのに要る傷の割合）／
//   parts[].hidden=ふだん狙えない部位（expose の行動のあと、倒れたときだけ狙える）
import { MONSTERS } from './monsters.js';

const P = Number(globalThis.process?.env?.HP_POW || 4.0); // 上位の強さの倍率（試し打ちで調整）

export const NEW_MONSTERS = [
  {
    id: 'mon_m04', name: 'ザルガ', alias: '疾風の狩人', art: 'mon.m04', hp: 3400, startRange: 'mid', rank: 'high',
    lore: { kind: '走竜・廃都の狩人', habits: '朝から夕方まで、眠れる都の跡の大通りを走り回って獲物を追う。夜は崩れた塔の上で休む。',
      ecology: '細い脚と長い尾で、走りながら向きを変える。相手の大きな動きを見てからよけ、すれ違いざまに爪で裂く。',
      tips: '大振りは見切られる。構えを見たら、小さな攻撃でつなぐこと。龍の力がよく効く。', rage: '攻撃をかわされ続けると、気が立ってくる。' },
    body: { cut: 1.0, blunt: 0.9, pierce: 1.1, shot: 1.0 },
    elem: { fire: 1.0, water: 1.0, thunder: 1.0, ice: 0.8, dragon: 1.3 },
    parts: {
      head: { name: '頭', x: 30, y: 26, hpRatio: 0.15, z: { cut: 1.2, blunt: 1.3, pierce: 1.1, shot: 1.2 }, onBreak: { down: 1, text: '頭の飾り羽を断ち割った！ よろめいて転んだ。' } },
      claws: { name: '爪刃', x: 45, y: 62, hpRatio: 0.18, z: { cut: 1.25, blunt: 1.0, pierce: 1.0, shot: 0.9 }, onBreak: { down: 1, disable: ['act_m04_double'], text: '前脚の爪刃が折れた！ 二連の裂きができなくなった。' } },
      tail: { name: '尾', x: 86, y: 54, hpRatio: 0.13, z: { cut: 1.3, blunt: 0.9, pierce: 1.0, shot: 1.0 }, onBreak: { down: 1, disable: ['act_m04_whip'], text: '尾を断ち切った！ 走りの切り返しが鈍った。' } },
    },
    acts: [
      { id: 'act_m04_pounce', name: '跳びかかり', w: 3, power: 34 * P, weight: 2, reach: ['near', 'mid'], moveTo: 'near', tell: '身を沈め、後ろ脚に力をためた ─ 跳びかかりの予兆' },
      { id: 'act_m04_double', name: '二連の裂き', w: 2, power: 40 * P, weight: 2, reach: ['near'], tell: '両の爪を交差させた ─ 二連の裂きの予兆' },
      { id: 'act_m04_whip', name: '尾の一閃', w: 2, power: 32 * P, weight: 2, wide: true, reach: ['near', 'mid'], tell: '尾をしならせて振りかぶった ─ 一閃の予兆' },
      { id: 'act_m04_dash', name: '疾走', w: 2, power: 46 * P, weight: 3, unguardable: true, reach: ['near', 'mid', 'far'], moveTo: 'near', tell: '地面を蹴って大きく回りこんだ ─ 疾走の予兆', fatigue: 15 },
      { id: 'act_m04_stance', name: '見切りの構え', w: 3, power: 44 * P, weight: 2, reach: ['near', 'mid'], stance: true, stanceIdle: 'ザルガは構えを解き、低くうなった。', tell: '首を低くし、こちらの動きをじっと見ている ─ 大振りを見切る構え' },
      { id: 'act_m04_sidestep', name: '跳び退き', w: 1, move: 'far', moveText: 'ザルガは軽く跳んで距離を取った。（遠）', tell: '足を小刻みに鳴らしている' },
      { id: 'act_m04_frenzy', name: '狂い裂き', w: 2, power: 52 * P, weight: 3, wide: true, reach: ['near', 'mid'], rageOnly: true, tell: '全身の羽を逆立てた ─ 狂い裂きの予兆', fatigue: 18 },
      { id: 'act_m04_idle', name: '様子見', w: 1, idle: true },
    ],
    idleText: ['こちらの周りを、円を描くように歩いている。', '鋭く短く鳴いた。'],
    rage: { mult: 1.25, turns: [4, 6], damageGain: 150, breakGain: 20, adaptGain: 10 },
    fatigue: { threshold: 70, turns: [2, 3], recover: 40, mult: 0.8, text: '舌を出して荒い息をしている。足が止まりがちだ。' },
    adaptSpeed: 1.2, ailRes: { poison: 1.0, paralysis: 1.2, sleep: 1.0, bleed: 0.9, stun: 1.1 },
    flee: { hpBelow: 0.25, chance: 0.3, once: true, text: 'ザルガは身をひるがえし、廃都の奥へ走り去った！' },
    signs: [{ id: 'sg_m04_feather', when: { hpBelow: 0.6 }, text: '飾り羽がぼろぼろになっている。' }, { id: 'sg_m04_heavy', when: { hpBelow: 0.3 }, text: '走りに切れがなく、足を引きずっている。' }],
    capture: { hpBelow: 0.25, text: '何度も膝を折り、立ち上がるのがやっとだ。（捕まえられそうだ）' },
    rewards: {
      hunt: [{ id: 'mat_m04_hide', w: 40 }, { id: 'mat_m04_claw', w: 20 }, { id: 'mat_m04_plume', w: 20 }, { id: 'mat_m04_tendon', w: 10 }, { id: 'mat_m04_gem', w: 10 }],
      capture: [{ id: 'mat_m04_hide', w: 34 }, { id: 'mat_m04_claw', w: 18 }, { id: 'mat_m04_plume', w: 18 }, { id: 'mat_m04_tendon', w: 15 }, { id: 'mat_m04_gem', w: 15 }],
      parts: { head: 'mat_m04_plume', claws: 'mat_m04_claw', tail: 'mat_m04_tendon' },
    },
    observe: { dawn: '朝霧の大通りを、音もなく駆け抜けていった。', day: '崩れた柱の上から、獲物を探している。', dusk: '仕留めた獲物を前に、周りをしきりに見回している。', night: '塔の上で、片目を開けたまま休んでいる。' },
  },
  {
    id: 'mon_m05', name: 'オルドゥム', alias: '甲山の古獣', art: 'mon.m05', hp: 3800, startRange: 'mid', rank: 'high',
    lore: { kind: '巨甲獣・廃都の主', habits: '夜、眠れる都の大広間に現れ、石畳ごと苔をはがして食べる。昼は都の地下で眠っている。',
      ecology: '山のような甲羅に守られ、ふつうの攻撃はほとんど通らない。大きな一撃のあと、甲羅の継ぎ目の奥の光る核がのぞく。',
      tips: '甲羅を叩いても効き目は薄い。大技のあとに核が見えたら、そこを狙うこと。雷の力がよく効く。', rage: '核を傷つけられると怒りやすい。' },
    body: { cut: 0.45, blunt: 0.55, pierce: 0.5, shot: 0.45 },
    elem: { fire: 0.8, water: 0.8, thunder: 1.3, ice: 1.0, dragon: 1.0 },
    exposeText: '甲羅の継ぎ目が開き、奥の光る核がのぞいた！（核を狙える）',
    hideText: 'オルドゥムは身を縮め、核を甲羅の奥に隠した。',
    parts: {
      core: { name: '核', x: 50, y: 40, hpRatio: 0.22, hidden: true, z: { cut: 1.9, blunt: 1.9, pierce: 2.0, shot: 1.9 }, onBreak: { down: 2, text: '光る核にひびが走った！ 巨体が崩れ落ちた。' } },
      spikes: { name: '甲羅の棘', x: 30, y: 16, hpRatio: 0.18, z: { cut: 0.7, blunt: 0.9, pierce: 0.7, shot: 0.7 }, onBreak: { down: 1, disable: ['act_m05_avalanche'], text: '甲羅の棘が砕け落ちた！ 岩を降らせることができなくなった。' } },
      legs: { name: '脚', x: 70, y: 82, hpRatio: 0.2, z: { cut: 1.0, blunt: 1.0, pierce: 1.0, shot: 0.8 }, onBreak: { down: 1, disable: ['act_m05_charge'], text: '脚の甲殻が割れた！ 体当たりができなくなった。' } },
    },
    acts: [
      { id: 'act_m05_stomp', name: '踏み鳴らし', w: 3, power: 40 * P, weight: 3, wide: true, reach: ['near', 'mid'], tell: '前脚をゆっくり持ち上げた ─ 踏み鳴らしの予兆' },
      { id: 'act_m05_charge', name: '甲羅の体当たり', w: 2, power: 56 * P, weight: 3, unguardable: true, reach: ['near', 'mid', 'far'], moveTo: 'near', tell: '甲羅を前に傾け、地面が震えだした ─ 体当たりの予兆', fatigue: 20 },
      { id: 'act_m05_avalanche', name: '岩なだれ', w: 2, power: 38 * P, weight: 2, wide: true, reach: ['mid', 'far'], tell: '甲羅を大きく揺すった。棘の上の岩がぐらついている ─ 岩なだれの予兆' },
      { id: 'act_m05_maw', name: '大口の吸い込み', w: 2, power: 30 * P, weight: 1, reach: ['mid', 'far'], moveTo: 'near', tell: '大きく口を開け、息を吸い込みはじめた ─ 吸い込みの予兆' },
      { id: 'act_m05_slam', name: '地割れの一撃', w: 3, power: 60 * P, weight: 3, reach: ['near', 'mid'], expose: 2, tell: '甲羅ごと体を高く持ち上げた ─ 地割れの一撃の予兆', fatigue: 15 },
      { id: 'act_m05_quake', name: '大地震', w: 2, power: 58 * P, weight: 3, wide: true, reach: ['near', 'mid', 'far'], rageOnly: true, expose: 1, tell: '核の光が甲羅の隙間からあふれている ─ 大地震の予兆', fatigue: 20 },
      { id: 'act_m05_idle', name: '様子見', w: 2, idle: true },
    ],
    idleText: ['地鳴りのような息をついた。', '石畳を前脚でゆっくりとはがしている。'],
    rage: { mult: 1.2, turns: [4, 6], damageGain: 120, breakGain: 30, adaptGain: 5 },
    fatigue: { threshold: 70, turns: [2, 3], recover: 40, mult: 0.8, text: '甲羅を地面につけ、重い息をしている。' },
    adaptSpeed: 0.6, ailRes: { poison: 1.2, paralysis: 1.3, sleep: 0.9, bleed: 1.5, stun: 1.2 },
    flee: { hpBelow: 0.2, chance: 0.2, once: true, text: 'オルドゥムは地面を割り、都の地下へ沈んでいった！' },
    signs: [{ id: 'sg_m05_crack', when: { hpBelow: 0.6 }, text: '甲羅のあちこちにひびが走っている。' }, { id: 'sg_m05_dim', when: { hpBelow: 0.3 }, text: '核の光が弱く、またたいている。' }],
    capture: { hpBelow: 0.25, text: '核の光が消えかけ、巨体が地面に伏せている。（捕まえられそうだ）' },
    rewards: {
      hunt: [{ id: 'mat_m05_shell', w: 40 }, { id: 'mat_m05_spike', w: 20 }, { id: 'mat_m05_plate', w: 20 }, { id: 'mat_m05_marrow', w: 10 }, { id: 'mat_m05_core', w: 10 }],
      capture: [{ id: 'mat_m05_shell', w: 34 }, { id: 'mat_m05_spike', w: 18 }, { id: 'mat_m05_plate', w: 18 }, { id: 'mat_m05_marrow', w: 15 }, { id: 'mat_m05_core', w: 15 }],
      parts: { core: 'mat_m05_core', spikes: 'mat_m05_spike', legs: 'mat_m05_plate' },
    },
    observe: { dawn: '地下への大穴の奥から、地鳴りが響いてくる。', day: '地下で眠っているらしい。足元がときどき揺れる。', dusk: '大広間の石畳が、内側から持ち上がりはじめた。', night: '大広間で石畳ごと苔をはがし、ゆっくりと食べている。' },
  },
  {
    id: 'mon_m06', name: 'ライゼン', alias: '雷角の大鹿', art: 'mon.m06', hp: 3500, startRange: 'mid', rank: 'high',
    lore: { kind: '獣・尾根の主', habits: '昼、凍てつく尾根の頂で角に雷を集める。夜は風の当たらない岩陰で群れの見張りをする。',
      ecology: '大きな角で空の雷を受け止め、体にため込む。ためた力を一度に放つ大技は、ためている間に強く打たれると崩れる。',
      tips: '角が光り始めたら、ためている間に強い攻撃を重ねて止めること。氷の力がよく効く。', rage: '角を傷つけられると怒りやすい。' },
    body: { cut: 1.0, blunt: 1.0, pierce: 1.0, shot: 1.0 },
    elem: { fire: 1.0, water: 0.9, thunder: 0.3, ice: 1.3, dragon: 1.0 },
    parts: {
      antlers: { name: '角', x: 36, y: 10, hpRatio: 0.16, z: { cut: 1.1, blunt: 1.35, pierce: 1.0, shot: 1.2 }, onBreak: { down: 2, disable: ['act_m06_storm'], text: '雷の角が根元から折れた！ もう大きな雷は呼べないようだ。' } },
      neck: { name: '首', x: 40, y: 40, hpRatio: 0.16, z: { cut: 1.25, blunt: 1.0, pierce: 1.2, shot: 1.1 }, onBreak: { down: 1, text: '首の毛皮を深く裂いた！ 大きくのけぞった。' } },
      legs: { name: '脚', x: 60, y: 80, hpRatio: 0.18, z: { cut: 1.1, blunt: 1.1, pierce: 1.0, shot: 0.9 }, onBreak: { down: 1, disable: ['act_m06_leap'], text: '後ろ脚を痛めた！ 跳ぶことができなくなった。' } },
    },
    acts: [
      { id: 'act_m06_gore', name: '角突き', w: 3, power: 36 * P, weight: 2, reach: ['near'], tell: '角を下げて地面をかいた ─ 角突きの予兆' },
      { id: 'act_m06_kick', name: '蹴り上げ', w: 2, power: 32 * P, weight: 2, reach: ['near'], tell: '後ろへ体重を移した ─ 蹴り上げの予兆' },
      { id: 'act_m06_bolt', name: '雷の角', w: 2, power: 34 * P, weight: 2, wide: true, element: 'thunder', reach: ['mid', 'far'], tell: '角の間に青白い光が走った ─ 雷の予兆' },
      { id: 'act_m06_spark', name: '放電', w: 2, power: 26 * P, weight: 1, wide: true, element: 'thunder', ail: 'paralysis', reach: ['near', 'mid'], tell: '体毛が逆立ち、ぱちぱちと音がしている ─ 放電の予兆' },
      { id: 'act_m06_storm', name: '落雷', w: 2, power: 70 * P, weight: 3, wide: true, element: 'thunder', reach: ['near', 'mid', 'far'], windup: 2, interrupt: 0.06, chargeText: 'ライゼンは角を天に掲げ、雷を呼び集めている……', interruptText: '角に集めた雷が散った！ ライゼンは大きく体勢を崩した。', tell: '角が激しく光っている ─ 落雷をためている（強く打てば止められる）', fatigue: 20 },
      { id: 'act_m06_leap', name: '跳び退き', w: 1, move: 'far', moveText: 'ライゼンは高く跳んで、離れた岩の上に降りた。（遠）', tell: '後ろ脚をたわめた' },
      { id: 'act_m06_rush', name: '突進', w: 2, power: 48 * P, weight: 3, unguardable: true, reach: ['near', 'mid', 'far'], moveTo: 'near', rageOnly: true, tell: '頭を低くし、全身に雷をまとった ─ 突進の予兆', fatigue: 18 },
      { id: 'act_m06_idle', name: '様子見', w: 2, idle: true },
    ],
    idleText: ['高く澄んだ声で鳴いた。', '角を振って、雪を払っている。'],
    rage: { mult: 1.2, turns: [4, 6], damageGain: 150, breakGain: 25, adaptGain: 10 },
    fatigue: { threshold: 70, turns: [2, 3], recover: 40, mult: 0.8, text: '角の光が消え、息が白く荒い。' },
    adaptSpeed: 1.0, ailRes: { poison: 1.0, paralysis: 2.0, sleep: 1.0, bleed: 1.0, stun: 1.0 },
    flee: { hpBelow: 0.25, chance: 0.25, once: true, text: 'ライゼンは雪煙を上げて、尾根の向こうへ駆け去った！' },
    signs: [{ id: 'sg_m06_fur', when: { hpBelow: 0.6 }, text: '白い毛皮が赤く汚れている。' }, { id: 'sg_m06_heavy', when: { hpBelow: 0.3 }, text: '角の光が弱々しく、足元がふらついている。' }],
    capture: { hpBelow: 0.25, text: '雪の上に膝をつき、角を重そうに垂れている。（捕まえられそうだ）' },
    rewards: {
      hunt: [{ id: 'mat_m06_fur', w: 40 }, { id: 'mat_m06_antler', w: 20 }, { id: 'mat_m06_hoof', w: 20 }, { id: 'mat_m06_spark', w: 10 }, { id: 'mat_m06_heart', w: 10 }],
      capture: [{ id: 'mat_m06_fur', w: 34 }, { id: 'mat_m06_antler', w: 18 }, { id: 'mat_m06_hoof', w: 18 }, { id: 'mat_m06_spark', w: 15 }, { id: 'mat_m06_heart', w: 15 }],
      parts: { antlers: 'mat_m06_antler', neck: 'mat_m06_fur', legs: 'mat_m06_hoof' },
    },
    observe: { dawn: '尾根の雪の上を、ゆっくり歩いている。', day: '頂で角を天に向け、雷を待っている。', dusk: '角の光を残したまま、岩陰へ下りていく。', night: '岩陰で、角を低くして辺りを見張っている。' },
  },
  {
    id: 'mon_m02s', name: '氷翼のヴェルカ', alias: '縞翼竜の特殊個体', art: 'mon.m02s', hp: 3600, startRange: 'far', rank: 'high', subOf: 'mon_m02',
    lore: { kind: '飛竜・特殊個体', habits: '夜の凍てつく尾根だけに現れる。昼は氷の洞にこもっている。',
      ecology: '火炎袋のかわりに冷気をためる袋を持つ。ふつうの縞翼竜より長く空にとどまり、上から氷を降らせる。',
      tips: '空にいる時間が長い。遠くから届く攻撃で翼を狙うこと。火の力がよく効く。', rage: '翼を傷つけられると怒りやすい。' },
    body: { cut: 1.0, blunt: 0.9, pierce: 1.0, shot: 1.1 },
    elem: { fire: 1.3, water: 0.9, thunder: 1.0, ice: 0.3, dragon: 1.0 },
    parts: {
      head: { name: 'とさか', x: 40, y: 12, hpRatio: 0.15, z: { cut: 1.25, blunt: 1.3, pierce: 1.1, shot: 1.2 }, onBreak: { down: 1, text: '氷のとさかが砕けた！' } },
      wings: { name: '翼', x: 16, y: 40, hpRatio: 0.2, z: { cut: 1.3, blunt: 0.8, pierce: 1.1, shot: 1.35 }, onBreak: { down: 2, disable: ['act_m02s_fly'], ground: true, text: '凍った翼膜が割れた！ 地面に叩きつけられた。もう飛べないようだ。' } },
      tail: { name: '尾', x: 86, y: 86, hpRatio: 0.12, z: { cut: 1.3, blunt: 0.9, pierce: 1.0, shot: 1.0 }, onBreak: { down: 1, disable: ['act_m02s_tail'], text: '尾の先を断ち切った！' } },
    },
    acts: [
      { id: 'act_m02s_claw', name: '翼爪の引っかき', w: 2, power: 36 * P, weight: 2, reach: ['near', 'mid'], tell: '翼の爪を高く掲げた ─ 引っかきの予兆' },
      { id: 'act_m02s_tail', name: '尾の薙ぎ', w: 2, power: 34 * P, weight: 2, reach: ['near', 'mid'], tell: '体をひねり、尾を振りかぶった ─ 薙ぎの予兆' },
      { id: 'act_m02s_breath', name: '冷気の息', w: 2, power: 36 * P, weight: 2, wide: true, element: 'ice', ail: 'paralysis', reach: ['near', 'mid'], tell: '喉の奥が青白く光った ─ 冷気の予兆（凍えて動けなくなる）' },
      { id: 'act_m02s_fly', name: '飛び上がる', w: 2, move: 'far', takeoff: true, moveText: '氷翼のヴェルカは音もなく舞い上がった！（遠）', tell: '翼を大きく広げ、身を沈めた ─ 飛び上がる気配' },
      { id: 'act_m02s_shards', name: '氷の雨', w: 3, power: 34 * P, weight: 2, wide: true, element: 'ice', reach: ['mid', 'far'], air: true, tell: '上空で翼を震わせ、氷のかけらを散らしはじめた ─ 氷の雨の予兆' },
      { id: 'act_m02s_dive', name: '急降下', w: 2, power: 52 * P, weight: 3, unguardable: true, reach: ['near', 'mid', 'far'], air: true, lands: true, moveTo: 'near', tell: '上空で翼をたたんだ ─ 急降下の予兆', fatigue: 18 },
      { id: 'act_m02s_hover', name: '空の見切り', w: 2, power: 40 * P, weight: 2, reach: ['mid', 'far'], air: true, stance: true, stanceIdle: '氷翼のヴェルカは空中でじっと様子をうかがっている。', tell: '空中で静止し、こちらを見下ろしている ─ 大振りを見切る構え' },
      { id: 'act_m02s_land', name: '着地', w: 2, move: 'mid', air: true, land: true, moveText: '氷翼のヴェルカは地面へ降り立った。（中）', tell: '高度を下げ、足を前に出した ─ 降りてくる気配' },
      { id: 'act_m02s_idle', name: '様子見', w: 1, idle: true },
    ],
    idleText: ['冷たい息を白く吐いた。', '首をかしげ、こちらをうかがっている。'],
    rage: { mult: 1.25, turns: [4, 6], damageGain: 160, breakGain: 25, adaptGain: 10 },
    fatigue: { threshold: 70, turns: [2, 3], recover: 40, mult: 0.8, text: '翼が霜で重そうだ。羽ばたきが鈍い。' },
    adaptSpeed: 1.1, ailRes: { poison: 1.0, paralysis: 1.0, sleep: 1.0, bleed: 0.9, stun: 1.1 },
    flee: { hpBelow: 0.28, chance: 0.3, once: true, text: '氷翼のヴェルカは夜空へ飛び去った！' },
    signs: [{ id: 'sg_m02s_frost', when: { hpBelow: 0.6 }, text: '翼の霜がはがれ落ちている。' }, { id: 'sg_m02s_heavy', when: { hpBelow: 0.3 }, text: '羽ばたきが乱れ、高く飛べないでいる。' }],
    capture: { hpBelow: 0.25, text: '翼を引きずり、雪に首を垂れている。（捕まえられそうだ）' },
    rewards: {
      hunt: [{ id: 'mat_m02s_scale', w: 40 }, { id: 'mat_m02s_membrane', w: 20 }, { id: 'mat_m02s_spine', w: 20 }, { id: 'mat_m02s_crest', w: 10 }, { id: 'mat_m02s_sac', w: 10 }],
      capture: [{ id: 'mat_m02s_scale', w: 34 }, { id: 'mat_m02s_membrane', w: 18 }, { id: 'mat_m02s_spine', w: 18 }, { id: 'mat_m02s_crest', w: 15 }, { id: 'mat_m02s_sac', w: 15 }],
      parts: { head: 'mat_m02s_crest', wings: 'mat_m02s_membrane', tail: 'mat_m02s_spine' },
    },
    observe: { dawn: '氷の洞へ戻っていく、青白い翼が見えた。', day: '氷の洞の奥で眠っているらしい。', dusk: '洞の入口で、翼の霜を落としている。', night: '月明かりの下、尾根の上空を音もなく旋回している。' },
  },
];

// 種ごとの強さの調整（試し打ち）と、数を整数にそろえる
const TUNE = { mon_m05: 0.85, mon_m06: 1.45, mon_m02s: 0.85 };
for (const m of NEW_MONSTERS) m.acts = m.acts.map(a => (a.power ? { ...a, power: Math.round(a.power * (TUNE[m.id] ?? 1)) } : a));

// 今の3種の上位の個体：同じ種（研究は同じ記録）。強く、新しい行動を持ち、上位の素材を落とす
const HIGH_EXTRA = {
  mon_m01: { hpMul: 1.9, powMul: 2.6, mats: ['mat_m01h_shell', 'mat_m01h_horn', 'mat_m01h_plate', 'mat_m01h_vein'],
    acts: [{ id: 'act_m01h_boulder', name: '大岩転がし', w: 2, power: 100, weight: 3, wide: true, reach: ['mid', 'far'], tell: '尾槌で大岩を抱え込んだ ─ 大岩転がしの予兆', fatigue: 15 }] },
  mon_m02: { hpMul: 1.6, powMul: 1.6, mats: ['mat_m02h_scale', 'mat_m02h_membrane', 'mat_m02h_spine', 'mat_m02h_sac'],
    acts: [{ id: 'act_m02h_firerain', name: '火の雨', w: 2, power: 150, weight: 2, wide: true, element: 'fire', reach: ['mid', 'far'], air: true, tell: '上空で炎を散らしはじめた ─ 火の雨の予兆' }] },
  mon_m03: { hpMul: 1.5, powMul: 1.5, mats: ['mat_m03h_hide', 'mat_m03h_wart', 'mat_m03h_fang', 'mat_m03h_gland'],
    acts: [{ id: 'act_m03h_read', name: '読み', w: 2, power: 150, weight: 2, reach: ['near', 'mid'], stance: true, stanceIdle: 'グルボアは目を細め、構えを解いた。', tell: 'じっとこちらの手元を見つめている ─ 大振りを見切る構え' }] },
};
export const HIGH_VARIANTS = MONSTERS.map(base => {
  const x = HIGH_EXTRA[base.id];
  const [m1, m2, m3, m4] = x.mats;
  return {
    ...base, id: `${base.id}_hr`, baseId: base.id, rank: 'high', alias: `${base.alias}（上位の個体）`,
    hp: Math.round(base.hp * x.hpMul),
    acts: [...base.acts.map(a => (a.power ? { ...a, power: Math.round(a.power * x.powMul * P / 2.8) } : a)), ...x.acts.map(a => ({ ...a, power: Math.round(a.power * P / 2.8) }))],
    rewards: {
      hunt: [{ id: m1, w: 40 }, { id: m2, w: 22 }, { id: m3, w: 22 }, { id: m4, w: 16 }],
      capture: [{ id: m1, w: 34 }, { id: m2, w: 20 }, { id: m3, w: 20 }, { id: m4, w: 26 }],
      parts: Object.fromEntries(Object.keys(base.parts).map((k, i) => [k, [m2, m3, m1][i % 3]])),
    },
  };
});
export const HIGH_MONSTERS = [...NEW_MONSTERS, ...HIGH_VARIANTS];
/** 図鑑・物語で数える「種」（上位の個体は元の種に数える） */
export const SPECIES_HIGH = [...MONSTERS, ...NEW_MONSTERS];
