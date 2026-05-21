<template>
  <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm">
    <div class="flex flex-wrap gap-4 items-end">
      <!-- 姓名搜索 -->
      <div class="flex-1 min-w-[200px]">
        <el-input
          v-model="searchValue"
          type="text"
          placeholder="搜索员工姓名..."
          clearable
          @clear="() => onFilterChange({ staffName: undefined })"
          @input="(val) => onFilterChange({ staffName: val || undefined })"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <!-- 月份筛选 -->
      <div class="w-40">
        <el-select
          :model-value="filters.month"
          @change="(val) => onFilterChange({ month === '__all__' ? '' : val })"
          placeholder="选择月份"
          class="w-full"
        >
          <el-option label="全部月份" value="__all__" />
          <el-option label="2024年1月" value="2024-01" />
          <el-option label="2024年2月" value="2024-02" />
          <el-option label="2024年3月" value="2024-03" />
          <el-option label="2024年4月" value="2024-04" />
        </el-select>
      </div>

      <!-- 计算类型筛选 -->
      <div class="w-36">
        <el-select
          :model-value="filters.calcType"
          @change="(val) => onFilterChange({ calcType === '__all__' ? '' : val })"
          placeholder="计算方式"
          class="w-full"
        >
          <el-option label="全部方式" value="__all__" />
          <el-option label="月薪制" value="月薪制" />
          <el-option label="日薪制" value="日薪制" />
          <el-option label="时薪制" value="时薪制" />
        </el-select>
      </div>

      <!-- 状态筛选 -->
      <div class="w-36">
        <el-select
          :model-value="filters.status"
          @change="(val) => onFilterChange({ status === '__all__' ? '' : val })"
          placeholder="选择状态"
          class="w-full"
        >
          <el-option label="全部状态" value="__all__" />
          <el-option label="待确认">
            <span class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-amber-500"></span>
              待确认
            </span>
          </el-option>
          <el-option label="已确认">
            <span class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-blue-500"></span>
              已确认
            </span>
          </el-option>
          <el-option label="已发放">
            <span class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-green-500"></span>
              已发放
            </span>
          </el-option>
        </el-select>
      </div>

      <!-- 重置按钮 -->
      <el-button
        v-if="hasFilters"
        type="info"
        @click="onReset"
      >
        <el-icon><Close /></el-icon>
        重置
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { Search, Close } from '@element-plus/icons-vue'

type SalaryCalcType = '月薪制' | '日薪制' | '时薪制'
type SalaryStatus = '待确认' | '已确认' | '已发放'

const props = defineProps({})

const searchValue = ref(props.filters.staffName || '')

watch(() => props.filters.staffName, (val) => {
  searchValue.value = val || ''
})

const hasFilters = computed(() => {
  return props.filters.month || props.filters.staffName || props.filters.calcType || props.filters.status
})
</script>
