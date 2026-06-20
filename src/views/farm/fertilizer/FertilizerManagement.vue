<!--
  肥料管理页面
  对标 V1.1 src/components/farm/fertilizer/FertilizerTable.tsx + 相关 modal
-->
<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center gap-3">
        <el-icon :size="24" color="#059669"><Sugar /></el-icon>
        <h1 class="text-xl font-bold text-gray-900">肥料库管理</h1>
      </div>
      <div class="flex items-center gap-2">
        <el-input v-model="searchTerm" placeholder="搜索名称/编码" clearable class="!w-48">
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <el-button type="primary" @click="showAdd = true">
          <el-icon><Plus /></el-icon>新增肥料
        </el-button>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm p-4">
      <el-table v-loading="loading" :data="filteredData" stripe border>
        <el-table-column prop="code" label="编码" min-width="120">
          <template #default="{ row }"><span class="font-mono font-medium">{{ row.code }}</span></template>
        </el-table-column>
        <el-table-column prop="name" label="名称" min-width="160" />
        <el-table-column prop="type" label="类型" min-width="100">
          <template #default="{ row }"><el-tag size="small">{{ row.type }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="nitrogen" label="N(%)" min-width="80" align="right" />
        <el-table-column prop="phosphorus" label="P(%)" min-width="80" align="right" />
        <el-table-column prop="potassium" label="K(%)" min-width="80" align="right" />
        <el-table-column prop="stock" label="库存(kg)" min-width="100" align="right" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <FertilizerAddModal v-model="showAdd" @submit="handleAdd" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { Plus, Search, Sugar } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import FertilizerAddModal from './FertilizerAddModal.vue'

const data = ref([])
const loading = ref(false)
const searchTerm = ref('')
const showAdd = ref(false)

const filteredData = computed(() => {
  const kw = searchTerm.value.trim()
  if (!kw) return data.value
  return data.value.filter((d) => d.code?.includes(kw) || d.name?.includes(kw))
})

const loadData = () => {
  loading.value = true
  data.value = [
    { code: 'FER001', name: '尿素', type: '氮肥', nitrogen: 46, phosphorus: 0, potassium: 0, stock: 1000 },
    { code: 'FER002', name: '磷酸二氢钾', type: '磷钾肥', nitrogen: 0, phosphorus: 52, potassium: 34, stock: 500 },
    { code: 'FER003', name: '复合肥', type: '复合肥', nitrogen: 15, phosphorus: 15, potassium: 15, stock: 2000 },
  ]
  loading.value = false
}

const handleAdd = (newItem) => {
  data.value.push({ ...newItem, code: `FER${String(data.value.length + 1).padStart(3, '0')}`, stock: 0 })
  ElMessage.success('新增成功')
}

const handleEdit = (row) => {
  ElMessage.info('编辑功能待实现')
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定删除 "${row.name}" 吗？`, '确认', { type: 'warning' })
    data.value = data.value.filter((d) => d.code !== row.code)
    ElMessage.success('删除成功')
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('删除失败')
  }
}

onMounted(loadData)
</script>