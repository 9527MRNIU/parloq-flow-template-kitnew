# 推广模板与集成套件

这个仓库用于制作可以导入推广管理系统的模板和集成包。

如果你要制作一个新的推广落地页，直接从现有模板复制一份，修改页面样式、图片、
文案和语言包，然后运行校验与构建命令，即可得到系统能够导入的 ZIP。

## 快速开始

需要 Node.js 22 或更高版本。

```bash
npm ci
npm run ci
npm run preview
```

打开 `http://127.0.0.1:4174` 可以预览默认白标模板，并切换手机、平板、桌面尺寸，
语言以及账号关联过程中的不同状态。语言默认使用“自动识别”，预览环境不会创建真实账号。

## 选择一个模板作为起点

仓库提供两个基础模板：

- `themes/white-label-account-link`：完整的白标账号关联模板，包含十五种语言；
- `examples/promotion-template-minimal`：只保留核心结构的最小示例，适合学习目录和组件用法。

正式制作新模板时，建议复制白标模板：

```bash
cp -R themes/white-label-account-link themes/your-template-name
```

模板目录名称使用小写英文，多个单词用连字符连接，例如
`summer-campaign-account-link`。

## 模板目录结构

一个完整的 v3 模板通常包含：

```text
themes/your-template-name/
├── manifest.json
├── index.html
├── README.md
├── assets/
│   ├── account-link-elements.js
│   ├── theme.css
│   └── images/
└── locales/
    ├── en.json
    ├── zh-CN.json
    └── ...
```

- `manifest.json`：模板版本、入口、语言和组件契约；
- `index.html`：页面结构和标准账号关联组件；
- `assets/theme.css`：模板样式；
- `assets/account-link-elements.js`：构建生成的标准组件，不要手工修改；
- `assets/images`：模板自己的图片等静态资源；
- `locales`：每种语言对应的文案；
- `README.md`：仅供开发者阅读，打包时不会进入 ZIP。

## 第一步：修改模板清单

新模板必须使用 `promotion-template/v3`：

```json
{
  "schema": "promotion-template/v3",
  "version": "1.0.0",
  "name": "新的推广模板",
  "description": "说明这个模板的用途、视觉特点和适用场景。",
  "entry": "index.html",
  "format": "static-bundle",
  "capabilities": ["phone-pairing"],
  "runtime": "promotion-browser-bridge/v2",
  "requirements": {
    "pairingContract": "promotion-public-pairing/v1"
  },
  "components": {
    "contract": "account-link-elements/v1",
    "entry": "assets/account-link-elements.js"
  },
  "interactionProtection": "platform",
  "defaultLocale": "en",
  "supportedLocales": [
    "en",
    "zh-CN",
    "hi",
    "id",
    "pt-BR",
    "es",
    "ru",
    "ur",
    "de",
    "tr",
    "ar",
    "fa",
    "bn",
    "it",
    "fr"
  ],
  "i18n": {
    "mode": "bundled",
    "path": "locales/{locale}.json",
    "fallbackLocale": "en"
  }
}
```

修改时重点关注：

- `version` 是模板自身版本，也是最终 ZIP 文件名中的版本；
- `name` 为 1–120 个字符，正式模板使用自然中文展示名称；
- `description` 最多 2000 个字符，说明用途和差异；
- `defaultLocale` 和 `fallbackLocale` 必须出现在 `supportedLocales` 中；
- `supportedLocales` 中的每种语言都必须存在对应 JSON 文件。

## 第二步：修改页面结构

`index.html` 必须加载模板自带的组件脚本：

```html
<script src="assets/account-link-elements.js" defer></script>
```

账号关联功能使用下面这套标准组件结构：

```html
<account-link-flow>
  <phone-number-field></phone-number-field>
  <account-link-submit></account-link-submit>
  <pairing-code-panel></pairing-code-panel>
  <app-launch-actions></app-launch-actions>
  <account-link-status></account-link-status>
  <account-initialization-status></account-initialization-status>
</account-link-flow>
```

系统会根据访问者环境解析语言并通过运行时配置注入模板，因此一般不需要在页面中放置
`account-link-locale-switcher`。只有产品明确要求用户手动切换语言时，才把该组件加入结构。

不要删除或自行实现上述账号关联功能组件。模板主要修改组件外层布局、背景、品牌视觉、图片、
文案，以及通过 CSS 变量和 `::part()` 调整组件样式。

