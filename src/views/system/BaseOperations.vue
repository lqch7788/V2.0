<template>
  <div class="h-full flex flex-col">
    <!-- 页面头部 - 与V1.1 V2版本L706-751一致 -->
    <div class="bg-white rounded-xl p-4 shadow-none mb-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
            <CustomIcons name="Building2" class="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 class="text-xl font-bold text-gray-900">基地运营中心</h1>
            <p class="text-sm text-gray-500">
              <span v-if="viewMode === 'tree' && baseOidFromUrl">当前基地：{{ currentBaseName }}</span>
              <span v-else-if="viewMode === 'tree' && selectedNode.name">当前选择：{{ selectedNode.name }}</span>
              <span v-else-if="viewMode === 'tree'">请从左侧树形结构中选择节点</span>
              <span v-else>列表视图</span>
            </p>
          </div>
        </div>
        <!-- 视图切换按钮 - 与V1.1 L726-749一致 -->
        <div class="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button
            @click="viewMode = 'list'"
            :class="[
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
              viewMode === 'list' ? 'bg-white text-green-600 shadow-none' : 'text-gray-600 hover:text-gray-900'
            ]"
          >
            <CustomIcons name="List" class="w-4 h-4" />
            列表
          </button>
          <button
            @click="viewMode = 'tree'"
            :class="[
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
              viewMode === 'tree' ? 'bg-white text-green-600 shadow-none' : 'text-gray-600 hover:text-gray-900'
            ]"
          >
            <CustomIcons name="Network" class="w-4 h-4" />
            树状
          </button>
        </div>
      </div>
    </div>

    <!-- 主内容区 - 与V1.1 L753-1015一致 -->
    <div v-if="viewMode === 'tree'" class="flex-1 flex gap-4 min-h-0">
      <!-- 左侧树形结构 -->
      <div class="w-80 flex-shrink-0 bg-white rounded-xl shadow-none flex flex-col">
        <!-- 搜索框 -->
        <div class="p-6 border-b border-gray-100">
          <div class="relative">
            <CustomIcons name="Search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <el-input
              type="text"
              placeholder="搜索基地/温室/区域..."
              v-model="searchTerm"
              class="pl-9 h-9"
              clearable
            />
          </div>
        </div>

        <!-- 树形组件 -->
        <div class="flex-1 overflow-auto p-6">
          <div v-if="loading" class="flex items-center justify-center py-8">
            <CustomIcons name="Loader2" class="w-6 h-6 animate-spin text-gray-400" />
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
                <CustomIcons v-if="data.type === 'base'" name="Building2" class="text-emerald-600" />
                <CustomIcons v-else-if="data.type === 'greenhouse'" name="HomeFilled" class="text-green-600" />
                <CustomIcons v-else-if="data.type === 'zone'" name="Grid" class="text-amber-600" />
                <CustomIcons v-else name="Box" class="text-indigo-600" />
                <span class="text-sm">{{ node.label }}</span>
              </div>
            </template>
          </el-tree>
        </div>
      </div>

      <!-- 右侧内容区 -->
      <div class="flex-1 flex flex-col min-h-0 gap-4">
        <!-- 统计卡片 - 与V1.1 L799-824一致 -->
        <div class="grid grid-cols-4 gap-4 mb-4">
          <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 text-center">
            <div class="text-2xl font-bold text-blue-600">{{ stats.totalArea }}</div>
            <div class="text-sm text-gray-600">总面积(㎡)</div>
          </div>
          <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 text-center">
            <div class="text-2xl font-bold text-green-600">{{ stats.zoneCount }}</div>
            <div class="text-sm text-gray-600">区块数</div>
          </div>
          <div class="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 text-center">
            <div class="text-2xl font-bold text-orange-600">{{ stats.plantingCount }}</div>
            <div class="text-sm text-gray-600">种植中</div>
          </div>
          <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 text-center">
            <div class="text-lg font-bold text-purple-600 truncate">{{ stats.currentCrop || '-' }}</div>
            <div class="text-sm text-gray-600">当前作物</div>
          </div>
        </div>

        <!-- 数据表格 - 与V1.1 L827-891一致 -->
        <div class="flex-1 bg-white rounded-xl shadow-none overflow-auto">
          <el-table :data="tableData" class="w-full">
            <el-table-column
              v-for="col in tableColumns"
              :key="col.key"
              :prop="col.key"
              :label="col.label"
              :width="col.width"
              align="center"
            >
              <template #default="{ row }">
                <template v-if="col.key === 'status'">
                  <span :class="[
                    'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                    row.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  ]">
                    {{ row.status === 'active' ? '启用' : '停用' }}
                  </span>
                </template>
                <template v-else-if="col.key === 'action'">
                  <div class="flex items-center justify-center gap-1">
                    <el-button size="small" @click="handleEdit(row)" class="h-7 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                      <CustomIcons name="Edit2" class="w-3 h-3" />
                    </el-button>
                    <el-button size="small" type="danger" @click="handleDelete(row.oid)" class="h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50">
                      <CustomIcons name="Trash2" class="w-3 h-3" />
                    </el-button>
                  </div>
                </template>
                <template v-else-if="col.key === 'code' || col.key === 'name' || col.key === 'zoneCode' || col.key === 'zoneName' || col.key === 'blockCode' || col.key === 'blockName'">
                  <span v-html="highlightText((row[col.key] || '-').toString(), searchTerm)"></span>
                </template>
                <template v-else>
                  {{ row[col.key] || '-' }}
                </template>
              </template>
            </el-table-column>
            <el-table-empty v-if="tableData.length === 0" description="暂无数据" />
          </el-table>
        </div>

        <!-- 底部操作按钮 - 与V1.1 L894-899一致 -->
        <div class="flex items-center justify-start gap-3 bg-white rounded-xl p-4 shadow-none">
          <el-button type="primary" @click="handleAdd">
            <CustomIcons name="Plus" class="w-4 h-4 mr-1" />
            {{ addButtonText }}
          </el-button>
        </div>
      </div>
    </div>

    <!-- 列表视图 - 与V1.1 L902-1015一致 -->
    <div v-else class="flex-1 bg-white rounded-xl shadow-none flex flex-col">
      <!-- TAB 切换 - 与V1.1 L906-939一致 -->
      <div class="border-b border-gray-200 rounded-t-xl">
        <div class="flex">
          <button
            v-for="tab in listTabs"
            :key="tab.key"
            @click="listTab = tab.key"
            :class="[
              'px-6 py-3 text-base font-bold border-b-2 transition-all duration-200 rounded-t-md',
              listTab === tab.key
                ? 'border-green-600 text-green-700 bg-green-100 shadow-none'
                : 'border-transparent text-gray-500 hover:text-green-600 hover:bg-green-100/50'
            ]"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>

      <!-- TAB 内容 -->
      <div class="flex-1 p-4 overflow-auto">
        <!-- 种植区管理 - 与V1.1 L943-964一致 -->
        <div v-show="listTab === 'facility'">
          <FacilityTab
            :greenhouses="filteredGreenhouses"
            :bases="baseStore.bases"
            :base-oid="baseOidFromUrl"
            :base-name="currentBaseName"
            :loading="loading"
            @add="handleFacilityAdd"
            @edit="handleFacilityEdit"
            @remove="handleFacilityDelete"
          />
        </div>

        <!-- 区块划分 -->
        <div v-show="listTab === 'zone'">
          <ZoneTab
            :zones="filteredZones"
            :greenhouses="filteredGreenhouses"
            :loading="loading"
            @add="handleZoneAdd"
            @edit="handleZoneEdit"
            @remove="handleZoneDelete"
          />
        </div>

        <!-- 种植记录 -->
        <div v-show="listTab === 'planting'">
          <PlantingTab
            :records="filteredRecords"
            :greenhouses="filteredGreenhouses"
            :zones="zoneStore.zones"
            :loading="loading"
            @add="handleRecordAdd"
            @edit="handleRecordEdit"
            @end="handleRecordEnd"
            @remove="handleRecordDelete"
          />
        </div>
      </div>
    </div>

    <!-- 新增/编辑弹窗 - 与V1.1 L1017-1279一致 -->
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
              <label class="block text-sm font-medium text-gray-700 mb-1">类型</label>
              <el-select v-model="formData.greenhouseType" placeholder="请选择温室类型" class="w-full">
                <el-option v-for="item in greenhouseTypes" :key="item.dictCode" :label="item.dictLabel" :value="item.dictCode" />
              </el-select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">面积(㎡)</label>
              <el-input-number v-model="formData.area" :min="0" class="w-full" />
              <div v-if="greenhouseAreaInfo" class="mt-1 text-xs text-gray-500">
                所属温室：{{ greenhouseAreaInfo.greenhouseName }}（总面积 {{ greenhouseAreaInfo.totalArea }} ㎡，已分配 {{ greenhouseAreaInfo.usedArea }} ㎡，剩余可用 {{ greenhouseAreaInfo.remainingArea }} ㎡）
              </div>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">位置</label>
            <el-input v-model="formData.location" placeholder="请输入位置" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">状态</label>
            <el-select v-model="formData.status" class="w-full">
              <el-option value="active" label="启用" />
              <el-option value="inactive" label="停用" />
            </el-select>
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
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">状态</label>
            <el-select v-model="formData.status" class="w-full">
              <el-option value="active" label="启用" />
              <el-option value="inactive" label="停用" />
            </el-select>
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
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">状态</label>
            <el-select v-model="formData.status" class="w-full">
              <el-option value="active" label="启用" />
              <el-option value="inactive" label="停用" />
            </el-select>
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
              <el-select v-model="formData.status" class="w-full">
                <el-option value="planting" label="种植中" />
                <el-option value="harvested" label="已收获" />
                <el-option value="cancelled" label="已取消" />
              </el-select>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">备注</label>
            <el-input v-model="formData.notes" type="textarea" placeholder="请输入备注" :rows="2" />
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
import { ref, computed, onMounted, watch, h } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import CustomIcons from '@/components/common/CustomIcons.vue'
import { useGreenhouseStore } from '@/stores/modules/greenhouse'
import { useZoneStore } from '@/stores/modules/zone'
import { useBlockStore } from '@/stores/modules/blockStore'
import { useBaseStore } from '@/stores/modules/baseStore'
import { usePlantingRecordStore } from '@/stores/modules/plantingRecordStore'
import { useDictionaryStore, getDictItems } from '@/stores/modules/dictionary'
import FacilityTab from './tabs/FacilityTab.vue'
import ZoneTab from './tabs/BlockTab.vue'
import PlantingTab from './tabs/PlantingRecordTab.vue'

