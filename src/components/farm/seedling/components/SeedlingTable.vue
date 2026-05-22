<template>
  <div class="bg-white rounded-xl shadow-sm overflow-hidden">
    <!-- 表格工具栏 -->
    <div class="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
      <h3 class="text-lg font-semibold text-gray-900">育苗列表</h3>

      <div class="flex items-center gap-2">
        <!-- 导出模式 -->
        <template v-if="exportMode">
          <span class="text-sm text-gray-500 mr-2">已选择 {{ selectedRows.length }} 项</span>
          <el-button type="primary" size="small" @click="$emit('confirmExport')" :disabled="selectedRows.length === 0">
            <el-icon style="color: inherit;"><Download /></el-icon>
            确认导出
          </el-button>
          <el-button size="small" @click="$emit('cancelExport')">取消</el-button>
        </template>

        <!-- 正常模式 -->
        <template v-else>
          <el-button v-if="canCreate" type="primary" size="small" @click="$emit('add')">
            <el-icon style="color: inherit;"><Plus /></el-icon>
            新增
          </el-button>
          <el-button v-if="canEdit" size="small" @click="$emit('edit')">
            <el-icon style="color: inherit;"><Edit /></el-icon>
            编辑
          </el-button>
          <el-button v-if="canDelete" size="small" @click="$emit('delete')">
            <el-icon style="color: inherit;"><Delete /></el-icon>
            删除
          </el-button>
          <el-button v-if="canExport" size="small" @click="$emit('export')">
            <el-icon style="color: inherit;"><Download /></el-icon>
            导出
          </el-button>
          <el-button v-if="canPrint" size="small" @click="$emit('print')">
            <el-icon style="color: inherit;"><Printer /></el-icon>
            标签打印
          </el-button>
        </template>
      </div>
    </div>

    <!-- 表格 -->
    <div class="overflow-x-auto">
      <table class="w-full table-fixed">
        <colgroup>
          <col class="w-12" />
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
        <thead class="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <tr>
            <th class="px-3 py-3 text-center text-sm font-semibold text-white whitespace-nowrap">
              选择
            </th>
            <th class="px-3 py-3 text-left text-sm font-semibold text-white whitespace-nowrap">育苗批号</th>
            <th class="px-3 py-3 text-left text-sm font-semibold text-white whitespace-nowrap">关联生产计划</th>
            <th class="px-3 py-3 text-left text-sm font-semibold text-white whitespace-nowrap">关联种源</th>
            <th class="px-3 py-3 text-left text-sm font-semibold text-white whitespace-nowrap">作物编码</th>
            <th class="px-3 py-3 text-left text-sm font-semibold text-white whitespace-nowrap">作物品种</th>
            <th class="px-3 py-3 text-left text-sm font-semibold text-white whitespace-nowrap">品种路径</th>
            <th class="px-3 py-3 text-left text-sm font-semibold text-white whitespace-nowrap">场地</th>
            <th class="px-3 py-3 text-left text-sm font-semibold text-white whitespace-nowrap">成苗率</th>
            <th class="px-3 py-3 text-left text-sm font-semibold text-white whitespace-nowrap">入库数量</th>
            <th class="px-3 py-3 text-left text-sm font-semibold text-white whitespace-nowrap">剩余总数</th>
            <th class="px-3 py-3 text-left text-sm font-semibold text-white whitespace-nowrap">完成比例</th>
            <th class="px-3 py-3 text-left text-sm font-semibold text-white whitespace-nowrap">状态</th>
            <th class="px-3 py-3 text-left text-sm font-semibold text-white whitespace-nowrap">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-300">
          <tr v-if="paginatedData.length === 0">
            <td :colspan="14" class="px-4 py-8 text-center text-gray-500">
              暂无数据
            </td>
          </tr>
          <tr
            v-for="record in paginatedData"
            :key="record.id"
            class="hover:bg-gray-50"
          >
            <td class="px-3 py-2 text-center">
              <el-checkbox
                :model-value="selectedRows.includes(record.id)"
                @change="(val) => handleSelectChange(record.id, val)"
              />
            </td>
            <td class="px-3 py-2 text-sm">
              <el-button link type="primary" size="small" @click="$emit('detail', record)">
                {{ record.seedlingCode }}
              </el-button>
            </td>
            <td class="px-3 py-2 text-sm text-gray-600 whitespace-nowrap truncate">
              <span v-if="record.productionPlanCode" class="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-xs font-medium">
                {{ record.productionPlanCode }}
              </span>
              <span v-else>-</span>
            </td>
            <td class="px-3 py-2 text-sm text-gray-700 whitespace-nowrap">{{ record.sourceCode }}</td>
            <td class="px-3 py-2 text-sm">
              <span class="font-mono text-orange-600">{{ record.cropCode || '-' }}</span>
            </td>
            <td class="px-3 py-2 text-sm text-gray-900 truncate" :title="record.cropVariety || record.cropName">
              {{ getCropVarietyName(record) }}
            </td>
            <td class="px-3 py-2 text-sm text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis">
              {{ getCropVarietyPath(record) }}
            </td>
            <td class="px-3 py-2 text-sm text-gray-700 whitespace-nowrap">{{ record.siteName }}</td>
            <td class="px-3 py-2 text-sm text-emerald-600 font-medium">{{ record.survivalRate }}%</td>
            <td class="px-3 py-2 text-sm text-blue-600 font-medium">
              {{ (record.survivalCount || 0).toLocaleString() }}
            </td>
            <td class="px-3 py-2 text-sm text-purple-600 font-medium">
              {{ (record.initialCount - record.lossCount).toLocaleString() }}
            </td>
            <td class="px-3 py-2 text-sm whitespace-nowrap">
              <span v-if="record.targetSurvivalCount > 0" :class="getCompletionRateClass(record)">
                {{ Math.round((record.survivalCount || 0) / record.targetSurvivalCount * 100) }}%
              </span>
              <span v-else class="text-gray-400">-</span>
            </td>
            <td class="px-3 py-2 text-sm">
              <el-tag :type="getStatusType(record.status)" size="small">
                {{ getStatusLabel(record.status) }}
              </el-tag>
            </td>
            <td class="px-3 py-2 text-sm">
              <div class="flex gap-1">
                <el-button link type="primary" size="small" @click="$emit('dailyRecord', record)" title="每日记录">
                  <el-icon style="color: inherit;"><Calendar /></el-icon>
                </el-button>
                <el-button
                  v-if="record.status === 'transplant_ready'"
                  link type="success" size="small"
                  @click="$emit('transplant', record)"
                  title="定植操作"
                >
                  <el-icon style="color: inherit;"><Refresh /></el-icon>
                </el-button>
                <el-button link type="primary" size="small" @click="$emit('print', record)" title="打印标签">
                  <el-icon style="color: inherit;"><Printer /></el-icon>
                </el-button>
                <el-button link type="warning" size="small" @click="$emit('labelManage', record)" title="标签管理">
                  <el-icon style="color: inherit;"><Collection /></el-icon>
                </el-button>
                <el-button
                  v-if="record.pictures && record.pictures.length > 0"
                  link type="primary" size="small"
                  @click="$emit('imageClick', record.pictures)"
                  title="查看图片"
                >
                  <el-icon style="color: inherit;"><Picture /></el-icon>
                </el-button>
                <el-button link type="success" size="small" @click="$emit('end', record, 'normal')" title="正常结束">
                  <el-icon style="color: inherit;"><CircleCheck /></el-icon>
                </el-button>
                <el-button link type="danger" size="small" @click="$emit('end', record, 'abnormal')" title="异常结束">
                  <el-icon style="color: inherit;"><CircleClose /></el-icon>
                </el-button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分页 -->
    <div class="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-100 rounded-b-xl">
      <div class="flex items-center gap-4" v-if="exportMode">
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
import { ref, computed, watch } from 'vue'
import {
  Plus, Download, Calendar, Refresh, Printer, Picture, CircleCheck, CircleClose,
  Edit, Delete, Collection
} from '@element-plus/icons-vue'

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  selectedRows: {
    type: Array,
    default: () => []
  },
  loading: Boolean,
  exportMode: Boolean,
  canCreate: Boolean,
  canEdit: Boolean,
  canDelete: Boolean,
  canExport: Boolean,
  canPrint: Boolean
})

