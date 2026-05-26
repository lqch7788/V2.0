/**
 * 人工管理 API 服务层
 * 统一封装所有人工模块的 API 调用
 * 数据流: API → V2.0 组件
 */

import { get, post, put, del } from '../request'

// ============================================
// 考勤相关 API
// ============================================

/** 获取考勤列表 */
export function getAttendanceList(params = {}) {
  return get('/attendance', params)
}

/** 获取考勤详情 */
export function getAttendanceDetail(id) {
  return get(`/attendance/${id}`)
}

/** 创建考勤记录 */
export function createAttendance(data) {
  return post('/attendance', data)
}

/** 更新考勤记录 */
export function updateAttendance(id, data) {
  return put(`/attendance/${id}`, data)
}

/** 批量创建考勤记录 */
export function batchCreateAttendance(data) {
  return post('/attendance/batch', data)
}

/** 删除考勤记录 */
export function deleteAttendance(id) {
  return del(`/attendance/${id}`)
}

/** 考勤补录申请 */
export function applyAttendanceRepair(data) {
  return post('/attendance/repair', data)
}

/** 获取考勤补录列表 */
export function getAttendanceRepairList(params) {
  return get('/attendance/repair', params)
}

/** 获取考勤统计 */
export function getAttendanceStats(params) {
  return get('/attendance/stats', params)
}

// ============================================
// 请假相关 API
// ============================================

/** 获取请假列表 */
export function getLeaveList(params = {}) {
  return get('/leave', params)
}

/** 获取请假详情 */
export function getLeaveDetail(id) {
  return get(`/leave/${id}`)
}

/** 创建请假申请 */
export function createLeave(data) {
  return post('/leave', data)
}

/** 更新请假记录 */
export function updateLeave(id, data) {
  return put(`/leave/${id}`, data)
}

/** 删除请假记录 */
export function deleteLeave(id) {
  return del(`/leave/${id}`)
}

/** 审批请假 */
export function approveLeave(id, data) {
  return post(`/leave/${id}/approve`, data)
}

/** 驳回请假 */
export function rejectLeave(id, data) {
  return post(`/leave/${id}/reject`, data)
}

/** 撤回请假 */
export function withdrawLeave(id) {
  return post(`/leave/${id}/withdraw`)
}

/** 获取请假额度 */
export function getLeaveQuota(staffId) {
  return get(`/leave/quota/${staffId}`)
}

/** 获取所有请假额度 */
export function getLeaveQuotaList(params) {
  return get('/leave/quota', params)
}

// ============================================
// 加班相关 API
// ============================================

/** 获取加班列表 */
export function getOvertimeList(params = {}) {
  return get('/overtime', params)
}

/** 获取加班详情 */
export function getOvertimeDetail(id) {
  return get(`/overtime/${id}`)
}

/** 创建加班申请 */
export function createOvertime(data) {
  return post('/overtime', data)
}

/** 更新加班记录 */
export function updateOvertime(id, data) {
  return put(`/overtime/${id}`, data)
}

/** 删除加班记录 */
export function deleteOvertime(id) {
  return del(`/overtime/${id}`)
}

/** 审批加班 */
export function approveOvertime(id, data) {
  return post(`/overtime/${id}/approve`, data)
}

/** 驳回加班 */
export function rejectOvertime(id, data) {
  return post(`/overtime/${id}/reject`, data)
}

/** 加班费用计算 */
export function calculateOvertimePay(data) {
  return post('/overtime/calculate', data)
}

// ============================================
// 人员/工人相关 API
// ============================================

/** 获取员工列表 */
export function getWorkers(params = {}) {
  return get('/labor/workers', params)
}

/** 获取员工详情 */
export function getWorkerDetail(id) {
  return get(`/labor/workers/${id}`)
}

/** 创建员工 */
export function createWorker(data) {
  return post('/labor/workers', data)
}

/** 更新员工 */
export function updateWorker(id, data) {
  return put(`/labor/workers/${id}`, data)
}

/** 删除员工 */
export function deleteWorker(id) {
  return del(`/labor/workers/${id}`)
}

