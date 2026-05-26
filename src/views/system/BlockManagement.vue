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
            <el-icon :size="20" color="#4B5563">
              <ArrowLeft />
            </el-icon>
          </a>
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
            <el-icon :size="24" color="white">
              <Grid />
            </el-icon>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">区块管理</h1>
            <p class="text-gray-500">管理基地下的区域信息</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        v-for="(stat, index) in statsData"
        :key="index"
        class="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-lg flex items-center justify-center"
            :class="stat.color"
          >
            <el-icon :size="20" color="white">
              <component :is="stat.icon" />
            </el-icon>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ stat.value }}</p>
            <p class="text-sm text-gray-500">{{ stat.label }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm border border-gray-100">
      <div class="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div class="flex flex-1 gap-4 items-center">
          <!-- 搜索框 -->
          <div class="flex-1 max-w-md">
            <el-input
              v-model="searchText"
              placeholder="搜索区域名称或编码..."
              clearable
              @clear="handleSearchClear"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
          <!-- 基地筛选 -->
          <el-select
            v-model="baseFilter"
            placeholder="全部基地"
            clearable
            class="w-40"
          >
            <el-option label="全部基地" value="all" />
            <el-option
              v-for="opt in baseOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
          <!-- 状态筛选 -->
          <el-select
            v-model="statusFilter"
            placeholder="全部状态"
            clearable
            class="w-32"
          >
            <el-option label="全部状态" value="all" />
            <el-option label="在用" value="active" />
            <el-option label="闲置" value="inactive" />
          </el-select>
        </div>
        <!-- 新增按钮 -->
        <el-button type="primary" @click="handleOpenModal()">
          <el-icon><Plus /></el-icon>
          新增区域
        </el-button>
      </div>
    </div>

    <!-- 表格 -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <tr>
              <th class="px-4 py-3 text-left text-sm font-semibold">区域编码</th>
              <th class="px-4 py-3 text-left text-sm font-semibold">区域名称</th>
              <th class="px-4 py-3 text-left text-sm font-semibold">所属基地</th>
              <th class="px-4 py-3 text-left text-sm font-semibold">区域类型</th>
              <th class="px-4 py-3 text-left text-sm font-semibold">面积(亩)</th>
              <th class="px-4 py-3 text-left text-sm font-semibold">状态</th>
              <th class="px-4 py-3 text-left text-sm font-semibold">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-300">
            <template v-if="loading">
              <tr>
                <td colspan="7" class="px-4 py-8 text-center text-gray-500">
                  <div class="flex items-center justify-center gap-2">
                    <el-icon class="is-loading"><Loading /></el-icon>
                    <span>加载中...</span>
                  </div>
                </td>
              </tr>
            </template>
            <template v-else-if="error">
              <tr>
                <td colspan="7" class="px-4 py-8 text-center text-red-500">
                  <div class="flex items-center justify-center gap-2">
                    <el-icon><Warning /></el-icon>
                    <span>{{ error }}</span>
                  </div>
                </td>
              </tr>
            </template>
            <template v-else-if="paginatedZones.length === 0">
              <tr>
                <td colspan="7" class="px-4 py-8 text-center text-gray-500">
                  暂无数据
                </td>
              </tr>
            </template>
            <template v-else>
              <tr
                v-for="zone in paginatedZones"
                :key="zone.id"
                class="hover:bg-emerald-50 transition-colors"
              >
                <td class="px-4 py-3">
                  <span class="font-medium text-amber-600">{{ zone.zoneCode }}</span>
                </td>
                <td class="px-4 py-3">
                  <span class="font-medium text-gray-900">{{ zone.zoneName }}</span>
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-1 text-gray-500">
                    <el-icon :size="12"><HomeFilled /></el-icon>
                    {{ zone.baseName || '-' }}
                  </div>
                </td>
                <td class="px-4 py-3 text-gray-700">
                  {{ getZoneTypeName(zone.zoneType) }}
                </td>
                <td class="px-4 py-3 text-gray-700">
                  {{ (zone.area || 0).toLocaleString() }}
                </td>
                <td class="px-4 py-3">
                  <span :class="[
                    'inline-flex px-2 py-1 rounded-full text-xs font-medium border',
                    zone.status === 'active' ? 'bg-green-100 text-green-700 border-green-200' :
                    'bg-gray-100 text-gray-600 border-gray-200'
                  ]">
                    {{ zone.status === 'active' ? '在用' : '闲置' }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <el-button
                      link
                      class="text-amber-600 hover:bg-amber-50 p-1.5 rounded transition-colors"
                      @click="handleOpenModal(zone)"
                    >
                      <el-icon :size="16"><Edit /></el-icon>
                    </el-button>
                    <el-button
                      link
                      class="text-red-600 hover:bg-red-50 p-1.5 rounded transition-colors"
                      @click="handleDelete(zone.id)"
                    >
                      <el-icon :size="16"><Delete /></el-icon>
                    </el-button>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- 分页器 -->
      <div class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
        <div class="text-sm text-gray-500">
          共 {{ filteredZones.length }} 条记录
        </div>
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="filteredZones.length"
          layout="total, sizes, prev, pager, next, jumper"
          background
        />
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="showModal"
      :title="editingZone ? '编辑区域' : '新增区域'"
      width="640px"
      :close-on-click-modal="false"
      @close="handleCloseModal"
    >
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <el-form-item label="区域编码" required>
            <el-input
              v-model="formData.zoneCode"
              placeholder="如：ZONE001"
            />
            <span v-if="errors.zoneCode" class="text-red-500 text-xs mt-1">{{ errors.zoneCode }}</span>
          </el-form-item>
          <el-form-item label="区域名称" required>
            <el-input
              v-model="formData.zoneName"
              placeholder="请输入区域名称"
            />
            <span v-if="errors.zoneName" class="text-red-500 text-xs mt-1">{{ errors.zoneName }}</span>
          </el-form-item>
        </div>

        <el-form-item label="所属基地" required>
          <el-select
            v-model="formData.baseOid"
            placeholder="请选择所属基地"
            class="w-full"
          >
            <el-option label="请选择所属基地" value="" />
            <el-option
              v-for="opt in baseOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
          <span v-if="errors.baseOid" class="text-red-500 text-xs mt-1">{{ errors.baseOid }}</span>
        </el-form-item>

        <el-form-item label="区域类型" required>
          <el-select
            v-model="formData.zoneType"
            placeholder="请选择区域类型"
            class="w-full"
          >
            <el-option label="请选择区域类型" value="" />
            <el-option
              v-for="type in ZONE_TYPES"
              :key="type.value"
              :label="type.label"
              :value="type.value"
            />
          </el-select>
          <span v-if="errors.zoneType" class="text-red-500 text-xs mt-1">{{ errors.zoneType }}</span>
        </el-form-item>

        <el-form-item label="面积(亩)" required>
          <el-input-number
            v-model="formData.area"
            :min="0"
            placeholder="请输入面积"
            class="w-full"
          />
          <span v-if="errors.area" class="text-red-500 text-xs mt-1">{{ errors.area }}</span>
        </el-form-item>

        <div class="grid grid-cols-2 gap-4">
          <el-form-item label="排序">
            <el-input-number
              v-model="formData.sortOrder"
              :min="0"
              placeholder="排序序号"
              class="w-full"
            />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="formData.status" class="w-full">
              <el-option label="在用" value="active" />
              <el-option label="闲置" value="inactive" />
            </el-select>
          </el-form-item>
        </div>

        <el-form-item label="备注说明">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入备注说明（可选）"
          />
        </el-form-item>
      </div>

      <template #footer>
        <el-button @click="handleCloseModal">取消</el-button>
        <el-button type="primary" @click="handleSubmit">提交</el-button>
      </template>
    </el-dialog>

    <!-- 删除确认弹窗 -->
    <el-dialog
      v-model="deleteDialogVisible"
      title="确认删除"
      width="400px"
    >
      <div class="flex items-center gap-3">
        <el-icon :size="24" color="#EF4444"><WarningFilled /></el-icon>
        <span>确定要删除该区域吗？</span>
      </div>
      <template #footer>
        <el-button @click="deleteDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmDelete">确认删除</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import {
  ArrowLeft,
  Grid,
  Plus,
  Edit,
  Delete,
  Search,
  HomeFilled,
  Loading,
  Warning,
  WarningFilled
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useGreenhouseStore } from '@/stores/modules/greenhouse'
import { useZoneStore } from '@/stores/modules/zone'

// ========== 区块类型选项 ==========
const ZONE_TYPES = [
  { value: 'greenhouse', label: '温室大棚' },
  { value: 'plastic_house', label: '塑料大棚' },
  { value: 'glass_house', label: '玻璃温室' },
  { value: 'solar_greenhouse', label: '日光温室' },
  { value: 'open_field', label: '露天种植区' },
  { value: 'other', label: '其他' },
]

/**
 * 获取区域类型名称
 * @param {string} type - 区域类型值
 * @returns {string} 区域类型标签
 */
const getZoneTypeName = (type) => {
  const found = ZONE_TYPES.find(z => z.value === type)
  return found ? found.label : type || '-'
}

// ========== Store ==========
const greenhouseStore = useGreenhouseStore()
const zoneStore = useZoneStore()

// ========== 状态 ==========
const searchText = ref('')
const baseFilter = ref('all')
const statusFilter = ref('all')
const currentPage = ref(1)
const pageSize = ref(10)
const showModal = ref(false)
const editingZone = ref(null)
const deleteDialogVisible = ref(false)
const deleteTargetId = ref(null)

const formData = reactive({
  zoneCode: '',
  zoneName: '',
  baseOid: '',
  zoneType: '',
  area: 0,
  sortOrder: 0,
  status: 'active',
  description: ''
})

const errors = reactive({
  zoneCode: '',
  zoneName: '',
  baseOid: '',
  zoneType: '',
  area: ''
})

// ========== 计算属性 ==========

/**
 * 基地选项列表
 */
const baseOptions = computed(() => {
  return greenhouseStore.greenhouses.map(gh => ({
    value: gh.id || gh.oid,
    label: gh.name || gh.greenhouseName || '未命名基地'
  }))
})

/**
 * 合并基地名称到区块数据
 */
const zonesWithBaseName = computed(() => {
  return zoneStore.zones.map(zone => {
    const base = greenhouseStore.greenhouses.find(gh => gh.id === zone.baseOid || gh.oid === zone.baseOid)
    return {
      ...zone,
      baseName: base?.name || base?.greenhouseName || zone.baseOid || '-'
    }
  })
})

/**
 * 筛选后的区块列表
 */
const filteredZones = computed(() => {
  return zonesWithBaseName.value.filter(zone => {
    const matchSearch =
      !searchText.value ||
      zone.zoneName?.toLowerCase().includes(searchText.value.toLowerCase()) ||
      zone.zoneCode?.toLowerCase().includes(searchText.value.toLowerCase()) ||
      getZoneTypeName(zone.zoneType).toLowerCase().includes(searchText.value.toLowerCase())

    const matchBase = baseFilter.value === 'all' || zone.baseOid === baseFilter.value
    const matchStatus = statusFilter.value === 'all' || zone.status === statusFilter.value

    return matchSearch && matchBase && matchStatus
  })
})

/**
 * 分页后的区块列表
 */
const paginatedZones = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredZones.value.slice(start, end)
})

