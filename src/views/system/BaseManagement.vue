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
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <el-icon :size="24" color="white"><OfficeBuilding /></el-icon>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">基地管理</h1>
            <p class="text-gray-500">管理基地信息配置</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
            <el-icon :size="20" color="#059669"><Location /></el-icon>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ bases.length }}</p>
            <p class="text-xs text-gray-500">基地总数</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 操作栏 -->
    <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div class="flex items-center justify-between gap-4">
        <div class="flex items-center gap-2 flex-1">
          <!-- 搜索框 -->
          <el-input
            v-model="searchTerm"
            type="text"
            placeholder="搜索基地名称、编码或位置..."
            clearable
            class="w-full max-w-md"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        <div class="flex items-center gap-2">
          <el-button @click="loadBases">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增基地
          </el-button>
        </div>
      </div>
    </div>

    <!-- 表格 -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <el-table :data="paginatedBases" v-loading="loading" stripe style="width: 100%" :header-cell-style="{ background: 'linear-gradient(to right, #10b981, #0d9488)', color: 'white', fontWeight: '600' }">
        <el-table-column prop="baseCode" label="基地编码" min-width="120" />
        <el-table-column prop="baseName" label="基地名称" min-width="150">
          <template #default="{ row }">
            <span class="font-medium">{{ row.baseName }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="location" label="位置" min-width="150">
          <template #default="{ row }">
            {{ row.location || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="area" label="面积" min-width="120">
          <template #default="{ row }">
            {{ row.area ? `${row.area} m²` : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="right">
          <template #default="{ row }">
            <div class="flex items-center justify-end gap-2">
              <el-button size="small" circle @click="handleEdit(row)">
                <el-icon><Edit /></el-icon>
              </el-button>
              <el-button size="small" circle type="danger" @click="handleDelete(row)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 无数据提示 -->
      <el-empty v-if="filteredBases.length === 0 && !loading" description="暂无基地数据" />

      <!-- 分页 -->
      <div v-if="totalPages > 1" class="px-4 py-3 border-t border-gray-100 flex justify-end">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="filteredBases.length"
          layout="prev, pager, next"
          small
        />
      </div>
    </div>

    <!-- 错误提示 -->
    <el-alert v-if="error" :title="error" type="error" show-icon :closable="true" @close="error = null" />

    <!-- 基地编辑弹窗 -->
    <el-dialog
      v-model="showModal"
      :title="editingBase && editingBase.oid ? '编辑基地' : '新增基地'"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="80px">
        <el-form-item label="基地编码" prop="baseCode">
          <el-input v-model="formData.baseCode" placeholder="例如：BASE001" />
        </el-form-item>
        <el-form-item label="基地名称" prop="baseName">
          <el-input v-model="formData.baseName" placeholder="例如：宁波基地" />
        </el-form-item>
        <el-form-item label="位置" prop="location">
          <el-input v-model="formData.location" placeholder="例如：浙江省宁波市" />
        </el-form-item>
        <el-form-item label="面积 (m²)" prop="area">
          <el-input-number v-model="formData.area" :min="0" class="w-full" />
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
import { ref, reactive, computed, onMounted } from 'vue'
import { Search, Refresh, Plus, Edit, Delete, ArrowLeft, Location, OfficeBuilding } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getBases, createBase, updateBase, deleteBase } from '@/services/apiBasicDataService'

/**
 * 基地类型定义（前端使用）
 */
const baseType = {
  id: null,
  oid: null,
  baseCode: '',
  baseName: '',
  location: '',
  area: null
}

// 搜索关键词
const searchTerm = ref('')

// 弹窗控制
const showModal = ref(false)
const editingBase = ref(null)
const formRef = ref()
const saving = ref(false)
const loading = ref(false)
const error = ref(null)

// 表单数据
const formData = reactive({
  id: null,
  oid: null,
  baseCode: '',
  baseName: '',
  location: '',
  area: null
})

// 表单验证规则
const formRules = {
  baseCode: [{ required: true, message: '请输入基地编码', trigger: 'blur' }],
  baseName: [{ required: true, message: '请输入基地名称', trigger: 'blur' }]
}

// 基地数据
const allBases = ref([])

// 分页
const currentPage = ref(1)
const pageSize = 10

// 筛选后的基地
const filteredBases = computed(() => {
  if (!searchTerm.value) return allBases.value
  const term = searchTerm.value
  return allBases.value.filter(base =>
    (base.baseName && base.baseName.includes(term)) ||
    (base.baseCode && base.baseCode.includes(term)) ||
    (base.location && base.location.includes(term))
  )
})

// 分页后的基地
const paginatedBases = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredBases.value.slice(start, end)
})

// 总页数
const totalPages = computed(() => Math.ceil(filteredBases.value.length / pageSize))

/**
 * 加载基地数据
 */
const loadBases = async () => {
  loading.value = true
  error.value = null
  try {
    const data = await getBases()
    allBases.value = data || []
  } catch (err) {
    error.value = err.message || '加载基地数据失败'
    console.error('加载基地失败:', err)
  } finally {
    loading.value = false
  }
}

/**
 * 打开新增弹窗
 */
const handleAdd = () => {
  editingBase.value = null
  Object.assign(formData, {
    id: null,
    oid: null,
    baseCode: '',
    baseName: '',
    location: '',
    area: null
  })
  showModal.value = true
}

/**
 * 打开编辑弹窗
 */
const handleEdit = (base) => {
  editingBase.value = base
  Object.assign(formData, {
    id: base.id,
    oid: base.oid,
    baseCode: base.baseCode || base.code || '',
    baseName: base.baseName || base.name || '',
    location: base.location || '',
    area: base.area || null
  })
  showModal.value = true
}

/**
 * 保存基地
 */
const handleSave = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      saving.value = true
      try {
        const baseData = {
          code: formData.baseCode,
          name: formData.baseName,
          location: formData.location,
          area: formData.area
        }

        if (editingBase.value && editingBase.value.oid) {
          // 更新
          await updateBase(editingBase.value.oid, baseData)
          ElMessage.success('更新基地成功')
        } else {
          // 新增
          await createBase(baseData)
          ElMessage.success('创建基地成功')
        }
        showModal.value = false
        loadBases()
      } catch (err) {
        error.value = err.message || '保存失败'
        console.error('保存基地失败:', err)
        ElMessage.error(error.value)
      } finally {
        saving.value = false
      }
    }
  })
}

/**
 * 删除基地
 */
const handleDelete = async (base) => {
  try {
    await ElMessageBox.confirm(`确定要删除基地"${base.baseName || base.name}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteBase(base.oid)
    ElMessage.success('删除基地成功')
    loadBases()
  } catch (err) {
    if (err !== 'cancel') {
      error.value = err.message || '删除失败'
      console.error('删除基地失败:', err)
      ElMessage.error(error.value)
    }
  }
}

// 页面加载时获取数据
onMounted(() => {
  loadBases()
})
</script>
