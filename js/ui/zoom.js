// 絵を大きく見る（2026-11-26 ユーザー：「せっかくの絵だからゲーム内でも拡大して見たい。装備とかモンスターとか」）。
// ・ボタンの外の絵：押すと大きく出る
// ・ボタンの中の小さな絵（装備の一覧など）：長押しで大きく出る（ふつうに押せば今までどおり選べる）
// ・影だけの絵（まだ会っていないモンスター）と仮の絵、戦闘中の絵は大きくしない
const LONG_MS = 450;

function pick(t) {
  const im = t?.closest?.('img[data-art]');
  if (!im || !im.isConnected) return null;
  if (im.closest('.silhouette, .field, .zoom-view')) return null;
  if ((im.getAttribute('src') || '').startsWith('data:')) return null;
  return im;
}

function open(im) {
  if (document.querySelector('.zoom-view')) return;
  const host = document.querySelector('#app') || document.body;
  const v = document.createElement('div');
  v.className = 'zoom-view';
  v.setAttribute('role', 'dialog');
  v.innerHTML = '<img alt=""><p></p><small>押すと閉じる</small>';
  v.querySelector('img').src = im.currentSrc || im.src;
  v.querySelector('p').textContent = im.closest('.card')?.querySelector('b')?.firstChild?.textContent?.trim() || ''; // 名前は一覧に出ているものだけ（画像の仮の名前は出さない）
  const close = e => { e?.preventDefault(); e?.stopPropagation(); v.remove(); document.removeEventListener('keydown', onKey, true); };
  const onKey = e => { if (e.key === 'Escape') close(e); };
  v.addEventListener('click', close);
  document.addEventListener('keydown', onKey, true);
  host.appendChild(v);
}

export function installZoom(root = document) {
  let timer = null, fired = false, sx = 0, sy = 0;
  const stop = () => { clearTimeout(timer); timer = null; };
  root.addEventListener('pointerdown', e => {
    fired = false; stop();
    const im = pick(e.target); if (!im) return;
    sx = e.clientX; sy = e.clientY;
    timer = setTimeout(() => { timer = null; fired = true; open(im); }, LONG_MS);
  }, true);
  root.addEventListener('pointermove', e => { if (timer && Math.hypot(e.clientX - sx, e.clientY - sy) > 10) stop(); }, true);
  for (const ev of ['pointerup', 'pointercancel']) root.addEventListener(ev, stop, true);
  root.addEventListener('click', e => {
    if (fired) { fired = false; e.preventDefault(); e.stopPropagation(); return; } // 長押しのあとの「押した」は無視
    const im = pick(e.target);
    if (im && !im.closest('button, a, [data-go]')) { e.preventDefault(); e.stopPropagation(); stop(); open(im); }
  }, true);
  // スマホの長押しメニュー（画像の保存など）を出さない
  root.addEventListener('contextmenu', e => { if (pick(e.target)) e.preventDefault(); }, true);
}
