export const TEMPLATE_SCHEMA_V2 = "promotion-template/v2" as const;
export const BROWSER_BRIDGE_V2 = "promotion-browser-bridge/v2" as const;
export const PUBLIC_PAIRING_V1 = "promotion-public-pairing/v1" as const;
export const ACCOUNT_LINK_ELEMENTS_V1 = "account-link-elements/v1" as const;

export type PairingStatus =
  | "code_issued"
  | "waiting_phone"
  | "reconnecting"
  | "verified"
  | "failed"
  | "expired"
  | "cancelled";

export type InitializationStatus = "pending" | "syncing" | "ready" | "failed" | "unsupported";

export interface PairingHandle {
  pairingCode: string;
  attemptId?: string;
  pairingStatus?: PairingStatus;
  expiresAt?: string;
  statusUrl?: string;
  cancelUrl?: string;
  statusToken?: string;
  [opaqueField: string]: unknown;
}

export interface PromotionBridgeV2 {
  version: typeof BROWSER_BRIDGE_V2;
  submitPhone(
    phone: string,
    metadata?: Record<string, string | number | boolean | null>,
  ): Promise<Response>;
  getPairingStatus(pairing: PairingHandle): Promise<Response>;
  cancelPairing(pairing: PairingHandle): Promise<Response>;
}

export interface PromotionTemplateManifestV2 {
  schema: typeof TEMPLATE_SCHEMA_V2;
  version: string;
  entry: "index.html";
  format: "static-bundle" | "vite-dist";
  capabilities: ["phone-pairing"];
  runtime: typeof BROWSER_BRIDGE_V2;
  requirements: {
    pairingContract: typeof PUBLIC_PAIRING_V1;
    componentKit?: typeof ACCOUNT_LINK_ELEMENTS_V1;
    [key: string]: unknown;
  };
  interactionProtection: "platform";
  defaultLocale: string;
  supportedLocales: string[];
  i18n: {
    mode: "bundled" | "runtime";
    path: string;
    fallbackLocale: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

declare global {
  interface Window {
    PromotionBridge?: PromotionBridgeV2;
  }
}
