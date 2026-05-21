<template>
  <div class="p-6 space-y-4">
    <!-- 标题卡片 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
          <el-icon :size="24" class="text-white">
            <TreePine />
          </el-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">种植管理</h1>
          <p class="text-gray-500">管理种植批次、生产计划和技术方案</p>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <PlantingStats :data="statsData" />

    <!-- 筛选工具栏 -->
    <PlantingFilterToolbar
      :filters="filters"
      :crop-names="cropNames"
      :areas="areas"
      :status-options="statusOptions"
      @update:filters="filters = $event"
      @search="handleSearch"
      @reset="handleReset"
      @add="addModalOpen = true"
    />

    <!-- 加载状态 -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="flex items-center gap-3">
        <div class="w-6 h-6 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <span class="text-gray-500">加载中...</span>
      </div>
    </div>

    <!-- 数据表格 -->
    <PlantingTable
      v-else
      :data="filteredData"
      :can-create="canCreate"
      :can-edit="canEdit"
      :can-delete="canDelete"
      :can-export="canExport"
      :can-print="canPrint"
      @add="addModalOpen = true"
      @edit="handleEdit"
      @detail="handleDetail"
      @harvest="handleHarvest"
      @delete="handleDelete"
      @export="handleExportClick"
      @print="handlePrint"
      @label-detail="handleLabelDetail"
      @move="handleMove"
    />

    <!-- 弹窗区域 -->
    <!-- 新增弹窗 -->
    <el-dialog v-model="addModalOpen" title="新增种植记录" width="800px" destroy-on-close>
      <el-form :model="addForm" label-width="100px">
        <el-form-item label="作物品种">
          <el-select v-model="addForm.cropName" placeholder="请选择" class="w-full">
            <el-option v-for="c in cropNames" :key="c.value" :label="c.label" :value="c.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="种植区域">
          <el-select v-model="addForm.areaName" placeholder="请选择" class="w-full">
            <el-option v-for="a in areas" :key="a.value" :label="a.label" :value="a.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="种植数量">
          <el-input-number v-model="addForm.plantingCount" :min="1" class="w-full" />
        </el-form-item>
        <el-form-item label="种植日期">
          <el-date-picker v-model="addForm.plantingDate" type="date" format="YYYY-MM-DD" value-format="YYYY-MM-DD" class="w-full" />
        </el-form-item>
        <el-form-item label="土壤PH">
          <el-input-number v-model="addForm.soilPH" :min="0" :max="14" :precision="1" class="w-full" />
        </el-form-item>
        <el-form-item label="土壤EC">
          <el-input-number v-model="addForm.soilEC" :min="0" :precision="2" class="w-full" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="addForm.remarks" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addModalOpen = false">取消</el-button>
        <el-button type="primary" @click="handleAddSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 编辑弹窗 -->
    <el-dialog v-model="editModalOpen" title="编辑种植记录" width="800px" destroy-on-close>
      <el-form v-if="currentRecord" :model="editForm" label-width="100px">
        <el-form-item label="种植批号">
          <el-input v-model="editForm.plantCode" disabled />
        </el-form-item>
        <el-form-item label="作物品种">
          <el-input v-model="editForm.cropName" disabled />
        </el-form-item>
        <el-form-item label="种植数量">
          <el-input-number v-model="editForm.plantingCount" :min="1" class="w-full" />
        </el-form-item>
        <el-form-item label="土壤PH">
          <el-input-number v-model="editForm.soilPH" :min="0" :max="14" :precision="1" class="w-full" />
        </el-form-item>
        <el-form-item label="土壤EC">
          <el-input-number v-model="editForm.soilEC" :min="0" :precision="2" class="w-full" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="editForm.remarks" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editModalOpen = false">取消</el-button>
        <el-button type="primary" @click="handleEditSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailModalOpen" title="种植详情" width="700px" destroy-on-close>
      <el-descriptions v-if="currentRecord" :column="2" border>
        <el-descriptions-item label="种植批号">{{ currentRecord.plantCode }}</el-descriptions-item>
        <el-descriptions-item label="作物品种">{{ currentRecord.cropName }}</el-descriptions-item>
        <el-descriptions-item label="种植区域">{{ currentRecord.areaName }}</el-descriptions-item>
        <el-descriptions-item label="种植数量">{{ currentRecord.plantingCount }}</el-descriptions-item>
        <el-descriptions-item label="种植日期">{{ currentRecord.plantingDate }}</el-descriptions-item>
        <el-descriptions-item label="土壤PH">{{ currentRecord.soilPH || '-' }}</el-descriptions-item>
        <el-descriptions-item label="土壤EC">{{ currentRecord.soilEC || '-' }}</el-descriptions-item>
        <el-descriptions-item label="损耗率">{{ currentRecord.attritionRate ? `${currentRecord.attritionRate}%` : '-' }}</el-descriptions-item>
        <el-descriptions-item label="已采收">{{ currentRecord.harvestQuantity || 0 }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ statusLabelMap[currentRecord.status] || currentRecord.status }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ currentRecord.remarks || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 采收弹窗 -->
    <el-dialog v-model="harvestModalOpen" title="采收登记" width="600px" destroy-on-close>
      <el-form v-if="currentRecord" :model="harvestForm" label-width="100px">
        <el-form-item label="种植批号">
          <el-input v-model="currentRecord.plantCode" disabled />
        </el-form-item>
        <el-form-item label="可采收量">
          <el-input :value="`${currentRecord.plantingCount - (currentRecord.harvestQuantity || 0)}`" disabled />
        </el-form-item>
        <el-form-item label="采收数量">
          <el-input-number v-model="harvestForm.harvestQuantity" :min="1" class="w-full" />
        </el-form-item>
        <el-form-item label="采收日期">
          <el-date-picker v-model="harvestForm.harvestDate" type="date" format="YYYY-MM-DD" value-format="YYYY-MM-DD" class="w-full" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="harvestForm.remarks" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="harvestModalOpen = false">取消</el-button>
        <el-button type="primary" @click="handleHarvestSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 导出格式选择弹窗 -->
    <el-dialog v-model="showExportModal" title="导出数据" width="400px">
      <el-form label-width="100px">
        <el-form-item label="导出格式">
          <el-radio-group v-model="exportFormat">
            <el-radio label="xlsx">Excel</el-radio>
            <el-radio label="csv">CSV</el-radio>
            <el-radio label="word">Word</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showExportModal = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmExport">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Crop } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import PlantingStats from '@/components/farm/planting/components/PlantingStats.vue'
