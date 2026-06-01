<!--
  生产链条汇总表格组件
  展示生产链条各环节的详情表格：生产计划、种源管理、种植管理、采收入库、库存管理

  1:1 翻译自 V1.1: src/components/production/ProductionChainTable.tsx
  - props 保留：type / data / onView (Vue 中转为 emit 'view')
  - 内部 useQuery → V2.0 onMounted + getTechSolutions service
  - JSX → template、className → class、onClick → @click
  - 类型定义改为 JSDoc
-->
<template>
  <!-- 无数据时显示空状态 (1:1 V1.1 EmptyState) -->
  <div v-if="!data || data.length === 0" class="w-full">
    <div class="flex flex-col items-center justify-center py-12 text-center">
      <div class="text-base font-medium text-gray-700">{{ `暂无${tableTypeLabels[type]}数据` }}</div>
      <div class="text-sm text-gray-500 mt-1">当前没有可显示的数据记录</div>
    </div>
  </div>

  <!-- 数据表格 (1:1 V1.1 table 结构) -->
  <div v-else class="overflow-x-auto">
    <table class="w-full">
      <!-- 表头 -->
      <thead class="bg-gray-50">
        <tr class="divide-x divide-gray-100">
          <th
            v-for="column in columns"
            :key="column.key"
            class="px-4 py-3 text-left text-sm font-medium text-gray-700"
            :class="column.width || ''"
          >
            {{ column.label }}
          </th>
          <!-- 操作列 -->
          <th class="px-4 py-3 text-left text-sm font-medium text-gray-700 w-20">
            操作
          </th>
        </tr>
      </thead>
      <!-- 表体 -->
      <tbody class="divide-y divide-gray-100">
        <tr
          v-for="(record, index) in data"
          :key="record.id || index"
          class="hover:bg-gray-50 transition-colors"
        >
          <td
            v-for="column in columns"
            :key="column.key"
            class="px-4 py-3 text-sm text-gray-900"
            :class="column.width || ''"
          >
            <!-- techSolution 列特殊渲染（plans 类型专属）-->
            <template v-if="column.key === 'techSolution'">
              <Button
                v-if="relatedPlanCodes.has(record.batchCode)"
                variant="ghost"
                size="sm"
                @click="navigateToTechSolution(record.batchCode)"
              >
                查看
              </Button>
              <span v-else class="text-gray-400">-</span>
            </template>
            <!-- 默认渲染 -->
            <template v-else>
              {{ renderCell(column, record) }}
            </template>
          </td>
          <!-- 操作按钮 -->
          <td class="px-4 py-3">
            <Button
              variant="ghost"
              size="icon"
              title="查看详情"
              @click="handleView(record)"
            >
              <Eye class="w-4 h-4" />
            </Button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Eye } from 'lucide-vue-next'
import Button from '@/components/ui/Button/Button.vue'
import { getTechSolutions } from '@/services/techSolutionService'

/**
 * 表格类型
 * @typedef {'plans' | 'seedlings' | 'plantings' | 'harvests' | 'inventory'} ChainTableType
 */

/**
 * 列定义
 * @typedef {Object} Column
 * @property {string} key
 * @property {string} label
 * @property {string} [width]
 */

/**
 * Props 定义（1:1 V1.1 ProductionChainTableProps）
 */
const props = defineProps({
  /** @type {{ type: StringConstructor, required: true }} */
  type: { type: String, required: true },
  /** @type {{ type: ArrayConstructor, required: true }} */
  data: { type: Array, required: true },
})

// 事件：1:1 V1.1 onView 回调 → emit 'view'
const emit = defineEmits(['view'])

const router = useRouter()

// 状态中文映射（1:1 V1.1 statusMap）
const statusMap = {
  draft: '草稿',
  planning: '规划中',
  planned: '计划中',
  published: '已发布',
  in_progress: '进行中',
  planted: '已种植',
  growing: '生长中',
  harvesting: '采收中',
  completed: '已完成',
  stored: '已入库',
}

// 表格类型中文名称（1:1 V1.1 tableTypeLabels）
const tableTypeLabels = {
  plans: '生产计划',
  seedlings: '种源管理',
  plantings: '种植管理',
  harvests: '采收入库',
  inventory: '库存管理',
}

