<div align="center">
  <img src="assets/logo.svg" width="112" alt="LogCut logo">
  <h1>LogCut</h1>
  <p><em>The open source AI video editor — from log footage to final cut.</em></p>
  <p>
    <a href="https://logcut.com">logcut.com</a> ·
    <a href="https://x.com/LogCutHQ">X @LogCutHQ</a> ·
    <a href="https://www.youtube.com/@LogCutHQ">YouTube</a>
  </p>
  <p>
    <a href="LICENSE"><img src="https://img.shields.io/badge/license-Apache--2.0-blue" alt="License"></a>
    <a href="https://github.com/logcut/logcut/releases"><img src="https://img.shields.io/github/v/release/logcut/logcut" alt="Release"></a>
  </p>
</div>

LogCut is built on a simple idea: **editing video should feel like editing
text** — without giving up a real timeline, and without renting your own
footage back from someone else's cloud.

- **Text-based editing.** The transcript is the edit: cut a sentence and the
  timeline cuts with it; reorder paragraphs and the story reorders.
- **A real timeline underneath.** Text view and timeline are two views of the
  same cut, always in sync — write the story first, then polish the pictures
  with precise, multi-track editing.
- **Local-first and open source.** Your media stays on your disk. Features
  that need hosted AI processing are opt-in and clearly labeled, never the
  default.

## Status

LogCut is in early development, built in public. The current milestone is the
end-to-end skeleton of the subtitle proofreading workbench: drop a video,
extract audio locally with the bundled ffmpeg, transcribe it, browse the
utterance list synced with playback, and export SRT.

Transcription in this milestone uses a cloud ASR provider (Volcano Engine).
Cloud-dependent features will always be opt-in; local transcription is on the
roadmap.

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

LogCut ships a self-built LGPL-only ffmpeg as a separate sidecar binary:

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

LogCut is licensed under the [Apache License 2.0](LICENSE). Runtime npm dependencies are
restricted to permissive licenses (MIT/ISC/BSD/Apache-2.0/OFL for bundled fonts), enforced by
the license-check workflow. The bundled ffmpeg sidecar is an LGPL build distributed as a
separate program with its own license texts and source references.

---

LogCut is a product of Sigmify LLC.
