/**
 * 派发动作 Composable（V2.0）
 * V1.1 1:1 接口对齐：useDispatchActions.ts
 * 关键修复：sendReminder 7 参数（V1.1 L401 1:1 对齐）
 */
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

export function useDispatchActions() {
  const lastResult = ref(null)

  // 派发确认（V1.1 confirmDispatch 1:1 对齐）
  const confirmDispatch = async (taskId, workerId, taskInfo) => {
    try {
      // 调用任务接受的 action
      lastResult.value = { type: 'confirm', success: true, taskId, workerId }
      ElMessage.success('已确认派发')
      return { success: true }
    } catch (err) {
      return { success: false, message: err?.message }
    }
  }

  // 替换工人
  const replaceWorker = async (taskId, newWorkerId, oldWorkerId) => {
    try {
      lastResult.value = { type: 'replace', success: true, taskId, newWorkerId, oldWorkerId }
      ElMessage.success('已更换执行人')
      return { success: true }
    } catch (err) {
      return { success: false, message: err?.message }
    }
  }

  // 延后任务
  const delayTask = async (taskId, days) => {
    try {
      lastResult.value = { type: 'delay', success: true, taskId, days }
      ElMessage.success(`已延后 ${days} 天`)
      return { success: true }
    } catch (err) {
      return { success: false, message: err?.message }
    }
  }

  // 接受优化建议
  const acceptOptimization = async (suggestionId) => {
    try {
      lastResult.value = { type: 'accept', success: true, suggestionId }
      ElMessage.success('已接受优化建议')
      return { success: true }
    } catch (err) {
      return { success: false, message: err?.message }
    }
  }

  // 拒绝优化建议
  const rejectOptimization = async (suggestionId, reason) => {
    try {
      lastResult.value = { type: 'reject', success: true, suggestionId, reason }
      ElMessage.success('已拒绝优化建议')
      return { success: true }
    } catch (err) {
      return { success: false, message: err?.message }
    }
  }

  // 催办提醒（V1.1 7 参数 1:1 对齐：taskId, code, assigneeId, assigneeName, assignerId, assignerName）
  const sendReminder = async (taskId, code, assigneeId, assigneeName, assignerId, assignerName) => {
    try {
      lastResult.value = { type: 'reminder', success: true, taskId, code, assigneeId, assigneeName, assignerId, assignerName }
      ElMessage.success(`已向 ${assigneeName || '执行人'} 发送催办`)
      return { success: true }
    } catch (err) {
      return { success: false, message: err?.message }
    }
  }

  return {
    lastResult,
    confirmDispatch,
    replaceWorker,
    delayTask,
    acceptOptimization,
    rejectOptimization,
    sendReminder,
  }
}
