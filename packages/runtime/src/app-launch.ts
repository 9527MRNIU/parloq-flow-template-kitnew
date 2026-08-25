export type WhatsAppApp = "consumer" | "business";

type AppLaunchOptions = {
  mobile: boolean;
  userAgent: string;
  browserFallbackUrl?: string;
};

type LaunchSurface = Pick<Window, "location"> & { open?: Window["open"] };

export const appLaunchFallbackHash = (app: WhatsAppApp) =>
  `#__account-link-${app}-app-not-opened`;

export const createAppLaunchFallbackUrl = (app: WhatsAppApp, currentUrl: string) => {
  const fallback = new URL(currentUrl);
  fallback.hash = appLaunchFallbackHash(app).slice(1);
  return fallback.href;
};

export const isSamsungInternet = (userAgent: string) => /SamsungBrowser/i.test(userAgent);

export const createAndroidAppIntent = (app: WhatsAppApp, browserFallbackUrl: string) => {
  const packageName = app === "business" ? "com.whatsapp.w4b" : "com.whatsapp";
  return `intent://settings/linked_devices#Intent;scheme=whatsapp;package=${packageName};S.browser_fallback_url=${encodeURIComponent(browserFallbackUrl)};end`;
};

export const androidDirectLinkedDevicesUrl = (app: WhatsAppApp) =>
  app === "business"
    ? "whatsapp-business://settings/linked_devices"
    : "whatsapp://settings/linked_devices";

const isSchemeLaunchUrl = (url: string) => /^(intent:|whatsapp(?:-[a-z]+)?:\/\/)/i.test(url);

export const openLaunchUrl = (
  url: string,
  doc: Document = document,
  surfaces: LaunchSurface[] = [window, ...(window.top && window.top !== window && !window.top.closed ? [window.top] : [])],
) => {
  if (isSchemeLaunchUrl(url)) {
    const anchor = doc.createElement("a");
    anchor.href = url;
    anchor.rel = "noopener noreferrer";
    anchor.style.display = "none";
    doc.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    return;
  }
  for (const target of surfaces) {
    try {
      target.location.assign(url);
      return;
    } catch {
      /* try the next launch surface */
    }
  }
  try {
    window.open(url, "_blank", "noopener,noreferrer");
  } catch {
    /* no launch surface available */
  }
};

export const launchAppUrls = (
  urls: string[],
  options: { isPageHidden?: () => boolean; doc?: Document } = {},
) => {
  if (!urls.length) return;
  openLaunchUrl(urls[0], options.doc);
  if (urls.length === 1) return;
  window.setTimeout(() => {
    if (options.isPageHidden?.()) return;
    if (document.visibilityState !== "visible") return;
    for (const url of urls.slice(1)) openLaunchUrl(url, options.doc);
  }, 600);
};

export const resolveAppLaunchUrls = (
  app: WhatsAppApp,
  { mobile, userAgent, browserFallbackUrl }: AppLaunchOptions,
): string[] => {
  const android = /Android/i.test(userAgent);
  const ios = /iPhone|iPad|iPod/i.test(userAgent);
  if (!mobile && !android && !ios) {
    return app === "business"
      ? ["https://web.whatsapp.com/", "whatsapp-business://"]
      : ["https://web.whatsapp.com/", "whatsapp://"];
  }
  if (android) {
    if (!browserFallbackUrl) throw new Error("Android app launch requires a browser fallback URL");
    const intent = createAndroidAppIntent(app, browserFallbackUrl);
    if (isSamsungInternet(userAgent)) {
      return [intent, androidDirectLinkedDevicesUrl(app)];
    }
    return [intent];
  }
  if (app === "business") {
    return ["whatsapp-smb://settings/linked_devices"];
  }
  return ["whatsapp-consumer://settings/linked_devices"];
};
