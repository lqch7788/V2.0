/**
 * 人工记录业务逻辑层 (Service)
 * 负责业务逻辑处理和数据转换
 */

import {
  laborRepository,
  LaborRepository
} from '../repositories/labor.repository.js';

// 人工记录状态值标准化映射（中文 -> 英文）
const LABOR_STATUS_MAP = {
  '待处理': 'pending',
  '处理中': 'in_progress',
  '已处理': 'completed',
  'pending': 'pending',
  'in_progress': 'in_progress',
  'completed': 'completed',
};

// 英文状态值到中文的映射
const LABOR_STATUS_LABEL_MAP = {
  'pending': '待处理',
  'in_progress': '处理中',
  'completed': '已处理',
};

/**
 * 标准化人工记录状态值（将中文转换为英文）
 */
function normalizeLaborStatus(status) {
  if (!status) return 'pending';
  return LABOR_STATUS_MAP[status] || status;
}

/**
 * 获取状态显示标签
 */
function getLaborStatusLabel(status) {
  return LABOR_STATUS_LABEL_MAP[status] || status;
}

/**
 * 人工服务类
 * 提供人工记录和员工相关业务逻辑
 */
export class LaborService {
  constructor(repo) {
    this.repository = repo || laborRepository;
  }

  // ==================== 人工记录操作 ====================

  /**
   * 获取人工记录列表
   * @param query 查询条件
   * @returns 人工列表和分页信息
   */
  async getAll(query) {
    const { data, total } = await this.repository.findAll(query);

    // 添加状态标签
    const itemsWithLabels = data.map((item) => ({
      ...item,
      statusLabel: getLaborStatusLabel(item.status || 'pending'),
    }));

    return {
      data: itemsWithLabels,
      meta: {
        total,
        page: query.page || 1,
        limit: query.limit || 50
      }
    };
  }

  /**
   * 获取人工记录详情
   * @param id 人工记录ID
   * @returns 人工记录详情
   * @throws 错误如果记录不存在
   */
  async getById(id) {
    const item = await this.repository.findById(id);
    if (!item || Object.keys(item).length === 0) {
      throw new Error('人工记录不存在');
    }

    // 添加状态标签并返回
    const result = {
      ...item,
      statusLabel: getLaborStatusLabel(item.status || 'pending'),
    };

    return result;
  }

  /**
   * 创建人工记录
   * @param data 创建数据
   * @returns 创建结果
   */
  async create(data) {
    const newId = data.id || `LB${Date.now()}`;

    // 设置默认值并标准化状态
    const record = {
      ...data,
      id: newId,
      status: normalizeLaborStatus(data.status),
    };

    const result = await this.repository.create(record);
    return { id: result.id };
  }

  /**
   * 更新人工记录
   * @param id 人工记录ID
   * @param data 更新数据
   * @returns 更新结果
   */
  async update(id, data) {
    // 检查记录是否存在
    const existing = await this.repository.findById(id);
    if (!existing || Object.keys(existing).length === 0) {
      throw new Error('人工记录不存在');
    }

    // 标准化状态
    const processedData = { ...data };
    if (processedData.status) {
      processedData.status = normalizeLaborStatus(processedData.status);
    }

    await this.repository.update(id, processedData);
    return { id };
  }

  /**
   * 删除人工记录
   * @param id 人工记录ID
   */
  async delete(id) {
    // 检查记录是否存在
    const existing = await this.repository.findById(id);
    if (!existing || Object.keys(existing).length === 0) {
      throw new Error('人工记录不存在');
    }

    await this.repository.delete(id);
    return { id };
  }

  /**
   * 清空所有人工记录
   */
  async deleteAll() {
    return await this.repository.deleteAll();
  }

  // ==================== 员工操作 ====================

  /**
   * 获取员工列表
   * @param query 查询条件
   * @returns 员工列表和分页信息
   */
  async getAllEmployees(query) {
    const { data, total } = await this.repository.findAllEmployees(query);
    return {
      data,
      meta: {
        total,
        page: query.page || 1,
        limit: query.limit || 50
      }
    };
  }

