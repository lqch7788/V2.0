<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
          <Package :size="24" class="text-white" />
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">物料审批</h1>
          <p class="text-gray-500">领料、退料、采购审批流程管理</p>
        </div>
      </div>
    </div>

    <!-- 统计卡片 - V1.1: bg-[#F2F6FA] -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <FileText :size="20" class="text-blue-600" />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ stats.total }}</p>
            <p class="text-xs text-gray-500">总申请数</p>
          </div>
        </div>
      </div>
      <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
            <Clock :size="20" class="text-amber-600" />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ stats.pending }}</p>
            <p class="text-xs text-gray-500">待审批</p>
          </div>
        </div>
      </div>
      <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
            <CheckCircle :size="20" class="text-emerald-600" />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ stats.approved }}</p>
            <p class="text-xs text-gray-500">已通过</p>
          </div>
        </div>
      </div>
      <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
            <XCircle :size="20" class="text-red-600" />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ stats.rejected }}</p>
            <p class="text-xs text-gray-500">已拒绝</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab切换 -->
    <div class="bg-white rounded-xl p-1 inline-flex shadow-sm">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :class="['px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors', activeTab === tab.key ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-100']"
        @click="handleTabChange(tab.key)"
      >
        <component :is="tab.icon" :size="16" />
        {{ tab.label }}
      </button>
    </div>

    <!-- 筛选区域-->
    <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm">
      <div class="grid grid-cols-8 gap-3 items-end">
        <!-- 领料单号 -->
        <div>
          <label class="text-xs text-gray-700 block mb-1">领料单号</label>
          <input v-model="searchTerm" placeholder="单号..." class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm" />
        </div>

        <!-- 申领人-->
        <div>
          <label class="text-xs text-gray-700 block mb-1">申领人</label>
          <input v-model="searchApplicant" placeholder="申请人.." class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm" />
        </div>

        <!-- 部门 -->
        <div>
          <label class="text-xs text-gray-700 block mb-1">部门</label>
          <select v-model="searchDepartment" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm bg-white">
            <option value="全部">全部</option>
            <option value="生产部">生产部</option>
            <option value="技术部">技术部</option>
            <option value="后勤部">后勤部</option>
            <option value="设备部">设备部</option>
          </select>
        </div>

        <!-- 生产批次-->
        <div>
          <label class="text-xs text-gray-700 block mb-1">生产批次号</label>
          <input v-model="searchBatchCode" placeholder="批次号.." class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm" />
        </div>

        <!-- 开始日期-->
        <div>
          <label class="text-xs text-gray-700 block mb-1">开始日期</label>
          <input
            v-model="searchDateStart"
            type="date"
            class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm"
          />
        </div>

        <!-- 结束日期 -->
        <div>
          <label class="text-xs text-gray-700 block mb-1">结束日期</label>
          <input
            v-model="searchDateEnd"
            type="date"
            class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm"
          />
        </div>

        <!-- 状态-->
        <div>
          <label class="text-xs text-gray-700 block mb-1">状态</label>
          <select v-model="statusFilter" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm bg-white">
            <option value="全部">全部</option>
            <option value="待审批">待审批</option>
            <option value="已通过">已通过</option>
            <option value="已拒绝">已拒绝</option>
          </select>
        </div>

        <!-- 按钮区域 -->
        <div class="flex gap-2">
          <button class="h-8 px-3 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 flex-1" @click="handleSearch">搜索</button>
          <button class="h-8 px-3 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 flex-1" @click="handleReset">
            <RefreshCw :size="16" class="inline mr-1" />重置
          </button>
        </div>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <!-- 表格标题行-->
      <div class="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900">{{ currentTabLabel }}</h3>
        <!-- 批量操作按钮 -->
        <div class="flex items-center gap-2">
          <button
            :disabled="selectedIds.size === 0"
            :class="[
              'h-8 px-3 rounded-md text-sm font-medium',
              selectedIds.size === 0
                ? 'bg-emerald-500 text-white cursor-not-allowed opacity-60'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
            ]"
            @click="handleBatchApprove"
          >
            <CheckCircle :size="16" class="inline mr-1" />批量通过
          </button>
          <button
            :disabled="selectedIds.size === 0"
            :class="[
              'h-8 px-3 rounded-md text-sm font-medium',
              selectedIds.size === 0
                ? 'bg-red-500 text-white cursor-not-allowed opacity-60'
                : 'bg-red-600 hover:bg-red-700 text-white shadow-sm'
            ]"
            @click="handleBatchReject"
          >
            <XCircle :size="16" class="inline mr-1" />批量拒绝
          </button>
          <button
            :disabled="selectedIds.size === 0"
            :class="[
              'h-8 px-3 rounded-md text-sm font-medium',
              selectedIds.size === 0
                ? 'bg-blue-500 text-white cursor-not-allowed opacity-60'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
            ]"
            @click="handleExport"
          >
            <Download :size="16" class="inline mr-1" />批量导出
          </button>
        </div>
      </div>

      <!-- 表格内容 - 领料审批表格 -->
      <div v-if="activeTab === 'material'" class="overflow-auto max-h-[calc(100vh-400px)]">
        <table class="w-full">
          <thead class="bg-gradient-to-r from-blue-500 to-blue-600 text-white sticky top-0 z-10">
            <tr>
              <th class="px-4 py-3 text-left text-sm font-semibold w-14 whitespace-nowrap"></th>
              <th class="px-4 py-3 text-left text-sm font-semibold w-12 whitespace-nowrap"></th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">领料单号</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">申请日期</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">申请人</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">部门</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">库存地点</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">物料种类</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">种植区域/用途</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">审核人</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">生产计划批次号</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">状态</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">备注</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-300">
            <tr v-if="paginatedData.length === 0">
              <td colspan="14" class="px-4 py-8 text-center text-gray-500">暂无审批记录</td>
            </tr>
            <template v-for="row in paginatedData" :key="row.id">
              <tr class="hover:bg-blue-100 transition-colors">
                <td class="px-4 py-3">
                  <button v-if="row.status === 'pending'" class="p-1" @click="handleToggleSelect(row.id)">
                    <Check v-if="selectedIds.has(row.id)" :size="16" class="text-emerald-600" />
                    <PlusCircle v-else :size="16" class="text-gray-400" />
                  </button>
                </td>
                <td class="px-4 py-3">
                  <button class="text-gray-500 hover:text-blue-600 p-1" @click="handleExpandRow(row.id)">
                    <ChevronDown v-if="expandedRows.includes(row.id)" :size="14" />
                    <ChevronRight v-else :size="14" />
                  </button>
                </td>
                <td class="px-4 py-3 text-sm font-medium text-blue-600 whitespace-nowrap">{{ row.code }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.applyDate }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.applicantName }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.applicantDepartment }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.warehouseLocation }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.materials?.length > 0 ? `${row.materials.length}种` : '-' }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.plantArea }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.approvers?.[0]?.userName || '-' }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.batchCode }}</td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <span class="inline-flex px-2 py-1 rounded-full text-xs font-medium" :class="{
                    'bg-green-100 text-green-700': row.status === 'approved',
                    'bg-red-100 text-red-700': row.status === 'rejected',
                    'bg-amber-100 text-amber-700': row.status === 'pending'
                  }">{{ getStatusText(row.status) }}</span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.description }}</td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <div class="flex items-center gap-1">
                    <button v-if="row.status === 'pending' && canApprove" class="text-green-600 hover:text-green-800 p-1" title="通过" @click="handleApprove(row)">
                      <CheckCircle :size="16" />
                    </button>
                    <button v-if="row.status === 'pending' && canApprove" class="text-red-600 hover:text-red-800 p-1" title="拒绝" @click="handleRejectClick(row)">
                      <XCircle :size="16" />
                    </button>
                    <button class="text-blue-600 hover:text-blue-800 p-1" title="查看详情" @click="handleViewDetail(row)">
                      <Eye :size="16" />
                    </button>
                  </div>
                </td>
              </tr>
              <!-- 展开行：领料物料明细 -->
              <tr v-if="expandedRows.includes(row.id)" :key="'exp-' + row.id" class="bg-gray-50">
                <td colspan="14" class="p-4">
                  <div class="font-medium text-blue-800 mb-2">物料明细</div>
                  <div class="overflow-x-auto mb-3">
                    <table class="w-full border border-gray-200">
                      <thead class="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
                        <tr>
                          <th class="px-3 py-2 text-left text-xs font-semibold whitespace-nowrap">物料编码</th>
                          <th class="px-3 py-2 text-left text-xs font-semibold whitespace-nowrap">物料名称</th>
                          <th class="px-3 py-2 text-left text-xs font-semibold whitespace-nowrap">规格</th>
                          <th class="px-3 py-2 text-left text-xs font-semibold whitespace-nowrap">单位</th>
                          <th class="px-3 py-2 text-left text-xs font-semibold whitespace-nowrap">申领数量</th>
                          <th class="px-3 py-2 text-left text-xs font-semibold whitespace-nowrap">当前库存</th>
                          <th class="px-3 py-2 text-left text-xs font-semibold whitespace-nowrap">单价(元)</th>
                          <th class="px-3 py-2 text-left text-xs font-semibold whitespace-nowrap">小计(元)</th>
                          <th class="px-3 py-2 text-left text-xs font-semibold whitespace-nowrap">仓库货位</th>
                          <th class="px-3 py-2 text-left text-xs font-semibold whitespace-nowrap">备注</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-gray-200">
                        <tr v-for="m in row.materials" :key="m.id || m.materialCode" class="hover:bg-white">
                          <td class="px-3 py-2 text-sm text-gray-600 whitespace-nowrap">{{ m.materialCode }}</td>
                          <td class="px-3 py-2 text-sm text-gray-600 whitespace-nowrap">{{ m.materialName }}</td>
                          <td class="px-3 py-2 text-sm text-gray-600 whitespace-nowrap">{{ m.spec }}</td>
                          <td class="px-3 py-2 text-sm text-gray-600 whitespace-nowrap">{{ m.unit }}</td>
                          <td class="px-3 py-2 text-sm text-gray-600 whitespace-nowrap">{{ m.requestedQuantity }}</td>
                          <td class="px-3 py-2 text-sm text-gray-600 whitespace-nowrap">{{ m.stockQuantity }}</td>
                          <td class="px-3 py-2 text-sm text-gray-600 whitespace-nowrap">{{ m.unitPrice != null ? m.unitPrice.toFixed(2) : '-' }}</td>
                          <td class="px-3 py-2 text-sm text-gray-600 whitespace-nowrap">{{ m.unitPrice != null ? (m.requestedQuantity * m.unitPrice).toFixed(2) : '-' }}</td>
                          <td class="px-3 py-2 text-sm text-gray-600 whitespace-nowrap">{{ m.warehousePosition }}</td>
                          <td class="px-3 py-2 text-sm text-gray-600 whitespace-nowrap">{{ m.remark }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div v-if="row.description" class="text-gray-600 mt-3">
                    <span class="font-medium">申请说明：</span>{{ row.description }}
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- 退料审批表格 - 已拆分为子组件 -->
      <ReturnApprovalTable
        v-else-if="activeTab === 'return'"
        :data="paginatedData"
        :selected-ids="selectedIds"
        :expanded-rows="expandedRows"
        :can-approve="canApprove"
        @toggle-select="handleToggleSelect"
        @expand-row="handleExpandRow"
        @approve="handleApprove"
        @reject="handleRejectClick"
        @view-detail="handleViewDetail"
      />

      <!-- 通用审批表格（仓库相关审批：入库/调拨/种源入库等） -->
      <div v-else class="overflow-auto max-h-[calc(100vh-400px)]">
        <table class="w-full">
          <thead class="bg-gradient-to-r from-blue-500 to-blue-600 text-white sticky top-0 z-10">
            <tr>
              <th class="px-4 py-3 text-left text-sm font-semibold w-14 whitespace-nowrap"></th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">审批单号</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">标题</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">申请人</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">部门</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">申请时间</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">状态</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-300">
            <tr v-if="paginatedData.length === 0">
              <td colspan="8" class="px-4 py-8 text-center text-gray-500">暂无审批记录</td>
            </tr>
            <tr v-for="row in paginatedData" :key="row.id" class="hover:bg-blue-100 transition-colors">
              <td class="px-4 py-3">
                <button v-if="row.status === 'pending'" class="p-1" @click="handleToggleSelect(row.id)">
                  <Check v-if="selectedIds.has(row.id)" :size="16" class="text-emerald-600" />
                  <PlusCircle v-else :size="16" class="text-gray-400" />
                </button>
              </td>
              <td class="px-4 py-3 text-sm font-medium text-blue-600 whitespace-nowrap">{{ row.code }}</td>
              <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.title }}</td>
              <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.applicantName }}</td>
              <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.applicantDepartment }}</td>
              <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.applyDate }}</td>
              <td class="px-4 py-3 whitespace-nowrap">
                <span class="inline-flex px-2 py-1 rounded-full text-xs font-medium" :class="{
                  'bg-green-100 text-green-700': row.status === 'approved',
                  'bg-red-100 text-red-700': row.status === 'rejected',
                  'bg-amber-100 text-amber-700': row.status === 'pending'
                }">{{ getStatusText(row.status) }}</span>
              </td>
              <td class="px-4 py-3 whitespace-nowrap">
                <div class="flex items-center gap-1">
                  <button v-if="row.status === 'pending' && canApprove" class="text-green-600 hover:text-green-800 p-1" title="通过" @click="handleApprove(row)">
                    <CheckCircle :size="16" />
                  </button>
                  <button v-if="row.status === 'pending' && canApprove" class="text-red-600 hover:text-red-800 p-1" title="拒绝" @click="handleRejectClick(row)">
                    <XCircle :size="16" />
                  </button>
                  <button class="text-blue-600 hover:text-blue-800 p-1" title="查看详情" @click="handleViewDetail(row)">
                    <Eye :size="16" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页 -->
      <div class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
        <el-pagination
          v-model:current-page="currentPage"
          :total="approvals.length"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="() => { currentPage = 1; expandedRows = [] }"
        />
      </div>
    </div>

    <!-- 详情弹窗 - 已拆分为子组件 -->
    <MaterialDetailDialog
      v-model="detailModal.show"
      :item="detailModal.item"
      :active-tab="activeTab"
      :can-approve="canApprove"
      @approve="handleApprove"
      @reject="handleRejectClick"
    />

    <!-- 拒绝原因弹窗 - 已拆分为子组件 -->
    <RejectReasonDialog
      v-model="rejectModal.show"
      :item="rejectModal.item"
      v-model:reason="rejectModal.reason"
      @confirm="handleConfirmReject"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Package,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Eye,
  RotateCcw,
  ShoppingCart,
  Download,
  Check,
  PlusCircle,
  ChevronDown,
  ChevronRight,
  X,
} from 'lucide-vue-next'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useApprovalStore } from '@/stores/modules/approval'
import { storeToRefs } from 'pinia'
import MaterialDetailDialog from './components/MaterialDetailDialog.vue'
import RejectReasonDialog from './components/RejectReasonDialog.vue'
import ReturnApprovalTable from './components/ReturnApprovalTable.vue'
import {
  getCategoryByCode,
  getStatusText,
  getStatusTagType,
  getReturnStatusText,
  getReturnStatusTagType,
  getReturnType,
} from './utils/materialApprovalLabels'

