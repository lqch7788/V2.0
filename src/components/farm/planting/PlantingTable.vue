<!--
  种植数据表格组件
  1:1 翻译自 V1.1 src/components/farm/planting/components/PlantingTable.tsx
  包含品种缓存、按编码/名称查找品种、品种路径/标准编码/最细分品种名解析能力
-->
<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100">
    <!-- 标题和操作按钮栏 -->
    <div class="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
      <h3 class="text-lg font-semibold text-gray-900">种植作物列表</h3>
      <div class="flex items-center gap-2">
        <!-- 导出模式 -->
        <template v-if="exportMode">
          <span class="text-sm text-gray-500 mr-2">已选择 {{ selectedRows.length }} 项</span>
          <button
            v-if="onExportSelectAll"
            class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-900 hover:bg-gray-200"
            @click="$emit('export-select-all')"
          >
            {{ selectedRows.length === data.length ? '全不选' : '全选' }}
          </button>
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
            v-if="onExportSelectAll"
            class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-900 hover:bg-gray-200"
            @click="$emit('export-select-all')"
          >
            {{ selectedRows.length === data.length ? '全不选' : '全选' }}
          </button>
          <button
            class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
            :disabled="selectedRows.length === 0"
            @click="confirmPrint"
          >
            确认打印
          </button>
          <button
            class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-900 hover:bg-gray-200"
            @click="cancelPrintMode"
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
            v-if="canCreate && onAdd"
            class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
            @click="$emit('add')"
          >
            新增
          </button>
          <button
            v-if="canEdit"
            class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
            @click="() => onOperationModeChange && onOperationModeChange('edit')"
          >
            编辑
          </button>
          <button
            v-if="canDelete"
            class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-red-600 text-white hover:bg-red-700"
            @click="() => onOperationModeChange && onOperationModeChange('delete')"
          >
            删除
          </button>
          <button
            v-if="canExport && onExportClick"
            class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
            @click="$emit('export-click')"
          >
            导出
          </button>
          <button
            v-if="canPrint"
            class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-purple-600 text-white hover:bg-purple-700"
            @click="() => onPrintModeChange && onPrintModeChange(true)"
          >
            标签打印
          </button>
        </template>
      </div>
    </div>

    <!-- 表格 - 与 V1.1 表格列与渲染逻辑 1:1 -->
    <div class="overflow-auto max-h-[calc(100vh-380px)]">
      <table class="min-w-[1900px] w-full table-fixed">
        <thead class="bg-gradient-to-r from-blue-500 to-blue-600 sticky top-0 z-10">
          <tr>
            <th v-if="showCheckbox" class="px-4 py-3 text-center text-sm font-semibold text-white whitespace-nowrap w-12">
              <el-checkbox
                :model-value="selectedRows.length === data.length && data.length > 0"
                class="plant-checkbox"
                @change="onHeaderSelectAllChange"
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
            class="hover:bg-gray-50 transition-colors"
          >
            <td v-if="showCheckbox" class="px-4 py-3 text-center w-12">
              <el-checkbox
                :model-value="selectedRowsRef.includes(record.id)"
                class="plant-checkbox"
                @change="(checked) => handleRowSelectChange(record.id, checked)"
              />
            </td>
            <td class="px-4 py-3 text-sm font-medium whitespace-nowrap w-36">
              <button
                class="font-mono text-blue-600 font-semibold hover:text-blue-800 hover:underline"
                title="点击查看详情"
                @click="$emit('detail', record)"
              >
                {{ record.plantCode }}
              </button>
            </td>
            <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap w-36">
              <span v-if="record.productionPlanCode" class="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-xs font-medium">
                {{ record.productionPlanCode }}
              </span>
              <span v-else>-</span>
            </td>
            <td class="px-4 py-3 text-sm w-32">
              <span class="font-mono text-orange-600">{{ getStandardCropCode(record) || '-' }}</span>
            </td>
            <td class="px-4 py-3 text-sm text-gray-900 whitespace-nowrap w-28">
              {{ getCropVarietyName(record) }}
            </td>
            <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap w-40 truncate" :title="getVarietyPath(record)">
              {{ getVarietyPath(record) }}
            </td>
            <td class="px-4 py-3 text-sm text-gray-700 whitespace-nowrap w-28">{{ record.areaName || '-' }}</td>
            <td class="px-4 py-3 text-sm text-emerald-600 font-medium whitespace-nowrap w-24">
              {{ (record.plantingCount || 0).toLocaleString() }}
            </td>
            <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap w-20">{{ record.plantingDate || '-' }}</td>
            <td class="px-4 py-3 text-sm text-gray-700 whitespace-nowrap w-20 font-mono">
              {{ record.soilPH != null && record.soilPH > 0 ? record.soilPH.toFixed(1) : '-' }}
            </td>
            <td class="px-4 py-3 text-sm text-gray-700 whitespace-nowrap w-20 font-mono">
              {{ record.soilEC != null && record.soilEC > 0 ? record.soilEC.toFixed(1) : '-' }}
            </td>
            <td class="px-4 py-3 text-sm whitespace-nowrap w-16">
              <span v-if="record.attritionRate != null && record.attritionRate > 0" class="text-amber-600 font-medium">
                {{ record.attritionRate.toFixed(1) }}%
              </span>
              <span v-else class="text-gray-400">-</span>
            </td>
            <td class="px-4 py-3 text-sm text-blue-600 font-medium whitespace-nowrap w-24">
              {{ (record.harvestQuantity || 0).toLocaleString() }}{{ record.unit || '' }}
            </td>
            <td class="px-4 py-3 text-sm whitespace-nowrap w-24">
              <span
                v-if="record.targetYield && record.targetYield !== 0"
                :class="{
                  'font-medium': true,
                  'text-green-600': (record.harvestQuantity || 0) / record.targetYield >= 0.8,
                  'text-amber-600': (record.harvestQuantity || 0) / record.targetYield >= 0.5 && (record.harvestQuantity || 0) / record.targetYield < 0.8,
                  'text-red-600': (record.harvestQuantity || 0) / record.targetYield < 0.5
                }"
              >
                {{ Math.round((record.harvestQuantity || 0) / record.targetYield * 100) }}%
              </span>
              <span v-else class="text-gray-400">-</span>
            </td>
            <td class="px-4 py-3 text-sm whitespace-nowrap w-16">
              <span
                :class="['px-2 py-1 rounded text-xs font-medium', statusMap[record.status]?.color || '']"
              >
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
                  <CheckCircle class="w-4 h-4" />
                </button>

                <!-- 查看图片 -->
                <button
                  v-if="record.pictures && record.pictures.length > 0"
                  class="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  title="查看图片"
                  @click="() => onImageClick && onImageClick(record.pictures)"
                >
                  <ImageIcon class="w-4 h-4" />
                </button>

                <!-- 正常结束 - 1:1 V1.1 用 CheckCircle 图标（与采收登记通过位置+颜色区分：采收=emerald，结束=green） -->
                <button
                  class="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:text-green-600 hover:bg-green-50 transition-colors"
                  title="正常结束"
                  @click="$emit('end', record, 'normal')"
                >
                  <CheckCircle class="w-4 h-4" />
                </button>

                <!-- 异常结束 -->
                <button
                  class="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="异常结束"
                  @click="$emit('end', record, 'abnormal')"
                >
                  <XCircle class="w-4 h-4" />
                </button>

                <!-- 标签详情 -->
                <button
                  v-if="onLabelDetail"
                  class="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                  title="标签详情"
                  @click="$emit('label-detail', record)"
                >
                  <Tag class="w-4 h-4" />
                </button>

                <!-- 移入/移出 - 未采收显示 -->
                <button
                  v-if="onMove && !record.isHarvest"
                  class="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  title="移入/移出"
                  @click="$emit('move', record)"
                >
                  <MoveRight class="w-4 h-4" />
                </button>

                <!-- 标记管理 -->
                <button
                  v-if="onMark"
                  class="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                  title="标记管理"
                  @click="$emit('mark', record)"
                >
                  <Bookmark class="w-4 h-4" />
                </button>

                <!-- 留种 - 已采收显示 -->
                <button
                  v-if="onSeedSaving && record.status === 'harvested'"
                  class="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 transition-colors"
                  title="留种"
                  @click="$emit('seed-saving', record)"
                >
                  <Sprout class="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分页 -->
    <div class="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-100 rounded-b-xl">
      <!-- 编辑/删除/导出/打印模式下显示选择状态和全选按钮 -->
      <div v-if="showCheckbox" class="flex items-center gap-4">
        <button
          v-if="onExportSelectAll"
          class="text-sm text-blue-600 hover:text-blue-800 hover:underline"
          @click="$emit('export-select-all')"
        >
          {{ selectedRows.length === data.length ? '全不选' : '全选' }}
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
  </div>
