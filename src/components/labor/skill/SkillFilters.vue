<template>
  <div class="flex flex-wrap items-end gap-3 p-4 bg-gray-50 rounded-lg">
    <!-- 搜索框 -->
    <div class="flex-1 min-w-[200px]">
      <el-input
        v-model="localFilters.search"
        placeholder="搜索员工姓名或工号..."
        clearable
        @change="handleChange"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>

    <!-- 部门筛选 -->
    <div class="w-40">
      <el-select
        v-model="localFilters.department"
        placeholder="选择部门"
        clearable
        @change="handleChange"
      >
        <el-option label="全部部门" value="" />
        <el-option
          v-for="dept in departmentOptions"
          :key="dept"
          :label="dept"
          :value="dept"
        />
      </el-select>
    </div>

    <!-- 技能标签筛选 -->
    <div class="w-44">
      <el-select
        v-model="localFilters.skillTag"
        placeholder="选择技能"
        clearable
        @change="handleChange"
      >
        <el-option label="全部技能" value="" />
        <el-option
          v-for="tag in allSkillTags"
          :key="tag"
          :label="tag"
          :value="tag"
        />
      </el-select>
    </div>

    <!-- 状态筛选 -->
    <div class="w-36">
      <el-select
        v-model="localFilters.status"
        placeholder="选择状态"
        clearable
        @change="handleChange"
      >
        <el-option label="全部状态" value="" />
        <el-option label="正常" value="正常" />
        <el-option label="即将过期" value="即将过期" />
        <el-option label="已过期" value="已过期" />
      </el-select>
    </div>

    <!-- 重置按钮 -->
    <el-button v-if="hasFilters" text @click="handleReset">
      <el-icon><Close /></el-icon>
      重置
    </el-button>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Search, Close } from '@element-plus/icons-vue'

const props = defineProps({})

const localFilters = ref({ ...props.filters })

// 是否有筛选条件
const hasFilters = computed(() => {
  return localFilters.value.search || localFilters.value.department ||
         localFilters.value.skillTag || localFilters.value.status
})

// 监听 props 变化
watch(() => props.filters, (newFilters) => {
  localFilters.value = { ...newFilters }
}, { deep: true })

const handleChange = () => {
  props.onChange({ ...localFilters.value })
}

const handleReset = () => {
  localFilters.value = {
    search: '',
    department: '',
    skillTag: '',
    status: ''
  }
  props.onReset()
}
</script>
