<template>
  <div class="space-y-6">
    <!-- 页面头部 + Tab切换 -->
    <MaterialReceivingHeader :activeTab="activeTab" @tab-change="onTabChange" />

    <!-- Tab 1: 申请领料 -->
    <div v-show="activeTab === 'application'" class="space-y-4">
      <!-- 搜索区域 - 严格对齐 V1.1 (ApplicationTab.tsx 第 203-283 行) -->
      <div class="bg-gray-50 rounded-lg p-4">
        <div class="flex items-end gap-4">
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-900 mb-1">领料单号</label>
            <div class="relative">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input v-model="searchCode" placeholder="搜索领料单号..." class="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" @input="currentPage = 1" />
            </div>
          </div>
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-900 mb-1">申领人</label>
            <div class="relative">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input v-model="searchApplicant" placeholder="搜索申领人..." class="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" @input="currentPage = 1" />
            </div>
          </div>
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-900 mb-1">生产计划批次号</label>
            <div class="relative">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input v-model="searchBatchCode" placeholder="搜索生产计划批次号..." class="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" @input="currentPage = 1" />
            </div>
          </div>
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-900 mb-1">库存地点</label>
            <select v-model="searchWarehouse" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" @change="currentPage = 1">
              <option value="">全部</option>
              <option v-for="w in warehouses" :key="w" :value="w">{{ w }}</option>
            </select>
          </div>
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-900 mb-1">审批状态</label>
            <select v-model="statusFilter" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" @change="currentPage = 1">
              <option value="all">全部状态</option>
              <option value="待审批">待审批</option>
              <option value="已审批">已审批</option>
              <option value="已拒绝">已拒绝</option>
              <option value="已作废">已作废</option>
              <option value="已取消">已取消</option>
            </select>
          </div>
          <button class="h-8 px-3 rounded-md text-xs font-medium bg-amber-500 text-white hover:bg-amber-600 inline-flex items-center gap-1" @click="handleReset"><RotateCcw class="w-4 h-4" />重置</button>
        </div>
      </div>

      <!-- 数据表格 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">领料申请单列表</h3>
          <div class="flex gap-2">
            <button class="h-8 px-3 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 inline-flex items-center gap-1" @click="handleOpenAdd"><Plus class="w-4 h-4" />新增</button>
            <button v-if="!batchEditMode && !deleteMode && !exportMode" class="h-8 px-3 rounded-md text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 inline-flex items-center gap-1" @click="batchEditMode = 'edit'; selectedRows = []"><Pencil class="w-4 h-4" />编辑</button>
            <button v-if="!batchEditMode && !deleteMode && !exportMode" class="h-8 px-3 rounded-md text-xs font-medium bg-red-600 text-white hover:bg-red-700 inline-flex items-center gap-1" @click="batchEditMode = 'delete'; selectedRows = []"><Trash2 class="w-4 h-4" />删除</button>
            <button v-if="!batchEditMode && !deleteMode && !exportMode" class="h-8 px-3 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 inline-flex items-center gap-1" @click="exportMode = true; selectedRows = []"><Download class="w-4 h-4" />导出</button>
            <button v-if="batchEditMode === 'edit' && selectedRows.length > 0" class="h-8 px-3 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 inline-flex items-center gap-1" @click="showBatchEditModal = true">确认编辑 ({{ selectedRows.length }}条)</button>
            <button v-if="batchEditMode === 'delete' && selectedRows.length > 0" class="h-8 px-3 rounded-md text-xs font-medium bg-red-600 text-white hover:bg-red-700 inline-flex items-center gap-1" @click="showBatchDeleteConfirm = true">确认删除 ({{ selectedRows.length }}条)</button>
            <button v-if="batchEditMode || deleteMode || exportMode" class="h-8 px-3 rounded-md text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 inline-flex items-center gap-1" @click="batchEditMode = null; deleteMode = false; exportMode = false; selectedRows = []">取消</button>
          </div>
        </div>

        <!-- 表格 - 表头严格对齐 V1.1 (ApplicationTab.tsx 第 352 行) -->
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <tr>
                <th v-if="batchEditMode || deleteMode || exportMode" class="px-4 py-3 text-left text-sm font-semibold w-14 whitespace-nowrap">
                  <input type="checkbox" :checked="paginatedApplicationData.length > 0 && selectedRows.length === paginatedApplicationData.length" @change="toggleAppSelectAll" class="w-4 h-4 rounded border-white" />
                </th>
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
              <tr v-if="paginatedApplicationData.length === 0">
                <td :colspan="(batchEditMode || deleteMode || exportMode) ? 14 : 13" class="px-4 py-8 text-center text-gray-500">暂无数据</td>
              </tr>
              <template v-for="row in paginatedApplicationData" :key="row.id">
                <tr class="hover:bg-blue-100 transition-colors">
                  <td v-if="batchEditMode || deleteMode || exportMode" class="px-4 py-3">
                    <input type="checkbox" :checked="selectedRows.includes(row.id)" @change="toggleAppRow(row.id)" class="w-4 h-4 rounded border-gray-400" />
                  </td>
                  <td class="px-4 py-3">
                    <button class="text-gray-500 hover:text-blue-600 p-1" @click="toggleAppExpandRow(row.id)">
                      <ChevronDown v-if="appExpandedRows.includes(row.id)" class="w-4 h-4" />
                      <ChevronRight v-else class="w-4 h-4" />
                    </button>
                  </td>
                  <td class="px-4 py-3 text-sm font-medium text-blue-600 cursor-pointer hover:text-blue-700 whitespace-nowrap" @click="handleViewDetail(row)">{{ row.code }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.date }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.applicant }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.department }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.warehouseLocation }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.materials.length > 0 ? row.materials.length + '种' : '-' }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.plantArea }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.reviewer }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.productionBatchCode }}</td>
                  <td class="px-4 py-3 whitespace-nowrap">
                    <div class="flex flex-col gap-1">
                      <span class="inline-flex px-2 py-1 rounded-full text-xs font-medium" :class="getAppStatusClass(row.status)">{{ row.status }}</span>
                      <span v-if="row.status === '已拒绝' && row.rejectReason" class="text-xs text-red-600 max-w-[150px] truncate" :title="row.rejectReason">原因：{{ row.rejectReason }}</span>
                    </div>
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.materials.length > 0 ? row.materials[0].remark : '-' }}</td>
                  <td class="px-4 py-3 whitespace-nowrap">
                    <div class="flex items-center gap-1">
                      <button class="text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 p-1" title="查看" @click="handleViewDetail(row)">
                        <Eye class="w-4 h-4" />
                      </button>
                      <button class="text-gray-500 hover:text-blue-600 hover:bg-blue-50 p-1" title="编辑" @click="handleEditRecord(row)">
                        <Pencil class="w-4 h-4" />
                      </button>
                      <button v-if="row.status === '待审批' || row.status === '已审批'" class="text-gray-500 hover:text-amber-600 hover:bg-amber-50 p-1" title="作废" @click="handleVoidApply(row)">
                        <FileX class="w-4 h-4" />
                      </button>
                      <button class="text-gray-500 hover:text-red-600 hover:bg-red-50 p-1" title="删除" @click="handleDeleteRecord(row.id)">
                        <Trash2 class="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                <!-- 展开行 - 严格对齐 V1.1 (ApplicationTab.tsx 第 437-486 行) -->
                <tr v-if="appExpandedRows.includes(row.id)" class="bg-white">
                  <td :colspan="(batchEditMode || deleteMode || exportMode) ? 14 : 13" class="px-4 py-3">
                    <div class="text-sm">
                      <div class="font-medium text-blue-800 mb-2">物料明细</div>
                      <div class="overflow-x-auto rounded-lg border border-gray-200">
                        <table class="w-full text-xs">
                          <thead class="bg-[#F2F6FA]">
                            <tr>
                              <th class="px-3 py-2 text-left text-sm font-semibold text-blue-800 whitespace-nowrap">物料编码</th>
                              <th class="px-3 py-2 text-left text-sm font-semibold text-blue-800 whitespace-nowrap">物料名称</th>
                              <th class="px-3 py-2 text-left text-sm font-semibold text-blue-800 whitespace-nowrap">批次号</th>
                              <th class="px-3 py-2 text-left text-sm font-semibold text-blue-800 whitespace-nowrap">规格</th>
                              <th class="px-3 py-2 text-left text-sm font-semibold text-blue-800 whitespace-nowrap">单位</th>
                              <th class="px-3 py-2 text-left text-sm font-semibold text-blue-800 whitespace-nowrap">申领数量</th>
                              <th class="px-3 py-2 text-left text-sm font-semibold text-blue-800 whitespace-nowrap">当前库存</th>
                              <th class="px-3 py-2 text-left text-sm font-semibold text-blue-800 whitespace-nowrap">单价(元)</th>
                              <th class="px-3 py-2 text-left text-sm font-semibold text-blue-800 whitespace-nowrap">小计(元)</th>
                              <th class="px-3 py-2 text-left text-sm font-semibold text-blue-800 whitespace-nowrap">仓库货位</th>
                              <th class="px-3 py-2 text-left text-sm font-semibold text-blue-800 whitespace-nowrap">备注</th>
                            </tr>
                          </thead>
                          <tbody class="divide-y divide-gray-200">
                            <tr v-for="m in row.materials" :key="m.materialCode" class="hover:bg-[#F2F6FA]/50">
                              <td class="px-3 py-2 text-sm text-blue-800 font-mono whitespace-nowrap">{{ m.materialCode }}</td>
                              <td class="px-3 py-2 text-sm text-blue-800 whitespace-nowrap">{{ m.materialName }}</td>
                              <td class="px-3 py-2 text-sm text-blue-800 font-mono whitespace-nowrap">{{ m.batchNo || '' }}</td>
                              <td class="px-3 py-2 text-sm text-blue-800 whitespace-nowrap">{{ m.spec }}</td>
                              <td class="px-3 py-2 text-sm text-blue-800 whitespace-nowrap">{{ m.unit }}</td>
                              <td class="px-3 py-2 text-sm whitespace-nowrap" :class="m.requestedQuantity > m.stockQuantity ? 'text-red-600 font-bold' : 'text-blue-800'">{{ m.requestedQuantity }}{{ m.requestedQuantity > m.stockQuantity ? ' ⚠️' : '' }}</td>
                              <td class="px-3 py-2 text-sm text-blue-800 whitespace-nowrap">{{ m.stockQuantity }}</td>
                              <td class="px-3 py-2 text-sm text-blue-800 whitespace-nowrap">{{ (m.unitPrice || 0).toFixed(2) }}</td>
                              <td class="px-3 py-2 text-sm text-blue-800 whitespace-nowrap">{{ (m.requestedQuantity * (m.unitPrice || 0)).toFixed(2) }}</td>
                              <td class="px-3 py-2 text-sm text-blue-800 whitespace-nowrap">{{ m.warehousePosition }}</td>
                              <td class="px-3 py-2 text-sm text-blue-800 whitespace-nowrap">{{ m.remark }}</td>
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
        </div>

        <!-- 分页 -->
        <div class="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
          <span class="text-sm text-gray-500">共 {{ filteredApplicationData.length }} 条记录</span>
          <Pagination
            :current-page="currentPage"
            :total-pages="totalPages"
            :page-size="pageSize"
            :page-size-options="[10, 20, 50]"
            :show-page-size="true"
            @page-change="(page) => { currentPage = page }"
            @page-size-change="(size) => { pageSize = size; currentPage = 1 }"
          />
        </div>
      </div>
    </div>

    <!-- Tab 2: 领料出库 -->
    <div v-show="activeTab === 'execute'" class="space-y-4">
      <!-- 搜索区域 - 严格对齐 V1.1 (ExecuteTab.tsx 第 200-282 行) -->
      <div class="bg-gray-50 rounded-lg p-4">
        <div class="flex items-end gap-4">
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-900 mb-1">出库单号</label>
            <div class="relative">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input v-model="exSearchCode" placeholder="搜索出库单号..." class="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
            </div>
          </div>
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-900 mb-1">申领人</label>
            <div class="relative">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input v-model="exSearchApplicant" placeholder="搜索申领人..." class="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
            </div>
          </div>
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-900 mb-1">生产计划批次号</label>
            <div class="relative">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input v-model="exSearchBatchCode" placeholder="搜索生产计划批次号..." class="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
            </div>
          </div>
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-900 mb-1">库存地点</label>
            <select v-model="exSearchWarehouse" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
              <option value="">全部</option>
              <option v-for="w in warehouses" :key="w" :value="w">{{ w }}</option>
            </select>
          </div>
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-900 mb-1">执行状态</label>
            <select v-model="exStatusFilter" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
              <option value="all">全部状态</option>
              <option value="已出库">已出库</option>
              <option value="部分出库">部分出库</option>
              <option value="待出库">待出库</option>
              <option value="已取消">已取消</option>
            </select>
          </div>
          <button class="h-8 px-3 rounded-md text-xs font-medium bg-amber-500 text-white hover:bg-amber-600 inline-flex items-center gap-1" @click="exSearchCode = ''; exSearchApplicant = ''; exSearchBatchCode = ''; exSearchWarehouse = ''; exStatusFilter = 'all'"><RotateCcw class="w-4 h-4" />重置</button>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">出库单列表</h3>
          <div class="flex gap-2">
            <button class="h-8 px-3 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 inline-flex items-center gap-1" @click="handleOpenExAdd"><Plus class="w-4 h-4" />新增</button>
            <button v-if="!exBatchEditMode" class="h-8 px-3 rounded-md text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 inline-flex items-center gap-1" @click="exBatchEditMode = 'edit'; exSelectedRows = []"><Pencil class="w-4 h-4" />编辑</button>
            <button v-if="!exBatchEditMode" class="h-8 px-3 rounded-md text-xs font-medium bg-red-600 text-white hover:bg-red-700 inline-flex items-center gap-1" @click="exBatchEditMode = 'delete'; exSelectedRows = []"><Trash2 class="w-4 h-4" />删除</button>
            <button v-if="!exBatchEditMode" class="h-8 px-3 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 inline-flex items-center gap-1" @click="exExportMode = true; exSelectedRows = []"><Download class="w-4 h-4" />导出</button>
            <button v-if="exBatchEditMode === 'edit' && exSelectedRows.length > 0" class="h-8 px-3 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 inline-flex items-center gap-1" @click="exShowBatchEditModal = true">确认编辑 ({{ exSelectedRows.length }}条)</button>
            <button v-if="exBatchEditMode === 'delete' && exSelectedRows.length > 0" class="h-8 px-3 rounded-md text-xs font-medium bg-red-600 text-white hover:bg-red-700 inline-flex items-center gap-1" @click="exShowBatchDeleteConfirm = true">确认删除 ({{ exSelectedRows.length }}条)</button>
            <button v-if="exBatchEditMode || exExportMode" class="h-8 px-3 rounded-md text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 inline-flex items-center gap-1" @click="exBatchEditMode = null; exExportMode = false; exSelectedRows = []">取消</button>
          </div>
        </div>

        <!-- 出库表格 - 表头严格对齐 V1.1 (ExecuteTab.tsx 第 344 行) -->
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <tr>
                <th v-if="exBatchEditMode || exExportMode" class="px-4 py-3 text-left text-sm font-semibold w-14 whitespace-nowrap">
                  <input type="checkbox" :checked="paginatedExecuteData.length > 0 && exSelectedRows.length === paginatedExecuteData.length" @change="toggleExSelectAll" class="w-4 h-4 rounded border-white" />
                </th>
                <th class="px-4 py-3 text-left text-sm font-semibold w-12 whitespace-nowrap"></th>
                <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">出库单号</th>
                <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">申请日期</th>
                <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">申请人</th>
                <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">库存地点</th>
                <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">审核人</th>
                <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">操作人</th>
                <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">生产计划批次号</th>
                <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">执行状态</th>
                <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-300">
              <tr v-if="paginatedExecuteData.length === 0">
                <td :colspan="(exBatchEditMode || exExportMode) ? 11 : 10" class="px-4 py-8 text-center text-gray-500">暂无数据</td>
              </tr>
              <template v-for="row in paginatedExecuteData" :key="row.id">
                <tr class="hover:bg-blue-100 transition-colors">
                  <td v-if="exBatchEditMode || exExportMode" class="px-4 py-3">
                    <input type="checkbox" :checked="exSelectedRows.includes(row.id)" @change="toggleExRow(row.id)" class="w-4 h-4 rounded border-gray-400" />
                  </td>
                  <td class="px-4 py-3">
                    <button class="text-gray-500 hover:text-blue-600 p-1" @click="toggleExExpandRow(row.id)">
                      <ChevronDown v-if="exExpandedRowsId.includes(row.id)" class="w-4 h-4" />
                      <ChevronRight v-else class="w-4 h-4" />
                    </button>
                  </td>
                  <td class="px-4 py-3 text-sm font-medium text-blue-600 cursor-pointer hover:text-blue-700 whitespace-nowrap" @click="handleExViewDetail(row)">{{ row.code }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.date }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.applicant }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.warehouseLocation }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.reviewer }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.operator }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.productionBatchCode }}</td>
                  <td class="px-4 py-3 whitespace-nowrap">
                    <span class="inline-flex px-2 py-1 rounded-full text-xs font-medium" :class="getExStatusClass(row.executeStatus)">{{ row.executeStatus }}</span>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap">
                    <div class="flex items-center gap-1">
                      <button class="text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 p-1" @click="handleExViewDetail(row)" title="查看">
                        <Eye class="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="exExpandedRowsId.includes(row.id)" class="bg-white">
                  <td :colspan="(exBatchEditMode || exExportMode) ? 11 : 10" class="px-4 py-3">
                    <div class="text-sm">
                      <div class="font-medium text-blue-800 mb-2">物料明细</div>
                      <div class="overflow-x-auto rounded-lg border border-gray-200">
                        <table class="w-full text-xs">
                          <thead class="bg-[#F2F6FA]">
                            <tr>
                              <th class="px-3 py-2 text-left text-sm font-semibold text-blue-800 whitespace-nowrap">来源领料单号</th>
                              <th class="px-3 py-2 text-left text-sm font-semibold text-blue-800 whitespace-nowrap">物料编码</th>
                              <th class="px-3 py-2 text-left text-sm font-semibold text-blue-800 whitespace-nowrap">物料名称</th>
                              <th class="px-3 py-2 text-left text-sm font-semibold text-blue-800 whitespace-nowrap">批次号</th>
                              <th class="px-3 py-2 text-left text-sm font-semibold text-blue-800 whitespace-nowrap">规格</th>
                              <th class="px-3 py-2 text-left text-sm font-semibold text-blue-800 whitespace-nowrap">单位</th>
                              <th class="px-3 py-2 text-left text-sm font-semibold text-blue-800 whitespace-nowrap">申请数量</th>
                              <th class="px-3 py-2 text-left text-sm font-semibold text-blue-800 whitespace-nowrap">实际库存</th>
                              <th class="px-3 py-2 text-left text-sm font-semibold text-blue-800 whitespace-nowrap">本次实发</th>
                              <th class="px-3 py-2 text-left text-sm font-semibold text-blue-800 whitespace-nowrap">单价(元)</th>
                              <th class="px-3 py-2 text-left text-sm font-semibold text-blue-800 whitespace-nowrap">小计(元)</th>
                              <th class="px-3 py-2 text-left text-sm font-semibold text-blue-800 whitespace-nowrap">仓库货位</th>
                              <th class="px-3 py-2 text-left text-sm font-semibold text-blue-800 whitespace-nowrap">差异</th>
                              <th class="px-3 py-2 text-left text-sm font-semibold text-blue-800 whitespace-nowrap">备注</th>
                            </tr>
                          </thead>
                          <tbody class="divide-y divide-gray-200">
                            <tr v-for="m in row.materials" :key="m.materialCode" class="hover:bg-[#F2F6FA]/50">
                              <td class="px-3 py-2 text-sm text-blue-800 font-mono whitespace-nowrap">{{ m.applicationCode }}</td>
                              <td class="px-3 py-2 text-sm text-blue-800 font-mono whitespace-nowrap">{{ m.materialCode }}</td>
                              <td class="px-3 py-2 text-sm text-blue-800 whitespace-nowrap">{{ m.materialName }}</td>
                              <td class="px-3 py-2 text-sm text-blue-800 font-mono whitespace-nowrap">{{ m.batchNo || '' }}</td>
                              <td class="px-3 py-2 text-sm text-blue-800 whitespace-nowrap">{{ m.spec }}</td>
                              <td class="px-3 py-2 text-sm text-blue-800 whitespace-nowrap">{{ m.unit }}</td>
                              <td class="px-3 py-2 text-sm text-blue-800 whitespace-nowrap">{{ m.requestedQuantity }}</td>
                              <td class="px-3 py-2 text-sm text-blue-800 whitespace-nowrap">
                                <span :class="m.stockQuantity < m.requestedQuantity ? 'text-red-600 font-medium' : 'text-green-600'">{{ m.stockQuantity }}</span>
                              </td>
                              <td class="px-3 py-2 text-sm text-blue-800 whitespace-nowrap">
                                <span v-if="m.actualQuantity > 0" :class="m.actualQuantity < m.requestedQuantity ? 'text-amber-600 font-medium' : 'text-green-600'">{{ m.actualQuantity }}</span>
                                <span v-else :class="m.stockQuantity === 0 ? 'text-red-600 font-medium' : 'text-gray-400'">{{ m.actualQuantity }}</span>
                              </td>
                              <td class="px-3 py-2 text-sm text-blue-800 whitespace-nowrap">{{ (m.unitPrice || 0).toFixed(2) }}</td>
                              <td class="px-3 py-2 text-sm text-blue-800 whitespace-nowrap">{{ ((m.requestedQuantity || 0) * (m.unitPrice || 0)).toFixed(2) }}</td>
                              <td class="px-3 py-2 text-sm text-blue-800 whitespace-nowrap">{{ m.warehousePosition || '-' }}</td>
                              <td class="px-3 py-2 text-sm whitespace-nowrap">
                                <span v-if="(m.requestedQuantity || 0) - (m.actualQuantity || 0) > 0" class="text-red-600 font-medium">-{{ (m.requestedQuantity || 0) - (m.actualQuantity || 0) }}</span>
                                <span v-else class="text-green-600">0</span>
                              </td>
                              <td class="px-3 py-2 text-sm text-blue-800 whitespace-nowrap">{{ m.remark }}</td>
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
        </div>

        <div class="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
          <span class="text-sm text-gray-500">共 {{ exFilteredData.length }} 条记录</span>
          <Pagination
            :current-page="exCurrentPage"
            :total-pages="exTotalPages"
            :page-size="exPageSize"
            :page-size-options="[10, 20, 50]"
            :show-page-size="true"
            @page-change="(page) => { exCurrentPage = page }"
            @page-size-change="(size) => { exPageSize = size; exCurrentPage = 1 }"
          />
        </div>
      </div>
    </div>

    <!-- Tab 3: 领料统计（严格对齐 V1.1 StatisticsTab.tsx） -->
    <div v-show="activeTab === 'statistics'" class="space-y-4">
      <!-- 统计卡片 - 4 张对齐 V1.1 StatCards.tsx -->
      <div class="grid grid-cols-4 gap-3 mb-3">
        <div class="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-lg p-3 border border-emerald-200/50">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
              <ClipboardList class="w-4 h-4 text-white" />
            </div>
            <div>
              <div class="text-xs text-emerald-600/70">领料单数</div>
              <div class="text-xl font-bold text-emerald-700">{{ statSummary.requisitionCount }}</div>
            </div>
          </div>
        </div>
        <div class="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg p-3 border border-blue-200/50">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
              <Package class="w-4 h-4 text-white" />
            </div>
            <div>
              <div class="text-xs text-blue-600/70">领料总量</div>
              <div class="text-xl font-bold text-blue-700">{{ formatNumber(statSummary.totalQuantity) }}</div>
            </div>
          </div>
        </div>
        <div class="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-lg p-3 border border-amber-200/50">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
              <span class="text-sm font-bold text-white">¥</span>
            </div>
            <div>
              <div class="text-xs text-amber-600/70">总金额</div>
              <div class="text-xl font-bold text-amber-700">¥{{ formatNumber(statSummary.totalAmount) }}</div>
            </div>
          </div>
        </div>
        <div :class="['rounded-lg p-3 border', statSummary.avgDifferenceRate < 0 ? 'bg-gradient-to-br from-green-50 to-green-100/50 border-green-200/50' : 'bg-gradient-to-br from-red-50 to-red-100/50 border-red-200/50']">
          <div class="flex items-center gap-2">
            <div :class="['w-8 h-8 rounded-lg flex items-center justify-center', statSummary.avgDifferenceRate < 0 ? 'bg-green-500' : 'bg-red-500']">
              <TrendingDown :class="['w-4 h-4 text-white', statSummary.avgDifferenceRate >= 0 ? 'transform rotate-180' : '']" />
            </div>
            <div>
              <div :class="['text-xs', statSummary.avgDifferenceRate < 0 ? 'text-green-600/70' : 'text-red-600/70']">差异率</div>
              <div :class="['text-xl font-bold', statSummary.avgDifferenceRate < 0 ? 'text-green-700' : 'text-red-700']">{{ statSummary.avgDifferenceRate.toFixed(1) }}%</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 子 Tab：月度汇总 / 分类汇总（V1.1 实际仅 2 个 Tab） -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100">
        <div class="px-6 pt-4 pb-0 border-b border-gray-200">
          <div class="flex gap-6">
            <button class="relative pb-3 text-sm font-semibold transition-colors" :class="statActiveTab === 'monthly' ? 'text-emerald-600' : 'text-gray-500 hover:text-gray-700'" @click="statActiveTab = 'monthly'; statCurrentPage = 1">
              <span class="inline-flex items-center gap-1"><Calendar class="w-4 h-4" />月度汇总</span>
              <span v-if="statActiveTab === 'monthly'" class="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full"></span>
            </button>
            <button class="relative pb-3 text-sm font-semibold transition-colors" :class="statActiveTab === 'material' ? 'text-emerald-600' : 'text-gray-500 hover:text-gray-700'" @click="statActiveTab = 'material'; statCurrentPage = 1">
              <span class="inline-flex items-center gap-1"><BarChart2 class="w-4 h-4" />分类汇总</span>
              <span v-if="statActiveTab === 'material'" class="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full"></span>
            </button>
          </div>
        </div>

        <!-- ========== 月度汇总 Tab ========== -->
        <div v-show="statActiveTab === 'monthly'" class="p-4 space-y-4">
          <!-- 月度筛选 -->
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="flex items-end gap-4 flex-wrap">
              <div>
                <label class="block text-xs text-gray-500 mb-1">年度</label>
                <select v-model="statYearFilter" class="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white w-[120px]">
                  <option v-for="y in years" :key="y" :value="y">{{ y }}年</option>
                </select>
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">月份</label>
                <select v-model="statMonthFilter" class="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white w-[120px]" @change="statCurrentPage = 1">
                  <option value="all">全部</option>
                  <option v-for="m in 12" :key="m" :value="String(m).padStart(2, '0')">{{ m }}月</option>
                </select>
              </div>
              <button class="h-8 px-3 rounded-md text-xs font-medium bg-amber-500 text-white hover:bg-amber-600 inline-flex items-center gap-1" @click="handleStatReset">
                <RotateCcw class="w-4 h-4" />重置
              </button>
            </div>
          </div>

          <!-- 月度仪表盘：左环形图 + 右堆叠柱状图（简化实现，保留卡片版） -->
          <div class="grid grid-cols-2 gap-4">
            <!-- 环形图：年度分类占比 -->
            <div class="bg-white border border-gray-200 rounded-xl p-4">
              <h4 class="text-sm font-semibold text-gray-900 mb-3">年度分类占比</h4>
              <div class="space-y-2">
                <div v-for="cat in sanitizedCategorySummary" :key="cat.key" class="flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full shrink-0" :style="{ backgroundColor: cat.solid || cat.color }"></span>
                  <span class="text-xs text-gray-700 flex-1 truncate">{{ cat.name }}</span>
                  <span class="text-xs font-medium text-gray-900 w-16 text-right">{{ cat.percentage }}%</span>
                  <span class="text-xs text-gray-500 w-20 text-right">¥{{ (cat.amount || 0).toFixed(1) }}万</span>
                </div>
              </div>
            </div>
            <!-- 堆叠柱状图：月度趋势（CSS 实现） -->
            <div class="bg-white border border-gray-200 rounded-xl p-4">
              <h4 class="text-sm font-semibold text-gray-900 mb-3">月度领料趋势</h4>
              <div class="space-y-2">
                <div v-for="d in monthData" :key="d.month" class="flex items-center gap-2">
                  <span class="text-xs text-gray-500 w-14 shrink-0">{{ d.monthName }}</span>
                  <div class="flex-1 h-5 bg-gray-100 rounded overflow-hidden flex">
                    <div v-for="cat in sanitizedCategorySummary" :key="cat.key"
                      :style="{ width: ((d[cat.key] || 0) / (d.total || 1) * 100) + '%', backgroundColor: cat.solid || cat.color }"
                      :title="`${cat.name}: ${d[cat.key] || 0}`"
                      class="h-full"
                    ></div>
                  </div>
                  <span class="text-xs text-gray-700 w-12 text-right shrink-0">{{ d.total }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 分类汇总卡片（grid-cols-8: 7 分类 + 年度合计） -->
          <div class="grid grid-cols-4 lg:grid-cols-8 gap-2">
            <div v-for="cat in sanitizedCategorySummary" :key="cat.key" class="bg-white border border-gray-200 rounded-lg p-3">
              <div class="flex items-center gap-1 mb-1">
                <span class="w-2 h-2 rounded-full shrink-0" :style="{ backgroundColor: cat.solid || cat.color }"></span>
                <span class="text-xs text-gray-600 truncate">{{ cat.name }}</span>
              </div>
              <div class="text-sm font-bold text-gray-900">{{ formatNumber(cat.amount) }}</div>
              <div class="text-xs text-gray-500">万元 / {{ cat.percentage }}%</div>
            </div>
            <div class="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200/50 rounded-lg p-3">
              <div class="flex items-center gap-1 mb-1">
                <span class="w-2 h-2 rounded-full shrink-0 bg-emerald-500"></span>
                <span class="text-xs text-emerald-700 font-semibold">年度合计</span>
              </div>
              <div class="text-sm font-bold text-emerald-700">¥{{ formatNumber(totalCategoryAmount) }}万</div>
              <div class="text-xs text-emerald-600/70">100%</div>
            </div>
          </div>

          <!-- 月度汇总表（可展开 7 分类明细） -->
          <div class="border border-gray-200 rounded-xl overflow-hidden bg-white">
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
                  <tr>
                    <th class="px-3 py-3 text-left text-sm font-semibold w-12"></th>
                    <th class="px-3 py-3 text-left text-sm font-semibold whitespace-nowrap">月份</th>
                    <th class="px-3 py-3 text-right text-sm font-semibold whitespace-nowrap">领料数量</th>
                    <th class="px-3 py-3 text-right text-sm font-semibold whitespace-nowrap">领料金额</th>
                    <th class="px-3 py-3 text-center text-sm font-semibold whitespace-nowrap">排名</th>
                    <th class="px-3 py-3 text-center text-sm font-semibold whitespace-nowrap">占比</th>
                    <th class="px-3 py-3 text-center text-sm font-semibold whitespace-nowrap">环比</th>
                    <th class="px-3 py-3 text-center text-sm font-semibold whitespace-nowrap">同比</th>
                    <th class="px-3 py-3 text-center text-sm font-semibold whitespace-nowrap">操作</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr v-if="filteredMonthData.length === 0">
                    <td colspan="9" class="px-4 py-8 text-center text-gray-500">暂无数据</td>
                  </tr>
                  <template v-for="row in filteredMonthData" :key="row.month">
                    <tr class="hover:bg-emerald-50/40 transition-colors">
                      <td class="px-3 py-2">
                        <button class="text-gray-500 hover:text-emerald-600" @click="toggleMonthExpand(row.month)">
                          <ChevronDown v-if="expandedMonths.includes(row.month)" class="w-4 h-4" />
                          <ChevronRight v-else class="w-4 h-4" />
                        </button>
                      </td>
                      <td class="px-3 py-2 text-sm font-medium text-gray-900 whitespace-nowrap">{{ row.monthName }}</td>
                      <td class="px-3 py-2 text-sm text-right text-gray-700 whitespace-nowrap">{{ formatNumber(row.totalQuantity) }}</td>
                      <td class="px-3 py-2 text-sm text-right font-medium text-emerald-600 whitespace-nowrap">¥{{ formatNumber(row.totalAmount) }}</td>
                      <td class="px-3 py-2 text-sm text-center text-blue-600 font-medium whitespace-nowrap">{{ getMonthStats(row.month).rank }}</td>
                      <td class="px-3 py-2 text-sm text-center text-gray-700 whitespace-nowrap">{{ getMonthStats(row.month).percent }}</td>
                      <td class="px-3 py-2 text-sm text-center whitespace-nowrap">{{ getMonthStats(row.month).qoq }}</td>
                      <td class="px-3 py-2 text-sm text-center whitespace-nowrap">{{ getMonthStats(row.month).yoy }}</td>
                      <td class="px-3 py-2 text-center">
                        <button class="text-emerald-600 hover:text-emerald-700 text-sm" @click="toggleMonthExpand(row.month)">{{ expandedMonths.includes(row.month) ? '收起' : '展开' }}</button>
                      </td>
                    </tr>
                    <tr v-if="expandedMonths.includes(row.month)" class="bg-gray-50">
                      <td colspan="9" class="p-3">
                        <table class="w-full text-xs border border-gray-200 rounded">
                          <thead class="bg-gray-100">
                            <tr>
                              <th class="px-3 py-2 text-left font-semibold">物料分类</th>
                              <th class="px-3 py-2 text-right font-semibold">数量</th>
                              <th class="px-3 py-2 text-right font-semibold">金额(元)</th>
                              <th class="px-3 py-2 text-center font-semibold">占比</th>
                            </tr>
                          </thead>
                          <tbody class="divide-y divide-gray-200 bg-white">
                            <tr v-for="d in getMonthDetails(row.month)" :key="d.categoryName">
                              <td class="px-3 py-2 text-gray-700">{{ d.categoryName }}</td>
                              <td class="px-3 py-2 text-right text-gray-700">{{ formatNumber(d.quantity) }}</td>
                              <td class="px-3 py-2 text-right text-emerald-600 font-medium">¥{{ formatNumber(d.amount) }}</td>
                              <td class="px-3 py-2 text-center text-gray-700">{{ getCategoryStats(d.quantity, row.totalQuantity) }}</td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </template>
                </tbody>
              </table>
            </div>
            <div class="px-4 py-3 border-t border-gray-100 text-sm text-gray-500">
              共 {{ filteredMonthData.length }} 条
            </div>
          </div>
        </div>

        <!-- ========== 分类汇总 Tab（物料汇总表 - 21 列对齐 V1.1） ========== -->
        <div v-show="statActiveTab === 'material'" class="p-4 space-y-4">
          <!-- 物料筛选（3 字段，保留 V2.0 现有简化版） -->
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="flex items-end gap-4 flex-wrap">
              <div>
                <label class="block text-xs text-gray-500 mb-1">物料搜索</label>
                <input v-model="statMaterialSearch" placeholder="编码/名称" class="px-3 py-2 border border-gray-300 rounded-lg text-sm w-[180px] focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">领料部门</label>
                <select v-model="statDepartmentFilter" multiple class="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white w-[150px]">
                  <option v-for="d in departments" :key="d" :value="d">{{ d }}</option>
                </select>
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">物料分类</label>
                <select v-model="statCategoryFilter" multiple class="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white w-[160px]">
                  <option v-for="c in statCategoryOptions" :key="c" :value="c">{{ c }}</option>
                </select>
              </div>
              <button class="h-8 px-3 rounded-md text-xs font-medium bg-amber-500 text-white hover:bg-amber-600 inline-flex items-center gap-1" @click="statMaterialSearch = ''; statDepartmentFilter = []; statCategoryFilter = []"><RotateCcw class="w-4 h-4" />重置</button>
              <div class="ml-auto">
                <button v-if="!statExportMode" class="h-8 px-3 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 inline-flex items-center gap-1" @click="statExportMode = true">
                  <Download class="w-4 h-4" />导出
                </button>
                <button v-if="statExportMode && statSelectedRows.length > 0" class="h-8 px-3 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 inline-flex items-center gap-1" @click="handleStatExportConfirm">确认导出 ({{ statSelectedRows.length }}条)</button>
                <button v-if="statExportMode" class="h-8 px-3 rounded-md text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 inline-flex items-center gap-1" @click="statExportMode = false; statSelectedRows = []">取消</button>
              </div>
            </div>
          </div>

          <!-- 物料汇总表 21 列 + 操作列"查看明细" -->
          <div class="border border-gray-200 rounded-xl overflow-hidden bg-white">
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  <tr>
                    <th v-if="statExportMode" class="px-3 py-3 text-left text-sm font-semibold w-12">
                      <input type="checkbox" :checked="filteredMaterialStatData.length > 0 && statSelectedRows.length === filteredMaterialStatData.length" @change="handleMaterialStatSelectAll" class="w-4 h-4 rounded border-white" />
                    </th>
                    <th class="px-3 py-3 text-left text-sm font-semibold whitespace-nowrap">物料编号</th>
                    <th class="px-3 py-3 text-left text-sm font-semibold whitespace-nowrap">物料名称</th>
                    <th class="px-3 py-3 text-left text-sm font-semibold whitespace-nowrap">分类</th>
                    <th class="px-3 py-3 text-left text-sm font-semibold whitespace-nowrap">规格型号</th>
                    <th class="px-3 py-3 text-left text-sm font-semibold whitespace-nowrap">条形码</th>
                    <th class="px-3 py-3 text-center text-sm font-semibold whitespace-nowrap">单位</th>
                    <th class="px-3 py-3 text-left text-sm font-semibold whitespace-nowrap">供应商</th>
                    <th class="px-3 py-3 text-left text-sm font-semibold whitespace-nowrap">批次号</th>
                    <th class="px-3 py-3 text-left text-sm font-semibold whitespace-nowrap">生产日期</th>
                    <th class="px-3 py-3 text-left text-sm font-semibold whitespace-nowrap">有效期至</th>
                    <th class="px-3 py-3 text-left text-sm font-semibold whitespace-nowrap">生产计划批次</th>
                    <th class="px-3 py-3 text-left text-sm font-semibold whitespace-nowrap">领料部门</th>
                    <th class="px-3 py-3 text-left text-sm font-semibold whitespace-nowrap">用途/区域</th>
                    <th class="px-3 py-3 text-left text-sm font-semibold whitespace-nowrap">领料人</th>
                    <th class="px-3 py-3 text-left text-sm font-semibold whitespace-nowrap">领料时间</th>
                    <th class="px-3 py-3 text-right text-sm font-semibold whitespace-nowrap">领料次数</th>
                    <th class="px-3 py-3 text-right text-sm font-semibold whitespace-nowrap">总数量</th>
                    <th class="px-3 py-3 text-right text-sm font-semibold whitespace-nowrap">实际数量</th>
                    <th class="px-3 py-3 text-right text-sm font-semibold whitespace-nowrap">总金额(元)</th>
                    <th class="px-3 py-3 text-left text-sm font-semibold whitespace-nowrap">主要仓库</th>
                    <th v-if="!statExportMode" class="px-3 py-3 text-center text-sm font-semibold whitespace-nowrap">操作</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-300">
                  <tr v-if="paginatedMaterialStatData.length === 0">
                    <td :colspan="statExportMode ? 21 : 22" class="px-4 py-8 text-center text-gray-500">
                      <span v-if="isLoadingStat">加载中…</span>
                      <span v-else>暂无数据</span>
                    </td>
                  </tr>
                  <tr v-for="(row, idx) in paginatedMaterialStatData" :key="(row.materialCode || '') + '-' + (row.batchCode || '') + '-' + idx" class="hover:bg-blue-50 transition-colors">
                    <td v-if="statExportMode" class="px-3 py-2">
                      <input type="checkbox" :checked="statSelectedRows.includes((statCurrentPage - 1) * 10 + idx)" @change="toggleStatRow((statCurrentPage - 1) * 10 + idx)" class="w-4 h-4 rounded border-gray-400" />
                    </td>
                    <td class="px-3 py-2 text-sm font-mono text-blue-600 whitespace-nowrap">{{ row.materialCode || '-' }}</td>
                    <td class="px-3 py-2 text-sm font-medium text-gray-900 whitespace-nowrap">{{ row.materialName || '-' }}</td>
                    <td class="px-3 py-2 text-sm text-gray-700 whitespace-nowrap">{{ row.category || '-' }}</td>
                    <td class="px-3 py-2 text-sm text-gray-700 whitespace-nowrap">{{ row.spec || '-' }}</td>
                    <td class="px-3 py-2 text-sm font-mono text-gray-500 whitespace-nowrap">{{ row.barcode || '-' }}</td>
                    <td class="px-3 py-2 text-sm text-center text-gray-700 whitespace-nowrap">{{ row.unit || '-' }}</td>
                    <td class="px-3 py-2 text-sm text-gray-700 whitespace-nowrap">{{ row.supplier || '-' }}</td>
                    <td class="px-3 py-2 text-sm font-mono text-gray-500 whitespace-nowrap">{{ row.batchCode || '-' }}</td>
                    <td class="px-3 py-2 text-sm text-gray-700 whitespace-nowrap">{{ row.productionDate || '-' }}</td>
                    <td class="px-3 py-2 text-sm text-gray-700 whitespace-nowrap">{{ row.expiryDate || '-' }}</td>
                    <td class="px-3 py-2 text-sm font-mono text-cyan-600 whitespace-nowrap">{{ row.productionPlanBatchCode || '-' }}</td>
                    <td class="px-3 py-2 text-sm text-gray-700 whitespace-nowrap">{{ row.requisitionDepartment || '-' }}</td>
                    <td class="px-3 py-2 text-sm text-gray-700 whitespace-nowrap">{{ row.usageArea || '-' }}</td>
                    <td class="px-3 py-2 text-sm text-gray-700 whitespace-nowrap">{{ row.requisitioner || '-' }}</td>
                    <td class="px-3 py-2 text-sm text-gray-700 whitespace-nowrap">{{ row.requisitionTime || '-' }}</td>
                    <td class="px-3 py-2 text-sm text-right font-medium text-blue-600 whitespace-nowrap">{{ row.requisitionCount || 0 }}</td>
                    <td class="px-3 py-2 text-sm text-right font-medium text-gray-900 whitespace-nowrap">{{ formatNumber(row.totalQuantity) }}</td>
                    <td class="px-3 py-2 text-sm text-right font-medium text-gray-900 whitespace-nowrap">{{ formatNumber(row.actualQuantity) }}</td>
                    <td class="px-3 py-2 text-sm text-right font-bold text-emerald-600 whitespace-nowrap">¥{{ formatNumber(row.totalAmount) }}</td>
                    <td class="px-3 py-2 text-sm text-gray-700 whitespace-nowrap">{{ row.mainWarehouse || '-' }}</td>
                    <td v-if="!statExportMode" class="px-3 py-2 text-center whitespace-nowrap">
                      <button class="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 p-1 inline-flex items-center gap-1 text-sm" @click="handleStatViewDetail(row)" title="查看明细">
                        <Eye class="w-4 h-4" />查看明细
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
              <span>共 {{ filteredMaterialStatData.length }} 条</span>
              <Pagination
                :current-page="statCurrentPage"
                :total-pages="Math.ceil(filteredMaterialStatData.length / statPageSize) || 1"
                :page-size="statPageSize"
                :page-size-options="[10, 20, 50]"
                :show-page-size="true"
                @page-change="(p) => statCurrentPage = p"
                @page-size-change="(s) => { statPageSize = s; statCurrentPage = 1 }"
              />
            </div>
          </div>
        </div>

      </div>

      <!-- 统计专用导出格式弹窗 -->
      <ExportTypeModal
        :show="statShowExportTypeModal"
        :export-file-type="statExportFileType"
        @change="(v) => statExportFileType = v"
        @confirm="confirmMaterialStatExport"
        @close="statShowExportTypeModal = false"
      />

      <!-- 物料统计明细弹窗 -->
      <StatDetailModal
        :is-open="statShowDetailModal"
        :record="statSelectedRecord"
        @close="statShowDetailModal = false"
      />
    </div>

    <!-- Tab 4: 成本核算 - 严格 1:1 对齐 V1.1 CostTab.tsx -->
    <div v-show="activeTab === 'cost'" class="space-y-4">
      <!-- 子 Tab 切换 (V1.1 CostTabSwitcher) -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100">
        <div class="border-b border-gray-200">
          <div class="flex gap-1">
            <button v-for="ct in costSubTabs" :key="ct.key" @click="costActiveTab = ct.key"
              class="relative flex items-center gap-2 px-4 py-3 text-sm font-bold transition-colors"
              :class="costActiveTab === ct.key ? 'text-emerald-600' : 'text-gray-500 hover:text-gray-700'"
            >
              <component :is="ct.icon" class="w-4 h-4" />
              {{ ct.label }}
              <span v-if="costActiveTab === ct.key" class="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500"></span>
            </button>
          </div>
        </div>
      </div>

      <!-- 筛选表单 (V1.1 CostFiltersForm)：时间快捷+日期+部门下拉+分类下拉+重置 -->
      <div class="bg-white/50 rounded-xl p-4 border border-gray-100">
        <div class="flex items-center gap-3 flex-wrap">
          <div class="flex items-center gap-2">
            <Calendar class="w-4 h-4 text-gray-500" />
            <span class="text-sm text-gray-600">时间：</span>
          </div>
          <div class="flex gap-1">
            <button v-for="p in costQuickPeriods" :key="p.value"
              class="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
              :class="costFilters.quickPeriod === p.value ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
              @click="onCostQuickPeriod(p.value)"
            >{{ p.label }}</button>
          </div>
          <div class="flex items-center gap-2">
            <input type="date" v-model="costFilters.dateRange.start" @change="costFilters.quickPeriod = 'custom'" class="px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500" />
            <span class="text-gray-400">至</span>
            <input type="date" v-model="costFilters.dateRange.end" @change="costFilters.quickPeriod = 'custom'" class="px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500" />
          </div>
          <select v-model="costSelectedDept" @change="onCostDeptChange" class="px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-emerald-500">
            <option value="all">部门：全部</option>
            <option v-for="d in COST_DEPARTMENTS" :key="d" :value="d">{{ d }}</option>
          </select>
          <select v-model="costSelectedCategory" @change="onCostCategoryChange" class="px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-cyan-500">
            <option value="all">分类：全部</option>
            <option v-for="c in COST_CATEGORIES" :key="c" :value="c">{{ c }}</option>
          </select>
          <button class="ml-auto h-8 px-3 rounded-md text-xs font-medium bg-gray-400 text-white hover:bg-gray-500 inline-flex items-center gap-1" @click="resetCostFilters">
            <X class="w-4 h-4" />重置
          </button>
        </div>
      </div>

      <!-- ============ 子 Tab：成本概览 ============ -->
      <div v-if="costActiveTab === 'overview'" class="space-y-4">
        <!-- KPI 4 卡 (V1.1 CostKPICards) -->
        <div class="grid grid-cols-4 gap-3">
          <div class="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-lg p-3 border border-emerald-200/50">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center"><span class="text-sm font-bold text-white">¥</span></div>
              <div>
                <div class="text-xs text-emerald-600/70">累计总成本</div>
                <div class="text-xl font-bold text-emerald-700">¥{{ formatNumber(costKPI.totalCost) }}</div>
              </div>
            </div>
          </div>
          <div class="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg p-3 border border-blue-200/50">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center"><Calendar class="w-4 h-4 text-white" /></div>
              <div>
                <div class="text-xs text-blue-600/70">本月成本</div>
                <div class="text-xl font-bold text-blue-700">¥{{ formatNumber(costKPI.monthlyCost) }}</div>
              </div>
            </div>
          </div>
          <div class="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-lg p-3 border border-amber-200/50">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center"><BarChart2 class="w-4 h-4 text-white" /></div>
              <div>
                <div class="text-xs text-amber-600/70">平均批次成本</div>
                <div class="text-xl font-bold text-amber-700">¥{{ formatNumber(Math.round(costKPI.avgBatchCost)) }}</div>
              </div>
            </div>
          </div>
          <div :class="['rounded-lg p-3 border', costKPI.costDiffRate < 0 ? 'bg-gradient-to-br from-green-50 to-green-100/50 border-green-200/50' : 'bg-gradient-to-br from-red-50 to-red-100/50 border-red-200/50']">
            <div class="flex items-center gap-2">
              <div :class="['w-8 h-8 rounded-lg flex items-center justify-center', costKPI.costDiffRate < 0 ? 'bg-green-500' : 'bg-red-500']">
                <TrendingDown :class="['w-4 h-4 text-white', costKPI.costDiffRate >= 0 ? 'transform rotate-180' : '']" />
              </div>
              <div>
                <div :class="['text-xs', costKPI.costDiffRate < 0 ? 'text-green-600/70' : 'text-red-600/70']">成本差异率</div>
                <div :class="['text-xl font-bold', costKPI.costDiffRate < 0 ? 'text-green-700' : 'text-red-700']">{{ costKPI.costDiffRate > 0 ? '+' : '' }}{{ costKPI.costDiffRate.toFixed(1) }}%</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 双图：饼图(1/3) + 趋势图(2/3) -->
        <div class="grid grid-cols-3 gap-4">
          <!-- 饼图：成本构成（按分类） -->
          <div class="col-span-1 bg-white/50 rounded-xl p-4 border border-gray-100">
            <h5 class="font-semibold text-gray-700 mb-4 text-center">成本构成（按分类）</h5>
            <div class="space-y-2">
              <div v-for="cat in costCategoryAgg" :key="cat.category" class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full shrink-0" :style="{ backgroundColor: getCategoryColor(cat.category) }"></span>
                <span class="text-xs text-gray-700 flex-1 truncate">{{ cat.category }}</span>
                <span class="text-xs font-medium text-gray-900 w-12 text-right">{{ cat.percentage.toFixed(1) }}%</span>
                <span class="text-xs text-emerald-600 font-medium w-20 text-right">¥{{ formatNumber(cat.totalAmount) }}</span>
              </div>
              <div class="pt-2 mt-2 border-t border-gray-200 flex items-center justify-between">
                <span class="text-xs text-gray-600 font-bold">总成本</span>
                <span class="text-sm text-emerald-700 font-bold">¥{{ formatNumber(costKPI.totalCost) }}</span>
              </div>
            </div>
          </div>
          <!-- 趋势图：12 月柱状图(CSS) -->
          <div class="col-span-2 bg-white/50 rounded-xl p-4 border border-gray-100">
            <div class="flex items-center justify-between mb-4">
              <h5 class="font-semibold text-gray-700">成本趋势（{{ costMonthlyAgg.length }} 个月）</h5>
            </div>
            <div class="space-y-1.5">
              <div v-for="m in costMonthlyAgg" :key="m.month" class="flex items-center gap-2">
                <span class="text-xs text-gray-500 w-16 shrink-0">{{ m.month.replace('2025-', '').replace('2026-', '') }}月</span>
                <div class="flex-1 h-5 bg-gray-100 rounded overflow-hidden">
                  <div class="h-full bg-emerald-500" :style="{ width: ((m.totalAmount || 0) / costMaxMonth * 100) + '%' }"></div>
                </div>
                <span class="text-xs text-gray-700 w-24 text-right shrink-0">¥{{ formatNumber(m.totalAmount) }}</span>
              </div>
              <div v-if="costMonthlyAgg.length === 0" class="text-center text-gray-500 text-sm py-8">暂无数据</div>
            </div>
          </div>
        </div>
      </div>

      <!-- ============ 子 Tab：分类对比 ============ -->
      <div v-if="costActiveTab === 'comparison'" class="space-y-4">
        <!-- 维度切换：按物料分类 / 按部门 / 按批次 -->
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-600">对比维度：</span>
          <div class="flex gap-1">
            <button class="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
              :class="costDimension === 'category' ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
              @click="costDimension = 'category'; costExpandedBatch = []"
            >按物料分类</button>
            <button class="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
              :class="costDimension === 'department' ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
              @click="costDimension = 'department'; costExpandedBatch = []"
            >按部门</button>
            <button class="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
              :class="costDimension === 'batch' ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
              @click="costDimension = 'batch'; costExpandedBatch = []"
            >按批次</button>
          </div>
        </div>

        <!-- 按物料分类表 -->
        <div v-if="costDimension === 'category'" class="bg-white/50 rounded-xl border border-gray-100 overflow-hidden">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">物料分类</th>
                <th class="px-4 py-3 text-center text-sm font-semibold text-gray-700">领料次数</th>
                <th class="px-4 py-3 text-center text-sm font-semibold text-gray-700">总数量</th>
                <th class="px-4 py-3 text-right text-sm font-semibold text-gray-700">总金额</th>
                <th class="px-4 py-3 text-center text-sm font-semibold text-gray-700">占比</th>
                <th class="px-4 py-3 text-center text-sm font-semibold text-gray-700">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-if="costCategoryAgg.length === 0"><td colspan="6" class="px-4 py-8 text-center text-gray-500">暂无数据</td></tr>
              <tr v-for="row in costCategoryAgg" :key="row.category" class="hover:bg-gray-50">
                <td class="px-4 py-3 text-sm font-medium text-gray-900">{{ row.category }}</td>
                <td class="px-4 py-3 text-sm text-center text-gray-600">{{ row.requisitionCount }}</td>
                <td class="px-4 py-3 text-sm text-center text-gray-600">{{ formatNumber(row.totalQuantity) }}</td>
                <td class="px-4 py-3 text-sm text-right font-semibold text-emerald-600">¥{{ formatNumber(row.totalAmount) }}</td>
                <td class="px-4 py-3 text-sm text-center text-gray-600">{{ row.percentage.toFixed(1) }}%</td>
                <td class="px-4 py-3 text-center">
                  <button class="text-emerald-600 hover:text-emerald-700 text-sm inline-flex items-center gap-1" @click="onViewCostDetail('category', row.category)">
                    <Eye class="w-4 h-4" /> 查看明细
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 按部门表 -->
        <div v-if="costDimension === 'department'" class="bg-white/50 rounded-xl border border-gray-100 overflow-hidden">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">部门</th>
                <th class="px-4 py-3 text-center text-sm font-semibold text-gray-700">领料次数</th>
                <th class="px-4 py-3 text-center text-sm font-semibold text-gray-700">物料种类</th>
                <th class="px-4 py-3 text-right text-sm font-semibold text-gray-700">总金额</th>
                <th class="px-4 py-3 text-center text-sm font-semibold text-gray-700">占比</th>
                <th class="px-4 py-3 text-center text-sm font-semibold text-gray-700">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-if="costDepartmentAgg.length === 0"><td colspan="6" class="px-4 py-8 text-center text-gray-500">暂无数据</td></tr>
              <tr v-for="row in costDepartmentAgg" :key="row.department" class="hover:bg-gray-50">
                <td class="px-4 py-3 text-sm font-medium text-gray-900">{{ row.department }}</td>
                <td class="px-4 py-3 text-sm text-center text-gray-600">{{ row.requisitionCount }}</td>
                <td class="px-4 py-3 text-sm text-center text-gray-600">{{ row.materialTypes }}</td>
                <td class="px-4 py-3 text-sm text-right font-semibold text-emerald-600">¥{{ formatNumber(row.totalAmount) }}</td>
                <td class="px-4 py-3 text-sm text-center text-gray-600">{{ row.percentage.toFixed(1) }}%</td>
                <td class="px-4 py-3 text-center">
                  <button class="text-emerald-600 hover:text-emerald-700 text-sm inline-flex items-center gap-1" @click="onViewCostDetail('department', row.department)">
                    <Eye class="w-4 h-4" /> 查看明细
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 按批次表（含展开行） -->
        <div v-if="costDimension === 'batch'" class="bg-white/50 rounded-xl border border-gray-100 overflow-hidden">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700 w-10"></th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">批次号</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">作物</th>
                <th class="px-4 py-3 text-center text-sm font-semibold text-gray-700">领料次数</th>
                <th class="px-4 py-3 text-center text-sm font-semibold text-gray-700">物料种类</th>
                <th class="px-4 py-3 text-right text-sm font-semibold text-gray-700">总成本</th>
                <th class="px-4 py-3 text-right text-sm font-semibold text-gray-700">单位成本</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-if="costBatchAgg.length === 0"><td colspan="7" class="px-4 py-8 text-center text-gray-500">暂无数据</td></tr>
              <template v-for="row in costBatchAgg" :key="row.batchCode">
                <tr class="hover:bg-gray-50">
                  <td class="px-4 py-3">
                    <button class="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-emerald-600" @click="toggleCostBatchExpand(row.batchCode)">
                      <ChevronDown v-if="costExpandedBatch.includes(row.batchCode)" class="w-4 h-4" />
                      <ChevronRight v-else class="w-4 h-4" />
                    </button>
                  </td>
                  <td class="px-4 py-3 text-sm font-mono text-emerald-600">{{ row.batchCode }}</td>
                  <td class="px-4 py-3 text-sm text-gray-900">{{ row.cropName }}</td>
                  <td class="px-4 py-3 text-sm text-center text-gray-600">{{ row.requisitionCount }}</td>
                  <td class="px-4 py-3 text-sm text-center text-gray-600">{{ row.materialTypes }}种</td>
                  <td class="px-4 py-3 text-sm text-right font-semibold text-emerald-600">¥{{ formatNumber(row.totalAmount) }}</td>
                  <td class="px-4 py-3 text-sm text-right text-amber-600">¥{{ row.unitCost.toFixed(2) }}/m²</td>
                </tr>
                <tr v-if="costExpandedBatch.includes(row.batchCode)">
                  <td colspan="7" class="px-4 py-3 bg-gray-50">
                    <div class="text-xs text-gray-500 mb-2">该批次物料领用明细：</div>
                    <div class="grid grid-cols-4 gap-2">
                      <div v-for="mat in (costBatchMaterialDetails[row.batchCode] || [])" :key="mat.materialCode" class="bg-white rounded p-2 border border-gray-200">
                        <div class="text-xs text-gray-500">{{ mat.materialName }}</div>
                        <div class="text-sm font-medium text-emerald-600">¥{{ formatNumber(mat.totalAmount) }}</div>
                      </div>
                      <div v-if="!(costBatchMaterialDetails[row.batchCode]?.length)" class="col-span-4 text-sm text-gray-500">暂无物料明细</div>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 成本明细弹窗（V1.1 CostDetailModal） -->
      <ElModal :model-value="costDetailModalOpen" :title="costDetailTitle" :width="900" :height="650" @update:model-value="(v) => { if (!v) costDetailModalOpen = false }" @close="costDetailModalOpen = false">
        <div class="overflow-auto max-h-[60vh]">
          <table class="w-full">
            <thead class="bg-gray-50 sticky top-0">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">物料编码</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">物料名称</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">规格</th>
                <th class="px-4 py-3 text-center text-sm font-semibold text-gray-700">单位</th>
                <th class="px-4 py-3 text-right text-sm font-semibold text-gray-700">领料数量</th>
                <th class="px-4 py-3 text-right text-sm font-semibold text-gray-700">单价</th>
                <th class="px-4 py-3 text-right text-sm font-semibold text-gray-700">金额</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-if="costDetailData.length === 0"><td colspan="7" class="px-4 py-8 text-center text-gray-500">暂无数据</td></tr>
              <tr v-for="(item, idx) in costDetailData" :key="idx" class="hover:bg-gray-50">
                <td class="px-4 py-3 text-sm font-mono text-emerald-600">{{ item.code }}</td>
                <td class="px-4 py-3 text-sm font-medium text-gray-900">{{ item.name }}</td>
                <td class="px-4 py-3 text-sm text-gray-600">{{ item.spec }}</td>
                <td class="px-4 py-3 text-sm text-center text-gray-600">{{ item.unit }}</td>
                <td class="px-4 py-3 text-sm text-right text-gray-600">{{ formatNumber(item.quantity) }}</td>
                <td class="px-4 py-3 text-sm text-right text-gray-600">¥{{ item.unitPrice.toFixed(2) }}</td>
                <td class="px-4 py-3 text-sm text-right font-semibold text-emerald-600">¥{{ formatNumber(item.amount) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="px-6 py-4 border-t border-gray-100 bg-gray-50 mt-4">
          <div class="flex justify-end gap-8">
            <span class="text-sm text-gray-600">合计：</span>
            <span class="text-lg font-bold text-emerald-600">¥{{ formatNumber(costDetailData.reduce((s, i) => s + i.amount, 0)) }}</span>
          </div>
        </div>
        <template #footer>
          <el-button size="small" @click="costDetailModalOpen = false">关闭</el-button>
        </template>
      </ElModal>
    </div>

    <!-- ============ 申请领料 - 详情弹窗 ============ -->
    <ElModal :model-value="showDetailModal" title="领料单详情" :width="700" :height="600" @update:model-value="(v) => { if (!v) showDetailModal = false }" @close="showDetailModal = false">
      <div class="p-2">
        <div v-if="selectedRecord" class="grid grid-cols-3 gap-0 border border-gray-200 rounded-lg overflow-hidden mb-4">
          <template v-for="(item, idx) in [{l:'领料单号',v:selectedRecord.code},{l:'申请日期',v:selectedRecord.date},{l:'申请人',v:selectedRecord.applicant},{l:'部门',v:selectedRecord.department},{l:'库存地点',v:selectedRecord.warehouseLocation},{l:'物料种类',v:selectedRecord.materials?.length > 0 ? selectedRecord.materials.length + '种' : '-'},{l:'种植区域/用途',v:selectedRecord.plantArea},{l:'审核人',v:selectedRecord.reviewer},{l:'生产计划批次号',v:selectedRecord.productionBatchCode}]" :key="idx">
            <span class="w-32 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 shrink-0 border-r border-gray-200">{{ item.l }}</span>
            <span class="px-3 py-2 text-sm text-gray-900 flex-1">{{ item.v }}</span>
          </template>
          <div class="flex border-b border-gray-200"><span class="w-32 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 shrink-0 border-r border-gray-200">状态</span><span class="px-3 py-2 text-sm flex-1"><span class="inline-flex px-2 py-1 rounded-full text-xs font-medium" :class="getAppStatusClass(selectedRecord?.status || '')">{{ selectedRecord?.status }}</span><p v-if="selectedRecord?.status === '已拒绝' && selectedRecord?.rejectReason" class="text-xs text-red-600 mt-1">拒绝原因：{{ selectedRecord.rejectReason }}</p></span></div>
        </div>
        <div class="mt-4"><h4 class="font-medium mb-2 text-sm text-gray-700">物料明细</h4>
          <div class="overflow-x-auto rounded-lg border border-gray-200"><table class="w-full text-xs"><thead class="bg-[#F2F6FA]"><tr><th class="px-3 py-2 text-left text-sm font-semibold text-blue-800">物料编码</th><th class="px-3 py-2 text-left text-sm font-semibold text-blue-800">物料名称</th><th class="px-3 py-2 text-left text-sm font-semibold text-blue-800">规格</th><th class="px-3 py-2 text-left text-sm font-semibold text-blue-800">单位</th><th class="px-3 py-2 text-left text-sm font-semibold text-blue-800">申领数量</th><th class="px-3 py-2 text-left text-sm font-semibold text-blue-800">当前库存</th><th class="px-3 py-2 text-left text-sm font-semibold text-blue-800">单价(元)</th><th class="px-3 py-2 text-left text-sm font-semibold text-blue-800">小计(元)</th><th class="px-3 py-2 text-left text-sm font-semibold text-blue-800">仓库货位</th><th class="px-3 py-2 text-left text-sm font-semibold text-blue-800">备注</th></tr></thead><tbody class="divide-y divide-gray-200"><tr v-for="m in (selectedRecord?.materials || [])" :key="m.materialCode" class="hover:bg-emerald-100"><td class="px-3 py-2 text-sm text-blue-700 font-mono">{{ m.materialCode }}</td><td class="px-3 py-2 text-sm text-blue-700">{{ m.materialName }}</td><td class="px-3 py-2 text-sm text-blue-700">{{ m.spec }}</td><td class="px-3 py-2 text-sm text-blue-700">{{ m.unit }}</td><td class="px-3 py-2 text-sm" :class="m.requestedQuantity > m.stockQuantity ? 'text-red-600 font-bold' : 'text-blue-700'">{{ m.requestedQuantity }}{{ m.requestedQuantity > m.stockQuantity ? ' (!)' : '' }}</td><td class="px-3 py-2 text-sm text-blue-700">{{ m.stockQuantity }}</td><td class="px-3 py-2 text-sm text-blue-700">{{ (m.unitPrice || 0).toFixed(2) }}</td><td class="px-3 py-2 text-sm text-blue-700">{{ (m.requestedQuantity * (m.unitPrice || 0)).toFixed(2) }}</td><td class="px-3 py-2 text-sm text-blue-700">{{ m.warehousePosition }}</td><td class="px-3 py-2 text-sm text-blue-700">{{ m.remark || '-' }}</td></tr></tbody></table></div>
        </div>
      </div>
      <template #footer>
        <el-button size="small" @click="showDetailModal = false">关闭</el-button>
      </template>
    </ElModal>

    <!-- ============ 新增弹窗 ============ -->
    <ElModal :model-value="showAddModal" title="新增领料单" :width="900" :height="650" @update:model-value="(v) => { if (!v) { showAddModal = false; resetAddForm() } }" @close="showAddModal = false; resetAddForm()">
      <div class="p-2">
        <div class="grid grid-cols-3 gap-4 mb-4">
          <div><label class="block text-sm text-gray-700 mb-1">领料单号</label><div class="flex gap-2"><input v-model="addForm.code" readonly placeholder="点击生成获取单号" class="flex-1 px-3 py-2 border border-gray-400 rounded-lg text-sm bg-gray-50" /><button class="h-10 px-4 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 inline-flex items-center gap-1" @click="handleGenerateAddCode" title="生成领料单号">生成</button></div></div>
          <div><label class="block text-sm text-gray-700 mb-1">申请日期</label><input v-model="addForm.date" type="date" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm" /></div>
          <div><label class="block text-sm text-gray-700 mb-1">操作员</label><input :value="currentOperatorName" readonly class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm bg-gray-50" /></div>
        </div>
        <div class="grid grid-cols-3 gap-4 mb-4">
          <div><label class="block text-sm text-gray-700 mb-1">申请人</label><select v-model="addForm.applicant" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm bg-white"><option value="">请选择</option><option v-for="u in userList" :key="u.id" :value="u.name">{{ u.name }}</option></select></div>
          <div><label class="block text-sm text-gray-700 mb-1">部门</label><select v-model="addForm.department" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm bg-white"><option value="">请选择</option><option v-for="d in departments" :key="d" :value="d">{{ d }}</option></select></div>
          <div><label class="block text-sm text-gray-700 mb-1">库存地点</label><select v-model="addForm.warehouseLocation" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm bg-white"><option value="">请选择</option><option v-for="w in warehouses" :key="w" :value="w">{{ w }}</option></select></div>
        </div>
        <div class="grid grid-cols-3 gap-4 mb-4">
          <div><label class="block text-sm text-gray-700 mb-1">种植区域/用途</label><input v-model="addForm.plantArea" placeholder="如：1号棚-叶菜区" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm" /></div>
          <div><label class="block text-sm text-gray-700 mb-1">审核人</label><select v-model="addForm.reviewer" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm bg-white"><option value="">请选择</option><option v-for="u in userList" :key="u.id" :value="u.name">{{ u.name }}</option></select></div>
          <div><label class="block text-sm text-gray-700 mb-1">生产计划批次号</label><select v-model="addForm.productionBatchCode" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm bg-white" @change="onProductionBatchChange($event.target.value)"><option value="">请选择生产批次</option><option v-for="code in PRODUCTION_BATCH_CODES" :key="code" :value="code">{{ code }}</option><option value="其他">其他</option></select></div>
        </div>
        <div v-if="addForm.productionBatchCode === '其他'" class="grid grid-cols-3 gap-4 mb-4">
          <div class="col-span-2"><label class="block text-sm text-gray-700 mb-1">其他批次备注</label><input v-model="addForm.batchRemark" placeholder="请输入其他批次的具体说明" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm" /></div>
        </div>
        <div class="mb-2 flex gap-2"><button class="h-8 px-3 rounded-md text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 inline-flex items-center gap-1" @click="handleAddMaterial"><Plus class="w-4 h-4" />添加物料</button></div>
        <div v-if="addForm.materials.length > 0" class="overflow-x-auto rounded-lg border border-gray-200"><table class="text-xs" style="min-width:1400px"><thead class="bg-[#F2F6FA]"><tr><th class="px-2 py-2 text-left text-sm font-semibold text-blue-800">物料编码</th><th class="px-2 py-2 text-left text-sm font-semibold text-blue-800">物料名称</th><th class="px-2 py-2 text-left text-sm font-semibold text-blue-800">规格</th><th class="px-2 py-2 text-left text-sm font-semibold text-blue-800">单位</th><th class="px-2 py-2 text-left text-sm font-semibold text-blue-800">申领数量</th><th class="px-2 py-2 text-left text-sm font-semibold text-blue-800">当前库存</th><th class="px-2 py-2 text-left text-sm font-semibold text-blue-800">单价(元)</th><th class="px-2 py-2 text-left text-sm font-semibold text-blue-800">小计(元)</th><th class="px-2 py-2 text-left text-sm font-semibold text-blue-800">仓库货位</th><th class="px-2 py-2 text-left text-sm font-semibold text-blue-800">备注</th><th class="px-2 py-2 text-left text-sm font-semibold text-blue-800">操作</th></tr></thead><tbody class="divide-y divide-gray-200"><tr v-for="(m, $index) in addForm.materials" :key="$index"><td class="px-1 py-1"><input v-model="m.materialCode" class="w-24 h-6 px-1 border border-gray-200 rounded text-xs" @change="onAddMaterialCodeChange(m)" /></td><td class="px-1 py-1"><input v-model="m.materialName" class="w-24 h-6 px-1 border border-gray-200 rounded text-xs" @change="onAddMaterialNameChange(m)" /></td><td class="px-1 py-1"><input v-model="m.spec" class="w-16 h-6 px-1 border border-gray-200 rounded text-xs" /></td><td class="px-1 py-1"><input v-model="m.unit" class="w-14 h-6 px-1 border border-gray-200 rounded text-xs" /></td><td class="px-1 py-1"><input v-model.number="m.requestedQuantity" type="number" min="1" class="w-20 h-6 px-1 border border-gray-200 rounded text-xs" /></td><td class="px-1 py-1"><input v-model.number="m.stockQuantity" type="number" min="0" class="w-20 h-6 px-1 border border-gray-200 rounded text-xs" /></td><td class="px-1 py-1"><input v-model.number="m.unitPrice" type="number" min="0" step="0.01" class="w-20 h-6 px-1 border border-gray-200 rounded text-xs" /></td><td class="px-1 py-1"><span class="text-xs text-blue-700">{{ (m.requestedQuantity * (m.unitPrice || 0)).toFixed(2) }}</span></td><td class="px-1 py-1"><input v-model="m.warehousePosition" class="w-24 h-6 px-1 border border-gray-200 rounded text-xs" /></td><td class="px-1 py-1"><input v-model="m.remark" class="w-20 h-6 px-1 border border-gray-200 rounded text-xs" /></td><td class="px-1 py-1"><button class="text-red-600 hover:text-red-800 text-xs" @click="addForm.materials.splice($index, 1)">删除</button></td></tr></tbody></table></div>
        <div v-else class="text-center py-8 text-gray-500 text-sm">暂无物料，请点击"添加物料"添加</div>
      </div>
      <template #footer>
        <el-button size="small" @click="showAddModal = false; resetAddForm()">取消</el-button>
        <el-button type="primary" size="small" @click="handleSaveAdd">保存</el-button>
      </template>
    </ElModal>

    <!-- ============ 编辑弹窗 ============ -->
    <ElModal :model-value="showEditModal" title="编辑领料单" :width="900" :height="650" @update:model-value="(v) => { if (!v) showEditModal = false }" @close="showEditModal = false">
      <div class="p-2">
        <div class="mb-4 p-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-900">领料单号：{{ selectedRecord?.code }}</div>
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div><label class="block text-sm text-gray-700 mb-1">申请日期</label><input v-model="editForm.date" type="date" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm" /></div>
          <div><label class="block text-sm text-gray-700 mb-1">申请人</label><select v-model="editForm.applicant" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm bg-white"><option v-for="u in userList" :key="u.id" :value="u.name">{{ u.name }}</option></select></div>
        </div>
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div><label class="block text-sm text-gray-700 mb-1">部门</label><select v-model="editForm.department" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm bg-white"><option v-for="d in departments" :key="d" :value="d">{{ d }}</option></select></div>
          <div><label class="block text-sm text-gray-700 mb-1">库存地点</label><select v-model="editForm.warehouseLocation" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm bg-white"><option v-for="w in warehouses" :key="w" :value="w">{{ w }}</option></select></div>
        </div>
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div><label class="block text-sm text-gray-700 mb-1">种植区域/用途</label><input v-model="editForm.plantArea" placeholder="如：1号棚-叶菜区" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm" /></div>
          <div><label class="block text-sm text-gray-700 mb-1">审核人</label><select v-model="editForm.reviewer" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm bg-white"><option v-for="u in userList" :key="u.id" :value="u.name">{{ u.name }}</option></select></div>
        </div>
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div><label class="block text-sm text-gray-700 mb-1">生产计划批次号</label><input v-model="editForm.productionBatchCode" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm" /></div>
          <div><label class="block text-sm text-gray-700 mb-1">状态</label><select v-model="editForm.status" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm bg-white"><option v-for="s in ['待审批','已审批','已拒绝','已作废','已取消']" :key="s" :value="s">{{ s }}</option></select></div>
        </div>
        <div class="mb-2"><button class="h-8 px-3 rounded-md text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 inline-flex items-center gap-1" @click="handleEditAddMaterial"><Plus class="w-4 h-4" />添加物料</button></div>
        <div v-if="editForm.materials.length > 0" class="overflow-x-auto rounded-lg border border-gray-200"><table class="text-xs" style="min-width:1400px"><thead class="bg-[#F2F6FA]"><tr><th class="px-2 py-2 text-left text-sm font-semibold text-blue-800">物料编码</th><th class="px-2 py-2 text-left text-sm font-semibold text-blue-800">物料名称</th><th class="px-2 py-2 text-left text-sm font-semibold text-blue-800">规格</th><th class="px-2 py-2 text-left text-sm font-semibold text-blue-800">单位</th><th class="px-2 py-2 text-left text-sm font-semibold text-blue-800">申领数量</th><th class="px-2 py-2 text-left text-sm font-semibold text-blue-800">当前库存</th><th class="px-2 py-2 text-left text-sm font-semibold text-blue-800">单价(元)</th><th class="px-2 py-2 text-left text-sm font-semibold text-blue-800">小计(元)</th><th class="px-2 py-2 text-left text-sm font-semibold text-blue-800">仓库货位</th><th class="px-2 py-2 text-left text-sm font-semibold text-blue-800">备注</th><th class="px-2 py-2 text-left text-sm font-semibold text-blue-800">操作</th></tr></thead><tbody class="divide-y divide-gray-200"><tr v-for="(m, $index) in editForm.materials" :key="$index"><td class="px-1 py-1"><input v-model="m.materialCode" class="w-24 h-6 px-1 border border-gray-200 rounded text-xs" @change="onEditMaterialCodeChangeRow(m)" /></td><td class="px-1 py-1"><input v-model="m.materialName" class="w-24 h-6 px-1 border border-gray-200 rounded text-xs" /></td><td class="px-1 py-1"><input v-model="m.spec" class="w-16 h-6 px-1 border border-gray-200 rounded text-xs" /></td><td class="px-1 py-1"><input v-model="m.unit" class="w-14 h-6 px-1 border border-gray-200 rounded text-xs" /></td><td class="px-1 py-1"><input v-model.number="m.requestedQuantity" type="number" min="1" class="w-20 h-6 px-1 border border-gray-200 rounded text-xs" /></td><td class="px-1 py-1"><input v-model.number="m.stockQuantity" type="number" min="0" class="w-20 h-6 px-1 border border-gray-200 rounded text-xs" /></td><td class="px-1 py-1"><input v-model.number="m.unitPrice" type="number" min="0" step="0.01" class="w-20 h-6 px-1 border border-gray-200 rounded text-xs" /></td><td class="px-1 py-1"><span class="text-xs text-blue-700">{{ (m.requestedQuantity * (m.unitPrice || 0)).toFixed(2) }}</span></td><td class="px-1 py-1"><input v-model="m.warehousePosition" class="w-24 h-6 px-1 border border-gray-200 rounded text-xs" /></td><td class="px-1 py-1"><input v-model="m.remark" class="w-20 h-6 px-1 border border-gray-200 rounded text-xs" /></td><td class="px-1 py-1"><button class="text-red-600 hover:text-red-800 text-xs" @click="editForm.materials.splice($index, 1)">删除</button></td></tr></tbody></table></div>
        <div v-else class="text-center py-8 text-gray-500 text-sm">暂无物料</div>
      </div>
      <template #footer>
        <el-button size="small" @click="showEditModal = false">取消</el-button>
        <el-button type="primary" size="small" @click="handleSaveEdit">保存</el-button>
      </template>
    </ElModal>

    <!-- ============ 删除确认弹窗 ============ -->
    <DeleteWarningModal
      v-model:is-open="showDeleteConfirm"
      :selected-count="1"
      title="删除领料单警告"
      :description="`确定要删除该领料单吗？<br>此操作 <strong class='text-red-600'>无法恢复</strong>，删除后数据将永久丢失。`"
      @close="showDeleteConfirm = false"
      @confirm="confirmDelete"
    />

    <!-- ============ 作废弹窗 ============ -->
    <ElModal :model-value="showVoidModal" title="作废申请" :width="560" :height="450" @update:model-value="(v) => { if (!v) showVoidModal = false }" @close="showVoidModal = false">
      <div class="p-2">
        <div class="mb-4"><label class="block text-sm text-gray-700 mb-1">领料单号</label><span class="text-gray-700">{{ selectedRecord?.code }}</span></div>
        <div class="mb-4"><label class="block text-sm text-gray-700 mb-1">作废原因 <span class="text-red-500">*</span></label><textarea v-model="voidReason" :rows="3" placeholder="请填写作废原因" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm resize-none"></textarea></div>
      </div>
      <template #footer>
        <el-button size="small" @click="showVoidModal = false">取消</el-button>
        <el-button type="danger" size="small" @click="submitVoid">确认作废</el-button>
      </template>
    </ElModal>

    <!-- ============ 批量编辑弹窗 ============ -->
    <ElModal :model-value="showBatchEditModal" title="批量编辑领料单" :width="900" :height="650" @update:model-value="(v) => { if (!v) showBatchEditModal = false }" @close="showBatchEditModal = false">
      <div class="p-2">
        <p class="text-sm text-blue-600 mb-4">已选择 <strong>{{ selectedRows.length }}</strong> 条领料单，修改以下字段将应用到所有选中记录</p>
        <div class="grid grid-cols-2 gap-4">
          <div><label class="block text-sm text-gray-700 mb-1">库存地点</label><select v-model="batchEditForm.warehouseLocation" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm bg-white"><option value="">不修改</option><option v-for="w in warehouses" :key="w" :value="w">{{ w }}</option></select></div>
          <div><label class="block text-sm text-gray-700 mb-1">审核人</label><input v-model="batchEditForm.reviewer" placeholder="不修改" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm" /></div>
          <div><label class="block text-sm text-gray-700 mb-1">生产批次号</label><select v-model="batchEditForm.productionBatchCode" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm bg-white"><option value="">不修改</option><option v-for="b in PRODUCTION_BATCH_CODES" :key="b" :value="b">{{ b }}</option></select></div>
          <div><label class="block text-sm text-gray-700 mb-1">状态</label><select v-model="batchEditForm.status" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm bg-white"><option value="">不修改</option><option value="待审批">待审批</option><option value="已审批">已审批</option><option value="已作废">已作废</option></select></div>
        </div>
      </div>
      <template #footer>
        <el-button size="small" @click="showBatchEditModal = false">取消</el-button>
        <el-button type="primary" size="small" @click="handleBatchEditSave">保存 ({{ selectedRows.length }}条)</el-button>
      </template>
    </ElModal>

    <!-- ============ 批量删除确认弹窗 ============ -->
    <DeleteWarningModal
      v-model:is-open="showBatchDeleteConfirm"
      :selected-count="selectedRows.length"
      title="批量删除领料单"
      :description="`确定要删除选中的 <strong>${selectedRows.length}</strong> 条领料单吗？<br>此操作 <strong class='text-red-600'>无法恢复</strong>，删除后数据将永久丢失。`"
      @close="showBatchDeleteConfirm = false"
      @confirm="handleBatchDelete"
    />

    <!-- ============ 导出格式弹窗 ============ -->
    <ExportFormatModal
      v-model:visible="showExportTypeModal"
      :export-file-type="exportFileType"
      :selected-count="selectedRows.length"
      @update:export-file-type="(val) => exportFileType = val"
      @confirm="confirmExport"
    />

    <!-- ============ 出库 - 详情弹窗 ============ -->
    <ElModal :model-value="exShowDetailModal" title="出库单详情" :width="700" :height="600" @update:model-value="(v) => { if (!v) exShowDetailModal = false }" @close="exShowDetailModal = false">
      <div class="p-2">
        <div class="grid grid-cols-3 gap-0 border border-gray-200 rounded-lg overflow-hidden mb-4">
          <template v-for="(item, idx) in [{l:'出库单号',v:exSelectedRecord?.code},{l:'申请日期',v:exSelectedRecord?.date},{l:'申请人',v:exSelectedRecord?.applicant},{l:'库存地点',v:exSelectedRecord?.warehouseLocation},{l:'审核人',v:exSelectedRecord?.reviewer},{l:'操作人',v:exSelectedRecord?.operator},{l:'生产计划批次号',v:exSelectedRecord?.productionBatchCode},{l:'来源申请单',v:(exSelectedRecord?.sourceApplicationCodes || []).join(', ')}]" :key="idx"><span class="w-28 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 shrink-0 border-r border-gray-200">{{ item.l }}</span><span class="px-3 py-2 text-sm text-gray-900 flex-1">{{ item.v }}</span></template>
          <div class="flex border-b border-gray-200"><span class="w-28 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 shrink-0 border-r border-gray-200">执行状态</span><span class="px-3 py-2 text-sm flex-1"><span class="inline-flex px-2 py-1 rounded-full text-xs font-medium" :class="getExStatusClass(exSelectedRecord?.executeStatus || '')">{{ exSelectedRecord?.executeStatus }}</span></span></div>
        </div>
        <div class="mt-4"><h4 class="font-medium mb-2 text-sm text-gray-700">出库物料明细</h4>
          <div class="overflow-x-auto rounded-lg border border-gray-200"><table class="w-full text-xs"><thead class="bg-[#F2F6FA]"><tr><th class="px-3 py-2 text-left text-sm font-semibold text-blue-800">来源领料单号</th><th class="px-3 py-2 text-left text-sm font-semibold text-blue-800">物料编码</th><th class="px-3 py-2 text-left text-sm font-semibold text-blue-800">物料名称</th><th class="px-3 py-2 text-left text-sm font-semibold text-blue-800">批次号</th><th class="px-3 py-2 text-left text-sm font-semibold text-blue-800">规格</th><th class="px-3 py-2 text-left text-sm font-semibold text-blue-800">单位</th><th class="px-3 py-2 text-left text-sm font-semibold text-blue-800">申请数量</th><th class="px-3 py-2 text-left text-sm font-semibold text-blue-800">实际库存</th><th class="px-3 py-2 text-left text-sm font-semibold text-blue-800">本次实发</th><th class="px-3 py-2 text-left text-sm font-semibold text-blue-800">单价(元)</th><th class="px-3 py-2 text-left text-sm font-semibold text-blue-800">小计(元)</th><th class="px-3 py-2 text-left text-sm font-semibold text-blue-800">仓库货位</th><th class="px-3 py-2 text-left text-sm font-semibold text-blue-800">差异</th><th class="px-3 py-2 text-left text-sm font-semibold text-blue-800">备注</th></tr></thead><tbody class="divide-y divide-gray-200"><tr v-for="m in (exSelectedRecord?.materials || [])" :key="m.materialCode" class="hover:bg-emerald-100"><td class="px-3 py-2 text-sm text-blue-700 font-mono">{{ m.applicationCode }}</td><td class="px-3 py-2 text-sm text-blue-700 font-mono">{{ m.materialCode }}</td><td class="px-3 py-2 text-sm text-blue-700">{{ m.materialName }}</td><td class="px-3 py-2 text-sm text-blue-700 font-mono">{{ m.batchNo || '-' }}</td><td class="px-3 py-2 text-sm text-blue-700">{{ m.spec }}</td><td class="px-3 py-2 text-sm text-blue-700">{{ m.unit }}</td><td class="px-3 py-2 text-sm text-blue-700">{{ m.requestedQuantity }}</td><td class="px-3 py-2 text-sm text-blue-700"><span :class="m.stockQuantity < m.requestedQuantity ? 'text-red-600 font-medium' : 'text-green-600'">{{ m.stockQuantity }}</span></td><td class="px-3 py-2 text-sm text-blue-700"><span v-if="m.actualQuantity > 0" :class="m.actualQuantity < m.requestedQuantity ? 'text-amber-600 font-medium' : 'text-green-600'">{{ m.actualQuantity }}</span><span v-else :class="m.stockQuantity === 0 ? 'text-red-600 font-medium' : 'text-gray-400'">{{ m.actualQuantity }}</span></td><td class="px-3 py-2 text-sm text-blue-700">{{ (m.unitPrice || 0).toFixed(2) }}</td><td class="px-3 py-2 text-sm text-blue-700">{{ ((m.requestedQuantity || 0) * (m.unitPrice || 0)).toFixed(2) }}</td><td class="px-3 py-2 text-sm text-blue-700">{{ m.warehousePosition || '-' }}</td><td class="px-3 py-2 text-sm"><span v-if="(m.requestedQuantity || 0) - (m.actualQuantity || 0) > 0" class="text-red-600 font-medium">-{{ (m.requestedQuantity || 0) - (m.actualQuantity || 0) }}</span><span v-else class="text-green-600">0</span></td><td class="px-3 py-2 text-sm text-blue-700">{{ m.remark || '-' }}</td></tr></tbody></table></div>
        </div>
      </div>
      <template #footer>
        <el-button size="small" @click="exShowDetailModal = false">关闭</el-button>
      </template>
    </ElModal>

    <!-- ============ 出库 - 新增弹窗 ============ -->
    <ElModal :model-value="exShowAddModal" title="新增出库单" :width="900" :height="650" @update:model-value="(v) => { if (!v) { exShowAddModal = false; resetExAddForm() } }" @close="exShowAddModal = false; resetExAddForm()">
      <div class="p-2">
        <div class="grid grid-cols-3 gap-4 mb-4">
          <div><label class="block text-sm text-gray-700 mb-1">出库单号</label><input v-model="exAddForm.code" readonly class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm bg-gray-50" /></div>
          <div><label class="block text-sm text-gray-700 mb-1">日期</label><input v-model="exAddForm.date" type="date" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm" /></div>
          <div><label class="block text-sm text-gray-700 mb-1">操作员</label><select v-model="exAddForm.operator" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm bg-white"><option v-for="u in userList" :key="u.id" :value="u.name">{{ u.name }}</option></select></div>
        </div>
        <div class="grid grid-cols-3 gap-4 mb-4">
          <div><label class="block text-sm text-gray-700 mb-1">仓库地点</label><select v-model="exAddForm.warehouseLocation" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm bg-white"><option v-for="w in warehouses" :key="w" :value="w">{{ w }}</option></select></div>
          <div><label class="block text-sm text-gray-700 mb-1">审核人</label><select v-model="exAddForm.reviewer" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm bg-white"><option v-for="u in userList" :key="u.id" :value="u.name">{{ u.name }}</option></select></div>
          <div><label class="block text-sm text-gray-700 mb-1">生产批次号</label><input v-model="exAddForm.productionBatchCode" placeholder="如：FQ2024-001" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm" /></div>
        </div>
        <div class="mb-3 border-t border-gray-200 pt-3"><h4 class="font-medium text-sm text-gray-700 mb-2">物料池</h4>
          <div class="grid grid-cols-2 gap-4 mb-3">
            <div><label class="block text-sm text-gray-700 mb-1">来源领料单</label><select v-model="exSelectedAppCode" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm bg-white" @change="onExAppCodeChange($event.target.value)"><option value="">选择申请单</option><option v-for="app in applicationData" :key="app.code" :value="app.code">{{ app.code }} - {{ app.applicant }}</option></select></div>
          </div>
          <div v-if="exSelectedAppCode && exSelectedAppMaterials.length > 0" class="mb-3 p-3 bg-gray-50 rounded-lg">
            <div class="flex gap-2 mb-2">
              <button class="h-8 px-3 rounded-md text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 inline-flex items-center gap-1" @click="handleAddToPool">添加到物料池</button>
              <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" v-model="exSelectAllMaterials" @change="onExSelectAll($event.target.checked)" class="w-4 h-4 rounded border-gray-400 text-blue-600" /><span class="text-sm">全选</span></label>
            </div>
            <table class="w-full text-xs border border-gray-200"><thead class="bg-gray-100"><tr><th class="px-2 py-2 text-left font-semibold"><input type="checkbox" class="w-4 h-4 rounded border-gray-400" /></th><th class="px-2 py-2 text-left font-semibold">物料编码</th><th class="px-2 py-2 text-left font-semibold">物料名称</th><th class="px-2 py-2 text-left font-semibold">规格</th><th class="px-2 py-2 text-left font-semibold">单位</th><th class="px-2 py-2 text-left font-semibold">申请数量</th><th class="px-2 py-2 text-left font-semibold">本次实发</th></tr></thead><tbody class="divide-y divide-gray-200"><tr v-for="(m, $index) in exSelectedAppMaterials" :key="m.materialCode" class="hover:bg-white"><td class="px-2 py-1"><input type="checkbox" :checked="exSelectedMaterialIndices.includes(m)" @change="toggleExMaterial(m)" class="w-4 h-4 rounded border-gray-400" /></td><td class="px-2 py-1 text-gray-600">{{ m.materialCode }}</td><td class="px-2 py-1 text-gray-600">{{ m.materialName }}</td><td class="px-2 py-1 text-gray-600">{{ m.spec }}</td><td class="px-2 py-1 text-gray-600">{{ m.unit }}</td><td class="px-2 py-1 text-gray-600">{{ m.requestedQuantity }}</td><td class="px-2 py-1"><input v-model.number="exMaterialQuantities[$index]" type="number" :min="0" :max="m.requestedQuantity" class="w-20 h-6 px-1 border border-gray-200 rounded text-xs" /></td></tr></tbody></table>
          </div>
          <div><label class="block text-sm text-gray-700 mb-1">物料池明细</label>
            <table v-if="exMaterialPool.length > 0" class="w-full text-xs border border-gray-200"><thead class="bg-gray-100"><tr><th class="px-2 py-2 text-left font-semibold">来源单号</th><th class="px-2 py-2 text-left font-semibold">物料编码</th><th class="px-2 py-2 text-left font-semibold">物料名称</th><th class="px-2 py-2 text-left font-semibold">规格</th><th class="px-2 py-2 text-left font-semibold">单位</th><th class="px-2 py-2 text-left font-semibold">申请数量</th><th class="px-2 py-2 text-left font-semibold">本次实发</th><th class="px-2 py-2 text-left font-semibold">操作</th></tr></thead><tbody class="divide-y divide-gray-200"><tr v-for="(m, $index) in exMaterialPool" :key="$index"><td class="px-2 py-1 text-gray-600">{{ m.applicationCode }}</td><td class="px-2 py-1 text-gray-600">{{ m.materialCode }}</td><td class="px-2 py-1 text-gray-600">{{ m.materialName }}</td><td class="px-2 py-1 text-gray-600">{{ m.spec }}</td><td class="px-2 py-1 text-gray-600">{{ m.unit }}</td><td class="px-2 py-1 text-gray-600">{{ m.requestedQuantity }}</td><td class="px-2 py-1 text-gray-600">{{ m.actualQuantity }}</td><td class="px-2 py-1"><button class="text-red-600 hover:text-red-800 text-xs" @click="exMaterialPool.splice($index, 1)">移除</button></td></tr></tbody></table>
            <div v-else class="text-center py-4 text-sm text-gray-500">物料池为空</div>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button size="small" @click="exShowAddModal = false; resetExAddForm()">取消</el-button>
        <el-button type="primary" size="small" @click="handleExSaveAdd">保存</el-button>
      </template>
    </ElModal>

    <!-- ============ 出库 - 编辑弹窗 ============ -->
    <ElModal :model-value="exShowEditModal" title="编辑出库单" :width="900" :height="650" @update:model-value="(v) => { if (!v) exShowEditModal = false }" @close="exShowEditModal = false">
      <div class="p-2">
        <div class="grid grid-cols-3 gap-4 mb-4">
          <div><label class="block text-sm text-gray-700 mb-1">出库单号</label><input :value="exSelectedRecord?.code" readonly class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm bg-gray-50" /></div>
          <div><label class="block text-sm text-gray-700 mb-1">日期</label><input v-model="exEditForm.date" type="date" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm" /></div>
          <div><label class="block text-sm text-gray-700 mb-1">申领人</label><input v-model="exEditForm.applicant" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm" /></div>
        </div>
        <div class="grid grid-cols-3 gap-4 mb-4">
          <div><label class="block text-sm text-gray-700 mb-1">仓库地点</label><select v-model="exEditForm.warehouseLocation" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm bg-white"><option v-for="w in warehouses" :key="w" :value="w">{{ w }}</option></select></div>
          <div><label class="block text-sm text-gray-700 mb-1">生产批次号</label><input v-model="exEditForm.productionBatchCode" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm" /></div>
          <div><label class="block text-sm text-gray-700 mb-1">操作员</label><select v-model="exEditForm.operator" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm bg-white"><option v-for="u in userList" :key="u.id" :value="u.name">{{ u.name }}</option></select></div>
        </div>
        <div class="grid grid-cols-3 gap-4 mb-4">
          <div><label class="block text-sm text-gray-700 mb-1">审核人</label><select v-model="exEditForm.reviewer" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm bg-white"><option v-for="u in userList" :key="u.id" :value="u.name">{{ u.name }}</option></select></div>
          <div><label class="block text-sm text-gray-700 mb-1">执行状态</label><select v-model="exEditForm.executeStatus" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm bg-white"><option v-for="s in ['已出库','部分出库','待出库','已取消']" :key="s" :value="s">{{ s }}</option></select></div>
          <div></div>
        </div>
        <div class="mb-2"><button class="h-8 px-3 rounded-md text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 inline-flex items-center gap-1" @click="exEditForm.materials.push({ materialCode:'', materialName:'', batchNo:'', spec:'', unit:'', category:'', requestedQuantity:0, stockQuantity:0, actualQuantity:0, unitPrice:0, warehousePosition:'', remark:'', applicationCode:'' })"><Plus class="w-4 h-4" />添加物料</button></div>
        <div class="overflow-x-auto rounded-lg border border-gray-200"><table class="text-xs" style="min-width:1500px"><thead class="bg-[#F2F6FA]"><tr><th class="px-2 py-2 text-left text-sm font-semibold text-blue-800">来源领料单号</th><th class="px-2 py-2 text-left text-sm font-semibold text-blue-800">物料编码</th><th class="px-2 py-2 text-left text-sm font-semibold text-blue-800">物料名称</th><th class="px-2 py-2 text-left text-sm font-semibold text-blue-800">批次号</th><th class="px-2 py-2 text-left text-sm font-semibold text-blue-800">规格</th><th class="px-2 py-2 text-left text-sm font-semibold text-blue-800">单位</th><th class="px-2 py-2 text-left text-sm font-semibold text-blue-800">申请数量</th><th class="px-2 py-2 text-left text-sm font-semibold text-blue-800">实际库存</th><th class="px-2 py-2 text-left text-sm font-semibold text-blue-800">本次实发</th><th class="px-2 py-2 text-left text-sm font-semibold text-blue-800">单价(元)</th><th class="px-2 py-2 text-left text-sm font-semibold text-blue-800">小计(元)</th><th class="px-2 py-2 text-left text-sm font-semibold text-blue-800">仓库货位</th><th class="px-2 py-2 text-left text-sm font-semibold text-blue-800">备注</th><th class="px-2 py-2 text-left text-sm font-semibold text-blue-800">操作</th></tr></thead><tbody class="divide-y divide-gray-200"><tr v-for="(row, $index) in exEditForm.materials" :key="$index"><td class="px-1 py-1"><input v-model="row.applicationCode" readonly class="w-24 h-6 px-1 border border-gray-200 rounded text-xs bg-gray-50 font-mono" /></td><td class="px-1 py-1"><input v-model="row.materialCode" class="w-24 h-6 px-1 border border-gray-200 rounded text-xs" /></td><td class="px-1 py-1"><input v-model="row.materialName" class="w-24 h-6 px-1 border border-gray-200 rounded text-xs" /></td><td class="px-1 py-1"><input v-model="row.batchNo" class="w-24 h-6 px-1 border border-gray-200 rounded text-xs font-mono" /></td><td class="px-1 py-1"><input v-model="row.spec" class="w-16 h-6 px-1 border border-gray-200 rounded text-xs" /></td><td class="px-1 py-1"><input v-model="row.unit" class="w-14 h-6 px-1 border border-gray-200 rounded text-xs" /></td><td class="px-1 py-1"><input v-model.number="row.requestedQuantity" type="number" min="0" class="w-20 h-6 px-1 border border-gray-200 rounded text-xs" /></td><td class="px-1 py-1"><input v-model.number="row.stockQuantity" type="number" min="0" class="w-20 h-6 px-1 border border-gray-200 rounded text-xs" /></td><td class="px-1 py-1"><input v-model.number="row.actualQuantity" type="number" min="0" class="w-20 h-6 px-1 border border-gray-200 rounded text-xs" /></td><td class="px-1 py-1"><input v-model.number="row.unitPrice" type="number" min="0" step="0.01" class="w-20 h-6 px-1 border border-gray-200 rounded text-xs" /></td><td class="px-1 py-1"><span class="text-xs text-blue-700">{{ ((row.requestedQuantity || 0) * (row.unitPrice || 0)).toFixed(2) }}</span></td><td class="px-1 py-1"><input v-model="row.warehousePosition" class="w-24 h-6 px-1 border border-gray-200 rounded text-xs" /></td><td class="px-1 py-1"><input v-model="row.remark" class="w-20 h-6 px-1 border border-gray-200 rounded text-xs" /></td><td class="px-1 py-1"><button class="text-red-600 hover:text-red-800 text-xs" @click="exEditForm.materials.splice($index, 1)">删除</button></td></tr></tbody></table></div>
      </div>
      <template #footer>
        <el-button size="small" @click="exShowEditModal = false">取消</el-button>
        <el-button type="primary" size="small" @click="handleExSaveEdit">保存</el-button>
      </template>
    </ElModal>

    <!-- ============ 出库 - 删除确认弹窗 ============ -->
    <DeleteWarningModal
      v-model:is-open="exShowDeleteConfirm"
      :selected-count="1"
      title="删除出库单警告"
      :description="`确定要删除该出库单吗？<br>此操作 <strong class='text-red-600'>无法恢复</strong>，删除后数据将永久丢失。`"
      @close="exShowDeleteConfirm = false"
      @confirm="confirmExDelete"
    />

    <!-- ============ 出库导出弹窗 ============ -->
    <ExportFormatModal
      v-model:visible="exShowExportTypeModal"
      :export-file-type="exExportFileType"
      :selected-count="exSelectedRows.length"
      @update:export-file-type="(val) => exExportFileType = val"
      @confirm="confirmExExport"
    />

    <!-- ============ 出库 - 批量编辑弹窗 ============ -->
    <ElModal :model-value="exShowBatchEditModal" title="批量编辑出库单" :width="900" :height="650" @update:model-value="(v) => { if (!v) exShowBatchEditModal = false }" @close="exShowBatchEditModal = false">
      <div class="p-2">
        <p class="text-sm text-blue-600 mb-4">已选择 <strong>{{ exSelectedRows.length }}</strong> 条出库单，修改以下字段将应用到所有选中记录</p>
        <div class="grid grid-cols-2 gap-4">
          <div><label class="block text-sm text-gray-700 mb-1">仓库地点</label><select v-model="exBatchEditForm.warehouseLocation" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm bg-white"><option value="">不修改</option><option v-for="w in warehouses" :key="w" :value="w">{{ w }}</option></select></div>
          <div><label class="block text-sm text-gray-700 mb-1">审核人</label><input v-model="exBatchEditForm.reviewer" placeholder="不修改" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm" /></div>
          <div><label class="block text-sm text-gray-700 mb-1">生产批次号</label><select v-model="exBatchEditForm.productionBatchCode" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm bg-white"><option value="">不修改</option><option v-for="b in PRODUCTION_BATCH_CODES" :key="b" :value="b">{{ b }}</option></select></div>
          <div><label class="block text-sm text-gray-700 mb-1">执行状态</label><select v-model="exBatchEditForm.executeStatus" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm bg-white"><option value="">不修改</option><option value="已出库">已出库</option><option value="部分出库">部分出库</option><option value="待出库">待出库</option><option value="已取消">已取消</option></select></div>
        </div>
      </div>
      <template #footer>
        <el-button size="small" @click="exShowBatchEditModal = false">取消</el-button>
        <el-button type="primary" size="small" @click="handleExBatchEditSave">保存 ({{ exSelectedRows.length }}条)</el-button>
      </template>
    </ElModal>

    <!-- ============ 出库 - 批量删除确认弹窗 ============ -->
    <DeleteWarningModal
      v-model:is-open="exShowBatchDeleteConfirm"
      :selected-count="exSelectedRows.length"
      title="批量删除出库单"
      :description="`确定要删除选中的 <strong>${exSelectedRows.length}</strong> 条出库单吗？<br>此操作 <strong class='text-red-600'>无法恢复</strong>，删除后数据将永久丢失。`"
      @close="exShowBatchDeleteConfirm = false"
      @confirm="handleExBatchDelete"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Plus, Pencil, Trash2, Download, AlertTriangle, ChevronRight, ChevronDown, RefreshCw, Package, Search, Eye, RotateCcw, Calendar, BarChart2, ClipboardList, TrendingDown, TrendingUp, BarChart3, FileX, Users, Home as HomeIcon, X } from 'lucide-vue-next'
import { ElMessage } from 'element-plus'
import MaterialReceivingHeader from '@/components/materialReceiving/MaterialReceivingHeader.vue'
import Pagination from '@/components/ui/Pagination/Pagination.vue'
import { ElModal } from '@/components/ui'
import ExportTypeModal from '@/components/materialReceiving/modals/ExportTypeModal.vue'
import StatDetailModal from '@/components/materialReceiving/modals/StatDetailModal.vue'
import { getApplicationList, createApplication as apiCreateApp, updateApplication as apiUpdateApp, deleteApplication as apiDeleteApp, deleteApplicationsBatch, getExecuteList, createExecute as apiCreateExe, updateExecute as apiUpdateExe, deleteExecute as apiDeleteExe } from '@/api/material/apiMaterialRequestService'
import { getMaterialStatistics } from '@/api/material/apiMaterialStatisticsService'
import { btnDefault, btnSecondary, btnDestructive, btnBlue, btnWarning } from '@/views/production/constants/buttonStyles'
// 领料统计-部门/区域 Mock 数据（V1.1 1:1 对齐）
import {
  departmentStatisticsData,
  greenhouseStatisticsData,
  fieldStatisticsData,
  batchStatisticsData,
  STAT_DEPARTMENT_OPTIONS,
  GREENHOUSE_TYPE_OPTIONS,
  GREENHOUSE_OPTIONS,
  FIELD_OPTIONS,
  BATCH_FILTER_OPTIONS,
  COMPARISON_PERIOD_OPTIONS
} from '@/data/materialReceivingStatData'
// 成本核算计算函数（V1.1 1:1 对齐）
import {
  filterCostRecords,
  calcCostTotal,
  calcMonthlyCost,
  aggregateByCategory,
  aggregateByDepartment,
  aggregateByBatch,
  aggregateByMonth,
  getFilteredMaterialDetails,
  getBatchMaterialDetails,
  COST_CATEGORIES,
  COST_DEPARTMENTS
} from '@/data/costData'
import { materialReceivingDetails } from '@/data/materialReceivingMockData'

// V1.1 仅 7 个物料分类 key（白名单，防止混入领料单字段）
const CATEGORY_KEY_WHITELIST = ['生产投入', '设施装备', '作业支持', '采后流通', '数字管理', '能源耗材', '其他']

// ==================== 通用数据 ====================
const activeTab = ref('application')
const onTabChange = (tab) => { activeTab.value = tab }

const departments = ['生产部', '技术部', '设备部', '后勤部', '采后处理部']
const warehouses = ['仓库A区', '仓库B区', '仓库C区', '仓库D区', '仓库E区']
const PRODUCTION_BATCH_CODES = ['FQ2024-001', 'FQ2024-002', 'FQ2024-003', 'FQ2024-004', 'FQ2024-005', 'FQ2024-006', 'FQ2024-007', 'FQ2024-008']
const userList = ref([
  { id: '1', name: '张伟民' }, { id: '2', name: '李明轩' }, { id: '3', name: '王建国' },
  { id: '4', name: '赵俊杰' }, { id: '5', name: '钱文涛' }, { id: '6', name: '孙晓峰' },
  { id: '7', name: '周志强' }, { id: '8', name: '吴海龙' }, { id: '9', name: '郑志远' },
  { id: '10', name: '陈思远' }, { id: '11', name: '刘志伟' }, { id: '12', name: '杨文博' },
  { id: '13', name: '王志刚' }, { id: '14', name: '李志刚' }, { id: '15', name: '张志远' },
  { id: '16', name: '陈志明' }, { id: '17', name: '赵志鹏' }, { id: '18', name: '张志明' },
  { id: '19', name: '李志远' }, { id: '20', name: '赵文静' }, { id: '21', name: '刘志刚' },
  { id: '22', name: '王秀英' }, { id: '23', name: '郑志明' }, { id: '24', name: '周志刚' }
])

const exportFormats = [
  { value: 'xlsx', label: 'Excel (.xlsx)', desc: '适用于数据分析和处理' },
  { value: 'csv', label: 'CSV (.csv)', desc: '适用于数据交换' },
  { value: 'doc', label: 'Word (.doc)', desc: '适用于文档编辑和分享' }
]

const materialBaseDB = [
  { materialCode: 'SP0201001', materialName: '商品有机肥', spec: '50kg/袋', unit: '袋', category: '肥料与土壤改良剂', stockQuantity: 150, unitPrice: 45, warehousePosition: 'A-01-01', remark: '正常出库' },
  { materialCode: 'SP0202001', materialName: '尿素', spec: '50kg/袋', unit: '袋', category: '肥料与土壤改良剂', stockQuantity: 80, unitPrice: 85, warehousePosition: 'A-01-02', remark: '库存充足' },
  { materialCode: 'SP0301001', materialName: '吡虫啉', spec: '100g/瓶', unit: '瓶', category: '农药与植保产品', stockQuantity: 120, unitPrice: 28, warehousePosition: 'B-02-03', remark: '正常出库' },
  { materialCode: 'SP0302001', materialName: '多菌灵', spec: '200g/袋', unit: '袋', category: '农药与植保产品', stockQuantity: 45, unitPrice: 35, warehousePosition: 'C-03-01', remark: '待审批' },
  { materialCode: 'SP0103001', materialName: '番茄种子', spec: '50g/袋', unit: '袋', category: '种质资源', stockQuantity: 60, unitPrice: 120, warehousePosition: 'A-02-01', remark: '正常出库' },
  { materialCode: 'SP0101001', materialName: '水稻种子', spec: '20kg/袋', unit: '袋', category: '种质资源', stockQuantity: 100, unitPrice: 65, warehousePosition: 'B-02-01', remark: '正常出库' },
  { materialCode: 'OP0201001', materialName: '锄头', spec: '标准型', unit: '把', category: '劳保与防护用品', stockQuantity: 35, unitPrice: 42, warehousePosition: 'C-04-01', remark: '正常出库' },
  { materialCode: 'OP0102001', materialName: '劳保胶靴', spec: '标准码', unit: '双', category: '劳保与防护用品', stockQuantity: 50, unitPrice: 68, warehousePosition: 'C-04-02', remark: '正常出库' },
  { materialCode: 'EQ0103001', materialName: '电动喷雾机', spec: '标准型', unit: '台', category: '农业机械', stockQuantity: 15, unitPrice: 580, warehousePosition: 'A-05-01', remark: '正常出库' },
  { materialCode: 'EQ0306001', materialName: '滴灌带', spec: '50m/卷', unit: '卷', category: '农业机械', stockQuantity: 200, unitPrice: 38, warehousePosition: 'C-05-01', remark: '待审批' },
  { materialCode: 'PH0104001', materialName: '塑料袋', spec: '标准型', unit: '卷', category: '采收容器', stockQuantity: 500, unitPrice: 8.5, warehousePosition: 'A-03-01', remark: '正常出库' },
  { materialCode: 'IT0101001', materialName: '土壤温湿度传感器', spec: '标准型', unit: '个', category: '监测设备', stockQuantity: 30, unitPrice: 260, warehousePosition: 'A-04-01', remark: '正常出库' }
]

const findMaterialByCode = (code) => materialBaseDB.find(m => m.materialCode === code)

const currentOperatorName = computed(() => userList.value[0]?.name || '当前用户')
const onProductionBatchChange = (val) => { if (val !== '其他') { addForm.batchRemark = '' } }

// ==================== 展开行辅助 ====================
const appExpandedRows = ref([])
const exExpandedRowsId = ref([])
const expandedMonths = ref([])

const toggleAppExpandRow = (id) => {
  const idx = appExpandedRows.value.indexOf(id)
  if (idx > -1) appExpandedRows.value.splice(idx, 1)
  else appExpandedRows.value.push(id)
}

const toggleExExpandRow = (id) => {
  const idx = exExpandedRowsId.value.indexOf(id)
  if (idx > -1) exExpandedRowsId.value.splice(idx, 1)
  else exExpandedRowsId.value.push(id)
}

const toggleMonthExpand = (month) => {
  const idx = expandedMonths.value.indexOf(month)
  if (idx > -1) expandedMonths.value.splice(idx, 1)
  else expandedMonths.value.push(month)
}

// ==================== Tab 1: 申请领料 ====================
const mapAppStatus = (s) => {
  const m = { approved: '已审批', pending: '待审批', rejected: '已拒绝', voided: '已作废', cancelled: '已取消' }
  return m[s] || '待审批'
}
const mapAppStatusClass = (s) => {
  const m = { approved: 'approved', pending: 'pending', rejected: 'rejected', voided: 'voided', cancelled: 'cancelled' }
  return m[s] || 'pending'
}
// 状态徽章样式 - 严格对齐 V1.1 (ApplicationTab.tsx 第 414-421 行)
const STATUS_STYLE_MAP_APP = {
  'approved': 'bg-green-100 text-green-700',
  'pending': 'bg-amber-100 text-amber-700',
  'rejected': 'bg-red-100 text-red-700',
  'voided': 'bg-gray-200 text-gray-600',
  'cancelled': 'bg-gray-100 text-blue-700',
  'partial': 'bg-blue-100 text-blue-700'
}
// 执行状态徽章样式 - 严格对齐 V1.1 (ExecuteTab.tsx 第 399-404 行)
const STATUS_STYLE_MAP_EX = {
  '已出库': 'bg-green-100 text-green-700',
  '部分出库': 'bg-blue-100 text-blue-700',
  '待出库': 'bg-amber-100 text-amber-700',
  '已取消': 'bg-gray-100 text-gray-700'
}

const getAppStatusClass = (status) => {
  const cls = mapAppStatusClass(status)
  return STATUS_STYLE_MAP_APP[cls] || 'bg-gray-100 text-gray-700'
}

const getExStatusClass = (status) => STATUS_STYLE_MAP_EX[status] || 'bg-gray-100 text-gray-700'

// V1.1 后端 /api/material-requests 实际返回 camelCase 字段
// (curl http://localhost:3001/api/material-requests 验证：顶层 key 是 requestCode/applicantName/applyDate/...)
const mapAppRecord = (r) => ({
  id: r.id || r.requestCode || r.request_code,
  code: r.requestCode || r.request_code || r.code || '',
  date: r.applyDate || r.apply_date || r.date || '',
  applicant: r.applicantName || r.applicant_name || r.applicant || '',
  department: r.departmentName || r.department_name || r.department || '',
  warehouseLocation: r.warehouseName || r.warehouse_name || r.warehouseLocation || '',
  plantArea: r.plantArea || r.plant_area || '',
  reviewer: r.reviewer || r.approver_name || '',
  productionBatchCode: r.productionBatchCode || r.production_batch_code || '',
  status: mapAppStatus(r.approvalStatus || r.approval_status || r.status),
  statusClass: r.statusClass || mapAppStatusClass(r.approvalStatus || r.approval_status || r.status),
  rejectReason: r.rejectReason || r.reject_reason || r.remarks || '',
  materials: Array.isArray(r.materials) ? r.materials : (typeof r.materials === 'string' ? JSON.parse(r.materials || '[]') : [])
})

const applicationData = ref([])
const isLoadingApp = ref(false)
const loadApplicationData = async () => {
  isLoadingApp.value = true
  try {
    const res = await getApplicationList()
    applicationData.value = (res || []).map(mapAppRecord)
  } catch { }
  finally { isLoadingApp.value = false }
}

const searchCode = ref('')
const searchApplicant = ref('')
const searchBatchCode = ref('')
const searchWarehouse = ref('')
const statusFilter = ref('all')
const currentPage = ref(1)
const pageSize = ref(10)
const selectedRows = ref([])
const batchEditMode = ref(null)
const deleteMode = ref(false)
const exportMode = ref(false)
const showDetailModal = ref(false)
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteConfirm = ref(false)
const showVoidModal = ref(false)
const showBatchEditModal = ref(false)
const showBatchDeleteConfirm = ref(false)
const showExportTypeModal = ref(false)
const exportFileType = ref('xlsx')
const selectedRecord = ref(null)
const deletingId = ref(null)
const voidReason = ref('')

const filteredApplicationData = computed(() => {
  return applicationData.value.filter(item => {
    if (searchCode.value && !item.code.toLowerCase().includes(searchCode.value.toLowerCase())) return false
    if (searchApplicant.value && !item.applicant.toLowerCase().includes(searchApplicant.value.toLowerCase())) return false
    if (searchBatchCode.value && !item.productionBatchCode.toLowerCase().includes(searchBatchCode.value.toLowerCase())) return false
    if (searchWarehouse.value && !item.warehouseLocation.toLowerCase().includes(searchWarehouse.value.toLowerCase())) return false
    if (statusFilter.value !== 'all' && item.status !== statusFilter.value) return false
    return true
  })
})

const paginatedApplicationData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredApplicationData.value.slice(start, start + pageSize.value)
})