/** 批量删除员工 */
export function deleteWorkers(ids) {
  return del(`/labor/workers/batch?ids=${ids.join(',')}`)
}

/** 搜索员工 */
export function searchWorkers(keyword) {
  return get(`/labor/workers/search?keyword=${encodeURIComponent(keyword)}`)
}

/** 按部门获取员工 */
export function getWorkersByDepartment(deptId) {
  return get(`/labor/workers/department/${deptId}`)
}

/** 获取在职员工 */
export function getActiveWorkers() {
  return get('/labor/workers/active')
}

/** 获取离职员工 */
export function getLeftWorkers() {
  return get('/labor/workers/left')
}

/** 员工离职操作 */
export function leaveWorker(id, data) {
  return post(`/labor/workers/${id}/leave`, data)
}

/** 员工复职操作 */
export function rejoinWorker(id, data) {
  return post(`/labor/workers/${id}/rejoin`, data)
}

/** 获取员工统计 */
export function getWorkerStats() {
  return get('/labor/workers/stats')
}

/** 获取员工技能标签 */
export function getWorkerSkillTags() {
  return get('/labor/workers/skill-tags')
}

/** 生成员工工号 */
export function generateWorkerId() {
  return get('/labor/workers/generate-id')
}

/** 批量导入员工 */
export function importWorkers(workers) {
  return post('/labor/workers/import', { workers })
}

/** 导出员工数据 */
export function exportWorkers(filters) {
  return get('/labor/workers/export', filters)
}

// ============================================
// 人事信息 API
// ============================================

/** 获取人事列表 */
export function getPersonnelList(params = {}) {
  return get('/personnel', params)
}

/** 获取人事详情 */
export function getPersonnelDetail(id) {
  return get(`/personnel/${id}`)
}

// ============================================
// 工资相关 API
// ============================================

/** 获取工资列表 */
export function getSalaryList(params = {}) {
  return get('/labor/salary', params)
}

/** 获取工资详情 */
export function getSalaryDetail(id) {
  return get(`/labor/salary/${id}`)
}

/** 创建工资记录 */
export function createSalary(data) {
  return post('/labor/salary', data)
}

/** 更新工资记录 */
export function updateSalary(id, data) {
  return put(`/labor/salary/${id}`, data)
}

/** 删除工资记录 */
export function deleteSalary(id) {
  return del(`/labor/salary/${id}`)
}

/** 计算工资 */
export function calculateSalary(id, data) {
  return post(`/labor/salary/${id}/calculate`, data)
}

/** 确认工资 */
export function confirmSalary(ids) {
  return post('/labor/salary/confirm', { ids })
}

/** 工资导出 */
export function exportSalary(params) {
  return get('/labor/salary/export', params)
}

/** 获取工资条 */
export function getSalarySlip(id) {
  return get(`/labor/salary/${id}/slip`)
}

// ============================================
// 计件工资 API
// ============================================

/** 获取计件工资列表 */
export function getPieceworkList(params = {}) {
  return get('/labor/piecework', params)
}

/** 创建计件工资记录 */
export function createPiecework(data) {
  return post('/labor/piecework', data)
}

/** 更新计件工资记录 */
export function updatePiecework(id, data) {
  return put(`/labor/piecework/${id}`, data)
}

/** 删除计件工资记录 */
export function deletePiecework(id) {
  return del(`/labor/piecework/${id}`)
}

/** 批量更新计件工资 */
export function batchUpdatePiecework(data) {
  return put('/labor/piecework/batch', data)
}

// ============================================
// 工资预算 API
// ============================================

/** 获取预算列表 */
export function getSalaryBudgetList(params = {}) {
  return get('/salaryBudget', params)
}

/** 创建预算 */
export function createSalaryBudget(data) {
  return post('/salaryBudget', data)
}

/** 更新预算 */
export function updateSalaryBudget(id, data) {
  return put(`/salaryBudget/${id}`, data)
}

/** 删除预算 */
export function deleteSalaryBudget(id) {
  return del(`/salaryBudget/${id}`)
}

/** 预算汇总 */
export function summarizeSalaryBudget(params) {
  return get('/salaryBudget/summary', params)
}

