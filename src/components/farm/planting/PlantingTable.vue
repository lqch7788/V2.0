<template>
  <!-- 种植数据表格组件 - 与育苗管理SeedlingTable.vue结构完全一致 -->
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <!-- 标题和操作按钮栏 -->
    <div class="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
      <h3 class="text-lg font-semibold text-gray-900">种植作物列表</h3>

      <div class="flex items-center gap-2">
        <!-- 导出模式 -->
        <template v-if="exportMode">
          <span class="text-sm text-gray-500 mr-2">已选择 {{ selectedRows.length }} 项</span>
          <button
            class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
            :disabled="selectedRows.length === 0"
            @click="$emit('export-confirm')"
          >
            确认导出
          </button>
          <button
            class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-900 hover:bg-gray-200"
            @click="$emit('export-cancel')"
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
            @click="confirmPrint"
          >
            确认打印
          </button>
          <button
            class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-900 hover:bg-gray-200"
            @click="$emit('print-cancel')"
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
            @click="executeOperation('edit')"
          >
            确认编辑
          </button>
          <button
            class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-900 hover:bg-gray-200"
            @click="cancelOperation"
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
            @click="executeOperation('delete')"
          >
            确认删除
          </button>
          <button
            class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-900 hover:bg-gray-200"
            @click="cancelOperation"
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
            新增
          </button>
          <button
            v-if="canEdit"
            class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
            @click="() => $emit('operation-mode-change', 'edit')"
          >
            编辑
          </button>
          <button
            v-if="canDelete"
            class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-red-600 text-white hover:bg-red-700"
            @click="() => $emit('operation-mode-change', 'delete')"
          >
            删除
          </button>
          <button
            v-if="canExport"
            class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
            @click="$emit('export-click')"
          >
            导出
          </button>
          <button
            v-if="canPrint"
            class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-purple-600 text-white hover:bg-purple-700"
            @click="() => $emit('print-mode-change', true)"
          >
            标签打印
          </button>
        </template>
      </div>
    </div>

    <!-- 表格 - 使用原生table结构，与育苗管理完全一致 -->
    <div class="overflow-x-auto overflow-y-auto max-h-[calc(100vh-380px)]">
      <table class="min-w-[1900px] w-full table-fixed">
        <colgroup>
          <col v-if="showCheckbox" class="w-12" />
          <col class="w-36" />
          <col class="w-36" />
          <col class="w-32" />
          <col class="w-28" />
          <col class="w-40" />
          <col class="w-28" />
          <col class="w-24" />
          <col class="w-20" />
          <col class="w-20" />
          <col class="w-20" />
          <col class="w-24" />
          <col class="w-24" />
          <col class="w-16" />
          <col class="w-80" />
        </colgroup>
        <thead class="bg-gradient-to-r from-blue-500 to-blue-600 text-white sticky top-0 z-10">
          <tr>
            <th v-if="showCheckbox" class="px-4 py-3 text-center text-sm font-semibold text-white whitespace-nowrap w-12">
              <el-checkbox
                :model-value="currentData.length > 0 && selectedRows.length === currentData.length"
                class="plant-checkbox"
                @change="onSelectAllChange"
              />
            </th>
            <th class="px-4 py-3 text-left text-sm font-semibold text-white whitespace-nowrap w-36">种植批号</th>
            <th class="px-4 py-3 text-left text-sm font-semibold text-white whitespace-nowrap w-36">关联生产计划</th>
            <th class="px-4 py-3 text-left text-sm font-semibold text-white whitespace-nowrap w-32">作物编码</th>
            <th class="px-4 py-3 text-left text-sm font-semibold text-white whitespace-nowrap w-28">作物品种</th>
            <th class="px-4 py-3 text-left text-sm font-semibold text-white whitespace-nowrap w-40">品种路径</th>
            <th class="px-4 py-3 text-left text-sm font-semibold text-white whitespace-nowrap w-28">种植区域</th>
            <th class="px-4 py-3 text-left text-sm font-semibold text-white whitespace-nowrap w-24">种植数量</th>
            <th class="px-4 py-3 text-left text-sm font-semibold text-white whitespace-nowrap w-20">种植日期</th>
            <th class="px-4 py-3 text-left text-sm font-semibold text-white whitespace-nowrap w-20">土壤PH</th>
            <th class="px-4 py-3 text-left text-sm font-semibold text-white whitespace-nowrap w-20">土壤EC</th>
            <th class="px-4 py-3 text-left text-sm font-semibold text-white whitespace-nowrap w-16">损耗率</th>
            <th class="px-4 py-3 text-left text-sm font-semibold text-white whitespace-nowrap w-24">已采收</th>
            <th class="px-4 py-3 text-left text-sm font-semibold text-white whitespace-nowrap w-24">完成比例</th>
            <th class="px-4 py-3 text-left text-sm font-semibold text-white whitespace-nowrap w-16">状态</th>
            <th class="px-4 py-3 text-left text-sm font-semibold text-white whitespace-nowrap w-80">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-300">
          <tr v-if="currentData.length === 0">
            <td :colspan="showCheckbox ? 16 : 15" class="px-4 py-8 text-center text-gray-500">
              暂无数据
            </td>
          </tr>
          <tr
            v-for="record in currentData"
            :key="record.id"
            class="hover:bg-emerald-50 transition-colors"
          >
            <td v-if="showCheckbox" class="px-4 py-3 text-center w-12">
              <el-checkbox
                :model-value="selectedRows.includes(record.id)"
                class="plant-checkbox"
                @change="handleSelectChange(record.id, $event)"
              />
            </td>
            <td class="px-4 py-3 text-sm w-36 whitespace-nowrap">
              <button class="text-sm text-blue-600 hover:text-blue-800 hover:underline" title="点击查看详情" @click="$emit('detail', record)">
                {{ record.plantCode }}
              </button>
            </td>
            <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap w-36 truncate">
              <span v-if="record.productionPlanCode" class="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-xs font-medium">
                {{ record.productionPlanCode }}
              </span>
              <span v-else>-</span>
            </td>
            <td class="px-4 py-3 text-sm w-32 whitespace-nowrap">
              <span class="font-mono text-orange-600">{{ record.cropCode || '-' }}</span>
            </td>
            <td class="px-4 py-3 text-sm text-gray-900 truncate w-28" :title="record.cropName">
              {{ record.cropName || '-' }}
            </td>
            <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis w-40">{{ record.cropVariety || '-' }}</td>
            <td class="px-4 py-3 text-sm text-gray-700 whitespace-nowrap w-28">{{ record.areaName }}</td>
            <td class="px-4 py-3 text-sm text-emerald-600 font-medium w-24">{{ (record.plantingCount || 0).toLocaleString() }}</td>
            <td class="px-4 py-3 text-sm text-gray-700 whitespace-nowrap w-20">{{ record.plantingDate || '-' }}</td>
            <td class="px-4 py-3 text-sm w-20">
              <span :class="record.soilPH != null && record.soilPH > 0 ? 'text-gray-700 font-mono' : 'text-gray-400'">
                {{ record.soilPH != null && record.soilPH > 0 ? record.soilPH.toFixed(1) : '-' }}
              </span>
            </td>
            <td class="px-4 py-3 text-sm w-20">
              <span :class="record.soilEC != null && record.soilEC > 0 ? 'text-gray-700 font-mono' : 'text-gray-400'">
                {{ record.soilEC != null && record.soilEC > 0 ? record.soilEC.toFixed(1) : '-' }}
              </span>
            </td>
            <td class="px-4 py-3 text-sm w-16">
              <span v-if="record.attritionRate != null && record.attritionRate > 0" class="text-amber-600 font-medium">
                {{ record.attritionRate.toFixed(1) }}%
              </span>
              <span v-else class="text-gray-400">-</span>
            </td>
            <td class="px-4 py-3 text-sm text-blue-600 font-medium w-24">
              {{ (record.harvestQuantity || 0).toLocaleString() }}{{ record.unit || '' }}
            </td>
            <td class="px-4 py-3 text-sm whitespace-nowrap w-24">
              <span v-if="record.targetYield && record.targetYield !== 0"
                :class="{
                  'font-medium': true,
                  'text-green-600': (record.harvestQuantity || 0) / record.targetYield >= 0.8,
                  'text-amber-600': (record.harvestQuantity || 0) / record.targetYield >= 0.5 && (record.harvestQuantity || 0) / record.targetYield < 0.8,
                  'text-red-600': (record.harvestQuantity || 0) / record.targetYield < 0.5
                }">
                {{ Math.round((record.harvestQuantity || 0) / record.targetYield * 100) }}%
              </span>
              <span v-else class="text-gray-400">-</span>
            </td>
            <td class="px-4 py-3 text-sm w-16">
              <span :class="statusMap[record.status]?.class || ''" class="px-2 py-1 rounded text-xs font-medium">
                {{ statusMap[record.status]?.label || record.status }}
              </span>
            </td>
            <td class="px-4 py-3 w-80 whitespace-nowrap">
              <div class="flex items-center gap-1">
                <!-- 采收登记 - 未采收显示 -->
                <button
                  v-if="!record.isHarvest"
                  class="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                  title="采收登记"
                  @click="$emit('harvest', record)"
                >
                  ✓
                </button>

                <!-- 查看图片 -->
                <button
                  v-if="record.pictures && record.pictures.length > 0"
                  class="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  title="查看图片"
                  @click="handleImageClick(record)"
                >
                  📷
                </button>

                <!-- 正常结束 -->
                <button
                  class="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:text-green-600 hover:bg-green-50 transition-colors"
                  title="正常结束"
                  @click="$emit('end', record, 'normal')"
                >
                  ✓
                </button>

                <!-- 异常结束 -->
                <button
                  class="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="异常结束"
                  @click="$emit('end', record, 'abnormal')"
                >
                  ✗
                </button>

                <!-- 标签详情 -->
                <button
                  v-if="$attrs.onLabelDetail"
                  class="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                  title="标签详情"
                  @click="$emit('label-detail', record)"
                >
                  🏷️
                </button>

                <!-- 移入/移出 - 未采收显示 -->
                <button
                  v-if="$attrs.onMove && !record.isHarvest"
                  class="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  title="移入/移出"
                  @click="$emit('move', record)"
                >
                  →
                </button>

                <!-- 标记管理 -->
                <button
                  v-if="$attrs.onMark"
                  class="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                  title="标记管理"
                  @click="$emit('mark', record)"
                >
                  ⭐
                </button>

                <!-- 留种 - 已采收显示 -->
                <button
                  v-if="$attrs.onSeedSaving && record.status === 'harvested'"
                  class="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 transition-colors"
                  title="留种"
                  @click="$emit('seed-saving', record)"
                >
                  🌱
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
        <button
          class="text-sm text-blue-600 hover:text-blue-800 hover:underline"
          @click="onSelectAll"
        >
          {{ selectedRows.length === currentData.length ? '全不选' : '全选' }}
        </button>
        <span class="text-sm text-gray-500">已选择 {{ selectedRows.length }} 项</span>
      </div>
      <div v-else></div>
      <el-pagination
        v-model:current-page="localPagination.current"
        v-model:page-size="localPagination.pageSize"
        :page-sizes="[10, 20, 50]"
        :total="data.length"
        layout="total, sizes, prev, pager, next, jumper"
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
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

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
  printMode: Boolean
})

