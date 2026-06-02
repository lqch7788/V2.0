/**
 * 作物品种库 Pinia Store
 * 提供品种数据的集中管理
 */

import { defineStore } from 'pinia';
import {
  initVarieties,
  getAllVarieties,
  addVariety as addVarietyService,
  updateVariety as updateVarietyService,
  deleteVariety as deleteVarietyService,
  getVarietyStats,
  refreshVarieties
} from '../../services/cropVarietyService.js';

export const useCropVarietyStore = defineStore('cropVariety', {
  state: () => ({
    // 品种列表
    items: [],
    // 加载状态
    isLoading: false,
    // 是否已完成首次加载
    isInitialized: false,
    // 错误信息
    error: null,
    // 统计信息
    stats: {
      total: 0,
      active: 0,
      inactive: 0,
      byCategory: {}
    }
  }),

  getters: {
    // 获取所有品种
    allItems: (state) => state.items,

    // 获取启用的品种
    activeItems: (state) => state.items.filter(v => v.status === 'active'),

    // 根据ID获取品种
    getItemById: (state) => (id) => {
      return state.items.find(v => v.id === id);
    },

    // 根据编码获取品种
    getItemByCode: (state) => (code) => {
      return state.items.find(v => v.cropCode === code);
    },

    // V1.1 兼容：从 items 派生的 categoryOptions（去重 categoryCode + categoryName）
    categoryOptions: (state) => {
      const seen = new Set()
      return state.items
        .filter(v => v.categoryCode && !seen.has(v.categoryCode) && seen.add(v.categoryCode))
        .map(v => ({ value: v.categoryCode, label: v.categoryName || v.categoryCode }))
    },

    // V1.1 兼容：从 items 派生的 typeOptions
    typeOptions: (state) => (categoryCode) => {
      const seen = new Set()
      return state.items
        .filter(v => v.categoryCode === categoryCode && v.typeCode && !seen.has(v.typeCode) && seen.add(v.typeCode))
        .map(v => ({ value: v.typeCode, label: v.typeName || v.typeCode }))
    },

    // V1.1 兼容：从 items 派生的 varietyOptions
    varietyOptions: (state) => (typeCode) => {
      const seen = new Set()
      return state.items
        .filter(v => v.typeCode === typeCode && v.varietyCode && !seen.has(v.varietyCode) && seen.add(v.varietyCode))
        .map(v => ({ value: v.varietyCode, label: v.varietyName || v.varietyCode }))
    },

    // V1.1 兼容：searchVarieties（多字段模糊搜索）
    searchVarieties: (state) => (keyword) => {
      if (!keyword) return state.items
      const kw = keyword.toLowerCase()
      return state.items.filter(v =>
        v.cropCode?.toLowerCase().includes(kw) ||
        v.varietyName?.includes(keyword) ||
        v.subVariety1Name?.includes(keyword) ||
        v.categoryName?.includes(keyword) ||
        v.typeName?.includes(keyword) ||
        v.alias?.toLowerCase().includes(kw)
      )
    }
  },

  actions: {
    /**
     * 从 V1.1 localStorage 迁移品种数据（V1.1 useCropVarietyStore.ts 兼容路径）
     * 触发条件：items < 100 且 V1.1 key 存在
     */
    migrateFromLocalStorage() {
      try {
        const V1_1_KEYS = ['crop_varieties', 'cropVarieties', 'crop-variety-list']
        for (const key of V1_1_KEYS) {
          const stored = localStorage.getItem(key)
          if (stored) {
            const parsed = JSON.parse(stored)
            if (Array.isArray(parsed) && parsed.length > 0) {
              console.log(`[useCropVarietyStore] 从 V1.1 localStorage[${key}] 迁移 ${parsed.length} 条品种`)
              // 与 V1.1 兼容：使用相同的归一化字段
              this.items = parsed.map(v => ({
                id: v.id,
                cropCode: v.cropCode || v.code,
                categoryCode: v.categoryCode,
                categoryName: v.categoryName,
                typeCode: v.typeCode,
                typeName: v.typeName,
                varietyCode: v.varietyCode,
                varietyName: v.varietyName,
                subVariety1Code: v.subVariety1Code,
                subVariety1Name: v.subVariety1Name,
                detailVarietyCode: v.detailVarietyCode,
                detailVarietyName: v.detailVarietyName,
                alias: v.alias,
                status: v.status || 'active',
              }))
              this.isInitialized = true
              this.updateStats()
              return true
            }
          }
        }
      } catch (e) {
        console.warn('[useCropVarietyStore] V1.1 localStorage 迁移失败:', e)
      }
      return false
    },

    /**
     * 初始化并加载所有品种
     */
    async loadItems() {
      if (this.isLoading) return;

      this.isLoading = true;
      this.error = null;

      try {
        const data = await initVarieties();
        // 若服务端返回数据 < 100 条，尝试从 V1.1 localStorage 迁移
        if (!data || data.length < 100) {
          const migrated = this.migrateFromLocalStorage()
          if (!migrated) {
            this.items = data || []
          }
        } else {
          this.items = data
        }
        this.isInitialized = true;
        this.updateStats();
      } catch (error) {
        console.error('[useCropVarietyStore] 获取品种失败:', error);
        this.error = error.message || '获取品种失败';
        // API 失败时也尝试 V1.1 迁移兜底
        this.migrateFromLocalStorage();
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * 强制刷新
     */
    async refreshItems() {
      this.isLoading = true;
      this.error = null;

      try {
        const data = await refreshVarieties();
        this.items = data;
        this.updateStats();
      } catch (error) {
        console.error('[useCropVarietyStore] 刷新失败:', error);
        this.error = error.message || '刷新失败';
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * 新增品种
     */
    async addItem(data) {
      try {
        const newItem = await addVarietyService(data);
        await this.refreshItems();
        return newItem;
      } catch (error) {
        console.error('[useCropVarietyStore] 新增失败:', error);
        throw error;
      }
    },

    /**
     * 更新品种
     */
    async updateItem(id, updates) {
      try {
        const updated = await updateVarietyService(id, updates);
        if (updated) {
          // 更新本地状态而不需要重新加载
          const index = this.items.findIndex(v => v.id === id);
          if (index !== -1) {
            this.items[index] = {
              ...this.items[index],
              ...updates,
              updateTime: new Date().toLocaleString('zh-CN')
            };
          }
          this.updateStats();
        }
        return updated;
      } catch (error) {
        console.error('[useCropVarietyStore] 更新失败:', error);
        throw error;
      }
    },

    /**
     * 删除品种
     */
    async deleteItem(id) {
      try {
        const success = await deleteVarietyService(id);
        if (success) {
          this.items = this.items.filter(v => v.id !== id);
          this.updateStats();
        }
        return success;
      } catch (error) {
        console.error('[useCropVarietyStore] 删除失败:', error);
        throw error;
      }
    },

    /**
     * 更新统计信息
     */
    updateStats() {
      this.stats = getVarietyStats();
    }
  }
});
