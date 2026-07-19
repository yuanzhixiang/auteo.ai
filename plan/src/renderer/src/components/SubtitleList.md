# src/renderer/src/components/SubtitleList.tsx 规格

## 职责

字幕句列表：展示 utterances（时间码 + 文本），点句上抛 `onSelect`（父组件 seek 并播放），高亮当前播放句。

## 行为

- `activeId` 由父组件根据播放时间计算传入；active 项变化时 `scrollIntoView({ block: 'nearest' })` 跟随
- 时间码格式 `MM:SS`
- 纯展示组件，不持有转写数据

## 非目标（校对编辑轮次）

- 逐句文本编辑、可疑词标红、快捷键流、虚拟化（当前数据量 27 句量级，先不虚拟化；长视频上千句时再引入）
