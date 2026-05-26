<template>
  <div class="flex gap-4">
    <!-- 左侧：公司列表 -->
    <div class="w-56 flex-shrink-0">
      <div class="bg-white rounded-lg border border-gray-200 p-3">
        <h3 class="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
          <el-icon color="#3B82F6"><House /></el-icon>
          公司列表
        </h3>
        <!-- 统计卡片 -->
        <div class="grid grid-cols-3 gap-1 mb-3">
          <div class="text-center p-1 bg-blue-50 rounded">
            <div class="text-sm font-bold text-blue-600">{{ stats.companyCount }}</div>
            <div class="text-[10px] text-gray-500">公司</div>
          </div>
          <div class="text-center p-1 bg-green-50 rounded">
            <div class="text-sm font-bold text-green-600">{{ stats.baseCount }}</div>
            <div class="text-[10px] text-gray-500">基地</div>
          </div>
          <div class="text-center p-1 bg-amber-50 rounded">
            <div class="text-sm font-bold text-amber-600">{{ stats.totalArea }}</div>
            <div class="text-[10px] text-gray-500">总面积</div>
          </div>
        </div>
        <div class="space-y-0.5 max-h-[500px] overflow-y-auto">
          <el-button
            text
            size="small"
            @click="selectedCompanyId = ''"
            :class="['w-full text-left justify-start', selectedCompanyId === '' ? 'bg-blue-50 text-blue-600' : '']"
          >
            全部公司 ({{ bases.length }})
          </el-button>
          <el-button
            v-for="company in companies"
            :key="company.id"
            text
            size="small"
            @click="selectedCompanyId = company.id"
            :class="['w-full text-left justify-start truncate', selectedCompanyId === company.id ? 'bg-blue-50 text-blue-600' : '']"
            :title="company.name"
          >
            <span class="truncate">{{ company.name }}</span>
            <span class="text-gray-400 ml-1">{{ company.count }}</span>
          </el-button>
        </div>
      </div>
    </div>

    <!-- 右侧：基地表格 -->
    <div class="flex-1 min-w-0">
      <!-- 工具栏 -->
      <div class="flex items-center gap-3 mb-3 flex-wrap">
        <div class="relative flex-1 min-w-[200px] max-w-xs">
          <el-input
            v-model="searchTerm"
            placeholder="搜索基地名称/编码..."
            clearable
            @clear="currentPage = 1"
            @input="currentPage = 1"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        <el-button type="primary" size="small" @click="handleAdd">
          <el-icon><Plus /></el-icon>新增基地
        </el-button>
      </div>

      <!-- 表格 -->
      <div v-loading="loading">
        <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <th class="py-3 px-4 text-left font-medium whitespace-nowrap">基地编码</th>
                <th class="py-3 px-4 text-left font-medium whitespace-nowrap">基地名称</th>
                <th class="py-3 px-4 text-left font-medium whitespace-nowrap">所属公司</th>
                <th class="py-3 px-4 text-right font-medium whitespace-nowrap">面积(亩)</th>
                <th class="py-3 px-4 text-left font-medium whitespace-nowrap">所在地区</th>
                <th class="py-3 px-4 text-left font-medium whitespace-nowrap">负责人</th>
                <th class="py-3 px-4 text-left font-medium whitespace-nowrap">联系电话</th>
                <th class="py-3 px-4 text-center font-medium whitespace-nowrap">状态</th>
                <th class="py-3 px-4 text-center font-medium whitespace-nowrap">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-300 bg-white">
              <tr v-if="paginatedBases.length === 0">
                <td colspan="9" class="px-4 py-12 text-center text-gray-400">
                  <el-icon class="mx-auto mb-2" :size="32"><MapLocation /></el-icon>
                  <div>暂无基地数据，点击"新增基地"开始</div>
                </td>
              </tr>
              <tr
                v-for="base in paginatedBases"
                :key="base.oid"
                class="hover:bg-blue-100 transition-colors"
              >
                <td class="py-3 px-4 font-mono whitespace-nowrap">{{ base.code || '-' }}</td>
                <td class="py-3 px-4 font-medium whitespace-nowrap">{{ base.name }}</td>
                <td class="py-3 px-4 whitespace-nowrap">{{ base.companyName || '-' }}</td>
                <td class="py-3 px-4 text-right whitespace-nowrap">{{ base.area || 0 }}</td>
                <td class="py-3 px-4 whitespace-nowrap">{{ [base.province, base.city].filter(Boolean).join(' ') || '-' }}</td>
                <td class="py-3 px-4 whitespace-nowrap">{{ base.manager || '-' }}</td>
                <td class="py-3 px-4 whitespace-nowrap">{{ base.phone || '-' }}</td>
                <td class="py-3 px-4 text-center whitespace-nowrap">
                  <el-tag :type="base.status === 'active' ? 'success' : 'info'" size="small">
                    {{ base.status === 'active' ? '活跃' : '停用' }}
                  </el-tag>
                </td>
                <td class="py-3 px-4 text-center whitespace-nowrap">
                  <div class="flex items-center justify-center gap-1">
                    <el-button link @click="handleEdit(base)" class="text-blue-500 hover:text-blue-600" title="编辑">
                      <el-icon><Edit /></el-icon>
                    </el-button>
                    <el-button link @click="handleDeleteConfirm(base)" class="text-red-500 hover:text-red-600" title="删除">
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 分页 -->
        <div v-if="filteredBases.length > 0" class="flex items-center justify-between mt-3 px-4 py-3 border-t border-gray-100">
          <div class="text-sm text-gray-500">共 {{ filteredBases.length }} 条</div>
          <el-pagination
            v-model:current-page="currentPage"
            :page-size="PAGE_SIZE"
            :page-sizes="[10, 20, 50]"
            :total="filteredBases.length"
            layout="sizes, prev, pager, next"
            @size-change="currentPage = 1"
          />
        </div>
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="editingBase ? '编辑基地' : '新增基地'"
      width="640px"
      :close-on-click-modal="false"
    >
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs text-gray-600 mb-1">基地名称 <span class="text-red-500">*</span></label>
            <el-input v-model="formData.name" placeholder="基地名称" />
          </div>
          <div>
            <label class="block text-xs text-gray-600 mb-1">基地编码</label>
            <el-input v-model="formData.code" placeholder="基地编码" />
          </div>
          <div>
            <label class="block text-xs text-gray-600 mb-1">所属公司 <span class="text-red-500">*</span></label>
            <el-input v-model="formData.companyName" placeholder="所属公司" />
          </div>
          <div>
            <label class="block text-xs text-gray-600 mb-1">面积</label>
            <div class="flex gap-1">
              <el-input-number v-model="formData.area" :min="0" class="flex-1" />
              <el-select v-model="formData.unit" class="w-24">
                <el-option label="亩" value="亩" />
                <el-option label="公顷" value="公顷" />
                <el-option label="平方米" value="平方米" />
              </el-select>
            </div>
          </div>
          <div>
            <label class="block text-xs text-gray-600 mb-1">省份</label>
            <el-input v-model="formData.province" placeholder="省份" />
          </div>
          <div>
            <label class="block text-xs text-gray-600 mb-1">城市</label>
            <el-input v-model="formData.city" placeholder="城市" />
          </div>
          <div>
            <label class="block text-xs text-gray-600 mb-1">负责人</label>
            <el-input v-model="formData.manager" placeholder="负责人" />
          </div>
          <div>
            <label class="block text-xs text-gray-600 mb-1">联系电话</label>
            <el-input v-model="formData.phone" placeholder="联系电话" />
          </div>
          <div>
            <label class="block text-xs text-gray-600 mb-1">土壤类型</label>
            <el-input v-model="formData.soilType" placeholder="土壤类型" />
          </div>
          <div>
            <label class="block text-xs text-gray-600 mb-1">pH值</label>
            <el-input-number v-model="formData.ph" :min="0" :step="0.1" class="w-full" />
          </div>
        </div>
        <div>
          <label class="block text-xs text-gray-600 mb-1">简介</label>
          <el-input v-model="formData.intro" type="textarea" :rows="2" placeholder="简介" />
        </div>
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
        确定要删除基地「<span class="font-medium text-gray-700">{{ selectedBase?.name }}</span>」吗？此操作不可恢复。
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
import { Search, Plus, Edit, Delete, MapLocation, House } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useBaseStore } from '@/stores'

