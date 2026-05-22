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
            <el-icon :size="24" color="#fff"><MapLocation /></el-icon>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">区域系统</h1>
            <p class="text-gray-500">分区与设备系统的关联映射配置</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-end gap-4">
        <div class="grid grid-cols-3 gap-4 flex-1">
          <div>
            <label class="block text-xs text-gray-500 mb-1">关键词搜索</label>
            <el-input
              v-model="keyword"
              placeholder="搜索分区、系统或描述..."
              clearable
              @clear="handleKeywordClear"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
          <div>
            <label class="block text-xs text-gray-500 mb-1">状态</label>
            <el-select v-model="filterStatus" placeholder="全部" clearable class="w-full">
              <el-option label="全部" value="" />
              <el-option label="使用中" value="active" />
              <el-option label="已停用" value="inactive" />
            </el-select>
          </div>
          <div class="flex items-end">
            <el-button @click="handleReset">重置</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 表格卡片 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900">
          映射列表
          <span v-if="filteredData.length > 0" class="text-sm text-gray-400 font-normal">({{ filteredData.length }})</span>
        </h3>
        <el-button type="primary" @click="openAddModal">
          <el-icon><Plus /></el-icon> 新增映射
        </el-button>
      </div>

      <!-- 表格 -->
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
              <th class="py-3 px-4 text-left font-medium">分区名称</th>
              <th class="py-3 px-4 text-left font-medium">设备系统</th>
              <th class="py-3 px-4 text-left font-medium w-40">关联设备</th>
              <th class="py-3 px-4 text-left font-medium">描述</th>
              <th class="py-3 px-4 text-left font-medium w-24">状态</th>
              <th class="py-3 px-4 text-left font-medium w-40">创建时间</th>
              <th class="py-3 px-4 text-center font-medium w-24">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="isLoading">
              <td colspan="7" class="py-12 text-center text-gray-400">加载中...</td>
            </tr>
            <tr v-else-if="filteredData.length === 0">
              <td colspan="7" class="py-12 text-center text-gray-400">
                {{ items.length === 0 ? '暂无映射数据，点击"新增映射"开始创建' : '无匹配结果' }}
              </td>
            </tr>
            <template v-else>
              <tr
                v-for="item in filteredData"
                :key="item.oid"
                class="border-b border-gray-50 hover:bg-gray-50 transition-colors"
              >
                <td class="py-2.5 px-4 font-medium text-gray-900">
                  {{ item.partitionName || item.partitionOid }}
                </td>
                <td class="py-2.5 px-4">
                  <span class="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                    {{ item.systemName || item.systemOid }}
                  </span>
                </td>
                <td class="py-2.5 px-4 text-gray-500 text-xs font-mono">{{ item.deviceOid || '-' }}</td>
                <td class="py-2.5 px-4 text-gray-500 text-xs max-w-[300px] truncate">{{ item.description || '-' }}</td>
                <td class="py-2.5 px-4">
                  <span
                    :class="[
                      'inline-flex px-2 py-0.5 rounded text-xs font-medium',
                      item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    ]"
                  >
                    {{ item.status === 'active' ? '使用中' : '已停用' }}
                  </span>
                </td>
                <td class="py-2.5 px-4 text-gray-500 text-xs">
                  {{ item.createdAt ? formatDate(item.createdAt) : '-' }}
                </td>
                <td class="py-2.5 px-4">
                  <div class="flex items-center justify-center gap-1">
                    <el-button
                      link
                      @click="openEditModal(item)"
                      class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      <el-icon><Edit /></el-icon>
                    </el-button>
                    <el-button
                      link
                      @click="openDeleteConfirm(item)"
                      class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <MappingModal
      v-model="showModal"
      :title="modalTitle"
      :form="form"
      :partition-options="partitionOptions"
      :system-options="systemOptions"
      :is-edit="isEdit"
      @close="closeModal"
      @submit="handleSubmit"
    />

    <!-- 删除确认弹窗 -->
    <el-dialog
      v-model="showDeleteConfirm"
      title="确认删除"
      width="400px"
      :close-on-click-modal="false"
    >
      <p class="text-sm text-gray-500">
        确定要删除映射 "<span class="font-medium text-gray-700">{{ selectedItem?.partitionName || selectedItem?.partitionOid }}</span> →
        <span class="font-medium text-gray-700">{{ selectedItem?.systemName || selectedItem?.systemOid }}</span>" 吗？
      </p>
      <template #footer>
        <el-button @click="showDeleteConfirm = false">取消</el-button>
        <el-button type="danger" @click="handleDelete">确认删除</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ArrowLeft, MapLocation, Plus, Edit, Delete, Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useAreaSystemStore } from '@/stores/modules/areaSystem'
import { useFarmPartitionStore } from '@/stores/modules/farmPartition'
import MappingModal from './MappingModal.vue'

