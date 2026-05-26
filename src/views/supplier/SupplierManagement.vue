<template>
  <div class="space-y-6">
    <!-- 页头 - 与V1.1 PageHeader.tsx一致：Truck图标，无副标题 -->
    <div class="bg-white rounded-xl p-6 shadow-none">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
            <el-icon :size="24" color="white"><Van /></el-icon>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">供应商管理</h1>
          </div>
        </div>
      </div>
    </div>

    <!-- 编码规则按钮 + 编码生成器 -->
    <div class="flex items-center gap-4">
      <div class="h-6 w-px bg-gray-500"></div>
      <el-button size="small" @click="handleShowCodeRule">编码规则 &gt;&gt;</el-button>
      <span class="text-base font-bold text-blue-600">供应商编码生成</span>
      <el-button link @click="codeGenExpanded = !codeGenExpanded" :title="codeGenExpanded ? '收起' : '展开'">
        <el-icon><ArrowDown v-if="!codeGenExpanded" /><ArrowUp v-if="codeGenExpanded" /></el-icon>
      </el-button>
    </div>

    <!-- 编码生成器（可折叠） - 与V1.1 SupplierCodeGenerator一致 -->
    <div v-if="codeGenExpanded" class="bg-white rounded-xl p-6 shadow-sm">
      <div class="flex items-center gap-2 mb-4">
        <h3 class="text-lg font-semibold text-gray-900">编码生成</h3>
        <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
          供应商编码规则：SU_ + 大类(2位) + 中类(2位) + 流水号(3位)
        </span>
      </div>

      <div class="grid grid-cols-4 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">供应商大类</label>
          <el-select v-model="codeGen.bigCategory" placeholder="请选择大类" class="w-full" @change="handleCodeGenBigChange">
            <el-option v-for="cat in categoryOptions" :key="cat.code" :label="`${cat.code} - ${cat.name}`" :value="cat.code" />
          </el-select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">供应商中类</label>
          <el-select v-model="codeGen.midCategory" placeholder="请选择中类" class="w-full" :disabled="!codeGen.bigCategory" @change="handleCodeGenMidChange">
            <el-option v-for="cat in codeGenMidCats" :key="cat.code" :label="`${cat.code} - ${cat.name}`" :value="cat.code" />
          </el-select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">生成编码</label>
          <el-input v-model="codeGen.generatedCode" placeholder="点击生成" readonly />
        </div>
        <div class="flex items-end">
          <el-button type="primary" :disabled="!codeGen.bigCategory || !codeGen.midCategory" @click="handleGenerateCode" class="w-full">生成编码</el-button>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <el-button type="primary" :disabled="!codeGen.generatedCode" @click="handleCopyCode">
          <el-icon><CopyDocument /></el-icon>{{ copySuccess ? '已复制!' : '复制编码' }}
        </el-button>
        <el-button @click="handleResetCodeGen">重置</el-button>
        <span class="text-xs text-gray-400">生成的编码可复制后用于新增供应商</span>
      </div>

      <div v-if="codeGenError" class="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">{{ codeGenError }}</div>
      <div v-if="codeGenSuccess && !codeGenError" class="mt-3 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-600">{{ codeGenSuccess }}</div>
    </div>

    <!-- 筛选 - 与V1.1 SupplierFilters一致 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-end gap-4">
        <div class="flex-1 grid grid-cols-5 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">供应商名称</label>
            <el-input v-model="filters.name" placeholder="输入名称搜索" clearable @clear="handleFilterChange('name', '')" @keyup.enter="currentPage = 1" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">所属组织</label>
            <el-select v-model="filters.organization" placeholder="全部" class="w-full" @change="handleFilterChange('organization', filters.organization)">
              <el-option label="全部" value="全部" />
              <el-option label="宁波帮帮忙公司" value="宁波帮帮忙公司" />
              <el-option label="成都帮帮您公司" value="成都帮帮您公司" />
            </el-select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">供应商类型</label>
            <el-select v-model="filters.type" placeholder="全部" class="w-full" @change="handleFilterChange('type', filters.type)">
              <el-option label="全部类型" value="全部" />
              <el-option v-for="cat in categoryOptions" :key="cat.code" :label="cat.name" :value="cat.code" />
            </el-select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">供应商属性</label>
            <el-select v-model="filters.supplierAttribute" placeholder="全部" class="w-full" @change="handleFilterChange('supplierAttribute', filters.supplierAttribute)">
              <el-option v-for="opt in supplierAttributeFilterOptions" :key="opt" :value="opt">{{ opt }}</el-option>
            </el-select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">供应商状态</label>
            <el-select v-model="filters.status" placeholder="全部" class="w-full" @change="handleFilterChange('status', filters.status)">
              <el-option label="全部" value="全部" />
              <el-option label="合作中" value="合作中" />
              <el-option label="暂停" value="暂停" />
              <el-option label="终止" value="终止" />
            </el-select>
          </div>
        </div>
        <div class="flex items-end gap-2">
          <el-button size="small" @click="showMore = !showMore">
            {{ showMore ? '收起' : '更多' }}
            <el-icon><component :is="showMore ? ArrowUp : ArrowDown" /></el-icon>
          </el-button>
          <el-button size="small" @click="handleResetFilters">重置</el-button>
        </div>
      </div>

      <!-- 更多筛选 -->
      <div v-if="showMore" class="mt-3 grid grid-cols-5 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">联系人</label>
          <el-input v-model="filters.contact" placeholder="输入联系人搜索" clearable @clear="handleFilterChange('contact', '')" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">省份</label>
          <el-input v-model="filters.province" placeholder="省份" clearable @clear="handleFilterChange('province', '')" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">城市</label>
          <el-input v-model="filters.city" placeholder="城市" clearable @clear="handleFilterChange('city', '')" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">区县</label>
          <el-input v-model="filters.district" placeholder="区县" clearable @clear="handleFilterChange('district', '')" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">供应商编号</label>
          <el-input v-model="filters.code" placeholder="输入编号搜索" clearable @clear="handleFilterChange('code', '')" />
        </div>
      </div>
    </div>

    <!-- 表格区域 - 与V1.1 SupplierTable一致 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="p-4 border-b border-gray-100 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <h3 class="text-lg font-semibold text-gray-900">供应商列表</h3>
          <template v-if="hasActiveMode">
            <el-button link size="small" @click="handleSelectAll">{{ isAllSelected ? '全不选' : '全选' }}</el-button>
            <span class="text-sm text-gray-500">已选择 {{ selectedRows.length }} 项</span>
          </template>
        </div>

        <div class="flex items-center gap-2">
          <template v-if="!hasActiveMode">
            <el-button size="small" type="primary" @click="handleAdd"><el-icon><Plus /></el-icon>新增</el-button>
            <el-button size="small" type="warning" @click="enterBatchEditMode"><el-icon><Edit /></el-icon>编辑</el-button>
            <el-button size="small" type="danger" @click="enterDeleteMode"><el-icon><Delete /></el-icon>删除</el-button>
            <el-button size="small" @click="enterExportMode"><el-icon><Download /></el-icon>导出</el-button>
          </template>
          <template v-else>
            <template v-if="batchEditMode">
              <el-button size="small" type="warning" @click="handleConfirmBatchEdit">确认编辑{{ selectedRows.length > 0 ? ` (${selectedRows.length})` : '' }}</el-button>
              <el-button size="small" @click="cancelBatchEdit">取消</el-button>
            </template>
            <template v-if="deleteMode">
              <el-button size="small" type="danger" @click="handleConfirmDelete">确认删除{{ selectedRows.length > 0 ? ` (${selectedRows.length})` : '' }}</el-button>
              <el-button size="small" @click="cancelDelete">取消</el-button>
            </template>
            <template v-if="exportMode">
              <el-button size="small" type="primary" @click="handleConfirmExport"><el-icon><Download /></el-icon>确认导出{{ selectedRows.length > 0 ? ` (${selectedRows.length})` : '' }}</el-button>
              <el-button size="small" @click="cancelExport">取消选择</el-button>
            </template>
          </template>
        </div>
      </div>

      <!-- 表格 - V1.1列顺序：编号→名称→类型→属性→联系人→移动电话→组织→状态→地区→创建时间→操作 -->
      <el-table :data="paginatedSuppliers" stripe @selection-change="handleSelectionChange" ref="tableRef" class="supplier-table">
        <el-table-column v-if="hasActiveMode" type="selection" width="50" />
        <el-table-column prop="code" label="供应商编号" width="150">
          <template #default="{ row }">
            <span class="text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer underline" @click="handleView(row)">{{ row.code }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="供应商名称" min-width="180" />
        <el-table-column label="供应类型" width="160">
          <template #default="{ row }">{{ getSupplierTypeName(row.supplierType) }}</template>
        </el-table-column>
        <el-table-column prop="supplierAttribute" label="供应商属性" width="100" />
        <el-table-column prop="contact" label="联系人" width="90" />
        <el-table-column prop="mobilePhone" label="移动电话" width="130" />
        <el-table-column prop="organization" label="所属组织" width="150" />
        <el-table-column label="状态" width="90" align="center">
          <template #default="{ row }">
            <span class="inline-flex px-2 py-1 rounded-full text-xs font-medium" :class="{
              'bg-green-100 text-green-700': row.status === '合作中',
              'bg-yellow-100 text-yellow-700': row.status === '暂停',
              'bg-red-100 text-red-700': row.status === '终止'
            }">{{ row.status }}</span>
          </template>
        </el-table-column>
        <el-table-column label="所在地区" width="150">
          <template #default="{ row }">{{ row.province }} {{ row.city }}</template>
        </el-table-column>
        <el-table-column prop="createDate" label="创建时间" width="120" />
        <el-table-column label="操作" width="150" fixed="right" v-if="!hasActiveMode">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleView(row)">查看</el-button>
            <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" size="small" @click="handleDeleteSingle(row)">删除</el-button>
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
        <div class="flex items-center gap-3">
          <span class="text-sm text-gray-500">共 {{ paginationTotal }} 条，第 {{ currentPage }} / {{ totalPages }} 页</span>
          <el-pagination v-model:current-page="currentPage" :page-size="pageSize" :total="paginationTotal" layout="prev, pager, next" small />
        </div>
      </div>
    </div>

    <!-- ========== 弹窗 ========== -->

    <!-- 查看详情弹窗 - 与V1.1 SupplierDetailModal一致 -->
    <el-dialog v-model="showDetailModal" title="供应商详情" width="700px" :close-on-click-modal="false">
      <template v-if="detailSupplier">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="供应商编号">{{ detailSupplier.code }}</el-descriptions-item>
          <el-descriptions-item label="供应商名称" :span="2">{{ detailSupplier.name }}</el-descriptions-item>
          <el-descriptions-item label="供应类型">{{ getSupplierTypeName(detailSupplier.supplierType) }}</el-descriptions-item>
          <el-descriptions-item label="供应商属性">{{ detailSupplier.supplierAttribute }}</el-descriptions-item>
          <el-descriptions-item label="所属组织">{{ detailSupplier.organization }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="detailSupplier.status === '合作中' ? 'success' : detailSupplier.status === '暂停' ? 'warning' : 'danger'" size="small">{{ detailSupplier.status }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="联系人">{{ detailSupplier.contact }}</el-descriptions-item>
          <el-descriptions-item label="移动电话">{{ detailSupplier.mobilePhone }}</el-descriptions-item>
          <el-descriptions-item label="工作电话">{{ detailSupplier.workPhone || '-' }}</el-descriptions-item>
          <el-descriptions-item label="传真号码">{{ detailSupplier.fax || '-' }}</el-descriptions-item>
          <el-descriptions-item label="国家">{{ detailSupplier.country }}</el-descriptions-item>
          <el-descriptions-item label="省份">{{ detailSupplier.province }}</el-descriptions-item>
          <el-descriptions-item label="城市">{{ detailSupplier.city }}</el-descriptions-item>
          <el-descriptions-item label="详细地址" :span="2">{{ detailSupplier.address }}</el-descriptions-item>
          <el-descriptions-item label="开户行">{{ detailSupplier.bankName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="银行卡号" :span="2">{{ detailSupplier.bankCardNumber || '-' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ detailSupplier.createDate }}</el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ detailSupplier.remarks || '-' }}</el-descriptions-item>
        </el-descriptions>
      </template>
      <template #footer>
        <el-button @click="showDetailModal = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 新增/编辑弹窗 - 与V1.1 SupplierAddModal/SupplierEditModal一致 -->
    <el-dialog v-model="showFormModal" :title="isEdit ? '编辑供应商' : '新增供应商'" width="800px" :close-on-click-modal="false" @closed="resetForm">
      <el-form :model="form" label-width="120px" ref="formRef">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="供应商编号">
              <div class="flex gap-2 w-full">
                <el-input v-model="form.code" placeholder="请输入或从编码生成器复制" :disabled="isEdit" />
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属组织">
              <el-select v-model="form.organization" placeholder="请选择" class="w-full">
                <el-option label="宁波帮帮忙公司" value="宁波帮帮忙公司" />
                <el-option label="成都帮帮您公司" value="成都帮帮您公司" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="供应商名称">
          <el-input v-model="form.name" placeholder="请输入供应商名称" />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="供应类型">
              <el-select v-model="form.supplierType" placeholder="请选择" class="w-full">
                <el-option v-for="cat in categoryOptions" :key="cat.code" :label="`${cat.code} - ${cat.name}`" :value="cat.code" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="供应商属性">
              <el-select v-model="form.supplierAttribute" placeholder="请选择" class="w-full">
                <el-option v-for="opt in supplierAttributeOptions" :key="opt.code" :label="opt.name" :value="opt.name" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="联系人">
              <el-input v-model="form.contact" placeholder="请输入联系人" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="移动电话">
              <el-input v-model="form.mobilePhone" placeholder="请输入移动电话" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="工作电话">
              <el-input v-model="form.workPhone" placeholder="请输入工作电话" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="传真号码">
              <el-input v-model="form.fax" placeholder="请输入传真号码" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="国家">
              <el-input v-model="form.country" placeholder="国家" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="省份">
              <el-input v-model="form.province" placeholder="省份" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="城市">
              <el-input v-model="form.city" placeholder="城市" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="详细地址">
          <el-input v-model="form.address" placeholder="请输入详细地址" />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="状态">
              <el-radio-group v-model="form.status">
                <el-radio label="合作中">合作中</el-radio>
                <el-radio label="暂停">暂停</el-radio>
                <el-radio label="终止">终止</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="开户行">
              <el-input v-model="form.bankName" placeholder="请输入开户行" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="银行卡号">
          <el-input v-model="form.bankCardNumber" placeholder="请输入银行卡号" />
        </el-form-item>

        <el-form-item label="创建时间">
          <el-input v-model="form.createDate" placeholder="YYYY-MM-DD" />
        </el-form-item>

        <el-form-item label="备注">
          <el-input v-model="form.remarks" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showFormModal = false">取消</el-button>
        <el-button type="primary" @click="handleSave">{{ isEdit ? '保存' : '提交' }}</el-button>
      </template>
    </el-dialog>

    <!-- 批量编辑弹窗 - 与V1.1 SupplierBatchEditModal完全一致：逐条编辑+累积保存 -->
    <el-dialog v-model="showBatchEditModal" width="1000px" :close-on-click-modal="false" @closed="handleBatchEditModalClose">
      <template #header>
        <div class="bg-emerald-600 -mx-5 -mt-5 px-5 py-4 rounded-t-xl flex items-center justify-between">
          <h3 class="text-lg font-semibold text-white">批量编辑供应商</h3>
          <el-button link @click="showBatchEditModal = false">
            <el-icon :size="20" color="white"><Close /></el-icon>
          </el-button>
        </div>
      </template>

      <!-- 提示信息栏 -->
      <div class="px-4 py-3 bg-blue-50 border-b border-blue-100 -mx-5">
        <p class="text-sm text-blue-800">
          已选择 <strong>{{ batchEditSuppliers.length }}</strong> 个供应商进行批量编辑，已编辑 <strong>{{ batchEditedCount }}</strong> 个
        </p>
      </div>

      <!-- 供应商选择下拉 + 导航 -->
      <div class="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
        <label class="text-sm font-medium text-gray-700 whitespace-nowrap">当前编辑：</label>
        <el-select
          :model-value="currentBatchSupplierId ? String(currentBatchSupplierId) : ''"
          @change="handleBatchSupplierSelect"
          class="flex-1"
          placeholder="请选择供应商"
        >
          <el-option
            v-for="s in batchEditSuppliers"
            :key="s.id"
            :value="String(s.id)"
            :label="`${s.code} — ${s.name}${batchEditedSuppliers[s.id] ? ' ✅' : ''}`"
          />
        </el-select>
        <div class="flex items-center gap-1">
          <el-button link :disabled="currentBatchEditIndex === 0" @click="handleBatchPrev">
            <el-icon><ArrowLeft /></el-icon>
          </el-button>
          <span class="text-sm text-gray-500 whitespace-nowrap">{{ currentBatchEditIndex + 1 }} / {{ batchEditSuppliers.length }}</span>
          <el-button link :disabled="currentBatchEditIndex >= batchEditSuppliers.length - 1" @click="handleBatchNext">
            <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
      </div>

      <!-- 只读标识信息 -->
      <div class="px-4 py-3 bg-gray-50 border-b border-gray-100">
        <div class="grid grid-cols-4 gap-3">
          <div>
            <label class="block text-xs text-gray-500 mb-1">供应商编号</label>
            <div class="text-sm font-medium text-gray-900">{{ currentBatchSupplier?.code || '-' }}</div>
          </div>
          <div>
            <label class="block text-xs text-gray-500 mb-1">供应商名称</label>
            <div class="text-sm font-medium text-gray-900">{{ currentBatchSupplier?.name || '-' }}</div>
          </div>
          <div>
            <label class="block text-xs text-gray-500 mb-1">创建时间</label>
            <div class="text-sm text-gray-600">{{ currentBatchSupplier?.createDate || '-' }}</div>
          </div>
          <div>
            <label class="block text-xs text-gray-500 mb-1">原始状态</label>
            <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium" :class="{
              'bg-green-100 text-green-700': currentBatchSupplier?.status === '合作中',
              'bg-yellow-100 text-yellow-700': currentBatchSupplier?.status === '暂停',
              'bg-red-100 text-red-700': currentBatchSupplier?.status === '终止'
            }">
              {{ currentBatchSupplier?.status || '-' }}
            </span>
          </div>
        </div>
      </div>

      <!-- 可编辑字段 -->
      <div class="flex-1 overflow-y-auto p-4 max-h-[50vh]">
        <!-- 基本信息 -->
        <h4 class="text-sm font-semibold text-emerald-700 mb-3 pb-1 border-b border-emerald-200">基本信息</h4>
        <div class="grid grid-cols-4 gap-3 mb-4">
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">供应类型</label>
            <el-select :model-value="getBatchValue('supplierType')" @change="(v) => handleBatchFieldChange('supplierType', v)" class="w-full" size="small">
              <el-option value="" label="不修改" />
              <el-option v-for="cat in categoryOptions" :key="cat.code" :label="cat.name" :value="cat.code" />
            </el-select>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">供应商属性</label>
            <el-select :model-value="getBatchValue('supplierAttribute')" @change="(v) => handleBatchFieldChange('supplierAttribute', v)" class="w-full" size="small">
              <el-option value="" label="不修改" />
              <el-option v-for="opt in supplierAttributeOptions" :key="opt.code" :label="opt.name" :value="opt.name" />
            </el-select>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">所属组织</label>
            <el-select :model-value="getBatchValue('organization')" @change="(v) => handleBatchFieldChange('organization', v)" class="w-full" size="small">
              <el-option value="" label="不修改" />
              <el-option label="宁波帮帮忙公司" value="宁波帮帮忙公司" />
              <el-option label="成都帮帮您公司" value="成都帮帮您公司" />
            </el-select>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">状态</label>
            <el-select :model-value="getBatchValue('status')" @change="(v) => handleBatchFieldChange('status', v)" class="w-full" size="small">
              <el-option value="" label="不修改" />
              <el-option label="合作中" value="合作中" />
              <el-option label="暂停" value="暂停" />
              <el-option label="终止" value="终止" />
            </el-select>
          </div>
        </div>

        <!-- 联系信息 -->
        <h4 class="text-sm font-semibold text-gray-700 mb-3 pb-1 border-b border-gray-400">联系信息</h4>
        <div class="grid grid-cols-4 gap-3 mb-4">
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">联系人</label>
            <el-input :model-value="getBatchValue('contact')" @input="(v) => handleBatchFieldChange('contact', v)" size="small" :placeholder="currentBatchSupplier?.contact || '未填写'" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">移动电话</label>
            <el-input :model-value="getBatchValue('mobilePhone')" @input="(v) => handleBatchFieldChange('mobilePhone', v)" size="small" :placeholder="currentBatchSupplier?.mobilePhone || '未填写'" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">工作电话</label>
            <el-input :model-value="getBatchValue('workPhone')" @input="(v) => handleBatchFieldChange('workPhone', v)" size="small" :placeholder="currentBatchSupplier?.workPhone || '未填写'" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">传真</label>
            <el-input :model-value="getBatchValue('fax')" @input="(v) => handleBatchFieldChange('fax', v)" size="small" :placeholder="currentBatchSupplier?.fax || '未填写'" />
          </div>
        </div>

        <!-- 地区信息 -->
        <h4 class="text-sm font-semibold text-gray-700 mb-3 pb-1 border-b border-gray-400">地区信息</h4>
        <div class="grid grid-cols-3 gap-3 mb-4">
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">国家</label>
            <el-input :model-value="getBatchValue('country')" @input="(v) => handleBatchFieldChange('country', v)" size="small" :placeholder="currentBatchSupplier?.country || '未填写'" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">省份</label>
            <el-input :model-value="getBatchValue('province')" @input="(v) => handleBatchFieldChange('province', v)" size="small" :placeholder="currentBatchSupplier?.province || '未填写'" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">城市</label>
            <el-input :model-value="getBatchValue('city')" @input="(v) => handleBatchFieldChange('city', v)" size="small" :placeholder="currentBatchSupplier?.city || '未填写'" />
          </div>
        </div>
        <div class="mb-4">
          <label class="block text-xs font-medium text-gray-700 mb-1">详细地址</label>
          <el-input :model-value="getBatchValue('address')" @input="(v) => handleBatchFieldChange('address', v)" size="small" :placeholder="currentBatchSupplier?.address || '未填写'" />
        </div>

        <!-- 财务信息 -->
        <h4 class="text-sm font-semibold text-gray-700 mb-3 pb-1 border-b border-gray-400">财务信息</h4>
        <div class="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">开户行</label>
            <el-input :model-value="getBatchValue('bankName')" @input="(v) => handleBatchFieldChange('bankName', v)" size="small" :placeholder="currentBatchSupplier?.bankName || '未填写'" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">银行卡号</label>
            <el-input :model-value="getBatchValue('bankCardNumber')" @input="(v) => handleBatchFieldChange('bankCardNumber', v)" size="small" :placeholder="currentBatchSupplier?.bankCardNumber || '未填写'" class="font-mono" />
          </div>
        </div>

        <!-- 备注 -->
        <h4 class="text-sm font-semibold text-gray-700 mb-3 pb-1 border-b border-gray-400">备注</h4>
        <div>
          <el-input :model-value="getBatchValue('remarks')" @input="(v) => handleBatchFieldChange('remarks', v)" type="textarea" :rows="2" :placeholder="currentBatchSupplier?.remarks || '未填写'" />
        </div>
      </div>

      <!-- 底部操作按钮 -->
      <template #footer>
        <div class="flex justify-between gap-3 w-full">
          <el-button @click="showBatchEditModal = false">取消</el-button>
          <div class="flex items-center gap-3">
            <el-button @click="handleBatchNext" :disabled="!currentBatchSupplierId">
              确认 {{ currentBatchEditIndex + 1 < batchEditSuppliers.length ? '(下一个)' : '(已最后一个)' }}
            </el-button>
            <el-button type="primary" @click="handleSaveAllBatch">
              保存全部 ({{ batchEditedCount }} 个)
            </el-button>
          </div>
        </div>
      </template>
    </el-dialog>

    <!-- 导出格式选择弹窗 - 与V1.1 SupplierExportModal一致 -->
    <el-dialog v-model="showExportModal" title="选择导出格式" width="500px" :close-on-click-modal="false">
      <p class="text-sm text-gray-500 mb-4">{{ exportRecords.length > 0 ? `已选择 ${exportRecords.length} 条数据` : `共 ${filteredSuppliers.length} 条数据` }}</p>
      <div class="space-y-3">
        <el-radio-group v-model="exportFormat">
          <div v-for="fmt in exportFormats" :key="fmt.value" :class="['flex items-center p-4 border rounded-lg cursor-pointer transition-all mb-2', exportFormat === fmt.value ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300']" @click="exportFormat = fmt.value">
            <el-radio :value="fmt.value">
              <span class="ml-2 block text-sm font-medium text-gray-900">{{ fmt.label }}</span>
              <span class="ml-2 block text-xs text-gray-500">{{ fmt.desc }}</span>
            </el-radio>
          </div>
        </el-radio-group>
      </div>
      <template #footer>
        <el-button @click="showExportModal = false; exitExportMode()">取消</el-button>
        <el-button type="primary" @click="handleDoExport">确认导出</el-button>
      </template>
    </el-dialog>

    <!-- 单行删除警告弹窗 - 与V1.1 DeleteWarningDialog一致 -->
    <el-dialog v-model="showDeleteWarning" width="420px" :close-on-click-modal="false">
      <template #header>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <el-icon :size="24" color="#dc2626"><WarningFilled /></el-icon>
          </div>
          <h3 class="text-lg font-semibold text-gray-900">确认删除</h3>
        </div>
      </template>
      <div class="text-sm text-gray-600">
        <p>确定要删除供应商 <span class="font-bold text-red-600">"{{ singleDeleteTarget?.name }}"</span> 吗？</p>
        <p class="mt-2 text-red-500 font-medium">此操作不可撤销！</p>
      </div>
      <template #footer>
        <el-button @click="showDeleteWarning = false">取消</el-button>
        <el-button type="danger" @click="handleConfirmSingleDelete">确认删除</el-button>
      </template>
    </el-dialog>

    <!-- 删除确认弹窗 - 与V1.1 BatchDeleteConfirmDialog一致（含供应商名称+风险警告） -->
    <el-dialog v-model="showDeleteModal" width="460px" :close-on-click-modal="false">
      <template #header>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <el-icon :size="24" color="#dc2626"><WarningFilled /></el-icon>
          </div>
          <h3 class="text-lg font-semibold text-gray-900">批量删除确认</h3>
        </div>
      </template>

      <div class="text-sm text-gray-600 space-y-3">
        <p>确定要删除选中的 <span class="font-bold text-red-600">{{ deleteSupplierIds.length }}</span> 个供应商吗？</p>
        <div class="p-3 bg-gray-50 rounded-lg text-xs">
          <p class="font-medium text-gray-700 mb-1">选中供应商：</p>
          <p class="text-gray-600">{{ deleteSupplierNames }}</p>
        </div>

        <!-- 数据完整性警告 -->
        <div class="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-sm font-medium text-red-700 mb-2">数据完整性风险提示：</p>
          <ul class="list-disc list-inside space-y-1 text-xs text-red-600">
            <li>删除后将无法恢复供应商基础信息</li>
            <li>关联的采购计划可能缺少供应商来源</li>
            <li>物料的供应商追溯链可能出现断链</li>
            <li>入库记录的供应商字段将失去关联</li>
            <li>财务对账记录中的供应商信息可能受影响</li>
          </ul>
        </div>

        <p class="text-red-500 font-medium">此操作不可撤销！请谨慎操作。</p>
      </div>

      <template #footer>
        <el-button @click="showDeleteModal = false">取消</el-button>
        <el-button type="danger" @click="handleDoDelete">已知晓风险，确认删除</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Van, Plus, Edit, Delete, Download, CopyDocument, WarningFilled, ArrowDown, ArrowUp, ArrowLeft, ArrowRight, Close } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useSupplierStore } from '@/stores/modules/inventory/useSupplierStore'
