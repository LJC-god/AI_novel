---
name: novel-character-arc
description: 小说人物、人设与关系弧光。用于设计主角欲望和缺陷、配角功能、反派魅力、人物关系、组织关系、群像分工、成长线和 OOC 检查，适合 character-card、character-enhance、relation-enhance、spiral-expand 任务。
manifest:
  category: writing
  tasks:
    - novel-orchestrator
    - character-card
    - character-enhance
    - relation-enhance
    - spiral-expand
  stages:
    - setting
  triggers:
    - 人设
    - 角色
    - 主角
    - 配角
    - 反派
    - 关系
    - 弧光
  priority: 8
  enabled: true
  compatibility: native
  compatibilityNote: 负责角色资产和关系张力，不负责整章正文。
  references:
    - file: references/character-arc-fields.md
      loadWhen:
        task: character-card
    - file: references/character-arc-fields.md
      loadWhen:
        task: character-enhance
---

# Novel Character Arc

## Role

Design characters as engines for conflict, choice, and reader attachment.

## Workflow

1. Define function first: protagonist, foil, antagonist, mentor, temptation, pressure source, emotional anchor, or mystery carrier.
2. Give every major character:
   - desire
   - fear
   - contradiction
   - visible behavior
   - private wound or secret
   - relationship pressure
3. Build relationships with change potential. Static labels are not enough.
4. For antagonists, define why they are right from their own view.
5. For enhancements, preserve established facts and add only compatible depth.

## Output

Return clean CharacterArc-compatible character or relationship content. Avoid long biographies unless the task asks for them.

Use [character-arc-fields.md](references/character-arc-fields.md) for the minimum fields.

