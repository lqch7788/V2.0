<template>
  <div class="space-y-6">
    <!-- 预警统计头部 -->
    <div class="bg-white rounded-xl p-6 shadow-none">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
          <ShoppingCart class="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">采购计划</h1>
          <p class="text-gray-500">物资采购计划的管理与审批</p>
        </div>
        <div class="ml-auto flex items-center gap-4">
          <template v-if="overdueCount > 0">
            <div class="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg">
              <span class="text-red-500 text-lg">🔴</span>
              <div>
                <div class="text-xs text-red-500">已逾期</div>
                <div class="text-lg font-bold text-red-600">{{ overdueCount }} 项</div>
              </div>
            </div>
          </template>
          <template v-if="warningCount > 0">
            <div class="flex items-center gap-2 px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-lg">
              <span class="text-orange-500 text-lg">⚠️</span>
              <div>
                <div class="text-xs text-orange-500">即将到期</div>
                <div class="text-lg font-bold text-orange-600">{{ warningCount }} 项</div>
              </div>
            </div>
          </template>
          <template v-if="overdueCount === 0 && warningCount === 0">
            <div class="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
              <span class="text-green-500 text-lg">✓</span>
              <div>
                <div class="text-xs text-green-500">暂无预警</div>
                <div class="text-lg font-bold text-green-600">0 项</div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- 筛选表单 -->
    <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm">
      <div class="flex flex-wrap gap-4 items-end">
        <div class="min-w-[120px]">
          <label class="block text-sm text-gray-700">关联生产批次</label>
          <input
            v-model="relatedBatchCode"
            class="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="请输入"
          />
        </div>
        <div class="min-w-[110px]">
          <label class="block text-sm text-gray-700">采购类型</label>
          <el-select v-model="purchaseType" class="w-full">
            <el-option label="全部" value="全部" />
            <el-option label="生产物资采购" value="生产物资采购" />
            <el-option label="紧急采购" value="紧急采购" />
            <el-option label="常规采购" value="常规采购" />
            <el-option label="劳保用品" value="劳保用品" />
            <el-option label="通用物资" value="通用物资" />
            <el-option label="设备采购" value="设备采购" />
            <el-option label="其他" value="其他" />
          </el-select>
        </div>
        <div class="min-w-[90px]">
          <label class="block text-sm text-gray-700">申请人</label>
          <input
            v-model="applicant"
            class="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="请输入"
          />
        </div>
        <div class="min-w-[90px]">
          <label class="block text-sm text-gray-700">申请部门</label>
          <input
            v-model="applicantDepartment"
            class="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="请输入"
          />
        </div>
        <div class="min-w-[90px]">
          <label class="block text-sm text-gray-700">状态</label>
          <el-select v-model="status" class="w-full">
            <el-option label="全部" value="全部" />
            <el-option label="草稿" value="草稿" />
            <el-option label="待审批" value="待审批" />
            <el-option label="已通过" value="已通过" />
            <el-option label="采购中" value="采购中" />
            <el-option label="已完成" value="已完成" />
            <el-option label="已取消" value="已取消" />
          </el-select>
        </div>
        <div class="min-w-[90px]">
          <label class="block text-sm text-gray-700">预警状态</label>
          <el-select v-model="alertFilter" class="w-full">
            <el-option label="全部" value="全部" />
            <el-option label="已逾期" value="已逾期" />
            <el-option label="即将到期" value="即将到期" />
          </el-select>
        </div>
        <div class="min-w-[110px]">
          <label class="block text-sm text-gray-700">需求开始日期</label>
          <input
            v-model="requiredStartDate"
            type="date"
            class="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div class="min-w-[110px]">
          <label class="block text-sm text-gray-700">需求结束日期</label>
          <input
            v-model="requiredEndDate"
            type="date"
            class="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div class="flex gap-2 items-end">
          <button
            class="h-8 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
            @click="handleReset"
          >
            重置
          </button>
          <button
            class="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
            @click="handleSearch"
          >
            <Search class="w-4 h-4" />
            搜索
          </button>
        </div>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <!-- 工具栏 -->
      <div class="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900">采购计划列表</h3>
        <div v-if="exportMode || batchEditMode || batchDeleteMode" class="flex gap-2">
          <template v-if="batchEditMode">
            <button
              class="h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
              @click="handleBatchEditConfirm"
            >
              <Edit class="w-4 h-4" />
              编辑
            </button>
            <button
              class="h-8 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
              @click="handleBatchEditCancel"
            >
              取消
            </button>
          </template>
          <template v-if="batchDeleteMode">
            <button
              class="h-8 px-3 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
              :disabled="selectedRows.length === 0"
              @click="handleDeleteClick"
            >
              <Trash2 class="w-4 h-4" />
              删除
            </button>
            <button
              class="h-8 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
              @click="handleBatchDeleteCancel"
            >
              取消
            </button>
          </template>
          <template v-if="exportMode">
            <button
              class="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
              @click="handleConfirmExport"
            >
              <Download class="w-4 h-4" />
              确认导出
            </button>
            <button
              class="h-8 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
              @click="handleCancelExport"
            >
              取消
            </button>
          </template>
        </div>
        <div v-else class="flex gap-2">
          <button
            class="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
            @click="handleOpenCreateModal"
          >
            <Plus class="w-4 h-4" />
            新增
          </button>
          <button
            class="h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
            @click="handleEnterBatchEditMode"
          >
            <Edit class="w-4 h-4" />
            编辑
          </button>
          <button
            class="h-8 px-3 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
            @click="handleEnterBatchDeleteMode"
          >
            <Trash2 class="w-4 h-4" />
            删除
          </button>
          <button
            class="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
            @click="handleExportClick"
          >
            <Download class="w-4 h-4" />
            导出
          </button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <tr>
              <th v-if="!(exportMode || batchEditMode || batchDeleteMode)" class="px-2 py-3 text-left text-sm font-semibold whitespace-nowrap w-10"></th>
              <th v-if="exportMode || batchEditMode || batchDeleteMode" class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap w-12">
                <input
                  type="checkbox"
                  :checked="selectedRows.length === filteredAndSortedData.length && filteredAndSortedData.length > 0"
                  @change="handleSelectAll"
                />
              </th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">采购申请批次号</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">关联生产批次</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap cursor-pointer hover:bg-blue-600/10" @click="handleSortChange('purchaseType')">
                采购类型<span v-if="sortConfig?.field === 'purchaseType'" class="ml-1">{{ sortConfig.direction === 'asc' ? '↑' : '↓' }}</span>
              </th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap cursor-pointer hover:bg-blue-600/10" @click="handleSortChange('applicant')">
                申请人<span v-if="sortConfig?.field === 'applicant'" class="ml-1">{{ sortConfig.direction === 'asc' ? '↑' : '↓' }}</span>
              </th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">申请部门</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap cursor-pointer hover:bg-blue-600/10" @click="handleSortChange('applyDate')">
                申请日期<span v-if="sortConfig?.field === 'applyDate'" class="ml-1">{{ sortConfig.direction === 'asc' ? '↑' : '↓' }}</span>
              </th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap cursor-pointer hover:bg-blue-600/10" @click="handleSortChange('requiredDate')">
                需求日期<span v-if="sortConfig?.field === 'requiredDate'" class="ml-1">{{ sortConfig.direction === 'asc' ? '↑' : '↓' }}</span>
              </th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap cursor-pointer hover:bg-blue-600/10" @click="handleSortChange('priority')">
                优先级<span v-if="sortConfig?.field === 'priority'" class="ml-1">{{ sortConfig.direction === 'asc' ? '↑' : '↓' }}</span>
              </th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap cursor-pointer hover:bg-blue-600/10" @click="handleSortChange('status')">
                状态<span v-if="sortConfig?.field === 'status'" class="ml-1">{{ sortConfig.direction === 'asc' ? '↑' : '↓' }}</span>
              </th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">审批人</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap w-24">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-300">
            <template v-for="plan in paginatedData" :key="plan.id">
              <tr :class="(batchEditMode || batchDeleteMode) && (plan.status === 'completed' || plan.status === 'purchasing') ? 'bg-gray-100 hover:bg-gray-100' : 'hover:bg-blue-50'">
                <td v-if="!(exportMode || batchEditMode || batchDeleteMode)" class="px-2 py-3 w-10">
                  <button
                    class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-gray-100 h-9 w-9"
                    :title="expandedRows.has(plan.id) ? '折叠' : '展开'"
                    @click="toggleExpandRow(plan.id)"
                  >
                    <ChevronDown v-if="expandedRows.has(plan.id)" class="w-4 h-4 text-gray-500" />
                    <ChevronRight v-else class="w-4 h-4 text-gray-500" />
                  </button>
                </td>
                <td v-if="exportMode || batchEditMode || batchDeleteMode" class="px-4 py-3">
                  <input
                    type="checkbox"
                    :checked="selectedRows.includes(plan.purchaseApplicationCode)"
                    :disabled="(batchEditMode || batchDeleteMode) && (plan.status === 'completed' || plan.status === 'purchasing')"
                    @change="handleSelectRow(plan.purchaseApplicationCode)"
                  />
                </td>
                <td class="px-4 py-3 text-sm whitespace-nowrap">
                  <button
                    class="text-blue-600 hover:text-blue-800 hover:underline font-medium cursor-pointer p-0 h-auto bg-transparent border-0"
                    title="点击查看详情"
                    @click="handleViewDetail(plan)"
                  >
                    {{ plan.purchaseApplicationCode }}
                  </button>
                </td>
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ plan.relatedBatchCode || '不关联批次' }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ plan.purchaseTypeName }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ plan.applicant }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ plan.applicantDepartment }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ plan.applyDate }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ plan.requiredDate }}</td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <span :class="priorityBadgeClass(plan.priority)">{{ plan.priorityText }}</span>
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <span :class="statusBadgeClass(plan.status)">{{ plan.statusText }}</span>
                  <template v-if="calculateOverdueAlert(plan).level !== 'normal'">
                    <span :class="alertBadgeClass(plan)">
                      {{ calculateOverdueAlert(plan).level === 'overdue' ? '🔴逾期' : '⚠️将到期' }}
                    </span>
                  </template>
                </td>
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ plan.approvalPerson || '-' }}</td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-1">
                    <template v-if="plan.status !== 'completed' && plan.status !== 'purchasing'">
                      <button class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-gray-100 h-9 w-9" title="编辑" @click="handleSingleEdit(plan)">
                        <Pencil class="w-4 h-4" />
                      </button>
                      <button class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-gray-100 h-9 w-9" title="删除" @click="handleSingleDeleteClick(plan)">
                        <Trash2 class="w-4 h-4" />
                      </button>
                    </template>
                    <span v-else class="text-xs text-gray-400">已归档</span>
                  </div>
                </td>
              </tr>
              <!-- 展开的物料明细行 -->
              <tr v-if="expandedRows.has(plan.id)" :key="`${plan.id}-expanded`" class="bg-blue-50/50">
                <td colspan="12" class="px-4 py-4">
                  <div class="text-sm font-medium text-gray-700 mb-3">物料明细（共 {{ plan.items?.length || 0 }} 项）</div>
                  <table class="w-full bg-white rounded-lg overflow-hidden">
                    <thead class="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
                      <tr>
                        <th class="px-2 py-2 text-left text-xs font-semibold">物料编码</th>
                        <th class="px-2 py-2 text-left text-xs font-semibold">物料名称</th>
                        <th class="px-2 py-2 text-left text-xs font-semibold">分类</th>
                        <th class="px-2 py-2 text-left text-xs font-semibold">规格型号</th>
                        <th class="px-2 py-2 text-center text-xs font-semibold">单位</th>
                        <th class="px-2 py-2 text-right text-xs font-semibold">数量</th>
                        <th class="px-2 py-2 text-right text-xs font-semibold">预估单价</th>
                        <th class="px-2 py-2 text-right text-xs font-semibold">小计</th>
                        <th class="px-2 py-2 text-left text-xs font-semibold">供应商</th>
                        <th class="px-2 py-2 text-left text-xs font-semibold">用途说明</th>
                        <th class="px-2 py-2 text-left text-xs font-semibold">备注</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                      <tr v-for="item in plan.items || []" :key="item.id" class="hover:bg-gray-50">
                        <td class="px-2 py-2 text-xs text-gray-600 font-mono">{{ item.materialCode }}</td>
                        <td class="px-2 py-2 text-xs text-gray-900 font-medium">{{ item.materialName }}</td>
                        <td class="px-2 py-2 text-xs text-gray-600">{{ item.category || '-' }}</td>
                        <td class="px-2 py-2 text-xs text-gray-600">{{ item.specification }}</td>
                        <td class="px-2 py-2 text-xs text-gray-600 text-center">{{ item.unit }}</td>
                        <td class="px-2 py-2 text-xs text-gray-900 text-right font-medium">{{ item.quantity }}</td>
                        <td class="px-2 py-2 text-xs text-gray-600 text-right">¥{{ item.estimatedPrice.toFixed(2) }}</td>
                        <td class="px-2 py-2 text-xs text-gray-900 text-right font-medium">¥{{ item.estimatedTotalPrice.toLocaleString() }}</td>
                        <td class="px-2 py-2 text-xs text-gray-600">{{ item.supplier || '-' }}</td>
                        <td class="px-2 py-2 text-xs text-gray-600">{{ item.purpose || '-' }}</td>
                        <td class="px-2 py-2 text-xs text-gray-600">{{ item.remark || '-' }}</td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </template>
          </tbody>
        </table>

        <!-- 批量模式底部统计 -->
        <div v-if="exportMode || batchEditMode || batchDeleteMode" class="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
          <div class="flex items-center gap-4">
            <button
              class="text-sm text-emerald-600 hover:text-emerald-700 bg-transparent border-0 cursor-pointer inline-flex items-center justify-center rounded-md font-medium transition-colors hover:bg-gray-100 h-9 px-3"
              @click="handleSelectAll"
            >
              {{ selectedRows.length === filteredAndSortedData.length ? '全不选' : '全选' }}
            </button>
            <span class="text-sm text-gray-500">已选择 {{ selectedRows.length }} 项</span>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div class="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-100 rounded-b-xl">
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500">每页</span>
          <select
            v-model="pageSize"
            class="w-20 h-8 text-sm border border-gray-200 rounded-lg px-2 bg-white"
            @change="currentPage = 1"
          >
            <option :value="10">10</option>
            <option :value="20">20</option>
            <option :value="50">50</option>
          </select>
          <span class="text-sm text-gray-500">条</span>
        </div>
        <div class="flex items-center gap-1">
          <button
            class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-gray-100 h-9 w-9 disabled:opacity-50"
            :disabled="currentPage === 1"
            @click="currentPage = 1"
          >
            <ChevronsLeft class="w-4 h-4" />
          </button>
          <button
            class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-gray-100 h-9 w-9 disabled:opacity-50"
            :disabled="currentPage === 1"
            @click="currentPage = Math.max(1, currentPage - 1)"
          >
            <ChevronLeft class="w-4 h-4" />
          </button>
          <template v-for="(page, index) in visiblePages" :key="`${page}-${index}`">
            <button
              v-if="typeof page === 'number'"
              class="min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-colors"
              :class="currentPage === page ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-100'"
              @click="currentPage = page"
            >
              {{ page }}
            </button>
            <span v-else class="px-2 text-gray-400">{{ page }}</span>
          </template>
          <button
            class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-gray-100 h-9 w-9 disabled:opacity-50"
            :disabled="currentPage >= totalPages"
            @click="currentPage = Math.min(totalPages, currentPage + 1)"
          >
            <ChevronRight class="w-4 h-4" />
          </button>
          <button
            class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-gray-100 h-9 w-9 disabled:opacity-50"
            :disabled="currentPage >= totalPages"
            @click="currentPage = totalPages"
          >
            <ChevronsRight class="w-4 h-4" />
          </button>
          <span class="text-sm text-gray-500 ml-2">共 {{ totalPages }} 页</span>
        </div>
      </div>
    </div>

    <!-- 创建弹窗 -->
    <el-dialog v-model="showCreateModal" class="purchase-plan-dialog" title="新增采购申请单" width="1080px" top="5vh" :close-on-click-modal="false" @close="createItems = []">
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">采购申请批次号</label>
            <div class="flex gap-2">
              <input
                v-model="createForm.purchaseApplicationCode"
                class="flex-1 h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="PA2026XXXXX"
              />
              <button class="h-9 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1" @click="handleGenerateCode">
                <RefreshCw class="w-4 h-4" />
                生成
              </button>
            </div>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">采购类型</label>
            <el-select
              v-model="createForm.purchaseType"
              class="w-full"
              @change="(value) => { if (value !== '生产物资采购') createForm.relatedBatchCode = '' }"
            >
              <el-option label="生产物资采购" value="生产物资采购" />
              <el-option label="紧急采购" value="紧急采购" />
              <el-option label="常规采购" value="常规采购" />
              <el-option label="通用物资" value="通用物资" />
              <el-option label="劳保用品" value="劳保用品" />
              <el-option label="设备采购" value="设备采购" />
              <el-option label="其他" value="其他" />
            </el-select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">关联生产批次号</label>
            <el-select v-model="createForm.relatedBatchCode" class="w-full">
              <el-option label="请选择" value="" />
              <el-option label="ZZB2026-001 - 番茄种植批次" value="ZZB2026-001" />
              <el-option label="ZZB2026-002 - 黄瓜种植批次" value="ZZB2026-002" />
              <el-option label="ZZB2026-003 - 草莓种植批次" value="ZZB2026-003" />
              <el-option label="YMB2026-001 - 番茄育苗批次" value="YMB2026-001" />
              <el-option label="YMB2026-002 - 黄瓜育苗批次" value="YMB2026-002" />
              <el-option label="JZB2026-001 - 番茄种源批次" value="JZB2026-001" />
              <el-option label="JZB2026-002 - 黄瓜种源批次" value="JZB2026-002" />
              <el-option label="其他" value="other" />
            </el-select>
          </div>
          <div v-if="createForm.relatedBatchCode === 'other'">
            <label class="block text-sm font-medium text-gray-700">其他说明</label>
            <input
              v-model="createForm.otherBatchReason"
              class="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请说明采购原因，如：日常用具、劳保用品等"
            />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">申请人</label>
            <input v-model="createForm.applicant" disabled class="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm bg-gray-100 cursor-not-allowed" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">申请部门</label>
            <input v-model="createForm.applicantDepartment" disabled class="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm bg-gray-100 cursor-not-allowed" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">申请日期</label>
            <input v-model="createForm.applyDate" type="date" class="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">需求日期</label>
            <input v-model="createForm.requiredDate" type="date" class="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">优先级</label>
            <el-select v-model="createForm.priority" class="w-full">
              <el-option label="紧急" value="紧急" />
              <el-option label="高" value="高" />
              <el-option label="中" value="中" />
              <el-option label="低" value="低" />
            </el-select>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">审批人</label>
            <el-select v-model="createForm.approvalPerson" class="w-full">
              <el-option label="请选择" value="" />
              <el-option label="陆启闯" value="陆启闯" />
              <el-option label="周总" value="周总" />
              <el-option label="Susan" value="Susan" />
            </el-select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">备注</label>
            <input v-model="createForm.remark" class="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="请输入备注" />
          </div>
        </div>

        <!-- 物料明细区域 -->
        <div class="border-t border-gray-200 pt-4 mt-4">
          <div class="flex items-center justify-between mb-3">
            <h4 class="text-sm font-semibold text-gray-800">物料明细（{{ createItems.length }}种物料）</h4>
            <div class="flex items-center gap-2">
              <button class="h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1" @click="handleImportClick">
                <Upload class="w-4 h-4" />
                导入物料
              </button>
              <button class="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1" @click="handleAddItem">
                <Plus class="w-4 h-4" />
                添加物料
              </button>
            </div>
            <input ref="fileInputRef" type="file" accept=".xlsx,.xls,.csv" class="hidden" @change="handleFileChange" />
          </div>
          <div v-if="createItems.length === 0" class="text-center py-8 text-gray-500 text-sm border border-dashed border-gray-300 rounded-lg">
            暂无物料，请点击"添加物料"按钮添加
          </div>
          <div v-else class="overflow-x-auto rounded-lg border border-gray-200 bg-white">
            <table class="min-w-full text-xs">
              <thead class="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
                <tr>
                  <th class="px-2 py-2 text-left font-semibold whitespace-nowrap">操作</th>
                  <th class="px-2 py-2 text-left font-semibold whitespace-nowrap">物料编码</th>
                  <th class="px-2 py-2 text-left font-semibold whitespace-nowrap">物料名称</th>
                  <th class="px-2 py-2 text-left font-semibold whitespace-nowrap">分类</th>
                  <th class="px-2 py-2 text-left font-semibold whitespace-nowrap">规格型号</th>
                  <th class="px-2 py-2 text-center font-semibold whitespace-nowrap">单位</th>
                  <th class="px-2 py-2 text-right font-semibold whitespace-nowrap">数量</th>
                  <th class="px-2 py-2 text-right font-semibold whitespace-nowrap">预估单价</th>
                  <th class="px-2 py-2 text-right font-semibold whitespace-nowrap">预估总价</th>
                  <th class="px-2 py-2 text-left font-semibold whitespace-nowrap">供应商</th>
                  <th class="px-2 py-2 text-left font-semibold whitespace-nowrap">用途说明</th>
                  <th class="px-2 py-2 text-left font-semibold whitespace-nowrap">备注</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="item in createItems" :key="item.id" class="hover:bg-gray-50">
                  <td class="px-2 py-1.5 whitespace-nowrap">
                    <button class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-gray-100 h-9 w-9" @click="handleDeleteItem(item.id)">
                      <Trash2 class="w-3.5 h-3.5 text-red-500" />
                    </button>
                  </td>
                  <td class="px-1 py-1.5 whitespace-nowrap">
                    <input v-model="item.materialCode" class="h-6 w-20 p-1 text-xs rounded border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="编码" @change="handleUpdateItem(item.id, 'materialCode', item.materialCode)" />
                  </td>
                  <td class="px-1 py-1.5 whitespace-nowrap">
                    <input v-model="item.materialName" class="h-6 w-20 p-1 text-xs rounded border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="名称" @change="handleUpdateItem(item.id, 'materialName', item.materialName)" />
                  </td>
                  <td class="px-1 py-1.5 whitespace-nowrap">
                    <input v-model="item.category" class="h-6 w-24 p-1 text-xs rounded border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="分类" @change="handleUpdateItem(item.id, 'category', item.category)" />
                  </td>
                  <td class="px-1 py-1.5 whitespace-nowrap">
                    <input v-model="item.specification" class="h-6 w-16 p-1 text-xs rounded border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="规格" @change="handleUpdateItem(item.id, 'specification', item.specification)" />
                  </td>
                  <td class="px-1 py-1.5 whitespace-nowrap text-center">
                    <input v-model="item.unit" class="h-6 w-12 p-1 text-xs text-center rounded border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="单位" @change="handleUpdateItem(item.id, 'unit', item.unit)" />
                  </td>
                  <td class="px-1 py-1.5 whitespace-nowrap text-right">
                    <input v-model.number="item.quantity" type="number" class="h-6 w-14 p-1 text-xs text-right rounded border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="0" @change="handleUpdateItem(item.id, 'quantity', item.quantity)" />
                  </td>
                  <td class="px-1 py-1.5 whitespace-nowrap text-right">
                    <input v-model.number="item.estimatedPrice" type="number" class="h-6 w-14 p-1 text-xs text-right rounded border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="0" @change="handleUpdateItem(item.id, 'estimatedPrice', item.estimatedPrice)" />
                  </td>
                  <td class="px-1 py-1.5 whitespace-nowrap text-right">
                    <span class="text-xs text-gray-900 font-medium">¥{{ item.estimatedTotalPrice.toLocaleString() }}</span>
                  </td>
                  <td class="px-1 py-1.5 whitespace-nowrap">
                    <input v-model="item.supplier" class="h-6 w-16 p-1 text-xs rounded border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="供应商" @change="handleUpdateItem(item.id, 'supplier', item.supplier)" />
                  </td>
                  <td class="px-1 py-1.5 whitespace-nowrap">
                    <input v-model="item.purpose" class="h-6 w-16 p-1 text-xs rounded border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="用途" @change="handleUpdateItem(item.id, 'purpose', item.purpose)" />
                  </td>
                  <td class="px-1 py-1.5 whitespace-nowrap">
                    <input v-model="item.remark" class="h-6 w-14 p-1 text-xs rounded border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="备注" @change="handleUpdateItem(item.id, 'remark', item.remark)" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-3">
          <button class="h-9 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors" @click="showCreateModal = false">
            取消
          </button>
          <button class="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors" @click="handleCreateSubmit">
            提交
          </button>
        </div>
      </template>
    </el-dialog>

    <!-- 详情弹窗 -->
    <el-dialog v-model="showDetailModal" class="purchase-plan-dialog" title="采购申请单详情" width="1080px" top="5vh" @close="selectedPlanDetail = null">
      <div v-if="selectedPlanDetail" class="space-y-3">
        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700">采购申请批次号</label>
            <input :value="selectedPlanDetail.purchaseApplicationCode" disabled class="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm bg-gray-100 cursor-not-allowed" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">采购类型</label>
            <input :value="selectedPlanDetail.purchaseTypeName" disabled class="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm bg-gray-100 cursor-not-allowed" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">关联生产批次号</label>
            <input :value="selectedPlanDetail.relatedBatchCode || '不关联批次'" disabled class="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm bg-gray-100 cursor-not-allowed" />
          </div>
        </div>
        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700">申请人</label>
            <input :value="selectedPlanDetail.applicant" disabled class="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm bg-gray-100 cursor-not-allowed" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">申请部门</label>
            <input :value="selectedPlanDetail.applicantDepartment" disabled class="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm bg-gray-100 cursor-not-allowed" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">申请日期</label>
            <input :value="selectedPlanDetail.applyDate" type="date" disabled class="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm bg-gray-100 cursor-not-allowed" />
          </div>
        </div>
        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700">需求日期</label>
            <input :value="selectedPlanDetail.requiredDate" type="date" disabled class="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm bg-gray-100 cursor-not-allowed" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">优先级</label>
            <div class="flex items-center h-9 px-3 border border-gray-200 rounded-lg bg-gray-100">
              <span :class="priorityBadgeClass(selectedPlanDetail.priority)">{{ selectedPlanDetail.priorityText }}</span>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">状态</label>
            <div class="flex items-center h-9 px-3 border border-gray-200 rounded-lg bg-gray-100">
              <span :class="statusBadgeClass(selectedPlanDetail.status)">{{ selectedPlanDetail.statusText }}</span>
            </div>
          </div>
        </div>
        <div class="grid grid-cols-3 gap-3">
          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-700">备注</label>
            <input :value="selectedPlanDetail.remark || '-'" disabled class="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm bg-gray-100 cursor-not-allowed" />
          </div>
        </div>

        <div class="border-t border-gray-200 pt-4 mt-4">
          <h4 class="text-sm font-semibold text-gray-800 mb-3">物料明细（{{ selectedPlanDetail.items?.length || 0 }}种物料）</h4>
          <div v-if="selectedPlanDetail.items && selectedPlanDetail.items.length > 0" class="overflow-auto max-h-80 rounded-lg border border-gray-200 bg-white">
            <table class="text-sm" style="min-width: 1600px">
              <thead class="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white sticky top-0">
                <tr>
                  <th class="px-4 py-2.5 text-left font-semibold whitespace-nowrap">物料编码</th>
                  <th class="px-4 py-2.5 text-left font-semibold whitespace-nowrap">物料名称</th>
                  <th class="px-4 py-2.5 text-left font-semibold whitespace-nowrap">分类</th>
                  <th class="px-4 py-2.5 text-left font-semibold whitespace-nowrap">规格型号</th>
                  <th class="px-4 py-2.5 text-center font-semibold whitespace-nowrap">单位</th>
                  <th class="px-4 py-2.5 text-right font-semibold whitespace-nowrap">数量</th>
                  <th class="px-4 py-2.5 text-right font-semibold whitespace-nowrap">预估单价</th>
                  <th class="px-4 py-2.5 text-right font-semibold whitespace-nowrap">预估总价</th>
                  <th class="px-4 py-2.5 text-left font-semibold whitespace-nowrap">供应商</th>
                  <th class="px-4 py-2.5 text-left font-semibold whitespace-nowrap">用途说明</th>
                  <th class="px-4 py-2.5 text-left font-semibold whitespace-nowrap">备注</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="item in selectedPlanDetail.items" :key="item.id" class="hover:bg-gray-50">
                  <td class="px-4 py-2.5 text-gray-600 font-mono whitespace-nowrap">{{ item.materialCode || '-' }}</td>
                  <td class="px-4 py-2.5 text-gray-900 font-medium whitespace-nowrap">{{ item.materialName || '-' }}</td>
                  <td class="px-4 py-2.5 text-gray-600 whitespace-nowrap">{{ item.category || '-' }}</td>
                  <td class="px-4 py-2.5 text-gray-600 whitespace-nowrap">{{ item.specification || '-' }}</td>
                  <td class="px-4 py-2.5 text-gray-600 text-center whitespace-nowrap">{{ item.unit || '-' }}</td>
                  <td class="px-4 py-2.5 text-gray-900 text-right font-medium whitespace-nowrap">{{ item.quantity || 0 }}</td>
                  <td class="px-4 py-2.5 text-gray-600 text-right whitespace-nowrap">¥{{ (item.estimatedPrice || 0).toFixed(2) }}</td>
                  <td class="px-4 py-2.5 text-gray-900 text-right font-medium whitespace-nowrap">¥{{ (item.estimatedTotalPrice || 0).toLocaleString() }}</td>
                  <td class="px-4 py-2.5 text-gray-600 whitespace-nowrap">{{ item.supplier || '-' }}</td>
                  <td class="px-4 py-2.5 text-gray-600 whitespace-nowrap">{{ item.purpose || '-' }}</td>
                  <td class="px-4 py-2.5 text-gray-600 whitespace-nowrap">{{ item.remark || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="text-center py-8 text-gray-500 text-sm border border-dashed border-gray-300 rounded-lg">
            暂无物料明细
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 批量编辑弹窗 -->
    <el-dialog v-model="showBatchEditModal" class="purchase-plan-dialog" title="编辑采购申请单" width="1080px" top="5vh" :close-on-click-modal="false" @close="handleBatchEditModalClose">
      <div class="space-y-4">
        <div class="bg-blue-50 rounded-lg p-4">
          <p class="text-sm text-blue-800">已选择 <strong>{{ selectedRows.length }}</strong> 个采购计划进行编辑</p>
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700">选择采购申请批次号</label>
          <div ref="batchSelectRef" class="relative">
            <div
              class="w-full h-10 px-3 border border-gray-200 rounded-lg bg-white flex items-center justify-between cursor-pointer hover:border-blue-400"
              @click="batchSelectOpen = !batchSelectOpen"
            >
              <span :class="selectedPlanCode ? 'text-sm text-gray-900' : 'text-sm text-gray-400'">{{ selectedPlanCode || '-- 请选择 --' }}</span>
              <ChevronDown :class="`w-4 h-4 text-gray-400 transition-transform ${batchSelectOpen ? 'rotate-180' : ''}`" />
            </div>
            <div v-if="batchSelectOpen" class="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              <template v-if="selectedRows.length > 0">
                <div
                  v-for="plan in purchasePlansData.filter(p => selectedRows.includes(p.purchaseApplicationCode))"
                  :key="plan.purchaseApplicationCode"
                  :class="`px-3 py-2 cursor-pointer hover:bg-blue-50 flex items-center gap-2 ${selectedPlanCode === plan.purchaseApplicationCode ? 'bg-blue-100' : ''}`"
                  @click="handlePlanSelect(plan)"
                >
                  <span class="text-sm flex items-center gap-1">
                    {{ plan.purchaseApplicationCode }}
                    <span v-if="editedPlans[plan.purchaseApplicationCode]" class="text-blue-600 font-bold">✓已编辑</span>
                  </span>
                </div>
              </template>
              <div v-else class="px-3 py-2 text-sm text-gray-400">-- 请先选择要编辑的数据 --</div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div class="bg-gray-50 rounded-lg p-3">
            <div class="text-xs text-gray-500 mb-1">采购申请批次号</div>
            <div class="text-sm font-medium text-gray-900">{{ currentEditingPlan?.purchaseApplicationCode || '-' }}</div>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700">采购类型</label>
            <select v-model="batchEditData.purchaseType" class="w-full h-9 px-3 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="production">生产物资采购</option>
              <option value="urgent">紧急采购</option>
              <option value="routine">常规采购</option>
              <option value="material">通用物资</option>
              <option value="safety">劳保用品</option>
              <option value="equipment">设备采购</option>
              <option value="other">其他</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700">关联生产批次号</label>
            <select
              :value="currentEditingPlan?.relatedBatchCode || ''"
              class="w-full h-9 px-3 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              @change="(e) => { if (currentEditingPlan) currentEditingPlan.relatedBatchCode = e.target.value }"
            >
              <option value="">不关联批次</option>
              <option value="ZZB2026-001">ZZB2026-001 - 番茄种植批次</option>
              <option value="ZZB2026-002">ZZB2026-002 - 黄瓜种植批次</option>
              <option value="ZZB2026-003">ZZB2026-003 - 草莓种植批次</option>
              <option value="YMB2026-001">YMB2026-001 - 番茄育苗批次</option>
              <option value="YMB2026-002">YMB2026-002 - 黄瓜育苗批次</option>
              <option value="JZB2026-001">JZB2026-001 - 番茄种源批次</option>
              <option value="JZB2026-002">JZB2026-002 - 黄瓜种源批次</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-700">申请人</label>
            <el-select
              :model-value="currentEditingPlan?.applicantId || ''"
              class="w-full"
              size="small"
              @change="(value) => {
                if (currentEditingPlan) {
                  const selectedUser = users.find((u) => u.id === value)
                  currentEditingPlan.applicantId = value
                  currentEditingPlan.applicant = selectedUser?.realName || selectedUser?.name || currentEditingPlan.applicant
                }
              }"
            >
              <el-option label="请选择" value="" />
              <el-option
                v-for="u in users"
                :key="u.id"
                :label="u.realName || u.name || u.username"
                :value="u.id"
              />
            </el-select>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700">申请部门</label>
            <select
              :value="currentEditingPlan?.applicantDepartment || ''"
              class="w-full h-9 px-3 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              @change="(e) => { if (currentEditingPlan) currentEditingPlan.applicantDepartment = e.target.value }"
            >
              <option value="">请选择</option>
              <option value="生产部">生产部</option>
              <option value="技术部">技术部</option>
              <option value="后勤部">后勤部</option>
              <option value="办公室">办公室</option>
              <option value="财务部">财务部</option>
              <option value="采购部">采购部</option>
              <option value="仓储部">仓储部</option>
              <option value="销售部">销售部</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700">需求日期</label>
            <input v-model="batchEditData.requiredDate" type="date" class="w-full h-9 px-3 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-700">优先级</label>
            <select v-model="batchEditData.priority" class="w-full h-9 px-3 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="urgent">紧急</option>
              <option value="high">高</option>
              <option value="normal">中</option>
              <option value="low">低</option>
            </select>
          </div>
          <div class="bg-gray-50 rounded-lg p-3">
            <div class="text-xs text-gray-500 mb-1">状态</div>
            <div :class="`text-sm font-medium ${
              currentEditingPlan?.status === 'completed' ? 'text-green-600' :
              currentEditingPlan?.status === 'purchasing' ? 'text-purple-600' :
              currentEditingPlan?.status === 'pending' ? 'text-amber-600' :
              currentEditingPlan?.status === 'approved' ? 'text-blue-600' :
              currentEditingPlan?.status === 'cancelled' ? 'text-red-600' :
              'text-gray-600'
            }`">
              {{ currentEditingPlan?.statusText || '-' }}
            </div>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700">备注</label>
            <input v-model="batchEditData.remark" class="w-full h-9 px-3 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="输入备注" />
          </div>

          <div class="md:col-span-3 border-t border-gray-200 pt-3 mt-2">
            <div class="flex items-center justify-between">
              <button class="flex items-center gap-1 text-sm text-gray-700 hover:text-gray-900 bg-transparent border-0 cursor-pointer inline-flex rounded-md font-medium transition-colors hover:bg-gray-100 h-8 px-3" @click="showEditItemsExpanded = !showEditItemsExpanded">
                <ChevronDown :class="`w-4 h-4 transition-transform ${showEditItemsExpanded ? 'rotate-180' : ''}`" />
                物料明细（{{ batchEditItems.length || 0 }}种物料）
              </button>
              <button v-if="showEditItemsExpanded" class="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1" @click="handleAddBatchEditItem">
                <Plus class="w-4 h-4" />
                新增物料
              </button>
            </div>

            <div v-if="showEditItemsExpanded && batchEditItems.length > 0" class="mt-3 overflow-auto rounded-lg border border-gray-200 bg-white">
              <table class="w-full text-xs">
                <thead class="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white sticky top-0">
                  <tr>
                    <th class="px-2 py-2 text-center font-semibold w-10">操作</th>
                    <th class="px-2 py-2 text-left font-semibold">物料编码</th>
                    <th class="px-2 py-2 text-left font-semibold">物料名称</th>
                    <th class="px-2 py-2 text-left font-semibold">分类</th>
                    <th class="px-2 py-2 text-left font-semibold">规格型号</th>
                    <th class="px-2 py-2 text-center font-semibold w-16">单位</th>
                    <th class="px-2 py-2 text-center font-semibold w-24">数量</th>
                    <th class="px-2 py-2 text-center font-semibold w-28">预估单价</th>
                    <th class="px-2 py-2 text-left font-semibold">供应商</th>
                    <th class="px-2 py-2 text-left font-semibold">用途说明</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="(item, idx) in batchEditItems" :key="idx" class="hover:bg-gray-50">
                    <td class="px-2 py-2 text-center">
                      <button class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-gray-100 h-9 w-9" title="删除此行" @click="batchEditItems.splice(idx, 1)">
                        <Trash2 class="w-4 h-4 text-red-500" />
                      </button>
                    </td>
                    <td class="px-2 py-2">
                      <input v-model="item.materialCode" class="h-7 p-1 text-xs rounded border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full" />
                    </td>
                    <td class="px-2 py-2">
                      <input v-model="item.materialName" class="h-7 p-1 text-xs rounded border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full" />
                    </td>
                    <td class="px-2 py-2">
                      <input v-model="item.category" class="h-7 p-1 text-xs rounded border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full" />
                    </td>
                    <td class="px-2 py-2">
                      <input v-model="item.specification" class="h-7 p-1 text-xs rounded border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full" />
                    </td>
                    <td class="px-2 py-2">
                      <input v-model="item.unit" class="h-7 p-1 text-xs text-center rounded border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full" />
                    </td>
                    <td class="px-2 py-2">
                      <input v-model.number="item.quantity" type="number" class="h-7 p-1 text-xs text-right rounded border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full" />
                    </td>
                    <td class="px-2 py-2">
                      <input v-model.number="item.estimatedPrice" type="number" step="0.01" class="h-7 p-1 text-xs text-right rounded border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full" />
                    </td>
                    <td class="px-2 py-2">
                      <input v-model="item.supplier" class="h-7 p-1 text-xs rounded border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full" />
                    </td>
                    <td class="px-2 py-2">
                      <input v-model="item.purpose" class="h-7 p-1 text-xs rounded border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div v-if="showEditItemsExpanded && batchEditItems.length === 0" class="mt-3 text-center py-4 text-gray-500 text-sm border border-dashed border-gray-300 rounded-lg">
              暂无物料明细，请点击"新增物料"按钮添加
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-3">
          <button class="h-9 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors" @click="handleBatchEditNext">
            确认（下一个）
          </button>
          <button class="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors" @click="handleBatchEditSave">
            保存
          </button>
        </div>
      </template>
    </el-dialog>

    <!-- 删除确认弹窗 -->
    <el-dialog v-model="showDeleteModal" title="删除警告" width="400px" :show-close="false">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
          <AlertTriangle class="w-6 h-6 text-red-600" />
        </div>
        <h3 class="text-lg font-semibold text-gray-900">删除警告</h3>
      </div>
      <div class="text-sm text-gray-600 space-y-2 mb-6">
        <p>确定要删除选中的 <strong>{{ selectedRows.length }}</strong> 个项目吗？</p>
        <p>此操作 <strong class="text-red-600">无法恢复</strong>，删除后数据将永久丢失。</p>
      </div>
      <template #footer>
        <div class="flex gap-3">
          <button class="h-9 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors flex-1" @click="showDeleteModal = false">
            取消
          </button>
          <button class="h-9 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors flex-1" @click="handleDeleteConfirm">
            确认删除
          </button>
        </div>
      </template>
    </el-dialog>

    <!-- 导出格式弹窗 -->
    <el-dialog v-model="showExportModal" class="purchase-plan-dialog" title="选择导出格式" width="400px">
      <p class="text-sm text-gray-500 mb-4">已选择 {{ selectedRows.length }} 条数据</p>
      <div class="space-y-3">
        <label
          v-for="fmt in exportFormats"
          :key="fmt.value"
          :class="`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${exportFormat === fmt.value ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300 hover:border-gray-400'}`"
        >
          <input
            v-model="exportFormat"
            type="radio"
            name="exportFormat"
            :value="fmt.value"
            class="w-4 h-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
          />
          <div class="ml-3">
            <span class="block text-sm font-medium text-gray-900">{{ fmt.label }}</span>
            <span class="block text-xs text-gray-500">{{ fmt.desc }}</span>
          </div>
        </label>
      </div>
      <template #footer>
        <div class="flex justify-end gap-3">
          <button class="h-9 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors" @click="showExportModal = false">
            取消
          </button>
          <button class="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors" @click="handleDoExport">
            导出
          </button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import {
  ShoppingCart,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
  Plus,
  Edit,
  Trash2,
  Download,
  Pencil,
  Upload,
  RefreshCw,
  AlertTriangle,
} from 'lucide-vue-next'
import { usePurchasePlanStore } from '@/stores/modules/purchasePlan'
import { useUserStore } from '@/stores/modules/user'
import { submitPurchaseApproval } from '@/services/approvalSubmitService'
import { showAlert, showConfirm } from '@/lib/dialogService'
import * as XLSX from 'xlsx'

// ==================== 权限控制 ====================
const canCreate = true
const canEdit = true
const canDelete = true
const canExport = true

// ==================== Store ====================
const purchasePlanStore = usePurchasePlanStore()
const userStore = useUserStore()

const users = computed(() => userStore.users || [])

// ==================== 数据加载 ====================
const purchasePlansData = computed(() => purchasePlanStore.getPlansWithStatus)

onMounted(() => {
  purchasePlanStore.fetchPlans()
  if (userStore.users.length === 0) {
    userStore.loadUsers()
  }
})

// ==================== 筛选状态 ====================
const relatedBatchCode = ref('')
const purchaseType = ref('全部')
const status = ref('全部')
const alertFilter = ref('全部')
const applicant = ref('')
const applicantDepartment = ref('')
const priority = ref('全部')
const requiredStartDate = ref('')
const requiredEndDate = ref('')

// ==================== 分页状态 ====================
const currentPage = ref(1)
const pageSize = ref(10)

// ==================== 模式状态 ====================
const exportMode = ref(false)
const batchEditMode = ref(false)
const batchDeleteMode = ref(false)

// ==================== 选中状态 ====================
const selectedRows = ref<string[]>([])
const exportFormat = ref('excel')

// ==================== 弹窗状态 ====================
const showDeleteModal = ref(false)
const showExportModal = ref(false)
const showCreateModal = ref(false)
const showDetailModal = ref(false)
const showBatchEditModal = ref(false)
const showEditItemsExpanded = ref(false)
const batchSelectOpen = ref(false)

// ==================== 详情选中 ====================
const selectedPlanDetail = ref<any>(null)

// ==================== 创建表单状态 ====================
const createForm = ref({
  purchaseApplicationCode: '',
  relatedBatchCode: '',
  purchaseType: '生产物资采购',
  applicant: localStorage.getItem('username') || '陆启闯',
  applicantDepartment: '生产部',
  applyDate: new Date().toISOString().split('T')[0],
  requiredDate: '',
  priority: '中',
  remark: '',
  otherBatchReason: '',
  approvalPerson: '',
})
const createItems = ref<any[]>([])
const fileInputRef = ref<HTMLInputElement | null>(null)
const batchSelectRef = ref<HTMLDivElement | null>(null)

// ==================== 批量编辑相关状态 ====================
const editedPlanCodes = ref<string[]>([])
const editedPlans = ref<Record<string, any>>({})
const selectedPlanCode = ref('')
const currentEditingPlan = ref<any>(null)
const batchEditData = ref({
  purchaseType: '',
  priority: '',
  requiredDate: '',
  remark: '',
})
const batchEditItems = ref<any[]>([])

// ==================== 展开行状态 ====================
const expandedRows = ref<Set<string>>(new Set())

// ==================== 排序状态 ====================
const sortConfig = ref<{ field: string; direction: 'asc' | 'desc' } | null>(null)

// ==================== 预警统计 ====================
const overdueCount = computed(() => purchasePlansData.value.filter(p => calculateOverdueAlert(p).level === 'overdue').length)
const warningCount = computed(() => purchasePlansData.value.filter(p => calculateOverdueAlert(p).level === 'warning').length)

// ==================== 过滤和排序后的数据 ====================
const filteredAndSortedData = computed(() => {
  return purchasePlansData.value
    .filter((plan: any) => {
      if (relatedBatchCode.value && !plan.relatedBatchCode.toLowerCase().includes(relatedBatchCode.value.toLowerCase())) return false
      if (purchaseType.value !== '全部' && plan.purchaseTypeName !== purchaseType.value) return false
      if (status.value !== '全部' && plan.statusText !== status.value) return false
      if (applicant.value && !plan.applicant.toLowerCase().includes(applicant.value.toLowerCase())) return false
      if (applicantDepartment.value && !plan.applicantDepartment.toLowerCase().includes(applicantDepartment.value.toLowerCase())) return false
      if (priority.value !== '全部' && plan.priorityText !== priority.value) return false
      if (requiredStartDate.value && plan.requiredDate < requiredStartDate.value) return false
      if (requiredEndDate.value && plan.requiredDate > requiredEndDate.value) return false
      if (alertFilter.value !== '全部') {
        const alert = calculateOverdueAlert(plan)
        if (alertFilter.value === '已逾期' && alert.level !== 'overdue') return false
        if (alertFilter.value === '即将到期' && alert.level !== 'warning') return false
      }
      return true
    })
    .sort((a: any, b: any) => {
      if (!sortConfig.value) return 0
      const { field, direction } = sortConfig.value
      const aValue = a[field]
      const bValue = b[field]
      if (aValue < bValue) return direction === 'asc' ? -1 : 1
      if (aValue > bValue) return direction === 'asc' ? 1 : -1
      return 0
    })
})

// ==================== 分页数据 ====================
const paginatedData = computed(() => {
  return filteredAndSortedData.value.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value)
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredAndSortedData.value.length / pageSize.value)))