const totalPages = computed(() => Math.ceil(filteredApplicationData.value.length / pageSize.value) || 1)

const handleReset = () => {
  searchCode.value = ''; searchApplicant.value = ''; searchBatchCode.value = ''; searchWarehouse.value = ''; statusFilter.value = 'all'; currentPage.value = 1
}

const toggleAppSelectAll = () => {
  if (selectedRows.value.length === paginatedApplicationData.value.length) {
    const pageIds = new Set(paginatedApplicationData.value.map(r => r.id))
    selectedRows.value = selectedRows.value.filter(id => !pageIds.has(id))
  } else {
    const currentIds = new Set(selectedRows.value)
    const newRows = paginatedApplicationData.value.filter(r => !currentIds.has(r.id))
    selectedRows.value = [...selectedRows.value, ...newRows.map(r => r.id)]
  }
}

const toggleAppRow = (id) => {
  const idx = selectedRows.value.indexOf(id)
  if (idx > -1) selectedRows.value.splice(idx, 1)
  else selectedRows.value.push(id)
}

const handleViewDetail = (row) => { selectedRecord.value = row; showDetailModal.value = true }

const handleEditRecord = (row) => {
  if (row.status !== '待审批') {
    ElMessage.warning(`该领料单当前状态为「${row.status}」，非待审批状态无法编辑`)
    return
  }
  selectedRecord.value = row
  editForm.date = row.date
  editForm.applicant = row.applicant
  editForm.department = row.department
  editForm.warehouseLocation = row.warehouseLocation
  editForm.plantArea = row.plantArea
  editForm.reviewer = row.reviewer
  editForm.productionBatchCode = row.productionBatchCode
  editForm.status = row.status
  editForm.materials = JSON.parse(JSON.stringify(row.materials))
  showEditModal.value = true
}

