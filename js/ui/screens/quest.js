// クエスト受付と狩猟前の準備（24 仕様書 11・16章、24b）。しくみは systems/hunt/hunt.js。
import { esc, toast, DEV } from '../components.js';
import { npcBox, bindNpc } from './intro.js';
import { POUCH_SLOTS, ITEMS } from '../../../data/items.js';
import { HUNT, find as huntFind, KIND_NAME, TIME_NAME, startQuest, pouchProblems, defaultPouch, questUnlocked, allowedPouch } from '../../systems/hunt/hunt.js';
import { computeGear, battleWeapon, find } from '../../systems/gear/gear.js';
import { money } from './town.js';

export const questBoardScreen = {
  id: 'questBoard',
  render(ctx) {
    const save = ctx.store.get();
    const open = HUNT.quests.filter(q => !q.dev && questUnlocked(save, q)), locked = HUNT.quests.filter(q => !q.dev && !questUnlocked(save, q) && (q.rank !== 'high' || save.profile.flags.highOpen) && (q.rank !== 'master' || save.profile.flags.masterOpen)).length;
    const card = q => {
        const rec = save.progress.quests[q.id] || {};
        return `<button class="card pick" data-q="${q.id}"><span class="t"><b>${esc(q.name)}<em>${KIND_NAME[q.kind]}</em>${q.danger ? `<em class="danger">危険度 ${'★'.repeat(q.danger)}</em>` : ''}${rec.cleared ? `<em>達成 ${rec.cleared}回</em>` : ''}</b>
          <small>${esc(q.desc)}</small><small>場所：${esc(huntFind.field(q.fieldId).name)}・出発：${TIME_NAME[q.start]}${q.limit ? `・${TIME_NAME[q.limit]}になると失敗` : ''}${q.ban?.length ? `・持ち込めない：${q.ban.map(id => esc(ITEMS.find(i => i.id === id)?.name ?? id)).join('・')}` : ''}・報酬 ${q.reward.money ? money(q.reward.money) : 'なし'}</small></span><span class="go">›</span></button>`;
    };
    return `
      <div class="head"><div><div class="place">QUEST</div><h1>クエスト受付</h1></div></div>
      <div class="paper">${npcBox(save, 'fac_quest')}
      ${save.profile.flags.masterOpen ? `<h2>マスター級の依頼</h2><div class="list">${open.filter(q => q.rank === 'master').map(card).join('')}</div>` : ''}
      ${save.profile.flags.highOpen ? `<h2>上位の依頼</h2><div class="list">${open.filter(q => q.rank === 'high').map(card).join('')}</div>` : ''}
      <h2>下位の依頼</h2><div class="list">${open.filter(q => !q.rank).map(card).join('')}</div>
      ${locked ? `<p class="note">ほかに ${locked} 件、狩りを進めると受けられる依頼があります。</p>` : ''}
      ${save.profile.flags.masterClear && !save.profile.flags.exClear ? '<p class="note"><b>強化個体や高難度の依頼を終えると、さらに依頼が届きます。</b></p>' : ''}
      ${DEV ? `<details class="dev-box"><summary>試験用の依頼（開発用）</summary><div class="list">${HUNT.quests.filter(q => q.dev).map(card).join('')}</div></details>` : ''}
      <p class="note">どの依頼から受けてもかまいません。危険度が高い相手には、装備を整えてから挑むと楽になります。</p>
      <p class="note">失敗になるのは：3回力尽きる／撤退する／（特殊）制限時間を過ぎる。失敗しても、探索で拾った素材は持ち帰れます。</p></div>
      <div class="bottombar"><button class="btn" data-back>拠点へ戻る</button></div>`;
  },
  bind(el, ctx) {
    bindNpc(el, ctx);
    el.querySelector('[data-back]').onclick = () => ctx.screens.back('base');
    el.querySelectorAll('[data-q]').forEach(b => { b.onclick = () => ctx.screens.go('prep', { questId: b.dataset.q }); });
  },
};

const drafts = {}; // 準備中の持ち込み（装備の画面へ行って戻っても残す）

