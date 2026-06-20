<!--
  小组详情弹窗
  对标 V1.1 src/components/labor/team/TeamDetailModal.tsx
-->
<template>
  <el-dialog v-model="visible" title="小组详情" width="720px" v-dialog-draggable @close="$emit('update:modelValue', false)">
    <div v-if="team" class="space-y-4">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="小组编号">{{ team.code }}</el-descriptions-item>
        <el-descriptions-item label="小组名称">{{ team.name }}</el-descriptions-item>
        <el-descriptions-item label="组长">{{ team.leaderName }}</el-descriptions-item>
        <el-descriptions-item label="人数">{{ team.memberCount }}</el-descriptions-item>
        <el-descriptions-item label="负责区域">{{ team.department }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="team.status === 'active' ? 'success' : 'info'" size="small">
            {{ team.status === 'active' ? '启用' : '停用' }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
      <div v-if="team.members?.length">
        <h4 class="font-semibold mb-2">成员列表</h4>
        <el-table :data="team.members" size="small" border>
          <el-table-column prop="code" label="工号" width="120" />
          <el-table-column prop="name" label="姓名" min-width="100" />
          <el-table-column prop="position" label="岗位" min-width="120" />
          <el-table-column prop="phone" label="电话" width="130" />
        </el-table>
      </div>
    </div>
    <template #footer>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  team: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue'])

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})
</script>