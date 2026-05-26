<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="bg-white rounded-xl p-6 shadow-none">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center gap-3">
          <router-link to="/system/authority" class="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center hover:from-gray-200 hover:to-gray-300 transition-colors">
            <el-icon :size="20" color="#4B5563"><ArrowLeft /></el-icon>
          </router-link>
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
            <el-icon :size="24" color="white"><UserFilled /></el-icon>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">班组管理</h1>
            <p class="text-gray-500">班组与班次信息管理</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex gap-1 bg-gray-100 p-1 rounded-lg">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        class="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all"
        :class="activeTab === tab.id ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
      >
        <el-icon :size="16">
          <component :is="tab.icon" />
        </el-icon>
        {{ tab.label }}
      </button>
    </div>

    <!-- 班组管理 TAB -->
    <div v-if="activeTab === 'teams'" class="space-y-4">
      <div class="flex justify-end">
        <el-button type="primary" @click="openAddTeamModal">
          <el-icon><Plus /></el-icon>
          新增班组
        </el-button>
      </div>
      <div class="grid gap-4">
        <div
          v-for="team in filteredTeams"
          :key="team.id"
          class="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
        >
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-emerald-50 rounded-lg">
                <el-icon :size="20" color="#059669">
                  <UserFilled />
                </el-icon>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900">{{ team.teamName }}</h3>
                <p class="text-xs text-gray-500">{{ team.teamCode }}</p>
              </div>
            </div>
            <span
              class="px-2 py-1 text-xs rounded-full"
              :class="team.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'"
            >
              {{ team.status === 'active' ? '启用' : '停用' }}
            </span>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
            <div>
              <p class="text-gray-500">班长</p>
              <p class="text-gray-900 font-medium">{{ team.leaderName || '-' }}</p>
            </div>
            <div>
              <p class="text-gray-500">部门</p>
              <p class="text-gray-900 font-medium">{{ team.departmentName || '-' }}</p>
            </div>
            <div>
              <p class="text-gray-500">成员数</p>
              <p class="text-gray-900 font-medium">{{ team.memberCount || 0 }}人</p>
            </div>
            <div>
              <p class="text-gray-500">创建时间</p>
              <p class="text-gray-900 font-medium">{{ formatDate(team.createdAt) }}</p>
            </div>
          </div>
          <p v-if="team.description" class="text-xs text-gray-500 mb-3">{{ team.description }}</p>
          <div class="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-gray-100">
            <el-button text @click="editTeam(team)">
              <el-icon color="#6B7280"><Edit /></el-icon>
            </el-button>
            <el-button text @click="handleDeleteTeam(team.id)">
              <el-icon color="#DC2626"><Delete /></el-icon>
            </el-button>
          </div>
        </div>
      </div>
      <!-- 无班组数据提示 -->
      <el-empty v-if="filteredTeams.length === 0" description="暂无班组数据" />
    </div>

    <!-- 班次管理 TAB -->
    <div v-if="activeTab === 'shifts'" class="space-y-4">
      <div class="flex justify-end">
        <el-button type="primary" @click="openAddShiftModal">
          <el-icon><Plus /></el-icon>
          新增班次
        </el-button>
      </div>
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">班次编码</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">班次名称</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">开始时间</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">结束时间</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">类型</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-if="shifts.length === 0">
              <td colspan="7" class="px-4 py-8 text-center text-gray-400">暂无班次数据</td>
            </tr>
            <tr
              v-for="shift in shifts"
              :key="shift.id"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-4 py-3 text-sm font-medium text-blue-600">{{ shift.shiftCode }}</td>
              <td class="px-4 py-3 text-sm text-gray-900 font-medium">{{ shift.shiftName }}</td>
              <td class="px-4 py-3 text-sm text-gray-700">{{ shift.startTime }}</td>
              <td class="px-4 py-3 text-sm text-gray-700">{{ shift.endTime }}</td>
              <td class="px-4 py-3">
                <span
                  class="px-2 py-1 text-xs font-medium rounded-full"
                  :class="shiftTypeColors[shift.shiftType || ''] || 'bg-gray-100 text-gray-600'"
                >
                  {{ shift.shiftType || '-' }}
                </span>
              </td>
              <td class="px-4 py-3">
                <span
                  class="px-2 py-1 text-xs font-medium rounded-full"
                  :class="shift.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'"
                >
                  {{ shift.status === 'active' ? '启用' : '停用' }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <el-button text @click="editShift(shift)">
                    <el-icon color="#6B7280"><Edit /></el-icon>
                  </el-button>
                  <el-button text @click="handleDeleteShift(shift.id)">
                    <el-icon color="#DC2626"><Delete /></el-icon>
                  </el-button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 班组编辑弹窗 -->
    <el-dialog
      v-model="showTeamModal"
      :title="editingTeam ? '编辑班组' : '新增班组'"
      width="580px"
      :close-on-click-modal="false"
    >
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">班组名称</label>
            <el-input v-model="teamForm.teamName" placeholder="请输入班组名称" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">班组编码</label>
            <el-input v-model="teamForm.teamCode" placeholder="请输入班组编码" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">班长</label>
            <el-input v-model="teamForm.leaderName" placeholder="请输入班长姓名" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">部门</label>
            <el-input v-model="teamForm.departmentOid" placeholder="请输入部门" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">班次类型</label>
            <el-input v-model="teamForm.shiftType" placeholder="如：早班/中班/晚班" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">成员数量</label>
            <el-input-number v-model="teamForm.memberCount" :min="0" class="w-full" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">描述</label>
          <el-input v-model="teamForm.description" type="textarea" :rows="2" placeholder="请输入描述" />
        </div>
      </div>
      <template #footer>
        <el-button @click="closeTeamModal">取消</el-button>
        <el-button type="primary" @click="handleSaveTeam">保存</el-button>
      </template>
    </el-dialog>

    <!-- 班次编辑弹窗 -->
    <el-dialog
      v-model="showShiftModal"
      :title="editingShift ? '编辑班次' : '新增班次'"
      width="500px"
      :close-on-click-modal="false"
    >
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">班次编码 *</label>
            <el-input v-model="shiftForm.shiftCode" placeholder="如：SH001" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">班次名称 *</label>
            <el-input v-model="shiftForm.shiftName" placeholder="如：早班" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">开始时间 *</label>
            <el-time-select
              v-model="shiftForm.startTime"
              placeholder="选择开始时间"
              class="w-full"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">结束时间 *</label>
            <el-time-select
              v-model="shiftForm.endTime"
              placeholder="选择结束时间"
              class="w-full"
            />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">班次类型</label>
            <el-select v-model="shiftForm.shiftType" class="w-full">
              <el-option value="早班" label="早班" />
              <el-option value="中班" label="中班" />
              <el-option value="晚班" label="晚班" />
            </el-select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">状态</label>
            <el-select v-model="shiftForm.status" class="w-full">
              <el-option value="active" label="启用" />
              <el-option value="inactive" label="停用" />
            </el-select>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">描述</label>
          <el-input v-model="shiftForm.description" type="textarea" :rows="2" placeholder="如：早班 06:00-14:00" />
        </div>
      </div>
      <template #footer>
        <el-button @click="closeShiftModal">取消</el-button>
        <el-button type="primary" @click="handleSaveShift">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { UserFilled, Plus, Edit, Delete, ArrowLeft, Clock } from '@element-plus/icons-vue'
import { getTeams, createTeam, updateTeam, deleteTeam, getShifts, createShift, updateShift, deleteShift } from '@/services/apiBasicDataService'

// ========== 班次类型颜色映射 ==========
const shiftTypeColors = {
  '早班': 'bg-yellow-100 text-yellow-700',
  '中班': 'bg-blue-100 text-blue-700',
  '晚班': 'bg-indigo-100 text-indigo-700',
}

// ========== 状态 ==========
const tabs = [
  { id: 'teams', label: '班组管理', icon: UserFilled },
  { id: 'shifts', label: '班次管理', icon: Clock },
]

const activeTab = ref('teams')
const searchTerm = ref('')
const teams = ref([])
const shifts = ref([])
const isLoading = ref(false)

// 班组弹窗状态
const showTeamModal = ref(false)
const editingTeam = ref(null)
const teamForm = ref({
  teamName: '',
  teamCode: '',
  leaderName: '',
  departmentOid: '',
  departmentName: '',
  shiftType: '',
  memberCount: 0,
  description: '',
  status: 'active',
})

// 班次弹窗状态
const showShiftModal = ref(false)
const editingShift = ref(null)
const shiftForm = ref({
  shiftCode: '',
  shiftName: '',
  startTime: '',
  endTime: '',
  shiftType: '早班',
  description: '',
  status: 'active',
})

// ========== 计算属性 ==========
/**
 * 筛选后的班组数据
 */
const filteredTeams = computed(() => {
  if (!searchTerm.value) return teams.value
  const term = searchTerm.value.toLowerCase()
  return teams.value.filter(t =>
    t.teamName?.toLowerCase().includes(term) ||
    t.teamCode?.toLowerCase().includes(term) ||
    t.leaderName?.toLowerCase().includes(term)
  )
})

// ========== 方法 ==========
/**
 * 格式化日期
 */
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return dateStr.split('T')[0]
}

