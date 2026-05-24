<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="bg-white rounded-xl p-6 shadow-none">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
            <el-icon :size="24" style="color: white;">
              <OfficeBuilding />
            </el-icon>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">采收入库</h1>
            <p class="text-gray-500">管理采收记录、品质分级和入库操作</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        v-for="(stat, index) in stats"
        :key="index"
        class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">{{ stat.label }}</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">
              {{ stat.value }}{{ stat.unit || '' }}
            </p>
          </div>
          <div :class="['w-10 h-10 rounded-lg flex items-center justify-center', stat.color]">
            <el-icon :size="20" class="text-white">
              <component :is="stat.icon" />
            </el-icon>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选工具栏 -->
    <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm">
      <div class="flex flex-wrap gap-4 items-end">
        <!-- 采收单号 -->
        <div class="flex-1 min-w-[150px]">
          <label class="block text-gray-700 text-sm mb-1">采收单号</label>
          <el-input
            v-model="searchFilters.harvestCode"
            placeholder="请输入采收单号"
            clearable
            class="w-full"
          />
        </div>

        <!-- 批次信息 -->
        <div class="flex-1 min-w-[150px]">
          <label class="block text-gray-700 text-sm mb-1">批次信息</label>
          <el-input
            v-model="searchFilters.batchCode"
            placeholder="请输入批次号"
            clearable
            class="w-full"
          />
        </div>

        <!-- 采收区域 -->
        <div class="min-w-[150px]">
          <label class="block text-gray-700 text-sm mb-1">采收区域</label>
          <el-select
            v-model="searchFilters.greenhouseId"
            placeholder="全部"
            clearable
            class="w-full"
          >
            <el-option
              v-for="g in greenhouses"
              :key="g.id"
              :label="g.name"
              :value="g.id"
            />
          </el-select>
        </div>

        <!-- 作物品种 -->
        <div class="flex-1 min-w-[150px]">
          <label class="block text-gray-700 text-sm mb-1">作物品种</label>
          <el-input
            v-model="searchFilters.cropName"
            placeholder="请输入作物品种"
            clearable
            class="w-full"
          />
        </div>

        <!-- 品质等级 -->
        <div class="min-w-[120px]">
          <label class="block text-gray-700 text-sm mb-1">品质等级</label>
          <el-select
            v-model="searchFilters.grade"
            placeholder="全部"
            clearable
            class="w-full"
          >
            <el-option label="A级" value="A" />
            <el-option label="B级" value="B" />
            <el-option label="C级" value="C" />
          </el-select>
        </div>

        <!-- 采收人员 -->
        <div class="flex-1 min-w-[150px]">
          <label class="block text-gray-700 text-sm mb-1">采收人员</label>
          <el-input
            v-model="searchFilters.harvesterName"
            placeholder="请输入采收人员"
            clearable
            class="w-full"
          />
        </div>

        <!-- 入库仓库 -->
        <div class="min-w-[150px]">
          <label class="block text-gray-700 text-sm mb-1">入库仓库</label>
          <el-select
            v-model="searchFilters.warehouseId"
            placeholder="全部"
            clearable
            class="w-full"
          >
            <el-option
              v-for="w in warehouseOptions"
              :key="w.value"
              :label="w.label"
              :value="w.value"
            />
          </el-select>
        </div>

        <!-- 状态 -->
        <div class="min-w-[120px]">
          <label class="block text-gray-700 text-sm mb-1">状态</label>
          <el-select
            v-model="searchFilters.status"
            placeholder="全部"
            clearable
            class="w-full"
          >
            <el-option label="待采收" value="pending" />
            <el-option label="采收中" value="harvesting" />
            <el-option label="已采收" value="harvested" />
            <el-option label="已分级" value="graded" />
            <el-option label="已入库" value="stored" />
          </el-select>
        </div>

        <!-- 按钮行 -->
        <div class="flex gap-2">
          <el-button @click="handleReset">重置</el-button>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
        </div>
      </div>
    </div>

    <!-- 数据表格区域 -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <!-- 表格工具栏 -->
      <div class="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900">采收入库记录表</h3>

        <!-- 批量操作模式 -->
        <template v-if="exportMode || batchEditMode || batchDeleteMode">
          <div class="flex gap-2">
            <el-button v-if="exportMode" type="primary" size="small" @click="handleConfirmExport" :disabled="selectedRows.length === 0">
              <el-icon><Download /></el-icon>
              确认导出{{ selectedRows.length > 0 ? ` (${selectedRows.length})` : '' }}
            </el-button>
            <el-button v-if="exportMode" size="small" @click="handleCancelExport">取消选择</el-button>

            <el-button v-if="batchEditMode" type="primary" size="small" @click="handleConfirmBatchEdit">
              <el-icon><Edit /></el-icon>
              确认编辑
            </el-button>
            <el-button v-if="batchEditMode" size="small" @click="handleCancelBatchEdit">取消</el-button>

            <el-button v-if="batchDeleteMode" type="danger" size="small" @click="handleConfirmBatchDelete">
              <el-icon><Delete /></el-icon>
              确认删除
            </el-button>
            <el-button v-if="batchDeleteMode" size="small" @click="handleCancelBatchDelete">取消</el-button>
          </div>
        </template>

        <!-- 默认模式 -->
        <template v-else>
          <div class="flex gap-2">
            <el-button type="primary" size="small" @click="isCreateModalOpen = true">
              <el-icon><Plus /></el-icon>
              新增
            </el-button>
            <el-button type="primary" size="small" @click="handleBatchEdit">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button type="danger" size="small" @click="handleBatchDelete">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
            <el-button size="small" @click="handleExport">
              <el-icon><Download /></el-icon>
              导出
            </el-button>
          </div>
        </template>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="flex items-center gap-3">
          <div class="w-6 h-6 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span class="text-gray-500">加载中...</span>
        </div>
      </div>

      <!-- 数据表格 -->
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <!-- 表头 -->
          <thead class="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <tr>
              <th v-if="exportMode || batchEditMode || batchDeleteMode" class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap w-12">
                <el-checkbox
                  v-model="allSelected"
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
            <template v-for="(record, idx) in paginatedRecords" :key="record.id">
              <!-- 主行 -->
              <tr class="hover:bg-blue-100 transition-colors">
                <!-- 选择框 -->
                <td v-if="exportMode || batchEditMode || batchDeleteMode" class="px-4 py-3 whitespace-nowrap">
                  <el-checkbox
                    :model-value="selectedRows.includes(globalIndex(idx))"
                    @change="() => handleSelectRow(globalIndex(idx))"
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
                <td class="px-4 py-3 text-sm font-medium text-blue-600 cursor-pointer hover:text-blue-800 underline whitespace-nowrap" @click="handleViewDetail(record)">
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
                  {{ formatHarvesterNames(record.harvesterNames) }}
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
                  {{ (record.products || []).length || 1 }} 条
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
              <tr v-if="expandedRow === record.id" class="bg-gray-50">
                <td :colspan="(exportMode || batchEditMode || batchDeleteMode) ? 13 : 12" class="px-4 py-3">
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
                          <tr v-for="(product, pIdx) in getProducts(record)" :key="pIdx">
                            <td class="px-2 py-2 text-xs font-mono text-emerald-600 whitespace-nowrap">
                              {{ product.productCode || generateProductCode(record.cropName, record.variety || record.cropVariety, pIdx) }}
                            </td>
                            <td class="px-2 py-2 text-xs text-gray-900 whitespace-nowrap">{{ product.cropName || record.cropName }}</td>
                            <td class="px-2 py-2 text-xs text-gray-500 whitespace-nowrap">{{ product.variety || record.variety || record.cropVariety || '-' }}</td>
                            <td class="px-2 py-2 text-xs text-gray-500 whitespace-nowrap">{{ product.batchCode || record.batchCode || '-' }}</td>
                            <td class="px-2 py-2 text-xs text-gray-500 whitespace-nowrap">{{ product.plantingMode || record.plantingMode || '-' }}</td>
                            <td class="px-2 py-2 text-xs text-gray-900 whitespace-nowrap">{{ product.harvestQuantity || 0 }} {{ record.unit || 'kg' }}</td>
                            <td class="px-2 py-2 text-xs text-gray-500 whitespace-nowrap">{{ product.targetYield || 0 }}</td>
                            <td class="px-2 py-2 text-xs text-gray-500 whitespace-nowrap">
                              {{ product.targetYield > 0 ? Math.round((product.harvestQuantity || 0) / product.targetYield * 100) : 0 }}%
                            </td>
                            <td class="px-2 py-2 text-xs whitespace-nowrap">
                              <span :class="getGradeBadgeClass(product.grade || record.grade)">
                                {{ product.grade || record.grade || 'A' }}级
                              </span>
                            </td>
                            <td class="px-2 py-2 text-xs text-gray-500 whitespace-nowrap">{{ product.remarks || record.remarks || '-' }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>

        <!-- 空状态 -->
        <div v-if="!filteredRecords || filteredRecords.length === 0" class="text-center py-12">
          <el-icon class="text-6xl text-gray-400 mb-4"><Box /></el-icon>
          <p class="text-gray-500">暂无数据</p>
        </div>
      </div>

      <!-- 批量操作底部提示栏 -->
      <div v-if="(exportMode || batchEditMode || batchDeleteMode) && selectedRows.length > 0" class="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
        <div class="flex items-center gap-4">
          <el-button link size="sm" @click="handleSelectAll">
            {{ selectedRows.length === filteredRecords.length ? '全不选' : '全选' }}
          </el-button>
          <span class="text-sm text-gray-500">已选择 {{ selectedRows.length }} 项</span>
        </div>
      </div>

      <!-- 分页 -->
      <div class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
        <span class="text-sm text-gray-500">共 {{ filteredRecords.length }} 条</span>
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="filteredRecords.length"
          layout="sizes, prev, pager, next"
          background
        />
      </div>
    </div>

    <!-- 新增采收记录弹窗 -->
    <AddModal
      :is-open="isCreateModalOpen"
      :crop-batches="cropBatches"
      :greenhouses="greenhouses"
      :warehouse-options="warehouseOptions"
      :users="users"
      @close="handleCloseCreateModal"
      @save="handleCreateRecord"
    />

    <!-- 详情弹窗 -->
    <DetailModal
      :is-open="showDetailModal"
      :record="selectedDetailRecord"
      @close="showDetailModal = false"
    />

    <!-- 导出格式选择弹窗 -->
    <ExportModal
      :is-open="showExportModal"
      :export-format="exportFormat"
      :selected-count="selectedRows.length"
      @close="showExportModal = false"
      @confirm="handleDoExport"
      @format-change="exportFormat = $event"
    />

    <!-- 删除确认弹窗 -->
    <DeleteModal
      :is-open="showDeleteWarning"
      :selected-count="selectedRows.length"
      @close="showDeleteWarning = false"
      @confirm="handleConfirmBatchDelete"
    />

    <!-- 批量编辑弹窗 -->
    <BatchEditModal
      :is-open="showBatchEditModal"
      :selected-rows="selectedRows"
      :records="filteredRecords"
      :edited-record-ids="editedRecordIds"
      :edited-records="editedRecords"
      :selected-record-id="selectedRecordId"
      :greenhouses="greenhouses"
      :warehouses="warehouseOptions"
      :users="users"
      :crop-batches="cropBatches"
      @close="showBatchEditModal = false"
      @confirm="handleConfirmBatchEdit"
      @update:selectedRecordId="selectedRecordId = $event"
      @update:editedRecords="editedRecords = $event"
      @update:editedRecordIds="editedRecordIds = $event"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Search, Plus, Edit, Delete, Download,
  DArrowLeft, DArrowRight, Box, OfficeBuilding,
  Goods
} from '@element-plus/icons-vue'

