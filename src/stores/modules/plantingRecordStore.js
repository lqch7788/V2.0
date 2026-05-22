/**
 * 种植记录 Store - 对应V1.1 usePlantingRecordStore
 * 种植季记录 CRUD + 结束种植季 + 历史查询
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePlantingRecordStore = defineStore('plantingRecord', () => {
  // 状态
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

  // 模拟数据
  const mockRecords = [
    {
      oid: 'PR001',
      seasonCode: '2026S001',
      facilityOid: 'GH001',
      facilityName: '1号温室',
      blockOid: 'BK001',
      blockName: '东区-A1地块',
      cropName: '番茄',
      varietyName: '大红番茄',
      cropVarietyOid: 'CV001',
      startDate: '2026-03-01',
      endDate: '2026-06-15',
      status: 'harvested',
      yieldAmount: 5000,
      yieldUnit: 'kg',
      qualityGrade: 'A',
      notes: '第一季番茄'
    },
    {
      oid: 'PR002',
      seasonCode: '2026S002',
      facilityOid: 'GH001',
      facilityName: '1号温室',
      blockOid: 'BK002',
      blockName: '东区-A2地块',
      cropName: '黄瓜',
      varietyName: '水果黄瓜',
      cropVarietyOid: 'CV002',
      startDate: '2026-04-10',
      endDate: '',
      status: 'planting',
      yieldAmount: null,
      yieldUnit: 'kg',
      qualityGrade: '',
      notes: '春季黄瓜'
    },
    {
      oid: 'PR003',
      seasonCode: '2026S003',
      facilityOid: 'GH002',
      facilityName: '2号温室',
      blockOid: 'BK004',
      blockName: '西区-1地块',
      cropName: '辣椒',
      varietyName: '螺丝椒',
      cropVarietyOid: 'CV003',
      startDate: '2026-03-15',
      endDate: '',
      status: 'planting',
      yieldAmount: null,
      yieldUnit: 'kg',
      qualityGrade: '',
      notes: '春季辣椒'
    },
    {
      oid: 'PR004',
      seasonCode: '2025S001',
      facilityOid: 'GH003',
      facilityName: '3号温室',
      blockOid: '',
      blockName: '',
      cropName: '茄子',
      varietyName: '圆茄子',
      cropVarietyOid: 'CV004',
      startDate: '2025-04-01',
      endDate: '2025-07-20',
      status: 'harvested',
      yieldAmount: 3500,
      yieldUnit: 'kg',
      qualityGrade: 'B',
      notes: '去年茄子'
    }
  ]

  /**
   * 加载种植记录
   */
  const loadRecords = async () => {
    loading.value = true
    error.value = null
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      const stored = localStorage.getItem('farm_planting_records')
      if (stored) {
        records.value = JSON.parse(stored)
      } else {
        records.value = [...mockRecords]
        saveRecords()
      }
    } catch (err) {
      error.value = err.message || '加载种植记录失败'
    } finally {
      loading.value = false
    }
  }

  /**
   * 保存到localStorage
   */
  const saveRecords = () => {
    localStorage.setItem('farm_planting_records', JSON.stringify(records.value))
  }

  /**
   * 添加种植记录
   */
  const addRecord = async (recordData) => {
    const newRecord = {
      ...recordData,
      oid: `PR${Date.now()}`,
      seasonCode: `2026S${String(records.value.length + 1).padStart(3, '0')}`,
      startDate: recordData.start_date || new Date().toISOString().slice(0, 10),
      status: 'planting',
      yieldAmount: null,
      yieldUnit: 'kg',
      qualityGrade: '',
      notes: recordData.notes || ''
    }
    records.value.push(newRecord)
    saveRecords()
    return newRecord
  }

  /**
   * 编辑种植记录
   */
  const editRecord = async (oid, recordData) => {
    const index = records.value.findIndex(r => r.oid === oid)
    if (index !== -1) {
      records.value[index] = { ...records.value[index], ...recordData }
      saveRecords()
    }
  }

  /**
   * 结束种植季
   */
  const endSeason = async (oid, endData) => {
    const index = records.value.findIndex(r => r.oid === oid)
    if (index !== -1) {
      records.value[index] = {
        ...records.value[index],
        ...endData,
        status: 'harvested'
      }
      saveRecords()
    }
  }

  /**
   * 删除种植记录
   */
  const removeRecord = async (oid) => {
    records.value = records.value.filter(r => r.oid !== oid)
    saveRecords()
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
