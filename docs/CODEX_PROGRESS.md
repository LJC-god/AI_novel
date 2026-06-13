# Codex 执行进度

更新时间：2026-06-13

## 总体约束

- 严格按 `docs/CODEX_EXECUTION_PRD.md` 的 Epic 0 -> Epic 9 顺序执行。
- 不重写项目，不迁移框架；在现有 Electron + Vue 3 + TypeScript + SQLite 架构上增量开发。
- 必须复用现有 CharacterArc 架构：`workspace-store.ts`、`register-main-ipc.ts`、`ai/tasks`、`ai/runtime`、`shared-types.ts`、`ProjectWizardPage`、`ChapterStudioPage`、`DeconstructionLibraryPage`、`stores/app`。
- 核心主流程：题材/篇幅 -> 灵感卡 -> 用户审核 -> 拆书风格卡 -> 用户审核 -> 书名简介 -> 用户审核 -> 大纲 -> 用户审核 -> 章节卡 -> 正文 -> 质量报告 -> 修改 -> 投稿包导出。
- 每完成一个 Epic 必须运行 `pnpm run build`，修复或记录构建阻塞，更新本文件，并提交清晰 commit。

## Epic 0：基线确认

状态：完成

### 已执行任务

- Task 0.1：运行依赖安装。
  - 直接运行 `pnpm install` 时，本机 PATH 中没有 `pnpm`。
  - 已确认 Node.js `v22.18.0`、npm `10.9.3`、Corepack `0.33.0` 可用。
  - 尝试 `corepack enable pnpm` 时遇到 `EPERM: operation not permitted, open 'D:\apply\node\pnpx'`，因此本机无法写入全局 pnpm shim。
  - 使用仓库声明的包管理器版本执行等价安装：`corepack pnpm install`。
  - 结果：安装成功，使用 `pnpm v10.33.2`，lockfile 无需更新。
- Task 0.2：运行构建。
  - 命令：`corepack pnpm run build`。
  - 结果：构建成功。
  - 记录的非阻塞警告：`electron/main/ai/agent/tools/chapter-data-access.ts` 同时被动态导入和静态导入，Vite 提示动态导入不会移动到单独 chunk。
- Task 0.3：读取并确认关键架构。
  - `README.md`：确认当前项目定位为本地优先的 CharacterArc AI 小说创作桌面工作台，技术栈为 Electron + Vue 3 + TypeScript + SQLite + Pinia + Naive UI + TipTap。
  - `electron/main/workspace-store.ts`：确认 SQLite 初始化、迁移、项目/章节/知识库/AI run/session 等表维护集中在此，Epic 1 应在这里增量添加 ZeroStart DDL 和迁移入口。
  - `electron/main/ai/shared-types.ts`：确认 `AiTaskName`、AI 设置、任务 payload/result、运行元数据和流式事件类型集中在此，Epic 2 应扩展 ZeroStart 任务名与类型。
  - `electron/main/ai/tasks/index.ts`：确认现有 `TaskHandler` 注册表模式，Epic 3 应新增任务 handler 并在此注册。
  - `electron/main/register-main-ipc.ts`：确认主进程 IPC 入口和参考小说导入、workspace load/save、导出、技能包、章节提交等现有能力，Epic 4 应增量注册 `characterarc:zero-*` 相关 IPC。
  - `electron/main/ai/runtime`：确认 `runAiTask` / `streamAiTask`、prompt 构建、skill/knowledge 注入、结构校验和修复链路可复用。
  - `renderer/src/pages/ProjectWizardPage.vue`：确认现有项目向导可改造或作为 ZeroStart 入口参考。
  - `renderer/src/pages/ChapterStudioPage.vue`：确认页面壳挂载 `ChapterWorkspace`，章节卡和质量报告应深入接入章节工作区组件。
  - `renderer/src/pages/DeconstructionLibraryPage.vue`：确认页面壳承载知识中心，拆书风格卡和风格融合应复用参考作品/知识库能力。
  - `renderer/src/stores/app.ts`：PRD 中的 `stores/app` 实际为单文件 store，后续可扩展或新增 `zeroStart` store。
- Task 0.4：创建开发分支。
  - 当前分支：`feature/zero-start-workflow`。

