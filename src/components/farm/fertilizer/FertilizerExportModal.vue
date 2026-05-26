<template>
  <!-- 施肥数据导出弹窗 -->
  <el-dialog :model-value="isOpen" @update:model-value="$emit('close')" title="导出施肥数据" width="450px" top="10vh">
    <div class="space-y-4">
      <div>
        <label class="text-gray-700 text-sm block mb-2">导出格式</label>
        <el-radio-group :model-value="format" @update:model-value="$emit('update:format', $event)">
          <el-radio value="xlsx">Excel (.xlsx)</el-radio>
          <el-radio value="csv">CSV (.csv)</el-radio>
        </el-radio-group>
      </div>
      <div class="bg-blue-50 rounded-lg p-3">
        <p class="text-sm text-blue-700">将导出当前筛选条件下的 {{ selectedCount || dataCount }} 条数据</p>
      </div>
    </div>
    <template #footer>
      <el-button @click="$emit('close')">取消</el-button>
      <el-button type="primary" @click="$emit('confirm')">确认导出</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
defineProps({
  isOpen: { type: Boolean, default: false },
  format: { type: String, default: 'xlsx' },
  selectedCount: { type: Number, default: 0 },
  dataCount: { type: Number, default: 0 },
})

defineEmits(['close', 'confirm', 'update:format'])
</script>
