<!--
  客户管理页面
  对标 V1.1 src/components/farm/customer/CustomerPage.tsx
-->
<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center gap-3">
        <el-icon :size="24" color="#059669"><Avatar /></el-icon>
        <h1 class="text-xl font-bold text-gray-900">客户管理</h1>
      </div>
      <div class="flex items-center gap-2">
        <el-input v-model="searchTerm" placeholder="搜索客户名" clearable class="!w-48">
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <el-button type="primary" @click="showAdd = true">
          <el-icon><Plus /></el-icon>新增客户
        </el-button>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm p-4">
      <el-table v-loading="loading" :data="filteredData" stripe border>
        <el-table-column prop="code" label="编码" min-width="120">
          <template #default="{ row }"><span class="font-mono font-medium">{{ row.code }}</span></template>
        </el-table-column>
        <el-table-column prop="name" label="客户名" min-width="160" />
        <el-table-column prop="contact" label="联系人" min-width="100" />
        <el-table-column prop="phone" label="电话" min-width="120" />
        <el-table-column prop="address" label="地址" min-width="200" show-overflow-tooltip />
        <el-table-column label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.type === 'vip' ? 'danger' : 'info'" size="small">
              {{ row.type === 'vip' ? 'VIP' : '普通' }}
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

    <CustomerModal v-model="showAdd" :customer="editing" @submit="handleSave" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { Avatar, Plus, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import CustomerModal from './CustomerModal.vue'

const data = ref([])
const loading = ref(false)
const searchTerm = ref('')
const showAdd = ref(false)
const editing = ref(null)

const filteredData = computed(() => {
  const kw = searchTerm.value.trim()
  if (!kw) return data.value
  return data.value.filter((d) => d.code?.includes(kw) || d.name?.includes(kw))
})

const loadData = () => {
  loading.value = true
  data.value = [
    { code: 'CUS001', name: '北京华联超市', contact: '张经理', phone: '13800138000', address: '北京市朝阳区', type: 'vip' },
    { code: 'CUS002', name: '上海盒马鲜生', contact: '李总', phone: '13900139000', address: '上海市浦东新区', type: 'vip' },
  ]
  loading.value = false
}

const handleEdit = (row) => {
  editing.value = { ...row }
  showAdd.value = true
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定删除客户 "${row.name}" 吗？`, '确认', { type: 'warning' })
    data.value = data.value.filter((d) => d.code !== row.code)
    ElMessage.success('删除成功')
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('删除失败')
  }
}

const handleSave = (item) => {
  const idx = data.value.findIndex((d) => d.code === item.code)
  if (idx >= 0) data.value[idx] = { ...item }
  else data.value.push({ ...item, code: `CUS${String(data.value.length + 1).padStart(3, '0')}` })
  ElMessage.success('保存成功')
  editing.value = null
}

onMounted(loadData)
</script>