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

状态：待开始

下一步入口：

- 在 `workspace-store.ts` 添加 ZeroStart 新表 DDL。
- 添加 `ensureZeroStartSchema(db)` 并接入现有 schema 初始化/迁移流程。
- 添加 repository 文件。
- 添加基础 CRUD 验证脚本或测试。
