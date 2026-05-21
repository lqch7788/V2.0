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
            <h1 class="text-2xl font-bold text-gray-900">仓库物料</h1>
            <p class="text-gray-500">仓库物料库存管理</p>
          </div>
        </div>
        <el-button
          v-if="lowStockCount > 0"
          :type="showLowStock ? 'danger' : 'warning'"
          @click="handleLowStockClick"
        >
          <el-icon class="mr-1"><Warning /></el-icon>
          <span class="font-medium">库存不足</span>
          <el-badge :value="lowStockCount" type="danger" class="ml-2" />
        </el-button>
      </div>
    </div>

    <!-- 标签页 -->
    <div class="flex gap-2">
      <el-button
        :type="activeTab === 'overview' ? 'primary' : ''"
        @click="setActiveTab('overview')"
      >
        库存总览
      </el-button>
      <el-button
        :type="activeTab === 'inbound' ? 'primary' : ''"
        @click="setActiveTab('inbound')"
      >
        物料入库
      </el-button>
    </div>

    <!-- 库存总览 -->
    <div v-if="activeTab === 'overview'">
      <!-- 筛选器 -->
      <div class="bg-white rounded-xl p-4 shadow-sm mb-4">
        <div class="grid grid-cols-7 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">物料编号</label>
            <el-input v-model="filters.code" placeholder="请输入" clearable />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">物料名称</label>
            <el-input v-model="filters.name" placeholder="请输入" clearable />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">物料分类</label>
            <el-select v-model="filters.category" placeholder="请选择" clearable>
              <el-option label="全部" value="全部" />
              <el-option label="种质资源-粮食作物种子" value="种质资源-粮食作物种子" />
              <el-option label="种质资源-经济作物种子" value="种质资源-经济作物种子" />
              <el-option label="种质资源-蔬菜种子" value="种质资源-蔬菜种子" />
              <el-option label="肥料与土壤改良剂-有机肥" value="肥料与土壤改良剂-有机肥" />
              <el-option label="肥料与土壤改良剂-化学肥料" value="肥料与土壤改良剂-化学肥料" />
              <el-option label="农药与植保产品-杀虫剂" value="农药与植保产品-杀虫剂" />
              <el-option label="农药与植保产品-杀菌剂" value="农药与植保产品-杀菌剂" />
              <el-option label="农业机械-植保机械" value="农业机械-植保机械" />
              <el-option label="灌溉与水肥系统-灌溉终端" value="灌溉与水肥系统-灌溉终端" />
              <el-option label="劳保与防护用品-足部防护" value="劳保与防护用品-足部防护" />
              <el-option label="日常劳动工具-手动农具" value="日常劳动工具-手动农具" />
              <el-option label="采收容器-包装材料" value="采收容器-包装材料" />
              <el-option label="监测设备-传感器" value="监测设备-传感器" />
            </el-select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">供应商</label>
            <el-input v-model="filters.supplier" placeholder="请输入" clearable />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">存放位置</label>
            <el-input v-model="filters.location" placeholder="请输入" clearable />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">大数据类</label>
            <el-select v-model="filters.searchBigCategory" placeholder="请选择" clearable>
              <el-option label="全部" value="" />
              <el-option label="生产投入类" value="生产投入类" />
              <el-option label="设施与装备类" value="设施与装备类" />
              <el-option label="作业支持类" value="作业支持类" />
              <el-option label="采后处理与流通类" value="采后处理与流通类" />
              <el-option label="数字化与管理类" value="数字化与管理类" />
            </el-select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">中类</label>
            <el-select v-model="filters.searchMidCategory" placeholder="请选择" clearable :disabled="!filters.searchBigCategory">
              <el-option label="全部" value="" />
            </el-select>
          </div>
        </div>
        <div class="flex justify-end gap-2 mt-4">
          <el-button @click="handleReset">重置</el-button>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
        </div>
      </div>

      <!-- 表格 -->
      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <el-table :data="paginatedMaterials" style="width: 100%" @selection-change="handleSelectionChange">
          <el-table-column v-if="exportMode" type="selection" width="55" />
          <el-table-column prop="code" label="物料编号" width="130" />
          <el-table-column prop="name" label="物料名称" width="120" />
          <el-table-column prop="category" label="分类" width="180" />
          <el-table-column prop="specification" label="规格型号" width="120" />
          <el-table-column prop="barcode" label="条形码" width="140" />
          <el-table-column prop="unit" label="单位" width="70" />
          <el-table-column prop="quantity" label="库存数量" width="100">
            <template #default="{ row }">
              <span :class="row.quantity < row.minStock ? 'text-red-600 font-medium' : ''">
                {{ row.quantity }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="minStock" label="最低库存" width="100" />
          <el-table-column prop="maxStock" label="最高库存" width="100" />
          <el-table-column prop="price" label="单价" width="80" />
          <el-table-column prop="supplier" label="供应商" width="120" />
          <el-table-column prop="location" label="存放位置" width="100" />
          <el-table-column prop="batchNo" label="批次号" width="130" />
          <el-table-column prop="productionDate" label="生产日期" width="110" />
          <el-table-column prop="expiryDate" label="有效期至" width="110" />
          <el-table-column prop="lastUpdateTime" label="最后更新时间" width="150" />
          <el-table-column prop="dataStatus" label="数据状态" width="90">
            <template #default="{ row }">
              <el-tag :type="row.dataStatus === '启用' ? 'success' : 'info'" size="small">
                {{ row.dataStatus }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column v-if="!exportMode" label="操作" width="120" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" @click="handleView(row)">查看</el-button>
              <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="flex justify-between items-center px-4 py-3 border-t border-gray-100">
          <div class="text-sm text-gray-500">
            共 {{ filteredMaterials.length }} 条记录，第 {{ currentPage }}/{{ totalPages }} 页
          </div>
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50]"
            :total="filteredMaterials.length"
            layout="sizes, prev, pager, next"
            background
          />
        </div>
      </div>
    </div>

    <!-- 物料入库 -->
    <div v-if="activeTab === 'inbound'">
      <!-- 编码生成器 -->
      <div class="bg-white rounded-xl p-4 shadow-sm mb-4">
        <div class="grid grid-cols-6 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">大类</label>
            <el-select v-model="codeGen.bigCategory" placeholder="请选择" @change="handleCodeGenCategoryChange('big')">
              <el-option label="SP-生产投入类" value="SP" />
              <el-option label="EQ-设施与装备类" value="EQ" />
              <el-option label="OP-作业支持类" value="OP" />
              <el-option label="PH-采后处理与流通类" value="PH" />
              <el-option label="IT-数字化与管理类" value="IT" />
            </el-select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">中类</label>
            <el-select v-model="codeGen.midCategory" placeholder="请选择" :disabled="!codeGen.bigCategory" @change="handleCodeGenCategoryChange('mid')">
              <el-option v-for="cat in midCategories" :key="cat.code" :label="`${cat.code}-${cat.name}`" :value="cat.code" />
            </el-select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">小类</label>
            <el-select v-model="codeGen.subCategory" placeholder="请选择" :disabled="!codeGen.midCategory" @change="handleCodeGenCategoryChange('sub')">
              <el-option v-for="cat in subCategories" :key="cat.code" :label="`${cat.code}-${cat.name}`" :value="cat.code" />
            </el-select>
          </div>
          <div class="col-span-3">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              生成编码
              <span v-if="codeGenSuccess" class="ml-2 text-sm text-green-600 font-normal">{{ codeGenSuccess }}</span>
              <span v-if="codeGenError" class="ml-2 text-sm text-red-600 font-normal">{{ codeGenError }}</span>
            </label>
            <div class="flex gap-2">
              <el-input v-model="codeGen.generatedCode" placeholder="点击生成" readonly class="w-40" />
              <el-button @click="handleCodeGen" :disabled="!codeGen.subCategory">生成</el-button>
              <el-button @click="handleCopyCode" :disabled="!codeGen.generatedCode">
                {{ copySuccess ? '已复制!' : '复制' }}
              </el-button>
              <el-button @click="handleCodeGenReset">重置</el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 入库记录表格 -->
      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="p-4 border-b border-gray-100">
          <h3 class="text-lg font-semibold text-gray-900">入库记录</h3>
        </div>
        <el-table :data="paginatedInboundRecords" style="width: 100%">
          <el-table-column prop="code" label="入库单号" width="150" />
          <el-table-column prop="inboundDate" label="入库日期" width="120" />
          <el-table-column prop="supplier" label="供应商" width="150" />
          <el-table-column prop="operator" label="操作员" width="100" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)" size="small">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template #default="{ row }">
              <el-button link type="primary" @click="handleViewRecord(row)">查看</el-button>
              <el-button link type="primary" @click="handleEditRecord(row)">编辑</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="flex justify-between items-center px-4 py-3 border-t border-gray-100">
          <div class="text-sm text-gray-500">
            共 {{ inboundRecords.length }} 条记录，第 {{ inboundPage }}/{{ inboundTotalPages }} 页
          </div>
          <el-pagination
            v-model:current-page="inboundPage"
            v-model:page-size="inboundPageSize"
            :page-sizes="[10, 20, 50]"
            :total="inboundRecords.length"
            layout="sizes, prev, pager, next"
            background
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Goods, Warning } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 物料类型定义

