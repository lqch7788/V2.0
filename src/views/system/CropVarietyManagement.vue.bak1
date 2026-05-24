<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="bg-white rounded-xl p-6 shadow-none">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <!-- 左侧标题 -->
        <div class="flex items-center gap-3">
          <a
            href="/settings"
            class="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center hover:from-gray-200 hover:to-gray-300 transition-colors"
            title="返回系统设置"
          >
            <el-icon :size="20"><ArrowLeft /></el-icon>
          </a>
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
            <el-icon :size="24" color="white"><Sugar /></el-icon>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">作物品种库管理</h1>
            <p class="text-gray-500">统一管理系统中所有作物品种的编码和分类信息</p>
          </div>
        </div>

        <!-- 右侧统计卡片 -->
        <div class="flex items-center gap-3">
          <div class="bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg px-3 py-2 text-white">
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
                <el-icon :size="12"><Sugar /></el-icon>
              </div>
              <div>
                <p class="text-base font-bold">{{ stats.total }}</p>
                <p class="text-xs text-white/80">品种总数</p>
              </div>
            </div>
          </div>
          <div class="bg-white rounded-lg px-3 py-2 border border-gray-100">
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 rounded-lg bg-green-50 flex items-center justify-center">
                <span class="text-green-600 text-xs">✓</span>
              </div>
              <div>
                <p class="text-base font-bold text-gray-900">{{ stats.active }}</p>
                <p class="text-xs text-gray-500">启用中</p>
              </div>
            </div>
          </div>
          <div class="bg-white rounded-lg px-3 py-2 border border-gray-100">
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 rounded-lg bg-gray-50 flex items-center justify-center">
                <span class="text-gray-600 text-xs">○</span>
              </div>
              <div>
                <p class="text-base font-bold text-gray-900">{{ stats.inactive }}</p>
                <p class="text-xs text-gray-500">已停用</p>
              </div>
            </div>
          </div>
          <div class="bg-white rounded-lg px-3 py-2 border border-gray-100">
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center">
                <span class="text-blue-600 text-xs">类</span>
              </div>
              <div>
                <p class="text-base font-bold text-gray-900">{{ categoryCount }}</p>
                <p class="text-xs text-gray-500">作物类别</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 编码规则和作物编码生成工具栏 -->
    <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div class="flex items-center justify-between">
        <!-- 左侧工具栏 -->
        <div class="flex items-center gap-4">
          <el-button size="small" @click="goToCodeRule">
            编码规则 >>
          </el-button>
          <span class="text-sm font-bold text-gray-900">作物编码生成</span>
          <el-button
            :icon="codeGenExpanded ? 'ArrowUp' : 'ArrowRight'"
            :icon-position="right"
            text
            @click="codeGenExpanded = !codeGenExpanded"
          >
            {{ codeGenExpanded ? '收起' : '展开' }}
          </el-button>
        </div>
      </div>

      <!-- 作物编码生成器展开内容 -->
      <div v-if="codeGenExpanded" class="mt-4 pt-4 border-t border-gray-100">
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
          <!-- 类别 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">类别</label>
            <el-select
              v-model="codeGenCategory"
              placeholder="请选择"
              class="w-full"
              @change="handleCodeGenCategoryChange"
            >
              <el-option
                v-for="c in categoryOptions"
                :key="c.value"
                :label="c.label"
                :value="c.value"
              />
            </el-select>
          </div>

          <!-- 类型 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">类型</label>
            <el-select
              v-model="codeGenType"
              placeholder="请选择"
              class="w-full"
              :disabled="!codeGenCategory"
              @change="handleCodeGenTypeChange"
            >
              <el-option
                v-for="t in typeOptions"
                :key="t.value"
                :label="t.label"
                :value="t.value"
              />
            </el-select>
          </div>

          <!-- 品种 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">品种</label>
            <el-select
              v-model="codeGenVariety"
              placeholder="请选择"
              class="w-full"
              :disabled="!codeGenType"
              @change="handleCodeGenVarietyChange"
            >
              <el-option
                v-for="v in varietyOptions"
                :key="v.value"
                :label="v.label"
                :value="v.value"
              />
            </el-select>
          </div>

          <!-- 子品种 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">子品种</label>
            <el-select
              v-model="codeGenSubVariety1"
              placeholder="请选择"
              class="w-full"
              :disabled="!codeGenVariety || subVariety1Options.length === 0"
              @change="handleCodeGenSubVariety1Change"
            >
              <el-option
                v-for="s in subVariety1Options"
                :key="s.value"
                :label="s.label"
                :value="s.value"
              />
            </el-select>
          </div>

          <!-- 详细品种名称 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">详细品种名称</label>
            <el-input
              v-model="detailVarietyName"
              placeholder="输入详细品种名称"
              @input="handleDetailVarietyNameChange"
            />
          </div>

          <!-- 详细品种序号和生成结果 -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">详细品种序号</label>
            <div class="flex gap-2">
              <el-input
                v-model="detailVarietyCode"
                readonly
                placeholder="自动分配"
                class="w-20"
              />
              <el-input
                v-model="generatedCode"
                readonly
                placeholder="生成结果"
                class="flex-1"
              />
              <el-button
                type="primary"
                :disabled="!codeGenVariety"
                @click="handleGenerateCode"
              >
                <el-icon><RefreshRight /></el-icon>
                生成
              </el-button>
              <el-button
                type="primary"
                :disabled="!generatedCode"
                @click="handleCopyCode"
              >
                <el-icon v-if="!copySuccess"><CopyDocument /></el-icon>
                <el-icon v-else><Check /></el-icon>
                {{ copySuccess ? '已复制' : '复制' }}
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 品种列表 -->
    <div class="flex-1 min-h-0 flex flex-col">
      <!-- 搜索和操作栏 -->
      <div class="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col flex-1">
        <div class="p-4 border-b border-gray-100">
          <div class="flex items-center gap-4 mb-4">
            <!-- 视图切换 -->
            <div class="flex items-center gap-2 flex-shrink-0">
              <span class="text-sm text-gray-600 font-medium">视图：</span>
              <el-button
                :type="viewMode === 'table' ? 'primary' : 'default'"
                size="small"
                @click="viewMode = 'table'"
              >
                <el-icon><List /></el-icon>
                表格
              </el-button>
              <el-button
                :type="viewMode === 'tree' ? 'primary' : 'default'"
                size="small"
                @click="viewMode = 'tree'"
              >
                <el-icon><Link /></el-icon>
                树形
              </el-button>
            </div>

            <!-- 搜索框区域 -->
            <div class="flex-1 flex items-center gap-4">
              <el-select
                v-model="categoryFilter"
                placeholder="全部类别"
                clearable
                class="flex-1"
                @change="handleSearch"
              >
                <el-option
                  v-for="opt in categoryOptions"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
              <el-input
                v-model="searchNameKeyword"
                placeholder="作物品种搜索..."
                clearable
                class="flex-1"
                @input="handleSearch"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
              <el-input
                v-model="searchCodeKeyword"
                placeholder="作物编码搜索..."
                clearable
                class="flex-1"
                @input="handleSearch"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </div>

            <el-button type="primary" size="small" @click="openAddModal">
              <el-icon><Plus /></el-icon>
              新增作物
            </el-button>
          </div>
        </div>

        <!-- 表格内容 - 表格视图 -->
        <div v-show="viewMode === 'table'" class="px-6 py-4 border-b border-gray-100 bg-white">
          <h3 class="text-lg font-semibold text-gray-900">作物编码列表</h3>
        </div>
        <div v-show="viewMode === 'table'" class="flex-1 overflow-auto">
          <el-table
            :data="paginatedData"
            stripe
            class="w-full"
            @row-click="handleSelect"
          >
            <el-table-column prop="cropCode" label="编码" width="144">
              <template #default="{ row }">
                <span class="font-mono text-blue-600">{{ row.cropCode }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="varietyPath" label="品种路径" width="256">
              <template #default="{ row }">
                <span class="text-gray-400">{{ row.categoryName }}</span>
                <span class="text-gray-400 mx-0.5">-</span>
                <span class="text-gray-400">{{ row.typeName }}</span>
                <span class="text-gray-400 mx-0.5">-</span>
                <span class="text-gray-700">{{ row.varietyName }}</span>
                <template v-if="row.subVariety1Name">
                  <span class="text-gray-400 mx-0.5">-</span>
                  <span class="text-gray-700">{{ row.subVariety1Name }}</span>
                </template>
              </template>
            </el-table-column>
            <el-table-column prop="varietyName" label="作物品种" width="128">
              <template #default="{ row }">
                {{ row.detailVarietyName || row.subVariety1Name || row.varietyName }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-tag
                  :type="row.status === 'active' ? 'success' : 'info'"
                  size="small"
                >
                  {{ row.status === 'active' ? '启用' : '停用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="144">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click.stop="handleViewDetail(row)">
                  详情
                </el-button>
                <el-button link type="primary" size="small" @click.stop="handleEdit(row)">
                  编辑
                </el-button>
                <el-button link type="danger" size="small" @click.stop="handleDelete(row)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 树形视图 -->
        <div v-show="viewMode === 'tree'" class="flex-1 overflow-auto p-4">
          <el-tree
            v-if="treeData.length > 0"
            :data="treeData"
            :props="treeProps"
            node-key="id"
            default-expand-all
            @node-click="handleTreeNodeClick"
          >
            <template #default="{ node, data }">
              <span class="flex items-center gap-2">
                <span class="font-mono text-blue-600 text-sm">{{ data.cropCode || '' }}</span>
                <span class="text-gray-900">{{ node.label }}</span>
                <el-tag
                  v-if="data.status"
                  :type="data.status === 'active' ? 'success' : 'info'"
                  size="small"
                  class="ml-2"
                >
                  {{ data.status === 'active' ? '启用' : '停用' }}
                </el-tag>
              </span>
            </template>
          </el-tree>
          <div v-else class="text-center text-gray-400 py-12">
            暂无数据
          </div>
        </div>

        <!-- 分页 -->
        <div class="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
          <div class="text-sm text-gray-500">
            共 {{ filteredData.length }} 条记录
          </div>
          <el-pagination
            v-model:current-page="currentPage"
            :page-size="pageSize"
            :total="filteredData.length"
            layout="prev, pager, next"
            background
          />
        </div>
      </div>
    </div>

    <!-- 新增弹窗 -->
    <AddCropVarietyModal
      v-model="isAddModalOpen"
      :prefill-data="prefillAddData"
      @success="handleAddSuccess"
    />

    <!-- 编辑弹窗 -->
    <EditCropVarietyModal
      v-model="isEditModalOpen"
      :variety="selectedVariety"
      @success="handleEditSuccess"
    />

    <!-- 详情弹窗 -->
    <el-dialog
      v-model="isDetailModalOpen"
      title="品种详情"
      width="900px"
    >
      <CropVarietyDetail
        v-if="selectedVariety"
        :variety="selectedVariety"
        @edit="handleEdit"
      />
    </el-dialog>

    <!-- 删除确认弹窗 -->
    <el-dialog
      v-model="deleteConfirmVisible"
      title="确认删除"
      width="500px"
    >
      <div class="space-y-4">
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <p class="text-red-700 font-medium mb-2">警告：删除操作不可逆！</p>
          <p class="text-red-600 text-sm">
            删除编码 <span class="font-mono font-bold">{{ deleteTargetVariety?.cropCode }}</span> 可能导致以下问题：
          </p>
          <ul class="text-red-600 text-sm mt-2 list-disc list-inside space-y-1">
            <li>之前引用此编码的订单、种植记录等将无法识别该品种</li>
            <li>历史数据中显示的品种信息可能显示异常</li>
            <li>相关的统计报表数据可能出现偏差</li>
          </ul>
          <p class="text-red-600 text-sm mt-3">
            请确认此编码未被任何业务数据使用后再删除。
          </p>
        </div>
        <div class="bg-gray-50 rounded-lg p-3">
          <p class="text-gray-600 text-sm">
            要删除的品种：<span class="font-medium">
              {{ deleteTargetVariety?.detailVarietyName || deleteTargetVariety?.subVariety1Name || deleteTargetVariety?.varietyName }}
            </span>
          </p>
        </div>
      </div>
      <template #footer>
        <el-button @click="deleteConfirmVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmDelete">确认删除</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft,
  Sugar,
  List,
  Link,
  Search,
  Plus,
  RefreshRight,
  CopyDocument,
  Check
} from '@element-plus/icons-vue'
import AddCropVarietyModal from './components/AddCropVarietyModal.vue'
import EditCropVarietyModal from './components/EditCropVarietyModal.vue'
import CropVarietyDetail from './components/CropVarietyDetail.vue'
import { useCropVarietyStore } from '@/stores'
import {
  getCategoryOptions,
  getTypeOptionsByCategory,
  getVarietyOptionsByType,
  getSubVariety1Options,
  generateCropCode as generateCode,
  getMaxDetailVarietyCode
} from '@/services/cropVarietyService'

const router = useRouter()
const store = useCropVarietyStore()

// 视图模式
const viewMode = ref('table')

// 统计数据
const stats = reactive({
  total: 0,
  active: 0,
  inactive: 0,
  byCategory: {}
})

const categoryCount = computed(() => Object.keys(stats.byCategory).length)

// 搜索和筛选
const searchNameKeyword = ref('')
const searchCodeKeyword = ref('')
const categoryFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(20)

// 编码生成器状态
const codeGenExpanded = ref(false)
const codeGenCategory = ref('')
const codeGenType = ref('')
const codeGenVariety = ref('')
const codeGenSubVariety1 = ref('')
const detailVarietyName = ref('')
const detailVarietyCode = ref('')
const generatedCode = ref('')
const copySuccess = ref(false)

// 编码生成器选项
const categoryOptions = ref([])
const typeOptions = ref([])
const varietyOptions = ref([])
const subVariety1Options = ref([])

// 弹窗状态
const isAddModalOpen = ref(false)
const isEditModalOpen = ref(false)
const isDetailModalOpen = ref(false)
const deleteConfirmVisible = ref(false)
const selectedVariety = ref(null)
const deleteTargetVariety = ref(null)
const prefillAddData = ref(undefined)

// 过滤后的品种
const filteredData = computed(() => {
  let result = store.items

  // 类别筛选
  if (categoryFilter.value) {
    result = result.filter(v => v.categoryCode === categoryFilter.value)
  }

  // 编码搜索
  if (searchCodeKeyword.value.trim()) {
    const keyword = searchCodeKeyword.value.toLowerCase()
    result = result.filter(v => v.cropCode.toLowerCase().includes(keyword))
  }

  // 名称搜索
  if (searchNameKeyword.value.trim()) {
    const keyword = searchNameKeyword.value.toLowerCase()
    result = result.filter(v => {
      if (v.varietyName?.toLowerCase().includes(keyword)) return true
      if (v.subVariety1Name?.toLowerCase().includes(keyword)) return true
      if (v.categoryName?.toLowerCase().includes(keyword)) return true
      if (v.typeName?.toLowerCase().includes(keyword)) return true
      return false
    })
  }

  return result
})

// 分页数据
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredData.value.slice(start, end)
})

// 树形视图配置
const treeProps = {
  children: 'children',
  label: 'label'
}

// 将平铺数据转换为树形结构
const treeData = computed(() => {
  const tree = []
  const categoryMap = new Map()

  for (const item of filteredData.value) {
    // 类别层级
    if (!categoryMap.has(item.categoryName)) {
      const categoryNode = {
        id: `cat_${item.categoryName}`,
        label: item.categoryName,
        children: []
      }
      categoryMap.set(item.categoryName, categoryNode)
      tree.push(categoryNode)
    }

    const categoryNode = categoryMap.get(item.categoryName)

    // 类型层级
    const typeKey = `${item.categoryName}_${item.typeName}`
    let typeNode = categoryNode.children.find(n => n.id === `type_${typeKey}`)
    if (!typeNode) {
      typeNode = {
        id: `type_${typeKey}`,
        label: item.typeName,
        children: []
      }
      categoryNode.children.push(typeNode)
    }

    // 品种层级
    const varietyKey = `${typeKey}_${item.varietyName}`
    let varietyNode = typeNode.children.find(n => n.id === `var_${varietyKey}`)
    if (!varietyNode) {
      varietyNode = {
        id: `var_${varietyKey}`,
        label: item.varietyName,
        children: []
      }
      typeNode.children.push(varietyNode)
    }

    // 子品种层级（可选）
    if (item.subVariety1Name) {
      const subKey = `${varietyKey}_${item.subVariety1Name}`
      let subNode = varietyNode.children.find(n => n.id === `sub_${subKey}`)
      if (!subNode) {
        subNode = {
          id: `sub_${subKey}`,
          label: item.subVariety1Name,
          children: []
        }
        varietyNode.children.push(subNode)
      }

      // 详细品种（叶子节点）
      const leafNode = {
        id: item.id || item.cropCode,
        label: item.detailVarietyName || item.subVariety1Name,
        cropCode: item.cropCode,
        status: item.status,
        ...item
      }
      subNode.children.push(leafNode)
    } else {
      // 没有子品种时，品种就是叶子节点
      const leafNode = {
        id: item.id || item.cropCode,
        label: item.detailVarietyName || item.varietyName,
        cropCode: item.cropCode,
        status: item.status,
        ...item
      }
      varietyNode.children.push(leafNode)
    }
  }

  return tree
})

// 树形节点点击处理
function handleTreeNodeClick(data) {
  // 如果是叶子节点（包含完整数据），打开详情
  if (data.id && (data.cropCode || data.status)) {
    selectedVariety.value = data
    isDetailModalOpen.value = true
  }
}

// 初始化
onMounted(async () => {
  await store.loadItems()
  updateStats()

  // 加载编码生成器选项
  categoryOptions.value = getCategoryOptions()
})

// 更新统计信息
function updateStats() {
  stats.total = store.items.length
  stats.active = store.items.filter(v => v.status === 'active').length
  stats.inactive = store.items.filter(v => v.status === 'inactive').length

  const byCategory = {}
  for (const v of store.items) {
    if (!byCategory[v.categoryName]) {
      byCategory[v.categoryName] = 0
    }
    byCategory[v.categoryName]++
  }
  stats.byCategory = byCategory
}

// 搜索处理
function handleSearch() {
  currentPage.value = 1
}

// 跳转到编码规则页面
function goToCodeRule() {
  router.push('/produce-code-rule')
}

// 编码生成器 - 类别变化
function handleCodeGenCategoryChange() {
  typeOptions.value = codeGenCategory.value
    ? getTypeOptionsByCategory(codeGenCategory.value)
    : []
  codeGenType.value = ''
  codeGenVariety.value = ''
  codeGenSubVariety1.value = ''
  generatedCode.value = ''
}

// 编码生成器 - 类型变化
function handleCodeGenTypeChange() {
  varietyOptions.value = codeGenCategory.value && codeGenType.value
    ? getVarietyOptionsByType(codeGenCategory.value, codeGenType.value)
    : []
  codeGenVariety.value = ''
  codeGenSubVariety1.value = ''
  generatedCode.value = ''
}

// 编码生成器 - 品种变化
function handleCodeGenVarietyChange() {
  subVariety1Options.value = codeGenCategory.value && codeGenType.value && codeGenVariety.value
    ? getSubVariety1Options(codeGenCategory.value, codeGenType.value, codeGenVariety.value)
    : []
  codeGenSubVariety1.value = ''
  generatedCode.value = ''
}

// 编码生成器 - 子品种变化
function handleCodeGenSubVariety1Change() {
  if (codeGenCategory.value && codeGenType.value && codeGenVariety.value && codeGenSubVariety1.value) {
    detailVarietyCode.value = getMaxDetailVarietyCode(
      codeGenCategory.value,
      codeGenType.value,
      codeGenVariety.value,
      codeGenSubVariety1.value
    )
  } else {
    detailVarietyCode.value = ''
  }
  generatedCode.value = ''
}

// 编码生成器 - 详细品种名称变化
function handleDetailVarietyNameChange() {
  // 名称变化时自动重新生成编码
  if (codeGenCategory.value && codeGenType.value && codeGenVariety.value) {
    handleGenerateCode()
  }
}

// 生成编码
function handleGenerateCode() {
  if (codeGenCategory.value && codeGenType.value && codeGenVariety.value) {
    const sub1Code = codeGenSubVariety1.value || '000'
    const detailCode = detailVarietyCode.value || '00'
    generatedCode.value = generateCode(
      codeGenCategory.value,
      codeGenType.value,
      codeGenVariety.value,
      sub1Code,
      detailCode
    )
  }
}

// 复制编码
async function handleCopyCode() {
  if (generatedCode.value) {
    try {
      await navigator.clipboard.writeText(generatedCode.value)
      copySuccess.value = true
      setTimeout(() => {
        copySuccess.value = false
      }, 2000)
    } catch (error) {
      ElMessage.error('复制编码失败')
    }
  }
}

// 选择品种（查看详情）
function handleSelect(row) {
  selectedVariety.value = row
  isDetailModalOpen.value = true
}

// 查看详情
function handleViewDetail(row) {
  selectedVariety.value = row
  isDetailModalOpen.value = true
}

// 打开新增弹窗
function openAddModal() {
  prefillAddData.value = undefined
  isAddModalOpen.value = true
}

// 新增成功
function handleAddSuccess() {
  store.refreshItems()
  updateStats()
  ElMessage.success('新增成功')
}

// 编辑品种
function handleEdit(row) {
  selectedVariety.value = row
  isDetailModalOpen.value = false
  isEditModalOpen.value = true
}

// 编辑成功
function handleEditSuccess() {
  store.refreshItems()
  updateStats()
  selectedVariety.value = null
  ElMessage.success('编辑成功')
}

// 删除品种
function handleDelete(row) {
  deleteTargetVariety.value = row
  deleteConfirmVisible.value = true
}

// 确认删除
async function confirmDelete() {
  if (deleteTargetVariety.value) {
    try {
      await store.deleteItem(deleteTargetVariety.value.id)
      updateStats()
      if (selectedVariety.value?.id === deleteTargetVariety.value.id) {
        selectedVariety.value = null
      }
      deleteConfirmVisible.value = false
      ElMessage.success('删除成功')
    } catch (error) {
      ElMessage.error('删除失败，请重试')
    }
  }
}
</script>
