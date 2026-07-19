# electron-builder.yml 规格

## 产品口径（自旧 Info.plist 迁移）

- 应用显示名：Auteo；App ID：`ai.auteo.app`
- macOS 分类 `public.app-category.video`，最低版本 13.0
- 图标源：`assets/app-icon.png`（1254×1254，electron-builder 自动转 icns/ico）
- 版本号唯一来源：`package.json` 的 `version`

## 打包内容

- `files`：`out/**` + `package.json`，显式排除 `node_modules/**`（React 已被 vite 打进 bundle，无运行时 node_modules 依赖）
- `extraResources`：按平台把 `vendor/ffmpeg/darwin-${arch}/` 或 `vendor/ffmpeg/win32-${arch}/` 拷到包内 `resources/ffmpeg/`——与 `src/main/ffmpeg.ts` 的打包查找路径 `process.resourcesPath/ffmpeg/` 对应；LGPL 文本与 SOURCES.md 随目录一同进包

## 打包目标

- macOS：dmg / arm64，不签名（CI 与本地设 `CSC_IDENTITY_AUTO_DISCOVERY=false`）；交付说明附右键打开 / `xattr -dr com.apple.quarantine` 指引
- Windows：NSIS oneClick / x64，不签名；交付说明附 SmartScreen "More info → Run anyway" 指引

## 非目标

- 代码签名与公证、自动更新（后续轮次）
