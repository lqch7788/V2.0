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
const btnBase = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'
const btnDefault = `${btnBase} bg-emerald-600 text-white hover:bg-emerald-700 h-8 rounded-md px-3 text-xs`
const inputClass = 'flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50'

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
