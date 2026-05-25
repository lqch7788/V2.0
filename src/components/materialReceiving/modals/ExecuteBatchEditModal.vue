<template>
  <el-dialog
    v-model="visible"
    title="批量编辑领料出库记录"
    width="1200px"
    @close="handleClose"
  >
    <!-- 提示信息 -->
    <div class="bg-blue-50 rounded-lg p-4 mb-4">
      <p class="text-sm text-blue-800">
        已选择 <strong>{{ selectedRows.length }}</strong> 条领料出库记录进行批量编辑，已编辑 <strong>{{ editedCount }}</strong> 条
      </p>
    </div>

    <!-- 领料单选择下拉 -->
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-900 mb-1">选择领料单</label>
      <el-select
        v-model="currentRecordId"
        placeholder="请选择领料单"
        @change="handleRecordChange"
      >
        <el-option
          v-for="record in recordsList"
          :key="record.id"
          :label="`${record.code} (${record.applicant})${batchEditedRecords[record.id] ? '✅ 已编辑' : ''}`"
          :value="record.id"
        />
      </el-select>
    </div>

    <!-- 编辑表单 -->
    <div class="grid grid-cols-3 gap-4 mb-4">
      <div>
        <label class="block text-xs font-medium text-gray-900 mb-1">日期</label>
        <el-date-picker
          v-model="currentEditedData.date"
          type="date"
          placeholder="选择日期"
          value-format="YYYY-MM-DD"
          style="width: 100%"
          @change="(val) => handleFieldChange('date', val)"
        />
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-900 mb-1">仓库地点</label>
        <el-select v-model="currentEditedData.warehouseLocation" @change="(val) => handleFieldChange('warehouseLocation', val)">
          <el-option label="请选择" value="" />
          <el-option v-for="w in warehouseOptions" :key="w" :label="w" :value="w" />
        </el-select>
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-900 mb-1">操作人</label>
        <el-input v-model="currentEditedData.operator" @input="(val) => handleFieldChange('operator', val)" />
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-900 mb-1">审核人</label>
        <el-input v-model="currentEditedData.reviewer" @input="(val) => handleFieldChange('reviewer', val)" />
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-900 mb-1">状态</label>
        <el-select v-model="currentEditedData.status" @change="(val) => handleFieldChange('status', val)">
          <el-option label="请选择" value="" />
          <el-option v-for="s in statusOptions" :key="s" :label="s" :value="s" />
        </el-select>
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-900 mb-1">生产批次号</label>
        <el-input v-model="currentEditedData.productionBatchCode" @input="(val) => handleFieldChange('productionBatchCode', val)" />
      </div>
    </div>

    <!-- 物料明细表格 -->
    <div class="mt-6">
      <h4 class="text-sm font-bold text-gray-700 mb-2">物料明细</h4>
      <el-table :data="currentEditedData.materials || []" border stripe style="width: 100%">
        <el-table-column label="操作" width="60">
          <template #default="{ $index }">
            <el-button text type="danger" size="small" @click="handleMaterialDelete($index)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </template>
        </el-table-column>
        <el-table-column prop="materialCode" label="物料编码" min-width="120">
          <template #default="{ row, $index }">
            <el-input v-model="row.materialCode" size="small" @input="(val) => handleMaterialChange($index, 'materialCode', val)" />
          </template>
        </el-table-column>
        <el-table-column prop="materialName" label="物料名称" min-width="120">
          <template #default="{ row, $index }">
            <el-input v-model="row.materialName" size="small" @input="(val) => handleMaterialChange($index, 'materialName', val)" />
          </template>
        </el-table-column>
        <el-table-column prop="spec" label="规格" min-width="80">
          <template #default="{ row, $index }">
            <el-input v-model="row.spec" size="small" @input="(val) => handleMaterialChange($index, 'spec', val)" />
          </template>
        </el-table-column>
        <el-table-column prop="unit" label="单位" width="70">
          <template #default="{ row, $index }">
            <el-input v-model="row.unit" size="small" @input="(val) => handleMaterialChange($index, 'unit', val)" />
          </template>
        </el-table-column>
        <el-table-column label="申请数量" width="100">
          <template #default="{ row, $index }">
            <el-input-number v-model="row.requestedQuantity" size="small" :min="0" controls-position="right" @change="(val) => handleMaterialChange($index, 'requestedQuantity', val)" />
          </template>
        </el-table-column>
        <el-table-column label="实发数量" width="100">
          <template #default="{ row, $index }">
            <el-input-number v-model="row.actualQuantity" size="small" :min="0" controls-position="right" @change="(val) => handleMaterialChange($index, 'actualQuantity', val)" />
          </template>
        </el-table-column>
        <el-table-column prop="warehousePosition" label="仓库货位" min-width="100">
          <template #default="{ row, $index }">
            <el-input v-model="row.warehousePosition" size="small" @input="(val) => handleMaterialChange($index, 'warehousePosition', val)" />
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="100">
          <template #default="{ row, $index }">
            <el-input v-model="row.remark" size="small" @input="(val) => handleMaterialChange($index, 'remark', val)" />
          </template>
        </el-table-column>
      </el-table>
    </div>

    <template #footer>
      <div class="flex justify-end gap-3">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSaveAll">保存全部</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Delete } from '@element-plus/icons-vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  selectedRows: { type: Array, default: () => [] },
  batchEditedRecords: { type: Object, default: () => ({}) },
  currentBatchEditIndex: { type: Number, default: 0 },
  recordsList: { type: Array, default: () => [] }
})

const emit = defineEmits(['close', 'record-change', 'field-change', 'material-change', 'material-delete', 'save-all'])

const visible = computed({
  get: () => props.show,
  set: () => handleClose()
})

const currentRecordId = ref(null)

const warehouseOptions = ['仓库A区', '仓库B区', '仓库C区', '仓库D区', '仓库E区']
const statusOptions = ['待出库', '部分出库', '已出库', '已取消']

const editedCount = computed(() => Object.keys(props.batchEditedRecords).length)

const currentEditedData = computed(() => {
  const record = props.recordsList.find(r => r.id === currentRecordId.value)
  return props.batchEditedRecords[currentRecordId.value] || record || {}
})

watch(() => props.show, (isOpen) => {
  if (isOpen && props.selectedRows.length > 0) {
    currentRecordId.value = props.selectedRows[props.currentBatchEditIndex]
  }
})

watch(() => props.currentBatchEditIndex, (idx) => {
  if (props.selectedRows.length > 0) {
    currentRecordId.value = props.selectedRows[idx]
  }
})

const handleClose = () => emit('close')

const handleRecordChange = (id) => {
  const idx = props.selectedRows.indexOf(id)
  emit('record-change', idx >= 0 ? idx : 0)
}

const handleFieldChange = (field, value) => {
  emit('field-change', currentRecordId.value, field, value)
}

const handleMaterialChange = (index, field, value) => {
  emit('material-change', currentRecordId.value, index, field, value)
}

const handleMaterialDelete = (index) => {
  emit('material-delete', currentRecordId.value, index)
}

const handleSaveAll = () => {
  emit('save-all')
}
</script>
