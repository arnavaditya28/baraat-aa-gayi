// DOM screens: title, HUD, news break, pause/settings, result card, sharing, achievements.
window.BAG = window.BAG || {};

// Set this to the public game URL once it is hosted (used in WhatsApp messages and the card).
BAG.PUBLIC_URL = 'https://arnavaditya28.github.io/baraat-aa-gayi/';

BAG.UI = (function () {
  const U = {};
  const AU = BAG.Audio;
  const $ = s => document.querySelector(s);
  let lastCfg = null, newsCb = null, newsTimers = [];

  function store(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || 'null'); localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }

  function gameUrl() {
    if (location.protocol.startsWith('http') && !/localhost|127\.0\.0\.1/.test(location.hostname)) return location.origin + location.pathname;
    return BAG.PUBLIC_URL || '';
  }
  function wa(text) { window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank', 'noopener'); }

  // ---------- Layout scaling ----------
  function fit() {
    const s = Math.min(window.innerWidth / 1280, window.innerHeight / 720);
    const app = $('#app');
    app.style.transform = 'translate(-50%, -50%) scale(' + s + ')';
  }

  // ---------- Name filter ----------
  function cleanName(raw, fallback) {
    let n = (raw || '').trim().replace(/\s+/g, ' ').slice(0, 12);
    if (!n) return { name: fallback, msg: null };
    const low = n.toLowerCase().replace(/[^a-z\s]/g, '');
    const words = low.split(/\s+/);
    const bad = BAG.BAD_WORDS.some(b => low.replace(/\s/g, '').includes(b)) || words.some(x => BAG.BAD_EXACT.includes(x));
    if (bad) return { name: 'Sanskari Bachcha', msg: 'Naam thoda sanskari rakho 😅' };
    return { name: n, msg: null };
  }

  // ---------- Init ----------
  U.init = function () {
    fit(); window.addEventListener('resize', fit);
    AU.onLyric = U.lyric;

    // First click anywhere starts the audio (browsers block sound before that).
    const unlock = () => { AU.init(); if (BAG.Game.state() === 'title') AU.playTrack('title'); $('#tap-hint').classList.add('hide'); };
    document.addEventListener('pointerdown', unlock, { once: true });
    document.addEventListener('keydown', unlock, { once: true });

    // Restore names
    const saved = store('bag_names') || {};
    $('#p1-name').value = saved.p1 || '';
    $('#p2-name').value = saved.p2 || '';

    // Mode toggle
    let mode = saved.mode || 1;
    let looks = saved.looks || ['kurta', 'lehenga'];
    const setMode = m => {
      mode = m;
      document.querySelectorAll('[data-mode]').forEach(b => b.classList.toggle('on', +b.dataset.mode === m));
      $('#p2-row').classList.toggle('hide', m === 1);
      $('#controls-text').innerHTML = m === 1
        ? '<b>WASD / Arrow keys</b> chalo &nbsp;·&nbsp; <b>E / Space</b> kaam karo (hold)'
        : '<b style="color:#ffd166">P1:</b> WASD + <b>E</b> &nbsp;·&nbsp; <b style="color:#74b9ff">P2:</b> Arrow keys + <b>Enter</b>';
    };
    document.querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click', () => { setMode(+b.dataset.mode); AU.sfx('click'); }));
    setMode(mode);
    const setLook = (i, l) => {
      looks[i] = l;
      document.querySelectorAll('[data-look="' + i + '"]').forEach(b => b.classList.toggle('on', b.dataset.val === l));
    };
    document.querySelectorAll('[data-look]').forEach(b => b.addEventListener('click', () => { setLook(+b.dataset.look, b.dataset.val); AU.sfx('click'); }));
    setLook(0, looks[0]); setLook(1, looks[1]);

    const start = () => {
      AU.init();
      const a = cleanName($('#p1-name').value, 'Cousin No. 1');
      const b = cleanName($('#p2-name').value, 'Cousin No. 2');
      if (!$('#p1-name').value.trim()) { nudge('#p1-name', 'Naam toh likho beta!'); return; }
      if (mode === 2 && !$('#p2-name').value.trim()) { nudge('#p2-name', 'Dost ka naam bhi likho!'); return; }
      if (a.msg || b.msg) U.toast(a.msg || b.msg);
      store('bag_names', { p1: $('#p1-name').value, p2: $('#p2-name').value, mode, looks });
      const players = [{ name: a.name, look: looks[0] }];
      if (mode === 2) players.push({ name: b.name, look: looks[1] });
      lastCfg = { players };
      begin();
    };
    $('#btn-start').addEventListener('click', start);
    ['#p1-name', '#p2-name'].forEach(s => $(s).addEventListener('keydown', e => { if (e.key === 'Enter') start(); }));

    $('#btn-invite').addEventListener('click', () => {
      const url = gameUrl();
      wa('Bhai shaadi mein help chahiye, jaldi aa 😭\nFufaji naraaz hain, ghodi bhaag rahi hai, paneer khatam hone wala hai.\n\nBaraat Aa Gayi! 🐴🥁' + (url ? '\n' + url : ''));
    });
    $('#btn-howto').addEventListener('click', () => show('#howto'));
    $('#btn-howto-close').addEventListener('click', () => hide('#howto'));
    $('#btn-settings').addEventListener('click', () => openSettings());
    $('#btn-settings-close').addEventListener('click', () => hide('#settings'));

    // HUD buttons
    $('#btn-mute').addEventListener('click', e => { e.stopPropagation(); AU.init(); AU.toggleMute(); syncMute(); });
    $('#btn-pause').addEventListener('click', () => BAG.Game.togglePause());
    $('#btn-resume').addEventListener('click', () => BAG.Game.togglePause());
    $('#btn-pause-settings').addEventListener('click', () => openSettings());
    $('#btn-quit').addEventListener('click', () => { hide('#pause'); toTitle(); });

    // Settings sliders
    ['music', 'sfx', 'voice'].forEach(k => {
      const el = $('#vol-' + k);
      el.value = Math.round(AU.settings[k] * 100);
      el.addEventListener('input', () => { AU.init(); AU.setVol(k, el.value / 100); });
    });
    setupBollywood();
    $('#btn-apna').addEventListener('click', () => $('#apna-file').click());
    $('#apna-file').addEventListener('change', e => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      AU.playCustom(f);
      $('#btn-apna-stop').classList.remove('hide');
      U.toast('🎵 Ab baj raha hai: ' + f.name.replace(/\.[^.]+$/, '').slice(0, 40));
      e.target.value = '';
    });
    $('#btn-apna-stop').addEventListener('click', () => { AU.stopCustom(); $('#btn-apna-stop').classList.add('hide'); U.toast('Game ka music wapas!'); });
    $('#btn-hostel').addEventListener('click', () => {
      AU.init(); AU.hostelMode();
      ['music', 'sfx', 'voice'].forEach(k => { $('#vol-' + k).value = Math.round(AU.settings[k] * 100); });
      syncMute(); U.toast('Hostel Mode ON 🤫 Warden so raha hai');
    });

    // Global keys
    window.addEventListener('keydown', e => {
      if (e.target && e.target.tagName === 'INPUT') return;
      if (e.code === 'KeyM') { AU.init(); AU.toggleMute(); syncMute(); }
    });
    syncMute();
    renderAchievements();

    // Result buttons
    $('#btn-again').addEventListener('click', () => { hide('#result'); begin(); });
    $('#btn-menu').addEventListener('click', () => { hide('#result'); toTitle(); });
    $('#btn-news-next').addEventListener('click', () => finishNews());
  };

  // ---------- Bollywood Mode: a song file per situation, saved in this browser (IndexedDB) ----------
  const SLOTS = [
    ['main', '🏠 Menu / Taiyari'], ['baraat', '🐴 Baraat entry'], ['dance', '🕺 Dance floor / DJ'],
    ['sad', '😢 Sad moment (Fufaji)'], ['chase', '🏃 Ghodi chase'], ['vidaai', '💐 Pheras / Vidaai']
  ];
  function db() {
    return new Promise((res, rej) => {
      const r = indexedDB.open('baraat-songs', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('songs');
      r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
    });
  }
  async function dbDo(mode, fn) {
    const d = await db();
    return new Promise((res, rej) => { const tx = d.transaction('songs', mode); const q = fn(tx.objectStore('songs')); tx.oncomplete = () => res(q && q.result); tx.onerror = () => rej(tx.error); });
  }
  function setupBollywood() {
    const box = $('#bolly-slots'), input = $('#bolly-file');
    let picking = null;
    const draw = () => {
      box.innerHTML = SLOTS.map(([id, label]) => {
        const nm = AU.slotName(id);
        return '<div class="bolly-row"><span class="b-label">' + label + '</span><span class="b-file' + (nm ? '' : ' empty') + '">' +
          (nm ? '♪ ' + esc(nm) : 'game ka gaana') + '</span><button class="btn" data-pick="' + id + '">Chuno</button>' +
          (nm ? '<button class="btn" data-clear="' + id + '" title="Hatao">✕</button>' : '') + '</div>';
      }).join('');
    };
    box.addEventListener('click', e => {
      const pk = e.target.dataset.pick, cl = e.target.dataset.clear;
      if (pk) { picking = pk; input.click(); }
      if (cl) { AU.clearSlot(cl); dbDo('readwrite', s => s.delete(cl)).catch(() => {}); draw(); }
    });
    input.addEventListener('change', () => {
      const f = input.files && input.files[0];
      if (!f || !picking) return;
      AU.init();
      const name = f.name.replace(/\.[^.]+$/, '').slice(0, 50);
      AU.setSlot(picking, f, name);
      dbDo('readwrite', s => s.put({ name, blob: f }, picking)).catch(() => U.toast('Browser ne gaana save nahi kiya, par abhi bajega.'));
      U.toast('🎬 ' + SLOTS.find(s => s[0] === picking)[1] + ': ' + name);
      input.value = ''; draw();
    });
    // load songs saved earlier
    if (window.indexedDB) {
      Promise.all(SLOTS.map(([id]) => dbDo('readonly', s => s.get(id)).then(v => { if (v && v.blob) AU.setSlot(id, v.blob, v.name); }).catch(() => {})))
        .then(draw);
    }
    draw();
  }

  function begin() {
    hide('#title'); show('#hud');
    $('#alerts').innerHTML = '';
    BAG.Game.start(lastCfg);
    AU.sfx('click');
  }
  function toTitle() {
    hide('#hud'); show('#title'); $('#alerts').innerHTML = ''; alertEls.clear(); U.lyric('');
    renderAchievements();
    BAG.Game.quitToTitle();
  }

  function nudge(sel, msg) {
    const el = $(sel); el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); el.focus();
    U.toast(msg); AU.sfx('aye');
  }

  function show(s) { $(s).classList.remove('hide'); }
  function hide(s) { $(s).classList.add('hide'); }
  function openSettings() { show('#settings'); }

  function syncMute() {
    const m = AU.settings.muted;
    if (m) AU.stopSpeech();
    $('#btn-mute').textContent = m ? '🔇' : '🔊';
    $('#btn-mute').title = m ? 'Awaaz chalu karo (M)' : 'Mute karo (M)';
    $('#mute-badge').classList.toggle('hide', !m);
  }

  // ---------- HUD ----------
  const alertEls = new Map();
  U.hud = function (d) {
    $('#hud-phase').textContent = d.phase;
    const s = Math.ceil(d.left);
    $('#hud-time').textContent = d.clock ? '🕰 ' + d.clock + ' · Muhurat 10:42' : '⏱ ' + Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
    const iz = Math.max(0, Math.round(d.izzat));
    $('#izzat-fill').style.width = iz + '%';
    $('#izzat-fill').className = iz < 30 ? 'low' : iz < 60 ? 'mid' : '';
    $('#izzat-val').textContent = iz;
    $('#hud-scores').innerHTML = d.players.map(p => '<span style="color:' + p.color + '">' + esc(p.name) + ': <b>' + p.score + '</b></span>').join('');
    // alerts
    const box = $('#alerts');
    const seen = new Set();
    for (const a of d.alerts) {
      seen.add(a.id);
      let el = alertEls.get(a.id);
      if (!el) {
        el = document.createElement('div'); el.className = 'alert';
        el.innerHTML = '<div class="a-icon">' + a.icon + '</div><div class="a-body"><div class="a-title"></div><div class="a-hint"></div><div class="a-bar"><i></i></div></div>';
        el.querySelector('.a-title').textContent = a.title;
        el.querySelector('.a-hint').textContent = a.hint;
        box.appendChild(el); alertEls.set(a.id, el);
      }
      const bar = el.querySelector('.a-bar i');
      bar.style.width = Math.max(0, a.frac * 100) + '%';
      el.classList.toggle('urgent', a.frac < 0.3);
    }
    for (const [id, el] of alertEls) if (!seen.has(id)) { el.remove(); alertEls.delete(id); }
  };

  U.banner = function (title, sub) {
    const b = $('#banner');
    b.innerHTML = '<div class="b-title">' + esc(title) + '</div><div class="b-sub">' + esc(sub) + '</div>';
    b.classList.remove('hide', 'go'); void b.offsetWidth; b.classList.add('go');
    clearTimeout(U._bt); U._bt = setTimeout(() => b.classList.add('hide'), 3000);
  };

  U.lyric = function (line) {
    const el = $('#lyrics');
    if (!line) { el.classList.add('hide'); return; }
    el.textContent = '♪ ' + line + ' ♪';
    el.classList.remove('hide', 'pop'); void el.offsetWidth; el.classList.add('pop');
  };

  U.toast = function (text, kind) {
    const t = document.createElement('div');
    t.className = 'toast' + (kind ? ' ' + kind : '');
    t.textContent = text;
    $('#toasts').appendChild(t);
    setTimeout(() => t.classList.add('out'), 2600);
    setTimeout(() => t.remove(), 3200);
  };

  U.pause = function (on) {
    $('#pause').classList.toggle('hide', !on);
    if (!on) hide('#settings');
  };

  // ---------- News break ----------
  U.news = function (lines, cb) {
    newsCb = cb;
    show('#news');
    const head = $('#news-head');
    $('#news-ticker').textContent = lines.concat(lines).join('   ✦   ');
    let i = 0;
    const next = () => { head.textContent = lines[i % lines.length]; head.classList.remove('flip'); void head.offsetWidth; head.classList.add('flip'); i++; };
    next();
    newsTimers.forEach(clearTimeout); newsTimers = [];
    newsTimers.push(setInterval(next, 1800));
    newsTimers.push(setTimeout(finishNews, 8000));
    AU.sfx('dhan');
    newsTimers.push(setTimeout(() => window.addEventListener('keydown', newsKey), 1200));
  };
  function newsKey(e) { if (['Enter', 'Space', 'KeyE'].includes(e.code)) finishNews(); }
  function finishNews() {
    window.removeEventListener('keydown', newsKey);
    if (!newsCb) return;
    newsTimers.forEach(t => { clearTimeout(t); clearInterval(t); }); newsTimers = [];
    hide('#news');
    const cb = newsCb; newsCb = null; cb();
  }

  // ---------- Achievements ----------
  U.achieve = function (id) {
    const got = store('bag_ach') || {};
    if (got[id]) return;
    got[id] = Date.now(); store('bag_ach', got);
    const a = BAG.ACHIEVEMENTS[id];
    if (a) { U.toast('🏆 ' + a.t + ': ' + a.d, 'ach'); AU.sfx('bless'); }
  };
  U.bumpTotal = function (k, v) {
    const t = store('bag_totals') || {};
    t[k] = (t[k] || 0) + v; store('bag_totals', t);
    return t[k];
  };
  function renderAchievements() {
    const got = store('bag_ach') || {};
    const ids = Object.keys(BAG.ACHIEVEMENTS);
    $('#ach-list').innerHTML = ids.map(id => {
      const a = BAG.ACHIEVEMENTS[id], ok = !!got[id];
      return '<div class="ach ' + (ok ? 'ok' : '') + '" title="' + esc(a.d) + '">' + (ok ? '🏆 ' : '🔒 ') + esc(a.t) + '</div>';
    }).join('');
    $('#ach-count').textContent = ids.filter(id => got[id]).length + '/' + ids.length;
  }

  // ---------- Result card ----------
  U.result = async function (d) {
    hide('#hud'); U.lyric('');
    $('#alerts').innerHTML = ''; alertEls.clear();
    show('#result');
    const card = await drawCard(d);
    const url = card.toDataURL('image/png');
    $('#card-img').src = url;
    const me = d.players[0];
    const end = d.won ? BAG.ENDINGS.win : BAG.ENDINGS.lose;
    $('#result-head').textContent = end.head;
    $('#btn-download').onclick = () => { const a = document.createElement('a'); a.href = url; a.download = 'baraat-aa-gayi-' + me.name.replace(/\W+/g, '-').toLowerCase() + '.png'; a.click(); };
    const shareText = (d.won ? 'Maine shaadi karwa di! 🎉' : 'Shaadi cancel ho gayi 💔 (Fufaji ki wajah se)') +
      '\nMera title: "' + me.title + '" 😎\nScore: ' + d.teamScore + ' · Izzat: ' + d.izzat + '%\n\nTum bhi try karo: Baraat Aa Gayi! 🐴' + (gameUrl() ? '\n' + gameUrl() : '');
    $('#btn-wa').onclick = () => wa(shareText);
    const shareBtn = $('#btn-share');
    shareBtn.classList.toggle('hide', !navigator.share);
    shareBtn.onclick = async () => {
      try {
        const blob = await (await fetch(url)).blob();
        const file = new File([blob], 'baraat-aa-gayi.png', { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) await navigator.share({ files: [file], text: shareText });
        else await navigator.share({ text: shareText });
      } catch (e) { /* user cancelled */ }
    };
  };

  function loadImg(src) {
    return new Promise(res => { if (!src) return res(null); const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });
  }

  async function drawCard(d) {
    const R = BAG.R, F = R.FONT;
    const cw = 1080, ch = 1350;
    const cv = document.createElement('canvas'); cv.width = cw; cv.height = ch;
    const c = cv.getContext('2d');
    try { await document.fonts.ready; } catch (e) { /* ok */ }
    // background
    const g = c.createLinearGradient(0, 0, 0, ch);
    g.addColorStop(0, '#4a0e1a'); g.addColorStop(0.55, '#2b0a3d'); g.addColorStop(1, '#14061f');
    c.fillStyle = g; c.fillRect(0, 0, cw, ch);
    for (let i = 0; i < 70; i++) { c.fillStyle = 'rgba(255,214,102,' + (Math.random() * 0.15) + ')'; c.beginPath(); c.arc(Math.random() * cw, Math.random() * ch, Math.random() * 3 + 1, 0, 7); c.fill(); }
    R.fairyLights(c, [{ x1: 0, y1: 10, x2: cw, y2: 10, sag: 60, n: 34, off: 0 }], 1.3, true);
    R.garland(c, 30, 40, cw - 30, 40, 70);
    // title
    c.textAlign = 'center';
    c.font = '800 84px ' + F; c.lineWidth = 10; c.strokeStyle = '#7a1022';
    c.strokeText('BARAAT AA GAYI!', cw / 2, 190); c.fillStyle = '#ffd166'; c.fillText('BARAAT AA GAYI!', cw / 2, 190);
    const end = d.won ? BAG.ENDINGS.win : BAG.ENDINGS.lose;
    c.font = '800 54px ' + F; c.fillStyle = d.won ? '#55efc4' : '#ff7675';
    c.fillText(end.head + (d.won ? ' 🎉' : ' 💔'), cw / 2, 268);
    c.font = '600 30px ' + F; c.fillStyle = '#ffeaa7'; c.fillText(end.sub, cw / 2, 312);

    // Expectation vs Reality
    const px = 50, py = 350, pw = 475, ph = 300;
    c.font = '800 30px Impact, "Arial Black", sans-serif';
    panel(c, px, py, pw, ph);
    drawExpectation(c, px, py, pw, ph);
    const shot = await loadImg(d.memeShot ? d.memeShot.img : d.endShot);
    panel(c, cw - px - pw, py, pw, ph);
    if (shot) {
      c.save(); R.rr(c, cw - px - pw, py, pw, ph, 18); c.clip();
      const sx = (shot.width - shot.height * pw / ph) / 2;
      c.drawImage(shot, Math.max(0, sx), 0, shot.height * pw / ph, shot.height, cw - px - pw, py, pw, ph);
      c.restore();
    }
    label(c, 'EXPECTATION', px + pw / 2, py + 44);
    label(c, 'REALITY', cw - px - pw / 2, py + 44);
    if (d.memeShot && d.memeShot.caption && d.memeShot.pen < 999) {
      c.font = '600 24px ' + F; c.fillStyle = '#ffeaa7'; c.textAlign = 'center';
      R.wrap(c, '"' + d.memeShot.caption + '"', 460).slice(0, 2).forEach((l, i) => c.fillText(l, cw - px - pw / 2, py + ph + 36 + i * 28));
    }

    // Players
    let y = 760;
    for (const p of d.players) {
      c.fillStyle = 'rgba(255,255,255,0.07)'; R.rr(c, 50, y, cw - 100, d.players.length > 1 ? 180 : 230, 22); c.fill();
      c.strokeStyle = p.color; c.lineWidth = 3; R.rr(c, 50, y, cw - 100, d.players.length > 1 ? 180 : 230, 22); c.stroke();
      R.person(c, { x: 140, y: y + 150, look: p.look, mood: 'happy', seed: 1, scale: 2.2, moving: false }, 0.5);
      c.textAlign = 'left';
      c.font = '800 46px ' + F; c.fillStyle = p.color; c.fillText(p.name, 250, y + 62);
      c.font = '800 34px ' + F; c.fillStyle = '#fff';
      R.wrap(c, '"' + p.title + '"', 760).slice(0, 2).forEach((l, i) => c.fillText(l, 250, y + 108 + i * 38));
      c.font = '600 24px ' + F; c.fillStyle = '#dfe6e9';
      const s = p.stats;
      const bits = ['Score ' + p.score, s.fixes + ' kaam'];
      if (s.ghodi) bits.push(s.ghodi + ' baar Rani pakdi');
      if (s.fufaji) bits.push('Fufaji ' + s.fufaji + 'x manaye');
      if (s.pinky) bits.push('Pinky Bua ne ' + s.pinky + 'x pakda');
      if (s.dances) bits.push(s.dances + 'x naache');
      c.fillText(bits.slice(0, 4).join('  ·  '), 250, y + (d.players.length > 1 ? 160 : 200));
      y += d.players.length > 1 ? 200 : 250;
    }

    // Izzat + team score
    y = Math.max(y, 1130);
    c.textAlign = 'center';
    c.font = '700 30px ' + F; c.fillStyle = '#ffeaa7';
    c.fillText('Khandaan ki Izzat: ' + d.izzat + '%   ·   Team Score: ' + d.teamScore, cw / 2, y + 20);
    c.fillStyle = 'rgba(255,255,255,0.15)'; R.rr(c, 190, y + 40, 700, 22, 11); c.fill();
    c.fillStyle = d.izzat < 30 ? '#ff4757' : d.izzat < 60 ? '#ffa502' : '#2ed573'; R.rr(c, 190, y + 40, 700 * d.izzat / 100, 22, 11); c.fill();

    // footer
    c.font = '800 34px ' + F; c.fillStyle = '#ffd166';
    c.fillText('#BaraatAaGayi', cw / 2, ch - 70);
    const u = gameUrl();
    if (u) { c.font = '600 24px ' + F; c.fillStyle = '#b2bec3'; c.fillText('Khelo: ' + u.replace(/^https?:\/\//, ''), cw / 2, ch - 32); }
    return cv;
  }

  function panel(c, x, y, w, h) {
    c.fillStyle = 'rgba(0,0,0,0.35)'; BAG.R.rr(c, x + 6, y + 8, w, h, 18); c.fill();
    c.fillStyle = '#1d4a2c'; BAG.R.rr(c, x, y, w, h, 18); c.fill();
    c.strokeStyle = '#ffd166'; c.lineWidth = 4; BAG.R.rr(c, x, y, w, h, 18); c.stroke();
  }
  function label(c, t, x, y) {
    c.font = '900 34px Impact, "Arial Black", sans-serif'; c.textAlign = 'center';
    c.lineWidth = 7; c.strokeStyle = '#000'; c.strokeText(t, x, y); c.fillStyle = '#fff'; c.fillText(t, x, y);
  }
  function drawExpectation(c, x, y, w, h) {
    const R = BAG.R;
    c.save(); R.rr(c, x, y, w, h, 18); c.clip();
    const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#2b0a3d'); g.addColorStop(1, '#4a0e1a');
    c.fillStyle = g; c.fillRect(x, y, w, h);
    R.fairyLights(c, [{ x1: x, y1: y + 70, x2: x + w, y2: y + 70, sag: 30, n: 16, off: 1 }], 0.8, true);
    // mandap
    c.fillStyle = '#7b1e2b'; R.rr(c, x + 110, y + 190, w - 220, 60, 10); c.fill();
    c.fillStyle = '#f7c948'; [x + 120, x + w - 120].forEach(px => c.fillRect(px - 6, y + 100, 12, 150));
    R.garland(c, x + 120, y + 105, x + w - 120, y + 105, 30);
    R.person(c, { x: x + w / 2 - 34, y: y + 240, look: BAG.CAST.dulha, mood: 'happy', seed: 2, scale: 1.4 }, 0.3);
    R.person(c, { x: x + w / 2 + 34, y: y + 240, look: BAG.CAST.dulhan, mood: 'happy', seed: 4, scale: 1.4 }, 0.3);
    for (let i = 0; i < 40; i++) { c.fillStyle = ['#ff6b9d', '#feca57', '#ff9f43'][i % 3]; c.beginPath(); c.ellipse(x + Math.random() * w, y + 80 + Math.random() * 120, 4, 2.4, Math.random() * 3, 0, 7); c.fill(); }
    c.restore();
  }

  function esc(s) { return String(s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch])); }

  return U;
})();