// 入库记录类型

// 筛选条件

// 编码生成器状态

// 活动标签页
const activeTab = ref('inbound')
// 筛选条件
const filters = ref({
  code: '',
  name: '',
  category: '全部',
  supplier: '',
  location: '',
  searchBigCategory: '',
  searchMidCategory: '',
  searchSubCategory: '',
  showLowStock: false
})
// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const inboundPage = ref(1)
const inboundPageSize = ref(10)
// 导出模式
const exportMode = ref(false)
const selectedRows = ref([])
// 低库存显示
const showLowStock = ref(false)
// 编码生成器
const codeGen = ref({
  bigCategory: '',
  midCategory: '',
  subCategory: '',
  generatedCode: ''
})
const codeGenError = ref('')
const codeGenSuccess = ref('')
const copySuccess = ref(false)

// 中类选项
const midCategories = computed(() => {
  const config = {
    'SP': [
      { code: '01', name: '种质资源' },
      { code: '02', name: '肥料与土壤改良剂' },
      { code: '03', name: '农药与植保产品' }
    ],
    'EQ': [
      { code: '01', name: '农业机械' },
      { code: '03', name: '灌溉与水肥系统' }
    ],
    'OP': [
      { code: '01', name: '劳保与防护用品' },
      { code: '02', name: '日常劳动工具' }
    ],
    'PH': [
      { code: '01', name: '采收容器' }
    ],
    'IT': [
      { code: '01', name: '监测设备' }
    ]
  }
  return config[codeGen.value.bigCategory] || []
})

