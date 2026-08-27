

(function() {
  var body = null;          
  var placeholder = null;   
  var autoScroll = true;
  var buffer = [];
  var ready = false;
  var scrollRaf = null;     

  function ensureReady() {
    if (ready) return;
    if (!document.body) {
      document.addEventListener('DOMContentLoaded', ensureReady);
      return;
    }
    ready = true;

    
    var st = document.createElement('style');
    st.textContent =
      'html,body{margin:0;padding:0;background:#0d1117;color:#7ee787;' +
      'font:15px/1.6 ui-monospace,Menlo,monospace;' +
      '-webkit-text-size-adjust:100%;text-size-adjust:100%;}' +
      '@media (max-width:600px){html,body{font-size:16px;}}';
    document.head.appendChild(st);

    var root = document.createElement('div');
    root.setAttribute('style', 'display:flex;flex-direction:column;');

    
    var bar = document.createElement('div');
    bar.setAttribute('style',
      'position:fixed;top:0;left:0;right:0;z-index:999;display:flex;align-items:center;gap:8px;' +
      'padding:8px 10px;background:#161b22;border-bottom:1px solid #30363d;');
    var title = document.createElement('span');
    title.textContent = '调试日志';
    title.setAttribute('style', 'color:#58a6ff;font-weight:bold;flex:1;font-size:15px;white-space:nowrap;');
    bar.appendChild(title);

    function mkBtn(label, fn) {
      var b = document.createElement('button');
      b.textContent = label;
      b.setAttribute('style',
        'background:#21262d;color:#c9d1d9;border:1px solid #30363d;border-radius:6px;' +
        'padding:8px 12px;font-size:14px;min-height:36px;cursor:pointer;' +
        'font-family:ui-monospace,Menlo,monospace;white-space:nowrap;');
      b.onclick = fn;
      bar.appendChild(b);
      return b;
    }
    mkBtn('复制', function() { copyAll(); });
    mkBtn('导出', function() { exportTxt(); });
    mkBtn('清空', function() { clearAll(); });
    var autoBtn = mkBtn('', function() { autoScroll = !autoScroll; refreshAuto(); });
    function refreshAuto() { autoBtn.textContent = autoScroll ? '滚动:开' : '滚动:关'; }
    refreshAuto();

    root.appendChild(bar);
    body = document.createElement('div');
    body.setAttribute('style', 'flex:1;padding:6px 12px 24px;');
    root.appendChild(body);

    placeholder = document.createElement('div');
    placeholder.textContent = '(暂无日志)';
    placeholder.setAttribute('style', 'color:#8b949e;');
    body.appendChild(placeholder);

    document.body.appendChild(root);
    
    try { document.body.style.paddingTop = (bar.offsetHeight + 2) + 'px'; } catch(e) {}

    while (buffer.length) appendOne(buffer.shift());
  }

  
  function isNearBottom() {
    try {
      var y = window.pageYOffset || document.documentElement.scrollTop || 0;
      return (window.innerHeight + y) >= (document.body.scrollHeight - 80);
    } catch(e) {
      return true;
    }
  }

  
  function scheduleScroll() {
    if (scrollRaf) return;
    var raf = window.requestAnimationFrame ||
        function(fn) { setTimeout(fn, 16); };
    scrollRaf = raf(function() {
      scrollRaf = null;
      if (autoScroll && isNearBottom()) {
        try { window.scrollTo(0, document.body.scrollHeight); } catch(e) {}
      }
    });
  }

  function appendOne(text) {
    if (placeholder) {
      try { body.removeChild(placeholder); } catch(e) {}
      placeholder = null;
    }
    var d = document.createElement('div');
    d.textContent = text;
    d.setAttribute('style', 'white-space:pre-wrap;word-break:break-all;border-bottom:1px solid #161b22;padding:1px 0;');
    body.appendChild(d);
    while (body.children.length > 1000) body.removeChild(body.firstChild);
    scheduleScroll();
  }

  function add(text) {
    ensureReady();
    if (!ready || !body) {
      buffer.push(text);
      while (buffer.length > 1000) buffer.shift();
      return;
    }
    appendOne(text);
  }

  function clearAll() {
    if (body) {
      body.innerHTML = '';
      placeholder = null;
    }
  }

  function exportTxt() {
    if (!body || !body.innerText) return;
    try {
      var blob = new Blob([body.innerText], {type: 'text/plain'});
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'debug_log_' + Date.now() + '.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch(e) {}
  }

  function copyFallback(text) {
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.setAttribute('style', 'position:fixed;top:0;left:0;opacity:0;');
      document.body.appendChild(ta);
      ta.select();
      ta.setSelectionRange(0, text.length);
      document.execCommand('copy');
      document.body.removeChild(ta);
    } catch(e) {}
  }

  function copyAll() {
    if (!body || !body.innerText) return;
    var text = body.innerText;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function(){}, function(){ copyFallback(text); });
    } else {
      copyFallback(text);
    }
  }

  window.__logViewAdd = add;
  window.__logViewClear = clearAll;

  ensureReady();
})();
