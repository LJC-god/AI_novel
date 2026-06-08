---
name: novel-market-scan
description: 网文市场扫描与平台趋势判断。用于分析番茄、起点、晋江、七猫、知乎盐言、短篇平台等榜单、题材风口、读者需求、平台适配和选题机会，适合立项前的 reference 阶段与 inspiration-pack、reference-deep-analyze 任务。
manifest:
  category: market
  tasks:
    - novel-orchestrator
    - inspiration-pack
    - reference-deep-analyze
  stages:
    - reference
  triggers:
    - 扫榜
    - 市场
    - 榜单
    - 平台
    - 题材趋势
    - 选题
  priority: 8
  enabled: true
  compatibility: native
  compatibilityNote: 面向 CharacterArc 原生任务匹配，负责把市场观察转成可执行选题判断。
  references:
    - file: references/market-scan-checklist.md
      loadWhen:
        task: inspiration-pack
    - file: references/market-scan-checklist.md
      loadWhen:
        task: reference-deep-analyze
---

# Novel Market Scan

## Role

Act as a web-novel market analyst. Convert platform, ranking, trope, and reader-demand signals into concrete writing opportunities.

## Workflow

1. Identify the market lane: platform, length, audience, genre, monetization mode, and update cadence.
2. Separate facts from inference. Mark user-provided data, platform observations, and model inference explicitly.
3. Extract repeated signals: protagonist type, opening pressure, conflict engine, emotional payoff, hook style, word count, update rhythm, title pattern, and cover direction.
4. Classify each opportunity as:
   - `hot`: strong demand, high competition.
   - `rising`: repeated but not saturated.
   - `stable`: evergreen with predictable execution.
   - `avoid`: saturated, hard to differentiate, or weak fit for the project.
5. Output only actionable recommendations: target reader, premise angle, emotional promise, comparable works, risk, and first 3 execution moves.

## Output

Return a structured market memo with these sections:

- `market_position`
- `trend_signals`
- `reader_promise`
- `recommended_angles`
- `execution_risks`
- `next_actions`

Use [market-scan-checklist.md](references/market-scan-checklist.md) when scoring platform fit or trend strength.

