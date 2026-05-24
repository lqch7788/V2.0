<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100">
    <!-- 标题和操作按钮栏 - V1.1操作模式 -->
    <div class="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
      <h3 class="text-lg font-semibold text-gray-900">种植作物列表</h3>
      <div class="flex items-center gap-2">
        <!-- 导出模式 -->
        <template v-if="exportMode">
          <span class="text-sm text-gray-500 mr-2">已选择 {{ selectedRows.length }} 项</span>
          <el-button size="small" @click="$emit('export-select-all')">
            {{ selectedRows.length === total ? '全不选' : '全选' }}
          </el-button>
          <el-button type="primary" size="small" @click="$emit('export-confirm')" :disabled="selectedRows.length === 0">
            <el-icon><Download /></el-icon>
            确认导出
          </el-button>
          <el-button size="small" @click="$emit('export-cancel')">取消</el-button>
        </template>
        <!-- 打印模式 -->
        <template v-else-if="printMode">
          <span class="text-sm text-gray-500 mr-2">已选择 {{ selectedRows.length }} 项</span>
          <el-button type="primary" size="small" class="bg-purple-600 hover:bg-purple-700" @click="confirmPrint" :disabled="selectedRows.length === 0">
            <el-icon><Printer /></el-icon>
            确认打印
          </el-button>
          <el-button size="small" @click="$emit('print-cancel')">取消</el-button>
        </template>
        <!-- 正常模式 -->
        <template v-else>
          <el-button v-if="canCreate" type="primary" size="small" @click="$emit('add')">
            <el-icon><Plus /></el-icon>
            新增
          </el-button>
          <el-button v-if="canEdit" size="small" @click="$emit('edit-mode')">
            <el-icon><Edit /></el-icon>
            编辑
          </el-button>
          <el-button v-if="canDelete" size="small" type="danger" @click="$emit('delete-mode')">
            <el-icon><Delete /></el-icon>
            删除
          </el-button>
          <el-button v-if="canExport" size="small" @click="$emit('export')">
            <el-icon><Download /></el-icon>
            导出
          </el-button>
          <el-button v-if="canPrint" size="small" type="primary" class="bg-purple-600 hover:bg-purple-700" @click="$emit('print-mode')">
            <el-icon><Printer /></el-icon>
            标签打印
          </el-button>
        </template>
      </div>
    </div>

    <!-- 表格 - 与V1.1 PlantingTable.tsx列定义完全一致 -->
    <el-table :data="paginatedData" border style="width: 100%" max-height="calc(100vh - 420px)" @selection-change="handleSelectionChange" :header-cell-style="headerCellStyle">
      <!-- 复选框列（导出/打印模式显示） -->
      <el-table-column v-if="exportMode || printMode" type="selection" width="50" />

      <!-- 种植批号 -->
      <el-table-column prop="plantCode" label="种植批号" width="140">
        <template #default="{ row }">
          <span class="font-mono text-blue-600 font-semibold cursor-pointer hover:text-blue-800 hover:underline" @click="$emit('detail', row)">
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
          <span v-else class="text-gray-400">-</span>
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
          <span class="text-gray-700">{{ row.cropName || '-' }}</span>
        </template>
      </el-table-column>

      <!-- 品种路径 -->
      <el-table-column prop="cropVariety" label="品种路径" width="180">
        <template #default="{ row }">
          <span class="text-gray-600">{{ row.cropVariety || '-' }}</span>
        </template>
      </el-table-column>

      <!-- 种植区域 -->
      <el-table-column prop="areaName" label="种植区域" width="140">
        <template #default="{ row }">
          <span class="text-gray-700">{{ row.areaName || '-' }}</span>
        </template>
      </el-table-column>

      <!-- 种植数量 -->
      <el-table-column prop="plantingCount" label="种植数量" width="100" align="right">
        <template #default="{ row }">
          <span class="text-emerald-600 font-medium">{{ row.plantingCount?.toLocaleString() }}</span>
        </template>
      </el-table-column>

      <!-- 种植日期 -->
      <el-table-column prop="plantingDate" label="种植日期" width="120" />

      <!-- 土壤PH -->
      <el-table-column prop="soilPH" label="土壤PH" width="90" align="center">
        <template #default="{ row }">
          <span :class="row.soilPH != null && row.soilPH > 0 ? 'font-mono text-gray-700' : 'text-gray-400'">
            {{ row.soilPH != null && row.soilPH > 0 ? row.soilPH.toFixed(1) : '-' }}
          </span>
        </template>
      </el-table-column>

      <!-- 土壤EC -->
      <el-table-column prop="soilEC" label="土壤EC" width="90" align="center">
        <template #default="{ row }">
          <span :class="row.soilEC != null && row.soilEC > 0 ? 'font-mono text-gray-700' : 'text-gray-400'">
            {{ row.soilEC != null && row.soilEC > 0 ? row.soilEC.toFixed(1) : '-' }}
          </span>
        </template>
      </el-table-column>

      <!-- 损耗率 -->
      <el-table-column prop="attritionRate" label="损耗率" width="85" align="center">
        <template #default="{ row }">
          <span :class="row.attritionRate != null && row.attritionRate > 0 ? 'text-amber-600 font-medium' : 'text-gray-400'">
            {{ row.attritionRate != null && row.attritionRate > 0 ? `${row.attritionRate.toFixed(1)}%` : '-' }}
          </span>
        </template>
      </el-table-column>

      <!-- 已采收 -->
      <el-table-column prop="harvestQuantity" label="已采收" width="100" align="right">
        <template #default="{ row }">
          <span class="text-blue-600 font-medium">
            {{ row.harvestQuantity ? `${row.harvestQuantity.toLocaleString()}${row.unit || ''}` : '0' }}
          </span>
        </template>
      </el-table-column>

      <!-- 完成比例 -->
      <el-table-column prop="targetYield" label="完成比例" width="100" align="center">
        <template #default="{ row }">
          <span v-if="row.targetYield && row.targetYield > 0" :class="getCompletionRateClass(row)">
            {{ Math.round((row.harvestQuantity || 0) / row.targetYield * 100) }}%
          </span>
          <span v-else class="text-gray-400">-</span>
        </template>
      </el-table-column>

      <!-- 状态 -->
      <el-table-column prop="status" label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="statusTypeMap[row.status] || 'info'" size="small">
            {{ statusLabelMap[row.status] || row.status }}
          </el-tag>
        </template>
      </el-table-column>

      <!-- 操作列 -->
      <el-table-column label="操作" width="280" fixed="right">
        <template #default="{ row }">
          <div class="flex gap-1">
            <el-button v-if="!row.isHarvest" link type="success" size="small" @click="$emit('harvest', row)" title="采收登记">
              <el-icon><CircleCheck /></el-icon>
            </el-button>
            <el-button v-if="row.pictures && row.pictures.length > 0" link type="primary" size="small" @click="handleImageClick(row)" title="查看图片">
              <el-icon><Picture /></el-icon>
            </el-button>
            <el-button link type="primary" size="small" @click="$emit('end', row, 'normal')" title="正常结束">
              <el-icon><Check /></el-icon>
            </el-button>
            <el-button link type="warning" size="small" @click="$emit('end', row, 'abnormal')" title="异常结束">
              <el-icon><Close /></el-icon>
            </el-button>
            <el-button link type="info" size="small" @click="$emit('label-detail', row)" title="标签详情">
              <el-icon><PriceTag /></el-icon>
            </el-button>
            <el-button v-if="!row.isHarvest" link type="primary" size="small" @click="$emit('move', row)" title="移入/移出">
              <el-icon><Right /></el-icon>
            </el-button>
            <el-button link type="success" size="small" @click="$emit('mark', row)" title="标记管理">
              <el-icon><Collection /></el-icon>
            </el-button>
            <el-button v-if="row.status === 'harvested'" link type="success" size="small" @click="$emit('seed-saving', row)" title="留种">
              <el-icon><Refrigerator /></el-icon>
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
      <span class="text-sm text-gray-500">共 {{ total }} 条</span>
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50]"
        :total="total"
        layout="sizes, prev, pager, next"
        background
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
import { ref, computed } from 'vue'
import {
  Plus, Download, Printer, CircleCheck, PriceTag, Right,
  Check, Close, Refrigerator, Picture, Collection, Edit, Delete
} from '@element-plus/icons-vue'

