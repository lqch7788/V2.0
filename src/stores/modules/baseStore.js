/**
 * 公司基地 Store - 对应V1.1 useBaseStore
 * 公司基地、设施管理、区块划分和种植记录
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useBaseStore = defineStore('base', () => {
  // 状态
  const bases = ref([])
  const loading = ref(false)
  const error = ref(null)

  // 模拟数据
  const mockBases = [
    {
      oid: 'B001',
      name: '北京延庆基地',
      code: 'BJ-YQ-001',
      companyOid: 'C001',
      companyName: '北京智慧农业集团',
      area: 500,
      unit: '亩',
      province: '北京',
      city: '延庆区',
      manager: '张经理',
      phone: '13800138001',
      soilType: '沙质土壤',
      ph: 6.8,
      status: 'active',
      intro: '北京延庆现代农业示范基地'
    },
    {
      oid: 'B002',
      name: '山东寿光基地',
      code: 'SD-SG-001',
      companyOid: 'C001',
      companyName: '北京智慧农业集团',
      area: 800,
      unit: '亩',
      province: '山东',
      city: '寿光市',
      manager: '李经理',
      phone: '13800138002',
      soilType: '壤土',
      ph: 7.2,
      status: 'active',
      intro: '山东寿光蔬菜种植基地'
    },
    {
      oid: 'B003',
      name: '河北雄安基地',
      code: 'HB-XA-001',
      companyOid: 'C002',
      companyName: '雄安农业公司',
      area: 300,
      unit: '亩',
      province: '河北',
      city: '雄安新区',
      manager: '王经理',
      phone: '13800138003',
      soilType: '黏土',
      ph: 6.5,
      status: 'active',
      intro: '雄安新区试验基地'
    }
  ]

  /**
   * 加载基地数据
   */
  const loadBases = async () => {
    loading.value = true
    error.value = null
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      const stored = localStorage.getItem('farm_bases')
      if (stored) {
        bases.value = JSON.parse(stored)
      } else {
        bases.value = [...mockBases]
        saveBases()
      }
    } catch (err) {
      error.value = err.message || '加载基地数据失败'
    } finally {
      loading.value = false
    }
  }

  /**
   * 保存到localStorage
   */
  const saveBases = () => {
    localStorage.setItem('farm_bases', JSON.stringify(bases.value))
  }

  /**
   * 添加基地
   */
  const addBase = async (baseData) => {
    const newBase = {
      ...baseData,
      oid: `B${Date.now()}`,
      status: baseData.status || 'active'
    }
    bases.value.push(newBase)
    saveBases()
    return newBase
  }

  /**
   * 编辑基地
   */
  const editBase = async (oid, baseData) => {
    const index = bases.value.findIndex(b => b.oid === oid)
    if (index !== -1) {
      bases.value[index] = { ...bases.value[index], ...baseData }
      saveBases()
    }
  }

  /**
   * 删除基地
   */
  const removeBase = async (oid) => {
    bases.value = bases.value.filter(b => b.oid !== oid)
    saveBases()
  }

  return {
    bases,
    loading,
    error,
    loadBases,
    addBase,
    editBase,
    removeBase
  }
})
