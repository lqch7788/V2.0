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
            <el-icon :size="24" color="#fff"><Coin /></el-icon>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">成本核算设置</h1>
            <p class="text-gray-500">成本类别、预算与统计分析</p>
          </div>
        </div>
        <!-- 刷新按钮 -->
        <button
          @click="handleRefresh"
          class="h-10 px-3 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-1"
        >
          <el-icon><Refresh /></el-icon>
          刷新
        </button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div class="flex items-center gap-2 mb-2">
          <el-icon :size="20" color="#2563eb"><Coin /></el-icon>
          <p class="text-sm text-gray-500">总预算</p>
        </div>
        <p class="text-xl font-bold text-gray-900">¥{{ totalBudget.toLocaleString() }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div class="flex items-center gap-2 mb-2">
          <el-icon :size="20" color="#059669"><TrendCharts /></el-icon>
          <p class="text-sm text-gray-500">已使用</p>
        </div>
        <p class="text-xl font-bold text-emerald-600">¥{{ totalUsed.toLocaleString() }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <p class="text-sm text-gray-500">成本类别</p>
        <p class="text-xl font-bold text-gray-900 mt-1">{{ categories.length }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <p class="text-sm text-gray-500">进行中预算</p>
        <p class="text-xl font-bold text-gray-900 mt-1">{{ activeBudgets }}</p>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex gap-1 bg-gray-100 p-1 rounded-lg">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        class="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all"
        :class="activeTab === tab.id ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
      >
        <el-icon :size="16"><component :is="tab.icon" /></el-icon>
        {{ tab.label }}
      </button>
    </div>

    <!-- 成本类别 Tab -->
    <div v-if="activeTab === 'categories'" class="space-y-4">
      <div class="flex justify-end">
        <button
          @click="openCategoryModal(null)"
          class="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium"
        >
          <el-icon :size="16"><Plus /></el-icon>
          新增类别
        </button>
      </div>
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">名称</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">编码</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">类型</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">单位</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">描述</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-if="filteredCategories.length === 0">
              <td colspan="7" class="px-6 py-8 text-center text-gray-500">暂无数据</td>
            </tr>
            <tr
              v-for="cat in filteredCategories"
              :key="cat.id"
              class="hover:bg-gray-50"
            >
              <td class="px-6 py-4 font-medium text-gray-900">{{ cat.categoryName }}</td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ cat.categoryCode }}</td>
              <td class="px-6 py-4">
                <span class="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded">
                  {{ COST_CATEGORY_TYPE_MAP[cat.categoryType] || cat.categoryType }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ cat.unit }}</td>
              <td class="px-6 py-4 text-sm text-gray-500">{{ cat.description }}</td>
              <td class="px-6 py-4">
                <span
                  class="px-2 py-1 text-xs rounded-full"
                  :class="cat.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'"
                >
                  {{ COST_CATEGORY_STATUS_MAP[cat.status] || cat.status }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center justify-end gap-2">
                  <button @click="openCategoryModal(cat)" class="p-1 text-blue-600 hover:bg-blue-50 rounded text-sm">编辑</button>
                  <button @click="handleDeleteCategory(cat.id)" class="p-1 text-red-600 hover:bg-red-50 rounded text-sm">删除</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 预算管理 Tab -->
    <div v-if="activeTab === 'budgets'" class="space-y-4">
      <div class="flex justify-end">
        <button
          @click="openBudgetModal(null)"
          class="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium"
        >
          <el-icon :size="16"><Plus /></el-icon>
          新增预算
        </button>
      </div>
      <div class="space-y-4">
        <div v-if="filteredBudgets.length === 0" class="bg-white rounded-xl p-8 text-center text-gray-500">
          暂无数据
        </div>
        <div
          v-for="budget in filteredBudgets"
          :key="budget.id"
          class="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
        >
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-semibold text-gray-900">{{ budget.budgetName }}</h3>
            <span
              class="px-2 py-1 text-xs rounded-full"
              :class="budget.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'"
            >
              {{ BUDGET_STATUS_MAP[budget.status] || budget.status }}
            </span>
          </div>
          <div class="grid grid-cols-3 gap-4 text-sm mb-3">
            <div>
              <p class="text-gray-500">类别</p>
              <p class="text-gray-900 font-medium">{{ budget.categoryName || '-' }}</p>
            </div>
            <div>
              <p class="text-gray-500">周期</p>
              <p class="text-gray-900 font-medium">
                {{ budget.budgetYear }}{{ budget.budgetMonth ? `-${String(budget.budgetMonth).padStart(2, '0')}` : '' }}
              </p>
            </div>
            <div>
              <p class="font-bold" :class="budgetPercent(budget.usedAmount, budget.budgetAmount) >= 80 ? 'text-red-600' : 'text-emerald-600'">
                {{ budgetPercent(budget.usedAmount, budget.budgetAmount) }}%
              </p>
            </div>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div
              class="h-3 rounded-full"
              :class="budgetPercent(budget.usedAmount, budget.budgetAmount) >= 80 ? 'bg-red-500' : 'bg-emerald-500'"
              :style="{ width: `${Math.min(budgetPercent(budget.usedAmount, budget.budgetAmount), 100)}%` }"
            />
          </div>
          <div class="flex justify-between text-xs text-gray-500">
            <span>已用: ¥{{ budget.usedAmount.toLocaleString() }}</span>
            <span>总预算: ¥{{ budget.budgetAmount.toLocaleString() }}</span>
          </div>
          <div class="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-gray-100">
            <button @click="openBudgetModal(budget)" class="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded text-xs">编辑</button>
            <button @click="handleDeleteBudget(budget.id)" class="px-3 py-1 text-red-600 hover:bg-red-50 rounded text-xs">删除</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 成本分析 Tab -->
    <div v-if="activeTab === 'analysis'" class="bg-white rounded-xl p-6 shadow-none border border-gray-100">
      <h3 class="font-semibold text-gray-900 mb-4">成本结构分析</h3>
      <div v-if="statsLoading" class="text-center text-gray-500 py-8">
        <el-icon class="is-loading" :size="32"><Loading /></el-icon>
        <p class="mt-2">加载中...</p>
      </div>
      <div v-else class="space-y-4">
        <div
          v-for="(item, index) in stats?.material?.slice(0, 5)"
          :key="`mat-${index}`"
          class="flex items-center gap-4"
        >
          <div class="w-24 text-sm text-gray-600">{{ item.cost_name || item.cost_type }}</div>
          <div class="flex-1">
            <div class="w-full bg-gray-200 rounded-full h-4">
              <div class="h-4 rounded-full bg-emerald-500" :style="{ width: `${getPercent(item.total_amount)}%` }" />
            </div>
          </div>
          <div class="w-20 text-sm text-gray-900 font-medium text-right">{{ getPercent(item.total_amount) }}%</div>
          <div class="w-28 text-sm text-gray-600 text-right">¥{{ item.total_amount.toLocaleString() }}</div>
        </div>
        <p v-if="!stats?.material || stats.material.length === 0" class="text-center text-gray-400 py-4">暂无物料成本数据</p>
      </div>
    </div>

    <!-- 类别编辑弹窗 -->
    <el-dialog
      v-model="showCategoryModal"
      width="500px"
      :show-close="false"
      class="category-modal"
    >
      <template #header>
        <div class="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 rounded-t-xl text-white">
          <h3 class="text-lg font-semibold">{{ editingCategory ? '编辑类别' : '新增成本类别' }}</h3>
          <button @click="showCategoryModal = false" class="p-1 hover:bg-white/20 rounded">
            <el-icon :size="20"><Plus /></el-icon>
          </button>
        </div>
      </template>

      <div class="p-6 space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">类别名称 <span class="text-red-500">*</span></label>
            <el-input v-model="categoryForm.categoryName" placeholder="请输入类别名称" size="large" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">编码 <span class="text-red-500">*</span></label>
            <el-input v-model="categoryForm.categoryCode" placeholder="请输入编码" size="large" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">类型</label>
            <el-select v-model="categoryForm.categoryType" placeholder="请选择类型" size="large" class="w-full">
              <el-option v-for="(label, key) in COST_CATEGORY_TYPE_MAP" :key="key" :label="label" :value="key" />
            </el-select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">单位</label>
            <el-input v-model="categoryForm.unit" placeholder="如: 元/千克" size="large" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">描述</label>
          <el-input v-model="categoryForm.description" type="textarea" :rows="2" placeholder="请输入描述" size="large" />
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <el-button @click="showCategoryModal = false">取消</el-button>
          <el-button type="primary" @click="handleSaveCategory">保存</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 预算编辑弹窗 -->
    <el-dialog
      v-model="showBudgetModal"
      width="500px"
      :show-close="false"
      class="budget-modal"
    >
      <template #header>
        <div class="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 rounded-t-xl text-white">
          <h3 class="text-lg font-semibold">{{ editingBudget ? '编辑预算' : '新增预算' }}</h3>
          <button @click="showBudgetModal = false" class="p-1 hover:bg-white/20 rounded">
            <el-icon :size="20"><Plus /></el-icon>
          </button>
        </div>
      </template>

      <div class="p-6 space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">预算名称 <span class="text-red-500">*</span></label>
          <el-input v-model="budgetForm.budgetName" placeholder="请输入预算名称" size="large" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">成本类别 <span class="text-red-500">*</span></label>
            <el-select v-model="budgetForm.categoryOid" placeholder="请选择类别" size="large" class="w-full">
              <el-option v-for="cat in categories" :key="cat.oid" :label="cat.categoryName" :value="cat.oid" />
            </el-select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">预算金额 <span class="text-red-500">*</span></label>
            <el-input-number v-model="budgetForm.budgetAmount" :min="0" :precision="2" size="large" class="w-full" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">年份 <span class="text-red-500">*</span></label>
            <el-input-number v-model="budgetForm.budgetYear" :min="2000" :max="2100" size="large" class="w-full" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">月份（可选）</label>
            <el-input-number v-model="budgetForm.budgetMonth" :min="1" :max="12" size="large" class="w-full" />
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <el-button @click="showBudgetModal = false">取消</el-button>
          <el-button type="primary" @click="handleSaveBudget">保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useCostStore, COST_CATEGORY_TYPE_MAP, COST_CATEGORY_STATUS_MAP, BUDGET_STATUS_MAP } from '@/stores/modules/cost'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft,
  Plus,
  Loading,
  Coin,
  DataLine,
  TrendCharts,
  Money,
  TrendCharts as Trendings,
  Refresh
} from '@element-plus/icons-vue'

