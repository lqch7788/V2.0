<!--
  @file 生产计划主页面 - 1:1 翻译自 V1.1 ProductionPage.tsx
  @see V1.1: D:\TMcrop\yuanxingtu\V1.1\src\components\production\ProductionPage.tsx
  @description 复合组件：组装 L3 叶子组件，所有状态/逻辑由 useProductionPage 提供
-->
<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="bg-white rounded-xl p-6 shadow-none">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
            <FileText class="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">生产计划</h1>
            <p class="text-gray-500">管理种植批次、生产计划和技术方案</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <ProductionStatsCards :batches="hook.batches.value" />

    <!-- 筛选器 -->
    <ProductionFilters
      :batch-code-search="hook.batchCodeSearch.value"
      :planting-mode-search="hook.plantingModeSearch.value"
      :crop-name-search="hook.cropNameSearch.value"
      :variety-search="hook.varietySearch.value"
      :greenhouse-search="hook.greenhouseSearch.value"
      :status-filter="hook.statusFilter.value"
      :plan-type-filter="hook.planTypeFilter.value"
      :on-batch-code-change="hook.setBatchCodeSearch"
      :on-planting-mode-change="hook.setPlantingModeSearch"
      :on-crop-name-change="hook.setCropNameSearch"
      :on-variety-change="hook.setVarietySearch"
      :on-greenhouse-change="hook.setGreenhouseSearch"
      :on-status-change="hook.setStatusFilter"
      :on-plan-type-change="hook.setPlanTypeFilter"
      :on-reset="hook.resetFilters"
      :on-search="() => {}"
    />

    <!-- 生产计划列表 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
      <div class="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900">生产计划列表</h3>
        <!-- 工具栏按钮区：根据模式动态切换 -->
        <div v-if="hook.exportMode.value" class="flex gap-2">
          <button class="h-8 px-3 rounded-md text-xs font-medium inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-emerald-600 text-white hover:bg-emerald-700" @click="hook.handleConfirmExport">确认导出</button>
          <button class="h-8 px-3 rounded-md text-xs font-medium inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-gray-100 text-gray-900 hover:bg-gray-200" @click="hook.handleCancelExport">取消</button>
        </div>
        <div v-else-if="hook.batchEditMode.value" class="flex gap-2">
          <button
            class="h-8 px-3 rounded-md text-xs font-medium inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700"
            :disabled="hook.selectedRows.value.length === 0"
            @click="hook.setShowBatchEditModal(true)"
          >批量编辑</button>
          <button class="h-8 px-3 rounded-md text-xs font-medium inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-gray-100 text-gray-900 hover:bg-gray-200" @click="cancelBatchEdit">取消</button>
        </div>
        <div v-else-if="hook.batchDeleteMode.value" class="flex gap-2">
          <button
            class="h-8 px-3 rounded-md text-xs font-medium inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-red-600 text-white hover:bg-red-700"
            :disabled="hook.selectedRows.value.length === 0"
            @click="hook.setShowDeleteWarning(true)"
          >确认删除</button>
          <button class="h-8 px-3 rounded-md text-xs font-medium inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-gray-100 text-gray-900 hover:bg-gray-200" @click="cancelBatchDelete">取消</button>
        </div>
        <div v-else class="flex gap-2">
          <button v-if="canCreate" class="h-8 px-3 rounded-md text-xs font-medium inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-emerald-600 text-white hover:bg-emerald-700" @click="hook.setShowCreateModal(true)">新增</button>
          <button v-if="canEdit" class="h-8 px-3 rounded-md text-xs font-medium inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700" @click="enterBatchEditMode">编辑</button>
          <button v-if="canDelete" class="h-8 px-3 rounded-md text-xs font-medium inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-red-600 text-white hover:bg-red-700" @click="enterBatchDeleteMode">删除</button>
          <button v-if="canExport" class="h-8 px-3 rounded-md text-xs font-medium inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-emerald-600 text-white hover:bg-emerald-700" @click="hook.handleExportClick">导出</button>
        </div>
      </div>

      <!-- 表格 -->
      <ProductionTable
        :filtered-batches="hook.filteredBatches.value"
        :current-page="hook.currentPage.value"
        :page-size="hook.pageSize.value"
        :export-mode="hook.exportMode.value"
        :batch-edit-mode="hook.batchEditMode.value"
        :batch-delete-mode="hook.batchDeleteMode.value"
        :selected-rows="hook.selectedRows.value"
        :on-page-change="hook.setCurrentPage"
        :on-page-size-change="hook.handlePageSizeChange"
        :on-select-row="hook.handleSelectRow"
        :on-select-all="hook.handleSelectAll"
        :on-batch-select-all="hook.handleBatchSelectAll"
        :on-batch-delete-select-all="hook.handleBatchDeleteSelectAll"
        :on-batch-code-click="hook.setSelectedBatch"
        :edit-handler="hook.handleSingleEdit"
        :delete-handler="hook.handleSingleDelete"
        :total-count="hook.filteredBatches.value.length"
      />
    </div>

    <!-- 新增批次弹窗 -->
    <CreateBatchModal
      v-model="hook.showCreateModal.value"
      :form-data="hook.formData.value"
      :errors="hook.errors.value"
      :greenhouses="hook.greenhouses.value"
      :orders="hook.orders.value"
      @close="hook.handleClose"
      @save-draft="hook.handleSaveDraft"
      @submit-for-approval="hook.handleSubmitForApproval"
      @form-change="hook.handleFormChange"
      @generate-code="hook.generateBatchCode"
    />

    <!-- 批次详情弹窗 -->
    <BatchDetailModal
      v-model="detailVisible"
      :batch="hook.selectedBatch.value"
      @close="handleCloseDetail"
    />

    <!-- 导出格式弹窗 -->
    <MaterialExportModal
      :is-open="hook.showExportModal.value"
      :export-format="hook.exportFormat.value"
      :selected-count="hook.selectedRows.value.length"
      @format-change="hook.setExportFormat"
      @close="hook.setShowExportModal(false)"
      @export="hook.handleDoExport"
    />

    <!-- 批量编辑弹窗 -->
    <BatchEditModal
      v-model="hook.showBatchEditModal.value"
      :selected-rows="hook.selectedRows.value"
      :batches="hook.batches.value"
      :greenhouses="hook.greenhouses.value"
      :edited-batch-codes="hook.editedBatchCodes.value"
      :edited-batches="hook.editedBatches.value"
      :selected-batch-code="hook.selectedBatchCode.value"
      :on-selected-batch-code-change="hook.setSelectedBatchCode"
      :on-edited-batches-change="hook.setEditedBatches"
      :on-edited-batch-codes-change="hook.setEditedBatchCodes"
      @close="hook.setShowBatchEditModal(false)"
      @void-warning="hook.setShowVoidWarning(true)"
      @publish="hook.handlePublish"
      @save="hook.handleSave"
      @confirm-next="hook.handleConfirmNext"
    />

    <!-- 作废警告弹窗 -->
    <VoidWarningModal
      v-model="hook.showVoidWarning.value"
      @confirm="hook.handleVoidConfirm"
    />

    <!-- 删除警告弹窗 -->
    <DeleteWarningModal
      v-model="hook.showDeleteWarning.value"
      :selected-count="hook.selectedRows.value.length"
      @confirm="hook.handleDeleteConfirm"
    />
  </div>
