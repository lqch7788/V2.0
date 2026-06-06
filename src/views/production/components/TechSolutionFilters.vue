<template>
  <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm">
    <div class="flex flex-wrap gap-4 items-end">
      <div class="flex-1 min-w-[180px]">
        <label class="block text-sm font-medium text-gray-700 mb-1">方案编号</label>
        <input
          :value="filters.code"
          @input="(e) => updateFilter('code', (e.target as HTMLInputElement).value)"
          :class="inputClass"
          placeholder="请输入方案编号"
        />
      </div>
      <div class="min-w-[150px]">
        <label class="block text-sm font-medium text-gray-700 mb-1">作物</label>
        <el-select :value="filters.cropFilter" @update:value="(v: any) => updateFilter('cropFilter', v)" class="w-full">
          <el-option label="全部" value="全部" />
          <el-option v-for="crop in cropOptions" :key="crop" :label="crop" :value="crop" />
        </el-select>
      </div>
      <div class="flex-1 min-w-[180px]">
        <label class="block text-sm font-medium text-gray-700 mb-1">编制人</label>
        <input
          :value="filters.author"
          @input="(e) => updateFilter('author', (e.target as HTMLInputElement).value)"
          :class="inputClass"
          placeholder="请输入编制人"
        />
      </div>
      <div class="min-w-[150px]">
        <label class="block text-sm font-medium text-gray-700 mb-1">状态</label>
        <el-select :value="filters.status" @update:value="(v: any) => updateFilter('status', v)" class="w-full">
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
        <input
          :value="filters.startDate"
          @input="(e) => updateFilter('startDate', (e.target as HTMLInputElement).value)"
          type="date"
          :class="inputClass"
        />
      </div>
      <div class="flex-1 min-w-[180px]">
        <label class="block text-sm font-medium text-gray-700 mb-1">结束日期</label>
        <input
          :value="filters.endDate"
          @input="(e) => updateFilter('endDate', (e.target as HTMLInputElement).value)"
          type="date"
          :class="inputClass"
        />
      </div>
      <div class="flex gap-2">
        <button :class="btnDefault" @click="emit('search')">
          <Search class="w-4 h-4" />
          搜索
        </button>
        <button :class="btnDefault" @click="emit('reset')">
          重置
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Search } from 'lucide-vue-next'

// 样式常量
// 第二阶段 Y2 重构：按钮样式抽常量
import { btnDefault, inputClass } from '../constants/buttonStyles'

interface Filters {
  code: string
  cropFilter: string
  author: string
  status: string
  startDate: string
  endDate: string
}

interface Props {
  filters: Filters
  cropOptions: string[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:filters': [filters: Filters]
  'search': []
  'reset': []
}>()

const updateFilter = (key: keyof Filters, value: string) => {
  emit('update:filters', { ...props.filters, [key]: value })
}
</script>
