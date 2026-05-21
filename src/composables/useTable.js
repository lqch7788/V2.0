import { ref, computed, watch } from 'vue'

export function useTable(options) {
  const { api, immediate = true, defaultParams = {} } = options

  // 状态
  const data = ref([])
  const total = ref(0)
  const loading = ref(false)
  const params = ref({
    page: 1,
    pageSize: 10,
    ...defaultParams
  })

  // 计算属性
  const pagination = computed(() => ({
    current: params.value.page,
    pageSize: params.value.pageSize,
    total: total.value
  }))

  // 方法
  const fetchData = async (queryParams) => {
    if (queryParams) {
      params.value = { ...params.value, ...queryParams }
    }

    loading.value = true
    try {
      const result = await api(params.value)
      data.value = result.list
      total.value = result.total
    } finally {
      loading.value = false
    }
  }

  const reload = () => {
    params.value.page = 1
    return fetchData()
  }

  const reset = () => {
    params.value = {
      page: 1,
      pageSize: 10,
      ...defaultParams
    }
    return fetchData()
  }

  const setPage = (page) => {
    params.value.page = page
    return fetchData()
  }

  const setPageSize = (pageSize) => {
    params.value.pageSize = pageSize
    params.value.page = 1
    return fetchData()
  }

  const search = (queryParams) => {
    params.value = { ...params.value, ...queryParams, page: 1 }
    return fetchData()
  }

  // 监听器
  watch(
    () => params.value,
    () => {
      if (immediate) {
        fetchData()
      }
    },
    { deep: true }
  )

  return {
    data,
    total,
    loading,
    params,
    pagination,
    fetchData,
    reload,
    reset,
    setPage,
    setPageSize,
    search
  }
}
