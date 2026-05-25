<template>
  <!-- 批量删除警告弹窗 - 对应V1.1 DeleteWarningDialog.tsx -->
  <el-dialog
    v-model="dialogVisible"
    title="批量删除警告"
    width="500px"
    :close-on-click-modal="true"
  >
    <div class="text-sm text-gray-600 space-y-2">
      <p>删除后可能存在以下问题：</p>
      <ul class="list-disc list-inside space-y-1">
        <li>所有选中的物料将被永久删除</li>
        <li>相关的入库记录也将被删除</li>
        <li>历史数据将无法恢复</li>
      </ul>
    </div>

    <template #footer>
      <div class="flex gap-3">
        <el-button class="flex-1" @click="handleClose">取消</el-button>
        <el-button type="danger" class="flex-1" @click="handleConfirm">已知晓</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'

/**
 * 删除警告弹窗组件
 * 显示批量删除的风险提示
 */

const props = defineProps({
  // 是否显示
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'confirm'])

const dialogVisible = computed({
  get: () => props.isOpen,
  set: (val) => {
    if (!val) emit('close')
  }
})

const handleClose = () => {
  emit('close')
}

const handleConfirm = () => {
  emit('confirm')
}
</script>