const route = useRoute()

// URL参数 - 与V1.1 V2版本L222-223一致
const baseOidFromUrl = ref(route.query.baseOid || '')

// 视图状态 - 与V1.1 L225-228一致
const viewMode = ref('tree')
const listTab = ref('facility')
const listTabs = [
  { key: 'facility', label: '种植区管理' },
  { key: 'zone', label: '区块划分' },
  { key: 'planting', label: '种植记录' }
]

// 搜索和选择状态
const searchTerm = ref('')
const expandedKeys = ref([])
const selectedNode = ref({ type: null, oid: null, name: null })

// 加载状态
const loading = ref(false)
const submitting = ref(false)

// 弹窗状态
const modalVisible = ref(false)
const modalType = ref('')
const modalMode = ref('add')
const formData = ref({})
const editingOid = ref(null)

// 字典数据
const greenhouseTypes = ref([])

// Stores
const greenhouseStore = useGreenhouseStore()
const zoneStore = useZoneStore()
const blockStore = useBlockStore()
const baseStore = useBaseStore()
const plantingStore = usePlantingRecordStore()
const dictionaryStore = useDictionaryStore()

// ==================== 工具函数 ====================

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function highlightText(text, query) {
  if (!query || !text) return text
  const escapedQuery = escapeRegExp(query)
  const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'))
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase()
      ? `<mark class="bg-yellow-200">${part}</mark>`
      : part
  ).join('')
}

