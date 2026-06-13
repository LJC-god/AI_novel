# Codex 执行提示词：继续完成 Epic 4-9

把下面这份文件作为 Codex 的下一阶段执行说明。当前前提：Epic 1、Epic 2、Epic 3 已完成。

---

## 给 Codex 的极简启动指令

```text
请读取 docs/CODEX_EXECUTION_PRD.md 和 docs/CODEX_EPIC4_9_PROMPT.md。Epic 1-3 已完成，请从 Epic 4 开始继续执行到 Epic 9。每完成一个 Epic，运行 pnpm run build，修复错误，更新 docs/CODEX_PROGRESS.md，并提交清晰 commit。不要重写项目，不要迁移框架，继续基于现有 Electron + Vue 3 + TypeScript + SQLite 架构增量开发。
```

---

## 全局规则

1. 不要重写项目，不要迁移框架，不要改成 Web。
2. 继续基于当前 Electron + Vue 3 + TypeScript + SQLite 架构增量开发。
3. 每完成一个 Epic，必须运行 `pnpm run build`。
4. build 失败必须先修复，再进入下一个 Epic。
5. 每完成一个 Epic，更新 `docs/CODEX_PROGRESS.md`。
6. 每完成一个 Epic，提交一个清晰 commit。
7. 所有 AI 输出必须结构化。
8. 所有关键创作步骤必须有人类审核。
9. 拆书只保留抽象风格、结构、节奏、卖点和规则，不允许复写参考作品原文。
10. 默认本地优先，云模型调用必须有用户授权。

---

## Epic 3 验收

先检查 Epic 3 是否真的完成：

1. 检查以下 AI TaskHandler 是否存在并已注册到 `electron/main/ai/tasks/index.ts`：
   - `zero-idea-cards`
   - `zero-idea-merge`
   - `style-fingerprint-normalize`
   - `style-fusion-project`
   - `title-synopsis-generate`
   - `master-outline-generate`
   - `volume-outline-generate`
   - `chapter-cards-generate`
   - `chapter-draft-v2`
   - `chapter-quality-audit`
   - `submission-package-generate`

2. 检查每个 handler 是否有：
   - `buildPrompt`
   - `normalize`
   - `validate`
   - `describeValidationErrors`
   - `outputType = json`
   - 对应结构化 schema

3. 运行 `pnpm run build`。
4. 如果失败，先修复 Epic 3，不要继续。
5. 更新 `docs/CODEX_PROGRESS.md`。

---

## Epic 4：IPC 与 preload API

目标：让前端可以调用零基础流程能力。

新增并注册这些 IPC：

- `characterarc:zero-workflow-state-get`
- `characterarc:zero-workflow-state-update`
- `characterarc:zero-ideas-generate`
- `characterarc:zero-idea-approve`
- `characterarc:zero-idea-merge`
- `characterarc:style-fingerprint-save`
- `characterarc:style-fusion-generate`
- `characterarc:title-synopsis-generate`
- `characterarc:title-synopsis-approve`
- `characterarc:master-outline-generate`
- `characterarc:master-outline-approve`
- `characterarc:chapter-cards-generate`
- `characterarc:chapter-card-approve`
- `characterarc:chapter-draft-v2`
- `characterarc:chapter-quality-audit`
- `characterarc:submission-package-generate`
- `characterarc:submission-package-export`

要求：

1. 可以拆出 `electron/main/zero-start/ipc.ts`，但必须在 `register-main-ipc.ts` 中注册。
2. preload 必须暴露 typed API 到 `window.characterArc`。
3. IPC 内部复用 `runAiTask`、zero-start repositories、`workflow_runs`、`workflow_run_steps`。
4. 所有长任务支持错误返回，不要让前端崩溃。
5. 如当前模型 `baseUrl` 不是 `localhost` / `127.0.0.1`，且项目 `cloud_allowed = 0`，则返回 `requireCloudConsent`，让前端二次确认。
6. 运行 `pnpm run build`。
7. 更新 `docs/CODEX_PROGRESS.md`。
8. commit：`feat(ipc): expose zero-start workflow api`

