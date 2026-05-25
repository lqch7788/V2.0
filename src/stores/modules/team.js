/**
 * 班组分配 Store
 * 对应 V1.1 useTeamStore.ts
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useTeamStore = defineStore('team', () => {
  const teams = ref([])
  const unassignedWorkers = ref([])
  const loading = ref(false)

  const totalMembers = computed(() =>
    teams.value.reduce((sum, t) => sum + (t.memberCount || 0), 0)
  )

  const addTeam = (data) => {
    const team = {
      id: `team${Date.now()}`,
      name: data.name,
      leaderId: '',
      leaderName: data.leaderName,
      memberIds: [],
      memberCount: 0,
      description: data.description || '',
      workZone: data.workZone || '',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    }
    teams.value.unshift(team)
  }

  const updateTeam = (id, data) => {
    const idx = teams.value.findIndex(t => t.id === id)
    if (idx !== -1) {
      teams.value[idx] = {
        ...teams.value[idx],
        ...data,
        updatedAt: new Date().toISOString().split('T')[0],
      }
    }
  }

  const removeTeam = (id) => {
    teams.value = teams.value.filter(t => t.id !== id)
  }

  const assignWorkers = (teamId, workerIds) => {
    const team = teams.value.find(t => t.id === teamId)
    if (team) {
      team.memberIds = [...new Set([...team.memberIds, ...workerIds])]
      team.memberCount = team.memberIds.length
      team.updatedAt = new Date().toISOString().split('T')[0]
      unassignedWorkers.value = unassignedWorkers.value.filter(
        w => !workerIds.includes(w.id)
      )
    }
  }

  return {
    teams,
    unassignedWorkers,
    loading,
    totalMembers,
    addTeam,
    updateTeam,
    removeTeam,
    assignWorkers,
  }
})
