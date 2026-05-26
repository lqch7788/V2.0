<template>
  <div>
    <!-- 工具栏 -->
    <div class="flex items-center gap-3 mb-3 flex-wrap">
      <div class="relative flex-1 min-w-[180px] max-w-[240px]">
        <el-input
          v-model="searchTerm"
          placeholder="搜索名称/编码..."
          clearable
          @clear="currentPage = 1"
          @input="currentPage = 1"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <!-- 层级切换 -->
      <div class="flex bg-gray-100 rounded-lg p-0.5">
        <button
          @click="switchLayer('zone')"
          :class="[
            'px-3 py-1 text-sm rounded-md transition-colors',
            activeLayer === 'zone' ? 'bg-white shadow text-blue-600 font-medium' : 'text-gray-600'
          ]"
        >
          区块 ({{ zones.length }})
        </button>
        <button
          @click="switchLayer('block')"
          :class="[
            'px-3 py-1 text-sm rounded-md transition-colors',
            activeLayer === 'block' ? 'bg-white shadow text-blue-600 font-medium' : 'text-gray-600'
          ]"
        >
          地块 ({{ blocks.length }})
        </button>
      </div>

      <!-- 设施筛选（仅区块层显示） -->
      <el-select
        v-if="activeLayer === 'zone'"
        v-model="facilityFilter"
        placeholder="全部设施"
        clearable
        @change="currentPage = 1"
        class="w-36"
      >
        <el-option label="全部设施" value="" />
        <el-option v-for="gh in greenhouses" :key="gh.oid" :label="gh.name" :value="gh.oid" />
      </el-select>

      <el-button type="primary" size="small" @click="handleAdd">
        <el-icon><Plus /></el-icon>新增{{ activeLayer === 'zone' ? '区块' : '地块' }}
      </el-button>
    </div>

    <!-- 表格 -->
    <div v-loading="isLoading">
      <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <!-- 区块表头 -->
              <template v-if="activeLayer === 'zone'">
                <th class="py-3 px-4 text-left font-medium whitespace-nowrap">区块编码</th>
                <th class="py-3 px-4 text-left font-medium whitespace-nowrap">区块名称</th>
                <th class="py-3 px-4 text-left font-medium whitespace-nowrap">所属设施</th>
                <th class="py-3 px-4 text-left font-medium whitespace-nowrap">所属基地</th>
                <th class="py-3 px-4 text-right font-medium whitespace-nowrap">面积(亩)</th>
                <th class="py-3 px-4 text-center font-medium whitespace-nowrap">状态</th>
                <th class="py-3 px-4 text-center font-medium whitespace-nowrap">操作</th>
              </template>
              <!-- 地块表头 -->
              <template v-else>
                <th class="py-3 px-4 text-left font-medium whitespace-nowrap">地块编码</th>
                <th class="py-3 px-4 text-left font-medium whitespace-nowrap">地块名称</th>
                <th class="py-3 px-4 text-left font-medium whitespace-nowrap">所属区块</th>
                <th class="py-3 px-4 text-left font-medium whitespace-nowrap">地块类型</th>
                <th class="py-3 px-4 text-right font-medium whitespace-nowrap">面积(亩)</th>
                <th class="py-3 px-4 text-center font-medium whitespace-nowrap">状态</th>
                <th class="py-3 px-4 text-center font-medium whitespace-nowrap">操作</th>
              </template>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-300 bg-white">
            <!-- 区块数据 -->
            <template v-if="activeLayer === 'zone'">
              <tr v-if="filteredZones.length === 0">
                <td colspan="7" class="px-4 py-12 text-center text-gray-400">
                  <el-icon class="mx-auto mb-2" :size="32"><Grid /></el-icon>
                  <div>暂无区块数据</div>
                </td>
              </tr>
              <tr
                v-for="z in paginatedZones"
                :key="z.oid"
                class="hover:bg-blue-100 transition-colors"
              >
                <td class="py-3 px-4 font-mono whitespace-nowrap">{{ z.zoneCode || '-' }}</td>
                <td class="py-3 px-4 font-medium whitespace-nowrap">{{ z.zoneName }}</td>
                <td class="py-3 px-4 whitespace-nowrap">{{ z.greenhouseName || '-' }}</td>
                <td class="py-3 px-4 whitespace-nowrap">{{ z.baseName || '-' }}</td>
                <td class="py-3 px-4 text-right whitespace-nowrap">{{ z.area || 0 }}</td>
                <td class="py-3 px-4 text-center whitespace-nowrap">
                  <el-tag :type="z.status === 'active' ? 'success' : 'info'" size="small">
                    {{ z.status === 'active' ? '活跃' : '停用' }}
                  </el-tag>
                </td>
                <td class="py-3 px-4 text-center whitespace-nowrap">
                  <div class="flex items-center justify-center gap-1">
                    <el-button link @click="handleEdit(z, 'zone')" class="text-blue-500 hover:text-blue-600" title="编辑">
                      <el-icon><Edit /></el-icon>
                    </el-button>
                    <el-button link @click="handleDeleteConfirm(z, 'zone')" class="text-red-500 hover:text-red-600" title="删除">
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </div>
                </td>
              </tr>
            </template>
            <!-- 地块数据 -->
            <template v-else>
              <tr v-if="blocks.length === 0">
                <td colspan="7" class="px-4 py-12 text-center text-gray-400">
                  <el-icon class="mx-auto mb-2" :size="32"><Grid /></el-icon>
                  <div>暂无地块数据</div>
                </td>
              </tr>
              <tr
                v-for="b in paginatedBlocks"
                :key="b.oid"
                class="hover:bg-blue-100 transition-colors"
              >
                <td class="py-3 px-4 font-mono whitespace-nowrap">{{ b.blockCode || '-' }}</td>
                <td class="py-3 px-4 font-medium whitespace-nowrap">{{ b.blockName }}</td>
                <td class="py-3 px-4 whitespace-nowrap">{{ b.zoneName || '-' }}</td>
                <td class="py-3 px-4 whitespace-nowrap">{{ b.blockType || '-' }}</td>
                <td class="py-3 px-4 text-right whitespace-nowrap">{{ b.area || 0 }}</td>
                <td class="py-3 px-4 text-center whitespace-nowrap">
                  <el-tag :type="b.status === 'active' ? 'success' : 'info'" size="small">
                    {{ b.status === 'active' ? '活跃' : '停用' }}
                  </el-tag>
                </td>
                <td class="py-3 px-4 text-center whitespace-nowrap">
                  <div class="flex items-center justify-center gap-1">
                    <el-button link @click="handleEdit(b, 'block')" class="text-blue-500 hover:text-blue-600" title="编辑">
                      <el-icon><Edit /></el-icon>
                    </el-button>
                    <el-button link @click="handleDeleteConfirm(b, 'block')" class="text-red-500 hover:text-red-600" title="删除">
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- 分页 -->
      <div v-if="(activeLayer === 'zone' ? filteredZones.length : blocks.length) > 0" class="flex items-center justify-between mt-3 px-4 py-3 border-t border-gray-100">
        <div class="text-sm text-gray-500">
          共 {{ activeLayer === 'zone' ? filteredZones.length : blocks.length }} 条
        </div>
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="PAGE_SIZE"
          :page-sizes="[10, 20, 50]"
          :total="activeLayer === 'zone' ? filteredZones.length : blocks.length"
          layout="sizes, prev, pager, next"
          @size-change="currentPage = 1"
        />
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="editingItem ? '编辑' + (activeLayer === 'zone' ? '区块' : '地块') : '新增' + (activeLayer === 'zone' ? '区块' : '地块')"
      width="540px"
      :close-on-click-modal="false"
    >
      <div class="space-y-3 max-h-[55vh] overflow-y-auto">
        <!-- 区块表单 -->
        <template v-if="activeLayer === 'zone'">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs text-gray-600 mb-1">区块名称 <span class="text-red-500">*</span></label>
              <el-input v-model="formData.zoneName" placeholder="区块名称" />
            </div>
            <div>
              <label class="block text-xs text-gray-600 mb-1">区块编码</label>
              <el-input v-model="formData.zoneCode" placeholder="区块编码" />
            </div>
            <div>
              <label class="block text-xs text-gray-600 mb-1">所属设施</label>
              <el-select v-model="formData.greenhouseOid" placeholder="请选择" class="w-full" @change="handleGreenhouseChange">
                <el-option label="请选择" value="" />
                <el-option v-for="gh in greenhouses" :key="gh.oid" :label="gh.name" :value="gh.oid" />
              </el-select>
            </div>
            <div>
              <label class="block text-xs text-gray-600 mb-1">面积(亩)</label>
              <el-input-number v-model="formData.area" :min="0" class="w-full" />
            </div>
          </div>
        </template>
        <!-- 地块表单 -->
        <template v-else>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs text-gray-600 mb-1">地块名称 <span class="text-red-500">*</span></label>
              <el-input v-model="formData.blockName" placeholder="地块名称" />
            </div>
            <div>
              <label class="block text-xs text-gray-600 mb-1">地块编码</label>
              <el-input v-model="formData.blockCode" placeholder="地块编码" />
            </div>
            <div>
              <label class="block text-xs text-gray-600 mb-1">所属区块</label>
              <el-select v-model="formData.zoneOid" placeholder="请选择" class="w-full" @change="handleZoneChange">
                <el-option label="请选择" value="" />
                <el-option v-for="z in zones" :key="z.oid" :label="z.zoneName" :value="z.oid" />
              </el-select>
            </div>
            <div>
              <label class="block text-xs text-gray-600 mb-1">地块类型</label>
              <el-select v-model="formData.blockType" placeholder="请选择" class="w-full">
                <el-option label="请选择" value="" />
                <el-option v-for="opt in blockTypes" :key="opt.dictCode" :label="opt.dictLabel" :value="opt.dictLabel" />
              </el-select>
            </div>
            <div>
              <label class="block text-xs text-gray-600 mb-1">面积(亩)</label>
              <el-input-number v-model="formData.area" :min="0" class="w-full" />
            </div>
          </div>
        </template>
        <div>
          <label class="block text-xs text-gray-600 mb-1">状态</label>
          <el-select v-model="formData.status" class="w-32">
            <el-option label="活跃" value="active" />
            <el-option label="停用" value="inactive" />
          </el-select>
        </div>
      </div>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>

    <!-- 删除确认弹窗 -->
    <el-dialog v-model="deleteDialogVisible" title="确认删除" width="400px">
      <p class="text-sm text-gray-500">
        确定要删除「<span class="font-medium text-gray-700">{{ deleteItem?.name }}</span>」吗？
      </p>
      <template #footer>
        <el-button @click="deleteDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="handleDelete">确认删除</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Search, Plus, Edit, Delete, Grid } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useZoneStore, useBlockStore, useGreenhouseStore } from '@/stores'

