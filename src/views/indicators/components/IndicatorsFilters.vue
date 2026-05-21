<template>
  <!-- 指标筛选器组件 -->
  <div class="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
    <div class="flex flex-wrap items-center gap-4">
      <!-- 类别筛选 -->
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-600">类别：</span>
        <div class="flex flex-wrap gap-2">
          <el-button
            v-for="cat in categories"
            :key="cat"
            size="small"
            :type="categoryFilter === cat ? 'primary' : 'default'"
            :plain="categoryFilter !== cat"
            @click="onCategoryChange(cat)"
            class="text-xs"
          >
            {{ cat }}
          </el-button>
        </div>
      </div>

      <!-- 关键词搜索 -->
      <div class="flex-1 min-w-[200px]">
        <el-input
          v-model="searchValue"
          placeholder="搜索指标名称或编码..."
          clearable
          @input="handleSearchInput"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { indicatorCategories } from '@/data/indicatorsData'

const props = defineProps({
  searchKeyword: String,
  categoryFilter: String
})

const emit = defineEmits(['update:searchKeyword', 'update:categoryFilter', 'search', 'reset'])

// 类别选项
const categories = indicatorCategories

// 本地搜索值
const searchValue = ref(props.searchKeyword)

// 监听props变化
watch(() => props.searchKeyword, (val) => {
  searchValue.value = val
})

// 搜索输入处理
const handleSearchInput = (val) => {
  emit('update:searchKeyword', val)
}

// 类别变化处理
const onCategoryChange = (category) => {
  emit('update:categoryFilter', category)
}
</script>
