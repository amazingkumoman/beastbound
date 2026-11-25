// 拠点の施設：ショップ・素材保管庫・食事施設（24b 6・7章）。しくみは systems/hunt/hunt.js。
import { esc, toast, confirmDialog, DEV } from '../components.js';
import { npcBox, bindNpc } from './intro.js';
import { MONEY, ITEMS, FOODS, ITEM_BOX_MAX } from '../../../data/items.js';
import { buyItem, eatFood, sellMaterial, bulkSellPlan, bulkSell, setProtect, setKeep, rarityOf, sellPrice, usedInCrafting, find as huntFind } from '../../systems/hunt/hunt.js';
import { find } from '../../systems/gear/gear.js';

export const money = n => `${Number(n).toLocaleString('ja-JP')} ${MONEY}`;
/** 素材の名前（レアリティの色の印つき） */
export function matName(id, n) {
  const m = find.material(id), r = rarityOf(m?.rarity ?? 1);
  return `<span class="mat"><i class="rar" style="--rar:${r.color}" title="レアリティ ${r.name}"></i>${esc(m?.name ?? id)}${n != null ? ` ×${n}` : ''}</span>`;
}
const wallet = save => `<div class="wallet">所持金 <b>${money(save.inventory.money)}</b></div>`;
const head = (place, title, save) => `<div class="head"><div><div class="place">${place}</div><h1>${title}</h1></div>${wallet(save)}</div>`;

export const shopScreen = {
  id: 'shop',
  render(ctx) {
    const save = ctx.store.get();
    return `${head('SHOP', 'ショップ', save)}
      <div class="paper">${npcBox(save, 'fac_shop')}<h2>道具を買う</h2><div class="list">${ITEMS.map(it => {
        const have = save.inventory.items[it.id] || 0;
        const can = n => save.inventory.money >= it.price * n && have + n <= ITEM_BOX_MAX;
        return `<div class="card"><span class="t"><b>${esc(it.name)}<em>持っている ${have}</em></b><small>${esc(it.desc)}・持ち込みは${it.max}個まで</small><small>${money(it.price)}</small></span>
          <span class="acts"><button class="btn small" data-buy="${it.id}" data-n="1" ${can(1) ? '' : 'disabled'}>1つ買う</button><button class="btn small" data-buy="${it.id}" data-n="5" ${can(5) ? '' : 'disabled'}>5つ買う</button></span></div>`;
      }).join('')}</div>
      <p class="note">素材を売るのは「素材保管庫」です。</p></div>
      <div class="bottombar"><button class="btn" data-back>拠点へ戻る</button></div>`;
  },
  bind(el, ctx) {
    bindNpc(el, ctx);
    el.querySelector('[data-back]').onclick = () => ctx.screens.back('base');
    el.querySelectorAll('[data-buy]').forEach(b => {
      b.onclick = () => {
        const r = buyItem(ctx.store.get(), b.dataset.buy, Number(b.dataset.n));
        if (!r.ok) return toast(r.error);
        ctx.autosave(); toast(`${huntFind.item(b.dataset.buy).name}を${b.dataset.n}つ買った（${money(r.cost)}）`);
        ctx.screens.go('shop', {}, { replace: true });
      };
    });
  },
};

export const canteenScreen = {
  id: 'canteen',
  render(ctx) {
    const save = ctx.store.get(), now = save.meal && huntFind.food(save.meal);
    return `${head('CANTEEN', '食事施設', save)}
      <div class="paper">${npcBox(save, 'fac_canteen')}<h2>狩りの前の食事</h2>
        <p class="note">効き目は次の狩り1回のあいだ。食べられるのは1つだけです。</p>
        <p class="note">今の食事：<b>${now ? `${esc(now.name)}（${esc(now.desc)}）` : 'まだ食べていない'}</b></p>
        <div class="list">${FOODS.map(f => `<div class="card"><span class="t"><b>${esc(f.name)}${save.meal === f.id ? '<em>食べた</em>' : ''}</b><small>${esc(f.desc)}</small><small>${money(f.price)}</small></span>
          <span class="acts"><button class="btn small" data-eat="${f.id}" ${save.meal === f.id || save.inventory.money < f.price ? 'disabled' : ''}>食べる</button></span></div>`).join('')}</div>
      </div>
      <div class="bottombar"><button class="btn" data-back>戻る</button></div>`;
  },
  bind(el, ctx) {
    bindNpc(el, ctx);
    el.querySelector('[data-back]').onclick = () => ctx.screens.back('base');
    el.querySelectorAll('[data-eat]').forEach(b => {
      b.onclick = async () => {
        const save = ctx.store.get();
        if (save.meal && !(await confirmDialog({ title: '食べ直しますか？', body: `<p>今の食事（${esc(huntFind.food(save.meal).name)}）の効き目は消えます。お金は戻りません。</p>`, ok: '食べ直す' }))) return;
        const r = eatFood(save, b.dataset.eat); if (!r.ok) return toast(r.error);
        ctx.autosave(); toast(`${huntFind.food(b.dataset.eat).name}を食べた`);
        ctx.screens.go('canteen', {}, { replace: true });
      };
    });
  },
};

