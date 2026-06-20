<!--
  班次编辑器
  对标 V1.1 src/components/labor/schedule/ShiftEditor.tsx
-->
<template>
  <div class="bg-white rounded-xl p-4 shadow-sm space-y-3">
    <h3 class="font-semibold flex items-center gap-2">
      <el-icon><Clock /></el-icon>
      班次编辑
    </h3>
    <el-form :model="shift" label-width="100px">
      <el-form-item label="班次类型">
        <el-radio-group v-model="shift.type">
          <el-radio value="morning">早班</el-radio>
          <el-radio value="afternoon">中班</el-radio>
          <el-radio value="night">晚班</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="开始时间">
        <el-time-picker v-model="shift.startTime" value-format="HH:mm:ss" class="w-full" />
      </el-form-item>
      <el-form-item label="结束时间">
        <el-time-picker v-model="shift.endTime" value-format="HH:mm:ss" class="w-full" />
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="shift.remark" type="textarea" :rows="2" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="$emit('save', shift)">保存</el-button>
        <el-button @click="$emit('cancel')">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { Clock } from '@element-plus/icons-vue'

const shift = reactive({
  type: 'morning',
  startTime: '08:00:00',
  endTime: '16:00:00',
  remark: '',
})

defineEmits(['save', 'cancel'])
</script>