# .github/workflows/package.yml 规格

## 职责

手动触发（输入 `ffmpeg_tag`）的双平台应用打包：`gh release download` 拉取对应 tag 的 LGPL ffmpeg sidecar 解压进 `vendor/ffmpeg/` → `npm ci` → typecheck + test → `npm run build` → electron-builder 出 **不签名** 的 mac dmg（arm64）与 win NSIS 安装器（x64），上传为 workflow artifact。

## 约束

- ffmpeg 必须来自 ffmpeg workflow 发布的 Release（版本可追溯，许可证自检已在构建侧执行）
- 不签名是当前阶段的刻意选择；signing/公证接入时更新本文档与 electron-builder 规格
