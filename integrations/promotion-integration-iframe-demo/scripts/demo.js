(function () {
  document.documentElement.dataset.integrationReady = "true";
  document.querySelector("#load-status").textContent = "初始化完成";
  window.dispatchEvent(new CustomEvent("integration:ready", {
    detail: { mode: "iframe" }
  }));
})();
