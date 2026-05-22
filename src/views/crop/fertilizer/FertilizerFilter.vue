<template>
  <!-- 施肥管理筛选工具栏组件 -->
  <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm">
    <div class="flex flex-wrap gap-4 items-end">
      <!-- 肥料类型（字典选择） -->
      <div class="min-w-[140px]">
        <label class="block text-sm text-gray-700 mb-1">肥料类型</label>
        <el-select
          v-model="localFilters.fertilizerType"
          placeholder="全部"
          class="w-full"
          @change="handleChange"
        >
          <el-option label="全部" value="" />
          <el-option label="有机肥" value="organic" />
          <el-option label="无机肥" value="inorganic" />
          <el-option label="生物肥" value="biological" />
          <el-option label="复合肥" value="compound" />
          <el-option label="微量元素肥" value="trace" />
        </el-select>
      </div>

      <!-- 作物品种 -->
      <div class="flex-1 min-w-[140px]">
        <label class="block text-sm text-gray-700 mb-1">作物品种</label>
        <el-input
          v-model="localFilters.cropName"
          type="text"
          placeholder="请输入作物品种"
          @change="handleChange"
        />
      </div>

      <!-- 温室位置 -->
      <div class="flex-1 min-w-[140px]">
        <label class="block text-sm text-gray-700 mb-1">温室位置</label>
        <el-input
          v-model="localFilters.greenhouseName"
          type="text"
          placeholder="请输入温室位置"
          @change="handleChange"
        />
      </div>

      <!-- 数据来源 -->
      <div class="min-w-[120px]">
        <label class="block text-sm text-gray-700 mb-1">数据来源</label>
        <el-select
          v-model="localFilters.dataSource"
          placeholder="全部"
          class="w-full"
          @change="handleChange"
        >
          <el-option label="全部" value="" />
          <el-option label="手动" value="manual" />
          <el-option label="IoT自动" value="auto_iot" />
        </el-select>
      </div>

      <!-- 开始日期 -->
      <div class="min-w-[150px]">
        <label class="block text-sm text-gray-700 mb-1">开始日期</label>
        <el-date-picker
          v-model="localFilters.startDate"
          type="date"
          placeholder="选择日期"
          value-format="YYYY-MM-DD"
          class="w-full"
          @change="handleChange"
        />
      </div>

      <!-- 结束日期 -->
      <div class="min-w-[150px]">
        <label class="block text-sm text-gray-700 mb-1">结束日期</label>
        <el-date-picker
          v-model="localFilters.endDate"
          type="date"
          placeholder="选择日期"
          value-format="YYYY-MM-DD"
          class="w-full"
          @change="handleChange"
        />
      </div>

      <!-- 操作员 -->
      <div class="flex-1 min-w-[120px]">
        <label class="block text-sm text-gray-700 mb-1">操作员</label>
        <el-input
          v-model="localFilters.operatorName"
          type="text"
          placeholder="请输入操作员"
          @change="handleChange"
        />
      </div>

      <!-- 按钮行 -->
      <div class="flex gap-2">
        <el-button @click="handleReset">
          <el-icon class="mr-1"><RefreshLeft /></el-icon>
          重置
        </el-button>
        <el-button type="primary" @click="handleSearch">
          <el-icon class="mr-1"><Search /></el-icon>
          搜索
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Search, RefreshLeft } from '@element-plus/icons-vue'

const props = defineProps({
  filters: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:filters', 'search', 'reset'])

// 本地筛选状态
const localFilters = ref({ ...props.filters })

// 监听外部filters变化
watch(() => props.filters, (newVal) => {
  localFilters.value = { ...newVal }
}, { deep: true })

// 更新筛选条件
const handleChange = () => {
  emit('update:filters', localFilters.value)
}

// 搜索
const handleSearch = () => {
  emit('update:filters', localFilters.value)
  emit('search')
}

// 重置
const handleReset = () => {
  localFilters.value = {}
  emit('update:filters', {})
  emit('reset')
}
</script>

<style scoped>
/* V1.1样式保持 */
</style>
