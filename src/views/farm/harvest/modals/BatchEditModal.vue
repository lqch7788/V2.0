<!--
  采收批量编辑弹窗
  对标 V1.1 src/components/farm/harvest/modals/BatchEditModal.tsx
-->
<template>
  <el-dialog v-model="visible" title="批量编辑采收" width="560px" v-dialog-draggable @close="$emit('update:modelValue', false)">
    <p class="text-sm text-gray-600 mb-3">将对 {{ records?.length || 0 }} 条采收记录执行批量修改</p>
    <el-form :model="form" label-width="100px">
      <el-form-item label="采收人">
        <el-select v-model="form.harvesterId" filterable placeholder="选择采收人" clearable class="w-full">
          <el-option v-for="w in workers" :key="w.id" :label="w.name" :value="w.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-radio-group v-model="form.status">
          <el-radio value="">不修改</el-radio>
          <el-radio value="completed">已完成</el-radio>
          <el-radio value="stored">已入库</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="$emit('confirm', form)">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, reactive } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  records: { type: Array, default: () => [] },
  workers: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const form = reactive({
  harvesterId: '',
  status: '',
})
</script>