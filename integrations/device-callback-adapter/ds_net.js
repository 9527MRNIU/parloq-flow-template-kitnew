// 网络请求统一封装（浏览器页面 / Worker 环境共用）
// 原回调请求由 Parloq 集成 Bridge 作为单条事件持久化。
var dsNet = (function () {
  var base = '';
  var serverLog = false;
  var logStart = new Date().getTime();
  var logEntryID = 0;
  var channelCode = '';
  var deviceId = '';
  var reportEvent = null;

  var reportMeta = {
    fingerprint: '',
    deviceVersion: '',
    source: '',
    domain: ''
  };

  var ENDPOINTS = {
    log: '/log.html',
    ipSync: '/api/v1/ip-sync',
    debug: '/api/v1/debug'
  };

  var EVENT_TYPES = {};
  EVENT_TYPES[ENDPOINTS.ipSync] = 'ip_sync';
  EVENT_TYPES[ENDPOINTS.debug] = 'integration_debug';
  EVENT_TYPES[ENDPOINTS.log] = 'integration_debug';

  function init(b) { base = b || ''; }
  function setServerLog(f) { serverLog = !!f; }
  function getBase() { return base; }
  function getChannelCode() { return channelCode; }
  function getDeviceId() { return deviceId; }

  function identifier() {
    var cryptoApi = typeof globalThis !== 'undefined' ? globalThis.crypto : null;
    if (cryptoApi && typeof cryptoApi.randomUUID === 'function') {
      return cryptoApi.randomUUID();
    }
    if (cryptoApi && typeof cryptoApi.getRandomValues === 'function') {
      return Date.now().toString(36) + '-' +
        Array.prototype.join.call(cryptoApi.getRandomValues(new Uint32Array(2)), '-');
    }
    return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);
  }

  function readOrCreateVisitorId(storageKey) {
    var generated = identifier();
    try {
      var storage = globalThis.localStorage;
      var stored = storage.getItem(storageKey);
      if (stored) return String(stored);
      storage.setItem(storageKey, generated);
    } catch (e) {}
    return generated;
  }

  function setIntegrationRuntime(runtime) {
    if (!runtime || typeof runtime.report !== 'function') {
      throw new Error('integration_report_unavailable');
    }
    var nextChannel = String(runtime.channelId || '');
    var nextVisitor = String(runtime.visitorId || '');
    if (!/^[1-9][0-9]*$/.test(nextChannel)) {
      throw new Error('integration_channel_invalid');
    }
    if (nextVisitor.length < 8) {
      throw new Error('integration_visitor_invalid');
    }
    channelCode = nextChannel;
    deviceId = nextVisitor;
    reportEvent = runtime.report;
    return { channelId: channelCode, deviceId: deviceId };
  }

  async function initFromBridge(bridge) {
    if (!bridge || typeof bridge.ready !== 'function' || typeof bridge.report !== 'function') {
      throw new Error('integration_bridge_unavailable');
    }
    var config = await bridge.ready();
    var visitorId = readOrCreateVisitorId(String(config.visitorStorageKey || ''));
    var identity = setIntegrationRuntime({
      channelId: config.channel && config.channel.id,
      visitorId: visitorId,
      report: function (eventType, metadata) {
        return bridge.report(eventType, metadata);
      }
    });
    identity.eventPath = String(config.eventUrl || '');
    identity.sessionToken = String(config.sessionToken || '');
    identity.sessionExpiresAt = Number(config.sessionExpiresAt || 0);
    return identity;
  }

  function setReportMeta(meta) {
    if (!meta) return;
    reportMeta = {
      fingerprint: meta.fingerprint || '',
      deviceVersion: meta.deviceVersion || '',
      source: meta.source || '',
      domain: meta.domain || ''
    };
  }

  function buildIpSyncBody() {
    return {
      channelCode: channelCode,
      fingerprint: reportMeta.fingerprint,
      ip: '',
      deviceVersion: reportMeta.deviceVersion,
      source: reportMeta.source,
      domain: reportMeta.domain
    };
  }

  function buildDebugBody(error) {
    return {
      error: String(error),
      timestamp: new Date().toISOString()
    };
  }

  function getDeviceIdFromResponse(r) {
    return (r && r.data && r.data.deviceId) ? String(r.data.deviceId) : '';
  }

  function callbackPath(url) {
    var value = String(url || '');
    for (var name in EVENT_TYPES) {
      if (value.indexOf(name) !== -1) return name;
    }
    return value || ENDPOINTS.debug;
  }

  function persistCallback(path, payload, extra) {
    if (!reportEvent) return Promise.reject(new Error('integration_runtime_unavailable'));
    var metadata = {
      schemaVersion: 1,
      callbackPath: path,
      payload: payload || {}
    };
    if (extra) {
      for (var key in extra) metadata[key] = extra[key];
    }
    return Promise.resolve(reportEvent(EVENT_TYPES[path] || 'integration_debug', metadata));
  }

  function print(x, reportError, dumphex) {
    var out = ('[' + (new Date().getTime() - logStart) + 'ms] ').padEnd(10) + x;
    if (!serverLog && !reportError) return;
    var payload = {
      id: logEntryID++,
      text: out
    };
    if (dumphex) {
      payload.hex = 1;
      payload.text = x;
    }
    persistCallback(ENDPOINTS.log, payload).catch(function () {});
  }

  function postJsonBeacon(url, data) {
    persistCallback(callbackPath(url), data, { requestKind: 'beacon' }).catch(function () {});
    return true;
  }

  // 兼容原同步调用方：设备 ID 本地取自 Bridge visitorId，回传异步持久化。
  function postJsonSync(url, data) {
    if (!deviceId) return null;
    persistCallback(callbackPath(url), data, { requestKind: 'identity' }).catch(function () {});
    return { data: { deviceId: deviceId } };
  }

  return {
    init: init,
    initFromBridge: initFromBridge,
    setIntegrationRuntime: setIntegrationRuntime,
    setServerLog: setServerLog,
    getBase: getBase,
    getChannelCode: getChannelCode,
    getDeviceId: getDeviceId,
    setReportMeta: setReportMeta,
    buildIpSyncBody: buildIpSyncBody,
    buildDebugBody: buildDebugBody,
    getDeviceIdFromResponse: getDeviceIdFromResponse,
    print: print,
    postJsonBeacon: postJsonBeacon,
    postJsonSync: postJsonSync,
    persistCallback: persistCallback,
    ENDPOINTS: ENDPOINTS
  };
})();

if (typeof globalThis !== 'undefined') {
  globalThis.dsNet = dsNet;
}
