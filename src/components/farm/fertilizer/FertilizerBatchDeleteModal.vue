<template>
  <!-- 批量删除确认弹窗 -->
  <el-dialog :model-value="isOpen" @update:model-value="$emit('close')" title="批量删除确认" width="450px" top="10vh">
    <div class="space-y-4">
      <div class="bg-red-50 rounded-lg p-4">
        <p class="text-sm text-red-700">确认删除选中的 <strong>{{ selectedCount }}</strong> 条施肥记录吗？此操作不可撤销。</p>
      </div>
      <div v-if="hasIotRecords" class="bg-amber-50 rounded-lg p-3">
        <p class="text-sm text-amber-700">注意：所选记录中包含IoT自动采集数据，这些记录无法删除将被跳过。</p>
      </div>
    </div>
    <template #footer>
      <el-button @click="$emit('close')">取消</el-button>
      <el-button type="danger" @click="$emit('confirm')">确认删除</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
defineProps({
  isOpen: { type: Boolean, default: false },
  selectedCount: { type: Number, default: 0 },
  hasIotRecords: { type: Boolean, default: false },
})

defineEmits(['close', 'confirm'])
</script>
