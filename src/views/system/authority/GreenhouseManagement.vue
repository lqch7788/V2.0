<!--
  温室管理页面
  对标 V1.1 src/pages/authority/GreenhouseManagement.tsx
  功能：温室CRUD管理（温室编码、名称、所属基地、类型、面积）
-->
<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="bg-white rounded-xl p-6 shadow-none">
      <div class="flex items-center gap-3">
        <a
          href="/settings"
          class="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center"
        >
          <el-icon :size="20" color="#4b5563"><ArrowLeft /></el-icon>
        </a>
        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
          <el-icon :size="24" color="white"><HomeFilled /></el-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">温室管理</h1>
          <p class="text-gray-500">管理温室信息和类型</p>
        </div>
      </div>
    </div>

    <!-- 工具栏 -->
    <div class="flex items-center gap-3 flex-wrap bg-white rounded-xl p-4 shadow-sm">
      <el-input
        v-model="searchTerm"
        placeholder="搜索编码/名称/类型"
        clearable
        class="!w-48"
      >
        <template #prefix><el-icon><Search /></el-icon></template>
      </el-input>
      <el-button @click="loadData" :loading="loading">
        <el-icon><Refresh /></el-icon>刷新
      </el-button>
      <el-button type="primary" @click="handleAdd" class="ml-auto">
        <el-icon><Plus /></el-icon>新增温室
      </el-button>
    </div>

    <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
      {{ error }}
    </div>

    <!-- 温室列表 -->
    <el-table v-loading="loading" :data="paginatedGreenhouses" stripe border class="bg-white rounded-xl shadow-sm">
      <el-table-column type="index" label="#" width="60" />
      <el-table-column prop="greenhouseCode" label="温室编码" min-width="120">
        <template #default="{ row }">
          <span class="font-mono font-medium">{{ row.greenhouseCode }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="greenhouseName" label="温室名称" min-width="160" />
      <el-table-column label="所属基地" min-width="140">
        <template #default="{ row }">
          <el-tag size="small" effect="plain">{{ getBaseName(row.baseOid) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="greenhouseType" label="类型" min-width="100">
        <template #default="{ row }">
          <el-tag size="small" :type="getTypeTagType(row.greenhouseType)">
            {{ row.greenhouseType || '-' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="area" label="面积(㎡)" min-width="100" align="right">
        <template #default="{ row }">
          <span v-if="row.area">{{ row.area }}</span>
          <span v-else class="text-gray-400">-</span>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
            {{ row.status === 'active' ? '启用' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="handleEdit(row)">
            <el-icon><Edit /></el-icon>编辑
          </el-button>
          <el-button link type="danger" size="small" @click="handleDelete(row)">
            <el-icon><Delete /></el-icon>删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="flex justify-end bg-white rounded-xl p-4 shadow-sm">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="filteredGreenhouses.length"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        background
      />
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="showModal"
      :title="editingGreenhouse?.greenhouseCode ? '编辑温室' : '新增温室'"
      width="560px"
      v-dialog-draggable
      :close-on-click-modal="false"
    >
      <el-form v-if="editingGreenhouse" :model="editingGreenhouse" label-width="100px">
        <el-form-item label="温室编码" required>
          <el-input v-model="editingGreenhouse.greenhouseCode" placeholder="例如：GH001" />
        </el-form-item>
        <el-form-item label="温室名称" required>
          <el-input v-model="editingGreenhouse.greenhouseName" placeholder="温室名称" />
        </el-form-item>
        <el-form-item label="所属基地" required>
          <el-select v-model="editingGreenhouse.baseOid" placeholder="请选择基地" class="w-full">
            <el-option v-for="b in bases" :key="b.baseCode" :label="b.baseName" :value="b.baseCode" />
          </el-select>
        </el-form-item>
        <el-form-item label="温室类型">
          <el-select v-model="editingGreenhouse.greenhouseType" placeholder="请选择类型" class="w-full">
            <el-option v-for="t in greenhouseTypes" :key="t" :label="t" :value="t" />
          </el-select>
        </el-form-item>
        <el-form-item label="面积(㎡)">
          <el-input-number v-model="editingGreenhouse.area" :min="0" :precision="2" class="w-full" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="editingGreenhouse.status">
            <el-radio value="active">启用</el-radio>
            <el-radio value="inactive">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showModal = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import {
  ArrowLeft,
  Delete,
  Edit,
  HomeFilled,
  Plus,
  Refresh,
  Search,
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getBases, getGreenhouses, saveGreenhouses } from '@/services/dictionaryService'

const greenhouses = ref([])
const bases = ref([])
const loading = ref(false)
const saving = ref(false)
const error = ref(null)
const searchTerm = ref('')
const showModal = ref(false)
const editingGreenhouse = ref(null)
const currentPage = ref(1)
const pageSize = 10

const greenhouseTypes = ['玻璃温室', '薄膜温室', '日光温室', '连栋温室', '单体温室', '植物工厂']

const filteredGreenhouses = computed(() => {
  const kw = searchTerm.value.trim()
  if (!kw) return greenhouses.value
  return greenhouses.value.filter(
    (g) =>
      g.greenhouseCode?.includes(kw) ||
      g.greenhouseName?.includes(kw) ||
      g.greenhouseType?.includes(kw)
  )
})

const paginatedGreenhouses = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredGreenhouses.value.slice(start, start + pageSize)
})

const getBaseName = (baseOid) => {
  const base = bases.value.find((b) => b.baseCode === baseOid)
  return base?.baseName || baseOid || '-'
}

const getTypeTagType = (type) => {
  const map = {
    玻璃温室: 'success',
    薄膜温室: 'primary',
    日光温室: 'warning',
    连栋温室: 'info',
    单体温室: 'info',
    植物工厂: 'danger',
  }
  return map[type] || ''
}

const loadData = async () => {
  loading.value = true
  error.value = null
  try {
    const [ghData, baseData] = await Promise.all([getGreenhouses(), getBases()])
    greenhouses.value = ghData
    bases.value = baseData
  } catch (err) {
    error.value = err?.message || '加载数据失败'
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  editingGreenhouse.value = {
    greenhouseCode: '',
    greenhouseName: '',
    baseOid: bases.value[0]?.baseCode || '',
    greenhouseType: '薄膜温室',
    area: undefined,
    status: 'active',
  }
  showModal.value = true
}

const handleEdit = (row) => {
  editingGreenhouse.value = { ...row }
  showModal.value = true
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定删除温室 "${row.greenhouseName}" 吗？`, '删除确认', {
      type: 'warning',
    })
    greenhouses.value = greenhouses.value.filter((g) => g.greenhouseCode !== row.greenhouseCode)
    await saveGreenhouses(greenhouses.value)
    ElMessage.success('删除成功')
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('删除失败')
  }
}

const handleSave = async () => {
  if (
    !editingGreenhouse.value.greenhouseCode ||
    !editingGreenhouse.value.greenhouseName ||
    !editingGreenhouse.value.baseOid
  ) {
    ElMessage.warning('请填写完整温室信息')
    return
  }
  saving.value = true
  try {
    const idx = greenhouses.value.findIndex((g) => g.greenhouseCode === editingGreenhouse.value.greenhouseCode)
    if (idx >= 0) {
      greenhouses.value[idx] = { ...editingGreenhouse.value }
    } else {
      greenhouses.value.push({ ...editingGreenhouse.value })
    }
    await saveGreenhouses(greenhouses.value)
    ElMessage.success('保存成功')
    showModal.value = false
  } finally {
    saving.value = false
  }
}

onMounted(() => loadData())
</script>