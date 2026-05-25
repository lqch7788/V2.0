// ============================================================
// 审批中心 - 业务联动接口定义
// 文件路径：src/types/approvalIntegration.js
// 功能：审批结果触发其他模块更新，支持全部37种审批类型
// ============================================================

// ============================================================
// 联动注册表
// ============================================================

/** @type {Array<Object>} 审批联动处理器注册表 */
export const approvalIntegrationRegistry = []

// 注册联动处理器
export function registerApprovalIntegration(handler) {
  approvalIntegrationRegistry.push(handler)
}

// 执行联动
export function executeApprovalIntegration(action, approval, extra = {}) {
  const businessLink = approval.businessLink

  for (const handler of approvalIntegrationRegistry) {
    switch (action) {
      case 'approved':
        if (!businessLink) break
        // ========== 业务审批（10种）==========
        if (businessLink.type === 'material' && handler.onMaterialRequestApproved) {
          handler.onMaterialRequestApproved(approval, businessLink)
        }
        if (businessLink.type === 'return' && handler.onReturnMaterialApproved) {
          handler.onReturnMaterialApproved(approval, businessLink)
        }
        if (businessLink.type === 'purchase' && handler.onPurchaseRequestApproved) {
          handler.onPurchaseRequestApproved(approval, businessLink)
        }
        if (businessLink.type === 'material_inbound' && handler.onMaterialInboundApproved) {
          handler.onMaterialInboundApproved(approval, businessLink)
        }
        if (businessLink.type === 'material_transfer' && handler.onMaterialTransferApproved) {
          handler.onMaterialTransferApproved(approval, businessLink)
        }
        if (businessLink.type === 'seed_source_inbound' && handler.onSeedSourceInboundApproved) {
          handler.onSeedSourceInboundApproved(approval, businessLink)
        }
        if (businessLink.type === 'seedling_plan' && handler.onSeedlingPlanApproved) {
          handler.onSeedlingPlanApproved(approval, businessLink)
        }
        if (businessLink.type === 'planting_plan' && handler.onPlantingPlanApproved) {
          handler.onPlantingPlanApproved(approval, businessLink)
        }
        if (businessLink.type === 'order_create' && handler.onOrderCreateApproved) {
          handler.onOrderCreateApproved(approval, businessLink)
        }
        if (businessLink.type === 'order_change' && handler.onOrderChangeApproved) {
          handler.onOrderChangeApproved(approval, businessLink)
        }
        // ========== 生产审批（5种）==========
        if (businessLink.type === 'production' && handler.onProductionPlanApproved) {
          handler.onProductionPlanApproved(approval, businessLink)
        }
        if (businessLink.type === 'production_batch' && handler.onProductionBatchApproved) {
          handler.onProductionBatchApproved(approval, businessLink)
        }
        if (businessLink.type === 'batch_change' && handler.onBatchChangeApproved) {
          handler.onBatchChangeApproved(approval, businessLink)
        }
        if (businessLink.type === 'batch_void' && handler.onBatchVoidApproved) {
          handler.onBatchVoidApproved(approval, businessLink)
        }
        if (businessLink.type === 'tech_solution' && handler.onTechSolutionApproved) {
          handler.onTechSolutionApproved(approval, businessLink)
        }
        // ========== 农事审批（4种）==========
        if (businessLink.type === 'task_dispatch' && handler.onTaskDispatchApproved) {
          handler.onTaskDispatchApproved(approval, businessLink)
        }
        if (businessLink.type === 'task_change' && handler.onTaskChangeApproved) {
          handler.onTaskChangeApproved(approval, businessLink)
        }
        if (businessLink.type === 'inspection_issue' && handler.onInspectionIssueApproved) {
          handler.onInspectionIssueApproved(approval, businessLink)
        }
        if (businessLink.type === 'issue_resolve' && handler.onIssueResolveApproved) {
          handler.onIssueResolveApproved(approval, businessLink)
        }
        // ========== 采收审批（1种）==========
        if (businessLink.type === 'harvest' && handler.onHarvestRequestApproved) {
          handler.onHarvestRequestApproved(approval, businessLink)
        }
        // ========== 作物补录审批（3种）==========
        if (businessLink.type === 'seed_source' && handler.onSeedSourceSupplementaryApproved) {
          handler.onSeedSourceSupplementaryApproved(approval, businessLink)
        }
        if (businessLink.type === 'seedling' && handler.onSeedlingSupplementaryApproved) {
          handler.onSeedlingSupplementaryApproved(approval, businessLink)
        }
        if (businessLink.type === 'crop_storage' && handler.onCropStorageSupplementaryApproved) {
          handler.onCropStorageSupplementaryApproved(approval, businessLink)
        }
        // ========== 指标/公告审批（2种）==========
        if (businessLink.type === 'indicator' && handler.onIndicatorApprovalApproved) {
          handler.onIndicatorApprovalApproved(approval, businessLink)
        }
        if (businessLink.type === 'announcement' && handler.onAnnouncementApprovalApproved) {
          handler.onAnnouncementApprovalApproved(approval, businessLink)
        }
        // ========== 成本审批（2种）==========
        if (businessLink.type === 'budget_create' && handler.onBudgetCreateApproved) {
          handler.onBudgetCreateApproved(approval, businessLink)
        }
        if (businessLink.type === 'budget_adjust' && handler.onBudgetAdjustApproved) {
          handler.onBudgetAdjustApproved(approval, businessLink)
        }
        // ========== HR审批（11种）==========
        if (businessLink.type === 'leave' && handler.onLeaveApproved) {
          handler.onLeaveApproved(approval, businessLink)
        }
        if (businessLink.type === 'overtime' && handler.onOvertimeApproved) {
          handler.onOvertimeApproved(approval, businessLink)
        }
        if (businessLink.type === 'resign' && handler.onResignationApproved) {
          handler.onResignationApproved(approval, businessLink)
        }
        if (businessLink.type === 'recruitment' && handler.onRecruitmentApproved) {
          handler.onRecruitmentApproved(approval, businessLink)
        }
        if (businessLink.type === 'onboarding' && handler.onOnboardingApproved) {
          handler.onOnboardingApproved(approval, businessLink)
        }
        if (businessLink.type === 'attendance_repair' && handler.onAttendanceRepairApproved) {
          handler.onAttendanceRepairApproved(approval, businessLink)
        }
        if (businessLink.type === 'salary_adjustment' && handler.onSalaryAdjustmentApproved) {
          handler.onSalaryAdjustmentApproved(approval, businessLink)
        }
        if (businessLink.type === 'contract_renewal' && handler.onContractRenewalApproved) {
          handler.onContractRenewalApproved(approval, businessLink)
        }
        if (businessLink.type === 'salary_budget' && handler.onSalaryBudgetApproved) {
          handler.onSalaryBudgetApproved(approval, businessLink)
        }
        if (businessLink.type === 'transfer' && handler.onTransferApproved) {
          handler.onTransferApproved(approval, businessLink)
        }
        break

      case 'partially_approved':
        if (businessLink?.type === 'material' && handler.onMaterialRequestPartiallyApproved) {
          handler.onMaterialRequestPartiallyApproved(
            approval,
            businessLink,
            extra.approvedItems || {}
          )
        }
        break

      case 'rejected':
        if (handler.onApprovalRejected) {
          handler.onApprovalRejected(approval, extra.reason || '')
        }
        break

      case 'cancelled':
        if (handler.onApprovalCancelled) {
          handler.onApprovalCancelled(approval, extra.reason || '')
        }
        break
    }
  }
}