### 验收结果

- 当前基线可构建。
- 构建命令：`corepack pnpm run build`。
- 构建状态：通过。
- 当前 ZeroStart 相关目录尚未存在：`electron/main/zero-start`、`renderer/src/features/zeroStart`、`renderer/src/stores/zeroStart.ts`、`renderer/src/pages/ZeroStartWizardPage.vue`。

## Epic 1：数据库迁移

状态：完成

### 已执行任务

- Task 1.1：在 `workspace-store.ts` 添加新增 DDL。
  - 新增 `electron/main/zero-start/schema.ts`，定义 PRD 要求的 ZeroStart SQLite schema。
  - 新增表：`project_workflow_state`、`inspiration_cards`、`style_fingerprints`、`title_synopsis_candidates`、`outline_snapshots`、`chapter_cards`、`chapter_quality_reports`、`submission_packages`、`workflow_runs`、`workflow_run_steps`。
  - 新增索引：`idx_inspiration_cards_project_status`、`idx_chapter_cards_project_volume`。
- Task 1.2：添加 `ensureZeroStartSchema(db)`。
  - `ensureZeroStartSchema(db)` 执行 `CREATE TABLE IF NOT EXISTS`，再执行 `ensureZeroStartColumns(db)` 补齐已存在但不完整的 ZeroStart 表字段。
  - 已在 `electron/main/workspace-store.ts` 的数据库初始化流程中接入，位于现有 workspace schema 和 story state schema 初始化之间。
- Task 1.3：添加 repository 文件。
  - 新增 `electron/main/zero-start/repositories/index.ts`。
  - 提供 `createZeroStartRepositories(db)`，包含 workflow state、inspiration cards、style fingerprints、title/synopsis candidates、outline snapshots、chapter cards、quality reports、submission packages、workflow runs、workflow run steps 的基础读写入口。
  - repository 只依赖 `DatabaseSync`，不依赖 UI 或 Electron renderer。
- Task 1.4：添加基础 CRUD 验证脚本。
  - 新增 `scripts/verify-zero-start-schema.mjs`。
  - RED：初次运行因 `electron/main/zero-start/schema.ts` 不存在失败，符合预期。
  - GREEN：实现 schema/repository 后运行通过。
  - 验证覆盖：PRD 表存在、关键字段存在、关键索引存在、局部旧表字段补齐、workflow state 默认创建、inspiration card CRUD/status 更新、chapter card CRUD、删除旧项目时 ZeroStart 子表级联删除。

### 验收结果

- Epic 1 复验时间：2026-06-13。
- 复验检查：
  - `workspace-store.ts` 已导入并调用 `ensureZeroStartSchema(db)`。
  - `electron/main/zero-start/schema.ts` 已包含 PRD 要求的 10 张 ZeroStart 表和关键索引。
  - `ensureZeroStartSchema(db)` / `ensureZeroStartColumns(db)` 提供自动建表和局部旧表补列迁移。
  - `scripts/verify-zero-start-schema.mjs` 验证旧项目父表存在时可增量建表，局部旧 ZeroStart 表可补列，删除旧项目时 ZeroStart 子表级联删除。
  - `electron/main/zero-start/repositories/index.ts` 已创建基础 repository。
- 验证脚本：`node --experimental-strip-types scripts/verify-zero-start-schema.mjs`。
  - 状态：通过。
  - 说明：Node 对直接运行 `.ts` 和 `node:sqlite` 输出实验性/模块类型警告，不影响验证结果。
- 构建命令：`corepack pnpm run build`。
  - 状态：通过。
  - 非阻塞警告仍为 Epic 0 已记录的 Vite 动态/静态混合导入 chunk 提示。

## Epic 2：共享类型与 Schema

状态：完成

### 已执行任务

- Task 2.1：扩展 `AiTaskName`。
  - 在 `electron/main/ai/shared-types.ts` 新增：`zero-idea-cards`、`zero-idea-merge`、`style-fingerprint-normalize`、`style-fusion-project`、`title-synopsis-generate`、`master-outline-generate`、`volume-outline-generate`、`chapter-cards-generate`、`chapter-draft-v2`、`chapter-quality-audit`、`submission-package-generate`。
  - 同步补齐 `electron/main/ai/prompts/capability.ts` 的默认 capability 映射，避免 `Record<AiTaskName, ...>` 因新任务缺键而破坏构建。
