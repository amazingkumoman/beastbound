// 主人公の名前の入力（正式方針3-3：名前のみ変更可能）。
import { toast } from '../components.js';

export const NAME_MAX = 10;

/** 名前の点検。問題がなければ null、あれば理由 */
export function checkName(raw) {
  const name = String(raw ?? '').normalize('NFKC').replace(/\s+/g, ' ').trim();
  if (!name) return { name, error: '名前を入れてください' };
  if ([...name].length > NAME_MAX) return { name, error: `${NAME_MAX}文字までにしてください` };
  if (/[<>]/.test(name)) return { name, error: '使えない文字が入っています' };
  return { name, error: null };
}

export const nameScreen = {
  id: 'name',
  render() {
    return `
      <div class="head"><div><div class="place">HUNTER</div><h1>狩人の名前</h1></div></div>
      <div class="paper">
        <form class="name-form" novalidate>
          <label for="hunterName">名前（${NAME_MAX}文字まで）</label>
          <input id="hunterName" name="hunterName" maxlength="${NAME_MAX * 2}" autocomplete="off" autofocus>
          <p class="note" id="nameErr" role="alert"></p>
          <button class="btn main" type="submit">この名前で始める</button>
        </form>
      </div>
      <div class="bottombar"><button class="btn" data-back>戻る</button></div>`;
  },
  bind(el, ctx) {
    el.querySelector('[data-back]').onclick = () => ctx.screens.back();
    el.querySelector('form').onsubmit = e => {
      e.preventDefault();
      const { name, error } = checkName(el.querySelector('#hunterName').value);
      el.querySelector('#nameErr').textContent = error || '';
      if (error) return;
      const data = ctx.saves.newGame(name);
      const r = ctx.saves.save(data);
      if (!r.ok) { toast(`保存できません：${r.error}`); return; }
      ctx.store.replace(r.data, 'new');
      toast(`${name} として記録しました`);
      ctx.screens.reset('intro');
    };
  },
};
