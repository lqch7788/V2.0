/**
 * 作物下拉数据 composable
 * 第二阶段 Y4 重构：TechSolution.vue 原 cropOptions computed 派生 2 行
 * 抽成 composable 保持"使用方统一从 composables 导入"约定
 *
 * 数据来源：techSolutions 列表中所有出现过的 crop 字段去重
 *
 * @param {import('vue').Ref<Array<any>> | () => Array<any>} source 方案列表（ref 或 getter 函数）
 * @returns {{ cropOptions: import('vue').ComputedRef<string[]> }}
 */
import { computed, unref, isRef } from 'vue'

export function useCropOptions(source) {
  const cropOptions = computed(() => {
    const list = isRef(source) ? unref(source) : (typeof source === 'function' ? source() : source)
    if (!Array.isArray(list)) return []
    return Array.from(new Set(list.map((t) => t.crop).filter(Boolean)))
  })

  return {
    cropOptions,
  }
}