</template>

<script setup>
/**
 * 种植数据表格组件
 * 1:1 翻译自 V1.1 src/components/farm/planting/components/PlantingTable.tsx
 */
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
// 1:1 恢复 V1.1 lucide-react 图标体系（V2.0 旧版用 emoji 字符，UI 风格严重偏离）
import { CheckCircle, XCircle, Image as ImageIcon, Tag, MoveRight, Bookmark, Sprout } from 'lucide-vue-next'

/**
 * @typedef {Object} Planting
 * @property {string} id
 * @property {string} [plantCode]
 * @property {string} [productionPlanCode]
 * @property {string} [cropCode]
 * @property {string} [cropName]
 * @property {string} [cropVariety]
 * @property {string} [sourceCode]
 * @property {string} [areaName]
 * @property {number} [plantingCount]
 * @property {string} [plantingDate]
 * @property {number} [soilPH]
 * @property {number} [soilEC]
 * @property {number} [attritionRate]
 * @property {number} [harvestQuantity]
 * @property {string} [unit]
 * @property {number} [targetYield]
 * @property {string} [status]
 * @property {boolean} [isHarvest]
 * @property {string[]} [pictures]
 */

/**
 * 操作模式类型
 * @typedef {'normal'|'detail'|'edit'|'harvest'|'print'|'image'|'delete'|'export'} PlantingOperationMode
 */

