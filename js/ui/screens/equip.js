// 装備画面（拠点）。22 防具・装飾品仕様書 7章・22b 6章。
// 武器・防具5部位・装飾品・技をまとめて見て変える。戦闘中は変えられない（D-24）。
import { esc, toast } from '../components.js';
import { find, grantText, computeGear, equipWeapon, equipArmor, setDeco, setTechs, decoFree, slotFits, battleWeapon } from '../../systems/gear/gear.js';
import { WEAPON_KINDS, TECH_SLOTS, masteryLevel, unlockedTechs } from '../../../data/weapons.js';
import { ELEMENTS } from '../../../data/skills.js';
import { WEAPON_TYPES } from '../../../data/index.js';
import { learnStatus, learnTech, isLearned } from '../../systems/gear/learn.js';

/** 覚える素材の書き方（まだ手に入れたことのない素材は名前を出さない） */
function learnCost(save, mats) {
  return Object.entries(mats || {}).map(([m, n]) => {
    const known = m in save.inventory.materials || !!save.matLog?.[m];
    const have = save.inventory.materials[m] || 0;
    return `<span class="${have < n ? 'short' : ''}">${known ? esc(find.material(m)?.name ?? m) : '？？？の素材'} ${n}（${have}）</span>`;
  }).join('・');
}

const SLOT_NAME = { s: '小', m: '中', l: '大' };
const elemName = id => ELEMENTS.find(e => e.id === id)?.name ?? id;
const ailName = { poison: '毒', paralysis: '麻痺', sleep: '睡眠', bleed: '出血' };

/** 武器の絵のキー：系統ごとの絵があればそれ、なければ種類の絵（強化していく武器は同じ絵） */
export function weaponArt(node) {
  const M = window.ART_MANIFEST || {};
  const m = node.id.match(/^wpn_([a-z]+)_(.+)_([^_]+)$/);
  const key = m ? (m[2] === 'x' ? `wpn.${m[1]}.x_${m[3]}` : `wpn.${m[1]}.${m[2]}`) : null; // 希少素材の最後の段は素材ごと
  if (key && M[key]) return key;
  return WEAPON_TYPES.find(t => t.id === node.kindId)?.art ?? '';
}
export const weaponThumb = node => `<span class="arm-thumb">${window.ART?.img(weaponArt(node), 'loading="lazy"') ?? ''}</span>`;

export function weaponLine(node) {
  const k = WEAPON_KINDS[node.kindId];
  const extra = node.element ? `・${elemName(node.element.type)}${node.element.value}` : node.ail ? `・${ailName[node.ail.type] ?? node.ail.type}${node.ail.value}` : '';
  return `攻撃力${Math.round(k.power * node.powerMult)}${extra}・穴 ${node.slots.map(x => SLOT_NAME[x]).join('') || 'なし'}`;
}

function summary(ctx, g) {
  const sk = Object.entries(g.effective).map(([k, l]) => { const s = find.skill(k); return `<li><b>${esc(s.name)} Lv${l}</b><small>${esc(s.desc(s.levels[l - 1]))}${g.skills[k] ? `（点 ${g.points[k]}）` : ''}</small></li>`; }).join('');
  const res = Object.entries(g.resist).filter(([, v]) => v).map(([e, v]) => `${elemName(e)}${v > 0 ? '+' : ''}${v}`).join('　');
  return `
    <div class="stat-row"><span>守り</span><b>${g.def}</b><span>耐性</span><b class="small">${esc(res || 'なし')}</b></div>
    <h3>スキル</h3>${sk ? `<ul class="skill-list">${sk}</ul>` : '<p class="empty">まだない</p>'}
    <h3>セットボーナス</h3>${g.setBonuses.length ? `<ul class="skill-list">${g.setBonuses.map(b => `<li><b>${esc(b.name)}</b><small>${b.pieces}部位：${esc(grantText(b.grants, true))}になる</small></li>`).join('')}</ul>` : '<p class="empty">なし（同じモンスターの防具を2部位・4部位つけると出る）</p>'}
    ${g.uniques.length ? `<h3>固有スキル</h3><ul class="skill-list">${g.uniques.map(u => `<li><b>${esc(u.name)}</b><small>${esc(grantText(u.grants, true))}になる</small></li>`).join('')}</ul><p class="note">固有スキル・セットボーナスは、そのスキルをそのLvにする（装備の点でもっと高いときは、高いほう）。</p>` : ''}`;
}

function slotsHtml(kind, item, slots) {
  return slots.map((sz, i) => {
    const d = item.decos[i] && find.deco(item.decos[i]);
    return `<button class="slot-btn" data-slot="${kind}:${item.uid}:${i}">${SLOT_NAME[sz]}：${d ? esc(d.name) : '空き'}</button>`;
  }).join('') || '<span class="note">穴なし</span>';
}

