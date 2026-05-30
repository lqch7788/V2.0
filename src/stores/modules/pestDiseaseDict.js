/**
 * 病虫害字典 Store
 * 对接真实 API，替代 mockData
 */
import { defineStore } from 'pinia'
import axios from 'axios'

const BASE_URL = '/api/pest-disease-dict'

// 字段映射：API snake_case -> 前端 camelCase
function mapItem(item) {
  if (!item) return null
  return {
    id: item.id,
    dictCode: item.dict_code,
    dictName: item.dict_name,
    dictType: item.dict_type,
    targetCrops: item.target_crops,
    description: item.description,
    status: item.status,
    createTime: item.create_time
  }
}

export const usePestDiseaseDictStore = defineStore('pestDiseaseDict', {
  state: () => ({
    /** @type {Array} 数据列表 */
    dataList: [],
    loading: false,
    saveLoading: false,
    error: null,
    /** 当前 tab: pest / disease */
    activeTab: 'pest',
    searchKeyword: '',
    filters: {
      targetCrops: '',
      status: ''
    },
    /** 分页信息 */
    meta: {
      total: 0,
      page: 1,
      limit: 20
    }
  }),

  getters: {
    /** 按 tab 过滤 + 前端搜索过滤 */
    filteredItems(state) {
      let items = state.dataList.filter(item => item.dictType === state.activeTab)

      if (state.searchKeyword) {
        const kw = state.searchKeyword.toLowerCase()
        items = items.filter(item =>
          (item.dictName && item.dictName.toLowerCase().includes(kw)) ||
          (item.dictCode && item.dictCode.toLowerCase().includes(kw))
        )
      }

      if (state.filters.targetCrops) {
        items = items.filter(item =>
          item.targetCrops && item.targetCrops.includes(state.filters.targetCrops)
        )
      }

      if (state.filters.status) {
        items = items.filter(item => item.status === state.filters.status)
      }

      return items
    },

    /** 统计数据 */
    stats(state) {
      return {
        pestCount: state.dataList.filter(it => it.dictType === 'pest').length,
        diseaseCount: state.dataList.filter(it => it.dictType === 'disease').length
      }
    }
  },

  actions: {
    /** 加载列表数据 */
    async loadData() {
      this.loading = true
      this.error = null
      try {
        const params = { limit: 10000, page: 1 }
        if (this.activeTab) params.dictType = this.activeTab

        const res = await axios.get(BASE_URL, { params })
        if (res.data.success) {
          this.dataList = (res.data.data || []).map(mapItem)
          if (res.data.meta) {
            this.meta = res.data.meta
          }
        } else {
          this.error = res.data.error || '加载数据失败'
        }
      } catch (err) {
        this.error = err.response?.data?.error || err.message || '加载数据失败'
      } finally {
        this.loading = false
      }
    },

    /** 获取下一个编码 */
    async fetchNextCode(type) {
      const res = await axios.get(`${BASE_URL}/next-code`, { params: { type } })
      return res.data.next_code
    },

    /** 新增 */
    async createItem(payload) {
      this.saveLoading = true
      try {
        const res = await axios.post(BASE_URL, {
          dict_name: payload.dictName,
          dict_type: payload.dictType,
          dict_code: payload.dictCode,
          target_crops: payload.targetCrops,
          description: payload.description,
          status: payload.status
        })
        if (res.data.success) {
          return mapItem(res.data.data)
        }
        throw new Error(res.data.error || '新增失败')
      } finally {
        this.saveLoading = false
      }
    },

    /** 更新 */
    async updateItem(id, payload) {
      this.saveLoading = true
      try {
        const res = await axios.put(`${BASE_URL}/${id}`, {
          dict_name: payload.dictName,
          dict_type: payload.dictType,
          target_crops: payload.targetCrops,
          description: payload.description,
          status: payload.status
        })
        if (res.data.success) {
          return mapItem(res.data.data)
        }
        throw new Error(res.data.error || '更新失败')
      } finally {
        this.saveLoading = false
      }
    },

    /** 删除 */
    async deleteItem(id) {
      const res = await axios.delete(`${BASE_URL}/${id}`)
      if (!res.data.success) {
        throw new Error(res.data.error || '删除失败')
      }
      return true
    },

    /** 获取详情 */
    async getDetail(id) {
      const res = await axios.get(`${BASE_URL}/${id}`)
      if (res.data.success) {
        return mapItem(res.data.data)
      }
      throw new Error(res.data.error || '获取详情失败')
    }
  }
})
