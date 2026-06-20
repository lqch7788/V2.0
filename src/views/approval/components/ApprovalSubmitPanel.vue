<!--
  审批提交面板组件
  对标 V1.1 src/components/approval/ApprovalSubmitPanel.tsx
  功能：选择审批级别/审批人/提交说明等
-->
<template>
  <div class="bg-white rounded-xl p-6 space-y-4 border border-gray-200">
    <div class="flex items-center gap-2">
      <el-icon :size="20" color="#059669"><EditPen /></el-icon>
      <h3 class="font-semibold text-gray-900">提交审批</h3>
    </div>

    <!-- 审批级别 -->
    <div>
      <label class="text-sm text-gray-700 mb-2 block">
        审批级别 <span class="text-red-500">*</span>
      </label>
      <el-radio-group v-model="form.level">
        <el-radio-button
          v-for="opt in levelOptions"
          :key="opt.value"
          :value="opt.value"
        >{{ opt.label }}</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 审批人选择 -->
    <div>
      <label class="text-sm text-gray-700 mb-2 block">
        审批人 <span class="text-red-500">*</span>
      </label>
      <el-select
        v-model="form.approvers"
        multiple
        filterable
        placeholder="请选择审批人（可多选）"
        class="w-full"
      >
        <el-option
          v-for="user in approverCandidates"
          :key="user.id"
          :label="user.name + ' (' + user.department + ')'"
          :value="user.id"
        />
      </el-select>
    </div>

    <!-- 紧急程度 -->
    <div>
      <label class="text-sm text-gray-700 mb-2 block">紧急程度</label>
      <el-radio-group v-model="form.priority">
        <el-radio value="low">低</el-radio>
        <el-radio value="normal">普通</el-radio>
        <el-radio value="high">高</el-radio>
        <el-radio value="urgent">加急</el-radio>
      </el-radio-group>
    </div>

    <!-- 备注 -->
    <div>
      <label class="text-sm text-gray-700 mb-2 block">备注说明</label>
      <el-input
        v-model="form.description"
        type="textarea"
        :rows="3"
        placeholder="请输入补充说明"
        maxlength="500"
        show-word-limit
      />
    </div>

    <!-- 提交按钮 -->
    <div class="flex justify-end gap-2 pt-2">
      <el-button @click="$emit('cancel')">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">
        <el-icon><Promotion /></el-icon>
        提交审批
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { EditPen, Promotion } from '@element-plus/icons-vue'

const props = defineProps({
  approverCandidates: { type: Array, default: () => [] },
  submitting: { type: Boolean, default: false },
  defaultLevel: { type: Number, default: 1 },
})

const emit = defineEmits(['submit', 'cancel'])

const levelOptions = [
  { value: 1, label: '一级' },
  { value: 2, label: '二级' },
  { value: 3, label: '三级' },
  { value: 4, label: '四级' },
  { value: 5, label: '紧急' },
]

const form = reactive({
  level: props.defaultLevel,
  approvers: [],
  priority: 'normal',
  description: '',
})

const handleSubmit = () => {
  emit('submit', { ...form })
}
</script>