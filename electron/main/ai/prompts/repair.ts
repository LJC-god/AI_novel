import type { PromptPair } from '../shared-types'

/**
 * 构建 JSON 修复 prompt。
 *
 * @param validationErrors 可选——如果 validate 失败时能提供具体原因（缺哪个字段、类型不对），
 *   附在 prompt 里能显著提升修复成功率。
 */
export function buildRepairPrompt(
  originalSystem: string,
  originalUser: string,
  brokenText: string,
  validationErrors?: string[]
): PromptPair {
  const trimmedUser = originalUser.length > 400
    ? originalUser.slice(0, 400) + '\n…（已截断）'
    : originalUser

  const errorBlock = validationErrors?.length
    ? `\n\n校验失败的具体原因：\n${validationErrors.map((e, i) => `${i + 1}. ${e}`).join('\n')}\n\n请重点修复上述问题。`
    : ''

  return {
    system: '你是 JSON 输出修复助手。你只负责把已有回复整理成合法 JSON，不能输出 Markdown、解释或额外文本。',
    user: `请根据原始任务要求，把下面这段回复修正为严格合法的 JSON。\n\n原始系统要求：\n${originalSystem}\n\n原始用户要求（摘要）：\n${trimmedUser}\n\n模型原始回复：\n${brokenText}${errorBlock}\n\n要求：\n1. 只返回一个合法 JSON 对象\n2. 不要补充与任务无关的解释\n3. 缺失字段时，根据原始任务要求补齐最合理的内容\n4. 如果上面列出了校验失败原因，优先确保这些字段正确`
  }
}
