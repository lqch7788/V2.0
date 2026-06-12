<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
            <Package class="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">物资分类管理</h1>
            <p class="text-gray-500">物资分类体系与编码规则</p>
          </div>
        </div>
        <button class="h-8 px-3 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700" @click="handleAddCategory">
          <Plus class="w-4 h-4 inline mr-1" />新增类别
        </button>
      </div>
    </div>

    <!-- 搜索区域 -->
    <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm">
      <div class="grid grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">类别编码</label>
          <input
            v-model="searchForm.code"
            placeholder="请输入"
            class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm"
            @input="updateSearchField('code', searchForm.code)"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">类别名称</label>
          <input
            v-model="searchForm.name"
            placeholder="请输入"
            class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm"
            @input="updateSearchField('name', searchForm.name)"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">上级类别</label>
          <select
            v-model="searchForm.parentCode"
            class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm bg-white"
            @change="updateSearchField('parentCode', searchForm.parentCode)"
          >
            <option value="">全部</option>
            <option value="01">原料</option>
            <option value="02">资材</option>
          </select>
        </div>
        <div class="flex items-end gap-2">
          <button class="h-8 px-3 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700" @click="handleSearch">搜索</button>
          <button class="h-8 px-3 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200" @click="handleReset">重置</button>
        </div>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900">物资分类列表</h3>
        <div class="flex gap-2">
          <button class="h-8 px-3 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200" @click="handleBatchEdit">
            <Pencil class="w-4 h-4 inline mr-1" />编辑
          </button>
          <button class="h-8 px-3 rounded-md text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200" @click="handleBatchDelete">
            <Trash2 class="w-4 h-4 inline mr-1" />删除
          </button>
          <button class="h-8 px-3 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200" @click="handleExport">
            <Download class="w-4 h-4 inline mr-1" />导出
          </button>
        </div>
      </div>

      <div class="overflow-auto">
        <table class="w-full">
          <thead class="bg-gradient-to-r from-blue-500 to-blue-600 text-white sticky top-0 z-10">
            <tr>
              <th class="px-4 py-3 text-left text-sm font-semibold w-14 whitespace-nowrap">
                <input type="checkbox" :checked="paginatedCategories.length > 0 && selectedRows.length === paginatedCategories.length" @change="toggleSelectAll" class="w-4 h-4 rounded border-white" />
              </th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">类别编码</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">类别名称</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">层级</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">上级类别</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">编码前缀</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">描述</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">排序</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">状态</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-300">
            <tr v-if="paginatedCategories.length === 0">
              <td colspan="10" class="px-4 py-8 text-center text-gray-500">暂无数据</td>
            </tr>
            <tr
              v-for="row in paginatedCategories"
              :key="row.id"
              class="hover:bg-blue-100 transition-colors"
            >
              <td class="px-4 py-3">
                <input type="checkbox" :checked="selectedRows.some(r => r.id === row.id)" @change="toggleCategorySelect(row)" class="w-4 h-4 rounded border-gray-400" />
              </td>
              <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.code }}</td>
              <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.name }}</td>
              <td class="px-4 py-3 whitespace-nowrap">
                <span class="inline-flex px-2 py-1 rounded-full text-xs font-medium" :class="{
                  'bg-green-100 text-green-700': row.level === 1,
                  'bg-amber-100 text-amber-700': row.level === 2,
                  'bg-blue-100 text-blue-700': row.level === 3
                }">
                  {{ row.level === 1 ? '大类' : row.level === 2 ? '中类' : '小类' }}
                </span>
              </td>
              <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ getParentName(row.parentCode) }}</td>
              <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.prefix }}</td>
              <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.description }}</td>
              <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.sortOrder }}</td>
              <td class="px-4 py-3 whitespace-nowrap">
                <span class="inline-flex px-2 py-1 rounded-full text-xs font-medium" :class="{
                  'bg-green-100 text-green-700': row.status === 'active',
                  'bg-gray-100 text-gray-700': row.status !== 'active'
                }">
                  {{ row.status === 'active' ? '启用' : '停用' }}
                </span>
              </td>
              <td class="px-4 py-3 whitespace-nowrap">
                <div class="flex items-center gap-1">
                  <button class="text-blue-600 hover:text-blue-800 p-1" title="查看" @click="handleView(row)">查看</button>
                  <button class="text-blue-600 hover:text-blue-800 p-1" title="编辑" @click="handleEdit(row)">编辑</button>
                  <button class="text-red-600 hover:text-red-800 p-1" title="删除" @click="handleDelete(row)">删除</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页 -->
      <div class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
        <Pagination
          :current-page="currentPage"
          :total-pages="totalPages"
          :page-size="pageSize"
          :page-size-options="[10, 20, 50]"
          :show-page-size="true"
          @page-change="handlePageChange"
          @page-size-change="handlePageSizeChange"
        />
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <div v-if="showFormModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm" @click="showFormModal = false">
      <div class="bg-white rounded-xl w-full max-w-[600px] max-h-[90vh] overflow-hidden shadow-2xl" @click.stop>
        <!-- 弹窗头部 -->
        <div class="px-6 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white flex items-center justify-between">
          <h3 class="text-lg font-semibold">{{ isEdit ? '编辑类别' : '新增类别' }}</h3>
          <button @click="showFormModal = false" class="text-white/80 hover:text-white text-2xl leading-none">&times;</button>
        </div>

        <!-- 弹窗内容 -->
        <div class="p-6 overflow-y-auto max-h-[60vh]">
          <div class="grid gap-4">
            <!-- 类别编码 -->
            <div class="flex items-start gap-3">
              <label class="w-[100px] pt-2 text-sm font-medium text-gray-700 text-right flex-shrink-0">类别编码<span class="text-red-500 ml-0.5">*</span></label>
              <input
                v-model="form.code"
                placeholder="请输入类别编码"
                class="flex-1 px-3 py-2 border border-gray-400 rounded-lg text-sm"
              />
            </div>
            <!-- 类别名称 -->
            <div class="flex items-start gap-3">
              <label class="w-[100px] pt-2 text-sm font-medium text-gray-700 text-right flex-shrink-0">类别名称<span class="text-red-500 ml-0.5">*</span></label>
              <input
                v-model="form.name"
                placeholder="请输入类别名称"
                class="flex-1 px-3 py-2 border border-gray-400 rounded-lg text-sm"
              />
            </div>
            <!-- 层级 -->
            <div class="flex items-start gap-3">
              <label class="w-[100px] pt-2 text-sm font-medium text-gray-700 text-right flex-shrink-0">层级<span class="text-red-500 ml-0.5">*</span></label>
              <select
                v-model="form.level"
                class="flex-1 px-3 py-2 border border-gray-400 rounded-lg text-sm bg-white"
                @change="handleLevelChange"
              >
                <option :value="1">大类</option>
                <option :value="2">中类</option>
                <option :value="3">小类</option>
              </select>
            </div>
            <!-- 上级类别 -->
            <div class="flex items-start gap-3">
              <label class="w-[100px] pt-2 text-sm font-medium text-gray-700 text-right flex-shrink-0">上级类别</label>
              <select
                v-model="form.parentCode"
                class="flex-1 px-3 py-2 border border-gray-400 rounded-lg text-sm bg-white"
                :disabled="form.level === 1"
              >
                <option value="">请选择上级类别</option>
                <option
                  v-for="cat in parentCategoryOptions"
                  :key="cat.code"
                  :value="cat.code"
                >{{ cat.code }} - {{ cat.name }}</option>
              </select>
            </div>
            <!-- 编码前缀 -->
            <div class="flex items-start gap-3">
              <label class="w-[100px] pt-2 text-sm font-medium text-gray-700 text-right flex-shrink-0">编码前缀</label>
              <input
                v-model="form.prefix"
                placeholder="请输入编码前缀"
                class="flex-1 px-3 py-2 border border-gray-400 rounded-lg text-sm"
              />
            </div>
            <!-- 排序 -->
            <div class="flex items-start gap-3">
              <label class="w-[100px] pt-2 text-sm font-medium text-gray-700 text-right flex-shrink-0">排序</label>
              <input
                v-model.number="form.sortOrder"
                type="number"
                min="0"
                max="999"
                class="flex-1 px-3 py-2 border border-gray-400 rounded-lg text-sm w-32"
              />
            </div>
            <!-- 状态 -->
            <div class="flex items-start gap-3">
              <label class="w-[100px] pt-2 text-sm font-medium text-gray-700 text-right flex-shrink-0">状态</label>
              <div class="flex items-center gap-4 py-2">
                <label class="flex items-center gap-2">
                  <input type="radio" v-model="form.status" value="active" class="w-4 h-4 text-blue-600 border-gray-400" />
                  <span class="text-sm text-gray-700">启用</span>
                </label>
                <label class="flex items-center gap-2">
                  <input type="radio" v-model="form.status" value="inactive" class="w-4 h-4 text-blue-600 border-gray-400" />
                  <span class="text-sm text-gray-700">停用</span>
                </label>
              </div>
            </div>
            <!-- 描述 -->
            <div class="flex items-start gap-3">
              <label class="w-[100px] pt-2 text-sm font-medium text-gray-700 text-right flex-shrink-0">描述</label>
              <textarea
                v-model="form.description"
                placeholder="请输入描述"
                rows="3"
                class="flex-1 px-3 py-2 border border-gray-400 rounded-lg text-sm resize-none"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- 弹窗底部 -->
        <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-2">
          <button class="h-8 px-4 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200" @click="showFormModal = false">
            <X class="w-4 h-4 inline mr-1" />取消
          </button>
          <button class="h-8 px-4 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700" @click="handleSave">保存</button>
        </div>
      </div>
    </div>

    <!-- 查看详情弹窗 -->
    <div v-if="showDetailModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm" @click="showDetailModal = false">
      <div class="bg-white rounded-xl w-full max-w-[500px] max-h-[90vh] overflow-hidden shadow-2xl" @click.stop>
        <!-- 弹窗头部 -->
        <div class="px-6 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white flex items-center justify-between">
          <h3 class="text-lg font-semibold">类别详情</h3>
          <button @click="showDetailModal = false" class="text-white/80 hover:text-white text-2xl leading-none">&times;</button>
        </div>

        <!-- 弹窗内容 -->
        <div class="p-6 overflow-y-auto max-h-[60vh]">
          <div class="grid grid-cols-1 divide-y border rounded-lg">
            <div class="flex px-4 py-3 bg-gray-50">
              <span class="w-24 text-sm font-medium text-gray-700 flex-shrink-0">类别编码</span>
              <span class="text-sm text-gray-900">{{ selectedCategory?.code }}</span>
            </div>
            <div class="flex px-4 py-3">
              <span class="w-24 text-sm font-medium text-gray-700 flex-shrink-0">类别名称</span>
              <span class="text-sm text-gray-900">{{ selectedCategory?.name }}</span>
            </div>
            <div class="flex px-4 py-3 bg-gray-50">
              <span class="w-24 text-sm font-medium text-gray-700 flex-shrink-0">层级</span>
              <span class="inline-flex px-2 py-1 rounded-full text-xs font-medium" :class="{
                'bg-green-100 text-green-700': selectedCategory?.level === 1,
                'bg-amber-100 text-amber-700': selectedCategory?.level === 2,
                'bg-blue-100 text-blue-700': selectedCategory?.level === 3
              }">
                {{ selectedCategory?.level === 1 ? '大类' : selectedCategory?.level === 2 ? '中类' : '小类' }}
              </span>
            </div>
            <div class="flex px-4 py-3">
              <span class="w-24 text-sm font-medium text-gray-700 flex-shrink-0">上级类别</span>
              <span class="text-sm text-gray-900">{{ getParentName(selectedCategory?.parentCode) }}</span>
            </div>
            <div class="flex px-4 py-3 bg-gray-50">
              <span class="w-24 text-sm font-medium text-gray-700 flex-shrink-0">编码前缀</span>
              <span class="text-sm text-gray-900">{{ selectedCategory?.prefix }}</span>
            </div>
            <div class="flex px-4 py-3">
              <span class="w-24 text-sm font-medium text-gray-700 flex-shrink-0">排序</span>
              <span class="text-sm text-gray-900">{{ selectedCategory?.sortOrder }}</span>
            </div>
            <div class="flex px-4 py-3 bg-gray-50">
              <span class="w-24 text-sm font-medium text-gray-700 flex-shrink-0">状态</span>
              <span class="inline-flex px-2 py-1 rounded-full text-xs font-medium" :class="{
                'bg-green-100 text-green-700': selectedCategory?.status === 'active',
                'bg-gray-100 text-gray-700': selectedCategory?.status !== 'active'
              }">
                {{ selectedCategory?.status === 'active' ? '启用' : '停用' }}
              </span>
            </div>
            <div class="flex px-4 py-3">
              <span class="w-24 text-sm font-medium text-gray-700 flex-shrink-0">描述</span>
              <span class="text-sm text-gray-900">{{ selectedCategory?.description || '-' }}</span>
            </div>
          </div>
        </div>

        <!-- 弹窗底部 -->
        <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button class="h-8 px-4 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200" @click="showDetailModal = false">
            <X class="w-4 h-4 inline mr-1" />关闭
          </button>
        </div>
      </div>
    </div>

    <!-- 删除确认弹窗 -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm" @click="showDeleteConfirm = false">
      <div class="bg-white rounded-xl w-full max-w-[400px] max-h-[90vh] overflow-hidden shadow-2xl" @click.stop>
        <!-- 弹窗头部 -->
        <div class="px-6 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white flex items-center justify-between">
          <h3 class="text-lg font-semibold">确认删除</h3>
          <button @click="showDeleteConfirm = false" class="text-white/80 hover:text-white text-2xl leading-none">&times;</button>
        </div>

        <!-- 弹窗内容 -->
        <div class="p-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle class="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p class="text-lg font-medium">确定要删除选中的 {{ selectedRows.length }} 个类别吗？</p>
              <p class="text-sm text-gray-500">删除后将无法恢复</p>
            </div>
          </div>
        </div>

        <!-- 弹窗底部 -->
        <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-2">
          <button class="h-8 px-4 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200" @click="showDeleteConfirm = false">
            <X class="w-4 h-4 inline mr-1" />取消
          </button>
          <button class="h-8 px-4 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700" @click="handleDoDelete">
            <Trash2 class="w-4 h-4 inline mr-1" />确认删除
          </button>
        </div>
      </div>
    </div>

    <!-- 导出格式选择弹窗 -->
    <div v-if="showExportModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm" @click="showExportModal = false">
      <div class="bg-white rounded-xl w-full max-w-[500px] max-h-[90vh] overflow-hidden shadow-2xl" @click.stop>
        <!-- 弹窗头部 -->
        <div class="px-6 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white flex items-center justify-between">
          <h3 class="text-lg font-semibold">选择导出格式</h3>
          <button @click="showExportModal = false" class="text-white/80 hover:text-white text-2xl leading-none">&times;</button>
        </div>

        <!-- 弹窗内容 -->
        <div class="p-6">
          <p class="text-sm text-gray-500 mb-4">
            {{ selectedRows.length > 0 ? `已选择 ${selectedRows.length} 个类别` : `共 ${filteredCategories.length} 个类别` }}
          </p>
          <div class="space-y-3">
            <label
              v-for="format in exportFormats"
              :key="format.value"
              :class="['flex items-center p-4 border rounded-lg cursor-pointer transition-all',
                exportFormat === format.value ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300']"
              @click="exportFormat = format.value"
            >
              <input
                type="radio"
                :value="format.value"
                v-model="exportFormat"
                class="w-4 h-4 text-emerald-600 border-gray-400"
              />
              <div class="ml-3">
                <span class="block text-sm font-medium text-gray-900">{{ format.label }}</span>
                <span class="block text-xs text-gray-500">{{ format.desc }}</span>
              </div>
            </label>
          </div>
        </div>

        <!-- 弹窗底部 -->
        <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-2">
          <button class="h-8 px-4 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200" @click="showExportModal = false">
            <X class="w-4 h-4 inline mr-1" />取消
          </button>
          <button class="h-8 px-4 rounded-md text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700" @click="handleDoExport">导出</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { Package, Plus, Pencil, Trash2, Download, AlertTriangle, X } from 'lucide-vue-next'
