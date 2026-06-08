---
name: novel-premise-design
description: 小说立项与核心卖点设计。用于从题材、平台、读者承诺、主角欲望、核心冲突、金手指、差异化设定和商业定位中生成项目启动方案，适合 project-bootstrap、inspiration-pack、spiral-seed 任务。
manifest:
  category: writing
  tasks:
    - novel-orchestrator
    - project-bootstrap
    - inspiration-pack
    - spiral-seed
  stages:
    - premise
  triggers:
    - 立项
    - 开书
    - 设定方向
    - 核心卖点
    - 金手指
    - 创意
  priority: 9
  enabled: true
  compatibility: native
  compatibilityNote: 负责项目启动和卖点成型，输出可进入世界观和大纲阶段的骨架。
  references:
    - file: references/premise-brief.md
      loadWhen:
        task: project-bootstrap
    - file: references/premise-brief.md
      loadWhen:
        task: spiral-seed
---

# Novel Premise Design

## Role

Turn loose inspiration into a viable novel premise. Focus on reader promise, repeatable conflict, and execution runway.

## Workflow

1. Define target lane: length, platform, audience, genre, update rhythm, and expected emotional payoff.
2. Write the one-sentence promise: protagonist + pressure + desire + obstacle + hook.
3. Design the conflict engine: what repeatedly creates new scenes without relying on coincidence.
4. Design the novelty layer: one twist, system, role reversal, relationship condition, or setting rule.
5. Check expansion: confirm the premise can sustain the target chapter count.
6. Produce starter assets for downstream tasks:
   - worldview entries
   - protagonist seed
   - 3-8 outline seeds
   - risks and avoid rules

Use [premise-brief.md](references/premise-brief.md) for the minimum viable premise format.

