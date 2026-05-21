// API 统一响应格式
export const ApiResponse = {
  code: 0,
  message: '',
  data: null,
  timestamp: 0
}

// 分页数据格式
export const PageResult = {
  list: [],
  total: 0,
  page: 1,
  pageSize: 10
}

// 分页请求参数
export const PageParams = {
  page: 1,
  pageSize: 10,
  keyword: ''
}

// 文件上传结果
export const FileUploadResult = {
  url: '',
  filename: '',
  size: 0
}
