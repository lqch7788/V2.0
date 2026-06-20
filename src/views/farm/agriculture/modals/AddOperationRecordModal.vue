<!--
  农事记录添加弹窗
  对标 V1.1 src/components/farm/agriculture/modals/AddOperationRecordModal.tsx
-->
<template>
  <el-dialog v-model="visible" title="新增农事记录" width="640px" v-dialog-draggable @close="$emit('update:modelValue', false)">
    <el-form :model="form" label-width="100px">
      <el-form-item label="操作类型" required>
        <el-select v-model="form.type" placeholder="选择操作" class="w-full">
          <el-option label="种植" value="planting" />
          <el-option label="施肥" value="fertilizer" />
          <el-option label="浇水" value="irrigation" />
          <el-option label="除草" value="weeding" />
          <el-option label="病虫害防治" value="pest" />
        </el-select>
      </el-form-item>
      <el-form-item label="操作日期" required>
        <el-date-picker v-model="form.date" type="date" value-format="YYYY-MM-DD" class="w-full" />
      </el-form-item>
      <el-form-item label="温室">
        <el-select v-model="form.greenhouseId" placeholder="选择温室" clearable class="w-full">
          <el-option v-for="g in greenhouses" :key="g.id" :label="g.name" :value="g.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="操作人" required>
        <el-select v-model="form.operatorId" filterable placeholder="选择操作人" class="w-full">
          <el-option v-for="w in workers" :key="w.id" :label="w.name" :value="w.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="用量">
        <el-input-number v-model="form.amount" :min="0" :precision="2" class="w-full" />
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
  workers: { type: Array, default: () => [] },
  greenhouses: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'submit'])

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const form = reactive({
  type: '',
  date: '',
  greenhouseId: '',
  operatorId: '',
  amount: 0,
  remark: '',
})
</script>