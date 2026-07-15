<template>
  <!-- 导出格式弹窗（V1.1 L242-302 1:1） -->
  <el-dialog v-model="visible" title="选择导出模式" width="500px" append-to-body>
    <p class="text-sm text-gray-500 mb-4 text-center">{{ selectedCount > 0 ? `已选择 ${selectedCount} 条记录` : `全部 ${totalCount} 条记录` }}</p>
    <div class="space-y-3">
      <div
        v-for="f in formats"
        :key="f.value"
        @click="selected = f.value"
        :class="['flex items-center p-4 border rounded-lg cursor-pointer transition-all', selected === f.value ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-400']"
      >
        <div :class="['w-4 h-4 rounded-full border-2 flex items-center justify-center mr-3', selected === f.value ? 'border-emerald-500' : 'border-gray-400']">
          <div v-if="selected === f.value" class="w-2 h-2 rounded-full bg-emerald-500" />
        </div>
        <div>
          <span class="block text-sm font-medium text-gray-900">{{ f.label }}</span>
          <span class="block text-xs text-gray-500">{{ f.desc }}</span>
        </div>
      </div>
    </div>
    <template #footer>
      <div class="flex gap-3">
        <el-button class="flex-1" @click="visible = false">取消</el-button>
        <el-button type="primary" class="flex-1" @click="$emit('confirm', selected)">确认导出</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
const props = defineProps({
  isOpen: { type: Boolean, default: false },
  selectedCount: { type: Number, default: 0 },
  totalCount: { type: Number, default: 0 }
})
const emit = defineEmits(['update:isOpen', 'confirm'])
const visible = computed({ get: () => props.isOpen, set: (v) => emit('update:isOpen', v) })
const selected = ref('excel')
const formats = [
  { value: 'excel', label: 'Excel (.xlsx)', desc: '适用于数据分析和处理' },
  { value: 'csv', label: 'CSV (.csv)', desc: '适用于数据交换和导入其他系统' },
  { value: 'pdf', label: 'PDF (.pdf)', desc: '适用于打印、归档和分享' }
]
</script>