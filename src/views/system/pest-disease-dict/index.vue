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
            虫害 ({{ pestDiseaseStore.stats.pestCount }})
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
            病害 ({{ pestDiseaseStore.stats.diseaseCount }})
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
              v-model="pestDiseaseStore.searchKeyword"
              placeholder="搜索病虫害名称或编码..."
              class="pl-9"
              @keyup.enter="handleSearch"
            />
          </div>
          <!-- 适用作物 -->
          <el-input
            v-model="pestDiseaseStore.filters.targetCrops"
            placeholder="适用作物"
            class="w-40"
          />
          <!-- 状态 -->
          <el-select v-model="pestDiseaseStore.filters.status" placeholder="状态" class="w-28">
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
      <div v-if="pestDiseaseStore.error" class="mx-4 mt-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
        {{ pestDiseaseStore.error }}
      </div>

      <!-- 表格 -->
      <div class="p-4">
        <el-table
          :data="pestDiseaseStore.filteredItems"
          v-loading="pestDiseaseStore.loading"
          stripe
          style="width: 100%"
        >
          <el-table-column prop="dictCode" label="编码" width="150" />
          <el-table-column prop="dictName" label="名称" min-width="150" />
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
          <el-input v-model="formData.dictCode" :placeholder="isEdit ? '' : '自动生成'" :disabled="isEdit" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            名称 <span class="text-red-500">*</span>
          </label>
          <el-input v-model="formData.dictName" placeholder="请输入名称" />
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
        <el-button type="primary" @click="handleSave" :loading="pestDiseaseStore.saveLoading">保存</el-button>
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
          <span class="text-gray-900">{{ currentRecord.dictCode }}</span>
        </div>
        <div class="flex border-b border-gray-100 py-2">
          <span class="text-gray-500 w-24">名称：</span>
          <span class="text-gray-900">{{ currentRecord.dictName }}</span>
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
import { ref, reactive, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Warning,
  Plus,
  Search,
  Edit,
  Delete,
  View,
  ArrowLeft
} from '@element-plus/icons-vue'
import { usePestDiseaseDictStore } from '@/stores/modules/pestDiseaseDict'

// 使用 Store
const pestDiseaseStore = usePestDiseaseDictStore()

// Tab 类型
const TabType = {
  PEST: 'pest',
  DISEASE: 'disease'
}

// 本地状态
const activeTab = ref(TabType.PEST)
const dialogVisible = ref(false)
const detailVisible = ref(false)
const isEdit = ref(false)
const currentRecord = ref(null)

// 新增/编辑表单
const formData = reactive({
  id: '',
  dictCode: '',
  dictName: '',
  dictType: 'pest',
  targetCrops: '',
  description: '',
  status: 'active'
})

// 监听 Tab 切换，同步到 Store 并重新加载数据
watch(activeTab, (newTab) => {
  pestDiseaseStore.activeTab = newTab
  formData.dictType = newTab
  pestDiseaseStore.loadData()
})

// 方法
const handleSearch = () => {
  // 前端过滤由 computed 处理
}

const handleReset = () => {
  pestDiseaseStore.searchKeyword = ''
  pestDiseaseStore.filters.targetCrops = ''
  pestDiseaseStore.filters.status = ''
}

const handleAdd = async () => {
  isEdit.value = false
  Object.assign(formData, {
    id: '',
    dictCode: '',
    dictName: '',
    dictType: activeTab.value,
    targetCrops: '',
    description: '',
    status: 'active'
  })

  // 自动获取下一个编码
  try {
    const nextCode = await pestDiseaseStore.fetchNextCode(activeTab.value)
    formData.dictCode = nextCode
  } catch (e) {
    // 获取失败时留空，用户可手动填写
  }

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
    await pestDiseaseStore.deleteItem(record.id)
    ElMessage.success('删除成功')
    // 刷新列表
    await pestDiseaseStore.loadData()
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error(err instanceof Error ? err.message : '删除失败')
    }
  }
}

const handleSave = async () => {
  if (!formData.dictName) {
    ElMessage.error('请填写名称')
    return
  }

  try {
    if (isEdit.value) {
      await pestDiseaseStore.updateItem(formData.id, formData)
      ElMessage.success('保存成功')
    } else {
      await pestDiseaseStore.createItem(formData)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    // 刷新列表
    await pestDiseaseStore.loadData()
  } catch (err) {
    ElMessage.error(err instanceof Error ? err.message : '保存失败')
  }
}

// 初始化
onMounted(() => {
  pestDiseaseStore.loadData()
})
</script>
