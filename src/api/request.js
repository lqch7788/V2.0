import axios from 'axios'
import { ElMessage } from 'element-plus'

// 创建 axios 实例
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
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
    const { success, message, data } = response.data

    // 根据状态处理
    if (success === true) {
      return data
    } else if (success === false || !success) {
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

// 封装 DELETE 请求
export function del(url, params, config) {
  return request.delete(url, { params, ...config })
}
