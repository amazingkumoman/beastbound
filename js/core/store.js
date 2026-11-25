// ゲーム状態の入れ物（ひとつだけ）。変更は update() を通し、変わったら知らせる。
// 12 システム構成図 2章「土台の層」。

export function createStore(initial = null) {
  let state = initial;
  const listeners = new Set();
  return {
    get: () => state,
    /** fn(今の状態) が返したものを新しい状態にする（その場で書き換えて返してもよい） */
    update(fn, reason = '') {
      const next = fn(state);
      state = next === undefined ? state : next;
      listeners.forEach(l => l(state, reason));
      return state;
    },
    replace(next, reason = 'replace') {
      state = next;
      listeners.forEach(l => l(state, reason));
    },
    subscribe(l) { listeners.add(l); return () => listeners.delete(l); },
  };
}
