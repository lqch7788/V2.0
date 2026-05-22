<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="bg-white rounded-xl p-6 shadow-none">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center gap-3">
          <el-button text @click="router.push('/settings')">
            <el-icon :size="24"><ChevronLeft /></el-icon>
          </el-button>
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
            <el-icon :size="24" class="text-white"><Book /></el-icon>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">数据字典</h1>
            <p class="text-gray-500">管理系统数据字典配置</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <el-button @click="expandAll">
            <el-icon><Bottom /></el-icon>
            全部展开
          </el-button>
          <el-button @click="collapseAll">
            <el-icon><Top /></el-icon>
            全部折叠
          </el-button>
          <el-button @click="loadData">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
          <el-button type="primary" @click="openAddCategoryModal">
            <el-icon><Plus /></el-icon>
            新增分类
          </el-button>
        </div>
      </div>
    </div>

    <!-- 搜索栏 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <el-input
        v-model="searchTerm"
        placeholder="搜索字典名称或编码..."
        :prefix-icon="Search"
        clearable
        class="max-w-md"
      />
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
      {{ error }}
    </div>

    <!-- 加载状态 -->
    <div v-if="loading && dictionaries.length === 0" class="flex justify-center items-center py-12">
      <el-icon class="is-loading" :size="32"><Loading /></el-icon>
    </div>

    <!-- 模块折叠面板列表 -->
    <div v-else class="space-y-3">
      <el-collapse v-model="expandedModules" @change="onModuleExpandChange">
        <el-collapse-item
          v-for="mod in filteredModules"
          :key="mod.code"
          :name="mod.code"
        >
          <template #title>
            <div class="flex items-center gap-3 px-2">
              <div class="p-2 rounded-lg bg-white shadow-sm text-indigo-600">
                <el-icon :size="20">
                  <component :is="getModuleIcon(mod.icon)" />
                </el-icon>
              </div>
              <el-icon v-if="expandedModules.includes(mod.code)" class="text-gray-400"><Bottom /></el-icon>
              <el-icon v-else class="text-gray-400"><Right /></el-icon>
              <span class="text-lg font-semibold text-gray-900">{{ mod.name }}</span>
              <el-tag size="small" type="info">
                {{ getCategoriesInModule(mod.code).length }} 分类 / {{ getTotalItemsInModule(mod.code) }} 项
              </el-tag>
            </div>
          </template>

          <!-- 模块下的分类列表 -->
          <div class="p-4">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div
                v-for="category in getCategoriesInModule(mod.code)"
                :key="category"
                class="border border-gray-200 rounded-lg overflow-hidden"
              >
                <!-- 分类头部 -->
                <div
                  class="flex items-center justify-between px-3 py-2 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                  @click="toggleCategory(category)"
                >
                  <div class="flex items-center gap-2">
                    <el-icon v-if="expandedCategories.includes(category)" class="text-gray-400" :size="16"><Bottom /></el-icon>
                    <el-icon v-else class="text-gray-400" :size="16"><Right /></el-icon>
                    <span class="text-sm font-bold text-gray-700">{{ getCategoryChineseName(category) }}</span>
                    <span class="text-xs text-gray-400">({{ category }})</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <el-tag size="small" type="primary">
                      {{ getDictionariesByCategory(category).length }}
                    </el-tag>
                    <el-button
                      :icon="Plus"
                      size="small"
                      text
                      type="primary"
                      @click.stop="handleAddItem(category)"
                    />
                  </div>
                </div>

                <!-- 字典项列表 -->
                <div v-if="expandedCategories.includes(category)" class="border-t border-gray-100">
                  <el-table
                    v-if="getDictionariesByCategory(category).length > 0"
                    :data="getDictionariesByCategory(category)"
                    size="small"
                    class="dictionary-table"
                  >
                    <el-table-column prop="code" label="编码" width="120">
                      <template #default="{ row }">
                        <span class="font-mono text-gray-700 text-xs">{{ row.code }}</span>
                      </template>
                    </el-table-column>
                    <el-table-column prop="name" label="名称" min-width="120">
                      <template #default="{ row }">
                        <span class="text-gray-900 font-bold text-xs truncate block">{{ row.name }}</span>
                      </template>
                    </el-table-column>
                    <el-table-column prop="sortNumber" label="排序" width="80" align="center">
                      <template #default="{ row }">
                        <span class="text-gray-500 text-xs">{{ row.sortNumber || 0 }}</span>
                      </template>
                    </el-table-column>
                    <el-table-column prop="status" label="状态" width="80" align="center">
                      <template #default="{ row }">
                        <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
                          {{ row.status === 'active' ? '启用' : '停用' }}
                        </el-tag>
                      </template>
                    </el-table-column>
                    <el-table-column label="操作" width="100" align="right">
                      <template #default="{ row }">
                        <el-button
                          :icon="Edit"
                          size="small"
                          text
                          type="primary"
                          @click="handleEditItem(row)"
                        />
                        <el-button
                          :icon="Delete"
                          size="small"
                          text
                          type="danger"
                          @click="handleDelete(row)"
                        />
                      </template>
                    </el-table-column>
                  </el-table>
                  <div v-else class="px-3 py-4 text-center text-gray-400 text-xs">
                    暂无字典项
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>

    <!-- 统计信息 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center justify-between text-sm text-gray-500">
        <span>共 {{ DICTIONARY_MODULES.length }} 个模块，{{ categories.length }} 个分类，{{ dictionaries.length }} 个字典项</span>
      </div>
    </div>

    <!-- 新增/编辑字典项弹窗 -->
    <el-dialog
      v-model="isModalOpen"
      :title="isNewItem && !editingItem?.id ? '新增字典项' : '编辑字典项'"
      width="500px"
      @close="closeModal"
    >
      <el-form v-if="editingItem" :model="editingItem" label-width="80px" class="space-y-4">
        <!-- 分类（只读） -->
        <el-form-item label="分类">
          <el-input
            :model-value="`${getCategoryChineseName(editingItem.category)} (${editingItem.category})`"
            disabled
          />
        </el-form-item>

        <!-- 编码 -->
        <el-form-item label="编码" required>
          <el-input
            v-model="editingItem.code"
            placeholder="例如：active"
            :disabled="!isNewItem || !!editingItem.id"
          />
        </el-form-item>

        <!-- 名称 -->
        <el-form-item label="名称" required>
          <el-input
            v-model="editingItem.name"
            placeholder="例如：启用"
          />
        </el-form-item>

        <!-- 排序 -->
        <el-form-item label="排序">
          <el-input-number
            v-model="editingItem.sortNumber"
            :min="0"
            :max="9999"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="closeModal">取消</el-button>
        <el-button
          type="primary"
          :loading="saving"
          :disabled="!editingItem?.code || !editingItem?.name"
          @click="handleSave"
        >
          <el-icon v-if="!saving"><Check /></el-icon>
          保存
        </el-button>
      </template>
    </el-dialog>

    <!-- 新增分类弹窗 -->
    <el-dialog
      v-model="showAddCategoryModal"
      title="新增字典分类"
      width="500px"
      @close="closeCategoryModal"
    >
      <el-form :model="newCategoryForm" label-width="100px" class="space-y-4">
        <el-form-item label="分类编码" required>
          <el-input
            v-model="newCategoryForm.code"
            placeholder="例如：custom_category"
          />
          <div class="text-xs text-gray-400 mt-1">建议使用英文下划线格式，如 custom_category</div>
        </el-form-item>

        <el-form-item label="分类名称" required>
          <el-input
            v-model="newCategoryForm.name"
            placeholder="例如：自定义分类"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="closeCategoryModal">取消</el-button>
        <el-button type="primary" @click="handleSaveNewCategory">
          <el-icon><Check /></el-icon>
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
/**
 * 数据字典管理页面
 * V5.0 按模块分组展示分类和字典项
 * 从V1.1的React版本迁移到Vue3
 */
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Book,
  Plus,
  Edit,
  Delete,
  ChevronLeft,
  Bottom,
  Top,
  Right,
  Search,
  Refresh,
  Check,
  Loading,
  Users,
  Truck,
  Sprout,
  Flower2,
  Warehouse,
  OfficeBuilding,
  CircleCheck,
  List,
  Shield,
} from '@element-plus/icons-vue'
import {
  Dictionary,
  getDictionaries,
  getDictionaryCategories,
  saveDictionaries,
  getCategoryChineseName,
  DICTIONARY_MODULES,
  DictionaryModule,
} from '@/services/dictionaryService'

