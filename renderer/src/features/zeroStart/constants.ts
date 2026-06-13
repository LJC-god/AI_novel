import type { ZeroStartTargetLength, ZeroStartPlatform } from './types'

export const ZERO_START_LENGTH_OPTIONS: Array<{
  value: ZeroStartTargetLength
  label: string
  targetWords: number
  description: string
}> = [
  {
    value: 'short_100k',
    label: '10 万字短篇',
    targetWords: 100000,
    description: '适合先完成一个完整闭环。'
  },
  {
    value: 'medium_300k',
    label: '30 万字中篇',
    targetWords: 300000,
    description: '适合新人练习稳定连载节奏。'
  },
  {
    value: 'long_800k',
    label: '80 万字长篇',
    targetWords: 800000,
    description: '适合主线升级和多卷推进。'
  },
  {
    value: 'super_long_1200k',
    label: '120 万字超长篇',
    targetWords: 1200000,
    description: '适合强类型商业长线。'
  }
]

export const ZERO_START_PLATFORM_OPTIONS: Array<{
  value: ZeroStartPlatform
  label: string
}> = [
  { value: 'fanqie', label: '番茄' },
  { value: 'qidian', label: '起点' },
  { value: 'jinjiang', label: '晋江' },
  { value: 'qimao', label: '七猫' },
  { value: 'zhihu', label: '知乎' },
  { value: 'generic', label: '通用平台' }
]

export const ZERO_START_DEFAULT_AUDIENCE = '零基础网文新人读者'