import { useDictionaryStore } from '@/stores/modules/dictionary'
import { useSupplierCodeRuleStore } from '@/stores/modules/supplierCodeRule'
import { validateMobilePhone, validateWorkPhone, validateFax, validateBankCard, validateCode, runValidations } from '@/utils/validators'

// ==================== 常量（与V1.1 data.ts完全一致） ====================

// 11大类供应商分类（V1.1 data.ts）
const supplierCategories = [
  { code: 'SP', name: '种子与种苗类', midCategories: [
    { code: '01', name: '粮食作物种子' }, { code: '02', name: '经济作物种子' }, { code: '03', name: '蔬菜种子/种苗' },
    { code: '04', name: '水果苗木' }, { code: '05', name: '花卉与观赏植物' }, { code: '06', name: '食用菌/药用菌菌种' }, { code: '99', name: '其他种质资源' }
  ]},
  { code: 'FE', name: '肥料与土壤改良类', midCategories: [
    { code: '01', name: '有机肥' }, { code: '02', name: '化学肥料' }, { code: '03', name: '微生物菌剂/生物刺激素' },
    { code: '04', name: '土壤调理剂' }, { code: '05', name: '育苗基质' }, { code: '99', name: '其他肥料类' }
  ]},
  { code: 'PP', name: '农药与植保产品类', midCategories: [
    { code: '01', name: '杀虫剂' }, { code: '02', name: '杀菌剂' }, { code: '03', name: '除草剂' },
    { code: '04', name: '植物生长调节剂' }, { code: '05', name: '绿色防控产品' }, { code: '06', name: '生物农药' }, { code: '99', name: '其他植保产品' }
  ]},
  { code: 'EQ', name: '农业机械与设备类', midCategories: [
    { code: '01', name: '耕作与动力机械' }, { code: '02', name: '播种/移栽设备' }, { code: '03', name: '植保机械' },
    { code: '04', name: '收获与采收机械' }, { code: '05', name: '初加工与分选设备' }, { code: '99', name: '其他农机设备' }
  ]},
  { code: 'FA', name: '设施农业资材类', midCategories: [
    { code: '01', name: '温室/大棚骨架材料' }, { code: '02', name: '覆盖材料' }, { code: '03', name: '通风降温设备' },
    { code: '04', name: '加温设备' }, { code: '05', name: '补光系统' }, { code: '06', name: '智能环控系统' }, { code: '99', name: '其他设施农业资材' }
  ]},
  { code: 'IR', name: '灌溉与水肥一体化类', midCategories: [
    { code: '01', name: '水泵与水源设备' }, { code: '02', name: '输水管网' }, { code: '03', name: '过滤系统' },
    { code: '04', name: '施肥装置' }, { code: '05', name: '灌溉终端' }, { code: '99', name: '其他灌溉设备' }
  ]},
  { code: 'OP', name: '日常劳保与劳动工具类', midCategories: [
    { code: '01', name: '劳动防护用品' }, { code: '02', name: '日常手动工具' }, { code: '03', name: '小型电动工具' },
    { code: '04', name: '清洁与卫生用品' }, { code: '99', name: '其他作业支持用品' }
  ]},
  { code: 'PH', name: '仓储与物流资材类', midCategories: [
    { code: '01', name: '采收容器' }, { code: '02', name: '农产品包装材料' }, { code: '03', name: '冷链设备' },
    { code: '04', name: '装卸与仓储设备' }, { code: '99', name: '其他采后处理' }
  ]},
  { code: 'TS', name: '检测与技术服务类', midCategories: [
    { code: '01', name: '土壤/水质检测服务' }, { code: '02', name: '农残快检设备与试剂' }, { code: '03', name: '农业物联网设备' },
    { code: '04', name: '数字农业软件服务' }, { code: '05', name: '农业技术咨询与培训' }, { code: '99', name: '其他技术服务' }
  ]},
  { code: 'UT', name: '能源与辅助耗材类', midCategories: [
    { code: '01', name: '燃油/润滑油' }, { code: '02', name: '电力与新能源' }, { code: '03', name: '通用工业耗材' }, { code: '99', name: '其他能源与耗材' }
  ]},
  { code: 'OT', name: '其他综合类', midCategories: [
    { code: '01', name: '其他未分类供应商' }
  ]}
]

