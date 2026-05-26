<template>
  <!-- 任务表格表头 - 从V1.1 TaskTableHeader.tsx 1:1迁移 -->
  <tr class="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
    <th v-if="showCheckbox" class="px-3 py-3 text-center text-sm font-semibold w-12">
      <input type="checkbox" :checked="isAllSelected" :indeterminate.prop="isSomeSelected && !isAllSelected"
        @change="$emit('selectAll')" class="w-4 h-4 rounded" />
    </th>
    <th class="px-4 py-3 text-center text-sm font-semibold">任务编号</th>
    <th class="px-4 py-3 text-center text-sm font-semibold">类型</th>
    <th class="px-4 py-3 text-center text-sm font-semibold">田地/温室</th>
    <th class="px-4 py-3 text-center text-sm font-semibold">作物</th>
    <th class="px-4 py-3 text-center text-sm font-semibold">批次</th>
    <th class="px-4 py-3 text-center text-sm font-semibold">执行人</th>
    <th class="px-4 py-3 text-center text-sm font-semibold">进度</th>
    <th class="px-4 py-3 text-center text-sm font-semibold">优先级</th>
    <th class="px-4 py-3 text-center text-sm font-semibold">状态</th>
    <th class="px-4 py-3 text-center text-sm font-semibold">操作</th>
    <th class="px-4 py-3 text-center text-sm font-semibold">备注</th>
    <th class="px-4 py-3 text-center text-sm font-semibold">作业标准</th>
    <th class="px-4 py-3 text-center text-sm font-semibold">计划开始</th>
    <th class="px-4 py-3 text-center text-sm font-semibold">计划结束</th>
    <th class="px-4 py-3 text-center text-sm font-semibold">任务工时</th>
  </tr>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  exportMode: { type: Boolean, default: false },
  batchEditMode: { type: Boolean, default: false },
  batchDeleteMode: { type: Boolean, default: false },
  isAllSelected: { type: Boolean, default: false },
  isSomeSelected: { type: Boolean, default: false },
})

defineEmits(['selectAll'])

const showCheckbox = computed(() => props.exportMode || props.batchEditMode || props.batchDeleteMode)
</script>
