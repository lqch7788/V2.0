/**
 * 公告管理工具函数
 * 供公告表格、详情弹窗等组件使用
 */

/**
 * 获取状态颜色样式
 * @param {string} status - 状态
 * @returns {string} 颜色类名
 */
export const getStatusColor = (status) => {
  switch (status) {
    case '已发布':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    case '审批中':
      return 'bg-amber-50 text-amber-700 border-amber-200'
    case '草稿':
      return 'bg-gray-50 text-gray-600 border-gray-200'
    default:
      return 'bg-gray-50 text-gray-600 border-gray-200'
  }
}

/**
 * 获取优先级颜色样式
 * @param {string} priority - 优先级
 * @returns {string} 颜色类名
 */
export const getPriorityColor = (priority) => {
  switch (priority) {
    case '高':
      return 'bg-red-50 text-red-700 border-red-200'
    case '中':
      return 'bg-amber-50 text-amber-700 border-amber-200'
    case '低':
      return 'bg-green-50 text-green-700 border-green-200'
    default:
      return 'bg-gray-50 text-gray-600 border-gray-200'
  }
}