/** 提交预算审批 */
export function submitSalaryBudgetForApproval(id) {
  return post(`/salaryBudget/${id}/submit`)
}

// ============================================
// 合同相关 API
// ============================================

/** 获取合同列表 */
export function getContractList(params = {}) {
  return get('/labor/contracts', params)
}

/** 创建合同 */
export function createContract(data) {
  return post('/labor/contracts', data)
}

/** 更新合同 */
export function updateContract(id, data) {
  return put(`/labor/contracts/${id}`, data)
}

/** 删除合同 */
export function deleteContract(id) {
  return del(`/labor/contracts/${id}`)
}

/** 合同续签 */
export function renewContract(id, data) {
  return post(`/labor/contracts/${id}/renew`, data)
}

// ============================================
// 合同续签 API
// ============================================

/** 获取合同续签列表 */
export function getContractRenewalList(params = {}) {
  return get('/contractRenewal', params)
}

/** 创建合同续签 */
export function createContractRenewal(data) {
  return post('/contractRenewal', data)
}

/** 审批合同续签 */
export function approveContractRenewal(id, data) {
  return post(`/contractRenewal/${id}/approve`, data)
}

// ============================================
// 招聘相关 API
// ============================================

/** 获取招聘列表 */
export function getRecruitmentList(params = {}) {
  return get('/recruitment', params)
}

/** 创建招聘需求 */
export function createRecruitment(data) {
  return post('/recruitment', data)
}

/** 更新招聘需求 */
export function updateRecruitment(id, data) {
  return put(`/recruitment/${id}`, data)
}

/** 删除招聘需求 */
export function deleteRecruitment(id) {
  return del(`/recruitment/${id}`)
}

/** 审批招聘需求 */
export function approveRecruitment(id, data) {
  return post(`/recruitment/${id}/approve`, data)
}

// ============================================
// 入职相关 API
// ============================================

/** 获取入职列表 */
export function getOnboardingList(params = {}) {
  return get('/onboarding', params)
}

/** 创建入职记录 */
export function createOnboarding(data) {
  return post('/onboarding', data)
}

/** 更新入职状态 */
export function updateOnboardingStatus(id, data) {
  return put(`/onboarding/${id}/status`, data)
}

/** 删除入职记录 */
export function deleteOnboarding(id) {
  return del(`/onboarding/${id}`)
}

/** 批量操作入职 */
export function batchUpdateOnboarding(data) {
  return put('/onboarding/batch', data)
}

// ============================================
// 离职相关 API
// ============================================

/** 获取离职列表 */
export function getResignationList(params = {}) {
  return get('/resignation', params)
}

/** 创建离职申请 */
export function createResignation(data) {
  return post('/resignation', data)
}

/** 更新离职记录 */
export function updateResignation(id, data) {
  return put(`/resignation/${id}`, data)
}

/** 删除离职记录 */
export function deleteResignation(id) {
  return del(`/resignation/${id}`)
}

/** 审批离职 */
export function approveResignation(id, data) {
  return post(`/resignation/${id}/approve`, data)
}

// ============================================
// 排班相关 API
// ============================================

/** 获取排班列表 */
export function getScheduleList(params = {}) {
  return get('/schedule', params)
}

/** 创建排班 */
export function createSchedule(data) {
  return post('/schedule', data)
}

/** 更新排班 */
export function updateSchedule(id, data) {
  return put(`/schedule/${id}`, data)
}

/** 删除排班 */
export function deleteSchedule(id) {
  return del(`/schedule/${id}`)
}

/** 批量排班 */
export function batchCreateSchedule(data) {
  return post('/schedule/batch', data)
}

/** 换班申请 */
export function requestShiftSwap(data) {
  return post('/schedule/swap', data)
}

// ============================================
// 绩效相关 API
// ============================================

/** 获取绩效列表 */
export function getPerformanceList(params = {}) {
  return get('/labor/performance', params)
}

/** 创建绩效考核 */
export function createPerformance(data) {
  return post('/labor/performance', data)
}

/** 更新绩效考核 */
export function updatePerformance(id, data) {
  return put(`/labor/performance/${id}`, data)
}

