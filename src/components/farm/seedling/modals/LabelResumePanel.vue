<!--
  标签履历面板 — 右侧履历展示（时间线 / 表格 双模式切换）（V1.1 LabelResumePanel.tsx 1:1 迁移）
  从 SeedlingLabelManageModal 右侧面板提取
  2026-07-18 P0-MISS-005 修复：V2.0 此前缺失此组件
-->
<template>
  <div v-if="!selectedLabel" class="py-12 text-center text-gray-400">
    <span class="text-4xl text-gray-300 mb-3 block text-center">#</span>
    <p>请在左侧选择一个标签查看履历</p>
  </div>
  <div v-else-if="loading" class="flex items-center justify-center py-12">
    <el-icon class="animate-spin text-emerald-500" :size="24"><Loading /></el-icon>
  </div>
  <div v-else>
    <!-- 视图切换 -->
    <div class="flex items-center justify-between mb-3">
      <span class="text-sm font-medium text-gray-700">
        履历记录（{{ entries.length }} 条）
      </span>
      <div class="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
        <button
          type="button"
          :class="['flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-colors',
            viewMode === 'timeline' ? 'bg-white shadow text-emerald-700 font-medium' : 'text-gray-500 hover:text-gray-700']"
          @click="viewMode = 'timeline'"
        >
          <el-icon :size="14"><Clock /></el-icon>时间线
        </button>
        <button
          type="button"
          :class="['flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-colors',
            viewMode === 'table' ? 'bg-white shadow text-emerald-700 font-medium' : 'text-gray-500 hover:text-gray-700']"
          @click="viewMode = 'table'"
        >
          <el-icon :size="14"><List /></el-icon>表格
        </button>
      </div>
    </div>

    <!-- 时间线视图（简化版：内联渲染，V2.0 暂不依赖 LabelResumeTimeline 组件） -->
    <div v-if="viewMode === 'timeline'" class="relative pl-6 border-l-2 border-emerald-200 space-y-3">
      <div v-for="r in entries" :key="r.id" class="relative">
        <div class="absolute -left-[calc(1.5rem+3px)] top-1.5 w-3 h-3 rounded-full border-2 border-emerald-400 bg-white" />
        <div class="bg-white border border-gray-100 rounded-lg p-3 shadow-sm">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-xs text-gray-400 font-mono">{{ r.operationDate }}</span>
            <span :class="['px-1.5 py-0.5 rounded text-xs font-medium', opBadgeClass(r.operationType)]">{{ opLabel(r.operationType) }}</span>
            <span v-if="r.quantityChange != null" :class="['text-xs font-medium', r.quantityChange > 0 ? 'text-emerald-600' : 'text-orange-600']">
              {{ r.quantityChange > 0 ? '+' : '' }}{{ r.quantityChange }}
            </span>
            <span v-if="r.operatorName" class="text-xs text-gray-400 ml-auto">by {{ r.operatorName }}</span>
          </div>
          <div v-if="r.fromAreaName || r.toAreaName" class="text-xs text-gray-500 mt-1">
            {{ r.fromAreaName || '—' }} → {{ r.toAreaName || '—' }}
          </div>
          <div v-if="r.reason" class="text-xs text-gray-500 mt-1">{{ r.reason }}</div>
        </div>
      </div>
    </div>

    <!-- 表格视图 -->
    <div v-else class="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
      <table class="w-full text-xs">
        <thead class="bg-blue-500 text-white sticky top-0">
          <tr>
            <th class="px-2 py-2 text-left whitespace-nowrap">日期</th>
            <th class="px-2 py-2 text-left whitespace-nowrap">操作</th>
            <th class="px-2 py-2 text-left">从区域</th>
            <th class="px-2 py-2 text-left">到区域</th>
            <th class="px-2 py-2 text-right whitespace-nowrap">数量变化</th>
            <th class="px-2 py-2 text-right whitespace-nowrap">剩余</th>
            <th class="px-2 py-2 text-left">标记</th>
            <th class="px-2 py-2 text-left">操作员</th>
            <th class="px-2 py-2 text-left">备注</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="r in entries" :key="r.id" class="hover:bg-gray-50 align-top">
            <td class="px-2 py-1.5 whitespace-nowrap">{{ r.operationDate || '-' }}</td>
            <td class="px-2 py-1.5">
              <span :class="['inline-block px-1.5 py-0.5 rounded text-xs font-medium', opBadgeClass(r.operationType)]">
                {{ opLabel(r.operationType) }}
              </span>
            </td>
            <td class="px-2 py-1.5 text-gray-600">{{ r.fromAreaName || '-' }}</td>
            <td class="px-2 py-1.5 text-gray-600">{{ r.toAreaName || '-' }}</td>
            <td class="px-2 py-1.5 text-right">
              <span v-if="r.quantityChange != null" :class="r.quantityChange > 0 ? 'text-emerald-600' : 'text-orange-600'">
                {{ r.quantityChange > 0 ? '+' : '' }}{{ r.quantityChange }}
              </span>
              <span v-else>-</span>
            </td>
            <td class="px-2 py-1.5 text-right text-gray-600">
              {{ r.quantityAfter != null ? r.quantityAfter : '-' }}
            </td>
            <td class="px-2 py-1.5">
              <span v-if="r.markName" class="inline-block px-1.5 py-0.5 rounded text-xs text-white" :style="{ backgroundColor: r.markColor || '#9ca3af' }">
                {{ r.markName }}
              </span>
              <span v-else>-</span>
            </td>
            <td class="px-2 py-1.5 text-gray-600">{{ r.operatorName || '-' }}</td>
            <td class="px-2 py-1.5 text-gray-500 max-w-[160px] truncate" :title="r.reason || ''">{{ r.reason || '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Loading, Clock, List } from '@element-plus/icons-vue'

// 操作类型中文映射（与 V1.1 LabelResumePanel L13-18 1:1）
const OP_LABEL = {
  move_in: '移入',
  move_out: '移出',
  mark: '标记',
  void: '作废'
}

const props = defineProps({
  selectedLabel: { type: Object, default: null },
  resumes: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
})

const viewMode = ref('timeline')

const opLabel = (type) => OP_LABEL[type] || type
const opBadgeClass = (type) => {
  if (type === 'move_in') return 'bg-emerald-100 text-emerald-700'
  if (type === 'move_out') return 'bg-orange-100 text-orange-700'
  if (type === 'mark') return 'bg-purple-100 text-purple-700'
  return 'bg-red-100 text-red-700'
}

// 映射 PlantLabelResume[] → entries（含数量追踪 + 原因字段，V1.1 L48-62 1:1）
const entries = computed(() =>
  props.resumes.map((r) => ({
    id: r.id,
    operationType: r.operationType,
    fromAreaName: r.fromAreaName || undefined,
    toAreaName: r.toAreaName || undefined,
    operationDate: r.operationDate,
    markName: r.markName || undefined,
    markColor: r.markColor || undefined,
    operatorName: r.operatorName || undefined,
    imageBase64: r.imageBase64 || undefined,
    quantityChange: r.quantityChange ?? null,
    quantityAfter: r.quantityAfter ?? null,
    reason: r.reason || undefined
  }))
)
</script>
