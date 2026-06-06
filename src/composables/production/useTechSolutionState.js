/**
 * 技术方案模块状态 composable（第二阶段 Y7 重构）
 * 抽取 TechSolution.vue 中散落的 filters/pagination/selectedRows 状态
 *
 * 收益：
 * 1. 状态集中管理，便于将来增加 store 持久化
 * 2. 子组件契约更清晰（filters 变更通过 update）
 * 3. 测试时可以单独 mock state
 */
import { ref, computed } from 'vue'

export function useTechSolutionState() {
  // ========== 过滤器 ==========
  const filters = ref({
    code: '',
    cropFilter: '全部',
    author: '',
    status: '全部',
    startDate: '',
    endDate: '',
  })

  // ========== 分页 ==========
  const currentPage = ref(1)
  const pageSize = ref(10)

  // ========== 选中行 ==========
  const selectedRows = ref([])

  // ========== 计算 ==========
  /**
   * 是否有过滤条件（用于判断是否处于"过滤"状态）
   */
  const isFiltered = computed(() => {
    const f = filters.value
    return Boolean(f.code || f.author || f.startDate || f.endDate) ||
      (f.cropFilter !== '全部') ||
      (f.status !== '全部')
  })

  /**
   * 过滤选项是否全为默认值（用于判断是否可点击"重置"）
   */
  const canReset = computed(() => isFiltered.value)

  /**
   * 全选/取消全选（用于表格头部复选框）
   * @param {Array<any>} data
   * @returns {boolean}
   */
  const isAllSelected = (data) => {
    if (!Array.isArray(data) || data.length === 0) return false
    return selectedRows.value.length === data.length
  }

  /**
   * 切换单个行选中状态
   * @param {string|number} id
   */
  const toggleRow = (id) => {
    const idx = selectedRows.value.indexOf(id)
    if (idx >= 0) {
      selectedRows.value = selectedRows.value.filter((r) => r !== id)
    } else {
      selectedRows.value = [...selectedRows.value, id]
    }
  }

  /**
   * 切换全选
   * @param {Array<any>} data
   */
  const toggleSelectAll = (data) => {
    if (isAllSelected(data)) {
      selectedRows.value = []
    } else {
      selectedRows.value = data.map((d) => d.id)
    }
  }

  /**
   * 重置过滤器
   */
  const resetFilters = () => {
    filters.value = {
      code: '',
      cropFilter: '全部',
      author: '',
      status: '全部',
      startDate: '',
      endDate: '',
    }
    currentPage.value = 1
  }

  /**
   * 触发搜索（重置到第一页）
   */
  const triggerSearch = () => {
    currentPage.value = 1
  }

  return {
    // state
    filters,
    currentPage,
    pageSize,
    selectedRows,
    // computed
    isFiltered,
    canReset,
    // actions
    isAllSelected,
    toggleRow,
    toggleSelectAll,
    resetFilters,
    triggerSearch,
  }
}