import PlantingFilterToolbar from '@/components/farm/planting/PlantingFilterToolbar.vue'
import PlantingTable from '@/components/farm/planting/PlantingTable.vue'
import {  Planting  } from '@/types/crop'

// 权限设置（已取消，直接设置为 true）
const canCreate = ref(true)
const canEdit = ref(true)
const canDelete = ref(true)
const canExport = ref(true)
const canPrint = ref(true)

// 统计数据

const statsData = ref({
  total,
  growing,
  harvested,
  monthCount: 0
})

// 筛选条件

const filters = ref({
  cropName: '',
  plantCode: '',
  sourceCode: '',
  areaName: '',
  isHarvest: '',
  startDate: '',
  endDate: '',
  transplantDate: '',
  createBy: '',
  orgName: '',
  countMin,
  countMax,
})

// 加载状态
const loading = ref(false)

// 模拟数据
const mockData = ref([
  {
    id: '1',
    plantCode: 'ZZ202405001',
    productionPlanCode: 'SC202405001',
    cropName: '番茄',
    areaName: '1号棚',
    plantingCount,
    plantingDate: '2024-05-01',
    soilPH: 6.5,
    soilEC: 2.3,
    attritionRate: 2.5,
    harvestQuantity,
    unit: '株',
    status: 'growing',
    isHarvest,
    remarks: ''
  },
  {
    id: '2',
    plantCode: 'ZZ202405002',
    cropName: '黄瓜',
    areaName: '2号棚',
    plantingCount,
    plantingDate: '2024-05-03',
    soilPH: 6.8,
    soilEC: 2.1,
    attritionRate: 1.5,
    harvestQuantity,
    unit: '株',
    status: 'harvested',
    isHarvest,
    remarks: ''
  }
])

// 下拉选项
const cropNames = ref([
  { value: '番茄', label: '番茄' },
  { value: '黄瓜', label: '黄瓜' },
  { value: '辣椒', label: '辣椒' },
  { value: '草莓', label: '草莓' },
])

const areas = ref([
  { value: '1号棚', label: '1号棚' },
  { value: '2号棚', label: '2号棚' },
  { value: '3号棚', label: '3号棚' },
])

const statusOptions = ref([
  { value: 'planted', label: '已定植' },
  { value: 'growing', label: '生长期' },
  { value: 'harvested', label: '已采收' },
  { value: 'cancelled', label: '已取消' },
])

// 筛选后的数据
const filteredData = computed(() => {
  return mockData.value.filter(item => {
    if (filters.value.cropName && !item.cropName.includes(filters.value.cropName)) return false
    if (filters.value.plantCode && !item.plantCode.includes(filters.value.plantCode)) return false
    if (filters.value.isHarvest && String(item.isHarvest) !== filters.value.isHarvest) return false
    return true
  })
})

// 统计数据计算
const updateStats = () => {
  const data = filteredData.value
  statsData.value = {
    total: data.length,
    growing: data.filter(p => p.status === 'growing' || p.status === 'planted').length,
    harvested: data.filter(p => p.status === 'harvested').length,
    monthCount: data.length
  }
}