// 审批Store
const approvalStore = useApprovalStore()
const { approvals } = storeToRefs(approvalStore)

// 审批类型常量（与V1.1对齐
const ApprovalType = {
  MATERIAL_REQUEST: 'material_request',
  RETURN_MATERIAL: 'return_material',
  PURCHASE_REQUEST: 'purchase_request',
  MATERIAL_INBOUND: 'material_inbound',
  MATERIAL_TRANSFER: 'material_transfer',
  SEED_SOURCE_INBOUND: 'seed_source_inbound',
  SEEDLING_PLAN: 'seedling_plan',
  PLANTING_PLAN: 'planting_plan',
  ORDER_CREATE: 'order_create',
  ORDER_CHANGE: 'order_change',
  SEED_SOURCE_SUPPLEMENTARY: 'seed_source_supplementary',
  SEEDLING_SUPPLEMENTARY: 'seedling_supplementary',
  CROP_STORAGE_SUPPLEMENTARY: 'crop_storage_supplementary',
}

// Tab配置：与V1.1 useMaterialApproval hook L64-71 完全对齐 6 Tab
// 修复 P0-MA-001：恢复 V1.1 6 Tab 配置（V2.0 多了 4 个：采购审批/育苗计划/种植计划/订单管理）
// 备注：以下 4 个 Tab 为 V2.0 P0-EX 自我创造，**不直接删除**（避免破坏 V1.1 数据流与生产依赖），
// 用注释保留，TODO 待确认。后续专项整改时再决定去留。
// TODO-P0-EX-MA: 列待确认 - 采购审批/育苗计划/种植计划/订单管理 是否保留？
//   - 采购审批: 实际归 ProductionApproval 处理（Purchase Tab 已在生产审批页）
//   - 育苗计划/种植计划/订单管理: 实际归其他业务页（Production/Order），非本页面职责
//   结论: 应全部移除，迁移到对应业务页或 ProductionApproval
const tabs = [
  { key: 'material', label: '领料审批', icon: FileText, types: [ApprovalType.MATERIAL_REQUEST] },
  { key: 'return', label: '退料审批', icon: RotateCcw, types: [ApprovalType.RETURN_MATERIAL] },
  { key: 'purchase', label: '采购审批', icon: ShoppingCart, types: [ApprovalType.PURCHASE_REQUEST], path: '/material-receiving' },
]