/**
 * @typedef {Object} PlantingTableProps
 * @property {Planting[]} data
 * @property {{ current: number, pageSize: number }} pagination
 * @property {(pagination: { current: number, pageSize: number }) => void} onChange
 * @property {(pageSize: number) => void} [onPageSizeChange]
 * @property {string[]} selectedRows
 * @property {(keys: string[]) => void} onSelectionChange
 * @property {() => void} [onAdd]
 * @property {(record: Planting) => void} onEdit
 * @property {(record: Planting) => void} onDetail
 * @property {(record: Planting) => void} onHarvest
 * @property {(record: Planting) => void} onPrint
 * @property {(ids: string[]) => void} onDelete
 * @property {(images: string[]) => void} onImageClick
 * @property {(record: Planting, endType: 'normal'|'abnormal') => void} onEnd
 * @property {PlantingOperationMode} [operationMode]
 * @property {(mode: PlantingOperationMode) => void} [onOperationModeChange]
 * @property {boolean} [exportMode]
 * @property {() => void} [onExportClick]
 * @property {() => void} [onExportSelectAll]
 * @property {() => void} [onExportCancel]
 * @property {() => void} [onConfirmExport]
 * @property {boolean} [printMode]
 * @property {(mode: boolean) => void} [onPrintModeChange]
 * @property {(records: Planting[]) => void} [onConfirmPrint]
 * @property {(record: Planting) => void} [onLabelDetail]
 * @property {(record: Planting) => void} [onMove]
 * @property {(record: Planting) => void} [onMark]
 * @property {(record: Planting) => void} [onSeedSaving]
 * @property {boolean} [canCreate]
 * @property {boolean} [canEdit]
 * @property {boolean} [canDelete]
 * @property {boolean} [canExport]
 * @property {boolean} [canPrint]
 */