const PAGE_SIZE = 10

// Store
const baseStore = useBaseStore()

// 状态 — 直接从Store获取，保持响应式
const bases = computed(() => baseStore.bases)
const loading = computed(() => baseStore.loading)
const searchTerm = ref('')
const selectedCompanyId = ref('')
const currentPage = ref(1)
const dialogVisible = ref(false)
const deleteDialogVisible = ref(false)
const editingBase = ref(null)
const selectedBase = ref(null)

// 表单数据
const formData = ref({
  name: '',
  code: '',
  companyName: '',
  area: 0,
  unit: '亩',
  province: '',
  city: '',
  manager: '',
  phone: '',
  soilType: '',
  ph: null,
  intro: '',
  status: 'active'
})

// 从基地数据中提取唯一公司列表
const companies = computed(() => {
  const companyMap = new Map()
  bases.value.forEach(b => {
    if (b.companyOid && b.companyName) {
      if (!companyMap.has(b.companyOid)) {
        companyMap.set(b.companyOid, { id: b.companyOid, name: b.companyName, count: 0 })
      }
      companyMap.get(b.companyOid).count++
    }
  })
  return Array.from(companyMap.values())
})

// 筛选后的基地
const filteredBases = computed(() => {
  return bases.value.filter(b => {
    const matchSearch = !searchTerm.value ||
      (b.name || '').toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      (b.code || '').toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      (b.companyName || '').toLowerCase().includes(searchTerm.value.toLowerCase())
    const matchCompany = !selectedCompanyId.value || b.companyOid === selectedCompanyId.value
    return matchSearch && matchCompany
  })
})