export const storageScreen = {
  id: 'storage',
  render(ctx) {
    const save = ctx.store.get();
    const mats = Object.entries(save.inventory.materials).filter(([id, n]) => n > 0 && (!find.material(id)?.dev || DEV)) // 試験用の素材はふだん出さない
      .sort((a, b) => (find.material(a[0])?.rarity ?? 1) - (find.material(b[0])?.rarity ?? 1));
    const items = Object.entries(save.inventory.items).filter(([, n]) => n > 0);
    return `${head('STORAGE', '素材保管庫', save)}
      <div class="paper">${npcBox(save, 'fac_shop')}
        <h2>素材</h2>
        ${mats.length ? `<div class="list">${mats.map(([id, n]) => {
          const prot = !!save.storage.protect[id], keep = save.storage.keep[id] ?? 0, important = (find.material(id)?.rarity ?? 1) >= 3 || usedInCrafting(id);
          return `<div class="card mat-row"><span class="t"><b>${matName(id)}<em>${n}個</em>${prot ? '<em>保護</em>' : ''}</b>
              <small>売値 ${money(sellPrice(id))}／1個${important ? '・工房で使う／貴重' : ''}</small>
              <span class="keep">残す <button class="step" data-keep="${id}" data-d="-1">−</button><b>${keep}</b><button class="step" data-keep="${id}" data-d="1">＋</button></span></span>
            <span class="acts"><button class="btn small" data-prot="${id}">${prot ? '保護をやめる' : '保護する'}</button>
              <button class="btn small" data-sell="${id}" ${prot || n - keep <= 0 ? 'disabled' : ''}>${Math.max(0, n - keep)}個売る</button></span></div>`;
        }).join('')}</div>` : '<p class="empty">素材はまだない。狩りや採取で集めよう。</p>'}
        <p class="note">「残す」の数だけ残して売ります。保護した素材は売れません。工房で使う素材・レアリティ青より上は、売る前に確認します（まとめて売るには入りません）。</p>
        <button class="btn" data-bulk>まとめて売る</button>
        <h2>道具</h2>
        <p class="note">${items.length ? items.map(([id, n]) => `${esc(huntFind.item(id)?.name ?? id)} ${n}`).join('　') : 'なし'}</p>
      </div>
      <div class="bottombar"><button class="btn" data-back>拠点へ戻る</button></div>`;
  },
  bind(el, ctx) {
    bindNpc(el, ctx);
    const save = () => ctx.store.get();
    const stay = () => ctx.screens.go('storage', {}, { replace: true });
    el.querySelector('[data-back]').onclick = () => ctx.screens.back('base');
    el.querySelectorAll('[data-keep]').forEach(b => {
      b.onclick = () => { const id = b.dataset.keep, s = save(); setKeep(s, id, Math.min(s.inventory.materials[id], (s.storage.keep[id] ?? 0) + Number(b.dataset.d))); ctx.autosave(); stay(); };
    });
    el.querySelectorAll('[data-prot]').forEach(b => { b.onclick = () => { const s = save(); setProtect(s, b.dataset.prot, !s.storage.protect[b.dataset.prot]); ctx.autosave(); stay(); }; });
    el.querySelectorAll('[data-sell]').forEach(b => {
      b.onclick = async () => {
        const id = b.dataset.sell, s = save(), n = s.inventory.materials[id] - (s.storage.keep[id] ?? 0);
        let r = sellMaterial(s, id, n);
        if (r.warn) {
          const ok = await confirmDialog({ title: '大事な素材です', body: `<p>${matName(id, n)}を売りますか？</p><p class="note">工房で使う素材か、貴重な素材です。売ったら戻せません。</p>`, ok: '売る', danger: true });
          if (!ok) return; r = sellMaterial(s, id, n, { force: true });
        }
        if (!r.ok) return toast(r.error);
        ctx.autosave(); toast(`${money(r.money)}を受け取った`); stay();
      };
    });
    el.querySelector('[data-bulk]').onclick = async () => {
      const plan = bulkSellPlan(save());
      if (!plan.length) return toast('まとめて売れる素材がない');
      const total = plan.reduce((a, r) => a + r.money, 0);
      const ok = await confirmDialog({ title: 'まとめて売りますか？', body: `<ul class="sell-list">${plan.map(r => `<li>${matName(r.id, r.n)}</li>`).join('')}</ul><p>合計 <b>${money(total)}</b></p>`, ok: '売る' });
      if (!ok) return;
      bulkSell(save()); ctx.autosave(); toast(`${money(total)}を受け取った`); stay();
    };
  },
};