// ==================== 数据构建 ====================

function buildTreeData(bases, greenhouses, zones, blocks, currentBaseOid, searchQuery) {
  const query = searchQuery.toLowerCase()

  // 如果有baseOid，只显示该基地的数据 - 与V1.1 L92-125一致
  if (currentBaseOid) {
    const currentBase = bases.find(b => b.oid === currentBaseOid)
    if (!currentBase) return []

    return [{
      key: `base_${currentBase.oid}`,
      title: highlightText(`${currentBase.code || ''} ${currentBase.name || ''}`, searchQuery),
      type: 'base',
      oid: currentBase.oid,
      children: greenhouses
        .filter(gh => gh.baseOid === currentBaseOid && (!query || (gh.name || '').toLowerCase().includes(query) || (gh.code || '').toLowerCase().includes(query)))
        .map(gh => ({
          key: `gh_${gh.oid}`,
          title: highlightText(`${gh.code || ''} ${gh.name || ''}`, searchQuery),
          type: 'greenhouse',
          oid: gh.oid,
          children: zones
            .filter(z => z.greenhouseOid === gh.oid && (!query || (z.zoneName || '').toLowerCase().includes(query) || (z.zoneCode || '').toLowerCase().includes(query)))
            .map(z => ({
              key: `zone_${z.oid}`,
              title: highlightText(`${z.zoneCode || ''} ${z.zoneName || ''}`, searchQuery),
              type: 'zone',
              oid: z.oid,
              children: blocks
                .filter(b => b.zoneOid === z.oid && (!query || (b.blockName || '').toLowerCase().includes(query) || (b.blockCode || '').toLowerCase().includes(query)))
                .map(b => ({
                  key: `block_${b.oid}`,
                  title: highlightText(`${b.blockCode || ''} ${b.blockName || ''}`, searchQuery),
                  type: 'block',
                  oid: b.oid,
                  // P1-8: 补 zoneOid 让 block 节点保持回溯关系(对齐 V1.1 父子链路完整)
                  zoneOid: b.zoneOid,
                  greenhouseOid: z.greenhouseOid
                }))
            }))
        }))
    }]
  }

  // 没有baseOid时显示所有基地
  return bases
    .filter(base => !query || (base.name || '').toLowerCase().includes(query) || (base.code || '').toLowerCase().includes(query))
    .map(base => ({
      key: `base_${base.oid}`,
      title: highlightText(`${base.code || ''} ${base.name || ''}`, searchQuery),
      type: 'base',
      oid: base.oid,
      children: greenhouses
        .filter(gh => gh.baseOid === base.oid && (!query || (gh.name || '').toLowerCase().includes(query) || (gh.code || '').toLowerCase().includes(query)))
        .map(gh => ({
          key: `gh_${gh.oid}`,
          title: highlightText(`${gh.code || ''} ${gh.name || ''}`, searchQuery),
          type: 'greenhouse',
          oid: gh.oid,
          children: zones
            .filter(z => z.greenhouseOid === gh.oid && (!query || (z.zoneName || '').toLowerCase().includes(query) || (z.zoneCode || '').toLowerCase().includes(query)))
            .map(z => ({
              key: `zone_${z.oid}`,
              title: highlightText(`${z.zoneCode || ''} ${z.zoneName || ''}`, searchQuery),
              type: 'zone',
              oid: z.oid,
              children: blocks
                .filter(b => b.zoneOid === z.oid && (!query || (b.blockName || '').toLowerCase().includes(query) || (b.blockCode || '').toLowerCase().includes(query)))
                .map(b => ({
                  key: `block_${b.oid}`,
                  title: highlightText(`${b.blockCode || ''} ${b.blockName || ''}`, searchQuery),
                  type: 'block',
                  oid: b.oid,
                  // P1-8: 补 zoneOid/greenhouseOid 让 block 节点关系链完整
                  zoneOid: b.zoneOid,
                  greenhouseOid: z.greenhouseOid
                }))
            }))
        }))
    }))
}

