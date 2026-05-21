<template>
  <div class="bg-white rounded-xl p-4 shadow-sm">
    <!-- 筛选字段 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- 作物名称 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">作物名称</label>
        <el-input v-model="localFilters.cropName" placeholder="请输入" clearable />
      </div>

      <!-- 育苗批号 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">育苗批号</label>
        <el-input v-model="localFilters.seedlingCode" placeholder="请输入" clearable />
      </div>

      <!-- 关联种源 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">关联种源</label>
        <el-input v-model="localFilters.sourceCode" placeholder="请输入" clearable />
      </div>

      <!-- 场地 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">场地</label>
        <el-select v-model="localFilters.siteName" placeholder="请选择" clearable class="w-full">
          <el-option label="全部" value="__all__" />
          <el-option v-for="item in sites" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </div>

      <!-- 育苗方式 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">育苗方式</label>
        <el-select v-model="localFilters.seedlingType" placeholder="请选择" clearable class="w-full">
          <el-option label="全部" value="__all__" />
          <el-option v-for="item in seedlingTypes" :key="item.value" :label="item.label" :value="item.value" />
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

      <!-- 状态 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">状态</label>
        <el-select v-model="localFilters.status" placeholder="请选择" clearable class="w-full">
          <el-option label="全部" value="__all__" />
          <el-option label="进行中" value="in_progress" />
          <el-option label="待定植" value="transplant_ready" />
          <el-option label="已完成" value="completed" />
          <el-option label="异常" value="abnormal" />
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
  sites: Array,
  statusOptions: Array
})

const emit = defineEmits(['update:filters', 'search', 'reset'])

const localFilters = ref({
  cropName: '',
  seedlingCode: '',
  sourceCode: '',
  startDate: '',
  endDate: '',
  siteName: '',
  seedlingType: '',
  createBy: '',
  status: ''
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
    cropName: '',
    seedlingCode: '',
    sourceCode: '',
    startDate: '',
    endDate: '',
    siteName: '',
    seedlingType: '',
    createBy: '',
    status: ''
  }
  emit('reset')
}
</script>