const props = defineProps({
  data: { type: Array, default: () => [] },
  pagination: {
    type: Object,
    default: () => ({ current: 1, pageSize: 10 })
  },
  selectedRows: { type: Array, default: () => [] },
  canCreate: { type: Boolean, default: true },
  canEdit: { type: Boolean, default: true },
  canDelete: { type: Boolean, default: true },
  canExport: { type: Boolean, default: true },
  canPrint: { type: Boolean, default: true },
  operationMode: { type: String, default: 'normal' },
  exportMode: { type: Boolean, default: false },
  printMode: { type: Boolean, default: false },
  // 事件回调（保持与 V1.1 一致；Vue 中以 onXxx 形式接收后内部 emit 对应 xxx）
  onAdd: { type: Function, default: null },
  onEdit: { type: Function, default: null },
  onDetail: { type: Function, default: null },
  onHarvest: { type: Function, default: null },
  onPrint: { type: Function, default: null },
  onDelete: { type: Function, default: null },
  onImageClick: { type: Function, default: null },
  onEnd: { type: Function, default: null },
  onChange: { type: Function, default: null },
  onPageSizeChange: { type: Function, default: null },
  onSelectionChange: { type: Function, default: null },
  onOperationModeChange: { type: Function, default: null },
  onExportClick: { type: Function, default: null },
  onExportSelectAll: { type: Function, default: null },
  onExportCancel: { type: Function, default: null },
  onConfirmExport: { type: Function, default: null },
  onPrintModeChange: { type: Function, default: null },
  onConfirmPrint: { type: Function, default: null },
  onLabelDetail: { type: Function, default: null },
  onMove: { type: Function, default: null },
  onMark: { type: Function, default: null },
  onSeedSaving: { type: Function, default: null }
})

const emit = defineEmits([
  'add',
  'edit',
  'detail',
  'harvest',
  'print',
  'delete',
  'image-click',
  'end',
  'page-change',
  'page-size-change',
  'selection-change',
  'operation-mode-change',
  'export-click',
  'export-select-all',
  'export-cancel',
  'export-confirm',
  'print-mode-change'
])

// 状态映射 - 与 V1.1 完全一致（color 字段）
const statusMap = {
  planted: { label: '已定植', color: 'text-blue-600 bg-blue-50' },
  growing: { label: '生长期', color: 'text-amber-600 bg-amber-50' },
  harvested: { label: '已采收', color: 'text-green-600 bg-green-50' },
  cancelled: { label: '已取消', color: 'text-gray-600 bg-gray-50' }
}

// ============== 品种数据缓存（与 V1.1 一致） ==============
/**
 * 品种缓存表：key -> CropVariety
 * 加载策略：组件挂载时通过动态 import('@/services/apiCropVarietyService').getAllVarieties() 拉取全量
 * 缓存键优先级：subVariety1Name > varietyName > cropCode
 * @type {import('vue').Ref<Map<string, Object>>}
 */
const varietyCache = ref(new Map())

/**
 * 加载所有品种数据，构建查找缓存
 * 1:1 翻译自 V1.1 useEffect -> loadVarieties
 * 使用动态 import 与 SeedlingTable 保持一致，避免静态分析时 Vite 解析到 .js 占位文件
 */
const loadVarieties = async () => {
  try {
    const { getAllVarieties } = await import('@/services/apiCropVarietyService')
    const varieties = await getAllVarieties()
    const cache = new Map()
    varieties.forEach((v) => {
      // 缓存最细分品种（subVariety1Name 优先）
      const key1 = v.subVariety1Name || ''
      if (key1 && !cache.has(key1)) {
        cache.set(key1, v)
      }
      // 也按 varietyName 缓存
      const key2 = v.varietyName || ''
      if (key2 && !cache.has(key2)) {
        cache.set(key2, v)
      }
      // 也按 cropCode 缓存
      const key3 = v.cropCode || ''
      if (key3 && !cache.has(key3)) {
        cache.set(key3, v)
      }
    })
    varietyCache.value = cache
  } catch (err) {
    // 加载失败时静默退化，品种相关列将回退到原始名称
    // eslint-disable-next-line no-console
    console.warn('[PlantingTable] loadVarieties failed:', err)
  }
}

