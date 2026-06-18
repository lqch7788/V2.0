<!--
  ScheduleAddModal.vue - 新增排班弹窗
  V1.1 ScheduleAddModal.tsx 1:1 对齐：4 字段（员工/日期/班次/工作区域）
-->
<template>
  <el-dialog :model-value="isOpen" @update:model-value="(v) => !v && emit('close')" title="新增排班" width="500px">
    <el-form :model="newSchedule" label-width="80px">
      <el-form-item label="员工">
        <el-select :model-value="newSchedule.staffId" @update:model-value="(v) => updateField('staffId', v)" placeholder="选择员工" class="w-full">
          <el-option v-for="staff in staffList" :key="staff.id" :label="staff.name" :value="staff.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="日期">
        <el-date-picker :model-value="newSchedule.date" @update:model-value="(v) => updateField('date', v)" type="date" placeholder="选择日期" class="w-full" format="YYYY-MM-DD" value-format="YYYY-MM-DD" />
      </el-form-item>
      <el-form-item label="班次">
        <el-select :model-value="newSchedule.shift" @update:model-value="(v) => updateField('shift', v)" placeholder="选择班次" class="w-full">
          <el-option v-for="config in shiftConfigs" :key="config.name" :label="config.name" :value="config.name" />
        </el-select>
      </el-form-item>
      <el-form-item label="工作区域">
        <el-input :model-value="newSchedule.workZone" @update:model-value="(v) => updateField('workZone', v)" placeholder="输入工作区域" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="emit('close')">取消</el-button>
      <el-button type="primary" @click="emit('submit')">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
const props = defineProps({
  isOpen: { type: Boolean, default: false },
  newSchedule: { type: Object, required: true },
  staffList: { type: Array, default: () => [] },
  shiftConfigs: { type: Array, default: () => [] },
})

const emit = defineEmits(['close', 'submit', 'updateForm'])

function updateField(field, value) {
  emit('updateForm', { ...props.newSchedule, [field]: value })
}
</script>
