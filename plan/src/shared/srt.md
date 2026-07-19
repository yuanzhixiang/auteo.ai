# src/shared/srt.ts 规格

## 职责

Transcript → SRT 的纯函数序列化（无 Electron/Node 依赖，唯一有单测的模块，`npm test`）。

## 格式约定

- 时间戳 `HH:MM:SS,mmm`（逗号毫秒，SRT 标准）
- 块结构：`序号(从1) \r\n 起 --> 止 \r\n 文本 \r\n`，块间空行
- **CRLF 行尾**（Windows 播放器兼容性最好）
- 文本用 utterance 级（ASR 已带标点），不做二次断行

## 验证记录（2026-07-19）

- 单测：时间戳补零/进位、双块序列化精确匹配
- 真实数据：220s 测试视频的 27 句转写序列化正确
- 烧录帧视觉验证待自建 ffmpeg（含 libass）完成后做——**Homebrew ffmpeg 8 不含 libass/subtitles filter**，dev 兜底无法验证烧录路径
