<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
            <el-icon :size="24" color="white"><Goods /></el-icon>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">物料入库</h1>
            <p class="text-gray-500">物料入库记录管理</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 编码规则生成器（可折叠） -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="px-6 py-3 flex items-center gap-3 border-b border-gray-100">
        <el-button size="small" @click="$router.push('/code-rule')">编码规则 &gt;&gt;</el-button>
        <div class="h-6 w-px bg-gray-300"></div>
        <span class="text-base font-bold text-blue-600">物料编码生成</span>
        <el-button
          text
          size="small"
          @click="codeGenExpanded = !codeGenExpanded"
        >
          <el-icon>
            <ArrowDown v-if="!codeGenExpanded" />
            <ArrowUp v-if="codeGenExpanded" />
          </el-icon>
          {{ codeGenExpanded ? '收起' : '展开' }}
        </el-button>
        <span class="text-xs text-gray-400 ml-auto">编码规则：大类(2位)+中类(2位)+小类(2位)+序号(3位)</span>
      </div>

      <div v-if="codeGenExpanded" class="p-6">
        <div class="grid grid-cols-4 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">大类</label>
            <el-select
              v-model="codeGen.bigCategory"
              placeholder="请选择大类"
              class="w-full"
              @change="handleCodeGenBigCategoryChange"
            >
              <el-option
                v-for="cat in bigCategoriesList"
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
              class="w-full"
              :disabled="!codeGen.bigCategory"
              @change="handleCodeGenMidCategoryChange"
            >
              <el-option
                v-for="cat in midCategories"
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
              class="w-full"
              :disabled="!codeGen.midCategory"
              @change="handleCodeGenSubCategoryChange"
            >
              <el-option
                v-for="cat in subCategories"
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
                @click="handleGenerateCode"
              >生成</el-button>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <el-button :disabled="!codeGen.generatedCode" @click="handleCopyCode">
            <el-icon><Download /></el-icon>
            {{ copySuccess ? '已复制!' : '复制编码' }}
          </el-button>
          <span class="text-xs text-gray-400">生成的编码可复制后用于新增物料的物料编码字段</span>
        </div>

        <div v-if="codeGenError" class="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">{{ codeGenError }}</div>
        <div v-if="codeGenSuccess && !codeGenError" class="mt-3 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-600">{{ codeGenSuccess }}</div>
      </div>
    </div>

    <!-- 入库记录搜索栏 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex flex-wrap items-center gap-3">
        <el-input
          v-model="searchCode"
          placeholder="搜索入库单号"
          clearable
          style="width: 200px"
          @clear="handleSearch"
          @keyup.enter="handleSearch"
        />
        <el-input
          v-model="searchSupplier"
          placeholder="搜索供应商"
          clearable
          style="width: 200px"
          @clear="handleSearch"
          @keyup.enter="handleSearch"
        />
        <el-select
          v-model="searchStatus"
          placeholder="全部状态"
          clearable
          style="width: 140px"
          @change="handleSearch"
        >
          <el-option label="已完成" value="completed" />
          <el-option label="待审核" value="pending" />
          <el-option label="已作废" value="voided" />
        </el-select>
        <el-input
          v-model="searchMaterialName"
          placeholder="搜索物料名称"
          clearable
          style="width: 200px"
          @clear="handleSearch"
          @keyup.enter="handleSearch"
        />
        <el-input
          v-model="searchMaterialCode"
          placeholder="搜索物料编码"
          clearable
          style="width: 200px"
          @clear="handleSearch"
          @keyup.enter="handleSearch"
        />
        <el-button @click="resetSearchFilters">重置</el-button>
      </div>
    </div>

    <!-- 入库记录表格区域 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="p-4 border-b border-gray-100 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <h3 class="text-lg font-semibold text-gray-900">物料入库记录</h3>
          <template v-if="hasActiveMode">
            <el-button link size="small" @click="handleSelectAll">
              {{ isAllSelected ? '全不选' : '全选' }}
            </el-button>
            <span class="text-sm text-gray-500">已选择 {{ selectedRows.length }} 项</span>
          </template>
        </div>

        <div class="flex items-center gap-2">
          <!-- 正常模式 -->
          <template v-if="!hasActiveMode">
            <el-button size="small" type="primary" @click="handleAddRecord">
              <el-icon><Plus /></el-icon>新增
            </el-button>
            <el-button size="small" type="warning" @click="enterEditMode">
              <el-icon><Edit /></el-icon>编辑
            </el-button>
            <el-button size="small" type="danger" @click="enterDeleteMode">
              <el-icon><Delete /></el-icon>删除
            </el-button>
            <el-button size="small" @click="enterExportMode">
              <el-icon><Download /></el-icon>导出
            </el-button>
          </template>
          <!-- 模式按钮 -->
          <template v-else>
            <template v-if="editMode">
              <el-button size="small" type="warning" @click="handleConfirmEdit">
                确认编辑{{ selectedRows.length > 0 ? ` (${selectedRows.length})` : '' }}
              </el-button>
              <el-button size="small" @click="cancelSelection">取消</el-button>
            </template>
            <template v-if="deleteMode">
              <el-button size="small" type="danger" @click="handleConfirmDelete">
                确认删除{{ selectedRows.length > 0 ? ` (${selectedRows.length})` : '' }}
              </el-button>
              <el-button size="small" @click="cancelSelection">取消</el-button>
            </template>
            <template v-if="exportMode">
              <el-button size="small" type="primary" @click="handleConfirmExport">
                <el-icon><Download /></el-icon>
                确认导出{{ selectedRows.length > 0 ? ` (${selectedRows.length})` : '' }}
              </el-button>
              <el-button size="small" @click="cancelSelection">取消选择</el-button>
            </template>
          </template>
        </div>
      </div>

      <!-- 表格 -->
      <el-table
        :data="displayedRecords"
        stripe
        @selection-change="handleSelectionChange"
        ref="tableRef"
        :header-cell-style="{ background: 'linear-gradient(to right, #3b82f6, #2563eb)', color: 'white', fontWeight: '600' }"
      >
        <el-table-column type="selection" width="50" v-if="hasActiveMode" />
        <el-table-column type="expand" width="50">
          <template #default="{ row }">
            <div class="p-4 bg-gray-50">
              <h4 class="text-sm font-semibold text-gray-700 mb-3">物料明细（共 {{ row.materials?.length || 0 }} 项）</h4>
              <el-table :data="row.materials || []" size="small" border :header-cell-style="{ background: 'linear-gradient(to right, #10b981, #059669)', color: 'white', fontWeight: '600' }">
                <el-table-column prop="code" label="物料编码" width="150" />
                <el-table-column prop="name" label="物料名称" min-width="120" />
                <el-table-column prop="category" label="分类" width="120" />
                <el-table-column prop="specification" label="规格" width="100" />
                <el-table-column prop="quantity" label="数量" width="100" align="right">
                  <template #default="{ row: m }">{{ m.quantity }} {{ m.unit }}</template>
                </el-table-column>
                <el-table-column prop="price" label="单价" width="100" align="right" />
                <el-table-column prop="batchNo" label="批次号" width="120">
                  <template #default="{ row: m }">{{ m.batchNo || '-' }}</template>
                </el-table-column>
                <el-table-column prop="expiryDate" label="有效期至" width="120">
                  <template #default="{ row: m }">{{ m.expiryDate || '-' }}</template>
                </el-table-column>
              </el-table>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="入库单号" min-width="180">
          <template #default="{ row }">
            <span class="text-blue-600 cursor-pointer hover:text-blue-800 underline" @click="handleViewRecord(row)">{{ row.code }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="inboundDate" label="入库日期" width="120" />
        <el-table-column prop="supplier" label="供应商" width="150" />
        <el-table-column prop="operator" label="操作员" width="100" />
        <el-table-column label="物料数量" width="120" align="center">
          <template #default="{ row }">{{ row.materials?.length || 0 }} 种物料</template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right" v-if="!hasActiveMode">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleViewRecord(row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500">每页</span>
          <el-select v-model="pageSize" style="width: 80px" @change="handlePageSizeChange">
            <el-option :value="10" label="10" />
            <el-option :value="20" label="20" />
            <el-option :value="50" label="50" />
          </el-select>
          <span class="text-sm text-gray-500">条</span>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-sm text-gray-500">
            共 {{ paginationTotal }} 条，第 {{ currentPage }} / {{ totalPages }} 页
          </span>
          <el-pagination
            v-model:current-page="currentPage"
            :page-size="pageSize"
            :total="paginationTotal"
            layout="prev, pager, next"
            small
          />
        </div>
      </div>
    </div>

    <!-- ========== 弹窗 ========== -->

    <!-- 查看详情弹窗 -->
    <el-dialog v-model="showDetailModal" title="入库详情" width="900px" :close-on-click-modal="false">
      <template v-if="detailRecord">
        <div class="bg-emerald-50 rounded-lg p-4 mb-6 border border-emerald-200">
          <div class="grid grid-cols-5 gap-4">
            <div>
              <span class="text-xs text-emerald-600 block font-medium">入库单号</span>
              <span class="text-lg font-mono font-bold text-emerald-700">{{ detailRecord.code }}</span>
            </div>
            <div>
              <span class="text-xs text-emerald-600 block font-medium">入库日期</span>
              <span class="text-sm font-medium text-gray-900">{{ detailRecord.inboundDate || '-' }}</span>
            </div>
            <div>
              <span class="text-xs text-emerald-600 block font-medium">供应商</span>
              <span class="text-sm font-medium text-gray-900">{{ detailRecord.supplier || '-' }}</span>
            </div>
            <div>
              <span class="text-xs text-emerald-600 block font-medium">操作员</span>
              <span class="text-sm font-medium text-gray-900">{{ detailRecord.operator || '-' }}</span>
            </div>
            <div>
              <span class="text-xs text-emerald-600 block font-medium">状态</span>
              <span class="text-sm font-medium" :class="{
                'text-green-600': detailRecord.status === 'completed',
                'text-gray-500': detailRecord.status === 'voided',
                'text-amber-600': detailRecord.status === 'pending'
              }">
                {{ getStatusText(detailRecord.status) }}
              </span>
            </div>
          </div>
          <div class="mt-3 pt-3 border-t border-emerald-200">
            <span class="text-xs text-emerald-600">物料统计：</span>
            <span class="text-sm font-medium text-gray-900 ml-2">
              共 {{ detailRecord.materials?.length || 0 }} 种物料，合计 {{ detailRecord.materials?.reduce((sum, m) => sum + Number(m.quantity), 0) || 0 }} 件
            </span>
          </div>
        </div>
        <h4 class="text-sm font-semibold text-gray-700 mb-2">物料明细</h4>
        <el-table :data="detailRecord.materials || []" size="small" border max-height="300">
          <el-table-column prop="code" label="物料编码" width="140" />
          <el-table-column prop="name" label="物料名称" width="140" />
          <el-table-column prop="category" label="分类" width="120" />
          <el-table-column prop="specification" label="规格" width="100" />
          <el-table-column prop="barcode" label="条形码" width="120" />
          <el-table-column prop="unit" label="单位" width="70" />
          <el-table-column prop="quantity" label="数量" width="80" />
          <el-table-column prop="price" label="单价" width="80" />
          <el-table-column prop="supplier" label="供应商" width="120" />
          <el-table-column prop="batchNo" label="批次号" width="100" />
          <el-table-column prop="location" label="存放位置" width="100" />
          <el-table-column prop="remarks" label="备注" width="100" />
        </el-table>
      </template>
      <template #footer>
        <el-button @click="showDetailModal = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 新增入库弹窗 -->
    <el-dialog v-model="showAddModal" title="新增入库" width="900px" :close-on-click-modal="false" @close="resetAddForm">
      <el-form :model="addForm" label-width="100px" ref="addFormRef">
        <el-form-item label="入库单号">
          <div class="flex gap-2 w-full">
            <el-input v-model="addForm.code" placeholder="点击自动生成" readonly class="flex-1" />
            <el-button type="primary" @click="generateOrderCode">
              <el-icon><Refresh /></el-icon>自动生成
            </el-button>
          </div>
        </el-form-item>
        <el-form-item label="入库日期">
          <el-date-picker v-model="addForm.inboundDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="供应商">
          <el-input v-model="addForm.supplier" placeholder="请输入供应商" />
        </el-form-item>
        <el-form-item label="操作员">
          <el-input v-model="addForm.operator" placeholder="请输入操作员" />
        </el-form-item>

        <!-- 物料明细编辑区域 -->
        <el-divider content-position="left">物料明细</el-divider>
        <div class="mb-3 flex justify-end">
          <el-button size="small" type="primary" @click="addMaterialRow">
            <el-icon><Plus /></el-icon>添加物料
          </el-button>
        </div>
        <div class="border rounded overflow-hidden">
          <el-table :data="addForm.materials" size="small" border>
            <el-table-column label="物料编码" width="150">
              <template #default="{ row, $index }">
                <div class="flex gap-1">
                  <el-input v-model="row.code" size="small" placeholder="编码" style="width: 110px" />
                  <el-button size="small" text @click="openAddMaterialCodeGen($index)">
                    <el-icon><Setting /></el-icon>
                  </el-button>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="物料名称" width="130">
              <template #default="{ row }">
                <el-input v-model="row.name" size="small" placeholder="名称" />
              </template>
            </el-table-column>
            <el-table-column label="分类" width="120">
              <template #default="{ row }">
                <el-input v-model="row.category" size="small" placeholder="分类" />
              </template>
            </el-table-column>
            <el-table-column label="规格" width="100">
              <template #default="{ row }">
                <el-input v-model="row.specification" size="small" placeholder="规格" />
              </template>
            </el-table-column>
            <el-table-column label="条形码" width="110">
              <template #default="{ row }">
                <el-input v-model="row.barcode" size="small" placeholder="条形码" />
              </template>
            </el-table-column>
            <el-table-column label="单位" width="80">
              <template #default="{ row }">
                <el-select v-model="row.unit" size="small" placeholder="单位">
                  <el-option v-for="u in unitOptions" :key="u" :label="u" :value="u" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="数量" width="80">
              <template #default="{ row }">
                <el-input v-model.number="row.quantity" size="small" type="number" placeholder="数量" />
              </template>
            </el-table-column>
            <el-table-column label="单价" width="80">
              <template #default="{ row }">
                <el-input v-model="row.price" size="small" placeholder="单价" />
              </template>
            </el-table-column>
            <el-table-column label="供应商" width="120">
              <template #default="{ row }">
                <el-input v-model="row.supplier" size="small" placeholder="供应商" />
              </template>
            </el-table-column>
            <el-table-column label="存放位置" width="100">
              <template #default="{ row }">
                <el-input v-model="row.location" size="small" placeholder="位置" />
              </template>
            </el-table-column>
            <el-table-column label="批号" width="100">
              <template #default="{ row }">
                <el-input v-model="row.batchNo" size="small" placeholder="批号" />
              </template>
            </el-table-column>
            <el-table-column label="生产日期" width="120">
              <template #default="{ row }">
                <el-date-picker v-model="row.productionDate" type="date" size="small" value-format="YYYY-MM-DD" placeholder="生产日期" style="width: 100%" />
              </template>
            </el-table-column>
            <el-table-column label="过期日期" width="120">
              <template #default="{ row }">
                <el-date-picker v-model="row.expiryDate" type="date" size="small" value-format="YYYY-MM-DD" placeholder="过期日期" style="width: 100%" />
              </template>
            </el-table-column>
            <el-table-column label="备注" width="100">
              <template #default="{ row }">
                <el-input v-model="row.remarks" size="small" placeholder="备注" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="60" fixed="right">
              <template #default="{ $index }">
                <el-button link type="danger" size="small" @click="removeMaterialRow($index)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 弹窗内编码生成器 -->
        <div v-if="showModalCodeGen" class="mt-3 p-3 bg-gray-50 rounded border">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-sm font-semibold text-gray-700">编码生成（第{{ modalCodeGenIndex + 1 }}行物料）</span>
            <el-button link size="small" @click="showModalCodeGen = false">关闭</el-button>
          </div>
          <div class="grid grid-cols-4 gap-3">
            <el-select v-model="modalCodeGen.bigCategory" placeholder="大类" size="small" @change="handleModalCodeGenBigChange">
              <el-option v-for="cat in bigCategoriesList" :key="cat.code" :label="`${cat.code} - ${cat.name}`" :value="cat.code" />
            </el-select>
            <el-select v-model="modalCodeGen.midCategory" placeholder="中类" size="small" :disabled="!modalCodeGen.bigCategory" @change="handleModalCodeGenMidChange">
              <el-option v-for="cat in modalMidCategories" :key="cat.code" :label="`${cat.code} - ${cat.name}`" :value="cat.code" />
            </el-select>
            <el-select v-model="modalCodeGen.subCategory" placeholder="小类" size="small" :disabled="!modalCodeGen.midCategory">
              <el-option v-for="cat in modalSubCategories" :key="cat.code" :label="`${cat.code} - ${cat.name}`" :value="cat.code" />
            </el-select>
            <div class="flex gap-1">
              <el-button size="small" type="primary" :disabled="!modalCodeGen.subCategory" @click="generateModalCode">生成</el-button>
            </div>
          </div>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="showAddModal = false">取消</el-button>
        <el-button type="primary" @click="handleSaveNewInbound">保存</el-button>
      </template>
    </el-dialog>

    <!-- 编辑入库弹窗（状态感知） -->
    <el-dialog v-model="showEditModal" title="编辑入库记录" width="900px" :close-on-click-modal="false">
      <template v-if="editRecord">
        <!-- 已完成状态警告 -->
        <div v-if="editRecord.status === 'completed'" class="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
          <el-icon color="#f59e0b"><WarningFilled /></el-icon>
          <span class="text-sm text-amber-700">此记录已完成，物料明细不可编辑。如需修改请申请作废后重新录入。</span>
        </div>
        <!-- 已作废状态提示 -->
        <div v-if="editRecord.status === 'voided'" class="mb-4 p-3 bg-gray-100 border border-gray-400 rounded-lg flex items-center gap-2">
          <el-icon color="#6b7280"><WarningFilled /></el-icon>
          <span class="text-sm text-gray-600">此记录已作废，仅供查看，无法编辑。</span>
        </div>

        <div class="bg-gray-50 rounded-lg p-4 mb-4">
          <div class="grid grid-cols-5 gap-4">
            <div>
              <span class="text-xs text-gray-500 block">入库单号</span>
              <span class="text-sm font-medium text-gray-900">{{ editRecord.code }}</span>
            </div>
            <div>
              <span class="text-xs text-gray-500 block">入库日期</span>
              <span class="text-sm font-medium text-gray-900">{{ editRecord.inboundDate }}</span>
            </div>
            <div>
              <span class="text-xs text-gray-500 block">供应商</span>
              <span class="text-sm font-medium text-gray-900">{{ editRecord.supplier }}</span>
            </div>
            <div>
              <span class="text-xs text-gray-500 block">操作员</span>
              <span class="text-sm font-medium text-gray-900">{{ editRecord.operator }}</span>
            </div>
            <div>
              <span class="text-xs text-gray-500 block">状态</span>
              <span class="text-sm font-medium" :class="{
                'text-amber-600': editRecord.status === 'pending',
                'text-green-600': editRecord.status === 'completed',
                'text-gray-500': editRecord.status === 'voided'
              }">{{ getStatusText(editRecord.status) }}</span>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between mb-3">
          <h4 class="text-sm font-semibold text-gray-800">物料明细（{{ editForm.materials.length }}种物料）</h4>
          <el-button v-if="editRecord.status === 'pending'" size="small" type="primary" @click="addEditMaterialRow">
            <el-icon><Plus /></el-icon>添加物料
          </el-button>
        </div>
        <div class="border rounded overflow-hidden">
          <el-table :data="editForm.materials" size="small" border>
            <el-table-column label="操作" width="60" fixed="right">
              <template #default="{ $index }">
                <el-button v-if="editRecord.status === 'pending'" link type="danger" size="small" @click="removeEditMaterialRow($index)">
                  <el-icon><Delete /></el-icon>
                </el-button>
                <span v-else class="text-gray-400">-</span>
              </template>
            </el-table-column>
            <el-table-column label="物料编码" width="140">
              <template #default="{ row }">
                <template v-if="editRecord.status === 'pending'">
                  <el-input v-model="row.code" size="small" placeholder="编码" />
                </template>
                <span v-else class="text-xs text-blue-600 font-medium">{{ row.code }}</span>
              </template>
            </el-table-column>
            <el-table-column label="物料名称" min-width="130">
              <template #default="{ row }">
                <template v-if="editRecord.status === 'pending'">
                  <el-input v-model="row.name" size="small" placeholder="名称" />
                </template>
                <span v-else class="text-xs text-gray-900">{{ row.name }}</span>
              </template>
            </el-table-column>
            <el-table-column label="分类" width="120">
              <template #default="{ row }">
                <template v-if="editRecord.status === 'pending'">
                  <el-input v-model="row.category" size="small" placeholder="分类" />
                </template>
                <span v-else class="text-xs text-gray-600">{{ row.category || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="规格" width="100">
              <template #default="{ row }">
                <template v-if="editRecord.status === 'pending'">
                  <el-input v-model="row.specification" size="small" placeholder="规格" />
                </template>
                <span v-else class="text-xs text-gray-600">{{ row.specification || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="条形码" width="110">
              <template #default="{ row }">
                <template v-if="editRecord.status === 'pending'">
                  <el-input v-model="row.barcode" size="small" placeholder="条形码" />
                </template>
                <span v-else class="text-xs text-gray-600">{{ row.barcode || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="单位" width="80">
              <template #default="{ row }">
                <template v-if="editRecord.status === 'pending'">
                  <el-select v-model="row.unit" size="small">
                    <el-option v-for="u in unitOptions" :key="u" :label="u" :value="u" />
                  </el-select>
                </template>
                <span v-else class="text-xs text-gray-600">{{ row.unit }}</span>
              </template>
            </el-table-column>
            <el-table-column label="数量" width="80">
              <template #default="{ row }">
                <template v-if="editRecord.status === 'pending'">
                  <el-input v-model.number="row.quantity" size="small" type="number" />
                </template>
                <span v-else class="text-xs text-gray-900">{{ row.quantity }}</span>
              </template>
            </el-table-column>
            <el-table-column label="单价" width="80">
              <template #default="{ row }">
                <template v-if="editRecord.status === 'pending'">
                  <el-input v-model="row.price" size="small" placeholder="单价" />
                </template>
                <span v-else class="text-xs text-gray-900">{{ row.price }}元</span>
              </template>
            </el-table-column>
            <el-table-column label="批次号" width="100">
              <template #default="{ row }">
                <template v-if="editRecord.status === 'pending'">
                  <el-input v-model="row.batchNo" size="small" placeholder="批次号" />
                </template>
                <span v-else class="text-xs text-gray-600">{{ row.batchNo || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="存放位置" width="100">
              <template #default="{ row }">
                <template v-if="editRecord.status === 'pending'">
                  <el-input v-model="row.location" size="small" placeholder="位置" />
                </template>
                <span v-else class="text-xs text-gray-600">{{ row.location || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="生产日期" width="120">
              <template #default="{ row }">
                <template v-if="editRecord.status === 'pending'">
                  <el-date-picker v-model="row.productionDate" type="date" size="small" value-format="YYYY-MM-DD" style="width: 100%" />
                </template>
                <span v-else class="text-xs text-gray-600">{{ row.productionDate || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="过期日期" width="120">
              <template #default="{ row }">
                <template v-if="editRecord.status === 'pending'">
                  <el-date-picker v-model="row.expiryDate" type="date" size="small" value-format="YYYY-MM-DD" style="width: 100%" />
                </template>
                <span v-else class="text-xs text-gray-600">{{ row.expiryDate || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="备注" width="100">
              <template #default="{ row }">
                <template v-if="editRecord.status === 'pending'">
                  <el-input v-model="row.remarks" size="small" placeholder="备注" />
                </template>
                <span v-else class="text-xs text-gray-600">{{ row.remarks || '-' }}</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </template>
      <template #footer>
        <el-button v-if="editRecord?.status === 'completed'" type="warning" @click="handleApplyVoid">申请作废</el-button>
        <el-button @click="showEditModal = false">关闭</el-button>
        <el-button v-if="editRecord?.status === 'pending'" type="primary" @click="handleSaveEdit">保存</el-button>
      </template>
    </el-dialog>

    <!-- 批量编辑弹窗 -->
    <el-dialog v-model="showBatchEditModal" title="批量编辑入库记录" width="700px" :close-on-click-modal="false">
      <p class="text-sm text-gray-500 mb-4">正在编辑 {{ batchEditRecords.length }} 条入库记录</p>
      <el-form label-width="100px">
        <el-form-item label="入库日期">
          <el-date-picker v-model="batchEditFields.inboundDate" type="date" placeholder="留空则不修改" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="供应商">
          <el-input v-model="batchEditFields.supplier" placeholder="留空则不修改" />
        </el-form-item>
        <el-form-item label="操作员">
          <el-input v-model="batchEditFields.operator" placeholder="留空则不修改" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="batchEditFields.status" placeholder="留空则不修改" style="width: 100%">
            <el-option label="已完成" value="completed" />
            <el-option label="待审核" value="pending" />
            <el-option label="已作废" value="voided" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showBatchEditModal = false">取消</el-button>
        <el-button type="primary" @click="handleBatchSave">保存</el-button>
      </template>
    </el-dialog>

    <!-- 删除确认弹窗 -->
    <el-dialog v-model="showDeleteModal" title="确认删除" width="500px" :close-on-click-modal="false">
      <div class="text-center py-4">
        <el-icon :size="48" color="#f56c6c"><WarningFilled /></el-icon>
        <p class="mt-4 text-gray-700">确定要删除以下 {{ deleteRecords.length }} 条入库记录吗？此操作不可恢复。</p>
        <div class="mt-3 max-h-40 overflow-y-auto">
          <p v-for="r in deleteRecords" :key="r.id" class="text-sm text-gray-500 py-1">{{ r.code }} - {{ r.supplier }}</p>
        </div>
      </div>
      <template #footer>
        <el-button @click="showDeleteModal = false">取消</el-button>
        <el-button type="danger" @click="handleConfirmDeleteExecute">确认删除</el-button>
      </template>
    </el-dialog>

    <!-- 导出弹窗 -->
    <el-dialog v-model="showExportModal" title="选择导出格式" width="500px" :close-on-click-modal="false">
      <p class="text-sm text-gray-500 mb-4">已选择 {{ exportRecords.length }} 条数据</p>
      <div class="space-y-3">
        <el-radio-group v-model="exportFormat">
          <div
            v-for="fmt in exportFormats"
            :key="fmt.value"
            :class="['flex items-center p-4 border rounded-lg cursor-pointer transition-all mb-2',
              exportFormat === fmt.value ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300']"
            @click="exportFormat = fmt.value"
          >
            <el-radio :value="fmt.value">
              <span class="ml-2 block text-sm font-medium text-gray-900">{{ fmt.label }}</span>
              <span class="ml-2 block text-xs text-gray-500">{{ fmt.desc }}</span>
            </el-radio>
          </div>
        </el-radio-group>
      </div>
      <template #footer>
        <el-button @click="showExportModal = false; exitExportMode()">取消</el-button>
        <el-button type="primary" @click="handleDoExport">导出</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { Goods, ArrowDown, ArrowUp, Download, Plus, Edit, Delete, Refresh, Setting, WarningFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useInboundStore } from '@/stores/modules/inventory/useInboundStore'

// ==================== 常量配置（与V1.1一致） ====================

const unitOptions = ['袋', '箱', '个', '公斤', '升', '平方米', '吨', '包', '卷', '套', '台']

const exportFormats = [
  { value: 'excel', label: 'Excel (.xlsx)', desc: '适用于数据分析和处理' },
  { value: 'csv', label: 'CSV (.csv)', desc: '适用于数据交换' },
  { value: 'word', label: 'Word (.docx)', desc: '适用于文档编辑和分享' }
]

// 与V1.1完全一致的7大类分类配置
const bigCategoriesList = [
  { code: 'SP', name: '生产投入类' },
  { code: 'EQ', name: '设施与装备类' },
  { code: 'OP', name: '作业支持类' },
  { code: 'PH', name: '采后处理与流通类' },
  { code: 'IT', name: '数字化与管理类' },
  { code: 'EC', name: '能源与通用耗材' },
  { code: 'OT', name: '其他类' }
]

// 与V1.1完全一致的3级分类配置映射
const categoryConfig = {
  'SP': {
    name: '生产投入类',
    categories: {
      '01': { name: '种质资源', subCategories: { '01': { name: '粮食作物种子', prefix: 'SP0101' }, '02': { name: '经济作物种子', prefix: 'SP0102' }, '03': { name: '蔬菜种子', prefix: 'SP0103' }, '04': { name: '蔬菜种苗', prefix: 'SP0104' }, '05': { name: '水果苗木种苗', prefix: 'SP0105' }, '06': { name: '水果苗木种子', prefix: 'SP0106' }, '07': { name: '花卉与观赏植物', prefix: 'SP0107' }, '08': { name: '食用菌菌种', prefix: 'SP0108' }, '99': { name: '其他种质资源', prefix: 'SP0199' } } },
      '02': { name: '肥料与土壤改良剂', subCategories: { '01': { name: '有机肥', prefix: 'SP0201' }, '02': { name: '化学肥料', prefix: 'SP0202' }, '03': { name: '水溶肥', prefix: 'SP0203' }, '04': { name: '叶面肥', prefix: 'SP0204' }, '05': { name: '微生物菌剂', prefix: 'SP0205' }, '06': { name: '土壤调理剂', prefix: 'SP0206' }, '07': { name: '育苗基质', prefix: 'SP0207' }, '99': { name: '其他类型', prefix: 'SP0299' } } },
      '03': { name: '农药与植保产品', subCategories: { '01': { name: '杀虫剂', prefix: 'SP0301' }, '02': { name: '杀菌剂', prefix: 'SP0302' }, '03': { name: '杀螨剂', prefix: 'SP0303' }, '04': { name: '除草剂', prefix: 'SP0304' }, '05': { name: '植物生长调节剂', prefix: 'SP0305' }, '06': { name: '物理防控用品', prefix: 'SP0306' }, '07': { name: '生物农药', prefix: 'SP0307' }, '99': { name: '其他类型', prefix: 'SP0399' } } }
    }
  },
  'EQ': {
    name: '设施与装备类',
    categories: {
      '01': { name: '农业机械', subCategories: { '01': { name: '耕作机械', prefix: 'EQ0101' }, '02': { name: '播种/移栽设备', prefix: 'EQ0102' }, '03': { name: '植保机械', prefix: 'EQ0103' }, '04': { name: '收获机械', prefix: 'EQ0104' }, '05': { name: '初加工设备', prefix: 'EQ0105' }, '99': { name: '其他相关机械', prefix: 'EQ0199' } } },
      '02': { name: '设施农业系统', subCategories: { '01': { name: '骨架结构材料', prefix: 'EQ0201' }, '02': { name: '覆盖材料', prefix: 'EQ0202' }, '03': { name: '通风降温设备', prefix: 'EQ0203' }, '04': { name: '加温设备', prefix: 'EQ0204' }, '05': { name: '补光系统', prefix: 'EQ0205' }, '06': { name: '自动化控制设备', prefix: 'EQ0206' }, '99': { name: '其他相关设施设备', prefix: 'EQ0299' } } },
      '03': { name: '灌溉与水肥系统', subCategories: { '01': { name: '水源与泵站', prefix: 'EQ0301' }, '02': { name: '水肥一体机', prefix: 'EQ0302' }, '03': { name: '输水管网', prefix: 'EQ0303' }, '04': { name: '过滤系统', prefix: 'EQ0304' }, '05': { name: '施肥装置', prefix: 'EQ0305' }, '06': { name: '灌溉终端', prefix: 'EQ0306' }, '99': { name: '其他相关灌溉系统设备', prefix: 'EQ0399' } } }
    }
  },
  'OP': {
    name: '作业支持类',
    categories: {
      '01': { name: '劳保与防护用品', subCategories: { '01': { name: '手部防护', prefix: 'OP0101' }, '02': { name: '足部防护', prefix: 'OP0102' }, '03': { name: '身体防护', prefix: 'OP0103' }, '04': { name: '呼吸/眼部防护', prefix: 'OP0104' }, '05': { name: '防晒防暑用品', prefix: 'OP0105' }, '99': { name: '其他劳保防护类', prefix: 'OP0199' } } },
      '02': { name: '日常劳动工具', subCategories: { '01': { name: '手动农具', prefix: 'OP0201' }, '02': { name: '修剪工具', prefix: 'OP0202' }, '03': { name: '小型电动工具', prefix: 'OP0203' }, '04': { name: '清洁工具', prefix: 'OP0204' }, '05': { name: '小型运输车', prefix: 'OP0205' }, '99': { name: '其他劳动工具', prefix: 'OP0299' } } },
      '03': { name: '标识与记录用品', subCategories: { '01': { name: '田间标牌/标签', prefix: 'OP0301' }, '02': { name: '记录本、记号笔', prefix: 'OP0302' }, '03': { name: '二维码/RFID标签', prefix: 'OP0303' }, '99': { name: '其他标识记录用品', prefix: 'OP0399' } } }
    }
  },
  'PH': {
    name: '采后处理与流通类',
    categories: {
      '01': { name: '采收容器', subCategories: { '01': { name: '塑料周转箱', prefix: 'PH0101' }, '02': { name: '采摘篮/筐', prefix: 'PH0102' }, '03': { name: '吨袋/编织袋', prefix: 'PH0103' }, '04': { name: '包装材料', prefix: 'PH0104' }, '05': { name: '纸箱', prefix: 'PH0105' }, '06': { name: '泡沫网套/隔板', prefix: 'PH0106' }, '07': { name: '胶带、封口耗材', prefix: 'PH0107' }, '08': { name: '商品标签/追溯标签', prefix: 'PH0108' }, '99': { name: '其他采收材料', prefix: 'PH0199' } } },
      '02': { name: '冷链与仓储设备', subCategories: { '01': { name: '预冷库/冷藏库', prefix: 'PH0201' }, '02': { name: '冷藏运输设备', prefix: 'PH0202' }, '03': { name: '保温箱、冰袋', prefix: 'PH0203' }, '99': { name: '其他', prefix: 'PH0299' } } }
    }
  },
  'IT': {
    name: '数字化与管理类',
    categories: {
      '01': { name: '监测设备', subCategories: { '01': { name: '空气/土壤/光照等传感器', prefix: 'IT0101' }, '02': { name: '手持检测类设备', prefix: 'IT0102' }, '03': { name: '气象站', prefix: 'IT0103' }, '04': { name: '虫情测报灯', prefix: 'IT0104' }, '05': { name: '视频监控设备', prefix: 'IT0105' }, '99': { name: '其他检测相关设备', prefix: 'IT0199' } } },
      '02': { name: '控制设备', subCategories: { '01': { name: '环境参数感知设备', prefix: 'IT0201' }, '02': { name: '执行控制设备', prefix: 'IT0202' }, '03': { name: '人机交互与本地操作设备', prefix: 'IT0203' }, '04': { name: '通信与联网设备', prefix: 'IT0204' }, '05': { name: '电源与辅助控制设备', prefix: 'IT0205' }, '99': { name: '其他相关控制设备', prefix: 'IT0299' } } },
      '03': { name: '软件与服务', subCategories: { '01': { name: 'ERP模块许可', prefix: 'IT0301' }, '02': { name: '温室大棚控制系统web', prefix: 'IT0302' }, '03': { name: '温室大棚控制系统小程序', prefix: 'IT0303' }, '04': { name: '数据分析服务', prefix: 'IT0304' }, '05': { name: '产品检测服务', prefix: 'IT0305' }, '99': { name: '其他软件与服务', prefix: 'IT0399' } } }
    }
  },
  'EC': {
    name: '能源与通用耗材',
    categories: {
      '01': { name: '能源类', subCategories: { '01': { name: '柴油/汽油', prefix: 'EC0101' }, '02': { name: '电力', prefix: 'EC0102' }, '03': { name: '太阳能板及配件', prefix: 'EC0103' }, '99': { name: '其他能源类', prefix: 'EC0199' } } },
      '02': { name: '通用耗材', subCategories: { '01': { name: '电线、电缆', prefix: 'EC0201' }, '02': { name: '扎带、螺丝、密封胶', prefix: 'EC0202' }, '03': { name: '电池', prefix: 'EC0203' }, '04': { name: '润滑油、润滑脂', prefix: 'EC0204' }, '99': { name: '其他耗材', prefix: 'EC0299' } } }
    }
  },
  'OT': {
    name: '其他类',
    categories: {
      '01': { name: '未分类资材', subCategories: { '01': { name: '其他未分类资材', prefix: 'OT0101' } } }
    }
  }
}

// ==================== Store ====================

const inboundStore = useInboundStore()

// ==================== 状态定义 ====================

// 编码生成器
const codeGenExpanded = ref(false)
const codeGen = reactive({ bigCategory: '', midCategory: '', subCategory: '', generatedCode: '' })
const codeGenError = ref('')
const codeGenSuccess = ref('')
const copySuccess = ref(false)

// 分页
const currentPage = ref(1)
const pageSize = ref(10)

// 搜索筛选
const searchCode = ref('')
const searchSupplier = ref('')
const searchStatus = ref('')
const searchMaterialName = ref('')
const searchMaterialCode = ref('')

// 选择与模式
const selectedRows = ref([])
const editMode = ref(false)
const deleteMode = ref(false)
const exportMode = ref(false)

// 弹窗
const showDetailModal = ref(false)
const showAddModal = ref(false)
const showEditModal = ref(false)
const showBatchEditModal = ref(false)
const showDeleteModal = ref(false)
const showExportModal = ref(false)

// 记录选中
const detailRecord = ref(null)
const editRecord = ref(null)
const deleteRecords = ref([])
const exportRecords = ref([])
const batchEditRecords = ref([])
const batchEditFields = reactive({ inboundDate: '', supplier: '', operator: '', status: '' })

// 新增表单
const addForm = reactive({
  code: '', inboundDate: '', supplier: '', operator: '',
  materials: []
})
const addFormRef = ref()

// 编辑表单
const editForm = reactive({
  id: 0, code: '', inboundDate: '', supplier: '', operator: '', status: 'pending',
  materials: []
})

// 弹窗内编码生成器
const showModalCodeGen = ref(false)
const modalCodeGenIndex = ref(-1)
const modalCodeGen = reactive({ bigCategory: '', midCategory: '', subCategory: '' })

// 导出格式
const exportFormat = ref('excel')

// ==================== 计算属性 ====================

// 激活模式判断
const hasActiveMode = computed(() => editMode.value || deleteMode.value || exportMode.value)

// 筛选后的记录
const filteredRecords = computed(() => {
  let records = inboundStore.inboundRecords || []
  if (searchCode.value) {
    const kw = searchCode.value.toLowerCase()
    records = records.filter(r => r.code && r.code.toLowerCase().includes(kw))
  }
  if (searchSupplier.value) {
    const kw = searchSupplier.value.toLowerCase()
    records = records.filter(r => r.supplier && r.supplier.toLowerCase().includes(kw))
  }
  if (searchStatus.value) {
    records = records.filter(r => r.status === searchStatus.value)
  }
  if (searchMaterialName.value || searchMaterialCode.value) {
    const nameKw = (searchMaterialName.value || '').toLowerCase()
    const codeKw = (searchMaterialCode.value || '').toLowerCase()
    records = records.filter(r => {
      const materials = r.materials || []
      return materials.some(m => {
        const nameMatch = !nameKw || (m.name && m.name.toLowerCase().includes(nameKw))
        const codeMatch = !codeKw || (m.code && m.code.toLowerCase().includes(codeKw))
        return nameMatch && codeMatch
      })
    })
  }
  return records
})

// 总页数
const totalPages = computed(() => Math.ceil(filteredRecords.value.length / pageSize.value) || 1)

// 总条数
const paginationTotal = computed(() => filteredRecords.value.length)

// 当前页显示
const displayedRecords = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredRecords.value.slice(start, start + pageSize.value)
})

// 选中的记录
const selectedRecords = computed(() => {
  const allRecords = inboundStore.inboundRecords || []
  return allRecords.filter(r => selectedRows.value.includes(r.id))
})

// 全选判断
const isAllSelected = computed(() => {
  if (deleteMode.value) {
    const pendingRecords = displayedRecords.value.filter(r => r.status === 'pending')
    return pendingRecords.length > 0 && pendingRecords.every(r => selectedRows.value.includes(r.id))
  }
  return displayedRecords.value.length > 0 && selectedRows.value.length === displayedRecords.value.length
})

// 编码生成器中类选项
const midCategories = computed(() => {
  if (!codeGen.bigCategory) return []
  const big = categoryConfig[codeGen.bigCategory]
  if (!big) return []
  return Object.entries(big.categories).map(([code, data]) => ({ code, name: data.name }))
})

// 编码生成器小类选项
const subCategories = computed(() => {
  if (!codeGen.bigCategory || !codeGen.midCategory) return []
  const big = categoryConfig[codeGen.bigCategory]
  if (!big) return []
  const mid = big.categories[codeGen.midCategory]
  if (!mid) return []
  return Object.entries(mid.subCategories).map(([code, data]) => ({ code, name: data.name, prefix: data.prefix }))
})

// 弹窗内编码中类
const modalMidCategories = computed(() => {
  if (!modalCodeGen.bigCategory) return []
  const big = categoryConfig[modalCodeGen.bigCategory]
  if (!big) return []
  return Object.entries(big.categories).map(([code, data]) => ({ code, name: data.name }))
})

// 弹窗内编码小类
const modalSubCategories = computed(() => {
  if (!modalCodeGen.bigCategory || !modalCodeGen.midCategory) return []
  const big = categoryConfig[modalCodeGen.bigCategory]
  if (!big) return []
  const mid = big.categories[modalCodeGen.midCategory]
  if (!mid) return []
  return Object.entries(mid.subCategories).map(([code, data]) => ({ code, name: data.name, prefix: data.prefix }))
})

// ==================== 状态工具函数 ====================

const getStatusText = (status) => {
  switch (status) {
    case 'completed': return '已完成'
    case 'voided': return '已作废'
    case 'pending':
    default: return '待审核'
  }
}

const getStatusTagType = (status) => {
  switch (status) {
    case 'completed': return 'success'
    case 'voided': return 'info'
    case 'pending':
    default: return 'warning'
  }
}

// ==================== 编码生成器 ====================

const handleCodeGenBigCategoryChange = () => {
  codeGen.midCategory = ''
  codeGen.subCategory = ''
  codeGen.generatedCode = ''
  codeGenError.value = ''
  codeGenSuccess.value = ''
}

const handleCodeGenMidCategoryChange = () => {
  codeGen.subCategory = ''
  codeGen.generatedCode = ''
  codeGenError.value = ''
  codeGenSuccess.value = ''
}

const handleCodeGenSubCategoryChange = () => {
  codeGen.generatedCode = ''
  codeGenError.value = ''
  codeGenSuccess.value = ''
}

const handleGenerateCode = () => {
  codeGenError.value = ''
  codeGenSuccess.value = ''
  if (!codeGen.bigCategory || !codeGen.midCategory || !codeGen.subCategory) {
    codeGenError.value = '请选择完整的分类'
    return
  }
  const baseCode = `${codeGen.bigCategory}${codeGen.midCategory}${codeGen.subCategory}`
  const seq = Math.floor(Math.random() * 999) + 1
  codeGen.generatedCode = `${baseCode}${String(seq).padStart(3, '0')}`
  codeGenSuccess.value = `生成成功: ${codeGen.generatedCode}`
}

const handleCopyCode = () => {
  if (!codeGen.generatedCode) return
  navigator.clipboard.writeText(codeGen.generatedCode)
  copySuccess.value = true
  setTimeout(() => { copySuccess.value = false }, 2000)
}

// ==================== 筛选 ====================

const handleSearch = () => {
  currentPage.value = 1
}

const resetSearchFilters = () => {
  searchCode.value = ''
  searchSupplier.value = ''
  searchStatus.value = ''
  searchMaterialName.value = ''
  searchMaterialCode.value = ''
  currentPage.value = 1
}

// ==================== 分页 ====================

const handlePageSizeChange = () => {
  currentPage.value = 1
}

// ==================== 选择与模式 ====================

const handleSelectionChange = (selection) => {
  selectedRows.value = selection.map(row => row.id)
}

const handleSelectAll = () => {
  if (deleteMode.value) {
    const pendingIds = displayedRecords.value.filter(r => r.status === 'pending').map(r => r.id)
    const allSelected = pendingIds.every(id => selectedRows.value.includes(id))
    if (allSelected) {
      selectedRows.value = selectedRows.value.filter(id => !pendingIds.includes(id))
    } else {
      const existing = selectedRows.value.filter(id => !pendingIds.includes(id))
      selectedRows.value = [...existing, ...pendingIds]
    }
  } else {
    if (selectedRows.value.length === displayedRecords.value.length) {
      selectedRows.value = []
    } else {
      selectedRows.value = displayedRecords.value.map(r => r.id)
    }
  }
}

const enterEditMode = () => {
  editMode.value = true
  deleteMode.value = false
  exportMode.value = false
  selectedRows.value = []
}

const enterDeleteMode = () => {
  deleteMode.value = true
  editMode.value = false
  exportMode.value = false
  selectedRows.value = []
}

const enterExportMode = () => {
  exportMode.value = true
  editMode.value = false
  deleteMode.value = false
  selectedRows.value = []
}

const cancelSelection = () => {
  editMode.value = false
  deleteMode.value = false
  exportMode.value = false
  selectedRows.value = []
}

const exitExportMode = () => {
  exportMode.value = false
  selectedRows.value = []
}

// ==================== 查看/编辑记录 ====================

const handleViewRecord = (record) => {
  detailRecord.value = record
  showDetailModal.value = true
}

const handleEditRecord = (record) => {
  editRecord.value = record
  editForm.id = record.id
  editForm.code = record.code
  editForm.inboundDate = record.inboundDate || ''
  editForm.supplier = record.supplier || ''
  editForm.operator = record.operator || ''
  editForm.status = record.status || 'pending'
  editForm.materials = (record.materials || []).map(m => ({ ...m }))
  showEditModal.value = true
}

// ==================== 新增入库 ====================

const handleAddRecord = () => {
  resetAddForm()
  showAddModal.value = true
}

const resetAddForm = () => {
  addForm.code = ''
  addForm.inboundDate = ''
  addForm.supplier = ''
  addForm.operator = ''
  addForm.materials = []
}

// 生成入库单号 RKYYYYMMDD-NNNN
const generateOrderCode = () => {
  const now = new Date()
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
  const prefix = `RK${dateStr}-`
  const records = inboundStore.inboundRecords || []
  let maxSeq = 0
  records.forEach(r => {
    if (r.code && r.code.startsWith(prefix)) {
      const seq = parseInt(r.code.replace(prefix, ''), 10)
      if (!isNaN(seq) && seq > maxSeq) maxSeq = seq
    }
  })
  const newSeq = maxSeq + 1
  addForm.code = newSeq > 9999 ? `${prefix}ERR` : `${prefix}${String(newSeq).padStart(4, '0')}`
}

const createEmptyMaterial = () => ({
  id: Date.now(),
  code: '', name: '', category: '', bigCategory: '', midCategory: '', subCategory: '',
  specification: '', barcode: '', unit: '袋', quantity: 0, price: '',
  location: '', batchNo: '', productionDate: '', expiryDate: '', remarks: ''
})

const addMaterialRow = () => {
  addForm.materials.push(createEmptyMaterial())
}

const removeMaterialRow = (index) => {
  addForm.materials.splice(index, 1)
}

const addEditMaterialRow = () => {
  editForm.materials.push(createEmptyMaterial())
}

const removeEditMaterialRow = (index) => {
  editForm.materials.splice(index, 1)
}

// 弹窗内编码生成
const openAddMaterialCodeGen = (index) => {
  modalCodeGenIndex.value = index
  modalCodeGen.bigCategory = ''
  modalCodeGen.midCategory = ''
  modalCodeGen.subCategory = ''
  showModalCodeGen.value = true
}

const handleModalCodeGenBigChange = () => {
  modalCodeGen.midCategory = ''
  modalCodeGen.subCategory = ''
}

const handleModalCodeGenMidChange = () => {
  modalCodeGen.subCategory = ''
}

const generateModalCode = () => {
  if (!modalCodeGen.bigCategory || !modalCodeGen.midCategory || !modalCodeGen.subCategory) return
  const baseCode = `${modalCodeGen.bigCategory}${modalCodeGen.midCategory}${modalCodeGen.subCategory}`
  const seq = Math.floor(Math.random() * 999) + 1
  const code = `${baseCode}${String(seq).padStart(3, '0')}`
  if (modalCodeGenIndex.value >= 0 && modalCodeGenIndex.value < addForm.materials.length) {
    addForm.materials[modalCodeGenIndex.value].code = code
  }
  showModalCodeGen.value = false
}

const handleSaveNewInbound = async () => {
  if (!addForm.code) {
    ElMessage.warning('请先生成入库单号')
    return
  }
  try {
    await inboundStore.addInbound({
      code: addForm.code,
      inboundDate: addForm.inboundDate,
      supplier: addForm.supplier,
      operator: addForm.operator,
      status: 'pending',
      materials: addForm.materials.map(m => {
        const { id, ...rest } = m
        return rest
      })
    })
    ElMessage.success('新增入库成功')
    showAddModal.value = false
    resetAddForm()
    await inboundStore.loadInboundRecords()
  } catch (err) {
    ElMessage.error('新增入库失败: ' + (err.message || '未知错误'))
  }
}

// ==================== 编辑保存 ====================

const handleApplyVoid = () => {
  ElMessage.info('作废申请已提交')
}

const handleSaveEdit = async () => {
  try {
    await inboundStore.editInbound(editForm.id, {
      code: editForm.code,
      inboundDate: editForm.inboundDate,
      supplier: editForm.supplier,
      operator: editForm.operator,
      status: editForm.status,
      materials: editForm.materials.map(m => {
        const { id, ...rest } = m
        return rest
      })
    })
    ElMessage.success('编辑保存成功')
    showEditModal.value = false
    await inboundStore.loadInboundRecords()
  } catch (err) {
    ElMessage.error('编辑保存失败: ' + (err.message || '未知错误'))
  }
}

// ==================== 确认编辑（批量） ====================

const handleConfirmEdit = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要编辑的记录')
    return
  }
  batchEditRecords.value = selectedRecords.value
  batchEditFields.inboundDate = ''
  batchEditFields.supplier = ''
  batchEditFields.operator = ''
  batchEditFields.status = ''
  showBatchEditModal.value = true
}

const handleBatchSave = async () => {
  const updates = {}
  if (batchEditFields.inboundDate) updates.inboundDate = batchEditFields.inboundDate
  if (batchEditFields.supplier) updates.supplier = batchEditFields.supplier
  if (batchEditFields.operator) updates.operator = batchEditFields.operator
  if (batchEditFields.status) updates.status = batchEditFields.status

  if (Object.keys(updates).length === 0) {
    ElMessage.warning('请至少填写一项要修改的字段')
    return
  }

  try {
    for (const record of batchEditRecords.value) {
      const updated = { ...record, ...updates }
      await inboundStore.editInbound(record.id, {
        code: updated.code,
        inboundDate: updated.inboundDate,
        supplier: updated.supplier,
        operator: updated.operator,
        status: updated.status,
        materials: (updated.materials || []).map(m => {
          const { id, ...rest } = m
          return rest
        })
      })
    }
    ElMessage.success(`批量编辑成功，已更新 ${batchEditRecords.value.length} 条记录`)
    showBatchEditModal.value = false
    cancelSelection()
    await inboundStore.loadInboundRecords()
  } catch (err) {
    ElMessage.error('批量编辑失败: ' + (err.message || '未知错误'))
  }
}

// ==================== 删除 ====================

// 点击"确认删除"按钮 → 设置待删记录并打开确认弹窗
const handleConfirmDelete = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的记录')
    return
  }
  deleteRecords.value = selectedRecords.value
  showDeleteModal.value = true
}

// 在删除确认弹窗中点击"确认删除" → 执行实际删除
const handleConfirmDeleteExecute = async () => {
  if (deleteRecords.value.length === 0) return
  try {
    const ids = deleteRecords.value.map(r => r.id)
    await inboundStore.removeMaterials(ids)
    ElMessage.success(`已删除 ${deleteRecords.value.length} 条记录`)
    showDeleteModal.value = false
    cancelSelection()
    await inboundStore.loadInboundRecords()
  } catch (err) {
    ElMessage.error('删除失败: ' + (err.message || '未知错误'))
  }
}

// ==================== 导出 ====================

// 点击"确认导出"按钮 → 设置导出记录并打开导出格式选择弹窗
const handleConfirmExport = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要导出的记录')
    return
  }
  exportRecords.value = selectedRecords.value
  showExportModal.value = true
}

// 在导出弹窗中点击"导出" → 执行实际导出
const handleDoExport = () => {
  const dataToExport = exportRecords.value

  if (dataToExport.length === 0) {
    ElMessage.warning('没有可导出的数据')
    return
  }

  // 展平导出：每条物料一行（与V1.1一致：入库单信息仅首行显示）
  const headers = ['入库单号', '入库日期', '供应商', '操作员', '状态', '序号', '物料编码', '物料名称', '分类', '规格', '条形码', '单位', '数量', '单价', '批次号', '生产日期', '有效期至', '存放位置', '备注']
  const rows = []
  dataToExport.forEach(r => {
    const materials = r.materials || []
    const materialCount = materials.length
    if (materials.length === 0) {
      rows.push({
        '入库单号': r.code, '入库日期': r.inboundDate || '', '供应商': r.supplier || '',
        '操作员': r.operator || '', '状态': getStatusText(r.status), '序号': '',
        '物料编码': '', '物料名称': '', '分类': '', '规格': '', '条形码': '', '单位': '', '数量': '', '单价': '',
        '批次号': '', '生产日期': '', '有效期至': '', '存放位置': '', '备注': ''
      })
    } else {
      materials.forEach((m, index) => {
        rows.push({
          '入库单号': index === 0 ? r.code : '', '入库日期': index === 0 ? (r.inboundDate || '') : '',
          '供应商': index === 0 ? (r.supplier || '') : '', '操作员': index === 0 ? (r.operator || '') : '',
          '状态': index === 0 ? getStatusText(r.status) : '', '序号': `${index + 1}/${materialCount}`,
          '物料编码': m.code || '', '物料名称': m.name || '', '分类': m.category || '',
          '规格': m.specification || '', '条形码': m.barcode || '', '单位': m.unit || '', '数量': m.quantity ?? '',
          '单价': m.price || '', '批次号': m.batchNo || '', '生产日期': m.productionDate || '',
          '有效期至': m.expiryDate || '', '存放位置': m.location || '', '备注': m.remarks || ''
        })
      })
    }
  })

  let content = ''
  let mimeType = ''
  let extension = ''

  if (exportFormat.value === 'csv') {
    const csvContent = [
      headers.join(','),
      ...rows.map(row => headers.map(h => `"${(row[h] !== undefined ? row[h] : '')}"`).join(','))
    ].join('\n')
    content = '﻿' + csvContent
    mimeType = 'text/csv;charset=utf-8'
    extension = 'csv'
  } else if (exportFormat.value === 'excel') {
    content = `<html><head><meta charset="utf-8"></head><body><table border="1"><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>${rows.map(row => `<tr>${headers.map(h => `<td>${(row[h] !== undefined ? row[h] : '')}</td>`).join('')}</tr>`).join('')}</table></body></html>`
    mimeType = 'application/vnd.ms-excel;charset=utf-8'
    extension = 'xls'
  } else if (exportFormat.value === 'word') {
    content = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>物料入库记录</title></head><body><table border="1" cellpadding="5" cellspacing="0" style="border-collapse:collapse"><tr style="background-color:#f0f0f0">${headers.map(h => `<th>${h}</th>`).join('')}</tr>${rows.map(row => `<tr>${headers.map(h => `<td>${(row[h] !== undefined ? row[h] : '')}</td>`).join('')}</tr>`).join('')}</table></body></html>`
    mimeType = 'application/ms-word;charset=utf-8'
    extension = 'doc'
  }

  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `物料入库记录_${new Date().toISOString().slice(0, 10)}.${extension}`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  showExportModal.value = false
  exitExportMode()
  ElMessage.success('导出成功')
}

// ==================== 初始化 ====================

onMounted(async () => {
  await inboundStore.loadInboundRecords()
})
</script>