/**
 * 统计卡片数据
 */
const statsData = computed(() => [
  {
    label: '区域总数',
    value: zoneStore.zones.length,
    color: 'bg-amber-500',
    icon: Grid
  },
  {
    label: '在用区域',
    value: zoneStore.zones.filter(z => z.status === 'active').length,
    color: 'bg-emerald-500',
    icon: Grid
  },
  {
    label: '闲置区域',
    value: zoneStore.zones.filter(z => z.status === 'inactive').length,
    color: 'bg-gray-500',
    icon: Grid
  },
  {
    label: '总面积(亩)',
    value: zoneStore.zones.reduce((sum, z) => sum + (z.area || 0), 0).toLocaleString(),
    color: 'bg-purple-500',
    icon: Grid
  }
])

// 直接引用store状态
const loading = computed(() => zoneStore.loading)
const error = computed(() => zoneStore.error)

// ========== 方法 ==========

/**
 * 加载数据
 */
const loadData = async () => {
  await Promise.all([
    greenhouseStore.loadGreenhouses(),
    zoneStore.loadZones()
  ])
}

/**
 * 搜索清除
 */
const handleSearchClear = () => {
  searchText.value = ''
}

/**
 * 打开弹窗
 * @param {Object} zone - 要编辑的区块，null表示新增
 */
