<template>
  <ElModal
    :model-value="show"
    title="编辑领料单"
    :width="900"
    :height="650"
    :show-submit="false"
    :show-cancel="false"
    :close-on-click-modal="false"
    @update:model-value="(v) => { if (!v) handleClose() }"
    @close="handleClose"
  >
    <div class="grid grid-cols-2 gap-4">
      <!-- 领料单号 - 只读 -->
      <div class="bg-gray-100 rounded-lg p-3">
        <div class="text-xs font-medium text-gray-500 mb-1">领料单号</div>
        <div class="text-sm font-medium text-gray-900">{{ record?.code || '-' }}</div>
      </div>
      <div>
        <label class="block text-sm font-medium text-blue-700 mb-1">申请日期</label>
        <el-date-picker
          v-model="localForm.date"
          type="date"
          placeholder="选择日期"
          value-format="YYYY-MM-DD"
          style="width: 100%"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-blue-700 mb-1">申请人</label>
        <el-select v-model="localForm.applicant" placeholder="选择申请人" filterable allow-create clearable>
          <el-option label="张三" value="张三" />
          <el-option label="李四" value="李四" />
          <el-option label="王五" value="王五" />
        </el-select>
      </div>
      <div>
        <label class="block text-sm font-medium text-blue-700 mb-1">部门</label>
        <el-select v-model="localForm.department" placeholder="请选择部门">
          <el-option label="请选择部门" value="" />
          <el-option label="生产部" value="生产部" />
          <el-option label="后勤部" value="后勤部" />
          <el-option label="设备部" value="设备部" />
          <el-option label="技术部" value="技术部" />
          <el-option label="采后处理部" value="采后处理部" />
        </el-select>
      </div>
      <div>
        <label class="block text-sm font-medium text-blue-700 mb-1">库存地点</label>
        <el-select v-model="localForm.warehouseLocation" placeholder="请选择">
          <el-option label="仓库A区" value="仓库A区" />
          <el-option label="仓库B区" value="仓库B区" />
          <el-option label="仓库C区" value="仓库C区" />
          <el-option label="仓库D区" value="仓库D区" />
          <el-option label="仓库E区" value="仓库E区" />
        </el-select>
      </div>
      <div>
        <label class="block text-sm font-medium text-blue-700 mb-1">种植区域/用途</label>
        <el-input v-model="localForm.plantArea" placeholder="如：1号棚-叶菜区" />
      </div>
      <div>
        <label class="block text-sm font-medium text-blue-700 mb-1">审核人</label>
        <el-select v-model="localForm.reviewer" placeholder="选择审核人" filterable allow-create clearable>
          <el-option label="张三" value="张三" />
          <el-option label="李四" value="李四" />
          <el-option label="王五" value="王五" />
        </el-select>
      </div>
      <div>
        <label class="block text-sm font-medium text-blue-700 mb-1">生产计划批次号</label>
        <el-input v-model="localForm.productionBatchCode" placeholder="请输入" />
      </div>
    </div>

    <!-- 物料明细 -->
    <div class="mt-6">
      <div class="flex items-center justify-between mb-2">
        <label class="text-sm font-medium text-gray-700">物料明细</label>
        <el-button size="small" type="primary" @click="handleAddMaterial">
          <el-icon><Plus /></el-icon>
          添加物料
        </el-button>
      </div>

      <el-table
        v-if="localForm.materials && localForm.materials.length > 0"
        :data="localForm.materials"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column label="物料编码" min-width="120">
          <template #default="{ row, $index }">
            <el-input v-model="row.materialCode" size="small" placeholder="编码" @input="handleMaterialChange($index, 'materialCode', row.materialCode)" />
          </template>
        </el-table-column>
        <el-table-column label="物料名称" min-width="100">
          <template #default="{ row, $index }">
            <el-input v-model="row.materialName" size="small" placeholder="名称" @input="handleMaterialChange($index, 'materialName', row.materialName)" />
          </template>
        </el-table-column>
        <el-table-column label="规格" min-width="80">
          <template #default="{ row, $index }">
            <el-input v-model="row.spec" size="small" placeholder="规格" @input="handleMaterialChange($index, 'spec', row.spec)" />
          </template>
        </el-table-column>
        <el-table-column label="单位" width="70">
          <template #default="{ row, $index }">
            <el-input v-model="row.unit" size="small" placeholder="单位" @input="handleMaterialChange($index, 'unit', row.unit)" />
          </template>
        </el-table-column>
        <el-table-column label="申领数量" width="100">
          <template #default="{ row, $index }">
            <el-input-number
              v-model="row.requestedQuantity"
              size="small"
              :min="0"
              controls-position="right"
              :class="row.requestedQuantity > (row.stockQuantity || 0) ? 'text-red-600' : ''"
              @change="handleMaterialChange($index, 'requestedQuantity', row.requestedQuantity)"
            />
          </template>
        </el-table-column>
        <el-table-column label="当前库存" width="90">
          <template #default="{ row, $index }">
            <el-input-number v-model="row.stockQuantity" size="small" :min="0" controls-position="right" @change="handleMaterialChange($index, 'stockQuantity', row.stockQuantity)" />
          </template>
        </el-table-column>
        <el-table-column label="单价(元)" width="90">
          <template #default="{ row, $index }">
            <el-input-number v-model="row.unitPrice" size="small" :min="0" controls-position="right" @change="handleMaterialChange($index, 'unitPrice', row.unitPrice)" />
          </template>
        </el-table-column>
        <el-table-column label="小计(元)" width="90">
          <template #default="{ row }">
            <span class="text-blue-700">{{ ((row.requestedQuantity || 0) * (row.unitPrice || 0)).toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="仓库货位" min-width="100">
          <template #default="{ row, $index }">
            <el-input v-model="row.warehousePosition" size="small" placeholder="货位" @input="handleMaterialChange($index, 'warehousePosition', row.warehousePosition)" />
          </template>
        </el-table-column>
        <el-table-column label="备注" min-width="100">
          <template #default="{ row, $index }">
            <el-input v-model="row.remark" size="small" placeholder="备注" @input="handleMaterialChange($index, 'remark', row.remark)" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="60" fixed="right">
          <template #default="{ $index }">
            <el-button text type="danger" size="small" @click="handleRemoveMaterial($index)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div v-else class="text-sm text-gray-500 italic border border-gray-200 rounded-lg p-4 text-center">
        暂无物料明细，请点击"添加物料"按钮添加
      </div>
    </div>

    <template #footer>
      <el-button size="small" @click="handleClose">取消</el-button>
      <el-button size="small" type="primary" @click="handleSave">保存</el-button>
    </template>
  </ElModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'
import { ElModal } from '@/components/ui'

const props = defineProps({
  show: { type: Boolean, default: false },
  record: { type: Object, default: null },
  editForm: { type: Object, default: () => ({}) },
  // 兼容父组件传 formChange / voidApply 事件占位
  formChange: { type: Function, default: undefined },
  voidApply: { type: Function, default: undefined }
})

const emit = defineEmits(['close', 'save', 'add-material', 'remove-material', 'material-change', 'formChange', 'voidApply'])

const localForm = ref({
  date: '',
  applicant: '',
  department: '',
  warehouseLocation: '',
  plantArea: '',
  reviewer: '',
  productionBatchCode: '',
  materials: []
})

watch(() => props.editForm, (val) => {
  localForm.value = { ...val }
}, { deep: true, immediate: true })

watch(() => props.show, (isOpen) => {
  if (isOpen) {
    localForm.value = { ...props.editForm }
  }
})

const handleClose = () => {
  emit('close')
}

const handleSave = () => {
  emit('save', localForm.value)
  handleClose()
}

const handleAddMaterial = () => {
  emit('add-material')
}

const handleRemoveMaterial = (index) => {
  emit('remove-material', index)
}

const handleMaterialChange = (index, field, value) => {
  emit('material-change', index, field, value)
}
</script>
