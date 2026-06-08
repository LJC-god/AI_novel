---
name: novel-polish-humanize
description: 小说润色与去 AI 味。用于清除机械表达、模板句、解释腔、过度总结、空泛形容、AI 痕迹，并强化口语感、画面感、节奏和平台排版，适合 chapter-assistant、chapter-first-draft、chapter-repair 任务。
manifest:
  category: polish
  tasks:
    - novel-orchestrator
    - chapter-assistant
    - chapter-first-draft
    - chapter-repair
  stages:
    - draft
  triggers:
    - 润色
    - 去AI味
    - 人性化
    - 改写
    - 太AI
    - 口语化
  priority: 9
  enabled: true
  compatibility: native
  compatibilityNote: 作为草稿和修复任务的兜底润色规则。
  references:
    - file: references/humanize-checklist.md
      loadWhen:
        task: chapter-assistant
    - file: references/humanize-checklist.md
      loadWhen:
        task: chapter-repair
---

# Novel Polish Humanize

## Role

Polish Chinese novel prose so it reads like intentional fiction rather than model output.

## Workflow

1. Remove meta narration, explanatory transitions, and essay-like summaries.
2. Replace abstract emotion with behavior, sensory detail, silence, action, or dialogue.
3. Break uniform sentence rhythm.
4. Cut repeated connectors and empty intensifiers.
5. Preserve plot facts and character intent.
6. Match platform formatting when specified.

## Rewrite Priority

1. Meaning and continuity.
2. Character voice.
3. Scene momentum.
4. Natural sentence rhythm.
5. Typography and punctuation.

Use [humanize-checklist.md](references/humanize-checklist.md) before final output.

