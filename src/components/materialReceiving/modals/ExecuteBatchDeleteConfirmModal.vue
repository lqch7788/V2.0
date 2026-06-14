<template>
  <ElModal
    :model-value="show"
    title="批量删除确认"
    :width="500"
    :height="380"
    :show-submit="false"
    :show-cancel="false"
    :close-on-click-modal="false"
    @update:model-value="(v) => { if (!v) handleCancel() }"
    @close="handleCancel"
  >
    <div class="flex items-start gap-3 mb-4">
      <AlertTriangle class="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
      <div>
        <h4 class="text-sm font-medium text-gray-900">警告：批量删除领料出库记录将造成严重后果！</h4>
        <p class="text-sm text-gray-500 mt-1">
          您正在删除 <strong>{{ count }}</strong> 项领料出库记录
        </p>
        <ul class="text-sm text-red-500 mt-2 space-y-1">
          <li>• 此操作将删除所有选中的领料出库记录</li>
          <li>• 相关物料明细也将被删除</li>
          <li>• 历史数据将无法恢复</li>
          <li>• 可能导致库存数据错乱</li>
        </ul>
      </div>
    </div>
    <p class="text-sm text-gray-500">此操作不可撤销！请确认是否继续删除？</p>

    <template #footer>
      <div class="flex gap-3 justify-end">
        <el-button size="small" @click="handleCancel">取消</el-button>
        <el-button size="small" type="danger" @click="handleConfirm">确认删除</el-button>
      </div>
    </template>
  </ElModal>
</template>

<script setup>
import { ElModal } from '@/components/ui'
import { AlertTriangle } from 'lucide-vue-next'

defineProps({
  show: { type: Boolean, default: false },
  count: { type: Number, default: 0 }
})

const emit = defineEmits(['close', 'confirm'])

const handleCancel = () => emit('close')
const handleConfirm = () => {
  emit('confirm')
  handleCancel()
}
</script>