// Store
const costStore = useCostStore()
const { categories, budgets, stats, statsLoading, loadAll, addCategory, updateCategory, removeCategory, addBudget, updateBudget, removeBudget, loadStats } = costStore

// Tab 配置
const tabs = [
  { id: 'categories', label: '成本类别', icon: Coin },
  { id: 'budgets', label: '预算管理', icon: Money },
  { id: 'analysis', label: '成本分析', icon: Trendings }
]

// 本地状态
const activeTab = ref('categories')
const searchTerm = ref('')
const showCategoryModal = ref(false)
const showBudgetModal = ref(false)
const editingCategory = ref(null)
const editingBudget = ref(null)

// 类别表单
const categoryForm = reactive({
  categoryName: '',
  categoryCode: '',
  categoryType: 'other',
  unit: '',
  description: '',
  status: 'active'
})

// 预算表单
const budgetForm = reactive({
  budgetName: '',
  categoryOid: '',
  budgetYear: new Date().getFullYear(),
  budgetMonth: undefined,
  budgetAmount: 0,
  status: 'active'
})

// 过滤后的类别
const filteredCategories = computed(() => {
  if (!searchTerm.value) return categories
  const term = searchTerm.value.toLowerCase()
  return categories.filter(c =>
    (c.categoryName || '').toLowerCase().includes(term) ||
    (c.categoryCode || '').toLowerCase().includes(term)
  )
})

