<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <!-- 表格工具栏 -->
    <div class="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
      <h3 class="text-lg font-semibold text-gray-900">育苗列表</h3>

      <div class="flex items-center gap-2">
        <!-- 导出模式 -->
        <template v-if="exportMode">
          <span class="text-sm text-gray-500 mr-2">已选择 {{ selectedRows.length }} 项</span>
          <button
            class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
            :disabled="selectedRows.length === 0"
            @click="$emit('confirmExport')"
          >
            <Download class="w-4 h-4" />
            确认导出
          </button>
          <button
            class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-900 hover:bg-gray-200"
            @click="handleExportCancel"
          >
            取消
          </button>
        </template>

        <!-- 编辑模式 -->
        <template v-else-if="operationMode === 'edit'">
          <span class="text-sm text-gray-500 mr-2">请在表格中选择一条记录</span>
          <button
            class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            :disabled="selectedRows.length === 0"
            @click="handleConfirmEdit"
          >
            <Edit2 class="w-4 h-4" />
            确认编辑
          </button>
          <button
            class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-900 hover:bg-gray-200"
            @click="handleCancelOperation"
          >
            取消
          </button>
        </template>

        <!-- 删除模式 -->
        <template v-else-if="operationMode === 'delete'">
          <span class="text-sm text-gray-500 mr-2">已选择 {{ selectedRows.length }} 项</span>
          <button
            class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
            :disabled="selectedRows.length === 0"
            @click="handleConfirmDelete"
          >
            <Trash2 class="w-4 h-4" />
            确认删除
          </button>
          <button
            class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-900 hover:bg-gray-200"
            @click="handleCancelOperation"
          >
            取消
          </button>
        </template>

        <!-- 打印模式 -->
        <template v-else-if="printMode">
          <span class="text-sm text-gray-500 mr-2">已选择 {{ selectedRows.length }} 项</span>
          <button
            class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
            :disabled="selectedRows.length === 0"
            @click="handleConfirmPrint"
          >
            <Printer class="w-4 h-4" />
            确认打印
          </button>
          <button
            class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-900 hover:bg-gray-200"
            @click="handleCancelPrint"
          >
            取消
          </button>
        </template>

        <!-- 正常模式 -->
        <template v-else>
          <button
            v-if="canCreate"
            class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
            @click="$emit('add')"
          >
            <Plus class="w-4 h-4" />
            新增
          </button>
          <button
            v-if="canEdit"
            class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
            @click="() => props.onOperationModeChange?.('edit')"
          >
            <Edit2 class="w-4 h-4" />
            编辑
          </button>
          <button
            v-if="canDelete"
            class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-red-600 text-white hover:bg-red-700"
            @click="() => props.onOperationModeChange?.('delete')"
          >
            <Trash2 class="w-4 h-4" />
            删除
          </button>
          <button
            v-if="canExport"
            class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
            @click="() => props.onOperationModeChange?.('export')"
          >
            <Download class="w-4 h-4" />
            导出
          </button>
          <button
            v-if="canPrint"
            class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-purple-600 text-white hover:bg-purple-700"
            @click="() => props.onPrintModeChange?.(true)"
          >
            <Printer class="w-4 h-4" />
            标签打印
          </button>
        </template>
      </div>
    </div>

    <!-- 表格 -->
    <div class="overflow-x-auto overflow-y-auto max-h-[calc(100vh-380px)]">
      <table class="min-w-[1600px] w-full table-fixed">
        <colgroup>
          <col v-if="showCheckbox" class="w-12" />
          <col class="w-44" />
          <col class="w-36" />
          <col class="w-52" />
          <col class="w-36" />
          <col class="w-28" />
          <col class="w-52" />
          <col class="w-28" />
          <col class="w-16" />
          <col class="w-20" />
          <col class="w-20" />
          <col class="w-20" />
          <col class="w-16" />
          <col class="w-40" />
        </colgroup>
        <thead class="bg-gradient-to-r from-blue-500 to-blue-600 text-white sticky top-0 z-10">
          <tr>
            <th v-if="showCheckbox" class="px-4 py-3 text-center text-sm font-semibold text-white whitespace-nowrap w-12">
              <el-checkbox
                :model-value="selectedRows.length === data.length && data.length > 0"
                class="seed-checkbox"
                @change="onSelectAllChange"
              />
            </th>
            <th class="px-4 py-3 text-left text-sm font-semibold text-white whitespace-nowrap w-44">育苗批号</th>
            <th class="px-4 py-3 text-left text-sm font-semibold text-white whitespace-nowrap w-36">关联生产计划</th>
            <th class="px-4 py-3 text-left text-sm font-semibold text-white whitespace-nowrap w-52">关联种源</th>
            <th class="px-4 py-3 text-left text-sm font-semibold text-white whitespace-nowrap w-36">作物编码</th>
            <th class="px-4 py-3 text-left text-sm font-semibold text-white whitespace-nowrap w-28">作物品种</th>
            <th class="px-4 py-3 text-left text-sm font-semibold text-white whitespace-nowrap w-52">品种路径</th>
            <th class="px-4 py-3 text-left text-sm font-semibold text-white whitespace-nowrap w-28">场地</th>
            <th class="px-4 py-3 text-left text-sm font-semibold text-white whitespace-nowrap w-16">成苗率</th>
            <th class="px-4 py-3 text-left text-sm font-semibold text-white whitespace-nowrap w-20">入库数量</th>
            <th class="px-4 py-3 text-left text-sm font-semibold text-white whitespace-nowrap w-20">剩余总数</th>
            <th class="px-4 py-3 text-left text-sm font-semibold text-white whitespace-nowrap w-20">完成比例</th>
            <th class="px-4 py-3 text-left text-sm font-semibold text-white whitespace-nowrap w-16">状态</th>
            <th class="px-4 py-3 text-left text-sm font-semibold text-white whitespace-nowrap w-40">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-300">
          <tr v-if="paginatedData.length === 0">
            <td :colspan="showCheckbox ? 14 : 13" class="px-4 py-8 text-center text-gray-500">
              暂无数据
            </td>
          </tr>
          <tr
            v-for="record in paginatedData"
            :key="record.id"
            class="hover:bg-emerald-50 transition-colors"
          >
            <td v-if="showCheckbox" class="px-4 py-3 text-center w-12">
              <el-checkbox
                :model-value="selectedRows.includes(record.id)"
                class="seed-checkbox"
                @change="(val) => handleSelectChange(record.id, val)"
              />
            </td>
            <td class="px-4 py-3 text-sm w-44 whitespace-nowrap">
              <button class="text-sm text-blue-600 hover:text-blue-800 hover:underline" title="点击查看详情" @click="$emit('detail', record)">
                {{ record.seedlingCode }}
              </button>
            </td>
            <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap w-36 truncate">
              <span v-if="record.productionPlanCode" class="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-xs font-medium">
                {{ record.productionPlanCode }}
              </span>
              <span v-else>-</span>
            </td>
            <td class="px-4 py-3 text-sm text-gray-700 whitespace-nowrap w-52">{{ record.sourceCode }}</td>
            <td class="px-4 py-3 text-sm w-36 whitespace-nowrap">
              <span class="font-mono text-orange-600">{{ record.cropCode || '-' }}</span>
            </td>
            <td class="px-4 py-3 text-sm text-gray-900 truncate w-28" :title="record.cropVariety || record.cropName">
              {{ getCropVarietyName(record) }}
            </td>
            <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis w-52" v-html="getCropVarietyPath(record)">
            </td>
            <td class="px-4 py-3 text-sm text-gray-700 whitespace-nowrap w-28">{{ record.siteName }}</td>
            <td class="px-4 py-3 text-sm text-emerald-600 font-medium w-16">{{ record.survivalRate }}%</td>
            <td class="px-4 py-3 text-sm text-blue-600 font-medium w-20">
              {{ (record.survivalCount || 0).toLocaleString() }}
            </td>
            <td class="px-4 py-3 text-sm text-purple-600 font-medium w-20">
              {{ (record.initialCount - record.lossCount).toLocaleString() }}
            </td>
            <td class="px-4 py-3 text-sm whitespace-nowrap w-20">
              <span v-if="record.targetSurvivalCount > 0" :class="getCompletionRateClass(record)">
                {{ Math.round((record.survivalCount || 0) / record.targetSurvivalCount * 100) }}%
              </span>
              <span v-else class="text-gray-400">-</span>
            </td>
            <td class="px-4 py-3 text-sm w-16">
              <el-tag :type="getStatusType(record.status)" size="small">
                {{ getStatusLabel(record.status) }}
              </el-tag>
            </td>
            <td class="px-4 py-3 w-40 whitespace-nowrap">
              <div class="flex items-center gap-1">
                <button class="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="每日记录" @click="$emit('dailyRecord', record)">
                  <Calendar class="w-4 h-4" />
                </button>
                <button
                  v-if="record.status === 'transplant_ready'"
                  class="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                  @click="$emit('transplant', record)"
                  title="定植操作"
                >
                  <RotateCw class="w-4 h-4" />
                </button>
                <button class="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-colors" title="打印标签" @click="$emit('print', record)">
                  <Printer class="w-4 h-4" />
                </button>
                <button class="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:text-amber-600 hover:bg-amber-50 transition-colors" title="标签管理" @click="$emit('labelManage', record)">
                  <Tags class="w-4 h-4" />
                </button>
                <button
                  v-if="record.pictures && record.pictures.length > 0"
                  class="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  @click="$emit('imageClick', record.pictures)"
                  title="查看图片"
                >
                  <Image class="w-4 h-4" />
                </button>
                <button class="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:text-green-600 hover:bg-green-50 transition-colors" title="正常结束" @click="$emit('end', record, 'normal')">
                  <CircleCheck class="w-4 h-4" />
                </button>
                <button class="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors" title="异常结束" @click="$emit('end', record, 'abnormal')">
                  <XCircle class="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分页 -->
    <div class="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-100 rounded-b-xl">
      <!-- 操作模式下显示选择状态和全选按钮 -->
      <div class="flex items-center gap-4" v-if="showCheckbox">
        <el-button link type="primary" size="small" @click="handleSelectAll">
          {{ selectedRows.length === data.length ? '全不选' : '全选' }}
        </el-button>
        <span class="text-sm text-gray-500">已选择 {{ selectedRows.length }} 项</span>
      </div>
      <div v-else></div>
      <el-pagination
        v-model:current-page="internalCurrentPage"
        v-model:page-size="internalPageSize"
        :page-sizes="[10, 20, 50]"
        :total="data.length"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Plus, Download, Calendar, RotateCw, Printer, Image, CircleCheck, XCircle,
  Edit2, Trash2, Tags, X
} from 'lucide-vue-next'

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  pagination: {
    type: Object,
    default: () => ({ current: 1, pageSize: 10 })
  },
  selectedRows: {
    type: Array,
    default: () => []
  },
  loading: Boolean,
  // 操作模式状态
  operationMode: {
    type: String,
    default: 'normal' // 'normal' | 'edit' | 'delete' | 'export' | 'print'
  },
  onOperationModeChange: Function,
  // 导出模式
  exportMode: Boolean,
  onExportSelectAll: Function,
  onExportCancel: Function,
  // 打印模式
  printMode: Boolean,
  onPrintModeChange: Function,
  onConfirmPrint: Function,
  // 权限控制
  canCreate: Boolean,
  canEdit: Boolean,
  canDelete: Boolean,
  canExport: Boolean,
  canPrint: Boolean
})

