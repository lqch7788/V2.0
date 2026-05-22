<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-sky-100 to-indigo-100 relative">
    <!-- 背景网格 -->
    <div class="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />

    <div class="relative z-10 p-6">
      <!-- 页面标题 -->
      <div class="mb-6">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/40">
            <el-icon :size="24" class="text-white">
              <MapLocation />
            </el-icon>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-800">园区导览</h1>
            <p class="text-sm text-gray-600">地块与园区全景档案管理</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 全屏模式下返回按钮 -->
    <div v-if="isFullscreen" class="fixed top-4 left-4 z-[1001]">
      <el-button size="small" @click="isFullscreen = false">
        <el-icon><Back /></el-icon>
        <span class="text-sm font-medium text-gray-700">返回</span>
      </el-button>
    </div>

    <div class="flex gap-4 mb-6 px-6">
      <!-- GIS地图可视化区域 -->
      <div
        :class="[
          'flex-1 bg-white/90 backdrop-blur-sm border border-blue-200/60 rounded-xl shadow-lg shadow-blue-200/30 p-4',
          isFullscreen ? 'fixed inset-0 z-50 m-0 rounded-none' : ''
        ]"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-800">GIS地图总览</h3>
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2">
              <span class="flex items-center gap-1 text-xs">
                <span class="w-3 h-3 rounded bg-green-500"></span>种植中
              </span>
              <span class="flex items-center gap-1 text-xs">
                <span class="w-3 h-3 rounded bg-yellow-500"></span>休耕
              </span>
            </div>
            <el-select
              v-model="jumpToBaseId"
              placeholder="跳转到基地..."
              size="small"
              style="width: 160px"
              @change="handleJumpToBase"
              clearable
            >
              <el-option v-for="base in allBases" :key="base.id" :label="base.name" :value="String(base.id)" />
            </el-select>
            <el-button
              :icon="isFullscreen ? 'Rank' : 'FullScreen'"
              circle
              @click="toggleFullscreen"
              :disabled="showDetailModal"
              :title="showDetailModal ? '请先关闭详情弹窗' : (isFullscreen ? '退出全屏' : '全屏查看')"
            />
          </div>
        </div>

        <!-- 地图容器 -->
        <div
          :class="['relative rounded-lg overflow-hidden border border-gray-200', isFullscreen ? 'h-[calc(100vh-120px)]' : 'h-[40rem]']"
        >
          <!-- Leaflet 地图 -->
          <div ref="mapRef" class="w-full h-full" id="leafletMap"></div>

          <!-- 地图加载中 -->
          <div v-if="!mapLoaded" class="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div class="text-center">
              <el-icon :size="48" class="text-emerald-500 mx-auto mb-2 animate-pulse">
                <MapLocation />
              </el-icon>
              <p class="text-sm text-gray-600">正在加载地图...</p>
              <p class="text-xs text-gray-400 mt-1">Leaflet + OpenStreetMap</p>
            </div>
          </div>

          <!-- 左下角提示 -->
          <div v-if="mapLoaded" class="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm">
            <p class="text-xs text-gray-500 mb-1">📍 点击标记查看详情</p>
            <p class="text-xs text-gray-400">🖱️ 滚轮缩放 · 拖拽移动</p>
          </div>

          <!-- 右上角基地列表 -->
          <div v-if="mapLoaded" class="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm max-h-80 overflow-y-auto w-48">
            <div class="p-2">
              <p class="text-sm font-semibold text-gray-700 mb-2 px-1">基地列表</p>
              <div v-for="base in allBases" :key="base.id" class="mb-1">
                <el-button
                  text
                  size="small"
                  class="w-full justify-start"
                  @click="flyToBase(base)"
                >
                  <span
                    :class="[
                      'w-2 h-2 rounded-full flex-shrink-0 mr-2',
                      base.status === 'planting' ? 'bg-green-500' :
                      base.status === 'warning' ? 'bg-red-500' :
                      base.status === 'fallow' ? 'bg-yellow-500' : 'bg-gray-400'
                    ]"
                  ></span>
                  <span class="truncate">{{ base.name }}</span>
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 园区基地总览表 -->
      <div class="w-1/3 flex flex-col bg-white/90 backdrop-blur-sm border border-blue-200/60 rounded-xl overflow-hidden shadow-lg shadow-blue-200/20">
        <div class="px-4 py-3 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 flex-shrink-0">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-800">园区基地总览表</h3>
          </div>
          <!-- 搜索框 -->
          <div class="mt-3">
            <el-input
              v-model="searchName"
              placeholder="搜索基地..."
              size="small"
              clearable
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
          <!-- 筛选 -->
          <div class="flex gap-2 mt-2">
            <el-select v-model="statusFilter" placeholder="状态" size="small" style="width: 100px" clearable>
              <el-option label="全部" value="all" />
              <el-option label="种植中" value="planting" />
              <el-option label="休耕" value="fallow" />
            </el-select>
            <el-select v-model="cropFilter" placeholder="作物" size="small" style="width: 100px" clearable>
              <el-option label="全部" value="all" />
              <el-option v-for="crop in crops" :key="crop" :label="crop" :value="crop" />
            </el-select>
          </div>
        </div>

        <!-- 公司/基地列表 -->
        <div class="overflow-y-auto flex-1">
          <table class="w-full">
            <thead class="bg-blue-50/80">
              <tr>
                <th v-if="exportMode" class="px-4 py-3 text-left text-sm font-semibold text-gray-700 w-12">
                  <el-checkbox
                    :model-value="selectedRows.length === filteredData.length && filteredData.length > 0"
                    @change="handleSelectAll"
                  />
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <template v-for="company in companyGroups" :key="company.id">
                <!-- 公司行 -->
                <tr class="bg-blue-50/50">
                  <td v-if="exportMode" class="px-4 py-3 align-top">
                    <el-checkbox
                      :model-value="company.bases.every(b => selectedRows.includes(b.id))"
                      @change="(checked) => handleCompanySelect(company, checked)"
                    />
                  </td>
                  <td class="px-4 py-4">
                    <div class="flex items-center gap-2 mb-2">
                      <el-button text size="small" @click="toggleCompany(company.id)">
                        <el-icon>
                          <ArrowDown v-if="expandedCompanies.includes(company.id)" />
                          <ArrowRight v-else />
                        </el-icon>
                      </el-button>
                      <span class="font-bold text-sm text-gray-900">{{ company.name }}</span>
                      <span class="text-xs text-gray-500">({{ company.bases.length }}个基地)</span>
                    </div>
                    <!-- 基地列表 -->
                    <div v-if="expandedCompanies.includes(company.id)">
                      <div
                        v-for="item in filterBases(company.bases)"
                        :key="item.id"
                        class="flex flex-nowrap items-center gap-1 py-1.5 pl-8 pr-2 bg-blue-50/60 hover:bg-blue-100/80 rounded-lg mb-1 overflow-hidden"
                      >
                        <el-button text size="small" @click="flyToBase(item)" title="定位到地图">
                          <el-icon class="text-green-600"><Location /></el-icon>
                        </el-button>
                        <el-button text size="small" class="text-sm font-semibold text-blue-600 hover:text-blue-800 truncate max-w-[120px]" @click="goToDashboard(item)">
                          {{ item.name }}
                        </el-button>
                        <span class="text-xs text-gray-500 whitespace-nowrap">{{ item.area }}{{ item.unit }}</span>
                        <span
                          :class="[
                            'text-xs px-1 py-0.5 rounded-full whitespace-nowrap',
                            item.status === 'planting' ? 'bg-green-100 text-green-700' :
                            item.status === 'fallow' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-600'
                          ]"
                        >{{ item.statusText }}</span>
                        <span class="text-xs text-gray-500 whitespace-nowrap truncate max-w-[60px]" :title="item.manager">{{ item.manager }}</span>
                        <el-button text size="small" class="flex-shrink-0 text-xs whitespace-nowrap ml-auto" @click="handleViewDetail(item)">
                          详情&gt;&gt;
                        </el-button>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <!-- 导出模式底部操作栏 -->
        <div v-if="exportMode" class="flex items-center justify-between px-4 py-3 border-t border-blue-100 bg-blue-50/50">
          <div class="flex items-center gap-4">
            <el-button size="small" @click="handleSelectAll">
              {{ selectedRows.length === filteredData.length ? '全不选' : '全选' }}
            </el-button>
            <span class="text-sm text-gray-500">已选择 {{ selectedRows.length }} 项</span>
          </div>
          <div class="flex items-center gap-2">
            <el-button size="small" @click="exportMode = false">取消</el-button>
            <el-button size="small" type="primary" @click="handleExport">确认导出</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 地块详情弹窗 (V1.1原生样式) -->
    <div v-if="showDetailModal && selectedField" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-hidden">
        <div class="px-6 py-4 bg-gradient-to-r from-emerald-500 to-green-600 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-white">{{ selectedField.name }} - 地块档案</h3>
          <div class="flex items-center gap-3">
            <el-button size="small" @click="goToDashboard(selectedField)" class="text-white bg-transparent hover:bg-white/20">进入&gt;&gt;</el-button>
            <el-button size="small" @click="showDetailModal = false" class="bg-transparent border-0 hover:bg-white/20">
              <span class="text-white text-lg leading-none">×</span>
            </el-button>
          </div>
        </div>
        <div class="p-6 bg-gray-100">
          <el-row :gutter="16">
            <el-col :span="6">
              <div class="mb-3">
                <p class="text-xs text-gray-500">基地/区域名称</p>
                <p class="font-semibold text-gray-900">{{ selectedField.name }}</p>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="mb-3">
                <p class="text-xs text-gray-500">面积</p>
                <p class="font-semibold text-gray-900">{{ selectedField.area }} {{ selectedField.unit }}</p>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="mb-3">
                <p class="text-xs text-gray-500">温室大棚数量</p>
                <p class="font-semibold text-gray-900">{{ selectedField.greenhouseCount || '-' }}</p>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="mb-3">
                <p class="text-xs text-gray-500">大田面积</p>
                <p class="font-semibold text-gray-900">{{ selectedField.fieldArea ? selectedField.fieldArea + '亩' : '-' }}</p>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="mb-3">
                <p class="text-xs text-gray-500">地理坐标</p>
                <p class="font-semibold text-gray-900 text-sm">{{ selectedField.coords }}</p>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="mb-3">
                <p class="text-xs text-gray-500">负责人</p>
                <p class="font-semibold text-gray-900">{{ selectedField.manager }}</p>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="mb-3">
                <p class="text-xs text-gray-500">联系电话</p>
                <p class="font-semibold text-gray-900">{{ selectedField.phone }}</p>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="mb-3">
                <p class="text-xs text-gray-500">当前状态</p>
                <span
                  :class="[
                    'inline-flex px-2 py-1 rounded-full text-xs font-medium',
                    selectedField.status === 'planting' ? 'bg-green-100 text-green-700 border border-green-200' :
                    selectedField.status === 'fallow' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                    'bg-gray-100 text-gray-600 border border-gray-200'
                  ]"
                >{{ selectedField.statusText }}</span>
              </div>
            </el-col>
          </el-row>
          <div class="bg-white rounded-lg p-4 border border-gray-200 mt-4">
            <p class="text-sm text-gray-600">{{ selectedField.intro || '-' }}</p>
          </div>
        </div>
        <div class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <el-button size="small" @click="showDetailModal = false">关闭</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Search, ArrowDown, ArrowRight, Location, MapLocation, Back, Close, FullScreen, Rank } from '@element-plus/icons-vue'

