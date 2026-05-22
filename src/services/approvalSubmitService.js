/**
 * 审批提交辅助服务（简化版）
 * 迁移自 V1.1 src/services/approvalSubmitService.ts
 */

import { enhancedApiClient } from '../lib/apiClient'

/**
 * 提交采购审批
 */
export async function submitPurchaseApproval(params) {
  try {
    const approval = {
      id: `approval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      code: `SP${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}CG${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      title: `采购申请: ${params.purchaseName}`,
      type: 'PURCHASE_REQUEST',
      amount: params.amount,
      applicantId: params.applicantId,
      applicantName: params.applicantName,
      applicantDepartment: params.department,
      status: 'pending',
      businessLink: {
        type: 'purchase',
        requestId: params.purchaseId,
        requestCode: params.purchaseCode,
      },
    }

    const response = await enhancedApiClient.post('/approvals', approval)

    if (!response || !response.success) {
      return {
        success: false,
        autoApprove: false,
        level: 'unknown',
        message: response?.error || '提交审批失败',
      }
    }

    // 自动通过逻辑（金额阈值，这里简化为不自动通过）
    return {
      success: true,
      approvalId: approval.id,
      approvalCode: approval.code,
      autoApprove: false,
      level: 'normal',
      message: '已提交审批',
    }
  } catch (error) {
    console.error('【审批提交】提交审批失败', error)
    return {
      success: false,
      autoApprove: false,
      level: 'unknown',
      message: `提交审批异常: ${error}`,
    }
  }
}
