<template>
  <!-- 筛选工具栏 -->
  <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm">
    <div class="flex flex-wrap gap-4 items-end">
      <!-- 作物品种 -->
      <div class="min-w-[120px]">
        <label class="block text-gray-700 text-sm mb-1">作物品种</label>
        <el-select v-model="localFilters.cropName" placeholder="全部" clearable class="w-full">
          <el-option v-for="c in cropNames" :key="c.value" :label="c.label" :value="c.value" />
        </el-select>
      </div>

      <!-- 种植批号 -->
      <div class="flex-1 min-w-[150px]">
        <label class="block text-gray-700 text-sm mb-1">种植批号</label>
        <el-input v-model="localFilters.plantCode" placeholder="请输入种植批号" clearable />
      </div>

      <!-- 来源批号 -->
      <div class="flex-1 min-w-[150px]">
        <label class="block text-gray-700 text-sm mb-1">来源批号</label>
        <el-input v-model="localFilters.sourceCode" placeholder="请输入来源批号" clearable />
      </div>

      <!-- 定植日期 -->
      <div class="min-w-[150px]">
        <label class="block text-gray-700 text-sm mb-1">定植日期</label>
        <el-date-picker
          v-model="localFilters.transplantDate"
          type="date"
          placeholder="选择日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          class="w-full"
          clearable
        />
      </div>

      <!-- 采收状态 -->
      <div class="min-w-[120px]">
        <label class="block text-gray-700 text-sm mb-1">采收状态</label>
        <el-select v-model="localFilters.isHarvest" placeholder="全部" clearable class="w-full">
          <el-option label="未采收" value="false" />
          <el-option label="已采收" value="true" />
        </el-select>
      </div>
    </div>

    <!-- 第二行 -->
    <div class="flex flex-wrap gap-4 items-end mt-3">
      <!-- 组织 -->
      <div class="min-w-[140px]">
        <label class="block text-gray-700 text-sm mb-1">组织</label>
        <el-input v-model="localFilters.orgName" placeholder="输入组织名称" clearable />
      </div>

      <!-- 定植数量范围 -->
      <div class="min-w-[120px]">
        <label class="block text-gray-700 text-sm mb-1">定植数量≥</label>
        <el-input-number v-model="localFilters.countMin" :min="0" placeholder="最小值" class="w-full" />
      </div>

      <div class="min-w-[120px]">
        <label class="block text-gray-700 text-sm mb-1">定植数量≤</label>
        <el-input-number v-model="localFilters.countMax" :min="0" placeholder="最大值" class="w-full" />
      </div>

      <!-- 按钮行 -->
      <div class="flex gap-2 ml-auto">
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'

const props = defineProps({
  filters: Object,
  areas: Array,
  statusOptions: Array
})

const emit = defineEmits(['update:filters', 'search', 'reset'])

const localFilters = ref({
  cropName: '',
  plantCode: '',
  sourceCode: '',
  areaName: '',
  isHarvest: '',
  startDate: '',
  endDate: '',
  transplantDate: '',
  createBy: '',
  orgName: '',
  countMin: '',
  countMax: ''
})

watch(() => props.filters, (val) => {
  if (val) {
    localFilters.value = { ...val }
  }
}, { deep: true })

const handleSearch = () => {
  emit('update:filters', localFilters.value)
  emit('search')
}

const handleReset = () => {
  localFilters.value = {
    cropName: '',
    plantCode: '',
    sourceCode: '',
    areaName: '',
    isHarvest: '',
    startDate: '',
    endDate: '',
    transplantDate: '',
    createBy: '',
    orgName: '',
    countMin: '',
    countMax: ''
  }
  emit('reset')
}
</script>
