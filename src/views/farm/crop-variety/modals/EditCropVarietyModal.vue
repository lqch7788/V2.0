<!--
  编辑品种弹窗
  对标 V1.1 src/components/farm/crop-variety/modals/EditCropVarietyModal.tsx
-->
<template>
  <el-dialog
    :model-value="modelValue"
    title="编辑品种"
    width="640px"
    v-dialog-draggable
    @update:model-value="(v) => $emit('update:modelValue', v)"
  >
    <el-form v-if="form" :model="form" label-width="100px">
      <el-form-item label="编码" required>
        <el-input v-model="form.code" :disabled="true" />
      </el-form-item>
      <el-form-item label="名称" required>
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="类别" required>
        <el-select v-model="form.category" class="w-full">
          <el-option v-for="c in categories" :key="c" :value="c" :label="c" />
        </el-select>
      </el-form-item>
      <el-form-item label="生长周期">
        <el-input-number v-model="form.growthPeriod" :min="1" :max="365" class="w-full" />
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="form.remark" type="textarea" :rows="2" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="$emit('update:modelValue', false)">取消</el-button>
      <el-button type="primary" @click="handleSubmit">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  variety: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue', 'submit'])

const categories = ['蔬菜', '水果', '粮食', '经济作物']
const form = reactive({ code: '', name: '', category: '', growthPeriod: 90, remark: '' })

watch(
  () => props.variety,
  (val) => {
    if (val) Object.assign(form, val)
  },
  { immediate: true }
)

const handleSubmit = () => {
  if (!form.name || !form.category) {
    ElMessage.warning('请填写完整信息')
    return
  }
  emit('submit', { ...form })
  emit('update:modelValue', false)
}
</script>