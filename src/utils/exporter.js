/**
 * 2026-07-23 通用导出工具
 * 提供 CSV/XLSX 导出函数，替代 V2.0 中缺失的 @/services/exporters
 */

/**
 * CSV 导出（带 BOM 保证中文）
 * @param {Array<Object>} data
 * @param {Array<string>} headers
 * @param {string} filename
 */
export function exportCsv(data, headers, filename) {
  const csv = [headers, ...data.map(row => headers.map(h => `"${row[h] ?? ''}"`).join(','))].join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
  triggerDownload(blob, filename)
}

/**
 * XLSX 导出（HTML 假装 xls，浏览器友好）
 * @param {Array<Object>} data
 * @param {Array<string>} headers
 * @param {string} filename
 */
export function exportXlsx(data, headers, filename) {
  const content = `<html><head><meta charset="utf-8"></head><body><table border="1"><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>${data.map(row => `<tr>${headers.map(h => `<td>${row[h] ?? ''}</td>`).join('')}</tr>`).join('')}</table></body></html>`
  const blob = new Blob([content], { type: 'application/vnd.ms-excel;charset=utf-8' })
  triggerDownload(blob, filename)
}

/**
 * 触发文件下载
 */
function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default { exportCsv, exportXlsx }
