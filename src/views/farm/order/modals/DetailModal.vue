<!--
  订单详情弹窗
  对标 V1.1 src/components/farm/order/modals/DetailModal.tsx
-->
<template>
  <el-dialog v-model="visible" title="订单详情" width="720px" v-dialog-draggable @close="$emit('update:modelValue', false)">
    <el-descriptions v-if="record" :column="2" border>
      <el-descriptions-item label="订单号">{{ record.code }}</el-descriptions-item>
      <el-descriptions-item label="客户">{{ record.customerName }}</el-descriptions-item>
      <el-descriptions-item label="品种">{{ record.varietyName }}</el-descriptions-item>
      <el-descriptions-item label="数量">{{ record.quantity }} kg</el-descriptions-item>
      <el-descriptions-item label="单价">¥{{ record.unitPrice }}</el-descriptions-item>
      <el-descriptions-item label="总金额">¥{{ record.totalAmount }}</el-descriptions-item>
      <el-descriptions-item label="下单时间">{{ record.orderTime }}</el-descriptions-item>
      <el-descriptions-item label="交付时间">{{ record.deliveryTime }}</el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag :type="statusTagType(record.status)" size="small">{{ statusText(record.status) }}</el-tag>
      </el-descriptions-item>
    </el-descriptions>
    <template #footer>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  record: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue'])

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const STATUS_MAP = {
  pending: { tag: 'warning', text: '待处理' },
  confirmed: { tag: 'primary', text: '已确认' },
  producing: { tag: 'info', text: '生产中' },
  delivered: { tag: 'success', text: '已交付' },
  cancelled: { tag: 'info', text: '已取消' },
}
const statusTagType = (s) => STATUS_MAP[s]?.tag || ''
const statusText = (s) => STATUS_MAP[s]?.text || s
</script>