// localStorage key - 与 V1.1 保持一致
const COMPANY_GROUPS_KEY = 'yuanxingtu_company_groups'

// 园区/地块数据 - 与 V1.1 保持一致
const initialCompanyGroups = [
  {
    id: 1,
    name: '宁波帮帮忙公司',
    bases: [
      { id: 1, name: '上海松江基地', area: 300, unit: '亩', crop: '水稻', growthDay: 120, status: 'planting', statusText: '种植中', manager: '郭靖', phone: '13800138002', soilType: '沙壤土', ph: 6.8, coords: '121.2234,31.0342', city: '上海', province: '上海', lng: 121.2234, lat: 31.0342, intro: '总种植面积300亩，包含玻璃温室2个，连栋薄膜温室5个，日光拱棚10个，大田200亩。', greenhouseCount: 17, fieldArea: 200 },
      { id: 2, name: '上海崇明基地', area: 800, unit: '亩', crop: '小麦', growthDay: 180, status: 'fallow', statusText: '休耕中', manager: '萧峰', phone: '13800138003', soilType: '黏土', ph: 6.2, coords: '121.24416,31.73610', city: '上海', province: '上海', lng: 121.24416, lat: 31.73610, intro: '总种植面积800亩，包含玻璃温室3个，连栋薄膜温室8个，日光拱棚15个，大田650亩。', greenhouseCount: 26, fieldArea: 650 },
      { id: 3, name: '上海嘉定基地', area: 350, unit: '亩', crop: '蔬菜', growthDay: 90, status: 'planting', statusText: '种植中', manager: '杨过', phone: '13800138007', soilType: '沙土', ph: 7.0, coords: '121.2654,31.3754', city: '上海', province: '上海', lng: 121.2654, lat: 31.3754, intro: '总种植面积350亩，包含玻璃温室4个，连栋薄膜温室6个，日光拱棚8个，大田200亩。', greenhouseCount: 18, fieldArea: 200 },
      { id: 4, name: '上海奉贤基地', area: 550, unit: '亩', crop: '玉米', growthDay: 100, status: 'planting', statusText: '种植中', manager: '张无忌', phone: '13800138012', soilType: '黏土', ph: 6.8, coords: '121.4745,30.9123', city: '上海', province: '上海', lng: 121.4745, lat: 30.9123, intro: '总种植面积550亩，包含玻璃温室2个，连栋薄膜温室4个，日光拱棚12个，大田450亩。', greenhouseCount: 18, fieldArea: 450 },
    ]
  },
  {
    id: 2,
    name: '成都帮帮您公司',
    bases: [
      { id: 5, name: '西安雁塔基地', area: 500, unit: '亩', crop: '番茄', growthDay: 110, status: 'planting', statusText: '种植中', manager: '令狐冲', phone: '13800138001', soilType: '壤土', ph: 6.5, coords: '108.9470,34.2194', city: '西安', province: '陕西', lng: 108.9470, lat: 34.2194, intro: '总种植面积500亩，包含玻璃温室3个，连栋薄膜温室7个，日光拱棚12个，大田380亩。', greenhouseCount: 22, fieldArea: 380 },
      { id: 6, name: '西安高新基地', area: 200, unit: '亩', crop: '草莓', growthDay: 150, status: 'planting', statusText: '种植中', manager: '狄云', phone: '13800138006', soilType: '营养土', ph: 6.4, coords: '108.8789,34.2181', city: '西安', province: '陕西', lng: 108.8789, lat: 34.2181, intro: '总种植面积200亩，包含玻璃温室5个，连栋薄膜温室3个，日光拱棚5个，大田100亩。', greenhouseCount: 13, fieldArea: 100 },
      { id: 7, name: '宁波北仑基地', area: 600, unit: '亩', crop: '茶叶', growthDay: 200, status: 'planting', statusText: '种植中', manager: '石破天', phone: '13800138004', soilType: '壤土', ph: 6.6, coords: '121.9701,29.8947', city: '宁波', province: '浙江', lng: 121.9701, lat: 29.8947, intro: '总种植面积600亩，包含玻璃温室1个，连栋薄膜温室4个，日光拱棚8个，大田550亩。', greenhouseCount: 13, fieldArea: 550 },
      { id: 8, name: '宁波镇海基地', area: 280, unit: '亩', crop: '水稻', growthDay: 120, status: 'planting', statusText: '种植中', manager: '陈家洛', phone: '13800138008', soilType: '壤土', ph: 6.7, coords: '121.7532,29.9543', city: '宁波', province: '浙江', lng: 121.7532, lat: 29.9543, intro: '总种植面积280亩，包含玻璃温室2个，连栋薄膜温室3个，日光拱棚6个，大田220亩。', greenhouseCount: 11, fieldArea: 220 },
      { id: 9, name: '宁波慈溪基地', area: 420, unit: '亩', crop: '葡萄', growthDay: 140, status: 'planting', statusText: '种植中', manager: '袁承志', phone: '13800138010', soilType: '壤土', ph: 6.5, coords: '121.2678,30.1543', city: '宁波', province: '浙江', lng: 121.2678, lat: 30.1543, intro: '总种植面积420亩，包含玻璃温室3个，连栋薄膜温室5个，日光拱棚10个，大田320亩。', greenhouseCount: 18, fieldArea: 320 },
    ]
  },
]

