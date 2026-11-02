/* 321 系列 App · 一起共讀（全系列共用同一份程式；各 App 的差異放在頁面裡的 window.CR321_CFG）
   帶領者開房間 → 6 碼共讀碼／邀請連結／QR；加入者打開後，畫面跟著帶領者換到同一頁、捲到同一個位置。
   傳輸：同目錄 peerjs.min.js（相容 PeerJS 介面的 Cloudflare 中繼站連線層）。
   只同步「在哪個畫面」——個人的筆記、紀錄、設定、美圖工作室、小智對話都不同步、也不傳出去。
   ES5。 */
(function () {
  'use strict';
  if (window.CR321) return;
  var CFG = window.CR321_CFG || {};
  var PFX = CFG.pfx || 'cr321-';
  var SELF = (function () { try { return document.currentScript && document.currentScript.src || ''; } catch (e) { return ''; } })();
  var VQ = (SELF.match(/[?&]v=([^&]+)/) || [0, '1'])[1];
  var PEER_JS = ['peerjs.min.js?v=' + VQ];
  var QR_JS = ['https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js', 'https://unpkg.com/qrcode-generator@1.4.4/qrcode.js', 'https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js'];
  var CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  var COOL = 8000;

  /* ---------- 字串 ---------- */
  var TX = {
    zh: { title: '一起共讀', desc: '開一個共讀房間，把共讀碼或連結傳給弟兄姊妹。他們打開後，手機會跟著你換到同一頁、捲到同一個位置；你點一句或朗讀時，大家的畫面也會一起亮起來。（只同步「在哪個畫面」，個人的筆記與紀錄不會傳出去。）', host: '開共讀房間（我來帶領）', join: '加入', codePH: '輸入 6 碼共讀碼', orJoin: '或加入別人的共讀', asScreen: '作為投影螢幕（大字、無按鈕）', code: '共讀碼', people: '已有 {0} 人加入', waiting: '等待弟兄姊妹加入…', invite: '傳送邀請', copyLink: '複製連結', copyScr: '複製投影連結', copied: '已複製', end: '結束共讀', leave: '離開共讀', inviteMsg: '📡 一起來共讀《{0}》！\n點連結加入：{1}\n或打開 App 按上方「📡」輸入共讀碼：{2}', following: '跟著帶領者共讀', paused: '你自己看別處・點這裡回到帶領者', connecting: '連線中…', hostChip: '共讀 {0}・{1} 人', ended: '共讀已結束', joined: '已加入共讀，畫面會跟著帶領者', loadErr: '共讀功能載入失敗，請確認網路後再試', badCode: '請輸入 6 碼共讀碼', notFound: '找不到這個共讀房間，請確認共讀碼，或請帶領者重新開房間', back2: '回到帶領者', tip: '提示：帶領者請保持 App 開著、螢幕不要關，大家才會一直同步。', qrTip: '用手機相機掃描加入', joinedOne: '有一位弟兄姊妹加入共讀', hostLeft: '帶領者暫時離線，正在重新連線…', hostPriv: '帶領者在個人畫面（此頁不同步）', mePriv: '此頁不同步（個人畫面）', scrT: '🖥 投影螢幕', scrD: '在連接投影機或電視的電腦／平板瀏覽器打開「投影連結」，畫面會變成大字、沒有按鈕、自動跟著帶領者。', followOnly: '你正在跟著共讀', btn: '共讀', close: '關閉' },
    zs: { title: '一起共读', desc: '开一个共读房间，把共读码或链接传给弟兄姊妹。他们打开后，手机会跟着你换到同一页、滚到同一个位置；你点一句或朗读时，大家的画面也会一起亮起来。（只同步“在哪个画面”，个人的笔记与记录不会传出去。）', host: '开共读房间（我来带领）', join: '加入', codePH: '输入 6 码共读码', orJoin: '或加入别人的共读', asScreen: '作为投影荧幕（大字、无按钮）', code: '共读码', people: '已有 {0} 人加入', waiting: '等待弟兄姊妹加入…', invite: '发送邀请', copyLink: '复制链接', copyScr: '复制投影链接', copied: '已复制', end: '结束共读', leave: '离开共读', inviteMsg: '📡 一起来共读《{0}》！\n点链接加入：{1}\n或打开 App 按上方“📡”输入共读码：{2}', following: '跟着带领者共读', paused: '你自己看别处・点这里回到带领者', connecting: '连线中…', hostChip: '共读 {0}・{1} 人', ended: '共读已结束', joined: '已加入共读，画面会跟着带领者', loadErr: '共读功能载入失败，请确认网络后再试', badCode: '请输入 6 码共读码', notFound: '找不到这个共读房间，请确认共读码，或请带领者重新开房间', back2: '回到带领者', tip: '提示：带领者请保持 App 开着、屏幕不要关，大家才会一直同步。', qrTip: '用手机相机扫描加入', joinedOne: '有一位弟兄姊妹加入共读', hostLeft: '带领者暂时离线，正在重新连线…', hostPriv: '带领者在个人画面（此页不同步）', mePriv: '此页不同步（个人画面）', scrT: '🖥 投影荧幕', scrD: '在连接投影机或电视的电脑／平板浏览器打开“投影链接”，画面会变成大字、没有按钮、自动跟着带领者。', followOnly: '你正在跟着共读', btn: '共读', close: '关闭' },
    en: { title: 'Read together', desc: 'Open a reading room and send the room code or link to others. When they open it, their phones follow you to the same page and scroll position; when you tap or read a sentence aloud, it lights up on everyone’s screen. (Only “which screen you are on” is shared — personal notes and records are never sent.)', host: 'Open a room (I’ll lead)', join: 'Join', codePH: 'Enter the 6-character code', orJoin: 'Or join someone else’s room', asScreen: 'As a projector screen (big text, no buttons)', code: 'Room code', people: '{0} joined', waiting: 'Waiting for others to join…', invite: 'Send invite', copyLink: 'Copy link', copyScr: 'Copy projector link', copied: 'Copied', end: 'End session', leave: 'Leave', inviteMsg: '📡 Come read “{0}” together!\nTap to join: {1}\nOr open the app, tap “📡” at the top and enter code {2}', following: 'Following the leader', paused: 'You’re browsing · tap to return to the leader', connecting: 'Connecting…', hostChip: 'Room {0} · {1}', ended: 'Reading session ended', joined: 'Joined — your screen will follow the leader', loadErr: 'Could not load reading-together. Check your connection and try again.', badCode: 'Please enter the 6-character room code', notFound: 'Room not found. Check the code, or ask the leader to open a new room.', back2: 'Back to leader', tip: 'Tip: the leader should keep the app open with the screen on so everyone stays in sync.', qrTip: 'Scan with a phone camera to join', joinedOne: 'Someone joined the room', hostLeft: 'The leader is offline for a moment — reconnecting…', hostPriv: 'The leader is on a personal screen (not shared)', mePriv: 'This screen is personal (not shared)', scrT: '🖥 Projector screen', scrD: 'Open the “projector link” in the browser of the computer or tablet connected to the projector or TV: it becomes a big-text screen with no buttons that follows the leader.', followOnly: 'You are following', btn: 'Together', close: 'Close' }
  };
  function lang() {
    try { if (typeof CFG.lang === 'function') { var c = CFG.lang(); if (c) return c; } } catch (e) { }
    try { if (typeof window.L === 'function') { var l = window.L(); if (l === 'zs' || l === 'sc') return 'zs'; if (l === 'en') return 'en'; if (l === 'zh' || l === 'tc') return 'zh'; } } catch (e) { }
    try { if (window.I18N && typeof window.I18N.lang === 'string') { var g = window.I18N.lang; if (g === 'en') return 'en'; if (g === 'sc') return 'zs'; if (g === 'tc') return 'zh'; } } catch (e) { }
    var h = (document.documentElement.getAttribute('lang') || '').toLowerCase();
    if (h.indexOf('en') === 0) return 'en';
    if (h.indexOf('hans') >= 0 || h === 'zh-cn') return 'zs';
    return 'zh';
  }
  function X(k) { var l = lang(), s = (TX[l] || TX.zh)[k]; if (s == null) s = TX.zh[k]; if (s == null) s = k; for (var i = 1; i < arguments.length; i++) s = s.split('{' + (i - 1) + '}').join(arguments[i]); return s; }
  function appName() { var n = CFG.names && CFG.names[lang()]; return n || (document.title || '').replace(/\s+$/, '') || '321'; }
  function E(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function ss(k, v) { try { k = 'cr321:' + PFX + k; if (v === undefined) return JSON.parse(sessionStorage.getItem(k) || 'null'); if (v === null) sessionStorage.removeItem(k); else sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }
  function now() { return new Date().getTime(); }
  function qa(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function toast(m) {
    var t = document.getElementById('crtoast'); if (!t) { t = document.createElement('div'); t.id = 'crtoast'; document.body.appendChild(t); }
    t.textContent = m; t.className = 'on'; clearTimeout(toast.h); toast.h = setTimeout(function () { t.className = ''; }, 2400);
  }
  function copyText(s, msg) {
    function ok() { toast(msg || X('copied')); }
    function fb() { try { var a = document.createElement('textarea'); a.value = s; a.style.position = 'fixed'; a.style.opacity = '0'; document.body.appendChild(a); a.select(); document.execCommand('copy'); document.body.removeChild(a); ok(); } catch (e) { try { window.prompt('', s); } catch (x) { } } }
    try { navigator.clipboard.writeText(s).then(ok, fb); } catch (e) { fb(); }
  }

  /* ---------- 轉接層（adapter）：各 App 路由差異都收在這裡 ---------- */
  function stopSpeech() {
    var f = ['stopAll', 'stopSpeak', 'ttsStop'];
    for (var i = 0; i < f.length; i++) { try { if (typeof window[f[i]] === 'function') { window[f[i]](); return; } } catch (e) { } }
  }
  function overlayOpen() {
    try {
      var x = document.getElementById('xz'); if (x && /(^|\s)on(\s|$)/.test(x.className)) return true;
      var b = document.getElementById('gxuBox'); if (b && b.style.display && b.style.display !== 'none') return true;
      var p = document.getElementById('gxuPanel'); if (p && p.style.display && p.style.display !== 'none') return true;
      if (document.querySelector('.gxsmask')) return true;
      if (typeof CFG.overlay === 'function' && CFG.overlay()) return true;
    } catch (e) { }
    return false;
  }
  /* R 型：全域 R = {tab, page, stack, sub}（牧養／宣教／禱告／講道） */
  var RA = {
    nav: function () {
      var R = window.R; if (!R) return null; var P = CFG.R || {}, pg = R.page, tab = R.tab, o = {};
      if (P.needOb && window.S && !window.S.ob) return null;
      var root = !pg || pg.t === tab;
      if (P.tabs && P.tabs.indexOf(tab) < 0) { if (root) return null; tab = P.tabs[0]; }
      o.tab = tab;
      if (!root) {
        var ps = P.pages && P.pages[pg.t]; if (!ps) return null;
        o.t = pg.t; for (var i = 0; i < ps.length; i++) o[ps[i]] = pg[ps[i]];
      } else if (P.subs && P.subs[tab]) {
        var s = (R.sub && R.sub[tab]) || (P.defaults && P.defaults[tab]) || null; if (s != null && P.subs[tab].indexOf(s) < 0) return null;
        if (s != null) o.sub = s;
        if (P.vcat && tab === P.vcat[0] && s === P.vcat[1]) o.vc = (R.sub && R.sub.vcat) || '';
      }
      return o;
    },
    go: function (o) {
      var R = window.R; stopSpeech();
      try { if (typeof window.closeHSheet === 'function') window.closeHSheet(); } catch (e) { }
      var P = CFG.R || {}, tabRoot = typeof window.goTab === 'function';
      R.tab = o.tab; R.stack = []; R.sub = R.sub || {};
      if (o.t) { var pg = { t: o.t }, ps = P.pages[o.t] || []; for (var i = 0; i < ps.length; i++) pg[ps[i]] = o[ps[i]]; R.page = pg; }
      else {
        R.page = tabRoot ? { t: o.tab } : null;
        if (o.sub != null && P.subs && P.subs[o.tab]) R.sub[o.tab] = o.sub;
        if (o.vc != null) R.sub.vcat = o.vc;
      }
      window.render(); window.scrollTo(0, 0);
    }
  };
  /* hash 型：location.hash 就是畫面（學神院助教／學員／負責人／小家長／235） */
  var HA = {
    nav: function () {
      var h = (location.hash || '#home').replace(/^#\/?/, '') || 'home';
      var ok = CFG.hashOk || /^(home|les\/\d+(\/(script|scen|steps))?)$/;
      return ok.test(h) ? { h: h } : null;
    },
    go: function (o) { stopSpeech(); if ((location.hash || '#home').replace(/^#\/?/, '') === o.h) return; location.hash = '#' + o.h; }
  };
  var AD = (function () {
    var base = CFG.mode === 'hash' ? HA : (CFG.mode === 'R' || (!CFG.mode && window.R && typeof window.R === 'object' && 'stack' in window.R)) ? RA : (CFG.nav ? {} : HA);
    return {
      nav: CFG.nav || base.nav, go: CFG.go || base.go,
      root: CFG.root || function () { return document.getElementById('app') || document.body; },
      scroller: CFG.scroller || function () { return window; },
      top: CFG.top || null
    };
  })();
  function curNav() {
    try { if (overlayOpen()) return undefined; var n = AD.nav(); return n || null; } catch (e) { return null; }
  }
  function keyOf(n) { return n ? JSON.stringify(n) : ''; }

  /* ---------- 載入 ---------- */
  var loaded = {};
  function loadJs(urls, test, cb) {
    if (test()) { cb(true); return; } var i = 0;
    (function nx() {
      if (i >= urls.length) { cb(false); return; } var u = urls[i++];
      if (loaded[u]) { setTimeout(function () { cb(test()); }, 0); return; }
      var s = document.createElement('script'); s.src = u; s.async = true;
      s.onload = function () { loaded[u] = 1; if (test()) cb(true); else nx(); }; s.onerror = function () { nx(); };
      document.head.appendChild(s);
    })();
  }

  /* ---------- 狀態 ---------- */
  var C = { role: '', code: '', peer: null, conns: [], host: null, last: null, retry: 0, rt: null, manualAt: 0, status: '', want: null, scr: false, hostPriv: false, lastKey: '#', settle: 0, ptEl: null, lastF: -1, lastRx: 0, misses: 0, first: false };
  function newCode() { var c = ''; for (var i = 0; i < 6; i++) c += CHARS.charAt(Math.floor(Math.random() * CHARS.length)); return c; }
  function normCode(s) { return String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '').replace(/O/g, '0').replace(/I|L/g, '1'); }
  function validCode(c) { return /^[A-Z0-9]{6}$/.test(c); }
  function baseUrl() { return location.origin + location.pathname; }
  function joinUrl(code, scr) { return baseUrl() + '?join=' + code + (scr ? '&screen=1' : ''); }
  function live() { var o = []; for (var i = 0; i < C.conns.length; i++) if (C.conns[i].open) o.push(C.conns[i]); return o; }
  function sc() { var s = AD.scroller(); return s || window; }
  function scMetrics() {
    var s = sc();
    if (s === window || s === document.documentElement || s === document.body) return { y: window.pageYOffset || document.documentElement.scrollTop || 0, max: Math.max(0, document.documentElement.scrollHeight - (window.innerHeight || 600)), win: true };
    return { y: s.scrollTop, max: Math.max(0, s.scrollHeight - s.clientHeight), win: false, el: s };
  }
  function curF() { var m = scMetrics(); return m.max > 0 ? Math.round(m.y / m.max * 1000) / 1000 : 0; }
  function setF(f) {
    var m = scMetrics(), y = Math.round(m.max * Math.max(0, Math.min(1, f || 0)));
    if (Math.abs(m.y - y) < 8) return;
    if (m.win) window.scrollTo(0, y); else m.el.scrollTop = y;
  }

  /* ---------- 句子定位（不同語言也對得上） ---------- */
  function sentsIn(el) { return qa('.sent', el); }
  function sentId(el) {
    var k = el.getAttribute && el.getAttribute('data-k');
    var b = el.closest ? el.closest('[data-b]') : null;
    if (b && b.getAttribute('data-l') != null) {
      var ss2 = sentsIn(b), i = ss2.indexOf(el); return { l: b.getAttribute('data-l'), b: b.getAttribute('data-b'), s: Math.max(0, i), n: ss2.length };
    }
    if (k) return { dk: k };
    var all = sentsIn(AD.root()), j = all.indexOf(el); return { i: Math.max(0, j), n: all.length };
  }
  function findSent(m) {
    var all, i;
    if (m.l != null) {
      var bs = qa('[data-b]');
      for (i = 0; i < bs.length; i++) if (bs[i].getAttribute('data-l') === m.l && bs[i].getAttribute('data-b') === m.b) {
        var ss2 = sentsIn(bs[i]); if (!ss2.length) return null;
        return ss2[ss2.length === m.n ? Math.min(m.s, ss2.length - 1) : Math.min(ss2.length - 1, Math.round(m.n > 1 ? m.s / (m.n - 1) * (ss2.length - 1) : 0))];
      }
      return null;
    }
    if (m.dk != null) { all = sentsIn(AD.root()); for (i = 0; i < all.length; i++) if (all[i].getAttribute('data-k') === m.dk) return all[i]; return null; }
    if (m.i != null) { all = sentsIn(AD.root()); if (!all.length) return null; return all[all.length === m.n ? Math.min(m.i, all.length - 1) : Math.min(all.length - 1, Math.round(m.n > 1 ? m.i / (m.n - 1) * (all.length - 1) : 0))]; }
    return null;
  }
  function clearPt() { qa('.cr-pt').forEach(function (e) { e.className = String(e.className).replace(/\s*cr-pt/g, ''); }); }
  var ptT = null;
  function showPt(el, keep) {
    clearPt(); if (!el) return; el.className += ' cr-pt'; C.ptEl = el; clearTimeout(ptT);
    if (!keep) ptT = setTimeout(function () { if (el.className) el.className = String(el.className).replace(/\s*cr-pt/g, ''); }, 3200);
    if (now() - C.manualAt > COOL) { try { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (x) { el.scrollIntoView(); } }
  }

  /* ---------- 帶領者 ---------- */
  function host(code, quiet, scr) {
    loadJs(PEER_JS, function () { return !!window.Peer; }, function (ok) {
      if (!ok) { toast(X('loadErr')); return; }
      teardown(); C.role = 'host'; C.code = code || newCode(); C.status = 'connecting'; ss('s', { r: 'host', c: C.code }); chip(); tick();
      var p = C.peer = new window.Peer(PFX + C.code, { debug: 0 });
      p.on('open', function () { C.retry = 0; C.status = 'ok'; chip(); if (!quiet) sheet(); C.lastKey = '#'; snap(true); });
      p.on('connection', function (c) {
        C.conns.push(c);
        c.on('open', function () { chip(); toast(X('joinedOne')); paintCount(); snap(true); });
        c.on('close', function () { drop(c); }); c.on('error', function () { drop(c); });
      });
      p.on('disconnected', function () { if (C.role === 'host' && !p.destroyed) setTimeout(function () { try { p.reconnect(); } catch (e) { } }, 1500); });
      p.on('error', function (e) {
        if (C.role !== 'host') return;
        if (e && e.type === 'unavailable-id') { if (C.retry++ < 5) { C.status = 'connecting'; chip(); clearTimeout(C.rt); C.rt = setTimeout(function () { host(C.code, true); }, 3000); } else { toast(X('loadErr')); endNow(true); } return; }
        if (e && (e.type === 'network' || e.type === 'server-error' || e.type === 'socket-error' || e.type === 'socket-closed')) { clearTimeout(C.rt); C.rt = setTimeout(function () { if (C.role === 'host') host(C.code, true); }, 4000); }
      });
    });
  }
  function drop(c) { var o = []; for (var i = 0; i < C.conns.length; i++) if (C.conns[i] !== c) o.push(C.conns[i]); C.conns = o; chip(); paintCount(); }
  function cast(m) { var cs = live(); for (var i = 0; i < cs.length; i++) try { cs[i].send(m); } catch (e) { } }
  /* 全量狀態：換頁時送 st，再補一次 pos、清掉舊的點句記號（中繼站會把最後的 st／pos／mk 補給後到的人） */
  function snap(force) {
    if (C.role !== 'host') return;
    var n = curNav(); if (n === undefined) return;            /* 小智／美圖工作室蓋在上面：維持原狀 */
    var k = keyOf(n);
    if (!force && k === C.lastKey) return;
    C.lastKey = k; C.lastF = -1;
    var f = n ? curF() : 0, st = { t: 'st', nav: n, f: f, p: k };
    C.last = st; cast(st); if (n) { cast({ t: 'pos', f: f, p: k }); C.lastF = f; } cast({ t: 'mk', k: 'clr', p: k });
  }
  var posT = null;
  function sendPos() {
    if (C.role !== 'host') return; var n = curNav(); if (n === undefined || !n) return;
    var k = keyOf(n); if (k !== C.lastKey) { snap(); return; }
    var f = curF(); if (Math.abs(f - C.lastF) < 0.002) return; C.lastF = f; cast({ t: 'pos', f: f, p: k });
  }
  document.addEventListener('scroll', function (e) {
    if (C.role === 'host') {
      var s = sc(); if (e.target !== document && e.target !== s) return;
      if (posT) return; posT = setTimeout(function () { posT = null; sendPos(); }, 220);
    }
  }, true);
  function userMove() { if (C.role === 'follow') { C.manualAt = now(); chip(); setTimeout(chip, COOL + 100); } }
  window.addEventListener('touchmove', userMove, { passive: true }); window.addEventListener('wheel', userMove, { passive: true });
  window.addEventListener('keydown', function (e) { if (C.role === 'follow' && /^(Arrow|Page|Home|End| )/.test(e.key || '')) userMove(); }, true);
  function sendMark(kind, el) {
    if (C.role !== 'host' || !el) return; var n = curNav(); if (!n) return;
    var m = sentId(el); m.t = 'mk'; m.k = kind; m.p = keyOf(n); cast(m); C.lastMk = now();
  }
  document.addEventListener('click', function (e) {
    if (C.role !== 'host') return; var t = e.target, s = t && t.closest ? t.closest('.sent') : null; if (s && !(t.closest && t.closest('#crsheet'))) sendMark('pt', s);
  }, true);
  var ttsMO = null;
  function watchTts() {
    if (ttsMO || !window.MutationObserver) return;
    ttsMO = new MutationObserver(function (recs) {
      if (C.role !== 'host') return;
      for (var i = 0; i < recs.length; i++) { var r = recs[i], t = r.target; if (r.attributeName === 'class' && t.classList && t.classList.contains('sent') && t.classList.contains('tts-reading')) { sendMark('tts', t); return; } }
    });
    ttsMO.observe(document.body, { attributes: true, attributeFilter: ['class'], subtree: true });
  }

  /* ---------- 加入者 ---------- */
  function join(code, scr) {
    code = normCode(code); if (!validCode(code)) { toast(X('badCode')); return; }
    if (scr) window.CR_SCREEN = true;
    loadJs(PEER_JS, function () { return !!window.Peer; }, function (ok) {
      if (!ok) { toast(X('loadErr')); return; }
      if (scr) window.CR_SCREEN = true;
      teardown(); C.role = 'follow'; C.code = code; C.scr = !!scr; C.status = 'connecting'; C.first = true; C.misses = 0; ss('s', { r: 'follow', c: code, scr: scr ? 1 : 0 }); chip(); closeSheet(); tick();
      var p = C.peer = new window.Peer({ debug: 0 });
      p.on('open', function () { dial(); });
      p.on('disconnected', function () { if (C.role === 'follow' && !p.destroyed) setTimeout(function () { try { p.reconnect(); } catch (e) { } }, 1500); });
      p.on('error', function (e) {
        if (C.role !== 'follow') return;
        if (e && e.type === 'peer-unavailable') { C.misses++; if (C.first && C.misses >= 3) { toast(X('notFound')); leave(true); return; } C.status = 'connecting'; chip(); redial(4000); return; }
        redial(4000);
      });
    });
  }
  function redial(ms) { clearTimeout(C.rt); C.rt = setTimeout(function () { if (C.role === 'follow') dial(); }, ms || 3000); }
  function dial() {
    var p = C.peer; if (!p || p.destroyed || C.role !== 'follow') return;
    if (p.disconnected) { try { p.reconnect(); } catch (e) { } redial(3000); return; }
    try { if (C.host) C.host.close(); } catch (e) { }
    var c = C.host = p.connect(PFX + C.code, { reliable: true });
    var to = setTimeout(function () { if (!c.open && C.role === 'follow' && C.host === c) { try { c.close(); } catch (e) { } redial(1000); } }, 12000);
    c.on('open', function () { clearTimeout(to); C.misses = 0; C.lastRx = now(); C.status = 'ok'; if (C.first) { C.first = false; if (!C.scr) toast(X('joined')); } chip(); });
    c.on('data', function (m) { C.lastRx = now(); if (C.status !== 'ok') { C.status = 'ok'; chip(); } if (!m) return; if (m.t === 'end') leave(); else apply(m); });
    c.on('close', function () { clearTimeout(to); if (C.role === 'follow' && C.host === c) { C.status = 'lost'; chip(); redial(2500); } });
    c.on('error', function () { });
  }
  function apply(m) {
    if (C.role !== 'follow') return;
    if (m.t === 'st') {
      C.want = { nav: m.nav, f: m.f || 0, p: m.p || keyOf(m.nav), mk: null };
      C.hostPriv = !m.nav; chip();
      if (m.nav) goTo(m.nav, true);
    } else if (m.t === 'pos') {
      if (!C.want || (m.p && m.p !== C.want.p)) { if (!C.want) C.want = { nav: null, f: m.f, p: m.p, mk: null }; else return; }
      C.want.f = m.f || 0; if (!C.hostPriv && now() - (C.lastMarkAt || 0) > 1500) applyScroll();
    } else if (m.t === 'mk') {
      if (m.k === 'clr') { if (C.want) C.want.mk = null; clearPt(); return; }
      if (C.want && m.p && m.p !== C.want.p) return;
      if (C.want) C.want.mk = m; applyMark();
    }
  }
  function goTo(nav, fromHost) {
    var k = keyOf(nav), cur = curNav();
    if (cur !== undefined && keyOf(cur) !== k) { C.settle = now() + 4500; try { AD.go(nav); } catch (e) { if (window.console) console.error(e); } setTimeout(tick, 60); }
    else { if (fromHost) C.settle = now() + 2500; applyScroll(); applyMark(); }
  }
  function applyScroll() {
    if (C.role !== 'follow' || !C.want || C.hostPriv || !C.want.nav) return;
    if (now() - C.manualAt < COOL) return;
    var cur = curNav(); if (cur === undefined || keyOf(cur) !== keyOf(C.want.nav)) return;
    setF(C.want.f);
  }
  function applyMark() {
    var m = C.want && C.want.mk; if (!m || C.role !== 'follow') return;
    var cur = curNav(); if (cur === undefined || keyOf(cur) !== keyOf(C.want.nav)) return;
    var el = findSent(m); if (!el) return; C.lastMarkAt = now();
    if (C.ptEl === el && /cr-pt/.test(String(el.className))) return;
    showPt(el, m.k === 'tts');
  }
  function backToLeader() { C.manualAt = 0; var w = C.want; if (w && w.nav) { var cur = curNav(); if (cur !== undefined && keyOf(cur) !== keyOf(w.nav)) { goTo(w.nav, true); } else { C.settle = now() + 1500; applyScroll(); applyMark(); } } chip(); }

  /* 心跳 */
  setInterval(function () {
    if (C.role === 'host') cast({ t: 'hb' });
    else if (C.role === 'follow' && C.host && C.lastRx && now() - C.lastRx > 15000) { C.lastRx = 0; C.status = 'lost'; chip(); dial(); }
    if (C.role === 'host') snap();
    if (C.role === 'follow' && now() < C.settle) { applyScroll(); applyMark(); }
  }, 700);
  window.addEventListener('pagehide', function () { if (C.role === 'host') cast({ t: 'hb' }); });
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden && C.role === 'follow' && C.status !== 'ok') dial();
    if (!document.hidden && C.role === 'host' && C.peer && C.peer.disconnected) try { C.peer.reconnect(); } catch (e) { }
  });
  window.addEventListener('hashchange', function () { setTimeout(tick, 120); });

  /* ---------- 結束 ---------- */
  function teardown() { clearTimeout(C.rt); try { if (C.peer) C.peer.destroy(); } catch (e) { } C.peer = null; C.conns = []; C.host = null; C.want = null; C.last = null; C.hostPriv = false; clearPt(); }
  function end() { cast({ t: 'end' }); setTimeout(function () { endNow(); }, live().length ? 300 : 0); }
  function endNow(quiet) { teardown(); C.role = ''; C.code = ''; ss('s', null); chip(); closeSheet(); if (!quiet) toast(X('ended')); updIdle(); }
  function leave(quiet) { teardown(); C.role = ''; C.code = ''; C.scr = false; ss('s', null); chip(); closeSheet(); if (!quiet) toast(X('ended')); updIdle(); }
  function updIdle() { try { if (typeof window.updIdle === 'function') window.updIdle(); } catch (e) { } }

  /* ---------- 畫面：頂端 📡 鈕、狀態條、面板 ---------- */
  var TOPSEL = ['#app .top', 'header.top .in', 'header.top', 'header.topbar', '#view .top', '.top'];
  function findTop() {
    if (AD.top) { try { var t0 = AD.top(); if (t0) return t0; } catch (e) { } return null; }
    for (var i = 0; i < TOPSEL.length; i++) { var e = document.querySelector(TOPSEL[i]); if (e) return e; }
    return null;
  }
  function ensureBtn() {
    var b = document.getElementById('crTop'), h = findTop();
    if (b && h && h.contains(b)) { return; }
    if (b && !h && b.className.indexOf('crfloat') >= 0) { return; }
    if (b && b.parentNode) b.parentNode.removeChild(b);
    b = document.createElement('button'); b.id = 'crTop'; b.type = 'button'; b.setAttribute('aria-label', 'co-read'); b.title = X('title'); b.innerHTML = '<span>📡</span>';
    b.className = 'crtop' + (h ? '' : ' crfloat') + (C.role ? ' on' : '');
    b.onclick = function (e) { if (e) { e.stopPropagation(); } sheet(); };
    if (h) {
      var anchor = h.querySelector('#setBtn'); if (anchor && anchor.parentNode === h) h.insertBefore(b, anchor); else h.appendChild(b);
    } else document.body.appendChild(b);
  }
  function chip() {
    var b = document.getElementById('crTop'); if (b) b.className = b.className.replace(/\s*\bon\b/g, '') + (C.role ? ' on' : '');
    var el = document.getElementById('crchip');
    if (!C.role) { if (el) el.parentNode.removeChild(el); document.body.className = document.body.className.replace(/\s*\bcrOn\b/g, ''); return; }
    if (!el) { el = document.createElement('button'); el.id = 'crchip'; el.type = 'button'; el.onclick = function () { if (C.role === 'follow' && isOff()) { backToLeader(); return; } sheet(); }; document.body.appendChild(el); }
    var t, cls = 'crchip';
    if (C.role === 'host') {
      if (C.status !== 'ok') { t = X('connecting'); cls += ' wait'; }
      else { var n = curNav(); t = X('hostChip', C.code, live().length); if (n === null) { t += '・' + X('mePriv'); cls += ' off'; } }
    } else if (C.status !== 'ok') { t = C.status === 'lost' ? X('hostLeft') : X('connecting'); cls += ' wait'; }
    else if (C.hostPriv) { t = X('hostPriv'); cls += ' off'; }
    else if (isOff()) { t = X('paused'); cls += ' off'; }
    else t = X('following');
    if (C.role === 'host') cls += ' host';
    var h = '<span class="dot"></span>📡 ' + E(t);
    if (el.className !== cls) el.className = cls;
    if (el._h !== h) { el._h = h; el.innerHTML = h; }
  }
  function isOff() {
    if (C.role !== 'follow' || C.scr) return false;
    if (now() - C.manualAt < COOL) return true;
    if (C.want && C.want.nav) { var cur = curNav(); if (cur !== undefined && keyOf(cur) !== keyOf(C.want.nav)) return true; }
    return false;
  }
  function qrInto(id, text) {
    loadJs(QR_JS, function () { return typeof window.qrcode === 'function'; }, function (ok) {
      var box = document.getElementById(id); if (!box || !ok) { if (box) box.style.display = 'none'; return; }
      try { var q = window.qrcode(0, 'M'); q.addData(text); q.make(); box.innerHTML = q.createImgTag(5, 10); } catch (e) { box.style.display = 'none'; }
    });
  }
  function paintCount() { var e = document.getElementById('crcount'); if (e) { var n = live().length; e.textContent = n ? X('people', n) : X('waiting'); } }
  function closeSheet() { var m = document.getElementById('crsheet'); if (m && m.parentNode) m.parentNode.removeChild(m); }
  function sheet() {
    closeSheet();
    var h = '<div class="crt">📡 ' + E(X('title')) + '</div>';
    if (C.role === 'host') {
      h += '<div class="crk">' + E(X('code')) + '</div><div class="crcode">' + E(C.code.slice(0, 3) + ' ' + C.code.slice(3)) + '</div>' +
        '<div class="crqr" id="crqr"></div><div class="crx crc">' + E(X('qrTip')) + '</div><div class="crcount" id="crcount"></div>' +
        '<div class="cract"><button class="crb pri" data-a="invite">↗ ' + E(X('invite')) + '</button><button class="crb" data-a="copy">⧉ ' + E(X('copyLink')) + '</button></div>' +
        '<div class="crscrbox"><b>' + E(X('scrT')) + '</b><div class="crx">' + E(X('scrD')) + '</div><button class="crb full" data-a="copyscr">⧉ ' + E(X('copyScr')) + '</button></div>' +
        '<div class="crx crtip">' + E(X('tip')) + '</div><div class="cract"><button class="crb" data-a="end">■ ' + E(X('end')) + '</button><button class="crb" data-a="close">' + E(X('close')) + '</button></div>';
    } else if (C.role === 'follow') {
      h += '<div class="crk">' + E(X('followOnly')) + '</div><div class="crcode">' + E(C.code.slice(0, 3) + ' ' + C.code.slice(3)) + '</div>' +
        '<div class="cract"><button class="crb pri" data-a="back">' + E(X('back2')) + '</button><button class="crb" data-a="leave">' + E(X('leave')) + '</button></div>' +
        '<div class="cract"><button class="crb" data-a="close">' + E(X('close')) + '</button></div>';
    } else {
      h += '<div class="crx crdesc">' + E(X('desc')) + '</div><button class="crb pri full big" data-a="host">📡 ' + E(X('host')) + '</button>' +
        '<div class="crk" style="margin-top:16px">' + E(X('orJoin')) + '</div>' +
        '<div class="crjoin"><input id="crin" type="text" inputmode="text" autocapitalize="characters" autocomplete="off" maxlength="7" placeholder="' + E(X('codePH')) + '"><button class="crb pri" data-a="join">' + E(X('join')) + '</button></div>' +
        '<label class="crchk"><input type="checkbox" id="crscrchk"> ' + E(X('asScreen')) + '</label>' +
        '<div class="cract"><button class="crb" data-a="close">' + E(X('close')) + '</button></div>';
    }
    var m = document.createElement('div'); m.id = 'crsheet'; m.innerHTML = '<div class="crcard">' + h + '</div>'; document.body.appendChild(m);
    m.onclick = function (e) { if (e.target === m) closeSheet(); };
    var inp = document.getElementById('crin'); if (inp) inp.onkeydown = function (e) { if (e.keyCode === 13) doJoin(); };
    if (C.role === 'host') { paintCount(); qrInto('crqr', joinUrl(C.code)); }
  }
  function doJoin() { var i = document.getElementById('crin'), c = document.getElementById('crscrchk'); join(i ? i.value : '', !!(c && c.checked)); }
  document.addEventListener('click', function (e) {
    var n = e.target; while (n && n !== document && !(n.getAttribute && n.getAttribute('data-a') && n.className && String(n.className).indexOf('crb') >= 0)) n = n.parentNode; if (!n || n === document) return;
    var a = n.getAttribute('data-a');
    if (a === 'host') { closeSheet(); host(); }
    else if (a === 'join') doJoin();
    else if (a === 'invite') { var msg = X('inviteMsg', appName(), joinUrl(C.code), C.code); if (navigator.share) { navigator.share({ text: msg }).catch(function () { }); } else copyText(msg); }
    else if (a === 'copy') copyText(joinUrl(C.code));
    else if (a === 'copyscr') copyText(joinUrl(C.code, true));
    else if (a === 'end') end();
    else if (a === 'leave') leave();
    else if (a === 'back') { closeSheet(); backToLeader(); }
    else if (a === 'close') closeSheet();
  }, false);

  /* ---------- 重畫鉤子 ---------- */
  var tickT = null, busyTick = false;
  function tick() {
    if (busyTick) return; busyTick = true;
    try {
      ensureBtn(); chip();
      if (C.role === 'host') snap();
      else if (C.role === 'follow') { if (now() < C.settle) { applyScroll(); } applyMark(); }
    } catch (e) { if (window.console) console.error(e); }
    busyTick = false;
  }
  function inMine(n) { while (n && n !== document) { if (n.id && /^(crTop|crchip|crsheet|crtoast|crscr)/.test(n.id)) return true; n = n.parentNode; } return false; }
  function startObserver() {
    if (!window.MutationObserver) { setInterval(tick, 500); return; }
    var mo = new MutationObserver(function (recs) {
      for (var i = 0; i < recs.length; i++) { if (!inMine(recs[i].target)) { clearTimeout(tickT); tickT = setTimeout(tick, 150); return; } }
    });
    mo.observe(document.body, { childList: true, subtree: true });
    setInterval(function () { ensureBtn(); }, 1500);
  }

  /* ---------- 樣式 ---------- */
  function css() {
    if (document.getElementById('crcss')) return;
    var s = document.createElement('style'); s.id = 'crcss';
    s.textContent = '.crtop{flex:none;border:0;border-radius:12px;min-width:36px;height:40px;padding:0 6px;display:inline-flex;align-items:center;justify-content:center;background:var(--card,#fff);color:var(--ink,#222);box-shadow:0 1px 3px rgba(0,0,0,.12);cursor:pointer;font:inherit;font-size:18px;line-height:1;position:relative}' +
      '.crtop.on{background:#2b3a8c;color:#fff}.crtop.on:after{content:"";position:absolute;right:5px;top:5px;width:8px;height:8px;border-radius:50%;background:#5BD38A}' +
      '.crtop.crfloat{position:fixed;right:10px;top:calc(10px + env(safe-area-inset-top));z-index:60}' +
      '.crchip{position:fixed;right:10px;top:calc(62px + env(safe-area-inset-top));z-index:61;border:0;border-radius:999px;padding:7px 14px 7px 10px;font:inherit;font-size:13px;background:linear-gradient(90deg,#1f3a8a,#5b3b9a);color:#fff;box-shadow:0 6px 18px rgba(0,0,0,.25);max-width:84vw;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer}' +
      '.crchip .dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:#5BD38A;margin-right:6px;vertical-align:1px;animation:crp 1.6s infinite}.crchip.wait .dot{background:#F2C14E}.crchip.off{background:#8a5a12}.crchip.off .dot{background:#fff;animation:none}' +
      '@keyframes crp{0%{box-shadow:0 0 0 0 rgba(91,211,138,.6)}70%{box-shadow:0 0 0 7px rgba(91,211,138,0)}100%{box-shadow:0 0 0 0 rgba(91,211,138,0)}}' +
      '@keyframes crpt{0%,100%{box-shadow:0 0 0 2px rgba(201,150,43,.95),0 0 0 6px rgba(201,150,43,.18)}50%{box-shadow:0 0 0 2px rgba(201,150,43,.95),0 0 0 11px rgba(201,150,43,0)}}' +
      '.cr-pt{outline:2px solid #c9962b;outline-offset:2px;border-radius:6px;background:rgba(201,150,43,.16)!important;animation:crpt 1.4s ease-in-out infinite;-webkit-box-decoration-break:clone;box-decoration-break:clone}' +
      '#crsheet{position:fixed;left:0;top:0;right:0;bottom:0;z-index:2000;background:rgba(0,0,0,.45);display:flex;align-items:flex-end;justify-content:center}' +
      '.crcard{width:100%;max-width:520px;max-height:92vh;overflow:auto;box-sizing:border-box;background:var(--card,#fff);color:var(--ink,#222);border-radius:20px 20px 0 0;padding:18px 18px calc(18px + env(safe-area-inset-bottom));font-size:15px;line-height:1.6;text-align:left}' +
      '.crt{font-weight:800;font-size:1.15em;text-align:center;margin-bottom:8px}.crk{font-size:.86em;color:var(--mute,#777);text-align:center;margin-top:6px}' +
      '.crcode{font-size:2.3em;font-weight:800;letter-spacing:.12em;text-align:center;color:#2b3a8c;margin:2px 0 8px;font-variant-numeric:tabular-nums}' +
      '.crqr{display:flex;justify-content:center;margin:4px 0}.crqr img{width:170px;height:170px;image-rendering:pixelated;background:#fff;border-radius:10px;padding:4px}' +
      '.crx{font-size:.86em;color:var(--mute,#777);line-height:1.6}.crc{text-align:center}.crcount{text-align:center;font-weight:700;margin:10px 0 4px}.crtip{margin-top:10px}.crdesc{margin-bottom:12px;font-size:.95em}' +
      '.cract{display:flex;gap:8px;justify-content:center;margin-top:10px;flex-wrap:wrap}' +
      '.crb{font:inherit;border:1px solid var(--line,#ddd);background:var(--card,#fff);color:var(--ink,#222);border-radius:12px;padding:10px 16px;cursor:pointer;min-height:44px}.crb.pri{background:#2b3a8c;border-color:#2b3a8c;color:#fff;font-weight:700}.crb.full{display:block;width:100%;box-sizing:border-box}.crb.big{font-size:1.05em;padding:14px 16px}' +
      '.crjoin{display:flex;gap:8px;margin-top:6px}.crjoin input{flex:1;min-width:0;font:inherit;font-size:1.15em;letter-spacing:.1em;padding:10px 12px;border:1px solid var(--line,#ccc);border-radius:12px;background:var(--card,#fff);color:var(--ink,#222);text-align:center;text-transform:uppercase}' +
      '.crchk{display:block;margin-top:10px;font-size:.9em}.crscrbox{margin-top:14px;padding:10px 12px;border:1px dashed var(--line,#ccc);border-radius:12px}.crscrbox .crb{margin-top:8px}' +
      '#crtoast{position:fixed;left:50%;bottom:calc(96px + env(safe-area-inset-bottom));transform:translateX(-50%);background:#2A2140;color:#fff;padding:10px 18px;border-radius:999px;z-index:2100;font-size:14px;opacity:0;transition:opacity .25s;pointer-events:none;max-width:88vw;text-align:center}#crtoast.on{opacity:1}';
    document.head.appendChild(s);
  }

  /* ---------- 對外接口 ---------- */
  window.CR321 = {
    on: function () { return !!C.role; }, role: function () { return C.role; }, sheet: sheet, host: host, join: join, end: end, leave: leave, tick: tick,
    code: function () { return C.code; }, state: function () { return C; }, nav: curNav, text: X
  };

  /* ---------- 啟動 ---------- */
  var qs = location.search || '', jm = qs.match(/[?&]join=([A-Za-z0-9]+)/), scrQ = /[?&]screen=1/.test(qs), keep = ss('s');
  if (scrQ || (keep && keep.scr)) window.CR_SCREEN = true;
  function init() {
    css(); ensureBtn(); startObserver(); watchTts();
    if (jm) {
      var jc = jm[1], sc2 = scrQ;
      try { var u = location.pathname + (qs.replace(/[?&](join|screen)=[^&]*/g, '').replace(/^&/, '?').replace(/^\?$/, '')) + (location.hash || ''); history.replaceState(null, '', u.replace(/\?&/, '?')); } catch (e) { }
      setTimeout(function () { join(jc, sc2); }, 600);
    } else if (keep && keep.c) {
      setTimeout(function () { if (keep.r === 'host') host(keep.c, true); else join(keep.c, !!keep.scr); }, 600);
    }
  }
  if (document.body) init(); else document.addEventListener('DOMContentLoaded', init);
})();
