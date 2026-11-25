// 探索マップと狩りの結果（24 仕様書・24b 3章）。しくみは systems/hunt/hunt.js。
// ポイントを押すと移動（行動回数は使わない）。下の詳細パネルで採取・調査・観察・戦う。
import { esc, toast, confirmDialog } from '../components.js';
import { WEAPON_KINDS } from '../../../data/weapons.js';
import {
  find as huntFind, TIME_NAME, timeId, actionsLeft, monstersAt, monsterPoint, pointActions, moveTo, doAction,
  goalStatus, extraStatus, battleSetup, finishQuest, fieldMonsters,
} from '../../systems/hunt/hunt.js';
import { money, matName } from './town.js';

export const exploreScreen = {
  id: 'explore',
  render(ctx, p) {
    const save = ctx.store.get(), exp = save.suspend;
    if (!exp) return '<div class="paper"><p class="empty">探索中ではありません。</p></div><div class="bottombar"><button class="btn" data-home>拠点へ</button></div>';
    const q = huntFind.quest(exp.questId), field = huntFind.field(exp.fieldId), t = timeId(exp);
    const gs = goalStatus(save), xs = extraStatus(save);
    const here = field.points.find(pt => pt.id === exp.point);
    const mons = monstersAt(exp, exp.point);
    const marks = Object.fromEntries(fieldMonsters(exp).map(e => [monsterPoint(exp, e), e]).filter(([k]) => k));
    const acts = exp.failed ? [] : pointActions(exp, exp.point);
    const lines = (p.lines?.length ? p.lines : exp.log.slice(-2));
    return `
      <div class="head explore-head"><div><div class="place">${esc(field.name)}</div><h1>${esc(q.name)}</h1></div>
        <div class="who"><b class="time t-${t}">${TIME_NAME[t]}</b><span>行動 ${actionsLeft(exp)}/${exp.actionsMax}・力尽き ${exp.faints}/3</span></div></div>
      <div class="goal-strip"><span class="${gs.done ? 'ok' : ''}">${gs.done ? '✓ ' : ''}${esc(gs.text)}</span>${xs.map(x => `<span class="${x.done ? 'ok' : 'sub'}">${x.done ? '✓' : '・'}${esc(x.text)}</span>`).join('')}</div>
      <div class="map t-${t}" data-art-bg="${esc(field.art)}">
        ${field.points.map(pt => {
          const m = marks[pt.id], d = exp.done[pt.id] || {};
          return `<button class="pt ${pt.id === exp.point ? 'here' : ''} ${pt.camp ? 'camp' : ''} ${m ? 'mon' : ''}" data-pt="${pt.id}" style="left:${pt.x}%;top:${pt.y}%" aria-label="${esc(pt.name)}へ移動">
            <i></i><span>${esc(pt.name)}${m ? `<em>${esc(huntFind.monster(m.monsterId).name)}${exp.mons[m.monsterId].state === 'fled' ? '（逃走中）' : ''}</em>` : ''}${d.gather || d.survey ? '<small>済</small>' : ''}</span></button>`;
        }).join('')}
      </div>
      <div class="paper detail">
        <h2>${esc(here.name)}</h2>
        <p class="note">${esc(here.text)}</p>
        ${mons.map(m => `<p class="note warn">${esc(m.name)}がいる。${exp.mons[m.id].snap ? '（前に戦った傷が残っている）' : ''}</p>`).join('')}
        <div class="log" aria-live="polite">${lines.map(l => `<p>${esc(l)}</p>`).join('')}</div>
        ${exp.failed ? '<p class="note short">クエストは失敗した。拠点へ戻ろう。</p>' : `<div class="acts-row">${acts.map(a => `<button class="btn small ${a.id === 'fight' ? 'main' : ''}" data-act="${a.id}" data-mon="${a.monsterId || ''}" ${a.disabled ? 'disabled' : ''}>${esc(a.label)}${a.disabled && a.reason ? `<small>${esc(a.reason)}</small>` : a.id !== 'fight' ? '<small>行動1回</small>' : ''}</button>`).join('') || '<p class="note">ここでできることはない。</p>'}</div>`}
      </div>
      <div class="bottombar">
        <button class="btn" data-pause>中断する<small>タイトルへ・続きから再開</small></button>
        <button class="btn ${gs.done || gs.free || exp.failed ? 'main' : ''}" data-return>${exp.failed ? '結果を見る' : gs.done ? '達成して帰る' : gs.free ? '探索を終える' : '帰還する'}<small>${exp.failed ? '失敗' : gs.done || gs.free ? '拠点へ' : '撤退（失敗）'}</small></button>
      </div>`;
  },
  bind(el, ctx, p) {
    const save = () => ctx.store.get();
    if (!save()?.suspend) { el.querySelector('[data-home]').onclick = () => ctx.screens.reset('base'); return; }
    const stay = lines => ctx.screens.go('explore', { lines }, { replace: true });
    if (save().suspend.inBattle) { // 戦闘中に閉じた：戦闘の直前から（Q-20）
      save().suspend.inBattle = null; ctx.autosave();
      return stay(['戦闘の直前から再開した。']);
    }
    el.querySelectorAll('[data-pt]').forEach(b => {
      b.onclick = () => {
        if (b.dataset.pt === save().suspend.point) return;
        const r = moveTo(save(), b.dataset.pt); if (!r.ok) return toast(r.error);
        ctx.autosave();
        const name = huntFind.field(save().suspend.fieldId).points.find(x => x.id === b.dataset.pt).name;
        stay([`${name}へ移動した。`, ...r.monsters.map(m => `${m.name}がいる！`)]);
      };
    });
    el.querySelectorAll('[data-act]').forEach(b => {
      b.onclick = () => {
        const kind = b.dataset.act, monId = b.dataset.mon || undefined;
        if (kind === 'fight') {
          const params = battleSetup(save(), monId);
          ctx.autosave(); // 戦闘の直前の状態を残す（閉じたらここから）
          ctx.screens.go('battle', params, { replace: true });
          return;
        }
        const r = doAction(save(), kind, monId); if (!r.ok) return toast(r.error);
        ctx.autosave(); stay(r.lines);
      };
    });
    el.querySelector('[data-pause]').onclick = () => { ctx.autosave(); toast('探索を中断しました。「つづきから」で再開できます'); ctx.screens.reset('title'); };
    el.querySelector('[data-return]').onclick = async () => {
      const exp = save().suspend, gs = goalStatus(save());
      if (!exp.failed && !gs.done && !gs.free) {
        const ok = await confirmDialog({ title: '帰還しますか？', body: '<p>目標を達成していないので、クエストは失敗（撤退）になります。報酬はありませんが、探索で拾った素材は持ち帰ります。</p>', ok: '帰還する', danger: true });
        if (!ok) return;
      }
      const r = finishQuest(save()); if (!r.ok) return toast(r.error);
      ctx.autosave(); ctx.screens.reset('huntResult');
    };
  },
};

