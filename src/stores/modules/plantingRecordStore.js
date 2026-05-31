/**
 * 种植记录 Store - 对应V1.1 usePlantingRecordStore
 * 种植季记录 CRUD + 结束种植季 + 历史查询
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  getPlantingRecords,
  createPlantingRecord,
  updatePlantingRecord,
  endPlantingSeason,
  deletePlantingRecord
} from '@/services/apiPlantingRecordService'

export const usePlantingRecordStore = defineStore('plantingRecord', () => {
  // 状态 - 使用snake_case保持与V1.1一致
  const records = ref([])
  const loading = ref(false)
  const error = ref(null)

  // 种植状态选项
  const plantingSeasonStatus = [
    { dictCode: 'planting', dictLabel: '种植中' },
    { dictCode: 'harvested', dictLabel: '已采收' },
    { dictCode: 'fallow', dictLabel: '休耕中' },
    { dictCode: 'cancelled', dictLabel: '已取消' }
  ]

  /**
   * 加载种植记录 - 调用真实API
   */
  const loadRecords = async () => {
    loading.value = true
    error.value = null
    try {
      const data = await getPlantingRecords()
      // API返回camelCase，转换为snake_case保持兼容
      records.value = data.map(r => ({
        oid: r.oid,
        seasonCode: r.seasonCode,
        facilityOid: r.facilityOid,
        facilityName: r.facilityName || '',
        blockOid: r.blockOid || '',
        blockName: '',
        cropName: r.cropName,
        varietyName: r.varietyName || '',
        cropVarietyOid: r.cropVarietyOid || '',
        startDate: r.startDate || '',
        endDate: r.endDate || '',
        status: r.status,
        yieldAmount: r.yieldAmount ?? null,
        yieldUnit: r.yieldUnit || 'kg',
        qualityGrade: r.qualityGrade || '',
        notes: r.notes || ''
      }))
    } catch (err) {
      error.value = err.message || '加载种植记录失败'
    } finally {
      loading.value = false
    }
  }

  /**
   * 添加种植记录 - 调用真实API
   */
  const addRecord = async (recordData) => {
    loading.value = true
    error.value = null
    try {
      // 转换snake_case为API需要的格式
      const apiData = {
        facility_oid: recordData.facility_oid,
        block_oid: recordData.block_oid || '',
        crop_variety_oid: recordData.crop_variety_oid || '',
        crop_name: recordData.crop_name,
        variety_name: recordData.variety_name || '',
        start_date: recordData.start_date || new Date().toISOString().slice(0, 10),
        notes: recordData.notes || ''
      }
      const created = await createPlantingRecord(apiData)
      // 转换回snake_case
      const newRecord = {
        oid: created.oid,
        seasonCode: created.seasonCode,
        facilityOid: created.facilityOid,
        facilityName: created.facilityName || '',
        blockOid: created.blockOid || '',
        blockName: '',
        cropName: created.cropName,
        varietyName: created.varietyName || '',
        startDate: created.startDate || '',
        endDate: created.endDate || '',
        status: created.status,
        yieldAmount: null,
        yieldUnit: 'kg',
        qualityGrade: '',
        notes: created.notes || ''
      }
      records.value.push(newRecord)
      return newRecord
    } catch (err) {
      error.value = err.message || '添加种植记录失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 编辑种植记录 - 调用真实API
   */
  const editRecord = async (oid, recordData) => {
    loading.value = true
    error.value = null
    try {
      await updatePlantingRecord(oid, recordData)
      const index = records.value.findIndex(r => r.oid === oid)
      if (index !== -1) {
        records.value[index] = { ...records.value[index], ...recordData }
      }
    } catch (err) {
      error.value = err.message || '编辑种植记录失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 结束种植季 - 调用真实API
   */
  const endSeason = async (oid, endData) => {
    loading.value = true
    error.value = null
    try {
      const updated = await endPlantingSeason(oid, endData)
      const index = records.value.findIndex(r => r.oid === oid)
      if (index !== -1) {
        records.value[index] = {
          ...records.value[index],
          endDate: updated.endDate || endData.end_date,
          status: 'harvested',
          yieldAmount: updated.yieldAmount ?? endData.yield_amount,
          yieldUnit: updated.yieldUnit || endData.yield_unit || 'kg',
          qualityGrade: updated.qualityGrade || endData.quality_grade || '',
          notes: updated.notes || endData.notes || ''
        }
      }
    } catch (err) {
      error.value = err.message || '结束种植季失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 删除种植记录 - 调用真实API
   */
  const removeRecord = async (oid) => {
    loading.value = true
    error.value = null
    try {
      await deletePlantingRecord(oid)
      records.value = records.value.filter(r => r.oid !== oid)
    } catch (err) {
      error.value = err.message || '删除种植记录失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    records,
    loading,
    error,
    plantingSeasonStatus,
    loadRecords,
    addRecord,
    editRecord,
    endSeason,
    removeRecord
  }
})
