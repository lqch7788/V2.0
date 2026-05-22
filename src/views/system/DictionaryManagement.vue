<template>
  <div class="space-y-6 p-6">
    <!-- 页面头部 -->
    <div class="bg-white rounded-xl p-6 shadow-none">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center gap-3">
          <router-link
            to="/system"
            class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <el-icon :size="24" color="#4B5563"><ArrowLeft /></el-icon>
          </router-link>
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
            <el-icon :size="24" color="white"><Notebook /></el-icon>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">数据字典</h1>
            <p class="text-gray-500">管理系统数据字典配置</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <el-button
            @click="expandAll"
            class="h-10 px-3 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-1"
          >
            <el-icon><ArrowDown /></el-icon>
            全部展开
          </el-button>
          <el-button
            @click="collapseAll"
            class="h-10 px-3 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-1"
          >
            <el-icon><ArrowUp /></el-icon>
            全部折叠
          </el-button>
          <el-button
            @click="loadData"
            class="h-10 px-3 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-1"
          >
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
          <el-button
            type="primary"
            @click="showAddCategoryModal = true"
            class="h-10 px-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg text-sm font-medium flex items-center gap-1 hover:shadow-lg transition-shadow"
          >
            <el-icon><Plus /></el-icon>
            新增分类
          </el-button>
        </div>
      </div>
    </div>

    <!-- 搜索栏 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="relative max-w-md">
        <el-icon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"><Search /></el-icon>
        <el-input
          type="text"
          placeholder="搜索字典名称或编码..."
          v-model="searchTerm"
          @input="handleSearch"
          class="w-full"
        />
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
      {{ error }}
    </div>

    <!-- 模块折叠面板列表 -->
    <div class="space-y-3">
      <div
        v-for="mod in DICTIONARY_MODULES"
        :key="mod.code"
        class="bg-white rounded-xl shadow-sm overflow-hidden"
      >
        <!-- 模块头部 -->
        <div
          class="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 cursor-pointer hover:from-indigo-100 hover:to-purple-100 transition-colors"
          @click="toggleModule(mod.code)"
        >
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-lg bg-white shadow-sm text-indigo-600">
              <el-icon :size="20">
                <component :is="getModuleIcon(mod.icon)" />
              </el-icon>
            </div>
            <el-icon :size="20" color="#9CA3AF">
              <ArrowDown v-if="expandedModules.has(mod.code)" />
              <ArrowRight v-else />
            </el-icon>
            <span class="text-lg font-semibold text-gray-900">{{ mod.name }}</span>
            <span class="px-2 py-0.5 bg-white text-indigo-600 text-xs rounded-full shadow-sm">
              {{ getCategoriesInModule(mod.code).length }} 分类 / {{ getTotalItemsInModule(mod.code) }} 项
            </span>
          </div>
        </div>

        <!-- 模块下的分类列表 -->
        <div v-if="expandedModules.has(mod.code)" class="border-t border-gray-100">
          <div class="p-4">
            <div class="grid grid-cols-2 gap-4">
              <div
                v-for="category in getCategoriesInModule(mod.code)"
                :key="category"
                class="border border-gray-100 rounded-lg overflow-hidden"
              >
                <!-- 分类头部 -->
                <div
                  class="flex items-center justify-between px-3 py-2 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                  @click="toggleCategory(category)"
                >
                  <div class="flex items-center gap-2">
                    <el-icon :size="16" color="#9CA3AF">
                      <ArrowDown v-if="expandedCategories.has(category)" />
                      <ArrowRight v-else />
                    </el-icon>
                    <span class="text-sm font-bold text-gray-700">{{ getCategoryChineseName(category) }}</span>
                    <span class="text-xs text-gray-400">({{ category }})</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-xs rounded-full">
                      {{ getDictionariesByCategory(category).length }}
                    </span>
                    <el-button
                      text
                      size="small"
                      @click.stop="handleAddItem(category)"
                      class="p-1 text-indigo-600 hover:bg-indigo-100 rounded transition-colors"
                      title="新增"
                    >
                      <el-icon><Plus /></el-icon>
                    </el-button>
                  </div>
                </div>

                <!-- 字典项列表 -->
                <div v-if="expandedCategories.has(category)" class="border-t border-gray-100">
                  <table v-if="getDictionariesByCategory(category).length > 0" class="table-fixed w-full text-xs">
                    <thead>
                      <tr class="bg-gradient-to-r from-blue-500 to-blue-600 text-left text-white">
                        <th class="py-1.5 pl-3 font-medium w-1/4">编码</th>
                        <th class="py-1.5 text-center font-medium w-1/4">名称</th>
                        <th class="py-1.5 text-center font-medium w-1/6">排序</th>
                        <th class="py-1.5 text-center font-medium w-1/6">状态</th>
                        <th class="py-1.5 pr-2 text-right font-medium w-1/6">操作</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-300 bg-white">
                      <tr
                        v-for="item in getDictionariesByCategory(category)"
                        :key="item.id"
                        class="hover:bg-blue-50 transition-colors"
                      >
                        <td class="py-1 pl-3">
                          <span class="font-mono text-gray-700">{{ item.code }}</span>
                        </td>
                        <td class="py-1 text-center">
                          <span class="text-gray-900 truncate block font-bold">{{ item.name }}</span>
                        </td>
                        <td class="py-1 text-center text-gray-500">
                          {{ item.sortNumber || 0 }}
                        </td>
                        <td class="py-1 text-center">
                          <span
                            :class="[
                              'px-1.5 py-0.5 text-xs rounded-full',
                              item.status === 'active'
                                ? 'bg-green-50 text-green-600'
                                : 'bg-gray-100 text-gray-500'
                            ]"
                          >
                            {{ item.status === 'active' ? '启用' : '停用' }}
                          </span>
                        </td>
                        <td class="py-1 pr-2 text-right">
                          <div class="flex items-center justify-end gap-0.5">
                            <el-button
                              text
                              size="small"
                              @click="handleEditItem(item)"
                              class="p-1 text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                              title="编辑"
                            >
                              <el-icon><Edit /></el-icon>
                            </el-button>
                            <el-button
                              text
                              size="small"
                              @click="handleDelete(item)"
                              class="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="删除"
                            >
                              <el-icon><Delete /></el-icon>
                            </el-button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div v-else class="px-3 py-4 text-center text-gray-400 text-xs">
                    暂无字典项
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center justify-between text-sm text-gray-500">
        <span>共 {{ DICTIONARY_MODULES.length }} 个模块，{{ categories.length }} 个分类，{{ dictionaries.length }} 个字典项</span>
      </div>
    </div>

    <!-- 新增/编辑字典项弹窗 -->
    <div v-if="isModalOpen && editingItem" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        <div class="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 class="text-lg font-semibold text-gray-900">
            {{ isNewItem && !editingItem.id ? '新增字典项' : '编辑字典项' }}
          </h3>
          <el-button text @click="isModalOpen = false" class="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <el-icon :size="20" color="#6B7280"><Close /></el-icon>
          </el-button>
        </div>

        <div class="p-4 space-y-4">
          <!-- 分类（只读） -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">分类</label>
            <el-input
              :value="`${getCategoryChineseName(editingItem.category)} (${editingItem.category})`"
              disabled
              class="w-full"
            />
          </div>

          <!-- 编码 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              编码 <span class="text-red-500">*</span>
            </label>
            <el-input
              v-model="editingItem.code"
              :disabled="!isNewItem || !!editingItem.id"
              placeholder="例如：active"
              class="w-full"
            />
          </div>

          <!-- 名称 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              名称 <span class="text-red-500">*</span>
            </label>
            <el-input
              v-model="editingItem.name"
              placeholder="例如：启用"
              class="w-full"
            />
          </div>

          <!-- 排序 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">排序</label>
            <el-input-number
              v-model="editingItem.sortNumber"
              :min="0"
              controls-position="right"
              class="w-full"
            />
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 p-4 border-t border-gray-100">
          <el-button @click="isModalOpen = false">取消</el-button>
          <el-button
            type="primary"
            @click="handleSave"
            :loading="loading"
            :disabled="!editingItem.code || !editingItem.name"
            class="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg text-sm font-medium flex items-center gap-1"
          >
            <el-icon><Check /></el-icon>
            保存
          </el-button>
        </div>
      </div>
    </div>

    <!-- 新增分类弹窗 -->
    <el-dialog
      v-model="showAddCategoryModal"
      title="新增字典分类"
      width="500px"
      :close-on-click-modal="false"
    >
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            分类编码 <span class="text-red-500">*</span>
          </label>
          <el-input
            v-model="newCategoryCode"
            placeholder="例如：custom_category"
            class="w-full"
          />
          <div class="text-xs text-gray-400 mt-1">建议使用英文下划线格式，如 custom_category</div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            分类名称 <span class="text-red-500">*</span>
          </label>
          <el-input
            v-model="newCategoryName"
            placeholder="例如：自定义分类"
            class="w-full"
          />
        </div>
      </div>
      <template #footer>
        <el-button @click="showAddCategoryModal = false">取消</el-button>
        <el-button
          type="primary"
          @click="handleSaveNewCategory"
          class="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg text-sm font-medium flex items-center gap-1"
        >
          <el-icon><Check /></el-icon>
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Notebook,
  Plus,
  Edit,
  Delete,
  ArrowLeft,
  Search,
  Refresh,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Check,
  Close,
  Avatar,
  Van,
  Grape,
  Sugar,
  Box,
  House,
  CircleCheck,
  List,
  Lock
} from '@element-plus/icons-vue'
import {
  getDictionaries,
  getDictionaryCategories,
  saveDictionaries,
  getCategoryChineseName,
  DICTIONARY_MODULES,
  getCategoriesByModule
} from '@/services/dictionaryService'

