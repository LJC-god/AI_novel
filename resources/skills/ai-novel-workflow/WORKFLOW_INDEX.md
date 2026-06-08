# AI Novel Workflow Skill Index

## Purpose

This folder contains the workflow-level skills extracted from the platform analysis. Each `novel-*` folder keeps one responsibility and can be matched independently by the CharacterArc skill registry.

## Platform Built-In Skill Sources

The platform already includes these built-in skill groups:

- `Distilled-Novel-Toolbox`: domain knowledge modules such as genre, emotion, pacing, pleasure points, commercialization, worldbuilding, character design, polishing, compliance, and anti-detection.
- `oh-story-claudecode`: long/short story scan, analyze, write, repair, blueprint, tomato formatting, cover, and deslop workflows.
- `community-skills`: reusable style and humanization skills: `humanizer-zh`, `style-fingerprint`, `style-fusion`.

These are source capabilities. They provide methods, references, and local writing heuristics, but many of them combine multiple stages in one skill.

## Workflow-Derived Skills

The following skills are the new workflow decomposition. They are intentionally narrower than the source packs:

- `novel-market-scan`: market lane, platform fit, trend and reader-promise analysis.
- `novel-reference-deconstruct`: reference-book teardown and reusable structure extraction.
- `novel-style-fingerprint`: style signal extraction and reusable prose constraints.
- `novel-premise-design`: premise, selling point, reader promise, and project seed.
- `novel-setting-system`: worldbuilding, rules, factions, boundaries, and consistency constraints.
- `novel-character-arc`: character design, relationship functions, arc logic, and OOC checks.
- `novel-outline-engine`: master outline, volume outline, chapter node, cause-effect chain, and foreshadowing ledger.
- `novel-chapter-plan`: single-chapter scene plan, expectation, emotional beat, and hook.
- `novel-chapter-draft`: chapter prose execution from confirmed outline/assets.
- `novel-emotion-pacing`: emotional curve, pleasure-point density, pacing repair, and reader expectation.
- `novel-polish-humanize`: prose polish, Chinese naturalness, AI-trace removal, and platform readability.
- `novel-audit-repair`: bug/OOC/consistency/style audit and minimum repair plan.
- `novel-cover-prompt`: cover prompt design from title, genre, protagonist, platform, and selling point.

## Source-To-Workflow Mapping

| Workflow skill | Main source skills or platform capability |
| --- | --- |
| `novel-market-scan` | `story-long-scan`, `story-short-scan`, `novel-commercialization`, `novel-genres` |
| `novel-reference-deconstruct` | `story-long-analyze`, `story-short-analyze`, reference import analysis tasks |
| `novel-style-fingerprint` | `style-fingerprint`, `style-fusion`, `novel-language-style` |
| `novel-premise-design` | `story-blueprint`, `novel-innovation`, `novel-commercialization` |
| `novel-setting-system` | `novel-worldbuilding`, worldview generation/enhance tasks |
| `novel-character-arc` | `novel-character-design`, character/relation enhance tasks |
| `novel-outline-engine` | `story-long-write`, `story-short-write`, outline and spiral tasks |
| `novel-chapter-plan` | `story-chapter-exec`, chapter memo and scene-plan tasks |
| `novel-chapter-draft` | `story-long-write`, `story-short-write`, chapter first-draft/assistant tasks |
| `novel-emotion-pacing` | `novel-emotion`, `novel-pacing`, `novel-pleasure-points` |
| `novel-polish-humanize` | `humanizer-zh`, `story-deslop`, `novel-polishing`, `novel-anti-detection` |
| `novel-audit-repair` | `story-chapter-repair`, chapter audit/analysis/repair tasks |
| `novel-cover-prompt` | `story-cover`, cover workbench prompt generation |

## End-To-End Agent Flow

1. Scan/deconstruct references and market signals.
2. Generate inspiration options.
3. User selects type, length, target word count, and platform.
4. Generate premise, master outline, and volume outline.
5. User confirms outline.
6. Generate story assets: worldbuilding, characters, relationships, foreshadowing, constraints.
7. Generate volume/chapter outline, starting with the first volume when requested.
8. User confirms chapter plan.
9. Draft chapters.
10. Audit, repair, polish, and continue.

## Model Roles

The platform setting `modelRoleProfileMap` can route each stage to a different AI profile:

- `orchestrator`: stage control and confirmation questions.
- `deconstruct`: long-context reference analysis.
- `inspiration`: fast idea generation.
- `outline`: premise, master outline, volume outline, and chapter outline.
- `assets`: worldbuilding, characters, relationships, and ledgers.
- `draft`: chapter prose generation.
- `polish`: audit, repair, polish, and humanization.
- `json`: stable structured output when needed.

