/**
 * 魔法数字常量（第二阶段 Y6 重构）
 * 消除散落各处的硬编码数字，统一从常量读取
 * 命名规范：<scope>_<purpose>_<unit>
 */

// ========== 列表分页 ==========
export const DEFAULT_PAGE_SIZE = 10 // V1.1 默认 page size
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

// ========== 时间/节流 ==========
export const FETCH_THROTTLE_MS = 1000 // visibilitychange + focus 同触发去重
export const SEARCH_DEBOUNCE_MS = 300 // 搜索框输入防抖
export const REQUEST_TIMEOUT_MS = 30000 // API 请求超时

// ========== 拖拽/缩放边界 ==========
export const MIN_DIALOG_WIDTH = 640 // 弹窗最小宽度（与 V1.1 Modal.tsx L67 一致）
export const MIN_DIALOG_HEIGHT = 400 // 弹窗最小高度
export const DIALOG_MAX_WIDTH = '90vw' // 弹窗最大宽度
export const DIALOG_MAX_HEIGHT = '90vh' // 弹窗最大高度

// ========== 业务阈值 ==========
export const LOW_PROGRESS_THRESHOLD = 60 // 进度预警阈值（%）
export const NORMAL_PROGRESS_THRESHOLD = 80 // 正常进度阈值（%）
export const WORKLOAD_WARNING_THRESHOLD = 5 // 工人负荷预警值

// ========== 文本截断长度 ==========
export const TRUNCATE_SHORT = 20
export const TRUNCATE_MEDIUM = 50
export const TRUNCATE_LONG = 100

// ========== 默认初始值 ==========
export const DEFAULT_OPERATOR = '' // 默认编制人
export const DEFAULT_BATCH_CODE = '' // 默认关联批次
