<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="bg-white rounded-xl p-6 shadow-none">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center gap-3">
          <button
            type="button"
            class="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center hover:from-gray-200 hover:to-gray-300 transition-colors"
            title="返回系统设置"
            @click="goBackToSettings"
          >
            <el-icon :size="20" class="text-gray-600">
              <ArrowLeft />
            </el-icon>
          </button>
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
            <el-icon :size="24" color="white">
              <OfficeBuilding />
            </el-icon>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">基地设置</h1>
            <p class="text-gray-500">管理基地信息配置</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 搜索筛选区域 -->
    <div class="bg-white/90 backdrop-blur-sm border border-blue-200/60 rounded-xl shadow-lg shadow-blue-200/20 p-4">
      <div class="flex flex-wrap items-end gap-4">
        <div class="flex-1 min-w-[200px]">
          <label class="text-gray-700 text-sm mb-1 block">基地/区域名称</label>
          <el-input
            v-model="searchName"
            type="text"
            placeholder="搜索基地/区域名称..."
            clearable
            @input="handleSearchInput"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        <div class="flex-1 min-w-[200px]">
          <label class="text-gray-700 text-sm mb-1 block">状态</label>
          <el-select v-model="statusFilter" placeholder="全部状态" @change="handleSearchInput" class="w-full">
            <el-option label="全部状态" value="all" />
            <el-option label="种植中" value="planting" />
            <el-option label="休耕中" value="fallow" />
          </el-select>
        </div>
        <div class="flex-1 min-w-[200px]">
          <label class="text-gray-700 text-sm mb-1 block">作物类型</label>
          <el-select v-model="cropFilter" placeholder="全部作物" @change="handleSearchInput" class="w-full">
            <el-option label="全部作物" value="all" />
            <el-option v-for="crop in crops" :key="crop" :label="crop" :value="crop" />
          </el-select>
        </div>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="bg-white/90 backdrop-blur-sm border border-blue-200/60 rounded-xl overflow-hidden shadow-lg shadow-blue-200/20">
      <!-- 表头 -->
      <div class="px-4 py-3 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-800">基地列表</h3>
          <div class="flex items-center gap-4">
            <!-- 统计卡片 -->
            <div class="flex items-center gap-3">
              <div class="flex items-center gap-2 px-3 py-1 bg-blue-100/50 rounded-lg">
                <el-icon :size="16" class="text-blue-600"><LocationInformation /></el-icon>
                <span class="text-sm text-gray-600">地块总数</span>
                <span class="text-lg font-bold text-gray-800">{{ stats.total }}</span>
              </div>
              <div class="flex items-center gap-2 px-3 py-1 bg-green-100/50 rounded-lg">
                <el-icon :size="16" class="text-green-600"><CircleCheck /></el-icon>
                <span class="text-sm text-gray-600">种植中</span>
                <span class="text-lg font-bold text-green-600">{{ stats.planting }}</span>
              </div>
              <div class="flex items-center gap-2 px-3 py-1 bg-yellow-100/50 rounded-lg">
                <el-icon :size="16" class="text-yellow-600"><Clock /></el-icon>
                <span class="text-sm text-gray-600">休耕中</span>
                <span class="text-lg font-bold text-yellow-600">{{ stats.fallow }}</span>
              </div>
            </div>
            <div class="flex items-center gap-2 border-l border-gray-200 pl-4">
              <el-button @click="openAddDialog">
                <el-icon><Plus /></el-icon> 新增
              </el-button>
              <el-button @click="toggleEditMode">
                <el-icon><Edit /></el-icon> {{ isEditing ? '完成' : '编辑' }}
              </el-button>
            </div>
          </div>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <tr>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">所属公司</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">基地/区域名称</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">面积</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">当前作物</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">生长天数</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">状态</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">负责人</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-300 bg-white">
            <template v-for="company in companyGroups" :key="company.id">
              <!-- 公司行 -->
              <tr
                :class="[
                  'bg-blue-50/50',
                  !isEditing ? 'hover:bg-blue-100/60 cursor-pointer' : ''
                ]"
                @click="!isEditing && toggleCompany(company.id)"
              >
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <template v-if="!isEditing">
                      <el-icon v-if="expandedCompanies.includes(company.id)" :size="16" class="text-gray-600">
                        <ArrowDown />
                      </el-icon>
                      <el-icon v-else :size="16" class="text-gray-600">
                        <ArrowRight />
                      </el-icon>
                    </template>
                    <span class="font-medium text-gray-900">{{ company.name }}</span>
                    <span class="text-xs text-gray-500">({{ company.bases.length }}个基地)</span>
                  </div>
                </td>
                <td colSpan="6" class="px-4 py-3">
                  <div v-if="isEditing" class="flex items-center gap-2">
                    <el-button
                      link
                      @click.stop="openEditCompanyDialog(company)"
                    >
                      <el-icon><Edit /></el-icon> 编辑
                    </el-button>
                    <el-button
                      link
                      type="danger"
                      @click.stop="confirmDeleteCompany(company)"
                    >
                      <el-icon><Delete /></el-icon> 删除
                    </el-button>
                  </div>
                </td>
              </tr>
              <!-- 基地行 -->
              <template v-if="expandedCompanies.includes(company.id)">
                <tr
                  v-for="item in getFilteredBases(company.bases)"
                  :key="item.id"
                  class="hover:bg-blue-50/40"
                >
                  <td class="px-4 py-3 text-sm text-gray-500"></td>
                  <td class="px-4 py-3">
                    <el-button
                      link
                      class="text-sm font-bold hover:underline cursor-pointer"
                      @click="navigateToPark(item)"
                    >
                      {{ item.name }}
                    </el-button>
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ item.area }} {{ item.unit }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ item.crop }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ item.growthDay > 0 ? `第${item.growthDay}天` : '-' }}</td>
                  <td class="px-4 py-3">
                    <span :class="[
                      'inline-flex px-2 py-1 rounded-full text-xs font-medium border',
                      item.status === 'planting' ? 'bg-green-100 text-green-700 border-green-200' :
                      item.status === 'fallow' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                      'bg-gray-100 text-gray-600 border-gray-200'
                    ]">
                      {{ item.statusText }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ item.manager }}</td>
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-1">
                      <template v-if="isEditing">
                        <el-button
                          link
                          @click="openEditBaseDialog(item, company.id)"
                        >
                          <el-icon><Edit /></el-icon>
                        </el-button>
                        <el-button
                          link
                          type="danger"
                          @click="confirmDeleteBase(item, company)"
                        >
                          <el-icon><Delete /></el-icon>
                        </el-button>
                      </template>
                      <el-button
                        link
                        @click="openViewBaseDialog(item, company.id)"
                      >
                        <el-icon><View /></el-icon>
                      </el-button>
                    </div>
                  </td>
                </tr>
              </template>
            </template>
          </tbody>
        </table>
      </div>

      <!-- 分页 -->
      <div class="px-4 py-3 border-t border-blue-100 flex items-center justify-between">
        <div class="text-sm text-gray-500">
          第 {{ currentPage }} / {{ totalPages }} 页，共 {{ totalItems }} 条
        </div>
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="totalItems"
          :page-sizes="[10, 20, 50]"
          layout="sizes, prev, pager, next"
          background
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <!-- 确认删除弹窗 -->
    <el-dialog
      v-model="showConfirmModal"
      :title="confirmModalConfig.title"
      width="400px"
      @close="resetConfirmModal"
    >
      <div class="flex items-center gap-3 mb-4">
        <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
          <el-icon :size="24" class="text-red-600"><WarningFilled /></el-icon>
        </div>
        <h3 class="text-lg font-semibold text-gray-900">{{ confirmModalConfig.title }}</h3>
      </div>
      <div class="text-sm text-gray-600 space-y-2 mb-6">
        <p>{{ confirmModalConfig.message }}</p>
      </div>
      <template #footer>
        <div class="flex gap-3">
          <el-button @click="showConfirmModal = false">取消</el-button>
          <el-button type="danger" @click="handleConfirmDelete">确认</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="showFormDialog"
      :title="formDialogTitle"
      width="500px"
      class="base-settings-dialog"
    >
      <el-form :model="formData" label-width="100px" class="p-4">
        <!-- 新增类型选择 -->
        <el-form-item v-if="!editingItem" label="新增类型">
          <el-select v-model="addType" placeholder="请选择新增类型" class="w-full">
            <el-option label="新增公司" value="company" />
            <el-option label="新增基地" value="base" />
          </el-select>
        </el-form-item>

        <!-- 所属公司选择（新增基地时） -->
        <el-form-item v-if="!editingItem && addType === 'base'" label="所属公司">
          <el-select v-model="selectedCompanyId" placeholder="请选择公司" class="w-full">
            <el-option
              v-for="company in companyGroups"
              :key="company.id"
              :label="company.name"
              :value="company.id"
            />
          </el-select>
        </el-form-item>

        <!-- 名称 -->
        <el-form-item :label="editingItem?.type === 'company' || addType === 'company' ? '公司名称' : '基地名称'">
          <el-input v-model="formData.name" :placeholder="editingItem?.type === 'company' || addType === 'company' ? '请输入公司名称' : '请输入基地名称'" />
        </el-form-item>

        <!-- 基地字段 -->
        <template v-if="(!editingItem && addType === 'base') || (editingItem && editingItem.type === 'base')">
          <div class="grid grid-cols-2 gap-4">
            <el-form-item label="面积">
              <el-input-number v-model="formData.area" :min="0" controls-position="right" class="w-full" />
            </el-form-item>
            <el-form-item label="单位">
              <el-select v-model="formData.unit" class="w-full">
                <el-option label="亩" value="亩" />
                <el-option label="平方米" value="平方米" />
                <el-option label="公顷" value="公顷" />
              </el-select>
            </el-form-item>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <el-form-item label="作物">
              <el-input v-model="formData.crop" placeholder="如：水稻" />
            </el-form-item>
            <el-form-item label="负责人">
              <el-input v-model="formData.manager" placeholder="请输入负责人" />
            </el-form-item>
          </div>
          <el-form-item label="联系电话">
            <el-input v-model="formData.phone" placeholder="请输入联系电话" />
          </el-form-item>
          <el-form-item label="基地简介">
            <el-input v-model="formData.intro" type="textarea" :rows="3" placeholder="请输入基地简介" />
          </el-form-item>
        </template>
      </el-form>
      <template #footer>
        <div class="flex gap-3">
          <el-button @click="closeFormDialog">取消</el-button>
          <el-button type="primary" @click="submitForm">保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
