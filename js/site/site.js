// 研究ノート（攻略・研究サイト・60）の画面。保存データは読むだけで、書き換えない。
// つなぎ方：同じブラウザの保存を読む（案A）／ゲームで書き出したファイルを読む（案B）。
import { createSaveManager, browserStorage } from '../save/saveManager.js';
import { parseSave } from '../save/schema.js';
import { migrate } from '../save/migrate.js';
import { normalize } from '../systems/gear/gear.js';
import { normalizeHunt } from '../systems/hunt/hunt.js';
import { buildNotebook } from './notebook.js';
import { SPECIES } from '../../data/species.js';
import { researchStage } from '../systems/story/story.js';

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const $ = id => document.getElementById(id);
let save = null, book = null, tab = 'monsters', source = '';

function prepare(data) { return normalizeHunt(normalize(structuredClone(data))); }

function loadFromBrowser() {
  try {
    const r = createSaveManager({ storage: browserStorage() }).load();
    if (r.ok) { save = prepare(r.data); source = 'このブラウザの記録'; }
  } catch { /* 保存が使えないブラウザ */ }
}

function render() {
  if (!save) {
    $('who').textContent = '';
    $('tabs').innerHTML = '';
    $('body').innerHTML = '<p class="nb-empty">まだ記録がない。ゲームを遊ぶと、ここに書きこまれていく。<br>ほかの端末の記録を見るときは「書き出したファイルを読む」から。</p>';
    return;
  }
  book = buildNotebook(save);
  $('who').textContent = `${book.name} の記録（${source}）`;
  $('tabs').innerHTML = book.sections.map(s => `<button class="nb-tab ${s.id === tab ? 'on' : ''}" data-tab="${s.id}">${esc(s.title)}<small>${s.entries.length}</small></button>`).join('');
  const q = $('q').value.trim();
  const sec = book.sections.find(s => s.id === tab) || book.sections[0];
  const list = q ? book.sections.flatMap(s => s.entries.map(e => ({ ...e, _sec: s.title }))).filter(e => JSON.stringify([e.title, e.sub, e.basic, e.tactical, e.detail]).includes(q)) : sec.entries;
  $('body').innerHTML = list.length ? list.map(card).join('') : `<p class="nb-empty">${esc(q ? '見つからない（開いていない情報は探せない）。' : sec.empty || 'まだ記録がない。')}</p>`;
}

function card(e) {
  const mon = SPECIES.find(m => m.id === e.id);
  const art = mon ? `<div class="nb-art ${researchStage(save, mon.id).stage < 2 ? 'silhouette' : ''}">${window.ART?.img(mon.art) ?? ''}</div>` : '';
  const lines = arr => `<ul>${arr.map(l => `<li>${esc(l)}</li>`).join('')}</ul>`;
  return `<article class="nb-card">
    ${e._sec ? `<p class="nb-sec">${esc(e._sec)}</p>` : ''}
    <h2>${esc(e.title)}${e.sub ? `<small>${esc(e.sub)}</small>` : ''}</h2>
    ${art}
    ${e.basic?.length ? lines(e.basic) : ''}
    ${e.tactical ? `<details class="spoil"><summary>戦術（ネタバレ注意・押すと開く）</summary>${lines(e.tactical)}</details>` : ''}
    ${e.detail ? `<details class="spoil deep"><summary>詳しい情報（ネタバレ注意・押すと開く）</summary>${lines(e.detail)}</details>` : ''}
    ${mon && !e.tactical ? '<p class="nb-locked">戦術：研究が「研究進行」になると記される</p>' : ''}
    ${mon && e.tactical && !e.detail ? '<p class="nb-locked">詳しい情報：研究が「研究完了」になると記される</p>' : ''}
  </article>`;
}

$('tabs').addEventListener('click', ev => { const b = ev.target.closest('[data-tab]'); if (!b) return; tab = b.dataset.tab; $('q').value = ''; render(); });
$('q').addEventListener('input', render);
$('file').addEventListener('change', async ev => {
  const f = ev.target.files?.[0]; if (!f) return;
  const r = parseSave(await f.text());
  if (!r.ok) { alert(`読めませんでした：${r.error}`); return; }
  let d = r.data; try { d = migrate(r.data).data; } catch { /* 移せない版はそのまま */ }
  save = prepare(d); source = `ファイル「${f.name}」`; render();
});
window.addEventListener('storage', () => { if (!source.startsWith('ファイル')) { loadFromBrowser(); render(); } }); // ゲームを別のタブで遊んだら反映
loadFromBrowser();
render();
