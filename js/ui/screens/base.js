// 拠点（正式方針4章）。施設の入口。中身ができていない施設は「準備中」の画面へ。
import { esc, DEV } from '../components.js';
import { money } from './town.js';
import { pendingEvent } from '../../systems/story/story.js';
import { showEvent } from './intro.js';

const FAC_SCREEN = { fac_lab: 'lab', fac_workshop: 'workshop', fac_quest: 'questBoard', fac_shop: 'shop', fac_storage: 'storage', fac_canteen: 'canteen' };

export const baseScreen = {
  id: 'base',
  render(ctx) {
    const s = ctx.store.get();
    const rank = ctx.data.RANKS.find(r => r.id === s.profile.rankId)?.name ?? '';
    const fac = ctx.data.FACILITIES.map(f =>
      `<button class="btn fac" data-fac="${f.id}">${esc(f.name)}<small>${esc(f.desc)}</small></button>`).join('');
    return `
      <div class="bgimg base-bg" data-art-bg="bg.base.main"></div>
      <div class="shade"></div>
      <div class="head">
        <div><div class="place">BASE CAMP</div><h1>拠点</h1></div>
        <div class="who"><b>${esc(s.profile.name)}</b><span>${esc(rank)}・${s.profile.days}日目</span><span>${money(s.inventory.money)}${s.meal ? '・食事済み' : ''}</span></div>
      </div>
      <nav class="base-menu" aria-label="施設">
        ${fac}
        <button class="btn" data-go="equip">装備<small>武器・防具・装飾品</small></button>
        <button class="btn" data-go="data">データ管理<small>書き出し・読み込み</small></button>
        <button class="btn" data-go="settings">設定<small>音・文字</small></button>
        <button class="btn wide" data-go="notes">研究ノート<small>開いた情報をまとめて読む（攻略・研究）</small></button>
        ${DEV ? '<button class="btn wide dev" data-go="arena">試験場（開発用）<small>戦闘のしくみを試す・記録には残らない</small></button>' : ''}
        <button class="btn wide" data-go="title">タイトルへ<small>記録は自動で保存されています</small></button>
      </nav>`;
  },
  bind(el, ctx) {
    el.querySelectorAll('[data-fac]').forEach(b => {
      b.onclick = () => (FAC_SCREEN[b.dataset.fac] ? ctx.screens.go(FAC_SCREEN[b.dataset.fac], {}) : ctx.screens.go('stub', { title: b.firstChild.textContent, stage: stageOf(b.dataset.fac) }));
    });
    el.querySelector('[data-go="equip"]').onclick = () => ctx.screens.go('equip', {});
    el.querySelector('[data-go="data"]').onclick = () => ctx.screens.go('data');
    el.querySelector('[data-go="settings"]').onclick = () => ctx.screens.go('settings');
    el.querySelector('[data-go="notes"]').onclick = () => { ctx.autosave(); try { sessionStorage.setItem('bb.resume', 'base'); } catch { /* 使えなくても開ける */ } location.href = 'site.html'; }; // 戻ったら拠点から（タイトルに戻さない） // 研究ノート（60）
    const ev = pendingEvent(ctx.store.get()); // 物語の出来事（拠点に戻ったとき）
    if (ev) setTimeout(() => showEvent(ctx, ev), 300);
    const arena = el.querySelector('[data-go="arena"]'); if (arena) arena.onclick = () => ctx.screens.go('arenaSetup', {});
    el.querySelector('[data-go="title"]').onclick = () => { ctx.autosave(); ctx.screens.reset('title'); };
  },
};

function stageOf(id) {
  return ({ fac_quest: '第7段階', fac_workshop: '第5・6段階', fac_shop: '第7段階', fac_lab: '第9段階', fac_storage: '第7段階', fac_canteen: '第7段階' })[id] || '';
}

/** まだ作っていない施設の画面 */
export const stubScreen = {
  id: 'stub',
  render(ctx, p) {
    return `
      <div class="head"><div><div class="place">COMING SOON</div><h1>${esc(p.title || '')}</h1></div></div>
      <div class="paper"><p class="empty">この施設は準備中です。${p.stage ? `（${esc(p.stage)}で作ります）` : ''}</p></div>
      <div class="bottombar"><button class="btn" data-back autofocus>拠点へ戻る</button></div>`;
  },
  bind(el, ctx) { el.querySelector('[data-back]').onclick = () => ctx.screens.back('base'); },
};
