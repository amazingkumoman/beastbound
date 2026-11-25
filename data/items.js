// アイテム・食事・お金・レアリティ（24b・2026-11-25 承認。数字は最初の基準）。
// 項目：price 値段 / max 1種類ごとに持ち込める上限 / heal 体力 / st 気力 / cure 治す状態異常
//       free ターンを使わない / capture 捕獲具 / throw 投げて当てる（小さなダメージ・どの間合いからも届く）

export const MONEY = 'ルク';          // Q-02（2026-11-25 決定）
export const POUCH_SLOTS = 8;         // ポーチは8種類まで（P-08）
export const ITEM_BOX_MAX = 99;       // 拠点に置いておける1種類の数

export const ITEMS = [
  { id: 'itm_potion', name: '回復薬', price: 30, max: 10, heal: 40, desc: '体力を40回復・ターンを使う' },
  { id: 'itm_mega_potion', name: '上回復薬', price: 80, max: 5, heal: 70, desc: '体力を70回復・ターンを使う' },
  { id: 'itm_antidote', name: '解毒薬', price: 40, max: 5, cure: ['poison', 'bleed'], desc: '毒・出血を治す・ターンを使う' },
  { id: 'itm_wakeup', name: '気付け薬', price: 60, max: 3, cure: ['paralysis'], free: true, desc: '麻痺を治す・ターンを使わない' },
  { id: 'itm_stamina', name: '気力薬', price: 50, max: 5, st: 50, desc: '気力を50回復・ターンを使う' },
  { id: 'itm_trap', name: '捕獲具', price: 150, max: 2, capture: true, desc: '弱った獲物を捕まえる（早すぎると失敗）・ターンを使う' },
  { id: 'itm_knife', name: '投げナイフ', price: 10, max: 10, throw: 14, desc: '小さな傷を与える・どの間合いからも届く・ターンを使う' },
];

export const FOODS = [ // 1回の狩りのあいだ（P-11）。料理の名前は仮
  { id: 'food_meat', name: '焼き肉の盛り合わせ', price: 80, mods: { hpAdd: 20 }, desc: '最大体力 +20' },
  { id: 'food_stew', name: '根菜の煮込み', price: 60, mods: { stAdd: 20 }, desc: '最大気力 +20' },
  { id: 'food_herb', name: '香草焼き', price: 100, mods: { atkMult: 0.05 }, desc: '攻撃力 +5%' },
  { id: 'food_soup', name: '豆と干し魚の汁', price: 50, mods: { defAdd: 15 }, desc: '守り +15' },
];

export const RARITY = [ // Q-05（2026-11-25 決定）：色で示す。数字はレアリティ 1〜5
  { lv: 1, name: '白', color: '#e9e4d8' },
  { lv: 2, name: '緑', color: '#7fcf7a' },
  { lv: 3, name: '青', color: '#6fa8ef' },
  { lv: 4, name: '紫', color: '#b78af0' },
  { lv: 5, name: '金', color: '#f2c14e' },
];
export const SELL_PER_RARITY = 10;   // 素材の売値 = レアリティ × 10
export const SELL_WARN_RARITY = 3;   // これ以上は売る前に注意を出す

/** はじめて第7段階の記録を開いたときに渡すもの（仮：第9段階の物語で見直す） */
export const STARTER = { money: 300, items: { itm_potion: 5, itm_knife: 5 } };