  /**
   * 获取员工详情
   * @param id 员工ID
   * @returns 员工详情
   * @throws 错误如果记录不存在
   */
  async getEmployeeById(id) {
    const item = await this.repository.findEmployeeById(id);
    if (!item || Object.keys(item).length === 0) {
      throw new Error('员工不存在');
    }
    return item;
  }

  /**
   * 创建员工
   * @param data 创建数据
   * @returns 创建结果
   */
  async createEmployee(data) {
    const newId = data.id || `EMP${Date.now()}`;

    const record = {
      ...data,
      id: newId,
      status: data.status || 'active',
    };

    const result = await this.repository.createEmployee(record);
    return { id: result.id };
  }

  /**
   * 更新员工
   * @param id 员工ID
   * @param data 更新数据
   * @returns 更新结果
   */
  async updateEmployee(id, data) {
    // 检查记录是否存在
    const existing = await this.repository.findEmployeeById(id);
    if (!existing || Object.keys(existing).length === 0) {
      throw new Error('员工不存在');
    }

    await this.repository.updateEmployee(id, data);
    return { id };
  }

  /**
   * 删除员工
   * @param id 员工ID
   */
  async deleteEmployee(id) {
    // 检查记录是否存在
    const existing = await this.repository.findEmployeeById(id);
    if (!existing || Object.keys(existing).length === 0) {
      throw new Error('员工不存在');
    }

    await this.repository.deleteEmployee(id);
    return { id };
  }

  /**
   * 批量删除员工
   * @param ids 员工ID数组
   * @returns 删除结果
   */
  async deleteEmployeesBatch(ids) {
    const count = await this.repository.deleteEmployeesBatch(ids);
    return { deletedCount: count };
  }

  /**
   * 搜索员工
   * @param keyword 搜索关键词
   * @returns 员工列表
   */
  async searchEmployees(keyword) {
    if (!keyword) {
      throw new Error('缺少 keyword 参数');
    }
    return this.repository.searchEmployees(keyword);
  }

  /**
   * 按部门获取员工
   * @param deptId 部门ID
   * @returns 员工列表
   */
  async getEmployeesByDepartment(deptId) {
    return this.repository.findEmployeesByDepartment(deptId);
  }

  /**
   * 按岗位获取员工
   * @param positionId 岗位ID
   * @returns 员工列表
   */
  async getEmployeesByPosition(positionId) {
    return this.repository.findEmployeesByPosition(positionId);
  }

  /**
   * 按类型获取员工
   * @param employeeType 员工类型
   * @returns 员工列表
   */
  async getEmployeesByType(employeeType) {
    return this.repository.findEmployeesByType(employeeType);
  }

  /**
   * 按状态获取员工
   * @param status 状态
   * @returns 员工列表
   */
  async getEmployeesByStatus(status) {
    return this.repository.findEmployeesByStatus(status);
  }

  /**
   * 获取在职工人
   * @returns 员工列表
   */
  async getActiveEmployees() {
    return this.repository.findActiveEmployees();
  }

  /**
   * 获取离职工人
   * @returns 员工列表
   */
  async getLeftEmployees() {
    return this.repository.findLeftEmployees();
  }

  /**
   * 工人离职
   * @param id 员工ID
   * @param leaveDate 离职日期
   * @param leaveReason 离职原因
   */
  async employeeLeave(id, leaveDate, leaveReason) {
    await this.repository.employeeLeave(id, leaveDate, leaveReason);
    return { id };
  }

  /**
   * 工人复职
   * @param id 员工ID
   * @param rejoinDate 复职日期
   */
  async employeeRejoin(id, rejoinDate) {
    await this.repository.employeeRejoin(id, rejoinDate);
    return { id };
  }

  /**
   * 获取员工统计
   * @returns 统计信息
   */
  async getEmployeeStats() {
    return this.repository.getEmployeeStats();
  }

