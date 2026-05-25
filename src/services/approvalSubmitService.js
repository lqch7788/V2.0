// ============================================================
// 审批提交辅助服务
// 文件路径：src/services/approvalSubmitService.js
// 功能：帮助业务模块快速接入审批流程
// 迁移自 V1.1 src/services/approvalSubmitService.ts (1301行)
// V2.0改造：React hooks → Pinia/Vue3 utils
// ============================================================

import { ApprovalType } from '../types/approval.js'
import { resolveApprovalLevel, approverConfigsToApprovers } from '../utils/approvalLevelResolver.js'
import { enhancedApiClient } from '../lib/apiClient'

// ============================================================
// 审批提交核心函数
// ============================================================

/**
 * 提交审批（统一入口）
 * @param {Object} businessData - 业务数据
 * @param {string} businessData.id - 业务ID
 * @param {string} businessData.code - 业务编号
 * @param {string} businessData.title - 业务标题
 * @param {string} businessData.type - 审批类型（ApprovalType枚举值）
 * @param {number} businessData.amount - 申请金额
 * @param {string} businessData.applicantId - 申请人ID
 * @param {string} businessData.applicantName - 申请人名称
 * @param {string} businessData.applicantDepartment - 申请人部门
 * @param {Object} [businessData.additionalData] - 附加数据
 * @param {Object} [businessData.businessLink] - 业务关联数据
 * @returns {Promise<Object>} 审批提交结果
 */
async function submitApproval(businessData) {
  try {
    // 1. 解析审批级别
    const levelResult = resolveApprovalLevel(
      businessData.type,
      businessData.amount || 0,
      businessData.additionalData
    )

    // 2. 生成审批编号
    const approvalCode = generateApprovalCode(businessData.type)

    // 3. 构建审批单据
    const now = new Date()
    const approval = {
      id: generateId(),
      code: approvalCode,
      title: businessData.title,
      type: businessData.type,
      typeName: getApprovalTypeNameFromEnum(businessData.type),
      category: getApprovalCategory(businessData.type),
      amount: businessData.amount || 0,
      applicantId: businessData.applicantId,
      applicantName: businessData.applicantName,
      applicantDepartment: businessData.applicantDepartment,
      applyDate: formatDate(now),
      applyTime: formatTime(now),
      currentStep: 1,
      totalSteps: levelResult.approverCount,
      approvers: approverConfigsToApprovers(levelResult.approvers),
      records: [],
      status: 'pending',
      priority: businessData.additionalData?.isHighValue ? 'high' : 'normal',
      description: businessData.description || '',
      businessLink: businessData.businessLink || null,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    }

    // 4. 调用API保存审批数据
    const response = await enhancedApiClient.post('/api/approvals', approval)

    if (!response || !response.success) {
      return {
        success: false,
        autoApprove: levelResult.autoApprove,
        level: levelResult.level,
        message: `提交审批失败: ${response?.error || '未知错误'}`
      }
    }

    // 5. 自动通过审批：调用PATCH端点触发审批联动
    if (levelResult.autoApprove) {
      console.log('【审批提交】自动通过审批，触发PATCH联动，businessLink:', businessData.businessLink)
      try {
        await enhancedApiClient.patch(
          `/api/approvals/${approval.id}/action`,
          {
            action: 'approve',
            comment: '免审批自动通过',
            approverId: businessData.applicantId || 'system',
            approverName: businessData.applicantName || '系统'
          }
        )
      } catch (linkError) {
        console.error('【审批提交】自动通过审批，业务联动更新失败:', linkError)
      }
    }

    return {
      success: true,
      approvalId: approval.id,
      approvalCode: approval.code,
      autoApprove: levelResult.autoApprove,
      level: levelResult.level,
      message: levelResult.autoApprove
        ? '金额在免审批阈值内，已自动通过'
        : `已提交审批，等待 ${levelResult.approverCount} 位审批人处理`
    }
  } catch (error) {
    console.error('【审批提交】提交审批失败', error)
    return {
      success: false,
      autoApprove: false,
      level: 'unknown',
      message: `提交审批异常: ${error.message || error}`
    }
  }
}

// ============================================================
// 辅助函数
// ============================================================

/** 生成审批编号 */
function generateApprovalCode(type) {
  const now = new Date()
  const year = now.getFullYear()
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const day = now.getDate().toString().padStart(2, '0')
  const typeCode = getTypeCode(type)
  const seq = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `SP${year}${month}${day}${typeCode}${seq}`
}