import { ElMessage } from 'element-plus'
import Pagination from '@/components/ui/Pagination/Pagination.vue'

// 导出格式选项
const exportFormats = [
  { value: 'excel', label: 'Excel (.xlsx)', desc: '适用于数据分析和处理' },
  { value: 'csv', label: 'CSV (.csv)', desc: '适用于数据交换' },
  { value: 'word', label: 'Word (.docx)', desc: '适用于文档编辑和分享' }
]

// Mock数据 - 树形结构类别
const mockCategories = ref([
  {
    id: 1,
    code: '01',
    name: '原料',
    level: 1,
    parentCode: '',
    prefix: '01',
    description: '农业生产原料',
    sortOrder: 1,
    status: 'active',
    children: [
      {
        id: 11,
        code: '0101',
        name: '种子',
        level: 2,
        parentCode: '01',
        prefix: '0101',
        description: '各类种子',
        sortOrder: 1,
        status: 'active',
        children: [
          { id: 111, code: '010101', name: '蔬菜种子', level: 3, parentCode: '0101', prefix: '010101', description: '蔬菜类种子', sortOrder: 1, status: 'active' },
          { id: 112, code: '010102', name: '水果种子', level: 3, parentCode: '0101', prefix: '010102', description: '水果类种子', sortOrder: 2, status: 'active' },
        ]
      },
      {
        id: 12,
        code: '0102',
        name: '肥料',
        level: 2,
        parentCode: '01',
        prefix: '0102',
        description: '各类肥料',
        sortOrder: 2,
        status: 'active',
        children: [
          { id: 121, code: '010201', name: '氮肥', level: 3, parentCode: '0102', prefix: '010201', description: '氮肥类', sortOrder: 1, status: 'active' },
          { id: 122, code: '010202', name: '磷肥', level: 3, parentCode: '0102', prefix: '010202', description: '磷肥类', sortOrder: 2, status: 'active' },
          { id: 123, code: '010203', name: '钾肥', level: 3, parentCode: '0102', prefix: '010203', description: '钾肥类', sortOrder: 3, status: 'active' },
        ]
      },
      {
        id: 13,
        code: '0103',
        name: '农药',
        level: 2,
        parentCode: '01',
        prefix: '0103',
        description: '各类农药',
        sortOrder: 3,
        status: 'active',
        children: [
          { id: 131, code: '010301', name: '杀虫剂', level: 3, parentCode: '0103', prefix: '010301', description: '杀虫药剂', sortOrder: 1, status: 'active' },
          { id: 132, code: '010302', name: '杀菌剂', level: 3, parentCode: '0103', prefix: '010302', description: '杀菌药剂', sortOrder: 2, status: 'active' },
        ]
      },
    ]
  },
  {
    id: 2,
    code: '02',
    name: '资材',
    level: 1,
    parentCode: '',
    prefix: '02',
    description: '农业生产资材',
    sortOrder: 2,
    status: 'active',
    children: [
      {
        id: 21,
        code: '0201',
        name: '包装材料',
        level: 2,
        parentCode: '02',
        prefix: '0201',
        description: '包装用材料',
        sortOrder: 1,
        status: 'active',
        children: [
          { id: 211, code: '020101', name: '纸箱', level: 3, parentCode: '0201', prefix: '020101', description: '各种规格纸箱', sortOrder: 1, status: 'active' },
          { id: 212, code: '020102', name: '塑料袋', level: 3, parentCode: '0201', prefix: '020102', description: '各种规格塑料袋', sortOrder: 2, status: 'active' },
        ]
      },
      {
        id: 22,
        code: '0202',
        name: '工具',
        level: 2,
        parentCode: '02',
        prefix: '0202',
        description: '生产工具',
        sortOrder: 2,
        status: 'active',
        children: [
          { id: 221, code: '020201', name: '剪刀', level: 3, parentCode: '0202', prefix: '020201', description: '修剪用剪刀', sortOrder: 1, status: 'active' },
          { id: 222, code: '020202', name: '铲子', level: 3, parentCode: '0202', prefix: '020202', description: '挖掘用铲子', sortOrder: 2, status: 'active' },
        ]
      },
    ]
  },
])

