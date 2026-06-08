---
name: novel-setting-system
description: 小说世界观与设定体系。用于构建力量体系、规则边界、地图势力、组织制度、经济社会、悬念谜题和设定一致性，适合 worldview-entry、worldview-enhance、project-bootstrap、spiral-expand、spiral-validate 任务；作为原有 novel-worldbuilding 的流程化单一职责版本。
manifest:
  category: writing
  tasks:
    - novel-orchestrator
    - worldview-entry
    - worldview-enhance
    - project-bootstrap
    - spiral-expand
    - spiral-validate
  stages:
    - premise
    - setting
  triggers:
    - 世界观
    - 设定
    - 力量体系
    - 地图
    - 势力
    - 规则
  priority: 8
  enabled: true
  compatibility: native
  compatibilityNote: 负责把世界规则沉淀为可维护设定资产。
  references:
    - file: references/worldbuilding-rules.md
      loadWhen:
        task: worldview-entry
    - file: references/worldbuilding-rules.md
      loadWhen:
        task: worldview-enhance
---

# Novel Setting System

## Role

Build world rules that create story pressure. Treat setting as a conflict system, not decoration.

## Workflow

1. Identify the story function of each setting element: obstacle, resource, temptation, mystery, status marker, or cost.
2. Define hard rules before exceptions. If an exception exists, attach a cost.
3. Make rules visible through character choices, not encyclopedia exposition.
4. Connect factions, geography, economy, and power systems to recurring conflict.
5. Keep a contradiction ledger when enhancing existing settings.

## Output

For `worldview-entry`, return one focused entry with type, title, and content.

For enhancement or validation tasks, return:

- new or revised rules
- affected characters or factions
- conflict opportunities
- contradiction risks
- follow-up questions only when essential

Use [worldbuilding-rules.md](references/worldbuilding-rules.md) for consistency checks.