const handleOpenModal = (zone) => {
  if (zone) {
    editingZone.value = zone
    formData.zoneCode = zone.zoneCode || ''
    formData.zoneName = zone.zoneName || ''
    formData.baseOid = zone.baseOid || ''
    formData.zoneType = zone.zoneType || ''
    formData.area = zone.area || 0
    formData.sortOrder = zone.sortOrder || 0
    formData.status = zone.status || 'active'
    formData.description = zone.description || ''
  } else {
    editingZone.value = null
    formData.zoneCode = ''
    formData.zoneName = ''
    formData.baseOid = ''
    formData.zoneType = ''
    formData.area = 0
    formData.sortOrder = 0
    formData.status = 'active'
    formData.description = ''
  }

  // 清空错误信息
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })

  showModal.value = true
}

/**
 * 关闭弹窗
 */
const handleCloseModal = () => {
  showModal.value = false
  editingZone.value = null
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })
}

/**
 * 表单验证
 * @returns {boolean} 验证是否通过
 */
const validateForm = () => {
  let isValid = true
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })

  if (!formData.zoneCode?.trim()) {
    errors.zoneCode = '请输入区域编码'
    isValid = false
  }
  if (!formData.zoneName?.trim()) {
    errors.zoneName = '请输入区域名称'
    isValid = false
  }
  if (!formData.baseOid?.trim()) {
    errors.baseOid = '请选择所属基地'
    isValid = false
  }
  if (!formData.zoneType?.trim()) {
    errors.zoneType = '请选择区域类型'
    isValid = false
  }
  if (!formData.area || formData.area <= 0) {
    errors.area = '请输入有效面积'
    isValid = false
  }

  return isValid
}

