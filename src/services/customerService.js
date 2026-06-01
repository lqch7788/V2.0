/**
 * 客户档案 API 服务
 */
import { enhancedApiClient } from '../lib/apiClient'
import { storageGetJSON, storageSetJSON } from '../utils/storage'

const STORAGE_KEY = 'customers_local'

function getLocalCustomers() {
  try {
    return storageGetJSON(STORAGE_KEY, [])
  } catch {
    return []
  }
}

function saveLocalCustomers(customers) {
  try {
    storageSetJSON(STORAGE_KEY, customers)
  } catch (error) {
    console.error('[customerService] 保存到localStorage失败:', error)
  }
}

// 字段映射
const FIELD_MAP = {
  customerCode: 'customer_code',
  customerName: 'customer_name',
  contactPerson: 'contact_person',
  contactPhone: 'contact_phone',
  deliveryAddress: 'delivery_address',
  remarks: 'remarks',
  createBy: 'create_by',
}

const REVERSE_FIELD_MAP = Object.fromEntries(
  Object.entries(FIELD_MAP).map(([camel, snake]) => [snake, camel])
)

function toSnakeCase(data) {
  const result = {}
  for (const [key, value] of Object.entries(data)) {
    const snakeKey = FIELD_MAP[key] || key
    result[snakeKey] = value
  }
  return result
}

function normalizeCustomer(customer) {
  const result = {}
  for (const [key, value] of Object.entries(customer)) {
    const camelKey = REVERSE_FIELD_MAP[key] || key
    result[camelKey] = value
  }
  return result
}

function normalizeCustomers(customers) {
  return customers.map(normalizeCustomer)
}

export async function getCustomers(params) {
  try {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set('search', params.search)
    const query = searchParams.toString()
    const data = await enhancedApiClient.get(`/customers${query ? `?${query}` : ''}`)
    if (data && Array.isArray(data)) {
      const normalized = normalizeCustomers(data)
      saveLocalCustomers(normalized)
      return normalized
    }
  } catch (error) {
    console.warn('[customerService] API获取失败，降级到本地存储:', error)
  }
  return getLocalCustomers()
}

export async function getCustomerById(id) {
  try {
    const data = await enhancedApiClient.get(`/customers/${id}`)
    return normalizeCustomer(data)
  } catch (error) {
    console.warn('[customerService] 获取客户详情失败:', error)
    const local = getLocalCustomers()
    return local.find(c => c.id === id)
  }
}

export async function createCustomer(data) {
  const tempId = `CUST${Date.now()}`
  const now = new Date().toISOString()
  const localCustomer = { ...data, id: tempId, createTime: now }
  try {
    const snakeData = toSnakeCase(data)
    const result = await enhancedApiClient.post('/customers', snakeData)
    return normalizeCustomer(result)
  } catch (error) {
    console.warn('[customerService] API创建失败，降级到localStorage:', error)
    const local = getLocalCustomers()
    local.unshift(localCustomer)
    saveLocalCustomers(local)
    return localCustomer
  }
}

export async function updateCustomer(id, data) {
  try {
    const snakeData = toSnakeCase(data)
    await enhancedApiClient.put(`/customers/${id}`, snakeData)
    return true
  } catch (error) {
    console.warn('[customerService] API更新失败，降级到localStorage:', error)
    const local = getLocalCustomers()
    const index = local.findIndex(c => c.id === id)
    if (index !== -1) {
      local[index] = { ...local[index], ...data, updateTime: new Date().toISOString() }
      saveLocalCustomers(local)
    }
    return true
  }
}

export async function deleteCustomer(id) {
  try {
    await enhancedApiClient.delete(`/customers/${id}`)
    return true
  } catch (error) {
    console.warn('[customerService] API删除失败，标记本地删除:', error)
    const local = getLocalCustomers()
    const filtered = local.filter(c => c.id !== id)
    saveLocalCustomers(filtered)
    return true
  }
}