/** 生成唯一ID */
function generateId() {
  return `approval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/** 格式化日期 YYYY-MM-DD */
function formatDate(date) {
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
}

/** 格式化时间 HH:mm:ss */
function formatTime(date) {
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`
}

/** 获取类型代码（2字母缩写） */
function getTypeCode(type) {
  const codes = {
    [ApprovalType.MATERIAL_REQUEST]: 'ML',
    [ApprovalType.RETURN_MATERIAL]: 'RM',
    [ApprovalType.PURCHASE_REQUEST]: 'CG',
    [ApprovalType.MATERIAL_INBOUND]: 'MI',
    [ApprovalType.MATERIAL_TRANSFER]: 'MT',
    [ApprovalType.SEED_SOURCE_INBOUND]: 'SS',
    [ApprovalType.SEEDLING_PLAN]: 'YP',
    [ApprovalType.PLANTING_PLAN]: 'ZZ',
    [ApprovalType.ORDER_CREATE]: 'DD',
    [ApprovalType.ORDER_CHANGE]: 'DG',
    [ApprovalType.PRODUCTION_PLAN]: 'SC',
    [ApprovalType.PRODUCTION_BATCH]: 'PC',
    [ApprovalType.BATCH_CHANGE]: 'BG',
    [ApprovalType.BATCH_VOID]: 'BV',
    [ApprovalType.TECH_SOLUTION]: 'JS',
    [ApprovalType.TASK_DISPATCH]: 'RW',
    [ApprovalType.TASK_CHANGE]: 'RG',
    [ApprovalType.INSPECTION_ISSUE]: 'XC',
    [ApprovalType.ISSUE_RESOLVE]: 'ZG',
    [ApprovalType.HARVEST_REQUEST]: 'HS',
    [ApprovalType.SEED_SOURCE_SUPPLEMENTARY]: 'SB',
    [ApprovalType.SEEDLING_SUPPLEMENTARY]: 'YB',
    [ApprovalType.CROP_STORAGE_SUPPLEMENTARY]: 'CB',
    [ApprovalType.INDICATOR_APPROVAL]: 'ZB',
    [ApprovalType.INDICATOR_ADJUST]: 'ZT',
    [ApprovalType.ANNOUNCEMENT_APPROVAL]: 'GG',
    [ApprovalType.BUDGET_CREATE]: 'YS',
    [ApprovalType.BUDGET_ADJUST]: 'YG',
    [ApprovalType.LEAVE]: 'QJ',
    [ApprovalType.OVERTIME]: 'JB',
    [ApprovalType.RESIGNATION]: 'LZ',
    [ApprovalType.RECRUITMENT]: 'ZP',
    [ApprovalType.ONBOARDING]: 'RS',
    [ApprovalType.ATTENDANCE_REPAIR]: 'BX',
    [ApprovalType.SALARY_ADJUSTMENT]: 'TX',
    [ApprovalType.CONTRACT_RENEWAL]: 'HT',
    [ApprovalType.SALARY_BUDGET]: 'GZ',
    [ApprovalType.TRANSFER]: 'ZG'
  }
  return codes[type] || 'XX'
}

