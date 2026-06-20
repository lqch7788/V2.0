<!--
  考勤补卡页面
  对标 V1.1 src/pages/Labor/components/AttendanceRepairPage/AttendanceRepairPage.tsx
-->
<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm">
      <h1 class="text-xl font-bold">考勤补卡</h1>
      <div class="flex items-center gap-2">
        <el-input v-model="keyword" placeholder="搜索单号/申请人" clearable class="!w-48">
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <el-select v-model="status" placeholder="状态" clearable class="!w-32">
          <el-option label="待审批" value="pending" />
          <el-option label="已通过" value="approved" />
          <el-option label="已拒绝" value="rejected" />
        </el-select>
        <el-button type="primary" @click="$emit('add')">
          <el-icon><Plus /></el-icon>补卡申请
        </el-button>
      </div>
    </div>
    <AttendanceRepairTable :data="data" @view="$emit('view', $event)" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Plus, Search } from '@element-plus/icons-vue'
import AttendanceRepairTable from './AttendanceRepairTable.vue'

defineProps({
  data: { type: Array, default: () => [] },
})

defineEmits(['add', 'view'])

const keyword = ref('')
const status = ref('')
</script>