// 品种数据缓存
const varietyCache = ref(new Map())

// 加载品种数据
const loadVarieties = async () => {
  try {
    const { getAllVarieties } = await import('@/services/apiCropVarietyService')
    const varieties = await getAllVarieties()
    const cache = new Map()
    varieties.forEach(v => {
      const key1 = v.subVariety1Name || ''
      if (key1 && !cache.has(key1)) {
        cache.set(key1, v)
      }
      const key2 = v.varietyName || ''
      if (key2 && !cache.has(key2)) {
        cache.set(key2, v)
      }
      const key3 = v.cropCode || ''
      if (key3 && !cache.has(key3)) {
        cache.set(key3, v)
      }
    })
    varietyCache.value = cache
  } catch (error) {
    console.error('获取品种数据失败:', error)
  }
}

onMounted(() => {
  loadVarieties()
})

const emit = defineEmits([
  'selectionChange', 'pageChange', 'sizeChange', 'add', 'edit', 'delete',
  'detail', 'export', 'print', 'confirmExport', 'cancelExport',
  'dailyRecord', 'transplant', 'labelManage', 'imageClick', 'end'
])

// 是否显示复选框列（编辑、删除、导出、打印模式下显示）
const showCheckbox = computed(() => {
  return props.operationMode !== 'normal' || props.exportMode || props.printMode
})

