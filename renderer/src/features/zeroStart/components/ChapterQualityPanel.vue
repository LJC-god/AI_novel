<script setup lang="ts">
import { computed } from 'vue'
import { NButton, NEmpty, NProgress, NTag } from 'naive-ui'
import type { ChapterCard, ChapterQualityReport } from '../types'

const props = defineProps<{
  cards: ChapterCard[]
  reports: ChapterQualityReport[]
  reportsByChapter: Record<string, ChapterQualityReport[]>
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'audit', card: ChapterCard): void
}>()

const draftedCards = computed(() =>
  props.cards.filter((card) => Boolean(card.chapterId) && (card.status === 'drafted' || card.status === 'approved'))
)

function latestReport(card: ChapterCard): ChapterQualityReport | null {
  return props.reportsByChapter[card.chapterId]?.[0] ?? null
}

function clampScore(score: number): number {
  if (!Number.isFinite(score)) return 0
  return Math.max(0, Math.min(100, Math.round(score)))
}

function riskType(risk: ChapterQualityReport['originalityRisk']): 'success' | 'warning' | 'error' {
  if (risk === 'high') return 'error'
  if (risk === 'medium') return 'warning'
  return 'success'
}
</script>

<template>
  <section class="chapter-quality-panel">
    <header>
      <div>
        <span>Quality report</span>
        <h2>Chapter audit</h2>
      </div>
      <n-tag size="small" round>{{ reports.length }} reports</n-tag>
    </header>

    <n-empty
      v-if="draftedCards.length === 0"
      description="Generate a chapter draft before running a quality audit."
    />

    <div v-else class="quality-list">
      <article v-for="card in draftedCards" :key="card.id" class="quality-item">
        <div class="quality-item-main">
          <div>
            <h3>{{ card.chapterNo }}. {{ card.title }}</h3>
            <p>{{ card.chapterGoal }}</p>
          </div>
          <n-button size="small" secondary :loading="loading" @click="emit('audit', card)">
            Audit
          </n-button>
        </div>

        <template v-if="latestReport(card)">
          <div class="quality-status">
            <n-tag :type="latestReport(card)?.passed ? 'success' : 'warning'" size="small">
              {{ latestReport(card)?.passed ? 'Passed' : 'Needs revision' }}
            </n-tag>
            <n-tag :type="riskType(latestReport(card)!.originalityRisk)" size="small">
              originalityRisk: {{ latestReport(card)?.originalityRisk }}
            </n-tag>
            <n-tag size="small">
              {{ latestReport(card)?.wordCount }} / {{ latestReport(card)?.targetWordCount }} words
            </n-tag>
          </div>
          <div class="quality-scores">
            <label>
              continuityScore
              <n-progress
                type="line"
                :height="6"
                :border-radius="4"
                :show-indicator="false"
                :percentage="clampScore(latestReport(card)!.continuityScore)"
              />
            </label>
            <label>
              styleMatchScore
              <n-progress
                type="line"
                :height="6"
                :border-radius="4"
                :show-indicator="false"
                :percentage="clampScore(latestReport(card)!.styleMatchScore)"
              />
            </label>
          </div>
          <ul v-if="latestReport(card)!.issues.length > 0" class="quality-issues">
            <li v-for="issue in latestReport(card)!.issues.slice(0, 4)" :key="`${issue.severity}-${issue.message}`">
              <strong>{{ issue.severity }}</strong>
              <span>{{ issue.message }}</span>
            </li>
          </ul>
        </template>
      </article>
    </div>
  </section>
</template>

<style scoped>
.chapter-quality-panel {
  display: grid;
  gap: 16px;
  padding: 18px;
  border: 1px solid var(--arc-border);
  border-radius: 8px;
  background: var(--arc-bg-surface);
}

.chapter-quality-panel header,
.quality-item-main,
.quality-status {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.chapter-quality-panel span {
  color: var(--arc-primary);
  font-size: 12px;
  font-weight: 800;
}

.chapter-quality-panel h2,
.quality-item h3 {
  margin: 0;
  letter-spacing: 0;
}

.quality-list {
  display: grid;
  gap: 10px;
}

.quality-item {
  display: grid;
  gap: 12px;
  padding: 14px;
  border: 1px solid var(--arc-border);
  border-radius: 8px;
  background: var(--arc-bg-weak);
}

.quality-item p {
  margin: 6px 0 0;
  color: var(--arc-text-secondary);
  line-height: 1.55;
}

.quality-status {
  justify-content: flex-start;
  flex-wrap: wrap;
}

.quality-scores {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.quality-scores label {
  display: grid;
  gap: 6px;
  color: var(--arc-text-secondary);
  font-size: 12px;
}

.quality-issues {
  display: grid;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.quality-issues li {
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr);
  gap: 8px;
  color: var(--arc-text-secondary);
  font-size: 12px;
}

.quality-issues strong {
  color: var(--arc-text-primary);
}

@media (max-width: 760px) {
  .quality-item-main,
  .quality-scores {
    grid-template-columns: 1fr;
  }

  .quality-item-main {
    display: grid;
  }
}
</style>
