<template>
  <!-- 物料删除确认弹窗 - 对应V1.1 MaterialDeleteConfirmModal.tsx -->
  <el-dialog
    v-model="dialogVisible"
    title="删除确认"
    width="500px"
    :close-on-click-modal="true"
  >
    <div v-if="material">
      <div class="flex items-start gap-3 mb-4">
        <span class="text-2xl">⚠️</span>
        <div>
          <h4 class="text-sm font-medium text-gray-900">警告：删除此物料将造成严重后果！</h4>
          <p class="text-sm text-gray-500 mt-1">
            您正在删除物料：<strong>{{ material.name }}</strong>（{{ material.code }}）
          </p>
          <ul class="text-sm text-red-500 mt-2 space-y-1">
            <li>• 此操作将删除所有相关的入库记录</li>
            <li>• 历史数据将无法恢复</li>
            <li>• 可能导致库存数据错乱</li>
            <li>• 已使用的物料信息将无法追溯</li>
          </ul>
        </div>
      </div>
      <p class="text-sm text-gray-500 mb-4">
        此操作不可撤销！请确认是否继续删除？
      </p>
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
 * 物料删除确认弹窗组件
 * 显示删除警告和确认按钮
 */

const props = defineProps({
  // 物料数据
  material: {
    type: Object,
    default: null
  },
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
