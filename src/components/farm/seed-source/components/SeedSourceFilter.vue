<template>
  <div class="bg-white rounded-xl p-4 shadow-sm">
    <!-- 筛选字段 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- 作物类别 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">作物类别</label>
        <el-select v-model="localFilters.cropCategory" placeholder="请选择" clearable class="w-full">
          <el-option label="全部" value="__all__" />
          <el-option v-for="item in cropCategories" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </div>

      <!-- 作物名称 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">作物名称</label>
        <el-input v-model="localFilters.cropName" placeholder="请输入" clearable />
      </div>

      <!-- 种源批号 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">种源批号</label>
        <el-input v-model="localFilters.seedCode" placeholder="请输入" clearable />
      </div>

      <!-- 种源类型 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">种源类型</label>
        <el-select v-model="localFilters.sourceType" placeholder="请选择" clearable class="w-full">
          <el-option label="全部" value="__all__" />
          <el-option label="种子" value="seed" />
          <el-option label="种苗/实生苗" value="seedling" />
          <el-option label="扦插苗" value="cutting" />
          <el-option label="嫁接苗" value="grafting" />
          <el-option label="组培苗" value="tissue_culture" />
          <el-option label="分株苗" value="split" />
          <el-option label="种球/球根" value="bulb" />
          <el-option label="其他" value="other" />
        </el-select>
      </div>

      <!-- 供应商 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">供应商</label>
        <el-select v-model="localFilters.supplierName" placeholder="请选择" clearable class="w-full">
          <el-option label="全部" value="__all__" />
          <el-option v-for="item in suppliers" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </div>

      <!-- 开始日期 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">开始日期</label>
        <el-date-picker
          v-model="localFilters.startDate"
          type="date"
          placeholder="选择日期"
          value-format="YYYY-MM-DD"
          class="w-full"
        />
      </div>

      <!-- 结束日期 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">结束日期</label>
        <el-date-picker
          v-model="localFilters.endDate"
          type="date"
          placeholder="选择日期"
          value-format="YYYY-MM-DD"
          class="w-full"
        />
      </div>

      <!-- 库存状态 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">库存状态</label>
        <el-select v-model="localFilters.status" placeholder="请选择" clearable class="w-full">
          <el-option label="全部" value="__all__" />
          <el-option label="充足" value="sufficient" />
          <el-option label="不足" value="low" />
          <el-option label="耗尽" value="depleted" />
        </el-select>
      </div>

      <!-- 记录人 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">记录人</label>
        <el-input v-model="localFilters.createBy" placeholder="请输入" clearable />
      </div>
    </div>

    <!-- 按钮行 -->
    <div class="flex justify-end gap-2 mt-4">
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
</template>

<script setup>
import { ref, watch } from 'vue'
import { Search, Refresh } from '@element-plus/icons-vue'

const props = defineProps({
  filters: Object,
  suppliers: Array,
  statusOptions: Array
})

const emit = defineEmits(['update:filters', 'search', 'reset'])

const localFilters = ref({
  cropCategory: '',
  cropName: '',
  seedCode: '',
  sourceType: '',
  supplierName: '',
  startDate: '',
  endDate: '',
  status: '',
  createBy: ''
})

watch(() => props.filters, (newVal) => {
  if (newVal) {
    localFilters.value = { ...newVal }
  }
}, { deep: true })

const handleSearch = () => {
  emit('update:filters', localFilters.value)
  emit('search')
}

const handleReset = () => {
  localFilters.value = {
    cropCategory: '',
    cropName: '',
    seedCode: '',
    sourceType: '',
    supplierName: '',
    startDate: '',
    endDate: '',
    status: '',
    createBy: ''
  }
  emit('reset')
}
</script>
