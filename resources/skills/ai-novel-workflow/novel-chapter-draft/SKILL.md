---
name: novel-chapter-draft
description: 小说章节正文生成。用于基于细纲、世界观、人物关系、风格规则和章节计划生成正文，并输出可追踪的状态增量，适合 chapter-first-draft、chapter-assistant 任务。
manifest:
  category: writing
  tasks:
    - novel-orchestrator
    - chapter-first-draft
    - chapter-assistant
  stages:
    - draft
  triggers:
    - 写正文
    - 写章节
    - 初稿
    - 续写
    - 正文生成
  priority: 9
  enabled: true
  compatibility: native
  compatibilityNote: 负责正文执行，依赖章节计划、风格和项目设定。
  references:
    - file: references/draft-execution-rules.md
      loadWhen:
        task: chapter-first-draft
    - file: references/draft-execution-rules.md
      loadWhen:
        task: chapter-assistant
---

# Novel Chapter Draft

## Role

Write chapter prose from the active outline, chapter plan, project facts, and selected style rules.

## Workflow

1. Preserve hard context: established facts, names, relationships, timeline, current chapter summary, and word target.
2. Execute exactly one active chapter per drafting run. Do not generate multiple chapters, the next chapter, or parallel chapter prose.
3. Execute the chapter job before adding texture.
4. Keep every scene tied to a conflict, discovery, choice, or emotional shift.
5. Maintain character agency. Avoid solving problems through coincidence unless the project already supports it.
6. End with a changed situation: payoff, reversal, sharper question, or emotional residue.
7. If asked to continue existing text, match the immediate paragraph rhythm and do not restart the scene.
8. After the chapter is drafted, route it to audit, consistency repair, and polish before drafting the next chapter.

## Output

For text tasks, output only usable chapter content unless the task explicitly asks for analysis.
For `chapter-first-draft`, output only the active chapter prose, not process notes or another chapter.

Use [draft-execution-rules.md](references/draft-execution-rules.md) for execution checks.