function knownInfo(save, q) {
  const id = q.goal.monsterId; if (!id) return '戦う相手は決まっていない。';
  const r = save.research[id], mon = huntFind.monster(id);
  if (!r || !(r.seen || r.observed || r.hunted || r.captured)) return `${esc(mon.name)}：まだ出会っていない。`;
  const bits = [`出会った ${r.seen}回`, `観察 ${r.observed}回`, `討伐 ${r.hunted}回`, `捕獲 ${r.captured}回`];
  const parts = Object.keys(r.parts || {}).map(k => mon.parts[k]?.name).filter(Boolean);
  return `${esc(mon.name)}：${bits.join('・')}${parts.length ? `／壊したことのある部位：${parts.map(esc).join('・')}` : ''}`;
}

export const prepScreen = {
  id: 'prep',
  render(ctx, p) {
    const save = ctx.store.get(), q = huntFind.quest(p.questId);
    const pouch = drafts[q.id] ??= allowedPouch(defaultPouch(save), q);
    const g = computeGear(save), w = battleWeapon(save).weapon, node = find.weapon(g.weaponItem.nodeId);
    const food = save.meal && huntFind.food(save.meal);
    const kinds = Object.values(pouch).filter(n => n > 0).length;
    const probs = pouchProblems(save, pouch, q);
    return `
      <div class="head"><div><div class="place">PREPARE</div><h1>狩猟前の準備</h1></div></div>
      <div class="paper">
        <h2>${esc(q.name)}</h2>
        <p class="note">${esc(q.goal.text)}${q.extra.length ? `／追加の目的：${q.extra.map(x => esc(x.text)).join('・')}` : ''}</p>
        <p class="note">わかっていること：${knownInfo(save, q)}</p>
        <h2>装備</h2>
        <button class="card pick" data-equip><span class="t"><b>${esc(node.name)}</b><small>技：${esc(w.techs.map(t => t.name).join('・') || 'なし')}／守り ${g.def}</small></span><span class="go txt">変える ›</span></button>
        <h2>食事</h2>
        <button class="card pick" data-canteen><span class="t"><b>${food ? esc(food.name) : 'まだ食べていない'}</b><small>${food ? esc(food.desc) : '食事施設で食べると、この狩りのあいだ効く'}</small></span><span class="go txt">食事施設 ›</span></button>
        <h2>持ち込む道具（${kinds}/${POUCH_SLOTS}種類）</h2>
        <div class="list">${ITEMS.map(it => {
          const have = save.inventory.items[it.id] || 0, n = pouch[it.id] || 0;
          const banned = q.ban?.includes(it.id);
          const upOk = !banned && n < Math.min(it.max, have) && (n > 0 || kinds < POUCH_SLOTS);
          return `<div class="card pouch-row ${have ? '' : 'none'}"><span class="t"><b>${esc(it.name)}<em>拠点に ${have}</em></b><small>${banned ? 'この依頼には持ち込めない' : `${esc(it.desc)}・${it.max}個まで`}</small></span>
            <span class="stepper"><button class="step" data-p="${it.id}" data-d="-1" ${n ? '' : 'disabled'}>−</button><b>${n}</b><button class="step" data-p="${it.id}" data-d="1" ${upOk ? '' : 'disabled'}>＋</button></span></div>`;
        }).join('')}</div>
        <p class="note">使った分だけ減ります。使わなかった分は持ち帰ります。道具を買うのは「ショップ」。</p>
        ${probs.length ? `<p class="note short">${esc(probs[0])}</p>` : ''}
      </div>
      <div class="bottombar"><button class="btn" data-back>やめる</button><button class="btn main" data-go ${probs.length ? 'disabled' : ''}>出発する</button></div>`;
  },
  bind(el, ctx, p) {
    const q = huntFind.quest(p.questId), pouch = drafts[q.id];
    const stay = () => ctx.screens.go('prep', p, { replace: true });
    el.querySelector('[data-back]').onclick = () => ctx.screens.back('questBoard');
    el.querySelector('[data-equip]').onclick = () => ctx.screens.go('equip', {});
    el.querySelector('[data-canteen]').onclick = () => ctx.screens.go('canteen', {});
    el.querySelectorAll('[data-p]').forEach(b => { b.onclick = () => { pouch[b.dataset.p] = Math.max(0, (pouch[b.dataset.p] || 0) + Number(b.dataset.d)); stay(); }; });
    el.querySelector('[data-go]').onclick = () => {
      const save = ctx.store.get();
      const r = startQuest(save, q.id, pouch, `${q.id}-${Date.now()}`);
      if (!r.ok) return toast(r.error);
      delete drafts[q.id];
      ctx.autosave();
      ctx.screens.reset('explore', { first: true });
    };
  },
};