---

## Epic 5：前端零基础流程

目标：用户只选题材和篇幅，就能进入灵感审核流程。

新增目录：

```text
renderer/src/features/zeroStart/
```

新增组件：

- `ZeroStartWizard.vue`
- `IdeaCardGrid.vue`
- `IdeaReviewPanel.vue`
- `StyleFingerprintPanel.vue`
- `StyleFusionPanel.vue`
- `TitleSynopsisReviewPanel.vue`
- `MasterOutlineReviewPanel.vue`
- `ChapterCardBoard.vue`
- `ChapterQualityPanel.vue`
- `SubmissionPackagePanel.vue`

新增 composables：

- `useZeroWorkflow.ts`
- `useIdeaCards.ts`
- `useStyleFingerprints.ts`
- `useTitleSynopsis.ts`
- `useChapterCards.ts`
- `useSubmissionPackage.ts`

新增 store：

- `renderer/src/stores/zeroStart.ts`

功能要求：

1. `ProjectCenter` 增加“零基础创建”和“高级创建”入口。
2. 零基础创建不要求填写书名、简介、主角、世界观。
3. 表单字段：题材、篇幅、平台倾向、读者向、风格倾向、可选一句话想法、是否允许云模型。
4. 点击“生成灵感卡”调用 `characterarc:zero-ideas-generate`。
5. 展示 5-8 张灵感卡。
6. 灵感卡支持：喜欢、拒绝、设为主方案、合并、局部改写、重生成类似方向。
7. 审核通过后进入拆书/风格步骤。
8. 若用户跳过拆书，使用默认系统风格卡。
9. 书名简介、大纲、章节卡都必须有审核按钮。
10. 每个阶段显示“当前阶段”和“下一步”。
11. 运行 `pnpm run build`。
12. 更新 `docs/CODEX_PROGRESS.md`。
13. commit：`feat(ui): add zero-start guided workflow`

---

## Epic 6：拆书风格卡与风格融合

目标：让拆书结果成为后续生成的强约束。

完成：

1. 复用现有参考小说导入能力，支持 `txt`、`md`、`docx`、批量导入、进度事件。
2. 导入后生成 `StyleFingerprint`。
3. 保存到 `style_fingerprints` 表。
4. `StyleFingerprintPanel` 支持查看、编辑、审核通过、归档。
5. `StyleFusionPanel` 支持选择多个风格卡融合。
6. 融合后生成项目主风格。
7. 项目主风格写入 `project_workflow_state.approved_style_id`。
8. `title-synopsis`、`outline`、`chapter-card`、`chapter-draft` 必须注入 approved style。
9. Prompt 中必须包含 `avoidRules`。
10. 不要把参考书大段原文直接传给章节正文生成任务。
11. UI 必须提示：请确保参考作品有合法使用权，系统只提取抽象风格，不复写原文。
12. 运行 `pnpm run build`。
13. 更新 `docs/CODEX_PROGRESS.md`。
14. commit：`feat(style): add fingerprint approval and fusion`

---

## Epic 7：大纲、章节卡、正文与质量报告

目标：把章节生成升级为“章节卡驱动 + 一致性记忆 + 质量报告”。

完成：

1. `master-outline-generate` 生成 `outline_snapshots`。
2. `master-outline-approve` 将快照标记为 approved。
3. `chapter-cards-generate` 按卷生成 `chapter_cards`。
4. `chapter-card-approve` 标记章节卡 approved。
5. `chapter-draft-v2` 生成正文前读取：
   - `chapter_card`
   - approved style
   - approved synopsis
   - master outline
   - story state
   - recent chapter summaries
   - hybrid retrieval semantic segments
   - knowledge documents
6. 正文生成后：
   - 写入 `chapters`
   - 写入 `chapter_versions`
   - 调用现有 post-generation pipeline 更新 story state
   - 调用 `chapter-quality-audit`
   - 保存 `chapter_quality_reports`
