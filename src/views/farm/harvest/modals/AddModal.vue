<!--
  采收新增弹窗
  对标 V1.1 src/components/farm/harvest/modals/AddModal.tsx
-->
<template>
  <el-dialog v-model="visible" title="新增采收记录" width="640px" v-dialog-draggable @close="$emit('update:modelValue', false)">
    <el-form :model="form" label-width="100px">
      <el-form-item label="品种" required>
        <el-select v-model="form.varietyId" placeholder="选择品种" class="w-full">
          <el-option v-for="v in varieties" :key="v.id" :label="v.name" :value="v.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="温室">
        <el-select v-model="form.greenhouseId" placeholder="选择温室" clearable class="w-full">
          <el-option v-for="g in greenhouses" :key="g.id" :label="g.name" :value="g.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="采收人" required>
        <el-select v-model="form.harvesterId" filterable placeholder="选择采收人" class="w-full">
          <el-option v-for="w in workers" :key="w.id" :label="w.name" :value="w.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="采收日期" required>
        <el-date-picker v-model="form.harvestDate" type="date" value-format="YYYY-MM-DD" class="w-full" />
      </el-form-item>
      <el-form-item label="采收量(kg)" required>
        <el-input-number v-model="form.yield" :min="0" :precision="2" class="w-full" />
      </el-form-item>
      <el-form-item label="合格量(kg)">
        <el-input-number v-model="form.qualifiedYield" :min="0" :precision="2" class="w-full" />
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="form.remark" type="textarea" :rows="2" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="$emit('submit', form)">提交</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, reactive } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  varieties: { type: Array, default: () => [] },
  greenhouses: { type: Array, default: () => [] },
  workers: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'submit'])

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const form = reactive({
  varietyId: '',
  greenhouseId: '',
  harvesterId: '',
  harvestDate: '',
  yield: 0,
  qualifiedYield: 0,
  remark: '',
})
</script>