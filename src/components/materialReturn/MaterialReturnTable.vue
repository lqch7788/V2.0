<template>
  <div class="bg-white rounded-xl shadow-sm overflow-hidden">
    <el-table :data="data" style="width: 100%" stripe @expand-change="handleExpand">
      <el-table-column type="selection" width="55" v-if="showSelection" />
      <el-table-column type="expand" width="50">
        <template #default="{ row }">
          <div class="p-4 bg-gray-50">
            <h4 class="font-medium mb-2">物料明细</h4>
            <el-table :data="row.materials" style="width: 100%" size="small" border>
              <el-table-column prop="materialCode" label="物料编码" min-width="120" />
              <el-table-column prop="materialName" label="物料名称" min-width="120" />
              <el-table-column prop="spec" label="规格" min-width="100" />
              <el-table-column prop="unit" label="单位" width="80" />
              <el-table-column prop="returnQuantity" label="退料数量" width="100" />
              <el-table-column prop="reason" label="退料原因" min-width="100" />
              <el-table-column prop="warehousePosition" label="货位" min-width="100" />
              <el-table-column prop="remark" label="备注" min-width="100" />
            </el-table>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="code" label="退料单号" min-width="150">
        <template #default="{ row }">
          <span class="text-blue-600 cursor-pointer hover:text-blue-700" @click="$emit('view', row)">{{ row.code }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="date" label="退料日期" min-width="120" />
      <el-table-column prop="type" label="退料类型" min-width="100" />
      <el-table-column prop="applicant" label="申请人" min-width="100" />
      <el-table-column prop="operator" label="操作人" min-width="100" />
      <el-table-column prop="department" label="退料部门" min-width="100" />
      <el-table-column prop="warehouseLocation" label="仓库位置" min-width="100" />
      <el-table-column prop="status" label="审批状态" min-width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.statusClass)" size="small">{{ row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="reviewer" label="审核人" min-width="100" />
      <el-table-column prop="remark" label="备注" min-width="120" />
    </el-table>
  </div>
</template>

<script setup>
const props = defineProps({
  data: { type: Array, default: () => [] },
  expandedRows: { type: Set, default: () => new Set() },
  selectedRows: { type: Array, default: () => [] },
  exportMode: { type: Boolean, default: false },
  batchEditMode: { type: Boolean, default: false },
  deleteMode: { type: Boolean, default: false }
})

const emit = defineEmits(['toggle-expand', 'select-row', 'select-all', 'view'])

const showSelection = computed(() => props.exportMode || props.batchEditMode || props.deleteMode)

const getStatusType = (statusClass) => {
  switch (statusClass) {
    case 'completed': return 'success'
    case 'pending': return 'warning'
    case 'approved': return 'success'
    case 'rejected': return 'danger'
    case 'voided': return 'info'
    default: return 'info'
  }
}

const handleExpand = (row) => {
  emit('toggle-expand', row.id)
}
</script>

<script>
import { computed } from 'vue'
export default { name: 'MaterialReturnTable' }
</script>
