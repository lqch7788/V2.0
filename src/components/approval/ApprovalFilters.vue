<template>
  <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm border border-gray-100">
    <!-- 基础搜索 -->
    <div class="flex gap-4 items-end">
      <div class="flex-1">
        <label class="text-gray-700 mb-1 block text-sm">关键词搜索</label>
        <el-input
          v-model="localKeyword"
          placeholder="搜索审批单标题、申请人、单号..."
          class="!rounded-lg !h-10"
          clearable
          @keyup.enter="handleKeywordSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
      <el-button
        type="primary"
        class="!h-10 !px-4 !bg-emerald-600 !border-emerald-600 hover:!bg-emerald-700"
        @click="handleKeywordSearch"
      >
        <el-icon class="mr-1"><Search /></el-icon>
        搜索
      </el-button>
      <el-button
        :type="showAdvanced || hasActiveFilters ? 'primary' : 'default'"
        class="!h-10 !px-4"
        :class="showAdvanced || hasActiveFilters ? '!bg-emerald-50 !text-emerald-600 !border-emerald-500' : ''"
        @click="showAdvanced = !showAdvanced"
      >
        <el-icon class="mr-1"><Filter /></el-icon>
        高级筛选
      </el-button>
      <el-button
        v-if="hasActiveFilters"
        class="!h-10 !px-4"
        @click="handleReset"
      >
        <el-icon class="mr-1"><Close /></el-icon>
        清除筛选
      </el-button>
    </div>

    <!-- 高级筛选 -->
    <div v-if="showAdvanced" class="mt-4 pt-4 border-t border-gray-200 space-y-4">
      <!-- 审批类型 -->
      <div>
        <label class="text-gray-700 mb-2 block text-sm">审批类型</label>
        <div class="flex flex-wrap gap-2">
          <el-check-tag
            v-for="option in approvalTypeOptions"
            :key="option.value"
            :checked="filters.type?.includes(option.value)"
            @change="() => toggleArrayFilter('type', option.value, filters.type)"
            class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            :class="filters.type?.includes(option.value)
              ? 'bg-emerald-600 text-white border-emerald-600'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'"
          >
            {{ option.label }}
          </el-check-tag>
        </div>
      </div>

      <!-- 审批状态 -->
      <div>
        <label class="text-gray-700 mb-2 block text-sm">审批状态</label>
        <div class="flex flex-wrap gap-2">
          <el-check-tag
            v-for="option in statusOptions"
            :key="option.value"
            :checked="filters.status?.includes(option.value)"
            @change="() => toggleArrayFilter('status', option.value, filters.status)"
            class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            :class="filters.status?.includes(option.value)
              ? 'bg-emerald-600 text-white border-emerald-600'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'"
          >
            {{ option.label }}
          </el-check-tag>
        </div>
      </div>

      <!-- 审批类别 -->
      <div>
        <label class="text-gray-700 mb-2 block text-sm">审批类别</label>
        <div class="flex flex-wrap gap-2">
          <el-check-tag
            v-for="option in categoryOptions"
            :key="option.value"
            :checked="filters.category?.includes(option.value)"
            @change="() => toggleArrayFilter('category', option.value, filters.category)"
            class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            :class="filters.category?.includes(option.value)
              ? 'bg-emerald-600 text-white border-emerald-600'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'"
          >
            {{ option.label }}
          </el-check-tag>
        </div>
      </div>

      <!-- 优先级 -->
      <div>
        <label class="text-gray-700 mb-2 block text-sm">优先级</label>
        <div class="flex flex-wrap gap-2">
          <el-check-tag
            v-for="option in priorityOptions"
            :key="option.value"
            :checked="filters.priority?.includes(option.value)"
            @change="() => toggleArrayFilter('priority', option.value, filters.priority)"
            class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            :class="filters.priority?.includes(option.value)
              ? 'bg-emerald-600 text-white border-emerald-600'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'"
          >
            {{ option.label }}
          </el-check-tag>
        </div>
      </div>

      <!-- 日期范围 -->
      <div class="flex gap-4">
        <div class="flex-1">
          <label class="text-gray-700 mb-1 block text-sm">开始日期</label>
          <el-date-picker
            v-model="startDate"
            type="date"
            placeholder="选择开始日期"
            class="w-full"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            @change="handleStartDateChange"
          />
        </div>
        <div class="flex-1">
          <label class="text-gray-700 mb-1 block text-sm">结束日期</label>
          <el-date-picker
            v-model="endDate"
            type="date"
            placeholder="选择结束日期"
            class="w-full"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            @change="handleEndDateChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Search, Filter, Close } from '@element-plus/icons-vue'
import { ElInput, ElButton, ElDatePicker, ElCheckTag, ElIcon } from 'element-plus'

// ============================================================
// 审批筛选组件
// 文件路径：src/components/approval/ApprovalFilters.vue
// 组件化结构：统一的审批筛选条件
// ============================================================

