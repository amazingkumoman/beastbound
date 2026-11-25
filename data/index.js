// マスターデータ（ゲームの決まり）。13 データ設計書。
// ここには「決定済み」のものだけを入れる。数値・名前が保留のものは空にしておく。
// ID は一度付けたら変えない（セーブデータが ID で記録するため）。

export const RANKS = [ // 決定 D-23（解放条件は保留 P-17）
  { id: 'rank_low', name: '下位' },
  { id: 'rank_high', name: '上位' },
  { id: 'rank_master', name: 'マスター級' },
];

export const WEAPON_TYPES = [ // 決定 D-09（性能・技は保留）
  { id: 'wt_greatsword', name: '大剣', art: 'wpn.greatsword' },
  { id: 'wt_twinblades', name: '双刃', art: 'wpn.twinblades' },
  { id: 'wt_hammer', name: '重槌', art: 'wpn.hammer' },
  { id: 'wt_lance', name: '竜槍', art: 'wpn.spear' },
  { id: 'wt_bow', name: '弓', art: 'wpn.bow' },
  { id: 'wt_chainblade', name: '鎖刃', art: 'wpn.chainblade' },
];

export const ARMOR_PARTS = [ // 決定 D-12
  { id: 'head', name: '頭' }, { id: 'chest', name: '胴' }, { id: 'arms', name: '腕' },
  { id: 'waist', name: '腰' }, { id: 'legs', name: '脚' },
];

export const SLOT_SIZES = [ // 決定 D-14：入る大きさ
  { id: 's', name: '小', fits: ['s'] },
  { id: 'm', name: '中', fits: ['s', 'm'] },
  { id: 'l', name: '大', fits: ['s', 'm', 'l'] },
];

export const RESEARCH_STAGES = [ // 決定 Q-04（各段階の条件は Q-34 のチェック方式で今後設計）
  { id: 'rs_unseen', name: '未遭遇' },
  { id: 'rs_seen', name: '初遭遇' },
  { id: 'rs_hunted', name: '初回狩猟' },
  { id: 'rs_familiar', name: '複数回遭遇' },
  { id: 'rs_studied', name: '研究進行' },
  { id: 'rs_complete', name: '研究完了' },
];

export const TIMES_OF_DAY = [ // 決定 Q-37（時間の進み方は保留 P-10）
  { id: 'dawn', name: '朝' }, { id: 'day', name: '昼' }, { id: 'dusk', name: '夕' }, { id: 'night', name: '夜' },
];

export const FACILITIES = [ // 正式方針4章。担当 NPC は保留 Q-03
  { id: 'fac_quest', name: 'クエスト受付', desc: '依頼を受ける' },
  { id: 'fac_workshop', name: '工房', desc: '武器・防具を作る・鍛える' },
  { id: 'fac_shop', name: 'ショップ', desc: 'アイテムを買う' },
  { id: 'fac_lab', name: '研究施設', desc: 'モンスターの研究・図鑑' },
  { id: 'fac_storage', name: '素材保管庫', desc: '素材の管理・売却' },
  { id: 'fac_canteen', name: '食事施設', desc: '狩猟前の食事' },
];

// 以下は中身が未確定（保留）。形だけ用意する。
export const MONSTERS = [];      // 23 モンスター設計書（個別の中身は spec/secret/・Q-15）
export const WEAPONS = [];       // 21 派生ツリーの節
export const TECHS = [];         // 21 技
export const ARMORS = [];        // 22
export const ARMOR_SETS = [];    // 22
export const SKILLS = [];        // 22
export const DECORATIONS = [];   // 22
export const ITEMS = [];         // 8章（性能 P-07）
export const MATERIALS = [];     // 14章（レアリティの呼び方 Q-05）
export const FIELDS = [];        // 24（名前 P-18）
export const QUESTS = [];        // 24
export const FOODS = [];         // 16章（効果 P-11）
export const NPCS = [];          // 4章（Q-03）
