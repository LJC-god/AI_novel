<script setup lang="ts">
import { NButton, NInput } from 'naive-ui'
import { ref } from 'vue'
import IdeaCardGrid from './IdeaCardGrid.vue'
import type { InspirationCard } from '../types'

defineProps<{
  cards: InspirationCard[]
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'approve', cardId: string): void
  (e: 'merge', payload: { ideaIds: string[]; userPreference: string }): void
  (e: 'next'): void
}>()

const selectedIds = ref<string[]>([])
const mergePreference = ref('')

function toggle(id: string): void {
  selectedIds.value = selectedIds.value.includes(id)
    ? selectedIds.value.filter((item) => item !== id)
    : [...selectedIds.value, id]
}
</script>

<template>
  <section class="review-panel">
    <header>
      <h2>灵感卡审核</h2>
      <n-button secondary :disabled="!cards.some((card) => card.status === 'approved')" @click="emit('next')">进入风格审核</n-button>
    </header>
    <IdeaCardGrid :cards="cards" :loading="loading" @approve="emit('approve', $event)" />
    <div class="merge-row">
      <div class="merge-list">
        <button v-for="card in cards" :key="card.id" type="button" :class="{ active: selectedIds.includes(card.id) }" @click="toggle(card.id)">
          {{ card.title }}
        </button>
      </div>
      <n-input v-model:value="mergePreference" placeholder="合并偏好，例如：保留第一个主角，采用第二个开篇钩子" />
      <n-button :loading="loading" :disabled="selectedIds.length < 2" @click="emit('merge', { ideaIds: selectedIds, userPreference: mergePreference })">合并选中</n-button>
    </div>
  </section>
</template>

<style scoped>
.review-panel {
  display: grid;
  gap: 16px;
}

.review-panel header,
.merge-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.review-panel h2 {
  margin: 0;
  font-size: 20px;
  letter-spacing: 0;
}

.merge-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.merge-list button {
  min-height: 32px;
  border: 1px solid var(--arc-border);
  border-radius: 8px;
  background: var(--arc-bg-surface);
  color: var(--arc-text-secondary);
  cursor: pointer;
}

.merge-list button.active {
  border-color: var(--arc-primary);
  color: var(--arc-primary);
}

@media (max-width: 760px) {
  .review-panel header,
  .merge-row {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
