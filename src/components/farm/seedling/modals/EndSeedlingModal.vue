<!--
  结束育苗确认弹窗（完全重写 - 1:1 对齐 V1.1 SeedlingPage.tsx L785-818）
  V1.1 用 inline div + AlertTriangle 实现，不用 el-dialog
-->
<template>
  <div class="fixed inset-0 z-[70] flex items-center justify-center">
    <div class="absolute inset-0 bg-black/50" @click="$emit('close')"></div>
    <div class="relative bg-white rounded-xl w-full max-w-md shadow-xl flex flex-col">
      <div class="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-red-500 to-red-600 rounded-t-xl">
        <h3 class="text-base font-semibold text-white flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          确认结束育苗记录
        </h3>
        <button type="button" class="text-white hover:bg-red-700 rounded p-1" @click="$emit('close')">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="p-4 space-y-3">
        <div class="px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
          <div class="text-sm font-semibold text-red-800">⚠️ 结束育苗记录</div>
          <div class="text-xs text-red-700 mt-1">
            结束后将锁定日常运维操作（移栽、出圃、修改等）。<br/>
            <span class="font-semibold">仍可补录遗漏的库存</span>（通过"出圃入库"按钮，必填补录原因）。<br/>
            <span class="font-semibold">此操作不可撤销！</span>
          </div>
        </div>
      </div>
      <div class="px-4 py-3 border-t border-gray-200 flex justify-end gap-2">
        <button type="button" class="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50" @click="$emit('close')">取消</button>
        <button type="button" class="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700" @click="handleConfirm">确认结束</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useSeedlingStore } from '@/stores/modules/seedling'
import * as cropBatchService from '@/services/apiCropBatchService'
import { todayLocal } from '@/lib/dateUtils'

const props = defineProps({
  record: { type: Object, required: true }
})
const emit = defineEmits(['close', 'success'])

const seedlingStore = useSeedlingStore()
const submitting = ref(false)

// 严格对齐 V1.1 SeedlingPage.tsx L350-397 executeEnd
const handleConfirm = async () => {
  if (submitting.value) return
  submitting.value = true
  try {
    const record = props.record
    const endType = 'normal'
    const endStatus = 'completed'
    const planCode = record.productionPlanCode

    // 1. 无 planCode：直接 updateItem
    if (!planCode || planCode.trim() === '') {
      const result = await seedlingStore.updateItem(record.id, {
        endType, endTime: todayLocal(), status: endStatus
      })
      if (result) {
        ElMessage.success('育苗记录已结束（仍可补录遗漏库存）')
        emit('success')
      } else {
        ElMessage.error('结束失败')
      }
      return
    }

    // 2. 有 planCode：查 batch
    const batch = await cropBatchService.getCropBatchByCode(planCode)
    if (!batch) {
      const result = await seedlingStore.updateItem(record.id, {
        endType, endTime: todayLocal(), status: endStatus
      })
      if (result) {
        ElMessage.success('育苗记录已结束（强结，仍可补录遗漏库存）')
        emit('success')
      } else {
        ElMessage.error('强结失败')
      }
      return
    }

    // 3. 检查 batch 是否已完成
    if (batch.batchStatus === 'completed') {
      ElMessage.warning('该生产计划已完成结束，不能重复结束')
      return
    }

    // 4. 联动结束生产计划
    const result = await cropBatchService.endCropBatch(batch.id, endType)
    if (result) {
      await seedlingStore.updateItem(record.id, {
        endType, endTime: todayLocal(), status: endStatus
      })
      ElMessage.success('生产计划已正常结束（育苗记录同步结束）')
      emit('success')
    } else {
      ElMessage.error('结束失败')
    }
  } catch (error) {
    console.error('[EndSeedlingModal] error:', error)
    ElMessage.error('结束失败')
  } finally {
    submitting.value = false
  }
}
</script>