// P2-1: getCompanyGroups 死代码移除(原 L334-339 已迁移到 useBaseStore 真实 API,无任何调用方)
</script>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft,
  ArrowRight,
  ArrowDown,
  Search,
  Plus,
  Edit,
  Delete,
  View,
  Clock,
  CircleCheck,
  LocationInformation,
  WarningFilled,
  OfficeBuilding
} from '@element-plus/icons-vue'
import { useBaseStore } from '@/stores/modules/baseStore'

const baseStore = useBaseStore()
const router = useRouter()

// 触发园区总览页面刷新（事件名与 V1.1 FarmStructureManagement 一致：farmStructureUpdated）
const notifyFarmStructureUpdated = () => {
  window.dispatchEvent(new CustomEvent('farmStructureUpdated'))
}

// 将 baseStore.bases 转为按 companyOid 分组的 companyGroups 结构
const companyGroups = computed(() => {
  const groups = new Map()
  for (const b of baseStore.bases || []) {
    const key = b.companyOid || b.companyName || 'unassigned'
    if (!groups.has(key)) {
      groups.set(key, {
        id: key,
        oid: b.companyOid || key,
        name: b.companyName || '未分配公司',
        bases: []
      })
    }
    groups.get(key).bases.push({
      id: b.id || b.oid,
      oid: b.oid,
      name: b.name,
      area: b.area || 0,
      unit: b.unit || '亩',
      crop: b.crop || '',
      growthDay: b.growthDay || 0,
      status: b.status === 'inactive' ? 'fallow' : 'planting',
      statusText: b.status === 'inactive' ? '休耕中' : '种植中',
      manager: b.manager || '',
      phone: b.phone || '',
      soilType: b.soilType || '',
      ph: b.ph || 0,
      coords: (b.lng != null && b.lat != null) ? `${b.lng},${b.lat}` : '',
      city: b.city || '',
      province: b.province || '',
      lng: b.lng || 0,
      lat: b.lat || 0,
      intro: b.intro || '',
      greenhouseCount: b.greenhouseCount || 0,
      fieldArea: b.fieldArea || 0
    })
  }
  return Array.from(groups.values())
})

