<template>
  <div class="h-full flex flex-col">
    <!-- 页面头部 -->
    <div class="bg-white rounded-xl p-4 shadow-none mb-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <a
            href="/settings"
            class="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center hover:from-gray-200 hover:to-gray-300 transition-colors"
            title="返回系统设置"
          >
            <el-icon :size="20"><ArrowLeft /></el-icon>
          </a>
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
            <el-icon :size="24" color="white"><OfficeBuilding /></el-icon>
          </div>
          <div>
            <h1 class="text-xl font-bold text-gray-900">基地运营中心</h1>
            <p class="text-sm text-gray-500">
              {{ viewMode === 'tree' && selectedNode.name ? `当前选择：${selectedNode.name}` : viewMode === 'tree' ? '请从左侧树形结构中选择节点' : '列表视图' }}
            </p>
          </div>
        </div>
        <!-- 视图切换按钮 -->
        <div class="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button
            @click="viewMode = 'list'"
            :class="[
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
              viewMode === 'list' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            ]"
          >
            <el-icon><List /></el-icon>
            列表
          </button>
          <button
            @click="viewMode = 'tree'"
            :class="[
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
              viewMode === 'tree' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            ]"
          >
            <el-icon><Connection /></el-icon>
            树状
          </button>
        </div>
      </div>
    </div>

    <!-- 主内容区 -->
    <div v-if="viewMode === 'tree'" class="flex-1 flex gap-4 min-h-0">
      <!-- 左侧树形结构 -->
      <div class="w-80 flex-shrink-0 bg-white rounded-xl shadow-none flex flex-col">
        <!-- 搜索框 -->
        <div class="p-3 border-b border-gray-100">
          <div class="relative">
            <el-icon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"><Search /></el-icon>
            <el-input
              type="text"
              placeholder="搜索基地/温室/区域..."
              v-model="searchTerm"
              class="pl-9"
              clearable
            />
          </div>
        </div>

        <!-- 树形组件 -->
        <div class="flex-1 overflow-auto p-3">
          <div v-if="loading" class="flex items-center justify-center py-8">
            <el-icon class="is-loading" :size="32" color="#059669"><Loading /></el-icon>
          </div>
          <el-tree
            v-else
            :data="treeData"
            :props="{ children: 'children', label: 'title' }"
            node-key="key"
            :expand-on-click-node="false"
            :default-expanded-keys="expandedKeys"
            :current-node-key="currentNodeKey"
            @node-click="handleNodeClick"
            @node-expand="handleNodeExpand"
            @node-collapse="handleNodeCollapse"
            highlight-current
            class="base-ops-tree"
          >
            <template #default="{ node, data }">
              <div class="flex items-center gap-2 py-1">
                <el-icon v-if="data.type === 'base'" color="#059669"><OfficeBuilding /></el-icon>
                <el-icon v-else-if="data.type === 'greenhouse'" color="#10b981"><HomeFilled /></el-icon>
                <el-icon v-else-if="data.type === 'zone'" color="#f59e0b"><Grid /></el-icon>
                <el-icon v-else color="#6366f1"><Box /></el-icon>
                <span class="text-sm">{{ node.label }}</span>
              </div>
            </template>
          </el-tree>
        </div>
      </div>

      <!-- 右侧内容区 -->
      <div class="flex-1 flex flex-col min-h-0 gap-4">
        <!-- 统计卡片 -->
        <div class="grid grid-cols-4 gap-4">
          <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center">
            <div class="text-2xl font-bold text-blue-600">{{ stats.totalArea }}</div>
            <div class="text-sm text-gray-600">总面积(㎡)</div>
          </div>
          <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center">
            <div class="text-2xl font-bold text-green-600">{{ stats.zoneCount }}</div>
            <div class="text-sm text-gray-600">区块数</div>
          </div>
          <div class="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 text-center">
            <div class="text-2xl font-bold text-orange-600">{{ stats.plantingCount }}</div>
            <div class="text-sm text-gray-600">种植中</div>
          </div>
          <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center">
            <div class="text-lg font-bold text-purple-600 truncate">{{ stats.currentCrop || '-' }}</div>
            <div class="text-sm text-gray-600">当前作物</div>
          </div>
        </div>

        <!-- 数据表格 -->
        <div class="flex-1 bg-white rounded-xl shadow-none overflow-auto">
          <el-table :data="tableData" class="w-full" v-loading="loading">
            <el-table-column type="index" label="序号" width="60" align="center" />
            <el-table-column v-for="col in tableColumns" :key="col.key" :prop="col.key" :label="col.label" :width="col.width" align="center">
              <template #default="{ row }">
                <template v-if="col.key === 'status'">
                  <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
                    {{ row.status === 'active' ? '启用' : '停用' }}
                  </el-tag>
                </template>
                <template v-else-if="col.key === 'action'">
                  <div class="flex items-center justify-center gap-1">
                    <el-button size="small" @click="handleEdit(row)" class="text-blue-600">
                      <el-icon><Edit /></el-icon>
                    </el-button>
                    <el-button size="small" type="danger" @click="handleDelete(row)">
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </div>
                </template>
                <template v-else>{{ row[col.key] || '-' }}</template>
              </template>
            </el-table-column>
            <el-table-empty v-if="tableData.length === 0" description="暂无数据" />
          </el-table>
        </div>

        <!-- 底部操作按钮 -->
        <div class="flex items-center justify-start gap-3 bg-white rounded-xl p-4 shadow-none">
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            {{ addButtonText }}
          </el-button>
        </div>
      </div>
    </div>

    <!-- 列表视图 -->
    <div v-else class="flex-1 bg-white rounded-xl shadow-none flex flex-col">
      <!-- Tab 切换 -->
      <div class="border-b border-gray-200 rounded-t-xl">
        <div class="flex">
          <button
            v-for="tab in listTabs"
            :key="tab.key"
            @click="listTab = tab.key"
            :class="[
              'px-6 py-3 text-base font-bold border-b-2 transition-all duration-200 rounded-t-md',
              listTab === tab.key
                ? 'border-green-600 text-green-700 bg-green-50 shadow-sm'
                : 'border-transparent text-gray-500 hover:text-green-600 hover:bg-green-50/50'
            ]"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>

      <!-- Tab 内容 -->
      <div class="flex-1 p-4 overflow-auto">
        <!-- 种植区管理 -->
        <div v-show="listTab === 'facility'">
          <div class="mb-4 flex items-center gap-4">
            <el-input v-model="facilitySearch" placeholder="搜索温室名称/编码..." clearable class="w-64" />
            <el-button type="primary" @click="loadGreenhouses">搜索</el-button>
            <el-button @click="facilitySearch = ''; loadGreenhouses()">重置</el-button>
          </div>
          <el-table :data="filteredGreenhouses" v-loading="loading">
            <el-table-column prop="code" label="编码" width="140" />
            <el-table-column prop="name" label="名称" min-width="160" />
            <el-table-column prop="location" label="位置" min-width="120" />
            <el-table-column prop="area" label="面积(㎡)" width="100" />
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
                  {{ row.status === 'active' ? '启用' : '停用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="140" fixed="right">
              <template #default="{ row }">
                <el-button size="small" @click="openEditModal('greenhouse', row)"><el-icon><Edit /></el-icon></el-button>
                <el-button size="small" type="danger" @click="handleDeleteFacility(row)"><el-icon><Delete /></el-icon></el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 区块划分 -->
        <div v-show="listTab === 'zone'">
          <div class="mb-4 flex items-center gap-4">
            <el-input v-model="zoneSearch" placeholder="搜索区域名称/编码..." clearable class="w-64" />
            <el-button type="primary" @click="loadZones">搜索</el-button>
            <el-button @click="zoneSearch = ''; loadZones()">重置</el-button>
          </div>
          <el-table :data="filteredZones" v-loading="loading">
            <el-table-column prop="zoneCode" label="编码" width="140" />
            <el-table-column prop="zoneName" label="名称" min-width="160" />
            <el-table-column prop="zoneType" label="类型" width="120" />
            <el-table-column prop="area" label="面积(㎡)" width="100" />
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
                  {{ row.status === 'active' ? '启用' : '停用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="140" fixed="right">
              <template #default="{ row }">
                <el-button size="small" @click="openEditModal('zone', row)"><el-icon><Edit /></el-icon></el-button>
                <el-button size="small" type="danger" @click="handleDeleteZone(row)"><el-icon><Delete /></el-icon></el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 种植记录 -->
        <div v-show="listTab === 'planting'">
          <div class="mb-4 flex items-center gap-4">
            <el-input v-model="plantingSearch" placeholder="搜索作物/品种..." clearable class="w-64" />
            <el-button type="primary" @click="loadPlantingRecords">搜索</el-button>
            <el-button @click="plantingSearch = ''; loadPlantingRecords()">重置</el-button>
          </div>
          <el-table :data="filteredPlantingRecords" v-loading="loading">
            <el-table-column prop="seasonCode" label="编码" width="140" />
            <el-table-column prop="cropName" label="作物" min-width="120" />
            <el-table-column prop="varietyName" label="品种" min-width="120" />
            <el-table-column prop="startDate" label="开始日期" width="120" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusTagType(row.status)" size="small">
                  {{ getStatusName(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="140" fixed="right">
              <template #default="{ row }">
                <el-button size="small" @click="openEditModal('planting', row)"><el-icon><Edit /></el-icon></el-button>
                <el-button size="small" type="danger" @click="handleDeletePlanting(row)"><el-icon><Delete /></el-icon></el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="modalVisible" :title="modalTitle" width="600px" :close-on-click-modal="false">
      <div class="space-y-4">
        <!-- 温室表单 -->
        <template v-if="modalType === 'greenhouse'">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">编码 <span class="text-red-500">*</span></label>
              <el-input v-model="formData.code" placeholder="请输入编码" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">名称 <span class="text-red-500">*</span></label>
              <el-input v-model="formData.name" placeholder="请输入名称" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">基地</label>
              <el-select v-model="formData.baseOid" placeholder="请选择基地" class="w-full">
                <el-option
                  v-for="base in baseStore.bases"
                  :key="base.oid"
                  :label="base.baseName || base.baseCode"
                  :value="base.oid"
                />
              </el-select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">类型</label>
              <el-select v-model="formData.greenhouseType" placeholder="请选择" class="w-full">
                <el-option label="薄膜温室" value="film_greenhouse" />
                <el-option label="玻璃温室" value="glass_greenhouse" />
                <el-option label="拱棚" value="arch_greenhouse" />
                <el-option label="日光温室" value="sunlight_greenhouse" />
              </el-select>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">面积(㎡)</label>
              <el-input-number v-model="formData.area" :min="0" class="w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">状态</label>
              <el-select v-model="formData.status" placeholder="请选择" class="w-full">
                <el-option label="启用" value="active" />
                <el-option label="停用" value="inactive" />
              </el-select>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">位置</label>
            <el-input v-model="formData.location" placeholder="请输入位置" />
          </div>
        </template>

        <!-- 区域表单 -->
        <template v-else-if="modalType === 'zone'">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">编码 <span class="text-red-500">*</span></label>
              <el-input v-model="formData.zoneCode" placeholder="请输入编码" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">名称 <span class="text-red-500">*</span></label>
              <el-input v-model="formData.zoneName" placeholder="请输入名称" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">类型</label>
              <el-input v-model="formData.zoneType" placeholder="请输入区域类型" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">面积(㎡)</label>
              <el-input-number v-model="formData.area" :min="0" class="w-full" />
            </div>
          </div>
        </template>

        <!-- 地块表单 -->
        <template v-else-if="modalType === 'block'">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">编码 <span class="text-red-500">*</span></label>
              <el-input v-model="formData.blockCode" placeholder="请输入编码" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">名称 <span class="text-red-500">*</span></label>
              <el-input v-model="formData.blockName" placeholder="请输入名称" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">类型</label>
              <el-input v-model="formData.blockType" placeholder="请输入地块类型" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">面积(㎡)</label>
              <el-input-number v-model="formData.area" :min="0" class="w-full" />
            </div>
          </div>
        </template>

        <!-- 种植记录表单 -->
        <template v-else-if="modalType === 'planting'">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">作物名称 <span class="text-red-500">*</span></label>
              <el-input v-model="formData.cropName" placeholder="请输入作物名称" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">品种</label>
              <el-input v-model="formData.varietyName" placeholder="请输入品种" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">开始日期</label>
              <el-date-picker v-model="formData.startDate" type="date" placeholder="选择日期" class="w-full" value-format="YYYY-MM-DD" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">状态</label>
              <el-select v-model="formData.status" placeholder="请选择" class="w-full">
                <el-option label="种植中" value="planting" />
                <el-option label="已收获" value="harvested" />
                <el-option label="已取消" value="cancelled" />
              </el-select>
            </div>
          </div>
        </template>
      </div>
      <template #footer>
        <el-button @click="modalVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { OfficeBuilding, HomeFilled, Grid, Box, Search, List, Connection, Loading, Edit, Delete, Plus, ArrowLeft } from '@element-plus/icons-vue'
import { useGreenhouseStore } from '@/stores/modules/greenhouse'
import { useZoneStore } from '@/stores/modules/zone'
import { useBlockStore } from '@/stores/modules/blockStore'
import { useBaseStore } from '@/stores/modules/baseStore'
import { usePlantingRecordStore } from '@/stores/modules/plantingRecordStore'

// Stores
const greenhouseStore = useGreenhouseStore()
const zoneStore = useZoneStore()
const blockStore = useBlockStore()
const baseStore = useBaseStore()
const plantingStore = usePlantingRecordStore()

// 视图状态
const viewMode = ref('tree')
const listTab = ref('facility')
const listTabs = [
  { key: 'facility', label: '种植区管理' },
  { key: 'zone', label: '区块划分' },
  { key: 'planting', label: '种植记录' }
]

// 搜索状态
const searchTerm = ref('')
const facilitySearch = ref('')
const zoneSearch = ref('')
const plantingSearch = ref('')

// 加载状态
const loading = ref(false)
const submitting = ref(false)

// 树形状态
const expandedKeys = ref([])
const selectedNode = ref({ type: null, oid: null, name: null })

// 弹窗状态
const modalVisible = ref(false)
const modalType = ref('')
const modalMode = ref('add')
const formData = ref({})

// 计算属性
const currentNodeKey = computed(() => {
  if (!selectedNode.value.oid) return ''
  const prefix = selectedNode.value.type === 'greenhouse' ? 'gh' : selectedNode.value.type === 'zone' ? 'zone' : selectedNode.value.type === 'block' ? 'block' : 'base'
  return `${prefix}_${selectedNode.value.oid}`
})

// 树形数据
const treeData = computed(() => {
  return baseStore.bases.map(base => ({
    key: `base_${base.oid}`,
    title: base.baseName || base.baseCode || '未命名基地',
    type: 'base',
    oid: base.oid,
    children: (greenhousesStore.greenhouses || [])
      .filter(gh => gh.baseOid === base.oid)
      .map(gh => ({
        key: `gh_${gh.oid}`,
        title: gh.name || gh.code || '未命名温室',
        type: 'greenhouse',
        oid: gh.oid,
        children: (zoneStore.zones || [])
          .filter(z => z.greenhouseOid === gh.oid)
          .map(z => ({
            key: `zone_${z.oid}`,
            title: z.zoneName || z.zoneCode || '未命名区域',
            type: 'zone',
            oid: z.oid,
            children: (blockStore.blocks || [])
              .filter(b => b.zoneOid === z.oid)
              .map(b => ({
                key: `block_${b.oid}`,
                title: b.blockName || b.blockCode || '未命名地块',
                type: 'block',
                oid: b.oid
              }))
          }))
      }))
  }))
})

// 统计数据
const stats = computed(() => {
  const node = selectedNode.value
  if (!node.oid) {
    return { totalArea: 0, zoneCount: 0, plantingCount: 0, currentCrop: '-' }
  }

  let totalArea = 0
  let zoneCount = 0
  let plantingCount = 0
  let currentCrop = '-'
  const records = plantingStore.records || []

  if (node.type === 'base') {
    const ghs = (greenhousesStore.greenhouses || []).filter(g => g.baseOid === node.oid)
    totalArea = ghs.reduce((sum, g) => sum + (g.area || 0), 0)
    const baseZoneOids = new Set(
      (zoneStore.zones || []).filter(z => ghs.some(g => g.oid === z.greenhouseOid)).map(z => z.oid)
    )
    zoneCount = baseZoneOids.size
    // 计算该基地下正在种植的记录
    const baseBlocks = (blockStore.blocks || []).filter(b => {
      const zone = (zoneStore.zones || []).find(z => z.oid === b.zoneOid)
      return zone && baseZoneOids.has(zone.oid)
    })
    const baseBlockOids = new Set(baseBlocks.map(b => b.oid))
    const plantingRecords = records.filter(r => r.blockOid && baseBlockOids.has(r.blockOid) && r.status === 'planting')
    plantingCount = plantingRecords.length
    currentCrop = plantingRecords[0]?.cropName || '-'
  } else if (node.type === 'greenhouse') {
    const gh = (greenhousesStore.greenhouses || []).find(g => g.oid === node.oid)
    totalArea = gh?.area || 0
    const ghZoneOids = new Set(
      (zoneStore.zones || []).filter(z => z.greenhouseOid === node.oid).map(z => z.oid)
    )
    zoneCount = ghZoneOids.size
    // 计算该温室下正在种植的记录
    const ghBlocks = (blockStore.blocks || []).filter(b => {
      const zone = (zoneStore.zones || []).find(z => z.oid === b.zoneOid)
      return zone && ghZoneOids.has(zone.oid)
    })
    const ghBlockOids = new Set(ghBlocks.map(b => b.oid))
    const plantingRecords = records.filter(r => r.blockOid && ghBlockOids.has(r.blockOid) && r.status === 'planting')
    plantingCount = plantingRecords.length
    currentCrop = plantingRecords[0]?.cropName || '-'
  } else if (node.type === 'zone') {
    const zone = (zoneStore.zones || []).find(z => z.oid === node.oid)
    totalArea = zone?.area || 0
    zoneCount = 1
    // 计算该区域下正在种植的记录
    const zoneBlockOids = new Set(
      (blockStore.blocks || []).filter(b => b.zoneOid === node.oid).map(b => b.oid)
    )
    const plantingRecords = records.filter(r => r.blockOid && zoneBlockOids.has(r.blockOid) && r.status === 'planting')
    plantingCount = plantingRecords.length
    currentCrop = plantingRecords[0]?.cropName || '-'
  }

  return { totalArea, zoneCount, plantingCount, currentCrop }
})

// 表格数据
const tableData = computed(() => {
  const node = selectedNode.value
  if (!node.oid) {
    return greenhouseStore.greenhouses || []
  }

  if (node.type === 'base') {
    return (greenhousesStore.greenhouses || []).filter(g => g.baseOid === node.oid)
  } else if (node.type === 'greenhouse') {
    return (zoneStore.zones || []).filter(z => z.greenhouseOid === node.oid)
  } else if (node.type === 'zone') {
    return (blockStore.blocks || []).filter(b => b.zoneOid === node.oid)
  } else if (node.type === 'block') {
    return (plantingStore.records || []).filter(r => r.blockOid === node.oid)
  }
  return []
})

// 表格列
const tableColumns = computed(() => {
  const node = selectedNode.value
  if (!node.oid || node.type === 'base') {
    return [
      { key: 'code', label: '编码', width: '140' },
      { key: 'name', label: '名称' },
      { key: 'area', label: '面积', width: '100' },
      { key: 'status', label: '状态', width: '100' },
      { key: 'action', label: '操作', width: '140' }
    ]
  } else if (node.type === 'greenhouse') {
    return [
      { key: 'zoneCode', label: '编码', width: '140' },
      { key: 'zoneName', label: '名称' },
      { key: 'zoneType', label: '类型', width: '120' },
      { key: 'area', label: '面积', width: '100' },
      { key: 'status', label: '状态', width: '100' },
      { key: 'action', label: '操作', width: '140' }
    ]
  } else if (node.type === 'zone') {
    return [
      { key: 'blockCode', label: '编码', width: '140' },
      { key: 'blockName', label: '名称' },
      { key: 'blockType', label: '类型', width: '120' },
      { key: 'area', label: '面积', width: '100' },
      { key: 'status', label: '状态', width: '100' },
      { key: 'action', label: '操作', width: '140' }
    ]
  } else if (node.type === 'block') {
    return [
      { key: 'seasonCode', label: '编码', width: '140' },
      { key: 'cropName', label: '作物' },
      { key: 'varietyName', label: '品种' },
      { key: 'startDate', label: '开始日期', width: '120' },
      { key: 'status', label: '状态', width: '100' },
      { key: 'action', label: '操作', width: '140' }
    ]
  }
  return []
})

// 新增按钮文本
const addButtonText = computed(() => {
  const node = selectedNode.value
  if (!node.oid) return '新增温室'
  if (node.type === 'base') return '新增温室'
  if (node.type === 'greenhouse') return '新增区域'
  if (node.type === 'zone') return '新增地块'
  if (node.type === 'block') return '新增种植记录'
  return '新增'
})

// 弹窗标题
const modalTitle = computed(() => {
  const action = modalMode.value === 'add' ? '新增' : '编辑'
  const typeMap = { greenhouse: '温室', zone: '区域', block: '地块', planting: '种植记录' }
  return `${action}${typeMap[modalType.value] || ''}`
})

// 列表视图数据
const greenhousesStore = ref({ greenhouses: [] })

const filteredGreenhouses = computed(() => {
  const list = greenhousesStore.value.greenhouses || greenhouseStore.greenhouses || []
  if (!facilitySearch.value) return list
  const kw = facilitySearch.value.toLowerCase()
  return list.filter(g => (g.name || '').toLowerCase().includes(kw) || (g.code || '').toLowerCase().includes(kw))
})

const filteredZones = computed(() => {
  const list = zoneStore.zones || []
  if (!zoneSearch.value) return list
  const kw = zoneSearch.value.toLowerCase()
  return list.filter(z => (z.zoneName || '').toLowerCase().includes(kw) || (z.zoneCode || '').toLowerCase().includes(kw))
})

const filteredPlantingRecords = computed(() => {
  const list = plantingStore.records || []
  if (!plantingSearch.value) return list
  const kw = plantingSearch.value.toLowerCase()
  return list.filter(r => (r.cropName || '').toLowerCase().includes(kw) || (r.varietyName || '').toLowerCase().includes(kw))
})

// 方法
async function loadAllData() {
  loading.value = true
  try {
    await Promise.all([
      baseStore.loadBases(),
      greenhouseStore.loadGreenhouses(),
      zoneStore.loadZones(),
      blockStore.loadBlocks(),
      plantingStore.loadRecords ? plantingStore.loadRecords() : Promise.resolve()
    ])
    greenhousesStore.value.greenhouses = greenhouseStore.greenhouses || []
  } catch (err) {
    console.error('加载数据失败:', err)
  } finally {
    loading.value = false
  }
}

function loadGreenhouses() {
  greenhousesStore.value.greenhouses = greenhouseStore.greenhouses || []
}

function loadZones() {}

function loadPlantingRecords() {}

function handleNodeClick(data) {
  selectedNode.value = { type: data.type, oid: data.oid, name: data.title }
}

function handleNodeExpand(data) {
  if (!expandedKeys.value.includes(data.key)) {
    expandedKeys.value.push(data.key)
  }
}

function handleNodeCollapse(data) {
  expandedKeys.value = expandedKeys.value.filter(k => k !== data.key)
}

function handleAdd() {
  const node = selectedNode.value
  modalMode.value = 'add'
  if (!node.oid || node.type === 'base') {
    modalType.value = 'greenhouse'
    formData.value = { status: 'active', baseOid: node.oid }
  } else if (node.type === 'greenhouse') {
    modalType.value = 'zone'
    formData.value = { status: 'active', greenhouseOid: node.oid }
  } else if (node.type === 'zone') {
    modalType.value = 'block'
    formData.value = { status: 'active', zoneOid: node.oid }
  } else if (node.type === 'block') {
    modalType.value = 'planting'
    formData.value = { status: 'planting', blockOid: node.oid }
  }
  modalVisible.value = true
}

function handleEdit(row) {
  modalMode.value = 'edit'
  formData.value = { ...row }
  if (row.zoneCode !== undefined) modalType.value = 'zone'
  else if (row.blockCode !== undefined) modalType.value = 'block'
  else if (row.seasonCode !== undefined) modalType.value = 'planting'
  else modalType.value = 'greenhouse'
  modalVisible.value = true
}

function openEditModal(type, row) {
  modalMode.value = 'edit'
  modalType.value = type
  formData.value = { ...row }
  modalVisible.value = true
}

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm('确定要删除吗？删除后无法恢复。', '确认删除', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const oid = row.oid
    if (row.zoneCode !== undefined) {
      await zoneStore.removeZone(oid)
      ElMessage.success('区域删除成功')
    } else if (row.blockCode !== undefined) {
      await blockStore.removeBlock(oid)
      ElMessage.success('地块删除成功')
    } else if (row.seasonCode !== undefined) {
      if (plantingStore.removeRecord) {
        await plantingStore.removeRecord(oid)
      }
      ElMessage.success('种植记录删除成功')
    } else {
      await greenhouseStore.removeGreenhouse(oid)
      ElMessage.success('温室删除成功')
    }
    loadAllData()
  } catch {
    // 取消
  }
}

async function handleDeleteFacility(row) {
  try {
    await ElMessageBox.confirm('确定要删除吗？删除后无法恢复。', '确认删除', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await greenhouseStore.removeGreenhouse(row.oid)
    ElMessage.success('温室删除成功')
    loadAllData()
  } catch {
    // 取消
  }
}

async function handleDeleteZone(row) {
  try {
    await ElMessageBox.confirm('确定要删除吗？删除后无法恢复。', '确认删除', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await zoneStore.removeZone(row.oid)
    ElMessage.success('区域删除成功')
    loadAllData()
  } catch {
    // 取消
  }
}

async function handleDeletePlanting(row) {
  try {
    await ElMessageBox.confirm('确定要删除吗？删除后无法恢复。', '确认删除', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    })
    if (plantingStore.removeRecord) {
      await plantingStore.removeRecord(row.oid)
    }
    ElMessage.success('种植记录删除成功')
    loadAllData()
  } catch {
    // 取消
  }
}

async function handleSubmit() {
  submitting.value = true
  try {
    // 表单验证
    if (modalType.value === 'greenhouse') {
      if (!formData.value.code) {
        ElMessage.warning('请填写编码')
        return
      }
      if (!formData.value.name) {
        ElMessage.warning('请填写名称')
        return
      }
    } else if (modalType.value === 'zone') {
      if (!formData.value.zoneCode) {
        ElMessage.warning('请填写编码')
        return
      }
      if (!formData.value.zoneName) {
        ElMessage.warning('请填写名称')
        return
      }
    } else if (modalType.value === 'block') {
      if (!formData.value.blockCode) {
        ElMessage.warning('请填写编码')
        return
      }
      if (!formData.value.blockName) {
        ElMessage.warning('请填写名称')
        return
      }
    } else if (modalType.value === 'planting') {
      if (!formData.value.cropName) {
        ElMessage.warning('请填写作物名称')
        return
      }
    }

    if (modalMode.value === 'add') {
      // 新增
      if (modalType.value === 'greenhouse') {
        await greenhouseStore.addGreenhouse(formData.value)
        ElMessage.success('温室新增成功')
      } else if (modalType.value === 'zone') {
        await zoneStore.addZone(formData.value)
        ElMessage.success('区域新增成功')
      } else if (modalType.value === 'block') {
        await blockStore.addBlock(formData.value)
        ElMessage.success('地块新增成功')
      } else if (modalType.value === 'planting') {
        await plantingStore.addRecord ? plantingStore.addRecord(formData.value) : Promise.resolve()
        ElMessage.success('种植记录新增成功')
      }
    } else {
      // 编辑
      const oid = formData.value.oid
      if (modalType.value === 'greenhouse') {
        await greenhouseStore.editGreenhouse(oid, formData.value)
        ElMessage.success('温室编辑成功')
      } else if (modalType.value === 'zone') {
        await zoneStore.editZone(oid, formData.value)
        ElMessage.success('区域编辑成功')
      } else if (modalType.value === 'block') {
        await blockStore.editBlock(oid, formData.value)
        ElMessage.success('地块编辑成功')
      } else if (modalType.value === 'planting') {
        if (plantingStore.editRecord) {
          await plantingStore.editRecord(oid, formData.value)
        }
        ElMessage.success('种植记录编辑成功')
      }
    }
    modalVisible.value = false
    loadAllData()
  } catch (err) {
    ElMessage.error(err.message || '操作失败')
  } finally {
    submitting.value = false
  }
}

function getStatusTagType(status) {
  const map = { planting: 'success', harvested: 'info', cancelled: 'danger' }
  return map[status] || 'info'
}

function getStatusName(status) {
  const map = { planting: '种植中', harvested: '已收获', cancelled: '已取消' }
  return map[status] || status
}

// 监听搜索
watch(searchTerm, (val) => {
  // 过滤树形数据
})

onMounted(() => {
  loadAllData()
})
</script>

<style scoped>
.base-ops-tree :deep(.el-tree-node__content) {
  height: 32px;
}
</style>
