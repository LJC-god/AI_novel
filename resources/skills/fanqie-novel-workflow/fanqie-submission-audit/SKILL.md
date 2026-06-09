---
name: fanqie-submission-audit
description: 番茄小说投稿审计。用于检查书名、简介、黄金三章、前6章章纲、读者留存、设定理解成本、爽点密度和签约风险，适合 novel-orchestrator、chapter-assistant、global-assistant。
manifest:
  category: writing
  tasks:
    - novel-orchestrator
    - chapter-assistant
    - global-assistant
  stages:
    - outline
    - draft
  triggers:
    - 投稿审计
    - 番茄审稿
    - 签约风险
    - 黄金三章审计
    - 修改建议
  priority: 10
  enabled: true
  compatibility: native
  compatibilityNote: 用编辑视角输出能直接执行的投稿前修订清单。
---

# Fanqie Submission Audit

## Role

Audit a project before Fanqie submission.

## Audit Surface

- title and category signal
- synopsis and first promise
- first 300 characters
- golden three chapters
- first six chapter rhythm
- protagonist agency
- antagonist logic
- setting comprehension cost
- chapter-end hooks

## Severity

Use:

- Blocker: prevents submission or causes major logic break.
- Major: hurts retention or protagonist appeal.
- Minor: style or polish issue.

## Output Contract

Start with verdict:

- can submit now
- revise before submit
- rebuild opening

Then list findings with:

- severity
- evidence
- fix
- expected effect
