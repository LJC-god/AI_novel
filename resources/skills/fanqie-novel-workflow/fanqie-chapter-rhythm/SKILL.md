---
name: fanqie-chapter-rhythm
description: 番茄小说章节节奏规划。用于把卷纲拆成番茄向章节任务，控制每章冲突、信息增量、爽点、反转、章末钩子和连续追读压力，适合 novel-orchestrator、outline-draft、chapter-assistant。
manifest:
  category: writing
  tasks:
    - novel-orchestrator
    - outline-draft
    - chapter-assistant
  stages:
    - outline
  triggers:
    - 章纲
    - 章节节奏
    - 番茄节奏
    - 追读
    - 爽点
  priority: 9
  enabled: true
  compatibility: native
  compatibilityNote: 把长篇卷纲拆为可连载的章节任务，避免单元化和拖沓。
---

# Fanqie Chapter Rhythm

## Role

Convert outline nodes into chapters that sustain daily serialized reading.

## Rules

1. Every chapter needs one visible pressure and one state change.
2. A chapter cannot exist only to explain setting.
3. A payoff should appear every 1-2 chapters; a larger turn every 5-8 chapters.
4. Endings should be danger, discovery, debt, reveal, arrival, or forced choice.
5. Antagonists should lose because of desire, fear, evidence, or system constraints, not stupidity.

## Output Contract

For each chapter:

- title
- target characters
- conflict
- protagonist tactic
- payoff
- new clue or rule
- ending hook
