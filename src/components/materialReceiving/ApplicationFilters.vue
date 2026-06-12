<template>
  <!-- 搜索区域 -->
  <div class="bg-gray-50 rounded-lg p-4">
    <div class="flex items-end gap-4">
      <!-- 领料单号搜索 -->
      <div class="flex-1">
        <label class="block text-sm font-medium text-gray-900 mb-1">领料单号</label>
        <el-input
          v-model="localSearchCode"
          placeholder="搜索领料单号..."
          clearable
          @clear="handleSearchCodeChange('')"
          @input="handleSearchCodeChange(localSearchCode)"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <!-- 申领人搜索 -->
      <div class="flex-1">
        <label class="block text-sm font-medium text-gray-900 mb-1">申领人</label>
        <el-input
          v-model="localSearchApplicant"
          placeholder="搜索申领人..."
          clearable
          @clear="handleSearchApplicantChange('')"
          @input="handleSearchApplicantChange(localSearchApplicant)"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <!-- 生产计划批次号搜索 -->
      <div class="flex-1">
        <label class="block text-sm font-medium text-gray-900 mb-1">生产计划批次号</label>
        <el-input
          v-model="localSearchBatchCode"
          placeholder="搜索生产计划批次号..."
          clearable
          @clear="handleSearchBatchCodeChange('')"
          @input="handleSearchBatchCodeChange(localSearchBatchCode)"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <!-- 库存地点筛选 -->
      <div class="flex-1">
        <label class="block text-sm font-medium text-gray-900 mb-1">库存地点</label>
        <el-select
          v-model="localSearchWarehouse"
          placeholder="全部"
          clearable
          @change="handleSearchWarehouseChange"
        >
          <el-option label="全部" value="" />
          <el-option label="仓库A区" value="仓库A区" />
          <el-option label="仓库B区" value="仓库B区" />
          <el-option label="仓库C区" value="仓库C区" />
          <el-option label="仓库D区" value="仓库D区" />
          <el-option label="仓库E区" value="仓库E区" />
        </el-select>
      </div>

      <!-- 审批状态筛选 -->
      <div class="flex-1">
        <label class="block text-sm font-medium text-gray-900 mb-1">审批状态</label>
        <el-select
          v-model="localStatusFilter"
          placeholder="全部状态"
          clearable
          @change="handleStatusFilterChange"
        >
          <el-option label="全部状态" value="" />
          <el-option label="待审批" value="待审批" />
          <el-option label="已审批" value="已审批" />
          <el-option label="已拒绝" value="已拒绝" />
          <el-option label="已作废" value="已作废" />
          <el-option label="已取消" value="已取消" />
        </el-select>
      </div>

      <!-- 重置按钮 -->
      <el-button @click="handleReset">重置</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'

const props = defineProps({
  searchCode: { type: String, default: '' },
  searchApplicant: { type: String, default: '' },
  searchBatchCode: { type: String, default: '' },
  searchWarehouse: { type: String, default: '' },
  statusFilter: { type: String, default: '' }
})

const emit = defineEmits([
  'update:searchCode',
  'update:searchApplicant',
  'update:searchBatchCode',
  'update:searchWarehouse',
  'update:statusFilter',
  'reset',
  'page-change'
])

// 本地状态
const localSearchCode = ref(props.searchCode)
const localSearchApplicant = ref(props.searchApplicant)
const localSearchBatchCode = ref(props.searchBatchCode)
const localSearchWarehouse = ref(props.searchWarehouse)
const localStatusFilter = ref(props.statusFilter)

// 监听 props 变化
watch(() => props.searchCode, (val) => { localSearchCode.value = val })
watch(() => props.searchApplicant, (val) => { localSearchApplicant.value = val })
watch(() => props.searchBatchCode, (val) => { localSearchBatchCode.value = val })
watch(() => props.searchWarehouse, (val) => { localSearchWarehouse.value = val })
watch(() => props.statusFilter, (val) => { localStatusFilter.value = val })

// 处理变更
const handleSearchCodeChange = (val) => {
  emit('update:searchCode', val)
  emit('page-change', 1)
}

const handleSearchApplicantChange = (val) => {
  emit('update:searchApplicant', val)
  emit('page-change', 1)
}

const handleSearchBatchCodeChange = (val) => {
  emit('update:searchBatchCode', val)
  emit('page-change', 1)
}

const handleSearchWarehouseChange = (val) => {
  emit('update:searchWarehouse', val || '')
  emit('page-change', 1)
}

const handleStatusFilterChange = (val) => {
  emit('update:statusFilter', val || '')
  emit('page-change', 1)
}

const handleReset = () => {
  localSearchCode.value = ''
  localSearchApplicant.value = ''
  localSearchBatchCode.value = ''
  localSearchWarehouse.value = ''
  localStatusFilter.value = ''
  emit('reset')
  emit('page-change', 1)
}
</script>
