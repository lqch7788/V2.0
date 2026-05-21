<template>
  <div class="space-y-6">
    <!-- 页头 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
            <el-icon :size="24" color="white">
              <Shop />
            </el-icon>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">供应商管理</h1>
            <p class="text-gray-500">供应商信息管理</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 编码规则按钮 + 编码生成器 -->
    <div class="flex items-center gap-4">
      <div class="h-6 w-px bg-gray-500"></div>
      <el-button size="small" @click="handleShowCodeRule">
        编码规则 &gt;&gt;
      </el-button>
      <span class="text-base font-bold text-blue-600">供应商编码生成</span>
      <el-button
        :icon="codeGenExpanded ? 'ArrowUp' : 'ArrowDown'"
        link
        @click="codeGenExpanded = !codeGenExpanded"
        :title="codeGenExpanded ? '收起' : '展开'"
      />
    </div>

    <!-- 编码规则生成器 -->
    <div v-if="codeGenExpanded" class="bg-white rounded-xl p-6 shadow-sm">
      <div class="flex items-center gap-2 mb-4">
        <h3 class="text-lg font-semibold text-gray-900">编码生成</h3>
        <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
          供应商编码规则：大类(2位) + 中类(2位) + 序号(3位)
        </span>
      </div>

      <div class="grid grid-cols-4 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">供应商大类</label>
          <el-select
            v-model="codeGen.bigCategory"
            placeholder="请选择大类"
            @change="handleCodeGenBigCategoryChange"
          >
            <el-option
              v-for="cat in supplierBigCategories"
              :key="cat.code"
              :label="`${cat.code} - ${cat.name}`"
              :value="cat.code"
            />
          </el-select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">供应商中类</label>
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
          <label class="block text-sm font-medium text-gray-700 mb-1">生成编码</label>
          <el-input v-model="codeGen.generatedCode" placeholder="点击生成" readonly />
        </div>
        <div class="flex items-end">
          <el-button
            type="primary"
            :disabled="!codeGen.bigCategory || !codeGen.midCategory"
            @click="handleGenerateCode"
            class="w-full"
          >
            生成编码
          </el-button>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="flex items-center gap-3">
        <el-button
          type="primary"
          :disabled="!codeGen.generatedCode"
          @click="handleCopyCode"
        >
          <el-icon><CopyDocument /></el-icon>
          {{ copySuccess ? '已复制!' : '复制编码' }}
        </el-button>
        <el-button @click="handleResetCodeGen">
          重置
        </el-button>
      </div>

      <!-- 提示信息 -->
      <div v-if="codeGenError" class="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
        <p class="text-sm text-red-600">{{ codeGenError }}</p>
      </div>
      <div v-if="codeGenSuccess && !codeGenError" class="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg">
        <p class="text-sm text-green-600">{{ codeGenSuccess }}</p>
      </div>
    </div>

    <!-- 筛选 -->
    <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm">
      <div class="grid grid-cols-7 gap-4">
        <!-- 供应商编号 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">供应商编号</label>
          <el-input
            v-model="filters.code"
            placeholder="请输入"
            clearable
            @clear="handleFilterChange('code', '')"
          />
        </div>

        <!-- 供应商名称 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">供应商名称</label>
          <el-input
            v-model="filters.name"
            placeholder="请输入"
            clearable
            @clear="handleFilterChange('name', '')"
          />
        </div>

        <!-- 联系人 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">联系人</label>
          <el-input
            v-model="filters.contact"
            placeholder="请输入"
            clearable
            @clear="handleFilterChange('contact', '')"
          />
        </div>

        <!-- 供应物资类型 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">供应物资类型</label>
          <el-select v-model="filters.type" placeholder="全部" @change="handleFilterChange('type', filters.type)">
            <el-option label="全部" value="全部" />
            <el-option label="原料" value="原料" />
            <el-option label="资材" value="资材" />
            <el-option label="设备" value="设备" />
            <el-option label="服务" value="服务" />
          </el-select>
        </div>

        <!-- 状态 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">状态</label>
          <el-select v-model="filters.status" placeholder="全部" @change="handleFilterChange('status', filters.status)">
            <el-option label="全部" value="全部" />
            <el-option label="启用" value="启用" />
            <el-option label="禁用" value="禁用" />
          </el-select>
        </div>

        <!-- 供应商属性 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">供应商属性</label>
          <el-select v-model="filters.supplierAttribute" placeholder="全部" @change="handleFilterChange('supplierAttribute', filters.supplierAttribute)">
            <el-option label="全部" value="全部" />
            <el-option label="直接材料" value="直接材料" />
            <el-option label="间接材料" value="间接材料" />
            <el-option label="服务" value="服务" />
          </el-select>
        </div>

        <!-- 所属组织 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">所属组织</label>
          <el-select v-model="filters.organization" placeholder="全部" @change="handleFilterChange('organization', filters.organization)">
            <el-option label="全部" value="全部" />
            <el-option label="总公司" value="总公司" />
            <el-option label="分公司A" value="分公司A" />
            <el-option label="分公司B" value="分公司B" />
          </el-select>
        </div>
      </div>

      <!-- 筛选按钮 -->
      <div class="mt-4 flex justify-end">
        <el-button @click="handleResetFilters">重置</el-button>
      </div>
    </div>

    <!-- 表格区域 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <!-- 工具栏 -->
      <div class="p-4 border-b border-gray-100 flex items-center justify-between">
        <!-- 标题和选择信息 -->
        <div class="flex items-center gap-3">
          <h3 class="text-lg font-semibold text-gray-900">供应商列表</h3>
          <template v-if="hasActiveMode">
            <el-button link type="primary" size="small" @click="handleSelectAll">
              {{ isAllSelected ? '全不选' : '全选' }}
            </el-button>
            <span class="text-sm text-gray-500">已选择 {{ selectedRows.length }} 项</span>
          </template>
        </div>

        <!-- 操作按钮 -->
        <div class="flex items-center gap-2">
          <template v-if="!hasActiveMode">
            <el-button type="primary" @click="handleAdd">
              <el-icon><Plus /></el-icon>
              新增
            </el-button>
            <el-button type="primary" @click="handleBatchEdit">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button type="danger" @click="handleDelete">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
            <el-button @click="handleExport">
              <el-icon><Download /></el-icon>
              导出
            </el-button>
          </template>
          <template v-else>
            <!-- 编辑模式 -->
            <template v-if="batchEditMode">
              <el-button type="primary" @click="handleConfirmBatchEdit">
                确认编辑{{ selectedRows.length > 0 ? ` (${selectedRows.length})` : '' }}
              </el-button>
              <el-button @click="handleCancelBatchEdit">取消</el-button>
            </template>
            <!-- 删除模式 -->
            <template v-if="deleteMode">
              <el-button type="danger" @click="handleConfirmDelete">
                确认删除{{ selectedRows.length > 0 ? ` (${selectedRows.length})` : '' }}
              </el-button>
              <el-button @click="handleCancelDelete">取消</el-button>
            </template>
            <!-- 导出模式 -->
            <template v-if="exportMode">
              <el-button type="primary" @click="handleConfirmExport">
                <el-icon><Download /></el-icon>
                确认导出{{ selectedRows.length > 0 ? ` (${selectedRows.length})` : '' }}
              </el-button>
              <el-button @click="handleCancelExport">取消选择</el-button>
            </template>
          </template>
        </div>
      </div>

      <!-- 表格 -->
      <el-table
        :data="paginatedSuppliers"
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column
          v-if="hasActiveMode"
          type="selection"
          width="55"
        />
        <el-table-column prop="code" label="供应商编号" width="150" />
        <el-table-column prop="organization" label="所属组织" width="120" />
        <el-table-column prop="name" label="供应商名称" min-width="180" />
        <el-table-column prop="supplierType" label="供应物资类型" width="120">
          <template #default="{ row }">
            {{ getSupplierTypeName(row.supplierType) }}
          </template>
        </el-table-column>
        <el-table-column prop="supplierAttribute" label="供应商属性" width="120" />
        <el-table-column prop="contact" label="联系人" width="100" />
        <el-table-column prop="mobilePhone" label="移动电话" width="120" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === '启用' ? 'success' : 'danger'" size="small">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">查看</el-button>
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
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
            共 {{ filteredSuppliers.length }} 条，第 {{ currentPage }} / {{ totalPages }} 页
          </span>
          <el-pagination
            v-model:current-page="currentPage"
            :page-size="pageSize"
            :total="filteredSuppliers.length"
            layout="prev, pager, next"
            @current-change="handlePageChange"
          />
        </div>
      </div>
    </div>

    <!-- 查看详情弹窗 -->
    <el-dialog
      v-model="showDetailModal"
      title="供应商详情"
      width="700px"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="供应商编号">{{ selectedSupplier?.code }}</el-descriptions-item>
        <el-descriptions-item label="所属组织">{{ selectedSupplier?.organization }}</el-descriptions-item>
        <el-descriptions-item label="供应商名称" :span="2">{{ selectedSupplier?.name }}</el-descriptions-item>
        <el-descriptions-item label="供应物资类型">{{ getSupplierTypeName(selectedSupplier?.supplierType || '') }}</el-descriptions-item>
        <el-descriptions-item label="供应商属性">{{ selectedSupplier?.supplierAttribute }}</el-descriptions-item>
        <el-descriptions-item label="联系人">{{ selectedSupplier?.contact }}</el-descriptions-item>
        <el-descriptions-item label="移动电话">{{ selectedSupplier?.mobilePhone }}</el-descriptions-item>
        <el-descriptions-item label="工作电话">{{ selectedSupplier?.workPhone || '-' }}</el-descriptions-item>
        <el-descriptions-item label="传真号码">{{ selectedSupplier?.fax || '-' }}</el-descriptions-item>
        <el-descriptions-item label="国家">{{ selectedSupplier?.country }}</el-descriptions-item>
        <el-descriptions-item label="省份">{{ selectedSupplier?.province }}</el-descriptions-item>
        <el-descriptions-item label="城市">{{ selectedSupplier?.city }}</el-descriptions-item>
        <el-descriptions-item label="详细地址" :span="2">{{ selectedSupplier?.address }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="selectedSupplier?.status === '启用' ? 'success' : 'danger'" size="small">
            {{ selectedSupplier?.status }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="开户行">{{ selectedSupplier?.bankName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="银行卡号" :span="2">{{ selectedSupplier?.bankCardNumber || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ selectedSupplier?.createDate }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ selectedSupplier?.remarks || '-' }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="showDetailModal = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="showFormModal"
      :title="isEdit ? '编辑供应商' : '新增供应商'"
      width="800px"
      :close-on-click-modal="false"
    >
      <el-form :model="form" label-width="120px" :rules="rules" ref="formRef">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="供应商编号" prop="code">
              <el-input v-model="form.code" placeholder="请输入供应商编号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属组织" prop="organization">
              <el-select v-model="form.organization" placeholder="请选择">
                <el-option label="总公司" value="总公司" />
                <el-option label="分公司A" value="分公司A" />
                <el-option label="分公司B" value="分公司B" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="供应商名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入供应商名称" />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="供应物资类型" prop="supplierType">
              <el-select v-model="form.supplierType" placeholder="请选择">
                <el-option label="原料" value="1" />
                <el-option label="资材" value="2" />
                <el-option label="设备" value="3" />
                <el-option label="服务" value="4" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="供应商属性" prop="supplierAttribute">
              <el-select v-model="form.supplierAttribute" placeholder="请选择">
                <el-option label="直接材料" value="直接材料" />
                <el-option label="间接材料" value="间接材料" />
                <el-option label="服务" value="服务" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="联系人" prop="contact">
              <el-input v-model="form.contact" placeholder="请输入联系人" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="移动电话" prop="mobilePhone">
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
            <el-form-item label="国家" prop="country">
              <el-input v-model="form.country" placeholder="请输入国家" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="省份" prop="province">
              <el-input v-model="form.province" placeholder="请输入省份" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="城市" prop="city">
              <el-input v-model="form.city" placeholder="请输入城市" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="详细地址" prop="address">
          <el-input v-model="form.address" placeholder="请输入详细地址" />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio label="启用">启用</el-radio>
                <el-radio label="禁用">禁用</el-radio>
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

        <el-form-item label="备注">
          <el-input v-model="form.remarks" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showFormModal = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>

    <!-- 导出格式选择弹窗 -->
    <el-dialog
      v-model="showExportModal"
      title="选择导出格式"
      width="500px"
    >
      <p class="text-sm text-gray-500 mb-4">
        {{ selectedRows.length > 0 ? `已选择 ${selectedRows.length} 条数据` : `共 ${filteredSuppliers.length} 条数据` }}
      </p>
      <div class="space-y-3">
        <el-radio-group v-model="exportFormat" class="w-full">
          <div
            v-for="format in exportFormats"
            :key="format.value"
            :class="[
              'flex items-center p-4 border rounded-lg cursor-pointer transition-all',
              exportFormat === format.value
                ? 'border-purple-500 bg-purple-50'
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
        <el-button type="primary" @click="handleDoExport">导出</el-button>
      </template>
    </el-dialog>

    <!-- 删除确认弹窗 -->
    <el-dialog
      v-model="showDeleteConfirm"
      title="确认删除"
      width="400px"
    >
      <div class="flex items-center gap-3">
        <el-icon :size="40" color="#f56c6c"><WarningFilled /></el-icon>
        <div>
          <p class="text-lg font-medium">确定要删除选中的 {{ selectedRows.length }} 个供应商吗？</p>
          <p class="text-sm text-gray-500">此操作不可恢复</p>
        </div>
      </div>
      <template #footer>
        <el-button @click="showDeleteConfirm = false">取消</el-button>
        <el-button type="danger" @click="handleDoDelete">确认删除</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { Shop, Plus, Edit, Delete, Download, CopyDocument, WarningFilled } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { } from 'element-plus'

// 供应商类型配置
const supplierTypeMap = {
  '1': '原料',
  '2': '资材',
  '3': '设备',
  '4': '服务'
}

const getSupplierTypeName = (type) => supplierTypeMap[type] || type

// 供应商大类配置
const supplierBigCategories = [
  { code: 'YS', name: '原料供应商' },
  { code: 'ZC', name: '资材供应商' },
  { code: 'SB', name: '设备供应商' },
  { code: 'FW', name: '服务供应商' }
]

// 供应商中类配置
const supplierMidCategories = {
  'YS': [
    { code: '01', name: '种子' },
    { code: '02', name: '肥料' },
    { code: '03', name: '农药' }
  ],
  'ZC': [
    { code: '01', name: '包装材料' },
    { code: '02', name: '工具' }
  ],
  'SB': [
    { code: '01', name: '农机设备' },
    { code: '02', name: '检测设备' }
  ],
  'FW': [
    { code: '01', name: '物流服务' },
    { code: '02', name: '维修服务' }
  ]
}

// 导出格式选项
const exportFormats = [
  { value: 'excel', label: 'Excel (.xlsx)', desc: '适用于数据分析和处理' },
  { value: 'csv', label: 'CSV (.csv)', desc: '适用于数据交换' },
  { value: 'word', label: 'Word (.docx)', desc: '适用于文档编辑和分享' }
]

// 供应商类型

// Mock数据
const mockSuppliers = ref([
  {
    id,
    code: 'YS01001',
    organization: '总公司',
    name: '种子公司A',
    supplierType: '1',
    supplierAttribute: '直接材料',
    contact: '张经理',
    mobilePhone: '13800138001',
    workPhone: '010-12345678',
    fax: '010-12345679',
    country: '中国',
    province: '北京市',
    city: '北京市',
    address: '朝阳区XX路XX号',
    status: '启用',
    bankName: '中国银行北京分行',
    bankCardNumber: '6222123456789012345',
    createDate: '2025-01-15',
    remarks: '长期合作伙伴'
  },
  {
    id,
    code: 'YS02001',
    organization: '总公司',
    name: '肥料公司B',
    supplierType: '1',
    supplierAttribute: '直接材料',
    contact: '李经理',
    mobilePhone: '13800138002',
    workPhone: '021-87654321',
    country: '中国',
    province: '上海市',
    city: '上海市',
    address: '浦东新区XX路XX号',
    status: '启用',
    bankName: '工商银行上海分行',
    createDate: '2025-02-20'
  },
  {
    id,
    code: 'ZC01001',
    organization: '分公司A',
    name: '包装材料公司C',
    supplierType: '2',
    supplierAttribute: '间接材料',
    contact: '王经理',
    mobilePhone: '13900139003',
    country: '中国',
    province: '广东省',
    city: '广州市',
    address: '天河区XX路XX号',
    status: '启用',
    createDate: '2025-03-10'
  },
  {
    id,
    code: 'FW01001',
    organization: '分公司B',
    name: '物流服务公司D',
    supplierType: '4',
    supplierAttribute: '服务',
    contact: '赵经理',
    mobilePhone: '13700137004',
    country: '中国',
    province: '浙江省',
    city: '杭州市',
    address: '西湖区XX路XX号',
    status: '禁用',
    createDate: '2025-04-05'
  }
])

// 状态
const currentPage = ref(1)
const pageSize = ref(10)
const selectedRows = ref([])
const batchEditMode = ref(false)
const deleteMode = ref(false)
const exportMode = ref(false)
const exportFormat = ref('excel')
const showDetailModal = ref(false)
const showFormModal = ref(false)
const showExportModal = ref(false)
const showDeleteConfirm = ref(false)
const isEdit = ref(false)
const codeGenExpanded = ref(false)
const copySuccess = ref(false)
const selectedSupplier = ref(null)

// 编码生成器状态
const codeGen = reactive({
  bigCategory: '',
  midCategory: '',
  generatedCode: ''
})
const codeGenError = ref('')
const codeGenSuccess = ref('')

// 筛选状态
const filters = reactive({
  code: '',
  name: '',
  contact: '',
  type: '全部',
  status: '全部',
  supplierAttribute: '全部',
  organization: '全部'
})

// 表单状态
const form = reactive({
  id: 0,
  code: '',
  organization: '总公司',
  name: '',
  supplierType: '1',
  supplierAttribute: '直接材料',
  contact: '',
  mobilePhone: '',
  workPhone: '',
  fax: '',
  country: '中国',
  province: '',
  city: '',
  address: '',
  status: '启用',
  bankName: '',
  bankCardNumber: '',
  createDate: '',
  remarks: ''
})

const formRef = ref()

const rules = {
  code: [{ required, message: '请输入供应商编号', trigger: 'blur' }],
  organization: [{ required, message: '请选择所属组织', trigger: 'change' }],
  name: [{ required, message: '请输入供应商名称', trigger: 'blur' }],
  supplierType: [{ required, message: '请选择供应物资类型', trigger: 'change' }],
  contact: [{ required, message: '请输入联系人', trigger: 'blur' }],
  mobilePhone: [{ required, message: '请输入移动电话', trigger: 'blur' }]
}

// 计算属性
const filteredSuppliers = computed(() => {
  return mockSuppliers.value.filter(s => {
    if (filters.code && !s.code.includes(filters.code)) return false
    if (filters.name && !s.name.includes(filters.name)) return false
    if (filters.contact && !s.contact.includes(filters.contact)) return false
    if (filters.type !== '全部' && getSupplierTypeName(s.supplierType) !== filters.type) return false
    if (filters.status !== '全部' && s.status !== filters.status) return false
    if (filters.supplierAttribute !== '全部' && s.supplierAttribute !== filters.supplierAttribute) return false
    if (filters.organization !== '全部' && s.organization !== filters.organization) return false
    return true
  })
})

const paginatedSuppliers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredSuppliers.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(filteredSuppliers.value.length / pageSize.value) || 1)

const hasActiveMode = computed(() => batchEditMode.value || deleteMode.value || exportMode.value)

const isAllSelected = computed(() => {
  return filteredSuppliers.value.length > 0 && selectedRows.value.length === filteredSuppliers.value.length
})

const codeGenMidCategories = computed(() => {
  if (!codeGen.bigCategory) return []
  return supplierMidCategories[codeGen.bigCategory] || []
})

// 方法
const handlePageChange = (page) => {
  currentPage.value = page
}

const handlePageSizeChange = () => {
  currentPage.value = 1
}

const handleFilterChange = (key, value) => {
  (filters)[key] = value
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
  currentPage.value = 1
}

const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

const handleSelectAll = () => {
  if (isAllSelected.value) {
    selectedRows.value = []
  } else {
    selectedRows.value = [...filteredSuppliers.value]
  }
}

// 编码生成器方法
const handleCodeGenBigCategoryChange = () => {
  codeGen.midCategory = ''
  codeGen.generatedCode = ''
}

const handleCodeGenMidCategoryChange = () => {
  codeGen.generatedCode = ''
}

const handleGenerateCode = () => {
  codeGenError.value = ''
  codeGenSuccess.value = ''
  if (!codeGen.bigCategory || !codeGen.midCategory) {
    codeGenError.value = '请选择供应商大类和供应商中类'
    return
  }
  const serialNum = String(Math.floor(Math.random() * 99) + 1).padStart(3, '0')
  codeGen.generatedCode = `SU_${codeGen.bigCategory}${codeGen.midCategory}${serialNum}`
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

const handleShowCodeRule = () => {
  ElMessage.info('编码规则页面开发中')
}

// 表格操作
const handleView = (row) => {
  selectedSupplier.value = row
  showDetailModal.value = true
}

const handleAdd = () => {
  isEdit.value = false
  resetForm()
  form.createDate = new Date().toISOString().slice(0, 10)
  showFormModal.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(form, row)
  showFormModal.value = true
}

const handleSave = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      if (isEdit.value) {
        const index = mockSuppliers.value.findIndex(s => s.id === form.id)
        if (index !== -1) {
          mockSuppliers.value[index] = { ...form }
        }
        ElMessage.success('编辑成功')
      } else {
        const newSupplier = {
          ...form,
          id: Math.max(...mockSuppliers.value.map(s => s.id)) + 1
        }
        mockSuppliers.value.unshift(newSupplier)
        ElMessage.success('新增成功')
      }
      showFormModal.value = false
    }
  })
}

