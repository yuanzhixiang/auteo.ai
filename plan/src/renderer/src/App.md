# src/renderer/src/App.tsx 规格

## 职责

应用根组件。目标形态为单窗口双视图：主视图（DropZone → 转写后 VideoPlayer + SubtitleList + Export SRT）与设置视图（SettingsPage），内部 state 切换，不引路由库。

## 当前状态

顶栏（品牌 + Workbench/Settings 切换）+ 主区域。Workbench 视图当前为拖入提示占位（拖拽步骤替换）；Settings 视图为 SettingsPage。

## 约束

- UI 文案一律英文（仓库语言约定）
