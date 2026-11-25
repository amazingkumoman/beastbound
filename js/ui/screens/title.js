// タイトル。11 画面遷移図。
import { confirmDialog, toast } from '../components.js';

export const titleScreen = {
  id: 'title',
  render(ctx) {
    const has = ctx.hasSave();
    return `
      <div class="bgimg" data-art-bg="bg.title"></div>
      <div class="shade"></div>
      <header class="logo">
        <div class="plate" data-art-bg="logo.title"><h1>BEASTBOUND</h1></div>
      </header>
      <nav class="title-menu">
        <button class="btn main" data-go="new" autofocus>はじめから</button>
        <button class="btn" data-go="continue" ${has ? '' : 'disabled'}>つづきから</button>
        <button class="btn" data-go="data">データ管理<small>書き出し・読み込み・バックアップ</small></button>
      </nav>`;
  },
  bind(el, ctx) {
    el.querySelector('[data-go="new"]').onclick = async () => {
      if (ctx.hasSave()) {
        const ok = await confirmDialog({
          title: '最初から始めますか？',
          body: '<p>今の記録はバックアップに残してから、新しく始めます。</p>',
          ok: '最初から始める', danger: true,
        });
        if (!ok) return;
        const b = ctx.saves.makeBackup('はじめからの前');
        if (!b.ok) { toast(`バックアップできないので中止しました（${b.error}）`); return; }
      }
      ctx.screens.go('name');
    };
    el.querySelector('[data-go="continue"]').onclick = () => {
      const r = ctx.saves.load();
      if (!r.ok) { toast('読める保存データがありません'); ctx.screens.go('data'); return; }
      ctx.store.replace(r.data, 'load');
      if (r.source !== 'bb.save.current') toast('いちばん新しい記録が読めなかったので、1つ前の記録から再開しました');
      if (ctx.store.get().suspend) { toast('探索の続きから再開します'); ctx.screens.reset('explore', {}); return; } // 中断した探索（Q-20）
      ctx.screens.reset(r.data.profile.flags.introSeen ? 'base' : 'intro');
    };
    el.querySelector('[data-go="data"]').onclick = () => ctx.screens.go('data');
  },
};