/**
 * 加载班组数据
 */
const loadTeams = async () => {
  isLoading.value = true
  try {
    const data = await getTeams()
    teams.value = data || []
  } catch (error) {
    console.error('加载班组失败:', error)
    ElMessage.error('加载班组数据失败')
  } finally {
    isLoading.value = false
  }
}

/**
 * 加载班次数据
 */
const loadShifts = async () => {
  isLoading.value = true
  try {
    const data = await getShifts()
    shifts.value = data || []
  } catch (error) {
    console.error('加载班次失败:', error)
    ElMessage.error('加载班次数据失败')
  } finally {
    isLoading.value = false
  }
}

// 监听tab切换，加载班次数据
watch(activeTab, (newTab) => {
  if (newTab === 'shifts') {
    loadShifts()
  }
})

/**
 * 打开新增班组弹窗
 */
const openAddTeamModal = () => {
  editingTeam.value = null
  teamForm.value = {
    teamName: '',
    teamCode: '',
    leaderName: '',
    departmentOid: '',
    departmentName: '',
    shiftType: '',
    memberCount: 0,
    description: '',
    status: 'active',
  }
  showTeamModal.value = true
}

/**
 * 编辑班组
 */
const editTeam = (team) => {
  editingTeam.value = team
  teamForm.value = { ...team }
  showTeamModal.value = true
}

