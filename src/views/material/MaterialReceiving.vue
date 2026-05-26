<template>
  <div class="space-y-6">
    <!-- 页面头部 + Tab切换 -->
    <MaterialReceivingHeader :activeTab="activeTab" @tab-change="onTabChange" />

    <!-- Tab 1: 申请领料 -->
    <div v-show="activeTab === 'application'" class="space-y-4">
      <!-- 搜索筛选 -->
      <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm">
        <div class="grid grid-cols-5 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">领料单号</label>
            <el-input v-model="searchCode" placeholder="请输入领料单号" clearable @clear="searchCode = ''; currentPage = 1" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">申领人</label>
            <el-input v-model="searchApplicant" placeholder="请输入申领人" clearable @clear="searchApplicant = ''; currentPage = 1" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">生产计划批次号</label>
            <el-input v-model="searchBatchCode" placeholder="请输入批次号" clearable @clear="searchBatchCode = ''; currentPage = 1" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">库存地点</label>
            <el-select v-model="searchWarehouse" placeholder="全部" clearable @clear="searchWarehouse = ''; currentPage = 1">
              <el-option v-for="w in warehouses" :key="w" :value="w" :label="w" />
            </el-select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">状态</label>
            <el-select v-model="statusFilter" placeholder="全部状态" clearable @clear="statusFilter = 'all'; currentPage = 1">
              <el-option label="全部" value="all" />
              <el-option label="待审批" value="待审批" />
              <el-option label="已审批" value="已审批" />
              <el-option label="已拒绝" value="已拒绝" />
              <el-option label="已作废" value="已作废" />
              <el-option label="已取消" value="已取消" />
            </el-select>
          </div>
        </div>
        <div class="mt-4 flex justify-end gap-2">
          <el-button @click="handleReset">重置</el-button>
          <el-button type="primary" @click="currentPage = 1">搜索</el-button>
        </div>
      </div>

      <!-- 数据表格 -->
      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">领料单列表</h3>
          <div class="flex gap-2">
            <el-button type="primary" @click="handleOpenAdd">
              <el-icon><Plus /></el-icon>新增
            </el-button>
            <el-button v-if="!batchEditMode && !deleteMode && !exportMode" @click="batchEditMode = 'edit'; selectedRows = []">
              <el-icon><Edit /></el-icon>编辑
            </el-button>
            <el-button v-if="!batchEditMode && !deleteMode && !exportMode" type="danger" @click="batchEditMode = 'delete'; selectedRows = []">
              <el-icon><Delete /></el-icon>删除
            </el-button>
            <el-button v-if="!batchEditMode && !deleteMode && !exportMode" @click="exportMode = true; selectedRows = []">
              <el-icon><Download /></el-icon>导出
            </el-button>
            <el-button v-if="batchEditMode || deleteMode || exportMode" @click="batchEditMode = null; deleteMode = false; exportMode = false; selectedRows = []">
              取消
            </el-button>
          </div>
        </div>

        <el-table
          :data="paginatedApplicationData"
          stripe
          @selection-change="handleSelectionChange"
          @expand-change="handleExpandChange"
          :expand-row-keys="expandedRows"
          row-key="id"
        >
          <el-table-column v-if="batchEditMode || deleteMode || exportMode" type="selection" width="55" />
          <el-table-column type="expand">
            <template #default="{ row }">
              <div class="p-4 bg-gray-50">
                <h4 class="font-medium mb-2 text-sm text-gray-700">领料物料明细</h4>
                <el-table :data="row.materials" size="small" border>
                  <el-table-column prop="materialCode" label="物料编码" width="120" />
                  <el-table-column prop="materialName" label="物料名称" min-width="140" />
                  <el-table-column prop="batchNo" label="批次号" width="110" />
                  <el-table-column prop="spec" label="规格" width="100" />
                  <el-table-column prop="unit" label="单位" width="70" />
                  <el-table-column prop="requestedQuantity" label="申领数量" width="90">
                    <template #default="{ row: m }">
                      <span :class="{ 'text-red-600 font-bold': m.requestedQuantity > m.stockQuantity }">{{ m.requestedQuantity }}{{ m.requestedQuantity > m.stockQuantity ? ' ⚠️' : '' }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="stockQuantity" label="当前库存" width="90" />
                  <el-table-column prop="unitPrice" label="单价(元)" width="90">
                    <template #default="{ row: m }">{{ (m.unitPrice || 0).toFixed(2) }}</template>
                  </el-table-column>
                  <el-table-column label="小计(元)" width="90">
                    <template #default="{ row: m }">{{ (m.requestedQuantity * (m.unitPrice || 0)).toFixed(2) }}</template>
                  </el-table-column>
                  <el-table-column prop="warehousePosition" label="仓库货位" width="110" />
                  <el-table-column prop="remark" label="备注" min-width="120" />
                </el-table>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="code" label="领料单号" width="150" />
          <el-table-column prop="date" label="申请日期" width="110" />
          <el-table-column prop="applicant" label="申请人" width="100" />
          <el-table-column prop="department" label="部门" width="100" />
          <el-table-column prop="warehouseLocation" label="库存地点" width="110" />
          <el-table-column label="物料种类" width="90">
            <template #default="{ row }">{{ row.materials.length > 0 ? row.materials.length + '种' : '-' }}</template>
          </el-table-column>
          <el-table-column prop="plantArea" label="种植区域/用途" min-width="130" />
          <el-table-column prop="reviewer" label="审核人" width="100" />
          <el-table-column prop="productionBatchCode" label="生产计划批次号" width="130" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <div class="flex flex-col gap-1">
                <el-tag :type="getAppStatusType(row.status)" size="small">{{ row.status }}</el-tag>
                <span v-if="row.status === '已拒绝' && row.rejectReason" class="text-xs text-red-600 max-w-[150px] truncate" :title="row.rejectReason">原因：{{ row.rejectReason }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="备注" width="100">
            <template #default="{ row }">{{ row.materials.length > 0 ? row.materials[0].remark : '-' }}</template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="handleViewDetail(row)">查看</el-button>
              <el-button link type="primary" size="small" @click="handleEditRecord(row)">编辑</el-button>
              <el-button link type="danger" size="small" @click="handleDeleteRecord(row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-500">每页</span>
            <el-select v-model="pageSize" style="width: 80px" @change="currentPage = 1">
              <el-option :value="10" label="10" />
              <el-option :value="20" label="20" />
              <el-option :value="50" label="50" />
            </el-select>
            <span class="text-sm text-gray-500">条</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-500">共 {{ filteredApplicationData.length }} 条，第 {{ currentPage }} / {{ totalPages }} 页</span>
            <el-pagination v-model:current-page="currentPage" :page-size="pageSize" :total="filteredApplicationData.length" layout="prev, pager, next" />
          </div>
        </div>
      </div>
    </div>

    <!-- Tab 2: 领料出库 -->
    <div v-show="activeTab === 'execute'" class="space-y-4">
      <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm">
        <div class="grid grid-cols-5 gap-4">
          <div><label class="block text-sm font-medium text-gray-700 mb-1">出库单号</label><el-input v-model="exSearchCode" placeholder="请输入" clearable /></div>
          <div><label class="block text-sm font-medium text-gray-700 mb-1">申领人</label><el-input v-model="exSearchApplicant" placeholder="请输入" clearable /></div>
          <div><label class="block text-sm font-medium text-gray-700 mb-1">生产计划批次号</label><el-input v-model="exSearchBatchCode" placeholder="请输入" clearable /></div>
          <div><label class="block text-sm font-medium text-gray-700 mb-1">库存地点</label>
            <el-select v-model="exSearchWarehouse" placeholder="全部" clearable @clear="exSearchWarehouse = ''">
              <el-option v-for="w in warehouses" :key="w" :value="w" :label="w" />
            </el-select>
          </div>
          <div><label class="block text-sm font-medium text-gray-700 mb-1">状态</label>
            <el-select v-model="exStatusFilter" placeholder="全部" clearable>
              <el-option label="全部" value="all" />
              <el-option label="已出库" value="已出库" />
              <el-option label="部分出库" value="部分出库" />
              <el-option label="待出库" value="待出库" />
              <el-option label="已取消" value="已取消" />
            </el-select>
          </div>
        </div>
        <div class="mt-4 flex justify-end gap-2">
          <el-button @click="exSearchCode = ''; exSearchApplicant = ''; exSearchBatchCode = ''; exSearchWarehouse = ''; exStatusFilter = 'all'">重置</el-button>
          <el-button type="primary" @click="exCurrentPage = 1">搜索</el-button>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">出库单列表</h3>
          <div class="flex gap-2">
            <el-button type="primary" @click="handleOpenExAdd"><el-icon><Plus /></el-icon>新增</el-button>
            <el-button v-if="!exBatchEditMode" @click="exBatchEditMode = 'edit'; exSelectedRows = []"><el-icon><Edit /></el-icon>编辑</el-button>
            <el-button v-if="!exBatchEditMode" type="danger" @click="exBatchEditMode = 'delete'; exSelectedRows = []"><el-icon><Delete /></el-icon>删除</el-button>
            <el-button v-if="!exBatchEditMode" @click="exExportMode = true; exSelectedRows = []"><el-icon><Download /></el-icon>导出</el-button>
            <el-button v-if="exBatchEditMode || exExportMode" @click="exBatchEditMode = null; exExportMode = false; exSelectedRows = []">取消</el-button>
          </div>
        </div>
        <el-table :data="paginatedExecuteData" stripe row-key="id" @selection-change="handleExSelectionChange" @expand-change="handleExExpandChange" :expand-row-keys="exExpandedRows">
          <el-table-column v-if="exBatchEditMode || exExportMode" type="selection" width="55" />
          <el-table-column type="expand">
            <template #default="{ row }">
              <div class="p-4 bg-gray-50">
                <h4 class="font-medium mb-2 text-sm text-gray-700">出库物料明细</h4>
                <el-table :data="row.materials" size="small" border>
                  <el-table-column prop="applicationCode" label="来源领料单号" width="150" />
                  <el-table-column prop="materialCode" label="物料编码" width="120" />
                  <el-table-column prop="materialName" label="物料名称" min-width="140" />
                  <el-table-column prop="batchNo" label="批次号" width="110" />
                  <el-table-column prop="spec" label="规格" width="100" />
                  <el-table-column prop="unit" label="单位" width="70" />
                  <el-table-column prop="requestedQuantity" label="申请数量" width="90" />
                  <el-table-column label="实际库存" width="90">
                    <template #default="{ row: m }">
                      <span :class="m.stockQuantity < m.requestedQuantity ? 'text-red-600 font-medium' : 'text-green-600'">{{ m.stockQuantity }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="本次实发" width="90">
                    <template #default="{ row: m }">
                      <span v-if="m.actualQuantity > 0" :class="m.actualQuantity < m.requestedQuantity ? 'text-amber-600 font-medium' : 'text-green-600'">{{ m.actualQuantity }}</span>
                      <span v-else :class="m.stockQuantity === 0 ? 'text-red-600 font-medium' : 'text-gray-400'">{{ m.actualQuantity }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="单价(元)" width="90">
                    <template #default="{ row: m }">{{ (m.unitPrice || 0).toFixed(2) }}</template>
                  </el-table-column>
                  <el-table-column label="小计(元)" width="90">
                    <template #default="{ row: m }">{{ ((m.requestedQuantity || 0) * (m.unitPrice || 0)).toFixed(2) }}</template>
                  </el-table-column>
                  <el-table-column prop="warehousePosition" label="仓库货位" width="110" />
                  <el-table-column label="差异" width="70">
                    <template #default="{ row: m }">
                      <span v-if="m.requestedQuantity - m.actualQuantity > 0" class="text-red-600 font-medium">-{{ m.requestedQuantity - m.actualQuantity }}</span>
                      <span v-else class="text-green-600">0</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="remark" label="备注" min-width="120" />
                </el-table>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="code" label="出库单号" width="150" />
          <el-table-column prop="date" label="申请日期" width="110" />
          <el-table-column prop="applicant" label="申请人" width="100" />
          <el-table-column prop="warehouseLocation" label="库存地点" width="110" />
          <el-table-column prop="reviewer" label="审核人" width="100" />
          <el-table-column prop="operator" label="操作人" width="100" />
          <el-table-column prop="productionBatchCode" label="生产计划批次号" width="130" />
          <el-table-column prop="executeStatus" label="执行状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getExStatusType(row.executeStatus)" size="small">{{ row.executeStatus }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="handleExViewDetail(row)">查看</el-button>
              <el-button link type="primary" size="small" @click="handleExEditRecord(row)">编辑</el-button>
              <el-button link type="danger" size="small" @click="handleExDeleteRecord(row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
          <span class="text-sm text-gray-500">共 {{ exFilteredData.length }} 条，第 {{ exCurrentPage }} / {{ exTotalPages }} 页</span>
          <el-pagination v-model:current-page="exCurrentPage" :page-size="exPageSize" :total="exFilteredData.length" layout="prev, pager, next" />
        </div>
      </div>
    </div>

    <!-- Tab 3: 领料统计 -->
    <div v-show="activeTab === 'statistics'" class="space-y-4">
      <!-- 统计卡片 -->
      <div class="grid grid-cols-4 gap-4">
        <div v-for="card in statCards" :key="card.label" class="bg-white rounded-xl p-5 shadow-sm border-l-4" :style="{ borderColor: card.color }">
          <p class="text-sm text-gray-500">{{ card.label }}</p>
          <p class="text-2xl font-bold mt-1" :style="{ color: card.color }">{{ card.value }}</p>
          <p class="text-xs text-gray-400 mt-1">{{ card.subLabel }}</p>
        </div>
      </div>

      <!-- 子Tab -->
      <div class="bg-white rounded-xl shadow-sm">
        <div class="border-b border-gray-100 px-6 pt-4">
          <div class="flex gap-6">
            <button
              v-for="st in statSubTabs"
              :key="st.key"
              @click="statActiveTab = st.key; statCurrentPage = 1"
              class="pb-3 text-sm font-medium border-b-2 transition-colors"
              :class="statActiveTab === st.key ? 'text-emerald-600 border-emerald-500' : 'text-gray-500 border-transparent hover:text-gray-700'"
            >{{ st.label }}</button>
          </div>
        </div>

        <!-- 月度汇总 -->
        <div v-if="statActiveTab === 'monthly'" class="p-4">
          <div class="flex flex-wrap gap-4 mb-4 items-end">
            <div><label class="block text-xs text-gray-500 mb-1">年度</label><el-select v-model="statYearFilter" style="width: 120px" @change="statMonthFilter = 'all'"><el-option v-for="y in years" :key="y" :value="y" :label="y + '年'" /></el-select></div>
            <div><label class="block text-xs text-gray-500 mb-1">月份</label><el-select v-model="statMonthFilter" style="width: 120px" @change="statCurrentPage = 1"><el-option label="全部" value="all" /><el-option v-for="m in 12" :key="m" :value="String(m).padStart(2, '0')" :label="m + '月'" /></el-select></div>
            <el-button @click="statYearFilter = String(new Date().getFullYear()); statMonthFilter = 'all'">重置</el-button>
          </div>
          <el-table :data="paginatedMonthData" stripe border row-key="month">
            <el-table-column type="expand">
              <template #default="{ row }">
                <el-table :data="getMonthDetails(row.month)" size="small" border>
                  <el-table-column prop="categoryName" label="物料分类" min-width="180" />
                  <el-table-column prop="quantity" label="数量" width="120" />
                  <el-table-column label="金额(元)" width="120"><template #default="{ row: r }">{{ (r.amount || 0).toLocaleString() }}</template></el-table-column>
                  <el-table-column label="占比" width="100"><template #default="{ row: r }">{{ r.percentage.toFixed(1) }}%</template></el-table-column>
                </el-table>
              </template>
            </el-table-column>
            <el-table-column prop="monthName" label="月份" width="100" />
            <el-table-column prop="totalQuantity" label="总数量" width="120" />
            <el-table-column label="总金额(元)" width="140"><template #default="{ row }">{{ (row.totalAmount || 0).toLocaleString() }}</template></el-table-column>
            <el-table-column label="占比" width="100"><template #default="{ row }">{{ (row.percentage || 0).toFixed(1) }}%</template></el-table-column>
          </el-table>
          <div class="mt-4 text-center text-sm text-gray-500">共 {{ monthData.length }} 条</div>
        </div>

        <!-- 分类汇总 -->
        <div v-if="statActiveTab === 'material'" class="p-4">
          <div class="flex flex-wrap gap-3 mb-4 items-end">
            <div><label class="block text-xs text-gray-500 mb-1">物料搜索</label><el-input v-model="statMaterialSearch" placeholder="编码/名称" style="width: 180px" clearable /></div>
            <div><label class="block text-xs text-gray-500 mb-1">部门</label><el-select v-model="statDepartmentFilter" multiple placeholder="全部" style="width: 150px" clearable><el-option v-for="d in departments" :key="d" :value="d" :label="d" /></el-select></div>
            <div><label class="block text-xs text-gray-500 mb-1">分类</label><el-select v-model="statCategoryFilter" multiple placeholder="全部" style="width: 150px" clearable><el-option v-for="c in statCategoryOptions" :key="c" :value="c" :label="c" /></el-select></div>
            <el-button @click="statMaterialSearch = ''; statDepartmentFilter = []; statCategoryFilter = []">重置</el-button>
          </div>
          <el-table :data="paginatedMaterialStatData" stripe border row-key="materialCode">
            <el-table-column prop="materialCode" label="物料编码" width="130" />
            <el-table-column prop="materialName" label="物料名称" min-width="150" />
            <el-table-column prop="category" label="分类" width="150" />
            <el-table-column prop="spec" label="规格" width="100" />
            <el-table-column prop="unit" label="单位" width="70" />
            <el-table-column prop="supplier" label="供应商" min-width="140" />
            <el-table-column prop="batchCode" label="批次号" width="130" />
            <el-table-column prop="requisitionDepartment" label="领料部门" width="110" />
            <el-table-column prop="totalQuantity" label="总数量" width="90" />
            <el-table-column label="总金额" width="100"><template #default="{ row }">¥{{ (row.totalAmount || 0).toLocaleString() }}</template></el-table-column>
          </el-table>
          <div class="mt-4 flex items-center justify-between text-sm text-gray-500">
            <span>共 {{ filteredMaterialStatData.length }} 条</span>
            <el-pagination v-model:current-page="statCurrentPage" :page-size="10" :total="filteredMaterialStatData.length" layout="prev, pager, next" small />
          </div>
        </div>
      </div>
    </div>

    <!-- Tab 4: 成本核算 -->
    <div v-show="activeTab === 'cost'" class="space-y-4">
      <div class="grid grid-cols-4 gap-4">
        <div v-for="kpi in costKPIs" :key="kpi.label" class="bg-white rounded-xl p-5 shadow-sm">
          <p class="text-sm text-gray-500">{{ kpi.label }}</p>
          <p class="text-2xl font-bold mt-1 text-gray-900">{{ kpi.value }}</p>
          <p class="text-xs mt-1" :class="kpi.trend > 0 ? 'text-red-500' : 'text-green-500'">{{ kpi.trend > 0 ? '↑' : '↓' }} {{ Math.abs(kpi.trend) }}%</p>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div class="bg-white rounded-xl p-5 shadow-sm">
          <h4 class="font-semibold text-gray-900 mb-4">分类成本构成</h4>
          <div class="space-y-3">
            <div v-for="cat in costCategoryData" :key="cat.name" class="flex items-center gap-3">
              <span class="text-sm text-gray-600 w-36 truncate">{{ cat.name }}</span>
              <div class="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                <div class="h-full rounded-full" :style="{ width: cat.percentage + '%', backgroundColor: cat.color }"></div>
              </div>
              <span class="text-sm font-medium text-gray-900 w-16 text-right">¥{{ (cat.amount * 10000).toLocaleString() }}</span>
              <span class="text-xs text-gray-500 w-12 text-right">{{ cat.percentage }}%</span>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-xl p-5 shadow-sm">
          <h4 class="font-semibold text-gray-900 mb-4">月度成本趋势</h4>
          <div class="space-y-2">
            <div v-for="trend in costTrendData" :key="trend.month" class="flex items-center gap-2">
              <span class="text-xs text-gray-500 w-20">{{ trend.month }}</span>
              <div class="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                <div class="h-full bg-emerald-500 rounded-full" :style="{ width: (trend.total / maxTrendQty * 100) + '%' }"></div>
              </div>
              <span class="text-xs text-gray-700 w-20 text-right">{{ trend.total.toLocaleString() }}</span>
            </div>
          </div>
        </div>
      </div>
      <!-- 分类对比表格 -->
      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="p-4 border-b border-gray-100"><h3 class="text-lg font-semibold text-gray-900">分类成本对比</h3></div>
        <el-table :data="costCategoryData" stripe border>
          <el-table-column prop="name" label="物料分类" min-width="180" />
          <el-table-column label="总金额(万元)"><template #default="{ row }">{{ (row.amount || 0).toLocaleString() }}</template></el-table-column>
          <el-table-column label="占比"><template #default="{ row }">{{ row.percentage }}%</template></el-table-column>
          <el-table-column label="环比" width="100"><template #default="{ row }">{{ row.mom || '-' }}</template></el-table-column>
        </el-table>
      </div>
    </div>

    <!-- ============ 申请领料 - 详情弹窗 ============ -->
    <el-dialog v-model="showDetailModal" title="领料单详情" width="900px">
      <el-descriptions :column="3" border size="small">
        <el-descriptions-item label="领料单号">{{ selectedRecord?.code }}</el-descriptions-item>
        <el-descriptions-item label="申请日期">{{ selectedRecord?.date }}</el-descriptions-item>
        <el-descriptions-item label="申请人">{{ selectedRecord?.applicant }}</el-descriptions-item>
        <el-descriptions-item label="部门">{{ selectedRecord?.department }}</el-descriptions-item>
        <el-descriptions-item label="库存地点">{{ selectedRecord?.warehouseLocation }}</el-descriptions-item>
        <el-descriptions-item label="物料种类">{{ selectedRecord?.materials?.length > 0 ? selectedRecord.materials.length + '种' : '-' }}</el-descriptions-item>
        <el-descriptions-item label="种植区域/用途">{{ selectedRecord?.plantArea }}</el-descriptions-item>
        <el-descriptions-item label="审核人">{{ selectedRecord?.reviewer }}</el-descriptions-item>
        <el-descriptions-item label="生产计划批次号">{{ selectedRecord?.productionBatchCode }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getAppStatusType(selectedRecord?.status || '')" size="small">{{ selectedRecord?.status }}</el-tag>
          <p v-if="selectedRecord?.status === '已拒绝' && selectedRecord?.rejectReason" class="text-xs text-red-600 mt-1">拒绝原因：{{ selectedRecord.rejectReason }}</p>
        </el-descriptions-item>
      </el-descriptions>
      <div class="mt-4">
        <h4 class="font-medium mb-2 text-sm">物料明细</h4>
        <el-table :data="selectedRecord?.materials || []" size="small" border>
          <el-table-column prop="materialCode" label="物料编码" width="120" />
          <el-table-column prop="materialName" label="物料名称" min-width="140" />
          <el-table-column prop="spec" label="规格" width="90" />
          <el-table-column prop="unit" label="单位" width="70" />
          <el-table-column prop="requestedQuantity" label="申领数量" width="90">
            <template #default="{ row: m }">
              <span :class="{ 'text-red-600 font-bold': m.requestedQuantity > m.stockQuantity }">{{ m.requestedQuantity }}{{ m.requestedQuantity > m.stockQuantity ? ' (!)' : '' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="stockQuantity" label="当前库存" width="90" />
          <el-table-column prop="unitPrice" label="单价(元)" width="90">
            <template #default="{ row: m }">{{ (m.unitPrice || 0).toFixed(2) }}</template>
          </el-table-column>
          <el-table-column label="小计(元)" width="90">
            <template #default="{ row: m }">{{ (m.requestedQuantity * (m.unitPrice || 0)).toFixed(2) }}</template>
          </el-table-column>
          <el-table-column prop="warehousePosition" label="仓库货位" width="110" />
          <el-table-column prop="remark" label="备注" min-width="100" />
        </el-table>
      </div>
      <template #footer><el-button @click="showDetailModal = false">关闭</el-button></template>
    </el-dialog>

    <!-- 申请领料 - 新增弹窗 -->
    <el-dialog v-model="showAddModal" title="新增领料单" width="1050px" :close-on-click-modal="false">
      <el-form :model="addForm" label-width="120px">
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="领料单号">
              <div class="flex gap-2">
                <el-input v-model="addForm.code" readonly placeholder="点击生成获取单号" class="flex-1" />
                <el-button size="small" @click="handleGenerateAddCode" title="生成领料单号">生成</el-button>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="8"><el-form-item label="申请日期"><el-date-picker v-model="addForm.date" type="date" value-format="YYYY-MM-DD" style="width: 100%" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="操作员"><el-input :value="currentOperatorName" readonly class="operator-readonly" /></el-form-item></el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="8"><el-form-item label="申请人"><el-select v-model="addForm.applicant" placeholder="请选择" style="width: 100%" filterable><el-option v-for="u in userList" :key="u.id" :value="u.name" :label="u.name" /></el-select></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="部门"><el-select v-model="addForm.department" style="width: 100%"><el-option v-for="d in departments" :key="d" :value="d" :label="d" /></el-select></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="库存地点"><el-select v-model="addForm.warehouseLocation" style="width: 100%"><el-option v-for="w in warehouses" :key="w" :value="w" :label="w" /></el-select></el-form-item></el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="8"><el-form-item label="种植区域/用途"><el-input v-model="addForm.plantArea" placeholder="如：1号棚-叶菜区" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="审核人"><el-select v-model="addForm.reviewer" style="width: 100%" filterable><el-option v-for="u in userList" :key="u.id" :value="u.name" :label="u.name" /></el-select></el-form-item></el-col>
          <el-col :span="8">
            <el-form-item label="生产计划批次号">
              <el-select v-model="addForm.productionBatchCode" placeholder="请选择生产批次" style="width: 100%" @change="onProductionBatchChange">
                <el-option v-for="code in PRODUCTION_BATCH_CODES" :key="code" :value="code" :label="code" />
                <el-option value="其他" label="其他" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16" v-if="addForm.productionBatchCode === '其他'">
          <el-col :span="16"><el-form-item label="其他批次备注"><el-input v-model="addForm.batchRemark" placeholder="请输入其他批次的具体说明" /></el-form-item></el-col>
        </el-row>
        <el-form-item label="物料明细">
          <div class="mb-2 flex gap-2">
            <el-button size="small" @click="handleAddMaterial">+ 添加物料</el-button>
            <el-button size="small" @click="handleGenerateAddCode">生成单号</el-button>
          </div>
          <el-table :data="addForm.materials" size="small" border>
            <el-table-column prop="materialCode" label="物料编码" width="110"><template #default="{ row: m }"><el-input v-model="m.materialCode" size="small" @change="onAddMaterialCodeChange(m)" /></template></el-table-column>
            <el-table-column prop="materialName" label="物料名称" min-width="120"><template #default="{ row: m }"><el-input v-model="m.materialName" size="small" @change="onAddMaterialNameChange(m)" /></template></el-table-column>
            <el-table-column prop="spec" label="规格" width="80"><template #default="{ row: m }"><el-input v-model="m.spec" size="small" /></template></el-table-column>
            <el-table-column prop="unit" label="单位" width="60"><template #default="{ row: m }"><el-input v-model="m.unit" size="small" /></template></el-table-column>
            <el-table-column prop="requestedQuantity" label="申领数量" width="90">
              <template #default="{ row: m }">
                <el-input-number v-model="m.requestedQuantity" :min="1" size="small" style="width: 100%" :class="{ 'stock-warning-input': m.requestedQuantity > (m.stockQuantity || 0) }" />
              </template>
            </el-table-column>
            <el-table-column label="当前库存" width="90">
              <template #default="{ row: m }"><el-input-number v-model="m.stockQuantity" :min="0" size="small" style="width: 100%" /></template>
            </el-table-column>
            <el-table-column label="单价(元)" width="90">
              <template #default="{ row: m }"><el-input-number v-model="m.unitPrice" :min="0" :precision="2" size="small" style="width: 100%" /></template>
            </el-table-column>
            <el-table-column label="小计(元)" width="90">
              <template #default="{ row: m }"><span class="text-sm text-blue-700">{{ (m.requestedQuantity * (m.unitPrice || 0)).toFixed(2) }}</span></template>
            </el-table-column>
            <el-table-column label="仓库货位" width="100">
              <template #default="{ row: m }"><el-input v-model="m.warehousePosition" size="small" /></template>
            </el-table-column>
            <el-table-column prop="remark" label="备注" width="100"><template #default="{ row: m }"><el-input v-model="m.remark" size="small" /></template></el-table-column>
            <el-table-column label="操作" width="60"><template #default="{ $index }"><el-button link type="danger" size="small" @click="addForm.materials.splice($index, 1)">删除</el-button></template></el-table-column>
          </el-table>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddModal = false; resetAddForm()">取消</el-button>
        <el-button type="primary" @click="handleSaveAdd">保存</el-button>
      </template>
    </el-dialog>

    <!-- 申请领料 - 编辑弹窗 -->
    <el-dialog v-model="showEditModal" title="编辑领料单" width="1050px" :close-on-click-modal="false">
      <el-form :model="editForm" label-width="120px">
        <!-- 领料单号 - 只读 -->
        <el-form-item label="领料单号">
          <div class="bg-gray-100 rounded-lg p-2 text-sm font-medium text-gray-900">{{ selectedRecord?.code }}</div>
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12"><el-form-item label="申请日期"><el-date-picker v-model="editForm.date" type="date" value-format="YYYY-MM-DD" style="width: 100%" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="申请人"><el-select v-model="editForm.applicant" style="width: 100%" filterable><el-option v-for="u in userList" :key="u.id" :value="u.name" :label="u.name" /></el-select></el-form-item></el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12"><el-form-item label="部门"><el-select v-model="editForm.department" style="width: 100%"><el-option v-for="d in departments" :key="d" :value="d" :label="d" /></el-select></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="库存地点"><el-select v-model="editForm.warehouseLocation" style="width: 100%"><el-option v-for="w in warehouses" :key="w" :value="w" :label="w" /></el-select></el-form-item></el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12"><el-form-item label="种植区域/用途"><el-input v-model="editForm.plantArea" placeholder="如：1号棚-叶菜区" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="审核人"><el-select v-model="editForm.reviewer" style="width: 100%" filterable><el-option v-for="u in userList" :key="u.id" :value="u.name" :label="u.name" /></el-select></el-form-item></el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12"><el-form-item label="生产计划批次号"><el-input v-model="editForm.productionBatchCode" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="状态"><el-select v-model="editForm.status" style="width: 100%"><el-option v-for="s in ['待审批','已审批','已拒绝','已作废','已取消']" :key="s" :value="s" :label="s" /></el-select></el-form-item></el-col>
        </el-row>
        <el-form-item label="物料明细">
          <el-button size="small" class="mb-2" @click="handleEditAddMaterial">+ 添加物料</el-button>
          <el-table :data="editForm.materials" size="small" border>
            <el-table-column prop="materialCode" label="物料编码" width="110"><template #default="{ row: m }"><el-input v-model="m.materialCode" size="small" @change="onEditMaterialCodeChangeRow(m)" /></template></el-table-column>
            <el-table-column prop="materialName" label="物料名称" min-width="120"><template #default="{ row: m }"><el-input v-model="m.materialName" size="small" /></template></el-table-column>
            <el-table-column prop="spec" label="规格" width="80"><template #default="{ row: m }"><el-input v-model="m.spec" size="small" /></template></el-table-column>
            <el-table-column prop="unit" label="单位" width="60"><template #default="{ row: m }"><el-input v-model="m.unit" size="small" /></template></el-table-column>
            <el-table-column prop="requestedQuantity" label="申领数量" width="90">
              <template #default="{ row: m }">
                <el-input-number v-model="m.requestedQuantity" :min="1" size="small" style="width: 100%" :class="{ 'stock-warning-input': m.requestedQuantity > (m.stockQuantity || 0) }" />
              </template>
            </el-table-column>
            <el-table-column label="当前库存" width="90">
              <template #default="{ row: m }"><el-input-number v-model="m.stockQuantity" :min="0" size="small" style="width: 100%" /></template>
            </el-table-column>
            <el-table-column label="单价(元)" width="90">
              <template #default="{ row: m }"><el-input-number v-model="m.unitPrice" :min="0" :precision="2" size="small" style="width: 100%" /></template>
            </el-table-column>
            <el-table-column label="小计(元)" width="90">
              <template #default="{ row: m }"><span class="text-sm text-blue-700">{{ (m.requestedQuantity * (m.unitPrice || 0)).toFixed(2) }}</span></template>
            </el-table-column>
            <el-table-column label="仓库货位" width="100">
              <template #default="{ row: m }"><el-input v-model="m.warehousePosition" size="small" /></template>
            </el-table-column>
            <el-table-column prop="remark" label="备注" width="100"><template #default="{ row: m }"><el-input v-model="m.remark" size="small" /></template></el-table-column>
            <el-table-column label="操作" width="60"><template #default="{ $index }"><el-button link type="danger" size="small" @click="editForm.materials.splice($index, 1)">删除</el-button></template></el-table-column>
          </el-table>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditModal = false">取消</el-button>
        <el-button type="primary" @click="handleSaveEdit">保存</el-button>
      </template>
    </el-dialog>

    <!-- 申请领料 - 删除确认 -->
    <el-dialog v-model="showDeleteConfirm" title="确认删除" width="400px">
      <div class="flex items-center gap-3">
        <el-icon :size="40" color="#f56c6c"><WarningFilled /></el-icon>
        <div><p class="text-lg font-medium">确定要删除该领料单吗？</p><p class="text-sm text-gray-500">此操作不可恢复</p></div>
      </div>
      <template #footer><el-button @click="showDeleteConfirm = false">取消</el-button><el-button type="danger" @click="confirmDelete">确认删除</el-button></template>
    </el-dialog>

    <!-- 申请领料 - 作废弹窗 -->
    <el-dialog v-model="showVoidModal" title="作废申请" width="500px">
      <el-form label-width="100px">
        <el-form-item label="领料单号"><span class="text-gray-700">{{ selectedRecord?.code }}</span></el-form-item>
        <el-form-item label="作废原因" required><el-input v-model="voidReason" type="textarea" :rows="3" placeholder="请填写作废原因" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="showVoidModal = false">取消</el-button><el-button type="danger" @click="submitVoid">确认作废</el-button></template>
    </el-dialog>

    <!-- 批量删除确认 -->
    <el-dialog v-model="showBatchDeleteConfirm" title="批量删除" width="400px">
      <p class="text-lg">确定要删除选中的 {{ selectedRows.length }} 条领料单吗？</p>
      <p class="text-sm text-gray-500 mt-1">此操作不可恢复</p>
      <template #footer><el-button @click="showBatchDeleteConfirm = false">取消</el-button><el-button type="danger" @click="handleBatchDelete">确认删除</el-button></template>
    </el-dialog>

    <!-- 导出格式弹窗 -->
    <el-dialog v-model="showExportTypeModal" title="选择导出格式" width="480px">
      <p class="text-sm text-gray-500 mb-4">{{ selectedRows.length > 0 ? `已选择 ${selectedRows.length} 条数据` : `共 ${filteredApplicationData.length} 条数据` }}</p>
      <el-radio-group v-model="exportFileType" class="w-full space-y-3">
        <div v-for="f in exportFormats" :key="f.value" class="flex items-center p-3 border rounded-lg cursor-pointer" :class="exportFileType === f.value ? 'border-green-500 bg-green-50' : 'border-gray-200'" @click="exportFileType = f.value">
          <el-radio :value="f.value"><span class="font-medium">{{ f.label }}</span><span class="block text-xs text-gray-500">{{ f.desc }}</span></el-radio>
        </div>
      </el-radio-group>
      <template #footer><el-button @click="showExportTypeModal = false">取消</el-button><el-button type="primary" @click="confirmExport">导出</el-button></template>
    </el-dialog>

    <!-- 出库 - 详情弹窗 -->
    <el-dialog v-model="exShowDetailModal" title="出库单详情" width="900px">
      <el-descriptions :column="3" border size="small">
        <el-descriptions-item label="出库单号">{{ exSelectedRecord?.code }}</el-descriptions-item>
        <el-descriptions-item label="申请日期">{{ exSelectedRecord?.date }}</el-descriptions-item>
        <el-descriptions-item label="执行状态"><el-tag :type="getExStatusType(exSelectedRecord?.executeStatus || '')" size="small">{{ exSelectedRecord?.executeStatus }}</el-tag></el-descriptions-item>
        <el-descriptions-item label="申请人">{{ exSelectedRecord?.applicant }}</el-descriptions-item>
        <el-descriptions-item label="库存地点">{{ exSelectedRecord?.warehouseLocation }}</el-descriptions-item>
        <el-descriptions-item label="审核人">{{ exSelectedRecord?.reviewer }}</el-descriptions-item>
        <el-descriptions-item label="操作人">{{ exSelectedRecord?.operator }}</el-descriptions-item>
        <el-descriptions-item label="生产计划批次号">{{ exSelectedRecord?.productionBatchCode }}</el-descriptions-item>
        <el-descriptions-item label="来源申请单">{{ (exSelectedRecord?.sourceApplicationCodes || []).join(', ') }}</el-descriptions-item>
      </el-descriptions>
      <div class="mt-4"><h4 class="font-medium mb-2 text-sm">出库物料明细</h4>
        <el-table :data="exSelectedRecord?.materials || []" size="small" border>
          <el-table-column prop="applicationCode" label="来源领料单号" width="150" />
          <el-table-column prop="materialCode" label="物料编码" width="120" />
          <el-table-column prop="materialName" label="物料名称" min-width="140" />
          <el-table-column prop="spec" label="规格" width="90" />
          <el-table-column prop="unit" label="单位" width="70" />
          <el-table-column prop="requestedQuantity" label="申请数量" width="90" />
          <el-table-column label="实际库存" width="90">
            <template #default="{ row: m }">
              <span :class="m.stockQuantity < m.requestedQuantity ? 'text-red-600 font-medium' : 'text-green-600'">{{ m.stockQuantity }}</span>
            </template>
          </el-table-column>
          <el-table-column label="本次实发" width="90">
            <template #default="{ row: m }">
              <span v-if="m.actualQuantity > 0" :class="m.actualQuantity < m.requestedQuantity ? 'text-amber-600 font-medium' : 'text-green-600'">{{ m.actualQuantity }}</span>
              <span v-else :class="m.stockQuantity === 0 ? 'text-red-600 font-medium' : 'text-gray-400'">{{ m.actualQuantity }}</span>
            </template>
          </el-table-column>
          <el-table-column label="单价(元)" width="90">
            <template #default="{ row: m }">{{ (m.unitPrice || 0).toFixed(2) }}</template>
          </el-table-column>
          <el-table-column label="小计(元)" width="90">
            <template #default="{ row: m }">{{ ((m.requestedQuantity || 0) * (m.unitPrice || 0)).toFixed(2) }}</template>
          </el-table-column>
          <el-table-column prop="warehousePosition" label="仓库货位" width="110" />
          <el-table-column label="差异" width="70">
            <template #default="{ row: m }">
              <span v-if="m.requestedQuantity - m.actualQuantity > 0" class="text-red-600 font-medium">-{{ m.requestedQuantity - m.actualQuantity }}</span>
              <span v-else class="text-green-600">0</span>
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="备注" min-width="100" />
        </el-table>
      </div>
      <template #footer><el-button @click="exShowDetailModal = false">关闭</el-button></template>
    </el-dialog>

    <!-- 出库 - 新增弹窗 -->
    <el-dialog v-model="exShowAddModal" title="新增出库单" width="1000px" :close-on-click-modal="false">
      <el-form :model="exAddForm" label-width="100px">
        <el-row :gutter="16">
          <el-col :span="8"><el-form-item label="出库单号"><el-input v-model="exAddForm.code" readonly /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="日期"><el-date-picker v-model="exAddForm.date" type="date" value-format="YYYY-MM-DD" style="width: 100%" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="操作员"><el-select v-model="exAddForm.operator" style="width: 100%" filterable><el-option v-for="u in userList" :key="u.id" :value="u.name" :label="u.name" /></el-select></el-form-item></el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="8"><el-form-item label="仓库地点"><el-select v-model="exAddForm.warehouseLocation" style="width: 100%"><el-option v-for="w in warehouses" :key="w" :value="w" :label="w" /></el-select></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="审核人"><el-select v-model="exAddForm.reviewer" style="width: 100%" filterable><el-option v-for="u in userList" :key="u.id" :value="u.name" :label="u.name" /></el-select></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="生产批次号"><el-input v-model="exAddForm.productionBatchCode" placeholder="如：FQ2024-001" /></el-form-item></el-col>
        </el-row>
        <!-- 物料池选择 -->
        <el-divider content-position="left">物料池</el-divider>
        <el-row :gutter="16" class="mb-3">
          <el-col :span="12"><el-form-item label="来源领料单"><el-select v-model="exSelectedAppCode" placeholder="选择申请单" style="width: 100%" @change="onExAppCodeChange"><el-option v-for="app in applicationData" :key="app.code" :value="app.code" :label="app.code + ' - ' + app.applicant" /></el-select></el-form-item></el-col>
        </el-row>
        <div v-if="exSelectedAppCode && exSelectedAppMaterials.length > 0" class="mb-3 p-3 bg-gray-50 rounded-lg">
          <div class="flex gap-2 mb-2">
            <el-button size="small" type="primary" @click="handleAddToPool">添加到物料池</el-button>
            <el-checkbox v-model="exSelectAllMaterials" @change="onExSelectAll">全选</el-checkbox>
          </div>
          <el-table :data="exSelectedAppMaterials" size="small" border @selection-change="handleExMaterialSelect" ref="exMaterialTableRef" row-key="materialCode">
            <el-table-column type="selection" width="45" />
            <el-table-column prop="materialCode" label="物料编码" width="110" />
            <el-table-column prop="materialName" label="物料名称" min-width="130" />
            <el-table-column prop="spec" label="规格" width="80" />
            <el-table-column prop="unit" label="单位" width="60" />
            <el-table-column prop="requestedQuantity" label="申请数量" width="85" />
            <el-table-column label="本次实发" width="100"><template #default="{ row, $index }"><el-input-number v-model="exMaterialQuantities[$index]" :min="0" :max="row.requestedQuantity" size="small" style="width: 100%" /></template></el-table-column>
          </el-table>
        </div>
        <el-form-item label="物料池明细">
          <el-table :data="exMaterialPool" size="small" border>
            <el-table-column prop="applicationCode" label="来源单号" width="140" />
            <el-table-column prop="materialCode" label="物料编码" width="110" />
            <el-table-column prop="materialName" label="物料名称" min-width="130" />
            <el-table-column prop="spec" label="规格" width="80" />
            <el-table-column prop="unit" label="单位" width="60" />
            <el-table-column prop="requestedQuantity" label="申请数量" width="85" />
            <el-table-column prop="actualQuantity" label="本次实发" width="85" />
            <el-table-column label="操作" width="70"><template #default="{ $index }"><el-button link type="danger" size="small" @click="exMaterialPool.splice($index, 1)">移除</el-button></template></el-table-column>
          </el-table>
        </el-form-item>
      </el-form>
      <template #footer><el-button @click="exShowAddModal = false; resetExAddForm()">取消</el-button><el-button type="primary" @click="handleExSaveAdd">保存</el-button></template>
    </el-dialog>

    <!-- 出库 - 编辑弹窗 -->
    <el-dialog v-model="exShowEditModal" title="编辑出库单" width="950px" :close-on-click-modal="false">
      <el-form :model="exEditForm" label-width="110px">
        <el-row :gutter="16">
          <el-col :span="8"><el-form-item label="日期"><el-date-picker v-model="exEditForm.date" type="date" value-format="YYYY-MM-DD" style="width: 100%" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="操作员"><el-select v-model="exEditForm.operator" style="width: 100%" filterable><el-option v-for="u in userList" :key="u.id" :value="u.name" :label="u.name" /></el-select></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="审核人"><el-select v-model="exEditForm.reviewer" style="width: 100%" filterable><el-option v-for="u in userList" :key="u.id" :value="u.name" :label="u.name" /></el-select></el-form-item></el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="8"><el-form-item label="仓库地点"><el-select v-model="exEditForm.warehouseLocation" style="width: 100%"><el-option v-for="w in warehouses" :key="w" :value="w" :label="w" /></el-select></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="生产批次号"><el-input v-model="exEditForm.productionBatchCode" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="执行状态"><el-select v-model="exEditForm.executeStatus" style="width: 100%"><el-option v-for="s in ['已出库','部分出库','待出库','已取消']" :key="s" :value="s" :label="s" /></el-select></el-form-item></el-col>
        </el-row>
        <el-form-item label="物料明细">
          <el-button size="small" class="mb-2" @click="exEditForm.materials.push({ materialCode:'', materialName:'', batchNo:'', spec:'', unit:'', category:'', requestedQuantity:0, stockQuantity:0, actualQuantity:0, remark:'', applicationCode:'' })">+ 添加物料</el-button>
          <el-table :data="exEditForm.materials" size="small" border>
            <el-table-column prop="materialCode" label="物料编码" width="110"><template #default="{ row }"><el-input v-model="row.materialCode" size="small" /></template></el-table-column>
            <el-table-column prop="materialName" label="物料名称" min-width="120"><template #default="{ row }"><el-input v-model="row.materialName" size="small" /></template></el-table-column>
            <el-table-column prop="spec" label="规格" width="80"><template #default="{ row }"><el-input v-model="row.spec" size="small" /></template></el-table-column>
            <el-table-column prop="unit" label="单位" width="60"><template #default="{ row }"><el-input v-model="row.unit" size="small" /></template></el-table-column>
            <el-table-column prop="requestedQuantity" label="申请数量" width="85"><template #default="{ row }"><el-input-number v-model="row.requestedQuantity" :min="0" size="small" style="width: 100%" /></template></el-table-column>
            <el-table-column prop="actualQuantity" label="本次实发" width="85"><template #default="{ row }"><el-input-number v-model="row.actualQuantity" :min="0" size="small" style="width: 100%" /></template></el-table-column>
            <el-table-column prop="applicationCode" label="来源单号" width="130"><template #default="{ row }"><el-input v-model="row.applicationCode" size="small" /></template></el-table-column>
            <el-table-column label="操作" width="70"><template #default="{ $index }"><el-button link type="danger" size="small" @click="exEditForm.materials.splice($index, 1)">删除</el-button></template></el-table-column>
          </el-table>
        </el-form-item>
      </el-form>
      <template #footer><el-button @click="exShowEditModal = false">取消</el-button><el-button type="primary" @click="handleExSaveEdit">保存</el-button></template>
    </el-dialog>

    <!-- 出库 - 删除确认 -->
    <el-dialog v-model="exShowDeleteConfirm" title="确认删除" width="400px">
      <div class="flex items-center gap-3"><el-icon :size="40" color="#f56c6c"><WarningFilled /></el-icon><div><p class="text-lg font-medium">确定要删除该出库单吗？</p><p class="text-sm text-gray-500">此操作不可恢复</p></div></div>
      <template #footer><el-button @click="exShowDeleteConfirm = false">取消</el-button><el-button type="danger" @click="confirmExDelete">确认删除</el-button></template>
    </el-dialog>

    <!-- 出库导出 -->
    <el-dialog v-model="exShowExportTypeModal" title="选择导出格式" width="480px">
      <el-radio-group v-model="exExportFileType" class="w-full space-y-3">
        <div v-for="f in exportFormats" :key="f.value" class="flex items-center p-3 border rounded-lg cursor-pointer" :class="exExportFileType === f.value ? 'border-green-500 bg-green-50' : 'border-gray-200'" @click="exExportFileType = f.value">
          <el-radio :value="f.value"><span class="font-medium">{{ f.label }}</span><span class="block text-xs text-gray-500">{{ f.desc }}</span></el-radio>
        </div>
      </el-radio-group>
      <template #footer><el-button @click="exShowExportTypeModal = false">取消</el-button><el-button type="primary" @click="confirmExExport">导出</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Plus, Edit, Delete, Download, WarningFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import MaterialReceivingHeader from '@/components/materialReceiving/MaterialReceivingHeader.vue'

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

// 物料基础数据库
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

// 当前操作员
const currentOperatorName = computed(() => {
  return userList.value[0]?.name || '当前用户'
})

// 生产批次切换
const onProductionBatchChange = (val) => {
  if (val !== '其他') { addForm.batchRemark = '' }
}

// ==================== Tab 1: 申请领料 ====================
const applicationData = ref([
  { id: 1, code: 'LL20260301001', date: '2026-03-01', applicant: '张伟民', department: '生产部', warehouseLocation: '仓库A区', plantArea: '1号棚-叶菜区', reviewer: '王志刚', productionBatchCode: 'FQ2024-001', status: '已审批', statusClass: 'approved', materials: [
    { materialCode: 'SP0201001', materialName: '商品有机肥', spec: '50kg/袋', unit: '袋', category: '肥料与土壤改良剂', requestedQuantity: 10, stockQuantity: 150, unitPrice: 45, warehousePosition: 'A-01-01', remark: '正常出库', batchNo: '' },
    { materialCode: 'SP0202001', materialName: '尿素', spec: '50kg/袋', unit: '袋', category: '肥料与土壤改良剂', requestedQuantity: 5, stockQuantity: 80, unitPrice: 85, warehousePosition: 'A-01-02', remark: '正常出库', batchNo: '' }
  ]},
  { id: 2, code: 'LL20260302002', date: '2026-03-02', applicant: '李明轩', department: '生产部', warehouseLocation: '仓库B区', plantArea: '2号棚-茄果区', reviewer: '李志刚', productionBatchCode: 'FQ2024-002', status: '已审批', statusClass: 'approved', materials: [
    { materialCode: 'SP0301001', materialName: '吡虫啉', spec: '100g/瓶', unit: '瓶', category: '农药与植保产品', requestedQuantity: 8, stockQuantity: 120, unitPrice: 28, warehousePosition: 'B-02-03', remark: '正常出库', batchNo: '' }
  ]},
  { id: 3, code: 'LL20260303003', date: '2026-03-03', applicant: '王建国', department: '生产部', warehouseLocation: '仓库C区', plantArea: '3号棚-育苗区', reviewer: '张志远', productionBatchCode: 'FQ2024-003', status: '待审批', statusClass: 'pending', materials: [
    { materialCode: 'SP0302001', materialName: '多菌灵', spec: '200g/袋', unit: '袋', category: '农药与植保产品', requestedQuantity: 15, stockQuantity: 45, unitPrice: 35, warehousePosition: 'C-03-01', remark: '待审批', batchNo: '' },
    { materialCode: 'SP0301001', materialName: '吡虫啉', spec: '100g/瓶', unit: '瓶', category: '农药与植保产品', requestedQuantity: 10, stockQuantity: 120, unitPrice: 28, warehousePosition: 'C-03-02', remark: '待审批', batchNo: '' }
  ]},
  { id: 4, code: 'LL20260304004', date: '2026-03-04', applicant: '赵俊杰', department: '生产部', warehouseLocation: '仓库A区', plantArea: '1号棚-叶菜区', reviewer: '王志刚', productionBatchCode: 'FQ2024-004', status: '已审批', statusClass: 'approved', materials: [
    { materialCode: 'SP0103001', materialName: '番茄种子', spec: '50g/袋', unit: '袋', category: '种质资源', requestedQuantity: 12, stockQuantity: 60, unitPrice: 120, warehousePosition: 'A-02-01', remark: '正常出库', batchNo: '' }
  ]},
  { id: 5, code: 'LL20260305005', date: '2026-03-05', applicant: '钱文涛', department: '后勤部', warehouseLocation: '仓库D区', plantArea: '办公区绿化', reviewer: '陈志明', productionBatchCode: 'FQ2024-005', status: '已拒绝', statusClass: 'rejected', rejectReason: '库存不足，无法满足申请数量', materials: [] },
  { id: 6, code: 'LL20260306006', date: '2026-03-06', applicant: '孙晓峰', department: '生产部', warehouseLocation: '仓库B区', plantArea: '4号棚-水稻区', reviewer: '李志刚', productionBatchCode: 'FQ2024-006', status: '待审批', statusClass: 'pending', materials: [
    { materialCode: 'SP0202001', materialName: '尿素', spec: '50kg/袋', unit: '袋', category: '肥料与土壤改良剂', requestedQuantity: 20, stockQuantity: 80, unitPrice: 85, warehousePosition: 'B-01-02', remark: '库存充足', batchNo: '' }
  ]},
  { id: 7, code: 'LL20260307007', date: '2026-03-07', applicant: '周志强', department: '生产部', warehouseLocation: '仓库C区', plantArea: '5号棚-水果区', reviewer: '张志远', productionBatchCode: 'FQ2024-007', status: '已审批', statusClass: 'approved', materials: [
    { materialCode: 'OP0201001', materialName: '锄头', spec: '标准型', unit: '把', category: '劳保与防护用品', requestedQuantity: 5, stockQuantity: 35, unitPrice: 42, warehousePosition: 'C-04-01', remark: '正常出库', batchNo: '' },
    { materialCode: 'OP0102001', materialName: '劳保胶靴', spec: '标准码', unit: '双', category: '劳保与防护用品', requestedQuantity: 10, stockQuantity: 50, unitPrice: 68, warehousePosition: 'C-04-02', remark: '正常出库', batchNo: '' }
  ]},
  { id: 8, code: 'LL20260308008', date: '2026-03-08', applicant: '吴海龙', department: '设备部', warehouseLocation: '仓库A区', plantArea: '灌溉系统维护', reviewer: '王志刚', productionBatchCode: 'FQ2024-008', status: '已审批', statusClass: 'approved', materials: [
    { materialCode: 'EQ0103001', materialName: '电动喷雾机', spec: '标准型', unit: '台', category: '农业机械', requestedQuantity: 2, stockQuantity: 15, unitPrice: 580, warehousePosition: 'A-05-01', remark: '正常出库', batchNo: '' }
  ]},
  { id: 9, code: 'LL20260309009', date: '2026-03-09', applicant: '郑志远', department: '技术部', warehouseLocation: '仓库E区', plantArea: '实验室', reviewer: '赵志鹏', productionBatchCode: 'FQ2024-001', status: '已取消', statusClass: 'cancelled', materials: [] },
  { id: 10, code: 'LL20260310010', date: '2026-03-10', applicant: '陈思远', department: '生产部', warehouseLocation: '仓库B区', plantArea: '2号棚-茄果区', reviewer: '李志刚', productionBatchCode: 'FQ2024-002', status: '已审批', statusClass: 'approved', materials: [
    { materialCode: 'SP0101001', materialName: '水稻种子', spec: '20kg/袋', unit: '袋', category: '种质资源', requestedQuantity: 30, stockQuantity: 100, unitPrice: 65, warehousePosition: 'B-02-01', remark: '正常出库', batchNo: '' }
  ]},
  { id: 11, code: 'LL20260311011', date: '2026-03-11', applicant: '刘志伟', department: '生产部', warehouseLocation: '仓库C区', plantArea: '6号棚-花卉区', reviewer: '张志远', productionBatchCode: 'FQ2024-003', status: '待审批', statusClass: 'pending', materials: [
    { materialCode: 'EQ0306001', materialName: '滴灌带', spec: '50m/卷', unit: '卷', category: '农业机械', requestedQuantity: 20, stockQuantity: 200, unitPrice: 38, warehousePosition: 'C-05-01', remark: '待审批', batchNo: '' }
  ]},
  { id: 12, code: 'LL20260312012', date: '2026-03-12', applicant: '杨文博', department: '采后处理部', warehouseLocation: '仓库A区', plantArea: '采后处理车间', reviewer: '王志刚', productionBatchCode: 'FQ2024-004', status: '已审批', statusClass: 'approved', materials: [
    { materialCode: 'PH0104001', materialName: '塑料袋', spec: '标准型', unit: '卷', category: '采收容器', requestedQuantity: 50, stockQuantity: 500, unitPrice: 8.5, warehousePosition: 'A-03-01', remark: '正常出库', batchNo: '' },
    { materialCode: 'IT0101001', materialName: '土壤温湿度传感器', spec: '标准型', unit: '个', category: '监测设备', requestedQuantity: 5, stockQuantity: 30, unitPrice: 260, warehousePosition: 'A-04-01', remark: '正常出库', batchNo: '' }
  ]}
])

const searchCode = ref('')
const searchApplicant = ref('')
const searchBatchCode = ref('')
const searchWarehouse = ref('')
const statusFilter = ref('all')
const currentPage = ref(1)
const pageSize = ref(10)
const selectedRows = ref([])
const expandedRows = ref([])
const batchEditMode = ref(null)
const deleteMode = ref(false)
const exportMode = ref(false)
const showDetailModal = ref(false)
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteConfirm = ref(false)
const showVoidModal = ref(false)
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

const getAppStatusType = (status) => {
  const m = { '已审批': 'success', '待审批': 'warning', '已拒绝': 'danger', '已作废': 'info', '已取消': 'info' }
  return m[status] || ''
}

const handleReset = () => {
  searchCode.value = ''; searchApplicant.value = ''; searchBatchCode.value = ''; searchWarehouse.value = ''; statusFilter.value = 'all'; currentPage.value = 1
}

const handleSelectionChange = (sel) => { selectedRows.value = sel.map(s => s.id) }
const handleExpandChange = (row, rows) => {
  const idx = expandedRows.value.indexOf(row.id)
  if (idx > -1) expandedRows.value.splice(idx, 1)
  else expandedRows.value.push(row.id)
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

const confirmDelete = () => {
  if (deletingId.value !== null) {
    applicationData.value = applicationData.value.filter(item => item.id !== deletingId.value)
    ElMessage.success('删除成功')
  }
  showDeleteConfirm.value = false; deletingId.value = null
}

// 新增表单
const getDefaultAddForm = () => ({
  code: '', date: new Date().toISOString().split('T')[0], applicant: '', department: '', warehouseLocation: '', plantArea: '', reviewer: '', productionBatchCode: '', batchRemark: '', materials: []
})
const addForm = reactive(getDefaultAddForm())

const resetAddForm = () => {
  Object.assign(addForm, getDefaultAddForm())
}

const handleOpenAdd = () => {
  resetAddForm()
  showAddModal.value = true
}

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

const handleSaveAdd = () => {
  if (!addForm.applicant) { ElMessage.warning('请选择申领人'); return }
  if (addForm.materials.length === 0) { ElMessage.warning('请添加至少一个物料'); return }
  if (!addForm.code) handleGenerateAddCode()
  const newRecord = {
    id: Date.now(),
    code: addForm.code,
    date: addForm.date,
    applicant: addForm.applicant,
    department: addForm.department,
    warehouseLocation: addForm.warehouseLocation,
    plantArea: addForm.plantArea,
    reviewer: addForm.reviewer,
    productionBatchCode: addForm.productionBatchCode,
    status: '待审批',
    statusClass: 'pending',
    materials: JSON.parse(JSON.stringify(addForm.materials))
  }
  applicationData.value.unshift(newRecord)
  ElMessage.success('新增成功')
  showAddModal.value = false
  resetAddForm()
}

// 编辑表单
const editForm = reactive({ date: '', applicant: '', department: '', warehouseLocation: '', plantArea: '', reviewer: '', productionBatchCode: '', status: '', materials: [] })
const handleEditAddMaterial = () => {
  editForm.materials.push({ materialCode: '', materialName: '', batchNo: '', spec: '', unit: '', category: '', requestedQuantity: 1, stockQuantity: 0, unitPrice: 0, warehousePosition: '', remark: '' })
}

const handleSaveEdit = () => {
  if (!selectedRecord.value) return
  const rec = applicationData.value.find(r => r.id === selectedRecord.value.id)
  if (rec) {
    Object.assign(rec, {
      date: editForm.date, applicant: editForm.applicant, department: editForm.department,
      warehouseLocation: editForm.warehouseLocation, plantArea: editForm.plantArea,
      reviewer: editForm.reviewer, productionBatchCode: editForm.productionBatchCode,
      status: '待审批', statusClass: 'pending', materials: JSON.parse(JSON.stringify(editForm.materials))
    })
  }
  ElMessage.success('编辑已保存，领料单已重新提交')
  showEditModal.value = false
}

const handleBatchDelete = () => {
  applicationData.value = applicationData.value.filter(item => !selectedRows.value.includes(item.id))
  ElMessage.success(`删除了 ${selectedRows.value.length} 条记录`)
  showBatchDeleteConfirm.value = false
  batchEditMode.value = null
  selectedRows.value = []
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

  let content = ''; let mimeType = ''; let extension = ''
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
const executeData = ref([
  { id: 1, code: 'CK20260301001', date: '2026-03-01', applicant: '张伟民', warehouseLocation: '仓库A区', reviewer: '王志刚', operator: '李操作员', productionBatchCode: 'FQ2024-001', sourceApplicationCodes: ['LL20260301001', 'LL20260302002'], executeStatus: '已出库', executeStatusClass: 'completed', materials: [
    { materialCode: 'SP0201001', materialName: '商品有机肥', spec: '50kg/袋', unit: '袋', category: '肥料与土壤改良剂', requestedQuantity: 10, stockQuantity: 100, actualQuantity: 10, remark: '正常出库', applicationCode: 'LL20260301001', batchNo: '' },
    { materialCode: 'SP0202001', materialName: '尿素', spec: '50kg/袋', unit: '袋', category: '肥料与土壤改良剂', requestedQuantity: 5, stockQuantity: 50, actualQuantity: 5, remark: '正常出库', applicationCode: 'LL20260301001', batchNo: '' },
    { materialCode: 'SP0301001', materialName: '吡虫啉', spec: '100g/瓶', unit: '瓶', category: '农药与植保产品', requestedQuantity: 8, stockQuantity: 200, actualQuantity: 8, remark: '正常出库', applicationCode: 'LL20260302002', batchNo: '' }
  ]},
  { id: 2, code: 'CK20260304002', date: '2026-03-04', applicant: '赵俊杰', warehouseLocation: '仓库A区', reviewer: '王志刚', operator: '张操作员', productionBatchCode: 'FQ2024-004', sourceApplicationCodes: ['LL20260304004'], executeStatus: '部分出库', executeStatusClass: 'partial', materials: [
    { materialCode: 'SP0103001', materialName: '番茄种子', spec: '50g/袋', unit: '袋', category: '种质资源', requestedQuantity: 12, stockQuantity: 8, actualQuantity: 8, remark: '库存不足，实际发放8袋', applicationCode: 'LL20260304004', batchNo: '' }
  ]},
  { id: 3, code: 'CK20260307003', date: '2026-03-07', applicant: '周志强', warehouseLocation: '仓库C区', reviewer: '张志远', operator: '王操作员', productionBatchCode: 'FQ2024-007', sourceApplicationCodes: ['LL20260307007'], executeStatus: '待出库', executeStatusClass: 'pending_out', materials: [
    { materialCode: 'OP0201001', materialName: '锄头', spec: '标准型', unit: '把', category: '劳保与防护用品', requestedQuantity: 5, stockQuantity: 50, actualQuantity: 0, remark: '待出库', applicationCode: 'LL20260307007', batchNo: '' },
    { materialCode: 'OP0102001', materialName: '劳保胶靴', spec: '标准码', unit: '双', category: '劳保与防护用品', requestedQuantity: 10, stockQuantity: 30, actualQuantity: 0, remark: '待出库', applicationCode: 'LL20260307007', batchNo: '' }
  ]},
  { id: 4, code: 'CK20260308004', date: '2026-03-08', applicant: '吴海龙', warehouseLocation: '仓库A区', reviewer: '王志刚', operator: '李操作员', productionBatchCode: 'FQ2024-008', sourceApplicationCodes: ['LL20260308008'], executeStatus: '待出库', executeStatusClass: 'pending_out', materials: [
    { materialCode: 'EQ0103001', materialName: '电动喷雾机', spec: '标准型', unit: '台', category: '农业机械', requestedQuantity: 2, stockQuantity: 10, actualQuantity: 0, remark: '待出库', applicationCode: 'LL20260308008', batchNo: '' }
  ]},
  { id: 5, code: 'CK20260310005', date: '2026-03-10', applicant: '陈思远', warehouseLocation: '仓库B区', reviewer: '李志刚', operator: '赵操作员', productionBatchCode: 'FQ2024-002', sourceApplicationCodes: ['LL20260310010'], executeStatus: '已出库', executeStatusClass: 'completed', materials: [
    { materialCode: 'SP0101001', materialName: '水稻种子', spec: '20kg/袋', unit: '袋', category: '种质资源', requestedQuantity: 30, stockQuantity: 200, actualQuantity: 30, remark: '正常出库', applicationCode: 'LL20260310010', batchNo: '' }
  ]},
  { id: 6, code: 'CK20260312006', date: '2026-03-12', applicant: '杨文博', warehouseLocation: '仓库A区', reviewer: '王志刚', operator: '张操作员', productionBatchCode: 'FQ2024-004', sourceApplicationCodes: ['LL20260312012'], executeStatus: '部分出库', executeStatusClass: 'partial', materials: [
    { materialCode: 'PH0104001', materialName: '塑料袋', spec: '标准型', unit: '卷', category: '采收容器', requestedQuantity: 50, stockQuantity: 50, actualQuantity: 50, remark: '正常出库', applicationCode: 'LL20260312012', batchNo: '' },
    { materialCode: 'IT0101001', materialName: '土壤温湿度传感器', spec: '标准型', unit: '个', category: '监测设备', requestedQuantity: 5, stockQuantity: 2, actualQuantity: 2, remark: '库存不足，实际发放2个', applicationCode: 'LL20260312012', batchNo: '' }
  ]},
  { id: 7, code: 'CK20260313007', date: '2026-03-13', applicant: '刘志刚', warehouseLocation: '仓库D区', reviewer: '张志明', operator: '孙操作员', productionBatchCode: 'FQ2024-005', sourceApplicationCodes: ['LL20260313013'], executeStatus: '已取消', executeStatusClass: 'cancelled', materials: [] },
  { id: 8, code: 'CK20260314008', date: '2026-03-14', applicant: '王秀英', warehouseLocation: '仓库C区', reviewer: '李志远', operator: '周操作员', productionBatchCode: 'FQ2024-006', sourceApplicationCodes: ['LL20260314014'], executeStatus: '待出库', executeStatusClass: 'pending_out', materials: [
    { materialCode: 'EQ0306001', materialName: '滴灌带', spec: '50m/卷', unit: '卷', category: '农业机械', requestedQuantity: 20, stockQuantity: 0, actualQuantity: 0, remark: '库存为0，无法出库', applicationCode: 'LL20260314014', batchNo: '' }
  ]}
])

const exSearchCode = ref('')
const exSearchApplicant = ref('')
const exSearchBatchCode = ref('')
const exSearchWarehouse = ref('')
const exStatusFilter = ref('all')
const exCurrentPage = ref(1)
const exPageSize = ref(10)
const exSelectedRows = ref([])
const exExpandedRows = ref([])
const exBatchEditMode = ref(null)
const exExportMode = ref(false)
const exShowDetailModal = ref(false)
const exShowAddModal = ref(false)
const exShowEditModal = ref(false)
const exShowDeleteConfirm = ref(false)
const exShowExportTypeModal = ref(false)
const exExportFileType = ref('xlsx')
const exSelectedRecord = ref(null)
const exDeletingId = ref(null)
const exSelectedAppCode = ref('')
const exSelectedAppMaterials = ref([])
const exMaterialQuantities = ref({})
const exSelectedMaterialIndices = ref([])
const exMaterialPool = ref([])
const exMaterialTableRef = ref(null)
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

const getExStatusType = (status) => {
  const m = { '已出库': 'success', '部分出库': 'warning', '待出库': 'info', '已取消': 'info' }
  return m[status] || ''
}

const handleExSelectionChange = (sel) => { exSelectedRows.value = sel.map(s => s.id) }
const handleExExpandChange = (row) => {
  const idx = exExpandedRows.value.indexOf(row.id)
  if (idx > -1) exExpandedRows.value.splice(idx, 1)
  else exExpandedRows.value.push(row.id)
}

const handleExViewDetail = (row) => { exSelectedRecord.value = row; exShowDetailModal.value = true }

const handleExEditRecord = (row) => {
  exSelectedRecord.value = row
  exEditForm.date = row.date
  exEditForm.applicant = row.applicant
  exEditForm.warehouseLocation = row.warehouseLocation
  exEditForm.reviewer = row.reviewer
  exEditForm.operator = row.operator
  exEditForm.productionBatchCode = row.productionBatchCode
  exEditForm.executeStatus = row.executeStatus
  exEditForm.materials = JSON.parse(JSON.stringify(row.materials))
  exShowEditModal.value = true
}

const handleExDeleteRecord = (id) => { exDeletingId.value = id; exShowDeleteConfirm.value = true }

const confirmExDelete = () => {
  executeData.value = executeData.value.filter(item => item.id !== exDeletingId.value)
  ElMessage.success('删除成功')
  exShowDeleteConfirm.value = false; exDeletingId.value = null
}

// 出库新增 & 物料池
const exAddForm = reactive({ code: '', date: new Date().toISOString().split('T')[0], applicant: '', warehouseLocation: '仓库A区', reviewer: '', operator: '', productionBatchCode: '', materials: [] })

const resetExAddForm = () => {
  exAddForm.code = ''; exAddForm.date = new Date().toISOString().split('T')[0]; exAddForm.applicant = ''; exAddForm.warehouseLocation = '仓库A区'; exAddForm.reviewer = ''; exAddForm.operator = ''; exAddForm.productionBatchCode = ''; exAddForm.materials = []
  exSelectedAppCode.value = ''; exSelectedAppMaterials.value = []; exMaterialQuantities.value = {}; exSelectedMaterialIndices.value = []; exMaterialPool.value = []
}

const handleOpenExAdd = () => {
  resetExAddForm()
  exAddForm.code = `CK${new Date().getFullYear()}${String(new Date().getMonth()+1).padStart(2,'0')}${String(new Date().getDate()).padStart(2,'0')}${String(executeData.value.length+1).padStart(3,'0')}`
  exShowAddModal.value = true
}

const onExAppCodeChange = (code) => {
  const app = applicationData.value.find(a => a.code === code)
  exSelectedAppMaterials.value = app ? app.materials : []
  exMaterialQuantities.value = {}
  exSelectedMaterialIndices.value = []
  if (app) { app.materials.forEach((m, i) => { exMaterialQuantities.value[i] = m.requestedQuantity }) }
}

const handleExMaterialSelect = (sel) => { exSelectedMaterialIndices.value = sel }
const onExSelectAll = (val) => {
  if (val) { exSelectedMaterialIndices.value = [...exSelectedAppMaterials.value] }
  else { exSelectedMaterialIndices.value = [] }
}

const handleAddToPool = () => {
  if (!exSelectedAppCode.value || exSelectedMaterialIndices.value.length === 0) { ElMessage.warning('请先选择领料单并勾选要出库的物料'); return }
  const selectedApp = applicationData.value.find(app => app.code === exSelectedAppCode.value)
  if (!selectedApp) return
  const newMaterials = exSelectedMaterialIndices.value.map(row => {
    const idx = exSelectedAppMaterials.value.findIndex(m => m.materialCode === row.materialCode)
    const actualQty = exMaterialQuantities.value[idx] !== undefined ? exMaterialQuantities.value[idx] : row.requestedQuantity
    const poolIdx = exMaterialPool.value.findIndex(m => m.materialCode === row.materialCode && m.applicationCode === exSelectedAppCode.value)
    if (poolIdx >= 0) {
      exMaterialPool.value[poolIdx].actualQuantity += actualQty
      return null
    }
    return {
      materialCode: row.materialCode, materialName: row.materialName, batchNo: row.batchNo || '',
      spec: row.spec, unit: row.unit, category: row.category,
      requestedQuantity: row.requestedQuantity, stockQuantity: actualQty, actualQuantity: actualQty,
      remark: actualQty === row.requestedQuantity ? '正常出库' : '部分出库', applicationCode: exSelectedAppCode.value
    }
  }).filter(Boolean)
  exMaterialPool.value = [...exMaterialPool.value, ...newMaterials]
  exSelectedMaterialIndices.value = []
}

const handleExSaveAdd = () => {
  if (exMaterialPool.value.length === 0) { ElMessage.warning('请先添加物料到物料池'); return }
  const sourceAppCodes = [...new Set(exMaterialPool.value.map(m => m.applicationCode))]
  const firstMat = exMaterialPool.value[0]
  const sourceApp = applicationData.value.find(app => app.code === firstMat.applicationCode)
  const hasPartial = exMaterialPool.value.some(m => m.actualQuantity < m.requestedQuantity)
  const newRecord = {
    id: Date.now(),
    code: exAddForm.code,
    date: exAddForm.date,
    applicant: exAddForm.applicant || sourceApp?.applicant || '',
    warehouseLocation: exAddForm.warehouseLocation,
    reviewer: exAddForm.reviewer || sourceApp?.reviewer || '',
    operator: exAddForm.operator,
    productionBatchCode: exAddForm.productionBatchCode || sourceApp?.productionBatchCode || '',
    sourceApplicationCodes: sourceAppCodes,
    executeStatus: hasPartial ? '部分出库' : '已出库',
    executeStatusClass: hasPartial ? 'partial' : 'completed',
    materials: JSON.parse(JSON.stringify(exMaterialPool.value))
  }
  executeData.value.unshift(newRecord)
  ElMessage.success('新增成功')
  exShowAddModal.value = false; resetExAddForm()
}

// 出库编辑
const exEditForm = reactive({ date: '', applicant: '', warehouseLocation: '', reviewer: '', operator: '', productionBatchCode: '', executeStatus: '', materials: [] })

const handleExSaveEdit = () => {
  if (!exSelectedRecord.value) return
  const rec = executeData.value.find(r => r.id === exSelectedRecord.value.id)
  if (rec) {
    Object.assign(rec, {
      date: exEditForm.date, applicant: exEditForm.applicant, warehouseLocation: exEditForm.warehouseLocation,
      reviewer: exEditForm.reviewer, operator: exEditForm.operator, productionBatchCode: exEditForm.productionBatchCode,
      executeStatus: exEditForm.executeStatus, materials: JSON.parse(JSON.stringify(exEditForm.materials))
    })
  }
  ElMessage.success('保存成功')
  exShowEditModal.value = false
}

const confirmExExport = () => {
  const exportData = exSelectedRows.value.length > 0
    ? executeData.value.filter(item => exSelectedRows.value.includes(item.id))
    : exFilteredData.value
  const headers = ['出库单号', '日期', '申领人', '仓库地点', '审核人', '操作员', '生产批次号', '执行状态']
  const fields = ['code', 'date', 'applicant', 'warehouseLocation', 'reviewer', 'operator', 'productionBatchCode', 'executeStatus']

  let content = ''; let mimeType = ''; let extension = ''
  if (exExportFileType.value === 'csv') {
    content = '﻿' + headers.join(',') + '\n' + exportData.map(r => fields.map(f => `"${r[f] || ''}"`).join(',')).join('\n')
    mimeType = 'text/csv;charset=utf-8'; extension = 'csv'
  } else if (exExportFileType.value === 'xlsx') {
    content = `<html><head><meta charset="utf-8"></head><body><table border="1"><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>${exportData.map(r => `<tr>${fields.map(f => `<td>${r[f] || ''}</td>`).join('')}</tr>`).join('')}</table></body></html>`
    mimeType = 'application/vnd.ms-excel;charset=utf-8'; extension = 'xlsx'
  } else {
    content = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"></head><body><table border="1"><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>${exportData.map(r => `<tr>${fields.map(f => `<td>${r[f] || ''}</td>`).join('')}</tr>`).join('')}</table></body></html>`
    mimeType = 'application/vnd.ms-word;charset=utf-8'; extension = 'docx'
  }
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = `领料出库_${new Date().toISOString().slice(0,10)}.${extension}`
  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url)
  exShowExportTypeModal.value = false; exExportMode.value = false; exSelectedRows.value = []
  ElMessage.success('导出成功')
}

// ==================== Tab 3: 领料统计 ====================
const statSubTabs = [{ key: 'monthly', label: '月度汇总' }, { key: 'material', label: '分类汇总' }]
const statActiveTab = ref('monthly')
const statYearFilter = ref(String(new Date().getFullYear()))
const statMonthFilter = ref('all')
const statMaterialSearch = ref('')
const statDepartmentFilter = ref([])
const statCategoryFilter = ref([])
const statCurrentPage = ref(1)

const years = ['2025', '2026']
const statCategoryOptions = ['肥料与土壤改良剂', '农药与植保产品', '种质资源', '农业机械', '劳保与防护用品', '监测设备', '采收容器']

const statCards = [
  { label: '领料单数', value: '268', color: '#059669', subLabel: '本月新增 22 单' },
  { label: '领料总量', value: '36,800', color: '#2563EB', subLabel: '本月 1,680 单位' },
  { label: '领料总金额', value: '¥924,580', color: '#D97706', subLabel: '本月 ¥38,250' },
  { label: '平均差异率', value: '-1.8%', color: '#DC2626', subLabel: '较上月下降 0.3%' }
]

// 月度趋势数据
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
  return categoryTrendData
    .filter(d => d.month.startsWith(statYearFilter.value))
    .map(d => {
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
  const monthData = categoryTrendData.find(d => d.month === month)
  if (!monthData) return []
  const totalQty = categorySummaryData.reduce((sum, cat) => sum + ((monthData)[cat.key] || 0), 0)
  return categorySummaryData.map(cat => {
    const qty = (monthData)[cat.key] || 0
    return { categoryName: cat.name, quantity: qty, amount: qty * 30, percentage: totalQty > 0 ? (qty / totalQty) * 100 : 0 }
  })
}

// 物料统计模拟数据
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
    if (statMaterialSearch.value) {
      const s = statMaterialSearch.value.toLowerCase()
      if (!item.materialCode.toLowerCase().includes(s) && !item.materialName.toLowerCase().includes(s)) return false
    }
    if (statDepartmentFilter.value.length > 0 && !statDepartmentFilter.value.includes(item.requisitionDepartment)) return false
    if (statCategoryFilter.value.length > 0 && !statCategoryFilter.value.includes(item.category)) return false
    return true
  })
})

const paginatedMaterialStatData = computed(() => {
  const start = (statCurrentPage.value - 1) * 10
  return filteredMaterialStatData.value.slice(start, start + 10)
})

// ==================== Tab 4: 成本核算 ====================
const costKPIs = [
  { label: '总成本', value: '¥924,580', trend: 5.2 },
  { label: '本月成本', value: '¥38,250', trend: -2.1 },
  { label: '平均批次成本', value: '¥3,850', trend: 1.8 },
  { label: '单位面积成本', value: '¥12.5/m²', trend: -0.5 }
]

const costCategoryData = categorySummaryData
const costTrendData = categoryTrendData

const maxTrendQty = computed(() => Math.max(...costTrendData.map(d => d.total), 1))
</script>

<style scoped>
/* 蓝色渐变表头 - 与V1.1保持一致 */
:deep(.el-table__header-wrapper .el-table__header th) {
  background: linear-gradient(to right, #3b82f6, #2563eb) !important;
  color: #fff !important;
  font-weight: 600 !important;
}
:deep(.el-table__header-wrapper .el-table__header th .cell) {
  color: #fff !important;
}
</style>
