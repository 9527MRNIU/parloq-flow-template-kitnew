(() => {
  const PREFERRED_COUNTRIES = ["US", "GB", "CA", "AU", "IN", "BR", "DE", "FR", "ES", "JP", "KR", "CN"];
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

  function applyLandingCopy() {
    const button = document.getElementById("downloadButton");
    if (!button) return;
    button.style.setProperty("--btn-text", `"${readCtaCopy()}"`);
  }

  function duplicateThumbnails() {
    const container = document.querySelector(".thumbnails-container");
    if (!container || container.dataset.duplicated === "true") return;
    [...container.querySelectorAll(".thumbnail")].forEach((node) => {
      container.appendChild(node.cloneNode(true));
    });
    container.dataset.duplicated = "true";
  }

  function openLoginOverlay() {
    const overlay = document.getElementById("main-container");
    if (!overlay) return;
    overlay.style.display = "flex";
    document.body.classList.add("login-open");
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

  function ensureCountryPickerOverlay() {
    let overlay = document.getElementById("country-picker-overlay");
    if (overlay) return overlay;

    overlay = document.createElement("div");
    overlay.id = "country-picker-overlay";
    overlay.hidden = true;
    overlay.addEventListener("pointerdown", (event) => {
      if (event.target !== overlay) return;
      event.preventDefault();
      const field = document.querySelector("phone-number-field");
      field?.shadowRoot?.querySelector(".trigger")?.click();
    });
    document.body.appendChild(overlay);
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
    });
  }

  function setupSubmitButton() {
    applySubmitCopy(readThemeCopy());
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

  function boot() {
    applyLandingCopy();
    duplicateThumbnails();
    watchPhoneField();
    watchSubmitButton();

    const overlay = document.getElementById("main-container");
    if (overlay) overlay.style.display = "none";

    document.getElementById("downloadButton")?.addEventListener("click", openLoginOverlay);
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
