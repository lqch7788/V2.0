<!--
  快速新增病虫害字典弹窗（对齐 V1.1 QuickAddPestDiseaseModal.tsx L1-159）
  字段：dictName / dictType / targetCrops / description
-->
<template>
  <el-dialog :model-value="visible" title="快速新增病虫害" width="500px" :close-on-click-modal="false" @update:model-value="(v) => v ? null : emit('close')" @close="emit('close')">
    <div class="space-y-3">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">病虫害名称 <span class="text-red-500">*</span></label>
        <el-input v-model="formData.dictName" placeholder="如：蚜虫、白粉病" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">类型</label>
        <el-select v-model="formData.dictType" class="w-full">
          <el-option label="虫害" value="pest" />
          <el-option label="病害" value="disease" />
        </el-select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">适用作物</label>
        <el-input v-model="formData.targetCrops" placeholder="多个作物，逗号分隔" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">描述</label>
        <el-input v-model="formData.description" type="textarea" :rows="2" />
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
import { usePestDiseaseDictStore } from '@/stores/modules/pestDiseaseDict'

const props = defineProps({ visible: Boolean })
const emit = defineEmits(['close', 'saved'])

const diseaseStore = usePestDiseaseDictStore()
const submitting = ref(false)

const INITIAL_FORM = () => ({ dictName: '', dictType: 'pest', targetCrops: '', description: '' })
const formData = ref(INITIAL_FORM())

watch(() => props.visible, (val) => {
  if (val) formData.value = INITIAL_FORM()
})

const handleSubmit = async () => {
  if (!formData.value.dictName) { ElMessage.warning('请填写病虫害名称'); return }
  submitting.value = true
  try {
    const created = await diseaseStore.createItem({
      ...formData.value,
      status: 'active'
    })
    ElMessage.success('新增成功')
    emit('saved', created.id, created.dictName)
    emit('close')
  } catch (err) {
    ElMessage.error('保存失败：' + (err.message || '未知错误'))
  } finally {
    submitting.value = false
  }
}
</script>