const handleDeleteRecord = (id) => { deletingId.value = id; showDeleteConfirm.value = true }

// 作废申请：仅限"待审批"或"已审批"状态可作废
const handleVoidApply = (row) => {
  if (row.status !== '待审批' && row.status !== '已审批') {
    ElMessage.warning(`该领料单当前状态为「${row.status}」，无法作废`)
    return
  }
  selectedRecord.value = row
  voidReason.value = ''
  showVoidModal.value = true
}

const confirmDelete = async () => {
  if (deletingId.value !== null) {
    try {
      await apiDeleteApp(deletingId.value)
      ElMessage.success('删除成功')
      await loadApplicationData()
    } catch { ElMessage.error('删除失败') }
  }
  showDeleteConfirm.value = false; deletingId.value = null
}

const getDefaultAddForm = () => ({
  code: '', date: new Date().toISOString().split('T')[0], applicant: '', department: '', warehouseLocation: '', plantArea: '', reviewer: '', productionBatchCode: '', batchRemark: '', materials: []
})
const addForm = reactive(getDefaultAddForm())

const resetAddForm = () => { Object.assign(addForm, getDefaultAddForm()) }
const handleOpenAdd = () => { resetAddForm(); showAddModal.value = true }

const handleAddMaterial = () => {
  addForm.materials.push({ materialCode: '', materialName: '', batchNo: '', spec: '', unit: '', category: '', requestedQuantity: 1, stockQuantity: 0, unitPrice: 0, warehousePosition: '', remark: '' })
}