const handleBatchEdit = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要编辑的供应商')
    return
  }
  batchEditMode.value = true
  deleteMode.value = false
  exportMode.value = false
}

const handleConfirmBatchEdit = () => {
  ElMessage.success(`批量编辑了 ${selectedRows.value.length} 个供应商`)
  batchEditMode.value = false
  selectedRows.value = []
}

const handleCancelBatchEdit = () => {
  batchEditMode.value = false
  selectedRows.value = []
}

const handleDelete = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的供应商')
    return
  }
  batchEditMode.value = false
  deleteMode.value = true
  exportMode.value = false
  showDeleteConfirm.value = true
}

const handleConfirmDelete = () => {
  showDeleteConfirm.value = false
  handleDoDelete()
}

const handleDoDelete = () => {
  const ids = selectedRows.value.map(s => s.id)
  mockSuppliers.value = mockSuppliers.value.filter(s => !ids.includes(s.id))
  ElMessage.success(`删除了 ${ids.length} 个供应商`)
  selectedRows.value = []
  deleteMode.value = false
}

const handleCancelDelete = () => {
  deleteMode.value = false
  showDeleteConfirm.value = false
  selectedRows.value = []
}

const handleExport = () => {
  batchEditMode.value = false
  deleteMode.value = false
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
    : filteredSuppliers.value

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

  if (exportFormat.value === 'csv') {
    content = headers.join(',') + '\n' + exportData.map(row =>
      headers.map(h => `"${(row)[h] || ''}"`).join(',')
    ).join('\n')
    mimeType = 'text/csv;charset=utf-8'
    extension = 'csv'
  } else if (exportFormat.value === 'excel') {
    const bankCardIndex = headers.indexOf('银行卡号')
    content = `<html><head><meta charset="utf-8"></head><body><table border="1"><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>${exportData.map(row => `<tr>${headers.map((h, i) => {
      const value = (row)[h] || ''
      if (i === bankCardIndex && value) {
        return `<td style="mso-number-format:\\@">${value}</td>`
      }
      return `<td>${value}</td>`
    }).join('')}</tr>`).join('')}</table></body></html>`
    mimeType = 'application/vnd.ms-excel;charset=utf-8'
    extension = 'xls'
  } else if (exportFormat.value === 'word') {
    content = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"></head><body><table border="1">${headers.map(h => `<th>${h}</th>`).join('')}${exportData.map(row => `<tr>${headers.map(h => `<td>${(row)[h] || ''}</td>`).join('')}</tr>`).join('')}</table></body></html>`
    mimeType = 'application/msword;charset=utf-8'
    extension = 'doc'
  }

  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `供应商数据_${new Date().toISOString().split('T')[0]}.${extension}`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  showExportModal.value = false
  exportMode.value = false
  selectedRows.value = []
  ElMessage.success('导出成功')
}

const resetForm = () => {
  form.id = 0
  form.code = ''
  form.organization = '总公司'
  form.name = ''
  form.supplierType = '1'
  form.supplierAttribute = '直接材料'
  form.contact = ''
  form.mobilePhone = ''
  form.workPhone = ''
  form.fax = ''
  form.country = '中国'
  form.province = ''
  form.city = ''
  form.address = ''
  form.status = '启用'
  form.bankName = ''
  form.bankCardNumber = ''
  form.createDate = ''
  form.remarks = ''
}
</script>
