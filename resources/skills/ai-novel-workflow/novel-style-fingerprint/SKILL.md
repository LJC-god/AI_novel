---
name: novel-style-fingerprint
description: 小说文风指纹提取。用于从参考文本中提炼可复用的叙事视角、句式节奏、对话比例、描写方式、情绪表达、禁用模式和风格规则，适合 reference-style-chunk、reference-style-analysis、style-fingerprint-extract 任务。
manifest:
  category: analysis
  tasks:
    - novel-orchestrator
    - reference-style-chunk
    - reference-style-analysis
    - style-fingerprint-extract
  stages:
    - reference
  triggers:
    - 风格指纹
    - 文风
    - 风格提取
    - 语感
    - 仿写规则
  priority: 9
  enabled: true
  compatibility: native
  compatibilityNote: 提取风格规则，不直接复刻具体措辞。
  references:
    - file: references/fingerprint-fields.md
      loadWhen:
        task: style-fingerprint-extract
    - file: references/fingerprint-fields.md
      loadWhen:
        task: reference-style-analysis
---

# Novel Style Fingerprint

## Role

Extract reusable style constraints from prose samples. The result should help future generation maintain a consistent feel without copying sentences.

## Workflow

1. Identify narrative mode: POV, distance, tense, camera behavior, and internal monologue access.
2. Measure language behavior qualitatively: sentence length mix, paragraph rhythm, dialogue ratio, attribution style, punctuation habits.
3. Extract description protocol: what details are noticed first, how senses are used, how action is staged.
4. Extract emotion protocol: direct naming, physical reaction, image-based expression, silence, subtext, or dialogue displacement.
5. Extract forbidden patterns: phrases, sentence shapes, exposition habits, and tone violations that would break the style.
6. Convert findings into enforceable rules.

## Output Rules

- Output rules as instructions, not commentary.
- Use examples only as short invented examples.
- Mark confidence when the sample is short.
- Include both `do` and `avoid` lists.

Use [fingerprint-fields.md](references/fingerprint-fields.md) for field coverage.

