<template>
  <div>
    <!-- 工具栏 -->
    <div class="flex items-center gap-3 mb-3 flex-wrap">
      <div class="relative flex-1 min-w-[180px] max-w-[240px]">
        <el-input
          v-model="searchTerm"
          placeholder="搜索设施名称/编码..."
          clearable
          @clear="currentPage = 1"
          @input="currentPage = 1"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
      <!-- 基地筛选 -->
      <el-select v-model="baseFilter" placeholder="全部基地" clearable @change="currentPage = 1" class="w-36">
        <el-option label="全部基地" value="" />
        <el-option v-for="base in bases" :key="base.oid" :label="base.name" :value="base.oid" />
      </el-select>
      <!-- 设施类型筛选 -->
      <el-select v-model="typeFilter" placeholder="全部类型" clearable @change="currentPage = 1" class="w-36">
        <el-option label="全部类型" value="" />
        <el-option v-for="opt in greenhouseTypes" :key="opt.dictCode" :label="opt.dictLabel" :value="opt.dictCode" />
      </el-select>
      <el-button type="primary" size="small" @click="handleAdd">
        <el-icon><Plus /></el-icon>新增设施
      </el-button>
    </div>

    <!-- 表格 -->
    <div v-loading="loading">
      <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <th class="py-3 px-4 text-left font-medium whitespace-nowrap">设施编码</th>
              <th class="py-3 px-4 text-left font-medium whitespace-nowrap">设施名称</th>
              <th class="py-3 px-4 text-left font-medium whitespace-nowrap">设施类型</th>
              <th class="py-3 px-4 text-left font-medium whitespace-nowrap">所属基地</th>
              <th class="py-3 px-4 text-right font-medium whitespace-nowrap">面积</th>
              <!-- P1-1: 补"单位"列(对齐 V1.1 BaseOperationsCenter L262) -->
              <th class="py-3 px-4 text-center font-medium whitespace-nowrap">单位</th>
              <!-- P1-1: 补"种植类型"列(对齐 V1.1 L263) -->
              <th class="py-3 px-4 text-center font-medium whitespace-nowrap">种植类型</th>
              <th class="py-3 px-4 text-left font-medium whitespace-nowrap">当前位置</th>
              <th class="py-3 px-4 text-center font-medium whitespace-nowrap">状态</th>
              <!-- P1-1: 补"备注"列(对齐 V1.1 L265) -->
              <th class="py-3 px-4 text-left font-medium whitespace-nowrap">备注</th>
              <th class="py-3 px-4 text-center font-medium whitespace-nowrap">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-300 bg-white">
            <tr v-if="paginated.length === 0">
              <td colspan="11" class="px-4 py-12 text-center text-gray-400">
                <el-icon class="mx-auto mb-2" :size="32"><MapLocation /></el-icon>
                <div>暂无设施数据</div>
              </td>
            </tr>
            <tr
              v-for="gh in paginated"
              :key="gh.oid"
              class="hover:bg-blue-100 transition-colors"
            >
              <td class="py-3 px-4 font-mono whitespace-nowrap">{{ gh.code || '-' }}</td>
              <td class="py-3 px-4 font-medium whitespace-nowrap">{{ gh.name }}</td>
              <td class="py-3 px-4 whitespace-nowrap">{{ gh.greenhouseType || '-' }}</td>
              <td class="py-3 px-4 whitespace-nowrap">{{ gh.baseName || '-' }}</td>
              <td class="py-3 px-4 text-right whitespace-nowrap">{{ gh.area || 0 }}</td>
              <!-- P1-1: 单位单元格 -->
              <td class="py-3 px-4 text-center whitespace-nowrap">{{ gh.unit || '亩' }}</td>
              <!-- P1-1: 种植类型单元格(对齐 V1.1 L281-286 映射) -->
              <td class="py-3 px-4 text-center whitespace-nowrap">{{ getCropTypeLabel(gh.crop) }}</td>
              <td class="py-3 px-4 whitespace-nowrap">{{ gh.location || '-' }}</td>
              <td class="py-3 px-4 text-center whitespace-nowrap">
                <el-tag :type="gh.status === 'active' ? 'success' : 'info'" size="small">
                  {{ gh.status === 'active' ? '活跃' : '停用' }}
                </el-tag>
              </td>
              <!-- P1-1: 备注单元格 -->
              <td class="py-3 px-4 whitespace-nowrap truncate max-w-[160px]" :title="gh.description || '-'">{{ gh.description || '-' }}</td>
              <td class="py-3 px-4 text-center whitespace-nowrap">
                <div class="flex items-center justify-center gap-1">
                  <el-button link @click="handleEdit(gh)" class="text-blue-500 hover:text-blue-600" title="编辑">
                    <el-icon><Edit /></el-icon>
                  </el-button>
                  <el-button link @click="handleDeleteConfirm(gh)" class="text-red-500 hover:text-red-600" title="删除">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页 -->
      <div v-if="filtered.length > 0" class="flex items-center justify-between mt-3 px-4 py-3 border-t border-gray-100">
        <div class="text-sm text-gray-500">共 {{ filtered.length }} 条</div>
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="PAGE_SIZE"
          :page-sizes="[10, 20, 50]"
          :total="filtered.length"
          layout="sizes, prev, pager, next"
          @size-change="currentPage = 1"
        />
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="editingItem ? '编辑设施' : '新增设施'"
      width="720px"
      :close-on-click-modal="false"
    >
      <div class="space-y-3 max-h-[60vh] overflow-y-auto">
        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="block text-xs text-gray-600 mb-1">设施名称 <span class="text-red-500">*</span></label>
            <el-input v-model="formData.name" placeholder="设施名称" />
          </div>
          <div>
            <label class="block text-xs text-gray-600 mb-1">设施编码 <span class="text-red-500">*</span></label>
            <div class="flex gap-2">
              <el-input v-model="formData.code" placeholder="设施编码" class="flex-1" />
              <el-button
                v-if="!editingItem"
                size="small"
                :disabled="!formData.baseOid"
                @click="handleGenerateGreenhouseCode"
              >
                生成
              </el-button>
            </div>
          </div>
          <div>
            <label class="block text-xs text-gray-600 mb-1">设施类型</label>
            <el-select v-model="formData.greenhouseType" placeholder="请选择" class="w-full">
              <el-option label="请选择" value="" />
              <el-option v-for="opt in greenhouseTypes" :key="opt.dictCode" :label="opt.dictLabel" :value="opt.dictCode" />
            </el-select>
          </div>
          <div>
            <label class="block text-xs text-gray-600 mb-1">所属基地</label>
            <el-select v-model="formData.baseOid" placeholder="请选择" class="w-full" @change="handleBaseChange">
              <el-option label="请选择" value="" />
              <el-option v-for="base in bases" :key="base.oid" :label="base.name" :value="base.oid" />
            </el-select>
          </div>
          <div>
            <label class="block text-xs text-gray-600 mb-1">面积</label>
            <el-input-number v-model="formData.area" :min="0" class="w-full" />
          </div>
          <!-- P1-2: 补"单位"字段(对齐 V1.1 L360-364) -->
          <div>
            <label class="block text-xs text-gray-600 mb-1">单位</label>
            <el-select v-model="formData.unit" class="w-full">
              <el-option label="亩" value="亩" />
              <el-option label="公顷" value="公顷" />
              <el-option label="平方米" value="平方米" />
            </el-select>
          </div>
          <div>
            <label class="block text-xs text-gray-600 mb-1">位置</label>
            <el-input v-model="formData.location" placeholder="位置" />
          </div>
          <!-- P1-2: 补"种植类型"下拉(对齐 V1.1 L365-373) -->
          <div>
            <label class="block text-xs text-gray-600 mb-1">种植类型</label>
            <el-select v-model="formData.crop" class="w-full">
              <el-option label="请选择" value="" />
              <el-option label="蔬菜" value="vegetable" />
              <el-option label="粮食" value="grain" />
              <el-option label="水果" value="fruit" />
              <el-option label="其他" value="other" />
            </el-select>
          </div>
          <div>
            <label class="block text-xs text-gray-600 mb-1">状态</label>
            <el-select v-model="formData.status" class="w-full">
              <el-option label="活跃" value="active" />
              <el-option label="停用" value="inactive" />
            </el-select>
          </div>
        </div>
        <!-- P1-2: 补"备注"textarea(对齐 V1.1 L383-385) -->
        <div>
          <label class="block text-xs text-gray-600 mb-1">备注</label>
          <el-input v-model="formData.description" type="textarea" :rows="2" placeholder="备注" />
        </div>
      </div>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>

    <!-- 删除确认弹窗 - P1-5: 增强"影响范围"提示 -->
    <el-dialog v-model="deleteDialogVisible" title="删除设施警告" width="480px">
      <div class="space-y-3">
        <div class="flex items-start gap-3">
          <el-icon :size="22" color="#ef4444"><WarningFilled /></el-icon>
          <div class="text-sm">
            <p class="font-medium text-gray-800 mb-2">
              确定要删除设施「<span class="font-semibold text-red-600">{{ selectedItem?.name }}</span>」吗？
            </p>
            <!-- P1-5: 影响范围提示 -->
            <div class="text-xs text-gray-600 bg-red-50 border border-red-100 rounded px-3 py-2">
              <p class="font-medium text-red-700 mb-1">影响范围：</p>
              <ul class="list-disc pl-4 space-y-0.5">
                <li>该设施下的<span class="font-semibold">所有区块、地块</span>将被级联删除</li>
                <li>该设施关联的<span class="font-semibold">种植记录</span>将无法读取</li>
                <li>请提前备份数据，删除后<span class="font-semibold text-red-600">不可恢复</span></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="deleteDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="handleDelete">确认删除</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Search, Plus, Edit, Delete, MapLocation, WarningFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useGreenhouseStore, useBaseStore } from '@/stores'
