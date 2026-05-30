<template>
  <!-- 公告表单弹窗组件（新增/编辑/发送）- V1.1样式（纯div自定义弹窗） -->
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm" @click="handleClose">
      <div
        id="announcement-form-dialog"
        class="bg-white rounded-lg w-full max-w-2xl shadow-2xl"
        :style="{ minWidth: '40rem', maxHeight: '80vh' }"
        @click.stop
      >
        <!-- 头部 — 绿色渐变，可拖动 -->
        <div
          class="px-6 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white flex items-center justify-between cursor-move"
          style="background: linear-gradient(to right, #10b981, #059669);"
          @mousedown="handleDragStart"
        >
          <h3 class="font-semibold flex items-center gap-2 select-none" style="color: white;">
            <el-icon class="text-xl" style="color: white;">
              <component :is="modalIcon" />
            </el-icon>
            <span style="color: white;">{{ modalTitle }}</span>
          </h3>
          <el-button link class="hover:bg-white/10" style="color: rgba(255,255,255,0.8);" @click="handleClose">&times;</el-button>
        </div>

        <!-- 表单内容 -->
        <div class="p-6 overflow-y-auto" style="max-height: calc(80vh - 140px);">
          <div class="space-y-4">
            <!-- 公告标题 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">公告标题 <span class="text-red-500">*</span></label>
              <el-input v-model="formData.title" placeholder="请输入公告标题" />
            </div>

            <!-- 公告分类 + 优先级 -->
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
                <label class="block text-sm font-medium text-gray-700 mb-1">优先级 <span class="text-red-500">*</span></label>
                <el-select v-model="formData.priority" placeholder="请选择优先级" class="w-full">
                  <el-option label="高" value="高" />
                  <el-option label="中" value="中" />
                  <el-option label="低" value="低" />
                </el-select>
              </div>
            </div>

            <!-- 从模板选择（仅新增模式） -->
            <div v-if="props.mode === 'add'">
              <el-button class="w-full" @click="showTemplateSelect = true">
                <el-icon><Document /></el-icon>
                从模板选择
              </el-button>
            </div>

            <!-- 接收对象 + 截止日期 -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">接收对象</label>
                <el-input v-model="formData.recipients" placeholder="请输入接收对象" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">截止日期</label>
                <el-date-picker
                  v-model="formData.deadline"
                  type="date"
                  placeholder="选择日期"
                  value-format="YYYY-MM-DD"
                  class="w-full"
                />
              </div>
            </div>

            <!-- 公告内容 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">公告内容 <span class="text-red-500">*</span></label>
              <el-input
                v-model="formData.content"
                type="textarea"
                :rows="6"
                placeholder="请输入公告内容"
              />
            </div>

            <!-- 发布警告 -->
            <div v-if="showWarning" class="bg-amber-50 rounded-lg p-3 border border-amber-200">
              <div class="flex items-center gap-2">
                <el-icon class="text-amber-600"><Warning /></el-icon>
                <p class="text-sm text-amber-700">发布公告后将立即推送给所有接收对象，请确认内容无误</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部按钮 -->
        <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
          <el-button size="small" @click="handleClose">取消</el-button>
          <el-button type="primary" size="small" @click="handleSubmit">
            {{ props.mode === 'send' ? '确认发布' : '保存' }}
          </el-button>
        </div>
      </div>
    </div>

    <!-- 模板选择弹窗 -->
    <TemplateSelectModal
      :is-open="showTemplateSelect"
      @close="showTemplateSelect = false"
      @select="handleTemplateSelect"
    />
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { Plus, Edit, Promotion, Document, Warning } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import TemplateSelectModal from './TemplateSelectModal.vue'
import { useDictionaryStore, getDictItems } from '@/stores/modules/dictionary'

const props = defineProps({
  isOpen: Boolean,
  notice: Object,
  mode: {
    type: String,
    default: 'add' // 'add' | 'edit' | 'send'
  }
})

const emit = defineEmits(['close', 'save'])

// 字典Store
const dictionaryStore = useDictionaryStore()

// 模板选择弹窗
const showTemplateSelect = ref(false)

// 拖动状态
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0, left: 0, top: 0 })

// 表单数据
const formData = ref({
  title: '',
  category: '',
  priority: '中',
  recipients: '',
  deadline: '',
  content: ''
})

// 公告分类选项（动态从字典获取，与V1.1完全一致）
const categoryOptions = ref([])

// 弹窗标题和图标
const modalTitle = computed(() => {
  switch (props.mode) {
    case 'add': return '发布公告'
    case 'edit': return '编辑公告'
    case 'send': return '发布公告'
    default: return '发布公告'
  }
})

const modalIcon = computed(() => {
  switch (props.mode) {
    case 'add': return Plus
    case 'edit': return Edit
    case 'send': return Promotion
    default: return Plus
  }
})

// 是否显示警告
const showWarning = computed(() => props.mode === 'add' || props.mode === 'send')

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
      { label: '行政通知', value: '行政通知' },
      { label: '培训通知', value: '培训通知' },
      { label: '采购通知', value: '采购通知' },
      { label: '活动通知', value: '活动通知' },
      { label: '制度修订', value: '制度修订' },
      { label: '生产公告', value: '生产公告' }
    ]
  }
}

onMounted(() => {
  loadCategoryOptions()
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
watch(() => props.isOpen, (val) => {
  if (val) {
    initFormData()
  }
})

// 拖动开始
const handleDragStart = (e) => {
  if (e.target.closest('button')) return
  e.preventDefault()
  isDragging.value = true
  const dialog = document.getElementById('announcement-form-dialog')
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
    const dialog = document.getElementById('announcement-form-dialog')
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

// 关闭
const handleClose = () => {
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
    readCount: props.notice?.readCount || 0,
    type: formData.value.category || '生产公告'
  }

  emit('save', saveData)
}

// 模板选择回调
const handleTemplateSelect = (template) => {
  formData.value = {
    ...formData.value,
    title: template.titleTemplate || template.title || template.name || formData.value.title,
    category: template.category || formData.value.category,
    priority: template.priority || formData.value.priority,
    content: template.contentTemplate || template.content || formData.value.content
  }
  showTemplateSelect.value = false
}
</script>

<style scoped>
/* V1.1样式保持 */
</style>
