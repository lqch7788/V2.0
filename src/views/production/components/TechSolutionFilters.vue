<template>
  <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm border border-gray-100">
    <div class="flex flex-wrap gap-4 items-end">
      <div class="flex-1 min-w-[180px]">
        <label class="block text-sm font-medium text-gray-700 mb-1">方案编号</label>
        <el-input
          :model-value="filters.code"
          @update:model-value="(v) => updateFilter('code', v)"
          placeholder="请输入方案编号"
          clearable
          class="w-full"
        />
      </div>
      <div class="min-w-[150px]">
        <label class="block text-sm font-medium text-gray-700 mb-1">作物</label>
        <el-select :value="filters.cropFilter" @update:value="(v) => updateFilter('cropFilter', v)" class="w-full" clearable>
          <el-option label="全部" value="全部" />
          <el-option v-for="crop in cropOptions" :key="crop" :label="crop" :value="crop" />
        </el-select>
      </div>
      <div class="flex-1 min-w-[180px]">
        <label class="block text-sm font-medium text-gray-700 mb-1">编制人</label>
        <el-input
          :model-value="filters.author"
          @update:model-value="(v) => updateFilter('author', v)"
          placeholder="请输入编制人"
          clearable
          class="w-full"
        />
      </div>
      <div class="min-w-[150px]">
        <label class="block text-sm font-medium text-gray-700 mb-1">状态</label>
        <el-select :value="filters.status" @update:value="(v) => updateFilter('status', v)" class="w-full" clearable>
          <el-option label="全部" value="全部" />
          <el-option label="已发布" value="已发布" />
          <el-option label="草稿" value="草稿" />
          <el-option label="审核中" value="审核中" />
          <!-- 修复 Y5: 补全待审批/已拒绝/已作废（与表格实际状态对齐） -->
          <el-option label="待审批" value="待审批" />
          <el-option label="已拒绝" value="已拒绝" />
          <el-option label="已作废" value="已作废" />
        </el-select>
      </div>
      <div class="flex-1 min-w-[180px]">
        <label class="block text-sm font-medium text-gray-700 mb-1">开始日期</label>
        <el-date-picker
          :model-value="filters.startDate"
          @update:model-value="(v) => updateFilter('startDate', v)"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="选择开始日期"
          class="w-full"
        />
      </div>
      <div class="flex-1 min-w-[180px]">
        <label class="block text-sm font-medium text-gray-700 mb-1">结束日期</label>
        <el-date-picker
          :model-value="filters.endDate"
          @update:model-value="(v) => updateFilter('endDate', v)"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="选择结束日期"
          class="w-full"
        />
      </div>
      <!-- 操作按钮 - 与其他 3 个页面顺序统一：重置在前，搜索在后 -->
      <div class="flex gap-2">
        <button :class="btnDefault" @click="emit('reset')">
          重置
        </button>
        <button :class="btnDefault" @click="emit('search')">
          <Search class="w-4 h-4" />
          搜索
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Search } from 'lucide-vue-next'

// 样式常量
// 第二阶段 Y2 重构：按钮样式抽常量
import { btnDefault, inputClass } from '../constants/buttonStyles'

const props = defineProps({
  filters: { type: Object, required: true },
  cropOptions: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:filters', 'search', 'reset'])

const updateFilter = (key, value) => {
  emit('update:filters', { ...props.filters, [key]: value })
}
</script>
