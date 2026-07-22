<!--
  种植移入/移出记录查看弹窗（1:1 迁移自 V1.1 PlantingMoveRecordsModal.tsx）
  2026-06-19: 整批级别移入/移出履历展示

  数据源：planting_move_records 表（POST /api/plantings/:id/move 写入）
  展示：操作日期 / 类型 / 数量 / 原区域 → 目标区域 / 操作员 / 备注
-->
<template>
  <UnifiedModal
    :is-open="isOpen"
    :on-close="onClose"
    :title="`移入/移出记录 - ${planting?.plantCode || ''}`"
    size="xxl"
    :show-footer="true"
    :on-submit="onClose"
    submit-text="关闭"
    cancel-text="关闭"
  >
    <div class="space-y-4">
      <div class="flex items-center justify-between pb-2 border-b border-gray-200">
        <h4 class="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <History class="w-4 h-4" />
          历史记录 ({{ records.length }} 条)
        </h4>
        <Button
          variant="default"
          size="sm"
          :disabled="records.length === 0"
          class="flex items-center gap-1"
          @click="handleExport"
        >
          <Download class="w-4 h-4" />
          导出
        </Button>
      </div>

      <div v-if="loading" class="text-center py-8 text-gray-500">加载中…</div>
      <div v-else-if="records.length === 0" class="text-center py-12 text-gray-500 border border-dashed border-gray-200 rounded-lg">
        暂无移入/移出记录
      </div>
      <div v-else class="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
        <table class="w-full text-sm">
          <thead class="bg-blue-500 text-white sticky top-0">
            <tr>
              <th class="px-2 py-2 text-left">操作日期</th>
              <th class="px-2 py-2 text-left">类型</th>
              <th class="px-2 py-2 text-left">原区域</th>
              <th class="px-2 py-2 text-left">目标区域</th>
              <th class="px-2 py-2 text-right">数量（株）</th>
              <th class="px-2 py-2 text-left">操作员</th>
              <th class="px-2 py-2 text-left">备注</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in records" :key="r.id" class="hover:bg-gray-50 border-b border-gray-100">
              <td class="px-2 py-1.5">{{ r.operation_date || '-' }}</td>
              <td class="px-2 py-1.5">
                <span :class="['inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs',
                  r.operation_type === 'move_in' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600']">
                  <MoveRight :class="['w-3 h-3', r.operation_type === 'move_out' ? 'rotate-180' : '']" />
                  {{ r.operation_type === 'move_in' ? '移入' : '移出' }}
                </span>
              </td>
              <td class="px-2 py-1.5">{{ r.from_area_name || '-' }}</td>
              <td class="px-2 py-1.5">{{ r.to_area_name || '-' }}</td>
              <td class="px-2 py-1.5 text-right font-medium">{{ (r.quantity || 0).toLocaleString() }}</td>
              <td class="px-2 py-1.5">{{ r.operator_name || '-' }}</td>
              <td class="px-2 py-1.5 text-gray-500 truncate max-w-[200px]" :title="r.remarks || ''">
                {{ r.remarks || '-' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </UnifiedModal>
</template>

<script setup>
/**
 * 种植移入/移出记录查看弹窗（1:1 迁移自 V1.1 PlantingMoveRecordsModal.tsx）
 */
import { ref, watch } from 'vue'
import { History, MoveRight, Download } from 'lucide-vue-next'
import { UnifiedModal, Button } from '@/components/ui'
import { showAlert } from '@/lib/dialogService'
import { todayLocal } from '@/lib/dateUtils'
import { getPlantingMoveRecords } from '@/services/apiPlantingService'

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  onClose: { type: Function, required: true },
  planting: { type: Object, required: true }
})

const records = ref([])
const loading = ref(false)

const loadRecords = async () => {
  loading.value = true
  try {
    const data = await getPlantingMoveRecords(props.planting.id)
    records.value = Array.isArray(data) ? data : []
  } catch (e) {
    // 2026-07-10 P0-2 修复：catch(e) + instanceof 守卫
    await showAlert(`加载移入/移出记录失败：${e instanceof Error ? e.message : '未知错误'}`)
  } finally {
    loading.value = false
  }
}

watch(
  () => [props.isOpen, props.planting.id],
  ([open]) => {
    if (open) {
      void loadRecords()
    }
  }
)

const handleExport = () => {
  if (records.value.length === 0) {
    void showAlert('没有记录可导出')
    return
  }
  const headers = ['操作日期', '类型', '原区域', '目标区域', '数量', '操作员', '备注']
  const rows = records.value.map((r) => [
    r.operation_date || '',
    r.operation_type === 'move_in' ? '移入' : '移出',
    r.from_area_name || '-',
    r.to_area_name || '-',
    String(r.quantity || 0),
    r.operator_name || '-',
    r.remarks || ''
  ])
  const csv = [headers, ...rows].map((row) => row.map((c) => `"${c}"`).join(',')).join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `移入移出记录_${props.planting.plantCode}_${todayLocal()}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
</script>
