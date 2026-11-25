// 装備の名前（2026-11-25 ユーザー：「カタカナ型と漢字＋カタカナ型を混ぜて。モンスターハンターっぽく」「改と真は退屈」）。
// 下位はカタカナ（バルドブレイド → ロックバルドブレイド）、上位は漢字＋【カタカナ】（岩殻剣【ガルドス】→ 巌窟剣【ガルドラム】）、
// マスター級は二つ名の漢字＋【カタカナ】（翠王剣【ガイアロード】）。防具はカタカナ＋部位（ヘルム・メイル…）、ランクごとに別の名前。
// データ（gear*.js）の name は元の仮の名前のまま残し、ここで付け直す（applyNames）。

// 系統ごとの名前のもと
//   lo：下位の2段 [1段目, 2段目]（カタカナ）
//   hi：上位の2段 [[漢字, カタカナ], [漢字, カタカナ]]
//   ma：マスター級 [漢字, カタカナ]（前のランクから続く系統の最後の段。マスター級から始まる系統は 1段目=カタカナ型、2段目=漢字型）
//   ma2：マスター級から始まる系統の2段目のカタカナ
//   arm：防具のカタカナ [下位, 上位, マスター級]（その種が出てくるランクから）
export const LINE_NAMES = {
  m01: { lo: ['バルド', 'ロックバルド'], hi: [['岩殻', 'ガルドス'], ['巌窟', 'ガルドラム']], ma: ['翠王', 'ガイアロード'], arm: ['バルド', 'ガルドス', 'ガイアロード'] },
  m02: { lo: ['ヴェル', 'フレアヴェル'], hi: [['緋翼', 'ヴェルカイン'], ['烈翼', 'ヴェルバーン']], ma: ['天焔', 'イグニヴェル'], arm: ['ヴェル', 'ヴェルカイン', 'イグニヴェル'] },
  m03: { lo: ['グルボ', 'マッドグルボ'], hi: [['沼牙', 'ボアルグ'], ['毒淵', 'ボアザーグ']], ma: ['海神', 'リヴァルボア'], arm: ['グルボ', 'ボアルグ', 'リヴァルボア'] },
  m09: { lo: ['ゴラム', 'デューンゴラム'], hi: [['砂牙', 'ゴラムザード'], ['流砂', 'ザードゴラム']], ma: ['砂神', 'サンドロード'], arm: ['ゴラム'] },
  m10: { lo: ['バルガ', 'ブルバルガ'], hi: [['剛腕', 'ガルバルガ'], ['剛拳', 'ガルナックル']], ma: ['覇拳', 'オーガバルガ'], arm: ['バルガ'] },
  m11: { lo: ['カブラ', 'ホーンカブラ'], hi: [['鎧角', 'カブラギア'], ['雷殻', 'カブラボルト']], ma: ['雷甲', 'ギガカブラ'], arm: ['カブラ'] },
  m12: { lo: ['ミズチ', 'ヴァイパーミズチ'], hi: [['蛇牙', 'ミズチアス'], ['毒鱗', 'ミズチヴェノ']], ma: ['蛇神', 'オロチノア'], arm: ['ミズチ'] },
  m04: { hi: [['疾風', 'ザルガード'], ['迅爪', 'ザルガレイド']], ma: ['神速', 'ゼファザルガ'], arm: [null, 'ザルガ', 'ゼファザルガ'] },
  m05: { hi: [['甲山', 'オルドゥーム'], ['古甲', 'オルドバスト']], ma: ['古王', 'エルダーム'], arm: [null, 'オルド', 'エルダーム'] },
  m06: { hi: [['雷角', 'ライゼンガ'], ['轟角', 'ライゼンボルグ']], ma: ['天雷', 'ボルトライゼン'], arm: [null, 'ライゼ', 'ボルトライゼン'] },
  m02s: { hi: [['氷翼', 'フロスヴェルグ'], ['凍翼', 'フロストバーン']], ma: ['氷河', 'グレイシヴェル'], arm: [null, 'フロスヴェル'] },
  m13: { hi: [['嵐翼', 'フウガスト'], ['風切', 'フウガレイ']], ma: ['天嵐', 'テンペフウガ'], arm: [null, 'フウガ'] },
  m14: { hi: [['凍鱗', 'ラギアクア'], ['氷瀑', 'ラギアフォール']], ma: ['凍海', 'アビスラギア'], arm: [null, 'ラギア'] },
  m15: { hi: [['蜘蛛', 'アラクネス'], ['毒糸', 'アラクスピナ']], ma: ['女王', 'クイーンアラク'], arm: [null, 'アラク'] },
  m16: { hi: [['菌樹', 'ミコラーデ'], ['胞子', 'ミコラスポア']], ma: ['神木', 'ユグミコラ'], arm: [null, 'ミコラ'] },
  m07: { ma: ['守護竜', 'アステリオン'], ma2: 'スターガーディアン', arm: [null, null, 'アステリ'] },
  m08: { ma: ['地底王', 'クリスタグラウム'], ma2: 'グラウムキング', arm: [null, null, 'グラウ'] },
  m04s: { ma: ['夜叉', 'ヤシャザルガ'], ma2: 'ナイトファング', arm: [null, null, 'ノワザルガ'] },
  m17: { ma: ['三首竜', 'ミツクビオロチ'], ma2: 'トリオロチ', arm: [null, null, 'ミツクビ'] },
  m18: { ma: ['天海', 'セレスティアクジラ'], ma2: 'セレスホエル', arm: [null, null, 'アマクジ'] },
  m19: { ma: ['常闇', 'ノクスカゲ'], ma2: 'シャドウルーラー', arm: [null, null, 'カゲツグ'] },
  m20: { ma: ['熔核', 'マグマヴォルグ'], ma2: 'ヴォルカノン', arm: [null, null, 'ヴォルグ'] },
};
// 希少素材の最後の段：[漢字, カタカナ]
export const EX_NAMES = { star: ['星涙', 'ステラ'], flame: ['天焦', 'ソルフレア'], thunder: ['雷霆', 'ケラウノス'], crystal: ['晶王', 'クリスタリア'], fang: ['夜叉毒', 'ヴェノムヤシャ'], dark: ['常夜', 'ノクターン'] };
// 武器の種類：[カタカナの語, 漢字の語, 基本の武器の名前]
export const KIND_WORDS = {
  wt_greatsword: ['ブレイド', '剣', '鉄塊刀'], wt_twinblades: ['デュアル', '双刃', '双牙ナイフ'], wt_hammer: ['ハンマー', '槌', '石打ちハンマー'],
  wt_lance: ['ランス', '槍', '鉄穂ランス'], wt_bow: ['ボウ', '弓', '狩人の長弓'], wt_chainblade: ['チェイン', '鎖', '鉄鎖刃'],
};
const PART_KANA = { head: 'ヘルム', chest: 'メイル', arms: 'アーム', waist: 'コイル', legs: 'グリーヴ' };
const PART_KANJI = { head: '兜', chest: '鎧', arms: '籠手', waist: '腰当', legs: '脚甲' };
const CLOTH_KANJI = { head: '頭巾', chest: '胴着', arms: '手甲', waist: '腰帯', legs: '脚絆' };
// 防具の組 → [系統, ランク番号（0=下位 1=上位 2=マスター級）]
const SET_LINE = { set_m01h: ['m01', 1], set_m02h: ['m02', 1], set_m03h: ['m03', 1], set_m01m: ['m01', 2], set_m02m: ['m02', 2], set_m03m: ['m03', 2], set_m04m: ['m04', 2], set_m05m: ['m05', 2], set_m06m: ['m06', 2] };
const CLOTH = { set_g_frost: ['霜織', 'フロストクロス'], set_g_stone: ['古都石', 'オールドストーン'], set_g_star: ['星糸', 'ステラスレッド'] };
const EX_SETS = { set_ex_star: ['星涙', 'ステラ'], set_ex_iron: ['金剛', 'アダマス'] };
const RANK_NO = { low: 0, high: 1, master: 2 };

