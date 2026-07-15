import axios from 'axios'
import { ElMessage } from 'element-plus'

// 最大重试次数（与 V1.1 enhancedApiClient 的 maxRetries 一致）
const MAX_RETRIES = 3

// 指数退避延迟（与 V1.1 公式 1000 * 2^i 一致：1s, 2s, 4s）
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * 包装 axios 适配器，添加 3 次指数退避重试
 * 1:1 对齐 V1.1 src/lib/apiClient.ts 的重试策略
 *
 * 实现：基于原生 fetch（浏览器 + Node 18+ 都支持），避免 axios 1.x
 * adapter 解析陷阱（axios.defaults.adapter 是 object 非 function，
 * axios.getAdapter 需 config 参数）。
 */
const fetchAdapter = async (config) => {
  const baseURL = config.baseURL || ''
  const fullUrl = /^https?:\/\//.test(config.url || '')
    ? config.url
    : baseURL.replace(/\/$/, '') + (config.url?.startsWith('/') ? config.url : '/' + (config.url || ''))

  const headers = new Headers()
  Object.entries(config.headers || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null) headers.set(k, String(v))
  })

  // axios 1.x 默认 Content-Type 由 fetch 自动嗅探
  if (config.data && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const controller = new AbortController()
  const timeoutId = config.timeout
    ? setTimeout(() => controller.abort(), config.timeout)
    : null

  try {
    const response = await fetch(fullUrl, {
      method: (config.method || 'get').toUpperCase(),
      headers,
      body: config.data ? (typeof config.data === 'string' ? config.data : JSON.stringify(config.data)) : undefined,
      signal: controller.signal,
      credentials: 'include',
    })
    if (timeoutId) clearTimeout(timeoutId)

    const contentType = response.headers.get('content-type') || ''
    const data = contentType.includes('application/json') ? await response.json() : await response.text()

    return {
      data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      config,
      request: response,
    }
  } catch (error) {
    if (timeoutId) clearTimeout(timeoutId)
    if (error && error.name === 'AbortError') {
      throw new Error('timeout of ' + config.timeout + 'ms exceeded', { cause: error })
    }
    throw error
  }
}

const retryAdapter = (adapter) => {
  return async (config) => {
    const runOnce = (cfg) => adapter(cfg)
    if (config.retry === false) {
      return runOnce(config)
    }
    const maxRetries = config.retryCount ?? MAX_RETRIES
    let lastError
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await runOnce(config)
      } catch (error) {
        lastError = error
        console.warn(`[request] 请求失败 (${i + 1}/${maxRetries}):`, (error && error.message) || error)
        if (i < maxRetries - 1) {
          const backoff = 1000 * Math.pow(2, i)
          await delay(backoff)
        }
      }
    }
    throw lastError
  }
}

// 创建 axios 实例
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  },
  // 注入基于 fetch 的重试适配器（避免 axios 1.x adapter 解析陷阱）
  adapter: retryAdapter(fetchAdapter)
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 添加 token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // 显示加载提示（可选）
    // if (config.headers.showLoading !== 'false') {
    //   loadingInstance = ElLoading.service({ fullscreen: true })
    // }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    // 关闭加载提示
    // loadingInstance?.close()

    // V1.1/V2.0 后端返回格式: { success: true, data } 或 { success: true, message, data }
    // 也可能返回没有success字段的格式（如直接返回数组、空响应、Vite 错误页等）
    // 防御性检查：response.data 必须是对象（不是 null / undefined / string / 数组）
    const hasSuccessField = response.data
      && typeof response.data === 'object'
      && !Array.isArray(response.data)
      && 'success' in response.data

    if (!hasSuccessField) {
      // 没有success字段或不是对象（可能是旧版API、HTML 错误页、字符串等），直接返回整个响应数据
      // 这可能是旧版API或其他格式的数据
      console.warn('[request] 后端返回非标准格式:', response.data)
      return response.data
    }

    const { success, message, data } = response.data

    // 根据状态处理
    if (success === true) {
      return data
    } else if (success === false) {
      // 业务层面的失败
      ElMessage.warning(message || '请求失败')
      return Promise.reject(new Error(message))
    }
    // 兼容旧的 code 格式（如果后端偶尔返回 code: 200）
    const { code } = response.data
    if (code === 200) {
      return data
    } else if (code === 401) {
      // 未授权，跳转登录
      ElMessage.error('登录已过期，请重新登录')
      localStorage.removeItem('token')
      window.location.href = '/login'
      return Promise.reject(new Error(message))
    } else if (code === 403) {
      ElMessage.error('没有权限访问该资源')
      return Promise.reject(new Error(message))
    } else if (code === 500) {
      ElMessage.error('服务器错误')
      return Promise.reject(new Error(message))
    } else {
      ElMessage.warning(message || '请求失败')
      return Promise.reject(new Error(message))
    }
  },
  (error) => {
    // 关闭加载提示
    // loadingInstance?.close()

    if (error.response) {
      const { status } = error.response
      switch (status) {
        case 400:
          ElMessage.error('请求参数错误')
          break
        case 401:
          ElMessage.error('登录已过期，请重新登录')
          localStorage.removeItem('token')
          window.location.href = '/login'
          break
        case 403:
          ElMessage.error('没有权限访问该资源')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器错误')
          break
        default:
          ElMessage.error('网络错误，请稍后重试')
      }
    } else if (error.request) {
      ElMessage.error('网络错误，请检查您的网络连接')
    } else {
      ElMessage.error('请求配置错误')
    }

    return Promise.reject(error)
  }
)

export default request

// 封装 GET 请求
export function get(url, params, config) {
  return request.get(url, { params, ...config })
}

// 封装 POST 请求
export function post(url, data, config) {
  return request.post(url, data, config)
}

// 封装 PUT 请求
export function put(url, data, config) {
  return request.put(url, data, config)
}

// 封装 PATCH 请求
export function patch(url, data, config) {
  return request.patch(url, data, config)
}

// 封装 DELETE 请求
export function del(url, params, config) {
  return request.delete(url, { params, ...config })
}
