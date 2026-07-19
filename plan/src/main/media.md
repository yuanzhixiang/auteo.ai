# src/main/media.ts 规格

## 职责

`auteo-media://` 自定义协议：让 renderer 在 `webSecurity` 开启下播放本地视频，带 Range/seek 支持与路径白名单。

## 安全模型

- `registerMediaPath(filePath)`：只有用户拖入过的路径进入白名单 map（uuid → path），renderer 拿到的是 `auteo-media://media/<uuid>`，无法访问任意文件
- 一票否决 `webSecurity: false`

## 实现要点（2026-07-19 实测踩坑记录）

1. **scheme 权限必须含 `standard: true`**（`registerSchemesAsPrivileged`，main/index.ts 中在 app ready 前声明）：只有 `stream: true` 时媒体栈对 Range 响应报 `PIPELINE_ERROR_READ: FFmpegDemuxer: data source error`
2. 文件字节经 `net.fetch(file://)` 读取——Chromium 文件加载器会执行 Range 但**总是返回裸 200 且无 Content-Range**，必须重新包装为规范 206（Accept-Ranges/Content-Range/Content-Length），否则 seekable 为空、seek 被钳到 0
3. **Range 响应用有界 buffer 而非流**：`protocol.handle` 中"流式 body + 显式 Content-Length"不可靠（同样触发 PIPELINE_ERROR_READ）；按 `MAX_CHUNK_BYTES = 8MB` 截断返回（HTTP 允许 206 少给，Chromium 自动续请求），内存有界
4. 起点越界返回 416 + `Content-Range: bytes */size`

## 验证记录

隐藏窗口冒烟：220s HEVC mp4 经协议播放，metadata 正常、seek 至 110s 成功、seekable 覆盖全片、Range 请求按块命中。
