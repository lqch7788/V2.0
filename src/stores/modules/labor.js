/**
 * 人工管理 Pinia Store (Comprehensive)
 * 覆盖: 考勤/请假/加班/工资/计件/预算/人事/合同/招聘/入职/离职/绩效/风险/工作日志
 * 遵循 V1.1 Zustand Store 模式
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { laborApi } from '@/api/labor'

export const useLaborStore = defineStore('labor', () => {
  // ============================================
  // 通用状态
  // ============================================
  const loading = ref(false)
  const error = ref(null)

  // ============================================
  // 考勤状态
  // ============================================
  const attendanceList = ref([])
  const attendanceTotal = ref(0)
  const attendancePage = ref(1)
  const attendancePageSize = ref(20)
  const attendanceFilters = ref({ startDate: '', endDate: '', dept: '', keyword: '' })

  /** 获取考勤列表 */
  async function fetchAttendance(params = {}) {
    loading.value = true
    error.value = null
    try {
      const page = params.page || attendancePage.value
      const pageSize = params.pageSize || attendancePageSize.value
      const result = await laborApi.getAttendanceList({ page, pageSize, ...attendanceFilters.value, ...params })
      attendanceList.value = result.items || result.data || []
      attendanceTotal.value = result.total || 0
    } catch (e) {
      error.value = e.message
      console.error('获取考勤列表失败:', e)
    } finally {
      loading.value = false
    }
  }

  /** 创建考勤 */
  async function createAttendance(data) {
    await laborApi.createAttendance(data)
    await fetchAttendance()
  }

  /** 更新考勤 */
  async function updateAttendance(id, data) {
    await laborApi.updateAttendance(id, data)
    await fetchAttendance()
  }

  /** 删除考勤 */
  async function deleteAttendance(id) {
    await laborApi.deleteAttendance(id)
    await fetchAttendance()
  }

  /** 考勤补录 */
  async function applyRepair(data) {
    return await laborApi.applyAttendanceRepair(data)
  }

  // ============================================
  // 请假状态
  // ============================================
  const leaveList = ref([])
  const leaveTotal = ref(0)
  const leavePage = ref(1)
  const leavePageSize = ref(20)
  const leaveFilters = ref({ staffName: '', leaveType: '', status: '', startDate: '', endDate: '' })

  async function fetchLeaveList(params = {}) {
    loading.value = true
    error.value = null
    try {
      const page = params.page || leavePage.value
      const pageSize = params.pageSize || leavePageSize.value
      const result = await laborApi.getLeaveList({ page, pageSize, ...leaveFilters.value, ...params })
      leaveList.value = result.items || result.data || []
      leaveTotal.value = result.total || 0
    } catch (e) {
      error.value = e.message
      console.error('获取请假列表失败:', e)
    } finally {
      loading.value = false
    }
  }

  async function createLeave(data) {
    await laborApi.createLeave(data)
    await fetchLeaveList()
  }

  async function updateLeave(id, data) {
    await laborApi.updateLeave(id, data)
    await fetchLeaveList()
  }

  async function deleteLeave(id) {
    await laborApi.deleteLeave(id)
    await fetchLeaveList()
  }

  async function approveLeave(id, data) {
    await laborApi.approveLeave(id, data)
    await fetchLeaveList()
  }

  async function rejectLeave(id, data) {
    await laborApi.rejectLeave(id, data)
    await fetchLeaveList()
  }

  async function withdrawLeave(id) {
    await laborApi.withdrawLeave(id)
    await fetchLeaveList()
  }

  // ============================================
  // 加班状态
  // ============================================
  const overtimeList = ref([])
  const overtimeTotal = ref(0)
  const overtimePage = ref(1)
  const overtimePageSize = ref(20)
  const overtimeFilters = ref({ staffName: '', type: '', status: '', startDate: '', endDate: '' })

  async function fetchOvertimeList(params = {}) {
    loading.value = true
    error.value = null
    try {
      const page = params.page || overtimePage.value
      const pageSize = params.pageSize || overtimePageSize.value
      const result = await laborApi.getOvertimeList({ page, pageSize, ...overtimeFilters.value, ...params })
      overtimeList.value = result.items || result.data || []
      overtimeTotal.value = result.total || 0
    } catch (e) {
      error.value = e.message
      console.error('获取加班列表失败:', e)
    } finally {
      loading.value = false
    }
  }

  async function createOvertime(data) {
    await laborApi.createOvertime(data)
    await fetchOvertimeList()
  }

  async function updateOvertime(id, data) {
    await laborApi.updateOvertime(id, data)
    await fetchOvertimeList()
  }

  async function deleteOvertime(id) {
    await laborApi.deleteOvertime(id)
    await fetchOvertimeList()
  }

  async function approveOvertime(id, data) {
    await laborApi.approveOvertime(id, data)
    await fetchOvertimeList()
  }

  async function rejectOvertime(id, data) {
    await laborApi.rejectOvertime(id, data)
    await fetchOvertimeList()
  }

  // ============================================
  // 员工/工人状态
  // ============================================
  const workerList = ref([])
  const workerTotal = ref(0)
  const workerPage = ref(1)
  const workerPageSize = ref(20)
  const workerFilters = ref({ name: '', deptId: '', positionId: '', status: '', type: '' })

  async function fetchWorkers(params = {}) {
    loading.value = true
    error.value = null
    try {
      const page = params.page || workerPage.value
      const pageSize = params.pageSize || workerPageSize.value
      const result = await laborApi.getWorkers({ page, pageSize, ...workerFilters.value, ...params })
      workerList.value = result.items || result.data || []
      workerTotal.value = result.total || 0
    } catch (e) {
      error.value = e.message
      console.error('获取员工列表失败:', e)
    } finally {
      loading.value = false
    }
  }

  async function createWorker(data) {
    const result = await laborApi.createWorker(data)
    await fetchWorkers()
    return result
  }

  async function updateWorker(id, data) {
    const result = await laborApi.updateWorker(id, data)
    await fetchWorkers()
    return result
  }

  async function deleteWorker(id) {
    await laborApi.deleteWorker(id)
    await fetchWorkers()
  }

  async function workerLeave(id, data) {
    await laborApi.leaveWorker(id, data)
    await fetchWorkers()
  }

  async function workerRejoin(id, data) {
    await laborApi.rejoinWorker(id, data)
    await fetchWorkers()
  }

  // ============================================
  // 工资状态
  // ============================================
  const salaryList = ref([])
  const salaryTotal = ref(0)
  const salaryPage = ref(1)
  const salaryPageSize = ref(20)
  const salaryFilters = ref({ month: '', staffName: '', calcType: '', status: '' })

  async function fetchSalaryList(params = {}) {
    loading.value = true
    error.value = null
    try {
      const page = params.page || salaryPage.value
      const pageSize = params.pageSize || salaryPageSize.value
      const result = await laborApi.getSalaryList({ page, pageSize, ...salaryFilters.value, ...params })
      salaryList.value = result.items || result.data || []
      salaryTotal.value = result.total || 0
    } catch (e) {
      error.value = e.message
      console.error('获取工资列表失败:', e)
    } finally {
      loading.value = false
    }
  }

  async function createSalary(data) {
    await laborApi.createSalary(data)
    await fetchSalaryList()
  }

  async function updateSalary(id, data) {
    await laborApi.updateSalary(id, data)
    await fetchSalaryList()
  }

  async function deleteSalary(id) {
    await laborApi.deleteSalary(id)
    await fetchSalaryList()
  }

  async function confirmSalary(ids) {
    await laborApi.confirmSalary(ids)
    await fetchSalaryList()
  }

  // ============================================
  // 计件工资状态
  // ============================================
  const pieceworkList = ref([])
  const pieceworkTotal = ref(0)
  const pieceworkPage = ref(1)
  const pieceworkPageSize = ref(20)

  async function fetchPieceworkList(params = {}) {
    loading.value = true
    error.value = null
    try {
      const page = params.page || pieceworkPage.value
      const pageSize = params.pageSize || pieceworkPageSize.value
      const result = await laborApi.getPieceworkList({ page, pageSize, ...params })
      pieceworkList.value = result.items || result.data || []
      pieceworkTotal.value = result.total || 0
    } catch (e) {
      error.value = e.message
      console.error('获取计件工资列表失败:', e)
    } finally {
      loading.value = false
    }
  }

  async function createPiecework(data) {
    await laborApi.createPiecework(data)
    await fetchPieceworkList()
  }

  async function updatePiecework(id, data) {
    await laborApi.updatePiecework(id, data)
    await fetchPieceworkList()
  }

  async function deletePiecework(id) {
    await laborApi.deletePiecework(id)
    await fetchPieceworkList()
  }

  // ============================================
  // 工资预算状态
  // ============================================
  const budgetList = ref([])
  const budgetTotal = ref(0)
  const budgetPage = ref(1)
  const budgetPageSize = ref(20)

  async function fetchBudgetList(params = {}) {
    loading.value = true
    error.value = null
    try {
      const page = params.page || budgetPage.value
      const pageSize = params.pageSize || budgetPageSize.value
      const result = await laborApi.getSalaryBudgetList({ page, pageSize, ...params })
      budgetList.value = result.items || result.data || []
      budgetTotal.value = result.total || 0
    } catch (e) {
      error.value = e.message
      console.error('获取预算列表失败:', e)
    } finally {
      loading.value = false
    }
  }

  async function createBudget(data) {
    await laborApi.createSalaryBudget(data)
    await fetchBudgetList()
  }

  async function updateBudget(id, data) {
    await laborApi.updateSalaryBudget(id, data)
    await fetchBudgetList()
  }

  async function deleteBudget(id) {
    await laborApi.deleteSalaryBudget(id)
    await fetchBudgetList()
  }

  // ============================================
  // 合同状态
  // ============================================
  const contractList = ref([])
  const contractTotal = ref(0)
  const contractPage = ref(1)
  const contractPageSize = ref(20)

  async function fetchContractList(params = {}) {
    loading.value = true
    error.value = null
    try {
      const page = params.page || contractPage.value
      const pageSize = params.pageSize || contractPageSize.value
      const result = await laborApi.getContractList({ page, pageSize, ...params })
      contractList.value = result.items || result.data || []
      contractTotal.value = result.total || 0
    } catch (e) {
      error.value = e.message
      console.error('获取合同列表失败:', e)
    } finally {
      loading.value = false
    }
  }

  async function createContract(data) {
    await laborApi.createContract(data)
    await fetchContractList()
  }

  async function updateContract(id, data) {
    await laborApi.updateContract(id, data)
    await fetchContractList()
  }

  async function deleteContract(id) {
    await laborApi.deleteContract(id)
    await fetchContractList()
  }

  async function renewContract(id, data) {
    await laborApi.renewContract(id, data)
    await fetchContractList()
  }

  // ============================================
  // 招聘状态
  // ============================================
  const recruitmentList = ref([])
  const recruitmentTotal = ref(0)
  const recruitmentPage = ref(1)
  const recruitmentPageSize = ref(20)

  async function fetchRecruitmentList(params = {}) {
    loading.value = true
    error.value = null
    try {
      const page = params.page || recruitmentPage.value
      const pageSize = params.pageSize || recruitmentPageSize.value
      const result = await laborApi.getRecruitmentList({ page, pageSize, ...params })
      recruitmentList.value = result.items || result.data || []
      recruitmentTotal.value = result.total || 0
    } catch (e) {
      error.value = e.message
      console.error('获取招聘列表失败:', e)
    } finally {
      loading.value = false
    }
  }

  async function createRecruitment(data) {
    await laborApi.createRecruitment(data)
    await fetchRecruitmentList()
  }

  async function updateRecruitment(id, data) {
    await laborApi.updateRecruitment(id, data)
    await fetchRecruitmentList()
  }

  async function deleteRecruitment(id) {
    await laborApi.deleteRecruitment(id)
    await fetchRecruitmentList()
  }

  async function approveRecruitment(id, data) {
    await laborApi.approveRecruitment(id, data)
    await fetchRecruitmentList()
  }

  // ============================================
  // 入职状态
  // ============================================
  const onboardingList = ref([])
  const onboardingTotal = ref(0)
  const onboardingPage = ref(1)
  const onboardingPageSize = ref(20)

  async function fetchOnboardingList(params = {}) {
    loading.value = true
    error.value = null
    try {
      const page = params.page || onboardingPage.value
      const pageSize = params.pageSize || onboardingPageSize.value
      const result = await laborApi.getOnboardingList({ page, pageSize, ...params })
      onboardingList.value = result.items || result.data || []
      onboardingTotal.value = result.total || 0
    } catch (e) {
      error.value = e.message
      console.error('获取入职列表失败:', e)
    } finally {
      loading.value = false
    }
  }

  async function createOnboarding(data) {
    await laborApi.createOnboarding(data)
    await fetchOnboardingList()
  }

  async function updateOnboardingStatus(id, data) {
    await laborApi.updateOnboardingStatus(id, data)
    await fetchOnboardingList()
  }

  async function deleteOnboarding(id) {
    await laborApi.deleteOnboarding(id)
    await fetchOnboardingList()
  }

  // ============================================
  // 离职状态
  // ============================================
  const resignationList = ref([])
  const resignationTotal = ref(0)
  const resignationPage = ref(1)
  const resignationPageSize = ref(20)

  async function fetchResignationList(params = {}) {
    loading.value = true
    error.value = null
    try {
      const page = params.page || resignationPage.value
      const pageSize = params.pageSize || resignationPageSize.value
      const result = await laborApi.getResignationList({ page, pageSize, ...params })
      resignationList.value = result.items || result.data || []
      resignationTotal.value = result.total || 0
    } catch (e) {
      error.value = e.message
      console.error('获取离职列表失败:', e)
    } finally {
      loading.value = false
    }
  }

  async function createResignation(data) {
    await laborApi.createResignation(data)
    await fetchResignationList()
  }

  async function updateResignation(id, data) {
    await laborApi.updateResignation(id, data)
    await fetchResignationList()
  }

  async function deleteResignation(id) {
    await laborApi.deleteResignation(id)
    await fetchResignationList()
  }

  async function approveResignation(id, data) {
    await laborApi.approveResignation(id, data)
    await fetchResignationList()
  }

  // ============================================
  // 绩效考核状态
  // ============================================
  const performanceList = ref([])
  const performanceTotal = ref(0)
  const performancePage = ref(1)
  const performancePageSize = ref(20)

  async function fetchPerformanceList(params = {}) {
    loading.value = true
    error.value = null
    try {
      const page = params.page || performancePage.value
      const pageSize = params.pageSize || performancePageSize.value
      const result = await laborApi.getPerformanceList({ page, pageSize, ...params })
      performanceList.value = result.items || result.data || []
      performanceTotal.value = result.total || 0
    } catch (e) {
      error.value = e.message
      console.error('获取绩效列表失败:', e)
    } finally {
      loading.value = false
    }
  }

  async function createPerformance(data) {
    await laborApi.createPerformance(data)
    await fetchPerformanceList()
  }

  async function updatePerformance(id, data) {
    await laborApi.updatePerformance(id, data)
    await fetchPerformanceList()
  }

  async function deletePerformance(id) {
    await laborApi.deletePerformance(id)
    await fetchPerformanceList()
  }

  // ============================================
  // 风险预警状态
  // ============================================
  const riskList = ref([])
  const riskTotal = ref(0)
  const riskPage = ref(1)
  const riskPageSize = ref(20)

  async function fetchRiskList(params = {}) {
    loading.value = true
    error.value = null
    try {
      const page = params.page || riskPage.value
      const pageSize = params.pageSize || riskPageSize.value
      const result = await laborApi.getRiskList({ page, pageSize, ...params })
      riskList.value = result.items || result.data || []
      riskTotal.value = result.total || 0
    } catch (e) {
      error.value = e.message
      console.error('获取风险列表失败:', e)
    } finally {
      loading.value = false
    }
  }

  async function createRisk(data) {
    await laborApi.createRisk(data)
    await fetchRiskList()
  }

  async function updateRisk(id, data) {
    await laborApi.updateRisk(id, data)
    await fetchRiskList()
  }

  async function deleteRisk(id) {
    await laborApi.deleteRisk(id)
    await fetchRiskList()
  }

  async function resolveRisk(id, data) {
    await laborApi.resolveRisk(id, data)
    await fetchRiskList()
  }

  // ============================================
  // 工作日志状态
  // ============================================
  const workLogList = ref([])
  const workLogTotal = ref(0)
  const workLogPage = ref(1)
  const workLogPageSize = ref(20)

  async function fetchWorkLogList(params = {}) {
    loading.value = true
    error.value = null
    try {
      const page = params.page || workLogPage.value
      const pageSize = params.pageSize || workLogPageSize.value
      const result = await laborApi.getWorkLogList({ page, pageSize, ...params })
      workLogList.value = result.items || result.data || []
      workLogTotal.value = result.total || 0
    } catch (e) {
      error.value = e.message
      console.error('获取工作日志列表失败:', e)
    } finally {
      loading.value = false
    }
  }

  async function createWorkLog(data) {
    await laborApi.createWorkLog(data)
    await fetchWorkLogList()
  }

  async function updateWorkLog(id, data) {
    await laborApi.updateWorkLog(id, data)
    await fetchWorkLogList()
  }

  async function deleteWorkLog(id) {
    await laborApi.deleteWorkLog(id)
    await fetchWorkLogList()
  }

  // ============================================
  // 运营分析状态
  // ============================================
  const efficiencyList = ref([])
  const monthlyReportList = ref([])
  const laborCostStats = ref(null)
  const riskStats = ref(null)
  const efficiencyDashboard = ref(null)

  async function fetchEfficiencyList(params = {}) {
    loading.value = true
    error.value = null
    try {
      const result = await laborApi.getEfficiencyList(params)
      efficiencyList.value = result.items || result.data || []
    } catch (e) {
      error.value = e.message
      console.error('获取人效数据失败:', e)
    } finally {
      loading.value = false
    }
  }

  async function fetchMonthlyReportList(params = {}) {
    loading.value = true
    error.value = null
    try {
      const result = await laborApi.getMonthlyReportList(params)
      monthlyReportList.value = result.items || result.data || []
    } catch (e) {
      error.value = e.message
      console.error('获取月报数据失败:', e)
    } finally {
      loading.value = false
    }
  }

  async function fetchLaborCostStats(params) {
    loading.value = true
    error.value = null
    try {
      laborCostStats.value = await laborApi.getLaborCostStats(params)
    } catch (e) {
      error.value = e.message
      console.error('获取成本统计失败:', e)
    } finally {
      loading.value = false
    }
  }

  async function fetchRiskStats() {
    loading.value = true
    error.value = null
    try {
      riskStats.value = await laborApi.getRiskStats()
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function fetchEfficiencyDashboard() {
    loading.value = true
    error.value = null
    try {
      efficiencyDashboard.value = await laborApi.getEfficiencyDashboard()
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  // ============================================
  // 字典/岗位状态
  // ============================================
  const dictionaries = ref(null)

  async function fetchDictionaries() {
    try {
      dictionaries.value = await laborApi.getDictionaries()
    } catch (e) {
      console.error('获取字典数据失败:', e)
    }
  }

  // ============================================
  // 计算属性
  // ============================================
  const hasError = computed(() => error.value !== null)
  const isLoading = computed(() => loading.value)

  // ============================================
  // 导出
  // ============================================
  return {
    // 通用
    loading,
    error,
    hasError,
    isLoading,
    // 考勤
    attendanceList,
    attendanceTotal,
    attendancePage,
    attendancePageSize,
    attendanceFilters,
    fetchAttendance,
    createAttendance,
    updateAttendance,
    deleteAttendance,
    applyRepair,
    // 请假
    leaveList,
    leaveTotal,
    leavePage,
    leavePageSize,
    leaveFilters,
    fetchLeaveList,
    createLeave,
    updateLeave,
    deleteLeave,
    approveLeave,
    rejectLeave,
    withdrawLeave,
    // 加班
    overtimeList,
    overtimeTotal,
    overtimePage,
    overtimePageSize,
    overtimeFilters,
    fetchOvertimeList,
    createOvertime,
    updateOvertime,
    deleteOvertime,
    approveOvertime,
    rejectOvertime,
    // 员工
    workerList,
    workerTotal,
    workerPage,
    workerPageSize,
    workerFilters,
    fetchWorkers,
    createWorker,
    updateWorker,
    deleteWorker,
    workerLeave,
    workerRejoin,
    // 工资
    salaryList,
    salaryTotal,
    salaryPage,
    salaryPageSize,
    salaryFilters,
    fetchSalaryList,
    createSalary,
    updateSalary,
    deleteSalary,
    confirmSalary,
    // 计件
    pieceworkList,
    pieceworkTotal,
    pieceworkPage,
    pieceworkPageSize,
    fetchPieceworkList,
    createPiecework,
    updatePiecework,
    deletePiecework,
    // 预算
    budgetList,
    budgetTotal,
    budgetPage,
    budgetPageSize,
    fetchBudgetList,
    createBudget,
    updateBudget,
    deleteBudget,
    // 合同
    contractList,
    contractTotal,
    contractPage,
    contractPageSize,
    fetchContractList,
    createContract,
    updateContract,
    deleteContract,
    renewContract,
    // 招聘
    recruitmentList,
    recruitmentTotal,
    recruitmentPage,
    recruitmentPageSize,
    fetchRecruitmentList,
    createRecruitment,
    updateRecruitment,
    deleteRecruitment,
    approveRecruitment,
    // 入职
    onboardingList,
    onboardingTotal,
    onboardingPage,
    onboardingPageSize,
    fetchOnboardingList,
    createOnboarding,
    updateOnboardingStatus,
    deleteOnboarding,
    // 离职
    resignationList,
    resignationTotal,
    resignationPage,
    resignationPageSize,
    fetchResignationList,
    createResignation,
    updateResignation,
    deleteResignation,
    approveResignation,
    // 绩效
    performanceList,
    performanceTotal,
    performancePage,
    performancePageSize,
    fetchPerformanceList,
    createPerformance,
    updatePerformance,
    deletePerformance,
    // 风险
    riskList,
    riskTotal,
    riskPage,
    riskPageSize,
    fetchRiskList,
    createRisk,
    updateRisk,
    deleteRisk,
    resolveRisk,
    // 工作日志
    workLogList,
    workLogTotal,
    workLogPage,
    workLogPageSize,
    fetchWorkLogList,
    createWorkLog,
    updateWorkLog,
    deleteWorkLog,
    // 运营分析
    efficiencyList,
    monthlyReportList,
    laborCostStats,
    riskStats,
    efficiencyDashboard,
    fetchEfficiencyList,
    fetchMonthlyReportList,
    fetchLaborCostStats,
    fetchRiskStats,
    fetchEfficiencyDashboard,
    // 字典
    dictionaries,
    fetchDictionaries
  }
})
