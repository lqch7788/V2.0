<template>
  <ElModal
    :model-value="show"
    title="出库单详情"
    :width="1200"
    :height="700"
    :show-submit="false"
    :show-cancel="false"
    :close-on-click-modal="false"
    @update:model-value="(v) => { if (!v) handleClose() }"
    @close="handleClose"
  >
    <!-- 基本信息 -->
    <div class="grid grid-cols-2 gap-4 mb-4">
      <div>
        <div class="text-xs font-medium text-gray-500 mb-1">出库单号</div>
        <div class="font-mono font-semibold text-gray-900">{{ localRecord?.code }}</div>
      </div>
      <div>
        <div class="text-xs font-medium text-gray-500 mb-1">关联领料单号</div>
        <div class="font-mono font-semibold text-gray-900">{{ localRecord?.sourceApplicationCodes?.join(', ') }}</div>
      </div>
      <div>
        <div class="text-xs font-medium text-gray-500 mb-1">申请日期</div>
        <div class="font-semibold text-gray-900">{{ localRecord?.date }}</div>
      </div>
      <div>
        <div class="text-xs font-medium text-gray-500 mb-1">申请人</div>
        <div class="font-semibold text-gray-900">{{ localRecord?.applicant }}</div>
      </div>
      <div>
        <div class="text-xs font-medium text-gray-500 mb-1">库存地点</div>
        <div class="font-semibold text-gray-900">{{ localRecord?.warehouseLocation }}</div>
      </div>
      <div>
        <div class="text-xs font-medium text-gray-500 mb-1">审核人</div>
        <div class="font-semibold text-gray-900">{{ localRecord?.reviewer }}</div>
      </div>
      <div>
        <div class="text-xs font-medium text-gray-500 mb-1">操作人</div>
        <div class="font-semibold text-gray-900">{{ localRecord?.operator }}</div>
      </div>
      <div>
        <div class="text-xs font-medium text-gray-500 mb-1">生产计划批次号</div>
        <div class="font-semibold text-gray-900">{{ localRecord?.productionBatchCode }}</div>
      </div>
      <div>
        <div class="text-xs font-medium text-gray-500 mb-1">执行状态</div>
        <div class="font-semibold">
          <el-tag :type="getStatusTagType(localRecord?.executeStatusClass)">
            {{ localRecord?.executeStatus }}
          </el-tag>
        </div>
      </div>
    </div>

    <!-- 物料明细表格 -->
    <div v-if="localRecord?.materials?.length > 0" class="mt-6">
      <div class="text-xs font-medium text-gray-500 mb-2">物料明细</div>
      <el-table :data="localRecord.materials" border stripe style="width: 100%">
        <el-table-column prop="applicationCode" label="来源领料单号" min-width="140">
          <template #default="{ row }">
            <span class="text-blue-700 font-mono">{{ row.applicationCode }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="materialCode" label="物料编码" min-width="120">
          <template #default="{ row }">
            <span class="text-blue-700 font-mono">{{ row.materialCode }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="materialName" label="物料名称" min-width="100" />
        <el-table-column prop="spec" label="规格" min-width="80" />
        <el-table-column prop="unit" label="单位" width="60" />
        <el-table-column prop="requestedQuantity" label="申请数量" width="90" />
        <el-table-column label="实际库存" width="90">
          <template #default="{ row }">
            <span :class="row.stockQuantity < row.requestedQuantity ? 'text-red-600 font-medium' : 'text-green-600'">
              {{ row.stockQuantity }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="本次实发" width="90">
          <template #default="{ row }">
            <span v-if="row.actualQuantity > 0" :class="row.actualQuantity < row.requestedQuantity ? 'text-amber-600 font-medium' : 'text-green-600'">
              {{ row.actualQuantity }}
            </span>
            <span v-else :class="row.stockQuantity === 0 ? 'text-red-600 font-medium' : 'text-gray-400'">
              {{ row.actualQuantity }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="单价(元)" width="90">
          <template #default="{ row }">
            {{ (row.unitPrice || 0).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column label="小计(元)" width="90">
          <template #default="{ row }">
            {{ ((row.requestedQuantity || 0) * (row.unitPrice || 0)).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="warehousePosition" label="仓库货位" min-width="100" />
        <el-table-column prop="remark" label="备注" min-width="100" />
      </el-table>
    </div>

    <template #footer>
      <div class="flex justify-end">
        <el-button size="small" @click="handleClose">关闭</el-button>
      </div>
    </template>
  </ElModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElModal } from '@/components/ui'

const props = defineProps({
  show: { type: Boolean, default: false },
  record: { type: Object, default: null }
})

const emit = defineEmits(['close'])

const localRecord = ref(props.record)

watch(() => props.show, (isOpen) => {
  if (isOpen) {
    localRecord.value = props.record
  }
})

watch(() => props.record, (val) => {
  localRecord.value = val
}, { deep: true })

const handleClose = () => emit('close')

// 根据执行状态class获取标签类型
const getStatusTagType = (statusClass) => {
  const typeMap = {
    'completed': 'success',
    'pending_out': 'warning',
    'partial': 'info',
    'cancelled': 'info'
  }
  return typeMap[statusClass] || 'info'
}
</script>