// 从 localStorage 读取数据（与 V1.1 同步）
const loadCompanyGroupsFromStorage = () => {
  try {
    const stored = localStorage.getItem(COMPANY_GROUPS_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error('读取基地数据失败:', e)
  }
  return initialCompanyGroups
}

const router = useRouter()
const mapRef = ref(null)
const mapLoaded = ref(false)
let mapInstance = null

const companyGroups = ref(loadCompanyGroupsFromStorage())

const searchName = ref('')
const statusFilter = ref('all')
const cropFilter = ref('all')
const expandedCompanies = ref(companyGroups.value.map(g => g.id))
const showDetailModal = ref(false)
const selectedField = ref(null)
const isFullscreen = ref(false)
const jumpToBaseId = ref('')
const exportMode = ref(false)
const selectedRows = ref([])
const pendingDetailBase = ref(null)

// 所有基地
const allBases = computed(() => {
  return companyGroups.value.flatMap(group => group.bases.map(base => ({ ...base, company: group.name, companyId: group.id })))
})

// 过滤后的数据
const filteredData = computed(() => {
  return allBases.value.filter(item => {
    if (searchName.value && !item.name.toLowerCase().includes(searchName.value.toLowerCase())) return false
    if (statusFilter.value !== 'all' && item.status !== statusFilter.value) return false
    if (cropFilter.value !== 'all' && item.crop !== cropFilter.value) return false
    return true
  })
})

// 作物种类
const crops = computed(() => {
  return [...new Set(allBases.value.map(b => b.crop))]
})

// 过滤基地
const filterBases = (bases) => {
  return bases.filter(item => {
    if (searchName.value && !item.name.toLowerCase().includes(searchName.value.toLowerCase())) return false
    if (statusFilter.value !== 'all' && item.status !== statusFilter.value) return false
    if (cropFilter.value !== 'all' && item.crop !== cropFilter.value) return false
    return true
  })
}

// 切换公司展开状态
const toggleCompany = (companyId) => {
  if (expandedCompanies.value.includes(companyId)) {
    expandedCompanies.value = expandedCompanies.value.filter(id => id !== companyId)
  } else {
    expandedCompanies.value.push(companyId)
  }
}

// 全选/取消全选
const handleSelectAll = () => {
  if (selectedRows.value.length === filteredData.value.length) {
    selectedRows.value = []
  } else {
    selectedRows.value = filteredData.value.map(item => item.id)
  }
}

// 选择公司下的所有基地
const handleCompanySelect = (company, checked) => {
  company.bases.forEach(b => {
    if (checked && !selectedRows.value.includes(b.id)) {
      selectedRows.value.push(b.id)
    } else if (!checked && selectedRows.value.includes(b.id)) {
      selectedRows.value = selectedRows.value.filter(id => id !== b.id)
    }
  })
}

// 导出功能
const handleExport = () => {
  console.log('导出已选择的基地:', selectedRows.value)
  exportMode.value = false
  selectedRows.value = []
}

// 切换全屏
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
}

