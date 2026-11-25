// 戦闘画面（25章：モンスターを大きく、HP・気力は見やすく、コマンドは下）。
// しくみは systems/battle/engine.js。ここは「起きたこと」を文章と演出にするだけ。
// モンスターの体力は一切表示しない（D-04）。ダメージの数字も出さない（Q-06）。
import { createBattle, choices, step, setAim, partOpen, RANGES, RANGE_NAME } from '../../systems/battle/engine.js';
import { esc, confirmDialog } from '../components.js';
import { applyBattle, finishQuest } from '../../systems/hunt/hunt.js';
import { sfx } from '../../core/sound.js';

// 状態の印（Q-07：画像を使わず SVG）
const ICON = {
  poison: '<svg viewBox="0 0 12 12"><path d="M6 1C4 4 3 5.5 3 7.5a3 3 0 006 0C9 5.5 8 4 6 1z" fill="currentColor"/></svg>',
  bleed: '<svg viewBox="0 0 12 12"><path d="M6 1L3.5 6.5a2.8 2.8 0 105 0z" fill="currentColor"/><circle cx="9.5" cy="3" r="1.2" fill="currentColor"/></svg>',
  paralysis: '<svg viewBox="0 0 12 12"><path d="M7 1L3 7h3l-1 4 4-6H6z" fill="currentColor"/></svg>',
  good: '<svg viewBox="0 0 12 12"><path d="M6 1l1.5 3.2 3.5.4-2.6 2.3.8 3.4L6 8.6 2.8 10.3l.8-3.4L1 4.6l3.5-.4z" fill="currentColor"/></svg>',
  bad: '<svg viewBox="0 0 12 12"><path d="M2 2l3 4-1 4M6 1l1 4 3 1M7 5l-1 6" stroke="currentColor" stroke-width="1.3" fill="none"/></svg>',
};
const badge = (cls, text) => `<span class="badge ${cls}">${ICON[cls] || ''}${text}</span>`;

// テンポ（実プレイの声で短くした）。戦闘中に画面を押すと、その場の文章を先送りできる
let skipping = false;
const wait = ms => new Promise(r => setTimeout(r, skipping ? 0 : ms * (window.BB_SPEED ?? 1)));
const T = { say: 420, act: 140, feel: 320, start: 450, faint: 1100 };
const POWER = m => (m >= 2 ? '大' : m >= 1.1 ? '中' : '小');
const OPEN = o => (['なし', '小', '大'][o] ?? '大');
const FEEL = { good: '確かな手応えがある。', bad: '硬い。手応えが鈍い。', ok: '' };
const P_AIL = { poison: '毒', bleed: '出血', paralysis: '麻痺' };

