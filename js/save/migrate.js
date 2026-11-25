// 版の移行。14 セーブ仕様書 6章。
// 古い版のデータを 1→2→3… と順番に最新の形へ移す。
// 新しい版を作るときは、ここに「その版から次の版へ移す関数」を1つ足し、
// tests/fixtures/ に古い見本データを残すこと。

import { SCHEMA } from './schema.js';

/** schema n のデータを n+1 にする関数の一覧 */
export const MIGRATIONS = {
  // 例）1: d => ({ ...d, schema: 2, newField: 初期値 }),
};

/**
 * @param {object} data  点検済みの保存データ
 * @param {object} [migrations]  テスト用に差し替えできる
 * @param {number} [target]
 * @returns {{ data: object, migrated: boolean, from: number }}
 */
export function migrate(data, migrations = MIGRATIONS, target = SCHEMA) {
  const from = data.schema;
  let d = structuredClone(data);
  while (d.schema < target) {
    const fn = migrations[d.schema];
    if (!fn) throw new Error(`版 ${d.schema} から ${d.schema + 1} へ移す方法がない`);
    const next = fn(d);
    if (!next || next.schema !== d.schema + 1) throw new Error(`版 ${d.schema} の移行が正しく版を上げていない`);
    d = next;
  }
  return { data: d, migrated: d.schema !== from, from };
}