// 引入弹窗组件
import AddModal from '@/components/farm/harvest/modals/AddModal.vue'
import DetailModal from '@/components/farm/harvest/modals/DetailModal.vue'
import ExportModal from '@/components/farm/harvest/modals/ExportModal.vue'
import DeleteModal from '@/components/farm/harvest/modals/DeleteModal.vue'
import BatchEditModal from '@/components/farm/harvest/modals/BatchEditModal.vue'

// 引入 Store
import { useHarvestStore } from '@/stores/modules/harvest'
import { useGreenhouseStore } from '@/stores/modules/greenhouse'
import { useUserStore } from '@/stores/modules/user'
import { useProductionPlanStore } from '@/stores/modules/productionPlan'

const harvestStore = useHarvestStore()
const greenhouseStore = useGreenhouseStore()
const userStore = useUserStore()
const productionPlanStore = useProductionPlanStore()

// ========== 数据加载 ==========
// 采收记录数据
const harvestRecords = computed(() => harvestStore.records || [])
const loading = computed(() => harvestStore.isLoading)

// 下拉选项数据
const greenhouses = computed(() => greenhouseStore.greenhouses || [])
const users = computed(() => userStore.users || [])

// 生产计划批次数据
const cropBatches = computed(() => {
  const plans = productionPlanStore.plans || []
  const seen = new Set()
  return plans
    .map(p => ({
      id: p.id,
      batchCode: p.batchCode,
      batchStatus: p.batchStatus || p.status,
      planType: p.planType,
      planTypeName: p.planTypeName,
      cropName: p.cropName || p.cropTypeName,
      variety: p.variety,
      plantingMode: p.plantingMode,
      targetYield: p.targetYield,
      cropId: p.cropId,
      varietyId: p.varietyId,
      productionPlanId: p.productionPlanId,
      productionPlanCode: p.productionPlanCode,
      instanceId: p.instanceId,
      greenhouseId: p.greenhouseId,
    }))
    .filter(item => {
      if (seen.has(item.batchCode)) return false
      seen.add(item.batchCode)
      return true
    })
})

