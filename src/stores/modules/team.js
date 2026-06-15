/**
 * 班组分配 Store
 * 从 V1.1 useTeamManageStore.ts 1:1 迁移
 * 班组数据保存到 localStorage，刷新页面不丢失
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from '@/composables/useLocalStorage'
// 与V1.1 useTeamManageStore.ts L11-13 1:1对齐：导入API客户端
import { assignTeamMembers } from '@/api/labor'

// ========== 与 V1.1 useTeamManageStore.ts L16-32 1:1 对齐：工人 ID→姓名映射 ==========
const WORKER_NAMES = {
  'w001': '张三',
  'w002': '李四',
  'w003': '王五',
  'w004': '赵六',
  'w005': '孙七',
  'w006': '周八',
  'w007': '吴九',
  'w008': '郑十',
  'w009': '冯十一',
  'w010': '陈十二',
  'w011': '楚十三',
  'w012': '褚十四',
  'w013': '卫十五',
  'w014': '蒋十六',
  'w015': '沈十七',
}

// 初始种子数据（与 V1.1 useTeamManageStore.ts L68-89 1:1 对齐）
const INITIAL_TEAMS = [
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

const INITIAL_UNASSIGNED = [
  { id: 'uw001', name: '赵六', phone: '13900139001', skillTags: ['果蔬采收', '分级包装'], workerType: '临时工' },
  { id: 'uw002', name: '钱七', phone: '13900139002', skillTags: ['微喷灌溉', '滴灌操作'], workerType: '临时工' },
  { id: 'uw003', name: '孙八', phone: '13900139003', skillTags: ['拖拉机', '旋耕机'], workerType: '临时工' },
]

let nextTeamId = 100

export const useTeamStore = defineStore('team', () => {
  // 从 localStorage 加载，首次使用种子数据
  const teams = ref(loadFromStorage(STORAGE_KEYS.TEAMS, INITIAL_TEAMS))
  const unassignedWorkers = ref(loadFromStorage(STORAGE_KEYS.UNASSIGNED_WORKERS, INITIAL_UNASSIGNED))
  const loading = ref(false)

  function persist() {
    saveToStorage(STORAGE_KEYS.TEAMS, teams.value)
    saveToStorage(STORAGE_KEYS.UNASSIGNED_WORKERS, unassignedWorkers.value)
  }

  const totalMembers = computed(() =>
    teams.value.reduce((sum, t) => sum + (t.memberCount || 0), 0)
  )

  // 初始化种子数据
  function initSeedData() {
    if (teams.value.length === 0) {
      teams.value = [...INITIAL_TEAMS]
    }
    if (unassignedWorkers.value.length === 0) {
      unassignedWorkers.value = [...INITIAL_UNASSIGNED]
    }
    persist()
  }

  function addTeam(data) {
    const team = {
      id: `team${nextTeamId++}`,
      name: data.name,
      leaderId: data.leaderId || '',
      leaderName: data.leaderName,
      memberIds: [],
      memberCount: 0,
      description: data.description || '',
      workZone: data.workZone || '',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    }
    teams.value = [team, ...teams.value]
    persist()
  }

  function updateTeam(id, data) {
    const idx = teams.value.findIndex(t => t.id === id)
    if (idx !== -1) {
      teams.value[idx] = {
        ...teams.value[idx],
        ...data,
        updatedAt: new Date().toISOString().split('T')[0],
      }
      persist()
    }
  }

  function removeTeam(id) {
    teams.value = teams.value.filter(t => t.id !== id)
    persist()
  }

  function assignWorkers(teamId, workerIds, operatorId, operatorName) {
    // P0-4 修复：与 V1.1 useTeamManageStore.ts L171-197 1:1 对齐
    // V1.1 先调 enhancedApiClient.post('/team-members/teams/${teamId}/members/batch')
    // V2.0 后端对应 API: assignTeamMembers(teamId, memberIds) -> POST /api/teamMembers/assign
    // 策略：先调 API（乐观更新），无论成功失败都更新本地状态
    const team = teams.value.find(t => t.id === teamId)
    if (!team) return

    // 1) 异步调用后端 API（与 V1.1 L173-178 1:1 对齐），失败仅打印警告不阻塞本地更新
    assignTeamMembers(teamId, workerIds).catch((err) => {
      // 保留乐观更新策略：API 失败不影响本地 store 更新
      console.warn('[team store] 分配工人API失败（已忽略）:', err)
    })

    // 2) 无论API成功与否，都更新本地状态（与 V1.1 L183-196 1:1 对齐的乐观更新逻辑）
    team.memberIds = [...new Set([...team.memberIds, ...workerIds])]
    team.memberCount = team.memberIds.length
    team.updatedAt = new Date().toISOString().split('T')[0]
    unassignedWorkers.value = unassignedWorkers.value.filter(
      w => !workerIds.includes(w.id)
    )
    // 与V1.1 L101-106 1:1 对齐：记录操作人（V1.1 写入 TeamAssignment 表）
    team.lastAssignedBy = operatorName || 'system'
    team.lastAssignedById = operatorId || ''
    persist()
  }

  function removeWorker(teamId, workerId) {
    const team = teams.value.find(t => t.id === teamId)
    if (team) {
      team.memberIds = team.memberIds.filter(id => id !== workerId)
      team.memberCount = team.memberIds.length
      persist()
    }
  }

  // 与 V1.1 useTeamManageStore.ts L39-41 1:1 对齐：根据工人ID获取真实姓名（基于 WORKER_NAMES 映射）
  function getWorkerName(workerId) {
    if (!workerId) return '未知'
    return WORKER_NAMES[workerId] || '未知'
  }

  // 与V1.1 L117-122 getTeamById 1:1 对齐
  function getTeamById(id) {
    return teams.value.find(t => t.id === id)
  }

  return {
    teams,
    unassignedWorkers,
    loading,
    totalMembers,
    initSeedData,
    addTeam,
    updateTeam,
    removeTeam,
    assignWorkers,
    removeWorker,
    getWorkerName,
    getTeamById,
  }
})
