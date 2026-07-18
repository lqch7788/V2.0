<!--
  标签列表表格 — 搜索 + 分页 + 行选中（V1.1 LabelTable.tsx 1:1 迁移）
  从 SeedlingLabelManageModal 左侧面板提取
  2026-07-18 P0-MISS-003 修复：V2.0 此前缺失此组件
-->
<template>
  <div class="flex flex-col h-full">
    <!-- 搜索框 -->
    <div class="px-3 py-2 border-b border-gray-100 flex-shrink-0">
      <div class="relative">
        <el-icon class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Search /></el-icon>
        <el-input
          :model-value="searchText"
          @update:model-value="(v) => onSearchChange(v)"
          placeholder="搜索标签编号..."
          class="!pl-9"
        />
      </div>
    </div>

    <!-- 多选模式提示条 -->
    <div v-if="selectedIds && selectedIds.size > 0" class="px-3 py-1.5 bg-amber-50 border-b border-amber-200 flex items-center justify-between text-xs flex-shrink-0">
      <span class="text-amber-800 font-medium">
        📋 多选模式 — 已选 <span class="font-bold">{{ selectedIds.size }}</span> 个标签
      </span>
      <button class="text-amber-700 hover:text-amber-900 underline font-medium" @click="onClearSelection?.()">
        取消多选
      </button>
    </div>

    <!-- 表格区域 -->
    <div class="flex-1 overflow-y-auto">
      <div v-if="loading" class="flex items-center justify-center py-12">
        <el-icon class="animate-spin text-emerald-500" :size="24"><Loading /></el-icon>
      </div>
      <div v-else-if="labels.length === 0" class="py-12 text-center text-gray-400">
        <span class="text-3xl text-gray-300">#</span>
        <p class="text-sm">暂无标签数据</p>
      </div>
      <table v-else class="w-full text-sm">
        <thead class="bg-gray-50 sticky top-0">
          <tr>
            <th v-if="onToggleSelectAll" class="px-2 py-2 w-8">
              <input
                type="checkbox"
                :checked="labels.length > 0 && labels.every((l) => selectedIds?.has(l.id))"
                class="w-4 h-4 rounded"
                @change="onToggleSelectAll"
              />
            </th>
            <th class="px-3 py-2 text-xs text-left">标签编号</th>
            <th class="px-3 py-2 text-xs text-left">
              移入位置
              <span class="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold cursor-help" title="该植株被种植到的具体地块位置（如：东区-A区-3号畦），非育苗温室区域">?</span>
            </th>
            <th class="px-3 py-2 text-xs text-left">移入日期</th>
            <th class="px-3 py-2 text-xs text-left">数量/状态</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr
            v-for="label in labels"
            :key="label.id"
            :class="['cursor-pointer', selectedLabelId === label.id ? 'bg-emerald-50 border-l-2 border-l-emerald-500' : '']"
            @click="onSelectLabel(label.id)"
          >
            <td v-if="onToggleSelect" class="px-2 py-2" @click.stop>
              <input
                type="checkbox"
                :checked="selectedIds?.has(label.id) ?? false"
                class="w-4 h-4 rounded"
                @change="onToggleSelect(label.id)"
              />
            </td>
            <td class="px-3 py-2 font-mono text-xs">{{ label.labelNumber }}</td>
            <td class="px-3 py-2 text-xs text-gray-600">{{ label.moveInAreaName || '-' }}</td>
            <td class="px-3 py-2 text-xs text-gray-600">{{ label.moveInDate || '-' }}</td>
            <td class="px-3 py-2">
              <LabelBadge :status="label.status" :quantity="label.quantity" :unit="unit" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分页 -->
    <div v-if="totalPages > 1" class="flex justify-center p-3 border-t flex-shrink-0">
      <el-pagination
        :current-page="page"
        :total="totalPages * 10"
        :page-size="10"
        layout="prev, pager, next"
        @current-change="onPageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { Search, Loading } from '@element-plus/icons-vue'
import LabelBadge from './LabelBadge.vue'

defineProps({
  labels: { type: Array, default: () => [] },
  selectedLabelId: { type: Number, default: null },
  searchText: { type: String, default: '' },
  page: { type: Number, default: 1 },
  totalPages: { type: Number, default: 1 },
  loading: { type: Boolean, default: false },
  selectedIds: { type: Set, default: null },
  unit: { type: String, default: '株' }
})

const emit = defineEmits([
  'update:searchText',
  'select-label',
  'page-change',
  'toggle-select',
  'toggle-select-all',
  'clear-selection'
])

const onSearchChange = (v) => emit('update:searchText', v)
const onPageChange = (p) => emit('page-change', p)
const onSelectLabel = (id) => emit('select-label', id)
const onToggleSelect = (id) => emit('toggle-select', id)
const onToggleSelectAll = () => emit('toggle-select-all')
const onClearSelection = () => emit('clear-selection')
</script>