import { getDictionaries } from '@/services/dictionaryService'

const PAGE_SIZE = 10

// Stores
const greenhouseStore = useGreenhouseStore()
const baseStore = useBaseStore()

// 状态 — 直接从Store获取，保持响应式
const bases = computed(() => baseStore.bases)
const loading = computed(() => greenhouseStore.loading || baseStore.loading)
const searchTerm = ref('')
const baseFilter = ref('')
const typeFilter = ref('')
const currentPage = ref(1)
const dialogVisible = ref(false)
const deleteDialogVisible = ref(false)
const editingItem = ref(null)
const selectedItem = ref(null)

// 设施类型选项（从字典加载）
const greenhouseTypes = ref([])

// 获取设施类型标签
const getGreenhouseTypeLabel = (typeCode) => {
  const found = greenhouseTypes.value.find(t => t.dictCode === typeCode)
  return found ? found.dictLabel : typeCode || '-'
}

// P1-1: 种植类型 code → label 映射(对齐 V1.1 L281-286)
const getCropTypeLabel = (cropCode) => {
  switch (cropCode) {
    case 'vegetable': return '蔬菜'
    case 'grain': return '粮食'
    case 'fruit': return '水果'
    case 'other': return '其他'
    default: return cropCode || '-'
  }
}

// 设施数据 — 从Store获取，保持响应式，自动转换类型代码为标签
const greenhouses = computed(() => {
  return greenhouseStore.greenhouses.map(gh => ({
    ...gh,
    greenhouseType: getGreenhouseTypeLabel(gh.greenhouseType)
  }))
})

