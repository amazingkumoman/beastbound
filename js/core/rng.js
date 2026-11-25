// 種（シード）つき乱数。同じ種なら同じ並びになる（テストと不具合の再現のため）。
// 12 システム構成図 1章。

/** 文字列や数から 32bit の種を作る */
export function seedFrom(value) {
  const s = String(value);
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

/** 乱数の作り手。状態（state）を持ち出せるので、保存・再現ができる */
export function createRng(seed) {
  let state = (typeof seed === 'number' ? seed : seedFrom(seed)) >>> 0;
  function next() { // mulberry32
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  return {
    next,
    /** min 以上 max 未満の小数 */
    range: (min, max) => min + next() * (max - min),
    /** min 以上 max 以下の整数 */
    int: (min, max) => min + Math.floor(next() * (max - min + 1)),
    /** 確率 p（0〜1）で true */
    chance: p => next() < p,
    /** 重みつきで1つ選ぶ。items は { w: 数 } を持つ */
    weighted(items) {
      const total = items.reduce((s, it) => s + it.w, 0);
      let r = next() * total;
      for (const it of items) { r -= it.w; if (r < 0) return it; }
      return items[items.length - 1];
    },
    getState: () => state,
  };
}
