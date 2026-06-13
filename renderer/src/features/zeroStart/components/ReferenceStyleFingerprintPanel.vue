<script setup lang="ts">
import { computed } from 'vue'
import { NButton, NEmpty, NTag } from 'naive-ui'
import type { ReferenceWorkItem } from '@/types/app'
import type { StyleFingerprint } from '../types'

const props = defineProps<{
  referenceWorks: ReferenceWorkItem[]
  projectId: string
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'save-fingerprint', fingerprint: StyleFingerprint): void
  (e: 'generate-fusion'): void
}>()

const analyzedWorks = computed(() =>
  props.referenceWorks.filter((work) => Boolean(work.analysis))
)

function styleRules(work: ReferenceWorkItem): string[] {
  return work.analysis?.styleRules.slice(0, 3) ?? []
}

function avoidRules(work: ReferenceWorkItem): string[] {
  return work.analysis?.avoidRules.slice(0, 2) ?? []
}

function buildFingerprint(work: ReferenceWorkItem): StyleFingerprint {
  const timestamp = new Date().toISOString()
  const analysis = work.analysis
  return {
    id: `style-${work.id}`,
    projectId: props.projectId,
    sourceReferenceIds: [work.id],
    title: `${work.title} style fingerprint`,
    sellPointPattern: analysis?.overview || work.notes || 'Reference work style pattern',
    protagonistEngine: analysis?.plotOutline || 'A clear protagonist goal drives new costs and choices.',
    conflictEngine: analysis?.pacingControl || 'Escalating obstacles and information gaps drive conflict.',
    povRule: analysis?.narrativePerspective || 'Keep a stable point of view.',
    pacingRule: analysis?.pacingControl || 'Every chapter needs visible progress and an ending hook.',
    chapterHookTypes: (analysis?.styleRules ?? []).slice(0, 4),
    sentenceRegister: {
      sentenceStyle: analysis?.sentenceStyle ?? '',
      dialogueRatio: analysis?.dialogueRatio ?? '',
      emotionExpression: analysis?.emotionExpression ?? '',
      reusableStylePrompt: analysis?.reusableStylePrompt ?? ''
    },
    emotionCurve: analysis?.emotionExpression || 'pressure-response-progress',
    structurePattern: analysis?.plotOutline || 'goal-conflict-progress-hook',
    reusableRules: analysis?.styleRules?.length
      ? analysis.styleRules
      : ['Keep concrete action, consequence, and new information in every scene.'],
    avoidRules: analysis?.avoidRules?.length
      ? analysis.avoidRules
      : ['Do not copy characters, proper nouns, plots, scenes, or distinctive expressions from references.'],
    copyrightSafetyNote:
      'Generated from abstract deconstruction signals only: structure, pacing, and writing rules. Do not store or reuse protected passages.',
    status: 'draft',
    createdAt: timestamp,
    updatedAt: timestamp
  }
}
</script>

<template>
  <section class="reference-style-panel">
    <header>
      <div>
        <span>ZeroStart style fusion</span>
        <h2>Reference style fingerprints</h2>
      </div>
      <n-button
        type="primary"
        secondary
        :disabled="analyzedWorks.length === 0 || !projectId"
        :loading="loading"
        @click="emit('generate-fusion')"
      >
        Generate fused style
      </n-button>
    </header>

    <n-empty
      v-if="analyzedWorks.length === 0"
      description="Import and analyze reference works before saving style fingerprints."
    />

    <div v-else class="reference-style-list">
      <article v-for="work in analyzedWorks" :key="work.id" class="reference-style-item">
        <div>
          <h3>{{ work.title }}</h3>
          <p>{{ work.analysis?.overview || work.notes }}</p>
        </div>
        <div class="reference-style-tags">
          <n-tag v-for="rule in styleRules(work)" :key="rule" size="small" type="primary">
            {{ rule }}
          </n-tag>
          <n-tag v-for="rule in avoidRules(work)" :key="rule" size="small" type="warning">
            {{ rule }}
          </n-tag>
        </div>
        <n-button
          secondary
          :disabled="!projectId"
          :loading="loading"
          @click="emit('save-fingerprint', buildFingerprint(work))"
        >
          Save fingerprint
        </n-button>
      </article>
    </div>
  </section>
</template>

<style scoped>
.reference-style-panel {
  display: grid;
  gap: 16px;
  padding: 18px;
  border: 1px solid var(--arc-border);
  border-radius: 8px;
  background: var(--arc-bg-surface);
}

.reference-style-panel header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.reference-style-panel span {
  color: var(--arc-primary);
  font-size: 12px;
  font-weight: 800;
}

.reference-style-panel h2,
.reference-style-item h3 {
  margin: 0;
  letter-spacing: 0;
}

.reference-style-list {
  display: grid;
  gap: 10px;
}

.reference-style-item {
  display: grid;
  gap: 12px;
  padding: 14px;
  border: 1px solid var(--arc-border);
  border-radius: 8px;
  background: var(--arc-bg-weak);
}

.reference-style-item p {
  margin: 6px 0 0;
  color: var(--arc-text-secondary);
  line-height: 1.6;
}

.reference-style-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

@media (max-width: 760px) {
  .reference-style-panel header {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
