// Playtest log capture for the web builds. Loaded by every build's <head> (see web/export_presets.web.cfg).
// Records console output (Godot's print() and errors land there on the web), window errors, and device
// info; keeps the last 600 lines in localStorage so a crash or reload loses nothing; shows a small "log"
// button that opens a panel with Copy, Share and Report (a prefilled GitHub issue in this repository).
(function () {
  var REPO = 'VladimirLi/game-off-2026';
  var MAX = 600, KEY = 'playtest-log';
  var t0 = Date.now();
  var lines = [];
  try { lines = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { lines = []; }
  var build = location.pathname.replace(/^.*\/b\//, 'b/').replace(/\/index\.html$/, '/');
  function stamp() { return ((Date.now() - t0) / 1000).toFixed(1).padStart(6) + 's'; }
  function add(kind, text) {
    var line = stamp() + ' ' + kind + ' ' + text;
    lines.push(line);
    if (lines.length > MAX) lines.splice(0, lines.length - MAX);
    try { localStorage.setItem(KEY, JSON.stringify(lines)); } catch (e) {}
    if (panel && panel.style.display !== 'none') render();
  }
  function fmt(args) { return Array.prototype.map.call(args, function (a) { try { return typeof a === 'string' ? a : JSON.stringify(a); } catch (e) { return String(a); } }).join(' '); }
  ['log', 'info', 'warn', 'error'].forEach(function (k) {
    var orig = console[k].bind(console);
    console[k] = function () { add(k === 'log' ? '   ' : k.slice(0, 3).toUpperCase(), fmt(arguments)); orig.apply(console, arguments); };
  });
  window.addEventListener('error', function (e) { add('ERR', (e.message || 'error') + ' @ ' + (e.filename || '') + ':' + (e.lineno || '')); });
  window.addEventListener('unhandledrejection', function (e) { add('ERR', 'unhandled rejection: ' + (e.reason && (e.reason.message || e.reason))); });

  var panel = null, pre = null, btn = null;
  function render() {
    if (!pre) return;
    pre.textContent = lines.join('\n');
    pre.scrollTop = pre.scrollHeight;
  }
  function tail(maxBytes) {
    var out = [], n = 0;
    for (var i = lines.length - 1; i >= 0; i--) { n += lines[i].length + 1; if (n > maxBytes) break; out.unshift(lines[i]); }
    return out.join('\n');
  }
  function reportUrl() {
    var title = 'Playtest log: ' + build.replace(/^b\//, '').replace(/\/$/, '');
    var body = '**Build:** `' + build + '`\n**Device:** ' + navigator.userAgent + '\n**Screen:** ' + screen.width + 'x' + screen.height + ' @' + devicePixelRatio + ', viewport ' + innerWidth + 'x' + innerHeight + '\n\n**What happened:**\n\n\n```\n' + tail(5500) + '\n```\n';
    return 'https://github.com/' + REPO + '/issues/new?labels=playtest-log&title=' + encodeURIComponent(title) + '&body=' + encodeURIComponent(body);
  }
  function mk(tag, css, text) { var el = document.createElement(tag); el.style.cssText = css; if (text) el.textContent = text; return el; }
  function ui() {
    var B = 'font:14px system-ui,sans-serif;color:#fff;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.4);border-radius:8px;padding:8px 12px;margin:0 6px 6px 0;';
    btn = mk('button', 'position:fixed;right:6px;top:22%;z-index:9999;width:38px;height:38px;border-radius:19px;border:1px solid rgba(255,255,255,.4);background:rgba(0,0,0,.35);color:#fff;font:12px system-ui,sans-serif;touch-action:manipulation;', 'log');
    panel = mk('div', 'position:fixed;inset:0;z-index:10000;background:rgba(10,10,14,.94);color:#eee;display:none;flex-direction:column;padding:10px;padding-top:max(10px,env(safe-area-inset-top));box-sizing:border-box;');
    var bar = mk('div', 'display:flex;flex-wrap:wrap;align-items:center;');
    var bCopy = mk('button', B, 'Copy'), bShare = mk('button', B, 'Share'), bReport = mk('button', B + 'background:#2b6cb0;', 'Report to GitHub'), bClear = mk('button', B, 'Clear'), bClose = mk('button', B + 'margin-left:auto;', 'Close');
    var status = mk('span', 'font:13px system-ui,sans-serif;color:#9a9db0;margin-left:6px;');
    bCopy.onclick = function () { navigator.clipboard.writeText(lines.join('\n')).then(function () { status.textContent = 'copied ' + lines.length + ' lines'; }, function () { status.textContent = 'copy failed; long-press the text instead'; }); };
    bShare.onclick = function () { if (navigator.share) navigator.share({ title: 'Playtest log', text: tail(20000) }).catch(function () {}); else status.textContent = 'sharing not available here'; };
    bReport.onclick = function () { window.open(reportUrl(), '_blank'); };
    bClear.onclick = function () { lines = []; try { localStorage.removeItem(KEY); } catch (e) {} render(); };
    bClose.onclick = function () { panel.style.display = 'none'; btn.style.display = ''; };
    [bCopy, bShare, bReport, bClear, status, bClose].forEach(function (b) { bar.appendChild(b); });
    pre = mk('pre', 'flex:1;overflow:auto;margin:6px 0 0;font:12px/1.4 ui-monospace,Menlo,monospace;white-space:pre-wrap;word-break:break-word;user-select:text;-webkit-user-select:text;');
    panel.appendChild(bar); panel.appendChild(pre);
    btn.onclick = function () { panel.style.display = 'flex'; btn.style.display = 'none'; render(); };
    document.body.appendChild(btn); document.body.appendChild(panel);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ui); else ui();
  add('---', 'load ' + build + ' | ' + navigator.userAgent + ' | screen ' + screen.width + 'x' + screen.height + ' @' + devicePixelRatio + ' | viewport ' + innerWidth + 'x' + innerHeight + ' | touch ' + ('ontouchstart' in window));
  window.playtestLog = { lines: function () { return lines.slice(); }, reportUrl: reportUrl };
})();
