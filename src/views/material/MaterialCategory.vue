<!--
  MaterialCategory 物资分类管理
  1:1 翻译自 V1.1 src/components/materialCategory/materialCategoryPage.tsx
  - 5 条平铺数据（无树形、无 children）
  - 搜索：分类名称 + 级别
  - 表格 8 列（无复选框）
  - 仅查看/编辑 icon 按钮（无实际弹窗，与 V1.1 一致）
-->
<template>
  <div class="space-y-6">
    <!-- 页面头部（V1.1 L33-43） -->
    <div class="bg-white rounded-xl p-6 shadow-none">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
          <Tags class="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">物资分类管理</h1>
          <p class="text-gray-500">物资分类体系与编码规则</p>
        </div>
      </div>
    </div>

    <!-- 搜索区域（V1.1 L45-82） -->
    <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm">
      <div class="flex flex-wrap gap-4 items-end">
        <!-- 分类名称 -->
        <div class="flex-1 min-w-[180px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">分类名称</label>
          <input
            v-model="name"
            type="text"
            placeholder="请输入分类名称"
            class="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>
        <!-- 级别 -->
        <div class="min-w-[150px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">级别</label>
          <select
            v-model="level"
            class="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
          >
            <option>全部</option>
            <option>大类</option>
            <option>中类</option>
            <option>小类</option>
          </select>
        </div>
        <!-- 操作按钮组（V1.1 L70-80） -->
        <div class="flex gap-2">
          <Button variant="warning" @click="handleReset">
            <RotateCcw class="w-4 h-4" />
            <span>重置</span>
          </Button>
          <Button @click="handleSearch">
            <Search class="w-4 h-4" />
            <span>搜索</span>
          </Button>
          <Button>
            <Plus class="w-4 h-4" />
            <span>新增分类</span>
          </Button>
        </div>
      </div>
    </div>

    <!-- 数据表格（V1.1 L84-147） -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="p-4 border-b border-gray-100">
        <h3 class="text-lg font-semibold text-gray-900">物资分类列表</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <tr>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">分类编码</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">分类名称</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">级别</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">父级分类</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">物资编码前缀</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">包含物资数</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">备注</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-300">
            <tr
              v-for="category in paginatedCategories"
              :key="category.id"
              class="hover:bg-blue-100 transition-colors"
            >
              <td class="px-4 py-3 text-sm font-medium text-gray-900">{{ category.code }}</td>
              <td class="px-4 py-3 text-sm text-gray-600">{{ category.name }}</td>
              <td class="px-4 py-3">
                <span
                  class="inline-flex px-2 py-1 rounded-full text-xs font-medium"
                  :class="getLevelClass(category.level)"
                >
                  {{ category.level }}
                </span>
              </td>
              <td class="px-4 py-3 text-sm text-gray-600">{{ category.parent }}</td>
              <td class="px-4 py-3 text-sm text-gray-600">{{ category.prefix }}</td>
              <td class="px-4 py-3 text-sm text-gray-600">{{ category.itemCount }}种</td>
              <td class="px-4 py-3 text-sm text-gray-600">{{ category.description }}</td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-1">
                  <Button variant="ghost" size="icon" title="查看">
                    <Eye class="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" title="编辑">
                    <Edit class="w-4 h-4" />
                  </Button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <!-- 分页（V1.1 L135-145） -->
        <div class="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
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
    </div>
  </div>
</template>

<script setup>
/**
 * MaterialCategory 物资分类管理
 * 1:1 翻译 V1.1 src/components/materialCategory/materialCategoryPage.tsx
 * 字段：{ id, code, name, level, parent, prefix, itemCount, description }
 */
import { ref, computed } from 'vue'
import { Edit, Eye, Plus, RotateCcw, Search, Tags } from 'lucide-vue-next'
import Button from '@/components/ui/Button/Button.vue'
import Pagination from '@/components/ui/Pagination/Pagination.vue'

// Mock 数据（V1.1 L17-23，5 条平铺）
const materialCategories = [
  { id: 1, code: 'M001', name: '种子种苗', level: '大类', parent: '-', prefix: 'ZZ', itemCount: 25, description: '各类农作物种子' },
  { id: 2, code: 'M002', name: '肥料', level: '大类', parent: '-', prefix: 'FL', itemCount: 45, description: '化肥、有机肥等' },
  { id: 3, code: 'M003', name: '农药', level: '大类', parent: '-', prefix: 'NJ', itemCount: 68, description: '杀虫剂、杀菌剂等' },
  { id: 4, code: 'M004', name: '农膜', level: '大类', parent: '-', prefix: 'NM', itemCount: 15, description: '大棚膜、地膜等' },
  { id: 5, code: 'M005', name: '包装材料', level: '大类', parent: '-', prefix: 'BZ', itemCount: 32, description: '包装箱、标签等' },
]

// 状态（V1.1 L26-29）
const name = ref('')
const level = ref('全部')
const currentPage = ref(1)
const pageSize = ref(10)

// 过滤（V1.1 中由输入即触发，这里延后到 handleSearch/handleReset）
const filteredCategories = computed(() => {
  return materialCategories.filter((cat) => {
    if (name.value && !cat.name.includes(name.value)) return false
    if (level.value !== '全部' && cat.level !== level.value) return false
    return true
  })
})

// 分页（V1.1 L103 / L138-141）
const paginatedCategories = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredCategories.value.slice(start, start + pageSize.value)
})

const totalPages = computed(() => Math.ceil(filteredCategories.value.length / pageSize.value) || 1)

// 级别徽章颜色（V1.1 L108-112）
const getLevelClass = (lv) => {
  if (lv === '大类') return 'bg-green-100 text-green-700'
  if (lv === '中类') return 'bg-amber-100 text-amber-700'
  return 'bg-blue-100 text-blue-700'
}

// 分页回调
const handlePageChange = (page) => {
  currentPage.value = page
}

const handlePageSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

// 重置
const handleReset = () => {
  name.value = ''
  level.value = '全部'
  currentPage.value = 1
}

// 搜索（点击触发过滤，分页回到第 1 页）
const handleSearch = () => {
  currentPage.value = 1
}
</script>
