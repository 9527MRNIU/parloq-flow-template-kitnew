export type WhatsAppApp = "consumer" | "business";

type AppLaunchOptions = {
  mobile: boolean;
  userAgent: string;
  browserFallbackUrl?: string;
};

export const appLaunchFallbackHash = (app: WhatsAppApp) =>
  `#__account-link-${app}-app-not-opened`;

export const createAppLaunchFallbackUrl = (app: WhatsAppApp, currentUrl: string) => {
  const fallback = new URL(currentUrl);
  fallback.hash = appLaunchFallbackHash(app).slice(1);
  return fallback.href;
};

export const createAndroidAppIntent = (app: WhatsAppApp, browserFallbackUrl: string) => {
  const packageName = app === "business" ? "com.whatsapp.w4b" : "com.whatsapp";
  return `intent://settings/linked_devices#Intent;scheme=whatsapp;package=${packageName};S.browser_fallback_url=${encodeURIComponent(browserFallbackUrl)};end`;
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
    return [createAndroidAppIntent(app, browserFallbackUrl)];
  }
  if (app === "business") {
    return ios
      ? ["whatsapp-business://", "https://apps.apple.com/app/whatsapp-business/id1386412985"]
      : ["whatsapp-business://"];
  }
  return ios
    ? ["whatsapp://", "https://apps.apple.com/app/whatsapp-messenger/id310633997"]
    : ["whatsapp://"];
};