// 仓库选项（本地定义）
const warehouseOptions = ref([
  { value: 'W001', label: '成品仓库' },
  { value: 'W002', label: '原料仓库' },
])

// ========== 筛选状态 ==========
const searchFilters = ref({
  harvestCode: '',
  batchCode: '',
  greenhouseId: '',
  cropName: '',
  grade: '',
  harvesterName: '',
  warehouseId: '',
  status: ''
})

// ========== 分页状态 ==========
const currentPage = ref(1)
const pageSize = ref(10)

// ========== 弹窗状态 ==========
const isCreateModalOpen = ref(false)
const showDetailModal = ref(false)
const showExportModal = ref(false)
const showDeleteWarning = ref(false)
const showBatchEditModal = ref(false)

// ========== 选中行状态 ==========
const selectedRows = ref([])

// ========== 批量操作模式 ==========
const exportMode = ref(false)
const batchEditMode = ref(false)
const batchDeleteMode = ref(false)

// ========== 批量编辑状态 ==========
const editedRecordIds = ref([])
const editedRecords = ref({})
const selectedRecordId = ref('')

// ========== 导出格式 ==========
const exportFormat = ref('excel')

// ========== 详情记录 ==========
const selectedDetailRecord = ref(null)

// ========== 展开行状态 ==========
const expandedRow = ref(null)