/** 获取审批类型的中文名称 */
function getApprovalTypeNameFromEnum(type) {
  const names = {
    [ApprovalType.MATERIAL_REQUEST]: '领料申请',
    [ApprovalType.RETURN_MATERIAL]: '退料单',
    [ApprovalType.PURCHASE_REQUEST]: '采购申请',
    [ApprovalType.MATERIAL_INBOUND]: '物料入库',
    [ApprovalType.MATERIAL_TRANSFER]: '库存调拨',
    [ApprovalType.SEED_SOURCE_INBOUND]: '种源入库',
    [ApprovalType.SEEDLING_PLAN]: '育苗计划',
    [ApprovalType.PLANTING_PLAN]: '种植计划',
    [ApprovalType.ORDER_CREATE]: '订单创建',
    [ApprovalType.ORDER_CHANGE]: '订单变更',
    [ApprovalType.PRODUCTION_PLAN]: '生产计划',
    [ApprovalType.PRODUCTION_BATCH]: '生产批次',
    [ApprovalType.BATCH_CHANGE]: '批次变更',
    [ApprovalType.BATCH_VOID]: '批次作废',
    [ApprovalType.TECH_SOLUTION]: '技术方案',
    [ApprovalType.TASK_DISPATCH]: '任务派发',
    [ApprovalType.TASK_CHANGE]: '任务变更',
    [ApprovalType.INSPECTION_ISSUE]: '巡查问题',
    [ApprovalType.ISSUE_RESOLVE]: '问题整改',
    [ApprovalType.HARVEST_REQUEST]: '采收申请',
    [ApprovalType.SEED_SOURCE_SUPPLEMENTARY]: '种源补录',
    [ApprovalType.SEEDLING_SUPPLEMENTARY]: '育苗补录',
    [ApprovalType.CROP_STORAGE_SUPPLEMENTARY]: '作物入库补录',
    [ApprovalType.INDICATOR_APPROVAL]: '指标发布',
    [ApprovalType.INDICATOR_ADJUST]: '指标调整',
    [ApprovalType.ANNOUNCEMENT_APPROVAL]: '公告审批',
    [ApprovalType.BUDGET_CREATE]: '预算编制',
    [ApprovalType.BUDGET_ADJUST]: '预算调整',
    [ApprovalType.LEAVE]: '请假',
    [ApprovalType.OVERTIME]: '加班',
    [ApprovalType.RESIGNATION]: '离职',
    [ApprovalType.RECRUITMENT]: '招聘',
    [ApprovalType.ONBOARDING]: '入职',
    [ApprovalType.ATTENDANCE_REPAIR]: '考勤补录',
    [ApprovalType.SALARY_ADJUSTMENT]: '调薪',
    [ApprovalType.CONTRACT_RENEWAL]: '合同续签',
    [ApprovalType.SALARY_BUDGET]: '工资预算',
    [ApprovalType.TRANSFER]: '转岗'
  }
  return names[type] || type
}

/** 获取审批所属分类 */
function getApprovalCategory(type) {
  const business = [
    ApprovalType.MATERIAL_REQUEST, ApprovalType.RETURN_MATERIAL,
    ApprovalType.PURCHASE_REQUEST, ApprovalType.MATERIAL_INBOUND,
    ApprovalType.MATERIAL_TRANSFER, ApprovalType.SEED_SOURCE_INBOUND,
    ApprovalType.SEEDLING_PLAN, ApprovalType.PLANTING_PLAN,
    ApprovalType.ORDER_CREATE, ApprovalType.ORDER_CHANGE
  ]
  const production = [
    ApprovalType.PRODUCTION_PLAN, ApprovalType.PRODUCTION_BATCH,
    ApprovalType.BATCH_CHANGE, ApprovalType.BATCH_VOID,
    ApprovalType.TECH_SOLUTION
  ]
  const farm = [
    ApprovalType.TASK_DISPATCH, ApprovalType.TASK_CHANGE,
    ApprovalType.INSPECTION_ISSUE, ApprovalType.ISSUE_RESOLVE,
    ApprovalType.HARVEST_REQUEST
  ]
  const supplementary = [
    ApprovalType.SEED_SOURCE_SUPPLEMENTARY, ApprovalType.SEEDLING_SUPPLEMENTARY,
    ApprovalType.CROP_STORAGE_SUPPLEMENTARY
  ]
  const indicator = [
    ApprovalType.INDICATOR_APPROVAL, ApprovalType.INDICATOR_ADJUST,
    ApprovalType.ANNOUNCEMENT_APPROVAL
  ]
  const budget = [ApprovalType.BUDGET_CREATE, ApprovalType.BUDGET_ADJUST]
  const hr = [
    ApprovalType.LEAVE, ApprovalType.OVERTIME, ApprovalType.RESIGNATION,
    ApprovalType.RECRUITMENT, ApprovalType.ONBOARDING,
    ApprovalType.ATTENDANCE_REPAIR, ApprovalType.SALARY_ADJUSTMENT,
    ApprovalType.CONTRACT_RENEWAL, ApprovalType.SALARY_BUDGET,
    ApprovalType.TRANSFER
  ]

  if (business.includes(type)) return 'business'
  if (production.includes(type)) return 'production'
  if (farm.includes(type)) return 'farm'
  if (supplementary.includes(type)) return 'supplementary'
  if (indicator.includes(type)) return 'indicator'
  if (budget.includes(type)) return 'budget'
  if (hr.includes(type)) return 'hr'
  return 'other'
}