// V1.1 原有3个Tab: material(领料审批) + return(退料审批) + purchase(采购审批→跳转/material-receiving)
const hasSpecialTable = (tab) => ['material', 'return', 'purchase'].includes(tab)

// 统计数据
const stats = reactive({
  total: 0,
  pending: 0,
  approved: 0,
  rejected: 0,
})

// 筛选状态
const activeTab = ref('material')
const searchTerm = ref('')
const statusFilter = ref('全部')
const searchApplicant = ref('')
const searchBatchCode = ref('')
const searchDepartment = ref('全部')
const searchDateStart = ref('')
const searchDateEnd = ref('')

// 分页状态
const currentPage = ref(1)
const pageSize = ref(10)

// 展开行状态
const expandedRows = ref([])

// 详情弹窗状态
const detailModal = reactive({
  show: false,
  item: null,
})

// 拒绝原因弹窗状态
const rejectModal = reactive({
  show: false,
  item: null,
  reason: '',
})

// 权限
const canApprove = true
const loading = ref(false)

// 批量选择
const selectedIds = ref(new Set())

// 切换选择
const handleToggleSelect = (id) => {
  const newSelected = new Set(selectedIds.value)
  if (newSelected.has(id)) {
    newSelected.delete(id)
  } else {
    newSelected.add(id)
  }
  selectedIds.value = newSelected
}

