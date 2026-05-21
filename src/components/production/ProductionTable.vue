<template>
  <div class="overflow-x-auto">
    <el-table :data="paginatedData" stripe>
      <el-table-column v-if="batchEditMode || batchDeleteMode" type="selection" width="50" />

      <el-table-column prop="batchCode" label="批次号" width="180">
        <template #default="{ row }">
          <el-button link type="primary" @click="$emit('batchCodeClick', row)">
            {{ row.batchCode }}
          </el-button>
        </template>
      </el-table-column>

      <el-table-column prop="planTypeName" label="计划类型" width="120">
        <template #default="{ row }">
          {{ row.planTypeName || getPlanTypeName(row.planType) }}
        </template>
      </el-table-column>

      <el-table-column prop="plantingMode" label="种植模式" width="100" />

      <el-table-column prop="cropName" label="作物名称" width="100" />

      <el-table-column prop="variety" label="品种" width="100" />

      <el-table-column prop="greenhouseName" label="种植区域" width="120" />

      <el-table-column prop="plantingArea" label="种植面积" width="100">
        <template #default="{ row }">
          {{ row.plantingArea }} m²
        </template>
      </el-table-column>

      <el-table-column prop="startDate" label="开始时间" width="120" />

      <el-table-column prop="expectedHarvestDate" label="预计结束时间" width="140" />

      <el-table-column prop="responsiblePerson" label="负责人" width="100" />

      <el-table-column prop="targetYield" label="目标产量" width="100">
        <template #default="{ row }">
          {{ row.targetYield }} kg
        </template>
      </el-table-column>

      <el-table-column prop="batchStatus" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.batchStatus)" size="small">
            {{ getStatusName(row.batchStatus) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <div class="flex gap-1">
            <el-button link type="primary" size="small" @click="$emit('edit', row)">
              编辑
            </el-button>
            <el-button link type="danger" size="small" @click="$emit('delete', row)">
              删除
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-100">
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-500">每页</span>
        <el-select
          :model-value="pageSize"
          @update:model-value="$emit('pageSizeChange', $event)"
          style="width: 80px"
        >
          <el-option :value="10" label="10" />
          <el-option :value="20" label="20" />
          <el-option :value="50" label="50" />
        </el-select>
        <span class="text-sm text-gray-500">条</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-500">共 {{ filteredBatches.length }} 条</span>
        <el-button :disabled="currentPage === 1" size="small" @click="$emit('pageChange', currentPage - 1)">
          上一页
        </el-button>
        <span class="text-sm">{{ currentPage }} / {{ totalPages }}</span>
        <el-button :disabled="currentPage >= totalPages" size="small" @click="$emit('pageChange', currentPage + 1)">
          下一页
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {  CropBatch  } from '@/types'

const props = defineProps({})

defineEmits(['pageChange'])

const totalPages = computed(() => Math.ceil(props.filteredBatches.length / props.pageSize))

const paginatedData = computed(() => {
  const start = (props.currentPage - 1) * props.pageSize
  const end = start + props.pageSize
  return props.filteredBatches.slice(start, end)
})

const getStatusName = (status) => {
  const map = {
    draft: '草稿',
    pending: '待审批',
    approved: '已审批',
    rejected: '已拒绝',
    completed: '已完成',
    cancelled: '已作废'
  }
  return map[status || ''] || status || ''
}

const getStatusType = (status) => {
  const map = {
    draft: 'info',
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
    completed: 'success',
    cancelled: 'info'
  }
  return map[status || ''] || 'info'
}

const getPlanTypeName = (planType) => {
  const map = {
    planting: '种植计划',
    seedling: '育苗计划',
    seed_source: '种源计划'
  }
  return map[planType || ''] || planType || ''
}
</script>