/**
 * 关闭班组弹窗
 */
const closeTeamModal = () => {
  showTeamModal.value = false
  editingTeam.value = null
}

/**
 * 保存班组
 */
const handleSaveTeam = async () => {
  if (!teamForm.value.teamName || !teamForm.value.teamCode) {
    ElMessage.warning('请填写班组名称和编码')
    return
  }

  try {
    if (editingTeam.value) {
      // 编辑模式
      await updateTeam(editingTeam.value.id, {
        teamName: teamForm.value.teamName,
        teamCode: teamForm.value.teamCode,
        leaderName: teamForm.value.leaderName,
        departmentOid: teamForm.value.departmentOid,
        departmentName: teamForm.value.departmentName,
        shiftType: teamForm.value.shiftType,
        memberCount: teamForm.value.memberCount,
        description: teamForm.value.description,
        status: teamForm.value.status,
      })
    } else {
      // 新增模式
      await createTeam({
        teamName: teamForm.value.teamName,
        teamCode: teamForm.value.teamCode,
        leaderName: teamForm.value.leaderName,
        departmentOid: teamForm.value.departmentOid,
        departmentName: teamForm.value.departmentName,
        shiftType: teamForm.value.shiftType,
        memberCount: teamForm.value.memberCount,
        description: teamForm.value.description,
        status: teamForm.value.status,
      })
    }
    closeTeamModal()
    loadTeams()
  } catch (error) {
    console.error('保存班组失败:', error)
    ElMessage.error('保存失败')
  }
}

/**
 * 删除班组
 */
const handleDeleteTeam = async (id) => {
  try {
    await ElMessageBox.confirm('确定删除该班组吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return // 用户取消
  }
  try {
    await deleteTeam(id)
    teams.value = teams.value.filter(t => t.id !== id)
  } catch (error) {
    console.error('删除班组失败:', error)
    ElMessage.error('删除失败')
  }
}

/**
 * 打开新增班次弹窗
 */
const openAddShiftModal = () => {
  editingShift.value = null
  shiftForm.value = {
    shiftCode: '',
    shiftName: '',
    startTime: '',
    endTime: '',
    shiftType: '早班',
    description: '',
    status: 'active',
  }
  showShiftModal.value = true
}

/**
 * 编辑班次
 */
const editShift = (shift) => {
  editingShift.value = shift
  shiftForm.value = { ...shift }
  showShiftModal.value = true
}

/**
 * 关闭班次弹窗
 */
const closeShiftModal = () => {
  showShiftModal.value = false
  editingShift.value = null
}

/**
 * 保存班次
 */
const handleSaveShift = async () => {
  if (!shiftForm.value.shiftName || !shiftForm.value.shiftCode || !shiftForm.value.startTime || !shiftForm.value.endTime) {
    ElMessage.warning('请填写班次编码、名称、开始时间和结束时间')
    return
  }

  try {
    if (editingShift.value) {
      // 编辑模式
      await updateShift(editingShift.value.id, {
        shiftCode: shiftForm.value.shiftCode,
        shiftName: shiftForm.value.shiftName,
        startTime: shiftForm.value.startTime,
        endTime: shiftForm.value.endTime,
        shiftType: shiftForm.value.shiftType,
        description: shiftForm.value.description,
        status: shiftForm.value.status,
      })
    } else {
      // 新增模式
      await createShift({
        shiftCode: shiftForm.value.shiftCode,
        shiftName: shiftForm.value.shiftName,
        startTime: shiftForm.value.startTime,
        endTime: shiftForm.value.endTime,
        shiftType: shiftForm.value.shiftType,
        description: shiftForm.value.description,
        status: shiftForm.value.status,
      })
    }
    closeShiftModal()
    loadShifts()
  } catch (error) {
    console.error('保存班次失败:', error)
    ElMessage.error('保存失败')
  }
}

/**
 * 删除班次
 */
const handleDeleteShift = async (id) => {
  try {
    await ElMessageBox.confirm('确定删除该班次吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return // 用户取消
  }
  try {
    await deleteShift(id)
    shifts.value = shifts.value.filter(s => s.id !== id)
  } catch (error) {
    console.error('删除班次失败:', error)
    ElMessage.error('删除失败')
  }
}

// ========== 生命周期 ==========
onMounted(() => {
  loadTeams()
})
</script>