// ============================================================
// 联动处理器示例 - 37种审批类型全覆盖
// ============================================================

// ========== 业务审批处理器（10种）==========

// 1. 物资/领料申请
export const materialRequestHandler = {
  onMaterialRequestApproved: (approval, link) => {
    console.log('【联动】领料申请审批通过', { approvalCode: approval.code, materials: link.materials })
  },
  onMaterialRequestPartiallyApproved: (approval, link, approvedItems) => {
    console.log('【联动】领料申请部分通过', { approvalCode: approval.code, approvedItems })
  },
}

// 2. 退料单
export const returnMaterialHandler = {
  onReturnMaterialApproved: (approval, link) => {
    console.log('【联动】退料单审批通过', { approvalCode: approval.code, requestCode: link.requestCode })
  },
}

// 3. 采购申请
export const purchaseRequestHandler = {
  onPurchaseRequestApproved: (approval, link) => {
    console.log('【联动】采购申请审批通过', { approvalCode: approval.code, totalAmount: link.totalAmount })
  },
}

// 4. 物料入库
export const materialInboundHandler = {
  onMaterialInboundApproved: (approval, link) => {
    console.log('【联动】物料入库审批通过', { approvalCode: approval.code, requestCode: link.requestCode })
  },
}

// 5. 库存调拨
export const materialTransferHandler = {
  onMaterialTransferApproved: (approval, link) => {
    console.log('【联动】库存调拨审批通过', { approvalCode: approval.code, requestCode: link.requestCode })
  },
}

// 6. 种源入库
export const seedSourceInboundHandler = {
  onSeedSourceInboundApproved: (approval, link) => {
    console.log('【联动】种源入库审批通过', { approvalCode: approval.code, requestCode: link.requestCode })
  },
}