// 各类型表格列配置（1:1 V1.1 columnConfigsBase）
const columnConfigsBase = {
  // 生产计划表
  plans: [
    { key: 'batchCode', label: '计划编号', width: 'w-32' },
    { key: 'cropName', label: '作物', width: 'w-24' },
    { key: 'planType', label: '类型', width: 'w-20' },
    { key: 'greenhouseName', label: '温室', width: 'w-28' },
    { key: 'targetQuantity', label: '目标产量', width: 'w-24' },
    { key: 'status', label: '状态', width: 'w-20' },
  ],
  // 种源管理表
  seedlings: [
    { key: 'seedlingCode', label: '育苗编号', width: 'w-32' },
    { key: 'cropName', label: '作物', width: 'w-24' },
    { key: 'cropVariety', label: '品种', width: 'w-28' },
    { key: 'sourceName', label: '来源', width: 'w-24' },
    { key: 'seedlingQuantity', label: '数量', width: 'w-20' },
    { key: 'survivalRate', label: '存活率', width: 'w-20' },
    { key: 'productionPlanCode', label: '关联计划', width: 'w-32' },
  ],
  // 种植管理表
  plantings: [
    { key: 'plantingCode', label: '种植编号', width: 'w-32' },
    { key: 'cropName', label: '作物', width: 'w-24' },
    { key: 'cropVariety', label: '品种', width: 'w-28' },
    { key: 'greenhouseName', label: '温室', width: 'w-28' },
    { key: 'plantingArea', label: '面积', width: 'w-20' },
    { key: 'status', label: '状态', width: 'w-20' },
    { key: 'productionPlanCode', label: '关联计划', width: 'w-32' },
  ],
  // 采收入库表
  harvests: [
    { key: 'harvestCode', label: '采收编号', width: 'w-32' },
    { key: 'cropName', label: '作物', width: 'w-24' },
    { key: 'greenhouseName', label: '温室', width: 'w-28' },
    { key: 'harvestQuantity', label: '数量', width: 'w-20' },
    { key: 'harvestDate', label: '采收日期', width: 'w-28' },
    { key: 'sourceId', label: '关联计划', width: 'w-32' },
  ],
  // 库存管理表
  inventory: [
    { key: 'id', label: '库存编号', width: 'w-32' },
    { key: 'cropName', label: '作物', width: 'w-24' },
    { key: 'variety', label: '品种', width: 'w-28' },
    { key: 'quantity', label: '数量', width: 'w-20' },
    { key: 'unit', label: '单位', width: 'w-16' },
    { key: 'productionPlanCode', label: '关联计划', width: 'w-32' },
  ],
}

// 技术方案数据（1:1 V1.1 useQuery 内部获取，V2.0 onMounted 主动拉取）
const techSolutions = ref([])

onMounted(async () => {
  try {
    const result = await getTechSolutions()
    techSolutions.value = Array.isArray(result) ? result : []
  } catch (e) {
    // 1:1 V1.1 useQuery 失败时保留为空数组（默认值），UI 上不报错
    techSolutions.value = []
  }
})

// 已关联技术方案的生产计划编号集合（1:1 V1.1 relatedPlanCodes）
const relatedPlanCodes = computed(() => {
  const set = new Set()
  techSolutions.value.forEach((solution) => {
    if (solution && solution.relatedBatchCode) {
      set.add(solution.relatedBatchCode)
    }
  })
  return set
})

// 动态列配置（1:1 V1.1 getColumns：plans 附加 techSolution 列）
const columns = computed(() => {
  if (props.type === 'plans') {
    return [
      ...columnConfigsBase.plans,
      { key: 'techSolution', label: '技术方案', width: 'w-28' },
    ]
  }
  return columnConfigsBase[props.type] || []
})

/**
 * 渲染单元格内容（1:1 V1.1 renderCell）
 * @param {Column} column
 * @param {Record<string, any>} record
 * @returns {string}
 */
function renderCell(column, record) {
  const value = record[column.key]

  // 状态字段特殊处理
  if (column.key === 'status') {
    return statusMap[value] || value || '-'
  }

  // 存活率显示为百分比
  if (column.key === 'survivalRate' && value !== undefined && value !== null) {
    return `${value}%`
  }

  // 数量字段添加单位
  if (
    column.key === 'targetQuantity' ||
    column.key === 'seedlingQuantity' ||
    column.key === 'harvestQuantity' ||
    column.key === 'quantity'
  ) {
    if (value !== undefined && value !== null) {
      const unit = record.unit || 'kg'
      return `${value} ${unit}`
    }
    return '-'
  }

  return value || '-'
}

// 跳转技术方案页面（1:1 V1.1 navigate(`/tech-solution?planCode=${...}`)）
function navigateToTechSolution(batchCode) {
  router.push(`/tech-solution?planCode=${batchCode}`)
}

// 触发查看事件（1:1 V1.1 onView 回调）
function handleView(record) {
  emit('view', record)
}
</script>
