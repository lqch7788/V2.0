/**
 * API 客户端
 * 封装 HTTP 请求，支持切换 LocalStorage 和 API 模式
 */

const API_BASE_URL = 'http://localhost:3001/api';

// 是否使用 API 模式
export const USE_API = import.meta.env.VITE_USE_API === 'true';

// 默认请求超时时间（毫秒）
const DEFAULT_TIMEOUT = 30000;

class ApiClient {
  constructor(baseUrl = API_BASE_URL, timeout = DEFAULT_TIMEOUT) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  getAuthHeaders() {
    const token = localStorage.getItem('token');
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  }

  async request(method, path, data, params) {
    let url = `${this.baseUrl}${path}`;

    // 处理查询参数
    if (params) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }

    const headers = {
      'Content-Type': 'application/json',
      ...this.getAuthHeaders(),
    };

    const options = {
      method,
      headers,
    };

    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }

    // 创建 AbortController 用于超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    options.signal = controller.signal;

    try {
      const response = await fetch(url, options);
      clearTimeout(timeoutId);

      // 原型阶段：不处理401错误，直接返回响应
      // if (response.status === 401) {
      //   localStorage.removeItem('token');
      //   throw new Error('未授权，请重新登录');
      // }

      if (!response.ok) {
        // 尝试解析错误响应体
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorResult = await response.json();
          if (errorResult && errorResult.error) {
            errorMessage = errorResult.error;
          }
        } catch {
          // 如果无法解析错误响应体，使用默认消息
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();

      // 如果是数组格式（直接返回数组），直接返回
      if (Array.isArray(result)) {
        return result;
      }

      // 防御性检查：result 必须是对象（不是 null / string）
      if (!result || typeof result !== 'object') {
        console.warn('[apiClient] 后端返回非对象:', result);
        return result;
      }

      // 如果是标准格式 {success, data, meta}，检查 success
      if ('success' in result) {
        if (!result.success) {
          throw new Error(result.error || 'API request failed');
        }
        // 如果有 meta 字段，保留完整响应结构
        if ('meta' in result && result.meta) {
          return result;
        }
        return result.data;
      }

      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`请求超时（${this.timeout}ms）`, { cause: error });
      }
      throw error;
    }
  }

  async get(path, params) {
    return this.request('GET', path, undefined, params);
  }

  async post(path, data) {
    return this.request('POST', path, data);
  }

  async put(path, data) {
    return this.request('PUT', path, data);
  }

  async delete(path) {
    return this.request('DELETE', path);
  }
}

// 导出 API 客户端实例
export const apiClient = new ApiClient();
