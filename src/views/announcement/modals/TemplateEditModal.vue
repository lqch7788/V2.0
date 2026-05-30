<template>
  <!-- 公告模板编辑弹窗 - V1.1样式（纯div自定义弹窗） -->
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm" @click="handleClose">
      <div
        id="template-edit-dialog"
        class="bg-white rounded-xl w-full max-w-3xl shadow-2xl flex flex-col"
        style="min-width: 700px; max-height: 90vh;"
        @click.stop
      >
        <!-- 头部 — 绿色渐变 -->
        <div
          class="px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-between cursor-move flex-shrink-0"
          style="background: linear-gradient(to right, #10b981, #059669);"
          @mousedown="handleDragStart"
        >
          <h3 class="font-semibold flex items-center gap-2 select-none" style="color: white;">
            <el-icon style="color: white;">
              <component :is="modalIcon" />
            </el-icon>
            <span style="color: white;">{{ modalTitle }}</span>
          </h3>
          <el-button link class="hover:bg-white/10" style="color: rgba(255,255,255,0.8);" @click="handleClose">&times;</el-button>
        </div>

        <!-- 表单内容 -->
        <div class="flex-1 overflow-y-auto p-6">
          <div class="space-y-4">
            <!-- 模板名称 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">模板名称 <span class="text-red-500">*</span></label>
              <el-input v-model="formData.name" placeholder="请输入模板名称" />
            </div>

            <!-- 公告分类 + 默认优先级 -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">公告分类 <span class="text-red-500">*</span></label>
                <el-select v-model="formData.category" placeholder="请选择分类" class="w-full">
                  <el-option
                    v-for="opt in categoryOptions"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value"
                  />
                </el-select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">默认优先级</label>
                <el-select v-model="formData.priority" placeholder="请选择优先级" class="w-full">
                  <el-option label="高" value="高" />
                  <el-option label="中" value="中" />
                  <el-option label="低" value="低" />
                </el-select>
              </div>
            </div>

            <!-- 标题模板 -->
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="text-sm font-medium text-gray-700">标题模板</label>
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

            <!-- 正文模板 -->
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="text-sm font-medium text-gray-700">正文模板</label>
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
          </div>
        </div>

        <!-- 底部按钮 -->
        <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3 flex-shrink-0">
          <el-button size="small" @click="handleClose">取消</el-button>
          <el-button type="primary" size="small" @click="handleSave">
            {{ props.mode === 'add' ? '创建模板' : '保存修改' }}
          </el-button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { Plus, Edit, Document } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useDictionaryStore, getDictItems } from '@/stores/modules/dictionary'

const props = defineProps({
  isOpen: Boolean,
  template: Object,
  mode: {
    type: String,
    default: 'add' // 'add' | 'edit'
  }
})

const emit = defineEmits(['close', 'save'])

// 字典Store
const dictionaryStore = useDictionaryStore()

// 拖动状态
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0, left: 0, top: 0 })

// 公告分类选项（动态从字典获取，与V1.1完全一致）
const categoryOptions = ref([])

// 加载字典数据（与V1.1完全一致）
const loadCategoryOptions = async () => {
  // 确保字典已加载
  await dictionaryStore.loadDictionaries()
  // 从字典获取公告分类选项
  const dictItems = await getDictItems('announcement_category')
  if (dictItems && dictItems.length > 0) {
    categoryOptions.value = dictItems.map(d => ({
      label: d.dictLabel || d.label || d.name,
      value: d.dictCode || d.code || d.label || d.name
    }))
  } else {
    // 字典为空时使用硬编码选项（与V1.1 fallback逻辑一致）
    categoryOptions.value = [
      { label: '生产计划', value: '生产计划' },
      { label: '技术标准', value: '技术标准' },
      { label: '行政通知', value: '行政通知' },
      { label: '安全规范', value: '安全规范' }
    ]
  }
}

onMounted(() => {
  loadCategoryOptions()
})

// 弹窗标题和图标
const modalTitle = computed(() => {
  return props.mode === 'add' ? '新增模板' : '编辑模板'
})

const modalIcon = computed(() => {
  return props.mode === 'add' ? Plus : Edit
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
watch(() => props.isOpen, (val) => {
  if (val) {
    initFormData()
  }
})

watch(() => [props.template, props.mode], () => {
  initFormData()
})

// 拖动开始
const handleDragStart = (e) => {
  if (e.target.closest('button')) return
  e.preventDefault()
  isDragging.value = true
  const dialog = document.getElementById('template-edit-dialog')
  if (dialog) {
    const rect = dialog.getBoundingClientRect()
    dragStart.value = { x: e.clientX, y: e.clientY, left: rect.left, top: rect.top }
  }
}

// 拖动中
watch(isDragging, (val) => {
  if (!val) return
  const handleMouseMove = (e) => {
    if (!isDragging.value) return
    const dialog = document.getElementById('template-edit-dialog')
    if (dialog) {
      dialog.style.position = 'fixed'
      dialog.style.left = `${dragStart.value.left + e.clientX - dragStart.value.x}px`
      dialog.style.top = `${dragStart.value.top + e.clientY - dragStart.value.y}px`
      dialog.style.margin = '0'
    }
  }
  const handleMouseUp = () => {
    isDragging.value = false
  }
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
})

// 插入变量
const insertVariable = (variable, field) => {
  formData.value[field] += variable
}

// 关闭
const handleClose = () => {
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
    type: formData.value.category,
    titleTemplate: formData.value.titleTemplate,
    contentTemplate: formData.value.content,
    priority: formData.value.priority,
    status: props.template?.status || '启用',
    usageCount: props.template?.usageCount || 0
  }

  emit('save', saveData)
}
</script>

<style scoped>
/* V1.1样式保持 */
</style>
