<template>
  <!-- 纯div自定义弹窗 -->
  <div v-if="visible" class="fixed inset-0 z-[100] flex items-center justify-center">
    <!-- 遮罩层 -->
    <div class="absolute inset-0 bg-black/50" @click="handleClose"></div>

    <!-- 弹窗内容 -->
    <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
      <!-- 头部 -->
      <div class="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4 flex items-center justify-between">
        <h3 class="text-lg font-semibold" style="color: white;">标签打印与导出</h3>
        <el-button link @click="handleClose" style="color: white;">
          <el-icon :size="20"><Close /></el-icon>
        </el-button>
      </div>

      <!-- 内容区 -->
      <div class="flex-1 overflow-y-auto p-6 space-y-4">
        <!-- 打印模式选择 -->
        <div class="bg-blue-50 rounded-lg p-4">
          <div class="flex gap-4 mb-4">
            <label v-for="mode in printModes" :key="mode.value" class="flex items-center gap-2">
              <el-radio v-model="printMode" :value="mode.value">
                <span class="text-sm font-medium">{{ mode.label }}</span>
              </el-radio>
            </label>
          </div>

          <!-- 单标签模式 -->
          <div v-if="printMode === 'single'" class="flex items-center gap-4">
            <div>
              <label class="block text-xs text-gray-600 mb-1">选择标签编号</label>
              <el-select v-model="previewLabel" placeholder="选择标签" class="w-48">
                <el-option v-for="label in allLabelNumbers" :key="label" :label="label" :value="label" />
              </el-select>
            </div>
            <div class="text-xs text-gray-500">共 {{ allLabelNumbers.length }} 个标签</div>
          </div>

          <!-- 多标签模式 -->
          <div v-if="printMode === 'multi'">
            <div class="flex items-center justify-between mb-2">
              <label class="text-xs text-gray-600">选择标签（已选 {{ selectedLabels.length }} 个）</label>
              <el-button link type="primary" size="small" @click="toggleSelectAll">
                {{ selectedLabels.length === allLabelNumbers.length ? '取消全选' : '全选' }}
              </el-button>
            </div>
            <div class="max-h-32 overflow-y-auto border border-gray-200 rounded p-2 bg-white">
              <div class="grid grid-cols-4 gap-1">
                <label
                  v-for="label in allLabelNumbers.slice(0, 100)"
                  :key="label"
                  :class="[
                    'flex items-center gap-1 p-1 rounded cursor-pointer text-xs',
                    selectedLabels.includes(label) ? 'bg-blue-100' : 'hover:bg-gray-50'
                  ]"
                >
                  <el-checkbox v-model="selectedLabels" :value="label" size="small" />
                  <span class="truncate">{{ label }}</span>
                </label>
              </div>
              <div v-if="allLabelNumbers.length > 100" class="text-xs text-gray-500 mt-2">
                共 {{ allLabelNumbers.length }} 个标签，已显示前100个
              </div>
            </div>
          </div>

          <!-- 批量生成模式 -->
          <div v-if="printMode === 'batch'" class="flex items-center gap-4">
            <div>
              <label class="block text-xs text-gray-600 mb-1">生成数量</label>
              <el-input-number v-model="printCount" :min="1" :max="remainingCount" size="default" />
            </div>
            <div class="text-xs text-gray-500">
              将生成 {{ printCount }} 个标签（可用库存：{{ remainingCount }}，已打印：{{ allLabelNumbers.length }}）
            </div>
          </div>
        </div>

        <!-- 模板选择 -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">操作人员</label>
            <div class="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50">{{ currentOperator }}</div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">模板选择</label>
            <el-select v-model="template" class="w-full">
              <el-option label="小标签" value="small" />
              <el-option label="大标签" value="large" />
              <el-option label="详情标签" value="detail" />
            </el-select>
          </div>
        </div>

        <!-- 标签预览 -->
        <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-700">标签预览 {{ previewLabel && `- ${previewLabel}` }}</span>
          </div>
          <div class="flex justify-center">
            <!-- 小标签 -->
            <div v-if="template === 'small'" class="flex flex-col items-center">
              <div class="bg-white p-3 border border-gray-200 rounded-lg shadow-sm">
                <div class="w-20 h-20 bg-gray-200 flex items-center justify-center">
                  <el-icon :size="40" class="text-gray-400"><DataBoard /></el-icon>
                </div>
              </div>
              <div class="mt-2 text-center">
                <div class="text-sm font-bold text-gray-900">{{ previewLabel || record?.seedCode }}</div>
                <div class="text-xs text-gray-600">{{ record?.cropName }}</div>
              </div>
            </div>

            <!-- 大标签 -->
            <div v-else-if="template === 'large'" class="flex flex-col items-center">
              <div class="bg-white p-4 border border-gray-200 rounded-lg shadow-sm">
                <div class="w-24 h-24 bg-gray-200 flex items-center justify-center">
                  <el-icon :size="60" class="text-gray-400"><DataBoard /></el-icon>
                </div>
              </div>
              <div class="mt-3 text-center">
                <div class="text-lg font-bold text-gray-900">{{ previewLabel || record?.seedCode }}</div>
                <div class="text-sm text-gray-600 mt-1">{{ record?.cropName }} - {{ record?.cropVariety }}</div>
              </div>
            </div>

            <!-- 详情标签 -->
            <div v-else class="flex bg-white p-4 border border-gray-200 rounded-lg shadow-sm">
              <div class="w-24 h-24 bg-gray-200 flex items-center justify-center flex-shrink-0">
                <el-icon :size="60" class="text-gray-400"><DataBoard /></el-icon>
              </div>
              <div class="ml-4 flex flex-col justify-center">
                <div class="text-lg font-bold text-gray-900 mb-2">{{ previewLabel || record?.seedCode }}</div>
                <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <div class="text-gray-500">作物名称：</div>
                  <div class="text-gray-900 font-medium">{{ record?.cropName }}</div>
                  <div class="text-gray-500">作物品种：</div>
                  <div class="text-gray-900">{{ record?.cropVariety }}</div>
                  <div class="text-gray-500">供应商：</div>
                  <div class="text-gray-900">{{ record?.supplierName }}</div>
                  <div class="text-gray-500">种源批号：</div>
                  <div class="text-gray-900 font-mono text-xs">{{ record?.seedCode }}</div>
                </div>
              </div>
              <div class="ml-4 flex flex-col justify-center border-l border-gray-200 pl-4">
                <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <div class="text-gray-500">可用数量：</div>
                  <div class="text-emerald-600 font-bold">{{ record?.availableCount?.toLocaleString() }}</div>
                  <div class="text-gray-500">采购日期：</div>
                  <div class="text-gray-900">{{ record?.purchaseDate }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
        <el-button @click="handleClose">取消</el-button>
        <el-button @click="handleExportExcel">
          <el-icon><Download /></el-icon>
          导出Excel
        </el-button>
        <el-button type="primary" @click="handlePrint" :loading="loading">
          {{ loading ? '处理中...' : '打印' }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Close, Download, DataBoard } from '@element-plus/icons-vue'

const props = defineProps({
  visible: Boolean,
  record: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:visible'])

const loading = ref(false)
const template = ref('detail')
const printMode = ref('single')
const printCount = ref(1)
const previewLabel = ref('')
const selectedLabels = ref([])

const printModes = [
  { value: 'single', label: '单标签打印' },
  { value: 'multi', label: '多标签打印' },
  { value: 'batch', label: '批量生成' }
]

// 当前操作员
const currentOperator = ref('系统管理员')

// 剩余可用数量
const remainingCount = computed(() => props.record?.availableCount || 0)

// 所有标签编号列表
const allLabelNumbers = computed(() => {
  if (!props.record?.seedCode || !props.record?.availableCount) return []
  const seedCode = props.record.seedCode
  const count = Math.min(props.record.availableCount, 200)
  const nums = []
  for (let i = 0; i < count; i++) {
    nums.push(`${seedCode}-${String(i + 1).padStart(4, '0')}`)
  }
  return nums
})

// 监听 visible 变化
watch(() => props.visible, (val) => {
  if (val && props.record) {
    previewLabel.value = allLabelNumbers.value[0] || ''
    selectedLabels.value = []
    printCount.value = 1
  }
})

// 全选/取消全选
const toggleSelectAll = () => {
  if (selectedLabels.value.length === allLabelNumbers.value.length) {
    selectedLabels.value = []
  } else {
    selectedLabels.value = [...allLabelNumbers.value]
  }
}

// 关闭弹窗
const handleClose = () => {
  emit('update:visible', false)
}

// 导出Excel
const handleExportExcel = () => {
  ElMessage.info('导出Excel功能')
}

// 打印
const handlePrint = () => {
  loading.value = true
  try {
    let labelsToPrint = []
    if (printMode.value === 'single') {
      if (!previewLabel.value) {
        ElMessage.warning('请选择要打印的标签')
        return
      }
      labelsToPrint = [previewLabel.value]
    } else if (printMode.value === 'multi') {
      if (selectedLabels.value.length === 0) {
        ElMessage.warning('请选择要打印的标签')
        return
      }
      labelsToPrint = [...selectedLabels.value]
    } else {
      const startIdx = allLabelNumbers.value.length
      for (let i = 0; i < printCount.value; i++) {
        labelsToPrint.push(`${props.record.seedCode}-${String(startIdx + i + 1).padStart(4, '0')}`)
      }
    }
    ElMessage.success(`准备打印 ${labelsToPrint.length} 个标签`)
    window.print()
  } finally {
    loading.value = false
  }
}
</script>
