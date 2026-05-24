/**
 * 审批管理模块 种子数据脚本
 * 功能：将前端mock数据导入到后端数据库
 *
 * 使用方法：npm run seed:approval 或 npx tsx src/db/seedApprovalData.ts
 */

import { initDatabase, getDatabase, saveDatabase } from './index';

// 审批类型
const ApprovalType = {
  // 农事审批
  TASK_DISPATCH: 'task_dispatch',
  TASK_CHANGE: 'task_change',
  INSPECTION_ISSUE: 'inspection_issue',
  ISSUE_RESOLVE: 'issue_resolve',
  // 生产审批
  TECH_SOLUTION: 'tech_solution',
  PRODUCTION_PLAN: 'production_plan',
  HARVEST_REQUEST: 'harvest_request',
  PRODUCTION_BATCH: 'production_batch',
  PURCHASE_REQUEST: 'purchase_request',
  // 物料审批
  MATERIAL_REQUEST: 'material_request',
  RETURN_MATERIAL: 'return_material',
  // 指标预算审批
  INDICATOR_APPROVAL: 'indicator_approval',
  INDICATOR_ADJUST: 'indicator_adjust',
  BUDGET_CREATE: 'budget_create',
  BUDGET_ADJUST: 'budget_adjust',
  // HR审批
  LEAVE: 'leave',
  OVERTIME: 'overtime',
  RESIGNATION: 'resignation',
  RECRUITMENT: 'recruitment',
};

// 审批状态
const ApprovalStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

// 审批类型名称映射
const typeNameMap: Record<string, string> = {
  [ApprovalType.TASK_DISPATCH]: '任务派发',
  [ApprovalType.TASK_CHANGE]: '任务变更',
  [ApprovalType.INSPECTION_ISSUE]: '巡查问题',
  [ApprovalType.ISSUE_RESOLVE]: '问题整改',
  [ApprovalType.TECH_SOLUTION]: '技术方案',
  [ApprovalType.PRODUCTION_PLAN]: '生产计划',
  [ApprovalType.HARVEST_REQUEST]: '采收申请',
  [ApprovalType.PRODUCTION_BATCH]: '生产批次',
  [ApprovalType.PURCHASE_REQUEST]: '采购申请',
  [ApprovalType.MATERIAL_REQUEST]: '领料申请',
  [ApprovalType.RETURN_MATERIAL]: '退料单',
  [ApprovalType.INDICATOR_APPROVAL]: '指标发布',
  [ApprovalType.INDICATOR_ADJUST]: '指标调整',
  [ApprovalType.BUDGET_CREATE]: '预算编制',
  [ApprovalType.BUDGET_ADJUST]: '预算调整',
  [ApprovalType.LEAVE]: '请假',
  [ApprovalType.OVERTIME]: '加班',
  [ApprovalType.RESIGNATION]: '离职',
  [ApprovalType.RECRUITMENT]: '招聘',
};

// 生成唯一ID
function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// 生成审批单编码
function generateCode(type: string, index: number): string {
  const prefix = type.substring(0, 2).toUpperCase();
  const date = new Date();
  const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  return `AP${dateStr}${prefix}${String(index).padStart(4, '0')}`;
}

// 农事审批数据
const farmApprovals = [
  { id: '1', code: 'FA2024030101', type: ApprovalType.TASK_DISPATCH, title: '番茄种植任务派发', applicantName: '张伟民', applicantDepartment: '生产部', applyDate: '2024-03-01', status: ApprovalStatus.PENDING },
  { id: '2', code: 'FA2024030102', type: ApprovalType.TASK_CHANGE, title: '浇水任务变更', applicantName: '李明轩', applicantDepartment: '生产部', applyDate: '2024-03-01', status: ApprovalStatus.PENDING },
  { id: '3', code: 'FA2024030103', type: ApprovalType.INSPECTION_ISSUE, title: '巡查发现虫害', applicantName: '王建国', applicantDepartment: '生产部', applyDate: '2024-03-01', status: ApprovalStatus.PENDING },
  { id: '4', code: 'FA2024022801', type: ApprovalType.ISSUE_RESOLVE, title: '病虫害整改', applicantName: '赵俊杰', applicantDepartment: '生产部', applyDate: '2024-02-28', status: ApprovalStatus.APPROVED },
  { id: '5', code: 'FA2024022802', type: ApprovalType.TASK_DISPATCH, title: '黄瓜种植任务', applicantName: '钱文涛', applicantDepartment: '生产部', applyDate: '2024-02-28', status: ApprovalStatus.REJECTED },
];

