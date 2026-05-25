<template>
  <!-- 种植数据表格组件 - 与V1.1 PlantingTable.tsx完全一致 -->
  <div class="bg-white rounded-xl shadow-sm border border-gray-100">
    <!-- 标题和操作按钮栏 -->
    <div class="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
      <h3 class="text-lg font-semibold text-gray-900">种植作物列表</h3>
      <div class="flex items-center gap-2">
        <!-- 导出模式 -->
        <template v-if="exportMode">
          <span class="text-sm text-gray-500 mr-2">已选择 {{ selectedRows.length }} 项</span>
          <el-button size="small" @click="onExportSelectAll">
            {{ selectedRows.length === data.length ? '全不选' : '全选' }}
          </el-button>
          <el-button type="primary" size="small" :disabled="selectedRows.length === 0" @click="$emit('export-confirm')">
            <el-icon><Download /></el-icon>
            确认导出
          </el-button>
          <el-button size="small" @click="$emit('export-cancel')">取消</el-button>
        </template>

        <!-- 打印模式 -->
        <template v-else-if="printMode">
          <span class="text-sm text-gray-500 mr-2">已选择 {{ selectedRows.length }} 项</span>
          <el-button size="small" @click="onExportSelectAll">
            {{ selectedRows.length === data.length ? '全不选' : '全选' }}
          </el-button>
          <el-button type="primary" size="small" :disabled="selectedRows.length === 0" @click="confirmPrint" class="!bg-purple-600 !border-purple-600 hover:!bg-purple-700">
            <el-icon><Printer /></el-icon>
            确认打印
          </el-button>
          <el-button size="small" @click="$emit('print-cancel')">取消</el-button>
        </template>

        <!-- 编辑模式 -->
        <template v-else-if="operationMode === 'edit'">
          <span class="text-sm text-gray-500 mr-2">请在表格中选择一条记录</span>
          <el-button type="primary" size="small" :disabled="selectedRows.length === 0" @click="executeOperation('edit')">
            <el-icon><Edit /></el-icon>
            确认编辑
          </el-button>
          <el-button size="small" @click="cancelOperation">取消</el-button>
        </template>

        <!-- 删除模式 -->
        <template v-else-if="operationMode === 'delete'">
          <span class="text-sm text-gray-500 mr-2">已选择 {{ selectedRows.length }} 项</span>
          <el-button type="danger" size="small" :disabled="selectedRows.length === 0" @click="executeOperation('delete')">
            <el-icon><Delete /></el-icon>
            确认删除
          </el-button>
          <el-button size="small" @click="cancelOperation">取消</el-button>
        </template>

        <!-- 正常模式 -->
        <template v-else>
          <el-button v-if="canCreate && onAdd" type="primary" size="small" @click="$emit('add')">
            <el-icon><Plus /></el-icon>
            新增
          </el-button>
          <el-button v-if="canEdit" type="primary" size="small" @click="() => $emit('operation-mode-change', 'edit')">
            <el-icon><Edit /></el-icon>
            编辑
          </el-button>
          <el-button v-if="canDelete" type="danger" size="small" @click="() => $emit('operation-mode-change', 'delete')">
            <el-icon><Delete /></el-icon>
            删除
          </el-button>
          <el-button v-if="canExport && onExportClick" type="primary" size="small" @click="$emit('export-click')">
            <el-icon><Download /></el-icon>
            导出
          </el-button>
          <el-button v-if="canPrint" type="primary" size="small" @click="() => $emit('print-mode-change', true)" class="!bg-purple-600 !border-purple-600 hover:!bg-purple-700">
            <el-icon><Printer /></el-icon>
            标签打印
          </el-button>
        </template>
      </div>
    </div>

    <!-- 表格区域 -->
    <div class="overflow-auto max-h-[calc(100vh-380px)]">
      <el-table
        :data="currentData"
        style="min-width: 1900px"
        :header-cell-style="{ background: 'linear-gradient(to right, #3b82f6, #3b82f6)', color: 'white', padding: '12px 16px', fontWeight: '600', whiteSpace: 'nowrap' }"
        :cell-style="{ padding: '12px 16px', whiteSpace: 'nowrap' }"
        @selection-change="handleSelectionChange"
      >
        <!-- 选择列 -->
        <el-table-column v-if="showCheckbox" type="selection" width="50" align="center" />

        <!-- 种植批号 -->
        <el-table-column prop="plantCode" label="种植批号" width="140">
          <template #default="{ row }">
            <span
              class="font-mono text-blue-600 font-semibold cursor-pointer hover:text-blue-800 hover:underline"
              @click="$emit('detail', row)"
              title="点击查看详情"
            >
              {{ row.plantCode }}
            </span>
          </template>
        </el-table-column>

        <!-- 关联生产计划 -->
        <el-table-column prop="productionPlanCode" label="关联生产计划" width="140">
          <template #default="{ row }">
            <span v-if="row.productionPlanCode" class="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-xs font-medium">
              {{ row.productionPlanCode }}
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>

        <!-- 作物编码 -->
        <el-table-column prop="cropCode" label="作物编码" width="120">
          <template #default="{ row }">
            <span class="font-mono text-orange-600">{{ row.cropCode || '-' }}</span>
          </template>
        </el-table-column>

        <!-- 作物品种 -->
        <el-table-column prop="cropName" label="作物品种" width="100">
          <template #default="{ row }">
            {{ row.cropName || '-' }}
          </template>
        </el-table-column>

        <!-- 品种路径 -->
        <el-table-column prop="cropVariety" label="品种路径" width="180">
          <template #default="{ row }">
            {{ row.cropVariety || '-' }}
          </template>
        </el-table-column>

        <!-- 种植区域 -->
        <el-table-column prop="areaName" label="种植区域" width="140" />

        <!-- 种植数量 -->
        <el-table-column prop="plantingCount" label="种植数量" width="100">
          <template #default="{ row }">
            <span class="text-emerald-600 font-medium">{{ (row.plantingCount || 0).toLocaleString() }}</span>
          </template>
        </el-table-column>

        <!-- 种植日期 -->
        <el-table-column prop="plantingDate" label="种植日期" width="120" />

        <!-- 土壤PH -->
        <el-table-column prop="soilPH" label="土壤PH" width="90">
          <template #default="{ row }">
            <span :class="row.soilPH != null && row.soilPH > 0 ? 'text-gray-700 font-mono' : 'text-gray-400'">
              {{ row.soilPH != null && row.soilPH > 0 ? row.soilPH.toFixed(1) : '-' }}
            </span>
          </template>
        </el-table-column>

        <!-- 土壤EC -->
        <el-table-column prop="soilEC" label="土壤EC" width="90">
          <template #default="{ row }">
            <span :class="row.soilEC != null && row.soilEC > 0 ? 'text-gray-700 font-mono' : 'text-gray-400'">
              {{ row.soilEC != null && row.soilEC > 0 ? row.soilEC.toFixed(1) : '-' }}
            </span>
          </template>
        </el-table-column>

        <!-- 损耗率 -->
        <el-table-column prop="attritionRate" label="损耗率" width="85">
          <template #default="{ row }">
            <span v-if="row.attritionRate != null && row.attritionRate > 0" class="text-amber-600 font-medium">
              {{ row.attritionRate.toFixed(1) }}%
            </span>
            <span v-else class="text-gray-400">-</span>
          </template>
        </el-table-column>

        <!-- 已采收 -->
        <el-table-column prop="harvestQuantity" label="已采收" width="100">
          <template #default="{ row }">
            <span class="text-blue-600 font-medium">
              {{ (row.harvestQuantity || 0).toLocaleString() }}{{ row.unit || '' }}
            </span>
          </template>
        </el-table-column>

        <!-- 完成比例 -->
        <el-table-column prop="targetYield" label="完成比例" width="100">
          <template #default="{ row }">
            <template v-if="row.targetYield && row.targetYield !== 0">
              <span
                :class="{
                  'font-medium': true,
                  'text-green-600': (row.harvestQuantity || 0) / row.targetYield >= 0.8,
                  'text-amber-600': (row.harvestQuantity || 0) / row.targetYield >= 0.5 && (row.harvestQuantity || 0) / row.targetYield < 0.8,
                  'text-red-600': (row.harvestQuantity || 0) / row.targetYield < 0.5
                }"
              >
                {{ Math.round((row.harvestQuantity || 0) / row.targetYield * 100) }}%
              </span>
            </template>
            <span v-else class="text-gray-400">-</span>
          </template>
        </el-table-column>

        <!-- 状态 -->
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <span :class="statusMap[row.status]?.class || ''" class="px-2 py-1 rounded text-xs font-medium">
              {{ statusMap[row.status]?.label || row.status }}
            </span>
          </template>
        </el-table-column>

        <!-- 操作列 -->
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <div class="flex gap-1">
              <!-- 采收登记 - 未采收显示 -->
              <el-button
                v-if="!row.isHarvest"
                type="primary"
                link
                :icon="CircleCheck"
                @click="$emit('harvest', row)"
                title="采收登记"
              />

              <!-- 查看图片 -->
              <el-button
                v-if="row.pictures && row.pictures.length > 0"
                type="primary"
                link
                :icon="Picture"
                @click="handleImageClick(row)"
                title="查看图片"
              />

              <!-- 正常结束 -->
              <el-button
                type="primary"
                link
                :icon="CircleCheck"
                @click="$emit('end', row, 'normal')"
                title="正常结束"
              />

              <!-- 异常结束 -->
              <el-button
                type="danger"
                link
                :icon="Close"
                @click="$emit('end', row, 'abnormal')"
                title="异常结束"
              />

              <!-- 标签详情 -->
              <el-button
                v-if="$attrs.onLabelDetail"
                type="primary"
                link
                :icon="PriceTag"
                @click="$emit('label-detail', row)"
                title="标签详情"
              />

              <!-- 移入/移出 - 未采收显示 -->
              <el-button
                v-if="$attrs.onMove && !row.isHarvest"
                type="primary"
                link
                :icon="Right"
                @click="$emit('move', row)"
                title="移入/移出"
              />

              <!-- 标记管理 -->
              <el-button
                v-if="$attrs.onMark"
                type="primary"
                link
                :icon="Star"
                @click="$emit('mark', row)"
                title="标记管理"
              />

              <!-- 留种 - 已采收显示 -->
              <el-button
                v-if="$attrs.onSeedSaving && row.status === 'harvested'"
                type="primary"
                link
                :icon="Sunny"
                @click="$emit('seed-saving', row)"
                title="留种"
              />
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <div class="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-100 rounded-b-xl">
      <!-- 编辑/删除/导出/打印模式下显示选择状态和全选按钮 -->
      <div v-if="operationMode === 'edit' || operationMode === 'delete' || exportMode || printMode" class="flex items-center gap-4">
        <el-button link size="small" @click="onExportSelectAll">
          {{ selectedRows.length === data.length ? '全不选' : '全选' }}
        </el-button>
        <span class="text-sm text-gray-500">已选择 {{ selectedRows.length }} 项</span>
      </div>
      <div v-else></div>
      <el-pagination
        v-model:current-page="localPagination.current"
        v-model:page-size="localPagination.pageSize"
        :page-sizes="[10, 20, 50]"
        :total="data.length"
        layout="sizes, prev, pager, next"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>

    <!-- 图片预览弹窗 -->
    <el-dialog v-model="imagePreviewVisible" title="图片预览" width="800px">
      <div v-if="previewImages.length > 0" class="flex flex-wrap gap-2">
        <el-image
          v-for="(img, idx) in previewImages"
          :key="idx"
          :src="img"
          :preview-src-list="previewImages"
          fit="cover"
          class="w-32 h-32"
        />
      </div>
      <div v-else class="text-center text-gray-500 py-8">暂无图片</div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, useAttrs } from 'vue'
