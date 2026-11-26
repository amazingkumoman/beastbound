// 武器6種の性能と技（21b 武器の案・2026-11-25 承認。数字は最初の基準）。
// 技の項目：
//   st 気力 / mult 威力の倍率 / hits 回数 / opening 隙(0〜2) / unlock 覚える熟練度(0=はじめから)
//   moveTo 攻撃のあと移る間合い / needRange 使える間合い / need 使う条件 / ail 状態異常の蓄積
//   effect 特別な効果（エンジンが読む） / breakBonus 部位への効き / desc 一覧に出す説明

export const MASTERY = { maxLevel: 10, techLevels: [2, 4, 6, 8, 9, 10], perLevel: 0.01, expPerLevel: 40 };
export const TECH_SLOTS = 3;

export const WEAPON_KINDS = {
  wt_greatsword: {
    name: '大剣', kind: 'greatsword', type: 'cut', power: 96, guardLevel: 2, reach: ['near'],
    light: { name: '斬り上げ', mult: 0.6, stGain: 5 },
    heavy: { name: '振り下ろし', mult: 1.3, st: 12, opening: 1 },
    special: { id: 'sp_charge', name: '溜める', st: 0, opening: 2, effect: 'charge', desc: '溜め段階を上げる（最大2）。次の重い攻撃・技が強くなる' },
    techs: [
      { id: 'tech_gs_charge_slash', name: '溜め斬り', st: 25, mult: 1.8, opening: 2, unlock: 0, breakBonus: 1.3, desc: '部位を壊しやすい' },
      { id: 'tech_gs_parry_slash', name: '受け流し斬り', st: 15, mult: 1.0, opening: 0, unlock: 0, effect: 'counterGuard', desc: 'そのターンは防御する。受け止めたら反撃' },
      { id: 'tech_gs_step_slash', name: '踏み込み斬り', st: 15, mult: 1.1, opening: 1, unlock: 2, approach: true, needRange: ['near', 'mid'], desc: '近づきながら斬る（中からも使える）' },
      { id: 'tech_gs_helm_split', name: '兜割り', st: 25, mult: 1.6, opening: 2, unlock: 4, headBonus: 1.65, breakBonus: 1.4, desc: '頭に当てるととても強い（頭以外では控えめ）' },
      { id: 'tech_gs_sweep', name: '薙ぎ払い', st: 18, mult: 1.15, opening: 0, unlock: 6, desc: '隙のない中くらいの一撃（大剣で唯一、振っても隙が出ない）' },
      { id: 'tech_gs_all_out', name: '渾身斬り', st: 35, mult: 2.8, opening: 2, unlock: 8, need: { charge: 2 }, breakBonus: 1.3, desc: '溜め2段のときだけ使える' },
    ],
  },
  wt_twinblades: {
    name: '双刃', kind: 'twinblades', type: 'cut', power: 85, guardLevel: 1, reach: ['near'],
    light: { name: '双斬り', mult: 0.35, hits: 2, stGain: 5 },
    heavy: { name: '交差斬り', mult: 0.6, hits: 2, st: 10, opening: 1 },
    techs: [
      { id: 'tech_tb_dance', name: '乱舞', st: 25, mult: 0.4, hits: 6, opening: 1, unlock: 0, desc: '6回斬る' },
      { id: 'tech_tb_circle', name: '回り込み', st: 15, mult: 0.45, hits: 2, opening: 0, unlock: 0, afterDodge: 1.4, desc: '回避の後なら威力が上がる' },
      { id: 'tech_tb_return', name: '切り返し', st: 10, mult: 0.4, hits: 2, opening: 0, unlock: 2, stGain: 15, desc: '当たると気力が戻る' },
      { id: 'tech_tb_rend', name: '裂き斬り', st: 20, mult: 0.45, hits: 3, opening: 1, unlock: 4, ail: { bleed: 18 }, desc: '出血させやすい' },
      { id: 'tech_tb_demon', name: '鬼人連舞', st: 35, mult: 0.45, hits: 10, opening: 2, unlock: 8, need: { momentum: 5 }, desc: '勢い5のときだけ。10回斬る' },
      { id: 'tech_tb_shadow', name: '影縫い', st: 20, mult: 0.45, hits: 3, opening: 1, unlock: 6, ail: { slow: 30 }, desc: '鈍足にしやすい' },
    ],
  },
  wt_hammer: {
    name: '重槌', kind: 'hammer', type: 'blunt', power: 115, guardLevel: 2, reach: ['near'],
    light: { name: '小突き', mult: 0.6, stGain: 5, stun: 8 },
    heavy: { name: '叩き込み', mult: 1.25, st: 12, opening: 1, stun: 15 },
    techs: [
      { id: 'tech_hm_smash', name: '叩きつけ', st: 25, mult: 2.1, opening: 2, unlock: 0, stun: 35, desc: '気絶させやすい（頭に当てると大きい）' },
      { id: 'tech_hm_wind_up', name: '溜め振り', st: 20, mult: 1.6, opening: 1, unlock: 0, stun: 20, desc: '中くらいの重い一撃' },
      { id: 'tech_hm_quake', name: '地鳴らし', st: 20, mult: 1.2, opening: 1, unlock: 2, ail: { trip: 40 }, desc: '転ばせやすい' },
      { id: 'tech_hm_endure', name: '耐え打ち', st: 15, mult: 1.2, opening: 0, unlock: 4, afterPushed: 1.6, desc: '押し込まれた後なら威力が上がる' },
      { id: 'tech_hm_crown', name: '脳天落とし', st: 35, mult: 2.7, opening: 2, unlock: 8, stun: 40, downStun: 2, desc: 'ダウン中なら気絶させやすい' },
      { id: 'tech_hm_spin', name: '振り回し', st: 15, mult: 0.45, hits: 3, opening: 1, unlock: 6, stun: 12, desc: '3回当てて、気絶を少しずつ重ねる（連撃のスキルと合う）' },
    ],
  },
  wt_lance: {
    name: '竜槍', kind: 'lance', type: 'pierce', power: 85, guardLevel: 3, reach: ['near', 'mid'], pierceFloor: 0.8,
    light: { name: '突き', mult: 0.65, stGain: 5 },
    heavy: { name: '踏み込み突き', mult: 1.25, st: 12, opening: 1 },
    techs: [
      { id: 'tech_ln_stance', name: '構え突き', st: 15, mult: 1.0, opening: 0, unlock: 0, effect: 'counterGuard', desc: '盾で防御する。完全に受けたら強く反撃' },
      { id: 'tech_ln_charge', name: '突撃', st: 20, mult: 1.3, opening: 1, unlock: 0, approach: true, needRange: ['mid'], desc: '中から近へ詰めながら突く' },
      { id: 'tech_ln_bash', name: '盾打ち', st: 10, mult: 0.7, opening: 0, unlock: 2, typeOverride: 'blunt', stun: 15, desc: '盾で殴る・気絶を少し' },
      { id: 'tech_ln_triple', name: '連突き', st: 20, mult: 0.5, hits: 3, opening: 0, unlock: 4, desc: '隙を見せずに3回突く' },
      { id: 'tech_ln_bore', name: '穿ち突き', st: 25, mult: 2.0, opening: 1, unlock: 6, pierceFloor: 1.0, desc: '硬い部位にも効き目が落ちない' },
      { id: 'tech_ln_fortress', name: '不動の構え', st: 15, mult: 0, opening: 0, unlock: 8, effect: 'guardUp', desc: '防御する。2ターン、防御が一段強くなる' },
    ],
  },
  wt_bow: {
    name: '弓', kind: 'bow', type: 'shot', power: 110, guardLevel: 1, reach: ['near', 'mid', 'far'], nearMult: 0.7, sureAim: true,
    light: { name: '速射', mult: 0.6, stGain: 5 },
    heavy: { name: '引き絞り', mult: 1.25, st: 12, opening: 1 },
    special: { id: 'sp_arrow', name: '矢の切り替え', free: true, effect: 'arrow', desc: '通常の矢／貫く矢（硬い部位に強い・少し弱い）。ターンを使わない' },
    techs: [
      { id: 'tech_bw_power', name: '剛射', st: 20, mult: 2.0, opening: 1, unlock: 0, desc: '一本に力を込める' },
      { id: 'tech_bw_retreat', name: '退き撃ち', st: 15, mult: 1.1, opening: 0, unlock: 0, retreat: true, desc: '撃ちながら離れる' },
      { id: 'tech_bw_aimed', name: '狙い撃ち', st: 20, mult: 1.3, opening: 0, unlock: 2, weakBonus: 1.35, desc: 'よく効く所に当てるとさらに強い' },
      { id: 'tech_bw_arc', name: '曲射', st: 25, mult: 0.75, hits: 3, opening: 1, unlock: 4, needRange: ['far'], desc: '遠くからだけ。3本降らせる' },
      { id: 'tech_bw_pin', name: '縫い止め', st: 20, mult: 1.0, opening: 0, unlock: 6, ail: { bind: 35 }, desc: '動きを縫い止める（拘束を少し）' },
      { id: 'tech_bw_rapid', name: '連射', st: 15, mult: 0.35, hits: 4, opening: 0, unlock: 8, desc: '隙なしで4本続けて撃つ（連撃・弱点特化のスキルと合う）' },
    ],
  },
  wt_chainblade: {
    name: '鎖刃', kind: 'chainblade', type: 'cut', power: 116, guardLevel: 1, reach: ['near', 'mid'],
    light: { name: '鎖払い', mult: 0.6, stGain: 5 },
    heavy: { name: '鎖刃一閃', mult: 1.2, st: 12, opening: 1 },
    techs: [
      { id: 'tech_cb_hook', name: '鎖掛け', st: 10, mult: 0.6, opening: 0, unlock: 0, effect: 'chain', desc: '狙った部位に鎖をかける（その部位への攻撃が強くなり、拘束も溜まる）' },
      { id: 'tech_cb_pull', name: '引き寄せ斬り', st: 15, mult: 1.2, opening: 1, unlock: 0, approach: true, needRange: ['mid'], desc: '中から近へ引き寄せて斬る' },
      { id: 'tech_cb_chain_guard', name: '鎖受け', st: 10, mult: 0, opening: 0, unlock: 2, effect: 'chainGuard', desc: '防御する（防御の強さ+1）。完全に受けたら手足を縛る' },
      { id: 'tech_cb_bind', name: '巻き締め', st: 25, mult: 0.8, hits: 2, opening: 1, unlock: 4, need: { chain: true }, ail: { bind: 30 }, desc: '鎖をかけた部位を締め上げる' },
      { id: 'tech_cb_swing', name: '振り子斬り', st: 20, mult: 1.3, opening: 0, unlock: 6, retreatTo: 'mid', needRange: ['near'], desc: '斬りながら中へ離れる' },
      { id: 'tech_cb_shackle', name: '縛鎖', st: 30, mult: 1.8, opening: 2, unlock: 8, ail: { bind: 70 }, desc: '鎖をかけていなくても、拘束を大きく溜める' },
    ],
  },
};

