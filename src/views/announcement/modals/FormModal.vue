<template>
  <!-- 公告表单弹窗（新增/编辑/发送） -->
  <el-dialog
    :model-value="visible"
    :title="modalTitle"
    :close-on-click-modal="false"
    width="640px"
    class="announcement-form-modal"
  >
    <el-form :model="formData" label-width="100px" class="space-y-4">
      <!-- 公告标题 -->
      <el-form-item label="公告标题" required>
        <el-input v-model="formData.title" placeholder="请输入公告标题" />
      </el-form-item>

      <!-- 公告分类 + 优先级 -->
      <div class="grid grid-cols-2 gap-4">
        <el-form-item label="公告分类" required>
          <el-select v-model="formData.category" placeholder="请选择分类" class="w-full">
            <el-option label="行政通知" value="行政通知" />
            <el-option label="培训通知" value="培训通知" />
            <el-option label="采购通知" value="采购通知" />
            <el-option label="活动通知" value="活动通知" />
            <el-option label="制度修订" value="制度修订" />
            <el-option label="生产公告" value="生产公告" />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级" required>
          <el-select v-model="formData.priority" placeholder="请选择优先级" class="w-full">
            <el-option label="高" value="高" />
            <el-option label="中" value="中" />
            <el-option label="低" value="低" />
          </el-select>
        </el-form-item>
      </div>

      <!-- 从模板选择（仅新增模式） -->
      <el-form-item v-if="props.mode === 'add'">
        <el-button class="w-full" @click="showTemplateSelect = true">
          <el-icon><Document /></el-icon>
          从模板选择
        </el-button>
      </el-form-item>

      <!-- 接收对象 + 截止日期 -->
      <div class="grid grid-cols-2 gap-4">
        <el-form-item label="接收对象">
          <el-input v-model="formData.recipients" placeholder="请输入接收对象" />
        </el-form-item>
        <el-form-item label="截止日期">
          <el-date-picker
            v-model="formData.deadline"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
            class="w-full"
          />
        </el-form-item>
      </div>

      <!-- 公告内容 -->
      <el-form-item label="公告内容" required>
        <el-input
          v-model="formData.content"
          type="textarea"
          :rows="6"
          placeholder="请输入公告内容"
        />
      </el-form-item>

      <!-- 发布警告 -->
      <el-alert
        v-if="showWarning"
        title="发布公告后将立即推送给所有接收对象，请确认内容无误"
        type="warning"
        :closable="false"
        show-icon
      />
    </el-form>

    <!-- 底部按钮 -->
    <template #footer>
      <div class="flex justify-end gap-2">
        <el-button size="small" @click="handleClose">取消</el-button>
        <el-button type="primary" size="small" @click="handleSubmit">
          {{ props.mode === 'send' ? '确认发布' : '保存' }}
        </el-button>
      </div>
    </template>
  </el-dialog>

  <!-- 模板选择弹窗 -->
  <TemplateSelectModal
    v-model="showTemplateSelect"
    @select="handleTemplateSelect"
  />
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { Document } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import TemplateSelectModal from './TemplateSelectModal.vue'

// Props 定义
const props = defineProps({
  modelValue: Boolean,
  mode: String,
  notice: Object
})

// Emits 定义
const emit = defineEmits(['update', 'update:modelValue', 'close', 'save'])

// 模板选择弹窗
const showTemplateSelect = ref(false)

// 表单数据
const formData = ref({
  title: '',
  category: '',
  priority: '中',
  recipients: '',
  deadline: '',
  content: ''
})

// 弹窗标题
const modalTitle = computed(() => {
  switch (props.mode) {
    case 'add': return '发布公告'
    case 'edit': return '编辑公告'
    case 'send': return '发布公告'
    default: return '发布公告'
  }
})

// 是否显示警告
const showWarning = computed(() => props.mode === 'add' || props.mode === 'send')

// 双向绑定
const visible = computed({
  get() {
    return props.modelValue
  },
  set: (val) => emit('update:modelValue', val)
})

// 初始化表单数据
const initFormData = () => {
  if (props.notice) {
    formData.value = {
      title: props.notice.title || '',
      category: props.notice.category || props.notice.type || '',
      priority: props.notice.priority || '中',
      recipients: props.notice.recipients || '',
      deadline: props.notice.deadline || '',
      content: props.notice.content || ''
    }
  } else {
    formData.value = {
      title: '',
      category: '',
      priority: '中',
      recipients: '',
      deadline: '',
      content: ''
    }
  }
}

// 监听打开和数据变化
watch(() => props.modelValue, (val) => {
  if (val) {
    initFormData()
  }
})

watch(() => props.notice, () => {
  initFormData()
})

// 关闭
const handleClose = () => {
  visible.value = false
  emit('close')
}

// 提交
const handleSubmit = () => {
  if (!formData.value.title.trim()) {
    ElMessage.warning('请输入公告标题')
    return
  }

  const today = new Date().toISOString().slice(0, 10)
  const sender = localStorage.getItem('username') || '陆启闯'

  const saveData = {
    id: props.mode === 'add' ? `ANN_${Date.now()}` : props.notice?.id,
    ...formData.value,
    sender,
    date: props.notice?.date || today,
    status: props.notice?.status || '草稿',
    readCount: props.notice?.readCount || 0
  }

  emit('save', saveData)
  handleClose()
}

// 模板选择回调
const handleTemplateSelect = (template) => {
  formData.value = {
    ...formData.value,
    title: template.titleTemplate || template.title || template.name || formData.value.title,
    category: template.category || formData.value.category,
    priority: (template.priority) || formData.value.priority,
    content: template.contentTemplate || template.content || formData.value.content
  }
  showTemplateSelect.value = false
}
</script>

<style scoped>
.announcement-form-modal :deep(.el-dialog__header) {
  padding: 16px 20px;
  margin-right: 0;
}
</style>
