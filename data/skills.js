// スキルの一覧（22b 3章・2026-11-25 承認。数字は最初の基準）。
// levels[n-1] が Lv n の効き目。mod は戦闘エンジンが読む「補正の名前」。
// 点数の段階：3点でLv1、6点でLv2、10点でLv3、15点でLv4、21点でLv5（SKILL_THRESHOLDS）。

export const SKILL_THRESHOLDS = [3, 6, 10, 15, 21]; // 2026-11-26 上限をLv5へ（ユーザー：「レベル上限をもっとあげれませんか」）
export const SKILL_MAX = 5; // スキルLvの上限（スキル点のLv＋セットボーナスのLvを足しても、ここまで。スキルごとの段の数でも止まる：状態異常耐性・見極め・採取上手はLv3まで）

export const SKILLS = [
  { id: 'skl_attack', name: '攻め上手', group: '攻め', mod: 'atkMult', levels: [0.05, 0.10, 0.15, 0.20, 0.25], desc: v => `攻撃力 +${pct(v)}` },
  { id: 'skl_weakness', name: '弱点特化', group: '攻め', mod: 'weakMult', levels: [0.10, 0.20, 0.30, 0.40, 0.50], desc: v => `よく効く所への攻撃 +${pct(v)}` },
  { id: 'skl_breaker', name: '部位破壊', group: '攻め', mod: 'partMult', levels: [0.15, 0.30, 0.50, 0.65, 0.80], desc: v => `部位への効き +${pct(v)}` },
  { id: 'skl_heavy', name: '渾身', group: '攻め', mod: 'heavyMult', levels: [0.05, 0.10, 0.15, 0.20, 0.25], desc: v => `重い攻撃・技の威力 +${pct(v)}` },
  { id: 'skl_multihit', name: '連撃', group: '攻め', mod: 'multiHitMult', levels: [0.05, 0.10, 0.15, 0.20, 0.25], desc: v => `2回以上当てる攻撃の威力 +${pct(v)}` },
  { id: 'skl_element', name: '属性攻撃', group: '攻め', mod: 'elemMult', levels: [0.10, 0.20, 0.30, 0.40, 0.50], desc: v => `属性の威力 +${pct(v)}` },
  { id: 'skl_ailment', name: '状態異常攻撃', group: '攻め', mod: 'ailMult', levels: [0.15, 0.30, 0.50, 0.65, 0.80], desc: v => `状態異常の溜まり方 +${pct(v)}` },
  { id: 'skl_defense', name: '守り', group: '守り', mod: 'defAdd', levels: [10, 20, 30, 40, 50], desc: v => `守り +${v}` },
  { id: 'skl_vitality', name: '体力', group: '守り', mod: 'hpAdd', levels: [10, 20, 30, 40, 50], desc: v => `最大体力 +${v}` },
  { id: 'skl_guard', name: '防御上手', group: '守り', mod: 'guardSkill', levels: [1, 2, 3, 4, 5], desc: v => (v >= 5 ? '防御の強さ +1・押されたときの気力の減り −15・防御を崩されない' : v >= 3 ? `防御の強さ +1・押されたときの気力の減り −${v >= 4 ? 15 : 10}` : `押されたときの気力の減り −${v * 5}`) },
  { id: 'skl_evade', name: '回避上手', group: '守り', mod: 'dodgeStReduce', levels: [3, 6, 9, 11, 12], desc: v => `回避の気力 −${v}` },
  { id: 'skl_resist', name: '属性耐性', group: '守り', mod: 'resistAdd', levels: [10, 20, 30, 40, 50], desc: v => `属性の耐性 +${v}` },
  { id: 'skl_ailresist', name: '状態異常耐性', group: '守り', mod: 'ailResist', levels: [1, 2, 3], desc: v => ['状態異常の長さ −1ターン', '状態異常の長さ 半分', '状態異常にかからない'][v - 1] },
  { id: 'skl_stamina', name: '気力', group: '気力', mod: 'stAdd', levels: [10, 20, 30, 40, 50], desc: v => `最大気力 +${v}` },
  { id: 'skl_regen', name: '気力回復', group: '気力', mod: 'stRegenAdd', levels: [2, 4, 6, 8, 10], desc: v => `ターンの終わりの気力 +${v}` },
  { id: 'skl_chance', name: '好機', group: '戦術', mod: 'chanceAdd', levels: [0.10, 0.20, 0.30, 0.40, 0.50], desc: v => `好機の威力 +${pct(v)}` },
  { id: 'skl_counter', name: '反撃', group: '戦術', mod: 'counterMult', levels: [0.15, 0.30, 0.50, 0.65, 0.80], desc: v => `反撃・斬り返しの威力 +${pct(v)}` },
  { id: 'skl_unread', name: '読まれにくい', group: '戦術', mod: 'adaptSlow', levels: [0.20, 0.40, 0.60, 0.70, 0.80], desc: v => `モンスターの適応の溜まり方 −${pct(v)}` },
  { id: 'skl_insight', name: '見極め', group: '戦術', mod: 'insight', levels: [1, 2, 3], desc: v => ['弱りの兆候が早めに出る', '＋捕獲できる兆候に気づく', '＋部位破壊の兆候が分かる'][v - 1] },
  { id: 'skl_gather', name: '採取上手', group: '探索', mod: 'gatherAdd', levels: [0, 1, 2], desc: v => (v ? `探索の行動回数 +${v}` : '（Lv2から効く）') },
];

function pct(v) { return `${Math.round(v * 100)}%`; }

export const ELEMENTS = [ // 6-3・22b 2章
  { id: 'fire', name: '火' }, { id: 'water', name: '水' }, { id: 'thunder', name: '雷' },
  { id: 'ice', name: '氷' }, { id: 'dragon', name: '龍' },
];
