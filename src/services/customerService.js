/**
 * 客户档案 API 服务
 * 对接后端 /api/customers
 *
 * 数据流：API → enhancedApiClient（无缓存）→ Store → 组件
 * - 请求字段名通过 toSnakeCase 转换为 snake_case（与 V2.0 后端 customer.ts 路由解构一致）
 * - 响应字段名由后端 queryHelper 自动完成（snake_case → camelCase）
 */

import { enhancedApiClient } from '@/lib/apiClient'

// 字段映射 (camelCase -> snake_case)
const FIELD_MAP = {
  customerCode: 'customer_code',
  customerName: 'customer_name',
  contactPerson: 'contact_person',
  contactPhone: 'contact_phone',
  deliveryAddress: 'delivery_address',
  remarks: 'remarks',
  createBy: 'create_by',
}

function toSnakeCase(data) {
  const result = {}
  for (const [key, value] of Object.entries(data)) {
    const snakeKey = FIELD_MAP[key] || key
    result[snakeKey] = value
  }
  return result
}

/**
 * 获取所有客户
 */
export async function getCustomers(params) {
  const searchParams = new URLSearchParams()
  if (params?.search) searchParams.set('search', params.search)
  const query = searchParams.toString()
  const data = await enhancedApiClient.get(`/customers${query ? `?${query}` : ''}`)
  return Array.isArray(data) ? data : []
}

/**
 * 获取单个客户
 */
export async function getCustomerById(id) {
  return await enhancedApiClient.get(`/customers/${id}`)
}

/**
 * 创建客户
 * 后端会自动生成 customerCode（如果未提供）和 id
 */
export async function createCustomer(data) {
  const snakeData = toSnakeCase(data)
  return await enhancedApiClient.post('/customers', snakeData)
}

/**
 * 更新客户
 */
export async function updateCustomer(id, data) {
  const snakeData = toSnakeCase(data)
  await enhancedApiClient.put(`/customers/${id}`, snakeData)
  return true
}

/**
 * 删除客户
 */
export async function deleteCustomer(id) {
  await enhancedApiClient.delete(`/customers/${id}`)
  return true
}