function weaponName(n, i, fromBefore) {
  const [kw, kk, base] = KIND_WORDS[n.kindId];
  if (!n.parentId) return base;
  const m = n.id.match(/^wpn_[a-z]+_(.+)_([^_]+)$/); if (!m) return n.name;
  if (m[1] === 'x') { const [kj, kn] = EX_NAMES[m[2]]; return `${kj}${kk}【${kn}】`; }
  const L = LINE_NAMES[m[1]]; if (!L) return n.name;
  const rank = n.rank || 'low';
  if (rank === 'low') return `${L.lo[Math.min(i, 1)]}${kw}`;
  if (rank === 'high') { const [kj, kn] = L.hi[Math.min(i, 1)]; return `${kj}${kk}【${kn}】`; }
  if (fromBefore) return `${L.ma[0]}${kk}【${L.ma[1]}】`;
  return i === 0 ? `${L.ma[1]}${kw}` : `${L.ma[0]}${kk}【${L.ma2}】`;
}

/** 一覧の名前を付け直す（CATALOG を書き換える） */
export function applyNames(C) {
  const groups = {};
  for (const n of C.weapons) {
    if (n.dev || !n.parentId) continue;
    const m = n.id.match(/^wpn_([a-z]+)_(.+)_([^_]+)$/); if (!m || m[2] === 'x') continue;
    (groups[`${m[1]}|${m[2]}|${n.rank || 'low'}`] ??= []).push(n);
  }
  const info = new Map();
  for (const list of Object.values(groups)) {
    list.sort((a, b) => a.tier - b.tier);
    const line = list[0].id.match(/^wpn_[a-z]+_(.+)_[^_]+$/)[1];
    const fromBefore = C.weapons.some(w => !w.dev && w.kindId === list[0].kindId && (w.rank || 'low') !== 'master' && w.id.includes(`_${line}_`));
    list.forEach((n, i) => info.set(n.id, [i, fromBefore]));
  }
  for (const n of C.weapons) if (!n.dev) { const [i, fb] = info.get(n.id) ?? [0, false]; n.name = weaponName(n, i, fb); }
  for (const a of C.armors) {
    if (a.dev) continue;
    const sid = a.setId;
    if (CLOTH[sid]) { const [kj, kn] = CLOTH[sid]; a.name = `${kj}${CLOTH_KANJI[a.part]}【${kn}】`; continue; }
    if (EX_SETS[sid]) { const [kj, kn] = EX_SETS[sid]; a.name = `${kj}${PART_KANJI[a.part]}【${kn}】`; continue; }
    const root = armorRoot(sid, a.rank); if (root) a.name = `${root}${PART_KANA[a.part]}`;
  }
  for (const s of C.sets) {
    if (CLOTH[s.id] || EX_SETS[s.id] || s.id === 'set_test') continue;
    const root = armorRoot(s.id, s.rank); if (root) s.name = root;
  }
  return C;
}
function armorRoot(sid, rank) {
  const [line, r] = SET_LINE[sid] ?? [sid.replace(/^set_/, ''), RANK_NO[rank || 'low']];
  const L = LINE_NAMES[line]; if (!L) return null;
  return L.arm[r] ?? L.arm.find(Boolean);
}