const PAGE_SIZE = 10

// Stores
const zoneStore = useZoneStore()
const blockStore = useBlockStore()
const greenhouseStore = useGreenhouseStore()

// 状态
const zones = ref([])
const blocks = ref([])
const greenhouses = ref([])
const loading = ref(false)
const searchTerm = ref('')
const facilityFilter = ref('')
const currentPage = ref(1)
const activeLayer = ref('zone')
const dialogVisible = ref(false)
const deleteDialogVisible = ref(false)
const editingItem = ref(null)
const deleteItem = ref(null)
const deleteType = ref('')

// 地块类型选项
const blockTypes = [
  { dictCode: 'planting', dictLabel: '种植区' },
  { dictCode: 'fallow', dictLabel: '休耕区' },
  { dictCode: 'nursery', dictLabel: '育苗区' },
  { dictCode: 'experimental', dictLabel: '试验区' }
]

// 表单数据
const formData = ref({
  zoneName: '',
  zoneCode: '',
  greenhouseOid: '',
  greenhouseName: '',
  baseOid: '',
  baseName: '',
  area: 0,
  blockName: '',
  blockCode: '',
  zoneOid: '',
  zoneName: '',
  blockType: '',
  status: 'active'
})

// 区块loading状态
const isLoading = computed(() => loading.value)

