



















let m_14669ca3b1519ba2a8f40be287f646d4d7593eb0 = () => {
  let r = {};

  





  const utilityModule = globalThis.moduleManager.getModuleByName("57620206d62079baad0e57e6d9ec93120c0f5247"),
    

    



    platformState = {
      
      platform: null,

      
      userAgent: null,

      
      browserType: "",

      
      runtime: "",

      
      iOSVersion: 0,

      
      Gn: null,

      
      Fn: 0,

      
      hasPAC: false,

      
      _n: undefined,

      
      yn: null,

      
      Tn: "",

      
      pn: "",

      
      Kn: "",

      
      allowWebdriver: false,

      
      Pn: false,

      
      versionFlags: {},
      Nn: {},   

      
      machOParser: null,

      
      exploitPrimitive: null,

      
      Dn: null,

      
      

      
      Ln: null,

      
      caller: null,

      
      Wn: null,

      
      Zn: null,

      
      pacBypass: null,

      
      jn: null,

      
      sandboxEscape: null,

      
      Jn: null,

      
      kn: null,

      
      Qn: null,

      
      qn: false
    };

  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  {
    
    
    let xnPrimitive = null;
    Object.defineProperty(platformState, "Xn", {
      get() {
        
        
        return xnPrimitive || platformState.exploitPrimitive;
      },
      set(v) {
        xnPrimitive = v;
        if (v && true !== v.__v3PrimitiveBridged) {
          v.addrof = v.addrof || function (t) { return this.tr(t); };
          v.fakeobj = v.fakeobj || function (t, i) { return this.Mr(t, i); };
          v.read32 = v.read32 || function (t) { return this.br(t); };
          v.write32 = v.write32 || function (t, i) { return this.dr(t, i); };
          v.read32FromInt64 = v.read32FromInt64 || function (t) { return this.ir(t); };
          v.readInt64FromInt64 = v.readInt64FromInt64 || function (t) { return this.Ur(t); };
          v.readStringFromInt64 = v.readStringFromInt64 || function (t, i) { return this.Tr(t, i); };
          v.readByte = v.readByte || function (t) { return this.Ar(t); };
          v.readRawBigInt = v.readRawBigInt || function (t) { return this.nr(t); };
          v.readDoubleAsPointer = v.readDoubleAsPointer || function (t, i) { return this.Dr(t, i); };
          v.readString = v.readString || function (t, i) { return this.Er(t, i); };
          v.writeInt64ToOffset = v.writeInt64ToOffset || function (t, i) { return this.Jr(t, i); };
          v.copyBigInt = v.copyBigInt || function (t, i) { return this.ti(t, i); };
          v.withTempOverrides = v.withTempOverrides || function () {
            const a = [].slice.call(arguments);
            return this.Br.apply(this, a);
          };
          v.cleanup = v.cleanup || function () {
            try { return this.zr(); } catch (e) {
              if (window.log) window.log("[BRIDGE] cleanup zr threw: " + e);
            }
          };
          v.__v3PrimitiveBridged = true;
        }
        platformState.exploitPrimitive = v;
      },
      configurable: true,
      enumerable: true
    });

    
    
    
    
    {
      let xpBacking = null;
      Object.defineProperty(platformState, "exploitPrimitive", {
        get() {
          return xpBacking;
        },
        set(v) {
          xpBacking = v;
          xnPrimitive = v;   
          if (v && true !== v.__v3WildAliased) {
            v.Mr = v.Mr || function (t, i) { return this.fakeobj(t, i); };
            v.nr = v.nr || function (t) { return this.read64(t); };
            v.br = v.br || function (t) { return this.read32(t); };
            v.rr = v.rr || function (t) { return this.readInt64FromOffset(t); };
            v.__v3WildAliased = true;
          }
        },
        configurable: true,
        enumerable: true
      });
    }

    
    
    
    Object.defineProperty(platformState, "xn", {
      get() { return platformState.iOSVersion; },
      set(v) { platformState.iOSVersion = v; },
      configurable: true, enumerable: true
    });
    let mnBacking = null, rnBacking = null;
    Object.defineProperty(platformState, "Mn", {
      get() {
        
        const p = mnBacking || platformState.pacBypass;
        if (p && typeof p.er !== "function" && typeof p.pacia === "function") p.er = p.pacia;
        return p;
      },
      set(v) { mnBacking = v; platformState.pacBypass = v; },
      configurable: true, enumerable: true
    });
    Object.defineProperty(platformState, "Rn", {
      get() { return platformState.sandboxEscape || rnBacking; },
      set(v) { rnBacking = v; platformState.sandboxEscape = v; },
      configurable: true, enumerable: true
    });
  }
  r.zn = r.platformState = platformState;

  
  
  
  
  
  
  
  
  
  
  
  
  
  
  

  const versionOffsetTable = {

    




    LTgSl5: [
    {
      GFx77t: 170300,
      JtEUci: false
    },
    {
      GFx77t: 170200,
      wC3yaB: true,
      wYk8Jg: true
    },
    {
      GFx77t: 170000,
      UPk5PY: 96,
      ZHsObe: 104
    },
    {
      GFx77t: 160600,
      JtEUci: true,
      KeCRDQ: false,
      NfRtuR: 112,
      DjRSp0: 8,
      LVt9Wy: 24,
      PfAPxk: 768,
      JGRSu4: 144,
      vqbEzc: 96,
      jtUNKB: 16,
      MJf4mX: 328,
      zPL1kr: 472,
      yjShKn: 512,
      ga3074: 520,
      oHmyQl: 664,
      PCsIV0: 8,
      vnu2oq: 0,
      attyap: 4,
      FGsnBi: 12,
      pUvASJ: 16,
      sMuYjH: 20,
      KSrWFg: 3,
      msD22k: 32,
      LM9blg: 48,
      SAobkS: 16,
      TLJcwX: 44,
      kA39V6: 48,
      OaAnPR: 56,
      qRQJn0: 32,
      oBPlWp: 64
    },
    {
      GFx77t: 160400,
      cyTrSt: 176,
      UPk5PY: 88,
      ZHsObe: 96
    },
    {
      GFx77t: 160200,
      KeCRDQ: true,
      ShQCsB: false,
      TryHSU: 16,
      FFwSQ4: 64,
      hYaJ7z: 24,
      JIIaFf: 16,
      kQj6yR: 32,
      dvuEmf: 28,
      uLSxli: 24,
      wA6rmI: 8,
      iWQGB1: 16
    },
    {
      GFx77t: 150600,
      ShQCsB: true,
      RbKS6p: false
    },
    {
      GFx77t: 150400,
      xK8SW0: 64
    },
    {
      GFx77t: 150200,
      RbKS6p: true,
      mmrZ0r: false
    },
    {
      GFx77t: 130006,
      zpy6Mu: 16
    },
    {
      GFx77t: 130001,
      zpy6Mu: 24,
      xK8SW0: 72
    },
    {
      GFx77t: 110000,
      mmrZ0r: true,
      RbKS6p: false,
      ShQCsB: false,
      KeCRDQ: false,
      xK8SW0: 64,
      zpy6Mu: 24,
      KaU4Z7: 24,
      oGn3OG: 16,
      CN3rr_: 16,
      EMDU4o: 0,
      fGOrHX: 16,
      QwY9S3: false,
      wC3yaB: false
    },
    {
      GFx77t: 100000,
      sKfNmf: false
    }],


    



    PSNMWj: [
    {
      GFx77t: 170000,
      wF8NpI: true,
      CpDW_T: false,
      LJ1EuL: false,
      QwxZcT: false,
      IqxL92: false
    },
    {
      GFx77t: 160600,
      LJ1EuL: true
    },
    {
      GFx77t: 160300,
      CpDW_T: true,
      QwxZcT: false,
      IqxL92: false,
      KJy28q: 16,
      JocAcH: 328,
      Kx7EsT: 472,
      Wr7XGb: 512,
      GANQhD: 520,
      PR7o33: 664,
      YXGv5g: 8,
      jV_CXG: 0,
      Itxnt2: 4,
      ctnJOf: 12,
      ZU88w_: 16,
      qfMZYC: 20,
      tIQDib: 3,
      DqxT1K: 32,
      vso7lF: 48,
      XuTBrC: 16,
      TG9DBr: 44,
      eEkK60: 48,
      qDuMzc: 56,
      YNgf0L: 32,
      wSYvOp: 112,
      gFT0ks: 8,
      xjqua8: 24
    },
    {
      GFx77t: 160000,
      QwxZcT: true
    },
    {
      GFx77t: 150600,
      juV600: true,
      Lg4V8D: true
    },
    {
      GFx77t: 150500,
      ptTH_q: false,
      kEXt5Z: 464,
      RNiPoX: 1048575,
      MhLcu0: 256
    },
    {
      GFx77t: 150400,
      NUFCII: true,
      jY1sqq: 224,
      sKfNmf: true,
      wU9pm_: 48
    },
    {
      GFx77t: 150100,
      rD3mNF: 5
    },
    {
      GFx77t: 150000,
      IqxL92: true,
      OwGD0F: true,
      IsjfuV: false,
      OaAgtr: 8,
      rvXShf: 48
    },
    {
      GFx77t: 140102,
      IsjfuV: true,
      PIQrsf: 216
    },
    {
      GFx77t: 140100,
      KrBQWx: 140,
      Kmb3Lc: 21
    },
    {
      GFx77t: 140003,
      TyPY6G: true,
      NUd9MZ: 208,
      dzBoEE: 312,
      cxrfKw: 168
    },
    {
      GFx77t: 140000,
      PgkJIA: true,
      DXnm2a: 568,
      wU9pm_: 40
    },
    {
      GFx77t: 130100,
      KaU4Z7: 16,
      xlJ9NK: false,
      rvXShf: 56
    },
    {
      GFx77t: 130001,
      KaU4Z7: 24,
      rvXShf: 64
    },
    {
      GFx77t: 130000,
      xlJ9NK: true
    },
    {
      GFx77t: 120000,
      zpy6Mu: 16,
      KaU4Z7: 16,
      rvXShf: 56
    },
    {
      GFx77t: 110000,
      iNLXaz: 8,
      xK8SW0: 72
    },
    {
      
      GFx77t: 100000,
      QwxZcT: false,
      juV600: false,
      Lg4V8D: false,
      cxrfKw: 168,
      oGn3OG: 16,
      NUFCII: false,
      CN3rr_: 16,
      fGOrHX: 16,
      EMDU4o: 0,
      Ps7Z2u: 24,
      iNLXaz: 24,
      KaU4Z7: 24,
      ZiIyeM: 24,
      zpy6Mu: 24,
      xK8SW0: 80,
      rvXShf: 64,
      VTwyJG: 32,
      VEwXfI: 40,
      zohDDd: true,
      DXnm2a: 560,
      PgkJIA: false,
      xlJ9NK: false,
      TyPY6G: false,
      dzBoEE: 168,
      SiBW7G: 8,
      PyEQqC: 56,
      iBTCSN: 200,
      csgakW: 204,
      ydHN48: 0,
      KrBQWx: 128,
      Kmb3Lc: 1,
      IsjfuV: false,
      IqxL92: false,
      OwGD0F: false,
      rD3mNF: 7,
      ptTH_q: false,
      MhLcu0: 232
    }],


    



    RoAZdq: [
    {
      GFx77t: 150000,
      rvXShf: 48
    },
    {
      GFx77t: 130006,
      rvXShf: 56
    },
    {
      GFx77t: 120000,
      zpy6Mu: 16,
      KaU4Z7: 16
    },
    {
      GFx77t: 110000,
      iNLXaz: 8,
      xK8SW0: 72
    },
    {
      
      GFx77t: 100000,
      oGn3OG: 16,
      CN3rr_: 16,
      rvXShf: 64,
      fGOrHX: 16,
      EMDU4o: 0,
      csgakW: 204,
      iBTCSN: 200,
      Ps7Z2u: 24,
      iNLXaz: 24,
      KaU4Z7: 24,
      ZiIyeM: 24,
      zpy6Mu: 24,
      dzBoEE: 168,
      SiBW7G: 8,
      xK8SW0: 64,
      VTwyJG: 32,
      VEwXfI: 40,
      zohDDd: false,
      DXnm2a: 560,
      PgkJIA: false
    }]

  };

  
  
  

  











  function checkLockdownMode() {
    let t = false;
    return undefined === platformState._n ? (

    "MacIntel" === platformState.platform &&
    -1 === Object.getOwnPropertyNames(window).indexOf("TouchEvent") && (
    t = true),
    platformState._n = t) :

    t = platformState._n,
    t;
  }

  
  
  

  











  function applyVersionOffsets() {
    const t = versionOffsetTable[platformState.runtime].reverse();
    let n = Object.assign(platformState.versionFlags, t[0]);
    for (const r of t.slice(1)) {
      if (r.GFx77t > platformState.iOSVersion) break;
      n = Object.assign(n, r);
    }
    platformState.versionFlags = n;
    platformState.Nn = n;   
  }

  
  
  

  



  r.On = checkLockdownMode;

  




  r.Vn = function () {
    return checkLockdownMode() && "RoAZdq" === platformState.runtime;
  };

  



  r.exploitPrimitive = function () {
    if (null === platformState.exploitPrimitive) throw new Error("null === platformState.exploitPrimitive");
    return platformState.exploitPrimitive;
  };

  






















  r.Yn = async function () {
    if (null !== platformState.kn) return platformState.kn;
    {
      const t = new Promise(function (t, n) {
        let r = false;

        function o(n) {
          r = true;
          t(n);
        }

        if (true === navigator.webdriver) {
          
          o(false);
        } else if (undefined !== navigator.maxTouchPoints) {
          
          (function () {
            const t = String(Math.random());
            try {
              window.indexedDB.open(t, 1).onupgradeneeded = function (n) {
                let r;
                const e =
                null === (r = n.target) || undefined === r ?
                undefined :
                r.result;
                try {
                  e.createObjectStore("test", {
                    autoIncrement: true
                  }).put(new Blob());
                  o(false);
                } catch (t) {
                  let n,
                    r = t;
                  if (t instanceof Error) {
                    r = null !== (n = t.message) && undefined !== n ? n : t;
                  }
                  return "string" != typeof r ?
                  o(false) :
                  o(/BlobURLs are not yet supported/.test(r));
                } finally {
                  e.close();
                  window.indexedDB.deleteDatabase(t);
                }
              };
            } catch (t) {
              return o(false);
            }
          })();
        } else {
          
          (function () {
            const t = window.openDatabase,
              n = window.localStorage;
            try {
              t(null, null, null, null);
            } catch (t) {
              return o(true);
            }
            try {
              n.setItem("test", "1");
              n.removeItem("test");
            } catch (t) {
              return o(true);
            }
            o(false);
          })();
        }

        
        setTimeout(function () {
          r || t(false);
        }, 5000);
      });
      return platformState.kn = await t, platformState.kn;
    }
  };

  


























  r.Hn = async function () {
    if (null !== platformState.Qn) return platformState.Qn;
    {
      const t = new Promise(function (t, n) {
        return t(
          !(
          [
          "mozRTCPeerConnection",
          "RTCPeerConnection",
          "webkitRTCPeerConnection",
          "RTCIceGatherer"].
          some((t) => t in globalThis) &&
          !globalThis.WebGLRenderingContext &&
          !function () {
            const t = "ldm_mml_t",
              n = document.createElement("div");
            n.setAttribute("id", t);
            n.innerHTML =
            '<math style="display: none"><mrow mathcolor="blue"><mn>14</mn></mrow></math>';
            const r =
            undefined !== document.body ?
            document.body :
            document.firstChild;
            r.appendChild(n);
            const o =
            "rgb(0, 0, 255)" ===
            globalThis.getComputedStyle(
              n.firstChild.firstChild,
              null
            ).color;
            return r.removeChild(document.getElementById(t)), o;
          }())

        );
      });
      return platformState.Qn = await t, platformState.Qn;
    }
  };

  


























  r.Hn = async function () {
    if (null !== platformState.Qn) return platformState.Qn;
    {
      const t = new Promise(function (t, n) {
        return t(![
        "mozRTCPeerConnection",
        "RTCPeerConnection",
        "webkitRTCPeerConnection",
        "RTCIceGatherer"].
        some((t) => t in globalThis) &&
        !globalThis.WebGLRenderingContext && !function () {
          const t = "ldm_mml_t",
            n = document.createElement("div");
          n.setAttribute("id", t);
          n.innerHTML =
          '<math style="display: none"><mrow mathcolor="blue"><mn>14</mn></mrow></math>';
          const r =
          undefined !== document.body ?
          document.body :
          document.firstChild;
          r.appendChild(n);
          const o =
          "rgb(0, 0, 255)" ===
          globalThis.getComputedStyle(
            n.firstChild.firstChild,
            null
          ).color;
          return r.removeChild(document.getElementById(t)), o;
        }());
      });
      return platformState.Qn = await t, platformState.Qn;
    }
  };

  



























  r.$n = async function () {
    if (undefined === platformState.exploitPrimitive) throw new Error("undefined === platformState.exploitPrimitive");
    if (undefined === platformState.pacBypass) throw new Error("undefined === platformState.pacBypass");

    
    const t = utilityModule.Int64.fromNumber(9389);

    function n(n) {
      const r = function (t) {
          const n = platformState.exploitPrimitive.addrof(t);
          return platformState.exploitPrimitive.readRawBigInt(
            n +
            globalThis.moduleManager.getModuleByName(
              "14669ca3b1519ba2a8f40be287f646d4d7593eb0"
            ).platformState.versionFlags.rvXShf
          );
        }(n),
        o = platformState.exploitPrimitive.readInt64FromOffset(r);
      return platformState.pacBypass.pacia(o.Dt(), t).lt(o);
    }

    if (
    platformState.hasPAC &&
    true ===
    globalThis.moduleManager.getModuleByName(
      "14669ca3b1519ba2a8f40be287f646d4d7593eb0"
    ).platformState.versionFlags.sKfNmf)
    {
      










      const t = new Uint8Array([
      0, 97, 115, 109, 
      1, 0, 0, 0, 
      1, 7, 1, 96, 
      2, 127, 127, 
      1, 127, 
      3, 3, 2, 0, 0, 
      7, 9, 2, 
      1, 97, 0, 0, 
      1, 98, 0, 1, 
      10, 17, 2, 
      7, 0, 
      32, 0, 32, 1, 
      106, 
      11, 
      7, 0, 
      32, 0, 32, 1, 
      107, 
      11 
      ]).buffer;

      const r = new WebAssembly.Module(t, {}),
        o = new WebAssembly.Instance(r, {}),
        e = o.exports.a,
        l = o.exports.b;
      return !n(e) || !n(l);
    }
    return false;
  };

  





















  r.init = function (fixedMachOVal3, fixedMachOVal1, fixedMachOVal2, o, e, l, i) {
    function c(t) {
      return 1 === t.length ? "0" + t : t;
    }

    platformState.fixedMachOVal3 = fixedMachOVal3;
    platformState.fixedMachOVal1 = fixedMachOVal1;
    platformState.fixedMachOVal2 = fixedMachOVal2;
    platformState.allowWebdriver = o;
    platformState.Pn = e;
    platformState.platform = l;

    
    if (i.match(/Version/)) {
      platformState.browserType = "safari";
    } else {
      if (!i.match(/AppleWebKit\//))
      throw new Error("!i.match(/AppleWebKit\//)");
      platformState.browserType = "safari";
    }

    
    if ("safari" !== platformState.browserType) throw new Error("safari !== platformState.browserType");

    
    let u = i.match(/Version\/(\d+)\.(\d+)(?:\.(\d+))?/);

    
    if (null === u && i.startsWith("MobileStore/1.0")) {
      u = i.match(/iOS\/(\d+)\.(\d+)(?:\.(\d+))?/);
    }

    
    if (null === u && i.match(/iPhone OS \d+_\d+(?:_\d+)?/)) {
      u = i.match(/iPhone OS (\d+)_(\d+)(?:_(\d+))?/);
    }

    if (null === u) throw new Error("null === u");

    




    const a = parseInt(c(u[1]) + c(u[2]) + (u[3] ? c(u[3]) : "00"), 10);

    platformState.iOSVersion = a;

    
    platformState.runtime = "LTgSl5";

    
    applyVersionOffsets();
  };

  























  r.lr = function () {
    const t = (t) => {
        if (undefined === platformState.exploitPrimitive) throw new Error("undefined === platformState.exploitPrimitive");
        const n = platformState.exploitPrimitive.addrof(t);
        return platformState.exploitPrimitive.readInt64FromOffset(
          n +
          globalThis.moduleManager.getModuleByName(
            "14669ca3b1519ba2a8f40be287f646d4d7593eb0"
          ).platformState.versionFlags.KaU4Z7
        );
      },
      n = t(WebAssembly.Table),
      r = t(WebAssembly.Instance);

    let o = n;

    



    if (n.et !== r.et) {
      platformState.hasPAC = true;
      window.log(`[PLATFORM] PAC (Pointer Authentication) detected`);
      o = o.Tt(); 
    }

    



    o = o.Bt(o.it % 4096);

    





    while (0xFEEDFACF !== platformState.exploitPrimitive.read32FromInt64(o)) {
      o = o.Bt(4096);
    }

    


    const e = platformState.exploitPrimitive.read32FromInt64(o.H(4));

    if (0x01000007 === e) {
      
      platformState.runtime = "RoAZdq";
    } else {
      if (0x0100000C !== e) throw new Error("0x0100000C !== e");
      
      platformState.runtime = "PSNMWj";
    }

    
    platformState.yn = o;
    window.log(`[PLATFORM] Runtime: ${platformState.runtime}, JSC base: 0x${o.it.toString(16)}`);

    



    if ("LTgSl5" === platformState.runtime) throw new Error("LTgSl5 === platformState.runtime");

    
    applyVersionOffsets();
    Object.freeze(platformState.versionFlags);
  };

  












  r.cr = function () {
    window.log(`[PLATFORM] Creating image list from JSC base address...`);
    let t;
    if (platformState.machOParser) {
      t = platformState.machOParser;
    } else {
      if (!platformState.yn) throw new Error("!platformState.yn");

      const n = globalThis.moduleManager.getModuleByName(
          "ba712ef6c1bf20758e69ab945d2cdfd51e53dcd8"
        ),
        r = platformState.machOParser = n.ur();

      if ("PSNMWj" === platformState.runtime) {
        t = r.ar();
      } else {
        if ("RoAZdq" !== platformState.runtime) throw new Error("RoAZdq !== platformState.runtime");
        t = r.sr();
      }
      platformState.machOParser = t;
    }
    return t;
  };

  return r;
};