// ============================================================
// 快捷审批提交函数（按业务类型分组）
// ============================================================

// ========== 业务审批 ==========

/** 提交订单审批 */
export async function submitOrderApproval(params) {
  return submitApproval({
    id: params.orderId,
    code: params.orderCode,
    title: `订单创建: ${params.orderName}`,
    type: ApprovalType.ORDER_CREATE,
    amount: params.amount || 0,
    applicantId: params.applicantId,
    applicantName: params.applicantName,
    applicantDepartment: params.department,
    additionalData: { isHighValue: params.isHighValue },
    businessLink: {
      type: 'order_create',
      requestId: params.orderId,
      requestCode: params.orderCode
    }
  })
}

/** 提交订单变更审批 */
export async function submitOrderChangeApproval(params) {
  return submitApproval({
    id: params.changeId,
    code: params.changeCode,
    title: `订单变更: ${params.orderCode}`,
    type: ApprovalType.ORDER_CHANGE,
    amount: params.amount || 0,
    applicantId: params.applicantId,
    applicantName: params.applicantName,
    applicantDepartment: params.department,
    businessLink: {
      type: 'order_change',
      requestId: params.changeId,
      requestCode: params.changeCode,
      orderCode: params.orderCode
    }
  })
}

/** 提交采购审批 */
export async function submitPurchaseApproval(params) {
  return submitApproval({
    id: params.purchaseId,
    code: params.purchaseCode,
    title: `采购申请: ${params.purchaseName}`,
    type: ApprovalType.PURCHASE_REQUEST,
    amount: params.amount || 0,
    applicantId: params.applicantId,
    applicantName: params.applicantName,
    applicantDepartment: params.department,
    businessLink: {
      type: 'purchase',
      requestId: params.purchaseId,
      requestCode: params.purchaseCode
    }
  })
}

/** 提交领料申请审批 */
export async function submitMaterialRequestApproval(params) {
  return submitApproval({
    id: params.requestId,
    code: params.requestCode,
    title: `领料申请: ${(params.materials || []).map(m => m.name).join(', ')}`,
    type: ApprovalType.MATERIAL_REQUEST,
    amount: params.amount || 0,
    applicantId: params.applicantId,
    applicantName: params.applicantName,
    applicantDepartment: params.department,
    businessLink: {
      type: 'material',
      requestId: params.requestId,
      requestCode: params.requestCode,
      materials: params.materials
    }
  })
}

/** 提交退料单审批 */
export async function submitReturnMaterialApproval(params) {
  return submitApproval({
    id: params.returnId,
    code: params.returnCode,
    title: `退料申请: ${(params.materials || []).map(m => m.name).join(', ')}`,
    type: ApprovalType.RETURN_MATERIAL,
    amount: params.amount || 0,
    applicantId: params.applicantId,
    applicantName: params.applicantName,
    applicantDepartment: params.department,
    businessLink: {
      type: 'return',
      requestId: params.returnId,
      requestCode: params.returnCode,
      materials: params.materials
    }
  })
}

/** 提交物料入库审批 */
export async function submitMaterialInboundApproval(params) {
  return submitApproval({
    id: params.inboundId,
    code: params.inboundCode,
    title: `物料入库: ${params.materialName}`,
    type: ApprovalType.MATERIAL_INBOUND,
    amount: params.amount || 0,
    applicantId: params.applicantId,
    applicantName: params.applicantName,
    applicantDepartment: params.department,
    businessLink: {
      type: 'material_inbound',
      requestId: params.inboundId,
      requestCode: params.inboundCode
    }
  })
}

/** 提交库存调拨审批 */
export async function submitMaterialTransferApproval(params) {
  return submitApproval({
    id: params.transferId,
    code: params.transferCode,
    title: `库存调拨: ${params.fromWarehouse} → ${params.toWarehouse}`,
    type: ApprovalType.MATERIAL_TRANSFER,
    amount: params.amount || 0,
    applicantId: params.applicantId,
    applicantName: params.applicantName,
    applicantDepartment: params.department,
    businessLink: {
      type: 'material_transfer',
      requestId: params.transferId,
      requestCode: params.transferCode,
      fromWarehouse: params.fromWarehouse,
      toWarehouse: params.toWarehouse
    }
  })
}

