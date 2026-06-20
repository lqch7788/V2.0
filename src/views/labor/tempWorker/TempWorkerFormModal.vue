<!--
  临时工表单弹窗
  对标 V1.1 src/components/labor/tempWorker/TempWorkerFormModal.tsx
-->
<template>
  <el-dialog v-model="visible" :title="worker ? '编辑临时工' : '新增临时工'" width="560px" v-dialog-draggable @close="$emit('update:modelValue', false)">
    <el-form :model="form" label-width="100px">
      <el-form-item label="姓名" required>
        <el-input v-model="form.name" placeholder="请输入姓名" />
      </el-form-item>
      <el-form-item label="电话" required>
        <el-input v-model="form.phone" placeholder="11位手机号" maxlength="11" />
      </el-form-item>
      <el-form-item label="来源">
        <el-select v-model="form.source" placeholder="请选择" class="w-full">
          <el-option label="中介推荐" value="中介" />
          <el-option label="内部推荐" value="内部" />
          <el-option label="自主应聘" value="自主" />
        </el-select>
      </el-form-item>
      <el-form-item label="日薪(元)" required>
        <el-input-number v-model="form.dailyRate" :min="0" :precision="2" :step="10" class="w-full" />
      </el-form-item>
      <el-form-item label="身份证号">
        <el-input v-model="form.idCard" placeholder="身份证号" maxlength="18" />
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
import { computed, reactive, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  worker: { type: Object, default: null },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'submit'])

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const form = reactive({
  name: '',
  phone: '',
  source: '自主',
  dailyRate: 0,
  idCard: '',
  remark: '',
})

watch(
  () => props.worker,
  (val) => {
    if (val) Object.assign(form, val)
  },
  { immediate: true }
)
</script>