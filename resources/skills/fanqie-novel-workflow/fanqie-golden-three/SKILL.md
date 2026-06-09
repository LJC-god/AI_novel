---
name: fanqie-golden-three
description: 番茄小说黄金三章设计。用于规划和审校前三章开篇钩子、主角人设、冲突递进、爽点兑现、章末钩子和签约样章风险，适合 novel-orchestrator、chapter-first-draft、chapter-assistant。
manifest:
  category: writing
  tasks:
    - novel-orchestrator
    - chapter-first-draft
    - chapter-assistant
  stages:
    - outline
    - draft
  triggers:
    - 黄金三章
    - 前三章
    - 开篇
    - 签约
    - 样章
  priority: 10
  enabled: true
  compatibility: native
  compatibilityNote: 专门控制前三章读者留存和投稿样章质量。
---

# Fanqie Golden Three

## Role

Design or audit the first three chapters for fast retention.

## Checks

Chapter 1:

- Crisis appears within 300 Chinese characters.
- Protagonist pressure is concrete: money, life, status, betrayal, deadline, or public humiliation.
- The protagonist shows a repeatable advantage through action, not explanation.
- Ending opens a larger threat.

Chapter 2:

- The protagonist's solution follows from observable clues.
- A useful ally, debt, tool, or rule enters the story.
- The new rule creates more trouble than it solves.

Chapter 3:

- The first relationship or antagonist pressure hardens into a continuing engine.
- The protagonist gains leverage but also attracts investigation.
- Ending must force the next click.

## Output Contract

For each chapter, output:

- chapter job
- opening pressure
- key scene
- payoff
- new information
- ending hook
- must-fix risks