const router = useRouter()

// 数据状态
const dictionaries = ref<Dictionary[]>([])
const categories = ref<string[]>([])
const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)
const searchTerm = ref('')

// 展开状态
const expandedModules = ref<string[]>([])
const expandedCategories = ref<string[]>([])

// 弹窗状态
const isModalOpen = ref(false)
const editingItem = ref<Dictionary | null>(null)
const isNewItem = ref(false)

// 新增分类弹窗状态
const showAddCategoryModal = ref(false)
const newCategoryForm = ref({
  code: '',
  name: '',
})

// 模块图标映射
const MODULE_ICONS: Record<string, unknown> = {
  Users,
  Truck,
  Sprout,
  Flower2,
  Warehouse,
  OfficeBuilding,
  CircleCheck,
  List,
  Shield,
}

// 获取模块图标组件
function getModuleIcon(iconName: string) {
  return MODULE_ICONS[iconName] || List
}

// 加载数据
async function loadData() {
  try {
    loading.value = true
    error.value = null
    const [dictData, catData] = await Promise.all([
      getDictionaries(),
      getDictionaryCategories(),
    ])
    dictionaries.value = dictData
    categories.value = catData
  } catch (err) {
    error.value = err instanceof Error ? err.message : '加载数据失败'
    ElMessage.error(error.value)
  } finally {
    loading.value = false
  }
}

