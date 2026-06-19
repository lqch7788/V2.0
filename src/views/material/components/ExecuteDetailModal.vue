<!--
  出库单详情弹窗 - 从 MaterialReceiving.vue 提取
  原文件 L1188-1201 (~14 行模板)
  V2.0-PM-001 拆分第 2/5 阶段
-->
<template>
  <ElModal
    :model-value="show"
    title="出库单详情"
    :width="700"
    :height="600"
    @update:model-value="(v) => { if (!v) $emit('close') }"
    @close="$emit('close')"
  >
    <div class="p-2">
      <div v-if="record" class="grid grid-cols-2 gap-0 border border-gray-200 rounded-lg overflow-hidden mb-4">
        <template v-for="(item, idx) in infoList" :key="idx">
          <span class="w-28 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 shrink-0 border-r border-gray-200">{{ item.l }}</span>
          <span class="px-3 py-2 text-sm text-gray-900 flex-1">{{ item.v }}</span>
        </template>
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
                <th class="px-3 py-2 text-left text-sm font-semibold text-blue-800">出库数量</th>
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
                <td class="px-3 py-2 text-sm text-blue-700">{{ m.quantity }}</td>
                <td class="px-3 py-2 text-sm text-blue-700">{{ (m.unitPrice || 0).toFixed(2) }}</td>
                <td class="px-3 py-2 text-sm text-blue-700">{{ (m.quantity * (m.unitPrice || 0)).toFixed(2) }}</td>
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
  { l: '出库单号', v: props.record.code },
  { l: '申请日期', v: props.record.date },
  { l: '申请人', v: props.record.applicant },
  { l: '库存地点', v: props.record.warehouseLocation },
  { l: '审核人', v: props.record.reviewer },
  { l: '操作人', v: props.record.operator },
  { l: '生产计划批次号', v: props.record.productionBatchCode },
  { l: '来源申请单', v: (props.record?.sourceApplicationCodes || []).join(', ') }
] : [])
</script>