const visiblePages = computed(() => {
  const current = currentPage.value
  const total = totalPages.value
  const pages: (number | string)[] = []
  const showEllipsis = total > 7
  if (!showEllipsis) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    pages.push(1)
    if (current > 3) pages.push('...')
    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (current < total - 2) pages.push('...')
    if (total > 1) pages.push(total)
  }
  return pages
})

// ==================== 导出格式选项 ====================
const exportFormats = [
  { value: 'excel', label: 'Excel (.xlsx)', desc: '适用于数据分析和处理' },
  { value: 'csv', label: 'CSV (.csv)', desc: '适用于数据交换' },
  { value: 'word', label: 'Word (.doc)', desc: '适用于文档编辑和分享' },
]

// ==================== 样式辅助函数 ====================
function priorityBadgeClass(priority: string) {
  return `inline-flex px-2 py-1 rounded-full text-xs font-medium ${
    priority === 'urgent' ? 'bg-red-100 text-red-700' :
    priority === 'high' ? 'bg-orange-100 text-orange-700' :
    priority === 'normal' ? 'bg-blue-100 text-blue-700' :
    'bg-gray-100 text-gray-600'
  }`
}

function statusBadgeClass(status: string) {
  return `inline-flex px-2 py-1 rounded-full text-xs font-medium ${
    status === 'completed' ? 'bg-green-100 text-green-700' :
    status === 'purchasing' ? 'bg-purple-100 text-purple-700' :
    status === 'pending' ? 'bg-amber-100 text-amber-700' :
    status === 'approved' ? 'bg-blue-100 text-blue-700' :
    status === 'draft' ? 'bg-gray-100 text-gray-600' :
    'bg-gray-100 text-gray-600'
  }`
}

