export const TEMPLATE_SCHEMA_V2 = "promotion-template/v2" as const;
export const BROWSER_BRIDGE_V2 = "promotion-browser-bridge/v2" as const;
export const PUBLIC_PAIRING_V1 = "promotion-public-pairing/v1" as const;
export const ACCOUNT_LINK_ELEMENTS_V1 = "account-link-elements/v1" as const;
export const PROMOTION_INTEGRATION_MANIFEST_V1 = 1 as const;
export const PROMOTION_INTEGRATION_BRIDGE_V1 = "promotion-integration-bridge/v1" as const;

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
  name?: string;
  description?: string;
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

export type PromotionIntegrationType = "script" | "iframe";
export type PromotionIntegrationScriptType = "classic" | "module";

export interface PromotionIntegrationEntrypointV1 {
  path: string;
  scriptType?: PromotionIntegrationScriptType;
}

export interface PromotionIntegrationManifestV1 {
  schemaVersion?: typeof PROMOTION_INTEGRATION_MANIFEST_V1 | "1";
  type?: PromotionIntegrationType;
  version?: string;
  integrationKey?: string;
  name?: string;
  description?: string;
  entry?: string;
  entries?: Array<string | PromotionIntegrationEntrypointV1>;
  feedback?: {
    enabled?: boolean;
    events?: string[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface PromotionIntegrationRuntimeContextV1 {
  integration: { id: string; key: string; version: string };
  channel: {
    id: string;
    slug: string;
    countryCode: string;
    trafficSource: "direct" | "fission";
  };
  template: { id: string; version: string };
  events: string[];
  sessionExpiresAt: number;
  fingerprintEnabled: boolean;
  [opaqueField: string]: unknown;
}

export interface PromotionIntegrationBridgeV1 {
  version: typeof PROMOTION_INTEGRATION_BRIDGE_V1;
  ready(): Promise<PromotionIntegrationRuntimeContextV1>;
  report(eventType: string, metadata?: Record<string, unknown>): Promise<Response>;
}

declare global {
  interface Window {
    PromotionBridge?: PromotionBridgeV2;
    PromotionIntegrationBridge?: PromotionIntegrationBridgeV1;
  }
}