// 初始化 Leaflet 地图
const initMap = () => {
  if (!mapRef.value || mapInstance) return

  try {
    const map = window.L.map(mapRef.value, {
      center: [30.5, 113.5],
      zoom: 8,
      zoomControl: true,
      crs: window.L.CRS.EPSG3857
    })

    // 尝试加载高德地图图层
    const mapLayers = [
      { url: 'https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', subdomains: '1234', name: '高德地图' },
      { url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', subdomains: '', name: 'Esri卫星' },
      { url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', subdomains: 'abc', name: 'OSM' }
    ]

    let tileLayer = null
    for (const layer of mapLayers) {
      try {
        tileLayer = window.L.tileLayer(layer.url, {
          subdomains: layer.subdomains,
          attribution: layer.name,
          maxZoom: 18,
          errorTileUrl: ''
        })
        tileLayer.addTo(map)
        break
      } catch (e) {
        console.warn(`加载 ${layer.name} 失败，尝试下一个...`)
      }
    }

    window.L.control.zoom({ position: 'bottomright' }).addTo(map)

    const getIconColor = (status) => {
      switch (status) {
        case 'planting': return '#22c55e'
        case 'warning': return '#ef4444'
        case 'fallow': return '#eab308'
        default: return '#6b7280'
      }
    }

    allBases.value.forEach((base) => {
      const color = getIconColor(base.status)
      const icon = window.L.divIcon({
        className: 'custom-marker',
        html: '<div style="' +
          'background-color: ' + color + ';' +
          'width: 24px;' +
          'height: 24px;' +
          'border-radius: 50%;' +
          'border: 3px solid white;' +
          'box-shadow: 0 2px 6px rgba(0,0,0,0.3);' +
          'display: flex;' +
          'align-items: center;' +
          'justify-content: center;' +
          'color: white;' +
          'font-size: 10px;' +
          'font-weight: bold;' +
          '">📍</' + 'div>',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      })

      const marker = window.L.marker([base.lat, base.lng], { icon }).addTo(map)

      const popupContent = '<div style="min-width: 200px; padding: 5px;">' +
        '<h4 style="margin: 0 0 10px; font-size: 16px; color: #2e7d32; font-weight: bold;">' + base.name + '</h4>' +
        '<p style="margin: 5px 0; font-size: 13px;"><strong>面积：</strong>' + base.area + base.unit + '</p>' +
        '<p style="margin: 5px 0; font-size: 13px;"><strong>当前作物：</strong>' + base.crop + '</p>' +
        '<p style="margin: 5px 0; font-size: 13px;"><strong>状态：</strong><span style="color: ' + color + '; font-weight: bold;">' + base.statusText + '</span></p>' +
        '<p style="margin: 5px 0; font-size: 13px;"><strong>负责人：</strong>' + base.manager + '</p>' +
        '<button onclick="window.dispatchEvent(new CustomEvent(\'showBaseDetail\', {detail: ' + base.id + '}))" style="' +
          'margin-top: 10px;' +
          'padding: 8px 16px;' +
          'background: #059669;' +
          'color: white;' +
          'border: none;' +
          'border-radius: 8px;' +
          'cursor: pointer;' +
          'width: 100%;' +
          'font-size: 14px;' +
          'font-weight: 500;' +
        '">查看详情</' + 'button>' +
      '</' + 'div>'

      marker.bindPopup(popupContent, { maxWidth: 300, className: 'custom-popup' })
    })

    mapInstance = map
    mapLoaded.value = true
  } catch (error) {
    console.error('地图初始化失败:', error)
  }
}

// 定位到地图
const flyToBase = (base) => {
  if (mapInstance) {
    mapInstance.flyTo([base.lat, base.lng], 10, { duration: 1.5 })
  }
}

// 跳转到基地
const handleJumpToBase = (baseId) => {
  if (!baseId) return
  const base = allBases.value.find(b => b.id === Number(baseId))
  if (base) {
    flyToBase(base)
  }
  // 重置选择器
  jumpToBaseId.value = ''
}

// 查看详情
const handleViewDetail = (field) => {
  if (isFullscreen.value) {
    isFullscreen.value = false
    setTimeout(() => {
      selectedField.value = field
      showDetailModal.value = true
    }, 100)
  } else {
    selectedField.value = field
    showDetailModal.value = true
  }
}

// 进入基地总览
const goToDashboard = (base) => {
  if (base) {
    router.push({ path: '/dashboard', query: { baseId: String(base.id), baseName: base.name } })
  }
}

// 处理从地图弹窗触发的详情事件
const handleShowBaseDetail = (e) => {
  const base = allBases.value.find(b => b.id === e.detail)
  if (base) {
    selectedField.value = base
    showDetailModal.value = true
  }
}

// 监听基地设置更新事件
const handleUpdate = () => {
  companyGroups.value = loadCompanyGroupsFromStorage()
}

// 监听公司数据更新
watch(() => companyGroups.value, () => {
  // 数据更新后重新初始化地图
  if (mapInstance) {
    mapInstance.remove()
    mapInstance = null
    mapLoaded.value = false
    nextTick(() => {
      initMap()
    })
  }
}, { deep: true })

onMounted(() => {
  // 等待 Leaflet 加载完成后初始化地图
  const timer = setTimeout(() => {
    if (window.L) {
      initMap()
    } else {
      setTimeout(initMap, 500)
    }
  }, 500)

  // 监听地图弹窗中的查看详情按钮点击
  window.addEventListener('showBaseDetail', handleShowBaseDetail)
  // 监听基地设置更新事件
  window.addEventListener('companyGroupsUpdated', handleUpdate)

  return () => {
    clearTimeout(timer)
  }
})

onUnmounted(() => {
  if (mapInstance) {
    mapInstance.remove()
    mapInstance = null
  }
  window.removeEventListener('showBaseDetail', handleShowBaseDetail)
  window.removeEventListener('companyGroupsUpdated', handleUpdate)
})
</script>

<style>
/* Leaflet 地图样式覆盖 */
:deep(.custom-popup .leaflet-popup-content-wrapper) {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

:deep(.custom-popup .leaflet-popup-content) {
  margin: 10px;
}
</style>
