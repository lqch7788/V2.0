/**
 * 导出格式下拉数据 composable
 * 第二阶段 Y4 重构：TechSolution.vue 原 exportFormats 静态常量 3 行
 * 抽成 composable 保持"使用方统一从 composables 导入"约定，便于将来增加 PDF/JSON 等格式时统一管理
 *
 * @returns {{ exportFormats: ReadonlyArray<{value: string, label: string, desc: string}>, getFormatExtension: (value: string) => string }}
 */
export const EXPORT_FORMATS = Object.freeze([
  { value: 'excel', label: 'Excel (.xlsx)', desc: '适用于数据分析和处理' },
  { value: 'csv', label: 'CSV (.csv)', desc: '适用于数据交换' },
  { value: 'word', label: 'Word (.docx)', desc: '适用于文档编辑和分享' },
])

export function useExportFormats() {
  /**
   * 根据 value 取文件扩展名（用于下载文件命名）
   * @param {string} value
   * @returns {string}
   */
  const getFormatExtension = (value) => {
    const found = EXPORT_FORMATS.find((f) => f.value === value)
    if (!found) return ''
    // 提取括号内扩展名（"Excel (.xlsx)" → "xlsx"）
    const match = found.label.match(/\(([^)]+)\)/)
    if (match) return match[1].replace(/^\./, '')
    return value
  }

  return {
    exportFormats: EXPORT_FORMATS,
    getFormatExtension,
  }
}