// ========== 统计卡片计算 ==========
const stats = computed(() => {
  const records = harvestRecords.value
  const totalQuantity = records.reduce((sum, r) => sum + (r.harvestQuantity || 0), 0)
  const gradeAPercent = records.length > 0
    ? Math.round(records.filter(r => r.grade === 'A').length / records.length * 100)
    : 0
  // 待入库 = 采收中、已采收、已分级状态的数量（已入库不算待入库）
  const pendingInboundCount = records.filter(r => ['harvesting', 'harvested', 'graded'].includes(r.status)).length

  return [
    {
      label: '本月采收批次',
      value: records.length,
      icon: Goods,
      color: 'bg-emerald-500',
    },
    {
      label: '总采收量',
      value: totalQuantity,
      icon: OfficeBuilding,
      color: 'bg-blue-500',
      unit: 'kg',
    },
    {
      label: 'A级占比',
      value: gradeAPercent,
      icon: Goods,
      color: 'bg-amber-500',
      unit: '%',
    },
    {
      label: '待入库',
      value: pendingInboundCount,
      icon: OfficeBuilding,
      color: 'bg-purple-500',
    },
  ]
})

// ========== 筛选后的记录 ==========
const filteredRecords = computed(() => {
  return harvestRecords.value.filter(record => {
    if (searchFilters.value.harvestCode && !record.harvestCode?.startsWith(searchFilters.value.harvestCode)) return false
    if (searchFilters.value.batchCode && !record.batchCode?.startsWith(searchFilters.value.batchCode)) return false
    if (searchFilters.value.greenhouseId && record.greenhouseId !== searchFilters.value.greenhouseId) return false
    if (searchFilters.value.cropName && !record.cropName?.startsWith(searchFilters.value.cropName)) return false
    if (searchFilters.value.grade && record.grade !== searchFilters.value.grade) return false
    if (searchFilters.value.warehouseId && record.warehouseId !== searchFilters.value.warehouseId) return false
    if (searchFilters.value.status && record.status !== searchFilters.value.status) return false
    // 采收人员筛选
    if (searchFilters.value.harvesterName && !parseHarvesterNames(record.harvesterNames).some(n => n.startsWith(searchFilters.value.harvesterName))) return false
    return true
  })
})

