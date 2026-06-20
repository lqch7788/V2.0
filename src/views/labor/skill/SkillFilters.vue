<!--
  技能筛选组件
  对标 V1.1 src/components/labor/skill/SkillFilters.tsx
-->
<template>
  <div class="bg-white rounded-xl p-3 shadow-sm flex items-center gap-2 flex-wrap">
    <el-input v-model="keyword" placeholder="搜索技能名" clearable class="!w-48">
      <template #prefix><el-icon><Search /></el-icon></template>
    </el-input>
    <el-select v-model="category" placeholder="分类" clearable class="!w-32">
      <el-option label="种植" value="planting" />
      <el-option label="施肥" value="fertilizer" />
      <el-option label="采收" value="harvest" />
      <el-option label="管理" value="management" />
    </el-select>
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
const category = ref('')

const handleReset = () => {
  keyword.value = ''
  category.value = ''
  emitChange()
}

const emitChange = () => {
  emit('change', { keyword: keyword.value, category: category.value })
}
</script>