function alertBadgeClass(plan: any) {
  const alert = calculateOverdueAlert(plan)
  return `inline-flex items-center ml-1 px-1.5 py-0.5 rounded text-xs font-medium ${
    alert.level === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
  }`
}

// ==================== 预警计算函数 ====================
function calculateOverdueAlert(plan: any) {
  if (plan.status === 'completed' || plan.status === 'cancelled' || plan.status === 'draft') {
    return { level: 'normal', daysOverdue: 0, message: '' }
  }
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const requiredDate = new Date(plan.requiredDate)
  requiredDate.setHours(0, 0, 0, 0)
  const diffTime = requiredDate.getTime() - today.getTime()
  const daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  if (daysOverdue < 0) {
    return { level: 'overdue', daysOverdue: Math.abs(daysOverdue), message: `已逾期 ${Math.abs(daysOverdue)} 天` }
  }
  if (daysOverdue <= 3) {
    return { level: 'warning', daysOverdue: -daysOverdue, message: `还有 ${daysOverdue} 天到期` }
  }
  return { level: 'normal', daysOverdue: 0, message: '' }
}

// ==================== 展开/折叠行 ====================
function toggleExpandRow(id: string) {
  const next = new Set(expandedRows.value)
  if (next.has(id)) {
    next.delete(id)
  } else {
    next.add(id)
  }
  expandedRows.value = next
}

