<template>
  <!-- 第二阶段 Y3 重构：复用 ElModal 弹窗外壳 -->
  <ElModal
    :model-value="visible"
    @update:model-value="(v) => emit('update:visible', v)"
    title="编辑订单"
    :width="784"
    :height="630"
    @close="handleClose"
  >
    <div class="p-2">
    <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="订单编号">
            <el-input v-model="form.orderCode" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="订单名称" prop="orderName">
            <el-input v-model="form.orderName" placeholder="请输入订单名称" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="订单类型" prop="orderType">
            <el-select v-model="form.orderType" placeholder="请选择订单类型" style="width: 100%">
              <el-option
                v-for="option in orderTypeOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="作物名称" prop="cropName">
            <el-input v-model="form.cropName" placeholder="请输入作物名称" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="计划数量" prop="plannedQuantity">
            <el-input-number v-model="form.plannedQuantity" :min="0" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="实际数量">
            <el-input-number v-model="form.actualQuantity" :min="0" style="width: 100%" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="单位" prop="unit">
            <el-input v-model="form.unit" placeholder="请输入单位" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="订单日期" prop="orderDate">
            <el-date-picker
              v-model="form.orderDate"
              type="date"
              placeholder="请选择订单日期"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="预计采收日期">
            <el-date-picker
              v-model="form.expectedHarvestDate"
              type="date"
              placeholder="请选择预计采收日期"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态">
            <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%">
              <el-option value="planned" label="已计划" />
              <el-option value="in_progress" label="进行中" />
              <el-option value="completed" label="已完成" />
              <el-option value="cancelled" label="已取消" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="备注">
        <el-input v-model="form.remarks" type="textarea" :rows="3" placeholder="请输入备注" />
      </el-form-item>
    </el-form>
    </div>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitting">保存</el-button>
    </template>
  </ElModal>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { ElModal } from '@/components/ui'
import { } from 'element-plus'
import { useOrderDataStore } from '@/stores/modules/orderData'
import {  CropOrder  } from '@/types/crop'

const props = defineProps({})

const emit = defineEmits(['close', 'update:visible'])

const orderDataStore = useOrderDataStore()
const formRef = ref()
const submitting = ref(false)

const form = reactive({
  orderCode: '',
  orderName: '',
  orderType: 'production',
  cropName: '',
  cropCategory: '',
  cropVariety: '',
  plannedQuantity: 0,
  actualQuantity: 0,
  unit: 'kg',
  orderDate: '',
  expectedHarvestDate: '',
  remarks: '',
  status: 'planned',
  createBy: '',
  createTime: ''
})

const rules = {
  orderName: [{ required: true, message: '请输入订单名称', trigger: 'blur' }],
  orderType: [{ required: true, message: '请选择订单类型', trigger: 'change' }],
  cropName: [{ required: true, message: '请输入作物名称', trigger: 'blur' }],
  plannedQuantity: [{ required: true, message: '请输入计划数量', trigger: 'blur' }],
  unit: [{ required: true, message: '请输入单位', trigger: 'blur' }],
  orderDate: [{ required: true, message: '请选择订单日期', trigger: 'change' }]
}

watch(() => props.visible, (val) => {
  if (val && props.record) {
    // 填充表单数据
    Object.assign(form, props.record)
  }
})

const handleClose = () => {
  emit('close')
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true

    if (props.record) {
      await orderDataStore.updateOrder(props.record.id, form)
      ElMessage.success('保存成功')
      emit('success')
    }
  } catch (error) {
    if (error !== false) {
      ElMessage.error('保存失败，请稍后重试')
    }
  } finally {
    submitting.value = false
  }
}
</script>
