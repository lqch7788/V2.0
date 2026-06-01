<template>
  <!-- 客户档案新增/编辑弹窗 -->
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm" @click="handleClose">
      <div
        class="bg-white rounded-xl w-full shadow-xl flex flex-col relative"
        :style="{ maxWidth: '48rem', maxHeight: '85vh', minWidth: '40rem' }"
        @click.stop
      >
        <!-- 头部 -->
        <div
          class="px-6 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 flex items-center justify-between rounded-t-xl cursor-move flex-shrink-0"
          style="background: linear-gradient(to right, #10b981, #059669);"
        >
          <h3 class="font-semibold flex items-center gap-2 select-none" style="color: white;">
            <el-icon style="color: white;"><User /></el-icon>
            <span style="color: white;">{{ isEdit ? '编辑客户' : '新增客户' }}</span>
          </h3>
          <el-button link @click="handleClose" style="color: rgba(255,255,255,0.8);">
            <el-icon style="color: white;"><Close /></el-icon>
          </el-button>
        </div>

        <!-- 表单内容 -->
        <div class="p-6 overflow-y-auto flex-1" style="max-height: calc(85vh - 140px);">
          <div class="space-y-4">
            <!-- 第一行：客户编码、客户名称 -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">客户编码</label>
                <div class="flex gap-2">
                  <el-input v-model="form.customerCode" placeholder="请输入或点击生成" />
                  <el-button size="small" @click="handleGenerateCode">生成</el-button>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  客户名称 <span class="text-red-500">*</span>
                </label>
                <el-input v-model="form.customerName" placeholder="请输入客户名称" />
              </div>
            </div>

            <!-- 第二行：联系人、联系电话 -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">联系人</label>
                <el-input v-model="form.contactPerson" placeholder="请输入联系人姓名" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">联系电话</label>
                <el-input v-model="form.contactPhone" placeholder="请输入联系电话" />
              </div>
            </div>

            <!-- 第三行：收货地址 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">收货地址</label>
              <el-input v-model="form.deliveryAddress" type="textarea" :rows="2" placeholder="请输入收货地址" />
            </div>

            <!-- 第四行：备注 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">备注</label>
              <el-input v-model="form.remarks" type="textarea" :rows="3" placeholder="请输入备注信息" />
            </div>
          </div>
        </div>

        <!-- 底部按钮 -->
        <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3 flex-shrink-0 rounded-b-xl">
          <el-button size="small" @click="handleClose" :disabled="loading">取消</el-button>
          <el-button type="primary" size="small" @click="handleSubmit" :disabled="loading">
            {{ loading ? '保存中...' : '保存' }}
          </el-button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { User, Close } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useCustomerStore } from '@/stores/modules/customer'

const props = defineProps({
  isOpen: Boolean,
  customer: Object
})

const emit = defineEmits(['close', 'success'])

const customerStore = useCustomerStore()
const loading = ref(false)

const isEdit = computed(() => !!props.customer)

// 生成客户编码
const generateCustomerCode = (existingCodes = []) => {
  const now = new Date()
  const year = now.getFullYear()
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const day = now.getDate().toString().padStart(2, '0')
  const dateStr = `${year}${month}${day}`

  let maxSeq = 0
  const prefix = `KH${dateStr}`
  existingCodes.forEach(code => {
    if (code.startsWith(prefix)) {
      const seqStr = code.slice(-4)
      const seq = parseInt(seqStr, 10)
      if (!isNaN(seq) && seq > maxSeq) {
        maxSeq = seq
      }
    }
  })

  const nextSeq = (maxSeq + 1).toString().padStart(4, '0')
  return `KH${dateStr}${nextSeq}`
}

const form = ref({
  customerCode: '',
  customerName: '',
  contactPerson: '',
  contactPhone: '',
  deliveryAddress: '',
  remarks: ''
})

// 监听打开
watch(() => props.isOpen, (val) => {
  if (val) {
    if (props.customer) {
      form.value = {
        customerCode: props.customer.customerCode || '',
        customerName: props.customer.customerName || '',
        contactPerson: props.customer.contactPerson || '',
        contactPhone: props.customer.contactPhone || '',
        deliveryAddress: props.customer.deliveryAddress || '',
        remarks: props.customer.remarks || ''
      }
    } else {
      const existingCodes = customerStore.customers.map(c => c.customerCode).filter(Boolean)
      form.value = {
        customerCode: generateCustomerCode(existingCodes),
        customerName: '',
        contactPerson: '',
        contactPhone: '',
        deliveryAddress: '',
        remarks: ''
      }
    }
    customerStore.fetchCustomers()
  }
})

const handleGenerateCode = () => {
  const existingCodes = customerStore.customers.map(c => c.customerCode).filter(Boolean)
  form.value.customerCode = generateCustomerCode(existingCodes)
}

const handleClose = () => {
  emit('close')
}

const handleSubmit = async () => {
  if (!form.value.customerName.trim()) {
    ElMessage.warning('请输入客户名称')
    return
  }

  loading.value = true
  try {
    if (isEdit.value && props.customer) {
      await customerStore.updateCustomer(props.customer.id, form.value)
      ElMessage.success('客户已更新')
    } else {
      await customerStore.addCustomer(form.value)
      ElMessage.success('客户已添加')
    }
    emit('success')
    handleClose()
  } catch (error) {
    ElMessage.error(`操作失败: ${error.message}`)
  } finally {
    loading.value = false
  }
}
</script>
