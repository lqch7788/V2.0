<!--
  农事任务中心 - 批量导入任务弹窗
  1:1 翻译自 V1.1 src/components/farm/hub/modals/BatchImportModal.tsx（300 行）
  头部样式：V1.1 风格（icon + 标题 + 关闭按钮，行间分隔线，px-6 py-4 border-b border-gray-100）
  字段：文件上传区（拖拽/点击）/ CSV 格式说明 / 数据预览前5条
  - props: isOpen
  - emits: close / import
-->
<template>
  <el-dialog
    :model-value="isOpen"
    width="768px"
    top="5vh"
    :close-on-click-modal="false"
    :show-header="false"
    @close="handleClose"
    class="batch-import-dialog"
  >
    <!-- 头部：V1.1 风格（Upload icon 5h 5 emerald-500 + 标题 + 关闭按钮 + 分隔线） -->
    <template #header>
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div class="flex items-center gap-3">
          <Upload :size="20" class="text-emerald-500" />
          <h3 class="text-lg font-semibold text-gray-900">批量导入任务</h3>
        </div>
        <button
          class="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="关闭"
          @click="handleClose"
        >
          <X :size="16" class="text-gray-400" />
        </button>
      </div>
    </template>

    <div class="space-y-6">
      <!-- 文件上传区域 -->
      <div
        @drop.prevent="handleFileDrop"
        @dragover.prevent
        :class="[
          'border-2 border-dashed rounded-xl p-8 text-center transition-colors',
          importFile
            ? 'border-emerald-400 bg-emerald-50'
            : 'border-gray-400 hover:border-gray-400'
        ]"
      >
        <input
          ref="fileInputRef"
          type="file"
          accept=".csv,.xlsx"
          class="hidden"
          @change="handleFileChange"
        />
        <div class="cursor-pointer" @click="openFilePicker">
          <template v-if="importFile">
            <Upload :size="40" class="text-emerald-500 mx-auto mb-2 block" />
            <p class="font-medium text-gray-900">{{ importFile.name }}</p>
            <p class="text-sm text-gray-500 mt-1">点击或拖拽文件到此处重新上传</p>
          </template>
          <template v-else>
            <Upload :size="40" class="text-gray-400 mx-auto mb-2 block" />
            <p class="font-medium text-gray-900">点击上传或拖拽文件到此处</p>
            <p class="text-sm text-gray-500 mt-1">支持 CSV、XLSX 格式文件</p>
          </template>
        </div>
      </div>

      <!-- CSV格式说明（未选文件时显示） -->
      <div v-if="!importFile" class="bg-gray-50 rounded-lg p-4">
        <h4 class="font-medium text-gray-700 mb-2">CSV文件格式要求</h4>
        <p class="text-sm text-gray-600 mb-2">
          请确保CSV文件包含以下列（按顺序）：
        </p>
        <code class="text-xs bg-white px-2 py-1 rounded border border-gray-200 block">
          任务类型,任务区域,作物,执行人,计划开始时间,计划结束时间,优先级
        </code>
        <p class="text-xs text-gray-500 mt-2">
          示例：irrigation,1号棚,番茄,张三,2024-03-20 08:00,2024-03-20 12:00,normal
        </p>
      </div>

      <!-- 预览表格 -->
      <div v-if="importPreview.length > 0">
        <div class="flex items-center justify-between mb-3">
          <h4 class="font-medium text-gray-700">数据预览（前5条）</h4>
          <span class="text-sm text-gray-500">共 {{ importData.length }} 条数据</span>
        </div>
        <div class="overflow-x-auto border border-gray-200 rounded-lg">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <tr>
                <th class="px-3 py-2 text-left text-sm font-semibold whitespace-nowrap">任务类型</th>
                <th class="px-3 py-2 text-left text-sm font-semibold whitespace-nowrap">任务区域</th>
                <th class="px-3 py-2 text-left text-sm font-semibold whitespace-nowrap">作物</th>
                <th class="px-3 py-2 text-left text-sm font-semibold whitespace-nowrap">执行人</th>
                <th class="px-3 py-2 text-left text-sm font-semibold whitespace-nowrap">计划开始时间</th>
                <th class="px-3 py-2 text-left text-sm font-semibold whitespace-nowrap">任务工时</th>
                <th class="px-3 py-2 text-left text-sm font-semibold whitespace-nowrap">优先级</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-300">
              <tr
                v-for="(row, idx) in importPreview"
                :key="idx"
                class="hover:bg-blue-100 transition-colors"
              >
                <td class="px-3 py-2 text-sm text-gray-900 whitespace-nowrap">
                  {{ row.typeLabel || '未知类型' }}
                </td>
                <td class="px-3 py-2 text-sm text-gray-900 whitespace-nowrap">{{ row.field }}</td>
                <td class="px-3 py-2 text-sm text-gray-900 whitespace-nowrap">{{ row.crop }}</td>
                <td class="px-3 py-2 text-sm text-gray-900 whitespace-nowrap">{{ row.assignee }}</td>
                <td class="px-3 py-2 text-sm text-gray-900 whitespace-nowrap">
                  {{ (row.planStart || '').split(' ')[0] || '-' }}
                </td>
                <td class="px-3 py-2 text-sm text-gray-900 whitespace-nowrap">
                  {{ row.estimatedDays || 0 }}天{{ row.estimatedHours || 0 }}小时
                </td>
                <td class="px-3 py-2 whitespace-nowrap">
                  <span
                    :class="[
                      'px-2 py-0.5 rounded text-xs',
                      row.priority === 'urgent'
                        ? 'bg-red-100 text-red-700'
                        : row.priority === 'high'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-gray-100 text-gray-600'
                    ]"
                  >
                    {{ row.priority === 'urgent' ? '紧急' : row.priority === 'high' ? '高' : '普通' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 底部按钮：V1.1 风格 p-4 border-t border-gray-200 + Upload icon + "确认导入 ({n})" 文案 -->
    <template #footer>
      <div class="flex justify-end gap-3 px-4 py-4 -mx-6 -mb-4 border-t border-gray-200">
        <el-button size="small" @click="handleClose">
          <X :size="14" class="mr-1" />取消
        </el-button>
        <el-button
          type="primary"
          size="small"
          :disabled="importData.length === 0"
          @click="handleConfirm"
        >
          <Upload :size="14" class="mr-1" />
          确认导入
          <template v-if="importData.length > 0">({{ importData.length }})</template>
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue'
import { Upload, X } from 'lucide-vue-next'
import { showAlert } from '@/lib/dialogService'

// ============================================
// 农事操作类型（与 V1.1 FARM_OPERATION_TYPES 保持一致）
// ============================================
const FARM_OPERATION_TYPES = [
  { value: 'planting', label: '定植' },
  { value: 'irrigation', label: '灌溉' },
  { value: 'fertilization', label: '施肥' },
  { value: 'pest_control', label: '病虫害防治' },
  { value: 'pruning', label: '修剪' },
  { value: 'harvest', label: '采收' },
  { value: 'weeding', label: '中耕除草' },
  { value: 'other', label: '其他' },
]

// ============================================
// Props
// ============================================
const props = defineProps({
  isOpen: { type: Boolean, default: false },
})

const emit = defineEmits(['close', 'import'])

// ============================================
// 状态
// ============================================
const fileInputRef = ref(null)
const importFile = ref(null)
const importPreview = ref([])
const importData = ref([])

// ============================================
// CSV 解析（与 V1.1 parseCSV 1:1）
// ============================================
const parseCSV = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result || ''
        const lines = text.split('\n').filter((line) => line.trim())
        if (lines.length < 2) {
          reject(new Error('文件内容为空或格式不正确'))
          return
        }
        // V1.1: 解析表头（保留以备后用）
        // const headers = lines[0].split(',').map(h => h.trim())
        const data = []
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map((v) => v.trim())
          if (values.length >= 7) {
            const typeValue = values[0].toLowerCase()
            const taskType = FARM_OPERATION_TYPES.find(
              (t) => t.value === typeValue || t.label === values[0]
            )
            data.push({
              type: taskType?.value || typeValue || 'irrigation',
              typeLabel: taskType?.label || values[0] || '灌溉',
              field: values[1] || '',
              crop: values[2] || '',
              assignee: values[3] || '',
              planStart: values[4] || '',
              planEnd: values[5] || '',
              priority: values[6] || 'normal',
            })
          }
        }
        resolve(data)
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsText(file)
  })
}

