// 導入・物語の場面・担当の人たちの一言（正式方針3-5・25b 2・3章）。
// 中身の文は data/story.js。ここは「1行ずつ見せる」画面と、施設の上に出す一言の部品。
import { esc } from '../components.js';
import { INTRO, STORY_EVENTS, NPCS } from '../../../data/story.js';
import { npcOf, npcLine, npcEpisode, markSeen } from '../../systems/story/story.js';

const fill = (s, save) => s.replace('{name}', save?.profile?.name ?? '');

/** 1行ずつ見せる場面。p.kind：intro（導入）／event（物語の出来事）／episode（個別の話） */
export const sceneScreen = {
  id: 'scene',
  render(ctx, p) {
    return `
      <div class="bgimg" data-art-bg="bg.base.main"></div>
      <div class="shade"></div>
      <div class="intro">
        ${p.title ? `<p class="scene-title">${esc(p.title)}</p>` : ''}
        <p class="intro-who"></p>
        <div class="paper intro-text" aria-live="polite"></div>
        <div class="row-btns">
          <button class="btn" data-skip>とばす</button>
          <button class="btn main" data-next autofocus>進む</button>
        </div>
      </div>`;
  },
  bind(el, ctx, p) {
    const save = ctx.store.get();
    const lines = p.lines.map(([who, text]) => [who, fill(text, save)]);
    let i = 0;
    const who = el.querySelector('.intro-who'), text = el.querySelector('.intro-text');
    const draw = () => { const [w, t] = lines[i]; who.textContent = w === 'ナレーション' ? '' : w; text.textContent = t; text.classList.toggle('narr', w === 'ナレーション'); };
    const finish = () => {
      ctx.store.update(s => { if (p.kind === 'intro') s.profile.flags.introSeen = true; if (p.id) markSeen(s, p.id); return s; }, 'story');
      ctx.autosave();
      if (p.back) ctx.screens.back('base'); else ctx.screens.reset('base');
    };
    el.querySelector('[data-next]').onclick = () => { i++; if (i >= lines.length) finish(); else draw(); };
    el.querySelector('[data-skip]').onclick = finish;
    draw();
  },
};

/** 導入（名前を決めたあと） */
export const introScreen = {
  id: 'intro',
  render: (ctx) => sceneScreen.render(ctx, { title: '' }),
  bind: (el, ctx) => sceneScreen.bind(el, ctx, { kind: 'intro', lines: INTRO }),
};

/** 施設の上に出す担当の一言（施設 id で） */
export function npcBox(save, facilityId) {
  const n = npcOf(facilityId); if (!n) return '';
  const ep = npcEpisode(save, n);
  return `<div class="npc"><div class="npc-name"><b>${esc(n.name)}</b><small>${esc(n.role)}</small></div><p>${esc(npcLine(save, n))}</p>
    ${ep ? `<button class="btn small npc-ep" data-episode="${n.id}">話を聞く<small>${esc(ep.title)}</small></button>` : ''}</div>`;
}
/** npcBox の「話を聞く」を動かす */
export function bindNpc(el, ctx) {
  el.querySelectorAll('[data-episode]').forEach(b => {
    b.onclick = () => {
      const n = NPCS.find(x => x.id === b.dataset.episode), ep = npcEpisode(ctx.store.get(), n);
      ctx.screens.go('scene', { kind: 'episode', id: ep.id, title: `${n.name}「${ep.title}」`, lines: ep.lines.map(t => [n.name, t]), back: true });
    };
  });
}
/** 物語の出来事を見せる（拠点に戻ったとき） */
export function showEvent(ctx, ev) { ctx.screens.go('scene', { kind: 'event', id: ev.id, title: ev.title, lines: ev.lines }, { replace: true }); }
export { STORY_EVENTS };