// ==================== 排序处理 ====================
function handleSortChange(field: string) {
  if (sortConfig.value?.field !== field) {
    sortConfig.value = { field, direction: 'asc' }
  } else if (sortConfig.value.direction === 'asc') {
    sortConfig.value = { field, direction: 'desc' }
  } else {
    sortConfig.value = null
  }
}

// ==================== 创建相关 ====================
function generateCode() {
  return `PA${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`
}

function handleOpenCreateModal() {
  createForm.value = {
    purchaseApplicationCode: generateCode(),
    relatedBatchCode: '',
    purchaseType: '生产物资采购',
    applicant: localStorage.getItem('username') || '陆启闯',
    applicantDepartment: '生产部',
    applyDate: new Date().toISOString().split('T')[0],
    requiredDate: '',
    priority: '中',
    remark: '',
    otherBatchReason: '',
    approvalPerson: '',
  }
  createItems.value = []
  showCreateModal.value = true
}

function handleGenerateCode() {
  let newCode = ''
  let exists = true
  let attempts = 0
  while (exists && attempts < 100) {
    newCode = generateCode()
    exists = purchasePlansData.value.some((plan: any) => plan.purchaseApplicationCode === newCode)
    attempts++
  }
  createForm.value.purchaseApplicationCode = newCode
}

