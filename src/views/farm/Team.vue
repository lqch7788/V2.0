<template>
  <div class="space-y-4">
    <!-- 页面标题 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <div class="flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
            <el-icon :size="24" color="#fff"><User /></el-icon>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">班组分配</h1>
            <p class="text-gray-500">管理临时工班组分配</p>
          </div>
        </div>
        <el-button type="primary" size="small" @click="openCreateModal">
          <el-icon><Plus /></el-icon>
          新建班组
        </el-button>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex gap-4">
        <div class="flex-1 relative">
          <el-input
            v-model="filters.keyword"
            placeholder="搜索班组名称、负责人、作业区域..."
            clearable
            @input="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <p class="text-sm text-gray-500">班组数量</p>
        <p class="text-2xl font-bold text-gray-900 mt-1">{{ teams.length }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <p class="text-sm text-gray-500">总人数</p>
        <p class="text-2xl font-bold text-blue-600 mt-1">
          {{ teams.reduce((sum, team) => sum + team.memberCount, 0) }}
        </p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <p class="text-sm text-gray-500">未分配</p>
        <p class="text-2xl font-bold text-amber-600 mt-1">{{ unassignedWorkers.length }}</p>
      </div>
    </div>

    <!-- 班组列表 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div
        v-for="team in teams"
        :key="team.id"
        class="bg-white rounded-xl shadow-sm overflow-hidden"
      >
        <div class="p-4 border-b">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-semibold text-lg">{{ team.name }}</h3>
              <p class="text-sm text-gray-500">
                负责人: {{ team.leaderName }} · {{ team.workZone || '未设置区域' }}
              </p>
            </div>
            <div class="flex gap-2">
              <el-button text circle @click="openAssignModal(team)" title="分配工人">
                <el-icon><CirclePlus /></el-icon>
              </el-button>
              <el-button text circle @click="openEditModal(team)" title="编辑">
                <el-icon><Setting /></el-icon>
              </el-button>
              <el-button text circle @click="handleDelete(team)" title="删除">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
          <p v-if="team.description" class="text-sm text-gray-600 mt-2">{{ team.description }}</p>
        </div>
        <div class="p-4">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-gray-500">成员 ({{ team.memberCount }}人)</span>
          </div>
          <div v-if="team.memberCount > 0" class="flex flex-wrap gap-2">
            <span
              v-for="i in team.memberCount"
              :key="i"
              class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
            >
              成员{{ i }}
            </span>
          </div>
          <p v-else class="text-sm text-gray-400">暂无成员</p>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div class="bg-white px-4 py-3 border-t flex items-center justify-between">
      <div class="flex items-center gap-2 text-sm text-gray-500">
        <span>每页</span>
        <el-select
          v-model="pagination.pageSize"
          size="small"
          style="width: 100px"
          @change="handlePageSizeChange"
        >
          <el-option :value="10" label="10条" />
          <el-option :value="20" label="20条" />
          <el-option :value="50" label="50条" />
        </el-select>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-sm font-medium text-emerald-600">{{ pagination.currentPage }}</span>
        <el-button
          text
          :disabled="pagination.currentPage >= totalPages"
          @click="setPage(pagination.currentPage + 1)"
        >
          &gt;
        </el-button>
        <el-button
          text
          :disabled="pagination.currentPage >= totalPages"
          @click="setPage(totalPages)"
        >
          &gt;&gt;
        </el-button>
      </div>
    </div>

    <!-- 分配弹窗 -->
    <TeamAssignModal
      :is-open="isAssignModalOpen"
      :team="selectedTeam"
      :unassigned-workers="unassignedWorkers"
      :on-assign="handleAssign"
      :on-close="() => isAssignModalOpen = false"
    />

    <!-- 新建/编辑班组弹窗 -->
    <el-dialog
      v-model="isFormOpen"
      :title="editingTeam ? '编辑班组' : '新建班组'"
      width="500px"
      @close="handleFormClose"
    >
      <el-form :model="formData" label-width="80px" class="space-y-4">
        <el-form-item label="班组名称">
          <el-input v-model="formData.name" placeholder="请输入班组名称" />
        </el-form-item>
        <el-form-item label="负责人">
          <el-input v-model="formData.leaderName" placeholder="请输入负责人姓名" />
        </el-form-item>
        <el-form-item label="作业区域">
          <el-input v-model="formData.workZone" placeholder="请输入作业区域" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入描述"
          />
        </el-form-item>
      </el-form>
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
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, Plus, Search, CirclePlus, Setting, Delete } from '@element-plus/icons-vue'
import TeamAssignModal from '@/components/labor/team/TeamAssignModal.vue'
import { useTeamStore } from '@/stores/modules/team'

// Pinia store
const store = useTeamStore()

// ============ 模拟数据生成函数（种子数据） ============

