<template>
  <div class="bg-white rounded-xl shadow-sm overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <tr>
            <th v-if="exportMode" class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap w-12">
              <input
                type="checkbox"
                :checked="selectedRows.length === filteredMaterials.length && filteredMaterials.length > 0"
                @change="onSelectAll"
                class="w-4 h-4 rounded border-gray-400 text-emerald-600 focus:ring-emerald-500"
              />
            </th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">物料编号</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">物料名称</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">分类</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">单位</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">库存数量</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">最低库存</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">单价</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">供应商</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">存放位置</th>
            <th v-if="!exportMode" class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-300">
          <tr v-for="item in paginatedMaterials" :key="item.id" class="hover:bg-blue-100 transition-colors">
            <td v-if="exportMode" class="px-4 py-3">
              <input
                type="checkbox"
                :checked="selectedRows.includes(item.id)"
                @change="() => onSelectRow(item.id)"
                class="w-4 h-4 rounded border-gray-400 text-emerald-600 focus:ring-emerald-500"
              />
            </td>
            <td class="px-4 py-3 text-sm font-medium text-gray-900">{{ item.code }}</td>
            <td class="px-4 py-3 text-sm text-gray-600">{{ item.name }}</td>
            <td class="px-4 py-3 text-sm text-gray-600">{{ item.category }}</td>
            <td class="px-4 py-3 text-sm text-gray-600">{{ item.unit }}</td>
            <td class="px-4 py-3 text-sm">
              <span :class="item.quantity < item.minStock ? 'text-red-600 font-medium' : 'text-gray-900'">
                {{ item.quantity }}
              </span>
            </td>
            <td class="px-4 py-3 text-sm text-gray-600">{{ item.minStock }}</td>
            <td class="px-4 py-3 text-sm text-gray-600">{{ item.price }}</td>
            <td class="px-4 py-3 text-sm text-gray-600">{{ item.supplier }}</td>
            <td class="px-4 py-3 text-sm text-gray-600">{{ item.location }}</td>
            <td v-if="!exportMode" class="px-4 py-3">
              <div class="flex items-center gap-1">
                <el-button text size="small" title="查看" @click="$emit('view', item)">
                  <el-icon><View /></el-icon>
                </el-button>
                <el-button text size="small" title="编辑" @click="$emit('edit', item)">
                  <el-icon><Edit /></el-icon>
                </el-button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 导出模式底部栏 -->
      <div v-if="exportMode && selectedRows.length > 0" class="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
        <div class="flex items-center gap-4">
          <el-button size="small" @click="onSelectAll">
            {{ selectedRows.length === filteredMaterials.length ? '全不选' : '全选' }}
          </el-button>
          <span class="text-sm text-gray-500">已选择 {{ selectedRows.length }} 项</span>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div class="px-4 py-3 border-t border-gray-100">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="filteredMaterials.length"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="onPageSizeChange"
        @current-change="onPageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { View, Edit } from '@element-plus/icons-vue'

const props = defineProps({
  filteredMaterials: {
    type: Array,
    default: () => []
  },
  currentPage: {
    type: Number,
    default: 1
  },
  pageSize: {
    type: Number,
    default: 20
  },
  exportMode: {
    type: Boolean,
    default: false
  },
  selectedRows: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['page-change', 'page-size-change', 'select-all', 'select-row', 'view', 'edit'])

const totalPages = computed(() => Math.ceil(props.filteredMaterials.length / props.pageSize) || 1)

const startIdx = computed(() => (props.currentPage - 1) * props.pageSize)
const endIdx = computed(() => Math.min(startIdx.value + props.pageSize, props.filteredMaterials.length))

const paginatedMaterials = computed(() => {
  return props.filteredMaterials.slice(startIdx.value, endIdx.value)
})

const onPageChange = (page) => {
  emit('page-change', page)
}

const onPageSizeChange = (size) => {
  emit('page-size-change', size)
}

const onSelectAll = () => {
  emit('select-all')
}

const onSelectRow = (id) => {
  emit('select-row', id)
}
</script>
