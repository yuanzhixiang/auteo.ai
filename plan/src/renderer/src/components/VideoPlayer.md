# src/renderer/src/components/VideoPlayer.tsx 规格

## 职责

薄封装的 `<video>` 播放器：接收 `auteo-media://` src，原生 controls，`timeupdate` 时把当前时间（毫秒）上抛。

## 行为

- `forwardRef` 暴露底层 `HTMLVideoElement`，父组件（App）持 ref 做命令式 seek（点句跳转）
- 不自持播放状态——播放/暂停/进度全部交给原生 controls 与父组件

## 非目标

- 字幕叠加层渲染（校对编辑轮次）、快捷键、倍速
