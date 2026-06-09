/**
 * 农事任务 API 服务
 * 对接后端 /api/farm-tasks
 *
 * 数据流：API → enhancedApiClient (IndexedDB 缓存) → 组件
 *
 * 降级策略：
 * - GET 请求：API → IndexedDB 缓存（API 失败时自动降级）
 * - POST/PUT/DELETE：API → 离线队列（网络断开时加入队列，联网后自动同步）
 */

import { enhancedApiClient } from '../lib/apiClient';

/**
 * 获取所有农事任务
 * 降级策略：API → IndexedDB 缓存
 */
export async function getAllTasks() {
  const data = await enhancedApiClient.get('/farm-tasks');
  return data || [];
}

/**
 * 根据ID获取任务
 * 降级策略：API → IndexedDB 缓存
 */
export async function getTaskById(id) {
  return await enhancedApiClient.get(`/farm-tasks/${id}`);
}

/**
 * 根据任务编码获取任务
 * 降级策略：API → IndexedDB 缓存
 */
export async function getTaskByCode(taskCode) {
  return await enhancedApiClient.get(`/farm-tasks/code/${taskCode}`);
}

/**
 * 获取任务列表（支持筛选）
 * 降级策略：API → IndexedDB 缓存
 */
export async function getTasks(filters) {
  const queryParams = new URLSearchParams();
  if (filters) {
    if (filters.status) queryParams.set('status', filters.status.join(','));
    if (filters.sourceType) queryParams.set('sourceType', filters.sourceType);
    if (filters.assigneeId) queryParams.set('assigneeId', filters.assigneeId);
    if (filters.assignerId) queryParams.set('assignerId', filters.assignerId);
    if (filters.greenhouseId) queryParams.set('greenhouseId', filters.greenhouseId);
    if (filters.batchId) queryParams.set('batchId', filters.batchId);
    if (filters.priority) queryParams.set('priority', filters.priority);
    if (filters.keyword) queryParams.set('keyword', filters.keyword);
    if (filters.dateRange) {
      queryParams.set('startDate', filters.dateRange.start);
      queryParams.set('endDate', filters.dateRange.end);
    }
  }
  const url = `/farm-tasks${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  const data = await enhancedApiClient.get(url);
  return data || [];
}

/**
 * 获取任务列表（支持分页和筛选，返回完整响应含meta信息）
 * 降级策略：API → IndexedDB 缓存
 */
export async function getTasksWithPagination(params) {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.set('page', String(params.page));
  if (params.limit) queryParams.set('limit', String(params.limit));
  if (params.status) queryParams.set('status', params.status);
  if (params.keyword) queryParams.set('keyword', params.keyword);
  if (params.startDate) queryParams.set('startDate', params.startDate);
  if (params.endDate) queryParams.set('endDate', params.endDate);
  if (params.assigneeId) queryParams.set('assigneeId', params.assigneeId);
  if (params.greenhouseId) queryParams.set('greenhouseId', params.greenhouseId);

  const url = `/farm-tasks${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

  // 获取完整响应
  const response = await enhancedApiClient.get(url);

  // 返回带有分页信息的响应
  if (response && typeof response === 'object' && 'data' in response) {
    const resp = response;
    return {
      data: resp.data || [],
      total: resp.meta?.total || 0,
      page: resp.meta?.page || 1,
      limit: resp.meta?.limit || 10
    };
  }

  // 降级处理：如果返回的是数组
  if (Array.isArray(response)) {
    return {
      data: response,
      total: response.length,
      page: params.page || 1,
      limit: params.limit || 10
    };
  }

  return {
    data: [],
    total: 0,
    page: params.page || 1,
    limit: params.limit || 10
  };
}

/**
 * 创建任务
 * 降级策略：API → 离线队列
 */
export async function createTask(task) {
  const result = await enhancedApiClient.post('/farm-tasks', task);
  return result;
}

/**
 * 更新任务
 * 降级策略：API → 离线队列
 */
export async function updateTask(id, updates) {
  const result = await enhancedApiClient.put(`/farm-tasks/${id}`, updates);
  return result;
}

/**
 * 删除任务
 * 降级策略：API → 离线队列
 */
export async function deleteTask(id) {
  await enhancedApiClient.delete(`/farm-tasks/${id}`);
  return true;
}

/**
 * 批量删除任务
 * 降级策略：API → 离线队列
 */
export async function deleteTasks(ids) {
  await enhancedApiClient.delete(`/farm-tasks/batch?ids=${ids.join(',')}`);
  return true;
}

/**
 * 发布任务
 * 降级策略：API → 离线队列
 */
export async function publishTask(id) {
  return await enhancedApiClient.post(`/farm-tasks/${id}/publish`);
}

/**
 * 撤回任务
 * 降级策略：API → 离线队列
 */
export async function withdrawTask(id) {
  return await enhancedApiClient.post(`/farm-tasks/${id}/withdraw`);
}

/**
 * 接受任务
 * 降级策略：API → 离线队列
 */
export async function acceptTask(id) {
  return await enhancedApiClient.post(`/farm-tasks/${id}/accept`);
}

/**
 * 开始执行任务
 * 降级策略：API → 离线队列
 */
export async function startTask(id) {
  return await enhancedApiClient.post(`/farm-tasks/${id}/start`);
}

/**
 * 提交进度
 * 降级策略：API → 离线队列
 */
export async function submitProgress(id, progress, feedback) {
  return await enhancedApiClient.post(`/farm-tasks/${id}/progress`, { progress, feedback });
}

/**
 * 申请验收
 * 降级策略：API → 离线队列
 */
export async function submitForAcceptance(id) {
  return await enhancedApiClient.post(`/farm-tasks/${id}/submit-acceptance`);
}

/**
 * 验收通过
 * 降级策略：API → 离线队列
 */
export async function completeTask(id, comments) {
  return await enhancedApiClient.post(`/farm-tasks/${id}/complete`, { comments });
}

/**
 * 验收驳回（返工）
 * 降级策略：API → 离线队列
 */
export async function rejectTask(id, reason) {
  return await enhancedApiClient.post(`/farm-tasks/${id}/reject`, { reason });
}

/**
 * 取消任务
 * 降级策略：API → 离线队列
 */
export async function cancelTask(id, reason) {
  return await enhancedApiClient.post(`/farm-tasks/${id}/cancel`, { reason });
}

/**
 * 放弃任务
 * 降级策略：API → 离线队列
 */
export async function abandonTask(id, reason) {
  return await enhancedApiClient.post(`/farm-tasks/${id}/abandon`, { reason });
}

/**
 * 超时继续
 * 降级策略：API → 离线队列
 */
export async function overtimeContinue(id) {
  return await enhancedApiClient.post(`/farm-tasks/${id}/overtime-continue`);
}

/**
 * 超时放弃
 * 降级策略：API → 离线队列
 */
export async function overtimeAbandon(id, reason) {
  return await enhancedApiClient.post(`/farm-tasks/${id}/overtime-abandon`, { reason });
}

/**
 * 重新派发任务
 * 降级策略：API → 离线队列
 */
export async function reassignTask(id, assigneeId) {
  return await enhancedApiClient.post(`/farm-tasks/${id}/reassign`, { assigneeId });
}

/**
 * 延期任务
 * 降级策略：API → 离线队列
 */
export async function extendDeadline(id, newDeadline, reason) {
  return await enhancedApiClient.post(`/farm-tasks/${id}/extend-deadline`, { newDeadline, reason });
}

/**
 * 催办任务
 * 降级策略：API → 离线队列
 */
export async function remindTask(id) {
  await enhancedApiClient.post(`/farm-tasks/${id}/remind`);
  return true;
}

/**
 * 获取任务统计
 * 降级策略：API → IndexedDB 缓存
 */
export async function getTaskStats(filters) {
  return await enhancedApiClient.get('/farm-tasks/stats');
}

/**
 * 根据状态获取任务数量
 * 降级策略：API → IndexedDB 缓存
 */
export async function getTaskCountByStatus(status) {
  return await enhancedApiClient.get(`/farm-tasks/count?status=${status}`);
}

/**
 * 获取任务操作记录
 * 降级策略：API → IndexedDB 缓存
 */
export async function getTaskRecords(taskId) {
  return await enhancedApiClient.get(`/farm-tasks/${taskId}/records`);
}

/**
 * 获取逾期任务列表
 * 降级策略：API → IndexedDB 缓存
 */
export async function getOverdueTasks() {
  const data = await enhancedApiClient.get('/farm-tasks/overdue');
  return data || [];
}

/**
 * 获取待接受的任务列表
 * 降级策略：API → IndexedDB 缓存
 */
export async function getPendingTasks() {
  const data = await enhancedApiClient.get('/farm-tasks/pending');
  return data || [];
}

/**
 * 获取进行中的任务列表
 * 降级策略：API → IndexedDB 缓存
 */
export async function getInProgressTasks() {
  const data = await enhancedApiClient.get('/farm-tasks/in-progress');
  return data || [];
}

/**
 * 获取待验收的任务列表
 * 降级策略：API → IndexedDB 缓存
 */
export async function getWaitingAcceptanceTasks() {
  const data = await enhancedApiClient.get('/farm-tasks/waiting-acceptance');
  return data || [];
}

/**
 * 归档任务
 * 降级策略：API → 离线队列
 */
export async function archiveTask(id) {
  return await enhancedApiClient.post(`/farm-tasks/${id}/archive`);
}

/**
 * 批量归档任务
 * 降级策略：API → 离线队列
 */
export async function archiveTasks(ids) {
  await enhancedApiClient.post(`/farm-tasks/batch-archive`, { ids });
  return true;
}
