import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const src = readFileSync(resolve("examples/myloveday-demo/assets/phone-flags/flags.css"), "utf8");

const header = `.iti__flag-box {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 15px;
  overflow: hidden;
  flex-shrink: 0;
}

.iti__flag-box .iti__flag {
  margin-right: 0;
}

.iti__flag {
  display: inline-block;
  width: 20px;
  height: 15px;
  box-shadow: 0 0 1px 0 #888;
  background-image: url("img/flags.png");
  background-repeat: no-repeat;
  background-color: #dbdbdb;
  background-position: 20px 0;
  vertical-align: middle;
  box-sizing: content-box;
}

@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .iti__flag {
    background-size: 5652px 15px;
    background-image: url("img/flags@2x.png");
  }
}
`;

const widthRules = [...src.matchAll(/  \.iti__flag\.iti__(?:be|ch|mc|ne|np|va)\s*\{[^}]+\}/g)].map((match) => match[0].trim());
const countryRules = [...src.matchAll(/  \.iti__flag\.iti__[a-z]{2}\s*\{[^}]+\}/g)].map((match) => match[0].trim());

writeFileSync(
  resolve("examples/myloveday-demo/assets/phone-flags/sprite-positions.css"),
  `${header}\n${widthRules.join("\n")}\n${countryRules.join("\n")}\n.iti__flag.iti__np {\n  background-color: transparent;\n}\n`,
);