// ==================== 计算属性 ====================

const treeData = computed(() => {
  return buildTreeData(
    baseStore.bases || [],
    greenhouseStore.greenhouses || [],
    zoneStore.zones || [],
    blockStore.blocks || [],
    baseOidFromUrl.value,
    searchTerm.value
  )
})

const currentNodeKey = computed(() => {
  if (!selectedNode.value.oid) return ''
  const prefix = selectedNode.value.type === 'greenhouse' ? 'gh' : selectedNode.value.type === 'zone' ? 'zone' : selectedNode.value.type === 'block' ? 'block' : 'base'
  return `${prefix}_${selectedNode.value.oid}`
})

const currentBaseName = computed(() => {
  if (baseOidFromUrl.value) {
    const base = baseStore.bases.find(b => b.oid === baseOidFromUrl.value)
    return base?.name || '加载中...'
  }
  return ''
})

// 表格数据 - 与V1.1 L488-571一致
const tableData = computed(() => {
  if (!selectedNode.value.oid) {
    if (baseOidFromUrl.value) {
      return greenhouseStore.greenhouses
        .filter(gh => gh.baseOid === baseOidFromUrl.value)
        .map(gh => ({
          type: 'greenhouse',
          oid: gh.oid,
          code: gh.code || '-',
          name: gh.name || '未命名温室',
          location: gh.location || '-',
          area: gh.area || '-',
          status: gh.status || 'active'
        }))
    }
    return (baseStore.bases || []).map(b => ({
      type: 'base',
      oid: b.oid,
      code: b.code || '-',
      name: b.name || '未命名基地',
      area: b.area || '-',
      status: b.status || 'active'
    }))
  }

  if (selectedNode.value.type === 'base') {
    return greenhouseStore.greenhouses
      .filter(gh => gh.baseOid === selectedNode.value.oid)
      .map(gh => ({
        type: 'greenhouse',
        oid: gh.oid,
        code: gh.code || '-',
        name: gh.name || '未命名温室',
        location: gh.location || '-',
        area: gh.area || '-',
        status: gh.status || 'active'
      }))
  } else if (selectedNode.value.type === 'greenhouse') {
    return zoneStore.zones
      .filter(z => z.greenhouseOid === selectedNode.value.oid)
      .map(z => ({
        type: 'zone',
        oid: z.oid,
        zoneCode: z.zoneCode || '-',
        zoneName: z.zoneName || '未命名区域',
        zoneType: z.zoneType || '-',
        area: z.area || '-',
        status: z.status || 'active'
      }))
  } else if (selectedNode.value.type === 'zone') {
    return blockStore.blocks
      .filter(b => b.zoneOid === selectedNode.value.oid)
      .map(b => ({
        type: 'block',
        oid: b.oid,
        blockCode: b.blockCode || '-',
        blockName: b.blockName || '未命名地块',
        blockType: b.blockType || '-',
        area: b.area || '-',
        status: b.status || 'active'
      }))
  } else if (selectedNode.value.type === 'block') {
    return plantingStore.records
      .filter(r => r.blockOid === selectedNode.value.oid)
      .map(r => ({
        type: 'planting',
        oid: r.oid,
        seasonCode: r.seasonCode || '-',
        cropName: r.cropName || '-',
        varietyName: r.varietyName || '-',
        startDate: r.startDate?.slice(0, 10) || '-',
        status: r.status || '-'
      }))
  }
  return []
})