- Task 2.2：新增 ZeroStart 共享类型文件。
  - 新增 `electron/main/zero-start/types.ts`。
  - 已定义：`ZeroStartWizardInput`、`ProjectWorkflowState`、`InspirationCard`、`StyleFingerprint`、`TitleSynopsisCandidate`、`MasterOutline`、`ChapterCard`、`ChapterQualityReport`、`SubmissionPackage`、`WorkflowRun`、`WorkflowRunStep`。
  - 补充定义 AI 输出结果类型：`ZeroIdeaCardsResult`、`ZeroIdeaMergeResult`、`StyleFingerprintResult`、`TitleSynopsisResult`、`MasterOutlineResult`、`VolumeOutlineResult`、`ChapterCardsResult`、`ChapterDraftV2Result`、`ChapterQualityAuditResult`、`SubmissionPackageResult`。
  - `electron/main/zero-start/repositories/index.ts` 已改为复用共享类型，保证 Epic 1 SQLite 字段转换和 Epic 2 类型共用同一套结构。
- Task 2.3：新增 Zod/JSON schema。
  - 新增 `electron/main/zero-start/schemas/index.ts`。
  - 覆盖 ZeroStart workflow、向导输入、数据库实体和 11 个新增 AI 任务输出 schema。
- Task 2.4：更新 `object-schemas.ts`。
  - 在 `electron/main/ai/tasks/object-schemas.ts` 中为 11 个新增 AI 任务注册结构化输出 schema。
  - 在 `electron/main/ai/shared-types.ts` 中 re-export ZeroStart 类型，并把 `ZeroStartAiTaskResult` 加入 `AiTaskResult` 联合类型。

### 验收结果

- TDD RED：`node --experimental-strip-types scripts/verify-zero-start-types.mjs` 初次失败于 `missing structured schema for zero-idea-cards`。
- 验证脚本：`node --experimental-strip-types scripts/verify-zero-start-types.mjs`。
  - 状态：通过。
  - 说明：脚本验证新增任务名登记、结构化 schema 注册和样例输出 parse。
- 回归脚本：`node --experimental-strip-types scripts/verify-zero-start-schema.mjs`。
  - 状态：通过。
- `any` 检查：`rg -n "\bany\b" electron/main/zero-start electron/main/ai/shared-types.ts electron/main/ai/tasks/object-schemas.ts scripts/verify-zero-start-types.mjs`。
  - 状态：无匹配。
- 构建命令：`corepack pnpm run build`。
  - 首次构建失败：`PromptCapabilityId` 全量映射缺少新增 ZeroStart 任务键。
  - 修复：补齐 `electron/main/ai/prompts/capability.ts` 的 ZeroStart 任务默认 capability。
  - 最终状态：通过。
  - 非阻塞警告仍为 Epic 0 已记录的 Vite 动态/静态混合导入 chunk 提示。

### 遗留问题

- 尚未实现 Epic 3 的 AI task handler，因此新增 task name 还不会被 `tasks/index.ts` 注册运行。
- 直接用 Node 运行 `.ts` 验证脚本仍会显示模块类型/实验性 SQLite 警告，不影响项目构建。

## Epic 3：AI 任务 Handler

状态：完成

### 已执行任务

- Task 3.1：实现 `zero-idea-cards.ts`。
- Task 3.2：实现 `style-fusion-project.ts`。
- Task 3.3：实现 `title-synopsis-generate.ts`。
- Task 3.4：实现 `master-outline-generate.ts`。
- Task 3.5：实现 `chapter-cards-generate.ts`。
- Task 3.6：实现 `chapter-draft-v2.ts`。
- Task 3.7：实现 `chapter-quality-audit.ts`。
- Task 3.8：实现 `submission-package-generate.ts`。
- Task 3.9：在 `electron/main/ai/tasks/index.ts` 注册新增 handler。
- 同步实现 PRD 8.2 中剩余的 `zero-idea-merge.ts`、`style-fingerprint-normalize.ts`、`volume-outline-generate.ts`，保证 11 个新增 `AiTaskName` 全部可被 registry 找到。
- 新增 `electron/main/ai/tasks/zero-start-common.ts`，集中复用 zero-start JSON prompt 拼装和 Zod 校验错误描述。