function handleAddItem() {
  const newItem = {
    id: `NEW-${Date.now()}`,
    materialId: '',
    materialCode: '',
    materialName: '',
    barcode: '',
    category: '',
    specification: '',
    unit: '袋',
    quantity: 0,
    estimatedPrice: 0,
    estimatedTotalPrice: 0,
    supplier: '',
    location: '',
    batchNo: '',
    productionDate: '',
    expiryDate: '',
    purpose: '',
    remark: '',
  }
  createItems.value = [...createItems.value, newItem]
}

function handleDeleteItem(id: string) {
  createItems.value = createItems.value.filter(item => item.id !== id)
}

function handleUpdateItem(id: string, field: string, value: any) {
  createItems.value = createItems.value.map(item => {
    if (item.id === id) {
      const updated = { ...item, [field]: value }
      if (field === 'quantity' || field === 'estimatedPrice') {
        updated.estimatedTotalPrice = Number(updated.quantity) * Number(updated.estimatedPrice)
      }
      return updated
    }
    return item
  })
}

function handleImportClick() {
  fileInputRef.value?.click()
}

function handleFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (event) => {
    try {
      const data = new Uint8Array(event.target?.result as ArrayBuffer)
      const workbook = XLSX.read(data, { type: 'array' })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet as any)
      const importedItems = jsonData.map((row: any, index: number) => ({
        id: `IMPORT-${Date.now()}-${index}`,
        materialCode: row['物料编码'] || row['materialCode'] || '',
        materialName: row['物料名称'] || row['materialName'] || '',
        category: row['分类'] || row['category'] || '',
        specification: row['规格型号'] || row['specification'] || '',
        unit: row['单位'] || row['unit'] || '袋',
        quantity: Number(row['数量'] || row['quantity'] || 0),
        estimatedPrice: Number(row['预估单价'] || row['estimatedPrice'] || 0),
        estimatedTotalPrice: Number(row['数量'] || row['quantity'] || 0) * Number(row['预估单价'] || row['estimatedPrice'] || 0),
        supplier: row['供应商'] || row['supplier'] || '',
        purpose: row['用途说明'] || row['purpose'] || '',
        remark: row['备注'] || row['remark'] || '',
      })).filter((item: any) => item.materialCode || item.materialName)
      if (importedItems.length > 0) {
        createItems.value = [...createItems.value, ...importedItems]
        showAlert(`成功导入 ${importedItems.length} 条物料明细`)
      } else {
        showAlert('导入失败：未找到有效的物料数据')
      }
    } catch (error) {
      console.error('导入失败:', error)
      showAlert('导入失败：请确保文件格式正确')
    }
  }
  reader.readAsArrayBuffer(file)
  target.value = ''
}

