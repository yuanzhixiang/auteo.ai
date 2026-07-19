# tsconfig.json 规格

node 侧类型检查配置（main / preload / shared / electron.vite.config.ts）。`target ES2022`、`moduleResolution bundler`、`strict`、`noEmit`（转译由 electron-vite/esbuild 负责，tsc 只做检查）、`types: ["node"]`。web 侧见 [tsconfig.web.md](tsconfig.web.md)。