// ========== 分页后的记录 ==========
const paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredRecords.value.slice(start, start + pageSize.value)
})

// 计算全局索引
const globalIndex = (localIdx) => {
  return (currentPage.value - 1) * pageSize.value + localIdx
}

// 全选状态
const allSelected = computed(() => {
  return filteredRecords.value.length > 0 && selectedRows.value.length === filteredRecords.value.length
})

// ========== 工具函数 ==========

/**
 * 安全解析采收人员数组（可能来自JSON字符串或直接数组）
 */
function parseHarvesterNames(value) {
  if (!value) return []
  if (Array.isArray(value)) return value
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/**
 * 将采收人员数组转换为逗号分隔字符串
 */
function formatHarvesterNames(value) {
  const names = parseHarvesterNames(value)
  return names.length > 0 ? names.join(', ') : '-'
}

/**
 * 格式化日期
 */
function formatDate(dateStr) {
  if (!dateStr) return '-'
  return dateStr.replace('T', ' ').slice(0, 16)
}

/**
 * 获取产品列表
 */
function getProducts(record) {
  return record.products || []
}

/**
 * 生成产品编码
 */
function generateProductCode(cropName, variety, index) {
  if (!cropName) return `PD${String(index + 1).padStart(3, '0')}`
  const seq = String(index + 1).padStart(3, '0')
  return `PD0101001${seq}`
}

/**
 * 入库类型标签
 */
function getInboundTypeLabel(type) {
  const map = {
    'seed_source': '种源入库',
    'seedling': '育苗成活入库',
    'planting_harvest': '种植采收入库'
  }
  return map[type] || type
}

function getInboundTypeBadgeClass(type) {
  const map = {
    'seed_source': 'px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs',
    'seedling': 'px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs',
    'planting_harvest': 'px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs'
  }
  return map[type] || 'px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs'
}

/**
 * 状态标签
 */
function getStatusLabel(status) {
  const map = {
    'pending': '待采收',
    'harvesting': '采收中',
    'harvested': '已采收',
    'graded': '已分级',
    'stored': '已入库'
  }
  return map[status] || status
}

function getStatusBadgeClass(status) {
  const map = {
    'pending': 'px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full',
    'harvesting': 'px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full',
    'harvested': 'px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full',
    'graded': 'px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full',
    'stored': 'px-2 py-1 bg-cyan-100 text-cyan-700 text-xs rounded-full'
  }
  return map[status] || 'px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full'
}

/**
 * 品质等级标签
 */
function getGradeBadgeClass(grade) {
  const map = {
    'A': 'px-2 py-0.5 bg-green-500 text-white text-xs rounded font-semibold',
    'B': 'px-2 py-0.5 bg-yellow-500 text-white text-xs rounded font-semibold',
    'C': 'px-2 py-0.5 bg-red-500 text-white text-xs rounded font-semibold'
  }
  return map[grade] || 'px-2 py-0.5 bg-gray-500 text-white text-xs rounded font-semibold'
}

/**
 * 切换展开行
 */
function toggleExpand(id) {
  expandedRow.value = expandedRow.value === id ? null : id
}

// ========== 事件处理函数 ==========

/**
 * 搜索
 */
function handleSearch() {
  currentPage.value = 1
}

/**
 * 重置
 */
function handleReset() {
  searchFilters.value = {
    harvestCode: '',
    batchCode: '',
    greenhouseId: '',
    cropName: '',
    grade: '',
    harvesterName: '',
    warehouseId: '',
    status: ''
  }
  currentPage.value = 1
}

/**
 * 查看详情
 */
function handleViewDetail(record) {
  selectedDetailRecord.value = record
  showDetailModal.value = true
}

/**
 * 关闭新增弹窗
 */
function handleCloseCreateModal() {
  isCreateModalOpen.value = false
}

/**
 * 创建采收记录
 */
async function handleCreateRecord(record) {
  const result = await harvestStore.createRecord(record)
  if (result.success) {
    isCreateModalOpen.value = false
    ElMessage.success('新增成功')
    await harvestStore.fetchRecords()
  } else {
    ElMessage.error(result.error || '新增失败')
  }
}

/**
 * 全选/取消全选
 */
function handleSelectAll() {
  if (selectedRows.value.length === filteredRecords.value.length) {
    selectedRows.value = []
  } else {
    selectedRows.value = filteredRecords.value.map((_, index) => index)
  }
}

/**
 * 选择/取消选择行
 */
function handleSelectRow(index) {
  const idx = selectedRows.value.indexOf(index)
  if (idx !== -1) {
    selectedRows.value.splice(idx, 1)
  } else {
    selectedRows.value.push(index)
  }
}

/**
 * 批量编辑
 */
function handleBatchEdit() {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要编辑的记录')
    return
  }
  batchEditMode.value = true
  showBatchEditModal.value = true
}

