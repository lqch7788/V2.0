<!--
  客户弹窗（新增/编辑）
  对标 V1.1 src/components/farm/customer/CustomerModal.tsx
-->
<template>
  <el-dialog
    :model-value="modelValue"
    :title="customer?.code ? '编辑客户' : '新增客户'"
    width="560px"
    v-dialog-draggable
    @update:model-value="(v) => $emit('update:modelValue', v)"
  >
    <el-form v-if="form" :model="form" label-width="100px">
      <el-form-item label="客户名" required>
        <el-input v-model="form.name" placeholder="例如：北京华联" />
      </el-form-item>
      <el-form-item label="联系人">
        <el-input v-model="form.contact" placeholder="联系人姓名" />
      </el-form-item>
      <el-form-item label="联系电话">
        <el-input v-model="form.phone" placeholder="11位手机号" />
      </el-form-item>
      <el-form-item label="地址">
        <el-input v-model="form.address" placeholder="详细地址" />
      </el-form-item>
      <el-form-item label="客户类型">
        <el-radio-group v-model="form.type">
          <el-radio value="normal">普通</el-radio>
          <el-radio value="vip">VIP</el-radio>
        </el-radio-group>
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
  customer: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue', 'submit'])

const form = reactive({
  code: '',
  name: '',
  contact: '',
  phone: '',
  address: '',
  type: 'normal',
  remark: '',
})

watch(
  () => props.customer,
  (val) => {
    if (val) Object.assign(form, val)
    else Object.assign(form, { code: '', name: '', contact: '', phone: '', address: '', type: 'normal', remark: '' })
  },
  { immediate: true }
)

const handleSubmit = () => {
  if (!form.name) {
    ElMessage.warning('请填写客户名')
    return
  }
  emit('submit', { ...form })
  emit('update:modelValue', false)
}
</script>