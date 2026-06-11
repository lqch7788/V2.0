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
            <el-icon :size="24" color="white"><Basketball /></el-icon>
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
              <div class="w-6 h-6 rounded-lg bg-green-100 flex items-center justify-center">
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
    <div class="bg-white rounded-xl p-4 shadow-none border border-gray-100">
      <div class="flex items-center justify-between">
        <!-- 左侧工具栏 -->
        <div class="flex items-center gap-4">
          <el-button size="small" @click="goToCodeRule">
            编码规则 >>
          </el-button>
          <span class="text-sm font-bold text-gray-900">作物编码生成</span>
          <el-button
            :icon="codeGenExpanded ? 'ArrowUp' : 'ArrowRight'"
            :icon-position="'right'"
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
      <div class="bg-white rounded-xl shadow-none overflow-hidden flex flex-col flex-1">
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

            <!-- 新增作物 -->
            <el-button type="primary" size="small" @click="openAddModal">
              <el-icon><Plus /></el-icon>
              新增作物
            </el-button>
            <!-- 新增类别 -->
            <el-button size="small" class="bg-purple-600 hover:bg-purple-700 text-white border-0" @click="handleAddCategory">
              <el-icon><FolderAdd /></el-icon>
              新增类别
            </el-button>
            <!-- 修改规则/退出编辑 -->
            <el-button
              v-if="!isTreeEditing"
              type="warning"
              size="small"
              @click="isTreeEditing = true"
            >
              <el-icon><EditPen /></el-icon>
              修改规则
            </el-button>
            <el-button
              v-else
              size="small"
              class="bg-gray-500 hover:bg-gray-600 text-white border-0"
              @click="isTreeEditing = false"
            >
              退出编辑
            </el-button>
          </div>

          <!-- 展开控制栏 -->
          <div v-show="viewMode === 'tree'" class="flex items-center justify-between mt-3">
            <span class="text-xs text-gray-500">
              共 {{ varietyTree.totalNodeCount.value }} 个节点
            </span>
            <div class="flex items-center gap-3">
              <el-button text size="small" @click="varietyTree.expandToLevel('subVariety1')">
                展开到子品种
              </el-button>
              <span class="text-gray-300">|</span>
              <el-button text size="small" @click="varietyTree.expandAll()">
                全部展开
              </el-button>
              <span class="text-gray-300">|</span>
              <el-button text size="small" class="text-gray-500 hover:text-gray-700" @click="varietyTree.collapseAll()">
                全部折叠
              </el-button>
            </div>
          </div>
        </div>

        <!-- 编辑模式提示 -->
        <div v-if="isTreeEditing && viewMode === 'tree'" class="bg-blue-50 border-b border-blue-200 px-4 py-2">
          <div class="flex items-center gap-2 text-sm text-blue-700">
            <span class="font-medium">编辑模式：</span>
            <span>· 点击展开图标查看下级分类</span>
            <span>· 悬停到类型/品种/子品种名称上可显示编辑和删除按钮</span>
            <span>· 点击新增按钮可添加子节点</span>
          </div>
        </div>

        <!-- 表格内容 - 表格视图 -->
        <div v-show="viewMode === 'table'" class="px-6 py-4 border-b border-gray-100 bg-white">
          <h3 class="text-lg font-semibold text-gray-900">作物编码列表</h3>
        </div>
        <div v-show="viewMode === 'table'" class="flex-1 overflow-auto">
          <table class="w-full" style="table-layout: fixed">
            <thead class="bg-gradient-to-r from-emerald-500 to-green-600 text-white sticky top-0 z-10">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap w-36">编码</th>
                <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap w-64">品种路径</th>
                <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap w-32">作物品种</th>
                <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap w-20">状态</th>
                <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap w-24">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-if="paginatedData.length === 0">
                <td colspan="5" class="px-4 py-12 text-center text-gray-500">暂无数据</td>
              </tr>
              <tr
                v-for="variety in paginatedData"
                :key="variety.id"
                :class="[
                  'hover:bg-blue-50 transition-colors cursor-pointer',
                  selectedVariety?.id === variety.id ? 'bg-emerald-50' : ''
                ]"
                @click="handleSelect(variety)"
              >
                <td class="px-4 py-3 text-sm font-mono text-blue-600 whitespace-nowrap">
                  {{ generateCode(variety.categoryCode, variety.typeCode, variety.varietyCode, variety.subVariety1Code, variety.detailVarietyCode) }}
                </td>
                <td class="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                  <span class="text-gray-400">{{ variety.categoryName }}</span>
                  <span class="text-gray-400 mx-0.5">-</span>
                  <span class="text-gray-400">{{ variety.typeName }}</span>
                  <span class="text-gray-400 mx-0.5">-</span>
                  <span class="text-gray-700">{{ variety.varietyName }}</span>
                  <template v-if="variety.subVariety1Name">
                    <span class="text-gray-400 mx-0.5">-</span>
                    <span class="text-gray-700">{{ variety.subVariety1Name }}</span>
                  </template>
                </td>
                <td class="px-4 py-3 text-sm text-gray-900 font-medium whitespace-nowrap">
                  {{ variety.subVariety1Name || variety.varietyName || '-' }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <span
                    :class="[
                      'px-2 py-1 rounded text-xs font-medium',
                      variety.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    ]"
                  >
                    {{ variety.status === 'active' ? '启用' : '停用' }}
                  </span>
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <div class="flex items-center gap-1">
                    <el-button
                      text
                      @click.stop="handleViewDetail(variety)"
                      class="p-1 hover:bg-gray-100 rounded"
                      title="查看详情"
                    >
                      <el-icon :size="16"><View /></el-icon>
                    </el-button>
                    <el-button
                      text
                      @click.stop="handleEdit(variety)"
                      class="p-1 hover:bg-gray-100 rounded"
                      title="编辑品种"
                    >
                      <el-icon :size="16"><Edit /></el-icon>
                    </el-button>
                    <el-button
                      text
                      @click.stop="handleDelete(variety)"
                      class="p-1 hover:bg-red-50 rounded"
                      title="删除品种"
                    >
                      <el-icon :size="16" color="#dc2626"><Delete /></el-icon>
                    </el-button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 树形视图 - 表格式树形 -->
        <div v-show="viewMode === 'tree'" class="flex-1 overflow-auto">
          <div v-if="varietyTree.treeData.value.length === 0" class="py-12 text-center text-gray-500">
            <el-icon :size="48" color="#d1d5db"><Link /></el-icon>
            <p class="mt-3">暂无数据</p>
            <p class="text-sm text-gray-400 mt-1">请调整筛选条件</p>
          </div>
          <table v-else class="w-full" style="table-layout: fixed">
            <thead class="bg-gradient-to-r from-blue-500 to-indigo-600 text-white sticky top-0 z-10">
              <tr>
                <th class="py-2 px-4 text-sm font-semibold whitespace-nowrap w-24 text-left text-white">类别</th>
                <th class="py-2 px-4 text-sm font-semibold whitespace-nowrap w-24 text-left text-white">类型</th>
                <th class="py-2 px-4 text-sm font-semibold whitespace-nowrap w-28 text-left text-white">品种</th>
                <th class="py-2 px-4 text-sm font-semibold whitespace-nowrap w-28 text-left text-white">子品种</th>
                <th class="py-2 px-4 text-sm font-semibold whitespace-nowrap w-32 text-left text-white">作物品种</th>
                <th class="py-2 px-4 text-sm font-semibold whitespace-nowrap w-36 text-left text-white">编码</th>
                <th class="py-2 px-4 text-sm font-semibold whitespace-nowrap w-20 text-left text-white">状态</th>
                <th class="py-2 px-4 text-sm font-semibold whitespace-nowrap w-24 text-left text-white">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <VarietyTreeNode
                v-for="node in varietyTree.treeData.value"
                :key="node.key"
                :node="node"
                :expanded-keys="Array.from(varietyTree.expandedKeys.value)"
                :is-tree-editing="isTreeEditing"
                :inline-add-state="inlineAddState"
                :inline-add-code="inlineAddCode"
                :inline-add-name="inlineAddName"
                @toggle-expand="varietyTree.toggleExpand"
                @select="handleTreeSelect"
                @add="handleTreeAdd"
                @edit="handleTreeEdit"
                @delete="handleTreeDelete"
                @inline-add-code-change="code => inlineAddCode = code"
                @inline-add-name-change="name => inlineAddName = name"
                @inline-add-save="handleInlineAddSave"
                @inline-add-cancel="handleInlineAddCancel"
                @refresh="handleTreeRefresh"
              />
            </tbody>
          </table>
        </div>

        <!-- 分页 -->
        <div class="px-4 py-3 border-t border-gray-100 flex-shrink-0">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="text-sm text-gray-500">
                共 {{ filteredData.length }} 条记录
              </span>
              <div class="flex items-center gap-1 text-sm text-gray-500">
                <span>每页</span>
                <el-select
                  v-model="pageSize"
                  size="small"
                  class="w-16"
                  @change="currentPage = 1"
                >
                  <el-option :value="10" label="10" />
                  <el-option :value="20" label="20" />
                  <el-option :value="50" label="50" />
                </el-select>
                <span>条</span>
              </div>
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
        <div class="bg-gray-50 rounded-lg p-6">
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

    <!-- P1-8 修复：新增类别弹窗 - 替代阻塞式 prompt -->
    <el-dialog
      v-model="showAddCategoryDialog"
      title="新增类别"
      width="420px"
      :close-on-click-modal="false"
    >
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            类别编码 <span class="text-red-500">*</span>
          </label>
          <el-input
            v-model="newCategoryForm.code"
            placeholder="2位大写字母，如：FR"
            maxlength="4"
            class="w-full"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            类别名称 <span class="text-red-500">*</span>
          </label>
          <el-input
            v-model="newCategoryForm.name"
            placeholder="如：水果类"
            class="w-full"
          />
        </div>
      </div>
      <template #footer>
        <el-button @click="showAddCategoryDialog = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmAddCategory">确认新增</el-button>
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
  Check,
  View,
  Edit,
  Delete,
  FolderAdd,
  EditPen
} from '@element-plus/icons-vue'
import AddCropVarietyModal from './components/AddCropVarietyModal.vue'
import EditCropVarietyModal from './components/EditCropVarietyModal.vue'
import CropVarietyDetail from './components/CropVarietyDetail.vue'
import VarietyTreeNode from './components/VarietyTreeNode.vue'
import { useVarietyTree } from '@/composables/useVarietyTree'
import { useCropVarietyStore } from '@/stores'
import {
  getCategoryOptions,
  getTypeOptionsByCategory,
  getVarietyOptionsByType,
  getSubVariety1Options,
  generateCropCode as generateCode,
  getMaxDetailVarietyCode
} from '@/services/cropVarietyService'
import * as extensionService from '@/services/cropVarietyExtensionService'
import { initExtensionCache } from '@/services/cropVarietyExtensionService'

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

