<!--
  ScheduleSwapRequestModal.vue - 调班申请弹窗
  V1.1 SwapRequestModal.tsx L75-172 1:1 对齐：6 字段完整表单 + 深度输入框
  从 Schedule.vue 提取
-->
<template>
  <el-dialog :model-value="isOpen" @update:model-value="(v) => !v && emit('close')" title="调班申请" width="500px">
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-600 mb-1">申请人</label>
        <el-select
          :model-value="swapForm.requesterId"
          @update:model-value="(v) => updateField('requesterId', v)"
          placeholder="选择申请人"
          class="w-full"
          @change="emit('requesterChange')"
        >
          <el-option v-for="staff in staffList" :key="staff.id" :label="`${staff.name} - ${staff.workZone || ''}`" :value="staff.id" />
        </el-select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-600 mb-1">原排班日期</label>
        <el-date-picker
          :model-value="swapForm.originalDate"
          @update:model-value="(v) => updateField('originalDate', v)"
          type="date"
          class="w-full"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          placeholder="选择原排班日期"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-600 mb-1">调班对象</label>
        <el-select
          :model-value="swapForm.targetId"
          @update:model-value="(v) => updateField('targetId', v)"
          placeholder="选择调班对象"
          class="w-full"
          @change="emit('targetChange')"
        >
          <el-option
            v-for="staff in availableTargets"
            :key="staff.id"
            :label="`${staff.name} - ${staff.workZone || ''}`"
            :value="staff.id"
          />
        </el-select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-600 mb-1">目标日期</label>
        <el-date-picker
          :model-value="swapForm.targetDate"
          @update:model-value="(v) => updateField('targetDate', v)"
          type="date"
          class="w-full"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          placeholder="选择目标日期"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-600 mb-1">调班原因</label>
        <el-input
          :model-value="swapForm.reason"
          @update:model-value="(v) => updateField('reason', v)"
          type="textarea"
          :rows="3"
          placeholder="请输入调班原因..."
        />
      </div>
    </div>
    <template #footer>
      <el-button @click="emit('close')">取消</el-button>
      <el-button type="primary" @click="emit('submit')">
        <el-icon><Promotion /></el-icon>提交申请
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'
import { Promotion } from '@element-plus/icons-vue'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  swapForm: { type: Object, required: true },
  staffList: { type: Array, default: () => [] },
})

const emit = defineEmits(['close', 'submit', 'updateForm', 'requesterChange', 'targetChange'])

const availableTargets = computed(() =>
  props.staffList.filter(s => s.id !== props.swapForm.requesterId)
)

function updateField(field, value) {
  emit('updateForm', { ...props.swapForm, [field]: value })
}
</script>