/** 提交种源入库审批 */
export async function submitSeedSourceInboundApproval(params) {
  return submitApproval({
    id: params.inboundId,
    code: params.inboundCode,
    title: `种源入库: ${params.seedSourceName}`,
    type: ApprovalType.SEED_SOURCE_INBOUND,
    amount: params.amount || 0,
    applicantId: params.applicantId,
    applicantName: params.applicantName,
    applicantDepartment: params.department,
    businessLink: {
      type: 'seed_source_inbound',
      requestId: params.inboundId,
      requestCode: params.inboundCode
    }
  })
}

/** 提交育苗计划审批 */
export async function submitSeedlingPlanApproval(params) {
  return submitApproval({
    id: params.planId,
    code: params.planCode,
    title: `育苗计划: ${params.planName}`,
    type: ApprovalType.SEEDLING_PLAN,
    amount: 0,
    applicantId: params.applicantId,
    applicantName: params.applicantName,
    applicantDepartment: params.department,
    businessLink: {
      type: 'seedling_plan',
      requestId: params.planId,
      requestCode: params.planCode
    }
  })
}

/** 提交种植计划审批 */
export async function submitPlantingPlanApproval(params) {
  return submitApproval({
    id: params.planId,
    code: params.planCode,
    title: `种植计划: ${params.planName}`,
    type: ApprovalType.PLANTING_PLAN,
    amount: 0,
    applicantId: params.applicantId,
    applicantName: params.applicantName,
    applicantDepartment: params.department,
    businessLink: {
      type: 'planting_plan',
      requestId: params.planId,
      requestCode: params.planCode
    }
  })
}

// ========== 生产审批 ==========

/** 提交生产计划审批 */
export async function submitProductionPlanApproval(params) {
  return submitApproval({
    id: params.planId,
    code: params.planCode,
    title: `生产计划: ${params.planName}`,
    type: ApprovalType.PRODUCTION_PLAN,
    amount: params.amount || 0,
    applicantId: params.applicantId,
    applicantName: params.applicantName,
    applicantDepartment: params.department,
    businessLink: {
      type: 'production',
      requestId: params.planId,
      requestCode: params.planCode
    }
  })
}

/** 提交生产批次审批 */
export async function submitProductionBatchApproval(params) {
  return submitApproval({
    id: params.batchId,
    code: params.batchCode,
    title: `生产批次: ${params.batchName}`,
    type: ApprovalType.PRODUCTION_BATCH,
    amount: params.amount || 0,
    applicantId: params.applicantId,
    applicantName: params.applicantName,
    applicantDepartment: params.department,
    businessLink: {
      type: 'production_batch',
      requestId: params.batchId,
      batchCode: params.batchCode
    }
  })
}

/** 提交批次变更审批 */
export async function submitBatchChangeApproval(params) {
  return submitApproval({
    id: params.changeId,
    code: params.changeCode,
    title: `批次变更: ${params.batchCode}`,
    type: ApprovalType.BATCH_CHANGE,
    amount: params.amount || 0,
    applicantId: params.applicantId,
    applicantName: params.applicantName,
    applicantDepartment: params.department,
    businessLink: {
      type: 'batch_change',
      requestId: params.changeId,
      batchCode: params.batchCode
    }
  })
}

/** 提交批次作废审批 */
export async function submitBatchVoidApproval(params) {
  return submitApproval({
    id: params.voidId,
    code: params.voidCode,
    title: `批次作废: ${params.batchCode}`,
    type: ApprovalType.BATCH_VOID,
    amount: 0,
    applicantId: params.applicantId,
    applicantName: params.applicantName,
    applicantDepartment: params.department,
    businessLink: {
      type: 'batch_void',
      requestId: params.voidId,
      batchCode: params.batchCode
    }
  })
}

/** 提交技术方案审批 */
export async function submitTechSolutionApproval(params) {
  return submitApproval({
    id: params.solutionId,
    code: params.solutionCode,
    title: `技术方案: ${params.solutionName}`,
    type: ApprovalType.TECH_SOLUTION,
    amount: params.amount || 0,
    applicantId: params.applicantId,
    applicantName: params.applicantName,
    applicantDepartment: params.department,
    businessLink: {
      type: 'tech_solution',
      requestId: params.solutionId,
      requestCode: params.solutionCode
    }
  })
}

// ========== 农事审批 ==========

