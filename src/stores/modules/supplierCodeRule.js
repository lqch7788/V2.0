/**
 * 供应商编码规则 Store (Pinia)
 * 数据流: Component → Store → apiMaterialCodeCategoryService → Backend API (SQLite)
 *
 * 编码结构：大类代码(2位) + 中类代码(2位) + 流水号(3位)，前缀 SU_
 * 对应V1.1: useSupplierCodeRuleStore.ts
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { enhancedApiClient } from '@/lib/apiClient'

// ========== 默认数据（API为空时的后备） ==========
const defaultCategories = [
  {
    code: 'SP', name: '种子与种苗类', nameEn: 'Seed & Seedling',
    midCategories: [
      { code: '01', name: '粮食作物种子' }, { code: '02', name: '经济作物种子' }, { code: '03', name: '蔬菜种子/种苗' },
      { code: '04', name: '水果苗木' }, { code: '05', name: '花卉与观赏植物' }, { code: '06', name: '食用菌/药用菌菌种' }, { code: '99', name: '其他种质资源' },
    ]
  },
  {
    code: 'FE', name: '肥料与土壤改良类', nameEn: 'Fertilizer & Soil Amendment',
    midCategories: [
      { code: '01', name: '有机肥' }, { code: '02', name: '化学肥料' }, { code: '03', name: '微生物菌剂/生物刺激素' },
      { code: '04', name: '土壤调理剂' }, { code: '05', name: '育苗基质' }, { code: '99', name: '其他肥料类' },
    ]
  },
  {
    code: 'PP', name: '农药与植保产品类', nameEn: 'Pesticide & Plant Protection',
    midCategories: [
      { code: '01', name: '杀虫剂' }, { code: '02', name: '杀菌剂' }, { code: '03', name: '除草剂' },
      { code: '04', name: '植物生长调节剂' }, { code: '05', name: '绿色防控产品' }, { code: '06', name: '生物农药' }, { code: '99', name: '其他植保产品' },
    ]
  },
  {
    code: 'EQ', name: '农业机械与设备类', nameEn: 'Agricultural Machinery & Equipment',
    midCategories: [
      { code: '01', name: '耕作与动力机械' }, { code: '02', name: '播种/移栽设备' }, { code: '03', name: '植保机械' },
      { code: '04', name: '收获与采收机械' }, { code: '05', name: '初加工与分选设备' }, { code: '99', name: '其他农机设备' },
    ]
  },
  {
    code: 'FA', name: '设施农业资材类', nameEn: 'Facility Agriculture Materials',
    midCategories: [
      { code: '01', name: '温室/大棚骨架材料' }, { code: '02', name: '覆盖材料' }, { code: '03', name: '通风降温设备' },
      { code: '04', name: '加温设备' }, { code: '05', name: '补光系统' }, { code: '06', name: '智能环控系统' }, { code: '99', name: '其他设施农业资材' },
    ]
  },
  {
    code: 'IR', name: '灌溉与水肥一体化类', nameEn: 'Irrigation & Fertilization',
    midCategories: [
      { code: '01', name: '水泵与水源设备' }, { code: '02', name: '输水管网' }, { code: '03', name: '过滤系统' },
      { code: '04', name: '施肥装置' }, { code: '05', name: '灌溉终端' }, { code: '99', name: '其他灌溉设备' },
    ]
  },
  {
    code: 'OP', name: '日常劳保与劳动工具类', nameEn: 'Labor Protection & Tools',
    midCategories: [
      { code: '01', name: '劳动防护用品' }, { code: '02', name: '日常手动工具' }, { code: '03', name: '小型电动工具' },
      { code: '04', name: '清洁与卫生用品' }, { code: '99', name: '其他作业支持用品' },
    ]
  },
  {
    code: 'PH', name: '仓储与物流资材类', nameEn: 'Storage & Logistics Materials',
    midCategories: [
      { code: '01', name: '采收容器' }, { code: '02', name: '农产品包装材料' }, { code: '03', name: '冷链设备' },
      { code: '04', name: '装卸与仓储设备' }, { code: '99', name: '其他采后处理' },
    ]
  },
  {
    code: 'TS', name: '检测与技术服务类', nameEn: 'Testing & Technical Services',
    midCategories: [
      { code: '01', name: '土壤/水质检测服务' }, { code: '02', name: '农残快检设备与试剂' }, { code: '03', name: '农业物联网设备' },
      { code: '04', name: '数字农业软件服务' }, { code: '05', name: '农业技术咨询与培训' }, { code: '99', name: '其他技术服务' },
    ]
  },
  {
    code: 'UT', name: '能源与辅助耗材类', nameEn: 'Energy & Auxiliary Consumables',
    midCategories: [
      { code: '01', name: '燃油/润滑油' }, { code: '02', name: '电力与新能源' }, { code: '03', name: '通用工业耗材' }, { code: '99', name: '其他能源与耗材' },
    ]
  },
  {
    code: 'OT', name: '其他综合类', nameEn: 'Others',
    midCategories: [
      { code: '01', name: '其他未分类供应商' },
    ]
  },
]

// ========== 扁平行转树形 ==========
function rowsToTree(rows) {
  const bigMap = new Map()
  for (const row of rows) {
    if (row.level === 'big') {
      bigMap.set(row.code, { code: row.code, name: row.name, nameEn: row.nameEn || '', midCategories: [] })
    }
  }
  for (const row of rows) {
    if (row.level === 'mid' && row.parentCode && bigMap.has(row.parentCode)) {
      const big = bigMap.get(row.parentCode)
      if (!big.midCategories.find(m => m.code === row.code)) {
        big.midCategories.push({ code: row.code, name: row.name })
      }
    }
  }
  return Array.from(bigMap.values())
}

export const useSupplierCodeRuleStore = defineStore('supplierCodeRule', () => {
  const categories = ref(defaultCategories)
  const isLoading = ref(false)
  const error = ref(null)

  // ========== 从后端加载 ==========
  async function fetchCategories() {
    isLoading.value = true
    error.value = null
    try {
      const response = await enhancedApiClient.get('/material-code-categories?rule_type=supplier')
      let data = response?.data || response
      if (!Array.isArray(data) && response?.data) data = Array.isArray(response.data) ? response.data : []
      if (Array.isArray(data) && data.length > 0) {
        categories.value = rowsToTree(data)
      }
    } catch (err) {
      console.warn('[SupplierCodeRuleStore] API获取失败，使用默认数据:', err)
      error.value = err.message || '获取失败'
    } finally {
      isLoading.value = false
    }
  }

  // ========== 更新大类名称 ==========
  async function updateBigName(bigCode, newName) {
    categories.value = categories.value.map(b => b.code === bigCode ? { ...b, name: newName } : b)
    try {
      await enhancedApiClient.put(`/material-code-categories/${bigCode}?rule_type=supplier`, { name: newName })
    } catch (err) { console.warn('[SupplierCodeRuleStore] 更新大类名称失败:', err) }
  }

  // ========== 更新中类名称 ==========
  async function updateMidName(bigCode, midCode, newName) {
    categories.value = categories.value.map(b => {
      if (b.code !== bigCode) return b
      return { ...b, midCategories: b.midCategories.map(m => m.code === midCode ? { ...m, name: newName } : m) }
    })
    try {
      await enhancedApiClient.put(`/material-code-categories/${midCode}?rule_type=supplier`, { name: newName })
    } catch (err) { console.warn('[SupplierCodeRuleStore] 更新中类名称失败:', err) }
  }

  // ========== 新增大类 ==========
  async function addBigCategory(code, name) {
    categories.value = [...categories.value, { code, name, nameEn: '', midCategories: [] }]
    try {
      await enhancedApiClient.post('/material-code-categories', { code, name, nameEn: '', parentCode: '', level: 'big', ruleType: 'supplier' })
    } catch (err) { console.warn('[SupplierCodeRuleStore] 新增大类失败:', err) }
  }

  // ========== 新增中类 ==========
  async function addMidCategory(bigCode, code, name) {
    categories.value = categories.value.map(b => {
      if (b.code !== bigCode) return b
      return { ...b, midCategories: [...b.midCategories, { code, name }] }
    })
    try {
      await enhancedApiClient.post('/material-code-categories', { code, name, nameEn: '', parentCode: bigCode, level: 'mid', ruleType: 'supplier' })
    } catch (err) { console.warn('[SupplierCodeRuleStore] 新增中类失败:', err) }
  }

  // ========== 删除大类 ==========
  async function deleteBigCategory(bigCode) {
    categories.value = categories.value.filter(b => b.code !== bigCode)
    try {
      await enhancedApiClient.delete(`/material-code-categories/${bigCode}?rule_type=supplier`)
    } catch (err) { console.warn('[SupplierCodeRuleStore] 删除大类失败:', err) }
  }

  // ========== 删除中类 ==========
  async function deleteMidCategory(bigCode, midCode) {
    categories.value = categories.value.map(b => {
      if (b.code !== bigCode) return b
      return { ...b, midCategories: b.midCategories.filter(m => m.code !== midCode) }
    })
    try {
      await enhancedApiClient.delete(`/material-code-categories/${midCode}?rule_type=supplier`)
    } catch (err) { console.warn('[SupplierCodeRuleStore] 删除中类失败:', err) }
  }

  return {
    categories,
    isLoading,
    error,
    fetchCategories,
    updateBigName,
    updateMidName,
    addBigCategory,
    addMidCategory,
    deleteBigCategory,
    deleteMidCategory,
  }
})
