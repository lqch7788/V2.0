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
            <el-icon :size="20" class="text-gray-600">
              <ArrowLeft />
            </el-icon>
          </a>
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
              <el-button type="primary" @click="openAddDialog">
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
                      type="primary"
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
                      type="primary"
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
                          type="primary"
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
                        type="primary"
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
// 导出给其他组件使用的函数
export const getCompanyGroups = () => {
  return loadCompanyGroups()
}
</script>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
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

// localStorage key
const COMPANY_GROUPS_KEY = 'yuanxingtu_company_groups'

// 初始数据 - 与园区基地总览表一致
const defaultCompanyGroups = [
  {
    id: 1,
    name: '宁波帮帮忙公司',
    bases: [
      { id: 2, name: '上海松江基地', area: 300, unit: '亩', crop: '水稻', growthDay: 30, status: 'planting', statusText: '种植中', manager: '郭靖', phone: '13800138002', soilType: '沙壤土', ph: 6.8, coords: '121.2234,31.0342', city: '上海', province: '上海', lng: 121.2234, lat: 31.0342, intro: '总种植面积300亩，包含玻璃温室2个，连栋薄膜温室5个，日光拱棚10个，大田200亩。', greenhouseCount: 17, fieldArea: 200 },
      { id: 3, name: '上海崇明基地', area: 800, unit: '亩', crop: '小麦', growthDay: 0, status: 'fallow', statusText: '休耕中', manager: '萧峰', phone: '13800138003', soilType: '黏土', ph: 6.2, coords: '121.24416,31.73610', city: '上海', province: '上海', lng: 121.24416, lat: 31.73610, intro: '总种植面积800亩，包含玻璃温室3个，连栋薄膜温室8个，日光拱棚15个，大田650亩。', greenhouseCount: 26, fieldArea: 650 },
      { id: 7, name: '上海嘉定基地', area: 350, unit: '亩', crop: '蔬菜', growthDay: 25, status: 'planting', statusText: '种植中', manager: '杨过', phone: '13800138007', soilType: '沙土', ph: 7.0, coords: '121.2654,31.3754', city: '上海', province: '上海', lng: 121.2654, lat: 31.3754, intro: '总种植面积350亩，包含玻璃温室4个，连栋薄膜温室6个，日光拱棚8个，大田200亩。', greenhouseCount: 18, fieldArea: 200 },
      { id: 12, name: '上海奉贤基地', area: 550, unit: '亩', crop: '玉米', growthDay: 50, status: 'planting', statusText: '种植中', manager: '张无忌', phone: '13800138012', soilType: '黏土', ph: 6.8, coords: '121.4745,30.9123', city: '上海', province: '上海', lng: 121.4745, lat: 30.9123, intro: '总种植面积550亩，包含玻璃温室2个，连栋薄膜温室4个，日光拱棚12个，大田450亩。', greenhouseCount: 18, fieldArea: 450 },
    ]
  },
  {
    id: 2,
    name: '成都帮帮您公司',
    bases: [
      { id: 1, name: '西安雁塔基地', area: 500, unit: '亩', crop: '番茄', growthDay: 45, status: 'planting', statusText: '种植中', manager: '令狐冲', phone: '13800138001', soilType: '壤土', ph: 6.5, coords: '108.9470,34.2194', city: '西安', province: '陕西', lng: 108.9470, lat: 34.2194, intro: '总种植面积500亩，包含玻璃温室3个，连栋薄膜温室7个，日光拱棚12个，大田380亩。', greenhouseCount: 22, fieldArea: 380 },
      { id: 6, name: '西安高新基地', area: 200, unit: '亩', crop: '草莓', growthDay: 55, status: 'planting', statusText: '种植中', manager: '狄云', phone: '13800138006', soilType: '营养土', ph: 6.4, coords: '108.8789,34.2181', city: '西安', province: '陕西', lng: 108.8789, lat: 34.2181, intro: '总种植面积200亩，包含玻璃温室5个，连栋薄膜温室3个，日光拱棚5个，大田100亩。', greenhouseCount: 13, fieldArea: 100 },
      { id: 4, name: '宁波北仑基地', area: 600, unit: '亩', crop: '茶叶', growthDay: 60, status: 'planting', statusText: '种植中', manager: '石破天', phone: '13800138004', soilType: '壤土', ph: 6.6, coords: '121.9701,29.8947', city: '宁波', province: '浙江', lng: 121.9701, lat: 29.8947, intro: '总种植面积600亩，包含玻璃温室1个，连栋薄膜温室4个，日光拱棚8个，大田550亩。', greenhouseCount: 13, fieldArea: 550 },
      { id: 8, name: '宁波镇海基地', area: 280, unit: '亩', crop: '水稻', growthDay: 40, status: 'planting', statusText: '种植中', manager: '陈家洛', phone: '13800138008', soilType: '壤土', ph: 6.7, coords: '121.7532,29.9543', city: '宁波', province: '浙江', lng: 121.7532, lat: 29.9543, intro: '总种植面积280亩，包含玻璃温室2个，连栋薄膜温室3个，日光拱棚6个，大田220亩。', greenhouseCount: 11, fieldArea: 220 },
      { id: 10, name: '宁波慈溪基地', area: 420, unit: '亩', crop: '葡萄', growthDay: 75, status: 'planting', statusText: '种植中', manager: '袁承志', phone: '13800138010', soilType: '壤土', ph: 6.5, coords: '121.2678,30.1543', city: '宁波', province: '浙江', lng: 121.2678, lat: 30.1543, intro: '总种植面积420亩，包含玻璃温室3个，连栋薄膜温室5个，日光拱棚10个，大田320亩。', greenhouseCount: 18, fieldArea: 320 },
    ]
  },
]

