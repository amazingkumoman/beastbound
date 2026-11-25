// 画面係：画面の切り替えと「戻る」を一手に引き受ける。11 画面遷移図 3章。
// 各画面は { id, render(ctx, params) → HTML文字列, bind?(el, ctx, params) } を持つだけ。

export function createScreens(rootEl, ctx) {
  const registry = new Map();
  const history = [];
  let current = null;

  function show(id, params) {
    const screen = registry.get(id);
    if (!screen) throw new Error(`画面「${id}」がない`);
    const el = document.createElement('section');
    el.className = `screen screen-${id}`;
    el.innerHTML = screen.render(ctx, params || {});
    rootEl.replaceChildren(el);
    current = { id, params };
    if (screen.bind) screen.bind(el, ctx, params || {});
    if (ctx.onShow) ctx.onShow(el, id);
    const focus = el.querySelector('[autofocus]') || el.querySelector('h1, h2');
    if (focus) { if (!focus.hasAttribute('tabindex') && !/INPUT|BUTTON/.test(focus.tagName)) focus.setAttribute('tabindex', '-1'); focus.focus({ preventScroll: true }); }
  }

  return {
    register(screen) { registry.set(screen.id, screen); },
    /** 画面へ進む。replace=true なら戻る先に残さない */
    go(id, params, { replace = false } = {}) {
      if (current && !replace) history.push(current);
      show(id, params);
    },
    back(fallback = 'title') {
      const prev = history.pop();
      if (prev) show(prev.id, prev.params); else show(fallback);
    },
    /** 戻る先を消して、その画面から始め直す（タイトルや拠点へ戻るとき） */
    reset(id, params) { history.length = 0; current = null; show(id, params); },
    refresh() { if (current) show(current.id, current.params); },
    currentId: () => current?.id,
  };
}
