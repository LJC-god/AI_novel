<script setup lang="ts">
import { NButton, NEmpty, NTag } from 'naive-ui'
import type { SubmissionPackage } from '../types'

defineProps<{
  submissionPackage: SubmissionPackage | null
  loading?: boolean
  exportPath?: string
}>()

const emit = defineEmits<{
  (e: 'generate'): void
  (e: 'export-package'): void
}>()
</script>

<template>
  <section class="submission-panel">
    <header>
      <div>
        <span>Submission package</span>
        <h2>Package export</h2>
      </div>
      <div class="submission-actions">
        <n-button type="primary" secondary :loading="loading" @click="emit('generate')">
          Generate package
        </n-button>
        <n-button
          secondary
          :disabled="!submissionPackage"
          :loading="loading"
          @click="emit('export-package')"
        >
          Export package
        </n-button>
      </div>
    </header>

    <n-empty
      v-if="!submissionPackage"
      description="Generate the submission package after drafting chapters and reviewing quality reports."
    />

    <article v-else class="submission-body">
      <h3>{{ submissionPackage.title }}</h3>
      <p>{{ submissionPackage.introShort }}</p>
      <div class="submission-tags">
        <n-tag v-for="tag in submissionPackage.tags" :key="tag" size="small">{{ tag }}</n-tag>
      </div>
      <ul>
        <li v-for="item in submissionPackage.checklist" :key="item.label">
          {{ item.passed ? 'Done' : 'Review' }} · {{ item.label }}
        </li>
      </ul>
      <p v-if="submissionPackage.manuscriptPath || exportPath" class="submission-path">
        {{ exportPath || submissionPackage.manuscriptPath }}
      </p>
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
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.submission-panel span {
  color: var(--arc-primary);
  font-size: 12px;
  font-weight: 800;
}

.submission-panel h2,
.submission-body h3 {
  margin: 0;
  letter-spacing: 0;
}

.submission-actions,
.submission-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.submission-body {
  padding: 16px;
  border: 1px solid var(--arc-border);
  border-radius: 8px;
  background: var(--arc-bg-surface);
}

.submission-body p,
.submission-body ul {
  margin: 0;
  color: var(--arc-text-secondary);
}

.submission-body ul {
  display: grid;
  gap: 6px;
  padding-left: 18px;
}

.submission-path {
  overflow-wrap: anywhere;
  font-size: 12px;
}

@media (max-width: 760px) {
  .submission-panel header {
    flex-direction: column;
  }
}
</style>
