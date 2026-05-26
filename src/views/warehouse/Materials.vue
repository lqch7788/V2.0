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

      <!-- 工具栏 -->
      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">物料库存列表</h3>
          <div class="flex items-center gap-2">
            <el-button
              v-if="showLowStock"
              type="danger"
              text
              @click="handleLowStockClick"
            >
              显示全部
            </el-button>
            <template v-if="exportMode">
              <el-button type="primary" @click="handleConfirmExport">
                <el-icon><Download /></el-icon>
                确认导出
              </el-button>
              <el-button @click="handleCancelExport">取消</el-button>
            </template>
            <el-button v-else type="primary" @click="handleExportClick">
              <el-icon><Download /></el-icon>
              导出
            </el-button>
          </div>
        </div>

        <!-- 表格 -->
        <el-table
          :data="paginatedMaterials"
          stripe
          @selection-change="handleSelectionChange"
        >
          <el-table-column
            v-if="exportMode"
            type="selection"
            width="55"
          />
          <el-table-column prop="code" label="物料编号" width="120" />
          <el-table-column prop="name" label="物料名称" min-width="150" />
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
            v-if="!exportMode"
            label="操作"
            width="120"
            fixed="right"
          >
            <template #default="{ row }">
              <el-button link type="primary" @click="handleView(row)">查看</el-button>
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
          <el-table-column prop="materialName" label="物料名称" min-width="150" />
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
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" @click="handleViewInbound(row)">查看</el-button>
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
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { Goods, Warning, Download, Search, Plus, Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { } from 'element-plus'
import { getMaterials, getInboundRecords } from '@/api/material/apiWarehouseMaterialService'

// 分类配置（来自V1.1的categoryConfig）
const categoryConfig = {
  '01': { name: '原料', categories: {
    '01': { name: '种子', subCategories: {
      '01': { name: '蔬菜种子', prefix: '010101' },
      '02': { name: '水果种子', prefix: '010102' }
    }},
    '02': { name: '肥料', subCategories: {
      '01': { name: '氮肥', prefix: '010201' },
      '02': { name: '磷肥', prefix: '010202' },
      '03': { name: '钾肥', prefix: '010203' }
    }},
    '03': { name: '农药', subCategories: {
      '01': { name: '杀虫剂', prefix: '010301' },
      '02': { name: '杀菌剂', prefix: '010302' }
    }}
  }},
  '02': { name: '资材', categories: {
    '01': { name: '包装材料', subCategories: {
      '01': { name: '纸箱', prefix: '020101' },
      '02': { name: '塑料袋', prefix: '020102' }
    }},
    '02': { name: '工具', subCategories: {
      '01': { name: '剪刀', prefix: '020201' },
      '02': { name: '铲子', prefix: '020202' }
    }}
  }}
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

// Mock数据（仅用于初始化）
const mockWarehouseMaterials = ref([
  { id: 1, code: '010101001', name: '番茄种子', category: '种子', unit: '袋', quantity: 100, minStock: 20, price: '25.00', supplier: '种子公司A', location: 'A区-01' },
  { id: 2, code: '010201001', name: '尿素', category: '肥料', unit: '袋', quantity: 200, minStock: 50, price: '120.00', supplier: '肥料公司B', location: 'B区-02' },
  { id: 3, code: '010301001', name: '多菌灵', category: '农药', unit: '瓶', quantity: 80, minStock: 15, price: '35.00', supplier: '农药公司C', location: 'C区-01' },
  { id: 4, code: '020101001', name: '纸箱(大)', category: '资材', unit: '个', quantity: 150, minStock: 30, price: '8.00', supplier: '资材公司D', location: 'D区-03' },
])

const mockInboundRecords = ref([
  { id: 1, code: 'RK20260121-001', materialCode: '010101001', materialName: '番茄种子', quantity: 50, unit: '袋', supplier: '种子公司A', inboundDate: '2026-01-21', operator: '张三', status: 'completed' },
  { id: 2, code: 'RK20260120-001', materialCode: '010201001', materialName: '尿素', quantity: 100, unit: '袋', supplier: '肥料公司B', inboundDate: '2026-01-20', operator: '李四', status: 'pending' },
])

// 物料数据（从API加载）
const warehouseMaterials = ref([])
const inboundRecordsData = ref([])
const loading = ref(false)

// 从API加载数据
const loadMaterials = async () => {
  loading.value = true
  try {
    const data = await getMaterials()
    warehouseMaterials.value = Array.isArray(data) ? data : (data.data || [])
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

const handleSaveInbound = () => {
  if (codeError.value || nameError.value) return
  if (!newInbound.materialCode || !newInbound.materialName || !newInbound.quantity) return

  // 保存逻辑
  console.log('Saving inbound:', newInbound)
  showAddModal.value = false
  resetNewInbound()
  ElMessage.success('保存成功')
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

const handleView = (row) => {
  console.log('View material:', row)
  ElMessage.info('查看详情功能')
}

const handleViewInbound = (row) => {
  console.log('View inbound:', row)
  ElMessage.info('查看入库记录详情')
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
