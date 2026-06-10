<template>
  <el-dialog
    v-model="visible"
    title="新增领料出库单"
    width="770px"
    @close="handleClose"
  >
    <div class="grid grid-cols-2 gap-4">
      <div class="bg-gray-100 rounded-lg p-3">
        <div class="text-xs font-medium text-gray-500 mb-1">出库单号</div>
        <div class="text-sm font-medium text-gray-900">{{ localForm.code || '系统自动生成' }}</div>
      </div>
      <div>
        <label class="block text-sm font-medium text-blue-700 mb-1">关联领料单号</label>
        <el-select
          v-model="selectedApplicationCode"
          placeholder="请选择领料单"
          @change="handleApplicationChange"
        >
          <el-option label="请选择领料单" value="" />
          <el-option
            v-for="app in filteredApplications"
            :key="app.id"
            :label="`${app.code} - ${app.applicant}`"
            :value="app.code"
          />
        </el-select>
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
        <el-input v-model="localForm.reviewer" placeholder="请输入审核人" @input="(val) => handleFormChange('reviewer', val)" />
      </div>
      <div>
        <label class="block text-sm font-medium text-blue-700 mb-1">操作人</label>
        <el-input v-model="localForm.operator" placeholder="请输入操作人" @input="(val) => handleFormChange('operator', val)" />
      </div>
    </div>

    <!-- 选择物料表格 -->
    <div v-if="selectedApplicationCode && selectedApp" class="mt-6">
      <div class="flex items-center justify-between mb-2">
        <label class="text-sm font-medium text-gray-700">选择物料（勾选要出库的物料并填写实发数量）</label>
        <el-button
          size="small"
          type="primary"
          :disabled="selectedMaterialIndices.size === 0"
          @click="handleAddToPool"
        >
          添加到物料池 ({{ selectedMaterialIndices.size }})
        </el-button>
      </div>

      <el-table
        :data="selectedApp.materials"
        border
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="materialCode" label="物料编码" min-width="120">
          <template #default="{ row }">
            <span class="font-mono">{{ row.materialCode }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="materialName" label="物料名称" min-width="100" />
        <el-table-column prop="spec" label="规格" min-width="80" />
        <el-table-column prop="unit" label="单位" width="70" />
        <el-table-column prop="requestedQuantity" label="申请数量" width="90" />
        <el-table-column prop="stockQuantity" label="当前库存" width="90" />
        <el-table-column label="单价(元)" width="90">
          <template #default="{ row }">
            {{ (row.unitPrice || 0).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="warehousePosition" label="仓库货位" min-width="100">
          <template #default="{ row }">
            {{ row.warehousePosition || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="实发数量" width="120">
          <template #default="{ row, $index }">
            <el-input-number
              v-model="materialActualQuantities[$index]"
              :min="0"
              :max="row.requestedQuantity"
              size="small"
              controls-position="right"
              :disabled="!selectedMaterialIndices.has($index)"
            />
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 物料池 -->
    <div v-if="materialPool.length > 0" class="mt-6">
      <label class="text-sm font-medium text-gray-700 mb-2">物料池（可修改实发数量或移除）</label>
      <el-table :data="materialPool" border stripe style="width: 100%">
        <el-table-column label="操作" width="80">
          <template #default="{ $index }">
            <el-button text type="danger" size="small" @click="handleRemoveFromPool($index)">移除</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="applicationCode" label="来源领料单号" min-width="140">
          <template #default="{ row }">
            <span class="text-blue-700 font-mono">{{ row.applicationCode }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="materialCode" label="物料编码" min-width="120">
          <template #default="{ row }">
            <span class="font-mono">{{ row.materialCode }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="materialName" label="物料名称" min-width="100" />
        <el-table-column prop="spec" label="规格" min-width="80" />
        <el-table-column prop="unit" label="单位" width="70" />
        <el-table-column prop="requestedQuantity" label="申请数量" width="90" />
        <el-table-column label="单价(元)" width="90">
          <template #default="{ row }">
            {{ (row.unitPrice || 0).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column label="小计(元)" width="90">
          <template #default="{ row }">
            {{ ((row.requestedQuantity || 0) * (row.unitPrice || 0)).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="warehousePosition" label="仓库货位" min-width="100">
          <template #default="{ row }">
            {{ row.warehousePosition || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="本次实发" width="120">
          <template #default="{ row, $index }">
            <el-input-number
              v-model="row.actualQuantity"
              :min="0"
              :max="row.requestedQuantity"
              size="small"
              controls-position="right"
              @change="(val) => handleUpdatePoolQuantity($index, val)"
            />
          </template>
        </el-table-column>
      </el-table>
    </div>

    <template #footer>
      <div class="flex justify-end gap-3">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" :disabled="materialPool.length === 0" @click="handleSave">保存</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  addForm: { type: Object, default: () => ({}) },
  selectedApplicationCode: { type: String, default: '' },
  selectedMaterialIndices: { type: Set, default: () => new Set() },
  materialActualQuantities: { type: Object, default: () => ({}) },
  materialPool: { type: Array, default: () => [] },
  materialReceivingDetails: { type: Array, default: () => [] }
})

const emit = defineEmits(['close', 'add-form-change', 'selected-application-code-change', 'selected-material-indices-change', 'material-actual-quantities-change', 'add-to-material-pool', 'remove-from-material-pool', 'update-material-pool-quantity', 'cancel', 'save'])

const visible = computed({
  get: () => props.show,
  set: () => handleClose()
})

const localForm = ref({ ...props.addForm })
const selectedApplicationCode = ref(props.selectedApplicationCode)
const selectedMaterialIndices = ref(new Set(props.selectedMaterialIndices))
const materialActualQuantities = ref({ ...props.materialActualQuantities })

watch(() => props.show, (isOpen) => {
  if (isOpen) {
    localForm.value = { ...props.addForm }
    selectedApplicationCode.value = props.selectedApplicationCode
    selectedMaterialIndices.value = new Set(props.selectedMaterialIndices)
    materialActualQuantities.value = { ...props.materialActualQuantities }
  }
})

watch(() => props.addForm, (val) => {
  localForm.value = { ...val }
}, { deep: true })

const filteredApplications = computed(() => {
  return props.materialReceivingDetails.filter(app => app.status === '已审批' && app.materials.length > 0)
})

const selectedApp = computed(() => {
  return props.materialReceivingDetails.find(app => app.code === selectedApplicationCode.value)
})

const handleClose = () => emit('close')

const handleCancel = () => emit('cancel')

const handleFormChange = (field, value) => {
  emit('add-form-change', field, value)
}

const handleApplicationChange = (code) => {
  emit('selected-application-code-change', code)
  emit('selected-material-indices-change', new Set())
  emit('material-actual-quantities-change', {})
  selectedMaterialIndices.value = new Set()
  materialActualQuantities.value = {}
}

const handleSelectionChange = (selection) => {
  const indices = new Set()
  const quantities = { ...materialActualQuantities.value }
  selection.forEach((row, idx) => {
    const originalIdx = selectedApp.value.materials.indexOf(row)
    if (originalIdx !== -1) {
      indices.add(originalIdx)
      if (quantities[originalIdx] === undefined) {
        quantities[originalIdx] = row.requestedQuantity
      }
    }
  })
  selectedMaterialIndices.value = indices
  emit('selected-material-indices-change', indices)
  emit('material-actual-quantities-change', quantities)
}

const handleAddToPool = () => {
  emit('add-to-material-pool')
}

const handleRemoveFromPool = (index) => {
  emit('remove-from-material-pool', index)
}

const handleUpdatePoolQuantity = (index, quantity) => {
  emit('update-material-pool-quantity', index, quantity)
}

const handleSave = () => {
  emit('save')
}
</script>
