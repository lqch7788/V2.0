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
            <el-icon :size="24" color="white"><Warning /></el-icon>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">病虫害字典</h1>
            <p class="text-gray-500">管理虫害和病害的基础数据</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab切换 -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100">
      <div class="border-b border-gray-100">
        <div class="flex">
          <button
            @click="activeTab = 'pest'"
            :class="[
              'px-6 py-3 text-sm font-bold border-b-2 transition-colors',
              activeTab === 'pest'
                ? 'border-green-500 text-green-600 bg-green-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            ]"
          >
            <el-icon class="mr-1"><Warning /></el-icon>
            虫害 ({{ stats.pestCount }})
          </button>
          <button
            @click="activeTab = 'disease'"
            :class="[
              'px-6 py-3 text-sm font-bold border-b-2 transition-colors',
              activeTab === 'disease'
                ? 'border-green-500 text-green-600 bg-green-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            ]"
          >
            <el-icon class="mr-1"><Warning /></el-icon>
            病害 ({{ stats.diseaseCount }})
          </button>
        </div>
      </div>

      <!-- 顶部操作栏 -->
      <div class="px-4 py-3 flex items-center justify-between gap-4 border-b border-gray-100 flex-wrap">
        <div class="flex items-center gap-3 flex-1 flex-wrap">
          <!-- 搜索框 -->
          <div class="relative w-64">
            <el-icon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"><Search /></el-icon>
            <el-input
              type="text"
              v-model="searchKeyword"
              placeholder="搜索病虫害名称或编码..."
              class="pl-9"
              @keyup.enter="handleSearch"
            />
          </div>
          <!-- 适用作物 -->
          <el-input
            v-model="filters.targetCrops"
            placeholder="适用作物"
            class="w-40"
          />
          <!-- 状态 -->
          <el-select v-model="filters.status" placeholder="状态" class="w-28">
            <el-option label="状态" value="" />
            <el-option label="启用" value="active" />
            <el-option label="禁用" value="inactive" />
          </el-select>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </div>
        <el-button type="primary" @click="handleAdd">
          <el-icon class="mr-1"><Plus /></el-icon>
          新增{{ activeTab === 'pest' ? '虫害' : '病害' }}
        </el-button>
      </div>

      <!-- 错误提示 -->
      <div v-if="error" class="mx-4 mt-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
        {{ error }}
      </div>

      <!-- 表格 -->
      <div class="p-4">
        <el-table
          :data="filteredItems"
          v-loading="loading"
          stripe
          style="width: 100%"
        >
          <el-table-column prop="code" label="编码" width="150" />
          <el-table-column prop="name" label="名称" min-width="150" />
          <el-table-column prop="dictType" label="类型" width="100">
            <template #default="{ row }">
              <span :class="row.dictType === 'pest' ? 'text-green-600' : 'text-orange-600'">
                {{ row.dictType === 'pest' ? '虫害' : '病害' }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="targetCrops" label="适用作物" width="150" />
          <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <span
                :class="[
                  'px-2 py-0.5 text-xs rounded-full',
                  row.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
                ]"
              >
                {{ row.status === 'active' ? '启用' : '禁用' }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" fixed="right">
            <template #default="{ row }">
              <div class="flex items-center gap-1">
                <el-button text size="small" @click="handleDetail(row)" class="text-blue-600 hover:bg-blue-50">
                  <el-icon><View /></el-icon>
                </el-button>
                <el-button text size="small" @click="handleEdit(row)" class="text-indigo-600 hover:bg-indigo-50">
                  <el-icon><Edit /></el-icon>
                </el-button>
                <el-button text size="small" @click="handleDelete(row)" class="text-red-600 hover:bg-red-50">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑病虫害' : '新增病虫害'"
      width="500px"
      :close-on-click-modal="false"
    >
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            编码 <span class="text-red-500">*</span>
          </label>
          <el-input v-model="formData.code" placeholder="请输入编码" :disabled="isEdit" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            名称 <span class="text-red-500">*</span>
          </label>
          <el-input v-model="formData.name" placeholder="请输入名称" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            类型
          </label>
          <el-select v-model="formData.dictType" class="w-full">
            <el-option label="虫害" value="pest" />
            <el-option label="病害" value="disease" />
          </el-select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            适用作物
          </label>
          <el-input v-model="formData.targetCrops" placeholder="请输入适用作物" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            描述
          </label>
          <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="请输入描述" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            状态
          </label>
          <el-select v-model="formData.status" class="w-full">
            <el-option label="启用" value="active" />
            <el-option label="禁用" value="inactive" />
          </el-select>
        </div>
      </div>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="saveLoading">保存</el-button>
      </template>
    </el-dialog>

    <!-- 详情弹窗 -->
    <el-dialog
      v-model="detailVisible"
      title="病虫害详情"
      width="500px"
    >
      <div class="space-y-3" v-if="currentRecord">
        <div class="flex border-b border-gray-100 py-2">
          <span class="text-gray-500 w-24">编码：</span>
          <span class="text-gray-900">{{ currentRecord.code }}</span>
        </div>
        <div class="flex border-b border-gray-100 py-2">
          <span class="text-gray-500 w-24">名称：</span>
          <span class="text-gray-900">{{ currentRecord.name }}</span>
        </div>
        <div class="flex border-b border-gray-100 py-2">
          <span class="text-gray-500 w-24">类型：</span>
          <span :class="currentRecord.dictType === 'pest' ? 'text-green-600' : 'text-orange-600'">
            {{ currentRecord.dictType === 'pest' ? '虫害' : '病害' }}
          </span>
        </div>
        <div class="flex border-b border-gray-100 py-2">
          <span class="text-gray-500 w-24">适用作物：</span>
          <span class="text-gray-900">{{ currentRecord.targetCrops || '-' }}</span>
        </div>
        <div class="flex border-b border-gray-100 py-2">
          <span class="text-gray-500 w-24">状态：</span>
          <span
            :class="[
              'px-2 py-0.5 text-xs rounded-full',
              currentRecord.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
            ]"
          >
            {{ currentRecord.status === 'active' ? '启用' : '禁用' }}
          </span>
        </div>
        <div class="flex py-2">
          <span class="text-gray-500 w-24">描述：</span>
          <span class="text-gray-900">{{ currentRecord.description || '-' }}</span>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Warning,
  Plus,
  Search,
  Edit,
  Delete,
  View,
  ArrowLeft,
  WarnTriangleFilled
} from '@element-plus/icons-vue'

