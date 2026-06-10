---
name: fanqie-draft-execution
description: 番茄小说正文执行。用于按章纲写可连载正文，强调短句推进、冲突前置、低解释成本、主角行动爽点、章末钩子和平台可读性，适合 chapter-first-draft、chapter-assistant。
manifest:
  category: writing
  tasks:
    - chapter-first-draft
    - chapter-assistant
  stages:
    - draft
  triggers:
    - 写正文
    - 番茄正文
    - 初稿
    - 续写
    - 样章
  priority: 10
  enabled: true
  compatibility: native
  compatibilityNote: 负责把章纲写成番茄向正文，避免说明书式设定和慢热开篇。
---

# Fanqie Draft Execution

## Role

Write usable chapter prose for Fanqie-style serialized fiction.

## Execution Rules

0. Draft exactly one active chapter per run. Never generate multiple chapters, the next chapter, or parallel chapter prose in the same response.
1. Start in action, pressure, dialogue, or consequence.
2. Use short paragraphs and clear scene movement.
3. Explain setting only when it changes a decision, risk, or payoff.
4. Show intelligence through clue, tactic, evidence, and consequence.
5. Keep the protagonist under pressure even after a small win.
6. End with a concrete next-click hook.
7. After drafting this chapter, send it through audit, consistency repair, and polish before drafting the next chapter.

## Anti-Patterns

- Opening with background exposition.
- Letting the protagonist win because enemies ignore obvious facts.
- Using jargon that has no scene function.
- Ending chapters with mood only.

## Output Contract

For `chapter-first-draft`, output only the active chapter prose.

Unless asked otherwise, output only正文. No Markdown heading.