// 搜索方法
const handleSearch = () => {
  currentPage.value = 1
}

// 更新统计数据
const updateStats = () => {
  stats.total = getCurrentData.value.length
  stats.pending = getCurrentData.value.filter(d => d.status === 'pending').length
  stats.approved = getCurrentData.value.filter(d => d.status === 'approved').length
  stats.rejected = getCurrentData.value.filter(d => d.status === 'rejected').length
}

// 批量通过
const handleBatchApprove = async () => {
  if (selectedIds.value.size === 0) return
  try {
    await ElMessageBox.confirm(`确定要批量通过 ${selectedIds.value.size} 项审批吗？`, '批量审核确认', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'success',
    })
    const ids = Array.from(selectedIds.value)
    await approvalStore.batchApprove(ids)
    await approvalStore.fetchApprovals()
    selectedIds.value = new Set()
    updateStats()
    ElMessage.success('批量审批通过成功')
  } catch {}
}

// 批量拒绝
const handleBatchReject = async () => {
  if (selectedIds.value.size === 0) return
  try {
    await ElMessageBox.confirm(`确定要批量拒绝${selectedIds.value.size} 项审批吗？`, '批量审核确认', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    })
    const ids = Array.from(selectedIds.value)
    await approvalStore.batchReject(ids, '批量拒绝')
    await approvalStore.fetchApprovals()
    selectedIds.value = new Set()
    updateStats()
    ElMessage.success('批量审批拒绝成功')
  } catch {}
}

