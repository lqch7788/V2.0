<template>
  <!-- 批次汇总子页面 -->
  <div class="space-y-4">
    <!-- 筛选工具栏 -->
    <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div class="flex flex-wrap items-center gap-3">
        <el-select v-model="filterStatus" placeholder="批次状态" clearable size="default">
          <el-option label="全部" value="" />
          <el-option label="进行中" value="in_progress" />
          <el-option label="已完成" value="completed" />
          <el-option label="已逾期" value="overdue" />
        </el-select>
        <el-input v-model="searchKeyword" placeholder="搜索批次名称/编号" clearable style="width: 200px" />
        <el-button @click="loadData">搜索</el-button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="flex items-center justify-center h-64">
      <el-icon class="is-loading" :size="32" color="#10b981"><Loading /></el-icon>
    </div>

    <!-- 批次列表 -->
    <div v-else class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <el-table :data="filteredBatchItems" style="width: 100%">
        <el-table-column prop="batchCode" label="批次编号" min-width="120" />
        <el-table-column prop="batchName" label="批次名称" min-width="120" />
        <el-table-column prop="cropName" label="作物" min-width="80" />
        <el-table-column prop="greenhouse" label="温室" min-width="120" />
        <el-table-column prop="completionRate" label="完成率" min-width="100">
          <template #default="{ row }">
            <div class="flex items-center gap-2">
              <div class="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  :class="[
                    'h-full rounded-full',
                    row.completionRate >= 100 ? 'bg-emerald-500' :
                    row.completionRate >= 60 ? 'bg-blue-500' :
                    row.completionRate >= 30 ? 'bg-amber-500' : 'bg-red-400'
                  ]"
                  :style="{ width: `${Math.min(row.completionRate, 100)}%` }"
                />
              </div>
              <span class="text-sm">{{ row.completionRate }}%</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" min-width="100">
          <template #default="{ row }">
            <span
              :class="['text-xs px-2 py-0.5 rounded-full font-medium', STATUS_BADGE[row.status] || 'bg-gray-100 text-gray-500']"
            >
              {{ STATUS_LABEL[row.status] || row.status || '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="viewDetail(row)">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Loading } from '@element-plus/icons-vue'
import { useSummaryStore } from '@/stores/modules/summary'

const summaryStore = useSummaryStore()

const filterStatus = ref('')
const searchKeyword = ref('')

const batchItems = computed(() => summaryStore.batchItems)
const isLoading = computed(() => summaryStore.isLoading)

const filteredBatchItems = computed(() => {
  let items = batchItems.value
  if (filterStatus.value) {
    items = items.filter((item) => item.status === filterStatus.value)
  }
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    items = items.filter(
      (item) =>
        item.batchName?.toLowerCase().includes(keyword) ||
        item.batchCode?.toLowerCase().includes(keyword)
    )
  }
  return items
})

const STATUS_LABEL = {
  draft: '草稿',
  planning: '规划中',
  published: '已发布',
  in_progress: '进行中',
  completed: '已完成',
  overdue: '已逾期',
}

const STATUS_BADGE = {
  draft: 'bg-gray-100 text-gray-500',
  planning: 'bg-gray-100 text-gray-600',
  published: 'bg-blue-50 text-blue-500',
  in_progress: 'bg-blue-50 text-blue-600',
  completed: 'bg-emerald-50 text-emerald-600',
  overdue: 'bg-red-50 text-red-600',
}

const loadData = () => {
  summaryStore.fetchBatchStats({})
}

const viewDetail = (row) => {
  console.log('View batch detail:', row)
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.is-loading {
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