// 过滤后的预算
const filteredBudgets = computed(() => {
  if (!searchTerm.value) return budgets
  const term = searchTerm.value.toLowerCase()
  return budgets.filter(b =>
    (b.budgetName || '').toLowerCase().includes(term) ||
    (b.categoryName || '').toLowerCase().includes(term)
  )
})

// 计算属性
const totalBudget = computed(() => budgets.reduce((sum, b) => sum + b.budgetAmount, 0))
const totalUsed = computed(() => budgets.reduce((sum, b) => sum + b.usedAmount, 0))
const activeBudgets = computed(() => budgets.filter(b => b.status === 'active').length)

// 计算预算百分比
const budgetPercent = (used, total) => {
  return total > 0 ? Math.round((used / total) * 100) : 0
}

// 计算分析百分比
const getPercent = (amount) => {
  if (!stats?.material || stats.material.length === 0) return 0
  const totalAmount = stats.material.reduce((sum, m) => sum + m.total_amount, 0)
  return totalAmount > 0 ? Math.round((amount / totalAmount) * 100) : 0
}

// 打开类别弹窗
const openCategoryModal = (cat) => {
  if (cat) {
    editingCategory.value = cat
    Object.assign(categoryForm, {
      categoryName: cat.categoryName,
      categoryCode: cat.categoryCode,
      categoryType: cat.categoryType || 'other',
      unit: cat.unit || '',
      description: cat.description || '',
      status: cat.status || 'active'
    })
  } else {
    editingCategory.value = null
    Object.assign(categoryForm, {
      categoryName: '',
      categoryCode: '',
      categoryType: 'other',
      unit: '',
      description: '',
      status: 'active'
    })
  }
  showCategoryModal.value = true
}

