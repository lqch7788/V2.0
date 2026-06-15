<template>
  <div class="space-y-4">
    <!-- 页面标题 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
          <el-icon :size="20" color="#fff"><User /></el-icon>
        </div>
        <div>
          <h1 class="text-xl font-bold text-gray-900">班组分配</h1>
          <p class="text-sm text-gray-500">管理临时工班组分配</p>
        </div>
      </div>
    </div>

    <!-- 加载状态（与V1.1 isLoading 对齐） -->
    <div v-if="store.loading" class="bg-white rounded-xl p-8 shadow-sm text-center text-gray-500">
      加载中...
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
      <div class="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
            <el-icon :size="16" class="text-emerald-600"><User /></el-icon>
          </div>
          <div>
            <p class="text-xs text-gray-500">班组数量</p>
            <p class="text-lg font-bold text-gray-800">{{ store.teams.length }}</p>
          </div>
        </div>
      </div>
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
            <el-icon :size="16" class="text-blue-600"><User /></el-icon>
          </div>
          <div>
            <p class="text-xs text-gray-500">总人数</p>
            <p class="text-lg font-bold text-gray-800">{{ store.totalMembers }}</p>
          </div>
        </div>
      </div>
      <div class="bg-amber-50 border border-amber-200 rounded-lg p-3">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
            <el-icon :size="16" class="text-amber-600"><UserFilled /></el-icon>
          </div>
          <div>
            <p class="text-xs text-gray-500">未分配</p>
            <p class="text-lg font-bold text-gray-800">{{ store.unassignedWorkers.length }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选栏 - 3字段搜索（与V1.1一致） -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center gap-4 flex-wrap">
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500 whitespace-nowrap">班组名称:</span>
          <el-input v-model="filters.name" placeholder="请输入" size="small" style="width: 140px" clearable />
        </div>
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500 whitespace-nowrap">负责人</span>
          <el-input v-model="filters.leaderName" placeholder="请输入" size="small" style="width: 140px" clearable />
        </div>
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500 whitespace-nowrap">作业区域:</span>
          <el-input v-model="filters.workZone" placeholder="请输入" size="small" style="width: 140px" clearable />
        </div>
        <div class="flex gap-2 ml-auto">
          <el-button size="small" type="warning" plain @click="handleReset">重置</el-button>
          <el-button size="small" type="primary" @click="handleSearch">搜索</el-button>
        </div>
      </div>
    </div>

    <!-- 班组列表表格 -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <!-- 表格标题栏 -->
      <div class="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900">班组分配记录表</h3>
        <div class="flex gap-2">
          <template v-if="exportMode">
            <el-button size="small" type="success" :disabled="selectedRows.length === 0" @click="handleBatchExportClick">
              <el-icon><Download /></el-icon>
              确认导出{{ selectedRows.length > 0 ? ` (${selectedRows.length})` : '' }}
            </el-button>
            <el-button size="small" @click="handleCancelBatch">取消</el-button>
          </template>
          <template v-else-if="batchDeleteMode">
            <el-button size="small" type="danger" :disabled="selectedRows.length === 0" @click="handleBatchDelete">
              <el-icon><Delete /></el-icon>
              确认删除{{ selectedRows.length > 0 ? ` (${selectedRows.length})` : '' }}
            </el-button>
            <el-button size="small" @click="handleCancelBatch">取消</el-button>
          </template>
          <template v-else>
            <el-button v-if="canExport" size="small" @click="exportMode = true">
              <el-icon><Download /></el-icon>
              批量导出
            </el-button>
            <el-button v-if="canDelete" size="small" type="danger" @click="batchDeleteMode = true">
              <el-icon><Delete /></el-icon>
              批量删除
            </el-button>
            <el-button v-if="canCreate" size="small" type="primary" @click="openCreateModal">
              <el-icon><Plus /></el-icon>
              新建班组
            </el-button>
          </template>
        </div>
      </div>

      <div class="overflow-x-auto">
        <el-table
          :data="paginatedTeams"
          style="width: 100%"
          :header-cell-style="tableHeaderCellStyle"
          :row-class-name="tableRowClassName"
          highlight-current-row
          @selection-change="handleSelectionChange"
        >
          <el-table-column
            v-if="batchDeleteMode || exportMode"
            type="selection"
            width="50"
          />
          <el-table-column label="班组名称" min-width="120">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="openDetailModal(row)">
                {{ row.name }}
              </el-button>
            </template>
          </el-table-column>
          <el-table-column prop="leaderName" label="负责人" width="100" />
          <el-table-column label="作业区域" width="100">
            <template #default="{ row }">
              {{ row.workZone || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="成员数量" width="100">
            <template #default="{ row }">
              <span class="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                {{ row.memberCount }}人</span>
            </template>
          </el-table-column>
          <el-table-column label="描述" min-width="120">
            <template #default="{ row }">
              <!-- P1-3 修复：与 V1.1 TeamTable.tsx L384 max-w-xs truncate 1:1 对齐 -->
              <span class="text-sm text-gray-500 max-w-[120px] truncate inline-block align-middle">{{ row.description || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" fixed="right">
            <template #default="{ row }">
              <div class="flex items-center gap-1">
                <el-button text circle @click="openDetailModal(row)" title="查看详情">
                  <el-icon><View /></el-icon>
                </el-button>
                <el-button v-if="canEdit" text circle @click="openAssignModal(row)" title="分配工人">
                  <el-icon><CirclePlus /></el-icon>
                </el-button>
                <el-button v-if="canEdit" text circle @click="openEditModal(row)" title="编辑">
                  <el-icon><Edit /></el-icon>
                </el-button>
                <el-button v-if="canDelete" text circle @click="handleDelete(row)" title="删除">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 空数据 -->
      <div v-if="filteredTeams.length === 0" class="px-4 py-8 text-center text-gray-500">
        暂无数据
      </div>

      <!-- 分页 -->
      <div class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
        <div class="text-sm text-gray-500">
          共 {{ filteredTeams.length }} 条记录</div>
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50]"
          :total="filteredTeams.length"
          layout="sizes, prev, pager, next"
        />
      </div>
    </div>

    <!-- 分配弹窗 -->
    <TeamAssignModal
      :is-open="isAssignModalOpen"
      :team="selectedTeam"
      :unassigned-workers="store.unassignedWorkers"
      :on-assign="handleAssign"
      :on-close="() => isAssignModalOpen = false"
      :current-user="currentUser"
    />

    <!-- 班组详情弹窗 -->
    <TeamDetailModal
      :open="isDetailModalOpen"
      :team="detailTeam"
      @close="isDetailModalOpen = false"
    />

    <!-- 新建/编辑班组弹窗 -->
    <el-dialog
      v-model="isFormOpen"
      :title="editingTeam ? '编辑班组' : '新建班组'"
      width="500px"
      @close="handleFormClose"
    >
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">班组名称</label>
          <el-input v-model="formData.name" placeholder="请输入班组名称" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">负责人</label>
          <el-input v-model="formData.leaderName" placeholder="请输入负责人姓名" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">作业区域</label>
          <el-input v-model="formData.workZone" placeholder="请输入作业区域" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">描述</label>
          <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="请输入描述" />
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-3">
          <el-button @click="isFormOpen = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, UserFilled, Plus, CirclePlus, Edit, Delete, View, Download } from '@element-plus/icons-vue'
import TeamAssignModal from '@/components/labor/team/TeamAssignModal.vue'
import TeamDetailModal from '@/components/labor/team/TeamDetailModal.vue'
import { useTeamStore } from '@/stores/modules/team'

// ============ Props（与V1.1 TeamTableProps 1:1 对齐） ============
const props = defineProps({
  onBack: { type: Function, default: null },
  canCreate: { type: Boolean, default: true },
  canEdit: { type: Boolean, default: true },
  canDelete: { type: Boolean, default: true },
  canExport: { type: Boolean, default: true },
})

const store = useTeamStore()

// ============ 当前用户（与V1.1 L71 currentUser 1:1 对齐） ============
const currentUser = JSON.parse(localStorage.getItem('user') || '{}')

// ============ 筛选（3字段，与V1.1一致） ============
const filters = reactive({ name: '', leaderName: '', workZone: '' })

// ============ 分页 ============
const pagination = reactive({ currentPage: 1, pageSize: 10 })

// ============ 批量操作（与V1.1 L54-56 1:1 对齐：selectedRows/exportMode/batchDeleteMode） ============
const batchDeleteMode = ref(false)
const exportMode = ref(false)
const selectedRows = ref([])

// ============ 弹窗 ============
const isAssignModalOpen = ref(false)
const selectedTeam = ref(null)
const isDetailModalOpen = ref(false)
const detailTeam = ref(null)
const isFormOpen = ref(false)
const editingTeam = ref(null)
const formData = reactive({ name: '', leaderName: '', description: '', workZone: '' })

// ============ 计算属性 ============
const filteredTeams = computed(() => {
  return store.teams.filter(team => {
    if (filters.name && !team.name.toLowerCase().includes(filters.name.toLowerCase())) return false
    if (filters.leaderName && !team.leaderName.toLowerCase().includes(filters.leaderName.toLowerCase())) return false
    if (filters.workZone && !(team.workZone || '').toLowerCase().includes(filters.workZone.toLowerCase())) return false
    return true
  })
})

// 与 V1.1 useTeam L70-75 paginatedTeams 1:1 对齐：分页切片
const paginatedTeams = computed(() => {
  const start = (pagination.currentPage - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  return filteredTeams.value.slice(start, end)
})

// ============ 方法 ============
const handleSearch = () => { pagination.currentPage = 1 }
const handleReset = () => {
  Object.assign(filters, { name: '', leaderName: '', workZone: '' })
  pagination.currentPage = 1
}

const handleSelectionChange = (selection) => {
  selectedRows.value = selection.map(s => s.id)
}

const handleBatchDelete = async () => {
  if (selectedRows.value.length === 0) { ElMessage.warning('请先选择要删除的班组'); return }
  try {
    await ElMessageBox.confirm(`确定删除选中的 ${selectedRows.value.length} 个班组吗？`, '提示', {
      confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning',
    })
    selectedRows.value.forEach(id => store.removeTeam(id))
    ElMessage.success('批量删除成功')
    handleCancelBatch()
  } catch { /* 取消 */ }
}

const handleCancelBatch = () => {
  batchDeleteMode.value = false
  exportMode.value = false
  selectedRows.value = []
}

// ============ 批量导出（与V1.1 exportMode 1:1 对齐） ============
const handleBatchExportClick = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要导出的班组')
    return
  }
  try {
    await ElMessageBox.confirm(`确定导出选中的 ${selectedRows.value.length} 个班组吗？`, '提示', {
      confirmButtonText: '确定', cancelButtonText: '取消', type: 'info',
    })
    const headers = ['班组名称', '负责人', '作业区域', '成员数量', '描述']
    const rows = store.teams.filter(t => selectedRows.value.includes(t.id))
    const csv = [headers.join(','), ...rows.map(r => headers.map(h => `"${(r as any)[h === '班组名称' ? 'name' : h === '负责人' ? 'leaderName' : h === '作业区域' ? 'workZone' : h === '成员数量' ? 'memberCount' : 'description'] || ''}"`).join(','))].join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `班组记录_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
    handleCancelBatch()
  } catch { /* 取消 */ }
}

const openAssignModal = (team) => {
  selectedTeam.value = team
  isAssignModalOpen.value = true
}

const openDetailModal = (team) => {
  detailTeam.value = team
  isDetailModalOpen.value = true
}

const openCreateModal = () => {
  editingTeam.value = null
  Object.assign(formData, { name: '', leaderName: '', description: '', workZone: '' })
  isFormOpen.value = true
}

const openEditModal = (team) => {
  editingTeam.value = team
  Object.assign(formData, {
    name: team.name,
    leaderName: team.leaderName,
    description: team.description || '',
    workZone: team.workZone || '',
  })
  isFormOpen.value = true
}

const handleAssign = (teamId, workerIds) => {
  // 与V1.1 L105-107 1:1 对齐：传 operatorId/operatorName
  const operatorId = currentUser.id || currentUser.userId || 'system'
  const operatorName = currentUser.name || currentUser.username || '系统'
  store.assignWorkers(teamId, workerIds, operatorId, operatorName)
  ElMessage.success('分配成功')
}

const handleSubmit = () => {
  if (editingTeam.value) {
    store.updateTeam(editingTeam.value.id, { ...formData })
    ElMessage.success('更新成功')
  } else {
    // P1-4 修复：与 V1.1 TeamTable.tsx L116-122 1:1 对齐
    // V1.1 create 传 leaderId: 'new'，V2.0 之前传空(formData无此字段)
    store.addTeam({ ...formData, leaderId: 'new' })
    ElMessage.success('创建成功')
  }
  isFormOpen.value = false
}

const handleDelete = async (team) => {
  try {
    await ElMessageBox.confirm(`确定删除班组 "${team.name}" 吗？`, '提示', {
      confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning',
    })
    store.removeTeam(team.id)
    ElMessage.success('删除成功')
  } catch { /* 取消 */ }
}

const handleFormClose = () => {
  isFormOpen.value = false
  editingTeam.value = null
}

// ============ 与 V1.1 L16-22 1:1 对齐：数据兼容工具 ============
// 规范化记录（兼容 snake_case 和 camelCase）
function normalizeRecord(record) {
  if (!record) return record
  return {
    ...record,
    staffName: record.staffName || record.staff_name || '',
    workZone: record.workZone || record.work_zone || '',
  }
}

// 获取规范名称
function getStaffName(record) {
  return record.staffName || record.staff_name || '-'
}

function getWorkZone(record) {
  return record.workZone || record.work_zone || '-'
}

// ============ 初始化 ============
onMounted(() => {
  store.initSeedData()
  // P1-2 修复：与 V1.1 TeamTable.tsx L353 hover:bg-emerald-50 1:1 对齐
  // el-table 默认 hover 颜色为浅蓝色 (--el-table-row-hover-bg-color)
  // 通过注入全局样式覆盖为翠绿浅色 #ecfdf5 (Tailwind emerald-50)
  if (!document.getElementById('team-table-hover-style')) {
    const style = document.createElement('style')
    style.id = 'team-table-hover-style'
    style.textContent = `
      .el-table__body tr.el-table__row:hover > td.el-table__cell {
        background-color: #ecfdf5 !important;
        transition: background-color 0.2s ease;
      }
    `
    document.head.appendChild(style)
  }
})

// ============ P1-1 修复：与 V1.1 TeamTable.tsx L325 thead 1:1 对齐：蓝渐变表头 ============
// V1.1: <thead className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
const tableHeaderCellStyle = () => {
  return {
    background: 'linear-gradient(to right, #3b82f6, #2563eb)',
    color: '#ffffff',
    fontWeight: '600',
    borderBottom: 'none',
  }
}

// ============ P1-2 修复：与 V1.1 TeamTable.tsx L353 hover:bg-emerald-50 1:1 对齐 ============
// V1.1: <tr key={team.id} className="hover:bg-emerald-50 transition-colors">
// el-table 默认有 hover 效果但颜色是浅蓝色，通过 cell-style + 注入全局样式覆盖
const tableRowClassName = ({ rowIndex }) => {
  return `team-row-hover-${rowIndex}`
}
</script>
