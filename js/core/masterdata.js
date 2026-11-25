// マスターデータの点検。13 データ設計書 6章。
// 起動時と自動テストで呼ぶ。問題の一覧（文字列の配列）を返す。空なら合格。

const ID_RULE = /^[a-z][a-z0-9_]*$/;

/**
 * @param {object} data  game/data/index.js の中身
 * @param {object} [opts]
 * @param {object} [opts.manifest]  画像の一覧（キー → {src}）。渡すと画像キーも調べる
 * @param {string[]} [opts.allowMissingArt]  まだ画像がなくてよいキー（例：鎖刃）
 */
export function validateMasterData(data, opts = {}) {
  const problems = [];
  const allIds = new Map(); // id → どの表か

  for (const [table, rows] of Object.entries(data)) {
    if (!Array.isArray(rows)) continue;
    const seen = new Set();
    rows.forEach((row, i) => {
      const where = `${table}[${i}]`;
      if (!row || typeof row !== 'object') { problems.push(`${where}: 中身がない`); return; }
      if (typeof row.id !== 'string' || !row.id) { problems.push(`${where}: id がない`); return; }
      if (!ID_RULE.test(row.id)) problems.push(`${where}: id「${row.id}」が名前の決まり（半角英小文字・数字・_）に合わない`);
      if (seen.has(row.id)) problems.push(`${where}: id「${row.id}」が同じ表で重なっている`);
      seen.add(row.id);
      if (!allIds.has(row.id)) allIds.set(row.id, table);
      if (typeof row.name !== 'string' || !row.name) problems.push(`${where}: name がない`);
    });
  }

  // 参照の点検：項目名が ...Id / ...Ids で終わるものは、どこかの表に存在する id を指すこと
  for (const [table, rows] of Object.entries(data)) {
    if (!Array.isArray(rows)) continue;
    rows.forEach((row, i) => {
      if (!row || typeof row !== 'object') return;
      for (const [k, v] of Object.entries(row)) {
        const refs = k.endsWith('Ids') ? (Array.isArray(v) ? v : []) : k.endsWith('Id') ? [v] : [];
        for (const r of refs) {
          if (r == null) continue;
          if (!allIds.has(r)) problems.push(`${table}[${i}].${k}: 存在しない id「${r}」を指している`);
        }
      }
    });
  }

  // 画像キーの点検
  if (opts.manifest) {
    const allow = new Set(opts.allowMissingArt || []);
    for (const [table, rows] of Object.entries(data)) {
      if (!Array.isArray(rows)) continue;
      rows.forEach((row, i) => {
        if (row && row.art && !opts.manifest[row.art] && !allow.has(row.art)) {
          problems.push(`${table}[${i}].art: 画像の一覧にないキー「${row.art}」`);
        }
      });
    }
  }
  return problems;
}