// 打开预算弹窗
const openBudgetModal = (bud) => {
  if (bud) {
    editingBudget.value = bud
    Object.assign(budgetForm, {
      budgetName: bud.budgetName,
      categoryOid: bud.categoryOid || '',
      budgetYear: bud.budgetYear || new Date().getFullYear(),
      budgetMonth: bud.budgetMonth || undefined,
      budgetAmount: bud.budgetAmount || 0,
      status: bud.status || 'active'
    })
  } else {
    editingBudget.value = null
    Object.assign(budgetForm, {
      budgetName: '',
      categoryOid: '',
      budgetYear: new Date().getFullYear(),
      budgetMonth: undefined,
      budgetAmount: 0,
      status: 'active'
    })
  }
  showBudgetModal.value = true
}

// 保存类别
const handleSaveCategory = async () => {
  if (!categoryForm.categoryName || !categoryForm.categoryCode) {
    ElMessage.warning('请填写类别名称和编码')
    return
  }
  try {
    if (editingCategory.value) {
      await updateCategory(editingCategory.value.id, { ...categoryForm })
      ElMessage.success('更新成功')
    } else {
      await addCategory({ ...categoryForm })
      ElMessage.success('创建成功')
    }
    showCategoryModal.value = false
  } catch (err) {
    ElMessage.error('保存失败')
  }
}

// 删除类别
const handleDeleteCategory = async (id) => {
  try {
    await ElMessageBox.confirm('确定删除该成本类别吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await removeCategory(id)
    ElMessage.success('删除成功')
  } catch {
    // 用户取消
  }
}

// 保存预算
const handleSaveBudget = async () => {
  if (!budgetForm.budgetName || !budgetForm.categoryOid || !budgetForm.budgetYear) {
    ElMessage.warning('请填写预算名称、选择类别和年份')
    return
  }
  try {
    if (editingBudget.value) {
      await updateBudget(editingBudget.value.id, { ...budgetForm })
      ElMessage.success('更新成功')
    } else {
      await addBudget({ ...budgetForm })
      ElMessage.success('创建成功')
    }
    showBudgetModal.value = false
  } catch (err) {
    ElMessage.error('保存失败')
  }
}

// 删除预算
const handleDeleteBudget = async (id) => {
  try {
    await ElMessageBox.confirm('确定删除该预算吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await removeBudget(id)
    ElMessage.success('删除成功')
  } catch {
    // 用户取消
  }
}

// 刷新数据
const handleRefresh = async () => {
  await loadAll()
  if (activeTab.value === 'analysis') {
    await loadStats()
  }
}

// 初始化
onMounted(async () => {
  await loadAll()
  if (activeTab.value === 'analysis') {
    await loadStats()
  }
})

// 监听Tab变化，加载分析数据
import { watch } from 'vue'
watch(activeTab, async (newTab) => {
  if (newTab === 'analysis') {
    await loadStats()
  }
})
</script>

<style scoped>
/* 弹窗样式覆盖 */
.category-modal :deep(.el-dialog),
.budget-modal :deep(.el-dialog) {
  border-radius: 12px;
  overflow: hidden;
}

.category-modal :deep(.el-dialog__header),
.budget-modal :deep(.el-dialog__header) {
  padding: 0;
  margin: 0;
}

.category-modal :deep(.el-dialog__body),
.budget-modal :deep(.el-dialog__body) {
  padding: 0;
}
</style>
