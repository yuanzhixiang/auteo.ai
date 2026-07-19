# src/main/ipc.ts 规格

## 职责

**全部** `ipcMain.handle` 的唯一注册点（`registerIpc()`，由 main/index.ts 在 whenReady 后调用）。新增 IPC 通道必须在此注册并同步更新本文档与 `plan/src/shared/types.md` 的 API 面。

## 当前通道

| 通道 | 语义 |
|---|---|
| `settings:get-status` | 返回 `SettingsStatus`（不含明文 key） |
| `settings:set-api-key` | 加密保存 API key |

## 待扩展（后续步骤）

- `transcribe:run` / `transcribe:progress`（转写链路）
- `export:srt`、`media:register`（导出与播放）