/**
 * 提交表单
 */
const handleSubmit = async () => {
  if (!validateForm()) return

  try {
    if (editingZone.value) {
      // 编辑模式
      await zoneStore.editZone(editingZone.value.id, {
        zoneName: formData.zoneName,
        zoneCode: formData.zoneCode,
        baseOid: formData.baseOid,
        zoneType: formData.zoneType,
        area: formData.area,
        sortOrder: formData.sortOrder,
        status: formData.status,
        description: formData.description
      })
      ElMessage.success('保存区域成功')
    } else {
      // 新增模式
      await zoneStore.addZone({
        zoneName: formData.zoneName,
        zoneCode: formData.zoneCode,
        baseOid: formData.baseOid,
        zoneType: formData.zoneType,
        area: formData.area,
        sortOrder: formData.sortOrder,
        description: formData.description
      })
      ElMessage.success('新增区域成功')
    }
    handleCloseModal()
  } catch (err) {
    ElMessage.error(err.message || '操作失败')
  }
}

/**
 * 删除区域
 * @param {string} id - 区域ID
 */
const handleDelete = async (id) => {
  deleteTargetId.value = id
  deleteDialogVisible.value = true
}

/**
 * 确认删除
 */
const confirmDelete = async () => {
  if (!deleteTargetId.value) return

  try {
    await zoneStore.removeZone(deleteTargetId.value)
    ElMessage.success('删除区域成功')
    deleteDialogVisible.value = false
    deleteTargetId.value = null
  } catch (err) {
    ElMessage.error(err.message || '删除区域失败')
  }
}

// ========== 生命周期 ==========
onMounted(() => {
  loadData()
})
</script>
