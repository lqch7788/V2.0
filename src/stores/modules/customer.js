/**
 * 客户档案 Store
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as customerService from '@/services/customerService'

export const useCustomerStore = defineStore('customer', () => {
  const customers = ref([])
  const isLoading = ref(false)

  async function fetchCustomers(params) {
    isLoading.value = true
    try {
      const data = await customerService.getCustomers(params)
      customers.value = data || []
    } finally {
      isLoading.value = false
    }
  }

  async function addCustomer(data) {
    const newCustomer = await customerService.createCustomer(data)
    customers.value.unshift(newCustomer)
    return newCustomer
  }

  async function updateCustomer(id, data) {
    const success = await customerService.updateCustomer(id, data)
    if (success) {
      const index = customers.value.findIndex(c => c.id === id)
      if (index !== -1) {
        customers.value[index] = { ...customers.value[index], ...data }
      }
    }
    return success
  }

  async function deleteCustomer(id) {
    const success = await customerService.deleteCustomer(id)
    if (success) {
      customers.value = customers.value.filter(c => c.id !== id)
    }
    return success
  }

  return {
    customers,
    isLoading,
    fetchCustomers,
    addCustomer,
    updateCustomer,
    deleteCustomer
  }
})
