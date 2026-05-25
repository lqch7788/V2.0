/**
 * 物料分类编码 Store - 对应V1.1物料分类管理状态
 * 管理物料大类、中类、小类及编码生成状态
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getBigCategories, getMidCategories, getSubCategories, generateMaterialCode, validateMaterialCode, getCategoryConfig, createCategory, updateCategory, deleteCategory } from '@/api/material/apiMaterialCodeCategoryService'

export const useMaterialTypeStore = defineStore('materialType', () => {
  // 状态
  const bigCategories = ref([])
  const midCategories = ref([])
  const subCategories = ref([])
  const categoryConfig = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // 当前选中
  const currentBigCode = ref('')
  const currentMidCode = ref('')

  /**
   * 加载物料大类列表
   */
  const loadBigCategories = async () => {
    loading.value = true
    error.value = null
    try {
      const res = await getBigCategories()
      bigCategories.value = res || []
      return res
    } catch (err) {
      error.value = err.message || '加载物料大类失败'
      console.error('loadBigCategories error:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * 加载物料中类列表
   * @param {string} bigCode - 大类编码
   */
  const loadMidCategories = async (bigCode) => {
    loading.value = true
    error.value = null
    currentBigCode.value = bigCode
    try {
      const res = await getMidCategories(bigCode)
      midCategories.value = res || []
      // 同时清空小类
      subCategories.value = []
      return res
    } catch (err) {
      error.value = err.message || '加载物料中类失败'
      console.error('loadMidCategories error:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * 加载物料小类列表
   * @param {string} bigCode - 大类编码
   * @param {string} midCode - 中类编码
   */
  const loadSubCategories = async (bigCode, midCode) => {
    loading.value = true
    error.value = null
    currentBigCode.value = bigCode
    currentMidCode.value = midCode
    try {
      const res = await getSubCategories(bigCode, midCode)
      subCategories.value = res || []
      return res
    } catch (err) {
      error.value = err.message || '加载物料小类失败'
      console.error('loadSubCategories error:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * 加载物料分类配置
   */
  const loadCategoryConfig = async () => {
    loading.value = true
    error.value = null
    try {
      const res = await getCategoryConfig()
      categoryConfig.value = res
      return res
    } catch (err) {
      error.value = err.message || '加载分类配置失败'
      console.error('loadCategoryConfig error:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * 生成物料编码
   * @param {Object} params - 编码参数
   * @param {string} params.bigCategory - 大类编码
   * @param {string} params.midCategory - 中类编码
   * @param {string} params.subCategory - 小类编码
   */
  const generateCode = async (params) => {
    loading.value = true
    error.value = null
    try {
      const res = await generateMaterialCode(params)
      return res
    } catch (err) {
      error.value = err.message || '生成编码失败'
      console.error('generateCode error:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * 验证物料编码是否已存在
   * @param {string} code - 物料编码
   */
  const checkCodeExists = async (code) => {
    try {
      const res = await validateMaterialCode(code)
      return res
    } catch (err) {
      console.error('checkCodeExists error:', err)
      return false
    }
  }

  /**
   * 创建物料分类
   * @param {Object} data - 分类数据
   */
  const addCategory = async (data) => {
    loading.value = true
    error.value = null
    try {
      const res = await createCategory(data)
      // 重新加载对应级别的分类
      if (data.bigCategory && !data.midCategory) {
        await loadBigCategories()
      } else if (data.bigCategory && data.midCategory) {
        await loadMidCategories(data.bigCategory)
      }
      return res
    } catch (err) {
      error.value = err.message || '创建分类失败'
      console.error('addCategory error:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新物料分类
   * @param {string} code - 分类编码
   * @param {Object} data - 更新数据
   */
  const editCategory = async (code, data) => {
    loading.value = true
    error.value = null
    try {
      const res = await updateCategory(code, data)
      // 重新加载列表
      await loadBigCategories()
      return res
    } catch (err) {
      error.value = err.message || '更新分类失败'
      console.error('editCategory error:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 删除物料分类
   * @param {string} code - 分类编码
   */
  const removeCategory = async (code) => {
    loading.value = true
    error.value = null
    try {
      await deleteCategory(code)
      // 重新加载列表
      await loadBigCategories()
      return true
    } catch (err) {
      error.value = err.message || '删除分类失败'
      console.error('removeCategory error:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 清空所有分类
   */
  const clearCategories = () => {
    bigCategories.value = []
    midCategories.value = []
    subCategories.value = []
    currentBigCode.value = ''
    currentMidCode.value = ''
  }

  return {
    // 状态
    bigCategories,
    midCategories,
    subCategories,
    categoryConfig,
    loading,
    error,
    currentBigCode,
    currentMidCode,
    // 方法
    loadBigCategories,
    loadMidCategories,
    loadSubCategories,
    loadCategoryConfig,
    generateCode,
    checkCodeExists,
    addCategory,
    editCategory,
    removeCategory,
    clearCategories
  }
})
