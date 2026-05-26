<template>
  <!-- 巡查搜索栏 - 从V1.1 InspectionSearch.tsx 1:1迁移 -->
  <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm">
    <div class="flex flex-wrap gap-4 items-end">
      <!-- 巡查编号 -->
      <div class="flex-1 min-w-[150px]">
        <label class="text-gray-700 text-sm block mb-1">巡查编号</label>
        <el-input
          :model-value="filters.recordCode"
          @update:model-value="update('recordCode', $event)"
          placeholder="请输入巡查编号"
        />
      </div>

      <!-- 巡查类型 -->
      <div class="min-w-[150px]">
        <label class="text-gray-700 text-sm block mb-1">巡查类型</label>
        <el-select :model-value="filters.inspectionType" @update:model-value="update('inspectionType', $event)" class="w-full" placeholder="全部">
          <el-option value="all" label="全部" />
          <el-option value="farm" label="种植区域巡查" />
          <el-option value="equipment" label="设备保养巡查" />
          <el-option value="infrastructure" label="基础设施巡检" />
          <el-option value="other" label="其他" />
        </el-select>
      </div>

      <!-- 提交人 -->
      <div class="flex-1 min-w-[150px]">
        <label class="text-gray-700 text-sm block mb-1">提交人</label>
        <el-input
          :model-value="filters.inspectorName"
          @update:model-value="update('inspectorName', $event)"
          placeholder="请输入提交人"
        />
      </div>

      <!-- 巡查日期(起) -->
      <div class="min-w-[150px]">
        <label class="text-gray-700 text-sm block mb-1">巡查日期(起)</label>
        <el-date-picker
          :model-value="filters.startDate"
          @update:model-value="update('startDate', $event)"
          type="date"
          class="w-full"
        />
      </div>

      <!-- 巡查日期(止) -->
      <div class="min-w-[150px]">
        <label class="text-gray-700 text-sm block mb-1">巡查日期(止)</label>
        <el-date-picker
          :model-value="filters.endDate"
          @update:model-value="update('endDate', $event)"
          type="date"
          class="w-full"
        />
      </div>

      <!-- 状态 -->
      <div class="min-w-[120px]">
        <label class="text-gray-700 text-sm block mb-1">状态</label>
        <el-select :model-value="filters.status" @update:model-value="update('status', $event)" class="w-full" placeholder="全部">
          <el-option value="all" label="全部" />
          <el-option value="normal" label="正常" />
          <el-option value="attention" label="需关注" />
          <el-option value="critical" label="异常" />
        </el-select>
      </div>

      <!-- 问题处理状态 -->
      <div class="min-w-[120px]">
        <label class="text-gray-700 text-sm block mb-1">问题处理状态</label>
        <el-select :model-value="filters.problemStatus" @update:model-value="update('problemStatus', $event)" class="w-full" placeholder="全部">
          <el-option value="all" label="全部" />
          <el-option value="待处理" label="待处理" />
          <el-option value="处理中" label="处理中" />
          <el-option value="待验收" label="待验收" />
          <el-option value="已处理" label="已处理" />
        </el-select>
      </div>

      <!-- 按钮 -->
      <div class="flex gap-2">
        <el-button @click="$emit('reset')">重置</el-button>
        <el-button type="primary" @click="$emit('search')">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Search } from '@element-plus/icons-vue'

const props = defineProps({
  filters: { type: Object, required: true },
})

const emit = defineEmits(['update:filters', 'search', 'reset'])

const update = (key, value) => {
  emit('update:filters', { ...props.filters, [key]: value })
}
</script>
