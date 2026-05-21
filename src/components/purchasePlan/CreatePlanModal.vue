<template>
  <el-dialog
    :model-value="visible"
    title="新增采购计划"
    width="900px"
    @close="handleClose"
  >
    <el-form :model="createForm" label-width="120px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="计划编号">
            <el-input v-model="createForm.purchaseApplicationCode" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="关联批次号">
            <el-input v-model="createForm.relatedBatchCode" placeholder="请输入关联批次号" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="采购类型">
            <el-select v-model="createForm.purchaseType" style="width: 100%">
              <el-option label="生产物资采购" value="生产物资采购" />
              <el-option label="紧急采购" value="紧急采购" />
              <el-option label="常规采购" value="常规采购" />
              <el-option label="劳保用品" value="劳保用品" />
              <el-option label="通用物资" value="通用物资" />
              <el-option label="设备采购" value="设备采购" />
              <el-option label="其他" value="其他" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="申请人">
            <el-input v-model="createForm.applicant" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="申请部门">
            <el-input v-model="createForm.applicantDepartment" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="申请日期">
            <el-date-picker
              v-model="createForm.applyDate"
              type="date"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="交货日期">
            <el-date-picker
              v-model="createForm.requiredDate"
              type="date"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="优先级">
            <el-select v-model="createForm.priority" style="width: 100%">
              <el-option label="紧急" value="紧急" />
              <el-option label="高" value="高" />
              <el-option label="中" value="中" />
              <el-option label="低" value="低" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="备注">
        <el-input v-model="createForm.remark" type="textarea" :rows="3" />
      </el-form-item>

      <!-- 物料明细 -->
      <el-form-item label="物料明细">
        <div class="w-full">
          <el-button type="primary" size="small" @click="handleAddItem">
            <el-icon><Plus /></el-icon>
            添加物料
          </el-button>

          <el-table :data="localItems" stripe class="mt-3">
            <el-table-column prop="materialName" label="物料名称" width="150">
              <template #default="{ row }">
                <el-input v-model="row.materialName" size="small" />
              </template>
            </el-table-column>
            <el-table-column prop="specification" label="规格" width="120">
              <template #default="{ row }">
                <el-input v-model="row.specification" size="small" />
              </template>
            </el-table-column>
            <el-table-column prop="unit" label="单位" width="80">
              <template #default="{ row }">
                <el-input v-model="row.unit" size="small" />
              </template>
            </el-table-column>
            <el-table-column prop="quantity" label="数量" width="100">
              <template #default="{ row }">
                <el-input-number v-model="row.quantity" :min="0" size="small" />
              </template>
            </el-table-column>
            <el-table-column prop="estimatedUnitPrice" label="预估单价" width="100">
              <template #default="{ row }">
                <el-input-number v-model="row.estimatedUnitPrice" :min="0" :precision="2" size="small" />
              </template>
            </el-table-column>
            <el-table-column prop="estimatedTotalPrice" label="预估总价" width="100">
              <template #default="{ row }">
                {{ ((row.quantity || 0) * (row.estimatedUnitPrice || 0)).toFixed(2) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80">
              <template #default="{ $index }">
                <el-button link type="danger" size="small" @click="handleRemoveItem($index)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit">提交</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import {  PurchasePlanItem  } from '@/types/purchase'

const props = defineProps({})

const emit = defineEmits(['close', 'value'])

const localItems = ref([...props.createItems])

watch(() => props.createItems, (newItems) => {
  localItems.value = [...newItems]
}, { deep: true })

watch(localItems, (newItems) => {
  emit('itemsChange', newItems)
}, { deep: true })

const handleAddItem = () => {
  localItems.value.push({
    materialName: '',
    specification: '',
    unit: '',
    quantity,
    estimatedUnitPrice,
    estimatedTotalPrice: 0
  })
}

const handleRemoveItem = (index) => {
  localItems.value.splice(index, 1)
}

const handleClose = () => {
  emit('close')
}

const handleSubmit = () => {
  emit('submit')
}
</script>