// 状态
const currentPage = ref(1)
const pageSize = ref(10)
const selectedRows = ref([])
const showFormModal = ref(false)
const showDetailModal = ref(false)
const showDeleteConfirm = ref(false)
const showExportModal = ref(false)
const isEdit = ref(false)
const exportFormat = ref('excel')
const selectedCategory = ref(null)

// 搜索表单
const searchForm = reactive({
  code: '',
  name: '',
  parentCode: ''
})

// 表单状态
const form = reactive({
  id: 0,
  code: '',
  name: '',
  level: 1,
  parentCode: '',
  prefix: '',
  sortOrder: 0,
  status: 'active',
  description: ''
})

const formRef = ref()

const rules = {
  code: [{ required: true, message: '请输入类别编码', trigger: 'blur' }],
  name: [{ required: true, message: '请输入类别名称', trigger: 'blur' }],
  level: [{ required: true, message: '请选择层级', trigger: 'change' }],
}

// 计算属性 - 将树形结构平铺
const flatCategories = computed(() => {
  const result = []
  const flatten = (categories, parentName = '') => {
    categories.forEach(cat => {
      result.push({ ...cat, parentName })
      if (cat.children && cat.children.length > 0) {
        flatten(cat.children, cat.name)
      }
    })
  }
  flatten(mockCategories.value)
  return result
})