7. `ChapterStudioPage` 右栏新增 `ChapterQualityPanel`。
8. 如果 quality report 有 critical issue，UI 显示明显警告，但不强制阻止用户继续。
9. 支持“应用修改建议”或“按建议重写”。
10. 运行 `pnpm run build`。
11. 更新 `docs/CODEX_PROGRESS.md`。
12. commit：`feat(chapter): generate drafts from approved chapter cards`

---

## Epic 8：投稿包导出

目标：生成可人工提交到番茄等平台的投稿包。不要做自动登录、自动投稿。

完成：

1. `submission-package-generate` 生成：书名、简介、标签、卖点、全书大纲、章节目录、正文、质量报告、平台风险提示、投稿清单。
2. `submission-package-export` 导出文件夹：

```text
submission-package/
├── 00_投稿清单.md
├── 01_书名与简介.md
├── 02_标签与卖点.md
├── 03_全书大纲.md
├── 04_章节目录.md
├── 05_正文.txt
├── 05_正文.docx
├── 06_质量报告.json
├── 07_平台风险提示.md
└── project-snapshot.json
```

3. 保存 `submission_packages` 表。
4. 导出前检查：书名、简介、标签、前三章强事件、章节字数稳定性、critical issue、版权/风格过近风险、人工确认状态。
5. 运行 `pnpm run build`。
6. 更新 `docs/CODEX_PROGRESS.md`。
7. commit：`feat(export): add submission package builder`

---

## Epic 9：模型角色、隐私和安全

目标：让本地模型和云模型稳定服务不同任务，同时保护隐私。

完成：

1. 设置页增加模型角色说明：
   - `ideation`：灵感发散
   - `planner`：大纲结构
   - `writer`：正文扩写
   - `auditor`：审稿检查
   - `embedding`：向量检索
   - `image`：封面/图片
2. 复用现有 `modelGroups` / `modelRoleProfileMap`。
3. 给 zero-start 新任务设置默认 modelRole：
   - `zero-idea-cards` → `ideation`
   - `title-synopsis-generate` → `planner`
   - `master-outline-generate` → `planner`
   - `chapter-cards-generate` → `planner`
   - `chapter-draft-v2` → `writer`
   - `chapter-quality-audit` → `auditor`
   - `submission-package-generate` → `auditor`
4. 本地 provider 判断：`baseUrl` 包含 `127.0.0.1`、`localhost`，或 provider 为 `ollama`。
5. 云模型调用前，如果项目未允许 `cloud_allowed`，则前端必须二次确认。
6. 不要记录完整 API Key 到日志。
7. AI Run 日志可记录 provider、model、usage，但不要输出密钥。
8. MVP 阶段至少在设置页提示 API Key 保存在本机；V1 再加入 Electron safeStorage。
9. 运行 `pnpm run build`。
10. 更新 `docs/CODEX_PROGRESS.md`。
11. commit：`feat(settings): add model roles and cloud consent`

---

## 最终验收

完成 Epic 4-9 后，做一次完整主流程手动验证：

1. 打开应用。
2. 点击零基础创建。
3. 只选择题材和篇幅。
4. 生成灵感卡。
5. 审核一张灵感卡。
6. 导入参考书或跳过拆书使用默认风格。
7. 生成/审核风格卡。
8. 生成/审核书名简介。
9. 生成/审核大纲。
10. 生成/审核章节卡。
11. 生成至少一章正文。
12. 查看质量报告。
13. 导出投稿包。
14. 确认旧项目仍可打开。
15. 运行 `pnpm run build`。

最后更新 `docs/CODEX_PROGRESS.md`，写明：

- Epic 4-9 完成情况
- 修改文件列表
- build 结果
- 手动验收结果
- 遗留问题
- 下一步优化建议

最后提交：

```text
feat(zero-start): complete guided novel creation workflow
```
