/**
 * 物料流转追溯 Pinia Store（V1.1 → V2.0 移植）
 * V1.1 源文件：src/stores/useMaterialFlowStore.ts
 */
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { enhancedApiClient } from '@/lib/apiClient';

export const useMaterialFlowStore = defineStore('materialFlow', () => {
  const logs = ref([]);
  const total = ref(0);
  const loading = ref(false);
  const traceData = ref([]);
  const statsData = ref([]);

  // 加载流转记录列表
  const loadLogs = async (params = {}) => {
    loading.value = true;
    try {
      const { page = 1, pageSize = 20, flowType, cropName, startDate, endDate } = params;
      const queryParams = { page, pageSize };
      if (flowType) queryParams.flowType = flowType;
      if (cropName) queryParams.cropName = cropName;
      if (startDate) queryParams.startDate = startDate;
      if (endDate) queryParams.endDate = endDate;
      const res = await enhancedApiClient.get('/material-flow-log', queryParams);
      const data = res?.data || res || {};
      logs.value = data.list || [];
      total.value = data.total || 0;
    } catch (e) {
      console.error('[materialFlow] loadLogs 失败:', e);
      logs.value = [];
      total.value = 0;
    } finally {
      loading.value = false;
    }
  };

  // 批次追溯
  const loadTrace = async (code) => {
    loading.value = true;
    try {
      const res = await enhancedApiClient.get('/material-flow-log/trace', { code });
      traceData.value = res?.data || res || [];
    } catch (e) {
      console.error('[materialFlow] loadTrace 失败:', e);
      traceData.value = [];
    } finally {
      loading.value = false;
    }
  };

  // 育苗用料统计
  const loadCropStats = async (year) => {
    loading.value = true;
    try {
      const res = await enhancedApiClient.get('/material-flow-log/stats/by-crop', { year });
      statsData.value = res?.data || res || [];
    } catch (e) {
      console.error('[materialFlow] loadCropStats 失败:', e);
      statsData.value = [];
    } finally {
      loading.value = false;
    }
  };

  // 种植用料统计
  const loadSourceStats = async (year) => {
    loading.value = true;
    try {
      const res = await enhancedApiClient.get('/material-flow-log/stats/by-source', { year });
      statsData.value = res?.data || res || [];
    } catch (e) {
      console.error('[materialFlow] loadSourceStats 失败:', e);
      statsData.value = [];
    } finally {
      loading.value = false;
    }
  };

  // 年度总览
  const loadAnnualStats = async (year) => {
    loading.value = true;
    try {
      const res = await enhancedApiClient.get('/material-flow-log/stats/annual', { year });
      statsData.value = res?.data || res || [];
    } catch (e) {
      console.error('[materialFlow] loadAnnualStats 失败:', e);
      statsData.value = [];
    } finally {
      loading.value = false;
    }
  };

  // 批量删除
  const batchDeleteLogs = async (ids) => {
    try {
      await enhancedApiClient.delete(`/material-flow-log?ids=${ids.join(',')}`);
      return true;
    } catch (e) {
      console.error('[materialFlow] batchDeleteLogs 失败:', e);
      return false;
    }
  };

  return {
    logs, total, loading, traceData, statsData,
    loadLogs, loadTrace, loadCropStats, loadSourceStats, loadAnnualStats, batchDeleteLogs
  };
});