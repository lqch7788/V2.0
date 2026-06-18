/**
 * 待确认任务 Composable（V2.0）
 * V1.1 1:1 接口对齐：usePendingConfirmTasks.ts
 */
import { ref, computed } from 'vue'
import { useTasks } from './useTasks.js'

export function usePendingConfirmTasks() {
  const tasksHook = useTasks()
  const pendingTasks = computed(() => {
    return (tasksHook.tasks?.value || []).filter(t => t.status === 'waiting_acceptance')
  })

  return {
    pendingTasks,
  }
}