const props = defineProps({
  data: { type: Array, default: () => [] },
  canCreate: { type: Boolean, default: true },
  canEdit: { type: Boolean, default: true },
  canDelete: { type: Boolean, default: true },
  canExport: { type: Boolean, default: true },
  canPrint: { type: Boolean, default: true },
  exportMode: { type: Boolean, default: false },
  printMode: { type: Boolean, default: false }
})

const emit = defineEmits([
  'add', 'edit', 'delete', 'detail', 'harvest', 'print', 'export',
  'end', 'label-detail', 'move', 'mark', 'seed-saving',
  'edit-mode', 'delete-mode', 'export-select-all', 'export-confirm', 'export-cancel',
  'print-mode', 'print-cancel'
])

// 图片预览
const imagePreviewVisible = ref(false)
const previewImages = ref([])

// 选中的行 - 用于导出模式和打印模式
const selectedRows = ref([])

const handleImageClick = (row) => {
  if (row.pictures && row.pictures.length > 0) {
    previewImages.value = row.pictures
    imagePreviewVisible.value = true
  }
}

// 确认打印
const confirmPrint = () => {
  if (selectedRows.value.length === 0) {
    return
  }
  const selectedRecords = props.data.filter(item => selectedRows.value.includes(item.id))
  emit('print', selectedRecords)
}

// 处理选择变化
const handleSelectionChange = (selection) => {
  selectedRows.value = selection.map(item => item.id)
}

const currentPage = ref(1)
const pageSize = ref(10)

const total = computed(() => props.data.length)

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return props.data.slice(start, start + pageSize.value)
})

// V1.1状态样式：已定植-blue, 生长期-amber, 已采收-green, 已取消-gray
const statusTypeMap = {
  planted: 'primary',
  growing: 'warning',
  harvested: 'success',
  cancelled: 'info'
}

const statusLabelMap = {
  planted: '已定植',
  growing: '生长期',
  harvested: '已采收',
  cancelled: '已取消'
}

// 获取完成比例样式 - 与V1.1一致
const getCompletionRateClass = (row) => {
  const harvestQty = row.harvestQuantity || 0
  const target = row.targetYield
  if (!target || target === 0) return 'text-gray-400'
  const rate = harvestQty / target
  if (rate >= 0.8) return 'text-green-600 font-medium'
  if (rate >= 0.5) return 'text-amber-600 font-medium'
  return 'text-red-600 font-medium'
}

// 表头样式 - 与V1.1一致，使用蓝色渐变
const headerCellStyle = {
  background: 'linear-gradient(to right, #3b82f6, #2563eb)',
  color: 'white',
  fontWeight: '600',
  fontSize: '14px',
  padding: '12px 8px',
  whiteSpace: 'nowrap'
}
</script>