import {
  Plus, Edit, Delete, Download, Printer, CircleCheck, Close,
  Picture, PriceTag, Right, Star, Sunny
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const attrs = useAttrs()

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
  canCreate: Boolean,
  canEdit: Boolean,
  canDelete: Boolean,
  canExport: Boolean,
  canPrint: Boolean,
  operationMode: {
    type: String,
    default: 'normal'
  },
  exportMode: Boolean,
  printMode: Boolean,
  onAdd: Function,
  onExportClick: Function
})

const emit = defineEmits([
  'add', 'edit', 'detail', 'harvest', 'delete', 'image-click', 'end',
  'label-detail', 'move', 'mark', 'seed-saving',
  'selection-change', 'operation-mode-change', 'export-click', 'export-select-all',
  'export-cancel', 'export-confirm', 'print-mode-change', 'confirm-print',
  'page-change', 'page-size-change'
])

// 状态映射 - 与V1.1完全一致
const statusMap = {
  planted: { label: '已定植', class: 'text-blue-600 bg-blue-50' },
  growing: { label: '生长期', class: 'text-amber-600 bg-amber-50' },
  harvested: { label: '已采收', class: 'text-green-600 bg-green-50' },
  cancelled: { label: '已取消', class: 'text-gray-600 bg-gray-50' }
}