// 从分类数据查询类型中文名（与V1.1 getSupplierTypeName一致）
const getSupplierTypeName = (code) => {
  const cat = supplierCategories.find(c => c.code === code)
  return cat ? cat.name : (code || '')
}

const exportFormats = [
  { value: 'excel', label: 'Excel (.xlsx)', desc: '适用于数据分析和处理' },
  { value: 'csv', label: 'CSV (.csv)', desc: '适用于数据交换' },
  { value: 'word', label: 'Word (.docx)', desc: '适用于文档编辑和分享' }
]

// 编码生成器使用的分类选项（优先使用Store数据，回退到本地常量）
const categoryOptions = computed(() => {
  const storeCats = supplierCodeRuleStore.categories
  return storeCats && storeCats.length > 0 ? storeCats : supplierCategories
})

// ==================== Store ====================

const router = useRouter()
const supplierStore = useSupplierStore()
const dictionaryStore = useDictionaryStore()
const supplierCodeRuleStore = useSupplierCodeRuleStore()

// ==================== 字典数据 ====================

// 供应商属性选项（从字典加载，与V1.1一致）
const supplierAttributeOptions = computed(() => {
  const attrs = dictionaryStore.dictionaries.filter(
    d => d.category === 'supplier_attribute' && d.status === 'active'
  )
  if (attrs.length === 0) {
    // 字典为空时使用硬编码回退
    return [
      { code: '企业', name: '企业' },
      { code: '个体户', name: '个体户' },
      { code: '事业单位', name: '事业单位' }
    ]
  }
  return attrs
})