// 响应式数据
const searchName = ref('')
const statusFilter = ref('all')
const cropFilter = ref('all')
const currentPage = ref(1)
const pageSize = ref(10)
const isEditing = ref(false)
const showConfirmModal = ref(false)
const showFormDialog = ref(false)
const editingItem = ref(null)
const addType = ref('base')
const selectedCompanyId = ref(null)
const expandedCompanies = ref([])

// 确认弹窗配置
const confirmModalConfig = reactive({
  title: '',
  message: '',
  type: 'danger',
  onConfirm: () => {}
})

// 表单数据
const formData = reactive({
  name: '',
  area: 0,
  unit: '亩',
  crop: '',
  manager: '',
  phone: '',
  intro: ''
})

// 计算属性
const parkData = computed(() => {
  return companyGroups.value.flatMap(group =>
    group.bases.map(base => ({ ...base, company: group.name, companyId: group.id }))
  )
})

const filteredData = computed(() => {
  return parkData.value.filter(item => {
    if (searchName.value && !item.name.toLowerCase().includes(searchName.value.toLowerCase())) return false
    if (statusFilter.value !== 'all' && item.status !== statusFilter.value) return false
    if (cropFilter.value !== 'all' && item.crop !== cropFilter.value) return false
    return true
  })
})

const totalItems = computed(() => filteredData.value.length)
const totalPages = computed(() => Math.ceil(totalItems.value / pageSize.value))

