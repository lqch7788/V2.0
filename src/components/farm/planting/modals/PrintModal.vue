<template>
  <!-- 标签打印弹窗 - 纯div结构 -->
  <div v-if="isOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]" @click.self="onClose">
    <div class="bg-white rounded-xl w-full max-w-2xl shadow-xl max-h-[90vh] flex flex-col">
      <!-- 标题栏 - 渐变背景 -->
      <div class="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-t-xl">
        <h3 class="text-lg font-semibold text-white flex items-center gap-2">
          <el-icon style="color: white;"><Printer /></el-icon>
          标签打印与导出
        </h3>
        <el-icon style="color: white; cursor: pointer;" @click="onClose"><Close /></el-icon>
      </div>

      <!-- 内容区域 -->
      <div class="flex-1 overflow-y-auto p-6 space-y-4">
        <!-- 打印模式选择 -->
        <div class="bg-blue-50 rounded-lg p-4">
          <div class="flex gap-4 mb-4">
            <label class="flex items-center gap-2 cursor-pointer">
              <el-radio v-model="printMode" value="single" @change="handleModeChange">
                <span class="text-sm font-medium">单标签打印</span>
              </el-radio>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <el-radio v-model="printMode" value="multi" @change="handleModeChange">
                <span class="text-sm font-medium">多标签打印</span>
              </el-radio>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <el-radio v-model="printMode" value="batch" @change="handleModeChange">
                <span class="text-sm font-medium">批量生成</span>
              </el-radio>
            </label>
          </div>

          <!-- 单标签模式 -->
          <div v-if="printMode === 'single'" class="flex items-center gap-4">
            <div>
              <label class="block text-xs text-gray-600 mb-1">选择标签编号</label>
              <el-select v-model="selectedLabel" placeholder="选择标签" class="w-48">
                <el-option v-for="label in allLabels" :key="label" :label="label" :value="label" />
              </el-select>
            </div>
            <div class="text-xs text-gray-500">共 {{ allLabels.length }} 个标签</div>
          </div>

          <!-- 多标签模式 -->
          <div v-if="printMode === 'multi'">
            <div class="flex items-center justify-between mb-2">
              <label class="text-xs text-gray-600">选择标签（已选 {{ selectedLabels.length }} 个）</label>
              <el-button link type="primary" size="small" @click="toggleSelectAll">
                {{ selectedLabels.length === allLabels.length ? '取消全选' : '全选' }}
              </el-button>
            </div>
            <div class="max-h-32 overflow-y-auto border border-gray-200 rounded p-2 bg-white">
              <el-checkbox-group v-model="selectedLabels">
                <el-checkbox v-for="label in allLabels.slice(0, 100)" :key="label" :value="label" class="block">
                  {{ label }}
                </el-checkbox>
              </el-checkbox-group>
            </div>
          </div>

          <!-- 批量生成模式 -->
          <div v-if="printMode === 'batch'" class="space-y-2">
            <div class="flex items-center gap-4">
              <div>
                <label class="block text-xs text-gray-600 mb-1">生成数量</label>
                <el-input-number v-model="batchCount" :min="1" :max="record?.plantingCount || 100" />
              </div>
              <div class="text-xs text-gray-500">
                将生成 {{ batchCount }} 个标签（剩余：{{ remainingCount }}，已打印：{{ printedCount }}）
              </div>
            </div>
          </div>
        </div>

        <!-- 标签预览 -->
        <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-700">标签预览 {{ selectedLabel && `- ${selectedLabel}` }}</span>
          </div>
          <div class="flex justify-center">
            <div class="flex flex-col items-center print-label bg-white p-4 border border-gray-200 rounded-lg shadow-sm">
              <!-- 二维码占位 -->
              <div class="w-24 h-24 bg-gray-200 flex items-center justify-center mb-2">
                <el-icon size="48" color="#999"><Coin /></el-icon>
              </div>
              <div class="text-center">
                <div class="text-sm font-bold text-gray-900">{{ selectedLabel || record?.plantCode }}</div>
                <div class="text-xs text-gray-600">{{ record?.cropName }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="p-4 border-t border-gray-200 flex justify-end gap-3">
        <el-button @click="onClose">取消</el-button>
        <el-button @click="handleExportExcel">导出Excel</el-button>
        <el-button type="primary" @click="handlePrint">打印</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Printer, Close, Coin } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  isOpen: Boolean,
  record: Object
})

const emit = defineEmits(['close', 'print', 'export'])

const printMode = ref('single')
const selectedLabel = ref('')
const selectedLabels = ref([])
const batchCount = ref(1)

// 生成标签列表
const allLabels = computed(() => {
  if (!props.record) return []
  const labels = []
  for (let i = 0; i < Math.min(props.record.plantingCount, 100); i++) {
    labels.push(`${props.record.plantCode}-${String(i + 1).padStart(4, '0')}`)
  }
  return labels
})

const remainingCount = computed(() => {
  if (!props.record) return 0
  return props.record.plantingCount - printedCount.value
})

const printedCount = computed(() => allLabels.value.length)

watch(() => props.isOpen, (val) => {
  if (val && props.record) {
    printMode.value = 'single'
    selectedLabel.value = allLabels.value[0] || ''
    selectedLabels.value = []
    batchCount.value = 1
  }
})

const handleModeChange = () => {
  selectedLabels.value = []
}

const toggleSelectAll = () => {
  if (selectedLabels.value.length === allLabels.value.length) {
    selectedLabels.value = []
  } else {
    selectedLabels.value = [...allLabels.value]
  }
}

const onClose = () => {
  emit('close')
}

const handlePrint = () => {
  if (printMode.value === 'single' && !selectedLabel.value) {
    ElMessage.warning('请选择要打印的标签')
    return
  }
  if (printMode.value === 'multi' && selectedLabels.value.length === 0) {
    ElMessage.warning('请选择要打印的标签')
    return
  }
  emit('print', {
    mode: printMode.value,
    labels: printMode.value === 'single' ? [selectedLabel.value] : selectedLabels.value,
    count: batchCount.value
  })
}

const handleExportExcel = () => {
  emit('export', {
    mode: printMode.value,
    labels: printMode.value === 'single' ? [selectedLabel.value] : selectedLabels.value,
    count: batchCount.value
  })
}
</script>

<style scoped>
.print-label {
  width: 160px;
}
</style>