async function handleCreateSubmit() {
  try {
    const totalAmount = createItems.value.reduce((sum, item) => sum + (item.estimatedTotalPrice || 0), 0)
    const priorityMap: Record<string, string> = {
      '紧急': 'urgent', '高': 'high', '中': 'normal', '低': 'low',
    }
    const purchaseTypeReverseMap: Record<string, string> = {
      '生产物资采购': 'production', '紧急采购': 'urgent', '常规采购': 'routine',
      '劳保用品': 'safety', '通用物资': 'material', '设备采购': 'equipment', '其他': 'other',
    }
    const planData = {
      purchaseApplicationCode: createForm.value.purchaseApplicationCode,
      relatedBatchCode: createForm.value.relatedBatchCode,
      purchaseType: purchaseTypeReverseMap[createForm.value.purchaseType] || 'production',
      applicant: createForm.value.applicant,
      applicantId: localStorage.getItem('userId') || '',
      applicantDepartment: createForm.value.applicantDepartment,
      applyDate: createForm.value.applyDate,
      requiredDate: createForm.value.requiredDate,
      priority: priorityMap[createForm.value.priority] || 'normal',
      status: 'pending',
      approvalStatus: 'pending',
      remarks: createForm.value.remark,
      approvalPerson: createForm.value.approvalPerson,
      items: createItems.value,
      totalAmount,
      attachments: [],
    }
    const result = await purchasePlanStore.addPlan(planData)
    if (result && result.id) {
      const approvalResult = await submitPurchaseApproval({
        purchaseId: result.id,
        purchaseCode: result.purchaseApplicationCode || createForm.value.purchaseApplicationCode,
        purchaseName: result.planTitle || `${createForm.value.purchaseType} - ${createForm.value.purchaseApplicationCode}`,
        amount: totalAmount,
        applicantId: result.applicantId || planData.applicantId,
        applicantName: result.applicant,
        department: result.applicantDepartment,
      })
      console.log('【创建采购计划】审批提交结果:', approvalResult)
      if (!approvalResult.success) {
        await showAlert('审批提交失败: ' + approvalResult.message)
        return
      }
      if (approvalResult.autoApprove) {
        await showAlert('采购计划已创建，金额在免审批阈值内，已自动通过')
      } else {
        await showAlert('采购计划已创建并提交审批')
      }
    }
  } catch (error) {
    console.error('创建采购计划失败:', error)
    await showAlert('创建采购计划失败，请重试')
  } finally {
    showCreateModal.value = false
  }
}

