<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
            <el-icon :size="24" color="white"><RefreshLeft /></el-icon>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">生产退料</h1>
            <p class="text-gray-500">生产退料记录管理</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 搜索区域 -->
    <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm">
      <div class="grid grid-cols-6 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">退料单号</label>
          <el-input v-model="searchForm.code" placeholder="请输入" clearable @clear="updateSearchField('code', '')" @input="updateSearchField('code', $event)" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">物料名称</label>
          <el-input v-model="searchForm.material" placeholder="请输入" clearable @clear="updateSearchField('material', '')" @input="updateSearchField('material', $event)" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">仓库位置</label>
          <el-input v-model="searchForm.warehouse" placeholder="请输入" clearable @clear="updateSearchField('warehouse', '')" @input="updateSearchField('warehouse', $event)" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">申请人</label>
          <el-input v-model="searchForm.applicant" placeholder="请输入" clearable @clear="updateSearchField('applicant', '')" @input="updateSearchField('applicant', $event)" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">状态</label>
          <el-select v-model="searchForm.status" placeholder="全部状态" @change="updateSearchField('status', $event)">
            <el-option v-for="opt in STATUS_OPTIONS" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">部门</label>
          <el-select v-model="searchForm.department" placeholder="全部部门" @change="updateSearchField('department', $event)">
            <el-option label="全部部门" value="all" />
            <el-option v-for="dept in departmentOptions" :key="dept" :label="dept" :value="dept" />
          </el-select>
        </div>
      </div>
      <div class="mt-4 flex justify-end">
        <el-button @click="handleReset">重置</el-button>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900">生产退料单列表</h3>
        <div class="flex gap-2">
          <!-- 导出模式 -->
          <template v-if="exportMode">
            <el-button type="primary" size="small" @click="handleExportClick">
              <el-icon><Download /></el-icon>确认导出
            </el-button>
            <el-button size="small" @click="handleCancelExport">取消</el-button>
          </template>
          <!-- 默认模式 -->
          <template v-else>
            <template v-if="!batchEditMode && !deleteMode">
              <el-button type="primary" size="small" @click="showAddModal = true">
                <el-icon><Plus /></el-icon>新增
              </el-button>
              <el-button size="small" @click="enterBatchEditMode">
                <el-icon><Edit /></el-icon>编辑
              </el-button>
              <el-button size="small" type="danger" @click="enterDeleteMode">
                <el-icon><Delete /></el-icon>删除
              </el-button>
              <el-button size="small" @click="exportMode = true">
                <el-icon><Download /></el-icon>导出
              </el-button>
            </template>
            <!-- 删除模式 -->
            <template v-if="deleteMode">
              <el-button type="danger" size="small" @click="showBatchDeleteConfirm = true">确认删除</el-button>
              <el-button size="small" @click="cancelDeleteMode">取消</el-button>
            </template>
            <!-- 编辑模式 -->
            <template v-if="batchEditMode">
              <el-button type="primary" size="small" @click="openBatchEditOrWarn">确认编辑</el-button>
              <el-button size="small" @click="cancelBatchEditMode">取消</el-button>
            </template>
          </template>
        </div>
      </div>

      <!-- 表格 -->
      <el-table
        :data="paginatedReturns"
        stripe
        row-key="id"
        @selection-change="onSelectionChange"
      >
        <!-- 选择列（有激活模式时显示） -->
        <el-table-column v-if="exportMode || batchEditMode || deleteMode" type="selection" width="55" :selectable="checkSelectable" />
        <!-- 展开列 -->
        <el-table-column width="50">
          <template #default="{ row }">
            <el-button link @click="toggleExpandRow(row.id)">
              <el-icon><component :is="expandedRows.has(row.id) ? 'ArrowDown' : 'ArrowRight'" /></el-icon>
            </el-button>
          </template>
        </el-table-column>
        <el-table-column prop="code" label="退料单号" width="160">
          <template #default="{ row }">
            <span class="text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer underline" @click="handleView(row)">{{ row.code }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="date" label="退料日期" width="110" />
        <el-table-column prop="type" label="退料类型" width="100" />
        <el-table-column prop="applicant" label="申请人" width="90" />
        <el-table-column prop="operator" label="操作人" width="90">
          <template #default="{ row }">{{ row.operator || '-' }}</template>
        </el-table-column>
        <el-table-column prop="department" label="退料部门" width="100" />
        <el-table-column prop="warehouseLocation" label="仓库位置" width="100" />
        <el-table-column label="审批状态" width="100">
          <template #default="{ row }">
            <span class="inline-flex px-2 py-1 rounded-full text-xs font-medium" :class="getStatusClass(row)">
              {{ row.status }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="reviewer" label="审核人" width="90">
          <template #default="{ row }">{{ row.reviewer || '-' }}</template>
        </el-table-column>
        <el-table-column label="备注" min-width="120">
          <template #default="{ row }">{{ row.remark || '-' }}</template>
        </el-table-column>
        <el-table-column label="操作" width="170" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleView(row)">查看</el-button>
            <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" size="small" @click="handleVoidApply(row)">作废</el-button>
          </template>
        </el-table-column>

        <!-- 展开行：物料明细 -->
        <template #expand="{ row }">
          <div class="p-4 bg-gray-50">
            <h4 class="font-medium mb-2 text-gray-700">退料物料明细</h4>
            <el-table :data="row.materials" size="small" border>
              <el-table-column prop="sourceApplicationCode" label="来源领料单号" width="140" />
              <el-table-column prop="materialCode" label="物料编码" width="110" />
              <el-table-column prop="category" label="物料分类" width="120" />
              <el-table-column prop="materialName" label="物料名称" min-width="120" />
              <el-table-column prop="spec" label="规格" width="100" />
              <el-table-column prop="unit" label="单位" width="60" />
              <el-table-column prop="quantity" label="领料数量" width="90" />
              <el-table-column prop="unitPrice" label="单价(元)" width="90" />
              <el-table-column label="小计(元)" width="100">
                <template #default="{ row: mr }">{{ (mr.quantity * mr.unitPrice).toFixed(2) }}</template>
              </el-table-column>
              <el-table-column prop="warehousePosition" label="仓库货位" width="100" />
              <el-table-column prop="reason" label="退料原因" width="100" />
            </el-table>
          </div>
        </template>
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
          <span class="text-sm text-gray-500">共 {{ filteredReturns.length }} 条，第 {{ currentPage }} / {{ totalPages }} 页</span>
          <el-pagination
            v-model:current-page="currentPage"
            :page-size="pageSize"
            :total="filteredReturns.length"
            layout="prev, pager, next"
          />
        </div>
      </div>
    </div>

    <!-- ========== 模态弹窗 ========== -->

    <!-- 查看详情弹窗 -->
    <el-dialog v-model="showDetailModal" title="退料单详情" width="900px">
      <template v-if="selectedRecord">
        <el-descriptions :column="3" border size="small">
          <el-descriptions-item label="退料单号">{{ selectedRecord.code }}</el-descriptions-item>
          <el-descriptions-item label="退料日期">{{ selectedRecord.date }}</el-descriptions-item>
          <el-descriptions-item label="退料类型">{{ selectedRecord.type }}</el-descriptions-item>
          <el-descriptions-item label="申请人">{{ selectedRecord.applicant }}</el-descriptions-item>
          <el-descriptions-item label="退料部门">{{ selectedRecord.department }}</el-descriptions-item>
          <el-descriptions-item label="仓库位置">{{ selectedRecord.warehouseLocation }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <span class="inline-flex px-2 py-1 rounded-full text-xs font-medium" :class="getStatusClass(selectedRecord)">{{ selectedRecord.status }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="操作人">{{ selectedRecord.operator || '-' }}</el-descriptions-item>
          <el-descriptions-item label="审核人">{{ selectedRecord.reviewer || '-' }}</el-descriptions-item>
          <el-descriptions-item label="审核日期">{{ selectedRecord.reviewDate || '-' }}</el-descriptions-item>
          <el-descriptions-item label="驳回原因" :span="2">
            <span v-if="selectedRecord.rejectReason" class="text-red-600">{{ selectedRecord.rejectReason }}</span>
            <span v-else>-</span>
          </el-descriptions-item>
          <el-descriptions-item label="备注" :span="3">{{ selectedRecord.remark || '-' }}</el-descriptions-item>
        </el-descriptions>

        <div class="mt-4">
          <h4 class="font-medium mb-2">退料物料明细</h4>
          <el-table :data="selectedRecord.materials" size="small" border>
            <el-table-column prop="sourceApplicationCode" label="来源领料单号" width="140" />
            <el-table-column prop="materialCode" label="物料编码" width="110" />
            <el-table-column prop="category" label="物料分类" width="120" />
            <el-table-column prop="materialName" label="物料名称" min-width="120" />
            <el-table-column prop="spec" label="规格" width="100" />
            <el-table-column prop="unit" label="单位" width="60" />
            <el-table-column prop="returnQuantity" label="退料数量" width="90" />
            <el-table-column prop="unitPrice" label="单价(元)" width="90" />
            <el-table-column label="小计(元)" width="100">
              <template #default="{ row: mr }">{{ (mr.returnQuantity * mr.unitPrice).toFixed(2) }}</template>
            </el-table-column>
            <el-table-column prop="warehousePosition" label="仓库货位" width="100" />
            <el-table-column prop="reason" label="退料原因" width="100" />
          </el-table>
        </div>
      </template>
      <template #footer><el-button @click="showDetailModal = false">关闭</el-button></template>
    </el-dialog>

    <!-- 新增弹窗 -->
    <el-dialog v-model="showAddModal" title="新增退料单" width="1000px" :close-on-click-modal="false" @close="handleCancelAdd">
      <el-form :model="addForm" label-width="100px">
        <div class="flex items-center gap-2 mb-4">
          <el-button size="small" @click="handleGenerateCode" :icon="Refresh"><el-icon><Refresh /></el-icon>生成单号</el-button>
          <span v-if="addForm.code" class="text-sm font-mono text-gray-700">{{ addForm.code }}</span>
        </div>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="退料日期">
              <el-date-picker v-model="addForm.date" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="申请人">
              <el-select v-model="addForm.applicant" filterable>
                <el-option v-for="a in APPLICANTS" :key="a" :label="a" :value="a" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="退料部门">
              <el-select v-model="addForm.department" filterable>
                <el-option v-for="d in departmentOptions" :key="d" :label="d" :value="d" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="仓库位置">
              <el-select v-model="addForm.warehouseLocation" filterable>
                <el-option v-for="w in WAREHOUSE_LOCATIONS" :key="w" :label="w" :value="w" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="操作人">
              <el-input v-model="addForm.operator" placeholder="默认为当前用户" readonly />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="审核人">
              <el-select v-model="addForm.reviewer" filterable>
                <el-option v-for="r in REVIEWERS" :key="r" :label="r" :value="r" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="16">
            <el-form-item label="备注">
              <el-input v-model="addForm.remark" placeholder="请输入备注" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 物料明细 -->
        <el-form-item label="退料物料">
          <div class="mb-2 flex gap-2">
            <el-button size="small" @click="handleAddMaterial"><el-icon><Plus /></el-icon>添加物料</el-button>
            <el-button size="small" @click="handleOpenMaterialSelect">从仓库选择物料</el-button>
          </div>
          <el-table :data="addForm.materials" size="small" border>
            <el-table-column label="来源单号" width="130">
              <template #default="{ row: mr, $index }">
                <el-input v-model="mr.sourceApplicationCode" size="small" placeholder="领料单号" @input="v => handleMaterialChange($index, 'sourceApplicationCode', v)" />
              </template>
            </el-table-column>
            <el-table-column label="物料编码" width="110">
              <template #default="{ row: mr, $index }">
                <el-input v-model="mr.materialCode" size="small" @input="v => handleMaterialChange($index, 'materialCode', v)" />
              </template>
            </el-table-column>
            <el-table-column label="分类" width="120">
              <template #default="{ row: mr, $index }">
                <el-input v-model="mr.category" size="small" @input="v => handleMaterialChange($index, 'category', v)" />
              </template>
            </el-table-column>
            <el-table-column label="物料名称" min-width="110">
              <template #default="{ row: mr, $index }">
                <el-input v-model="mr.materialName" size="small" @input="v => handleMaterialChange($index, 'materialName', v)" />
              </template>
            </el-table-column>
            <el-table-column label="规格" width="90">
              <template #default="{ row: mr, $index }">
                <el-input v-model="mr.spec" size="small" @input="v => handleMaterialChange($index, 'spec', v)" />
              </template>
            </el-table-column>
            <el-table-column label="单位" width="70">
              <template #default="{ row: mr, $index }">
                <el-input v-model="mr.unit" size="small" @input="v => handleMaterialChange($index, 'unit', v)" />
              </template>
            </el-table-column>
            <el-table-column label="退料数量" width="100">
              <template #default="{ row: mr, $index }">
                <el-input-number v-model="mr.returnQuantity" :min="0" size="small" style="width: 100%" @change="v => handleMaterialChange($index, 'returnQuantity', v)" />
              </template>
            </el-table-column>
            <el-table-column label="单价" width="90">
              <template #default="{ row: mr, $index }">
                <el-input-number v-model="mr.unitPrice" :min="0" :precision="2" size="small" style="width: 100%" @change="v => handleMaterialChange($index, 'unitPrice', v)" />
              </template>
            </el-table-column>
            <el-table-column label="货位" width="90">
              <template #default="{ row: mr, $index }">
                <el-input v-model="mr.warehousePosition" size="small" @input="v => handleMaterialChange($index, 'warehousePosition', v)" />
              </template>
            </el-table-column>
            <el-table-column label="退料原因" width="120">
              <template #default="{ row: mr, $index }">
                <el-select v-model="mr.reason" size="small" @change="v => handleMaterialChange($index, 'reason', v)">
                  <el-option v-for="r in RETURN_REASONS" :key="r" :label="r" :value="r" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="60">
              <template #default="{ $index }">
                <el-button link type="danger" size="small" @click="handleRemoveMaterial($index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleCancelAdd">取消</el-button>
        <el-button type="primary" @click="handleSaveAdd">保存</el-button>
      </template>
    </el-dialog>

    <!-- 编辑弹窗 -->
    <el-dialog v-model="showEditModal" title="编辑退料单" width="1000px" :close-on-click-modal="false">
      <el-form :model="editForm" label-width="100px">
        <el-alert v-if="selectedRecord" title="退料单号" :description="selectedRecord.code" type="info" show-icon :closable="false" class="mb-4" />
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="退料日期">
              <el-date-picker v-model="editForm.date" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="退料类型">
              <el-select v-model="editForm.type">
                <el-option v-for="t in RETURN_TYPES" :key="t" :label="t" :value="t" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="申请人">
              <el-select v-model="editForm.applicant" filterable>
                <el-option v-for="a in APPLICANTS" :key="a" :label="a" :value="a" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="退料部门">
              <el-select v-model="editForm.department" filterable>
                <el-option v-for="d in departmentOptions" :key="d" :label="d" :value="d" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="仓库位置">
              <el-select v-model="editForm.warehouseLocation" filterable>
                <el-option v-for="w in WAREHOUSE_LOCATIONS" :key="w" :label="w" :value="w" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="操作人">
              <el-input v-model="editForm.operator" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="审核人">
              <el-select v-model="editForm.reviewer" filterable>
                <el-option v-for="r in REVIEWERS" :key="r" :label="r" :value="r" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="状态">
              <el-select v-model="editForm.status">
                <el-option v-for="s in EDITABLE_STATUSES" :key="s" :label="s" :value="s" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="备注">
              <el-input v-model="editForm.remark" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 物料明细 -->
        <el-form-item label="退料物料">
          <div class="mb-2">
            <el-button size="small" @click="handleEditAddMaterial"><el-icon><Plus /></el-icon>添加物料</el-button>
          </div>
          <el-table :data="editForm.materials" size="small" border>
            <el-table-column label="来源单号" width="130">
              <template #default="{ row: mr, $index }">
                <el-input v-model="mr.sourceApplicationCode" size="small" @input="v => handleEditMaterialChange($index, 'sourceApplicationCode', v)" />
              </template>
            </el-table-column>
            <el-table-column label="物料编码" width="110">
              <template #default="{ row: mr, $index }">
                <el-input v-model="mr.materialCode" size="small" @input="v => handleEditMaterialChange($index, 'materialCode', v)" />
              </template>
            </el-table-column>
            <el-table-column label="分类" width="120">
              <template #default="{ row: mr, $index }">
                <el-input v-model="mr.category" size="small" @input="v => handleEditMaterialChange($index, 'category', v)" />
              </template>
            </el-table-column>
            <el-table-column label="物料名称" min-width="110">
              <template #default="{ row: mr, $index }">
                <el-input v-model="mr.materialName" size="small" @input="v => handleEditMaterialChange($index, 'materialName', v)" />
              </template>
            </el-table-column>
            <el-table-column label="规格" width="90">
              <template #default="{ row: mr, $index }">
                <el-input v-model="mr.spec" size="small" @input="v => handleEditMaterialChange($index, 'spec', v)" />
              </template>
            </el-table-column>
            <el-table-column label="单位" width="70">
              <template #default="{ row: mr, $index }">
                <el-input v-model="mr.unit" size="small" @input="v => handleEditMaterialChange($index, 'unit', v)" />
              </template>
            </el-table-column>
            <el-table-column label="退料数量" width="100">
              <template #default="{ row: mr, $index }">
                <el-input-number v-model="mr.returnQuantity" :min="0" size="small" style="width: 100%" @change="v => handleEditMaterialChange($index, 'returnQuantity', v)" />
              </template>
            </el-table-column>
            <el-table-column label="单价" width="90">
              <template #default="{ row: mr, $index }">
                <el-input-number v-model="mr.unitPrice" :min="0" :precision="2" size="small" style="width: 100%" @change="v => handleEditMaterialChange($index, 'unitPrice', v)" />
              </template>
            </el-table-column>
            <el-table-column label="货位" width="90">
              <template #default="{ row: mr, $index }">
                <el-input v-model="mr.warehousePosition" size="small" @input="v => handleEditMaterialChange($index, 'warehousePosition', v)" />
              </template>
            </el-table-column>
            <el-table-column label="退料原因" width="120">
              <template #default="{ row: mr, $index }">
                <el-select v-model="mr.reason" size="small" @change="v => handleEditMaterialChange($index, 'reason', v)">
                  <el-option v-for="r in RETURN_REASONS" :key="r" :label="r" :value="r" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="60">
              <template #default="{ $index }">
                <el-button link type="danger" size="small" @click="handleEditRemoveMaterial($index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditModal = false">取消</el-button>
        <el-button type="danger" plain @click="handleVoidApply()">作废申请</el-button>
        <el-button type="primary" @click="handleSaveEdit">保存</el-button>
      </template>
    </el-dialog>

    <!-- 作废申请弹窗 -->
    <el-dialog v-model="showVoidModal" title="作废申请" width="500px">
      <template v-if="selectedRecord">
        <el-descriptions :column="1" border size="small" class="mb-4">
          <el-descriptions-item label="退料单号">{{ selectedRecord.code }}</el-descriptions-item>
          <el-descriptions-item label="申请人">{{ selectedRecord.applicant }}</el-descriptions-item>
          <el-descriptions-item label="退料部门">{{ selectedRecord.department }}</el-descriptions-item>
          <el-descriptions-item label="物料数量">{{ selectedRecord.materials?.length || 0 }} 种</el-descriptions-item>
          <el-descriptions-item label="物料预览">{{ selectedRecord.materials?.slice(0, 3).map(m => m.materialName).join('、') }}{{ selectedRecord.materials?.length > 3 ? '...' : '' }}</el-descriptions-item>
        </el-descriptions>
      </template>
      <el-form-item label="作废原因" required>
        <el-input v-model="voidReason" type="textarea" :rows="4" placeholder="请输入作废原因" />
      </el-form-item>
      <template #footer>
        <el-button @click="showVoidModal = false">取消</el-button>
        <el-button type="danger" @click="submitVoidApply">提交作废申请</el-button>
      </template>
    </el-dialog>

    <!-- 删除确认弹窗（单条） -->
    <el-dialog v-model="showDeleteConfirm" title="确认删除" width="400px">
      <div class="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
        <p class="text-sm text-amber-800">
          <strong>警告：</strong> 删除此退料记录可能会导致相关数据丢失，无法恢复。请确认是否继续删除操作。
        </p>
      </div>
      <div class="flex items-center gap-3">
        <el-icon :size="40" color="#f56c6c"><WarningFilled /></el-icon>
        <div>
          <p class="text-lg font-medium">确定要删除该退料记录吗？</p>
          <p class="text-sm text-gray-500">此操作不可恢复，将同时删除关联的所有物料明细</p>
        </div>
      </div>
      <template #footer>
        <el-button @click="showDeleteConfirm = false">取消</el-button>
        <el-button type="danger" @click="confirmDelete">确认删除</el-button>
      </template>
    </el-dialog>

    <!-- 批量删除确认弹窗 -->
    <el-dialog v-model="showBatchDeleteConfirm" title="确认删除" width="450px">
      <div class="flex items-center gap-3 mb-4">
        <el-icon :size="40" color="#f56c6c"><WarningFilled /></el-icon>
        <div>
          <p class="text-lg font-medium">确认批量删除</p>
          <p class="text-sm text-gray-500">此操作不可恢复</p>
        </div>
      </div>
      <p class="text-sm text-gray-600 mb-4">确定要删除选中的 {{ selectedRows.length }} 条退料记录吗？</p>
      <template #footer>
        <el-button @click="showBatchDeleteConfirm = false">取消</el-button>
        <el-button type="danger" @click="confirmBatchDelete">确认删除</el-button>
      </template>
    </el-dialog>

    <!-- 导出类型选择弹窗 -->
    <el-dialog v-model="showExportTypeModal" title="选择导出格式" width="500px">
      <div class="space-y-3">
        <el-radio-group v-model="exportFileType" class="w-full">
          <div v-for="fmt in EXPORT_FORMATS" :key="fmt.value"
            :class="['flex items-center p-4 border rounded-lg cursor-pointer transition-all mb-2', exportFileType === fmt.value ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300']"
            @click="exportFileType = fmt.value">
            <el-radio :value="fmt.value">
              <span class="ml-2 font-medium">{{ fmt.label }}</span>
              <span class="ml-2 text-xs text-gray-500">{{ fmt.desc }}</span>
            </el-radio>
          </div>
        </el-radio-group>
      </div>
      <template #footer>
        <el-button @click="showExportTypeModal = false">取消</el-button>
        <el-button type="primary" @click="confirmExport">确认导出</el-button>
      </template>
    </el-dialog>

    <!-- 编辑警告弹窗 -->
    <el-dialog v-model="showEditWarning" title="批量编辑提醒" width="550px">
      <div class="flex items-start gap-3 mb-4">
        <el-icon :size="40" color="#409eff"><InfoFilled /></el-icon>
        <div>
          <p class="text-base font-medium mb-2">批量编辑退料单注意事项</p>
          <ul class="text-sm text-gray-600 space-y-1 list-disc pl-5">
            <li>该退料单的历史记录可能无法追溯</li>
            <li>已生成的入库单据数据可能不一致</li>
            <li>相关的统计报表数据可能需要重新核算</li>
          </ul>
        </div>
      </div>
      <template #footer>
        <el-button @click="closeEditWarning">取消</el-button>
        <el-button type="primary" @click="confirmEditWarning">继续编辑</el-button>
      </template>
    </el-dialog>

    <!-- 删除警告弹窗 -->
    <el-dialog v-model="showDeleteWarning" title="批量删除提醒" width="500px">
      <div class="flex items-start gap-3 mb-4">
        <el-icon :size="40" color="#f56c6c"><WarningFilled /></el-icon>
        <div>
          <p class="text-base font-medium mb-2">确认进入批量删除模式</p>
          <ul class="text-sm text-gray-600 space-y-1 list-disc pl-5">
            <li>所有选中的退料单将被永久删除</li>
            <li>相关的物料明细也将被删除</li>
            <li>历史数据将无法恢复</li>
          </ul>
        </div>
      </div>
      <template #footer>
        <el-button @click="showDeleteWarning = false">取消</el-button>
        <el-button type="danger" @click="confirmDeleteWarning">进入删除模式</el-button>
      </template>
    </el-dialog>

    <!-- 编辑提示弹窗（非待审批状态不允许编辑） -->
    <el-dialog v-model="showEditAlert" title="编辑提示" width="480px">
      <div class="flex items-start gap-3 mb-4">
        <el-icon :size="40" color="#e6a23c"><WarningFilled /></el-icon>
        <div>
          <p class="text-base font-medium text-gray-900 mb-1">无法编辑此退料单</p>
          <p class="text-sm text-gray-600">{{ editAlertMessage }}</p>
        </div>
      </div>
      <template #footer>
        <el-button @click="showEditAlert = false">确定</el-button>
        <el-button type="warning" @click="goToVoidFromAlert">去作废申请</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { RefreshLeft, Plus, Edit, Delete, Download, ArrowDown, ArrowRight, Refresh, WarningFilled, InfoFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useMaterialReturnStore } from '@/stores/modules/inventory/useMaterialReturnStore'

// ============ 常量配置（与V1.1 config.ts一致） ============

const STATUS_OPTIONS = [
  { value: 'all', label: '全部状态' },
  { value: '待审批', label: '待审批' },
  { value: '已审批', label: '已审批' },
  { value: '已驳回', label: '已驳回' },
  { value: '已完成', label: '已完成' },
  { value: '已作废', label: '已作废' }
]

const STATUS_STYLE_MAP = {
  'approved': { bg: 'bg-green-100', text: 'text-green-700' },
  'pending': { bg: 'bg-amber-100', text: 'text-amber-700' },
  'rejected': { bg: 'bg-red-100', text: 'text-red-700' },
  'completed': { bg: 'bg-blue-100', text: 'text-blue-700' },
  'voided': { bg: 'bg-gray-200', text: 'text-gray-500' },
  '': { bg: 'bg-gray-100', text: 'text-gray-700' }
}

const STATUS_TO_CLASS = {
  '待审批': 'pending',
  '已审批': 'approved',
  '已驳回': 'rejected',
  '已完成': 'completed',
  '已作废': 'voided'
}

const RETURN_REASONS = ['生产剩余', '产品质量问题', '领错物料', '规格不符', '过期产品', '运输损坏', '库存积压', '其他']
const RETURN_TYPES = ['生产退料', '品质退料', '试制退料']
const APPLICANTS = ['李建国', '王建华', '张建华', '赵技术', '陈技术', '周管理员', '吴主管']
const WAREHOUSE_LOCATIONS = ['A区-01', 'A区-02', 'A区-03', 'A区-04', 'B区-01', 'B区-02', 'B区-03', 'C区-01', 'C区-05']
const OPERATORS = ['郭靖', '杨过', '张无忌', '令狐冲', '段誉', '萧峰', '虚竹', '胡斐', '陈家洛', '袁承志']
const REVIEWERS = ['黄药师', '小龙女', '周芷若', '任盈盈', '霍青桐', '夏雪宜', '程灵素', '扫地僧', '丁典']
const EDITABLE_STATUSES = ['待审批', '已审批', '已驳回', '已完成']
const DELETABLE_STATUSES = ['待审批', '已审批', '已驳回']
const EXPORT_FORMATS = [
  { value: 'xlsx', label: 'Excel (.xlsx)', desc: '适用于数据分析和处理' },
  { value: 'csv', label: 'CSV (.csv)', desc: '适用于数据交换' },
  { value: 'word', label: 'Word (.docx)', desc: '适用于文档编辑和分享' }
]

// 部门选项
const departmentOptions = ['生产部', '种植部', '设备部', '品质部', '仓储部', '技术部']

// ============ Store ============

const store = useMaterialReturnStore()

// ============ 工具函数 ============

/** 生成退料单号（TL+YYYYMMDD+3位流水号） */
const generateReturnCode = (existingCodes) => {
  const today = new Date()
  const y = today.getFullYear()
  const m = String(today.getMonth() + 1).padStart(2, '0')
  const d = String(today.getDate()).padStart(2, '0')
  const prefix = `TL${y}${m}${d}`
  let maxSeq = 0
  existingCodes.forEach(code => {
    if (code && code.startsWith(prefix)) {
      const seq = parseInt(code.substring(prefix.length), 10)
      if (!isNaN(seq) && seq > maxSeq) maxSeq = seq
    }
  })
  return `${prefix}${String(maxSeq + 1).padStart(3, '0')}`
}

/** 获取状态对应的样式类 */
const getStatusClass = (record) => {
  const cls = record.statusClass || STATUS_TO_CLASS[record.status] || ''
  const style = STATUS_STYLE_MAP[cls] || STATUS_STYLE_MAP['']
  return `${style.bg} ${style.text}`
}

/** 判断状态是否可删除 */
const isDeletable = (status) => DELETABLE_STATUSES.includes(status)

// ============ 响应式状态 ============

const searchForm = reactive({ code: '', material: '', warehouse: '', applicant: '', status: 'all', department: 'all' })
const currentPage = ref(1)
const pageSize = ref(10)
const selectedRows = ref([])
const expandedRows = ref(new Set())
const exportMode = ref(false)
const batchEditMode = ref(false)
const deleteMode = ref(false)
const exportFileType = ref('xlsx')

// 弹窗状态
const showDetailModal = ref(false)
const showAddModal = ref(false)
const showEditModal = ref(false)
const showVoidModal = ref(false)
const showDeleteConfirm = ref(false)
const showBatchDeleteConfirm = ref(false)
const showExportTypeModal = ref(false)
const showEditWarning = ref(false)
const showDeleteWarning = ref(false)
const showEditAlert = ref(false)

const selectedRecord = ref(null)
const deletingId = ref(null)
const voidReason = ref('')
const editAlertMessage = ref('')

// 表单
const addForm = reactive(createEmptyAddForm())
const editForm = reactive(createEmptyEditForm())

function createEmptyAddForm() {
  return {
    code: '',
    date: new Date().toISOString().split('T')[0],
    type: '生产退料',
    applicant: '',
    department: '',
    warehouseLocation: '',
    remark: '',
    operator: '',
    reviewer: '',
    reviewDate: '',
    rejectReason: '',
    materials: []
  }
}

function createEmptyEditForm() {
  return {
    date: '',
    type: '',
    applicant: '',
    department: '',
    warehouseLocation: '',
    status: '',
    remark: '',
    operator: '',
    reviewer: '',
    reviewDate: '',
    rejectReason: '',
    materials: []
  }
}

function createEmptyMaterial() {
  return {
    sourceApplicationCode: '',
    materialCode: '',
    category: '',
    materialName: '',
    spec: '',
    unit: '',
    returnQuantity: 0,
    unitPrice: 0,
    warehousePosition: '',
    reason: '',
    remark: ''
  }
}

// ============ 计算属性 ============

const allReturns = computed(() => store.returnRecords)

const filteredReturns = computed(() => {
  return allReturns.value.filter(item => {
    if (searchForm.code && !item.code.toLowerCase().includes(searchForm.code.toLowerCase())) return false
    if (searchForm.material && !item.materials.some(m => m.materialName && m.materialName.toLowerCase().includes(searchForm.material.toLowerCase()))) return false
    if (searchForm.warehouse && !item.warehouseLocation.toLowerCase().includes(searchForm.warehouse.toLowerCase())) return false
    if (searchForm.applicant && !item.applicant.toLowerCase().includes(searchForm.applicant.toLowerCase())) return false
    if (searchForm.status !== 'all' && item.status !== searchForm.status) return false
    if (searchForm.department !== 'all' && item.department !== searchForm.department) return false
    return true
  })
})

const paginatedReturns = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredReturns.value.slice(start, start + pageSize.value)
})

const totalPages = computed(() => Math.ceil(filteredReturns.value.length / pageSize.value) || 1)

// ============ 选择逻辑 ============

const checkSelectable = (row) => {
  if (exportMode.value) return true
  return isDeletable(row.status)
}

const onSelectionChange = (selection) => {
  selectedRows.value = selection.map(s => s.id)
}

const toggleExpandRow = (id) => {
  const newSet = new Set(expandedRows.value)
  if (newSet.has(id)) newSet.delete(id)
  else newSet.add(id)
  expandedRows.value = newSet
}

// ============ 搜索操作 ============

const updateSearchField = (field, value) => {
  searchForm[field] = value
  currentPage.value = 1
}

const handleReset = () => {
  searchForm.code = ''
  searchForm.material = ''
  searchForm.warehouse = ''
  searchForm.applicant = ''
  searchForm.status = 'all'
  searchForm.department = 'all'
  currentPage.value = 1
}

// ============ 查看详情 ============

const handleView = (item) => {
  selectedRecord.value = item
  showDetailModal.value = true
}

// ============ 编辑操作 ============

const handleEdit = (item) => {
  if (item.status !== '待审批') {
    editAlertMessage.value = `该退料单当前状态为「${item.status}」，非待审批状态无法编辑。如需处理，可选择「作废申请」。`
    selectedRecord.value = item
    showEditAlert.value = true
    return
  }
  selectedRecord.value = item
  Object.assign(editForm, {
    date: item.date,
    type: item.type,
    applicant: item.applicant,
    department: item.department,
    warehouseLocation: item.warehouseLocation,
    status: item.status,
    remark: item.remark || '',
    operator: item.operator || '',
    reviewer: item.reviewer || '',
    reviewDate: item.reviewDate || '',
    rejectReason: item.rejectReason || '',
    materials: item.materials ? item.materials.map(m => ({ ...m })) : []
  })
  showEditModal.value = true
}

const handleEditMaterialChange = (index, field, value) => {
  editForm.materials[index][field] = value
}

const handleEditAddMaterial = () => {
  editForm.materials.push(createEmptyMaterial())
}

const handleEditRemoveMaterial = (index) => {
  editForm.materials.splice(index, 1)
}

const handleSaveEdit = async () => {
  if (!selectedRecord.value) return
  try {
    await store.editReturn(selectedRecord.value.id, { ...editForm })
    ElMessage.success('编辑成功')
    showEditModal.value = false
  } catch (e) {
    ElMessage.error('编辑失败: ' + (e.message || '未知错误'))
  }
}

// ============ 作废操作 ============

const handleVoidApply = (record) => {
  const target = record || selectedRecord.value
  if (!target) return
  selectedRecord.value = target
  voidReason.value = ''
  showVoidModal.value = true
}

const submitVoidApply = () => {
  if (!voidReason.value.trim()) {
    ElMessage.warning('作废申请需要填写作废原因')
    return
  }
  showVoidModal.value = false
  ElMessage.success('退料单作废申请已提交')
}

const goToVoidFromAlert = () => {
  showEditAlert.value = false
  handleVoidApply(selectedRecord.value)
}

// ============ 删除操作 ============

const confirmDelete = async () => {
  if (deletingId.value !== null) {
    await store.removeReturn(deletingId.value)
    ElMessage.success('删除成功')
  }
  showDeleteConfirm.value = false
  deletingId.value = null
}

const confirmBatchDelete = async () => {
  if (selectedRows.value.length > 0) {
    await store.removeReturnsBatch(selectedRows.value)
    ElMessage.success(`成功删除 ${selectedRows.value.length} 条记录`)
  }
  showBatchDeleteConfirm.value = false
  deleteMode.value = false
  selectedRows.value = []
}

// ============ 新增操作 ============

const handleAddMaterial = () => {
  addForm.materials.push(createEmptyMaterial())
}

const handleRemoveMaterial = (index) => {
  addForm.materials.splice(index, 1)
}

const handleMaterialChange = (index, field, value) => {
  addForm.materials[index][field] = value
}

const handleGenerateCode = () => {
  addForm.code = generateReturnCode(allReturns.value.map(r => r.code))
}

const handleOpenMaterialSelect = () => {
  ElMessage.info('从仓库选择物料功能：请先输入来源领料单号，系统将自动加载对应物料')
}

const handleSaveAdd = async () => {
  if (!addForm.code) {
    ElMessage.warning('请先生成退料单号')
    return
  }
  if (!addForm.applicant) {
    ElMessage.warning('请选择申请人')
    return
  }
  if (addForm.materials.length === 0) {
    ElMessage.warning('请至少添加一种退料物料')
    return
  }
  try {
    const newRecord = {
      code: addForm.code,
      date: addForm.date,
      type: addForm.type,
      applicant: addForm.applicant,
      department: addForm.department,
      warehouseLocation: addForm.warehouseLocation,
      status: '待审批',
      statusClass: 'pending',
      remark: addForm.remark,
      operator: addForm.operator,
      reviewer: addForm.reviewer,
      reviewDate: '',
      rejectReason: '',
      materials: addForm.materials.map(m => ({ ...m }))
    }
    await store.addReturn(newRecord)
    ElMessage.success('新增成功')
    handleCancelAdd()
  } catch (e) {
    ElMessage.error('新增失败: ' + (e.message || '未知错误'))
  }
}

const handleCancelAdd = () => {
  showAddModal.value = false
  Object.assign(addForm, createEmptyAddForm())
}

// ============ 导出操作 ============

const handleExportClick = () => {
  if (selectedRows.value.length === 0 && filteredReturns.value.length === 0) {
    ElMessage.warning('没有可导出的数据')
    return
  }
  showExportTypeModal.value = true
}

const handleCancelExport = () => {
  exportMode.value = false
  selectedRows.value = []
}

const confirmExport = () => {
  const exportData = filteredReturns.value.filter(item => selectedRows.value.includes(item.id))

  const headers = ['退料单号', '退料日期', '退料类型', '申请人', '操作人', '退料部门', '仓库位置', '审批状态', '审核人', '备注']
  const fields = ['code', 'date', 'type', 'applicant', 'operator', 'department', 'warehouseLocation', 'status', 'reviewer', 'remark']
  const materialHeaders = ['物料编码', '物料名称', '规格', '单位', '领料数量', '退料原因']
  const materialFields = ['materialCode', 'materialName', 'spec', 'unit', 'quantity', 'reason']

  let content = ''
  let mimeType = ''
  let extension = ''

  if (exportFileType.value === 'csv') {
    let csvContent = '﻿' + headers.join(',') + ',' + materialHeaders.join(',') + '\n'
    exportData.forEach(row => {
      const mainRow = fields.map(f => `"${(row[f] || '')}"`).join(',')
      if (row.materials && row.materials.length > 0) {
        row.materials.forEach((mat, idx) => {
          if (idx === 0) csvContent += mainRow + ',' + materialFields.map(f => `"${(mat[f] || '')}"`).join(',') + '\n'
          else csvContent += ','.repeat(headers.length) + ',' + materialFields.map(f => `"${(mat[f] || '')}"`).join(',') + '\n'
        })
      } else {
        csvContent += mainRow + ',' + ','.repeat(materialHeaders.length) + '\n'
      }
    })
    content = csvContent
    mimeType = 'text/csv;charset=utf-8'
    extension = 'csv'
  } else if (exportFileType.value === 'xlsx') {
    let html = '<html><head><meta charset="utf-8"></head><body><table border="1">'
    html += `<tr>${headers.map(h => `<th>${h}</th>`).join('')}${materialHeaders.map(h => `<th>${h}</th>`).join('')}</tr>`
    exportData.forEach(row => {
      if (row.materials && row.materials.length > 0) {
        row.materials.forEach((mat, idx) => {
          if (idx === 0) html += `<tr>${fields.map(f => `<td>${row[f] || ''}</td>`).join('')}${materialFields.map(f => `<td>${mat[f] || ''}</td>`).join('')}</tr>`
          else html += `<tr>${'<td></td>'.repeat(headers.length)}${materialFields.map(f => `<td>${mat[f] || ''}</td>`).join('')}</tr>`
        })
      } else {
        html += `<tr>${fields.map(f => `<td>${row[f] || ''}</td>`).join('')}${'<td></td>'.repeat(materialHeaders.length)}</tr>`
      }
    })
    html += '</table></body></html>'
    content = html
    mimeType = 'application/vnd.ms-excel;charset=utf-8'
    extension = 'xls'
  } else {
    let html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"></head><body><table border="1">'
    html += `<tr>${headers.map(h => `<th>${h}</th>`).join('')}${materialHeaders.map(h => `<th>${h}</th>`).join('')}</tr>`
    exportData.forEach(row => {
      if (row.materials && row.materials.length > 0) {
        row.materials.forEach((mat, idx) => {
          if (idx === 0) html += `<tr>${fields.map(f => `<td>${row[f] || ''}</td>`).join('')}${materialFields.map(f => `<td>${mat[f] || ''}</td>`).join('')}</tr>`
          else html += `<tr>${'<td></td>'.repeat(headers.length)}${materialFields.map(f => `<td>${mat[f] || ''}</td>`).join('')}</tr>`
        })
      } else {
        html += `<tr>${fields.map(f => `<td>${row[f] || ''}</td>`).join('')}${'<td></td>'.repeat(materialHeaders.length)}</tr>`
      }
    })
    html += '</table></body></html>'
    content = html
    mimeType = 'application/vnd.ms-word;charset=utf-8'
    extension = 'doc'
  }

  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `生产退料_${new Date().toISOString().slice(0, 10)}.${extension}`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  showExportTypeModal.value = false
  exportMode.value = false
  selectedRows.value = []
  ElMessage.success('导出成功')
}

// ============ 批量编辑操作 ============

const enterBatchEditMode = () => {
  batchEditMode.value = true
  showEditWarning.value = true
}

const openBatchEditOrWarn = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要编辑的记录')
    return
  }
  ElMessage.info('批量编辑功能：请在列表中选择单条记录后点击行内"编辑"按钮进行编辑')
  cancelBatchEditMode()
}

const confirmEditWarning = () => {
  showEditWarning.value = false
  batchEditMode.value = true
}

const closeEditWarning = () => {
  showEditWarning.value = false
  batchEditMode.value = false
  selectedRows.value = []
}

const cancelBatchEditMode = () => {
  batchEditMode.value = false
  selectedRows.value = []
}

// ============ 批量删除操作 ============

const enterDeleteMode = () => {
  showDeleteWarning.value = true
}

const confirmDeleteWarning = () => {
  showDeleteWarning.value = false
  deleteMode.value = true
}

const cancelDeleteMode = () => {
  deleteMode.value = false
  selectedRows.value = []
}

// ============ 生命周期 ============

onMounted(async () => {
  await store.loadReturnRecords()
})
</script>
