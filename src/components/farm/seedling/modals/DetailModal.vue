<!--
  育苗详情弹窗（完全重写 - 1:1 对齐 V1.1 DetailModal.tsx）
-->
<template>
  <SimpleModal
    :visible="visible"
    :title="`育苗详情 - ${record?.seedlingCode || ''}`"
    width="900px"
    submit-text="关闭"
    @close="$emit('close')"
    @submit="$emit('close')"
  >
    <div class="grid grid-cols-2 gap-4 text-sm">
      <div><span class="text-gray-500">育苗批号：</span><span class="font-medium">{{ record?.seedlingCode }}</span></div>
      <div><span class="text-gray-500">繁殖模式：</span><span class="font-medium">{{ record?.propagationMode === 'one_to_many' ? '1:多' : '1:1' }}</span></div>
      <div><span class="text-gray-500">关联生产计划：</span><span class="font-medium">{{ record?.productionPlanCode || '-' }}</span></div>
      <div><span class="text-gray-500">关联种源：</span><span class="font-medium">{{ record?.sourceCode || '-' }}</span></div>
      <div><span class="text-gray-500">作物编码：</span><span class="font-medium font-mono text-orange-600">{{ record?.cropCode || '-' }}</span></div>
      <div><span class="text-gray-500">作物名称：</span><span class="font-medium">{{ record?.cropName || '-' }}</span></div>
      <div><span class="text-gray-500">作物品种：</span><span class="font-medium">{{ record?.cropVariety || '-' }}</span></div>
      <div><span class="text-gray-500">育苗区域：</span><span class="font-medium">{{ record?.siteName || '-' }}</span></div>
      <div><span class="text-gray-500">开始日期：</span><span class="font-medium">{{ record?.startDate || '-' }}</span></div>
      <div><span class="text-gray-500">预计结束日期：</span><span class="font-medium">{{ record?.expectedEndDate || '-' }}</span></div>
      <div><span class="text-gray-500">实际结束日期：</span><span class="font-medium">{{ record?.endDate || '-' }}</span></div>
      <div><span class="text-gray-500">初始数量：</span><span class="font-medium">{{ record?.initialCount?.toLocaleString() || 0 }}</span></div>
      <div><span class="text-gray-500">成苗数量：</span><span class="font-medium">{{ record?.survivalCount?.toLocaleString() || 0 }}</span></div>
      <div><span class="text-gray-500">成苗率：</span><span class="font-medium">{{ record?.survivalRate }}%</span></div>
      <div><span class="text-gray-500">损耗数量：</span><span class="font-medium text-red-600">{{ record?.lossCount?.toLocaleString() || 0 }}</span></div>
      <div><span class="text-gray-500">损耗率：</span><span class="font-medium">{{ record?.lossRate }}%</span></div>
      <div><span class="text-gray-500">品质等级：</span><span class="font-medium">{{ record?.qualityGrade || '-' }}</span></div>
      <div><span class="text-gray-500">状态：</span><span class="font-medium">{{ statusLabel(record?.status) }}</span></div>
      <div><span class="text-gray-500">创建人：</span><span class="font-medium">{{ record?.createBy || '-' }}</span></div>
      <div><span class="text-gray-500">创建时间：</span><span class="font-medium">{{ record?.createTime || '-' }}</span></div>
      <div><span class="text-gray-500">备注：</span><span class="font-medium">{{ record?.remarks || '-' }}</span></div>
    </div>
  </SimpleModal>
</template>

<script setup>
import SimpleModal from '@/components/common/SimpleModal.vue'

defineProps({ visible: Boolean, record: Object })
defineEmits(['close'])

const statusLabel = (status) => ({
  sown: '已播种', in_progress: '生长中', transplant_ready: '待出圃',
  completed: '已出圃', cancelled: '已取消', abnormal: '异常结束'
}[status] || '未知')
</script>
