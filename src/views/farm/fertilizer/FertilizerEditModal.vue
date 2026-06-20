<!--
  肥料编辑弹窗
  对标 V1.1 src/components/farm/fertilizer/FertilizerEditModal.tsx
-->
<template>
  <el-dialog v-model="visible" :title="fertilizer ? '编辑肥料' : '新增肥料'" width="560px" v-dialog-draggable @close="$emit('update:modelValue', false)">
    <el-form v-if="form" :model="form" label-width="100px">
      <el-form-item label="名称" required>
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="类型" required>
        <el-select v-model="form.type" class="w-full">
          <el-option v-for="t in types" :key="t" :value="t" :label="t" />
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
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="$emit('submit', form)">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, reactive, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  fertilizer: { type: Object, default: null },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'submit'])

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const types = ['氮肥', '磷肥', '钾肥', '复合肥', '微量元素肥', '有机肥']
const form = reactive({ name: '', type: '', nitrogen: 0, phosphorus: 0, potassium: 0 })

watch(
  () => props.fertilizer,
  (val) => {
    if (val) Object.assign(form, val)
  },
  { immediate: true }
)
</script>