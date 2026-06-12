<template>
  <!-- 搜索区域 -->
  <div class="bg-gray-50 rounded-lg p-4">
    <div class="flex items-end gap-4">
      <!-- 出库单号 -->
      <div class="flex-1">
        <label class="block text-sm font-medium text-gray-900 mb-1">出库单号</label>
        <el-input
          v-model="localSearchCode"
          placeholder="搜索出库单号..."
          clearable
          @clear="handleSearchCodeChange('')"
          @input="handleSearchCodeChange(localSearchCode)"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <!-- 申领人 -->
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

      <!-- 生产计划批次号 -->
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

      <!-- 库存地点 -->
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

      <!-- 执行状态 -->
      <div class="flex-1">
        <label class="block text-sm font-medium text-gray-900 mb-1">执行状态</label>
        <el-select
          v-model="localStatusFilter"
          placeholder="全部状态"
          clearable
          @change="handleStatusFilterChange"
        >
          <el-option label="全部状态" value="" />
          <el-option label="待出库" value="待出库" />
          <el-option label="部分出库" value="部分出库" />
          <el-option label="已出库" value="已出库" />
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
  executeSearchCode: { type: String, default: '' },
  executeSearchApplicant: { type: String, default: '' },
  executeSearchBatchCode: { type: String, default: '' },
  executeSearchWarehouse: { type: String, default: '' },
  executeStatusFilter: { type: String, default: '' }
})

const emit = defineEmits([
  'update:executeSearchCode',
  'update:executeSearchApplicant',
  'update:executeSearchBatchCode',
  'update:executeSearchWarehouse',
  'update:executeStatusFilter',
  'reset'
])

// 本地状态
const localSearchCode = ref(props.executeSearchCode)
const localSearchApplicant = ref(props.executeSearchApplicant)
const localSearchBatchCode = ref(props.executeSearchBatchCode)
const localSearchWarehouse = ref(props.executeSearchWarehouse)
const localStatusFilter = ref(props.executeStatusFilter)

// 监听 props 变化
watch(() => props.executeSearchCode, (val) => { localSearchCode.value = val })
watch(() => props.executeSearchApplicant, (val) => { localSearchApplicant.value = val })
watch(() => props.executeSearchBatchCode, (val) => { localSearchBatchCode.value = val })
watch(() => props.executeSearchWarehouse, (val) => { localSearchWarehouse.value = val })
watch(() => props.executeStatusFilter, (val) => { localStatusFilter.value = val })

// 处理变更
const handleSearchCodeChange = (val) => {
  emit('update:executeSearchCode', val)
}

const handleSearchApplicantChange = (val) => {
  emit('update:executeSearchApplicant', val)
}

const handleSearchBatchCodeChange = (val) => {
  emit('update:executeSearchBatchCode', val)
}

const handleSearchWarehouseChange = (val) => {
  emit('update:executeSearchWarehouse', val || '')
}

const handleStatusFilterChange = (val) => {
  emit('update:executeStatusFilter', val || '')
}

const handleReset = () => {
  localSearchCode.value = ''
  localSearchApplicant.value = ''
  localSearchBatchCode.value = ''
  localSearchWarehouse.value = ''
  localStatusFilter.value = ''
  emit('reset')
}
</script>
