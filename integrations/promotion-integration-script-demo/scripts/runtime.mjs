const state = window.PromotionIntegrationDemo || { stages: [] };
state.stages.push("runtime");
window.PromotionIntegrationDemo = state;
window.dispatchEvent(new CustomEvent("promotion-integration-demo:ready", {
  detail: { stages: [...state.stages] }
}));
