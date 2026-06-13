# ZeroStart MVP Acceptance Report

Date: 2026-06-13  
Branch: `feature/zero-start-workflow`  
Base commit before this report: `effb232`

## Verdict

ZeroStart MVP acceptance passed for build, app startup, workflow wiring, SQLite persistence, legacy data compatibility, submission package export, cloud model blocking, and API key log safety checks.

No feature code was changed during acceptance. No blocking bug was found.

## Acceptance Checklist

| Item | Result | Evidence |
| --- | --- | --- |
| `corepack pnpm run build` | Pass | Initial and final builds completed successfully. |
| Dev app startup | Pass | `corepack pnpm run dev` built main/preload, started renderer at `http://127.0.0.1:3000/`, and launched Electron processes without startup crash. |
| Main ZeroStart flow | Pass | Runtime IPC fixture walked idea cards -> approval -> style card -> approval -> title/synopsis -> approval -> outline -> approval -> chapter card -> draft -> quality report -> submission package -> export. |
| Legacy projects still open/read | Pass | Existing workspace DB loaded with `6` projects and `97` chapters; all legacy core tables and ZeroStart tables coexist. |
| Submission package files | Pass | Export produced 10 non-empty files, including `.txt`, `.docx`, quality report JSON, risk report, and project snapshot. |
| `cloudAllowed` guard | Pass | `zero-ideas-generate` returned failure before model execution for OpenAI URL with `cloudAllowed=false`. |
| API key log safety | Pass | Dynamic secret was not present in captured IPC response/log output; static search found no direct `console.*apiKey` logging; settings use `safeStorage` when available. |

## Commands Run

```powershell
corepack pnpm run build
corepack pnpm run dev
node --experimental-strip-types scripts/verify-zero-start-schema.mjs
node --experimental-strip-types scripts/verify-zero-start-types.mjs
node scripts/verify-zero-start-handlers.mjs
node scripts/verify-zero-start-ipc.mjs
node scripts/verify-zero-start-frontend.mjs
node scripts/verify-zero-start-style-fusion.mjs
node scripts/verify-zero-start-quality.mjs
node scripts/verify-zero-start-submission-export.mjs
node scripts/verify-zero-start-privacy.mjs
```

Additional temporary runtime checks were executed without committing helper scripts:

- Submission export service fixture: generated 10 non-empty files in a temporary workspace.
- Full ZeroStart IPC flow fixture: registered 17 IPC routes, wrote workflow records to SQLite, reached `export_ready`, and exported the package.
- Cloud guard fixture: registered 17 IPC routes, blocked a cloud model call, and confirmed the test API key did not appear in captured output.
- Legacy workspace read: counted projects/chapters and verified ZeroStart migration tables exist in the existing user DB.

## Main Flow Evidence

Runtime flow final state:

```json
{
  "phase": "export_ready",
  "idea": "idea-1",
  "style": "style-1",
  "synopsis": "synopsis-1",
  "outline": "outline-1",
  "chapter": "chapter-1781342280097-913f4fac"
}
```

Runtime SQLite counts after the flow:

```json
{
  "inspiration_cards": 1,
  "style_fingerprints": 1,
  "title_synopsis_candidates": 1,
  "outline_snapshots": 1,
  "chapter_cards": 1,
  "chapters": 1,
  "chapter_quality_reports": 1,
  "submission_packages": 1,
  "workflow_runs": 8,
  "workflow_run_steps": 8
}
```

Exported files:

```text
00_submission_checklist.md
01_title_synopsis.md
02_tags_selling_points.json
03_master_outline.json
04_chapter_toc.md
05_manuscript.docx
05_manuscript.txt
06_quality_reports.json
07_platform_risk.md
project-snapshot.json
```

## Legacy Data Check

Existing workspace database:

```text
C:\Users\12296\AppData\Roaming\CharacterArc\data\workspace.db
```

Observed counts:

```json
{
  "projectCount": 6,
  "chapterCount": 97
}
```

Verified tables:

```text
projects
chapters
project_workflow_state
inspiration_cards
style_fingerprints
title_synopsis_candidates
outline_snapshots
chapter_cards
chapter_quality_reports
submission_packages
workflow_runs
workflow_run_steps
```

## Privacy And Cloud Guard

Cloud blocking test:

```json
{
  "blocked": true,
  "responseSuccess": false,
  "secretAppeared": false
}
```

The checked scenario used a synthetic OpenAI-compatible API key and `cloudAllowed=false`; the request was rejected before model execution. The key did not appear in the captured response or captured logs.

## Non-Blocking Warnings

- Vite reports an existing dynamic/static import chunk warning for `chapter-data-access.ts`.
- Electron/Node reports the experimental `node:sqlite` warning.
- Direct TS fixture checks report Node's typeless package warning.
- DevTools emitted Autofill protocol warnings during Electron startup.

None of these blocked build, startup, workflow execution, or export.

## Limitations

Live external model generation was not executed during this acceptance. AI outputs in the full-flow check were structured fixtures so the test could validate route wiring, persistence, state transitions, export, and privacy behavior without sending prompts or keys to a cloud provider.