// 模块图标映射
const MODULE_ICON_COMPONENTS = {
  Users: Avatar,
  Truck: Van,
  Sprout: Grape,
  Flower2: Sugar,
  Warehouse: Box,
  Building: House,
  CheckCircle: CircleCheck,
  ClipboardList: List,
  Shield: Lock
}

const getModuleIcon = (iconName) => {
  return MODULE_ICON_COMPONENTS[iconName] || Notebook
}

// 数据状态
const dictionaries = ref([])
const categories = ref([])
const loading = ref(false)
const error = ref(null)
const searchTerm = ref('')

// 展开状态
const expandedModules = ref(new Set())
const expandedCategories = ref(new Set())

// 编辑状态
const editingItem = ref(null)
const isModalOpen = ref(false)
const isNewItem = ref(false)

// 新增分类弹窗状态
const showAddCategoryModal = ref(false)
const newCategoryCode = ref('')
const newCategoryName = ref('')

// 加载数据
const loadData = async () => {
  try {
    loading.value = true
    error.value = null
    const [dictData, catData] = await Promise.all([
      getDictionaries(),
      getDictionaryCategories()
    ])
    dictionaries.value = dictData
    categories.value = catData
    console.log('[DictionaryManagement] 加载数据完成:', dictData.length, '条字典,', catData.length, '个分类')
  } catch (err) {
    error.value = err instanceof Error ? err.message : '加载数据失败'
    console.error('[DictionaryManagement] 加载数据失败:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})

// 切换模块展开/折叠
const toggleModule = (moduleCode) => {
  const newExpanded = new Set(expandedModules.value)
  if (newExpanded.has(moduleCode)) {
    newExpanded.delete(moduleCode)
  } else {
    newExpanded.add(moduleCode)
  }
  expandedModules.value = newExpanded
}

// 切换分类展开/折叠
const toggleCategory = (category) => {
  const newExpanded = new Set(expandedCategories.value)
  if (newExpanded.has(category)) {
    newExpanded.delete(category)
  } else {
    newExpanded.add(category)
  }
  expandedCategories.value = newExpanded
}

// 展开所有
const expandAll = async () => {
  if (dictionaries.value.length === 0) {
    await loadData()
  }
  expandedModules.value = new Set(DICTIONARY_MODULES.map(m => m.code))
  expandedCategories.value = new Set(categories.value)
}

// 折叠所有
const collapseAll = () => {
  expandedModules.value = new Set()
  expandedCategories.value = new Set()
}

// 获取模块下的分类
const getCategoriesInModule = (moduleCode) => {
  const module = DICTIONARY_MODULES.find(m => m.code === moduleCode)
  if (!module) return []
  return categories.value.filter(c => module.categories.includes(c))
}

// 获取模块下的字典项总数
const getTotalItemsInModule = (moduleCode) => {
  const moduleCategories = getCategoriesInModule(moduleCode)
  return moduleCategories.reduce((sum, cat) => sum + getDictionariesByCategory(cat).length, 0)
}

// 按分类过滤字典项
const getDictionariesByCategory = (category) => {
  return dictionaries.value
    .filter(d => d.category === category)
    .sort((a, b) => (a.sortNumber || 0) - (b.sortNumber || 0))
}

// 打开新增字典项弹窗
const handleAddItem = (category) => {
  editingItem.value = reactive({
    category,
    code: '',
    name: '',
    sortNumber: 0
  })
  isNewItem.value = true
  isModalOpen.value = true
}

// 打开编辑字典项弹窗
const handleEditItem = (item) => {
  editingItem.value = reactive({ ...item })
  isNewItem.value = false
  isModalOpen.value = true
}

// 保存字典项
const handleSave = async () => {
  if (!editingItem.value) return
  if (!editingItem.value.name?.trim()) {
    ElMessage.error('请输入字典名称')
    return
  }
  if (!editingItem.value.code?.trim()) {
    ElMessage.error('请输入字典编码')
    return
  }
  try {
    loading.value = true
    await saveDictionaries({
      inserted: isNewItem.value && !editingItem.value.id ? [editingItem.value] : [],
      updated: editingItem.value.id ? [editingItem.value] : [],
      deleted: []
    })
    isModalOpen.value = false
    editingItem.value = null
    await loadData()
    // 触发全局刷新事件
    window.dispatchEvent(new CustomEvent('settings:refresh'))
  } catch (err) {
    ElMessage.error(err instanceof Error ? err.message : '保存失败')
  } finally {
    loading.value = false
  }
}

// 删除字典项
const handleDelete = async (item) => {
  try {
    await ElMessageBox.confirm(`确定要删除字典项"${item.name}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    loading.value = true
    await saveDictionaries({
      inserted: [],
      updated: [],
      deleted: [item.id]
    })
    await loadData()
    // 触发全局刷新事件
    window.dispatchEvent(new CustomEvent('settings:refresh'))
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error(err instanceof Error ? err.message : '删除失败')
    }
  } finally {
    loading.value = false
  }
}

// 保存新分类
const handleSaveNewCategory = () => {
  if (!newCategoryCode.value.trim() || !newCategoryName.value.trim()) {
    ElMessage.error('请填写完整的分类信息')
    return
  }
  editingItem.value = reactive({
    category: newCategoryCode.value.trim(),
    code: 'NEW',
    name: newCategoryName.value.trim(),
    sortNumber: 0
  })
  showAddCategoryModal.value = false
  isNewItem.value = true
  isModalOpen.value = true
}

// 搜索处理
const handleSearch = () => {
  // 搜索时自动展开匹配的模块
  if (searchTerm.value) {
    const searchLower = searchTerm.value.toLowerCase()
    const matchingModules = new Set()
    DICTIONARY_MODULES.forEach(mod => {
      const moduleCategories = getCategoriesInModule(mod.code)
      const hasMatch = moduleCategories.some(cat => {
        const catName = getCategoryChineseName(cat)
        if (catName.toLowerCase().includes(searchLower) || cat.toLowerCase().includes(searchLower)) return true
        const items = getDictionariesByCategory(cat)
        return items.some(d =>
          d.name.toLowerCase().includes(searchLower) ||
          d.code.toLowerCase().includes(searchLower)
        )
      })
      if (hasMatch) matchingModules.add(mod.code)
    })
    expandedModules.value = matchingModules
  }
}
</script>
