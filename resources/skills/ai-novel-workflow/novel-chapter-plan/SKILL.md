---
name: novel-chapter-plan
description: 单章场景规划与写作备忘。用于规划章节目标、场景顺序、读者期待、承接伏笔、情绪变化、断章点和写作注意事项，适合 chapter-scene-plan、chapter-memo、plot-thread-detect、chapter-summarize 任务。
manifest:
  category: writing
  tasks:
    - novel-orchestrator
    - chapter-scene-plan
    - chapter-memo
    - plot-thread-detect
    - chapter-summarize
  stages:
    - draft
  triggers:
    - 单章规划
    - 场景
    - 备忘
    - 本章怎么写
    - 章节摘要
    - 伏笔识别
  priority: 8
  enabled: true
  compatibility: native
  compatibilityNote: 负责写正文前的单章执行方案和章后备忘。
  references:
    - file: references/chapter-plan-checks.md
      loadWhen:
        task: chapter-scene-plan
    - file: references/chapter-plan-checks.md
      loadWhen:
        task: chapter-memo
---

# Novel Chapter Plan

## Role

Turn an outline item into a chapter execution plan. Keep the plan practical enough for immediate drafting.

## Workflow

1. Identify chapter job: introduce, escalate, reveal, pay off, transition, repair, or deepen.
2. Define reader expectation from prior context.
3. Split the chapter into 3-7 scenes or beats.
4. Assign each beat one function: action, dialogue, discovery, emotional shift, choice, or hook.
5. Record continuity constraints and do-not-do items.

## Output

For scene plans, return short scene focuses.

For memo tasks, cover:

- current task
- reader expectation
- payoffs
- holds
- transition function
- decision checks
- ending changes
- do not do

Use [chapter-plan-checks.md](references/chapter-plan-checks.md) before finalizing.

