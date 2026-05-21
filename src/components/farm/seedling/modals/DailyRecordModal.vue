<template>
  <el-dialog
    :model-value="visible"
    title="每日记录"
    width="600px"
    @close="handleClose"
  >
    <el-form :model="form" label-width="100px" ref="formRef">
      <el-form-item label="记录日期" required>
        <el-date-picker
          v-model="form.recordDate"
          type="date"
          placeholder="选择日期"
          value-format="YYYY-MM-DD"
          class="w-full"
        />
      </el-form-item>
      <el-form-item label="温度(℃)">
        <el-input-number v-model="form.temperature" :min="0" :max="50" :precision="1" class="w-full" />
      </el-form-item>
      <el-form-item label="湿度(%)">
        <el-input-number v-model="form.humidity" :min="0" :max="100" :precision="1" class="w-full" />
      </el-form-item>
      <el-form-item label="是否浇水">
        <el-switch v-model="form.watering" />
      </el-form-item>
      <el-form-item label="成活变化">
        <el-input-number v-model="form.survivalCountChange" :min="-1000" :max="1000" class="w-full" />
      </el-form-item>
      <el-form-item label="定植变化">
        <el-input-number v-model="form.plantedCountChange" :min="-1000" :max="1000" class="w-full" />
      </el-form-item>
      <el-form-item label="损耗变化">
        <el-input-number v-model="form.lossCountChange" :min="-1000" :max="1000" class="w-full" />
      </el-form-item>
      <el-form-item label="pH值">
        <el-input-number v-model="form.phValue" :min="0" :max="14" :precision="2" class="w-full" />
      </el-form-item>
      <el-form-item label="EC值">
        <el-input-number v-model="form.ecValue" :min="0" :precision="2" class="w-full" />
      </el-form-item>
      <el-form-item label="异常情况">
        <el-input v-model="form.abnormality" type="textarea" :rows="2" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="form.remarks" type="textarea" :rows="2" placeholder="请输入" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({})

const emit = defineEmits(['update:visible', 'success'])

const formRef = ref()
const submitting = ref(false)
const form = ref({
  recordDate: new Date().toISOString().slice(0, 10),
  temperature,
  humidity,
  watering,
  survivalCountChange,
  plantedCountChange,
  lossCountChange,
  phValue,
  ecValue,
  abnormality: '',
  remarks: '',
  operator: '管理员'
})

const handleClose = () => {
  emit('update:visible', false)
}

const handleSubmit = async () => {
  if (!form.value.recordDate) {
    ElMessage.warning('请选择记录日期')
    return
  }

  submitting.value = true
  try {
    // 模拟添加每日记录
    if (props.record) {
      ElMessage.success('记录成功')
      emit('success')
    }
    handleClose()
  } catch {
    ElMessage.error('记录失败')
  } finally {
    submitting.value = false
  }
}
</script>