// 筛选器用的属性选项（包含"全部"）
const supplierAttributeFilterOptions = computed(() => {
  return ['全部', ...supplierAttributeOptions.value.map(a => a.name)]
})

// ==================== 状态 ====================

const currentPage = ref(1)
const pageSize = ref(10)
const selectedRows = ref([])
const batchEditMode = ref(false)
const deleteMode = ref(false)
const exportMode = ref(false)
const exportFormat = ref('excel')
const showDetailModal = ref(false)
const showFormModal = ref(false)
const showBatchEditModal = ref(false)
const showExportModal = ref(false)
const showDeleteModal = ref(false)
const showDeleteWarning = ref(false)  // 单行删除警告弹窗（与V1.1 DeleteWarningDialog一致）
const isEdit = ref(false)
const showMore = ref(false)
const codeGenExpanded = ref(false)
const copySuccess = ref(false)
const detailSupplier = ref(null)
const exportRecords = ref([])
const batchEditSuppliers = ref([])
const deleteSupplierIds = ref([])
const tableRef = ref()

// 批量编辑状态（逐条编辑+累积保存，与V1.1一致）
const batchEditedSuppliers = ref({})
const currentBatchEditIndex = ref(0)

// 编码生成器
const codeGen = reactive({ bigCategory: '', midCategory: '', generatedCode: '' })
const codeGenError = ref('')
const codeGenSuccess = ref('')