// 本地分页状态
const localPagination = ref({
  current: props.pagination.current || 1,
  pageSize: props.pagination.pageSize || 10
})

// 计算属性
const totalPages = computed(() => Math.ceil(props.data.length / localPagination.value.pageSize))
const startIndex = computed(() => (localPagination.value.current - 1) * localPagination.value.pageSize)
const endIndex = computed(() => Math.min(startIndex.value + localPagination.value.pageSize, props.data.length))
const currentData = computed(() => props.data.slice(startIndex.value, endIndex.value))

// 判断是否需要显示复选框列
const showCheckbox = computed(() =>
  props.operationMode === 'edit' ||
  props.operationMode === 'delete' ||
  props.exportMode ||
  props.printMode
)

// 图片预览
const imagePreviewVisible = ref(false)
const previewImages = ref([])

const handleImageClick = (row) => {
  if (row.pictures && row.pictures.length > 0) {
    previewImages.value = row.pictures
    imagePreviewVisible.value = true
  }
}

// 获取选中的第一条记录
const getFirstSelectedRecord = () => {
  if (props.selectedRows.length === 0) return null
  return props.data.find(r => r.id === props.selectedRows[0]) || null
}

// 选择操作
const handleSelectionChange = (selection) => {
  emit('selection-change', selection.map(item => item.id))
}

