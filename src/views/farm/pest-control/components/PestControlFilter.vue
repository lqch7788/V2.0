<!--
  病虫害筛选组件（对齐 V1.1 PestControlFilter.tsx）
  字段：药剂类型/作物名称/防治区域/目标病虫害/开始日期/结束日期
-->
<template>
  <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
    <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 items-end">
      <div>
        <label class="block text-xs font-medium text-gray-700 mb-1">药剂类型</label>
        <el-select v-model="localFilters.pesticideType" clearable placeholder="全部" class="w-full">
          <el-option label="杀虫剂" value="insecticide" />
          <el-option label="杀菌剂" value="fungicide" />
          <el-option label="除草剂" value="herbicide" />
          <el-option label="生物防治" value="bio" />
        </el-select>
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-700 mb-1">作物名称</label>
        <el-input v-model="localFilters.cropName" clearable placeholder="作物名称" />
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-700 mb-1">防治区域</label>
        <el-input v-model="localFilters.greenhouseName" clearable placeholder="温室/区域" />
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-700 mb-1">目标病虫害</label>
        <el-input v-model="localFilters.targetPest" clearable placeholder="病虫害名称" />
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-700 mb-1">开始日期</label>
        <el-date-picker v-model="localFilters.startDate" type="date" value-format="YYYY-MM-DD" class="w-full" placeholder="开始" />
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-700 mb-1">结束日期</label>
        <el-date-picker v-model="localFilters.endDate" type="date" value-format="YYYY-MM-DD" class="w-full" placeholder="结束" />
      </div>
    </div>
    <div class="flex justify-end gap-2 mt-3">
      <el-button @click="handleReset">重置</el-button>
      <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'

const props = defineProps({
  filters: { type: Object, required: true }
})

const emit = defineEmits(['update:filters', 'search', 'reset'])

const localFilters = reactive({ ...props.filters })

watch(() => props.filters, (val) => {
  Object.assign(localFilters, val)
}, { deep: true })

const handleSearch = () => {
  emit('update:filters', { ...localFilters })
  emit('search')
}

const handleReset = () => {
  Object.assign(localFilters, {
    pesticideType: '', cropName: '', greenhouseName: '',
    targetPest: '', startDate: '', endDate: '', operatorName: ''
  })
  emit('update:filters', { ...localFilters })
  emit('reset')
}
</script>