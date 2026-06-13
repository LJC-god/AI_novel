import type { z } from 'zod'
import type { PromptPair } from '../shared-types'
import type { PromptBuildInput } from './base'

type ZeroStartPromptConfig = {
  agentName: string
  taskGoal: string
  contextKeys: string[]
  outputContract: string
  rules?: string[]
}

function stringifyForPrompt(value: unknown): string {
  if (value === undefined || value === null || value === '') {
    return 'not provided'
  }

  if (typeof value === 'string') {
    return value.trim() || 'not provided'
  }

  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

function formatContextBlock(context: Record<string, unknown>, keys: string[]): string {
  return keys
    .map((key) => `## ${key}\n${stringifyForPrompt(context[key])}`)
    .join('\n\n')
}

export function buildZeroStartJsonPrompt(input: PromptBuildInput, config: ZeroStartPromptConfig): PromptPair {
  const { context, capabilityPreamble, skillsBlock, knowledgeBlock } = input
  const extraRules = config.rules?.length
    ? config.rules.map((rule, index) => `${index + 1}. ${rule}`).join('\n')
    : 'No extra rule.'

  return {
    system: `${capabilityPreamble.system}

You are ${config.agentName} in CharacterArc zero-start novel workflow.
Return exactly one JSON object. Do not return markdown, comments, or explanations.
All user-facing prose in JSON values must be Simplified Chinese.
Only use abstract style, structure, pacing, and commercial-writing rules from references. Do not copy protected expression.
Every field must be directly storable by the existing SQLite zero-start schema.
If a field needs an id or timestamp and the context does not provide one, create a stable placeholder string that can be replaced later.
Prefer conservative risk notes over unsupported claims.

Task goal:
${config.taskGoal}`,
    user: `${capabilityPreamble.user}

Zero-start task context:

${formatContextBlock(context, config.contextKeys)}

Knowledge context:
${knowledgeBlock || 'not provided'}

Enabled project skills:
${skillsBlock || 'not provided'}

Extra rules:
${extraRules}

Return JSON matching this contract:
${config.outputContract}`
  }
}

export function describeZodValidationErrors<T>(result: unknown, schema: z.ZodType<T>): string[] {
  const parsed = schema.safeParse(result)
  if (parsed.success) {
    return []
  }

  return parsed.error.issues.map((issue) => {
    const path = issue.path.length > 0 ? issue.path.join('.') : '(root)'
    return `${path}: ${issue.message}`
  })
}
