<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="bg-white rounded-xl p-6 shadow-none">
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
        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
          <el-icon :size="24" color="white">
            <House />
          </el-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">温室管理</h1>
          <p class="text-gray-500">管理温室大棚信息</p>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
            <el-icon :size="20" class="text-orange-600">
              <House />
            </el-icon>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ greenhouses.length }}</p>
            <p class="text-xs text-gray-500">温室总数</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 操作栏 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center justify-between gap-4">
        <div class="flex items-center gap-2 flex-1">
          <div class="relative flex-1 max-w-md">
            <el-input
              v-model="searchTerm"
              type="text"
              placeholder="搜索温室名称、编码或类型..."
              clearable
              @input="handleSearchInput"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <el-button @click="loadData">
            <el-icon><RefreshRight /></el-icon>
            刷新
          </el-button>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增温室
          </el-button>
        </div>
      </div>
    </div>

    <!-- 表格 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-gradient-to-r from-orange-500 to-amber-600 text-white">
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">温室编码</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">温室名称</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">所属基地</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">温室类型</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">面积</th>
              <th class="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-if="paginatedGreenhouses.length === 0">
              <td colspan="6" class="px-4 py-8 text-center text-gray-500">
                暂无温室数据
              </td>
            </tr>
            <tr
              v-for="greenhouse in paginatedGreenhouses"
              :key="greenhouse.id || greenhouse.oid"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-4 py-3 text-sm text-gray-900">{{ greenhouse.code || greenhouse.greenhouseCode }}</td>
              <td class="px-4 py-3 text-sm text-gray-900 font-medium">{{ greenhouse.name || greenhouse.greenhouseName }}</td>
              <td class="px-4 py-3 text-sm text-gray-600">{{ getBaseName(greenhouse.baseOid) }}</td>
              <td class="px-4 py-3 text-sm text-gray-600">{{ greenhouse.greenhouseType || '-' }}</td>
              <td class="px-4 py-3 text-sm text-gray-600">
                {{ greenhouse.area ? `${greenhouse.area} m²` : '-' }}
              </td>
              <td class="px-4 py-3 text-right">
                <div class="flex items-center justify-end gap-2">
                  <el-button
                    size="small"
                    type="primary"
                    @click="handleEdit(greenhouse)"
                    link
                  >
                    <el-icon><Edit /></el-icon>
                  </el-button>
                  <el-button
                    size="small"
                    type="danger"
                    @click="handleDelete(greenhouse)"
                    link
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页 -->
      <div v-if="totalPages > 1" class="px-4 py-3 border-t border-gray-100">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="filteredGreenhouses.length"
          layout="prev, pager, next"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <!-- 错误提示 -->
    <el-alert
      v-if="error"
      :title="error"
      type="error"
      show-icon
      :closable="true"
      @close="error = null"
    />

    <!-- 弹窗 -->
    <el-dialog
      v-model="showModal"
      :title="editingGreenhouse && (editingGreenhouse.oid || editingGreenhouse.id) ? '编辑温室' : '新增温室'"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="editingGreenhouse" label-width="100px" class="space-y-4">
        <el-form-item label="温室编码" required>
          <el-input
            v-model="editingGreenhouse.code"
            placeholder="例如：GH001"
          />
        </el-form-item>

        <el-form-item label="温室名称" required>
          <el-input
            v-model="editingGreenhouse.name"
            placeholder="例如：1号大棚"
          />
        </el-form-item>

        <el-form-item label="所属基地" required>
          <el-select
            v-model="editingGreenhouse.baseOid"
            placeholder="请选择基地"
            class="w-full"
          >
            <el-option
              v-for="base in bases"
              :key="base.oid"
              :label="base.name"
              :value="base.oid"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="温室类型">
          <el-input
            v-model="editingGreenhouse.greenhouseType"
            placeholder="例如：日光温室、塑料大棚"
          />
        </el-form-item>

        <el-form-item label="面积 (m²)">
          <el-input-number
            v-model="editingGreenhouse.area"
            :min="0"
            :precision="2"
            placeholder="例如：2000"
            class="w-full"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showModal = false">取消</el-button>
        <el-button
          type="primary"
          :loading="loading"
          :disabled="!editingGreenhouse.code || !editingGreenhouse.name || !editingGreenhouse.baseOid"
          @click="handleSave"
        >
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
/**
 * 温室管理页面
 * V2.0 Vue3 版本
 * 从 V1.1 GreenhouseManagement.tsx 迁移
 */
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft,
  House,
  Search,
  RefreshRight,
  Plus,
  Edit,
  Delete
} from '@element-plus/icons-vue'
import { useGreenhouseStore } from '@/stores/modules/greenhouse'
import { useBaseStore } from '@/stores/modules/baseStore'

