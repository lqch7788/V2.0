/**
 * 供应商 API 服务
 * 对接后端 /api/suppliers
 */

import request from '../request';

/**
 * 供应商类型（前端camelCase格式）
 * @typedef {Object} Supplier
 * @property {string|number} id - ID
 * @property {string} code - 供应商编码
 * @property {string} name - 供应商名称
 * @property {string} supplierType - 供应商类型
 * @property {string} supplierAttribute - 供应商属性
 * @property {string} contact - 联系人
 * @property {string} mobilePhone - 手机
 * @property {string} workPhone - 工作电话
 * @property {string} fax - 传真
 * @property {string} address - 地址
 * @property {string} status - 状态（active/合作中, inactive/暂停）
 * @property {string} country - 国家
 * @property {string} province - 省份
 * @property {string} city - 城市
 * @property {string} bankName - 开户行
 * @property {string} bankCardNumber - 银行卡号
 * @property {string} organization - 所属组织
 * @property {string} createDate - 创建日期
 * @property {string} remarks - 备注
 */

/**
 * 后端API响应 → 前端camelCase映射
 * @param {Object} record - 后端返回的记录
 * @returns {Supplier}
 */
function fromBackendFields(record) {
  return {
    id: record.id,
    code: record.supplier_code || record.code || '',
    name: record.supplier_name || record.name || '',
    supplierType: record.supplier_type || '',
    supplierAttribute: record.supplier_attribute || '',
    contact: record.contact_person || record.contact || '',
    mobilePhone: record.mobile_phone || record.contact_phone || '',
    workPhone: record.work_phone || '',
    fax: record.fax || '',
    address: record.address || '',
    status: record.status === 'active' ? '合作中' : record.status === 'inactive' ? '暂停' : record.status || '',
    country: record.country || '',
    province: record.province || '',
    city: record.city || '',
    bankName: record.bank_name || '',
    bankCardNumber: record.bank_card_number || '',
    organization: record.organization || '',
    createDate: record.create_date || record.createDate || '',
    remarks: record.remarks || '',
  };
}

/**
 * 前端camelCase → 后端snake_case映射
 * @param {Supplier} item - 前端数据
 * @returns {Object}
 */
function toBackendFields(item) {
  return {
    supplier_code: item.code,
    supplier_name: item.name,
    contact_person: item.contact,
    mobile_phone: item.mobilePhone,
    work_phone: item.workPhone,
    fax: item.fax,
    address: item.address,
    supplier_type: item.supplierType,
    supplier_attribute: item.supplierAttribute,
    status: item.status === '合作中' ? 'active' : item.status === '暂停' ? 'inactive' : (item.status || 'active'),
    country: item.country,
    province: item.province,
    city: item.city,
    bank_name: item.bankName || '',
    bank_card_number: item.bankCardNumber || '',
    organization: item.organization,
    create_date: item.createDate,
    remarks: item.remarks,
  };
}

/**
 * 获取供应商列表
 * @param {Object} filters - 筛选条件
 * @param {string} filters.supplier_name - 供应商名称（模糊搜索）
 * @param {string} filters.status - 状态
 * @param {number} filters.page - 页码
 * @param {number} filters.limit - 每页数量
 * @returns {Promise<{data: Supplier[], meta: {total: number, page: number, limit: number}}>}
 */
export async function getSuppliers(filters = {}) {
  const params = new URLSearchParams();
  if (filters.supplier_name) params.append('supplier_name', filters.supplier_name);
  if (filters.name) params.append('supplier_name', filters.name);
  if (filters.status && filters.status !== '全部') {
    params.append('status', filters.status === '合作中' ? 'active' : filters.status === '暂停' ? 'inactive' : filters.status);
  }
  if (filters.page) params.append('page', String(filters.page));
  if (filters.limit) params.append('limit', String(filters.limit));

  const query = params.toString();
  const rawData = await request.get(`/suppliers${query ? `?${query}` : ''}`);
  // 将后端snake_case字段映射为前端camelCase格式
  const items = Array.isArray(rawData) ? rawData : []
  return items.map(fromBackendFields);
}

/**
 * 获取供应商详情
 * @param {string|number} id - 供应商ID
 * @returns {Promise<Supplier>}
 */
export async function getSupplierById(id) {
  const data = await request.get(`/suppliers/${id}`);
  return fromBackendFields(data);
}

/**
 * 创建供应商
 * @param {Supplier} data - 供应商数据
 * @returns {Promise<Object>}
 */
export async function createSupplier(data) {
  const backendData = toBackendFields(data);
  backendData.id = data.code || `SUP${Date.now()}`;
  return request.post('/suppliers', backendData);
}

/**
 * 更新供应商
 * @param {string|number} id - 供应商ID
 * @param {Partial<Supplier>} data - 更新数据
 * @returns {Promise<Object>}
 */
export async function updateSupplier(id, data) {
  const backendData = toBackendFields(data);
  return request.put(`/suppliers/${id}`, backendData);
}

/**
 * 删除供应商
 * @param {string|number} id - 供应商ID
 * @returns {Promise<boolean>}
 */
export async function deleteSupplier(id) {
  try {
    await request.delete(`/suppliers/${id}`);
    return true;
  } catch {
    return false;
  }
}

/**
 * 批量删除供应商
 * @param {Array<string|number>} ids - ID列表
 * @returns {Promise<boolean>}
 */
export async function deleteSuppliersBatch(ids) {
  try {
    await request.delete(`/suppliers/batch?ids=${ids.join(',')}`);
    return true;
  } catch {
    return false;
  }
}

/**
 * 导出数据转换函数（供外部使用）
 */
export { fromBackendFields, toBackendFields };