  /**
   * 获取工人技能标签列表
   * @returns 技能标签数组
   */
  async getSkillTags() {
    return this.repository.getSkillTags();
  }

  /**
   * 按技能标签获取员工
   * @param skillTag 技能标签
   * @returns 员工列表
   */
  async getEmployeesBySkillTag(skillTag) {
    return this.repository.findEmployeesBySkillTag(skillTag);
  }

  // ==================== 培训记录操作 ====================

  /**
   * 获取员工培训记录
   * @param employeeId 员工ID
   * @returns 培训记录列表
   */
  async getTrainingRecords(employeeId) {
    return this.repository.getTrainingRecords(employeeId);
  }

  /**
   * 添加培训记录
   * @param employeeId 员工ID
   * @param data 培训数据
   * @returns 创建结果
   */
  async createTrainingRecord(employeeId, data) {
    const newId = data.id || `TR${Date.now()}`;
    const record = { ...data, id: newId };
    const result = await this.repository.createTrainingRecord(employeeId, record);
    return { id: result.id };
  }

  // ==================== 考核记录操作 ====================

  /**
   * 获取员工考核记录
   * @param employeeId 员工ID
   * @returns 考核记录列表
   */
  async getAssessmentRecords(employeeId) {
    return this.repository.getAssessmentRecords(employeeId);
  }

  /**
   * 添加考核记录
   * @param employeeId 员工ID
   * @param data 考核数据
   * @returns 创建结果
   */
  async createAssessmentRecord(employeeId, data) {
    const newId = data.id || `AR${Date.now()}`;
    const record = { ...data, id: newId };
    const result = await this.repository.createAssessmentRecord(employeeId, record);
    return { id: result.id };
  }

  // ==================== 工作经验操作 ====================

  /**
   * 获取员工工作经验
   * @param employeeId 员工ID
   * @returns 工作经验列表
   */
  async getWorkExperiences(employeeId) {
    return this.repository.getWorkExperiences(employeeId);
  }

  /**
   * 添加工作经验
   * @param employeeId 员工ID
   * @param data 工作经验数据
   * @returns 创建结果
   */
  async createWorkExperience(employeeId, data) {
    const newId = data.id || `WE${Date.now()}`;
    const record = { ...data, id: newId };
    const result = await this.repository.createWorkExperience(employeeId, record);
    return { id: result.id };
  }

  // ==================== 批量导入导出 ====================

  /**
   * 批量导入员工
   * @param workers 员工数据数组
   * @returns 导入结果
   */
  async importEmployees(workers) {
    return this.repository.importEmployees(workers);
  }

  /**
   * 导出员工数据
   * @param status 状态筛选
   * @param department 部门筛选
   * @param position 岗位筛选
   * @param format 导出格式
   * @returns 导出数据或CSV内容
   */
  async exportEmployees(status, department, position, format) {
    const items = await this.repository.exportEmployees(status, department, position);

    if (format === 'csv') {
      // 生成 CSV
      if (items.length === 0) {
        throw new Error('没有可导出的数据');
      }

      const headers = ['工号', '姓名', '性别', '电话', '身份证', '岗位', '部门', '类型', '入职日期', '状态', '备注'];
      const fields = ['employee_code', 'name', 'gender', 'phone', 'id_card', 'position_name', 'department_name', 'employee_type', 'hire_date', 'status', 'remarks'];

      const csvRows = [];
      csvRows.push(headers.join(','));

      for (const item of items) {
        const row = fields.map(field => {
          let value = item[field];
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            value = `"${value.replace(/"/g, '""')}"`;
          }
          return value ?? '';
        });
        csvRows.push(row.join(','));
      }

      const csvContent = csvRows.join('\n');
      return csvContent;
    }

    return { data: items, meta: { total: items.length } };
  }

  /**
   * 生成员工工号
   * @returns 工号
   */
  generateEmployeeCode() {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    return `EMP${year}${month}${random}`;
  }
}

// 导出单例
export const laborService = new LaborService();