// Store
const greenhouseStore = useGreenhouseStore()
const baseStore = useBaseStore()

// 状态
const greenhouses = ref([])
const bases = ref([])
const loading = ref(false)
const error = ref(null)
const searchTerm = ref('')
const showModal = ref(false)
const editingGreenhouse = ref(null)
const currentPage = ref(1)
const pageSize = 10

// 加载数据
const loadData = async () => {
  try {
    loading.value = true
    error.value = null
    await Promise.all([
      greenhouseStore.loadGreenhouses(),
      baseStore.loadBases()
    ])
    greenhouses.value = greenhouseStore.greenhouses
    bases.value = baseStore.bases
  } catch (err) {
    error.value = err.message || '加载数据失败'
  } finally {
    loading.value = false
  }
}

// 过滤温室
const filteredGreenhouses = computed(() => {
  if (!searchTerm.value) return greenhouses.value
  const term = searchTerm.value.toLowerCase()
  return greenhouses.value.filter(gh => {
    const code = (gh.code || gh.greenhouseCode || '').toLowerCase()
    const name = (gh.name || gh.greenhouseName || '').toLowerCase()
    const type = (gh.greenhouseType || '').toLowerCase()
    return code.includes(term) || name.includes(term) || type.includes(term)
  })
})

// 分页
const totalPages = computed(() => Math.ceil(filteredGreenhouses.value.length / pageSize))
const paginatedGreenhouses = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredGreenhouses.value.slice(start, start + pageSize)
})

// 获取基地名称
const getBaseName = (baseOid) => {
  if (!baseOid) return '-'
  const base = bases.value.find(b => b.oid === baseOid)
  return base?.name || baseOid
}

// 搜索处理
const handleSearchInput = () => {
  currentPage.value = 1
}

// 分页处理
const handlePageChange = (page) => {
  currentPage.value = page
}

// 打开新增弹窗
const handleAdd = () => {
  editingGreenhouse.value = {
    code: '',
    name: '',
    baseOid: '',
    greenhouseType: '',
    area: null
  }
  showModal.value = true
}

// 打开编辑弹窗
const handleEdit = (greenhouse) => {
  editingGreenhouse.value = { ...greenhouse }
  showModal.value = true
}

// 保存
const handleSave = async () => {
  if (!editingGreenhouse.value) return

  try {
    loading.value = true
    const data = editingGreenhouse.value

    if (data.id || data.oid) {
      // 编辑
      await greenhouseStore.editGreenhouse(data.id || data.oid, data)
      ElMessage.success('更新温室成功')
    } else {
      // 新增
      await greenhouseStore.addGreenhouse(data)
      ElMessage.success('添加温室成功')
    }

    showModal.value = false
    editingGreenhouse.value = null
    await loadData()
  } catch (err) {
    error.value = err.message || '保存失败'
    ElMessage.error(error.value)
  } finally {
    loading.value = false
  }
}

// 删除
const handleDelete = async (greenhouse) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除温室"${greenhouse.name || greenhouse.greenhouseName}"吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    loading.value = true
    const id = greenhouse.id || greenhouse.oid
    const success = await greenhouseStore.removeGreenhouse(id)

    if (success) {
      ElMessage.success('删除温室成功')
      await loadData()
    }
  } catch (err) {
    if (err !== 'cancel') {
      error.value = err.message || '删除失败'
      ElMessage.error(error.value)
    }
  } finally {
    loading.value = false
  }
}

// 页面加载时获取数据
onMounted(() => {
  loadData()
})
</script>

<style scoped>
/* 页面特定样式 */
</style>
