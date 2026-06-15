<!--
  TempTaskFilters.vue - 临时任务筛选器
  V1.1 TempTaskFilters.tsx (107行) 1:1 迁移
  紧急程度切换按钮组 + 搜索框 + 超时筛选 + 状态筛选
-->
<template>
  <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm border border-gray-100">
    <div class="flex flex-col lg:flex-row gap-4 items-center">
      <!-- 紧急程度筛选（放在搜索框前面） -->
      <div class="bg-white rounded-xl p-1 inline-flex shadow-sm flex-shrink-0">
        <button
          v-for="urgency in ['all', 'normal', 'urgent', 'critical']"
          :key="urgency"
          type="button"
          class="px-3 py-1.5 rounded-lg text-sm transition-all"
          :class="urgencyClass(urgency)"
          @click="emit('update:urgencyFilter', urgency)"
        >
          {{ urgency === 'all' ? '全部' : URGENCY_LABEL_MAP[urgency] }}
        </button>
      </div>

      <!-- 搜索 -->
      <div class="flex-1 relative w-full">
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 18a7.5 7.5 0 006.15-3.35z" />
          </svg>
        </span>
        <input
          type="text"
          placeholder="搜索任务名称、任务编号..."
          :value="searchTerm"
          @input="emit('update:searchTerm', $event.target.value)"
          class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
      </div>

      <!-- 超时筛选 -->
      <select
        :value="overdueFilter"
        @change="emit('update:overdueFilter', $event.target.value)"
        class="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white min-w-[120px]"
      >
        <option v-for="opt in overdueOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
      </select>

      <!-- 状态筛选 -->
      <select
        :value="statusFilter"
        @change="emit('update:statusFilter', $event.target.value)"
        class="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white min-w-[140px]"
      >
        <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
      </select>
    </div>
  </div>
</template>

<script setup>
/**
 * 临时任务筛选器
 * V1.1 src/components/labor/tempTask/TempTaskFilters.tsx 1:1 迁移
 *
 * Props:
 *   searchTerm / urgencyFilter / statusFilter / overdueFilter
 *
 * Emits:
 *   update:searchTerm / update:urgencyFilter / update:statusFilter / update:overdueFilter
 */
const props = defineProps({
  searchTerm: { type: String, default: '' },
  urgencyFilter: { type: String, default: 'all' },
  statusFilter: { type: String, default: 'all' },
  overdueFilter: { type: String, default: 'all' },
})

const emit = defineEmits([
  'update:searchTerm',
  'update:urgencyFilter',
  'update:statusFilter',
  'update:overdueFilter',
])

// 紧急程度配置（与 V1.1 TEMP_TASK_URGENCY_CONFIG 1:1）
const URGENCY_LABEL_MAP = {
  normal: '普通',
  urgent: '紧急',
  critical: '非常紧急',
}

// 状态选项（与 V1.1 statusOptions 1:1）
const statusOptions = [
  { value: 'all', label: '全部状态' },
  { value: 'pending', label: '待执行' },
  { value: 'in_progress', label: '进行中' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' },
]

// 超时选项（与 V1.1 overdueOptions 1:1）
const overdueOptions = [
  { value: 'all', label: '全部' },
  { value: 'overdue', label: '已超时' },
  { value: 'warning', label: '即将到期' },
]

// 紧急程度按钮配色（与 V1.1 Button variant 1:1）
function urgencyClass(urgency) {
  if (props.urgencyFilter !== urgency) {
    return 'text-gray-600 hover:bg-gray-100'
  }
  switch (urgency) {
    case 'critical':
      return 'bg-red-500 hover:bg-red-600 text-white'
    case 'urgent':
      return 'bg-amber-500 hover:bg-amber-600 text-white'
    case 'normal':
      return 'bg-gray-500 hover:bg-gray-600 text-white'
    default:
      return 'bg-emerald-600 hover:bg-emerald-700 text-white'
  }
}
</script>