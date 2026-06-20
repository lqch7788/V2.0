<!--
  合同续签提醒弹窗
  对标 V1.1 src/components/labor/contract/ContractRemindModal.tsx
-->
<template>
  <el-dialog v-model="visible" title="合同续签提醒" width="640px" v-dialog-draggable @close="$emit('update:modelValue', false)">
    <el-alert type="warning" :closable="false" class="mb-3">
      以下 {{ contracts?.length || 0 }} 个合同将在 30 天内到期，请尽快处理续签
    </el-alert>
    <el-table :data="contracts" size="small" border max-height="400">
      <el-table-column prop="code" label="合同编号" width="140" />
      <el-table-column prop="workerName" label="员工" width="100" />
      <el-table-column prop="endDate" label="到期日" width="120" />
      <el-table-column label="剩余天数" width="100">
        <template #default="{ row }">
          <el-tag :type="getDaysTagType(row.daysLeft)" size="small">{{ row.daysLeft }} 天</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="$emit('renew', row)">续签</el-button>
        </template>
      </el-table-column>
    </el-table>
    <template #footer>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  contracts: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:modelValue', 'renew'])

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const getDaysTagType = (days) => {
  if (days <= 7) return 'danger'
  if (days <= 15) return 'warning'
  return 'info'
}
</script>