const handleGenerateAddCode = () => {
  const now = new Date()
  const dateStr = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`
  const seq = String(applicationData.value.length + 1).padStart(3, '0')
  addForm.code = `LL${dateStr}${seq}`
}

const onAddMaterialCodeChange = (row) => {
  if (!row || !row.materialCode) return
  const found = findMaterialByCode(row.materialCode)
  if (found) { row.materialName = found.materialName; row.spec = found.spec; row.unit = found.unit; row.category = found.category; row.stockQuantity = found.stockQuantity; row.unitPrice = found.unitPrice; row.warehousePosition = found.warehousePosition; row.remark = found.remark }
}

const onAddMaterialNameChange = (row) => {
  if (!row || !row.materialName) return
  const found = materialBaseDB.find(m => m.materialName === row.materialName)
  if (found) { row.materialCode = found.materialCode; row.spec = found.spec; row.unit = found.unit; row.category = found.category; row.stockQuantity = found.stockQuantity; row.unitPrice = found.unitPrice; row.warehousePosition = found.warehousePosition; row.remark = found.remark }
}

const onEditMaterialCodeChangeRow = (row) => {
  if (!row || !row.materialCode) return
  const found = findMaterialByCode(row.materialCode)
  if (found) { row.materialName = found.materialName; row.spec = found.spec; row.unit = found.unit; row.category = found.category; row.stockQuantity = found.stockQuantity; row.unitPrice = found.unitPrice; row.warehousePosition = found.warehousePosition }
}

const handleSaveAdd = async () => {
  if (!addForm.applicant) { ElMessage.warning('请选择申领人'); return }
  if (addForm.materials.length === 0) { ElMessage.warning('请添加至少一个物料'); return }
  if (!addForm.code) handleGenerateAddCode()
  const newRecord = {
    code: addForm.code, date: addForm.date, applicant: addForm.applicant, department: addForm.department,
    warehouseLocation: addForm.warehouseLocation, plantArea: addForm.plantArea, reviewer: addForm.reviewer,
    productionBatchCode: addForm.productionBatchCode, materials: JSON.parse(JSON.stringify(addForm.materials))
  }
  try {
    await apiCreateApp(newRecord)
    ElMessage.success('新增成功')
    showAddModal.value = false; resetAddForm()
    await loadApplicationData()
  } catch { ElMessage.error('新增失败，请重试') }
}

const editForm = reactive({ date: '', applicant: '', department: '', warehouseLocation: '', plantArea: '', reviewer: '', productionBatchCode: '', status: '', materials: [] })
const handleEditAddMaterial = () => {
  editForm.materials.push({ materialCode: '', materialName: '', batchNo: '', spec: '', unit: '', category: '', requestedQuantity: 1, stockQuantity: 0, unitPrice: 0, warehousePosition: '', remark: '' })
}

const handleSaveEdit = async () => {
  if (!selectedRecord.value) return
  const updates = {
    date: editForm.date, applicant: editForm.applicant, department: editForm.department,
    warehouseLocation: editForm.warehouseLocation, plantArea: editForm.plantArea,
    reviewer: editForm.reviewer, productionBatchCode: editForm.productionBatchCode,
    materials: JSON.parse(JSON.stringify(editForm.materials))
  }
  try {
    await apiUpdateApp(selectedRecord.value.id, updates)
    ElMessage.success('编辑已保存，领料单已重新提交')
    showEditModal.value = false; await loadApplicationData()
  } catch { ElMessage.error('保存失败，请重试') }
}

const batchEditForm = reactive({ warehouseLocation: '', reviewer: '', productionBatchCode: '', status: '' })
const handleBatchEditSave = async () => {
  if (selectedRows.value.length === 0) { ElMessage.warning('请先选择记录'); return }
  const updates = {}
  if (batchEditForm.warehouseLocation) updates.warehouseLocation = batchEditForm.warehouseLocation
  if (batchEditForm.reviewer) updates.reviewer = batchEditForm.reviewer
  if (batchEditForm.productionBatchCode) updates.productionBatchCode = batchEditForm.productionBatchCode
  if (batchEditForm.status) updates.status = batchEditForm.status
  if (Object.keys(updates).length === 0) { ElMessage.warning('请至少填写一个要修改的字段'); return }
  try {
    for (const id of selectedRows.value) { await apiUpdateApp(id, updates) }
    ElMessage.success(`批量编辑成功，已更新 ${selectedRows.value.length} 条记录`)
    showBatchEditModal.value = false; batchEditMode.value = null; selectedRows.value = []
    batchEditForm.warehouseLocation = ''; batchEditForm.reviewer = ''; batchEditForm.productionBatchCode = ''; batchEditForm.status = ''
    await loadApplicationData()
  } catch { ElMessage.error('批量编辑失败，请重试') }
}

const handleBatchDelete = async () => {
  try {
    await deleteApplicationsBatch(selectedRows.value)
    ElMessage.success(`删除了 ${selectedRows.value.length} 条记录`)
    showBatchDeleteConfirm.value = false; batchEditMode.value = null; selectedRows.value = []
    await loadApplicationData()
  } catch { ElMessage.error('批量删除失败') }
}

const submitVoid = () => {
  if (!voidReason.value.trim()) { ElMessage.warning('请填写作废原因'); return }
  if (!selectedRecord.value) return
  const rec = applicationData.value.find(r => r.id === selectedRecord.value.id)
  if (rec) { rec.status = '已作废'; rec.statusClass = 'voided' }
  ElMessage.success('作废成功')
  showVoidModal.value = false; showEditModal.value = false
}

const confirmExport = () => {
  const exportData = selectedRows.value.length > 0
    ? applicationData.value.filter(item => selectedRows.value.includes(item.id))
    : filteredApplicationData.value
  const headers = ['领料单号', '日期', '申领人', '部门', '仓库地点', '种植区域', '审核人', '生产批次号', '状态']
  const fields = ['code', 'date', 'applicant', 'department', 'warehouseLocation', 'plantArea', 'reviewer', 'productionBatchCode', 'status']
  let content; let mimeType; let extension;
  if (exportFileType.value === 'csv') {
    content = '﻿' + headers.join(',') + '\n' + exportData.map(r => fields.map(f => `"${r[f] || ''}"`).join(',')).join('\n')
    mimeType = 'text/csv;charset=utf-8'; extension = 'csv'
  } else if (exportFileType.value === 'xlsx') {
    content = `<html><head><meta charset="utf-8"></head><body><table border="1"><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>${exportData.map(r => `<tr>${fields.map(f => `<td>${r[f] || ''}</td>`).join('')}</tr>`).join('')}</table></body></html>`
    mimeType = 'application/vnd.ms-excel;charset=utf-8'; extension = 'xlsx'
  } else {
    content = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"></head><body><table border="1"><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>${exportData.map(r => `<tr>${fields.map(f => `<td>${r[f] || ''}</td>`).join('')}</tr>`).join('')}</table></body></html>`
    mimeType = 'application/vnd.ms-word;charset=utf-8'; extension = 'docx'
  }
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = `生产领料_${new Date().toISOString().slice(0,10)}.${extension}`
  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url)
  showExportTypeModal.value = false; exportMode.value = false; selectedRows.value = []
  ElMessage.success('导出成功')
}

