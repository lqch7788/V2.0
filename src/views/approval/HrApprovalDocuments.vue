<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <div class="flex items-center gap-3">
        <el-button text @click="$router.push('/settings/personnel')">
          <el-icon :size="24" class="text-gray-600"><ArrowLeft /></el-icon>
        </el-button>
        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
          <el-icon :size="24" class="text-white"><Clock /></el-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">考勤单据</h1>
          <p class="text-gray-500">考勤异常单据与补录申请</p>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
            <el-icon :size="20" class="text-amber-600"><Clock /></el-icon>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ stats.pending }}</p>
            <p class="text-xs text-gray-500">待审核</p>
          </div>
        </div>
      </div>
      <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
            <el-icon :size="20" class="text-green-600"><CircleCheck /></el-icon>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ stats.approved }}</p>
            <p class="text-xs text-gray-500">已通过</p>
          </div>
        </div>
      </div>
      <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
            <el-icon :size="20" class="text-red-600"><CircleClose /></el-icon>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ stats.rejected }}</p>
            <p class="text-xs text-gray-500">已拒绝</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选工具栏 -->
    <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm">
      <div class="flex flex-wrap gap-4 items-end">
        <div class="min-w-[150px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">单据类型</label>
          <el-select v-model="typeFilter" placeholder="全部" style="width: 100%">
            <el-option label="全部" value="全部" />
            <el-option label="补签卡" value="补签卡" />
            <el-option label="请假单" value="请假单" />
            <el-option label="加班单" value="加班单" />
            <el-option label="出差单" value="出差单" />
          </el-select>
        </div>
        <div class="min-w-[150px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">状态</label>
          <el-select v-model="statusFilter" placeholder="全部" style="width: 100%">
            <el-option label="全部" value="全部" />
            <el-option label="待审核" value="待审核" />
            <el-option label="已通过" value="已通过" />
            <el-option label="已拒绝" value="已拒绝" />
          </el-select>
        </div>
        <div class="flex gap-2">
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增单据
          </el-button>
        </div>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="p-4 border-b border-gray-100">
        <h3 class="text-lg font-semibold text-gray-900">考勤单据列表</h3>
      </div>
      <div class="overflow-x-auto">
        <el-table
          :data="paginatedData"
          style="width: 100%"
        >
          <el-table-column prop="code" label="单据编号" min-width="140" />
          <el-table-column prop="type" label="单据类型" min-width="100" />
          <el-table-column prop="applicant" label="申请人" min-width="100" />
          <el-table-column prop="dept" label="所属部门" min-width="100" />
          <el-table-column prop="applyDate" label="申请日期" min-width="120" />
          <el-table-column prop="targetTime" label="补录时间" min-width="150" />
          <el-table-column prop="reason" label="补录原因" min-width="150">
            <template #default="{ row }">
              <span class="text-gray-600 truncate block max-w-[150px]" :title="row.reason">{{ row.reason }}</span>
            </template>
          </el-table-column>
          <el-table-column label="审批状态" min-width="100">
            <template #default="{ row }">
              <span
                class="inline-flex px-2 py-1 rounded-full text-xs font-medium"
                :class="{
                  'bg-green-100 text-green-700': row.statusClass === 'success',
                  'bg-red-100 text-red-700': row.statusClass === 'danger',
                  'bg-amber-100 text-amber-700': row.statusClass === 'pending'
                }"
              >
                {{ row.status }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="操作" min-width="100">
            <template #default>
              <div class="flex items-center gap-1">
                <el-button size="small" text title="编辑">
                  <el-icon><Edit /></el-icon>
                </el-button>
                <el-button size="small" text title="查看">
                  <el-icon><View /></el-icon>
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页 -->
      <div class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
        <div class="text-sm text-gray-500">共 {{ filteredData.length }} 条记录</div>
        <div class="flex items-center gap-3">
          <span class="text-sm text-gray-500">每页</span>
          <el-select v-model="pageSize" @change="currentPage = 1" style="width: 80px">
            <el-option :value="5" label="5" />
            <el-option :value="10" label="10" />
            <el-option :value="20" label="20" />
            <el-option :value="50" label="50" />
          </el-select>
          <span class="text-sm text-gray-500">条</span>
          <el-pagination
            v-model:current-page="currentPage"
            :page-size="pageSize"
            :total="filteredData.length"
            layout="prev, pager, next"
            background
            small
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import {
  ArrowLeft,
  Clock,
  CircleCheck,
  CircleClose,
  Search,
  Plus,
  Edit,
  View
} from '@element-plus/icons-vue'

// 考勤单据模拟数据（与V1.1完全一致）
const hrDocuments = ref([
  { id: 1, code: 'DOC20240315', type: '补签卡', applicant: '李明', dept: '生产部', applyDate: '2024-03-15', targetTime: '2024-03-15 08:15', reason: '上班途中遇到交通事故', status: '待审核', statusClass: 'pending' },
  { id: 2, code: 'DOC20240314', type: '请假单', applicant: '张伟', dept: '生产部', applyDate: '2024-03-14', targetTime: '2024-03-18至2024-03-20', reason: '家中急事需要处理', status: '已通过', statusClass: 'success' },
  { id: 3, code: 'DOC20240313', type: '加班单', applicant: '王建', dept: '技术部', applyDate: '2024-03-13', targetTime: '2024-03-14 18:00-21:00', reason: '完成技术方案文档', status: '已通过', statusClass: 'success' },
  { id: 4, code: 'DOC20240312', type: '出差单', applicant: '赵俊', dept: '技术部', applyDate: '2024-03-12', targetTime: '2024-03-20至2024-03-22', reason: '参加农业技术交流会', status: '已拒绝', statusClass: 'danger' },
  { id: 5, code: 'DOC20240311', type: '补签卡', applicant: '钱文', dept: '生产部', applyDate: '2024-03-11', targetTime: '2024-03-11 09:00', reason: '突发身体不适迟到', status: '已通过', statusClass: 'success' },
])

// 筛选
const typeFilter = ref('全部')
const statusFilter = ref('全部')

// 分页
const currentPage = ref(1)
const pageSize = ref(5)

// 统计数据
const stats = computed(() => {
  const all = hrDocuments.value
  return {
    pending: all.filter(d => d.status === '待审核').length,
    approved: all.filter(d => d.status === '已通过').length,
    rejected: all.filter(d => d.status === '已拒绝').length
  }
})

// 筛选后的数据
const filteredData = computed(() => {
  return hrDocuments.value.filter(doc => {
    const matchType = typeFilter.value === '全部' || doc.type === typeFilter.value
    const matchStatus = statusFilter.value === '全部' || doc.status === statusFilter.value
    return matchType && matchStatus
  })
})

// 分页数据
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredData.value.slice(start, start + pageSize.value)
})

// 搜索
const handleSearch = () => {
  currentPage.value = 1
}

// 新增单据
const handleAdd = () => {
  // TODO: 待实现
}
</script>
