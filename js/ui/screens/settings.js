// 設定：音（25b 5章）と戦闘の文字の速さ。記録（settings）に保存する。
import { esc } from '../components.js';
import { sound } from '../../core/sound.js';

export const SPEED = { fast: 0.6, normal: 1, slow: 1.5 };
export function applySettings(save) {
  const s = save?.settings || {};
  sound.configure(s.sound || sound.defaultSoundSettings());
  window.BB_SPEED = SPEED[s.textSpeed] ?? 1;
}

export const settingsScreen = {
  id: 'settings',
  render(ctx) {
    const s = ctx.store.get().settings, snd = s.sound || sound.defaultSoundSettings();
    const range = (k, label) => `<label class="set-row"><span>${label}</span><input type="range" min="0" max="1" step="0.05" value="${snd[k]}" data-vol="${k}"></label>`;
    return `
      <div class="head"><div><div class="place">SETTINGS</div><h1>設定</h1></div></div>
      <div class="paper">
        <h2>音</h2>
        <label class="set-row"><span>音を出す</span><input type="checkbox" data-sound ${snd.mute ? '' : 'checked'}></label>
        ${range('sfx', '効果音の大きさ')}${range('bgm', '音楽の大きさ')}
        <p class="note">音は最初に画面を触ってから鳴ります。スマホでは最初は消音です。</p>
        <h2>戦闘の文字の速さ</h2>
        <div class="row-btns">${[['fast', '速い'], ['normal', 'ふつう'], ['slow', 'ゆっくり']].map(([k, n]) => `<button class="btn ${(s.textSpeed || 'normal') === k ? 'main' : ''}" data-speed="${k}">${esc(n)}</button>`).join('')}</div>
      </div>
      <div class="bottombar"><button class="btn" data-back>戻る</button></div>`;
  },
  bind(el, ctx) {
    const save = (fn) => { ctx.store.update(st => { st.settings.sound ??= sound.defaultSoundSettings(); fn(st.settings); return st; }, 'settings'); applySettings(ctx.store.get()); ctx.autosave(); };
    el.querySelector('[data-sound]').onchange = e => save(s => { s.sound.mute = !e.target.checked; });
    el.querySelectorAll('[data-vol]').forEach(r => { r.onchange = () => { save(s => { s.sound[r.dataset.vol] = Number(r.value); }); sound.sfx('tap'); }; });
    el.querySelectorAll('[data-speed]').forEach(b => { b.onclick = () => { save(s => { s.textSpeed = b.dataset.speed; }); ctx.screens.go('settings', {}, { replace: true }); }; });
    el.querySelector('[data-back]').onclick = () => ctx.screens.back('base');
  },
};
