/**
 * 农场 Hub Composable（V2.0）
 * V1.1 1:1 接口对齐：useFarmHub.ts
 */
import { ref, computed } from 'vue'
import { useTasks } from './useTasks.js'
import { useTempTaskStore } from '@/stores/modules/tempTask.js'
import { useProblemStore } from '@/stores/modules/problem.js'
import { useInspectionDataStore } from '@/stores/modules/inspectionData.js'

export function useFarmHub() {
  const tasksHook = useTasks()
  const tempTaskStore = useTempTaskStore()
  const problemStore = useProblemStore()
  const inspectionDataStore = useInspectionDataStore()

  // 加载所有数据
  const loadAll = async () => {
    await Promise.allSettled([
      tasksHook.fetchTasks?.(),
      tempTaskStore.fetchTasks?.(),
      problemStore.fetchProblems?.(),
      inspectionDataStore.fetchRecords?.(),
    ])
  }

  const stats = computed(() => ({
    total: (tasksHook.tasks?.value?.length || 0) + (tempTaskStore.tasks?.length || 0),
    pending: (tasksHook.tasks?.value || []).filter(t => t.status === 'pending').length,
    inProgress: (tasksHook.tasks?.value || []).filter(t => t.status === 'in_progress').length,
    completed: (tasksHook.tasks?.value || []).filter(t => t.status === 'completed').length,
    inspections: inspectionDataStore.records?.length || 0,
    problems: problemStore.problems?.length || 0,
  }))

  return {
    loadAll,
    stats,
  }
}
