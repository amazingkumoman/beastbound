// 研究施設と図鑑（13章・25b 4章）。研究の段階ごとに、見せる情報を増やす。
// 未遭遇の種・手に入れていない素材・持っていない装備は、一覧にも出さない（22章）。数字（体力・倍率）は出さない（D-04・Q-06）。
import { esc } from '../components.js';
import { SPECIES as MONSTERS } from '../../../data/species.js';
import { SKILLS, ELEMENTS } from '../../../data/skills.js';
import { ITEMS } from '../../../data/items.js';
import { researchStage, STAGE_NAMES } from '../../systems/story/story.js';
import { find as huntFind, TIME_NAME, rarityOf } from '../../systems/hunt/hunt.js';
import { find } from '../../systems/gear/gear.js';
import { npcBox, bindNpc } from './intro.js';
import { matName } from './town.js';

import { weakWords } from '../../systems/story/weak.js';

export const labScreen = {
  id: 'lab',
  render(ctx, p) {
    const save = ctx.store.get(), tab = p.tab || 'mon';
    const tabs = [['mon', '大型'], ['mat', '素材'], ['etc', '道具・スキル']].map(([k, n]) => `<button class="btn ${tab === k ? 'main' : ''}" data-tab="${k}">${n}</button>`).join('');
    let body = '';
    if (tab === 'mon') {
      const known = MONSTERS.map(m => ({ m, ...researchStage(save, m.id) })).filter(x => x.stage > 0);
      body = known.length ? `<div class="list">${known.map(({ m, stage, need }) => `
        <button class="card pick" data-mon="${m.id}"><span class="t"><b>${esc(m.name)}<em>${STAGE_NAMES[stage]}</em></b><small>${esc(m.alias)}</small>
          ${need.length ? `<small>次の研究には：${esc(need[0])}</small>` : '<small>研究完了</small>'}</span><span class="go">›</span></button>`).join('')}</div>`
        : '<p class="empty">まだ記録がない。探索で大型に出会うと、ここに記録される。</p>';
    } else if (tab === 'mat') {
      const mats = Object.keys({ ...(save.matLog || {}), ...Object.fromEntries(Object.entries(save.inventory.materials).filter(([, n]) => n > 0)) })
        .filter(id => !find.material(id)?.dev).sort((a, b) => (find.material(a)?.rarity ?? 1) - (find.material(b)?.rarity ?? 1));
      body = mats.length ? `<div class="list">${mats.map(id => `<div class="card"><span class="t"><b>${matName(id)}<em>${rarityOf(find.material(id)?.rarity ?? 1).name}</em></b>
        <small>${(save.matLog?.[id] || []).map(esc).join('／') || '入手した場所の記録なし'}</small></span></div>`).join('')}</div>` : '<p class="empty">まだ素材を手に入れていない。</p>';
    } else {
      const skillIds = new Set();
      for (const a of save.inventory.armors) Object.keys(find.armor(a.pieceId)?.skills || {}).forEach(k => skillIds.add(k));
      for (const [d, n] of Object.entries(save.inventory.decorations || {})) if (n > 0) skillIds.add(find.deco(d)?.skillId);
      const items = ITEMS.filter(it => save.inventory.items[it.id] != null);
      body = `<h2>道具</h2><div class="list">${items.map(it => `<div class="card"><span class="t"><b>${esc(it.name)}</b><small>${esc(it.desc)}</small></span></div>`).join('')}</div>
        <h2>知っているスキル</h2>${skillIds.size ? `<div class="list">${SKILLS.filter(s => skillIds.has(s.id)).map(s => `<div class="card"><span class="t"><b>${esc(s.name)}<em>${esc(s.group)}</em></b><small>${s.levels.map((v, i) => `Lv${i + 1}：${esc(s.desc(v))}`).join('　')}</small></span></div>`).join('')}</div>` : '<p class="empty">防具や装飾品を作ると、スキルが記録される。</p>'}`;
    }
    return `
      <div class="head"><div><div class="place">LABORATORY</div><h1>研究施設</h1></div></div>
      <div class="bottombar tabs">${tabs}</div>
      <div class="paper">${npcBox(save, 'fac_lab')}${body}</div>
      <div class="bottombar"><button class="btn" data-back>拠点へ戻る</button></div>`;
  },
  bind(el, ctx, p) {
    bindNpc(el, ctx);
    el.querySelector('[data-back]').onclick = () => ctx.screens.back('base');
    el.querySelectorAll('[data-tab]').forEach(b => { b.onclick = () => ctx.screens.go('lab', { tab: b.dataset.tab }, { replace: true }); });
    el.querySelectorAll('[data-mon]').forEach(b => { b.onclick = () => ctx.screens.go('labMonster', { id: b.dataset.mon }); });
  },
};