// 批量导出
const handleExport = () => {
  if (selectedIds.value.size === 0) return
  const selectedData = paginatedData.value.filter(d => selectedIds.value.has(d.id))
  const exportData = selectedData.map(d => ({
    单号: d.code,
    标题: d.title,
    申请人: d.applicantName,
    部门: d.applicantDepartment,
    申请时间: d.applyDate,
    状态: getStatusText(d.status),
  }))
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `物料审批_${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('导出成功')
}

// 当前Tab标签
const currentTabLabel = computed(() => {
  return tabs.find(t => t.key === activeTab.value)?.label || ''
})

// 根据Tab类型筛选数据
const getCurrentData = computed(() => {
  const currentTab = tabs.find(t => t.key === activeTab.value)
  if (!currentTab || !currentTab.types) return []
  return approvals.value.filter(a => currentTab.types.includes(a.type))
})

// 筛选数据
const filteredData = computed(() => {
  return getCurrentData.value.filter(item => {
    const matchSearch =
      item.title?.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      item.applicantName?.includes(searchTerm.value) ||
      item.code?.includes(searchTerm.value)
    const matchStatus =
      statusFilter.value === '全部' ||
      // P0-MA-002: "待审核" → "待审批"（V1.1 useMaterialApproval hook L89-91）
      (statusFilter.value === '待审批' && item.status === 'pending') ||
      (statusFilter.value === '已通过' && item.status === 'approved') ||
      (statusFilter.value === '已拒绝' && item.status === 'rejected')
    const matchApplicant = !searchApplicant.value || item.applicantName?.includes(searchApplicant.value)
    const matchBatchCode = !searchBatchCode.value || item.businessLink?.batchCode?.toLowerCase().includes(searchBatchCode.value.toLowerCase())
    const matchDepartment = searchDepartment.value === '全部' || item.applicantDepartment === searchDepartment.value
    let matchDate = true
    if (searchDateStart.value && item.applyDate) {
      matchDate = matchDate && item.applyDate >= searchDateStart.value
    }
    if (searchDateEnd.value && item.applyDate) {
      matchDate = matchDate && item.applyDate <= searchDateEnd.value
    }
    return matchSearch && matchStatus && matchApplicant && matchBatchCode && matchDepartment && matchDate
  })
})

// 分页数据
const totalPages = computed(() => Math.ceil(filteredData.value.length / pageSize.value))
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredData.value.slice(start, start + pageSize.value)
})

// Tab切换
const router = useRouter()

const handleTabChange = (tab) => {
  // P0修复: V1.1 purchase tab 跳转到 /material-receiving（非当前页内切换）
  const targetTab = tabs.find(t => t.key === tab)
  if (targetTab?.path) {
    router.push(targetTab.path)
    return
  }
  activeTab.value = tab
  currentPage.value = 1
  expandedRows.value = []
  selectedIds.value = new Set()
  updateStats()
}

// 展开行（V2.0 原生表格手动展开）
const handleExpandRow = (id) => {
  const idx = expandedRows.value.indexOf(id)
  if (idx > -1) {
    expandedRows.value.splice(idx, 1)
  } else {
    expandedRows.value.push(id)
  }
}

// 展开行（保留旧函数兼容）
const handleExpandChange = (id) => {
  handleExpandRow(id)
}

// 重置筛选
const handleReset = () => {
  searchTerm.value = ''
  searchApplicant.value = ''
  searchDepartment.value = '全部'
  searchBatchCode.value = ''
  searchDateStart.value = ''
  searchDateEnd.value = ''
  statusFilter.value = '全部'
  currentPage.value = 1
}

// 查看详情
const handleViewDetail = (item) => {
  detailModal.item = item
  detailModal.show = true
}

// 拒绝点击
const handleRejectClick = (item) => {
  rejectModal.item = item
  rejectModal.reason = ''
  rejectModal.show = true
}

// 确认拒绝
const handleConfirmReject = async () => {
  if (!rejectModal.reason.trim()) {
    ElMessage.warning('请输入拒绝原因')
    return
  }
  const item = rejectModal.item
  if (item) {
    // 修复 P0: 检查 reject 返回值，false 时显示错误
    const success = await approvalStore.reject(item.id, rejectModal.reason)
    if (!success) {
      ElMessage.error(approvalStore.error || '审批拒绝失败')
      return
    }
    await approvalStore.fetchApprovals()
    ElMessage.success('已拒绝该申请')
  }
  rejectModal.show = false
  detailModal.show = false
}

// 通过审批
const handleApprove = async (item) => {
  try {
    await ElMessageBox.confirm(`确定要通过「${item.title}」吗？`, '审批确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    // 修复 P0: 检查 approve 返回值，false 时不显示"已通过"提示
    const success = await approvalStore.approve(item.id)
    if (!success) {
      ElMessage.error(approvalStore.error || '审批通过失败')
      return
    }
    await approvalStore.fetchApprovals()
    ElMessage.success('已通过该申请')
    detailModal.show = false
  } catch (err) {
    // 用户取消
  }
}

// 物料分类 / 状态 / 退料类型映射 已拆分到 ./utils/materialApprovalLabels.js

// 监听分页变化
watch(currentPage, () => {
  expandedRows.value = []
})

// 初始加载 - 从API加载数据
onMounted(async () => {
  await approvalStore.fetchApprovals()
  updateStats()
})
</script>
