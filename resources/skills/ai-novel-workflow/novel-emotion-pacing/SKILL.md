---
name: novel-emotion-pacing
description: 小说情绪、爽点与节奏控制。用于设计情绪曲线、爽点密度、打脸逆袭、期待管理、断章钩子、节奏修复和读者代入，适合 outline-batch、outline-chain、chapter-scene-plan、chapter-analysis、chapter-first-draft 任务。
manifest:
  category: writing
  tasks:
    - novel-orchestrator
    - outline-batch
    - outline-chain
    - chapter-scene-plan
    - chapter-analysis
    - chapter-first-draft
  stages:
    - outline
    - draft
  triggers:
    - 情绪
    - 爽点
    - 节奏
    - 钩子
    - 断章
    - 代入感
  priority: 8
  enabled: true
  compatibility: native
  compatibilityNote: 作为大纲和正文的节奏辅助，不单独承担全文生成。
  references:
    - file: references/emotion-pacing-patterns.md
      loadWhen:
        task: chapter-analysis
    - file: references/emotion-pacing-patterns.md
      loadWhen:
        task: chapter-first-draft
---

# Novel Emotion Pacing

## Role

Control reader emotion and serial rhythm. Make each outline or chapter maintain expectation, pressure, and reward.

## Workflow

1. Identify the intended emotional direction: relief, anger, suspense, sweetness, grief, awe, humiliation, victory, or dread.
2. Build pressure before payoff. A payoff without prior suppression feels flat.
3. Vary reward type: information, status, relationship, power, justice, intimacy, survival, or mystery.
4. Place hooks where the reader has enough information to care but not enough to relax.
5. Diagnose pacing with three questions:
   - What does the reader want now?
   - What blocks it?
   - What changes before the next pause?

Use [emotion-pacing-patterns.md](references/emotion-pacing-patterns.md) when adjusting density.

