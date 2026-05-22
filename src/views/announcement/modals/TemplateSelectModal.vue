<template>
  <!-- 公告模板选择弹窗 - V1.1样式（纯div自定义弹窗） -->
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] backdrop-blur-sm" @click="handleClose">
      <div
        class="bg-white rounded-xl w-full max-w-3xl shadow-2xl flex flex-col"
        style="max-height: 85vh;"
        @click.stop
      >
        <!-- 头部 — 蓝色渐变 -->
        <div class="px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-between flex-shrink-0" style="background: linear-gradient(to right, #3b82f6, #2563eb);">
          <h3 class="font-semibold flex items-center gap-2" style="color: white;">
            <el-icon style="color: white;"><Document /></el-icon>
            <span style="color: white;">从模板选择</span>
          </h3>
          <el-button link class="hover:bg-white/10" style="color: rgba(255,255,255,0.8);" @click="handleClose">
            <el-icon style="color: white;"><Close /></el-icon>
          </el-button>
        </div>

        <!-- 筛选栏 -->
        <div class="px-6 py-3 border-b border-gray-200 flex items-center gap-3 flex-shrink-0">
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
        <div class="flex-1 overflow-y-auto p-6">
          <!-- 加载状态 -->
          <div v-if="loading" class="flex items-center justify-center py-12">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
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
                  {{ template.type || template.category }}
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
        <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end flex-shrink-0">
          <el-button size="small" @click="handleClose">取消</el-button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Document, Close, Search } from '@element-plus/icons-vue'
import { useAnnouncementStore } from '@/stores/modules/announcement'

const props = defineProps({
  isOpen: Boolean
})

const emit = defineEmits(['close', 'select'])

// 公告store
const announcementStore = useAnnouncementStore()

// 加载状态
const loading = ref(false)

// 搜索关键词
const searchKeyword = ref('')

// 类型筛选
const typeFilter = ref('全部')

// 监听打开
watch(() => props.isOpen, (val) => {
  if (val) {
    loading.value = true
    announcementStore.fetchTemplates().finally(() => {
      loading.value = false
    })
  }
  searchKeyword.value = ''
  typeFilter.value = '全部'
})

// 从store获取模板数据
const templates = computed(() => announcementStore.templates || [])

// 所有类型
const allTypes = computed(() => {
  const set = new Set(['全部'])
  templates.value.forEach(t => {
    if (t.type) set.add(t.type)
    if (t.category) set.add(t.category)
  })
  return Array.from(set)
})

// 筛选后的模板
const filteredTemplates = computed(() => {
  return templates.value.filter(t => {
    const matchType = typeFilter.value === '全部' || t.type === typeFilter.value || t.category === typeFilter.value
    const matchSearch = !searchKeyword.value ||
      t.name.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      (t.type || '').toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      (t.category || '').toLowerCase().includes(searchKeyword.value.toLowerCase())
    return matchType && matchSearch
  })
})

// 关闭
const handleClose = () => {
  emit('close')
}

// 选择模板
const handleSelect = (template) => {
  emit('select', template)
  handleClose()
}
</script>

<style scoped>
/* V1.1样式保持 */
</style>