### 修改文件

- `electron/main/ai/tasks/zero-idea-cards.ts`
- `electron/main/ai/tasks/zero-idea-merge.ts`
- `electron/main/ai/tasks/style-fingerprint-normalize.ts`
- `electron/main/ai/tasks/style-fusion-project.ts`
- `electron/main/ai/tasks/title-synopsis-generate.ts`
- `electron/main/ai/tasks/master-outline-generate.ts`
- `electron/main/ai/tasks/volume-outline-generate.ts`
- `electron/main/ai/tasks/chapter-cards-generate.ts`
- `electron/main/ai/tasks/chapter-draft-v2.ts`
- `electron/main/ai/tasks/chapter-quality-audit.ts`
- `electron/main/ai/tasks/submission-package-generate.ts`
- `electron/main/ai/tasks/zero-start-common.ts`
- `electron/main/ai/tasks/index.ts`
- `scripts/verify-zero-start-handlers.mjs`

### 验收结果

- TDD RED：`node scripts/verify-zero-start-handlers.mjs` 初次失败于 `missing handler file electron\main\ai\tasks\zero-idea-cards.ts`。
- 验证脚本：`node scripts/verify-zero-start-handlers.mjs`。
  - 状态：通过。
  - 说明：脚本验证 11 个 handler 文件存在、`outputType: 'json'`、具备 `buildPrompt` / `normalize` / `validate` / `describeValidationErrors`，并已在 `tasks/index.ts` 注册。
- 构建命令：`corepack pnpm run build`。
  - 状态：通过。
  - 非阻塞警告仍为 Epic 0 已记录的 Vite 动态/静态混合导入 chunk 提示。

### 遗留问题

- 本 Epic 只实现 AI TaskHandler，不做 UI、IPC、preload 或 AI workflow run 落库。
- handler 当前通过 `extractJsonObject` 和 Epic 2 Zod schema 严格 parse/validate，具体任务调用与 `workflow_runs` / `workflow_run_steps` 记录将在 Epic 4 接入。

### 下一步 Epic 4 计划

- 在 `register-main-ipc.ts` 增量注册 zero-start IPC。
- 在 preload 暴露 typed API。
- 接入 `runAiTask` 与 Epic 1 zero-start repositories。
- 记录 `workflow_runs` 和 `workflow_run_steps`。

## Epic 4：IPC 与 preload

状态：完成

### 已执行任务

- Task 4.1：新增 `electron/main/zero-start/ipc.ts`，注册 PRD 要求的 17 个 zero-start IPC handler。
- Task 4.2：在 `electron/preload/index.ts` 通过 `window.characterArc` 暴露 zero-start typed API。
- Task 4.3：主进程 zero-start IPC 已接入 `runAiTask` 和 `createZeroStartRepositories(db)`。
- Task 4.4：每个 zero-start AI 调用都会写入 `workflow_runs` 和 `workflow_run_steps`，成功/失败均落库记录。
- 新增 `electron/shared/zero-start-ipc-types.ts`，集中定义 zero-start IPC 请求/响应类型。
- 在 `electron/main/index.ts` 注册 `registerZeroStartIpcHandlers({ ensureWorkspaceDb })`。
- 在 `renderer/src/env.d.ts` 补充 `window.characterArc.zero*` 方法类型。

### 修改文件

- `electron/main/zero-start/ipc.ts`
- `electron/shared/zero-start-ipc-types.ts`
- `electron/main/index.ts`
- `electron/preload/index.ts`
- `renderer/src/env.d.ts`
- `scripts/verify-zero-start-ipc.mjs`

### 验收结果

- TDD RED：`node scripts/verify-zero-start-ipc.mjs` 初次失败于 `missing electron/main/zero-start/ipc.ts`。
- 验证脚本：`node scripts/verify-zero-start-ipc.mjs`。
  - 状态：通过。
  - 说明：脚本验证 17 个 IPC channel、preload 方法、renderer 类型声明、main 进程注册、repositories / runAiTask / workflow run 记录接线。
