<template>
  <!-- 表头行 - 蓝色渐变背景 -->
  <tr class="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
    <!-- 选择列：仅在批量模式下显示 -->
    <th v-if="showCheckbox" class="px-4 py-3 text-center">
      <el-checkbox
        :model-value="isAllSelected"
        :indeterminate="isIndeterminate"
        @change="onSelectAll"
      />
    </th>
    <th class="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap">任务ID</th>
    <th class="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap">任务类型</th>
    <th class="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap">任务区域</th>
    <th class="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap">作物</th>
    <th class="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap">关联生产批次</th>
    <th class="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap">执行人</th>
    <th class="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap">班组</th>
    <th class="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap">进度</th>
    <th class="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap">优先级</th>
    <th class="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap">状态</th>
    <th class="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap">操作</th>
    <th class="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap">备注</th>
    <th class="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap">作业标准</th>
    <th class="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap">计划开始</th>
    <th class="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap">计划结束</th>
    <th class="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap">任务工时</th>
  </tr>
</template>

<script setup>
/**
 * 任务表格表头组件
 * 蓝色渐变背景，13列 + 可选的复选框列
 * 对应 V1.1 TaskTableHeader.tsx 1:1 映射
 */
import { computed } from 'vue'

const props = defineProps({
  /** 是否处于批量导出模式 */
  exportMode: { type: Boolean, default: false },
  /** 是否处于批量编辑模式 */
  batchEditMode: { type: Boolean, default: false },
  /** 是否处于批量删除模式 */
  batchDeleteMode: { type: Boolean, default: false },
  /** 是否处于批量派发模式 */
  batchDispatchMode: { type: Boolean, default: false },
  /** 是否处于批量验收模式 */
  batchVerifyMode: { type: Boolean, default: false },
  /** 是否处于批量重派模式 */
  batchReassignMode: { type: Boolean, default: false },
  /** 是否全选 */
  isAllSelected: { type: Boolean, default: false },
  /** 是否部分选中（控制 indeterminate 状态） */
  isSomeSelected: { type: Boolean, default: false },
  /** 全选/取消全选回调 */
  onSelectAll: { type: Function, default: () => {} },
})

/** 是否显示复选框列：只要任意批量模式激活就显示 */
const showCheckbox = computed(() =>
  props.exportMode || props.batchEditMode || props.batchDeleteMode ||
  props.batchDispatchMode || props.batchVerifyMode || props.batchReassignMode
)

/** indeterminate 状态：部分选中但未全选时显示 */
const isIndeterminate = computed(() =>
  props.isSomeSelected && !props.isAllSelected
)
</script>
