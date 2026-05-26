/**
 * 班组分配 Store
 * 从 V1.1 useTeamManageStore.ts 1:1迁移
 * 班组数据保存到 localStorage，刷新页面不丢失
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from '@/composables/useLocalStorage'

// 初始种子数据（与V1.1一致）
const INITIAL_TEAMS = [
  {
    id: 'team001',
    name: '收割组A',
    leaderId: 'w001',
    leaderName: '郭靖',
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
    leaderName: '杨过',
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
    leaderName: '令狐冲',
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

  function assignWorkers(teamId, workerIds) {
    const team = teams.value.find(t => t.id === teamId)
    if (team) {
      team.memberIds = [...new Set([...team.memberIds, ...workerIds])]
      team.memberCount = team.memberIds.length
      team.updatedAt = new Date().toISOString().split('T')[0]
      unassignedWorkers.value = unassignedWorkers.value.filter(
        w => !workerIds.includes(w.id)
      )
      persist()
    }
  }

  function removeWorker(teamId, workerId) {
    const team = teams.value.find(t => t.id === teamId)
    if (team) {
      team.memberIds = team.memberIds.filter(id => id !== workerId)
      team.memberCount = team.memberIds.length
      persist()
    }
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
  }
})
