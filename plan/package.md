# package.json 规格

## 职责

工程清单：脚本、依赖与许可证声明的唯一来源。`version` 是应用版本号的唯一来源（打包时由 electron-builder 读取）。

## 脚本

- `dev`：electron-vite 开发模式（renderer HMR，main/preload 改动自动重启）
- `build`：electron-vite 产物构建到 `out/`
- `typecheck`：对 node 侧（main/preload/shared）与 web 侧（renderer）分别跑 `tsc --noEmit`
- `test`：node:test 跑 `src/shared/*.test.ts`（`--experimental-strip-types`，Node 22 原生执行 TS，无需测试框架依赖）

## 依赖策略（许可证治理，见 plan/README.md）

- **runtime dependencies 仅 `react` + `react-dom`（MIT）**。HTTP 用原生 fetch、UUID 用 `crypto.randomUUID`、设置存储手写 JSON + Electron safeStorage——不引 HTTP 库、uuid、electron-store、路由、状态库、CSS 框架
- devDependencies 全部为 MIT/Apache-2.0（electron、electron-vite、vite、@vitejs/plugin-react、typescript、@types/*、electron-builder）
- 新增 runtime 依赖必须过 license-check 白名单（MIT/ISC/BSD/Apache-2.0）

## 约束

- 不设 `"type": "module"`：main/preload 以 CommonJS 产出（`__dirname` 可用，preload 兼容性最稳）
- `main` 指向 `./out/main/index.js`（electron-vite 输出约定）
