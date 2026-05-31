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
          <el-icon :size="24" color="white"><MapLocation /></el-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">基地管理</h1>
          <p class="text-gray-500">管理基地信息配置</p>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
            <el-icon :size="20" color="#059669"><MapLocation /></el-icon>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ bases.length }}</p>
            <p class="text-xs text-gray-500">基地总数</p>
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
              placeholder="搜索基地名称、编码或位置..."
              clearable
              class="w-full"
            />
          </div>
        </div>
        <div class="flex items-center gap-2">
          <el-button size="default" @click="loadBases" :loading="loading">
            <el-icon :size="14"><Refresh /></el-icon>
            刷新
          </el-button>
          <el-button type="primary" size="default" @click="handleAdd">
            <el-icon :size="14"><Plus /></el-icon>
            新增基地
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
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">基地编码</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">基地名称</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">位置</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">面积</th>
              <th class="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-if="paginatedBases.length === 0">
              <td colspan="5" class="px-4 py-8 text-center text-gray-500">
                暂无基地数据
              </td>
            </tr>
            <tr
              v-for="base in paginatedBases"
              :key="base.oid"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-4 py-3 text-sm text-gray-900">{{ base.baseCode }}</td>
              <td class="px-4 py-3 text-sm text-gray-900 font-medium">{{ base.baseName }}</td>
              <td class="px-4 py-3 text-sm text-gray-600">{{ base.location || '-' }}</td>
              <td class="px-4 py-3 text-sm text-gray-600">
                {{ base.area ? `${base.area} m²` : '-' }}
              </td>
              <td class="px-4 py-3 text-right">
                <div class="flex items-center justify-end gap-2">
                  <el-button
                    size="small"
                    @click="handleEdit(base)"
                    class="text-emerald-600"
                  >
                    <el-icon :size="14"><Edit /></el-icon>
                  </el-button>
                  <el-button
                    size="small"
                    type="danger"
                    @click="handleDelete(base)"
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
          :total="filteredBases.length"
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
      :title="editingBase?.oid ? '编辑基地' : '新增基地'"
      width="500px"
      :close-on-click-modal="false"
    >
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            基地编码 <span class="text-red-500">*</span>
          </label>
          <div class="flex gap-2">
            <el-input
              v-model="editingBase.baseCode"
              :disabled="!!editingBase.oid"
              placeholder="例如：B001"
            />
            <el-button
              v-if="!editingBase.oid"
              @click="generateCode"
              :loading="generating"
            >
              生成
            </el-button>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            基地名称 <span class="text-red-500">*</span>
          </label>
          <el-input
            v-model="editingBase.baseName"
            placeholder="例如：宁波基地"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">位置</label>
          <el-input
            v-model="editingBase.location"
            placeholder="例如：浙江省宁波市"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">面积 (m²)</label>
          <el-input-number
            v-model="editingBase.area"
            :min="0"
            placeholder="例如：10000"
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
            :disabled="loading || !editingBase.baseCode || !editingBase.baseName"
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
import { MapLocation, Plus, Edit, Delete, ArrowLeft, Search, Refresh } from '@element-plus/icons-vue'

const bases = ref([])
const loading = ref(false)
const error = ref(null)
const searchTerm = ref('')
const showModal = ref(false)
const editingBase = ref(null)
const currentPage = ref(1)
const pageSize = 10
const generating = ref(false)

// 过滤基地
const filteredBases = computed(() => {
  return bases.value.filter(base =>
    base.baseName?.includes(searchTerm.value) ||
    base.baseCode?.includes(searchTerm.value) ||
    base.location?.includes(searchTerm.value)
  )
})

// 分页
const totalPages = computed(() => Math.ceil(filteredBases.value.length / pageSize))
const paginatedBases = computed(() => {
  return filteredBases.value.slice(
    (currentPage.value - 1) * pageSize,
    currentPage.value * pageSize
  )
})

// 加载基地数据
const loadBases = async () => {
  try {
    loading.value = true
    error.value = null
    const res = await fetch('/api/bases', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    if (res.ok) {
      const data = await res.json()
      bases.value = data || []
    }
  } catch (err) {
    error.value = err.message || '加载基地失败'
  } finally {
    loading.value = false
  }
}

// 生成编码
const generateCode = async () => {
  try {
    generating.value = true
    const res = await fetch('/api/code-generator/next-base-code', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    const json = await res.json()
    if (json.success) {
      editingBase.value.baseCode = json.data.code
    } else {
      ElMessage.error(json.error || '生成编码失败')
    }
  } catch {
    ElMessage.error('生成编码失败，请检查网络')
  } finally {
    generating.value = false
  }
}

// 打开新增弹窗
const handleAdd = () => {
  editingBase.value = {
    baseCode: '',
    baseName: '',
    orgOid: '',
    location: '',
    area: undefined,
  }
  showModal.value = true
}

// 打开编辑弹窗
const handleEdit = (base) => {
  editingBase.value = { ...base }
  showModal.value = true
}

// 保存
const handleSave = async () => {
  if (!editingBase.value) return
  try {
    loading.value = true
    const method = editingBase.value.oid ? 'PUT' : 'POST'
    const url = editingBase.value.oid ? `/api/bases/${editingBase.value.oid}` : '/api/bases'
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(editingBase.value)
    })
    if (res.ok) {
      showModal.value = false
      editingBase.value = null
      await loadBases()
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
const handleDelete = async (base) => {
  try {
    await ElMessageBox.confirm(`确定要删除基地"${base.baseName}"吗？`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    loading.value = true
    const res = await fetch(`/api/bases/${base.oid}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    if (res.ok) {
      await loadBases()
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
  loadBases()
})
</script>
