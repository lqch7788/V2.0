<!--
  新增品种弹窗
  对标 V1.1 src/components/farm/crop-variety/modals/AddCropVarietyModal.tsx
-->
<template>
  <el-dialog
    :model-value="modelValue"
    title="新增品种"
    width="640px"
    v-dialog-draggable
    @update:model-value="(v) => $emit('update:modelValue', v)"
  >
    <el-form :model="form" label-width="100px">
      <el-form-item label="编码" required>
        <el-input v-model="form.code" placeholder="例如：TOM001" />
      </el-form-item>
      <el-form-item label="名称" required>
        <el-input v-model="form.name" placeholder="品种名" />
      </el-form-item>
      <el-form-item label="类别" required>
        <el-select v-model="form.category" class="w-full" placeholder="请选择">
          <el-option v-for="c in categories" :key="c" :value="c" :label="c" />
        </el-select>
      </el-form-item>
      <el-form-item label="生长周期">
        <el-input-number v-model="form.growthPeriod" :min="1" :max="365" class="w-full" />
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

const categories = ['蔬菜', '水果', '粮食', '经济作物']

const form = reactive({
  code: '',
  name: '',
  category: '',
  growthPeriod: 90,
})

const handleSubmit = () => {
  if (!form.code || !form.name || !form.category) {
    ElMessage.warning('请填写完整信息')
    return
  }
  emit('submit', { ...form })
  emit('update:modelValue', false)
}
</script>