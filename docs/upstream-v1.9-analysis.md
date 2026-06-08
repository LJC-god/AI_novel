# CharacterArc upstream v1.9.0 analysis

Date: 2026-06-08

## Git source

- Local package version: `1.8.0`
- Added upstream remote: `https://github.com/uu201/character-arc.git`
- Latest reachable upstream tag: `v.1.9.0`
- The changelog also references `zhouyeshan/character-arc`, but Git access currently returns `Repository not found`.

## Upstream changes from v1.8.0 to v1.9.0

The upstream diff is focused on AI writeback review, global assistant reliability, persistence, and knowledge display.

### Added

- Chapter assistant edit proposals:
  - Agent chapter edits no longer write directly to chapter content.
  - The backend emits `edit_proposed` with `oldContent` and `newContent`.
  - The frontend reviews the diff before committing the edit.
  - A new IPC handler commits accepted chapter edits and creates chapter versions.

- Global assistant diff review dialog:
  - New `GlobalAssistantDiffReviewDialog.vue`.
  - Supports per-file accept/reject, accept all, ignore all, side-by-side and line-by-line diff.
  - Uses `diff2html`.

### Changed

- Global assistant proposal flow:
  - Proposal writes are represented as diff files instead of immediate grouped writeback.
  - Project constraints now support `weight` and `locked`.
  - Locked/core constraints are treated as higher priority in prompts.

- Global assistant context:
  - Sends more worldview, character, relationship, outline, inspiration, workflow, knowledge, and constraint context.
  - Increases global assistant output budget from about 1400 to 2400 tokens.
  - Avoids auto-organizing existing project data when the user only says they have a draft but has not pasted it.

- Persistence:
  - Streaming assistant messages persist less aggressively, reducing UI stalls.
  - Final messages and proposals are still flushed promptly.
  - Global assistant sessions and proposals are included in workspace snapshot read/write.

- Project knowledge panel:
  - Separates assistant-saved knowledge documents from reference novel/deconstruction knowledge.
  - Adds viewing and deletion for assistant-saved project knowledge.

### Fixed

- Chapter assistant diff review interaction stability.
- Project knowledge panel incorrectly showing deconstruction/reference knowledge.
- Announcement fetch fallback display.
- JSON repair path became more tolerant: agent JSON normalization failures can trigger up to two repair attempts.

## Value for our AI novel workflow

### High value

- Chapter edit proposal review is directly useful.
  Our desired agent flow depends on "user confirms before writeback". This upstream change gives the chapter-writing side the same safety model we already want for outline, setting, character, and volume planning.

- Global diff review is directly useful.
  Our workflow has many staged assets: inspiration, global outline, volume outline, worldview, characters, chapter outline, draft, audit fixes. A unified diff review UI can become the confirmation gate for all structured AI writes.

- Locked/core constraints are useful.
  Novel projects need hard rules: protagonist anchors, taboo changes, world rules, no-retcon constraints, style restrictions. The upstream `weight` and `locked` model fits our "canon contract" skill.

- Reduced streaming persistence is useful.
  Multi-agent workflows generate long streaming sessions. Persisting on every token/tool event can make the app feel stuck. The upstream throttling strategy is worth adopting.

### Medium value

- Larger global assistant context helps project-level work.
  This improves long outline and correction tasks, but it can increase token cost. It should be paired with model role routing so cheap models handle indexing and stronger models handle synthesis.

- Better project knowledge display is useful.
  Our拆书/知识库 flow needs clear separation between reference analysis, assistant-saved project knowledge, and canonical constraints.

- Two-attempt JSON repair is useful.
  This improves reliability for structured outputs, especially when small models are used in the workflow.

### Low value

- Announcement fallback changes do not affect the AI novel workflow much.
- Release metadata/package version changes only matter if we ship builds.

## Integration risk

Do not directly merge `v.1.9.0` into the current workspace without review.

The upstream diff touches several files we changed for the AI novel workflow:

- `renderer/src/composables/useGlobalAssistant.ts`
- `renderer/src/components/GlobalAssistantPage.vue`
- `renderer/src/components/GlobalAssistantPanel.vue`
- `electron/main/ai/ipc.ts`
- `electron/main/ai/agent/streaming-orchestrator.ts`
- `electron/main/ai/runtime/orchestrator.ts`
- `electron/main/ai/tasks/global-assistant.ts`
- `electron/main/ai/tasks/global-assistant-proposal.ts`

These files now contain local orchestration/model-routing changes, so the correct path is a manual feature port or careful cherry-pick, not a blind merge.

## Recommended adoption order

1. Keep current local work as a baseline commit.
2. Port persistence/session fixes first.
3. Add `diff2html` and shared types for proposal review.
4. Port chapter edit proposal backend:
   - `computeChapterEdit`
   - `commitChapterEdit`
   - `edit_proposed` stream event
   - `commit-chapter-edit` IPC
5. Port global assistant diff review UI.
6. Adapt our AI novel workflow stages to use the diff review gate:
   - inspiration selection
   - global outline writeback
   - volume outline writeback
   - worldview/character writeback
   - chapter outline writeback
   - chapter draft edits
7. Re-run `npx vue-tsc --noEmit` and `npm run build`.