/** 提交任务派发审批 */
export async function submitTaskDispatchApproval(params) {
  return submitApproval({
    id: params.taskId,
    code: params.taskCode,
    title: `任务派发: ${params.taskName}`,
    type: ApprovalType.TASK_DISPATCH,
    amount: 0,
    applicantId: params.applicantId,
    applicantName: params.applicantName,
    applicantDepartment: params.department,
    businessLink: {
      type: 'task_dispatch',
      requestId: params.taskId,
      requestCode: params.taskCode
    }
  })
}

/** 提交任务变更审批 */
export async function submitTaskChangeApproval(params) {
  return submitApproval({
    id: params.changeId,
    code: params.changeCode,
    title: `任务变更: ${params.taskCode}`,
    type: ApprovalType.TASK_CHANGE,
    amount: 0,
    applicantId: params.applicantId,
    applicantName: params.applicantName,
    applicantDepartment: params.department,
    businessLink: {
      type: 'task_change',
      requestId: params.changeId,
      requestCode: params.changeCode,
      taskCode: params.taskCode
    }
  })
}

/** 提交巡查问题审批 */
export async function submitInspectionIssueApproval(params) {
  return submitApproval({
    id: params.issueId,
    code: params.issueCode,
    title: `巡查问题: ${params.issueTitle}`,
    type: ApprovalType.INSPECTION_ISSUE,
    amount: 0,
    applicantId: params.applicantId,
    applicantName: params.applicantName,
    applicantDepartment: params.department,
    businessLink: {
      type: 'inspection_issue',
      requestId: params.issueId,
      requestCode: params.issueCode
    }
  })
}

/** 提交问题整改审批 */
export async function submitIssueResolveApproval(params) {
  return submitApproval({
    id: params.resolveId,
    code: params.resolveCode,
    title: `问题整改: ${params.issueCode}`,
    type: ApprovalType.ISSUE_RESOLVE,
    amount: 0,
    applicantId: params.applicantId,
    applicantName: params.applicantName,
    applicantDepartment: params.department,
    businessLink: {
      type: 'issue_resolve',
      requestId: params.resolveId,
      requestCode: params.resolveCode,
      issueCode: params.issueCode
    }
  })
}

/** 提交采收申请审批 */
export async function submitHarvestRequestApproval(params) {
  return submitApproval({
    id: params.harvestId,
    code: params.harvestCode,
    title: `采收申请: ${params.cropName}`,
    type: ApprovalType.HARVEST_REQUEST,
    amount: params.amount || 0,
    applicantId: params.applicantId,
    applicantName: params.applicantName,
    applicantDepartment: params.department,
    businessLink: {
      type: 'harvest_request',
      requestId: params.harvestId,
      requestCode: params.harvestCode
    }
  })
}

// ========== 补录审批 ==========

/** 提交种源补录审批 */
export async function submitSeedSourceSupplementaryApproval(params) {
  return submitApproval({
    id: params.recordId,
    code: params.recordCode,
    title: `种源补录: ${params.seedSourceName}`,
    type: ApprovalType.SEED_SOURCE_SUPPLEMENTARY,
    amount: 0,
    applicantId: params.applicantId,
    applicantName: params.applicantName,
    applicantDepartment: params.department,
    businessLink: {
      type: 'seed_source_supplementary',
      requestId: params.recordId,
      requestCode: params.recordCode
    }
  })
}

/** 提交育苗补录审批 */
export async function submitSeedlingSupplementaryApproval(params) {
  return submitApproval({
    id: params.recordId,
    code: params.recordCode,
    title: `育苗补录: ${params.planName}`,
    type: ApprovalType.SEEDLING_SUPPLEMENTARY,
    amount: 0,
    applicantId: params.applicantId,
    applicantName: params.applicantName,
    applicantDepartment: params.department,
    businessLink: {
      type: 'seedling_supplementary',
      requestId: params.recordId,
      requestCode: params.recordCode
    }
  })
}

/** 提交作物入库补录审批 */
export async function submitCropStorageSupplementaryApproval(params) {
  return submitApproval({
    id: params.recordId,
    code: params.recordCode,
    title: `作物入库补录: ${params.cropName}`,
    type: ApprovalType.CROP_STORAGE_SUPPLEMENTARY,
    amount: 0,
    applicantId: params.applicantId,
    applicantName: params.applicantName,
    applicantDepartment: params.department,
    businessLink: {
      type: 'crop_storage_supplementary',
      requestId: params.recordId,
      requestCode: params.recordCode
    }
  })
}

// ========== 指标/公告审批 ==========

