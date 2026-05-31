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
          <el-icon :size="20" color="#4b5563"><ArrowLeft /></el-icon>
        </a>
        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
          <el-icon :size="24" color="white"><HomeFilled /></el-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">温室管理</h1>
          <p class="text-gray-500">管理温室信息配置</p>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
            <el-icon :size="20" color="#059669"><HomeFilled /></el-icon>
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
            <el-icon class="absolute left-3 top-1/2 -translate-y-1/2" :size="14" color="#9ca3af"><Search /></el-icon>
            <el-input
              v-model="searchTerm"
              placeholder="搜索温室名称、编码或类型..."
              clearable
              class="w-full"
            />
          </div>
        </div>
        <div class="flex items-center gap-2">
          <el-button size="default" @click="loadData" :loading="loading">
            <el-icon :size="14"><Refresh /></el-icon>
            刷新
          </el-button>
          <el-button type="primary" size="default" @click="handleAdd">
            <el-icon :size="14"><Plus /></el-icon>
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
            <tr class="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">温室编码</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">温室名称</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">所属基地</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">类型</th>
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
              v-for="gh in paginatedGreenhouses"
              :key="gh.oid"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-4 py-3 text-sm text-gray-900">{{ gh.greenhouseCode }}</td>
              <td class="px-4 py-3 text-sm text-gray-900 font-medium">{{ gh.greenhouseName }}</td>
              <td class="px-4 py-3 text-sm text-gray-600">{{ getBaseName(gh.baseOid) }}</td>
              <td class="px-4 py-3 text-sm text-gray-600">{{ gh.greenhouseType || '-' }}</td>
              <td class="px-4 py-3 text-sm text-gray-600">
                {{ gh.area ? `${gh.area} m²` : '-' }}
              </td>
              <td class="px-4 py-3 text-right">
                <div class="flex items-center justify-end gap-2">
                  <el-button
                    size="small"
                    @click="handleEdit(gh)"
                    class="text-emerald-600"
                  >
                    <el-icon :size="14"><Edit /></el-icon>
                  </el-button>
                  <el-button
                    size="small"
                    type="danger"
                    @click="handleDelete(gh)"
                  >
                    <el-icon :size="14"><Delete /></el-icon>
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
          small
        />
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
      {{ error }}
    </div>

    <!-- 弹窗 -->
    <el-dialog
      v-model="showModal"
      :title="editingGreenhouse?.oid ? '编辑温室' : '新增温室'"
      width="500px"
      :close-on-click-modal="false"
    >
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            温室编码 <span class="text-red-500">*</span>
          </label>
          <el-input
            v-model="editingGreenhouse.greenhouseCode"
            :disabled="!!editingGreenhouse?.oid"
            placeholder="例如：GH001"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            温室名称 <span class="text-red-500">*</span>
          </label>
          <el-input
            v-model="editingGreenhouse.greenhouseName"
            placeholder="例如：1号温室"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">所属基地</label>
          <el-select v-model="editingGreenhouse.baseOid" placeholder="请选择" class="w-full">
            <el-option label="请选择" value="" />
            <el-option v-for="base in bases" :key="base.oid" :label="base.baseName" :value="base.oid" />
          </el-select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">温室类型</label>
          <el-input
            v-model="editingGreenhouse.greenhouseType"
            placeholder="例如：玻璃温室"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">面积 (m²)</label>
          <el-input-number
            v-model="editingGreenhouse.area"
            :min="0"
            placeholder="例如：1000"
            class="w-full"
          />
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <el-button @click="showModal = false">取消</el-button>
          <el-button
            type="primary"
            @click="handleSave"
            :disabled="loading || !editingGreenhouse?.greenhouseCode || !editingGreenhouse?.greenhouseName"
          >
            保存
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { HomeFilled, Plus, Edit, Delete, ArrowLeft, Search, Refresh } from '@element-plus/icons-vue'

const greenhouses = ref([])
const bases = ref([])
const loading = ref(false)
const error = ref(null)
const searchTerm = ref('')
const showModal = ref(false)
const editingGreenhouse = ref(null)
const currentPage = ref(1)
const pageSize = 10

// 过滤温室
const filteredGreenhouses = computed(() => {
  return greenhouses.value.filter(gh =>
    gh.greenhouseName?.includes(searchTerm.value) ||
    gh.greenhouseCode?.includes(searchTerm.value) ||
    gh.greenhouseType?.includes(searchTerm.value)
  )
})

// 分页
const totalPages = computed(() => Math.ceil(filteredGreenhouses.value.length / pageSize))
const paginatedGreenhouses = computed(() => {
  return filteredGreenhouses.value.slice(
    (currentPage.value - 1) * pageSize,
    currentPage.value * pageSize
  )
})

// 获取基地名称
const getBaseName = (baseOid) => {
  const base = bases.value.find(b => b.oid === baseOid)
  return base?.baseName || baseOid || '-'
}

// 加载数据
const loadData = async () => {
  try {
    loading.value = true
    error.value = null
    const [ghRes, baseRes] = await Promise.all([
      fetch('/api/greenhouses', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      }),
      fetch('/api/bases', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
    ])
    if (ghRes.ok) {
      greenhouses.value = await ghRes.json() || []
    }
    if (baseRes.ok) {
      bases.value = await baseRes.json() || []
    }
  } catch (err) {
    error.value = err.message || '加载数据失败'
  } finally {
    loading.value = false
  }
}

// 打开新增弹窗
const handleAdd = () => {
  editingGreenhouse.value = {
    greenhouseCode: '',
    greenhouseName: '',
    baseOid: '',
    greenhouseType: '',
    area: undefined,
  }
  showModal.value = true
}

// 打开编辑弹窗
const handleEdit = (gh) => {
  editingGreenhouse.value = { ...gh }
  showModal.value = true
}

// 保存
const handleSave = async () => {
  if (!editingGreenhouse.value) return
  try {
    loading.value = true
    const method = editingGreenhouse.value.oid ? 'PUT' : 'POST'
    const url = editingGreenhouse.value.oid ? `/api/greenhouses/${editingGreenhouse.value.oid}` : '/api/greenhouses'
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(editingGreenhouse.value)
    })
    if (res.ok) {
      showModal.value = false
      editingGreenhouse.value = null
      await loadData()
      ElMessage.success('保存成功')
    } else {
      throw new Error('保存失败')
    }
  } catch (err) {
    error.value = err.message || '保存失败'
    ElMessage.error('保存失败')
  } finally {
    loading.value = false
  }
}

// 删除
const handleDelete = async (gh) => {
  try {
    await ElMessageBox.confirm(`确定要删除温室"${gh.greenhouseName}"吗？`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    loading.value = true
    const res = await fetch(`/api/greenhouses/${gh.oid}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    if (res.ok) {
      await loadData()
      ElMessage.success('删除成功')
    } else {
      throw new Error('删除失败')
    }
  } catch (err) {
    if (err !== 'cancel') {
      error.value = err.message || '删除失败'
      ElMessage.error(err.message || '删除失败')
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>
