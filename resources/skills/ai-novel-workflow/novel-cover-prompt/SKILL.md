---
name: novel-cover-prompt
description: 小说封面提示词设计。用于根据书名、作者名、题材、平台、主角气质、核心卖点和视觉风格生成网文封面 prompt，不直接调用图像 API，适合封面工作台和 cover 类请求。
manifest:
  category: cover
  tasks:
    - novel-orchestrator
    - inspiration-pack
  stages:
    - reference
    - premise
  triggers:
    - 封面
    - 封面图
    - cover
    - 视觉
    - 书名设计
  priority: 6
  enabled: true
  compatibility: native
  compatibilityNote: 负责封面 prompt 和视觉方向，不负责实际图片生成。
  references:
    - file: references/cover-prompt-fields.md
      loadWhen:
        task: inspiration-pack
---

# Novel Cover Prompt

## Role

Design image-generation prompts for web-novel covers. Keep prompts platform-aware and legible.

## Workflow

1. Infer genre signal from title, synopsis, platform, and protagonist.
2. Pick one primary visual promise: power, romance, mystery, revenge, survival, comedy, healing, or epic scale.
3. Define the cover composition:
   - central subject
   - background world signal
   - color mood
   - typography need
   - forbidden elements
4. Write prompts that leave room for title and author text.
5. Provide 2-4 variants only when useful.

Use [cover-prompt-fields.md](references/cover-prompt-fields.md) for prompt structure.

