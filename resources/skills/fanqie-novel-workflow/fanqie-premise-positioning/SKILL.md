---
name: fanqie-premise-positioning
description: 番茄小说长篇立项定位。用于从用户偏好生成可投稿的题材方向、书名、简介、读者承诺、前3万字卖点和风险修正，适合 novel-orchestrator、project-bootstrap、inspiration-pack 阶段。
manifest:
  category: writing
  tasks:
    - novel-orchestrator
    - project-bootstrap
    - inspiration-pack
  stages:
    - premise
  triggers:
    - 番茄
    - 投稿
    - 立项
    - 简介
    - 书名
    - 卖点
  priority: 10
  enabled: true
  compatibility: native
  compatibilityNote: 面向番茄长篇开书前定位，输出能进入大纲和黄金三章的项目承诺。
---

# Fanqie Premise Positioning

## Role

Turn loose user preference into a Fanqie-ready long-form premise.

## Workflow

1. Lock lane: genre, length, audience promise, protagonist fantasy, repeatable conflict.
2. Create 3-5 title options. Prefer clear genre signal, hook, contrast, and easy recall.
3. Write a 30-character selling point and a 150-250 character synopsis.
4. Define the first 30k words:
   - opening crisis
   - first ally or debt
   - first antagonist pressure
   - first visible payoff
5. List rejection risks and concrete fixes.

## Output Contract

Return:

- recommended title
- backup titles
- tags
- 30-character hook
- synopsis
- reader promise
- first-30k execution points
- risks and fixes
