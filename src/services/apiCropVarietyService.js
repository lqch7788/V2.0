/**
 * 作物品种服务
 * 提供品种库数据的初始化和查询功能
 */

// 本地存储的品种数据
let varieties = []

/**
 * 初始化品种数据
 */
export function initVarieties() {
  const storedVarieties = localStorage.getItem('cropVarieties')
  if (storedVarieties) {
    varieties = JSON.parse(storedVarieties)
  } else {
    // 默认品种数据
    varieties = [
      { value: '番茄', label: '番茄', varietyCode: 'VC001', categoryName: '茄果类', typeName: '番茄' },
      { value: '黄瓜', label: '黄瓜', varietyCode: 'VC002', categoryName: '瓜类', typeName: '黄瓜' },
      { value: '草莓', label: '草莓', varietyCode: 'VC003', categoryName: '浆果类', typeName: '草莓' },
      { value: '辣椒', label: '辣椒', varietyCode: 'VC004', categoryName: '茄果类', typeName: '辣椒' },
      { value: '茄子', label: '茄子', varietyCode: 'VC005', categoryName: '茄果类', typeName: '茄子' },
      { value: '西瓜', label: '西瓜', varietyCode: 'VC006', categoryName: '瓜类', typeName: '西瓜' },
      { value: '甜瓜', label: '甜瓜', varietyCode: 'VC007', categoryName: '瓜类', typeName: '甜瓜' },
      { value: '生菜', label: '生菜', varietyCode: 'VC008', categoryName: '叶菜类', typeName: '生菜' },
      { value: '菠菜', label: '菠菜', varietyCode: 'VC009', categoryName: '叶菜类', typeName: '菠菜' },
      { value: '白菜', label: '白菜', varietyCode: 'VC010', categoryName: '叶菜类', typeName: '白菜' }
    ]
    saveVarieties()
  }
}

/**
 * 获取品种选项
 */
export function getVarietyOptions() {
  if (varieties.length === 0) {
    initVarieties()
  }
  return varieties
}

/**
 * 保存品种数据到本地存储
 */
function saveVarieties() {
  localStorage.setItem('cropVarieties', JSON.stringify(varieties))
}

/**
 * 根据品种编码获取品种信息
 */
export function getVarietyByCode(code) {
  return varieties.find(v => v.varietyCode === code)
}

/**
 * 根据品种名称获取品种信息
 */
export function getVarietyByName(name) {
  return varieties.find(v => v.value === name || v.label === name)
}