export const huntResultScreen = {
  id: 'huntResult',
  render(ctx) {
    const r = ctx.store.get().lastHunt;
    if (!r) return '<div class="bottombar"><button class="btn" data-back>拠点へ</button></div>';
    const title = { clear: 'クエスト達成', fail: 'クエスト失敗', retreat: '撤退', free: '探索終了' }[r.outcome];
    const why = { faint: '3回力尽きた。', time: '制限時間を過ぎた。', retreat: '戦いから撤退した。', killed: '捕獲するはずの相手を仕留めてしまった。' }[r.reason] || (r.outcome === 'retreat' ? '目標を達成せずに帰還した。' : '');
    const list = obj => Object.entries(obj).filter(([, n]) => n > 0).map(([id, n]) => `<li>${matName(id, n)}</li>`).join('') || '<li>なし</li>';
    const used = Object.entries(r.used).map(([id, n]) => `${esc(huntFind.item(id)?.name ?? id)} ${n}`).join('・') || 'なし';
    return `
      <div class="head"><div><div class="place">RESULT</div><h1>${title}</h1></div></div>
      <div class="paper">
        <h2>${esc(r.name)}</h2>
        ${why ? `<p class="note">${esc(why)}</p>` : ''}
        ${r.outcome === 'clear' ? `<p class="note">報酬 <b>${money(r.money)}</b>${r.extras.length ? `（追加の目的：${r.extras.map(esc).join('・')}）` : ''}</p><h2>報酬の素材</h2><ul class="mat-list">${list(r.reward)}</ul>` : ''}
        <h2>探索で拾った物</h2><ul class="mat-list">${list(r.gathered)}</ul>
        <p class="note">使った道具：${used}</p>
        ${r.mastery.length ? `<h2>熟練度</h2>${r.mastery.map(m => `<p class="note">${esc(WEAPON_KINDS[m.kindId].name)}：経験 +${m.gain}${m.up ? `・<b>段階 ${m.level} に上がった！</b>` : ''}</p>`).join('')}` : ''}
      </div>
      <div class="bottombar"><button class="btn main" data-back autofocus>拠点へ戻る</button></div>`;
  },
  bind(el, ctx) { el.querySelector('[data-back]').onclick = () => ctx.screens.reset('base'); },
};
