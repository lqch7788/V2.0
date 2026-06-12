<template>
  <div class="space-y-6 p-6">
    <!-- 页面标题卡片 -->
    <div class="bg-white rounded-xl p-6 shadow-none">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
            <el-icon :size="24" style="color: white;"><List /></el-icon>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">出库记录管理</h1>
            <p class="text-gray-500">管理出库流水、按多维筛选查询、导出 CSV/XLSX/PDF 报表</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 统计卡片：7 个卡（4 数值 + 3 分类） -->
    <div class="grid grid-cols-7 gap-4 overflow-x-auto">
      <!-- 4 个数值卡 -->
      <div
        v-for="(card, i) in numberCards"
        :key="'n-' + i"
        class="bg-white rounded-lg p-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow min-w-0"
      >
        <div class="flex items-center gap-2 min-w-0">
          <div :class="['w-8 h-8 rounded-lg flex items-center justify-center shrink-0', card.color]">
            <el-icon :size="16" style="color: white;"><component :is="card.icon" /></el-icon>
          </div>
          <div class="min-w-0">
            <p class="text-xl font-bold text-gray-900 tabular-nums leading-tight truncate">
              {{ loading ? '…' : card.value.toLocaleString() }}
            </p>
            <p class="text-xs text-gray-500 leading-tight truncate">{{ card.label }}</p>
          </div>
        </div>
      </div>
      <!-- 3 个类型卡 -->
      <div
        v-for="t in typeCards"
        :key="t.key"
        class="bg-white rounded-lg p-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow min-w-0"
      >
        <div class="flex items-center gap-2 min-w-0">
          <div :class="['w-8 h-8 rounded-lg flex items-center justify-center shrink-0', t.bgClass]">
            <span :class="['text-sm font-bold', t.textClass]">{{ t.label.charAt(0) }}</span>
          </div>
          <div class="min-w-0">
            <p class="text-xl font-bold text-gray-900 tabular-nums leading-tight truncate">
              {{ loading ? '…' : t.data.count.toLocaleString() }}
            </p>
            <p class="text-xs text-gray-500 leading-tight truncate">
              {{ t.label }} · {{ loading ? '…' : t.data.quantity.toLocaleString() }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div class="flex items-end gap-4 flex-wrap">
        <!-- 开始日期 -->
        <div class="flex-1 min-w-[150px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">开始日期</label>
          <el-date-picker
            v-model="query.from"
            type="date"
            placeholder="选择开始日期"
            value-format="YYYY-MM-DD"
            class="w-full"
          />
        </div>
        <!-- 结束日期 -->
        <div class="flex-1 min-w-[150px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">结束日期</label>
          <el-date-picker
            v-model="query.to"
            type="date"
            placeholder="选择结束日期"
            value-format="YYYY-MM-DD"
            class="w-full"
          />
        </div>
        <!-- 库存类型 -->
        <div class="flex-1 min-w-[150px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">库存类型</label>
          <el-select v-model="query.stockType" placeholder="全部" clearable class="w-full">
            <el-option label="全部" value="" />
            <el-option label="种源" value="seed" />
            <el-option label="种苗" value="seedling" />
            <el-option label="成品" value="product" />
          </el-select>
        </div>
        <!-- 业务类型 -->
        <div class="flex-1 min-w-[150px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">业务类型</label>
          <el-select v-model="query.businessType" placeholder="全部" clearable class="w-full">
            <el-option label="全部" value="" />
            <el-option
              v-for="bt in businessTypeOptions"
              :key="bt.value"
              :label="bt.label"
              :value="bt.value"
            />
          </el-select>
        </div>
        <!-- 品种 -->
        <div class="flex-1 min-w-[150px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">品种</label>
          <el-input v-model="query.cropName" placeholder="品种名模糊搜索" clearable />
        </div>
        <!-- 出库人 -->
        <div class="flex-1 min-w-[150px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">出库人</label>
          <el-input v-model="query.operatorName" placeholder="操作人姓名" clearable />
        </div>
        <!-- 按钮 -->
        <div class="flex gap-2">
          <el-button type="warning" @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </div>
      </div>
    </div>

    <!-- 工具栏 -->
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold text-gray-900">出库记录列表</h2>
      <div class="flex gap-2">
        <!-- 默认模式 -->
        <template v-if="!exportMode && !deleteMode">
          <el-button type="danger" @click="handleDeleteClick">
            <el-icon><Delete /></el-icon>
            删除
          </el-button>
          <el-button @click="handleExportClick">
            <el-icon><Download /></el-icon>
            导出
          </el-button>
        </template>
        <!-- 删除模式 -->
        <template v-else-if="deleteMode">
          <el-button type="danger" @click="handleDeleteConfirm">
            <el-icon><Delete /></el-icon>
            确认删除{{ selectedRows.length > 0 ? ` (${selectedRows.length})` : '' }}
          </el-button>
          <el-button @click="handleDeleteCancel">
            <el-icon><Close /></el-icon>
            取消
          </el-button>
        </template>
        <!-- 导出模式 -->
        <template v-else-if="exportMode">
          <el-button @click="handleExportClickConfirm">
            <el-icon><Download /></el-icon>
            确认导出{{ selectedRows.length > 0 ? ` (${selectedRows.length})` : '' }}
          </el-button>
          <el-button @click="handleExportCancel">
            <el-icon><Close /></el-icon>
            取消选择
          </el-button>
        </template>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <!-- 选择操作栏 -->
      <div v-if="exportMode || deleteMode" class="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50">
        <button class="text-blue-600 hover:text-blue-800 text-sm p-1" @click="handleSelectAll">
          {{ allSelected ? '全不选' : '全选' }}
        </button>
      </div>

      <div class="overflow-auto max-h-[calc(100vh-320px)]">
        <table class="w-full">
          <thead class="bg-gradient-to-r from-blue-500 to-blue-600 text-white sticky top-0 z-10">
            <tr>
              <th
                v-if="exportMode || deleteMode"
                class="px-4 py-3 text-left text-sm font-semibold w-14 whitespace-nowrap"
              >
                <input type="checkbox" :checked="allSelected" @change="handleSelectAll" class="w-4 h-4 rounded border-white" />
              </th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">实例ID</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">流水号</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">业务单号</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">类型</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">作物</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">品种</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">种植模式</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">采收区域</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">品质</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">出库量</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">仓库</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">业务</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">出库人</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">余额前→后</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">操作</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">操作时间</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-300">
            <tr v-if="paginatedData.length === 0">
              <td :colspan="(exportMode || deleteMode) ? 17 : 16" class="px-4 py-8 text-center text-gray-500">
                暂无数据
              </td>
            </tr>
            <tr
              v-for="row in paginatedData"
              :key="row.id"
              class="hover:bg-blue-100 transition-colors"
            >
              <td v-if="exportMode || deleteMode" class="px-4 py-3">
                <input type="checkbox" :checked="selectedRows.includes(row.id)" @change="toggleRow(row.id)" class="w-4 h-4 rounded border-gray-400" />
              </td>
              <td class="px-4 py-3 text-sm whitespace-nowrap">
                <button class="text-blue-600 hover:text-blue-800 font-mono p-1" @click="handleViewDetail(row)">
                  {{ row.instanceId }}
                </button>
              </td>
              <td class="px-4 py-3 text-sm font-mono text-gray-900 whitespace-nowrap">{{ row.id }}</td>
              <td class="px-4 py-3 text-sm font-mono text-gray-700 whitespace-nowrap">{{ row.businessCode || '-' }}</td>
              <td class="px-4 py-3 whitespace-nowrap">
                <span :class="['inline-flex px-2 py-1 text-white text-xs rounded-full font-medium', stockTypeColor(row.stockType)]">
                  {{ stockTypeLabel(row.stockType) }}
                </span>
              </td>
              <td class="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{{ row.cropName || '-' }}</td>
              <td class="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{{ row.varietyName || '-' }}</td>
              <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ getPlantingModeLabel(row.plantingMode) || '-' }}</td>
              <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.greenhouseName || '-' }}</td>
              <td class="px-4 py-3 text-sm whitespace-nowrap">{{ getQualityLabel(row.grade) }}</td>
              <td class="px-4 py-3 text-sm font-medium text-emerald-600 whitespace-nowrap">{{ row.quantityOut }} {{ row.unit || '' }}</td>
              <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.warehouseName || '-' }}</td>
              <td class="px-4 py-3 whitespace-nowrap">
                <span :class="['inline-flex px-2 py-1 rounded-full text-xs font-medium', businessTypeMeta(row.businessType).color]">
                  {{ businessTypeMeta(row.businessType).label }}
                </span>
              </td>
              <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.operatorName || '-' }}</td>
              <td class="px-4 py-3 text-sm text-gray-500 font-mono whitespace-nowrap">{{ row.balanceBefore }} → {{ row.balanceAfter }}</td>
              <td class="px-4 py-3 whitespace-nowrap">
                <button class="text-blue-600 hover:text-blue-800 p-1" title="查看详情" @click="handleViewDetail(row)">
                  <el-icon><View /></el-icon>
                  详情
                </button>
              </td>
              <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.operateDate }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页 -->
      <div class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
        <Pagination
          :current-page="query.page"
          :total-pages="Math.ceil(filteredData.length / query.limit) || 1"
          :page-size="query.limit"
          :page-size-options="[10, 20, 50]"
          :show-page-size="true"
          @page-change="(page) => { query.page = page }"
          @page-size-change="(size) => { query.limit = size; query.page = 1 }"
        />
      </div>
    </div>

    <!-- 详情弹窗 -->
    <div v-if="showDetailModal" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="fixed inset-0 bg-black bg-opacity-50" @click="showDetailModal = false"></div>
      <div class="relative bg-white rounded-lg shadow-xl" style="width: 700px; max-height: 85vh; overflow-y: auto;">
        <!-- 头部 -->
        <div class="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4 flex items-center justify-between rounded-t-lg">
          <div class="flex items-center gap-2">
            <el-icon :size="20" style="color: white;"><View /></el-icon>
            <h3 class="text-lg font-semibold text-white">出库记录详情</h3>
          </div>
          <el-button circle text @click="showDetailModal = false">
            <el-icon :size="18" style="color: white;"><Close /></el-icon>
          </el-button>
        </div>
        <!-- 身体 -->
        <div class="p-6 space-y-4" v-if="detailRecord">
          <div class="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <span class="text-xs text-emerald-600 block font-medium">流水号</span>
                <span class="text-sm font-mono font-bold text-emerald-700">{{ detailRecord.id }}</span>
              </div>
              <div>
                <span class="text-xs text-emerald-600 block font-medium">业务单号</span>
                <span class="text-sm font-mono text-gray-900">{{ detailRecord.businessCode || '-' }}</span>
              </div>
              <div>
                <span class="text-xs text-emerald-600 block font-medium">库存类型</span>
                <span :class="['px-2 py-1 text-white text-xs rounded-full inline-block', stockTypeColor(detailRecord.stockType)]">
                  {{ stockTypeLabel(detailRecord.stockType) }}
                </span>
              </div>
              <div>
                <span class="text-xs text-emerald-600 block font-medium">业务类型</span>
                <span :class="['px-2 py-1 text-xs rounded-full inline-block', businessTypeMeta(detailRecord.businessType).color]">
                  {{ businessTypeMeta(detailRecord.businessType).label }}
                </span>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="bg-gray-50 rounded-lg p-4">
              <h4 class="text-sm font-semibold text-gray-700 mb-3">基础信息</h4>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-xs text-gray-500">作物名称</span>
                  <span class="text-sm text-gray-900">{{ detailRecord.cropName || '-' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-xs text-gray-500">品种</span>
                  <span class="text-sm text-gray-900">{{ detailRecord.varietyName || '-' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-xs text-gray-500">种植模式</span>
                  <span class="text-sm text-gray-900">{{ getPlantingModeLabel(detailRecord.plantingMode) || '-' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-xs text-gray-500">采收区域</span>
                  <span class="text-sm text-gray-900">{{ detailRecord.greenhouseName || '-' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-xs text-gray-500">品质等级</span>
                  <span class="text-sm text-gray-900">{{ getQualityLabel(detailRecord.grade) }}</span>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 rounded-lg p-4">
              <h4 class="text-sm font-semibold text-gray-700 mb-3">出库信息</h4>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-xs text-gray-500">出库量</span>
                  <span class="text-sm font-medium text-emerald-600">{{ detailRecord.quantityOut }} {{ detailRecord.unit || '' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-xs text-gray-500">余额变化</span>
                  <span class="text-sm font-mono text-gray-900">{{ detailRecord.balanceBefore }} → {{ detailRecord.balanceAfter }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-xs text-gray-500">仓库</span>
                  <span class="text-sm text-gray-900">{{ detailRecord.warehouseName || '-' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-xs text-gray-500">出库人</span>
                  <span class="text-sm text-gray-900">{{ detailRecord.operatorName || '-' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-xs text-gray-500">操作时间</span>
                  <span class="text-sm text-gray-900">{{ detailRecord.operateDate }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-xs text-gray-500">备注</span>
                  <span class="text-sm text-gray-500">{{ detailRecord.remarks || '-' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 导出格式选择弹窗 -->
    <div v-if="showExportModal" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="fixed inset-0 bg-black bg-opacity-50" @click="showExportModal = false"></div>
      <div class="relative bg-white rounded-lg shadow-xl" style="width: 450px;">
        <div class="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4 flex items-center justify-between rounded-t-lg">
          <div class="flex items-center gap-2">
            <el-icon :size="20" style="color: white;"><Download /></el-icon>
            <h3 class="text-lg font-semibold text-white">选择导出格式</h3>
          </div>
          <el-button circle text @click="showExportModal = false">
            <el-icon :size="18" style="color: white;"><Close /></el-icon>
          </el-button>
        </div>
        <div class="p-6 space-y-4">
          <p class="text-sm text-gray-500">已选择 <span class="font-bold text-gray-900">{{ selectedRows.length }}</span> 条记录，请选择导出格式：</p>
          <div class="grid grid-cols-3 gap-3">
            <el-button
              class="h-20 flex-col gap-1"
              @click="handleExportConfirm('csv')"
            >
              <span class="text-lg font-bold">CSV</span>
              <span class="text-xs text-gray-500">逗号分隔值</span>
            </el-button>
            <el-button
              class="h-20 flex-col gap-1"
              @click="handleExportConfirm('xlsx')"
            >
              <span class="text-lg font-bold">XLSX</span>
              <span class="text-xs text-gray-500">Excel 工作簿</span>
            </el-button>
            <el-button
              class="h-20 flex-col gap-1"
              @click="handleExportConfirm('word')"
            >
              <span class="text-lg font-bold">Word</span>
              <span class="text-xs text-gray-500">Word 文档</span>
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 删除确认弹窗 -->
    <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="fixed inset-0 bg-black bg-opacity-50" @click="showDeleteModal = false"></div>
      <div class="relative bg-white rounded-lg shadow-xl" style="width: 420px;">
        <div class="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4 flex items-center justify-between rounded-t-lg">
          <div class="flex items-center gap-2">
            <el-icon :size="20" style="color: white;"><WarningFilled /></el-icon>
            <h3 class="text-lg font-semibold text-white">确认删除</h3>
          </div>
          <el-button circle text @click="showDeleteModal = false">
            <el-icon :size="18" style="color: white;"><Close /></el-icon>
          </el-button>
        </div>
        <div class="p-6 space-y-4">
          <div class="text-center">
            <p class="text-gray-700">确定要删除选中的 <span class="font-bold text-red-600">{{ selectedRows.length }}</span> 条出库记录吗？</p>
            <p class="text-xs text-gray-500 mt-1">删除后无法恢复，请谨慎操作</p>
          </div>
          <div class="flex justify-center gap-3">
            <el-button @click="showDeleteModal = false">取消</el-button>
            <el-button type="danger" @click="handleDeleteModalConfirm">确认删除</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 出库记录管理页面 (V2.0 Vue3 迁移)
 * 对应 V1.1: src/pages/OutboundRecordsPage.tsx
 *
 * 数据来源：当前使用 mockData，后续对接后端 /api/inventory-transactions
 *
 * 布局：
 * - 顶部：4 数值 + 3 分类统计卡（共 7 卡同一行）
 * - 6 维筛选（日期、库存类型、业务类型、品种、出库人 + 重置）
 * - 列表标题 + 导出/删除按钮（工具栏模式切换）
 * - 数据表格（17 列含操作列）
 * - 详情弹窗 / 导出格式弹窗 / 删除确认弹窗
 */
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  List, View, Delete, Download, Refresh, Close, WarningFilled,
  Box, Clock, Crop
} from '@element-plus/icons-vue'
import Pagination from '@/components/ui/Pagination/Pagination.vue'

// ========== 常量定义（对应 V1.1 outboundConstants.ts） ==========

/** 出库业务类型枚举 */
const OutboundBusinessType = {
  CUSTOMER_SALE: 'customer_sale',
  TRANSFER_OUT: 'transfer_out',
  DAMAGE_LOSS: 'damage_loss',
  INTERNAL_PLANTING: 'internal_planting',
  GIFT_SAMPLE: 'gift_sample',
  RETURN_INBOUND: 'return_inbound',
  INVENTORY_ADJUST: 'inventory_adjust',
  OTHER: 'other',
}

/** 出库业务类型元数据（label + Tailwind 颜色） */
const OUTBOUND_BUSINESS_TYPE_META = {
  [OutboundBusinessType.CUSTOMER_SALE]: { label: '销售交货', color: 'bg-emerald-100 text-emerald-700' },
  [OutboundBusinessType.TRANSFER_OUT]: { label: '调拨出库', color: 'bg-blue-100 text-blue-700' },
  [OutboundBusinessType.DAMAGE_LOSS]: { label: '损耗报损', color: 'bg-red-100 text-red-700' },
  [OutboundBusinessType.INTERNAL_PLANTING]: { label: '内部种植', color: 'bg-green-100 text-green-700' },
  [OutboundBusinessType.GIFT_SAMPLE]: { label: '赠送/试吃', color: 'bg-purple-100 text-purple-700' },
  [OutboundBusinessType.RETURN_INBOUND]: { label: '退货回库', color: 'bg-amber-100 text-amber-700' },
  [OutboundBusinessType.INVENTORY_ADJUST]: { label: '盘点调整', color: 'bg-cyan-100 text-cyan-700' },
  [OutboundBusinessType.OTHER]: { label: '其他', color: 'bg-gray-100 text-gray-700' },
}

/** 业务类型下拉选项（排除 "all" 伪值，按 label 排序） */
const businessTypeOptions = Object.entries(OUTBOUND_BUSINESS_TYPE_META)
  .map(([value, meta]) => ({ value, label: meta.label }))

/** 库存类型标签映射 */
const STOCK_TYPE_LABEL_MAP = {
  seed: { label: '种源', color: 'bg-amber-500' },
  seedling: { label: '种苗', color: 'bg-green-500' },
  product: { label: '成品', color: 'bg-emerald-500' },
}

/** 品质等级映射 */
const QUALITY_GRADE_MAP = {
  A: { label: 'A级' },
  B: { label: 'B级' },
  C: { label: 'C级' },
  D: { label: '次品' },
}

/** 种植模式标签映射 */
const PLANTING_MODE_LABELS = {
  soil: '土壤种植',
  hydroponic: '水培',
  substrate: '基质栽培',
  aeroponic: '气雾栽培',
  deep_flow: '深液流',
  nutrient_film: '营养膜',
  drip_irrigation: '滴灌栽培',
  organic: '有机种植',
  greenhouse: '温室种植',
  open_field: '露天种植',
}

// ========== 工具函数 ==========
function stockTypeLabel(s) {
  return STOCK_TYPE_LABEL_MAP[s]?.label || s || '-'
}
function stockTypeColor(s) {
  return STOCK_TYPE_LABEL_MAP[s]?.color || 'bg-gray-500'
}
function businessTypeMeta(b) {
  const normalized = mapLegacyBusinessType(b)
  return OUTBOUND_BUSINESS_TYPE_META[normalized] || OUTBOUND_BUSINESS_TYPE_META[OutboundBusinessType.OTHER]
}
function mapLegacyBusinessType(legacy) {
  if (!legacy) return OutboundBusinessType.OTHER
  const legacySet = new Set(['harvest', 'purchase', 'manual', 'transfer', 'seed_source', 'seedling', 'planting'])
  if (legacySet.has(legacy)) return OutboundBusinessType.OTHER
  if (Object.values(OutboundBusinessType).includes(legacy)) return legacy
  return OutboundBusinessType.OTHER
}
function getPlantingModeLabel(mode) {
  return PLANTING_MODE_LABELS[mode] || null
}
function getQualityLabel(grade) {
  return QUALITY_GRADE_MAP[grade]?.label || grade || '-'
}

/** 默认本月 1 号到今天（避免 from/to 空） */
function getThisMonthRange() {
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  const fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  const from = fmt(new Date(now.getFullYear(), now.getMonth(), 1))
  const to = fmt(now)
  return { from, to }
}

// ========== Mock 数据 ==========
const mockData = [
  { id: 'OB-2026-0001', instanceId: 'INS-0001', stockType: 'seed', businessCode: 'SO-2026-001', businessType: 'customer_sale', cropName: '番茄', varietyName: '普罗旺斯', plantingMode: 'greenhouse', greenhouseName: 'A1-1号温室', grade: 'A', quantityOut: 500, unit: '粒', balanceBefore: 5000, balanceAfter: 4500, warehouseName: '1号种源仓库', operatorName: '张三', operateDate: '2026-06-10 14:30', remarks: '正常出库' },
  { id: 'OB-2026-0002', instanceId: 'INS-0002', stockType: 'seedling', businessCode: 'TR-2026-005', businessType: 'internal_planting', cropName: '黄瓜', varietyName: '津优1号', plantingMode: 'soil', greenhouseName: 'B2-3号温室', grade: 'B', quantityOut: 200, unit: '株', balanceBefore: 800, balanceAfter: 600, warehouseName: '2号育苗仓库', operatorName: '李四', operateDate: '2026-06-10 10:15', remarks: '内部种植调用' },
  { id: 'OB-2026-0003', instanceId: 'INS-0003', stockType: 'product', businessCode: 'SO-2026-008', businessType: 'customer_sale', cropName: '辣椒', varietyName: '朝天椒', plantingMode: 'hydroponic', greenhouseName: 'C3-2号温室', grade: 'A', quantityOut: 150, unit: 'kg', balanceBefore: 300, balanceAfter: 150, warehouseName: '3号成品仓库', operatorName: '王五', operateDate: '2026-06-09 16:45', remarks: '' },
  { id: 'OB-2026-0004', instanceId: 'INS-0004', stockType: 'seed', businessCode: 'TR-2026-003', businessType: 'transfer_out', cropName: '生菜', varietyName: '奶油生菜', plantingMode: 'nutrient_film', greenhouseName: 'D4-1号温室', grade: 'A', quantityOut: 1000, unit: '粒', balanceBefore: 3000, balanceAfter: 2000, warehouseName: '1号种源仓库', operatorName: '张三', operateDate: '2026-06-09 09:00', remarks: '调拨至B区' },
  { id: 'OB-2026-0005', instanceId: 'INS-0005', stockType: 'product', businessCode: 'DM-2026-002', businessType: 'damage_loss', cropName: '草莓', varietyName: '红颜', plantingMode: 'substrate', greenhouseName: 'E5-2号温室', grade: 'B', quantityOut: 30, unit: 'kg', balanceBefore: 120, balanceAfter: 90, warehouseName: '3号成品仓库', operatorName: '赵六', operateDate: '2026-06-08 11:20', remarks: '运输损耗' },
  { id: 'OB-2026-0006', instanceId: 'INS-0006', stockType: 'seedling', businessCode: 'GS-2026-001', businessType: 'gift_sample', cropName: '番茄', varietyName: '樱桃番茄', plantingMode: 'greenhouse', greenhouseName: 'A1-3号温室', grade: 'A', quantityOut: 50, unit: '株', balanceBefore: 500, balanceAfter: 450, warehouseName: '2号育苗仓库', operatorName: '李四', operateDate: '2026-06-08 08:30', remarks: '客户试吃赠送' },
  { id: 'OB-2026-0007', instanceId: 'INS-0007', stockType: 'product', businessCode: 'RV-2026-001', businessType: 'return_inbound', cropName: '黄瓜', varietyName: '津优1号', plantingMode: 'soil', greenhouseName: 'B2-3号温室', grade: 'C', quantityOut: 80, unit: 'kg', balanceBefore: 200, balanceAfter: 120, warehouseName: '3号成品仓库', operatorName: '王五', operateDate: '2026-06-07 15:00', remarks: '退货处理' },
  { id: 'OB-2026-0008', instanceId: 'INS-0008', stockType: 'seed', businessCode: 'IA-2026-003', businessType: 'inventory_adjust', cropName: '辣椒', varietyName: '线椒', plantingMode: 'drip_irrigation', greenhouseName: 'C3-4号温室', grade: 'B', quantityOut: 200, unit: '粒', balanceBefore: 1500, balanceAfter: 1300, warehouseName: '1号种源仓库', operatorName: '张三', operateDate: '2026-06-07 11:00', remarks: '季度盘点调整' },
  { id: 'OB-2026-0009', instanceId: 'INS-0009', stockType: 'product', businessCode: 'SO-2026-012', businessType: 'customer_sale', cropName: '茄子', varietyName: '紫长茄', plantingMode: 'organic', greenhouseName: 'F6-1号温室', grade: 'A', quantityOut: 300, unit: 'kg', balanceBefore: 500, balanceAfter: 200, warehouseName: '3号成品仓库', operatorName: '赵六', operateDate: '2026-06-06 17:30', remarks: '' },
  { id: 'OB-2026-0010', instanceId: 'INS-0010', stockType: 'seedling', businessCode: 'IP-2026-004', businessType: 'internal_planting', cropName: '西瓜', varietyName: '早佳8424', plantingMode: 'open_field', greenhouseName: 'G7-2号温室', grade: 'A', quantityOut: 100, unit: '株', balanceBefore: 400, balanceAfter: 300, warehouseName: '2号育苗仓库', operatorName: '李四', operateDate: '2026-06-06 07:00', remarks: '' },
  { id: 'OB-2026-0011', instanceId: 'INS-0011', stockType: 'product', businessCode: 'OTH-2026-001', businessType: 'other', cropName: '草莓', varietyName: '章姬', plantingMode: 'substrate', greenhouseName: 'E5-3号温室', grade: 'B', quantityOut: 25, unit: 'kg', balanceBefore: 100, balanceAfter: 75, warehouseName: '3号成品仓库', operatorName: '王五', operateDate: '2026-06-05 14:00', remarks: '其他原因出库' },
  { id: 'OB-2026-0012', instanceId: 'INS-0012', stockType: 'seed', businessCode: 'SO-2026-015', businessType: 'customer_sale', cropName: '番茄', varietyName: '金棚1号', plantingMode: 'greenhouse', greenhouseName: 'A1-5号温室', grade: 'A', quantityOut: 800, unit: '粒', balanceBefore: 3000, balanceAfter: 2200, warehouseName: '1号种源仓库', operatorName: '张三', operateDate: '2026-06-04 16:00', remarks: '' },
]

// ========== 响应式状态 ==========

/** 筛选条件（默认本月） */
const query = reactive({
  from: getThisMonthRange().from,
  to: getThisMonthRange().to,
  stockType: '',
  businessType: '',
  cropName: '',
  operatorName: '',
  page: 1,
  limit: 50,
})

/** 模式标记 */
const exportMode = ref(false)
const deleteMode = ref(false)

/** 选中的行 ID 列表 */
const selectedRows = ref([])

/** 弹窗状态 */
const showDetailModal = ref(false)
const showExportModal = ref(false)
const showDeleteModal = ref(false)

/** 当前查看的详情记录 */
const detailRecord = ref(null)

/** 加载态 */
const loading = ref(false)

/** 表格组件引用 */
const tableRef = ref(null)

// ========== 计算属性 ==========

/** 按筛选条件过滤数据 */
const filteredData = computed(() => {
  let data = [...mockData]
  if (query.from) {
    data = data.filter(r => r.operateDate >= query.from)
  }
  if (query.to) {
    data = data.filter(r => r.operateDate <= (query.to + ' 23:59:59'))
  }
  if (query.stockType) {
    data = data.filter(r => r.stockType === query.stockType)
  }
  if (query.businessType) {
    data = data.filter(r => r.businessType === query.businessType)
  }
  if (query.cropName) {
    const kw = query.cropName.toLowerCase()
    data = data.filter(r =>
      (r.cropName || '').toLowerCase().includes(kw) ||
      (r.varietyName || '').toLowerCase().includes(kw)
    )
  }
  if (query.operatorName) {
    const kw = query.operatorName.toLowerCase()
    data = data.filter(r => (r.operatorName || '').toLowerCase().includes(kw))
  }
  return data
})

/** 当前页数据 */
const paginatedData = computed(() => {
  const start = (query.page - 1) * query.limit
  return filteredData.value.slice(start, start + query.limit)
})

/** 汇总统计 */
const summary = computed(() => {
  const data = filteredData.value
  const byStockType = { seed: { count: 0, quantity: 0 }, seedling: { count: 0, quantity: 0 }, product: { count: 0, quantity: 0 } }
  const today = new Date().toISOString().slice(0, 10)
  let todayCount = 0
  data.forEach(r => {
    if (byStockType[r.stockType]) {
      byStockType[r.stockType].count++
      byStockType[r.stockType].quantity += r.quantityOut
    }
    if (r.operateDate && r.operateDate.slice(0, 10) === today) {
      todayCount++
    }
  })
  return {
    totalCount: data.length,
    totalQuantity: data.reduce((s, r) => s + r.quantityOut, 0),
    todayCount,
    byStockType,
  }
})

/** 统计卡片配置 */
const numberCards = computed(() => [
  { label: '总条数', value: summary.value.totalCount, color: 'bg-blue-500', icon: List },
  { label: '总出库量', value: summary.value.totalQuantity, color: 'bg-emerald-500', icon: Box },
  { label: '今日出库', value: summary.value.todayCount, color: 'bg-orange-500', icon: Clock },
  { label: '品种数', value: Object.keys(summary.value.byStockType).filter(k => summary.value.byStockType[k].count > 0).length, color: 'bg-purple-500', icon: Crop },
])

const typeCards = computed(() => [
  { key: 'seed', label: '种源', data: summary.value.byStockType.seed, bgClass: 'bg-amber-100', textClass: 'text-amber-700' },
  { key: 'seedling', label: '种苗', data: summary.value.byStockType.seedling, bgClass: 'bg-green-100', textClass: 'text-green-700' },
  { key: 'product', label: '成品', data: summary.value.byStockType.product, bgClass: 'bg-emerald-100', textClass: 'text-emerald-700' },
])

/** 全选状态 */
const allSelected = computed(() => {
  return paginatedData.value.length > 0 && paginatedData.value.every(r => selectedRows.value.includes(r.id))
})

// ========== 筛选方法 ==========

function handleReset() {
  const range = getThisMonthRange()
  query.from = range.from
  query.to = range.to
  query.stockType = ''
  query.businessType = ''
  query.cropName = ''
  query.operatorName = ''
  query.page = 1
}

/** 筛选条件变化时回到第 1 页 */
watch(
  () => [query.from, query.to, query.stockType, query.businessType, query.cropName, query.operatorName],
  () => { query.page = 1 }
)

// ========== 模式切换 ==========

/** 退出任何模式时清空选中 */
watch(
  () => [exportMode.value, deleteMode.value],
  ([exp, del]) => {
    if (!exp && !del) {
      selectedRows.value = []
    }
  }
)

// ========== 导出方法 ==========

function handleExportClick() {
  exportMode.value = true
  selectedRows.value = []
}

function handleExportCancel() {
  exportMode.value = false
  selectedRows.value = []
}

function handleExportClickConfirm() {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要导出的数据（点表格左侧 checkbox）')
    return
  }
  showExportModal.value = true
}

function handleExportConfirm(format) {
  showExportModal.value = false
  const selectedData = mockData.filter(r => selectedRows.value.includes(r.id))
  if (format === 'csv') {
    exportAsCSV(selectedData)
  } else if (format === 'xlsx') {
    ElMessage.info('XLSX 导出功能：已选择 ' + selectedData.length + ' 条记录（需对接后端导出服务）')
  } else if (format === 'word') {
    ElMessage.info('Word 导出功能：已选择 ' + selectedData.length + ' 条记录（需对接后端导出服务）')
  }
  exportMode.value = false
  selectedRows.value = []
}

function exportAsCSV(data) {
  const headers = ['流水号', '实例ID', '业务单号', '类型', '作物', '品种', '种植模式', '采收区域', '品质', '出库量', '单位', '仓库', '业务', '出库人', '余额前', '余额后', '操作时间']
  const rows = data.map(r => [
    r.id, r.instanceId, r.businessCode, stockTypeLabel(r.stockType),
    r.cropName, r.varietyName, getPlantingModeLabel(r.plantingMode) || '', r.greenhouseName,
    getQualityLabel(r.grade), r.quantityOut, r.unit, r.warehouseName,
    businessTypeMeta(r.businessType).label, r.operatorName, r.balanceBefore, r.balanceAfter, r.operateDate
  ])
  let csv = '﻿' + headers.join(',') + '\n'
  rows.forEach(r => { csv += r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',') + '\n' })
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `outbound-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success(`CSV 下载已开始（共 ${data.length} 条）`)
}

// ========== 删除方法 ==========

function handleDeleteClick() {
  deleteMode.value = true
  selectedRows.value = []
}

function handleDeleteCancel() {
  deleteMode.value = false
  selectedRows.value = []
}

function handleDeleteConfirm() {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的出库记录')
    return
  }
  showDeleteModal.value = true
}

function handleDeleteModalConfirm() {
  // 从 mockData 中移除选中的记录
  const ids = new Set(selectedRows.value)
  const idxList = []
  for (let i = mockData.length - 1; i >= 0; i--) {
    if (ids.has(mockData[i].id)) {
      idxList.push(i)
    }
  }
  idxList.forEach(i => mockData.splice(i, 1))
  ElMessage.success(`已删除 ${selectedRows.value.length} 条记录`)
  showDeleteModal.value = false
  selectedRows.value = []
  deleteMode.value = false
}

// ========== 选择方法 ==========

function handleSelectAll() {
  if (allSelected.value) {
    selectedRows.value = []
  } else {
    selectedRows.value = paginatedData.value.map(r => r.id)
  }
}

/** 单行选中切换 */
function toggleRow(id) {
  if (selectedRows.value.includes(id)) {
    selectedRows.value = selectedRows.value.filter(rid => rid !== id)
  } else {
    selectedRows.value = [...selectedRows.value, id]
  }
}

function handleSelectionChange(selection) {
  // el-table 的 selection-change 事件返回的是行对象数组，不是 ID 数组
  // 但由于我们传的是 row-key="(row) => row.id"，这里恢复为 ID 列表
  // 同时保留那些不在当前页但已被选中的记录
  const currentPageIds = new Set(paginatedData.value.map(r => r.id))
  const otherPageSelected = selectedRows.value.filter(id => !currentPageIds.has(id))
  const currentSelected = selection.map(r => r.id)
  selectedRows.value = [...otherPageSelected, ...currentSelected]
}

// ========== 详情方法 ==========

function handleViewDetail(row) {
  detailRecord.value = row
  showDetailModal.value = true
}
</script>

<script>
export default { name: 'OutboundRecords' }
</script>