// 获取选中的第一条记录
const getFirstSelectedRecord = () => {
  if (props.selectedRows.length === 0) return null
  return props.data.find(r => r.id === props.selectedRows[0]) || null
}

// 确认编辑
const handleConfirmEdit = () => {
  const record = getFirstSelectedRecord()
  if (!record) {
    ElMessage.warning('请先在表格中选择一条记录')
    return
  }
  emit('edit', record) // 触发编辑事件
  props.onOperationModeChange?.('normal')
  emit('selectionChange', [])
}

// 确认删除
const handleConfirmDelete = () => {
  if (props.selectedRows.length === 0) {
    ElMessage.warning('请先选择要删除的记录')
    return
  }
  emit('delete', props.selectedRows)
  props.onOperationModeChange?.('normal')
  emit('selectionChange', [])
}

// 取消操作
const handleCancelOperation = () => {
  props.onOperationModeChange?.('normal')
  emit('selectionChange', [])
}

// 确认导出
const handleExportCancel = () => {
  props.onOperationModeChange?.('normal')
  emit('cancelExport')
  emit('selectionChange', [])
}

// 确认打印
const handleConfirmPrint = () => {
  if (props.selectedRows.length === 0) {
    ElMessage.warning('请先选择要打印的记录')
    return
  }
  const selectedRecords = props.data.filter(item => props.selectedRows.includes(item.id))
  props.onConfirmPrint?.(selectedRecords)
  props.onPrintModeChange?.(false)
  emit('selectionChange', [])
}