// 筛选后的区块
const filteredZones = computed(() => {
  return zones.value.filter(z => {
    const matchSearch = !searchTerm.value ||
      (z.zoneName || '').toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      (z.zoneCode || '').toLowerCase().includes(searchTerm.value.toLowerCase())
    const matchFacility = !facilityFilter.value || z.greenhouseOid === facilityFilter.value
    return matchSearch && matchFacility
  })
})

// 分页后的区块
const paginatedZones = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return filteredZones.value.slice(start, start + PAGE_SIZE)
})

// 分页后的地块
const paginatedBlocks = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return blocks.value.slice(start, start + PAGE_SIZE)
})

// 切换层级
const switchLayer = (layer) => {
  activeLayer.value = layer
  currentPage.value = 1
}

// 设施变更 - 联动填充基地信息
const handleGreenhouseChange = (ghOid) => {
  const gh = greenhouses.value.find(g => g.oid === ghOid)
  if (gh) {
    formData.value.greenhouseOid = ghOid
    formData.value.greenhouseName = gh.name
    formData.value.baseOid = gh.baseOid
    formData.value.baseName = gh.baseName
  } else {
    formData.value.greenhouseOid = ''
    formData.value.greenhouseName = ''
    formData.value.baseOid = ''
    formData.value.baseName = ''
  }
}