// ==================== 筛选操作 ====================
function handleReset() {
  relatedBatchCode.value = ''
  purchaseType.value = '全部'
  status.value = '全部'
  alertFilter.value = '全部'
  applicant.value = ''
  applicantDepartment.value = ''
  priority.value = '全部'
  requiredStartDate.value = ''
  requiredEndDate.value = ''
  currentPage.value = 1
}

function handleSearch() {
  currentPage.value = 1
}

// ==================== 导出操作 ====================
function handleExportClick() {
  exportMode.value = true
  selectedRows.value = []
}

function handleSelectAll() {
  if (selectedRows.value.length === filteredAndSortedData.value.length) {
    selectedRows.value = []
  } else {
    selectedRows.value = filteredAndSortedData.value.map((p: any) => p.purchaseApplicationCode)
  }
}

function handleSelectRow(id: string) {
  if (selectedRows.value.includes(id)) {
    selectedRows.value = selectedRows.value.filter(rowId => rowId !== id)
  } else {
    selectedRows.value = [...selectedRows.value, id]
  }
}

function handleConfirmExport() {
  if (selectedRows.value.length === 0) {
    showAlert('请先选择要导出的数据')
    return
  }
  showExportModal.value = true
}

async function handleDoExport() {
  const selectedData = purchasePlansData.value.filter((p: any) => selectedRows.value.includes(p.purchaseApplicationCode))
  const headers = ['计划编号', '计划名称', '类型', '申请人', '申请日期', '总金额', '供应商', '交货日期', '优先级', '状态']
  const exportData = selectedData.map((row: any) => ({
    '计划编号': row.purchaseApplicationCode,
    '计划名称': row.planTitle,
    '类型': row.purchaseTypeName,
    '申请人': row.applicant,
    '申请日期': row.applyDate,
    '总金额': row.totalAmount,
    '供应商': row.supplierName,
    '交货日期': row.requiredDate,
    '优先级': row.priorityText,
    '状态': row.statusText,
  }))
  let content = ''
  let mimeType = ''
  let extension = ''
  if (exportFormat.value === 'csv') {
    content = headers.join(',') + '\n' + exportData.map((row: any) => headers.map((h: string) => `"${row[h] || ''}"`).join(',')).join('\n')
    mimeType = 'text/csv;charset=utf-8'
    extension = 'csv'
  } else if (exportFormat.value === 'excel') {
    content = `<html><head><meta charset="utf-8"></head><body><table border="1"><tr>${headers.map((h: string) => `<th>${h}</th>`).join('')}</tr>${exportData.map((row: any) => `<tr>${headers.map((h: string) => `<td>${row[h] || ''}</td>`).join('')}</tr>`).join('')}</table></body></html>`
    mimeType = 'application/vnd.ms-excel;charset=utf-8'
    extension = 'xls'
  } else if (exportFormat.value === 'word') {
    content = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"></head><body><table border="1">${headers.map((h: string) => `<th>${h}</th>`).join('')}${exportData.map((row: any) => `<tr>${headers.map((h: string) => `<td>${row[h] || ''}</td>`).join('')}</tr>`).join('')}</table></body></html>`
    mimeType = 'application/vnd.ms-word;charset=utf-8'
    extension = 'doc'
  }
  const fileName = `采购计划_${new Date().toISOString().slice(0, 10)}.${extension}`
  try {
    if ((window as any).showSaveFilePicker) {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: fileName,
        types: [{ description: exportFormat.value.toUpperCase() + ' Files', accept: { [mimeType]: ['.' + extension] } }]
      })
      const writable = await handle.createWritable()
      await writable.write(content)
      await writable.close()
    } else {
      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      a.click()
      URL.revokeObjectURL(url)
    }
  } catch (err) {
    console.error('Export failed:', err)
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
    URL.revokeObjectURL(url)
  }
  exportMode.value = false
  selectedRows.value = []
  showExportModal.value = false
}

