<!--
  基地管理页面
  对标 V1.1 src/pages/authority/BaseManagement.tsx
  功能：基地CRUD管理（基地编码、名称、组织、位置、面积）
-->
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
            <el-icon :size="20" color="#4b5563"><ArrowLeft /></el-icon>
          </a>
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
            <el-icon :size="24" color="white"><OfficeBuilding /></el-icon>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">基地管理</h1>
            <p class="text-gray-500">管理基地信息和组织归属</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 工具栏 -->
    <div class="flex items-center gap-3 flex-wrap bg-white rounded-xl p-4 shadow-sm">
      <span class="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
        {{ filteredBases.length }} 个基地
      </span>
      <div class="flex items-center gap-2 ml-auto">
        <el-input
          v-model="searchTerm"
          placeholder="搜索编码/名称/位置"
          clearable
          class="!w-48"
          size="default"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button @click="loadBases" :loading="loading">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新增基地
        </el-button>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
      {{ error }}
    </div>

    <!-- 基地列表 -->
    <el-table
      v-loading="loading"
      :data="paginatedBases"
      stripe
      border
      class="bg-white rounded-xl shadow-sm"
    >
      <el-table-column type="index" label="#" width="60" />
      <el-table-column prop="baseCode" label="基地编码" min-width="120">
        <template #default="{ row }">
          <span class="font-mono font-medium">{{ row.baseCode }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="baseName" label="基地名称" min-width="160">
        <template #default="{ row }">
          <span class="font-medium">{{ row.baseName }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="orgOid" label="所属组织" min-width="140">
        <template #default="{ row }">
          <el-tag size="small" effect="plain">{{ getOrgName(row.orgOid) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="location" label="位置" min-width="160" show-overflow-tooltip />
      <el-table-column prop="area" label="面积(亩)" min-width="100" align="right">
        <template #default="{ row }">
          <span v-if="row.area">{{ row.area }}</span>
          <span v-else class="text-gray-400">-</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="handleEdit(row)">
            <el-icon><Edit /></el-icon>
            编辑
          </el-button>
          <el-button link type="danger" size="small" @click="handleDelete(row)">
            <el-icon><Delete /></el-icon>
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="flex justify-end bg-white rounded-xl p-4 shadow-sm">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="filteredBases.length"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        background
      />
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="showModal"
      :title="editingBase?.baseCode ? '编辑基地' : '新增基地'"
      width="560px"
      v-dialog-draggable
      :close-on-click-modal="false"
    >
      <el-form v-if="editingBase" :model="editingBase" label-width="100px">
        <el-form-item label="基地编码" required>
          <el-input v-model="editingBase.baseCode" placeholder="例如：BASE001" />
        </el-form-item>
        <el-form-item label="基地名称" required>
          <el-input v-model="editingBase.baseName" placeholder="请输入基地名称" />
        </el-form-item>
        <el-form-item label="所属组织" required>
          <el-select v-model="editingBase.orgOid" placeholder="请选择组织" class="w-full">
            <el-option
              v-for="org in organizations"
              :key="org.oid"
              :label="org.name"
              :value="org.oid"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="位置">
          <el-input v-model="editingBase.location" placeholder="详细位置" />
        </el-form-item>
        <el-form-item label="面积(亩)">
          <el-input-number v-model="editingBase.area" :min="0" :precision="2" :step="0.5" class="w-full" />
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
import { useRouter } from 'vue-router'
import {
  ArrowLeft,
  Delete,
  Edit,
  OfficeBuilding,
  Plus,
  Refresh,
  Search,
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAuthorityStore } from '@/stores/modules/authority'
import { getBases, saveBases } from '@/services/dictionaryService'

const router = useRouter()
const authorityStore = useAuthorityStore()

const bases = ref([])
const organizations = computed(() => authorityStore.organizations || [])
const loading = ref(false)
const saving = ref(false)
const error = ref(null)
const searchTerm = ref('')
const showModal = ref(false)
const editingBase = ref(null)
const currentPage = ref(1)
const pageSize = 10

const filteredBases = computed(() => {
  const kw = searchTerm.value.trim()
  if (!kw) return bases.value
  return bases.value.filter(
    (b) =>
      b.baseCode?.includes(kw) ||
      b.baseName?.includes(kw) ||
      b.location?.includes(kw)
  )
})

const paginatedBases = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredBases.value.slice(start, start + pageSize)
})

const getOrgName = (orgOid) => {
  const org = organizations.value.find((o) => o.oid === orgOid)
  return org?.name || orgOid || '-'
}

const loadBases = async () => {
  loading.value = true
  error.value = null
  try {
    bases.value = await getBases()
    // 确保组织数据已加载
    if (!organizations.value.length) {
      await authorityStore.loadOrganizations()
    }
  } catch (err) {
    error.value = err?.message || '加载基地失败'
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  editingBase.value = {
    baseCode: '',
    baseName: '',
    orgOid: organizations.value[0]?.oid || '',
    location: '',
    area: undefined,
  }
  showModal.value = true
}

const handleEdit = (row) => {
  editingBase.value = { ...row }
  showModal.value = true
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定删除基地 "${row.baseName}" 吗？`, '删除确认', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    })
    bases.value = bases.value.filter((b) => b.baseCode !== row.baseCode)
    await saveBases(bases.value)
    ElMessage.success('删除成功')
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('删除失败')
  }
}

const handleSave = async () => {
  if (!editingBase.value.baseCode || !editingBase.value.baseName || !editingBase.value.orgOid) {
    ElMessage.warning('请填写完整基地信息')
    return
  }
  saving.value = true
  try {
    const idx = bases.value.findIndex((b) => b.baseCode === editingBase.value.baseCode)
    if (idx >= 0) {
      bases.value[idx] = { ...editingBase.value }
    } else {
      bases.value.push({ ...editingBase.value })
    }
    await saveBases(bases.value)
    ElMessage.success('保存成功')
    showModal.value = false
  } catch (err) {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadBases()
})
</script>