// 模拟数据（与V1.1一致）
const generateTeams = () => [
  {
    id: 'team001',
    name: '收割组A',
    leaderId: 'w001',
    leaderName: '张三',
    memberIds: ['w002', 'w003', 'w004'],
    memberCount: 3,
    description: '负责番茄采收',
    workZone: '东区',
    createdAt: '2026-01-01',
    updatedAt: '2026-03-15',
  },
  {
    id: 'team002',
    name: '灌溉组B',
    leaderId: 'w005',
    leaderName: '李四',
    memberIds: ['w006', 'w007'],
    memberCount: 2,
    description: '负责灌溉系统操作',
    workZone: '西区',
    createdAt: '2026-01-01',
    updatedAt: '2026-03-10',
  },
  {
    id: 'team003',
    name: '运输组C',
    leaderId: 'w008',
    leaderName: '王五',
    memberIds: ['w009', 'w010', 'w011', 'w012'],
    memberCount: 4,
    description: '负责农产品运输',
    workZone: '全场区',
    createdAt: '2026-02-01',
    updatedAt: '2026-03-18',
  },
]

const generateUnassignedWorkers = () => [
  { id: 'uw001', name: '赵六', phone: '13900139001', skillTags: ['果蔬采收', '分级包装'], workerType: '临时工' },
  { id: 'uw002', name: '钱七', phone: '13900139002', skillTags: ['微喷灌溉', '滴灌操作'], workerType: '临时工' },
  { id: 'uw003', name: '孙八', phone: '13900139003', skillTags: ['拖拉机', '旋耕机'], workerType: '临时工' },
]

// ============ 状态 ============

// 从store映射数据，保持模板变量名不变
const allTeams = computed(() => store.teams)
const allUnassignedWorkers = computed(() => store.unassignedWorkers)
const filters = ref({ keyword: '' })
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0,
})

// 弹窗状态
const isAssignModalOpen = ref(false)
const selectedTeam = ref(null)
const isFormOpen = ref(false)
const editingTeam = ref(null)
const formData = ref({
  name: '',
  leaderName: '',
  description: '',
  workZone: '',
})

// 当前用户
const currentUser = { id: 'u001', name: '张明' }

// ============ 计算属性 ============

const filteredTeams = computed(() => {
  if (!filters.value.keyword) return allTeams.value
  const keyword = filters.value.keyword.toLowerCase()
  return allTeams.value.filter(team =>
    team.name.toLowerCase().includes(keyword) ||
    team.leaderName.toLowerCase().includes(keyword) ||
    team.workZone?.toLowerCase().includes(keyword)
  )
})

const teams = computed(() => {
  const start = (pagination.value.currentPage - 1) * pagination.value.pageSize
  const end = start + pagination.value.pageSize
  return filteredTeams.value.slice(start, end)
})

const unassignedWorkers = computed(() => allUnassignedWorkers.value)

const totalPages = computed(() => Math.ceil(filteredTeams.value.length / pagination.value.pageSize))

// ============ 方法 ============

const handleSearch = () => {
  pagination.value.currentPage = 1
  pagination.value.total = filteredTeams.value.length
}

const setPage = (page) => {
  pagination.value.currentPage = page
}

const handlePageSizeChange = () => {
  pagination.value.currentPage = 1
}

const openAssignModal = (team) => {
  selectedTeam.value = team
  isAssignModalOpen.value = true
}

const openCreateModal = () => {
  editingTeam.value = null
  formData.value = { name: '', leaderName: '', description: '', workZone: '' }
  isFormOpen.value = true
}

const openEditModal = (team) => {
  editingTeam.value = team
  formData.value = {
    name: team.name,
    leaderName: team.leaderName,
    description: team.description || '',
    workZone: team.workZone || '',
  }
  isFormOpen.value = true
}

// 分配工人 - 调用store.assignWorkers
const handleAssign = (teamId, workerIds) => {
  store.assignWorkers(teamId, workerIds)
  ElMessage.success('分配成功')
}

// 提交表单 - 调用store.addTeam 或 store.updateTeam
const handleSubmit = () => {
  if (editingTeam.value) {
    // 编辑班组
    store.updateTeam(editingTeam.value.id, formData.value)
    ElMessage.success('更新成功')
  } else {
    // 新建班组
    store.addTeam(formData.value)
    ElMessage.success('创建成功')
  }
  isFormOpen.value = false
}

// 删除班组 - 调用store.removeTeam
const handleDelete = async (team) => {
  try {
    await ElMessageBox.confirm(`确定删除班组 "${team.name}" 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    store.removeTeam(team.id)
    ElMessage.success('删除成功')
  } catch {
    // 用户取消
  }
}

const handleFormClose = () => {
  isFormOpen.value = false
  editingTeam.value = null
}

// ============ 初始化 ============

onMounted(() => {
  // 种子数据：写入store
  if (store.teams.length === 0) {
    generateTeams().forEach(team => store.teams.push(team))
    generateUnassignedWorkers().forEach(worker => store.unassignedWorkers.push(worker))
  }
  pagination.value.total = filteredTeams.value.length
})
</script>