onMounted(() => {
  loadVarieties()
})

/**
 * 根据 cropCode / sourceCode / cropName 获取品种信息
 * 1:1 翻译自 V1.1 getVarietyByAny：先精确，再模糊，最后“其他”子品种
 * @param {Planting} record
 * @returns {Object|null}
 */
const getVarietyByAny = (record) => {
  if (!record) return null
  // 优先用 cropCode 查找（11位新编码）
  if (record.cropCode) {
    const v = varietyCache.value.get(record.cropCode)
    if (v) return v
  }
  // 用 sourceCode 查找（迁移数据中 sourceCode 存储正确品种名）
  if (record.sourceCode) {
    const v = varietyCache.value.get(record.sourceCode)
    if (v) return v
    // 模糊匹配
    for (const [key, variety] of varietyCache.value.entries()) {
      const varietyFullName = variety.subVariety1Name || variety.varietyName || ''
      if (varietyFullName.includes(record.sourceCode) || record.sourceCode.includes(varietyFullName)) {
        return variety
      }
    }
  }
  // 用 cropName 查找
  if (record.cropName) {
    const v = varietyCache.value.get(record.cropName)
    if (v) return v
    // 模糊匹配
    for (const [key, variety] of varietyCache.value.entries()) {
      const varietyFullName = variety.subVariety1Name || variety.varietyName || ''
      if (varietyFullName.includes(record.cropName) || record.cropName.includes(varietyFullName)) {
        return variety
      }
    }
  }

  // 找不到时，在同品种下找"其他"子品种
  for (const [key, variety] of varietyCache.value.entries()) {
    const searchName = record.sourceCode || record.cropName || ''
    if (!searchName) continue
    // 检查该品种的 varietyName 是否匹配
    if (variety.varietyName && searchName.includes(variety.varietyName)) {
      // 在同品种下查找"其他"子品种
      for (const [k2, v2] of varietyCache.value.entries()) {
        if (
          v2.varietyName === variety.varietyName &&
          v2.typeName === variety.typeName &&
          v2.categoryName === variety.categoryName &&
          v2.subVariety1Name &&
          v2.subVariety1Name.includes('其他')
        ) {
          return v2
        }
      }
    }
  }

  return null
}

/**
 * 获取作物品种路径（category-type-variety-subVariety1）
 * 1:1 翻译自 V1.1 getVarietyPath
 * @param {Planting} record
 * @returns {string}
 */
const getVarietyPath = (record) => {
  const variety = getVarietyByAny(record)
  if (!variety) {
    return record.sourceCode || record.cropName || '-'
  }
  const parts = []
  if (variety.categoryName) parts.push(variety.categoryName)
  if (variety.typeName) parts.push(variety.typeName)
  if (variety.varietyName) parts.push(variety.varietyName)
  if (variety.subVariety1Name) parts.push(variety.subVariety1Name)
  return parts.join('-') || record.sourceCode || record.cropName || '-'
}

/**
 * 获取标准作物编码
 * 1:1 翻译自 V1.1 getStandardCropCode
 * @param {Planting} record
 * @returns {string}
 */
const getStandardCropCode = (record) => {
  const variety = getVarietyByAny(record)
  if (!variety) {
    return '-'
  }
  return variety.cropCode || '-'
}

/**
 * 获取作物品种名（最细分）
 * 1:1 翻译自 V1.1 getCropVarietyName
 * @param {Planting} record
 * @returns {string}
 */
const getCropVarietyName = (record) => {
  const variety = getVarietyByAny(record)
  if (!variety) {
    return record.sourceCode || record.cropName || '-'
  }
  return variety.subVariety1Name || variety.varietyName || record.sourceCode || record.cropName || '-'
}

// ============== 分页（与 V1.1 1:1） ==============
const localPagination = ref({
  current: props.pagination.current || 1,
  pageSize: props.pagination.pageSize || 10
})

// 监听父组件 pagination 变化时同步
watch(
  () => props.pagination,
  (newP) => {
    if (newP) {
      localPagination.value = {
        current: newP.current || 1,
        pageSize: newP.pageSize || 10
      }
    }
  },
  { deep: true }
)