// 表单数据 - P1-2: 补 unit/description 字段
const formData = ref({
  name: '',
  code: '',
  greenhouseType: '',
  baseOid: '',
  baseName: '',
  area: 0,
  unit: '亩',
  location: '',
  crop: '',
  description: '',
  status: 'active'
})

// 筛选后的数据
const filtered = computed(() => {
  return greenhouses.value.filter(gh => {
    const matchSearch = !searchTerm.value ||
      (gh.name || '').toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      (gh.code || '').toLowerCase().includes(searchTerm.value.toLowerCase())
    const matchBase = !baseFilter.value || gh.baseOid === baseFilter.value
    const matchType = !typeFilter.value || gh.greenhouseType === typeFilter.value
    return matchSearch && matchBase && matchType
  })
})

// 分页后的数据
const paginated = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return filtered.value.slice(start, start + PAGE_SIZE)
})

// 加载数据
const loadData = async () => {
  try {
    await Promise.all([
      greenhouseStore.loadGreenhouses(),
      baseStore.loadBases()
    ])
  } catch (err) {
    ElMessage.error('加载数据失败')
  }
}

// 新增 - P1-2: 补 unit/description 默认值
const handleAdd = () => {
  editingItem.value = null
  formData.value = {
    name: '',
    code: '',
    greenhouseType: '',
    baseOid: '',
    baseName: '',
    area: 0,
    unit: '亩',
    location: '',
    crop: '',
    description: '',
    status: 'active'
  }
  dialogVisible.value = true
}