const filteredCategories = computed(() => {
  return flatCategories.value.filter(cat => {
    if (searchForm.code && !cat.code.includes(searchForm.code)) return false
    if (searchForm.name && !cat.name.includes(searchForm.name)) return false
    if (searchForm.parentCode && cat.parentCode !== searchForm.parentCode && !cat.code.startsWith(searchForm.parentCode)) return false
    return true
  })
})

const paginatedCategories = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredCategories.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(filteredCategories.value.length / pageSize.value) || 1)

// 上级类别选项
const parentCategoryOptions = computed(() => {
  if (form.level === 1) return []
  if (form.level === 2) {
    return mockCategories.value.map(c => ({ code: c.code, name: c.name }))
  }
  // 小类 - 获取所有中类
  const options = []
  mockCategories.value.forEach(big => {
    if (big.children) {
      big.children.forEach(mid => {
        options.push({ code: mid.code, name: `${big.name} > ${mid.name}` })
      })
    }
  })
  return options
})

// 方法
const getParentName = (parentCode) => {
  if (!parentCode) return '-'
  const findName = (categories) => {
    for (const cat of categories) {
      if (cat.code === parentCode) return cat.name
      if (cat.children) {
        const found = findName(cat.children)
        if (found) return found
      }
    }
    return null
  }
  return findName(mockCategories.value) || '-'
}

