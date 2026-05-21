import { ref, reactive } from 'vue'

export function useForm(options = {}) {
  const { initialValues, rules, validateOnRuleChange = true } = options

  const formRef = ref()
  const formData = reactive(initialValues || {})
  const loading = ref(false)
  const isDirty = ref(false)

  // 验证
  const validate = async () => {
    if (!formRef.value) return false
    try {
      await formRef.value.validate()
      return true
    } catch {
      return false
    }
  }

  const validateField = async (field) => {
    if (!formRef.value) return false
    try {
      await formRef.value.validateField(field)
      return true
    } catch {
      return false
    }
  }

  const clearValidate = (field) => {
    formRef.value?.clearValidate(field)
  }

  const resetFields = () => {
    formRef.value?.resetFields()
    Object.assign(formData, initialValues || {})
    isDirty.value = false
  }

  // 设置值
  const setFieldValue = (field, value) => {
    formData[field] = value
    isDirty.value = true
  }

  const setValues = (values) => {
    Object.assign(formData, values)
    isDirty.value = true
  }

  const getValues = () => {
    return { ...formData }
  }

  // 提交
  const submit = async (callback) => {
    const valid = await validate()
    if (!valid) return false

    loading.value = true
    try {
      if (callback) {
        await callback({ ...formData })
      }
      return true
    } finally {
      loading.value = false
    }
  }

  return {
    formRef,
    formData,
    loading,
    isDirty,
    validate,
    validateField,
    clearValidate,
    resetFields,
    setFieldValue,
    setValues,
    getValues,
    submit
  }
}
