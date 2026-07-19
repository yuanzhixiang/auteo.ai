# src/main/index.ts 规格

## 职责

Electron 主进程入口：应用生命周期与主窗口创建。

## 行为

- 创建 1200×800 主窗口，标题 Auteo
- webPreferences 安全基线：`contextIsolation: true`、`nodeIntegration: false`、`sandbox: false`（preload 后续需要 `webUtils.getPathForFile`，sandbox 必须关）
- 开发模式加载 `ELECTRON_RENDERER_URL`（electron-vite dev server），生产加载 `out/renderer/index.html`
- macOS 关窗不退出（`activate` 时重建窗口），其他平台全关即退出

## 待扩展（后续步骤）

- `auteo-media://` custom protocol 注册（播放器步骤）
- IPC 注册入口（`src/main/ipc.ts`）