const stats = computed(() => ({
  total: parkData.value.length,
  planting: parkData.value.filter(p => p.status === 'planting').length,
  fallow: parkData.value.filter(p => p.status === 'fallow').length
}))

// P2-2: crops 从 parkData 自由文本提取(V1.1 BaseSettings 无该筛选,V2.0 保留为空数组以避免 UI 抖动)
const crops = computed(() => [])

const formDialogTitle = computed(() => {
  if (editingItem.value) {
    if (editingItem.value.type === 'company') return '编辑公司'
    if (editingItem.value.type === 'view') return '查看基地'
    return '编辑基地'
  }
  return addType.value === 'company' ? '新增公司' : '新增基地'
})

// 方法
const toggleCompany = (companyId) => {
  const index = expandedCompanies.value.indexOf(companyId)
  if (index > -1) {
    expandedCompanies.value.splice(index, 1)
  } else {
    expandedCompanies.value.push(companyId)
  }
}

const handleSearchInput = () => {
  currentPage.value = 1
}

const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
}

const handlePageChange = (val) => {
  currentPage.value = val
}

const getFilteredBases = (bases) => {
  return bases.filter(item => {
    if (searchName.value && !item.name.toLowerCase().includes(searchName.value.toLowerCase())) return false
    if (statusFilter.value !== 'all' && item.status !== statusFilter.value) return false
    if (cropFilter.value !== 'all' && item.crop !== cropFilter.value) return false
    return true
  })
}

const toggleEditMode = () => {
  isEditing.value = !isEditing.value
}

const navigateToPark = (item) => {
  router.push({ path: '/', state: { baseId: item.oid || item.id, baseName: item.name } })
}

// 返回系统设置 - 与V1.1 `<a href="/settings">` 行为一致
const goBackToSettings = () => {
  router.push('/settings')
}

const openAddDialog = () => {
  editingItem.value = null
  addType.value = 'base'
  selectedCompanyId.value = null
  resetFormData()
  showFormDialog.value = true
}

const openEditCompanyDialog = (company) => {
  // 公司维度当前V2.0未实现store（参考V1.1 useOrganizationStore），仅展示不允许编辑
  ElMessage.warning('公司维度编辑功能待 V2.0 useOrganizationStore 补全后启用')
}

const openEditBaseDialog = (item, companyId) => {
  editingItem.value = { type: 'base', data: item, companyId }
  formData.name = item.name || ''
  formData.area = item.area || 0
  formData.unit = item.unit || '亩'
  formData.crop = item.crop || ''
  formData.manager = item.manager || ''
  formData.phone = item.phone || ''
  formData.intro = item.intro || ''
  showFormDialog.value = true
}

const openViewBaseDialog = (item, companyId) => {
  // 查看模式：复用编辑弹窗但隐藏保存按钮
  editingItem.value = { type: 'view', data: item, companyId }
  formData.name = item.name || ''
  formData.area = item.area || 0
  formData.unit = item.unit || '亩'
  formData.crop = item.crop || ''
  formData.manager = item.manager || ''
  formData.phone = item.phone || ''
  formData.intro = item.intro || ''
  showFormDialog.value = true
}

const resetFormData = () => {
  formData.name = ''
  formData.area = 0
  formData.unit = '亩'
  formData.crop = ''
  formData.manager = ''
  formData.phone = ''
  formData.intro = ''
}

const closeFormDialog = () => {
  showFormDialog.value = false
  editingItem.value = null
  resetFormData()
}

const confirmDeleteCompany = (company) => {
  // 公司维度当前V2.0未实现store，仅展示
  ElMessage.warning('公司维度删除功能待 V2.0 useOrganizationStore 补全后启用')
}

