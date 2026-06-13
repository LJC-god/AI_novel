<script setup lang="ts">
import { computed } from 'vue'
import { ArrowLeft } from 'lucide-vue-next'
import { NAlert, NButton, NSteps, NStep, useMessage } from 'naive-ui'
import { useAppStore } from '@/stores/app'
import { useZeroWorkflow } from '@/features/zeroStart/composables/useZeroWorkflow'
import ZeroStartWizard from '@/features/zeroStart/components/ZeroStartWizard.vue'
import IdeaReviewPanel from '@/features/zeroStart/components/IdeaReviewPanel.vue'
import StyleFingerprintPanel from '@/features/zeroStart/components/StyleFingerprintPanel.vue'
import StyleFusionPanel from '@/features/zeroStart/components/StyleFusionPanel.vue'
import TitleSynopsisReviewPanel from '@/features/zeroStart/components/TitleSynopsisReviewPanel.vue'
import MasterOutlineReviewPanel from '@/features/zeroStart/components/MasterOutlineReviewPanel.vue'
import ChapterCardBoard from '@/features/zeroStart/components/ChapterCardBoard.vue'
import SubmissionPackagePanel from '@/features/zeroStart/components/SubmissionPackagePanel.vue'
import type { StyleFingerprint, ZeroStartWizardInput } from '@/features/zeroStart/types'

const appStore = useAppStore()
const { zeroStartStore } = useZeroWorkflow()
const message = useMessage()

const stepIndex = computed(() => {
  const order = ['wizard', 'ideas', 'style', 'synopsis', 'outline', 'chapters', 'draft', 'submission']
  return Math.max(1, order.indexOf(zeroStartStore.currentStage) + 1)
})

function backToProjects(): void {
  appStore.backToProjects()
}

async function start(input: ZeroStartWizardInput): Promise<void> {
  try {
    await zeroStartStore.startFromWizard(input)
    message.success('已生成灵感卡，请先审核一个方向')
  } catch {
    message.error(zeroStartStore.lastError || '零基础流程启动失败')
  }
}

async function approveIdea(cardId: string): Promise<void> {
  try {
    await zeroStartStore.approveIdea(cardId)
    message.success('灵感卡已通过')
  } catch {
    message.error(zeroStartStore.lastError || '审核失败')
  }
}

async function mergeIdeas(payload: { ideaIds: string[]; userPreference: string }): Promise<void> {
  try {
    await zeroStartStore.mergeIdeas(payload.ideaIds, payload.userPreference)
    message.success('已生成合并灵感卡')
  } catch {
    message.error(zeroStartStore.lastError || '合并失败')
  }
}

function createDefaultStyleFingerprint(): StyleFingerprint {
  const timestamp = new Date().toISOString()
  return {
    id: `style-default-${Date.now()}`,
    projectId: zeroStartStore.activeProjectId,
    sourceReferenceIds: [],
    title: '新人友好默认风格',
    sellPointPattern: '开局给出明确目标，中段持续兑现小爽点，结尾保留下一章钩子。',
    protagonistEngine: '低起点主角通过具体行动逐步变强。',
    conflictEngine: '外部压力推动选择，选择带来新代价。',
    povRule: '第三人称有限视角，优先贴近主角感受。',
    pacingRule: '每章至少一次信息增量或关系变化。',
    chapterHookTypes: ['倒计时', '选择题', '新信息'],
    sentenceRegister: { rhythm: 'short', diction: 'clear' },
    emotionCurve: '压力-尝试-小胜-新问题',
    structurePattern: '目标-阻碍-行动-反转-钩子',
    reusableRules: ['每章开头快速进入动作', '每章结尾留下未完成动作'],
    avoidRules: ['不复写参考作品专名和桥段', '不承诺平台收益'],
    copyrightSafetyNote: '仅使用抽象节奏和结构规则，不复制受版权保护表达。',
    status: 'approved',
    createdAt: timestamp,
    updatedAt: timestamp
  }
}

async function approveDefaultStyle(): Promise<void> {
  try {
    await zeroStartStore.saveStyleFingerprint(createDefaultStyleFingerprint(), true)
    message.success('已使用默认风格卡')
  } catch {
    message.error(zeroStartStore.lastError || '保存默认风格失败')
  }
}
</script>