const onExportSelectAll = () => {
  if (props.selectedRows.length === props.data.length) {
    emit('selection-change', [])
  } else {
    emit('selection-change', props.data.map(item => item.id))
  }
}

// 分页
const handlePageChange = (page) => {
  localPagination.value.current = page
  emit('page-change', { current: page, pageSize: localPagination.value.pageSize })
}

const handleSizeChange = (size) => {
  localPagination.value.pageSize = size
  localPagination.value.current = 1
  emit('page-size-change', size)
  emit('page-change', { current: 1, pageSize: size })
}

// 打印确认
const confirmPrint = () => {
  if (props.selectedRows.length === 0) {
    ElMessage.warning('请先选择要打印的记录')
    return
  }
  const selectedRecords = props.data.filter(item => props.selectedRows.includes(item.id))
  emit('confirm-print', selectedRecords)
}

// 执行业务操作
const executeOperation = async (op) => {
  const record = getFirstSelectedRecord()
  if (!record) {
    ElMessage.warning('请先在表格中选择一条记录')
    return
  }
  switch (op) {
    case 'detail':
      emit('detail', record)
      break
    case 'edit':
      emit('edit', record)
      break
    case 'harvest':
      if (!record.isHarvest) {
        emit('harvest', record)
      } else {
        ElMessage.warning('该记录已采收或无法进行采收操作')
        return
      }
      break
    case 'print':
      emit('print', record)
      break
    case 'image':
      if (record.pictures?.length > 0) {
        emit('image-click', record.pictures)
      } else {
        ElMessage.warning('该记录没有图片')
        return
      }
      break
    case 'delete':
      emit('delete', props.selectedRows)
      emit('operation-mode-change', 'normal')
      emit('selection-change', [])
      return
  }
  emit('operation-mode-change', 'normal')
  emit('selection-change', [])
}

// 取消操作
const cancelOperation = () => {
  emit('operation-mode-change', 'normal')
  emit('selection-change', [])
}
</script>