// ==================== Tab 2: 领料出库 ====================
const mapExRecord = (r) => ({
  id: r.id || r.code, code: r.code || '', date: r.date || '', applicant: r.applicant || '',
  warehouseLocation: r.warehouse_location || r.warehouseLocation || '', reviewer: r.reviewer || '',
  operator: r.operator || '', productionBatchCode: r.production_batch_code || r.productionBatchCode || '',
  sourceApplicationCodes: Array.isArray(r.source_application_codes) ? r.source_application_codes : (typeof r.source_application_codes === 'string' ? JSON.parse(r.source_application_codes || '[]') : []),
  executeStatus: r.execute_status || r.executeStatus || '已出库',
  executeStatusClass: r.execute_status_class || r.executeStatusClass || 'completed',
  materials: Array.isArray(r.materials) ? r.materials : (typeof r.materials === 'string' ? JSON.parse(r.materials || '[]') : [])
})

const executeData = ref([])
const isLoadingEx = ref(false)
const loadExecuteData = async () => {
  isLoadingEx.value = true
  try { const res = await getExecuteList(); executeData.value = (res || []).map(mapExRecord) }
  catch { }
  finally { isLoadingEx.value = false }
}

const exSearchCode = ref(''); const exSearchApplicant = ref(''); const exSearchBatchCode = ref('')
const exSearchWarehouse = ref(''); const exStatusFilter = ref('all')
const exCurrentPage = ref(1); const exPageSize = ref(10)
const exSelectedRows = ref([]); const exBatchEditMode = ref(null)
const exExportMode = ref(false); const exShowDetailModal = ref(false)
const exShowAddModal = ref(false); const exShowEditModal = ref(false)
const exShowDeleteConfirm = ref(false); const exShowBatchEditModal = ref(false)
const exShowBatchDeleteConfirm = ref(false); const exShowExportTypeModal = ref(false)
const exExportFileType = ref('xlsx'); const exSelectedRecord = ref(null)
const exDeletingId = ref(null); const exSelectedAppCode = ref('')
const exSelectedAppMaterials = ref([]); const exMaterialQuantities = ref({})
const exSelectedMaterialIndices = ref([]); const exMaterialPool = ref([])
const exSelectAllMaterials = ref(false)