- 构建命令：`corepack pnpm run build`。
  - 状态：通过。
  - 非阻塞警告仍为 Epic 0 已记录的 Vite 动态/静态混合导入 chunk 提示。

### 遗留问题

- 投稿包导出 IPC 在 Epic 4 先返回已生成投稿包记录；实际写出 folder/txt/docx/json 文件将在 Epic 8 完成。
- `chapter-draft-v2` 已能落库章节正文，但章节生成后的质量报告自动串联与 UI 显示将在 Epic 7 完成。

### 下一步 Epic 5 计划

- 新增 `renderer/src/features/zeroStart` 和 `renderer/src/stores/zeroStart.ts`。
- 新增/改造零基础向导和审核组件。
- 确保用户只选题材和篇幅即可调用 `zeroGenerateIdeas` 并进入灵感卡审核。

## Epic 5：前端零基础流程

状态：完成

### 已执行任务

- Task 5.1：新增 `renderer/src/features/zeroStart`。
- Task 5.2：新增 `renderer/src/pages/ZeroStartWizardPage.vue`，并在 `App.vue` 挂载 `zero-start` 视图。
- Task 5.3：实现 `IdeaCardGrid.vue` 和 `IdeaReviewPanel.vue`。
- Task 5.4：实现 `TitleSynopsisReviewPanel.vue`。
- Task 5.5：实现 `MasterOutlineReviewPanel.vue`。
- Task 5.6：实现 `ChapterCardBoard.vue`。
- Task 5.7：实现 `SubmissionPackagePanel.vue`。
- 新增 `renderer/src/stores/zeroStart.ts`，集中维护 zero-start workflow state、灵感卡、风格卡、书名简介、大纲、章节卡、质量报告和投稿包状态。
- 新增 `ZeroStartWizard.vue`，用户只需选择题材和篇幅即可创建本地项目骨架、持久化，并调用 `zeroGenerateIdeas` 进入灵感卡审核。
- `ProjectCenter.vue` 的“新建作品”入口改为打开 zero-start 流程，旧 `ProjectWizardPage.vue` 保留兼容。

### 修改文件

- `renderer/src/features/zeroStart/constants.ts`
- `renderer/src/features/zeroStart/types.ts`
- `renderer/src/features/zeroStart/composables/useZeroWorkflow.ts`
- `renderer/src/features/zeroStart/components/ZeroStartWizard.vue`
- `renderer/src/features/zeroStart/components/IdeaCardGrid.vue`
- `renderer/src/features/zeroStart/components/IdeaReviewPanel.vue`
- `renderer/src/features/zeroStart/components/StyleFingerprintPanel.vue`
- `renderer/src/features/zeroStart/components/StyleFusionPanel.vue`
- `renderer/src/features/zeroStart/components/TitleSynopsisReviewPanel.vue`
- `renderer/src/features/zeroStart/components/MasterOutlineReviewPanel.vue`
- `renderer/src/features/zeroStart/components/ChapterCardBoard.vue`
- `renderer/src/features/zeroStart/components/SubmissionPackagePanel.vue`
- `renderer/src/pages/ZeroStartWizardPage.vue`
- `renderer/src/stores/zeroStart.ts`
- `renderer/src/stores/app.ts`
- `renderer/src/App.vue`
- `renderer/src/pages/ProjectCenter.vue`
- `electron/shared/zero-start-ipc-types.ts`
- `scripts/verify-zero-start-frontend.mjs`

### 验收结果

- TDD RED：`node scripts/verify-zero-start-frontend.mjs` 初次失败于 `missing renderer/src/stores/zeroStart.ts`。
- 验证脚本：`node scripts/verify-zero-start-frontend.mjs`。
  - 状态：通过。
  - 说明：脚本验证 zero-start feature 目录、store、核心审核组件、页面入口和首页创建入口。
- 构建命令：`corepack pnpm run build`。
  - 首次构建失败：renderer `AppSettings` 与主进程 `AppSettings` 形状不一致，缺少 `embeddingModel`。
  - 修复：zero-start IPC 请求类型将 `settings` 放宽为 `unknown`，主进程在调用 AI runtime 时显式 cast 到 `AiTaskPayload['settings']`。
  - 最终状态：通过。
  - 非阻塞警告仍为 Epic 0 已记录的 Vite 动态/静态混合导入 chunk 提示。

