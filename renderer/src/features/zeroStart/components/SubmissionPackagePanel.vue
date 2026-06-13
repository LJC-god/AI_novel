<script setup lang="ts">
import { NButton, NEmpty, NTag } from 'naive-ui'
import type { SubmissionPackage } from '../types'

defineProps<{
  submissionPackage: SubmissionPackage | null
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'generate'): void
}>()
</script>

<template>
  <section class="submission-panel">
    <header>
      <h2>投稿包</h2>
      <n-button type="primary" secondary :loading="loading" @click="emit('generate')">生成投稿包</n-button>
    </header>
    <n-empty v-if="!submissionPackage" description="完成正文和质量报告后生成投稿包。" />
    <article v-else class="submission-body">
      <h3>{{ submissionPackage.title }}</h3>
      <p>{{ submissionPackage.introShort }}</p>
      <div>
        <n-tag v-for="tag in submissionPackage.tags" :key="tag" size="small">{{ tag }}</n-tag>
      </div>
      <ul>
        <li v-for="item in submissionPackage.checklist" :key="item.label">
          {{ item.passed ? '已通过' : '待处理' }} · {{ item.label }}
        </li>
      </ul>
    </article>
  </section>
</template>

<style scoped>
.submission-panel,
.submission-body {
  display: grid;
  gap: 14px;
}

.submission-panel header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.submission-panel h2,
.submission-body h3 {
  margin: 0;
  letter-spacing: 0;
}

.submission-body {
  padding: 16px;
  border: 1px solid var(--arc-border);
  border-radius: 8px;
  background: var(--arc-bg-surface);
}

.submission-body p {
  margin: 0;
  color: var(--arc-text-secondary);
}
</style>
