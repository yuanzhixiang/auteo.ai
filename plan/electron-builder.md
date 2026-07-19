# electron-builder 打包配置规格

对应源文件：`electron-builder.yml`（尚未创建，将在打包步骤落地；本文档先行承载从旧 `packaging/macos/Info.plist` 迁移的产品口径）。

## 产品口径（自旧 Info.plist 迁移）

- 应用显示名：Auteo
- App ID / Bundle Identifier：`ai.auteo.app`
- macOS App Store 分类：`public.app-category.video`
- 最低 macOS 版本：13.0
- 应用图标源：`assets/app-icon.png`（1254×1254，electron-builder 自动生成 icns/ico）
- 版本号唯一来源：`package.json` 的 `version` 字段

## 打包目标

- macOS：dmg，arm64，不签名（`CSC_IDENTITY_AUTO_DISCOVERY=false`）；交付说明需包含 `xattr -dr com.apple.quarantine` 或右键打开的指引
- Windows：NSIS 安装器，x64，不签名；交付说明需包含 SmartScreen "More info → Run anyway" 指引

## 资源注入

- `extraResources`：`vendor/ffmpeg/<platform>-<arch>/` → 包内 `resources/ffmpeg/`（LGPL 自建 ffmpeg sidecar 与其 `COPYING.LGPLv2.1`、`SOURCES.md` 一同进包）

## 非目标

- 代码签名与公证（正式分发前另行处理）
- 自动更新（后续轮次）
