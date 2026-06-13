<script setup lang="ts">
import { NButton, NTag } from 'naive-ui'
import type { InspirationCard } from '../types'

defineProps<{
  cards: InspirationCard[]
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'approve', cardId: string): void
}>()
</script>

<template>
  <div class="idea-grid">
    <article v-for="card in cards" :key="card.id" class="idea-card">
      <header>
        <div>
          <h3>{{ card.title }}</h3>
          <p>{{ card.oneLineHook }}</p>
        </div>
        <n-tag size="small" :type="card.status === 'approved' ? 'success' : 'default'">{{ card.status }}</n-tag>
      </header>
      <dl>
        <div>
          <dt>主角</dt>
          <dd>{{ card.protagonistDesign }}</dd>
        </div>
        <div>
          <dt>冲突</dt>
          <dd>{{ card.coreConflict }}</dd>
        </div>
        <div>
          <dt>追读动力</dt>
          <dd>{{ card.longTermDrive }}</dd>
        </div>
      </dl>
      <div class="idea-card__tags">
        <n-tag v-for="tag in card.tags" :key="tag" size="small">{{ tag }}</n-tag>
      </div>
      <n-button type="primary" secondary :loading="loading" @click="emit('approve', card.id)">审核通过</n-button>
    </article>
  </div>
</template>

<style scoped>
.idea-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 12px;
}

.idea-card {
  display: grid;
  gap: 14px;
  padding: 16px;
  border: 1px solid var(--arc-border);
  border-radius: 8px;
  background: var(--arc-bg-surface);
}

.idea-card header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.idea-card h3 {
  margin: 0;
  color: var(--arc-text-primary);
  font-size: 17px;
  letter-spacing: 0;
}

.idea-card p,
.idea-card dd {
  margin: 0;
  color: var(--arc-text-secondary);
  line-height: 1.6;
}

.idea-card dl {
  display: grid;
  gap: 8px;
  margin: 0;
}

.idea-card dt {
  color: var(--arc-text-hint);
  font-size: 12px;
}

.idea-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
</style>
