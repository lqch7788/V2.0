/**
 * 通用状态枚举常量
 * 解决魔法字符串问题，统一管理状态值
 */
// ============================================================
// 通用状态
// ============================================================
export var CommonStatus;
(function (CommonStatus) {
    CommonStatus["ACTIVE"] = "active";
    CommonStatus["INACTIVE"] = "inactive";
    CommonStatus["PENDING"] = "pending";
    CommonStatus["APPROVED"] = "approved";
    CommonStatus["REJECTED"] = "rejected";
    CommonStatus["CANCELLED"] = "cancelled";
    CommonStatus["COMPLETED"] = "completed";
    CommonStatus["FAILED"] = "failed";
    CommonStatus["DRAFT"] = "draft";
})(CommonStatus || (CommonStatus = {}));
// ============================================================
// 任务状态
// ============================================================
export var TaskStatus;
(function (TaskStatus) {
    TaskStatus["PENDING"] = "pending";
    TaskStatus["IN_PROGRESS"] = "in_progress";
    TaskStatus["COMPLETED"] = "completed";
    TaskStatus["CANCELLED"] = "cancelled";
    TaskStatus["OVERDUE"] = "overdue";
})(TaskStatus || (TaskStatus = {}));
// ============================================================
// 作物生长阶段
// ============================================================
export var CropStage;
(function (CropStage) {
    CropStage["SEEDLING"] = "seedling";
    CropStage["VEGETATIVE"] = "vegetative";
    CropStage["FLOWERING"] = "flowering";
    CropStage["FRUITING"] = "fruiting";
    CropStage["HARVEST"] = "harvest";
    CropStage["DORMANT"] = "dormant";
})(CropStage || (CropStage = {}));
// ============================================================
// 库存状态
// ============================================================
export var InventoryStatus;
(function (InventoryStatus) {
    InventoryStatus["IN_STOCK"] = "in_stock";
    InventoryStatus["OUT_OF_STOCK"] = "out_of_stock";
    InventoryStatus["LOW_STOCK"] = "low_stock";
    InventoryStatus["EXPIRED"] = "expired";
    InventoryStatus["DAMAGED"] = "damaged";
    InventoryStatus["RESERVED"] = "reserved";
})(InventoryStatus || (InventoryStatus = {}));
// ============================================================
// 审批状态（从前端 types/approval.ts 同步）
// ============================================================
export var ApprovalStatusEnum;
(function (ApprovalStatusEnum) {
    ApprovalStatusEnum["DRAFT"] = "draft";
    ApprovalStatusEnum["PENDING"] = "pending";
    ApprovalStatusEnum["APPROVED"] = "approved";
    ApprovalStatusEnum["PARTIALLY_APPROVED"] = "partially_approved";
    ApprovalStatusEnum["REJECTED"] = "rejected";
    ApprovalStatusEnum["CANCELLED"] = "cancelled";
})(ApprovalStatusEnum || (ApprovalStatusEnum = {}));
// ============================================================
// 审批动作
// ============================================================
export var ApprovalActionEnum;
(function (ApprovalActionEnum) {
    ApprovalActionEnum["APPROVE"] = "approve";
    ApprovalActionEnum["REJECT"] = "reject";
    ApprovalActionEnum["PARTIALLY_APPROVE"] = "partially_approve";
    ApprovalActionEnum["CANCEL"] = "cancel";
})(ApprovalActionEnum || (ApprovalActionEnum = {}));
// ============================================================
// 优先级
// ============================================================
export var Priority;
(function (Priority) {
    Priority["LOW"] = "low";
    Priority["NORMAL"] = "normal";
    Priority["HIGH"] = "high";
    Priority["URGENT"] = "urgent";
})(Priority || (Priority = {}));
// ============================================================
// 请假类型
// ============================================================
export var LeaveType;
(function (LeaveType) {
    LeaveType["ANNUAL"] = "annual";
    LeaveType["SICK"] = "sick";
    LeaveType["PERSONAL"] = "personal";
    LeaveType["MARRIAGE"] = "marriage";
    LeaveType["MATERNITY"] = "maternity";
    LeaveType["FUNERAL"] = "funeral";
})(LeaveType || (LeaveType = {}));
// ============================================================
// 加班类型
// ============================================================
export var OvertimeType;
(function (OvertimeType) {
    OvertimeType["WEEKDAY"] = "weekday";
    OvertimeType["WEEKEND"] = "weekend";
    OvertimeType["HOLIDAY"] = "holiday";
})(OvertimeType || (OvertimeType = {}));
// ============================================================
// 人员状态
// ============================================================
export var EmployeeStatus;
(function (EmployeeStatus) {
    EmployeeStatus["ON_BOARD"] = "on_board";
    EmployeeStatus["RESIGNED"] = "resigned";
    EmployeeStatus["PROBATION"] = "probation";
    EmployeeStatus["SUSPENDED"] = "suspended";
    EmployeeStatus["RETIRED"] = "retired";
})(EmployeeStatus || (EmployeeStatus = {}));
// ============================================================
// 性别
// ============================================================
export var Gender;
(function (Gender) {
    Gender["MALE"] = "male";
    Gender["FEMALE"] = "female";
    Gender["OTHER"] = "other";
})(Gender || (Gender = {}));
// ============================================================
// 状态映射表（用于显示）- 每个枚举类型独立映射
// ============================================================
export const COMMON_STATUS_LABELS = {
    [CommonStatus.ACTIVE]: '启用',
    [CommonStatus.INACTIVE]: '停用',
    [CommonStatus.PENDING]: '待处理',
    [CommonStatus.APPROVED]: '已批准',
    [CommonStatus.REJECTED]: '已拒绝',
    [CommonStatus.CANCELLED]: '已取消',
    [CommonStatus.COMPLETED]: '已完成',
    [CommonStatus.FAILED]: '失败',
    [CommonStatus.DRAFT]: '草稿',
};
export const TASK_STATUS_LABELS = {
    [TaskStatus.PENDING]: '待接受',
    [TaskStatus.IN_PROGRESS]: '进行中',
    [TaskStatus.COMPLETED]: '已完成',
    [TaskStatus.CANCELLED]: '已取消',
    [TaskStatus.OVERDUE]: '已逾期',
};
export const CROP_STAGE_LABELS = {
    [CropStage.SEEDLING]: '育苗期',
    [CropStage.VEGETATIVE]: '营养生长期',
    [CropStage.FLOWERING]: '开花期',
    [CropStage.FRUITING]: '结果期',
    [CropStage.HARVEST]: '采收期',
    [CropStage.DORMANT]: '休眠期',
};
export const INVENTORY_STATUS_LABELS = {
    [InventoryStatus.IN_STOCK]: '在库',
    [InventoryStatus.OUT_OF_STOCK]: '缺货',
    [InventoryStatus.LOW_STOCK]: '库存不足',
    [InventoryStatus.EXPIRED]: '已过期',
    [InventoryStatus.DAMAGED]: '损坏',
    [InventoryStatus.RESERVED]: '已预留',
};
export const APPROVAL_STATUS_LABELS = {
    [ApprovalStatusEnum.DRAFT]: '草稿',
    [ApprovalStatusEnum.PENDING]: '待审批',
    [ApprovalStatusEnum.APPROVED]: '已通过',
    [ApprovalStatusEnum.PARTIALLY_APPROVED]: '部分通过',
    [ApprovalStatusEnum.REJECTED]: '已拒绝',
    [ApprovalStatusEnum.CANCELLED]: '已撤回',
};
export const PRIORITY_LABELS = {
    [Priority.LOW]: '低',
    [Priority.NORMAL]: '普通',
    [Priority.HIGH]: '高',
    [Priority.URGENT]: '紧急',
};
export const LEAVE_TYPE_LABELS = {
    [LeaveType.ANNUAL]: '年假',
    [LeaveType.SICK]: '病假',
    [LeaveType.PERSONAL]: '事假',
    [LeaveType.MARRIAGE]: '婚假',
    [LeaveType.MATERNITY]: '产假',
    [LeaveType.FUNERAL]: '丧假',
};
export const OVERTIME_TYPE_LABELS = {
    [OvertimeType.WEEKDAY]: '工作日加班',
    [OvertimeType.WEEKEND]: '周末加班',
    [OvertimeType.HOLIDAY]: '节假日加班',
};
export const EMPLOYEE_STATUS_LABELS = {
    [EmployeeStatus.ON_BOARD]: '在职',
    [EmployeeStatus.RESIGNED]: '已离职',
    [EmployeeStatus.PROBATION]: '试用期',
    [EmployeeStatus.SUSPENDED]: '停职',
    [EmployeeStatus.RETIRED]: '退休',
};
/**
 * 获取状态标签（通用版本）
 */
export function getCommonStatusLabel(status) {
    return COMMON_STATUS_LABELS[status] || status;
}
export function getTaskStatusLabel(status) {
    return TASK_STATUS_LABELS[status] || status;
}
export function getCropStageLabel(status) {
    return CROP_STAGE_LABELS[status] || status;
}
export function getInventoryStatusLabel(status) {
    return INVENTORY_STATUS_LABELS[status] || status;
}
export function getApprovalStatusLabel(status) {
    return APPROVAL_STATUS_LABELS[status] || status;
}
export function getPriorityLabel(priority) {
    return PRIORITY_LABELS[priority] || priority;
}
export function getLeaveTypeLabel(type) {
    return LEAVE_TYPE_LABELS[type] || type;
}
export function getOvertimeTypeLabel(type) {
    return OVERTIME_TYPE_LABELS[type] || type;
}
export function getEmployeeStatusLabel(status) {
    return EMPLOYEE_STATUS_LABELS[status] || status;
}
