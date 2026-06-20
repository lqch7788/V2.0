<!--
  作物品种库管理页面
  对标 V1.1 src/components/farm/crop-variety/CropVarietyManagement.tsx
  功能：作物品种CRUD + 分类树形结构 + 编码生成
-->
<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center gap-3">
        <el-icon :size="24" color="#059669"><MostlyCloudy /></el-icon>
        <h1 class="text-xl font-bold text-gray-900">作物品种库</h1>
      </div>
      <div class="flex items-center gap-2">
        <el-input v-model="searchTerm" placeholder="搜索品种名/编码" clearable class="!w-48">
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <el-button @click="loadData" :loading="loading">
          <el-icon><Refresh /></el-icon>刷新
        </el-button>
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>新增品种
        </el-button>
      </div>
    </div>

    <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
      {{ error }}
    </div>

    <div class="bg-white rounded-xl shadow-sm p-4">
      <el-table v-loading="loading" :data="filteredData" stripe border>
        <el-table-column prop="code" label="品种编码" min-width="140">
          <template #default="{ row }">
            <span class="font-mono font-medium">{{ row.code }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="品种名称" min-width="160" />
        <el-table-column prop="category" label="类别" min-width="120">
          <template #default="{ row }">
            <el-tag size="small">{{ row.category }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" min-width="100" />
        <el-table-column prop="growthPeriod" label="生长周期(天)" min-width="120" align="right" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
              {{ row.status === 'active' ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="showModal" :title="editing?.code ? '编辑品种' : '新增品种'" width="640px" v-dialog-draggable>
      <el-form v-if="editing" :model="editing" label-width="100px">
        <el-form-item label="品种编码" required>
          <el-input v-model="editing.code" placeholder="例如：TOM001" />
        </el-form-item>
        <el-form-item label="品种名称" required>
          <el-input v-model="editing.name" placeholder="例如：樱桃番茄" />
        </el-form-item>
        <el-form-item label="类别" required>
          <el-select v-model="editing.category" placeholder="请选择" class="w-full">
            <el-option v-for="c in categories" :key="c" :label="c" :value="c" />
          </el-select>
        </el-form-item>
        <el-form-item label="类型">
          <el-input v-model="editing.type" placeholder="例如：杂交种" />
        </el-form-item>
        <el-form-item label="生长周期(天)">
          <el-input-number v-model="editing.growthPeriod" :min="1" :max="365" class="w-full" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="editing.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showModal = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { MostlyCloudy, Plus, Refresh, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const data = ref([])
const categories = ref(['蔬菜', '水果', '粮食', '经济作物', '花卉'])
const loading = ref(false)
const error = ref(null)
const searchTerm = ref('')
const showModal = ref(false)
const editing = ref(null)

const filteredData = computed(() => {
  const kw = searchTerm.value.trim()
  if (!kw) return data.value
  return data.value.filter((d) => d.code?.includes(kw) || d.name?.includes(kw))
})

const loadData = async () => {
  loading.value = true
  try {
    // 模拟数据 — 实际应调用 cropVarietyService
    data.value = [
      { code: 'TOM001', name: '樱桃番茄', category: '蔬菜', type: '杂交种', growthPeriod: 90, status: 'active', remark: '' },
      { code: 'LET001', name: '散叶生菜', category: '蔬菜', type: '常规种', growthPeriod: 45, status: 'active', remark: '' },
      { code: 'CUC001', name: '水果黄瓜', category: '蔬菜', type: '杂交种', growthPeriod: 60, status: 'active', remark: '' },
    ]
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  editing.value = { code: '', name: '', category: '', type: '', growthPeriod: 90, status: 'active', remark: '' }
  showModal.value = true
}

const handleEdit = (row) => {
  editing.value = { ...row }
  showModal.value = true
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定删除品种 "${row.name}" 吗？`, '确认', { type: 'warning' })
    data.value = data.value.filter((d) => d.code !== row.code)
    ElMessage.success('删除成功')
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('删除失败')
  }
}

const handleSave = () => {
  if (!editing.value.code || !editing.value.name) {
    ElMessage.warning('请填写编码和名称')
    return
  }
  const idx = data.value.findIndex((d) => d.code === editing.value.code)
  if (idx >= 0) data.value[idx] = { ...editing.value }
  else data.value.push({ ...editing.value })
  ElMessage.success('保存成功')
  showModal.value = false
}

onMounted(loadData)
</script>