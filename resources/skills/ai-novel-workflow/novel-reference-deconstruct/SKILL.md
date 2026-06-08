---
name: novel-reference-deconstruct
description: 参考作品拆解。用于拆解爆款短篇或长篇小说的开篇、结构、情绪曲线、爽点、反转、人物功能、伏笔、章节节奏和可迁移写法，适合 reference 阶段的 reference-style-chunk、reference-style-analysis、reference-deep-analyze 任务。
manifest:
  category: analysis
  tasks:
    - novel-orchestrator
    - reference-style-chunk
    - reference-style-analysis
    - reference-deep-analyze
  stages:
    - reference
  triggers:
    - 拆书
    - 拆文
    - 分析参考
    - 对标
    - 爆款分析
  priority: 8
  enabled: true
  compatibility: native
  compatibilityNote: 负责把参考文本拆成可复用结构资产，不负责直接生成正文。
  references:
    - file: references/deconstruction-template.md
      loadWhen:
        task: reference-style-analysis
    - file: references/deconstruction-template.md
      loadWhen:
        task: reference-deep-analyze
---

# Novel Reference Deconstruct

## Role

Act as a reference-work deconstruction analyst. Read a sample or summary and extract reusable craft patterns without copying plot, language, or proprietary expression.

## Workflow

1. Identify format: short story, long serial, opening sample, full book, or chapter batch.
2. Map the visible reader promise: why the reader continues after the title, first page, first chapter, and first turning point.
3. Break the work into beats: setup, pressure, escalation, reversal, release, and unresolved hook.
4. Extract transferable patterns:
   - conflict structure
   - information release
   - emotional ladder
   - protagonist pressure
   - antagonist or obstacle function
   - chapter ending method
   - prose rhythm
5. Convert findings into reusable rules for a new project.

## Guardrails

- Do not imitate protected prose.
- Do not suggest direct plot cloning.
- Distinguish observable facts from inferred craft rules.
- Prefer concise, reusable rules over long summaries.

Use [deconstruction-template.md](references/deconstruction-template.md) for the output format.