// 类型
const TabType = {
  PEST: 'pest',
  DISEASE: 'disease'
}

// 模拟数据
const mockData = [
  { id: '1', code: 'PEST001', name: '蚜虫', dictType: 'pest', targetCrops: '蔬菜', description: '吸食植物汁液，导致叶片卷曲', status: 'active' },
  { id: '2', code: 'PEST002', name: '红蜘蛛', dictType: 'pest', targetCrops: '果树', description: '以叶片为食，造成黄叶落叶', status: 'active' },
  { id: '3', code: 'PEST003', name: '菜青虫', dictType: 'pest', targetCrops: '白菜', description: '啃食叶片，影响产量', status: 'active' },
  { id: '4', code: 'PEST004', name: '蝗虫', dictType: 'pest', targetCrops: '粮食', description: '大面积啃食农作物', status: 'inactive' },
  { id: '5', code: 'DISEASE001', name: '霜霉病', dictType: 'disease', targetCrops: '蔬菜', description: '叶片出现霜状霉层', status: 'active' },
  { id: '6', code: 'DISEASE002', name: '灰霉病', dictType: 'disease', targetCrops: '番茄', description: '果实腐烂，表面灰色霉层', status: 'active' },
  { id: '7', code: 'DISEASE003', name: '枯萎病', dictType: 'disease', targetCrops: '瓜类', description: '维管束病变，导致植株枯萎', status: 'active' },
  { id: '8', code: 'DISEASE004', name: '病毒病', dictType: 'disease', targetCrops: '烟草', description: '叶片花叶，植株矮化', status: 'inactive' },
]

