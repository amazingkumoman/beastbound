// 工房（拠点）：武器の派生ツリー・防具・装飾品を作る・強化する。22b 1・5・6章。
// 素材は狩り・採取で集める。開発用の「試験用の素材を受け取る」は試験用の装備のためだけ。
import { esc, toast, DEV } from '../components.js';
import { npcBox, bindNpc } from './intro.js';
import { CATALOG, find, grantText, missing, craftWeapon, upgradeWeapon, craftArmor, upgradeArmor, armorUpgradeCost, armorMaxLevel, craftDeco, weaponTree, WEAPON_KIND_IDS, MONEY } from '../../systems/gear/gear.js';
import { WEAPON_KINDS } from '../../../data/weapons.js';
import { ARMOR_MAX_LEVEL, TEST_MATERIAL_GIFT } from '../../../data/testGear.js';
import { weaponLine, weaponThumb } from './equip.js';

const costText = (save, cost) => Object.entries(cost || {}).map(([m, n]) => {
  if (m === MONEY) { const have = save.inventory.money || 0; return `<span class="${have < n ? 'short' : ''}">${n.toLocaleString()}ルク</span>`; } // お金
  const have = save.inventory.materials[m] || 0;
  return `<span class="${have < n ? 'short' : ''}">${esc(find.material(m)?.name ?? m)} ${n}（${have}）</span>`;
}).join('・') || '素材なし';

