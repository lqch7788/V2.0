// @ts-nocheck - 预先存在的类型问题
/**
 * API客户端 - 简化版（无缓存）
 *
 * 数据流：API → 内存（无缓存）
 * 特性：
 * - 直接 API 调用，无 IndexedDB 缓存
 * - 网络状态检测：online/offline事件监听
 * - 自动重试：指数退避
 */

import { storageGet, storageRemove } from './storageService';
import { getSystemConfigValueNumber } from '../config/systemConfigReader';

// API基础配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002/api';
const FALLBACK_TIMEOUT = 30000;

/**
 * @typedef {{retryCount?: number}} ApiOptions
 * @typedef {{isOnline: boolean, lastOnlineTime: number|null}} NetworkStatus
 */

class EnhancedApiClient {
  constructor() {
    this.networkStatus = { isOnline: navigator.onLine, lastOnlineTime: null };
    this.setupNetworkListeners();
  }

  // ========== 网络状态 ==========

  /**
   * 获取当前网络状态
   * @returns {NetworkStatus}
   */
  getNetworkStatus() {
    return { ...this.networkStatus };
  }

  // ========== 核心请求方法 ==========

  /**
   * 统一请求方法
   * @param {{url: string, method: string, data?: unknown}} config
   * @param {ApiOptions} [options]
   * @template T
   * @returns {Promise<T>}
   */
  async request(config, options = {}) {
    const { url, method, data } = config;
    const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;

    // 0. 检查网络状态
    if (!this.networkStatus.isOnline) {
      throw new Error('NETWORK_OFFLINE: 网络不可用');
    }

    // 1. 尝试调用API（带重试）
    let lastError = null;
    const maxRetries = options.retryCount ?? 3;

    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await this.fetch(fullUrl, method, data);
        return response;
      } catch (error) {
        lastError = error;
        if (i < maxRetries - 1) {
          const delay = 1000 * Math.pow(2, i); // 指数退避
          console.warn(`[EnhancedApiClient] 请求失败，${delay}ms后重试 (${i + 1}/${maxRetries})`);
          await this.delay(delay);
        }
      }
    }

    throw lastError;
  }

  // ========== HTTP方法便捷调用 ==========

  /**
   * @template T
   * @param {string} url
   * @param {ApiOptions} [options]
   * @returns {Promise<T>}
   */
  async get(url, options) {
    return this.request({ url, method: 'GET' }, options);
  }

  /**
   * @template T
   * @param {string} url
   * @param {unknown} [data]
   * @param {ApiOptions} [options]
   * @returns {Promise<T>}
   */
  async post(url, data, options) {
    return this.request({ url, method: 'POST', data }, options);
  }

  /**
   * @template T
   * @param {string} url
   * @param {unknown} [data]
   * @param {ApiOptions} [options]
   * @returns {Promise<T>}
   */
  async put(url, data, options) {
    return this.request({ url, method: 'PUT', data }, options);
  }

  /**
   * @template T
   * @param {string} url
   * @param {ApiOptions} [options]
   * @returns {Promise<T>}
   */
  async delete(url, options) {
    return this.request({ url, method: 'DELETE' }, options);
  }

  /**
   * @template T
   * @param {string} url
   * @param {unknown} [data]
   * @param {ApiOptions} [options]
   * @returns {Promise<T>}
   */
  async patch(url, data, options) {
    return this.request({ url, method: 'PATCH', data }, options);
  }

  // ========== 网络监听 ==========

  /**
   * 设置网络状态监听
   * @returns {void}
   */
  setupNetworkListeners() {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => {
      console.log('[EnhancedApiClient] 网络恢复');
      this.networkStatus = { isOnline: true, lastOnlineTime: Date.now() };
    });

    window.addEventListener('offline', () => {
      console.log('[EnhancedApiClient] 网络断开');
      this.networkStatus = { isOnline: false, lastOnlineTime: null };
    });
  }

  // ========== 内部方法 ==========

  /**
   * @param {string} url
   * @param {string} method
   * @param {unknown} [data]
   * @returns {Promise<unknown>}
   */
  async fetch(url, method, data) {
    const headers = {
      'Content-Type': 'application/json',
    };

    // 优先从状态管理读取最新token，其次从localStorage
    let token = null;
    try {
      // 延迟导入避免循环依赖
      const { useUserStore } = await import('../stores');
      token = useUserStore().token;
    } catch {
      // 导入失败则尝试从localStorage读取
    }
    if (!token) {
      token = storageGet('token');
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
      method,
      headers,
    };

    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }

    const timeoutMs = getSystemConfigValueNumber('api.timeout', FALLBACK_TIMEOUT);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    options.signal = controller.signal;

    try {
      const response = await fetch(url, options);
      clearTimeout(timeoutId);

      // 如果是 401（未授权），可能是 token 无效，清除 token 并重试
      if (response.status === 401) {
        console.warn('[EnhancedApiClient] Token 无效或已过期，清除 token');
        // 按 V1.1 apiClient.ts L189-195 1:1 翻译：用 try/catch 包装，
        // 避免 storageRemove 引用错误遮蔽真正的 401 错误信息
        try {
          localStorage.removeItem('token');
        } catch {
          // 忽略清理错误
        }
        try {
          storageRemove('token');
        } catch {
          // 忽略清理错误
        }
        // 尝试清除用户 store 中的 token
        try {
          const { useUserStore } = await import('../stores');
          const userStore = useUserStore()
          if (userStore.token) {
            userStore.setToken('')
          }
        } catch {
          // 忽略
        }
        // 不带 token 重试
        delete headers['Authorization'];
        const retryOptions = {
          ...options,
          headers
        };
        const retryResponse = await fetch(url, retryOptions);
        if (!retryResponse.ok) {
          throw new Error(`HTTP error! status: ${retryResponse.status}`);
        }
        const retryResult = await retryResponse.json();
        if (retryResult && typeof retryResult === 'object' && 'success' in retryResult) {
          if (!retryResult.success) {
            throw new Error(retryResult.error || 'API request failed');
          }
          return retryResult.data ?? retryResult;
        }
        return retryResult;
      }

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorResult = await response.json();
          if (errorResult?.error) {
            errorMessage = errorResult.error;
          }
        } catch {
          // 忽略解析错误
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();

      // 统一响应格式处理
      if (result && typeof result === 'object' && 'success' in result) {
        if (!result.success) {
          throw new Error(result.error || 'API request failed');
        }
        return result.data ?? result;
      }

      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`请求超时（${timeoutMs}ms）`);
      }
      throw error;
    }
  }

  /**
   * @param {number} ms
   * @returns {Promise<void>}
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 导出单例
export const enhancedApiClient = new EnhancedApiClient();
