<template>
  <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm">
    <div class="flex flex-wrap gap-4 items-end">
      <!-- 作物品种（文本输入，与V1.1一致） -->
      <div class="flex-1 min-w-[150px]">
        <label class="block text-sm font-medium text-gray-700 mb-1">作物品种</label>
        <el-input
          v-model="localFilters.cropName"
          placeholder="请输入作物品种"
          clearable
          class="w-full"
        />
      </div>

      <!-- 种源批号（文本输入，与V1.1一致） -->
      <div class="flex-1 min-w-[150px]">
        <label class="block text-sm font-medium text-gray-700 mb-1">种源批号</label>
        <el-input
          v-model="localFilters.seedCode"
          placeholder="请输入种源批号"
          clearable
          class="w-full"
        />
      </div>

      <!-- 种源类型（下拉选择，与V1.1一致） -->
      <div class="min-w-[120px]">
        <label class="block text-sm font-medium text-gray-700 mb-1">种源类型</label>
        <el-select v-model="localFilters.sourceType" placeholder="全部" clearable class="w-full">
          <el-option label="全部" value="" />
          <el-option label="种子" value="seed" />
          <el-option label="种苗" value="seedling" />
          <el-option label="扦插苗" value="cutting" />
          <el-option label="嫁接苗" value="grafting" />
          <el-option label="组培苗" value="tissue_culture" />
          <el-option label="分株苗" value="split" />
          <el-option label="种球" value="bulb" />
          <el-option label="其他" value="other" />
        </el-select>
      </div>

      <!-- 供应商（下拉选择，与V1.1一致） -->
      <div class="min-w-[150px]">
        <label class="block text-sm font-medium text-gray-700 mb-1">供应商</label>
        <el-select v-model="localFilters.supplierName" placeholder="全部" clearable class="w-full">
          <el-option label="全部" value="" />
          <el-option label="寿光种业" value="寿光种业" />
          <el-option label="农科院种业" value="农科院种业" />
          <el-option label="山东蔬菜研究所" value="山东蔬菜研究所" />
        </el-select>
      </div>

      <!-- 状态（下拉选择，与V1.1一致） -->
      <div class="min-w-[120px]">
        <label class="block text-sm font-medium text-gray-700 mb-1">状态</label>
        <el-select v-model="localFilters.status" placeholder="全部" clearable class="w-full">
          <el-option label="全部" value="" />
          <el-option label="充足" value="sufficient" />
          <el-option label="不足" value="low" />
          <el-option label="耗尽" value="depleted" />
        </el-select>
      </div>

      <!-- 日期范围（日期选择，与V1.1一致） -->
      <div class="min-w-[240px]">
        <label class="block text-sm font-medium text-gray-700 mb-1">采购/入库日期</label>
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
          class="w-full"
        />
      </div>

      <!-- 按钮行 -->
      <div class="flex gap-2 items-end">
        <el-button @click="handleReset">
          <el-icon><Refresh /></el-icon>
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
import { ref, computed, watch } from 'vue'
import { Search, Refresh } from '@element-plus/icons-vue'

const props = defineProps({
  filters: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:filters', 'search', 'reset'])

// 本地筛选状态（与V1.1一致的6个字段）
const localFilters = ref({
  cropName: '',
  seedCode: '',
  sourceType: '',
  supplierName: '',
  status: ''
})

// 日期范围
const dateRange = ref([])

// 监听 props.filters 变化
watch(() => props.filters, (newVal) => {
  if (newVal) {
    localFilters.value = {
      cropName: newVal.cropName || '',
      seedCode: newVal.seedCode || '',
      sourceType: newVal.sourceType || '',
      supplierName: newVal.supplierName || '',
      status: newVal.status || ''
    }
    // 处理日期范围
    if (newVal.startDate && newVal.endDate) {
      dateRange.value = [newVal.startDate, newVal.endDate]
    } else {
      dateRange.value = []
    }
  }
}, { deep: true, immediate: true })

const handleSearch = () => {
  // 构建搜索条件
  const searchFilters = {
    cropName: localFilters.value.cropName,
    seedCode: localFilters.value.seedCode,
    sourceType: localFilters.value.sourceType,
    supplierName: localFilters.value.supplierName,
    status: localFilters.value.status
  }

  // 添加日期范围
  if (dateRange.value && dateRange.value.length === 2) {
    searchFilters.startDate = dateRange.value[0]
    searchFilters.endDate = dateRange.value[1]
  }

  emit('update:filters', searchFilters)
  emit('search')
}

const handleReset = () => {
  localFilters.value = {
    cropName: '',
    seedCode: '',
    sourceType: '',
    supplierName: '',
    status: ''
  }
  dateRange.value = []
  emit('reset')
}
</script>