// 7. 育苗计划
export const seedlingPlanHandler = {
  onSeedlingPlanApproved: (approval, link) => {
    console.log('【联动】育苗计划审批通过', { approvalCode: approval.code, requestCode: link.requestCode })
  },
}

// 8. 种植计划
export const plantingPlanHandler = {
  onPlantingPlanApproved: (approval, link) => {
    console.log('【联动】种植计划审批通过', { approvalCode: approval.code, requestCode: link.requestCode })
  },
}

// 9. 订单创建
export const orderCreateHandler = {
  onOrderCreateApproved: (approval, link) => {
    console.log('【联动】订单创建审批通过', { approvalCode: approval.code, requestCode: link.requestCode })
  },
}

// 10. 订单变更
export const orderChangeHandler = {
  onOrderChangeApproved: (approval, link) => {
    console.log('【联动】订单变更审批通过', { approvalCode: approval.code, requestCode: link.requestCode })
  },
}

// ========== 生产审批处理器（5种）==========

export const productionPlanHandler = {
  onProductionPlanApproved: (approval, link) => {
    console.log('【联动】生产计划审批通过', { approvalCode: approval.code, requestCode: link.requestCode })
  },
}

export const productionBatchHandler = {
  onProductionBatchApproved: (approval, link) => {
    console.log('【联动】生产批次审批通过', { approvalCode: approval.code, requestCode: link.requestCode })
  },
}

export const batchChangeHandler = {
  onBatchChangeApproved: (approval, link) => {
    console.log('【联动】批次变更审批通过', { approvalCode: approval.code, requestCode: link.requestCode })
  },
}

export const batchVoidHandler = {
  onBatchVoidApproved: (approval, link) => {
    console.log('【联动】批次作废审批通过', { approvalCode: approval.code, requestCode: link.requestCode })
  },
}

export const techSolutionHandler = {
  onTechSolutionApproved: (approval, link) => {
    console.log('【联动】技术方案审批通过', { approvalCode: approval.code, requestCode: link.requestCode })
  },
}

// ========== 农事审批处理器（4种）==========

export const taskDispatchHandler = {
  onTaskDispatchApproved: (approval, link) => {
    console.log('【联动】任务派发审批通过', { approvalCode: approval.code, requestCode: link.requestCode })
  },
}

export const taskChangeHandler = {
  onTaskChangeApproved: (approval, link) => {
    console.log('【联动】任务变更审批通过', { approvalCode: approval.code, requestCode: link.requestCode })
  },
}

export const inspectionIssueHandler = {
  onInspectionIssueApproved: (approval, link) => {
    console.log('【联动】巡查问题审批通过', { approvalCode: approval.code, requestCode: link.requestCode })
  },
}

export const issueResolveHandler = {
  onIssueResolveApproved: (approval, link) => {
    console.log('【联动】问题整改审批通过', { approvalCode: approval.code, requestCode: link.requestCode })
  },
}

// ========== 采收审批处理器（1种）==========

export const harvestRequestHandler = {
  onHarvestRequestApproved: (approval, link) => {
    console.log('【联动】采收申请审批通过', { approvalCode: approval.code, requestCode: link.requestCode })
  },
}

// ========== 作物补录审批处理器（3种）==========

export const seedSourceSupplementaryHandler = {
  onSeedSourceSupplementaryApproved: (approval, link) => {
    console.log('【联动】种源补录审批通过', { approvalCode: approval.code, requestCode: link.requestCode })
  },
}

export const seedlingSupplementaryHandler = {
  onSeedlingSupplementaryApproved: (approval, link) => {
    console.log('【联动】育苗补录审批通过', { approvalCode: approval.code, requestCode: link.requestCode })
  },
}

export const cropStorageSupplementaryHandler = {
  onCropStorageSupplementaryApproved: (approval, link) => {
    console.log('【联动】作物入库补录审批通过', { approvalCode: approval.code, requestCode: link.requestCode })
  },
}

// ========== 指标/公告审批处理器（2种）==========

export const indicatorApprovalHandler = {
  onIndicatorApprovalApproved: (approval, link) => {
    console.log('【联动】指标审批通过', { approvalCode: approval.code, requestCode: link.requestCode })
  },
}

export const announcementApprovalHandler = {
  onAnnouncementApprovalApproved: (approval, link) => {
    console.log('【联动】公告审批通过', { approvalCode: approval.code, requestCode: link.requestCode })
  },
}

// ========== 成本审批处理器（2种）==========

export const budgetCreateHandler = {
  onBudgetCreateApproved: (approval, link) => {
    console.log('【联动】预算编制审批通过', { approvalCode: approval.code, requestCode: link.requestCode })
  },
}