// 筛选 - 与V1.1 SupplierFiltersState一致
const filters = reactive({
  code: '', name: '', contact: '',
  type: '全部', status: '全部', supplierAttribute: '全部', organization: '全部',
  province: '', city: '', district: ''
})

// 表单
const form = reactive({
  id: 0, code: '', organization: '宁波帮帮忙公司', name: '',
  supplierType: 'SP', supplierAttribute: '企业', contact: '', mobilePhone: '',
  workPhone: '', fax: '', country: '中国', province: '', city: '',
  address: '', status: '合作中', bankName: '', bankCardNumber: '',
  createDate: '', remarks: ''
})
const formRef = ref()

// ==================== 计算属性 ====================

const hasActiveMode = computed(() => batchEditMode.value || deleteMode.value || exportMode.value)

const filteredSuppliers = computed(() => {
  let list = supplierStore.suppliers || []
  if (filters.code) {
    const kw = filters.code.toLowerCase()
    list = list.filter(s => s.code && s.code.toLowerCase().includes(kw))
  }
  if (filters.name) {
    const kw = filters.name.toLowerCase()
    list = list.filter(s => s.name && s.name.toLowerCase().includes(kw))
  }
  if (filters.contact) {
    const kw = filters.contact.toLowerCase()
    list = list.filter(s => s.contact && s.contact.toLowerCase().includes(kw))
  }
  if (filters.type !== '全部') {
    list = list.filter(s => s.supplierType === filters.type)
  }
  if (filters.status !== '全部') {
    list = list.filter(s => s.status === filters.status)
  }
  if (filters.supplierAttribute !== '全部') {
    list = list.filter(s => s.supplierAttribute === filters.supplierAttribute)
  }
  if (filters.organization !== '全部') {
    list = list.filter(s => s.organization === filters.organization)
  }
  if (filters.province) {
    const kw = filters.province.toLowerCase()
    list = list.filter(s => s.province && s.province.toLowerCase().includes(kw))
  }
  if (filters.city) {
    const kw = filters.city.toLowerCase()
    list = list.filter(s => s.city && s.city.toLowerCase().includes(kw))
  }
  if (filters.district) {
    const kw = filters.district.toLowerCase()
    list = list.filter(s => s.district && s.district.toLowerCase().includes(kw))
  }
  return list
})

