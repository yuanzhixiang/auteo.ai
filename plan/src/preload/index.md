# src/preload/index.ts 规格

## 职责

renderer 与 main 之间唯一的桥：通过 `contextBridge.exposeInMainWorld('auteo', api)` 暴露白名单 API。renderer 不得以任何其他方式触达 Node/Electron 能力。

## 当前 API

- `getSettingsStatus()` / `setApiKey(key)`：设置通道，实现为 `ipcRenderer.invoke` 转发；API 面类型定义在 `src/shared/types.ts` 的 `AuteoApi`

## 约束与坑

- 新版 Electron 已移除 `File.path`，拖拽文件拿本地路径**必须**用 `webUtils.getPathForFile(file)`（后续拖拽步骤实现）；这要求 `sandbox: false`
- 导出 `AuteoApi` 类型供 renderer 侧声明 `window.auteo`
