import * as flags from "country-flag-icons/string/3x2";
import type { CountryCode } from "libphonenumber-js/min";

const flagByCode = flags as Record<string, string>;

export const countryFlagSvg = (code: CountryCode) => flagByCode[code] || "";

export const countryFlagHtml = (code: CountryCode) => {
  const svg = countryFlagSvg(code);
  return svg ? `<span class="flag" part="country-flag" aria-hidden="true">${svg}</span>` : "";
};
