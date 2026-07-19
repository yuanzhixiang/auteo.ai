# electron.vite.config.ts 规格

## 职责

electron-vite 三目标（main / preload / renderer）构建配置。

## 行为

- main、preload 使用默认约定：入口分别为 `src/main/index.ts`、`src/preload/index.ts`，输出 `out/main/`、`out/preload/`
- renderer 根目录为 `src/renderer/`（入口 `index.html`），启用 `@vitejs/plugin-react`（React Fast Refresh）

## 非目标

- 不做多窗口/多入口配置；不自定义 rollup 拆包（骨架阶段无需）
