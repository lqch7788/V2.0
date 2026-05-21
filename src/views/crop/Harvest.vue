<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
          <el-icon :size="24" class="text-white">
            <OfficeBuilding />
          </el-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">采收入库</h1>
          <p class="text-gray-500">管理采收记录、品质分级和入库操作</p>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <HarvestStatsCards :records="harvestRecords" />

    <!-- 筛选工具栏 -->
    <HarvestFilterToolbar
      :filters="searchFilters"
      :greenhouses="greenhouses"
      :warehouse-options="warehouseOptions"
      @update:filters="searchFilters = $event"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- 表格工具栏 -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900">采收入库记录表</h3>
        <div class="flex gap-2">
          <el-button v-if="canCreate" type="primary" size="small" @click="isCreateModalOpen = true">
            <el-icon><Plus /></el-icon>
            新增
          </el-button>
          <el-button v-if="canEdit" type="primary" size="small" @click="handleBatchEdit">
            <el-icon><Edit /></el-icon>
            编辑
          </el-button>
          <el-button v-if="canDelete" type="danger" size="small" @click="handleBatchDelete">
            <el-icon><Delete /></el-icon>
            删除
          </el-button>
          <el-button v-if="canExport" size="small" @click="handleExport">
            <el-icon><Download /></el-icon>
            导出
          </el-button>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="flex items-center gap-3">
          <div class="w-6 h-6 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span class="text-gray-500">加载中...</span>
        </div>
      </div>

      <!-- 数据表格 -->
      <HarvestTable
        v-else
        :records="filteredRecords"
        @view-detail="handleViewDetail"
      />

      <!-- 分页 -->
      <div class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
        <span class="text-sm text-gray-500">共 {{ filteredRecords.length }} 条</span>
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="filteredRecords.length"
          layout="sizes, prev, pager, next"
          background
        />
      </div>
    </div>

    <!-- 新增采收记录弹窗 -->
    <el-dialog v-model="isCreateModalOpen" title="新增采收记录" width="900px" destroy-on-close>
      <el-form :model="newRecord" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="采收批次">
              <el-select v-model="newRecord.batchCode" placeholder="请选择" class="w-full">
                <el-option v-for="b in cropBatches" :key="b.batchCode" :label="b.batchCode" :value="b.batchCode" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="采收单号">
              <el-input v-model="newRecord.harvestCode" placeholder="点击生成" class="w-full">
                <template #append>
                  <el-button @click="generateHarvestCode">生成</el-button>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="采收区域">
              <el-select v-model="newRecord.greenhouseId" placeholder="请选择" class="w-full">
                <el-option v-for="g in greenhouses" :key="g.id" :label="g.name" :value="g.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="入库仓库">
              <el-select v-model="newRecord.warehouseId" placeholder="请选择" class="w-full">
                <el-option v-for="w in warehouseOptions" :key="w.value" :label="w.label" :value="w.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="采收时间">
              <el-date-picker v-model="newRecord.harvestDate" type="datetime" format="YYYY-MM-DD HH:mm" value-format="YYYY-MM-DD HH:mm" class="w-full" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="采收人员">
              <el-select v-model="newRecord.harvesterIds" multiple placeholder="请选择" class="w-full">
                <el-option v-for="u in users" :key="u.id" :label="u.name" :value="u.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="单价(元/kg)">
              <el-input-number v-model="newRecord.unitPrice" :min="0" :precision="2" class="w-full" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="审核人员">
              <el-input v-model="newRecord.auditor" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注">
          <el-input v-model="newRecord.remarks" type="textarea" :rows="3" />
        </el-form-item>

        <!-- 产品明细 -->
        <el-divider>产品明细</el-divider>
        <div v-for="(product, index) in newRecord.products" :key="index" class="mb-4 p-4 bg-gray-50 rounded">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="品种">
                <el-input v-model="product.variety" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="采收量">
                <el-input-number v-model="product.harvestQuantity" :min="0" class="w-full" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="品质等级">
                <el-select v-model="product.grade" class="w-full">
                  <el-option label="A级" value="A" />
                  <el-option label="B级" value="B" />
                  <el-option label="C级" value="C" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-button type="danger" size="small" @click="handleRemoveProduct(index)">删除</el-button>
        </div>
        <el-button type="primary" plain @click="handleAddProduct">添加产品</el-button>
      </el-form>
      <template #footer>
        <el-button @click="isCreateModalOpen = false">取消</el-button>
        <el-button type="primary" @click="handleCreateRecord">确定</el-button>
      </template>
    </el-dialog>

    <!-- 详情弹窗 -->
    <el-dialog v-model="showDetailModal" title="采收详情" width="800px" destroy-on-close>
      <el-descriptions v-if="selectedDetailRecord" :column="2" border>
        <el-descriptions-item label="采收单号">{{ selectedDetailRecord.harvestCode }}</el-descriptions-item>
        <el-descriptions-item label="采收时间">{{ selectedDetailRecord.harvestDate }}</el-descriptions-item>
        <el-descriptions-item label="采收区域">{{ selectedDetailRecord.greenhouseName }}</el-descriptions-item>
        <el-descriptions-item label="入库仓库">{{ selectedDetailRecord.warehouseName }}</el-descriptions-item>
        <el-descriptions-item label="采收人员">{{ (selectedDetailRecord.harvesterNames || []).join(', ') }}</el-descriptions-item>
        <el-descriptions-item label="单价">{{ selectedDetailRecord.unitPrice ? `${selectedDetailRecord.unitPrice.toFixed(2)} 元/kg` : '-' }}</el-descriptions-item>
        <el-descriptions-item label="总收入">{{ selectedDetailRecord.totalAmount ? `${selectedDetailRecord.totalAmount.toFixed(2)} 元` : '-' }}</el-descriptions-item>
        <el-descriptions-item label="品质等级">{{ selectedDetailRecord.grade || 'A' }}级</el-descriptions-item>
        <el-descriptions-item label="采收量">{{ selectedDetailRecord.harvestQuantity }} {{ selectedDetailRecord.unit || 'kg' }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="statusTypeMap[selectedDetailRecord.status] || 'info'" size="small">
            {{ statusLabelMap[selectedDetailRecord.status] || selectedDetailRecord.status }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="审核人员">{{ selectedDetailRecord.auditor || '-' }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ selectedDetailRecord.remarks || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 导出格式选择弹窗 -->
    <el-dialog v-model="showExportModal" title="导出数据" width="400px">
      <el-form label-width="100px">
        <el-form-item label="导出格式">
          <el-radio-group v-model="exportFormat">
            <el-radio label="excel">Excel</el-radio>
            <el-radio label="csv">CSV</el-radio>
            <el-radio label="word">Word</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showExportModal = false">取消</el-button>
        <el-button type="primary" @click="handleDoExport">确定</el-button>
      </template>
    </el-dialog>

    <!-- 删除确认弹窗 -->
    <el-dialog v-model="showDeleteWarning" title="确认删除" width="400px">
      <p>确定要删除选中的 {{ selectedRows.length }} 条记录吗？此操作不可恢复。</p>
      <template #footer>
        <el-button @click="showDeleteWarning = false">取消</el-button>
        <el-button type="danger" @click="handleConfirmBatchDelete">确认删除</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { OfficeBuilding, Plus, Edit, Delete, Download } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import HarvestStatsCards from '@/components/farm/harvest/components/HarvestStatsCards.vue'
import HarvestFilterToolbar from '@/components/farm/harvest/HarvestFilterToolbar.vue'
import HarvestTable from '@/components/farm/harvest/HarvestTable.vue'

// 权限设置（已取消，直接设置为 true）
const canCreate = ref(true)
const canEdit = ref(true)
const canDelete = ref(true)
const canExport = ref(true)

// 搜索筛选

const searchFilters = ref({
  harvestCode: '',
  batchCode: '',
  greenhouseId: '',
  cropName: '',
  grade: '',
  harvesterName: '',
  warehouseId: '',
  status: ''
})

// 分页
const currentPage = ref(1)
const pageSize = ref(10)

// 加载状态
const loading = ref(false)

// 弹窗状态
const isCreateModalOpen = ref(false)
const showDetailModal = ref(false)
const showExportModal = ref(false)
const showDeleteWarning = ref(false)

// 选中行
const selectedRows = ref([])

// 导出格式
const exportFormat = ref('excel')

// 下拉选项
const greenhouses = ref([
  { id: 'G001', name: '1号棚' },
  { id: 'G002', name: '2号棚' },
  { id: 'G003', name: '3号棚' },
])

const warehouseOptions = ref([
  { value: 'W001', label: '成品仓库' },
  { value: 'W002', label: '原料仓库' },
])

const users = ref([
  { id: 'U001', name: '张三' },
  { id: 'U002', name: '李四' },
  { id: 'U003', name: '王五' },
])

const cropBatches = ref([
  { batchCode: 'PC202405001', cropName: '番茄', variety: '大红番茄', plantingMode: '温室' },
  { batchCode: 'PC202405002', cropName: '黄瓜', variety: '水果黄瓜', plantingMode: '温室' },
])

// 状态映射
const statusTypeMap = {
  pending: 'info',
  harvesting: 'warning',
  harvested: 'success',
  graded: 'primary',
  stored: 'success'
}

const statusLabelMap = {
  pending: '待采收',
  harvesting: '采收中',
  harvested: '已采收',
  graded: '已分级',
  stored: '已入库'
}

// 采收记录数据

const harvestRecords = ref([
  {
    id,
    harvestCode: 'HS20240521001',
    batchCode: 'PC202405001',
    cropName: '番茄',
    greenhouseId: 'G001',
    greenhouseName: '1号棚',
    harvestDate: '2024-05-21 10:30',
    harvestQuantity,
    unit: 'kg',
    grade: 'A',
    warehouseId: 'W001',
    warehouseName: '成品仓库',
    harvesterIds: ['U001', 'U002'],
    harvesterNames: ['张三', '李四'],
    status: 'harvested',
    remarks: '',
    auditor: '管理员',
    variety: '大红番茄',
    plantingMode: '温室',
    targetYield,
    unitPrice: 3.5,
    totalAmount: 1750
  },
  {
    id,
    harvestCode: 'HS20240520002',
    batchCode: 'PC202405002',
    cropName: '黄瓜',
    greenhouseId: 'G002',
    greenhouseName: '2号棚',
    harvestDate: '2024-05-20 15:00',
    harvestQuantity,
    unit: 'kg',
    grade: 'A',
    warehouseId: 'W001',
    warehouseName: '成品仓库',
    harvesterIds: ['U003'],
    harvesterNames: ['王五'],
    status: 'stored',
    remarks: '',
    auditor: '管理员',
    variety: '水果黄瓜',
    plantingMode: '温室',
    targetYield,
    unitPrice: 2.8,
    totalAmount: 840
  }
])

// 新增表单
const newRecord = ref({
  harvestCode: '',
  batchCode: '',
  greenhouseId: '',
  harvestDate: new Date().toISOString().slice(0, 16),
  warehouseId: '',
  harvesterIds: [],
  auditor: '管理员',
  remarks: '',
  unitPrice,
  products: []
})

// 详情记录
const selectedDetailRecord = ref(null)

// 筛选后的记录
const filteredRecords = computed(() => {
  return harvestRecords.value.filter(record => {
    if (searchFilters.value.harvestCode && !record.harvestCode.startsWith(searchFilters.value.harvestCode)) return false
    if (searchFilters.value.batchCode && !record.batchCode.startsWith(searchFilters.value.batchCode)) return false
    if (searchFilters.value.greenhouseId && record.greenhouseId !== searchFilters.value.greenhouseId) return false
    if (searchFilters.value.cropName && !record.cropName.startsWith(searchFilters.value.cropName)) return false
    if (searchFilters.value.grade && record.grade !== searchFilters.value.grade) return false
    if (searchFilters.value.warehouseId && record.warehouseId !== searchFilters.value.warehouseId) return false
    if (searchFilters.value.status && record.status !== searchFilters.value.status) return false
    return true
  })
})

// 生命周期
onMounted(() => {
  // 初始化
})

// 搜索
const handleSearch = () => {
  currentPage.value = 1
}

// 重置
const handleReset = () => {
  searchFilters.value = {
    harvestCode: '',
    batchCode: '',
    greenhouseId: '',
    cropName: '',
    grade: '',
    harvesterName: '',
    warehouseId: '',
    status: ''
  }
  currentPage.value = 1
}

// 详情
const handleViewDetail = (record) => {
  selectedDetailRecord.value = record
  showDetailModal.value = true
}

// 生成采收单号
const generateHarvestCode = () => {
  const date = new Date()
  const code = `HS${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
  newRecord.value.harvestCode = code
}

// 添加产品
const handleAddProduct = () => {
  newRecord.value.products.push({
    variety: '',
    harvestQuantity,
    grade: 'A'
  })
}

// 删除产品
const handleRemoveProduct = (index) => {
  newRecord.value.products.splice(index, 1)
}

// 创建记录
const handleCreateRecord = () => {
  if (!newRecord.value.batchCode) {
    ElMessage.warning('请选择采收批次')
    return
  }
  if (!newRecord.value.harvestCode) {
    ElMessage.warning('请生成采收单号')
    return
  }

  const selectedBatch = cropBatches.value.find(b => b.batchCode === newRecord.value.batchCode)
  const selectedGreenhouse = greenhouses.value.find(g => g.id === newRecord.value.greenhouseId)
  const selectedWarehouse = warehouseOptions.value.find(w => w.value === newRecord.value.warehouseId)
  const selectedUsers = users.value.filter(u => newRecord.value.harvesterIds.includes(u.id))

  const totalQuantity = newRecord.value.products.reduce((sum, p) => sum + (p.harvestQuantity || 0), 0)

  const record = {
    id: Date.now(),
    harvestCode: newRecord.value.harvestCode,
    batchCode: newRecord.value.batchCode,
    cropName: selectedBatch?.cropName || '',
    greenhouseId: newRecord.value.greenhouseId,
    greenhouseName: selectedGreenhouse?.name || '',
    harvestDate: newRecord.value.harvestDate,
    harvestQuantity: totalQuantity || 0,
    unit: 'kg',
    grade: newRecord.value.products[0]?.grade || 'A',
    warehouseId: newRecord.value.warehouseId,
    warehouseName: selectedWarehouse?.label || '',
    harvesterIds: newRecord.value.harvesterIds,
    harvesterNames: selectedUsers.map(u => u.name),
    status: 'harvested',
    remarks: newRecord.value.remarks,
    auditor: newRecord.value.auditor,
    variety: selectedBatch?.variety || '',
    plantingMode: selectedBatch?.plantingMode || '',
    targetYield,
    unitPrice: newRecord.value.unitPrice,
    totalAmount: totalQuantity * newRecord.value.unitPrice
  }

  harvestRecords.value.unshift(record)
  isCreateModalOpen.value = false

  // 重置表单
  newRecord.value = {
    harvestCode: '',
    batchCode: '',
    greenhouseId: '',
    harvestDate: new Date().toISOString().slice(0, 16),
    warehouseId: '',
    harvesterIds: [],
    auditor: '管理员',
    remarks: '',
    unitPrice,
    products: []
  }

  ElMessage.success('新增成功')
}

// 批量编辑
const handleBatchEdit = () => {
  ElMessage.info('批量编辑功能')
}

// 批量删除
const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的记录')
    return
  }
  showDeleteWarning.value = true
}

// 确认批量删除
const handleConfirmBatchDelete = async () => {
  // 删除逻辑
  showDeleteWarning.value = false
  selectedRows.value = []
  ElMessage.success('删除成功')
}

// 导出
const handleExport = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要导出的数据')
    return
  }
  showExportModal.value = true
}

// 确认导出
const handleDoExport = () => {
  ElMessage.info(`导出格式: ${exportFormat.value}`)
  showExportModal.value = false
}
</script>
