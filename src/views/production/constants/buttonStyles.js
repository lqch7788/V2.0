/**
 * 计划管理模块共享按钮样式常量
 * 第二阶段 Y2 重构：原 5 个文件（TechSolution.vue / TechSolutionFilters.vue /
 * TechSolutionTable.vue / TechSolutionCreateModal.vue / TechSolutionEditModal.vue /
 * TechSolutionBatchEditModal.vue / ExportFormatModal.vue）各自重复 ~30 行 btnBase/btnDefault
 * 等常量定义。现抽取为单一来源，主题色调整只需改一处
 *
 * 严格保留原行为：CreateModal/EditModal 的 inputClass 用 rounded-lg + border-gray-400
 * （更突出），其他文件用 rounded-md + border-gray-200（更紧凑）
 */
export const btnBase = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'

export const btnDefault = `${btnBase} bg-emerald-600 text-white hover:bg-emerald-700 h-8 rounded-md px-3 text-xs`
export const btnSecondary = `${btnBase} bg-gray-100 text-gray-900 hover:bg-gray-200 h-8 rounded-md px-3 text-xs`
export const btnDestructive = `${btnBase} bg-red-600 text-white hover:bg-red-700 h-8 rounded-md px-3 text-xs`
export const btnBlue = `${btnBase} bg-blue-600 text-white hover:bg-blue-700 h-8 rounded-md px-3 text-xs`
export const btnGhost = `${btnBase} hover:bg-gray-100 hover:text-gray-900`
// 警示版（用于"重置"等带提醒色的按钮，与 V1.1 OrderFilter Button variant="warning" 1:1）
export const btnWarning = `${btnBase} bg-amber-500 text-white hover:bg-amber-600 h-8 rounded-md px-3 text-xs`

// 紧凑版（Filters/Table/BatchEdit/ExportFormatModal 使用）
export const inputClass = 'flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50'

// 强调版（CreateModal/EditModal 使用，rounded-lg + border-gray-400）
export const inputClassStrong = 'flex h-10 w-full rounded-lg border border-gray-400 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50'