// 分页后的基地
const paginatedBases = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return filteredBases.value.slice(start, start + PAGE_SIZE)
})

// 统计数据
const stats = computed(() => {
  return {
    companyCount: companies.value.length,
    baseCount: bases.value.filter(b => b.status === 'active').length,
    totalArea: bases.value.reduce((sum, b) => sum + (b.area || 0), 0)
  }
})

// 加载数据
const loadData = async () => {
  await baseStore.loadBases()
}

// 新增
const handleAdd = () => {
  editingBase.value = null
  formData.value = {
    name: '',
    code: '',
    companyName: '',
    area: 0,
    unit: '亩',
    province: '',
    city: '',
    manager: '',
    phone: '',
    soilType: '',
    ph: null,
    intro: '',
    status: 'active'
  }
  dialogVisible.value = true
}

// 编辑
const handleEdit = (base) => {
  editingBase.value = base
  formData.value = { ...base }
  dialogVisible.value = true
}

// 保存
const handleSave = async () => {
  if (!formData.value.name || !formData.value.companyName) {
    ElMessage.warning('请填写基地名称和所属公司')
    return
  }
  try {
    if (editingBase.value) {
      await baseStore.editBase(editingBase.value.oid, formData.value)
    } else {
      const companyOid = formData.value.companyOid || `company_${Date.now()}`
      await baseStore.addBase({ ...formData.value, companyOid })
    }
    dialogVisible.value = false
    await loadData()
  } catch (err) {
    ElMessage.error('保存失败')
  }
}

// 删除确认
const handleDeleteConfirm = (base) => {
  selectedBase.value = base
  deleteDialogVisible.value = true
}

// 删除
const handleDelete = async () => {
  try {
    await baseStore.removeBase(selectedBase.value.oid)
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