const confirmDeleteBase = (item, company) => {
  confirmModalConfig.title = '删除基地警告'
  confirmModalConfig.message = '删除基地会导致所有相关数据无法读取和使用！请提前备份数据，否则后果自负！'
  confirmModalConfig.type = 'danger'
  confirmModalConfig.onConfirm = async () => {
    confirmModalConfig.title = '确认删除'
    confirmModalConfig.message = `确定要删除基地 ${item.name} 吗？此操作不可恢复！`
    confirmModalConfig.onConfirm = async () => {
      try {
        const targetOid = item.oid || item.id
        await baseStore.removeBase(targetOid)
        notifyFarmStructureUpdated()
        showConfirmModal.value = false
      } catch (err) {
        ElMessage.error('删除基地失败：' + (err.message || '未知错误'))
      }
    }
  }
  showConfirmModal.value = true
}

const resetConfirmModal = () => {
  confirmModalConfig.title = ''
  confirmModalConfig.message = ''
  confirmModalConfig.type = 'danger'
  confirmModalConfig.onConfirm = null
}

const handleConfirmDelete = () => {
  if (confirmModalConfig.onConfirm) {
    confirmModalConfig.onConfirm()
  }
}

const submitForm = async () => {
  if (!formData.name) {
    ElMessage.error('请输入名称')
    return
  }

  try {
    if (editingItem.value && editingItem.value.type === 'view') {
      // 查看模式不允许保存
      closeFormDialog()
      return
    }

    if (editingItem.value && editingItem.value.type === 'base') {
      // 编辑基地 - 调用真实API
      const targetOid = editingItem.value.data.oid || editingItem.value.data.id
      await baseStore.editBase(targetOid, {
        name: formData.name,
        area: formData.area,
        unit: formData.unit,
        manager: formData.manager,
        phone: formData.phone,
        intro: formData.intro
      })
      ElMessage.success('基地信息已更新')
    } else if (!editingItem.value && addType.value === 'base') {
      // 新增基地
      const payload = {
        name: formData.name,
        area: formData.area,
        unit: formData.unit,
        manager: formData.manager,
        phone: formData.phone,
        intro: formData.intro,
        status: 'active'
      }
      // 如果选择了公司，关联 companyOid/companyName
      if (selectedCompanyId.value) {
        const group = companyGroups.value.find(c => c.id === selectedCompanyId.value)
        if (group) {
          payload.companyOid = group.oid
          payload.companyName = group.name
        }
      }
      await baseStore.addBase(payload)
      selectedCompanyId.value = null
      ElMessage.success('基地已新增')
    } else {
      // 公司新增/编辑 - V2.0 useOrganizationStore 暂未实现，跳过
      ElMessage.warning('公司维度编辑功能待 V2.0 useOrganizationStore 补全后启用')
      return
    }
    notifyFarmStructureUpdated()
    closeFormDialog()
  } catch (err) {
    ElMessage.error('保存失败：' + (err.message || '未知错误'))
  }
}

// 监听 companyGroups 更新，同步更新 expandedCompanies
// P2-3: 性能优化 — 改用浅监听 length,避免 deep:true 在每次基地数据更新时
// 重新计算引用并强制重置展开状态,只在公司数量变化时才同步
watch(() => companyGroups.value.length, (newLen) => {
  if (newLen > 0) {
    expandedCompanies.value = companyGroups.value.map(g => g.id)
  }
}, { immediate: true })

// 挂载时调用真实API加载基地数据（对齐 V1.1 useBaseStore.loadBases）
onMounted(async () => {
  try {
    await baseStore.loadBases()
  } catch (err) {
    console.error('[BaseSettings] 加载基地数据失败:', err)
  }
})
</script>

<style scoped>
/* 基地设置页面样式 */
.base-settings-dialog :deep(.el-dialog__header) {
  background: linear-gradient(to right, #10b981, #059669, #10b981);
  border-radius: 8px 8px 0 0;
  margin: 0;
  padding: 16px 20px;
}
.base-settings-dialog :deep(.el-dialog__title) {
  color: white;
  font-weight: 600;
}
.base-settings-dialog :deep(.el-dialog__headerbtn .el-dialog__close) {
  color: white;
}
.base-settings-dialog :deep(.el-dialog__body) {
  padding: 20px;
}
/* 主按钮改为emerald绿色 - 与V1.1保持一致 */
:deep(.el-button--primary) {
  --el-button-bg-color: #059669;
  --el-button-border-color: #059669;
  --el-button-hover-bg-color: #047857;
  --el-button-hover-border-color: #047857;
}
</style>
