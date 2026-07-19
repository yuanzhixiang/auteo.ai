# src/renderer/index.html 规格

renderer 入口 HTML。挂载点 `#root`，加载 `src/main.tsx`。CSP：`default-src 'self'`，`style-src` 允许 inline（Vite 注入），`media-src` 允许 `auteo-media:`（本地视频经 custom protocol 播放，播放器步骤启用）。