// ─── 技の習得（21c・2026-11-25 承認）：熟練度＋決まった大型の研究＋素材 ───────────────
// 【ネタバレ注意】どの大型から学ぶか・上位の技の中身。報告では触れない。
// learn.research = [大型の id, 研究の段階（2 初回狩猟・3 複数回遭遇・4 研究進行）]
// cool = 使ったあと、そのターン数は使えない（切り札・上位の技）。upgradeOf = 上位互換の元の技
const TEACH = { wt_greatsword: 'm01', wt_twinblades: 'm03', wt_hammer: 'm01', wt_lance: 'm02', wt_bow: 'm02', wt_chainblade: 'm03' };
const MATS = {
  m01: ['mat_m01_shell', 'mat_m01_horn', 'mat_m01_plate', 'mat_m01_vein'],
  m02: ['mat_m02_scale', 'mat_m02_membrane', 'mat_m02_spine', 'mat_m02_sac'],
  m03: ['mat_m03_hide', 'mat_m03_wart', 'mat_m03_fin', 'mat_m03_gland'],
};
for (const [kind, K] of Object.entries(WEAPON_KINDS)) {
  const m = TEACH[kind], [r1, r2a, r2b, r3] = MATS[m], mon = `mon_${m}`;
  for (const t of K.techs) {
    if (t.unlock === 2) t.learn = { mats: { mat_ore: 3, mat_herb: 2 } };
    if (t.unlock === 4) t.learn = { research: [mon, 2], mats: { [r1]: 3, [r2a]: 1, mat_ore: 2 } };
    if (t.unlock === 6) t.learn = { research: [mon, 3], mats: { [r2a]: 2, [r2b]: 2 } };
    if (t.unlock === 8) { // レアな素材の切り札：強く、そのかわり使ったあと2ターン使えない
      t.learn = { research: [mon, 4], mats: { [r3]: 1, [r2a]: 2 } };
      t.mult = Math.round(t.mult * 1.15 * 100) / 100; t.cool = 2;
      t.desc += '（使ったあと2ターン使えない）';
    }
  }
}