// 模块展开/折叠变化处理
function onModuleExpandChange(activeNames: string | string[]) {
  // 当模块展开时，自动展开其第一个分类
  if (Array.isArray(activeNames)) {
    activeNames.forEach((moduleCode) => {
      const moduleCategories = getCategoriesInModule(moduleCode)
      moduleCategories.forEach((cat) => {
        if (!expandedCategories.value.includes(cat)) {
          expandedCategories.value.push(cat)
        }
      })
    })
  }
}

// 切换分类展开/折叠
function toggleCategory(category: string) {
  const index = expandedCategories.value.indexOf(category)
  if (index > -1) {
    expandedCategories.value.splice(index, 1)
  } else {
    expandedCategories.value.push(category)
  }
}

// 展开所有
async function expandAll() {
  if (dictionaries.value.length === 0) {
    await loadData()
  }
  expandedModules.value = DICTIONARY_MODULES.map((m) => m.code)
  // 展开所有分类
  const allCategories: string[] = []
  DICTIONARY_MODULES.forEach((mod) => {
    mod.categories.forEach((cat) => {
      if (categories.value.includes(cat) && !allCategories.includes(cat)) {
        allCategories.push(cat)
      }
    })
  })
  expandedCategories.value = allCategories
}

// 折叠所有
function collapseAll() {
  expandedModules.value = []
  expandedCategories.value = []
}

// 获取模块下的分类
function getCategoriesInModule(moduleCode: string): string[] {
  const module = DICTIONARY_MODULES.find((m) => m.code === moduleCode)
  if (!module) return []
  return categories.value.filter((c) => module.categories.includes(c))
}

// 获取模块下的字典项总数
function getTotalItemsInModule(moduleCode: string): number {
  const moduleCategories = getCategoriesInModule(moduleCode)
  return moduleCategories.reduce((sum, cat) => sum + getDictionariesByCategory(cat).length, 0)
}

// 按分类过滤字典项
function getDictionariesByCategory(category: string): Dictionary[] {
  let items = dictionaries.value.filter((d) => d.category === category)

  // 如果有搜索词，则过滤
  if (searchTerm.value) {
    const searchLower = searchTerm.value.toLowerCase()
    items = items.filter(
      (d) =>
        d.name.toLowerCase().includes(searchLower) ||
        d.code.toLowerCase().includes(searchLower)
    )
  }

  return items.sort((a, b) => (a.sortNumber || 0) - (b.sortNumber || 0))
}

