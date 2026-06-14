<template>
  <ElModal
    :model-value="show"
    title="领料单详情"
    :width="1200"
    :height="700"
    :show-submit="false"
    :show-cancel="false"
    :close-on-click-modal="false"
    @update:model-value="(v) => { if (!v) handleClose() }"
    @close="handleClose"
  >
    <div class="grid grid-cols-3 gap-4 mb-4">
      <div>
        <div class="text-sm text-gray-500">领料单号</div>
        <div class="font-mono font-semibold text-gray-900">{{ record.code }}</div>
      </div>
      <div>
        <div class="text-sm text-gray-500">申请日期</div>
        <div class="font-semibold text-gray-900">{{ record.date }}</div>
      </div>
      <div>
        <div class="text-sm text-gray-500">申请人</div>
        <div class="font-semibold text-gray-900">{{ record.applicant }}</div>
      </div>
      <div>
        <div class="text-sm text-gray-500">部门</div>
        <div class="font-semibold text-gray-900">{{ record.department }}</div>
      </div>
      <div>
        <div class="text-sm text-gray-500">库存地点</div>
        <div class="font-semibold text-gray-900">{{ record.warehouseLocation }}</div>
      </div>
      <div>
        <div class="text-sm text-gray-500">物料种类</div>
        <div class="font-semibold text-gray-900">{{ record.materials?.length > 0 ? `${record.materials.length}种` : '-' }}</div>
      </div>
      <div>
        <div class="text-sm text-gray-500">种植区域/用途</div>
        <div class="font-semibold text-gray-900">{{ record.plantArea }}</div>
      </div>
      <div>
        <div class="text-sm text-gray-500">审核人</div>
        <div class="font-semibold text-gray-900">{{ record.reviewer }}</div>
      </div>
      <div>
        <div class="text-sm text-gray-500">生产计划批次号</div>
        <div class="font-semibold text-gray-900">{{ record.productionBatchCode }}</div>
      </div>
      <div>
        <div class="text-sm text-gray-500">状态</div>
        <el-tag :type="getStatusType(record.statusClass)" size="small">{{ record.status }}</el-tag>
        <div v-if="record.statusClass === 'rejected' && record.rejectReason" class="text-xs text-red-600 mt-1">
          拒绝原因：{{ record.rejectReason }}
        </div>
      </div>
    </div>

    <!-- 物料明细表格 -->
    <div v-if="record.materials?.length > 0">
      <div class="text-sm text-gray-500 mb-2">物料明细</div>
      <el-table :data="record.materials" style="width: 100%" stripe border>
        <el-table-column prop="materialCode" label="物料编码" min-width="120" />
        <el-table-column prop="materialName" label="物料名称" min-width="120" />
        <el-table-column prop="spec" label="规格" min-width="100" />
        <el-table-column prop="unit" label="单位" width="80" />
        <el-table-column prop="requestedQuantity" label="申领数量" width="100">
          <template #default="{ row }">
            <span :class="row.requestedQuantity > row.stockQuantity ? 'text-red-600 font-bold' : ''">
              {{ row.requestedQuantity }}
              <span v-if="row.requestedQuantity > row.stockQuantity" class="text-red-600"> (!)</span>
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="stockQuantity" label="当前库存" width="100" />
        <el-table-column label="单价(元)" width="100">
          <template #default="{ row }">{{ row.unitPrice?.toFixed(2) }}</template>
        </el-table-column>
        <el-table-column label="小计(元)" width="100">
          <template #default="{ row }">{{ (row.requestedQuantity * row.unitPrice)?.toFixed(2) }}</template>
        </el-table-column>
        <el-table-column prop="warehousePosition" label="仓库货位" min-width="120" />
        <el-table-column prop="remark" label="备注" min-width="100">
          <template #default="{ row }">{{ row.remark || '-' }}</template>
        </el-table-column>
      </el-table>
    </div>

    <template #footer>
      <el-button size="small" @click="handleClose">关闭</el-button>
    </template>
  </ElModal>
</template>

<script setup>
import { ElModal } from '@/components/ui'

defineProps({
  show: { type: Boolean, default: false },
  record: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['close'])

const getStatusType = (statusClass) => {
  switch (statusClass) {
    case 'approved': return 'success'
    case 'pending': return 'warning'
    case 'rejected': return 'danger'
    case 'cancelled': return 'info'
    case 'voided': return 'info'
    default: return 'info'
  }
}

const handleClose = () => {
  emit('close')
}
</script>