const emit = defineEmits([
  'add', 'edit', 'detail', 'harvest', 'delete', 'end',
  'label-detail', 'move', 'mark', 'seed-saving',
  'selection-change', 'operation-mode-change', 'export-click', 'export-confirm', 'export-cancel',
  'print-mode-change', 'confirm-print', 'page-change', 'page-size-change'
])

// 状态映射 - 与V1.1完全一致
const statusMap = {
  planted: { label: '已定植', class: 'text-emerald-700 bg-emerald-100' },
  growing: { label: '生长期', class: 'text-yellow-700 bg-yellow-100' },
  harvested: { label: '已采收', class: 'text-emerald-700 bg-emerald-100' },
  cancelled: { label: '已取消', class: 'text-gray-400 bg-gray-100' }
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

const handleImageClick = (record) => {
  if (record.pictures && record.pictures.length > 0) {
    previewImages.value = record.pictures
    imagePreviewVisible.value = true
  }
}

// 获取选中的第一条记录
const getFirstSelectedRecord = () => {
  if (props.selectedRows.length === 0) return null
  return props.data.find(r => props.selectedRows.includes(r.id)) || null
}

// 选择变化处理
const handleSelectChange = (id, checked) => {
  let newSelectedRows = [...props.selectedRows]
  if (checked) {
    if (!newSelectedRows.includes(id)) {
      newSelectedRows.push(id)
    }
  } else {
    newSelectedRows = newSelectedRows.filter(rowId => rowId !== id)
  }
  emit('selection-change', newSelectedRows)
}

// 全选/取消全选
const onSelectAll = () => {
  if (props.selectedRows.length === currentData.value.length) {
    emit('selection-change', [])
  } else {
    emit('selection-change', currentData.value.map(item => item.id))
  }
}

// 同步全选状态变化（用于表头复选框）
const onSelectAllChange = (checked) => {
  if (checked) {
    emit('selection-change', currentData.value.map(item => item.id))
  } else {
    emit('selection-change', [])
  }
}

// 分页处理
const handlePageChange = (page) => {
  localPagination.value.current = page
  emit('page-change', page)
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
    case 'edit':
      emit('edit', record)
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

<style scoped>
/* 加深复选框默认边框颜色 - 与育苗管理表格一致 */
:deep(.plant-checkbox .el-checkbox__inner) {
  border-color: #374151;
}

:deep(.plant-checkbox:hover .el-checkbox__inner) {
  border-color: #059669;
}
</style>
