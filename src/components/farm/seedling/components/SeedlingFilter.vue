<template>
  <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm">
    <!-- 筛选字段 -->
    <div class="flex flex-wrap gap-4 items-end">
      <!-- 作物品种 -->
      <div class="min-w-[120px]">
        <label class="block text-sm font-medium text-gray-700 mb-1">作物品种</label>
        <el-select v-model="localFilters.cropName" placeholder="全部" clearable class="w-full">
          <el-option label="全部" value="__all__" />
          <el-option
            v-for="item in cropNames"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>

      <!-- 育苗批号 -->
      <div class="flex-1 min-w-[150px]">
        <label class="block text-sm font-medium text-gray-700 mb-1">育苗批号</label>
        <el-input
          v-model="localFilters.seedlingCode"
          placeholder="请输入育苗批号"
          clearable
          @keyup.enter="handleSearch"
        />
      </div>

      <!-- 育苗方式 -->
      <div class="min-w-[120px]">
        <label class="block text-sm font-medium text-gray-700 mb-1">育苗方式</label>
        <el-select v-model="localFilters.seedlingType" placeholder="全部" clearable class="w-full">
          <el-option label="全部" value="__all__" />
          <el-option
            v-for="item in seedlingTypes"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>

      <!-- 种源批号 -->
      <div class="flex-1 min-w-[150px]">
        <label class="block text-sm font-medium text-gray-700 mb-1">种源批号</label>
        <el-input
          v-model="localFilters.sourceCode"
          placeholder="请输入种源批号"
          clearable
          @keyup.enter="handleSearch"
        />
      </div>

      <!-- 温室场地 -->
      <div class="min-w-[120px]">
        <label class="block text-sm font-medium text-gray-700 mb-1">温室场地</label>
        <el-select v-model="localFilters.siteName" placeholder="全部" clearable class="w-full">
          <el-option label="全部" value="__all__" />
          <el-option
            v-for="item in sites"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>

      <!-- 状态 -->
      <div class="min-w-[120px]">
        <label class="block text-sm font-medium text-gray-700 mb-1">状态</label>
        <el-select v-model="localFilters.status" placeholder="全部" clearable class="w-full">
          <el-option label="全部" value="__all__" />
          <el-option label="进行中" value="in_progress" />
          <el-option label="待定植" value="transplant_ready" />
          <el-option label="已完成" value="completed" />
          <el-option label="异常" value="abnormal" />
        </el-select>
      </div>

      <!-- 按钮行 -->
      <div class="flex gap-2">
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
import { ref, watch } from 'vue'
import { Search, Refresh } from '@element-plus/icons-vue'

const props = defineProps({
  filters: Object,
  cropNames: {
    type: Array,
    default: () => []
  },
  seedlingTypes: Array,
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

// 监听 props.filters 变化，同步到本地
watch(() => props.filters, (newVal) => {
  if (newVal) {
    localFilters.value = { ...newVal }
  }
}, { deep: true, immediate: true })

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
  emit('update:filters', localFilters.value)
  emit('reset')
}
</script>
