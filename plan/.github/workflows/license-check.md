# .github/workflows/license-check.yml 规格

## 职责

许可证门禁：push（main）与 PR 时扫描 **runtime dependencies**（`--production`），出现白名单以外的许可证（含 GPL/AGPL/LGPL/MPL/未知）即构建失败。

## 白名单与扩充流程

当前：`MIT; ISC; BSD-2-Clause; BSD-3-Clause; 0BSD; Apache-2.0`

扩充规则：license-check 变红且确认是误报/可接受宽松许可证（如 BlueOak-1.0.0、CC0-1.0、Unlicense、Python-2.0）时，人工审查后加入 `--onlyAllow` 并在下方审计记录追加一行。**GPL/AGPL/LGPL 永不加入**（理由见 plan/README.md 第三方许可证治理）。

## 审计记录

- 2026-07-19 初始白名单。当时 production 依赖 3 个包（react、react-dom、scheduler），全 MIT；本地已验证绿灯路径与门禁失败路径（exit 1）

## 说明

- devDependencies 不扫描：不进入分发产物（electron 本体按 builder 惯例在 devDeps，其 Chromium 第三方声明随 Electron 自带的 LICENSES.chromium.html 分发）
