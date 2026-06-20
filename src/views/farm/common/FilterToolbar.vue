<!--
  通用筛选工具栏
  对标 V1.1 src/components/farm/common/FilterToolbar.tsx
-->
<template>
  <div class="bg-white rounded-xl p-3 shadow-sm flex items-center gap-2 flex-wrap">
    <slot name="default" />
    <el-input v-if="searchable" v-model="keyword" placeholder="搜索关键词" clearable class="!w-48">
      <template #prefix><el-icon><Search /></el-icon></template>
    </el-input>
    <slot name="filters" />
    <div class="ml-auto flex items-center gap-2">
      <el-button v-if="resettable" @click="handleReset">
        <el-icon><RefreshLeft /></el-icon>
        重置
      </el-button>
      <el-button type="primary" @click="handleSearch">
        <el-icon><Search /></el-icon>
        查询
      </el-button>
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { RefreshLeft, Search } from '@element-plus/icons-vue'

defineProps({
  searchable: { type: Boolean, default: true },
  resettable: { type: Boolean, default: true },
})

const emit = defineEmits(['search', 'reset'])

const keyword = ref('')

const handleSearch = () => emit('search', keyword.value)
const handleReset = () => {
  keyword.value = ''
  emit('reset')
}
</script>