export const equipScreen = {
  id: 'equip',
  render(ctx, p) {
    const save = ctx.store.get();
    const g = computeGear(save);
    const view = p.view || 'main';
    const head = `<div class="head"><div><div class="place">EQUIPMENT</div><h1>装備</h1></div></div>`;
    const foot = `<div class="bottombar"><button class="btn" data-back>${view === 'main' ? '拠点へ戻る' : '戻る'}</button></div>`;

    if (view === 'weapon') {
      return `${head}<div class="paper"><h2>武器を持ちかえる</h2><div class="list">${save.inventory.weapons.map(w => {
        const n = find.weapon(w.nodeId);
        return `<button class="card pick" data-weapon="${w.uid}" ${w.uid === save.loadout.weaponUid ? 'aria-current="true"' : ''}>${weaponThumb(n)}<span class="t"><b>${esc(n.name)}${w.uid === save.loadout.weaponUid ? '<em>装備中</em>' : ''}</b><small>${esc(weaponLine(n))}</small></span></button>`;
      }).join('')}</div></div>${foot}`;
    }
    if (view.startsWith('armor:')) {
      const part = view.slice(6);
      const own = save.inventory.armors.filter(a => find.armor(a.pieceId).part === part);
      const now = save.loadout.armor[part];
      return `${head}<div class="paper"><h2>${esc(ctx.data.ARMOR_PARTS.find(x => x.id === part).name)}</h2><div class="list">
        <button class="card pick" data-armor="" ${!now ? 'aria-current="true"' : ''}><span class="t"><b>なし</b></span></button>
        ${own.map(a => { const pc = find.armor(a.pieceId); return `<button class="card pick" data-armor="${a.uid}" ${a.uid === now ? 'aria-current="true"' : ''}>${pc.art ? `<span class="arm-thumb">${window.ART.img(pc.art, 'loading="lazy"')}</span>` : ''}<span class="t"><b>${esc(pc.name)} Lv${a.level}${a.uid === now ? '<em>装備中</em>' : ''}</b><small>守り${pc.def + (pc.defPerLevel ?? 2) * (a.level - 1)}・${Object.entries(pc.skills).map(([k, n]) => `${find.skill(k).name}+${n}`).join('・')}${pc.unique ? `・固有：${pc.unique.name}（${grantText(pc.unique.grants)}）` : ''}</small></span></button>`; }).join('')}
        ${own.length ? '' : '<p class="empty">この部位の防具を持っていない。工房で作れる。</p>'}</div></div>${foot}`;
    }
    if (view.startsWith('deco:')) {
      const [, kind, uid, idx] = view.split(':');
      const list = kind === 'weapon' ? save.inventory.weapons : save.inventory.armors;
      const item = list.find(x => x.uid === Number(uid));
      const size = (kind === 'weapon' ? find.weapon(item.nodeId) : find.armor(item.pieceId)).slots[idx];
      const decos = Object.keys(save.inventory.decorations).map(find.deco).filter(d => d && slotFits(size, d.size));
      return `${head}<div class="paper"><h2>穴（${SLOT_NAME[size]}）にはめる装飾品</h2><div class="list">
        <button class="card pick" data-deco=""><span class="t"><b>外す</b><small>外しても装飾品はなくならない</small></span></button>
        ${decos.map(d => `<button class="card pick" data-deco="${d.id}" ${decoFree(save, d.id) <= 0 && item.decos[idx] !== d.id ? 'disabled' : ''}><span class="t"><b>${esc(d.name)}（${SLOT_NAME[d.size]}）</b><small>${esc(find.skill(d.skillId).name)}+${d.points}・空き ${decoFree(save, d.id)}個</small></span></button>`).join('')}
        ${decos.length ? '' : '<p class="empty">はめられる装飾品を持っていない。工房で作れる。</p>'}</div></div>${foot}`;
    }
    if (view === 'techs') {
      const node = find.weapon(g.weaponItem.nodeId), kind = node.kindId;
      const lv = masteryLevel(save.mastery?.[kind] ?? 0);
      const chosen = new Set(save.loadout.techs[kind] ?? WEAPON_KINDS[kind].techs.filter(t => t.unlock === 0).map(t => t.id));
      return `${head}<div class="paper"><h2>${esc(WEAPON_KINDS[kind].name)}の技（${TECH_SLOTS}つまで）</h2><p class="note">熟練度 ${lv}。熟練度が届いた技は、研究と素材で覚えられる（覚えた技はずっと使える）。</p><div class="list">
        ${WEAPON_KINDS[kind].techs.map(t => {
          if (isLearned(save, kind, t)) return `<label class="card tech-pick"><input type="checkbox" value="${t.id}" ${chosen.has(t.id) ? 'checked' : ''}><span class="t"><b>${esc(t.name)}<em>${t.unlock ? `熟練度${t.unlock}` : 'はじめから'}</em>${t.rank === 'high' ? '<em>上位</em>' : t.rank === 'master' ? '<em>マスター級</em>' : ''}</b><small>気力${t.st}・${esc(t.desc)}</small></span></label>`;
          const ls = learnStatus(save, kind, t);
          if (!ls.visible) return '';
          if (!ls.reachable) return `<div class="card tech-pick locked"><span class="t"><b>？？？<em>熟練度${t.unlock}で覚える</em>${t.rank === 'high' ? '<em>上位</em>' : ''}</b><small>まだ覚えていない技</small></span></div>`;
          const r = ls.research;
          return `<div class="card tech-pick learnable"><span class="t"><b>？？？<em>熟練度${t.unlock}</em>${t.rank === 'high' ? '<em>上位</em>' : ''}</b>
            <small>覚えるには：${r ? `<span class="${r.have < r.stage ? 'short' : ''}">${esc(r.name)}の研究「${esc(r.stageName)}」</span>・` : ''}${learnCost(save, t.learn?.mats)}</small></span>
            <span class="acts"><button class="btn small" data-learn="${t.id}" ${ls.ok ? '' : 'disabled'}>覚える</button></span></div>`;
        }).join('')}
        </div></div><div class="bottombar"><button class="btn" data-back>やめる</button><button class="btn main" data-save-techs>決める</button></div>`;
    }

    // 一覧
    const wn = find.weapon(g.weaponItem.nodeId);
    const techNames = battleWeapon(save).weapon.techs.map(t => t.name).join('・') || 'なし';
    return `${head}<div class="paper">
      <h2>武器</h2>
      <div class="equip-row"><button class="card pick" data-go="weapon">${weaponThumb(wn)}<span class="t"><b>${esc(wn.name)}</b><small>${esc(weaponLine(wn))}</small></span><span class="go">›</span></button>
        <div class="slots">${slotsHtml('weapon', g.weaponItem, wn.slots)}</div>
        <button class="card pick" data-go="techs"><span class="t"><b>技</b><small>${esc(techNames)}</small></span><span class="go">›</span></button></div>
      <h2>防具</h2>
      ${ctx.data.ARMOR_PARTS.map(({ id, name }) => { const a = g.armors[id]; return `<div class="equip-row"><button class="card pick" data-go="armor:${id}">${a?.piece.art ? `<span class="arm-thumb">${window.ART.img(a.piece.art, 'loading="lazy"')}</span>` : ''}<span class="t"><b>${esc(name)}：${a ? `${esc(a.piece.name)} Lv${a.item.level}` : 'なし'}</b><small>${a ? `守り${a.def}` : ''}</small></span><span class="go">›</span></button>${a ? `<div class="slots">${slotsHtml('armor', a.item, a.piece.slots)}</div>` : ''}</div>`; }).join('')}
      <h2>いまの効果</h2>${summary(ctx, g)}
    </div>${foot}`;
  },
  bind(el, ctx, p) {
    const view = p.view || 'main';
    const save = () => ctx.store.get();
    const done = (r, msg) => { if (!r.ok) { toast(r.error); return; } ctx.autosave(); if (msg) toast(msg); ctx.screens.go('equip', {}, { replace: true }); };
    el.querySelector('[data-back]').onclick = () => (view === 'main' ? ctx.screens.back('base') : ctx.screens.go('equip', {}, { replace: true }));
    el.querySelectorAll('[data-go]').forEach(b => { b.onclick = () => ctx.screens.go('equip', { view: b.dataset.go }, { replace: true }); });
    el.querySelectorAll('[data-slot]').forEach(b => { b.onclick = () => ctx.screens.go('equip', { view: `deco:${b.dataset.slot}` }, { replace: true }); });
    el.querySelectorAll('[data-weapon]').forEach(b => { b.onclick = () => done(equipWeapon(save(), Number(b.dataset.weapon))); });
    el.querySelectorAll('[data-armor]').forEach(b => { b.onclick = () => done(equipArmor(save(), view.slice(6), b.dataset.armor ? Number(b.dataset.armor) : null)); });
    el.querySelectorAll('[data-deco]').forEach(b => {
      b.onclick = () => { const [, kind, uid, idx] = view.split(':'); done(setDeco(save(), kind, Number(uid), Number(idx), b.dataset.deco || null)); };
    });
    el.querySelectorAll('[data-learn]').forEach(b => {
      b.onclick = () => {
        const kind = find.weapon(computeGear(save()).weaponItem.nodeId).kindId;
        const r = learnTech(save(), kind, b.dataset.learn);
        if (!r.ok) { toast(r.error); return; }
        ctx.autosave(); toast(`技を覚えた：${r.tech.name}`);
        ctx.screens.go('equip', { view: 'techs' }, { replace: true });
      };
    });
    const st = el.querySelector('[data-save-techs]');
    if (st) {
      const boxes = [...el.querySelectorAll('.tech-pick input')];
      const sync = () => { const on = boxes.filter(b => b.checked).length; boxes.forEach(b => { if (!b.checked && !b.closest('.locked')) b.disabled = on >= TECH_SLOTS; }); };
      boxes.forEach(b => { b.onchange = sync; }); sync();
      st.onclick = () => {
        const ids = boxes.filter(b => b.checked).map(b => b.value);
        if (!ids.length) { toast('技を1つ以上選んでください'); return; }
        done(setTechs(save(), find.weapon(computeGear(save()).weaponItem.nodeId).kindId, ids), '技を決めました');
      };
    }
  },
};