// 上位の技（武器ごとに2つ）：上位が開いてから。熟練度9・10。上位の大型の研究と上位のレアな素材（紫）
const HIGH_TEACH = {
  wt_greatsword: ['mon_m05', 'mat_m05_marrow', 'mat_m05_core', 'mat_m05_shell'],
  wt_twinblades: ['mon_m04', 'mat_m04_tendon', 'mat_m04_gem', 'mat_m04_hide'],
  wt_hammer: ['mon_m05', 'mat_m05_marrow', 'mat_m05_core', 'mat_m05_shell'],
  wt_lance: ['mon_m06', 'mat_m06_spark', 'mat_m06_heart', 'mat_m06_fur'],
  wt_bow: ['mon_m02s', 'mat_m02s_crest', 'mat_m02s_sac', 'mat_m02s_scale'],
  wt_chainblade: ['mon_m04', 'mat_m04_tendon', 'mat_m04_gem', 'mat_m04_hide'],
};
const HIGH_TECHS = {
  wt_greatsword: [
    { id: 'tech_gs_true_charge', name: '真・溜め斬り', st: 30, mult: 2.6, opening: 2, unlock: 9, breakBonus: 1.4, cool: 3, upgradeOf: 'tech_gs_charge_slash', desc: '溜め斬りの上位。部位を大きく壊す（使ったあと3ターン使えない）' },
    { id: 'tech_gs_heaven_split', name: '天地割り', st: 40, mult: 4.0, opening: 2, unlock: 10, need: { charge: 2 }, breakBonus: 1.4, cool: 4, upgradeOf: 'tech_gs_all_out', desc: '溜め2段のときだけ。渾身斬りの上位（使ったあと4ターン使えない）' },
  ],
  wt_twinblades: [
    { id: 'tech_tb_dance_x', name: '乱舞・極', st: 30, mult: 0.5, hits: 7, opening: 1, unlock: 9, cool: 3, upgradeOf: 'tech_tb_dance', desc: '乱舞の上位。7回斬る（使ったあと3ターン使えない）' },
    { id: 'tech_tb_demon_x', name: '鬼人連舞・極', st: 40, mult: 0.55, hits: 12, opening: 2, unlock: 10, need: { momentum: 5 }, cool: 4, upgradeOf: 'tech_tb_demon', desc: '勢い5のときだけ。12回斬る（使ったあと4ターン使えない）' },
  ],
  wt_hammer: [
    { id: 'tech_hm_smash_x', name: '叩きつけ・極', st: 30, mult: 2.8, opening: 2, unlock: 9, stun: 50, cool: 3, upgradeOf: 'tech_hm_smash', desc: '叩きつけの上位。とても気絶させやすい（使ったあと3ターン使えない）' },
    { id: 'tech_hm_crown_x', name: '脳天落とし・極', st: 40, mult: 3.6, opening: 2, unlock: 10, stun: 60, downStun: 2, cool: 4, upgradeOf: 'tech_hm_crown', desc: 'ダウン中ならさらに気絶させやすい（使ったあと4ターン使えない）' },
  ],
  wt_lance: [
    { id: 'tech_ln_bore_x', name: '穿ち突き・極', st: 30, mult: 2.7, opening: 1, unlock: 9, pierceFloor: 1.1, cool: 3, upgradeOf: 'tech_ln_bore', desc: '硬い所ほど深く通る（使ったあと3ターン使えない）' },
    { id: 'tech_ln_stance_x', name: '構え突き・極', st: 20, mult: 1.8, opening: 0, unlock: 10, effect: 'counterGuard', cool: 3, upgradeOf: 'tech_ln_stance', desc: '盾で受け、完全に受けたらとても強く返す（使ったあと3ターン使えない）' },
  ],
  wt_bow: [
    { id: 'tech_bw_power_x', name: '剛射・極', st: 25, mult: 2.8, opening: 1, unlock: 9, cool: 3, upgradeOf: 'tech_bw_power', desc: '一本に全てを込める（使ったあと3ターン使えない）' },
    { id: 'tech_bw_arc_x', name: '曲射・極', st: 30, mult: 1.1, hits: 3, opening: 1, unlock: 10, needRange: ['far'], cool: 3, upgradeOf: 'tech_bw_arc', desc: '遠くからだけ。重い矢を3本降らせる（使ったあと3ターン使えない）' },
  ],
  wt_chainblade: [
    { id: 'tech_cb_bind_x', name: '巻き締め・極', st: 30, mult: 1.15, hits: 2, opening: 1, unlock: 9, need: { chain: true }, ail: { bind: 45 }, cool: 3, upgradeOf: 'tech_cb_bind', desc: '鎖をかけた部位を強く締め上げる（使ったあと3ターン使えない）' },
    { id: 'tech_cb_shackle_x', name: '縛鎖・極', st: 35, mult: 2.4, opening: 2, unlock: 10, ail: { bind: 100 }, cool: 4, upgradeOf: 'tech_cb_shackle', desc: '拘束を一気に溜める（使ったあと4ターン使えない）' },
  ],
};
for (const [kind, list] of Object.entries(HIGH_TECHS)) {
  const [mon, r4a, r4b, r3] = HIGH_TEACH[kind];
  for (const t of list) {
    t.rank = 'high';
    t.learn = t.unlock === 9 ? { research: [mon, 2], mats: { [r4a]: 1, [r3]: 4 } } : { research: [mon, 3], mats: { [r4a]: 1, [r4b]: 1, [r3]: 4 } };
    WEAPON_KINDS[kind].techs.push(t);
  }
}

