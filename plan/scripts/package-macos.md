# macOS 打包脚本规格

## 脚本职责

`scripts/package-macos.sh` 在 macOS 上将 release 构建组装为标准 `.app`，生成多尺寸 `.icns` 图标，执行代码签名，并创建可拖入 Applications 的压缩 DMG。

## 输入

- 版本号来自 `Cargo.toml`。
- 架构来自当前 macOS 构建机器。
- 图标源文件为 `assets/app-icon.png`。
- `CODESIGN_IDENTITY` 可选；未设置时使用 ad-hoc 签名 `-`。

## 输出

- 应用包输出为 `dist/Auteo.app`。
- 安装镜像输出为 `dist/Auteo-<版本>-macos-<架构>.dmg`。
- DMG 包含 Auteo 应用和指向 `/Applications` 的快捷方式。

## 处理流程

1. 验证当前系统为 macOS，并清理上一次打包暂存目录。
2. 执行 Cargo release 构建。
3. 从品牌源图生成 macOS 图标集和 `.icns` 文件。
4. 复制可执行文件、资源和应用元数据，并同步 Cargo 版本号。
5. 使用指定身份签名并执行严格签名校验。
6. 生成压缩 DMG 并报告输出路径。

## 安全与分发约束

- ad-hoc 签名只用于本地安装和测试，不能替代 Developer ID 签名与 Apple 公证。
- 脚本不读取、保存或上传 Apple 凭据。
- 面向外部用户发布时，调用方负责提供有效签名身份并完成后续公证。

## 边界与失败行为

- 非 macOS 平台立即失败，不产生伪 macOS 安装包。
- 构建、图标生成、签名或 DMG 创建任一步失败时立即终止并返回非零状态。
- `dist/` 和打包暂存目录不纳入 Git。