export const battleScreen = {
  id: 'battle',
  render(ctx, p) {
    return `
      <div class="field" data-art-bg="${esc(p.field || 'bg.field.01')}">
        <div class="tell" aria-live="polite"></div>
        <div class="mon-name"><b>${esc(p.monster.name)}</b></div>
        <div class="range-bar" aria-label="間合い"><span data-r="near">近</span><span data-r="mid">中</span><span data-r="far">遠</span><em class="range-note"></em></div>
        <div class="mon"><div class="mon-body"><span class="mon-img"></span></div></div>
        <div class="flash"></div>
      </div>
      <div class="rail"></div>
      <div class="status">
        <div class="bars">
          <div class="row"><span>体力</span><div class="bar"><i class="hp"></i></div><span class="num hpN"></span></div>
          <div class="row"><span>気力</span><div class="bar"><i class="st"></i></div><span class="num stN"></span></div>
        </div>
        <div class="badges" aria-label="状態"></div>
      </div>
      <div class="bottom">
        <div class="msg" aria-live="polite"></div>
        <div class="cmds"></div>
      </div>
`;
  },
  bind(el, ctx, p) {
    ctx.saves?.setLocked(true); // 戦闘中は保存しない（D-28）
    const $ = s => el.querySelector(s);
    let { state: s, events } = createBattle({ monster: p.monster, weapon: p.weapon, items: p.items, seed: p.seed ?? Date.now(), prior: p.prior, gear: p.gear });
    let busy = false, picking = false, menu = null; // menu：技・道具・移動を開いているとき、その種類

    $('.mon-img').innerHTML = window.ART.img(p.monster.art);
    $('.mon-body').insertAdjacentHTML('beforeend', Object.entries(p.monster.parts).map(([k, pt]) =>
      `<button class="part" data-part="${k}" style="left:${pt.x}%;top:${pt.y}%" aria-label="${esc(pt.name)}を狙う"><span>${esc(pt.name)}</span></button>`).join(''));

    function draw() {
      const P = s.P;
      $('.hp').style.width = `${P.hp / P.hpMax * 100}%`; $('.hpN').innerHTML = `${P.hp}<small>/${P.hpMax}</small>`;
      $('.st').style.width = `${P.st / P.stMax * 100}%`; $('.stN').innerHTML = `${P.st}<small>/${P.stMax}</small>`;
      const b = Object.keys(P.ail).map(k => badge(k, P_AIL[k]));
      if (P.paralyzed) b.push(badge('paralysis', '麻痺'));
      if (P.chance) b.push(badge('good', '好機'));
      if (s.wpn.kind === 'greatsword') b.push(`<span class="badge self">溜め ${P.charge}/2</span>`);
      if (s.wpn.kind === 'twinblades') b.push(`<span class="badge self">勢い ${P.momentum}/5</span>`);
      if (s.wpn.kind === 'bow') b.push(`<span class="badge self">${P.arrow === 'pierce' ? '貫く矢' : '通常の矢'}</span>`);
      if (P.guardUp > 0) b.push(`<span class="badge self">不動 ${P.guardUp}</span>`);
      if (P.chain && !s.M.parts[P.chain]?.broken) b.push(`<span class="badge self">鎖：${esc(s.mon.parts[P.chain].name)}</span>`);
      if (P.nextOpening) b.push(badge('bad', '隙'));
      b.push(`<span class="badge faint">力尽き ${P.faints}/3</span>`);
      $('.badges').innerHTML = b.join('');
      const reach = s.wpn.reach;
      el.querySelectorAll('.range-bar [data-r]').forEach(x => {
        x.classList.toggle('now', x.dataset.r === s.range);
        x.classList.toggle('reach', reach.includes(x.dataset.r));
      });
      $('.range-note').textContent = (s.M.air ? '空にいる・' : '') + (s.M.under ? '地中にいる・' : '') + (reach.includes(s.range) ? '武器が届く' : `武器が届かない（届くのは ${reach.map(r => RANGE_NAME[r]).join('・')}）`);
      $('.range-note').classList.toggle('bad', !reach.includes(s.range));
      el.querySelector('.field').dataset.range = s.range;
      el.querySelectorAll('.part').forEach(x => {
        const k = x.dataset.part;
        x.classList.toggle('broken', s.M.parts[k].broken);
        x.classList.toggle('closed', !partOpen(s, k)); // 隠れた部位（さらけ出したときだけ狙える）
        x.classList.toggle('sel', P.aim === k);
      });
      el.querySelector('.field').classList.toggle('picking', picking);
      drawCmds();
    }

    function drawCmds() {
      if (s.over) { $('.cmds').innerHTML = ''; return; } // 終わった後は選べる行動がない
      const list = choices(s);
      const by = id => list.find(c => c.id === id);
      const lock = busy || !!s.over;
      if (by('wait')) {
        const free = list.filter(c => c.type === 'item' && c.free); // 気付け薬（ターンを使わない）
        $('.cmds').innerHTML = `<button class="cmd wide" data-id="wait" ${lock ? 'disabled' : ''}>動けない……<small>次へ</small></button>` +
          free.map(c => `<button class="cmd wide" data-id="${c.id}" ${lock || c.disabled ? 'disabled' : ''}>${esc(c.label)}<small>${esc(c.disabled ? c.reason : `${c.sub}・ターンを使わない`)}</small></button>`).join('');
        return;
      }
      const techs = list.filter(c => c.type === 'tech' || c.type === 'special'), items = list.filter(c => c.type === 'item');
      if (menu) { // 下のコマンド欄を、技・道具・移動の一覧に切り替える（小窓は使わない）
        const sub = list.filter(c => c.type === menu || (menu === 'tech' && c.type === 'special'));
        $('.cmds').classList.add('submenu');
        // 「戻る」は先頭に置く（一覧が長くても必ず押せるように。不具合 B-006）
        $('.cmds').innerHTML = `<div class="sub-head"><span class="sub-title">${{ tech: '技', item: '道具', move: '移動' }[menu]}</span><button class="cmd back" data-back-menu ${lock ? 'disabled' : ''}>戻る</button></div>` +
          sub.map(c => `<button class="cmd opt" data-id="${c.id}" ${lock || c.disabled ? 'disabled' : ''}>${esc(c.label)}<small>${esc(detail(c))}</small>${c.disabled && c.reason ? `<small class="why">${esc(c.reason)}</small>` : ''}</button>`).join('');
        return;
      }
      $('.cmds').classList.remove('submenu');
      const btn = (c, extra = '') => `<button class="cmd" data-id="${c.id}" ${lock || c.disabled ? 'disabled' : ''} title="${esc(c.reason || '')}">${esc(c.label)}<small>${esc(c.disabled && c.reason ? c.reason : c.sub)}</small>${extra}</button>`;
      const group = (key, label, sub, arr) => `<button class="cmd ${arr.some(c => c && !c.disabled) ? '' : 'dim'}" data-group="${key}" ${lock || !arr.length ? 'disabled' : ''}>${label}<small>${sub}</small></button>`; // 使えなくても一覧は開ける（理由を見せる）
      $('.cmds').innerHTML = [
        btn(by('light')), btn(by('heavy')), group('tech', '技', `${techs.filter(c => c.type === 'tech').length}種${s.wpn.special ? '＋専用' : ''}`, techs),
        btn(by('guard')), btn(by('dodge')), group('move', '移動', '詰める・離れる', [by('move_in'), by('move_out')]),
        group('item', '道具', `${items.reduce((n, c) => n + (c.disabled ? 0 : 1), 0)}種`, items),
        `<button class="cmd ${picking || s.P.aim ? 'on' : ''}" data-pick ${lock ? 'disabled' : ''}>狙う<small>${s.P.aim ? esc(s.mon.parts[s.P.aim].name) : '部位を選ぶ'}</small></button>`,
        `<button class="cmd" data-id="retreat" ${lock ? 'disabled' : ''}>撤退<small>失敗あつかい</small></button>`,
      ].join('');
    }

    /** 一覧に出す説明（数字は自分の側のものだけ） */
    function detail(c) {
      if (c.type === 'special') return `${c.sub}　${s.wpn.special.desc}`;
      if (c.type === 'tech') {
        const t = s.wpn.techs.find(x => x.id === c.techId);
        const power = t.mult ? `威力${POWER(t.mult * (t.hits || 1))}${t.hits > 1 ? `（${t.hits}回）` : ''}・` : '';
        return `気力${t.st}・${power}隙${OPEN(t.opening)}・${t.desc}`;
      }
      if (c.type === 'item') {
        const it = s.items.find(x => x.id === c.itemId);
        if (it.desc) return `${it.desc}・残り${it.count}`;
        return `${it.heal ? `体力を${it.heal}回復` : ''}${it.cure ? '毒・出血を治す' : ''}・残り${it.count}・ターンを使う`;
      }
      if (c.type === 'move') {
        const to = RANGES[Math.max(0, Math.min(2, RANGES.indexOf(s.range) + (c.dir === 'in' ? -1 : 1)))];
        return `${RANGE_NAME[s.range]} → ${RANGE_NAME[to]}・気力が少し戻る・ターンを使う`;
      }
      return c.sub;
    }

    async function play(evs) {
      for (const e of evs) {
        if (e.type === 'say') { $('.msg').innerHTML = esc(e.text); if (/をかわした/.test(e.text)) sfx('dodge'); else if (/を使った/.test(e.text)) sfx('item'); await wait(T.say); }
        else if (e.type === 'act' && e.who === 'player') { $('.msg').textContent = `${e.name}！`; await wait(T.act); }
        else if (e.type === 'guard') sfx(e.result === 'full' ? 'guard' : 'hurt');
        else if (e.type === 'break') { sfx('break'); const m = $('.mon'); m.classList.remove('broke'); void m.offsetWidth; m.classList.add('broke'); }
        else if (e.type === 'sign') $('.mon').classList.add('weak');
        else if (e.type === 'charge') $('.mon').classList.add('charging');
        else if (e.type === 'break-charge') { $('.mon').classList.remove('charging'); sfx('break'); }
        else if (e.type === 'expose') { sfx('good'); draw(); }
        else if (e.type === 'miss') sfx('guard');
        else if (e.type === 'harden') { $('.mon').classList.add('hardened'); sfx('guard'); }
        else if (e.type === 'phase') { $('.mon').classList.add('rage'); sfx('roar'); }
        else if (e.type === 'hit' && e.target === 'monster') {
          const m = $('.mon'); m.classList.remove('hit'); void m.offsetWidth; m.classList.add('hit'); sfx('hit');
          if (FEEL[e.feel]) { $('.msg').textContent = FEEL[e.feel]; await wait(T.feel); } else await wait(T.act);
        } else if (e.type === 'hit' && e.target === 'player') {
          const f = $('.flash'); f.classList.remove('on'); void f.offsetWidth; f.classList.add('on'); sfx('hurt'); draw();
        } else if (e.type === 'range') { draw(); }
        else if (e.type === 'rage') { $('.mon').classList.toggle('rage', e.on); if (e.on) sfx('roar'); }
        else if (e.type === 'tired') { $('.mon').classList.toggle('tired', e.on); }
        else if (e.type === 'down') { $('.mon').classList.add('down'); }
        else if (e.type === 'tell') {
          $('.mon').classList.remove('down'); if (!s.M.charging) $('.mon').classList.remove('charging'); if (!(s.M.harden > 0)) $('.mon').classList.remove('hardened');
          const t = $('.tell'); t.textContent = e.text; t.classList.toggle('on', !!e.text); $('.mon').classList.toggle('wind', !!e.text);
        }
      }
      draw();
    }

    async function act(id) {
      if (busy || s.over) return;
      busy = true; picking = false; menu = null;
      $('.tell').classList.remove('on'); $('.mon').classList.remove('wind');
      draw();
      const evs = step(s, { id });
      skipping = false;
      await play(evs);
      skipping = false;
      busy = false; draw();
      if (s.over) await finish();
    }

    async function finish() {
      const r = s.over.result;
      ctx.saves?.setLocked(false);
      if (p.hunt) return finishHunt(r);
      if (r === 'faint') {
        $('.msg').textContent = `力尽きた……（${s.P.faints}/3）　野営地で手当てを受けた。`;
        await wait(T.faint);
        ctx.screens.go('battle', { ...p, prior: s.over.snapshot, seed: `${p.seed ?? ''}-${s.P.faints}` }, { replace: true });
        return;
      }
      if (r === 'fled') {
        const again = await confirmDialog({ title: '逃げられた', body: '<p>傷ついた獣は別の場所へ逃げた。追いかけますか？</p><p class="note">（探索マップができるまでは、その場で続きから戦います）</p>', ok: '追いかける', cancel: '拠点へ戻る' });
        if (again) { ctx.saves?.setLocked(true); ctx.screens.go('battle', { ...p, prior: s.over.snapshot, seed: `${p.seed ?? ''}-fled` }, { replace: true }); return; }
      }
      ctx.screens.go('battleResult', { result: r, name: p.monster.name, turns: s.turn }, { replace: true });
    }

    /** 探索の中の戦闘：結果を探索マップへ戻す（力尽き → 野営地・逃走 → 追いかける） */
    async function finishHunt(r) {
      const end = { win: `${p.monster.name}を仕留めた！`, capture: `${p.monster.name}を捕らえた！`, faint: `力尽きた……（${s.P.faints}/3）`, fled: '獲物は逃げ去った。', fail: '力尽きた……', retreat: '戦いから退いた。' }[r];
      if (end) { sfx(r === 'win' || r === 'capture' ? 'good' : r === 'faint' || r === 'fail' ? 'faint' : 'tap'); $('.msg').textContent = end; await wait(T.faint); }
      const out = { result: r, turns: s.turn, snapshot: s.over.snapshot, items: s.items, acts: s.acts, broken: Object.keys(s.M.parts).filter(k => s.M.parts[k].broken), kindId: s.wpn.id, seenActs: [...new Set(s.log.filter(e => e.type === 'act' && e.who === 'monster').map(e => e.id))] };
      let res;
      ctx.store.update(st => { res = applyBattle(st, p.monster.id, out); return st; });
      if (res.end === 'fail') { finishQuest(ctx.store.get()); ctx.autosave(); ctx.screens.reset('huntResult'); return; }
      ctx.autosave();
      ctx.screens.reset('explore', { lines: res.lines });
    }

    el.addEventListener('click', e => {
      if (busy && e.target.closest('.field, .msg')) { skipping = true; return; } // 押すと先送り
      const part = e.target.closest('.part');
      if (part && !busy && !s.over) {
        const k = part.dataset.part;
        setAim(s, s.P.aim === k ? null : k);
        picking = false; $('.msg').textContent = s.P.aim ? `${s.mon.parts[k].name}を狙う。` : '部位を決めずに攻める。';
        return draw();
      }
      const c = e.target.closest('.cmd');
      if (!c || c.disabled) return;
      if (c.hasAttribute('data-back-menu')) { menu = null; return draw(); }
      if (c.hasAttribute('data-pick')) { picking = !picking; $('.msg').textContent = picking ? '狙う部位を、モンスターの上の印から選ぶ。（ターンは使わない）' : ''; return draw(); }
      if (c.dataset.group) { menu = c.dataset.group; picking = false; return draw(); }
      if (c.dataset.id === 'retreat') {
        return confirmDialog({ title: '撤退しますか？', body: '<p>狩りは失敗あつかいになります。</p>', ok: '撤退する', danger: true }).then(ok => ok && act('retreat'));
      }
      if (c.dataset.id) act(c.dataset.id);
    });

    draw();
    (async () => { busy = true; draw(); $('.msg').textContent = p.prior ? '再び相対した。' : `${p.monster.name}が現れた！`; await wait(T.start); await play(events.filter(e => e.type === 'tell')); busy = false; draw(); })();
  },
};

/** 戦闘の結果（第7段階で報酬・研究を入れる） */
export const battleResultScreen = {
  id: 'battleResult',
  render(ctx, p) {
    const title = { win: '狩猟成功', capture: '捕獲成功', fail: '狩猟失敗', retreat: '撤退', fled: '取り逃がした' }[p.result] || '終了';
    const note = {
      win: `${esc(p.name)}を仕留めた。`,
      capture: `${esc(p.name)}を捕らえた。`,
      fail: '3回力尽きた。傷を癒やして、また挑もう。',
      retreat: '無理をせず引き返した。',
      fled: '獲物は逃げ去った。',
    }[p.result] || '';
    return `
      <div class="head"><div><div class="place">RESULT</div><h1>${title}</h1></div></div>
      <div class="paper"><p class="empty">${note}</p><p class="note">（試験場の結果は記録されません。報酬はクエストで受け取れます）</p></div>
      <div class="bottombar"><button class="btn main" data-back autofocus>拠点へ戻る</button></div>`;
  },
  bind(el, ctx) {
    el.querySelector('[data-back]').onclick = () => { ctx.autosave(); ctx.screens.reset('base'); };
  },
};
