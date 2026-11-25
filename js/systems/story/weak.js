// 効きやすさを、ぼかした言い方にする（数字は出さない・Q-06）。研究施設と研究ノート（サイト）で使う。
import { ELEMENTS } from '../../../data/skills.js';

export const TYPE_NAME = { cut: '斬撃', blunt: '打撃', pierce: '突き', shot: '射撃' };
export const AIL_NAME = { poison: '毒', paralysis: '麻痺', sleep: '眠り', bleed: '出血', stun: '気絶' };
export const ELEM_NAME = Object.fromEntries(ELEMENTS.map(e => [e.id, e.name]));

export function weakWords(mon) {
  const out = [];
  for (const p of Object.values(mon.parts)) {
    const good = Object.entries(p.z).filter(([, v]) => v >= 1.2).map(([k]) => TYPE_NAME[k]);
    const bad = Object.entries(p.z).filter(([, v]) => v <= 0.75).map(([k]) => TYPE_NAME[k]);
    if (good.length) out.push(`${p.name}には${good.join('・')}がよく効く${p.hidden ? '（ふだんは隠れている）' : ''}`);
    if (bad.length) out.push(`${p.name}に${bad.join('・')}は通りにくい`);
  }
  for (const [e, v] of Object.entries(mon.elem || {})) {
    if (v >= 1.2) out.push(`${ELEM_NAME[e]}の力がよく効くようだ`);
    else if (v <= 0.6) out.push(`${ELEM_NAME[e]}の力はほとんど効かない`);
  }
  for (const [a, v] of Object.entries(mon.ailRes || {})) {
    if (v >= 1.5) out.push(`${AIL_NAME[a]}はとても効きにくい`);
    else if (v <= 0.85) out.push(`${AIL_NAME[a]}が効きやすい`);
  }
  return out;
}
