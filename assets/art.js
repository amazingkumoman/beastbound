/* 画像の読み込み係。ゲーム側は ART.img('mon.gra') のように「キー」だけを使う。
   画像が無い・読めないときは仮画像（SVG）に自動で切り替わるので、エラーで止まらない。 */
(function () {
  const M = window.ART_MANIFEST || {};
  const BASE = (document.currentScript && document.currentScript.src.replace(/art\.js.*$/, '')) || 'assets/';
  const ok = {};   // キー → true(読めた) / false(無い)

  function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

  // 仮画像：種類ごとに「そこに何が入るか」が分かる形
  function placeholder(key) {
    const e = M[key] || { ph: 'item', label: key };
    const t = esc(e.label || key);
    let svg;
    if (e.ph === 'mon') {
      svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><defs><radialGradient id="g" cx=".5" cy=".55" r=".5"><stop offset="0" stop-color="#3a2a1c"/><stop offset="1" stop-color="#3a2a1c" stop-opacity="0"/></radialGradient></defs><ellipse cx="512" cy="560" rx="440" ry="360" fill="url(#g)"/><path d="M190 760 C200 560 300 400 470 380 C520 300 640 290 700 360 C820 380 880 500 860 620 C850 700 800 760 760 770 L720 700 L690 770 L360 770 L330 700 L290 770 Z" fill="#120d09" stroke="#c98a3a" stroke-width="6" stroke-dasharray="18 12" opacity=".9"/><circle cx="640" cy="440" r="14" fill="#ffb347"/><circle cx="700" cy="450" r="14" fill="#ffb347"/><text x="512" y="880" text-anchor="middle" font-size="56" fill="#e8c48a" font-family="serif">${t}（画像未配置）</text></svg>`;
    } else if (e.ph === 'bg') {
      svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b1712"/><stop offset=".6" stop-color="#2b2418"/><stop offset="1" stop-color="#0d0b08"/></linearGradient></defs><rect width="1600" height="900" fill="url(#s)"/><path d="M0 620 L180 520 L330 590 L520 460 L700 560 L900 430 L1100 560 L1300 480 L1600 600 L1600 900 L0 900Z" fill="#14110c"/><path d="M0 720 L260 650 L520 700 L820 640 L1100 700 L1400 650 L1600 700 L1600 900 L0 900Z" fill="#0b0906"/><text x="800" y="860" text-anchor="middle" font-size="30" fill="#6d5a3d" font-family="serif">背景：${t}（画像未配置）</text></svg>`;
    } else if (e.ph === 'icon') {
      svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><circle cx="64" cy="64" r="54" fill="#2a2119" stroke="#b8894a" stroke-width="5"/><text x="64" y="82" text-anchor="middle" font-size="52" fill="#f0d39a" font-family="serif">${t}</text></svg>`;
    } else if (e.ph === 'none') {
      return '';
    } else {
      svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect x="16" y="16" width="480" height="480" rx="24" fill="#1d1712" stroke="#8a6a3e" stroke-width="6" stroke-dasharray="20 12"/><path d="M120 400 L380 140 L400 160 L140 420Z" fill="#4a3a28"/><text x="256" y="470" text-anchor="middle" font-size="40" fill="#e8c48a" font-family="serif">${t}</text></svg>`;
    }
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  function url(key) { const e = M[key]; return e ? BASE + e.src : ''; }

  // <img> を返す。読めなければ仮画像に差し替え
  function img(key, attrs = '') {
    const e = M[key];
    if (!e || ok[key] === false) return `<img ${attrs} data-art="${key}" src="${placeholder(key)}" alt="${esc(e ? e.label : key)}">`;
    return `<img ${attrs} data-art="${key}" src="${url(key)}" alt="${esc(e.label)}" onerror="ART._fail(this)">`;
  }
  function _fail(el) { const k = el.dataset.art; ok[k] = false; el.onerror = null; const p = placeholder(k); if (p) el.src = p; else el.remove(); }

  // CSS の背景用。先に読み込みを試して、だめなら仮画像
  function bg(el, key) {
    const p = placeholder(key);
    el.style.backgroundImage = `url("${p}")`;
    if (ok[key] === false || !M[key]) return;
    const im = new Image();
    im.onload = () => { ok[key] = true; el.style.backgroundImage = `url("${url(key)}")`; };
    im.onerror = () => { ok[key] = false; };
    im.src = url(key);
  }

  // どの画像が揃っているかの点検（開発用）
  function audit() {
    return Promise.all(Object.keys(M).map(k => new Promise(r => {
      const im = new Image(); im.onload = () => r([k, true]); im.onerror = () => r([k, false]); im.src = url(k);
    }))).then(a => { a.forEach(([k, v]) => ok[k] = v); return a; });
  }

  window.ART = { img, bg, url, placeholder, audit, _fail, has: k => ok[k] === true };
})();
