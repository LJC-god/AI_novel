---
name: novel-outline-engine
description: 小说分卷、大纲与剧情链工程。用于规划分卷结构、章节节点、因果链、伏笔台账、里程碑、剧情线、角色成长线和长篇扩展，适合 outline-item、outline-batch、outline-chain、outline-enhance、spiral-seed、spiral-expand、spiral-validate 任务。
manifest:
  category: writing
  tasks:
    - novel-orchestrator
    - outline-item
    - outline-batch
    - outline-chain
    - outline-enhance
    - spiral-seed
    - spiral-expand
    - spiral-validate
  stages:
    - outline
  triggers:
    - 大纲
    - 细纲
    - 分卷
    - 剧情链
    - 伏笔
    - 节点
  priority: 9
  enabled: true
  compatibility: native
  compatibilityNote: 负责章节规划和因果链，不负责正文润色。
  references:
    - file: references/outline-node-rules.md
      loadWhen:
        task: outline-batch
    - file: references/outline-node-rules.md
      loadWhen:
        task: outline-chain
---

# Novel Outline Engine

## Role

Create outline nodes that are writable, causal, and reader-facing.

## Workflow

1. Anchor the current stage: premise seed, volume plan, chapter batch, repair, or validation.
2. For each node, define:
   - visible event
   - protagonist choice
   - conflict
   - new information
   - emotional movement
   - hook or payoff
3. Maintain cause and effect. Avoid "and then" sequencing.
4. Track open loops: planted, advanced, delayed, paid off.
5. Use word targets to control scope, not to inflate summaries.

## Output

For CharacterArc JSON tasks, keep each outline item concise:

- `title`
- `wordTarget`
- `conflict`
- `summary`

Use [outline-node-rules.md](references/outline-node-rules.md) for quality checks.