// 取消打印
const handleCancelPrint = () => {
  props.onPrintModeChange?.(false)
  emit('selectionChange', [])
}

// 内部分页状态
const internalCurrentPage = ref(1)
const internalPageSize = ref(10)

// 监听 props.pagination 变化
watch(() => props.pagination, (newVal) => {
  if (newVal) {
    internalCurrentPage.value = newVal.current || 1
    internalPageSize.value = newVal.pageSize || 10
  }
}, { immediate: true, deep: true })

// 分页后的数据
const paginatedData = computed(() => {
  const start = (internalCurrentPage.value - 1) * internalPageSize.value
  const end = start + internalPageSize.value
  return props.data.slice(start, end)
})

// 处理选择变化
const handleSelectChange = (id, checked) => {
  let newSelectedRows = [...props.selectedRows]
  if (checked) {
    if (!newSelectedRows.includes(id)) {
      newSelectedRows.push(id)
    }
  } else {
    newSelectedRows = newSelectedRows.filter(rowId => rowId !== id)
  }
  emit('selectionChange', newSelectedRows)
}

// 全选/取消全选
const handleSelectAll = () => {
  if (props.selectedRows.length === props.data.length) {
    emit('selectionChange', [])
  } else {
    emit('selectionChange', props.data.map(item => item.id))
  }
}

// 同步全选状态变化（用于表头复选框）
const onSelectAllChange = (checked) => {
  if (checked) {
    emit('selectionChange', props.data.map(item => item.id))
  } else {
    emit('selectionChange', [])
  }
}

// 右上角打印按钮点击处理 - 获取选中的第一条记录
const handlePrintClick = () => {
  if (props.selectedRows.length > 0) {
    const firstSelectedId = props.selectedRows[0]
    const record = props.data.find(item => item.id === firstSelectedId)
    if (record) {
      emit('print', record)
    }
  }
}

// 分页处理
const handlePageChange = (page) => {
  internalCurrentPage.value = page
  emit('pageChange', page)
}

const handleSizeChange = (size) => {
  internalPageSize.value = size
  internalCurrentPage.value = 1
  emit('sizeChange', size)
}

// 获取状态标签
const getStatusLabel = (status) => {
  const map = {
    'in_progress': '进行中',
    'transplant_ready': '待定植',
    'completed': '已完成',
    'abnormal': '异常'
  }
  return map[status] || status
}

