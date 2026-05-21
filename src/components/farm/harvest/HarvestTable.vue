<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <!-- 表格 -->
    <el-table :data="paginatedData" border style="width: 100%" max-height="calc(100vh - 420px)">
      <el-table-column type="index" width="50" label="序号" align="center" />
      <el-table-column prop="harvestCode" label="采收单号" width="150">
        <template #default="{ row }">
          <span class="font-mono text-blue-600 font-semibold cursor-pointer hover:text-blue-800 hover:underline" @click="$emit('view-detail', row)">
            {{ row.harvestCode }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="harvestDate" label="采收时间" width="160">
        <template #default="{ row }">
          {{ row.harvestDate?.replace('T', ' ') || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="greenhouseName" label="采收区域" width="120" />
      <el-table-column prop="warehouseName" label="入库仓库" width="120" />
      <el-table-column prop="harvesterNames" label="采收人员" width="120">
        <template #default="{ row }">
          {{ (row.harvesterNames || []).join(', ') || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="unitPrice" label="单价(元/kg)" width="120" align="right">
        <template #default="{ row }">
          {{ row.unitPrice ? row.unitPrice.toFixed(2) : '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="totalAmount" label="收入(元)" width="120" align="right">
        <template #default="{ row }">
          <span class="text-emerald-600 font-medium">
            {{ row.totalAmount ? row.totalAmount.toFixed(2) : '-' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="variety" label="作物品种" width="100" />
      <el-table-column prop="batchCode" label="批次号" width="140" />
      <el-table-column prop="harvestQuantity" label="采收量(kg)" width="120" align="right">
        <template #default="{ row }">
          {{ row.harvestQuantity }} {{ row.unit || 'kg' }}
        </template>
      </el-table-column>
      <el-table-column prop="grade" label="品质等级" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="gradeTypeMap[row.grade] || 'info'" size="small">
            {{ row.grade || 'A' }}级
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="statusTypeMap[row.status] || 'info'" size="small">
            {{ statusLabelMap[row.status] || row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="auditor" label="审核人员" width="100" />
      <el-table-column label="操作" width="80" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="$emit('view-detail', row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
      <span class="text-sm text-gray-500">共 {{ total }} 条</span>
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50]"
        :total="total"
        layout="sizes, prev, pager, next"
        background
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({})

defineEmits(['(e', 'row'])

const currentPage = ref(1)
const pageSize = ref(10)

const total = computed(() => props.records.length)

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return props.records.slice(start, start + pageSize.value)
})

const gradeTypeMap = {
  'A': 'success',
  'B': 'warning',
  'C': 'danger'
}

const statusTypeMap = {
  pending: 'info',
  harvesting: 'warning',
  harvested: 'success',
  graded: 'primary',
  stored: 'success'
}

const statusLabelMap = {
  pending: '待采收',
  harvesting: '采收中',
  harvested: '已采收',
  graded: '已分级',
  stored: '已入库'
}
</script>
