# src/renderer/src/components/DropZone.tsx 规格

## 职责

Workbench 空状态：拖入视频文件，解析本地路径后上抛 `onSelect(videoPath)`。

## 行为

- 拖拽悬停高亮；只接受视频扩展名（mp4/mov/mkv/webm/m4v/avi），否则展示错误提示
- 路径解析必须走 `window.auteo.getPathForFile(file)`（preload 的 `webUtils.getPathForFile`；新版 Electron 无 `File.path`）
- 一次只取第一个文件

## 非目标

- 文件选择对话框入口（后续可加）；多文件批量
