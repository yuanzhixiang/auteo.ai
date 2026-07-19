# tsconfig.web.json 规格

renderer 侧类型检查配置（`src/renderer/src` + `src/shared`）。相比 node 侧增加 `jsx: react-jsx` 与 DOM lib；同样 `noEmit` 只做检查。shared 目录被两侧同时 include——shared 代码不得依赖 Node 或 DOM 任一侧特有 API。
