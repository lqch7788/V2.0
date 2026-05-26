<template>
  <el-dialog
    :model-value="isOpen"
    title=""
    width="800px"
    :close-on-click-modal="false"
    @close="handleClose"
    class="batch-import-dialog"
  >
    <!-- 头部 -->
    <template #header>
      <div class="flex items-center gap-3">
        <el-icon :size="20" color="#059669">
          <UploadFilled />
        </el-icon>
        <span class="text-lg font-semibold text-gray-900">批量导入任务</span>
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
            : 'border-gray-400 hover:border-gray-500'
        ]"
      >
        <input
          ref="fileInputRef"
          type="file"
          accept=".csv,.xlsx"
          class="hidden"
          @change="handleFileChange"
        />
        <label :class="{ 'cursor-pointer': true }" @click="openFilePicker">
          <template v-if="importFile">
            <el-icon :size="40" color="#059669" class="mx-auto mb-2">
              <UploadFilled />
            </el-icon>
            <p class="font-medium text-gray-900">{{ importFile.name }}</p>
            <p class="text-sm text-gray-500 mt-1">点击或拖拽文件到此处重新上传</p>
          </template>
          <template v-else>
            <el-icon :size="40" color="#909399" class="mx-auto mb-2">
              <UploadFilled />
            </el-icon>
            <p class="font-medium text-gray-900">点击上传或拖拽文件到此处</p>
            <p class="text-sm text-gray-500 mt-1">支持 CSV、XLSX 格式文件</p>
          </template>
        </label>
      </div>

      <!-- CSV格式说明（未选文件时显示） -->
      <div v-if="!importFile" class="bg-gray-50 rounded-lg p-4">
        <h4 class="font-medium text-gray-700 mb-2">CSV文件格式要求</h4>
        <p class="text-sm text-gray-600 mb-2">
          请确保CSV文件包含以下列（按顺序）：
        </p>
        <code class="text-xs bg-white px-2 py-1 rounded border border-gray-200">
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
          <el-table
            :data="importPreview"
            stripe
            size="small"
            style="width: 100%"
          >
            <el-table-column prop="typeLabel" label="任务类型" width="100" />
            <el-table-column prop="field" label="任务区域" width="100" />
            <el-table-column prop="crop" label="作物" width="80" />
            <el-table-column prop="assignee" label="执行人" width="90" />
            <el-table-column label="计划开始时间" width="120">
              <template #default="{ row }">
                {{ (row.planStart || '').split(' ')[0] || '-' }}
              </template>
            </el-table-column>
            <el-table-column label="任务工时" width="110">
              <template #default="{ row }">
                {{ row.estimatedDays || 0 }}天{{ row.estimatedHours || 0 }}小时
              </template>
            </el-table-column>
            <el-table-column label="优先级" width="80">
              <template #default="{ row }">
                <el-tag
                  :type="row.priority === 'urgent' ? 'danger' : row.priority === 'high' ? 'warning' : 'info'"
                  size="small"
                >
                  {{ row.priority === 'urgent' ? '紧急' : row.priority === 'high' ? '高' : '普通' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>

    <!-- 底部按钮 -->
    <template #footer>
      <div class="flex justify-end gap-3">
        <el-button @click="handleClose">取消</el-button>
        <el-button
          type="primary"
          :disabled="importData.length === 0"
          @click="handleConfirm"
        >
          确认导入
          <template v-if="importData.length > 0">({{ importData.length }})</template>
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
/**
 * 批量导入任务弹窗组件
 * 支持 CSV/XLSX 文件上传、预览和批量导入
 */
import { ref } from 'vue'
import { UploadFilled } from '@element-plus/icons-vue'
import { showAlert } from '@/lib/dialogService'

// 农事操作类型（与 V1.1 FARM_OPERATION_TYPES 保持一致）
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

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  onClose: { type: Function, default: () => {} },
  onImport: { type: Function, default: () => {} },
})

const fileInputRef = ref(null)
const importFile = ref(null)
const importPreview = ref([])
const importData = ref([])

// 解析CSV文件
const parseCSV = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result || ''
        const lines = text.split('\n').filter(line => line.trim())
        if (lines.length < 2) {
          reject(new Error('文件内容为空或格式不正确'))
          return
        }

        // 解析表头（CSV文件包含表头行，这里也解析但不使用）
        const data = []
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim())
          if (values.length >= 7) {
            const typeValue = values[0].toLowerCase()
            const taskType = FARM_OPERATION_TYPES.find(
              t => t.value === typeValue || t.label === values[0]
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

// 打开文件选择器
const openFilePicker = () => {
  fileInputRef.value?.click()
}

// 处理文件选择
const handleFileChange = async (e) => {
  const file = e.target?.files?.[0]
  if (!file) return
  await processFile(file)
}

// 处理文件拖拽
const handleFileDrop = async (e) => {
  const file = e.dataTransfer?.files?.[0]
  if (!file) return
  await processFile(file)
}

// 处理文件（校验 + 解析）
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
  } catch {
    showAlert('文件解析失败：请确保CSV格式正确，包含正确的表头和数据')
    importFile.value = null
    importPreview.value = []
    importData.value = []
  }
}

// 确认导入
const handleConfirm = () => {
  if (importData.value.length === 0) {
    showAlert('没有可导入的数据')
    return
  }
  props.onImport(importData.value)
  handleClose()
}

// 关闭弹窗并重置
const handleClose = () => {
  importFile.value = null
  importPreview.value = []
  importData.value = []
  props.onClose()
}
</script>

<style scoped>
.batch-import-dialog :deep(.el-dialog__header) {
  border-bottom: 1px solid #f3f4f6;
  margin-right: 0;
}
</style>