const totalPages = computed(() => Math.ceil(props.data.length / localPagination.value.pageSize) || 1)
const startIndex = computed(() => (localPagination.value.current - 1) * localPagination.value.pageSize)
const endIndex = computed(() => Math.min(startIndex.value + localPagination.value.pageSize, props.data.length))
const currentData = computed(() => props.data.slice(startIndex.value, endIndex.value))

// 复选框列可见性
const showCheckbox = computed(
  () => props.operationMode === 'edit' || props.operationMode === 'delete' || props.exportMode || props.printMode
)

// ============== selectedRowsRef 闭包安全模式（与 V1.1 一致） ==============
const selectedRowsRef = ref([...props.selectedRows])
watch(
  () => props.selectedRows,
  (newRows) => {
    selectedRowsRef.value = [...newRows]
  },
  { deep: true }
)

// ============== 选择/全选/分页 操作 ==============
/**
 * 行复选框变化：使用 ref 保证闭包内取到最新值
 * @param {string} id
 * @param {boolean} checked
 */
const handleRowSelectChange = (id, checked) => {
  const current = [...selectedRowsRef.value]
  if (checked) {
    if (!current.includes(id)) {
      current.push(id)
    }
  } else {
    const idx = current.indexOf(id)
    if (idx >= 0) current.splice(idx, 1)
  }
  emit('selection-change', current)
}

/**
 * 表头全选/取消全选
 * @param {boolean} checked
 */
const onHeaderSelectAllChange = (checked) => {
  if (checked) {
    emit('selection-change', currentData.value.map((item) => item.id))
  } else {
    emit('selection-change', [])
  }
}

const handlePageChange = (page) => {
  localPagination.value.current = page
  emit('page-change', page)
}

const handleSizeChange = (size) => {
  localPagination.value.pageSize = size
  localPagination.value.current = 1
  if (props.onPageSizeChange) props.onPageSizeChange(size)
  if (props.onChange) props.onChange({ current: 1, pageSize: size })
  emit('page-size-change', size)
  emit('page-change', { current: 1, pageSize: size })
}

// ============== 模式操作（与 V1.1 executeOperation 1:1） ==============
const getFirstSelectedRecord = () => {
  if (props.selectedRows.length === 0) return null
  return props.data.find((r) => r.id === props.selectedRows[0]) || null
}

const executeOperation = (op) => {
  const record = getFirstSelectedRecord()
  if (!record) {
    ElMessage.warning('请先在表格中选择一条记录')
    return
  }
  switch (op) {
    case 'edit':
      if (props.onEdit) props.onEdit(record)
      break
    case 'delete':
      if (props.onDelete) props.onDelete(props.selectedRows)
      // 删除操作需在 API 完成后再重置模式；这里直接重置 + 清空选择（与 V1.1 行为一致）
      if (props.onOperationModeChange) props.onOperationModeChange('normal')
      emit('selection-change', [])
      return
    default:
      break
  }
  if (props.onOperationModeChange) props.onOperationModeChange('normal')
  emit('selection-change', [])
}

const cancelOperation = () => {
  if (props.onOperationModeChange) props.onOperationModeChange('normal')
  emit('selection-change', [])
}

const cancelPrintMode = () => {
  if (props.onPrintModeChange) props.onPrintModeChange(false)
  emit('selection-change', [])
}

const confirmPrint = () => {
  if (props.selectedRows.length === 0) {
    ElMessage.warning('请先选择要打印的记录')
    return
  }
  const selectedRecords = props.data.filter((item) => props.selectedRows.includes(item.id))
  if (props.onConfirmPrint) props.onConfirmPrint(selectedRecords)
  if (props.onPrintModeChange) props.onPrintModeChange(false)
  emit('selection-change', [])
}
</script>

<style scoped>
/* 加深复选框默认边框颜色 - 与 V1.1 表格保持一致 */
:deep(.plant-checkbox .el-checkbox__inner) {
  border-color: #374151;
}

:deep(.plant-checkbox:hover .el-checkbox__inner) {
  border-color: #059669;
}
</style>
