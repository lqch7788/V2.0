<template>
  <!-- 种植筛选工具栏 - 与V1.1 PlantingFilter.tsx完全一致 -->
  <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm">
    <div class="flex flex-wrap gap-4 items-end">
      <!-- 作物品种 -->
      <div class="min-w-[120px]">
        <label class="block text-gray-700 text-sm mb-1">作物品种</label>
        <el-select
          v-model="localFilters.cropName"
          placeholder="全部"
          clearable
          class="w-full"
          @change="handleFilterChange('cropName', $event)"
        >
          <el-option
            v-for="crop in cropNames"
            :key="crop.value"
            :label="crop.label"
            :value="crop.value"
          />
        </el-select>
      </div>

      <!-- 种植批号 -->
      <div class="flex-1 min-w-[150px]">
        <label class="block text-gray-700 text-sm mb-1">种植批号</label>
        <el-input
          v-model="localFilters.plantCode"
          placeholder="请输入种植批号"
          clearable
          @input="handleFilterChange('plantCode', $event)"
        />
      </div>

      <!-- 来源批号 -->
      <div class="flex-1 min-w-[150px]">
        <label class="block text-gray-700 text-sm mb-1">来源批号</label>
        <el-input
          v-model="localFilters.sourceCode"
          placeholder="请输入来源批号"
          clearable
          @input="handleFilterChange('sourceCode', $event)"
        />
      </div>

      <!-- 定植日期 -->
      <div class="min-w-[150px]">
        <label class="block text-gray-700 text-sm mb-1">定植日期</label>
        <el-date-picker
          v-model="localFilters.transplantDate"
          type="date"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          placeholder="选择日期"
          clearable
          class="w-full"
          @change="handleFilterChange('transplantDate', $event)"
        />
      </div>

      <!-- 大棚位置 -->
      <div class="min-w-[160px]">
        <label class="block text-gray-700 text-sm mb-1">大棚位置</label>
        <el-select
          v-model="localFilters.areaName"
          placeholder="全部"
          clearable
          filterable
          class="w-full"
          @change="handleFilterChange('areaName', $event)"
        >
          <el-option
            v-for="area in areaTreeData"
            :key="area.value"
            :label="area.label"
            :value="area.value"
          />
        </el-select>
      </div>

      <!-- 采收状态 -->
      <div class="min-w-[120px]">
        <label class="block text-gray-700 text-sm mb-1">采收状态</label>
        <el-select
          v-model="localFilters.isHarvest"
          placeholder="全部"
          clearable
          class="w-full"
          @change="handleFilterChange('isHarvest', $event)"
        >
          <el-option label="未采收" value="false" />
          <el-option label="已采收" value="true" />
        </el-select>
      </div>

      <!-- 按钮行 -->
      <div class="flex gap-2 items-end">
        <el-button v-if="onAdd" type="primary" @click="onAdd">
          <el-icon><Plus /></el-icon>
          新增
        </el-button>
        <el-button @click="handleReset">
          <el-icon><RefreshRight /></el-icon>
          重置
        </el-button>
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { Search, RefreshRight, Plus } from '@element-plus/icons-vue'

const props = defineProps({
  filters: {
    type: Object,
    default: () => ({
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
      countMin: undefined,
      countMax: undefined
    })
  },
  cropNames: {
    type: Array,
    default: () => []
  },
  areas: {
    type: Array,
    default: () => []
  },
  statusOptions: {
    type: Array,
    default: () => []
  },
  onAdd: Function
})

const emit = defineEmits(['update:filters', 'search', 'reset'])

// 本地筛选数据副本
const localFilters = ref({ ...props.filters })

// 监听 props.filters 变化，同步到本地
watch(() => props.filters, (newFilters) => {
  localFilters.value = { ...newFilters }
}, { deep: true })

// 将扁平区域数据构建为简单选项（V2.0暂用扁平结构）
const areaTreeData = computed(() => {
  return props.areas.map(a => ({
    value: a.value,
    label: a.label
  }))
})

// 处理单个字段变化
const handleFilterChange = (field, value) => {
  localFilters.value = { ...localFilters.value, [field]: value }
  emit('update:filters', { ...localFilters.value })
}

// 搜索
const handleSearch = () => {
  emit('update:filters', { ...localFilters.value })
  emit('search')
}

// 重置
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
    countMin: undefined,
    countMax: undefined
  }
  emit('update:filters', { ...localFilters.value })
  emit('reset')
}
</script>
