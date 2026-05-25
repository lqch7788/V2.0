<template>
  <el-dialog
    v-model="visible"
    title="编辑领料出库单"
    width="1100px"
    @close="handleClose"
  >
    <!-- 基本信息 -->
    <div class="grid grid-cols-2 gap-4 mb-4">
      <div class="bg-gray-100 rounded-lg p-3">
        <div class="text-xs font-medium text-gray-500 mb-1">领料单号</div>
        <div class="text-sm font-medium text-gray-900">{{ record?.code }}</div>
      </div>
      <div>
        <label class="block text-sm font-medium text-blue-700 mb-1">申请日期</label>
        <el-date-picker
          v-model="localForm.date"
          type="date"
          placeholder="选择日期"
          value-format="YYYY-MM-DD"
          style="width: 100%"
          @change="(val) => handleFormChange('date', val)"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-blue-700 mb-1">申请人</label>
        <el-input
          v-model="localForm.applicant"
          @input="(val) => handleFormChange('applicant', val)"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-blue-700 mb-1">库存地点</label>
        <el-select v-model="localForm.warehouseLocation" @change="(val) => handleFormChange('warehouseLocation', val)">
          <el-option label="仓库A区" value="仓库A区" />
          <el-option label="仓库B区" value="仓库B区" />
          <el-option label="仓库C区" value="仓库C区" />
          <el-option label="仓库D区" value="仓库D区" />
          <el-option label="仓库E区" value="仓库E区" />
        </el-select>
      </div>
      <div>
        <label class="block text-sm font-medium text-blue-700 mb-1">审核人</label>
        <el-input v-model="localForm.reviewer" @input="(val) => handleFormChange('reviewer', val)" />
      </div>
      <div>
        <label class="block text-sm font-medium text-blue-700 mb-1">操作人</label>
        <el-input v-model="localForm.operator" @input="(val) => handleFormChange('operator', val)" />
      </div>
      <div>
        <label class="block text-sm font-medium text-blue-700 mb-1">生产计划批次号</label>
        <el-input v-model="localForm.productionBatchCode" @input="(val) => handleFormChange('productionBatchCode', val)" />
      </div>
      <div>
        <label class="block text-sm font-medium text-blue-700 mb-1">执行状态</label>
        <el-select v-model="localForm.executeStatus" @change="(val) => handleFormChange('executeStatus', val)">
          <el-option label="待出库" value="待出库" />
          <el-option label="部分出库" value="部分出库" />
          <el-option label="已出库" value="已出库" />
          <el-option label="已取消" value="已取消" />
        </el-select>
      </div>
    </div>

    <!-- 物料明细 -->
    <div class="mt-6">
      <div class="flex items-center justify-between mb-2">
        <label class="text-sm font-medium text-gray-700">物料明细</label>
        <el-button size="small" type="primary" @click="$emit('add-material')">
          <el-icon><Plus /></el-icon>
          添加物料
        </el-button>
      </div>
      <el-table v-if="localForm.materials?.length > 0" :data="localForm.materials" border stripe style="width: 100%">
        <el-table-column prop="applicationCode" label="来源领料单号" min-width="140">
          <template #default="{ row }">
            <el-input v-model="row.applicationCode" size="small" readonly class="font-mono" />
          </template>
        </el-table-column>
        <el-table-column prop="materialCode" label="物料编码" min-width="120">
          <template #default="{ row, $index }">
            <el-input v-model="row.materialCode" size="small" @input="(val) => handleMaterialChange($index, 'materialCode', val)" />
          </template>
        </el-table-column>
        <el-table-column prop="materialName" label="物料名称" min-width="100">
          <template #default="{ row, $index }">
            <el-input v-model="row.materialName" size="small" @input="(val) => handleMaterialChange($index, 'materialName', val)" />
          </template>
        </el-table-column>
        <el-table-column prop="spec" label="规格" min-width="80">
          <template #default="{ row, $index }">
            <el-input v-model="row.spec" size="small" @input="(val) => handleMaterialChange($index, 'spec', val)" />
          </template>
        </el-table-column>
        <el-table-column prop="unit" label="单位" width="60">
          <template #default="{ row, $index }">
            <el-input v-model="row.unit" size="small" @input="(val) => handleMaterialChange($index, 'unit', val)" />
          </template>
        </el-table-column>
        <el-table-column label="申请数量" width="90">
          <template #default="{ row, $index }">
            <el-input-number v-model="row.requestedQuantity" size="small" :min="0" controls-position="right" @change="(val) => handleMaterialChange($index, 'requestedQuantity', val)" />
          </template>
        </el-table-column>
        <el-table-column label="实际库存" width="90">
          <template #default="{ row, $index }">
            <el-input-number v-model="row.stockQuantity" size="small" :min="0" controls-position="right" @change="(val) => handleMaterialChange($index, 'stockQuantity', val)" />
          </template>
        </el-table-column>
        <el-table-column label="本次实发" width="90">
          <template #default="{ row, $index }">
            <el-input-number v-model="row.actualQuantity" size="small" :min="0" controls-position="right" @change="(val) => handleMaterialChange($index, 'actualQuantity', val)" />
          </template>
        </el-table-column>
        <el-table-column label="单价(元)" width="90">
          <template #default="{ row, $index }">
            <el-input-number v-model="row.unitPrice" size="small" :min="0" controls-position="right" @change="(val) => handleMaterialChange($index, 'unitPrice', val)" />
          </template>
        </el-table-column>
        <el-table-column label="小计(元)" width="90">
          <template #default="{ row }">
            {{ ((row.requestedQuantity || 0) * (row.unitPrice || 0)).toFixed(2) }}
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
        <el-table-column label="操作" width="60">
          <template #default="{ $index }">
            <el-button text type="danger" size="small" @click="$emit('remove-material', $index)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <template #footer>
      <div class="flex justify-end gap-3">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="$emit('save')">保存</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  record: { type: Object, default: null },
  editForm: {
    type: Object,
    default: () => ({
      date: '',
      applicant: '',
      warehouseLocation: '',
      reviewer: '',
      operator: '',
      productionBatchCode: '',
      executeStatus: '',
      materials: []
    })
  }
})

const emit = defineEmits(['close', 'form-change', 'material-change', 'add-material', 'remove-material', 'save'])

const visible = computed({
  get: () => props.show,
  set: () => handleClose()
})

const localForm = ref({ ...props.editForm })

watch(() => props.show, (isOpen) => {
  if (isOpen) {
    localForm.value = { ...props.editForm }
  }
})

watch(() => props.editForm, (val) => {
  localForm.value = { ...val }
}, { deep: true })

const handleClose = () => emit('close')
const handleCancel = () => emit('close')

const handleFormChange = (field, value) => {
  emit('form-change', field, value)
}

const handleMaterialChange = (index, field, value) => {
  emit('material-change', index, field, value)
}
</script>