// 生产审批数据
const productionApprovals = [
  { id: '1', code: 'PP2024030101', type: ApprovalType.TECH_SOLUTION, title: '番茄种植技术方案优化', applicantName: '张伟民', applicantDepartment: '技术部', applyDate: '2024-03-01', status: ApprovalStatus.PENDING },
  { id: '2', code: 'PP2024030102', type: ApprovalType.PRODUCTION_PLAN, title: '下周生产计划安排', applicantName: '李明轩', applicantDepartment: '生产部', applyDate: '2024-03-01', status: ApprovalStatus.PENDING },
  { id: '3', code: 'PP2024030103', type: ApprovalType.HARVEST_REQUEST, title: '番茄首批采收申请', applicantName: '王建国', applicantDepartment: '生产部', applyDate: '2024-03-01', status: ApprovalStatus.PENDING },
  { id: '4', code: 'PP2024022801', type: ApprovalType.TECH_SOLUTION, title: '黄瓜种植技术方案', applicantName: '赵俊杰', applicantDepartment: '技术部', applyDate: '2024-02-28', status: ApprovalStatus.APPROVED },
  { id: '5', code: 'PP2024022802', type: ApprovalType.PRODUCTION_PLAN, title: '本月生产计划调整', applicantName: '钱文涛', applicantDepartment: '生产部', applyDate: '2024-02-28', status: ApprovalStatus.APPROVED },
  { id: '6', code: 'PP2024022803', type: ApprovalType.HARVEST_REQUEST, title: '茄子采收申请', applicantName: '孙丽华', applicantDepartment: '生产部', applyDate: '2024-02-28', status: ApprovalStatus.REJECTED },
  { id: '7', code: 'PP2024022701', type: ApprovalType.PURCHASE_REQUEST, title: '农业生产物资采购', applicantName: '周建设', applicantDepartment: '后勤部', applyDate: '2024-02-27', status: ApprovalStatus.APPROVED },
  { id: '8', code: 'PP2024022702', type: ApprovalType.PRODUCTION_BATCH, title: '番茄批次生产', applicantName: '吴光明', applicantDepartment: '生产部', applyDate: '2024-02-27', status: ApprovalStatus.APPROVED },
];

// 指标预算审批数据
const indicatorBudgetApprovals = [
  { id: '1', code: 'IB2024030101', type: ApprovalType.INDICATOR_APPROVAL, title: '季度产量指标发布', applicantName: '张伟民', applicantDepartment: '财务部', applyDate: '2024-03-01', status: ApprovalStatus.PENDING, businessLink: { indicatorType: '产量指标', quarter: 'Q1', targetValue: 1000, unit: '吨' } },
  { id: '2', code: 'IB2024030102', type: ApprovalType.INDICATOR_ADJUST, title: '番茄产量指标调整', applicantName: '李明轩', applicantDepartment: '财务部', applyDate: '2024-03-01', status: ApprovalStatus.PENDING, businessLink: { indicatorType: '产量指标', cropType: '番茄', oldValue: 500, newValue: 600, reason: '市场需求增加' } },
  { id: '3', code: 'IB2024030103', type: ApprovalType.BUDGET_CREATE, title: '2024年度预算编制', applicantName: '王建国', applicantDepartment: '财务部', applyDate: '2024-03-01', status: ApprovalStatus.PENDING, businessLink: { budgetType: '年度预算', totalAmount: 500000, department: '生产部' } },
  { id: '4', code: 'IB2024030104', type: ApprovalType.BUDGET_ADJUST, title: '生产预算调整', applicantName: '赵俊杰', applicantDepartment: '财务部', applyDate: '2024-03-01', status: ApprovalStatus.PENDING, businessLink: { budgetType: '生产预算', originalAmount: 200000, adjustedAmount: 230000, reason: '原材料价格上涨' } },
  { id: '5', code: 'IB2024022801', type: ApprovalType.INDICATOR_APPROVAL, title: '月度产量指标发布', applicantName: '钱文涛', applicantDepartment: '财务部', applyDate: '2024-02-28', status: ApprovalStatus.APPROVED, businessLink: { indicatorType: '产量指标', month: '2024-02', targetValue: 300, unit: '吨' } },
  { id: '6', code: 'IB2024022802', type: ApprovalType.INDICATOR_ADJUST, title: '黄瓜产量指标调整', applicantName: '孙丽华', applicantDepartment: '财务部', applyDate: '2024-02-28', status: ApprovalStatus.APPROVED, businessLink: { indicatorType: '产量指标', cropType: '黄瓜', oldValue: 400, newValue: 450, reason: '种植面积增加' } },
  { id: '7', code: 'IB2024022803', type: ApprovalType.BUDGET_CREATE, title: 'Q1预算编制', applicantName: '周建设', applicantDepartment: '财务部', applyDate: '2024-02-28', status: ApprovalStatus.REJECTED, businessLink: { budgetType: '季度预算', quarter: 'Q1', totalAmount: 350000, department: '生产部' } },
  { id: '8', code: 'IB2024022701', type: ApprovalType.BUDGET_ADJUST, title: '设备预算调整', applicantName: '吴光明', applicantDepartment: '财务部', applyDate: '2024-02-27', status: ApprovalStatus.APPROVED, businessLink: { budgetType: '设备预算', originalAmount: 100000, adjustedAmount: 120000, reason: '设备维护需求' } },
];

