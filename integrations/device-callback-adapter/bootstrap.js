(function () {
  'use strict';

  function runtimePort() {
    if (location.port) return Number(location.port);
    return location.protocol === 'https:' ? 443 : 80;
  }

  function localHttpAllowed() {
    return location.protocol === 'http:' &&
      (location.hostname === 'localhost' ||
        location.hostname === '127.0.0.1' ||
        location.hostname === '::1');
  }

  async function initialize() {
    if (!globalThis.dsNet || !globalThis.dsNetNative) {
      throw new Error('integration_request_modules_unavailable');
    }

    var identity = await globalThis.dsNet.initFromBridge(
      globalThis.PromotionIntegrationBridge
    );
    var runtime = {
      host: location.hostname,
      port: runtimePort(),
      eventPath: identity.eventPath,
      sessionToken: identity.sessionToken,
      sessionExpiresAt: identity.sessionExpiresAt,
      visitorId: identity.deviceId,
      channelId: identity.channelId,
      allowInsecureHttp: localHttpAllowed()
    };

    globalThis.dsNetNative.setIntegrationRuntime(runtime);
    globalThis._dsDeviceId = identity.deviceId;
    globalThis._dsChannelCode = identity.channelId;
    globalThis.dsIntegrationRuntime = Object.freeze(runtime);
    globalThis.dispatchEvent(new CustomEvent('ds-integration-ready', {
      detail: {
        channelId: identity.channelId,
        visitorId: identity.deviceId,
        sessionExpiresAt: identity.sessionExpiresAt
      }
    }));
  }

  globalThis.dsIntegrationReady = initialize();
  globalThis.dsIntegrationReady.catch(function (error) {
    globalThis.dispatchEvent(new CustomEvent('ds-integration-error', {
      detail: { message: String(error && error.message || error) }
    }));
  });
})();
