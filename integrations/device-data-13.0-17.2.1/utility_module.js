




















let m_57620206d62079baad0e57e6d9ec93120c0f5247 = () => {
  let r = {};

  
  
  

  


  function i(t) {
    return window.BigInt ? BigInt(t) : t;
  }
  r.U = i;

  
  
  

  
  
  const u = i(0x7FFFFFFFFF); 

  
  const o = 127; 

  
  const s = i(39);

  r.B = s;
  r.I = u;
  r.v = o;

  
  
  

  


  r.N = function toHexString(t) {
    return null === t ? "null" : t.toString(16);
  };

  
  
  

  
  const gcRoots = [];

  


  r.D = function pushGCRoot(t) {
    gcRoots.push(t);
  };

  
  
  

  const u32View = new Uint32Array(new ArrayBuffer(8)),
    u8View = new Uint8Array(u32View.buffer),
    u16View = new Uint16Array(u32View.buffer),
    f64View = new Float64Array(u32View.buffer);

  
  
  

  


  function l(lo, hi) {
    return lo + 0x100000000 * hi;
  }

  


  function b(t) {
    return f64View[0] = t, u32View[0];
  }

  


  function U(t) {
    return f64View[0] = t, u32View[1];
  }

  


  function B(t, n) {
    return u32View[0] = t, u32View[1] = n, f64View[0];
  }

  


  r.S = function toUint32(t) {
    u32View[0] = t;
    return u32View[0];
  };

  r.T = l;

  


  r.P = function doubleToNumber(t) {
    f64View[0] = t;
    return l(u32View[0], u32View[1]);
  };

  r.C = b;
  r.V = U;

  


  r.F = function numberHi32(t) {
    return t / 0x100000000 >>> 0;
  };

  


  r._ = function numberLo32(t) {
    return t >>> 0;
  };
  


  r.q = function addOffset(t, n) {
    
    return Int64.fromDouble(t).H(n).W();
  };

  


  r.G = function (t, n) {
    
    return Int64.fromDouble(t).H(n).W();
  };

  


  r.J = function toDouble(t) {
    u32View[1] = t / 0x100000000;
    u32View[0] = t;
    return f64View[0];
  };

  


  r.K = function bigintToNumber(t) {
    return l(
      Number(t & BigInt(0xFFFFFFFF)),
      Number(t >> BigInt(32))
    );
  };

  


  r.O = function numberi(t) {
    const lo = BigInt(t >>> 0);
    return BigInt(t / 0x100000000 >>> 0) << BigInt(32) | lo;
  };

  


  r.X = function doublei(t) {
    f64View[0] = t;
    const lo = BigInt(u32View[0]);
    const hi = BigInt(u32View[1]);
    return BigInt(hi) << BigInt(32) | lo;
  };

  r.Y = B;

  


  r.Z = function packBytes(b3, b2, b1, b0) {
    u8View[0] = b0;
    u8View[1] = b1;
    u8View[2] = b2;
    u8View[3] = b3;
    return u32View[0];
  };

  


  r.tt = function toCharCodes(t) {
    u32View[1] = t / 0x100000000;
    u32View[0] = t;
    return String.fromCharCode(u16View[0], u16View[1], u16View[2], u16View[3]);
  };

  


  r.nt = function base64ToArrayBuffer(t) {
    var n;
    const decoded = atob(t);
    const bytes = new Uint8Array(decoded.length);
    for (n = 0; n < decoded.length; n++) {
      bytes[n] = decoded.charCodeAt(n);
    }
    return bytes.buffer;
  };

  


  r.rt = function stringToArrayBuffer(t) {
    var n;
    const bytes = new Uint8Array(t.length);
    for (n = 0; n < t.length; n++) {
      bytes[n] = t.charCodeAt(n);
    }
    return bytes.buffer;
  };

  
  
  

  




  class Int64 {
    
    static ut(t) {
      return Int64.fromNumber(t);
    }
    static ot(t) {return Int64.fromBigInt(t);}
    static st(t) {return Int64.fromUnsigned(t);}
    static L(t) {return Int64.fromDouble(t);}
    static ht(t) {return Int64.fromInt32(t);}
    ct() {return this.toNumber();}
    
    gt() {return this.not();}

    constructor(lo, hi) {
      this.it = lo >>> 0, this.et = hi >>> 0;
    }

    
    static fromNumber(t) {
      return new Int64(t >>> 0, t / 0x100000000 >>> 0);
    }

    
    static fromBigInt(t) {
      return new Int64(Number(t & BigInt(0x100000000 + (1599169875 ^ -1599169876))), Number(t >> BigInt(32)));
    }

    
    static fromUnsigned(t) {
      return new Int64(t >>> 0, t / 0x100000000 >>> 0);
    }

    
    static fromDouble(t) {
      return new Int64(b(t), U(t));
    }

    
    static fromInt32(t) {
      return new Int64(t >>> 0, (t < 0 ? -1 : 0) >>> 0);
    }

    
    toNumber() {
      return 0x100000000 * this.et + this.it;
    }

    
    ft() {
      return this.et > 127;
    }

    
    wt(t) {
      const n = t / 0x100000000 >>> 0,
        r = t >>> 0;
      return this.et === n && this.it === r;
    }

    
    not() {
      return new Int64(~this.it, ~this.et);
    }

    
    add(t) {
      const n = this.it + t.it;
      var r = this.et + t.et;
      return n !== n >>> 0 && r++, new Int64(n >>> 0, r >>> 0);
    }

    
    H(t) {
      return this.add(Int64.fromInt32(t));
    }

    
    lt(t) {
      return this.it === t.it && this.et === t.et;
    }

    
    bt(t) {
      return this.it !== t.it || this.et !== t.et;
    }

    
    sub(t) {
      return this.add(t.Ut());
    }

    
    Bt(t) {
      return this.add(Int64.fromInt32(t).Ut());
    }

    
    It(t) {
      const n = this.it & t.it,
        r = this.et & t.et;
      return new Int64(n >>> 0, r >>> 0);
    }

    
    At(t) {
      const n = this.it | t.it,
        r = this.et | t.et;
      return new Int64(n >>> 0, r >>> 0);
    }

    
    vt(t) {
      const n = this.it ^ t.it,
        r = this.et ^ t.et;
      return new Int64(n >>> 0, r >>> 0);
    }

    
    Ut() {
      return this.gt().add(new Int64(1, 0));
    }

    
    dt(t) {
      if (t >= 32) throw new Error("t >= 32");
      return new Int64(this.it >>> t | this.et << 32 - t, this.et >>> t);
    }

    
    rshift(t) {
      return this.dt(t);
    }

    toString() {
      return "";
    }

    



    yt() {
      if (this.et > o) throw new Error("this.et > o");
      return 0x100000000 * this.et + this.it;
    }

    
    Nt() {
      return BigInt(this.et) * BigInt(0x100000000) + BigInt(this.it);
    }

    
    Dt() {
      return new Int64(this.it, this.et & o);
    }

    
    St() {
      return 0x100000000 * (this.et & o) + this.it;
    }

    
    Tt() {
      return new Int64(this.it, this.et & o);
    }

    
    W() {
      return B(this.it, this.et);
    }

    
    Et() {
      return 0 === this.it && 0 === this.et;
    }

    
    Pt() {
      return this.it;
    }

    




    toPointerValue() {
      if (this.et > o) throw new Error("this.et > o");
      var t = this.it + 0xFFF,
        n = this.et;
      return t !== t >>> 0 && n++, 0x100000000 * (n >>> 0) + ((t &= 0xFFFFF000) >>> 0);
    }
  };const m = Int64;

  
  
  

  



  function utf16Encode(t) {
    const result = [];
    var n;
    for (n = 0; n < t.length; n++) {
      const code = t.charCodeAt(n);
      result.push(255 & code); 
      result.push(code >>> 8); 
    }
    return String.fromCharCode.apply(null, result);
  }

  



  function utf16Decode(t) {
    var lo,hi,i,result = "";
    const len = t.length;
    for (i = 0; i < len; i += 2) {
      lo = t.charCodeAt(i);
      hi = i + 1 < len ? t.charCodeAt(i + 1) : 0;
      result += String.fromCharCode(lo | hi << 8);
    }
    return result;
  }

  


  function decodeString(t) {
    var n = utf16Encode(t);
    const r = n.indexOf("\0");
    return -1 !== r && (n = n.slice(0, r)), n;
  }

  


  function byteToHex(t) {
    var n = t.toString(16).toLowerCase();
    return 1 === n.length && (n = "0" + n), n;
  }

  






  function intToUnicodeEscape(t) {
    var result;
    const byte0 = 255 & t; 
    const byte3 = (0xFF000000 & t) >> 24 & 255; 
    const byte2 = (0xFF0000 & t) >> 16 & 255; 
    result = "%u";
    result += byteToHex((0xFF00 & t) >> 8 & 255); 
    result += byteToHex(byte0);
    result += "%u";
    result += byteToHex(byte3);
    result += byteToHex(byte2);
    return unescape(result);
  }

  


  function doubleToUint32Pair(t) {
    const buf = new Uint8Array(16);
    const view = new DataView(buf.buffer, 0, 8);
    const pair = new Array(2);
    view.setFloat64(0, t);
    pair[0] = view.getUint32(0, false); 
    pair[1] = view.getUint32(4, false); 
    return pair;
  }

  




  function resolveUrl(t) {
    var url = decodeString(t);
    
    if (null === RegExp("^https?://").exec(url)) {
      const host = location.host;
      const protocol = location.protocol;
      if ("/" === url.charAt(0)) {
        
        url = protocol + "//" + host + url;
      } else {
        
        if ("." === url.charAt(0) && "/" === url.charAt(1)) {
          url = url.substring(2);
        }
        const pathname = location.pathname;
        const lastSlash = pathname.lastIndexOf("/");
        url = protocol + "//" + host + pathname.slice(0, lastSlash + 1) + url;
      }
    }
    window.log("resolveUrl => " + url);
    return url;
  }

  
  
  

  r.Vt = r.Int64 = Int64;
  r.Ft = r.utf16Encode = utf16Encode;
  r._t = r.utf16Decode = utf16Decode;
  r.qt = r.decodeString = decodeString;
  r.xt = r.byteToHex = byteToHex;
  r.Wt = r.intToUnicodeEscape = intToUnicodeEscape;

  




  r.Ht = r.readU16FromString = function readU16FromString(t, n) {
    n /= 2;
    return 0x10000 * t.charCodeAt(n + 1) + t.charCodeAt(n); 
  };

  




  r.Lt = r.u32PairToDouble = function u32PairToDouble(lo, hi) {
    const view = new DataView(new ArrayBuffer(8), 0, 8);
    view.setUint32(0, hi);
    view.setUint32(4, lo);
    return view.getFloat64(0);
  };

  



  r.Mt = function safePackDouble(lo, hi) {
    const f64 = new Float64Array(1);
    const u32 = new Uint32Array(f64.buffer);
    const check = new Uint32Array(1);
    u32[0] = lo >>> 0;
    u32[1] = hi >>> 0;
    check[0] = 0xFFF00000 & u32[1]; 
    if (0xFFF00000 === check[0]) throw new Error(0); 
    return f64[0];
  };

  


  r.Rt = function doubleToBytes(t) {
    const buf = new Uint8Array(16);
    new DataView(buf.buffer, 0, 8).setFloat64(0, t);
    return buf;
  };

  r.jt = r.doubleToUint32Pair = doubleToUint32Pair;


  



  r.kt = r.doubleToStagerAddress = function doubleToStagerAddress(t) {
    const pair = doubleToUint32Pair(t);
    let result = null;
    if (pair.length >= 2) {
      result = new StagerAddress(pair[1], pair[0]);
    }
    return result;
  };

  



  r.zt = function writeU32ToArray(arr, n, value) {
    const v = value >>> 0;
    arr[n] = 255 & v; 
    arr[n + 1] = v >> 8 & 255; 
    arr[n + 2] = v >> 16 & 255; 
    arr[n + 3] = v >> 24 & 255; 
    return n + 4;
  };

  


  r.Gt = function readU32FromArray(arr, n) {
    return (arr[n] | arr[n + 1] << 8 | arr[n + 2] << 16 | arr[n + 3] << 24) >>> 0;
  };

  



  r.Jt = r.base64DecodeUtf16 = function base64DecodeUtf16(t) {
    var n,code,i,result = "";
    const decoded = globalThis.atob(t);
    const len = decoded.length;
    
    n = decoded + intToUnicodeEscape(0);
    for (i = 0; i < len; i += 2) {
      code = n.charCodeAt(i);
      code |= n.charCodeAt(i + 1) << 8;
      code >>>= 0;
      result += String.fromCharCode(code);
    }
    return result;
  };

  





  r.Kt = r.lzwDecompress = function lzwDecompress(t) {
    const dict = new Map();
    var prev,entry,code,nextCode,
      result = "",
      dictSize = 256; 

    
    for (prev = 0; prev < 256; prev += 1) {
      dict.set(prev, String.fromCodePoint(prev));
    }

    [...t].forEach(function (ch, idx) {
      if (0 === idx) {
        
        prev = String.fromCodePoint(ch.codePointAt(0));
        entry = prev;
      } else {
        code = ch.codePointAt(0);
        if (dict.has(code)) {
          nextCode = dict.get(code);
        } else {
          if (code !== dictSize) throw new Error(0);
          nextCode = prev + String.fromCodePoint(prev.codePointAt(0));
        }
        entry += nextCode;
        dict.set(dictSize++, prev + String.fromCodePoint(nextCode.codePointAt(0)));
        
        if (55296 === dictSize) {
          dictSize = 57344; 
        }
        prev = nextCode;
      }
    });

    return utf16Decode(entry);
  };

  r.Ot = r.resolveUrl = resolveUrl;

  



  r.Qt = r.resolveUrlPadded = function resolveUrlPadded(t) {
    var n = resolveUrl(t);
    for (n += "\0"; n.length % 4 != 0;) n += "\0";
    return utf16Decode(n);
  };

  





  r.Xt = r.encodeLEB128 = function encodeLEB128(arr, n, value) {
    var byte;
    for (;;) {
      byte = value.it % 128; 
      value = value.sub(Int64.fromInt32(byte));
      if (0 === value.et && 0 === value.it) {

        
      } else {byte |= 128; 
      }
      arr[n++] = byte;
      value = value.rshift(7);
      if (!(128 & byte)) break; 
    }
  };

  





  r.Yt = function decodeLEB128(arr, n) {
    var result = 0,
      shift = 0;
    const startOffset = n;
    do {
      result += (127 & arr[n]) << shift; 
      shift += 7;
    } while (128 & arr[n++]); 
    return {
      Zt: result,
      $t: n - startOffset
    };
  };

  


  r.tn = function throwError() {
    throw new Error("throwError");
  };

  
  
  

  


  function stripPointerTag(t) {
    
    return t & u;
  }

  
  
  

  




  r.nn = class TypeHelper {
    constructor() {
      this.buffer = new ArrayBuffer(16), this.view = new DataView(this.buffer);
    }

    
    un(t) {
      this.view.setInt16(0, t, true);
      return this.view.getInt16(0, true);
    }

    
    on(t) {
      this.view.setUint16(0, t, true);
      return this.view.getUint16(0, true);
    }

    
    sn(t) {
      if ("bigint" == typeof t) {
        this.view.setBigUint64(0, t, true);
      } else {
        this.view.setUint32(0, t, true);
      }
      return this.view.getUint32(0, true);
    }

    
    hn(t, n) {
      this.view.setFloat64(0, t, true);
      this.view.setUint32(0, n, true);
      return this.view.getFloat64(0, true);
    }

    
    cn(t, n) {
      this.view.setFloat64(0, t, true);
      this.view.setUint32(4, n, true);
      return this.view.getFloat64(0, true);
    }

    
    fn(t) {
      for (let n = 0; n < 4; n++) {
        let code = t.charCodeAt(n);
        if (Number.isNaN(code)) throw new Error("Number.isNaN(code)");
        this.view.setUint16(2 * n, code, true);
      }
      return this.view.getBigUint64(0, true);
    }

    
    an(t) {
      this.view.setFloat32(0, t, true);
      return this.view.getUint32(0, true);
    }

    
    wn(t) {
      this.view.setBigUint64(0, t, true);
      return this.view.getFloat64(0, true);
    }

    
    gn(t, n) {
      this.view.setBigUint64(0, t, true);
      this.view.setUint8(0, Number(n));
      return this.view.getBigUint64(0, true);
    }

    
    ln(t, n) {
      this.view.setBigUint64(0, t, true);
      this.view.setUint32(0, Number(n), true);
      return this.view.getBigUint64(0, true);
    }

    
    bn(t, n) {
      this.view.setUint32(0, t, true);
      this.view.setUint8(0, Number(n));
      return this.view.getUint32(0, true);
    }

    
    Un(t, n) {
      this.view.setUint32(0, t, true);
      this.view.setUint32(0, Number(n), true);
      return this.view.getUint32(0, true);
    }

    
    Bn(t) {
      this.view.setUint32(0, Number(t >>> 0), true);
      this.view.setUint32(4, Number(t / 0x100000000), true);
      return this.view.getBigUint64(0, true);
    }

    
    mn(t, n) {
      this.view.setBigUint64(0, t, true);
      this.view.setUint32(0, Number(n), true);
      return this.view.getBigUint64(0, true);
    }

    
    In(t) {
      this.view.setBigUint64(0, t, true);
      return this.view.getBigUint64(0, true);
    }
  };

  r.An = stripPointerTag;

  


  r.vn = function (t) {
    return stripPointerTag(t) !== t;
  };

  return r;
};