const exFilteredData = computed(() => {
  return executeData.value.filter(item => {
    if (exSearchCode.value && !item.code.toLowerCase().includes(exSearchCode.value.toLowerCase())) return false
    if (exSearchApplicant.value && !item.applicant.toLowerCase().includes(exSearchApplicant.value.toLowerCase())) return false
    if (exSearchBatchCode.value && !item.productionBatchCode.toLowerCase().includes(exSearchBatchCode.value.toLowerCase())) return false
    if (exSearchWarehouse.value && !item.warehouseLocation.toLowerCase().includes(exSearchWarehouse.value.toLowerCase())) return false
    if (exStatusFilter.value !== 'all' && item.executeStatus !== exStatusFilter.value) return false
    return true
  })
})

const paginatedExecuteData = computed(() => {
  const start = (exCurrentPage.value - 1) * exPageSize.value
  return exFilteredData.value.slice(start, start + exPageSize.value)
})

const exTotalPages = computed(() => Math.ceil(exFilteredData.value.length / exPageSize.value) || 1)

const toggleExSelectAll = () => {
  if (exSelectedRows.value.length === paginatedExecuteData.value.length) {
    const pageIds = new Set(paginatedExecuteData.value.map(r => r.id))
    exSelectedRows.value = exSelectedRows.value.filter(id => !pageIds.has(id))
  } else {
    const currentIds = new Set(exSelectedRows.value)
    const newRows = paginatedExecuteData.value.filter(r => !currentIds.has(r.id))
    exSelectedRows.value = [...exSelectedRows.value, ...newRows.map(r => r.id)]
  }
}

