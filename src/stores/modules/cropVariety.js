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
    }
  },

  actions: {
    /**
     * 初始化并加载所有品种
     */
    async loadItems() {
      if (this.isLoading) return;

      this.isLoading = true;
      this.error = null;

      try {
        const data = await initVarieties();
        this.items = data;
        this.isInitialized = true;
        this.updateStats();
      } catch (error) {
        console.error('[useCropVarietyStore] 获取品种失败:', error);
        this.error = error.message || '获取品种失败';
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
