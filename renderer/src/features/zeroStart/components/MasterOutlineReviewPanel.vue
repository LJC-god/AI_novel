<script setup lang="ts">
import { NButton, NEmpty } from 'naive-ui'
import type { MasterOutline } from '../types'

defineProps<{
  outline: MasterOutline | null
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'generate'): void
  (e: 'approve'): void
}>()
</script>

<template>
  <section class="outline-panel">
    <header>
      <h2>全书大纲审核</h2>
      <div>
        <n-button secondary :loading="loading" @click="emit('generate')">生成大纲</n-button>
        <n-button type="primary" secondary :disabled="!outline" :loading="loading" @click="emit('approve')">审核通过</n-button>
      </div>
    </header>
    <n-empty v-if="!outline" description="通过书名简介后生成全书大纲。" />
    <article v-else class="outline-body">
      <h3>{{ outline.title }}</h3>
      <p>{{ outline.logline }}</p>
      <ol>
        <li v-for="volume in outline.volumes" :key="volume.id">
          <strong>{{ volume.title }}</strong>
          <span>{{ volume.summary }}</span>
        </li>
      </ol>
    </article>
  </section>
</template>

<style scoped>
.outline-panel,
.outline-body {
  display: grid;
  gap: 14px;
}

.outline-panel header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.outline-panel header > div {
  display: flex;
  gap: 8px;
}

.outline-panel h2,
.outline-body h3 {
  margin: 0;
  letter-spacing: 0;
}

.outline-body {
  padding: 16px;
  border: 1px solid var(--arc-border);
  border-radius: 8px;
  background: var(--arc-bg-surface);
}

.outline-body p,
.outline-body span {
  color: var(--arc-text-secondary);
}
</style>
