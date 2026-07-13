# Auteo

Auteo is an AI video editor from [auteo.ai](https://auteo.ai). This repository currently contains
the native desktop foundation built with GPUI and `gpui-component`.

The project is pinned to Rust 1.95. Cargo selects this toolchain automatically when it is
available locally.

## Run

```bash
cargo run
```

The first build downloads and compiles GPUI and its dependencies, so it takes noticeably longer
than subsequent builds.

## Package for macOS

```bash
./scripts/package-macos.sh
```

The package is written to `dist/Auteo-<version>-macos-<architecture>.dmg`. Open the DMG and drag
Auteo into Applications.

The script uses ad-hoc code signing by default, which is suitable for local installation and
testing. For distribution outside the development machine, provide a Developer ID Application
identity and notarize the resulting app with Apple:

```bash
CODESIGN_IDENTITY="Developer ID Application: Example Company (TEAMID)" \
  ./scripts/package-macos.sh
```