## 第三步：修改样式、图片和文案

可以修改：

- 页面背景、卡片布局、间距、颜色、圆角和阴影；
- 模板自己的图片、图标和字体；
- `locales/*.json` 中用户能看到的文案；
- 标准组件公开的 CSS 变量和 `::part()` 样式。

需要遵守：

- 所有图片、字体、CSS 和 JavaScript 都必须放在模板 ZIP 内，不能引用外部资源；
- 不要在模板中写平台 API 地址、网关地址、访问令牌或协议节点标识；
- 模板只能通过系统注入的 `window.PromotionBridge` 发起账号关联；
- 用户可见的电话号码不显示开头的加号；
- 阿拉伯语、波斯语和乌尔都语必须保留 RTL 排版；
- 公开模板必须保持白标，不能出现控制面产品名称。

## 第四步：登记正式模板

如果模板需要成为仓库正式产物，在 `artifacts/catalog.json` 中新增一条
`kind: "template"` 记录：

```json
{
  "sequence": "0002",
  "kind": "template",
  "slug": "your-template-name",
  "source": "themes/your-template-name",
  "manifest": "manifest.json",
  "outputDirectory": "themes"
}
```

模板和集成分别独立编号，并且都从 `0001` 开始。新增模板使用模板类型中的下一个
可用四位编号；已经分配的编号不能因为改名、移动目录或升级版本而改变。

登记后运行：

```bash
npm run sync:components
```

这个命令会为所有已登记的 v3 模板生成一致的
`assets/account-link-elements.js`。该文件由仓库统一维护，不应在单个模板中手工修改。

## 第五步：校验模板

校验指定模板：

```bash
node packages/cli/src/index.mjs template validate themes/your-template-name
```

提交前运行完整检查：

```bash
npm run ci
```

校验会检查：

- `manifest.json` 是否符合 v3 契约；
- HTML 是否加载并使用标准组件；
- 语言文件是否完整；
- 路径、文件类型和 ZIP 大小是否安全；
- 是否存在外部资源、源码映射、敏感信息或平台直连代码；
- 组件文件是否与仓库统一版本一致；
- 最终 ZIP 是否可以稳定复现。

## 第六步：构建可导入 ZIP

```bash
npm run build
```

正式模板 ZIP 会生成在 `dist/themes`，例如：

```text
dist/themes/0001-white-label-account-link-1.6.0.zip
dist/themes/0002-your-template-name-1.0.0.zip
```

文件名格式为：

```text
四位模板编号-小写连字符名称-模板自身版本.zip
```

系统可以通过两种方式导入：

1. 在模板管理页面手动上传 `dist/themes` 中的 ZIP；
2. 在系统中配置本 GitHub 仓库，由系统读取 `artifacts/catalog.json` 和模板源码目录，
   检测版本及内容变化后导入。

无论使用哪种方式，最终都会经过同一套 ZIP 大小、安全和契约校验。

## 模板包限制

- ZIP 最大 20 MB；
- 解压后最大 50 MB；
- 最多 500 个文件；
- 单个文件最大 5 MB；
- 必须包含一个 `index.html` 和一个 `manifest.json`；
- 必须包含 `manifest.components.entry` 指定的组件脚本；
- 禁止绝对路径、目录穿越、符号链接、重复路径和不支持的文件类型。

## 集成包

这个仓库也支持 script 和 iframe 集成包。集成包使用 `integration.json` schema
version `1`，与模板使用独立编号。iframe 集成必须由包自身提供一个 HTML/HTM
入口，平台不会为纯 JavaScript 集成自动生成 iframe 页面。

相关示例：

- `examples/promotion-integration-script-demo`
- `examples/promotion-integration-iframe-demo`
- `examples/promotion-integration-feedback-demo`
- `integrations/device-callback-adapter`

详细规则见 `docs/promotion-integration-v1.md`。

## 常用命令

```bash
# 安装锁定版本的依赖
npm ci

# 校验默认模板和全部集成
npm run validate

# 同步正式模板的标准组件
npm run sync:components

# 构建全部正式 ZIP
npm run build

# 校验构建目录和 SHA-256
npm run verify:dist

# 运行完整 CI 检查
npm run ci

# 启动默认白标模板预览
npm run preview
```
