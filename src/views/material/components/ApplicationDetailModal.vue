<!--
  领料单详情弹窗 - 从 MaterialReceiving.vue 提取
  原文件 L1050-1066 (~17 行模板)
  V2.0-PM-001 拆分第 1/5 阶段
-->
<template>
  <ElModal
    :model-value="show"
    title="领料单详情"
    :width="700"
    :height="600"
    @update:model-value="(v) => { if (!v) $emit('close') }"
    @close="$emit('close')"
  >
    <div class="p-2">
      <div v-if="record" class="grid grid-cols-3 gap-0 border border-gray-200 rounded-lg overflow-hidden mb-4">
        <template v-for="(item, idx) in infoList" :key="idx">
          <span class="w-32 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 shrink-0 border-r border-gray-200">{{ item.l }}</span>
          <span class="px-3 py-2 text-sm text-gray-900 flex-1">{{ item.v }}</span>
        </template>
        <div class="flex border-b border-gray-200">
          <span class="w-32 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 shrink-0 border-r border-gray-200">状态</span>
          <span class="px-3 py-2 text-sm flex-1">
            <span class="inline-flex px-2 py-1 rounded-full text-xs font-medium" :class="getStatusClass(record?.status || '')">{{ record?.status }}</span>
            <p v-if="record?.status === '已拒绝' && record?.rejectReason" class="text-xs text-red-600 mt-1">拒绝原因：{{ record.rejectReason }}</p>
          </span>
        </div>
      </div>
      <div class="mt-4">
        <h4 class="font-medium mb-2 text-sm text-gray-700">物料明细</h4>
        <div class="overflow-x-auto rounded-lg border border-gray-200">
          <table class="w-full text-xs">
            <thead class="bg-[#F2F6FA]">
              <tr>
                <th class="px-3 py-2 text-left text-sm font-semibold text-blue-800">物料编码</th>
                <th class="px-3 py-2 text-left text-sm font-semibold text-blue-800">物料名称</th>
                <th class="px-3 py-2 text-left text-sm font-semibold text-blue-800">规格</th>
                <th class="px-3 py-2 text-left text-sm font-semibold text-blue-800">单位</th>
                <th class="px-3 py-2 text-left text-sm font-semibold text-blue-800">申领数量</th>
                <th class="px-3 py-2 text-left text-sm font-semibold text-blue-800">当前库存</th>
                <th class="px-3 py-2 text-left text-sm font-semibold text-blue-800">单价(元)</th>
                <th class="px-3 py-2 text-left text-sm font-semibold text-blue-800">小计(元)</th>
                <th class="px-3 py-2 text-left text-sm font-semibold text-blue-800">仓库货位</th>
                <th class="px-3 py-2 text-left text-sm font-semibold text-blue-800">备注</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="m in (record?.materials || [])" :key="m.materialCode" class="hover:bg-emerald-100">
                <td class="px-3 py-2 text-sm text-blue-700 font-mono">{{ m.materialCode }}</td>
                <td class="px-3 py-2 text-sm text-blue-700">{{ m.materialName }}</td>
                <td class="px-3 py-2 text-sm text-blue-700">{{ m.spec }}</td>
                <td class="px-3 py-2 text-sm text-blue-700">{{ m.unit }}</td>
                <td class="px-3 py-2 text-sm" :class="m.requestedQuantity > m.stockQuantity ? 'text-red-600 font-bold' : 'text-blue-700'">
                  {{ m.requestedQuantity }}{{ m.requestedQuantity > m.stockQuantity ? ' (!)' : '' }}
                </td>
                <td class="px-3 py-2 text-sm text-blue-700">{{ m.stockQuantity }}</td>
                <td class="px-3 py-2 text-sm text-blue-700">{{ (m.unitPrice || 0).toFixed(2) }}</td>
                <td class="px-3 py-2 text-sm text-blue-700">{{ (m.requestedQuantity * (m.unitPrice || 0)).toFixed(2) }}</td>
                <td class="px-3 py-2 text-sm text-blue-700">{{ m.warehousePosition }}</td>
                <td class="px-3 py-2 text-sm text-blue-700">{{ m.remark || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <template #footer>
      <el-button size="small" @click="$emit('close')">关闭</el-button>
    </template>
  </ElModal>
</template>

<script setup>
import { ElModal } from '@/components/ui'
import { computed } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  record: { type: Object, default: null }
})

defineEmits(['close'])

const infoList = computed(() => props.record ? [
  { l: '领料单号', v: props.record.code },
  { l: '申请日期', v: props.record.date },
  { l: '申请人', v: props.record.applicant },
  { l: '部门', v: props.record.department },
  { l: '库存地点', v: props.record.warehouseLocation },
  { l: '物料种类', v: props.record.materials?.length > 0 ? props.record.materials.length + '种' : '-' },
  { l: '种植区域/用途', v: props.record.plantArea },
  { l: '审核人', v: props.record.reviewer },
  { l: '生产计划批次号', v: props.record.productionBatchCode }
] : [])

const getStatusClass = (status) => {
  const map = {
    '待审批': 'bg-amber-100 text-amber-700',
    '已审批': 'bg-green-100 text-green-700',
    '已拒绝': 'bg-red-100 text-red-700',
    '已作废': 'bg-gray-100 text-gray-700',
    '已取消': 'bg-gray-100 text-gray-500'
  }
  return map[status] || 'bg-gray-100 text-gray-700'
}
</script>