export const workshopScreen = {
  id: 'workshop',
  render(ctx, p) {
    const save = ctx.store.get();
    const tab = p.tab || 'weapon';
    const kind = p.kind || 'wt_greatsword';
    const tabs = [['weapon', '武器'], ['armor', '防具'], ['deco', '装飾品']].map(([k, n]) => `<button class="btn ${tab === k ? 'main' : ''}" data-tab="${k}">${n}</button>`).join('');
    let body = '';
    // ネタバレ防止（22章）：まだ出会っていない大型の素材で作る装備は、名前も中身も出さない（数だけ伝える）
    const knownMon = id => { const r = save.research?.[id]; return !!r && (r.seen + r.hunted + r.captured + r.observed) > 0; };
    const knownMat = id => id in save.inventory.materials || !!save.matLog?.[id];
    const nodeMon = n => { const m = n.id.match(/_(m\d\d+s?)_/); return m ? `mon_${m[1]}` : null; };
    const rankOk = x => (x.rank !== 'high' || !!save.profile.flags?.highOpen) && (x.rank !== 'master' || !!save.profile.flags?.masterOpen); // 上位・マスター級の装備は、開くまで出さない
    const armThumb = pc => (pc.art ? `<span class="arm-thumb">${window.ART.img(pc.art, 'loading="lazy"')}</span>` : ''); // 防具の絵
    const hiddenNote = n => (n ? `<p class="note">まだ出会っていない大型の素材で作るものが、ほかに ${n} 種類あります。</p>` : '');
    if (tab === 'weapon') {
      const owned = save.inventory.weapons;
      const tree = weaponTree(kind, { showDev: DEV }).filter(n => !n.dev || owned.some(w => w.nodeId === n.id || w.nodeId === n.parentId));
      const seenNode = n => (rankOk(n) && (!nodeMon(n) || knownMon(nodeMon(n)))) || owned.some(w => w.nodeId === n.id);
      // 親が見えていない派生は出さない（親の下に並ぶので、親がないと一覧の上のほうに浮いてしまう）
      const vis = new Set(); const shown = tree.filter(n => { const ok = owned.some(w => w.nodeId === n.id) || (seenNode(n) && (!n.parentId || vis.has(n.parentId))); if (ok) vis.add(n.id); return ok; });
      body = `<div class="kinds">${WEAPON_KIND_IDS.map(k => `<button class="kind ${k === kind ? 'sel' : ''}" data-kind="${k}"><span>${esc(WEAPON_KINDS[k].name)}</span></button>`).join('')}</div>
        <h2>${esc(WEAPON_KINDS[kind].name)}の派生</h2><div class="list tree">${shown.map(n => {
          const mine = owned.filter(w => w.nodeId === n.id).length;
          const parents = owned.filter(w => w.nodeId === n.parentId);
          const upBtn = n.parentId ? `<button class="btn small" data-up="${n.id}" ${parents.length && !missing(save, n.upgrade).length ? '' : 'disabled'}>強化</button>` : '';
          const mkBtn = n.tier > 0 ? `<button class="btn small" data-make-weapon="${n.id}" ${missing(save, n.craft).length ? 'disabled' : ''}>作る</button>` : '';
          return `<div class="card tree-node tier${n.depth}">${weaponThumb(n)}<span class="t"><b>${esc(n.name)}${mine ? `<em>持っている ${mine}</em>` : ''}</b><small>${esc(weaponLine(n))}</small>
            ${n.tier > 0 ? `<small>作る：${costText(save, n.craft)}</small><small>強化（${esc(find.weapon(n.parentId).name)}から）：${costText(save, n.upgrade)}</small>` : '<small>はじめから持っている</small>'}</span>
            <span class="acts">${mkBtn}${upBtn}</span></div>`;
        }).join('')}</div>${hiddenNote(tree.length - shown.length)}
        <p class="note">「作る」は新しく1本作る（素材が多い）。「強化」は手持ちの1つ前の武器を作りかえる（素材が少ない）。ほかの派生も、別の武器として作れる。</p>`;
    } else if (tab === 'armor') {
      const all = CATALOG.armors.filter(pc => !pc.dev);
      const shownA = all.filter(pc => (rankOk(pc) && (pc.gather || knownMon(find.set(pc.setId)?.monsterId))) || save.inventory.armors.some(a => a.pieceId === pc.id)); // 採取の防具は上位が開いたら見える
      body = `<h2>防具を作る</h2>${shownA.length ? '' : '<p class="empty">大型に出会うと、その素材で作れる防具がわかる。</p>'}<div class="list">${shownA.map(pc => `<div class="card">${armThumb(pc)}<span class="t"><b>${esc(pc.name)}</b><small>守り${pc.def}・${Object.entries(pc.skills).map(([k, n]) => `${find.skill(k).name}+${n}`).join('・')}${pc.unique ? `・固有：${esc(pc.unique.name)}（${esc(grantText(pc.unique.grants))}）` : ''}</small><small>${costText(save, pc.craft)}</small></span><span class="acts"><button class="btn small" data-make-armor="${pc.id}" ${missing(save, pc.craft).length ? 'disabled' : ''}>作る</button></span></div>`).join('')}</div>${hiddenNote(all.length - shownA.length)}
        <h2>手持ちの防具を強化</h2>${save.inventory.armors.length ? `<div class="list">${save.inventory.armors.map(a => { const pc = find.armor(a.pieceId); const max = a.level >= armorMaxLevel(pc); const c = armorUpgradeCost(pc, a.level); return `<div class="card">${armThumb(pc)}<span class="t"><b>${esc(pc.name)} Lv${a.level}${max ? '<em>最大</em>' : ''}</b><small>${max ? 'これ以上強くできない' : `Lv${a.level + 1}へ（守り+${pc.defPerLevel ?? 2}）：${costText(save, c)}`}</small></span><span class="acts"><button class="btn small" data-up-armor="${a.uid}" ${max || missing(save, c).length ? 'disabled' : ''}>強化</button></span></div>`; }).join('')}</div>` : '<p class="empty">まだ持っていない。</p>'}`;
    } else {
      const allD = CATALOG.decorations.filter(d => !d.dev || (DEV && save.inventory.decorations[d.id]));
      const shownD = allD.filter(d => save.inventory.decorations[d.id] || (rankOk(d) && Object.keys(d.craft).every(knownMat)));
      body = `<h2>装飾品を作る</h2>${shownD.length ? '' : '<p class="empty">素材を手に入れると、作れる装飾品がわかる。</p>'}<div class="list">${shownD.map(d => `<div class="card"><span class="t"><b>${esc(d.name)}（${({ s: '小', m: '中', l: '大' })[d.size]}）<em>持っている ${save.inventory.decorations[d.id] || 0}</em></b><small>${esc(find.skill(d.skillId).name)}+${d.points}</small><small>${costText(save, d.craft)}</small></span><span class="acts"><button class="btn small" data-make-deco="${d.id}" ${missing(save, d.craft).length ? 'disabled' : ''}>作る</button></span></div>`).join('')}</div>${allD.length - shownD.length ? `<p class="note">まだ知らない素材で作る装飾品が、ほかに ${allD.length - shownD.length} 種類あります。</p>` : ''}`;
    }
    const mats = CATALOG.materials.filter(m => save.inventory.materials[m.id] > 0 && (!m.dev || DEV)).map(m => `${esc(m.name)} ${save.inventory.materials[m.id]}`).join('　') || 'まだない';
    return `
      <div class="head"><div><div class="place">WORKSHOP</div><h1>工房</h1></div></div>
      <div class="bottombar tabs">${tabs}</div>
      <div class="paper">${npcBox(save, 'fac_workshop')}${body}
        <h2>素材</h2><p class="note">${mats}</p>
        ${DEV ? '<button class="btn dev" data-gift>試験用の素材を受け取る（開発用）</button>' : ''}
      </div>
      <div class="bottombar"><button class="btn" data-back>拠点へ戻る</button></div>`;
  },
  bind(el, ctx, p) {
    bindNpc(el, ctx);
    const s = () => ctx.store.get();
    const stay = extra => ctx.screens.go('workshop', { ...p, ...extra }, { replace: true });
    const done = (r, msg) => { if (!r.ok) { toast(r.missing ? `素材が足りない：${r.missing.map(m => `${m.name}あと${m.need - m.have}`).join('・')}` : r.error); return; } ctx.autosave(); toast(msg); stay({}); };
    el.querySelector('[data-back]').onclick = () => ctx.screens.back('base');
    el.querySelectorAll('[data-tab]').forEach(b => { b.onclick = () => stay({ tab: b.dataset.tab }); });
    el.querySelectorAll('[data-kind]').forEach(b => { b.onclick = () => stay({ kind: b.dataset.kind }); });
    el.querySelectorAll('[data-make-weapon]').forEach(b => { b.onclick = () => done(craftWeapon(s(), b.dataset.makeWeapon), `${find.weapon(b.dataset.makeWeapon).name}を作った`); });
    el.querySelectorAll('[data-up]').forEach(b => {
      b.onclick = () => {
        const n = find.weapon(b.dataset.up); const w = s().inventory.weapons.find(x => x.nodeId === n.parentId);
        done(upgradeWeapon(s(), w.uid, n.id), `${n.name}に強化した`);
      };
    });
    el.querySelectorAll('[data-make-armor]').forEach(b => { b.onclick = () => done(craftArmor(s(), b.dataset.makeArmor), `${find.armor(b.dataset.makeArmor).name}を作った`); });
    el.querySelectorAll('[data-up-armor]').forEach(b => { b.onclick = () => done(upgradeArmor(s(), Number(b.dataset.upArmor)), '防具を強化した'); });
    el.querySelectorAll('[data-make-deco]').forEach(b => { b.onclick = () => done(craftDeco(s(), b.dataset.makeDeco), `${find.deco(b.dataset.makeDeco).name}を作った`); });
    const gift = el.querySelector('[data-gift]'); if (gift) gift.onclick = () => {
      ctx.store.update(st => { for (const [m, n] of Object.entries(TEST_MATERIAL_GIFT)) st.inventory.materials[m] = (st.inventory.materials[m] || 0) + n; return st; });
      ctx.autosave(); toast('試験用の素材を受け取った'); stay({});
    };
  },
};
