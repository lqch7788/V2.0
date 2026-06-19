<!--
  入库表格区域 - 从 WarehouseInbound.vue 提取
  原文件 L44-225 (~182 行模板)
  V2.0-PM-004 拆分第 6/6 阶段（最终）
  纯展示型子组件：所有 state 通过 props 传入，交互通过 emit 抛出
-->
<template>
  <div class="bg-white rounded-xl shadow-sm overflow-hidden">
    <!-- 表格顶部工具栏 -->
    <div class="p-4 border-b border-gray-100 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <h3 class="text-lg font-semibold text-gray-900">物料入库记录</h3>
        <template v-if="hasActiveMode">
          <button class="text-sm text-blue-600 hover:text-blue-800" @click="$emit('select-all')">
            {{ isAllSelected ? '全不选' : '全选' }}
          </button>
          <span class="text-sm text-gray-500">已选择 {{ selectedRows.length }} 项</span>
        </template>
      </div>

      <div class="flex items-center gap-2">
        <!-- 正常模式 -->
        <template v-if="!hasActiveMode">
          <button class="h-8 px-3 rounded-md text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 inline-flex items-center gap-1" @click="$emit('add-record')">
            <Plus class="w-4 h-4" />新增入库
          </button>
          <button class="h-8 px-3 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 inline-flex items-center gap-1" @click="$emit('enter-edit-mode')">
            <Edit class="w-4 h-4" />编辑
          </button>
          <button class="h-8 px-3 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700 inline-flex items-center gap-1" @click="$emit('enter-delete-mode')">
            <Trash2 class="w-4 h-4" />删除
          </button>
          <button class="h-8 px-3 rounded-md text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 inline-flex items-center gap-1" @click="$emit('enter-export-mode')">
            <Download class="w-4 h-4" />导出
          </button>
        </template>
        <!-- 模式按钮 -->
        <template v-else>
          <template v-if="editMode">
            <button class="h-8 px-3 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 inline-flex items-center gap-1" @click="$emit('confirm-edit')">
              <Edit2 class="w-4 h-4" />确认编辑{{ selectedRows.length ? ` (${selectedRows.length})` : '' }}
            </button>
            <button class="h-8 px-3 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 inline-flex items-center gap-1" @click="$emit('cancel-selection')">
              <X class="w-4 h-4" />取消
            </button>
          </template>
          <template v-if="deleteMode">
            <button class="h-8 px-3 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700 inline-flex items-center gap-1" @click="$emit('confirm-delete')">
              <Trash2 class="w-4 h-4" />确认删除{{ selectedRows.length ? ` (${selectedRows.length})` : '' }}
            </button>
            <button class="h-8 px-3 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 inline-flex items-center gap-1" @click="$emit('cancel-selection')">
              <X class="w-4 h-4" />取消
            </button>
          </template>
          <template v-if="exportMode">
            <button class="h-8 px-3 rounded-md text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 inline-flex items-center gap-1" @click="$emit('confirm-export')">
              <Download class="w-4 h-4" />确认导出{{ selectedRows.length ? ` (${selectedRows.length})` : '' }}
            </button>
            <button class="h-8 px-3 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 inline-flex items-center gap-1" @click="$emit('cancel-selection')">
              <X class="w-4 h-4" />取消选择
            </button>
          </template>
        </template>
      </div>
    </div>

    <!-- 表格主体 -->
    <div class="overflow-auto max-h-[calc(100vh-400px)]">
      <table class="w-full">
        <thead class="bg-gradient-to-r from-blue-500 to-blue-600 text-white sticky top-0 z-10">
          <tr>
            <th v-if="hasActiveMode" class="px-4 py-3 text-left text-sm font-semibold w-14 whitespace-nowrap">
              <input type="checkbox" :checked="isAllSelected" @change="$emit('select-all')" class="w-4 h-4 rounded border-white" />
            </th>
            <th class="px-4 py-3 text-left text-sm font-semibold w-12 whitespace-nowrap"></th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">入库单号</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">入库日期</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">供应商</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">操作员</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">物料数量</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">状态</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-300">
          <tr v-if="displayedRecords.length === 0">
            <td :colspan="hasActiveMode ? 8 : 7" class="px-4 py-8 text-center text-gray-500">暂无数据</td>
          </tr>
          <template v-for="row in displayedRecords" :key="row.id">
            <tr class="hover:bg-blue-100 transition-colors">
              <td v-if="hasActiveMode" class="px-4 py-3">
                <template v-if="deleteMode && row.status !== 'pending'">
                  <span class="text-gray-300 text-xs">—</span>
                </template>
                <template v-else>
                  <input type="checkbox" :checked="selectedRows.includes(row.id)" @change="$emit('toggle-row', row.id)" class="w-4 h-4 rounded border-gray-400" />
                </template>
              </td>
              <td class="px-4 py-3">
                <button class="p-1 hover:bg-gray-100 rounded" @click="$emit('toggle-expand', row.id)">
                  <ChevronDown v-if="expandedRows.has(row.id)" class="w-4 h-4 text-gray-500" />
                  <ChevronRight v-else class="w-4 h-4 text-gray-500" />
                </button>
              </td>
              <td class="px-4 py-3 text-sm whitespace-nowrap">
                <button class="text-blue-600 hover:text-blue-800 underline" @click="$emit('view-record', row)">{{ row.code }}</button>
              </td>
              <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.inboundDate }}</td>
              <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.supplier }}</td>
              <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.operator }}</td>
              <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.materials?.length || 0 }} 种物料</td>
              <td class="px-4 py-3 whitespace-nowrap">
                <span class="inline-flex px-2 py-1 rounded-full text-xs font-medium" :class="{
                  'bg-green-100 text-green-700': row.status === 'completed',
                  'bg-gray-100 text-gray-700': row.status === 'voided',
                  'bg-amber-100 text-amber-700': row.status === 'pending'
                }">
                  {{ getStatusText(row.status) }}
                </span>
              </td>
            </tr>
            <tr v-if="expandedRows.has(row.id)" :key="'exp-' + row.id" class="bg-gray-50">
              <td :colspan="hasActiveMode ? 8 : 7" class="p-4">
                <p class="font-medium text-gray-700 mb-2">物料明细：</p>
                <div class="overflow-x-auto rounded border">
                  <table class="w-full bg-white">
                    <thead class="bg-gray-100">
                      <tr>
                        <th class="px-2 py-2 text-left text-xs font-medium whitespace-nowrap">物料编码</th>
                        <th class="px-2 py-2 text-left text-xs font-medium whitespace-nowrap">物料名称</th>
                        <th class="px-2 py-2 text-left text-xs font-medium whitespace-nowrap">分类</th>
                        <th class="px-2 py-2 text-left text-xs font-medium whitespace-nowrap">规格</th>
                        <th class="px-2 py-2 text-left text-xs font-medium whitespace-nowrap">条形码</th>
                        <th class="px-2 py-2 text-left text-xs font-medium whitespace-nowrap">单位</th>
                        <th class="px-2 py-2 text-left text-xs font-medium whitespace-nowrap">数量</th>
                        <th class="px-2 py-2 text-left text-xs font-medium whitespace-nowrap">单价</th>
                        <th class="px-2 py-2 text-left text-xs font-medium whitespace-nowrap">供应商</th>
                        <th class="px-2 py-2 text-left text-xs font-medium whitespace-nowrap">存放位置</th>
                        <th class="px-2 py-2 text-left text-xs font-medium whitespace-nowrap">批号</th>
                        <th class="px-2 py-2 text-left text-xs font-medium whitespace-nowrap">生产日期</th>
                        <th class="px-2 py-2 text-left text-xs font-medium whitespace-nowrap">有效期至</th>
                        <th class="px-2 py-2 text-left text-xs font-medium whitespace-nowrap">备注</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-if="!row.materials || row.materials.length === 0">
                        <td colspan="14" class="px-3 py-4 text-center text-sm text-gray-500">暂无物料明细</td>
                      </tr>
                      <tr v-for="m in (row.materials || [])" :key="m.id || m.code" class="border-t">
                        <td class="px-2 py-2 text-xs text-blue-600 whitespace-nowrap">{{ m.code }}</td>
                        <td class="px-2 py-2 text-xs text-gray-900 whitespace-nowrap">{{ m.name }}</td>
                        <td class="px-2 py-2 text-xs text-gray-500 whitespace-nowrap">{{ m.category || '-' }}</td>
                        <td class="px-2 py-2 text-xs text-gray-500 whitespace-nowrap">{{ m.specification || '-' }}</td>
                        <td class="px-2 py-2 text-xs text-gray-500 whitespace-nowrap">{{ m.barcode || '-' }}</td>
                        <td class="px-2 py-2 text-xs text-gray-500 whitespace-nowrap">{{ m.unit }}</td>
                        <td class="px-2 py-2 text-xs text-gray-900 whitespace-nowrap">{{ m.quantity }}</td>
                        <td class="px-2 py-2 text-xs text-gray-900 whitespace-nowrap">{{ m.price }}元</td>
                        <td class="px-2 py-2 text-xs text-gray-500 whitespace-nowrap">{{ m.supplier || '-' }}</td>
                        <td class="px-2 py-2 text-xs text-gray-500 whitespace-nowrap">{{ m.location || '-' }}</td>
                        <td class="px-2 py-2 text-xs text-gray-500 whitespace-nowrap">{{ m.batchNo || '-' }}</td>
                        <td class="px-2 py-2 text-xs text-gray-500 whitespace-nowrap">{{ m.productionDate || '-' }}</td>
                        <td class="px-2 py-2 text-xs text-gray-500 whitespace-nowrap">{{ m.expiryDate || '-' }}</td>
                        <td class="px-2 py-2 text-xs text-gray-500 whitespace-nowrap">{{ m.remarks || '-' }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <!-- 分页器 -->
    <div class="px-4 py-3 border-t border-gray-100 flex justify-end">
      <el-pagination
        :current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        background
        @current-change="(page) => $emit('page-change', page)"
        @size-change="(size) => $emit('page-size-change', size)"
      />
    </div>
  </div>
</template>

<script setup>
import { Plus, Edit, Edit2, Trash2, Download, X, ChevronDown, ChevronRight } from 'lucide-vue-next'

defineProps({
  displayedRecords: { type: Array, required: true },
  expandedRows: { type: Set, required: true },
  selectedRows: { type: Array, required: true },
  hasActiveMode: { type: Boolean, default: false },
  editMode: { type: Boolean, default: false },
  deleteMode: { type: Boolean, default: false },
  exportMode: { type: Boolean, default: false },
  isAllSelected: { type: Boolean, default: false },
  currentPage: { type: Number, default: 1 },
  pageSize: { type: Number, default: 10 },
  total: { type: Number, default: 0 }
})

defineEmits([
  'add-record', 'enter-edit-mode', 'enter-delete-mode', 'enter-export-mode',
  'confirm-edit', 'confirm-delete', 'confirm-export', 'cancel-selection',
  'select-all', 'toggle-row', 'toggle-expand', 'view-record',
  'page-change', 'page-size-change'
])

const getStatusText = (status) => {
  const map = {
    pending: '待入库',
    completed: '已入库',
    voided: '已作废'
  }
  return map[status] || status
}
</script>
