#!/usr/bin/env bash
# Build the LGPL-only ffmpeg sidecar for Windows x64 into vendor/ffmpeg/win32-x64/.
# Runs inside an MSYS2 UCRT64 shell (see .github/workflows/ffmpeg.yml for the
# toolchain packages). Same licensing invariants as build-ffmpeg-macos.sh; the
# only encoder differences are MediaFoundation (h264_mf/hevc_mf/aac_mf) in
# place of VideoToolbox/AudioToolbox.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=ffmpeg-sources.env
source "$ROOT/scripts/ffmpeg-sources.env"

BUILD="$ROOT/.ffmpeg-build/win32-x64"
DEPS="$BUILD/deps"
SRC="$BUILD/src"
OUT="$ROOT/vendor/ffmpeg/win32-x64"
JOBS="$(nproc)"

export PKG_CONFIG_PATH="$DEPS/lib/pkgconfig"

mkdir -p "$DEPS" "$SRC" "$OUT"

fetch() {
  local url="$1" name="$2"
  if [ ! -f "$SRC/$name" ]; then
    echo "==> Downloading $name"
    curl -L --fail --retry 3 -o "$SRC/$name" "$url"
  fi
  tar -xf "$SRC/$name" -C "$SRC"
}

echo "==> freetype $FREETYPE_VERSION"
fetch "$FREETYPE_URL" "freetype-$FREETYPE_VERSION.tar.xz"
(
  cd "$SRC/freetype-$FREETYPE_VERSION"
  ./configure --prefix="$DEPS" --disable-shared --enable-static \
    --with-harfbuzz=no --with-brotli=no --with-png=no --with-bzip2=no > /dev/null
  make -j"$JOBS" > /dev/null
  make install > /dev/null
)

echo "==> fribidi $FRIBIDI_VERSION"
fetch "$FRIBIDI_URL" "fribidi-$FRIBIDI_VERSION.tar.xz"
(
  cd "$SRC/fribidi-$FRIBIDI_VERSION"
  ./configure --prefix="$DEPS" --disable-shared --enable-static --disable-docs > /dev/null
  make -j"$JOBS" > /dev/null
  make install > /dev/null
)

echo "==> harfbuzz $HARFBUZZ_VERSION"
fetch "$HARFBUZZ_URL" "harfbuzz-$HARFBUZZ_VERSION.tar.xz"
(
  cd "$SRC/harfbuzz-$HARFBUZZ_VERSION"
  meson setup build --prefix="$DEPS" --default-library=static --buildtype=release \
    -Dfreetype=enabled -Dglib=disabled -Dgobject=disabled -Dcairo=disabled \
    -Dicu=disabled -Dtests=disabled -Ddocs=disabled -Dbenchmark=disabled \
    -Dintrospection=disabled > /dev/null
  ninja -C build > /dev/null
  ninja -C build install > /dev/null
)

echo "==> libass $LIBASS_VERSION"
fetch "$LIBASS_URL" "libass-$LIBASS_VERSION.tar.xz"
(
  cd "$SRC/libass-$LIBASS_VERSION"
  # DirectWrite is the font provider on Windows; fontconfig stays off.
  ./configure --prefix="$DEPS" --disable-shared --enable-static \
    --disable-fontconfig > /dev/null
  make -j"$JOBS" > /dev/null
  make install > /dev/null
)

echo "==> lame $LAME_VERSION"
fetch "$LAME_URL" "lame-$LAME_VERSION.tar.gz"
(
  cd "$SRC/lame-$LAME_VERSION"
  ./configure --prefix="$DEPS" --disable-shared --enable-static \
    --disable-frontend > /dev/null
  make -j"$JOBS" > /dev/null
  make install > /dev/null
)

echo "==> ffmpeg $FFMPEG_VERSION"
fetch "$FFMPEG_URL" "ffmpeg-$FFMPEG_VERSION.tar.xz"
(
  cd "$SRC/ffmpeg-$FFMPEG_VERSION"
  ./configure --prefix="$BUILD/out" \
    --disable-gpl --disable-nonfree \
    --disable-shared --enable-static \
    --disable-doc --disable-debug --disable-ffplay \
    --enable-libass --enable-libfreetype --enable-libharfbuzz --enable-libfribidi \
    --enable-libmp3lame --enable-mediafoundation \
    --pkg-config-flags=--static \
    --extra-cflags="-I$DEPS/include" \
    --extra-ldflags="-L$DEPS/lib -static -static-libgcc" \
    --extra-libs="-lstdc++" > /dev/null
  make -j"$JOBS" > /dev/null
  make install > /dev/null
)

cp "$BUILD/out/bin/ffmpeg.exe" "$BUILD/out/bin/ffprobe.exe" "$OUT/"
cp "$SRC/ffmpeg-$FFMPEG_VERSION/COPYING.LGPLv2.1" "$OUT/"

{
  echo "# ffmpeg sidecar sources"
  echo
  echo "This binary is an LGPL-only ffmpeg build. Corresponding sources:"
  echo
  echo "- ffmpeg $FFMPEG_VERSION — $FFMPEG_URL"
  echo "- freetype $FREETYPE_VERSION — $FREETYPE_URL"
  echo "- fribidi $FRIBIDI_VERSION — $FRIBIDI_URL"
  echo "- harfbuzz $HARFBUZZ_VERSION — $HARFBUZZ_URL"
  echo "- libass $LIBASS_VERSION — $LIBASS_URL"
  echo "- lame $LAME_VERSION — $LAME_URL"
} > "$OUT/SOURCES.md"

echo "==> Self checks"
FF="$OUT/ffmpeg.exe"

echo "--- dynamic libraries (system DLLs only, no MSYS2 runtime)"
if ldd "$FF" | grep -iv -E '(/c/windows|ntdll|kernel|msvcrt|advapi|ws2_32|user32|gdi32|ole32|oleaut32|shell32|shlwapi|bcrypt|crypt32|secur32|psapi|mf|d3d|dxgi|api-ms|ucrtbase|combase|rpcrt4|sechost|win32u|imm32|setupapi|version|winmm|avicap|vfw)'; then
  echo 'WARN: unexpected dynamic dependency above (verify manually)' >&2
fi
if ldd "$FF" | grep -qi 'ucrt64/bin'; then
  echo 'FAIL: MSYS2 runtime DLL dependency found' >&2
  exit 1
fi

echo "--- license flags"
"$FF" -version | grep -q -- '--disable-gpl' || { echo 'FAIL: --disable-gpl missing' >&2; exit 1; }
"$FF" -version | grep -q -- '--enable-gpl' && { echo 'FAIL: GPL enabled' >&2; exit 1; }

echo "--- encoders"
"$FF" -hide_banner -encoders | grep -q h264_mf || { echo 'FAIL: h264_mf missing' >&2; exit 1; }
"$FF" -hide_banner -encoders | grep -q libmp3lame || { echo 'FAIL: libmp3lame missing' >&2; exit 1; }

echo "--- subtitles filter (libass)"
"$FF" -hide_banner -filters | grep -q subtitles || { echo 'FAIL: subtitles filter missing' >&2; exit 1; }

echo "OK: $OUT"
