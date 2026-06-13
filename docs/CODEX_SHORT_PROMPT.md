# Codex 短提示词

把下面这段复制给本地 Codex 即可：

```text
你现在位于仓库 LJC-god/AI_novel。本项目是 Electron + Vue 3 + TypeScript + SQLite 的本地 AI 小说创作桌面应用。

请先完整阅读 docs/CODEX_EXECUTION_PRD.md，然后按文档中的 Epic 0 → Epic 9 顺序开发，把当前 CharacterArc 升级为“零基础新人向 AI 小说创作桌面应用”。

核心产品主流程必须是：
题材/篇幅 → 灵感卡 → 用户审核 → 拆书风格卡 → 用户审核 → 书名简介 → 用户审核 → 大纲 → 用户审核 → 章节卡 → 正文 → 质量报告 → 修改 → 投稿包导出。

最高规则：
1. 不要重写整个项目，不要迁移框架，不要把 Electron 改成 Web。
2. 必须增量复用现有架构：workspace-store.ts、register-main-ipc.ts、ai/runtime、ai/tasks、shared-types.ts、renderer/src/pages、renderer/src/stores。
3. 所有新增 AI 任务必须结构化输出，并具备 TaskHandler、Schema 校验、JSON 修复、AI Run 记录。
4. 所有关键创作阶段必须有人类审核节点，不能一键直接写完整本书。
5. 拆书只能提取抽象风格、节奏、结构和写作规则，不能复写参考作品原文。
6. 默认本地优先；正文、拆书资料、参考书、风格卡默认不上传。云模型调用必须经过用户确认。
7. 面向番茄等平台做投稿包导出和预检，但不要做自动投稿，也不要承诺收益。

执行方式：
1. 先运行 git status。
2. 创建分支：feature/zero-start-workflow。
3. 运行 pnpm install 和 pnpm run build。
4. 创建或更新 docs/CODEX_PROGRESS.md，记录 build 状态、已完成 Epic、阻塞问题和下一步。
5. 从 Epic 1 开始按顺序实现：数据库迁移 → 类型/Schema → AI 任务 → IPC/preload → 前端零基础流程 → 拆书风格融合 → 章节生成与质量报告 → 投稿包导出 → 模型角色和隐私。
6. 每完成一个 Epic，必须运行 pnpm run build，修复错误，更新 docs/CODEX_PROGRESS.md，并提交清晰 commit。

MVP 完成标准：
用户只选题材和篇幅即可生成灵感卡；可以审核灵感、风格、书名简介、大纲、章节卡；可以生成至少一章正文并看到质量报告；可以导出投稿包；旧项目不崩溃；pnpm run build 成功。

现在开始执行 Epic 0。
```