// HR审批数据
const hrApprovals = [
  { id: '1', code: 'HR2024030101', type: ApprovalType.LEAVE, typeName: '请假申请', title: '年假申请', applicantName: '张伟民', applicantDepartment: '技术部', applyDate: '2024-03-01', applyTime: '09:30', status: ApprovalStatus.PENDING, description: '请年假5天', businessLink: { leaveType: '年假', startDate: '2024-03-05', endDate: '2024-03-09', totalDays: 5, reason: '家庭旅行' }, approvers: [{ userName: '李经理', role: '部门经理', status: 'pending' }] },
  { id: '2', code: 'HR2024030102', type: ApprovalType.OVERTIME, typeName: '加班申请', title: '项目加班申请', applicantName: '李明轩', applicantDepartment: '技术部', applyDate: '2024-03-01', applyTime: '10:00', status: ApprovalStatus.PENDING, description: '周末项目加班', businessLink: { overtimeType: '工作日加班', date: '2024-03-02', hours: 8, reason: '项目紧急' }, approvers: [{ userName: '李经理', role: '部门经理', status: 'pending' }] },
  { id: '3', code: 'HR2024030103', type: ApprovalType.RESIGNATION, typeName: '离职申请', title: '离职申请', applicantName: '王建国', applicantDepartment: '技术部', applyDate: '2024-03-01', applyTime: '11:00', status: ApprovalStatus.PENDING, description: '个人原因离职', businessLink: { reason: '个人发展原因', lastWorkDate: '2024-03-31' }, approvers: [{ userName: '赵总', role: '总经理', status: 'pending' }] },
  { id: '4', code: 'HR2024022801', type: ApprovalType.RECRUITMENT, typeName: '招聘申请', title: '新增招聘需求', applicantName: '钱文涛', applicantDepartment: '人事部', applyDate: '2024-02-28', applyTime: '09:30', status: ApprovalStatus.APPROVED, description: '招聘Java开发工程师', businessLink: { position: 'Java开发工程师', department: '技术部', headcount: 2, reason: '业务扩张' }, approvers: [{ userName: '赵总', role: '总经理', status: 'approved' }] },
];

// 物料审批数据（领料）
const materialApprovals = [
  { id: '1', code: 'LL2024030101', type: ApprovalType.MATERIAL_REQUEST, title: '番茄种植物料申请', applicantName: '张伟民', applicantDepartment: '生产部', applyDate: '2024-03-01', status: ApprovalStatus.PENDING, materials: [{ materialName: '番茄种子', quantity: 100, unit: '袋' }, { materialName: '有机肥', quantity: 500, unit: 'kg' }] },
  { id: '2', code: 'LL2024030102', type: ApprovalType.MATERIAL_REQUEST, title: '黄瓜种植物料申请', applicantName: '李明轩', applicantDepartment: '生产部', applyDate: '2024-03-01', status: ApprovalStatus.PENDING, materials: [{ materialName: '黄瓜种子', quantity: 80, unit: '袋' }] },
  { id: '3', code: 'LL2024022801', type: ApprovalType.MATERIAL_REQUEST, title: '茄子种植物料申请', applicantName: '王建国', applicantDepartment: '生产部', applyDate: '2024-02-28', status: ApprovalStatus.APPROVED, materials: [{ materialName: '茄子种子', quantity: 60, unit: '袋' }] },
  { id: '4', code: 'LL2024022802', type: ApprovalType.MATERIAL_REQUEST, title: '辣椒种植物料申请', applicantName: '赵俊杰', applicantDepartment: '生产部', applyDate: '2024-02-28', status: ApprovalStatus.REJECTED, materials: [{ materialName: '辣椒种子', quantity: 50, unit: '袋' }] },
];

