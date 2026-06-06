<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="bg-white rounded-xl p-6 shadow-none">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center gap-3">
          <a
            href="/settings"
            class="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center hover:from-gray-200 hover:to-gray-300 transition-colors"
            title="返回系统设置"
          >
            <el-icon :size="20" color="#4b5563"><ArrowLeft /></el-icon>
          </a>
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
            <el-icon :size="24" color="white"><OfficeBuilding /></el-icon>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">仓库管理</h1>
            <p class="text-gray-500">管理仓库信息和配置</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="bg-white rounded-xl p-4 shadow-none border border-gray-100">
        <p class="text-sm text-gray-500">仓库总数</p>
        <p class="text-2xl font-bold text-gray-900 mt-1">{{ stats.total }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-none border border-gray-100">
        <p class="text-sm text-green-600">在用仓库</p>
        <p class="text-2xl font-bold text-green-600 mt-1">{{ stats.active }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-none border border-gray-100">
        <p class="text-sm text-blue-600">总容量</p>
        <p class="text-2xl font-bold text-blue-600 mt-1">{{ stats.totalCapacity.toLocaleString() }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-none border border-gray-100">
        <p class="text-sm text-emerald-600">当前库存</p>
        <p class="text-2xl font-bold text-emerald-600 mt-1">{{ stats.totalStock.toLocaleString() }}</p>
      </div>
    </div>

    <!-- 操作栏（与V1.1一致：搜索 + 刷新 + 新增） -->
    <div class="bg-white rounded-xl p-4 shadow-none">
      <div class="flex items-center justify-between gap-4">
        <div class="flex items-center gap-2 flex-1">
          <div class="relative flex-1 max-w-md">
            <el-icon class="absolute left-3 top-1/2 -translate-y-1/2" :size="16" color="#9ca3af"><Search /></el-icon>
            <el-input
              v-model="searchTerm"
              placeholder="搜索仓库名称、编码或类型..."
              clearable
            />
          </div>
        </div>
        <div class="flex items-center gap-2">
          <el-button @click="loadWarehouses" :loading="isLoading">
            <el-icon><Refresh /></el-icon> 刷新
          </el-button>
          <el-button type="primary" @click="openAddModal" style="background:linear-gradient(to right, #3b82f6, #06b6d4);border:none;">
            <el-icon><Plus /></el-icon> 新增仓库
          </el-button>
        </div>
      </div>
    </div>

    <!-- 仓库列表 -->
    <div class="grid gap-4 md:grid-cols-2">
      <div
        v-for="warehouse in filteredWarehouses"
        :key="warehouse.id"
        class="bg-white rounded-xl p-5 shadow-none border border-gray-100"
      >
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-emerald-50 rounded-lg">
              <el-icon :size="20" color="#059669"><Grid /></el-icon>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900">{{ warehouse.warehouseName || warehouse.name }}</h3>
              <p class="text-xs text-gray-500">{{ warehouse.warehouseCode || warehouse.code }}</p>
            </div>
          </div>
          <span
            :class="[
              'px-2 py-1 text-xs rounded-full',
              warehouse.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
            ]"
          >
            {{ warehouse.status === 'active' ? '启用' : '停用' }}
          </span>
        </div>
        <div class="grid grid-cols-2 gap-3 text-sm mb-3">
          <div>
            <p class="text-gray-500">类型</p>
            <p class="text-gray-900 font-medium">{{ getWarehouseTypeLabel(warehouse.warehouseType) }}</p>
          </div>
          <div>
            <p class="text-gray-500">负责人</p>
            <p class="text-gray-900 font-medium">{{ warehouse.managerName || '-' }}</p>
          </div>
          <div>
            <p class="text-gray-500">位置</p>
            <p class="text-gray-900 font-medium">{{ warehouse.location || '-' }}</p>
          </div>
          <div>
            <p class="text-gray-500">使用率</p>
            <p :class="['font-bold', getStockColor(getStockPercent(warehouse.currentStock || 0, warehouse.capacity || 0))]">
              {{ getStockPercent(warehouse.currentStock || 0, warehouse.capacity || 0) }}%
            </p>
          </div>
        </div>
        <!-- 进度条 -->
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div
            :class="[
              'h-2 rounded-full',
              getStockPercent(warehouse.currentStock || 0, warehouse.capacity || 0) >= 80
                ? 'bg-red-500'
                : getStockPercent(warehouse.currentStock || 0, warehouse.capacity || 0) >= 50
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
            ]"
            :style="{ width: `${Math.min(getStockPercent(warehouse.currentStock || 0, warehouse.capacity || 0), 100)}%` }"
          />
        </div>
        <div class="flex items-center justify-between mt-2 text-xs text-gray-500">
          <span>当前: {{ warehouse.currentStock || 0 }}</span>
          <span>容量: {{ warehouse.capacity || 0 }}</span>
        </div>
        <p v-if="warehouse.description" class="text-xs text-gray-500 mt-2">{{ warehouse.description }}</p>
        <div class="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-gray-100">
          <el-button size="small" circle @click="openEditModal(warehouse)">
            <el-icon><Edit /></el-icon>
          </el-button>
          <el-button size="small" circle type="danger" @click="handleDeleteWarehouse(warehouse.id)">
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
      </div>
    </div>

    <!-- 无数据提示 -->
    <el-empty v-if="filteredWarehouses.length === 0" description="暂无仓库数据" />

    <!-- 仓库编辑弹窗 -->
    <el-dialog
      v-model="showModal"
      :title="editingWarehouse ? '编辑仓库' : '新增仓库'"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="80px">
        <el-form-item label="仓库名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入仓库名称" />
        </el-form-item>
        <el-form-item label="仓库编码" prop="code">
          <el-input v-model="formData.code" placeholder="如：WH001" />
        </el-form-item>
        <el-form-item label="仓库类型" prop="warehouseType">
          <el-select v-model="formData.warehouseType" placeholder="请选择" class="w-full">
            <el-option v-for="t in WAREHOUSE_TYPES" :key="t" :label="t" :value="t" />
          </el-select>
        </el-form-item>
        <el-form-item label="负责人" prop="managerName">
          <el-input v-model="formData.managerName" placeholder="请输入负责人" />
        </el-form-item>
        <el-form-item label="位置" prop="location">
          <el-input v-model="formData.location" placeholder="请输入仓库位置" />
        </el-form-item>
        <el-form-item label="容量" prop="capacity">
          <el-input-number v-model="formData.capacity" :min="0" class="w-full" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="formData.status" placeholder="请选择状态" class="w-full">
            <el-option label="启用" value="active" />
            <el-option label="停用" value="inactive" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="formData.description" type="textarea" :rows="2" placeholder="请输入描述" />
        </el-form-item>
              </el-form>
      <template #footer>
        <el-button @click="handleCloseModal">取消</el-button>
        <el-button type="primary" @click="editingWarehouse ? handleUpdate() : handleCreate()">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Search, Grid, Edit, Delete, ArrowLeft, OfficeBuilding, Plus, Refresh } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getWarehouses, createWarehouse, updateWarehouse, deleteWarehouse } from '@/services/apiBasicDataService'

