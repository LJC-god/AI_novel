<script setup lang="ts">
import { computed, reactive } from 'vue'
import { NButton, NCheckbox, NInput, NSelect } from 'naive-ui'
import { PROJECT_GENRE_OPTIONS } from '@/features/wizard/projectGenres'
import { ZERO_START_DEFAULT_AUDIENCE, ZERO_START_LENGTH_OPTIONS, ZERO_START_PLATFORM_OPTIONS } from '../constants'
import type { ZeroStartWizardInput } from '../types'

const props = defineProps<{
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'start', input: ZeroStartWizardInput): void
}>()

const form = reactive<ZeroStartWizardInput>({
  genreKey: 'urban',
  customGenre: '',
  targetLength: 'medium_300k',
  targetWords: 300000,
  platform: 'fanqie',
  audience: ZERO_START_DEFAULT_AUDIENCE,
  tone: '',
  seedIdea: '',
  cloudAllowed: false
})

const genreOptions = PROJECT_GENRE_OPTIONS.map((item) => ({
  label: item.label,
  value: item.key
}))

const lengthOptions = ZERO_START_LENGTH_OPTIONS.map((item) => ({
  label: item.label,
  value: item.value
}))

const platformOptions = ZERO_START_PLATFORM_OPTIONS.map((item) => ({
  label: item.label,
  value: item.value
}))

const selectedLength = computed(() =>
  ZERO_START_LENGTH_OPTIONS.find((item) => item.value === form.targetLength) ?? ZERO_START_LENGTH_OPTIONS[1]
)

function syncTargetWords(value: ZeroStartWizardInput['targetLength']): void {
  const option = ZERO_START_LENGTH_OPTIONS.find((item) => item.value === value)
  form.targetLength = value
  form.targetWords = option?.targetWords ?? 300000
}

function submit(): void {
  emit('start', { ...form })
}
</script>

<template>
  <section class="zero-wizard">
    <header class="zero-wizard__header">
      <span>零基础创作向导</span>
      <h1>选题材和篇幅，先生成一组可审核的灵感卡。</h1>
    </header>

    <div class="zero-wizard__form">
      <label>
        <span>题材</span>
        <n-select v-model:value="form.genreKey" :options="genreOptions" filterable />
      </label>
      <label v-if="form.genreKey === 'custom'">
        <span>自定义题材</span>
        <n-input v-model:value="form.customGenre" placeholder="例如：赛博修仙、悬疑恋爱" />
      </label>
      <label>
        <span>篇幅</span>
        <n-select :value="form.targetLength" :options="lengthOptions" @update:value="syncTargetWords" />
        <small>{{ selectedLength.description }} 目标 {{ form.targetWords.toLocaleString('zh-CN') }} 字</small>
      </label>
      <label>
        <span>平台</span>
        <n-select v-model:value="form.platform" :options="platformOptions" />
      </label>
      <label>
        <span>读者承诺</span>
        <n-input v-model:value="form.audience" placeholder="这本书主要服务谁" />
      </label>
      <label>
        <span>一句种子想法</span>
        <n-input v-model:value="form.seedIdea" type="textarea" :autosize="{ minRows: 3, maxRows: 5 }" placeholder="可留空，让系统从题材和篇幅发散" />
      </label>
      <label>
        <span>语气偏好</span>
        <n-input v-model:value="form.tone" placeholder="例如：轻松爽快、克制悬疑、强情绪" />
      </label>
      <n-checkbox v-model:checked="form.cloudAllowed">允许把本项目内容发送给云模型</n-checkbox>
    </div>

    <footer class="zero-wizard__footer">
      <n-button type="primary" size="large" :loading="props.loading" @click="submit">生成灵感卡</n-button>
    </footer>
  </section>
</template>

<style scoped>
.zero-wizard {
  display: grid;
  gap: 20px;
}

.zero-wizard__header span {
  color: var(--arc-primary);
  font-size: 13px;
  font-weight: 700;
}

.zero-wizard__header h1 {
  margin: 8px 0 0;
  color: var(--arc-text-primary);
  font-size: 26px;
  letter-spacing: 0;
}

.zero-wizard__form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.zero-wizard__form label {
  display: grid;
  gap: 8px;
  color: var(--arc-text-secondary);
  font-size: 13px;
  font-weight: 700;
}

.zero-wizard__form label:has(textarea),
.zero-wizard__form label:nth-last-of-type(2) {
  grid-column: 1 / -1;
}

.zero-wizard__form small {
  color: var(--arc-text-hint);
  font-weight: 500;
}

.zero-wizard__footer {
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 760px) {
  .zero-wizard__form {
    grid-template-columns: 1fr;
  }
}
</style>
