// 保存のまとめ役。14 セーブ仕様書 2〜8章。
// 画面を持たない。保存先（storage）は差し替えられる（テストでは作り物を使う）。

import { FORMAT, SCHEMA, parseSave, withCheck, summarize, createNewSave } from './schema.js';
import { migrate as defaultMigrate } from './migrate.js';

export const KEYS = {
  current: 'bb.save.current',
  tmp: 'bb.save.tmp',
  gen: n => `bb.save.gen.${n}`,
  backupPrefix: 'bb.save.backup.',
};
export const GENERATIONS = 3;
export const MAX_BACKUPS = 5;

/** ブラウザの localStorage を、この係が使う形に包む */
export function browserStorage(ls = globalThis.localStorage) {
  return {
    get: k => ls.getItem(k),
    set: (k, v) => ls.setItem(k, v),
    remove: k => ls.removeItem(k),
    keys: () => Object.keys(ls),
  };
}

/** テスト用：入れ物だけの保存先。quota を指定すると容量切れを起こせる */
export function memoryStorage(quota = Infinity) {
  const m = new Map();
  const size = () => [...m.values()].reduce((s, v) => s + v.length, 0);
  return {
    get: k => (m.has(k) ? m.get(k) : null),
    set(k, v) {
      const before = m.has(k) ? m.get(k).length : 0;
      if (size() - before + v.length > quota) { const e = new Error('QuotaExceededError'); e.name = 'QuotaExceededError'; throw e; }
      m.set(k, v);
    },
    remove: k => { m.delete(k); },
    keys: () => [...m.keys()],
    _map: m,
  };
}

/**
 * @param {object} o
 * @param {object} o.storage  browserStorage() または memoryStorage()
 * @param {() => Date} [o.now]
 * @param {Function} [o.migrate]
 */
