# src/shared/types.ts 规格

## 职责

main / preload / renderer 三方共享的类型契约。shared 代码不得依赖 Node 或 DOM 特有 API。

## 当前内容

- `SettingsStatus`：`{ hasApiKey, apiKeyTail }`——renderer 只能看到"是否已配置 + 尾 4 位"，**明文 key 永不进 renderer**
- `AuteoApi`：preload 暴露给 renderer 的完整 API 面（`window.auteo`），preload 实现、renderer 消费

## 待扩展（后续步骤）

- `Word { word, start, end, speakerId?, suspect }` / `Utterance` / `Transcript`（词级毫秒时间戳一等公民；`suspect` 本轮恒 false，由后续 LLM 后处理产生）
- 转写进度事件、SRT 导出等 IPC 载荷类型
