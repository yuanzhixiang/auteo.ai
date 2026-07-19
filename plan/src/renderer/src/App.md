# src/renderer/src/App.tsx 规格

## 职责

应用根组件。目标形态为单窗口双视图：主视图（DropZone → 转写后 VideoPlayer + SubtitleList + Export SRT）与设置视图（SettingsPage），内部 state 切换，不引路由库。

## 当前状态

顶栏（品牌 + Workbench/Settings 切换）+ 主区域。Workbench 为四态状态机：idle（DropZone，拖入即触发转写）→ working（阶段提示，订阅 transcribe:progress）→ ready（左 VideoPlayer + 工具条，右 SubtitleList；点句 seek 并播放，timeupdate 反算当前句高亮）或 error（展示主进程错误；`API_KEY_` 前缀错误附"Open Settings"入口；均可 Retry / 换文件）。Settings 视图为 SettingsPage。

## 约束

- UI 文案一律英文（仓库语言约定）
