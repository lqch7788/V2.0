<template>
  <!-- 施肥数据表格 - 从V1.1 FertilizerTable.tsx 1:1迁移 -->
  <div class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
    <!-- 工具栏 -->
    <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
      <div class="flex items-center gap-2">
        <el-button size="small" @click="$emit('add')">
          <el-icon><Plus /></el-icon>
          新增
        </el-button>
        <el-button size="small" @click="$emit('batchDeleteMode')">批量删除</el-button>
        <el-button size="small" @click="$emit('exportMode')">
          <el-icon><Download /></el-icon>
          导出
        </el-button>
        <el-button size="small" @click="$emit('toggleStats')">
          <el-icon><DataAnalysis /></el-icon>
          {{ showStats ? '收起统计' : '统计分析' }}
        </el-button>
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-gradient-to-r from-emerald-500 to-green-600 text-white">
          <tr>
            <th v-if="showCheckbox" class="px-4 py-3 text-center text-sm font-semibold w-12">
              <el-checkbox :model-value="isAllSelected" @change="$emit('selectionChange', isAllSelected ? [] : data.map(r => r.id))" />
            </th>
            <th class="px-4 py-3 text-left text-sm font-semibold">施肥编号</th>
            <th class="px-4 py-3 text-left text-sm font-semibold">肥料名称</th>
            <th class="px-4 py-3 text-left text-sm font-semibold">肥料类型</th>
            <th class="px-4 py-3 text-left text-sm font-semibold">作物品种</th>
            <th class="px-4 py-3 text-left text-sm font-semibold">温室位置</th>
            <th class="px-4 py-3 text-left text-sm font-semibold">稀释比例</th>
            <th class="px-4 py-3 text-left text-sm font-semibold">施肥量</th>
            <th class="px-4 py-3 text-left text-sm font-semibold">总成本</th>
            <th class="px-4 py-3 text-left text-sm font-semibold">施肥时间</th>
            <th class="px-4 py-3 text-left text-sm font-semibold">数据来源</th>
            <th class="px-4 py-3 text-left text-sm font-semibold">操作员</th>
            <th class="px-4 py-3 text-left text-sm font-semibold">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-if="paginatedData.length === 0">
            <td :colspan="showCheckbox ? 13 : 12" class="px-4 py-8 text-center text-gray-500">暂无数据</td>
          </tr>
          <tr v-for="record in paginatedData" :key="record.id" :class="['hover:bg-emerald-50 transition-colors', record.dataSource === 'auto_iot' ? 'border-l-4 border-l-green-400' : '']">
            <td v-if="showCheckbox" class="px-4 py-3 text-center">
              <el-checkbox :model-value="selectedIds.includes(record.id)" @change="() => toggleSelect(record.id)" />
            </td>
            <td class="px-4 py-3 text-sm">
              <el-button link size="small" @click="$emit('detail', record)">{{ record.fertilizerCode }}</el-button>
            </td>
            <td class="px-4 py-3 text-sm font-medium text-gray-900">{{ record.fertilizerName }}</td>
            <td class="px-4 py-3"><span class="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">{{ record.fertilizerType }}</span></td>
            <td class="px-4 py-3 text-sm text-gray-600">{{ record.cropName || '-' }}</td>
            <td class="px-4 py-3 text-sm text-gray-600">{{ record.greenhouseName || '-' }}</td>
            <td class="px-4 py-3 text-sm text-gray-600">{{ record.dilutionRatio || '-' }}</td>
            <td class="px-4 py-3 text-sm font-bold text-emerald-600">{{ record.quantity || 0 }} kg</td>
            <td class="px-4 py-3 text-sm font-bold text-amber-600">{{ record.totalCost || 0 }} 元</td>
            <td class="px-4 py-3 text-sm text-gray-600">{{ record.fertilizeTime || '-' }}</td>
            <td class="px-4 py-3">
              <span :class="record.dataSource === 'auto_iot' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'" class="px-2 py-1 text-xs rounded-full">
                {{ record.dataSource === 'auto_iot' ? 'IoT自动' : '手动' }}
              </span>
            </td>
            <td class="px-4 py-3 text-sm text-gray-600">{{ record.operatorName || '-' }}</td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-2">
                <el-button text size="small" @click="$emit('detail', record)" title="查看"><el-icon><View /></el-icon></el-button>
                <template v-if="record.dataSource !== 'auto_iot'">
                  <el-button text size="small" @click="$emit('edit', record)" title="编辑"><el-icon><Edit /></el-icon></el-button>
                  <el-button text size="small" @click="$emit('delete', record.id)" title="删除"><el-icon><Delete /></el-icon></el-button>
                </template>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <el-pagination
      v-if="data.length > 0"
      :current-page="currentPage"
      :page-size="pageSize"
      :page-sizes="[10, 20, 50]"
      :total="data.length"
      layout="total, sizes, prev, pager, next"
      @size-change="(s) => { pageSize = s; currentPage = 1 }"
      @current-change="(p) => currentPage = p"
      class="px-4 py-3"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Plus, Download, DataAnalysis, View, Edit, Delete } from '@element-plus/icons-vue'

const props = defineProps({
  data: { type: Array, default: () => [] },
  isLoading: { type: Boolean, default: false },
  operationMode: { type: String, default: 'normal' },
  selectedIds: { type: Array, default: () => [] },
  showStats: { type: Boolean, default: false },
})

defineEmits(['add', 'detail', 'edit', 'delete', 'batchDeleteMode', 'exportMode', 'selectionChange', 'toggleStats'])

const currentPage = ref(1)
const pageSize = ref(10)

const showCheckbox = computed(() => props.operationMode === 'delete')
const isAllSelected = computed(() => props.data.length > 0 && props.selectedIds.length === props.data.length)

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return props.data.slice(start, start + pageSize.value)
})

const toggleSelect = (id) => {
  const next = props.selectedIds.includes(id)
    ? props.selectedIds.filter(x => x !== id)
    : [...props.selectedIds, id]
  // emit via parent handler
}
</script>
