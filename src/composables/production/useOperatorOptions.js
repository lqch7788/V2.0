/**
 * 操作人员（编制人）下拉数据 composable
 * 第二阶段 Y4 重构：TechSolution.vue 原 loadOperators 函数 24 行（含 try/catch + 兜底）
 * 现抽取为单一 composable，被 CreateModal/EditModal 共用
 *
 * 加载策略（与 V1.1 L117-124 setDictReady 门控一致）：
 * 1. 优先从 /api/dictionary/dictionaries?category=operator 拉取
 * 2. 失败/空数据则使用 OPERATOR_FALLBACK 兜底（与 V1.1 硬编码人员一致）
 *
 * @returns {{ operatorOptions: Ref<Array<{value: string, label: string}>>, loadOperators: () => Promise<void> }}
 */
import { ref } from 'vue'

// V1.1 L286-293 硬编码编制人兜底（移除用户中心接口依赖）
export const OPERATOR_FALLBACK = [
  { value: '陆启闯', label: '陆启闯' },
  { value: '郭靖', label: '郭靖' },
  { value: '黄蓉', label: '黄蓉' },
  { value: '张无忌', label: '张无忌' },
]

export function useOperatorOptions() {
  const operatorOptions = ref([...OPERATOR_FALLBACK])

  const loadOperators = async () => {
    try {
      const token = localStorage.getItem('token')
      const headers = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`

      const response = await fetch('/api/dictionary/dictionaries?category=operator', { headers })
      if (!response.ok) {
        // 失败兜底
        return
      }
      const rawData = await response.json()
      let data = []
      if (Array.isArray(rawData)) data = rawData
      else if (Array.isArray(rawData?.data)) data = rawData.data
      else if (Array.isArray(rawData?.result)) data = rawData.result

      const options = data.map((d) => ({
        value: d.dict_label || d.name,
        label: d.dict_label || d.name,
      }))
      if (options.length > 0) {
        operatorOptions.value = options
      }
      // 空数据时保留 FALLBACK（与 V1.1 行为一致）
    } catch (err) {
      // 修复 P0-Logging：Fail Loud（V1.1 静默降级不利于排查）
      console.error('[useOperatorOptions] 加载编制人字典失败，使用兜底数据:', err)
    }
  }

  return {
    operatorOptions,
    loadOperators,
  }
}
