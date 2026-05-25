<template>
  <!-- 采收表格组件 - V1.1样式 -->
  <div class="overflow-x-auto">
    <table class="w-full">
      <!-- 表头 -->
      <thead class="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <tr>
          <!-- 复选框列 -->
          <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap w-10">
            <el-checkbox
              :model-value="isAllSelected"
              :indeterminate="isIndeterminate"
              @change="handleSelectAll"
            />
          </th>
          <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap w-10"></th>
          <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">采收单号</th>
          <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">入库类型</th>
          <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">采收时间</th>
          <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">采收区域</th>
          <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">入库仓库</th>
          <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">采收人员</th>
          <th class="px-4 py-3 text-right text-sm font-semibold whitespace-nowrap">单价(元/kg)</th>
          <th class="px-4 py-3 text-right text-sm font-semibold whitespace-nowrap">收入(元)</th>
          <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">产品数量</th>
          <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">审核人员</th>
          <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">状态</th>
        </tr>
      </thead>
      <!-- 表格主体 -->
      <tbody class="divide-y divide-gray-300">
        <tr
          v-for="record in paginatedRecords"
          :key="record.id"
          class="hover:bg-blue-100 transition-colors"
        >
          <!-- 复选框 -->
          <td class="px-4 py-3">
            <el-checkbox
              :model-value="selectedIds.includes(record.id)"
              @change="handleSelectOne(record.id)"
            />
          </td>
          <!-- 展开按钮 -->
          <td class="px-4 py-3">
            <el-button link @click="toggleExpand(record.id)">
              <el-icon class="text-gray-500">
                <DArrowRight v-if="expandedRow !== record.id" />
                <DArrowLeft v-else />
              </el-icon>
            </el-button>
          </td>
          <!-- 采收单号 -->
          <td class="px-4 py-3 text-sm font-medium text-blue-600 cursor-pointer hover:text-blue-800 underline whitespace-nowrap" @click="$emit('view-detail', record)">
            {{ record.harvestCode }}
          </td>
          <!-- 入库类型 -->
          <td class="px-4 py-3 text-sm whitespace-nowrap">
            <span v-if="record.inboundType" :class="getInboundTypeBadgeClass(record.inboundType)">
              {{ getInboundTypeLabel(record.inboundType) }}
            </span>
            <span v-else class="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">-</span>
            <span v-if="record.isSupplementary" class="ml-1 px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-xs">
              补录
            </span>
          </td>
          <!-- 采收时间 -->
          <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
            {{ formatDate(record.harvestDate) }}
          </td>
          <!-- 采收区域 -->
          <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
            {{ record.greenhouseName || '-' }}
          </td>
          <!-- 入库仓库 -->
          <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
            {{ record.warehouseName || '-' }}
          </td>
          <!-- 采收人员 -->
          <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
            {{ (record.harvesterNames || []).join(', ') || '-' }}
          </td>
          <!-- 单价 -->
          <td class="px-4 py-3 text-sm text-gray-600 text-right whitespace-nowrap">
            {{ record.unitPrice ? record.unitPrice.toFixed(2) : '-' }}
          </td>
          <!-- 收入 -->
          <td class="px-4 py-3 text-sm text-emerald-600 font-medium text-right whitespace-nowrap">
            {{ record.totalAmount ? record.totalAmount.toFixed(2) : '-' }}
          </td>
          <!-- 产品数量 -->
          <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
            {{ record.products?.length || 1 }} 条
          </td>
          <!-- 审核人员 -->
          <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
            {{ record.auditor || '-' }}
          </td>
          <!-- 状态 -->
          <td class="px-4 py-3 whitespace-nowrap">
            <span :class="getStatusBadgeClass(record.status)">
              {{ getStatusLabel(record.status) }}
            </span>
          </td>
        </tr>
        <!-- 展开行：产品明细 -->
        <tr v-if="expandedRow" class="bg-gray-50">
          <td colspan="12" class="px-4 py-3">
            <div class="text-sm">
              <p class="font-medium text-gray-700 mb-2">产品明细：</p>
              <div class="overflow-x-auto rounded border">
                <table class="bg-white w-full">
                  <!-- 产品明细表头 -->
                  <thead class="bg-emerald-600 text-white">
                    <tr>
                      <th class="px-2 py-2 text-xs font-medium whitespace-nowrap">产品编码</th>
                      <th class="px-2 py-2 text-xs font-medium whitespace-nowrap">作物名称</th>
                      <th class="px-2 py-2 text-xs font-medium whitespace-nowrap">品种</th>
                      <th class="px-2 py-2 text-xs font-medium whitespace-nowrap">生产计划批次号</th>
                      <th class="px-2 py-2 text-xs font-medium whitespace-nowrap">种植模式</th>
                      <th class="px-2 py-2 text-xs font-medium whitespace-nowrap">采收量</th>
                      <th class="px-2 py-2 text-xs font-medium whitespace-nowrap">目标产量</th>
                      <th class="px-2 py-2 text-xs font-medium whitespace-nowrap">完成率</th>
                      <th class="px-2 py-2 text-xs font-medium whitespace-nowrap">品质等级</th>
                      <th class="px-2 py-2 text-xs font-medium whitespace-nowrap">备注</th>
                    </tr>
                  </thead>
                  <!-- 产品明细表体 -->
                  <tbody class="divide-y divide-gray-200">
                    <tr v-for="(product, pIdx) in getProducts(expandedRow)" :key="pIdx">
                      <td class="px-2 py-2 text-xs font-mono text-emerald-600 whitespace-nowrap">
                        {{ product.productCode || generateProductCode(record?.cropName, record?.variety, pIdx) }}
                      </td>
                      <td class="px-2 py-2 text-xs text-gray-900 whitespace-nowrap">{{ product.cropName || record?.cropName }}</td>
                      <td class="px-2 py-2 text-xs text-gray-500 whitespace-nowrap">{{ product.variety || record?.variety || '-' }}</td>
                      <td class="px-2 py-2 text-xs text-gray-500 whitespace-nowrap">{{ product.batchCode || record?.batchCode || '-' }}</td>
                      <td class="px-2 py-2 text-xs text-gray-500 whitespace-nowrap">{{ product.plantingMode || record?.plantingMode || '-' }}</td>
                      <td class="px-2 py-2 text-xs text-gray-900 whitespace-nowrap">{{ product.harvestQuantity || 0 }} {{ record?.unit || 'kg' }}</td>
                      <td class="px-2 py-2 text-xs text-gray-500 whitespace-nowrap">{{ product.targetYield || 0 }}</td>
                      <td class="px-2 py-2 text-xs text-gray-500 whitespace-nowrap">
                        {{ product.targetYield > 0 ? Math.round((product.harvestQuantity || 0) / product.targetYield * 100) : 0 }}%
                      </td>
                      <td class="px-2 py-2 text-xs whitespace-nowrap">
                        <span :class="getGradeBadgeClass(product.grade || record?.grade)">
                          {{ product.grade || record?.grade || 'A' }}级
                        </span>
                      </td>
                      <td class="px-2 py-2 text-xs text-gray-500 whitespace-nowrap">{{ product.remarks || record?.remarks || '-' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- 空状态 -->
    <div v-if="!records || records.length === 0" class="text-center py-12">
      <el-icon class="text-6xl text-gray-400 mb-4"><Box /></el-icon>
      <p class="text-gray-500">暂无数据</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { DArrowLeft, DArrowRight, Box } from '@element-plus/icons-vue'

const props = defineProps({
  records: {
    type: Array,
    default: () => []
  },
  currentPage: {
    type: Number,
    default: 1
  },
  pageSize: {
    type: Number,
    default: 10
  },
  // 选中的行ID列表
  selectedIds: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['view-detail', 'page-change', 'page-size-change', 'selection-change'])

// 展开行状态（支持多行展开）
const expandedRows = ref(new Set())

// 全选状态计算
const isAllSelected = computed(() => {
  return paginatedRecords.value.length > 0 && paginatedRecords.value.every(r => props.selectedIds.includes(r.id))
})

// 不确定状态（部分选中）
const isIndeterminate = computed(() => {
  const selectedCount = paginatedRecords.value.filter(r => props.selectedIds.includes(r.id)).length
  return selectedCount > 0 && selectedCount < paginatedRecords.value.length
})

// 全选/取消全选
const handleSelectAll = (val) => {
  if (val) {
    // 选中当前页所有
    const allIds = paginatedRecords.value.map(r => r.id)
    emit('selection-change', [...new Set([...props.selectedIds, ...allIds])])
  } else {
    // 取消当前页所有
    const currentIds = new Set(paginatedRecords.value.map(r => r.id))
    emit('selection-change', props.selectedIds.filter(id => !currentIds.has(id)))
  }
}

// 单行选中/取消
const handleSelectOne = (id) => {
  let newSelectedIds
  if (props.selectedIds.includes(id)) {
    newSelectedIds = props.selectedIds.filter(i => i !== id)
  } else {
    newSelectedIds = [...props.selectedIds, id]
  }
  emit('selection-change', newSelectedIds)
}

// 分页后的记录
const paginatedRecords = computed(() => {
  const start = (props.currentPage - 1) * props.pageSize
  return props.records.slice(start, start + props.pageSize)
})

// 获取当前展开行的产品
const record = computed(() => {
  if (!expandedRow.value) return null
  return props.records.find(r => r.id === expandedRow.value)
})

const getProducts = (id) => {
  const rec = props.records.find(r => r.id === id)
  return rec?.products || []
}

// 切换展开（支持多行展开）
const toggleExpand = (id) => {
  const newExpanded = new Set(expandedRows.value)
  if (newExpanded.has(id)) {
    newExpanded.delete(id)
  } else {
    newExpanded.add(id)
  }
  expandedRows.value = newExpanded
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return dateStr.replace('T', ' ').slice(0, 16)
}

// 入库类型标签
const getInboundTypeLabel = (type) => {
  const map = {
    'seed_source': '种源入库',
    'seedling': '育苗成活入库',
    'planting_harvest': '种植采收入库'
  }
  return map[type] || type
}

const getInboundTypeBadgeClass = (type) => {
  const map = {
    'seed_source': 'px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs',
    'seedling': 'px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs',
    'planting_harvest': 'px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs'
  }
  return map[type] || 'px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs'
}

// 状态标签
const getStatusLabel = (status) => {
  const map = {
    'pending': '待采收',
    'harvesting': '采收中',
    'harvested': '已采收',
    'graded': '已分级',
    'stored': '已入库'
  }
  return map[status] || status
}

const getStatusBadgeClass = (status) => {
  const map = {
    'pending': 'px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full',
    'harvesting': 'px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full',
    'harvested': 'px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full',
    'graded': 'px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full',
    'stored': 'px-2 py-1 bg-cyan-100 text-cyan-700 text-xs rounded-full'
  }
  return map[status] || 'px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full'
}

// 品质等级标签
const getGradeBadgeClass = (grade) => {
  const map = {
    'A': 'px-2 py-0.5 bg-green-500 text-white text-xs rounded font-semibold',
    'B': 'px-2 py-0.5 bg-yellow-500 text-white text-xs rounded font-semibold',
    'C': 'px-2 py-0.5 bg-red-500 text-white text-xs rounded font-semibold'
  }
  return map[grade] || 'px-2 py-0.5 bg-gray-500 text-white text-xs rounded font-semibold'
}

// 生成产品编码
const generateProductCode = (cropName, variety, index) => {
  if (!cropName) return `PD${String(index + 1).padStart(3, '0')}`
  const seq = String(index + 1).padStart(3, '0')
  return `PD0101001${seq}`
}
</script>