const updateSearchField = (field, value) => {
  (searchForm)[field] = value
  currentPage.value = 1
}

const handleSearch = () => {
  currentPage.value = 1
}

const handleReset = () => {
  searchForm.code = ''
  searchForm.name = ''
  searchForm.parentCode = ''
  currentPage.value = 1
}

const handlePageChange = (page) => {
  currentPage.value = page
}

const handlePageSizeChange = () => {
  currentPage.value = 1
}

const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

/** 全选/取消全选当前页 */
const toggleSelectAll = () => {
  const allSelected = paginatedCategories.value.length > 0 && selectedRows.value.length === paginatedCategories.value.length
  if (allSelected) {
    // 移除当前页所有项
    const currentIds = new Set(paginatedCategories.value.map(r => r.id))
    selectedRows.value = selectedRows.value.filter(r => !currentIds.has(r.id))
  } else {
    // 添加当前页所有项（去重）
    const existingIds = new Set(selectedRows.value.map(r => r.id))
    const newItems = paginatedCategories.value.filter(r => !existingIds.has(r.id))
    selectedRows.value = [...selectedRows.value, ...newItems]
  }
}

/** 单行选中切换 */
const toggleCategorySelect = (row) => {
  const idx = selectedRows.value.findIndex(r => r.id === row.id)
  if (idx >= 0) {
    selectedRows.value.splice(idx, 1)
  } else {
    selectedRows.value.push(row)
  }
}