### 遗留问题

- Epic 5 先打通“题材/篇幅 -> 灵感卡 -> 用户审核”的前端主入口；reload-safe 的实体列表 hydrate 将在后续 IPC/service 扩展时继续增强。
- 风格融合、章节质量报告自动显示和投稿包真实导出分别在 Epic 6、Epic 7、Epic 8 完成。

### 下一步 Epic 6 计划

- 复用现有参考小说导入结果生成/保存 `style_fingerprints`。
- 在拆书页接入风格卡与融合操作。
- 将 approved style 写入 workflow state，并注入后续章节生成 prompt。

## Epic 6：拆书风格融合

状态：完成

### 已执行任务

- Task 6.1：复用现有参考小说导入与分析结果，通过 `appStore.referenceWorks` 读取已拆书作品。
- Task 6.2：新增 `ReferenceStyleFingerprintPanel.vue`，可将参考作品分析沉淀为 `style_fingerprints` 草稿。
- Task 6.3：在拆书库页面接入 `zeroStartStore.generateStyleFusion`，支持多风格卡融合为项目主风格。
- Task 6.4：保存/融合风格卡仍走 Epic 4 IPC 与 repository，approved style 会写入 workflow state。
- Task 6.5：已验收 `chapter-cards-generate` 与 `chapter-draft-v2` handler/IPC 会读取 `approvedStyle` 并注入后续生成上下文。

### 修改文件

- `renderer/src/features/zeroStart/components/ReferenceStyleFingerprintPanel.vue`
- `renderer/src/pages/DeconstructionLibraryPage.vue`
- `scripts/verify-zero-start-style-fusion.mjs`

### 验收结果

- 验证脚本：`node scripts/verify-zero-start-style-fusion.mjs`
  - 状态：通过。
  - 说明：脚本验证参考作品分析复用、风格卡保存事件、风格融合事件、store IPC 调用、IPC 中 `style-fusion-project` 任务调用，以及章节生成对 `approvedStyle` 的注入。
- 构建命令：`corepack pnpm run build`
  - 状态：通过。
  - 非阻塞警告仍为 Epic 0 已记录的 Vite 动态/静态混合导入 chunk 提示。

### 遗留问题

- 拆书库页的风格融合入口依赖当前已有选中项目；未选项目时会提示先选择或创建项目。
- 参考作品的原始拆书导入、分析流程仍沿用现有知识中心能力，本 Epic 只新增 ZeroStart 风格卡沉淀与融合入口。

### 下一步 Epic 7 计划

- 为 `chapter-quality-audit` 增加 PRD 质量通过规则与风险项补全。
- 让 `chapter-draft-v2` 生成后接入现有 post-generation pipeline。
- 在 ZeroStart 前端流程中显示章节质量报告入口与结果。

## Epic 7：章节生成与质量报告

状态：完成

### 已执行任务

- Task 7.1：章节卡生成后落库能力已由 Epic 4 IPC/repository 与 Epic 5 store 前端流程复用，本 Epic 验收其继续作为正文与审计入口。
- Task 7.2：`chapter-draft-v2` 已在 IPC 中读取章节卡、approved style、目标字数等上下文；正文生成成功后会回填章节卡的 `chapterId` 与 `drafted` 状态。
- Task 7.3：`chapter-draft-v2` 非流式生成路径已接入现有 post-generation pipeline，异步执行状态增量、轻量审计与语义索引，不阻塞正文返回。
- Task 7.4：新增 `applyChapterQualityGuardrails`，在 `chapter-quality-audit` 落库前按 PRD 规则统一校正 `passed` 与 issues。
- Task 7.5：新增 `ChapterQualityPanel.vue`，在 ZeroStart 章节/正文阶段显示质量报告、连续性分数、风格分数、原创风险与审计入口。

### 修改文件

- `electron/main/zero-start/services/quality-guardrails.ts`
- `electron/main/zero-start/ipc.ts`
- `electron/main/ai/runtime/orchestrator.ts`
- `renderer/src/features/zeroStart/components/ChapterQualityPanel.vue`
- `renderer/src/pages/ZeroStartWizardPage.vue`
- `renderer/src/stores/zeroStart.ts`
- `scripts/verify-zero-start-quality.mjs`