// 树形编辑模式
const isTreeEditing = ref(false)

// 内联新增状态
const inlineAddState = ref({
  active: false,
  level: 'type',
  parentKey: '',
  parentPath: null // V1.1 风格：保存父节点完整路径，避免动态查找失败
})
const inlineAddCode = ref('')
const inlineAddName = ref('')

// 树形刷新标识
const treeRefreshKey = ref(0)

// 树形搜索关键词（组合编码+名称搜索）
const treeCombinedSearch = computed(() => {
  return searchNameKeyword.value || searchCodeKeyword.value || ''
})

// 使用树形 composable
const varietyTree = useVarietyTree(
  treeCombinedSearch,
  categoryFilter,
  'all',
  'subVariety1',
  treeRefreshKey,
  computed(() => store.items)
)

// 树形节点选择处理
function handleTreeSelect(variety) {
  selectedVariety.value = variety
  isDetailModalOpen.value = true
}

// 树形节点新增处理
function handleTreeAdd(node) {
  inlineAddState.value = {
    active: true,
    level: node.level === 'category' ? 'type' : node.level === 'type' ? 'variety' : 'subVariety1',
    parentKey: node.key,
    // V1.1 风格：保存父节点完整路径，避免保存时动态查找失败
    parentPath: {
      categoryCode: node.categoryCode || node.path?.categoryCode,
      categoryName: node.categoryName || node.path?.categoryName,
      typeCode: node.typeCode || node.path?.typeCode,
      typeName: node.typeName || node.path?.typeName,
      varietyCode: node.varietyCode || node.path?.varietyCode,
      varietyName: node.varietyName || node.path?.varietyName
    }
  }
  inlineAddCode.value = ''
  inlineAddName.value = ''
}

