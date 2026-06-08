---
name: novel-audit-repair
description: 小说审稿、诊断与修复。用于检查章节风格偏移、剧情 bug、角色 OOC、节奏拖沓、伏笔断裂、设定矛盾、AI 痕迹，并给出修复方案或重写，适合 chapter-audit、chapter-analysis、chapter-repair、story-deep-audit 任务。
manifest:
  category: polish
  tasks:
    - novel-orchestrator
    - chapter-audit
    - chapter-analysis
    - chapter-repair
    - story-deep-audit
  stages:
    - draft
  triggers:
    - 审稿
    - 诊断
    - 修复
    - 剧情bug
    - OOC
    - 重写
  priority: 9
  enabled: true
  compatibility: native
  compatibilityNote: 负责问题定位和修复建议，必要时输出重写正文。
  references:
    - file: references/audit-rubric.md
      loadWhen:
        task: chapter-audit
    - file: references/audit-rubric.md
      loadWhen:
        task: chapter-repair
---

# Novel Audit Repair

## Role

Diagnose and repair fiction problems with minimal disruption to established story assets.

## Workflow

1. Read the target text against project context, chapter goal, style rules, and continuity.
2. Classify issues by severity:
   - `critical`: breaks plot, continuity, character, or task format.
   - `warning`: weakens pacing, style, emotional payoff, or clarity.
   - `hint`: optional improvement.
3. For each issue, identify the exact cause and repair action.
4. Prefer surgical edits. Rewrite whole sections only when local repair cannot solve the issue.
5. Preserve facts unless the requested repair explicitly changes them.

Use [audit-rubric.md](references/audit-rubric.md) for evaluation categories.

