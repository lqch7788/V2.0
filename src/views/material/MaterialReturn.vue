<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
            <el-icon :size="24" color="white"><Sort /></el-icon>
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
          <label class="block text-sm font-medium text-gray-700 mb-1">物资名称</label>
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
          <label class="block text-sm font-medium text-gray-700 mb-1">审批状态</label>
          <el-select v-model="searchForm.status" placeholder="全部状态" @change="updateSearchField('status', $event)">
            <el-option v-for="opt in STATUS_OPTIONS" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">退料部门</label>
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
        <el-table-column label="备注" width="120">
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
              <el-table-column prop="materialName" label="物料名称" width="120" />
              <el-table-column prop="spec" label="规格" width="100" />
              <el-table-column prop="unit" label="单位" width="60" />
              <el-table-column prop="returnQuantity" label="本次退料数量" width="100" />
              <el-table-column prop="unitPrice" label="单价(元)" width="90" />
              <el-table-column label="小计(元)" width="100">
                <template #default="{ row: mr }">{{ ((mr.returnQuantity || 0) * (mr.unitPrice || 0)).toFixed(2) }}</template>
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
          <el-descriptions-item v-if="selectedRecord.rejectReason" label="驳回原因" :span="3">
            <span class="text-red-600 font-medium">{{ selectedRecord.rejectReason }}</span>
          </el-descriptions-item>
          <el-descriptions-item v-if="selectedRecord.remark" label="备注" :span="3">{{ selectedRecord.remark }}</el-descriptions-item>
        </el-descriptions>

        <div class="mt-4">
          <h4 class="font-medium mb-2">退料物料明细</h4>
          <el-table :data="selectedRecord.materials" size="small" border>
            <el-table-column prop="sourceApplicationCode" label="来源领料单号" width="140" />
            <el-table-column prop="materialCode" label="物料编码" width="110" />
            <el-table-column prop="category" label="物料分类" width="120" />
            <el-table-column prop="materialName" label="物料名称" width="120" />
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
            <el-table-column label="物料名称" width="110">
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
            <el-table-column label="单价(元)" width="90">
              <template #default="{ row: mr }">
                <span class="text-sm text-right block">{{ mr.unitPrice ? '¥' + mr.unitPrice.toFixed(2) : '-' }}</span>
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
                  <el-option value="" label="请选择" />
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

    <!-- 物料选择弹窗 -->
    <el-dialog v-model="showMaterialSelectModal" title="选择物料" width="900px" :close-on-click-modal="false">
      <!-- 搜索栏 -->
      <div class="mb-4">
        <el-input v-model="materialSelectSearch" placeholder="搜索物料编码或名称..." clearable>
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
      </div>

      <!-- 物料列表 -->
      <div v-if="filteredWarehouseMaterials.length > 0" class="border border-gray-200 rounded-lg overflow-hidden">
        <el-table :data="filteredWarehouseMaterials" size="small" max-height="400" @selection-change="(val) => { selectedMaterialCodes = new Set(val.map(m => m.code || m.name)) }">
          <el-table-column type="selection" width="45" />
          <el-table-column prop="code" label="物料编码" width="120">
            <template #default="{ row }"><span class="font-mono text-sm">{{ row.code || row.name }}</span></template>
          </el-table-column>
          <el-table-column prop="name" label="物料名称" width="140" />
          <el-table-column prop="specification" label="规格" width="100">
            <template #default="{ row }">{{ row.specification || '-' }}</template>
          </el-table-column>
          <el-table-column prop="unit" label="单位" width="60" />
          <el-table-column prop="stockQuantity" label="库存数量" width="100" />
          <el-table-column prop="location" label="仓库货位" width="100">
            <template #default="{ row }">{{ row.location || '-' }}</template>
          </el-table-column>
        </el-table>
      </div>
      <div v-else class="text-center text-gray-500 py-8">暂无物料数据</div>

      <div class="mt-4 text-sm text-gray-500">
        已选择 <strong>{{ selectedMaterialCodes.size }}</strong> 项
      </div>

      <template #footer>
        <el-button @click="showMaterialSelectModal = false">取消</el-button>
        <el-button type="primary" @click="confirmMaterialSelect">确认添加</el-button>
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
            <el-table-column label="物料名称" width="110">
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
        <el-button type="warning" @click="submitVoidApply">提交作废申请</el-button>
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

    <!-- 批量编辑弹窗 -->
    <el-dialog v-model="showBatchEditModal" title="批量编辑退料记录" width="1100px" :close-on-click-modal="false" @close="closeBatchEditModal">
      <!-- 进度提示 -->
      <div class="bg-blue-50 rounded-lg p-3 mb-3">
        <p class="text-sm text-blue-800">已选择 <strong>{{ selectedRows.length }}</strong> 条退料记录进行批量编辑，已编辑 <strong>{{ Object.keys(batchEditedRecords).length }}</strong> 条</p>
      </div>

      <!-- 退料单选择下拉 -->
      <div class="mb-3">
        <el-select
          :model-value="selectedRows[currentBatchEditIndex]"
          @change="(val) => { const idx = selectedRows.indexOf(val); if (idx >= 0) currentBatchEditIndex = idx }"
          class="w-full"
        >
          <el-option
            v-for="id in selectedRows"
            :key="id"
            :label="`${getRecordById(id)?.code || '-'} (${getRecordById(id)?.applicant || '-'})${batchEditedRecords[id] ? ' ✅ 已编辑' : ''}`"
            :value="id"
          />
        </el-select>
      </div>

      <template v-if="currentBatchRecord">
        <!-- 基本信息 -->
        <div class="bg-gray-100 rounded-lg p-3 mb-3">
          <div class="grid grid-cols-3 gap-y-2 text-sm">
            <div class="flex items-center gap-2">
              <span class="text-gray-500 w-20 shrink-0">退料单号：</span>
              <span class="font-mono font-medium text-gray-900">{{ currentBatchRecord.code || '-' }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-gray-500 w-20 shrink-0">日期：</span>
              <el-date-picker
                :model-value="currentBatchRecord.date"
                @update:model-value="batchHandleFieldChange(currentBatchId, 'date', $event)"
                type="date" value-format="YYYY-MM-DD" size="small" class="flex-1"
              />
            </div>
            <div class="flex items-center gap-2">
              <span class="text-gray-500 w-20 shrink-0">退料类型：</span>
              <el-select
                :model-value="currentBatchRecord.type"
                @change="batchHandleFieldChange(currentBatchId, 'type', $event)"
                size="small" class="flex-1"
              >
                <el-option v-for="t in RETURN_TYPES" :key="t" :label="t" :value="t" />
              </el-select>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-gray-500 w-20 shrink-0">申请人：</span>
              <el-input
                :model-value="currentBatchRecord.applicant"
                @input="batchHandleFieldChange(currentBatchId, 'applicant', $event)"
                size="small" class="flex-1"
              />
            </div>
            <div class="flex items-center gap-2">
              <span class="text-gray-500 w-20 shrink-0">部门：</span>
              <el-select
                :model-value="currentBatchRecord.department"
                @change="batchHandleFieldChange(currentBatchId, 'department', $event)"
                size="small" class="flex-1"
              >
                <el-option v-for="d in departmentOptions" :key="d" :label="d" :value="d" />
              </el-select>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-gray-500 w-20 shrink-0">仓库位置：</span>
              <el-input
                :model-value="currentBatchRecord.warehouseLocation"
                @input="batchHandleFieldChange(currentBatchId, 'warehouseLocation', $event)"
                size="small" class="flex-1" placeholder="请输入"
              />
            </div>
            <div class="flex items-center gap-2">
              <span class="text-gray-500 w-20 shrink-0">操作人：</span>
              <el-input
                :model-value="currentBatchRecord.operator"
                @input="batchHandleFieldChange(currentBatchId, 'operator', $event)"
                size="small" class="flex-1" placeholder="请输入"
              />
            </div>
            <div class="flex items-center gap-2">
              <span class="text-gray-500 w-20 shrink-0">审核人：</span>
              <el-input
                :model-value="currentBatchRecord.reviewer"
                @input="batchHandleFieldChange(currentBatchId, 'reviewer', $event)"
                size="small" class="flex-1" placeholder="请输入"
              />
            </div>
            <div class="flex items-center gap-2">
              <span class="text-gray-500 w-20 shrink-0">状态：</span>
              <span class="px-2 py-1 bg-gray-100 border border-gray-200 rounded text-sm text-gray-600">
                {{ currentBatchRecord.status || '-' }}
              </span>
              <span class="text-xs text-gray-400">（审批状态由系统自动生成）</span>
            </div>
            <div class="flex items-center gap-2 col-span-3">
              <span class="text-gray-500 w-20 shrink-0">备注：</span>
              <el-input
                :model-value="currentBatchRecord.remark"
                @input="batchHandleFieldChange(currentBatchId, 'remark', $event)"
                size="small" class="flex-1" placeholder="请输入"
              />
            </div>
          </div>
        </div>

        <!-- 物料明细 -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="text-sm font-medium text-gray-700">物料明细</label>
            <span class="text-xs text-gray-500">共 {{ currentBatchRecord.materials?.length || 0 }} 条</span>
          </div>
          <div v-if="currentBatchRecord.materials?.length" class="border border-gray-200 rounded-lg overflow-hidden">
            <div class="overflow-auto max-h-[320px]">
              <el-table :data="currentBatchRecord.materials" size="small">
                <el-table-column label="来源领料单号" width="140">
                  <template #default="{ row: mr, $index }">
                    <el-input v-model="mr.sourceApplicationCode" size="small" @input="batchHandleMaterialChange(currentBatchId, $index, 'sourceApplicationCode', $event)" />
                  </template>
                </el-table-column>
                <el-table-column label="物料编码" width="110">
                  <template #default="{ row: mr, $index }">
                    <el-input v-model="mr.materialCode" size="small" @input="batchHandleMaterialChange(currentBatchId, $index, 'materialCode', $event)" />
                  </template>
                </el-table-column>
                <el-table-column label="物料分类" width="120">
                  <template #default="{ row: mr, $index }">
                    <el-input v-model="mr.category" size="small" @input="batchHandleMaterialChange(currentBatchId, $index, 'category', $event)" placeholder="中类-小类" />
                  </template>
                </el-table-column>
                <el-table-column label="物料名称" width="120">
                  <template #default="{ row: mr, $index }">
                    <el-input v-model="mr.materialName" size="small" @input="batchHandleMaterialChange(currentBatchId, $index, 'materialName', $event)" />
                  </template>
                </el-table-column>
                <el-table-column label="规格" width="100">
                  <template #default="{ row: mr, $index }">
                    <el-input v-model="mr.spec" size="small" @input="batchHandleMaterialChange(currentBatchId, $index, 'spec', $event)" />
                  </template>
                </el-table-column>
                <el-table-column label="单位" width="70">
                  <template #default="{ row: mr, $index }">
                    <el-input v-model="mr.unit" size="small" @input="batchHandleMaterialChange(currentBatchId, $index, 'unit', $event)" />
                  </template>
                </el-table-column>
                <el-table-column label="退料数量" width="100">
                  <template #default="{ row: mr, $index }">
                    <el-input-number v-model="mr.returnQuantity" :min="0" size="small" style="width: 100%" @change="batchHandleMaterialChange(currentBatchId, $index, 'returnQuantity', $event)" />
                  </template>
                </el-table-column>
                <el-table-column label="单价" width="90">
                  <template #default="{ row: mr, $index }">
                    <el-input-number v-model="mr.unitPrice" :min="0" size="small" style="width: 100%" @change="batchHandleMaterialChange(currentBatchId, $index, 'unitPrice', $event)" />
                  </template>
                </el-table-column>
                <el-table-column label="仓库货位" width="100">
                  <template #default="{ row: mr, $index }">
                    <el-input v-model="mr.warehousePosition" size="small" @input="batchHandleMaterialChange(currentBatchId, $index, 'warehousePosition', $event)" placeholder="仓库-区-位" />
                  </template>
                </el-table-column>
                <el-table-column label="退料原因" width="120">
                  <template #default="{ row: mr, $index }">
                    <el-select v-model="mr.reason" size="small" @change="batchHandleMaterialChange(currentBatchId, $index, 'reason', $event)">
                      <el-option value="" label="请选择" />
                      <el-option v-for="r in RETURN_REASONS" :key="r" :label="r" :value="r" />
                    </el-select>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
          <div v-else class="text-sm text-gray-500 italic border border-gray-200 rounded-lg p-4 text-center">
            暂无物料明细
          </div>
        </div>
      </template>

      <template #footer>
        <el-button @click="closeBatchEditModal">取消</el-button>
        <el-button @click="batchGoToNext">下一条</el-button>
        <el-button type="primary" @click="handleBatchSaveAll">保存全部 ({{ Object.keys(batchEditedRecords).length }} 个)</el-button>
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
import { Sort, Plus, Edit, Delete, Download, ArrowDown, ArrowRight, Refresh, WarningFilled, InfoFilled, Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useMaterialReturnStore } from '@/stores/modules/inventory/useMaterialReturnStore'
import { useWarehouseMaterialStore } from '@/stores/modules/inventory/useWarehouseMaterialStore'

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
const warehouseStore = useWarehouseMaterialStore()

/** 获取当前用户名 */
const currentOperatorName = localStorage.getItem('username') || '系统管理员'

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
const showBatchDeleteConfirm = ref(false)
const showExportTypeModal = ref(false)
const showEditWarning = ref(false)
const showDeleteWarning = ref(false)
const showEditAlert = ref(false)

const selectedRecord = ref(null)
const voidReason = ref('')
const editAlertMessage = ref('')

// 批量编辑状态
const batchEditedRecords = ref({})
const currentBatchEditIndex = ref(0)
const showBatchEditModal = ref(false)

// 物料选择弹窗状态
const showMaterialSelectModal = ref(false)
const materialSelectSearch = ref('')
const selectedMaterialCodes = ref(new Set())

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
    operator: currentOperatorName,
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

/** 批量编辑：当前记录ID */
const currentBatchId = computed(() => selectedRows.value[currentBatchEditIndex.value])

/** 批量编辑：当前记录 */
const currentBatchRecord = computed(() => {
  const id = currentBatchId.value
  return batchEditedRecords.value[id] || null
})

/** 根据ID获取退料记录 */
const getRecordById = (id) => allReturns.value.find(r => r.id === id)

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

const handleOpenMaterialSelect = async () => {
  selectedMaterialCodes.value = new Set()
  materialSelectSearch.value = ''
  // 确保仓库物料已加载
  if (warehouseStore.materials.length === 0) {
    await warehouseStore.loadMaterials()
  }
  showMaterialSelectModal.value = true
}

/** 物料选择弹窗：切换选中 */
const toggleMaterialSelect = (code) => {
  const newSet = new Set(selectedMaterialCodes.value)
  if (newSet.has(code)) newSet.delete(code)
  else newSet.add(code)
  selectedMaterialCodes.value = newSet
}

/** 物料选择弹窗：全选/取消全选 */
const toggleAllMaterialSelect = () => {
  const filtered = filteredWarehouseMaterials.value
  if (filtered.length === 0) return
  const allSelected = filtered.every(m => selectedMaterialCodes.value.has(m.code || m.name))
  if (allSelected) {
    selectedMaterialCodes.value = new Set()
  } else {
    selectedMaterialCodes.value = new Set(filtered.map(m => m.code || m.name))
  }
}

/** 物料选择弹窗：确认选择 */
const confirmMaterialSelect = () => {
  const filtered = filteredWarehouseMaterials.value
  const selected = filtered.filter(m => selectedMaterialCodes.value.has(m.code || m.name))
  selected.forEach(m => {
    addForm.materials.push({
      sourceApplicationCode: '',
      materialCode: m.code || m.name,
      category: m.category || '',
      materialName: m.name,
      spec: m.specification || '',
      unit: m.unit || '',
      returnQuantity: m.stockQuantity || 0,
      unitPrice: m.unitPrice || 0,
      warehousePosition: m.location || '',
      reason: '',
      remark: ''
    })
  })
  showMaterialSelectModal.value = false
}

/** 物料选择弹窗：过滤后的仓库物料 */
const filteredWarehouseMaterials = computed(() => {
  const keyword = materialSelectSearch.value.toLowerCase()
  if (!keyword) return warehouseStore.materials
  return warehouseStore.materials.filter(m =>
    (m.code || '').toLowerCase().includes(keyword) ||
    (m.name || '').toLowerCase().includes(keyword)
  )
})

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
    extension = 'xlsx'
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
    extension = 'docx'
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
  showEditWarning.value = false
  // 初始化批量编辑数据
  const records = {}
  selectedRows.value.forEach(id => {
    const record = allReturns.value.find(r => r.id === id)
    if (record) records[id] = JSON.parse(JSON.stringify(record))
  })
  batchEditedRecords.value = records
  currentBatchEditIndex.value = 0
  showBatchEditModal.value = true
}

