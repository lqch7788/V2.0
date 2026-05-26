<template>
  <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm">
    <div class="flex flex-wrap gap-4 items-end">
      <!-- 巡查编号 -->
      <div class="flex-1 min-w-[150px]">
        <label class="block text-sm text-gray-700 mb-1">巡查编号</label>
        <el-input
          :model-value="filters.recordCode"
          @update:model-value="(v) => updateFilter('recordCode', v)"
          placeholder="请输入巡查编号"
          size="default"
          class="search-input"
        />
      </div>

      <!-- 巡查类型 -->
      <div class="min-w-[150px]">
        <label class="block text-sm text-gray-700 mb-1">巡查类型</label>
        <el-select
          :model-value="filters.inspectionType"
          @update:model-value="(v) => updateFilter('inspectionType', v)"
          placeholder="全部"
          size="default"
          class="w-full"
        >
          <el-option value="all" label="全部" />
          <el-option value="farm" label="种植区域巡查" />
          <el-option value="equipment" label="设备保养巡查" />
          <el-option value="infrastructure" label="基础设施巡检" />
          <el-option value="other" label="其他" />
        </el-select>
      </div>

      <!-- 提交人 -->
      <div class="flex-1 min-w-[150px]">
        <label class="block text-sm text-gray-700 mb-1">提交人</label>
        <el-input
          :model-value="filters.inspectorName"
          @update:model-value="(v) => updateFilter('inspectorName', v)"
          placeholder="请输入提交人"
          size="default"
          class="search-input"
        />
      </div>

      <!-- 巡查日期(起) -->
      <div class="min-w-[150px]">
        <label class="block text-sm text-gray-700 mb-1">巡查日期(起)</label>
        <el-date-picker
          :model-value="filters.startDate"
          @update:model-value="(v) => updateFilter('startDate', v)"
          type="date"
          placeholder="选择日期"
          size="default"
          value-format="YYYY-MM-DD"
          class="w-full"
        />
      </div>

      <!-- 巡查日期(止) -->
      <div class="min-w-[150px]">
        <label class="block text-sm text-gray-700 mb-1">巡查日期(止)</label>
        <el-date-picker
          :model-value="filters.endDate"
          @update:model-value="(v) => updateFilter('endDate', v)"
          type="date"
          placeholder="选择日期"
          size="default"
          value-format="YYYY-MM-DD"
          class="w-full"
        />
      </div>

      <!-- 状态 -->
      <div class="min-w-[120px]">
        <label class="block text-sm text-gray-700 mb-1">状态</label>
        <el-select
          :model-value="filters.status"
          @update:model-value="(v) => updateFilter('status', v)"
          placeholder="全部"
          size="default"
          class="w-full"
        >
          <el-option value="all" label="全部" />
          <el-option value="normal" label="正常" />
          <el-option value="attention" label="需关注" />
          <el-option value="critical" label="异常" />
        </el-select>
      </div>

      <!-- 问题处理状态 -->
      <div class="min-w-[120px]">
        <label class="block text-sm text-gray-700 mb-1">问题处理状态</label>
        <el-select
          :model-value="filters.problemStatus"
          @update:model-value="(v) => updateFilter('problemStatus', v)"
          placeholder="全部"
          size="default"
          class="w-full"
        >
          <el-option value="all" label="全部" />
          <el-option value="待处理" label="待处理" />
          <el-option value="处理中" label="处理中" />
          <el-option value="待验收" label="待验收" />
          <el-option value="已处理" label="已处理" />
        </el-select>
      </div>

      <!-- 按钮行 -->
      <div class="flex gap-2">
        <el-button size="small" @click="onReset">重置</el-button>
        <el-button type="primary" size="small" @click="onSearch">
          <el-icon class="mr-1"><Search /></el-icon>
          搜索
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Search } from '@element-plus/icons-vue'

const props = defineProps({
  filters: { type: Object, required: true },
  onFiltersChange: { type: Function, required: true },
  onSearch: { type: Function, required: true },
  onReset: { type: Function, required: true }
})

/** 更新单个筛选字段 */
const updateFilter = (key, value) => {
  props.onFiltersChange({ ...props.filters, [key]: value || '' })
}
</script>

<style scoped>
.search-input :deep(.el-input__wrapper) {
  border-radius: 0.5rem;
  border-color: #9ca3af;
  box-shadow: none;
  height: 40px;
}
.search-input :deep(.el-input__wrapper:focus),
.search-input :deep(.el-input__wrapper.is-focus) {
  border-color: #10b981;
  box-shadow: 0 0 0 1px rgba(16, 185, 129, 0.2);
}
</style>