/** 提交指标发布审批 */
export async function submitIndicatorApproval(params) {
  return submitApproval({
    id: params.indicatorId,
    code: params.indicatorCode,
    title: `指标发布: ${params.indicatorName}`,
    type: ApprovalType.INDICATOR_APPROVAL,
    amount: 0,
    applicantId: params.applicantId,
    applicantName: params.applicantName,
    applicantDepartment: params.department,
    businessLink: {
      type: 'indicator_approval',
      requestId: params.indicatorId,
      requestCode: params.indicatorCode
    }
  })
}

/** 提交指标调整审批 */
export async function submitIndicatorAdjustApproval(params) {
  return submitApproval({
    id: params.adjustId,
    code: params.adjustCode,
    title: `指标调整: ${params.adjustReason}`,
    type: ApprovalType.INDICATOR_ADJUST,
    amount: 0,
    applicantId: params.applicantId,
    applicantName: params.applicantName,
    applicantDepartment: params.department,
    businessLink: {
      type: 'indicator_adjust',
      requestId: params.adjustId,
      requestCode: params.adjustCode
    }
  })
}

/** 提交公告审批 */
export async function submitAnnouncementApproval(params) {
  return submitApproval({
    id: params.announcementId,
    code: params.announcementCode,
    title: `公告审批: ${params.title}`,
    type: ApprovalType.ANNOUNCEMENT_APPROVAL,
    amount: 0,
    applicantId: params.applicantId,
    applicantName: params.applicantName,
    applicantDepartment: params.department,
    businessLink: {
      type: 'announcement',
      requestId: params.announcementId,
      requestCode: params.announcementCode
    }
  })
}

// ========== 预算审批 ==========

/** 提交预算编制审批 */
export async function submitBudgetCreateApproval(params) {
  return submitApproval({
    id: params.budgetId,
    code: params.budgetCode,
    title: `预算编制: ${params.budgetName}`,
    type: ApprovalType.BUDGET_CREATE,
    amount: params.amount || 0,
    applicantId: params.applicantId,
    applicantName: params.applicantName,
    applicantDepartment: params.department,
    businessLink: {
      type: 'budget_create',
      requestId: params.budgetId,
      requestCode: params.budgetCode
    }
  })
}

/** 提交预算调整审批 */
export async function submitBudgetAdjustApproval(params) {
  return submitApproval({
    id: params.adjustId,
    code: params.adjustCode,
    title: `预算调整: ${params.reason}`,
    type: ApprovalType.BUDGET_ADJUST,
    amount: params.amount || 0,
    applicantId: params.applicantId,
    applicantName: params.applicantName,
    applicantDepartment: params.department,
    businessLink: {
      type: 'budget_adjust',
      requestId: params.adjustId,
      requestCode: params.adjustCode
    }
  })
}

// ========== HR审批 ==========

/** 提交请假审批 */
export async function submitLeaveApproval(params) {
  return submitApproval({
    id: params.leaveId,
    code: params.leaveCode,
    title: `请假申请: ${params.leaveType} ${params.days}天`,
    type: ApprovalType.LEAVE,
    amount: 0,
    applicantId: params.applicantId,
    applicantName: params.applicantName,
    applicantDepartment: params.department,
    additionalData: { leaveDays: params.days },
    description: params.reason || '',
    businessLink: {
      type: 'leave',
      requestId: params.leaveId,
      requestCode: params.leaveCode,
      leaveType: params.leaveType,
      totalDays: params.days,
      reason: params.reason
    }
  })
}

/** 提交加班审批 */
export async function submitOvertimeApproval(params) {
  return submitApproval({
    id: params.overtimeId,
    code: params.overtimeCode,
    title: `加班申请: ${params.overtimeType} ${params.hours}小时`,
    type: ApprovalType.OVERTIME,
    amount: 0,
    applicantId: params.applicantId,
    applicantName: params.applicantName,
    applicantDepartment: params.department,
    additionalData: { overtimeHours: params.hours },
    businessLink: {
      type: 'overtime',
      requestId: params.overtimeId,
      requestCode: params.overtimeCode,
      overtimeType: params.overtimeType,
      totalHours: params.hours,
      date: params.date
    }
  })
}