// 区块变更 - 联动填充区块信息
const handleZoneChange = (zoneOid) => {
  const zone = zones.value.find(z => z.oid === zoneOid)
  if (zone) {
    formData.value.zoneOid = zoneOid
    formData.value.zoneName = zone.zoneName
    formData.value.zoneCode = zone.zoneCode
  } else {
    formData.value.zoneOid = ''
    formData.value.zoneName = ''
    formData.value.zoneCode = ''
  }
}

// 加载数据
const loadData = async () => {
  loading.value = true
  await Promise.all([
    zoneStore.loadZones(),
    blockStore.loadBlocks(),
    greenhouseStore.loadGreenhouses()
  ])
  zones.value = zoneStore.zones
  blocks.value = blockStore.blocks
  greenhouses.value = greenhouseStore.greenhouses
  loading.value = false
}

// 新增
const handleAdd = () => {
  editingItem.value = null
  formData.value = {
    zoneName: '',
    zoneCode: '',
    greenhouseOid: '',
    greenhouseName: '',
    baseOid: '',
    baseName: '',
    area: 0,
    blockName: '',
    blockCode: '',
    zoneOid: '',
    zoneName: '',
    blockType: '',
    status: 'active'
  }
  dialogVisible.value = true
}

// 编辑
const handleEdit = (item, type) => {
  editingItem.value = item
  if (type === 'zone') {
    formData.value = {
      zoneName: item.zoneName,
      zoneCode: item.zoneCode,
      greenhouseOid: item.greenhouseOid || '',
      greenhouseName: item.greenhouseName || '',
      baseOid: item.baseOid || '',
      baseName: item.baseName || '',
      area: item.area || 0,
      status: item.status || 'active'
    }
  } else {
    formData.value = {
      blockName: item.blockName,
      blockCode: item.blockCode,
      zoneOid: item.zoneOid || '',
      zoneName: item.zoneName || '',
      zoneCode: item.zoneCode || '',
      blockType: item.blockType || '',
      area: item.area || 0,
      status: item.status || 'active'
    }
  }
  dialogVisible.value = true
}

// 保存
const handleSave = async () => {
  try {
    if (activeLayer.value === 'zone') {
      if (!formData.value.zoneName) {
        ElMessage.warning('请填写区块名称')
        return
      }
      if (editingItem.value) {
        await zoneStore.editZone(editingItem.value.oid, formData.value)
      } else {
        await zoneStore.addZone(formData.value)
      }
      ElMessage.success(editingItem.value ? '编辑成功' : '新增成功')
    } else {
      if (!formData.value.blockName) {
        ElMessage.warning('请填写地块名称')
        return
      }
      if (editingItem.value) {
        await blockStore.editBlock(editingItem.value.oid, formData.value)
      } else {
        await blockStore.addBlock(formData.value)
      }
      ElMessage.success(editingItem.value ? '编辑成功' : '新增成功')
    }
    dialogVisible.value = false
    await loadData()
  } catch (err) {
    ElMessage.error('保存失败')
  }
}

// 删除确认
const handleDeleteConfirm = (item, type) => {
  deleteItem.value = { oid: item.oid, name: type === 'zone' ? item.zoneName : item.blockName }
  deleteType.value = type
  deleteDialogVisible.value = true
}

// 删除
const handleDelete = async () => {
  try {
    if (deleteType.value === 'zone') {
      await zoneStore.removeZone(deleteItem.value.oid)
    } else {
      await blockStore.removeBlock(deleteItem.value.oid)
    }
    deleteDialogVisible.value = false
    await loadData()
  } catch (err) {
    ElMessage.error('删除失败')
  }
}

// 生命周期
onMounted(() => {
  loadData()
})
</script>