const confirmEditWarning = () => {
  showEditWarning.value = false
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

/** 批量编辑：跳转到下一条 */
const batchGoToNext = () => {
  const next = currentBatchEditIndex.value + 1
  if (next < selectedRows.value.length) {
    currentBatchEditIndex.value = next
  } else {
    currentBatchEditIndex.value = 0
  }
}

/** 批量编辑：字段变更 */
const batchHandleFieldChange = (recordId, field, value) => {
  const records = { ...batchEditedRecords.value }
  if (records[recordId]) {
    records[recordId] = { ...records[recordId], [field]: value }
    batchEditedRecords.value = records
  }
}

/** 批量编辑：物料字段变更 */
const batchHandleMaterialChange = (recordId, index, field, value) => {
  const records = { ...batchEditedRecords.value }
  if (records[recordId] && records[recordId].materials) {
    const materials = [...records[recordId].materials]
    materials[index] = { ...materials[index], [field]: value }
    records[recordId] = { ...records[recordId], materials }
    batchEditedRecords.value = records
  }
}

/** 批量编辑：保存全部 */
const handleBatchSaveAll = async () => {
  try {
    const ids = Object.keys(batchEditedRecords.value).map(Number)
    for (const id of ids) {
      await store.editReturn(id, batchEditedRecords.value[id])
    }
    ElMessage.success(`成功保存 ${ids.length} 条记录`)
  } catch (e) {
    ElMessage.error('批量保存失败: ' + (e.message || '未知错误'))
  }
  showBatchEditModal.value = false
  batchEditMode.value = false
  selectedRows.value = []
  batchEditedRecords.value = {}
  currentBatchEditIndex.value = 0
}

/** 批量编辑：关闭 */
const closeBatchEditModal = () => {
  showBatchEditModal.value = false
  batchEditedRecords.value = {}
  currentBatchEditIndex.value = 0
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

<style scoped>
/* 表格表头蓝色渐变（与V1.1一致） */
:deep(.el-table__header-wrapper .el-table__header th) {
  background: linear-gradient(to right, #3b82f6, #2563eb) !important;
  color: #ffffff !important;
  font-weight: 600 !important;
}
:deep(.el-table__header-wrapper .el-table__header th .el-table__cell) {
  background: transparent !important;
  color: #ffffff !important;
}
/* 行hover效果 */
:deep(.el-table__body-wrapper .el-table__body tr:hover > td) {
  background-color: #dbeafe !important;
}
</style>