/** 提交离职审批 */
export async function submitResignationApproval(params) {
  return submitApproval({
    id: params.resignationId,
    code: params.resignationCode,
    title: `离职申请: ${params.employeeName}`,
    type: ApprovalType.RESIGNATION,
    amount: 0,
    applicantId: params.applicantId,
    applicantName: params.applicantName,
    applicantDepartment: params.department,
    businessLink: {
      type: 'resign',
      requestId: params.resignationId,
      requestCode: params.resignationCode,
      employeeId: params.employeeId,
      employeeName: params.employeeName,
      expectedResignDate: params.expectedDate
    }
  })
}

/** 提交招聘审批 */
export async function submitRecruitmentApproval(params) {
  return submitApproval({
    id: params.recruitmentId,
    code: params.recruitmentCode,
    title: `招聘申请: ${params.position}`,
    type: ApprovalType.RECRUITMENT,
    amount: 0,
    applicantId: params.applicantId,
    applicantName: params.applicantName,
    applicantDepartment: params.department,
    businessLink: {
      type: 'recruitment',
      requestId: params.recruitmentId,
      requestCode: params.recruitmentCode,
      position: params.position
    }
  })
}

/** 提交入职审批 */
export async function submitOnboardingApproval(params) {
  return submitApproval({
    id: params.onboardingId,
    code: params.onboardingCode,
    title: `入职审批: ${params.employeeName}`,
    type: ApprovalType.ONBOARDING,
    amount: 0,
    applicantId: params.applicantId,
    applicantName: params.applicantName,
    applicantDepartment: params.department,
    businessLink: {
      type: 'onboarding',
      requestId: params.onboardingId,
      requestCode: params.onboardingCode,
      employeeName: params.employeeName
    }
  })
}

/** 提交考勤补录审批 */
export async function submitAttendanceRepairApproval(params) {
  return submitApproval({
    id: params.repairId,
    code: params.repairCode,
    title: `考勤补录: ${params.employeeName}`,
    type: ApprovalType.ATTENDANCE_REPAIR,
    amount: 0,
    applicantId: params.applicantId,
    applicantName: params.applicantName,
    applicantDepartment: params.department,
    businessLink: {
      type: 'attendance_repair',
      requestId: params.repairId,
      requestCode: params.repairCode
    }
  })
}

/** 提交调薪审批 */
export async function submitSalaryAdjustmentApproval(params) {
  return submitApproval({
    id: params.adjustId,
    code: params.adjustCode,
    title: `调薪审批: ${params.employeeName}`,
    type: ApprovalType.SALARY_ADJUSTMENT,
    amount: params.newSalary || 0,
    applicantId: params.applicantId,
    applicantName: params.applicantName,
    applicantDepartment: params.department,
    businessLink: {
      type: 'salary_adjustment',
      requestId: params.adjustId,
      requestCode: params.adjustCode,
      employeeName: params.employeeName
    }
  })
}

/** 提交合同续签审批 */
export async function submitContractRenewalApproval(params) {
  return submitApproval({
    id: params.renewalId,
    code: params.renewalCode,
    title: `合同续签: ${params.employeeName}`,
    type: ApprovalType.CONTRACT_RENEWAL,
    amount: 0,
    applicantId: params.applicantId,
    applicantName: params.applicantName,
    applicantDepartment: params.department,
    businessLink: {
      type: 'contract_renewal',
      requestId: params.renewalId,
      requestCode: params.renewalCode,
      employeeName: params.employeeName
    }
  })
}

/** 提交工资预算审批 */
export async function submitSalaryBudgetApproval(params) {
  return submitApproval({
    id: params.budgetId,
    code: params.budgetCode,
    title: `工资预算: ${params.period}`,
    type: ApprovalType.SALARY_BUDGET,
    amount: params.amount || 0,
    applicantId: params.applicantId,
    applicantName: params.applicantName,
    applicantDepartment: params.department,
    businessLink: {
      type: 'salary_budget',
      requestId: params.budgetId,
      requestCode: params.budgetCode
    }
  })
}

/** 提交转岗审批 */
export async function submitTransferApproval(params) {
  return submitApproval({
    id: params.transferId,
    code: params.transferCode,
    title: `转岗申请: ${params.employeeName}`,
    type: ApprovalType.TRANSFER,
    amount: 0,
    applicantId: params.applicantId,
    applicantName: params.applicantName,
    applicantDepartment: params.department,
    businessLink: {
      type: 'transfer',
      requestId: params.transferId,
      requestCode: params.transferCode,
      employeeName: params.employeeName
    }
  })
}
