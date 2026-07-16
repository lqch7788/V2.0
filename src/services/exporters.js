/**
 * 公共导出工具（V1.1 风格 CSV / XLSX 导出）
 * 提供 exportCsv / exportXlsx 两个公共函数，前端业务模块直接复用。
 *
 * V1.1 源：src/utils/exporters.ts
 */

/**
 * 通用 CSV 导出（带 BOM，避免 Excel 打开中文乱码）
 * @param {Array<Object>} data - 待导出数据行数组
 * @param {Array<string>} headers - 表头列名数组（同时作为取值 key）
 * @param {string} filename - 下载文件名（含扩展名）
 */
export function exportCsv(data, headers, filename) {
  const rows = data.map((r) => headers.map((h) => r[h] ?? ''))
  const csv = '﻿'
    + [headers, ...rows]
      .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * 通用 XLSX 导出（HTML 假装 xls，避免对 xlsx 库依赖；Excel 可直接打开）
 * @param {Array<Object>} data - 待导出数据行数组
 * @param {Array<string>} headers - 表头列名数组（同时作为取值 key）
 * @param {string} filename - 下载文件名（含扩展名）
 */
export function exportXlsx(data, headers, filename) {
  const rows = data.map((r) => headers.map((h) => r[h] ?? ''))
  const html = '<html><head><meta charset="utf-8"></head><body><table border="1">'
    + '<tr>' + headers.map((h) => `<th>${escapeHtml(h)}</th>`).join('') + '</tr>'
    + rows.map((r) => '<tr>' + r.map((c) => `<td>${escapeHtml(c)}</td>`).join('') + '</tr>').join('')
    + '</table></body></html>'
  const blob = new Blob(['﻿' + html], { type: 'application/vnd.ms-excel' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * XSS 防护：转义 HTML 特殊字符（防止用户输入含 < > & " 破坏表格）
 */
function escapeHtml(v) {
  if (v == null) return ''
  return String(v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