// 小类选项
const subCategories = computed(() => {
  const config = {
    'SP': {
      '01': [
        { code: '001', name: '粮食作物种子' },
        { code: '002', name: '经济作物种子' },
        { code: '003', name: '蔬菜种子' },
        { code: '004', name: '蔬菜种苗' }
      ],
      '02': [
        { code: '001', name: '有机肥' },
        { code: '002', name: '化学肥料' },
        { code: '003', name: '水溶肥' }
      ],
      '03': [
        { code: '001', name: '杀虫剂' },
        { code: '002', name: '杀菌剂' }
      ]
    },
    'EQ': {
      '01': [
        { code: '001', name: '耕作机械' },
        { code: '002', name: '播种/移栽设备' },
        { code: '003', name: '植保机械' }
      ],
      '03': [
        { code: '006', name: '灌溉终端' }
      ]
    },
    'OP': {
      '01': [
        { code: '001', name: '足部防护' }
      ],
      '02': [
        { code: '001', name: '手动农具' }
      ]
    },
    'PH': {
      '01': [
        { code: '001', name: '包装材料' },
        { code: '002', name: '纸箱' },
        { code: '003', name: '周转箱' }
      ]
    },
    'IT': {
      '01': [
        { code: '001', name: '传感器' }
      ]
    }
  }
  return config[codeGen.value.bigCategory]?.[codeGen.value.midCategory] || []
})

