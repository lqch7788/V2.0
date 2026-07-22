/**
 * 2026-07-22 1:1 迁移自 V1.1 services/excelExportService.ts
 * Excel 导出 Service — 种植管理每日记录导出
 *
 * 注：依赖 xlsx 包。若未安装，请运行：pnpm add xlsx
 */
import { WATERING_METHOD_MAP, WATERING_UNIT_MAP, FEED_UNIT_MAP } from '@/constants/cropConstants'

/**
 * 导出种植管理每日记录为 Excel
 * @param {Object} planting
 * @param {Array} records
 */
export function exportPlantingDailyRecordsToExcel(planting, records) {
  if (!records || records.length === 0) return

  const data = records.map((r) => {
    const fertText = (r.fertilizerRecords || [])
      .map((f) =>
        `${f.name} ${f.amount || 0}${FEED_UNIT_MAP[f.unit] || f.unit}${
          f.dilutionType === 'dilute' && f.dilution ? `×${f.dilution}倍` : '(干施)'
        }`
      )
      .join('; ')
    const pestText = (r.pesticideRecords || [])
      .map((p) =>
        `${p.name} ${p.amount || 0}${FEED_UNIT_MAP[p.unit] || p.unit}${
          p.dilutionType === 'dilute' && p.dilution ? `×${p.dilution}倍` : ''
        }${p.targetPest ? `/${p.targetPest}` : ''}${
          p.safetyInterval ? `(安全间隔${p.safetyInterval}天)` : ''
        }`
      )
      .join('; ')
    return {
      日期: r.recordDate,
      温度: r.temperature != null ? `${r.temperature}℃` : '',
      湿度: r.humidity != null ? `${r.humidity}%` : '',
      pH值: r.phValue ?? '',
      EC值: r.ecValue != null ? `${r.ecValue} mS/cm` : '',
      浇水: r.watering ? '是' : '否',
      浇水方式: r.watering
        ? WATERING_METHOD_MAP[r.wateringMethod] || r.wateringMethod || '-'
        : '-',
      浇水量:
        r.watering && r.wateringAmount != null
          ? `${r.wateringAmount} ${WATERING_UNIT_MAP[r.wateringUnit] || r.wateringUnit || ''}`
          : '-',
      施肥种类: (r.fertilizerRecords || []).length,
      施肥明细: fertText || '-',
      用药种类: (r.pesticideRecords || []).length,
      用药明细: pestText || '-',
      损耗: r.lossChange ?? '',
      补栽: r.supplementChange ?? '',
      异常情况: r.abnormality ?? '',
      操作员: r.operator ?? '',
      备注: r.remarks ?? ''
    }
  })

  // 动态 import xlsx 避免强制依赖
  import('xlsx').then((XLSX) => {
    const ws = XLSX.utils.json_to_sheet(data)
    ws['!cols'] = [
      { wch: 12 }, { wch: 8 }, { wch: 8 }, { wch: 6 }, { wch: 10 },
      { wch: 6 }, { wch: 12 }, { wch: 14 }, { wch: 8 }, { wch: 40 },
      { wch: 8 }, { wch: 40 }, { wch: 8 }, { wch: 8 }, { wch: 20 },
      { wch: 10 }, { wch: 20 }
    ]
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '每日记录')
    const filename = `种植每日记录_${planting.plantCode || planting.id}_${
      new Date().toISOString().split('T')[0]
    }.xlsx`
    XLSX.writeFile(wb, filename)
  }).catch((e) => {
    console.error('[excelExportService] xlsx 包未安装，请运行 pnpm add xlsx:', e)
  })
}