/** 删除绩效考核 */
export function deletePerformance(id) {
  return del(`/labor/performance/${id}`)
}

/** 批量更新绩效 */
export function batchUpdatePerformance(data) {
  return put('/labor/performance/batch', data)
}

// ============================================
// 风险预警 API
// ============================================

/** 获取风险预警列表 */
export function getRiskList(params = {}) {
  return get('/labor/risk', params)
}

/** 创建风险记录 */
export function createRisk(data) {
  return post('/labor/risk', data)
}

/** 更新风险记录 */
export function updateRisk(id, data) {
  return put(`/labor/risk/${id}`, data)
}

/** 删除风险记录 */
export function deleteRisk(id) {
  return del(`/labor/risk/${id}`)
}

/** 解决风险 */
export function resolveRisk(id, data) {
  return post(`/labor/risk/${id}/resolve`, data)
}

// ============================================
// 班组相关 API
// ============================================

/** 获取班组列表 */
export function getTeamList(params = {}) {
  return get('/labor/teams', params)
}

/** 获取班组详情 */
export function getTeamDetail(id) {
  return get(`/labor/teams/${id}`)
}

/** 获取班组成员 */
export function getTeamMembers(teamId) {
  return get(`/teamMembers?teamId=${teamId}`)
}

/** 分配班组成员 */
export function assignTeamMembers(teamId, memberIds) {
  return post(`/teamMembers/assign`, { teamId, memberIds })
}

// ============================================
// 任务相关 API
// ============================================

/** 获取任务列表 */
export function getTaskList(params = {}) {
  return get('/labor/tasks', params)
}

/** 创建任务 */
export function createTask(data) {
  return post('/labor/tasks', data)
}

/** 更新任务 */
export function updateTask(id, data) {
  return put(`/labor/tasks/${id}`, data)
}

/** 删除任务 */
export function deleteTask(id) {
  return del(`/labor/tasks/${id}`)
}

/** 临时任务 API */
export function getTempTaskList(params = {}) {
  return get('/tempTask', params)
}

export function createTempTask(data) {
  return post('/tempTask', data)
}

export function updateTempTask(id, data) {
  return put(`/tempTask/${id}`, data)
}

// ============================================
// 工作日志 API
// ============================================

/** 获取工作日志列表 */
export function getWorkLogList(params = {}) {
  return get('/labor/worklogs', params)
}

/** 创建工作日志 */
export function createWorkLog(data) {
  return post('/labor/worklogs', data)
}

/** 更新工作日志 */
export function updateWorkLog(id, data) {
  return put(`/labor/worklogs/${id}`, data)
}

/** 删除工作日志 */
export function deleteWorkLog(id) {
  return del(`/labor/worklogs/${id}`)
}

// ============================================
// 运营分析相关 API
// ============================================

/** 获取人效分析数据 */
export function getEfficiencyList(params = {}) {
  return get('/labor/efficiency', params)
}

/** 获取月报数据 */
export function getMonthlyReportList(params = {}) {
  return get('/labor/monthly', params)
}

/** 获取人工成本统计 */
export function getLaborCostStats(params) {
  return get('/labor/cost-stats', params)
}

/** 获取劳动风险统计 */
export function getRiskStats() {
  return get('/labor/risk-stats')
}

/** 获取人效仪表盘数据 */
export function getEfficiencyDashboard() {
  return get('/labor/efficiency/dashboard')
}

/** 新增人效数据 */
export function createEfficiency(data) {
  return post('/labor/efficiency', data)
}

/** 更新人效数据 */
export function updateEfficiency(id, data) {
  return put(`/labor/efficiency/${id}`, data)
}

/** 删除人效数据 */
export function deleteEfficiency(id) {
  return del(`/labor/efficiency/${id}`)
}

// ============================================
// 字典/字典 API（用于下拉选项）
// ============================================

/** 获取字典数据（部门、岗位等） */
export function getDictionaries() {
  return get('/labor/dictionaries')
}

/** 获取通用人工记录列表 */
export function getLaborRecords(type, params = {}) {
  return get(`/labor/${type}`, params)
}

/** 创建通用人工记录 */
export function createLaborRecord(type, data) {
  return post(`/labor/${type}`, data)
}