// 表格列 - 与V1.1 L172-215一致
const tableColumns = computed(() => {
  if (!selectedNode.value.oid || selectedNode.value.type === 'base') {
    return [
      { key: 'code', label: '编码', width: '128' },
      { key: 'name', label: '名称' },
      { key: 'area', label: '面积' },
      { key: 'status', label: '状态', width: '96' },
      { key: 'action', label: '操作', width: '128' }
    ]
  } else if (selectedNode.value.type === 'greenhouse') {
    return [
      { key: 'code', label: '编码', width: '128' },
      { key: 'name', label: '名称' },
      { key: 'location', label: '位置' },
      { key: 'area', label: '面积' },
      { key: 'status', label: '状态', width: '96' },
      { key: 'action', label: '操作', width: '128' }
    ]
  } else if (selectedNode.value.type === 'zone') {
    return [
      { key: 'zoneCode', label: '编码', width: '128' },
      { key: 'zoneName', label: '名称' },
      { key: 'zoneType', label: '类型' },
      { key: 'area', label: '面积' },
      { key: 'status', label: '状态', width: '96' },
      { key: 'action', label: '操作', width: '128' }
    ]
  } else if (selectedNode.value.type === 'block') {
    return [
      { key: 'blockCode', label: '编码', width: '128' },
      { key: 'blockName', label: '名称' },
      { key: 'blockType', label: '类型' },
      { key: 'area', label: '面积' },
      { key: 'status', label: '状态', width: '96' },
      { key: 'action', label: '操作', width: '128' }
    ]
  }
  return []
})

