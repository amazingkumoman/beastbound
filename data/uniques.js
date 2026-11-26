// 固有スキルの効果（2026-11-26 ユーザー：「固有スキルのわりに特殊効果じゃないんですね」→ そのモンスターらしい特別な効果にする）。
// 防具データの unique.name でここを引く。v は [下位, 上位, マスター級] の強さ（同じ名前の固有スキルは、防具のランクで強くなる）。
// fx は戦闘エンジンが読む名前（engine.js の fx()）。説明 desc はゲームに出す文。
const pct = v => `${Math.round(v * 100)}%`;

export const UNIQUES = {
  苔岩の背: { fx: 'guardCut', v: [0.15, 0.25, 0.35], desc: v => `防御して攻撃を受けたときのダメージ −${pct(v)}` },
  縞翼の目: { fx: 'dodgeNextAtk', v: [0.15, 0.25, 0.35], desc: v => `攻撃をかわした次の攻撃の威力 +${pct(v)}` },
  沼主の知恵: { fx: 'ailedTargetAtk', v: [0.10, 0.15, 0.20], desc: v => `モンスターが状態異常の間、攻撃の威力 +${pct(v)}` },
  砂潜りの皮: { fx: 'firstHitCut', v: [0.5, 0.6, 0.7], desc: v => `戦いで最初に受けるダメージ −${pct(v)}` },
  豪腕の拳: { fx: 'heavyStun', v: [8, 12, 16], desc: v => `重い攻撃・技が当たると、気絶が少し溜まる（${v}）` },
  鎧角の甲: { fx: 'openingCut', v: [0.25, 0.35, 0.45], desc: v => `隙を突かれたときのダメージ −${pct(v)}` },
  大蛇の目: { fx: 'noDrift', v: [1, 1, 1], desc: () => '狙った部位から攻撃がそれない' },
  疾風の脚: { fx: 'dodgeStGain', v: [6, 8, 10], desc: v => `攻撃をかわすと、気力がさらに ${v} 戻る` },
  古獣の甲: { fx: 'lowHpCut', v: [0.15, 0.18, 0.22], desc: v => `体力が3割を切ると、受けるダメージ −${pct(v)}` },
  雷角の冠: { fx: 'elemPara', v: [6, 8, 10], desc: v => `属性の攻撃が当たると、麻痺が少し溜まる（${v}）` },
  氷翼の眼: { fx: 'interruptEase', v: [0.30, 0.35, 0.40], desc: v => `大技の溜めを崩しやすい（必要な量 −${pct(v)}）` },
  嵐呼びの翼: { fx: 'moveNextAtk', v: [0.20, 0.25, 0.30], desc: v => `間合いを動いた次の攻撃の威力 +${pct(v)}` },
  凍河の鱗: { fx: 'elemHitSt', v: [10, 12, 15], desc: v => `属性の攻撃を受けると、気力が ${v} 戻る` },
  大蜘蛛の眼: { fx: 'slowHit', v: [6, 8, 10], desc: v => `攻撃が当たると、鈍足が少し溜まる（${v}）` },
  菌獣の根: { fx: 'hpRegen', v: [2, 3, 4], desc: v => `ターンの終わりに体力が ${v} 戻る` },
  守り竜の加護: { fx: 'guts', v: [1, 1, 1], desc: () => '戦いで一度だけ、倒れるほどの攻撃を体力1で耐える' },
  晶殻の守り: { fx: 'reflect', v: [0.3, 0.4, 0.5], desc: v => `完全に受け止めると、受けた攻撃の ${pct(v)} をはね返す` },
  黒疾風の牙: { fx: 'poisonHit', v: [6, 8, 10], desc: v => `攻撃が当たると、毒が少し溜まる（${v}）` },
  三つ首の執念: { fx: 'ailLonger', v: [1, 1, 1], desc: () => 'モンスターの状態異常が1ターン長く続く' },
  天鯨の歌: { fx: 'itemBoost', v: [0.3, 0.4, 0.5], desc: v => `回復の道具の効き目 +${pct(v)}` },
  影の衣: { fx: 'shadowDodge', v: [0.10, 0.12, 0.15], desc: v => `モンスターの攻撃を ${pct(v)} の確率で影がかわす` },
  熔核の熱: { fx: 'lowHpAtk', v: [0.15, 0.20, 0.25], desc: v => `体力が半分を切ると、攻撃の威力 +${pct(v)}` },
  星の涙の加護: { fx: 'weakSt', v: [4, 5, 6], desc: v => `よく効く所に当てると、気力が ${v} 戻る` },
  金剛の肌: { fx: 'noBreak', v: [1, 1, 1], desc: () => '防御を崩されない（崩されるときも押し込まれるだけ）' },
  見通しの兜: { fx: 'noDrift', v: [1, 1, 1], desc: () => '狙った部位から攻撃がそれない' }, // 開発用の防具
};

const RANK_I = { high: 1, master: 2 };
/** 防具1つの固有スキル → { name, fx, v, text } */
export function uniqueOf(piece) {
  const u = piece?.unique; if (!u) return null;
  const d = UNIQUES[u.name]; if (!d) return { name: u.name, fx: null, v: 0, text: '' };
  const v = d.v[RANK_I[piece.rank] ?? 0];
  return { name: u.name, fx: d.fx, v, text: d.desc(v) };
}
