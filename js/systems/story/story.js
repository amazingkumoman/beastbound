// 物語・担当の人たち・研究の段階（画面を持たない）。25b 2〜4章。
// 中身（文）は data/story.js と data/monsters.js の lore。ここは「条件を満たしているか」「何段階か」だけを決める。

import { NPCS, STORY_EVENTS } from '../../../data/story.js';
import { SPECIES as MONSTERS } from '../../../data/species.js';
import { speciesHunted } from '../hunt/hunt.js';

const flags = save => (save.profile.flags.story ??= {});
export const seen = (save, id) => !!flags(save)[id];
export function markSeen(save, id) { flags(save)[id] = true; }

/** 条件（data/story.js の when）を満たしているか */
export function check(save, when) {
  if (!when) return true;
  const st = save.profile.stats || {};
  if (when.species != null && speciesHunted(save) < when.species) return false;
  if (when.highSpecies != null && speciesHunted(save, 'high') < when.highSpecies) return false;
  if (when.high && !save.profile.flags?.highOpen) return false;
  if (when.master && !save.profile.flags?.masterOpen) return false;
  if (when.masterSpecies != null && speciesHunted(save, 'master') < when.masterSpecies) return false;
  if (when.hunted) { const r = save.research?.[when.hunted]; if (!r || r.hunted + r.captured < 1) return false; }
  if (when.flag && !seen(save, when.flag)) return false;
  if (when.cleared && !(save.progress?.quests?.[when.cleared]?.cleared > 0)) return false;
  if (when.stat && (st[when.stat[0]] || 0) < when.stat[1]) return false;
  if (when.research) {
    const [mon, stage] = when.research;
    const ids = mon === 'any' ? MONSTERS.map(m => m.id) : [mon];
    if (!ids.some(id => researchStage(save, id).stage >= stage)) return false;
  }
  return true;
}

// ─── 担当の人たち ────────────────────────────────────────
export const npcOf = facilityId => NPCS.find(n => n.facility === facilityId);
/** いま言うこと：条件を満たすもののうち、いちばん後ろ（いちばん進んだもの） */
export function npcLine(save, npc) { return [...npc.lines].reverse().find(l => check(save, l.when))?.text ?? ''; }
/** まだ聞いていない個別の話（条件を満たしていれば） */
export function npcEpisode(save, npc) { return [npc.episode, ...(npc.more || [])].find(e => e && !seen(save, e.id) && check(save, e.when)) || null; }

// ─── 物語の出来事 ───────────────────────────────────────
/** 拠点に戻ったときに見せる出来事（まだ見ていないものの、いちばん前） */
export function pendingEvent(save) { return STORY_EVENTS.find(e => !seen(save, e.id) && check(save, e.when)) || null; }

// ─── 研究の段階（Q-04・Q-34：チェック方式） ────────────────
export const STAGE_NAMES = ['未遭遇', '初遭遇', '初回狩猟', '複数回遭遇', '研究進行', '研究完了'];
/**
 * その種の研究の段階と、次の段階に足りないこと（ぼかした言い方）。
 * @returns {{ stage: number, need: string[] }}
 */
export function researchStage(save, monId) {
  const r = save.research?.[monId];
  const mon = MONSTERS.find(m => m.id === monId);
  if (!r || !(r.seen || r.hunted || r.captured || r.observed)) return { stage: 0, need: ['まず出会うこと'] };
  const hunts = r.hunted + r.captured;
  const parts = Object.keys(r.parts || {}).length, partsAll = mon ? Object.keys(mon.parts).length : 3;
  const acts = Object.keys(r.acts || {}).length, actsAll = mon ? mon.acts.filter(a => !a.idle).length : 1;
  const steps = [
    [hunts >= 1, '一度狩ってみること'],
    [r.seen >= 3 && r.observed >= 1, '何度か出会い、戦わずに様子を観察すること'],
    [parts >= 2 && (r.traces || 0) >= 2, '体のいろいろな所を壊すこと・暮らしの痕跡を調べること'],
    [r.captured >= 1 && parts >= partsAll && acts >= Math.ceil(actsAll * 0.7), '生け捕りにすること・すべての部位を壊すこと・多くの動きを見届けること'],
  ];
  let stage = 1;
  for (const [ok] of steps) { if (!ok) break; stage++; }
  const need = stage >= 5 ? [] : [steps[stage - 1][1]];
  return { stage, need };
}
