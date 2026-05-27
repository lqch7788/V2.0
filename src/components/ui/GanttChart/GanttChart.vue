<template>
  <div class="w-full overflow-x-auto" :class="className">
    <div class="min-w-[600px]">
      <div class="flex border-b border-gray-200 pb-2 mb-2">
        <div class="w-48 flex-shrink-0 text-sm font-medium text-gray-900">任务</div>
        <div class="flex-1 flex">
          <div v-for="i in totalDays" :key="i" class="flex-1 text-xs text-gray-500 text-center">{{ i }}</div>
        </div>
      </div>
      <div v-for="(item, idx) in items" :key="idx" class="flex items-center py-2 border-b border-gray-100">
        <div class="w-48 flex-shrink-0 text-sm text-gray-700 truncate pr-2">{{ item.name }}</div>
        <div class="flex-1 relative h-6">
          <div
            class="absolute top-0 h-5 rounded-full bg-emerald-500"
            :style="{ left: (item.start / totalDays * 100) + '%', width: ((item.end - item.start) / totalDays * 100) + '%' }"
            :title="item.name"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  items: { type: Array, default: () => [] },
  totalDays: { type: Number, default: 30 },
  className: { type: String, default: '' }
})
</script>
