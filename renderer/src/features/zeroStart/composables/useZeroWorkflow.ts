import { computed } from 'vue'
import { useZeroStartStore } from '@/stores/zeroStart'

export function useZeroWorkflow() {
  const zeroStartStore = useZeroStartStore()

  const canReviewIdeas = computed(() => zeroStartStore.inspirationCards.length > 0)
  const canReviewSynopsis = computed(() => zeroStartStore.synopsisCandidates.length > 0)
  const canReviewOutline = computed(() => Boolean(zeroStartStore.masterOutline))
  const canReviewChapterCards = computed(() => zeroStartStore.chapterCards.length > 0)
  const canReviewSubmission = computed(() => Boolean(zeroStartStore.submissionPackage))

  return {
    zeroStartStore,
    canReviewIdeas,
    canReviewSynopsis,
    canReviewOutline,
    canReviewChapterCards,
    canReviewSubmission
  }
}
