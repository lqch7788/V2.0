<template>
  <div class="overflow-x-auto">
    <!-- 无数据时显示空状态 -->
    <div v-if="!data || data.length === 0" class="w-full py-12 text-center">
      <p class="text-gray-400 text-sm">暂无{{ tableTypeLabels[type] }}数据</p>
      <p class="text-gray-400 text-xs mt-1">当前没有可显示的数据记录</p>
    </div>

    <!-- 数据表格 -->
    <table v-else class="w-full">
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
          <th class="px-4 py-3 text-left text-sm font-medium text-gray-700 w-20">操作</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100">
        <tr v-for="(record, index) in data" :key="record.id || index" class="hover:bg-gray-50 transition-colors">
          <td
            v-for="column in columns"
            :key="column.key"
            class="px-4 py-3 text-sm text-gray-900"
            :class="column.width || ''"
          >
            <template v-if="column.key === 'techSolution'">
              <button
                v-if="relatedPlanCodes.has(record.batchCode)"
                class="text-blue-600 hover:text-blue-800 text-sm"
                @click="$router.push(`/tech-solution?planCode=${record.batchCode}`)"
              >
                查看
              </button>
              <span v-else class="text-gray-400">-</span>
            </template>
            <template v-else>
              {{ renderCell(column, record) }}
            </template>
          </td>
          <td class="px-4 py-3">
            <button
              class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-gray-100 h-9 w-9"
              title="查看详情"
              @click="$emit('view', record)"
            >
              <Eye class="w-4 h-4" />
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Eye } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps({
  type: { type: String, required: true },
  data: { type: Array, default: () => [] },
  techSolutions: { type: Array, default: () => [] },
})

defineEmits(['view'])

// 状态中文映射
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

// 表格类型中文名称
const tableTypeLabels = {
  plans: '生产计划',
  seedlings: '种源管理',
  plantings: '种植管理',
  harvests: '采收入库',
  inventory: '库存管理',
}

// 各类型表格列配置
const columnConfigsBase = {
  plans: [
    { key: 'batchCode', label: '计划编号', width: 'w-32' },
    { key: 'cropName', label: '作物', width: 'w-24' },
    { key: 'planType', label: '类型', width: 'w-20' },
    { key: 'greenhouseName', label: '温室', width: 'w-28' },
    { key: 'targetQuantity', label: '目标产量', width: 'w-24' },
    { key: 'status', label: '状态', width: 'w-20' },
  ],
  seedlings: [
    { key: 'seedlingCode', label: '育苗编号', width: 'w-32' },
    { key: 'cropName', label: '作物', width: 'w-24' },
    { key: 'cropVariety', label: '品种', width: 'w-28' },
    { key: 'sourceName', label: '来源', width: 'w-24' },
    { key: 'seedlingQuantity', label: '数量', width: 'w-20' },
    { key: 'survivalRate', label: '存活率', width: 'w-20' },
    { key: 'productionPlanCode', label: '关联计划', width: 'w-32' },
  ],
  plantings: [
    { key: 'plantingCode', label: '种植编号', width: 'w-32' },
    { key: 'cropName', label: '作物', width: 'w-24' },
    { key: 'cropVariety', label: '品种', width: 'w-28' },
    { key: 'greenhouseName', label: '温室', width: 'w-28' },
    { key: 'plantingArea', label: '面积', width: 'w-20' },
    { key: 'status', label: '状态', width: 'w-20' },
    { key: 'productionPlanCode', label: '关联计划', width: 'w-32' },
  ],
  harvests: [
    { key: 'harvestCode', label: '采收编号', width: 'w-32' },
    { key: 'cropName', label: '作物', width: 'w-24' },
    { key: 'greenhouseName', label: '温室', width: 'w-28' },
    { key: 'harvestQuantity', label: '数量', width: 'w-20' },
    { key: 'harvestDate', label: '采收日期', width: 'w-28' },
    { key: 'sourceId', label: '关联计划', width: 'w-32' },
  ],
  inventory: [
    { key: 'id', label: '库存编号', width: 'w-32' },
    { key: 'cropName', label: '作物', width: 'w-24' },
    { key: 'variety', label: '品种', width: 'w-28' },
    { key: 'quantity', label: '数量', width: 'w-20' },
    { key: 'unit', label: '单位', width: 'w-16' },
    { key: 'productionPlanCode', label: '关联计划', width: 'w-32' },
  ],
}

// 计算关联计划编号集合
const relatedPlanCodes = computed(() => {
  const codes = new Set()
  props.techSolutions.forEach(solution => {
    if (solution.relatedBatchCode) {
      codes.add(solution.relatedBatchCode)
    }
  })
  return codes
})

// 动态列配置（plans类型需要附加techSolution列）
const columns = computed(() => {
  if (props.type === 'plans') {
    return [
      ...columnConfigsBase.plans,
      { key: 'techSolution', label: '技术方案', width: 'w-28' },
    ]
  }
  return columnConfigsBase[props.type] || []
})

// 渲染单元格内容
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

  // 数量添加单位
  if (['targetQuantity', 'seedlingQuantity', 'harvestQuantity', 'quantity'].includes(column.key)) {
    if (value !== undefined && value !== null) {
      const unit = record.unit || 'kg'
      return `${value} ${unit}`
    }
    return '-'
  }

  return value || '-'
}
</script>
