# src/main/asr.ts 规格

## 职责

火山引擎「录音文件极速版（flash）」ASR 客户端：上传音频、把响应映射为 shared 的 `Transcript`。

## 协议要点（2026-07-19 实测）

- `POST https://openspeech.bytedance.com/api/v3/auc/bigmodel/recognize/flash`，同步返回（220s 音频约 5s）
- Headers：`X-Api-Key`（用户配置的 key，来自 settings）、`X-Api-Resource-Id: volc.bigasr.auc_turbo`、`X-Api-Request-Id: randomUUID`、`X-Api-Sequence: -1`
- Body：`audio.data` 为 base64 mp3（16k mono，来自 ffmpeg.extractAudio）；`request` 开启 itn/punc/speaker_info/show_utterances
- 成功判定：HTTP ok 且 header `X-Api-Status-Code === '20000000'`
- 响应 `result.utterances[].words[]` 为词级毫秒时间戳；`confidence` 恒 0 不可用（`suspect` 固定 false，留给后续 LLM 后处理）；说话人在 `utterances[].additions.speaker`

## 错误分类（消息前缀即协议，renderer 依赖）

- `API_KEY_MISSING`（ipc 层，key 未配置）/ `API_KEY_INVALID`（401/403 或消息含 auth/key/forbidden）→ UI 引导去设置页
- `NETWORK`（fetch 抛错）→ 可重试
- `ASR_FAILED`（其他非成功状态、空 utterances）

## 已知限制（plan 非目标）

- 单请求 base64 直传适用于常规长度；超长音频（>1h 量级）的上限未实测，超限需走"抽音轨传对象存储 + 大模型版异步接口"备用链路
