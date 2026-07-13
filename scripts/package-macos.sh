#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VERSION="$(sed -n 's/^version = "\([^"]*\)"/\1/p' "$ROOT_DIR/Cargo.toml" | head -n 1)"
ARCH="$(uname -m)"
APP_NAME="Auteo"
APP_DIR="$ROOT_DIR/dist/$APP_NAME.app"
CONTENTS_DIR="$APP_DIR/Contents"
ICONSET_DIR="$ROOT_DIR/target/package/Auteo.iconset"
DMG_STAGE_DIR="$ROOT_DIR/target/package/dmg"
DMG_PATH="$ROOT_DIR/dist/$APP_NAME-$VERSION-macos-$ARCH.dmg"
CODESIGN_IDENTITY="${CODESIGN_IDENTITY:--}"

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "macOS packaging must run on macOS." >&2
  exit 1
fi

rm -rf "$APP_DIR" "$ICONSET_DIR" "$DMG_STAGE_DIR"
mkdir -p "$CONTENTS_DIR/MacOS" "$CONTENTS_DIR/Resources" "$ICONSET_DIR" "$DMG_STAGE_DIR"

echo "Building Auteo $VERSION for $ARCH..."
cargo build --manifest-path "$ROOT_DIR/Cargo.toml" --release

echo "Creating the application icon..."
for size in 16 32 128 256 512; do
  sips -z "$size" "$size" "$ROOT_DIR/assets/app-icon.png" \
    --out "$ICONSET_DIR/icon_${size}x${size}.png" >/dev/null
  double_size=$((size * 2))
  sips -z "$double_size" "$double_size" "$ROOT_DIR/assets/app-icon.png" \
    --out "$ICONSET_DIR/icon_${size}x${size}@2x.png" >/dev/null
done
iconutil -c icns "$ICONSET_DIR" -o "$CONTENTS_DIR/Resources/Auteo.icns"

cp "$ROOT_DIR/target/release/auteo" "$CONTENTS_DIR/MacOS/Auteo"
cp "$ROOT_DIR/packaging/macos/Info.plist" "$CONTENTS_DIR/Info.plist"
/usr/libexec/PlistBuddy -c "Set :CFBundleShortVersionString $VERSION" "$CONTENTS_DIR/Info.plist"
/usr/libexec/PlistBuddy -c "Set :CFBundleVersion $VERSION" "$CONTENTS_DIR/Info.plist"

echo "Signing with identity: $CODESIGN_IDENTITY"
codesign --force --deep --sign "$CODESIGN_IDENTITY" --timestamp=none "$APP_DIR"
codesign --verify --deep --strict --verbose=2 "$APP_DIR"

cp -R "$APP_DIR" "$DMG_STAGE_DIR/"
ln -s /Applications "$DMG_STAGE_DIR/Applications"
rm -f "$DMG_PATH"
hdiutil create -quiet -volname "$APP_NAME" -srcfolder "$DMG_STAGE_DIR" \
  -ov -format UDZO "$DMG_PATH"

echo "Created $DMG_PATH"