const paginatedSuppliers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredSuppliers.value.slice(start, start + pageSize.value)
})

const paginationTotal = computed(() => filteredSuppliers.value.length)
const totalPages = computed(() => Math.ceil(paginationTotal.value / pageSize.value) || 1)

const isAllSelected = computed(() => {
  if (deleteMode.value) {
    const editable = paginatedSuppliers.value.filter(s => s.status !== '终止')
    return editable.length > 0 && editable.every(s => selectedRows.value.includes(s.id))
  }
  return paginatedSuppliers.value.length > 0 && selectedRows.value.length === paginatedSuppliers.value.length
})

const codeGenMidCats = computed(() => {
  if (!codeGen.bigCategory) return []
  const big = supplierCategories.find(c => c.code === codeGen.bigCategory)
  return big ? big.midCategories : []
})

// 批量编辑相关计算属性
const currentBatchSupplierId = computed(() => batchEditSuppliers.value[currentBatchEditIndex.value]?.id)
const currentBatchSupplier = computed(() => batchEditSuppliers.value[currentBatchEditIndex.value])
const batchEditedCount = computed(() => Object.keys(batchEditedSuppliers.value).length)

// 删除确认显示的供应商名称
const deleteSupplierNames = computed(() => {
  const selected = (supplierStore.suppliers || []).filter(s => deleteSupplierIds.value.includes(s.id))
  const names = selected.slice(0, 5).map(s => s.name).join('、')
  return selected.length > 5 ? `${names} 等${selected.length}个` : names
})

// ==================== 筛选 ====================

const handleFilterChange = (key, value) => {
  filters[key] = value
  currentPage.value = 1
}

const handleResetFilters = () => {
  filters.code = ''
  filters.name = ''
  filters.contact = ''
  filters.type = '全部'
  filters.status = '全部'
  filters.supplierAttribute = '全部'
  filters.organization = '全部'
  filters.province = ''
  filters.city = ''
  filters.district = ''
  currentPage.value = 1
}

// ==================== 选择与模式 ====================

const handleSelectionChange = (selection) => {
  selectedRows.value = selection.map(row => row.id)
}

const handleSelectAll = () => {
  if (deleteMode.value) {
    const editable = paginatedSuppliers.value.filter(s => s.status !== '终止')
    const editableIds = editable.map(s => s.id)
    const allSelected = editableIds.every(id => selectedRows.value.includes(id))
    if (allSelected) {
      selectedRows.value = selectedRows.value.filter(id => !editableIds.includes(id))
    } else {
      selectedRows.value = [...selectedRows.value.filter(id => !editableIds.includes(id)), ...editableIds]
    }
  } else {
    if (paginatedSuppliers.value.every(s => selectedRows.value.includes(s.id))) {
      selectedRows.value = []
    } else {
      selectedRows.value = paginatedSuppliers.value.map(s => s.id)
    }
  }
}

