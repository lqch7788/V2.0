<!--
  新增肥料弹窗
  对标 V1.1 src/components/farm/fertilizer/FertilizerAddModal.tsx
-->
<template>
  <el-dialog :model-value="modelValue" title="新增肥料" width="560px" v-dialog-draggable
    @update:model-value="(v) => $emit('update:modelValue', v)">
    <el-form :model="form" label-width="100px">
      <el-form-item label="名称" required>
        <el-input v-model="form.name" placeholder="例如：尿素" />
      </el-form-item>
      <el-form-item label="类型" required>
        <el-select v-model="form.type" placeholder="请选择" class="w-full">
          <el-option v-for="t in types" :key="t" :label="t" :value="t" />
        </el-select>
      </el-form-item>
      <el-form-item label="N含量(%)">
        <el-input-number v-model="form.nitrogen" :min="0" :max="100" :precision="1" class="w-full" />
      </el-form-item>
      <el-form-item label="P含量(%)">
        <el-input-number v-model="form.phosphorus" :min="0" :max="100" :precision="1" class="w-full" />
      </el-form-item>
      <el-form-item label="K含量(%)">
        <el-input-number v-model="form.potassium" :min="0" :max="100" :precision="1" class="w-full" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="$emit('update:modelValue', false)">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确认新增</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { reactive } from 'vue'
import { ElMessage } from 'element-plus'

defineProps({
  modelValue: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'submit'])

const types = ['氮肥', '磷肥', '钾肥', '复合肥', '微量元素肥', '有机肥']

const form = reactive({
  name: '',
  type: '',
  nitrogen: 0,
  phosphorus: 0,
  potassium: 0,
})

const handleSubmit = () => {
  if (!form.name || !form.type) {
    ElMessage.warning('请填写完整信息')
    return
  }
  emit('submit', { ...form })
  emit('update:modelValue', false)
}
</script>