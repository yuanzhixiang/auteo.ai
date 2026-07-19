# Auteo 产品与品牌规格

## 产品定位

Auteo 是 auteo.ai 的 AI 剪辑师产品。桌面应用面向需要借助 AI 完成素材理解、内容选择、节奏组织和视频成片的创作者。当前阶段的产品楔子是字幕校对台：先把"转写 → 校对 → 导出字幕"做深做透，再沿"去口癖 → 文本化剪辑 → 切片"的梯子演进。

## 品牌口径

- 产品名称统一写作"Auteo"，域名统一写作"auteo.ai"。
- 用户可见界面和源码内容使用英文，产品规格文档按仓库约定使用中文。
- 当前应用图标使用抽象 A、播放方向和剪辑切口组合形成的紫蓝渐变符号。

## 当前范围

- 当前阶段为 Electron + TypeScript 全链路骨架：拖入视频 → 本地 ffmpeg 抽音轨 → 火山引擎极速版转写 → 字幕句列表（点句跳转播放）→ 导出 SRT，以及 API Key 设置页。
- 校对编辑交互（改字、可疑词标红、快捷键流）为下一轮范围；当前阶段不宣称已提供完整的视频编辑、AI 处理或云端协作能力。
- 后续产品能力应按对应源码路径补充到 `plan/` 镜像文档。

## 平台与分发

- 桌面应用支持 macOS（Apple Silicon）与 Windows（x64）。应用名称为 Auteo，Bundle Identifier 为 `ai.auteo.app`，App Store 分类为 `public.app-category.video`，最低 macOS 13。
- 本地开发与早期种子用户分发允许不签名（macOS ad-hoc / Windows 无签名，需在交付说明中写明 SmartScreen 与隔离属性的处理方式）。
- 正式对外分发前必须使用 Apple Developer ID 签名并完成公证，Windows 侧使用代码签名证书。

## 开源许可与知识产权

- Auteo 自有源码统一采用 Apache License 2.0；当前版本尚未对外发布，不存在需要继续保留的旧版 MIT 授权。
- `LICENSE` 保存完整 Apache-2.0 条款，`package.json` 使用 `license` 字段声明相同协议。
- 仓库不额外维护 Apache-2.0 并未强制要求的 NOTICE、逐文件 SPDX 头、贡献协议或商标政策。

## 第三方许可证治理

- 运行时 npm 依赖（dependencies）只允许 MIT / ISC / BSD / Apache-2.0 等宽松许可证；GPL / AGPL / LGPL 一律禁用。CI 中的 license-check workflow 用 `license-checker --onlyAllow` 白名单强制执行，违规即构建失败。
- GPL/LGPL 能力（ffmpeg）只能以 sidecar 独立进程引入：自建 LGPL 构建（不含 `--enable-gpl` 组件），CLI 调用、不链接；随安装包附带许可证文本与源码获取方式（`SOURCES.md`）。
- 依赖发生变化时必须通过 license-check；白名单的每次扩充需人工审查并记录在 `plan/.github/workflows/license-check.md`。
- 安装包必须携带项目 LICENSE、ffmpeg 的 LGPL 文本与源码指引；Electron 自带的 `LICENSES.chromium.html` 随框架分发。