// マスター級の技（第12段階・70）：武器ごとに1つ。上位の技の上位互換。連発対策（使ったあと4ターン・慣れられやすい）
const MASTER_TECHS = {
  wt_greatsword: { id: 'tech_gs_star_split', name: '星割り', st: 45, mult: 4.8, opening: 2, unlock: 10, need: { charge: 2 }, breakBonus: 1.5, cool: 5, upgradeOf: 'tech_gs_heaven_split', desc: '溜め2段のときだけ。天地割りの上位（使ったあと5ターン使えない）', learn: { research: ['mon_m07', 2], mats: { mat_m07_core: 1, mat_m07_scale: 4 } } },
  wt_twinblades: { id: 'tech_tb_star_dance', name: '星舞', st: 40, mult: 0.55, hits: 9, opening: 1, unlock: 10, cool: 4, upgradeOf: 'tech_tb_dance_x', desc: '乱舞・極の上位。9回斬る（使ったあと4ターン使えない）', learn: { research: ['mon_m04s', 2], mats: { mat_m04s_eye: 1, mat_m04s_hide: 4 } } },
  wt_hammer: { id: 'tech_hm_star_fall', name: '星落とし', st: 45, mult: 4.2, opening: 2, unlock: 10, stun: 70, downStun: 2, cool: 5, upgradeOf: 'tech_hm_crown_x', desc: '脳天落とし・極の上位（使ったあと5ターン使えない）', learn: { research: ['mon_m08', 2], mats: { mat_m08_core: 1, mat_m08_shell: 4 } } },
  wt_lance: { id: 'tech_ln_star_bore', name: '星穿ち', st: 35, mult: 3.4, opening: 1, unlock: 10, pierceFloor: 1.2, cool: 4, upgradeOf: 'tech_ln_bore_x', desc: '穿ち突き・極の上位。硬い所ほど深く通る（使ったあと4ターン使えない）', learn: { research: ['mon_m08', 2], mats: { mat_m08_pearl: 1, mat_m08_shell: 4 } } },
  wt_bow: { id: 'tech_bw_star_shot', name: '星射ち', st: 35, mult: 3.6, opening: 1, unlock: 10, cool: 4, upgradeOf: 'tech_bw_power_x', desc: '剛射・極の上位（使ったあと4ターン使えない）', learn: { research: ['mon_m07', 2], mats: { mat_m07_heart: 1, mat_m07_scale: 4 } } },
  wt_chainblade: { id: 'tech_cb_star_chain', name: '星縛り', st: 40, mult: 3.0, opening: 2, unlock: 10, ail: { bind: 130 }, cool: 5, upgradeOf: 'tech_cb_shackle_x', desc: '縛鎖・極の上位（使ったあと5ターン使えない）', learn: { research: ['mon_m04s', 2], mats: { mat_m04s_venom: 1, mat_m04s_hide: 4 } } },
};
for (const [kind, t] of Object.entries(MASTER_TECHS)) WEAPON_KINDS[kind].techs.push({ ...t, rank: 'master' });

