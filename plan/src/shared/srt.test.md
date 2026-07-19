# src/shared/srt.test.ts 规格

`srt.ts` 的 node:test 单测（`npm test`，经 `--experimental-strip-types` 直接跑 TS，因此 import 需带 `.ts` 扩展、tsconfig 开 `allowImportingTsExtensions`）。覆盖：时间戳补零与时分秒进位、完整 SRT 块结构（CRLF、空行分隔、序号）。
