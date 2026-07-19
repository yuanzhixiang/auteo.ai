# .github/workflows/ffmpeg.yml 规格

## 职责

手动触发（workflow_dispatch，输入 release_tag 如 `ffmpeg-b1`）的双平台 ffmpeg sidecar 构建：macos-14（Apple Silicon）跑 build-ffmpeg-macos.sh，windows-latest + MSYS2 UCRT64 跑 build-ffmpeg-msys2.sh，各自完成脚本内自检后打 tar，publish job 汇总发布为 **GitHub Release**（附 SOURCES.md）。

## 关键决策

- 产物走 Release 而非 workflow artifact：artifact 90 天过期且跨 workflow 下载麻烦；Release 页同时承担 LGPL 源码对应关系的公示。package workflow 与本地开发统一用 `gh release download <tag>` 填充 `vendor/ffmpeg/`
- 源码 tarball 用 actions/cache 缓存，key = ffmpeg-sources.env 的 hash
