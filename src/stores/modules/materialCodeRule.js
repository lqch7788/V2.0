/**
 * 物料编码规则分类树 Store (Pinia)
 * 数据流: Component → Store → apiMaterialCodeCategoryService → Backend API (SQLite)
 *
 * 存储格式: 扁平行记录 ←DB→ 树形结构 (BigCategory[])
 * 对应V1.1: useMaterialCodeRuleStore.ts
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '@/services/apiMaterialCodeCategoryService'

// ========== 树形结构类型 (与V1.1保持一致) ==========

export const useMaterialCodeRuleStore = defineStore('materialCodeRule', () => {
  // 核心数据
  const categories = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  // 计算属性
  const isLoaded = computed(() => categories.value.length > 0)

  // ========== 工具函数: 扁平行转树形结构 ==========
  function flatToTree(rows) {
    const bigRows = rows.filter(r => r.level === 'big')
    const midRows = rows.filter(r => r.level === 'mid')
    const subRows = rows.filter(r => r.level === 'sub')

    return bigRows.map(big => {
      const mids = midRows
        .filter(m => m.parentCode === big.code)
        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
        .map(mid => {
          const parentKey = big.code + mid.code
          const subs = subRows
            .filter(s => s.parentCode === parentKey)
            .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
            .map(sub => ({ code: sub.code, name: sub.name }))
          return { code: mid.code, name: mid.name, subCategories: subs }
        })
      return {
        code: big.code,
        name: big.name,
        nameEn: big.nameEn || '',
        midCategories: mids,
      }
    })
  }

  // ========== 加载全部数据 ==========
  async function loadCategories() {
    if (isLoaded.value) return
    isLoading.value = true
    error.value = null
    try {
      const rows = await fetchCategories()
      categories.value = flatToTree(rows)
    } catch (err) {
      console.error('加载物料编码分类失败:', err)
      error.value = err instanceof Error ? err.message : '加载失败'
    } finally {
      isLoading.value = false
    }
  }

  // ========== 更新大类名称 ==========
  async function updateBigName(bigCode, newName) {
    await updateCategory(bigCode, { name: newName })
    categories.value = categories.value.map(b =>
      b.code === bigCode ? { ...b, name: newName } : b
    )
  }

  // ========== 更新中类名称 ==========
  async function updateMidName(bigCode, midCode, newName) {
    await updateCategory(midCode, { name: newName })
    categories.value = categories.value.map(b => {
      if (b.code !== bigCode) return b
      return {
        ...b,
        midCategories: b.midCategories.map(m =>
          m.code === midCode ? { ...m, name: newName } : m
        ),
      }
    })
  }

  // ========== 更新小类名称 ==========
  async function updateSubName(bigCode, midCode, subCode, newName) {
    await updateCategory(subCode, { name: newName })
    categories.value = categories.value.map(b => {
      if (b.code !== bigCode) return b
      return {
        ...b,
        midCategories: b.midCategories.map(m => {
          if (m.code !== midCode) return m
          return {
            ...m,
            subCategories: m.subCategories.map(s =>
              s.code === subCode ? { ...s, name: newName } : s
            ),
          }
        }),
      }
    })
  }

  // ========== 新增大类 ==========
  async function addBigCategory(code, name, nameEn = '') {
    await createCategory({ code, name, nameEn, level: 'big', ruleType: 'material' })
    categories.value = [...categories.value, { code, name, nameEn, midCategories: [] }]
  }

  // ========== 新增中类 ==========
  async function addMidCategory(bigCode, code, name) {
    await createCategory({ code, name, parentCode: bigCode, level: 'mid', ruleType: 'material' })
    categories.value = categories.value.map(b => {
      if (b.code !== bigCode) return b
      return {
        ...b,
        midCategories: [...b.midCategories, { code, name, subCategories: [] }],
      }
    })
  }

  // ========== 新增小类 ==========
  async function addSubCategory(bigCode, midCode, code, name) {
    const parentKey = bigCode + midCode
    await createCategory({ code, name, parentCode: parentKey, level: 'sub', ruleType: 'material' })
    categories.value = categories.value.map(b => {
      if (b.code !== bigCode) return b
      return {
        ...b,
        midCategories: b.midCategories.map(m => {
          if (m.code !== midCode) return m
          return {
            ...m,
            subCategories: [...m.subCategories, { code, name }],
          }
        }),
      }
    })
  }

  // ========== 删除大类 ==========
  async function deleteBigCategory(bigCode) {
    await deleteCategory(bigCode)
    categories.value = categories.value.filter(b => b.code !== bigCode)
  }

  // ========== 删除中类 ==========
  async function deleteMidCategory(bigCode, midCode) {
    await deleteCategory(midCode)
    categories.value = categories.value.map(b => {
      if (b.code !== bigCode) return b
      return {
        ...b,
        midCategories: b.midCategories.filter(m => m.code !== midCode),
      }
    })
  }

  // ========== 删除小类 ==========
  async function deleteSubCategory(bigCode, midCode, subCode) {
    await deleteCategory(subCode)
    categories.value = categories.value.map(b => {
      if (b.code !== bigCode) return b
      return {
        ...b,
        midCategories: b.midCategories.map(m => {
          if (m.code !== midCode) return m
          return {
            ...m,
            subCategories: m.subCategories.filter(s => s.code !== subCode),
          }
        }),
      }
    })
  }

  return {
    categories,
    isLoading,
    error,
    isLoaded,
    loadCategories,
    updateBigName,
    updateMidName,
    updateSubName,
    addBigCategory,
    addMidCategory,
    addSubCategory,
    deleteBigCategory,
    deleteMidCategory,
    deleteSubCategory,
  }
})
