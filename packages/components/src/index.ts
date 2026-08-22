export const STANDARD_ACCOUNT_LINK_ELEMENTS = [
  "account-link-flow",
  "account-link-locale-switcher",
  "phone-number-field",
  "account-link-submit",
  "pairing-code-panel",
  "app-launch-actions",
  "account-link-status",
  "account-initialization-status",
] as const;

export const STANDARD_ACCOUNT_LINK_FLOW_MARKUP = `<account-link-flow>
  <phone-number-field></phone-number-field>
  <account-link-submit></account-link-submit>
  <pairing-code-panel></pairing-code-panel>
  <app-launch-actions></app-launch-actions>
  <account-link-status></account-link-status>
  <account-initialization-status></account-initialization-status>
</account-link-flow>`;

export type StandardAccountLinkElement = (typeof STANDARD_ACCOUNT_LINK_ELEMENTS)[number];

export function mountStandardAccountLinkFlow(target: Element): HTMLElement {
  const template = document.createElement("template");
  template.innerHTML = STANDARD_ACCOUNT_LINK_FLOW_MARKUP;
  const flow = template.content.firstElementChild;
  if (!(flow instanceof HTMLElement)) {
    throw new Error("standard account-link flow could not be created");
  }
  target.replaceChildren(flow);
  return flow;
}