export function createSaveManager({ storage, now = () => new Date(), migrate = defaultMigrate } = {}) {
  let locked = false; // 戦闘中は true（決定 D-28：戦闘中は保存しない）

  const isQuota = e => e && (e.name === 'QuotaExceededError' || e.code === 22 || /quota/i.test(e.message));

  function backupKeys() {
    return storage.keys().filter(k => k.startsWith(KEYS.backupPrefix)).sort(); // 日時順（古い→新しい）
  }

  function readAt(key) {
    const text = storage.get(key);
    if (text == null) return { ok: false, error: 'ない' };
    return parseSave(text);
  }

  /** 書く→読み返して点検→置き換え。容量切れなら古いバックアップを消して1回だけやり直す */
  function writeVerified(key, text) {
    const attempt = () => {
      storage.set(KEYS.tmp, text);
      if (storage.get(KEYS.tmp) !== text || !parseSave(text).ok) throw new Error('書いた内容を読み返せない');
      storage.set(key, text);
      storage.remove(KEYS.tmp);
    };
    try { attempt(); }
    catch (e) {
      try { storage.remove(KEYS.tmp); } catch { /* 片付けの失敗は無視 */ }
      if (!isQuota(e)) throw e;
      const olds = backupKeys();
      if (!olds.length) throw e;
      storage.remove(olds[0]);
      attempt();
    }
  }

  return {
    newGame(name) { return createNewSave(name, now()); },

    setLocked(v) { locked = !!v; },
    isLocked: () => locked,

    /** 自動保存。世代を1つずつずらしてから current を書く */
    save(data) {
      if (locked) return { ok: false, error: '戦闘中は保存しない' };
      const stamped = withCheck({ ...data, format: FORMAT, schema: SCHEMA, savedAt: now().toISOString() });
      const text = JSON.stringify(stamped);
      try {
        const cur = storage.get(KEYS.current);
        if (cur != null && parseSave(cur).ok) {
          for (let n = GENERATIONS; n >= 2; n--) {
            const prev = storage.get(KEYS.gen(n - 1));
            if (prev != null) storage.set(KEYS.gen(n), prev);
          }
          storage.set(KEYS.gen(1), cur);
        }
        writeVerified(KEYS.current, text);
        return { ok: true, data: stamped };
      } catch (e) {
        return { ok: false, error: isQuota(e) ? '保存する場所がいっぱい' : `保存できない（${e.message}）` };
      }
    },

    /** current → 世代1〜3 の順に、読めるものを探す（8章） */
    load() {
      const tried = [];
      for (const key of [KEYS.current, ...Array.from({ length: GENERATIONS }, (_, i) => KEYS.gen(i + 1))]) {
        const r = readAt(key);
        if (!r.ok) { if (storage.get(key) != null) tried.push({ key, error: r.error }); continue; }
        try {
          const m = migrate(r.data);
          if (m.migrated) this.makeBackup('移行の前', r.data);
          return { ok: true, data: m.data, source: key, migrated: m.migrated, problems: tried };
        } catch (e) {
          tried.push({ key, error: e.message });
        }
      }
      return { ok: false, problems: tried, backups: this.listBackups() };
    },

    hasSave() { return this.load().ok; },

    /** バックアップを作る（最大 MAX_BACKUPS。超えたら古いものから消す） */
    makeBackup(reason = '手動', data = null) {
      let src = data;
      if (!src) { const r = readAt(KEYS.current); if (!r.ok) return { ok: false, error: '今の保存データがない' }; src = r.data; }
      const stamp = now().toISOString();
      const key = KEYS.backupPrefix + stamp + '.' + Math.random().toString(36).slice(2, 6);
      const payload = JSON.stringify({ reason, at: stamp, text: JSON.stringify(withCheck(src)) });
      try {
        storage.set(key, payload);
      } catch (e) {
        if (!isQuota(e)) return { ok: false, error: e.message };
        const olds = backupKeys(); if (!olds.length) return { ok: false, error: '保存する場所がいっぱい' };
        storage.remove(olds[0]); storage.set(key, payload);
      }
      const all = backupKeys();
      while (all.length > MAX_BACKUPS) storage.remove(all.shift());
      return { ok: true, key };
    },

    listBackups() {
      return backupKeys().reverse().map(key => {
        try {
          const b = JSON.parse(storage.get(key));
          const p = parseSave(b.text);
          return { key, reason: b.reason, at: b.at, ok: p.ok, summary: p.ok ? summarize(p.data) : null };
        } catch { return { key, ok: false }; }
      });
    },

    /** バックアップから戻す（戻す前に今のデータもバックアップ） */
    restoreBackup(key) {
      let b; try { b = JSON.parse(storage.get(key)); } catch { return { ok: false, error: 'バックアップが読めない' }; }
      const p = parseSave(b.text); if (!p.ok) return p;
      if (readAt(KEYS.current).ok) this.makeBackup('戻す前');
      const m = migrate(p.data);
      return this.save(m.data);
    },

    /** 書き出し（5章） */
    exportFile(data) {
      const d = withCheck({ ...data, format: FORMAT, schema: SCHEMA });
      const stamp = now().toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '_');
      return { filename: `BEASTBOUND_セーブ_${stamp}.json`, text: JSON.stringify(d, null, 2) };
    },

    /** 読み込みの前の確認：中身の要約を返す（上書きの確認に使う） */
    inspectImport(text) {
      const p = parseSave(text);
      if (!p.ok) return p;
      return { ok: true, summary: summarize(p.data) };
    },

    /** 読み込み：読み込む直前に今のデータをバックアップしてから置き換える */
    applyImport(text) {
      const p = parseSave(text); if (!p.ok) return p;
      if (readAt(KEYS.current).ok) {
        const b = this.makeBackup('読み込みの前');
        if (!b.ok) return { ok: false, error: `今のデータのバックアップができないので中止した（${b.error}）` };
      }
      const m = migrate(p.data);
      return this.save(m.data);
    },
  };
}