// 模拟物料数据
const materials = ref([
  { id, code: 'SP0101001', name: '水稻种子', category: '种质资源-粮食作物种子', unit: '袋', quantity, minStock, maxStock, price: '30元', supplier: '金种子业公司', location: 'A区-01', specification: '25kg/袋', barcode: '6932456789012', batchNo: 'PC20260301', productionDate: '2026-01-15', expiryDate: '2027-01-15', lastUpdateTime: '2026-03-20 10:30:00', dataStatus: '启用' },
  { id, code: 'SP0102001', name: '棉花种子', category: '种质资源-经济作物种子', unit: '袋', quantity, minStock, maxStock, price: '25元', supplier: '丰收种业', location: 'A区-02', specification: '20kg/袋', barcode: '6932456789013', batchNo: 'PC20260220', productionDate: '2026-02-01', expiryDate: '2027-02-01', lastUpdateTime: '2026-03-19 14:20:00', dataStatus: '启用' },
  { id, code: 'SP0103001', name: '番茄种子', category: '种质资源-蔬菜种子', unit: '袋', quantity, minStock, maxStock, price: '25元', supplier: '鑫源农资公司', location: 'A区-03', specification: '10g/袋', barcode: '6932456789014', batchNo: 'PC20260305', productionDate: '2026-02-20', expiryDate: '2026-08-20', lastUpdateTime: '2026-03-18 09:15:00', dataStatus: '启用' },
  { id, code: 'SP0201001', name: '商品有机肥', category: '肥料与土壤改良剂-有机肥', unit: '袋', quantity, minStock, maxStock, price: '45元', supplier: '丰达化肥厂', location: 'B区-01', specification: '40kg/袋', barcode: '6932456789015', batchNo: 'PC20260110', productionDate: '2026-01-10', expiryDate: '2026-07-10', lastUpdateTime: '2026-03-20 08:00:00', dataStatus: '启用' },
  { id, code: 'SP0202001', name: '尿素', category: '肥料与土壤改良剂-化学肥料', unit: '袋', quantity, minStock, maxStock, price: '80元', supplier: '丰达化肥厂', location: 'B区-02', specification: '50kg/袋', barcode: '6932456789016', batchNo: 'PC20260228', productionDate: '2026-02-28', expiryDate: '2028-02-28', lastUpdateTime: '2026-03-17 16:45:00', dataStatus: '启用' },
  { id, code: 'SP0301001', name: '吡虫啉', category: '农药与植保产品-杀虫剂', unit: '箱', quantity, minStock, maxStock, price: '120元', supplier: '绿叶农业用品店', location: 'C区-01', specification: '100g/瓶', barcode: '6932456789017', batchNo: 'PC20251215', productionDate: '2025-12-15', expiryDate: '2027-12-15', lastUpdateTime: '2026-03-16 11:30:00', dataStatus: '启用' },
  { id, code: 'SP0302001', name: '多菌灵', category: '农药与植保产品-杀菌剂', unit: '箱', quantity, minStock, maxStock, price: '150元', supplier: '绿叶农业用品店', location: 'C区-02', specification: '200g/瓶', barcode: '6932456789018', batchNo: 'PC20251120', productionDate: '2025-11-20', expiryDate: '2027-11-20', lastUpdateTime: '2026-03-15 13:20:00', dataStatus: '停用' },
  { id, code: 'EQ0103001', name: '电动喷雾机', category: '农业机械-植保机械', unit: '台', quantity, minStock, maxStock, price: '280元', supplier: '农机设备公司', location: 'D区-01', specification: '3W-16L', barcode: '6932456789019', batchNo: 'EQ20260301', productionDate: '2026-02-15', expiryDate: '2031-02-15', lastUpdateTime: '2026-03-14 10:00:00', dataStatus: '启用' },
  { id, code: 'EQ0306001', name: '滴灌带', category: '灌溉与水肥系统-灌溉终端', unit: '卷', quantity, minStock, maxStock, price: '25元', supplier: '节水灌溉设备厂', location: 'E区-01', specification: 'D16-2.0L/h', barcode: '6932456789020', batchNo: 'EQ20260125', productionDate: '2026-01-25', expiryDate: '2031-01-25', lastUpdateTime: '2026-03-13 15:30:00', dataStatus: '启用' },
  { id, code: 'OP0102001', name: '劳保胶靴', category: '劳保与防护用品-足部防护', unit: '双', quantity, minStock, maxStock, price: '35元', supplier: '劳保用品商店', location: 'F区-01', specification: '39-43码', barcode: '6932456789021', batchNo: 'OP20260201', productionDate: '2026-02-01', expiryDate: '2028-02-01', lastUpdateTime: '2026-03-12 09:45:00', dataStatus: '启用' },
  { id, code: 'OP0201001', name: '锄头', category: '日常劳动工具-手动农具', unit: '把', quantity, minStock, maxStock, price: '18元', supplier: '五金工具店', location: 'F区-02', specification: '1.2kg', barcode: '6932456789022', batchNo: 'OP20260115', productionDate: '2026-01-15', expiryDate: '2031-01-15', lastUpdateTime: '2026-03-11 14:00:00', dataStatus: '启用' },
  { id, code: 'PH0104001', name: '塑料袋', category: '采收容器-包装材料', unit: '卷', quantity, minStock, maxStock, price: '15元', supplier: '包装材料公司', location: 'G区-01', specification: '50cm*80cm', barcode: '6932456789023', batchNo: 'PH20260210', productionDate: '2026-02-10', expiryDate: '2027-02-10', lastUpdateTime: '2026-03-10 16:20:00', dataStatus: '启用' },
  { id, code: 'IT0101001', name: '土壤温湿度传感器', category: '监测设备-传感器', unit: '个', quantity, minStock, maxStock, price: '150元', supplier: '智慧农业设备商', location: 'H区-01', specification: 'RS485 Modbus', barcode: '6932456789024', batchNo: 'IT20260308', productionDate: '2026-03-08', expiryDate: '2031-03-08', lastUpdateTime: '2026-03-20 17:00:00', dataStatus: '启用' }
])