// 退料审批数据
const returnApprovals = [
  { id: '1', code: 'TL2024030101', type: ApprovalType.RETURN_MATERIAL, title: '生产退料申请', applicantName: '钱文涛', applicantDepartment: '生产部', applyDate: '2024-03-01', status: ApprovalStatus.PENDING, businessLink: { returnType: '生产退料', reason: '物料多余' } },
  { id: '2', code: 'TL2024022801', type: ApprovalType.RETURN_MATERIAL, title: '品质退料申请', applicantName: '孙丽华', applicantDepartment: '品质部', applyDate: '2024-02-28', status: ApprovalStatus.APPROVED, businessLink: { returnType: '品质退料', reason: '物料质量问题' } },
];

// 采购审批数据
const purchaseApprovals = [
  { id: '1', code: 'CG2024030101', type: ApprovalType.PURCHASE_REQUEST, title: '农业生产物资采购', applicantName: '周建设', applicantDepartment: '后勤部', applyDate: '2024-03-01', status: ApprovalStatus.PENDING, amount: '50000' },
  { id: '2', code: 'CG2024022801', type: ApprovalType.PURCHASE_REQUEST, title: '农药采购', applicantName: '吴光明', applicantDepartment: '生产部', applyDate: '2024-02-28', status: ApprovalStatus.APPROVED, amount: '30000' },
];

// 合并所有审批数据
const allApprovals = [
  ...farmApprovals,
  ...productionApprovals,
  ...indicatorBudgetApprovals,
  ...hrApprovals,
  ...materialApprovals,
  ...returnApprovals,
  ...purchaseApprovals,
];

// 插入审批数据到数据库
function seedApprovalData(): void {
  const db = getDatabase();
  let insertedCount = 0;
  let skippedCount = 0;

  console.log('开始导入审批种子数据...\n');

  for (let i = 0; i < allApprovals.length; i++) {
    const item = allApprovals[i];

    // 检查是否已存在
    const checkStmt = db.prepare('SELECT id FROM approvals WHERE code = ?');
    checkStmt.bind([item.code]);
    const exists = checkStmt.step();
    checkStmt.free();

    if (exists) {
      console.log(`  跳过 (已存在): ${item.code} - ${item.title}`);
      skippedCount++;
      continue;
    }

    const now = new Date().toISOString();
    const id = generateId('AP');
    const typeName = typeNameMap[item.type] || item.type;

    db.run(
      `INSERT INTO approvals (
        id, code, type, type_name, category, title, description,
        applicant_id, applicant_name, applicant_department,
        apply_date, apply_time, current_step, total_steps,
        approvers, records, status, business_link, attachments,
        priority, due_date, reminder_count, related_batch_code, related_task_ids, notification_sent,
        amount, materials, workflow_id, workflow_name,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        item.code,
        item.type,
        typeName,
        'business',
        item.title,
        item.description || '',
        item.id,
        item.applicantName,
        item.applicantDepartment,
        item.applyDate,
        item.applyTime || '09:00',
        1, // current_step
        1, // total_steps
        JSON.stringify(item.approvers || []),
        JSON.stringify([]),
        item.status,
        JSON.stringify(item.businessLink || null),
        JSON.stringify([]),
        'normal',
        '',
        0,
        '',
        JSON.stringify([]),
        0,
        item.amount || '',
        JSON.stringify(item.materials || []),
        '',
        '',
        now,
        now,
      ]
    );

    console.log(`  导入成功: ${item.code} - ${item.title}`);
    insertedCount++;
  }

  saveDatabase();

  console.log(`\n========================================`);
  console.log(`审批数据导入完成！`);
  console.log(`  新增: ${insertedCount} 条`);
  console.log(`  跳过: ${skippedCount} 条 (已存在)`);
  console.log(`========================================\n`);
}

// 执行
async function main() {
  await initDatabase();
  await seedApprovalData();
}

main().catch(console.error);

export { seedApprovalData };
