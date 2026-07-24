# Logcut

Logcut is an AI video editor from [logcut.com](https://logcut.com). This repository contains the
Electron + TypeScript desktop application. The current milestone is the end-to-end skeleton of
the subtitle proofreading workbench: drop a video, extract audio locally with the bundled
ffmpeg, transcribe it with Volcano Engine ASR, browse the utterance list synced with playback,
and export SRT.

## Development

```bash
npm install
npm run dev
```

`npm run dev` starts electron-vite with hot reload for the renderer and automatic restarts for
the main process.

During development, if no self-built ffmpeg exists under `vendor/ffmpeg/`, the app falls back
to the `ffmpeg` found on `PATH` (for example a Homebrew build). That fallback is for local
development only — system builds are usually GPL-enabled and must never be shipped.

## ffmpeg sidecar

Logcut ships a self-built LGPL-only ffmpeg as a separate sidecar binary:

```bash
./scripts/build-ffmpeg-macos.sh   # builds into vendor/ffmpeg/darwin-arm64/
```

The Windows binary is built by the `ffmpeg` GitHub Actions workflow (MSYS2, MediaFoundation
encoders). Both artifacts are published as GitHub Release assets together with `SOURCES.md`,
which fulfils the LGPL source-offer obligation.

## Packaging

```bash
npm run build
npx electron-builder --mac dmg --arm64   # unsigned local build
```

CI packaging for macOS and Windows lives in `.github/workflows/package.yml`.

## License

Logcut is licensed under the [Apache License 2.0](LICENSE). Runtime npm dependencies are
restricted to permissive licenses (MIT/ISC/BSD/Apache-2.0), enforced by the license-check
workflow. The bundled ffmpeg sidecar is an LGPL build distributed as a separate program with
its own license texts and source references.
