<script setup lang="ts">
import { NButton, NInput } from 'naive-ui'
import { ref } from 'vue'
import type { StyleFingerprint } from '../types'

defineProps<{
  fingerprints: StyleFingerprint[]
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'generate', preference: string): void
}>()

const preference = ref('')
</script>

<template>
  <section class="fusion-panel">
    <h2>多风格融合</h2>
    <p>已收集 {{ fingerprints.length }} 张风格卡，可融合为项目主风格。</p>
    <n-input v-model:value="preference" placeholder="例如：保留快节奏和强钩子，弱化夸张台词" />
    <n-button type="primary" secondary :loading="loading" @click="emit('generate', preference)">生成融合风格卡</n-button>
  </section>
</template>

<style scoped>
.fusion-panel {
  display: grid;
  gap: 12px;
  padding: 16px;
  border: 1px solid var(--arc-border);
  border-radius: 8px;
  background: var(--arc-bg-weak);
}

.fusion-panel h2,
.fusion-panel p {
  margin: 0;
}
</style>
