# src/main/ffmpeg.ts 规格

## 职责

ffmpeg sidecar 的唯一封装：二进制定位、进程调用、抽音轨。

## 二进制查找顺序（`resolveFfmpeg`）

1. **打包运行**：`process.resourcesPath/ffmpeg/ffmpeg(.exe)`——找不到抛硬错误，**绝不回退 PATH**（许可证红线：打包产物只能用自建 LGPL 构建）
2. **开发**：`vendor/ffmpeg/<platform>-<arch>/ffmpeg(.exe)`（自建产物，`gh release download` 填充）
3. **开发兜底**：PATH 中的系统 ffmpeg，`console.warn` 明示 "dev only, likely GPL build — never ship"

## 抽音轨（`extractAudio`）

- 命令：`-y -hide_banner -i <video> -vn -ac 1 -ar 16000 -c:a libmp3lame -b:a 48k <out>`（⇒ 自建 ffmpeg 必须含 libmp3lame）
- 输出：`temp/auteo/<sha1(路径)前16>.mp3`，调用方负责用后删除
- 失败时错误信息携带 stderr 尾部 2000 字符

## 验证记录（2026-07-19）

esbuild 单独打包本模块在 Electron 运行时对 220s HEVC 测试视频实测：产出 16kHz/mono/mp3，dev 兜底警告正常。

## 非目标（后续步骤）

- 波形峰值、proxy 转码、字幕烧录、导出 remux
