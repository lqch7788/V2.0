<template>
  <!-- 公告模板选择弹窗 -->
  <el-dialog
    :model-value="visible"
    title=""
    :close-on-click-modal="false"
    width="800px"
    class="template-select-modal"
  >
    <!-- 头部 -->
    <template #header>
      <div class="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-t-lg -mx-6 -mt-4 mb-0 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <el-icon class="text-xl"><Document /></el-icon>
          <span class="text-lg font-semibold">从模板选择</span>
        </div>
        <el-button link class="text-white/80 hover:text-white" @click="handleClose">
          <el-icon><Close /></el-icon>
        </el-button>
      </div>
    </template>

    <!-- 筛选栏 -->
    <div class="p-4 border-b border-gray-200 flex items-center gap-3">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索模板名称..."
        clearable
        class="flex-1"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-select v-model="typeFilter" placeholder="类型筛选" class="w-40">
        <el-option label="全部" value="全部" />
        <el-option v-for="t in allTypes" :key="t" :label="t" :value="t" />
      </el-select>
    </div>

    <!-- 模板卡片列表 -->
    <div class="flex-1 overflow-y-auto p-4 max-h-[60vh]">
      <!-- 加载状态 -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <el-icon class="is-loading text-3xl text-blue-500"><Loading /></el-icon>
      </div>

      <!-- 空状态 -->
      <div v-else-if="filteredTemplates.length === 0" class="flex flex-col items-center justify-center py-12 text-gray-400">
        <el-icon class="text-5xl mb-4"><Document /></el-icon>
        <p class="text-sm">暂无可用模板</p>
      </div>

      <!-- 模板网格 -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="template in filteredTemplates"
          :key="template.id"
          class="text-left bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer"
          @click="handleSelect(template)"
        >
          <div class="flex items-start justify-between mb-2">
            <h4 class="font-semibold text-gray-900 text-sm">{{ template.name }}</h4>
            <span
              :class="['px-2 py-0.5 text-xs rounded-full', template.status === '启用' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-50 text-gray-500']"
            >
              {{ template.status === '启用' ? '启用' : '停用' }}
            </span>
          </div>
          <div class="flex items-center gap-2 mb-2">
            <span class="px-2 py-0.5 text-xs rounded-full bg-blue-50 text-blue-600 border border-blue-100">
              {{ template.type }}
            </span>
            <span v-if="template.category" class="px-2 py-0.5 text-xs rounded-full bg-purple-50 text-purple-600 border border-purple-100">
              {{ template.category }}
            </span>
          </div>
          <p class="text-xs text-gray-500">
            使用次数：{{ template.usageCount || 0 }}
          </p>
        </div>
      </div>
    </div>

    <!-- 底部 -->
    <template #footer>
      <div class="flex justify-end">
        <el-button size="small" @click="handleClose">取消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Document, Close, Search, Loading } from '@element-plus/icons-vue'

// Props 定义
const props = defineProps({
  modelValue: Boolean
})

// Emits 定义
const emit = defineEmits(['update'])

// 双向绑定
const visible = computed({
  get() {
    return props.modelValue
  },
  set: (val) => emit('update:modelValue', val)
})

// 加载状态
const loading = ref(false)

// 搜索关键词
const searchKeyword = ref('')

// 类型筛选
const typeFilter = ref('全部')

// Mock 模板数据
const templates = ref([
  {
    id: 'TPL_001',
    code: 'TPL001',
    name: '生产计划通知模板',
    type: '生产公告',
    category: '生产计划',
    titleTemplate: '关于{申请人}的生产计划通知',
    contentTemplate: '{申请人}提交了一份关于...的生产计划，申请日期为{申请日期}',
    priority: '中',
    usageCount,
    status: '启用'
  },
  {
    id: 'TPL_002',
    code: 'TPL002',
    name: '行政通知模板',
    type: '行政公告',
    category: '行政通知',
    titleTemplate: '关于{申请人}的行政通知',
    contentTemplate: '{申请人}发布了一则行政通知，请各部门知悉。',
    priority: '低',
    usageCount,
    status: '启用'
  },
  {
    id: 'TPL_003',
    code: 'TPL003',
    name: '培训通知模板',
    type: '行政公告',
    category: '培训通知',
    titleTemplate: '培训通知 - {申请人}',
    contentTemplate: '兹定于{申请日期}进行培训，请相关人员准时参加。',
    priority: '中',
    usageCount,
    status: '启用'
  }
])

// 所有类型
const allTypes = computed(() => {
  const set = new Set()
  templates.value.forEach(t => {
    if (t.type) set.add(t.type)
  })
  return Array.from(set)
})

// 筛选后的模板
const filteredTemplates = computed(() => {
  return templates.value.filter(t => {
    const matchType = typeFilter.value === '全部' || t.type === typeFilter.value
    const matchSearch = !searchKeyword.value ||
      t.name.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      (t.type || '').toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      (t.category || '').toLowerCase().includes(searchKeyword.value.toLowerCase())
    return matchType && matchSearch
  })
})

// 关闭
const handleClose = () => {
  visible.value = false
}

// 选择模板
const handleSelect = (template) => {
  emit('select', template)
  handleClose()
}
</script>

<style scoped>
.template-select-modal :deep(.el-dialog__header) {
  padding: 16px 20px;
  margin-right: 0;
}
</style>
