// 保存データの形と点検。14 セーブ仕様書 1章。
// 形を変えたら SCHEMA を1つ上げ、migrate.js に移行の関数を足すこと。

export const FORMAT = 'beastbound-save';
export const SCHEMA = 1;
export const GAME_VERSION = '0.3.0'; // 第3段階

/** 新しく始めるときのデータ */
export function createNewSave(name, now = new Date()) {
  return {
    format: FORMAT,
    schema: SCHEMA,
    savedAt: now.toISOString(),
    gameVersion: GAME_VERSION,
    profile: { name, rankId: 'rank_low', days: 1, flags: { introSeen: false } },
    inventory: { money: 0, materials: {}, items: {}, weapons: [], armors: [], decorations: {} },
    loadout: { weaponId: null, armor: {}, decoSlots: {}, techs: {} },
    mastery: {},
    research: {},
    progress: { quests: {}, unlocks: {}, npc: {} },
    suspend: null,
    settings: { textSpeed: 'normal' },
  };
}

/** キーの順番をそろえた JSON（点検用の値を毎回同じにするため） */
export function stableStringify(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map(stableStringify).join(',') + ']';
  const keys = Object.keys(value).filter(k => value[k] !== undefined).sort();
  return '{' + keys.map(k => JSON.stringify(k) + ':' + stableStringify(value[k])).join(',') + '}';
}

/** 点検用の値（壊れた・途中で切れたことを見つけるため。改ざん防止ではない） */
export function computeCheck(data) {
  const { check, ...rest } = data;
  const s = stableStringify(rest);
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h.toString(16).padStart(8, '0') + ':' + s.length.toString(16);
}

export function withCheck(data) {
  const d = { ...data };
  delete d.check;
  d.check = computeCheck(d);
  return d;
}

/**
 * 文字列を保存データとして読み、形と点検値を確かめる。
 * @returns {{ ok: true, data: object } | { ok: false, error: string }}
 */
export function parseSave(text) {
  let data;
  try { data = JSON.parse(text); } catch { return { ok: false, error: '保存データとして読めない（壊れている）' }; }
  if (!data || typeof data !== 'object' || data.format !== FORMAT) return { ok: false, error: 'BEASTBOUND の保存データではない' };
  if (!Number.isInteger(data.schema) || data.schema < 1) return { ok: false, error: '保存データの版がわからない' };
  if (data.schema > SCHEMA) return { ok: false, error: 'このゲームより新しい版で作られた保存データ', newer: true };
  if (typeof data.check !== 'string' || data.check !== computeCheck(data)) return { ok: false, error: '保存データが壊れている（点検値が合わない）' };
  return { ok: true, data };
}

/** 画面に出す要約（読み込み前の確認・バックアップの一覧に使う） */
export function summarize(data) {
  return {
    name: data?.profile?.name ?? '',
    rankId: data?.profile?.rankId ?? '',
    days: data?.profile?.days ?? 0,
    savedAt: data?.savedAt ?? '',
    schema: data?.schema,
  };
}
