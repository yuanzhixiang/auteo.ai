# src/main/settings.ts 规格

## 职责

应用设置的唯一读写入口。存储位置 `userData/settings.json`。

## 行为

- API key 用 Electron `safeStorage.encryptString` 加密后以 base64 存入 JSON；读取时解密。**落盘文件不含明文**（已用冒烟测试验证往返与非明文）
- `getApiKey()` 返回明文，仅供主进程内部（ASR 调用）使用，禁止跨 IPC 发给 renderer
- `getStatus()` 返回 `{ hasApiKey, apiKeyTail }` 供 UI 展示
- 空 key、safeStorage 不可用（如无钥匙串的 Linux 环境）时抛出可读错误

## 已知行为

- macOS 首次访问 safeStorage 可能触发钥匙串授权弹窗，属预期
- 解密失败（如更换系统钥匙串）按"未配置"处理，用户重新粘贴即可
