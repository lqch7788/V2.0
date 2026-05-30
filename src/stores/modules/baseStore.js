/**
 * 公司基地 Store - 对应V1.1 useBaseStore
 * 公司基地、设施管理，区块划分和种植记录
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useBaseStore = defineStore('base', () => {
  // 状态
  const bases = ref([])
  const loading = ref(false)
  const error = ref(null)

  // 模拟数据 - 与园区导览页面(ParkArchive.vue)保持一致
  const mockBases = [
    {
      oid: 'base_001',
      name: '上海松江基地',
      code: 'SH-SJ-001',
      companyOid: 'company_001',
      companyName: '宁波帮帮忙公司',
      area: 300,
      unit: '亩',
      province: '上海',
      city: '松江区',
      manager: '郭靖',
      phone: '13800138002',
      soilType: '沙壤土',
      ph: 6.8,
      status: 'active',
      intro: '总种植面积300亩，包含玻璃温室2个，连栋薄膜温室5个，日光拱棚10个，大田200亩。'
    },
    {
      oid: 'base_002',
      name: '上海崇明基地',
      code: 'SH-CM-001',
      companyOid: 'company_001',
      companyName: '宁波帮帮忙公司',
      area: 800,
      unit: '亩',
      province: '上海',
      city: '崇明区',
      manager: '萧峰',
      phone: '13800138003',
      soilType: '黏土',
      ph: 6.2,
      status: 'active',
      intro: '总种植面积800亩，包含玻璃温室3个，连栋薄膜温室8个，日光拱棚15个，大田650亩。'
    },
    {
      oid: 'base_003',
      name: '上海嘉定基地',
      code: 'SH-JD-001',
      companyOid: 'company_001',
      companyName: '宁波帮帮忙公司',
      area: 350,
      unit: '亩',
      province: '上海',
      city: '嘉定区',
      manager: '杨过',
      phone: '13800138007',
      soilType: '沙土',
      ph: 7.0,
      status: 'active',
      intro: '总种植面积350亩，包含玻璃温室4个，连栋薄膜温室6个，日光拱棚8个，大田200亩。'
    },
    {
      oid: 'base_004',
      name: '上海奉贤基地',
      code: 'SH-FX-001',
      companyOid: 'company_001',
      companyName: '宁波帮帮忙公司',
      area: 550,
      unit: '亩',
      province: '上海',
      city: '奉贤区',
      manager: '张无忌',
      phone: '13800138012',
      soilType: '黏土',
      ph: 6.8,
      status: 'active',
      intro: '总种植面积550亩，包含玻璃温室2个，连栋薄膜温室4个，日光拱棚12个，大田450亩。'
    },
    {
      oid: 'base_005',
      name: '西安雁塔基地',
      code: 'XA-YT-001',
      companyOid: 'company_002',
      companyName: '成都帮帮您公司',
      area: 500,
      unit: '亩',
      province: '陕西',
      city: '西安市',
      manager: '令狐冲',
      phone: '13800138001',
      soilType: '壤土',
      ph: 6.5,
      status: 'active',
      intro: '总种植面积500亩，包含玻璃温室3个，连栋薄膜温室7个，日光拱棚12个，大田380亩。'
    },
    {
      oid: 'base_006',
      name: '西安高新基地',
      code: 'XA-GX-001',
      companyOid: 'company_002',
      companyName: '成都帮帮您公司',
      area: 200,
      unit: '亩',
      province: '陕西',
      city: '西安市',
      manager: '狄云',
      phone: '13800138006',
      soilType: '营养土',
      ph: 6.4,
      status: 'active',
      intro: '总种植面积200亩，包含玻璃温室5个，连栋薄膜温室3个，日光拱棚5个，大田100亩。'
    },
    {
      oid: 'base_007',
      name: '宁波北仑基地',
      code: 'NB-BL-001',
      companyOid: 'company_002',
      companyName: '成都帮帮您公司',
      area: 600,
      unit: '亩',
      province: '浙江',
      city: '宁波市',
      manager: '石破天',
      phone: '13800138004',
      soilType: '壤土',
      ph: 6.6,
      status: 'active',
      intro: '总种植面积600亩，包含玻璃温室1个，连栋薄膜温室4个，日光拱棚8个，大田550亩。'
    },
    {
      oid: 'base_008',
      name: '宁波镇海基地',
      code: 'NB-ZH-001',
      companyOid: 'company_002',
      companyName: '成都帮帮您公司',
      area: 280,
      unit: '亩',
      province: '浙江',
      city: '宁波市',
      manager: '陈家洛',
      phone: '13800138008',
      soilType: '壤土',
      ph: 6.7,
      status: 'active',
      intro: '总种植面积280亩，包含玻璃温室2个，连栋薄膜温室3个，日光拱棚6个，大田220亩。'
    },
    {
      oid: 'base_009',
      name: '宁波慈溪基地',
      code: 'NB-CX-001',
      companyOid: 'company_002',
      companyName: '成都帮帮您公司',
      area: 420,
      unit: '亩',
      province: '浙江',
      city: '宁波市',
      manager: '袁承志',
      phone: '13800138010',
      soilType: '壤土',
      ph: 6.5,
      status: 'active',
      intro: '总种植面积420亩，包含玻璃温室3个，连栋薄膜温室5个，日光拱棚10个，大田320亩。'
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
      oid: `base_${Date.now()}`,
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
