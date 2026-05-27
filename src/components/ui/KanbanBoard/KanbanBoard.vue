<template>
  <div class="flex gap-4 overflow-x-auto pb-4" :class="className">
    <div v-for="(column, colIdx) in columns" :key="colIdx" class="flex-shrink-0 w-72 bg-gray-50 rounded-xl border border-gray-200">
      <div class="p-3 border-b border-gray-200 font-semibold text-sm text-gray-700">{{ column.title }}
        <span class="ml-2 text-xs text-gray-400 font-normal">({{ column.items?.length || 0 }})</span>
      </div>
      <div class="p-2 space-y-2 min-h-[100px]">
        <div v-for="(item, itemIdx) in column.items" :key="itemIdx" class="p-3 bg-white rounded-lg border border-gray-200 shadow-sm text-sm cursor-pointer hover:border-gray-300 transition-colors">
          <slot name="item" :item="item" :column="column" :columnIndex="colIdx" :itemIndex="itemIdx">
            <div class="font-medium text-gray-900">{{ item.title || item.name }}</div>
            <div v-if="item.description" class="text-gray-500 text-xs mt-1">{{ item.description }}</div>
          </slot>
        </div>
        <div v-if="!column.items?.length" class="text-gray-400 text-sm text-center py-4">暂无任务</div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  columns: { type: Array, default: () => [] },
  className: { type: String, default: '' }
})
</script>
