<template>
  <!-- 统计卡片组件 - 与V1.1 StatCards.tsx 完全一致 -->
  <div :class="`grid ${colClasses} gap-4`">
    <div
      v-for="(card, index) in cards"
      :key="index"
      :class="[
        'bg-white rounded-lg p-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow',
        card.onClick || card.navigateTo ? 'cursor-pointer' : ''
      ]"
      @click="handleCardClick(card)"
    >
      <div class="flex items-center gap-2">
        <div
          :class="`w-8 h-8 rounded-lg bg-gradient-to-br ${card.iconBgColor || 'from-emerald-500 to-emerald-600'} flex items-center justify-center`"
        >
          <component :is="card.icon" :size="16" color="white" />
        </div>
        <div>
          <p class="text-xl font-bold text-gray-900">{{ card.value }}</p>
          <p class="text-xs text-gray-500">{{ card.label }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  cards: { type: Array, required: true }
})

const router = useRouter()

const colClasses = computed(() =>
  props.cards.length <= 4
    ? 'grid-cols-2 md:grid-cols-4'
    : 'grid-cols-2 md:grid-cols-4 lg:grid-cols-5'
)

function handleCardClick(card) {
  if (card.onClick) card.onClick()
  if (card.navigateTo) router.push(card.navigateTo)
}
</script>