// 统计卡片数据 - 与V1.1 L574-626一致
const stats = computed(() => {
  if (!selectedNode.value.oid) {
    return { totalArea: 0, zoneCount: 0, plantingCount: 0, currentCrop: '-' }
  }

  if (selectedNode.value.type === 'base') {
    const baseGreenhouses = greenhouseStore.greenhouses.filter(gh => gh.baseOid === selectedNode.value.oid)
    const baseZoneOids = new Set(zoneStore.zones.filter(z => baseGreenhouses.some(gh => gh.oid === z.greenhouseOid)).map(z => z.oid))
    const baseRecords = plantingStore.records.filter(r => {
      const block = blockStore.blocks.find(b => b.oid === r.blockOid)
      return block && baseZoneOids.has(block.zoneOid)
    })
    const plantingRecords = baseRecords.filter(r => r.status === 'planting')
    return {
      totalArea: baseGreenhouses.reduce((sum, gh) => sum + (gh.area || 0), 0),
      zoneCount: baseZoneOids.size,
      plantingCount: plantingRecords.length,
      currentCrop: plantingRecords[0]?.cropName || '-'
    }
  } else if (selectedNode.value.type === 'greenhouse') {
    const ghZoneOids = new Set(zoneStore.zones.filter(z => z.greenhouseOid === selectedNode.value.oid).map(z => z.oid))
    const ghRecords = plantingStore.records.filter(r => {
      const block = blockStore.blocks.find(b => b.oid === r.blockOid)
      return block && ghZoneOids.has(block.zoneOid)
    })
    const plantingRecords = ghRecords.filter(r => r.status === 'planting')
    const gh = greenhouseStore.greenhouses.find(g => g.oid === selectedNode.value.oid)
    return {
      totalArea: gh?.area || 0,
      zoneCount: ghZoneOids.size,
      plantingCount: plantingRecords.length,
      currentCrop: plantingRecords[0]?.cropName || '-'
    }
  } else if (selectedNode.value.type === 'zone') {
    const zoneRecords = plantingStore.records.filter(r => {
      const block = blockStore.blocks.find(b => b.oid === r.blockOid)
      return block?.zoneOid === selectedNode.value.oid
    })
    const plantingRecords = zoneRecords.filter(r => r.status === 'planting')
    const zone = zoneStore.zones.find(z => z.oid === selectedNode.value.oid)
    return {
      totalArea: zone?.area || 0,
      zoneCount: 1,
      plantingCount: plantingRecords.length,
      currentCrop: plantingRecords[0]?.cropName || '-'
    }
  }
  return { totalArea: 0, zoneCount: 0, plantingCount: 0, currentCrop: '-' }
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
  const typeMap = { greenhouse: '温室', zone: '区域', block: '地块', planting: '种植记录' }
  return `${modalMode.value === 'add' ? '新增' : '编辑'}${typeMap[modalType.value] || ''}`
})