const emit = defineEmits([
  'selectionChange', 'pageChange', 'sizeChange', 'add', 'edit', 'delete',
  'detail', 'export', 'print', 'confirmExport', 'cancelExport',
  'dailyRecord', 'transplant', 'labelManage', 'imageClick', 'end'
])

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

// 获取作物品种（最细分）
const getCropVarietyName = (record) => {
  if (record.subVarietyName) {
    return record.subVarietyName
  }
  if (record.varietyName) {
    return record.varietyName
  }
  return record.cropVariety || record.cropName || ''
}

// 获取品种路径
const getCropVarietyPath = (record) => {
  if (record.categoryName || record.typeName || record.varietyName) {
    const parts = []
    if (record.categoryName) parts.push(record.categoryName)
    if (record.typeName) parts.push(record.typeName)
    if (record.varietyName) parts.push(record.varietyName)
    if (record.subVarietyName) parts.push(record.subVarietyName)
    return parts.join('-')
  }
  return record.cropVariety || '-'
}

// 获取完成比例样式
const getCompletionRateClass = (record) => {
  const rate = (record.survivalCount || 0) / record.targetSurvivalCount
  if (rate >= 0.8) return 'text-green-600 font-medium'
  if (rate >= 0.5) return 'text-amber-600 font-medium'
  return 'text-red-600 font-medium'
}
</script>