export const budgetAdjustHandler = {
  onBudgetAdjustApproved: (approval, link) => {
    console.log('【联动】预算调整审批通过', { approvalCode: approval.code, requestCode: link.requestCode })
  },
}

// ========== HR审批处理器（11种）==========

export const leaveHandler = {
  onLeaveApproved: (approval, link) => {
    console.log('【联动】请假审批通过', { approvalCode: approval.code, applicantName: approval.applicantName })
  },
}

export const overtimeHandler = {
  onOvertimeApproved: (approval, link) => {
    console.log('【联动】加班审批通过', { approvalCode: approval.code, applicantName: approval.applicantName })
  },
}

export const resignationHandler = {
  onResignationApproved: (approval, link) => {
    console.log('【联动】离职审批通过', { approvalCode: approval.code, applicantName: approval.applicantName })
  },
}

export const recruitmentHandler = {
  onRecruitmentApproved: (approval, link) => {
    console.log('【联动】招聘审批通过', { approvalCode: approval.code, requestCode: link.requestCode })
  },
}

export const onboardingHandler = {
  onOnboardingApproved: (approval, link) => {
    console.log('【联动】入职审批通过', { approvalCode: approval.code, applicantName: approval.applicantName })
  },
}

export const attendanceRepairHandler = {
  onAttendanceRepairApproved: (approval, link) => {
    console.log('【联动】考勤补录审批通过', { approvalCode: approval.code, applicantName: approval.applicantName })
  },
}

export const salaryAdjustmentHandler = {
  onSalaryAdjustmentApproved: (approval, link) => {
    console.log('【联动】调薪审批通过', { approvalCode: approval.code, applicantName: approval.applicantName })
  },
}

export const contractRenewalHandler = {
  onContractRenewalApproved: (approval, link) => {
    console.log('【联动】合同续签审批通过', { approvalCode: approval.code, applicantName: approval.applicantName })
  },
}

export const salaryBudgetHandler = {
  onSalaryBudgetApproved: (approval, link) => {
    console.log('【联动】工资预算审批通过', { approvalCode: approval.code, requestCode: link.requestCode })
  },
}

export const transferHandler = {
  onTransferApproved: (approval, link) => {
    console.log('【联动】转岗审批通过', { approvalCode: approval.code, applicantName: approval.applicantName })
  },
}

// ============================================================
// 注册所有处理器
// ============================================================

export function registerAllHandlers() {
  // 业务审批（10种）
  registerApprovalIntegration(materialRequestHandler)
  registerApprovalIntegration(returnMaterialHandler)
  registerApprovalIntegration(purchaseRequestHandler)
  registerApprovalIntegration(materialInboundHandler)
  registerApprovalIntegration(materialTransferHandler)
  registerApprovalIntegration(seedSourceInboundHandler)
  registerApprovalIntegration(seedlingPlanHandler)
  registerApprovalIntegration(plantingPlanHandler)
  registerApprovalIntegration(orderCreateHandler)
  registerApprovalIntegration(orderChangeHandler)
  // 生产审批（5种）
  registerApprovalIntegration(productionPlanHandler)
  registerApprovalIntegration(productionBatchHandler)
  registerApprovalIntegration(batchChangeHandler)
  registerApprovalIntegration(batchVoidHandler)
  registerApprovalIntegration(techSolutionHandler)
  // 农事审批（4种）
  registerApprovalIntegration(taskDispatchHandler)
  registerApprovalIntegration(taskChangeHandler)
  registerApprovalIntegration(inspectionIssueHandler)
  registerApprovalIntegration(issueResolveHandler)
  // 采收审批（1种）
  registerApprovalIntegration(harvestRequestHandler)
  // 作物补录审批（3种）
  registerApprovalIntegration(seedSourceSupplementaryHandler)
  registerApprovalIntegration(seedlingSupplementaryHandler)
  registerApprovalIntegration(cropStorageSupplementaryHandler)
  // 指标/公告审批（2种）
  registerApprovalIntegration(indicatorApprovalHandler)
  registerApprovalIntegration(announcementApprovalHandler)
  // 成本审批（2种）
  registerApprovalIntegration(budgetCreateHandler)
  registerApprovalIntegration(budgetAdjustHandler)
  // HR审批（11种）
  registerApprovalIntegration(leaveHandler)
  registerApprovalIntegration(overtimeHandler)
  registerApprovalIntegration(resignationHandler)
  registerApprovalIntegration(recruitmentHandler)
  registerApprovalIntegration(onboardingHandler)
  registerApprovalIntegration(attendanceRepairHandler)
  registerApprovalIntegration(salaryAdjustmentHandler)
  registerApprovalIntegration(contractRenewalHandler)
  registerApprovalIntegration(salaryBudgetHandler)
  registerApprovalIntegration(transferHandler)
}