// 审批状态枚举
const ApprovalStatus = {
  DRAFT: 'draft',
  PENDING: 'pending',
  APPROVED: 'approved',
  PARTIALLY_APPROVED: 'partially_approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled'
}

// 审批类型枚举
const ApprovalType = {
  MATERIAL_REQUEST: 'material_request',
  PURCHASE_REQUEST: 'purchase_request',
  PRODUCTION_PLAN: 'production_plan',
  HARVEST_REQUEST: 'harvest_request',
  RETURN_MATERIAL: 'return_material',
  LEAVE: 'leave',
  OVERTIME: 'overtime',
  TRANSFER: 'transfer',
  RESIGNATION: 'resignation'
}

// 审批类型选项
const approvalTypeOptions = [
  { value: ApprovalType.MATERIAL_REQUEST, label: '领料单' },
  { value: ApprovalType.PURCHASE_REQUEST, label: '采购申请' },
  { value: ApprovalType.PRODUCTION_PLAN, label: '生产计划' },
  { value: ApprovalType.HARVEST_REQUEST, label: '采收申请' },
  { value: ApprovalType.RETURN_MATERIAL, label: '退料单' },
  { value: ApprovalType.LEAVE, label: '请假' },
  { value: ApprovalType.OVERTIME, label: '加班' },
  { value: ApprovalType.TRANSFER, label: '调岗' },
  { value: ApprovalType.RESIGNATION, label: '离职' }
]

// 审批状态选项
const statusOptions = [
  { value: ApprovalStatus.DRAFT, label: '草稿' },
  { value: ApprovalStatus.PENDING, label: '待审批' },
  { value: ApprovalStatus.APPROVED, label: '已通过' },
  { value: ApprovalStatus.PARTIALLY_APPROVED, label: '部分通过' },
  { value: ApprovalStatus.REJECTED, label: '已拒绝' },
  { value: ApprovalStatus.CANCELLED, label: '已撤回' }
]

// 类别选项
const categoryOptions = [
  { value: 'business', label: '业务审批' },
  { value: 'hr', label: 'HR审批' },
  { value: 'quality', label: '质量审批' }
]

// 优先级选项
const priorityOptions = [
  { value: 'low', label: '低' },
  { value: 'normal', label: '普通' },
  { value: 'high', label: '高' },
  { value: 'urgent', label: '加急' }
]

const props = defineProps({
  // 筛选条件
  filters: {
    type: Object,
    default: () => ({
      keyword: '',
      type: [],
      status: [],
      category: [],
      priority: [],
      startDate: '',
      endDate: ''
    })
  },
  // 筛选变化回调
  onChange: {
    type: Function,
    required: true
  },
  // 重置回调
  onReset: {
    type: Function,
    required: true
  }
})

// 高级筛选展开状态
const showAdvanced = ref(false)

// 本地关键词
const localKeyword = ref(props.filters.keyword || '')

// 日期相关
const startDate = ref(props.filters.startDate || '')
const endDate = ref(props.filters.endDate || '')

// 监听props变化同步本地状态
watch(() => props.filters, (newFilters) => {
  localKeyword.value = newFilters.keyword || ''
  startDate.value = newFilters.startDate || ''
  endDate.value = newFilters.endDate || ''
}, { deep: true })

// 是否有激活的筛选
const hasActiveFilters = computed(() => {
  return (
    props.filters.keyword ||
    (props.filters.type?.length ?? 0) > 0 ||
    (props.filters.status?.length ?? 0) > 0 ||
    (props.filters.category?.length ?? 0) > 0 ||
    (props.filters.priority?.length ?? 0) > 0 ||
    props.filters.startDate ||
    props.filters.endDate
  )
})

// 关键词搜索
const handleKeywordSearch = () => {
  props.onChange({ keyword: localKeyword.value })
}

// 开始日期变化
const handleStartDateChange = (val) => {
  props.onChange({ startDate: val || '' })
}

// 结束日期变化
const handleEndDateChange = (val) => {
  props.onChange({ endDate: val || '' })
}

// 重置筛选
const handleReset = () => {
  localKeyword.value = ''
  startDate.value = ''
  endDate.value = ''
  showAdvanced.value = false
  props.onReset()
}

// 切换数组筛选
const toggleArrayFilter = (key, value, currentValues) => {
  const current = currentValues || []
  const newValues = current.includes(value)
    ? current.filter((v) => v !== value)
    : [...current, value]
  props.onChange({ [key]: newValues.length > 0 ? newValues : undefined })
}
</script>

<style scoped>
/* Element Plus 组件样式调整 */
:deep(.el-input__wrapper) {
  border-radius: 0.5rem;
}
:deep(.el-input__inner) {
  height: 40px;
}
:deep(.el-date-editor) {
  width: 100% !important;
}
:deep(.el-check-tag) {
  border: 1px solid #e5e7eb;
  background: white;
}
:deep(.el-check-tag:hover) {
  background: #f9fafb;
}
:deep(.el-check-tag.is-checked) {
  background: #059669;
  color: white;
  border-color: #059669;
}
</style>
