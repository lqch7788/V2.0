/**
 * 物料申请状态 Store (Vue3 Pinia 版本)
 * 用于审批联动等需要前端状态管理的场景
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useMaterialRequestStore = defineStore('materialRequest', () => {
  // 选中状态
  const selectedIds = ref([])
  const setSelectedIds = (ids) => { selectedIds.value = ids }
  const clearSelectedIds = () => { selectedIds.value = [] }

  // 展开状态
  const expandedIds = ref([])
  const toggleExpanded = (id) => {
    const index = expandedIds.value.indexOf(id)
    if (index > -1) {
      expandedIds.value.splice(index, 1)
    } else {
      expandedIds.value.push(id)
    }
  }
  const setExpandedIds = (ids) => { expandedIds.value = ids }

  // 筛选状态
  const filterKeyword = ref('')
  const setFilterKeyword = (keyword) => {
    filterKeyword.value = keyword
    currentPage.value = 1
  }

  // 分页状态
  const currentPage = ref(1)
  const setCurrentPage = (page) => { currentPage.value = page }
  const pageSize = ref(50)
  const setPageSize = (size) => {
    pageSize.value = size
    currentPage.value = 1
  }

  // 排序状态
  const sortField = ref('date')
  const sortOrder = ref('desc')
  const setSort = (field, order) => {
    sortField.value = field
    sortOrder.value = order
  }

  return {
    // 选中状态
    selectedIds,
    setSelectedIds,
    clearSelectedIds,
    // 展开状态
    expandedIds,
    toggleExpanded,
    setExpandedIds,
    // 筛选状态
    filterKeyword,
    setFilterKeyword,
    // 分页状态
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    // 排序状态
    sortField,
    sortOrder,
    setSort
  }
}, {
  persist: true,
  persistOptions: {
    name: 'material-request-store',
    pick: ['pageSize', 'sortField', 'sortOrder']
  }
})