// 仓库类型选项
const WAREHOUSE_TYPES = ['原料仓库', '成品仓库', '耗材仓库', '农药仓库', '化肥仓库', '设备仓库', '其他']

// P1-4 修复：仓库类型中文标签 - 兼容后端可能返回英文 code 的场景，统一显示中文标签
const WAREHOUSE_TYPE_LABELS = {
  raw_material: '原料仓库',
  finished: '成品仓库',
  consumable: '耗材仓库',
  pesticide: '农药仓库',
  fertilizer: '化肥仓库',
  equipment: '设备仓库',
  other: '其他',
  // 中文值直通
  原料仓库: '原料仓库',
  成品仓库: '成品仓库',
  耗材仓库: '耗材仓库',
  农药仓库: '农药仓库',
  化肥仓库: '化肥仓库',
  设备仓库: '设备仓库',
  其他: '其他'
}

/** 仓库类型中文标签 - 与 V1.1 保持完全一致 */
const getWarehouseTypeLabel = (typeCode) => {
  if (!typeCode) return '-'
  return WAREHOUSE_TYPE_LABELS[typeCode] || typeCode
}

// 搜索关键词
const searchTerm = ref('')

// 弹窗控制
const showModal = ref(false)
const editingWarehouse = ref(null)
const formRef = ref()
const isLoading = ref(false)

// 表单数据
const formData = reactive({
  id: null,
  name: '',
  code: '',
  warehouseType: '',
  location: '',
  capacity: 0,
  managerName: '',
  status: 'active',
  description: ''
})

// 表单验证规则
const formRules = {
  name: [{ required: true, message: '请输入仓库名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入仓库编码', trigger: 'blur' }]
}

// 仓库数据
const allWarehouses = ref([])