// 树形节点编辑处理
function handleTreeEdit(variety) {
  selectedVariety.value = variety
  isEditModalOpen.value = true
}

// 树形节点删除处理
function handleTreeDelete(variety) {
  deleteTargetVariety.value = variety
  deleteConfirmVisible.value = true
}

// 内联新增保存
async function handleInlineAddSave() {
  if (!inlineAddCode.value.trim() || !inlineAddName.value.trim()) return

  const level = inlineAddState.value.level
  const code = inlineAddCode.value.trim()
  const name = inlineAddName.value.trim()
  // V1.1 风格：使用保存的 parentPath（不再依赖 findNodeByKey 动态查找）
  const path = inlineAddState.value.parentPath

  if (!path) {
    ElMessage.error('未找到父节点路径')
    return
  }

  try {
    if (level === 'type') {
      await extensionService.addTypeExtension(path.categoryCode, code, name)
    } else if (level === 'variety') {
      // 保留对 parentNode 的 fallback 引用以防 path 缺字段
      const parentNode = findNodeByKey(varietyTree.treeData.value, inlineAddState.value.parentKey)
      await extensionService.addVarietyExtension(path.categoryCode, parentNode?.code || path.typeCode, code, name)
    } else if (level === 'subVariety1') {
      const parentNode = findNodeByKey(varietyTree.treeData.value, inlineAddState.value.parentKey)
      await extensionService.addSubVariety1Extension(path.categoryCode, path.typeCode, parentNode?.code || path.varietyCode, code, name)
    }
    handleInlineAddCancel()
    handleTreeRefresh()
  } catch (err) {
    ElMessage.error('添加失败: ' + err.message)
  }
}