/**
 * 确认批量编辑
 */
async function handleConfirmBatchEdit() {
  const ids = Object.keys(editedRecords.value)
  if (ids.length === 0) {
    ElMessage.warning('请选择要编辑的记录')
    return
  }
  const result = await harvestStore.updateBatch(ids, editedRecords.value)
  if (result.success) {
    showBatchEditModal.value = false
    batchEditMode.value = false
    selectedRows.value = []
    editedRecordIds.value = []
    editedRecords.value = {}
    selectedRecordId.value = ''
    ElMessage.success('批量编辑成功')
    await harvestStore.fetchRecords()
  } else {
    ElMessage.error(result.error || '批量编辑失败')
  }
}

/**
 * 取消批量编辑
 */
function handleCancelBatchEdit() {
  batchEditMode.value = false
  selectedRows.value = []
  editedRecordIds.value = []
  editedRecords.value = {}
  selectedRecordId.value = ''
}

/**
 * 批量删除
 */
function handleBatchDelete() {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的记录')
    return
  }
  batchDeleteMode.value = true
  showDeleteWarning.value = true
}

/**
 * 确认批量删除
 */
async function handleConfirmBatchDelete() {
  const ids = selectedRows.value.map(index => filteredRecords.value[index]?.id).filter(Boolean)
  if (ids.length === 0) {
    ElMessage.warning('请选择要删除的记录')
    return
  }
  const result = await harvestStore.deleteRecords(ids)
  if (result.success) {
    showDeleteWarning.value = false
    batchDeleteMode.value = false
    selectedRows.value = []
    ElMessage.success('删除成功')
    await harvestStore.fetchRecords()
  } else {
    ElMessage.error(result.error || '删除失败')
  }
}

/**
 * 取消批量删除
 */
function handleCancelBatchDelete() {
  batchDeleteMode.value = false
  selectedRows.value = []
}

/**
 * 导出
 */
function handleExport() {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要导出的数据')
    return
  }
  exportMode.value = true
  showExportModal.value = true
}

/**
 * 确认导出
 */
function handleConfirmExport() {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要导出的数据')
    return
  }
  showExportModal.value = true
}

/**
 * 取消导出
 */
function handleCancelExport() {
  exportMode.value = false
  selectedRows.value = []
}

/**
 * 执行导出
 */
