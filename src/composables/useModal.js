import { ref, reactive } from 'vue'

export function useModal(options = {}) {
  const { defaultVisible = false, onOpen, onClose } = options

  const visible = ref(defaultVisible)

  const open = () => {
    visible.value = true
    onOpen?.()
  }

  const close = () => {
    visible.value = false
    onClose?.()
  }

  const toggle = () => {
    if (visible.value) {
      close()
    } else {
      open()
    }
  }

  return {
    visible,
    open,
    close,
    toggle
  }
}

// 带数据加载的 Modal
export function useModalWithData(options = {}) {
  const { loadData, onOpen, onClose } = options

  const visible = ref(false)
  const loading = ref(false)
  const data = ref(null)
  const isEdit = ref(false)
  const editId = ref(null)

  const open = async (id) => {
    visible.value = true
    isEdit.value = !!id
    editId.value = id

    if (id && loadData) {
      loading.value = true
      try {
        data.value = await loadData(id)
      } finally {
        loading.value = false
      }
    } else {
      data.value = null
    }

    onOpen?.()
  }

  const close = () => {
    visible.value = false
    data.value = null
    isEdit.value = false
    editId.value = null
    onClose?.()
  }

  const confirm = async (callback) => {
    if (callback && data.value) {
      await callback(data.value)
    }
    close()
  }

  return {
    visible,
    loading,
    data,
    isEdit,
    editId,
    open,
    close,
    confirm
  }
}
