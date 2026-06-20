<!--
  种植标记弹窗
  对标 V1.1 src/components/farm/planting/modals/PlantingMarkModal.tsx
-->
<template>
  <el-dialog v-model="visible" title="种植标记" width="560px" v-dialog-draggable @close="$emit('update:modelValue', false)">
    <el-form :model="form" label-width="100px">
      <el-form-item label="地块编号" required>
        <el-input v-model="form.plotCode" placeholder="例如：A-01" />
      </el-form-item>
      <el-form-item label="品种" required>
        <el-select v-model="form.varietyId" placeholder="选择品种" class="w-full">
          <el-option v-for="v in varieties" :key="v.id" :label="v.name" :value="v.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="种植日期" required>
        <el-date-picker v-model="form.plantDate" type="date" value-format="YYYY-MM-DD" class="w-full" />
      </el-form-item>
      <el-form-item label="行距(cm)">
        <el-input-number v-model="form.rowSpacing" :min="0" :precision="1" class="w-full" />
      </el-form-item>
      <el-form-item label="株距(cm)">
        <el-input-number v-model="form.plantSpacing" :min="0" :precision="1" class="w-full" />
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="form.remark" type="textarea" :rows="2" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="$emit('submit', form)">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, reactive } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  varieties: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'submit'])

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const form = reactive({
  plotCode: '',
  varietyId: '',
  plantDate: '',
  rowSpacing: 30,
  plantSpacing: 25,
  remark: '',
})
</script>