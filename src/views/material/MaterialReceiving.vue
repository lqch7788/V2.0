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
          <button class="h-9 px-3 rounded-md text-sm font-medium bg-amber-500 text-white hover:bg-amber-600" @click="handleReset"><RotateCcw class="w-4 h-4 inline mr-1" />重置</button>
        </div>
      </div>

      <!-- 数据表格 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">领料申请单列表</h3>
          <div class="flex gap-2">
            <button class="h-8 px-3 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700" @click="handleOpenAdd"><Plus class="w-4 h-4 inline mr-1" />新增</button>
            <button v-if="!batchEditMode && !deleteMode && !exportMode" class="h-8 px-3 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700" @click="batchEditMode = 'edit'; selectedRows = []"><Pencil class="w-4 h-4 inline mr-1" />编辑</button>
            <button v-if="!batchEditMode && !deleteMode && !exportMode" class="h-8 px-3 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700" @click="batchEditMode = 'delete'; selectedRows = []"><Trash2 class="w-4 h-4 inline mr-1" />删除</button>
            <button v-if="!batchEditMode && !deleteMode && !exportMode" class="h-8 px-3 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700" @click="exportMode = true; selectedRows = []"><Download class="w-4 h-4 inline mr-1" />导出</button>
            <button v-if="batchEditMode === 'edit' && selectedRows.length > 0" class="h-8 px-3 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700" @click="showBatchEditModal = true">确认编辑 ({{ selectedRows.length }}条)</button>
            <button v-if="batchEditMode === 'delete' && selectedRows.length > 0" class="h-8 px-3 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700" @click="showBatchDeleteConfirm = true">确认删除 ({{ selectedRows.length }}条)</button>
            <button v-if="batchEditMode || deleteMode || exportMode" class="h-8 px-3 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200" @click="batchEditMode = null; deleteMode = false; exportMode = false; selectedRows = []">取消</button>
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
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-300">
              <tr v-if="paginatedApplicationData.length === 0">
                <td :colspan="(batchEditMode || deleteMode || exportMode) ? 13 : 12" class="px-4 py-8 text-center text-gray-500">暂无数据</td>
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
                </tr>
                <!-- 展开行 - 严格对齐 V1.1 (ApplicationTab.tsx 第 437-486 行) -->
                <tr v-if="appExpandedRows.includes(row.id)" class="bg-white">
                  <td :colspan="(batchEditMode || deleteMode || exportMode) ? 13 : 12" class="px-4 py-3">
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
          <button class="h-9 px-3 rounded-md text-sm font-medium bg-amber-500 text-white hover:bg-amber-600" @click="exSearchCode = ''; exSearchApplicant = ''; exSearchBatchCode = ''; exSearchWarehouse = ''; exStatusFilter = 'all'">重置</button>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">出库单列表</h3>
          <div class="flex gap-2">
            <button class="h-8 px-3 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700" @click="handleOpenExAdd"><Plus class="w-4 h-4 inline mr-1" />新增</button>
            <button v-if="!exBatchEditMode" class="h-8 px-3 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700" @click="exBatchEditMode = 'edit'; exSelectedRows = []"><Pencil class="w-4 h-4 inline mr-1" />编辑</button>
            <button v-if="!exBatchEditMode" class="h-8 px-3 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700" @click="exBatchEditMode = 'delete'; exSelectedRows = []"><Trash2 class="w-4 h-4 inline mr-1" />删除</button>
            <button v-if="!exBatchEditMode" class="h-8 px-3 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700" @click="exExportMode = true; exSelectedRows = []"><Download class="w-4 h-4 inline mr-1" />导出</button>
            <button v-if="exBatchEditMode === 'edit' && exSelectedRows.length > 0" class="h-8 px-3 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700" @click="exShowBatchEditModal = true">确认编辑 ({{ exSelectedRows.length }}条)</button>
            <button v-if="exBatchEditMode === 'delete' && exSelectedRows.length > 0" class="h-8 px-3 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700" @click="exShowBatchDeleteConfirm = true">确认删除 ({{ exSelectedRows.length }}条)</button>
            <button v-if="exBatchEditMode || exExportMode" class="h-8 px-3 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200" @click="exBatchEditMode = null; exExportMode = false; exSelectedRows = []">取消</button>
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

    <!-- Tab 3: 领料统计 -->
    <div v-show="activeTab === 'statistics'" class="space-y-4">
      <div class="grid grid-cols-4 gap-4">
        <div v-for="card in statCards" :key="card.label" class="bg-white rounded-xl p-5 shadow-sm border-l-4" :style="{ borderColor: card.color }">
          <p class="text-sm text-gray-500">{{ card.label }}</p>
          <p class="text-2xl font-bold mt-1" :style="{ color: card.color }">{{ card.value }}</p>
          <p class="text-xs text-gray-400 mt-1">{{ card.subLabel }}</p>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm">
        <div class="border-b border-gray-100 px-6 pt-4">
          <div class="flex gap-6">
            <button v-for="st in statSubTabs" :key="st.key" @click="statActiveTab = st.key; statCurrentPage = 1"
              class="pb-3 text-sm font-medium border-b-2 transition-colors"
              :class="statActiveTab === st.key ? 'text-emerald-600 border-emerald-500' : 'text-gray-500 border-transparent hover:text-gray-700'"
            >{{ st.label }}</button>
          </div>
        </div>

        <!-- 月度汇总 -->
        <div v-if="statActiveTab === 'monthly'" class="p-4">
          <div class="flex flex-wrap gap-4 mb-4 items-end">
            <div><label class="block text-xs text-gray-500 mb-1">年度</label><select v-model="statYearFilter" class="px-3 py-2 border border-gray-400 rounded-lg text-sm bg-white w-[120px]" @change="statMonthFilter = 'all'"><option v-for="y in years" :key="y" :value="y">{{ y }}年</option></select></div>
            <div><label class="block text-xs text-gray-500 mb-1">月份</label><select v-model="statMonthFilter" class="px-3 py-2 border border-gray-400 rounded-lg text-sm bg-white w-[120px]" @change="statCurrentPage = 1"><option value="all">全部</option><option v-for="m in 12" :key="m" :value="String(m).padStart(2, '0')">{{ m }}月</option></select></div>
            <button class="h-8 px-3 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200" @click="statYearFilter = String(new Date().getFullYear()); statMonthFilter = 'all'">重置</button>
          </div>
          <table class="w-full border border-gray-200">
            <thead class="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
              <tr>
                <th class="px-4 py-2 text-left text-sm font-semibold w-12"></th>
                <th class="px-4 py-2 text-left text-sm font-semibold">月份</th>
                <th class="px-4 py-2 text-left text-sm font-semibold">总数量</th>
                <th class="px-4 py-2 text-left text-sm font-semibold">总金额(元)</th>
                <th class="px-4 py-2 text-left text-sm font-semibold">占比</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <template v-for="row in paginatedMonthData" :key="row.month">
                <tr class="hover:bg-gray-50">
                  <td class="px-4 py-2">
                    <button class="text-gray-500 hover:text-blue-600" @click="toggleMonthExpand(row.month)">
                      <ChevronDown v-if="expandedMonths.includes(row.month)" class="w-4 h-4" />
                      <ChevronRight v-else class="w-4 h-4" />
                    </button>
                  </td>
                  <td class="px-4 py-2 text-sm text-gray-800">{{ row.monthName }}</td>
                  <td class="px-4 py-2 text-sm text-gray-600">{{ row.totalQuantity }}</td>
                  <td class="px-4 py-2 text-sm text-gray-600">{{ (row.totalAmount || 0).toLocaleString() }}</td>
                  <td class="px-4 py-2 text-sm text-gray-600">{{ (row.percentage || 0).toFixed(1) }}%</td>
                </tr>
                <tr v-if="expandedMonths.includes(row.month)" class="bg-gray-50">
                  <td colspan="5" class="p-4">
                    <table class="w-full text-xs border border-gray-200">
                      <thead class="bg-gray-100">
                        <tr>
                          <th class="px-3 py-2 text-left font-semibold">物料分类</th>
                          <th class="px-3 py-2 text-left font-semibold">数量</th>
                          <th class="px-3 py-2 text-left font-semibold">金额(元)</th>
                          <th class="px-3 py-2 text-left font-semibold">占比</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-gray-200">
                        <tr v-for="d in getMonthDetails(row.month)" :key="d.categoryName">
                          <td class="px-3 py-2 text-gray-600">{{ d.categoryName }}</td>
                          <td class="px-3 py-2 text-gray-600">{{ d.quantity }}</td>
                          <td class="px-3 py-2 text-gray-600">{{ (d.amount || 0).toLocaleString() }}</td>
                          <td class="px-3 py-2 text-gray-600">{{ d.percentage.toFixed(1) }}%</td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
          <div class="mt-4 text-center text-sm text-gray-500">共 {{ monthData.length }} 条</div>
        </div>

        <!-- 分类汇总 -->
        <div v-if="statActiveTab === 'material'" class="p-4">
          <div class="flex flex-wrap gap-3 mb-4 items-end">
            <div><label class="block text-xs text-gray-500 mb-1">物料搜索</label><input v-model="statMaterialSearch" placeholder="编码/名称" class="px-3 py-2 border border-gray-400 rounded-lg text-sm w-[180px]" /></div>
            <div><label class="block text-xs text-gray-500 mb-1">部门</label><select v-model="statDepartmentFilter" multiple class="px-3 py-2 border border-gray-400 rounded-lg text-sm bg-white w-[150px]"><option v-for="d in departments" :key="d" :value="d">{{ d }}</option></select></div>
            <div><label class="block text-xs text-gray-500 mb-1">分类</label><select v-model="statCategoryFilter" multiple class="px-3 py-2 border border-gray-400 rounded-lg text-sm bg-white w-[150px]"><option v-for="c in statCategoryOptions" :key="c" :value="c">{{ c }}</option></select></div>
            <button class="h-8 px-3 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200" @click="statMaterialSearch = ''; statDepartmentFilter = []; statCategoryFilter = []">重置</button>
          </div>
          <table class="w-full border border-gray-200">
            <thead class="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
              <tr>
                <th class="px-4 py-2 text-left text-sm font-semibold">物料编码</th><th class="px-4 py-2 text-left text-sm font-semibold">物料名称</th><th class="px-4 py-2 text-left text-sm font-semibold">分类</th><th class="px-4 py-2 text-left text-sm font-semibold">规格</th><th class="px-4 py-2 text-left text-sm font-semibold">单位</th><th class="px-4 py-2 text-left text-sm font-semibold">供应商</th><th class="px-4 py-2 text-left text-sm font-semibold">批次号</th><th class="px-4 py-2 text-left text-sm font-semibold">领料部门</th><th class="px-4 py-2 text-left text-sm font-semibold">总数量</th><th class="px-4 py-2 text-left text-sm font-semibold">总金额</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="row in paginatedMaterialStatData" :key="row.materialCode" class="hover:bg-gray-50">
                <td class="px-4 py-2 text-sm text-gray-600">{{ row.materialCode }}</td><td class="px-4 py-2 text-sm text-gray-600">{{ row.materialName }}</td><td class="px-4 py-2 text-sm text-gray-600">{{ row.category }}</td><td class="px-4 py-2 text-sm text-gray-600">{{ row.spec }}</td><td class="px-4 py-2 text-sm text-gray-600">{{ row.unit }}</td><td class="px-4 py-2 text-sm text-gray-600">{{ row.supplier }}</td><td class="px-4 py-2 text-sm text-gray-600">{{ row.batchCode }}</td><td class="px-4 py-2 text-sm text-gray-600">{{ row.requisitionDepartment }}</td><td class="px-4 py-2 text-sm text-gray-600">{{ row.totalQuantity }}</td><td class="px-4 py-2 text-sm text-gray-600">¥{{ (row.totalAmount || 0).toLocaleString() }}</td>
              </tr>
            </tbody>
          </table>
          <div class="mt-4 flex items-center justify-between text-sm text-gray-500">
            <span>共 {{ filteredMaterialStatData.length }} 条</span>
            <Pagination :current-page="statCurrentPage" :total-pages="Math.ceil(filteredMaterialStatData.length / 10) || 1" :page-size="10" :page-size-options="[10]" :show-page-size="false" @page-change="(p) => statCurrentPage = p" @page-size-change="(s) => {}" />
          </div>
        </div>

        <!-- 部门汇总 -->
        <div v-if="statActiveTab === 'department'" class="p-4">
          <table class="w-full border border-gray-200">
            <thead class="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
              <tr>
                <th class="px-4 py-2 text-left text-sm font-semibold">申领人</th><th class="px-4 py-2 text-left text-sm font-semibold">部门</th><th class="px-4 py-2 text-left text-sm font-semibold">申领次数</th><th class="px-4 py-2 text-left text-sm font-semibold">申领单数</th><th class="px-4 py-2 text-left text-sm font-semibold">物料种类</th><th class="px-4 py-2 text-left text-sm font-semibold">领料总量</th><th class="px-4 py-2 text-left text-sm font-semibold">总金额(元)</th><th class="px-4 py-2 text-left text-sm font-semibold">平均每单量</th><th class="px-4 py-2 text-left text-sm font-semibold">平均金额</th><th class="px-4 py-2 text-left text-sm font-semibold">主要物料</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="row in filteredDepartmentData" :key="row.applicant" class="hover:bg-gray-50">
                <td class="px-4 py-2 text-sm text-gray-600">{{ row.applicant }}</td><td class="px-4 py-2 text-sm text-gray-600">{{ row.department }}</td><td class="px-4 py-2 text-sm text-gray-600">{{ row.requisitionCount }}</td><td class="px-4 py-2 text-sm text-gray-600">{{ row.requisitionOrders }}</td><td class="px-4 py-2 text-sm text-gray-600">{{ row.materialTypes }}</td><td class="px-4 py-2 text-sm text-gray-600">{{ row.totalQuantity }}</td><td class="px-4 py-2 text-sm text-gray-600">{{ row.totalAmount.toLocaleString() }}</td><td class="px-4 py-2 text-sm text-gray-600">{{ row.avgPerOrder }}</td><td class="px-4 py-2 text-sm text-gray-600">¥{{ row.avgAmount }}</td>
                <td class="px-4 py-2">
                  <div class="flex flex-wrap gap-1">
                    <span v-for="m in row.topMaterials" :key="m" class="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">{{ m }}</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="mt-4 text-center text-sm text-gray-500">共 {{ filteredDepartmentData.length }} 条</div>
        </div>

        <!-- 区域统计 -->
        <div v-if="statActiveTab === 'area'" class="p-4">
          <div class="flex gap-2 mb-4">
            <button class="h-8 px-3 rounded-md text-sm font-medium" :class="statAreaTab === 'greenhouse' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'" @click="statAreaTab = 'greenhouse'; statCurrentPage = 1">大棚统计</button>
            <button class="h-8 px-3 rounded-md text-sm font-medium" :class="statAreaTab === 'field' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'" @click="statAreaTab = 'field'; statCurrentPage = 1">大田统计</button>
            <button class="h-8 px-3 rounded-md text-sm font-medium" :class="statAreaTab === 'batch' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'" @click="statAreaTab = 'batch'; statCurrentPage = 1">种植批次统计</button>
          </div>

          <div v-if="statAreaTab === 'greenhouse'">
            <div class="flex gap-3 mb-3 items-end">
              <div><label class="block text-xs text-gray-500 mb-1">大棚类型</label><select v-model="statGreenhouseTypeFilter" class="px-3 py-2 border border-gray-400 rounded-lg text-sm bg-white w-[140px]"><option value="">全部</option><option value="玻璃温室">玻璃温室</option><option value="日光温室">日光温室</option><option value="塑料大棚">塑料大棚</option></select></div>
              <button class="h-8 px-3 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200" @click="statGreenhouseTypeFilter = ''">重置</button>
            </div>
            <table class="w-full border border-gray-200"><thead class="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white"><tr><th class="px-4 py-2 text-left text-sm font-semibold">大棚名称</th><th class="px-4 py-2 text-left text-sm font-semibold">类型</th><th class="px-4 py-2 text-left text-sm font-semibold">领料次数</th><th class="px-4 py-2 text-left text-sm font-semibold">物料种类</th><th class="px-4 py-2 text-left text-sm font-semibold">领料总量</th><th class="px-4 py-2 text-left text-sm font-semibold">总金额(元)</th><th class="px-4 py-2 text-left text-sm font-semibold">环比变化</th></tr></thead><tbody class="divide-y divide-gray-200"><tr v-for="row in filteredGreenhouseData" :key="row.greenhouse" class="hover:bg-gray-50"><td class="px-4 py-2 text-sm text-gray-600">{{ row.greenhouse }}</td><td class="px-4 py-2 text-sm text-gray-600">{{ row.greenhouseType }}</td><td class="px-4 py-2 text-sm text-gray-600">{{ row.requisitionCount }}</td><td class="px-4 py-2 text-sm text-gray-600">{{ row.materialTypes }}</td><td class="px-4 py-2 text-sm text-gray-600">{{ row.totalQuantity }}</td><td class="px-4 py-2 text-sm text-gray-600">{{ row.totalAmount.toLocaleString() }}</td><td class="px-4 py-2 text-sm"><span :class="(row.comparison?.lastMonth?.changeRate || 0) > 0 ? 'text-red-600' : 'text-green-600'">{{ row.comparison?.lastMonth?.changeRate > 0 ? '↑' : '↓' }}{{ row.comparison?.lastMonth?.changeRate || 0 }}%</span></td></tr></tbody></table>
            <div class="mt-4 text-center text-sm text-gray-500">共 {{ filteredGreenhouseData.length }} 条</div>
          </div>

          <div v-if="statAreaTab === 'field'"><table class="w-full border border-gray-200"><thead class="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white"><tr><th class="px-4 py-2 text-left text-sm font-semibold">地块</th><th class="px-4 py-2 text-left text-sm font-semibold">种植作物</th><th class="px-4 py-2 text-left text-sm font-semibold">领料次数</th><th class="px-4 py-2 text-left text-sm font-semibold">物料种类</th><th class="px-4 py-2 text-left text-sm font-semibold">领料总量</th><th class="px-4 py-2 text-left text-sm font-semibold">总金额(元)</th><th class="px-4 py-2 text-left text-sm font-semibold">环比变化</th></tr></thead><tbody class="divide-y divide-gray-200"><tr v-for="row in filteredFieldData" :key="row.field" class="hover:bg-gray-50"><td class="px-4 py-2 text-sm text-gray-600">{{ row.field }}</td><td class="px-4 py-2 text-sm text-gray-600">{{ row.crop }}</td><td class="px-4 py-2 text-sm text-gray-600">{{ row.requisitionCount }}</td><td class="px-4 py-2 text-sm text-gray-600">{{ row.materialTypes }}</td><td class="px-4 py-2 text-sm text-gray-600">{{ row.totalQuantity }}</td><td class="px-4 py-2 text-sm text-gray-600">{{ row.totalAmount.toLocaleString() }}</td><td class="px-4 py-2 text-sm"><span :class="(row.comparison?.lastMonth?.changeRate || 0) > 0 ? 'text-red-600' : 'text-green-600'">{{ row.comparison?.lastMonth?.changeRate > 0 ? '↑' : '↓' }}{{ row.comparison?.lastMonth?.changeRate || 0 }}%</span></td></tr></tbody></table><div class="mt-4 text-center text-sm text-gray-500">共 {{ filteredFieldData.length }} 条</div></div>

          <div v-if="statAreaTab === 'batch'"><table class="w-full border border-gray-200"><thead class="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white"><tr><th class="px-4 py-2 text-left text-sm font-semibold">批次号</th><th class="px-4 py-2 text-left text-sm font-semibold">种植作物</th><th class="px-4 py-2 text-left text-sm font-semibold">品种</th><th class="px-4 py-2 text-left text-sm font-semibold">种植区域</th><th class="px-4 py-2 text-left text-sm font-semibold">区域面积</th><th class="px-4 py-2 text-left text-sm font-semibold">计划周期</th><th class="px-4 py-2 text-left text-sm font-semibold">领料次数</th><th class="px-4 py-2 text-left text-sm font-semibold">物料种类</th><th class="px-4 py-2 text-left text-sm font-semibold">领料总量</th><th class="px-4 py-2 text-left text-sm font-semibold">总金额(元)</th></tr></thead><tbody class="divide-y divide-gray-200"><tr v-for="row in filteredBatchData" :key="row.batchCode" class="hover:bg-gray-50"><td class="px-4 py-2 text-sm text-gray-600">{{ row.batchCode }}</td><td class="px-4 py-2 text-sm text-gray-600">{{ row.cropName }}</td><td class="px-4 py-2 text-sm text-gray-600">{{ row.variety }}</td><td class="px-4 py-2 text-sm text-gray-600">{{ row.plantArea }}</td><td class="px-4 py-2 text-sm text-gray-600">{{ row.areaSize }}</td><td class="px-4 py-2 text-sm text-gray-600">{{ row.plannedStartDate }} ~ {{ row.plannedEndDate }}</td><td class="px-4 py-2 text-sm text-gray-600">{{ row.requisitionCount }}</td><td class="px-4 py-2 text-sm text-gray-600">{{ row.materialTypes }}</td><td class="px-4 py-2 text-sm text-gray-600">{{ row.totalQuantity }}</td><td class="px-4 py-2 text-sm text-gray-600">{{ row.totalAmount.toLocaleString() }}</td></tr></tbody></table><div class="mt-4 text-center text-sm text-gray-500">共 {{ filteredBatchData.length }} 条</div></div>
        </div>
      </div>
    </div>

    <!-- Tab 4: 成本核算 -->
    <div v-show="activeTab === 'cost'" class="space-y-4">
      <div class="bg-white rounded-xl shadow-sm border border-gray-100">
        <div class="border-b border-gray-100 px-6 pt-4">
          <div class="flex gap-6">
            <button v-for="ct in costSubTabs" :key="ct.key" @click="costActiveTab = ct.key"
              class="pb-3 text-sm font-medium border-b-2 transition-colors"
              :class="costActiveTab === ct.key ? 'text-emerald-600 border-emerald-500' : 'text-gray-500 border-transparent hover:text-gray-700'"
            >{{ ct.label }}</button>
          </div>
        </div>
      </div>

      <!-- 成本概览 -->
      <div v-if="costActiveTab === 'overview'">
        <div class="grid grid-cols-4 gap-4 mb-4">
          <div v-for="kpi in costKPIs" :key="kpi.label" class="bg-white rounded-xl p-5 shadow-sm">
            <p class="text-sm text-gray-500">{{ kpi.label }}</p>
            <p class="text-2xl font-bold mt-1 text-gray-900">{{ kpi.value }}</p>
            <p class="text-xs mt-1" :class="kpi.trend > 0 ? 'text-red-500' : 'text-green-500'">{{ kpi.trend > 0 ? '↑' : '↓' }} {{ Math.abs(kpi.trend) }}%</p>
          </div>
        </div>
        <div class="grid grid-cols-3 gap-4">
          <div class="bg-white rounded-xl p-5 shadow-sm">
            <h4 class="font-semibold text-gray-900 mb-4">分类成本构成</h4>
            <div class="space-y-3">
              <div v-for="cat in costCategoryData" :key="cat.name" class="flex items-center gap-3">
                <span class="text-sm text-gray-600 w-36 truncate">{{ cat.name }}</span>
                <div class="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden"><div class="h-full rounded-full" :style="{ width: cat.percentage + '%', backgroundColor: cat.color }"></div></div>
                <span class="text-sm font-medium text-gray-900 w-16 text-right">¥{{ (cat.amount * 10000).toLocaleString() }}</span>
                <span class="text-xs text-gray-500 w-12 text-right">{{ cat.percentage }}%</span>
              </div>
            </div>
          </div>
          <div class="col-span-2 bg-white rounded-xl p-5 shadow-sm">
            <h4 class="font-semibold text-gray-900 mb-4">月度成本趋势</h4>
            <div class="space-y-2">
              <div v-for="trend in costTrendData" :key="trend.month" class="flex items-center gap-2">
                <span class="text-xs text-gray-500 w-20">{{ trend.month }}</span>
                <div class="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden"><div class="h-full bg-emerald-500 rounded-full" :style="{ width: (trend.total / maxTrendQty * 100) + '%' }"></div></div>
                <span class="text-xs text-gray-700 w-20 text-right">{{ trend.total.toLocaleString() }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 分类对比 -->
      <div v-if="costActiveTab === 'comparison'">
        <div class="bg-white rounded-xl shadow-sm overflow-hidden"><div class="p-4 border-b border-gray-100"><h3 class="text-lg font-semibold text-gray-900">分类成本对比</h3></div><table class="w-full"><thead class="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white"><tr><th class="px-4 py-2 text-left text-sm font-semibold">物料分类</th><th class="px-4 py-2 text-left text-sm font-semibold">总金额(万元)</th><th class="px-4 py-2 text-left text-sm font-semibold">占比</th><th class="px-4 py-2 text-left text-sm font-semibold">环比</th></tr></thead><tbody class="divide-y divide-gray-200"><tr v-for="row in costCategoryData" :key="row.name" class="hover:bg-gray-50"><td class="px-4 py-2 text-sm text-gray-600">{{ row.name }}</td><td class="px-4 py-2 text-sm text-gray-600">{{ (row.amount || 0).toLocaleString() }}</td><td class="px-4 py-2 text-sm text-gray-600">{{ row.percentage }}%</td><td class="px-4 py-2 text-sm text-gray-600">{{ row.mom || '-' }}</td></tr></tbody></table></div>
        <div class="bg-white rounded-xl shadow-sm overflow-hidden mt-4"><div class="p-4 border-b border-gray-100"><h3 class="text-lg font-semibold text-gray-900">部门成本对比</h3></div><table class="w-full"><thead class="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white"><tr><th class="px-4 py-2 text-left text-sm font-semibold">部门</th><th class="px-4 py-2 text-left text-sm font-semibold">使用量</th><th class="px-4 py-2 text-left text-sm font-semibold">总金额(元)</th><th class="px-4 py-2 text-left text-sm font-semibold">占总成本</th></tr></thead><tbody class="divide-y divide-gray-200"><tr v-for="row in costDeptData" :key="row.department" class="hover:bg-gray-50"><td class="px-4 py-2 text-sm text-gray-600">{{ row.department }}</td><td class="px-4 py-2 text-sm text-gray-600">{{ row.totalQuantity }}</td><td class="px-4 py-2 text-sm text-gray-600">{{ row.totalAmount.toLocaleString() }}</td><td class="px-4 py-2 text-sm text-gray-600">{{ row.percentage }}%</td></tr></tbody></table></div>
        <div class="bg-white rounded-xl shadow-sm overflow-hidden mt-4"><div class="p-4 border-b border-gray-100"><h3 class="text-lg font-semibold text-gray-900">批次成本对比</h3></div><table class="w-full"><thead class="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white"><tr><th class="px-4 py-2 text-left text-sm font-semibold">批次号</th><th class="px-4 py-2 text-left text-sm font-semibold">种植作物</th><th class="px-4 py-2 text-left text-sm font-semibold">总金额(元)</th><th class="px-4 py-2 text-left text-sm font-semibold">占总成本</th></tr></thead><tbody class="divide-y divide-gray-200"><tr v-for="row in costBatchData" :key="row.batchCode" class="hover:bg-gray-50"><td class="px-4 py-2 text-sm text-gray-600">{{ row.batchCode }}</td><td class="px-4 py-2 text-sm text-gray-600">{{ row.cropName }}</td><td class="px-4 py-2 text-sm text-gray-600">{{ row.totalAmount.toLocaleString() }}</td><td class="px-4 py-2 text-sm text-gray-600">{{ row.percentage }}%</td></tr></tbody></table></div>
      </div>
    </div>

    <!-- ============ 申请领料 - 详情弹窗 ============ -->
    <div v-if="showDetailModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm" @click="showDetailModal = false">
      <div class="bg-white rounded-xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl" @click.stop><div class="px-6 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white flex items-center justify-between"><h3 class="text-lg font-semibold">领料单详情</h3><button @click="showDetailModal = false" class="text-white/80 hover:text-white text-2xl leading-none">&times;</button></div>
      <div class="p-6 overflow-y-auto max-h-[70vh]">
        <div v-if="selectedRecord" class="grid grid-cols-3 gap-0 border border-gray-200 rounded-lg overflow-hidden mb-4">
          <template v-for="(item, idx) in [{l:'领料单号',v:selectedRecord.code},{l:'申请日期',v:selectedRecord.date},{l:'申请人',v:selectedRecord.applicant},{l:'部门',v:selectedRecord.department},{l:'库存地点',v:selectedRecord.warehouseLocation},{l:'物料种类',v:selectedRecord.materials?.length > 0 ? selectedRecord.materials.length + '种' : '-'},{l:'种植区域/用途',v:selectedRecord.plantArea},{l:'审核人',v:selectedRecord.reviewer},{l:'生产计划批次号',v:selectedRecord.productionBatchCode}]" :key="idx">
            <span class="w-32 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 shrink-0 border-r border-gray-200">{{ item.l }}</span>
            <span class="px-3 py-2 text-sm text-gray-900 flex-1">{{ item.v }}</span>
          </template>
          <div class="flex border-b border-gray-200"><span class="w-32 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 shrink-0 border-r border-gray-200">状态</span><span class="px-3 py-2 text-sm flex-1"><span class="inline-flex px-2 py-1 rounded-full text-xs font-medium" :class="getAppStatusClass(selectedRecord?.status || '')">{{ selectedRecord?.status }}</span><p v-if="selectedRecord?.status === '已拒绝' && selectedRecord?.rejectReason" class="text-xs text-red-600 mt-1">拒绝原因：{{ selectedRecord.rejectReason }}</p></span></div>
        </div>
        <div class="mt-4"><h4 class="font-medium mb-2 text-sm text-gray-700">物料明细</h4>
          <div class="overflow-x-auto rounded-lg border border-gray-200"><table class="w-full text-xs"><thead class="bg-[#F2F6FA]"><tr><th class="px-3 py-2 text-left text-sm font-semibold text-blue-800">物料编码</th><th class="px-3 py-2 text-left text-sm font-semibold text-blue-800">物料名称</th><th class="px-3 py-2 text-left text-sm font-semibold text-blue-800">规格</th><th class="px-3 py-2 text-left text-sm font-semibold text-blue-800">单位</th><th class="px-3 py-2 text-left text-sm font-semibold text-blue-800">申领数量</th><th class="px-3 py-2 text-left text-sm font-semibold text-blue-800">当前库存</th><th class="px-3 py-2 text-left text-sm font-semibold text-blue-800">单价(元)</th><th class="px-3 py-2 text-left text-sm font-semibold text-blue-800">小计(元)</th><th class="px-3 py-2 text-left text-sm font-semibold text-blue-800">仓库货位</th><th class="px-3 py-2 text-left text-sm font-semibold text-blue-800">备注</th></tr></thead><tbody class="divide-y divide-gray-200"><tr v-for="m in (selectedRecord?.materials || [])" :key="m.materialCode" class="hover:bg-emerald-100"><td class="px-3 py-2 text-sm text-blue-700 font-mono">{{ m.materialCode }}</td><td class="px-3 py-2 text-sm text-blue-700">{{ m.materialName }}</td><td class="px-3 py-2 text-sm text-blue-700">{{ m.spec }}</td><td class="px-3 py-2 text-sm text-blue-700">{{ m.unit }}</td><td class="px-3 py-2 text-sm" :class="m.requestedQuantity > m.stockQuantity ? 'text-red-600 font-bold' : 'text-blue-700'">{{ m.requestedQuantity }}{{ m.requestedQuantity > m.stockQuantity ? ' (!)' : '' }}</td><td class="px-3 py-2 text-sm text-blue-700">{{ m.stockQuantity }}</td><td class="px-3 py-2 text-sm text-blue-700">{{ (m.unitPrice || 0).toFixed(2) }}</td><td class="px-3 py-2 text-sm text-blue-700">{{ (m.requestedQuantity * (m.unitPrice || 0)).toFixed(2) }}</td><td class="px-3 py-2 text-sm text-blue-700">{{ m.warehousePosition }}</td><td class="px-3 py-2 text-sm text-blue-700">{{ m.remark || '-' }}</td></tr></tbody></table></div>
        </div></div>
      <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end"><button class="h-8 px-4 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200" @click="showDetailModal = false">关闭</button></div></div>
    </div>

    <!-- ============ 新增弹窗 ============ -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm" @click="showAddModal = false; resetAddForm()">
      <div class="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col" @click.stop><div class="px-6 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white flex items-center justify-between flex-shrink-0"><h3 class="text-lg font-semibold">新增领料单</h3><button @click="showAddModal = false; resetAddForm()" class="text-white/80 hover:text-white text-2xl leading-none">&times;</button></div>
      <div class="p-6 overflow-y-auto flex-1">
        <div class="grid grid-cols-3 gap-4 mb-4">
          <div><label class="block text-sm text-gray-700 mb-1">领料单号</label><div class="flex gap-2"><input v-model="addForm.code" readonly placeholder="点击生成获取单号" class="flex-1 px-3 py-2 border border-gray-400 rounded-lg text-sm bg-gray-50" /><button class="h-10 px-4 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700" @click="handleGenerateAddCode" title="生成领料单号">生成</button></div></div>
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
        <div class="mb-2 flex gap-2"><button class="h-8 px-3 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700" @click="handleAddMaterial"><Plus class="w-4 h-4 inline mr-1" />添加物料</button></div>
        <div v-if="addForm.materials.length > 0" class="overflow-x-auto rounded-lg border border-gray-200"><table class="text-xs" style="min-width:1400px"><thead class="bg-[#F2F6FA]"><tr><th class="px-2 py-2 text-left text-sm font-semibold text-blue-800">物料编码</th><th class="px-2 py-2 text-left text-sm font-semibold text-blue-800">物料名称</th><th class="px-2 py-2 text-left text-sm font-semibold text-blue-800">规格</th><th class="px-2 py-2 text-left text-sm font-semibold text-blue-800">单位</th><th class="px-2 py-2 text-left text-sm font-semibold text-blue-800">申领数量</th><th class="px-2 py-2 text-left text-sm font-semibold text-blue-800">当前库存</th><th class="px-2 py-2 text-left text-sm font-semibold text-blue-800">单价(元)</th><th class="px-2 py-2 text-left text-sm font-semibold text-blue-800">小计(元)</th><th class="px-2 py-2 text-left text-sm font-semibold text-blue-800">仓库货位</th><th class="px-2 py-2 text-left text-sm font-semibold text-blue-800">备注</th><th class="px-2 py-2 text-left text-sm font-semibold text-blue-800">操作</th></tr></thead><tbody class="divide-y divide-gray-200"><tr v-for="(m, $index) in addForm.materials" :key="$index"><td class="px-1 py-1"><input v-model="m.materialCode" class="w-24 h-6 px-1 border border-gray-200 rounded text-xs" @change="onAddMaterialCodeChange(m)" /></td><td class="px-1 py-1"><input v-model="m.materialName" class="w-24 h-6 px-1 border border-gray-200 rounded text-xs" @change="onAddMaterialNameChange(m)" /></td><td class="px-1 py-1"><input v-model="m.spec" class="w-16 h-6 px-1 border border-gray-200 rounded text-xs" /></td><td class="px-1 py-1"><input v-model="m.unit" class="w-14 h-6 px-1 border border-gray-200 rounded text-xs" /></td><td class="px-1 py-1"><input v-model.number="m.requestedQuantity" type="number" min="1" class="w-20 h-6 px-1 border border-gray-200 rounded text-xs" /></td><td class="px-1 py-1"><input v-model.number="m.stockQuantity" type="number" min="0" class="w-20 h-6 px-1 border border-gray-200 rounded text-xs" /></td><td class="px-1 py-1"><input v-model.number="m.unitPrice" type="number" min="0" step="0.01" class="w-20 h-6 px-1 border border-gray-200 rounded text-xs" /></td><td class="px-1 py-1"><span class="text-xs text-blue-700">{{ (m.requestedQuantity * (m.unitPrice || 0)).toFixed(2) }}</span></td><td class="px-1 py-1"><input v-model="m.warehousePosition" class="w-24 h-6 px-1 border border-gray-200 rounded text-xs" /></td><td class="px-1 py-1"><input v-model="m.remark" class="w-20 h-6 px-1 border border-gray-200 rounded text-xs" /></td><td class="px-1 py-1"><button class="text-red-600 hover:text-red-800 text-xs" @click="addForm.materials.splice($index, 1)">删除</button></td></tr></tbody></table></div>
        <div v-else class="text-center py-8 text-gray-500 text-sm">暂无物料，请点击"添加物料"添加</div>
      </div>
      <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 flex-shrink-0"><button class="h-8 px-4 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200" @click="showAddModal = false; resetAddForm()">取消</button><button class="h-8 px-4 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700" @click="handleSaveAdd">保存</button></div></div>
    </div>

    <!-- ============ 编辑弹窗 ============ -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm" @click="showEditModal = false">
      <div class="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col" @click.stop><div class="px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white flex items-center justify-between flex-shrink-0"><h3 class="text-lg font-semibold">编辑领料单</h3><button @click="showEditModal = false" class="text-white/80 hover:text-white text-2xl leading-none">&times;</button></div>
      <div class="p-6 overflow-y-auto flex-1">
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
        <div class="mb-2"><button class="h-8 px-3 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700" @click="handleEditAddMaterial"><Plus class="w-4 h-4 inline mr-1" />添加物料</button></div>
        <div v-if="editForm.materials.length > 0" class="overflow-x-auto rounded-lg border border-gray-200"><table class="text-xs" style="min-width:1400px"><thead class="bg-[#F2F6FA]"><tr><th class="px-2 py-2 text-left text-sm font-semibold text-blue-800">物料编码</th><th class="px-2 py-2 text-left text-sm font-semibold text-blue-800">物料名称</th><th class="px-2 py-2 text-left text-sm font-semibold text-blue-800">规格</th><th class="px-2 py-2 text-left text-sm font-semibold text-blue-800">单位</th><th class="px-2 py-2 text-left text-sm font-semibold text-blue-800">申领数量</th><th class="px-2 py-2 text-left text-sm font-semibold text-blue-800">当前库存</th><th class="px-2 py-2 text-left text-sm font-semibold text-blue-800">单价(元)</th><th class="px-2 py-2 text-left text-sm font-semibold text-blue-800">小计(元)</th><th class="px-2 py-2 text-left text-sm font-semibold text-blue-800">仓库货位</th><th class="px-2 py-2 text-left text-sm font-semibold text-blue-800">备注</th><th class="px-2 py-2 text-left text-sm font-semibold text-blue-800">操作</th></tr></thead><tbody class="divide-y divide-gray-200"><tr v-for="(m, $index) in editForm.materials" :key="$index"><td class="px-1 py-1"><input v-model="m.materialCode" class="w-24 h-6 px-1 border border-gray-200 rounded text-xs" @change="onEditMaterialCodeChangeRow(m)" /></td><td class="px-1 py-1"><input v-model="m.materialName" class="w-24 h-6 px-1 border border-gray-200 rounded text-xs" /></td><td class="px-1 py-1"><input v-model="m.spec" class="w-16 h-6 px-1 border border-gray-200 rounded text-xs" /></td><td class="px-1 py-1"><input v-model="m.unit" class="w-14 h-6 px-1 border border-gray-200 rounded text-xs" /></td><td class="px-1 py-1"><input v-model.number="m.requestedQuantity" type="number" min="1" class="w-20 h-6 px-1 border border-gray-200 rounded text-xs" /></td><td class="px-1 py-1"><input v-model.number="m.stockQuantity" type="number" min="0" class="w-20 h-6 px-1 border border-gray-200 rounded text-xs" /></td><td class="px-1 py-1"><input v-model.number="m.unitPrice" type="number" min="0" step="0.01" class="w-20 h-6 px-1 border border-gray-200 rounded text-xs" /></td><td class="px-1 py-1"><span class="text-xs text-blue-700">{{ (m.requestedQuantity * (m.unitPrice || 0)).toFixed(2) }}</span></td><td class="px-1 py-1"><input v-model="m.warehousePosition" class="w-24 h-6 px-1 border border-gray-200 rounded text-xs" /></td><td class="px-1 py-1"><input v-model="m.remark" class="w-20 h-6 px-1 border border-gray-200 rounded text-xs" /></td><td class="px-1 py-1"><button class="text-red-600 hover:text-red-800 text-xs" @click="editForm.materials.splice($index, 1)">删除</button></td></tr></tbody></table></div>
        <div v-else class="text-center py-8 text-gray-500 text-sm">暂无物料</div>
      </div>
      <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 flex-shrink-0"><button class="h-8 px-4 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200" @click="showEditModal = false">取消</button><button class="h-8 px-4 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700" @click="handleSaveEdit">保存</button></div></div>
    </div>

    <!-- ============ 删除确认弹窗 ============ -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm" @click="showDeleteConfirm = false">
      <div class="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-hidden shadow-2xl" @click.stop><div class="px-6 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white flex items-center justify-between"><h3 class="text-lg font-semibold">确认删除</h3><button @click="showDeleteConfirm = false" class="text-white/80 hover:text-white text-2xl leading-none">&times;</button></div>
      <div class="p-6"><div class="flex items-center gap-3"><AlertTriangle class="w-10 h-10 text-red-500" /><div><p class="text-lg font-medium">确定要删除该领料单吗？</p><p class="text-sm text-gray-500">此操作不可恢复</p></div></div></div>
      <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3"><button class="h-8 px-4 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200" @click="showDeleteConfirm = false">取消</button><button class="h-8 px-4 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700" @click="confirmDelete">确认删除</button></div></div>
    </div>

    <!-- ============ 作废弹窗 ============ -->
    <div v-if="showVoidModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm" @click="showVoidModal = false">
      <div class="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl" @click.stop><div class="px-6 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white flex items-center justify-between"><h3 class="text-lg font-semibold">作废申请</h3><button @click="showVoidModal = false" class="text-white/80 hover:text-white text-2xl leading-none">&times;</button></div>
      <div class="p-6">
        <div class="mb-4"><label class="block text-sm text-gray-700 mb-1">领料单号</label><span class="text-gray-700">{{ selectedRecord?.code }}</span></div>
        <div class="mb-4"><label class="block text-sm text-gray-700 mb-1">作废原因 <span class="text-red-500">*</span></label><textarea v-model="voidReason" :rows="3" placeholder="请填写作废原因" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm resize-none"></textarea></div>
      </div>
      <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3"><button class="h-8 px-4 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200" @click="showVoidModal = false">取消</button><button class="h-8 px-4 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700" @click="submitVoid">确认作废</button></div></div>
    </div>

    <!-- ============ 批量编辑弹窗 ============ -->
    <div v-if="showBatchEditModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm" @click="showBatchEditModal = false">
      <div class="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl" @click.stop><div class="px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white flex items-center justify-between"><h3 class="text-lg font-semibold">批量编辑领料单</h3><button @click="showBatchEditModal = false" class="text-white/80 hover:text-white text-2xl leading-none">&times;</button></div>
      <div class="p-6"><p class="text-sm text-blue-600 mb-4">已选择 <strong>{{ selectedRows.length }}</strong> 条领料单，修改以下字段将应用到所有选中记录</p>
        <div class="grid grid-cols-2 gap-4">
          <div><label class="block text-sm text-gray-700 mb-1">库存地点</label><select v-model="batchEditForm.warehouseLocation" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm bg-white"><option value="">不修改</option><option v-for="w in warehouses" :key="w" :value="w">{{ w }}</option></select></div>
          <div><label class="block text-sm text-gray-700 mb-1">审核人</label><input v-model="batchEditForm.reviewer" placeholder="不修改" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm" /></div>
          <div><label class="block text-sm text-gray-700 mb-1">生产批次号</label><select v-model="batchEditForm.productionBatchCode" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm bg-white"><option value="">不修改</option><option v-for="b in PRODUCTION_BATCH_CODES" :key="b" :value="b">{{ b }}</option></select></div>
          <div><label class="block text-sm text-gray-700 mb-1">状态</label><select v-model="batchEditForm.status" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm bg-white"><option value="">不修改</option><option value="待审批">待审批</option><option value="已审批">已审批</option><option value="已作废">已作废</option></select></div>
        </div>
      </div>
      <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3"><button class="h-8 px-4 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200" @click="showBatchEditModal = false">取消</button><button class="h-8 px-4 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700" @click="handleBatchEditSave">保存 ({{ selectedRows.length }}条)</button></div></div>
    </div>

    <!-- ============ 批量删除确认弹窗 ============ -->
    <div v-if="showBatchDeleteConfirm" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm" @click="showBatchDeleteConfirm = false">
      <div class="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-hidden shadow-2xl" @click.stop><div class="px-6 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white flex items-center justify-between"><h3 class="text-lg font-semibold">批量删除</h3><button @click="showBatchDeleteConfirm = false" class="text-white/80 hover:text-white text-2xl leading-none">&times;</button></div>
      <div class="p-6"><p class="text-lg">确定要删除选中的 {{ selectedRows.length }} 条领料单吗？</p><p class="text-sm text-gray-500 mt-1">此操作不可恢复</p></div>
      <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3"><button class="h-8 px-4 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200" @click="showBatchDeleteConfirm = false">取消</button><button class="h-8 px-4 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700" @click="handleBatchDelete">确认删除</button></div></div>
    </div>

    <!-- ============ 导出格式弹窗 ============ -->
    <div v-if="showExportTypeModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm" @click="showExportTypeModal = false">
      <div class="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl" @click.stop><div class="px-6 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white flex items-center justify-between"><h3 class="text-lg font-semibold">选择导出格式</h3><button @click="showExportTypeModal = false" class="text-white/80 hover:text-white text-2xl leading-none">&times;</button></div>
      <div class="p-6"><p class="text-sm text-gray-500 mb-4">{{ selectedRows.length > 0 ? `已选择 ${selectedRows.length} 条数据` : `共 ${filteredApplicationData.length} 条数据` }}</p>
        <div class="space-y-3">
          <div v-for="f in exportFormats" :key="f.value" class="flex items-center p-3 border rounded-lg cursor-pointer" :class="exportFileType === f.value ? 'border-green-500 bg-green-50' : 'border-gray-200'" @click="exportFileType = f.value">
            <input type="radio" :value="f.value" v-model="exportFileType" class="w-4 h-4 text-green-600 border-gray-400" />
            <span class="ml-2 font-medium">{{ f.label }}</span>
            <span class="block text-xs text-gray-500 ml-2">{{ f.desc }}</span>
          </div>
        </div>
      </div>
      <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3"><button class="h-8 px-4 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200" @click="showExportTypeModal = false">取消</button><button class="h-8 px-4 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700" @click="confirmExport">导出</button></div></div>
    </div>

    <!-- ============ 出库 - 详情弹窗 ============ -->
    <div v-if="exShowDetailModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm" @click="exShowDetailModal = false">
      <div class="bg-white rounded-xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl" @click.stop><div class="px-6 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white flex items-center justify-between"><h3 class="text-lg font-semibold">出库单详情</h3><button @click="exShowDetailModal = false" class="text-white/80 hover:text-white text-2xl leading-none">&times;</button></div>
      <div class="p-6 overflow-y-auto max-h-[70vh]">
        <div class="grid grid-cols-3 gap-0 border border-gray-200 rounded-lg overflow-hidden mb-4">
          <template v-for="(item, idx) in [{l:'出库单号',v:exSelectedRecord?.code},{l:'申请日期',v:exSelectedRecord?.date},{l:'申请人',v:exSelectedRecord?.applicant},{l:'库存地点',v:exSelectedRecord?.warehouseLocation},{l:'审核人',v:exSelectedRecord?.reviewer},{l:'操作人',v:exSelectedRecord?.operator},{l:'生产计划批次号',v:exSelectedRecord?.productionBatchCode},{l:'来源申请单',v:(exSelectedRecord?.sourceApplicationCodes || []).join(', ')}]" :key="idx"><span class="w-28 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 shrink-0 border-r border-gray-200">{{ item.l }}</span><span class="px-3 py-2 text-sm text-gray-900 flex-1">{{ item.v }}</span></template>
          <div class="flex border-b border-gray-200"><span class="w-28 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 shrink-0 border-r border-gray-200">执行状态</span><span class="px-3 py-2 text-sm flex-1"><span class="inline-flex px-2 py-1 rounded-full text-xs font-medium" :class="getExStatusClass(exSelectedRecord?.executeStatus || '')">{{ exSelectedRecord?.executeStatus }}</span></span></div>
        </div>
        <div class="mt-4"><h4 class="font-medium mb-2 text-sm text-gray-700">出库物料明细</h4>
          <div class="overflow-x-auto rounded-lg border border-gray-200"><table class="w-full text-xs"><thead class="bg-[#F2F6FA]"><tr><th class="px-3 py-2 text-left text-sm font-semibold text-blue-800">来源领料单号</th><th class="px-3 py-2 text-left text-sm font-semibold text-blue-800">物料编码</th><th class="px-3 py-2 text-left text-sm font-semibold text-blue-800">物料名称</th><th class="px-3 py-2 text-left text-sm font-semibold text-blue-800">批次号</th><th class="px-3 py-2 text-left text-sm font-semibold text-blue-800">规格</th><th class="px-3 py-2 text-left text-sm font-semibold text-blue-800">单位</th><th class="px-3 py-2 text-left text-sm font-semibold text-blue-800">申请数量</th><th class="px-3 py-2 text-left text-sm font-semibold text-blue-800">实际库存</th><th class="px-3 py-2 text-left text-sm font-semibold text-blue-800">本次实发</th><th class="px-3 py-2 text-left text-sm font-semibold text-blue-800">单价(元)</th><th class="px-3 py-2 text-left text-sm font-semibold text-blue-800">小计(元)</th><th class="px-3 py-2 text-left text-sm font-semibold text-blue-800">仓库货位</th><th class="px-3 py-2 text-left text-sm font-semibold text-blue-800">差异</th><th class="px-3 py-2 text-left text-sm font-semibold text-blue-800">备注</th></tr></thead><tbody class="divide-y divide-gray-200"><tr v-for="m in (exSelectedRecord?.materials || [])" :key="m.materialCode" class="hover:bg-emerald-100"><td class="px-3 py-2 text-sm text-blue-700 font-mono">{{ m.applicationCode }}</td><td class="px-3 py-2 text-sm text-blue-700 font-mono">{{ m.materialCode }}</td><td class="px-3 py-2 text-sm text-blue-700">{{ m.materialName }}</td><td class="px-3 py-2 text-sm text-blue-700 font-mono">{{ m.batchNo || '-' }}</td><td class="px-3 py-2 text-sm text-blue-700">{{ m.spec }}</td><td class="px-3 py-2 text-sm text-blue-700">{{ m.unit }}</td><td class="px-3 py-2 text-sm text-blue-700">{{ m.requestedQuantity }}</td><td class="px-3 py-2 text-sm text-blue-700"><span :class="m.stockQuantity < m.requestedQuantity ? 'text-red-600 font-medium' : 'text-green-600'">{{ m.stockQuantity }}</span></td><td class="px-3 py-2 text-sm text-blue-700"><span v-if="m.actualQuantity > 0" :class="m.actualQuantity < m.requestedQuantity ? 'text-amber-600 font-medium' : 'text-green-600'">{{ m.actualQuantity }}</span><span v-else :class="m.stockQuantity === 0 ? 'text-red-600 font-medium' : 'text-gray-400'">{{ m.actualQuantity }}</span></td><td class="px-3 py-2 text-sm text-blue-700">{{ (m.unitPrice || 0).toFixed(2) }}</td><td class="px-3 py-2 text-sm text-blue-700">{{ ((m.requestedQuantity || 0) * (m.unitPrice || 0)).toFixed(2) }}</td><td class="px-3 py-2 text-sm text-blue-700">{{ m.warehousePosition || '-' }}</td><td class="px-3 py-2 text-sm"><span v-if="(m.requestedQuantity || 0) - (m.actualQuantity || 0) > 0" class="text-red-600 font-medium">-{{ (m.requestedQuantity || 0) - (m.actualQuantity || 0) }}</span><span v-else class="text-green-600">0</span></td><td class="px-3 py-2 text-sm text-blue-700">{{ m.remark || '-' }}</td></tr></tbody></table></div>
        </div></div>
      <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end"><button class="h-8 px-4 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200" @click="exShowDetailModal = false">关闭</button></div></div>
    </div>

    <!-- ============ 出库 - 新增弹窗 ============ -->
    <div v-if="exShowAddModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm" @click="exShowAddModal = false; resetExAddForm()">
      <div class="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col" @click.stop><div class="px-6 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white flex items-center justify-between flex-shrink-0"><h3 class="text-lg font-semibold">新增出库单</h3><button @click="exShowAddModal = false; resetExAddForm()" class="text-white/80 hover:text-white text-2xl leading-none">&times;</button></div>
      <div class="p-6 overflow-y-auto flex-1">
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
              <button class="h-8 px-3 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700" @click="handleAddToPool">添加到物料池</button>
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
      <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 flex-shrink-0"><button class="h-8 px-4 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200" @click="exShowAddModal = false; resetExAddForm()">取消</button><button class="h-8 px-4 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700" @click="handleExSaveAdd">保存</button></div></div>
    </div>

    <!-- ============ 出库 - 编辑弹窗 ============ -->
    <div v-if="exShowEditModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm" @click="exShowEditModal = false">
      <div class="bg-white rounded-xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col" @click.stop><div class="px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white flex items-center justify-between flex-shrink-0"><h3 class="text-lg font-semibold">编辑出库单</h3><button @click="exShowEditModal = false" class="text-white/80 hover:text-white text-2xl leading-none">&times;</button></div>
      <div class="p-6 overflow-y-auto flex-1">
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
        <div class="mb-2"><button class="h-8 px-3 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700" @click="exEditForm.materials.push({ materialCode:'', materialName:'', batchNo:'', spec:'', unit:'', category:'', requestedQuantity:0, stockQuantity:0, actualQuantity:0, unitPrice:0, warehousePosition:'', remark:'', applicationCode:'' })"><Plus class="w-4 h-4 inline mr-1" />添加物料</button></div>
        <div class="overflow-x-auto rounded-lg border border-gray-200"><table class="text-xs" style="min-width:1500px"><thead class="bg-[#F2F6FA]"><tr><th class="px-2 py-2 text-left text-sm font-semibold text-blue-800">来源领料单号</th><th class="px-2 py-2 text-left text-sm font-semibold text-blue-800">物料编码</th><th class="px-2 py-2 text-left text-sm font-semibold text-blue-800">物料名称</th><th class="px-2 py-2 text-left text-sm font-semibold text-blue-800">批次号</th><th class="px-2 py-2 text-left text-sm font-semibold text-blue-800">规格</th><th class="px-2 py-2 text-left text-sm font-semibold text-blue-800">单位</th><th class="px-2 py-2 text-left text-sm font-semibold text-blue-800">申请数量</th><th class="px-2 py-2 text-left text-sm font-semibold text-blue-800">实际库存</th><th class="px-2 py-2 text-left text-sm font-semibold text-blue-800">本次实发</th><th class="px-2 py-2 text-left text-sm font-semibold text-blue-800">单价(元)</th><th class="px-2 py-2 text-left text-sm font-semibold text-blue-800">小计(元)</th><th class="px-2 py-2 text-left text-sm font-semibold text-blue-800">仓库货位</th><th class="px-2 py-2 text-left text-sm font-semibold text-blue-800">备注</th><th class="px-2 py-2 text-left text-sm font-semibold text-blue-800">操作</th></tr></thead><tbody class="divide-y divide-gray-200"><tr v-for="(row, $index) in exEditForm.materials" :key="$index"><td class="px-1 py-1"><input v-model="row.applicationCode" readonly class="w-24 h-6 px-1 border border-gray-200 rounded text-xs bg-gray-50 font-mono" /></td><td class="px-1 py-1"><input v-model="row.materialCode" class="w-24 h-6 px-1 border border-gray-200 rounded text-xs" /></td><td class="px-1 py-1"><input v-model="row.materialName" class="w-24 h-6 px-1 border border-gray-200 rounded text-xs" /></td><td class="px-1 py-1"><input v-model="row.batchNo" class="w-24 h-6 px-1 border border-gray-200 rounded text-xs font-mono" /></td><td class="px-1 py-1"><input v-model="row.spec" class="w-16 h-6 px-1 border border-gray-200 rounded text-xs" /></td><td class="px-1 py-1"><input v-model="row.unit" class="w-14 h-6 px-1 border border-gray-200 rounded text-xs" /></td><td class="px-1 py-1"><input v-model.number="row.requestedQuantity" type="number" min="0" class="w-20 h-6 px-1 border border-gray-200 rounded text-xs" /></td><td class="px-1 py-1"><input v-model.number="row.stockQuantity" type="number" min="0" class="w-20 h-6 px-1 border border-gray-200 rounded text-xs" /></td><td class="px-1 py-1"><input v-model.number="row.actualQuantity" type="number" min="0" class="w-20 h-6 px-1 border border-gray-200 rounded text-xs" /></td><td class="px-1 py-1"><input v-model.number="row.unitPrice" type="number" min="0" step="0.01" class="w-20 h-6 px-1 border border-gray-200 rounded text-xs" /></td><td class="px-1 py-1"><span class="text-xs text-blue-700">{{ ((row.requestedQuantity || 0) * (row.unitPrice || 0)).toFixed(2) }}</span></td><td class="px-1 py-1"><input v-model="row.warehousePosition" class="w-24 h-6 px-1 border border-gray-200 rounded text-xs" /></td><td class="px-1 py-1"><input v-model="row.remark" class="w-20 h-6 px-1 border border-gray-200 rounded text-xs" /></td><td class="px-1 py-1"><button class="text-red-600 hover:text-red-800 text-xs" @click="exEditForm.materials.splice($index, 1)">删除</button></td></tr></tbody></table></div>
      </div>
      <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 flex-shrink-0"><button class="h-8 px-4 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200" @click="exShowEditModal = false">取消</button><button class="h-8 px-4 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700" @click="handleExSaveEdit">保存</button></div></div>
    </div>

    <!-- ============ 出库 - 删除确认弹窗 ============ -->
    <div v-if="exShowDeleteConfirm" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm" @click="exShowDeleteConfirm = false">
      <div class="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-hidden shadow-2xl" @click.stop><div class="px-6 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white flex items-center justify-between"><h3 class="text-lg font-semibold">确认删除</h3><button @click="exShowDeleteConfirm = false" class="text-white/80 hover:text-white text-2xl leading-none">&times;</button></div>
      <div class="p-6"><div class="flex items-center gap-3"><AlertTriangle class="w-10 h-10 text-red-500" /><div><p class="text-lg font-medium">确定要删除该出库单吗？</p><p class="text-sm text-gray-500">此操作不可恢复</p></div></div></div>
      <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3"><button class="h-8 px-4 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200" @click="exShowDeleteConfirm = false">取消</button><button class="h-8 px-4 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700" @click="confirmExDelete">确认删除</button></div></div>
    </div>

    <!-- ============ 出库导出弹窗 ============ -->
    <div v-if="exShowExportTypeModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm" @click="exShowExportTypeModal = false">
      <div class="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl" @click.stop><div class="px-6 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white flex items-center justify-between"><h3 class="text-lg font-semibold">选择导出格式</h3><button @click="exShowExportTypeModal = false" class="text-white/80 hover:text-white text-2xl leading-none">&times;</button></div>
      <div class="p-6"><div class="space-y-3">
        <div v-for="f in exportFormats" :key="f.value" class="flex items-center p-3 border rounded-lg cursor-pointer" :class="exExportFileType === f.value ? 'border-green-500 bg-green-50' : 'border-gray-200'" @click="exExportFileType = f.value"><input type="radio" :value="f.value" v-model="exExportFileType" class="w-4 h-4 text-green-600 border-gray-400" /><span class="ml-2 font-medium">{{ f.label }}</span><span class="block text-xs text-gray-500 ml-2">{{ f.desc }}</span></div>
      </div></div>
      <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3"><button class="h-8 px-4 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200" @click="exShowExportTypeModal = false">取消</button><button class="h-8 px-4 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700" @click="confirmExExport">导出</button></div></div>
    </div>

    <!-- ============ 出库 - 批量编辑弹窗 ============ -->
    <div v-if="exShowBatchEditModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm" @click="exShowBatchEditModal = false">
      <div class="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl" @click.stop><div class="px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white flex items-center justify-between"><h3 class="text-lg font-semibold">批量编辑出库单</h3><button @click="exShowBatchEditModal = false" class="text-white/80 hover:text-white text-2xl leading-none">&times;</button></div>
      <div class="p-6"><p class="text-sm text-blue-600 mb-4">已选择 <strong>{{ exSelectedRows.length }}</strong> 条出库单，修改以下字段将应用到所有选中记录</p>
        <div class="grid grid-cols-2 gap-4">
          <div><label class="block text-sm text-gray-700 mb-1">仓库地点</label><select v-model="exBatchEditForm.warehouseLocation" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm bg-white"><option value="">不修改</option><option v-for="w in warehouses" :key="w" :value="w">{{ w }}</option></select></div>
          <div><label class="block text-sm text-gray-700 mb-1">审核人</label><input v-model="exBatchEditForm.reviewer" placeholder="不修改" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm" /></div>
          <div><label class="block text-sm text-gray-700 mb-1">生产批次号</label><select v-model="exBatchEditForm.productionBatchCode" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm bg-white"><option value="">不修改</option><option v-for="b in PRODUCTION_BATCH_CODES" :key="b" :value="b">{{ b }}</option></select></div>
          <div><label class="block text-sm text-gray-700 mb-1">执行状态</label><select v-model="exBatchEditForm.executeStatus" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm bg-white"><option value="">不修改</option><option value="已出库">已出库</option><option value="部分出库">部分出库</option><option value="待出库">待出库</option><option value="已取消">已取消</option></select></div>
        </div>
      </div>
      <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3"><button class="h-8 px-4 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200" @click="exShowBatchEditModal = false">取消</button><button class="h-8 px-4 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700" @click="handleExBatchEditSave">保存 ({{ exSelectedRows.length }}条)</button></div></div>
    </div>

    <!-- ============ 出库 - 批量删除确认弹窗 ============ -->
    <div v-if="exShowBatchDeleteConfirm" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm" @click="exShowBatchDeleteConfirm = false">
      <div class="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-hidden shadow-2xl" @click.stop><div class="px-6 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white flex items-center justify-between"><h3 class="text-lg font-semibold">批量删除</h3><button @click="exShowBatchDeleteConfirm = false" class="text-white/80 hover:text-white text-2xl leading-none">&times;</button></div>
      <div class="p-6"><p class="text-lg">确定要删除选中的 {{ exSelectedRows.length }} 条出库单吗？</p><p class="text-sm text-gray-500 mt-1">此操作不可恢复</p></div>
      <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3"><button class="h-8 px-4 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200" @click="exShowBatchDeleteConfirm = false">取消</button><button class="h-8 px-4 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700" @click="handleExBatchDelete">确认删除</button></div></div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Plus, Pencil, Trash2, Download, AlertTriangle, ChevronRight, ChevronDown, RefreshCw, Package, Search, Eye, RotateCcw } from 'lucide-vue-next'
import { ElMessage } from 'element-plus'
import MaterialReceivingHeader from '@/components/materialReceiving/MaterialReceivingHeader.vue'
import Pagination from '@/components/ui/Pagination/Pagination.vue'
import { getApplicationList, createApplication as apiCreateApp, updateApplication as apiUpdateApp, deleteApplication as apiDeleteApp, deleteApplicationsBatch, getExecuteList, createExecute as apiCreateExe, updateExecute as apiUpdateExe, deleteExecute as apiDeleteExe } from '@/api/material/apiMaterialRequestService'

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

// ==================== Tab 3: 领料统计 ====================
const statSubTabs = [{ key: 'monthly', label: '月度汇总' }, { key: 'material', label: '分类汇总' }, { key: 'department', label: '部门汇总' }, { key: 'area', label: '区域统计' }]
const statActiveTab = ref('monthly'); const statAreaTab = ref('greenhouse')
const statYearFilter = ref(String(new Date().getFullYear())); const statMonthFilter = ref('all')
const statMaterialSearch = ref(''); const statDepartmentFilter = ref([]); const statCategoryFilter = ref([])
const statGreenhouseTypeFilter = ref(''); const statCurrentPage = ref(1)
const years = ['2025', '2026']
const statCategoryOptions = ['肥料与土壤改良剂', '农药与植保产品', '种质资源', '农业机械', '劳保与防护用品', '监测设备', '采收容器']
const statCards = [
  { label: '领料单数', value: '268', color: '#059669', subLabel: '本月新增 22 单' },
  { label: '领料总量', value: '36,800', color: '#2563EB', subLabel: '本月 1,680 单位' },
  { label: '领料总金额', value: '¥924,580', color: '#D97706', subLabel: '本月 ¥38,250' },
  { label: '平均差异率', value: '-1.8%', color: '#DC2626', subLabel: '较上月下降 0.3%' }
]
const categoryTrendData = [
  { month: '2025-01', 生产投入: 820, 设施装备: 480, 作业支持: 320, 采后流通: 280, 数字管理: 120, 能源耗材: 50, 其他: 30, total: 2100 },
  { month: '2025-02', 生产投入: 950, 设施装备: 560, 作业支持: 380, 采后流通: 320, 数字管理: 140, 能源耗材: 60, 其他: 40, total: 2450 },
  { month: '2025-03', 生产投入: 1080, 设施装备: 620, 作业支持: 420, 采后流通: 360, 数字管理: 160, 能源耗材: 70, 其他: 45, total: 2755 },
  { month: '2025-04', 生产投入: 1200, 设施装备: 680, 作业支持: 480, 采后流通: 400, 数字管理: 180, 能源耗材: 80, 其他: 50, total: 3070 },
  { month: '2025-05', 生产投入: 1350, 设施装备: 750, 作业支持: 520, 采后流通: 450, 数字管理: 200, 能源耗材: 90, 其他: 55, total: 3415 },
  { month: '2025-06', 生产投入: 1480, 设施装备: 820, 作业支持: 580, 采后流通: 480, 数字管理: 220, 能源耗材: 100, 其他: 60, total: 3740 }
]
const categorySummaryData = [
  { name: 'SP-生产投入类', key: '生产投入', amount: 38.5, percentage: 34.2, color: '#06B6D4', mom: '↑5.2%' },
  { name: 'EQ-设施与装备类', key: '设施装备', amount: 18.6, percentage: 20.8, color: '#8B5CF6', mom: '↑3.1%' },
  { name: 'OP-作业支持类', key: '作业支持', amount: 12.8, percentage: 13.8, color: '#F59E0B', mom: '↑2.8%' },
  { name: 'PH-采后处理与流通类', key: '采后流通', amount: 9.8, percentage: 10.5, color: '#F97316', mom: '↓1.2%' },
  { name: 'IT-数字化与管理类', key: '数字管理', amount: 4.8, percentage: 5.2, color: '#EC4899', mom: '↑1.5%' },
  { name: 'EC-能源与通用耗材', key: '能源耗材', amount: 2.9, percentage: 3.2, color: '#64748B', mom: '↑0.8%' },
  { name: 'OT-其他类', key: '其他', amount: 2.1, percentage: 2.3, color: '#9CA3AF', mom: '↓0.3%' }
]
const monthData = computed(() => {
  return categoryTrendData.filter(d => d.month.startsWith(statYearFilter.value)).map(d => {
    const totalQty = categorySummaryData.reduce((sum, cat) => sum + ((d)[cat.key] || 0), 0)
    const yearTotal = categoryTrendData.filter(d2 => d2.month.startsWith(statYearFilter.value)).reduce((sum, d2) => sum + categorySummaryData.reduce((s, cat) => s + ((d2)[cat.key] || 0), 0), 0)
    return { month: d.month, monthName: `${parseInt(d.month.split('-')[1])}月`, totalQuantity: totalQty, totalAmount: totalQty * 30, percentage: yearTotal > 0 ? (totalQty / yearTotal) * 100 : 0 }
  })
})
const filteredMonthData = computed(() => {
  if (statMonthFilter.value === 'all') return monthData.value
  return monthData.value.filter(d => d.month.endsWith('-' + statMonthFilter.value))
})
const paginatedMonthData = computed(() => filteredMonthData.value)
const getMonthDetails = (month) => {
  const md = categoryTrendData.find(d => d.month === month)
  if (!md) return []
  const totalQty = categorySummaryData.reduce((sum, cat) => sum + ((md)[cat.key] || 0), 0)
  return categorySummaryData.map(cat => {
    const qty = (md)[cat.key] || 0
    return { categoryName: cat.name, quantity: qty, amount: qty * 30, percentage: totalQty > 0 ? (qty / totalQty) * 100 : 0 }
  })
}
const materialStatData = ref([
  { materialCode: 'SP0201001', materialName: '商品有机肥', category: '肥料与土壤改良剂', spec: '50kg/袋', unit: '袋', supplier: '有机肥供应商A', batchCode: 'YC20260301', requisitionDepartment: '生产部', totalQuantity: 580, totalAmount: 25425 },
  { materialCode: 'SP0202001', materialName: '尿素', category: '肥料与土壤改良剂', spec: '50kg/袋', unit: '袋', supplier: '化肥供应商B', batchCode: 'HF20260315', requisitionDepartment: '生产部', totalQuantity: 420, totalAmount: 34850 },
  { materialCode: 'SP0301001', materialName: '吡虫啉', category: '农药与植保产品', spec: '100g/瓶', unit: '瓶', supplier: '农药供应商C', batchCode: 'NY20260220', requisitionDepartment: '生产部', totalQuantity: 380, totalAmount: 10660 },
  { materialCode: 'SP0302001', materialName: '多菌灵', category: '农药与植保产品', spec: '200g/袋', unit: '袋', supplier: '农药供应商C', batchCode: 'NY20260110', requisitionDepartment: '技术部', totalQuantity: 280, totalAmount: 9625 },
  { materialCode: 'SP0101001', materialName: '水稻种子', category: '种质资源', spec: '20kg/袋', unit: '袋', supplier: '种子供应商D', batchCode: 'ZZ20260201', requisitionDepartment: '生产部', totalQuantity: 180, totalAmount: 11375 },
  { materialCode: 'SP0103001', materialName: '番茄种子', category: '种质资源', spec: '50g/袋', unit: '袋', supplier: '种子供应商D', batchCode: 'ZZ20260115', requisitionDepartment: '生产部', totalQuantity: 160, totalAmount: 18600 },
  { materialCode: 'OP0201001', materialName: '锄头', category: '劳保与防护用品', spec: '标准型', unit: '把', supplier: '劳保用品供应商E', batchCode: 'LB20260228', requisitionDepartment: '生产部', totalQuantity: 120, totalAmount: 4956 },
  { materialCode: 'OP0102001', materialName: '劳保胶靴', category: '劳保与防护用品', spec: '标准码', unit: '双', supplier: '劳保用品供应商E', batchCode: 'LB20260305', requisitionDepartment: '生产部', totalQuantity: 150, totalAmount: 10064 },
  { materialCode: 'EQ0103001', materialName: '电动喷雾机', category: '农业机械', spec: '标准型', unit: '台', supplier: '农机供应商F', batchCode: 'NJ20260120', requisitionDepartment: '设备部', totalQuantity: 15, totalAmount: 8700 },
  { materialCode: 'EQ0306001', materialName: '滴灌带', category: '农业机械', spec: '50m/卷', unit: '卷', supplier: '农机供应商F', batchCode: 'NJ20260210', requisitionDepartment: '生产部', totalQuantity: 200, totalAmount: 7410 },
  { materialCode: 'PH0104001', materialName: '塑料袋', category: '采收容器', spec: '标准型', unit: '卷', supplier: '包装材料供应商G', batchCode: 'BZ20260320', requisitionDepartment: '采后处理部', totalQuantity: 600, totalAmount: 5015 },
  { materialCode: 'IT0101001', materialName: '土壤温湿度传感器', category: '监测设备', spec: '标准型', unit: '个', supplier: '监测设备供应商H', batchCode: 'JC20260105', requisitionDepartment: '技术部', totalQuantity: 45, totalAmount: 11760 }
])
const filteredMaterialStatData = computed(() => {
  return materialStatData.value.filter(item => {
    if (statMaterialSearch.value) { const s = statMaterialSearch.value.toLowerCase(); if (!item.materialCode.toLowerCase().includes(s) && !item.materialName.toLowerCase().includes(s)) return false }
    if (statDepartmentFilter.value.length > 0 && !statDepartmentFilter.value.includes(item.requisitionDepartment)) return false
    if (statCategoryFilter.value.length > 0 && !statCategoryFilter.value.includes(item.category)) return false
    return true
  })
})
const paginatedMaterialStatData = computed(() => {
  const start = (statCurrentPage.value - 1) * 10
  return filteredMaterialStatData.value.slice(start, start + 10)
})
const departmentStatData = ref([
  { applicant: '张伟民', department: '生产部', requisitionCount: 18, requisitionOrders: 12, materialTypes: 15, totalQuantity: 680, totalAmount: 18650, avgPerOrder: 38, avgAmount: 1036, topMaterials: ['商品有机肥', '尿素', '吡虫啉'] },
  { applicant: '李明轩', department: '生产部', requisitionCount: 15, requisitionOrders: 10, materialTypes: 12, totalQuantity: 520, totalAmount: 14280, avgPerOrder: 35, avgAmount: 952, topMaterials: ['商品有机肥', '番茄种子', '滴灌带'] },
  { applicant: '王建国', department: '生产部', requisitionCount: 20, requisitionOrders: 14, materialTypes: 18, totalQuantity: 750, totalAmount: 20580, avgPerOrder: 38, avgAmount: 1029, topMaterials: ['尿素', '多菌灵', '锄头'] },
  { applicant: '赵俊杰', department: '生产部', requisitionCount: 16, requisitionOrders: 11, materialTypes: 14, totalQuantity: 580, totalAmount: 15860, avgPerOrder: 36, avgAmount: 990, topMaterials: ['商品有机肥', '水稻种子', '劳保胶靴'] },
  { applicant: '郑志远', department: '技术部', requisitionCount: 12, requisitionOrders: 8, materialTypes: 10, totalQuantity: 280, totalAmount: 7680, avgPerOrder: 23, avgAmount: 640, topMaterials: ['多菌灵', '土壤温湿度传感器', '吡虫啉'] },
  { applicant: '孙一鸣', department: '技术部', requisitionCount: 8, requisitionOrders: 6, materialTypes: 7, totalQuantity: 180, totalAmount: 4920, avgPerOrder: 23, avgAmount: 615, topMaterials: ['土壤温湿度传感器', '多菌灵'] }
])
const greenhouseStatData = ref([
  { greenhouse: '玻璃温室A区', greenhouseType: '玻璃温室', period: '2025-03', requisitionCount: 8, materialTypes: 6, totalQuantity: 520, totalAmount: 14260, comparison: { lastMonth: { quantity: 480, amount: 12850, changeRate: 8.3 } } },
  { greenhouse: '玻璃温室B区', greenhouseType: '玻璃温室', period: '2025-03', requisitionCount: 6, materialTypes: 5, totalQuantity: 380, totalAmount: 9840, comparison: { lastMonth: { quantity: 350, amount: 8920, changeRate: 8.6 } } },
  { greenhouse: '玻璃温室C区', greenhouseType: '玻璃温室', period: '2025-03', requisitionCount: 5, materialTypes: 4, totalQuantity: 280, totalAmount: 7260, comparison: { lastMonth: { quantity: 260, amount: 6580, changeRate: 7.7 } } },
  { greenhouse: '日光温室1号', greenhouseType: '日光温室', period: '2025-03', requisitionCount: 4, materialTypes: 4, totalQuantity: 180, totalAmount: 4860, comparison: { lastMonth: { quantity: 160, amount: 4280, changeRate: 12.5 } } },
  { greenhouse: '日光温室2号', greenhouseType: '日光温室', period: '2025-03', requisitionCount: 4, materialTypes: 3, totalQuantity: 160, totalAmount: 4320, comparison: { lastMonth: { quantity: 150, amount: 3980, changeRate: 6.7 } } },
  { greenhouse: '塑料大棚1号', greenhouseType: '塑料大棚', period: '2025-03', requisitionCount: 3, materialTypes: 3, totalQuantity: 120, totalAmount: 3280, comparison: { lastMonth: { quantity: 110, amount: 2940, changeRate: 9.1 } } }
])
const fieldStatData = ref([
  { field: 'A1地块', crop: '水稻', period: '2025-03', requisitionCount: 5, materialTypes: 6, totalQuantity: 380, totalAmount: 10360, comparison: { lastMonth: { quantity: 350, amount: 9360, changeRate: 8.6 } } },
  { field: 'A2地块', crop: '水稻', period: '2025-03', requisitionCount: 5, materialTypes: 5, totalQuantity: 360, totalAmount: 9820, comparison: { lastMonth: { quantity: 330, amount: 8820, changeRate: 9.1 } } },
  { field: 'A3地块', crop: '水稻', period: '2025-03', requisitionCount: 4, materialTypes: 5, totalQuantity: 320, totalAmount: 8720, comparison: { lastMonth: { quantity: 290, amount: 7760, changeRate: 10.3 } } },
  { field: 'B1地块', crop: '小麦', period: '2025-03', requisitionCount: 4, materialTypes: 4, totalQuantity: 280, totalAmount: 7640, comparison: { lastMonth: { quantity: 260, amount: 6980, changeRate: 7.7 } } },
  { field: 'B2地块', crop: '小麦', period: '2025-03', requisitionCount: 4, materialTypes: 4, totalQuantity: 260, totalAmount: 7080, comparison: { lastMonth: { quantity: 240, amount: 6420, changeRate: 8.3 } } }
])
const batchStatData = ref([
  { batchCode: 'FQ2024-001', cropName: '番茄', variety: '红果番茄', plantArea: '玻璃温室A区', areaSize: '3000 m²', plannedStartDate: '2026-03-01', plannedEndDate: '2026-09-30', requisitionCount: 12, materialTypes: 8, totalQuantity: 680, actualQuantity: 665, totalAmount: 18560 },
  { batchCode: 'SD2024-001', cropName: '水稻', variety: '常规水稻', plantArea: 'A1/A2/A3地块', areaSize: '5000 m²', plannedStartDate: '2026-04-15', plannedEndDate: '2026-10-15', requisitionCount: 14, materialTypes: 7, totalQuantity: 860, actualQuantity: 842, totalAmount: 23480 },
  { batchCode: 'XM2024-001', cropName: '小麦', variety: '冬小麦', plantArea: 'B1/B2地块', areaSize: '3500 m²', plannedStartDate: '2025-10-01', plannedEndDate: '2026-06-15', requisitionCount: 8, materialTypes: 6, totalQuantity: 480, actualQuantity: 468, totalAmount: 13120 }
])
const filteredDepartmentData = computed(() => departmentStatData.value)
const filteredGreenhouseData = computed(() => {
  return greenhouseStatData.value.filter(item => {
    if (statGreenhouseTypeFilter.value && item.greenhouseType !== statGreenhouseTypeFilter.value) return false
    return true
  })
})
const filteredFieldData = computed(() => fieldStatData.value)
const filteredBatchData = computed(() => batchStatData.value)

// ==================== Tab 4: 成本核算 ====================
const costSubTabs = [{ key: 'overview', label: '成本概览' }, { key: 'comparison', label: '分类对比' }]
const costActiveTab = ref('overview')
const costKPIs = [
  { label: '总成本', value: '¥924,580', trend: 5.2 },
  { label: '本月成本', value: '¥38,250', trend: -2.1 },
  { label: '平均批次成本', value: '¥3,850', trend: 1.8 },
  { label: '单位面积成本', value: '¥12.5/m²', trend: -0.5 }
]
const costCategoryData = categorySummaryData
const costTrendData = categoryTrendData
const costDeptData = [
  { department: '生产部', totalQuantity: 2530, totalAmount: 69370, percentage: 69.4 },
  { department: '技术部', totalQuantity: 460, totalAmount: 12600, percentage: 12.6 },
  { department: '设备部', totalQuantity: 215, totalAmount: 8700, percentage: 8.7 },
  { department: '采后处理部', totalQuantity: 600, totalAmount: 5015, percentage: 5.0 },
  { department: '品控部', totalQuantity: 120, totalAmount: 3380, percentage: 3.4 }
]
const costBatchData = [
  { batchCode: 'FQ2024-001', cropName: '番茄', totalAmount: 18560, percentage: 33.7 },
  { batchCode: 'SD2024-001', cropName: '水稻', totalAmount: 23480, percentage: 42.6 },
  { batchCode: 'XM2024-001', cropName: '小麦', totalAmount: 13120, percentage: 23.8 }
]
const maxTrendQty = computed(() => Math.max(...costTrendData.map(d => d.total), 1))

onMounted(() => { loadApplicationData(); loadExecuteData() })
</script>