### 验收结果

- TDD RED：`node scripts/verify-zero-start-quality.mjs` 初次失败于缺少 `electron/main/zero-start/services/quality-guardrails.ts`。
- 验证脚本：`node scripts/verify-zero-start-quality.mjs`
  - 状态：通过。
  - 说明：脚本验证 PRD 质量硬线、IPC 落库前 guardrail、`chapter-draft-v2` 后处理触发、前端质量面板与 store 派生报告。
- 构建命令：`corepack pnpm run build`
  - 首次构建失败：`streamAiTask` 分支不支持 `chapter-draft-v2`，但被误纳入流式后处理条件，TypeScript 判定无交集。
  - 修复：仅保留非流式 `runAiTask` 的 `chapter-draft-v2` 后处理触发，流式分支维持旧任务范围。
  - 最终状态：通过。
  - 非阻塞警告仍为 Epic 0 已记录的 Vite 动态/静态混合导入 chunk 提示。

### 遗留问题

- 质量报告由用户在质量面板中手动触发；正文生成后自动串联质量审计可在后续增强，但当前已符合“生成后可看到质量报告”的 MVP 入口要求。
- post-generation pipeline 对 `chapter-draft-v2` 使用运行时上下文中的 `chapterId`；若未来章节卡允许空 `chapterId`，可在正文生成前预分配章节 ID 进一步增强索引命中。

### 下一步 Epic 8 计划

- 实现 `submission-package-export` 的真实 folder/txt/docx/json 文件写出。
- 汇总书名简介、标签、正文、章节目录、质量报告、风险提示与项目快照。
- 在前端投稿包面板接入导出动作。

## Epic 8：投稿包导出

状态：完成

### 已执行任务

- Task 8.1：继续复用 Epic 3 的 `submission-package-generate` handler 生成投稿包元数据、checklist 与风险报告。
- Task 8.2：新增 `submission-export-service.ts`，真实写出 folder/txt/docx/json 投稿包文件。
- Task 8.3：导出内容包含投稿清单、书名简介、标签/卖点、全书大纲、章节目录、正文、质量报告、平台风险提示与 `project-snapshot.json`。
- Task 8.4：导出后将真实 `manuscriptPath` 回写 `submission_packages`，并通过 IPC 返回 `folderPath` / `filePath`。
- 前端 `SubmissionPackagePanel.vue` 新增导出按钮，`zeroStartStore.exportSubmissionPackage` 接入 `zeroExportSubmissionPackage`。

### 修改文件

- `electron/main/zero-start/services/submission-export-service.ts`
- `electron/main/zero-start/ipc.ts`
- `renderer/src/features/zeroStart/components/SubmissionPackagePanel.vue`
- `renderer/src/pages/ZeroStartWizardPage.vue`
- `renderer/src/stores/zeroStart.ts`
- `scripts/verify-zero-start-submission-export.mjs`

### 验收结果

- TDD RED：`node scripts/verify-zero-start-submission-export.mjs` 初次失败于缺少 `electron/main/zero-start/services/submission-export-service.ts`。
- 验证脚本：`node scripts/verify-zero-start-submission-export.mjs`
  - 状态：通过。
  - 说明：脚本验证导出服务、文件清单、docx 生成、质量报告汇总、IPC 调用、路径回写、preload 与前端导出动作。
- 构建命令：`corepack pnpm run build`
  - 状态：通过。
  - 非阻塞警告仍为 Epic 0 已记录的 Vite 动态/静态混合导入 chunk 提示。

### 遗留问题

- 导出目录当前固定写入应用 userData 下的 `data/submission-packages/<project>/<package>/`，未弹出目录选择框；后续可按平台模板或用户偏好扩展。
- 导出会生成 docx，但不做 Word 版式深度排版；MVP 保证可提交素材完整性。

### 下一步 Epic 9 计划

- 增加 ZeroStart 任务的模型角色映射：ideation / planner / writer / auditor / embedding / image。
- 在云端调用前检查 `cloud_allowed`，默认本地优先。
- 增强 API Key 本地加密/隐私提示与设置页角色说明。
