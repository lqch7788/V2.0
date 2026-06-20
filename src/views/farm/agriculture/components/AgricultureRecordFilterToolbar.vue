<!--
  农事记录筛选工具栏
  对标 V1.1 src/components/farm/agriculture/components/AgricultureRecordFilterToolbar.tsx
-->
<template>
  <div class="bg-white rounded-xl p-3 shadow-sm flex items-center gap-2 flex-wrap">
    <el-input v-model="keyword" placeholder="搜索记录" clearable class="!w-48">
      <template #prefix><el-icon><Search /></el-icon></template>
    </el-input>
    <el-select v-model="type" placeholder="操作类型" clearable class="!w-32">
      <el-option label="种植" value="planting" />
      <el-option label="施肥" value="fertilizer" />
      <el-option label="浇水" value="irrigation" />
      <el-option label="除草" value="weeding" />
      <el-option label="病虫害防治" value="pest" />
    </el-select>
    <el-date-picker v-model="dateRange" type="daterange" range-separator="至"
      start-placeholder="开始" end-placeholder="结束" value-format="YYYY-MM-DD" class="!w-72" />
    <el-button type="primary" @click="emitChange">
      <el-icon><Search /></el-icon>查询
    </el-button>
    <el-button @click="handleReset">
      <el-icon><RefreshLeft /></el-icon>重置
    </el-button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { RefreshLeft, Search } from '@element-plus/icons-vue'

const emit = defineEmits(['change'])

const keyword = ref('')
const type = ref('')
const dateRange = ref([])

const handleReset = () => {
  keyword.value = ''
  type.value = ''
  dateRange.value = []
  emitChange()
}

const emitChange = () => {
  emit('change', { keyword: keyword.value, type: type.value, dateRange: dateRange.value })
}
</script>