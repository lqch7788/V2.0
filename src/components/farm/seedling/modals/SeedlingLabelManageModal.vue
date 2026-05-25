<template>
  <!-- 育苗标签管理弹窗 -->
  <div v-if="visible" class="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center">
    <div class="bg-white rounded-xl w-full max-w-6xl shadow-xl max-h-[85vh] flex flex-col">
      <!-- 标题栏 -->
      <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 rounded-t-xl flex-shrink-0">
        <h3 class="text-lg font-semibold text-white">
          育苗标签管理 - {{ seedlingCode }}
        </h3>
        <el-button circle text @click="handleClose" class="!text-white hover:!bg-white/20">
          <el-icon :size="20"><Close /></el-icon>
        </el-button>
      </div>

      <!-- 工具栏: 搜索 + 导出 -->
      <div class="px-4 py-3 border-b border-gray-100 flex-shrink-0 flex items-center justify-between">
        <el-input
          v-model="searchText"
          placeholder="搜索标签编号..."
          clearable
          class="w-64"
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <div class="flex items-center gap-2">
          <span class="text-xs text-gray-400">导出:</span>
          <el-button size="small" @click="handleExport(1000)">
            <el-icon style="color: inherit;"><Download /></el-icon>
            1000条
          </el-button>
          <el-button size="small" @click="handleExport(2000)">
            <el-icon style="color: inherit;"><Download /></el-icon>
            2000条
          </el-button>
          <el-button size="small" @click="handleExport(0)">
            <el-icon style="color: inherit;"><Download /></el-icon>
            全部
          </el-button>
        </div>
      </div>

      <!-- 主体：左侧标签列表 + 右侧履历时间线 -->
      <div class="flex-1 overflow-hidden flex">
        <!-- 左侧：标签列表 -->
        <div class="w-2/5 border-r border-gray-200 overflow-y-auto">
          <el-table
            :data="paginatedLabels"
            :loading="plantLabelStore.labelsLoading"
            @row-click="handleSelectLabel"
            :header-cell-style="{ background: '#f5f5f5', color: '#333', fontWeight: '600' }"
            :row-class-name="getRowClassName"
            class="cursor-pointer"
          >
            <el-table-column prop="label_number" label="标签编号" min-width="120">
              <template #default="{ row }">
                <span class="font-mono text-xs">{{ row.label_number }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="move_in_area_name" label="移入位置" min-width="100">
              <template #default="{ row }">
                {{ row.move_in_area_name || '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="move_in_date" label="移入日期" min-width="100">
              <template #default="{ row }">
                {{ row.move_in_date || '-' }}
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div v-if="totalPages > 1" class="flex justify-center p-3 border-t">
            <el-pagination
              v-model:current-page="labelPage"
              :page-size="20"
              :total="filteredLabels.length"
              layout="prev, pager, next"
              @current-change="handlePageChange"
            />
          </div>
        </div>

        <!-- 右侧：标签履历时间线 -->
        <div class="w-3/5 overflow-y-auto p-4">
          <div v-if="selectedLabelId === null" class="flex flex-col items-center justify-center py-12 text-gray-400">
            <el-icon :size="48" class="mb-3 text-gray-300"><PriceTag /></el-icon>
            <p>请在左侧选择一个标签查看履历</p>
          </div>
          <div v-else-if="plantLabelStore.resumeLoading" class="flex items-center justify-center py-12">
            <el-icon class="is-loading text-emerald-500" :size="32"><Loading /></el-icon>
          </div>
          <div v-else class="space-y-3">
            <div v-if="selectedResumes.length === 0" class="text-center text-gray-400 py-8">
              暂无履历记录
            </div>
            <div v-else>
              <div
                v-for="(resume, index) in selectedResumes"
                :key="resume.id"
                class="relative pl-6 pb-4"
              >
                <!-- 时间线连接线 -->
                <div
                  v-if="index < selectedResumes.length - 1"
                  class="absolute left-2 top-6 bottom-0 w-0.5 bg-emerald-200"
                ></div>
                <!-- 时间点 -->
                <div class="absolute left-0 top-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white"></div>
                <!-- 内容 -->
                <div class="bg-gray-50 rounded-lg p-3">
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-sm font-medium text-emerald-700">
                      {{ getOperationTypeName(resume.operation_type) }}
                    </span>
                    <span class="text-xs text-gray-400">{{ resume.operation_date }}</span>
                  </div>
                  <div class="text-xs text-gray-600 space-y-1">
                    <div v-if="resume.from_area_name">移出区域: {{ resume.from_area_name }}</div>
                    <div v-if="resume.to_area_name">移入区域: {{ resume.to_area_name }}</div>
                    <div v-if="resume.operator_name">操作人: {{ resume.operator_name }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部 -->
      <div class="px-6 py-4 border-t border-gray-200 flex justify-between items-center flex-shrink-0">
        <span class="text-xs text-gray-400">
          共 {{ filteredLabels.length }} 个标签
        </span>
        <el-button size="small" @click="handleClose">关闭</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Close, Search, Download, PriceTag, Loading } from '@element-plus/icons-vue'
import { usePlantLabelStore } from '@/stores'
import { ElMessage } from 'element-plus'

const props = defineProps({
  visible: Boolean,
  seedlingId: String,
  seedlingCode: String
})

const emit = defineEmits(['update:visible'])

// 引入 Store
const plantLabelStore = usePlantLabelStore()

const searchText = ref('')
const labelPage = ref(1)
const selectedLabelId = ref(null)

const PAGE_SIZE = 20

// 筛选与该育苗相关的标签（使用 store 中的数据）
const filteredLabels = computed(() => {
  let result = plantLabelStore.labels.filter(l => String(l.seedling_id) === String(props.seedlingId))
  if (searchText.value) {
    result = result.filter(l =>
      l.label_number.toLowerCase().includes(searchText.value.toLowerCase())
    )
  }
  return result
})

// 分页
const paginatedLabels = computed(() => {
  const start = (labelPage.value - 1) * PAGE_SIZE
  return filteredLabels.value.slice(start, start + PAGE_SIZE)
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredLabels.value.length / PAGE_SIZE)))

// 选中标签的履历
const selectedResumes = computed(() => {
  if (selectedLabelId.value === null) return []
  return plantLabelStore.resumeMap[selectedLabelId.value] || []
})

// 获取操作类型名称
const getOperationTypeName = (type) => {
  const map = {
    'move_in': '移入',
    'move_out': '移出',
    'mark': '标记',
    'seedling_in': '育苗入场',
    'transplant': '定植',
    'batch_change': '批次变更',
    'label_print': '标签打印'
  }
  return map[type] || type || '未知操作'
}

// 加载标签数据
const loadLabels = async () => {
  try {
    await plantLabelStore.loadLabels({ seedling_id: props.seedlingId })
  } catch (error) {
    console.error('获取标签数据失败:', error)
  }
}

// 选择标签时加载履历
const handleSelectLabel = async (row) => {
  selectedLabelId.value = row.id
  await plantLabelStore.loadResumesForLabels([row.id])
}

// 获取表格行类名（选中高亮）
const getRowClassName = ({ row }) => {
  return selectedLabelId.value === row.id ? 'bg-emerald-50 border-l-2 border-l-emerald-500' : ''
}

// 搜索
const handleSearch = () => {
  labelPage.value = 1
}

// 分页变化
const handlePageChange = (page) => {
  labelPage.value = page
}

// 导出
const handleExport = (size) => {
  const toExport = size === 0 ? filteredLabels.value : filteredLabels.value.slice(0, size)
  if (toExport.length === 0) {
    ElMessage.warning('无数据可导出')
    return
  }

  const headers = ['标签编号', '移入位置', '移入日期', '移出位置', '移出日期', '创建时间']
  const rows = toExport.map(l => [
    l.label_number,
    l.move_in_area_name || '',
    l.move_in_date || '',
    l.move_out_area_name || '',
    l.move_out_date || '',
    l.create_time || ''
  ])

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>育苗标签数据</title>
<style>table{border-collapse:collapse}th,td{border:1px solid #999;padding:6px 10px}th{background:#059669;color:#fff}</style>
</head><body><table><thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
<tbody>${rows.map(r => `<tr>${r.map(v => `<td>${v}</td>`).join('')}</tr>`).join('')}</tbody></table></body></html>`

  const blob = new Blob(['﻿' + html], { type: 'application/vnd.ms-excel;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `育苗标签_${props.seedlingCode}_${new Date().toISOString().slice(0, 10)}.xls`
  a.click()
  URL.revokeObjectURL(url)
}

const handleClose = () => {
  emit('update:visible', false)
}

watch(() => props.visible, (val) => {
  if (val && props.seedlingId) {
    loadLabels()
    selectedLabelId.value = null
    searchText.value = ''
    labelPage.value = 1
  }
})
</script>
