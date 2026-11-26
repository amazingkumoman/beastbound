// 試験場（開発用）の準備：いまの装備で、技を選んで戦う。結果は記録に残らない。
// 覚えていない技は名前も中身も見せない（2026-11-25 ユーザー）。
// 武器の種類はここで持ちかえられる（その種類で持っている武器のうち、いちばん強化したもの）。
// 防具・装飾品は「装備」画面で変える。正式な「狩猟前の準備画面」（16章）は第7段階。
import { esc, toast } from '../components.js';
import { WEAPON_KINDS, TECH_SLOTS } from '../../../data/weapons.js';
import { TEST_MONSTER, TEST_ITEMS } from '../../../data/testArena.js';
import { RANGE_NAME } from '../../systems/battle/engine.js';
import { find, computeGear, equipWeapon, battleWeapon, WEAPON_KIND_IDS } from '../../systems/gear/gear.js';
import { masteryLevel } from '../../../data/weapons.js';
import { isLearned } from '../../systems/gear/learn.js';
import { weaponLine } from './equip.js';

const lastTechs = {}; // 種類ごとに前に選んだ技（このページを開いている間だけ）

export const arenaSetupScreen = {
  id: 'arenaSetup',
  render(ctx) {
    const save = ctx.store.get();
    const g = computeGear(save);
    const node = find.weapon(g.weaponItem.nodeId), kind = node.kindId, K = WEAPON_KINDS[kind];
    const lv = masteryLevel(save.mastery?.[kind] ?? 0);
    const chosen = new Set((lastTechs[kind] || save.loadout.techs[kind] || K.techs.filter(t => t.unlock === 0).map(t => t.id)).filter(id => { const t = K.techs.find(x => x.id === id); return t && isLearned(save, kind, t); }));
    const armors = ctx.data.ARMOR_PARTS.map(({ id, name }) => `${name}：${g.armors[id] ? esc(g.armors[id].piece.name) : 'なし'}`).join('　');
    return `
      <div class="head"><div><div class="place">TEST ARENA</div><h1>試験場の準備</h1></div></div>
      <div class="paper">
        <h2>武器の種類</h2>
        <div class="kinds">${WEAPON_KIND_IDS.map(id => `<button class="kind ${id === kind ? 'sel' : ''}" data-kind="${id}">${window.ART.img(ctx.data.WEAPON_TYPES.find(w => w.id === id)?.art || '')}<span>${esc(WEAPON_KINDS[id].name)}</span></button>`).join('')}</div>
        <p class="note"><b>${esc(node.name)}</b>：${esc(weaponLine(node))}／届く間合い ${K.reach.map(r => RANGE_NAME[r]).join('・')}／防御の強さ ${K.guardLevel}${K.special ? `／専用：${esc(K.special.name)}` : ''}</p>
        <p class="note">防具：${armors}／守り ${g.def}（変えるときは拠点の「装備」）</p>
        <h2>技（${TECH_SLOTS}つまで・<span class="cnt">${chosen.size}</span>/${TECH_SLOTS}）</h2>
        <p class="note">熟練度 ${lv}。覚えた技だけ選べます（技は装備画面で覚える）。</p>
        <div class="list">${K.techs.filter(t => (t.rank !== 'high' || save.profile.flags?.highOpen) && (t.rank !== 'master' || save.profile.flags?.masterOpen)).map(t => (isLearned(save, kind, t) ? `
          <label class="card tech-pick">
            <input type="checkbox" value="${t.id}" ${chosen.has(t.id) ? 'checked' : ''}>
            <span class="t"><b>${esc(t.name)}${t.unlock ? `<em>熟練度${t.unlock}</em>` : '<em>はじめから</em>'}</b><small>気力${t.st}・${esc(t.desc)}</small></span>
          </label>` : `<div class="card tech-pick locked"><span class="t"><b>？？？<em>熟練度${t.unlock}で覚える</em></b><small>まだ覚えていない技</small></span></div>`)).join('')}</div>
      </div>
      <div class="bottombar"><button class="btn" data-back>戻る</button><button class="btn main" data-go>戦う</button></div>`;
  },
  bind(el, ctx) {
    const save = ctx.store.get();
    const kind = find.weapon(computeGear(save).weaponItem.nodeId).kindId;
    el.querySelectorAll('[data-kind]').forEach(b => {
      b.onclick = () => {
        const owned = save.inventory.weapons.filter(w => find.weapon(w.nodeId).kindId === b.dataset.kind)
          .sort((a, c) => find.weapon(c.nodeId).tier - find.weapon(a.nodeId).tier);
        if (owned[0]) { equipWeapon(save, owned[0].uid); ctx.autosave(); }
        ctx.screens.go('arenaSetup', {}, { replace: true });
      };
    });
    const boxes = [...el.querySelectorAll('.tech-pick input')];
    const sync = () => {
      const on = boxes.filter(b => b.checked);
      el.querySelector('.cnt').textContent = on.length;
      boxes.forEach(b => { b.disabled = !b.checked && on.length >= TECH_SLOTS; });
    };
    boxes.forEach(b => { b.onchange = sync; });
    sync();
    el.querySelector('[data-back]').onclick = () => ctx.screens.back('base');
    el.querySelector('[data-go]').onclick = () => {
      const techIds = boxes.filter(b => b.checked).map(b => b.value);
      if (!techIds.length) { toast('技を1つ以上選んでください'); return; }
      lastTechs[kind] = techIds;
      const { weapon, gear } = battleWeapon(ctx.store.get(), { techIds });
      ctx.screens.go('battle', { monster: TEST_MONSTER, weapon, gear, items: TEST_ITEMS, field: 'bg.field.01', seed: `arena-${Date.now()}` });
    };
  },
};
