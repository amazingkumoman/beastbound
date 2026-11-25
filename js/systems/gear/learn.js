// 技の習得（画面を持たない）。21c：熟練度＋決まった大型の研究＋素材。覚えた技はずっと使える。
import { WEAPON_KINDS, masteryLevel } from '../../../data/weapons.js';
import { researchStage, STAGE_NAMES } from '../story/story.js';
import { missing } from './gear.js';
import { find as huntFind } from '../hunt/hunt.js';

export const isLearned = (save, kindId, t) => t.unlock === 0 || !!save.learned?.[kindId]?.includes(t.id);

/**
 * その技を覚えられるか。
 * @returns {{ visible: boolean, reachable: boolean, ok: boolean, research: null|{monId, stage, have, name}, missing: object[] }}
 *   visible：一覧に「？？？」の行を出すか（上位の技は上位が開くまで出さない）
 *   reachable：熟練度が届いているか（届いたら、覚える条件を見せる）
 */
export function learnStatus(save, kindId, t) {
  const visible = (t.rank !== 'high' || !!save.profile.flags?.highOpen) && (t.rank !== 'master' || !!save.profile.flags?.masterOpen);
  const lv = masteryLevel(save.mastery?.[kindId] ?? 0);
  const reachable = visible && lv >= t.unlock;
  let research = null;
  if (t.learn?.research) {
    const [monId, stage] = t.learn.research;
    const have = researchStage(save, monId).stage;
    const met = have > 0;
    research = { monId, stage, have, name: met ? huntFind.monster(monId)?.name : 'まだ出会っていない大型', stageName: STAGE_NAMES[stage] };
  }
  const miss = missing(save, t.learn?.mats || {});
  const ok = reachable && !isLearned(save, kindId, t) && (!research || research.have >= research.stage) && !miss.length;
  return { visible, reachable, ok, research, missing: miss };
}

export function learnTech(save, kindId, techId) {
  const t = WEAPON_KINDS[kindId]?.techs.find(x => x.id === techId);
  if (!t) return { ok: false, error: '知らない技' };
  if (isLearned(save, kindId, t)) return { ok: false, error: 'もう覚えている' };
  const st = learnStatus(save, kindId, t);
  if (!st.reachable) return { ok: false, error: '熟練度が足りない' };
  if (st.research && st.research.have < st.research.stage) return { ok: false, error: `${st.research.name}の研究が足りない` };
  if (st.missing.length) return { ok: false, error: '素材が足りない', missing: st.missing };
  for (const [m, n] of Object.entries(t.learn?.mats || {})) save.inventory.materials[m] -= n;
  (save.learned[kindId] ??= []).push(techId);
  return { ok: true, tech: t };
}
