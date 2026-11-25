// 武器の系統と、作れる武器の種類（2026-11-25 ユーザー：「全部のモンスターで全部の派生を作るとたいへんなことになる。
// このモンスターは槍と弓だけ、この属性だけ、のように差別化して」）。
// 武器の種類はモンスターの体や性質に合わせて1〜4種類。属性（状態異常）は系統ごとに1つ（data の派生の element / ail のまま）。
// 6種類の武器それぞれに、下位・上位・マスター級の系統が2つ以上あるように割り振っている。
export const LINE_KINDS = {
  // 下位から始まる系統（2026-11-25 ユーザー：「属性や性質を意識して。2種類に限らなくてよい」）
  m01: ['greatsword', 'hammer', 'lance'],   // 岩のような甲殻の重い獣：重い武器と、甲殻の盾つき槍
  m02: ['bow', 'twinblades', 'greatsword'], // 炎の翼の竜：翼膜の弓、鋭い爪の双刃、炎の大剣
  m03: ['chainblade', 'lance'],             // ぬめる沼の獣：粘る鎖、水を突く槍
  m09: ['hammer', 'lance'],                 // 砂に潜る大蚯蚓：輪の牙の槌、穿つ槍
  m10: ['twinblades', 'hammer'],            // 豪腕の猿：引き裂く双刃、殴る槌
  m11: ['lance', 'hammer'],                 // 角と甲の甲虫：角の槍、甲の槌
  m12: ['chainblade', 'bow', 'twinblades'], // 長い大蛇：長い鎖、毒牙の矢、牙の双刃
  // 上位から始まる系統
  m04: ['twinblades', 'greatsword'],        // 爪刃の走竜：爪の双刃、刃の大剣
  m05: ['hammer', 'lance', 'greatsword'],   // 山のような古獣：重い武器ばかり
  m06: ['lance', 'bow', 'chainblade'],      // 雷の角の鹿：角の槍、角の弓、雷を伝う鎖
  m02s: ['bow', 'greatsword'],              // 氷の翼の竜：翼膜の弓、氷の大剣
  m13: ['bow', 'twinblades'],               // 嵐を呼ぶ鳥：風切羽の弓、蹴爪の双刃
  m14: ['lance', 'chainblade'],             // 凍河の魚竜：銛の槍、ひれの鎖
  m15: ['chainblade', 'bow'],               // 大蜘蛛：糸の鎖、毒の矢
  m16: ['hammer', 'bow'],                   // 古木の菌獣：幹の槌、枝の弓
  // マスター級から始まる系統
  m07: ['greatsword', 'lance', 'bow', 'twinblades'], // 古い守り竜：伝説の竜は4種類
  m08: ['hammer', 'greatsword'],            // 晶殻の大蟹：鋏の槌、殻の大剣
  m04s: ['twinblades', 'chainblade'],       // 黒い疾風：毒の爪の双刃、鎖
  m17: ['chainblade', 'lance', 'twinblades'], // 三つ首の毒竜：三つの首の鎖、牙の槍、双刃
  m18: ['bow', 'hammer'],                   // 空の巨鯨：ひれの弓、巨体の槌
  m19: ['twinblades', 'chainblade'],        // 影の獣：影の双刃、影の鎖
  m20: ['hammer', 'greatsword'],            // 溶岩の巨人：岩の槌、熔けた大剣
};
// 希少素材の最後の段は、武器の種類ごとに1本（元になる系統がその種類を持っていること）
export const EX_KIND = { star: 'greatsword', dark: 'twinblades', crystal: 'hammer', fang: 'lance', flame: 'bow', thunder: 'chainblade' };

/** その派生を一覧に残すか（基本の武器・開発用は残す） */
export function keepWeapon(n) {
  if (n.dev || !n.parentId) return true;
  const m = n.id.match(/^wpn_([a-z]+)_(.+)_([^_]+)$/); if (!m) return true;
  if (m[2] === 'x') return EX_KIND[m[3]] === m[1];
  return LINE_KINDS[m[2]]?.includes(m[1]) ?? true;
}
