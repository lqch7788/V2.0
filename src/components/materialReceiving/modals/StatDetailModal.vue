<!--
  StatDetailModal - 物料统计明细弹窗
  严格对齐 V1.1: src/components/materialReceiving/modals/StatDetailModal.tsx
  4 个分组：物料基本信息 / 批次信息 / 领料统计 / 数据汇总
-->
<template>
  <el-dialog
    :model-value="isOpen"
    title="物料统计明细"
    width="900px"
    :show-close="true"
    @close="handleClose"
  >
    <div v-if="record" class="space-y-5">
      <!-- 物料基本信息 -->
      <div>
        <h4 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <span class="w-1 h-4 bg-emerald-500 rounded-full"></span>
          物料基本信息
        </h4>
        <div class="grid grid-cols-4 gap-3">
          <div class="bg-emerald-50 rounded-lg p-3">
            <div class="text-xs text-emerald-600 mb-1">物料编号</div>
            <div class="text-sm font-mono font-semibold text-emerald-700">{{ record.materialCode || '-' }}</div>
          </div>
          <div class="bg-emerald-50 rounded-lg p-3">
            <div class="text-xs text-emerald-600 mb-1">物料名称</div>
            <div class="text-sm font-semibold text-emerald-700">{{ record.materialName || '-' }}</div>
          </div>
          <div class="bg-blue-50 rounded-lg p-3">
            <div class="text-xs text-blue-600 mb-1">物料分类</div>
            <div class="text-sm font-semibold text-blue-700">{{ record.category || '-' }}</div>
          </div>
          <div class="bg-blue-50 rounded-lg p-3">
            <div class="text-xs text-blue-600 mb-1">规格型号</div>
            <div class="text-sm font-semibold text-blue-700">{{ record.spec || '-' }}</div>
          </div>
          <div class="bg-gray-50 rounded-lg p-3">
            <div class="text-xs text-gray-600 mb-1">条形码</div>
            <div class="text-sm font-mono text-gray-700">{{ record.barcode || '-' }}</div>
          </div>
          <div class="bg-gray-50 rounded-lg p-3">
            <div class="text-xs text-gray-600 mb-1">单位</div>
            <div class="text-sm font-semibold text-gray-700">{{ record.unit || '-' }}</div>
          </div>
          <div class="bg-purple-50 rounded-lg p-3">
            <div class="text-xs text-purple-600 mb-1">供应商</div>
            <div class="text-sm font-semibold text-purple-700">{{ record.supplier || '-' }}</div>
          </div>
          <div class="bg-purple-50 rounded-lg p-3">
            <div class="text-xs text-purple-600 mb-1">主要仓库</div>
            <div class="text-sm font-semibold text-purple-700">{{ record.mainWarehouse || '-' }}</div>
          </div>
        </div>
      </div>

      <!-- 批次信息 -->
      <div>
        <h4 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <span class="w-1 h-4 bg-amber-500 rounded-full"></span>
          批次信息
        </h4>
        <div class="grid grid-cols-4 gap-3">
          <div class="bg-amber-50 rounded-lg p-3">
            <div class="text-xs text-amber-600 mb-1">批次号</div>
            <div class="text-sm font-mono font-semibold text-amber-700">{{ record.batchCode || '-' }}</div>
          </div>
          <div class="bg-amber-50 rounded-lg p-3">
            <div class="text-xs text-amber-600 mb-1">生产日期</div>
            <div class="text-sm font-semibold text-amber-700">{{ record.productionDate || '-' }}</div>
          </div>
          <div class="bg-amber-50 rounded-lg p-3">
            <div class="text-xs text-amber-600 mb-1">有效期至</div>
            <div class="text-sm font-semibold text-amber-700">{{ record.expiryDate || '-' }}</div>
          </div>
          <div class="bg-amber-50 rounded-lg p-3">
            <div class="text-xs text-amber-600 mb-1">生产计划批次</div>
            <div class="text-sm font-mono font-semibold text-amber-700">{{ record.productionPlanBatchCode || '-' }}</div>
          </div>
        </div>
      </div>

      <!-- 领料统计 -->
      <div>
        <h4 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <span class="w-1 h-4 bg-cyan-500 rounded-full"></span>
          领料统计
        </h4>
        <div class="grid grid-cols-4 gap-3">
          <div class="bg-cyan-50 rounded-lg p-3">
            <div class="text-xs text-cyan-600 mb-1">领料部门</div>
            <div class="text-sm font-semibold text-cyan-700">{{ record.requisitionDepartment || '-' }}</div>
          </div>
          <div class="bg-cyan-50 rounded-lg p-3">
            <div class="text-xs text-cyan-600 mb-1">用途/区域</div>
            <div class="text-sm font-semibold text-cyan-700">{{ record.usageArea || '-' }}</div>
          </div>
          <div class="bg-cyan-50 rounded-lg p-3">
            <div class="text-xs text-cyan-600 mb-1">领料人</div>
            <div class="text-sm font-semibold text-cyan-700">{{ record.requisitioner || '-' }}</div>
          </div>
          <div class="bg-cyan-50 rounded-lg p-3">
            <div class="text-xs text-cyan-600 mb-1">领料时间</div>
            <div class="text-sm font-semibold text-cyan-700">{{ record.requisitionTime || '-' }}</div>
          </div>
        </div>
      </div>

      <!-- 数据汇总 -->
      <div>
        <h4 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <span class="w-1 h-4 bg-rose-500 rounded-full"></span>
          数据汇总
        </h4>
        <div class="grid grid-cols-4 gap-3">
          <div class="bg-rose-50 rounded-lg p-3">
            <div class="text-xs text-rose-600 mb-1">领料次数</div>
            <div class="text-lg font-bold text-rose-700">{{ record.requisitionCount || 0 }}</div>
          </div>
          <div class="bg-orange-50 rounded-lg p-3">
            <div class="text-xs text-orange-600 mb-1">总数量</div>
            <div class="text-lg font-bold text-orange-700">{{ formatNumber(record.totalQuantity) }}</div>
          </div>
          <div class="bg-orange-50 rounded-lg p-3">
            <div class="text-xs text-orange-600 mb-1">实际数量</div>
            <div class="text-lg font-bold text-orange-700">{{ formatNumber(record.actualQuantity) }}</div>
          </div>
          <div class="bg-emerald-50 rounded-lg p-3">
            <div class="text-xs text-emerald-600 mb-1">总金额</div>
            <div class="text-lg font-bold text-emerald-700">¥{{ formatNumber(record.totalAmount) }}</div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
const props = defineProps({
  isOpen: { type: Boolean, default: false },
  record: { type: Object, default: null },
})
const emit = defineEmits(['close'])

const handleClose = () => emit('close')

const formatNumber = (n) => {
  const v = Number(n) || 0
  return v.toLocaleString()
}
</script>