</template>

<script setup>
/**
 * @file ProductionPage.vue
 * @description 生产计划主页面 - 1:1 翻译自 V1.1 ProductionPage.tsx
 *              逻辑全部由 useProductionPage composable 提供（L2 翻译成果）
 * @see V1.1: D:\TMcrop\yuanxingtu\V1.1\src\components\production\ProductionPage.tsx
 */
import { computed } from 'vue'
import { FileText } from 'lucide-vue-next'
import { useProductionPage } from '@/composables/production/useProductionPage'
import ProductionStatsCards from './ProductionStatsCards.vue'
import ProductionFilters from './ProductionFilters.vue'
import ProductionTable from './ProductionTable.vue'
import CreateBatchModal from './modals/CreateBatchModal.vue'
import BatchDetailModal from './modals/BatchDetailModal.vue'
import BatchEditModal from './modals/BatchEditModal.vue'
import VoidWarningModal from './modals/VoidWarningModal.vue'
import DeleteWarningModal from './modals/DeleteWarningModal.vue'
import MaterialExportModal from '@/views/warehouse/components/MaterialExportModal.vue'

// 全部使用 useProductionPage 的状态和方法（1:1 对应 V1.1 hook）
const hook = useProductionPage()

// 权限控制 - 1:1 对应 V1.1（V1.1 中所有权限均为 true）
const canCreate = true
const canEdit = true
const canDelete = true
const canExport = true

// 详情弹窗可见性：1:1 对应 V1.1（selectedBatch 不为 null 时显示）
const detailVisible = computed({
  get: () => hook.selectedBatch.value !== null,
  set: (val) => {
    if (!val) hook.setSelectedBatch(null)
  }
})

/**
 * 关闭批次详情弹窗 - 1:1 对应 V1.1 `() => hook.setSelectedBatch(null)`
 */
function handleCloseDetail() {
  hook.setSelectedBatch(null)
}

/**
 * 进入批量编辑模式 - 1:1 对应 V1.1 内联 onClick
 */
function enterBatchEditMode() {
  hook.setBatchEditMode(true)
  hook.setSelectedRows([])
}

/**
 * 取消批量编辑 - 1:1 对应 V1.1 内联 onClick
 */
function cancelBatchEdit() {
  hook.setBatchEditMode(false)
  hook.setSelectedRows([])
}

/**
 * 进入批量删除模式 - 1:1 对应 V1.1 内联 onClick
 */
function enterBatchDeleteMode() {
  hook.setBatchDeleteMode(true)
  hook.setSelectedRows([])
}

/**
 * 取消批量删除 - 1:1 对应 V1.1 内联 onClick
 */
function cancelBatchDelete() {
  hook.setBatchDeleteMode(false)
  hook.setSelectedRows([])
}
</script>
