<script setup lang="ts">
import { NButton, NEmpty, NTag } from 'naive-ui'
import type { StyleFingerprint } from '../types'

defineProps<{
  fingerprints: StyleFingerprint[]
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'approve-default'): void
  (e: 'approve', fingerprint: StyleFingerprint): void
}>()
</script>

<template>
  <section class="style-panel">
    <header>
      <h2>拆书风格卡审核</h2>
      <n-button secondary :loading="loading" @click="emit('approve-default')">使用默认新人友好风格</n-button>
    </header>
    <n-empty v-if="fingerprints.length === 0" description="还没有风格卡，可先使用默认风格继续流程。" />
    <article v-for="fingerprint in fingerprints" :key="fingerprint.id" class="style-item">
      <div>
        <h3>{{ fingerprint.title }}</h3>
        <p>{{ fingerprint.sellPointPattern }}</p>
      </div>
      <div class="style-tags">
        <n-tag v-for="rule in fingerprint.avoidRules.slice(0, 4)" :key="rule" size="small" type="warning">{{ rule }}</n-tag>
      </div>
      <n-button type="primary" secondary :loading="loading" @click="emit('approve', fingerprint)">审核通过</n-button>
    </article>
  </section>
</template>

<style scoped>
.style-panel,
.style-item {
  display: grid;
  gap: 14px;
}

.style-panel header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.style-panel h2,
.style-item h3 {
  margin: 0;
  letter-spacing: 0;
}

.style-item {
  padding: 16px;
  border: 1px solid var(--arc-border);
  border-radius: 8px;
  background: var(--arc-bg-surface);
}

.style-item p {
  color: var(--arc-text-secondary);
}

.style-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
</style>
