<template>
  <ElModal
    :model-value="show"
    title="新增领料单"
    :width="900"
    :height="650"
    :show-submit="false"
    :show-cancel="false"
    :close-on-click-modal="false"
    @update:model-value="(v) => { if (!v) handleClose() }"
    @close="handleClose"
  >
    <el-form :model="localForm" label-width="100px">
      <div class="grid grid-cols-3 gap-4">
        <!-- 领料单号 -->
        <el-form-item label="领料单号">
          <div class="flex gap-2 w-full">
            <el-input v-model="localForm.code" placeholder="点击生成获取单号" readonly />
            <el-button type="primary" @click="onGenerateCode">生成</el-button>
          </div>
        </el-form-item>

        <!-- 申请日期 -->
        <el-form-item label="申请日期">
          <el-date-picker
            v-model="localForm.date"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>

        <!-- 申请人 -->
        <el-form-item label="申请人">
          <el-input v-model="localForm.applicant" placeholder="请输入申请人" />
        </el-form-item>

        <!-- 部门 -->
        <el-form-item label="部门">
          <el-select v-model="localForm.department" placeholder="请选择部门" style="width: 100%">
            <el-option label="生产部" value="生产部" />
            <el-option label="种植部" value="种植部" />
            <el-option label="技术部" value="技术部" />
          </el-select>
        </el-form-item>

        <!-- 库存地点 -->
        <el-form-item label="库存地点">
          <el-select v-model="localForm.warehouseLocation" placeholder="请选择仓库" style="width: 100%">
            <el-option label="A区" value="A区" />
            <el-option label="B区" value="B区" />
            <el-option label="C区" value="C区" />
          </el-select>
        </el-form-item>

        <!-- 种植区域/用途 -->
        <el-form-item label="种植区域">
          <el-input v-model="localForm.plantArea" placeholder="请输入种植区域" />
        </el-form-item>

        <!-- 生产计划批次号 -->
        <el-form-item label="生产批次">
          <el-select v-model="localForm.productionBatchCode" placeholder="请选择批次" style="width: 100%">
            <el-option v-for="code in PRODUCTION_BATCH_CODES" :key="code" :label="code" :value="code" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
      </div>

      <!-- 物料明细表格 -->
      <div class="mt-4">
        <div class="flex items-center justify-between mb-2">
          <div class="text-sm font-medium">物料明细</div>
          <el-button type="primary" size="small" @click="onAddMaterial">
            <el-icon><Plus /></el-icon>
            添加物料
          </el-button>
        </div>

        <el-table :data="localForm.materials" style="width: 100%" stripe border>
          <el-table-column type="index" width="60" />
          <el-table-column label="物料编码" min-width="120">
            <template #default="{ row }">
              <el-input v-model="row.materialCode" placeholder="编码" size="small" @change="(val) => handleMaterialCodeChange($index, val)" />
            </template>
          </el-table-column>
          <el-table-column label="物料名称" min-width="120">
            <template #default="{ row }">
              <el-input v-model="row.materialName" placeholder="名称" size="small" @change="(val) => handleMaterialNameChange($index, val)" />
            </template>
          </el-table-column>
          <el-table-column prop="spec" label="规格" min-width="100">
            <template #default="{ row }">
              <el-input v-model="row.spec" size="small" />
            </template>
          </el-table-column>
          <el-table-column prop="unit" label="单位" width="80">
            <template #default="{ row }">
              <el-input v-model="row.unit" size="small" />
            </template>
          </el-table-column>
          <el-table-column label="申领数量" width="100">
            <template #default="{ row }">
              <el-input-number v-model="row.requestedQuantity" :min="0" size="small" controls-position="right" />
            </template>
          </el-table-column>
          <el-table-column prop="stockQuantity" label="库存" width="80" />
          <el-table-column label="单价" width="100">
            <template #default="{ row }">
              <el-input-number v-model="row.unitPrice" :min="0" :precision="2" size="small" controls-position="right" />
            </template>
          </el-table-column>
          <el-table-column prop="warehousePosition" label="货位" min-width="100">
            <template #default="{ row }">
              <el-input v-model="row.warehousePosition" size="small" />
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="备注" min-width="100">
            <template #default="{ row }">
              <el-input v-model="row.remark" size="small" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80" fixed="right">
            <template #default="{ $index }">
              <el-button text type="danger" size="small" @click="onRemoveMaterial($index)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 备注 -->
      <el-form-item label="备注" class="mt-4">
        <el-input v-model="localForm.remark" type="textarea" :rows="2" placeholder="请输入备注" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button size="small" @click="handleClose">取消</el-button>
      <el-button type="primary" size="small" @click="handleSave">保存</el-button>
    </template>
  </ElModal>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'
import { ElModal } from '@/components/ui'

const PRODUCTION_BATCH_CODES = [
  'FQ2024-001', 'FQ2024-002', 'FQ2024-003', 'FQ2024-004',
  'FQ2024-005', 'FQ2024-006', 'FQ2024-007', 'FQ2024-008'
]

const props = defineProps({
  show: { type: Boolean, default: false },
  form: { type: Object, default: () => ({}) },
  // 兼容父组件可能用 add-form / addForm 传值
  addForm: { type: Object, default: undefined },
  // formChange 事件占位声明，避免被 Vue 当作 attr 下传给 ElModal
  formChange: { type: Function, default: undefined }
})

const emit = defineEmits(['close', 'save', 'update:form', 'add-material', 'remove-material', 'material-change', 'generate-code', 'formChange', 'voidApply'])

// 本地状态
const localForm = ref({
  code: '',
  date: '',
  applicant: '',
  department: '',
  warehouseLocation: '',
  plantArea: '',
  productionBatchCode: '',
  remark: '',
  materials: []
})

watch(() => props.form, (val) => {
  localForm.value = { ...val }
}, { deep: true, immediate: true })

// 物料编码变化处理
const handleMaterialCodeChange = (index, value) => {
  emit('material-change', index, 'materialCode', value)
}

// 物料名称变化处理
const handleMaterialNameChange = (index, value) => {
  emit('material-change', index, 'materialName', value)
}

const handleClose = () => {
  emit('close')
}

const handleSave = () => {
  emit('save', localForm.value)
}

const onGenerateCode = () => {
  emit('generate-code')
}

const onAddMaterial = () => {
  emit('add-material')
}

const onRemoveMaterial = (index) => {
  emit('remove-material', index)
}
</script>