// 过滤后的模块列表（根据搜索词）
const filteredModules = computed(() => {
  if (!searchTerm.value) {
    return DICTIONARY_MODULES
  }

  const searchLower = searchTerm.value.toLowerCase()
  return DICTIONARY_MODULES.filter((mod) => {
    // 检查模块名称
    if (mod.name.toLowerCase().includes(searchLower)) return true

    // 检查模块下的分类
    const moduleCategories = getCategoriesInModule(mod.code)
    return moduleCategories.some((cat) => {
      // 检查分类名称
      const catName = getCategoryChineseName(cat)
      if (catName.toLowerCase().includes(searchLower) || cat.toLowerCase().includes(searchLower)) {
        return true
      }
      // 检查分类下的字典项
      const items = getDictionariesByCategory(cat)
      return items.some(
        (d) =>
          d.name.toLowerCase().includes(searchLower) ||
          d.code.toLowerCase().includes(searchLower)
      )
    })
  })
})

// 打开新增字典项弹窗
function handleAddItem(category: string) {
  editingItem.value = {
    category,
    code: '',
    name: '',
    sortNumber: 0,
  }
  isNewItem.value = true
  isModalOpen.value = true
}

// 打开编辑字典项弹窗
function handleEditItem(item: Dictionary) {
  editingItem.value = { ...item }
  isNewItem.value = false
  isModalOpen.value = true
}

// 关闭弹窗
function closeModal() {
  isModalOpen.value = false
  editingItem.value = null
}

// 保存字典项
async function handleSave() {
  if (!editingItem.value) return
  if (!editingItem.value.name?.trim()) {
    ElMessage.warning('请输入字典名称')
    return
  }
  if (!editingItem.value.code?.trim()) {
    ElMessage.warning('请输入字典编码')
    return
  }

  try {
    saving.value = true
    await saveDictionaries({
      inserted: isNewItem.value && !editingItem.value.id ? [editingItem.value] : [],
      updated: editingItem.value.id ? [editingItem.value] : [],
      deleted: [],
    })
    ElMessage.success('保存成功')
    closeModal()
    await loadData()
    // 触发全局刷新事件，通知其他使用字典的组件更新数据
    window.dispatchEvent(new CustomEvent('settings:refresh'))
  } catch (err) {
    ElMessage.error(err instanceof Error ? err.message : '保存失败')
  } finally {
    saving.value = false
  }
}

// 删除字典项
async function handleDelete(item: Dictionary) {
  try {
    await ElMessageBox.confirm(`确定要删除字典项"${item.name}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    loading.value = true
    await saveDictionaries({
      inserted: [],
      updated: [],
      deleted: [item.id!],
    })
    ElMessage.success('删除成功')
    await loadData()
    // 触发全局刷新事件，通知其他使用字典的组件更新数据
    window.dispatchEvent(new CustomEvent('settings:refresh'))
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error(err instanceof Error ? err.message : '删除失败')
    }
  } finally {
    loading.value = false
  }
}

// 打开新增分类弹窗
function openAddCategoryModal() {
  newCategoryForm.value = { code: '', name: '' }
  showAddCategoryModal.value = true
}

// 关闭新增分类弹窗
function closeCategoryModal() {
  showAddCategoryModal.value = false
  newCategoryForm.value = { code: '', name: '' }
}

// 保存新分类
function handleSaveNewCategory() {
  if (!newCategoryForm.value.code.trim() || !newCategoryForm.value.name.trim()) {
    ElMessage.warning('请填写完整的分类信息')
    return
  }

  editingItem.value = {
    category: newCategoryForm.value.code.trim(),
    code: 'NEW',
    name: newCategoryForm.value.name.trim(),
    sortNumber: 0,
  }
  closeCategoryModal()
  isNewItem.value = true
  isModalOpen.value = true
}

// 初始化
onMounted(() => {
  loadData()
})
</script>

<style scoped>
/* 字典表格样式 */
.dictionary-table {
  font-size: 12px;
}

.dictionary-table :deep(.el-table__header th) {
  background: linear-gradient(to right, #3b82f6, #6366f1);
  color: white;
  font-weight: 500;
}

.dictionary-table :deep(.el-table__row:hover) {
  background-color: #eff6ff;
}
</style>