const toggleExRow = (id) => {
  const idx = exSelectedRows.value.indexOf(id)
  if (idx > -1) exSelectedRows.value.splice(idx, 1)
  else exSelectedRows.value.push(id)
}

const handleExViewDetail = (row) => { exSelectedRecord.value = row; exShowDetailModal.value = true }

const handleExEditRecord = (row) => {
  exSelectedRecord.value = row
  exEditForm.date = row.date; exEditForm.applicant = row.applicant; exEditForm.warehouseLocation = row.warehouseLocation
  exEditForm.reviewer = row.reviewer; exEditForm.operator = row.operator; exEditForm.productionBatchCode = row.productionBatchCode
  exEditForm.executeStatus = row.executeStatus; exEditForm.materials = JSON.parse(JSON.stringify(row.materials))
  exShowEditModal.value = true
}

const handleExDeleteRecord = (id) => { exDeletingId.value = id; exShowDeleteConfirm.value = true }

const confirmExDelete = async () => {
  if (exDeletingId.value !== null) {
    try { await apiDeleteExe(exDeletingId.value); ElMessage.success('删除成功'); await loadExecuteData() }
    catch { ElMessage.error('删除失败') }
  }
  exShowDeleteConfirm.value = false; exDeletingId.value = null
}

const exBatchEditForm = reactive({ warehouseLocation: '', reviewer: '', productionBatchCode: '', executeStatus: '' })
const handleExBatchEditSave = async () => {
  if (exSelectedRows.value.length === 0) { ElMessage.warning('请先选择记录'); return }
  const updates = {}
  if (exBatchEditForm.warehouseLocation) updates.warehouseLocation = exBatchEditForm.warehouseLocation
  if (exBatchEditForm.reviewer) updates.reviewer = exBatchEditForm.reviewer
  if (exBatchEditForm.productionBatchCode) updates.productionBatchCode = exBatchEditForm.productionBatchCode
  if (exBatchEditForm.executeStatus) updates.executeStatus = exBatchEditForm.executeStatus
  if (Object.keys(updates).length === 0) { ElMessage.warning('请至少填写一个要修改的字段'); return }
  try {
    for (const id of exSelectedRows.value) { await apiUpdateExe(id, updates) }
    ElMessage.success(`批量编辑成功，已更新 ${exSelectedRows.value.length} 条记录`)
    exShowBatchEditModal.value = false; exBatchEditMode.value = null; exSelectedRows.value = []
    exBatchEditForm.warehouseLocation = ''; exBatchEditForm.reviewer = ''; exBatchEditForm.productionBatchCode = ''; exBatchEditForm.executeStatus = ''
    await loadExecuteData()
  } catch { ElMessage.error('批量编辑失败，请重试') }
}

const handleExBatchDelete = async () => {
  if (exSelectedRows.value.length === 0) return
  try {
    for (const id of exSelectedRows.value) { await apiDeleteExe(id) }
    ElMessage.success(`已删除 ${exSelectedRows.value.length} 条出库单`)
    exShowBatchDeleteConfirm.value = false; exBatchEditMode.value = null; exSelectedRows.value = []
    await loadExecuteData()
  } catch { ElMessage.error('批量删除失败，请重试') }
}

const exAddForm = reactive({ code: '', date: new Date().toISOString().split('T')[0], applicant: '', warehouseLocation: '仓库A区', reviewer: '', operator: '', productionBatchCode: '', materials: [] })
const resetExAddForm = () => {
  exAddForm.code = ''; exAddForm.date = new Date().toISOString().split('T')[0]; exAddForm.applicant = ''; exAddForm.warehouseLocation = '仓库A区'
  exAddForm.reviewer = ''; exAddForm.operator = ''; exAddForm.productionBatchCode = ''; exAddForm.materials = []
  exSelectedAppCode.value = ''; exSelectedAppMaterials.value = []; exMaterialQuantities.value = {}
  exSelectedMaterialIndices.value = []; exMaterialPool.value = []
}

const handleOpenExAdd = () => {
  resetExAddForm()
  exAddForm.code = `CK${new Date().getFullYear()}${String(new Date().getMonth()+1).padStart(2,'0')}${String(new Date().getDate()).padStart(2,'0')}${String(executeData.value.length+1).padStart(3,'0')}`
  exShowAddModal.value = true
}

const onExAppCodeChange = (code) => {
  const app = applicationData.value.find(a => a.code === code)
  exSelectedAppMaterials.value = app ? app.materials : []
  exMaterialQuantities.value = {}; exSelectedMaterialIndices.value = []
  if (app) { app.materials.forEach((m, i) => { exMaterialQuantities.value[i] = m.requestedQuantity }) }
}

const toggleExMaterial = (m) => {
  const idx = exSelectedMaterialIndices.value.indexOf(m)
  if (idx > -1) exSelectedMaterialIndices.value.splice(idx, 1)
  else exSelectedMaterialIndices.value.push(m)
}

const onExSelectAll = (val) => {
  if (val) { exSelectedMaterialIndices.value = [...exSelectedAppMaterials.value] }
  else { exSelectedMaterialIndices.value = [] }
}

const handleAddToPool = () => {
  if (!exSelectedAppCode.value || exSelectedMaterialIndices.value.length === 0) { ElMessage.warning('请先选择领料单并勾选要出库的物料'); return }
  const newMaterials = exSelectedMaterialIndices.value.map(row => {
    const idx = exSelectedAppMaterials.value.findIndex(m => m.materialCode === row.materialCode)
    const actualQty = exMaterialQuantities.value[idx] !== undefined ? exMaterialQuantities.value[idx] : row.requestedQuantity
    const poolIdx = exMaterialPool.value.findIndex(m => m.materialCode === row.materialCode && m.applicationCode === exSelectedAppCode.value)
    if (poolIdx >= 0) { exMaterialPool.value[poolIdx].actualQuantity += actualQty; return null }
    return { materialCode: row.materialCode, materialName: row.materialName, batchNo: row.batchNo || '', spec: row.spec, unit: row.unit, category: row.category, requestedQuantity: row.requestedQuantity, stockQuantity: actualQty, actualQuantity: actualQty, remark: actualQty === row.requestedQuantity ? '正常出库' : '部分出库', applicationCode: exSelectedAppCode.value }
  }).filter(Boolean)
  exMaterialPool.value = [...exMaterialPool.value, ...newMaterials]
  exSelectedMaterialIndices.value = []
}

const handleExSaveAdd = async () => {
  if (exMaterialPool.value.length === 0) { ElMessage.warning('请先添加物料到物料池'); return }
  const sourceAppCodes = [...new Set(exMaterialPool.value.map(m => m.applicationCode))]
  const firstMat = exMaterialPool.value[0]
  const sourceApp = applicationData.value.find(app => app.code === firstMat.applicationCode)
  const hasPartial = exMaterialPool.value.some(m => m.actualQuantity < m.requestedQuantity)
  const newRecord = {
    code: exAddForm.code, date: exAddForm.date, applicant: exAddForm.applicant || sourceApp?.applicant || '',
    warehouseLocation: exAddForm.warehouseLocation, reviewer: exAddForm.reviewer || sourceApp?.reviewer || '',
    operator: exAddForm.operator, productionBatchCode: exAddForm.productionBatchCode || sourceApp?.productionBatchCode || '',
    sourceApplicationCodes: sourceAppCodes, executeStatus: hasPartial ? '部分出库' : '已出库',
    executeStatusClass: hasPartial ? 'partial' : 'completed', materials: JSON.parse(JSON.stringify(exMaterialPool.value))
  }
  try { await apiCreateExe(newRecord); ElMessage.success('新增成功'); exShowAddModal.value = false; resetExAddForm(); await loadExecuteData() }
  catch { ElMessage.error('新增失败，请重试') }
}

const exEditForm = reactive({ date: '', applicant: '', warehouseLocation: '', reviewer: '', operator: '', productionBatchCode: '', executeStatus: '', materials: [] })
const handleExSaveEdit = async () => {
  if (!exSelectedRecord.value) return
  const updates = {
    date: exEditForm.date, applicant: exEditForm.applicant, warehouseLocation: exEditForm.warehouseLocation,
    reviewer: exEditForm.reviewer, operator: exEditForm.operator, productionBatchCode: exEditForm.productionBatchCode,
    executeStatus: exEditForm.executeStatus, materials: JSON.parse(JSON.stringify(exEditForm.materials))
  }
  try { await apiUpdateExe(exSelectedRecord.value.id, updates); ElMessage.success('保存成功'); exShowEditModal.value = false; await loadExecuteData() }
  catch { ElMessage.error('保存失败，请重试') }
}

const confirmExExport = () => {
  const exportData = exSelectedRows.value.length > 0
    ? executeData.value.filter(item => exSelectedRows.value.includes(item.id))
    : exFilteredData.value
  const headers = ['出库单号', '日期', '申领人', '仓库地点', '审核人', '操作员', '生产批次号', '执行状态']
  const fields = ['code', 'date', 'applicant', 'warehouseLocation', 'reviewer', 'operator', 'productionBatchCode', 'executeStatus']
  let content; let mimeType; let extension;
  if (exExportFileType.value === 'csv') { content = '﻿' + headers.join(',') + '\n' + exportData.map(r => fields.map(f => `"${r[f] || ''}"`).join(',')).join('\n'); mimeType = 'text/csv;charset=utf-8'; extension = 'csv' }
  else if (exExportFileType.value === 'xlsx') { content = `<html><head><meta charset="utf-8"></head><body><table border="1"><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>${exportData.map(r => `<tr>${fields.map(f => `<td>${r[f] || ''}</td>`).join('')}</tr>`).join('')}</table></body></html>`; mimeType = 'application/vnd.ms-excel;charset=utf-8'; extension = 'xlsx' }
  else { content = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"></head><body><table border="1"><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>${exportData.map(r => `<tr>${fields.map(f => `<td>${r[f] || ''}</td>`).join('')}</tr>`).join('')}</table></body></html>`; mimeType = 'application/vnd.ms-word;charset=utf-8'; extension = 'docx' }
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = `领料出库_${new Date().toISOString().slice(0,10)}.${extension}`
  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url)
  exShowExportTypeModal.value = false; exExportMode.value = false; exSelectedRows.value = []
  ElMessage.success('导出成功')
}

// ==================== Tab 3: 领料统计（严格对齐 V1.1 StatisticsTab.tsx） ====================
// 主 Tab：月度汇总 / 物料汇总 / 部门汇总 / 区域统计 (V1.1 共 4 个主Tab)
const statActiveTab = ref('monthly')
// 区域统计子Tab: greenhouse(大棚) / field(大田) / batch(种植批次)
const statActiveAreaTab = ref('greenhouse')
const statYearFilter = ref(String(new Date().getFullYear()))
const statMonthFilter = ref('all')
const statMaterialSearch = ref('')
const statDepartmentFilter = ref([])
const statCategoryFilter = ref([])
// 月度仪表盘 月份切换
const statSelectedMonth = ref('all')
// 部门/区域 Tab 共享筛选
const statDateRange = reactive({ start: '', end: '' })
const statQuickPeriod = ref('currentMonth')
// 区域统计专属筛选
const statGreenhouseTypeFilter = ref('all')
const statGreenhouseFilter = ref('all')
const statFieldFilter = ref('all')
const statBatchFilter = ref('all')
const statComparisonPeriod = ref('none')
const statCurrentPage = ref(1)
const statPageSize = ref(10)
const statExportMode = ref(false)
const statSelectedRows = ref([])
const statShowExportTypeModal = ref(false)
const statExportFileType = ref('xlsx')
const statShowDetailModal = ref(false)
const statSelectedRecord = ref(null)
// 批次明细展开
const expandedBatchCodes = ref([])
const isLoadingStat = ref(false)

const years = ['2025', '2026']
const statCategoryOptions = ['肥料与土壤改良剂', '农药与植保产品', '种质资源', '农业机械', '劳保与防护用品', '监测设备', '采收容器']

// 7 个物料分类 + 颜色（对齐 V1.1 CategorySummaryCards）
// 注：categorySummaryData/categoryTrendData 已在下方 loadMaterialStatistics 中用 ref([]) 声明，删除此写死版本

const totalCategoryAmount = computed(() => categorySummaryData.value.reduce((s, c) => s + (Number(c.amount) || 0), 0))

// 仅取 7 个分类白名单字段，避免后端混入领料单字段(code/applicant/...)污染月度汇总
const sanitizedCategorySummary = computed(() => {
  return (categorySummaryData.value || []).filter(c => c && CATEGORY_KEY_WHITELIST.includes(c.key))
})

const monthData = computed(() => {
  const trend = categoryTrendData.value || []
  const cats = sanitizedCategorySummary.value
  return trend
    .filter(d => d && typeof d.month === 'string' && d.month.startsWith(statYearFilter.value))
    .map(d => {
      // 仅累计白名单分类字段，禁止 spread 整行（防止 code/applicant 等领料字段混入）
      const totalQty = cats.reduce((sum, cat) => sum + (Number(d[cat.key]) || 0), 0)
      const yearTotal = trend
        .filter(d2 => d2 && typeof d2.month === 'string' && d2.month.startsWith(statYearFilter.value))
        .reduce((sum, d2) => sum + cats.reduce((s, cat) => s + (Number(d2[cat.key]) || 0), 0), 0)
      // 严格只暴露分类字段 + 元信息，禁止任何其他字段进入展示数据
      const row = {
        month: d.month,
        monthName: `${parseInt(d.month.split('-')[1])}月`,
        totalQuantity: totalQty,
        totalAmount: totalQty * 30,
        percentage: yearTotal > 0 ? (totalQty / yearTotal) * 100 : 0,
        total: Number(d.total) || totalQty
      }
      cats.forEach(cat => { row[cat.key] = Number(d[cat.key]) || 0 })
      return row
    })
})
const filteredMonthData = computed(() => {
  if (statMonthFilter.value === 'all') return monthData.value
  return monthData.value.filter(d => d.month.endsWith('-' + statMonthFilter.value))
})
const getMonthDetails = (month) => {
  const md = (categoryTrendData.value || []).find(d => d && d.month === month)
  if (!md) return []
  const cats = sanitizedCategorySummary.value
  const totalQty = cats.reduce((sum, cat) => sum + (Number(md[cat.key]) || 0), 0)
  return cats.map(cat => {
    const qty = Number(md[cat.key]) || 0
    return { categoryName: cat.name, quantity: qty, amount: qty * 30, percentage: totalQty > 0 ? (qty / totalQty) * 100 : 0 }
  })
}
const getMonthStats = (month) => {
  const all = filteredMonthData.value
  const yearTotalQty = monthData.value.reduce((s, m) => s + m.totalQuantity, 0)
  const sortedByQty = [...all].sort((a, b) => b.totalQuantity - a.totalQuantity)
  const rank = sortedByQty.findIndex(m => m.month === month) + 1
  const currentData = all.find(m => m.month === month)
  const percent = yearTotalQty > 0 ? ((currentData?.totalQuantity || 0) / yearTotalQty * 100).toFixed(1) + '%' : '0.0%'

  const [year, m] = month.split('-')
  const monthNum = parseInt(m)
  let qoq = '-'
  if (monthNum > 1) {
    const prevMonth = `${year}-${String(monthNum - 1).padStart(2, '0')}`
    const prevData = all.find(am => am.month === prevMonth)
    if (prevData && prevData.totalQuantity > 0) {
      const change = ((currentData?.totalQuantity || 0) - prevData.totalQuantity) / prevData.totalQuantity * 100
      qoq = change >= 0 ? `↑${change.toFixed(1)}%` : `↓${Math.abs(change).toFixed(1)}%`
    }
  }
  let yoy = '-'
  const lastYearMonth = `${parseInt(year) - 1}-${m}`
  const lastYearData = all.find(am => am.month === lastYearMonth)
  if (lastYearData && lastYearData.totalQuantity > 0) {
    const change = ((currentData?.totalQuantity || 0) - lastYearData.totalQuantity) / lastYearData.totalQuantity * 100
    yoy = change >= 0 ? `↑${change.toFixed(1)}%` : `↓${Math.abs(change).toFixed(1)}%`
  }
  return { rank, percent, qoq, yoy }
}
const getCategoryStats = (detailQty, monthQty) => {
  const percent = monthQty > 0 ? ((detailQty / monthQty) * 100).toFixed(1) + '%' : '0.0%'
  return percent
}