<template>
  <section class="zero-page">
    <header class="zero-header">
      <n-button quaternary @click="backToProjects">
        <template #icon><ArrowLeft :size="18" /></template>
        项目中心
      </n-button>
      <div>
        <span>ZeroStart</span>
        <strong>新人向 AI 小说创作流程</strong>
      </div>
    </header>

    <main class="zero-main arc-scrollbar">
      <aside class="zero-steps">
        <n-steps vertical size="small" :current="stepIndex">
          <n-step title="题材/篇幅" />
          <n-step title="灵感卡审核" />
          <n-step title="风格卡审核" />
          <n-step title="书名简介" />
          <n-step title="全书大纲" />
          <n-step title="章节卡" />
          <n-step title="正文与质量" />
          <n-step title="投稿包" />
        </n-steps>
      </aside>

      <section class="zero-workflow">
        <n-alert v-if="zeroStartStore.lastError" type="error" :show-icon="false">{{ zeroStartStore.lastError }}</n-alert>

        <ZeroStartWizard
          v-if="zeroStartStore.currentStage === 'wizard'"
          :loading="zeroStartStore.isRunning"
          @start="start"
        />

        <IdeaReviewPanel
          v-else-if="zeroStartStore.currentStage === 'ideas'"
          :cards="zeroStartStore.inspirationCards"
          :loading="zeroStartStore.isRunning"
          @approve="approveIdea"
          @merge="mergeIdeas"
          @next="zeroStartStore.currentStage = 'style'"
        />

        <section v-else-if="zeroStartStore.currentStage === 'style'" class="zero-stack">
          <StyleFingerprintPanel
            :fingerprints="zeroStartStore.styleFingerprints"
            :loading="zeroStartStore.isRunning"
            @approve-default="approveDefaultStyle"
            @approve="zeroStartStore.saveStyleFingerprint($event, true)"
          />
          <StyleFusionPanel
            :fingerprints="zeroStartStore.styleFingerprints"
            :loading="zeroStartStore.isRunning"
            @generate="zeroStartStore.generateStyleFusion([], $event)"
          />
        </section>

        <TitleSynopsisReviewPanel
          v-else-if="zeroStartStore.currentStage === 'synopsis'"
          :candidates="zeroStartStore.synopsisCandidates"
          :loading="zeroStartStore.isRunning"
          @generate="zeroStartStore.generateTitleSynopsis()"
          @approve="zeroStartStore.approveTitleSynopsis"
        />

        <MasterOutlineReviewPanel
          v-else-if="zeroStartStore.currentStage === 'outline'"
          :outline="zeroStartStore.masterOutline"
          :loading="zeroStartStore.isRunning"
          @generate="zeroStartStore.generateMasterOutline()"
          @approve="zeroStartStore.approveMasterOutline()"
        />

        <ChapterCardBoard
          v-else-if="zeroStartStore.currentStage === 'chapters' || zeroStartStore.currentStage === 'draft'"
          :cards="zeroStartStore.chapterCards"
          :loading="zeroStartStore.isRunning"
          @generate="zeroStartStore.generateChapterCards()"
          @approve="zeroStartStore.approveChapterCard"
          @draft="zeroStartStore.generateChapterDraftV2"
        />

        <SubmissionPackagePanel
          v-else
          :submission-package="zeroStartStore.submissionPackage"
          :loading="zeroStartStore.isRunning"
          @generate="zeroStartStore.generateSubmissionPackage"
        />
      </section>
    </main>
  </section>
</template>

<style scoped>
.zero-page {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 100%;
  background: var(--arc-bg-body);
}

.zero-header {
  display: flex;
  align-items: center;
  gap: 18px;
  padding:
    calc(var(--arc-titlebar-height) + 18px)
    clamp(16px, 2.4vw, 28px)
    16px;
  border-bottom: 1px solid var(--arc-border);
  background: var(--arc-bg-surface);
}

.zero-header div {
  display: grid;
  gap: 2px;
}

.zero-header span {
  color: var(--arc-primary);
  font-size: 12px;
  font-weight: 800;
}

.zero-header strong {
  color: var(--arc-text-primary);
  font-size: 18px;
}

.zero-main {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 24px;
  width: min(100%, 1180px);
  margin: 0 auto;
  padding: 24px clamp(16px, 2.4vw, 28px) 40px;
  overflow-y: auto;
}

.zero-steps {
  align-self: start;
  padding: 18px;
  border: 1px solid var(--arc-border);
  border-radius: 8px;
  background: var(--arc-bg-surface);
}

.zero-workflow,
.zero-stack {
  display: grid;
  gap: 18px;
}

@media (max-width: 900px) {
  .zero-main {
    grid-template-columns: 1fr;
  }

  .zero-steps {
    display: none;
  }
}
</style>