// ============================================
// 事件处理
// ============================================
const openFilePicker = () => {
  fileInputRef.value?.click()
}

const processFile = async (file) => {
  const fileExt = file.name.split('.').pop()?.toLowerCase()
  if (fileExt !== 'csv' && fileExt !== 'xlsx') {
    showAlert('请上传 CSV 或 XLSX 格式的文件')
    return
  }
  importFile.value = file
  try {
    const data = await parseCSV(file)
    importData.value = data
    importPreview.value = data.slice(0, 5)
  } catch (e) {
    showAlert('文件解析失败：请确保CSV格式正确，包含正确的表头和数据')
    importFile.value = null
    importPreview.value = []
    importData.value = []
  }
}

const handleFileChange = async (e) => {
  const file = e.target?.files?.[0]
  if (!file) return
  await processFile(file)
}

const handleFileDrop = async (e) => {
  const file = e.dataTransfer?.files?.[0]
  if (!file) return
  await processFile(file)
}

const handleConfirm = () => {
  if (importData.value.length === 0) {
    showAlert('没有可导入的数据')
    return
  }
  emit('import', importData.value)
  handleClose()
}

const handleClose = () => {
  importFile.value = null
  importPreview.value = []
  importData.value = []
  emit('close')
}
</script>

<style scoped>
.batch-import-dialog :deep(.el-dialog__header) {
  border-bottom: 1px solid #f3f4f6;
  margin-right: 0;
  padding: 0;
}
</style>