/** 1回の戦闘で得る熟練度の経験値（行動1回につき1。21b 2章：下位の1回の狩りでおよそ1段階） */
export function masteryGain(actions) { return Math.max(0, Math.floor(actions)); }

/** 熟練度の経験値から段階を出す */
export function masteryLevel(exp = 0) {
  return Math.min(MASTERY.maxLevel, 1 + Math.floor(exp / MASTERY.expPerLevel));
}

/** その段階で使える技 */
export function unlockedTechs(kindId, level, learned = null) {
  // learned を渡したら「覚えた技」だけ（21c）。渡さなければ熟練度だけで見る（古い呼び方・試し打ち用）
  return WEAPON_KINDS[kindId].techs.filter(t => t.unlock === 0 || (t.unlock <= level && (!learned || learned.includes(t.id))));
}

/** 戦闘に持っていく武器を作る（技は最大3つ。熟練度で強さ+1%ずつ） */
export function buildWeapon(kindId, { techIds = null, level = 1, unlockAll = false, learned = null } = {}) {
  const k = WEAPON_KINDS[kindId];
  const usable = unlockAll ? k.techs : unlockedTechs(kindId, level, learned); // unlockAll は試し打ち（開発用）だけ
  const chosen = (techIds ?? usable.map(t => t.id)).map(id => usable.find(t => t.id === id)).filter(Boolean).slice(0, TECH_SLOTS);
  return { ...k, id: kindId, power: Math.round(k.power * (1 + MASTERY.perLevel * (level - 1))), techs: chosen };
}