// Store
const areaSystemStore = useAreaSystemStore()
const farmPartitionStore = useFarmPartitionStore()

// 状态
const items = computed(() => areaSystemStore.items)
const isLoading = computed(() => areaSystemStore.isLoading)
const partitions = computed(() => farmPartitionStore.items)

const keyword = ref('')
const filterStatus = ref('')

// 弹窗状态
const showModal = ref(false)
const modalTitle = ref('新增映射')
const isEdit = ref(false)
const showDeleteConfirm = ref(false)
const selectedItem = ref(null)

// 表单状态
const form = ref({
  partitionOid: '',
  systemOid: '',
  deviceOid: '',
  description: ''
})

// 系统输入模式
const systemInputMode = ref('select')

// 筛选后的数据
const filteredData = computed(() => {
  let filtered = items.value
  if (keyword.value) {
    const kw = keyword.value.toLowerCase()
    filtered = filtered.filter(item =>
      (item.partitionName || '').toLowerCase().includes(kw) ||
      (item.systemName || '').toLowerCase().includes(kw) ||
      (item.description || '').toLowerCase().includes(kw) ||
      (item.deviceOid || '').toLowerCase().includes(kw)
    )
  }
  if (filterStatus.value) {
    filtered = filtered.filter(item => item.status === filterStatus.value)
  }
  return filtered
})

// 系统名称选项（从已存在的映射中提取）
const systemOptions = computed(() => {
  const existingSystems = [...new Set(items.value.map(i => i.systemOid).filter(Boolean))]
  return existingSystems
})

// 分区下拉选项（扁平化，含父子层级）
const partitionOptions = computed(() => {
  const options = []

  // 构建parentOid → name 的快速查找
  const nameMap = new Map(partitions.value.map(p => [p.oid, p.name]))

  // 递归收集选项，显示层级路径
  const collect = (parentOid, depth, prefix) => {
    const children = partitions.value
      .filter(p => p.parentOid === parentOid)
      .sort((a, b) => a.sortOrder - b.sortOrder)
    for (const child of children) {
      const label = prefix ? `${prefix} > ${child.name}` : child.name
      options.push({ oid: child.oid, label })
      collect(child.oid, depth + 1, label)
    }
  }
  collect(null, 0, '')
  return options
})

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 重置表单
const resetForm = () => {
  form.value = {
    partitionOid: '',
    systemOid: '',
    deviceOid: '',
    description: ''
  }
}

// 关键词清除
const handleKeywordClear = () => {
  keyword.value = ''
}

// 重置筛选
const handleReset = () => {
  keyword.value = ''
  filterStatus.value = ''
}

// 打开新增弹窗
const openAddModal = () => {
  resetForm()
  modalTitle.value = '新增映射'
  isEdit.value = false
  // 根据是否有已有系统选择输入模式
  systemInputMode.value = systemOptions.value.length > 0 ? 'select' : 'input'
  showModal.value = true
}

// 打开编辑弹窗
const openEditModal = (item) => {
  selectedItem.value = item
  form.value = {
    partitionOid: item.partitionOid,
    systemOid: item.systemOid,
    deviceOid: item.deviceOid || '',
    description: item.description || ''
  }
  modalTitle.value = '编辑映射'
  isEdit.value = true
  systemInputMode.value = systemOptions.value.includes(item.systemOid) ? 'select' : 'input'
  showModal.value = true
}

// 关闭弹窗
const closeModal = () => {
  showModal.value = false
  selectedItem.value = null
  resetForm()
}

// 打开删除确认
const openDeleteConfirm = (item) => {
  selectedItem.value = item
  showDeleteConfirm.value = true
}

// 提交表单
const handleSubmit = async () => {
  if (!form.value.partitionOid || !form.value.systemOid) {
    ElMessage.warning('请填写必填项')
    return
  }

  if (isEdit.value && selectedItem.value) {
    await areaSystemStore.updateItem(selectedItem.value.oid, {
      partitionOid: form.value.partitionOid,
      systemOid: form.value.systemOid,
      deviceOid: form.value.deviceOid || undefined,
      description: form.value.description || undefined
    })
    ElMessage.success('更新成功')
  } else {
    const result = await areaSystemStore.createItem({
      partitionOid: form.value.partitionOid,
      systemOid: form.value.systemOid,
      deviceOid: form.value.deviceOid || undefined,
      description: form.value.description || undefined
    })
    if (result) {
      ElMessage.success('创建成功')
    }
  }
  closeModal()
}

// 删除
const handleDelete = async () => {
  if (!selectedItem.value) return
  const success = await areaSystemStore.deleteItem(selectedItem.value.oid)
  if (success) {
    ElMessage.success('删除成功')
    showDeleteConfirm.value = false
    selectedItem.value = null
  }
}

// 初始加载
onMounted(() => {
  areaSystemStore.fetchItems()
  farmPartitionStore.fetchItems()
})
</script>
