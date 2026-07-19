# scripts/build-ffmpeg-msys2.sh 规格

## 职责

在 MSYS2 UCRT64 环境（GitHub Actions windows runner）构建 Windows x64 LGPL-only ffmpeg sidecar，输出 `vendor/ffmpeg/win32-x64/{ffmpeg.exe,ffprobe.exe,COPYING.LGPLv2.1,SOURCES.md}`。

## 与 macOS 脚本的差异

- 编码器：`--enable-mediafoundation`（h264_mf/hevc_mf/aac_mf，系统组件）替代 VideoToolbox
- 链接：`-static -static-libgcc` + `--extra-libs=-lstdc++`（harfbuzz 为 C++），产物不依赖任何 MSYS2 运行时 DLL
- libass 在 Windows 走 DirectWrite 字体提供者（同样 `--disable-fontconfig`）
- 需要 nasm（x86 汇编）

## 自检

1. `ldd` 无 `ucrt64/bin` 依赖（只允许系统 DLL）——硬失败；非常见 DLL 打 WARN 供人工复核
2. `--disable-gpl` 存在、`--enable-gpl` 不存在
3. encoders 含 `h264_mf` 与 `libmp3lame`；filters 含 `subtitles`

## 已知限制

MF 编码器在 CI runner 上"能列出"即通过；实际硬件编码路径需真机验证（随 Ava 冒烟进行）。当前里程碑不烧录不编码，不阻塞。
