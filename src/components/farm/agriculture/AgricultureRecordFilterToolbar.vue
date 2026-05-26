<template>
  <!-- 农事操作记录筛选工具栏 - 从V1.1 AgricultureRecordFilterToolbar.tsx 1:1迁移 -->
  <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm">
    <div class="flex flex-wrap gap-4 items-end">
      <!-- 搜索框 -->
      <div class="flex-1 min-w-[180px]">
        <label class="text-gray-700 text-sm block mb-1">搜索</label>
        <el-input v-model="localFilters.searchText" @input="emitUpdate" placeholder="操作单号/作物/区域/人员" />
      </div>

      <!-- 来源类型 -->
      <div class="min-w-[140px]">
        <label class="text-gray-700 text-sm block mb-1">来源类型</label>
        <el-select v-model="localFilters.sourceType" @change="emitUpdate" class="w-full" placeholder="全部" clearable>
          <el-option v-for="opt in SOURCE_OPTIONS" :key="opt.value" :value="opt.value" :label="opt.label" />
        </el-select>
      </div>

      <!-- 操作类型 -->
      <div class="min-w-[140px]">
        <label class="text-gray-700 text-sm block mb-1">操作类型</label>
        <el-select v-model="localFilters.operationType" @change="emitUpdate" class="w-full" placeholder="全部" clearable>
          <el-option v-for="opt in TYPE_OPTIONS" :key="opt.value" :value="opt.value" :label="opt.label" />
        </el-select>
      </div>

      <!-- 状态 -->
      <div class="min-w-[120px]">
        <label class="text-gray-700 text-sm block mb-1">状态</label>
        <el-select v-model="localFilters.status" @change="emitUpdate" class="w-full" placeholder="全部" clearable>
          <el-option v-for="opt in STATUS_OPTIONS" :key="opt.value" :value="opt.value" :label="opt.label" />
        </el-select>
      </div>

      <!-- 操作区域 -->
      <div class="min-w-[150px]">
        <label class="text-gray-700 text-sm block mb-1">操作区域</label>
        <el-select v-model="localFilters.greenhouseId" @change="emitUpdate" class="w-full" placeholder="全部" clearable>
          <el-option v-for="g in greenhouseOptions" :key="g.value" :value="g.value" :label="g.label" />
        </el-select>
      </div>

      <!-- 操作人员 -->
      <div class="min-w-[120px]">
        <label class="text-gray-700 text-sm block mb-1">操作人员</label>
        <el-select v-model="localFilters.operatorId" @change="emitUpdate" class="w-full" placeholder="全部" clearable>
          <el-option v-for="w in operatorOptions" :key="w.value" :value="w.value" :label="w.label" />
        </el-select>
      </div>

      <!-- 按钮组 -->
      <div class="flex gap-2">
        <el-button @click="handleReset">
          <el-icon><RefreshRight /></el-icon>
          重置
        </el-button>
        <el-button v-if="canCreate" type="primary" @click="$emit('add')">
          <el-icon><Plus /></el-icon>
          新增
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch, computed } from 'vue'
import { RefreshRight, Plus } from '@element-plus/icons-vue'
import { FARM_OPERATION_TYPES } from '@/types/farm/common'

const props = defineProps({
  filters: { type: Object, default: () => ({}) },
  canCreate: { type: Boolean, default: true },
})

const emit = defineEmits(['update:filters', 'reset', 'add'])

// 来源配置（内联，避免外部依赖）
const SOURCE_CONFIG = {
  task: { label: '任务派发', color: 'text-blue-600' },
  tempTask: { label: '临时任务', color: 'text-orange-600' },
  manual: { label: '手动录入', color: 'text-green-600' },
  inspection: { label: '巡查记录', color: 'text-purple-600' },
}

const SOURCE_OPTIONS = Object.entries(SOURCE_CONFIG).map(([value, config]) => ({
  value, label: config.label,
}))

const STATUS_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'pending', label: '待执行' },
  { value: 'in_progress', label: '进行中' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' },
]

const TYPE_OPTIONS = [
  { value: '', label: '全部' },
  ...FARM_OPERATION_TYPES.map(t => ({ value: t.value, label: t.label })),
]

// 温室选项（从store获取，暂无store时使用静态数据）
const greenhouseOptions = [
  { value: 'GH_001', label: '玻璃温室A区' },
  { value: 'GH_002', label: '玻璃温室B区' },
  { value: 'GH_003', label: '塑料大棚C区' },
  { value: 'GH_004', label: '露天种植区A' },
]

// 操作人员选项（从store获取，暂无store时使用静态数据）
const operatorOptions = [
  { value: 'USER_001', label: '张技术员' },
  { value: 'USER_002', label: '李技术员' },
  { value: 'USER_003', label: '王操作员' },
  { value: 'USER_004', label: '赵操作员' },
  { value: 'USER_005', label: '巡检员小陈' },
]

const localFilters = reactive({ ...props.filters })

watch(() => props.filters, (v) => { Object.assign(localFilters, v) }, { deep: true })

const emitUpdate = () => {
  emit('update:filters', { ...localFilters })
}

const handleReset = () => {
  Object.keys(localFilters).forEach(k => { localFilters[k] = '' })
  emit('update:filters', { ...localFilters })
  emit('reset')
}
</script>
