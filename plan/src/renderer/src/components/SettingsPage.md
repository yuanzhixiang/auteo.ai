# src/renderer/src/components/SettingsPage.tsx 规格

## 职责

API Key 配置页。用户在此粘贴火山引擎 API key，key 经 IPC 交主进程加密保存。

## 行为

- 加载时拉取 `SettingsStatus`，展示 `Configured (…尾4位)` / `Not configured` / `Checking…`
- 输入框为 `type="password"`；保存成功清空输入并刷新状态；失败展示主进程抛出的错误信息
- 空输入禁用保存按钮
- 提示文案说明：key 经系统钥匙串加密，仅用于调用转写 API

## 非目标

- key 有效性在线校验（转写链路的错误分类负责引导回设置页）
