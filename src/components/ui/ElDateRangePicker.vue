<template>
  <el-date-picker
    :model-value="modelValue"
    type="daterange"
    :start-placeholder="startPlaceholder"
    :end-placeholder="endPlaceholder"
    :disabled="disabled"
    :clearable="clearable"
    :value-format="valueFormat"
    :format="format"
    :size="size"
    prefix-icon="Calendar"
    class="el-date-range-picker"
    @update:model-value="handleUpdate"
    @change="handleChange"
  />
</template>

<script setup>
const props = defineProps({
  /** 日期范围值 [start, end] */
  modelValue: { type: Array, default: () => [null, null] },
  /** 开始日期占位符 */
  startPlaceholder: { type: String, default: '开始日期' },
  /** 结束日期占位符 */
  endPlaceholder: { type: String, default: '结束日期' },
  /** 是否禁用 */
  disabled: { type: Boolean, default: false },
  /** 是否可清空 */
  clearable: { type: Boolean, default: true },
  /** 值格式 */
  valueFormat: { type: String, default: 'YYYY-MM-DD' },
  /** 显示格式 */
  format: { type: String, default: 'YYYY-MM-DD' },
  /** 尺寸 */
  size: { type: String, default: 'default' }
})

const emit = defineEmits(['update:modelValue', 'change'])

function handleUpdate(val) {
  emit('update:modelValue', val || [null, null])
}

function handleChange(val) {
  emit('change', val || [null, null])
}
</script>

<style scoped>
/* ==================== 与 V1.1 DateRangePicker 样式一致 ==================== */

/* 使用 emerald-600 作为主色，与 V1.1 选中色一致 */
.el-date-range-picker {
  --el-color-primary: #059669;
  --el-datepicker-active-color: #059669;
}

/* 输入框 wrapper：圆角、边框、高度与 V1.1 一致 */
.el-date-range-picker :deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px #e5e7eb inset; /* border-gray-200 */
  border-radius: 0.5rem;               /* rounded-lg */
  padding: 0 12px;
  transition: all 0.2s;
}

/* 输入框内部高度 */
.el-date-range-picker :deep(.el-input__inner) {
  height: 40px; /* h-10 */
  font-size: 14px;
  color: #111827;
}

/* focus 状态：ring-emerald-500 */
.el-date-range-picker :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #10b981 inset, 0 0 0 3px rgba(16, 185, 129, 0.1) !important;
}

/* 范围输入框文字 */
.el-date-range-picker :deep(.el-range-input) {
  font-size: 14px;
  color: #111827;
}

/* 分隔符 */
.el-date-range-picker :deep(.el-range-separator) {
  color: #9ca3af; /* text-gray-400 */
  font-size: 14px;
}

/* 清空图标颜色 */
.el-date-range-picker :deep(.el-range__close-icon) {
  color: #9ca3af;
}

/* 下拉面板内选中日期背景（高优先级覆盖） */
.el-date-range-picker :deep(.el-date-table td.in-range .el-date-table-cell) {
  background-color: #d1fae5 !important; /* emerald-100 */
}

.el-date-range-picker :deep(.el-date-table td.end-date .el-date-table-cell__text,
                            .el-date-table td.start-date .el-date-table-cell__text) {
  background-color: #059669 !important; /* dark green */
  color: #ffffff !important;
}

.el-date-range-picker :deep(.el-date-table td.today .el-date-table-cell__text) {
  color: #059669;
}
</style>