// ============================================
// 批量操作 API
// ============================================

/** 批量删除 */
export function batchDelete(type, ids) {
  return del(`/labor/${type}/batch?ids=${ids.join(',')}`)
}

/** 批量更新 */
export function batchUpdate(type, data) {
  return put(`/labor/${type}/batch`, data)
}

// ============================================
// 导出 API
// ============================================

/** 导出数据 */
export function exportData(type, params) {
  return get(`/labor/${type}/export`, params)
}

// ============================================
// 聚合 API（对外统一入口）
// ============================================

export const laborApi = {
  // 考勤
  getAttendanceList,
  getAttendanceDetail,
  createAttendance,
  updateAttendance,
  deleteAttendance,
  batchCreateAttendance,
  applyAttendanceRepair,
  getAttendanceRepairList,
  getAttendanceStats,
  // 请假
  getLeaveList,
  getLeaveDetail,
  createLeave,
  updateLeave,
  deleteLeave,
  approveLeave,
  rejectLeave,
  withdrawLeave,
  getLeaveQuota,
  getLeaveQuotaList,
  // 加班
  getOvertimeList,
  getOvertimeDetail,
  createOvertime,
  updateOvertime,
  deleteOvertime,
  approveOvertime,
  rejectOvertime,
  calculateOvertimePay,
  // 员工
  getWorkers,
  getWorkerDetail,
  createWorker,
  updateWorker,
  deleteWorker,
  deleteWorkers,
  searchWorkers,
  getWorkersByDepartment,
  getActiveWorkers,
  getLeftWorkers,
  leaveWorker,
  rejoinWorker,
  getWorkerStats,
  importWorkers,
  exportWorkers,
  generateWorkerId,
  getWorkerSkillTags,
  // 人事
  getPersonnelList,
  getPersonnelDetail,
  // 工资
  getSalaryList,
  getSalaryDetail,
  createSalary,
  updateSalary,
  deleteSalary,
  calculateSalary,
  confirmSalary,
  exportSalary,
  getSalarySlip,
  // 计件
  getPieceworkList,
  createPiecework,
  updatePiecework,
  deletePiecework,
  batchUpdatePiecework,
  // 预算
  getSalaryBudgetList,
  createSalaryBudget,
  updateSalaryBudget,
  deleteSalaryBudget,
  summarizeSalaryBudget,
  submitSalaryBudgetForApproval,
  // 合同
  getContractList,
  createContract,
  updateContract,
  deleteContract,
  renewContract,
  getContractRenewalList,
  createContractRenewal,
  approveContractRenewal,
  // 招聘
  getRecruitmentList,
  createRecruitment,
  updateRecruitment,
  deleteRecruitment,
  approveRecruitment,
  // 入职
  getOnboardingList,
  createOnboarding,
  updateOnboardingStatus,
  deleteOnboarding,
  batchUpdateOnboarding,
  // 离职
  getResignationList,
  createResignation,
  updateResignation,
  deleteResignation,
  approveResignation,
  // 排班
  getScheduleList,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  batchCreateSchedule,
  requestShiftSwap,
  // 绩效
  getPerformanceList,
  createPerformance,
  updatePerformance,
  deletePerformance,
  batchUpdatePerformance,
  // 风险
  getRiskList,
  createRisk,
  updateRisk,
  deleteRisk,
  resolveRisk,
  // 班组
  getTeamList,
  getTeamDetail,
  getTeamMembers,
  assignTeamMembers,
  // 任务
  getTaskList,
  createTask,
  updateTask,
  deleteTask,
  getTempTaskList,
  createTempTask,
  updateTempTask,
  // 工作日志
  getWorkLogList,
  createWorkLog,
  updateWorkLog,
  deleteWorkLog,
  // 运营分析
  getEfficiencyList,
  getMonthlyReportList,
  getLaborCostStats,
  getRiskStats,
  getEfficiencyDashboard,
  createEfficiency,
  updateEfficiency,
  deleteEfficiency,
  // 通用
  getDictionaries,
  getLaborRecords,
  createLaborRecord,
  batchDelete,
  batchUpdate,
  exportData
}

export default laborApi
