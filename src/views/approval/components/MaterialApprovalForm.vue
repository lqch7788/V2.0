<!--
  物料审批表单组件
  对标 V1.1 src/components/approval/MaterialApprovalForm.tsx
  功能：物料申请审批单表单（物料明细 + 数量 + 单位 + 用途）
-->
<template>
  <div class="bg-white rounded-xl p-6 space-y-4 border border-gray-200">
    <div class="flex items-center gap-2">
      <el-icon :size="20" color="#059669"><Goods /></el-icon>
      <h3 class="font-semibold text-gray-900">物料申请明细</h3>
    </div>

    <!-- 物料列表 -->
    <el-table :data="form.materials" border size="small">
      <el-table-column label="序号" type="index" width="50" />
      <el-table-column label="物料编码" min-width="140">
        <template #default="{ row }">
          <el-input v-model="row.materialCode" placeholder="编码" size="small" />
        </template>
      </el-table-column>
      <el-table-column label="物料名称" min-width="160">
        <template #default="{ row }">
          <el-input v-model="row.materialName" placeholder="名称" size="small" />
        </template>
      </el-table-column>
      <el-table-column label="规格" min-width="100">
        <template #default="{ row }">
          <el-input v-model="row.specification" placeholder="规格" size="small" />
        </template>
      </el-table-column>
      <el-table-column label="申请数量" min-width="120">
        <template #default="{ row }">
          <el-input-number v-model="row.requestedQuantity" :min="0" size="small" controls-position="right" />
        </template>
      </el-table-column>
      <el-table-column label="单位" min-width="80">
        <template #default="{ row }">
          <el-select v-model="row.unit" size="small" placeholder="单位">
            <el-option v-for="u in unitOptions" :key="u" :value="u" :label="u" />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="用途" min-width="140">
        <template #default="{ row }">
          <el-input v-model="row.purpose" placeholder="用途" size="small" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="60" fixed="right">
        <template #default="{ $index }">
          <el-button link type="danger" size="small" @click="removeMaterial($index)">
            <el-icon><Delete /></el-icon>
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-button class="w-full" dashed @click="addMaterial">
      <el-icon><Plus /></el-icon>
      添加物料
    </el-button>

    <!-- 申请说明 -->
    <div>
      <label class="text-sm text-gray-700 mb-2 block">申请说明</label>
      <el-input
        v-model="form.description"
        type="textarea"
        :rows="2"
        placeholder="请说明申请原因及用途"
        maxlength="200"
        show-word-limit
      />
    </div>

    <!-- 操作按钮 -->
    <div class="flex justify-end gap-2 pt-2">
      <el-button @click="$emit('cancel')">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">
        提交审批
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { Delete, Goods, Plus } from '@element-plus/icons-vue'

const props = defineProps({
  submitting: { type: Boolean, default: false },
  defaultMaterials: { type: Array, default: () => [] },
})

const emit = defineEmits(['submit', 'cancel'])

const unitOptions = ['个', '件', '套', 'kg', 'g', 'L', 'm', '盒', '袋', '箱']

const form = reactive({
  materials: props.defaultMaterials.length
    ? [...props.defaultMaterials]
    : [createEmptyMaterial()],
  description: '',
})

function createEmptyMaterial() {
  return {
    materialCode: '',
    materialName: '',
    specification: '',
    requestedQuantity: 1,
    unit: '个',
    purpose: '',
  }
}

const addMaterial = () => {
  form.materials.push(createEmptyMaterial())
}

const removeMaterial = (idx) => {
  if (form.materials.length <= 1) {
    form.materials[0] = createEmptyMaterial()
  } else {
    form.materials.splice(idx, 1)
  }
}

const handleSubmit = () => {
  emit('submit', { ...form })
}
</script>