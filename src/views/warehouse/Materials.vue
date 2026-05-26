<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
            <el-icon :size="24" color="white">
              <Goods />
            </el-icon>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">仓库物料</h1>
            <p class="text-gray-500">仓库物料库存管理</p>
          </div>
        </div>
        <el-button
          v-if="lowStockCount > 0"
          :type="showLowStock ? 'danger' : 'warning'"
          @click="handleLowStockClick"
          class="flex items-center gap-2"
        >
          <el-icon><Warning /></el-icon>
          <span class="font-medium">库存不足</span>
          <span class="bg-red-500 text-white text-sm px-2 py-0.5 rounded-full">{{ lowStockCount }}</span>
        </el-button>
      </div>
    </div>

    <!-- 标签页 -->
    <div class="flex gap-2">
      <el-button
        :type="activeTab === 'overview' ? 'primary' : ''"
        @click="handleTabChange('overview')"
      >
        库存总览
      </el-button>
      <el-button
        :type="activeTab === 'inbound' ? 'primary' : ''"
        @click="handleTabChange('inbound')"
      >
        物料入库
      </el-button>
    </div>

    <!-- 库存总览 -->
    <template v-if="activeTab === 'overview'">
      <!-- 筛选器 -->
      <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm">
        <div class="grid grid-cols-8 gap-4">
          <!-- 物料编号 -->
          <div class="col-span-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">物料编号</label>
            <el-input
              v-model="filters.code"
              placeholder="请输入"
              clearable
              @clear="handleFilterChange('code', '')"
            />
          </div>

          <!-- 物料名称 -->
          <div class="col-span-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">物料名称</label>
            <el-input
              v-model="filters.name"
              placeholder="请输入"
              clearable
              @clear="handleFilterChange('name', '')"
            />
          </div>

          <!-- 供应商 -->
          <div class="col-span-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">供应商</label>
            <el-select
              v-model="filters.supplier"
              placeholder="全部"
              clearable
              @clear="handleFilterChange('supplier', '')"
            >
              <el-option
                v-for="supplier in uniqueSuppliers"
                :key="supplier"
                :label="supplier"
                :value="supplier"
              />
            </el-select>
          </div>

          <!-- 存放位置 -->
          <div class="col-span-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">存放位置</label>
            <el-select
              v-model="filters.location"
              placeholder="全部"
              clearable
              @clear="handleFilterChange('location', '')"
            >
              <el-option
                v-for="location in uniqueLocations"
                :key="location"
                :label="location"
                :value="location"
              />
            </el-select>
          </div>

          <!-- 大类 -->
          <div class="col-span-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">大类</label>
            <el-select
              v-model="filters.searchBigCategory"
              placeholder="全部"
              clearable
              @change="handleBigCategoryChange"
            >
              <el-option
                v-for="cat in bigCategories"
                :key="cat.code"
                :label="`${cat.code} - ${cat.name}`"
                :value="cat.code"
              />
            </el-select>
          </div>

          <!-- 中类 -->
          <div class="col-span-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">中类</label>
            <el-select
              v-model="filters.searchMidCategory"
              placeholder="全部"
              clearable
              :disabled="!filters.searchBigCategory"
              @change="handleMidCategoryChange"
            >
              <el-option
                v-for="cat in midCategories"
                :key="cat.code"
                :label="`${cat.code} - ${cat.name}`"
                :value="cat.code"
              />
            </el-select>
          </div>

          <!-- 小类 -->
          <div class="col-span-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">小类</label>
            <el-select
              v-model="filters.searchSubCategory"
              placeholder="全部"
              clearable
              :disabled="!filters.searchMidCategory"
            >
              <el-option
                v-for="cat in subCategories"
                :key="cat.code"
                :label="`${cat.code} - ${cat.name}`"
                :value="cat.code"
              />
            </el-select>
          </div>

          <!-- 重置按钮 -->
          <div class="col-span-1 flex items-end">
            <el-button
              type="primary"
              class="w-full"
              @click="handleReset"
            >
              重置
            </el-button>
          </div>
        </div>
      </div>

      <!-- ActionToolbar 批量操作工具栏 - 对应V1.1 ActionToolbar -->
      <ActionToolbar
        title="库存总览"
        :batch-edit-mode="batchEditMode"
        :delete-mode="deleteMode"
        :export-mode="exportMode"
        :selected-rows="selectedRows"
        :low-stock-count="lowStockCount"
        :filters="toolbarFilters"
        :show-low-stock-button="true"
        :can-create="false"
        @low-stock-toggle="handleToolbarLowStockToggle"
        @batch-edit="handleToolbarBatchEdit"
        @delete="handleToolbarDelete"
        @export="handleToolbarExport"
        @confirm-batch-edit="handleToolbarConfirmBatchEdit"
        @cancel-batch-edit="handleToolbarCancelBatchEdit"
        @confirm-delete="handleToolbarConfirmBatchDelete"
        @cancel-delete="handleToolbarCancelDelete"
        @confirm-export="handleToolbarConfirmExport"
        @cancel-export="handleToolbarCancelExport"
      />

      <!-- 表格容器 -->
      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <!-- 选择模式提示条 - 编辑/删除/导出模式下显示 -->
        <div
          v-if="exportMode || batchEditMode || deleteMode"
          class="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50"
        >
          <div class="flex items-center gap-4">
            <span class="text-sm text-gray-500">已选择 {{ selectedRows.length }} 项</span>
          </div>
        </div>

        <!-- 表格 -->
        <el-table
          :data="paginatedMaterials"
          stripe
          @selection-change="handleSelectionChange"
        >
          <el-table-column
            v-if="exportMode || batchEditMode || deleteMode"
            type="selection"
            width="55"
          />
          <el-table-column prop="code" label="物料编号" width="120" />
          <el-table-column prop="name" label="物料名称" width="150" />
          <el-table-column prop="category" label="分类" width="120" />
          <el-table-column prop="unit" label="单位" width="80" />
          <el-table-column prop="quantity" label="库存数量" width="100">
            <template #default="{ row }">
              <span :class="row.quantity < row.minStock ? 'text-red-600 font-medium' : ''">
                {{ row.quantity }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="minStock" label="最低库存" width="100" />
          <el-table-column prop="price" label="单价" width="100" />
          <el-table-column prop="supplier" label="供应商" width="120" />
          <el-table-column prop="location" label="存放位置" width="100" />
          <el-table-column
            v-if="!exportMode && !batchEditMode && !deleteMode"
            label="操作"
            width="180"
            fixed="right"
          >
            <template #default="{ row }">
              <el-button link type="primary" @click="handleView(row)">查看</el-button>
              <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
              <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-500">每页</span>
            <el-select
              v-model="pageSize"
              style="width: 80px"
              @change="handlePageSizeChange"
            >
              <el-option :value="10" label="10" />
              <el-option :value="20" label="20" />
              <el-option :value="50" label="50" />
            </el-select>
            <span class="text-sm text-gray-500">条</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-500">
              共 {{ filteredMaterials.length }} 条，第 {{ currentPage }} / {{ totalPages }} 页
            </span>
            <el-pagination
              v-model:current-page="currentPage"
              :page-size="pageSize"
              :total="filteredMaterials.length"
              layout="prev, pager, next"
              @current-change="handlePageChange"
            />
          </div>
        </div>
      </div>
    </template>

    <!-- 物料入库 -->
    <template v-if="activeTab === 'inbound'">
      <!-- 编码规则生成器 -->
      <div class="bg-white rounded-xl p-6 shadow-sm mb-6">
        <div class="flex items-center gap-2 mb-4">
          <h3 class="text-lg font-semibold text-gray-900">物料编码生成</h3>
          <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            资材编码规则：大类(2位) + 中类(2位) + 小类(2位) + 序号(3位)
          </span>
        </div>

        <div class="grid grid-cols-4 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">大类</label>
            <el-select
              v-model="codeGen.bigCategory"
              placeholder="请选择大类"
              @change="handleCodeGenBigCategoryChange"
            >
              <el-option
                v-for="cat in bigCategories"
                :key="cat.code"
                :label="`${cat.code} - ${cat.name}`"
                :value="cat.code"
              />
            </el-select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">中类</label>
            <el-select
              v-model="codeGen.midCategory"
              placeholder="请选择中类"
              :disabled="!codeGen.bigCategory"
              @change="handleCodeGenMidCategoryChange"
            >
              <el-option
                v-for="cat in codeGenMidCategories"
                :key="cat.code"
                :label="`${cat.code} - ${cat.name}`"
                :value="cat.code"
              />
            </el-select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">小类</label>
            <el-select
              v-model="codeGen.subCategory"
              placeholder="请选择小类"
              :disabled="!codeGen.midCategory"
              @change="handleCodeGenSubCategoryChange"
            >
              <el-option
                v-for="cat in codeGenSubCategories"
                :key="cat.code"
                :label="`${cat.code} - ${cat.name}`"
                :value="cat.code"
              />
            </el-select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">生成编码</label>
            <div class="flex gap-2">
              <el-input
                v-model="codeGen.generatedCode"
                placeholder="点击生成"
                readonly
              />
              <el-button
                type="primary"
                :disabled="!codeGen.subCategory"
                @click="handleCodeGen"
              >
                生成
              </el-button>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex items-center gap-3">
          <el-button
            type="primary"
            :disabled="!codeGen.generatedCode"
            @click="handleVerifyCode"
          >
            <el-icon><Search /></el-icon>
            验证重码
          </el-button>
          <el-button
            :disabled="!codeGen.generatedCode"
            @click="handleCopyCode"
          >
            <el-icon><Download /></el-icon>
            {{ copySuccess ? '已复制!' : '复制编码' }}
          </el-button>
          <span class="text-xs text-gray-500">生成的编码可复制后用于新增物料</span>
        </div>

        <!-- 提示信息 -->
        <div v-if="codeGenError" class="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-sm text-red-600">{{ codeGenError }}</p>
        </div>
        <div v-if="codeGenSuccess && !codeGenError" class="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg">
          <p class="text-sm text-green-600">{{ codeGenSuccess }}</p>
        </div>
      </div>

      <!-- 入库记录表格 -->
      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">物料入库记录</h3>
          <el-button type="primary" @click="handleAddInbound">
            <el-icon><Plus /></el-icon>
            新增入库
          </el-button>
        </div>

        <el-table :data="inboundRecords" stripe>
          <el-table-column prop="code" label="入库单号" width="150" />
          <el-table-column prop="materialCode" label="物料编号" width="120" />
          <el-table-column prop="materialName" label="物料名称" width="150" />
          <el-table-column label="入库数量" width="120">
            <template #default="{ row }">
              {{ row.quantity }}{{ row.unit }}
            </template>
          </el-table-column>
          <el-table-column prop="supplier" label="供应商" width="120" />
          <el-table-column prop="inboundDate" label="入库日期" width="120" />
          <el-table-column prop="operator" label="操作员" width="100" />
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 'completed' ? 'success' : 'warning'">
                {{ row.status === 'completed' ? '已完成' : '待审核' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" @click="handleViewInbound(row)">查看</el-button>
              <el-button link type="primary" @click="handleEditInbound(row)">编辑</el-button>
              <el-button link type="danger" @click="handleDeleteInbound(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 入库记录分页 -->
        <div class="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-500">每页</span>
            <el-select
              v-model="inboundPageSize"
              style="width: 80px"
              @change="handleInboundPageSizeChange"
            >
              <el-option :value="10" label="10" />
              <el-option :value="20" label="20" />
              <el-option :value="50" label="50" />
            </el-select>
            <span class="text-sm text-gray-500">条</span>
          </div>
          <el-pagination
            v-model:current-page="inboundPage"
            :page-size="inboundPageSize"
            :total="inboundRecords.length"
            layout="prev, pager, next"
          />
        </div>
      </div>
    </template>

    <!-- 新增入库弹窗 -->
    <el-dialog
      v-model="showAddModal"
      title="新增入库"
      width="800px"
      :close-on-click-modal="false"
    >
      <el-form :model="newInbound" label-width="100px">
        <!-- 入库单号 -->
        <el-form-item label="入库单号">
          <div class="flex gap-2 w-full">
            <el-input
              v-model="newInbound.orderCode"
              placeholder="点击自动生成"
              readonly
              class="flex-1"
            />
            <el-button type="primary" @click="generateOrderCode">
              <el-icon><Refresh /></el-icon>
              自动生成
            </el-button>
          </div>
        </el-form-item>

        <!-- 物料编码 -->
        <el-form-item label="物料编码" required>
          <div class="flex gap-2 w-full">
            <el-input
              v-model="newInbound.materialCode"
              placeholder="请输入物料编码（可从上方编码生成器复制）"
              @blur="checkCodeDuplicate"
            />
            <el-button type="primary" @click="handleGenerateCodeInModal">
              生成编码
            </el-button>
          </div>
          <div class="text-xs text-gray-500 mt-1">提示：可在"物料编码生成"区域生成并验证编码后复制到此</div>
          <div v-if="codeError" class="text-xs text-red-500 mt-1">{{ codeError }}</div>
        </el-form-item>

        <!-- 物料名称 -->
        <el-form-item label="物料名称" required>
          <el-input
            v-model="newInbound.materialName"
            placeholder="请输入物料名称"
            @blur="checkNameDuplicate"
          />
          <div v-if="nameError" class="text-xs text-red-500 mt-1">{{ nameError }}</div>
        </el-form-item>

        <!-- 分类选择 -->
        <el-form-item label="分类选择">
          <div class="grid grid-cols-3 gap-4 w-full">
            <el-select
              v-model="newInbound.bigCategory"
              placeholder="请选择大类"
              @change="handleModalBigCategoryChange"
            >
              <el-option
                v-for="cat in bigCategories"
                :key="cat.code"
                :label="`${cat.code} - ${cat.name}`"
                :value="cat.code"
              />
            </el-select>
            <el-select
              v-model="newInbound.midCategory"
              placeholder="请选择中类"
              :disabled="!newInbound.bigCategory"
              @change="handleModalMidCategoryChange"
            >
              <el-option
                v-for="cat in modalMidCategories"
                :key="cat.code"
                :label="`${cat.code} - ${cat.name}`"
                :value="cat.code"
              />
            </el-select>
            <el-select
              v-model="newInbound.subCategory"
              placeholder="请选择小类"
              :disabled="!newInbound.midCategory"
            >
              <el-option
                v-for="cat in modalSubCategories"
                :key="cat.code"
                :label="`${cat.code} - ${cat.name}`"
                :value="cat.code"
              />
            </el-select>
          </div>
        </el-form-item>

        <!-- 数量和单位 -->
        <el-form-item label="入库数量" required>
          <div class="grid grid-cols-2 gap-4 w-full">
            <el-input
              v-model.number="newInbound.quantity"
              type="number"
              placeholder="请输入数量"
            />
            <el-select v-model="newInbound.unit" placeholder="请选择单位">
              <el-option v-for="unit in unitOptions" :key="unit" :label="unit" :value="unit" />
            </el-select>
          </div>
        </el-form-item>

        <!-- 供应商 -->
        <el-form-item label="供应商">
          <el-input v-model="newInbound.supplier" placeholder="请输入供应商" />
        </el-form-item>

        <!-- 入库日期和操作员 -->
        <el-form-item label="入库日期">
          <el-date-picker
            v-model="newInbound.inboundDate"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="操作员">
          <el-input v-model="newInbound.operator" placeholder="请输入操作员" />
        </el-form-item>

        <!-- 备注 -->
        <el-form-item label="备注">
          <el-input
            v-model="newInbound.remarks"
            type="textarea"
            :rows="3"
            placeholder="请输入备注"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="handleCloseModal">取消</el-button>
        <el-button
          type="primary"
          :disabled="!isFormValid"
          @click="handleSaveInbound"
        >
          保存
        </el-button>
      </template>
    </el-dialog>

    <!-- 物料详情弹窗 -->
    <el-dialog v-model="showDetailModal" title="物料详情" width="800px">
      <el-descriptions v-if="selectedMaterial" :column="3" border size="small">
        <el-descriptions-item label="物料编号">{{ selectedMaterial.code }}</el-descriptions-item>
        <el-descriptions-item label="物料名称">{{ selectedMaterial.name }}</el-descriptions-item>
        <el-descriptions-item label="分类">{{ selectedMaterial.category }}</el-descriptions-item>
        <el-descriptions-item label="规格型号">{{ selectedMaterial.specification || '-' }}</el-descriptions-item>
        <el-descriptions-item label="条形码">{{ selectedMaterial.barcode || '-' }}</el-descriptions-item>
        <el-descriptions-item label="单位">{{ selectedMaterial.unit }}</el-descriptions-item>
        <el-descriptions-item label="库存数量">
          <span :class="selectedMaterial.quantity < selectedMaterial.minStock ? 'text-red-600 font-bold' : ''">{{ selectedMaterial.quantity }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="最低库存">{{ selectedMaterial.minStock }}</el-descriptions-item>
        <el-descriptions-item label="最高库存">{{ selectedMaterial.maxStock || '-' }}</el-descriptions-item>
        <el-descriptions-item label="单价">{{ selectedMaterial.price }}</el-descriptions-item>
        <el-descriptions-item label="供应商">{{ selectedMaterial.supplier }}</el-descriptions-item>
        <el-descriptions-item label="存放位置">{{ selectedMaterial.location }}</el-descriptions-item>
        <el-descriptions-item label="批次号">{{ selectedMaterial.batchNo || '-' }}</el-descriptions-item>
        <el-descriptions-item label="生产日期">{{ selectedMaterial.productionDate || '-' }}</el-descriptions-item>
        <el-descriptions-item label="有效期至">{{ selectedMaterial.expiryDate || '-' }}</el-descriptions-item>
        <el-descriptions-item label="最后更新时间">{{ selectedMaterial.lastUpdateTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="数据状态">
          <el-tag :type="selectedMaterial.dataStatus === '启用' ? 'success' : 'info'">{{ selectedMaterial.dataStatus || '启用' }}</el-tag>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer><el-button @click="showDetailModal = false">关闭</el-button></template>
    </el-dialog>

    <!-- 入库详情弹窗 -->
    <el-dialog v-model="showInboundDetailModal" title="入库记录详情" width="800px">
      <el-descriptions v-if="selectedInboundRecord" :column="2" border size="small">
        <el-descriptions-item label="入库单号">{{ selectedInboundRecord.code }}</el-descriptions-item>
        <el-descriptions-item label="入库日期">{{ selectedInboundRecord.inboundDate }}</el-descriptions-item>
        <el-descriptions-item label="物料编码">{{ selectedInboundRecord.materialCode }}</el-descriptions-item>
        <el-descriptions-item label="物料名称">{{ selectedInboundRecord.materialName }}</el-descriptions-item>
        <el-descriptions-item label="入库数量">{{ selectedInboundRecord.quantity }}{{ selectedInboundRecord.unit }}</el-descriptions-item>
        <el-descriptions-item label="供应商">{{ selectedInboundRecord.supplier }}</el-descriptions-item>
        <el-descriptions-item label="操作员">{{ selectedInboundRecord.operator }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="selectedInboundRecord.status === 'completed' ? 'success' : 'warning'">{{ selectedInboundRecord.status === 'completed' ? '已完成' : '待审核' }}</el-tag>
        </el-descriptions-item>
      </el-descriptions>
      <div v-if="selectedInboundRecord?.materials?.length > 0" class="mt-4">
        <h4 class="font-medium mb-2 text-sm">入库物料明细</h4>
        <el-table :data="selectedInboundRecord.materials" size="small" border>
          <el-table-column prop="materialCode" label="物料编码" width="120" />
          <el-table-column prop="materialName" label="物料名称" width="140" />
          <el-table-column prop="spec" label="规格" width="90" />
          <el-table-column prop="unit" label="单位" width="70" />
          <el-table-column prop="quantity" label="数量" width="80" />
          <el-table-column prop="batchNo" label="批次号" width="110" />
          <el-table-column prop="productionDate" label="生产日期" width="100" />
          <el-table-column prop="location" label="存放位置" width="100" />
          <el-table-column prop="remark" label="备注" width="100" />
        </el-table>
      </div>
      <template #footer><el-button @click="showInboundDetailModal = false">关闭</el-button></template>
    </el-dialog>

    <!-- 导出格式选择弹窗 -->
    <el-dialog
      v-model="showExportModal"
      title="选择导出格式"
      width="500px"
    >
      <p class="text-sm text-gray-500 mb-4">已选择 {{ selectedRows.length }} 条数据</p>
      <div class="space-y-3">
        <el-radio-group v-model="exportFormat" class="w-full">
          <div
            v-for="format in exportFormats"
            :key="format.value"
            :class="[
              'flex items-center p-4 border rounded-lg cursor-pointer transition-all',
              exportFormat === format.value
                ? 'border-emerald-500 bg-emerald-50'
                : 'border-gray-200 hover:border-gray-300'
            ]"
            @click="exportFormat = format.value"
          >
            <el-radio :value="format.value">
              <div class="ml-3">
                <span class="block text-sm font-medium text-gray-900">{{ format.label }}</span>
                <span class="block text-xs text-gray-500">{{ format.desc }}</span>
              </div>
            </el-radio>
          </div>
        </el-radio-group>
      </div>
      <template #footer>
        <el-button @click="showExportModal = false">取消</el-button>
        <el-button
          type="primary"
          :disabled="selectedRows.length === 0"
          @click="handleDoExport"
        >
          导出
        </el-button>
      </template>
    </el-dialog>

    <!-- 物料编辑弹窗 - 对应V1.1 MaterialEditModal -->
    <MaterialEditModal
      :material="selectedMaterial"
      :is-open="showEditModal"
      @close="showEditModal = false"
      @save="handleSaveEdit"
    />

    <!-- 物料删除确认弹窗 - 对应V1.1 MaterialDeleteConfirmModal -->
    <MaterialDeleteConfirmModal
      :material="selectedMaterial"
      :is-open="showDeleteModal"
      @close="showDeleteModal = false"
      @confirm="handleConfirmDelete"
    />

    <!-- 批量删除警告弹窗 - 对应V1.1 DeleteWarningDialog -->
    <DeleteWarningDialog
      :is-open="showDeleteWarning"
      @close="showDeleteWarning = false"
      @confirm="handleToolbarConfirmDeleteWarning"
    />

    <!-- 批量删除确认弹窗 - 对应V1.1 BatchDeleteConfirmDialog -->
    <BatchDeleteConfirmDialog
      :is-open="showBatchDeleteConfirm"
      :selected-materials="selectedRows"
      @close="showBatchDeleteConfirm = false"
      @confirm="handleConfirmBatchDelete"
    />

    <!-- 入库记录编辑弹窗 - 对应V1.1 InboundEditModal -->
    <el-dialog
      v-model="showInboundEditModal"
      title="编辑入库记录"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form v-if="selectedInboundRecord" label-width="100px">
        <el-form-item label="入库单号">
          <el-input :model-value="inboundEditForm.code" readonly />
        </el-form-item>
        <el-form-item label="入库日期">
          <el-date-picker
            v-model="inboundEditForm.inboundDate"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="供应商">
          <el-input v-model="inboundEditForm.supplier" placeholder="请输入供应商" />
        </el-form-item>
        <el-form-item label="操作员">
          <el-input v-model="inboundEditForm.operator" placeholder="请输入操作员" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="inboundEditForm.status" placeholder="请选择状态">
            <el-option value="pending" label="待审核" />
            <el-option value="completed" label="已完成" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showInboundEditModal = false">取消</el-button>
        <el-button type="primary" @click="handleSaveInboundEdit">保存</el-button>
      </template>
    </el-dialog>

    <!-- 入库记录删除确认弹窗 - 对应V1.1 InboundDeleteConfirmModal -->
    <el-dialog
      v-model="showInboundDeleteModal"
      title="删除确认"
      width="450px"
      :close-on-click-modal="true"
    >
      <div v-if="selectedInboundRecord">
        <p class="text-sm text-gray-600">
          确定要删除入库记录 <strong>{{ selectedInboundRecord.code }}</strong> 吗？
        </p>
        <p class="text-sm text-red-500 mt-2">此操作不可撤销！</p>
      </div>
      <template #footer>
        <el-button @click="showInboundDeleteModal = false">取消</el-button>
        <el-button type="danger" @click="handleConfirmInboundDelete">确认删除</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { Goods, Warning, Download, Search, Plus, Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getMaterials, getInboundRecords } from '@/api/material/apiWarehouseMaterialService'
import { useWarehouseMaterialStore } from '@/stores/modules/inventory/useWarehouseMaterialStore'
import { useInboundStore } from '@/stores/modules/inventory/useInboundStore'
import ActionToolbar from './components/ActionToolbar.vue'
import MaterialEditModal from './components/MaterialEditModal.vue'
import MaterialDeleteConfirmModal from './components/MaterialDeleteConfirmModal.vue'
import DeleteWarningDialog from './components/DeleteWarningDialog.vue'
import BatchDeleteConfirmDialog from './components/BatchDeleteConfirmDialog.vue'

// 分类配置（与V1.1 categoryConfig一致 — 7大分类体系）
const categoryConfig = {
  'SP': { name: '生产投入类', categories: {
    '01': { name: '种质资源', subCategories: { '01': { name: '种子', prefix: 'SP0101' }, '02': { name: '种苗', prefix: 'SP0102' }, '03': { name: '种球', prefix: 'SP0103' } } },
    '02': { name: '肥料与土壤改良剂', subCategories: { '01': { name: '有机肥', prefix: 'SP0201' }, '02': { name: '化肥', prefix: 'SP0202' }, '03': { name: '土壤改良剂', prefix: 'SP0203' } } },
    '03': { name: '农药与植保产品', subCategories: { '01': { name: '杀虫剂', prefix: 'SP0301' }, '02': { name: '杀菌剂', prefix: 'SP0302' }, '03': { name: '除草剂', prefix: 'SP0303' } } },
    '04': { name: '灌溉与水管材料', subCategories: { '01': { name: '滴灌材料', prefix: 'SP0401' }, '02': { name: '喷灌材料', prefix: 'SP0402' } } },
    '05': { name: '农膜与覆盖材料', subCategories: { '01': { name: '地膜', prefix: 'SP0501' }, '02': { name: '棚膜', prefix: 'SP0502' } } }
  } },
  'EQ': { name: '设施与装备类', categories: {
    '01': { name: '农业机械', subCategories: { '01': { name: '耕作机械', prefix: 'EQ0101' }, '02': { name: '种植机械', prefix: 'EQ0102' }, '03': { name: '植保机械', prefix: 'EQ0103' } } },
    '02': { name: '温室设施', subCategories: { '01': { name: '骨架材料', prefix: 'EQ0201' }, '02': { name: '覆盖材料', prefix: 'EQ0202' } } },
    '03': { name: '仓储设备', subCategories: { '01': { name: '货架', prefix: 'EQ0301' }, '02': { name: '冷藏设备', prefix: 'EQ0302' } } },
    '04': { name: '运输设备', subCategories: { '01': { name: '搬运车', prefix: 'EQ0401' }, '02': { name: '运输车', prefix: 'EQ0402' } } }
  } },
  'OP': { name: '作业支持类', categories: {
    '01': { name: '劳保与防护用品', subCategories: { '01': { name: '防护服', prefix: 'OP0101' }, '02': { name: '手套口罩', prefix: 'OP0102' } } },
    '02': { name: '工具与器械', subCategories: { '01': { name: '手动工具', prefix: 'OP0201' }, '02': { name: '电动工具', prefix: 'OP0202' } } }
  } },
  'PH': { name: '采后处理与流通类', categories: {
    '01': { name: '采收容器', subCategories: { '01': { name: '周转筐', prefix: 'PH0101' }, '02': { name: '包装箱', prefix: 'PH0102' } } },
    '02': { name: '包装材料', subCategories: { '01': { name: '纸箱', prefix: 'PH0201' }, '02': { name: '塑料袋', prefix: 'PH0202' } } },
    '03': { name: '保鲜材料', subCategories: { '01': { name: '保鲜膜', prefix: 'PH0301' }, '02': { name: '保鲜剂', prefix: 'PH0302' } } }
  } },
  'IT': { name: '数字化与管理类', categories: {
    '01': { name: '监测设备', subCategories: { '01': { name: '传感器', prefix: 'IT0101' }, '02': { name: '摄像头', prefix: 'IT0102' } } },
    '02': { name: '控制设备', subCategories: { '01': { name: '控制器', prefix: 'IT0201' }, '02': { name: '执行器', prefix: 'IT0202' } } }
  } },
  'EC': { name: '能源与通用耗材', categories: {
    '01': { name: '能源', subCategories: { '01': { name: '电力', prefix: 'EC0101' }, '02': { name: '燃油', prefix: 'EC0102' } } },
    '02': { name: '通用耗材', subCategories: { '01': { name: '办公用品', prefix: 'EC0201' }, '02': { name: '清洁用品', prefix: 'EC0202' } } }
  } },
  'OT': { name: '其他类', categories: {
    '01': { name: '其他物料', subCategories: { '01': { name: '其他', prefix: 'OT0101' } } }
  } }
}

// 大类选项
const bigCategories = Object.entries(categoryConfig).map(([code, data]) => ({
  code,
  name: (data).name
}))

// 单位选项
const unitOptions = ['袋', '箱', '个', '公斤', '升', '平方米']

// 导出格式选项
const exportFormats = [
  { value: 'excel', label: 'Excel (.xlsx)', desc: '适用于数据分析和处理' },
  { value: 'csv', label: 'CSV (.csv)', desc: '适用于数据交换' },
  { value: 'word', label: 'Word (.docx)', desc: '适用于文档编辑和分享' }
]

// Mock数据（仅用于API不可用时的fallback，与V1.1数据格式一致）
const mockWarehouseMaterials = ref([
  { id: 1, code: 'SP0201001', name: '商品有机肥', category: '肥料与土壤改良剂', specification: '50kg/袋', barcode: '6901234567890', unit: '袋', quantity: 150, minStock: 30, maxStock: 500, price: '45.00', supplier: '有机肥供应商A', location: 'A-01-01', batchNo: 'YC20260301', productionDate: '2026-03-01', expiryDate: '2027-03-01', lastUpdateTime: '2026-05-20', dataStatus: '启用' },
  { id: 2, code: 'SP0202001', name: '尿素', category: '肥料与土壤改良剂', specification: '50kg/袋', barcode: '6901234567891', unit: '袋', quantity: 80, minStock: 20, maxStock: 300, price: '85.00', supplier: '化肥供应商B', location: 'A-02-01', batchNo: 'HF20260315', productionDate: '2026-03-15', expiryDate: '2027-03-15', lastUpdateTime: '2026-05-18', dataStatus: '启用' },
  { id: 3, code: 'SP0301001', name: '吡虫啉', category: '农药与植保产品', specification: '100g/瓶', barcode: '6901234567892', unit: '瓶', quantity: 120, minStock: 20, maxStock: 400, price: '28.00', supplier: '农药供应商C', location: 'B-02-03', batchNo: 'NY20260220', productionDate: '2026-02-20', expiryDate: '2027-02-20', lastUpdateTime: '2026-05-15', dataStatus: '启用' },
  { id: 4, code: 'SP0302001', name: '多菌灵', category: '农药与植保产品', specification: '200g/袋', barcode: '6901234567893', unit: '袋', quantity: 15, minStock: 20, maxStock: 200, price: '35.00', supplier: '农药供应商C', location: 'C-03-01', batchNo: 'NY20260110', productionDate: '2026-01-10', expiryDate: '2027-01-10', lastUpdateTime: '2026-05-12', dataStatus: '启用' },
  { id: 5, code: 'SP0103001', name: '番茄种子', category: '种质资源', specification: '50g/袋', barcode: '6901234567894', unit: '袋', quantity: 60, minStock: 10, maxStock: 200, price: '120.00', supplier: '种子供应商D', location: 'A-02-01', batchNo: 'ZZ20260201', productionDate: '2026-02-01', expiryDate: '2027-02-01', lastUpdateTime: '2026-05-10', dataStatus: '启用' },
  { id: 6, code: 'OP0201001', name: '锄头', category: '工具与器械', specification: '标准型', barcode: '6901234567895', unit: '把', quantity: 35, minStock: 10, maxStock: 100, price: '42.00', supplier: '劳保供应商E', location: 'C-04-01', batchNo: 'LB20260228', productionDate: '2026-02-28', expiryDate: '2029-02-28', lastUpdateTime: '2026-05-08', dataStatus: '启用' },
  { id: 7, code: 'EQ0306001', name: '滴灌带', category: '农业机械', specification: '50m/卷', barcode: '6901234567896', unit: '卷', quantity: 200, minStock: 50, maxStock: 800, price: '38.00', supplier: '农机供应商F', location: 'C-05-01', batchNo: 'NJ20260210', productionDate: '2026-02-10', expiryDate: '2028-02-10', lastUpdateTime: '2026-05-06', dataStatus: '启用' },
])

const mockInboundRecords = ref([
  { id: 1, code: 'RK20260121-001', materialCode: 'SP0201001', materialName: '商品有机肥', quantity: 50, unit: '袋', supplier: '有机肥供应商A', inboundDate: '2026-01-21', operator: '张伟民', status: 'completed', materials: [{ materialCode: 'SP0201001', materialName: '商品有机肥', spec: '50kg/袋', unit: '袋', quantity: 50, unitPrice: 45, batchNo: 'YC20260301', productionDate: '2026-03-01', expiryDate: '2027-03-01', location: 'A-01-01', remark: '正常入库' }] },
  { id: 2, code: 'RK20260120-001', materialCode: 'SP0202001', materialName: '尿素', quantity: 100, unit: '袋', supplier: '化肥供应商B', inboundDate: '2026-01-20', operator: '李明轩', status: 'pending', materials: [{ materialCode: 'SP0202001', materialName: '尿素', spec: '50kg/袋', unit: '袋', quantity: 100, unitPrice: 85, batchNo: 'HF20260315', productionDate: '2026-03-15', expiryDate: '2027-03-15', location: 'A-02-01', remark: '待审核' }] },
])

// Store
const warehouseMaterialStore = useWarehouseMaterialStore()
const inboundStore = useInboundStore()

// 物料数据（从Store/API加载）
const warehouseMaterials = ref([])
const inboundRecordsData = ref([])
const loading = ref(false)

// 从Store/API加载数据
const loadMaterials = async () => {
  loading.value = true
  try {
    await warehouseMaterialStore.loadItems()
    if (warehouseMaterialStore.items.length > 0) {
      warehouseMaterials.value = warehouseMaterialStore.items
    } else {
      const data = await getMaterials()
      warehouseMaterials.value = Array.isArray(data) ? data : (data.data || [])
    }
  } catch (error) {
    console.error('加载物料数据失败:', error)
    ElMessage.error('加载物料数据失败')
  } finally {
    loading.value = false
  }
}

const loadInboundRecords = async () => {
  try {
    const data = await getInboundRecords()
    inboundRecordsData.value = Array.isArray(data) ? data : (data.data || [])
  } catch (error) {
    console.error('加载入库记录失败:', error)
  }
}

// 页面加载时获取数据
onMounted(() => {
  loadMaterials()
  loadInboundRecords()
})

// 状态
const activeTab = ref('overview')
const currentPage = ref(1)
const pageSize = ref(10)
const inboundPage = ref(1)
const inboundPageSize = ref(10)
const showLowStock = ref(false)
const exportMode = ref(false)
const selectedRows = ref([])
const exportFormat = ref('excel')
const showExportModal = ref(false)
const showAddModal = ref(false)
const codeError = ref('')
const nameError = ref('')
const copySuccess = ref(false)
// 编辑/删除弹窗状态
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const showInboundEditModal = ref(false)
const showInboundDeleteModal = ref(false)
// 批量操作模式
const batchEditMode = ref(false)
const deleteMode = ref(false)
const showDeleteWarning = ref(false)
const showBatchDeleteConfirm = ref(false)

// 筛选状态
const filters = reactive({
  code: '',
  name: '',
  supplier: '',
  location: '',
  searchBigCategory: '',
  searchMidCategory: '',
  searchSubCategory: ''
})

// 编码生成器状态
const codeGen = reactive({
  bigCategory: '',
  midCategory: '',
  subCategory: '',
  generatedCode: ''
})
const codeGenError = ref('')
const codeGenSuccess = ref('')

// 新增入库表单
const newInbound = reactive({
  orderCode: '',
  bigCategory: '',
  midCategory: '',
  subCategory: '',
  materialCode: '',
  materialName: '',
  quantity: '',
  unit: '袋',
  supplier: '',
  inboundDate: '',
  operator: '',
  remarks: ''
})

// 计算属性
const filteredMaterials = computed(() => {
  const source = warehouseMaterials.value.length > 0 ? warehouseMaterials.value : mockWarehouseMaterials.value
  return source.filter(m => {
    if (filters.code && !m.code.includes(filters.code)) return false
    if (filters.name && !m.name.includes(filters.name)) return false
    if (filters.supplier && m.supplier !== filters.supplier) return false
    if (filters.location && m.location !== filters.location) return false
    if (filters.searchBigCategory && !m.code.startsWith(filters.searchBigCategory)) return false
    if (filters.searchMidCategory && !m.code.slice(2, 4).startsWith(filters.searchMidCategory)) return false
    if (filters.searchSubCategory && !m.code.slice(4, 6).startsWith(filters.searchSubCategory)) return false
    if (showLowStock.value && m.quantity >= m.minStock) return false
    return true
  })
})

const paginatedMaterials = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredMaterials.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(filteredMaterials.value.length / pageSize.value) || 1)

const lowStockCount = computed(() => {
  const source = warehouseMaterials.value.length > 0 ? warehouseMaterials.value : mockWarehouseMaterials.value
  return source.filter(m => m.quantity < m.minStock).length
})

// 合并筛选条件供ActionToolbar使用（showLowStock在ActionToolbar中需要通过filters访问）
const toolbarFilters = computed(() => ({
  ...filters,
  showLowStock: showLowStock.value
}))

const uniqueSuppliers = computed(() => {
  const source = warehouseMaterials.value.length > 0 ? warehouseMaterials.value : mockWarehouseMaterials.value
  return [...new Set(source.map(m => m.supplier))]
})

const uniqueLocations = computed(() => {
  const source = warehouseMaterials.value.length > 0 ? warehouseMaterials.value : mockWarehouseMaterials.value
  return [...new Set(source.map(m => m.location))]
})

const inboundRecords = computed(() => {
  return inboundRecordsData.value.length > 0 ? inboundRecordsData.value : mockInboundRecords.value
})

const isFormValid = computed(() => {
  return !codeError.value && !nameError.value && newInbound.materialCode && newInbound.materialName && newInbound.quantity
})

// 分类选项计算
const midCategories = computed(() => {
  if (!filters.searchBigCategory) return []
  const bigCat = categoryConfig[filters.searchBigCategory]
  if (!bigCat) return []
  return Object.entries((bigCat).categories).map(([code, data]) => ({
    code,
    name: data.name
  }))
})

const subCategories = computed(() => {
  if (!filters.searchBigCategory || !filters.searchMidCategory) return []
  const bigCat = categoryConfig[filters.searchBigCategory]
  if (!bigCat) return []
  const midCat = (bigCat).categories[filters.searchMidCategory]
  if (!midCat) return []
  return Object.entries(midCat.subCategories).map(([code, data]) => ({
    code,
    name: data.name
  }))
})

const codeGenMidCategories = computed(() => {
  if (!codeGen.bigCategory) return []
  const bigCat = categoryConfig[codeGen.bigCategory]
  if (!bigCat) return []
  return Object.entries((bigCat).categories).map(([code, data]) => ({
    code,
    name: data.name
  }))
})

const codeGenSubCategories = computed(() => {
  if (!codeGen.bigCategory || !codeGen.midCategory) return []
  const bigCat = categoryConfig[codeGen.bigCategory]
  if (!bigCat) return []
  const midCat = (bigCat).categories[codeGen.midCategory]
  if (!midCat) return []
  return Object.entries(midCat.subCategories).map(([code, data]) => ({
    code,
    name: data.name,
    prefix: data.prefix
  }))
})

const modalMidCategories = computed(() => codeGenMidCategories.value)
const modalSubCategories = computed(() => {
  if (!newInbound.bigCategory || !newInbound.midCategory) return []
  const bigCat = categoryConfig[newInbound.bigCategory]
  if (!bigCat) return []
  const midCat = (bigCat).categories[newInbound.midCategory]
  if (!midCat) return []
  return Object.entries(midCat.subCategories).map(([code, data]) => ({
    code,
    name: data.name,
    prefix: data.prefix
  }))
})

// 方法
const handleTabChange = (tab) => {
  activeTab.value = tab
  currentPage.value = 1
}

const handleLowStockClick = () => {
  showLowStock.value = !showLowStock.value
  currentPage.value = 1
}

const handleFilterChange = (field, value) => {
  (filters)[field] = value
  currentPage.value = 1
}

const handleBigCategoryChange = () => {
  filters.searchMidCategory = ''
  filters.searchSubCategory = ''
}

const handleMidCategoryChange = () => {
  filters.searchSubCategory = ''
}

const handleReset = () => {
  filters.code = ''
  filters.name = ''
  filters.supplier = ''
  filters.location = ''
  filters.searchBigCategory = ''
  filters.searchMidCategory = ''
  filters.searchSubCategory = ''
  showLowStock.value = false
  currentPage.value = 1
}

const handlePageChange = (page) => {
  currentPage.value = page
}

const handlePageSizeChange = () => {
  currentPage.value = 1
}

const handleInboundPageSizeChange = () => {
  inboundPage.value = 1
}

const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

const handleExportClick = () => {
  exportMode.value = true
  selectedRows.value = []
}

const handleConfirmExport = () => {
  showExportModal.value = true
}

const handleCancelExport = () => {
  exportMode.value = false
  selectedRows.value = []
}

const handleDoExport = () => {
  const dataToExport = selectedRows.value.length > 0
    ? selectedRows.value
    : filteredMaterials.value

  const headers = ['物料编号', '物料名称', '分类', '单位', '库存数量', '最低库存', '单价', '供应商', '存放位置']
  const exportData = dataToExport.map(m => ({
    '物料编号': m.code,
    '物料名称': m.name,
    '分类': m.category,
    '单位': m.unit,
    '库存数量': m.quantity,
    '最低库存': m.minStock,
    '单价': m.price,
    '供应商': m.supplier,
    '存放位置': m.location
  }))

  let content = ''
  let mimeType = ''
  let extension = ''

  if (exportFormat.value === 'csv') {
    const csvContent = [
      headers.join(','),
      ...exportData.map(row => headers.map(h => `"${(row)[h]}"`).join(','))
    ].join('\n')
    const BOM = '﻿'
    content = BOM + csvContent
    mimeType = 'text/csv;charset=utf-8'
    extension = 'csv'
  } else if (exportFormat.value === 'excel') {
    content = `<html><head><meta charset="utf-8"></head><body><table border="1"><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>${exportData.map(row => `<tr>${headers.map(h => `<td>${(row)[h]}</td>`).join('')}</tr>`).join('')}</table></body></html>`
    mimeType = 'application/vnd.ms-excel;charset=utf-8'
    extension = 'xls'
  } else if (exportFormat.value === 'word') {
    content = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>物料库存</title></head><body><table border="1" cellpadding="5" cellspacing="0" style="border-collapse:collapse"><tr style="background-color:#f0f0f0">${headers.map(h => `<th>${h}</th>`).join('')}</tr>${exportData.map(row => `<tr>${headers.map(h => `<td>${(row)[h]}</td>`).join('')}</tr>`).join('')}</table></body></html>`
    mimeType = 'application/ms-word;charset=utf-8'
    extension = 'doc'
  }

  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `物料库存_${new Date().toISOString().slice(0, 10)}.${extension}`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  showExportModal.value = false
  exportMode.value = false
  selectedRows.value = []
  ElMessage.success('导出成功')
}

// 编码生成器方法
const handleCodeGenBigCategoryChange = () => {
  codeGen.midCategory = ''
  codeGen.subCategory = ''
  codeGen.generatedCode = ''
}

const handleCodeGenMidCategoryChange = () => {
  codeGen.subCategory = ''
  codeGen.generatedCode = ''
}

const handleCodeGenSubCategoryChange = () => {
  codeGen.generatedCode = ''
}

const handleCodeGen = () => {
  codeGenError.value = ''
  codeGenSuccess.value = ''
  if (!codeGen.bigCategory || !codeGen.midCategory || !codeGen.subCategory) {
    codeGenError.value = '请先选择大类、中类、小类'
    return
  }

  const subCat = codeGenSubCategories.value.find(s => s.code === codeGen.subCategory)
  if (!subCat) return

  const prefix = (subCat).prefix
  const source = warehouseMaterials.value.length > 0 ? warehouseMaterials.value : mockWarehouseMaterials.value
  const existingCodes = source
    .filter(m => m.code.startsWith(prefix))
    .map(m => parseInt(m.code.slice(-3)))

  let maxSeq = 0
  if (existingCodes.length > 0) {
    maxSeq = Math.max(...existingCodes)
  }

  const newSeq = (maxSeq + 1).toString().padStart(3, '0')
  codeGen.generatedCode = prefix + newSeq
  codeGenSuccess.value = '编码已生成！'
}

const handleVerifyCode = () => {
  if (!codeGen.generatedCode) {
    codeGenError.value = '请先生成编码'
    return
  }

  const source = warehouseMaterials.value.length > 0 ? warehouseMaterials.value : mockWarehouseMaterials.value
  const exists = source.some(m => m.code === codeGen.generatedCode)
  if (exists) {
    codeGenError.value = '警告：该编码已在库存中存在！'
    codeGenSuccess.value = ''
  } else {
    codeGenError.value = ''
    codeGenSuccess.value = '验证通过：该编码可以使用！'
  }
}

const handleCopyCode = () => {
  if (!codeGen.generatedCode) return
  navigator.clipboard.writeText(codeGen.generatedCode)
  copySuccess.value = true
  setTimeout(() => { copySuccess.value = false }, 2000)
}

// 新增入库相关方法
const handleAddInbound = () => {
  showAddModal.value = true
}

const generateOrderCode = () => {
  const today = new Date()
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '')
  const sourceRecords = inboundRecords.value.length > 0 ? inboundRecords.value : mockInboundRecords.value
  const todayRecords = sourceRecords.filter(r => r.code.startsWith(`RK${dateStr}`))
  let maxSeq = 0
  if (todayRecords.length > 0) {
    const sequences = todayRecords.map(r => parseInt(r.code.split('-')[1] || '0'))
    maxSeq = Math.max(...sequences)
  }
  const newSeq = (maxSeq + 1).toString().padStart(3, '0')
  newInbound.orderCode = `RK${dateStr}-${newSeq}`
}

const handleGenerateCodeInModal = () => {
  if (!newInbound.bigCategory || !newInbound.midCategory || !newInbound.subCategory) {
    codeError.value = '请先选择大类、中类、小类'
    return
  }

  const subCat = modalSubCategories.value.find(s => s.code === newInbound.subCategory)
  if (!subCat) return

  const prefix = (subCat).prefix
  const source = warehouseMaterials.value.length > 0 ? warehouseMaterials.value : mockWarehouseMaterials.value
  const existingCodes = source
    .filter(m => m.code.startsWith(prefix))
    .map(m => parseInt(m.code.slice(-3)))

  let maxSeq = 0
  if (existingCodes.length > 0) {
    maxSeq = Math.max(...existingCodes)
  }

  const newSeq = (maxSeq + 1).toString().padStart(3, '0')
  newInbound.materialCode = prefix + newSeq
  checkCodeDuplicate()
}

const handleModalBigCategoryChange = () => {
  newInbound.midCategory = ''
  newInbound.subCategory = ''
  newInbound.materialCode = ''
}

const handleModalMidCategoryChange = () => {
  newInbound.subCategory = ''
  newInbound.materialCode = ''
}

const checkCodeDuplicate = () => {
  if (!newInbound.materialCode) return
  const source = warehouseMaterials.value.length > 0 ? warehouseMaterials.value : mockWarehouseMaterials.value
  const exists = source.some(m => m.code === newInbound.materialCode)
  if (exists) {
    codeError.value = '该物料编码已存在，请重新选择分类'
  } else {
    codeError.value = ''
  }
}

const checkNameDuplicate = () => {
  if (!newInbound.materialName) return
  const source = warehouseMaterials.value.length > 0 ? warehouseMaterials.value : mockWarehouseMaterials.value
  const exists = source.some(m => m.name === newInbound.materialName)
  if (exists) {
    nameError.value = '该物料名称已存在'
  } else {
    nameError.value = ''
  }
}

const handleSaveInbound = async () => {
  if (codeError.value || nameError.value) return
  if (!newInbound.materialCode || !newInbound.materialName || !newInbound.quantity) return

  try {
    await inboundStore.addItem({
      code: newInbound.orderCode || `RK${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${String(inboundRecordsData.value.length + 1).padStart(3,'0')}`,
      materialCode: newInbound.materialCode,
      materialName: newInbound.materialName,
      quantity: Number(newInbound.quantity),
      unit: newInbound.unit,
      supplier: newInbound.supplier,
      inboundDate: newInbound.inboundDate || new Date().toISOString().slice(0, 10),
      operator: newInbound.operator,
      status: 'pending',
      materials: [{
        materialCode: newInbound.materialCode,
        materialName: newInbound.materialName,
        spec: '',
        unit: newInbound.unit,
        quantity: Number(newInbound.quantity),
        unitPrice: 0,
        batchNo: '',
        location: '',
        remark: newInbound.remarks || ''
      }]
    })
    showAddModal.value = false
    resetNewInbound()
    await loadInboundRecords()
    ElMessage.success('入库记录保存成功')
  } catch (error) {
    ElMessage.error('保存失败: ' + (error.message || '未知错误'))
  }
}

const handleCloseModal = () => {
  showAddModal.value = false
  resetNewInbound()
}

const resetNewInbound = () => {
  newInbound.orderCode = ''
  newInbound.bigCategory = ''
  newInbound.midCategory = ''
  newInbound.subCategory = ''
  newInbound.materialCode = ''
  newInbound.materialName = ''
  newInbound.quantity = ''
  newInbound.unit = '袋'
  newInbound.supplier = ''
  newInbound.inboundDate = ''
  newInbound.operator = ''
  newInbound.remarks = ''
  codeError.value = ''
  nameError.value = ''
}

const showDetailModal = ref(false)
const showInboundDetailModal = ref(false)
const selectedMaterial = ref(null)
const selectedInboundRecord = ref(null)

const handleView = (row) => {
  selectedMaterial.value = row
  showDetailModal.value = true
}

const handleViewInbound = (row) => {
  selectedInboundRecord.value = row
  showInboundDetailModal.value = true
}

// ========== 批量操作工具栏回调 ==========

// 切换库存不足筛选
const handleToolbarLowStockToggle = () => {
  showLowStock.value = !showLowStock.value
  currentPage.value = 1
}

// 进入批量编辑模式
const handleToolbarBatchEdit = () => {
  batchEditMode.value = true
  selectedRows.value = []
}

// 取消批量编辑
const handleToolbarCancelBatchEdit = () => {
  batchEditMode.value = false
  selectedRows.value = []
}

// 确认批量编辑
const handleToolbarConfirmBatchEdit = () => {
  if (selectedRows.value.length === 1) {
    // 单条编辑 - 打开编辑弹窗
    selectedMaterial.value = selectedRows.value[0]
    showEditModal.value = true
  } else if (selectedRows.value.length > 1) {
    // 多条编辑 - 暂不支持，提示用户
    ElMessage.warning('批量编辑功能暂不支持，请逐条编辑')
  }
  batchEditMode.value = false
  selectedRows.value = []
}

// 进入删除确认（先弹出警告）
const handleToolbarDelete = () => {
  showDeleteWarning.value = true
}

// 警告确认后进入删除模式
const handleToolbarConfirmDeleteWarning = () => {
  showDeleteWarning.value = false
  deleteMode.value = true
  selectedRows.value = []
}

// 取消删除模式
const handleToolbarCancelDelete = () => {
  deleteMode.value = false
  selectedRows.value = []
}

// 确认批量删除（弹出确认框）
const handleToolbarConfirmBatchDelete = () => {
  showBatchDeleteConfirm.value = true
}

// 批量删除确认后的实际删除
const handleConfirmBatchDelete = () => {
  const ids = selectedRows.value.map(r => r.id)
  warehouseMaterials.value = warehouseMaterials.value.filter(m => !ids.includes(m.id))
  showBatchDeleteConfirm.value = false
  deleteMode.value = false
  selectedRows.value = []
  ElMessage.success('批量删除成功')
}

// 进入导出模式
const handleToolbarExport = () => {
  exportMode.value = true
  selectedRows.value = []
}

// 确认导出
const handleToolbarConfirmExport = () => {
  showExportModal.value = true
}

// 取消导出模式
const handleToolbarCancelExport = () => {
  exportMode.value = false
  selectedRows.value = []
}

// ========== 物料编辑/删除（单条） ==========

// 编辑物料
const handleEdit = (material) => {
  selectedMaterial.value = material
  showEditModal.value = true
}

// 删除物料
const handleDelete = (material) => {
  selectedMaterial.value = material
  showDeleteModal.value = true
}

// 确认删除单个物料
const handleConfirmDelete = () => {
  if (selectedMaterial.value) {
    warehouseMaterials.value = warehouseMaterials.value.filter(m => m.id !== selectedMaterial.value.id)
    ElMessage.success('物料已删除')
  }
  showDeleteModal.value = false
  selectedMaterial.value = null
}

// 保存编辑后的物料
const handleSaveEdit = (material) => {
  warehouseMaterials.value = warehouseMaterials.value.map(m => m.id === material.id ? material : m)
  showEditModal.value = false
  selectedMaterial.value = null
  ElMessage.success('物料信息已更新')
}

// ========== 入库记录编辑/删除 ==========

// 入库记录编辑表单
const inboundEditForm = reactive({
  id: null,
  code: '',
  inboundDate: '',
  supplier: '',
  operator: '',
  status: ''
})

// 编辑入库记录
const handleEditInbound = (row) => {
  selectedInboundRecord.value = row
  // 初始化编辑表单
  inboundEditForm.id = row.id
  inboundEditForm.code = row.code
  inboundEditForm.inboundDate = row.inboundDate
  inboundEditForm.supplier = row.supplier
  inboundEditForm.operator = row.operator
  inboundEditForm.status = row.status
  showInboundEditModal.value = true
}

// 保存入库记录编辑
const handleSaveInboundEdit = () => {
  if (selectedInboundRecord.value) {
    const idx = inboundRecordsData.value.findIndex(r => r.id === selectedInboundRecord.value.id)
    if (idx !== -1) {
      inboundRecordsData.value[idx] = {
        ...inboundRecordsData.value[idx],
        inboundDate: inboundEditForm.inboundDate,
        supplier: inboundEditForm.supplier,
        operator: inboundEditForm.operator,
        status: inboundEditForm.status
      }
    }
    ElMessage.success('入库记录已更新')
  }
  showInboundEditModal.value = false
  selectedInboundRecord.value = null
}

// 删除入库记录（单条）
const handleDeleteInbound = (row) => {
  selectedInboundRecord.value = row
  showInboundDeleteModal.value = true
}

// 确认删除入库记录
const handleConfirmInboundDelete = () => {
  if (selectedInboundRecord.value) {
    inboundRecordsData.value = inboundRecordsData.value.filter(r => r.id !== selectedInboundRecord.value.id)
    ElMessage.success('入库记录已删除')
  }
  showInboundDeleteModal.value = false
  selectedInboundRecord.value = null
}
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
/* 蓝色悬停行 */
:deep(.el-table__body-wrapper .el-table__body tr:hover > td) {
  background-color: #dbeafe !important;
}
</style>