function handleCancelExport() {
  exportMode.value = false
  selectedRows.value = []
}

// ==================== 批量编辑/删除模式 ====================
function handleEnterBatchEditMode() {
  batchEditMode.value = true
}

function handleEnterBatchDeleteMode() {
  batchDeleteMode.value = true
}

function handleDeleteClick() {
  if (selectedRows.value.length === 0) {
    showAlert('请先选择要删除的数据')
    return
  }
  showDeleteModal.value = true
}

async function handleDeleteConfirm() {
  try {
    const deletablePlans = purchasePlansData.value
      .filter((p: any) => selectedRows.value.includes(p.purchaseApplicationCode))
      .filter((p: any) => p.status === 'draft' || p.status === 'pending' || p.approvalStatus === 'rejected')
    if (deletablePlans.length === 0) {
      await showAlert('没有可删除的采购计划（只能删除草稿、待审批和审批被拒绝状态）')
      return
    }
    const selectedIds = deletablePlans.map((p: any) => p.id)
    await purchasePlanStore.deletePlans(selectedIds)
    showDeleteModal.value = false
    batchDeleteMode.value = false
    selectedRows.value = []
    await showAlert(`已删除 ${selectedIds.length} 个采购计划`)
  } catch (error) {
    console.error('删除采购计划失败:', error)
    await showAlert('删除失败，请重试')
  }
}

function handleViewDetail(plan: any) {
  selectedPlanDetail.value = plan
  showDetailModal.value = true
}

function handleSingleEdit(plan: any) {
  if (plan.status === 'completed' || plan.status === 'purchasing') {
    showAlert('该采购计划已归档，无法编辑')
    return
  }
  selectedPlanCode.value = plan.purchaseApplicationCode
  currentEditingPlan.value = plan
  batchEditData.value = {
    purchaseType: plan.purchaseType,
    priority: plan.priority,
    requiredDate: plan.requiredDate || '',
    remark: plan.remark || '',
  }
  batchEditItems.value = plan.items || []
  editedPlanCodes.value = []
  editedPlans.value = {}
  selectedRows.value = [plan.purchaseApplicationCode]
  showBatchEditModal.value = true
}

async function handleSingleDeleteClick(plan: any) {
  console.log('【删除采购计划】开始删除, plan:', plan.id, plan.purchaseApplicationCode, 'status:', plan.status, 'approvalStatus:', plan.approvalStatus)
  if (plan.status !== 'draft' && plan.status !== 'pending' && plan.approvalStatus !== 'rejected') {
    await showAlert('只有草稿、待审批和审批被拒绝的采购计划才能删除')
    return
  }
  if (await showConfirm(`确定要删除采购计划 ${plan.purchaseApplicationCode} 吗？`)) {
    try {
      await purchasePlanStore.deletePlan(plan.id)
      await showAlert('删除成功')
    } catch (error: any) {
      console.error('删除采购计划失败:', error)
      await showAlert('删除失败: ' + (error.message || ''))
    }
  }
}

function handleBatchEditConfirm() {
  if (selectedRows.value.length === 0) {
    showAlert('请先选择要编辑的数据')
    return
  }
  const selectedPlansData = purchasePlansData.value.filter((p: any) => selectedRows.value.includes(p.purchaseApplicationCode))
  if (selectedPlansData.length > 0) {
    selectedPlanCode.value = selectedPlansData[0].purchaseApplicationCode
    currentEditingPlan.value = selectedPlansData[0]
    batchEditData.value = {
      purchaseType: selectedPlansData[0].purchaseType,
      priority: selectedPlansData[0].priority,
      requiredDate: selectedPlansData[0].requiredDate || '',
      remark: selectedPlansData[0].remark || '',
    }
    batchEditItems.value = selectedPlansData[0].items || []
  }
  editedPlanCodes.value = []
  editedPlans.value = {}
  showBatchEditModal.value = true
}

function handleBatchEditCancel() {
  batchEditMode.value = false
  selectedRows.value = []
}

function handleBatchDeleteCancel() {
  batchDeleteMode.value = false
  selectedRows.value = []
}

function handleBatchEditNext() {
  showBatchEditModal.value = false
  batchEditMode.value = false
  selectedRows.value = []
  editedPlanCodes.value = []
  editedPlans.value = {}
  selectedPlanCode.value = ''
  currentEditingPlan.value = null
  batchEditItems.value = []
}

function handleBatchEditModalClose() {
  batchEditMode.value = false
  selectedRows.value = []
  editedPlanCodes.value = []
  editedPlans.value = {}
  selectedPlanCode.value = ''
  currentEditingPlan.value = null
  batchEditItems.value = []
}

function handleBatchClickOutside(event: MouseEvent) {
  if (batchSelectRef.value && !batchSelectRef.value.contains(event.target as Node)) {
    batchSelectOpen.value = false
  }
}

watch(batchSelectOpen, (open) => {
  if (open) {
    document.addEventListener('mousedown', handleBatchClickOutside)
  } else {
    document.removeEventListener('mousedown', handleBatchClickOutside)
  }
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleBatchClickOutside)
})

async function handleBatchEditSave() {
  if (!currentEditingPlan.value) {
    await showAlert('请先选择一个采购计划')
    return
  }
  try {
    const selectedUser = users.value.find((u: any) => u.id === currentEditingPlan.value.applicantId)
    const applicantName = selectedUser?.realName || selectedUser?.name || currentEditingPlan.value.applicant || ''
    await purchasePlanStore.updatePlan(currentEditingPlan.value.id, {
      relatedBatchCode: currentEditingPlan.value.relatedBatchCode,
      purchaseType: batchEditData.value.purchaseType,
      priority: batchEditData.value.priority,
      requiredDate: batchEditData.value.requiredDate,
      remark: batchEditData.value.remark,
      applicantId: currentEditingPlan.value.applicantId,
      applicantName: applicantName,
      applicantDepartment: currentEditingPlan.value.applicantDepartment,
      items: batchEditItems.value,
    })
    showBatchEditModal.value = false
    batchEditMode.value = false
    selectedRows.value = []
    batchEditItems.value = []
    await showAlert('保存成功')
  } catch (error: any) {
    console.error('保存失败:', error)
    await showAlert(`保存失败: ${error.message || '请重试'}`)
  }
}

function handlePlanSelect(plan: any) {
  selectedPlanCode.value = plan.purchaseApplicationCode
  currentEditingPlan.value = plan
  batchEditData.value = {
    purchaseType: plan.purchaseType,
    priority: plan.priority,
    requiredDate: plan.requiredDate || '',
    remark: plan.remark || '',
  }
  batchEditItems.value = plan.items || []
  batchSelectOpen.value = false
}

function handleAddBatchEditItem() {
  const newItem = {
    id: `new_${Date.now()}`,
    materialId: '',
    materialCode: '',
    materialName: '',
    barcode: '',
    category: '',
    specification: '',
    unit: '',
    quantity: 0,
    estimatedPrice: 0,
    estimatedTotalPrice: 0,
    supplier: '',
    location: '',
    batchNo: '',
    productionDate: '',
    expiryDate: '',
    purpose: '',
    remark: '',
  }
  batchEditItems.value = [...batchEditItems.value, newItem]
}

// ==================== 监听物料明细变化 ====================
watch(batchEditItems, () => {
  if (selectedPlanCode.value && batchEditItems.value.length > 0 && currentEditingPlan.value) {
    const originalItems = currentEditingPlan.value.items || []
    const isItemsChanged = JSON.stringify(batchEditItems.value) !== JSON.stringify(originalItems)
    if (isItemsChanged) {
      editedPlans.value = { ...editedPlans.value, [selectedPlanCode.value]: { ...(editedPlans.value[selectedPlanCode.value] || {}), items: batchEditItems.value } }
    }
  }
}, { deep: true })
</script>

<style scoped>
.purchase-plan-dialog :deep(.el-dialog__header) {
  margin-right: 0;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(to right, #10b981, #059669, #10b981) !important;
  border-top-left-radius: 0.75rem;
  border-top-right-radius: 0.75rem;
}
.purchase-plan-dialog :deep(.el-dialog__title) {
  color: #ffffff;
  font-size: 1.125rem;
  font-weight: 600;
  line-height: 1.75rem;
}
.purchase-plan-dialog :deep(.el-dialog__headerbtn) {
  width: 36px;
  height: 36px;
  top: 50%;
  transform: translateY(-50%);
  right: 1rem;
}
.purchase-plan-dialog :deep(.el-dialog__headerbtn .el-dialog__close) {
  color: #ffffff;
  font-size: 1.25rem;
}
.purchase-plan-dialog :deep(.el-dialog__headerbtn:hover .el-dialog__close) {
  color: #ffffff;
}
.purchase-plan-dialog :deep(.el-dialog__headerbtn:hover) {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
}
</style>
