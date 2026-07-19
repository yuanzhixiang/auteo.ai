# scripts/ffmpeg-sources.env 规格

LGPL ffmpeg sidecar 的**版本与源码 URL 唯一清单**：ffmpeg 7.1.1 + freetype/fribidi/harfbuzz/libass/lame。macOS 与 MSYS2 两个构建脚本共同 source 此文件；产物旁的 SOURCES.md（LGPL 源码提供义务）由脚本从这里生成；CI 的源码缓存 key 也以此文件 hash 为准。升级任何组件版本 = 改这一个文件。
