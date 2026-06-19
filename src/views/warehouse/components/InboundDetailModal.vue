<!--
  入库记录详情弹窗 - 从 WarehouseInbound.vue 提取
  原文件 L373-466 (~95 行模板 + 依赖 getStatusText)
  V2.0-PM-005 拆分：原 WarehouseInbound.vue 1644 行 → ~1500 行
-->
<template>
  <ElModal
    :model-value="show"
    title="入库记录详情"
    :width="1080"
    :height="650"
    :show-footer="true"
    :show-submit="false"
    :show-cancel="false"
    :show-maximize="false"
    :enable-drag="false"
    :enable-resize="false"
    @update:model-value="(v) => { if (!v) $emit('close') }"
    @close="$emit('close')"
  >
    <div v-if="record">
      <!-- 入库单信息卡片 -->
      <div class="bg-emerald-50 rounded-lg p-4 mb-6 border border-emerald-200">
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <span class="text-xs text-emerald-600 block font-medium">入库单号</span>
            <span class="text-lg font-mono font-bold text-emerald-700">{{ record.code }}</span>
          </div>
          <div>
            <span class="text-xs text-emerald-600 block font-medium">入库日期</span>
            <span class="text-sm font-medium text-gray-900">{{ record.inboundDate || '-' }}</span>
          </div>
          <div>
            <span class="text-xs text-emerald-600 block font-medium">供应商</span>
            <span class="text-sm font-medium text-gray-900">{{ record.supplier || '-' }}</span>
          </div>
          <div>
            <span class="text-xs text-emerald-600 block font-medium">操作员</span>
            <span class="text-sm font-medium text-gray-900">{{ record.operator || '-' }}</span>
          </div>
          <div>
            <span class="text-xs text-emerald-600 block font-medium">状态</span>
            <span class="text-sm font-medium" :class="{
              'text-green-600': record.status === 'completed',
              'text-gray-500': record.status === 'voided',
              'text-amber-600': record.status === 'pending'
            }">
              {{ getStatusText(record.status) }}
            </span>
          </div>
        </div>
        <div class="mt-3 pt-3 border-t border-emerald-200">
          <span class="text-xs text-emerald-600">物料统计：</span>
          <span class="text-sm font-medium text-gray-900 ml-2">
            共 {{ record.materials?.length || 0 }} 种物料，合计 {{ record.materials?.reduce((sum, m) => sum + Number(m.quantity), 0) || 0 }} 件
          </span>
        </div>
      </div>

      <!-- 物料明细表 - V1.1: max-h-96 (不是 80), 表头无背景色 -->
      <h4 class="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <Package class="w-5 h-5 text-emerald-600" />
        物料明细
      </h4>
      <div class="overflow-auto rounded-lg border border-gray-200 max-h-96">
        <table class="min-w-full text-xs">
          <thead>
            <tr>
              <th class="px-3 py-2 text-sm font-semibold text-gray-600 whitespace-nowrap text-left">物料编码</th>
              <th class="px-3 py-2 text-left font-semibold whitespace-nowrap">物料名称</th>
              <th class="px-3 py-2 text-left font-semibold whitespace-nowrap">分类</th>
              <th class="px-3 py-2 text-left font-semibold whitespace-nowrap">规格</th>
              <th class="px-3 py-2 text-left font-semibold whitespace-nowrap">条形码</th>
              <th class="px-3 py-2 text-left font-semibold whitespace-nowrap">单位</th>
              <th class="px-3 py-2 text-left font-semibold whitespace-nowrap">数量</th>
              <th class="px-3 py-2 text-left font-semibold whitespace-nowrap">单价</th>
              <th class="px-3 py-2 text-left font-semibold whitespace-nowrap">供应商</th>
              <th class="px-3 py-2 text-left font-semibold whitespace-nowrap">存放位置</th>
              <th class="px-3 py-2 text-left font-semibold whitespace-nowrap">批号</th>
              <th class="px-3 py-2 text-left font-semibold whitespace-nowrap">生产日期</th>
              <th class="px-3 py-2 text-left font-semibold whitespace-nowrap">有效期至</th>
              <th class="px-3 py-2 text-left font-semibold whitespace-nowrap">备注</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="m in (record.materials || [])" :key="m.id || m.code" class="hover:bg-gray-50">
              <td class="px-3 py-2 text-xs text-blue-600 font-medium whitespace-nowrap">{{ m.code }}</td>
              <td class="px-3 py-2 text-xs text-gray-900 whitespace-nowrap">{{ m.name }}</td>
              <td class="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">{{ m.category || '-' }}</td>
              <td class="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">{{ m.specification || '-' }}</td>
              <td class="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">{{ m.barcode || '-' }}</td>
              <td class="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">{{ m.unit }}</td>
              <td class="px-3 py-2 text-xs text-gray-900 whitespace-nowrap">{{ m.quantity }}</td>
              <td class="px-3 py-2 text-xs text-gray-900 whitespace-nowrap">{{ m.price }}元</td>
              <td class="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">{{ m.supplier || '-' }}</td>
              <td class="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">{{ m.location || '-' }}</td>
              <td class="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">{{ m.batchNo || '-' }}</td>
              <td class="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">{{ m.productionDate || '-' }}</td>
              <td class="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">{{ m.expiryDate || '-' }}</td>
              <td class="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">{{ m.remarks || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-3">
        <el-button size="small" @click="$emit('close')">关闭</el-button>
      </div>
    </template>
  </ElModal>
</template>

<script setup>
import { ElModal } from '@/components/ui'
import { Package } from 'lucide-vue-next'

defineProps({
  show: { type: Boolean, default: false },
  record: { type: Object, default: null }
})

defineEmits(['close'])

// 状态文本转换 - 与 V1.1 一致
const getStatusText = (status) => {
  const map = {
    pending: '待入库',
    completed: '已入库',
    voided: '已作废'
  }
  return map[status] || status
}
</script>