// 获取状态类型
const getStatusType = (status) => {
  const map = {
    'in_progress': 'primary',
    'transplant_ready': 'warning',
    'completed': 'success',
    'abnormal': 'danger'
  }
  return map[status] || 'info'
}

// 根据 cropCode 或 cropName 获取品种信息
const getVarietyByCodeOrName = (cropCode, cropName) => {
  if (!varietyCache.value || varietyCache.value.size === 0) {
    return null
  }
  if (cropCode) {
    const variety = varietyCache.value.get(cropCode)
    if (variety) return variety
    if (cropCode.length >= 9) {
      const prefix9 = cropCode.substring(0, 9)
      for (const [key, v] of varietyCache.value.entries()) {
        const keySub = key.substring(0, Math.min(9, key.length))
        if (key.startsWith(prefix9) || prefix9.startsWith(keySub)) {
          return v
        }
      }
    }
  }
  if (cropName) {
    const variety = varietyCache.value.get(cropName)
    if (variety) return variety
    for (const [key, v] of varietyCache.value.entries()) {
      if (key === cropName || v.varietyName === cropName || v.subVariety1Name === cropName) {
        return v
      }
    }
  }
  return null
}

// 获取作物品种（最细分）
const getCropVarietyName = (record) => {
  if (record.subVarietyName) {
    return record.subVarietyName
  }
  if (record.varietyName) {
    return record.varietyName
  }
  const variety = getVarietyByCodeOrName(record.cropCode, record.cropName)
  if (variety) {
    return variety.subVariety1Name || variety.varietyName || record.cropVariety || ''
  }
  return record.cropVariety || record.cropName || ''
}

// 获取品种路径
const getCropVarietyPath = (record) => {
  // 优先使用后端直接返回的品种路径字段
  if (record.categoryName || record.typeName || record.varietyName) {
    const parts = []
    if (record.categoryName) parts.push(`<span class="text-gray-400">${record.categoryName}</span>`)
    if (record.typeName) parts.push(`<span class="text-gray-400 mx-0.5">-</span><span class="text-gray-700">${record.typeName}</span>`)
    if (record.varietyName) parts.push(`<span class="text-gray-400 mx-0.5">-</span><span class="text-gray-700">${record.varietyName}</span>`)
    if (record.subVarietyName) parts.push(`<span class="text-gray-400 mx-0.5">-</span><span class="text-gray-900 font-medium">${record.subVarietyName}</span>`)
    else if (record.cropName) parts.push(`<span class="text-gray-400 mx-0.5">-</span><span class="text-gray-900 font-medium">${record.cropName}</span>`)
    return parts.join('')
  }
  // 如果后端没有返回品种路径，则通过 cropCode 或 cropName 查询品种库
  const variety = getVarietyByCodeOrName(record.cropCode, record.cropName)
  if (variety && variety.categoryName) {
    const parts = []
    if (variety.categoryName) parts.push(`<span class="text-gray-400">${variety.categoryName}</span>`)
    if (variety.typeName) parts.push(`<span class="text-gray-400 mx-0.5">-</span><span class="text-gray-700">${variety.typeName}</span>`)
    if (variety.varietyName) parts.push(`<span class="text-gray-400 mx-0.5">-</span><span class="text-gray-700">${variety.varietyName}</span>`)
    if (variety.subVariety1Name) parts.push(`<span class="text-gray-400 mx-0.5">-</span><span class="text-gray-900 font-medium">${variety.subVariety1Name}</span>`)
    return parts.join('')
  }
  return record.cropVariety || '-'
}

// 获取完成比例样式
const getCompletionRateClass = (record) => {
  // targetSurvivalCount 可能不存在，使用 initialCount 作为备选
  const target = record.targetSurvivalCount || record.initialCount || 0
  if (target === 0) return 'text-gray-400'
  const rate = (record.survivalCount || 0) / target
  if (rate >= 0.8) return 'text-green-600 font-medium'
  if (rate >= 0.5) return 'text-amber-600 font-medium'
  return 'text-red-600 font-medium'
}
</script>

<style scoped>
/* 加深复选框默认边框颜色 */
:deep(.seed-checkbox .el-checkbox__inner) {
  border-color: #374151;
}

:deep(.seed-checkbox:hover .el-checkbox__inner) {
  border-color: #059669;
}
</style>