// 模拟入库记录
const inboundRecords = ref([
  { id, code: 'RK20260401-001', inboundDate: '2026-04-01', supplier: '鑫源农资公司', operator: '张伟', status: 'pending', materials: [] },
  { id, code: 'RK20260328-002', inboundDate: '2026-03-28', supplier: '丰达化肥厂', operator: '李明', status: 'pending', materials: [] },
  { id, code: 'RK20260325-003', inboundDate: '2026-03-25', supplier: '绿叶农业用品店', operator: '王建', status: 'pending', materials: [] },
  { id, code: 'RK20260311-004', inboundDate: '2026-03-11', supplier: '劳保用品商店', operator: '李明', status: 'pending', materials: [] },
  { id, code: 'RK20260402-005', inboundDate: '2026-04-02', supplier: '华东农机销售中心', operator: '张伟', status: 'pending', materials: [] },
  { id, code: 'RK20260403-006', inboundDate: '2026-04-03', supplier: '蔬菜种苗培育基地', operator: '赵敏', status: 'pending', materials: [] },
  { id, code: 'RK20260320-007', inboundDate: '2026-03-20', supplier: '农机设备公司', operator: '张伟', status: 'completed', materials: [] },
  { id, code: 'RK20260315-008', inboundDate: '2026-03-15', supplier: '包装材料公司', operator: '王建', status: 'completed', materials: [] },
  { id, code: 'RK20260312-009', inboundDate: '2026-03-12', supplier: '丰和复合肥厂', operator: '李明', status: 'completed', materials: [] },
  { id, code: 'RK20260309-010', inboundDate: '2026-03-09', supplier: '智慧农业设备厂', operator: '张伟', status: 'voided', materials: [] }
])

// 低库存数量
const lowStockCount = computed(() => {
  return materials.value.filter(m => m.quantity < m.minStock).length
})

