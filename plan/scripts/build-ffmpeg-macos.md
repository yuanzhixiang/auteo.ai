# scripts/build-ffmpeg-macos.sh 规格

## 职责

本地构建 macOS（当前架构）LGPL-only ffmpeg sidecar，输出 `vendor/ffmpeg/darwin-<arch>/{ffmpeg,ffprobe,COPYING.LGPLv2.1,SOURCES.md}`。

## 许可证不变量（红线）

- configure **不含 `--enable-gpl`/`--enable-nonfree`**（显式 `--disable-gpl --disable-nonfree`）
- 编码器：VideoToolbox/AudioToolbox（系统框架）+ libmp3lame（LGPL）；无 x264/x265
- 依赖链（freetype→fribidi→harfbuzz→libass→lame）全部按 ffmpeg-sources.env 固定版本**源码静态编译**，产物为单二进制
- libass `--disable-fontconfig`（macOS 走 CoreText）

## 构建环境

Homebrew 工具（只影响构建环境）：autoconf automake pkg-config meson ninja。arm64 无需 nasm。

## 踩坑记录（2026-07-19，均已固化进脚本）

1. lame 3.100 的 config.guess 太老不识别 arm64-apple → 显式 `--build=aarch64-apple-darwin`
2. `PKG_CONFIG_PATH` 会让 configure 自动探测到 Homebrew 的 SDL2/xcb/libunibreak 并动态链接（自检抓到）→ 改用 **`PKG_CONFIG_LIBDIR`** 把 pkg-config 锁死在 deps 前缀
3. LIBDIR 隔离后系统 zlib.pc 不可见，freetype2.pc 的 zlib 依赖导致 libass configure 失败 → freetype `--with-zlib=no` 用其内置 zlib
4. tar 重复解压不清理旧目录会让上一轮的生成物（旧 freetype2.pc 等）泄漏进下一轮 → fetch 改为**解压前删除源码目录**（幂等构建）
5. 自检必须在拷贝 vendor/ 之前跑，否则失败构建会把污染二进制留在 vendor

## 自检（任一失败即退出非零）

1. `otool -L` 仅允许 `/usr/lib`、`/System/Library` 前缀（无 Homebrew 动态依赖）
2. configuration 含 `--disable-gpl` 且不含 `--enable-gpl`
3. encoders 含 `h264_videotoolbox` 与 `libmp3lame`
4. filters 含 `subtitles`（libass 生效；注意 Homebrew ffmpeg 8 不带 libass，dev 兜底测不了烧录）

## 产物流转

本地开发直接产出到 `vendor/`；CI 场景由 `.github/workflows/ffmpeg.yml` 调用并发布 GitHub Release。
