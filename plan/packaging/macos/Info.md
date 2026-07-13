# macOS 应用元数据规格

## 文件职责

`packaging/macos/Info.plist` 定义 Auteo macOS 应用包的系统元数据，供 Finder、Dock、Launch Services 和 Gatekeeper 识别。

## 产品口径

- 应用显示名、包名和可执行文件名统一为“Auteo”。
- Bundle Identifier 固定为 `ai.auteo.app`。
- 应用分类为视频类，最低系统版本为 macOS 13.0。
- 应用使用 `Auteo.icns` 作为安装后图标。

## 版本规则

- 模板包含仓库当前初始版本。
- 打包脚本必须使用 `Cargo.toml` 的 package version 覆盖短版本号和构建版本号，避免双处维护。

## 已知限制

- 当前未声明文件类型、URL Scheme、相机、麦克风、照片库或自动化权限。
- 新增媒体导入、录制或系统集成功能时，必须同步补充对应权限用途说明和行为规格。
