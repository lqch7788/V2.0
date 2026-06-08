/**
 * 采购计划数据类型定义
 * 供前端其他模块引用
 * @see V1.1: D:\TMcrop\yuanxingtu\V1.1\src\services\purchasePlanService.ts
 */

/**
 * @typedef {Object} PurchasePlanItem
 * @property {string} id
 * @property {string} materialId
 * @property {string} materialCode
 * @property {string} materialName
 * @property {string} category
 * @property {string} specification
 * @property {string} unit
 * @property {number} quantity
 * @property {number} estimatedPrice
 * @property {number} estimatedTotalPrice
 * @property {string} supplier
 * @property {string} location
 * @property {string} batchNo
 * @property {string} productionDate
 * @property {string} expiryDate
 * @property {string} purpose
 * @property {string} remark
 * @property {string} [relatedBatchCode]
 *
 * @typedef {Object} PurchasePlan
 * @property {string} id
 * @property {string} purchaseApplicationCode
 * @property {string} relatedBatchCode
 * @property {string} purchaseType
 * @property {string} purchaseTypeName
 * @property {string} applicant
 * @property {string} applicantId
 * @property {string} applicantDepartment
 * @property {string} applyDate
 * @property {string} requiredDate
 * @property {string} priority
 * @property {string} priorityText
 * @property {string} status
 * @property {string} statusText
 * @property {number} itemCount
 * @property {PurchasePlanItem[]} items
 * @property {string} remarks
 * @property {string} approvalPerson
 * @property {string} approvalStatus
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {string} planCode
 * @property {string} planTitle
 * @property {string} planType
 * @property {string} departmentName
 * @property {string} applicantName
 * @property {string} applyDate2
 * @property {string} expectedDate
 * @property {string} supplierId
 * @property {string} supplierName
 * @property {number} totalAmount
 * @property {string[]} attachments
 */
