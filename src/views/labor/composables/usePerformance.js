/**
 * 绩效考核 composable
 * 对标 V1.1 src/components/labor/performance/hooks/usePerformance.ts
 */
import { ref, computed } from 'vue'

const MOCK_DATA = [
  { id: '1', staffId: 'EMP001', staffName: '张三', department: '生产部', month: '2024-01', taskCompletionRate: 95, attendanceRate: 98, workQuality: 92, safetyCompliance: 100, teamworkAttitude: 90, totalScore: 95, rank: 1, status: '已评估' },
  { id: '2', staffId: 'EMP002', staffName: '李四', department: '生产部', month: '2024-01', taskCompletionRate: 88, attendanceRate: 95, workQuality: 85, safetyCompliance: 95, teamworkAttitude: 92, totalScore: 91, rank: 3, status: '已评估' },
  { id: '3', staffId: 'EMP003', staffName: '王五', department: '技术部', month: '2024-01', taskCompletionRate: 92, attendanceRate: 100, workQuality: 95, safetyCompliance: 98, teamworkAttitude: 88, totalScore: 94, rank: 2, status: '已评估' },
  { id: '4', staffId: 'EMP004', staffName: '赵六', department: '生产部', month: '2024-02', taskCompletionRate: 90, attendanceRate: 96, workQuality: 88, safetyCompliance: 92, teamworkAttitude: 90, totalScore: 91, rank: 2, status: '已评估' },
  { id: '5', staffId: 'EMP005', staffName: '钱七', department: '技术部', month: '2024-02', taskCompletionRate: 94, attendanceRate: 98, workQuality: 92, safetyCompliance: 96, teamworkAttitude: 94, totalScore: 95, rank: 1, status: '已评估' },
]

export function usePerformance() {
  const data = ref([...MOCK_DATA])

  const filters = ref({
    keyword: '',
    staffId: '',
    department: '',
    month: '',
    status: '',
  })

  const pagination = ref({ currentPage: 1, pageSize: 10 })

  const selectedRecord = ref(null)
  const showDetailModal = ref(false)

  const filteredData = computed(() => {
    const f = filters.value
    return data.value.filter((r) => {
      if (f.keyword && !r.staffName.includes(f.keyword)) return false
      if (f.staffId && !r.staffId.includes(f.staffId)) return false
      if (f.department && r.department !== f.department) return false
      if (f.month && r.month !== f.month) return false
      if (f.status && r.status !== f.status) return false
      return true
    })
  })

  const totalCount = computed(() => filteredData.value.length)
  const totalPages = computed(() => Math.ceil(totalCount.value / pagination.value.pageSize))

  const paginatedData = computed(() => {
    const start = (pagination.value.currentPage - 1) * pagination.value.pageSize
    return filteredData.value.slice(start, start + pagination.value.pageSize)
  })

  const setFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
    pagination.value.currentPage = 1
  }

  const setPagination = (newPagination) => {
    pagination.value = { ...pagination.value, ...newPagination }
  }

  const handleViewDetail = (record) => {
    selectedRecord.value = record
    showDetailModal.value = true
  }

  const handleCloseDetail = () => {
    showDetailModal.value = false
    selectedRecord.value = null
  }

  const handleResetFilters = () => {
    filters.value = { keyword: '', staffId: '', department: '', month: '', status: '' }
    pagination.value.currentPage = 1
  }

  return {
    data,
    filters,
    pagination,
    selectedRecord,
    showDetailModal,
    filteredData,
    paginatedData,
    totalPages,
    totalCount,
    setFilters,
    setPagination,
    handleViewDetail,
    handleCloseDetail,
    handleResetFilters,
  }
}