// 筛选后的物料
const filteredMaterials = computed(() => {
  return materials.value.filter(m => {
    const matchCode = !filters.value.code || m.code.includes(filters.value.code)
    const matchName = !filters.value.name || m.name.includes(filters.value.name)
    const matchCategory = filters.value.category === '全部' || !filters.value.category || m.category.includes(filters.value.category)
    const matchSupplier = !filters.value.supplier || m.supplier.includes(filters.value.supplier)
    const matchLocation = !filters.value.location || m.location.includes(filters.value.location)
    const matchLowStock = !showLowStock.value || m.quantity < m.minStock
    return matchCode && matchName && matchCategory && matchSupplier && matchLocation && matchLowStock
  })
})

// 分页后的物料
const paginatedMaterials = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredMaterials.value.slice(start, end)
})

// 总页数
const totalPages = computed(() => Math.ceil(filteredMaterials.value.length / pageSize.value))

// 入库记录分页
const paginatedInboundRecords = computed(() => {
  const start = (inboundPage.value - 1) * inboundPageSize.value
  const end = start + inboundPageSize.value
  return inboundRecords.value.slice(start, end)
})

const inboundTotalPages = computed(() => Math.ceil(inboundRecords.value.length / inboundPageSize.value))

// 切换标签页
const setActiveTab = (tab) => {
  activeTab.value = tab
  currentPage.value = 1
}

// 重置筛选
const handleReset = () => {
  filters.value = {
    code: '',
    name: '',
    category: '全部',
    supplier: '',
    location: '',
    searchBigCategory: '',
    searchMidCategory: '',
    searchSubCategory: '',
    showLowStock: false
  }
  showLowStock.value = false
  currentPage.value = 1
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
}

// 低库存按钮点击
const handleLowStockClick = () => {
  showLowStock.value = !showLowStock.value
  currentPage.value = 1
}

// 编码生成器分类变化
const handleCodeGenCategoryChange = (level) => {
  if (level === 'big') {
    codeGen.value.midCategory = ''
    codeGen.value.subCategory = ''
    codeGen.value.generatedCode = ''
  } else if (level === 'mid') {
    codeGen.value.subCategory = ''
    codeGen.value.generatedCode = ''
  }
}

// 生成编码
const handleCodeGen = () => {
  if (!codeGen.value.bigCategory || !codeGen.value.midCategory || !codeGen.value.subCategory) {
    codeGenError.value = '请选择完整的分类'
    codeGenSuccess.value = ''
    return
  }
  const baseCode = `${codeGen.value.bigCategory}${codeGen.value.midCategory}${codeGen.value.subCategory}`
  const seq = Math.floor(Math.random() * 999) + 1
  codeGen.value.generatedCode = `${baseCode}${String(seq).padStart(3, '0')}`
  codeGenSuccess.value = `生成成功: ${codeGen.value.generatedCode}`
  codeGenError.value = ''
}

// 复制编码
const handleCopyCode = async () => {
  if (codeGen.value.generatedCode) {
    await navigator.clipboard.writeText(codeGen.value.generatedCode)
    copySuccess.value = true
    setTimeout(() => {
      copySuccess.value = false
    }, 2000)
  }
}

// 重置编码生成器
const handleCodeGenReset = () => {
  codeGen.value = {
    bigCategory: '',
    midCategory: '',
    subCategory: '',
    generatedCode: ''
  }
  codeGenError.value = ''
  codeGenSuccess.value = ''
}

// 获取状态类型
const getStatusType = (status) => {
  const map = {
    pending: 'warning',
    completed: 'success',
    voided: 'info'
  }
  return map[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const map = {
    pending: '待审核',
    completed: '已完成',
    voided: '已作废'
  }
  return map[status] || status
}

// 选择变化
const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

// 查看
const handleView = (row) => {
  ElMessage.info(`查看物料: ${row.name}`)
}

// 编辑
const handleEdit = (row) => {
  ElMessage.info(`编辑物料: ${row.name}`)
}

// 查看入库记录
const handleViewRecord = (row) => {
  ElMessage.info(`查看入库记录: ${row.code}`)
}

// 编辑入库记录
const handleEditRecord = (row) => {
  ElMessage.info(`编辑入库记录: ${row.code}`)
}
</script>
