<template>
  <!-- 批量删除确认弹窗 - 对应V1.1 BatchDeleteConfirmDialog.tsx -->
  <el-dialog
    v-model="dialogVisible"
    title="确认删除"
    width="500px"
    :close-on-click-modal="true"
  >
    <div class="text-sm text-gray-600 space-y-2">
      <p>确定要删除选中的物料吗？</p>
      <div class="p-2 bg-gray-50 rounded text-xs">
        <p><strong>物料编号：</strong>{{ displayCodes }}{{ moreCount }}</p>
        <p><strong>物料总数：</strong>{{ selectedMaterials.length }} 个</p>
      </div>
      <p class="text-red-500">此操作不可撤销！</p>
    </div>

    <template #footer>
      <div class="flex gap-3">
        <el-button class="flex-1" @click="handleClose">取消</el-button>
        <el-button type="danger" class="flex-1" @click="handleConfirm">确认删除</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'

/**
 * 批量删除确认弹窗组件
 * 显示待删除物料列表供用户确认
 */

const props = defineProps({
  // 是否显示
  isOpen: {
    type: Boolean,
    default: false
  },
  // 已选择的物料列表
  selectedMaterials: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'confirm'])

const dialogVisible = computed({
  get: () => props.isOpen,
  set: (val) => {
    if (!val) emit('close')
  }
})

// 显示的物料编号（最多显示5个）
const displayCodes = computed(() => {
  const materialCodes = props.selectedMaterials.map(m => m.code).slice(0, 5)
  return materialCodes.join('、')
})

// 超过5个时显示
const moreCount = computed(() => {
  return props.selectedMaterials.length > 5 ? ` 等${props.selectedMaterials.length}个` : ''
})

const handleClose = () => {
  emit('close')
}

const handleConfirm = () => {
  emit('confirm')
}
</script>