const enterBatchEditMode = () => { batchEditMode.value = true; deleteMode.value = false; exportMode.value = false; selectedRows.value = [] }
const enterDeleteMode = () => { deleteMode.value = true; batchEditMode.value = false; exportMode.value = false; selectedRows.value = [] }
const enterExportMode = () => { exportMode.value = true; batchEditMode.value = false; deleteMode.value = false; selectedRows.value = [] }

const cancelBatchEdit = () => { batchEditMode.value = false; showBatchEditModal.value = false; selectedRows.value = []; batchEditedSuppliers.value = {}; currentBatchEditIndex.value = 0 }
const cancelDelete = () => { deleteMode.value = false; showDeleteModal.value = false; selectedRows.value = [] }
const cancelExport = () => { exportMode.value = false; selectedRows.value = [] }
const exitExportMode = () => { exportMode.value = false; selectedRows.value = [] }

// ==================== 编码生成器 ====================

const handleCodeGenBigChange = () => { codeGen.midCategory = ''; codeGen.generatedCode = ''; codeGenError.value = ''; codeGenSuccess.value = '' }
const handleCodeGenMidChange = () => { codeGen.generatedCode = ''; codeGenError.value = ''; codeGenSuccess.value = '' }

const handleGenerateCode = () => {
  codeGenError.value = ''
  codeGenSuccess.value = ''
  if (!codeGen.bigCategory || !codeGen.midCategory) {
    codeGenError.value = '请选择供应商大类和供应商中类'
    return
  }
  const seq = String(Math.floor(Math.random() * 99) + 1).padStart(3, '0')
  codeGen.generatedCode = `SU_${codeGen.bigCategory}${codeGen.midCategory}${seq}`
  codeGenSuccess.value = '编码生成成功！'
}

const handleCopyCode = () => {
  if (!codeGen.generatedCode) return
  navigator.clipboard.writeText(codeGen.generatedCode)
  copySuccess.value = true
  setTimeout(() => { copySuccess.value = false }, 2000)
}

const handleResetCodeGen = () => {
  codeGen.bigCategory = ''
  codeGen.midCategory = ''
  codeGen.generatedCode = ''
  codeGenError.value = ''
  codeGenSuccess.value = ''
}

const handleShowCodeRule = () => { router.push('/supplier-code-rule') }

// ==================== 表格操作 ====================

const handleView = (row) => { detailSupplier.value = row; showDetailModal.value = true }

// 单行删除：先显示警告弹窗（与V1.1 DeleteWarningDialog一致）
const singleDeleteTarget = ref(null)

const handleDeleteSingle = (row) => {
  singleDeleteTarget.value = row
  showDeleteWarning.value = true
}

const handleConfirmSingleDelete = () => {
  if (singleDeleteTarget.value) {
    selectedRows.value = [singleDeleteTarget.value.id]
    deleteSupplierIds.value = [singleDeleteTarget.value.id]
    showDeleteWarning.value = false
    handleDoDelete()
    singleDeleteTarget.value = null
  }
}

const handleAdd = () => {
  isEdit.value = false
  resetForm()
  form.createDate = new Date().toISOString().slice(0, 10)
  if (codeGen.generatedCode) form.code = codeGen.generatedCode
  showFormModal.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  form.id = row.id
  form.code = row.code
  form.organization = row.organization
  form.name = row.name
  form.supplierType = row.supplierType
  form.supplierAttribute = row.supplierAttribute
  form.contact = row.contact
  form.mobilePhone = row.mobilePhone
  form.workPhone = row.workPhone || ''
  form.fax = row.fax || ''
  form.country = row.country
  form.province = row.province
  form.city = row.city
  form.address = row.address
  form.status = row.status
  form.bankName = row.bankName || ''
  form.bankCardNumber = row.bankCardNumber || ''
  form.createDate = row.createDate
  form.remarks = row.remarks || ''
  showFormModal.value = true
}

const handleSave = async () => {
  if (!form.name) {
    ElMessage.warning('请输入供应商名称')
    return
  }
  if (!form.code) {
    ElMessage.warning('请输入供应商编号')
    return
  }

  // 格式验证（与V1.1 SupplierAddModal 第191-197行一致）
  const errors = runValidations([
    { field: 'mobilePhone', valid: validateMobilePhone(form.mobilePhone), message: '手机号格式不正确，应为1开头的11位数字' },
    { field: 'workPhone', valid: validateWorkPhone(form.workPhone), message: '工作电话格式不正确，应为区号-号码格式（如：0571-88886666）' },
    { field: 'fax', valid: validateFax(form.fax), message: '传真格式不正确' },
    { field: 'bankCardNumber', valid: validateBankCard(form.bankCardNumber), message: '银行卡号格式不正确，应为15位或17-18位数字' },
    { field: 'code', valid: validateCode(form.code), message: '标识码只能包含字母、数字、下划线和连字符' },
  ])
  if (errors.length > 0) {
    ElMessage.warning('请检查以下字段：\n' + errors.map(e => e.message).join('\n'))
    return
  }

  try {
    if (isEdit.value) {
      const { id, ...data } = form
      await supplierStore.editSupplier(id, data)
      ElMessage.success('编辑成功')
    } else {
      const { id, ...data } = form
      await supplierStore.addSupplier(data)
      ElMessage.success('新增成功')
    }
    showFormModal.value = false
    await supplierStore.loadSuppliers()
  } catch (err) {
    ElMessage.error('操作失败: ' + (err.message || '未知错误'))
  }
}

const resetForm = () => {
  form.id = 0
  form.code = ''
  form.organization = '宁波帮帮忙公司'
  form.name = ''
  form.supplierType = 'SP'
  form.supplierAttribute = '企业'
  form.contact = ''
  form.mobilePhone = ''
  form.workPhone = ''
  form.fax = ''
  form.country = '中国'
  form.province = ''
  form.city = ''
  form.address = ''
  form.status = '合作中'
  form.bankName = ''
  form.bankCardNumber = ''
  form.createDate = ''
  form.remarks = ''
}

// ==================== 批量编辑 - 与V1.1 SupplierBatchEditModal一致 ====================

const handleConfirmBatchEdit = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要编辑的供应商')
    return
  }
  batchEditSuppliers.value = (supplierStore.suppliers || []).filter(s => selectedRows.value.includes(s.id))
  batchEditedSuppliers.value = {}
  currentBatchEditIndex.value = 0
  showBatchEditModal.value = true
}

