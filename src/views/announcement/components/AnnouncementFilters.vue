<template>
  <!-- 公告筛选器组件 - V1.1样式 -->
  <div class="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
    <div class="flex flex-wrap items-center gap-4">
      <!-- 类型筛选 - V1.1 Button按钮组形式 -->
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-600">类型：</span>
        <div class="flex flex-wrap gap-2">
          <el-button
            v-for="type in types"
            :key="type"
            size="small"
            :type="typeFilter === type ? 'primary' : ''"
            :plain="typeFilter !== type"
            @click="handleTypeChange(type)"
          >
            {{ type }}
          </el-button>
        </div>
      </div>

      <!-- 关键词搜索 -->
      <div class="w-64">
        <div class="relative">
          <el-input
            v-model="localSearch"
            placeholder="搜索公告标题或编号..."
            clearable
            @input="handleSearchChange"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div v-if="$slots.default" class="flex items-center gap-3 ml-auto">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'

// Props 定义 - V1.1只有searchKeyword和typeFilter
const props = defineProps({
  searchKeyword: {
    type: String,
    default: ''
  },
  typeFilter: {
    type: String,
    default: '全部'
  }
})

// Emits 定义
const emit = defineEmits([
  'update:searchKeyword',
  'update:typeFilter',
  'searchChange',
  'typeChange'
])

// V1.1的类型选项
const types = ['全部', '生产公告', '行政公告']

// 本地副本
const localSearch = ref(props.searchKeyword)
const typeFilter = ref(props.typeFilter)

// 监听 props 变化同步本地值
watch(() => props.searchKeyword, (val) => { localSearch.value = val })
watch(() => props.typeFilter, (val) => { typeFilter.value = val })

// 搜索处理
const handleSearchChange = (val) => {
  emit('update:searchKeyword', val)
  emit('searchChange', val)
}

// 类型切换处理
const handleTypeChange = (val) => {
  emit('update:typeFilter', val)
  emit('typeChange', val)
}
</script>

<style scoped>
</style>