// 内联新增取消
function handleInlineAddCancel() {
  inlineAddState.value = { active: false, level: 'type', parentKey: '', parentPath: null }
  inlineAddCode.value = ''
  inlineAddName.value = ''
}

// 新增类别 - P1-8 修复：与 V1.1 一致 - 使用 el-dialog 替代 prompt 阻塞
const showAddCategoryDialog = ref(false)
const newCategoryForm = reactive({ code: '', name: '' })

function handleAddCategory() {
  newCategoryForm.code = ''
  newCategoryForm.name = ''
  showAddCategoryDialog.value = true
}

async function handleConfirmAddCategory() {
  if (!newCategoryForm.code.trim() || !newCategoryForm.name.trim()) {
    ElMessage.warning('请填写类别编码和名称')
    return
  }
  try {
    await extensionService.addCategoryExtension(newCategoryForm.code.trim().toUpperCase(), newCategoryForm.name.trim())
    ElMessage.success('新增类别成功')
    showAddCategoryDialog.value = false
    handleTreeRefresh()
  } catch (err) {
    ElMessage.error('新增类别失败: ' + err.message)
  }
}

// 树形刷新
function handleTreeRefresh() {
  treeRefreshKey.value++
  store.refreshItems()
  updateStats()
}

// 在树形数据中查找节点
function findNodeByKey(nodes, key) {
  for (const node of nodes) {
    if (node.key === key) return node
    if (node.children?.length > 0) {
      const found = findNodeByKey(node.children, key)
      if (found) return found
    }
  }
  return null
}

// 初始化
onMounted(async () => {
  await initExtensionCache()
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
// P1-7 修复：与 V1.1 一致 - 名称变化时不自动重生成，需手动点击"生成"按钮
function handleDetailVarietyNameChange() {
  // V1.1 行为：名称变化不立即重生成，用户必须点击"生成"按钮
  // 原 V2.0 行为：name onInput 自动调用 handleGenerateCode，与 V1.1 不一致
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
      const success = await store.deleteItem(deleteTargetVariety.value.id)
      if (!success) return
      updateStats()
      if (selectedVariety.value?.id === deleteTargetVariety.value.id) {
        selectedVariety.value = null
      }
      deleteConfirmVisible.value = false
    } catch (error) {
      ElMessage.error('删除失败，请重试')
    }
  }
}
</script>
