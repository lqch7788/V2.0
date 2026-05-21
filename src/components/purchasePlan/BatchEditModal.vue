<template>
  <el-dialog
    :model-value="visible"
    title="批量编辑采购计划"
    width="800px"
    @close="handleClose"
  >
    <div class="space-y-4">
      <div class="bg-blue-50 rounded-lg p-3">
        <p class="text-sm text-blue-800">
          已选择 <strong>{{ selectedRows.length }}</strong> 个采购计划进行编辑
        </p>
      </div>

      <el-form :model="batchEditData" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="采购类型">
              <el-select v-model="batchEditData.purchaseType" style="width: 100%">
                <el-option label="生产物资采购" value="production" />
                <el-option label="紧急采购" value="urgent" />
                <el-option label="常规采购" value="routine" />
                <el-option label="劳保用品" value="safety" />
                <el-option label="通用物资" value="material" />
                <el-option label="设备采购" value="equipment" />
                <el-option label="其他" value="other" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="优先级">
              <el-select v-model="batchEditData.priority" style="width: 100%">
                <el-option label="紧急" value="urgent" />
                <el-option label="高" value="high" />
                <el-option label="中" value="normal" />
                <el-option label="低" value="low" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="交货日期">
              <el-date-picker
                v-model="batchEditData.requiredDate"
                type="date"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="备注">
          <el-input v-model="batchEditData.remark" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import {  PurchasePlan, PurchasePlanItem  } from '@/types/purchase'

defineProps({})

const emit = defineEmits(['close'])

const handleClose = () => {
  emit('close')
}

const handleSubmit = () => {
  emit('submit')
}
</script>
