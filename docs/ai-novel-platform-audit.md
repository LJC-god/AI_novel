# AI Novel Platform Audit

Date: 2026-06-08

## Scope

This audit reviewed the current CharacterArc platform from the AI novel workflow perspective:

- AI task routing and model-role routing
- global assistant / orchestrator UX
- reference deconstruction and knowledge-library flow
- workflow document generation
- chapter assistant behavior
- settings and multi-model configuration
- existing built-in skill packs and workflow-derived skills

## Answer: Should deconstruction be separated before selection?

Yes. Deconstruction should be a first-class stage before inspiration selection.

Reasons:

- Deconstruction is evidence gathering. Inspiration selection is a creative decision. Mixing them makes the agent both analyze and decide too early.
- The user wants to choose inspiration by type, length, word count, and platform. That choice needs a neutral reference-analysis brief first.
- If "deconstruct + choose" is one button, the agent tends to overfit a single proposed direction before the user sees the option space.
- Multi-model routing also benefits from separation: `deconstruct` can use a long-context/strong reasoning model, while `inspiration` can use a faster divergent model.

Recommended flow:

1. Import or select reference works.
2. Run deconstruction only: market lane, opening pressure, pleasure-point model, pacing, role functions, risks.
3. Generate 3-5 inspiration options from the deconstruction brief.
4. User selects type / length / target word count / platform.
5. Generate premise, master outline, assets, chapter outline, and draft.

## Fixed During Audit

### 1. Chapter-outline route was shadowed by master-outline routing

Problem:

- A prompt like "第一卷章大纲" contains "大纲".
- The route heuristic checked master-outline before chapter-outline.
- Result: first-volume chapter-outline requests could route to master-outline.

Fix:

- `chapter-outline` is now checked before general outline routing.
- File: `renderer/src/composables/useGlobalAssistant.ts`

### 2. "Deconstruct and inspire" was one mixed quick action

Problem:

- The previous quick action mixed "拆书" and "灵感".
- The model could jump from reference analysis directly into idea selection.

Fix:

- Split into:
  - `先拆书分析`
  - `生成灵感池`
  - `生成总大纲`
  - `第一卷章纲`
- File: `renderer/src/composables/useGlobalAssistant.ts`

### 3. Backend orchestrator rules conflicted with deconstruction

Problem:

- Even when the requested phase was `deconstruct`, the prompt rules said "if no inspiration has been selected, prioritize inspirationOptions".
- That made the first stage ambiguous.

Fix:

- `deconstruct` now explicitly means reference/market/genre analysis only.
- It should output transferable patterns, risks, and next prompts, not choose the story for the user.
- File: `electron/main/ai/tasks/novel-orchestrator.ts`

### 4. Dock assistant could not confirm/apply orchestrator results

Problem:

- Full-page global assistant had a "总控阶段确认" card.
- Dock global assistant did not.
- Users working in the right-side assistant could receive an orchestrator plan but had no visible confirm/apply UI.

Fix:

- Added the same orchestrator confirmation/apply card to the dock assistant.
- File: `renderer/src/components/GlobalAssistantPanel.vue`

### 5. Deconstruction phase exposed a misleading "write assets" action

Problem:

- Deconstruction normally produces analysis, not structured project assets.
- The UI allowed a user to confirm and then try "写入结构资产", only to receive a warning.

Fix:

- Added `hasWritableOrchestratorAssets`.
- Write buttons are disabled when the current stage has nothing safe to write.
- Files:
  - `renderer/src/composables/useGlobalAssistant.ts`
  - `renderer/src/components/GlobalAssistantPage.vue`
  - `renderer/src/components/GlobalAssistantPanel.vue`

### 6. Stream model-role routing used the wrong model for tool-support checks

Problem:

- Stream entrypoints checked whether the default active model supports tools.
- If a role-specific model was configured, the support check could be wrong.

Fix:

- Tool-support checks now use settings resolved through `modelRoleProfileMap`.
- File: `electron/main/ai/ipc.ts`

### 7. Debug logs leaked into normal chapter assistant cancellation

Problem:

- Stopping chapter AI printed multiple debug logs.
- This is noisy and not helpful to normal users.

Fix:

- Removed those debug logs while preserving cancellation state updates.
- File: `renderer/src/components/chapterWorkspace/useChapterAi.ts`

### 8. Workflow panel had a debug `console.log`

Problem:

- Workflow data-source computation logged every recomputation.

Fix:

- Removed the log.
- File: `renderer/src/components/NovelWorkflowPanel.vue`

## Logic Risks Still Worth Improving

### 1. Deconstruction output is still forced into the generic orchestrator JSON

Current state:

- `deconstruct` uses `summary`, `assetPlan`, `notes`, and `nextPrompts`.

Better design:

- Add explicit fields such as `deconstructionFindings`, `marketSignals`, `transferablePatterns`, `referenceRisks`.
- This would make the "先拆书分析" result easier to display and reuse.

### 2. The global assistant has two UI implementations

Current state:

- `GlobalAssistantPage.vue` and `GlobalAssistantPanel.vue` duplicate large blocks of proposal/orchestrator UI.

Risk:

- Future fixes may land in one surface and miss the other.

Better design:

- Extract shared cards:
  - `GlobalProposalCard.vue`
  - `OrchestratorStageCard.vue`
  - `ToolCallLog.vue`

### 3. Batch deconstruction cancellation still waits on in-flight LLM calls

Current state:

- Each book has an AbortController.
- The code checks abort between chunks.
- But the individual `runAiTask` calls inside a chunk do not receive the per-book abort signal.

Risk:

- "Stop" may feel delayed while the current chunk finishes.

Better design:

- Pass the per-book `controller.signal` into each deconstruction `runAiTask` call.

### 4. Reference selection and workflow document generation are useful but under-explained

Current state:

- The workflow panel says selected references are optional.
- It does not clearly distinguish "selected reference works" from "all available deconstruction assets".

Better design:

- Add a compact source breakdown:
  - selected references
  - unselected references ignored
  - project facts used
  - missing required facts

### 5. The "write all" interaction needs preview/diff for orchestrator writes

Current state:

- Orchestrator can write inspirations, volumes, outline items, worldview entries, characters, and chapters.

Risk:

- This is powerful but can feel opaque.

Better design:

- Before writing, show a compact diff grouped by target module.
- Allow user to select which buckets to apply.

### 6. Model-role settings are functional but not self-validating

Current state:

- Users can map roles to profiles.

Risk:

- A role may point to a model that lacks tool support or structured-output reliability.

Better design:

- Add "test role routing" buttons.
- Warn when `deconstruct`/agent roles use providers without tool support.
- Show the effective model for the next orchestrator request.

## UX / Humanization Findings

- The workflow is powerful, but the user should see a staged path, not a large freeform assistant surface.
- The best default path is: `拆书分析 -> 灵感池 -> 用户选择 -> 总纲 -> 结构资产 -> 章纲 -> 正文`.
- The assistant should ask fewer compound questions. One stage should ask one decision: "选哪个灵感？", "总纲是否确认？", "第一卷是否按这个章纲写？"
- "写入结构资产" should not be available for analysis-only stages.
- Long-running deconstruction should emphasize progress and cancellation reliability, because users will often import multiple books.
- The app should surface source provenance whenever AI uses deconstruction: which book, which chunk, and which extracted rule influenced the suggestion.

## Recommended Next Implementation Order

1. Add explicit deconstruction output fields to `NovelOrchestratorResult`.
2. Extract shared orchestrator/proposal UI components to remove page/dock duplication.
3. Add per-book abort signal propagation inside batch deconstruction.
4. Add an apply-preview screen for orchestrator writes.
5. Add role-routing diagnostics in settings.
6. Add source-provenance chips to inspiration and outline outputs.

