<template>
  <!-- 公告模板编辑弹窗 -->
  <el-dialog
    :model-value="visible"
    :title="modalTitle"
    :close-on-click-modal="false"
    width="800px"
    class="template-edit-modal"
  >
    <el-form :model="formData" label-width="100px" class="space-y-4">
      <!-- 模板名称 -->
      <el-form-item label="模板名称" required>
        <el-input v-model="formData.name" placeholder="请输入模板名称" />
      </el-form-item>

      <!-- 公告分类 + 默认优先级 -->
      <div class="grid grid-cols-2 gap-4">
        <el-form-item label="公告分类" required>
          <el-select v-model="formData.category" placeholder="请选择分类" class="w-full">
            <el-option label="生产计划" value="生产计划" />
            <el-option label="技术标准" value="技术标准" />
            <el-option label="行政通知" value="行政通知" />
            <el-option label="安全规范" value="安全规范" />
          </el-select>
        </el-form-item>
        <el-form-item label="默认优先级">
          <el-select v-model="formData.priority" placeholder="请选择优先级" class="w-full">
            <el-option label="高" value="高" />
            <el-option label="中" value="中" />
            <el-option label="低" value="低" />
          </el-select>
        </el-form-item>
      </div>

      <!-- 标题模板 -->
      <el-form-item label="标题模板">
        <div class="w-full">
          <div class="flex items-center justify-between mb-1">
            <span class="text-sm text-gray-600">标题模板</span>
            <div class="flex items-center gap-1">
              <el-button
                v-for="v in variables"
                :key="v.key"
                size="small"
                @click="insertVariable(v.key, 'titleTemplate')"
              >
                {{ v.label }}
              </el-button>
            </div>
          </div>
          <el-input
            v-model="formData.titleTemplate"
            placeholder="支持变量占位符，如：关于{申请人}的{申请日期}工作计划"
          />
        </div>
      </el-form-item>

      <!-- 正文模板 -->
      <el-form-item label="正文模板">
        <div class="w-full">
          <div class="flex items-center justify-between mb-1">
            <span class="text-sm text-gray-600">正文模板</span>
            <div class="flex items-center gap-1">
              <el-button
                v-for="v in variables"
                :key="v.key"
                size="small"
                @click="insertVariable(v.key, 'content')"
              >
                {{ v.label }}
              </el-button>
            </div>
          </div>
          <el-input
            v-model="formData.content"
            type="textarea"
            :rows="6"
            placeholder="支持变量占位符，如：{申请人}提交了一份关于...的公告，申请日期为{申请日期}"
          />
        </div>
      </el-form-item>

      <!-- 预览面板 -->
      <div v-if="formData.titleTemplate || formData.content" class="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
        <div class="flex items-center gap-2 mb-3">
          <el-icon class="text-emerald-600"><Document /></el-icon>
          <span class="text-sm font-medium text-emerald-700">实时预览</span>
        </div>
        <div class="space-y-2">
          <div v-if="formData.titleTemplate">
            <p class="text-xs text-emerald-500 mb-1">标题预览：</p>
            <p class="text-sm text-gray-900 font-medium bg-white rounded-lg px-3 py-2 border border-emerald-100">
              {{ previewTitle }}
            </p>
          </div>
          <div v-if="formData.content">
            <p class="text-xs text-emerald-500 mb-1">正文预览：</p>
            <p class="text-sm text-gray-700 whitespace-pre-wrap bg-white rounded-lg px-3 py-2 border border-emerald-100">
              {{ previewContent }}
            </p>
          </div>
        </div>
      </div>
    </el-form>

    <template #footer>
      <div class="flex justify-end gap-2">
        <el-button size="small" @click="handleClose">取消</el-button>
        <el-button type="primary" size="small" @click="handleSave">
          {{ props.mode === 'add' ? '创建模板' : '保存修改' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Document } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// Props 定义
const props = defineProps({
  modelValue: Boolean,
  mode: String,
  template: Object
})

// Emits 定义
const emit = defineEmits(['update', 'update:modelValue', 'close', 'save'])

// 双向绑定
const visible = computed({
  get() {
    return props.modelValue
  },
  set: (val) => emit('update:modelValue', val)
})

// 弹窗标题
const modalTitle = computed(() => {
  return props.mode === 'add' ? '新增模板' : '编辑模板'
})

// 变量占位符定义
const variables = [
  { key: '{申请日期}', label: '申请日期' },
  { key: '{申请部门}', label: '申请部门' },
  { key: '{申请人}', label: '申请人' },
  { key: '{截止日期}', label: '截止日期' },
  { key: '{公告编号}', label: '公告编号' }
]

// 示例值
const sampleValues = {
  '{申请日期}': '2026-05-19',
  '{申请部门}': '生产部',
  '{申请人}': '陆启闯',
  '{截止日期}': '2026-05-26',
  '{公告编号}': 'GG20260519-001'
}

// 表单数据
const formData = ref({
  name: '',
  category: '',
  titleTemplate: '',
  content: '',
  priority: '中'
})

// 预览标题
const previewTitle = computed(() => {
  let preview = formData.value.titleTemplate
  Object.entries(sampleValues).forEach(([key, value]) => {
    preview = preview.split(key).join(value)
  })
  return preview
})

// 预览内容
const previewContent = computed(() => {
  let preview = formData.value.content
  Object.entries(sampleValues).forEach(([key, value]) => {
    preview = preview.split(key).join(value)
  })
  return preview
})

// 初始化表单数据
const initFormData = () => {
  if (props.mode === 'edit' && props.template) {
    formData.value = {
      name: props.template.name || '',
      category: props.template.category || props.template.type || '',
      titleTemplate: props.template.titleTemplate || '',
      content: props.template.contentTemplate || props.template.content || '',
      priority: props.template.priority || '中'
    }
  } else {
    formData.value = {
      name: '',
      category: '',
      titleTemplate: '',
      content: '',
      priority: '中'
    }
  }
}

// 监听打开和模式变化
watch(() => props.modelValue, (val) => {
  if (val) {
    initFormData()
  }
})

watch(() => [props.template, props.mode], () => {
  initFormData()
})

// 插入变量
const insertVariable = (variable, field) => {
  formData.value[field] += variable
}

// 关闭
const handleClose = () => {
  visible.value = false
  emit('close')
}

// 保存
const handleSave = () => {
  if (!formData.value.name.trim()) {
    ElMessage.warning('请输入模板名称')
    return
  }

  const id = props.mode === 'add' ? `TPL_${Date.now()}_${Math.random().toString(36).substring(2, 7)}` : props.template?.id

  const saveData = {
    id,
    code: props.mode === 'add' ? '' : (props.template?.code || ''),
    name: formData.value.name,
    category: formData.value.category,
    titleTemplate: formData.value.titleTemplate,
    contentTemplate: formData.value.content,
    priority: formData.value.priority,
    status: props.template?.status || '启用',
    usageCount: props.template?.usageCount || 0
  }

  emit('save', saveData)
  handleClose()
}
</script>

<style scoped>
.template-edit-modal :deep(.el-dialog__header) {
  padding: 16px 20px;
  margin-right: 0;
}
</style>