const handleLevelChange = () => {
  form.parentCode = ''
  if (form.level === 1) {
    form.prefix = form.code
  } else if (form.level === 2) {
    form.prefix = form.parentCode
  }
}

const handleAddCategory = () => {
  isEdit.value = false
  resetForm()
  showFormModal.value = true
}

const handleView = (row) => {
  selectedCategory.value = row
  showDetailModal.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(form, row)
  showFormModal.value = true
}

const handleDelete = (row) => {
  selectedRows.value = [row]
  showDeleteConfirm.value = true
}

const handleBatchEdit = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要编辑的类别')
    return
  }
  ElMessage.info('批量编辑功能开发中')
}

const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的类别')
    return
  }
  showDeleteConfirm.value = true
}

const handleDoDelete = () => {
  const ids = selectedRows.value.map(r => r.id)
  // 实际删除逻辑 - 这里简化处理
  ElMessage.success(`删除了 ${ids.length} 个类别`)
  showDeleteConfirm.value = false
  selectedRows.value = []
}

const handleExport = () => {
  showExportModal.value = true
}

const handleDoExport = () => {
  const dataToExport = selectedRows.value.length > 0
    ? selectedRows.value
    : filteredCategories.value

  const headers = ['类别编码', '类别名称', '层级', '上级类别', '编码前缀', '排序', '状态', '描述']
  const exportData = dataToExport.map(c => ({
    '类别编码': c.code,
    '类别名称': c.name,
    '层级': c.level === 1 ? '大类' : c.level === 2 ? '中类' : '小类',
    '上级类别': getParentName(c.parentCode),
    '编码前缀': c.prefix,
    '排序': c.sortOrder,
    '状态': c.status === 'active' ? '启用' : '停用',
    '描述': c.description || ''
  }))

  let content = ''
  let mimeType = ''
  let extension = ''

  if (exportFormat.value === 'csv') {
    content = headers.join(',') + '\n' + exportData.map(row =>
      headers.map(h => `"${(row)[h] || ''}"`).join(',')
    ).join('\n')
    mimeType = 'text/csv;charset=utf-8'
    extension = 'csv'
  } else if (exportFormat.value === 'excel') {
    content = `<html><head><meta charset="utf-8"></head><body><table border="1"><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>${exportData.map(row => `<tr>${headers.map(h => `<td>${(row)[h] || ''}</td>`).join('')}</tr>`).join('')}</table></body></html>`
    mimeType = 'application/vnd.ms-excel;charset=utf-8'
    extension = 'xls'
  } else if (exportFormat.value === 'word') {
    content = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"></head><body><table border="1">${headers.map(h => `<th>${h}</th>`).join('')}${exportData.map(row => `<tr>${headers.map(h => `<td>${(row)[h] || ''}</td>`).join('')}</tr>`).join('')}</table></body></html>`
    mimeType = 'application/ms-word;charset=utf-8'
    extension = 'doc'
  }

  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `物资分类_${new Date().toISOString().slice(0, 10)}.${extension}`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  showExportModal.value = false
  ElMessage.success('导出成功')
}

const handleSave = async () => {
  // 手动验证必填字段
  if (!form.code || !form.name) {
    ElMessage.warning('请填写必填字段（类别编码、类别名称）')
    return
  }
  if (!form.level) {
    ElMessage.warning('请选择层级')
    return
  }
  if (isEdit.value) {
    ElMessage.success('编辑成功')
  } else {
    ElMessage.success('新增成功')
  }
  showFormModal.value = false
}

const resetForm = () => {
  form.id = 0
  form.code = ''
  form.name = ''
  form.level = 1
  form.parentCode = ''
  form.prefix = ''
  form.sortOrder = 0
  form.status = 'active'
  form.description = ''
}
</script>