export const labMonsterScreen = {
  id: 'labMonster',
  render(ctx, p) {
    const save = ctx.store.get(), mon = MONSTERS.find(m => m.id === p.id), r = save.research?.[p.id] || {};
    const { stage, need } = researchStage(save, p.id);
    if (stage === 0) return '<div class="paper"><p class="empty">記録がない。</p></div><div class="bottombar"><button class="btn" data-back>戻る</button></div>';
    const sec = (min, title, html) => stage >= min ? `<h2>${title}</h2>${html}` : `<h2 class="locked">${title}</h2><p class="note">（${STAGE_NAMES[min]}で記録される）</p>`;
    const acts = mon.acts.filter(a => r.acts?.[a.id]);
    const places = Object.keys(r.places || {}).map(k => { const [f, pt, t] = k.split(':'); const fl = huntFind.field(f); return `${fl?.name ?? ''}・${fl?.points.find(x => x.id === pt)?.name ?? ''}（${TIME_NAME[t]}）`; });
    return `
      <div class="head"><div><div class="place">FIELD NOTES</div><h1>${esc(mon.name)}</h1></div><div class="who"><b>${STAGE_NAMES[stage]}</b><span>${esc(mon.alias)}</span></div></div>
      <div class="paper">
        <div class="lab-art ${stage < 2 ? 'silhouette' : ''}">${window.ART.img(mon.art)}</div>
        <p class="note">分類：${esc(mon.lore.kind)}</p>
        <p class="note">出会った ${r.seen || 0}回・観察 ${r.observed || 0}回・討伐 ${r.hunted || 0}回・捕獲 ${r.captured || 0}回</p>
        ${need.length ? `<p class="note">次の研究には：<b>${esc(need[0])}</b></p>` : ''}
        ${sec(2, '見た行動', acts.length ? `<ul class="lab-list">${acts.map(a => `<li><b>${esc(a.name)}</b>${a.tell ? `<small>${esc(a.tell)}</small>` : ''}</li>`).join('')}</ul>` : '<p class="note">戦闘で見た行動がここに記録される。</p>')}
        ${sec(3, '暮らし', `<p class="note">${esc(mon.lore.habits)}</p>${places.length ? `<p class="note">出会った場所：${places.map(esc).join('／')}</p>` : ''}`)}
        ${sec(4, '効きやすいところ', `<ul class="lab-list">${weakWords(mon).map(w => `<li>${esc(w)}</li>`).join('')}</ul><p class="note">怒りやすいとき：${esc(mon.lore.rage)}</p>`)}
        ${sec(5, '研究の知見', `<p class="note">${esc(mon.lore.ecology)}</p><p class="note">攻略の知見：${esc(mon.lore.tips)}</p>${mon.capture ? `<p class="note">捕獲の目安：弱って「${esc(mon.capture.text.replace(/（.*）/, ''))}」ようになったら。</p>` : ''}`)}
      </div>
      <div class="bottombar"><button class="btn" data-back>戻る</button></div>`;
  },
  bind(el, ctx) { el.querySelector('[data-back]').onclick = () => ctx.screens.back('lab'); },
};
