// 研究ノート（攻略・研究サイト・60）の中身を組み立てる（画面を持たない）。
// 保存データから「開いた分」だけを取り出す。開いていない情報は、ここで返す中身に入れない（22章）。
import { SPECIES } from '../../data/species.js';
import { WEAPON_KINDS } from '../../data/weapons.js';
import { SKILLS } from '../../data/skills.js';
import { ITEMS, FOODS } from '../../data/items.js';
import { researchStage, STAGE_NAMES } from '../systems/story/story.js';
import { weakWords, ELEM_NAME, AIL_NAME } from '../systems/story/weak.js';
import { HUNT, find as huntFind, questUnlocked, KIND_NAME, TIME_NAME } from '../systems/hunt/hunt.js';
import { CATALOG, find, weaponTree } from '../systems/gear/gear.js';
import { isLearned } from '../systems/gear/learn.js';

const RANGE = { near: '近', mid: '中', far: '遠' };

export function buildNotebook(save) {
  const high = !!save.profile?.flags?.highOpen;
  const st = id => researchStage(save, id).stage;
  const knownMon = id => !!id && st(id) > 0;
  const knownMat = id => id in (save.inventory?.materials || {}) || !!save.matLog?.[id];
  const rankOk = x => (x.rank !== 'high' || high) && (x.rank !== 'master' || !!save.profile?.flags?.masterOpen);
  const matName = id => (knownMat(id) ? find.material(id)?.name ?? id : null);
  const lineMon = n => { const m = n.id.match(/_(m\d\d+s?)_/); return m ? `mon_${m[1]}` : null; };
  const nodeVisible = n => !n.dev && rankOk(n) && (!lineMon(n) || knownMon(lineMon(n)));
  const sections = [];

  // ─── 大型 ───
  const mons = SPECIES.filter(m => st(m.id) > 0).map(m => {
    const r = save.research[m.id], s = st(m.id);
    const places = Object.keys(r.places || {}).map(k => { const [f, pt, t] = k.split(':'); const fl = huntFind.field(f); return `${fl?.name ?? ''}・${fl?.points.find(x => x.id === pt)?.name ?? ''}（${TIME_NAME[t]}）`; });
    const acts = m.acts.filter(a => r.acts?.[a.id] && a.tell).map(a => `${a.name}：${a.tell}`);
    const basic = [`分類：${m.lore.kind}`, `研究：${STAGE_NAMES[s]}（出会った${r.seen || 0}・討伐${r.hunted || 0}・捕獲${r.captured || 0}）`];
    if (s >= 2) basic.push(`暮らし：${m.lore.habits}`);
    if (places.length) basic.push(`出会った場所：${places.join('／')}`);
    if (acts.length) basic.push(...acts.map(a => `見た行動 ─ ${a}`));
    let tactical = null, detail = null;
    if (s >= 4) {
      const goodLines = [];
      for (const kind of Object.keys(WEAPON_KINDS)) for (const n of weaponTree(kind)) {
        if (n.element && (m.elem?.[n.element.type] ?? 1) >= 1.2 && nodeVisible(n)) goodLines.push(`${n.name}（${ELEM_NAME[n.element.type]}）`);
      }
      tactical = [...weakWords(m), `怒りやすいとき：${m.lore.rage}`];
      if (goodLines.length) tactical.push(`効く属性の武器（作れるもの）：${[...new Set(goodLines)].slice(0, 6).join('・')}${goodLines.length > 6 ? ' など' : ''}`);
    }
    if (s >= 5) {
      const mats = [...new Set([...m.rewards.hunt, ...m.rewards.capture].map(x => x.id))].filter(knownMat).map(id => `${matName(id)}：${(save.matLog?.[id] || []).join('／') || '記録なし'}`);
      detail = [`生態：${m.lore.ecology}`, `攻略の知見：${m.lore.tips}`, ...(m.capture ? [`捕獲の目安：弱って「${m.capture.text.replace(/（.*）/, '')}」ようになったら`] : []), ...mats.map(x => `素材 ─ ${x}`)];
    }
    return { id: m.id, title: m.name, sub: m.alias, basic, tactical, detail };
  });
  sections.push({ id: 'monsters', title: '大型', entries: mons, empty: 'まだ記録がない。探索で大型に出会うと記録される。' });

  // ─── 武器 ───
  sections.push({ id: 'weapons', title: '武器', entries: Object.entries(WEAPON_KINDS).map(([kind, K]) => {
    const techs = K.techs.filter(t => isLearned(save, kind, t)).map(t => `技 ─ ${t.name}：${t.desc}`);
    const nodes = weaponTree(kind).filter(n => n.tier > 0 && nodeVisible(n)).map(n => `派生 ─ ${n.name}${n.element ? `（${ELEM_NAME[n.element.type]}）` : ''}${n.ail ? `（${AIL_NAME[n.ail.type] ?? n.ail.type}）` : ''}`);
    return { id: kind, title: K.name, sub: `届く間合い ${K.reach.map(r => RANGE[r]).join('・')}／受けの強さ ${K.guardLevel}`, basic: [...(K.special ? [`専用：${K.special.name}：${K.special.desc}`] : []), ...techs, ...nodes], tactical: null, detail: null };
  }) });

  // ─── 防具 ───
  const sets = CATALOG.sets.filter(s => !s.id.startsWith('set_test') && rankOk(s) && (s.gather || knownMon(s.monsterId)));
  sections.push({ id: 'armors', title: '防具', empty: '大型に出会うと、その素材で作れる防具が記録される。', entries: sets.map(s => {
    const pieces = CATALOG.armors.filter(a => a.setId === s.id).map(a => `${a.name}：守り${a.def}・${Object.entries(a.skills).map(([k, n]) => `${find.skill(k)?.name}+${n}`).join('・')}${a.unique ? `・固有：${a.unique.name}` : ''}`);
    return { id: s.id, title: `${s.name}の防具`, sub: s.gather ? '採取の素材で作る' : '', basic: [...pieces, ...s.bonuses.map(b => `${b.pieces}部位：${b.name}`)], tactical: null, detail: null };
  }) });

  // ─── 装飾品・スキル ───
  const decos = CATALOG.decorations.filter(d => !d.dev && rankOk(d) && ((save.inventory?.decorations || {})[d.id] || Object.keys(d.craft).every(knownMat)));
  sections.push({ id: 'decos', title: '装飾品', empty: '素材を手に入れると、作れる装飾品が記録される。', entries: decos.map(d => ({ id: d.id, title: d.name, sub: `${({ s: '小', m: '中', l: '大' })[d.size]}の穴`, basic: [`${find.skill(d.skillId)?.name}+${d.points}`, `作る：${Object.entries(d.craft).map(([m, n]) => `${matName(m)} ${n}`).join('・')}`], tactical: null, detail: null })) });
  const skillIds = new Set();
  for (const s of sets) for (const a of CATALOG.armors.filter(x => x.setId === s.id)) Object.keys(a.skills).forEach(k => skillIds.add(k));
  for (const d of decos) skillIds.add(d.skillId);
  sections.push({ id: 'skills', title: 'スキル', entries: SKILLS.filter(s => skillIds.has(s.id)).map(s => ({ id: s.id, title: s.name, sub: s.group, basic: s.levels.map((v, i) => `Lv${i + 1}：${s.desc(v)}`), tactical: null, detail: null })) });

  // ─── アイテム・食事 ───
  sections.push({ id: 'items', title: 'アイテム・食事', entries: [
    ...ITEMS.map(it => ({ id: it.id, title: it.name, sub: `ショップ ${it.price}ルク`, basic: [it.desc, `持ち込みは${it.max}個まで`], tactical: null, detail: null })),
    ...FOODS.map(f => ({ id: f.id, title: f.name, sub: `食事 ${f.price}ルク`, basic: [f.desc], tactical: null, detail: null })),
  ] });

  // ─── フィールド ───
  const visited = new Set([...Object.values(save.research || {}).flatMap(r => Object.keys(r.places || {}).map(k => k.split(':')[0])),
    ...Object.keys(save.progress?.quests || {}).map(q => huntFind.quest(q)?.fieldId).filter(Boolean)]);
  sections.push({ id: 'fields', title: 'フィールド', empty: 'クエストで出かけると、フィールドが記録される。', entries: HUNT.fields.filter(f => visited.has(f.id) && f.id !== 'fld_test').map(f => ({
    id: f.id, title: f.name, sub: `行動 ${f.actions}回`,
    basic: f.points.map(p => {
      const g = (p.gather || []).filter(r => knownMat(r.id)).map(r => `${matName(r.id)}${r.times ? `（${r.times.map(t => TIME_NAME[t]).join('・')}だけ）` : ''}`);
      return `${p.name}：${p.camp ? '野営地' : ''}${g.length ? `採れる物 ${g.join('・')}` : ''}${p.survey?.trace ? '（痕跡がある）' : ''}`;
    }), tactical: null, detail: null,
  })) });

  // ─── クエスト ───
  sections.push({ id: 'quests', title: 'クエスト', entries: HUNT.quests.filter(q => !q.dev && questUnlocked(save, q)).map(q => ({
    id: q.id, title: q.name, sub: `${KIND_NAME[q.kind]}${q.danger ? `・危険度${'★'.repeat(q.danger)}` : ''}・達成 ${save.progress?.quests?.[q.id]?.cleared || 0}回`,
    basic: [q.desc, `目標：${q.goal.text}`, ...(q.extra || []).map(x => `追加の目的：${x.text}`)], tactical: null, detail: null,
  })) });

  // ─── 攻略のヒント（進み具合で増える） ───
  const tips = [
    [true, '予兆を見てから、受けるか・よけるか・攻めるかを決める。広い攻撃はよけきれない。'],
    [true, '大振りの技は隙が大きい。同じ技を繰り返すと、相手に慣れられて効きが落ちる。'],
    [true, '狙う部位はターンを使わずに選べる。壊すと行動が変わったり、倒れたりする。'],
    [mons.length > 0, '研究施設で、次の研究に何が足りないかを聞ける。研究が進むと、このノートの「戦術」「詳しい」が開く。'],
    [Object.values(save.research || {}).some(r => r.hunted + r.captured > 0), '弱った兆候が見えたら、捕獲具を試す価値がある。捕獲だと討伐と違う素材が出やすい。'],
    [high, '上位の大型は、下位の装備では歯が立たない。まずは奥地で採取し、採取の防具を作るとよい。'],
    [high, '下位の派生の中から、相手によく効く属性の武器を持っていくと、上位の序盤を乗り切りやすい。'],
  ];
  sections.push({ id: 'tips', title: '攻略のヒント', entries: tips.filter(([ok]) => ok).map(([, t], i) => ({ id: `tip${i}`, title: `心得 ${i + 1}`, sub: '', basic: [t], tactical: null, detail: null })) });

  return { name: save.profile?.name ?? '', rank: save.profile?.rankId, sections };
}