// 弹窗状态
const addModalOpen = ref(false)
const editModalOpen = ref(false)
const detailModalOpen = ref(false)
const harvestModalOpen = ref(false)
const showExportModal = ref(false)

// 当前选中的记录
const currentRecord = ref(null)

// 表单数据
const addForm = ref({
  cropName: '',
  areaName: '',
  plantingCount,
  plantingDate: '',
  soilPH: undefined | undefined,
  soilEC: undefined | undefined,
  remarks: ''
})

const editForm = ref({
  plantCode: '',
  cropName: '',
  plantingCount,
  soilPH: undefined | undefined,
  soilEC: undefined | undefined,
  remarks: ''
})

const harvestForm = ref({
  harvestQuantity,
  harvestDate: '',
  remarks: ''
})

// 导出格式
const exportFormat = ref('xlsx')

// 状态标签映射
const statusLabelMap = {
  planted: '已定植',
  growing: '生长期',
  harvested: '已采收',
  cancelled: '已取消'
}

// 生命周期
onMounted(() => {
  updateStats()
})

// 搜索
const handleSearch = () => {
  updateStats()
}

// 重置
const handleReset = () => {
  filters.value = {
    cropName: '',
    plantCode: '',
    sourceCode: '',
    areaName: '',
    isHarvest: '',
    startDate: '',
    endDate: '',
    transplantDate: '',
    createBy: '',
    orgName: '',
    countMin,
    countMax,
  }
  updateStats()
}

// 编辑
const handleEdit = (record) => {
  currentRecord.value = record
  editForm.value = {
    plantCode: record.plantCode,
    cropName: record.cropName,
    plantingCount: record.plantingCount,
    soilPH: record.soilPH,
    soilEC: record.soilEC,
    remarks: record.remarks || ''
  }
  editModalOpen.value = true
}

// 详情
const handleDetail = (record) => {
  currentRecord.value = record
  detailModalOpen.value = true
}

// 采收
const handleHarvest = (record) => {
  currentRecord.value = record
  harvestForm.value = {
    harvestQuantity,
    harvestDate: new Date().toISOString().slice(0, 10),
    remarks: ''
  }
  harvestModalOpen.value = true
}

// 删除
const handleDelete = async (ids) => {
  try {
    await ElMessageBox.confirm('确定要删除选中的记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    mockData.value = mockData.value.filter(item => !ids.includes(item.id))
    updateStats()
    ElMessage.success('删除成功')
  } catch {
    // 取消删除
  }
}

// 新增提交
const handleAddSubmit = () => {
  const newRecord = {
    id: Date.now().toString(),
    plantCode: `ZZ${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
    cropName: addForm.value.cropName,
    areaName: addForm.value.areaName,
    plantingCount: addForm.value.plantingCount,
    plantingDate: addForm.value.plantingDate,
    soilPH: addForm.value.soilPH,
    soilEC: addForm.value.soilEC,
    attritionRate,
    harvestQuantity,
    unit: '株',
    status: 'planted',
    isHarvest,
    remarks: addForm.value.remarks
  }
  mockData.value.unshift(newRecord)
  addModalOpen.value = false
  updateStats()
  ElMessage.success('新增成功')
}

// 编辑提交
const handleEditSubmit = () => {
  if (!currentRecord.value) return
  const index = mockData.value.findIndex(item => item.id === currentRecord.value.id)
  if (index !== -1) {
    mockData.value[index] = {
      ...mockData.value[index],
      plantingCount: editForm.value.plantingCount,
      soilPH: editForm.value.soilPH,
      soilEC: editForm.value.soilEC,
      remarks: editForm.value.remarks
    }
  }
  editModalOpen.value = false
  updateStats()
  ElMessage.success('修改成功')
}

// 采收提交
const handleHarvestSubmit = () => {
  if (!currentRecord.value) return
  const index = mockData.value.findIndex(item => item.id === currentRecord.value.id)
  if (index !== -1) {
    mockData.value[index] = {
      ...mockData.value[index],
      harvestQuantity: (mockData.value[index].harvestQuantity || 0) + harvestForm.value.harvestQuantity,
      isHarvest,
      status: 'harvested'
    }
  }
  harvestModalOpen.value = false
  updateStats()
  ElMessage.success('采收登记成功')
}

// 导出点击
const handleExportClick = () => {
  showExportModal.value = true
}

// 确认导出
const handleConfirmExport = () => {
  ElMessage.info(`导出格式: ${exportFormat.value}`)
  showExportModal.value = false
}

// 标签详情
const handleLabelDetail = (record) => {
  ElMessage.info(`标签详情: ${record.plantCode}`)
}

// 移动
const handleMove = (record) => {
  ElMessage.info(`移动操作: ${record.plantCode}`)
}
</script>
