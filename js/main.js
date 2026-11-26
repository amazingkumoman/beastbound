// 起動。12 システム構成図。
import * as DATA from '../data/index.js';
import { validateMasterData } from './core/masterdata.js';
import { createStore } from './core/store.js';
import { createSaveManager, browserStorage } from './save/saveManager.js';
import { createScreens } from './ui/screens.js';
import { toast } from './ui/components.js';
import { installZoom } from './ui/zoom.js';
import { titleScreen } from './ui/screens/title.js';
import { nameScreen } from './ui/screens/nameEntry.js';
import { introScreen, sceneScreen } from './ui/screens/intro.js';
import { labScreen, labMonsterScreen } from './ui/screens/lab.js';
import { settingsScreen, applySettings } from './ui/screens/settings.js';
import { sound } from './core/sound.js';
import { baseScreen, stubScreen } from './ui/screens/base.js';
import { dataScreen } from './ui/screens/dataManage.js';
import { battleScreen, battleResultScreen } from './ui/screens/battle.js';
import { arenaSetupScreen } from './ui/screens/arenaSetup.js';
import { equipScreen } from './ui/screens/equip.js';
import { workshopScreen } from './ui/screens/workshop.js';
import { normalize } from './systems/gear/gear.js';
import { normalizeHunt } from './systems/hunt/hunt.js';
import { shopScreen, storageScreen, canteenScreen } from './ui/screens/town.js';
import { questBoardScreen, prepScreen } from './ui/screens/quest.js';
import { exploreScreen, huntResultScreen } from './ui/screens/explore.js';

// 画面ごとの音楽（25b 5章）
const BGM_OF = { battle: 'battle', explore: 'explore', prep: 'explore' };

// 画像がまだないことが決まっているキー（30 グラフィック仕様書：鎖刃は新しく作る）
const ALLOW_MISSING_ART = [];

function boot() {
  const problems = validateMasterData(DATA, { manifest: window.ART_MANIFEST, allowMissingArt: ALLOW_MISSING_ART });
  if (problems.length) console.warn('マスターデータの問題', problems);

  let storage;
  try { storage = browserStorage(); storage.keys(); }
  catch { storage = null; }

  const store = createStore(null);
  // 読み込んだ・新しく始めた記録に、装備の形（はじめの6種の武器など）を整える
  store.subscribe((st, why) => { if (st && ['load', 'new', 'import', 'restore'].includes(why)) { normalizeHunt(normalize(st)); applySettings(st); } });
  sound.unlockOnGesture();
  installZoom(); // 絵を押す・長押しで大きく見る
  applySettings(null);
  // ボタンを押した音
  document.addEventListener('click', e => { if (e.target.closest('.btn:not(:disabled), .card.pick, .pt, .step')) sound.sfx('tap'); });
  const saves = storage ? createSaveManager({ storage }) : null;
  const ctx = {
    data: DATA,
    store,
    saves,
    hasSave: () => !!saves && saves.load().ok,
    /** 安全なときに呼ぶ自動保存（戦闘中は saves 側で断る） */
    autosave() {
      if (!saves || !store.get()) return;
      const r = saves.save(store.get());
      if (r.ok) store.replace(r.data, 'saved');
      else toast(`保存できませんでした：${r.error}`);
    },
    onShow(el, id) {
      sound.bgm(BGM_OF[id] ?? 'base');
      el.querySelectorAll('[data-art-bg]').forEach(e => window.ART.bg(e, e.dataset.artBg));
    },
  };
  ctx.screens = createScreens(document.getElementById('screen'), ctx);
  [titleScreen, nameScreen, introScreen, baseScreen, stubScreen, dataScreen, battleScreen, battleResultScreen, arenaSetupScreen, equipScreen, workshopScreen,
    shopScreen, storageScreen, canteenScreen, questBoardScreen, prepScreen, exploreScreen, huntResultScreen,
    sceneScreen, labScreen, labMonsterScreen, settingsScreen].forEach(s => ctx.screens.register(s));
  // 研究ノートから戻ったときは、タイトルを飛ばして拠点から再開する
  let resume = null; try { resume = sessionStorage.getItem('bb.resume'); sessionStorage.removeItem('bb.resume'); } catch { /* なし */ }
  const r = resume && saves ? saves.load() : null;
  if (r?.ok && r.data.profile.flags.introSeen) {
    store.replace(r.data, 'load');
    if (store.get().suspend) ctx.screens.reset('explore', {}); else ctx.screens.reset('base');
  } else ctx.screens.reset('title');
  if (!saves) toast('このブラウザでは保存ができません（プライベートモードなど）');

  window.BB = { ctx }; // 開発・確認用
}

boot();