// 温室面积限制信息
const greenhouseAreaInfo = computed(() => {
  const targetGhOid = selectedNode.value.type === 'greenhouse' && modalMode.value === 'add'
    ? selectedNode.value.oid
    : formData.value.greenhouseOid

  if (!targetGhOid) return null

  const greenhouse = greenhouseStore.greenhouses.find(g => g.oid === targetGhOid)
  if (!greenhouse) return null

  const usedArea = zoneStore.zones
    .filter(z => z.greenhouseOid === targetGhOid)
    .reduce((sum, z) => sum + (z.area || 0), 0)

  return {
    greenhouseName: greenhouse.name,
    totalArea: greenhouse.area || 0,
    usedArea,
    remainingArea: (greenhouse.area || 0) - usedArea
  }
})

// 列表视图过滤数据
const filteredGreenhouses = computed(() => {
  return (greenhouseStore.greenhouses || []).filter(g => !baseOidFromUrl.value || g.baseOid === baseOidFromUrl.value)
})

const filteredZones = computed(() => {
  if (!baseOidFromUrl.value) return zoneStore.zones || []
  const baseGhOids = new Set(filteredGreenhouses.value.map(g => g.oid))
  return (zoneStore.zones || []).filter(z => baseGhOids.has(z.greenhouseOid))
})

const filteredRecords = computed(() => {
  if (!baseOidFromUrl.value) return plantingStore.records || []
  // P1-6: 统一 facilityOid → baseOid 二次查询(与树状视图过滤一致)
  // 列表视图按 baseOid → greenhouseOids → records.facilityOid in greenhouseOids
  const baseGhOids = new Set(filteredGreenhouses.value.map(g => g.oid))
  return (plantingStore.records || []).filter(r => baseGhOids.has(r.facilityOid))
})

// ==================== 事件处理 ====================

function handleNodeClick(data) {
  const [type, oid] = data.key.split('_')
  const typeMap = { base: 'base', gh: 'greenhouse', zone: 'zone', block: 'block' }
  const nameMap = {
    base: (baseStore.bases.find(b => b.oid === oid))?.name || '',
    gh: (greenhouseStore.greenhouses.find(g => g.oid === oid))?.name || '',
    zone: (zoneStore.zones.find(z => z.oid === oid))?.zoneName || '',
    block: (blockStore.blocks.find(b => b.oid === oid))?.blockName || ''
  }
  selectedNode.value = { type: typeMap[type] || 'base', oid, name: nameMap[type] || data.title }
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
  modalMode.value = 'add'
  editingOid.value = null
  if (!selectedNode.value.oid || selectedNode.value.type === 'base') {
    modalType.value = 'greenhouse'
    formData.value = { status: 'active', baseOid: selectedNode.value.oid || baseOidFromUrl.value }
  } else if (selectedNode.value.type === 'greenhouse') {
    modalType.value = 'zone'
    formData.value = { status: 'active', greenhouseOid: selectedNode.value.oid }
  } else if (selectedNode.value.type === 'zone') {
    modalType.value = 'block'
    formData.value = { status: 'active', zoneOid: selectedNode.value.oid }
  } else if (selectedNode.value.type === 'block') {
    modalType.value = 'planting'
    formData.value = { status: 'planting', blockOid: selectedNode.value.oid }
  } else {
    formData.value = { status: 'active' }
  }
  modalVisible.value = true
}

function handleEdit(row) {
  modalMode.value = 'edit'
  editingOid.value = row.oid
  formData.value = { ...row }
  if (row.zoneCode !== undefined) modalType.value = 'zone'
  else if (row.blockCode !== undefined) modalType.value = 'block'
  else if (row.seasonCode !== undefined) modalType.value = 'planting'
  else modalType.value = 'greenhouse'
  modalVisible.value = true
}

