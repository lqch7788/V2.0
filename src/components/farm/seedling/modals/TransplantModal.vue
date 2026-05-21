<template>
  <el-dialog
    :model-value="visible"
    title="定植操作"
    width="600px"
    @close="handleClose"
  >
    <div v-if="record" class="space-y-4">
      <el-alert type="info" :closable="false">
        <template #title>
          <span>当前剩余数量: <strong>{{ remainingCount }}</strong> 株</span>
        </template>
      </el-alert>

      <el-form :model="form" label-width="100px" ref="formRef">
        <el-form-item label="定植日期" required>
          <el-date-picker
            v-model="form.transplantDate"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
            class="w-full"
          />
        </el-form-item>
        <el-form-item label="定植场地" required>
          <el-select v-model="form.areaName" placeholder="请选择" class="w-full">
            <el-option v-for="item in areas" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="定植数量" required>
          <el-input-number v-model="form.transplantCount" :min="1" :max="remainingCount" class="w-full" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remarks" type="textarea" :rows="3" placeholder="请输入" />
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitting">确定定植</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {  Seedling  } from '@/types/crop'

const props = defineProps({})

const emit = defineEmits(['(e', 'value'])

const formRef = ref()
const submitting = ref(false)
const form = ref({
  transplantDate: new Date().toISOString().slice(0, 10),
  areaName: '',
  transplantCount,
  remarks: ''
})

const areas = ['1号大棚-A区', '1号大棚-B区', '2号大棚-A区', '2号大棚-B区', '3号大棚', '露天地块1', '露天地块2']

const remainingCount = computed(() => {
  if (!props.record) return 0
  return props.record.initialCount - props.record.lossCount - props.record.plantedCount
})

const handleClose = () => {
  emit('update:visible', false)
}

const handleSubmit = async () => {
  if (!form.value.transplantDate || !form.value.areaName || !form.value.transplantCount) {
    ElMessage.warning('请填写必填项')
    return
  }

  if (form.value.transplantCount > remainingCount.value) {
    ElMessage.warning('定植数量不能超过剩余数量')
    return
  }

  submitting.value = true
  try {
    // 模拟定植操作
    ElMessage.success('定植成功')
    emit('success')
    handleClose()
  } catch {
    ElMessage.error('定植失败')
  } finally {
    submitting.value = false
  }
}
</script>
