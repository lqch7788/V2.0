<template>
  <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm border border-gray-100">
    <div class="flex flex-col lg:flex-row gap-4 items-end">
      <!-- 计划类型下拉选择 -->
      <div class="min-w-[120px]">
        <label class="text-gray-700 text-sm block mb-1">计划类型</label>
        <el-select v-model="localPlanType" placeholder="全部类型" class="w-full">
          <el-option label="全部类型" value="all" />
          <el-option
            v-for="[key, label] in Object.entries(planTypeLabels)"
            :key="key"
            :label="label"
            :value="key"
          />
        </el-select>
      </div>
      <!-- 批次编号搜索 -->
      <div class="flex-1 min-w-[140px]">
        <label class="text-gray-700 text-sm block mb-1">批次编号</label>
        <el-input
          v-model="localBatchCode"
          placeholder="搜索批次编号"
          clearable
        />
      </div>
      <!-- 种植模式搜索 -->
      <div class="flex-1 min-w-[140px]">
        <label class="text-gray-700 text-sm block mb-1">种植模式</label>
        <el-input
          v-model="localPlantingMode"
          placeholder="搜索种植模式"
          clearable
        />
      </div>
      <!-- 作物名称搜索 -->
      <div class="flex-1 min-w-[140px]">
        <label class="text-gray-700 text-sm block mb-1">作物名称</label>
        <el-input
          v-model="localCropName"
          placeholder="搜索作物名称"
          clearable
        />
      </div>
      <!-- 作物品种搜索 -->
      <div class="flex-1 min-w-[140px]">
        <label class="text-gray-700 text-sm block mb-1">作物品种</label>
        <el-input
          v-model="localVariety"
          placeholder="搜索作物品种"
          clearable
        />
      </div>
      <!-- 种植区域搜索 -->
      <div class="flex-1 min-w-[140px]">
        <label class="text-gray-700 text-sm block mb-1">种植区域</label>
        <el-input
          v-model="localGreenhouse"
          placeholder="搜索种植区域"
          clearable
        />
      </div>
      <!-- 状态下拉选择 -->
      <div class="min-w-[120px]">
        <label class="text-gray-700 text-sm block mb-1">状态</label>
        <el-select v-model="localStatus" placeholder="全部状态" class="w-full">
          <el-option label="全部状态" value="all" />
          <el-option
            v-for="[key, label] in Object.entries(batchStatusLabels)"
            :key="key"
            :label="label"
            :value="key"
          />
        </el-select>
      </div>
      <!-- 操作按钮 -->
      <div class="flex gap-2 ml-2">
        <button class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700" @click="handleReset">重置</button>
        <button class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700" @click="handleSearch">
          <Search class="w-4 h-4" />
          搜索
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Search } from 'lucide-vue-next'
import { batchStatusLabels, PlanTypeLabels as planTypeLabels } from './constants'

const props = defineProps({
  batchCodeSearch: { type: String, default: '' },
  plantingModeSearch: { type: String, default: '' },
  cropNameSearch: { type: String, default: '' },
  varietySearch: { type: String, default: '' },
  greenhouseSearch: { type: String, default: '' },
  statusFilter: { type: String, default: 'all' },
  planTypeFilter: { type: String, default: 'all' },
})

const emit = defineEmits([
  'update:batchCodeSearch',
  'update:plantingModeSearch',
  'update:cropNameSearch',
  'update:varietySearch',
  'update:greenhouseSearch',
  'update:statusFilter',
  'update:planTypeFilter',
  'reset',
  'search',
])

const localBatchCode = computed({
  get: () => props.batchCodeSearch,
  set: (v) => emit('update:batchCodeSearch', v),
})
const localPlantingMode = computed({
  get: () => props.plantingModeSearch,
  set: (v) => emit('update:plantingModeSearch', v),
})
const localCropName = computed({
  get: () => props.cropNameSearch,
  set: (v) => emit('update:cropNameSearch', v),
})
const localVariety = computed({
  get: () => props.varietySearch,
  set: (v) => emit('update:varietySearch', v),
})
const localGreenhouse = computed({
  get: () => props.greenhouseSearch,
  set: (v) => emit('update:greenhouseSearch', v),
})
const localStatus = computed({
  get: () => props.statusFilter,
  set: (v) => emit('update:statusFilter', v),
})
const localPlanType = computed({
  get: () => props.planTypeFilter,
  set: (v) => emit('update:planTypeFilter', v),
})

function handleReset() {
  emit('reset')
}
function handleSearch() {
  emit('search')
}
</script>
