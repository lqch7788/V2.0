<template>
  <!-- 物料审批表单组件 -->
  <div class="space-y-4">
    <!-- 基础信息 -->
    <div class="grid grid-cols-2 gap-4">
      <div>
        <div class="text-sm text-gray-500 mb-1">领料单号</div>
        <div class="font-medium text-gray-900">{{ approval.code }}</div>
      </div>
      <div>
        <div class="text-sm text-gray-500 mb-1">标题</div>
        <div class="font-medium text-gray-900">{{ approval.title }}</div>
      </div>
      <div>
        <div class="text-sm text-gray-500 mb-1">申请人</div>
        <div class="font-medium text-gray-900">{{ approval.applicantName }}</div>
      </div>
      <div>
        <div class="text-sm text-gray-500 mb-1">申请部门</div>
        <div class="font-medium text-gray-900">{{ approval.applicantDepartment }}</div>
      </div>
    </div>

    <!-- 物料明细 -->
    <div>
      <div class="text-sm font-medium text-gray-700 mb-2">
        物料明细 - 请填写实际发放数量
      </div>
      <div class="border border-gray-200 rounded-lg overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="text-left text-xs font-medium text-gray-500 px-4 py-2">物料编码</th>
              <th class="text-left text-xs font-medium text-gray-500 px-4 py-2">物料名称</th>
              <th class="text-right text-xs font-medium text-gray-500 px-4 py-2">申请数量</th>
              <th class="text-right text-xs font-medium text-gray-500 px-4 py-2">实际发放</th>
              <th class="text-right text-xs font-medium text-gray-500 px-4 py-2">差额</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="mat in materials" :key="mat.materialId" class="border-t border-gray-100">
              <td class="px-4 py-2 text-sm text-gray-700">{{ mat.materialCode }}</td>
              <td class="px-4 py-2 text-sm text-gray-700">{{ mat.materialName }}</td>
              <td class="px-4 py-2 text-sm text-gray-700 text-right">
                {{ mat.requestedQuantity }} {{ mat.unit }}
              </td>
              <td class="px-4 py-2 text-right">
                <div class="flex items-center justify-end gap-2">
                  <el-input-number
                    :model-value="getLocalQty(mat.materialId)"
                    :min="0"
                    :max="mat.requestedQuantity"
                    :controls="true"
                    size="small"
                    :class="isInsufficient(mat) ? 'insufficient-input' : ''"
                    style="width: 100px;"
                    @update:model-value="(val) => handleQuantityChange(mat.materialId, val, mat.requestedQuantity)"
                  />
                  <span class="text-gray-400 text-sm">{{ mat.unit }}</span>
                </div>
              </td>
              <td class="px-4 py-2 text-right">
                <span :class="['text-sm font-medium', getDiffClass(mat)]">
                  {{ getDiffText(mat) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 不足提示 -->
    <div v-if="hasInsufficientMaterials" class="bg-amber-50 border border-amber-200 rounded-lg p-4">
      <div class="flex items-start gap-3">
        <el-icon :size="20" class="text-amber-600 flex-shrink-0 mt-0.5"><WarningFilled /></el-icon>
        <div class="flex-1">
          <p class="text-sm font-medium text-amber-800">部分物料数量不足</p>
          <div class="mt-2 text-sm text-amber-700">
            <p>以下物料实际发放数量小于申请数量：</p>
            <ul class="mt-1 space-y-1">
              <li v-for="mat in insufficientMaterials" :key="mat.materialId">
                · {{ mat.materialName }}：申请 {{ mat.requestedQuantity }}
                {{ mat.unit }}，实际发放 {{ getLocalQty(mat.materialId) }}
                {{ mat.unit }}（不足 {{ mat.requestedQuantity - getLocalQty(mat.materialId) }}
                {{ mat.unit }}）
              </li>
            </ul>
          </div>
          <p class="mt-2 text-sm text-amber-800">
            系统将自动生成新的待审批领料单，包含不足数量的物料。
          </p>
        </div>
      </div>
    </div>

    <!-- 审批意见 -->
    <div>
      <div class="text-sm font-medium text-gray-700 mb-1">审批意见</div>
      <el-input
        :model-value="comment"
        type="textarea"
        :rows="3"
        placeholder="请输入审批意见（可选）..."
        @update:model-value="(val) => emit('update:comment', val)"
      />
    </div>

    <!-- 操作按钮 -->
    <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
      <el-button @click="emit('cancel')">取消</el-button>
      <el-button type="primary" @click="emit('submit')">确认部分通过</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { WarningFilled } from '@element-plus/icons-vue'

const props = defineProps({
  /** 审批数据 */
  approval: { type: Object, required: true },
  /** 业务关联数据 */
  businessLink: { type: Object, required: true },
  /** 审批意见 */
  comment: { type: String, default: '' },
})

const emit = defineEmits(['update:comment', 'change', 'submit', 'cancel'])

// 本地物料数量状态
const localItems = ref({})

// 初始化本地状态
const initItems = () => {
  const initial = {}
  if (props.businessLink?.materials) {
    props.businessLink.materials.forEach((mat) => {
      initial[mat.materialId] = mat.approvedQuantity ?? mat.requestedQuantity
    })
  }
  localItems.value = initial
  emit('change', initial)
}

// 确保初始化
if (Object.keys(localItems.value).length === 0 && props.businessLink?.materials) {
  initItems()
}

// 物料列表
const materials = computed(() => {
  return props.businessLink?.materials || []
})

// 获取本地数量
const getLocalQty = (materialId) => {
  return localItems.value[materialId] ?? 0
}

// 处理数量变更
const handleQuantityChange = (materialId, value, max) => {
  const newValue = Math.max(0, Math.min(value || 0, max))
  const newItems = { ...localItems.value, [materialId]: newValue }
  localItems.value = newItems
  emit('change', newItems)
}

// 检查物料是否数量不足
const isInsufficient = (mat) => {
  return getLocalQty(mat.materialId) < mat.requestedQuantity
}

// 是否有物料数量不足
const hasInsufficientMaterials = computed(() => {
  return materials.value.some((mat) => getLocalQty(mat.materialId) < mat.requestedQuantity)
})

// 不足的物料列表
const insufficientMaterials = computed(() => {
  return materials.value.filter((mat) => getLocalQty(mat.materialId) < mat.requestedQuantity)
})

// 差额样式
const getDiffClass = (mat) => {
  const currentQty = getLocalQty(mat.materialId)
  const diff = currentQty - mat.requestedQuantity
  if (diff === 0) return 'text-gray-400'
  if (diff > 0) return 'text-blue-600'
  return 'text-red-600'
}

// 差额文本
const getDiffText = (mat) => {
  const currentQty = getLocalQty(mat.materialId)
  const diff = currentQty - mat.requestedQuantity
  if (diff > 0) return `+${diff}`
  return String(diff)
}
</script>

<style scoped>
:deep(.insufficient-input .el-input__wrapper) {
  border-color: #f59e0b;
  background-color: #fffbeb;
}
</style>