// 状态
const loading = ref(false)
const saveLoading = ref(false)
const error = ref(null)
const activeTab = ref<TabType>('pest')
const searchKeyword = ref('')
const filters = reactive({
  targetCrops: '',
  status: ''
})

// 弹窗状态
const dialogVisible = ref(false)
const detailVisible = ref(false)
const isEdit = ref(false)
const currentRecord = ref(null)
const formData = reactive({
  id: '',
  code: '',
  name: '',
  dictType: 'pest',
  targetCrops: '',
  description: '',
  status: 'active'
})

// 数据
const dataList = ref([])

// 计算属性
const filteredItems = computed(() => {
  let items = dataList.value.filter(item => item.dictType === activeTab.value)

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    items = items.filter(item =>
      item.name.toLowerCase().includes(keyword) ||
      item.code.toLowerCase().includes(keyword)
    )
  }

  if (filters.targetCrops) {
    items = items.filter(item =>
      item.targetCrops && item.targetCrops.includes(filters.targetCrops)
    )
  }

  if (filters.status) {
    items = items.filter(item => item.status === filters.status)
  }

  return items
})

const stats = computed(() => ({
  pestCount: dataList.value.filter(it => it.dictType === 'pest').length,
  diseaseCount: dataList.value.filter(it => it.dictType === 'disease').length,
}))

// 方法
const loadData = async () => {
  loading.value = true
  error.value = null
  try {
    // 模拟加载延迟
    await new Promise(resolve => setTimeout(resolve, 300))
    dataList.value = [...mockData]
  } catch (err) {
    error.value = err instanceof Error ? err.message : '加载数据失败'
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  // 搜索逻辑由computed处理
}

const handleReset = () => {
  searchKeyword.value = ''
  filters.targetCrops = ''
  filters.status = ''
}

const handleAdd = () => {
  isEdit.value = false
  Object.assign(formData, {
    id: '',
    code: '',
    name: '',
    dictType: activeTab.value,
    targetCrops: '',
    description: '',
    status: 'active'
  })
  dialogVisible.value = true
}

const handleDetail = (record) => {
  currentRecord.value = record
  detailVisible.value = true
}

const handleEdit = (record) => {
  isEdit.value = true
  Object.assign(formData, { ...record })
  dialogVisible.value = true
}

const handleDelete = async (record) => {
  try {
    await ElMessageBox.confirm(
      `确定删除该病虫害吗？\n\n删除后，被引用的信息将无法完整显示。`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    dataList.value = dataList.value.filter(item => item.id !== record.id)
    ElMessage.success('删除成功')
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error(err instanceof Error ? err.message : '删除失败')
    }
  }
}

const handleSave = async () => {
  if (!formData.code || !formData.name) {
    ElMessage.error('请填写编码和名称')
    return
  }

  saveLoading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 300))

    if (isEdit.value) {
      const index = dataList.value.findIndex(item => item.id === formData.id)
      if (index !== -1) {
        dataList.value[index] = { ...formData }
      }
      ElMessage.success('保存成功')
    } else {
      const newRecord = {
        ...formData,
        id: Date.now().toString()
      }
      dataList.value.push(newRecord)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
  } catch (err) {
    ElMessage.error(err instanceof Error ? err.message : '保存失败')
  } finally {
    saveLoading.value = false
  }
}

// 监听Tab切换
const handleTabChange = (tab) => {
  activeTab.value = tab
  formData.dictType = tab
}

// 初始化
onMounted(() => {
  loadData()
})
</script>
