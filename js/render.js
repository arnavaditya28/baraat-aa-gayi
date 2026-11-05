// Drawing helpers: characters, the ghodi, the venue, lights, bubbles.
window.BAG = window.BAG || {};

BAG.R = (function () {
  const R = {};
  const FONT = '"Baloo 2", "Segoe UI", system-ui, sans-serif';
  R.FONT = FONT;

  R.rr = function (c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  };

  R.wrap = function (c, text, maxW) {
    const words = text.split(' '); const lines = []; let line = '';
    for (const w of words) {
      const test = line ? line + ' ' + w : w;
      if (c.measureText(test).width > maxW && line) { lines.push(line); line = w; } else line = test;
    }
    if (line) lines.push(line);
    return lines;
  };

  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    let r = (n >> 16) + amt, g = ((n >> 8) & 255) + amt, b = (n & 255) + amt;
    r = Math.max(0, Math.min(255, r)); g = Math.max(0, Math.min(255, g)); b = Math.max(0, Math.min(255, b));
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }
  R.shade = shade;

  // ---------- People ----------
  // p: {x,y,look:{skin,outfit,hair,hat,acc,dupatta}, mood, moving, dancing, walk, seed, scale, facing, carry, label, labelColor}
  R.person = function (c, p, time) {
    const L = p.look, s = p.scale || 1;
    const moving = p.moving, dancing = p.dancing;
    const bob = dancing ? Math.abs(Math.sin(time * 9 + p.seed)) * 6 : moving ? Math.abs(Math.sin(p.walk * 11)) * 3 : Math.sin(time * 2 + p.seed) * 1.2;
    const sway = dancing ? Math.sin(time * 9 + p.seed) * 0.18 : 0;
    c.save();
    c.translate(p.x, p.y);
    // shadow
    c.fillStyle = 'rgba(0,0,0,0.28)';
    c.beginPath(); c.ellipse(0, 0, 15 * s, 5 * s, 0, 0, Math.PI * 2); c.fill();
    c.scale(s, s);
    c.translate(0, -bob);
    c.rotate(sway);
    // legs
    const leg = moving ? Math.sin(p.walk * 11) * 4 : 0;
    c.fillStyle = '#3b2b25';
    c.fillRect(-7 + leg * 0.3, -9, 5, 9); c.fillRect(2 - leg * 0.3, -9, 5, 9);
    // body
    const bw = p.kid ? 18 : 24, bh = p.kid ? 18 : 26;
    c.fillStyle = L.outfit;
    R.rr(c, -bw / 2, -9 - bh, bw, bh, 7); c.fill();
    c.fillStyle = shade(L.outfit, -30);
    c.fillRect(-bw / 2, -13, bw, 4);
    // gold trim
    c.strokeStyle = '#f7c948'; c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(0, -9 - bh + 3); c.lineTo(0, -12); c.stroke();
    if (L.dupatta) {
      c.strokeStyle = L.dupatta; c.lineWidth = 5;
      c.beginPath(); c.moveTo(-bw / 2 + 2, -9 - bh + 3); c.lineTo(bw / 2 - 1, -13); c.stroke();
    }
    // arms
    const armY = -9 - bh + 6;
    c.fillStyle = L.skin;
    if (dancing || p.armsUp) {
      const w = Math.sin(time * 12 + p.seed) * 5;
      c.beginPath(); c.arc(-bw / 2 - 5, armY - 14 + w, 4, 0, 7); c.fill();
      c.beginPath(); c.arc(bw / 2 + 5, armY - 14 - w, 4, 0, 7); c.fill();
      c.strokeStyle = L.outfit; c.lineWidth = 5;
      c.beginPath(); c.moveTo(-bw / 2 + 1, armY); c.lineTo(-bw / 2 - 5, armY - 12 + w); c.stroke();
      c.beginPath(); c.moveTo(bw / 2 - 1, armY); c.lineTo(bw / 2 + 5, armY - 12 - w); c.stroke();
    } else {
      const sw = moving ? Math.sin(p.walk * 11) * 3 : 0;
      c.beginPath(); c.arc(-bw / 2 - 2, armY + 12 + sw, 4, 0, 7); c.fill();
      c.beginPath(); c.arc(bw / 2 + 2, armY + 12 - sw, 4, 0, 7); c.fill();
    }
    // carried item
    if (p.carry === 'plate') {
      c.fillStyle = '#ecf0f1'; c.beginPath(); c.ellipse(bw / 2 + 6, armY + 4, 11, 5, 0, 0, 7); c.fill();
      c.fillStyle = '#e67e22'; c.beginPath(); c.arc(bw / 2 + 3, armY + 2, 3, 0, 7); c.fill();
      c.fillStyle = '#f1c40f'; c.beginPath(); c.arc(bw / 2 + 9, armY + 3, 3, 0, 7); c.fill();
      c.fillStyle = '#fff'; c.fillRect(bw / 2 + 4, armY - 1, 6, 4);
    } else if (p.carry === 'chashma') {
      c.strokeStyle = '#2d3436'; c.lineWidth = 2;
      c.beginPath(); c.arc(bw / 2 + 2, armY + 6, 4, 0, 7); c.arc(bw / 2 + 11, armY + 6, 4, 0, 7); c.stroke();
    }
    // head
    const hr = p.kid ? 14 : 17;
    const hy = -9 - bh - hr + 4;
    R.head(c, 0, hy, hr, L, p.mood || 'neutral', time, p);
    c.restore();
    // label
    if (p.label) {
      c.font = '600 12px ' + FONT; c.textAlign = 'center';
      const tw = c.measureText(p.label).width;
      c.fillStyle = 'rgba(20,10,30,0.55)';
      R.rr(c, p.x - tw / 2 - 5, p.y + 6, tw + 10, 16, 8); c.fill();
      c.fillStyle = p.labelColor || '#ffeaa7';
      c.fillText(p.label, p.x, p.y + 18);
    }
  };

  R.head = function (c, x, y, r, L, mood, time, p) {
    // hair back layer
    if (L.hair === 'long' || L.hair === 'bun') {
      c.fillStyle = '#1e1414';
      c.beginPath(); c.ellipse(x, y + 4, r + 3, r + 6, 0, 0, 7); c.fill();
    }
    if (L.hair === 'grey') { c.fillStyle = '#dfe6e9'; c.beginPath(); c.ellipse(x, y + 2, r + 2, r + 3, 0, 0, 7); c.fill(); }
    if (L.hair === 'veil') { c.fillStyle = L.dupatta || '#d63031'; c.beginPath(); c.ellipse(x, y + 3, r + 6, r + 8, 0, 0, 7); c.fill(); c.strokeStyle = '#f7c948'; c.lineWidth = 2; c.stroke(); }
    // face
    c.fillStyle = L.skin;
    c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
    // ears
    c.beginPath(); c.arc(x - r + 1, y + 2, 4, 0, 7); c.arc(x + r - 1, y + 2, 4, 0, 7); c.fill();
    // hair front / hats
    const hair = L.hair;
    if (hair === 'turban' || hair === 'sehra') {
      c.fillStyle = L.hat || '#c0392b';
      c.beginPath(); c.ellipse(x, y - r * 0.55, r + 3, r * 0.7, 0, Math.PI, 0); c.fill();
      c.beginPath(); c.ellipse(x, y - r * 0.5, r + 3, r * 0.35, 0, 0, Math.PI); c.fill();
      c.strokeStyle = shade(L.hat || '#c0392b', -40); c.lineWidth = 1.5;
      for (let i = -1; i <= 1; i++) { c.beginPath(); c.moveTo(x - r, y - r * 0.5 + i * 4); c.quadraticCurveTo(x, y - r * 1.1 + i * 4, x + r, y - r * 0.6 + i * 4); c.stroke(); }
      c.fillStyle = '#f7c948'; c.beginPath(); c.arc(x + 4, y - r * 0.85, 3, 0, 7); c.fill();
      if (hair === 'sehra') {
        c.fillStyle = '#fff8e1';
        for (let i = -3; i <= 3; i++) for (let j = 0; j < 4; j++) { c.beginPath(); c.arc(x + i * 4.2, y - r * 0.2 + j * 6, 1.8, 0, 7); c.fill(); }
      }
    } else if (hair === 'bun' || hair === 'long') {
      c.fillStyle = '#1e1414';
      c.beginPath(); c.ellipse(x, y - r * 0.45, r + 1, r * 0.65, 0, Math.PI, 0); c.fill();
      if (hair === 'bun') { c.beginPath(); c.arc(x, y - r - 4, 7, 0, 7); c.fill(); c.fillStyle = '#ff7675'; c.beginPath(); c.arc(x + 5, y - r - 6, 2.5, 0, 7); c.fill(); }
    } else if (hair === 'short') {
      c.fillStyle = '#1e1414';
      c.beginPath(); c.ellipse(x, y - r * 0.5, r + 1, r * 0.6, 0, Math.PI, 0); c.fill();
    } else if (hair === 'bald') {
      c.fillStyle = '#7f8c8d';
      c.beginPath(); c.ellipse(x - r + 2, y - 2, 4, 6, 0, 0, 7); c.ellipse(x + r - 2, y - 2, 4, 6, 0, 0, 7); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.35)'; c.beginPath(); c.ellipse(x - 4, y - r * 0.6, 5, 3, -0.4, 0, 7); c.fill();
      if (L.outfit === '#f39c12') { c.strokeStyle = '#e74c3c'; c.lineWidth = 2; c.beginPath(); c.moveTo(x - 4, y - r * 0.5); c.lineTo(x + 4, y - r * 0.5); c.stroke(); }
    } else if (hair === 'grey') {
      c.fillStyle = '#dfe6e9';
      c.beginPath(); c.ellipse(x, y - r * 0.5, r + 1, r * 0.6, 0, Math.PI, 0); c.fill();
      c.beginPath(); c.arc(x, y - r - 3, 6, 0, 7); c.fill();
    } else if (hair === 'kid') {
      c.fillStyle = '#1e1414';
      c.beginPath(); c.ellipse(x, y - r * 0.5, r + 1, r * 0.6, 0, Math.PI, 0); c.fill();
      c.beginPath(); c.moveTo(x - 2, y - r); c.lineTo(x + 3, y - r - 7); c.lineTo(x + 5, y - r + 1); c.fill();
    } else if (hair === 'chef') {
      c.fillStyle = '#ffffff';
      c.fillRect(x - r + 2, y - r - 2, (r - 2) * 2, 8);
      c.beginPath(); c.arc(x - 6, y - r - 8, 7, 0, 7); c.arc(x + 6, y - r - 8, 7, 0, 7); c.arc(x, y - r - 12, 8, 0, 7); c.fill();
    } else if (hair === 'cap' || hair === 'bandcap') {
      c.fillStyle = hair === 'bandcap' ? '#c0392b' : '#2d3436';
      c.beginPath(); c.ellipse(x, y - r * 0.55, r, r * 0.55, 0, Math.PI, 0); c.fill();
      c.fillRect(x - 2, y - r * 0.6, r + 8, 4);
      if (hair === 'bandcap') { c.fillStyle = '#f7c948'; c.fillRect(x - r, y - r * 0.6, r * 2, 3); }
    } else if (hair === 'veil') {
      c.fillStyle = L.dupatta || '#d63031';
      c.beginPath(); c.ellipse(x, y - r * 0.4, r + 4, r * 0.75, 0, Math.PI, 0); c.fill();
      c.fillStyle = '#f7c948'; c.beginPath(); c.arc(x, y - r * 0.55, 2.5, 0, 7); c.fill();
    }
    // face features
    const blink = Math.sin(time * 1.3 + (p ? p.seed : 0) * 7) > 0.985;
    c.fillStyle = '#1e1414'; c.strokeStyle = '#1e1414'; c.lineWidth = 2;
    const ex = r * 0.38, ey = y + 1;
    if (mood === 'happy') {
      c.beginPath(); c.arc(x - ex, ey + 1, 3, Math.PI, 0); c.stroke();
      c.beginPath(); c.arc(x + ex, ey + 1, 3, Math.PI, 0); c.stroke();
    } else if (blink) {
      c.beginPath(); c.moveTo(x - ex - 3, ey); c.lineTo(x - ex + 3, ey); c.moveTo(x + ex - 3, ey); c.lineTo(x + ex + 3, ey); c.stroke();
    } else {
      c.beginPath(); c.arc(x - ex, ey, 2.6, 0, 7); c.arc(x + ex, ey, 2.6, 0, 7); c.fill();
    }
    if (mood === 'angry') {
      c.beginPath(); c.moveTo(x - ex - 5, ey - 8); c.lineTo(x - ex + 3, ey - 5); c.moveTo(x + ex + 5, ey - 8); c.lineTo(x + ex - 3, ey - 5); c.stroke();
    } else if (mood === 'sad') {
      c.beginPath(); c.moveTo(x - ex - 4, ey - 5); c.lineTo(x - ex + 3, ey - 8); c.moveTo(x + ex + 4, ey - 5); c.lineTo(x + ex - 3, ey - 8); c.stroke();
    }
    // glasses / shades
    const acc = L.acc || [];
    if (acc.includes('glasses') && !(p && p.noGlasses)) {
      c.strokeStyle = '#2d3436'; c.lineWidth = 1.6;
      c.beginPath(); c.arc(x - ex, ey, 5, 0, 7); c.stroke(); c.beginPath(); c.arc(x + ex, ey, 5, 0, 7); c.stroke();
      c.beginPath(); c.moveTo(x - ex + 5, ey); c.lineTo(x + ex - 5, ey); c.stroke();
    }
    if (acc.includes('shades')) {
      c.fillStyle = '#111'; R.rr(c, x - ex - 6, ey - 4, 11, 7, 3); c.fill(); R.rr(c, x + ex - 5, ey - 4, 11, 7, 3); c.fill();
      c.fillRect(x - 2, ey - 2, 4, 2);
    }
    // cheeks
    c.fillStyle = 'rgba(255,120,120,0.35)';
    c.beginPath(); c.arc(x - r * 0.55, y + 7, 3.5, 0, 7); c.arc(x + r * 0.55, y + 7, 3.5, 0, 7); c.fill();
    // mouth
    c.strokeStyle = '#5a1e1e'; c.lineWidth = 2;
    const my = y + r * 0.5;
    if (mood === 'happy') { c.fillStyle = '#7a2323'; c.beginPath(); c.arc(x, my - 2, 5, 0, Math.PI); c.fill(); }
    else if (mood === 'angry' || mood === 'sad') { c.beginPath(); c.arc(x, my + 4, 4.5, Math.PI * 1.15, Math.PI * 1.85); c.stroke(); }
    else if (mood === 'shock') { c.fillStyle = '#5a1e1e'; c.beginPath(); c.ellipse(x, my, 3, 4, 0, 0, 7); c.fill(); }
    else if (mood === 'talk') { const o = Math.abs(Math.sin(time * 18)) * 3 + 1; c.fillStyle = '#5a1e1e'; c.beginPath(); c.ellipse(x, my, 3.5, o, 0, 0, 7); c.fill(); }
    else { c.beginPath(); c.arc(x, my - 3, 4, 0.2 * Math.PI, 0.8 * Math.PI); c.stroke(); }
    if (acc.includes('mustache')) {
      c.fillStyle = '#2d1f1a';
      c.beginPath(); c.ellipse(x - 4, my - 4, 5, 2.4, 0.25, 0, 7); c.ellipse(x + 4, my - 4, 5, 2.4, -0.25, 0, 7); c.fill();
    }
    if (acc.includes('bindi')) { c.fillStyle = '#d63031'; c.beginPath(); c.arc(x, y - r * 0.3, 2, 0, 7); c.fill(); }
    if (acc.includes('headphones')) {
      c.strokeStyle = '#e84393'; c.lineWidth = 3;
      c.beginPath(); c.arc(x, y - 2, r + 2, Math.PI * 1.1, Math.PI * 1.9); c.stroke();
      c.fillStyle = '#e84393'; R.rr(c, x - r - 4, y - 4, 6, 11, 3); c.fill(); R.rr(c, x + r - 2, y - 4, 6, 11, 3); c.fill();
    }
    if (acc.includes('phone')) {
      c.fillStyle = '#2d3436'; R.rr(c, x + r - 2, y - 6, 7, 12, 2); c.fill();
      c.fillStyle = '#74b9ff'; c.fillRect(x + r - 1, y - 4, 5, 8);
    }
    if (acc.includes('camera')) {
      c.fillStyle = '#2d3436'; R.rr(c, x - 9, y + r - 2, 18, 11, 2); c.fill();
      c.fillStyle = '#636e72'; c.beginPath(); c.arc(x, y + r + 3, 4, 0, 7); c.fill();
    }
  };

  // ---------- Ghodi ----------
  R.ghodi = function (c, g, time) {
    c.save();
    c.translate(g.x, g.y);
    c.fillStyle = 'rgba(0,0,0,0.28)'; c.beginPath(); c.ellipse(0, 0, 32, 8, 0, 0, 7); c.fill();
    if (g.facing < 0) c.scale(-1, 1);
    const run = g.moving ? (g.running ? 22 : 12) : 0;
    const bob = g.moving ? Math.abs(Math.sin(time * run)) * 3 : 0;
    c.translate(0, -bob);
    // legs
    c.strokeStyle = '#d9cbb5'; c.lineWidth = 5; c.lineCap = 'round';
    const a = g.moving ? Math.sin(time * run) * 7 : 0;
    [[-18, a], [-10, -a], [12, -a], [20, a]].forEach(([lx, sw]) => { c.beginPath(); c.moveTo(lx, -20); c.lineTo(lx + sw, -2); c.stroke(); });
    // tail
    c.strokeStyle = '#4a3428'; c.lineWidth = 5;
    c.beginPath(); c.moveTo(-27, -30); c.quadraticCurveTo(-40, -26 + Math.sin(time * 6) * 4, -36, -10); c.stroke();
    // body
    c.fillStyle = '#f4efe6';
    c.beginPath(); c.ellipse(0, -30, 30, 14, 0, 0, 7); c.fill();
    // saddle cloth
    c.fillStyle = '#c0392b'; R.rr(c, -12, -44, 26, 22, 4); c.fill();
    c.strokeStyle = '#f7c948'; c.lineWidth = 2; R.rr(c, -12, -44, 26, 22, 4); c.stroke();
    c.fillStyle = '#f7c948'; for (let i = 0; i < 5; i++) { c.beginPath(); c.arc(-9 + i * 5, -22, 2, 0, 7); c.fill(); }
    // neck + head
    c.fillStyle = '#f4efe6';
    c.beginPath(); c.moveTo(18, -38); c.lineTo(34, -62); c.lineTo(44, -56); c.lineTo(30, -28); c.closePath(); c.fill();
    c.beginPath(); c.ellipse(44, -60, 12, 7, 0.5, 0, 7); c.fill();
    c.fillStyle = '#1e1414'; c.beginPath(); c.arc(42, -64, 2, 0, 7); c.fill();
    // mane
    c.strokeStyle = '#4a3428'; c.lineWidth = 4;
    c.beginPath(); c.moveTo(20, -42); c.lineTo(34, -66); c.stroke();
    // plume
    c.fillStyle = '#e84393'; c.beginPath(); c.ellipse(36, -76, 4, 9, -0.3, 0, 7); c.fill();
    c.fillStyle = '#f7c948'; c.beginPath(); c.arc(38, -68, 3, 0, 7); c.fill();
    c.restore();
    c.font = '600 12px ' + FONT; c.textAlign = 'center';
    c.fillStyle = 'rgba(20,10,30,0.55)'; R.rr(c, g.x - 38, g.y + 6, 76, 16, 8); c.fill();
    c.fillStyle = '#ffeaa7'; c.fillText('Rani (Ghodi)', g.x, g.y + 18);
  };

  // ---------- Speech bubble ----------
  R.bubble = function (c, x, y, text, age, color) {
    const pop = Math.min(1, age / 0.18);
    const sc = pop < 1 ? 0.6 + 0.5 * Math.sin(pop * Math.PI * 0.75) : 1;
    c.save();
    c.font = '600 14px ' + FONT;
    const lines = R.wrap(c, text, 200);
    const w = Math.max(...lines.map(l => c.measureText(l).width)) + 20;
    const h = lines.length * 18 + 12;
    let bx = Math.max(8, Math.min(1272 - w, x - w / 2));
    const by = Math.max(70, y - h - 12);
    c.translate(x, by + h);
    c.scale(sc, sc);
    c.translate(-x, -(by + h));
    c.fillStyle = 'rgba(0,0,0,0.25)'; R.rr(c, bx + 3, by + 3, w, h, 12); c.fill();
    c.fillStyle = color || '#fffaf0'; R.rr(c, bx, by, w, h, 12); c.fill();
    c.beginPath(); c.moveTo(x - 7, by + h - 1); c.lineTo(x + 7, by + h - 1); c.lineTo(x, by + h + 10); c.closePath(); c.fill();
    c.fillStyle = '#2d1b2e'; c.textAlign = 'left';
    lines.forEach((l, i) => c.fillText(l, bx + 10, by + 20 + i * 18));
    c.restore();
  };

  // ---------- Fairy lights ----------
  const BULB = ['#ffd166', '#ff6b9d', '#4ecdc4', '#ff9f43', '#feca57', '#a29bfe'];
  R.fairyLights = function (c, strings, time, on) {
    for (const s of strings) {
      c.strokeStyle = 'rgba(40,30,20,0.8)'; c.lineWidth = 1.5;
      c.beginPath(); c.moveTo(s.x1, s.y1); c.quadraticCurveTo((s.x1 + s.x2) / 2, Math.max(s.y1, s.y2) + s.sag, s.x2, s.y2); c.stroke();
      const n = s.n;
      for (let i = 1; i < n; i++) {
        const t = i / n;
        const mx = (s.x1 + s.x2) / 2, my = Math.max(s.y1, s.y2) + s.sag;
        const x = (1 - t) * (1 - t) * s.x1 + 2 * (1 - t) * t * mx + t * t * s.x2;
        const y = (1 - t) * (1 - t) * s.y1 + 2 * (1 - t) * t * my + t * t * s.y2 + 3;
        const col = BULB[(i + s.off) % BULB.length];
        const tw = on ? 0.55 + 0.45 * Math.sin(time * 3 + i * 1.7 + s.off) : 0.1;
        if (on) {
          c.fillStyle = col; c.globalAlpha = tw * 0.35;
          c.beginPath(); c.arc(x, y, 8, 0, 7); c.fill();
        }
        c.globalAlpha = on ? 0.5 + tw * 0.5 : 0.35;
        c.fillStyle = on ? col : '#555';
        c.beginPath(); c.arc(x, y, 3, 0, 7); c.fill();
        c.globalAlpha = 1;
      }
    }
  };

  // ---------- Marigold garland ----------
  R.garland = function (c, x1, y1, x2, y2, sag) {
    const n = Math.max(6, Math.floor(Math.hypot(x2 - x1, y2 - y1) / 9));
    const mx = (x1 + x2) / 2, my = Math.max(y1, y2) + sag;
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const x = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * mx + t * t * x2;
      const y = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * my + t * t * y2;
      c.fillStyle = i % 3 === 0 ? '#ff7f11' : '#ffb703';
      c.beginPath(); c.arc(x, y, 5, 0, 7); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.25)'; c.beginPath(); c.arc(x - 1.5, y - 1.5, 2, 0, 7); c.fill();
    }
  };

  return R;
})();
