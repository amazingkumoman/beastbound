// 共通部品：文字の無害化・トースト・確認の小窓。11 画面遷移図 3章。

/** 開発用の入口（試験場・試験用の依頼・試験用の素材）を見せるか。ふだんは隠す。
 *  見せたいときはアドレスの最後に ?dev を付けて開く（その端末で覚える）。?nodev で戻す。 */
export const DEV = (() => {
  try {
    const q = new URLSearchParams(location.search);
    if (q.has('dev')) localStorage.setItem('bb.dev', '1');
    if (q.has('nodev')) localStorage.removeItem('bb.dev');
    return localStorage.getItem('bb.dev') === '1';
  } catch { return false; }
})();

export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/** 短いお知らせ（数秒で消える） */
export function toast(message, root = document.getElementById('app')) {
  const d = document.createElement('div');
  d.className = 'toast';
  d.setAttribute('role', 'status');
  d.textContent = message;
  root.appendChild(d);
  setTimeout(() => d.remove(), 2600);
}

/**
 * 確認の小窓。押した答えを返す（はい → true）。
 * @param {{ title: string, body?: string, ok?: string, cancel?: string, danger?: boolean }} o
 */
export function confirmDialog({ title, body = '', ok = 'はい', cancel = 'やめる', danger = false }) {
  return new Promise(resolve => {
    const wrap = document.createElement('div');
    wrap.className = 'dialog-wrap';
    wrap.innerHTML = `
      <div class="dialog paper" role="dialog" aria-modal="true" aria-labelledby="dlgTitle">
        <h2 id="dlgTitle">${esc(title)}</h2>
        ${body ? `<div class="dialog-body">${body}</div>` : ''}
        <div class="row-btns">
          <button class="btn" data-a="no">${esc(cancel)}</button>
          <button class="btn ${danger ? 'danger' : 'main'}" data-a="yes">${esc(ok)}</button>
        </div>
      </div>`;
    const done = v => { wrap.remove(); document.removeEventListener('keydown', onKey); resolve(v); };
    const onKey = e => { if (e.key === 'Escape') done(false); };
    wrap.addEventListener('click', e => {
      const b = e.target.closest('[data-a]');
      if (b) done(b.dataset.a === 'yes');
      else if (e.target === wrap) done(false);
    });
    document.addEventListener('keydown', onKey);
    document.getElementById('app').appendChild(wrap);
    wrap.querySelector('[data-a="no"]').focus();
  });
}

/** 日時を読みやすく（例：11/24 20:05） */
export function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d)) return '';
  const p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}/${p(d.getMonth() + 1)}/${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}
