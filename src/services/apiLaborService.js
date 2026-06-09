/**
 * 人工管理 API 服务
 * 对接后端 /api/labor
 *
 * 数据流：API → enhancedApiClient (IndexedDB 缓存) → 组件
 *
 * 降级策略：
 * - GET 请求：API → IndexedDB 缓存（API 失败时自动降级）
 * - POST/PUT/DELETE：API → 离线队列（网络断开时加入队列，联网后自动同步）
 */

import { enhancedApiClient } from '../lib/apiClient';

/**
 * 获取所有员工/工人列表
 * 降级策略：API → IndexedDB 缓存
 */
export async function getAllWorkers() {
  const data = await enhancedApiClient.get('/labor/workers');
  return data || [];
}

/**
 * 根据ID获取员工/工人
 * 降级策略：API → IndexedDB 缓存
 */
export async function getWorkerById(id) {
  return await enhancedApiClient.get(`/labor/workers/${id}`);
}

/**
 * 获取员工列表（支持筛选）
 * 降级策略：API → IndexedDB 缓存
 */
export async function getWorkers(filters) {
  const params = {};
  if (filters) {
    if (filters.deptId) params.deptId = filters.deptId;
    if (filters.positionId) params.positionId = filters.positionId;
    if (filters.employeeType) params.employeeType = filters.employeeType;
    if (filters.status) params.status = filters.status;
    if (filters.name) params.name = filters.name;
  }
  const paramsStr = new URLSearchParams(params).toString();
  const url = paramsStr ? `/labor/workers?${paramsStr}` : '/labor/workers';
  const data = await enhancedApiClient.get(url);
  return data || [];
}

/**
 * 创建员工
 * 降级策略：API → 离线队列
 */
export async function createWorker(worker) {
  const result = await enhancedApiClient.post('/labor/workers', worker);
  return result;
}

/**
 * 更新员工信息
 * 降级策略：API → 离线队列
 */
export async function updateWorker(id, updates) {
  const result = await enhancedApiClient.put(`/labor/workers/${id}`, updates);
  return result;
}

/**
 * 删除员工
 * 降级策略：API → 离线队列
 */
export async function deleteWorker(id) {
  await enhancedApiClient.delete(`/labor/workers/${id}`);
  return true;
}

/**
 * 批量删除员工
 * 降级策略：API → 离线队列
 */
export async function deleteWorkers(ids) {
  await enhancedApiClient.delete(`/labor/workers/batch?ids=${ids.join(',')}`);
  return true;
}

/**
 * 根据姓名搜索员工
 * 降级策略：API → IndexedDB 缓存
 */
export async function searchWorkers(keyword) {
  const data = await enhancedApiClient.get(`/labor/workers/search?keyword=${encodeURIComponent(keyword)}`);
  return data || [];
}

/**
 * 根据部门获取员工
 * 降级策略：API → IndexedDB 缓存
 */
export async function getWorkersByDepartment(deptId) {
  const data = await enhancedApiClient.get(`/labor/workers/department/${deptId}`);
  return data || [];
}

/**
 * 根据岗位获取员工
 * 降级策略：API → IndexedDB 缓存
 */
export async function getWorkersByPosition(positionId) {
  const data = await enhancedApiClient.get(`/labor/workers/position/${positionId}`);
  return data || [];
}

/**
 * 根据员工类型获取员工
 * 降级策略：API → IndexedDB 缓存
 */
export async function getWorkersByType(employeeType) {
  const data = await enhancedApiClient.get(`/labor/workers/type/${employeeType}`);
  return data || [];
}

/**
 * 根据状态获取员工
 * 降级策略：API → IndexedDB 缓存
 */
export async function getWorkersByStatus(status) {
  const data = await enhancedApiClient.get(`/labor/workers/status/${status}`);
  return data || [];
}

/**
 * 获取在职员工列表
 * 降级策略：API → IndexedDB 缓存
 */
export async function getActiveWorkers() {
  const data = await enhancedApiClient.get('/labor/workers/active');
  return data || [];
}

/**
 * 获取离职员工列表
 * 降级策略：API → IndexedDB 缓存
 */
export async function getLeftWorkers() {
  const data = await enhancedApiClient.get('/labor/workers/left');
  return data || [];
}

/**
 * 员工离职
 * 降级策略：API → 离线队列
 */
export async function leaveWorker(id, leaveDate, leaveReason) {
  await enhancedApiClient.post(`/labor/workers/${id}/leave`, { leaveDate, leaveReason });
  return true;
}

/**
 * 员工复职
 * 降级策略：API → 离线队列
 */
export async function rejoinWorker(id, rejoinDate) {
  await enhancedApiClient.post(`/labor/workers/${id}/rejoin`, { rejoinDate });
  return true;
}

/**
 * 获取员工统计
 * 降级策略：API → IndexedDB 缓存
 */
export async function getWorkerStats() {
  return await enhancedApiClient.get('/labor/workers/stats');
}

/**
 * 获取员工技能标签列表
 * 降级策略：API → IndexedDB 缓存
 */
export async function getWorkerSkillTags() {
  return await enhancedApiClient.get('/labor/workers/skill-tags');
}

/**
 * 根据技能标签获取员工
 * 降级策略：API → IndexedDB 缓存
 */
export async function getWorkersBySkillTag(skillTag) {
  const data = await enhancedApiClient.get(`/labor/workers/skill-tag/${encodeURIComponent(skillTag)}`);
  return data || [];
}

/**
 * 获取员工培训记录
 * 降级策略：API → IndexedDB 缓存
 */
export async function getWorkerTrainingRecords(workerId) {
  return await enhancedApiClient.get(`/labor/workers/${workerId}/training-records`);
}

/**
 * 添加培训记录
 * 降级策略：API → 离线队列
 */
export async function addTrainingRecord(workerId, record) {
  await enhancedApiClient.post(`/labor/workers/${workerId}/training-records`, record);
  return true;
}

/**
 * 获取员工考核记录
 * 降级策略：API → IndexedDB 缓存
 */
export async function getWorkerAssessmentRecords(workerId) {
  return await enhancedApiClient.get(`/labor/workers/${workerId}/assessment-records`);
}

/**
 * 添加考核记录
 * 降级策略：API → 离线队列
 */
export async function addAssessmentRecord(workerId, record) {
  await enhancedApiClient.post(`/labor/workers/${workerId}/assessment-records`, record);
  return true;
}

/**
 * 获取员工工作经验
 * 降级策略：API → IndexedDB 缓存
 */
export async function getWorkerWorkExperiences(workerId) {
  return await enhancedApiClient.get(`/labor/workers/${workerId}/work-experiences`);
}

/**
 * 添加工作经验
 * 降级策略：API → 离线队列
 */
export async function addWorkExperience(workerId, experience) {
  await enhancedApiClient.post(`/labor/workers/${workerId}/work-experiences`, experience);
  return true;
}

/**
 * 生成员工工号
 */
export async function generateWorkerId() {
  return await enhancedApiClient.get('/labor/workers/generate-id');
}

/**
 * 批量导入员工
 * 降级策略：API → 离线队列
 */
export async function importWorkers(workers) {
  return await enhancedApiClient.post('/labor/workers/import', { workers });
}

/**
 * 导出员工数据
 */
export async function exportWorkers(filters) {
  return await enhancedApiClient.get('/labor/workers/export');
}