// 数据类型定义
const router = useRouter()

// 从 localStorage 读取数据
const loadCompanyGroups = () => {
  try {
    const stored = localStorage.getItem(COMPANY_GROUPS_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error('读取基地数据失败:', e)
  }
  return defaultCompanyGroups
}

// 保存数据到 localStorage 并通知园区总览更新
const saveCompanyGroups = (data) => {
  localStorage.setItem(COMPANY_GROUPS_KEY, JSON.stringify(data))
  // 触发园区总览页面刷新
  window.dispatchEvent(new CustomEvent('companyGroupsUpdated'))
}

// 响应式数据
const companyGroups = ref(loadCompanyGroups())
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

const crops = computed(() => [...new Set(parkData.value.map(p => p.crop))])

const formDialogTitle = computed(() => {
  if (editingItem.value) {
    return editingItem.value.type === 'company' ? '编辑公司' : '编辑基地'
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
  router.push({ path: '/', state: { baseId: item.id, baseName: item.name } })
}

const openAddDialog = () => {
  editingItem.value = null
  addType.value = 'base'
  selectedCompanyId.value = null
  resetFormData()
  showFormDialog.value = true
}

const openEditCompanyDialog = (company) => {
  editingItem.value = { type: 'company', data: company }
  formData.name = company.name
  showFormDialog.value = true
}

const openEditBaseDialog = (item, companyId) => {
  editingItem.value = { type: 'base', data: item, companyId }
  formData.name = item.name
  formData.area = item.area
  formData.unit = item.unit
  formData.crop = item.crop
  formData.manager = item.manager
  formData.phone = item.phone
  formData.intro = item.intro
  showFormDialog.value = true
}

const openViewBaseDialog = (item, companyId) => {
  editingItem.value = { type: 'base', data: item, companyId }
  formData.name = item.name
  formData.area = item.area
  formData.unit = item.unit
  formData.crop = item.crop
  formData.manager = item.manager
  formData.phone = item.phone
  formData.intro = item.intro
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
  confirmModalConfig.title = '删除公司警告'
  confirmModalConfig.message = '删除公司会导致所有相关数据无法读取和使用！请提前备份数据，否则后果自负！'
  confirmModalConfig.type = 'danger'
  confirmModalConfig.onConfirm = () => {
    confirmModalConfig.title = '确认删除'
    confirmModalConfig.message = `确定要删除公司 ${company.name} 吗？此操作不可恢复！`
    confirmModalConfig.onConfirm = () => {
      companyGroups.value = companyGroups.value.filter(c => c.id !== company.id)
      saveCompanyGroups(companyGroups.value)
      ElMessage.success('公司已删除')
      showConfirmModal.value = false
    }
  }
  showConfirmModal.value = true
}

const confirmDeleteBase = (item, company) => {
  confirmModalConfig.title = '删除基地警告'
  confirmModalConfig.message = '删除基地会导致所有相关数据无法读取和使用！请提前备份数据，否则后果自负！'
  confirmModalConfig.type = 'danger'
  confirmModalConfig.onConfirm = () => {
    confirmModalConfig.title = '确认删除'
    confirmModalConfig.message = `确定要删除基地 ${item.name} 吗？此操作不可恢复！`
    confirmModalConfig.onConfirm = () => {
      companyGroups.value = companyGroups.value.map(c => {
        if (c.id === company.id) {
          return { ...c, bases: c.bases.filter(b => b.id !== item.id) }
        }
        return c
      })
      saveCompanyGroups(companyGroups.value)
      ElMessage.success('基地已删除')
      showConfirmModal.value = false
    }
  }
  showConfirmModal.value = true
}

const handleConfirmDelete = () => {
  if (confirmModalConfig.onConfirm) {
    confirmModalConfig.onConfirm()
  }
}

const submitForm = () => {
  if (!formData.name) {
    ElMessage.error('请输入名称')
    return
  }

  if (editingItem.value) {
    // 编辑模式
    if (editingItem.value.type === 'company') {
      const targetId = editingItem.value.data.id
      companyGroups.value = companyGroups.value.map(c =>
        c.id === targetId ? { ...c, name: formData.name } : c
      )
      ElMessage.success('公司名称已更新')
    } else {
      const targetId = editingItem.value.data.id
      companyGroups.value = companyGroups.value.map(c => {
        if (c.id === editingItem.value.companyId) {
          return {
            ...c,
            bases: c.bases.map(b =>
              b.id === targetId ? {
                ...b,
                name: formData.name,
                area: formData.area,
                unit: formData.unit,
                crop: formData.crop,
                manager: formData.manager,
                phone: formData.phone,
                intro: formData.intro
              } : b
            )
          }
        }
        return c
      })
      ElMessage.success('基地信息已更新')
    }
  } else {
    // 新增模式
    if (addType.value === 'company') {
      companyGroups.value.push({
        id: Date.now(),
        name: formData.name,
        bases: []
      })
      ElMessage.success('公司已新增')
    } else {
      if (!selectedCompanyId.value) {
        ElMessage.error('请选择公司')
        return
      }
      companyGroups.value = companyGroups.value.map(c => {
        if (c.id === selectedCompanyId.value) {
          return {
            ...c,
            bases: [...c.bases, {
              id: Date.now(),
              name: formData.name,
              area: formData.area,
              unit: formData.unit,
              crop: formData.crop,
              growthDay: 0,
              status: 'planting',
              statusText: '种植中',
              manager: formData.manager,
              phone: formData.phone,
              soilType: '',
              ph: 0,
              coords: '',
              city: '',
              province: '',
              lng: 0,
              lat: 0,
              intro: formData.intro
            }]
          }
        }
        return c
      })
      ElMessage.success('基地已新增')
      selectedCompanyId.value = null
    }
  }

  saveCompanyGroups(companyGroups.value)
  closeFormDialog()
}

// 监听 companyGroups 更新，同步更新 expandedCompanies
watch(companyGroups, (newVal) => {
  if (newVal.length > 0) {
    expandedCompanies.value = newVal.map(g => g.id)
  }
}, { immediate: true, deep: true })
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
