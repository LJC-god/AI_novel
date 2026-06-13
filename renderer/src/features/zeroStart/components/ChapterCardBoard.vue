<script setup lang="ts">
import { NButton, NEmpty } from 'naive-ui'
import type { ChapterCard } from '../types'

defineProps<{
  cards: ChapterCard[]
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'generate'): void
  (e: 'approve', cardId: string): void
  (e: 'draft', cardId: string): void
}>()
</script>

<template>
  <section class="chapter-board">
    <header>
      <h2>章节卡</h2>
      <n-button type="primary" secondary :loading="loading" @click="emit('generate')">生成章节卡</n-button>
    </header>
    <n-empty v-if="cards.length === 0" description="审核大纲后生成章节卡。" />
    <div class="chapter-list">
      <article v-for="card in cards" :key="card.id" class="chapter-card">
        <h3>第 {{ card.chapterNo }} 章 {{ card.title }}</h3>
        <p>{{ card.chapterGoal }}</p>
        <span>{{ card.hookEnding }}</span>
        <footer>
          <n-button secondary :loading="loading" @click="emit('approve', card.id)">审核通过</n-button>
          <n-button type="primary" secondary :loading="loading" @click="emit('draft', card.id)">生成正文</n-button>
        </footer>
      </article>
    </div>
  </section>
</template>

<style scoped>
.chapter-board {
  display: grid;
  gap: 14px;
}

.chapter-board header,
.chapter-card footer {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.chapter-board h2,
.chapter-card h3 {
  margin: 0;
  letter-spacing: 0;
}

.chapter-list {
  display: grid;
  gap: 10px;
}

.chapter-card {
  display: grid;
  gap: 10px;
  padding: 16px;
  border: 1px solid var(--arc-border);
  border-radius: 8px;
  background: var(--arc-bg-surface);
}

.chapter-card p,
.chapter-card span {
  margin: 0;
  color: var(--arc-text-secondary);
}
</style>
