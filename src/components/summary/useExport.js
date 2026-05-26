/**
 * 导出 Composable - 提供通用的导出功能
 * 与V1.1 useExport.ts 逻辑完全一致
 *
 * 使用方式：
 *   const { exportMode, selectedRows, showExportModal, handleExportClick, ... } = useExport({ data, headers, filenamePrefix })
 */

import { ref } from 'vue'
import { showAlert } from '@/lib/dialogService'

/**
 * 生成 Excel HTML 内容（支持超链接）
 */
function generateExcelHtml(selectedData, headers) {
  return `<html><head><meta charset="utf-8"></head><body><table border="1"><tr>${headers
    .map((h) => `<th>${h}</th>`)
    .join('')}</tr>${selectedData
    .map(
      (row) =>
        `<tr>${headers.map((h) => {
          const value = row[h]
          const strValue = String(value || '')
          if (strValue.startsWith('file:')) {
            const linkText = strValue.replace('file: attachments/', '').replace(/.*\//, '')
            return `<td><a href="${strValue}" target="_blank">${linkText}</a></td>`
          }
          return `<td>${strValue}</td>`
        }).join('')}</tr>`
    )
    .join('')}</table></body></html>`
}

/**
 * 触发浏览器下载
 */
function downloadFile(content, fileName, mimeType) {
  try {
    if (window.showSaveFilePicker) {
      // 现代浏览器使用 File System Access API
      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      a.click()
      URL.revokeObjectURL(url)
    } else {
      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      a.click()
      URL.revokeObjectURL(url)
    }
  } catch (err) {
    console.error('导出失败:', err)
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
    URL.revokeObjectURL(url)
  }
}

export function useExport({ data, headers, filenamePrefix }) {
  const exportMode = ref(false)
  const selectedRows = ref([])
  const exportFormat = ref('excel')
  const showExportModal = ref(false)

  /** 进入导出模式 */
  const handleExportClick = () => {
    exportMode.value = true
    selectedRows.value = []
  }

  /** 全选/全不选 */
  const handleSelectAll = (allIds) => {
    if (selectedRows.value.length === allIds.length) {
      selectedRows.value = []
    } else {
      selectedRows.value = [...allIds]
    }
  }

  /** 单选切换 */
  const handleSelectRow = (id) => {
    const idx = selectedRows.value.indexOf(id)
    if (idx > -1) {
      selectedRows.value = selectedRows.value.filter((rowId) => rowId !== id)
    } else {
      selectedRows.value = [...selectedRows.value, id]
    }
  }

  /** 确认导出 - 打开格式选择弹窗 */
  const handleConfirmExport = () => {
    if (selectedRows.value.length === 0) {
      showAlert('请先选择要导出的数据')
      return
    }
    showExportModal.value = true
  }

  /** 获取选中数据 */
  const getSelectedData = () => {
    if (selectedRows.value.length === 0) return data.value || []
    return (data.value || []).filter((item) => selectedRows.value.includes(item.id ?? item.index))
  }

  /** 执行导出 */
  const handleDoExport = async (attachments) => {
    const selectedData = getSelectedData()
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')

    let content = ''
    let mimeType = ''
    let extension = ''

    if (exportFormat.value === 'csv') {
      content =
        headers.join(',') +
        '\n' +
        selectedData
          .map((row) => headers.map((h) => `"${(row[h] ?? '')}"`).join(','))
          .join('\n')
      mimeType = 'text/csv;charset=utf-8'
      extension = 'csv'
    } else if (exportFormat.value === 'excel') {
      content = generateExcelHtml(selectedData, headers)
      mimeType = 'application/vnd.ms-excel;charset=utf-8'
      extension = 'xls'
    } else if (exportFormat.value === 'word') {
      content = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"></head><body><table border="1">${headers
        .map((h) => `<th>${h}</th>`)
        .join('')}${selectedData
        .map((row) => `<tr>${headers.map((h) => `<td>${row[h] ?? ''}</td>`).join('')}</tr>`)
        .join('')}</table></body></html>`
      mimeType = 'application/vnd.ms-word;charset=utf-8'
      extension = 'doc'
    } else if (exportFormat.value === 'excel_with_attachments' && attachments?.length) {
      // 带附件导出使用 JSZip
      try {
        const { default: JSZip } = await import('jszip')
        const { saveAs } = await import('file-saver')
        const zip = new JSZip()

        const excelContent = generateExcelHtml(selectedData, headers)
        zip.file(`${filenamePrefix}.xlsx`, excelContent)

        // 按问题编号分组附件
        const attachmentsByProblem = new Map()
        attachments.forEach((att) => {
          const existing = attachmentsByProblem.get(att.problemId) || []
          existing.push(att)
          attachmentsByProblem.set(att.problemId, existing)
        })

        const attachmentsFolder = zip.folder('attachments')
        if (attachmentsFolder) {
          for (const [problemId, items] of attachmentsByProblem) {
            const problemCode = items[0]?.problemCode || `PD${problemId}`
            const problemFolder = attachmentsFolder.folder(problemCode)
            if (problemFolder) {
              const gpsItems = items.filter((a) => a.type === 'gps')
              if (gpsItems.length > 0) {
                const gpsData = gpsItems[0].data
                problemFolder.file('GPS.txt', `纬度: ${gpsData.lat}\n经度: ${gpsData.lng}`)
              }
              const beforePhotos = items.filter((a) => a.type === 'photo_before')
              beforePhotos.forEach((photo, idx) => {
                const ext = photo.filename.split('.').pop() || 'jpg'
                problemFolder.file(`作业前照片_${idx + 1}.${ext}`, photo.data, { base64: true })
              })
              const afterPhotos = items.filter((a) => a.type === 'photo_after')
              afterPhotos.forEach((photo, idx) => {
                const ext = photo.filename.split('.').pop() || 'jpg'
                problemFolder.file(`作业后照片_${idx + 1}.${ext}`, photo.data, { base64: true })
              })
            }
          }
        }

        const zipBlob = await zip.generateAsync({ type: 'blob' })
        saveAs(zipBlob, `${filenamePrefix}_${dateStr}.zip`)
      } catch (e) {
        console.warn('带附件导出失败（JSZip/file-saver 未安装），回退到 Excel 导出')
        content = generateExcelHtml(selectedData, headers)
        mimeType = 'application/vnd.ms-excel;charset=utf-8'
        extension = 'xls'
        downloadFile(content, `${filenamePrefix}_${dateStr}.${extension}`, mimeType)
      }

      exportMode.value = false
      selectedRows.value = []
      showExportModal.value = false
      return
    }

    const fileName = `${filenamePrefix}_${dateStr}.${extension}`
    downloadFile(content, fileName, mimeType)

    exportMode.value = false
    selectedRows.value = []
    showExportModal.value = false
  }

  /** 取消导出 */
  const handleCancelExport = () => {
    exportMode.value = false
    selectedRows.value = []
  }

  return {
    exportMode,
    selectedRows,
    exportFormat,
    showExportModal,
    setExportFormat: (fmt) => { exportFormat.value = fmt },
    handleExportClick,
    handleSelectAll,
    handleSelectRow,
    handleConfirmExport,
    handleDoExport,
    handleCancelExport,
    setShowExportModal: (val) => { showExportModal.value = val }
  }
}