const getBatchValue = (field) => {
  const id = currentBatchSupplierId.value
  if (!id) return ''
  if (batchEditedSuppliers.value[id]?.[field] !== undefined) return batchEditedSuppliers.value[id][field]
  if (currentBatchSupplier.value) return currentBatchSupplier.value[field] || ''
  return ''
}

const handleBatchFieldChange = (field, value) => {
  const id = currentBatchSupplierId.value
  if (!id) return
  batchEditedSuppliers.value = {
    ...batchEditedSuppliers.value,
    [id]: { ...(batchEditedSuppliers.value[id] || {}), [field]: value }
  }
}

const handleBatchSupplierSelect = (val) => {
  const id = Number(val)
  const idx = batchEditSuppliers.value.findIndex(s => s.id === id)
  if (idx >= 0) currentBatchEditIndex.value = idx
}

const handleBatchNext = () => {
  if (currentBatchEditIndex.value < batchEditSuppliers.value.length - 1) {
    currentBatchEditIndex.value++
  }
}

const handleBatchPrev = () => {
  if (currentBatchEditIndex.value > 0) {
    currentBatchEditIndex.value--
  }
}

const handleBatchEditModalClose = () => {
  batchEditedSuppliers.value = {}
  currentBatchEditIndex.value = 0
}

const handleSaveAllBatch = async () => {
  const entries = Object.entries(batchEditedSuppliers.value)
  if (entries.length === 0) {
    ElMessage.warning('没有需要保存的修改')
    return
  }
  let successCount = 0
  for (const [idStr, updates] of entries) {
    try {
      await supplierStore.editSupplier(Number(idStr), updates)
      successCount++
    } catch {
      // 继续处理其他条目
    }
  }
  await supplierStore.loadSuppliers()
  batchEditedSuppliers.value = {}
  currentBatchEditIndex.value = 0
  selectedRows.value = []
  batchEditMode.value = false
  showBatchEditModal.value = false
  if (successCount < entries.length) {
    ElMessage.warning(`批量编辑完成：成功 ${successCount}/${entries.length} 项`)
  } else {
    ElMessage.success(`批量编辑成功，已更新 ${successCount} 个供应商`)
  }
}

// ==================== 删除 ====================

const handleConfirmDelete = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的供应商')
    return
  }
  deleteSupplierIds.value = [...selectedRows.value]
  showDeleteModal.value = true
}

const handleDoDelete = async () => {
  if (deleteSupplierIds.value.length === 0) return
  try {
    await supplierStore.removeSuppliersBatch(deleteSupplierIds.value)
    ElMessage.success(`已删除 ${deleteSupplierIds.value.length} 个供应商`)
    showDeleteModal.value = false
    deleteMode.value = false
    selectedRows.value = []
    await supplierStore.loadSuppliers()
  } catch (err) {
    ElMessage.error('删除失败: ' + (err.message || '未知错误'))
  }
}

// ==================== 导出 - 与V1.1 SupplierManagementPage一致 ====================

const handleConfirmExport = () => {
  if (selectedRows.value.length > 0) {
    exportRecords.value = (supplierStore.suppliers || []).filter(s => selectedRows.value.includes(s.id))
  } else {
    exportRecords.value = filteredSuppliers.value
  }
  showExportModal.value = true
}

const handleDoExport = () => {
  const dataToExport = exportRecords.value.length > 0 ? exportRecords.value : filteredSuppliers.value
  if (dataToExport.length === 0) {
    ElMessage.warning('没有可导出的数据')
    return
  }

  const headers = ['供应商编号', '所属组织', '供应商名称', '供应物资类型', '供应商属性', '联系人', '移动电话', '工作电话', '传真号码', '国家', '省份', '城市', '详细地址', '状态', '开户行', '银行卡号', '创建时间', '备注']
  const exportData = dataToExport.map(s => ({
    '供应商编号': s.code,
    '所属组织': s.organization,
    '供应商名称': s.name,
    '供应物资类型': getSupplierTypeName(s.supplierType),
    '供应商属性': s.supplierAttribute,
    '联系人': s.contact,
    '移动电话': s.mobilePhone,
    '工作电话': s.workPhone || '',
    '传真号码': s.fax || '',
    '国家': s.country,
    '省份': s.province,
    '城市': s.city,
    '详细地址': s.address,
    '状态': s.status,
    '开户行': s.bankName || '',
    '银行卡号': s.bankCardNumber || '',
    '创建时间': s.createDate,
    '备注': s.remarks || ''
  }))

  let content = ''
  let mimeType = ''
  let extension = ''
  const bankCardIndex = headers.indexOf('银行卡号')

  if (exportFormat.value === 'csv') {
    content = '﻿' + headers.join(',') + '\n' + exportData.map(row => headers.map(h => `"${(row[h] || '')}"`).join(',')).join('\n')
    mimeType = 'text/csv;charset=utf-8'
    extension = 'csv'
  } else if (exportFormat.value === 'excel') {
    content = `<html><head><meta charset="utf-8"></head><body><table border="1"><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>${exportData.map(row => `<tr>${headers.map((h, i) => { const v = row[h] || ''; return i === bankCardIndex && v ? `<td style="mso-number-format:\\@">${v}</td>` : `<td>${v}</td>` }).join('')}</tr>`).join('')}</table></body></html>`
    mimeType = 'application/vnd.ms-excel;charset=utf-8'
    extension = 'xlsx'
  } else if (exportFormat.value === 'word') {
    content = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"></head><body><table border="1">${headers.map(h => `<th>${h}</th>`).join('')}${exportData.map(row => `<tr>${headers.map(h => { const v = row[h] || ''; return h === '银行卡号' && v ? `<td style="mso-number-format:\\@">${v}</td>` : `<td>${v}</td>` }).join('')}</tr>`).join('')}</table></body></html>`
    mimeType = 'application/ms-word;charset=utf-8'
    extension = 'docx'
  }

  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `供应商数据_${new Date().toISOString().slice(0, 10)}.${extension}`
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
  await Promise.all([
    supplierStore.loadSuppliers(),
    dictionaryStore.loadDictionaries(),
    supplierCodeRuleStore.fetchCategories()
  ])
})
</script>

<style scoped>
/* 表格表头蓝色渐变（与V1.1一致） */
.supplier-table :deep(.el-table__header-wrapper .el-table__header th) {
  background: linear-gradient(to right, #3b82f6, #2563eb) !important;
  color: #ffffff !important;
  font-weight: 600 !important;
}
.supplier-table :deep(.el-table__header-wrapper .el-table__header th .el-table__cell) {
  background: transparent !important;
  color: #ffffff !important;
}
/* 表格行悬浮蓝色（与V1.1 hover:bg-blue-100一致） */
.supplier-table :deep(.el-table__body-wrapper .el-table__body tr:hover > td) {
  background-color: #dbeafe !important;
}
</style>