async function handleDelete(oid) {
  try {
    await ElMessageBox.confirm('确定要删除吗？删除后无法恢复。', '确认删除', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    })
    if (selectedNode.value.type === 'greenhouse') {
      await greenhouseStore.removeGreenhouse(oid)
    } else if (selectedNode.value.type === 'zone') {
      await zoneStore.removeZone(oid)
    } else if (selectedNode.value.type === 'block') {
      await blockStore.removeBlock(oid)
    }
    loadAllData()
  } catch {}
}

async function handleSubmit() {
  submitting.value = true
  try {
    if (modalMode.value === 'add') {
      if (modalType.value === 'greenhouse') {
        await greenhouseStore.addGreenhouse(formData.value)
      } else if (modalType.value === 'zone') {
        await zoneStore.addZone(formData.value)
      } else if (modalType.value === 'block') {
        await blockStore.addBlock(formData.value)
      } else if (modalType.value === 'planting') {
        await plantingStore.addRecord(formData.value)
      }
    } else {
      if (modalType.value === 'greenhouse') {
        await greenhouseStore.editGreenhouse(editingOid.value, formData.value)
      } else if (modalType.value === 'zone') {
        await zoneStore.editZone(editingOid.value, formData.value)
      } else if (modalType.value === 'block') {
        await blockStore.editBlock(editingOid.value, formData.value)
      } else if (modalType.value === 'planting') {
        await plantingStore.editRecord(editingOid.value, formData.value)
      }
    }
    modalVisible.value = false
    loadAllData()
  } catch (err) {
    ElMessage.error('操作失败')
  } finally {
    submitting.value = false
  }
}

// 列表视图事件处理
async function handleFacilityAdd(data) {
  await greenhouseStore.addGreenhouse(data)
  loadAllData()
}
async function handleFacilityEdit(id, data) {
  await greenhouseStore.editGreenhouse(id, data)
  loadAllData()
}
async function handleFacilityDelete(id) {
  await greenhouseStore.removeGreenhouse(id)
  loadAllData()
}
async function handleZoneAdd(data) {
  await zoneStore.addZone(data)
  loadAllData()
}
async function handleZoneEdit(id, data) {
  await zoneStore.editZone(id, data)
  loadAllData()
}
async function handleZoneDelete(id) {
  await zoneStore.removeZone(id)
  loadAllData()
}
async function handleRecordAdd(data) {
  await plantingStore.addRecord(data)
  loadAllData()
}
async function handleRecordEdit(id, data) {
  await plantingStore.editRecord(id, data)
  loadAllData()
}
async function handleRecordEnd(id, data) {
  await plantingStore.endSeason(id, data)
  loadAllData()
}
async function handleRecordDelete(id) {
  await plantingStore.removeRecord(id)
  loadAllData()
}

// ==================== 数据加载 ====================

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
  } catch (err) {
    console.error('加载数据失败:', err)
  } finally {
    loading.value = false
  }
}

// 自动展开基地节点 - P2-4: 同时监听 bases 变化(基地数据异步加载完成后再展开)
watch([baseOidFromUrl, () => baseStore.bases.length], ([val, basesLen]) => {
  if (val && basesLen > 0) {
    const baseKey = `base_${val}`
    if (!expandedKeys.value.includes(baseKey)) {
      expandedKeys.value = [baseKey]
    }
  }
}, { immediate: true })

onMounted(async () => {
  await dictionaryStore.loadDictionaries()
  greenhouseTypes.value = await getDictItems('greenhouse_type')
  await loadAllData()
})
</script>

<style scoped>
.base-ops-tree :deep(.el-tree-node__content) {
  height: 32px;
}

:deep(.el-table thead) {
  background: linear-gradient(to right, #3b82f6, #2563eb) !important;
  color: white !important;
}

:deep(.el-table thead th.el-table__cell) {
  background: transparent !important;
  color: white !important;
  font-weight: 600;
}
</style>
