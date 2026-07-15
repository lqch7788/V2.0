<template>
  <!-- 流转追溯工具栏（V1.1 ActionToolbar 简化版 1:1） -->
  <div class="flex items-center justify-between flex-wrap gap-2">
    <div class="flex items-center gap-2 text-sm text-gray-700">
      <slot name="title">
        <span v-if="typeof title === 'string'" class="font-semibold">{{ title }}</span>
        <span v-else class="font-semibold">{{ title }}</span>
      </slot>
    </div>
    <div class="flex items-center gap-2">
      <span v-if="selectedIds.length > 0" class="text-xs text-gray-500">已选 {{ selectedIds.length }} 项</span>
      <el-button v-if="!deleteMode && !exportMode" size="small" @click="$emit('delete')">删除</el-button>
      <el-button v-if="!deleteMode && !exportMode" size="small" @click="$emit('export')">导出</el-button>
      <template v-if="deleteMode">
        <el-button type="danger" size="small" :disabled="selectedIds.length === 0" @click="$emit('confirm-delete')">确认删除</el-button>
        <el-button size="small" @click="$emit('cancel-delete')">取消</el-button>
      </template>
      <template v-if="exportMode">
        <el-button type="primary" size="small" :disabled="selectedIds.length === 0" @click="$emit('confirm-export')">确认导出</el-button>
        <el-button size="small" @click="$emit('cancel-export')">取消</el-button>
      </template>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: [String, Object], default: '' },
  deleteMode: { type: Boolean, default: false },
  exportMode: { type: Boolean, default: false },
  selectedIds: { type: Array, default: () => [] },
  isStatsTab: { type: Boolean, default: false },
  statYear: { type: Number, default: new Date().getFullYear() }
})

defineEmits(['delete', 'export', 'confirm-delete', 'cancel-delete', 'confirm-export', 'cancel-export'])
</script>