// ==================== 物料汇总数据（来自后端 API /api/material-statistics/） ====================
const materialStatData = ref([])
const monthlyStatData = ref([])
const categorySummaryData = ref([])
const categoryTrendData = ref([])
const loadMaterialStatistics = async () => {
  isLoadingStat.value = true
  try {
    const result = await getMaterialStatistics()
    materialStatData.value = result.materialStatistics || []
    monthlyStatData.value = result.monthlyStatistics || []
    categorySummaryData.value = result.categorySummary || []
    categoryTrendData.value = result.categoryTrend || []
    console.log('[领料统计] material:', materialStatData.value.length, 'monthly:', monthlyStatData.value.length, 'category:', categorySummaryData.value.length, 'trend:', categoryTrendData.value.length)
  } catch (err) {
    console.warn('[领料统计] 加载失败:', err)
    materialStatData.value = []
    monthlyStatData.value = []
  } finally {
    isLoadingStat.value = false
  }
}
const filteredMaterialStatData = computed(() => {
  return materialStatData.value.filter(item => {
    if (statMaterialSearch.value) {
      const s = statMaterialSearch.value.toLowerCase()
      const code = (item.materialCode || '').toLowerCase()
      const name = (item.materialName || '').toLowerCase()
      if (!code.includes(s) && !name.includes(s)) return false
    }
    if (statDepartmentFilter.value.length > 0 && !statDepartmentFilter.value.includes(item.requisitionDepartment)) return false
    if (statCategoryFilter.value.length > 0 && !statCategoryFilter.value.includes(item.category)) return false
    return true
  })
})
const paginatedMaterialStatData = computed(() => {
  const start = (statCurrentPage.value - 1) * statPageSize.value
  return filteredMaterialStatData.value.slice(start, start + statPageSize.value)
})

// 5 张统计卡片（聚合全部物料数据，不论当前 Tab）
const statSummary = computed(() => {
  const data = materialStatData.value
  const requisitionCount = data.reduce((s, r) => s + (Number(r.requisitionCount) || 0), 0)
  const totalQuantity = data.reduce((s, r) => s + (Number(r.totalQuantity) || 0), 0)
  const totalAmount = data.reduce((s, r) => s + (Number(r.totalAmount) || 0), 0)
  // 差异率 = (实际 - 总数) / 总数，平均
  const rates = data.map(r => {
    const t = Number(r.totalQuantity) || 0
    if (t === 0) return 0
    return ((Number(r.actualQuantity) || 0) - t) / t * 100
  }).filter(v => v !== 0)
  const avgDifferenceRate = rates.length > 0 ? rates.reduce((s, v) => s + v, 0) / rates.length : 0
  // 同比变化（V1.1 默认 +12.5%，可由后端数据覆盖）
  const yearOnYearChange = 12.5
  return { requisitionCount, totalQuantity, totalAmount, avgDifferenceRate, yearOnYearChange }
})

// ==================== 物料表辅助：选择/导出 ====================
const toggleStatRow = (idx) => {
  const i = statSelectedRows.value.indexOf(idx)
  if (i > -1) statSelectedRows.value.splice(i, 1)
  else statSelectedRows.value.push(idx)
}
const handleMaterialStatSelectAll = () => {
  if (statSelectedRows.value.length === filteredMaterialStatData.value.length) {
    statSelectedRows.value = []
  } else {
    statSelectedRows.value = filteredMaterialStatData.value.map((_, i) => i)
  }
}
const handleStatExportConfirm = () => {
  if (statSelectedRows.value.length === 0) { ElMessage.warning('请选择要导出的数据'); return }
  statShowExportTypeModal.value = true
}
const handleStatViewDetail = (row) => {
  statSelectedRecord.value = row
  statShowDetailModal.value = true
}

// ==================== 物料表导出（3 格式：xlsx/csv/word） ====================
const escapeCSV = (str) => {
  if (str === null || str === undefined) return ''
  const v = String(str)
  if (v.includes(',') || v.includes('"') || v.includes('\n')) return '"' + v.replace(/"/g, '""') + '"'
  return v
}
const buildMaterialStatContent = () => {
  const selectedData = statSelectedRows.value.length > 0
    ? statSelectedRows.value.map(i => filteredMaterialStatData.value[i]).filter(Boolean)
    : filteredMaterialStatData.value
  const headers = ['物料编号', '物料名称', '分类', '规格型号', '条形码', '单位', '供应商', '批次号', '生产日期', '有效期至', '生产计划批次', '领料部门', '用途/区域', '领料人', '领料时间', '领料次数', '总数量', '实际数量', '总金额(元)', '主要仓库']
  let content; let mimeType; let extension;
  if (statExportFileType.value === 'csv') {
    let csv = '﻿领料统计表\n'
    csv += headers.map(escapeCSV).join(',') + '\n'
    selectedData.forEach(r => {
      csv += [r.materialCode, r.materialName, r.category, r.spec, r.barcode, r.unit, r.supplier, r.batchCode, r.productionDate, r.expiryDate, r.productionPlanBatchCode, r.requisitionDepartment, r.usageArea, r.requisitioner, r.requisitionTime, r.requisitionCount, r.totalQuantity, r.actualQuantity, r.totalAmount, r.mainWarehouse].map(escapeCSV).join(',') + '\n'
    })
    content = csv; mimeType = 'text/csv;charset=utf-8'; extension = 'csv'
  } else if (statExportFileType.value === 'xlsx') {
    let html = `<html><head><meta charset="utf-8"></head><body><div style="margin-bottom:20px;font-size:16px;"><b>领料统计表</b></div><table border="1" style="border-collapse:collapse;width:100%;">`
    html += `<tr style="background-color:#e5e7eb;font-weight:bold;">${headers.map(h => `<th style="padding:8px;border:1px solid #ccc;">${h}</th>`).join('')}</tr>`
    selectedData.forEach(r => {
      html += `<tr><td style="padding:6px;border:1px solid #ccc;">${r.materialCode || ''}</td><td style="padding:6px;border:1px solid #ccc;">${r.materialName || ''}</td><td style="padding:6px;border:1px solid #ccc;">${r.category || ''}</td><td style="padding:6px;border:1px solid #ccc;">${r.spec || ''}</td><td style="padding:6px;border:1px solid #ccc;">${r.barcode || ''}</td><td style="padding:6px;border:1px solid #ccc;text-align:center;">${r.unit || ''}</td><td style="padding:6px;border:1px solid #ccc;">${r.supplier || ''}</td><td style="padding:6px;border:1px solid #ccc;">${r.batchCode || ''}</td><td style="padding:6px;border:1px solid #ccc;">${r.productionDate || ''}</td><td style="padding:6px;border:1px solid #ccc;">${r.expiryDate || ''}</td><td style="padding:6px;border:1px solid #ccc;">${r.productionPlanBatchCode || ''}</td><td style="padding:6px;border:1px solid #ccc;">${r.requisitionDepartment || ''}</td><td style="padding:6px;border:1px solid #ccc;">${r.usageArea || ''}</td><td style="padding:6px;border:1px solid #ccc;">${r.requisitioner || ''}</td><td style="padding:6px;border:1px solid #ccc;">${r.requisitionTime || ''}</td><td style="padding:6px;border:1px solid #ccc;text-align:right;">${r.requisitionCount || 0}</td><td style="padding:6px;border:1px solid #ccc;text-align:right;">${(r.totalQuantity || 0).toLocaleString()}</td><td style="padding:6px;border:1px solid #ccc;text-align:right;">${(r.actualQuantity || 0).toLocaleString()}</td><td style="padding:6px;border:1px solid #ccc;text-align:right;">¥${(r.totalAmount || 0).toLocaleString()}</td><td style="padding:6px;border:1px solid #ccc;">${r.mainWarehouse || ''}</td></tr>`
    })
    html += '</table></body></html>'
    content = html; mimeType = 'application/vnd.ms-excel;charset=utf-8'; extension = 'xls'
  } else {
    // word
    let html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"></head><body><div style="margin-bottom:20px;font-size:16px;"><b>领料统计表</b></div><table border="1" style="border-collapse:collapse;width:100%;">`
    html += `<tr style="background-color:#e5e7eb;font-weight:bold;">${headers.map(h => `<th style="padding:8px;border:1px solid #000;">${h}</th>`).join('')}</tr>`
    selectedData.forEach(r => {
      html += `<tr><td style="padding:6px;border:1px solid #000;">${r.materialCode || ''}</td><td style="padding:6px;border:1px solid #000;">${r.materialName || ''}</td><td style="padding:6px;border:1px solid #000;">${r.category || ''}</td><td style="padding:6px;border:1px solid #000;">${r.spec || ''}</td><td style="padding:6px;border:1px solid #000;">${r.barcode || ''}</td><td style="padding:6px;border:1px solid #000;text-align:center;">${r.unit || ''}</td><td style="padding:6px;border:1px solid #000;">${r.supplier || ''}</td><td style="padding:6px;border:1px solid #000;">${r.batchCode || ''}</td><td style="padding:6px;border:1px solid #000;">${r.productionDate || ''}</td><td style="padding:6px;border:1px solid #000;">${r.expiryDate || ''}</td><td style="padding:6px;border:1px solid #000;">${r.productionPlanBatchCode || ''}</td><td style="padding:6px;border:1px solid #000;">${r.requisitionDepartment || ''}</td><td style="padding:6px;border:1px solid #000;">${r.usageArea || ''}</td><td style="padding:6px;border:1px solid #000;">${r.requisitioner || ''}</td><td style="padding:6px;border:1px solid #000;">${r.requisitionTime || ''}</td><td style="padding:6px;border:1px solid #000;text-align:right;">${r.requisitionCount || 0}</td><td style="padding:6px;border:1px solid #000;text-align:right;">${(r.totalQuantity || 0).toLocaleString()}</td><td style="padding:6px;border:1px solid #000;text-align:right;">${(r.actualQuantity || 0).toLocaleString()}</td><td style="padding:6px;border:1px solid #000;text-align:right;">¥${(r.totalAmount || 0).toLocaleString()}</td><td style="padding:6px;border:1px solid #000;">${r.mainWarehouse || ''}</td></tr>`
    })
    html += '</table></body></html>'
    content = html; mimeType = 'application/vnd.ms-word;charset=utf-8'; extension = 'doc'
  }
  return { content, mimeType, extension }
}
const confirmMaterialStatExport = () => {
  try {
    const { content, mimeType, extension } = buildMaterialStatContent()
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `领料统计表_${new Date().toISOString().slice(0, 10)}.${extension}`
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch (err) {
    console.error('[领料统计] 导出失败:', err)
    ElMessage.error('导出失败，请重试')
  }
  statShowExportTypeModal.value = false
  statExportMode.value = false
  statSelectedRows.value = []
}

// 重置
const handleStatReset = () => {
  statMaterialSearch.value = ''
  statDepartmentFilter.value = []
  statCategoryFilter.value = []
  statYearFilter.value = String(new Date().getFullYear())
  statMonthFilter.value = 'all'
  statCurrentPage.value = 1
}

// ==================== 部门 / 区域 Tab 公共筛选 ====================
const statSingleDepartmentFilter = ref('all')

// 计算日期是否在 [start, end] 内（end 为空则只判断 start，反之亦然）
const inDateRange = (dateStr) => {
  if (!dateStr) return true
  if (statDateRange.start && dateStr < statDateRange.start) return false
  if (statDateRange.end && dateStr > statDateRange.end) return false
  return true
}

// 快捷筛选 - 设置日期区间
const onQuickFilter = (period) => {
  const today = new Date()
  const yyyy = today.getFullYear()
  const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  if (period === 'currentWeek') {
    const day = today.getDay() === 0 ? 7 : today.getDay()
    const start = new Date(today); start.setDate(today.getDate() - (day - 1))
    statDateRange.start = fmt(start); statDateRange.end = fmt(today)
  } else if (period === 'currentMonth') {
    statDateRange.start = `${yyyy}-${String(today.getMonth() + 1).padStart(2, '0')}-01`
    statDateRange.end = fmt(today)
  } else if (period === 'currentQuarter') {
    const q = Math.floor(today.getMonth() / 3)
    statDateRange.start = `${yyyy}-${String(q * 3 + 1).padStart(2, '0')}-01`
    statDateRange.end = fmt(today)
  } else if (period === 'currentYear') {
    statDateRange.start = `${yyyy}-01-01`
    statDateRange.end = fmt(today)
  }
  statQuickPeriod.value = period
  statCurrentPage.value = 1
}

// 重置共享筛选
const resetSharedFilter = () => {
  statSingleDepartmentFilter.value = 'all'
  statDateRange.start = ''
  statDateRange.end = ''
  statQuickPeriod.value = ''
  statGreenhouseTypeFilter.value = 'all'
  statGreenhouseFilter.value = 'all'
  statFieldFilter.value = 'all'
  statBatchFilter.value = 'all'
  statComparisonPeriod.value = 'none'
  statCurrentPage.value = 1
}

// 部门统计过滤
const filteredDepartmentData = computed(() => {
  return departmentStatisticsData.filter(item => {
    if (statSingleDepartmentFilter.value !== 'all' && item.department !== statSingleDepartmentFilter.value) return false
    return true
  })
})
const paginatedDepartmentData = computed(() => {
  const start = (statCurrentPage.value - 1) * statPageSize.value
  return filteredDepartmentData.value.slice(start, start + statPageSize.value)
})

// 大棚统计过滤
const filteredGreenhouseData = computed(() => {
  return greenhouseStatisticsData.filter(item => {
    if (statGreenhouseTypeFilter.value !== 'all' && item.greenhouseType !== statGreenhouseTypeFilter.value) return false
    if (statGreenhouseFilter.value !== 'all' && item.greenhouse !== statGreenhouseFilter.value) return false
    return true
  })
})
const paginatedGreenhouseData = computed(() => {
  const start = (statCurrentPage.value - 1) * statPageSize.value
  return filteredGreenhouseData.value.slice(start, start + statPageSize.value)
})

// 大田统计过滤
const filteredFieldData = computed(() => {
  return fieldStatisticsData.filter(item => {
    if (statFieldFilter.value !== 'all' && item.field !== statFieldFilter.value) return false
    return true
  })
})
const paginatedFieldData = computed(() => {
  const start = (statCurrentPage.value - 1) * statPageSize.value
  return filteredFieldData.value.slice(start, start + statPageSize.value)
})

// 批次统计过滤
const filteredBatchData = computed(() => {
  return batchStatisticsData.filter(item => {
    if (statBatchFilter.value !== 'all' && item.batchCode !== statBatchFilter.value) return false
    return true
  })
})
const paginatedBatchData = computed(() => {
  const start = (statCurrentPage.value - 1) * statPageSize.value
  return filteredBatchData.value.slice(start, start + statPageSize.value)
})

// 批次明细展开/折叠
const toggleBatchExpand = (batchCode) => {
  const idx = expandedBatchCodes.value.indexOf(batchCode)
  if (idx > -1) expandedBatchCodes.value.splice(idx, 1)
  else expandedBatchCodes.value.push(batchCode)
}

// 通用格式化
const formatNumber = (n) => {
  const v = Number(n) || 0
  return v.toLocaleString()
}

// ==================== Tab 4: 成本核算 - 严格 1:1 对齐 V1.1 CostTab.tsx ====================
const costSubTabs = [
  { key: 'overview', label: '成本概览', icon: TrendingUp },
  { key: 'comparison', label: '分类对比', icon: BarChart2 }
]
const costActiveTab = ref('overview')

// 成本筛选状态（V1.1 CostFilters 1:1）
const costQuickPeriods = [
  { label: '本周', value: 'week' },
  { label: '本月', value: 'month' },
  { label: '本季', value: 'quarter' },
  { label: '本年', value: 'year' }
]
const getInitialCostFilters = () => {
  const now = new Date()
  return {
    quickPeriod: 'year',
    dateRange: {
      start: `${now.getFullYear()}-01-01`,
      end: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    },
    departments: [],
    categories: [],
    batches: [],
    warehouses: []
  }
}
const costFilters = reactive(getInitialCostFilters())
const costSelectedDept = ref('all')
const costSelectedCategory = ref('all')

const onCostQuickPeriod = (period) => {
  const now = new Date()
  const yyyy = now.getFullYear()
  const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  let start = '', end = fmt(now)
  if (period === 'week') {
    const ws = new Date(now); ws.setDate(now.getDate() - now.getDay()); start = fmt(ws)
  } else if (period === 'month') {
    start = `${yyyy}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  } else if (period === 'quarter') {
    const qm = Math.floor(now.getMonth() / 3) * 3
    start = `${yyyy}-${String(qm + 1).padStart(2, '0')}-01`
  } else if (period === 'year') {
    start = `${yyyy}-01-01`
  }
  costFilters.quickPeriod = period
  costFilters.dateRange.start = start
  costFilters.dateRange.end = end
}

const onCostDeptChange = () => {
  costFilters.departments = costSelectedDept.value === 'all' ? [] : [costSelectedDept.value]
}
const onCostCategoryChange = () => {
  costFilters.categories = costSelectedCategory.value === 'all' ? [] : [costSelectedCategory.value]
}
const resetCostFilters = () => {
  Object.assign(costFilters, getInitialCostFilters())
  costSelectedDept.value = 'all'
  costSelectedCategory.value = 'all'
}

// 数据源：优先用真实领料数据，兜底 V1.1 12 条 mock
const costRecordsSource = computed(() => {
  if (applicationData.value && applicationData.value.length > 0) return applicationData.value
  return materialReceivingDetails
})
const costFilteredRecords = computed(() => filterCostRecords(costRecordsSource.value, costFilters))

// KPI 4 卡：累计总成本 / 本月成本 / 平均批次成本 / 成本差异率
const costKPI = computed(() => {
  const records = costFilteredRecords.value
  const totalCost = calcCostTotal(records)
  const monthlyCost = calcMonthlyCost(records)
  const batchData = aggregateByBatch(records)
  const avgBatchCost = batchData.length > 0 ? totalCost / batchData.length : 0
  const costDiffRate = -2.3 // V1.1 简化默认值
  return { totalCost, monthlyCost, avgBatchCost, costDiffRate }
})

const costCategoryAgg = computed(() => aggregateByCategory(costFilteredRecords.value))
const costDepartmentAgg = computed(() => aggregateByDepartment(costFilteredRecords.value))
const costBatchAgg = computed(() => aggregateByBatch(costFilteredRecords.value))
const costMonthlyAgg = computed(() => aggregateByMonth(costFilteredRecords.value))
const costMaxMonth = computed(() => Math.max(...costMonthlyAgg.value.map(m => m.totalAmount), 1))
const costBatchMaterialDetails = computed(() => getBatchMaterialDetails(costFilteredRecords.value))

// 维度切换 + 批次明细展开
const costDimension = ref('category')
const costExpandedBatch = ref([])
const toggleCostBatchExpand = (batchCode) => {
  const idx = costExpandedBatch.value.indexOf(batchCode)
  if (idx > -1) costExpandedBatch.value.splice(idx, 1)
  else costExpandedBatch.value.push(batchCode)
}

// 分类颜色映射（V1.1 CostPieChart 1:1）
const COST_CATEGORY_COLOR_MAP = {
  '种质资源': '#06B6D4',
  '肥料与土壤改良剂': '#8B5CF6',
  '农药与植保产品': '#F59E0B',
  '农业机械': '#F97316',
  '劳保与防护用品': '#EC4899',
  '采收容器': '#64748B',
  '监测设备': '#10B981',
  '其他': '#9CA3AF'
}
const getCategoryColor = (cat) => COST_CATEGORY_COLOR_MAP[cat] || '#9CA3AF'

// 明细弹窗（V1.1 CostDetailModal）
const costDetailModalOpen = ref(false)
const costDetailTitle = ref('')
const costDetailData = ref([])
const onViewCostDetail = (dimension, value) => {
  costDetailData.value = getFilteredMaterialDetails(costFilteredRecords.value, dimension, value)
  costDetailTitle.value = `${value} 明细`
  costDetailModalOpen.value = true
}

onMounted(() => { loadApplicationData(); loadExecuteData(); loadMaterialStatistics() })
</script>