async function handleDoExport() {
  try {
    // 获取选中的数据
    const selectedData = filteredRecords.value.filter((_, index) => selectedRows.value.includes(index))

    // 导出表头
    const headers = ['采收单号', '采收时间', '采收区域', '入库仓库', '采收人员', '单价(元/kg)', '收入(元)', '产品编码', '作物品种', '批次号', '种植模式', '采收量(kg)', '目标产量(kg)', '完成率', '品质等级', '状态', '审核人员', '备注']

    // 展开产品明细生成导出数据
    const exportData = []
    selectedData.forEach((record, recordIdx) => {
      const harvesterNames = formatHarvesterNames(record.harvesterNames)
      const products = record.products || []
      const harvestQuantity = record.harvestQuantity || 0
      const targetYield = record.targetYield || 0
      const unit = record.unit || 'kg'

      // 如果有产品明细，展开显示
      if (products.length > 0) {
        products.forEach((product) => {
          exportData.push({
            '采收单号': record.harvestCode || '-',
            '采收时间': record.harvestDate || '-',
            '采收区域': record.greenhouseName || '-',
            '入库仓库': record.warehouseName || '-',
            '采收人员': harvesterNames,
            '单价(元/kg)': (record.unitPrice != null) ? record.unitPrice.toFixed(2) : '-',
            '收入(元)': (record.totalAmount != null) ? record.totalAmount.toFixed(2) : '-',
            '作物编码': product.cropCode || '-',
            '作物品种': product.variety || record.variety || '-',
            '批次号': record.batchCode || '-',
            '种植模式': record.plantingMode || '-',
            '采收量(kg)': `${product.harvestQuantity || 0} ${unit}`,
            '目标产量(kg)': `${product.targetYield || 0} ${unit}`,
            '完成率': `${product.targetYield > 0 ? Math.round((product.harvestQuantity || 0) / product.targetYield * 100) : 0}%`,
            '品质等级': product.grade || record.grade || '-',
            '状态': record.status === 'harvested' ? '已采收' : record.status === 'graded' ? '已分级' : '已入库',
            '审核人员': record.auditor || '-',
            '备注': product.remarks || record.remarks || '-'
          })
        })
      } else {
        // 没有产品明细时，显示主行数据
        exportData.push({
          '采收单号': record.harvestCode || '-',
          '采收时间': record.harvestDate || '-',
          '采收区域': record.greenhouseName || '-',
          '入库仓库': record.warehouseName || '-',
          '采收人员': harvesterNames,
          '单价(元/kg)': (record.unitPrice != null) ? record.unitPrice.toFixed(2) : '-',
          '收入(元)': (record.totalAmount != null) ? record.totalAmount.toFixed(2) : '-',
          '作物编码': '-',
          '产品编码': generateProductCode(record.cropName || '', record.variety || '', recordIdx),
          '作物品种': record.variety || '-',
          '批次号': record.batchCode || '-',
          '种植模式': record.plantingMode || '-',
          '采收量(kg)': `${harvestQuantity} ${unit}`,
          '目标产量(kg)': `${targetYield} ${unit}`,
          '完成率': `${targetYield > 0 ? Math.round(harvestQuantity / targetYield * 100) : 0}%`,
          '品质等级': record.grade || '-',
          '状态': record.status === 'harvested' ? '已采收' : record.status === 'graded' ? '已分级' : '已入库',
          '审核人员': record.auditor || '-',
          '备注': record.remarks || '-'
        })
      }
    })

    // 创建内容
    let content = ''
    let mimeType = ''
    let extension = ''

    if (exportFormat.value === 'csv') {
      content = '﻿' + headers.join(',') + '\n' + exportData.map(row =>
        headers.map(h => `"${row[h] || ''}"`).join(',')
      ).join('\n')
      mimeType = 'text/csv;charset=utf-8'
      extension = 'csv'
    } else if (exportFormat.value === 'excel' || exportFormat.value === 'xlsx') {
      content = `<html><head><meta charset="utf-8"></head><body><table border="1"><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>${exportData.map(row => `<tr>${headers.map(h => `<td>${row[h] || ''}</td>`).join('')}</tr>`).join('')}</table></body></html>`
      mimeType = 'application/vnd.ms-excel;charset=utf-8'
      extension = 'xls'
    } else if (exportFormat.value === 'word') {
      content = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"></head><body><table border="1">${headers.map(h => `<th>${h}</th>`).join('')}${exportData.map(row => `<tr>${headers.map(h => `<td>${row[h] || ''}</td>`).join('')}</tr>`).join('')}</table></body></html>`
      mimeType = 'application/vnd.ms-word;charset=utf-8'
      extension = 'doc'
    }

    // 文件名
    const fileName = `采收入库_${new Date().toISOString().slice(0, 10)}.${extension}`

    // 使用 Blob 下载
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
    URL.revokeObjectURL(url)

    showExportModal.value = false
    exportMode.value = false
    selectedRows.value = []
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败，请重试')
    showExportModal.value = false
    exportMode.value = false
    selectedRows.value = []
  }
}

// ========== 生命周期 ==========
onMounted(async () => {
  // 加载采收记录
  await harvestStore.fetchRecords()
  // 加载下拉选项数据
  if (greenhouseStore.greenhouses.length === 0) {
    greenhouseStore.loadGreenhouses()
  }
  if (userStore.users.length === 0) {
    userStore.loadUsers()
  }
  if (productionPlanStore.plans.length === 0) {
    productionPlanStore.fetchPlans()
  }
})
</script>

<style scoped>
/* V1.1样式保持 */
</style>