// 编辑
const handleEdit = (gh) => {
  editingItem.value = gh
  // 反向查找类型代码
  const typeCode = greenhouseTypes.value.find(t => t.dictLabel === gh.greenhouseType)?.dictCode || gh.greenhouseType
  formData.value = {
    ...gh,
    greenhouseType: typeCode,
    unit: gh.unit || '亩',
    description: gh.description || ''
  }
  dialogVisible.value = true
}

// 基地变更
const handleBaseChange = (baseOid) => {
  const base = bases.value.find(b => b.oid === baseOid)
  if (base) {
    formData.value.baseName = base.name
  }
}

// P0-5: 调用 /api/code-generator/next-greenhouse-code 生成设施编码
const handleGenerateGreenhouseCode = async () => {
  if (!formData.value.baseOid) {
    ElMessage.warning('请先选择所属基地')
    return
  }
  try {
    const res = await fetch(`/api/code-generator/next-greenhouse-code?baseOid=${formData.value.baseOid}`)
    const json = await res.json()
    if (json.success && json.data?.code) {
      formData.value.code = json.data.code
    } else {
      ElMessage.error(json.error || '生成编码失败')
    }
  } catch (err) {
    ElMessage.error('生成编码失败，请检查网络')
  }
}

// 保存 - P2-8: 补 toast 成功提示(对齐 V1.1 行为)
const handleSave = async () => {
  if (!formData.value.name || !formData.value.code) {
    ElMessage.warning('请填写设施名称和编码')
    return
  }
  try {
    // 转换类型代码为标签
    const typeLabel = getGreenhouseTypeLabel(formData.value.greenhouseType)
    const dataToSave = {
      ...formData.value,
      greenhouseType: typeLabel
    }

    if (editingItem.value) {
      await greenhouseStore.editGreenhouse(editingItem.value.oid, dataToSave)
      ElMessage.success('设施已更新')
    } else {
      await greenhouseStore.addGreenhouse(dataToSave)
      ElMessage.success('设施已新增')
    }
    dialogVisible.value = false
    await loadData()
  } catch (err) {
    ElMessage.error('保存失败')
  }
}

// 删除确认
const handleDeleteConfirm = (gh) => {
  selectedItem.value = gh
  deleteDialogVisible.value = true
}

// 删除 - P2-8: 补 toast 成功提示
const handleDelete = async () => {
  try {
    await greenhouseStore.removeGreenhouse(selectedItem.value.oid)
    ElMessage.success('设施已删除')
    deleteDialogVisible.value = false
    await loadData()
  } catch (err) {
    ElMessage.error('删除失败')
  }
}

// 生命周期
onMounted(async () => {
  // 加载设施类型字典 - 即使失败也继续加载设施数据
  try {
    const dicts = await getDictionaries('greenhouse_type')
    greenhouseTypes.value = dicts.map(d => ({
      dictCode: d.code,
      dictLabel: d.name
    }))
  } catch (err) {
    // 忽略字典加载错误，继续加载设施数据
  }

  // 加载设施和基地数据
  await loadData()
})
</script>
