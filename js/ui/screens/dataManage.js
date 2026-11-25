// データ管理：書き出し・読み込み・バックアップ。14 セーブ仕様書 2・5・8章。
import { esc, toast, confirmDialog, formatDate } from '../components.js';

function rankName(ctx, id) { return ctx.data.RANKS.find(r => r.id === id)?.name ?? '—'; }
function summaryHtml(ctx, s) {
  return `<dl class="summary"><dt>名前</dt><dd>${esc(s.name)}</dd><dt>ランク</dt><dd>${esc(rankName(ctx, s.rankId))}</dd>
    <dt>日数</dt><dd>${s.days}日目</dd><dt>保存日時</dt><dd>${esc(formatDate(s.savedAt))}</dd></dl>`;
}

export const dataScreen = {
  id: 'data',
  render(ctx) {
    const cur = ctx.saves.load();
    const backups = ctx.saves.listBackups();
    return `
      <div class="head"><div><div class="place">RECORDS</div><h1>データ管理</h1></div></div>
      <div class="paper">
        <h2>今の記録</h2>
        ${cur.ok ? summaryHtml(ctx, { ...cur.data.profile, savedAt: cur.data.savedAt }) : '<p class="empty">保存されている記録はありません。</p>'}
        <div class="row-btns">
          <button class="btn" data-a="export" ${cur.ok ? '' : 'disabled'}>書き出す</button>
          <button class="btn" data-a="backup" ${cur.ok ? '' : 'disabled'}>バックアップ</button>
        </div>
        <h2>ファイルから読み込む</h2>
        <p class="note">別の端末・ブラウザで書き出したファイルを読み込みます。読み込む前に、今の記録はバックアップされます。</p>
        <label class="btn file-btn">ファイルを選ぶ<input type="file" accept=".json,application/json" data-a="import" hidden></label>
        <h2>文字で移す</h2>
        <p class="note">ファイルが使えないとき（スマホ用ページ→ホーム画面のアプリ など）は、文字で移せます。「文字で書き出す」で出た文字をすべてコピーし、移した先の同じ場所に貼って「貼った文字を読み込む」を押してください。</p>
        <div class="row-btns"><button class="btn" data-a="export-text" ${cur.ok ? '' : 'disabled'}>文字で書き出す</button><button class="btn" data-a="copy-text">コピー</button></div>
        <textarea class="io-text" rows="4" placeholder="ここに記録の文字が出ます／貼ります" spellcheck="false"></textarea>
        <div class="row-btns"><button class="btn" data-a="import-text">貼った文字を読み込む</button></div>
        <h2>バックアップ（新しい順・最大5つ）</h2>
        ${backups.length ? `<ul class="list">${backups.map(b => `
          <li class="card">
            <span class="t"><b>${esc(formatDate(b.at))}</b><small>${esc(b.reason || '')}${b.ok ? `・${esc(b.summary.name)}・${b.summary.days}日目` : '・読めない'}</small></span>
            <button class="btn small" data-restore="${esc(b.key)}" ${b.ok ? '' : 'disabled'}>戻す</button>
          </li>`).join('')}</ul>` : '<p class="empty">バックアップはまだありません。</p>'}
      </div>
      <div class="bottombar"><button class="btn" data-back autofocus>戻る</button></div>`;
  },
  bind(el, ctx) {
    el.querySelector('[data-back]').onclick = () => ctx.screens.back();
    el.querySelector('[data-a="export"]').onclick = () => {
      const r = ctx.saves.load(); if (!r.ok) return;
      const f = ctx.saves.exportFile(r.data);
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([f.text], { type: 'application/json' }));
      a.download = f.filename; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      toast('ファイルに書き出しました');
    };
    el.querySelector('[data-a="backup"]').onclick = () => {
      const r = ctx.saves.makeBackup('手動');
      toast(r.ok ? 'バックアップしました' : `できませんでした：${r.error}`); ctx.screens.refresh();
    };
    const io = el.querySelector('.io-text');
    el.querySelector('[data-a="export-text"]').onclick = () => {
      const r = ctx.saves.load(); if (!r.ok) return;
      io.value = ctx.saves.exportFile(r.data).text; io.select(); toast('書き出しました。「コピー」を押して取っておいてください');
    };
    el.querySelector('[data-a="copy-text"]').onclick = async () => {
      if (!io.value) { toast('先に「文字で書き出す」を押してください'); return; }
      try { await navigator.clipboard.writeText(io.value); toast('コピーしました'); } catch { io.select(); toast('長押しで「すべて選択」→「コピー」してください'); }
    };
    el.querySelector('[data-a="import-text"]').onclick = () => { const text = io.value.trim(); if (!text) { toast('文字を貼ってください'); return; } importText(text); };
    el.querySelector('[data-a="import"]').onchange = async e => {
      const file = e.target.files[0]; e.target.value = '';
      if (!file) return;
      importText(await file.text());
    };
    async function importText(text) {
      const info = ctx.saves.inspectImport(text);
      if (!info.ok) { toast(`読み込めません：${info.error}`); return; }
      const has = ctx.saves.load().ok;
      const ok = await confirmDialog({
        title: has ? '今の記録を上書きしますか？' : 'この記録を読み込みますか？',
        body: `<p>読み込む記録：</p>${summaryHtml(ctx, info.summary)}${has ? '<p>今の記録はバックアップに残します。</p>' : ''}`,
        ok: '読み込む', danger: has,
      });
      if (!ok) return;
      const r = ctx.saves.applyImport(text);
      if (!r.ok) { toast(`読み込めません：${r.error}`); return; }
      ctx.store.replace(r.data, 'import');
      toast('読み込みました');
      ctx.screens.refresh();
    }
    el.querySelectorAll('[data-restore]').forEach(b => {
      b.onclick = async () => {
        const ok = await confirmDialog({ title: 'このバックアップに戻しますか？', body: '<p>今の記録もバックアップに残します。</p>', ok: '戻す', danger: true });
        if (!ok) return;
        const r = ctx.saves.restoreBackup(b.dataset.restore);
        if (!r.ok) { toast(`戻せません：${r.error}`); return; }
        ctx.store.replace(r.data, 'restore');
        toast('戻しました'); ctx.screens.refresh();
      };
    });
  },
};
