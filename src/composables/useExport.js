/**
 * 通用导出 composable
 * 支持 CSV、Excel(HTML)、Word(HTML) 格式导出
 * 用于替代各组件中的"导出功能开发中"占位符
 */
import { ElMessage } from 'element-plus'

/**
 * @param {Object} options
 * @param {string} options.fileName - 文件名前缀
 * @param {string} options.format - 导出格式: 'csv' | 'excel' | 'word'
 * @returns {{ exportData: Function, exportWithFormatSelect: Function }}
 */
export function useExport(options = {}) {
  const defaultFileName = options.fileName || '导出数据'

  /**
   * 导出数据
   * @param {Object[]} data - 数据数组
   * @param {Object[]} columns - 列配置 [{ key: 'fieldName', label: '列标题' }]
   * @param {Object} opts - 可选配置 { fileName, format }
   */
  function exportData(data, columns, opts = {}) {
    const format = opts.format || options.format || 'excel'
    const fileName = opts.fileName || defaultFileName
    const headers = columns.map(c => c.label)

    if (format === 'csv') {
      exportCSV(data, columns, headers, fileName)
    } else if (format === 'excel') {
      exportExcel(data, columns, headers, fileName)
    } else if (format === 'word') {
      exportWord(data, columns, headers, fileName)
    } else {
      ElMessage.warning(`不支持的导出格式: ${format}`)
    }
  }

  /**
   * 带格式选择的导出（供弹窗使用）
   */
  function exportWithFormatSelect(data, columns, format, fileName) {
    if (!data || data.length === 0) {
      ElMessage.warning('没有可导出的数据')
      return
    }
    exportData(data, columns, { format, fileName })
    ElMessage.success(`成功导出 ${data.length} 条记录`)
  }

  return { exportData, exportWithFormatSelect }
}

// ============================================
// 内部实现
// ============================================

function formatCellValue(val) {
  if (val === null || val === undefined) return ''
  if (typeof val === 'number') return String(val)
  return String(val).replace(/"/g, '""')
}

function exportCSV(data, columns, headers, fileName) {
  const bom = '﻿'
  const headerLine = headers.map(h => `"${h}"`).join(',')
  const rows = data.map(row =>
    columns.map(c => `"${formatCellValue(row[c.key])}"`).join(',')
  )
  const content = bom + headerLine + '\n' + rows.join('\n')
  downloadFile(content, `${fileName}.csv`, 'text/csv;charset=utf-8')
}

function exportExcel(data, columns, headers, fileName) {
  const headerRow = headers.map(h => `<th>${h}</th>`).join('')
  const dataRows = data.map(row =>
    `<tr>${columns.map(c => `<td>${formatCellValue(row[c.key])}</td>`).join('')}</tr>`
  ).join('')
  const html = `<html><head><meta charset="utf-8"></head><body><table border="1"><tr>${headerRow}</tr>${dataRows}</table></body></html>`
  downloadFile(html, `${fileName}.xls`, 'application/vnd.ms-excel;charset=utf-8')
}

function exportWord(data, columns, headers, fileName) {
  const headerRow = headers.map(h => `<th>${h}</th>`).join('')
  const dataRows = data.map(row =>
    `<tr>${columns.map(c => `<td>${formatCellValue(row[c.key])}</td>`).join('')}</tr>`
  ).join('')
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"></head><body><table border="1">${headerRow}${dataRows}</table></body></html>`
  downloadFile(html, `${fileName}.doc`, 'application/vnd.ms-word;charset=utf-8')
}

function downloadFile(content, fileName, mimeType) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
