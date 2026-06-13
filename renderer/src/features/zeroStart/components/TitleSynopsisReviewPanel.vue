<script setup lang="ts">
import { NButton, NEmpty, NTag } from 'naive-ui'
import type { TitleSynopsisCandidate } from '../types'

defineProps<{
  candidates: TitleSynopsisCandidate[]
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'generate'): void
  (e: 'approve', synopsisId: string): void
}>()
</script>

<template>
  <section class="synopsis-panel">
    <header>
      <h2>书名简介审核</h2>
      <n-button type="primary" secondary :loading="loading" @click="emit('generate')">生成候选</n-button>
    </header>
    <n-empty v-if="candidates.length === 0" description="通过风格审核后生成书名简介候选。" />
    <article v-for="candidate in candidates" :key="candidate.id" class="synopsis-item">
      <h3>{{ candidate.title }}</h3>
      <p>{{ candidate.introShort }}</p>
      <div class="synopsis-tags">
        <n-tag v-for="tag in candidate.tags" :key="tag" size="small">{{ tag }}</n-tag>
      </div>
      <n-button type="primary" secondary :loading="loading" @click="emit('approve', candidate.id)">审核通过</n-button>
    </article>
  </section>
</template>

<style scoped>
.synopsis-panel,
.synopsis-item {
  display: grid;
  gap: 14px;
}

.synopsis-panel header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.synopsis-panel h2,
.synopsis-item h3 {
  margin: 0;
  letter-spacing: 0;
}

.synopsis-item {
  padding: 16px;
  border: 1px solid var(--arc-border);
  border-radius: 8px;
  background: var(--arc-bg-surface);
}

.synopsis-item p {
  margin: 0;
  color: var(--arc-text-secondary);
  line-height: 1.6;
}

.synopsis-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
</style>
