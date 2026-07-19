#!/usr/bin/env bash
# Build the LGPL-only ffmpeg sidecar for macOS into vendor/ffmpeg/darwin-<arch>/.
#
# Licensing invariants:
#   - No --enable-gpl, no --enable-nonfree: the binary stays LGPL.
#   - Encoders come from system frameworks (VideoToolbox/AudioToolbox) plus
#     LGPL libmp3lame; no libx264/libx265.
#   - All third-party libraries are compiled statically from the pinned
#     tarballs in ffmpeg-sources.env and listed in the generated SOURCES.md.
#
# Build-time tools (Homebrew: autoconf automake pkg-config meson ninja) only
# affect the build environment, not the licensing of the produced binary.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=ffmpeg-sources.env
source "$ROOT/scripts/ffmpeg-sources.env"

ARCH="$(uname -m)"
BUILD="$ROOT/.ffmpeg-build/darwin-$ARCH"
DEPS="$BUILD/deps"
SRC="$BUILD/src"
OUT="$ROOT/vendor/ffmpeg/darwin-$ARCH"
JOBS="$(sysctl -n hw.ncpu)"

export PKG_CONFIG_PATH="$DEPS/lib/pkgconfig"
export MACOSX_DEPLOYMENT_TARGET=13.0

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
  ./configure --prefix="$DEPS" --disable-shared --enable-static \
    --disable-fontconfig > /dev/null
  make -j"$JOBS" > /dev/null
  make install > /dev/null
)

echo "==> lame $LAME_VERSION"
fetch "$LAME_URL" "lame-$LAME_VERSION.tar.gz"
(
  cd "$SRC/lame-$LAME_VERSION"
  # lame 3.100 ships a config.guess too old to recognise arm64-apple.
  ./configure --prefix="$DEPS" --disable-shared --enable-static \
    --disable-frontend --build="$([ "$ARCH" = arm64 ] && echo aarch64 || echo "$ARCH")-apple-darwin" > /dev/null
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
    --enable-libmp3lame --enable-videotoolbox --enable-audiotoolbox \
    --pkg-config-flags=--static \
    --extra-cflags="-I$DEPS/include" --extra-ldflags="-L$DEPS/lib" > /dev/null
  make -j"$JOBS" > /dev/null
  make install > /dev/null
)

cp "$BUILD/out/bin/ffmpeg" "$BUILD/out/bin/ffprobe" "$OUT/"
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
FF="$OUT/ffmpeg"

echo "--- dynamic libraries (must be system-only)"
if otool -L "$FF" | tail -n +2 | grep -vE '^\s+(/usr/lib/|/System/Library/)'; then
  echo "FAIL: non-system dynamic dependency found" >&2
  exit 1
fi

echo "--- license flags"
"$FF" -version | grep -q -- '--disable-gpl' || { echo 'FAIL: --disable-gpl missing' >&2; exit 1; }
"$FF" -version | grep -q -- '--enable-gpl' && { echo 'FAIL: GPL enabled' >&2; exit 1; }

echo "--- encoders"
"$FF" -hide_banner -encoders | grep -q h264_videotoolbox || { echo 'FAIL: h264_videotoolbox missing' >&2; exit 1; }
"$FF" -hide_banner -encoders | grep -q libmp3lame || { echo 'FAIL: libmp3lame missing' >&2; exit 1; }

echo "--- subtitles filter (libass)"
"$FF" -hide_banner -filters | grep -q subtitles || { echo 'FAIL: subtitles filter missing' >&2; exit 1; }

echo "OK: $OUT"
