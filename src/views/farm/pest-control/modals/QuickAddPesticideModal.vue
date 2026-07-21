<!--
  快速新增药剂弹窗（对齐 V1.1 QuickAddPesticideModal.tsx L1-142）
  字段：pesticideName / pesticideCode / controlType / functionDesc
-->
<template>
  <el-dialog :model-value="visible" title="快速新增药剂" width="500px" :close-on-click-modal="false" @update:model-value="(v) => v ? null : emit('close')" @close="emit('close')">
    <div class="space-y-3">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">药剂名称 <span class="text-red-500">*</span></label>
        <el-input v-model="formData.pesticideName" placeholder="如：吡虫啉、阿维菌素" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">药剂编码</label>
        <el-input v-model="formData.pesticideCode" placeholder="留空自动生成" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">防治类型</label>
        <el-select v-model="formData.controlType" class="w-full">
          <el-option label="化学防治" value="chemical" />
          <el-option label="生物防治" value="bio" />
          <el-option label="物理防治" value="physical" />
        </el-select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">功能描述</label>
        <el-input v-model="formData.functionDesc" type="textarea" :rows="2" />
      </div>
    </div>
    <template #footer>
      <el-button @click="emit('close')">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { usePesticideLibraryStore } from '@/stores/modules/pesticideLibrary'

const props = defineProps({ visible: Boolean })
const emit = defineEmits(['close', 'saved'])

const pesticideStore = usePesticideLibraryStore()
const submitting = ref(false)

const INITIAL_FORM = () => ({ pesticideName: '', pesticideCode: '', controlType: 'chemical', functionDesc: '' })
const formData = ref(INITIAL_FORM())

watch(() => props.visible, (val) => {
  if (val) formData.value = INITIAL_FORM()
})

const handleSubmit = async () => {
  if (!formData.value.pesticideName) { ElMessage.warning('请填写药剂名称'); return }
  submitting.value = true
  try {
    const created = await pesticideStore.createItem({
      ...formData.value,
      status: 'active'
    })
    ElMessage.success('新增成功')
    emit('saved', created.id, created.pesticideName)
    emit('close')
  } catch (err) {
    ElMessage.error('保存失败：' + (err.message || '未知错误'))
  } finally {
    submitting.value = false
  }
}
</script>