// 筛选后的仓库
const filteredWarehouses = computed(() => {
  if (!searchTerm.value) return allWarehouses.value
  const term = searchTerm.value.toLowerCase()
  return allWarehouses.value.filter(w =>
    (w.warehouseName || w.name || '').toLowerCase().includes(term) ||
    (w.warehouseCode || w.code || '').toLowerCase().includes(term) ||
    (w.warehouseType || '').toLowerCase().includes(term) ||
    (w.location || '').toLowerCase().includes(term)
  )
})

// 统计计算
const stats = computed(() => {
  const total = allWarehouses.value.length
  const active = allWarehouses.value.filter(w => w.status === 'active').length
  const totalCapacity = allWarehouses.value.reduce((sum, w) => sum + (w.capacity || 0), 0)
  const totalStock = allWarehouses.value.reduce((sum, w) => sum + (w.currentStock || 0), 0)
  return { total, active, totalCapacity, totalStock }
})

// 获取库存百分比
const getStockPercent = (current, capacity) => {
  if (!capacity) return 0
  return Math.round((current / capacity) * 100)
}

// 获取库存颜色
const getStockColor = (percent) => {
  if (percent >= 80) return 'text-red-600'
  if (percent >= 50) return 'text-yellow-600'
  return 'text-green-600'
}

/**
 * 加载仓库数据
 */
const loadWarehouses = async () => {
  isLoading.value = true
  try {
    const data = await getWarehouses()
    allWarehouses.value = data || []
  } catch (error) {
    // P2-6 修复：保留 console 调试信息（开发用）+ 用户感知 ElMessage
    console.error('[WarehouseManagement] 加载仓库失败:', error)
    ElMessage.error('加载仓库数据失败')
  } finally {
    isLoading.value = false
  }
}

// 创建仓库
const handleCreate = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await createWarehouse({
          name: formData.name,
          code: formData.code,
          warehouseType: formData.warehouseType,
          location: formData.location,
          capacity: formData.capacity,
          managerName: formData.managerName,
          status: formData.status,
          description: formData.description
        })
        ElMessage.success('创建成功')
        handleCloseModal()
        loadWarehouses()
      } catch (error) {
        // P2-6 修复：保留 console 调试信息
        console.error('[WarehouseManagement] 创建仓库失败:', error)
        ElMessage.error('创建仓库失败')
      }
    }
  })
}

// 更新仓库
const handleUpdate = async () => {
  if (!editingWarehouse.value) return
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await updateWarehouse(editingWarehouse.value.id, {
          name: formData.name,
          code: formData.code,
          warehouseType: formData.warehouseType,
          location: formData.location,
          capacity: formData.capacity,
          managerName: formData.managerName,
          status: formData.status,
          description: formData.description
        })
        ElMessage.success('更新成功')
        handleCloseModal()
        loadWarehouses()
      } catch (error) {
        // P2-6 修复：保留 console 调试信息
        console.error('[WarehouseManagement] 更新仓库失败:', error)
        ElMessage.error('更新仓库失败')
      }
    }
  })
}

// 删除仓库
const handleDeleteWarehouse = async (id) => {
  const target = allWarehouses.value.find(w => w.id === id)
  const whName = target?.name || target?.warehouseName || ''
  try {
    await ElMessageBox.confirm(`确定要删除仓库"${whName}"吗？`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
  } catch {
    // 用户取消操作
    return
  }
  try {
    await deleteWarehouse(id)
    allWarehouses.value = allWarehouses.value.filter(w => w.id !== id)
  } catch (err) {
    console.error('删除仓库失败:', err)
  }
}

// 打开新增弹窗（与V1.1 handleAdd 100%一致）
const openAddModal = () => {
  editingWarehouse.value = null
  Object.assign(formData, {
    id: null,
    name: '',
    code: '',
    warehouseType: '',
    location: '',
    capacity: undefined,
    managerName: '',
    status: 'active',
    description: ''
  })
  showModal.value = true
}

// 打开编辑弹窗
const openEditModal = (warehouse) => {
  editingWarehouse.value = warehouse
  Object.assign(formData, warehouse)
  showModal.value = true
}

// 关闭弹窗
const handleCloseModal = () => {
  showModal.value = false
  editingWarehouse.value = null
  Object.assign(formData, {
    id: null,
    name: '',
    code: '',
    warehouseType: '',
    location: '',
    capacity: 0,
    managerName: '',
    status: 'active',
    description: ''
  })
}

// 页面加载时获取数据
onMounted(() => {
  loadWarehouses()
})
</script>
